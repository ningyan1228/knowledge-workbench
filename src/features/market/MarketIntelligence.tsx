import { useEffect, useMemo, useState } from 'react'
import { CircleMarker, MapContainer, TileLayer, useMap } from 'react-leaflet'
import { Building2, CheckCircle2, ChevronRight, Copy, ExternalLink, Globe2, Mail, MapPinned, Phone, Search, Target, TriangleAlert } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { marketProducts, publicLeads, type MarketProduct, type PublicLead } from '../../lib/productMarketMap'

type MarketTab = 'overview' | 'map' | 'leads' | 'products' | 'sources'
type CountrySummary = { country: string; countryZh: string; latitude: number; longitude: number; count: number }
const tabs: Array<{ id: MarketTab; label: string }> = [{ id: 'overview', label: '总览' }, { id: 'map', label: '全球地图' }, { id: 'leads', label: '线索库' }, { id: 'products', label: '产品匹配' }, { id: 'sources', label: '来源与核验' }]

function setHash(value: string) { window.location.hash = value }
function productOf(id: MarketProduct['id']) { return marketProducts.find((product) => product.id === id)! }
function sourceHost(url: string) { try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url } }
function route() { return window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean) }

function MapFocus({ target }: { target: PublicLead | CountrySummary | null }) {
  const map = useMap()
  useEffect(() => { if (target) map.flyTo([target.latitude, target.longitude], 'count' in target ? 4 : 7, { duration: 0.65 }) }, [map, target])
  return null
}

function ProductPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <div className="lead-product-picker" aria-label="按产品筛选">{marketProducts.map((product) => <button key={product.id} className={value === product.id ? 'active' : ''} onClick={() => onChange(product.id)}><i style={{ background: product.color }} />{product.name}</button>)}<button className={value === 'all' ? 'active' : ''} onClick={() => onChange('all')}>全部产品</button></div>
}

function LeadCard({ lead, selected, onSelect }: { lead: PublicLead; selected?: boolean; onSelect: (lead: PublicLead) => void }) {
  const product = productOf(lead.productId)
  const contactText = [lead.contact.email, lead.contact.phone].filter(Boolean).join(' · ')
  return <article className={selected ? 'lead-card selected' : 'lead-card'}><button className="lead-card-main" onClick={() => onSelect(lead)}><span className="lead-dot" style={{ background: product.color }} /><span><small>{lead.countryZh} · {lead.city}</small><h3>{lead.company}</h3><p>{lead.customerType}</p></span><ChevronRight size={17} /></button><div className="lead-card-meta"><span className={`lead-fit ${lead.fit === '优先核验' ? 'priority' : ''}`}>{lead.fit}</span><span>{lead.checkedAt} 已核验</span></div>{selected && <div className="lead-card-detail"><p>{lead.signal}</p><div className="contact-row"><span>{lead.contact.email ? <Mail size={14} /> : <Phone size={14} />}{contactText || '请通过官网联系'}</span>{contactText && <button title="复制联系方式" onClick={() => void navigator.clipboard.writeText(contactText)}><Copy size={14} /></button>}</div><div className="lead-card-actions">{lead.contact.email && <a href={`mailto:${lead.contact.email}`}><Mail size={14} />写开发信</a>}<a href={lead.source.url} target="_blank" rel="noreferrer">查看证据 <ExternalLink size={14} /></a></div></div>}</article>
}

function GlobalLeadMap({ leads, selectedLead, onSelectLead, selectedCountry, onSelectCountry }: { leads: PublicLead[]; selectedLead: PublicLead | null; onSelectLead: (lead: PublicLead) => void; selectedCountry: CountrySummary | null; onSelectCountry: (country: CountrySummary) => void }) {
  const countries = useMemo(() => Object.values(leads.reduce<Record<string, CountrySummary>>((all, lead) => { const old = all[lead.country]; all[lead.country] = old ? { ...old, count: old.count + 1 } : { country: lead.country, countryZh: lead.countryZh, latitude: lead.latitude, longitude: lead.longitude, count: 1 }; return all }, {})), [leads])
  return <MapContainer className="market-map global-lead-map" center={[20, 8]} zoom={2} minZoom={2} scrollWheelZoom aria-label="全球产品线索地图"><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><MapFocus target={selectedLead ?? selectedCountry} />{countries.map((country) => <CircleMarker key={country.country} center={[country.latitude, country.longitude]} radius={13 + country.count * 4} pathOptions={{ color: '#f59e0b', fillColor: '#fbbf24', fillOpacity: .28, weight: 1 }} eventHandlers={{ click: () => onSelectCountry(country) }} />)}{leads.map((lead) => { const product = productOf(lead.productId); return <CircleMarker key={lead.id} center={[lead.latitude, lead.longitude]} radius={selectedLead?.id === lead.id ? 10 : 6} pathOptions={{ color: '#fff', fillColor: product.color, fillOpacity: 1, weight: selectedLead?.id === lead.id ? 4 : 2 }} eventHandlers={{ click: () => onSelectLead(lead) }} /> })}</MapContainer>
}

function MapLegend() { return <p className="map-legend"><i />大号黄圈 = 国家内已核验公开线索密度；彩色点 = 一家可研究的公司。它们不是市场规模、成交概率或真实需求量。</p> }

function Overview({ productId, leads, onProduct, onOpenMap }: { productId: string; leads: PublicLead[]; onProduct: (id: string) => void; onOpenMap: () => void }) {
  const countries = new Set(leads.map((lead) => lead.country)).size
  return <div className="market-overview global-overview"><section className="market-intro"><p className="eyebrow">GLOBAL OUTBOUND MAP</p><h1>从产品需求，找到可开发的公司。</h1><p>先用 TDS 界定应找的客户类型，再把公开可核验的公司、城市、联系方式与证据放在同一张地图。每一条记录都有状态，不把“同行 / 竞品”误写成“已确认客户”。</p><ProductPicker value={productId} onChange={onProduct} /><button className="primary-button" onClick={onOpenMap}><MapPinned size={17} />打开全球地图</button></section><section className="market-stat-grid"><div><Globe2 size={19} /><strong>{countries}</strong><span>覆盖国家</span></div><div><Building2 size={19} /><strong>{leads.length}</strong><span>公开公司线索</span></div><div><CheckCircle2 size={19} /><strong>{leads.filter((lead) => lead.fit === '优先核验').length}</strong><span>优先核验</span></div></section><section className="market-data-section product-radar"><div className="section-heading"><div><p className="eyebrow">PRODUCT TO CUSTOMER</p><h2>三条开发路线</h2><p>点击路线会筛选地图和线索库。</p></div></div><div className="product-route-grid">{marketProducts.map((product) => { const count = publicLeads.filter((lead) => lead.productId === product.id).length; return <button key={product.id} onClick={() => onProduct(product.id)} className={productId === product.id ? 'product-route active' : 'product-route'}><i style={{ background: product.color }} /><span><small>{product.nameEn}</small><strong>{product.name}</strong><em>{product.customerTypes.join(' · ')}</em></span><b>{count} 条公开线索</b></button> })}</div></section></div>
}

function MapView({ productId, leads, onProduct }: { productId: string; leads: PublicLead[]; onProduct: (id: string) => void }) {
  const [selectedLead, setSelectedLead] = useState<PublicLead | null>(leads[0] ?? null)
  const [selectedCountry, setSelectedCountry] = useState<CountrySummary | null>(null)
  useEffect(() => { setSelectedLead(leads[0] ?? null); setSelectedCountry(null) }, [productId])
  return <section className="market-map-workspace"><div className="section-heading"><div><p className="eyebrow">GEO QUALIFICATION</p><h2>全球公开线索地图</h2><p>选产品，再点国家或公司。右侧显示可用于首封开发前核验的公司、城市、公开业务联系方式和证据链接。</p></div></div><ProductPicker value={productId} onChange={onProduct} /><div className="market-map-layout lead-map-layout"><div><GlobalLeadMap leads={leads} selectedLead={selectedLead} selectedCountry={selectedCountry} onSelectLead={setSelectedLead} onSelectCountry={(country) => { setSelectedCountry(country); setSelectedLead(null) }} /><MapLegend /></div><aside className="lead-map-sidebar"><div className="sidebar-title"><Target size={16} /><strong>{selectedCountry ? `${selectedCountry.countryZh} · ${selectedCountry.count} 条线索` : '公司线索'}</strong></div>{leads.filter((lead) => !selectedCountry || lead.country === selectedCountry.country).map((lead) => <LeadCard key={lead.id} lead={lead} selected={lead.id === selectedLead?.id} onSelect={setSelectedLead} />)}</aside></div></section>
}

function LeadsView({ productId, leads, onProduct }: { productId: string; leads: PublicLead[]; onProduct: (id: string) => void }) {
  const [query, setQuery] = useState('')
  const matching = leads.filter((lead) => `${lead.company} ${lead.countryZh} ${lead.city} ${lead.customerType}`.toLowerCase().includes(query.toLowerCase()))
  const [selected, setSelected] = useState<PublicLead | null>(matching[0] ?? null)
  useEffect(() => setSelected(matching[0] ?? null), [productId, query])
  return <section className="market-data-section"><div className="section-heading"><div><p className="eyebrow">LEAD RESEARCH QUEUE</p><h2>可开发线索库</h2><p>“优先核验”表示公司官网已明确相关业务，仍应在发信前确认采购角色、应用、进口资格与实际需求。“替代方案研究”用于竞品 / 技术路线情报，不应直接当成买家。</p></div></div><ProductPicker value={productId} onChange={onProduct} /><label className="lead-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索公司、国家、城市或客户类型" /></label><div className="lead-list">{matching.map((lead) => <LeadCard key={lead.id} lead={lead} selected={lead.id === selected?.id} onSelect={setSelected} />)}{!matching.length && <div className="empty-state"><Search size={25} /><strong>没有匹配的公开线索</strong><span>切换产品或缩短搜索词。</span></div>}</div></section>
}

function ProductsView({ productId, onProduct }: { productId: string; onProduct: (id: string) => void }) { return <section className="market-data-section"><div className="section-heading"><div><p className="eyebrow">TDS-DRIVEN TARGETING</p><h2>产品如何变成开发名单</h2><p>每条产品路线只使用客户类型和应用方向，绝不把 TDS 的指标自动拼成对客户的性能承诺。</p></div></div><ProductPicker value={productId} onChange={onProduct} /><div className="product-detail-grid">{marketProducts.filter((product) => productId === 'all' || product.id === productId).map((product) => <article className="product-detail" key={product.id}><i style={{ background: product.color }} /><h3>{product.name}</h3><p>{product.tdsScope}</p><h4>优先搜索对象</h4><div className="chip-row">{product.customerTypes.map((type) => <span key={type} className="chip">{type}</span>)}</div><h4>建议检索词</h4><ul>{product.searchTerms.map((term) => <li key={term}>{term}</li>)}</ul></article>)}</div></section> }

function SourcesView({ leads }: { leads: PublicLead[] }) { return <section className="market-data-section"><div className="section-heading"><div><p className="eyebrow">EVIDENCE TRAIL</p><h2>来源与使用边界</h2><p>线索卡只展示公司官网上公开的业务描述和联系方式。官网的存在不证明其正在采购本产品；发信前先核对联系人是否仍在职、采购职责和具体项目。</p></div></div><div className="source-evidence-list">{leads.map((lead) => <article key={lead.id}><span>{productOf(lead.productId).name}</span><div><strong>{lead.company}</strong><p>{lead.signal}</p><a href={lead.source.url} target="_blank" rel="noreferrer">{lead.source.label} · {sourceHost(lead.source.url)} <ExternalLink size={14} /></a></div><small>核验：{lead.checkedAt}</small></article>)}</div><div className="callout warning"><TriangleAlert size={18} /><div><strong>使用前必做两步</strong><p>第一步，打开每条来源确认网页与联系方式仍有效；第二步，仅向与业务相关的公开业务邮箱或官网表单发送一封个性化 B2B 开发信，并遵守目的地的反垃圾邮件规则。</p></div></div></section> }

export function MarketIntelligence() {
  const [currentRoute, setRoute] = useState(route())
  const [productId, setProductId] = useState<string>('all')
  useEffect(() => { const listener = () => setRoute(route()); window.addEventListener('hashchange', listener); return () => window.removeEventListener('hashchange', listener) }, [])
  const tab = (tabs.find((item) => item.id === currentRoute[1])?.id ?? 'overview') as MarketTab
  const filteredLeads = useMemo(() => publicLeads.filter((lead) => productId === 'all' || lead.productId === productId), [productId])
  const openTab = (next: MarketTab) => setHash(next === 'overview' ? 'market-intelligence' : `market-intelligence/${next}`)
  return <><div className="page-heading market-heading"><div><p className="eyebrow">GLOBAL MARKET INTELLIGENCE</p><h1>客户地图，而不是一张漂亮的世界地图。</h1><p>围绕三款产品建立“产品 → 需求场景 → 公司 → 联系方式 → 证据”的开发链路。</p></div><span className="market-research-badge"><CheckCircle2 size={14} />公开来源研究</span></div><div className="market-tabs" role="tablist">{tabs.map((item) => <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => openTab(item.id)}>{item.label}</button>)}</div>{tab === 'overview' && <Overview productId={productId} leads={filteredLeads} onProduct={setProductId} onOpenMap={() => openTab('map')} />}{tab === 'map' && <MapView productId={productId} leads={filteredLeads} onProduct={setProductId} />}{tab === 'leads' && <LeadsView productId={productId} leads={filteredLeads} onProduct={setProductId} />}{tab === 'products' && <ProductsView productId={productId} onProduct={setProductId} />}{tab === 'sources' && <SourcesView leads={filteredLeads} />}</>
}
