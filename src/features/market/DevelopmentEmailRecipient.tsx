import { useEffect, useRef, useState } from 'react'
import { Check, Copy, ExternalLink, LoaderCircle } from 'lucide-react'
import type { PublicLead } from '../../lib/productMarketMap'
import { selectBusinessRecipient } from '../../lib/contactEvidence'
import { copyPlainText } from '../../lib/clipboard'

export function DevelopmentEmailRecipient({ lead }: { lead: PublicLead }) {
  const recipient = selectBusinessRecipient(lead)
  const addressLabel = recipient?.provenance === 'separate-evidence' ? '建议收件邮箱' : '公开邮箱（待分项核验）'
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
    </> : <p>暂无可推荐的公开业务邮箱，请在“概览与联系”中查看联系入口或补齐邮箱证据。</p>}
  </section>
}
