import { marketExtendedApplications, marketProducts, publicLeads, targetCompanyTypes, tdsVerifiedApplications, type MarketExtendedApplication, type MarketProduct, type PublicLead, type TargetCompanyType, type TdsVerifiedApplication } from './productMarketMap'
import { replaceLeadTimeline, type TimelineRecord } from './leadTimeline'
import { replaceRefreshedLeadFacts, type RefreshedLeadFact } from './publicLeadOverrides'
import { validBriefIntroductionDraft, type CompanyOutreachDraft } from './briefIntroductionDraft'
import { isTaiwanMarket } from './leadMarketScope'

export type PublicLeadSnapshot = {
  schemaVersion: 1; leads: PublicLead[]; timeline: Record<string, TimelineRecord>; facts: Record<string, RefreshedLeadFact>;
  products: MarketProduct[]; tdsApplications: TdsVerifiedApplication[]; extendedApplications: MarketExtendedApplication[]; targetTypes: TargetCompanyType[];
}
const object = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object' && !Array.isArray(value))
const text = (value: unknown): value is string => typeof value === 'string'
const strings = (value: Record<string, unknown>, keys: string[]) => keys.every(key => text(value[key]))
const arrayWithIds = (value: unknown): value is Array<Record<string, unknown> & { id: string }> => Array.isArray(value) && value.every(item => object(item) && text(item.id) && item.id) && new Set(value.map(item => item.id)).size === value.length
const supportedProduct = (value: unknown) => ['fertilizer-coating','nl-w1201','elo','cpp-cpo','nl-8260','nl-h-860'].includes(String(value))

/** Reject an incomplete release before changing any live data or statistics. */
export function validatePublicLeadSnapshot(value: unknown): PublicLeadSnapshot {
  const invalid = () => { throw new Error('客户数据格式不兼容或不完整，请稍后重试；仍有问题时刷新网页。') }
  if (!object(value) || value.schemaVersion !== 1 || !arrayWithIds(value.leads) || !value.leads.length || value.leads.length > 20000
    || !object(value.timeline) || !object(value.facts) || !arrayWithIds(value.products) || !arrayWithIds(value.tdsApplications)
    || !arrayWithIds(value.extendedApplications) || !arrayWithIds(value.targetTypes)) return invalid()
  const ids = new Set(value.leads.map(lead => lead.id))
  const products = new Set(value.products.map(item => item.id))
  if (value.products.length !== 6 || value.products.some(item => !supportedProduct(item.id) || !strings(item,['name','nameEn','color','tdsScope','searchLogic']) || !Array.isArray(item.tdsApplicationIds) || !Array.isArray(item.searchTerms))) return invalid()
  if (value.tdsApplications.some(item => !products.has(String(item.productId)) || !strings(item,['name','nameEn','description','sourceDocument']))
    || value.extendedApplications.some(item => !products.has(String(item.productId)) || !strings(item,['name','nameEn','sourceName','sourceUrl','verifiedAt','basedOnTdsApplicationId']))) return invalid()
  const applications = new Map<string, Record<string,unknown>>([...value.tdsApplications.map(item => [`tds-verified:${item.id}`,item] as const), ...value.extendedApplications.map(item => [`market-extended:${item.id}`,item] as const)])
  const targets = new Map(value.targetTypes.map(item => [item.id,item]))
  if (value.targetTypes.some(item => !strings(item,['name','nameEn','kind']) || !products.has(String(item.productId)) || !Array.isArray(item.applicationReferences)
    || item.applicationReferences.some(ref => !object(ref) || applications.get(`${ref.layer}:${ref.applicationId}`)?.productId !== item.productId))) return invalid()
  for (const lead of value.leads) {
    const profile=lead.profile, evidence=lead.companyEvidence, target=targets.get(String(lead.targetCompanyTypeId))
    if (!strings(lead,['company','country','countryZh','city','demandSideReason','signal','checkedAt','fit']) || !products.has(String(lead.productId))
      || lead.commercialRole !== 'demand_side' || lead.leadEligible !== true || isTaiwanMarket(String(lead.country))
      || typeof lead.latitude !== 'number' || !Number.isFinite(lead.latitude) || Math.abs(lead.latitude)>90 || typeof lead.longitude !== 'number' || !Number.isFinite(lead.longitude) || Math.abs(lead.longitude)>180
      || !object(evidence) || !strings(evidence,['statement','sourceName','sourceUrl','verifiedAt','applicationId','applicationLayer'])
      || applications.get(`${evidence.applicationLayer}:${evidence.applicationId}`)?.productId !== lead.productId || target?.productId !== lead.productId
      || !object(profile) || !Array.isArray(profile.contacts) || !Array.isArray(profile.departmentEmails) || !Array.isArray(profile.sources)
      || !object(lead.source) || !strings(lead.source,['label','url']) || !object(lead.contact) || !text(lead.contact.label)
      || lead.supplierCompetitorCheck !== undefined && (!object(lead.supplierCompetitorCheck) || !strings(lead.supplierCompetitorCheck,['checkedAt','conclusion']))) return invalid()
    if (profile.contacts.some(person => !object(person) || !text(person.name)) || profile.departmentEmails.some(entry => !object(entry) || !strings(entry,['department','email'])) || profile.sources.some(source => !object(source) || !strings(source,['label','url']))) return invalid()
    if (lead.productMatches !== undefined) {
      if (!Array.isArray(lead.productMatches)) return invalid()
      const matchedProducts = new Set<string>()
      for (const match of lead.productMatches) {
        if (!object(match) || !strings(match,['productId','targetCompanyTypeId','demandSideReason','fact','checkedAt','sourceExcerpt','verificationStatus']) || match.verificationStatus !== 'independently-qualified' || !products.has(String(match.productId)) || match.productId === lead.productId || matchedProducts.has(String(match.productId)) || !String(match.fact).trim() || !String(match.sourceExcerpt).trim() || !String(match.demandSideReason).trim() || !/^\d{4}-\d{2}-\d{2}$/.test(String(match.checkedAt))) return invalid()
        if (match.outreachDraft !== undefined || ['nl-8260','nl-h-860'].includes(String(match.productId))) {
          if (!object(match.outreachDraft) || !validBriefIntroductionDraft(match.outreachDraft as unknown as CompanyOutreachDraft, {id:lead.id,productId:match.productId,companyEvidence:match.companyEvidence} as Pick<PublicLead,'id'|'productId'|'companyEvidence'>, String(match.fact))) return invalid()
        }
        matchedProducts.add(String(match.productId))
        const evidence=match.companyEvidence, check=match.supplierCompetitorCheck, target=targets.get(String(match.targetCompanyTypeId))
        if (!object(evidence) || !strings(evidence,['statement','sourceName','sourceUrl','verifiedAt','applicationId','applicationLayer']) || !String(evidence.statement).trim() || !/^https:\/\//.test(String(evidence.sourceUrl)) || !/^\d{4}-\d{2}-\d{2}$/.test(String(evidence.verifiedAt)) || applications.get(`${evidence.applicationLayer}:${evidence.applicationId}`)?.productId !== match.productId || !target || target.productId !== match.productId || target.kind !== 'target' || !Array.isArray(target.applicationReferences) || !target.applicationReferences.some(ref=>object(ref)&&ref.layer===evidence.applicationLayer&&ref.applicationId===evidence.applicationId) || !object(check) || !strings(check,['checkedAt','conclusion']) || !String(check.conclusion).trim() || !/^\d{4}-\d{2}-\d{2}$/.test(String(check.checkedAt)) || !Array.isArray(match.inputReviewSources) || !match.inputReviewSources.length || match.inputReviewSources.some(item=>!object(item)||!strings(item,['label','url'])||!/^https:\/\//.test(String(item.url)))) return invalid()
      }
    }
    const fact=value.facts[lead.id]
    if (lead.outreachDraft !== undefined || ['nl-8260','nl-h-860'].includes(String(lead.productId))) {
      if (!object(lead.outreachDraft) || !object(fact) || !validBriefIntroductionDraft(lead.outreachDraft as unknown as CompanyOutreachDraft, lead as unknown as PublicLead, String(fact.concise ?? fact.email ?? ''))) return invalid()
    }
    if (!object(fact) || fact.statement !== evidence.statement || ['email','concise','business'].some(key => fact[key] !== undefined && !text(fact[key]))) return invalid()
  }
  if (Object.entries(value.timeline).some(([id,record]) => !ids.has(id) || !object(record) || !strings(record,['recordedAt','commit']) || !Number.isFinite(Date.parse(String(record.recordedAt))))) return invalid()
  return value as unknown as PublicLeadSnapshot
}

export async function fetchPublicLeadSnapshot(base: URL, signal: AbortSignal, request: typeof fetch = fetch) {
  const manifestUrl=new URL('customer-data.json',base)
  manifestUrl.searchParams.set('refresh',String(Date.now()))
  const response=await request(manifestUrl,{cache:'no-store',signal,redirect:'error'})
  if (!response.ok) throw new Error('最新客户数据暂不可用，请稍后重试。')
  const manifest: unknown=await response.json()
  if (!object(manifest) || manifest.schemaVersion!==1 || !text(manifest.version) || !/^[a-f0-9]{64}$/.test(manifest.version) || manifest.file!==`customer-data-${manifest.version}.json`) throw new Error('数据版本不兼容，请刷新网页后重试。')
  const dataResponse=await request(new URL(String(manifest.file),base),{cache:'no-store',signal,redirect:'error'})
  if (!dataResponse.ok) throw new Error('客户数据正在更新或读取失败，请稍后重试。')
  const source=await dataResponse.text()
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(source))
  const hash=Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('')
  if (hash!==manifest.version) throw new Error('客户数据校验失败，已保留当前数据，请重试。')
  if (signal.aborted) throw new Error('刷新已取消')
  return validatePublicLeadSnapshot(JSON.parse(source))
}

/** All dependents observe the same snapshot; imported arrays keep their identity. */
export function installPublicLeadSnapshot(snapshot: PublicLeadSnapshot) {
  publicLeads.splice(0,publicLeads.length,...snapshot.leads)
  marketProducts.splice(0,marketProducts.length,...snapshot.products)
  tdsVerifiedApplications.splice(0,tdsVerifiedApplications.length,...snapshot.tdsApplications)
  marketExtendedApplications.splice(0,marketExtendedApplications.length,...snapshot.extendedApplications)
  targetCompanyTypes.splice(0,targetCompanyTypes.length,...snapshot.targetTypes)
  replaceLeadTimeline(snapshot.timeline)
  replaceRefreshedLeadFacts(snapshot.facts)
}
