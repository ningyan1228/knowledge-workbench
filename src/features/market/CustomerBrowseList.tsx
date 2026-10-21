import { LeadCard, type LeadCardProps } from './LeadCard'
import type { PublicLead } from '../../lib/productMarketMap'

/** Keep this scroll container mounted while the neighboring workspace changes. */
export function CustomerBrowseList({ leads, selectedLead, ...props }: Omit<LeadCardProps, 'lead' | 'selected' | 'variant'> & { leads: PublicLead[]; selectedLead: PublicLead | null }) {
  return <div className="customer-browse-list" aria-label="客户列表" tabIndex={0}>
    {leads.map(lead => <LeadCard key={lead.id} {...props} lead={lead} selected={selectedLead?.id === lead.id} />)}
  </div>
}
