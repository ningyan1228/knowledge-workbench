import { describe, expect, it } from 'vitest'
import { groupFollowupDates } from '../src/features/market/FollowupDatePicker'
import type { FollowupVersion } from '../src/lib/followupApi'

const version = (id: string, source_date: string | null, created_at: string): FollowupVersion => ({ id, source_date, created_at, filename: 'ledger.md', title: '台账', content_hash: id, created_by: 'owner@example.org', restored_from: null })

describe('follow-up date selection', () => {
  it('groups by document date, keeps same-day versions newest first and leaves the input untouched', () => {
    const list = [version('older', '2026-10-19', '2026-10-23T10:00:00Z'), version('morning', '2026-10-23', '2026-10-23T01:00:00Z'), version('afternoon', '2026-10-23', '2026-10-23T08:00:00Z')]
    const groups = groupFollowupDates(list)
    expect(groups.map(group => group.day)).toEqual(['2026-10-23', '2026-10-19'])
    expect(groups[0].versions.map(item => item.id)).toEqual(['afternoon', 'morning'])
    expect(groups[1].versions[0].id).toBe('older')
    expect(list.map(item => item.id)).toEqual(['older', 'morning', 'afternoon'])
  })
  it('explicitly uses the Shanghai upload date when the source has no date and keeps undated items accessible', () => {
    const groups = groupFollowupDates([version('fallback', null, '2026-10-22T17:00:00Z'), version('undated', null, 'invalid'), version('source', '2026-10-15', '2026-10-23T10:00:00Z')])
    expect(groups.map(group => group.label)).toEqual(['2026-10-23（上传日）', '2026-10-15', '未注明日期'])
    expect(groupFollowupDates([])).toEqual([])
  })
})
