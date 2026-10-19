import { ChevronRight } from 'lucide-react'
import type { AccountSessionState } from '../../lib/accountSession'
import './AccountStatusCard.css'

export function AccountStatusCard({ account, onSettings }: { account: AccountSessionState; onSettings: () => void }) {
  const signedIn = account.status === 'authenticated'
  const identity = signedIn ? account.user.email || account.user.phone || `账号 ${account.user.id.slice(0, 8)}` : null
  const title = signedIn ? '已登录' : account.status === 'loading' ? '正在确认登录…' : account.status === 'anonymous' ? '未登录' : account.status === 'error' ? '登录状态待确认' : '本地预览'
  const description = signedIn ? '私人资料按当前账号访问。' : account.status === 'loading' ? '正在读取当前账号，请稍候。' : account.status === 'anonymous' ? '登录后可读取和保存你的私人资料。' : account.status === 'error' ? '暂时无法读取登录状态，请重试。' : '尚未配置数据库；示例资料不会上传。'
  return <section className="setup-card account-status-card" aria-label="当前账号">
    <div role="status" aria-live="polite"><span>{account.status === 'unconfigured' ? '当前模式' : '当前账号'}</span><strong>{title}</strong>{identity && <span className="account-identity" title={identity}>{identity}</span>}<p>{description}</p></div>
    <div className="account-card-actions">{account.status === 'error' && <button type="button" onClick={() => void account.refresh()}>重新读取</button>}<button type="button" onClick={onSettings}>{signedIn ? '账户与设置' : account.status === 'anonymous' ? '去登录' : '查看设置'}<ChevronRight size={14} /></button></div>
  </section>
}
