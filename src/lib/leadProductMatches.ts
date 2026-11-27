import { marketProducts, targetCompanyTypes, tdsVerifiedApplications, marketExtendedApplications, type PublicLead, type VerifiedProductMatch } from './productMarketMap'

import { validBriefIntroductionDraft } from './briefIntroductionDraft'
import { isTaiwanMarket } from './leadMarketScope'

const origins = new WeakMap<PublicLead, PublicLead>()
const selections = new WeakMap<PublicLead, VerifiedProductMatch>()
const day = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
const source = (value: string) => /^https:\/\//.test(value)

/** An additional product must pass its own evidence and input-supplier review. */
export function qualifiedProductMatch(lead: PublicLead, match: VerifiedProductMatch): boolean {
  if (lead.country === 'China' || isTaiwanMarket(lead.country) || !match.sourceExcerpt?.trim() || !Array.isArray(match.inputReviewSources) || !match.inputReviewSources.length || match.inputReviewSources.some(item => !item.label?.trim() || !source(item.url)) || !lead.leadEligible || lead.commercialRole !== 'demand_side' || match.verificationStatus !== 'independently-qualified' || !marketProducts.some(product => product.id === match.productId) || !match.fact?.trim() || !match.demandSideReason?.trim() || !day(match.checkedAt) || !match.supplierCompetitorCheck?.conclusion?.trim() || !day(match.supplierCompetitorCheck.checkedAt)) return false
  if (match.outreachDraft && !validBriefIntroductionDraft(match.outreachDraft, {...lead, productId:match.productId, companyEvidence:match.companyEvidence}, match.fact)) return false
  const evidence = match.companyEvidence
  const application = (evidence?.applicationLayer === 'tds-verified' ? tdsVerifiedApplications : marketExtendedApplications).find(item => item.id === evidence?.applicationId && item.productId === match.productId)
  const target = targetCompanyTypes.find(item => item.id === match.targetCompanyTypeId && item.productId === match.productId && item.kind === 'target')
  return Boolean(evidence?.statement?.trim() && evidence.sourceName?.trim() && source(evidence.sourceUrl) && day(evidence.verifiedAt) && application && target?.applicationReferences.some(ref => ref.layer === evidence.applicationLayer && ref.applicationId === evidence.applicationId))
}

export function primaryLeadForHistory(lead: PublicLead): PublicLead {
  return origins.get(lead) ?? lead
}
export function selectedProductMatch(lead: PublicLead) { return selections.get(lead) }
export function matchedProductIds(lead: PublicLead) {
  const original = origins.get(lead) ?? lead
  return [original.productId, ...(original.productMatches ?? []).filter(match => qualifiedProductMatch(original, match)).map(match => match.productId)]
}
export function leadForProduct(lead: PublicLead, productId: string): PublicLead | null {
  const original = origins.get(lead) ?? lead
  if (productId === original.productId) return original
  const match = original.productMatches?.find(item => item.productId === productId && qualifiedProductMatch(original, item))
  if (!match) return null
  const projected: PublicLead = { ...original, productId: match.productId, outreachDraft: match.outreachDraft, targetCompanyTypeId: match.targetCompanyTypeId, companyEvidence: match.companyEvidence, supplierCompetitorCheck: match.supplierCompetitorCheck, demandSideReason: match.demandSideReason, checkedAt: match.checkedAt, signal: match.companyEvidence.statement, source: { label: match.companyEvidence.sourceName, url: match.companyEvidence.sourceUrl } }
  origins.set(projected, original)
  selections.set(projected, match)
  return projected
}
/** All-products view keeps one stored row; filtering only projects a verified match. */
export function leadsForProduct(leads: PublicLead[], productId = 'all') {
  return productId === 'all' ? leads : leads.flatMap(lead => { const projected = leadForProduct(lead, productId); return projected ? [projected] : [] })
}
