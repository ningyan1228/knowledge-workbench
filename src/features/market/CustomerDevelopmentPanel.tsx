import { useState } from 'react'
import { publicLeads } from '../../lib/productMarketMap'
import { developmentSnapshot, firstContactExport, firstContactPlan } from '../../lib/customerDevelopment'
import { shanghaiDay } from '../../lib/leadTimeline'
import { verifiedProjectSignals } from '../../lib/verifiedProjectSignals'
import type { OutreachLedger } from './useOutreachLedger'
import './customerDevelopment.css'

export function CustomerDevelopmentPanel({ ledger }: { ledger: OutreachLedger }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const coating = publicLeads.filter((lead) => lead.productId === 'fertilizer-coating')
  const snapshot = developmentSnapshot(coating)
  const projects = verifiedProjectSignals.filter((item) => coating.some((lead) => lead.id === item.leadId))
  const plan = firstContactPlan(coating, ledger.status === 'ready' ? ledger.sends : null)
  const download = async () => {
    setBusy(true); setMessage('')
    try {
      const fresh = firstContactPlan(coating, await ledger.fetchCurrentSends())
      await ledger.refresh()
      if (!fresh.batch.length) { setMessage(fresh.remaining === 0 ? '今天已达到 20 家首次开发目标。' : '当前没有可导出的未发送邮箱客户。'); return }
      const url = URL.createObjectURL(new Blob([firstContactExport(fresh.batch)], { type: 'text/plain;charset=utf-8' }))
      const link = document.createElement('a'); link.href = url; link.download = `coating-first-contact-${shanghaiDay(new Date().toISOString())}.txt`; link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setMessage(`已导出 ${fresh.batch.length} 家首封草稿，导出不会标记已发送。发信前请打开来源确认收件信息。`)
    } catch (error) { setMessage(`无法核对发送记录：${error instanceof Error ? error.message : '请稍后重试'}`) }
    finally { setBusy(false) }
  }
  return <section className="customer-development">
    <div className="section-heading"><div><p className="eyebrow">COATING CUSTOMER DEVELOPMENT</p><h2>包衣剂开发进展</h2><p>东南亚优先，其他地区包衣客户补足 · 每天 20 家不同公司的首次开发</p></div></div>
    <div className="development-metrics">
      <article><strong>{snapshot.newCompaniesToday}</strong><span>今日新增合格公司</span><small>按北京时间首次收录；重新核验不算新增</small></article>
      <article><strong>{snapshot.reachableNamedContacts}</strong><span>已核验可触达具名联系人</span><small>累计公开姓名、职责、来源与联系入口</small></article>
      <article><strong>{projects.length}</strong><span>已核实项目动态</span><small>累计公开项目；发生时间见下方记录</small></article>
    </div>
    <div className="development-daily"><div><h3>今天的首封候选池</h3><p>已标记发送 {plan.completed ?? '—'} / 20 家 · 本次候选 {plan.batch.length} 家 · 可用未发送邮箱公司 {plan.available ?? '—'} 家</p>
      {plan.remaining === null ? <p>登录并读取网站发送记录后，才能确认首次开发名单。</p> : plan.shortfall ? <p>距离今日目标还缺 {plan.shortfall} 家；另有 {plan.missingEmails} 家包衣客户待补公开邮箱。</p> : <p>{plan.remaining === 0 ? '今日目标已完成。' : '已按东南亚优先排好本次候选。'}</p>}
      <small>同公司跨产品去重；只选有公开业务邮箱的正式客户。跟进信单独安排。</small></div>
      <button type="button" className="secondary-button" disabled={busy || ledger.status !== 'ready' || !plan.batch.length} onClick={() => void download()}>{busy ? '核对发送记录…' : '下载今日首封草稿（最多 20 家）'}</button></div>
    {message && <p className="development-message" role="status">{message}</p>}
    {!!plan.batch.length && <details><summary>查看本次 {plan.batch.length} 家候选及收件邮箱</summary><ol className="development-batch">{plan.batch.map(({ lead, recipient, southeastAsia }) => <li key={lead.id}><strong>{lead.company}</strong><span>{lead.countryZh} · {southeastAsia ? '东南亚优先' : '其他地区补足'}</span><a href={recipient.sourceUrl} target="_blank" rel="noreferrer">{recipient.email} · 公开来源</a></li>)}</ol></details>}
    <details><summary>项目动态与开发切入点（{projects.length}）</summary>{projects.map((item) => <article className="development-project" key={item.id}><strong>{coating.find((lead) => lead.id === item.leadId)?.company} · {item.title}</strong><p>{item.summary}</p><small>{item.stage} · {item.dateLabel} · 核验 {item.verifiedAt}</small><a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceName}</a></article>)}</details>
  </section>
}
