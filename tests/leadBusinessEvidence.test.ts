import { describe, expect, it } from 'vitest'
import { leadBusinessEvidenceSummary } from '../src/lib/leadBusinessEvidence'
import { publicLeads } from '../src/lib/productMarketMap'

describe('business evidence excerpts', () => {
  it('keeps attribution, technical details and limitations within the original sentence', () => {
    const sentence = '官网说明 W1.5 为水性木材着色剂，用于室内外木材；未确认采购 ELO。'
    expect(leadBusinessEvidenceSummary(`  ${sentence}集团另行核对。  `)).toBe(sentence)
    expect(leadBusinessEvidenceSummary('官网称“仅用于木材。”其余待核验。')).toBe('官网称“仅用于木材。”')
    expect(leadBusinessEvidenceSummary('Series 2.0; no purchase confirmed')).toBe('Series 2.0; no purchase confirmed')
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
