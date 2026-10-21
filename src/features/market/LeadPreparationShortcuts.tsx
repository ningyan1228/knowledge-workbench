import type { PublicLead } from '../../lib/productMarketMap'
import { outreachCompanyKey } from '../../lib/outreachLedger'
import { filterWorkbenchLeads, type BusinessFilters } from '../../lib/leadWorkbench'
import type { LeadWork } from './useLeadWork'
import type { OutreachLedger } from './useOutreachLedger'
import './LeadPreparationShortcuts.css'

export function LeadPreparationShortcuts({ leads, filters, onChange, ledger, work, today }: { leads: PublicLead[]; filters: BusinessFilters; onChange: (filters: BusinessFilters) => void; ledger: OutreachLedger; work: LeadWork; today: string }) {
  const sends = ledger.status === 'ready' ? ledger.sends : null
  const records = work.status === 'ready' ? work.records : null
  const count = (patch: Partial<BusinessFilters>) => new Set(filterWorkbenchLeads(leads, { ...filters, ...patch }, records, sends, today).map(outreachCompanyKey)).size
  const group = <K extends 'sendStatus' | 'contact' | 'completeness'>(key: K, label: string, options: Array<{ id: BusinessFilters[K]; label: string }>) => <div className="work-preparation-shortcuts" role="group" aria-label={label}>
    <span>{label}</span>{options.map(option => {
      const unavailable = key === 'sendStatus' && option.id !== 'all' && option.id !== 'unknown' && sends === null
      const values = { [key]: option.id } as Partial<BusinessFilters>
      return <button key={option.id} type="button" data-dimension={key} data-filter={option.id} aria-pressed={filters[key] === option.id} disabled={unavailable} onClick={() => onChange({ ...filters, ...values })}><span>{option.label}</span><b>{unavailable ? '—' : count(values)}</b></button>
    })}
  </div>
  return <div className="work-preparation">
    {group('sendStatus', '发送记录', [{ id:'all', label:'全部' }, { id:'unsent', label:'未查到发送记录' }, { id:'sent', label:'已记录发送' }, { id:'unknown', label:'记录待确认' }])}
    {group('contact', '可用联系渠道', [{ id:'all', label:'全部' }, { id:'email', label:'公开邮箱' }, { id:'form', label:'官网联系页' }, { id:'linkedin', label:'LinkedIn' }, { id:'whatsapp', label:'公开 WhatsApp' }, { id:'phone', label:'公开电话' }])}
    {group('completeness', '资料完整度', [{ id:'all', label:'全部' }, { id:'needs-email', label:'邮箱待补' }, { id:'needs-application', label:'应用证据待补' }, { id:'needs-evidence', label:'核验资料待补' }])}
    <div className="work-preparation-shortcuts" role="group" aria-label="开发准备情况"><span>开发准备</span><button type="button" aria-pressed={filters.preparation === 'all'} onClick={() => onChange({ ...filters, preparation:'all' })}>全部</button><button type="button" data-preparation="ready" disabled={sends === null || records === null} aria-pressed={filters.preparation === 'ready'} onClick={() => onChange({ ...filters, preparation:'ready', sendStatus:'all', stage:'all', queue:'all' })}><span>可准备首封</span><b>{sends === null || records === null ? '—' : count({ preparation:'ready', sendStatus:'all', stage:'all', queue:'all' })}</b></button></div>
    <p className="work-preparation-hint" aria-live="polite">{ledger.status === 'error' ? `发送记录读取失败：${ledger.error ?? '请重试。'}` : sends === null ? '发送记录待确认：连接共享台账后可核对；未连接不等于没有发送。' : '未查到发送记录仅指共享台账中没有有效记录，不代表确定未发送。'}{ledger.status === 'error' && <button type="button" onClick={() => void ledger.refresh()}>重试读取</button>}</p>
    <p className="work-preparation-hint">渠道与资料缺项可独立组合筛选；缺邮箱仍可通过公开表单或私信准备正文。{records === null && '私人记录未连接，暂不能排除已有其他渠道联系。'}</p>
  </div>
}
