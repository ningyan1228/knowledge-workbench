import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { latLngBounds } from 'leaflet'
import { CircleMarker, MapContainer, TileLayer, useMap } from 'react-leaflet'
import { Building2, CalendarCheck, CheckCircle2, ChevronRight, ExternalLink, FileText, Globe2, Linkedin, Mail, MapPin, MapPinned, MessageCircle, Search, Target, TriangleAlert, X } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { marketExtendedApplications, marketProducts, publicLeads, targetCompanyTypes, tdsVerifiedApplications, type MarketProduct, type PublicLead } from '../../lib/productMarketMap'
import { recordedTimeLabel, timelineLeads, type TimelineOrder } from '../../lib/leadTimeline'
import { LeadTimelineControls } from './LeadTimelineControls'
import { filterLeadGeography, geographyOptions } from '../../lib/leadGeography'
import { DevelopmentEmailPanel } from './DevelopmentEmailPanel'
import { localDateToday, outreachCompanyKey } from '../../lib/outreachLedger'
import { businessRecipient, firstContactPlan, firstContactExport } from '../../lib/customerDevelopment'
import { CustomerDevelopmentPanel } from './CustomerDevelopmentPanel'
import { useOutreachLedger, type OutreachLedger } from './useOutreachLedger'
import { useLeadWork, type LeadWork } from './useLeadWork'
import { LeadBusinessControls, LeadEvidenceSummary, LeadPrivatePanel, LeadWorkCard } from './LeadWorkbench'
import { emptyBusinessFilters, filterWorkbenchLeads, type BusinessFilters } from '../../lib/leadWorkbench'
import { shanghaiDay } from '../../lib/leadTimeline'
import { contactAssessment } from '../../lib/contactEvidence'
import { CompanyBusinessContact, ContactEvidencePanel } from './ContactEvidencePanel'

type MarketTab = 'overview' | 'map' | 'leads' | 'products' | 'sources'
type CountrySummary = { country: string; countryZh: string; latitude: number; longitude: number; count: number }
const tabs: Array<{ id: MarketTab; label: string }> = [{ id: 'overview', label: '总览' }, { id: 'map', label: '全球地图' }, { id: 'leads', label: '线索库' }, { id: 'products', label: '产品匹配' }, { id: 'sources', label: '来源与核验' }]

function setHash(value: string) { window.location.hash = value }
function productOf(id: MarketProduct['id']) { return marketProducts.find((product) => product.id === id)! }
function targetCompanyTypeOf(id: string) { return targetCompanyTypes.find((type) => type.id === id)! }
function applicationOf(layer: 'tds-verified' | 'market-extended', id: string) { return (layer === 'tds-verified' ? tdsVerifiedApplications : marketExtendedApplications).find((application) => application.id === id)! }
function applicationLayerName(layer: 'tds-verified' | 'market-extended') { return layer === 'tds-verified' ? 'TDS 已验证应用' : '市场扩展应用' }
function sourceHost(url: string) { try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url } }
function route() { return window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean) }

function MapFocus({ target, leads, overviewToken }: { target: PublicLead | CountrySummary | null; leads: PublicLead[]; overviewToken: number }) {
  const map = useMap()
  useEffect(() => {
    map.invalidateSize()
    // Keep one full world across the viewport; zoom 0/1 repeats OSM tiles on wide screens.
    map.setMinZoom(Math.max(0, Math.log2(map.getSize().x / 256)))
    if (!leads.length) {
      map.setView([20, 0], map.getMinZoom())
      return
    }
    map.fitBounds(latLngBounds(leads.map((lead) => [lead.latitude, lead.longitude])), { padding: [24, 24], maxZoom: 3, animate: false })
  }, [map, leads, overviewToken])
  useEffect(() => {
    const onResize = () => {
      map.invalidateSize()
      map.setMinZoom(Math.max(0, Math.log2(map.getSize().x / 256)))
      if (!target && leads.length) map.fitBounds(latLngBounds(leads.map((lead) => [lead.latitude, lead.longitude])), { padding: [24, 24], maxZoom: 3, animate: false })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [map, leads, target])
  useEffect(() => {
    if (target) map.setView([target.latitude, target.longitude], 'count' in target ? 4 : 7, { animate: false })
  }, [map, target])
  return null
}

function ProductPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <div className="lead-product-picker" aria-label="按产品筛选">{marketProducts.map((product) => <button key={product.id} className={value === product.id ? 'active' : ''} onClick={() => onChange(product.id)}><i style={{ background: product.color }} />{product.name}</button>)}<button className={value === 'all' ? 'active' : ''} onClick={() => onChange('all')}>全部产品</button></div>
}

function LeadCard({ lead, selected, onSelect, onOpenDetail, ledger, work }: { lead: PublicLead; selected?: boolean; onSelect: (lead: PublicLead) => void; onOpenDetail: (lead: PublicLead) => void; ledger: OutreachLedger; work: LeadWork }) {
  const product = productOf(lead.productId)
  const targetType = targetCompanyTypeOf(lead.targetCompanyTypeId)
  const recipient = businessRecipient(lead)
  const primaryContact = recipient ? `${recipient.name ?? recipient.label} · ${recipient.name ? '身份及业务邮箱分项核验' : '公司／部门业务入口'}` : '待补有来源的业务邮箱'
  const sent = ledger.status === 'ready' ? ledger.activeSend(lead) : null
  const sendLabel = ledger.status === 'ready' ? sent ? `已发送 · ${sent.sent_on} · 查看记录` : '未记录发送 · 点击查看' : '发送状态未连接 · 点击查看'
  return <article className={selected ? 'lead-card selected' : 'lead-card'}><button className="lead-card-main" onClick={() => onSelect(lead)}><span className="lead-dot" style={{ background: product.color }} /><span><small>{lead.countryZh} · {lead.city}</small><h3>{lead.company}</h3><p>{targetType.name}{targetType.kind === 'alternative-research' ? ' · 技术路线研究' : ''}</p></span><ChevronRight size={17} /></button><LeadWorkCard lead={lead} work={work} ledger={ledger} onOpen={() => onOpenDetail(lead)} /><div className="lead-card-meta"><span className={`lead-fit ${lead.fit === '优先核验' ? 'priority' : ''}`}>{lead.fit}</span><span>{lead.checkedAt} 核验</span></div><div className="lead-card-recorded"><CalendarCheck size={13} /><span>首次收录：{recordedTimeLabel(lead)}（北京时间）</span></div><div className="lead-card-footer"><span>{primaryContact}</span><button onClick={() => onOpenDetail(lead)}>客户详情</button></div><button type="button" className={`lead-send-status ${sent ? 'is-sent' : ''}`} onClick={() => onOpenDetail(lead)}>{sendLabel}</button></article>
}

async function openEmailWithDuplicateCheck(event: MouseEvent<HTMLAnchorElement>, lead: PublicLead, ledger: OutreachLedger, email: string) {
  event.preventDefault()
  try {
    if (ledger.status !== 'ready') {
      if (!window.confirm('共享发送记录尚未连接，无法排除重复。仍要打开邮件吗？')) return
    } else {
      const sent = await ledger.checkBeforeOutreach(lead)
      if (sent && !window.confirm(`该公司已于 ${sent.sent_on} 发往 ${sent.recipient_email}。确认仍要打开邮件吗？`)) return
    }
    window.location.href = `mailto:${email}`
  } catch (error) { window.alert(`无法核对发送记录：${error instanceof Error ? error.message : '未知错误'}`) }
}

function NextActions({ lead, ledger }: { lead: PublicLead; ledger: OutreachLedger }) {
  const namedContact = lead.profile.contacts.find((person) => contactAssessment(lead.company, person).identity)
  const email = businessRecipient(lead)?.email
  const hasNamedContact = Boolean(namedContact)
  const openMail = (event: MouseEvent<HTMLAnchorElement>) => { if (email) void openEmailWithDuplicateCheck(event, lead, ledger, email) }
  return <section className="next-actions"><h3><Target size={17} />下一步动作</h3><div className="next-action-grid"><article><span>01</span><div><strong>{hasNamedContact ? `核验 ${namedContact!.name} 的采购影响力` : '找采购 / 供应链负责人'}</strong><p>{hasNamedContact ? '确认其是否参与原料评估、采购或供应商导入。' : '优先寻找 Procurement Manager、Purchasing Manager 或 Sourcing Manager。'}</p></div></article><article><span>02</span><div><strong>{hasNamedContact ? '找技术 / 生产负责人' : '找技术 / 研发 / 生产负责人'}</strong><p>{hasNamedContact ? '补充 Technical、R&D、Product、Production 或 Plant Manager。' : '优先寻找 Technical、R&D、Product、Production 或 Plant Manager。'}</p></div></article>{email ? <a className="next-action-mail" href={`mailto:${email}`} onClick={(event) => void openMail(event)}><Mail size={16} /><span><strong>03 写开发信</strong><small>打开前核对共享发送记录</small></span></a> : <article><span>03</span><div><strong>补充公开业务邮箱</strong><p>仅使用官网 Contact Page 或公开部门邮箱。</p></div></article>}<article><span>04</span><div><strong>补齐联系证据</strong><p>分开记录任职身份、邮箱／电话来源和核验日期，再记录跟进计划。</p></div></article></div></section>
}

function OutreachSendPanel({ lead, ledger }: { lead: PublicLead; ledger: OutreachLedger }) {
  const suggestedEmail = businessRecipient(lead)?.email ?? ''
  const [recipient, setRecipient] = useState(suggestedEmail)
  const [sentOn, setSentOn] = useState(localDateToday())
  const [message, setMessage] = useState('')
  const sent = ledger.status === 'ready' ? ledger.activeSend(lead) : null
  const markSent = async () => {
    if (!window.confirm(`确认已经实际向 ${recipient.trim()} 发送开发信？此记录会让所有登录同事看到。`)) return
    try {
      await ledger.markSent(lead, recipient, sentOn)
      setMessage('已记录发送；其他同事刷新后也能看到。')
    } catch (error) { setMessage(error instanceof Error ? error.message : '保存失败') }
  }
  const voidSent = async () => {
    if (!sent) return
    const reason = window.prompt('仅用于误标记时撤销。请写明更正原因（至少 3 个字）：')
    if (reason === null) return
    try {
      await ledger.voidSent(sent.id, reason)
      setMessage('错误记录已更正，原记录保留以便追溯。')
    } catch (error) { setMessage(error instanceof Error ? error.message : '更正失败') }
  }
  return <section className="outreach-send-panel" aria-label="共享开发信发送记录">
    <h3><CalendarCheck size={17} />开发信发送记录</h3>
    {ledger.status === 'ready' ? sent ? <>
      <p className="outreach-send-confirmed">已发送 · {sent.sent_on} · 收件邮箱 {sent.recipient_email}</p>
      <p>按公司去重：即使该公司匹配其他产品，也会提醒已有发送记录。</p>
      <button className="secondary-button" type="button" disabled={ledger.busy} onClick={() => void voidSent()}>误标记？更正记录</button>
    </> : <>
      <p>暂无发送记录。只有邮件实际发出后才手动标记；复制草稿或打开邮件窗口不算发送。</p>
      <div className="outreach-send-form">
        <label>实际收件邮箱<input type="email" value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="recipient@company.com" /></label>
        <label>实际发送日期<input type="date" max={localDateToday()} value={sentOn} onChange={(event) => setSentOn(event.target.value)} /></label>
        <button className="secondary-button" type="button" disabled={ledger.busy || !recipient.trim()} onClick={() => void markSent()}>确认已发送</button>
      </div>
    </> : <p className="outreach-send-unavailable">{ledger.status === 'login_required' ? '请先在“设置”中登录，才能读取或标记共享发送记录。' : ledger.status === 'unconfigured' ? 'Supabase 尚未配置，无法共享发送记录。' : ledger.status === 'loading' ? '正在读取共享发送记录…' : `共享发送记录暂不可用：${ledger.error ?? '请确认数据库迁移已执行。'}`}</p>}
    <small>此项目的已登录账号共用同一台账；它是人工记录，不会自动读取邮箱或发送邮件。</small>
    {message && <p className="outreach-send-message" role="status">{message}</p>}
  </section>
}

function CompanyDetail({ lead, onClose, ledger, work }: { lead: PublicLead | null; onClose: () => void; ledger: OutreachLedger; work: LeadWork }) {
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useEffect(() => {
    if (!lead) return
    const previous = document.activeElement as HTMLElement | null
    const dialog = document.querySelector<HTMLElement>('.company-detail')
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog?.querySelector<HTMLElement>('.detail-close')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current()
      if (event.key !== 'Tab' || !dialog) return
      const items = [...dialog.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary')].filter((element) => element.getClientRects().length > 0)
      const first = items[0], last = items.at(-1)
      if (event.shiftKey && document.activeElement === first && last) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last && first) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKey); previous?.focus() }
  }, [lead?.id])
  if (!lead) return null
  const profile = lead.profile
  const product = productOf(lead.productId)
  const targetType = targetCompanyTypeOf(lead.targetCompanyTypeId)
  const application = applicationOf(lead.companyEvidence.applicationLayer, lead.companyEvidence.applicationId)
  const extendedSource = lead.companyEvidence.applicationLayer === 'market-extended' ? marketExtendedApplications.find((item) => item.id === application.id) : undefined
  const sources = [...new Map([...profile.sources, ...(extendedSource ? [{ label: extendedSource.sourceName, url: extendedSource.sourceUrl }] : [])].map((source) => [source.url, source])).values()]
  return <div className="company-detail-backdrop" role="presentation" onMouseDown={onClose}><section className="company-detail" role="dialog" aria-modal="true" aria-labelledby="company-detail-title" onMouseDown={(event) => event.stopPropagation()}><header className="company-detail-header"><div><p className="eyebrow">COMPANY DETAIL · PUBLIC RESEARCH</p><h2 id="company-detail-title">{lead.company}</h2><p><MapPin size={15} />{lead.city}, {lead.countryZh} · {targetType.name}</p></div><button className="detail-close" onClick={onClose} aria-label="关闭公司详情"><X size={19} /></button></header><div className="company-detail-status"><span className={`lead-fit ${lead.fit === '优先核验' ? 'priority' : ''}`}>{lead.fit}</span><span><CalendarCheck size={14} />最后核验：{lead.checkedAt}</span><span><CalendarCheck size={14} />首次收录：{recordedTimeLabel(lead)}（北京时间）</span></div><LeadEvidenceSummary lead={lead} /><LeadPrivatePanel key={work.ownerId ?? work.status} lead={lead} work={work} ledger={ledger} /><section className="match-path"><h3><Target size={17} />为什么被找到</h3><div className="match-path-steps"><strong>{product.name}</strong><i>→</i><span><small>{applicationLayerName(lead.companyEvidence.applicationLayer)}</small>{application.nameEn}</span><i>→</i><span><small>目标公司类型</small>{targetType.nameEn}</span><i>→</i><strong>{lead.company}</strong></div><div className="match-path-evidence"><b>证据</b><p>{lead.companyEvidence.statement}</p><a href={lead.companyEvidence.sourceUrl} target="_blank" rel="noreferrer">{lead.companyEvidence.sourceName} <ExternalLink size={13} /></a></div>{targetType.kind === 'alternative-research' && <em>这是技术路线研究，不是已确认客户。</em>}</section><div className="company-detail-links">{profile.website && <a href={profile.website} target="_blank" rel="noreferrer"><Globe2 size={15} />官网</a>}{profile.contactPage && <a href={profile.contactPage} target="_blank" rel="noreferrer"><FileText size={15} />Contact Page</a>}{profile.linkedIn && <a href={profile.linkedIn} target="_blank" rel="noreferrer"><Linkedin size={15} />LinkedIn</a>}{profile.whatsapp && <a href={profile.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={15} />WhatsApp</a>}</div><OutreachSendPanel key={lead.id} lead={lead} ledger={ledger} /><DevelopmentEmailPanel lead={lead} ledger={ledger} /><NextActions lead={lead} ledger={ledger} /><div className="company-detail-grid"><section><h3>公司公开联络</h3><CompanyBusinessContact lead={lead} onEmail={(event, email) => void openEmailWithDuplicateCheck(event, lead, ledger, email)} /></section><section><h3>地址</h3><div className="detail-value"><MapPin size={15} /><span>{profile.address ?? `${lead.city}, ${lead.country}`}</span></div>{!profile.address && <p className="detail-empty">尚未从官方来源核验街道地址。</p>}</section></div><ContactEvidencePanel lead={lead} onEmail={(event, email) => void openEmailWithDuplicateCheck(event, lead, ledger, email)} /><section className="company-detail-section"><h3><FileText size={17} />信息来源</h3><div className="detail-sources">{sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer"><span>{source.label}</span><small>{sourceHost(source.url)}</small><ExternalLink size={14} /></a>)}</div>{extendedSource && <p className="detail-empty">市场扩展来源核验：{extendedSource.verifiedAt}</p>}</section><p className="company-detail-note">仅展示官网或官方资料中公开的业务联系方式。它们证明的是业务相关性和信息可追溯性，不代表该公司已经采购或确认需求。</p></section></div>
}

function GlobalLeadMap({ leads, selectedLead, onSelectLead, selectedCountry, onSelectCountry, overviewToken }: { leads: PublicLead[]; selectedLead: PublicLead | null; onSelectLead: (lead: PublicLead) => void; selectedCountry: CountrySummary | null; onSelectCountry: (country: CountrySummary) => void; overviewToken: number }) {
  const countries = useMemo(() => Object.values(leads.reduce<Record<string, CountrySummary>>((all, lead) => { const old = all[lead.country]; all[lead.country] = old ? { ...old, count: old.count + 1 } : { country: lead.country, countryZh: lead.countryZh, latitude: lead.latitude, longitude: lead.longitude, count: 1 }; return all }, {})), [leads])
  return <MapContainer zoomAnimation={false} fadeAnimation={false} className="market-map global-lead-map" center={[20, 0]} zoom={1} minZoom={0} zoomSnap={0} maxBounds={[[-85, -180], [85, 180]]} maxBoundsViscosity={1} scrollWheelZoom aria-label="全球产品线索地图"><TileLayer noWrap attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><MapFocus target={selectedLead ?? selectedCountry} leads={leads} overviewToken={overviewToken} />{countries.map((country) => <CircleMarker key={country.country} center={[country.latitude, country.longitude]} radius={13 + country.count * 4} pathOptions={{ color: '#f59e0b', fillColor: '#fbbf24', fillOpacity: .28, weight: 1 }} eventHandlers={{ click: () => onSelectCountry(country) }} />)}{leads.map((lead) => { const product = productOf(lead.productId); return <CircleMarker key={lead.id} center={[lead.latitude, lead.longitude]} radius={selectedLead?.id === lead.id ? 10 : 6} pathOptions={{ color: '#fff', fillColor: product.color, fillOpacity: 1, weight: selectedLead?.id === lead.id ? 4 : 2 }} eventHandlers={{ click: () => onSelectLead(lead) }} /> })}</MapContainer>
}

function MapLegend() { return <p className="map-legend"><i />大号黄圈 = 国家内已核验公开线索密度；彩色点 = 一家可研究的公司。它们不是市场规模、成交概率或真实需求量。</p> }

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
  const [selectedCountry, setSelectedCountry] = useState<CountrySummary | null>(null)
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
  const matching = useMemo(() => timelineLeads(businessLeads, order, day).sort((a, b) => businessLeads.indexOf(a) - businessLeads.indexOf(b)), [businessLeads, order, day])
  const resetFocus = () => { setSelectedLead(null); setSelectedCountry(null); setOverviewToken((value) => value + 1) }
  useEffect(() => { setFilters((current) => ({ ...current, industry: 'all', application: 'all' })); setDetailLead(null); resetFocus() }, [productId])
  useEffect(() => {
    setFilters((current) => {
      const listMissing = current.list !== 'all' && current.list !== 'favorites' && !work.lists.some((list) => list.id === current.list)
      return work.status !== 'ready' ? { ...current, stage: 'all', list: 'all', queue: 'all' } : listMissing ? { ...current, list: 'all' } : current
    })
  }, [work.status, work.lists])
  useEffect(() => { if (ledger.status !== 'ready') setFilters((current) => current.queue === 'priority' || current.queue === 'recent' ? { ...current, queue: 'all' } : current) }, [ledger.status])
  useEffect(() => { if (country !== 'all' && !options.countries.some((item) => item.value === country)) setCountry('all') }, [options, country])
  useEffect(() => {
    if (selectedLead && !matching.some((lead) => lead.id === selectedLead.id)) setSelectedLead(null)
    if (selectedCountry && !matching.some((lead) => lead.country === selectedCountry.country)) setSelectedCountry(null)
  }, [matching, selectedLead, selectedCountry])
  const showAll = () => { setContinent('all'); setCountry('all'); setDay('all'); setFilters({ ...emptyBusinessFilters }); resetFocus() }
  const selectCountry = (value: string) => { setCountry(value); resetFocus() }
  const regionLabel = country !== 'all' ? options.countries.find((item) => item.value === country)?.label ?? country : continent !== 'all' ? continent : '全部地区'
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
    <div className="section-heading"><div><p className="eyebrow">CUSTOMER DEVELOPMENT WORKSPACE</p><h2>{view === 'map' ? '全球客户地图' : '客户开发列表'}</h2><p>筛选合适的潜在客户，查看开发依据，安排自己的联系与跟进计划。</p></div><div className="work-view-toggle" role="group" aria-label="客户展示方式"><button type="button" aria-pressed={view === 'map'} onClick={() => onView('map')}><MapPinned size={15} />地图</button><button type="button" aria-pressed={view === 'leads'} onClick={() => onView('leads')}><Building2 size={15} />列表</button></div></div>
    <ProductPicker value={productId} onChange={onProduct} />
    <div className="lead-geography-filters" role="group" aria-label="按地区筛选"><label>大洲<select aria-label="大洲" value={continent} onChange={(event) => { setContinent(event.target.value); setCountry('all'); resetFocus() }}><option value="all">全部大洲</option>{options.continents.map((item) => <option key={item.value} value={item.value}>{item.value} · {item.count} 家</option>)}</select></label><label>国家／地区<select aria-label="国家／地区" value={country} onChange={(event) => selectCountry(event.target.value)}><option value="all">全部国家／地区</option>{options.countries.map((item) => <option key={item.value} value={item.value}>{item.label} · {item.count} 家</option>)}</select></label></div>
    <LeadBusinessControls leads={regionalLeads} filters={filters} onChange={(value) => { setFilters(value); resetFocus() }} work={work} ledger={ledger} />
    <LeadTimelineControls leads={businessLeads} order={order} day={day} onOrder={setOrder} onDay={(value) => { setDay(value); resetFocus() }} />
    <div className="market-map-toolbar"><span role="status">当前筛选：{regionLabel}{day !== 'all' ? ' · ' + (day === 'unknown' ? '时间未记录' : day) : ''} · {matching.length} 条客户记录 · {new Set(matching.map(outreachCompanyKey)).size} 家公司 · {new Set(matching.map((lead) => lead.country)).size} 个国家／地区</span><button type="button" onClick={showAll}>显示全部</button></div>
    {view === 'leads' && <div className="lead-email-download"><span>当前范围可供核对的首封草稿 {ledger.status === 'ready' ? unsentEmails.length : '—'} 封 · 下载不会标记已发送</span><button type="button" className="secondary-button" disabled={ledger.status !== 'ready' || downloading || !unsentEmails.length} onClick={() => void downloadEmails()}><FileText size={15} />{downloading ? '核对发送记录…' : '下载当前筛选开发信'}</button></div>}
    <div className={view === 'map' ? 'market-map-layout lead-map-layout' : 'work-list-view'}>
      {view === 'map' && <div><GlobalLeadMap leads={matching} selectedLead={selectedLead} selectedCountry={selectedCountry} overviewToken={overviewToken} onSelectLead={(lead) => { setSelectedLead(lead); setSelectedCountry(null) }} onSelectCountry={(item) => selectCountry(item.country)} /><MapLegend /></div>}
      <div className={view === 'map' ? 'lead-map-sidebar' : 'lead-list'}>{view === 'map' && <div className="sidebar-title"><Target size={16} /><strong>{regionLabel}客户 · {matching.length} 条</strong></div>}{matching.map((lead) => <LeadCard key={lead.id} lead={lead} selected={lead.id === selectedLead?.id} onSelect={(item) => { setSelectedLead(item); setSelectedCountry(null); if (view === 'leads') setDetailLead(item) }} onOpenDetail={setDetailLead} ledger={ledger} work={work} />)}{!matching.length && <div className="empty-state"><Search size={25} /><strong>当前筛选没有符合条件的客户</strong><span>可调整业务条件、日期或地区，或点击“显示全部”。</span></div>}</div>
    </div><CompanyDetail key={work.ownerId ?? work.status} lead={detailLead} onClose={() => setDetailLead(null)} ledger={ledger} work={work} />
  </section>
}

function ProductsView({ productId, onProduct }: { productId: string; onProduct: (id: string) => void }) { return <section className="market-data-section"><div className="section-heading"><div><p className="eyebrow">TDS-DRIVEN TARGETING</p><h2>产品如何变成开发名单</h2><p>系统把 TDS 已验证应用、市场扩展应用和目标公司类型分开存储。市场扩展项必须带独立公开来源、来源名称和核验日期。</p></div></div><ProductPicker value={productId} onChange={onProduct} /><div className="product-detail-grid">{marketProducts.filter((product) => productId === 'all' || product.id === productId).map((product) => { const tdsApplications = tdsVerifiedApplications.filter((item) => item.productId === product.id); const extensions = marketExtendedApplications.filter((item) => item.productId === product.id); const targets = targetCompanyTypes.filter((item) => item.productId === product.id && item.kind === 'target'); return <article className="product-detail" key={product.id}><i style={{ background: product.color }} /><h3>{product.name}</h3><p>{product.tdsScope}</p><h4>TDS 已验证应用</h4><div className="chip-row">{tdsApplications.map((item) => <span key={item.id} className="chip">{item.nameEn}</span>)}</div><h4>目标公司类型</h4><div className="chip-row">{targets.map((item) => <span key={item.id} className="chip">{item.nameEn}</span>)}</div><h4>市场扩展应用</h4>{extensions.length ? <div className="extension-list">{extensions.map((item) => <a key={item.id} href={item.sourceUrl} target="_blank" rel="noreferrer"><span>{item.nameEn}</span><small>{item.sourceName} · {item.verifiedAt}</small><ExternalLink size={13} /></a>)}</div> : <p className="detail-empty">暂无；不会仅因材料性质推测新增。</p>}<h4>检索逻辑</h4><p className="product-search-logic">{product.searchLogic}</p><h4>建议检索词</h4><ul>{product.searchTerms.map((term) => <li key={term}>{term}</li>)}</ul></article> })}</div></section> }

function SourcesView({ leads }: { leads: PublicLead[] }) { return <section className="market-data-section"><div className="section-heading"><div><p className="eyebrow">EVIDENCE TRAIL</p><h2>来源与使用边界</h2><p>线索卡只展示公司官网上公开的业务描述和联系方式。官网的存在不证明其正在采购本产品；发信前先核对联系人是否仍在职、采购职责和具体项目。</p></div></div><div className="source-evidence-list">{leads.map((lead) => <article key={lead.id}><span>{productOf(lead.productId).name}</span><div><strong>{lead.company}</strong><p>{lead.signal}</p><a href={lead.source.url} target="_blank" rel="noreferrer">{lead.source.label} · {sourceHost(lead.source.url)} <ExternalLink size={14} /></a></div><small>核验：{lead.checkedAt}</small></article>)}</div><div className="callout warning"><TriangleAlert size={18} /><div><strong>使用前必做两步</strong><p>第一步，打开每条来源确认网页与联系方式仍有效；第二步，仅向与业务相关的公开业务邮箱或官网表单发送一封个性化 B2B 开发信，并遵守目的地的反垃圾邮件规则。</p></div></div></section> }

export function MarketIntelligence() {
  const [currentRoute, setRoute] = useState(route())
  const [productId, setProductId] = useState<string>('all')
  const ledger = useOutreachLedger()
  const work = useLeadWork()
  useEffect(() => { const listener = () => setRoute(route()); window.addEventListener('hashchange', listener); return () => window.removeEventListener('hashchange', listener) }, [])
  const tab = (tabs.find((item) => item.id === currentRoute[1])?.id ?? 'overview') as MarketTab
  const filteredLeads = useMemo(() => publicLeads.filter((lead) => productId === 'all' || lead.productId === productId), [productId])
  const openTab = (next: MarketTab) => setHash(next === 'overview' ? 'market-intelligence' : `market-intelligence/${next}`)
  return <><div className="page-heading market-heading"><div><p className="eyebrow">GLOBAL MARKET INTELLIGENCE</p><h1>客户地图，而不是一张漂亮的世界地图。</h1><p>围绕三款产品建立“产品 → 需求场景 → 公司 → 联系方式 → 证据”的开发链路。</p></div><span className="market-research-badge"><CheckCircle2 size={14} />公开来源研究</span></div><div className="market-tabs" role="tablist">{tabs.map((item) => <button key={item.id} className={tab === item.id ? 'active' : ''} onClick={() => openTab(item.id)}>{item.label}</button>)}</div>{(tab === 'map' || tab === 'leads') && <OutreachLedgerNotice ledger={ledger} />}{tab === 'overview' && <CustomerDevelopmentPanel ledger={ledger} />}{tab === 'overview' && <Overview productId={productId} leads={filteredLeads} onProduct={setProductId} onOpenMap={() => openTab('map')} />}{(tab === 'map' || tab === 'leads') && <LeadsWorkspace productId={productId} leads={filteredLeads} onProduct={setProductId} ledger={ledger} work={work} view={tab} onView={openTab} />}{tab === 'products' && <ProductsView productId={productId} onProduct={setProductId} />}{tab === 'sources' && <SourcesView leads={filteredLeads} />}</>
}
