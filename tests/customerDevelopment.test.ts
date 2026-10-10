import { describe, expect, it } from 'vitest'
import { businessRecipient, developmentSnapshot, firstContactExport, firstContactPlan } from '../src/lib/customerDevelopment'
import { publicLeads, type PublicLead } from '../src/lib/productMarketMap'
import { outreachCompanyKey, type OutreachSend } from '../src/lib/outreachLedger'
import { verifiedProjectSignals } from '../src/lib/verifiedProjectSignals'

const coating = publicLeads.filter((lead) => lead.productId === 'fertilizer-coating')
const send = (lead: PublicLead, overrides: Partial<OutreachSend> = {}): OutreachSend => ({ id: lead.id, company_key: outreachCompanyKey(lead), company_name: lead.company, lead_id: lead.id, product_id: lead.productId, recipient_email: 'fixture@example.org', sent_on: '2026-10-10', sent_by: null, created_at: '2026-10-10T01:00:00Z', voided_at: null, ...overrides })

describe('daily first-contact planning', () => {
  it('does not turn unknown sending history into an unsent list', () => {
    expect(firstContactPlan(coating, null)).toMatchObject({ available: null, completed: null, batch: [], shortfall: null })
  })
  it('excludes phone-only companies, deduplicates and selects SEA first', () => {
    const plan = firstContactPlan([...coating, ...coating], [], 20, '2026-10-10')
    expect(plan.batch.length).toBeGreaterThan(0)
    expect(new Set(plan.batch.map((item) => outreachCompanyKey(item.lead))).size).toBe(plan.batch.length)
    expect(plan.batch.some((item) => item.lead.id === 'chobi-ulsan')).toBe(false)
    const flags = plan.batch.map((item) => item.southeastAsia)
    const firstGlobal = flags.indexOf(false)
    if (firstGlobal >= 0) expect(flags.slice(firstGlobal)).not.toContain(true)
    expect(plan.shortfall).toBe(Math.max(0, 20 - plan.available!))
  })
  it('excludes sent companies across products, counts today once and recalculates after a fresh send', () => {
    const initial = firstContactPlan(coating, [], 20, '2026-10-10')
    const first = initial.batch[0].lead
    const sends = [send(first, { product_id: 'elo' }), send(first)]
    const fresh = firstContactPlan(coating, sends, 20, '2026-10-10')
    expect(fresh.completed).toBe(1)
    expect(fresh.remaining).toBe(19)
    expect(fresh.batch.some((item) => item.lead.id === first.id)).toBe(false)
    expect(firstContactPlan(coating, [send(first, { voided_at: '2026-10-10T02:00:00Z' })], 20, '2026-10-10').completed).toBe(0)
    expect(firstContactPlan(coating, [send(first, { sent_on: '2026-10-09' })], 20, '2026-10-10').completed).toBe(0)
  })
  it('prioritizes procurement and exports the actual recipient and evidence', () => {
    const lead = { ...coating[0], profile: { ...coating[0].profile, contacts: [], departmentEmails: [{ department: 'Sales' as const, email: 'sales@example.org', source: { label: 'Official', url: 'https://example.org/contact' } }, { department: 'Procurement' as const, email: 'buy@example.org', source: { label: 'Official', url: 'https://example.org/contact' } }] } }
    expect(businessRecipient(lead)?.email).toBe('buy@example.org')
    const withProductionPerson = { ...lead, profile: { ...lead.profile, contacts: [{ name: 'Fixture Person', title: 'Plant manager', email: 'plant@example.org', source: { label: 'Official', url: 'https://example.org/team' }, verifiedAt: '2026-10-10' }] } }
    expect(businessRecipient(withProductionPerson)?.email).toBe('buy@example.org')
    const plan = firstContactPlan([lead], [], 20, '2026-10-10')
    expect(firstContactExport(plan.batch)).toContain('To: buy@example.org')
    expect(firstContactExport(plan.batch)).toContain('Contact source: https://example.org/contact')
    expect(firstContactExport(plan.batch)).toContain(`Hi ${lead.company} Team,`)
  })
  it('stops selecting new first-contact companies after the daily goal is complete', () => {
    const initial = firstContactPlan(coating, [], 20, '2026-10-10')
    expect(initial.batch).toHaveLength(20)
    const completed = firstContactPlan(coating, initial.batch.map((item) => send(item.lead)), 20, '2026-10-10')
    expect(completed).toMatchObject({ completed: 20, remaining: 0, batch: [], shortfall: 0 })
  })
  it('does not count a generic inbox or unsourced person as a named contact', () => {
    const lead = { ...coating[0], profile: { ...coating[0].profile, contacts: [{ name: 'Fixture Person', title: 'R&D manager', email: 'person@example.org', verifiedAt: '2026-10-10' }] } }
    expect(developmentSnapshot([lead], '2026-10-10').reachableNamedContacts).toBe(0)
    const known = new Set(publicLeads.map((item) => item.id))
    for (const signal of verifiedProjectSignals) {
      expect(known.has(signal.leadId)).toBe(true)
      expect(signal.sourceUrl).toMatch(/^https:/)
      expect(signal.dateLabel).toContain('具体发生日期未单独披露')
    }
  })
})
