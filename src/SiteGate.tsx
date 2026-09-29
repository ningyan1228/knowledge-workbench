import { lazy, Suspense, useState, type FormEvent } from 'react'
import { isSiteGateHash, matchesSiteGatePassword, siteGateSessionKey } from './lib/siteGate'

const App = lazy(async () => ({ default: (await import('./App')).App }))
const configuredHash = (import.meta.env.VITE_SITE_GATE_SHA256 ?? '').trim()
const configured = isSiteGateHash(configuredHash)

function alreadyUnlocked(): boolean {
  if (!configured) return false
  try {
    return window.sessionStorage.getItem(siteGateSessionKey(configuredHash)) === '1'
  } catch {
    return false
  }
}

export function SiteGate() {
  const [unlocked, setUnlocked] = useState(alreadyUnlocked)
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [checking, setChecking] = useState(false)

  if (unlocked || (!configured && import.meta.env.DEV)) {
    return <Suspense fallback={<div className="site-gate-loading">正在打开工作台…</div>}><App /></Suspense>
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!configured || checking) return
    setChecking(true)
    setMessage('')
    try {
      if (await matchesSiteGatePassword(password, configuredHash)) {
        try { window.sessionStorage.setItem(siteGateSessionKey(configuredHash), '1') } catch { /* Private browsing may block storage. */ }
        setPassword('')
        setUnlocked(true)
      } else {
        setMessage('密码不正确，请重试。')
      }
    } catch {
      setMessage('当前浏览器无法校验密码，请换用支持安全连接的浏览器。')
    } finally {
      setChecking(false)
    }
  }

  return <main className="site-gate-screen">
    <section className="site-gate-card" role="dialog" aria-modal="true" aria-labelledby="site-gate-title">
      <div className="site-gate-brand"><span>NL</span><div><strong>阳光心材料</strong><small>知识工作台</small></div></div>
      <p className="eyebrow">TEAM ACCESS</p>
      <h1 id="site-gate-title">请输入访问密码</h1>
      <p>这是团队使用的临时访问门槛。输入后可在当前浏览器会话内使用工作台。</p>
      {configured ? <form onSubmit={(event) => void submit(event)}>
        <label htmlFor="site-gate-password">访问密码</label>
        <input id="site-gate-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required autoFocus />
        <button className="primary-button" type="submit" disabled={checking}>{checking ? '正在核对…' : '进入工作台'}</button>
        {message && <p className="site-gate-error" role="alert">{message}</p>}
      </form> : <p className="site-gate-error" role="alert">网站尚未配置访问密码，请联系管理员。</p>}
      <small>提示：这是静态页面弹窗，不是数据加密。请勿在工作台存放需要严格保密的客户资料。</small>
    </section>
  </main>
}
