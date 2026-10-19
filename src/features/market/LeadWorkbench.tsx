import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Bookmark, CalendarClock, CheckCircle2, ChevronDown, ExternalLink, ListPlus, Search, SlidersHorizontal, Star, Target, X } from 'lucide-react'
import { marketProducts, type PublicLead } from '../../lib/productMarketMap'
import { outreachCompanyKey } from '../../lib/outreachLedger'
import { shanghaiDay } from '../../lib/leadTimeline'
import { applicationKey, companyAssociations, developmentPriority, developmentProgressLabel, developmentProgressLabels, developmentStages, effectiveStage, emptyBusinessFilters, emptyWorkRecord, filterWorkbenchLeads, followUpDue, leadApplication, leadIndustry, type BusinessFilters, type DevelopmentStage, type WorkQueue } from '../../lib/leadWorkbench'
import type { LeadWork } from './useLeadWork'
import type { OutreachLedger } from './useOutreachLedger'
import './leadWorkbench.css'

export function PrivateWorkNotice({ work }: { work: LeadWork }) {
  const message = work.status === 'ready' ? '私人客户记录已连接 · 收藏、名单、备注与跟进日期仅当前账户可见'
    : work.status === 'loading' ? '正在读取私人客户记录…'
      : work.status === 'login_required' ? '登录后可保存收藏、名单和跟进计划，并查看今日开发清单。'
        : work.status === 'unconfigured' ? '连接 Supabase 并登录后，可使用私人客户记录。' : `私人客户记录读取失败：${work.error}`
  return <div className="work-private-notice" role="status"><Bookmark size={15} /><span>{message}</span>{work.status === 'error' ? <button type="button" onClick={() => void work.refresh()}>重试</button> : work.status !== 'ready' && work.status !== 'loading' ? <a href="#settings">去登录</a> : null}</div>
}

export function LeadListManager({ work, leads }: { work: LeadWork; leads: PublicLead[] }) {
  const [name, setName] = useState(''), [message, setMessage] = useState('')
  const run = async (action: () => Promise<void>, success: string) => {
    setMessage('')
    try { await action(); setMessage(success) } catch (error) { setMessage(error instanceof Error ? error.message : '保存失败') }
  }
  const create = (event: FormEvent) => {
    event.preventDefault()
    void run(async () => { await work.saveList({ id: crypto.randomUUID(), name }); setName('') }, '名单已创建，可在客户详情中添加公司。')
  }
  return <details className="work-list-manager"><summary><ListPlus size={16} />管理我的名单{work.status === 'ready' ? `（${work.lists.length}）` : ''}</summary>
    {work.status === 'ready' ? <><form onSubmit={create}><label htmlFor="work-list-name">新名单名称</label><input id="work-list-name" value={name} maxLength={40} placeholder="例如：本周重点、欧洲涂料客户" onChange={(event) => setName(event.target.value)} /><button className="secondary-button" disabled={work.busy || !name.trim()}>创建名单</button></form>
      <div className="work-list-rows">{work.lists.map((list) => {
        const count = new Set(leads.filter((lead) => work.records[outreachCompanyKey(lead)]?.listIds.includes(list.id)).map(outreachCompanyKey)).size
        return <div key={list.id}><strong>{list.name}</strong><span>{count} 家公司 · 当前产品范围</span><button type="button" disabled={work.busy} onClick={() => { const next = window.prompt('修改名单名称：', list.name); if (next !== null) void run(() => work.saveList({ ...list, name: next }), '名单已重命名。') }}>重命名</button><button type="button" disabled={work.busy} onClick={() => { if (window.confirm(`删除“${list.name}”名单？公司的收藏、备注和跟进记录会保留。`)) void run(() => work.deleteList(list.id), '名单已删除。') }}>删除</button></div>
      })}{!work.lists.length && <p>创建名单后，打开客户详情勾选要加入的名单。</p>}</div></> : <p>登录并连接私人客户记录后可管理名单。</p>}
    {message && <p role="status">{message}</p>}
  </details>
}

export function LeadBusinessControls({ leads, filters, onChange, work, ledger, allCustomerCount, allCustomersActive, onShowAll, primaryFilters, advancedContent, extraActiveFilters, extraFilterCount = 0 }: { leads: PublicLead[]; filters: BusinessFilters; onChange: (filters: BusinessFilters) => void; work: LeadWork; ledger: OutreachLedger; allCustomerCount: number; allCustomersActive: boolean; onShowAll: () => void; primaryFilters?: ReactNode; advancedContent?: ReactNode; extraActiveFilters?: ReactNode; extraFilterCount?: number }) {
  const [expanded, setExpanded] = useState(false)
  const industries = [...new Map(leads.map((lead) => [lead.targetCompanyTypeId, leadIndustry(lead)])).entries()]
  const applications = [...new Map(leads.map((lead) => [applicationKey(lead), leadApplication(lead)?.name ?? lead.companyEvidence.applicationId])).entries()]
  const records = work.status === 'ready' ? work.records : null, sends = ledger.status === 'ready' ? ledger.sends : null
  const today = shanghaiDay(new Date().toISOString())
  const patch = (values: Partial<BusinessFilters>) => onChange({ ...filters, ...values })
  const queues: Array<{ id: WorkQueue; label: string; description: string }> = [
    { id: 'all', label: '全部客户', description: '清除产品、地区、日期和业务筛选，查看全部公开客户' },
    { id: 'priority', label: '优先开发', description: '评分 ≥ 80、待开发且未记录发送' },
    { id: 'followup', label: '今日跟进', description: '包含逾期计划，暂缓客户除外' },
    { id: 'recent', label: '新收录待开发', description: '未开发、未记录发送，按最近收录排列' },
  ]
  const activeFilters = [
    { key: 'industry' as const, label: industries.find(([id]) => id === filters.industry)?.[1] ?? filters.industry },
    { key: 'application' as const, label: applications.find(([id]) => id === filters.application)?.[1] ?? filters.application },
    { key: 'contact' as const, label: ({ email: '有公开业务邮箱', form: '有官网联系页', phone: '有公开电话', named: '有可触达具名联系人' } as Record<string, string>)[filters.contact] },
    { key: 'stage' as const, label: developmentProgressLabels[filters.stage as keyof typeof developmentProgressLabels] },
    { key: 'list' as const, label: filters.list === 'favorites' ? '我的收藏' : work.lists.find((list) => list.id === filters.list)?.name },
    { key: 'sort' as const, label: '按开发优先级排列' },
    { key: 'queue' as const, label: queues.find((queue) => queue.id === filters.queue)?.label },
  ].filter(({ key }) => filters[key] !== emptyBusinessFilters[key])
  const advancedCount = activeFilters.length + extraFilterCount
  return <>
    <section className="work-controls-compact" aria-label="客户开发筛选">
      {primaryFilters}
      <div className="work-search-toolbar"><label className="work-search"><Search size={16} /><input aria-label="搜索公司" value={filters.query} placeholder="搜索公司、国家、城市或应用" onChange={(event) => patch({ query: event.target.value })} /></label><label className="work-send-filter" title={ledger.status === 'ready' ? '按公司共享的有效发送记录筛选；未发仅指台账中没有发送记录。' : '连接共享发送记录后可用，请先登录。'}>发送状态<select aria-label="开发信发送" value={filters.sendStatus} disabled={ledger.status !== 'ready'} onChange={(event) => patch({ sendStatus: event.target.value as BusinessFilters['sendStatus'] })}><option value="all">{ledger.status === 'ready' ? '全部发送状态' : '发送记录未连接'}</option><option value="sent">已发开发信</option><option value="unsent">未发（无发送记录）</option></select></label><button className="work-filter-toggle" type="button" aria-expanded={expanded} aria-controls="work-advanced-filters" onClick={() => setExpanded(!expanded)}><SlidersHorizontal size={15} />更多筛选{advancedCount > 0 && <b>{advancedCount}</b>}<ChevronDown size={14} className={expanded ? 'is-expanded' : ''} /></button>{!allCustomersActive && <button className="work-clear-filters" type="button" onClick={onShowAll}>清除筛选</button>}</div>
      {(activeFilters.length > 0 || extraFilterCount > 0) && <div className="work-active-filters" aria-label="已选业务条件">{activeFilters.map(({ key, label }) => <button type="button" key={key} onClick={() => onChange({ ...filters, [key]: emptyBusinessFilters[key] })} aria-label={`移除筛选：${label}`}><span>{label}</span><X size={12} /></button>)}{extraActiveFilters}</div>}
      <div id="work-advanced-filters" hidden={!expanded}>
      <div className="work-today" aria-label="今日开发清单"><h3 title={`${today} · 北京时间 · 全部客户为公开库总数；其余按当前产品、地区及业务条件统计，不含收录日期筛选`}><CalendarClock size={16} />开发清单</h3><div className="work-queues">{queues.map((queue) => {
        const requiresPrivate = queue.id !== 'all', requiresLedger = queue.id === 'priority' || queue.id === 'recent'
        const unavailable = (requiresPrivate && records === null) || (requiresLedger && sends === null)
        const count = queue.id === 'all' ? allCustomerCount : unavailable ? '—' : new Set(filterWorkbenchLeads(leads, { ...filters, queue: queue.id }, records, sends, today).map(outreachCompanyKey)).size
        return <button key={queue.id} type="button" title={unavailable ? '连接私人记录及共享发送记录后可用' : queue.description} aria-pressed={queue.id === 'all' ? allCustomersActive : filters.queue === queue.id} disabled={unavailable} onClick={() => queue.id === 'all' ? onShowAll() : patch({ queue: queue.id })}><span>{queue.label}</span><strong>{count}</strong></button>
      })}</div></div>
      <div className="work-business-filters" role="group" aria-label="客户业务筛选">
      <label>行业／客户类型<select aria-label="行业／客户类型" value={filters.industry} onChange={(event) => patch({ industry: event.target.value })}><option value="all">全部行业</option>{industries.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      <label>产品应用<select aria-label="产品应用" value={filters.application} onChange={(event) => patch({ application: event.target.value })}><option value="all">全部应用</option>{applications.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      <label>公开联系入口<select aria-label="公开联系入口" value={filters.contact} onChange={(event) => patch({ contact: event.target.value })}><option value="all">全部入口</option><option value="email">有公开业务邮箱</option><option value="form">有官网联系页</option><option value="phone">有公开电话</option><option value="named">有可触达具名联系人</option></select></label>
      <label>开发进度<select aria-label="开发进度" value={filters.stage} disabled={work.status !== 'ready'} onChange={(event) => patch({ stage: event.target.value })}><option value="all">全部状态</option>{Object.entries(developmentProgressLabels).map(([id, label]) => <option key={id} value={id} disabled={id === 'sent' && ledger.status !== 'ready'}>{label}</option>)}</select></label>
      <label>我的名单<select aria-label="我的名单" value={filters.list} disabled={work.status !== 'ready'} onChange={(event) => patch({ list: event.target.value })}><option value="all">全部客户</option><option value="favorites">我的收藏</option>{work.lists.map((list) => <option key={list.id} value={list.id}>{list.name}</option>)}</select></label>
      <label>排列依据<select aria-label="排列依据" value={filters.sort} onChange={(event) => patch({ sort: event.target.value as BusinessFilters['sort'] })}><option value="time">按收录时间</option><option value="priority">开发优先级</option></select></label>
    </div>
    {advancedContent}
    <LeadListManager work={work} leads={leads} />
    </div></section>
  </>
}

export function LeadWorkCard({ lead, work, ledger, onOpen }: { lead: PublicLead; work: LeadWork; ledger: OutreachLedger; onOpen: () => void }) {
  const [error, setError] = useState('')
  const record = work.status === 'ready' ? work.records[outreachCompanyKey(lead)] : undefined
  const stage = effectiveStage(lead, work.status === 'ready' ? work.records : null, ledger.status === 'ready' ? ledger.sends : null)
  const sent = ledger.status === 'ready' ? ledger.activeSend(lead) : null
  const priority = developmentPriority(lead), today = shanghaiDay(new Date().toISOString())
  const favorite = async () => {
    setError('')
    try { await work.save(lead, { favorite: !record?.favorite }) } catch (error) { setError(error instanceof Error ? error.message : '收藏失败') }
  }
  return <div className="work-card-meta"><div><button type="button" className={`work-priority ${priority.score >= 80 ? 'high' : ''}`} title={priority.reasons.join('\n')} onClick={onOpen}>{priority.label} · {priority.score} 分</button><button type="button" className="work-favorite" aria-label={record?.favorite ? '取消收藏' : '收藏客户'} aria-pressed={Boolean(record?.favorite)} disabled={work.status !== 'ready' || work.busy} onClick={() => void favorite()}><Star size={16} fill={record?.favorite ? 'currentColor' : 'none'} /></button></div>
    <button type="button" className="work-stage-link" onClick={onOpen}>{developmentProgressLabel(stage, Boolean(sent))}{record?.followUpOn && <span className={followUpDue(record, today) ? 'work-due' : ''}> · {record.stage === 'paused' ? '暂缓的计划' : followUpDue(record, today) ? '需跟进' : '下次跟进'} {record.followUpOn}</span>}</button>{error && <p role="alert">{error}</p>}
  </div>
}

export function LeadPrivatePanel({ lead, work, ledger, onDirtyChange }: { lead: PublicLead; work: LeadWork; ledger: OutreachLedger; onDirtyChange?: (dirty: boolean) => void }) {
  const record = (work.status === 'ready' ? work.records[outreachCompanyKey(lead)] : null) ?? emptyWorkRecord(outreachCompanyKey(lead))
  const [stage, setStage] = useState(record.stage ?? ''), [date, setDate] = useState(record.followUpOn), [note, setNote] = useState(record.note)
  const [favorite, setFavorite] = useState(record.favorite), [listIds, setListIds] = useState(record.listIds)
  const [dirty, setDirty] = useState(false), [message, setMessage] = useState('')
  useEffect(() => { onDirtyChange?.(dirty) }, [dirty, onDirtyChange])
  const signature = JSON.stringify(record)
  useEffect(() => {
    if (!dirty) { setStage(record.stage ?? ''); setDate(record.followUpOn); setNote(record.note); setFavorite(record.favorite); setListIds(record.listIds) }
  }, [signature, dirty])
  const actualStage = effectiveStage(lead, work.status === 'ready' ? work.records : null, ledger.status === 'ready' ? ledger.sends : null)
  const sent = ledger.status === 'ready' ? ledger.activeSend(lead) : null
  const save = async (event: FormEvent) => {
    event.preventDefault(); setMessage('')
    try {
      await work.save(lead, { stage: stage ? stage as DevelopmentStage : null, followUpOn: date, note, favorite, listIds: listIds.filter((id) => work.lists.some((list) => list.id === id)) })
      setDirty(false); setMessage('私人进度已保存。')
    } catch (error) { setMessage(error instanceof Error ? error.message : '保存失败，请重试。') }
  }
  return <section className="work-private-panel" aria-label="私人开发进度"><h3><CalendarClock size={17} />我的开发进度与跟进</h3>
    {work.status === 'ready' ? <form onSubmit={(event) => void save(event)}><p>当前进度：{developmentProgressLabel(actualStage, Boolean(sent))}。{sent ? `开发信于 ${sent.sent_on} 发送；后续进度仅当前账户可见，同公司跨产品共用。` : '私人进度仅当前账户可见，同公司跨产品共用。'}</p>
      <fieldset disabled={work.busy}><div className="work-private-fields"><label>开发状态<select aria-label="开发状态" value={stage} onChange={(event) => { setStage(event.target.value); setDirty(true) }}><option value="">跟随实际发送记录{sent ? '（已发送开发信）' : ''}</option>{Object.entries(developmentStages).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><label>下次跟进日期<input type="date" value={date} onChange={(event) => { setDate(event.target.value); setDirty(true) }} /></label></div>
      <label className="work-note-label">开发备注<textarea aria-label="开发备注" rows={3} maxLength={4000} value={note} placeholder="记录沟通情况、样品要求或下一步动作" onChange={(event) => { setNote(event.target.value); setDirty(true) }} /></label>
      <label className="work-check"><input type="checkbox" checked={favorite} onChange={(event) => { setFavorite(event.target.checked); setDirty(true) }} />收藏这家公司</label>
      <div className="work-list-checks" role="group" aria-label="加入私人名单">{work.lists.map((list) => <label className="work-check" key={list.id}><input type="checkbox" checked={listIds.includes(list.id)} onChange={(event) => { setListIds((previous) => event.target.checked ? [...previous, list.id] : previous.filter((id) => id !== list.id)); setDirty(true) }} />{list.name}</label>)}{!work.lists.length && <small>可在页面“管理我的名单”中创建名单。</small>}</div>
      <div className="work-private-save"><button className="primary-button" disabled={!dirty}>{work.busy ? '正在保存…' : '保存私人进度'}</button><small>状态调整不会标记邮件已发送；暂缓客户不出现在今日跟进中。</small></div></fieldset>
    </form> : <PrivateWorkNotice work={work} />}
    {message && <p role="status">{message}</p>}
  </section>
}

export function LeadEvidenceSummary({ lead, contactLocation = '完整邮箱、联系人及其来源见下方联络信息。' }: { lead: PublicLead; contactLocation?: string }) {
  const priority = developmentPriority(lead), application = leadApplication(lead), associations = companyAssociations(lead)
  return <section className="work-evidence-summary" aria-label="客户证据摘要"><div className="work-evidence-heading"><h3><CheckCircle2 size={18} />客户证据摘要</h3><span className="work-priority">{priority.label} · {priority.score} / 100</span></div>
    <p className="work-evidence-boundary">潜在需求侧客户 · 尚未确认采购或使用我方产品</p>
    <dl><div><dt>产品与应用</dt><dd>{marketProducts.find((product) => product.id === lead.productId)?.name} → {application?.name}<small>{lead.companyEvidence.applicationLayer === 'tds-verified' ? 'TDS 已验证应用' : '市场扩展应用，须逐案验证体系适用性'}</small></dd></div>
      <div><dt>下游制造／配方依据</dt><dd>{lead.companyEvidence.statement}<a href={lead.companyEvidence.sourceUrl} target="_blank" rel="noreferrer">{lead.companyEvidence.sourceName} <ExternalLink size={13} /></a><small>业务证据核验：{lead.companyEvidence.verifiedAt}</small></dd></div>
      <div><dt>需求侧理由</dt><dd>{lead.demandSideReason}</dd></div>
      <div><dt>同行排除结论</dt><dd>{lead.supplierCompetitorCheck?.conclusion ?? '当前公开记录未单独提供排除说明，请核对来源。'}{lead.supplierCompetitorCheck && <small>排除核验：{lead.supplierCompetitorCheck.checkedAt}</small>}</dd></div>
      <div><dt>公开业务联系入口</dt><dd>{lead.profile.generalEmail && <span>{lead.profile.generalEmail} · </span>}{lead.profile.generalPhone && <span>{lead.profile.generalPhone} · </span>}{lead.profile.contactPage || lead.profile.website ? <a href={lead.profile.contactPage ?? lead.profile.website} target="_blank" rel="noreferrer">打开官网联系入口 <ExternalLink size={13} /></a> : '请查看下方具名联系人及部门邮箱来源'}<small>{contactLocation}</small></dd></div>
      <div><dt>公司关联与去重</dt><dd>{associations.attribution ? `公开公司名称关联说明：${associations.attribution}。具体集团关系请核对官网。` : '当前公开公司名称没有单独注明集团关系。'}<small>{associations.related.length ? `同一公司另有 ${associations.related.length} 条产品记录，共用收藏、私人进度和发送查重。` : '当前公开库未检出同国家、同规范化名称的其他记录。'}集团内不同公司需另行核对，未据此合并。</small></dd></div>
    </dl>
    <details><summary><Target size={15} />查看开发优先级依据与分值</summary><p>应用 {priority.parts.application}/35 · 证据 {priority.parts.evidence}/25 · 联系入口 {priority.parts.contact}/25 · 需求侧角色 {priority.parts.role}/10 · 同行排除 {priority.parts.exclusion}/5</p><ul>{priority.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul><small>80 分起优先开发，60 分起常规开发。分数只帮助安排顺序，联系页不等于采购专用入口。</small></details>
  </section>
}
