import type { PublicLead } from './productMarketMap'
import { outreachCompanyKey } from './outreachLedger'
import { contactChannelLabels, latestContact } from './contactRoutes'
import { latestResultEvent, resultLabels } from './outreachResults'
import type { OutreachLedger } from '../features/market/useOutreachLedger'
import type { LeadWork } from '../features/market/useLeadWork'

export type ContactCopyAction = '邮箱' | '主题' | '正文' | '整封开发信'

/** Always read both histories before a copy, including copies of a different inbox. */
export async function confirmContactCopy(lead: PublicLead, ledger: OutreachLedger | undefined, work: LeadWork | undefined, action: ContactCopyAction, signal: AbortSignal) {
  if (signal.aborted) throw new Error('复制已取消')
  if (ledger?.status !== 'ready') throw new Error('共享发送记录尚未连接，无法核对是否已联系，请连接后重试。')
  const check = new AbortController()
  let timer: ReturnType<typeof setTimeout> | undefined
  let onAbort: () => void = () => {}
  try {
    const cancelled = new Promise<never>((_, reject) => {
      onAbort = () => { check.abort(); reject(new Error('复制已取消')) }
      signal.addEventListener('abort', onAbort, { once: true })
      timer = setTimeout(() => { check.abort(); reject(new Error('联系记录核对超时，请重试。')) }, 8000)
    })
    const [sent, records] = await Promise.race([Promise.all([
      ledger.checkBeforeOutreach(lead, check.signal),
      work?.status === 'ready' ? work.fetchCurrentRecords() : Promise.resolve(null),
    ]), cancelled])
    if (signal.aborted) throw new Error('复制已取消')
    const contact = latestContact(records?.[outreachCompanyKey(lead)]?.contactLog)
    const result = latestResultEvent(records?.[outreachCompanyKey(lead)]?.resultEvents)
    const facts: string[] = []
    if (sent) facts.push(`共享记录：已于 ${sent.sent_on} 发送开发信至 ${sent.recipient_email}。`)
    if (contact) facts.push(`我的记录：已于 ${contact.contactedOn} 通过${contactChannelLabels[contact.channel]}联系，入口：${contact.destination}。`)
    if (result) facts.push(`我的结果记录：${result.on} · ${resultLabels[result.kind]}。${result.note}`)
    if (records === null) facts.push('私人联系记录尚未连接，其他渠道是否已联系仍待确认。')
    const warning = facts.length ? `${lead.company}\n\n${facts.join('\n')}\n\n请先确认是否需要跟进，避免重复联系。${sent && action !== '邮箱' ? '开发信内容保留原参考稿。' : ''}仍要复制${action}吗？` : null
    if (warning && !window.confirm(warning)) return null
    if (signal.aborted) throw new Error('复制已取消')
    return { sent }
  } finally {
    clearTimeout(timer)
    signal.removeEventListener('abort', onAbort)
    check.abort()
  }
}
