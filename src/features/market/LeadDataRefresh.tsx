import { RefreshCw } from 'lucide-react'
import type { PublicLeadData } from './usePublicLeadData'
import './LeadDataRefresh.css'

export function LeadDataRefresh({ data, onRefresh }: { data: PublicLeadData; onRefresh: ()=>void }) {
  const loading=data.status==='loading'
  return <div className={`lead-data-refresh${data.status==='error'?' has-error':''}`}>
    <button type="button" disabled={loading} aria-busy={loading} onClick={onRefresh} title="重新读取网站最新发布的客户数据，保留当前筛选"><RefreshCw size={14} className={loading?'is-refreshing':undefined}/>{loading?'刷新中…':'刷新数据'}</button>
    {data.message && <span role={data.status==='error'?'alert':'status'}>{data.message}</span>}
  </div>
}
