import { useEffect, useMemo, useState } from 'react'
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet'
import { ArrowUpRight, Building2, ChevronRight, CircleAlert, Database, Globe2, MapPinned, Search, Sparkles, Target, Users } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { brazilAgricultureDemo, marketRoute, type DemoRegion } from '../../lib/marketDemo'
import { seedBrazilAgricultureDemo } from '../../lib/marketWorkspace'
import { hasSupabaseConfig, supabase } from '../../lib/supabase'

type MarketTab = 'overview' | 'map' | 'applications' | 'opportunities' | 'companies' | 'news' | 'sources'
const tabs: Array<{ id: MarketTab; label: string }> = [
  { id: 'overview', label: '总览' }, { id: 'map', label: '地图' }, { id: 'applications', label: '应用' },
  { id: 'opportunities', label: '机会' }, { id: 'companies', label: '公司' }, { id: 'news', label: '新闻' }, { id: 'sources', label: '来源' },
]

function setHash(value: string) { window.location.hash = value }

function DemoBadge() { return <span className="market-demo-badge"><Database size={13} />Demo · 未采集</span> }

function MapFocus({ region }: { region: DemoRegion | null }) {
  const map = useMap()
  useEffect(() => { if (region) map.flyTo([region.latitude, region.longitude], 6, { duration: 0.7 }) }, [map, region])
  return null
}

function BrazilMap({ selected, onSelect }: { selected: DemoRegion | null; onSelect: (region: DemoRegion) => void }) {
  return <MapContainer className="market-map" center={[-15.8, -51.5]} zoom={4} scrollWheelZoom aria-label="巴西农业区域地图">
    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <MapFocus region={selected} />
    {brazilAgricultureDemo.regions.map((region) => <CircleMarker
      key={region.id} center={[region.latitude, region.longitude]} radius={selected?.id === region.id ? 12 : 9}
      pathOptions={{ color: selected?.id === region.id ? '#14532d' : '#2f6f61', fillColor: selected?.id === region.id ? '#4ade80' : '#86efac', fillOpacity: 0.88 }}
      eventHandlers={{ click: () => onSelect(region) }}
    ><Popup><strong>{region.name}</strong><br />Demo region · verify sources before use</Popup></CircleMarker>)}
  </MapContainer>
}

function RegionPanel({ region }: { region: DemoRegion }) {
  return <article className="market-region-panel"><div className="card-heading"><div><p className="eyebrow">区域情报 · Demo</p><h3>{region.name}</h3></div><MapPinned size={19} /></div><div className="market-panel-section"><small>主要应用</small><div className="chip-row">{region.crops.map((crop) => <span className="chip" key={crop}>{crop}</span>)}</div></div><div className="market-panel-section"><small>研究方向</small><ul>{region.demand.map((item) => <li key={item}>{item}</li>)}</ul></div><p className="muted">公司 {region.companies} · 新闻 {region.news}。这些计数为 Demo 零值，不代表市场实际数量。</p></article>
}

function MarketHome() {
  const [query, setQuery] = useState('')
  const matched = useMemo(() => `${brazilAgricultureDemo.country} ${brazilAgricultureDemo.title} ${brazilAgricultureDemo.applications.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()), [query])
  return <><div className="page-heading market-heading"><div><p className="eyebrow">Global Market Intelligence</p><h1>理解市场，发现可验证的机会。</h1><p>从国家、行业与应用出发，逐步建立来源可追溯的市场、企业与客户开发线索。</p></div><DemoBadge /></div>
    <div className="market-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索国家、行业、作物、材料或公司…" /><kbd>Demo</kbd></div>
    <div className="market-filter-row"><button className="filter active">全部市场</button><button className="filter">国家</button><button className="filter">行业</button><button className="filter">应用</button><span>真实市场数据将在来源验证后显示</span></div>
    {matched ? <button className="market-card" onClick={() => setHash('market-intelligence/brazil-agriculture')}><div className="market-card-flag">🇧🇷</div><div className="market-card-copy"><div className="market-card-title"><div><p>Brazil · Agriculture · Fertilizer</p><h2>Brazil Agriculture</h2></div><DemoBadge /></div><p>首个信息架构 Demo：区域、应用、机会、公司、新闻与来源将围绕同一个市场对象关联。</p><div className="chip-row">{brazilAgricultureDemo.applications.slice(0, 4).map((item) => <span className="chip" key={item}>{item}</span>)}</div><footer><span>6 个区域 · 0 条真实公司 · 0 条真实新闻</span><span>打开市场 <ChevronRight size={16} /></span></footer></div></button> : <div className="empty-state"><Search size={28} /><strong>没有匹配的市场专题</strong><span>Demo 只包含 Brazil Agriculture。真实专题将在你保存并核验来源后出现。</span></div>}
  </>
}

function MarketDetail() {
  const [route, setRoute] = useState(marketRoute)
  const [selectedRegion, setSelectedRegion] = useState<DemoRegion>(brazilAgricultureDemo.regions[0])
  const [seedState, setSeedState] = useState<string | null>(null)
  useEffect(() => { const listener = () => setRoute(marketRoute()); window.addEventListener('hashchange', listener); return () => window.removeEventListener('hashchange', listener) }, [])
  const tab = (tabs.find((item) => item.id === route[2])?.id ?? 'overview') as MarketTab
  const selectTab = (next: MarketTab) => setHash(next === 'overview' ? 'market-intelligence/brazil-agriculture' : `market-intelligence/brazil-agriculture/${next}`)
  const persistDemo = async () => {
    if (!hasSupabaseConfig || !supabase) return setSeedState('请先连接 Supabase 并登录，才能保存私有 Demo 数据。')
    const { data } = await supabase.auth.getUser()
    if (!data.user) return setSeedState('请先在“资料与设置”登录。')
    try { await seedBrazilAgricultureDemo(); setSeedState('Demo 已写入你的私人市场库。仍需为每条真实事实添加来源后才能对外使用。') } catch (error) { setSeedState(`未写入：${error instanceof Error ? error.message : '未知错误'}`) }
  }
  return <><button className="back-link" onClick={() => setHash('market-intelligence')}><ChevronRight size={16} />全部市场</button><div className="market-detail-hero"><div><p className="eyebrow">🇧🇷 Brazil · {brazilAgricultureDemo.industry}</p><h1>{brazilAgricultureDemo.title}</h1><p>{brazilAgricultureDemo.description}</p><div className="chip-row"><DemoBadge /><span className="chip">6 个区域</span><span className="chip">来源待验证</span></div></div><button className="secondary-button" onClick={() => void persistDemo()}><Database size={16} />保存 Demo 到私人库</button></div>{seedState && <div className="callout warning"><CircleAlert size={18} /><div><strong>Demo 数据状态</strong><p>{seedState}</p></div></div>}
    <div className="market-tabs" role="tablist">{tabs.map((item) => <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => selectTab(item.id)}>{item.label}</button>)}</div>
    {tab === 'overview' && <Overview selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} />}
    {tab === 'map' && <MapView selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} />}
    {tab === 'applications' && <Applications />}
    {tab === 'opportunities' && <Opportunities />}
    {tab === 'companies' && <Companies />}
    {tab === 'news' && <News />}
    {tab === 'sources' && <Sources />}
  </>
}

function Overview({ selectedRegion, setSelectedRegion }: { selectedRegion: DemoRegion; setSelectedRegion: (region: DemoRegion) => void }) {
  return <div className="market-overview"><section className="card"><div className="card-heading"><div><p className="eyebrow">Market Snapshot · Demo</p><h2>市场快照</h2></div><Globe2 size={19} /></div><dl className="market-facts"><div><dt>国家</dt><dd>Brazil / 巴西</dd></div><div><dt>行业</dt><dd>Agriculture · Fertilizer</dd></div><div><dt>关联产品</dt><dd>NL-FC-PU <small>仅机会假设，非产品声明</small></dd></div><div><dt>数据状态</dt><dd>Demo · 等待真实来源</dd></div></dl></section><section className="card"><div className="card-heading"><div><p className="eyebrow">Opportunity Summary</p><h2>机会需要证据链</h2></div><Target size={19} /></div><p className="muted">当前只呈现用于验证信息架构的研究方向；没有市场规模、需求量、客户或性能结论。</p><button className="text-button" onClick={() => setHash('market-intelligence/brazil-agriculture/opportunities')}>查看机会卡 <ChevronRight size={16} /></button></section><section className="market-region-grid"><div className="section-heading"><div><p className="eyebrow">Key Regions · Demo</p><h2>重点区域</h2></div><button className="text-button" onClick={() => setHash('market-intelligence/brazil-agriculture/map')}>打开地图 <ArrowUpRight size={15} /></button></div>{brazilAgricultureDemo.regions.map((region) => <button className={selectedRegion.id === region.id ? 'region-card selected' : 'region-card'} onClick={() => setSelectedRegion(region)} key={region.id}><MapPinned size={18} /><strong>{region.name}</strong><span>{region.crops.join(' · ')}</span><small>Demo · 待添加来源</small></button>)}</section><RegionPanel region={selectedRegion} /></div>
}

function MapView({ selectedRegion, setSelectedRegion }: { selectedRegion: DemoRegion; setSelectedRegion: (region: DemoRegion) => void }) { return <div className="market-map-layout"><section><div className="section-heading"><div><p className="eyebrow">Map Intelligence · Demo</p><h2>地图与区域卡片联动</h2></div><DemoBadge /></div><BrazilMap selected={selectedRegion} onSelect={setSelectedRegion} /></section><aside className="market-region-list">{brazilAgricultureDemo.regions.map((region) => <button key={region.id} className={selectedRegion.id === region.id ? 'active' : ''} onClick={() => setSelectedRegion(region)}><span><strong>{region.name}</strong><small>{region.crops.join(' · ')}</small></span><ChevronRight size={16} /></button>)}<RegionPanel region={selectedRegion} /></aside></div> }

function Applications() { return <section className="market-data-section"><div className="section-heading"><div><p className="eyebrow">Applications · Demo</p><h2>应用 / 作物</h2><p>农业以 crop 为 subtype；其他市场可使用材料、工艺或终端应用，不会限制为作物模型。</p></div></div><div className="market-mini-grid">{brazilAgricultureDemo.applications.map((item) => <article className="card" key={item}><span className="market-icon"><Sparkles size={18} /></span><h3>{item}</h3><p>Demo application · 研究信息需保存原始来源与核验时间。</p></article>)}</div></section> }
function Opportunities() { return <section className="market-data-section"><div className="section-heading"><div><p className="eyebrow">Product Opportunities · Demo</p><h2>产品机会</h2><p>以下是架构示例，不是市场结论或可对外使用的产品性能承诺。</p></div></div><div className="opportunity-list">{brazilAgricultureDemo.opportunities.map((item) => <article className="opportunity-card" key={item.id}><div><p>{item.application} · {item.product}</p><h3>{item.title}</h3><p>{item.demand}</p></div><div><span className="chip">{item.target}</span><span className="status review">{item.status}</span></div></article>)}</div></section> }
function Companies() { return <section className="market-data-section"><div className="section-heading"><div><p className="eyebrow">Companies · Demo</p><h2>公司不是线索</h2><p>发现公司后先保存来源和核验时间，只有人工确认后才可转换为 Lead。</p></div><button className="secondary-button" disabled><Search size={16} />发现公司（后续）</button></div><div className="company-list">{brazilAgricultureDemo.companies.map((company) => <article className="company-card" key={company.id}><Building2 size={20} /><div><h3>{company.name}</h3><p>{company.type} · {company.region}</p><small>{company.source}</small></div><span className="status review">{company.status}</span></article>)}</div></section> }
function News() { return <section className="empty-state"><Globe2 size={28} /><strong>尚无真实市场情报</strong><span>二期会复用一期 `articles` 与 `sources`，以关系表关联市场、区域、公司和应用；仅有 HTTP 200 的来源不会显示为已采集。</span><button className="secondary-button" onClick={() => setHash('intelligence')}>查看行业情报</button></section> }
function Sources() { return <section className="market-data-section"><div className="section-heading"><div><p className="eyebrow">Data Provenance</p><h2>来源与核验</h2><p>Demo 没有真实市场来源。真实记录必须保存原始 URL、发布时间、获取时间、来源类型与最后核验日期。</p></div></div><div className="callout"><CircleAlert size={18} /><div><strong>当前无可引用来源</strong><p>请先在一期“资料与设置”添加并验证来源，再将真实文章关联到市场专题。</p></div></div></section> }

export function MarketIntelligence() {
  const [route, setRoute] = useState(marketRoute)
  useEffect(() => { const listener = () => setRoute(marketRoute()); window.addEventListener('hashchange', listener); return () => window.removeEventListener('hashchange', listener) }, [])
  return route[1] === brazilAgricultureDemo.slug ? <MarketDetail /> : <MarketHome />
}
