import { describe, expect, it } from 'vitest'
import { publicLeads } from '../src/lib/productMarketMap'
import { emptyBusinessFilters, filterWorkbenchLeads } from '../src/lib/leadWorkbench'
import { leadMissingDetails } from '../src/lib/leadCompleteness'
import { outreachCompanyKey, type OutreachSend } from '../src/lib/outreachLedger'

const lead = publicLeads.find(item => item.id === 'aexcel-mentor')!
const sent: OutreachSend = { id:'fixture',company_key:outreachCompanyKey(lead),company_name:lead.company,lead_id:lead.id,product_id:lead.productId,recipient_email:'fixture@example.org',sent_on:'2026-10-19',created_at:'2026-10-19T00:00:00Z',sent_by:null,voided_at:null }
describe('independent sending, channel and completeness dimensions', () => {
  it('includes a company without email in no-record results and permits sent plus missing-email', () => {
    expect(leadMissingDetails(lead)['needs-email']).toBe(true)
    expect(filterWorkbenchLeads([lead], { ...emptyBusinessFilters,sendStatus:'unsent' }, {}, [], '2026-10-21')).toEqual([lead])
    expect(filterWorkbenchLeads([lead], { ...emptyBusinessFilters,sendStatus:'sent',completeness:'needs-email',contact:'form' }, {}, [sent], '2026-10-21')).toEqual([lead])
    expect(filterWorkbenchLeads([lead], { ...emptyBusinessFilters,completeness:'needs-email' }, null, null, '2026-10-21')).toEqual([lead])
  })
  it('makes unavailable history unknown rather than no-record, without hiding public channels', () => {
    expect(filterWorkbenchLeads([lead], { ...emptyBusinessFilters,sendStatus:'unsent' }, {}, null, '2026-10-21')).toEqual([])
    expect(filterWorkbenchLeads([lead], { ...emptyBusinessFilters,sendStatus:'unknown',contact:'form' }, {}, null, '2026-10-21')).toEqual([lead])
    expect(filterWorkbenchLeads([lead], { ...emptyBusinessFilters,sendStatus:'unknown' }, {}, [], '2026-10-21')).toEqual([])
  })
  it('keeps application and source gaps specific, and never infers social channels from phone', () => {
    expect(leadMissingDetails(lead)['needs-application']).toBe(false)
    expect(leadMissingDetails({ ...lead,companyEvidence:{...lead.companyEvidence,applicationId:'unknown'} })['needs-application']).toBe(true)
    expect(leadMissingDetails({ ...lead,companyEvidence:{...lead.companyEvidence,sourceUrl:''} })['needs-evidence']).toBe(true)
    expect(filterWorkbenchLeads([lead], { ...emptyBusinessFilters,contact:'whatsapp' }, {}, [], '2026-10-21')).toEqual([])
    const social = {...lead,profile:{...lead.profile,linkedIn:'https://www.linkedin.com/company/example',whatsapp:'https://wa.me/5516997936989'}}
    for (const contact of ['linkedin','whatsapp']) expect(filterWorkbenchLeads([social], {...emptyBusinessFilters,contact}, {}, [], '2026-10-21')).toEqual([social])
  })
})
