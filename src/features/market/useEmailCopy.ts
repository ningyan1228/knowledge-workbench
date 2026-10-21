import { useEffect, useRef, useState } from 'react'
import type { PublicLead } from '../../lib/productMarketMap'
import { copyPlainText } from '../../lib/clipboard'
import { confirmContactCopy } from '../../lib/contactCopyGuard'
import type { OutreachLedger } from './useOutreachLedger'
import type { LeadWork } from './useLeadWork'

export function useEmailCopy(lead: PublicLead, email: string, ledger?: OutreachLedger, work?: LeadWork) {
  const [state, setState] = useState<'idle' | 'checking' | 'copying' | 'copied'>('idle')
  const [message, setMessage] = useState('')
  const [manual, setManual] = useState(false)
  const active = useRef<AbortController | null>(null)
  useEffect(() => {
    setState('idle'); setMessage(''); setManual(false)
    return () => { active.current?.abort(); active.current = null }
  }, [lead.id, email, work?.ownerId, ledger?.status, work?.status])
  useEffect(() => {
    if (state !== 'copied') return
    const timer = setTimeout(() => setState('idle'), 2200)
    return () => clearTimeout(timer)
  }, [state])
  const copy = async () => {
    if (!email || active.current) return
    const controller = new AbortController()
    active.current = controller
    setState('checking'); setMessage('正在核对发送及其他渠道联系记录…'); setManual(false)
    try {
      const result = await confirmContactCopy(lead, ledger, work, '邮箱', controller.signal)
      if (!result) { setMessage('已取消复制邮箱。'); return }
      setState('copying')
      const copied = await copyPlainText(email, controller.signal)
      if (controller.signal.aborted) return
      setManual(!copied)
      if (copied) { setState('copied'); setMessage('邮箱已复制。') }
      else setMessage('浏览器未允许自动复制，请选中邮箱后按 Ctrl+C 或长按复制。')
    } catch (error) {
      if (!controller.signal.aborted) setMessage(`未复制：${error instanceof Error ? error.message : '无法核对联系记录，请重试。'}`)
    } finally {
      if (active.current === controller) { active.current = null; setState(current => current === 'copied' ? current : 'idle') }
    }
  }
  return { state, message, manual, copy, pending: state === 'checking' || state === 'copying' }
}
