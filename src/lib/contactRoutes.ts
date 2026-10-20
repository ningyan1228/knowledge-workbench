import type { PublicLead } from './productMarketMap'
import { contactAssessment, contactPhoneVerified, publicContactUrl } from './contactEvidence'

export const contactChannelLabels = { form: '官网表单', linkedin: 'LinkedIn', whatsapp: 'WhatsApp', phone: '电话', other: '其他渠道' } as const
export type ContactChannel = keyof typeof contactChannelLabels
export type ContactLogEntry = { id: string; channel: ContactChannel; destination: string; contactedOn: string; recordedAt: string; voidedAt?: string }
const validDay = (day: string) => /^\d{4}-\d{2}-\d{2}$/.test(day) && Number.isFinite(Date.parse(day)) && new Date(day).toISOString().slice(0, 10) === day
export function officialWhatsAppUrl(value?: string) {
  try { const url = new URL(value ?? ''); return url.protocol === 'https:' && ['wa.me', 'api.whatsapp.com', 'web.whatsapp.com'].includes(url.hostname) ? value : undefined } catch { return undefined }
}
export function professionalLinkedInUrl(value?: string) {
  try { const url = new URL(value ?? ''); return url.protocol === 'https:' && /(^|\.)linkedin\.com$/i.test(url.hostname) ? value : undefined } catch { return undefined }
}
export function customerContactRoutes(lead: PublicLead) {
  const profile = lead.profile
  const phone = (profile.generalPhone && (profile.generalPhoneEvidence
    ? contactPhoneVerified(lead.company, profile.generalPhone, profile.generalPhoneEvidence) && profile.generalPhoneEvidence.kind !== 'named-business'
    : publicContactUrl(profile.contactPage ?? profile.website)) ? profile.generalPhone : undefined)
    ?? profile.contacts.find(person => contactAssessment(lead.company,person).phone)?.phone
  return {
    contactPage: publicContactUrl(profile.contactPage) ? profile.contactPage : undefined,
    website: publicContactUrl(profile.website) ? profile.website : undefined,
    linkedin: professionalLinkedInUrl(profile.linkedIn) ?? profile.contacts.filter(person => contactAssessment(lead.company, person).identity).map(person => professionalLinkedInUrl(person.linkedIn)).find(Boolean),
    whatsapp: officialWhatsAppUrl(profile.whatsapp),
    phone,
  }
}
export function normalizeContactLog(value: unknown): ContactLogEntry[] {
  if (!Array.isArray(value)) return []
  return value.filter((entry): entry is ContactLogEntry => Boolean(entry && typeof entry === 'object'
    && typeof entry.id === 'string' && entry.id && Object.hasOwn(contactChannelLabels, entry.channel)
    && typeof entry.destination === 'string' && entry.destination.trim() && entry.destination.length <= 1000
    && typeof entry.contactedOn === 'string' && validDay(entry.contactedOn)
    && typeof entry.recordedAt === 'string' && Number.isFinite(Date.parse(entry.recordedAt))
    && (entry.voidedAt === undefined || typeof entry.voidedAt === 'string' && Number.isFinite(Date.parse(entry.voidedAt)))))
}
export function latestContact(log?: ContactLogEntry[]) {
  return normalizeContactLog(log).filter(entry => !entry.voidedAt).sort((a,b) => b.contactedOn.localeCompare(a.contactedOn) || b.recordedAt.localeCompare(a.recordedAt))[0]
}
