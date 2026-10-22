import type { PublicLead } from './productMarketMap'
import { qualifiedContactCompany, selectBusinessRecipient } from './contactEvidence'
import { activeOutreachSend, outreachCompanyKey, type OutreachSend } from './outreachLedger'
import { createShortDevelopmentEmail } from './shortDevelopmentEmail'
import { latestContact } from './contactRoutes'
import { latestResultEvent } from './outreachResults'
import type { BusinessFilters, WorkRecords } from './leadWorkbench'

export type PreparationFilter = 'all' | 'ready' | 'needs-email' | 'sent'
export const preparationLabels = { all: '全部准备情况', ready: '可准备首封', 'needs-email': '待补邮箱', sent: '已发送' } as const

/** A draft can be prepared for any qualified public route; only email exports require an inbox. */
export function canPrepareFirstContact(lead: PublicLead, sends: OutreachSend[] | null, records: WorkRecords | null) {
  if (sends === null || records === null || activeOutreachSend(sends, lead)) return false
  const record = records[outreachCompanyKey(lead)]
  if ((record?.stage && record.stage !== 'todo') || latestContact(record?.contactLog) || latestResultEvent(record?.resultEvents)) return false
  return Boolean(createShortDevelopmentEmail(lead, undefined, 'concise'))
}

/** Missing an inbox is a separate fact and can overlap with readiness for other public routes. */
export function matchesPreparation(lead: PublicLead, preparation: PreparationFilter, sends: OutreachSend[] | null, records: WorkRecords | null) {
  return preparation === 'all' || (preparation === 'ready' ? canPrepareFirstContact(lead, sends, records) : leadPreparation(lead, sends, records) === preparation)
}

/** Sending is a shared fact; an unreadable ledger is never proof of an unsent customer. */
export function leadPreparation(lead: PublicLead, sends: OutreachSend[] | null, records: WorkRecords | null) {
  if (sends === null) return 'unknown'
  if (activeOutreachSend(sends, lead)) return 'sent'
  if (!qualifiedContactCompany(lead)) return 'review'
  if (!selectBusinessRecipient(lead)) return 'needs-email'
  const record = records?.[outreachCompanyKey(lead)]
  if (records === null || (record?.stage && record.stage !== 'todo') || latestContact(record?.contactLog) || latestResultEvent(record?.resultEvents)) return 'review'
  return createShortDevelopmentEmail(lead, undefined, 'concise') ? 'ready' : 'review'
}

/** A shortcut replaces conflicting work/send filters while preserving the research scope. */
export function preparationFilters(filters: BusinessFilters, preparation: PreparationFilter): BusinessFilters {
  return { ...filters, preparation, sendStatus: 'all', stage: 'all', queue: 'all' }
}
