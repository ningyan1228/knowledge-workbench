import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { LeadList } from '../src/features/market/LeadList'
import { publicLeads } from '../src/lib/productMarketMap'
import { outreachCompanyKey } from '../src/lib/outreachLedger'
import type { LeadWork } from '../src/features/market/useLeadWork'
import type { OutreachLedger } from '../src/features/market/useOutreachLedger'

const leads = publicLeads.slice(0, 2)
const ledger = { status: 'login_required' } as OutreachLedger
const work = { status: 'login_required', records: {}, busy: false } as LeadWork
function render(overrides: Partial<Parameters<typeof LeadList>[0]> = {}) {
  return renderToStaticMarkup(createElement(LeadList, { leads, selectedLead: null, ledger, work, onHighlight: () => {}, onSelect: () => {}, onOpenDetail: () => {}, ...overrides }))
}

describe('compact customer comparison list', () => {
  it('compares every selected company in labeled columns and keeps full evidence available', () => {
    const html = render()
    for (const label of ['公司／客户类型', '国家／地区', '产品与应用', '核验／首次收录', '公开联系入口']) expect(html).toContain(label)
    expect(html.match(/class="customer-lead-row/g)).toHaveLength(2)
    for (const lead of leads) expect(html).toContain(`data-lead-id="${lead.id}"`)
    expect(html).toContain('采购与使用待确认')
    expect(html).toContain('客户详情')
    expect(html).toContain('aria-label="收藏客户"')
    expect(html).not.toContain('mailto:')
    expect(html).not.toContain('customer-card-evidence')
  })

  it('preserves private favorites and actual progress in the compact rows', () => {
    const privateWork = { ...work, status: 'ready', records: { [outreachCompanyKey(leads[0])]: { favorite: true, stage: 'replied', followUpOn: '2026-10-16' } } } as unknown as LeadWork
    const html = render({ work: privateWork, selectedLead: leads[0] })
    expect(html).toContain('aria-label="取消收藏" aria-pressed="true"')
    expect(html).toContain('customer-lead-row selected')
    expect(html).toContain('已回复')
    expect(html).toContain('2026-10-16')
  })
})
