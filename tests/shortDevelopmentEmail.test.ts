import { describe, expect, it } from 'vitest'
import { publicLeads } from '../src/lib/productMarketMap'
import { createShortDevelopmentEmail } from '../src/lib/shortDevelopmentEmail'
import { leadEmailFacts } from '../src/lib/leadEmailFacts'
import { conciseCompanyFact } from '../src/lib/conciseLeadEmailFacts'
import { withProvedFirstContact } from './fixtures/contactEvidence'

function draftFor(id: string) {
  const lead = publicLeads.find((item) => item.id === id)!
  const draft = createShortDevelopmentEmail(lead)
  expect(draft).not.toBeNull()
  return draft!
}

describe('ready-to-copy short development emails', () => {
  it('prepares a reviewable email only after the saved independent exclusion check is complete', () => {
    expect(new Set(publicLeads.map((lead) => lead.id)).size).toBe(publicLeads.length)
    expect(new Set(Object.keys(leadEmailFacts))).toEqual(new Set(publicLeads.map((lead) => lead.id)))
    expect(new Set(Object.values(leadEmailFacts)).size).toBe(publicLeads.length)
    for (const lead of publicLeads) {
      const draft = createShortDevelopmentEmail(lead)
      if (!lead.supplierCompetitorCheck?.conclusion || !lead.supplierCompetitorCheck.checkedAt) {
        expect(draft, lead.id).toBeNull()
        continue
      }
      expect(draft, lead.id).not.toBeNull()
      expect(draft!.body, lead.id).toContain(conciseCompanyFact(lead.id))
      expect(draft!.body.indexOf(conciseCompanyFact(lead.id)!)).toBeLessThan(draft!.body.indexOf('I’m Zhiwu'))
      expect(draft!.text).toContain('Ningbo Neon Lion Technology Co., Ltd.')
      expect(draft!.text).toContain('zhiwu@neonlion.cn')
      expect(draft!.text).not.toContain('+86 17852862361')
      expect(draft!.text).not.toMatch(/\b(?:Tel|Phone|Mobile):/i)
      expect(draft!.evidenceUrl).toBe(lead.companyEvidence.sourceUrl)
      expect(draft!.text).not.toMatch(/much lower price|equivalent substitute|you (currently )?(buy|need|use) our/i)
    }
  })

  it('keeps every eligible first contact concise with one question and no unsolicited data list', () => {
    for (const lead of publicLeads) {
      const draft = createShortDevelopmentEmail(lead)
      if (!draft) continue
      expect(draft.style).toBe('concise')
      expect(draft.body.split(/\s+/).length, lead.id).toBeLessThanOrEqual(95)
      expect(draft.body.match(/\?/g), lead.id).toHaveLength(1)
      expect(draft.body).not.toMatch(/TDS|\bour catalog|catalog attached|quotation|target price|\bMOQ\b|free sample|lowest price|hydroxyl value|epoxy value/i)
      expect(draft.subject).not.toMatch(/TDS|\blowest\b|\bbest\b|^Re:/i)
      expect(draft.body).not.toMatch(/who (handles|would)|right person|point me|forward (this|the)|refer (me|a)|purchasing colleague/i)
      const legacy = createShortDevelopmentEmail(lead, undefined, 'legacy')!
      expect(legacy.body).toContain(leadEmailFacts[lead.id])
      expect(legacy.body.split(/\s+/).length).toBeGreaterThan(draft.body.split(/\s+/).length)
    }
  })

  it('keeps Troforte’s coated-fertilizer facts distinct from claims about our material', () => {
    const draft = draftFor('troforte-innovations-wangara')
    expect(draft.body).toContain('polymer-coated')
    expect(draft.body).toContain('reactive raw material for polyurethane fertilizer coatings')
    expect(draft.body).not.toMatch(/you (currently )?(need|buy|use) our/i)
  })

  it('uses a sourced NL-W1201 wood-coating opening', () => {
    const draft = draftFor('polyvine-cheddar')
    expect(draft.body).toContain('2K-POLY86 is a two-pack water-based polyurethane varnish')
    expect(draft.body).toContain('NL-W1201')
    expect(draft.body).toContain('water-based polyolefin dispersion for primer and adhesion-promoting formulations')
    expect(draft.body).not.toMatch(/guaranteed|adhesion value/i)
  })

  it('connects the Feroni wood-stain fact to a functional product description without promising wood performance', () => {
    const draft = draftFor('colorificio-feroni-oppeano')
    expect(draft.body).toContain('Your W1500 series is a water-based acrylic wood stain')
    expect(draft.body).toContain('water-based polyolefin dispersion for primer and adhesion-promoting formulations')
    expect(draft.body).toContain('Would evaluating this material for your wood coatings')
    expect(draft.body).not.toContain('a water-based surface treatment material.')
    expect(draft.body).not.toMatch(/improves? (your|W1500)|your adhesion problem|compatible with your/i)
  })

  it('keeps primer trials distinct from direct ink compatibility and from a customer’s pretreated film', () => {
    const draft = draftFor('teknova-esenyurt')
    expect(draft.body).toContain('with corona treatment')
    expect(draft.body).toContain('as a primer for your water-based ink applications')
    expect(draft.body).not.toMatch(/untreated.PP|food.contact|add it to your ink|replace.*corona/i)
  })

  it('describes ELO functions differently for PVC and coatings, preserving the tentative evaluation language', () => {
    const pvc = draftFor('dacarto-osasco')
    const coating = draftFor('vernital-cercola')
    expect(pvc.body).toContain('secondary-plasticizer evaluation in PVC formulations')
    expect(coating.body).toContain('flexibility and resin-modification trials in coatings')
    expect(coating.body).not.toMatch(/ELO (improves|provides|guarantees)|corrosion resistance|salt.spray|tested|approved/i)
  })

  it('does not promise anticorrosion performance for ELO coating prospects', () => {
    const draft = draftFor('vernital-cercola')
    expect(draft.body).toContain('Vernitex range includes two-component epoxy anticorrosion coatings')
    expect(draft.body).toContain('epoxidized linseed oil (ELO)')
    expect(draft.body).not.toMatch(/corrosion resistance|tested|approved|qualified/i)
  })

  it('keeps MARINCOAT outreach limited to a possible coating formulation fit', () => {
    const draft = draftFor('marincoat-calvignasco')
    expect(draft.body).toContain('formulating and producing coatings for pipelines')
    expect(draft.body).toContain('epoxidized linseed oil (ELO)')
    expect(draft.body).not.toMatch(/corrosion resistance|tested|approved|qualified|currently uses/i)
  })

  it('does not generate a draft for a supplier or missing source', () => {
    const lead = publicLeads[0]
    expect(createShortDevelopmentEmail({ ...lead, commercialRole: 'peer_supplier' })).toBeNull()
    expect(createShortDevelopmentEmail({ ...lead, companyEvidence: { ...lead.companyEvidence, sourceUrl: '' } })).toBeNull()
    expect(createShortDevelopmentEmail({ ...lead, id: 'not-yet-reviewed' })).toBeNull()
  })

  it('addresses a named person only when their direct business email is sourced', () => {
    expect(draftFor('teknos-helsinki').body).toMatch(/^Hi Teknos Oy \(Teknos Group\) Team,/)
    expect(createShortDevelopmentEmail(withProvedFirstContact(publicLeads.find((item) => item.id === 'teknos-helsinki')!))?.body).toMatch(/^Hi Pasi,/)
    expect(draftFor('polyvine-cheddar').body).toMatch(/^Hi Polyvine Limited Team,/)
    const lead = publicLeads.find((item) => item.id === 'teknos-helsinki')!
    const withoutDirectEmail = { ...lead, profile: { ...lead.profile, contacts: lead.profile.contacts.map((contact) => ({ ...contact, email: undefined })) } }
    expect(createShortDevelopmentEmail(withoutDirectEmail)?.body).toMatch(/^Hi Teknos Oy \(Teknos Group\) Team,/)
  })
  it('withholds drafts with missing exclusion, out-of-scope market or an inconsistent application path', () => {
    const lead = publicLeads.find((item) => item.id === 'polyvine-cheddar')!
    expect(createShortDevelopmentEmail({ ...lead, supplierCompetitorCheck: undefined })).toBeNull()
    expect(createShortDevelopmentEmail({ ...lead, country: 'Taiwan (ROC)' })).toBeNull()
    expect(createShortDevelopmentEmail({ ...lead, companyEvidence: { ...lead.companyEvidence, applicationId: 'coated-urea' } })).toBeNull()
    expect(createShortDevelopmentEmail({ ...lead, companyEvidence: { ...lead.companyEvidence, verifiedAt: '2026-02-31' } })).toBeNull()
    expect(createShortDevelopmentEmail(publicLeads.find((item) => item.id === 'haifa-israel')!)).toBeNull()
  })

  it('does not invent a name through an override or use an undated named contact', () => {
    const lead = publicLeads.find((item) => item.id === 'teknos-helsinki')!
    expect(createShortDevelopmentEmail(lead, 'Invented Buyer')?.body).toMatch(/^Hi Teknos Oy \(Teknos Group\) Team,/)
    const unverified = { ...lead, profile: { ...lead.profile, contacts: lead.profile.contacts.map((person) => ({ ...person, verifiedAt: undefined })) } }
    expect(createShortDevelopmentEmail(unverified)?.body).not.toMatch(/^Hi Pasi,/)
    expect(createShortDevelopmentEmail(unverified, 'Pasi Virtanen')?.body).not.toMatch(/^Hi Pasi,/)
  })

})
