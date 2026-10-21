import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { publicLeads, marketProducts, targetCompanyTypes, tdsVerifiedApplications, type PublicLead } from '../src/lib/productMarketMap'
import { canPrepareFirstContact, leadPreparation, preparationFilters } from '../src/lib/leadPreparation'
import { emptyBusinessFilters, emptyWorkRecord, filterWorkbenchLeads } from '../src/lib/leadWorkbench'
import { outreachCompanyKey, type OutreachSend } from '../src/lib/outreachLedger'
import { developmentEmailVersion } from '../src/lib/developmentEmailVersion'
import { createShortDevelopmentEmail } from '../src/lib/shortDevelopmentEmail'
import { createDevelopmentEmailPrompt } from '../src/lib/outreachPrompt'
import { DevelopmentEmailPanel } from '../src/features/market/DevelopmentEmailPanel'
import { LeadPreparationShortcuts } from '../src/features/market/LeadPreparationShortcuts'
import type { OutreachLedger } from '../src/features/market/useOutreachLedger'
import type { LeadWork } from '../src/features/market/useLeadWork'

const lead = publicLeads.find(item => item.id === 'polyvine-cheddar')!
const missingEmail: PublicLead = { ...lead, profile: { ...lead.profile, generalEmail: undefined, departmentEmails: [], contacts: [] } }
const send: OutreachSend = { id: 'fixture', company_key: outreachCompanyKey(lead), company_name: lead.company, lead_id: lead.id, product_id: 'elo', recipient_email: 'fixture@example.org', sent_on: '2026-10-19', sent_by: null, created_at: '2026-10-19T01:00:00Z', voided_at: null }

describe('sending facts and development preparation', () => {
  it('requires a verified recipient, complete qualification and known unsent records for the ready shortcut', () => {
    expect(leadPreparation(lead, [], {})).toBe('ready')
    expect(leadPreparation(missingEmail, [], {})).toBe('needs-email')
    expect(leadPreparation({ ...lead, companyEvidence: { ...lead.companyEvidence, statement: '' } }, [], {})).toBe('review')
    expect(leadPreparation({ ...lead, supplierCompetitorCheck: undefined }, [], {})).toBe('review')
    expect(leadPreparation(lead, [], null)).toBe('review')
    expect(leadPreparation(lead, [], { [send.company_key]: { ...emptyWorkRecord(send.company_key), stage: 'waiting' } })).toBe('review')
  })
  it('treats unreadable ledgers as unknown and preserves active cross-product sends even without a current email', () => {
    expect(leadPreparation(lead, null, {})).toBe('unknown')
    expect(leadPreparation(missingEmail, null, {})).toBe('unknown')
    expect(leadPreparation(missingEmail, [send], {})).toBe('sent')
    expect(leadPreparation(lead, [{ ...send, voided_at: '2026-10-20T00:00:00Z' }], {})).toBe('ready')
  })
  it('applies shortcuts using the same filters as results and clears contradictory queue/send stages', () => {
    const current = { ...emptyBusinessFilters, query: 'polyvine', stage: 'replied', queue: 'priority' as const, sendStatus: 'sent' as const }
    const ready = preparationFilters(current, 'ready')
    expect(ready).toMatchObject({ query: 'polyvine', preparation: 'ready', sendStatus: 'all', stage: 'all', queue: 'all' })
    expect(filterWorkbenchLeads([lead], ready, {}, [], '2026-10-20')).toEqual([lead])
    expect(filterWorkbenchLeads([lead], ready, {}, [send], '2026-10-20')).toEqual([])
    expect(filterWorkbenchLeads([lead], ready, {}, null, '2026-10-20')).toEqual([])
    expect(filterWorkbenchLeads([missingEmail], preparationFilters(current, 'needs-email'), {}, [], '2026-10-20')).toEqual([missingEmail])
    expect(canPrepareFirstContact(missingEmail, [], {})).toBe(true)
    expect(canPrepareFirstContact(missingEmail, [send], {})).toBe(false)
    expect(canPrepareFirstContact(missingEmail, null, {})).toBe(false)
    expect(filterWorkbenchLeads([missingEmail], ready, {}, [], '2026-10-20')).toEqual([missingEmail])
  })
  it('keeps missing-email previews, copy and writing prompts available while preserving sent references', () => {
    expect(developmentEmailVersion(missingEmail, []).email?.body).toContain('Your 2K-POLY86')
    expect(developmentEmailVersion(missingEmail, null).state).toBe('unknown')
    expect(developmentEmailVersion(missingEmail, [send]).email?.text).toBe(createShortDevelopmentEmail(missingEmail, undefined, 'legacy')?.text)
    const markup = renderToStaticMarkup(createElement(DevelopmentEmailPanel, { lead: missingEmail, ledger: { status: 'ready', sends: [] } as unknown as OutreachLedger }))
    expect(markup).toContain('缺邮箱仍可正常复制主题、正文和整封开发信')
    expect(markup).toContain('outreach-email-preview')
    expect(markup.match(/data-copy-part=/g)).toHaveLength(3)
    expect(markup).not.toMatch(/outreach-copy-button[^>]*disabled/)
    expect(markup).toContain('查看原 Prompt')
    expect(createDevelopmentEmailPrompt({ lead: missingEmail, product: marketProducts.find(p => p.id === lead.productId)!, application: tdsVerifiedApplications.find(a => a.id === lead.companyEvidence.applicationId)!, targetType: targetCompanyTypes.find(t => t.id === lead.targetCompanyTypeId)! })).toContain('Company: Polyvine')
  })
  it('counts companies once and exposes unknown as unavailable rather than zero unsent', () => {
    const render = (status: OutreachLedger['status']) => renderToStaticMarkup(createElement(LeadPreparationShortcuts, { leads: [lead, { ...lead, id: 'same-company' }], filters: { ...emptyBusinessFilters }, onChange: () => {}, today: '2026-10-20', ledger: { status, sends: [] } as unknown as OutreachLedger, work: { status: 'ready', records: {} } as unknown as LeadWork }))
    expect(render('ready')).toMatch(/可准备首封<\/span><b>1<\/b>/)
    const unknown = render('error')
    expect(unknown).toContain('发送记录读取失败')
    expect(unknown.match(/data-preparation="[^"]+"[^>]*disabled/g)).toHaveLength(1)
    for (const label of ['发送记录', '可用联系渠道', '资料完整度']) expect(unknown).toContain(`aria-label="${label}"`)
    expect(unknown).toContain('data-dimension="completeness" data-filter="needs-email"')
  })
})
