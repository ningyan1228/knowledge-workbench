import { useEffect, useRef } from 'react'
import { Check, Copy, ExternalLink, LoaderCircle } from 'lucide-react'
import type { PublicLead } from '../../lib/productMarketMap'
import { qualifiedContactCompany, selectBusinessRecipient } from '../../lib/contactEvidence'
import { useEmailCopy } from './useEmailCopy'
import type { OutreachLedger } from './useOutreachLedger'
import type { LeadWork } from './useLeadWork'

export function DevelopmentEmailRecipient({ lead, ledger, work }: { lead: PublicLead; ledger?: OutreachLedger; work?: LeadWork }) {
  const recipient = selectBusinessRecipient(lead)
  const storedEmail = Boolean(lead.profile.generalEmail?.trim() || lead.profile.departmentEmails.some(item => item.email?.trim()) || lead.profile.contacts.some(person => person.email?.trim()))
  const addressLabel = recipient?.provenance !== 'separate-evidence' ? '公开邮箱（待分项核验）'
    : recipient.name ? '已核验负责人邮箱'
      : recipient.kind === 'department' ? '已核验部门邮箱'
        : recipient.kind === 'general' ? '已核验公司邮箱' : '已核验业务邮箱'
  const { state, message, manual, copy, pending } = useEmailCopy(lead, recipient?.email ?? '', ledger, work)
  const field = useRef<HTMLInputElement>(null)
  useEffect(() => { if (manual) { field.current?.focus(); field.current?.select() } }, [manual])
  return <section className="outreach-recipient" aria-label="开发信收件人">
    {recipient ? <>
      <div className="outreach-recipient-address"><label><span>{addressLabel}</span><input ref={field} aria-label={addressLabel} type="text" readOnly value={recipient.email} onFocus={(event) => event.currentTarget.select()} /></label>
        <button type="button" className="secondary-button" disabled={pending} aria-busy={pending} onClick={() => void copy()}>{pending ? <LoaderCircle size={15} className="outreach-copy-spinner" /> : state === 'copied' ? <Check size={15} /> : <Copy size={15} />}{state === 'checking' ? '核对中…' : state === 'copying' ? '复制中…' : state === 'copied' ? '邮箱已复制' : '复制邮箱'}</button>
      </div>
      <details className="outreach-recipient-provenance"><summary>邮箱归属与核验来源</summary><p>收件公司：{lead.company}</p>
      <p>{recipient.name ? `${recipient.name} · ${recipient.label}` : `${recipient.label.replace(/^General /, '')} · 非具名负责人邮箱`}</p>
      <div className="outreach-recipient-sources"><span>{recipient.provenance === 'separate-evidence' ? `${recipient.verifiedAt} · 邮箱来源已核验` : '旧公开来源 · 分项核验待补'}</span>{recipient.emailSources.map((source, index) => <a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noreferrer" title={source.label}>查看邮箱来源{recipient.emailSources.length > 1 ? ` ${index + 1}` : ''}<ExternalLink size={12} /></a>)}</div>
      </details><div className="outreach-recipient-feedback" role="status" aria-live="polite">{message}</div>
    </> : <>
      <p><strong>{!qualifiedContactCompany(lead) ? '公司资格尚待核验' : storedEmail ? '已有邮箱记录，来源或归属尚待核验' : '尚未取得已核验的收件邮箱'}</strong></p>
      <p>{!qualifiedContactCompany(lead) ? '请先核对公司的业务资格和联系方式证据。' : storedEmail ? '邮箱证据尚未满足当前收件人核验要求，暂不作为邮件收件人；可通过下方其他公开渠道联系。' : '仍可复制开发信正文到官网联系表单、LinkedIn 或已确认可联系的 WhatsApp；无需虚构收件邮箱。'}</p>
    </>}
  </section>
}
