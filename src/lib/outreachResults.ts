import type { PublicLead } from './productMarketMap'
import { outreachCompanyKey, type OutreachSend } from './outreachLedger'
import { normalizeContactLog } from './contactRoutes'
import type { WorkRecords } from './leadWorkbench'

export const resultLabels = { contacted: '已联系', replied: '收到回复', technical: '技术沟通', sample: '开始样品评估' } as const
export type ResultKind = keyof typeof resultLabels
export type ResultEvent = { id: string; kind: ResultKind; on: string; note: string; recordedAt: string; voidedAt?: string }
const validDay = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
const validTime = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value))
export function normalizeResultEvents(value: unknown): ResultEvent[] {
  if (!Array.isArray(value)) return []
  const ids = new Set<string>()
  return value.filter((entry): entry is ResultEvent => {
    if (!entry || typeof entry !== 'object' || typeof entry.id !== 'string' || !entry.id || ids.has(entry.id)
      || !Object.hasOwn(resultLabels, entry.kind) || !validDay(entry.on)
      || typeof entry.note !== 'string' || !entry.note.trim() || entry.note.length > 500
      || !validTime(entry.recordedAt) || (entry.voidedAt !== undefined && !validTime(entry.voidedAt))) return false
    ids.add(entry.id); return true
  })
}
export function latestResultEvent(value: unknown, today = new Date(Date.now() + 8 * 3_600_000).toISOString().slice(0, 10)) {
  return normalizeResultEvents(value).filter(event => !event.voidedAt && event.on <= today).sort((a, b) => b.on.localeCompare(a.on) || b.recordedAt.localeCompare(a.recordedAt))[0]
}

export type CompanyResult = {
  key: string; lead: PublicLead; productIds: PublicLead['productId'][];
  firstContact: string; batch: string; events: ResultEvent[];
  contacted: boolean; replied: boolean; technical: boolean; sample: boolean;
}
/** Independent milestones: a sample discussion never implies an actual sample evaluation or a reply. */
export function companyResults(leads: PublicLead[], sends: OutreachSend[], records: WorkRecords, today: string): CompanyResult[] {
  const grouped = new Map<string, PublicLead[]>()
  for (const lead of leads) {
    const key = outreachCompanyKey(lead)
    grouped.set(key, [...(grouped.get(key) ?? []), lead])
  }
  return [...grouped].map(([key, entries]) => {
    const events = normalizeResultEvents(records[key]?.resultEvents).filter(event => !event.voidedAt && event.on <= today)
    const dates = [
      ...sends.filter(send => send.company_key === key && !send.voided_at && validDay(send.sent_on) && send.sent_on <= today).map(send => send.sent_on),
      ...normalizeContactLog(records[key]?.contactLog).filter(event => !event.voidedAt && event.contactedOn <= today).map(event => event.contactedOn),
      ...events.filter(event => event.kind === 'contacted').map(event => event.on),
    ].sort()
    const firstContact = dates[0] ?? ''
    return { key, lead: entries[0], productIds: [...new Set(entries.map(lead => lead.productId))], firstContact,
      batch: firstContact ? firstContact.slice(0, 7) : 'unknown', events, contacted: Boolean(firstContact),
      replied: events.some(event => event.kind === 'replied'), technical: events.some(event => event.kind === 'technical'), sample: events.some(event => event.kind === 'sample') }
  }).filter(company => company.contacted || company.events.length)
}
export function countResults(companies: CompanyResult[]) {
  return Object.fromEntries((Object.keys(resultLabels) as ResultKind[]).map(kind => [kind, companies.filter(company => company[kind]).length])) as Record<ResultKind, number>
}
export function resultGroups(companies: CompanyResult[], dimension: 'product' | 'country' | 'batch') {
  const groups = new Map<string, CompanyResult[]>()
  for (const company of companies) {
    const keys = dimension === 'product' ? company.productIds : [dimension === 'country' ? company.lead.countryZh : company.batch]
    for (const key of keys) groups.set(key, [...(groups.get(key) ?? []), company])
  }
  return [...groups].sort(([a], [b]) => a.localeCompare(b, 'zh-CN')).map(([key, rows]) => ({ key, rows, counts: countResults(rows) }))
}
