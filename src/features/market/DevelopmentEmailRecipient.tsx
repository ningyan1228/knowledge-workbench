import { useEffect, useRef, useState } from 'react'
import { Check, Copy, ExternalLink, LoaderCircle } from 'lucide-react'
import type { PublicLead } from '../../lib/productMarketMap'
import { qualifiedContactCompany, selectBusinessRecipient } from '../../lib/contactEvidence'
import { copyPlainText } from '../../lib/clipboard'

export function DevelopmentEmailRecipient({ lead }: { lead: PublicLead }) {
  const recipient = selectBusinessRecipient(lead)
  const storedEmail = Boolean(lead.profile.generalEmail?.trim() || lead.profile.departmentEmails.some(item => item.email?.trim()) || lead.profile.contacts.some(person => person.email?.trim()))
  const addressLabel = recipient?.provenance !== 'separate-evidence' ? '公开邮箱（待分项核验）'
    : recipient.name ? '已核验负责人邮箱'
      : recipient.kind === 'department' ? '已核验部门邮箱'
        : recipient.kind === 'general' ? '已核验公司邮箱' : '已核验业务邮箱'
  const [state, setState] = useState<'idle' | 'copying' | 'copied'>('idle')
  const [message, setMessage] = useState('')
  const field = useRef<HTMLInputElement>(null)
  const active = useRef<AbortController | null>(null)
  useEffect(() => {
    setState('idle')
    setMessage('')
    return () => { active.current?.abort(); active.current = null }
  }, [lead.id, recipient?.email])
  useEffect(() => {
    if (state !== 'copied') return
    const timer = window.setTimeout(() => setState('idle'), 2200)
    return () => window.clearTimeout(timer)
  }, [state])
  const copy = async () => {
    if (!recipient || active.current) return
    const controller = new AbortController()
    active.current = controller
    setState('copying')
    setMessage('')
    try {
      const copied = await copyPlainText(recipient.email, controller.signal)
      if (controller.signal.aborted) return
      if (copied) {
        setState('copied')
        setMessage('收件邮箱已复制，可以粘贴到邮件收件人栏。')
      } else {
        setState('idle')
        setMessage('浏览器未允许自动复制，已选中邮箱，可按 Ctrl+C 或长按复制。')
        field.current?.focus()
        field.current?.select()
      }
    } finally { if (active.current === controller) active.current = null }
  }
  return <section className="outreach-recipient" aria-label="开发信收件人">
    {recipient ? <>
      <div className="outreach-recipient-address"><label><span>{addressLabel}</span><input ref={field} aria-label={addressLabel} type="text" readOnly value={recipient.email} onFocus={(event) => event.currentTarget.select()} /></label>
        <button type="button" className="secondary-button" disabled={state === 'copying'} aria-busy={state === 'copying'} onClick={() => void copy()}>{state === 'copying' ? <LoaderCircle size={15} className="outreach-copy-spinner" /> : state === 'copied' ? <Check size={15} /> : <Copy size={15} />}{state === 'copying' ? '复制中…' : state === 'copied' ? '邮箱已复制' : '复制邮箱'}</button>
      </div>
      <p>收件公司：{lead.company}</p>
      <p>{recipient.name ? `${recipient.name} · ${recipient.label}` : `${recipient.label.replace(/^General /, '')} · 非具名负责人邮箱`}</p>
      <div className="outreach-recipient-sources"><span>{recipient.provenance === 'separate-evidence' ? `${recipient.verifiedAt} · 邮箱来源已核验` : '旧公开来源 · 分项核验待补'}</span>{recipient.emailSources.map((source, index) => <a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noreferrer" title={source.label}>查看邮箱来源{recipient.emailSources.length > 1 ? ` ${index + 1}` : ''}<ExternalLink size={12} /></a>)}</div>
      <div className="outreach-recipient-feedback" role="status" aria-live="polite">{message}</div>
    </> : <>
      <p><strong>{!qualifiedContactCompany(lead) ? '公司资格尚待核验' : storedEmail ? '已有邮箱记录，来源或归属尚待核验' : '尚未取得已核验的收件邮箱'}</strong></p>
      <p>{!qualifiedContactCompany(lead) ? '请先核对公司的业务资格和联系方式证据。' : storedEmail ? '邮箱证据尚未满足当前收件人核验要求，暂不作为邮件收件人；可通过下方其他公开渠道联系。' : '仍可复制开发信正文到官网联系表单、LinkedIn 或已确认可联系的 WhatsApp；无需虚构收件邮箱。'}</p>
    </>}
  </section>
}
