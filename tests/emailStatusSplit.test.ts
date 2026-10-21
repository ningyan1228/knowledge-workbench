import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { LeadBusinessControls } from '../src/features/market/LeadWorkbench'
import { publicLeads, type PublicLead } from '../src/lib/productMarketMap'
import { emptyBusinessFilters, emptyWorkRecord, filterWorkbenchLeads, type BusinessFilters } from '../src/lib/leadWorkbench'
import { outreachCompanyKey, type OutreachSend } from '../src/lib/outreachLedger'
import { selectBusinessRecipient } from '../src/lib/contactEvidence'
import { developmentEmailVersion } from '../src/lib/developmentEmailVersion'
import type { LeadWork } from '../src/features/market/useLeadWork'
import type { OutreachLedger } from '../src/features/market/useOutreachLedger'

const email = publicLeads.find(item => item.id === 'colorificio-feroni-oppeano')!
const missing = publicLeads.find(item => item.id === 'aexcel-mentor')!
const invalid: PublicLead = { ...missing, id: 'invalid-email', company: 'Invalid email fixture', profile: { ...missing.profile, generalEmail: 'not-an-email', generalEmailEvidence: undefined, contacts: [], departmentEmails: [] } }
const send: OutreachSend = { id: 'fixture', company_key: outreachCompanyKey(missing), company_name: missing.company, lead_id: missing.id, product_id: 'nl-w1201', recipient_email: 'historical@example.org', sent_on: '2026-10-20', sent_by: null, created_at: '2026-10-20T01:00:00Z', voided_at: null }
const filter = (status: BusinessFilters['sendStatus'], leads = [email, missing, invalid], sends: OutreachSend[] | null = []) => filterWorkbenchLeads(leads, { ...emptyBusinessFilters, sendStatus: status }, {}, sends, '2026-10-20')

describe('sending records are independent of the current inbox', () => {
  it('includes all no-record companies while keeping verified inbox gaps separately available', () => {
    expect(selectBusinessRecipient(email)).toBeTruthy()
    expect(selectBusinessRecipient(missing)).toBeNull()
    expect(selectBusinessRecipient(invalid)).toBeNull()
    expect(filter('unsent')).toEqual(expect.arrayContaining([email, missing, invalid]))
    expect(filter('unsent')).toHaveLength(3)
    expect(filter('needs-email')).toEqual(expect.arrayContaining([missing, invalid]))
    expect(filter('needs-email')).toHaveLength(2)
    expect(filter('all')).toHaveLength(3)
    const unverified = { ...invalid, profile: { ...invalid.profile, generalEmail: 'sales@example.org', generalEmailEvidence: { company: invalid.company, kind: 'general' as const, verifiedAt: '2026-10-20', sources: [] } } }
    expect(filter('unsent', [unverified])).toEqual([unverified])
    expect(filter('needs-email', [unverified])).toEqual([unverified])
  })
  it('keeps active historical sends in sent even after losing the current inbox, across products', () => {
    const otherProduct = { ...missing, id: 'other-product', productId: 'nl-w1201' as const }
    expect(filter('sent', [missing, otherProduct], [send])).toHaveLength(2)
    expect(filter('needs-email', [missing, otherProduct], [send])).toEqual([])
    expect(filter('unsent', [missing, otherProduct], [send])).toEqual([])
    const voided = { ...send, voided_at: '2026-10-20T02:00:00Z' }
    expect(filter('needs-email', [missing], [voided])).toEqual([missing])
    expect(filter('sent', [missing], [voided])).toEqual([])
  })
  it('does not classify unknown history or private channel contacts as email sends', () => {
    for (const status of ['sent', 'unsent', 'needs-email'] as const) expect(filter(status, [email, missing], null)).toEqual([])
    const key = outreachCompanyKey(missing)
    const records = { [key]: { ...emptyWorkRecord(key), contactLog: [{ id:'form', channel:'form' as const, destination: missing.profile.contactPage!, contactedOn:'2026-10-20', recordedAt:'2026-10-20T01:00:00Z' }] } }
    expect(filterWorkbenchLeads([missing], { ...emptyBusinessFilters, sendStatus: 'needs-email' }, records, [], '2026-10-20')).toEqual([missing])
    expect(developmentEmailVersion(missing, []).email?.body).toContain('Your team formulates industrial protective coatings')
    expect(developmentEmailVersion(missing, []).email?.subject).toBeTruthy()
  })
  it('exposes separate sending, channel and completeness dimensions even when history fails', () => {
    const render = (status: OutreachLedger['status']) => renderToStaticMarkup(createElement(LeadBusinessControls, { leads:[email, missing], filters:emptyBusinessFilters, onChange:()=>{}, work:{status:'ready',records:{},lists:[]} as unknown as LeadWork, ledger:{status,sends:[]} as unknown as OutreachLedger, allCustomerCount:2, allCustomersActive:true, onShowAll:()=>{} }))
    const markup = render('ready')
    for (const label of ['发送记录', '可用联系渠道', '资料完整度']) expect(markup).toContain(`aria-label="${label}"`)
    expect(markup).toContain('未查到发送记录')
    expect(markup).toContain('邮箱待补')
    expect(markup).not.toContain('待补邮箱（未发）')
    expect(render('error')).toMatch(/data-dimension="sendStatus" data-filter="unsent"[^>]*disabled/)
    expect(render('error')).not.toMatch(/data-dimension="completeness" data-filter="needs-email"[^>]*disabled/)
  })
})
