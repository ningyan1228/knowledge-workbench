import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { outreachCompanyKey } from '../../lib/outreachLedger'
import type { PublicLead } from '../../lib/productMarketMap'
import { deleteLeadList, loadLeadWork, saveLeadList, saveLeadWork } from '../../lib/leadWorkStorage'
import { validWorkDate, type LeadWorkList, type LeadWorkRecord, type WorkRecords } from '../../lib/leadWorkbench'

type WorkState = { status: 'loading' | 'unconfigured' | 'login_required' | 'ready' | 'error'; ownerId: string | null; records: WorkRecords; lists: LeadWorkList[]; error: string | null }
const empty: WorkState = { status: 'loading', ownerId: null, records: {}, lists: [], error: null }
const errorMessage = (error: unknown) => error && typeof error === 'object' && 'message' in error ? String(error.message) : '无法保存私人客户记录，请重试。'

export function useLeadWork() {
  const [state, setState] = useState<WorkState>(empty)
  const [busy, setBusy] = useState(false)
  const revision = useRef(0), locked = useRef(false), owner = useRef<string | null>(null), refreshId = useRef(0)
  const refresh = useCallback(async () => {
    if (!supabase) { setState({ ...empty, status: 'unconfigured' }); return false }
    const generation = revision.current, request = ++refreshId.current
    try {
      const session = await supabase.auth.getSession()
      if (session.error) throw session.error
      if (!session.data.session) {
        if (generation === revision.current && request === refreshId.current) { owner.current = null; setState({ ...empty, status: 'login_required' }) }
        return false
      }
      const auth = await supabase.auth.getUser()
      if (auth.error) throw auth.error
      if (!auth.data.user) throw new Error('请重新登录私人资料库。')
      const ownerId = auth.data.user.id
      const work = await loadLeadWork(ownerId)
      if (generation !== revision.current || request !== refreshId.current) return false
      owner.current = ownerId
      setState({ status: 'ready', ownerId, ...work, error: null })
      return true
    } catch (error) {
      if (generation === revision.current && request === refreshId.current) { owner.current = null; setState({ ...empty, status: 'error', error: errorMessage(error) }) }
      return false
    }
  }, [])
  useEffect(() => {
    void refresh()
    const onFocus = () => { if (!locked.current) void refresh() }
    const onAuth = supabase?.auth.onAuthStateChange((_event, session) => {
      const nextOwner = session?.user.id ?? null
      if (nextOwner !== owner.current) {
        revision.current++; owner.current = null
        setState({ ...empty, status: nextOwner ? 'loading' : 'login_required' })
      }
      window.setTimeout(onFocus, 0)
    })
    window.addEventListener('focus', onFocus)
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') onFocus() }, 60_000)
    return () => { revision.current++; window.clearInterval(timer); window.removeEventListener('focus', onFocus); onAuth?.data.subscription.unsubscribe() }
  }, [refresh])

  const mutate = async (action: (ownerId: string) => Promise<unknown>) => {
    if (state.status !== 'ready' || !state.ownerId || !supabase) throw new Error('请先登录并连接私人客户记录。')
    if (locked.current) throw new Error('上一项修改正在保存，请稍候。')
    locked.current = true; setBusy(true); refreshId.current++
    const ownerId = state.ownerId, generation = revision.current
    try {
      const auth = await supabase.auth.getUser()
      if (auth.error) throw auth.error
      if (auth.data.user?.id !== ownerId || generation !== revision.current) throw new Error('登录账户已变更，请重新打开客户详情。')
      await action(ownerId)
      if (generation !== revision.current) throw new Error('登录账户已变更，请重新打开客户详情。')
      if (!await refresh()) throw new Error('修改已保存，但重新读取失败，请点击私人记录的“重试”。')
    } catch (error) { throw new Error(errorMessage(error)) }
    finally { locked.current = false; setBusy(false); if (generation !== revision.current) void refresh() }
  }
  return {
    ...state, busy, refresh,
    save: async (lead: PublicLead, patch: Partial<Omit<LeadWorkRecord, 'companyKey'>>) => {
      if (patch.followUpOn && !validWorkDate(patch.followUpOn)) throw new Error('请选择有效的跟进日期。')
      if (patch.note && patch.note.length > 4000) throw new Error('备注最多 4000 个字。')
      await mutate((ownerId) => saveLeadWork(ownerId, outreachCompanyKey(lead), patch))
    },
    saveList: async (list: LeadWorkList) => {
      if (state.lists.some((item) => item.id !== list.id && item.name === list.name.trim())) throw new Error('已有同名名单，请选择另一个名称。')
      await mutate((ownerId) => saveLeadList(ownerId, list))
    },
    deleteList: async (id: string) => mutate((ownerId) => deleteLeadList(ownerId, id)),
  }
}
export type LeadWork = ReturnType<typeof useLeadWork>
