import { useState } from 'react'
import { ArrowUpRight, CalendarDays, RefreshCw } from 'lucide-react'
import { products } from '../../lib/demoData'
import { publicLeads, type PublicLead } from '../../lib/productMarketMap'
import { followUpDue } from '../../lib/leadWorkbench'
import { outreachCompanyKey } from '../../lib/outreachLedger'
import { shanghaiDay } from '../../lib/leadTimeline'
import { useLeadWork } from '../market/useLeadWork'
import { useOutreachLedger } from '../market/useOutreachLedger'
import { CompanyDetail } from '../market/CompanyDetail'
import './TodayWorkspace.css'

export function TodayWorkspace() {
  const work = useLeadWork(), ledger = useOutreachLedger()
  const [selected, setSelected] = useState<PublicLead | null>(null)
  const today = shanghaiDay(new Date().toISOString())
  const due = work.status === 'ready' ? publicLeads.filter(lead => followUpDue(work.records[outreachCompanyKey(lead)], today)).sort((a,b) => work.records[outreachCompanyKey(a)].followUpOn.localeCompare(work.records[outreachCompanyKey(b)].followUpOn)) : []
  const favorites = work.status === 'ready' ? publicLeads.filter(lead => work.records[outreachCompanyKey(lead)]?.favorite) : []
  return <div className="today-workspace">
    <header className="today-hero"><div><p className="eyebrow">{today} · 今日待办</p><h1>把客户的下一步，往前推进。</h1><p>先处理到期跟进，再开始新的客户开发。</p></div><a className="primary-button" href="#market-intelligence">开始客户开发 <ArrowUpRight size={17}/></a></header>
    <div className="today-shortcuts"><a href="#market-intelligence/follow-up"><span>01 / 客户跟进</span><strong>报价、样品与业务进展</strong><small>查看共享台账中的下一步与完整历史</small></a><a href="#market-intelligence"><span>02 / 客户开发</span><strong>寻找下一位潜在客户</strong><small>按产品、市场和联系渠道筛选</small></a><a href="#products"><span>03 / 产品资料</span><strong>带着依据，回答客户</strong><small>{products.length} 类产品 · 应用、参数与原始资料</small></a></div>
    <div className="today-columns"><section className="today-panel"><header><div><p className="eyebrow">今天要处理</p><h2>我的到期跟进 {work.status === 'ready' && <span>{due.length}</span>}</h2></div><button className="text-button" onClick={()=>void work.refresh()}><RefreshCw size={15}/>刷新</button></header>
      <p className="today-caption">来自当前账号在客户开发中设置的跟进日期；共享客户台账请从“客户跟进”查看。</p>
      {work.status !== 'ready' ? <div className="today-empty" role="status"><CalendarDays size={26}/><strong>{work.status === 'loading' ? '正在读取私人客户记录…' : '私人客户记录未连接'}</strong><p>{work.error || '连接后显示真实待办，当前不能判断是否有到期客户。'}</p><a href="#settings">检查账号与连接</a></div> : due.length ? <div className="today-rows">{due.map(lead=><button key={lead.id} onClick={()=>setSelected(lead)}><div><strong>{lead.company}</strong><p>{work.records[outreachCompanyKey(lead)].nextStep || '查看客户记录，确认下一步'}</p></div><span>{work.records[outreachCompanyKey(lead)].followUpOn}<ArrowUpRight size={15}/></span></button>)}</div> : <div className="today-empty"><CalendarDays size={26}/><strong>目前没有已设置的到期跟进</strong><p>在客户详情设置跟进日期后，会出现在这里。</p><a href="#market-intelligence/follow-up">打开共享客户台账 →</a></div>}
    </section><section className="today-panel"><header><div><p className="eyebrow">继续处理</p><h2>我的重点客户</h2></div></header><p className="today-caption">显示当前账号收藏的客户，点击即可打开详情。</p>{work.status !== 'ready' ? <p className="today-empty">私人记录连接后显示。</p> : favorites.length ? <div className="today-rows">{favorites.slice(0,8).map(lead=><button key={lead.id} onClick={()=>setSelected(lead)}><div><strong>{lead.company}</strong><p>{lead.countryZh}</p></div><ArrowUpRight size={16}/></button>)}</div> : <div className="today-empty"><strong>把重点客户留在手边</strong><p>在客户开发中收藏客户，即可从这里继续处理。</p></div>}<a className="today-helper" href="#assistant">回复助手 · 根据产品资料整理回答 <ArrowUpRight size={16}/></a></section></div>
    <CompanyDetail key={work.ownerId ?? work.status} lead={selected} onClose={()=>setSelected(null)} ledger={ledger} work={work} leads={publicLeads} onNavigate={setSelected}/>
  </div>
}
