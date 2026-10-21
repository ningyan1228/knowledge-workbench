import type { PublicLead } from './productMarketMap'
import { qualifiedContactCompany, selectBusinessRecipient } from './contactEvidence'
import { customerContactRoutes } from './contactRoutes'
import { functionalProductPitch } from './functionalProductPitch'
import { leadBusinessEvidenceBrief } from './leadBusinessEvidence'
import { savedLeadBusinessFact } from './leadBusinessFacts'

export function leadCardBrief(lead: PublicLead) {
  const pitch = qualifiedContactCompany(lead) ? functionalProductPitch(lead) : null
  return {
    fact: (savedLeadBusinessFact(lead) ?? leadBusinessEvidenceBrief(lead.companyEvidence.statement, lead.company)) || '业务事实待补证据',
    product: ({ 'fertilizer-coating': '肥料包膜原料', 'nl-w1201': 'NL-W1201', elo: 'ELO 环氧化亚麻油' })[lead.productId],
    evaluation: pitch?.cardEvaluation ?? '应用关联待补证据',
    limits: pitch?.limits,
    extended: lead.companyEvidence.applicationLayer === 'market-extended',
  }
}

export function leadCardContactChannels(lead: PublicLead) {
  const recipient = selectBusinessRecipient(lead)
  const routes = customerContactRoutes(lead)
  const channels: Array<{ kind: 'email' | 'website' | 'linkedin' | 'whatsapp' | 'phone'; label: string; href: string; description: string }> = []
  if (recipient) channels.push({ kind: 'email', label: '公开邮箱', href: `mailto:${encodeURIComponent(recipient.email).replace(/%40/gi, '@')}`, description: `${recipient.label}：${recipient.email}` })
  if (routes.contactPage) channels.push({ kind: 'website', label: '官网联系页', href: routes.contactPage, description: '查看官网联系页；表单是否可用以该页为准' })
  else if (routes.website) channels.push({ kind: 'website', label: '公司官网', href: routes.website, description: '查看公司官网；具体联系入口待核对' })
  if (routes.linkedin) channels.push({ kind: 'linkedin', label: 'LinkedIn', href: routes.linkedin, description: '公开 LinkedIn 入口' })
  if (routes.whatsapp) channels.push({ kind: 'whatsapp', label: 'WhatsApp', href: routes.whatsapp, description: '已保存的公开 WhatsApp 链接' })
  if (routes.phone) channels.push({ kind: 'phone', label: '公开电话', href: `tel:${routes.phone.replace(/\s/g, '')}`, description: `公开业务电话：${routes.phone}` })
  return { channels, missingEmail: !recipient }
}
