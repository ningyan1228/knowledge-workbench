import { useMemo } from 'react'
import type { PublicLead } from '../../lib/productMarketMap'
import { outreachCompanyKey } from '../../lib/outreachLedger'
import { filterWorkbenchLeads, type BusinessFilters } from '../../lib/leadWorkbench'
import { preparationFilters, preparationLabels, type PreparationFilter } from '../../lib/leadPreparation'
import type { LeadWork } from './useLeadWork'
import type { OutreachLedger } from './useOutreachLedger'
import './LeadPreparationShortcuts.css'

const shortcuts: Array<{ id: Exclude<PreparationFilter, 'all'>; description: string; hint: string }> = [
  { id: 'ready', description: '证据完整、有公开联系入口、共享台账确认未发，且私人记录没有已联系或暂缓状态；不要求有邮箱', hint: '打开客户直接查看首封；缺邮箱也能复制到公开表单或私信，复制前会再次核对发送记录。' },
  { id: 'needs-email', description: '未记录发送，尚无已核验的实际收件邮箱', hint: '缺邮箱仍可正常查看并复制开发信；可使用已公开的表单或私信渠道。' },
  { id: 'sent', description: '公司在共享台账中有有效发送记录，同公司跨产品共用', hint: '打开客户查看发送历史、记录跟进；保留原首封参考。' },
]

export function LeadPreparationShortcuts({ leads, filters, onChange, ledger, work, today }: { leads: PublicLead[]; filters: BusinessFilters; onChange: (filters: BusinessFilters) => void; ledger: OutreachLedger; work: LeadWork; today: string }) {
  const sends = ledger.status === 'ready' ? ledger.sends : null
  const records = work.status === 'ready' ? work.records : null
  const counts = useMemo(() => Object.fromEntries(shortcuts.map(({ id }) => [id, new Set(filterWorkbenchLeads(leads, preparationFilters(filters, id), records, sends, today).map(outreachCompanyKey)).size])), [leads, filters, records, sends, today])
  const hint = sends === null ? '发送状态未知：连接共享发送台账后再区分未发与已发。'
    : records === null ? '私人记录未连接，暂不能排除已联系客户；连接后可使用“可准备首封”。'
      : shortcuts.find(({ id }) => id === filters.preparation)?.hint ?? '待补邮箱仅标明缺项，仍可准备开发信；它可与“可准备首封”重合。数量随当前筛选更新。'
  return <div className="work-preparation">
    <div className="work-preparation-shortcuts" role="group" aria-label="开发准备情况">
      <span>开发准备</span>
      <button type="button" aria-pressed={filters.preparation === 'all'} onClick={() => onChange({ ...filters, preparation: 'all' })}>全部</button>
      {shortcuts.map(({ id, description }) => {
        const unavailable = sends === null || (id === 'ready' && records === null)
        return <button key={id} type="button" data-preparation={id} aria-pressed={filters.preparation === id} disabled={unavailable} title={description} onClick={() => onChange(preparationFilters(filters, id))}><span>{preparationLabels[id]}</span><b>{unavailable ? '—' : counts[id]}</b></button>
      })}
      {sends === null && <strong className="work-preparation-unknown" role="status">发送状态未知</strong>}
    </div>
    <p className="work-preparation-hint" aria-live="polite">{hint}</p>
  </div>
}
