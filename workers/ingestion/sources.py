"""Adapters for sources whose specific API endpoints are configured in `sources`.

The adapter never treats a source home page as a feed. It accepts only the endpoint
stored by the user after validation and returns citation metadata, not full paywalled text.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from html import unescape
from typing import Any
from urllib.parse import urlencode
from defusedxml import ElementTree
import re

import httpx


@dataclass
class Candidate:
    canonical_url: str
    title: str
    published_at: str | None
    published_text: str | None
    content_access: str
    content_text: str | None
    kind: str = 'paper'


def _iso(value: str | None) -> str | None:
    if not value:
        return None


def _abstract_from_index(index: dict[str, list[int]] | None) -> str | None:
    if not index:
        return None
    positions = {position: word for word, values in index.items() for position in values}
    return ' '.join(positions[position] for position in sorted(positions)) or None


def _clean_html(value: str | None) -> str | None:
    if not value:
        return None
    text = re.sub(r'<[^>]+>', ' ', unescape(value))
    return re.sub(r'\s+', ' ', text).strip() or None
    try:
        return date.fromisoformat(value[:10]).isoformat()
    except ValueError:
        return None


async def fetch_openalex(client: httpx.AsyncClient, endpoint: str) -> list[Candidate]:
    response = await client.get(endpoint, headers={'Accept': 'application/json'})
    response.raise_for_status()
    data = response.json()
    return [Candidate(
        canonical_url=item.get('doi') or item.get('id'), title=item.get('display_name') or 'Untitled work',
        published_at=_iso(item.get('publication_date')), published_text=item.get('publication_date') or (str(item['publication_year']) if item.get('publication_year') else None), content_access='public_page' if item.get('open_access', {}).get('is_oa') else 'summary_only',
        content_text=_abstract_from_index(item.get('abstract_inverted_index')),
    ) for item in data.get('results', []) if item.get('id')]


async def fetch_crossref(client: httpx.AsyncClient, endpoint: str) -> list[Candidate]:
    # Crossref's public pool is intentionally conservative; stay below one request per second.
    import asyncio
    await asyncio.sleep(1.1)
    response = await client.get(endpoint, headers={'Accept': 'application/json', 'User-Agent': 'NeonLionKnowledgeWorkbench/0.1 (personal research)'})
    response.raise_for_status()
    message = response.json().get('message', {})
    results: list[Candidate] = []
    for item in message.get('items', []):
        doi = item.get('DOI')
        if not doi:
            continue
        dates = item.get('published-print', item.get('published-online', item.get('published', item.get('issued', item.get('created', {}))))).get('date-parts', [[]])
        parts = dates[0] if dates else []
        published = '-'.join(f'{int(part):02d}' if index else str(part) for index, part in enumerate(parts[:3])) if parts else None
        results.append(Candidate(f'https://doi.org/{doi}', (item.get('title') or ['Untitled work'])[0], _iso(published), published, 'summary_only', _clean_html(item.get('abstract'))))
    return results


async def fetch_pubmed(client: httpx.AsyncClient, endpoint: str) -> list[Candidate]:
    """The endpoint is an ESearch JSON URL. ESummary is built only for returned IDs."""
    response = await client.get(endpoint, headers={'Accept': 'application/json'})
    response.raise_for_status()
    ids = response.json().get('esearchresult', {}).get('idlist', [])[:20]
    if not ids:
        return []
    summary_url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?' + urlencode({'db': 'pubmed', 'id': ','.join(ids), 'retmode': 'json'})
    response = await client.get(summary_url, headers={'Accept': 'application/json'})
    response.raise_for_status()
    records = response.json().get('result', {})
    fetch_url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?' + urlencode({'db': 'pubmed', 'id': ','.join(ids), 'retmode': 'xml'})
    response = await client.get(fetch_url, headers={'Accept': 'application/xml'})
    response.raise_for_status()
    root = ElementTree.fromstring(response.content)
    abstracts = {node.findtext('.//PMID'): ' '.join(element.text.strip() for element in node.findall('.//Abstract/AbstractText') if element.text and element.text.strip()) or None for node in root.findall('.//PubmedArticle')}
    return [Candidate(f'https://pubmed.ncbi.nlm.nih.gov/{item_id}/', record.get('title') or 'Untitled PubMed record', _iso(record.get('pubdate')), record.get('pubdate'), 'summary_only', abstracts.get(item_id))
            for item_id in ids if (record := records.get(item_id))]


async def fetch_semantic_scholar(client: httpx.AsyncClient, endpoint: str) -> list[Candidate]:
    response = await client.get(endpoint, headers={'Accept': 'application/json'})
    response.raise_for_status()
    results: list[Candidate] = []
    for item in response.json().get('data', []):
        url = item.get('url') or item.get('openAccessPdf', {}).get('url')
        if not url:
            continue
        year = str(item['year']) if item.get('year') else None
        results.append(Candidate(url, item.get('title') or 'Untitled work', _iso(year), year, 'summary_only', item.get('abstract')))
    return results


ADAPTERS = {'openalex': fetch_openalex, 'crossref': fetch_crossref, 'pubmed': fetch_pubmed, 'semantic_scholar': fetch_semantic_scholar}
