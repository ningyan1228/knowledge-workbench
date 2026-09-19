import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const hasSupabaseConfig = Boolean(url && key && !url.includes('YOUR_PROJECT') && !key.includes('REPLACE_ME'))
export const supabase: SupabaseClient | null = hasSupabaseConfig ? createClient(url, key) : null

export function apiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || ''
}
