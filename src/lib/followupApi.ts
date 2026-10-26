import { apiBaseUrl, supabase } from './supabase'

export type FollowupVersion = { id: string; filename: string; title: string; source_date: string | null; content_hash: string; created_at: string; created_by: string; restored_from: string | null }
export type FollowupSnapshot = FollowupVersion & { markdown: string; source_base64?: string; dataset_id?: string | null; dataset_version?: string | null }
export type FollowupVersions = { current_id: string | null; versions: FollowupVersion[] }
export type FollowupAccess = { email: string; role: 'owner' | 'reader' }
export type FollowupMembers = { owner: string; members: { email: string; invited_at: string }[] }

export async function followupRequest<T>(userId: string, path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  const base = apiBaseUrl().replace(/\/$/, '')
  if (!base || !supabase) throw new Error('客户跟进服务尚未配置，请联系管理员。')
  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session || data.session.user.id !== userId) throw new Error('登录状态已变化，请重新登录后重试。')
  const response = await fetch(`${base}/follow-up${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { Authorization: `Bearer ${data.session.access_token}`, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    cache: 'no-store', credentials: 'omit', signal,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const result = await response.json().catch(() => null)
  if (!response.ok) throw new Error(typeof result?.detail === 'string' ? result.detail : `客户跟进请求失败（${response.status}），请重试。`)
  return result as T
}
