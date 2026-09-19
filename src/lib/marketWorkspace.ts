import { supabase } from './supabase'

export async function seedBrazilAgricultureDemo() {
  if (!supabase) throw new Error('尚未连接 Supabase。')
  const { error } = await supabase.rpc('seed_market_intelligence_demo')
  if (error) throw error
}
