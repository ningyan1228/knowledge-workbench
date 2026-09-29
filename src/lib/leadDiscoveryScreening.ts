import type { MarketExtendedApplication, PublicLead, TargetCompanyType, TdsVerifiedApplication } from './productMarketMap'

// This is an internal research inbox, not Company Candidate, Lead, CRM, or
// the public map. Screening can never set commercial_role or lead_eligible.
export type DiscoveryInput = {
  companyName: string
  country: string
  productId: PublicLead['productId']
  website?: string
  discoveredAt: string
  discoverySource: { name: string; url: string }
  application?: { layer: 'tds-verified' | 'market-extended'; id: string }
  targetCompanyTypeId?: string
  companyEvidence?: { summary: string; sourceName: string; sourceUrl: string; verifiedAt: string }
  demandSideReason?: string
  supplierCheck?: { sellsSimilarRawMaterial: boolean; note: string; sourceUrl: string; checkedAt: string }
  contact?: { contactPage?: string; generalEmail?: string; sourceUrl?: string; verifiedAt?: string }
}

export type DiscoveryStatus = 'invalid' | 'excluded' | 'duplicate' | 'possible_duplicate' | 'needs_evidence' | 'ready_for_review'
export type DiscoveryResult = {
  candidate: DiscoveryInput
  status: DiscoveryStatus
  reasons: string[]
  matchedCompany?: string
}
export type DiscoveryQueueEntry = DiscoveryResult & { screenedAt: string }

type ScreeningReferences = {
  leads: PublicLead[]
  queue: DiscoveryQueueEntry[]
  tdsApplications: TdsVerifiedApplication[]
  marketExtensions: MarketExtendedApplication[]
  targetTypes: TargetCompanyType[]
}

const datePattern = /^\d{4}-\d{2}-\d{2}$/
const validDate = (value?: string) => {
  if (!value || !datePattern.test(value)) return false
  const parsed = Date.parse(`${value}T00:00:00Z`)
  return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 10) === value
}
const validHttps = (value?: string) => {
  if (!value) return false
  try { return new URL(value).protocol === 'https:' } catch { return false }
}

export function normalizeCompanyName(value: string) {
  let name = value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
    .replace(/&/g, ' and ').replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
  for (let previous = ''; name !== previous;) {
    previous = name
    name = name.replace(/\s+(?:inc|incorporated|llc|ltd|limited|bv|gmbh|srl|sa|pvt|private|sdn bhd|co ltd)$/u, '').trim()
  }
  return name
}

export function websiteHost(value?: string) {
  if (!value) return undefined
  try { return new URL(value).hostname.toLowerCase().replace(/^www\./, '') } catch { return undefined }
}

function companyKey(productId: string, country: string, companyName: string) {
  return `${productId}|${country.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().trim()}|${normalizeCompanyName(companyName)}`
}

function isMainlandChina(country: string) {
  return /^(china|mainland china|china mainland|people'?s republic of china|prc|中国|中国大陆|中华人民共和国)$/i.test(country.trim())
}

function checkMissingEvidence(candidate: DiscoveryInput, refs: ScreeningReferences) {
  const missing: string[] = []
  const application = candidate.application
  const verifiedApplication = application?.layer === 'tds-verified'
    ? refs.tdsApplications.find((item) => item.id === application.id && item.productId === candidate.productId)
    : refs.marketExtensions.find((item) => item.id === application?.id && item.productId === candidate.productId)
  if (!verifiedApplication) missing.push('缺少与产品匹配的 TDS 应用或有来源的市场扩展应用')
  if (application?.layer === 'market-extended' && verifiedApplication &&
    (!validHttps((verifiedApplication as MarketExtendedApplication).sourceUrl)
      || !(verifiedApplication as MarketExtendedApplication).sourceName
      || !validDate((verifiedApplication as MarketExtendedApplication).verifiedAt))) {
    missing.push('市场扩展应用缺少独立来源及核验日期')
  }
  const targetType = refs.targetTypes.find((item) => item.id === candidate.targetCompanyTypeId && item.productId === candidate.productId && item.kind === 'target')
  if (!targetType || !application || !targetType.applicationReferences.some((item) => item.layer === application.layer && item.applicationId === application.id)) {
    missing.push('缺少与该应用相连的目标公司类型')
  }
  const evidence = candidate.companyEvidence
  if (!evidence?.summary?.trim() || !evidence.sourceName?.trim() || !validHttps(evidence.sourceUrl) || !validDate(evidence.verifiedAt)) {
    missing.push('缺少公司下游制造/配方的公开证据、来源或核验日期')
  }
  if (candidate.productId === 'elo' && evidence?.summary && !/anti.?corrosion|protective coating|heavy.?duty|marine coating|pipeline coating|anticorros|防腐|重防腐/i.test(evidence.summary)) {
    missing.push('当前 ELO 方向缺少该公司研发或生产重防腐涂料的明确证据')
  }
  if (!candidate.demandSideReason?.trim()) missing.push('缺少 demand_side_reason')
  const check = candidate.supplierCheck
  if (!check || !check.note?.trim() || !validHttps(check.sourceUrl) || !validDate(check.checkedAt)) {
    missing.push('同类原料供应商/竞争对手排除检查尚未附公开来源')
  }
  const contact = candidate.contact
  if (!contact || (!validHttps(contact.contactPage) && !(contact.generalEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.generalEmail)
    && validHttps(contact.sourceUrl) && validDate(contact.verifiedAt)))) {
    missing.push('缺少可追溯的官网 Contact Page 或公开业务邮箱')
  }
  return missing
}

export function screenDiscoveryBatch(candidates: DiscoveryInput[], refs: ScreeningReferences): DiscoveryResult[] {
  const knownNames = new Map<string, string>()
  const knownHosts = new Map<string, string>()
  for (const lead of refs.leads) {
    knownNames.set(companyKey(lead.productId, lead.country, lead.company), lead.company)
    const host = websiteHost(lead.profile.website)
    if (host) knownHosts.set(host, lead.company)
  }
  for (const entry of refs.queue) {
    const item = entry.candidate
    knownNames.set(companyKey(item.productId, item.country, item.companyName), item.companyName)
    const host = websiteHost(item.website)
    if (host) knownHosts.set(host, item.companyName)
  }

  return candidates.map((candidate) => {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
      return { candidate, status: 'invalid', reasons: ['发现记录必须是对象'] }
    }
    const reasons: string[] = []
    const validInput = candidate.companyName?.trim() && candidate.country?.trim()
      && normalizeCompanyName(candidate.companyName)
      && ['fertilizer-coating', 'nl-w1201', 'elo'].includes(candidate.productId)
      && validDate(candidate.discoveredAt) && candidate.discoverySource?.name?.trim()
      && validHttps(candidate.discoverySource?.url)
    if (!validInput || (candidate.website && !validHttps(candidate.website))) {
      return { candidate, status: 'invalid', reasons: ['基础公司、国家、产品、发现来源、日期或官网 URL 无效'] }
    }
    if (isMainlandChina(candidate.country)) {
      return { candidate, status: 'excluded', reasons: ['中国大陆企业不进入海外客户研究队列'] }
    }
    if (candidate.productId === 'elo' && candidate.application && !['coatings', 'elo-anticorrosion-coating-research'].includes(candidate.application.id)) {
      return { candidate, status: 'excluded', reasons: ['按当前开发方向，新的 ELO 研究只聚焦重防腐涂料制造/配方企业'] }
    }
    const check = candidate.supplierCheck
    if (check?.sellsSimilarRawMaterial && validHttps(check.sourceUrl) && validDate(check.checkedAt)) {
      return { candidate, status: 'excluded', reasons: ['公开来源显示其销售同类原料；供给侧排除'] }
    }
    const nameKey = companyKey(candidate.productId, candidate.country, candidate.companyName)
    const exactMatch = knownNames.get(nameKey)
    if (exactMatch) return { candidate, status: 'duplicate', reasons: ['同产品、同国家的公司名称已收录或已在研究队列中'], matchedCompany: exactMatch }

    const host = websiteHost(candidate.website)
    const hostMatch = host && knownHosts.get(host)
    if (hostMatch) reasons.push('官网域名与现有记录相同；需人工确认是否为不同事业部/工厂')
    reasons.push(...checkMissingEvidence(candidate, refs))
    if (check?.sellsSimilarRawMaterial) reasons.push('有供给侧迹象但来源尚不足；禁止进入客户地图')
    const status: DiscoveryStatus = hostMatch ? 'possible_duplicate' : reasons.length ? 'needs_evidence' : 'ready_for_review'
    // Even a complete record remains a research item until a human verifies it.
    knownNames.set(nameKey, candidate.companyName)
    if (host) knownHosts.set(host, candidate.companyName)
    return { candidate, status, reasons, ...(hostMatch ? { matchedCompany: hostMatch } : {}) }
  })
}
