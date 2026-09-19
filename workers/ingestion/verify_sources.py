"""Read-only smoke check for adapter metadata extraction; does not write Supabase."""
from __future__ import annotations

import asyncio

import httpx

from sources import fetch_crossref, fetch_openalex


async def main() -> None:
    cases = [
        ('OpenAlex', fetch_openalex, 'https://api.openalex.org/works?search=controlled%20release%20fertilizer%20coating&per-page=1'),
        ('Crossref', fetch_crossref, 'https://api.crossref.org/works?query=epoxidized%20linseed%20oil&rows=1'),
        ('Crossref PP waterborne coating', fetch_crossref, 'https://api.crossref.org/works?query=waterborne%20coating%20polypropylene&rows=1'),
    ]
    async with httpx.AsyncClient(timeout=25) as client:
        for name, fetcher, endpoint in cases:
            results = await fetcher(client, endpoint)
            if not results:
                raise RuntimeError(f'{name}: no results')
            item = results[0]
            print(f'{name}\ttitle={item.title}\tdate={item.published_text or item.published_at or "date unknown"}\texcerpt_chars={len(item.content_text or "")}\turl={item.canonical_url}')


if __name__ == '__main__':
    asyncio.run(main())
