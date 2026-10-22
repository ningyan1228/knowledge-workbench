import { useEffect, useRef, useState } from 'react'
import { publicLeads, type PublicLead } from '../../lib/productMarketMap'
import { fetchPublicLeadSnapshot, installPublicLeadSnapshot } from '../../lib/publicLeadSnapshot'

export function usePublicLeadData() {
  const [leads,setLeads]=useState(()=>publicLeads.slice())
  const [status,setStatus]=useState<'idle'|'loading'|'ready'|'error'>('idle')
  const [message,setMessage]=useState('')
  const [revision,setRevision]=useState(0)
  const active=useRef<AbortController|null>(null)
  useEffect(()=>()=>{ active.current?.abort(); active.current=null },[])
  const refresh=async (beforeApply?: (leads: PublicLead[])=>boolean) => {
    if (active.current) return
    const controller=new AbortController()
    active.current=controller
    setStatus('loading'); setMessage('正在读取最新发布的客户数据…')
    let timeout=false
    const timer=setTimeout(()=>{timeout=true;controller.abort()},15000)
    try {
      const base=new URL(import.meta.env.BASE_URL,window.location.href)
      const snapshot=await fetchPublicLeadSnapshot(base,controller.signal)
      if (controller.signal.aborted || beforeApply && !beforeApply(snapshot.leads)) {
        if (!controller.signal.aborted) { setStatus('idle');setMessage('已取消刷新，当前数据保留。') }
        return
      }
      installPublicLeadSnapshot(snapshot)
      setLeads(snapshot.leads.slice());setRevision(value=>value+1);setStatus('ready')
      const time=new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date())
      setMessage(`已刷新 · ${time}`)
    } catch(error) {
      if (!controller.signal.aborted || timeout) {
        setStatus('error');setMessage(timeout?'刷新超时，当前数据保留，请重试。':`刷新失败：${error instanceof Error?error.message:'请检查网络后重试。'} 当前数据保留。`)
      }
    } finally { clearTimeout(timer);if(active.current===controller)active.current=null }
  }
  return {leads,status,message,revision,refresh}
}
export type PublicLeadData = ReturnType<typeof usePublicLeadData>
