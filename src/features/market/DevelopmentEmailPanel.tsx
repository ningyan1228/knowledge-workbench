import { useEffect, useRef, useState } from 'react'
import { Copy, FileText, LoaderCircle, Mail, TriangleAlert } from 'lucide-react'
import { marketProducts, targetCompanyTypes, tdsVerifiedApplications, marketExtendedApplications, type PublicLead } from '../../lib/productMarketMap'
import { createDevelopmentEmailPrompt } from '../../lib/outreachPrompt'
import { developmentEmailVersion } from '../../lib/developmentEmailVersion'
import { copyPlainText } from '../../lib/clipboard'
import type { OutreachLedger } from './useOutreachLedger'
import './DevelopmentEmailPanel.css'

export function DevelopmentEmailPanel({ lead, ledger }: { lead: PublicLead; ledger: OutreachLedger }) {
  const [copyState, setCopyState] = useState<'idle' | 'checking' | 'copying' | 'copied'>('idle')
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

  const copyEmail = async () => {
    if (!email || activeCopy.current) return
    const controller = new AbortController()
    activeCopy.current = controller
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
      setCopyState('copying')
      setMessage('正在复制开发信…')
      const copied = await copyPlainText(freshVersion.email.text, controller.signal)
      if (controller.signal.aborted) return
      if (copied) {
        setCopyState('copied')
        setMessage('开发信已复制，可以粘贴到邮件中。')
      } else {
        setManualText(freshVersion.email.text)
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
  const copyLabel = copyState === 'checking' ? '正在核对发送记录…'
    : copyState === 'copying' ? '正在复制…'
      : copyState === 'copied' ? '开发信已复制'
        : version.style === 'concise' ? '复制简洁开发信' : '复制原版参考'
  return <section className="outreach-prompt">
    <div><p className="eyebrow">OUTREACH · REVIEW FIRST</p><h3><Mail size={17} />{version.label}</h3>{qualified ? <p>{version.note}</p> : <p className="outreach-not-qualified"><TriangleAlert size={15} />Not qualified for outreach：当前记录缺少可追溯的产品、应用、公司证据或需求侧资格。</p>}</div>
    <div className="outreach-actions"><button type="button" className="secondary-button outreach-copy-button" disabled={!qualified || ledger.status !== 'ready' || pending} aria-busy={pending} onClick={() => void copyEmail()}>{pending ? <LoaderCircle className="outreach-copy-spinner" size={15} /> : <Copy size={15} />}{copyLabel}</button><button type="button" className="secondary-button outreach-preview-button" disabled={!qualified} aria-expanded={showPrompt} onClick={() => setShowPrompt((value) => !value)}><FileText size={15} />{showPrompt ? '收起原 Prompt' : '查看原 Prompt'}</button></div>
    <div className="outreach-copy-feedback" role="status" aria-live="polite">{message}</div>
    {manualText && <div className="outreach-manual-copy"><label>手动复制开发信<textarea ref={manualField} aria-label="手动复制开发信" readOnly value={manualText} rows={12} onFocus={(event) => event.currentTarget.select()} /></label><button type="button" className="secondary-button" onClick={() => { manualField.current?.focus(); manualField.current?.select() }}>全选开发信</button></div>}
    {email && <div className="outreach-prompt-preview outreach-email-preview"><div><strong>{version.style === 'concise' ? '简洁版' : '原版参考'} · {lead.company}</strong><span>业务依据：<a href={email.evidenceUrl} target="_blank" rel="noreferrer">查看公开来源</a> · {email.verifiedAt} 核验</span></div><pre>{email.text}</pre></div>}
    {showPrompt && qualified && <div className="outreach-prompt-preview"><div><strong>原 Prompt 预览</strong><span>供需要进一步定制时使用，不是待发送邮件。</span></div><pre>{prompt}</pre></div>}
  </section>
}

