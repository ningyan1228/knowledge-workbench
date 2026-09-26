import { describe, expect, it } from 'vitest'
import { marketExtendedApplications, marketProducts, publicLeads, targetCompanyTypes, tdsVerifiedApplications } from '../src/lib/productMarketMap'

describe('global product lead map', () => {
  it('gives each product a defined customer-search route', () => {
    expect(marketProducts.map((product) => product.id).sort()).toEqual(['elo', 'fertilizer-coating', 'nl-w1201'])
    for (const product of marketProducts) {
      expect(product.tdsApplicationIds.length).toBeGreaterThan(0)
      expect(product.searchLogic).not.toHaveLength(0)
      expect(product.searchTerms.length).toBeGreaterThan(0)
      expect(product.tdsScope).toMatch(/已提供|TDS/)
    }
  })

  it('keeps TDS applications, market extensions, and target company types as separate evidence-linked records', () => {
    for (const application of tdsVerifiedApplications) {
      expect(marketProducts.some((product) => product.id === application.productId)).toBe(true)
      expect(application.sourceDocument).not.toHaveLength(0)
    }
    for (const extension of marketExtendedApplications) {
      const parent = tdsVerifiedApplications.find((application) => application.id === extension.basedOnTdsApplicationId)
      expect(parent?.productId).toBe(extension.productId)
      expect(extension.sourceName).not.toHaveLength(0)
      expect(extension.sourceUrl).toMatch(/^https:\/\//)
      expect(extension.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
    for (const type of targetCompanyTypes) {
      expect(type.applicationReferences.length).toBeGreaterThan(0)
      for (const reference of type.applicationReferences) {
        const application = reference.layer === 'tds-verified' ? tdsVerifiedApplications.find((item) => item.id === reference.applicationId) : marketExtendedApplications.find((item) => item.id === reference.applicationId)
        expect(application?.productId).toBe(type.productId)
      }
    }
  })

  it('keeps NL-W1201 substrate scope and ELO PVC expansion evidence precise', () => {
    const nl = marketProducts.find((product) => product.id === 'nl-w1201')!
    expect(nl.tdsApplicationIds).toEqual(expect.arrayContaining(['pvc-primer', 'aluminum-primer']))
    expect(tdsVerifiedApplications.some((application) => application.id === 'metal-primer')).toBe(false)

    const pvcType = targetCompanyTypes.find((type) => type.id === 'pvc-compound-manufacturer')!
    expect(pvcType.applicationReferences).toEqual([{ layer: 'market-extended', applicationId: 'elo-pvc-plasticizer' }])
    expect(targetCompanyTypes.some((type) => type.nameEn === 'Plastic Product Manufacturer')).toBe(false)
    for (const lead of publicLeads.filter((item) => ['plastchem-hardenberg', 'polyflex-baltic', 'stir-barletta'].includes(item.id))) {
      expect(lead.companyEvidence).toMatchObject({ applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' })
      expect(lead.targetCompanyTypeId).toBe('pvc-compound-manufacturer')
    }
  })

  it('displays demand-side customers only, never peer suppliers or technical-route references', () => {
    expect(publicLeads).toHaveLength(31)
    expect(publicLeads.some((lead) => lead.productId === 'nl-w1201')).toBe(true)
    expect(publicLeads.some((lead) => lead.productId === 'elo')).toBe(true)
    for (const lead of publicLeads) {
      expect(marketProducts.some((product) => product.id === lead.productId)).toBe(true)
      expect(lead.city).not.toHaveLength(0)
      expect(lead.latitude).toBeGreaterThanOrEqual(-90)
      expect(lead.longitude).toBeLessThanOrEqual(180)
      expect(lead.signal).not.toHaveLength(0)
      expect(lead.source.url).toMatch(/^https:\/\//)
      expect(lead.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(['优先核验', '可开发候选']).toContain(lead.fit)
      expect(lead.commercialRole).toBe('demand_side')
      expect(lead.leadEligible).toBe(true)
      expect(lead.demandSideReason).not.toHaveLength(0)
      expect(lead.country).not.toBe('China')
      const targetType = targetCompanyTypes.find((type) => type.id === lead.targetCompanyTypeId)
      expect(targetType?.productId).toBe(lead.productId)
      expect(targetType?.kind).toBe('target')
      const application = lead.companyEvidence.applicationLayer === 'tds-verified' ? tdsVerifiedApplications.find((item) => item.id === lead.companyEvidence.applicationId) : marketExtendedApplications.find((item) => item.id === lead.companyEvidence.applicationId)
      expect(application?.productId).toBe(lead.productId)
      expect(lead.companyEvidence.sourceUrl).toMatch(/^https:\/\//)
      expect(lead.companyEvidence.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(lead.profile.website ?? lead.profile.linkedIn).toMatch(/^https:\/\//)
      expect(lead.profile.sources.length).toBeGreaterThan(0)
      expect(Array.isArray(lead.profile.contacts)).toBe(true)
      expect(Array.isArray(lead.profile.departmentEmails)).toBe(true)
      for (const contact of lead.profile.contacts) {
        if (contact.verifiedAt) expect(contact.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      }
    }
  })

  it('keeps named people and department mailboxes separately attributable', () => {
    const icl = publicLeads.find((lead) => lead.id === 'icl-charleston')!
    const pursell = publicLeads.find((lead) => lead.id === 'pursell-sylacauga')!
    expect(icl.profile.contacts[0]).toMatchObject({ name: 'Jolene Miller', department: 'Technical' })
    expect(pursell.profile.contacts[0]).toMatchObject({ name: 'Jason Woulfin', department: 'Sales' })
    expect(icl.profile.contacts[0].verifiedAt).toBe('2026-09-25')
    expect(pursell.profile.departmentEmails[0]).toMatchObject({ department: 'Sales', email: 'jason@fertilizer.com' })
  })

  it('keeps a dated supplier and competitor exclusion check for newly researched candidates', () => {
    for (const id of ['simplot-boise', 'agrofarm-ponorogo', 'twin-arrow-shah-alam', 'agro-berjaya-mojokerto', 'diversatech-bangi', 'farmhannong-ulsan', 'jcam-agri-tokyo', 'jieh-ming-new-taipei', 'mica-shelton', 'ac-profil-huttwil']) {
      const lead = publicLeads.find((item) => item.id === id)!
      expect(lead.supplierCompetitorCheck?.checkedAt).toBe('2026-09-26')
      expect(lead.supplierCompetitorCheck?.conclusion).toMatch(/未显示/)
    }
  })
})
