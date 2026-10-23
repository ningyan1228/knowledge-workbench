"""Private team follow-up snapshots. No customer content belongs in the static site."""
from __future__ import annotations

import hashlib
import os
import re
import sqlite3
import uuid
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

import httpx
from fastapi import APIRouter, Depends, Header, HTTPException, Response
from pydantic import BaseModel, Field

MAX_MARKDOWN_BYTES = 524_288


class SnapshotInput(BaseModel):
    filename: str = Field(min_length=1, max_length=200)
    markdown: str = Field(min_length=1, max_length=MAX_MARKDOWN_BYTES)
    expected_current_id: str | None


class RestoreInput(BaseModel):
    expected_current_id: str | None


class MemberInput(BaseModel):
    email: str = Field(min_length=3, max_length=254)


def clean_email(value: str) -> str:
    email = value.strip().lower()
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
        raise HTTPException(422, '请输入同事实际用于登录网站的邮箱。')
    return email


def snapshot_metadata(filename: str, markdown: str) -> dict:
    if '/' in filename or '\\' in filename or not filename.lower().endswith(('.md', '.markdown')):
        raise HTTPException(422, '请选择 Markdown 文件，文件名不能包含路径。')
    if len(markdown.encode('utf-8')) > MAX_MARKDOWN_BYTES or '\x00' in markdown:
        raise HTTPException(422, '台账须为 UTF-8 文本，大小不超过 512 KB。')
    if not markdown.strip() or '\ufffd' in markdown:
        raise HTTPException(422, '文件为空或编码无法识别，请另存为 UTF-8 后重试。')
    title = next((line.lstrip('# ').strip() for line in markdown.splitlines() if line.startswith('# ')), filename)
    match = re.search(r'(20\d{2})\s*(?:年|[-_])\s*(\d{1,2})\s*(?:月|[-_])\s*(\d{1,2})', title + ' ' + filename)
    source_date = None
    if match:
        try:
            source_date = datetime(*(int(x) for x in match.groups())).date().isoformat()
        except ValueError:
            pass
    return {'filename': filename, 'title': title[:300], 'source_date': source_date,
            'content_hash': hashlib.sha256(markdown.encode('utf-8')).hexdigest()}


class FollowupStore:
    def __init__(self, path: str, owner_email: str):
        self.path = Path(path)
        self.owner_email = owner_email.strip().lower()

    @contextmanager
    def connection(self):
        self.path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
        db = sqlite3.connect(self.path, timeout=15)
        db.row_factory = sqlite3.Row
        try:
            db.executescript('''
                CREATE TABLE IF NOT EXISTS followup_versions (
                    id TEXT PRIMARY KEY, filename TEXT NOT NULL, title TEXT NOT NULL,
                    source_date TEXT, markdown TEXT NOT NULL, content_hash TEXT NOT NULL,
                    created_at TEXT NOT NULL, created_by TEXT NOT NULL, restored_from TEXT
                );
                CREATE TABLE IF NOT EXISTS followup_state (id INTEGER PRIMARY KEY CHECK(id=1), current_id TEXT);
                INSERT OR IGNORE INTO followup_state(id,current_id) VALUES(1,NULL);
                CREATE TABLE IF NOT EXISTS followup_members (
                    email TEXT PRIMARY KEY, invited_at TEXT NOT NULL, invited_by TEXT NOT NULL
                );
            ''')
            with db:
                yield db
        finally:
            db.close()

    def role(self, email: str) -> str | None:
        if not self.owner_email:
            raise HTTPException(503, '客户跟进尚未配置负责人，请联系管理员。')
        if email == self.owner_email:
            return 'owner'
        with self.connection() as db:
            return 'reader' if db.execute('SELECT 1 FROM followup_members WHERE email=?', (email,)).fetchone() else None

    def versions(self) -> dict:
        with self.connection() as db:
            return {'current_id': db.execute('SELECT current_id FROM followup_state WHERE id=1').fetchone()[0],
                    'versions': [dict(row) for row in db.execute('''SELECT id,filename,title,source_date,
                        content_hash,created_at,created_by,restored_from FROM followup_versions ORDER BY rowid DESC''')]}

    def read(self, version_id: str) -> dict:
        with self.connection() as db:
            row = db.execute('SELECT * FROM followup_versions WHERE id=?', (version_id,)).fetchone()
            if not row:
                raise HTTPException(404, '该版本不存在，请刷新版本列表。')
            return dict(row)

    def publish(self, filename: str, markdown: str, actor: str, expected: str | None, restored_from: str | None = None) -> str:
        meta = snapshot_metadata(filename, markdown)
        with self.connection() as db:
            db.execute('BEGIN IMMEDIATE')
            current = db.execute('SELECT current_id FROM followup_state WHERE id=1').fetchone()[0]
            if current != expected:
                raise HTTPException(409, '台账刚有新版本，请刷新并重新核对后再更新。')
            if current:
                prior = db.execute('SELECT content_hash FROM followup_versions WHERE id=?', (current,)).fetchone()
                if prior and prior[0] == meta['content_hash']:
                    raise HTTPException(409, '这份内容已经是当前版本，无需重复上传。')
            version_id = str(uuid.uuid4())
            db.execute('INSERT INTO followup_versions VALUES(?,?,?,?,?,?,?,?,?)', (
                version_id, filename, meta['title'], meta['source_date'], markdown, meta['content_hash'],
                datetime.now(timezone.utc).isoformat(), actor, restored_from,
            ))
            db.execute('UPDATE followup_state SET current_id=? WHERE id=1', (version_id,))
            return version_id


def create_followup_router(supabase_url: str, publishable_key: str, store: FollowupStore | None = None) -> APIRouter:
    router = APIRouter(prefix='/follow-up', tags=['private-follow-up'])
    store = store or FollowupStore(os.environ.get('FOLLOWUP_DB_PATH', '/data/followup.sqlite3'), os.environ.get('FOLLOWUP_OWNER_EMAIL', ''))

    async def member(response: Response, authorization: str | None = Header(default=None)) -> dict:
        response.headers['Cache-Control'] = 'no-store'
        if not authorization or not authorization.startswith('Bearer '):
            raise HTTPException(401, '请先登录网站，再查看客户跟进。')
        if not supabase_url or not publishable_key:
            raise HTTPException(503, '登录服务尚未配置。')
        try:
            async with httpx.AsyncClient(timeout=12) as client:
                result = await client.get(supabase_url.rstrip('/') + '/auth/v1/user', headers={
                    'apikey': publishable_key, 'Authorization': authorization,
                })
        except httpx.HTTPError:
            raise HTTPException(503, '暂时无法核对登录身份，请稍后重试。')
        if result.status_code in (401, 403):
            raise HTTPException(401, '登录已失效，请重新登录。')
        if result.is_error:
            raise HTTPException(503, '登录服务暂时不可用，请稍后重试。')
        try:
            user = result.json()
            uuid.UUID(user['id'])
            email = str(user.get('email', '')).strip().lower()
            confirmed = user.get('email_confirmed_at')
        except (ValueError, KeyError, TypeError):
            raise HTTPException(401, '无法核对登录身份，请重新登录。')
        if not email or not confirmed or user.get('is_anonymous'):
            raise HTTPException(403, '请使用已验证邮箱的团队账号登录。')
        role = store.role(email)
        if not role:
            raise HTTPException(403, '当前账号未获授权。请让负责人将你的登录邮箱加入共享成员。')
        return {'email': email, 'role': role}

    async def owner(user: dict = Depends(member)) -> dict:
        if user['role'] != 'owner':
            raise HTTPException(403, '仅负责人可以更新台账或管理共享成员。')
        return user

    @router.get('/access')
    def access(user: dict = Depends(member)):
        return user

    @router.get('/versions')
    def versions(_user: dict = Depends(member)):
        return store.versions()

    @router.get('/versions/{version_id}')
    def read(version_id: uuid.UUID, _user: dict = Depends(member)):
        return store.read(str(version_id))

    @router.post('/versions')
    def publish(body: SnapshotInput, user: dict = Depends(owner)):
        return {'id': store.publish(body.filename, body.markdown, user['email'], body.expected_current_id)}

    @router.post('/versions/{version_id}/restore')
    def restore(version_id: uuid.UUID, body: RestoreInput, user: dict = Depends(owner)):
        source = store.read(str(version_id))
        return {'id': store.publish(source['filename'], source['markdown'], user['email'], body.expected_current_id, str(version_id))}

    @router.get('/members')
    def members(_user: dict = Depends(owner)):
        with store.connection() as db:
            return {'owner': store.owner_email, 'members': [dict(row) for row in db.execute(
                'SELECT email,invited_at FROM followup_members ORDER BY invited_at')]}

    @router.post('/members')
    def invite(body: MemberInput, user: dict = Depends(owner)):
        email = clean_email(body.email)
        if email == store.owner_email:
            raise HTTPException(422, '负责人已经拥有访问权限。')
        with store.connection() as db:
            db.execute('INSERT OR IGNORE INTO followup_members VALUES(?,?,?)', (email, datetime.now(timezone.utc).isoformat(), user['email']))
        return {'ok': True}

    @router.post('/members/remove')
    def remove(body: MemberInput, _user: dict = Depends(owner)):
        with store.connection() as db:
            db.execute('DELETE FROM followup_members WHERE email=?', (clean_email(body.email),))
        return {'ok': True}

    return router
