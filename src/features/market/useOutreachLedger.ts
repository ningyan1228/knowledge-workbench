import { useCallback, useEffect, useState } from 'react'
import type { PublicLead } from '../../lib/productMarketMap'
import { supabase } from '../../lib/supabase'
import {
  activeOutreachSend, findCurrentOutreachSend, loadOutreachSends, localDateToday,
  recordOutreachSend, validOutreachEmail, voidOutreachSend, type OutreachSend,
} from '../../lib/outreachLedger'

type LedgerStatus = 'loading' | 'unconfigured' | 'login_required' | 'ready' | 'error'
type LedgerState = { status: LedgerStatus; sends: OutreachSend[]; error: string | null }
const empty: LedgerState = { status: 'loading', sends: [], error: null }

/** All authenticated accounts share one ledger. Anonymous users can still read public leads. */
export function useOutreachLedger() {
  const [state, setState] = useState<LedgerState>(empty)
  const [busy, setBusy] = useState(false)

  const refresh = useCallback(async () => {
    if (!supabase) {
      setState({ ...empty, status: 'unconfigured' })
      return
    }
    try {
      const { data: session, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!session.session) {
        setState({ ...empty, status: 'login_required' })
        return
      }
      const { data, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      if (!data.user) {
        setState({ ...empty, status: 'login_required' })
        return
      }
      const sends = await loadOutreachSends()
      setState({ status: 'ready', sends, error: null })
    } catch (error) {
      setState({ ...empty, status: 'error', error: error instanceof Error ? error.message : '无法读取共享发送记录' })
    }
  }, [])

  useEffect(() => {
    void refresh()
    const onFocus = () => void refresh()
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void refresh() }, 60_000)
    window.addEventListener('focus', onFocus)
    const listener = supabase?.auth.onAuthStateChange(() => { window.setTimeout(() => void refresh(), 0) })
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', onFocus)
      listener?.data.subscription.unsubscribe()
    }
  }, [refresh])

  const markSent = async (lead: PublicLead, recipientEmail: string, sentOn: string) => {
    if (state.status !== 'ready') throw new Error('共享发送记录尚未连接')
    if (!validOutreachEmail(recipientEmail)) throw new Error('请输入实际收件邮箱')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(sentOn) || sentOn > localDateToday()) throw new Error('请选择实际发送日期，不能填写未来日期')
    setBusy(true)
    try {
      const existing = await findCurrentOutreachSend(lead)
      if (existing) throw new Error(`该公司已记录发送：${existing.sent_on} → ${existing.recipient_email}。请先核对，不要重复发送。`)
      await recordOutreachSend(lead, recipientEmail, sentOn)
      await refresh()
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
        await refresh()
        throw new Error('另一位同事刚记录了该公司已发送；请刷新并核对。')
      }
      throw error
    } finally { setBusy(false) }
  }
  const voidSent = async (sendId: string, reason: string) => {
    setBusy(true)
    try { await voidOutreachSend(sendId, reason); await refresh() } finally { setBusy(false) }
  }
  const checkBeforeOutreach = async (lead: PublicLead) => {
    if (state.status !== 'ready') throw new Error('共享发送记录尚未连接，不能确认是否重复')
    const current = await findCurrentOutreachSend(lead)
    if (current) void refresh()
    return current
  }

  return {
    ...state, busy, refresh, markSent, voidSent, checkBeforeOutreach, fetchCurrentSends: loadOutreachSends,
    activeSend: (lead: PublicLead) => activeOutreachSend(state.sends, lead),
  }
}

export type OutreachLedger = ReturnType<typeof useOutreachLedger>
