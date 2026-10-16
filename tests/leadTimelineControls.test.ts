import { afterEach, describe, expect, it, vi } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { LeadTimelineControls } from '../src/features/market/LeadTimelineControls'
import { leadTimelineSummary } from '../src/lib/leadTimelineSummary'
import { shiftTimelineDay, timelineFilterLabel, timelineLeads } from '../src/lib/leadTimeline'
import { publicLeads } from '../src/lib/productMarketMap'

vi.mock('../src/lib/leadFirstRecorded.json', () => ({ default: {
  old: { recordedAt: '2026-10-08T15:59:59Z', commit: 'fixture' },
  edge: { recordedAt: '2026-10-08T16:00:00Z', commit: 'fixture' },
  today: { recordedAt: '2026-10-14T16:00:00Z', commit: 'fixture' },
  future: { recordedAt: '2026-10-15T16:00:00Z', commit: 'fixture' },
  duplicate: { recordedAt: '2026-10-14T17:00:00Z', commit: 'fixture' },
} }))

const leads = ['old', 'edge', 'today', 'future', 'unknown'].map((id) => ({ ...publicLeads[0], id, company: id }))
const today = '2026-10-15'
afterEach(() => vi.useRealTimers())

describe('compact first-recorded controls', () => {
  it('filters today and an inclusive seven-day window using Beijing dates', () => {
    expect(timelineLeads(leads, 'newest', 'today', today).map((lead) => lead.id)).toEqual(['today'])
    expect(timelineLeads(leads, 'newest', 'last7', today).map((lead) => lead.id)).toEqual(['today', 'edge'])
    expect(timelineLeads(leads, 'newest', '2026-10-08', today).map((lead) => lead.id)).toEqual(['old'])
    expect(timelineLeads(leads, 'newest', 'unknown', today).map((lead) => lead.id)).toEqual(['unknown'])
    expect(timelineLeads(leads, 'oldest', 'last7', today).map((lead) => lead.id)).toEqual(['edge', 'today'])
    expect(timelineFilterLabel('last7', today)).toContain('2026-10-09 至 2026-10-15')
    expect(shiftTimelineDay('2026-03-01', -6)).toBe('2026-02-23')
  })

  it('deduplicates companies by their earliest record and keeps unknown dates out of recent counts', () => {
    const duplicate = { ...leads[0], id: 'duplicate', productId: 'elo' as const }
    const summary = leadTimelineSummary([...leads, duplicate], today)
    expect(summary).toMatchObject({ total: 5, today: 1, last7: 2, unknown: 1 })
    expect(summary.days).toHaveLength(14)
    expect(summary.days.at(-1)).toEqual({ day: today, count: 1 })
    expect(summary.days.reduce((sum, day) => sum + day.count, 0)).toBe(3)
    expect(leadTimelineSummary([], today).days.every((day) => day.count === 0)).toBe(true)
  })

  it('shows recent additions without repeating the customer total and keeps details collapsed', () => {
    vi.useFakeTimers().setSystemTime(new Date('2026-10-15T01:00:00Z'))
    const html = renderToStaticMarkup(createElement(LeadTimelineControls, { leads, order: 'newest', day: 'all', onDay: () => {}, onOrder: () => {} }))
    for (const label of ['今日新增', '近 7 天新增', '收录日期', '自选日期', '首次收录由新到旧', '收录趋势', '统计说明']) expect(html).toContain(label)
    expect(html).not.toContain('当前范围客户')
    expect(html).toContain('<details class="timeline-trend">')
    expect(html).toContain('<details class="timeline-method">')
    expect(html).not.toContain('lead-timeline-days')
    expect(html).not.toContain('NaN')
    expect(html).toContain('查看时间未记录客户')
  })
})
