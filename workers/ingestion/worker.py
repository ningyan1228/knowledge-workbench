from __future__ import annotations

import asyncio
import hashlib
import io
import ipaddress
import json
import logging
import socket
import sys
import time
from datetime import UTC, datetime, timedelta
from typing import Any
from urllib.parse import urljoin, urlparse
import re

import httpx
from docx import Document
from pydantic_settings import BaseSettings, SettingsConfigDict
from pypdf import PdfReader

from sources import ADAPTERS, Candidate
from ai import summarize_chinese

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger('ingestion')


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')
    supabase_url: str
    supabase_service_role_key: str
    app_timezone: str = 'Asia/Shanghai'
    ncbi_api_key: str = ''
    ncbi_email: str = ''
    ai_base_url: str = ''
    ai_api_key: str = ''
    ai_model: str = ''


class Worker:
    def __init__(self, config: Settings):
        self.config = config
        self.base = config.supabase_url.rstrip('/')
        self.headers = {'apikey': config.supabase_service_role_key, 'Authorization': f'Bearer {config.supabase_service_role_key}', 'Content-Type': 'application/json'}
        self.http = httpx.AsyncClient(timeout=httpx.Timeout(20, connect=8), follow_redirects=False)

    async def close(self):
        await self.http.aclose()

    async def rest(self, method: str, table: str, *, params: dict[str, str] | None = None, body: Any = None, prefer: str | None = None) -> Any:
        headers = self.headers | ({'Prefer': prefer} if prefer else {})
        response = await self.http.request(method, f'{self.base}/rest/v1/{table}', headers=headers, params=params, json=body)
        response.raise_for_status()
        return response.json() if response.content else None

    async def rpc(self, name: str, body: dict[str, Any]) -> Any:
        response = await self.http.post(f'{self.base}/rest/v1/rpc/{name}', headers=self.headers, json=body)
        response.raise_for_status()
        return response.json()

    async def run(self):
        jobs = await self.rpc('lease_jobs', {'p_limit': 3, 'p_lease_seconds': 300})
        if not jobs:
            logger.info('No eligible jobs.')
            return
        for job in jobs:
            try:
                await self.process(job)
                await self.finish(job['id'], 'succeeded')
            except Exception as exc:  # log only a safe code; no document/article body is logged
                logger.exception('Job failed id=%s type=%s', job['id'], job['type'])
                await self.fail(job, self.safe_code(exc))

    async def process(self, job: dict[str, Any]):
        handlers = {'parse_document': self.parse_document, 'validate_source': self.validate_source, 'daily_ingestion': self.daily_ingestion, 'import_article': self.import_article}
        handler = handlers.get(job['type'])
        if not handler:
            raise ValueError('UNKNOWN_JOB_TYPE')
        await handler(job)

    async def finish(self, job_id: str, status: str):
        await self.rest('PATCH', 'jobs', params={'id': f'eq.{job_id}'}, body={'status': status, 'lease_until': None}, prefer='return=minimal')

    async def fail(self, job: dict[str, Any], code: str):
        attempts = int(job['attempts'])
        if attempts < 3 and code not in {'SOURCE_BLOCKED', 'PARSE_UNSUPPORTED', 'FORBIDDEN'}:
            delay = 2 ** attempts * 60
            body = {'status': 'retry_wait', 'lease_until': None, 'next_retry_at': (datetime.now(UTC) + timedelta(seconds=delay)).isoformat(), 'error_code': code}
        else:
            body = {'status': 'failed', 'lease_until': None, 'error_code': code}
        await self.rest('PATCH', 'jobs', params={'id': f"eq.{job['id']}"}, body=body, prefer='return=minimal')

    @staticmethod
    def safe_code(error: Exception) -> str:
        if isinstance(error, httpx.TimeoutException): return 'SOURCE_TIMEOUT'
        if isinstance(error, httpx.HTTPStatusError):
            return 'SOURCE_BLOCKED' if error.response.status_code in {401, 403, 451} else f'HTTP_{error.response.status_code}'
        if isinstance(error, (ValueError, KeyError)): return 'PARSE_FAILED'
        return 'WORKER_FAILED'

    async def parse_document(self, job: dict[str, Any]):
        document_id = job['payload']['document_id']
        rows = await self.rest('GET', 'documents', params={'id': f'eq.{document_id}', 'owner_id': f"eq.{job['owner_id']}", 'select': 'id,storage_path,mime_type'})
        if not rows: raise PermissionError('FORBIDDEN')
        document = rows[0]
        content = await self.download_private(document['storage_path'])
        chunks, page_count = self.extract(document['mime_type'], content)
        await self.rest('DELETE', 'document_chunks', params={'document_id': f'eq.{document_id}'}, prefer='return=minimal')
        if chunks:
            await self.rest('POST', 'document_chunks', body=[{'owner_id': job['owner_id'], 'document_id': document_id, 'page_number': page, 'section_path': section, 'row_locator': locator, 'content': text} for page, section, locator, text in chunks], prefer='return=minimal')
            await self.extract_product_specs(job['owner_id'], document_id, chunks)
        await self.rest('PATCH', 'documents', params={'id': f'eq.{document_id}'}, body={'parser_status': 'parsed' if chunks else 'needs_ocr', 'page_count': page_count, 'parsed_at': datetime.now(UTC).isoformat()}, prefer='return=minimal')

    async def extract_product_specs(self, owner_id: str, document_id: str, chunks: list[tuple[int | None, str | None, str | None, str]]):
        """Keep source text intact; this deliberately extracts candidates, not verified values."""
        versions = await self.rest('GET', 'product_versions', params={'document_id': f'eq.{document_id}', 'owner_id': f'eq.{owner_id}', 'select': 'id,product_id'})
        if not versions:
            return
        patterns = [
            ('solid content', r'\bsolid\s*content\b|\bnon[- ]?volatile\b|固含量'), ('pH', r'\bp\s*h\b'),
            ('viscosity', r'\bviscosity\b|黏度|粘度'), ('acid value', r'\bacid\s*value\b|酸值'),
            ('epoxy value', r'\bepoxy\s*value\b|环氧值'), ('iodine value', r'\biodine\s*value\b|碘值'),
            ('moisture', r'\bmoisture\b|\bwater\s*content\b|水分'), ('hydroxyl value', r'\bhydroxyl\b|羟值'),
            ('appearance', r'\bappearance\b|外观'), ('specific gravity', r'\bspecific\s*gravity\b|比重'),
            ('flash point', r'\bflash\s*point\b|闪点'), ('shelf life', r'\bshelf\s*life\b|保质期'), ('packaging', r'\bpackaging\b|包装'),
        ]
        candidates: list[dict[str, Any]] = []
        seen: set[tuple[str, str, str | None]] = set()
        for page, section, locator, content in chunks:
            for line_number, raw_line in enumerate(content.splitlines(), start=1):
                line = re.sub(r'\s+', ' ', raw_line).strip()
                if len(line) < 3 or len(line) > 800:
                    continue
                for label, pattern in patterns:
                    if not re.search(pattern, line, flags=re.IGNORECASE):
                        continue
                    key = (label, line, locator)
                    if key in seen:
                        continue
                    seen.add(key)
                    candidates.append({'name': label, 'original_value': line, 'source_locator': f'{locator or "text"}:line:{line_number}', 'source_excerpt': line, 'conditions': section})
                    break
        for version in versions:
            await self.rest('DELETE', 'product_specs', params={'version_id': f"eq.{version['id']}", 'review_status': 'eq.extracted'}, prefer='return=minimal')
            if candidates:
                await self.rest('POST', 'product_specs', body=[{'owner_id': owner_id, 'version_id': version['id'], **candidate, 'review_status': 'extracted'} for candidate in candidates], prefer='return=minimal')
            existing_tasks = await self.rest('GET', 'review_tasks', params={'version_id': f"eq.{version['id']}", 'related_type': 'eq.document_parse', 'related_id': f'eq.{document_id}', 'select': 'id'})
            if not existing_tasks:
                await self.rest('POST', 'review_tasks', body={'owner_id': owner_id, 'product_id': version['product_id'], 'version_id': version['id'], 'related_type': 'document_parse', 'related_id': document_id, 'question': f'请核对文档 {document_id} 自动提取的参数、单位、测试条件和原文位置；提取结果不等于已确认性能。', 'status': 'open'}, prefer='return=minimal')

    async def download_private(self, storage_path: str) -> bytes:
        response = await self.http.get(f'{self.base}/storage/v1/object/private-documents/{storage_path}', headers=self.headers)
        response.raise_for_status()
        if len(response.content) > 20 * 1024 * 1024: raise ValueError('PARSE_TOO_LARGE')
        return response.content

    @staticmethod
    def extract(mime: str, content: bytes) -> tuple[list[tuple[int | None, str | None, str | None, str]], int | None]:
        chunks: list[tuple[int | None, str | None, str | None, str]] = []
        if mime == 'application/pdf':
            reader = PdfReader(io.BytesIO(content))
            for index, page in enumerate(reader.pages, start=1):
                text = (page.extract_text() or '').strip()
                if text: chunks.append((index, None, None, text[:60_000]))
            return chunks, len(reader.pages)
        if mime == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            doc = Document(io.BytesIO(content)); heading = None
            for index, paragraph in enumerate(doc.paragraphs, start=1):
                text = paragraph.text.strip()
                if not text: continue
                if paragraph.style and paragraph.style.name.startswith('Heading'): heading = text
                chunks.append((None, heading, f'paragraph:{index}', text))
            for table_index, table in enumerate(doc.tables, start=1):
                for row_index, row in enumerate(table.rows, start=1):
                    text = ' | '.join(cell.text.strip() for cell in row.cells if cell.text.strip())
                    if text: chunks.append((None, heading, f'table:{table_index}:row:{row_index}', text))
            return chunks, None
        raise ValueError('PARSE_UNSUPPORTED')

    async def validate_source(self, job: dict[str, Any]):
        source_id = job['payload']['source_id']
        rows = await self.rest('GET', 'sources', params={'id': f'eq.{source_id}', 'owner_id': f"eq.{job['owner_id']}", 'select': 'id,adapter,endpoint_url'})
        if not rows: raise PermissionError('FORBIDDEN')
        source = rows[0]
        await self.fetch_candidates(source['adapter'], source['endpoint_url'], 1)
        await self.rest('PATCH', 'sources', params={'id': f'eq.{source_id}'}, body={'verification_status': 'verified', 'last_verified_at': datetime.now(UTC).isoformat(), 'consecutive_failures': 0, 'failure_reason': None}, prefer='return=minimal')

    async def daily_ingestion(self, job: dict[str, Any]):
        sources = await self.rest('GET', 'sources', params={'owner_id': f"eq.{job['owner_id']}", 'enabled': 'is.true', 'verification_status': 'eq.verified', 'select': 'id,adapter,endpoint_url'})
        success = failure = 0
        for source in sources[:20]:
            try:
                for candidate in await self.fetch_candidates(source['adapter'], source['endpoint_url'], 100):
                    await self.save_candidate(job['owner_id'], source['id'], candidate)
                await self.rest('PATCH', 'sources', params={'id': f"eq.{source['id']}"}, body={'last_success_at': datetime.now(UTC).isoformat(), 'consecutive_failures': 0, 'failure_reason': None}, prefer='return=minimal')
                success += 1
            except Exception as exc:
                failure += 1
                await self.rest('PATCH', 'sources', params={'id': f"eq.{source['id']}"}, body={'consecutive_failures': 1, 'failure_reason': self.safe_code(exc)}, prefer='return=minimal')
        scheduled = job['payload'].get('scheduled_for') or datetime.now(UTC).date().isoformat()
        await self.rest('POST', 'ingestion_runs', body={'owner_id': job['owner_id'], 'scheduled_for': scheduled, 'started_at': datetime.now(UTC).isoformat(), 'finished_at': datetime.now(UTC).isoformat(), 'success_count': success, 'failure_count': failure, 'status': 'succeeded'}, prefer='resolution=merge-duplicates,return=minimal')

    async def fetch_candidates(self, adapter: str, endpoint: str, limit: int) -> list[Candidate]:
        if adapter not in ADAPTERS: raise ValueError('UNKNOWN_ADAPTER')
        await self.assert_safe_url(endpoint)
        candidates = await ADAPTERS[adapter](self.http, endpoint)
        return candidates[:limit]

    async def save_candidate(self, owner_id: str, source_id: str | None, candidate: Candidate):
        canonical = self.normalize_url(candidate.canonical_url)
        rows = await self.rest('POST', 'articles', body={'owner_id': owner_id, 'source_id': source_id, 'canonical_url': canonical, 'title': candidate.title[:1000], 'source_published_at': candidate.published_at, 'source_published_text': candidate.published_text, 'content_hash': hashlib.sha256((candidate.title + canonical + (candidate.content_text or '')).encode()).hexdigest(), 'content_access': candidate.content_access, 'content_text': candidate.content_text, 'kind': candidate.kind}, prefer='resolution=merge-duplicates,return=representation')
        if not rows or not candidate.content_text or not (self.config.ai_base_url and self.config.ai_api_key and self.config.ai_model):
            return
        summary = await summarize_chinese(self.http, base_url=self.config.ai_base_url, api_key=self.config.ai_api_key, model=self.config.ai_model, title=candidate.title, excerpt=candidate.content_text, source_url=canonical)
        article = rows[0]
        await self.rest('POST', 'article_summaries', body={'owner_id': owner_id, 'article_id': article['id'], 'content_hash': article['content_hash'], 'processing_version': f'{self.config.ai_model}:zh-summary:v1', 'model_name': self.config.ai_model, 'summary_zh': summary, 'business_meaning': '仅供内部学习；请回到原文摘要或全文核对，不得视为自有产品性能。', 'citations': [{'url': canonical, 'locator': 'source abstract', 'access': candidate.content_access}], 'review_status': 'extracted'}, prefer='resolution=merge-duplicates,return=minimal')

    async def import_article(self, job: dict[str, Any]):
        # A user URL is only fetched after every redirect target has been checked for SSRF.
        url = job['payload']['url']; await self.assert_safe_url(url)
        response = await self.safe_get(url); response.raise_for_status()
        if len(response.content) > 2 * 1024 * 1024: raise ValueError('SOURCE_TOO_LARGE')
        title = response.url.host
        await self.save_candidate(job['owner_id'], None, Candidate(self.normalize_url(str(response.url)), title, None, None, 'public_page', None, 'user_provided'))

    async def safe_get(self, url: str) -> httpx.Response:
        for _ in range(5):
            await self.assert_safe_url(url)
            response = await self.http.get(url, headers={'User-Agent': 'NeonLionKnowledgeWorkbench/0.1'}, follow_redirects=False)
            if response.is_redirect:
                location = response.headers.get('location')
                if not location: raise ValueError('SOURCE_BLOCKED')
                url = urljoin(url, location); continue
            return response
        raise ValueError('SOURCE_BLOCKED')

    @staticmethod
    def normalize_url(url: str) -> str:
        parsed = urlparse(url)
        return parsed._replace(fragment='', query=parsed.query).geturl()

    @staticmethod
    async def assert_safe_url(url: str):
        parsed = urlparse(url)
        if parsed.scheme not in {'http', 'https'} or not parsed.hostname or parsed.username or parsed.password:
            raise ValueError('SOURCE_BLOCKED')
        try:
            addresses = await asyncio.get_running_loop().run_in_executor(None, lambda: socket.getaddrinfo(parsed.hostname, None, type=socket.SOCK_STREAM))
        except socket.gaierror as exc:
            raise ValueError('SOURCE_BLOCKED') from exc
        for _, _, _, _, sockaddr in addresses:
            ip = ipaddress.ip_address(sockaddr[0])
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast or ip.is_unspecified:
                raise ValueError('SOURCE_BLOCKED')


async def main():
    worker = Worker(Settings())
    try: await worker.run()
    finally: await worker.close()


if __name__ == '__main__': asyncio.run(main())
