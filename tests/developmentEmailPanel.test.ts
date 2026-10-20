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
  it('shows an email-research task instead of a copyable first contact for Aexcel', () => {
    const aexcel=publicLeads.find(item=>item.id==='aexcel-mentor')!
    const html=renderToStaticMarkup(createElement(DevelopmentEmailPanel,{lead:aexcel,ledger:{status:'ready',sends:[]} as unknown as OutreachLedger}))
    expect(html).toContain('待补邮箱 · 暂不生成开发信')
    expect(html).toContain('查看官网联系入口')
    expect(html).not.toContain('outreach-email-preview')
    expect(html).not.toContain('data-copy-part')
    expect(html).not.toContain('Your team formulates industrial protective coatings')
    expect(html).not.toContain('查看原 Prompt')
  })
  it('shows a concise draft for unrecorded sending and retains the old reference for sent or unreadable states', () => {
    const unsent = render('ready', [])
    const sent = render('ready', [send])
    const unknown = render('error', [])
    expect(unsent).toContain('简洁首封 · 未记录发送')
    expect(unsent).toContain('Would evaluating this material for your wood coatings be relevant to your team?')
    expect(unsent).toContain('当前采购需求与时机仍待确认')
    expect(unsent).not.toContain('If another colleague')
    expect(sent).toContain('原版参考 · 已记录发送')
    expect(sent).toContain('If another colleague')
    expect(unknown).toContain('发送状态未确认')
    expect(unknown).toMatch(/outreach-copy-button[^>]*disabled/)
    expect(unsent).not.toMatch(/outreach-copy-button[^>]*disabled/)
    for (const label of ['复制主题', '复制正文', '复制整封']) expect(unsent).toContain(label)
    expect(unknown.match(/outreach-copy-button[^>]*disabled/g)).toHaveLength(3)
    expect(sent).toContain('outreach-send-banner-sent')
    expect(sent).toContain('outreach-status-sent')
    expect(sent).toContain('已记录收件邮箱：fixture@example.org')
    expect(unsent).toContain('outreach-send-banner-unsent')
    expect(unsent).toContain('未发送（无记录）')
    expect(unknown).toContain('outreach-status-unknown')
    expect(unknown).not.toContain('outreach-status-unsent')
    if (process.env.CONCISE_EMAIL_PREVIEW === '1') {
      const folder = 'research/private/concise-email-20261014'
      mkdirSync(folder, { recursive: true })
      const css = readFileSync('src/styles.css', 'utf8')
      for (const [name, markup] of [['unsent', unsent], ['sent', sent], ['unknown', unknown]]) writeFileSync(`${folder}/${name}.html`, `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>开发信预览</title><style>${css}\nbody{margin:0;padding:20px;background:#f1f5f9}main{max-width:850px;margin:auto;background:#fff;padding:20px;border-radius:12px}@media(max-width:620px){body{padding:8px}main{padding:14px}}</style><main>${markup}</main></html>`)
    }
  })
})
