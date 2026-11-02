import { functionalProductPitch } from '../../lib/functionalProductPitch'
import { leadApplication } from '../../lib/leadWorkbench'
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
  const [nextStep, setNextStep] = useState(''), [followUpOn, setFollowUpOn] = useState('')
  const [application, setApplication] = useState(''), [pitch, setPitch] = useState('')
  const [saving, setSaving] = useState(false)
  const key = outreachCompanyKey(lead)
  const events = normalizeResultEvents(work.records[key]?.resultEvents).filter(event => !event.voidedAt)
  const save = async (event: FormEvent) => {
    event.preventDefault(); setMessage(''); setSaving(true)
    try {
      if (!validWorkDate(on) || on > today) throw new Error('请选择真实发生日期，不能填写未来日期。')
      if (!note.trim()) throw new Error('请简要记录实际发生的情况。')
      if (!nextStep.trim()) throw new Error('请填写下一步；结束跟进时可填写不再跟进及原因。')
      if (followUpOn && (!validWorkDate(followUpOn) || followUpOn < on)) throw new Error('下次跟进日期不能早于本次进展日期。')
      const fresh = await work.fetchCurrentRecords()
      const previous = normalizeResultEvents(fresh[key]?.resultEvents)
      if (previous.length >= 200) throw new Error('该公司已达到 200 条结果记录，请先整理历史。')
      const latest = previous.filter(item => !item.voidedAt).sort((a, b) => b.on.localeCompare(a.on))[0]
      const plan = !latest || on >= latest.on ? { nextStep: nextStep.trim(), followUpOn } : {}
      await work.save(lead, { resultEvents: [...previous, { id: crypto.randomUUID(), kind, on, note: note.trim(), recordedAt: new Date().toISOString(), nextStep: nextStep.trim(), followUpOn, application: application.trim(), pitch: pitch.trim() }], ...plan })
      setNote(''); setNextStep(''); setFollowUpOn(''); setMessage('实际结果已保存，统计已更新。')
    } catch (error) { setMessage(error instanceof Error ? error.message : '保存失败，请重试。') }
    finally { setSaving(false) }
  }
  const undo = async (id: string) => {
    if (!window.confirm('撤销这条误记的结果？联系记录和邮件发送台账会保留。')) return
    setMessage(''); setSaving(true)
    try {
      const fresh = await work.fetchCurrentRecords()
      await work.save(lead, { resultEvents: normalizeResultEvents(fresh[key]?.resultEvents).map(event => event.id === id ? { ...event, voidedAt: new Date().toISOString() } : event) })
      setMessage('误记已撤销，统计已更新。当前跟进计划请按实际情况核对调整。')
    } catch (error) { setMessage(error instanceof Error ? error.message : '撤销失败。') }
    finally { setSaving(false) }
  }
  return <div className="result-record-panel">
    <p>首次联系 → 有效回复 → 技术沟通 → 实际寄样 → 样品评估 → 测试反馈 → 报价／订单。只记录真实发生的阶段，暂停、拒绝和不适合请在原始反馈中写明原因。</p>
    <form onSubmit={event => void save(event)}><fieldset disabled={work.status !== 'ready' || work.busy || saving}>
      <div className="result-record-fields"><label>实际结果<select aria-label="实际结果" value={kind} onChange={event => setKind(event.target.value as ResultKind)}>{Object.entries(resultLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>发生日期<input aria-label="结果发生日期" type="date" required max={today} value={on} onChange={event => setOn(event.target.value)} /></label></div>
      <label>原始反馈／记录依据<textarea aria-label="结果记录依据" required rows={2} maxLength={500} value={note} onChange={event => setNote(event.target.value)} placeholder="例如：10 月 22 日回复，要求讨论木材底涂的附着力测试条件" /></label>
      <label>下一步<textarea aria-label="结果下一步" required maxLength={500} rows={2} value={nextStep} onChange={event => setNextStep(event.target.value)} placeholder="例如：确认测试基材与温度；结束跟进时写明原因" /></label>
      <label>下次跟进日期（可留空）<input type="date" aria-label="结果下次跟进日期" min={on} value={followUpOn} onChange={event => setFollowUpOn(event.target.value)} /></label>
      <details><summary>归属应用与实际使用的材料功能表达（用于比较）</summary><p>仅填写本次实际讨论的应用与使用过的表达。留空记录不会归入这两项比较。</p>
      <label>实际应用<input aria-label="结果实际应用" maxLength={500} value={application} onChange={event => setApplication(event.target.value)} /></label><button type="button" onClick={() => setApplication(leadApplication(lead)?.name ?? '')}>填入当前客户应用，再核对</button>
      <label>实际使用的材料功能表达<input aria-label="结果材料功能表达" maxLength={500} value={pitch} onChange={event => setPitch(event.target.value)} /></label><button type="button" onClick={() => setPitch(functionalProductPitch(lead)?.cardEvaluation ?? '')}>填入当前材料功能，再核对</button></details>
      <button className="primary-button" disabled={!note.trim()}>{saving ? '保存中…' : '保存实际结果'}</button>
    </fieldset></form>
    {message && <p role="status">{message}</p>}
    <ul className="result-event-list">{[...events].sort((a, b) => b.on.localeCompare(a.on)).map(event => <li key={event.id}><div><strong>{resultLabels[event.kind]}</strong><time>{event.on}</time><p>{event.note}</p>{event.nextStep && <p>当时的下一步：{event.nextStep}{event.followUpOn && ` · ${event.followUpOn}`}</p>}{event.application && <small>应用：{event.application}</small>}{event.pitch && <p>材料功能表达：{event.pitch}</p>}</div><button type="button" disabled={work.busy || saving} onClick={() => void undo(event.id)}>撤销误记</button></li>)}</ul>
  </div>
}
