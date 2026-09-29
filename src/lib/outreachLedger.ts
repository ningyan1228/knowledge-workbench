import { supabase } from './supabase'
import type { PublicLead } from './productMarketMap'

export type OutreachSend = {
  id: string
  company_key: string
  company_name: string
  lead_id: string
  product_id: PublicLead['productId']
  recipient_email: string
  sent_on: string
  sent_by: string | null
  created_at: string
  voided_at: string | null
}

/** Company-level key warns about prior mail even if a company appears under two products. */
export function outreachCompanyKey(lead: Pick<PublicLead, 'company' | 'country'>) {
  const company = lead.company.normalize('NFKC').toLocaleLowerCase('en').replace(/[^\p{L}\p{N}]+/gu, '')
  return `${lead.country.trim().toLocaleLowerCase('en')}|${company}`
}

export function validOutreachEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function localDateToday(now = new Date()) {
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
}

export function activeOutreachSend(sends: OutreachSend[], lead: Pick<PublicLead, 'company' | 'country'>) {
  const key = outreachCompanyKey(lead)
  return sends.find((send) => send.company_key === key && send.voided_at === null) ?? null
}

function database() {
  if (!supabase) throw new Error('Supabase 尚未配置。')
  return supabase
}

export async function loadOutreachSends(): Promise<OutreachSend[]> {
  const rows: OutreachSend[] = []
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await database().from('market_intel_outreach_sends')
      .select('id,company_key,company_name,lead_id,product_id,recipient_email,sent_on,sent_by,created_at,voided_at')
      .order('created_at', { ascending: false }).range(offset, offset + 499)
    if (error) throw error
    rows.push(...(data ?? []) as OutreachSend[])
    if (!data || data.length < 500) return rows
  }
}

export async function findCurrentOutreachSend(lead: Pick<PublicLead, 'company' | 'country'>): Promise<OutreachSend | null> {
  const { data, error } = await database().from('market_intel_outreach_sends')
    .select('id,company_key,company_name,lead_id,product_id,recipient_email,sent_on,sent_by,created_at,voided_at')
    .eq('company_key', outreachCompanyKey(lead)).is('voided_at', null).maybeSingle()
  if (error) throw error
  return data as OutreachSend | null
}

export async function recordOutreachSend(lead: PublicLead, recipientEmail: string, sentOn: string) {
  const { error } = await database().from('market_intel_outreach_sends').insert({
    company_key: outreachCompanyKey(lead),
    company_name: lead.company,
    lead_id: lead.id,
    product_id: lead.productId,
    recipient_email: recipientEmail.trim(),
    sent_on: sentOn,
  })
  if (error) throw error
}

export async function voidOutreachSend(sendId: string, reason: string) {
  const { error } = await database().rpc('outreach_void_send', { p_send_id: sendId, p_reason: reason.trim() })
  if (error) throw error
}
