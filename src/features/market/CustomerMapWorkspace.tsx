import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Building2, ChevronRight, Expand, MapPin, Target } from 'lucide-react'
import { marketProducts } from '../../lib/productMarketMap'
import { leadIndustry } from '../../lib/leadWorkbench'
import { leadCardBrief } from '../../lib/leadCardBrief'
import { leadsInMapBounds, type LeadMapBounds } from '../../lib/leadMapBounds'
import { mapCompanyCount } from '../../lib/leadMapClusters'
import type { PublicLead } from '../../lib/productMarketMap'
import { GlobalLeadMap } from './GlobalLeadMap'
import { LeadCard } from './LeadCard'
import type { CompanyDetailOpenTarget } from './CompanyDetailSections'
import type { OutreachLedger } from './useOutreachLedger'
import type { LeadWork } from './useLeadWork'
import './CustomerMapWorkspace.css'

export function CustomerMapWorkspace({ leads, selectedLead, hoveredLead, onSelectLead, onHighlight, onOpenDetail, detailOpen = false, overviewToken, onOverview, onReturnRegions, ledger, work, dataRevision = 0 }: {
  dataRevision?: number;
  leads: PublicLead[]; selectedLead: PublicLead | null; hoveredLead: PublicLead | null;
  onSelectLead: (lead: PublicLead | null) => void; onHighlight: (lead: PublicLead | null) => void;
  onOpenDetail: (lead: PublicLead, target?: CompanyDetailOpenTarget) => void; detailOpen?: boolean; overviewToken: number; onOverview: () => void;
  onReturnRegions?: () => void; ledger: OutreachLedger; work: LeadWork;
}) {
  const [scope, setScope] = useState<'all' | 'viewport'>('viewport')
  const [bounds, setBounds] = useState<LeadMapBounds | null>(null)
  const sidebar = useRef<HTMLDivElement>(null)
  const previousRevision = useRef(dataRevision)
  const visible = useMemo(() => leadsInMapBounds(leads, bounds), [leads, bounds])
  const sidebarLeads = scope === 'viewport' ? visible : leads
  const allCount = mapCompanyCount(leads), visibleCount = mapCompanyCount(visible)
  const activeLead = selectedLead && leads.find(lead => lead.id === selectedLead.id) || sidebarLeads[0] || null
  const onBoundsChange = useCallback((next: LeadMapBounds) => {
    setBounds((previous) => previous && previous.south === next.south && previous.west === next.west && previous.north === next.north && previous.east === next.east ? previous : next)
  }, [])
  const showAll = () => { setScope('all'); sidebar.current?.scrollTo({ top: 0, behavior: 'instant' }); onOverview() }

  useEffect(() => {
    if (previousRevision.current !== dataRevision) { previousRevision.current = dataRevision; return }
    if (!selectedLead || !sidebarLeads.some((lead) => lead.id === selectedLead.id)) return
    const frame = requestAnimationFrame(() => {
      const container = sidebar.current
      const card = document.getElementById('map-row-' + selectedLead.id)
      if (!container || !card) return
      const header = container.querySelector<HTMLElement>('.sidebar-title')
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
      if (getComputedStyle(container).overflowY === 'visible') {
        card.scrollIntoView({ block: 'nearest', behavior })
        return
      }
      // Scroll only the card list, keeping the map and page position stable.
      const top = container.scrollTop + card.getBoundingClientRect().top - container.getBoundingClientRect().top - (header?.offsetHeight ?? 0) - 10
      container.scrollTo({ top: Math.max(0, top), behavior })
    })
    return () => cancelAnimationFrame(frame)
  }, [selectedLead?.id, sidebarLeads, dataRevision])

  return <>
    <div className="map-list-toolbar">
      <div className="map-list-scope" role="group" aria-label="地图与列表范围">
        <button type="button" aria-pressed={scope === 'all'} onClick={() => setScope('all')}>全部筛选结果 <strong>{allCount}</strong></button>
        <button type="button" aria-pressed={scope === 'viewport'} onClick={() => setScope('viewport')}>当前地图范围 <strong>{visibleCount}</strong></button>
      </div>
      <button type="button" className="map-show-all" onClick={showAll}><Expand size={14} />查看全部结果</button>
      <span className="map-list-context" role="status">{scope === 'viewport' ? `列表随地图移动和缩放更新 · ${visibleCount} / ${allCount} 家` : `列表显示全部筛选结果 · 地图内 ${visibleCount} / ${allCount} 家`}</span>
    </div>
    <div className="market-map-layout lead-map-layout mac-customer-map customer-explorer">
      <div ref={sidebar} className="explorer-directory" aria-label="地图客户列表">
        <div className="sidebar-title"><div><span className="explorer-eyebrow">CUSTOMER DIRECTORY</span><h2>发现合适的客户</h2></div><strong>{mapCompanyCount(sidebarLeads)}</strong></div>
        <p className="explorer-directory-hint">选择公司，查看业务依据与开发入口</p>
        {sidebarLeads.map(lead => {
          const product = marketProducts.find(item => item.id === lead.productId)
          const sent = ledger.status === 'ready' ? ledger.activeSend(lead) : null
          return <button key={lead.id} id={'map-row-' + lead.id} type="button" className={`explorer-company${activeLead?.id === lead.id ? ' is-active' : ''}`} aria-current={activeLead?.id === lead.id ? 'true' : undefined} onClick={() => { onHighlight(null); onSelectLead({ ...lead }) }} onMouseEnter={() => onHighlight(lead)} onMouseLeave={() => onHighlight(null)} onFocus={() => onHighlight(lead)} onBlur={() => onHighlight(null)}>
            <span className="explorer-monogram" aria-hidden="true">{lead.company.slice(0, 2).toUpperCase()}</span>
            <span className="explorer-company-copy"><strong>{lead.company}</strong><span>{lead.countryZh} · {leadIndustry(lead)}</span><span className="explorer-company-tags"><i style={{ background: product?.color }} />{product?.name}<small>{ledger.status !== 'ready' ? '记录待核对' : sent ? '已记录发送' : '未查到发送记录'}</small></span></span><ChevronRight size={14} />
          </button>
        })}
        {!sidebarLeads.length && <div className="map-list-empty"><MapPin size={24} /><strong>{leads.length ? '当前地图范围内没有客户' : '没有匹配的客户'}</strong><p>{leads.length ? '继续拖动地图，或查看全部筛选结果。' : '请调整搜索或筛选条件。'}</p>{leads.length > 0 && <button type="button" className="secondary-button" onClick={showAll}>查看全部结果</button>}</div>}
      </div>
      <div><GlobalLeadMap onReset={showAll} dataRevision={dataRevision} leads={leads} selectedLead={selectedLead} hoveredLead={hoveredLead} detailOpen={detailOpen} overviewToken={overviewToken} onBoundsChange={onBoundsChange} onReturnRegions={onReturnRegions}
        onSelectLead={(lead) => { onHighlight(null); onSelectLead(lead) }}
        onSelectGroup={() => { setScope('viewport'); onHighlight(null); onSelectLead(null) }} /></div>
      <aside className="explorer-inspector" aria-label="所选客户概览">
        {activeLead ? <><div className="explorer-profile"><span className="explorer-eyebrow"><Building2 size={14} />客户概览 · {activeLead.countryZh}</span><h2>{activeLead.company}</h2><p>{leadIndustry(activeLead)}</p><span className="explorer-profile-product"><Target size={14} />{leadCardBrief(activeLead).product}</span></div>
          <div className="explorer-detail-heading"><strong>业务与开发</strong><span>适配待评估 · 采购未确认</span></div>
          <LeadCard key={activeLead.id} lead={activeLead} onHighlight={onHighlight} onSelect={onSelectLead} onOpenDetail={onOpenDetail} ledger={ledger} work={work} />
        </> : <div className="map-list-empty"><Building2 size={30} /><strong>从地图或列表选择客户</strong><p>在这里查看核验依据、公开联系渠道和开发信。</p></div>}
      </aside>
    </div>
  </>
}
