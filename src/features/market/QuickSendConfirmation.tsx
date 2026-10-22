import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { CalendarCheck, CheckCircle2, X } from 'lucide-react'
import type { PublicLead } from '../../lib/productMarketMap'
import { activeOutreachSend, localDateToday, validOutreachEmail } from '../../lib/outreachLedger'
import { selectBusinessRecipient } from '../../lib/contactEvidence'
import type { OutreachLedger } from './useOutreachLedger'
import './QuickSendConfirmation.css'

/** Recording remains an explicit user action, separate from copying or sending. */
export function QuickSendConfirmation({ lead, ledger, onOpenSendRecord }: { lead: PublicLead; ledger: OutreachLedger; onOpenSendRecord?: () => void }) {
  const [open, setOpen] = useState(false)
  const [recipient, setRecipient] = useState('')
  const [day, setDay] = useState(localDateToday())
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const locked = useRef(false)
  const mounted = useRef(true)
  const titleId = useId()
  const sent = ledger.status === 'ready' ? activeOutreachSend(ledger.sends, lead) : null
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open) element.showModal()
    else if (element.open) element.close()
    return () => { if (element.open) element.close() }
  }, [open])
  const close = () => { if (!locked.current) setOpen(false) }
  const start = () => {
    if (sent) { onOpenSendRecord?.(); return }
    setRecipient(selectBusinessRecipient(lead)?.email ?? '')
    setDay(localDateToday()); setMessage(''); setOpen(true)
  }
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (locked.current) return
    if (!validOutreachEmail(recipient) || !day || day > localDateToday()) { setMessage('请核对实际收件邮箱和发送日期。'); return }
    locked.current = true; setSaving(true); setMessage('')
    try {
      // markSent performs a fresh company check and rejects concurrent duplicates.
      await ledger.markSent(lead, recipient.trim(), day)
      if (mounted.current) { setMessage('已记录发送。'); setOpen(false) }
    } catch (error) {
      if (mounted.current) setMessage(error instanceof Error ? error.message : '记录失败，请重试。')
    } finally {
      locked.current = false
      if (mounted.current) setSaving(false)
    }
  }
  return <div className="outreach-quick-send">
    <button ref={button} type="button" className={`secondary-button outreach-quick-send-button${sent ? ' is-sent' : ''}`} disabled={ledger.status !== 'ready' || ledger.busy || saving} aria-haspopup={sent ? undefined : 'dialog'} onClick={start}>{sent ? <CheckCircle2 size={15} /> : <CalendarCheck size={15} />}{sent ? '已发送 · 查看记录' : '确认已发送'}</button>
    {!open && message && <span className="quick-send-feedback" role="status">{message}</span>}
    <dialog ref={dialog} className="quick-send-dialog" aria-labelledby={titleId} onCancel={event => { event.preventDefault(); close() }} onClose={() => { setOpen(false); button.current?.focus({ preventScroll:true }) }} onKeyDown={event => {
      event.stopPropagation()
      if (event.key !== 'Tab') return
      const items = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled)')]
      const first = items[0], last = items.at(-1)
      if (event.shiftKey && document.activeElement === first && last) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last && first) { event.preventDefault(); first.focus() }
    }}>
      <header><h3 id={titleId}>确认已发送邮件</h3><button type="button" className="icon-button" aria-label="关闭发送确认" disabled={saving} onClick={close}><X size={18} /></button></header>
      <form onSubmit={event => void save(event)}>
        <p className="quick-send-company">{lead.company}</p>
        <p>请核对实际收件邮箱和日期。这里只记录已发出的邮件，复制草稿不算发送。</p>
        {sent ? <p className="quick-send-existing" role="status">该公司已记录发送：{sent.sent_on} → {sent.recipient_email}。无需重复记录。</p> : <fieldset disabled={saving || ledger.busy}>
          <label>实际收件邮箱<input autoFocus required type="email" autoComplete="off" value={recipient} placeholder="recipient@company.com" onChange={event => setRecipient(event.target.value)} /></label>
          <label>实际发送日期<input required type="date" max={localDateToday()} value={day} onChange={event => setDay(event.target.value)} /></label>
          <p className="quick-send-shared">保存到共享发送记录，同事也可看到。</p>
          {message && <p role="alert" className="quick-send-error">{message}</p>}
          {ledger.status !== 'ready' && <p role="alert" className="quick-send-error">发送记录未连接，请稍后重试。</p>}
          <footer><button type="button" className="secondary-button" onClick={close}>取消</button><button type="submit" className="primary-button" disabled={ledger.status !== 'ready' || !validOutreachEmail(recipient) || !day || day > localDateToday()}>{saving ? '正在记录…' : '确认已实际发送'}</button></footer>
        </fieldset>}
        {sent && <footer><button type="button" className="secondary-button" onClick={close}>关闭</button><button type="button" className="primary-button" onClick={() => { close(); onOpenSendRecord?.() }}>查看发送记录</button></footer>}
      </form>
    </dialog>
  </div>
}
