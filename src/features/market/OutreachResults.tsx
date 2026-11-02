import { useEffect, useMemo, useRef, useState } from 'react'
import { RefreshCw, Plus } from 'lucide-react'
import { marketProducts, type PublicLead } from '../../lib/productMarketMap'
import { companyResults, countResults, resultGroups, resultLabels, milestoneKinds, evidenceGroups, type ResultKind } from '../../lib/outreachResults'
import { effectiveStage, developmentProgressLabels, followUpDue, emptyWorkRecord } from '../../lib/leadWorkbench'
import { outreachCompanyKey } from '../../lib/outreachLedger'
import { shanghaiDay } from '../../lib/leadTimeline'
import type { OutreachLedger } from './useOutreachLedger'
import type { LeadWork } from './useLeadWork'
import { PrivateWorkNotice } from './LeadWorkbench'
import { ResultRecordPanel } from './ResultRecordPanel'
import './OutreachResults.css'

const kinds = milestoneKinds
export function OutreachResults({ leads, ledger, work }: { leads: PublicLead[]; ledger: OutreachLedger; work: LeadWork }) {
  const [product, setProduct] = useState('all'), [country, setCountry] = useState('all'), [batch, setBatch] = useState('all')
  const [insightDimension, setInsightDimension] = useState<'application' | 'pitch'>('application')
  const [planDirty, setPlanDirty] = useState(false)
  const [planStep, setPlanStep] = useState(''), [planDate, setPlanDate] = useState(''), [planMessage, setPlanMessage] = useState(''), [planSaving, setPlanSaving] = useState(false)
  const [dimension, setDimension] = useState<'product' | 'country' | 'batch'>('product')
  const [selected, setSelected] = useState(''), [query, setQuery] = useState(''), [refreshing, setRefreshing] = useState(false), [refreshError, setRefreshError] = useState('')
  useEffect(() => { setSelected(''); setPlanStep(''); setPlanDate(''); setPlanMessage(''); setPlanDirty(false) }, [work.ownerId])
  const recorder = useRef<HTMLDetailsElement>(null)
  const ready = work.status === 'ready' && ledger.status === 'ready'
  const today = shanghaiDay(new Date().toISOString())
  const companies = useMemo(() => companyResults(leads, ledger.status === 'ready' ? ledger.sends : [], work.status === 'ready' ? work.records : {}, today), [leads, ledger.sends, ledger.status, work.records, work.status, today])
  const filtered = companies.filter(company => (product === 'all' || company.productIds.includes(product as PublicLead['productId'])) && (country === 'all' || company.lead.country === country) && (batch === 'all' || company.batch === batch))
  const counts = countResults(filtered), groups = resultGroups(filtered, dimension)
  const countries = [...new Map(leads.map(lead => [lead.country, lead.countryZh])).entries()].sort((a, b) => a[1].localeCompare(b[1], 'zh-CN'))
  const batches = [...new Set(companies.map(company => company.batch))].sort().reverse()
  const uniqueLeads = [...new Map(leads.map(lead => [outreachCompanyKey(lead), lead])).values()]
  const due = uniqueLeads.filter(lead => followUpDue(work.records[outreachCompanyKey(lead)], today)).sort((a, b) => work.records[outreachCompanyKey(a)].followUpOn.localeCompare(work.records[outreachCompanyKey(b)].followUpOn))
  const insights = evidenceGroups(filtered, insightDimension)
  const selectedLead = uniqueLeads.find(lead => outreachCompanyKey(lead) === selected)
  const planSignature = JSON.stringify(work.records[selected] ?? null)
  useEffect(() => { if (!planDirty) { const record = work.records[selected]; setPlanStep(record?.nextStep ?? ''); setPlanDate(record?.followUpOn ?? '') } }, [planSignature, selected, planDirty])
  const choices = uniqueLeads.filter(lead => outreachCompanyKey(lead) === selected || `${lead.company} ${lead.countryZh}`.toLowerCase().includes(query.toLowerCase()))
  const chooseCompany = (key: string) => { setSelected(key); setPlanDirty(false); const record = work.records[key] ?? emptyWorkRecord(key); setPlanStep(record.nextStep ?? ''); setPlanDate(record.followUpOn); setPlanMessage('') }
  const savePlan = async () => {
    if (!selectedLead) return
    setPlanSaving(true); setPlanMessage('')
    try { await work.save(selectedLead, { nextStep: planStep.trim(), followUpOn: planDate }); setPlanDirty(false); setPlanMessage('跟进计划已保存。') }
    catch (error) { setPlanMessage(error instanceof Error ? error.message : '保存失败。') }
    finally { setPlanSaving(false) }
  }
  const openRecorder = (key?: string) => { if (key) chooseCompany(key); if (recorder.current) { recorder.current.open = true; recorder.current.scrollIntoView({ behavior: 'smooth', block: 'start' }) } }
  const refresh = async () => {
    if (refreshing) return
    setRefreshing(true); setRefreshError('')
    try { await Promise.all([ledger.refresh(), work.refresh()]) }
    catch { setRefreshError('刷新失败，请重试。') }
    finally { setRefreshing(false) }
  }
  return <section className="outreach-results" aria-label="开发结果">
    <div className="result-heading"><div><h2>开发结果</h2><p>看实际联系与后续进展，找到值得继续投入的方向。</p></div><div className="result-actions"><button className="secondary-button" disabled={refreshing} onClick={() => void refresh()}><RefreshCw size={15} />{refreshing ? '刷新中…' : '刷新记录'}</button><button className="primary-button" disabled={work.status !== 'ready'} onClick={() => openRecorder()}><Plus size={16} />记录结果</button></div></div>
    <p className="result-scope">共享邮件发送台账 + 当前账号的渠道联系、结果记录。统计范围为当前公开客户库；同事的私人跟进不可见。</p>
    {work.status !== 'ready' && <PrivateWorkNotice work={work} />}
    {ledger.status !== 'ready' && <p className="result-unavailable" role="status">{ledger.status === 'error' ? `发送记录读取失败：${ledger.error ?? '请重试'}` : ledger.status === 'loading' ? '正在读取共享发送记录…' : '共享发送记录未连接，请先登录并连接记录。'}统计暂不可用。</p>}
    {refreshError && <p role="alert">{refreshError}</p>}
    {work.status === 'ready' && <section className="result-today" aria-label="今日跟进清单"><h3>今日跟进清单 <small>{today} · 含逾期</small></h3><p>按计划日期排列，暂停、拒绝、不适合的客户暂不列入。<button className="secondary-button" onClick={() => openRecorder()}>安排下一步</button></p>
      {due.length ? <ul>{due.map(lead => { const record = work.records[outreachCompanyKey(lead)]; return <li key={outreachCompanyKey(lead)}><div><strong>{lead.company}</strong><small>{record.followUpOn < today ? '逾期' : '今天'} · {record.followUpOn} · {developmentProgressLabels[effectiveStage(lead, work.records, ledger.status === 'ready' ? ledger.sends : null)]}</small><p>下一步：{record.nextStep || '待补充具体动作'}</p></div><button className="secondary-button" onClick={() => openRecorder(outreachCompanyKey(lead))}>更新进展／计划</button></li> })}</ul> : <p>暂无到期计划。可选择公司填写下一步与日期。</p>}</section>}
    <div className="result-filters"><label>产品<select aria-label="结果产品" value={product} onChange={event => setProduct(event.target.value)}><option value="all">全部产品</option>{marketProducts.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label><label>地区<select aria-label="结果地区" value={country} onChange={event => setCountry(event.target.value)}><option value="all">全部国家／地区</option>{countries.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>联系批次<select aria-label="结果联系批次" disabled={!ready} value={batch} onChange={event => setBatch(event.target.value)}><option value="all">全部联系批次</option>{batches.map(value => <option key={value} value={value}>{value === 'unknown' ? '首次联系日期待补' : `${value} 首次联系`}</option>)}</select></label>{(product !== 'all' || country !== 'all' || batch !== 'all') && <button onClick={() => { setProduct('all'); setCountry('all'); setBatch('all') }}>清除筛选</button>}</div>
    <dl className="result-metrics">{kinds.map(kind => <div key={kind} data-result-kind={kind}><dt>{resultLabels[kind]}</dt><dd>{ready ? counts[kind] : '—'}<small> 家</small></dd></div>)}</dl>
    {ready && <><section className="result-insights"><h3>用真实反馈选择研究方向</h3><div className="result-dimensions" role="group" aria-label="反馈比较维度"><button aria-pressed={insightDimension === 'application'} onClick={() => setInsightDimension('application')}>按实际应用</button><button aria-pressed={insightDimension === 'pitch'} onClick={() => setInsightDimension('pitch')}>按材料功能表达</button></div>
      <p>仅比较结果记录中明确填写的应用／表达；按技术沟通公司数、样品评估公司数排列，供下一轮研究参考。排序不代表采购概率或表达效果的因果关系。</p>
      {insights.length ? <div className="result-table-scroll"><table className="result-comparison"><thead><tr><th>{insightDimension === 'application' ? '实际应用' : '实际使用的材料功能表达'}</th><th>有归属记录公司</th><th>有效回复</th><th>技术沟通</th><th>样品评估</th><th>测试反馈</th><th>订单</th><th>可核对回复比例</th></tr></thead><tbody>{insights.map(row => <tr key={row.label}><th>{row.label}</th><td>{row.companies}</td><td>{row.counts.replied}</td><td>{row.counts.technical}</td><td>{row.counts.sample}</td><td>{row.counts.feedback}</td><td>{row.counts.ordered}</td><td>{row.replyRate === null ? '—' : `${row.replies}/${row.contacted} (${row.replyRate}%)`}{row.contacted < 10 && <small> · 样本不足</small>}</td></tr>)}</tbody></table></div> : <p>尚无明确归属的反馈记录。记录真实进展时填写实际应用或功能表达后，会在这里积累。</p>}
      <p>回复比例分母仅为同一归属下手动记录“已联系”的公司，分子为其中也记录有效回复的公司。历史邮件未标注应用／表达，不自动纳入分母。小样本、联系时间与客户选择均会影响比较。</p></section><div className="result-comparison-heading"><h3>方向比较</h3><div className="result-dimensions" role="group" aria-label="结果比较维度">{([['product', '按产品'], ['country', '按地区'], ['batch', '按联系批次']] as const).map(([id, label]) => <button key={id} aria-pressed={dimension === id} onClick={() => setDimension(id)}>{label}</button>)}</div></div>
      {groups.length ? <div className="result-table-scroll"><table className="result-comparison"><thead><tr><th scope="col">{dimension === 'product' ? '产品客户方向' : dimension === 'country' ? '国家／地区' : '首次联系批次'}</th>{kinds.map(kind => <th scope="col" key={kind}>{resultLabels[kind]}</th>)}</tr></thead><tbody>{groups.map(group => <tr key={group.key}><th scope="row">{dimension === 'product' ? marketProducts.find(item => item.id === group.key)?.name ?? group.key : group.key === 'unknown' ? '首次联系日期待补' : group.key}</th>{kinds.map(kind => <td key={kind}>{group.counts[kind]}</td>)}</tr>)}</tbody></table></div> : <p className="result-empty">当前范围暂无实际联系或结果记录。实际联系后确认发送，或点击“记录结果”补充记录。</p>}
      <details className="result-company-details"><summary>查看统计中的公司（{filtered.length} 家）</summary><ul>{filtered.map(company => <li key={company.key}><div><strong>{company.lead.company}</strong><small>{company.lead.countryZh} · {company.firstContact ? `首次记录联系 ${company.firstContact}` : '首次联系日期待补'}</small><span>{kinds.filter(kind => company[kind]).map(kind => resultLabels[kind]).join(' · ')}</span></div><button type="button" onClick={() => openRecorder(company.key)}>查看／记录结果</button></li>)}</ul></details>
    </>}
    <details className="result-recording" ref={recorder}><summary>记录与查看实际结果</summary><p>结果仅当前账号可见。同公司跨产品共用；不会改写邮件发送台账或自动联系客户。</p><label>查找公司<input aria-label="结果查找公司" value={query} onChange={event => setQuery(event.target.value)} placeholder="输入公司或国家" /></label><label>选择公司<select aria-label="结果记录公司" value={selectedLead ? selected : ''} onChange={event => chooseCompany(event.target.value)}><option value="">请选择公司</option>{choices.map(lead => <option value={outreachCompanyKey(lead)} key={outreachCompanyKey(lead)}>{lead.company} · {lead.countryZh}</option>)}</select></label>
      {selectedLead && work.status === 'ready' && <div key={`${work.ownerId}:${selected}`}><form className="result-plan" onSubmit={event => { event.preventDefault(); void savePlan() }}><fieldset disabled={work.busy || planSaving}><legend>当前跟进计划</legend><label>下一步<input required maxLength={500} value={planStep} onChange={event => { setPlanStep(event.target.value); setPlanDirty(true) }} /></label><label>下次跟进日期<input type="date" value={planDate} onChange={event => { setPlanDate(event.target.value); setPlanDirty(true) }} /></label><button className="primary-button">保存跟进计划</button></fieldset>{planMessage && <p role="status">{planMessage}</p>}</form>{planDirty ? <p>请先保存当前跟进计划，再记录业务进展。</p> : <ResultRecordPanel key={`${work.ownerId}:${selected}`} lead={selectedLead} work={work} />}</div>}{work.status !== 'ready' && <p>登录并连接私人记录后可记录结果。</p>}
    </details>
    <details className="result-method"><summary>统计口径</summary><p>按公司去重，每个结果独立计数，不自动补齐前序阶段；0 表示未查到相应记录，不等于没有发生。仅统计有效且不晚于今天的记录，撤销记录不参与统计。</p><p>“已联系”来自实际邮件发送、渠道联系或手动补录的实际联系；复制、下载与打开联系入口均不算联系。回复、技术沟通、实际寄样、开始样品评估、测试反馈、报价和订单须在此记录真实日期及依据；旧“已回复”“样品沟通”进度不会自动转换。</p><p>联系批次按首次已记录联系的月份划分；缺少联系日期的结果归入“日期待补”。比较的是该联系批次截至当前的累计结果，结果发生时间不限于该月。近期批次观察时间较短，请结合实际跟进判断。</p><p>产品分组代表公开客户的产品方向，同公司可能出现在多个产品组，组间不可相加；公司级结果不代表该产品已经获得回复、通过评估或确认采购。</p></details>
  </section>
}
