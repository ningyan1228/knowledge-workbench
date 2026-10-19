import { useEffect, useMemo, useState } from 'react'
import { Building2, CheckCircle2, ExternalLink, FileText, Globe2, Mail, MapPinned, Search, TriangleAlert, X } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { marketExtendedApplications, marketProducts, publicLeads, targetCompanyTypes, tdsVerifiedApplications, type MarketProduct, type PublicLead } from '../../lib/productMarketMap'
import { timelineLeads, type TimelineOrder } from '../../lib/leadTimeline'
import { LeadTimelineControls } from './LeadTimelineControls'
import { filterLeadGeography, geographyOptions } from '../../lib/leadGeography'
import { CompanyDetail } from './CompanyDetail'
import { outreachCompanyKey } from '../../lib/outreachLedger'
import { firstContactPlan, firstContactExport } from '../../lib/customerDevelopment'
import { CustomerDevelopmentPanel } from './CustomerDevelopmentPanel'
import { useOutreachLedger, type OutreachLedger } from './useOutreachLedger'
import { useLeadWork, type LeadWork } from './useLeadWork'
import { LeadBusinessControls, PrivateWorkNotice } from './LeadWorkbench'
import { emptyBusinessFilters, filterWorkbenchLeads, type BusinessFilters } from '../../lib/leadWorkbench'
import { shanghaiDay, timelineFilterLabel } from '../../lib/leadTimeline'
import { CustomerMapWorkspace } from './CustomerMapWorkspace'
import { MarketConnectionStatus } from './MarketConnectionStatus'
import { LeadList } from './LeadList'
import { marketTabForRoute, readLeadView, rememberLeadView, type MarketTab } from '../../lib/leadViewPreference'
import './MarketWorkspace.css'
import './MacCustomerMap.css'
import './CompactMarketHeader.css'

const tabs: Array<{ id: 'customers' | 'overview' | 'products' | 'sources'; label: string }> = [{ id: 'customers', label: '客户开发' }, { id: 'overview', label: '总览' }, { id: 'products', label: '产品匹配' }, { id: 'sources', label: '来源与核验' }]

function setHash(value: string) { window.location.hash = value }
function productOf(id: MarketProduct['id']) { return marketProducts.find((product) => product.id === id)! }
function sourceHost(url: string) { try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url } }
function route() { return window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean) }

function ProductPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <div className="lead-product-picker" aria-label="按产品筛选">{marketProducts.map((product) => <button key={product.id} className={value === product.id ? 'active' : ''} onClick={() => onChange(product.id)}><i style={{ background: product.color }} />{product.name}</button>)}<button className={value === 'all' ? 'active' : ''} onClick={() => onChange('all')}>全部产品</button></div>
}

function OutreachLedgerNotice({ ledger }: { ledger: OutreachLedger }) {
  const description = ledger.status === 'ready'
    ? '共享发送记录已连接：右侧列表可查看“已发送”，批量下载会排除已联系公司。'
    : ledger.status === 'login_required' ? '发送记录仅供已登录同事共享。请先到“设置”登录；未连接时不能判断是否重复。'
      : ledger.status === 'unconfigured' ? 'Supabase 尚未配置，发送记录无法跨设备共享。'
        : ledger.status === 'loading' ? '正在读取共享发送记录…'
          : `发送记录未连接：${ledger.error ?? '请确认数据库迁移已执行。'}；暂不能判断是否重复。`
  return <div className={`outreach-ledger-notice ${ledger.status === 'ready' ? 'connected' : ''}`} role="status"><Mail size={16} /><span>{description}</span>{ledger.status === 'login_required' && <a href="#settings">前往设置</a>}</div>
}

function Overview({ productId, leads, onProduct, onOpenMap }: { productId: string; leads: PublicLead[]; onProduct: (id: string) => void; onOpenMap: () => void }) {
  const countries = new Set(leads.map((lead) => lead.country)).size
  return <div className="market-overview global-overview"><section className="market-intro"><p className="eyebrow">GLOBAL OUTBOUND MAP</p><h1>从产品需求，找到可开发的公司。</h1><p>先用 TDS 界定应用，再映射目标公司类型，并以官网证据连接公司与联系人。市场扩展应用必须独立附来源，不能由材料性质推测。</p><ProductPicker value={productId} onChange={onProduct} /><button className="primary-button" onClick={onOpenMap}><MapPinned size={17} />打开全球地图</button></section><section className="market-stat-grid"><div><Globe2 size={19} /><strong>{countries}</strong><span>覆盖国家</span></div><div><Building2 size={19} /><strong>{leads.length}</strong><span>公开公司线索</span></div><div><CheckCircle2 size={19} /><strong>{leads.filter((lead) => lead.fit === '优先核验').length}</strong><span>优先核验</span></div></section><section className="market-data-section product-radar"><div className="section-heading"><div><p className="eyebrow">PRODUCT TO CUSTOMER</p><h2>三条开发路线</h2><p>三款产品按各自的 TDS 应用与目标公司类型独立检索。</p></div></div><div className="product-route-grid">{marketProducts.map((product) => { const count = publicLeads.filter((lead) => lead.productId === product.id).length; const types = targetCompanyTypes.filter((type) => type.productId === product.id && type.kind === 'target').map((type) => type.name); return <button key={product.id} onClick={() => onProduct(product.id)} className={productId === product.id ? 'product-route active' : 'product-route'}><i style={{ background: product.color }} /><span><small>{product.nameEn}</small><strong>{product.name}</strong><em>{types.join(' · ')}</em></span><b>{count} 条公开线索</b></button> })}</div></section></div>
}

function LeadsWorkspace({ productId, leads, onProduct, ledger, work, view, onView }: { productId: string; leads: PublicLead[]; onProduct: (id: string) => void; ledger: OutreachLedger; work: LeadWork; view: 'map' | 'leads'; onView: (view: 'map' | 'leads') => void }) {
  const [selectedLead, setSelectedLead] = useState<PublicLead | null>(null)
  const [hoveredLead, setHoveredLead] = useState<PublicLead | null>(null)
  const [detailLead, setDetailLead] = useState<PublicLead | null>(null)
  const [order, setOrder] = useState<TimelineOrder>('newest'), [day, setDay] = useState('all')
  const [continent, setContinent] = useState('all'), [country, setCountry] = useState('all')
  const [filters, setFilters] = useState<BusinessFilters>({ ...emptyBusinessFilters })
  const [overviewToken, setOverviewToken] = useState(0), [downloading, setDownloading] = useState(false)
  const options = useMemo(() => geographyOptions(leads, continent), [leads, continent])
  const regionalLeads = useMemo(() => filterLeadGeography(leads, continent, country), [leads, continent, country])
  const records = work.status === 'ready' ? work.records : null, sends = ledger.status === 'ready' ? ledger.sends : null
  const today = shanghaiDay(new Date().toISOString())
  const businessLeads = useMemo(() => filterWorkbenchLeads(regionalLeads, filters, records, sends, today, order), [regionalLeads, filters, records, sends, today, order])
  const matching = useMemo(() => timelineLeads(businessLeads, order, day, today).sort((a, b) => businessLeads.indexOf(a) - businessLeads.indexOf(b)), [businessLeads, order, day, today])
  const resetFocus = () => { setSelectedLead(null); setHoveredLead(null); setOverviewToken((value) => value + 1) }
  const openLeadDetail = (lead: PublicLead) => { setHoveredLead(null); setSelectedLead({ ...lead }); setDetailLead(lead) }
  useEffect(() => { setFilters((current) => ({ ...current, industry: 'all', application: 'all' })); setDetailLead(null); resetFocus() }, [productId])
  useEffect(() => {
    setFilters((current) => {
      const listMissing = current.list !== 'all' && current.list !== 'favorites' && !work.lists.some((list) => list.id === current.list)
      return work.status !== 'ready' ? { ...current, stage: 'all', list: 'all', queue: 'all' } : listMissing ? { ...current, list: 'all' } : current
    })
  }, [work.status, work.lists])
  useEffect(() => { if (ledger.status !== 'ready') setFilters((current) => ({ ...current, sendStatus: 'all', queue: current.queue === 'priority' || current.queue === 'recent' ? 'all' : current.queue })) }, [ledger.status])
  useEffect(() => { if (country !== 'all' && !options.countries.some((item) => item.value === country)) setCountry('all') }, [options, country])
  useEffect(() => {
    if (selectedLead && !matching.some((lead) => lead.id === selectedLead.id)) setSelectedLead(null)
    if (hoveredLead && !matching.some((lead) => lead.id === hoveredLead.id)) setHoveredLead(null)
  }, [matching, selectedLead, hoveredLead])
  const showAll = () => { onProduct('all'); setContinent('all'); setCountry('all'); setDay('all'); setOrder('newest'); setFilters({ ...emptyBusinessFilters }); resetFocus() }
  const returnAllRegions = () => { setContinent('all'); setCountry('all'); resetFocus() }
  const selectCountry = (value: string) => { setCountry(value); resetFocus() }
  const regionLabel = country !== 'all' ? options.countries.find((item) => item.value === country)?.label ?? country : continent !== 'all' ? continent : '全部地区'
  const companyCount = new Set(matching.map(outreachCompanyKey)).size
  const hasActiveFilters = productId !== 'all' || continent !== 'all' || country !== 'all' || day !== 'all' || order !== 'newest' || (Object.keys(emptyBusinessFilters) as Array<keyof BusinessFilters>).some((key) => filters[key] !== emptyBusinessFilters[key])
  const firstContactLeads = matching.filter((lead) => { const stage = records?.[outreachCompanyKey(lead)]?.stage; return !stage || stage === 'todo' })
  const unsentEmails = firstContactPlan(firstContactLeads, sends, Number.MAX_SAFE_INTEGER, undefined, false).batch
  const downloadEmails = async () => {
    if (ledger.status !== 'ready') return
    setDownloading(true)
    try {
      const currentSends = await ledger.fetchCurrentSends()
      const eligible = matching.filter((lead) => {
        const stage = work.status === 'ready' ? work.records[outreachCompanyKey(lead)]?.stage : null
        return stage !== 'paused' && stage !== 'replied' && stage !== 'sample' && stage !== 'waiting'
      })
      const freshUnsent = firstContactPlan(eligible, currentSends, Number.MAX_SAFE_INTEGER, undefined, false).batch
      if (!freshUnsent.length) { window.alert('当前筛选中没有未记录发送的合格首封开发信。'); return }
      const url = URL.createObjectURL(new Blob([firstContactExport(freshUnsent)], { type: 'text/plain;charset=utf-8' }))
      const link = document.createElement('a'); link.href = url; link.download = 'demand-side-first-emails-' + productId + '-' + today + '.txt'; link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) { window.alert('下载前无法核对发送记录：' + (error instanceof Error ? error.message : '未知错误')) }
    finally { setDownloading(false) }
  }
  return <section className="market-map-workspace">
    <LeadBusinessControls allCustomerCount={new Set(publicLeads.map(outreachCompanyKey)).size} allCustomersActive={!hasActiveFilters} onShowAll={showAll} leads={regionalLeads} filters={filters} onChange={(value) => { setFilters(value); resetFocus() }} work={work} ledger={ledger}
      primaryFilters={<div className="market-scope-controls"><div className="market-product-row"><span>产品</span><ProductPicker value={productId} onChange={onProduct} /></div>
    <div className="lead-geography-filters" role="group" aria-label="按地区筛选"><label>大洲<select aria-label="大洲" value={continent} onChange={(event) => { setContinent(event.target.value); setCountry('all'); resetFocus() }}><option value="all">全部大洲</option>{options.continents.map((item) => <option key={item.value} value={item.value}>{item.value} · {item.count} 家</option>)}</select></label><label>国家／地区<select aria-label="国家／地区" value={country} onChange={(event) => selectCountry(event.target.value)}><option value="all">全部国家／地区</option>{options.countries.map((item) => <option key={item.value} value={item.value}>{item.label} · {item.count} 家</option>)}</select></label></div>
    </div>}
      advancedContent={<LeadTimelineControls embedded leads={businessLeads} order={order} day={day} onOrder={setOrder} onDay={(value) => { setDay(value); resetFocus() }} />}
      extraFilterCount={Number(day !== 'all') + Number(order !== 'newest')}
      extraActiveFilters={<>{day !== 'all' && <button type="button" onClick={() => { setDay('all'); resetFocus() }} aria-label="移除收录日期筛选"><span>{timelineFilterLabel(day, today)}</span><X size={12} /></button>}{order !== 'newest' && <button type="button" onClick={() => setOrder('newest')} aria-label="恢复默认收录排序"><span>首次收录由旧到新</span><X size={12} /></button>}</>} />
    <div className="market-results-bar compact-customer-results"><span className="market-result-count" role="status"><strong>{companyCount} 家公司</strong> · {new Set(matching.map((lead) => lead.country)).size} 个国家／地区{(continent !== 'all' || country !== 'all') && <small> · {regionLabel}</small>}{matching.length > companyCount && <small> · {matching.length} 条产品记录（部分公司匹配多个产品）</small>}</span><div className="market-results-tools"><div className="work-view-toggle" role="group" aria-label="客户展示方式"><button type="button" aria-pressed={view === 'map'} onClick={() => onView('map')}><MapPinned size={15} />地图模式</button><button type="button" aria-pressed={view === 'leads'} onClick={() => onView('leads')}><Building2 size={15} />列表模式</button></div></div></div>
    {view === 'leads' && <div className="lead-email-download"><span>当前范围可供核对的首封草稿 {ledger.status === 'ready' ? unsentEmails.length : '—'} 封 · 下载不会标记已发送</span><button type="button" className="secondary-button" disabled={ledger.status !== 'ready' || downloading || !unsentEmails.length} onClick={() => void downloadEmails()}><FileText size={15} />{downloading ? '核对发送记录…' : '下载当前筛选开发信'}</button></div>}
    <div className={view === 'map' ? 'customer-map-view' : 'work-list-view'}>
      {view === 'map' ? <CustomerMapWorkspace leads={matching} selectedLead={selectedLead} hoveredLead={hoveredLead} onSelectLead={setSelectedLead} onHighlight={setHoveredLead} onOpenDetail={openLeadDetail} detailOpen={Boolean(detailLead)} overviewToken={overviewToken} onOverview={resetFocus} onReturnRegions={continent !== 'all' || country !== 'all' ? returnAllRegions : undefined} ledger={ledger} work={work} /> : matching.length > 0 && <LeadList leads={matching} selectedLead={selectedLead} onHighlight={setHoveredLead} onSelect={openLeadDetail} onOpenDetail={openLeadDetail} ledger={ledger} work={work} />}
      {!matching.length && <div className="empty-state"><Search size={25} /><strong>当前筛选没有符合条件的客户</strong><span>可调整业务条件、日期或地区，或点击“清除筛选”。</span></div>}
    </div><CompanyDetail key={work.ownerId ?? work.status} lead={detailLead} onClose={() => setDetailLead(null)} ledger={ledger} work={work} leads={matching} onNavigate={openLeadDetail} />
  </section>
}

function ProductsView({ productId, onProduct }: { productId: string; onProduct: (id: string) => void }) { return <section className="market-data-section"><div className="section-heading"><div><p className="eyebrow">TDS-DRIVEN TARGETING</p><h2>产品如何变成开发名单</h2><p>系统把 TDS 已验证应用、市场扩展应用和目标公司类型分开存储。市场扩展项必须带独立公开来源、来源名称和核验日期。</p></div></div><ProductPicker value={productId} onChange={onProduct} /><div className="product-detail-grid">{marketProducts.filter((product) => productId === 'all' || product.id === productId).map((product) => { const tdsApplications = tdsVerifiedApplications.filter((item) => item.productId === product.id); const extensions = marketExtendedApplications.filter((item) => item.productId === product.id); const targets = targetCompanyTypes.filter((item) => item.productId === product.id && item.kind === 'target'); return <article className="product-detail" key={product.id}><i style={{ background: product.color }} /><h3>{product.name}</h3><p>{product.tdsScope}</p><h4>TDS 已验证应用</h4><div className="chip-row">{tdsApplications.map((item) => <span key={item.id} className="chip">{item.nameEn}</span>)}</div><h4>目标公司类型</h4><div className="chip-row">{targets.map((item) => <span key={item.id} className="chip">{item.nameEn}</span>)}</div><h4>市场扩展应用</h4>{extensions.length ? <div className="extension-list">{extensions.map((item) => <a key={item.id} href={item.sourceUrl} target="_blank" rel="noreferrer"><span>{item.nameEn}</span><small>{item.sourceName} · {item.verifiedAt}</small><ExternalLink size={13} /></a>)}</div> : <p className="detail-empty">暂无；不会仅因材料性质推测新增。</p>}<h4>检索逻辑</h4><p className="product-search-logic">{product.searchLogic}</p><h4>建议检索词</h4><ul>{product.searchTerms.map((term) => <li key={term}>{term}</li>)}</ul></article> })}</div></section> }

function SourcesView({ leads }: { leads: PublicLead[] }) { return <section className="market-data-section"><div className="section-heading"><div><p className="eyebrow">EVIDENCE TRAIL</p><h2>来源与使用边界</h2><p>线索卡只展示公司官网上公开的业务描述和联系方式。官网的存在不证明其正在采购本产品；发信前先核对联系人是否仍在职、采购职责和具体项目。</p></div></div><div className="source-evidence-list">{leads.map((lead) => <article key={lead.id}><span>{productOf(lead.productId).name}</span><div><strong>{lead.company}</strong><p>{lead.signal}</p><a href={lead.source.url} target="_blank" rel="noreferrer">{lead.source.label} · {sourceHost(lead.source.url)} <ExternalLink size={14} /></a></div><small>核验：{lead.checkedAt}</small></article>)}</div><div className="callout warning"><TriangleAlert size={18} /><div><strong>使用前必做两步</strong><p>第一步，打开每条来源确认网页与联系方式仍有效；第二步，仅向与业务相关的公开业务邮箱或官网表单发送一封个性化 B2B 开发信，并遵守目的地的反垃圾邮件规则。</p></div></div></section> }

export function MarketIntelligence() {
  const [currentRoute, setRoute] = useState(route())
  const [preferredView, setPreferredView] = useState(readLeadView)
  const [productId, setProductId] = useState<string>('all')
  const ledger = useOutreachLedger()
  const work = useLeadWork()
  useEffect(() => { const listener = () => setRoute(route()); window.addEventListener('hashchange', listener); return () => window.removeEventListener('hashchange', listener) }, [])
  const tab = marketTabForRoute(currentRoute[1], preferredView)
  useEffect(() => { if (tab === 'map' || tab === 'leads') { rememberLeadView(tab); setPreferredView(tab) } }, [tab])
  const filteredLeads = useMemo(() => publicLeads.filter((lead) => productId === 'all' || lead.productId === productId), [productId])
  const openTab = (next: MarketTab) => setHash(`market-intelligence/${next}`)
  const customerView = tab === 'map' || tab === 'leads'
  return <div className="market-workspace-page">
    <header className="page-heading market-heading"><h1>客户开发工作台</h1><nav className="market-tabs" aria-label="市场情报导航">{tabs.map((item) => { const active = item.id === 'customers' ? customerView : tab === item.id; return <button key={item.id} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined} onClick={() => openTab(item.id === 'customers' ? preferredView : item.id)}>{item.label}</button> })}</nav><MarketConnectionStatus ledger={ledger} work={work} /></header>
    {customerView && <div className="market-connection-notices">{ledger.status !== 'ready' && <OutreachLedgerNotice ledger={ledger} />}{work.status !== 'ready' && <PrivateWorkNotice work={work} />}</div>}
    {tab === 'overview' && <CustomerDevelopmentPanel ledger={ledger} />}
    {tab === 'overview' && <Overview productId={productId} leads={filteredLeads} onProduct={setProductId} onOpenMap={() => openTab('map')} />}
    {customerView && <LeadsWorkspace productId={productId} leads={filteredLeads} onProduct={setProductId} ledger={ledger} work={work} view={tab as 'map' | 'leads'} onView={openTab} />}
    {tab === 'products' && <ProductsView productId={productId} onProduct={setProductId} />}
    {tab === 'sources' && <SourcesView leads={filteredLeads} />}
  </div>
}
