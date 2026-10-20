import { describe, expect, it } from 'vitest'
import { publicLeads } from '../src/lib/productMarketMap'
import { functionalProductPitch } from '../src/lib/functionalProductPitch'

describe('sourced functions follow the product and application', () => {
  it('keeps untreated PP separate from wood, ink and aluminum evaluation', () => {
    const pp=publicLeads.find(lead=>lead.id==='schramm-coatings-offenbach')!
    expect(functionalProductPitch(pp)?.introduction).toContain('primarily used in untreated-PP primers')
    for(const id of ['colorificio-feroni-oppeano','teknova-esenyurt','solventex-sao-paulo']){
      const pitch=functionalProductPitch(publicLeads.find(lead=>lead.id===id)!)!
      expect(pitch.introduction).toContain('polyolefin dispersion')
      expect(pitch.introduction).not.toContain('untreated-PP')
      expect(pitch.limits).toMatch(/Do not transfer|do not imply/)
    }
  })
  it('describes our fertilizer route without attributing it to neem, sulfur or inhibitor-coated customers', () => {
    for(const id of ['pvcfc-ca-mau','kribhco-hazira','vital-agri-nutrients-lahore']){
      const pitch=functionalProductPitch(publicLeads.find(lead=>lead.id===id)!)!
      expect(pitch.introduction).toContain('We supply a reactive raw material')
      expect(pitch.introduction).not.toMatch(/your (polyurethane|polymer)|same coating|release period/i)
      expect(pitch.limits).toContain('not the customer’s existing coating chemistry')
    }
  })
  it('does not turn ELO research into a demonstrated anticorrosion result or regulated-use approval', () => {
    const coating=functionalProductPitch(publicLeads.find(lead=>lead.id==='vernital-cercola')!)!
    expect(coating.introduction).toContain('trials in coatings')
    expect(coating.introduction).not.toMatch(/anticorrosion|chemical resistance|guarantee/i)
    expect(coating.limits).toContain('not a test of this grade')
    const pvc=functionalProductPitch(publicLeads.find(lead=>lead.id==='vinyl-base-ipoh')!)!
    expect(pvc.introduction).not.toMatch(/medical|approved|food.contact/)
    expect(pvc.limits).toContain('PVC requires the saved independent extension')
  })
})
