import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it } from 'vitest'
import { businessFactPending, presentBusinessFact, readableBusinessFact } from '../src/lib/leadBusinessFactPresentation'
import { publicLeads } from '../src/lib/productMarketMap'
import { leadCardBrief } from '../src/lib/leadCardBrief'
import { replaceRefreshedLeadFacts } from '../src/lib/publicLeadOverrides'
import { LeadCard } from '../src/features/market/LeadCard'
import type { OutreachLedger } from '../src/features/market/useOutreachLedger'
import type { LeadWork } from '../src/features/market/useLeadWork'

afterEach(()=>replaceRefreshedLeadFacts({}))
describe('readable business facts on customer cards',()=>{
  it('gives every current customer a brief factual description without audit notes',()=>{
    for(const lead of publicLeads){
      const brief=leadCardBrief(lead)
      expect(brief.fact,lead.id).not.toBe(businessFactPending)
      expect(readableBusinessFact(brief.fact),lead.id).toBe(true)
      expect(brief.fact.length,lead.id).toBeLessThanOrEqual(110)
      expect(brief.fact,lead.id).not.toMatch(/不把|保留其角色|原文|核验|邮箱|本轮|采购未确认/)
    }
  })
  it('keeps the wood-coating company’s actual oil and epoxy products distinct from our material',()=>{
    const otani=publicLeads.find(lead=>lead.id==='otani-paint-osaka')!
    expect(leadCardBrief(otani).fact).toContain('VATON-FX')
    expect(leadCardBrief(otani).fact).toContain('天然植物油')
    expect(leadCardBrief(otani).fact).toContain('浇注环氧体系')
    expect(leadCardBrief(otani).fact).not.toContain('ELO')
    const bird=publicLeads.find(lead=>lead.id==='bird-brand-feltwell')!
    expect(leadCardBrief(bird).fact).toContain('棚屋、围栏')
    expect(leadCardBrief(bird).fact).not.toMatch(/生物杀灭|不把|我方性能/)
  })
  it('preserves factual restrictions and does not strip meaningful words such as retaining wood grain',()=>{
    expect(leadCardBrief(publicLeads.find(lead=>lead.id==='asahipen-osaka')!).fact).toContain('地板除外')
    const fact='仅制造室内木材涂料，不适用于地板。'
    expect(presentBusinessFact(fact)).toBe(fact)
    expect(readableBusinessFact('水稀释底漆保留木纹，用于木器面漆下。')).toBe(true)
    const limitation='官网仅确认涂料销售；自主制造待核实。'
    expect(presentBusinessFact(limitation)).toBe(limitation)
  })
  it('keeps a changed or unknown source from falling back to long audit notes or truncated assertions',()=>{
    const lead=publicLeads.find(lead=>lead.id==='bird-brand-feltwell')!
    const statement='本轮独立核验：官网说明销售木器涂料，仍需核对自主制造，不把销售写成生产。'
    const updated={...lead,companyEvidence:{...lead.companyEvidence,statement}}
    expect(leadCardBrief(updated).fact).toBe(businessFactPending)
    const long='生产工业涂料，'+ '用途及配方条件需逐案确认，'.repeat(20)+'不适用于木材。'
    expect(presentBusinessFact(long)).toBe(businessFactPending)
  })
  it('rejects an older refreshed audit summary and uses the matching reviewed business fact',()=>{
    const lead=publicLeads.find(lead=>lead.id==='otani-paint-osaka')!
    replaceRefreshedLeadFacts({[lead.id]:{statement:lead.companyEvidence.statement,business:lead.companyEvidence.statement}})
    expect(leadCardBrief(lead).fact).toContain('VATON-FX')
    expect(leadCardBrief(lead).fact).not.toMatch(/保留其角色|不把|核验|原文/)
  })
  it('retains full verbatim evidence, sources, dates and boundaries inside the disclosure',()=>{
    const lead=publicLeads.find(lead=>lead.id==='otani-paint-osaka')!
    const ledger={status:'ready',sends:[],activeSend:()=>null} as unknown as OutreachLedger
    const work={status:'ready',records:{},busy:false} as unknown as LeadWork
    const html=renderToStaticMarkup(createElement(LeadCard,{lead,ledger,work,onSelect:()=>{},onOpenDetail:()=>{},onHighlight:()=>{}}))
    const reason=html.match(/class="customer-card-reason">([\s\S]*?)<\/p>/)![1]
    const summary=html.match(/<summary>([\s\S]*?)<\/summary>/)![1]
    expect(reason).toContain('VATON-FX')
    expect(reason).not.toMatch(/不把|保留其角色|核验|原文/)
    expect(summary).toContain('完整依据')
    expect(summary).not.toContain('采购未确认')
    const escaped=renderToStaticMarkup(createElement('p',null,lead.companyEvidence.statement)).slice(3,-4)
    expect(html).toContain(escaped)
    expect(html).toContain(lead.companyEvidence.sourceUrl.replaceAll('&','&amp;'))
    expect(html).toContain(lead.companyEvidence.verifiedAt)
    expect(html.indexOf('适配待评估 · 采购未确认')).toBeGreaterThan(html.indexOf('customer-evidence-original'))
  })
})
