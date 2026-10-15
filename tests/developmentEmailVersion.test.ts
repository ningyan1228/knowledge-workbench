import { describe, expect, it } from 'vitest'
import { developmentEmailVersion } from '../src/lib/developmentEmailVersion'
import { createShortDevelopmentEmail } from '../src/lib/shortDevelopmentEmail'
import { firstContactPlan } from '../src/lib/customerDevelopment'
import { publicLeads } from '../src/lib/productMarketMap'
import { outreachCompanyKey, type OutreachSend } from '../src/lib/outreachLedger'

const lead = publicLeads.find((item) => item.id === 'polyvine-cheddar')!
const sent: OutreachSend = { id: 'fixture', company_key: outreachCompanyKey(lead), company_name: lead.company, lead_id: lead.id, product_id: lead.productId, recipient_email: 'fixture@example.org', sent_on: '2026-10-13', sent_by: null, created_at: '2026-10-13T01:00:00Z', voided_at: null }
describe('concise rewrite scope follows the shared sent badge', () => {
  it('uses the new version only for a company without an active sent record', () => {
    const version = developmentEmailVersion(lead, [])
    expect(version).toMatchObject({ state: 'unsent', style: 'concise' })
    expect(version.email?.body).toContain('Would evaluating this material for your wood coatings be relevant to your team?')
    expect(version.email?.body).not.toContain('If another colleague')
    expect(version.email?.subject).toBe('Polyvine — wood-coating materials')
    expect(version.email?.text).not.toContain('TDS')
  })
  it('preserves the previous reference for sent companies, across products and after fresh status changes', () => {
    const version = developmentEmailVersion(lead, [{ ...sent, product_id: 'elo' }])
    expect(version).toMatchObject({ state: 'sent', style: 'legacy' })
    expect(version.email?.text).toBe(createShortDevelopmentEmail(lead, undefined, 'legacy')?.text)
    expect(version.email?.body).toContain('If another colleague handles raw-material evaluation')
    expect(developmentEmailVersion(lead, [sent]).style).toBe('legacy')
    expect(developmentEmailVersion(lead, [{ ...sent, voided_at: '2026-10-14T00:00:00Z' }]).style).toBe('concise')
  })
  it('does not call an unreadable ledger unsent', () => {
    expect(developmentEmailVersion(lead, null)).toMatchObject({ state: 'unknown', style: 'legacy' })
  })
  it('keeps newly discovered eligible companies concise and batch exports clear of sent companies', () => {
    const coating = publicLeads.filter((item) => item.productId === 'fertilizer-coating')
    const plan = firstContactPlan(coating, [], 3, '2026-10-14')
    expect(plan.batch).toHaveLength(3)
    expect(plan.batch.every((item) => item.email.style === 'concise' && (item.email.body.match(/\?/g)?.length ?? 0) === 1)).toBe(true)
    const first = plan.batch[0].lead
    const updated = firstContactPlan(coating, [{ ...sent, company_key: outreachCompanyKey(first), company_name: first.company, lead_id: first.id }], 20, '2026-10-14')
    expect(updated.batch.some((item) => item.lead.id === first.id)).toBe(false)
  })
})
