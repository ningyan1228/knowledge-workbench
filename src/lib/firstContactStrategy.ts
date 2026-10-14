import type { PublicLead } from './productMarketMap'
import { contactRolePriority, namedEmailVerified, selectBusinessRecipient } from './contactEvidence'

/** Saved application evidence supplies the topic; it never confirms a current purchase. */
const contexts: Record<string, { application: string; subject: string }> = {
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
export function firstContactStrategy(lead: PublicLead, recipientName?: string | null) {
  const applicationId = lead.companyEvidence.applicationId
  const context = contexts[applicationId] ?? (lead.productId === 'fertilizer-coating'
    ? { application: 'fertilizer coating formulations', subject: 'fertilizer-coating materials' }
    : lead.productId === 'elo'
      ? { application: 'coating formulations', subject: 'coating raw materials' }
      : { application: 'primer formulations', subject: 'primer materials' })
  const recipient = selectBusinessRecipient(lead)
  const contact = lead.profile.contacts.find((person) => person.name === (recipientName === undefined ? recipient?.name : recipientName) && namedEmailVerified(lead.company, person))
  const knownEvaluationRole = Boolean(contact && contactRolePriority(`${contact.department ?? ''} ${contact.title ?? ''}`) <= 1)
    || Boolean(!contact && !recipient?.name && recipient && recipient.priority <= 1)
  const approach = knownEvaluationRole ? 'relevance-check' : contact ? 'person-check' : 'route-to-person'
  const question = approach === 'relevance-check'
    ? `Would evaluating this material for your ${context.application} be relevant to your team?`
    : approach === 'person-check'
      ? `Are you the right person to contact about raw materials for your ${context.application}?`
      : `Who handles raw-material evaluation or purchasing for your ${context.application}?`
  return { approach, question, application: context.application, subject: `${outreachCompanyLabel(lead.company)} — ${context.subject}`, buyingNeed: 'unconfirmed' as const }
}
