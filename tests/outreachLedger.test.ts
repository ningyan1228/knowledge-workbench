import { describe, expect, it } from 'vitest'
import { activeOutreachSend, localDateToday, outreachCompanyKey, validOutreachEmail, type OutreachSend } from '../src/lib/outreachLedger'
import { publicLeads } from '../src/lib/productMarketMap'

const company = { company: 'Haifa Group', country: 'Israel' }
const sample: OutreachSend = {
  id: 'sent-1', company_key: outreachCompanyKey(company), company_name: company.company,
  lead_id: 'haifa-israel', product_id: 'fertilizer-coating', recipient_email: 'info@haifa-group.com',
  sent_on: '2026-09-25', sent_by: 'user-1', created_at: '2026-09-25T10:00:00Z', voided_at: null,
}

describe('shared outbound send ledger', () => {
  it('normalizes the company identity independently of product and punctuation', () => {
    expect(outreachCompanyKey(company)).toBe(outreachCompanyKey({ company: ' HAIFA GROUP ', country: 'Israel' }))
    expect(outreachCompanyKey(company)).not.toBe(outreachCompanyKey({ company: 'Haifa Group', country: 'India' }))
  })

  it('produces database-safe keys without merging unrelated current companies', () => {
    const keys = publicLeads.map(outreachCompanyKey)
    expect(keys.every((key) => key.length <= 240)).toBe(true)
    expect(new Set(keys).size).toBe(publicLeads.length)
  })

  it('warns at company level even if a different product is being viewed', () => {
    expect(activeOutreachSend([sample], company)?.recipient_email).toBe('info@haifa-group.com')
    expect(activeOutreachSend([sample], { company: 'Other Co.', country: 'Israel' })).toBeNull()
    expect(activeOutreachSend([{ ...sample, voided_at: '2026-09-26T10:00:00Z' }], company)).toBeNull()
  })

  it('validates a real recipient and uses the local calendar date for manual marking', () => {
    expect(validOutreachEmail('procurement@example.com')).toBe(true)
    expect(validOutreachEmail('not an email')).toBe(false)
    expect(localDateToday(new Date('2026-09-29T12:00:00Z'))).toMatch(/^2026-09-29|2026-09-30$/)
  })
})
