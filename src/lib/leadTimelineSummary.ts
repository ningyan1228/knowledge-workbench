import { dailyLeadCounts, recordedTime, shanghaiDay, shiftTimelineDay } from './leadTimeline'
import { outreachCompanyKey } from './outreachLedger'
import type { PublicLead } from './productMarketMap'

export function leadTimelineSummary(leads: PublicLead[], today = shanghaiDay(new Date().toISOString())) {
  const companies = new Map<string, PublicLead>()
  for (const lead of leads) {
    const key = outreachCompanyKey(lead), previous = companies.get(key)
    const time = recordedTime(lead), previousTime = previous ? recordedTime(previous) : null
    if (!previous || (time && (!previousTime || Date.parse(time) < Date.parse(previousTime)))) companies.set(key, lead)
  }
  const counts = dailyLeadCounts([...companies.values()], today)
  const byDay = new Map(counts.days.map((item) => [item.day, item.count]))
  const days = Array.from({ length: 14 }, (_, index) => {
    const day = shiftTimelineDay(today, index - 13)
    return { day, count: byDay.get(day) ?? 0 }
  })
  return { total: companies.size, today: byDay.get(today) ?? 0, last7: days.slice(-7).reduce((sum, item) => sum + item.count, 0), unknown: counts.unknown, days }
}
