import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import type { PublicLead } from '../../lib/productMarketMap'
import { contactChannelLabels, customerContactRoutes, latestContact, type ContactChannel, type ContactLogEntry } from '../../lib/contactRoutes'
import { selectBusinessRecipient } from '../../lib/contactEvidence'
import { localDateToday, outreachCompanyKey } from '../../lib/outreachLedger'
import { validWorkDate } from '../../lib/leadWorkbench'
import type { LeadWork } from './useLeadWork'

export function ContactRoutePanel({ lead, work }: { lead: PublicLead; work?: LeadWork }) {
  const routes = customerContactRoutes(lead)
  const record = work?.status === 'ready' ? work.records[outreachCompanyKey(lead)] : undefined
  const recent = latestContact(record?.contactLog)
  const [channel, setChannel] = useState<ContactChannel>('form')
  const [destination, setDestination] = useState(''), [day, setDay] = useState(localDateToday()), [message,setMessage] = useState('')
  const target = (value: ContactChannel) => value === 'form' ? routes.contactPage ?? routes.website ?? '' : value === 'linkedin' ? routes.linkedin ?? '' : value === 'whatsapp' ? routes.whatsapp ?? '' : value === 'phone' ? routes.phone ?? '' : ''
  useEffect(() => { setDestination(target(channel)); setMessage(''); setDay(localDateToday()) }, [lead.id,channel])
  const save = async () => {
    if (!work || work.status !== 'ready') return
    setMessage('')
    try {
      if (!destination.trim()) throw new Error('请填写实际使用的联系入口或号码。')
      if (!validWorkDate(day) || day > localDateToday()) throw new Error('请选择实际联系日期，不能填写未来日期。')
      const fresh = work.fetchCurrentRecords ? await work.fetchCurrentRecords() : work.records
      const log = fresh[outreachCompanyKey(lead)]?.contactLog ?? []
      if (log.length >= 100) throw new Error('已保存100条联系记录，请先整理历史记录。')
      if (!window.confirm(`确认你已于 ${day} 通过${contactChannelLabels[channel]}实际联系该客户？此按钮只保存记录，不会替你发送。`)) return
      const id = crypto.randomUUID?.() ?? Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2,'0')).join('')
      const entry: ContactLogEntry = { id, channel, destination: destination.trim(), contactedOn: day, recordedAt: new Date().toISOString() }
      await work.save(lead,{ contactLog: [...log,entry] })
      setMessage('联系记录已保存到当前账号；邮件发送台账未改动。')
    } catch(error) { setMessage(error instanceof Error ? error.message : '保存失败，请重试。') }
  }
  const undo = async (id: string) => {
    if (!work || !window.confirm('撤销这条误标的渠道联系记录？邮件发送记录不会改变。')) return
    try {
      const fresh = work.fetchCurrentRecords ? await work.fetchCurrentRecords() : work.records
      await work.save(lead,{ contactLog: (fresh[outreachCompanyKey(lead)]?.contactLog ?? []).map(entry => entry.id === id ? { ...entry, voidedAt: new Date().toISOString() } : entry) })
      setMessage('渠道记录已撤销。')
    } catch(error) { setMessage(error instanceof Error ? error.message : '撤销失败。') }
  }
  return <section className="outreach-contact-routes" aria-label="其他联系渠道">
    <strong>其他联系渠道</strong>
    <div className="outreach-route-links">
      {routes.contactPage && <a href={routes.contactPage} target="_blank" rel="noreferrer">官网联系页／表单入口<ExternalLink size={12}/></a>}
      {routes.linkedin && <a href={routes.linkedin} target="_blank" rel="noreferrer">LinkedIn 公开入口<ExternalLink size={12}/></a>}
      {routes.whatsapp && <a href={routes.whatsapp} target="_blank" rel="noreferrer">公开 WhatsApp 入口<ExternalLink size={12}/></a>}
      {!routes.contactPage && routes.website && <a href={routes.website} target="_blank" rel="noreferrer">官网查找联系入口<ExternalLink size={12}/></a>}
    </div>
    {routes.phone && <p>公开业务电话：{routes.phone}{!routes.whatsapp && ' · 尚未核实该号码是否使用 WhatsApp'}</p>}
    <p>{selectBusinessRecipient(lead) ? '主题和正文可按对方界面分别复制。' : '缺邮箱仍可复制开发信主题、正文或整封，用于对方开放的官网表单、LinkedIn 或已核验 WhatsApp。'}入口是否允许留言、账号是否可联系，以对方页面为准；复制或打开入口不算已联系。</p>
    {recent && <p className="outreach-channel-recorded">我的联系记录：{contactChannelLabels[recent.channel]}已联系 · {recent.contactedOn}（仅当前账号）</p>}
    {work?.status !== 'ready' && <p>私人渠道记录尚未连接，暂不能核对你是否已通过其他渠道联系；邮件记录仍以共享台账为准。</p>}
    <details className="outreach-route-record"><summary>记录表单／私信／电话联系</summary>
      <p>实际联系后手动记录；仅当前账号可见并跨设备保存，同公司跨产品共用。此处不标记邮件已发送，同事看不到这些私人记录。</p>
      {work?.status === 'ready' ? <>
        <fieldset disabled={work.busy}><div className="outreach-route-fields"><label>联系渠道<select aria-label="联系渠道" value={channel} onChange={event => setChannel(event.target.value as ContactChannel)}>{Object.entries(contactChannelLabels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><label>实际联系日期<input aria-label="实际联系日期" type="date" max={localDateToday()} value={day} onChange={event=>setDay(event.target.value)}/></label></div>
        <label>实际联系入口／号码<input aria-label="实际联系入口或号码" maxLength={1000} value={destination} onChange={event=>setDestination(event.target.value)}/></label>
        <button type="button" className="secondary-button" disabled={!destination.trim()} onClick={()=>void save()}>记录已联系</button></fieldset>
        <ul>{record?.contactLog?.filter(entry=>!entry.voidedAt).map(entry=><li key={entry.id}><span>{contactChannelLabels[entry.channel]} · {entry.contactedOn} · {entry.destination}</span><button type="button" disabled={work.busy} onClick={()=>void undo(entry.id)}>撤销误标</button></li>)}</ul>
      </> : <p>登录并连接私人客户记录后，可保存渠道联系记录。</p>}
      {message && <p role="status">{message}</p>}
    </details>
  </section>
}
