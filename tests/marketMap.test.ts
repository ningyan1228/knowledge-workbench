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
    expect(publicLeads).toHaveLength(74)
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

  it('keeps the new Mexico and Japan candidates tied to distinct downstream evidence', () => {
    const ceccan = publicLeads.find((lead) => lead.id === 'ceccan-san-jose-iturbide')!
    const centralChemical = publicLeads.find((lead) => lead.id === 'central-chemical-ube')!
    expect(ceccan.companyEvidence).toMatchObject({ applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' })
    expect(ceccan.profile.departmentEmails[0]).toMatchObject({ department: 'Sales', email: 'ventas@ceccan.com.mx' })
    expect(centralChemical.companyEvidence).toMatchObject({ applicationLayer: 'tds-verified', applicationId: 'coated-urea' })
    expect(centralChemical.profile.generalPhone).toBe('+81 836-34-5848')
    expect(centralChemical.profile.contacts).toHaveLength(0)
  })

  it('keeps Mexico water-based ink and South Africa PVC compound leads distinct from confirmed purchases', () => {
    const tinta = publicLeads.find((lead) => lead.id === 'tintas-prisma-tlalnepantla')!
    const alpha = publicLeads.find((lead) => lead.id === 'alpha-plast-devland')!
    expect(tinta.companyEvidence).toMatchObject({ applicationLayer: 'market-extended', applicationId: 'waterborne-ink-anchorage-on-pp-pe' })
    expect(tinta.profile.departmentEmails[0]).toMatchObject({ department: 'Sales', email: 'ventas@tintasprisma.com.mx' })
    expect(alpha.companyEvidence).toMatchObject({ applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' })
    expect(alpha.profile.departmentEmails[0]).toMatchObject({ department: 'Sales', email: 'sales@alphaplast.co.za' })
    for (const lead of [tinta, alpha]) {
      expect(lead.demandSideReason).toMatch(/未证明/)
      expect(lead.profile.contacts).toHaveLength(0)
      expect(lead.profile.contactPage).toMatch(/^https:\/\//)
    }
  })

  it('records Mivena as a coated-fertilizer manufacturer without inventing a procurement contact', () => {
    const mivena = publicLeads.find((lead) => lead.id === 'mivena-maastricht')!
    expect(mivena.companyEvidence).toMatchObject({ applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' })
    expect(mivena.profile.contacts[0]).toMatchObject({ name: 'Coert Rasenberg', title: 'CEO Managing Partner', department: 'Management', verifiedAt: '2026-09-27' })
    expect(mivena.profile.contacts[0].email).toBeUndefined()
    expect(mivena.profile.generalEmail).toBe('info@mivena.nl')
    expect(mivena.demandSideReason).toMatch(/未证明其采购外部包衣树脂/)
  })

  it('qualifies the three new downstream companies without treating application fit as a purchase claim', () => {
    const greenbest = publicLeads.find((lead) => lead.id === 'greenbest-henstridge')!
    const palini = publicLeads.find((lead) => lead.id === 'palini-vernici-pisogne')!
    const sankhla = publicLeads.find((lead) => lead.id === 'sankhla-industries-bengaluru')!
    expect(greenbest.companyEvidence).toMatchObject({ applicationLayer: 'tds-verified', applicationId: 'coated-urea' })
    expect(greenbest.profile.contacts[0]).toMatchObject({ name: 'Jack Baxter', title: 'Sales and Product Development', verifiedAt: '2026-09-27' })
    expect(greenbest.profile.contacts[0].email).toBeUndefined()
    expect(palini.companyEvidence).toMatchObject({ applicationLayer: 'tds-verified', applicationId: 'abs-surface-treatment' })
    expect(palini.profile.departmentEmails[0]).toMatchObject({ department: 'Technical', email: 'lab@palinal.com' })
    expect(sankhla.companyEvidence).toMatchObject({ applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' })
    expect(sankhla.demandSideReason).toMatch(/不证明其使用 ELO/)
    for (const lead of [greenbest, palini, sankhla]) {
      expect(lead.supplierCompetitorCheck).toMatchObject({ checkedAt: '2026-09-27' })
      expect(lead.supplierCompetitorCheck?.conclusion).toMatch(/未显示/)
      expect(lead.profile.contactPage).toMatch(/^https:\/\//)
    }
  })

  it('requires Harrell’s own coating facility evidence without inventing a buyer or purchase', () => {
    const harrells = publicLeads.find((lead) => lead.id === 'harrells-sylacauga')!
    expect(harrells.companyEvidence).toMatchObject({ applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' })
    expect(harrells.targetCompanyTypeId).toBe('controlled-release-fertilizer-manufacturer')
    expect(harrells.demandSideReason).toMatch(/未证明其外购我方包衣原料/)
    expect(harrells.profile.contactPage).toBe('https://harrells.com/contact/')
    expect(harrells.profile.contacts).toHaveLength(0)
    expect(harrells.profile.generalEmail).toBeUndefined()
  })

  it('keeps new Brazilian coating-fertilizer factories separate from confirmed purchases', () => {
    for (const id of ['fortgreen-varginha', 'grupo-equilibrio-catalao']) {
      const lead = publicLeads.find((item) => item.id === id)!
      expect(lead.country).toBe('Brazil')
      expect(lead.productId).toBe('fertilizer-coating')
      expect(lead.companyEvidence).toMatchObject({ applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' })
      expect(lead.demandSideReason).toMatch(/未证明/)
      expect(lead.supplierCompetitorCheck).toMatchObject({ checkedAt: '2026-09-27' })
      expect(lead.profile.contactPage).toMatch(/^https:\/\//)
      expect(lead.profile.contacts).toHaveLength(0)
    }
  })

  it('qualifies Adubos Paranaíba by its coated compound fertilizer, not a generic fertilizer label', () => {
    const lead = publicLeads.find((item) => item.id === 'adubos-paranaiba-uberlandia')!
    expect(lead.companyEvidence).toMatchObject({ applicationLayer: 'tds-verified', applicationId: 'coated-compound-fertilizer' })
    expect(lead.targetCompanyTypeId).toBe('coated-compound-fertilizer-manufacturer')
    expect(lead.demandSideReason).toMatch(/未证明其采购我方包衣原料/)
    expect(lead.supplierCompetitorCheck).toMatchObject({ checkedAt: '2026-09-27' })
    expect(lead.profile.contacts).toHaveLength(0)
    expect(lead.profile.generalPhone).toBe('+55 34 3233-9600')
  })

  it('adds four dated demand-side candidates with attributable functional contacts', () => {
    const indigrow = publicLeads.find((lead) => lead.id === 'indigrow-brimpton')!
    const lebanon = publicLeads.find((lead) => lead.id === 'lebanon-seaboard-lebanon')!
    const follmann = publicLeads.find((lead) => lead.id === 'follmann-minden')!
    const mapei = publicLeads.find((lead) => lead.id === 'mapei-india-bengaluru')!

    expect(indigrow.companyEvidence).toMatchObject({ applicationLayer: 'tds-verified', applicationId: 'coated-urea' })
    expect(indigrow.profile.departmentEmails[0]).toMatchObject({ department: 'Technical', email: 'aghort@indigrow.com' })
    expect(lebanon.companyEvidence).toMatchObject({ applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' })
    expect(lebanon.profile.departmentEmails).toEqual(expect.arrayContaining([
      expect.objectContaining({ email: 'Purchasing@lebsea.com' }),
      expect.objectContaining({ department: 'Production', email: 'Operations@lebsea.com' }),
    ]))
    expect(follmann.companyEvidence).toMatchObject({ applicationLayer: 'market-extended', applicationId: 'waterborne-ink-anchorage-on-pp-pe' })
    expect(follmann.profile.contacts[0]).toMatchObject({ name: 'Roland Geiselhart', department: 'Technical', verifiedAt: '2026-09-28' })
    expect(mapei.companyEvidence).toMatchObject({ applicationLayer: 'tds-verified', applicationId: 'adhesives' })
    expect(mapei.profile.contacts).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'Vasudevan MK', department: 'Procurement' }),
      expect.objectContaining({ name: 'Alok Shrivastava', department: 'Production' }),
      expect.objectContaining({ name: 'Santhosh M Prakash', department: 'Technical' }),
    ]))

    for (const lead of [indigrow, lebanon, follmann, mapei]) {
      expect(lead.commercialRole).toBe('demand_side')
      expect(lead.demandSideReason).toMatch(/未证明/)
      expect(lead.supplierCompetitorCheck).toMatchObject({ checkedAt: '2026-09-28' })
      expect(lead.supplierCompetitorCheck?.conclusion).toMatch(/未显示/)
    }
  })

  it('adds three further verified demand-side candidates without inventing named contacts', () => {
    const plantacote = publicLeads.find((lead) => lead.id === 'plantacote-herentals')!
    const siegwerk = publicLeads.find((lead) => lead.id === 'siegwerk-siegburg')!
    const jowat = publicLeads.find((lead) => lead.id === 'jowat-detmold')!

    expect(plantacote.companyEvidence).toMatchObject({ applicationLayer: 'tds-verified', applicationId: 'coated-compound-fertilizer' })
    expect(plantacote.profile.generalEmail).toBe('info@plantacote.com')
    expect(siegwerk.companyEvidence).toMatchObject({ applicationLayer: 'market-extended', applicationId: 'waterborne-ink-anchorage-on-pp-pe' })
    expect(siegwerk.profile.departmentEmails[0]).toMatchObject({ department: 'Technical', email: 'contact.inkjet@siegwerk.com' })
    expect(jowat.companyEvidence).toMatchObject({ applicationLayer: 'tds-verified', applicationId: 'adhesives' })
    expect(jowat.profile.generalEmail).toBe('info@jowat.de')

    for (const lead of [plantacote, siegwerk, jowat]) {
      expect(lead.commercialRole).toBe('demand_side')
      expect(lead.demandSideReason).toMatch(/未证明/)
      expect(lead.supplierCompetitorCheck).toMatchObject({ checkedAt: '2026-09-28' })
      expect(lead.supplierCompetitorCheck?.conclusion).toMatch(/未显示/)
      expect(lead.profile.contacts).toHaveLength(0)
    }
  })

  it('adds five more verified downstream manufacturers with attributable contacts', () => {
    const knox = publicLeads.find((lead) => lead.id === 'knox-fertilizer-knox')!
    const andersons = publicLeads.find((lead) => lead.id === 'andersons-maumee')!
    const doneck = publicLeads.find((lead) => lead.id === 'doneck-euroflex-grevenmacher')!
    const wikoff = publicLeads.find((lead) => lead.id === 'wikoff-fort-mill')!
    const aurora = publicLeads.find((lead) => lead.id === 'aurora-material-streetsboro')!

    expect(knox.companyEvidence).toMatchObject({ applicationLayer: 'tds-verified', applicationId: 'coated-urea' })
    expect(knox.profile.generalEmail).toBe('info@knoxfert.com')
    expect(andersons.companyEvidence).toMatchObject({ applicationLayer: 'tds-verified', applicationId: 'coated-urea' })
    expect(andersons.profile.departmentEmails[0]).toMatchObject({ email: 'lawnlogistics@andersonsinc.com' })
    expect(doneck.companyEvidence).toMatchObject({ applicationLayer: 'market-extended', applicationId: 'waterborne-ink-anchorage-on-pp-pe' })
    expect(doneck.profile.contacts[0]).toMatchObject({ name: 'Edgar Becker', department: 'Sales' })
    expect(wikoff.companyEvidence).toMatchObject({ applicationLayer: 'market-extended', applicationId: 'waterborne-ink-anchorage-on-pp-pe' })
    expect(wikoff.profile.contacts).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'Sachin Nayar', department: 'Technical' }),
      expect.objectContaining({ name: 'David Donnelly', department: 'Production' }),
    ]))
    expect(aurora.companyEvidence).toMatchObject({ applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' })
    expect(aurora.profile.contacts[0]).toMatchObject({ name: 'Chris Coco', title: 'Business Development Manager, Flexible PVC' })

    for (const lead of [knox, andersons, doneck, wikoff, aurora]) {
      expect(lead.commercialRole).toBe('demand_side')
      expect(lead.demandSideReason).toMatch(/未证明/)
      expect(lead.supplierCompetitorCheck).toMatchObject({ checkedAt: '2026-09-28' })
      expect(lead.supplierCompetitorCheck?.conclusion).toMatch(/未显示/)
    }
  })

  it('keeps a dated supplier and competitor exclusion check for newly researched candidates', () => {
    for (const id of ['simplot-boise', 'agrofarm-ponorogo', 'twin-arrow-shah-alam', 'agro-berjaya-mojokerto', 'diversatech-bangi', 'farmhannong-ulsan', 'jcam-agri-tokyo', 'jieh-ming-new-taipei', 'vinyl-base-ipoh', 'schramm-coatings-offenbach', 'periwal-bhiwadi', 'turf-care-martins-ferry', 'omega-polimeros-trujui', 'supernovae-funza', 'vivacor-diadema', 'agrobiotech-jardinopolis', 'mica-shelton', 'ac-profil-huttwil', 'astra-chemtech-mumbai', 'nam-ah-ipoh', 'dacarto-osasco', 'flint-group-malmo', 'inx-schaumburg', 'shakun-vadodara', 'pvc-colouring-ahmedabad', 'sun-chemical-parsippany', 'crf-malaysia-kuala-lumpur', 'cai-georgetown', 'applied-db-samut-prakan', 'ceccan-san-jose-iturbide', 'central-chemical-ube', 'tintas-prisma-tlalnepantla', 'alpha-plast-devland', 'mivena-maastricht', 'greenbest-henstridge', 'palini-vernici-pisogne', 'sankhla-industries-bengaluru', 'harrells-sylacauga']) {
      const lead = publicLeads.find((item) => item.id === id)!
      expect(lead.supplierCompetitorCheck?.checkedAt).toBe(['ceccan-san-jose-iturbide', 'central-chemical-ube', 'tintas-prisma-tlalnepantla', 'alpha-plast-devland', 'mivena-maastricht', 'greenbest-henstridge', 'palini-vernici-pisogne', 'sankhla-industries-bengaluru', 'harrells-sylacauga'].includes(id) ? '2026-09-27' : '2026-09-26')
      expect(lead.supplierCompetitorCheck?.conclusion).toMatch(/未显示/)
    }
  })
})
