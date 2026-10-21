import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { LeadCard } from '../src/features/market/LeadCard'
import { publicLeads } from '../src/lib/productMarketMap'
import { outreachCompanyKey } from '../src/lib/outreachLedger'
import { emptyWorkRecord } from '../src/lib/leadWorkbench'
import type { LeadWork } from '../src/features/market/useLeadWork'
import type { OutreachLedger } from '../src/features/market/useOutreachLedger'

const lead = publicLeads.find((item) => item.profile.contactPage)!
const work = { status: 'login_required', records: {}, busy: false } as LeadWork
const ledger = { status: 'login_required' } as OutreachLedger
const render = (overrides: Partial<Parameters<typeof LeadCard>[0]> = {}) => renderToStaticMarkup(createElement(LeadCard, {
  lead, work, ledger, onHighlight: () => {}, onSelect: () => {}, onOpenDetail: () => {}, ...overrides,
}))

describe('evidence-first customer cards', () => {
  it('shows the published business evidence and dates without repeating default status or scores', () => {
    const markup = render()
    expect(markup).toContain('联系理由')
    expect(markup).toContain('评估材料')
    expect(markup).toContain('联系渠道')
    expect(markup).toContain('适配待评估 · 采购未确认')
    expect(markup).toContain('最近核验：')
    expect(markup).toContain('首次收录：')
    expect(markup).toContain('客户详情')
    expect(markup).toContain('查看联系渠道')
    expect(markup).toContain('aria-label="收藏客户"')
    expect(markup).not.toContain('可开发候选')
    expect(markup).not.toContain('未记录发送')
    expect(markup).not.toContain('100 分')
    expect(markup).not.toContain('待开发')
    expect(markup).toContain('公开联系渠道')
    expect(markup).toContain('outreach-status-unknown')
    expect(markup).not.toContain('outreach-status-unsent')
  })

  it('keeps a real sending milestone visible even before private work records connect', () => {
    const sendingLedger = { status: 'ready', sends: [{ company_key: outreachCompanyKey(lead), voided_at: null }], activeSend: () => ({ sent_on: '2026-10-15' }) } as unknown as OutreachLedger
    expect(render({ ledger: sendingLedger })).toContain('发送日期：')
    expect(render({ ledger: sendingLedger })).toContain('outreach-status-sent')
    expect(render({ ledger: sendingLedger, variant: 'row' })).toContain('outreach-status-sent')
    for (const variant of ['card', 'row'] as const) {
      const markup = render({ ledger: sendingLedger, variant })
      expect(markup).not.toContain('已发送开发信')
      expect(markup).toContain('dateTime="2026-10-15"')
      const record = { ...emptyWorkRecord(outreachCompanyKey(lead)), stage: 'waiting' as const, followUpOn: '2026-10-23' }
      const followup = render({ ledger: sendingLedger, variant, work: { ...work, status: 'ready', records: { [record.companyKey]: record } } })
      expect(followup).toContain('下次跟进：')
      expect(followup).toContain('dateTime="2026-10-23"')
      expect(followup).toContain('待回复')
      expect(followup).not.toContain('已发送开发信')
    }
    const ready = { status: 'ready', sends: [], activeSend: () => null } as unknown as OutreachLedger
    expect(render({ ledger: ready })).toContain('未查到发送记录')
    expect(render({ ledger: ready, variant: 'row' })).toContain('outreach-status-unsent')
    for (const variant of ['card', 'row'] as const) {
      expect(render({ ledger: ready, variant })).toContain('准备开发信')
      expect(render({ ledger: sendingLedger, variant })).toContain('查看原参考稿')
      expect(render({ ledger: sendingLedger, variant })).toContain('发送记录')
      expect(render({ ledger: { ...ready, status: 'error' }, variant })).toContain('发送记录读取失败')
      expect(render({ ledger: { ...ready, status: 'error' }, variant })).not.toContain('>准备开发信<')
    }
  })

  it('shows company-specific evidence and retains the exact full original, source and date in either view', () => {
    const statement = '官网明确自产水性丙烯酸木材着色剂；用于室内外木材着色。尚未确认采购或配方相容性。'
    const evidenceLead = { ...lead, companyEvidence: { ...lead.companyEvidence, statement, sourceName: '官方产品资料', sourceUrl: 'https://example.org/wood', verifiedAt: '2026-10-19' } }
    for (const variant of ['card', 'row'] as const) {
      const markup = render({ lead: evidenceLead, variant })
      expect(markup).toContain('官网明确自产水性丙烯酸木材着色剂；用于室内外木材着色。')
      expect(markup).toContain('评估材料')
      expect(markup).toContain('适配待评估 · 采购未确认')
      expect(markup).toContain(`<p>${statement}</p>`)
      expect(markup).toContain('完整依据')
      expect(markup).toContain('href="https://example.org/wood"')
      expect(markup).toContain('官方产品资料')
      expect(markup).toContain('业务依据核验：')
      expect(markup).not.toContain(' 原料评估')
    }
    const unsafe = { ...evidenceLead, companyEvidence: { ...evidenceLead.companyEvidence, sourceUrl: 'javascript:alert(1)' } }
    expect(render({ lead: unsafe })).not.toContain('href="javascript:')
  })

  it('keeps evidence collapsed by default and does not invent an opportunity when the application is unverified', () => {
    const invalid = { ...lead, companyEvidence: { ...lead.companyEvidence, applicationId: 'missing-application', statement: '官网仅介绍公司业务，具体产品用途待核实。' } }
    for (const variant of ['card', 'row'] as const) {
      const markup = render({ lead: invalid, variant })
      expect(markup).toContain('应用关联待补证据')
      expect(markup).toContain('官网仅介绍公司业务，具体产品用途待核实。')
      expect(markup).not.toMatch(/<details[^>]*\bopen(?:=|\s|>)/)
      expect(markup).not.toContain('可核对涂料材料评估')
    }
  })

  it('does not turn an unverified or missing contact URL into an external action', () => {
    const noContact = { ...lead, profile: { ...lead.profile, contactPage: 'javascript:alert(1)', website: undefined } }
    const markup = render({ lead: noContact })
    expect(markup).toContain('查看联系渠道')
    expect(markup).not.toContain('href="javascript:')
  })
})
