import { useEffect, useRef, useState } from 'react'
import { LoaderCircle, RefreshCw } from 'lucide-react'
import type { PublicLead } from '../../lib/productMarketMap'
import { outreachCompanyKey } from '../../lib/outreachLedger'
import { DevelopmentEmailPanel } from './DevelopmentEmailPanel'
import type { OutreachLedger } from './useOutreachLedger'
import type { LeadWork } from './useLeadWork'
import './DevelopmentEmailPreparation.css'

/** Every entry to the draft tab reads the shared ledger before mounting a draft. */
export function DevelopmentEmailPreparation({ lead, ledger, work, onOpenSendRecord, onReady }: {
  lead: PublicLead; ledger: OutreachLedger; work: LeadWork; onOpenSendRecord: () => void; onReady?: () => void;
}) {
  const [check, setCheck] = useState<{ key: string; status: 'checking' | 'ready' | 'error'; message?: string } | null>(null)
  const [attempt, setAttempt] = useState(0)
  const current = useRef({ ledger, onReady })
  current.current = { ledger, onReady }
  const key = `${lead.id}:${outreachCompanyKey(lead)}`
  useEffect(() => {
    if (ledger.status !== 'ready') { setCheck(null); return }
    const controller = new AbortController()
    setCheck({ key, status: 'checking' })
    const timer = window.setTimeout(() => {
      controller.abort()
      setCheck({ key, status: 'error', message: '核对发送记录超时，请检查网络后重试。' })
    }, 8000)
    void Promise.resolve().then(() => current.current.ledger.checkBeforeOutreach(lead, controller.signal)).then(() => {
      if (!controller.signal.aborted) setCheck({ key, status: 'ready' })
    }).catch((error) => {
      if (!controller.signal.aborted) setCheck({ key, status: 'error', message: `无法核对发送记录：${error instanceof Error ? error.message : '请重试。'}` })
    }).finally(() => window.clearTimeout(timer))
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [key, ledger.status, attempt])
  const ready = ledger.status === 'ready' && check?.key === key && check.status === 'ready'
  useEffect(() => { if (ready) current.current.onReady?.() }, [ready, key])
  if (ready) return <DevelopmentEmailPanel lead={lead} ledger={ledger} work={work} onOpenSendRecord={onOpenSendRecord} />
  const checking = ledger.status === 'loading' || ledger.status === 'ready' && (check?.key !== key || check.status === 'checking')
  const message = ledger.status === 'ready' ? check?.message : ledger.status === 'login_required' ? '请先登录并读取共享发送记录，再准备开发信。' : ledger.status === 'unconfigured' ? '共享发送记录尚未连接，请到设置完成连接。' : ledger.status === 'error' ? `共享发送记录读取失败：${ledger.error ?? '请重试。'}` : undefined
  return <section className="outreach-preparation" aria-label="准备开发信前核对" aria-busy={checking}>
    <h3>{checking && <LoaderCircle className="outreach-preparation-spinner" size={17} />}{checking ? '正在核对发送记录…' : '发送状态未确认'}</h3>
    <p role={checking ? 'status' : 'alert'}>{checking ? '正在读取该公司的最新共享发送记录，核对完成后展示对应草稿。' : message}</p>
    {!checking && <div><button type="button" className="secondary-button" onClick={() => { if (ledger.status === 'ready') setAttempt(value => value + 1); else void ledger.refresh() }}><RefreshCw size={14} />重新核对</button>{ledger.status !== 'ready' && <a href="#settings">前往设置／登录</a>}</div>}
  </section>
}
