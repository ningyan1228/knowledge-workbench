import type { PublicLead } from './productMarketMap'

/** Saved application evidence supplies the topic; it never confirms a current purchase. */
const contexts: Record<string, { application: string; subject: string }> = {
  'nl8260-pp-opp-inks': { application: 'PP/OPP ink formulations', subject: 'PP/OPP ink adhesion evaluation' },
  'nl8260-pp-tpo-coatings': { application: 'PP/TPO plastic coatings', subject: 'PP/TPO coating evaluation' },
  'nl8260-pe-coatings': { application: 'PE plastic coatings', subject: 'PE coating evaluation' },
  'nl8260-pvc-epdm-coatings': { application: 'PVC/EPDM coatings', subject: 'PVC/EPDM coating evaluation' },
  'nl8260-paper-coatings': { application: 'paper coatings', subject: 'paper coating evaluation' },
  'nl8260-adhesives': { application: 'adhesive formulations', subject: 'adhesive material evaluation' },
  'nlh860-plastic-bonding': { application: 'plastic-bonding formulations', subject: 'plastic bonding evaluation' },
  'nlh860-rubber-bonding': { application: 'rubber-bonding formulations', subject: 'rubber bonding evaluation' },
  'nlh860-waterborne-inks': { application: 'water-based inks', subject: 'water-based ink evaluation' },
  'nlh860-waterborne-varnishes': { application: 'water-based varnishes', subject: 'water-based varnish evaluation' },
  'nlh860-industrial-paints': { application: 'water-based industrial paints', subject: 'industrial paint evaluation' },
  'nlh860-wood-coatings': { application: 'water-based wood coatings', subject: 'wood coating evaluation' },
  'cpp-pp-tpo-primer': { application: 'PP plastic primers', subject: 'PP-primer material evaluation' },
  'cpp-pp-printing-ink': { application: 'PP printing inks', subject: 'PP-ink material evaluation' },
  'cpp-pp-tpo-adhesive': { application: 'PP laminating adhesives', subject: 'PP-adhesive material evaluation' },
  'untreated-pp-primer': { application: 'PP primers', subject: 'PP-primer materials' },
  'pe-primer': { application: 'PE primers', subject: 'PE-primer materials' },
  'opp-primer': { application: 'OPP primers', subject: 'OPP-primer materials' },
  'pet-primer': { application: 'PET primers', subject: 'PET-primer materials' },
  'abs-surface-treatment': { application: 'ABS coatings', subject: 'ABS-coating materials' },
  'pvc-primer': { application: 'PVC primers', subject: 'PVC-primer materials' },
  'glass-adhesion-promotion': { application: 'glass coatings', subject: 'glass-coating materials' },
  'aluminum-primer': { application: 'aluminum primers', subject: 'aluminum-primer materials' },
  'wood-surface-treatment': { application: 'wood coatings', subject: 'wood-coating materials' },
  'waterborne-ink-anchorage-on-pp-pe': { application: 'water-based inks', subject: 'water-based ink materials' },
  'elo-pvc-plasticizer': { application: 'PVC compounds', subject: 'PVC-compound materials' },
  adhesives: { application: 'adhesive formulations', subject: 'adhesive raw materials' },
  inks: { application: 'ink formulations', subject: 'ink raw materials' },
  sealants: { application: 'sealant formulations', subject: 'sealant raw materials' },
  'resin-modification': { application: 'resin formulations', subject: 'resin raw materials' },
  'polymer-plasticizer': { application: 'polymer formulations', subject: 'polymer raw materials' },
  'polymer-stabilizer': { application: 'polymer formulations', subject: 'polymer raw materials' },
}
export function outreachCompanyLabel(company: string) {
  // Only remove legal/explanatory suffixes from the saved name, never invent a brand.
  const label = company.replace(/\s*\([^()]*\)\s*$/, '').replace(/,?\s+(?:Limited|Ltd\.?|LLC|Inc\.?|S\.r\.l\.?|S\.A\.?|AG|Oy)$/i, '').trim()
  return label || company
}
export function firstContactStrategy(lead: PublicLead, _recipientName?: string | null) {
  const applicationId = lead.companyEvidence.applicationId
  const context = contexts[applicationId] ?? (lead.productId === 'fertilizer-coating'
    ? { application: 'fertilizer coating formulations', subject: 'fertilizer-coating materials' }
    : lead.productId === 'elo'
      ? { application: 'coating formulations', subject: 'coating raw materials' }
      : { application: 'primer formulations', subject: 'primer materials' })
  const approach = 'relevance-check' as const
  const question = `Would evaluating this material for your ${context.application} be relevant to your team?`
  return { approach, question, application: context.application, subject: `${outreachCompanyLabel(lead.company)} — ${context.subject}`, buyingNeed: 'unconfirmed' as const }
}
