import type { PublicLead } from './productMarketMap'

export type FunctionalProductPitch = {
  introduction: string
  cardEvaluation: string
  productFacts: readonly string[]
  limits: string
  question?: string
}

/** Product-side facts from the user-supplied TDS/product introduction. An
 * evaluation topic is not evidence of a customer's problem or compatibility. */
export function functionalProductPitch(lead: PublicLead): FunctionalProductPitch | null {
  const application = lead.companyEvidence.applicationId
  if (lead.productId === 'fertilizer-coating') {
    return {
      introduction: 'We supply a reactive raw material for polyurethane fertilizer coatings, compatible with drum and fluidized-bed coating processes.',
      cardEvaluation: '反应型原料（我方聚氨酯路线）；鼓式／流化床包膜评估',
      productFacts: ['Reactive raw material for fertilizer-coating formulations, including polyurethane-coated urea.', 'The product introduction lists drum and fluidized-bed coating processes.'],
      limits: 'Polyurethane describes our raw-material route, not the customer’s existing coating chemistry. No guaranteed release period, process fit or replacement claim.',
    }
  }
  if (lead.productId === 'nl-w1201') {
    const ink = application === 'waterborne-ink-anchorage-on-pp-pe'
    const pp = application === 'untreated-pp-primer'
    const substrate = ({ 'untreated-pp-primer': '未处理 PP', 'pe-primer': 'PE', 'opp-primer': 'OPP', 'pet-primer': 'PET', 'abs-surface-treatment': 'ABS', 'pvc-primer': 'PVC', 'glass-adhesion-promotion': '玻璃', 'aluminum-primer': '铝材', 'wood-surface-treatment': '木材' } as Record<string, string>)[application]
    return {
      introduction: pp
        ? 'We supply NL-W1201, a water-based polyolefin adhesion promoter primarily used in untreated-PP primers.'
        : 'We supply NL-W1201, a water-based polyolefin dispersion for primer and adhesion-promoting formulations.',
      cardEvaluation: ink ? '水性聚烯烃分散体；水性油墨场景的底涂评估' : `水性聚烯烃分散体；${substrate ?? '基材'}底涂／附着力促进评估`,
      productFacts: ['Water-based polyolefin emulsion / resin dispersion.', 'Positioned as a primer and adhesion promoter, primarily for untreated PP.'],
      limits: ink
        ? 'The ink application requires the saved independent extension source. Propose primer evaluation; do not imply direct ink-additive compatibility, untreated-film performance or food-contact approval.'
        : 'Recommended substrates are evaluation directions. Do not transfer untreated-PP performance to wood, ABS, PVC, aluminum or pretreated PP, or claim a measured adhesion improvement.',
      ...(ink ? { question: 'Would evaluating this material as a primer for your water-based ink applications be relevant to your team?' } : {}),
    }
  }
  if (lead.productId !== 'elo') return null
  if (application === 'elo-pvc-plasticizer') return {
    introduction: 'We supply epoxidized linseed oil (ELO), a bio-based additive for secondary-plasticizer evaluation in PVC formulations.',
    cardEvaluation: '生物基添加剂；PVC 辅助增塑评估',
    productFacts: ['Linseed-oil-derived bio-based additive; TDS lists polymer-plasticizer applications.', 'The saved independent PVC extension supports secondary-plasticizer evaluation.'],
    limits: 'PVC requires the saved independent extension. No primary-plasticizer replacement, medical/food-contact approval or guaranteed flexibility claim.',
  }
  if (application === 'adhesives') return {
    introduction: 'We supply epoxidized linseed oil (ELO), an epoxy-functional, bio-based additive for flexibility and adhesion trials in adhesive formulations.',
    cardEvaluation: '含反应性环氧基；胶黏剂柔韧性／黏结评估',
    productFacts: ['Linseed-oil-derived bio-based functional additive with reactive epoxy groups.', 'TDS lists adhesive applications and formulation-dependent flexibility / adhesion contributions.'],
    limits: 'Evaluation only; no compatibility, cure, bond-strength or adhesive-performance guarantee.',
  }
  if (application === 'coatings' || application === 'elo-anticorrosion-coating-research') return {
    introduction: 'We supply epoxidized linseed oil (ELO), an epoxy-functional, bio-based additive for flexibility and resin-modification trials in coatings.',
    cardEvaluation: '含反应性环氧基；涂料柔韧性／树脂改性评估',
    productFacts: ['Linseed-oil-derived bio-based functional additive with reactive epoxy groups.', 'TDS lists coatings / resin modification and formulation-dependent flexibility contributions.'],
    limits: 'No proven anticorrosion, chemical resistance, cure-system compatibility or product-specific performance claim. Independent anticorrosion research is not a test of this grade in the customer’s formulation.',
  }
  if (application === 'resin-modification') return {
    introduction: 'We supply epoxidized linseed oil (ELO), a bio-based additive with reactive epoxy groups for resin-modification trials.',
    cardEvaluation: '含反应性环氧基；树脂改性评估',
    productFacts: ['Linseed-oil-derived bio-based functional additive with reactive epoxy groups.', 'TDS lists resin modification.'],
    limits: 'No guaranteed reaction, cure-system compatibility or final resin performance.',
  }
  if (application === 'polymer-plasticizer' || application === 'polymer-stabilizer') return {
    introduction: application === 'polymer-plasticizer'
      ? 'We supply epoxidized linseed oil (ELO), a bio-based additive for plasticization trials in polymer formulations.'
      : 'We supply epoxidized linseed oil (ELO), a bio-based additive for thermal-stability trials in polymer formulations.',
    cardEvaluation: application === 'polymer-plasticizer' ? '生物基添加剂；聚合物配方增塑评估' : '生物基添加剂；聚合物配方热稳定性评估',
    productFacts: ['TDS lists polymer-plasticizer and polymer-stabilizer applications, with formulation-dependent flexibility and thermal-stability contributions.'],
    limits: 'No polymer-specific compatibility or performance guarantee; PVC requires an independent extension source.',
  }
  if (application === 'inks' || application === 'sealants') return {
    introduction: `We supply epoxidized linseed oil (ELO), an epoxy-functional, bio-based additive for flexibility trials in ${application === 'inks' ? 'ink' : 'sealant'} formulations.`,
    cardEvaluation: `含反应性环氧基；${application === 'inks' ? '油墨' : '密封胶'}柔韧性评估`,
    productFacts: ['Linseed-oil-derived bio-based functional additive with reactive epoxy groups.', 'TDS lists ink and sealant applications and formulation-dependent flexibility contributions.'],
    limits: 'No specific formulation compatibility, performance, food-contact or regulated-use approval.',
  }
  return null
}
