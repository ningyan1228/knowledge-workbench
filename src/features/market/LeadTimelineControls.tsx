import { dailyLeadCounts, type TimelineOrder } from '../../lib/leadTimeline'
import type { PublicLead } from '../../lib/productMarketMap'

export function LeadTimelineControls({ leads, order, day, onOrder, onDay }: { leads: PublicLead[]; order: TimelineOrder; day: string; onOrder: (order: TimelineOrder) => void; onDay: (day: string) => void }) {
  const counts = dailyLeadCounts(leads)
  return <section className="lead-timeline-controls" aria-label="客户收录时间线">
    <div className="lead-timeline-heading"><div><strong>每日新增收录</strong><p>按当前产品及筛选范围统计 · 北京时间</p></div><label>时间排序<select value={order} onChange={(event) => onOrder(event.target.value as TimelineOrder)}><option value="newest">最近收录优先</option><option value="oldest">最早收录优先</option></select></label></div>
    <div className="lead-timeline-days" role="group" aria-label="按收录日期筛选"><button type="button" aria-pressed={day === 'all'} onClick={() => onDay('all')}><span>全部日期</span><strong>{leads.length} 家</strong></button>{counts.days.map((item) => <button type="button" key={item.day} aria-pressed={day === item.day} onClick={() => onDay(item.day)}><span>{item.day}</span><strong>{item.count} 家</strong></button>)}{counts.unknown > 0 && <button type="button" aria-pressed={day === 'unknown'} onClick={() => onDay('unknown')}><span>时间未记录</span><strong>{counts.unknown} 家</strong></button>}</div>
    <p className="lead-timeline-note">首次收录时间由网站版本历史追溯，区别于爬取时间和最后核验日期。数量仅统计当前保留的客户；重复核验不算新增，0 家不代表当天未运行采集。</p>
  </section>
}
