import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { followupRequest } from '../../lib/followupApi'
import type { FollowupCustomer } from '../../lib/customerFollowup'
import { shanghaiDay } from '../../lib/leadTimeline'
export type FollowupAction = { id: string; customer_id: string; kind: 'done' | 'postpone'; action_date: string; note: string; actor: string; created_at: string }
const Context = createContext<{ rows: FollowupAction[]; ready: boolean; writable: boolean; open: (row: FollowupCustomer, kind: FollowupAction['kind']) => void }>({ rows: [], ready: false, writable: false, open: () => {} })
export const useFollowupActions = () => useContext(Context)
export function effectiveFollowupDate(row: FollowupCustomer, actions: FollowupAction[]) {
  const last = actions.filter(a => a.customer_id === row.id).at(-1)
  return last ? last.kind === 'done' ? null : last.action_date : row.actionDate
}
export function FollowupActions({ userId, versionId, writable, refreshKey, children }: { userId: string; versionId: string; writable: boolean; refreshKey: object; children: ReactNode }) {
  const [rows,setRows]=useState<FollowupAction[]>([]), [ready,setReady]=useState(false), [error,setError]=useState('')
  const [edit,setEdit]=useState<{row:FollowupCustomer;kind:FollowupAction['kind'];id:string;last:string|null}|null>(null)
  const [day,setDay]=useState(''), [note,setNote]=useState(''), [busy,setBusy]=useState(false)
  const dialog=useRef<HTMLDialogElement>(null), today=shanghaiDay(new Date().toISOString())
  const refresh=async()=>{setError('');try{setRows(await followupRequest<FollowupAction[]>(userId,`/versions/${versionId}/actions`));setReady(true)}catch(e){setReady(false);setRows([]);setError(e instanceof Error?e.message:'操作记录读取失败')}}
  useEffect(()=>{let active=true;void followupRequest<FollowupAction[]>(userId,`/versions/${versionId}/actions`).then(r=>{if(active){setRows(r);setReady(true)}}).catch(e=>{if(active){setReady(false);setRows([]);setError(String(e))}});return()=>{active=false}},[userId,versionId,refreshKey])
  useEffect(()=>{if(edit)dialog.current?.showModal();else dialog.current?.close()},[edit])
  const save=async()=>{if(!edit)return;setBusy(true);setError('');try{const saved=await followupRequest<FollowupAction>(userId,`/versions/${versionId}/actions`,{id:edit.id,customer_id:edit.row.id,kind:edit.kind,action_date:day,note,expected_last_id:edit.last});setRows(r=>[...r.filter(a=>a.id!==saved.id),saved]);setEdit(null)}catch(e){setError(e instanceof Error?e.message:'保存失败')}finally{setBusy(false)}}
  return <Context.Provider value={{rows,ready,writable:writable&&ready,open:(row,kind)=>{setEdit({row,kind,id:crypto.randomUUID(),last:rows.filter(a=>a.customer_id===row.id).at(-1)?.id??null});setNote('');setDay(kind==='done'?today:'')}}}>
    <p className="followup-footnote">原始台账保持不变；操作仅作用于本版本，更新台账后须按新版重新核对。{!writable&&' 当前为只读：仅负责人可操作最新版。'}{!ready&&' 操作记录尚未连接，日期与状态仅显示原文。'}</p>
    {error&&!edit&&<p role="alert">{error} <button onClick={()=>void refresh()}>重试操作记录</button></p>}{children}
    {edit&&<dialog ref={dialog} className="followup-dialog" onCancel={e=>{e.preventDefault();if(!busy)setEdit(null)}} aria-label="记录跟进操作"><form onSubmit={e=>{e.preventDefault();void save()}}><h2>{edit.kind==='done'?'标记已跟进':'推迟跟进'} · {edit.row.customer}</h2><p>仅保存内部操作，不发送邮件、不更改原始台账。</p><label>{edit.kind==='done'?'实际跟进日期':'新的跟进日期'}<input required type="date" value={day} max={edit.kind==='done'?today:undefined} min={edit.kind==='postpone'?shanghaiDay(new Date(Date.now()+86400000).toISOString()):undefined} onChange={e=>setDay(e.target.value)}/></label><label>处理说明<textarea required maxLength={2000} value={note} onChange={e=>setNote(e.target.value)} placeholder="记录实际处理内容或推迟原因"/></label>{error&&<p role="alert">{error}；若提示已有新操作，请取消并刷新。</p>}<button type="button" disabled={busy} onClick={()=>setEdit(null)}>取消</button><button className="primary-button" disabled={busy||!note.trim()||!day}>{busy?'保存中…':'保存操作'}</button></form></dialog>}
  </Context.Provider>
}
export function FollowupRowActions({row}:{row:FollowupCustomer}){const a=useFollowupActions();return <span className="followup-row-actions"><button disabled={!a.writable} title={!a.writable?'仅负责人可在操作记录连接后操作最新版':undefined} onClick={()=>a.open(row,'done')}>已跟进</button><button disabled={!a.writable} title={!a.writable?'仅负责人可在操作记录连接后操作最新版':undefined} onClick={()=>a.open(row,'postpone')}>推迟</button></span>}
export function FollowupActionHistory({id}:{id:string}){const a=useFollowupActions();return <section><h3>本版操作记录</h3>{a.rows.filter(r=>r.customer_id===id).slice().reverse().map(r=><p key={r.id}>{r.kind==='done'?'已跟进':'推迟至'} {r.action_date} · {r.note}<br/><small>{r.actor} · {new Date(r.created_at).toLocaleString('zh-CN')}</small></p>)}{!a.rows.some(r=>r.customer_id===id)&&<p>{a.ready?'本版本尚无操作记录':'操作记录尚未连接'}</p>}</section>}
