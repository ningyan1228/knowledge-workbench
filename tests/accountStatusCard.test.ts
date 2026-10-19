import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { User } from '@supabase/supabase-js'
import { AccountStatusCard } from '../src/features/account/AccountStatusCard'
import type { AccountSession, AccountSessionState } from '../src/lib/accountSession'

const render = (account: AccountSession) => renderToStaticMarkup(createElement(AccountStatusCard, {
  account: { ...account, refresh: async () => {} } as AccountSessionState, onSettings: () => {},
}))

describe('sidebar account status', () => {
  it('shows the actual account without claiming records were saved', () => {
    const html = render({ status: 'authenticated', user: { id: 'fixture-id', email: 'sales@example.org' } as User })
    expect(html).toContain('已登录')
    expect(html).toContain('sales@example.org')
    expect(html).toContain('账户与设置')
    expect(html).not.toContain('请先登录')
    expect(html).not.toContain('已保存')
    expect(html).not.toContain('已连接 Supabase')
  })
  it.each([
    ['loading', '正在确认登录…', '查看设置'],
    ['anonymous', '未登录', '去登录'],
    ['error', '登录状态待确认', '重新读取'],
    ['unconfigured', '本地预览', '查看设置'],
  ] as const)('uses an honest label for %s', (status, label, action) => {
    const html = render({ status, user: null })
    expect(html).toContain(label)
    expect(html).toContain(action)
    expect(html).not.toContain('class="account-identity"')
    if (status !== 'anonymous') expect(html).not.toContain('>未登录<')
  })
  it('supports phone-only accounts and a short account ID when identity fields are absent', () => {
    expect(render({ status: 'authenticated', user: { id: '12345678-abcd', phone: '+12345678901' } as User })).toContain('+12345678901')
    expect(render({ status: 'authenticated', user: { id: '12345678-abcd' } as User })).toContain('账号 12345678')
  })
})
