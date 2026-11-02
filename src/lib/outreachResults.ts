import type { PublicLead } from './productMarketMap'
import { outreachCompanyKey, type OutreachSend } from './outreachLedger'
import { normalizeContactLog } from './contactRoutes'
import type { WorkRecords } from './leadWorkbench'

export const resultLabels = { contacted: '已联系', replied: '收到回复', technical: '技术沟通', shipped: '实际寄样', sample: '开始样品评估', feedback: '测试反馈', quoted: '已报价', ordered: '已确认订单', paused: '暂停', rejected: '客户拒绝', unsuitable: '不适合', resumed: '恢复跟进' } as const
export type ResultKind = keyof typeof resultLabels
export type ResultEvent = { id: string; kind: ResultKind; on: string; note: string; recordedAt: string; voidedAt?: string; nextStep?: string; followUpOn?: string; application?: string; pitch?: string }
const validDay = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value
const validTime = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value))
export function normalizeResultEvents(value: unknown): ResultEvent[] {
  if (!Array.isArray(value)) return []
  const ids = new Set<string>()
  return value.filter((entry): entry is ResultEvent => {
    if (!entry || typeof entry !== 'object' || typeof entry.id !== 'string' || !entry.id || ids.has(entry.id)
      || !Object.hasOwn(resultLabels, entry.kind) || !validDay(entry.on)
      || typeof entry.note !== 'string' || !entry.note.trim() || entry.note.length > 500
      || ['nextStep', 'application', 'pitch'].some(field => entry[field] !== undefined && (typeof entry[field] !== 'string' || entry[field].length > 500))
      || (entry.followUpOn !== undefined && entry.followUpOn !== '' && !validDay(entry.followUpOn))
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
  contacted: boolean; replied: boolean; technical: boolean; sample: boolean; shipped: boolean; feedback: boolean; quoted: boolean; ordered: boolean; paused: boolean; rejected: boolean; unsuitable: boolean; resumed: boolean;
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
      replied: events.some(event => event.kind === 'replied'), technical: events.some(event => event.kind === 'technical'), sample: events.some(event => event.kind === 'sample'),
      ...Object.fromEntries(['shipped', 'feedback', 'quoted', 'ordered', 'paused', 'rejected', 'unsuitable', 'resumed'].map(kind => [kind, events.some(event => event.kind === kind)])) as Pick<CompanyResult, 'shipped' | 'feedback' | 'quoted' | 'ordered' | 'paused' | 'rejected' | 'unsuitable' | 'resumed'> }
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

export const milestoneKinds: ResultKind[] = ['contacted', 'replied', 'technical', 'shipped', 'sample', 'feedback', 'quoted', 'ordered']
export function resultDisposition(events: unknown, today?: string) {
  return latestResultEvent(normalizeResultEvents(events).filter(event => ['paused', 'rejected', 'unsuitable', 'resumed'].includes(event.kind)), today)?.kind as 'paused' | 'rejected' | 'unsuitable' | 'resumed' | undefined
}
/** Group only explicitly attributed events; never infer a product response from company membership. */
export function evidenceGroups(companies: CompanyResult[], dimension: 'application' | 'pitch') {
  const groups = new Map<string, Map<string, Set<ResultKind>>>()
  for (const company of companies) for (const event of company.events) {
    const label = event[dimension]?.trim()
    if (!label) continue
    if (!groups.has(label)) groups.set(label, new Map())
    const rows = groups.get(label)!
    if (!rows.has(company.key)) rows.set(company.key, new Set())
    rows.get(company.key)!.add(event.kind)
  }
  return [...groups].map(([label, rows]) => {
    const counts = Object.fromEntries(milestoneKinds.map(kind => [kind, [...rows.values()].filter(kinds => kinds.has(kind)).length])) as Record<ResultKind, number>
    const contacted = [...rows.values()].filter(kinds => kinds.has('contacted'))
    const replies = contacted.filter(kinds => kinds.has('replied')).length
    return { label, companies: rows.size, counts, contacted: contacted.length, replies,
      replyRate: contacted.length ? Math.round(replies / contacted.length * 100) : null }
  }).sort((a, b) => b.counts.technical - a.counts.technical || b.counts.sample - a.counts.sample || a.label.localeCompare(b.label, 'zh-CN'))
}
