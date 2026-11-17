import { useState } from 'react'
import { LeadCard, type LeadCardProps } from './LeadCard'
import { marketProducts, type PublicLead } from '../../lib/productMarketMap'
import { effectiveStage, developmentProgressLabels } from '../../lib/leadWorkbench'
import { recordedDay } from '../../lib/leadTimeline'
import { activeOutreachSend } from '../../lib/outreachLedger'
import './CustomerDenseList.css'

function PageRows({ leads, selectedLead, ...props }: Omit<LeadCardProps, 'lead' | 'selected' | 'variant'> & { leads: PublicLead[]; selectedLead: PublicLead | null }) {
  const [page,setPage]=useState(0),[cards,setCards]=useState(false)
  const pages=Math.max(1,Math.ceil(leads.length/50)), current=Math.min(page,pages-1)
  const rows=leads.slice(current*50,current*50+50)
  return <div className="customer-browse-list dense-customer-list" aria-label="客户列表" tabIndex={0}>
    <div className="dense-list-toolbar"><span>{leads.length} 家 · 每页 50 家</span><button onClick={()=>setCards(!cards)}>{cards?'切换密表':'切换卡片'}</button></div>
    {cards ? rows.map(lead=><LeadCard key={lead.id} {...props} lead={lead} selected={selectedLead?.id===lead.id}/>) : <div className="dense-table-scroll"><table><thead><tr>{['公司','国家','产品匹配','开发进度','首次收录','最后核验','发送记录'].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{rows.map(lead=><tr key={lead.id} aria-selected={selectedLead?.id===lead.id} className={selectedLead?.id===lead.id?'is-selected':''}><td><button onClick={()=>props.onSelect(lead)} title={lead.company}>{lead.company}</button></td><td>{lead.countryZh}</td><td>{marketProducts.find(p=>p.id===lead.productId)?.name}</td><td>{developmentProgressLabels[effectiveStage(lead,props.work.status==='ready'?props.work.records:null,props.ledger.status==='ready'?props.ledger.sends:null)]}</td><td>{recordedDay(lead) || '待核'}</td><td>{lead.checkedAt || '待核'}</td><td>{props.ledger.status!=='ready'?'待连接核对':activeOutreachSend(props.ledger.sends,lead)?'已记录发送':'未查到记录'}</td></tr>)}</tbody></table></div>}
    <div className="dense-list-toolbar"><button disabled={current===0} onClick={()=>setPage(current-1)}>上一页</button><span>{current+1} / {pages}</span><button disabled={current+1>=pages} onClick={()=>setPage(current+1)}>下一页</button></div>
  </div>
}
export function CustomerBrowseList(props: Parameters<typeof PageRows>[0]) {
  return <PageRows key={props.leads.map(l=>l.id).join('|')} {...props}/>
}
