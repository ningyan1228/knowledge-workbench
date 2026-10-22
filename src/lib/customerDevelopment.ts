import type { PublicLead } from './productMarketMap'
import { activeOutreachSend, outreachCompanyKey, type OutreachSend } from './outreachLedger'
import { contactAssessment, qualifiedContactCompany, selectBusinessRecipient } from './contactEvidence'
import { createShortDevelopmentEmail } from './shortDevelopmentEmail'
import { recordedDay, shanghaiDay } from './leadTimeline'
import { latestContact } from './contactRoutes'
import { latestResultEvent } from './outreachResults'
import type { WorkRecords } from './leadWorkbench'

const southeastAsia = new Set(['Vietnam', 'Malaysia', 'Indonesia', 'Thailand', 'Philippines', 'Singapore', 'Cambodia', 'Laos', 'Myanmar', 'Brunei', 'Timor-Leste'])
export const businessRecipient = selectBusinessRecipient

export function firstContactPlan(leads: PublicLead[], sends: OutreachSend[] | null, goal = 20, day = shanghaiDay(new Date().toISOString()), daily = true, records: WorkRecords | null = {}) {
  const completed = sends ? new Set(sends.filter((item) => item.voided_at === null && item.sent_on === day && leads.some((lead) => outreachCompanyKey(lead) === item.company_key)).map((item) => item.company_key)).size : null
  const seen = new Set<string>()
  const candidates = leads.filter((lead) => lead.leadEligible && lead.commercialRole === 'demand_side' && lead.country !== 'China')
    .sort((a, b) => Number(southeastAsia.has(b.country)) - Number(southeastAsia.has(a.country)) || Number(b.fit === '优先核验') - Number(a.fit === '优先核验') || a.company.localeCompare(b.company))
    .flatMap((lead) => {
      const key = outreachCompanyKey(lead)
      const recipient = businessRecipient(lead)
      const email = recipient && createShortDevelopmentEmail(lead, recipient.name ?? null)
      if (seen.has(key) || !recipient || !email) return []
      seen.add(key)
      if (sends === null || records === null || activeOutreachSend(sends, lead) || latestContact(records[key]?.contactLog) || latestResultEvent(records[key]?.resultEvents)) return []
      return [{ lead, recipient, email, southeastAsia: southeastAsia.has(lead.country) }]
    })
  const remaining = completed === null ? null : Math.max(0, goal - (daily ? completed : 0))
  return { completed, remaining, available: sends === null ? null : candidates.length, batch: remaining === null ? [] : candidates.slice(0, remaining), shortfall: remaining === null ? null : Math.max(0, remaining - candidates.length), missingEmails: leads.filter((lead) => !businessRecipient(lead)).length }
}

export function developmentSnapshot(leads: PublicLead[], day = shanghaiDay(new Date().toISOString())) {
  const namedContacts = new Set<string>()
  for (const lead of leads.filter(qualifiedContactCompany)) for (const person of lead.profile.contacts) {
    const status = contactAssessment(lead.company, person)
    if (status.identity && (status.namedEmail || status.phone || status.linkedIn)) namedContacts.add(`${outreachCompanyKey(lead)}|${person.name.toLowerCase()}`)
  }
  return { newCompaniesToday: new Set(leads.filter((lead) => recordedDay(lead) === day).map(outreachCompanyKey)).size, reachableNamedContacts: namedContacts.size }
}

export function firstContactExport(batch: ReturnType<typeof firstContactPlan>['batch']) {
  return batch.map(({ lead, recipient, email }) => `${lead.company} | ${lead.country}\nTo: ${recipient.email}\nContact: ${recipient.label}\nContact source: ${recipient.sourceUrl}\nIdentity sources: ${recipient.identitySources?.map((source) => source.url).join(' | ') ?? 'Company / department inbox; no person attributed'}\nEmail sources: ${recipient.emailSources.map((source) => source.url).join(' | ')}\nEmail evidence date: ${recipient.verifiedAt ?? 'Legacy company source; separate verification pending'}\nCompany evidence: ${email.evidenceUrl}\nCompany verified: ${email.verifiedAt}\n\n${email.text}`).join('\n\n' + '='.repeat(72) + '\n\n')
}
