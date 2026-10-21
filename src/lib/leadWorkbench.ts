import { marketExtendedApplications, publicLeads, targetCompanyTypes, tdsVerifiedApplications, type PublicLead } from './productMarketMap'
import { businessRecipient } from './customerDevelopment'
import { contactAssessment, contactPhoneVerified } from './contactEvidence'
import { activeOutreachSend, outreachCompanyKey, type OutreachSend } from './outreachLedger'
import { recordedDay, timelineLeads, type TimelineOrder } from './leadTimeline'
import { customerContactRoutes, latestContact, normalizeContactLog, type ContactLogEntry } from './contactRoutes'
import { leadMissingDetails, type CompletenessFilter } from './leadCompleteness'
import { matchesPreparation, type PreparationFilter } from './leadPreparation'

export const developmentStages = { todo: '待开发', waiting: '待回复', replied: '已回复', sample: '样品沟通', paused: '暂缓' } as const
export type DevelopmentStage = keyof typeof developmentStages
export const developmentProgressLabels = { todo: developmentStages.todo, sent: '已发送开发信', waiting: developmentStages.waiting, replied: developmentStages.replied, sample: developmentStages.sample, paused: developmentStages.paused, unknown: '进度未确认' } as const
export type EffectiveDevelopmentStage = keyof typeof developmentProgressLabels
export function developmentProgressLabel(stage: EffectiveDevelopmentStage, hasSent: boolean) {
  return hasSent && stage !== 'sent' && stage !== 'unknown' ? `已发送开发信 · ${developmentProgressLabels[stage]}` : developmentProgressLabels[stage]
}
export type LeadWorkRecord = { companyKey: string; stage: DevelopmentStage | null; followUpOn: string; note: string; favorite: boolean; listIds: string[]; contactLog?: ContactLogEntry[] }
export type LeadWorkList = { id: string; name: string }
export type WorkRecords = Record<string, LeadWorkRecord>
export type WorkQueue = 'all' | 'priority' | 'followup' | 'recent'
export type BusinessFilters = { query: string; industry: string; application: string; contact: string; sendStatus: 'all' | 'sent' | 'unsent' | 'unknown' | 'needs-email'; completeness: CompletenessFilter; preparation: PreparationFilter; stage: string; list: string; sort: 'time' | 'priority'; queue: WorkQueue }
export const emptyBusinessFilters: BusinessFilters = { query: '', industry: 'all', application: 'all', contact: 'all', sendStatus: 'all', completeness: 'all', preparation: 'all', stage: 'all', list: 'all', sort: 'time', queue: 'all' }
export const emptyWorkRecord = (companyKey: string): LeadWorkRecord => ({ companyKey, stage: null, followUpOn: '', note: '', favorite: false, listIds: [] })
export const applicationKey = (lead: PublicLead) => `${lead.companyEvidence.applicationLayer}:${lead.companyEvidence.applicationId}`
export const leadApplication = (lead: PublicLead) => (lead.companyEvidence.applicationLayer === 'tds-verified' ? tdsVerifiedApplications : marketExtendedApplications).find((item) => item.id === lead.companyEvidence.applicationId)
export const leadIndustry = (lead: PublicLead) => targetCompanyTypes.find((item) => item.id === lead.targetCompanyTypeId)?.name ?? '其他'
const httpsUrl = (value?: string) => Boolean(value && /^https:\/\//.test(value))
export function validWorkDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value
}

export function contactChannels(lead: PublicLead) {
  const profile = lead.profile
  const routes = customerContactRoutes(lead)
  return {
    email: Boolean(businessRecipient(lead)),
    form: httpsUrl(profile.contactPage),
    phone: Boolean((profile.generalPhone && (profile.generalPhoneEvidence ? contactPhoneVerified(lead.company, profile.generalPhone, profile.generalPhoneEvidence) && profile.generalPhoneEvidence.kind !== 'named-business' : httpsUrl(profile.contactPage ?? profile.website))) || profile.contacts.some((person) => contactAssessment(lead.company, person).phone)),
    named: profile.contacts.some((person) => { const status = contactAssessment(lead.company, person); return status.identity && (status.namedEmail || status.phone || status.linkedIn) }),
    linkedin: Boolean(routes.linkedin),
    whatsapp: Boolean(routes.whatsapp),
  }
}

/** A transparent work-order score; never a purchase probability or evidence of using our product. */
export function developmentPriority(lead: PublicLead) {
  const channels = contactChannels(lead)
  const eligible = lead.leadEligible && lead.commercialRole === 'demand_side'
  const matched = Boolean(leadApplication(lead))
  const application = matched ? lead.companyEvidence.applicationLayer === 'tds-verified' ? 35 : 25 : 0
  const evidence = (lead.companyEvidence.statement.trim() ? 5 : 0) + (httpsUrl(lead.companyEvidence.sourceUrl) ? 10 : 0) + (validWorkDate(lead.companyEvidence.verifiedAt) ? 5 : 0) + (lead.demandSideReason.trim() ? 5 : 0)
  const contact = channels.email ? 25 : channels.form ? 18 : channels.phone ? 12 : 0
  const role = eligible ? 10 : 0
  const exclusion = lead.supplierCompetitorCheck?.conclusion && validWorkDate(lead.supplierCompetitorCheck.checkedAt) ? 5 : 0
  const score = eligible ? application + evidence + contact + role + exclusion : 0
  const label = score >= 80 ? '优先开发' : score >= 60 ? '常规开发' : '先补证据'
  const reasons = [
    matched ? `${lead.companyEvidence.applicationLayer === 'tds-verified' ? 'TDS 已验证' : '有公开来源的市场扩展'}应用：${leadApplication(lead)?.name}` : '应用关联待补证据',
    evidence === 25 ? '公司业务证据、来源及核验日期完整' : '公司业务证据仍需补全',
    channels.email ? '有公开业务邮箱' : channels.form ? '有官网联系入口' : channels.phone ? '有公开业务电话' : '待补公开联系入口',
    eligible ? '已收录为潜在需求侧公司' : '需求侧资格不足',
    exclusion ? '已记录同行与同类原料供应商排除结论' : '同行排除记录待补全',
  ]
  return { score, label, reasons, parts: { application, evidence, contact, role, exclusion } }
}

export function effectiveStage(lead: PublicLead, records: WorkRecords | null, sends: OutreachSend[] | null): EffectiveDevelopmentStage {
  const manual = records?.[outreachCompanyKey(lead)]?.stage
  if (manual && manual !== 'todo') return manual
  if (sends !== null && activeOutreachSend(sends, lead)) return 'sent'
  if (latestContact(records?.[outreachCompanyKey(lead)]?.contactLog)) return 'waiting'
  if (records === null) return 'unknown'
  return manual ?? (sends === null ? 'unknown' : 'todo')
}

export function followUpDue(record: LeadWorkRecord | undefined, today: string) {
  return Boolean(record && record.stage !== 'paused' && validWorkDate(record.followUpOn) && record.followUpOn <= today)
}

export function filterWorkbenchLeads(leads: PublicLead[], filters: BusinessFilters, records: WorkRecords | null, sends: OutreachSend[] | null, today: string, order: TimelineOrder = 'newest', day = 'all') {
  const matching = leads.filter((lead) => {
    const record = records?.[outreachCompanyKey(lead)]
    const stage = effectiveStage(lead, records, sends)
    const channels = contactChannels(lead)
    const query = filters.query.trim().toLocaleLowerCase()
    if (query && !`${lead.company} ${lead.country} ${lead.countryZh} ${lead.city} ${leadIndustry(lead)} ${leadApplication(lead)?.name} ${leadApplication(lead)?.nameEn}`.toLocaleLowerCase().includes(query)) return false
    if (filters.industry !== 'all' && lead.targetCompanyTypeId !== filters.industry) return false
    if (filters.application !== 'all' && applicationKey(lead) !== filters.application) return false
    if (filters.contact !== 'all' && !channels[filters.contact as keyof typeof channels]) return false
    if (filters.completeness && filters.completeness !== 'all' && !leadMissingDetails(lead)[filters.completeness]) return false
    // Absence of a shared record is independent of the currently available inbox.
    if (filters.sendStatus !== 'all') {
      if (filters.sendStatus === 'unknown') { if (sends !== null) return false }
      else {
        if (sends === null) return false
        const sent = Boolean(activeOutreachSend(sends, lead))
        if (filters.sendStatus === 'sent' ? !sent : sent) return false
        // Retain the old internal value for callers; the visible UI uses completeness.
        if (filters.sendStatus === 'needs-email' && channels.email) return false
      }
    }
    if (!matchesPreparation(lead, filters.preparation, sends, records)) return false
    // Sent is a completed milestone, including companies already at a later stage.
    if (filters.stage === 'sent' && (sends === null || !activeOutreachSend(sends, lead))) return false
    if (filters.stage === 'waiting' && stage !== 'waiting' && stage !== 'sent') return false
    if (filters.stage !== 'all' && filters.stage !== 'sent' && filters.stage !== 'waiting' && stage !== filters.stage) return false
    if (filters.list === 'favorites' && !record?.favorite) return false
    if (filters.list !== 'all' && filters.list !== 'favorites' && !record?.listIds.includes(filters.list)) return false
    if (filters.queue === 'priority' && (sends === null || activeOutreachSend(sends, lead) || stage !== 'todo' || developmentPriority(lead).score < 80)) return false
    if (filters.queue === 'followup' && !followUpDue(record, today)) return false
    if (filters.queue === 'recent' && (sends === null || activeOutreachSend(sends, lead) || stage !== 'todo')) return false
    return true
  })
  const sorted = timelineLeads(matching, filters.queue === 'recent' ? 'newest' : order, day)
  if (filters.queue === 'followup') return sorted.sort((a, b) => (records?.[outreachCompanyKey(a)]?.followUpOn ?? '').localeCompare(records?.[outreachCompanyKey(b)]?.followUpOn ?? ''))
  if (filters.sort === 'priority' || filters.queue === 'priority') return sorted.sort((a, b) => developmentPriority(b).score - developmentPriority(a).score)
  return sorted
}

export function normalizeWorkRecord(value: unknown, companyKey: string): LeadWorkRecord {
  const base = emptyWorkRecord(companyKey)
  if (!value || typeof value !== 'object') return base
  const raw = value as Record<string, unknown>
  return { companyKey, stage: typeof raw.stage === 'string' && Object.hasOwn(developmentStages, raw.stage) ? raw.stage as DevelopmentStage : null, followUpOn: typeof raw.followUpOn === 'string' && validWorkDate(raw.followUpOn) ? raw.followUpOn : '', note: typeof raw.note === 'string' ? raw.note.slice(0, 4000) : '', favorite: raw.favorite === true, listIds: Array.isArray(raw.listIds) ? [...new Set(raw.listIds.filter((id): id is string => typeof id === 'string'))] : [], contactLog: normalizeContactLog(raw.contactLog) }
}

export function companyAssociations(lead: PublicLead) {
  const related = publicLeads.filter((item) => item.id !== lead.id && outreachCompanyKey(item) === outreachCompanyKey(lead))
  // Group names in the published company name are attribution, not inferred ownership.
  const attribution = lead.company.match(/\(([^)]+)\)/)?.[1] ?? null
  return { related, attribution }
}
