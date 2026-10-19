import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Expand, MapPin, Target } from 'lucide-react'
import { leadsInMapBounds, type LeadMapBounds } from '../../lib/leadMapBounds'
import { mapCompanyCount } from '../../lib/leadMapClusters'
import type { PublicLead } from '../../lib/productMarketMap'
import { GlobalLeadMap } from './GlobalLeadMap'
import { LeadCard } from './LeadCard'
import type { OutreachLedger } from './useOutreachLedger'
import type { LeadWork } from './useLeadWork'
import './CustomerMapWorkspace.css'

export function CustomerMapWorkspace({ leads, selectedLead, hoveredLead, onSelectLead, onHighlight, onOpenDetail, overviewToken, onOverview, onReturnRegions, ledger, work }: {
  leads: PublicLead[]; selectedLead: PublicLead | null; hoveredLead: PublicLead | null;
  onSelectLead: (lead: PublicLead | null) => void; onHighlight: (lead: PublicLead | null) => void;
  onOpenDetail: (lead: PublicLead) => void; overviewToken: number; onOverview: () => void;
  onReturnRegions?: () => void; ledger: OutreachLedger; work: LeadWork;
}) {
  const [scope, setScope] = useState<'all' | 'viewport'>('viewport')
  const [bounds, setBounds] = useState<LeadMapBounds | null>(null)
  const sidebar = useRef<HTMLDivElement>(null)
  const visible = useMemo(() => leadsInMapBounds(leads, bounds), [leads, bounds])
  const sidebarLeads = scope === 'viewport' ? visible : leads
  const allCount = mapCompanyCount(leads), visibleCount = mapCompanyCount(visible)
  const onBoundsChange = useCallback((next: LeadMapBounds) => {
    setBounds((previous) => previous && previous.south === next.south && previous.west === next.west && previous.north === next.north && previous.east === next.east ? previous : next)
  }, [])
  const showAll = () => { setScope('all'); sidebar.current?.scrollTo({ top: 0, behavior: 'instant' }); onOverview() }

  useEffect(() => {
    if (!selectedLead || !sidebarLeads.some((lead) => lead.id === selectedLead.id)) return
    const frame = requestAnimationFrame(() => {
      const container = sidebar.current
      const card = document.getElementById('map-card-' + selectedLead.id)
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
  }, [selectedLead, sidebarLeads])

  return <>
    <div className="map-list-toolbar">
      <div className="map-list-scope" role="group" aria-label="地图与列表范围">
        <button type="button" aria-pressed={scope === 'all'} onClick={() => setScope('all')}>全部筛选结果 <strong>{allCount}</strong></button>
        <button type="button" aria-pressed={scope === 'viewport'} onClick={() => setScope('viewport')}>当前地图范围 <strong>{visibleCount}</strong></button>
      </div>
      <button type="button" className="map-show-all" onClick={showAll}><Expand size={14} />查看全部结果</button>
      <span className="map-list-context" role="status">{scope === 'viewport' ? `列表随地图移动和缩放更新 · ${visibleCount} / ${allCount} 家` : `列表显示全部筛选结果 · 地图内 ${visibleCount} / ${allCount} 家`}</span>
    </div>
    <div className="market-map-layout lead-map-layout mac-customer-map">
      <div><GlobalLeadMap leads={leads} selectedLead={selectedLead} hoveredLead={hoveredLead} overviewToken={overviewToken} onBoundsChange={onBoundsChange} onReturnRegions={onReturnRegions}
        onSelectLead={(lead) => { onHighlight(null); onSelectLead(lead) }}
        onSelectGroup={() => { setScope('viewport'); onHighlight(null); onSelectLead(null) }} /></div>
      <div ref={sidebar} className="lead-map-sidebar" aria-label="地图客户列表">
        <div className="sidebar-title"><Target size={16} /><strong>{scope === 'viewport' ? '当前地图范围' : '全部筛选结果'} · {mapCompanyCount(sidebarLeads)} 家</strong></div>
        {sidebarLeads.map((lead) => <LeadCard key={lead.id} lead={lead} selected={lead.id === selectedLead?.id} onHighlight={onHighlight} onSelect={(lead) => { onHighlight(null); onSelectLead({ ...lead }) }} onOpenDetail={onOpenDetail} ledger={ledger} work={work} />)}
        {leads.length > 0 && sidebarLeads.length === 0 && <div className="map-list-empty"><MapPin size={24} /><strong>当前地图范围内没有客户</strong><p>拖动或缩小地图，或查看全部筛选结果。</p><button type="button" className="secondary-button" onClick={showAll}>查看全部结果</button></div>}
      </div>
    </div>
  </>
}
