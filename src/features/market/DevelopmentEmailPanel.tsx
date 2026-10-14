import { useState } from 'react'
import { Copy, FileText, Mail, TriangleAlert } from 'lucide-react'
import { marketProducts, targetCompanyTypes, tdsVerifiedApplications, marketExtendedApplications, type PublicLead } from '../../lib/productMarketMap'
import { createDevelopmentEmailPrompt } from '../../lib/outreachPrompt'
import { developmentEmailVersion } from '../../lib/developmentEmailVersion'
import type { OutreachLedger } from './useOutreachLedger'

export function DevelopmentEmailPanel({ lead, ledger }: { lead: PublicLead; ledger: OutreachLedger }) {
  const [copied, setCopied] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const product = marketProducts.find((item) => item.id === lead.productId)!
  const targetType = targetCompanyTypes.find((item) => item.id === lead.targetCompanyTypeId)!
  const application = (lead.companyEvidence.applicationLayer === 'tds-verified' ? tdsVerifiedApplications : marketExtendedApplications).find((item) => item.id === lead.companyEvidence.applicationId)!
  const version = developmentEmailVersion(lead, ledger.status === 'ready' ? ledger.sends : null)
  const email = version.email
  const qualified = Boolean(email)
  const prompt = createDevelopmentEmailPrompt({ lead, product, application, targetType, style: version.style })
  const copyEmail = async () => {
    if (!email) return
    try {
      if (ledger.status !== 'ready') throw new Error('共享发送记录尚未连接，无法确认首封版本；请先登录并读取发送记录。')
      const freshSends = await ledger.fetchCurrentSends()
      const freshVersion = developmentEmailVersion(lead, freshSends)
      if (freshVersion.sent && !window.confirm(`该公司已于 ${freshVersion.sent.sent_on} 发往 ${freshVersion.sent.recipient_email}。确认仍要复制原版首封参考吗？`)) return
      if (!freshVersion.email) return
      await navigator.clipboard.writeText(freshVersion.email.text)
      void ledger.refresh()
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch (error) { window.alert(`复制前无法核对发送记录：${error instanceof Error ? error.message : '未知错误'}`) }
  }
  return <section className="outreach-prompt"><div><p className="eyebrow">OUTREACH · REVIEW FIRST</p><h3><Mail size={17} />{version.label}</h3>{qualified ? <p>{version.note}</p> : <p className="outreach-not-qualified"><TriangleAlert size={15} />Not qualified for outreach：当前记录缺少可追溯的产品、应用、公司证据或需求侧资格。</p>}</div><div className="outreach-actions"><button className="secondary-button outreach-copy-button" disabled={!qualified || ledger.status !== 'ready'} onClick={() => void copyEmail()}><Copy size={15} />{copied ? '开发信已复制' : version.style === 'concise' ? '复制简洁开发信' : '复制原版参考'}</button><button className="secondary-button outreach-preview-button" disabled={!qualified} aria-expanded={showPrompt} onClick={() => setShowPrompt((value) => !value)}><FileText size={15} />{showPrompt ? '收起原 Prompt' : '查看原 Prompt'}</button></div>{email && <div className="outreach-prompt-preview outreach-email-preview"><div><strong>{version.style === 'concise' ? '简洁版' : '原版参考'} · {lead.company}</strong><span>业务依据：<a href={email.evidenceUrl} target="_blank" rel="noreferrer">查看公开来源</a> · {email.verifiedAt} 核验</span></div><pre>{email.text}</pre></div>}{showPrompt && qualified && <div className="outreach-prompt-preview"><div><strong>原 Prompt 预览</strong><span>供需要进一步定制时使用，不是待发送邮件。</span></div><pre>{prompt}</pre></div>}</section>
}

