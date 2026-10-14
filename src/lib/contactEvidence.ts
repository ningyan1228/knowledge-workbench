import type { PublicLead } from './productMarketMap'
import { marketExtendedApplications, targetCompanyTypes, tdsVerifiedApplications } from './productMarketMap.ts'
import { isTaiwanMarket } from './leadMarketScope.ts'

export type ContactSource = { label: string; url: string; summary: string }
type DatedEvidence = { sources: ContactSource[]; verifiedAt: string }
export type IdentityEvidence = DatedEvidence & {
  company: string; name: string; title: string; responsibilities: string; currentEmployment: true
}
export type EmailEvidence = DatedEvidence & {
  company: string; value: string; kind: 'named-business' | 'department' | 'general'; personName?: string; publicBusiness: true
}
export type PhoneEvidence = DatedEvidence & {
  company: string; value: string; kind: 'named-business' | 'department' | 'general'; personName?: string; publicBusiness: true
}
export type CompanyContact = {
  name: string
  title?: string
  department?: 'Sales' | 'Procurement' | 'Technical' | 'Product' | 'Production' | 'Management' | 'Other'
  email?: string
  phone?: string
  linkedIn?: string
  identityEvidence?: IdentityEvidence
  emailEvidence?: EmailEvidence
  phoneEvidence?: PhoneEvidence
  /** Historical combined provenance; never silently treated as channel ownership. */
  source?: { label: string; url: string }
  verifiedAt?: string
}
export const validContactDate = (value?: string) => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value)
export const publicContactUrl = (value?: string) => { try { return Boolean(value && new URL(value).protocol === 'https:') } catch { return false } }
export const validBusinessEmail = (value?: string) => Boolean(value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
const normalized = (value?: string) => (value ?? '').trim().replace(/\s+/g, ' ').toLocaleLowerCase()
export const validContactEvidence = (evidence?: DatedEvidence) => Boolean(evidence && validContactDate(evidence.verifiedAt) && evidence.sources?.length && evidence.sources.every((source) => source.label?.trim() && publicContactUrl(source.url) && source.summary?.trim()))
export const isGenericInbox = (email: string) => /^(info|sales|support|contact|office|hello|enquir(?:y|ies)|inquir(?:y|ies)|service|customerservice|admin|team|marketing|export|purchase|purchasing|procurement|sourcing|technical|tech|rd|r&d)([._+-]|\d|$)/i.test(email.split('@')[0])
export function contactRolePriority(value: string) {
  return /ecommerce|e-commerce|电商/i.test(value) ? 7
    : /procurement|purchas|sourcing|supply.chain|采购|供应链/i.test(value) ? 0
    : /technical|r&d|research|研发|技术/i.test(value) ? 1
      : /\bproduct\b/i.test(value) ? 2
        : /production|plant|manufactur|operations|生产/i.test(value) ? 3
          : /managing|general manager|management|owner|founder|president|ceo|director/i.test(value) ? 4 : 5
}
export function contactIdentityVerified(company: string, contact: CompanyContact) {
  const proof = contact.identityEvidence
  return Boolean(validContactEvidence(proof) && proof?.currentEmployment === true && proof.responsibilities?.trim()
    && normalized(proof.company) === normalized(company) && normalized(proof.name) === normalized(contact.name) && contact.name?.trim()
    && contact.title?.trim() && normalized(proof.title) === normalized(contact.title))
}
export function contactEmailVerified(company: string, value?: string, proof?: EmailEvidence) {
  return Boolean(validBusinessEmail(value) && validContactEvidence(proof) && proof?.publicBusiness === true
    && ['named-business', 'department', 'general'].includes(proof.kind) && normalized(proof.company) === normalized(company) && normalized(proof.value) === normalized(value))
}
export function contactPhoneVerified(company: string, value?: string, proof?: PhoneEvidence) {
  return Boolean(value?.trim() && (value.match(/\d/g)?.length ?? 0) >= 5 && validContactEvidence(proof) && proof?.publicBusiness === true
    && ['named-business', 'department', 'general'].includes(proof.kind) && normalized(proof.company) === normalized(company) && normalized(proof.value) === normalized(value))
}
export function namedEmailVerified(company: string, contact: CompanyContact) {
  return Boolean(contactIdentityVerified(company, contact) && contactEmailVerified(company, contact.email, contact.emailEvidence)
    && contact.emailEvidence?.kind === 'named-business' && normalized(contact.emailEvidence.personName) === normalized(contact.name) && !isGenericInbox(contact.email!))
}
export function contactAssessment(company: string, contact: CompanyContact) {
  const identity = contactIdentityVerified(company, contact)
  const email = contactEmailVerified(company, contact.email, contact.emailEvidence)
  const namedEmail = namedEmailVerified(company, contact)
  const phone = contactPhoneVerified(company, contact.phone, contact.phoneEvidence)
    && (contact.phoneEvidence?.kind !== 'named-business' || (identity && normalized(contact.phoneEvidence.personName) === normalized(contact.name)))
  const linkedIn = Boolean(contact.linkedIn && /^https:\/\/(?:[a-z]+\.)?linkedin\.com\/(?:in|pub)\//i.test(contact.linkedIn))
  const usableEmail = namedEmail || (email && (contact.emailEvidence?.kind !== 'named-business' || isGenericInbox(contact.email!)))
  const missing = [!identity && '当前任职与职责证据', !namedEmail && '具名业务邮箱及归属证据', contact.phone && !phone && '公开业务电话证据'].filter(Boolean) as string[]
  const labels = [identity ? '身份已核验' : '身份待核验', usableEmail && '业务邮箱有来源', email && !usableEmail && '邮箱归属待核验', phone && '业务电话有来源', linkedIn && !usableEmail && !phone && '仅领英入口', !usableEmail && !phone && '待补联系方式'].filter(Boolean) as string[]
  return { identity, email, namedEmail, phone, linkedIn, missing, labels }
}

export type BusinessRecipient = { email: string; name?: string; label: string; sourceUrl: string; priority: number; identitySources?: ContactSource[]; emailSources: Array<{ label: string; url: string; summary?: string }>; verifiedAt?: string; provenance: 'separate-evidence' | 'legacy-company-source' }
export function qualifiedContactCompany(lead: PublicLead) {
  const evidence = lead.companyEvidence
  const target = targetCompanyTypes.find((item) => item.id === lead.targetCompanyTypeId)
  const application = (evidence?.applicationLayer === 'tds-verified' ? tdsVerifiedApplications : marketExtendedApplications).find((item) => item.id === evidence?.applicationId)
  const extensionVerified = evidence?.applicationLayer === 'tds-verified' || Boolean(application && 'sourceUrl' in application && publicContactUrl(application.sourceUrl) && application.sourceName && validContactDate(application.verifiedAt))
  return Boolean(lead.leadEligible && lead.commercialRole === 'demand_side' && lead.country !== 'China' && !isTaiwanMarket(lead.country) && lead.demandSideReason?.trim() && evidence?.statement?.trim() && publicContactUrl(evidence.sourceUrl) && validContactDate(evidence.verifiedAt) && lead.supplierCompetitorCheck?.conclusion?.trim() && validContactDate(lead.supplierCompetitorCheck?.checkedAt)
    && target?.kind === 'target' && target.productId === lead.productId && application?.productId === lead.productId && extensionVerified && target.applicationReferences.some((item) => item.layer === evidence.applicationLayer && item.applicationId === evidence.applicationId))
}
/** Company qualification precedes recipient selection; no address construction or deliverability claim. */
export function selectBusinessRecipient(lead: PublicLead): BusinessRecipient | null {
  if (!qualifiedContactCompany(lead)) return null
  const choices: BusinessRecipient[] = []
  for (const contact of lead.profile.contacts) {
    if (!contactEmailVerified(lead.company, contact.email, contact.emailEvidence)) continue
    const named = namedEmailVerified(lead.company, contact)
    // A claimed personal inbox with missing identity must not be relabelled as a company inbox.
    if (contact.emailEvidence!.kind === 'named-business' && !isGenericInbox(contact.email!) && !named) continue
    const proof = contact.emailEvidence!
    choices.push({ email: contact.email!, name: named ? contact.name : undefined, label: named ? contact.title! : '公司／部门业务邮箱', sourceUrl: proof.sources[0].url, priority: named ? contactRolePriority(`${contact.department ?? ''} ${contact.title}`) : 6, identitySources: named ? contact.identityEvidence!.sources : undefined, emailSources: proof.sources, verifiedAt: proof.verifiedAt, provenance: 'separate-evidence' })
  }
  for (const item of lead.profile.departmentEmails) {
    if (!validBusinessEmail(item.email)) continue
    if (item.emailEvidence ? !contactEmailVerified(lead.company, item.email, item.emailEvidence) || item.emailEvidence.kind === 'named-business' : !item.source?.label || !publicContactUrl(item.source.url)) continue
    const sources = item.emailEvidence?.sources ?? [item.source!]
    choices.push({ email: item.email, label: `${item.department} 部门邮箱`, sourceUrl: sources[0].url, priority: contactRolePriority(item.department), emailSources: sources, verifiedAt: item.emailEvidence?.verifiedAt, provenance: item.emailEvidence ? 'separate-evidence' : 'legacy-company-source' })
  }
  const profile = lead.profile, sourceUrl = profile.contactPage ?? profile.website
  if (validBusinessEmail(profile.generalEmail) && (profile.generalEmailEvidence ? contactEmailVerified(lead.company, profile.generalEmail, profile.generalEmailEvidence) && profile.generalEmailEvidence.kind !== 'named-business' : publicContactUrl(sourceUrl))) {
    const sources = profile.generalEmailEvidence?.sources ?? [{ label: '公司公开业务入口（旧记录）', url: sourceUrl! }]
    choices.push({ email: profile.generalEmail!, label: 'General 公司邮箱', sourceUrl: sources[0].url, priority: 6, emailSources: sources, verifiedAt: profile.generalEmailEvidence?.verifiedAt, provenance: profile.generalEmailEvidence ? 'separate-evidence' : 'legacy-company-source' })
  }
  return choices.sort((a, b) => a.priority - b.priority)[0] ?? null
}
