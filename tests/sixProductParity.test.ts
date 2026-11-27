import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { marketProducts, publicLeads, tdsVerifiedApplications, targetCompanyTypes, type PublicLead, type VerifiedProductMatch } from '../src/lib/productMarketMap'
import { products } from '../src/lib/demoData'
import { buildBriefIntroductionDraft } from '../src/lib/briefIntroductionDraft'
import { createDevelopmentEmailPrompt } from '../src/lib/outreachPrompt'
import { suppliedTds } from '../src/lib/waterborneProductCatalog'
import { getProductChapter } from '../src/lib/productHandbook'
import { ProductHandbook } from '../src/features/products/ProductHandbook'
import { leadForProduct, leadsForProduct, matchedProductIds } from '../src/lib/leadProductMatches'
import { createShortDevelopmentEmail } from '../src/lib/shortDevelopmentEmail'
import { developmentEmailVersion } from '../src/lib/developmentEmailVersion'
import { firstContactPlan, firstContactExport } from '../src/lib/customerDevelopment'
import { outreachCompanyKey, type OutreachSend } from '../src/lib/outreachLedger'
import { validatePublicLeadSnapshot } from '../src/lib/publicLeadSnapshot'

// Artificial additional-product evidence for flow tests only; never public customer data.
const match: VerifiedProductMatch = { productId:'nl-8260', targetCompanyTypeId:'nl8260-pp-opp-inks-manufacturer', companyEvidence:{applicationLayer:'tds-verified',applicationId:'nl8260-pp-opp-inks',statement:'Synthetic test fixture for own PP ink formulation.',sourceName:'Test-only company page',sourceUrl:'https://fixture.example.org/pp-ink',verifiedAt:'2026-11-27'}, supplierCompetitorCheck:{checkedAt:'2026-11-27',conclusion:'Synthetic test-only finite input exclusion.'}, demandSideReason:'Test-only downstream formulation evidence.', fact:'Your test printing ink is manufactured for PP films and oriented polypropylene packaging.', checkedAt:'2026-11-27',sourceExcerpt:'Test-only PP printing ink formulation.',inputReviewSources:[{label:'Test-only catalogue',url:'https://fixture.example.org/catalogue'}],verificationStatus:'independently-qualified' }
const original = publicLeads.find(lead=>lead.id==='proell-weissenburg')!
const base: PublicLead = {...original, productMatches:[match]}
const projected = () => leadForProduct(base,'nl-8260')!

describe('six products and additional matches share the same customer workflow',()=>{
  it('provides six products, twelve new sourced application chains and original TDS downloads',()=>{
    expect(marketProducts.map(p=>p.id).sort()).toEqual(['cpp-cpo','elo','fertilizer-coating','nl-8260','nl-h-860','nl-w1201'])
    for(const id of ['nl-8260','nl-h-860'] as const){
      const product=products.find(p=>p.id===id)!
      expect(product.specs.length).toBeGreaterThanOrEqual(8)
      expect(product.reviewTasks.length).toBeGreaterThan(0)
      expect(tdsVerifiedApplications.filter(app=>app.productId===id)).toHaveLength(6)
      expect(targetCompanyTypes.filter(t=>t.productId===id&&t.kind==='target')).toHaveLength(6)
      expect(getProductChapter(id)?.body).toContain(id.toUpperCase())
      const html=renderToStaticMarkup(createElement(ProductHandbook,{productId:id}))
      expect(html).toContain(suppliedTds[id].file)
      expect(html).toContain('下载原始文件')
      expect(createHash('sha256').update(readFileSync('public/'+suppliedTds[id].file)).digest('hex')).toBe(suppliedTds[id].sha256)
    }
    expect(products.find(p=>p.id==='nl-8260')!.specs.find(s=>s.name==='固含')?.originalValue).toBe('30±1%')
    expect(products.find(p=>p.id==='nl-h-860')!.specs.find(s=>s.name==='固含')?.originalValue).toBe('60±2%')
  })
  it('filters a verified second product without adding or mutating a company',()=>{
    const before=structuredClone(base),lead=projected()
    expect(leadsForProduct([base],'all')).toEqual([base])
    expect(leadsForProduct([base],'nl-8260')).toHaveLength(1)
    expect(lead.id).toBe(base.id)
    expect(outreachCompanyKey(lead)).toBe(outreachCompanyKey(base))
    expect(matchedProductIds(lead)).toEqual(['cpp-cpo','nl-8260'])
    expect(lead.profile).toBe(base.profile)
    expect(base).toEqual(before)
    expect(leadForProduct(base,'nl-h-860')).toBeNull()
  })
  it('uses the selected product fact consistently in unsent preview, copy text and email export',()=>{
    const lead=projected(),version=developmentEmailVersion(lead,[]),plan=firstContactPlan([lead],[],20,'2026-11-27')
    expect(version.email?.body).toContain(match.fact)
    expect(version.email?.body).toContain('NL-8260')
    expect(version.email?.body).not.toMatch(/MAH-modified|ELO|forward/i)
    expect(version.email?.subject).toBe('waterborne chlorinated polyolefin adhesion promoter — a brief introduction')
    expect(version.email?.body).toContain('could you point me to the right person?')
    expect(version.email?.body).toContain('review its TDS for an initial evaluation?')
    expect(version.email?.body).toContain('Email: zhiwu@neonlion.cn')
    expect(version.email!.body.split(/\s+/).length).toBeGreaterThanOrEqual(55)
    expect(version.email!.body.split(/\s+/).length).toBeLessThanOrEqual(95)
    expect(plan.batch).toHaveLength(1)
    expect(plan.batch[0].email.text).toBe(version.email!.text)
    expect(firstContactExport(plan.batch)).toContain(match.companyEvidence.sourceUrl)
    expect(firstContactPlan([base,lead],[],20,'2026-11-27').batch).toHaveLength(1)
  })
  it('preserves primary reference text for a shared sent or unknown state across products',()=>{
    const lead=projected(),legacy=createShortDevelopmentEmail(base,undefined,'legacy')
    const sent: OutreachSend={id:'fixture',company_key:outreachCompanyKey(base),company_name:base.company,lead_id:base.id,product_id:'elo',recipient_email:'fixture@example.org',sent_on:'2026-11-27',sent_by:null,created_at:'2026-11-27T00:00:00Z',voided_at:null}
    expect(developmentEmailVersion(lead,[sent]).email).toEqual(legacy)
    expect(developmentEmailVersion(lead,null).email).toEqual(legacy)
    expect(firstContactPlan([lead],[sent]).batch).toHaveLength(0)
    expect(firstContactPlan([lead],null).batch).toHaveLength(0)
  })
  it('supports NL-H-860 water-based ink evaluation without copying NL-8260 claims',()=>{
    const second: VerifiedProductMatch={...match,productId:'nl-h-860',targetCompanyTypeId:'nlh860-waterborne-inks-manufacturer',companyEvidence:{...match.companyEvidence,applicationId:'nlh860-waterborne-inks'},fact:'Your test water-based inks are formulated and manufactured for industrial printing applications.'}
    const lead=leadForProduct({...original,productMatches:[second]},'nl-h-860')!
    const email=developmentEmailVersion(lead,[]).email!
    expect(email.body).toContain('NL-H-860')
    expect(email.body).toContain('wetting and penetration trials')
    expect(email.body).not.toMatch(/30±1|12–24|MAH-modified|guarantee|halogen.free/i)
  })
  it('keeps public-contact-page-only matches draftable and out of email batches',()=>{
    const noEmail: PublicLead={...base,contact:{label:'Official public contact page',contactUrl:base.profile.contactPage},profile:{...base.profile,generalEmail:undefined,generalEmailEvidence:undefined,contacts:[],departmentEmails:[]}}
    const lead=leadForProduct(noEmail,'nl-8260')!
    expect(developmentEmailVersion(lead,[]).email?.body).toContain(match.fact)
    expect(firstContactPlan([lead],[]).batch).toHaveLength(0)
  })
  it('accepts persisted independently qualified matches and keeps the copied prompt in the same format',()=>{
    const snapshot=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','scripts/export-public-lead-data.mjs'],{encoding:'utf8',maxBuffer:16*1024*1024}))
    expect(validatePublicLeadSnapshot(snapshot).leads.length).toBe(publicLeads.length)
    const lead=publicLeads.find(item=>item.id==='isonic-ink-vapi')!
    const email=createShortDevelopmentEmail(lead)!
    expect(lead.outreachDraft?.body).toBe(email.body)
    const prompt=createDevelopmentEmailPrompt({lead, product:marketProducts.find(p=>p.id===lead.productId)!, application:tdsVerifiedApplications.find(a=>a.id===lead.companyEvidence.applicationId)!,targetType:targetCompanyTypes.find(t=>t.id===lead.targetCompanyTypeId)!})
    expect(prompt).toContain(email.text)
    expect(prompt).toContain('referral request')
    expect(prompt).not.toContain('do not ask the reader to')
  })
  it.each(['pending','wrong-product','duplicate','no-excerpt','no-input-review','no-draft','wrong-draft-company','wrong-draft-product'])('rejects %s additional matches before installing a snapshot',kind=>{
    const snapshot=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','scripts/export-public-lead-data.mjs'],{encoding:'utf8',maxBuffer:16*1024*1024}))
    const lead=snapshot.leads.find((item:PublicLead)=>item.id===original.id)
    lead.productMatches=[{...structuredClone(match),outreachDraft:buildBriefIntroductionDraft({...original,...match},match.fact)}]
    if(kind==='no-draft')delete lead.productMatches[0].outreachDraft
    if(kind==='wrong-draft-company')lead.productMatches[0].outreachDraft.companyId='another-company'
    if(kind==='wrong-draft-product')lead.productMatches[0].outreachDraft.productId='elo'
    if(kind==='pending')lead.productMatches[0].verificationStatus='ready_for_review'
    if(kind==='wrong-product')lead.productMatches[0].companyEvidence.applicationId='nlh860-waterborne-inks'
    if(kind==='duplicate')lead.productMatches.push(structuredClone(match))
    if(kind==='no-excerpt')lead.productMatches[0].sourceExcerpt=''
    if(kind==='no-input-review')lead.productMatches[0].inputReviewSources=[]
    expect(()=>validatePublicLeadSnapshot(snapshot)).toThrow()
    expect(original.productMatches).toBeUndefined()
  })
})
