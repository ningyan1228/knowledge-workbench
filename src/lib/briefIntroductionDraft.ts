import type { PublicLead } from './productMarketMap'

export type CompanyOutreachDraft = {
  format: 'brief-introduction-20261127'
  companyId: string
  productId: PublicLead['productId']
  subject: string
  body: string
  companyFact: string
  evidenceUrl: string
  verifiedAt: string
  bodyWordCount: number
}

const names: Record<PublicLead['productId'], string> = {
  'nl-8260': 'waterborne chlorinated polyolefin adhesion promoter',
  'nl-h-860': 'water-based chlorinated polypropylene dispersion',
  'nl-w1201': 'NL-W1201 water-based surface treatment agent',
  'cpp-cpo': 'MAH-modified CPP/CPO',
  elo: 'epoxidized linseed oil (ELO)',
  'fertilizer-coating': 'controlled-release fertilizer coating material',
}
export const briefIntroductionSubject = (productId: PublicLead['productId']) => `${names[productId]} — a brief introduction`

function materialIntroduction(lead: PublicLead) {
  const application = lead.companyEvidence.applicationId
  if (lead.productId === 'nl-8260') return `We supply NL-8260, a waterborne CPO adhesion promoter for ${application === 'nl8260-pp-opp-inks' ? 'ink' : application === 'nl8260-adhesives' ? 'adhesive' : 'coating'} formulation trials.`
  if (lead.productId === 'nl-h-860') return application === 'nlh860-plastic-bonding' || application === 'nlh860-rubber-bonding'
    ? `We supply NL-H-860, a water-based CPP dispersion for ${application === 'nlh860-plastic-bonding' ? 'plastic' : 'rubber'} adhesion trials.`
    : 'We supply NL-H-860, a water-based CPP dispersion for wetting and penetration trials in water-based formulations.'
  if (lead.productId === 'nl-w1201') return 'We supply NL-W1201, a water-based polyolefin dispersion for primer and adhesion-promoting formulations.'
  if (lead.productId === 'cpp-cpo') return 'We supply MAH-modified CPP/CPO for PP adhesion-formulation trials.'
  if (lead.productId === 'fertilizer-coating') return 'We supply a reactive raw material for polyurethane fertilizer-coating formulations.'
  return application === 'elo-pvc-plasticizer' ? 'We supply ELO, a bio-based additive for secondary-plasticizer trials in PVC formulations.' : 'We supply ELO, an epoxy-functional additive for formulation-dependent flexibility trials.'
}

/** User-approved 2026-11-27 format. Saving a draft never marks contact or sending. */
export function buildBriefIntroductionDraft(lead: PublicLead, companyFact: string): CompanyOutreachDraft {
  if (!companyFact.trim() || !names[lead.productId] || !/^https:\/\//.test(lead.companyEvidence.sourceUrl)) throw new Error('A sourced company fact and product are required')
  const paragraphs = [companyFact, `I'm Zhiwu from Ningbo Neon Lion Technology Co., Ltd. ${materialIntroduction(lead)}`, 'Would your technical or sourcing team review its TDS for an initial evaluation?', "If you don't handle raw-material evaluation, could you point me to the right person?"]
  const signature = 'Best regards,\nZhiwu\nNingbo Neon Lion Technology Co., Ltd.\nEmail: zhiwu@neonlion.cn'
  let body = `Hi ${lead.company} Team,\n\n${paragraphs.join('\n\n')}\n\n${signature}`
  if (body.trim().split(/\s+/).length > 95) body = `Dear Team,\n\n${paragraphs.join('\n\n')}\n\n${signature}`
  const bodyWordCount = body.trim().split(/\s+/).length
  if (bodyWordCount < 55 || bodyWordCount > 95) throw new Error('Draft requires a reviewed company fact within the 55–95 word limit')
  return { format:'brief-introduction-20261127', companyId:lead.id, productId:lead.productId, subject:briefIntroductionSubject(lead.productId), body, companyFact, evidenceUrl:lead.companyEvidence.sourceUrl, verifiedAt:lead.companyEvidence.verifiedAt, bodyWordCount }
}

export function validBriefIntroductionDraft(draft: CompanyOutreachDraft, lead: Pick<PublicLead,'id'|'productId'|'companyEvidence'>, companyFact: string): boolean {
  if (!draft || draft.format !== 'brief-introduction-20261127' || draft.companyId !== lead.id || draft.productId !== lead.productId || draft.subject !== briefIntroductionSubject(lead.productId) || draft.companyFact !== companyFact || draft.evidenceUrl !== lead.companyEvidence.sourceUrl || draft.verifiedAt !== lead.companyEvidence.verifiedAt || typeof draft.body !== 'string') return false
  const words = draft.body.trim().split(/\s+/).length
  return words >= 55 && words <= 95 && words === draft.bodyWordCount && draft.body.includes(companyFact) && draft.body.includes("I'm Zhiwu from Ningbo Neon Lion Technology Co., Ltd. We supply") && draft.body.includes('review its TDS for an initial evaluation?') && draft.body.includes('could you point me to the right person?') && draft.body.endsWith('Best regards,\nZhiwu\nNingbo Neon Lion Technology Co., Ltd.\nEmail: zhiwu@neonlion.cn') && !/free sample|quotation|guaranteed|certified|lowest price/i.test(draft.body)
}
