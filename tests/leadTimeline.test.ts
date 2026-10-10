import { describe, expect, it } from 'vitest'
import { dailyLeadCounts, recordedDay, recordedTime, shanghaiDay, timelineLeads } from '../src/lib/leadTimeline'
import { publicLeads } from '../src/lib/productMarketMap'

describe('customer first-recorded timeline', () => {
  it('has repository-history evidence for every currently retained company', () => {
    for (const lead of publicLeads) expect(recordedTime(lead)).not.toBeNull()
  })

  it('uses Beijing dates at UTC day boundaries', () => {
    expect(shanghaiDay('2026-10-09T17:00:00Z')).toBe('2026-10-10')
    expect(shanghaiDay('2026-10-09T15:59:59Z')).toBe('2026-10-09')
  })

  it('does not move the first-recorded date when verification is updated', () => {
    const lead = publicLeads.find((item) => item.id === 'icl-charleston')!
    expect(recordedDay(lead)).toBe('2026-09-25')
    expect(recordedTime({ ...lead, checkedAt: '2026-10-10' })).toBe(recordedTime(lead))
  })

  it('sorts dates in both directions and always keeps missing dates at the end', () => {
    const early = publicLeads.find((item) => item.id === 'icl-charleston')!
    const late = publicLeads.find((item) => item.id === 'agroplanta-batatais')!
    const unknown = { ...late, id: 'not-yet-recorded' }
    expect(timelineLeads([unknown, early, late]).map((item) => item.id)).toEqual([late.id, early.id, unknown.id])
    expect(timelineLeads([unknown, late, early], 'oldest').map((item) => item.id)).toEqual([early.id, late.id, unknown.id])
    expect(timelineLeads([early, late, unknown], 'newest', 'unknown')).toEqual([unknown])
  })

  it('counts a company once, includes zero days, and respects the input product/region filter', () => {
    const selected = publicLeads.filter((lead) => lead.productId === 'fertilizer-coating' && lead.country === 'Brazil')
    const counts = dailyLeadCounts(selected, '2026-10-10')
    expect(counts.days.reduce((sum, item) => sum + item.count, 0)).toBe(selected.length)
    expect(counts.days.find((item) => item.day === '2026-10-09')?.count).toBe(0)
    for (const item of counts.days) expect(timelineLeads(selected, 'newest', item.day)).toHaveLength(item.count)
    expect(counts.unknown).toBe(0)
    expect(dailyLeadCounts([], '2026-10-10')).toEqual({ days: [{ day: '2026-10-10', count: 0 }], unknown: 0 })
  })
})
