import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { CompanyDetail } from '../src/features/market/CompanyDetail'
import { publicLeads } from '../src/lib/productMarketMap'
import type { OutreachLedger } from '../src/features/market/useOutreachLedger'
import type { LeadWork } from '../src/features/market/useLeadWork'

const lead = publicLeads.find((item) => item.id === 'colorificio-feroni-oppeano')!
const ledger = { status: 'ready', sends: [], activeSend: () => null } as unknown as OutreachLedger
const work = { status: 'ready', ownerId: 'fixture', records: {}, lists: [], busy: false } as unknown as LeadWork
const render = (status: OutreachLedger['status'] = 'ready') => renderToStaticMarkup(createElement(CompanyDetail, { lead, ledger: { ...ledger, status }, work, leads: [lead], onClose: () => {}, onNavigate: () => {} }))
const escaped = (text: string) => renderToStaticMarkup(createElement('span', null, text)).slice(6, -7)

describe('customer detail sections preserve research and actions', () => {
  it('starts with overview and contact details while keeping all three panels mounted', () => {
    const html = render()
    expect(html.match(/role="tab"/g)).toHaveLength(3)
    expect(html).toMatch(/id="company-tab-overview"[^>]*aria-selected="true"/)
    expect(html).toMatch(/id="company-panel-outreach"[^>]*hidden/)
    expect(html).toMatch(/id="company-panel-evidence"[^>]*hidden/)
    expect(html).toContain('mailto:info@feroni.it')
    expect(html).toContain(escaped(lead.profile.address!))
  })
  it('retains the exact audit, demand-side reason, source evidence, and their dates', () => {
    const html = render()
    for (const text of [lead.companyEvidence.statement, lead.companyEvidence.sourceName, lead.demandSideReason, lead.supplierCompetitorCheck!.conclusion, lead.supplierCompetitorCheck!.checkedAt]) expect(html).toContain(escaped(text))
    for (const source of lead.profile.sources) expect(html).toContain(escaped(source.url))
    for (const evidence of [lead.profile.generalEmailEvidence, lead.profile.generalPhoneEvidence]) {
      for (const source of evidence?.sources ?? []) {
        expect(html).toContain(escaped(source.url))
        if (source.summary) expect(html).toContain(escaped(source.summary))
      }
    }
    for (const label of ['公司关联与去重', '同行排除结论', '查看开发优先级依据与分值', '为什么被找到', '信息来源']) expect(html).toContain(label)
  })
  it('retains sending, draft copying, private follow-up, and next-step controls', () => {
    const html = render()
    for (const label of ['复制主题', '复制正文', '复制整封', '实际收件邮箱', '实际发送日期', '确认已发送', '开发备注', '下次跟进日期', '保存私人进度', '找采购 / 供应链负责人', '找技术 / 研发 / 生产负责人']) expect(html).toContain(label)
    expect(html).toContain('完整邮箱、联系人及其来源见“概览与联系”页签。')
  })
  it('does not treat an unreadable sending ledger as unsent', () => {
    expect(render('error')).toContain('发送状态未确认')
    expect(render('error').match(/outreach-copy-button[^>]*disabled/g)).toHaveLength(3)
  })
})
