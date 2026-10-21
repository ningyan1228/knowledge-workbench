import type { PublicLead } from '../../lib/productMarketMap'
import { outreachCompanyKey } from '../../lib/outreachLedger'
import { filterWorkbenchLeads, type BusinessFilters } from '../../lib/leadWorkbench'
import type { LeadWork } from './useLeadWork'
import type { OutreachLedger } from './useOutreachLedger'
import './LeadPreparationShortcuts.css'

export function LeadPreparationShortcuts({ leads, filters, onChange, ledger, work, today }: { leads: PublicLead[]; filters: BusinessFilters; onChange: (filters: BusinessFilters) => void; ledger: OutreachLedger; work: LeadWork; today: string }) {
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const id = useId()
  const selected = [
    { key: 'contact' as const, label: ({ email:'公开邮箱', form:'官网联系页', linkedin:'LinkedIn', whatsapp:'公开 WhatsApp', phone:'公开电话', named:'具名联系人' } as Record<string,string>)[filters.contact] },
    { key: 'completeness' as const, label: ({ 'needs-email':'邮箱待补', 'needs-application':'应用证据待补', 'needs-evidence':'核验资料待补' } as Record<string,string>)[filters.completeness] },
    { key: 'preparation' as const, label: ({ ready:'可准备首封', 'needs-email':'待补邮箱', sent:'已记录发送' } as Record<string,string>)[filters.preparation] },
  ].filter(item => filters[item.key] !== 'all')
  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (!open) { if (element.open) element.close(); return }
    const overflow = document.body.style.overflow
    element.showModal()
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = overflow; if (element.open) element.close() }
  }, [open])
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
  return <div className="work-preparation-compact">
    <div className="work-preparation-quick" role="group" aria-label="发送记录快捷筛选"><span>发送记录</span>{([{id:'all',label:'全部'},{id:'sent',label:'已记录发送'},{id:'unsent',label:'未查到发送记录'}] as const).map(option => <button key={option.id} type="button" data-quick-send={option.id} aria-pressed={filters.sendStatus === option.id} disabled={option.id !== 'all' && sends === null} title={option.id === 'unsent' ? '共享台账中没有有效记录，不代表确定未发送。' : undefined} onClick={() => onChange({ ...filters, sendStatus:option.id, preparation:'all' })}>{option.label}</button>)}</div>
    <button type="button" className="work-dimensions-open" aria-haspopup="dialog" aria-expanded={open} aria-controls={id} onClick={() => setOpen(true)}><SlidersHorizontal size={14} />渠道与资料筛选{selected.length > 0 && <b>{selected.length}</b>}</button>
    {selected.map(item => <button key={item.key} type="button" className="work-dimension-chip" aria-label={`移除筛选：${item.label}`} onClick={() => onChange({ ...filters, [item.key]:'all' })}>{item.label}<X size={12} /></button>)}
    {filters.sendStatus === 'unknown' && <button type="button" className="work-dimension-chip" aria-label="移除筛选：记录待确认" onClick={() => onChange({ ...filters, sendStatus:'all' })}>记录待确认<X size={12} /></button>}
    {ledger.status === 'error' && <button type="button" className="work-dimension-error" onClick={() => setOpen(true)}>发送记录读取失败</button>}
    <dialog ref={dialog} id={id} className="work-dimensions-dialog" aria-labelledby={`${id}-title`} onClose={() => setOpen(false)} onCancel={() => setOpen(false)} onKeyDown={event => {
      if (event.key !== 'Tab') return
      const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')]
      const first = buttons[0], last = buttons.at(-1)
      if (event.shiftKey && document.activeElement === first && last) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last && first) { event.preventDefault(); first.focus() }
    }} onMouseDown={event => {
      if (event.target !== event.currentTarget) return
      const rect = event.currentTarget.getBoundingClientRect()
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) setOpen(false)
    }}>
      <header><div><h2 id={`${id}-title`}>客户开发筛选</h2><p>按发送记录、联系渠道和资料缺项组合筛选。</p></div><button type="button" aria-label="关闭开发筛选" onClick={() => setOpen(false)}><X size={18} /></button></header>
      <div className="work-preparation">
    {group('sendStatus', '发送记录', [{ id:'all', label:'全部' }, { id:'unsent', label:'未查到发送记录' }, { id:'sent', label:'已记录发送' }, { id:'unknown', label:'记录待确认' }])}
    {group('contact', '可用联系渠道', [{ id:'all', label:'全部' }, { id:'email', label:'公开邮箱' }, { id:'form', label:'官网联系页' }, { id:'linkedin', label:'LinkedIn' }, { id:'whatsapp', label:'公开 WhatsApp' }, { id:'phone', label:'公开电话' }])}
    {group('completeness', '资料完整度', [{ id:'all', label:'全部' }, { id:'needs-email', label:'邮箱待补' }, { id:'needs-application', label:'应用证据待补' }, { id:'needs-evidence', label:'核验资料待补' }])}
    <div className="work-preparation-shortcuts" role="group" aria-label="开发准备情况"><span>开发准备</span><button type="button" aria-pressed={filters.preparation === 'all'} onClick={() => onChange({ ...filters, preparation:'all' })}>全部</button><button type="button" data-preparation="ready" disabled={sends === null || records === null} aria-pressed={filters.preparation === 'ready'} onClick={() => onChange({ ...filters, preparation:'ready', sendStatus:'all', stage:'all', queue:'all' })}><span>可准备首封</span><b>{sends === null || records === null ? '—' : count({ preparation:'ready', sendStatus:'all', stage:'all', queue:'all' })}</b></button></div>
    <p className="work-preparation-hint" aria-live="polite">{ledger.status === 'error' ? `发送记录读取失败：${ledger.error ?? '请重试。'}` : sends === null ? '发送记录待确认：连接共享台账后可核对；未连接不等于没有发送。' : '未查到发送记录仅指共享台账中没有有效记录，不代表确定未发送。'}{ledger.status === 'error' && <button type="button" onClick={() => void ledger.refresh()}>重试读取</button>}</p>
    <p className="work-preparation-hint">渠道与资料缺项可独立组合筛选；缺邮箱仍可通过公开表单或私信准备正文。{records === null && '私人记录未连接，暂不能排除已有其他渠道联系。'}</p>
      </div>
      <footer><button type="button" className="work-dimensions-reset" onClick={() => onChange({ ...filters, sendStatus:'all', contact:'all', completeness:'all', preparation:'all' })}>重置这些筛选</button><button type="button" className="work-dimensions-done" onClick={() => setOpen(false)}>查看结果</button></footer>
    </dialog>
  </div>
}
import { useEffect, useId, useRef, useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
