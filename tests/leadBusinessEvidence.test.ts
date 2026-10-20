import { describe, expect, it } from 'vitest'
import { leadBusinessEvidenceSummary, leadBusinessEvidenceBrief, leadBusinessOpportunity } from '../src/lib/leadBusinessEvidence'
import { publicLeads } from '../src/lib/productMarketMap'

describe('business evidence excerpts', () => {
  it('skips audit-only prefixes and repeated company names without rewriting factual qualifications', () => {
    expect(leadBusinessEvidenceBrief('独立读取当前首页、About 和 Contact 全文：Example Paint 在自有工厂制造涂料；未确认采购。另有资料。', 'Example Paint')).toBe('在自有工厂制造涂料；未确认采购。')
    const limited = '独立核验未确认自产：仅提供施工服务，不能推定制造。'
    expect(leadBusinessEvidenceBrief(limited, 'Example Paint')).toBe(limited)
    expect(leadBusinessEvidenceBrief('Example Paint 未确认自有工厂；仅说明代工合作。', 'Example Paint')).toBe('未确认自有工厂；仅说明代工合作。')
    expect(leadBusinessEvidenceBrief('Example Painter 是另一家公司。', 'Example Paint')).toBe('Example Painter 是另一家公司。')
    for (const lead of publicLeads) {
      const excerpt = leadBusinessEvidenceBrief(lead.companyEvidence.statement, lead.company)
      expect(excerpt, lead.id).not.toBe('')
      expect(lead.companyEvidence.statement.includes(excerpt), lead.id).toBe(true)
    }
  })
  it('keeps attribution, technical details and limitations within the original sentence', () => {
    const sentence = '官网说明 W1.5 为水性木材着色剂，用于室内外木材；未确认采购 ELO。'
    expect(leadBusinessEvidenceSummary(`  ${sentence}集团另行核对。  `)).toBe(sentence)
    expect(leadBusinessEvidenceSummary('官网称“仅用于木材。”其余待核验。')).toBe('官网称“仅用于木材。”')
    expect(leadBusinessEvidenceSummary('Series 2.0; no purchase confirmed')).toBe('Series 2.0; no purchase confirmed')
  })

  it('uses only the saved qualified application as a potential evaluation topic', () => {
    const wood = publicLeads.find(lead => lead.id === 'polyvine-cheddar')!
    expect(leadBusinessOpportunity(wood)).toMatchObject({ text: '可核对木材表面处理材料评估' })
    expect(leadBusinessOpportunity(wood).description).toContain('不代表已确认采购、使用或配方相容性')
    expect(leadBusinessOpportunity({ ...wood, productId: 'elo' }).text).toBe('应用关联待补证据')
    expect(leadBusinessOpportunity({ ...wood, supplierCompetitorCheck: undefined }).text).toBe('应用关联待补证据')
    expect(leadBusinessOpportunity({ ...wood, companyEvidence: { ...wood.companyEvidence, statement: '' } }).text).toBe('应用关联待补证据')
    const research = publicLeads.find(lead => lead.companyEvidence.applicationId === 'elo-anticorrosion-coating-research' && lead.supplierCompetitorCheck)!
    expect(research).toBeDefined()
    expect(leadBusinessOpportunity(research).text).toContain('待核对')
    expect(leadBusinessOpportunity(research).description).toContain('不代表本品性能已验证')
  })

  it('uses only a contiguous excerpt of each published company’s own evidence', () => {
    for (const lead of publicLeads) {
      const summary = leadBusinessEvidenceSummary(lead.companyEvidence.statement)
      expect(summary, lead.id).not.toBe('')
      expect(lead.companyEvidence.statement.trim().startsWith(summary), lead.id).toBe(true)
    }
    const examples = publicLeads.slice(0, 10).map(lead => leadBusinessEvidenceSummary(lead.companyEvidence.statement))
    expect(new Set(examples).size).toBeGreaterThan(1)
  })
})
