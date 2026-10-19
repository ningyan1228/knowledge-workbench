import { CheckCircle2, CircleHelp } from 'lucide-react'
import type { OutreachLedger } from './useOutreachLedger'
import type { LeadWork } from './useLeadWork'

export function MarketConnectionStatus({ ledger, work }: { ledger: OutreachLedger; work: LeadWork }) {
  const ready = ledger.status === 'ready' && work.status === 'ready'
  const label = (status: OutreachLedger['status']) => status === 'ready' ? '已连接' : status === 'loading' ? '读取中' : status === 'login_required' ? '需登录' : status === 'unconfigured' ? '待配置' : '连接异常'
  return <div className="market-connection-status" aria-label="数据连接状态"><details className="market-status-detail"><summary>{ready ? <CheckCircle2 size={13} /> : <CircleHelp size={13} />}{ready ? '记录已连接' : '连接状态'}</summary><div className="market-status-popover"><strong>共享发送记录 · {label(ledger.status)}</strong><p>已登录同事共享，按公司核对；复制草稿不会标记已发送。</p><strong>私人客户记录 · {label(work.status)}</strong><p>收藏、名单、备注和跟进日期仅当前账户可见。</p></div></details></div>
}
