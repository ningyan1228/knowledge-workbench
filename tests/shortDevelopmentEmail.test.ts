import { describe, expect, it } from 'vitest'
import { publicLeads } from '../src/lib/productMarketMap'
import { createShortDevelopmentEmail } from '../src/lib/shortDevelopmentEmail'

function draftFor(id: string) {
  const lead = publicLeads.find((item) => item.id === id)!
  const draft = createShortDevelopmentEmail(lead)
  expect(draft).not.toBeNull()
  return draft!
}

describe('ready-to-copy short development emails', () => {
  it('prepares a reviewable first email for every currently qualified demand-side company', () => {
    expect(publicLeads).toHaveLength(82)
    for (const lead of publicLeads) {
      const draft = createShortDevelopmentEmail(lead)
      expect(draft, lead.id).not.toBeNull()
      expect(draft!.text).toContain(lead.company)
      expect(draft!.text).toContain('Ningbo Neon Lion Technology Co., Ltd.')
      expect(draft!.text).toContain('zhiwu@neonlion.cn')
      expect(draft!.text).toContain('+86 17852862361')
      expect(draft!.evidenceUrl).toBe(lead.companyEvidence.sourceUrl)
      expect(draft!.text).not.toMatch(/much lower price|equivalent substitute|you (currently )?(buy|need|use) our/i)
    }
  })

  it('keeps Haifa’s controlled-release business distinct from its unverified coating chemistry', () => {
    const draft = draftFor('haifa-israel')
    expect(draft.body).toContain('controlled-release fertilizer products')
    expect(draft.body).toContain('fertilizer coating material')
    expect(draft.body).not.toMatch(/polyurethane|Multicote.*uses/i)
  })

  it('uses a sourced, relevant NL-W1201 primer opening', () => {
    const draft = draftFor('pol-coatings-twello')
    expect(draft.body).toContain('primers or coatings for PP surfaces')
    expect(draft.body).toContain('NL-W1201')
    expect(draft.body).not.toMatch(/guaranteed|adhesion value/i)
  })

  it('does not promise anticorrosion performance for ELO coating prospects', () => {
    const draft = draftFor('vernital-cercola')
    expect(draft.body).toContain('industrial protective coatings')
    expect(draft.body).toContain('epoxidized linseed oil (ELO)')
    expect(draft.body).not.toMatch(/corrosion resistance|tested|approved|qualified/i)
  })

  it('keeps MARINCOAT outreach limited to a possible coating formulation fit', () => {
    const draft = draftFor('marincoat-calvignasco')
    expect(draft.body).toContain('coating formulations')
    expect(draft.body).toContain('epoxidized linseed oil (ELO)')
    expect(draft.body).not.toMatch(/corrosion resistance|tested|approved|qualified|currently uses/i)
  })

  it('does not generate a draft for a supplier or missing source', () => {
    const lead = publicLeads[0]
    expect(createShortDevelopmentEmail({ ...lead, commercialRole: 'peer_supplier' })).toBeNull()
    expect(createShortDevelopmentEmail({ ...lead, companyEvidence: { ...lead.companyEvidence, sourceUrl: '' } })).toBeNull()
  })
})
