import type { CompanyContact, EmailEvidence, IdentityEvidence } from '../../src/lib/contactEvidence'
import type { PublicLead } from '../../src/lib/productMarketMap'

/** Synthetic evidence for behavioural tests; never written into public company records. */
export function provedContact(company: string, overrides: Partial<CompanyContact> = {}): CompanyContact {
  const name = overrides.name ?? 'Fixture Buyer', title = overrides.title ?? 'Procurement Manager', email = overrides.email ?? 'buyer@example.org'
  const identityEvidence: IdentityEvidence = { company, name, title, responsibilities: 'Fixture raw-material purchasing responsibility', currentEmployment: true, verifiedAt: '2026-10-14', sources: [{ label: 'Fixture official team', url: 'https://example.org/team', summary: 'Synthetic current employer and role evidence' }] }
  const emailEvidence: EmailEvidence = { company, value: email, kind: 'named-business', personName: name, publicBusiness: true, verifiedAt: '2026-10-14', sources: [{ label: 'Fixture official business email', url: 'https://example.org/contact', summary: 'Synthetic exact address and named business ownership evidence' }] }
  return { name, title, email, identityEvidence, emailEvidence, ...overrides }
}
export function withProvedFirstContact(lead: PublicLead) {
  const contact = lead.profile.contacts[0]
  return { ...lead, profile: { ...lead.profile, contacts: [provedContact(lead.company, contact)] } }
}
