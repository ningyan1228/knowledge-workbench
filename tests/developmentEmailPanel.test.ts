import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { DevelopmentEmailPanel } from '../src/features/market/DevelopmentEmailPanel'
import type { OutreachLedger } from '../src/features/market/useOutreachLedger'
import { publicLeads } from '../src/lib/productMarketMap'
import { outreachCompanyKey, type OutreachSend } from '../src/lib/outreachLedger'

const lead = publicLeads.find((item) => item.id === 'polyvine-cheddar')!
const send: OutreachSend = { id: 'fixture', company_key: outreachCompanyKey(lead), company_name: lead.company, lead_id: lead.id, product_id: lead.productId, recipient_email: 'fixture@example.org', sent_on: '2026-10-13', sent_by: null, created_at: '2026-10-13T01:00:00Z', voided_at: null }
const render = (status: OutreachLedger['status'], sends: OutreachSend[]) => renderToStaticMarkup(createElement(DevelopmentEmailPanel, { lead, ledger: { status, sends } as OutreachLedger }))
describe('email preview follows sending status', () => {
  it('shows a concise draft for unrecorded sending and retains the old reference for sent or unreadable states', () => {
    const unsent = render('ready', [])
    const sent = render('ready', [send])
    const unknown = render('error', [])
    expect(unsent).toContain('简洁首封 · 未记录发送')
    expect(unsent).toContain('Who handles raw-material evaluation or purchasing for your wood coatings?')
    expect(unsent).toContain('当前采购需求与时机仍待对方确认')
    expect(unsent).not.toContain('If another colleague')
    expect(sent).toContain('原版参考 · 已记录发送')
    expect(sent).toContain('If another colleague')
    expect(unknown).toContain('发送状态未确认')
    expect(unknown).toMatch(/outreach-copy-button[^>]*disabled/)
    expect(unsent).not.toMatch(/outreach-copy-button[^>]*disabled/)
    if (process.env.CONCISE_EMAIL_PREVIEW === '1') {
      const folder = 'research/private/concise-email-20261014'
      mkdirSync(folder, { recursive: true })
      const css = readFileSync('src/styles.css', 'utf8')
      for (const [name, markup] of [['unsent', unsent], ['sent', sent], ['unknown', unknown]]) writeFileSync(`${folder}/${name}.html`, `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>开发信预览</title><style>${css}\nbody{margin:0;padding:20px;background:#f1f5f9}main{max-width:850px;margin:auto;background:#fff;padding:20px;border-radius:12px}@media(max-width:620px){body{padding:8px}main{padding:14px}}</style><main>${markup}</main></html>`)
    }
  })
})
