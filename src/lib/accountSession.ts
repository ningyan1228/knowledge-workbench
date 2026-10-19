import { useCallback, useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

export type AccountSession =
  | { status: 'authenticated'; user: User }
  | { status: 'loading' | 'anonymous' | 'unconfigured' | 'error'; user: null }

export function useAccountSession() {
  const [account, setAccount] = useState<AccountSession>({ status: supabase ? 'loading' : 'unconfigured', user: null })
  const revision = useRef(0)
  const refresh = useCallback(async () => {
    if (!supabase) return
    const request = ++revision.current
    setAccount({ status: 'loading', user: null })
    try {
      const { data, error } = await supabase.auth.getSession()
      if (request !== revision.current) return
      if (error) throw error
      const user = data.session?.user
      setAccount(user ? { status: 'authenticated', user } : { status: 'anonymous', user: null })
    } catch {
      if (request === revision.current) setAccount({ status: 'error', user: null })
    }
  }, [])

  useEffect(() => {
    if (!supabase) return
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      // Login, logout and cross-tab changes take precedence over an older initial read.
      revision.current++
      setAccount(session?.user ? { status: 'authenticated', user: session.user } : { status: 'anonymous', user: null })
    })
    void refresh()
    return () => { revision.current++; listener.subscription.unsubscribe() }
  }, [refresh])

  return { ...account, refresh }
}

export type AccountSessionState = ReturnType<typeof useAccountSession>
