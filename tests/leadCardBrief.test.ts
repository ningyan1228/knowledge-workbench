import { describe, expect, it } from 'vitest'
import { publicLeads } from '../src/lib/productMarketMap'
import { leadCardBrief, leadCardContactChannels } from '../src/lib/leadCardBrief'
import { savedLeadBusinessFact } from '../src/lib/leadBusinessFacts'

const lead = (id: string) => publicLeads.find(item => item.id === id)!

describe('three customer-card decisions', () => {
  it('uses company-specific facts and invalidates a summary when its source statement changes', () => {
    const wood = lead('polyvine-cheddar')
    expect(leadCardBrief(wood).fact).toContain('Cheddar')
    expect(leadCardBrief(wood).fact).toContain('2K-POLY86')
    expect(leadCardBrief(lead('chimtitan-bucharest')).fact).toContain('Series 302')
    expect(leadCardBrief(lead('tnue-taupo')).fact).toContain('尿素颗粒')
    const updated = { ...wood, companyEvidence: { ...wood.companyEvidence, statement: '官网仅确认涂料销售；自主制造待核实。' } }
    expect(savedLeadBusinessFact(updated)).toBeUndefined()
    expect(leadCardBrief(updated).fact).toBe(updated.companyEvidence.statement)
    expect(leadCardBrief({ ...wood, id: 'new-unreviewed-summary' }).fact).not.toContain('2K-POLY86 为')
  })

  it('keeps the material, application and evaluation boundary distinct from customer purchasing', () => {
    const wood = leadCardBrief(lead('polyvine-cheddar'))
    expect(wood.product).toBe('NL-W1201')
    expect(wood.evaluation).toContain('水性聚烯烃')
    expect(wood.evaluation).toContain('木材底涂')
    expect(wood.evaluation).not.toContain('未处理 PP')
    const ink = leadCardBrief(lead('teknova-esenyurt'))
    expect(ink.evaluation).toContain('底涂评估')
    expect(ink.extended).toBe(true)
    expect(ink.evaluation).not.toContain('直接添加')
    const pvc = leadCardBrief(lead('vinyl-base-ipoh'))
    expect(pvc.evaluation).toContain('辅助增塑评估')
    expect(pvc.evaluation).not.toMatch(/医疗|替代|认证/)
    const coating = leadCardBrief(lead('chimtitan-bucharest'))
    expect(coating.evaluation).toContain('反应性环氧基')
    expect(coating.evaluation).toContain('树脂改性评估')
    expect(coating.evaluation).not.toMatch(/防腐|保证|已相容/)
    const fertilizer = leadCardBrief(lead('rcf-mumbai'))
    expect(fertilizer.evaluation).toContain('我方聚氨酯路线')
    expect(fertilizer.evaluation).not.toMatch(/客户采用|相同体系|释放期/)
    expect(leadCardBrief({ ...lead('polyvine-cheddar'), supplierCompetitorCheck: undefined }).evaluation).toBe('应用关联待补证据')
  })

  it('shows actual public channels and an explicit email gap without inventing a form or WhatsApp', () => {
    const company = lead('aexcel-mentor')
    const routes = leadCardContactChannels(company)
    expect(routes.missingEmail).toBe(true)
    expect(routes.channels.find(channel => channel.kind === 'website')).toMatchObject({ label: '官网联系页', href: company.profile.contactPage })
    expect(routes.channels.some(channel => channel.kind === 'phone')).toBe(true)
    expect(routes.channels.some(channel => channel.kind === 'whatsapp')).toBe(false)
    expect(routes.channels.some(channel => channel.label === '官网表单')).toBe(false)
    const withWhatsApp = publicLeads.find(item => item.profile.whatsapp?.startsWith('https://wa.me/'))!
    expect(leadCardContactChannels(withWhatsApp).channels.find(channel => channel.kind === 'whatsapp')?.href).toBe(withWhatsApp.profile.whatsapp)
    const withEmail = leadCardContactChannels(lead('colorificio-feroni-oppeano'))
    expect(withEmail.missingEmail).toBe(false)
    expect(withEmail.channels.find(channel => channel.kind === 'email')?.href).toMatch(/^mailto:/)
  })

  it('does not make unowned email or unsafe social URLs actionable', () => {
    const company = lead('polyvine-cheddar')
    const unsafe = { ...company, profile: { ...company.profile, contacts: [], departmentEmails: [], generalEmail: 'wrong@example.org', generalEmailEvidence: { ...company.profile.generalEmailEvidence!, company: 'Another company' }, linkedIn: 'https://linkedin.com.evil.org/company/fake', whatsapp: 'https://wa.me.evil.org/123', contactPage: 'javascript:alert(1)', website: undefined } }
    const routes = leadCardContactChannels(unsafe)
    expect(routes.missingEmail).toBe(true)
    expect(routes.channels.some(channel => ['email', 'linkedin', 'whatsapp', 'website'].includes(channel.kind))).toBe(false)
  })
})
