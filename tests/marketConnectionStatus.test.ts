import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MarketConnectionStatus } from '../src/features/market/MarketConnectionStatus'
import type { OutreachLedger } from '../src/features/market/useOutreachLedger'
import type { LeadWork } from '../src/features/market/useLeadWork'

const render = (shared: OutreachLedger['status'], personal: LeadWork['status']) => renderToStaticMarkup(createElement(MarketConnectionStatus, {
  ledger: { status: shared } as OutreachLedger, work: { status: personal } as LeadWork,
}))

describe('combined customer-record connection status', () => {
  it('uses one closed disclosure for both healthy connections', () => {
    const html = render('ready', 'ready')
    expect(html.match(/<summary>/g)).toHaveLength(1)
    expect(html).toContain('记录已连接')
    expect(html).toContain('共享发送记录 · 已连接')
    expect(html).toContain('私人客户记录 · 已连接')
    expect(html).not.toContain('<details open')
  })
  it.each(['error', 'loading', 'login_required', 'unconfigured'] as const)('never calls partially available records fully connected (%s)', (status) => {
    for (const html of [render(status, 'ready'), render('ready', status)]) {
      expect(html).not.toContain('记录已连接')
      expect(html).toContain('连接状态')
    }
  })
})
