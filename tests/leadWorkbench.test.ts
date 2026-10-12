import { describe, expect, it } from 'vitest'
import { publicLeads, type PublicLead } from '../src/lib/productMarketMap'
import { outreachCompanyKey, type OutreachSend } from '../src/lib/outreachLedger'
import { applicationKey, contactChannels, developmentPriority, developmentProgressLabel, effectiveStage, emptyBusinessFilters, emptyWorkRecord, filterWorkbenchLeads, followUpDue, normalizeWorkRecord, validWorkDate } from '../src/lib/leadWorkbench'
import { companyWorkId } from '../src/lib/leadWorkStorage'

const lead = publicLeads.find((item) => item.companyEvidence.applicationLayer === 'tds-verified' && item.profile.generalEmail && item.supplierCompetitorCheck)!
const send: OutreachSend = { id: 'send', company_key: outreachCompanyKey(lead), company_name: lead.company, lead_id: lead.id, product_id: 'elo', recipient_email: 'fixture@example.com', sent_on: '2026-10-11', sent_by: null, created_at: '2026-10-11T01:00:00Z', voided_at: null }
const record = { ...emptyWorkRecord(outreachCompanyKey(lead)), favorite: true, listIds: ['my-list'], stage: 'replied' as const, followUpOn: '2026-10-11' }

describe('customer development workspace', () => {
  it('ranks published evidence and contact access without treating fit labels as confirmed demand', () => {
    expect(lead).toBeDefined()
    const priority = developmentPriority(lead)
    expect(priority.score).toBeGreaterThanOrEqual(80)
    expect(priority.reasons.some((reason) => reason.includes('公开业务邮箱'))).toBe(true)
    expect(developmentPriority({ ...lead, fit: '可开发候选' })).toEqual(priority)
    expect(developmentPriority({ ...lead, leadEligible: false }).score).toBe(0)
    const missing = { ...lead, profile: { contacts: [], departmentEmails: [], sources: [] }, companyEvidence: { ...lead.companyEvidence, statement: '', sourceUrl: '', verifiedAt: '' }, demandSideReason: '', supplierCompetitorCheck: undefined }
    expect(developmentPriority(missing).score).toBeLessThan(60)
    expect(contactChannels(missing)).toEqual({ email: false, form: false, phone: false, named: false })
  })
  it('keeps unknown private or sending history distinct from an unsent customer', () => {
    expect(effectiveStage(lead, null, [])).toBe('unknown')
    expect(effectiveStage(lead, {}, null)).toBe('unknown')
    expect(effectiveStage(lead, {}, [])).toBe('todo')
    expect(effectiveStage(lead, {}, [send])).toBe('sent')
    expect(effectiveStage(lead, { [record.companyKey]: record }, [send])).toBe('replied')
    for (const queue of ['priority', 'recent'] as const) {
      expect(filterWorkbenchLeads([lead], { ...emptyBusinessFilters, queue }, {}, null, '2026-10-12')).toEqual([])
      expect(filterWorkbenchLeads([lead], { ...emptyBusinessFilters, queue }, null, [], '2026-10-12')).toEqual([])
      expect(filterWorkbenchLeads([lead], { ...emptyBusinessFilters, queue }, {}, [send], '2026-10-12')).toEqual([])
      expect(filterWorkbenchLeads([lead], { ...emptyBusinessFilters, queue }, {}, [{ ...send, voided_at: '2026-10-12T01:00:00Z' }], '2026-10-12')).toEqual([lead])
    }
  })
  it('treats actual sending as a completed milestone across later stages and products', () => {
    const second = { ...lead, id: 'other-product', productId: 'nl-w1201' as const }
    const filters = { ...emptyBusinessFilters, stage: 'sent' }
    for (const stage of [null, 'todo', 'waiting', 'replied', 'sample', 'paused'] as const) {
      const records = { [record.companyKey]: { ...record, stage } }
      expect(filterWorkbenchLeads([lead, second], filters, records, [send], '2026-10-12')).toEqual(expect.arrayContaining([lead, second]))
      expect(filterWorkbenchLeads([lead], filters, records, [], '2026-10-12')).toEqual([])
      expect(filterWorkbenchLeads([lead], filters, records, null, '2026-10-12')).toEqual([])
      expect(filterWorkbenchLeads([lead], filters, records, [{ ...send, voided_at: '2026-10-12T01:00:00Z' }], '2026-10-12')).toEqual([])
    }
    expect(effectiveStage(lead, null, [send])).toBe('sent')
    expect(effectiveStage(lead, { [record.companyKey]: { ...record, stage: 'todo' } }, [send])).toBe('sent')
    expect(filterWorkbenchLeads([lead], { ...filters, stage: 'waiting' }, {}, [send], '2026-10-12')).toEqual([lead])
    expect(filterWorkbenchLeads([lead], { ...filters, stage: 'waiting' }, { [record.companyKey]: record }, [send], '2026-10-12')).toEqual([])
    expect(developmentProgressLabel('sent', true)).toBe('已发送开发信')
    expect(developmentProgressLabel('replied', true)).toBe('已发送开发信 · 已回复')
    expect(normalizeWorkRecord({ stage: 'sent' }, 'key').stage).toBeNull()
  })
  it('includes overdue and today follow-ups but excludes future and paused plans', () => {
    expect(followUpDue(record, '2026-10-12')).toBe(true)
    expect(followUpDue({ ...record, followUpOn: '2026-10-12' }, '2026-10-12')).toBe(true)
    expect(followUpDue({ ...record, followUpOn: '2026-10-13' }, '2026-10-12')).toBe(false)
    expect(followUpDue({ ...record, stage: 'paused' }, '2026-10-12')).toBe(false)
    expect(followUpDue({ ...record, followUpOn: '2026-02-30' }, '2026-10-12')).toBe(false)
    expect(validWorkDate('2026-02-29')).toBe(false)
    expect(validWorkDate('2028-02-29')).toBe(true)
    const records = { [record.companyKey]: record }
    expect(filterWorkbenchLeads([lead], { ...emptyBusinessFilters, queue: 'followup' }, records, null, '2026-10-12')).toEqual([lead])
  })
  it('combines industry, application, contact, progress and private lists', () => {
    const filters = { ...emptyBusinessFilters, industry: lead.targetCompanyTypeId, application: applicationKey(lead), contact: 'email', stage: 'replied', list: 'my-list', query: lead.company }
    const records = { [record.companyKey]: record }
    expect(filterWorkbenchLeads(publicLeads, filters, records, [], '2026-10-12')).toContainEqual(lead)
    expect(filterWorkbenchLeads([lead], { ...filters, stage: 'sample' }, records, [], '2026-10-12')).toEqual([])
    expect(filterWorkbenchLeads([lead], { ...filters, list: 'other-list' }, records, [], '2026-10-12')).toEqual([])
    expect(filterWorkbenchLeads([lead], { ...filters, list: 'favorites' }, null, [], '2026-10-12')).toEqual([])
  })
  it('shares private progress and the UUID across products of the same company', async () => {
    const second: PublicLead = { ...lead, id: 'same-company-other-product', productId: 'elo' }
    expect(effectiveStage(second, { [record.companyKey]: record }, [])).toBe('replied')
    expect(await companyWorkId(outreachCompanyKey(second))).toBe(await companyWorkId(outreachCompanyKey(lead)))
    expect(await companyWorkId(outreachCompanyKey(lead))).toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-5[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/)
    expect(await companyWorkId(outreachCompanyKey({ ...lead, country: 'Other country' }))).not.toBe(await companyWorkId(outreachCompanyKey(lead)))
  })
  it('normalizes malformed private fields and deduplicates memberships', () => {
    expect(normalizeWorkRecord({ stage: 'invalid', followUpOn: 'not-a-day', favorite: 'yes', listIds: ['a', 'a', 3], note: 'x'.repeat(5000) }, 'key')).toMatchObject({ companyKey: 'key', stage: null, followUpOn: '', favorite: false, listIds: ['a'] })
    expect(normalizeWorkRecord({ note: 'x'.repeat(5000) }, 'key').note).toHaveLength(4000)
  })
})
