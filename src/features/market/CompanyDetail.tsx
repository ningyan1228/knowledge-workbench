import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { CalendarCheck, ExternalLink, FileText, Globe2, Linkedin, Mail, MapPin, MessageCircle, Target, X } from 'lucide-react'
import { marketProducts, targetCompanyTypes, tdsVerifiedApplications, marketExtendedApplications, type PublicLead, type MarketProduct } from '../../lib/productMarketMap'
import { recordedTimeLabel } from '../../lib/leadTimeline'
import { localDateToday } from '../../lib/outreachLedger'
import { businessRecipient } from '../../lib/customerDevelopment'
import { contactAssessment } from '../../lib/contactEvidence'
import { DevelopmentEmailPanel } from './DevelopmentEmailPanel'
import { LeadEvidenceSummary, LeadPrivatePanel } from './LeadWorkbench'
import { CompanyBusinessContact, ContactEvidencePanel } from './ContactEvidencePanel'
import type { OutreachLedger } from './useOutreachLedger'
import type { LeadWork } from './useLeadWork'
import { CompanyDetailSections, type CompanyDetailSectionId } from './CompanyDetailSections'
import { OutreachStatusBadge } from './OutreachStatusBadge'
import './CompanyDetailDrawer.css'

function productOf(id: MarketProduct['id']) { return marketProducts.find((product) => product.id === id)! }
function targetCompanyTypeOf(id: string) { return targetCompanyTypes.find((type) => type.id === id)! }
function applicationOf(layer: 'tds-verified' | 'market-extended', id: string) { return (layer === 'tds-verified' ? tdsVerifiedApplications : marketExtendedApplications).find((application) => application.id === id)! }
function applicationLayerName(layer: 'tds-verified' | 'market-extended') { return layer === 'tds-verified' ? 'TDS 已验证应用' : '市场扩展应用' }
function sourceHost(url: string) { try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url } }

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
  return <section className="next-actions"><h3><Target size={17} />下一步动作</h3><div className="next-action-grid"><article><span>01</span><div><strong>{hasNamedContact ? `核验 ${namedContact!.name} 的采购影响力` : '找采购 / 供应链负责人'}</strong><p>{hasNamedContact ? '确认其是否参与原料评估、采购或供应商导入。' : '优先寻找 Procurement Manager、Purchasing Manager 或 Sourcing Manager。'}</p></div></article><article><span>02</span><div><strong>{hasNamedContact ? '找技术 / 生产负责人' : '找技术 / 研发 / 生产负责人'}</strong><p>{hasNamedContact ? '补充 Technical、R&D、Product、Production 或 Plant Manager。' : '优先寻找 Technical、R&D、Product、Production 或 Plant Manager。'}</p></div></article>{email ? <a className="next-action-mail" href={`mailto:${email}`} onClick={(event) => void openMail(event)}><Mail size={16} /><span><strong>03 写开发信</strong><small>打开前核对共享发送记录</small></span></a> : <article><span>03</span><div><strong>通过公开渠道联系</strong><p>复制开发信正文到官网表单或公开社交入口；也可继续补充邮箱。</p></div></article>}<article><span>04</span><div><strong>补齐联系证据</strong><p>分开记录任职身份、邮箱／电话来源和核验日期，再记录跟进计划。</p></div></article></div></section>
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

export function CompanyDetail({ lead, onClose, ledger, work, leads, onNavigate }: { lead: PublicLead | null; onClose: () => void; ledger: OutreachLedger; work: LeadWork; leads: PublicLead[]; onNavigate: (lead: PublicLead) => void }) {
  const [dirty, setDirty] = useState(false)
  const [activeSection, setActiveSection] = useState<CompanyDetailSectionId>('overview')
  const bodyRef = useRef<HTMLDivElement>(null)
  const sendRecordRef = useRef<HTMLDetailsElement>(null)
  const openSendRecord = () => {
    const record = sendRecordRef.current
    if (!record) return
    record.open = true
    record.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    const target = record.querySelector<HTMLElement>('input[type="email"]') ?? record.querySelector<HTMLElement>('summary')
    target?.focus({ preventScroll: true })
  }
  const canLeave = () => !work.busy && (!dirty || window.confirm('当前客户有未保存的私人进度或备注，确认放弃修改？'))
  const requestClose = () => { if (canLeave()) onClose() }
  const navigate = (next: PublicLead | undefined) => { if (next && canLeave()) onNavigate(next) }
  const closeRef = useRef(requestClose)
  closeRef.current = requestClose
  const opened = Boolean(lead)
  useEffect(() => { setDirty(false); bodyRef.current?.scrollTo({ top: 0 }) }, [lead?.id])
  useEffect(() => { if (!opened) setActiveSection('overview') }, [opened])
  useEffect(() => {
    if (!opened) return
    const previous = document.activeElement as HTMLElement | null
    const dialog = document.querySelector<HTMLElement>('.company-detail')
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog?.querySelector<HTMLElement>('.detail-close')?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current()
      if (event.key !== 'Tab' || !dialog) return
      const items = [...dialog.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary')].filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0)
      const first = items[0], last = items.at(-1)
      if (event.shiftKey && document.activeElement === first && last) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last && first) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', onKey); previous?.focus({ preventScroll: true }) }
  }, [opened])
  if (!lead) return null
  const index = leads.findIndex((item) => item.id === lead.id)
  const previousLead = index > 0 ? leads[index - 1] : undefined
  const nextLead = index >= 0 ? leads[index + 1] : leads[0]
  const profile = lead.profile
  const product = productOf(lead.productId)
  const targetType = targetCompanyTypeOf(lead.targetCompanyTypeId)
  const application = applicationOf(lead.companyEvidence.applicationLayer, lead.companyEvidence.applicationId)
  const extendedSource = lead.companyEvidence.applicationLayer === 'market-extended' ? marketExtendedApplications.find((item) => item.id === application.id) : undefined
  const sources = [...new Map([...profile.sources, ...(extendedSource ? [{ label: extendedSource.sourceName, url: extendedSource.sourceUrl }] : [])].map((source) => [source.url, source])).values()]
  const sent = ledger.status === 'ready' ? ledger.activeSend(lead) : null
  const sendState = ledger.status !== 'ready' ? 'unknown' : sent ? 'sent' : 'unsent'
  const onEmail = (event: MouseEvent<HTMLAnchorElement>, email: string) => void openEmailWithDuplicateCheck(event, lead, ledger, email)
  const note = '仅展示官网或官方资料中公开的业务联系方式。它们证明的是业务相关性和信息可追溯性，不代表该公司已经采购或确认需求。'
  return <div className="company-detail-backdrop company-detail-drawer-backdrop" role="presentation" onMouseDown={requestClose}>
    <section className="company-detail company-detail-drawer" role="dialog" aria-modal="true" aria-labelledby="company-detail-title" onMouseDown={(event) => event.stopPropagation()}>
      <header className="company-detail-header"><div><p className="eyebrow">COMPANY DETAIL · PUBLIC RESEARCH</p><h2 id="company-detail-title">{lead.company}</h2><p><MapPin size={15} />{lead.city}, {lead.countryZh} · {targetType.name}</p><div className="company-header-send-status" aria-live="polite"><OutreachStatusBadge state={sendState} sentOn={sent?.sent_on} /></div></div><button className="detail-close" disabled={work.busy} onClick={requestClose} aria-label="关闭公司详情"><X size={19} /></button></header>
      <nav className="company-detail-navigation" aria-label="切换当前筛选客户"><button type="button" disabled={!previousLead || work.busy} onClick={() => navigate(previousLead)}>上一家</button><span role="status">{index >= 0 ? `当前结果 ${index + 1} / ${leads.length}` : `已移出当前结果 · 剩余 ${leads.length} 条`}</span><button type="button" disabled={!nextLead || work.busy} onClick={() => navigate(nextLead)}>下一家</button></nav>
      <CompanyDetailSections key={lead.id} bodyRef={bodyRef} dirty={dirty} note={note} active={activeSection} onSectionChange={setActiveSection}
        overview={<>
          <div className="company-detail-status"><span className={`lead-fit ${lead.fit === '优先核验' ? 'priority' : ''}`}>{lead.fit}</span><span><CalendarCheck size={14} />最后核验：{lead.checkedAt}</span><span><CalendarCheck size={14} />首次收录：{recordedTimeLabel(lead)}（北京时间）</span></div>
          <section className="company-overview-summary" aria-label="公司业务概览"><div className="company-overview-heading"><strong>{product.name} → {application.name}</strong><OutreachStatusBadge state={sendState} sentOn={sent?.sent_on} /></div><p>{lead.companyEvidence.statement}</p><small>潜在需求侧客户 · 尚未确认采购或使用我方产品</small></section>
          <div className="company-detail-links">{profile.website && <a href={profile.website} target="_blank" rel="noreferrer"><Globe2 size={15} />官网</a>}{profile.contactPage && <a href={profile.contactPage} target="_blank" rel="noreferrer"><FileText size={15} />Contact Page</a>}{profile.linkedIn && <a href={profile.linkedIn} target="_blank" rel="noreferrer"><Linkedin size={15} />LinkedIn</a>}{profile.whatsapp && <a href={profile.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={15} />WhatsApp</a>}</div>
          <div className="company-detail-grid"><section><h3>公司公开联络</h3><CompanyBusinessContact lead={lead} onEmail={onEmail} compactEvidence /></section><section><h3>地址</h3><div className="detail-value"><MapPin size={15} /><span>{profile.address ?? `${lead.city}, ${lead.country}`}</span></div>{!profile.address && <p className="detail-empty">尚未从官方来源核验街道地址。</p>}</section></div>
          <ContactEvidencePanel lead={lead} onEmail={onEmail} compactEvidence />
        </>}
        outreach={<>
          <DevelopmentEmailPanel lead={lead} ledger={ledger} work={work} onOpenSendRecord={openSendRecord} />
          <details ref={sendRecordRef} id={`company-send-record-${lead.id}`} className="company-disclosure"><summary>开发信发送记录<OutreachStatusBadge state={sendState} sentOn={sent?.sent_on} /></summary><OutreachSendPanel key={lead.id} lead={lead} ledger={ledger} /></details>
          <details className="company-disclosure"><summary>我的开发进度与跟进{dirty && <span>有未保存修改</span>}</summary><LeadPrivatePanel key={work.ownerId ?? work.status} lead={lead} work={work} ledger={ledger} onDirtyChange={setDirty} /></details>
          <details className="company-disclosure"><summary>下一步动作与建议</summary><NextActions lead={lead} ledger={ledger} /></details>
        </>}
        evidence={<>
          <details className="company-disclosure"><summary>客户证据与同行排除<span>完整核验原文、需求侧理由、公司关联与评分</span></summary><LeadEvidenceSummary lead={lead} contactLocation="完整邮箱、联系人及其来源见“概览与联系”页签。" /></details>
          <details className="company-disclosure"><summary>为什么被找到<span>产品 → 应用 → 客户类型 → 公司</span></summary><section className="match-path"><h3><Target size={17} />为什么被找到</h3><div className="match-path-steps"><strong>{product.name}</strong><i>→</i><span><small>{applicationLayerName(lead.companyEvidence.applicationLayer)}</small>{application.nameEn}</span><i>→</i><span><small>目标公司类型</small>{targetType.nameEn}</span><i>→</i><strong>{lead.company}</strong></div><div className="match-path-evidence"><b>证据</b><p>{lead.companyEvidence.statement}</p><a href={lead.companyEvidence.sourceUrl} target="_blank" rel="noreferrer">{lead.companyEvidence.sourceName} <ExternalLink size={13} /></a></div>{targetType.kind === 'alternative-research' && <em>这是技术路线研究，不是已确认客户。</em>}</section></details>
          <section className="company-detail-section"><h3><FileText size={17} />信息来源</h3><div className="detail-sources">{sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer"><span>{source.label}</span><small>{sourceHost(source.url)}</small><ExternalLink size={14} /></a>)}</div>{extendedSource && <p className="detail-empty">市场扩展来源核验：{extendedSource.verifiedAt}</p>}</section>
        </>} />
    </section>
  </div>
}
