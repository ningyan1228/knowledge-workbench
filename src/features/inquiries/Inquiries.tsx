import { useEffect, useRef, useState } from 'react'
import { Copy, Mail, RefreshCw, LockKeyhole, Check } from 'lucide-react'
import { useAccountSession } from '../../lib/accountSession'
import { inquiryError, listInquiries, readInquiry, setInquiryStatus, type Inquiry, type InquirySummary } from '../../lib/inquiries'
import './Inquiries.css'

function InquiryDetail({ownerId,id,onStatus}:{ownerId:string;id:string;onStatus:(row:Inquiry)=>void}) {
  const [row,setRow]=useState<Inquiry|null>(null),[error,setError]=useState(''),[version,setVersion]=useState(0)
  const [original,setOriginal]=useState(false),[busy,setBusy]=useState(false),[notice,setNotice]=useState('')
  const mounted=useRef(true)
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false}},[])
  useEffect(()=>{const controller=new AbortController();setRow(null);setError('');void readInquiry(ownerId,id,controller.signal).then(r=>{if(!controller.signal.aborted)setRow(r)}).catch(e=>{if(!controller.signal.aborted)setError(inquiryError(e))});return()=>controller.abort()},[ownerId,id,version])
  const update=async()=>{
    if(!row||busy)return
    const status=row.status==='pending'?'sent':'pending'
    if(!window.confirm(status==='sent'?'确认已在原邮件线程实际发送这封回复？此操作只记录状态，不发送邮件。':'确认更正为待发送？原状态变更记录会保留。'))return
    setBusy(true);setNotice('')
    try{const next=await setInquiryStatus(ownerId,row,status);if(mounted.current){setRow(next);onStatus(next);setNotice('发送状态已保存。')}}catch(e){if(mounted.current)setNotice(inquiryError(e))}finally{if(mounted.current)setBusy(false)}
  }
  const copy=async()=>{if(!row)return;try{await navigator.clipboard.writeText(row.reply_original);if(mounted.current)setNotice('已复制回复原文。')}catch{if(mounted.current)setNotice('复制失败，请切换原文后手动选择复制。')}}
  if(error)return <div className="inquiry-empty" role="alert"><p>{error}</p><button onClick={()=>setVersion(v=>v+1)}>重试详情</button></div>
  if(!row)return <p className="inquiry-empty" role="status">正在读取询盘正文…</p>
  const language=row.language==='vi'?'越南语':'英文'
  return <article className="inquiry-detail">
    <header><div><p className="eyebrow">询盘详情 · {language}</p><h2>{row.customer_name}</h2><p>{row.product}</p></div><span className={`inquiry-status ${row.status}`}>{row.status==='sent'?'已发送':'待发送'}</span></header>
    <dl className="inquiry-metadata">{[['公司',row.company],['国家／地区',row.country],['询盘时间',row.inquiry_time],['原邮件主题',row.subject],['额外要求',row.extra_request]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value||'未提供'}</dd></div>)}</dl>
    <details className="inquiry-source"><summary>来源备注与字段说明</summary><pre>{row.source_metadata}</pre></details>
    <div className="inquiry-detail-toolbar"><div role="group" aria-label="正文语言"><button aria-pressed={!original} onClick={()=>setOriginal(false)}>中文对照</button><button aria-pressed={original} onClick={()=>setOriginal(true)}>原文 · {language}</button></div><button className="secondary-button" onClick={()=>void copy()}><Copy size={15}/>复制回复原文</button></div>
    <div className="inquiry-correspondence"><section><h3><Mail size={16}/>客户询盘 <small>{original?language:'中文翻译'}</small></h3><pre>{original?row.inquiry_original:row.inquiry_zh}</pre></section><section><h3><Check size={16}/>核准回复 <small>{original?language:'中文翻译'}</small></h3><pre>{original?row.reply_original:row.reply_zh}</pre></section></div>
    <footer><div><p>复制、查看不会改变发送状态。</p>{row.status_updated_at&&<small>最近确认：{new Date(row.status_updated_at).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai'})}（北京时间）</small>}</div><button className="primary-button" disabled={busy} onClick={()=>void update()}>{busy?'保存中…':row.status==='sent'?'更正为待发送':'确认已实际发送'}</button></footer>
    {notice&&<p role="status" className="inquiry-feedback">{notice}<button className="text-button" disabled={busy} onClick={()=>{setNotice('');setVersion(v=>v+1)}}>刷新详情</button></p>}
  </article>
}
function InquiryWorkspace({ownerId}:{ownerId:string}) {
  const [rows,setRows]=useState<InquirySummary[]>([]),[selected,setSelected]=useState<string|null>(null)
  const [loading,setLoading]=useState(true),[error,setError]=useState(''),[revision,setRevision]=useState(0)
  useEffect(()=>{const controller=new AbortController();setLoading(true);setRows([]);setError('');void listInquiries(ownerId,controller.signal).then(r=>{if(controller.signal.aborted)return;setRows(r);setSelected(old=>r.some(x=>x.id===old)?old:r[0]?.id??null);setLoading(false)}).catch(e=>{if(!controller.signal.aborted){setError(inquiryError(e));setSelected(null);setLoading(false)}});return()=>controller.abort()},[ownerId,revision])
  return <div className="inquiries-page">
    <header className="inquiries-heading"><div><p className="eyebrow">PRIVATE CORRESPONDENCE</p><h1>询盘往来</h1><p>客户的原始需求，与核准回复放在一起。</p></div><button className="secondary-button" disabled={loading} onClick={()=>setRevision(v=>v+1)}><RefreshCw size={15}/>刷新</button></header>
    <p className="inquiries-guidance">回复在原邮件线程里发，保留原主题，抄送薛哥（Peter）。</p>
    <p className="inquiries-privacy"><LockKeyhole size={14}/>仅当前登录账号可见 · {loading?'正在读取…':`${rows.length} 封询盘`}</p>
    {error?<div className="inquiry-empty" role="alert"><p>{error}</p><button onClick={()=>setRevision(v=>v+1)}>重新读取</button><a href="#settings">检查账号与连接</a></div>:loading?<p className="inquiry-empty" role="status">正在读取私人询盘…</p>:!rows.length?<div className="inquiry-empty"><h2>当前账号尚无已导入询盘</h2><p>完成私有表初始化和导入后，询盘会显示在这里。</p><button onClick={()=>setRevision(v=>v+1)}>重新读取</button></div>:<>
    <div className="inquiry-list" aria-label="询盘列表"><table><thead><tr><th>客户</th><th>产品</th><th>询盘日期（源记录）</th><th>状态</th></tr></thead><tbody>{rows.map(r=><tr key={r.id} className={selected===r.id?'selected':''}><td><button aria-pressed={selected===r.id} onClick={()=>setSelected(r.id)}>{r.customer_name}</button></td><td>{r.product}</td><td>{r.inquiry_time||'未提供'}</td><td><span className={`inquiry-status ${r.status}`}>{r.status==='sent'?'已发送':'待发送'}</span></td></tr>)}</tbody></table></div>
    {selected&&<InquiryDetail key={`${ownerId}:${selected}:${revision}`} ownerId={ownerId} id={selected} onStatus={next=>setRows(list=>list.map(r=>r.id===next.id?{...r,status:next.status,version:next.version}:r))}/>}
    </>}
  </div>
}
export function Inquiries() {
  const account=useAccountSession()
  if(account.status!=='authenticated')return <section className="inquiry-empty"><LockKeyhole size={28}/><h1>询盘往来</h1><p>{account.status==='loading'?'正在确认登录状态…':'登录私人资料库后查看询盘与回复。'}</p>{account.status!=='loading'&&<a href="#settings">前往登录与设置</a>}</section>
  return <InquiryWorkspace key={account.user.id} ownerId={account.user.id}/>
}
