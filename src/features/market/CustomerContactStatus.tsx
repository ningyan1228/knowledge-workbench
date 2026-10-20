import { CheckCircle2 } from 'lucide-react'
import { contactChannelLabels, latestContact, type ContactLogEntry } from '../../lib/contactRoutes'
import { shanghaiDay } from '../../lib/leadTimeline'
import { OutreachStatusBadge } from './OutreachStatusBadge'
import './CustomerContactStatus.css'

/** Private channel contacts and shared email sends are separate facts. */
export function CustomerContactStatus({ contactLog, emailState, sentOn, compact = false }: {
  contactLog?: ContactLogEntry[]
  emailState: 'sent' | 'unsent' | 'unknown'
  sentOn?: string
  compact?: boolean
}) {
  const contact = latestContact(contactLog)
  const today = shanghaiDay(new Date().toISOString())
  const date = contact?.contactedOn
  const label = date && date.startsWith(today.slice(0, 4)) ? `${Number(date.slice(5, 7))}月${Number(date.slice(8, 10))}日` : date
  return <span className="customer-contact-status" aria-label="客户联系与邮件状态">
    {contact && <span className="customer-channel-status" data-contact-channel={contact.channel} title={`当前账号私人记录：${contactChannelLabels[contact.channel]} · ${date} · ${contact.destination}；不代表邮件已发送。`}>
      <CheckCircle2 size={14} aria-hidden="true" /><span>{contactChannelLabels[contact.channel]}已联系 · <time dateTime={date}>{label}</time><small>（我的记录）</small></span>
    </span>}
    <OutreachStatusBadge state={emailState} sentOn={sentOn} compact={compact} />
  </span>
}
