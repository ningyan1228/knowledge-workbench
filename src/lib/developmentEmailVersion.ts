import type { PublicLead } from './productMarketMap'
import { activeOutreachSend, type OutreachSend } from './outreachLedger'
import { createShortDevelopmentEmail } from './shortDevelopmentEmail'
import { qualifiedContactCompany, selectBusinessRecipient } from './contactEvidence'

/** The shared badge is the scope boundary. Unknown ledger state never means unsent. */
export function developmentEmailVersion(lead: PublicLead, sends: OutreachSend[] | null) {
  const sent = sends === null ? null : activeOutreachSend(sends, lead)
  const state = sends === null ? 'unknown' : sent ? 'sent' : 'unsent'
  const style = state === 'unsent' ? 'concise' : 'legacy'
  const pendingEmail = state !== 'sent' && qualifiedContactCompany(lead) && !selectBusinessRecipient(lead)
  return {
    state, style, sent, pendingEmail,
    email: pendingEmail ? null : createShortDevelopmentEmail(lead, undefined, style),
    label: pendingEmail ? '待补邮箱 · 暂不生成开发信' : state === 'unsent' ? '简洁首封 · 未记录发送' : state === 'sent' ? '原版参考 · 已记录发送' : '原版参考 · 发送状态未确认',
    note: pendingEmail ? '请先在“概览与联系”中查看公开联系入口，补充并核验实际收件邮箱后再准备首封。' : state === 'unsent' ? '结合该公司的具体业务，温和询问材料是否相关；当前采购需求与时机仍待确认。'
      : state === 'sent' ? '该公司已有发送记录，保留原版首封参考。此处没有保存实际已发邮件正文，跟进信另行准备。'
        : '连接共享发送记录后，未记录发送的公司会显示简洁版。',
  } as const
}
