import { describe, expect, it } from 'vitest'
import { products } from '../src/lib/demoData'
import { getProductChapter } from '../src/lib/productHandbook'
import { sourceCatalog } from '../src/lib/workspace'
import { publicLeads } from '../src/lib/productMarketMap'
import { developmentEmailVersion } from '../src/lib/developmentEmailVersion'
import { firstContactPlan, firstContactExport } from '../src/lib/customerDevelopment'
import { outreachCompanyKey, type OutreachSend } from '../src/lib/outreachLedger'
import { leadCardBrief } from '../src/lib/leadCardBrief'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ProductHandbook } from '../src/features/products/ProductHandbook'

const lead = publicLeads.find(x => x.id === 'proell-weissenburg')!
describe('CPP product and admitted customer parity', () => {
  it('provides product learning, seven conditioned grades and a research source', () => {
    const product=products.find(x=>x.id==='cpp-cpo')!
    expect(product.specs).toHaveLength(7)
    expect(product.specs.every(x=>x.condition && x.reviewStatus==='needs_review')).toBe(true)
    expect(product.reviewTasks.length).toBeGreaterThan(0)
    expect(getProductChapter(product.id)?.body).toContain('NL-MD100-20')
    expect(sourceCatalog.some(x=>x.productKey===product.id)).toBe(true)
    const html=renderToStaticMarkup(createElement(ProductHandbook,{productId:product.id}))
    expect(html).toContain('NL-MS300')
    expect(html).toContain('下载完整学习手册')
  })
  it('renders sourced facts and the same concise draft for preview and batch export', () => {
    const version=developmentEmailVersion(lead,[])
    expect(version.state).toBe('unsent')
    expect(version.email?.body).toContain('Norifin PP N')
    expect(version.email?.body).toContain('MAH-modified CPP/CPO')
    const words=version.email!.body.split(/\s+/).length
    expect(words).toBeGreaterThanOrEqual(55)
    expect(words).toBeLessThanOrEqual(95)
    expect(version.email!.body).not.toMatch(/point me|forward|guarantee|Who handles/i)
    expect(leadCardBrief(lead).fact).toContain('Norifin PP N')
    const plan=firstContactPlan([lead],[],20,'2026-11-02')
    expect(plan.batch).toHaveLength(1)
    expect(plan.batch[0].email.text).toBe(version.email!.text)
    expect(firstContactExport(plan.batch)).toContain('info@proell.de')
    expect(firstContactExport(plan.batch)).toContain('/en/info/imprint.html')
  })
  it('does not export on unknown or sent state, including a cross-product sent record', () => {
    expect(developmentEmailVersion(lead,null).state).toBe('unknown')
    expect(firstContactPlan([lead],null).batch).toHaveLength(0)
    const sent: OutreachSend={id:'fixture',company_key:outreachCompanyKey(lead),company_name:lead.company,lead_id:lead.id,product_id:'elo',recipient_email:'info@proell.de',sent_on:'2026-11-02',sent_by:null,created_at:'2026-11-02T01:00:00Z',voided_at:null}
    expect(developmentEmailVersion(lead,[sent]).state).toBe('sent')
    expect(firstContactPlan([lead],[sent]).batch).toHaveLength(0)
  })
  it('keeps a contact-page-only prospect draftable but out of email batches', () => {
    const noEmail={...lead,contact:{label:'Official contact page',contactUrl:lead.profile.contactPage},profile:{...lead.profile,generalEmail:undefined,generalEmailEvidence:undefined}}
    expect(developmentEmailVersion(noEmail,[]).email?.body).toContain('Norifin PP N')
    expect(firstContactPlan([noEmail],[]).batch).toHaveLength(0)
  })
})
