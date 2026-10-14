import { describe, expect, it } from 'vitest'
import { firstContactStrategy, outreachCompanyLabel } from '../src/lib/firstContactStrategy'
import { createShortDevelopmentEmail } from '../src/lib/shortDevelopmentEmail'
import { publicLeads } from '../src/lib/productMarketMap'
import { provedContact } from './fixtures/contactEvidence'

const lead = publicLeads.find((item) => item.id === 'polyvine-cheddar')!
const withPerson = (title: string) => ({ ...lead, profile: { ...lead.profile, departmentEmails: [], contacts: [provedContact(lead.company, { title })] } })
describe('specific business context before a first-contact request', () => {
  it('asks a company inbox for the responsible colleague, without assuming a current purchase', () => {
    expect(firstContactStrategy(lead)).toMatchObject({ approach: 'route-to-person', application: 'wood coatings', buyingNeed: 'unconfirmed', question: 'Who handles raw-material evaluation or purchasing for your wood coatings?' })
    const draft = createShortDevelopmentEmail(lead)!
    expect(draft.text).toContain('2K-POLY86')
    expect(draft.subject).toBe('Polyvine — wood-coating materials')
    expect(draft.text).not.toMatch(/TDS|quotation|MOQ|you need|23%|UK client/i)
  })
  it('asks relevance for a sourced buyer or technical contact, and checks responsibility for other roles', () => {
    for (const title of ['Procurement Manager', 'R&D Manager', 'Supply Chain Manager']) expect(firstContactStrategy(withPerson(title))).toMatchObject({ approach: 'relevance-check', question: 'Would evaluating this material for your wood coatings be relevant to your team?' })
    expect(firstContactStrategy(withPerson('CEO'))).toMatchObject({ approach: 'person-check', question: 'Are you the right person to contact about raw materials for your wood coatings?' })
    const missingIdentity = withPerson('Procurement Manager')
    missingIdentity.profile.contacts[0].identityEvidence = undefined
    expect(firstContactStrategy(missingIdentity).approach).toBe('route-to-person')
    expect(firstContactStrategy(withPerson('Procurement Manager'), 'Invented Person').approach).toBe('route-to-person')
  })
  it('uses only the product/application path saved for each company', () => {
    const coated = publicLeads.find((item) => item.id === 'troforte-innovations-wangara')!
    const ink = publicLeads.find((item) => item.id === 'vivacor-diadema')!
    const pvc = publicLeads.find((item) => item.id === 'dacarto-osasco')!
    expect(firstContactStrategy(coated).application).toBe('fertilizer coating formulations')
    expect(firstContactStrategy(ink).application).toBe('water-based inks')
    expect(firstContactStrategy(pvc).application).toBe('PVC compounds')
    expect(createShortDevelopmentEmail({ ...lead, commercialRole: 'peer_supplier' })).toBeNull()
  })
  it('keeps subject names grounded in the saved company name', () => {
    expect(outreachCompanyLabel('Teknos Oy (Teknos Group)')).toBe('Teknos')
    expect(outreachCompanyLabel('A Brand Ltd.')).toBe('A Brand')
    expect(outreachCompanyLabel('Factory Name')).toBe('Factory Name')
    expect(outreachCompanyLabel('(Example)')).toBe('(Example)')
  })
})
