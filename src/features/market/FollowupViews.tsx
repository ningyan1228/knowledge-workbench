import { useContext, useEffect, useRef, useState } from 'react'
import { sortByContactPriority, type FollowupCustomer, type FollowupDocument, type FollowupEvent, type FollowupTask, type Source } from '../../lib/customerFollowup'
import { FollowupMarkdown } from './FollowupMarkdown'
import { followupDisplayLabel, internalFollowupKey } from '../../lib/followupIdentity'
import { FollowupClientLink, FollowupReferenceContext, FollowupText } from './FollowupReferences'

export type FollowupView = 'summary' | 'timeline' | 'tasks' | 'sending' | 'conflicts' | 'domestic' | 'sections' | 'original'
export const followupViews: [FollowupView, string][] = [['summary', '进度总览'], ['timeline', '历史时间线'], ['tasks', '待办'], ['sending', '邮件发送核验'], ['conflicts', '冲突与待确认'], ['domestic', '国内与其他线索'], ['sections', '全部章节'], ['original', '完整原文']]

function SourceButton({ source, onSource }: { source: Source; onSource: (line: number) => void }) {
  return <button type="button" className="followup-text-button" onClick={() => onSource(source.start)}>{source.section} · L{source.start}–{source.end} ↗ 原文</button>
}
function Sources({ sources, onSource }: { sources: Source[]; onSource: (line: number) => void }) {
  return <>{sources.map(s => <section className="followup-source" key={`${s.id}-${s.end}`}>{s.historical && <p className="followup-warning">历史留档：此处状态与建议属于旧版，仅供溯源；当前进度以本版执行档案为准。</p>}<SourceButton source={s} onSource={onSource} /><FollowupMarkdown markdown={s.raw} />{s.relatedSources && <Sources sources={s.relatedSources} onSource={onSource} />}</section>)}</>
}
function EventList({ events, onSource }: { events: FollowupEvent[]; onSource: (line: number) => void }) {
  return <><p className="followup-footnote">事件发生时间按原文保留。排列沿用源记录；“时间待核”的记录未推定先后。录入时间未取得；文件整理日和上传时间见版本栏。历史旧状态不覆盖当前核对字段。</p>{events.map(e => <article className="followup-event" key={e.id}><small><FollowupClientLink id={e.customerId} context={e.source.raw} explicit={e.source.raw.split('\n').at(-1)} /></small><h3>{e.time}</h3>{e.source.historical && <p className="followup-warning">历史留档事件，状态按当时记录；当前结论见本版执行档案。</p>}<p>{e.type} · {e.precision}</p><pre><FollowupText text={e.content} context={e.source.raw} /></pre><SourceButton source={e.source} onSource={onSource} />{e.relatedSources?.map(s => <SourceButton key={s.id} source={s} onSource={onSource} />)}</article>)}{!events.length && <p>未识别到明确日期事件；未定时历史仍完整保留于客户档案及原文。</p>}</>
}
function TaskList({ tasks, onSource }: { tasks: FollowupTask[]; onSource: (line: number) => void }) {
  return <><p className="followup-footnote">邮件处理日期不是下一次计划。旧建议仅作历史参考；没有实际排期或完成依据时不自动安排、不标完成，也不作为客户承诺逾期。</p>{tasks.map(t => <article className="followup-event" key={t.id}><small><FollowupClientLink id={t.customerId} context={t.source.raw} explicit={t.source.raw.split('\n').at(-1)} /></small>{t.source.historical && <p className="followup-warning">历史执行清单，保留原状态；当前行动以本版待办为准。</p>}<h3><FollowupText text={t.action} context={t.source.raw} /></h3><dl><dt>等待对象／负责人</dt><dd>{t.waiting}</dd><dt>日期及性质</dt><dd>{t.dateNature}</dd><dt>原任务状态</dt><dd>{t.status}</dd><dt>完成依据（须取得）</dt><dd>{t.evidence}</dd></dl><SourceButton source={t.source} onSource={onSource} /></article>)}</>
}
function Customer({ row, expanded, toggle, onSource }: { row: FollowupCustomer; expanded: boolean; toggle: () => void; onSource: (line: number) => void }) {
  const [tab, setTab] = useState('current')
  const state = useContext(FollowupReferenceContext)
  const identity = state?.document.identities.find(i => i.id === row.id)
  const label = identity ? followupDisplayLabel(identity, row.product, row.fields[0]?.value) : row.customer + ' · ' + row.product
  const tabs = [['current', '当前字段与联系人'], ['history', '全部历史与补充'], ['timeline', '沟通时间线'], ['tasks', '任务'], ['files', '文件与证据']]
  const all = row.sources.map(s => s.raw).join('\n')
  const filenames = [...new Set(all.match(/[\p{L}\p{N}_()（） .−-]+\.(?:pdf|png|jpg|xlsx?|docx?)/giu) ?? [])]
  return <article className="followup-row" data-customer-id={row.id}>
    <button type="button" className="followup-columns followup-rich-row" onClick={toggle} aria-expanded={expanded} aria-controls={`followup-detail-${row.id}`}>
      <span className="followup-action-date">{row.contactPriorityRank !== null && <><strong>{row.contactPriorityRank} · {row.contactPriority}</strong><small>{row.priorityReason}</small><small>最近邮件处理</small></>}<strong>{row.processingDateLabel}</strong><small>{row.processingActionText}</small><small>日期精度：{row.processingDatePrecision} · 依据见详情</small></span>
      <span className="followup-customer-name"><strong>{label}</strong>{row.customer !== label && <span>{row.customer}</span>}<span>{row.product}</span><small>客户消息：{row.customerTime || '待确认／未取得'}</small><small>我方已发：{row.sentTime || '待确认／未取得'}</small></span>
      <span className="followup-status"><strong>最新进度</strong>{row.progress || '待确认／未取得'}{row.status !== row.progress && <><strong>当前状态</strong>{row.status || '待确认／未取得'}</>}<small>等待：{row.waiting || '待确认'}</small><small>待确认：{row.uncertainty || '按原文核对'}</small></span>
      <span className="followup-next">{row.next || '请查看原文'}<small>{expanded ? '收起详情 ↑' : '展开完整档案 ↓'}</small></span>
    </button>
    {expanded && <section id={`followup-detail-${row.id}`} className="followup-customer-detail"><h2>{label}</h2><nav className="followup-tabs">{tabs.map(([id, title]) => <button type="button" key={id} aria-pressed={tab === id} onClick={() => setTab(id)}>{title}</button>)}</nav>
      {tab === 'current' && <><dl className="followup-fields">{row.fields.filter(f => !/^(编号|客户编号|内部客户键)$/.test(f.label)).map((f, i) => <div key={i}><dt>{f.label}</dt><dd>{/^客户/.test(f.label) ? <FollowupClientLink id={row.id} context={row.product} explicit={label} /> : <FollowupText text={f.value || '待确认／未取得'} context={row.product} />}</dd></div>)}</dl><h3>最近邮件处理日期与依据</h3><p>{row.lastEmailProcessedDate || '待核'} · {row.processingActionText}</p><p>{row.processingSourceText || '本版未单列处理日期依据，不以客户来信或上传日期回填。'}</p>{row.processingSources.map(source => <SourceButton key={source.id} source={source} onSource={onSource} />)}<Sources sources={row.currentFields} onSource={onSource} /><h3>联系人、需求、报价、付款、样品、测试与完整历史</h3><Sources sources={row.sources} onSource={onSource} /></>}
      {tab === 'history' && <Sources sources={row.sources} onSource={onSource} />}
      {tab === 'timeline' && <EventList events={row.events} onSource={onSource} />}
      {tab === 'tasks' && <TaskList tasks={row.tasks} onSource={onSource} />}
      {tab === 'files' && <><p className="followup-warning">下列为源文提及的文件；原件未随本次文件提供。制作、发送、被替代状态以各来源上下文为准。</p>{filenames.map(name => <p key={name}>{name.trim()} · 原件未随本次文件提供</p>)}<Sources sources={row.sources.filter(s => /PI|TDS|SDS|COA|凭证|发票|运单|附件|\.pdf|\.png/i.test(s.raw))} onSource={onSource} /></>}
    </section>}
  </article>
}

function FollowupContentBody({ document, markdown, view, query, expanded, setExpanded, onSource, sourceLine }: { document: FollowupDocument; markdown: string; view: FollowupView; query: string; expanded: string | null; setExpanded: (id: string | null) => void; onSource: (line: number) => void; sourceLine: number | null }) {
  const defaultOrder = document.metadata.default_sort_field === 'contact_priority_rank' ? 'priority' : 'recent'
  const [filter, setFilter] = useState(''), [order, setOrder] = useState(defaultOrder)
  const [raw, setRaw] = useState(false), [copied, setCopied] = useState('')
  useEffect(() => {
    if (view !== 'original' || !sourceLine) return
    setRaw(false)
    const timer = setTimeout(() => window.document.getElementById(`original-L${sourceLine}`)?.scrollIntoView({ block: 'center' }), 100)
    return () => clearTimeout(timer)
  }, [view, sourceLine])
  const filters: [string, RegExp][] = [['待我方处理', /我方/], ['等客户', /客户/], ['等工厂', /工厂|辛工/], ['付款核实', /到账|核.*款/], ['待发送核验', /发送.*核|核.*发送|未核.*发送/], ['测试中', /测试/], ['暂停', /暂停|暂不供货/], ['邮件处理日期待核', /待核/], ['存在冲突', /冲突/]]
  const needle = query.trim().toLowerCase()
  let rows = document.customers.filter(c => JSON.stringify(c).toLowerCase().includes(needle) && (!filter || (filter === '邮件处理日期待核' ? !c.lastEmailProcessedDate : filters.find(([label]) => label === filter)?.[1].test(`${c.waiting} ${c.status} ${c.uncertainty} ${c.dateNature} ${c.actionLabel} ${c.next}`))))
  if (order === 'priority') rows = sortByContactPriority(rows)
  else rows.sort((a, b) => order === 'source' ? a.sourceOrder - b.sourceOrder : a.lastEmailProcessedDate && b.lastEmailProcessedDate ? (order === 'earliest' ? a.lastEmailProcessedDate.localeCompare(b.lastEmailProcessedDate) : b.lastEmailProcessedDate.localeCompare(a.lastEmailProcessedDate)) || a.sourceOrder - b.sourceOrder : a.lastEmailProcessedDate ? -1 : b.lastEmailProcessedDate ? 1 : a.sourceOrder - b.sourceOrder)
  const relevant = (pattern: RegExp) => document.sections.filter(s => pattern.test(s.section))
  if (document.failed) return <><p role="alert">本版本解析失败，仅显示本版原文；当前索引未套用旧版本。</p><textarea className="followup-raw" readOnly value={markdown} aria-label="完整Markdown源文本" /></>
  if (view === 'original') return <><nav className="followup-tabs"><button onClick={() => setRaw(false)} aria-pressed={!raw}>渲染视图</button><button onClick={() => setRaw(true)} aria-pressed={raw}>Markdown源文本</button><button onClick={() => void navigator.clipboard.writeText(markdown).then(() => setCopied('完整源文本已复制')).catch(() => setCopied('复制失败，请在源文本中全选复制'))}>复制完整源文本</button><span role="status">{copied}</span></nav>{raw ? <textarea className="followup-raw" readOnly value={markdown} aria-label="完整Markdown源文本" /> : <FollowupMarkdown markdown={markdown} sourceAnchors />}</>
  if (view === 'summary') return <><div className="followup-list-toolbar"><span>{document.customers.length} 条海外主档 · 国内 {document.domestic.length} 条 · 筛选结果 {rows.length}</span><select aria-label="跟进状态筛选" value={filter} onChange={e => setFilter(e.target.value)}><option value="">全部状态</option>{filters.map(([label]) => <option key={label}>{label}</option>)}</select><label className="followup-order">排序 <select aria-label="跟进排序" value={order} onChange={e => setOrder(e.target.value)}>{defaultOrder === 'priority' && <option value="priority">联系优先级 · 从高到低</option>}<option value="recent">最近邮件处理 · 从近到远</option><option value="earliest">最近邮件处理 · 从早到晚</option><option value="source">源文件行序</option></select></label><button className="followup-text-button" onClick={() => { setFilter(''); setOrder(defaultOrder); setExpanded(null) }}>清除筛选／排序</button></div><div className="followup-list"><div className="followup-columns followup-rich-row followup-column-head"><span>{defaultOrder === 'priority' ? '联系优先级／最近邮件处理' : '最近邮件处理日期'}</span><span>客户／项目／消息时间</span><span>最新进度／状态／等待／待确认</span><span>具体下一步</span></div>{rows.map(row => <Customer key={row.id} row={row} expanded={row.id === expanded} toggle={() => setExpanded(row.id === expanded ? null : row.id)} onSource={onSource} />)}</div></>
  if (view === 'timeline') return <EventList events={document.events.filter(e => JSON.stringify(e).toLowerCase().includes(needle))} onSource={onSource} />
  if (view === 'tasks') return <TaskList tasks={document.tasks.filter(t => JSON.stringify(t).toLowerCase().includes(needle))} onSource={onSource} />
  if (view === 'sending') return <>{defaultOrder === 'priority' && <><h2>本版处理与发送状态</h2>{document.customers.map(c => <article className="followup-event" key={c.id}><FollowupClientLink id={c.id} /><p>最近邮件处理：{c.processingDateLabel} · {c.processingActionText}</p><p>最近已核我方发件：{c.sentTime || '待核'}</p>{c.processingSources.map(s => <SourceButton key={s.id} source={s} onSource={onSource} />)}</article>)}</>}<Sources sources={relevant(/待发送|已确认发送/)} onSource={onSource} /></>
  if (view === 'conflicts') return <Sources sources={relevant(/冲突与待确认|重要变更|新增.*纠正事件/)} onSource={onSource} />
  if (view === 'domestic') return <><h2>国内询盘与未归属记录（不计海外客户）</h2><Sources sources={[...relevant(/国内询盘|国内对接|未归属线索|连续性/), ...document.domestic]} onSource={onSource} /><EventList events={document.events.filter(e => /^D/.test(e.customerId))} onSource={onSource} /></>
  return <><p>全部 {document.sections.length} 个二级章节；{document.coverage.total} 个非空正文块已保留，未保留 {document.coverage.unretained}。不支持的语法按安全文本完整展示。</p>{document.sections.map(s => <details className="followup-source" key={s.id}><summary>{s.section} · L{s.start}–{s.end}</summary><SourceButton source={s} onSource={onSource} /><Sources sources={[s]} onSource={onSource} /></details>)}</>
}

function ReferenceDialog({ document, selected, close, onSource }: { document: FollowupDocument; selected: { id: string; label: string }; close: () => void; onSource: (line: number) => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { const node = ref.current; node?.showModal(); return () => node?.close() }, [])
  useEffect(() => { if (ref.current) ref.current.scrollTop = 0 }, [selected.id, selected.label])
  const customer = document.customers.find(c => c.id === selected.id)
  const domestic = document.domestic.find(s => internalFollowupKey(s.raw) === selected.id || s.raw.startsWith('### ' + selected.id))
  return <dialog ref={ref} className="followup-dialog followup-reference-dialog" aria-label={'客户详情：' + selected.label} data-detail-customer={selected.id} onCancel={event => { event.preventDefault(); close() }}><header><h2>{selected.label}</h2><button aria-label="关闭客户详情" onClick={close}>×</button></header>{customer ? <><h3>当前状态</h3><p>最近邮件处理：{customer.processingDateLabel} · {customer.processingActionText}</p><p>{customer.processingSourceText}</p><p>{customer.progress}</p><p>{customer.status}</p><p>下一步：{customer.next}</p><Sources sources={customer.sources} onSource={line => { close(); onSource(line) }} /><EventList events={customer.events} onSource={line => { close(); onSource(line) }} /><TaskList tasks={customer.tasks} onSource={line => { close(); onSource(line) }} /></> : domestic ? <Sources sources={[domestic]} onSource={line => { close(); onSource(line) }} /> : <p>本版未取得对应独立档案，请查看同版原文；不会据显示名称另建客户。</p>}</dialog>
}

export function FollowupContent(props: Parameters<typeof FollowupContentBody>[0]) {
  const [selected, setSelected] = useState<{ id: string; label: string } | null>(null)
  return <FollowupReferenceContext.Provider value={{ document: props.document, onOpen: (id, label) => setSelected({ id, label }) }}><FollowupContentBody {...props} />{selected && <ReferenceDialog document={props.document} selected={selected} close={() => setSelected(null)} onSource={props.onSource} />}</FollowupReferenceContext.Provider>
}
