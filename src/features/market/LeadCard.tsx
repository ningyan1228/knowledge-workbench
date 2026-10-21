import { useState } from 'react'
import { CalendarCheck, ChevronRight, ExternalLink, Globe2, Linkedin, Mail, MessageCircle, Phone, Star } from 'lucide-react'
import { marketProducts, type PublicLead } from '../../lib/productMarketMap'
import { recordedDay, recordedTimeLabel, shanghaiDay } from '../../lib/leadTimeline'
import { outreachCompanyKey } from '../../lib/outreachLedger'
import { developmentProgressLabel, effectiveStage, followUpDue, leadIndustry } from '../../lib/leadWorkbench'
import { publicContactUrl } from '../../lib/contactEvidence'
import { leadCardBrief, leadCardContactChannels } from '../../lib/leadCardBrief'
import type { OutreachLedger } from './useOutreachLedger'
import type { LeadWork } from './useLeadWork'
import { CustomerContactStatus } from './CustomerContactStatus'
import './LeadCard.css'

export type LeadCardProps = {
  lead: PublicLead; selected?: boolean; onHighlight: (lead: PublicLead | null) => void;
  onSelect: (lead: PublicLead) => void; onOpenDetail: (lead: PublicLead) => void; ledger: OutreachLedger; work: LeadWork;
  variant?: 'card' | 'row';
}

function ContactChannels({ lead }: { lead: PublicLead }) {
  const { channels, missingEmail } = leadCardContactChannels(lead)
  const icons = { email: Mail, website: Globe2, linkedin: Linkedin, whatsapp: MessageCircle, phone: Phone }
  return <div className="customer-contact-channels" aria-label="公开联系渠道">
    {channels.map((channel) => {
      const Icon = icons[channel.kind]
      const external = channel.kind !== 'email' && channel.kind !== 'phone'
      return <a key={channel.kind} href={channel.href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} title={channel.description} aria-label={channel.description}><Icon size={12} aria-hidden="true" />{channel.label}</a>
    })}
    {missingEmail && <span className="customer-channel-missing">邮箱待补</span>}
    {!channels.length && <span className="customer-channel-missing">公开联系入口待补</span>}
  </div>
}

function BusinessEvidence({ lead, showContacts = true }: { lead: PublicLead; showContacts?: boolean }) {
  const evidence = lead.companyEvidence
  const brief = leadCardBrief(lead)
  return <div className="customer-business-brief">
    <div className="customer-brief-row"><span className="customer-brief-label">联系理由</span><p className="customer-card-reason">{brief.fact}</p></div>
    <div className="customer-brief-row"><span className="customer-brief-label">评估材料</span><p className="customer-card-opportunity" title={brief.limits}><strong>{brief.product}</strong><span>{brief.evaluation}</span>{brief.extended && <small className="customer-extension-label">扩展应用</small>}</p></div>
    {showContacts && <div className="customer-brief-row"><span className="customer-brief-label">联系渠道</span><ContactChannels lead={lead} /></div>}
    <details className="customer-business-evidence">
    <summary>
      <span className="customer-evidence-boundary" title="应用关联不代表已确认采购、使用或配方相容性">适配待评估 · 采购未确认</span><span className="customer-evidence-toggle"><span className="customer-evidence-expand">完整依据</span><span className="customer-evidence-collapse">收起原文</span><ChevronRight size={12} /></span>
    </summary>
    <div className="customer-evidence-original">
      <strong>完整核验原文</strong><p>{evidence.statement || '暂无已保存的业务依据。'}</p>
      {publicContactUrl(evidence.sourceUrl) && <a href={evidence.sourceUrl} target="_blank" rel="noreferrer">{evidence.sourceName || '查看业务来源'}<ExternalLink size={12} /></a>}
      <small>业务依据核验：<time dateTime={evidence.verifiedAt}>{evidence.verifiedAt || '日期未记录'}</time></small>
    </div>
    </details>
  </div>
}

export function LeadCard({ lead, selected, onHighlight, onSelect, onOpenDetail, ledger, work, variant = 'card' }: LeadCardProps) {
  const [error, setError] = useState('')
  const product = marketProducts.find((item) => item.id === lead.productId)!
  const today = shanghaiDay(new Date().toISOString())
  const compactDate = (day: string) => day.startsWith(today.slice(0, 4)) ? `${Number(day.slice(5, 7))}月${Number(day.slice(8, 10))}日` : day
  const record = work.status === 'ready' ? work.records[outreachCompanyKey(lead)] : undefined
  const sent = ledger.status === 'ready' ? ledger.activeSend(lead) : null
  const sendState = ledger.status !== 'ready' ? 'unknown' : sent ? 'sent' : 'unsent'
  const stage = effectiveStage(lead, work.status === 'ready' ? work.records : null, ledger.status === 'ready' ? ledger.sends : null)
  const progressStatus = stage !== 'sent' && stage !== 'todo' && stage !== 'unknown' ? developmentProgressLabel(stage, false) : ''
  const progressDate = record?.followUpOn || sent?.sent_on
  const progressDateLabel = record?.followUpOn ? record.stage === 'paused' ? '暂缓的计划' : '下次跟进' : sent?.sent_on ? '发送日期' : ''
  const showProgress = Boolean(progressStatus || progressDate)
  const progressContent = <>{progressStatus}{progressStatus && progressDate && ' · '}{progressDate && <span className={record?.followUpOn && followUpDue(record, today) ? 'work-due' : undefined}>{progressDateLabel && `${progressDateLabel}：`}<time dateTime={progressDate}>{compactDate(progressDate)}</time></span>}</>
  const firstDay = recordedDay(lead)
  const contactUrl = publicContactUrl(lead.profile.contactPage) ? lead.profile.contactPage : publicContactUrl(lead.profile.website) ? lead.profile.website : undefined
  const favorite = async () => {
    setError('')
    try { await work.save(lead, { favorite: !record?.favorite }) }
    catch (error) { setError(error instanceof Error ? error.message : '收藏失败') }
  }
  if (variant === 'row') return <tr data-lead-id={lead.id} className={`customer-lead-row${selected ? ' selected' : ''}`}>
    <td><button type="button" className="customer-row-company" onClick={() => onSelect(lead)} title={lead.company}><span className="lead-dot" style={{ background: product.color }} /><span><strong>{lead.company}</strong><small>{leadIndustry(lead)}</small></span></button><div className="customer-row-send-status"><CustomerContactStatus contactLog={record?.contactLog} emailState={sendState} sentOn={sent?.sent_on} compact /></div>{showProgress && <span className="customer-row-status">{progressContent}</span>}</td>
    <td className="customer-row-country">{lead.countryZh}</td>
    <td className="customer-row-application"><BusinessEvidence lead={lead} showContacts={false} /></td>
    <td className="customer-row-dates" title={`首次收录：${recordedTimeLabel(lead)}（北京时间）`}><span>核验 <time dateTime={lead.checkedAt}>{compactDate(lead.checkedAt)}</time></span><span>收录 {firstDay ? <time dateTime={firstDay}>{compactDate(firstDay)}</time> : '时间未记录'}</span></td>
    <td className="customer-row-contact"><span className="customer-brief-label customer-row-contact-label">联系渠道</span><ContactChannels lead={lead} /></td>
    <td className="customer-row-actions"><div><button type="button" className="customer-row-detail" onClick={() => onOpenDetail(lead)}>查看客户</button><button type="button" className="customer-row-favorite" aria-label={record?.favorite ? '取消收藏' : '收藏客户'} aria-pressed={Boolean(record?.favorite)} disabled={work.status !== 'ready' || work.busy} title={work.status === 'ready' ? '收藏客户' : '登录后可收藏客户'} onClick={() => void favorite()}><Star size={16} fill={record?.favorite ? 'currentColor' : 'none'} /></button></div>{error && <small className="customer-row-error" role="alert">{error}</small>}</td>
  </tr>
  return <article id={'map-card-' + lead.id} data-lead-id={lead.id} className={`lead-card customer-lead-card${selected ? ' selected' : ''}`}
    onMouseEnter={() => onHighlight(lead)} onMouseLeave={() => onHighlight(null)} onFocus={() => onHighlight(lead)}
    onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) onHighlight(null) }}>
    <button type="button" className="customer-card-heading" onClick={() => onSelect(lead)} title="在地图中定位客户">
      <span className="lead-dot" style={{ background: product.color }} /><span className="customer-card-identity"><span className="customer-card-company"><h3 title={lead.company}>{lead.company}</h3></span></span><ChevronRight size={16} />
    </button>
    <div className="customer-card-meta"><span className="customer-card-country" title={lead.countryZh}>{lead.countryZh}</span><span className="customer-card-industry" title={leadIndustry(lead)}>{leadIndustry(lead)}</span><div className="customer-card-send-status"><CustomerContactStatus contactLog={record?.contactLog} emailState={sendState} sentOn={sent?.sent_on} compact /></div></div>
    <div className="customer-card-evidence"><BusinessEvidence lead={lead} /></div>
    <div className="customer-card-dates" title={`最近核验：${lead.checkedAt}；首次收录：${recordedTimeLabel(lead)}（北京时间）`}><CalendarCheck size={13} /><span>最近核验：<time dateTime={lead.checkedAt}>{compactDate(lead.checkedAt)}</time><span className="customer-card-date-divider"> · </span>首次收录：{firstDay ? <time dateTime={firstDay}>{compactDate(firstDay)}</time> : '时间未记录'}</span></div>
    {showProgress && <button type="button" className="customer-card-progress" onClick={() => onOpenDetail(lead)}>{progressContent}</button>}
    <div className="customer-card-actions"><button type="button" className="customer-card-open" onClick={() => onOpenDetail(lead)}>查看客户</button>{contactUrl ? <a href={contactUrl} target="_blank" rel="noreferrer">{lead.profile.contactPage === contactUrl ? '查看联系入口' : '查看官网'}<ExternalLink size={12} /></a> : <button type="button" className="customer-card-contact" onClick={() => onOpenDetail(lead)}>查看联系资料</button>}<button type="button" className="customer-card-favorite" aria-label={record?.favorite ? '取消收藏' : '收藏客户'} aria-pressed={Boolean(record?.favorite)} disabled={work.status !== 'ready' || work.busy} title={work.status === 'ready' ? record?.favorite ? '取消收藏' : '收藏客户' : '登录并连接私人客户记录后可收藏'} onClick={() => void favorite()}><Star size={17} fill={record?.favorite ? 'currentColor' : 'none'} /></button></div>
    {error && <p className="customer-card-error" role="alert">{error}</p>}
  </article>
}
