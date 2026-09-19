import { useEffect, useMemo, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import {
  Archive, ArrowUpRight, BookOpen, CheckCircle2, ChevronRight, CircleAlert, Clipboard,
  FileUp, Globe2, GraduationCap, LayoutDashboard, Menu, Moon, PanelLeftClose, Plus,
  Search, Send, Settings, Sparkles, Sun, X,
} from 'lucide-react'
import { articles, practiceTopics, products } from './lib/demoData'
import { apiBaseUrl, hasSupabaseConfig, supabase } from './lib/supabase'
import { proxyRequest } from './lib/api'
import { insufficientEvidenceReply, type ReplyTone } from './lib/qa'
import { addCatalogSource, ensureInitialProducts, enqueueIngestion, enqueueSourceValidation, listArticleSummaries, listArticles, listProducts, listSources, setSourceEnabled, sourceCatalog, uploadDocument, type WorkspaceArticle, type WorkspaceProduct, type WorkspaceSource } from './lib/workspace'
import type { ProductSummary } from './lib/types'
import { MarketIntelligence } from './features/market/MarketIntelligence'

type Page = 'dashboard' | 'products' | 'intelligence' | 'market-intelligence' | 'practice' | 'assistant' | 'studio' | 'settings'
type Draft = { title: string; body: string; translation: string; productName: string; savedAt: string }
const marketIntelligenceEnabled = import.meta.env.VITE_FEATURE_MARKET_INTELLIGENCE !== 'false'

const navigation: Array<{ id: Page; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'dashboard', label: '今日工作台', icon: LayoutDashboard },
  { id: 'products', label: '产品知识库', icon: BookOpen },
  { id: 'intelligence', label: '行业情报', icon: Globe2 },
  { id: 'market-intelligence', label: '市场情报', icon: Globe2 },
  { id: 'practice', label: '外贸实务', icon: GraduationCap },
  { id: 'assistant', label: '资料问答', icon: Sparkles },
  { id: 'studio', label: '内容工作室', icon: Clipboard },
]

function getPage(): Page {
  const requested = window.location.hash.replace(/^#\/?/, '').split('/')[0] as Page
  return (requested !== 'market-intelligence' || marketIntelligenceEnabled) && (navigation.some((item) => item.id === requested) || requested === 'settings') ? requested : 'dashboard'
}

function StatusPill({ status }: { status: string }) {
  const approved = status === '已确认' || status === 'approved'
  return <span className={`status ${approved ? 'approved' : 'review'}`}>{approved ? '已确认' : status}</span>
}

function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="empty-state"><Archive size={28} /><strong>{title}</strong><span>{description}</span>{action}</div>
}

export function App() {
  const [page, setPage] = useState<Page>(getPage)
  const [dark, setDark] = useState(() => localStorage.getItem('nl-theme') === 'dark')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState(products[0].id)
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    const onHashChange = () => setPage(getPage())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; localStorage.setItem('nl-theme', dark ? 'dark' : 'light') }, [dark])

  const navigate = (target: Page) => { window.location.hash = target; setSidebarOpen(false) }
  const selectedProduct = products.find((item) => item.id === selectedProductId) ?? products[0]
  const results = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return []
    return products.filter((product) => [product.name, product.englishName, product.grade, product.category, ...product.keywords].filter(Boolean).join(' ').toLowerCase().includes(q))
  }, [search])

  return <div className="app-shell">
    <aside className={`sidebar ${sidebarOpen ? 'is-open' : ''}`} aria-label="主导航">
      <div className="brand"><div className="brand-mark">NL</div><div><strong>阳光心材料</strong><span>知识工作台</span></div><button className="icon-button mobile-only" onClick={() => setSidebarOpen(false)} aria-label="关闭导航"><X size={18} /></button></div>
      <nav>{navigation.filter((item) => item.id !== 'market-intelligence' || marketIntelligenceEnabled).map(({ id, label, icon: Icon }) => <button key={id} className={page === id ? 'nav-item active' : 'nav-item'} onClick={() => navigate(id)}><Icon size={18} />{label}</button>)}</nav>
      <div className="sidebar-footer"><div className="setup-card"><span>当前模式</span><strong>{hasSupabaseConfig ? '已连接 Supabase' : '本地预览'}</strong><p>{hasSupabaseConfig ? '请先登录以读取你的私人数据。' : '尚未连接数据库；示例资料不会上传。'}</p><button onClick={() => navigate('settings')}>查看配置 <ChevronRight size={14} /></button></div><button className="nav-item" onClick={() => navigate('settings')}><Settings size={18} />资料与设置</button></div>
    </aside>
    {sidebarOpen && <button className="scrim" aria-label="关闭导航遮罩" onClick={() => setSidebarOpen(false)} />}

    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="打开导航"><Menu size={20} /></button><button className="search-box" onClick={() => setSearchOpen(true)}><Search size={17} /><span>搜索产品、参数、CAS 或术语</span><kbd>⌘ K</kbd></button></div><div className="topbar-actions"><button className="icon-button" onClick={() => setDark(!dark)} aria-label="切换深色模式">{dark ? <Sun size={18} /> : <Moon size={18} />}</button><button className="avatar" onClick={() => navigate('settings')} aria-label="打开设置">NL</button></div></header>
      {!hasSupabaseConfig && <div className="preview-banner"><CircleAlert size={17} /><span><strong>本地预览模式：</strong>首批资料均待上传，所有“待确认”内容不能用于对外承诺。</span><button onClick={() => navigate('settings')}>完成连接</button></div>}
      <section className="page-content">
        {page === 'dashboard' && <Dashboard onNavigate={navigate} onSelectProduct={(id) => { setSelectedProductId(id); navigate('products') }} />}
        {page === 'products' && <ProductLibrary selected={selectedProduct} onSelect={setSelectedProductId} onNotice={setNotice} />}
        {page === 'intelligence' && <Intelligence />}
        {page === 'market-intelligence' && marketIntelligenceEnabled && <MarketIntelligence />}
        {page === 'practice' && <Practice />}
        {page === 'assistant' && <Assistant product={selectedProduct} />}
        {page === 'studio' && <Studio product={selectedProduct} />}
        {page === 'settings' && <SettingsPage onNotice={setNotice} />}
      </section>
    </main>
    {searchOpen && <SearchDialog value={search} results={results} onChange={setSearch} onClose={() => setSearchOpen(false)} onSelect={(id) => { setSelectedProductId(id); setSearchOpen(false); navigate('products') }} />}
    {notice && <div className="toast" role="status"><CheckCircle2 size={18} />{notice}<button onClick={() => setNotice(null)} aria-label="关闭提示"><X size={16} /></button></div>}
  </div>
}

function Dashboard({ onNavigate, onSelectProduct }: { onNavigate: (page: Page) => void; onSelectProduct: (id: string) => void }) {
  return <><div className="page-heading"><div><p className="eyebrow">Asia/Shanghai · {new Intl.DateTimeFormat('zh-CN', { dateStyle: 'full' }).format(new Date())}</p><h1>今天，先把一件事弄清楚。</h1><p>从可核对的产品资料开始，再去理解行业与客户问题。</p></div><button className="primary-button" onClick={() => onNavigate('assistant')}><Sparkles size={17} />问一个客户问题</button></div>
    <div className="metric-grid"><Metric value="0" label="今日新增资讯" hint="尚未配置采集来源" /><Metric value="3" label="待上传原文件" hint="导入后才可建立引用" /><Metric value="8" label="待确认事项" hint="先向工厂核对再对外使用" /></div>
    <div className="content-grid"><section className="card span-2"><div className="card-heading"><div><p className="eyebrow">今日精选</p><h2>暂无重要更新</h2></div><button className="text-button" onClick={() => onNavigate('intelligence')}>查看行业情报 <ChevronRight size={16} /></button></div><EmptyState title="等你启用来源" description="正式采集完成后，这里只显示有原始链接、发布日期和中文摘要的内容。" action={<button className="secondary-button" onClick={() => onNavigate('settings')}>管理来源</button>} /></section>
      <section className="card"><div className="card-heading"><div><p className="eyebrow">今日学习</p><h2>从 PP 附着力开始</h2></div><BookOpen size={19} /></div><p className="muted">学习“低表面能基材”与 “water-based adhesion promoter” 的关系。</p><button className="text-button" onClick={() => onSelectProduct('nl-w1201')}>打开 NL-W1201 专题 <ChevronRight size={16} /></button></section>
      <section className="card span-2"><div className="card-heading"><div><p className="eyebrow">工厂待确认</p><h2>先问清楚，再写进邮件</h2></div><button className="text-button" onClick={() => onNavigate('products')}>查看全部</button></div><div className="task-list">{products.flatMap((product) => product.reviewTasks.slice(0, 1).map((task) => <div className="task" key={product.id}><span className="task-dot" /><div><strong>{product.name}</strong><p>{task}</p></div><StatusPill status="待确认" /></div>))}</div></section>
      <section className="card"><div className="card-heading"><div><p className="eyebrow">下一步</p><h2>完成首次设置</h2></div></div><ol className="step-list"><li><span>1</span>连接 Supabase</li><li><span>2</span>上传三份原始资料</li><li><span>3</span>验证至少三个来源</li></ol><button className="primary-button full-width" onClick={() => onNavigate('settings')}>开始设置</button></section>
    </div></>
}

function Metric({ value, label, hint }: { value: string; label: string; hint: string }) { return <div className="metric"><strong>{value}</strong><span>{label}</span><small>{hint}</small></div> }

function ProductLibrary({ selected, onSelect, onNotice }: { selected: ProductSummary; onSelect: (id: string) => void; onNotice: (message: string) => void }) {
  const uploader = useRef<HTMLInputElement>(null)
  return <><div className="page-heading"><div><p className="eyebrow">产品知识库</p><h1>每个参数，都能回到原文。</h1><p>目前显示的是待原始文件核对的初始化清单。</p></div><button className="primary-button" onClick={() => uploader.current?.click()}><FileUp size={17} />上传 TDS / DOCX</button><input ref={uploader} hidden type="file" accept=".pdf,.docx" onChange={(event) => { const file = event.target.files?.[0]; if (file) onNotice(`已选择“${file.name}”。请先完成 Supabase 配置，文件会直传到私人存储后再解析。`); event.currentTarget.value = '' }} /></div>
    <div className="library-layout"><aside className="product-list"><div className="filter-label">3 个待整理产品</div>{products.map((product) => <button key={product.id} className={selected.id === product.id ? 'product-item selected' : 'product-item'} onClick={() => onSelect(product.id)}><span className="product-icon">{product.name.slice(0, 1)}</span><span><strong>{product.name}</strong><small>{product.category}</small></span><StatusPill status={product.status} /></button>)}</aside>
      <article className="product-detail"><div className="detail-title"><div><div className="title-row"><h2>{selected.name}</h2><StatusPill status={selected.status} /></div><p>{selected.englishName} {selected.grade ? `· ${selected.grade}` : '· 牌号待填写'}</p></div><button className="secondary-button" onClick={() => onNotice('本地预览不创建正式笔记。连接 Supabase 后，笔记会按当前登录账户保存。')}>添加笔记</button></div>
        <div className="callout warning"><CircleAlert size={18} /><div><strong>资料状态：原始文件待上传</strong><p>{selected.description}</p></div></div>
        <div className="detail-section"><h3>已摘录参数 <span>全部待确认</span></h3><div className="table-wrap"><table><thead><tr><th>字段</th><th>原始值（按摘录保留）</th><th>条件 / 备注</th><th>状态</th></tr></thead><tbody>{selected.specs.map((spec) => <tr key={spec.name}><td>{spec.name}</td><td className="mono">{spec.originalValue}</td><td>{spec.condition || spec.note || '—'}</td><td><StatusPill status="待确认" /></td></tr>)}</tbody></table></div></div>
        <div className="detail-section two-columns"><div><h3>应用与关键词</h3><div className="chip-row">{selected.applications.map((item) => <span className="chip" key={item}>{item}</span>)}</div><p className="keyword-copy">搜索词：{selected.keywords.join(' · ')}</p></div><div><h3>工厂待确认事项</h3><ul className="plain-list">{selected.reviewTasks.map((item) => <li key={item}><CircleAlert size={15} />{item}</li>)}</ul></div></div>
        <div className="evidence-box"><BookOpen size={20} /><div><strong>引用与版本</strong><p>尚无可点击的原文，因为原始 TDS/DOCX 尚未放入工作区。上传后会保存文件版本、页码/段落、短摘录和确认记录。</p></div></div>
      </article></div></>
}

function Intelligence() {
  const [actual, setActual] = useState<WorkspaceArticle[]>([])
  const [summaries, setSummaries] = useState<Record<string, { summary_zh: string; business_meaning: string | null }>>({})
  const [loaded, setLoaded] = useState(false)
  const refresh = async () => { if (!supabase) return; const { data } = await supabase.auth.getUser(); if (!data.user) return; try { const rows = await listArticles(); const summaryRows = await listArticleSummaries(rows.map((row) => row.id)); setActual(rows); setSummaries(Object.fromEntries(summaryRows.map((row) => [row.article_id, row]))); setLoaded(true) } catch { setLoaded(true) } }
  useEffect(() => { void refresh() }, [])
  return <><div className="page-heading"><div><p className="eyebrow">行业情报</p><h1>资讯要有出处，才值得花时间。</h1><p>{actual.length ? '以下是你的资料库实际入库结果；每条均保留原文链接和访问级别。' : '尚无实际入库文章；候选来源不能视为已采集成功。'}</p></div><button className="primary-button" onClick={() => window.location.hash = 'settings'}><Plus size={17} />管理来源</button></div><div className="filter-bar"><button className="filter active" onClick={() => void refresh()}>刷新</button><button className="filter">技术指南</button><button className="filter">行业资讯</button><button className="filter">规则更新</button></div><div className="article-list">{actual.length ? actual.map((article) => <article className="article-card" key={article.id}><div className="article-meta"><span>{article.kind}</span><span>{article.content_access === 'summary_only' ? '仅摘要' : '公开页面'}</span><span>{article.source_published_text || article.source_published_at || '日期未知'}</span></div><h2>{article.title}</h2><p>{summaries[article.id]?.summary_zh || (article.content_text ? '已提取原文摘要，等待中文摘要配置或生成。' : '来源未提供可处理的正文或摘要，不能生成内容摘要。')}</p>{article.content_text && <details><summary>查看已提取原文摘要</summary><p className="source-excerpt">{article.content_text}</p></details>}<div className="article-footer"><span className="chip">{summaries[article.id] ? '中文摘要已入库' : '尚无中文摘要'}</span><span className="muted">{summaries[article.id]?.business_meaning || '请回到原始来源核对；不得作为自有产品性能。'}</span><a href={article.canonical_url} target="_blank" rel="noreferrer">打开原文 <ArrowUpRight size={15} /></a></div></article>) : articles.map((article) => <article className="article-card" key={article.id}><div className="article-meta"><span>{article.kind}</span><span>{article.source}</span><span>{article.publishedAt}</span></div><h2>{article.title}</h2><p>{article.summary}</p><div className="article-footer"><span className="chip">{article.products.join(' / ')}</span><span className="muted">{article.relevance}</span><a href={article.sourceUrl} target="_blank" rel="noreferrer">打开候选网站 <ArrowUpRight size={15} /></a></div></article>)}</div>{!actual.length && <div className="callout"><CircleAlert size={18} /><div><strong>{loaded ? '尚未完成实际采集' : '正在读取你的资料库'}</strong><p>先在“资料与设置”添加来源、验证端点、启用来源并运行 worker；官网主页和 HTTP 200 都不是完成标准。</p></div></div>}</> }

function Practice() { const [selected, setSelected] = useState(0); const [learned, setLearned] = useState(false); return <><div className="page-heading"><div><p className="eyebrow">外贸实务</p><h1>先理解流程，再处理一封邮件。</h1><p>法规、运输、税务等内容在接入前均需标明地区、来源与最后核验日期。</p></div></div><div className="practice-layout"><aside className="practice-nav">{practiceTopics.map(([name], index) => <button key={name} onClick={() => { setSelected(index); setLearned(false) }} className={selected === index ? 'active' : ''}>{name}<ChevronRight size={16} /></button>)}</aside><article className="lesson-card"><p className="eyebrow">入门学习 · 待补充经核对来源</p><h2>{practiceTopics[selected][0]}</h2><p>{practiceTopics[selected][1]}</p><div className="lesson-note"><strong>学习提示</strong><p>先把事实和未知项分开记录。涉及目的国规则、HS 编码、危险品属性时，请回到主管机构、物流商或具备资质的顾问确认。</p></div><button className={learned ? 'secondary-button' : 'primary-button'} onClick={() => setLearned(!learned)}>{learned ? <><CheckCircle2 size={17} />已标记完成</> : '标记本节已学习'}</button></article></div></> }

function Assistant({ product }: { product: ProductSummary }) {
  const [question, setQuestion] = useState('')
  const [tone, setTone] = useState<ReplyTone>('商务邮件')
  const [answer, setAnswer] = useState<string | null>(null)
  const ask = async () => {
    if (!question.trim()) return
    if (!supabase || !apiBaseUrl()) { setAnswer(insufficientEvidenceReply(product, tone)); return }
    try {
      const { data } = await supabase.auth.getUser()
      if (!data.user) throw new Error('请先登录后再调用真实资料问答。')
      const databaseProduct = (await listProducts()).find((item) => item.import_key === product.id)
      if (!databaseProduct) throw new Error('产品目录尚未初始化。请在“资料与设置”登录并完成初始化。')
      const response = await proxyRequest<{ customer_intent?: string; explanation_zh?: string; known_information?: string[]; missing_information?: string[]; english_draft?: string; translation_zh?: string; citations?: Array<{ source_id: string; page?: number; section?: string; locator?: string }> }>('/knowledge/ask', { question, product_ids: [databaseProduct.id], allow_web: false })
      setAnswer(`客户意图：${response.customer_intent || '请核对以下资料。'}\n\n中文解释：${response.explanation_zh || '—'}\n\n已知信息：\n${(response.known_information || []).map((item) => `- ${item}`).join('\n') || '- —'}\n\n缺失信息：\n${(response.missing_information || []).map((item) => `- ${item}`).join('\n') || '- —'}\n\n英文草稿：\n${response.english_draft || '—'}\n\n中文对照：\n${response.translation_zh || '—'}\n\n引用：\n${(response.citations || []).map((item) => `- ${item.source_id}${item.page ? `，第 ${item.page} 页` : ''}${item.section ? `，${item.section}` : ''}${item.locator ? `，${item.locator}` : ''}`).join('\n') || '- 无有效引用，结果不应对外使用。'}`)
    } catch (error) { setAnswer(`未生成正式问答：${error instanceof Error ? error.message : '未知错误'}\n\n请检查 AI/代理配置、登录状态和已解析的产品资料。`) }
  }
  return <><div className="page-heading"><div><p className="eyebrow">资料问答 · 当前产品：{product.name}</p><h1>不确定，就坦诚地问清楚。</h1><p>默认只检索你可访问的知识库；未找到证据时不会编造答案。</p></div></div><div className="assistant-layout"><section className="ask-card"><label htmlFor="question">客户问题（可输入中文或粘贴英文）</label><textarea id="question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="例如：Can this be used on untreated PP?" rows={7} /><div className="ask-options"><label>回复形式<select value={tone} onChange={(event) => setTone(event.target.value as ReplyTone)}><option>商务邮件</option><option>简短即时消息</option><option>解释简单一点</option></select></label><label className="checkbox"><input type="checkbox" disabled />联网补充 <small>配置后可用</small></label></div><button className="primary-button" onClick={ask}><Send size={17} />基于当前资料整理回答</button></section><section className="answer-card">{answer ? <><div className="card-heading"><div><p className="eyebrow">回答草稿</p><h2>证据不足时的安全回复</h2></div><button className="text-button" onClick={() => navigator.clipboard.writeText(answer)}>复制纯文本</button></div><pre>{answer}</pre></> : <EmptyState title="输入一个真实问题" description="结果会列出已知、缺失信息、英文草稿及引用；没有证据时会明确提示资料不足。" />}</section></div></> }

function Studio({ product }: { product: ProductSummary }) {
  const [topic, setTopic] = useState('')
  const [created, setCreated] = useState<Draft | null>(null)
  const [message, setMessage] = useState('')
  const generate = async () => { if (!topic.trim()) return; if (!supabase || !apiBaseUrl()) return setMessage('尚未配置真实 AI 代理，不能生成或保存正式草稿。'); try { const { data } = await supabase.auth.getUser(); if (!data.user) throw new Error('请先登录。'); const databaseProduct = (await listProducts()).find((item) => item.import_key === product.id); if (!databaseProduct) throw new Error('产品目录尚未初始化。'); const response = await proxyRequest<{ title: string; body: string; translation_zh: string }>('/drafts/generate', { product_id: databaseProduct.id, topic, article_ids: [] }); setCreated({ title: response.title, body: response.body, translation: response.translation_zh, productName: product.name, savedAt: new Date().toISOString() }); setMessage('草稿只使用已批准声明生成；请核对引用后再保存或发布。') } catch (error) { setMessage(`未生成草稿：${error instanceof Error ? error.message : '未知错误'}`) } }
  const save = async () => { if (!created || !supabase) return; try { const { data } = await supabase.auth.getUser(); const databaseProduct = (await listProducts()).find((item) => item.import_key === product.id); if (!data.user || !databaseProduct) throw new Error('请重新登录并初始化产品目录。'); const { error } = await supabase.from('drafts').insert({ owner_id: data.user.id, product_id: databaseProduct.id, title: created.title, body: created.body, translation_zh: created.translation, citations: [], status: 'needs_review' }); if (error) throw error; setMessage('草稿已保存到你的私人资料库，状态为“待复核”，不会自动发布。') } catch (error) { setMessage(`保存未完成：${error instanceof Error ? error.message : '未知错误'}`) } }
  return <><div className="page-heading"><div><p className="eyebrow">内容工作室</p><h1>先有依据，再写得漂亮。</h1><p>只有已批准、可对外使用且带引用的产品声明才能生成正式草稿。</p></div></div><div className="studio-layout"><section className="ask-card"><label htmlFor="topic">主题 / 客户应用</label><input id="topic" value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="例如：PP 水性涂层前的表面处理沟通" /><label>内容类型<select><option>英文产品介绍</option><option>客户 FAQ</option><option>英文行业新闻</option><option>中文公众号内容</option></select></label><label>目标客户<select><option>技术采购人员</option><option>配方工程师</option><option>经销商</option></select></label><button className="primary-button" onClick={() => void generate()}><Sparkles size={17} />基于已批准声明生成</button>{message && <p className="form-message">{message}</p>}</section><section className="answer-card">{created ? <><div className="card-heading"><div><p className="eyebrow">草稿预览</p><h2>{created.title}</h2></div><button className="text-button" onClick={() => navigator.clipboard.writeText(`${created.title}\n\n${created.body}`)}>复制纯文本</button></div><p className="draft-body">{created.body}</p><div className="translation"><strong>中文对照</strong><p>{created.translation}</p></div><div className="draft-actions"><button className="primary-button" onClick={() => void save()}>保存为待复核草稿</button><span>保存不会自动发布。</span></div></> : <EmptyState title="填好主题后生成草稿" description="需要 AI 代理和至少一条已批准声明；无证据时系统会拒绝生成，而不是补写内容。" />}</section></div></> }

function SettingsPage({ onNotice }: { onNotice: (message: string) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [workspaceProducts, setWorkspaceProducts] = useState<WorkspaceProduct[]>([])
  useEffect(() => {
    const db = supabase
    if (!db) return
    const load = async () => { const { data } = await db.auth.getUser(); setUser(data.user) }
    void load()
    const { data: listener } = db.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => listener.subscription.unsubscribe()
  }, [])
  useEffect(() => {
    if (!user) { setWorkspaceProducts([]); return }
    void ensureInitialProducts(user).then(setWorkspaceProducts).catch((error: Error) => onNotice(`无法初始化产品目录：${error.message}`))
  }, [user, onNotice])
  const signIn = async () => { if (!supabase) return onNotice('请先在 .env 中填写 Supabase URL 与 publishable key，然后重启前端。'); const { error } = await supabase.auth.signInWithPassword({ email, password }); onNotice(error ? `登录未完成：${error.message}` : '登录成功，正在加载你的私人数据。') }
  return <><div className="page-heading"><div><p className="eyebrow">资料与设置</p><h1>先连接，再把资料放进来。</h1><p>密钥不在浏览器中编辑或显示；这里只显示连接是否完成。</p></div></div><div className="settings-grid"><section className="card"><div className="card-heading"><div><p className="eyebrow">1 · 身份与数据库</p><h2>{hasSupabaseConfig ? (user ? '已登录私人资料库' : 'Supabase 已配置，等待登录') : '等待连接 Supabase'}</h2></div><StatusPill status={user ? '已确认' : '待配置'} /></div><p className="muted">{hasSupabaseConfig ? '使用你的登录账户访问 RLS 保护的数据。' : '复制 .env.example 为 .env，填写公开 URL 与 publishable key；再按 README 应用迁移。'}</p>{hasSupabaseConfig && !user && <div className="login-form"><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="登录邮箱" /><input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="密码" /><button className="primary-button" onClick={signIn}>登录</button></div>}{user && <button className="secondary-button" onClick={() => supabase?.auth.signOut()}>退出当前账户</button>}</section>{user ? <DocumentImporter user={user} products={workspaceProducts} onNotice={onNotice} /> : <section className="card"><div className="card-heading"><div><p className="eyebrow">2 · 私有文件</p><h2>登录后上传三份原始资料</h2></div><FileUp size={19} /></div><p className="muted">登录后，文件会直接上传到你的私有 Storage，系统才会创建版本和解析任务。</p></section>}{user ? <SourceManager user={user} onNotice={onNotice} /> : <section className="card"><div className="card-heading"><div><p className="eyebrow">3 · 来源与采集</p><h2>登录后管理来源</h2></div><Globe2 size={19} /></div><p className="muted">来源验证和采集任务均绑定当前账户，未登录时不能创建。</p></section>}<section className="card"><div className="card-heading"><div><p className="eyebrow">安全状态</p><h2>公开构建不含私有资料</h2></div><CheckCircle2 size={19} /></div><p className="muted">原始附件走 Supabase 私有 Storage；服务密钥、AI key 和搜索 key 仅放服务器或 Actions Secrets。</p><a className="text-button" href="https://supabase.com/docs/guides/database/postgres/row-level-security" target="_blank" rel="noreferrer">了解 RLS <ArrowUpRight size={15} /></a></section></div></> }

function DocumentImporter({ user, products, onNotice }: { user: User; products: WorkspaceProduct[]; onNotice: (message: string) => void }) {
  const [productId, setProductId] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (!productId && products[0]) setProductId(products[0].id) }, [productId, products])
  const choose = async (file: File | undefined) => { if (!file || !productId) return; setBusy(true); try { const result = await uploadDocument(user, productId, file); onNotice(result.jobId ? `已上传并创建解析任务 ${result.jobId.slice(0, 8)}…；worker 完成后会显示原文定位与待确认字段。` : '检测到同一文件，未重复上传。') } catch (error) { onNotice(`上传未完成：${error instanceof Error ? error.message : '未知错误'}`) } finally { setBusy(false) } }
  return <section className="card"><div className="card-heading"><div><p className="eyebrow">2 · 私有文件</p><h2>上传并解析原始 TDS / DOCX</h2></div><FileUp size={19} /></div><p className="muted">仅接受 PDF、DOCX 和不超过 20MB 的文件；相同 hash 不会重复创建正式记录。</p><div className="upload-controls"><select value={productId} onChange={(event) => setProductId(event.target.value)} aria-label="选择关联产品">{products.map((product) => <option value={product.id} key={product.id}>{product.name_zh}</option>)}</select><label className="secondary-button file-label"><FileUp size={15} />{busy ? '正在上传…' : '选择原始文件'}<input disabled={busy || !productId} type="file" accept=".pdf,.docx" onChange={(event) => void choose(event.target.files?.[0])} /></label></div></section>
}

function SourceManager({ user, onNotice }: { user: User; onNotice: (message: string) => void }) {
  const [sources, setSources] = useState<WorkspaceSource[]>([])
  const [busy, setBusy] = useState(false)
  const refresh = async () => { try { setSources(await listSources()) } catch (error) { onNotice(`读取来源失败：${error instanceof Error ? error.message : '未知错误'}`) } }
  useEffect(() => { void refresh() }, [])
  const add = async () => { setBusy(true); try { for (const source of sourceCatalog) await addCatalogSource(user, source); await refresh(); onNotice('三个候选来源已写入你的私人来源列表；下一步逐个点击“验证端点”。') } catch (error) { onNotice(`添加来源失败：${error instanceof Error ? error.message : '未知错误'}`) } finally { setBusy(false) } }
  const validate = async (id: string) => { setBusy(true); try { const { job_id } = await enqueueSourceValidation(id); onNotice(`验证任务 ${job_id.slice(0, 8)}… 已排队。请运行 worker 后刷新这里查看实际结果。`) } catch (error) { onNotice(`无法创建验证任务：${error instanceof Error ? error.message : '未知错误'}`) } finally { setBusy(false) } }
  const ingest = async () => { setBusy(true); try { const { job_id } = await enqueueIngestion(); onNotice(`采集任务 ${job_id.slice(0, 8)}… 已排队。worker 完成后在“行业情报”查看真实标题、日期、摘要和链接。`) } catch (error) { onNotice(`无法创建采集任务：${error instanceof Error ? error.message : '未知错误'}`) } finally { setBusy(false) } }
  return <section className="card source-manager"><div className="card-heading"><div><p className="eyebrow">3 · 来源与采集</p><h2>实际来源任务</h2></div><Globe2 size={19} /></div><p className="muted">仅在 worker 成功取到条目后才算来源可用；HTTP 200 本身不是完成。</p>{sources.length === 0 ? <button className="secondary-button" disabled={busy} onClick={() => void add()}><Plus size={15} />添加 3 个已核验候选</button> : <div className="source-list">{sources.map((source) => <div key={source.id} className="source-row"><div><strong>{source.name}</strong><small>{source.adapter} · {source.last_success_at ? `最近成功 ${new Date(source.last_success_at).toLocaleString('zh-CN')}` : source.failure_reason || '尚未成功采集'}</small></div><StatusPill status={source.verification_status === 'verified' ? '已确认' : '待验证'} />{source.verification_status !== 'verified' ? <button className="text-button" disabled={busy} onClick={() => void validate(source.id)}>验证端点</button> : <label className="source-toggle"><input type="checkbox" checked={source.enabled} onChange={(event) => void setSourceEnabled(source.id, event.target.checked).then(refresh)} />启用</label>}</div>)}</div>}<div className="source-actions"><button className="secondary-button" onClick={() => void refresh()}>刷新状态</button><button className="primary-button" disabled={busy || !sources.some((source) => source.enabled && source.verification_status === 'verified')} onClick={() => void ingest()}>运行一次真实采集</button></div></section>
}

function SearchDialog({ value, results, onChange, onClose, onSelect }: { value: string; results: ProductSummary[]; onChange: (value: string) => void; onClose: () => void; onSelect: (id: string) => void }) { useEffect(() => { const input = document.getElementById('global-search'); input?.focus() }, []); return <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}><section className="search-dialog" role="dialog" aria-modal="true" aria-label="全局搜索" onMouseDown={(event) => event.stopPropagation()}><div><Search size={19} /><input id="global-search" value={value} onChange={(event) => onChange(event.target.value)} placeholder="输入产品、英文术语或 CAS" /><button className="icon-button" onClick={onClose}><X size={17} /></button></div>{value ? results.length ? <ul>{results.map((product) => <li key={product.id}><button onClick={() => onSelect(product.id)}><span><strong>{product.name}</strong><small>{product.englishName} · {product.grade || '牌号待填写'}</small></span><ChevronRight size={16} /></button></li>)}</ul> : <p className="search-empty">没有匹配项。连接数据库后可搜索已导入的原文段落和笔记。</p> : <p className="search-empty">可搜索产品名称、英文别名、CAS、应用和关键词。</p>}</section></div> }
