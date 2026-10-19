import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DevelopmentEmailRecipient } from '../src/features/market/DevelopmentEmailRecipient'
import { publicLeads, type PublicLead } from '../src/lib/productMarketMap'
import { provedContact } from './fixtures/contactEvidence'
import { namedEmailVerified, selectBusinessRecipient } from '../src/lib/contactEvidence'
import { developmentEmailVersion } from '../src/lib/developmentEmailVersion'
import { conciseCompanyFact } from '../src/lib/conciseLeadEmailFacts'
import { leadEmailFacts } from '../src/lib/leadEmailFacts'

const lead = publicLeads.find(item => item.id === 'colorificio-feroni-oppeano')!
const render = (customer: PublicLead) => renderToStaticMarkup(createElement(DevelopmentEmailRecipient, { lead: customer }))
describe('development email recipient matches verified contact selection', () => {
  it('shows the sourced public company email beside the development draft', () => {
    const html = render(lead)
    expect(html).toContain('已核验公司邮箱')
    expect(html).toContain('info@feroni.it')
    expect(html).toContain('非具名负责人邮箱')
    expect(html).toContain(lead.profile.generalEmailEvidence!.sources[0].url)
    expect(html).toContain(lead.profile.generalEmailEvidence!.verifiedAt)
    expect(html).toContain('复制邮箱')
  })
  it('prefers independently sourced named contacts and excludes unproved personal addresses', () => {
    const named = { ...lead, profile: { ...lead.profile, contacts: [provedContact(lead.company)] } }
    const html = render(named)
    expect(html).toContain('buyer@example.org')
    expect(html).toContain('Fixture Buyer · Procurement Manager')
    expect(html).toContain('已核验负责人邮箱')
    expect(html).not.toContain('非具名负责人邮箱')
    const unproved = { ...named, profile: { ...named.profile, contacts: [provedContact(lead.company, { emailEvidence: undefined })] } }
    expect(render(unproved)).not.toContain('buyer@example.org')
    expect(render(unproved)).toContain('info@feroni.it')
    const contact = provedContact(lead.company, { email: 'purchasing@example.org' })
    const department = { ...lead, profile: { ...lead.profile, contacts: [{ ...contact, emailEvidence: { ...contact.emailEvidence!, kind: 'department' as const } }] } }
    expect(render(department)).toContain('已核验部门邮箱')
    expect(render(department)).not.toContain('已核验负责人邮箱')
  })
  it('keeps missing or unqualified recipient states explicit without guessing an email', () => {
    const noEmail = { ...lead, profile: { ...lead.profile, generalEmail: undefined, contacts: [], departmentEmails: [] } }
    expect(render(noEmail)).toContain('暂无可推荐的公开业务邮箱')
    expect(render(noEmail)).not.toContain('复制邮箱')
    expect(render({ ...lead, commercialRole: 'peer_supplier' })).not.toContain('info@feroni.it')
    const legacy = { ...lead, profile: { ...lead.profile, generalEmailEvidence: undefined } }
    expect(render(legacy)).toContain('旧公开来源 · 分项核验待补')
    expect(render(legacy)).toContain('公开邮箱（待分项核验）')
    expect(render(legacy)).not.toContain('建议收件邮箱')
    expect(render(legacy)).not.toContain('邮箱来源已核验')
    expect(render(legacy)).not.toContain('已核验公司邮箱')
    const otherCompanyProof = { ...lead, profile: { ...lead.profile, contacts: [], departmentEmails: [], generalEmailEvidence: { ...lead.profile.generalEmailEvidence!, company: 'Another Company' } } }
    expect(render(otherCompanyProof)).toContain('暂无可推荐的公开业务邮箱')
    expect(render(otherCompanyProof)).not.toContain('info@feroni.it')
  })
  it('keeps every saved customer, company-specific draft and recipient in the same company record', () => {
    const escaped = (text: string) => renderToStaticMarkup(createElement('span', null, text)).slice(6, -7)
    for (const customer of publicLeads) {
      const recipient = selectBusinessRecipient(customer)
      const html = render(customer)
      expect(html, customer.id).not.toContain('建议收件邮箱')
      const draft = developmentEmailVersion(customer, []).email
      if (!recipient) {
        expect(html, customer.id).toContain('暂无可推荐的公开业务邮箱')
        continue
      }
      expect(html, customer.id).toContain(escaped(`收件公司：${customer.company}`))
      expect(html, customer.id).toContain(`value="${escaped(recipient.email)}"`)
      const ownAddresses = [customer.profile.generalEmail, ...customer.profile.contacts.map(contact => contact.email), ...customer.profile.departmentEmails.map(item => item.email)]
      expect(ownAddresses, customer.id).toContain(recipient.email)
      const ownSources = [customer.profile.contactPage, customer.profile.website, ...customer.profile.generalEmailEvidence?.sources.map(source => source.url) ?? [], ...customer.profile.contacts.flatMap(contact => contact.emailEvidence?.sources.map(source => source.url) ?? []), ...customer.profile.departmentEmails.flatMap(item => item.emailEvidence?.sources.map(source => source.url) ?? [item.source?.url])]
      expect(ownSources, customer.id).toContain(recipient.sourceUrl)
      const greeting = recipient.name ? recipient.name.trim().split(/\s+/)[0] : `${customer.company} Team`
      if (recipient.name) expect(customer.profile.contacts.some(contact => contact.name === recipient.name && contact.email === recipient.email && namedEmailVerified(customer.company, contact)), customer.id).toBe(true)
      if (draft) {
        expect(draft.body, customer.id).toContain(`Hi ${greeting},`)
        expect(draft.body, customer.id).toContain(conciseCompanyFact(customer.id))
        expect(draft.evidenceUrl, customer.id).toBe(customer.companyEvidence.sourceUrl)
        expect(draft.text, customer.id).toBe(`Subject: ${draft.subject}\n\n${draft.body}`)
      }
      const reference = developmentEmailVersion(customer, null).email
      if (reference) {
        expect(reference.body, customer.id).toContain(`Hi ${greeting},`)
        expect(reference.body, customer.id).toContain(leadEmailFacts[customer.id])
        expect(reference.evidenceUrl, customer.id).toBe(customer.companyEvidence.sourceUrl)
      }
    }
  })
})
