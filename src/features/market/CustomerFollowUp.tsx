import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Download, FileText, History, LockKeyhole, RefreshCw, Search, Upload, Users, X } from 'lucide-react'
import { useAccountSession } from '../../lib/accountSession'
import { compareFollowup, parseFollowup } from '../../lib/customerFollowup'
import { followupRequest, type FollowupAccess, type FollowupMembers, type FollowupSnapshot, type FollowupVersions } from '../../lib/followupApi'
import { FollowupMarkdown } from './FollowupMarkdown'
import { FollowupDatePicker } from './FollowupDatePicker'
import { FollowupContent, followupViews, type FollowupView } from './FollowupViews'
import './CustomerFollowUp.css'

function dateTime(value: string) {
  return new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value))
}

function Dialog({ title, onClose, busy, children }: { title: string; onClose: () => void; busy?: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { const node = ref.current; node?.showModal(); return () => node?.close() }, [])
  return <dialog ref={ref} className="followup-dialog" aria-label={title} onCancel={event => { event.preventDefault(); if (!busy) onClose() }}><header><h2>{title}</h2><button type="button" aria-label="关闭" disabled={busy} onClick={onClose}><X size={20} /></button></header>{children}</dialog>
}

type LoadedState = { access: FollowupAccess; index: FollowupVersions; snapshot: FollowupSnapshot | null }

function FollowupWorkspace({ userId }: { userId: string }) {
  const [loaded, setLoaded] = useState<LoadedState | null>(null), [error, setError] = useState(''), [refreshing, setRefreshing] = useState(false)
  const [panel, setPanel] = useState<'upload' | 'history' | 'members' | null>(null), [query, setQuery] = useState(''), [expanded, setExpanded] = useState<string | null>(null)
  const [view, setView] = useState<FollowupView>('summary'), [message, setMessage] = useState('')
  const [sourceLine, setSourceLine] = useState<number | null>(null)
  const selectedId = useRef<string | null>(null), request = useRef(0), abort = useRef<AbortController | null>(null)
  const refresh = useCallback(async (versionId?: string | null) => {
    abort.current?.abort()
    const controller = new AbortController(); abort.current = controller
    const revision = ++request.current
    setRefreshing(true); setError('')
    try {
      const access = await followupRequest<FollowupAccess>(userId, '/access', undefined, controller.signal)
      const index = await followupRequest<FollowupVersions>(userId, '/versions', undefined, controller.signal)
      const chosen = versionId === undefined ? selectedId.current : versionId
      const id = index.versions.some(item => item.id === chosen) ? chosen : index.current_id
      const snapshot = id ? await followupRequest<FollowupSnapshot>(userId, `/versions/${id}`, undefined, controller.signal) : null
      if (revision === request.current) { selectedId.current = snapshot?.id === index.current_id ? null : snapshot?.id ?? null; setLoaded({ access, index, snapshot }) }
    } catch (cause) {
      if (revision === request.current && !controller.signal.aborted) { setLoaded(null); setPanel(null); setError(cause instanceof Error ? cause.message : '暂时无法读取客户跟进。') }
    } finally { if (revision === request.current) setRefreshing(false) }
  }, [userId])
  useEffect(() => {
    void refresh(null)
    const focus = () => void refresh()
    const timer = window.setInterval(() => { if (window.document.visibilityState === 'visible') void refresh() }, 60_000)
    window.addEventListener('focus', focus)
    return () => { request.current++; abort.current?.abort(); window.clearInterval(timer); window.removeEventListener('focus', focus) }
  }, [refresh])
  const document = loaded?.snapshot ? parseFollowup(loaded.snapshot.markdown) : null
  const historical = Boolean(loaded?.snapshot && loaded.snapshot.id !== loaded.index.current_id)
  const owner = loaded?.access.role === 'owner'
  const selectVersion = (id: string) => { setExpanded(null); setQuery(''); setSourceLine(null); setMessage(''); void refresh(id) }
  const toCurrent = () => { selectedId.current = null; setExpanded(null); setQuery(''); setMessage(''); void refresh(null) }
  const onSource = (line: number) => { setSourceLine(line); setView('original') }
  const download = async () => {
    if (!loaded?.snapshot) return
    try {
      const snapshot = await followupRequest<FollowupSnapshot>(userId, `/versions/${loaded.snapshot.id}`)
      const bytes = snapshot.source_base64 ? Uint8Array.from(atob(snapshot.source_base64), c => c.charCodeAt(0)) : new TextEncoder().encode(snapshot.markdown)
      const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))).map(b => b.toString(16).padStart(2, '0')).join('')
      if (digest !== snapshot.content_hash) throw new Error('下载校验失败，未生成文件。请刷新后重试。')
      const url = URL.createObjectURL(new Blob([bytes], { type: 'text/markdown;charset=utf-8' }))
      const anchor = window.document.createElement('a'); anchor.href = url; anchor.download = snapshot.filename; anchor.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setMessage('原文件下载校验通过 · SHA-256 ' + digest)
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : '下载失败') }
  }

  return <section className="customer-followup" aria-label="团队客户跟进" aria-busy={refreshing}>
    <div className="followup-heading"><div><h1>客户跟进</h1><p><LockKeyhole size={13} />仅受邀成员可见{loaded && <> · {owner ? '你可以更新台账及管理共享成员' : '你拥有查看权限'}</>}</p></div><div className="followup-actions"><button type="button" className="secondary-button" disabled={refreshing} onClick={() => void refresh()}><RefreshCw size={15} className={refreshing ? 'followup-spinning' : ''} />刷新</button>{loaded && <><button type="button" className="secondary-button" onClick={() => setPanel('history')}><History size={15} />历史版本</button>{owner && <button type="button" className="secondary-button" onClick={() => setPanel('members')}><Users size={15} />共享成员</button>}{owner && !historical && <button type="button" className="primary-button" onClick={() => setPanel('upload')}><Upload size={15} />上传更新</button>}</>}</div></div>
    {error && <div className="followup-empty" role="alert"><LockKeyhole size={28} /><h2>暂时无法查看台账</h2><p>{error}</p><a href="#settings">账户与设置</a></div>}
    {!loaded && !error && <div className="followup-empty" role="status">正在核对权限并读取团队台账…</div>}
    {message && <p className="followup-feedback" role="status">{message}</p>}
    {loaded && !loaded.snapshot && <div className="followup-empty"><FileText size={30} /><h2>团队台账还没有内容</h2><p>{owner ? '上传一份 Markdown 台账，先预览，再更新给同事查看。' : '负责人上传后，你就可以在这里查看最新跟进。'}</p></div>}
    {loaded?.snapshot && document && <>
      {historical && <div className="followup-history-notice" role="status"><span>正在查看历史版本 · {loaded.snapshot.source_date ?? loaded.snapshot.filename}</span><button type="button" onClick={toCurrent}>返回最新版</button></div>}
      <div className="followup-toolbar"><div className="followup-document-meta"><FollowupDatePicker index={loaded.index} selectedId={loaded.snapshot.id} busy={refreshing} onSelect={selectVersion} /><span>上传于 {dateTime(loaded.snapshot.created_at)}（北京时间）</span></div><div className="followup-read-actions"><div className="followup-view-switch" aria-label="阅读方式">{followupViews.map(([id, label]) => <button key={id} type="button" aria-pressed={view === id} onClick={() => { setSourceLine(null); setView(id) }}>{label}</button>)}</div><button type="button" className="secondary-button" onClick={download}><Download size={14} />下载 .md</button></div></div>
      <p className="followup-footnote">数据版本 {document.metadata.dataset_version || loaded.snapshot.id} · 文件整理日 {document.metadata.updated_date || loaded.snapshot.source_date || '待确认'} · {document.metadata.timezone || '时区按原文'} · 原文 SHA-256 {loaded.snapshot.content_hash}</p>
      <div className="followup-list-toolbar"><label className="followup-search"><Search size={16} /><input aria-label="搜索跟进客户" placeholder="搜索客户、历史、产品或进度" value={query} onChange={event => setQuery(event.target.value)} /></label><button className="followup-text-button" onClick={() => setQuery('')}>清除搜索</button><span>{document.coverage.total} 个非空正文块已保留 · 未保留 {document.coverage.unretained}</span></div>
      {document.warnings.map(warning => <p className="followup-warning" key={warning}>{warning}</p>)}
      <FollowupContent key={loaded.snapshot.id} document={document} markdown={loaded.snapshot.markdown} view={view} query={query} expanded={expanded} setExpanded={setExpanded} onSource={onSource} sourceLine={sourceLine} />
    </>}
    {panel === 'upload' && loaded && owner && <UploadDialog userId={userId} loaded={loaded} onClose={() => setPanel(null)} onSaved={() => { setPanel(null); toCurrent(); setMessage('台账已更新，同事打开后将看到最新版。') }} />}
    {panel === 'history' && loaded && <HistoryDialog userId={userId} loaded={loaded} onClose={() => setPanel(null)} onOpen={id => { setPanel(null); selectVersion(id) }} onRestored={() => { setPanel(null); toCurrent() }} />}
    {panel === 'members' && owner && <MembersDialog userId={userId} onClose={() => setPanel(null)} />}
  </section>
}

function UploadDialog({ userId, loaded, onClose, onSaved }: { userId: string; loaded: LoadedState; onClose: () => void; onSaved: () => void }) {
  const [base] = useState(loaded)
  const [allowRevision, setAllowRevision] = useState(false)
  const [draft, setDraft] = useState<{ filename: string; markdown: string; source_base64: string } | null>(null), [error, setError] = useState(''), [busy, setBusy] = useState(false), [confirmed, setConfirmed] = useState(false)
  const fileRevision = useRef(0)
  const next = draft ? parseFollowup(draft.markdown) : null
  const previous = base.snapshot ? parseFollowup(base.snapshot.markdown) : null
  const change = next ? compareFollowup(previous, next) : null
  const choose = async (file?: File) => {
    const revision = ++fileRevision.current
    setError(''); setDraft(null); setConfirmed(false)
    if (!file) return
    try {
      if (!/\.(md|markdown)$/i.test(file.name)) throw new Error('请选择 .md 或 .markdown 文件。')
      if (file.size > 524288) throw new Error('文件不能超过 512 KB。')
      const bytes = new Uint8Array(await file.arrayBuffer())
      const markdown = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes)
      const source_base64 = btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''))
      if (!markdown.trim() || markdown.includes('\u0000')) throw new Error('文件为空或不是有效文本，请另存为 UTF-8。')
      if (revision === fileRevision.current) setDraft({ filename: file.name, markdown, source_base64 })
    } catch (cause) { if (revision === fileRevision.current) setError(cause instanceof Error ? cause.message : '无法读取文件。') }
  }
  const save = async () => {
    if (!draft || !confirmed || busy) return
    setBusy(true); setError('')
    try { await followupRequest(userId, '/versions', { ...draft, allow_revision: allowRevision, activate: !next?.failed, expected_current_id: base.index.current_id }); onSaved() }
    catch (cause) { setError(cause instanceof Error ? cause.message : '上传失败，请重试。') }
    finally { setBusy(false) }
  }
  return <Dialog title="上传台账更新" onClose={onClose} busy={busy}><p className="followup-dialog-intro">上传完整的 Markdown 台账，预览后更新团队可见版本。历史版本会保留。</p><label className="followup-upload-target"><Upload size={26} /><strong>选择 .md 文件</strong><span>UTF-8 · 最大 512 KB</span><input type="file" accept=".md,.markdown,text/markdown" disabled={busy} onChange={event => void choose(event.target.files?.[0])} /></label>{draft && next && change && <div className="followup-upload-preview"><strong>{draft.filename}</strong><p>识别到 {next.customers.length} 条客户 / 询盘主档</p><p>与当前版本按编号比较：新增 {change.added} · 内容变化 {change.changed} · 未出现在本版 {change.removed}</p>{change.removed > 0 && <p className="followup-warning">本版少了 {change.removed} 条主档。更新会以本版完整内容为准；旧版记录仍可查阅。</p>}{next.warnings.map(w => <p key={w} className="followup-warning">{w}</p>)}<p>数据集 {next.metadata.dataset_id || '未注明'} · 版本 {next.metadata.dataset_version || '未注明'} · 事件 {next.events.length} · 任务 {next.tasks.length} · 未保留正文块 {next.coverage.unretained}</p><label className="followup-confirm"><input type="checkbox" checked={allowRevision} onChange={e => setAllowRevision(e.target.checked)} /><span>若同版本号内容不同，显式追加修订快照（原版保留）</span></label><details><summary>预览完整原文</summary><FollowupMarkdown markdown={draft.markdown} /></details><label className="followup-confirm"><input type="checkbox" checked={confirmed} disabled={busy} onChange={event => setConfirmed(event.target.checked)} /><span>我已核对客户状态及日期，确认以这份完整台账更新团队版本。</span></label></div>}{error && <p role="alert" className="followup-error">{error}</p>}<footer><button type="button" className="secondary-button" disabled={busy} onClick={onClose}>取消</button><button type="button" className="primary-button" disabled={!draft || !confirmed || busy} onClick={() => void save()}>{busy ? '正在保存…' : next?.failed ? '仅保存原文，不替换当前版本' : '确认更新'}</button></footer></Dialog>
}

function HistoryDialog({ userId, loaded, onClose, onOpen, onRestored }: { userId: string; loaded: LoadedState; onClose: () => void; onOpen: (id: string) => void; onRestored: () => void }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  const restore = async (id: string) => {
    if (!window.confirm('将此历史内容恢复为团队当前版本？现有版本会继续保留。')) return
    setBusy(true); setError('')
    try { await followupRequest(userId, `/versions/${id}/restore`, { expected_current_id: loaded.index.current_id }); onRestored() }
    catch (cause) { setError(cause instanceof Error ? cause.message : '恢复失败，请刷新后重试。') }
    finally { setBusy(false) }
  }
  return <Dialog title="历史版本" onClose={onClose} busy={busy}><p className="followup-dialog-intro">资料日期来自文件。上传时间记录保存时刻，所有旧版均保留。</p>{!loaded.index.versions.length && <p>暂无历史版本。</p>}{loaded.index.versions.map(version => <div className="followup-version" key={version.id}><div><strong>{version.source_date ?? '未注明资料日期'}{version.id === loaded.index.current_id && <span className="followup-current-badge">当前版本</span>}</strong><span>{version.filename}</span><small>{dateTime(version.created_at)} 保存{version.restored_from ? ' · 从历史恢复' : ''}</small></div><div className="followup-actions"><button type="button" className="secondary-button" disabled={busy} onClick={() => onOpen(version.id)}>查看</button>{loaded.access.role === 'owner' && version.id !== loaded.index.current_id && <button type="button" className="followup-text-button" disabled={busy} onClick={() => void restore(version.id)}>恢复此版</button>}</div></div>)}{error && <p role="alert" className="followup-error">{error}</p>}</Dialog>
}

function MembersDialog({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [members, setMembers] = useState<FollowupMembers | null>(null), [email, setEmail] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false)
  useEffect(() => { const controller = new AbortController(); void followupRequest<FollowupMembers>(userId, '/members', undefined, controller.signal).then(setMembers).catch(cause => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : '读取成员失败。') }); return () => controller.abort() }, [userId])
  const mutate = async (path: string, value: string) => {
    setBusy(true); setError('')
    try { await followupRequest(userId, path, { email: value }); setMembers(await followupRequest<FollowupMembers>(userId, '/members')); setEmail('') }
    catch (cause) { setError(cause instanceof Error ? cause.message : '保存成员失败。') }
    finally { setBusy(false) }
  }
  return <Dialog title="共享成员" onClose={onClose} busy={busy}><p className="followup-dialog-intro">添加同事实际用于登录网站的邮箱。同事拥有查看及下载权限，你保留上传与恢复权限。添加成员不会发送邀请邮件。</p>{members && <><div className="followup-member"><span>{members.owner}</span><small>负责人 · 可更新</small></div>{members.members.map(member => <div key={member.email} className="followup-member"><span>{member.email}<small>仅查看</small></span><button type="button" className="followup-text-button" disabled={busy} onClick={() => { if (window.confirm(`移除 ${member.email} 的台账访问权限？`)) void mutate('/members/remove', member.email) }}>移除</button></div>)}</>}<form className="followup-member-form" onSubmit={event => { event.preventDefault(); void mutate('/members', email) }}><label htmlFor="followup-member-email">同事登录邮箱</label><div><input type="email" required id="followup-member-email" value={email} onChange={event => setEmail(event.target.value)} placeholder="colleague@company.com" disabled={busy} /><button type="submit" className="primary-button" disabled={busy || !members}>添加成员</button></div></form>{error && <p role="alert" className="followup-error">{error}</p>}</Dialog>
}

export function CustomerFollowUp() {
  const account = useAccountSession()
  if (account.status !== 'authenticated') return <section className="customer-followup"><h1>客户跟进</h1><div className="followup-empty"><LockKeyhole size={30} /><h2>{account.status === 'loading' ? '正在确认登录…' : '登录后查看团队台账'}</h2><p>仅负责人和受邀同事可以查看客户跟进、报价与历史记录。</p>{account.status !== 'loading' && <a href="#settings">账户与设置</a>}</div></section>
  return <FollowupWorkspace key={account.user.id} userId={account.user.id} />
}
