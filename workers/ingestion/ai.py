"""Small OpenAI-compatible adapter. It is inactive until all three AI variables are configured."""
from __future__ import annotations

import httpx


async def summarize_chinese(client: httpx.AsyncClient, *, base_url: str, api_key: str, model: str, title: str, excerpt: str, source_url: str) -> str:
    prompt = f"""你是化工外贸学习助手。仅根据下方文章标题和原文摘要写 2-4 句中文摘要。
不得把论文、其他供应商或最终制品的结论写成我方产品性能；不得添加原文没有的认证、订单或数据。
需要说明内容仅为摘要还是全文。保持术语的英文原词。\n\n标题：{title}\n原文摘要（不是全文）：{excerpt[:12000]}\n原文链接：{source_url}"""
    response = await client.post(f'{base_url.rstrip("/")}/chat/completions', headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'}, json={
        'model': model, 'messages': [{'role': 'system', 'content': '输出简洁中文，不使用 Markdown 标题。'}, {'role': 'user', 'content': prompt}], 'temperature': 0.2,
    })
    response.raise_for_status()
    content = response.json()['choices'][0]['message']['content']
    if not isinstance(content, str) or not content.strip(): raise ValueError('EMPTY_AI_SUMMARY')
    return content.strip()
