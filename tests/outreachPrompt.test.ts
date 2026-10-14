import { describe, expect, it } from 'vitest'
import { createDevelopmentEmailPrompt } from '../src/lib/outreachPrompt'
import { type PublicLead, marketExtendedApplications, marketProducts, publicLeads, targetCompanyTypes, tdsVerifiedApplications } from '../src/lib/productMarketMap'
import { withProvedFirstContact } from './fixtures/contactEvidence'

function promptFor(id: string, transform: (lead: PublicLead) => PublicLead = (lead) => lead) {
  const lead = transform(publicLeads.find((item) => item.id === id)!)
  const product = marketProducts.find((item) => item.id === lead.productId)!
  const application = (lead.companyEvidence.applicationLayer === 'tds-verified' ? tdsVerifiedApplications : marketExtendedApplications).find((item) => item.id === lead.companyEvidence.applicationId)!
  const targetType = targetCompanyTypes.find((item) => item.id === lead.targetCompanyTypeId)!
  return createDevelopmentEmailPrompt({ lead, product, application, targetType })
}

describe('development-email prompt', () => {
  it('carries the verified coating-company path and production-aware CTA', () => {
    const prompt = promptFor('turf-care-martins-ferry', withProvedFirstContact)
    expect(prompt).toContain('Turf Care Supply')
    expect(prompt).toContain('United States')
    expect(prompt).toContain('Brian Mengeu')
    expect(prompt).toContain('General Manager, Martins Ferry Manufacturing & Coating Facility')
    expect(prompt).toContain('TDS-verified application: Coated Urea / Urea Coating')
    expect(prompt).toContain('Polymer-Coated Urea Manufacturer')
    expect(prompt).toContain('Hydroxyl value: 249 mg KOH/g.')
    expect(prompt).toContain('offer the TDS and a technical evaluation route if relevant')
    expect(prompt).toContain('Do not claim the company currently uses polyurethane')
    expect(prompt).toContain('Do not transfer an application or chemistry from our Product Reference onto the customer unless the customer’s own public evidence supports it.')
  })

  it('carries a sourced market extension and ELO-specific safeguards', () => {
    const prompt = promptFor('dacarto-osasco')
    expect(prompt).toContain('Dacarto Indústria e Comércio de Plásticos Ltda.')
    expect(prompt).toContain('Sourced market-extension application: PVC Plasticizer Application')
    expect(prompt).toContain('Wiley: The epoxidized linseed oil as a secondary plasticizer in PVC processing')
    expect(prompt).toContain('Epoxy value: ≥ 9.0%.')
    expect(prompt).toContain('Do not claim PVC applicability unless the sourced market-extension evidence below is present.')
    expect(prompt).toContain('Sales Team')
  })

  it('does not produce a drafting prompt when the independent exclusion record is missing', () => {
    expect(promptFor('haifa-israel')).toContain('Not qualified for outreach')
    expect(promptFor('polyvine-cheddar', (lead) => ({ ...lead, commercialRole: 'peer_supplier' }))).toContain('Not qualified for outreach')
    expect(promptFor('polyvine-cheddar', (lead) => ({ ...lead, country: 'Taiwan' }))).toContain('Not qualified for outreach')
    expect(promptFor('polyvine-cheddar', (lead) => ({ ...lead, supplierCompetitorCheck: undefined }))).toContain('Not qualified for outreach')
  })

  it('rejects mismatched product inputs instead of writing a misleading email instruction', () => {
    const lead = publicLeads.find((item) => item.id === 'polyvine-cheddar')!
    const prompt = createDevelopmentEmailPrompt({ lead, product: marketProducts.find((item) => item.id === 'elo')!, application: tdsVerifiedApplications.find((item) => item.id === 'wood-surface-treatment')!, targetType: targetCompanyTypes.find((item) => item.id === lead.targetCompanyTypeId)! })
    expect(prompt).toContain('Not qualified for outreach')
    expect(prompt).not.toContain('Epoxy value')
  })

  it('uses a company team when a named contact lacks a public source or verification date', () => {
    const prompt = promptFor('polyvine-cheddar', (lead) => ({ ...lead, profile: { ...lead.profile, contacts: [{ name: 'Unverified Person', title: 'Procurement Manager', email: 'buyer@example.org' }] } }))
    expect(prompt).toContain('Name / team: General Team')
    expect(prompt).not.toContain('Unverified Person')
    expect(prompt).toContain('Supplier / competitor exclusion')
  })

  it('prioritizes a verified technical manager over general management', () => {
    const prompt = promptFor('teknos-helsinki', withProvedFirstContact)
    expect(prompt).toContain('Name / team: Pasi Virtanen')
    expect(prompt).toContain('technical / R&D team')
  })

  it('routes a disclosed procurement role through the company inbox when no personal email is published', () => {
    const prompt = promptFor('paradeep-phosphates-bhubaneswar')
    expect(prompt).toContain('Name / team: General Team')
    expect(prompt).toContain('appropriate Technical / Procurement contact')
    expect(prompt).not.toContain('Name / team: Raj Kumar Gupta')
  })
})
