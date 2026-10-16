import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { divIcon, latLngBounds } from 'leaflet'
import { ArrowLeft } from 'lucide-react'
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import { leadMapGroups, mapCountryGroups, type LeadMapGroup } from '../../lib/leadMapClusters'
import { marketProducts, type PublicLead } from '../../lib/productMarketMap'
import { leadMapViewport } from '../../lib/leadMapViewport'
import './GlobalLeadMap.css'

function MapFocus({ target, leads, overviewToken, closeUp }: { target: PublicLead | null; leads: PublicLead[]; overviewToken: number; closeUp: boolean }) {
  const map = useMap()
  const { bounds: [[south, west], [north, east]], maxZoom } = leadMapViewport(leads, closeUp)
  useEffect(() => {
    const fit = () => {
      map.invalidateSize()
      map.setMinZoom(Math.max(0, Math.log2(map.getSize().x / 256)))
      const narrow = map.getSize().x < 500
      const horizontalPadding = narrow ? 38 : 56
      map.fitBounds([[south, west], [north, east]], { paddingTopLeft: [horizontalPadding, narrow ? 40 : 72], paddingBottomRight: [horizontalPadding, narrow ? 48 : 36], maxZoom, animate: false })
    }
    fit()
    let frame = 0
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(fit)
    })
    observer.observe(map.getContainer())
    return () => { observer.disconnect(); cancelAnimationFrame(frame) }
  }, [map, south, west, north, east, maxZoom, overviewToken])
  useEffect(() => {
    if (target) map.setView([target.latitude, target.longitude], Math.max(map.getZoom(), 12), { animate: false })
  }, [map, target])
  return null
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!)
}

function ClusterMarker({ group, active, compact, onSelect }: { group: LeadMapGroup; active: boolean; compact: boolean; onSelect: (group: LeadMapGroup) => void }) {
  const map = useMap()
  const label = `${group.label} · ${group.count} 家`
  const size = compact ? [62, 44] : [112, 44]
  const point = map.latLngToContainerPoint([group.latitude, group.longitude])
  const viewport = map.getSize()
  // Keep edge labels readable without moving the group's geographic anchor.
  const anchorX = point.x >= 0 && point.x <= viewport.x ? point.x - Math.max(6, Math.min(point.x - size[0] / 2, viewport.x - size[0] - 6)) : size[0] / 2
  const anchorY = point.y >= 0 && point.y <= viewport.y ? point.y - Math.max(6, Math.min(point.y - size[1] / 2, viewport.y - size[1] - 6)) : size[1] / 2
  const icon = useMemo(() => divIcon({
    className: `lead-map-cluster${compact ? ' is-compact' : ''}${active ? ' is-highlighted' : ''}`,
    html: `<span>${escapeHtml(group.label)}</span><strong>${group.count}<small> 家</small></strong>`,
    iconSize: compact ? [62, 44] : [112, 44], iconAnchor: [anchorX, anchorY],
  }), [group.label, group.count, active, compact, anchorX, anchorY])
  return <Marker position={[group.latitude, group.longitude]} icon={icon} title={`${label}，点击筛选并展开`} alt={label} eventHandlers={{ click: () => onSelect(group) }}><Tooltip>{label} · 点击筛选并展开</Tooltip></Marker>
}

function MapLayers({ leads, selectedLead, hoveredLead, showDensity, onSelectLead, onSelectGroup }: {
  leads: PublicLead[]; selectedLead: PublicLead | null; hoveredLead: PublicLead | null; showDensity: boolean;
  onSelectLead: (lead: PublicLead) => void; onSelectGroup: (group: LeadMapGroup) => void;
}) {
  const map = useMap()
  const [zoom, setZoom] = useState(map.getZoom())
  const [width, setWidth] = useState(map.getSize().x)
  const events = useMemo(() => ({ zoomend: () => setZoom(map.getZoom()), resize: () => setWidth(map.getSize().x) }), [map])
  useMapEvents(events)
  useEffect(() => { setZoom(map.getZoom()) }, [map])
  const groups = useMemo(() => leadMapGroups(leads, zoom), [leads, zoom])
  const countries = useMemo(() => mapCountryGroups(leads), [leads])
  const activeLead = hoveredLead ?? selectedLead
  const selectGroup = (group: LeadMapGroup) => {
    onSelectGroup(group)
    map.fitBounds(latLngBounds(group.leads.map((lead) => [lead.latitude, lead.longitude])), { padding: [60, 60], maxZoom: 12, animate: false })
  }
  return <>
    {showDensity && countries.map((group) => <CircleMarker key={`density:${group.id}`} center={[group.latitude, group.longitude]} radius={Math.min(64, 12 + Math.sqrt(group.count) * 6)} pathOptions={{ color: '#f59e0b', fillColor: '#fbbf24', fillOpacity: .16, weight: 1, interactive: false }} />)}
    {groups.map((group) => {
      const active = group.leads.some((lead) => lead.id === activeLead?.id)
      if (group.kind !== 'nearby' || (group.leads.length > 1 && zoom < 12)) {
        return <Fragment key={`${group.kind}:${group.id}`}><ClusterMarker group={group} active={active} compact={width < 500} onSelect={selectGroup} />{active && activeLead && <CircleMarker center={[activeLead.latitude, activeLead.longitude]} radius={10} pathOptions={{ color: '#2563eb', fillColor: '#fff', fillOpacity: 1, weight: 3, interactive: false }}><Tooltip permanent direction="top">{activeLead.company}</Tooltip></CircleMarker>}</Fragment>
      }
      // At city level, fan out shared coordinates so every company remains selectable.
      return <Fragment key={group.id}>{group.leads.map((lead, index) => {
        const spread = group.leads.length > 1
        const center = map.project([group.latitude, group.longitude], zoom)
        const angle = index / group.leads.length * Math.PI * 2 - Math.PI / 2
        const radius = Math.max(28, group.leads.length * 8)
        const position = spread ? map.unproject([center.x + Math.cos(angle) * radius, center.y + Math.sin(angle) * radius], zoom) : [lead.latitude, lead.longitude] as [number, number]
        const color = marketProducts.find((product) => product.id === lead.productId)!.color
        const highlighted = activeLead?.id === lead.id
        const icon = divIcon({ className: `lead-map-company${highlighted ? ' is-highlighted' : ''}`, html: `<span style="background:${color}"></span>`, iconSize: [28, 28], iconAnchor: [14, 14] })
        return <Fragment key={lead.id}>{spread && <Polyline positions={[[lead.latitude, lead.longitude], position]} pathOptions={{ color: '#64748b', opacity: .6, weight: 1, interactive: false }} />}<Marker position={position} icon={icon} zIndexOffset={highlighted ? 1000 : 0} title={lead.company} alt={lead.company} eventHandlers={{ click: () => onSelectLead(lead) }}><Tooltip key={highlighted ? 'active' : 'idle'} permanent={highlighted} direction="top">{lead.company} · {lead.countryZh}{spread ? '（同城位置展开）' : ''}</Tooltip></Marker></Fragment>
      })}</Fragment>
    })}
  </>
}

export function GlobalLeadMap({ leads, selectedLead, hoveredLead, onSelectLead, onSelectGroup, overviewToken, closeUp = false, onReturnRegions }: {
  leads: PublicLead[]; selectedLead: PublicLead | null; hoveredLead: PublicLead | null;
  onSelectLead: (lead: PublicLead) => void; onSelectGroup: (group: LeadMapGroup) => void; overviewToken: number; closeUp?: boolean; onReturnRegions?: () => void;
}) {
  const [showDensity, setShowDensity] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = frameRef.current
    if (!element) return
    let pending = 0
    const measure = () => {
      const rect = element.getBoundingClientRect()
      const scale = element.offsetWidth ? rect.width / element.offsetWidth : 1
      const legend = element.querySelector<HTMLElement>('.lead-map-legend')
      const documentTop = rect.top + window.scrollY
      const available = (window.innerHeight - documentTop - 24) / scale - (legend?.offsetHeight ?? 20) - 10
      const height = `${Math.max(340, Math.floor(available))}px`
      if (element.style.getPropertyValue('--lead-map-fill-height') !== height) element.style.setProperty('--lead-map-fill-height', height)
    }
    const schedule = () => { cancelAnimationFrame(pending); pending = requestAnimationFrame(measure) }
    const observer = new ResizeObserver(schedule)
    observer.observe(element)
    const workspace = element.closest('.market-workspace-page')
    if (workspace) observer.observe(workspace)
    window.addEventListener('resize', schedule)
    measure()
    return () => { observer.disconnect(); cancelAnimationFrame(pending); window.removeEventListener('resize', schedule) }
  }, [])
  const viewport = leadMapViewport(leads, closeUp)
  return <div ref={frameRef} className={`lead-map-frame ${viewport.wide ? 'is-world-framing' : 'is-region-framing'}`}>
    {onReturnRegions && <button className="map-return-regions" type="button" onClick={onReturnRegions}><ArrowLeft size={13} />返回全部地区</button>}
    <div className="lead-map-controls"><span>点击聚合点筛选客户 · 放大查看公司</span><label><input type="checkbox" checked={showDensity} onChange={(event) => setShowDensity(event.target.checked)} />显示线索密度</label></div>
    <MapContainer zoomAnimation={false} fadeAnimation={false} className="market-map global-lead-map" center={[20, 0]} zoom={1} minZoom={0} maxZoom={18} zoomSnap={0} maxBounds={[[-85, -180], [85, 180]]} maxBoundsViscosity={1} scrollWheelZoom aria-label="全球产品线索地图">
      <TileLayer noWrap attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapFocus target={selectedLead} leads={leads} overviewToken={overviewToken} closeUp={closeUp} />
      <MapLayers leads={leads} selectedLead={selectedLead} hoveredLead={hoveredLead} showDensity={showDensity} onSelectLead={onSelectLead} onSelectGroup={onSelectGroup} />
    </MapContainer>
    <p className="lead-map-legend">数字为当前筛选内的公司数，彩色点按产品区分。{showDensity && '黄圈表示各国已核验公开线索数量，位置为客户坐标汇总。'}数量不代表市场规模、成交概率或真实需求量。</p>
  </div>
}
