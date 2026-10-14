import {
  marketExtendedApplications,
  marketProducts,
  targetCompanyTypes,
  tdsVerifiedApplications,
  type PublicLead,
} from './productMarketMap'
import { leadEmailFacts } from './leadEmailFacts'
import { isTaiwanMarket } from './leadMarketScope'
import { namedEmailVerified, selectBusinessRecipient } from './contactEvidence'

const verifiedDay = (value?: string) => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value)
const publicSource = (value?: string) => Boolean(value && /^https:\/\//.test(value))

export type ShortDevelopmentEmail = {
  subject: string
  body: string
  text: string
  evidenceUrl: string
  verifiedAt: string
}

const productNames: Record<PublicLead['productId'], string> = {
  'fertilizer-coating': 'fertilizer coating material',
  'nl-w1201': 'NL-W1201',
  elo: 'epoxidized linseed oil (ELO)',
}

function positioningFor(lead: PublicLead) {
  const applicationId = lead.companyEvidence.applicationId
  if (lead.productId === 'fertilizer-coating') {
    return applicationId === 'coated-urea' || applicationId === 'polyurethane-coated-urea'
      ? 'a raw material for possible fertilizer-granule coating formulation trials'
      : applicationId === 'coated-compound-fertilizer'
        ? 'a raw material for possible coated-compound-fertilizer formulation trials'
        : 'a raw material for possible controlled-release fertilizer coating formulation trials'
  }
  if (lead.productId === 'nl-w1201') {
    return applicationId === 'waterborne-ink-anchorage-on-pp-pe'
      ? 'a water-based surface treatment material for preliminary PP/PE adhesion-formulation evaluation'
      : 'a water-based surface treatment material for primer and adhesion-promoter formulation evaluation'
  }
  if (applicationId === 'elo-pvc-plasticizer') return 'a bio-based functional additive for preliminary plasticizer evaluation in PVC formulations'
  if (applicationId === 'coatings' || applicationId === 'elo-anticorrosion-coating-research') return 'a bio-based functional additive for preliminary coating-formulation evaluation'
  if (applicationId === 'adhesives') return 'a bio-based functional additive for preliminary adhesive-formulation evaluation'
  return 'a bio-based functional additive for preliminary formulation evaluation'
}

function recipientFor(lead: PublicLead) {
  const recipient = selectBusinessRecipient(lead)
  return recipient?.name ? `Hi ${recipient.name.trim().split(/\s+/)[0]},` : `Hi ${lead.company} Team,`
}

/** Pre-written, review-first first contact. It never asserts a purchase or product fit. */
export function createShortDevelopmentEmail(lead: PublicLead, recipientName?: string | null): ShortDevelopmentEmail | null {
  const evidence = lead.companyEvidence
  const targetType = targetCompanyTypes.find((item) => item.id === lead.targetCompanyTypeId)
  const application = (evidence.applicationLayer === 'tds-verified' ? tdsVerifiedApplications : marketExtendedApplications)
    .find((item) => item.id === evidence.applicationId)
  const product = marketProducts.find((item) => item.id === lead.productId)
  if (lead.commercialRole !== 'demand_side' || !lead.leadEligible || lead.country === 'China'
    || isTaiwanMarket(lead.country)
    || !lead.demandSideReason.trim() || !lead.supplierCompetitorCheck?.conclusion.trim() || !verifiedDay(lead.supplierCompetitorCheck.checkedAt)
    || targetType?.kind !== 'target' || targetType.productId !== lead.productId
    || application?.productId !== lead.productId || !product
    || !targetType.applicationReferences.some((item) => item.layer === evidence.applicationLayer && item.applicationId === evidence.applicationId)
    || (evidence.applicationLayer === 'market-extended' && (!('sourceUrl' in application) || !publicSource(application.sourceUrl) || !application.sourceName || !verifiedDay(application.verifiedAt)))
    || !evidence.statement || !evidence.sourceName || !/^https:\/\//.test(evidence.sourceUrl)
    || !verifiedDay(evidence.verifiedAt)
    || !(lead.profile.website || lead.profile.contactPage || lead.profile.linkedIn || lead.profile.generalEmail || lead.profile.generalPhone || lead.profile.departmentEmails.length)) return null

  const companyFact = leadEmailFacts[lead.id]
  if (!companyFact) return null
  const productName = productNames[lead.productId]
  const subject = `${productName} — a brief introduction`
  const verifiedRecipient = recipientName && lead.profile.contacts.find((contact) => contact.name === recipientName && namedEmailVerified(lead.company, contact))
  const greeting = recipientName === undefined ? recipientFor(lead) : verifiedRecipient ? `Hi ${verifiedRecipient.name.split(/\s+/)[0]},` : `Hi ${lead.company} Team,`
  const body = `${greeting}

${companyFact}

I’m Zhiwu from Ningbo Neon Lion Technology Co., Ltd. We supply ${productName}, ${positioningFor(lead)}. Would your technical or sourcing team be open to reviewing its TDS? If another colleague handles raw-material evaluation, could you point me to the right person?

Best regards,
Zhiwu
Ningbo Neon Lion Technology Co., Ltd.
Email: zhiwu@neonlion.cn`
  return { subject, body, text: `Subject: ${subject}\n\n${body}`, evidenceUrl: evidence.sourceUrl, verifiedAt: evidence.verifiedAt }
}
