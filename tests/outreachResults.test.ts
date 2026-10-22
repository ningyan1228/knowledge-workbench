import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { publicLeads, type PublicLead } from '../src/lib/productMarketMap'
import { outreachCompanyKey, type OutreachSend } from '../src/lib/outreachLedger'
import { effectiveStage, emptyWorkRecord, normalizeWorkRecord } from '../src/lib/leadWorkbench'
import { companyResults, countResults, normalizeResultEvents, resultGroups, type ResultEvent } from '../src/lib/outreachResults'
import { OutreachResults } from '../src/features/market/OutreachResults'
import type { LeadWork } from '../src/features/market/useLeadWork'
import type { OutreachLedger } from '../src/features/market/useOutreachLedger'
import { marketTabForRoute } from '../src/lib/leadViewPreference'
import { confirmContactCopy } from '../src/lib/contactCopyGuard'
import { firstContactPlan } from '../src/lib/customerDevelopment'
import { canPrepareFirstContact } from '../src/lib/leadPreparation'

const lead = publicLeads[0], key = outreachCompanyKey(lead)
const second = { ...lead, id: 'second-product', productId: (lead.productId === 'elo' ? 'nl-w1201' : 'elo') as PublicLead['productId'] }
const send: OutreachSend = { id: 'mail', company_key: key, company_name: lead.company, lead_id: lead.id, product_id: lead.productId, recipient_email: 'test@example.org', sent_on: '2026-09-30', sent_by: null, created_at: '2026-09-30T08:00:00Z', voided_at: null }
const event = (kind: ResultEvent['kind'], on = '2026-10-20'): ResultEvent => ({ id: `${kind}:${on}`, kind, on, note: 'Actual customer response in the project discussion.', recordedAt: '2026-10-22T01:00:00Z' })
const record = { ...emptyWorkRecord(key), resultEvents: [event('replied'), event('replied', '2026-10-21'), event('technical')] }
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

describe('actual outreach results', () => {
  it('counts each company once per independent milestone, never treating a copy or legacy stage as a result', () => {
    const rows = companyResults([lead, second], [send, { ...send, id: 'duplicate' }], { [key]: record }, '2026-10-22')
    expect(rows).toHaveLength(1)
    expect(countResults(rows)).toEqual({ contacted: 1, replied: 1, technical: 1, sample: 0 })
    expect(companyResults([lead], [], { [key]: { ...emptyWorkRecord(key), stage: 'sample', note: 'Sample discussion, not an evaluation.' } }, '2026-10-22')).toEqual([])
    expect(companyResults([lead], [], {}, '2026-10-22')).toEqual([])
    expect(countResults(companyResults([lead], [], { [key]: { ...record, resultEvents: [event('sample')] } }, '2026-10-22'))).toEqual({ contacted: 0, replied: 0, technical: 0, sample: 1 })
  })
  it('uses earliest valid actual contact for monthly cohorts, with later results attributed to that cohort', () => {
    const work = { ...record, contactLog: [{ id: 'form', channel: 'form' as const, destination: 'https://example.org/contact', contactedOn: '2026-09-02', recordedAt: '2026-09-02T08:00:00Z' }] }
    const rows = companyResults([lead], [send], { [key]: work }, '2026-10-22')
    expect(rows[0].firstContact).toBe('2026-09-02')
    expect(resultGroups(rows, 'batch')[0]).toMatchObject({ key: '2026-09', counts: { contacted: 1, replied: 1, technical: 1, sample: 0 } })
    expect(companyResults([lead], [], { [key]: record }, '2026-10-22')[0].batch).toBe('unknown')
  })
  it('excludes revoked, invalid and future records and can undo a result without affecting mail', () => {
    const invalid = { ...event('sample'), on: '2026-02-30' }
    const work = { ...record, resultEvents: [invalid, event('technical', '2026-10-23'), { ...event('replied'), voidedAt: '2026-10-22T02:00:00Z' }] }
    expect(countResults(companyResults([lead], [send], { [key]: work }, '2026-10-22'))).toEqual({ contacted: 1, replied: 0, technical: 0, sample: 0 })
    expect(companyResults([lead], [{ ...send, voided_at: '2026-10-22T02:00:00Z' }], { [key]: work }, '2026-10-22')).toEqual([])
    expect(normalizeResultEvents([event('replied'), event('replied'), { ...event('sample'), note: '' }, { ...event('technical'), kind: 'purchaseProbability' }])).toHaveLength(1)
  })
  it('keeps company-level product membership nonexclusive and regions deduplicated', () => {
    const rows = companyResults([lead, second], [send], { [key]: record }, '2026-10-22')
    expect(resultGroups(rows, 'product')).toHaveLength(2)
    expect(resultGroups(rows, 'product').map(group => group.counts.contacted)).toEqual([1, 1])
    expect(resultGroups(rows, 'country')).toHaveLength(1)
    expect(countResults(rows).contacted).toBe(1)
  })
  it('persists new events through the existing private-record normalizer without changing old progress', () => {
    const normalized = normalizeWorkRecord({ ...record, stage: 'paused', favorite: true, note: 'keep note' }, key)
    expect(normalized.resultEvents).toEqual(record.resultEvents)
    expect(normalizeWorkRecord(JSON.parse(JSON.stringify(normalized)), key)).toEqual(normalized)
    expect(normalized).toMatchObject({ stage: 'paused', favorite: true, note: 'keep note' })
    expect(normalizeWorkRecord({}, key).resultEvents).toEqual([])
  })
  it('shows unavailable counts instead of zero when either source is not connected', () => {
    for (const [ledgerStatus, workStatus] of [['error', 'ready'], ['ready', 'login_required'], ['loading', 'ready']] as const) {
      const ledger = { status: ledgerStatus, sends: [], error: 'Read failed' } as unknown as OutreachLedger
      const work = { status: workStatus, records: {}, lists: [], ownerId: null } as unknown as LeadWork
      const html = renderToStaticMarkup(createElement(OutreachResults, { leads: [lead], ledger, work }))
      expect(html.match(/<dd>—/g)).toHaveLength(4)
      expect(html).not.toContain('class="result-comparison"')
      expect(html).toContain('当前账号')
    }
    expect(marketTabForRoute('results', 'map')).toBe('results')
  })
  it('warns before copying and excludes recorded results from first-contact exports using fresh private records', async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-22T02:00:00Z'))
    const eligible = publicLeads.find(item => item.id === 'polyvine-cheddar')!, companyKey = outreachCompanyKey(eligible)
    const records = { [companyKey]: { ...emptyWorkRecord(companyKey), resultEvents: [event('technical')] } }
    const confirm = vi.fn(() => false); vi.stubGlobal('window', { confirm })
    const ledger = { status: 'ready', checkBeforeOutreach: async () => null } as unknown as OutreachLedger
    const work = { status: 'ready', fetchCurrentRecords: async () => records } as unknown as LeadWork
    for (const part of ['邮箱', '主题', '正文', '整封开发信'] as const) expect(await confirmContactCopy(eligible, ledger, work, part, new AbortController().signal)).toBeNull()
    expect(confirm).toHaveBeenCalledWith(expect.stringContaining('技术沟通'))
    expect(canPrepareFirstContact(eligible, [], records)).toBe(false)
    expect(effectiveStage(eligible, records, [])).toBe('technical')
    expect(effectiveStage(eligible, { [companyKey]: { ...records[companyKey], resultEvents: [event('technical', '2026-10-20'), event('contacted', '2026-10-22')] } }, [])).toBe('technical')
    expect(firstContactPlan([eligible], [], 100, '2026-10-22', false, records).batch).toHaveLength(0)
    const revoked = { [companyKey]: { ...records[companyKey], resultEvents: [{ ...event('technical'), voidedAt: '2026-10-22T02:00:00Z' }] } }
    expect(canPrepareFirstContact(eligible, [], revoked)).toBe(true)
    expect(firstContactPlan([eligible], [], 100, '2026-10-22', false, revoked).batch).toHaveLength(1)
  })
})
