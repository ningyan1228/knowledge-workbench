import {
  marketExtendedApplications,
  marketProducts,
  targetCompanyTypes,
  tdsVerifiedApplications,
  type PublicLead,
} from './productMarketMap'

export type ShortDevelopmentEmail = {
  subject: string
  body: string
  text: string
  evidenceUrl: string
  verifiedAt: string
}

const observations: Record<string, string> = {
  'controlled-release-fertilizer': 'controlled-release fertilizer products',
  'slow-release-fertilizer': 'slow-release fertilizer products',
  'coated-urea': 'coated urea products',
  'polyurethane-coated-urea': 'coated urea products',
  'coated-compound-fertilizer': 'coated compound fertilizers',
  'untreated-pp-primer': 'primers or coatings for PP surfaces',
  'pe-primer': 'primers or coatings for PE surfaces',
  'opp-primer': 'primers or coatings for OPP surfaces',
  'pet-primer': 'primers or coatings for PET surfaces',
  'abs-surface-treatment': 'coatings or surface treatments for ABS',
  'pvc-primer': 'primers or coatings for PVC surfaces',
  'aluminum-primer': 'coatings or primers for aluminum',
  'glass-adhesion-promotion': 'coatings or surface treatments for glass',
  'wood-surface-treatment': 'coatings or surface treatments for wood',
  'waterborne-ink-anchorage-on-pp-pe': 'water-based ink or primer formulations for PP/PE',
  'elo-pvc-plasticizer': 'PVC compound formulations',
  'elo-anticorrosion-coating-research': 'industrial protective coatings',
  'polymer-plasticizer': 'polymer formulations',
  'polymer-stabilizer': 'polymer formulations',
  coatings: 'coating formulations',
  adhesives: 'adhesive formulations',
  inks: 'ink formulations',
  sealants: 'sealant formulations',
  'resin-modification': 'resin formulations',
}

const productCopy: Record<PublicLead['productId'], { name: string; positioning: string }> = {
  'fertilizer-coating': {
    name: 'fertilizer coating material',
    positioning: 'a raw material for controlled- and slow-release fertilizer coating formulations',
  },
  'nl-w1201': {
    name: 'NL-W1201',
    positioning: 'a water-based surface treatment material for primer and adhesion-promoter formulation trials',
  },
  elo: {
    name: 'epoxidized linseed oil (ELO)',
    positioning: 'a bio-based functional additive for formulation evaluation',
  },
}

function recipientFor(lead: PublicLead) {
  const contact = lead.profile.contacts.find((item) =>
    item.source?.url && item.verifiedAt && /procurement|purchasing|sourcing|technical|r&d|research|product|production|plant/i.test(item.title ?? item.department ?? ''),
  )
  return contact ? `Hi ${contact.name.split(/\s+/)[0]},` : `Hi ${lead.company} Team,`
}

/** Pre-written, review-first first contact. It never asserts a purchase or product fit. */
export function createShortDevelopmentEmail(lead: PublicLead): ShortDevelopmentEmail | null {
  const evidence = lead.companyEvidence
  const targetType = targetCompanyTypes.find((item) => item.id === lead.targetCompanyTypeId)
  const application = (evidence.applicationLayer === 'tds-verified' ? tdsVerifiedApplications : marketExtendedApplications)
    .find((item) => item.id === evidence.applicationId)
  const product = marketProducts.find((item) => item.id === lead.productId)
  if (lead.commercialRole !== 'demand_side' || !lead.leadEligible || lead.country === 'China'
    || targetType?.kind !== 'target' || targetType.productId !== lead.productId
    || application?.productId !== lead.productId || !product
    || !evidence.statement || !evidence.sourceName || !/^https:\/\//.test(evidence.sourceUrl)
    || !/^\d{4}-\d{2}-\d{2}$/.test(evidence.verifiedAt)
    || !(lead.profile.website || lead.profile.contactPage || lead.profile.linkedIn || lead.profile.generalEmail || lead.profile.generalPhone || lead.profile.departmentEmails.length)) return null

  const observation = observations[evidence.applicationId]
  if (!observation) return null
  const selectedProduct = productCopy[lead.productId]
  const subject = `${selectedProduct.name} — a brief introduction`
  const positioning = lead.productId === 'elo' && ['coatings', 'elo-anticorrosion-coating-research'].includes(evidence.applicationId)
    ? 'a bio-based functional additive for coating formulation evaluation'
    : selectedProduct.positioning
  const body = `${recipientFor(lead)}

I’m Zhiwu from Ningbo Neon Lion Technology Co., Ltd. I came across public information about ${lead.company}’s ${observation}.

We supply ${selectedProduct.name}, ${positioning}. Would you be open to a short TDS for review? If another colleague handles raw materials, could you point me to the right person?

Best regards,
Zhiwu
Ningbo Neon Lion Technology Co., Ltd.
Email: zhiwu@neonlion.cn
Tel: +86 17852862361`
  return { subject, body, text: `Subject: ${subject}\n\n${body}`, evidenceUrl: evidence.sourceUrl, verifiedAt: evidence.verifiedAt }
}
