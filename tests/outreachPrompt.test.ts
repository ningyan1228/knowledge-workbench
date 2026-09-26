import { describe, expect, it } from 'vitest'
import { createDevelopmentEmailPrompt } from '../src/lib/outreachPrompt'
import { marketExtendedApplications, marketProducts, publicLeads, targetCompanyTypes, tdsVerifiedApplications } from '../src/lib/productMarketMap'

function promptFor(id: string) {
  const lead = publicLeads.find((item) => item.id === id)!
  const product = marketProducts.find((item) => item.id === lead.productId)!
  const application = (lead.companyEvidence.applicationLayer === 'tds-verified' ? tdsVerifiedApplications : marketExtendedApplications).find((item) => item.id === lead.companyEvidence.applicationId)!
  const targetType = targetCompanyTypes.find((item) => item.id === lead.targetCompanyTypeId)!
  return createDevelopmentEmailPrompt({ lead, product, application, targetType })
}

describe('development-email prompt', () => {
  it('carries the verified coating-company path and management-aware CTA', () => {
    const prompt = promptFor('turf-care-martins-ferry')
    expect(prompt).toContain('Turf Care Supply')
    expect(prompt).toContain('United States')
    expect(prompt).toContain('Brian Mengeu')
    expect(prompt).toContain('General Manager, Martins Ferry Manufacturing & Coating Facility')
    expect(prompt).toContain('TDS-verified application: Coated Urea / Urea Coating')
    expect(prompt).toContain('Polymer-Coated Urea Manufacturer')
    expect(prompt).toContain('Hydroxyl value: 249 mg KOH/g.')
    expect(prompt).toContain('could direct the message to the person responsible for raw-material purchasing')
    expect(prompt).toContain('Do not claim the company currently uses polyurethane')
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
})
