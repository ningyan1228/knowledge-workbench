import { CheckCircle2, CircleHelp, Clock3 } from 'lucide-react'
import './OutreachStatusBadge.css'

export function OutreachStatusBadge({ state, sentOn, compact = false }: { state: 'sent' | 'unsent' | 'unknown'; sentOn?: string; compact?: boolean }) {
  const Icon = state === 'sent' ? CheckCircle2 : state === 'unsent' ? Clock3 : CircleHelp
  const label = state === 'sent' ? '邮件已发送' : state === 'unsent' ? '邮件未发送（无记录）' : '邮件发送状态未确认'
  const detail = state === 'sent' ? `共享台账已记录发送${sentOn ? `：${sentOn}` : ''}` : state === 'unsent' ? '共享台账暂无发送记录；实际发送后请手动标记，复制草稿不算发送。' : '共享发送记录尚不可用，暂不能判断是否已发送。'
  return <span className={`outreach-status-badge outreach-status-${state}`} data-send-state={state} title={detail}><Icon size={14} aria-hidden="true" />{label}{state === 'sent' && sentOn && !compact && <> · <time dateTime={sentOn}>{sentOn}</time></>}</span>
}
