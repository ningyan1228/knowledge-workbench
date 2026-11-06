import { describe, expect, it } from 'vitest'
import { outreachError } from '../src/lib/outreachError'

describe('outreach database errors', () => {
  it('explains the missing product migration for plain PostgREST errors', () => {
    const error = outreachError({ code: '23514', message: 'violates check constraint "market_intel_outreach_sends_product_id_check"' })
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toContain('CPP/CPO')
  })
  it('preserves duplicate codes for the concurrent-send safeguard', () => {
    expect(outreachError({ code: '23505', message: 'duplicate' }).code).toBe('23505')
  })
  it('does not expose database row details', () => {
    expect(outreachError({ code: '23514', details: 'private recipient', message: 'other constraint' }).message).not.toContain('private recipient')
  })
})
