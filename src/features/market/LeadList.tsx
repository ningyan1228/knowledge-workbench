import { LeadCard, type LeadCardProps } from './LeadCard'
import type { PublicLead } from '../../lib/productMarketMap'
import './LeadList.css'

export function LeadList({ leads, selectedLead, ...cardProps }: Omit<LeadCardProps, 'lead' | 'selected' | 'variant'> & { leads: PublicLead[]; selectedLead: PublicLead | null }) {
  return <div className="customer-list-scroll" tabIndex={0} aria-label="客户对比列表"><table className="customer-list-table">
    <caption>逐家比较产品应用与联系渠道；可直接准备开发信，或查看原参考稿与发送记录。潜在应用匹配，采购与使用待确认。</caption>
    <colgroup><col className="customer-list-col-company" /><col className="customer-list-col-country" /><col className="customer-list-col-application" /><col className="customer-list-col-date" /><col className="customer-list-col-contact" /><col className="customer-list-col-actions" /></colgroup>
    <thead><tr><th scope="col">公司／客户类型</th><th scope="col">国家／地区</th><th scope="col">产品与应用</th><th scope="col">核验／首次收录</th><th scope="col">公开联系入口</th><th scope="col">操作</th></tr></thead>
    <tbody>{leads.map((lead) => <LeadCard {...cardProps} key={lead.id} lead={lead} selected={lead.id === selectedLead?.id} variant="row" />)}</tbody>
  </table></div>
}
