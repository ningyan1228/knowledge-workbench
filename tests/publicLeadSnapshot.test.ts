import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchPublicLeadSnapshot, installPublicLeadSnapshot, validatePublicLeadSnapshot, type PublicLeadSnapshot } from '../src/lib/publicLeadSnapshot'
import { publicLeads } from '../src/lib/productMarketMap'
import { leadTimelineSummary } from '../src/lib/leadTimelineSummary'
import { recordedTime, shanghaiDay } from '../src/lib/leadTimeline'
import { createShortDevelopmentEmail } from '../src/lib/shortDevelopmentEmail'
import { leadCardBrief } from '../src/lib/leadCardBrief'

const original=JSON.parse(execFileSync(process.execPath,['--experimental-strip-types','scripts/export-public-lead-data.mjs'],{encoding:'utf8',maxBuffer:16*1024*1024})) as PublicLeadSnapshot
const clone=()=>structuredClone(original)
afterEach(()=>{installPublicLeadSnapshot(original);vi.restoreAllMocks()})
describe('published customer data refresh',()=>{
  it('exports only the existing public frontend data in a coherent valid snapshot',()=>{
    expect(validatePublicLeadSnapshot(original)).toBe(original)
    expect(original.leads.map(lead=>lead.id)).toEqual(publicLeads.map(lead=>lead.id))
    expect(Object.keys(original).sort()).toEqual(['schemaVersion','leads','timeline','facts','products','tdsApplications','extendedApplications','targetTypes'].sort())
  })
  it('applies customers, first-recorded dates, concise business facts and drafts together',()=>{
    const next=clone(), template=next.leads.find(lead=>lead.id==='colorificio-feroni-oppeano')!
    const lead={...structuredClone(template),id:'refresh-test',company:'Refresh fixture',companyEvidence:{...template.companyEvidence,statement:'A newly verified company application.'}}
    const time='2026-10-22T02:00:00Z', today=shanghaiDay(time)
    next.leads.push(lead);next.timeline[lead.id]={recordedAt:time,commit:'fixture'}
    next.facts[lead.id]={statement:lead.companyEvidence.statement,email:'Your old reference fact.',concise:'Your verified application fact.',business:'生产木器涂料。'}
    const before=leadTimelineSummary(publicLeads,today).today
    installPublicLeadSnapshot(validatePublicLeadSnapshot(next))
    expect(publicLeads.some(item=>item.id===lead.id)).toBe(true)
    expect(recordedTime(lead)).toBe(time)
    expect(leadTimelineSummary(publicLeads,today).today).toBe(before+1)
    expect(leadCardBrief(lead).fact).toBe('生产木器涂料。')
    expect(createShortDevelopmentEmail(lead)?.body).toContain('Your verified application fact.')
    expect(createShortDevelopmentEmail(lead,undefined,'legacy')?.body).toContain('Your old reference fact.')
  })
  it('does not reuse an old fact when refreshed evidence has lost its reviewed draft',()=>{
    const next=clone(),lead=next.leads.find(lead=>lead.id==='colorificio-feroni-oppeano')!
    next.facts[lead.id]={statement:lead.companyEvidence.statement}
    installPublicLeadSnapshot(validatePublicLeadSnapshot(next))
    expect(createShortDevelopmentEmail(lead)).toBeNull()
    expect(createShortDevelopmentEmail(lead,undefined,'legacy')).toBeNull()
  })
  it.each(['incompatible','duplicate','missing-fact','bad-time','unqualified','wrong-application'])('rejects %s before touching the current dataset',kind=>{
    const next=clone()
    if(kind==='incompatible')(next as {schemaVersion:number}).schemaVersion=2
    if(kind==='duplicate')next.leads.push(next.leads[0])
    if(kind==='missing-fact')delete next.facts[next.leads[0].id]
    if(kind==='bad-time')next.timeline[next.leads[0].id]={recordedAt:'not a date',commit:'fixture'}
    if(kind==='unqualified')next.leads[0].leadEligible=false
    if(kind==='wrong-application')next.leads[0].companyEvidence.applicationId='missing'
    const before=publicLeads.slice()
    expect(()=>validatePublicLeadSnapshot(next)).toThrow()
    expect(publicLeads).toEqual(before)
  })
  it('fetches a cache-bypassing manifest and matching hashed data under the Pages subpath',async()=>{
    const source=JSON.stringify(original),version=createHash('sha256').update(source).digest('hex')
    const request=vi.fn<typeof fetch>().mockResolvedValueOnce(new Response(JSON.stringify({schemaVersion:1,version,file:`customer-data-${version}.json`}))).mockResolvedValueOnce(new Response(source))
    const signal=new AbortController().signal
    const result=await fetchPublicLeadSnapshot(new URL('https://example.test/knowledge-workbench/'),signal,request)
    expect(result.leads).toHaveLength(original.leads.length)
    expect(String(request.mock.calls[0][0])).toMatch(/^https:\/\/example.test\/knowledge-workbench\/customer-data.json\?refresh=/)
    expect(String(request.mock.calls[1][0])).toBe(`https://example.test/knowledge-workbench/customer-data-${version}.json`)
    for(const [,options]of request.mock.calls)expect(options).toMatchObject({cache:'no-store',signal,redirect:'error'})
  })
  it('rejects mismatched hashes and keeps old data on a failed fetch',async()=>{
    const version='a'.repeat(64),before=publicLeads.slice()
    const request=vi.fn<typeof fetch>().mockResolvedValueOnce(new Response(JSON.stringify({schemaVersion:1,version,file:`customer-data-${version}.json`}))).mockResolvedValueOnce(new Response(JSON.stringify(original)))
    await expect(fetchPublicLeadSnapshot(new URL('https://example.test/'),new AbortController().signal,request)).rejects.toThrow('校验失败')
    expect(publicLeads).toEqual(before)
    const failed=vi.fn<typeof fetch>().mockResolvedValue(new Response('',{status:503}))
    await expect(fetchPublicLeadSnapshot(new URL('https://example.test/'),new AbortController().signal,failed)).rejects.toThrow('暂不可用')
  })
  it('rejects an incompatible or external manifest path without fetching its asset',async()=>{
    const request=vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({schemaVersion:1,version:'a'.repeat(64),file:'https://other.example/data.json'})))
    await expect(fetchPublicLeadSnapshot(new URL('https://example.test/'),new AbortController().signal,request)).rejects.toThrow('不兼容')
    expect(request).toHaveBeenCalledTimes(1)
  })
})
