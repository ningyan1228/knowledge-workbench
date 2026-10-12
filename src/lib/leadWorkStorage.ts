import { supabase } from './supabase'
import { normalizeWorkRecord, type LeadWorkList, type LeadWorkRecord, type WorkRecords } from './leadWorkbench'

export const leadWorkObjectType = 'market_lead_workspace_v1'
export const leadListObjectType = 'market_lead_list_v1'
type NoteRow = { object_type: string; object_id: string; note: string | null; bookmarked: boolean }
function db() { if (!supabase) throw new Error('请先连接私人资料库。'); return supabase }

/** Deterministic UUID inside our object_type namespace; same company across products shares a record. */
export async function companyWorkId(companyKey: string) {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${leadWorkObjectType}|${companyKey}`))).slice(0, 16)
  bytes[6] = (bytes[6] & 15) | 80
  bytes[8] = (bytes[8] & 63) | 128
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
function parseNote(note: string | null): Record<string, unknown> {
  if (!note) return {}
  const parsed: unknown = JSON.parse(note)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('私人客户记录格式异常，请检查后重试。')
  return parsed as Record<string, unknown>
}
export async function loadLeadWork(ownerId: string) {
  const rows: NoteRow[] = []
  for (let offset = 0; ; offset += 500) {
    const result = await db().from('bookmarks_notes').select('object_type,object_id,note,bookmarked').eq('owner_id', ownerId)
      .in('object_type', [leadWorkObjectType, leadListObjectType]).order('id').range(offset, offset + 499)
    if (result.error) throw result.error
    rows.push(...(result.data ?? []) as NoteRow[])
    if (!result.data || result.data.length < 500) break
  }
  const records: WorkRecords = {}, lists: LeadWorkList[] = []
  for (const row of rows) {
    const value = parseNote(row.note)
    if (row.object_type === leadWorkObjectType && typeof value.companyKey === 'string') records[value.companyKey] = normalizeWorkRecord({ ...value, favorite: row.bookmarked }, value.companyKey)
    if (row.object_type === leadListObjectType && typeof value.name === 'string') lists.push({ id: row.object_id, name: value.name })
  }
  return { records, lists: lists.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN')) }
}
export async function saveLeadWork(ownerId: string, companyKey: string, patch: Partial<Omit<LeadWorkRecord, 'companyKey'>>) {
  const objectId = await companyWorkId(companyKey)
  const current = await db().from('bookmarks_notes').select('note,bookmarked').eq('owner_id', ownerId).eq('object_type', leadWorkObjectType).eq('object_id', objectId).maybeSingle()
  if (current.error) throw current.error
  const record = normalizeWorkRecord({ ...parseNote(current.data?.note ?? null), favorite: current.data?.bookmarked ?? false, ...patch }, companyKey)
  const result = await db().from('bookmarks_notes').upsert({ owner_id: ownerId, object_type: leadWorkObjectType, object_id: objectId, bookmarked: record.favorite, note: JSON.stringify(record) }, { onConflict: 'owner_id,object_type,object_id' })
  if (result.error) throw result.error
  return record
}
export async function saveLeadList(ownerId: string, list: LeadWorkList) {
  const name = list.name.trim()
  if (!name || name.length > 40) throw new Error('名单名称需为 1–40 个字。')
  const result = await db().from('bookmarks_notes').upsert({ owner_id: ownerId, object_type: leadListObjectType, object_id: list.id, note: JSON.stringify({ name }) }, { onConflict: 'owner_id,object_type,object_id' })
  if (result.error) throw result.error
}
export async function deleteLeadList(ownerId: string, id: string) {
  const result = await db().from('bookmarks_notes').delete().eq('owner_id', ownerId).eq('object_type', leadListObjectType).eq('object_id', id)
  if (result.error) throw result.error
}
