import { marketExtendedApplications, tdsVerifiedApplications, type PublicLead } from './productMarketMap'
import { qualifiedContactCompany } from './contactEvidence'

// Keep the original wording, including attribution, negation and qualifiers.
// A semicolon is not a sentence boundary: its second clause may limit the first.
// Do not split on periods, which may belong to product names, URLs or decimals.
export function leadBusinessEvidenceSummary(statement: string): string {
  const original = statement.trim()
  return original.match(/^[\s\S]*?[。！？][”’」』]?/u)?.[0] ?? original
}

/** Drop reading-process metadata and the repeated card title, keeping a contiguous factual excerpt. */
export function leadBusinessEvidenceBrief(statement: string, company: string) {
  let excerpt = leadBusinessEvidenceSummary(statement)
  const audit = excerpt.match(/^(?:发现后)?(?:本轮)?(?:独立)?(?:再次)?(?:读取|重读|复读|核对|核验|复核)[^。！？：:；;\n]{1,160}[：:]\s*/u)?.[0]
  if (audit && !/未|不|无|仅|限|但|非|尚|待|需求|采购|相容|性能|\b(?:not|no|only|never)\b/iu.test(audit)) excerpt = excerpt.slice(audit.length)
  const name = company.trim()
  if (name && excerpt.startsWith(name)) {
    const remainder = excerpt.slice(name.length)
    if (/^(?:\s|[，,：:]|在|是|为|自|有|拥有|研发|生产|制造|开发|经营|明确|列出|提供|称|表示|未|不|仅|已|目前|现有|当前|专注)/u.test(remainder)) excerpt = remainder.replace(/^[\s，,：:]+/u, '')
  }
  return excerpt
}
/** An existing, qualified application link is an evaluation topic, never a buying signal. */
export function leadBusinessOpportunity(lead: PublicLead) {
  const evidence = lead.companyEvidence
  const application = (evidence.applicationLayer === 'tds-verified' ? tdsVerifiedApplications : marketExtendedApplications).find(item => item.id === evidence.applicationId && item.productId === lead.productId)
  if (!application || !qualifiedContactCompany(lead)) return {
    text: '应用关联待补证据',
    description: '先补齐公司业务及应用关联证据；尚未确认采购或使用。',
  }
  if (evidence.applicationLayer === 'market-extended') return {
    text: `${application.name}待核对`,
    description: `已有独立来源的“${application.name}”仅为应用研究关联，需逐案核对材料评估机会；不代表本品性能已验证、配方相容或真实采购需求。`,
  }
  return {
    text: `可核对${application.name}材料评估`,
    description: `可进一步核对${application.name}相关材料的评估机会；应用关联不代表已确认采购、使用或配方相容性。`,
  }
}
