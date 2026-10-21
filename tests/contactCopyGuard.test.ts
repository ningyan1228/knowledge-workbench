import { afterEach, describe, expect, it, vi } from 'vitest'
import { confirmContactCopy, type ContactCopyAction } from '../src/lib/contactCopyGuard'
import { publicLeads } from '../src/lib/productMarketMap'
import { outreachCompanyKey, type OutreachSend } from '../src/lib/outreachLedger'
import type { ContactLogEntry } from '../src/lib/contactRoutes'
import type { OutreachLedger } from '../src/features/market/useOutreachLedger'
import type { LeadWork } from '../src/features/market/useLeadWork'

const lead = publicLeads.find(item => item.id === 'polyvine-cheddar')!
const send = { sent_on:'2026-10-20', recipient_email:'previous@example.org' } as OutreachSend
const contact: ContactLogEntry = { id:'contact', channel:'linkedin', destination:'https://www.linkedin.com/company/example/', contactedOn:'2026-10-19', recordedAt:'2026-10-19T08:00:00Z' }
function setup(sent: OutreachSend | null = null, log: ContactLogEntry[] = []) {
  const confirm = vi.fn((_message: string) => true)
  vi.stubGlobal('window', { confirm })
  const checkBeforeOutreach = vi.fn(async () => sent)
  const fetchCurrentRecords = vi.fn(async () => ({ [outreachCompanyKey(lead)]: { contactLog:log } }))
  return { confirm, checkBeforeOutreach, fetchCurrentRecords, ledger:{status:'ready', checkBeforeOutreach} as unknown as OutreachLedger, work:{status:'ready', fetchCurrentRecords} as unknown as LeadWork }
}
const signal = () => new AbortController().signal
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

describe('fresh company contact checks before copying', () => {
  it('reads both histories every time and does not prompt for a freshly unrecorded company', async () => {
    const f = setup()
    for (let i=0; i<2; i++) expect(await confirmContactCopy(lead,f.ledger,f.work,'邮箱',signal())).toEqual({sent:null})
    expect(f.checkBeforeOutreach).toHaveBeenCalledTimes(2)
    expect(f.fetchCurrentRecords).toHaveBeenCalledTimes(2)
    expect(f.confirm).not.toHaveBeenCalled()
  })
  it.each<ContactCopyAction>(['邮箱','主题','正文','整封开发信'])('warns and honors cancellation for %s after either type of contact', async action => {
    for (const [sent,log] of [[send,[]],[null,[contact]]] as Array<[OutreachSend | null,ContactLogEntry[]]>) {
      const f = setup(sent,log)
      f.confirm.mockReturnValue(false)
      expect(await confirmContactCopy(lead,f.ledger,f.work,action,signal())).toBeNull()
      expect(f.confirm).toHaveBeenCalledWith(expect.stringContaining(`仍要复制${action}吗`))
      expect(f.confirm).toHaveBeenCalledWith(expect.stringContaining(lead.company))
    }
  })
  it('shows both histories together and retains the sent reference after confirmation', async () => {
    const f = setup(send,[contact])
    expect(await confirmContactCopy(lead,f.ledger,f.work,'正文',signal())).toEqual({sent:send})
    expect(f.confirm).toHaveBeenCalledTimes(1)
    const text=f.confirm.mock.calls[0][0] as string
    for(const part of ['2026-10-20','previous@example.org','2026-10-19','LinkedIn',contact.destination,'保留原参考稿']) expect(text).toContain(part)
  })
  it('ignores voided channel records', async () => {
    const f=setup(null,[{...contact,voidedAt:'2026-10-20T00:00:00Z'}])
    await confirmContactCopy(lead,f.ledger,f.work,'主题',signal())
    expect(f.confirm).not.toHaveBeenCalled()
  })
  it('never assumes an unreadable shared ledger is unsent', async () => {
    const f=setup()
    await expect(confirmContactCopy(lead,{...f.ledger,status:'error'},f.work,'邮箱',signal())).rejects.toThrow('尚未连接')
    expect(f.checkBeforeOutreach).not.toHaveBeenCalled()
    expect(f.confirm).not.toHaveBeenCalled()
  })
  it('blocks a failed fresh private-history read rather than trusting cached records', async () => {
    const f=setup()
    f.fetchCurrentRecords.mockRejectedValue(new Error('Private read failed'))
    await expect(confirmContactCopy(lead,f.ledger,f.work,'正文',signal())).rejects.toThrow('Private read failed')
    expect(f.confirm).not.toHaveBeenCalled()
  })
  it('explicitly warns when private records are disconnected', async () => {
    const f=setup()
    await confirmContactCopy(lead,f.ledger,{...f.work,status:'login_required'},'邮箱',signal())
    expect(f.confirm).toHaveBeenCalledWith(expect.stringContaining('其他渠道是否已联系仍待确认'))
  })
  it('cancels promptly on customer change and never opens a late confirmation', async () => {
    const f=setup()
    f.checkBeforeOutreach.mockImplementation(() => new Promise(() => {}))
    const controller=new AbortController()
    const result=confirmContactCopy(lead,f.ledger,f.work,'邮箱',controller.signal)
    const rejection=expect(result).rejects.toThrow('已取消')
    controller.abort(); await rejection
    expect(f.confirm).not.toHaveBeenCalled()
  })
  it('times out stalled history reads without permitting a copy', async () => {
    vi.useFakeTimers()
    const f=setup()
    f.fetchCurrentRecords.mockImplementation(() => new Promise(() => {}))
    const result=confirmContactCopy(lead,f.ledger,f.work,'邮箱',signal())
    const rejection=expect(result).rejects.toThrow('核对超时')
    await vi.advanceTimersByTimeAsync(8000); await rejection
    expect(f.confirm).not.toHaveBeenCalled()
  })
})
