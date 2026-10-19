import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { CompanyBusinessContact, ContactEvidencePanel } from '../src/features/market/ContactEvidencePanel'
import { publicLeads } from '../src/lib/productMarketMap'
import { provedContact } from './fixtures/contactEvidence'

describe('contact evidence presentation', () => {
  it('retains complete source text and verified channels inside compact disclosures', () => {
    const lead = publicLeads.find((lead) => lead.id === 'colorificio-feroni-oppeano')!
    const markup = renderToStaticMarkup(createElement(CompanyBusinessContact, { lead, compactEvidence: true, onEmail: () => {} }))
    expect(markup).toContain('<details class="contact-evidence-row">')
    expect(markup).not.toContain('<details open')
    expect(markup).toContain('mailto:info@feroni.it')
    expect(markup).toContain('公共邮箱来源')
    expect(markup).toContain('公共电话来源')
    expect(markup).toContain('Own current Contact explicitly labels E-mail:')
    expect(markup).toContain(lead.profile.generalEmailEvidence!.verifiedAt)
  })
  it('renders independent identity/channel provenance and keeps unproved mailboxes out of mail links', () => {
    const base = publicLeads.find((lead) => lead.id === 'teknos-helsinki')!
    const lead = { ...base, company: 'Fixture Coatings', profile: { ...base.profile, contacts: [
      provedContact('Fixture Coatings', { name: 'Fixture Buyer' }),
      provedContact('Fixture Coatings', { name: 'Fixture Researcher', title: 'R&D Manager', email: 'researcher@example.org', emailEvidence: undefined, linkedIn: 'https://www.linkedin.com/in/fixture' }),
    ], departmentEmails: [] } }
    const markup = renderToStaticMarkup(createElement(ContactEvidencePanel, { lead, onEmail: () => undefined }))
    expect(markup).toContain('身份已核验')
    expect(markup).toContain('仅领英入口')
    expect(markup).toContain('待补：具名业务邮箱及归属证据')
    expect(markup).toContain('mailto:buyer@example.org')
    expect(markup).not.toContain('mailto:researcher@example.org')
    expect(markup).toContain('https://example.org/team')
    expect(markup).toContain('https://example.org/contact')
    if (process.env.CONTACT_EVIDENCE_PREVIEW === '1') {
      const css = readFileSync('src/styles.css', 'utf8') + '\n' + readFileSync('src/features/market/contactEvidence.css', 'utf8')
      mkdirSync('research/private/contact-evidence-20261014', { recursive: true })
      writeFileSync('research/private/contact-evidence-20261014/contact-preview.html', `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>联系人界面验证</title><style>${css}\nbody{margin:0;background:#f1f5f9;padding:20px}.company-detail{position:static;max-height:none;margin:auto;width:min(920px,100%);padding:20px;box-sizing:border-box}@media(max-width:620px){body{padding:8px}.company-detail{padding:14px}}</style><main class="company-detail"><h2>联系人证据 · 测试预览</h2>${markup}</main></html>`)
    }
  })
})
