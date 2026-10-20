import { useEffect, useRef, useState } from 'react'
import { CalendarCheck, Check, Copy, FileText, LoaderCircle, Mail, TriangleAlert } from 'lucide-react'
import { marketProducts, targetCompanyTypes, tdsVerifiedApplications, marketExtendedApplications, type PublicLead } from '../../lib/productMarketMap'
import { createDevelopmentEmailPrompt } from '../../lib/outreachPrompt'
import { developmentEmailVersion } from '../../lib/developmentEmailVersion'
import { copyPlainText } from '../../lib/clipboard'
import { DevelopmentEmailRecipient } from './DevelopmentEmailRecipient'
import { OutreachStatusBadge } from './OutreachStatusBadge'
import type { OutreachLedger } from './useOutreachLedger'
import './DevelopmentEmailPanel.css'

const copyParts = [
  { id: 'subject', label: '复制主题', copied: '主题已复制' },
  { id: 'body', label: '复制正文', copied: '正文已复制' },
  { id: 'full', label: '复制整封', copied: '整封已复制' },
] as const
type CopyPart = typeof copyParts[number]['id']

export function DevelopmentEmailPanel({ lead, ledger, onOpenSendRecord }: { lead: PublicLead; ledger: OutreachLedger; onOpenSendRecord?: () => void }) {
  const [copyState, setCopyState] = useState<'idle' | 'checking' | 'copying' | 'copied'>('idle')
  const [copyPart, setCopyPart] = useState<CopyPart>('full')
  const [message, setMessage] = useState('')
  const [manualText, setManualText] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)
  const activeCopy = useRef<AbortController | null>(null)
  const manualField = useRef<HTMLTextAreaElement>(null)
  const product = marketProducts.find((item) => item.id === lead.productId)!
  const targetType = targetCompanyTypes.find((item) => item.id === lead.targetCompanyTypeId)!
  const application = (lead.companyEvidence.applicationLayer === 'tds-verified' ? tdsVerifiedApplications : marketExtendedApplications).find((item) => item.id === lead.companyEvidence.applicationId)!
  const version = developmentEmailVersion(lead, ledger.status === 'ready' ? ledger.sends : null)
  const email = version.email
  const qualified = Boolean(email)
  const pending = copyState === 'checking' || copyState === 'copying'
  const prompt = createDevelopmentEmailPrompt({ lead, product, application, targetType, style: version.style })
  useEffect(() => {
    setCopyState('idle')
    setCopyPart('full')
    setMessage('')
    setManualText('')
    return () => { activeCopy.current?.abort(); activeCopy.current = null }
  }, [lead.id])
  useEffect(() => {
    if (copyState !== 'copied') return
    const timer = window.setTimeout(() => setCopyState('idle'), 2200)
    return () => window.clearTimeout(timer)
  }, [copyState])
  useEffect(() => {
    if (manualText) { manualField.current?.focus(); manualField.current?.select() }
  }, [manualText])

  const copyEmail = async (part: CopyPart) => {
    if (!email || activeCopy.current) return
    const controller = new AbortController()
    activeCopy.current = controller
    setCopyPart(part)
    setCopyState('checking')
    setMessage('正在核对当前公司的发送记录…')
    setManualText('')
    let timedOut = false
    let timer: number | undefined
    const onAbort = () => rejectCheck?.(new Error('发送记录核对已取消'))
    let rejectCheck: ((error: Error) => void) | undefined
    try {
      if (ledger.status !== 'ready') throw new Error('共享发送记录尚未连接，请先登录并读取发送记录。')
      const cancelled = new Promise<never>((_, reject) => { rejectCheck = reject })
      controller.signal.addEventListener('abort', onAbort, { once: true })
      timer = window.setTimeout(() => { timedOut = true; controller.abort() }, 8000)
      const sent = await Promise.race([ledger.checkBeforeOutreach(lead, controller.signal), cancelled])
      window.clearTimeout(timer)
      controller.signal.removeEventListener('abort', onAbort)
      if (controller.signal.aborted) return
      const freshVersion = developmentEmailVersion(lead, sent ? [sent] : [])
      if (sent && !window.confirm(`该公司已于 ${sent.sent_on} 发往 ${sent.recipient_email}。确认仍要复制原版首封参考吗？`)) {
        setMessage('已取消复制。')
        return
      }
      if (!freshVersion.email) throw new Error('当前记录暂不能生成开发信。')
      const text = part === 'full' ? freshVersion.email.text : freshVersion.email[part]
      setCopyState('copying')
      setMessage('正在复制开发信…')
      const copied = await copyPlainText(text, controller.signal)
      if (controller.signal.aborted) return
      if (copied) {
        setCopyState('copied')
        setMessage(part === 'subject' ? '主题已复制，可以粘贴到邮件主题栏。' : part === 'body' ? '正文已复制，包含称呼和签名，可以粘贴到邮件正文。' : '整封开发信已复制，包含主题和正文。')
      } else {
        setManualText(text)
        setMessage('浏览器未允许自动复制。请在下方文本框全选后按 Ctrl+C（Mac 按 ⌘C），手机可长按复制。')
      }
    } catch (error) {
      if (activeCopy.current === controller && (!controller.signal.aborted || timedOut)) {
        setMessage(timedOut ? '核对发送记录超时，请检查网络后重试。' : `未复制：${error instanceof Error ? error.message : '无法核对发送记录，请重试。'}`)
      }
    } finally {
      window.clearTimeout(timer)
      controller.signal.removeEventListener('abort', onAbort)
      if (activeCopy.current === controller) {
        activeCopy.current = null
        setCopyState((current) => current === 'copied' ? current : 'idle')
      }
    }
  }
  const manualLabel = copyPart === 'subject' ? '手动复制主题' : copyPart === 'body' ? '手动复制正文' : '手动复制整封开发信'
  return <section className="outreach-prompt">
    <div className={`outreach-send-banner outreach-send-banner-${version.state}`}><OutreachStatusBadge state={version.state} sentOn={version.sent?.sent_on} /><span>{version.state === 'sent' ? `已记录收件邮箱：${version.sent!.recipient_email}` : version.state === 'unsent' ? '实际发送后请标记；复制草稿不算发送。' : '请先读取共享发送记录，再确认是否已发送。'}</span></div>
    <div><p className="eyebrow">OUTREACH · REVIEW FIRST</p><h3><Mail size={17} />{version.label}</h3>{qualified ? <p>{version.note}</p> : <p className="outreach-not-qualified"><TriangleAlert size={15} />{version.missingRecipient ? '先补齐并核验收件邮箱，再生成与该公司业务对应的开发信；官网表单或电话不算收件邮箱。' : 'Not qualified for outreach：当前记录缺少可追溯的产品、应用、公司证据或需求侧资格。'}</p>}</div>
    <DevelopmentEmailRecipient key={lead.id} lead={lead} />
    <div className="outreach-actions">
      {qualified && <div className="outreach-copy-options" role="group" aria-label="复制开发信内容">{copyParts.map((part) => {
        const current = copyPart === part.id
        const busy = current && pending
        const copied = current && copyState === 'copied'
        const label = current && copyState === 'checking' ? '核对中…' : current && copyState === 'copying' ? '复制中…' : copied ? part.copied : part.label
        return <button key={part.id} type="button" className="secondary-button outreach-copy-button" data-copy-part={part.id} disabled={!qualified || ledger.status !== 'ready' || pending} aria-busy={busy} onClick={() => void copyEmail(part.id)}>{busy ? <LoaderCircle className="outreach-copy-spinner" size={15} /> : copied ? <Check size={15} /> : <Copy size={15} />}{label}</button>
      })}</div>}
      {onOpenSendRecord && <button type="button" className="primary-button outreach-record-button" disabled={ledger.busy} aria-controls={`company-send-record-${lead.id}`} onClick={onOpenSendRecord}><CalendarCheck size={15} />{version.state === 'unsent' ? '记录已发送' : '查看发送记录'}</button>}
      {qualified && <button type="button" className="secondary-button outreach-preview-button" aria-expanded={showPrompt} onClick={() => setShowPrompt((value) => !value)}><FileText size={15} />{showPrompt ? '收起原 Prompt' : '查看原 Prompt'}</button>}
    </div>
    <div className="outreach-copy-feedback" role="status" aria-live="polite">{message}</div>
    {manualText && <div className="outreach-manual-copy"><label>{manualLabel}<textarea ref={manualField} aria-label={manualLabel} readOnly value={manualText} rows={copyPart === 'subject' ? 2 : 12} onFocus={(event) => event.currentTarget.select()} /></label><button type="button" className="secondary-button" onClick={() => { manualField.current?.focus(); manualField.current?.select() }}>全选内容</button></div>}
    {email && <div className="outreach-prompt-preview outreach-email-preview"><div><strong>{version.style === 'concise' ? '简洁版' : '原版参考'} · {lead.company}</strong><span>业务依据：<a href={email.evidenceUrl} target="_blank" rel="noreferrer">查看公开来源</a> · {email.verifiedAt} 核验</span></div><pre>{email.text}</pre></div>}
    {showPrompt && qualified && <div className="outreach-prompt-preview"><div><strong>原 Prompt 预览</strong><span>供需要进一步定制时使用，不是待发送邮件。</span></div><pre>{prompt}</pre></div>}
  </section>
}

