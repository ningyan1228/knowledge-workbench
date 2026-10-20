import { describe, expect, it } from 'vitest'
import { contactAssessment, selectBusinessRecipient, type CompanyContact } from '../src/lib/contactEvidence'
import { publicLeads } from '../src/lib/productMarketMap'
import { createShortDevelopmentEmail } from '../src/lib/shortDevelopmentEmail'
import { provedContact } from './fixtures/contactEvidence'

const base = publicLeads.find((lead) => lead.id === 'teknos-helsinki')!
const withContacts = (contacts: CompanyContact[]) => ({ ...base, profile: { ...base.profile, generalEmail: undefined, departmentEmails: [], contacts } })
describe('separate identity and business channel evidence', () => {
  it('does not reuse identity/LinkedIn provenance for an email or telephone', () => {
    const contact = provedContact(base.company, { emailEvidence: undefined, linkedIn: 'https://www.linkedin.com/in/fixture', phone: '+358 1234567', source: { label: 'Profile', url: 'https://www.linkedin.com/in/fixture' }, verifiedAt: '2026-10-14' })
    expect(contactAssessment(base.company, contact)).toMatchObject({ identity: true, email: false, phone: false, linkedIn: true })
    expect(contactAssessment(base.company, contact).labels).toContain('仅领英入口')
    expect(selectBusinessRecipient(withContacts([contact]))).toBeNull()
    expect(createShortDevelopmentEmail(withContacts([contact]))?.body).toMatch(/^Hi Teknos Oy \(Teknos Group\) Team,/)
  })
  it('requires current employer, exact role/name, ownership and actual dates', () => {
    const contact = provedContact(base.company)
    expect(selectBusinessRecipient(withContacts([contact]))?.name).toBe(contact.name)
    const mismatches = [
      { ...contact, identityEvidence: { ...contact.identityEvidence!, company: 'Other Company' } },
      { ...contact, title: 'Former Director' },
      { ...contact, identityEvidence: { ...contact.identityEvidence!, currentEmployment: false } },
      { ...contact, identityEvidence: { ...contact.identityEvidence!, verifiedAt: '2026-02-31' } },
      { ...contact, emailEvidence: { ...contact.emailEvidence!, value: 'other@example.org' } },
      { ...contact, emailEvidence: { ...contact.emailEvidence!, personName: 'Someone Else' } },
      { ...contact, emailEvidence: { ...contact.emailEvidence!, sources: [{ label: 'No evidence text', url: 'https://example.org/contact', summary: '' }] } },
    ]
    for (const invalid of mismatches) expect(selectBusinessRecipient(withContacts([invalid as CompanyContact]))).toBeNull()
  })
  it('keeps generic mailboxes separate and never greets the supposed owner', () => {
    const contact = provedContact(base.company, { email: 'info@example.org' })
    const recipient = selectBusinessRecipient(withContacts([contact]))!
    expect(recipient.email).toBe('info@example.org')
    expect(recipient.name).toBeUndefined()
    expect(contactAssessment(base.company, contact).namedEmail).toBe(false)
    expect(createShortDevelopmentEmail(withContacts([contact]), contact.name)?.body).not.toContain('Hi Fixture,')
  })
  it('requires an explicitly public business phone and exact person ownership', () => {
    const contact = provedContact(base.company, { phone: '+358 1234567' })
    const phoneEvidence = { company: base.company, value: contact.phone!, kind: 'named-business' as const, personName: contact.name, publicBusiness: true as const, sources: contact.emailEvidence!.sources, verifiedAt: '2026-10-14' }
    expect(contactAssessment(base.company, { ...contact, phoneEvidence }).phone).toBe(true)
    expect(contactAssessment(base.company, { ...contact, phoneEvidence: { ...phoneEvidence, publicBusiness: false } } as unknown as CompanyContact).phone).toBe(false)
    expect(contactAssessment(base.company, { ...contact, phoneEvidence: { ...phoneEvidence, personName: 'Someone Else' } }).phone).toBe(false)
  })
  it('prioritizes procurement and technical roles, preserving a corporate fallback', () => {
    const contacts = ['CEO', 'Ecommerce Manager', 'R&D Manager', 'Procurement Manager'].map((title) => provedContact(base.company, { title }))
    expect(selectBusinessRecipient(withContacts(contacts))?.label).toBe('Procurement Manager')
    expect(selectBusinessRecipient(withContacts(contacts.slice(0, 3)))?.label).toBe('R&D Manager')
    const legacy = { ...base, profile: { ...base.profile, contacts: [provedContact(base.company, { identityEvidence: undefined })], departmentEmails: [], generalEmail: 'info@example.org', contactPage: 'https://example.org/contact' } }
    expect(selectBusinessRecipient(legacy)).toMatchObject({ email: 'info@example.org', provenance: 'legacy-company-source' })
    expect(selectBusinessRecipient(legacy)?.name).toBeUndefined()
    expect(selectBusinessRecipient({ ...legacy, commercialRole: 'peer_supplier' })).toBeNull()
    expect(selectBusinessRecipient({ ...legacy, country: 'Taiwan' })).toBeNull()
    expect(selectBusinessRecipient({ ...legacy, supplierCompetitorCheck: undefined })).toBeNull()
    expect(selectBusinessRecipient({ ...legacy, companyEvidence: { ...legacy.companyEvidence, applicationId: 'coated-urea' } })).toBeNull()
  })
  it('does not fall back to a legacy link after explicit channel evidence fails', () => {
    const proof = provedContact(base.company).emailEvidence!
    const lead = { ...base, profile: { ...base.profile, contacts: [], departmentEmails: [], generalEmail: 'info@example.org', generalEmailEvidence: proof } }
    expect(selectBusinessRecipient(lead)).toBeNull()
  })
})
