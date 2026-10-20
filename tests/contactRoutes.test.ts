import { describe, expect, it } from 'vitest'
import { customerContactRoutes, latestContact, normalizeContactLog, officialWhatsAppUrl, professionalLinkedInUrl } from '../src/lib/contactRoutes'
import { publicLeads } from '../src/lib/productMarketMap'
import { createShortDevelopmentEmail } from '../src/lib/shortDevelopmentEmail'
import { developmentEmailVersion } from '../src/lib/developmentEmailVersion'
import { firstContactPlan } from '../src/lib/customerDevelopment'
import { emptyWorkRecord, effectiveStage, normalizeWorkRecord } from '../src/lib/leadWorkbench'
import { outreachCompanyKey } from '../src/lib/outreachLedger'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { DevelopmentEmailPanel } from '../src/features/market/DevelopmentEmailPanel'
import type { OutreachLedger } from '../src/features/market/useOutreachLedger'

const lead=publicLeads.find(lead=>lead.id==='aexcel-mentor')!
const entry={id:'fixture',channel:'form' as const,destination:'https://www.aexcelcorp.com/contact-us/',contactedOn:'2026-10-20',recordedAt:'2026-10-20T01:00:00Z'}
describe('contact routes and drafts independent of an inbox',()=>{
 it('keeps company-specific drafts and copy controls available without inventing an email',()=>{
  const version=developmentEmailVersion(lead,[])
  expect(version.email?.body).toContain('Your team formulates industrial protective coatings')
  expect(version.label).toBe('简洁首封 · 未记录发送')
  expect(createShortDevelopmentEmail(lead)).not.toBeNull()
  const html=renderToStaticMarkup(createElement(DevelopmentEmailPanel,{lead,ledger:{status:'ready',sends:[]} as unknown as OutreachLedger}))
  expect(html).toContain('尚未取得已核验的收件邮箱')
  expect(html).toContain('官网联系页／表单入口')
  expect(html).toContain('data-copy-part="body"')
  expect(html).toContain('outreach-email-preview')
  expect(html).toContain('查看原 Prompt')
  expect(html).not.toContain('mailto:')
 })
 it('does not infer WhatsApp from a business phone or accept spoofed social URLs',()=>{
  expect(customerContactRoutes(lead).phone).toBeTruthy()
  expect(customerContactRoutes(lead).whatsapp).toBeUndefined()
  expect(officialWhatsAppUrl('https://wa.me/5516997936989')).toBe('https://wa.me/5516997936989')
  for(const value of ['tel:+12345','https://wa.me.evil.org/123','javascript:alert(1)','https://evil.org/whatsapp'])expect(officialWhatsAppUrl(value)).toBeUndefined()
  expect(professionalLinkedInUrl('https://www.linkedin.com/company/example')).toBeTruthy()
  expect(professionalLinkedInUrl('https://linkedin.com.evil.org/company/example')).toBeUndefined()
 })
 it('persists channel history across other private edits, while keeping it distinct from email sending',()=>{
  const record=normalizeWorkRecord({...emptyWorkRecord(outreachCompanyKey(lead)),contactLog:[entry]},outreachCompanyKey(lead))
  expect(record.contactLog).toEqual([entry])
  expect(normalizeWorkRecord({...record,note:'new note',favorite:true},record.companyKey).contactLog).toEqual([entry])
  expect(effectiveStage(lead,{[record.companyKey]:record},[])).toBe('waiting')
  expect(developmentEmailVersion(lead,[]).state).toBe('unsent')
  expect(latestContact([{...entry,voidedAt:'2026-10-20T02:00:00Z'}])).toBeUndefined()
  expect(normalizeContactLog([{...entry,contactedOn:'2026-02-31'}])).toEqual([])
 })
 it('keeps email batches restricted to real inboxes and excludes private prior contact across products',()=>{
  expect(firstContactPlan([lead],[],10,'2026-10-20',false).batch).toEqual([])
  const withEmail=publicLeads.find(lead=>lead.id==='colorificio-feroni-oppeano')!
  const key=outreachCompanyKey(withEmail),record={...emptyWorkRecord(key),contactLog:[entry]}
  expect(firstContactPlan([withEmail],[],10,'2026-10-20',false,{[key]:record}).batch).toEqual([])
  expect(firstContactPlan([withEmail],[],10,'2026-10-20',false,null).batch).toEqual([])
  expect(firstContactPlan([withEmail],[],10,'2026-10-20',false,{[key]:{...record,contactLog:[{...entry,voidedAt:'2026-10-20T02:00:00Z'}]}}).batch).toHaveLength(1)
 })
})
