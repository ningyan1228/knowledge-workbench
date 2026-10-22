import { useState, type FormEvent } from 'react'
import type { PublicLead } from '../../lib/productMarketMap'
import { normalizeResultEvents, resultLabels, type ResultKind } from '../../lib/outreachResults'
import { outreachCompanyKey } from '../../lib/outreachLedger'
import { shanghaiDay } from '../../lib/leadTimeline'
import { validWorkDate } from '../../lib/leadWorkbench'
import type { LeadWork } from './useLeadWork'

export function ResultRecordPanel({ lead, work }: { lead: PublicLead; work: LeadWork }) {
  const today = shanghaiDay(new Date().toISOString())
  const [kind, setKind] = useState<ResultKind>('replied'), [on, setOn] = useState(today), [note, setNote] = useState(''), [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const key = outreachCompanyKey(lead)
  const events = normalizeResultEvents(work.records[key]?.resultEvents).filter(event => !event.voidedAt)
  const save = async (event: FormEvent) => {
    event.preventDefault(); setMessage(''); setSaving(true)
    try {
      if (!validWorkDate(on) || on > today) throw new Error('请选择真实发生日期，不能填写未来日期。')
      if (!note.trim()) throw new Error('请简要记录实际发生的情况。')
      const fresh = await work.fetchCurrentRecords()
      const previous = normalizeResultEvents(fresh[key]?.resultEvents)
      if (previous.length >= 200) throw new Error('该公司已达到 200 条结果记录，请先整理历史。')
      await work.save(lead, { resultEvents: [...previous, { id: crypto.randomUUID(), kind, on, note: note.trim(), recordedAt: new Date().toISOString() }] })
      setNote(''); setMessage('实际结果已保存，统计已更新。')
    } catch (error) { setMessage(error instanceof Error ? error.message : '保存失败，请重试。') }
    finally { setSaving(false) }
  }
  const undo = async (id: string) => {
    if (!window.confirm('撤销这条误记的结果？联系记录和邮件发送台账会保留。')) return
    setMessage(''); setSaving(true)
    try {
      const fresh = await work.fetchCurrentRecords()
      await work.save(lead, { resultEvents: normalizeResultEvents(fresh[key]?.resultEvents).map(event => event.id === id ? { ...event, voidedAt: new Date().toISOString() } : event) })
      setMessage('误记已撤销，统计已更新。')
    } catch (error) { setMessage(error instanceof Error ? error.message : '撤销失败。') }
    finally { setSaving(false) }
  }
  return <div className="result-record-panel">
    <p>只记录真实发生的结果，每家公司在每项统计中计一次。样品询问、寄出或讨论不等于已开始评估。</p>
    <form onSubmit={event => void save(event)}><fieldset disabled={work.status !== 'ready' || work.busy || saving}>
      <div className="result-record-fields"><label>实际结果<select aria-label="实际结果" value={kind} onChange={event => setKind(event.target.value as ResultKind)}>{Object.entries(resultLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>发生日期<input aria-label="结果发生日期" type="date" required max={today} value={on} onChange={event => setOn(event.target.value)} /></label></div>
      <label>记录依据<textarea aria-label="结果记录依据" required rows={2} maxLength={500} value={note} onChange={event => setNote(event.target.value)} placeholder="例如：10 月 22 日回复，要求讨论木材底涂的附着力测试条件" /></label>
      <button className="primary-button" disabled={!note.trim()}>{saving ? '保存中…' : '保存实际结果'}</button>
    </fieldset></form>
    {message && <p role="status">{message}</p>}
    <ul className="result-event-list">{[...events].sort((a, b) => b.on.localeCompare(a.on)).map(event => <li key={event.id}><div><strong>{resultLabels[event.kind]}</strong><time>{event.on}</time><p>{event.note}</p></div><button type="button" disabled={work.busy || saving} onClick={() => void undo(event.id)}>撤销误记</button></li>)}</ul>
  </div>
}
