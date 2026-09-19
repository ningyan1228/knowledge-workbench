import { apiBaseUrl, supabase } from './supabase'

export type ApiErrorCode = 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_CONFIGURED' | 'SOURCE_BLOCKED' | 'RATE_LIMITED' | 'BUDGET_EXCEEDED' | 'PARSE_FAILED' | 'INSUFFICIENT_EVIDENCE'

export async function proxyRequest<T>(path: string, body: Record<string, unknown>): Promise<T> {
  if (!apiBaseUrl()) throw new Error('NOT_CONFIGURED: 尚未设置 VITE_API_BASE_URL。')
  const token = (await supabase?.auth.getSession())?.data.session?.access_token
  if (!token) throw new Error('UNAUTHORIZED: 请先登录后再使用此功能。')
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body),
  })
  const payload = await response.json().catch(() => ({})) as { code?: ApiErrorCode; detail?: string }
  if (!response.ok) throw new Error(`${payload.code || 'REQUEST_FAILED'}: ${payload.detail || '请求未完成。'}`)
  return payload as T
}
