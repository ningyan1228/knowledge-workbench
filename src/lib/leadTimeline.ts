import records from './leadFirstRecorded.json'

type TimedLead = { id: string; company: string; checkedAt: string }
export type TimelineRecord = { recordedAt: string; commit: string }
const history: Record<string, TimelineRecord> = records
export type TimelineOrder = 'newest' | 'oldest'

export function recordedTime(lead: Pick<TimedLead, 'id'>): string | null {
  const value = history[lead.id]?.recordedAt
  return value && Number.isFinite(Date.parse(value)) ? value : null
}

export function shanghaiDay(time: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(time))
}

export function recordedDay(lead: Pick<TimedLead, 'id'>): string | null {
  const time = recordedTime(lead)
  return time ? shanghaiDay(time) : null
}

export function recordedTimeLabel(lead: Pick<TimedLead, 'id'>): string {
  const time = recordedTime(lead)
  return time ? new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', dateStyle: 'short', timeStyle: 'short', hour12: false }).format(new Date(time)) : '时间未记录'
}

export function shiftTimelineDay(day: string, offset: number): string {
  const date = new Date(`${day}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + offset)
  return date.toISOString().slice(0, 10)
}

export function timelineDayMatches(recorded: string | null, filter: string, today: string): boolean {
  if (filter === 'all') return true
  if (filter === 'unknown') return recorded === null
  if (!recorded) return false
  if (filter === 'today') return recorded === today
  if (filter === 'last7') return recorded >= shiftTimelineDay(today, -6) && recorded <= today
  return recorded === filter
}

export function timelineFilterLabel(day: string, today = shanghaiDay(new Date().toISOString())): string {
  if (day === 'all') return '全部日期'
  if (day === 'unknown') return '时间未记录'
  if (day === 'today') return `今天（${today}）`
  if (day === 'last7') return `近 7 天（${shiftTimelineDay(today, -6)} 至 ${today}）`
  return day
}

export function timelineLeads<T extends TimedLead>(leads: T[], order: TimelineOrder = 'newest', day = 'all', today = shanghaiDay(new Date().toISOString())): T[] {
  return leads.filter((lead) => timelineDayMatches(recordedDay(lead), day, today)).sort((a, b) => {
    const aTime = recordedTime(a), bTime = recordedTime(b)
    if (!aTime && bTime) return 1
    if (aTime && !bTime) return -1
    const delta = (aTime ? Date.parse(aTime) : 0) - (bTime ? Date.parse(bTime) : 0)
    return delta ? (order === 'newest' ? -delta : delta) : a.company.localeCompare(b.company)
  })
}

export function dailyLeadCounts(leads: TimedLead[], today = shanghaiDay(new Date().toISOString())) {
  const counts = new Map<string, number>()
  let unknown = 0
  for (const lead of leads) {
    const day = recordedDay(lead)
    if (day) counts.set(day, (counts.get(day) ?? 0) + 1)
    else unknown++
  }
  const first = [...counts.keys()].sort()[0] ?? today
  const end = [today, ...counts.keys()].sort().at(-1)!
  const days: Array<{ day: string; count: number }> = []
  for (let date = new Date(`${end}T00:00:00Z`); date.toISOString().slice(0, 10) >= first; date.setUTCDate(date.getUTCDate() - 1)) {
    const day = date.toISOString().slice(0, 10)
    days.push({ day, count: counts.get(day) ?? 0 })
  }
  return { days, unknown }
}
