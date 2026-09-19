import { describe, expect, it } from 'vitest'
import { products } from '../src/lib/demoData'
import { insufficientEvidenceReply, isCustomerFacingClaimAllowed } from '../src/lib/qa'

describe('customer-facing safety rules', () => {
  it('does not turn an unapproved extracted value into a customer claim', () => {
    expect(isCustomerFacingClaimAllowed({ reviewStatus: 'needs_review', scope: 'own_product', citationCount: 1 })).toBe(false)
    expect(isCustomerFacingClaimAllowed({ reviewStatus: 'approved', scope: 'external_product', citationCount: 1 })).toBe(false)
    expect(isCustomerFacingClaimAllowed({ reviewStatus: 'approved', scope: 'own_product', citationCount: 0 })).toBe(false)
    expect(isCustomerFacingClaimAllowed({ reviewStatus: 'approved', scope: 'own_product', citationCount: 2 })).toBe(true)
  })

  it('uses a transparent evidence-insufficient fallback with no invented citation', () => {
    const reply = insufficientEvidenceReply(products[0], '商务邮件')
    expect(reply).toContain('不能确认性能、认证、适用性或运输属性')
    expect(reply).toContain('引用：暂无')
    expect(reply).toContain('substrate')
  })
})
