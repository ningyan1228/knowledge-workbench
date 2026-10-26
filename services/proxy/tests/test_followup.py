import tempfile
import base64
import hashlib
import unittest
import uuid
from pathlib import Path
from unittest.mock import patch

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

from app.followup import FollowupStore, create_followup_router

OWNER = 'owner@example.org'
READER = 'reader@example.org'
MARKDOWN = '# 跟进台账｜2026年10月23日\n内部状态：待核实。'


class FollowupTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.store = FollowupStore(str(Path(self.temp.name) / 'data.sqlite3'), OWNER)
        self.app = FastAPI()
        self.app.include_router(create_followup_router('https://project.supabase.co', 'public-key', self.store))
        self.client = TestClient(self.app)
        self.user = {'id': str(uuid.uuid4()), 'email': OWNER, 'email_confirmed_at': '2026-10-23T00:00:00Z'}

        class AuthClient:
            def __init__(inner, *args, **kwargs): pass
            async def __aenter__(inner): return inner
            async def __aexit__(inner, *args): pass
            async def get(inner, *args, **kwargs):
                return httpx.Response(200, json=self.user)

        self.auth = patch('app.followup.httpx.AsyncClient', AuthClient)
        self.auth.start()
        self.headers = {'Authorization': 'Bearer test-only'}

    def tearDown(self):
        self.auth.stop()
        self.temp.cleanup()

    def publish(self, text=MARKDOWN, expected=None):
        return self.client.post('/follow-up/versions', headers=self.headers, json={
            'filename': 'ledger_2026-10-23.md', 'markdown': text, 'expected_current_id': expected,
        })

    def test_no_anonymous_or_uninvited_access_even_with_known_version_id(self):
        version_id = self.publish().json()['id']
        self.assertEqual(self.client.get('/follow-up/versions').status_code, 401)
        self.user['email'] = 'stranger@example.org'
        for path in ['/access', '/versions', '/versions/' + version_id, '/members']:
            self.assertEqual(self.client.get('/follow-up' + path, headers=self.headers).status_code, 403)
        self.user['email'] = OWNER
        self.user['email_confirmed_at'] = None
        self.assertEqual(self.client.get('/follow-up/versions', headers=self.headers).status_code, 403)

    def test_invited_reader_can_read_but_cannot_write_restore_or_invite_and_revocation_takes_effect(self):
        version_id = self.publish().json()['id']
        self.assertEqual(self.client.post('/follow-up/members', headers=self.headers, json={'email': READER}).status_code, 200)
        self.user['email'] = READER
        result = self.client.get('/follow-up/versions/' + version_id, headers=self.headers)
        self.assertEqual(result.json()['markdown'], MARKDOWN)
        self.assertEqual(result.headers['cache-control'], 'no-store')
        self.assertEqual(self.publish('changed', version_id).status_code, 403)
        self.assertEqual(self.client.post('/follow-up/versions/' + version_id + '/restore', headers=self.headers, json={'expected_current_id': version_id}).status_code, 403)
        self.assertEqual(self.client.post('/follow-up/members', headers=self.headers, json={'email': 'another@example.org'}).status_code, 403)
        self.assertEqual(self.client.get('/follow-up/members', headers=self.headers).status_code, 403)
        self.user['email'] = OWNER
        self.client.post('/follow-up/members/remove', headers=self.headers, json={'email': READER})
        self.user['email'] = READER
        self.assertEqual(self.client.get('/follow-up/versions/' + version_id, headers=self.headers).status_code, 403)

    def test_versions_are_immutable_conflicting_updates_do_not_overwrite_and_restore_is_new_version(self):
        first = self.publish().json()['id']
        second = self.publish(MARKDOWN + '\n新进度。', first).json()['id']
        self.assertEqual(self.publish(MARKDOWN + '\n过时修改。', first).status_code, 409)
        self.assertEqual(self.publish(MARKDOWN + '\n新进度。', second).status_code, 409)
        restored = self.client.post('/follow-up/versions/' + first + '/restore', headers=self.headers, json={'expected_current_id': second}).json()['id']
        self.assertNotIn(restored, [first, second])
        versions = self.client.get('/follow-up/versions', headers=self.headers).json()
        self.assertEqual(len(versions['versions']), 3)
        self.assertEqual(versions['current_id'], restored)
        self.assertNotIn('markdown', versions['versions'][0])
        self.assertEqual(self.store.read(first)['markdown'], MARKDOWN)
        self.assertEqual(self.store.read(restored)['restored_from'], first)
        # Reopening the store proves snapshots survive process/container recreation.
        reopened = FollowupStore(str(Path(self.temp.name) / 'data.sqlite3'), OWNER)
        self.assertEqual(reopened.versions()['current_id'], restored)

    def test_validation_never_writes_invalid_snapshots(self):
        for filename, text in [('../escape.md', MARKDOWN), ('ledger.html', MARKDOWN), ('ledger.md', '\x00'), ('ledger.md', '中文' * 180000)]:
            response = self.client.post('/follow-up/versions', headers=self.headers, json={'filename': filename, 'markdown': text, 'expected_current_id': None})
            self.assertEqual(response.status_code, 422)
        self.assertEqual(self.store.versions()['versions'], [])
        with self.assertRaises(HTTPException):
            FollowupStore(str(Path(self.temp.name) / 'unconfigured.sqlite3'), '').role(OWNER)

    def test_original_bytes_download_and_permissions(self):
        raw = ('\ufeff' + MARKDOWN.replace('\n', '\r\n') + '\r\n').encode('utf-8')
        response = self.client.post('/follow-up/versions', headers=self.headers, json={
            'filename': '原台账.md', 'markdown': raw.decode('utf-8'), 'source_base64': base64.b64encode(raw).decode(), 'expected_current_id': None})
        version_id = response.json()['id']
        path = '/follow-up/versions/' + version_id + '/download'
        result = self.client.get(path, headers=self.headers)
        self.assertEqual(result.content, raw)
        self.assertEqual(result.headers['x-content-sha256'], hashlib.sha256(raw).hexdigest())
        self.assertEqual(result.headers['cache-control'], 'no-store')
        self.assertEqual(self.client.get(path).status_code, 401)
        self.user['email'] = 'stranger@example.org'
        self.assertEqual(self.client.get(path, headers=self.headers).status_code, 403)

    def test_dataset_revisions_old_upload_and_failed_staging_keep_current(self):
        def ledger(version, content='待核'):
            return f'---\ndataset_id: test\ndataset_version: {version}\n---\n' + MARKDOWN + content
        one = self.publish(ledger('2026-10-25-r1')).json()['id']
        self.assertEqual(self.publish(ledger('2026-10-25-r1', '不同字节'), one).status_code, 409)
        response = self.client.post('/follow-up/versions', headers=self.headers, json={
            'filename': 'revision.md', 'markdown': ledger('2026-10-25-r1', '补证'), 'allow_revision': True, 'expected_current_id': one})
        two = response.json()['id']
        self.assertEqual(self.publish(ledger('2026-10-25-r1'), two).status_code, 409)
        old = self.publish(ledger('2026-10-23-r1'), two).json()['id']
        self.assertEqual(self.store.versions()['current_id'], two)
        self.assertIn('2026-10-23-r1', self.store.read(old)['markdown'])
        failed = self.client.post('/follow-up/versions', headers=self.headers, json={
            'filename': 'unparsed.md', 'markdown': '新原文待解析', 'activate': False, 'expected_current_id': two})
        self.assertEqual(failed.status_code, 200)
        self.assertEqual(self.store.versions()['current_id'], two)
        self.assertEqual(self.store.read(failed.json()['id'])['markdown'], '新原文待解析')


if __name__ == '__main__':
    unittest.main()
