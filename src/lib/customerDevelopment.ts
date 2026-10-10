import type { PublicLead } from './productMarketMap'
import { activeOutreachSend, outreachCompanyKey, validOutreachEmail, type OutreachSend } from './outreachLedger'
import { createShortDevelopmentEmail } from './shortDevelopmentEmail'
import { recordedDay, shanghaiDay } from './leadTimeline'

const southeastAsia = new Set(['Vietnam', 'Malaysia', 'Indonesia', 'Thailand', 'Philippines', 'Singapore', 'Cambodia', 'Laos', 'Myanmar', 'Brunei', 'Timor-Leste'])
const publicUrl = (url?: string) => Boolean(url && /^https:\/\//.test(url))
const rolePriority = (role: string) => /procurement|purchas|sourcing/i.test(role) ? 0 : /technical|r&d|research/i.test(role) ? 1 : /production|plant/i.test(role) ? 2 : 3

/** Select only published business inboxes; never infer an address from a person's name. */
export function businessRecipient(lead: PublicLead) {
  const named = lead.profile.contacts.filter((item) => item.email && validOutreachEmail(item.email) && item.name && item.title && publicUrl(item.source?.url) && /^\d{4}-\d{2}-\d{2}$/.test(item.verifiedAt ?? ''))
    .sort((a, b) => rolePriority(`${a.department ?? ''} ${a.title}`) - rolePriority(`${b.department ?? ''} ${b.title}`))[0]
  const department = lead.profile.departmentEmails.filter((item) => validOutreachEmail(item.email) && publicUrl(item.source?.url))
    .sort((a, b) => rolePriority(a.department) - rolePriority(b.department))[0]
  const choices: Array<{ email: string; name?: string; label: string; sourceUrl: string; priority: number }> = []
  if (named) choices.push({ email: named.email!, name: named.name, label: named.title!, sourceUrl: named.source!.url, priority: rolePriority(`${named.department ?? ''} ${named.title}`) })
  if (department) choices.push({ email: department.email, label: `${department.department} 部门邮箱`, sourceUrl: department.source!.url, priority: rolePriority(department.department) })
  const sourceUrl = lead.profile.contactPage ?? lead.profile.website
  if (lead.profile.generalEmail && validOutreachEmail(lead.profile.generalEmail) && publicUrl(sourceUrl)) choices.push({ email: lead.profile.generalEmail, label: 'General 公司邮箱', sourceUrl: sourceUrl!, priority: 5 })
  return choices.sort((a, b) => a.priority - b.priority)[0] ?? null
}

export function firstContactPlan(leads: PublicLead[], sends: OutreachSend[] | null, goal = 20, day = shanghaiDay(new Date().toISOString()), daily = true) {
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
      if (sends === null || activeOutreachSend(sends, lead)) return []
      return [{ lead, recipient, email, southeastAsia: southeastAsia.has(lead.country) }]
    })
  const remaining = completed === null ? null : Math.max(0, goal - (daily ? completed : 0))
  return { completed, remaining, available: sends === null ? null : candidates.length, batch: remaining === null ? [] : candidates.slice(0, remaining), shortfall: remaining === null ? null : Math.max(0, remaining - candidates.length), missingEmails: leads.filter((lead) => !businessRecipient(lead)).length }
}

export function developmentSnapshot(leads: PublicLead[], day = shanghaiDay(new Date().toISOString())) {
  const namedContacts = new Set<string>()
  for (const lead of leads) for (const person of lead.profile.contacts) {
    if (person.name && person.title && publicUrl(person.source?.url) && /^\d{4}-\d{2}-\d{2}$/.test(person.verifiedAt ?? '') && ((person.email && validOutreachEmail(person.email)) || person.phone || publicUrl(person.linkedIn))) namedContacts.add(`${outreachCompanyKey(lead)}|${person.name.toLowerCase()}`)
  }
  return { newCompaniesToday: new Set(leads.filter((lead) => recordedDay(lead) === day).map(outreachCompanyKey)).size, reachableNamedContacts: namedContacts.size }
}

export function firstContactExport(batch: ReturnType<typeof firstContactPlan>['batch']) {
  return batch.map(({ lead, recipient, email }) => `${lead.company} | ${lead.country}\nTo: ${recipient.email}\nContact: ${recipient.label}\nContact source: ${recipient.sourceUrl}\nCompany evidence: ${email.evidenceUrl}\nCompany verified: ${email.verifiedAt}\n\n${email.text}`).join('\n\n' + '='.repeat(72) + '\n\n')
}
