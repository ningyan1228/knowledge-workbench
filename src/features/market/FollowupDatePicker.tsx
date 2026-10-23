import { CalendarDays } from 'lucide-react'
import type { FollowupVersion, FollowupVersions } from '../../lib/followupApi'

function uploadDay(value: string) {
  const date = new Date(value)
  if (!Number.isFinite(date.valueOf())) return 'undated'
  const parts = new Intl.DateTimeFormat('en', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date)
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-')
}

export function groupFollowupDates(versions: FollowupVersion[]) {
  const groups = new Map<string, FollowupVersion[]>()
  for (const version of versions) {
    const day = version.source_date || uploadDay(version.created_at)
    groups.set(day, [...(groups.get(day) ?? []), version])
  }
  return [...groups].sort(([a], [b]) => b.localeCompare(a)).map(([day, items]) => ({
    day, label: day === 'undated' ? '未注明日期' : day + (items.every(item => !item.source_date) ? '（上传日）' : ''),
    versions: items.sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id.localeCompare(a.id)),
  })).sort((a, b) => Number(a.day === 'undated') - Number(b.day === 'undated'))
}

function versionLabel(version: FollowupVersion, currentId: string | null) {
  const date = new Date(version.created_at)
  const saved = Number.isFinite(date.valueOf()) ? new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(date) + ' 保存' : '保存时间未注明'
  return saved + (version.restored_from ? ' · 历史恢复' : '') + (version.id === currentId ? ' · 当前版本' : '')
}

export function FollowupDatePicker({ index, selectedId, busy, onSelect }: { index: FollowupVersions; selectedId: string; busy: boolean; onSelect: (id: string) => void }) {
  const groups = groupFollowupDates(index.versions)
  const selected = groups.find(group => group.versions.some(version => version.id === selectedId))
  return <div className="followup-date-controls">
    <label className="followup-date-picker"><CalendarDays size={16} aria-hidden="true" /><span>更新日期</span><select aria-label="选择台账更新日期" value={selected?.day ?? ''} disabled={busy} onChange={event => { const group = groups.find(item => item.day === event.target.value); if (group) onSelect(group.versions[0].id) }}>{groups.map(group => <option key={group.day} value={group.day}>{group.label}{group.versions.some(version => version.id === index.current_id) ? ' · 当前版本' : ''}</option>)}</select></label>
    {selected && selected.versions.length > 1 && <label className="followup-day-versions"><span>当日版本</span><select aria-label="选择当日台账版本" value={selectedId} disabled={busy} onChange={event => onSelect(event.target.value)}>{selected.versions.map(version => <option key={version.id} value={version.id}>{versionLabel(version, index.current_id)}</option>)}</select></label>}
  </div>
}
