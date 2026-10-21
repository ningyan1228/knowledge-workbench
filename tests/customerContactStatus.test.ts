import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { CustomerContactStatus } from '../src/features/market/CustomerContactStatus'
import { LeadCard } from '../src/features/market/LeadCard'
import { CompanyDetail } from '../src/features/market/CompanyDetail'
import { DevelopmentEmailPanel } from '../src/features/market/DevelopmentEmailPanel'
import { publicLeads } from '../src/lib/productMarketMap'
import { outreachCompanyKey, type OutreachSend } from '../src/lib/outreachLedger'
import { emptyWorkRecord } from '../src/lib/leadWorkbench'
import type { ContactLogEntry } from '../src/lib/contactRoutes'
import type { LeadWork } from '../src/features/market/useLeadWork'
import type { OutreachLedger } from '../src/features/market/useOutreachLedger'

const lead = publicLeads.find(item => item.id === 'aexcel-mentor')!
const key = outreachCompanyKey(lead)
const form: ContactLogEntry = { id: 'form', channel: 'form', destination: 'https://www.aexcelcorp.com/contact-us/', contactedOn: '2026-10-20', recordedAt: '2026-10-20T01:00:00Z' }
const work = { status: 'ready', records: { [key]: { ...emptyWorkRecord(key), followUpOn: '2026-10-27', contactLog: [form] } }, lists: [], busy: false } as unknown as LeadWork
const sent: OutreachSend = { id:'mail', company_key: key, company_name: lead.company, lead_id: lead.id, product_id: lead.productId, recipient_email: 'fixture@example.org', sent_on: '2026-10-19', sent_by: null, created_at:'2026-10-19T01:00:00Z', voided_at:null }
const ledger = { status: 'ready', sends: [], activeSend: () => null, busy: false } as unknown as OutreachLedger
const html = (log: ContactLogEntry[], emailState: 'sent' | 'unsent' | 'unknown' = 'unsent') => renderToStaticMarkup(createElement(CustomerContactStatus, { contactLog: log, emailState, sentOn: emailState === 'sent' ? sent.sent_on : undefined }))

describe('channel contacts remain distinct from shared email sending', () => {
  it('puts the latest active channel and actual contact date first, with explicit private scope', () => {
    const markup = html([form, { ...form, id: 'void', channel: 'whatsapp', contactedOn: '2026-10-21', voidedAt: '2026-10-21T00:00:00Z' }])
    expect(markup).toContain('官网表单已联系 · ')
    expect(markup).toContain('dateTime="2026-10-20"')
    expect(markup).toContain('我的记录')
    expect(markup).toContain('未查到发送记录')
    expect(markup.indexOf('官网表单已联系')).toBeLessThan(markup.indexOf('未查到发送记录'))
    expect(markup).not.toContain('WhatsApp已联系')
    for (const channel of ['linkedin', 'whatsapp', 'phone', 'other'] as const) expect(html([{ ...form, channel }])).toContain(`data-contact-channel="${channel}"`)
  })
  it('keeps sent and unknown email states truthful without inferring a channel contact', () => {
    expect(html([form], 'sent')).toContain('邮件已发送')
    expect(html([form], 'sent')).toContain('官网表单已联系')
    expect(html([form], 'unknown')).toContain('发送记录待确认')
    expect(html([form], 'unknown')).not.toContain('邮件未发送')
    for (const log of [[], [{ ...form, voidedAt: '2026-10-20T02:00:00Z' }]]) expect(html(log)).not.toContain('customer-channel-status')
  })
  it('shows channel contact and its own date in both card views, without substituting the follow-up date', () => {
    for (const variant of ['card', 'row'] as const) {
      const render = (currentWork = work, currentLedger = ledger) => renderToStaticMarkup(createElement(LeadCard, { lead, work: currentWork, ledger: currentLedger, variant, onSelect: () => {}, onOpenDetail: () => {}, onHighlight: () => {} }))
      const markup = render()
      expect(markup).toContain('data-contact-channel="form"')
      expect(markup).toContain('dateTime="2026-10-20"')
      expect(markup).toContain('下次跟进：')
      expect(markup).toContain('dateTime="2026-10-27"')
      expect(markup).toContain('未查到发送记录')
      expect(render({ ...work, status: 'error' })).not.toContain('data-contact-channel')
      expect(render(work, { ...ledger, status: 'error' })).toContain('发送记录读取失败')
      expect(render(work, { ...ledger, sends: [sent], activeSend: () => sent })).toContain('邮件已发送')
    }
  })
  it('keeps company navigation, detail header and draft banner consistent without marking any email sent', () => {
    const detail = renderToStaticMarkup(createElement(CompanyDetail, { lead, work, ledger, leads: [lead], onClose: () => {}, onNavigate: () => {} }))
    expect(detail).toMatch(/company-header-send-status[^]*data-contact-channel="form"/)
    expect(detail).toContain('未查到发送记录')
    const draft = renderToStaticMarkup(createElement(DevelopmentEmailPanel, { lead, work, ledger }))
    expect(draft).toContain('outreach-send-banner-contacted')
    expect(draft).toContain('首封参考 · 已有其他渠道联系记录')
    expect(draft).toContain('已有其他渠道联系记录，请先核对再决定是否发送邮件。')
    expect(draft).toContain('outreach-email-preview')
    expect(ledger.sends).toEqual([])
    expect(work.records[key].contactLog).toEqual([form])
  })
})
