import { createShortDevelopmentEmail } from './shortDevelopmentEmail'
import { selectBusinessRecipient } from './contactEvidence'
import {
  type ApplicationLayer,
  type MarketExtendedApplication,
  type MarketProduct,
  type PublicLead,
  type TargetCompanyType,
  type TdsVerifiedApplication,
} from './productMarketMap'

type Application = TdsVerifiedApplication | MarketExtendedApplication

type Recipient = {
  name: string
  title: string
  source: string
  category: 'procurement' | 'technical' | 'production' | 'management' | 'general'
}

type ProductReference = {
  positioning: string
  allowedFacts: string[]
  prohibitedClaims: string[]
}

// This is the browser-safe counterpart of b2b-development-email-writer's
// product references. It intentionally contains only TDS-backed facts and
// drafting guardrails so a copied prompt can be used without a local Skill.
const productReferences: Record<MarketProduct['id'], ProductReference> = {
  'fertilizer-coating': {
    positioning: 'Reactive raw material for slow-release and controlled-release fertilizer coating systems.',
    allowedFacts: [
      'Hydroxyl value: 249 mg KOH/g.',
      'Viscosity at 25°C: 683 mPa·s.',
      'Water content: 0.3%.',
      'Acid value: 0.51 mg KOH/g.',
      'Compatible coating processes: drum coating and fluidized-bed coating.',
      'The product information describes good flowability/spraying behavior and film formation in mainstream fertilizer-coating equipment.',
      'The product information describes customizable release periods and polyurethane-coated urea applications. This is a product-reference fact only, not a claim about the customer’s coating chemistry.',
    ],
    prohibitedClaims: [
      'Do not claim the company currently uses polyurethane or the same coating chemistry.',
      'Do not claim the company has a coating problem, replacement plan, purchasing plan, volume, certification, or confirmed need.',
    ],
  },
  'nl-w1201': {
    positioning: 'NL-W1201 Water-Based Surface Treatment Agent is a water-based polyolefin emulsion positioned as a primer, adhesion promoter, and water-based resin dispersion. Its primary verified use is as an adhesion promoter for untreated PP substrates.',
    allowedFacts: [
      'TDS-verified substrates: PP, PE, OPP, PET, ABS, PVC, glass, aluminum, and wood.',
      'Appearance: milky white liquid.',
      'Solid content: 45 ± 2%.',
      'pH: 7–8.',
      'Solvent: water.',
      'Viscosity: ≤ 1000.',
      'Compatible with acrylic emulsions, polyurethane emulsions, and other water-based products.',
      'Aluminum must not be generalized to all metals.',
    ],
    prohibitedClaims: [
      'Do not claim printing, automotive, flexible-packaging, ink, tape, or label suitability unless the company-specific market-extension evidence below supports it.',
      'Do not invent adhesion values, test results, or customer performance outcomes.',
    ],
  },
  elo: {
    positioning: 'Bio-based functional additive derived from natural linseed oil. CAS: 8016-11-3.',
    allowedFacts: [
      'TDS-verified applications: polymer plasticizer, polymer stabilizer, coatings, adhesives, inks, sealants, and resin modification.',
      'The TDS describes contributions to flexibility, processability, thermal stability, and aging resistance.',
      'Depending on formulation, reactive epoxy groups are described as useful for adhesion, toughness, and chemical resistance.',
      'Epoxy value: ≥ 9.0%.',
      'Acid value: ≤ 0.5 mg KOH/g.',
      'Moisture: ≤ 0.3%.',
      'Viscosity at 25°C: 700–1200 cP.',
      'Flash point: > 280°C.',
      'Appearance: pale yellow liquid.',
    ],
    prohibitedClaims: [
      'Do not claim replacement of a specific plasticizer, regulated-use approval, or performance beyond the TDS wording.',
      'Do not claim the company already uses epoxidized vegetable oil.',
      'Do not claim PVC applicability unless the sourced market-extension evidence below is present.',
      'Do not claim our ELO grade has been tested or qualified for heavy-duty anticorrosion service; independent coating research is not customer-specific formulation or performance evidence.',
    ],
  },
}

function recipientCategory(value: string) {
  if (/procurement|purchasing|sourcing|supply.chain/i.test(value)) return 'procurement' as const
  if (/technical|r&d|research|\bproduct\b/i.test(value)) return 'technical' as const
  if (/production|plant|manufactur/i.test(value)) return 'production' as const
  if (/director|manager|management|general manager|owner|president|ceo/i.test(value)) return 'management' as const
  return 'general' as const
}

function recipientFor(lead: PublicLead): Recipient {
  const recipient = selectBusinessRecipient(lead)
  if (recipient) return {
    name: recipient.name ?? (recipient.label.includes('部门邮箱') ? `${recipient.label.split(' ')[0]} Team` : 'General Team'),
    title: recipient.label,
    category: recipientCategory(recipient.label),
    source: `Identity: ${recipient.identitySources?.map((source) => `${source.label} — ${source.url}`).join('; ') ?? 'Company / department mailbox; no person attributed'}\nEmail: ${recipient.emailSources.map((source) => `${source.label} — ${source.url}`).join('; ')}\nEmail evidence date: ${recipient.verifiedAt ?? 'Legacy company source; separate verification pending'}`,
  }

  return {
    name: `${lead.company} Team`,
    title: 'No named public contact verified',
    category: 'general',
    source: lead.profile.contactPage ?? lead.profile.website ?? lead.companyEvidence.sourceUrl,
  }
}

function ctaFor(recipient: Recipient) {
  const ctas: Record<Recipient['category'], string> = {
    procurement: 'Ask whether the procurement / sourcing team would be open to evaluating an external raw material for the relevant formulation, and offer the TDS and a sample if relevant.',
    technical: 'Ask whether the technical / R&D team would be interested in a formulation or laboratory evaluation, and offer the TDS and a sample if relevant.',
    production: 'Ask whether the material could be relevant to the production system, and offer the TDS and a technical evaluation route if relevant.',
    management: 'Ask whether the recipient could direct the message to the person responsible for raw-material purchasing or technical evaluation; offer the TDS and a sample if relevant.',
    general: 'Ask the company team to route the message to the appropriate Technical / Procurement contact, and offer the TDS and a sample if relevant.',
  }
  return ctas[recipient.category]
}

function applicationBlock(layer: ApplicationLayer, application: Application) {
  if (layer === 'tds-verified') return `TDS-verified application: ${application.nameEn}\nTDS source: ${(application as TdsVerifiedApplication).sourceDocument}`
  const extension = application as MarketExtendedApplication
  return `Sourced market-extension application: ${extension.nameEn}\nIndependent extension source: ${extension.sourceName}\nExtension URL: ${extension.sourceUrl}\nExtension verified at: ${extension.verifiedAt}`
}

export function createDevelopmentEmailPrompt({
  lead,
  product,
  application,
  targetType,
  style = 'concise',
}: {
  lead: PublicLead
  product: MarketProduct
  application: Application
  targetType: TargetCompanyType
  style?: 'concise' | 'legacy'
}) {
  if (!createShortDevelopmentEmail(lead) || product.id !== lead.productId || application.id !== lead.companyEvidence.applicationId || application.productId !== lead.productId || targetType.id !== lead.targetCompanyTypeId || targetType.productId !== lead.productId) return 'Not qualified for outreach\n\nReason:\nThe verified product, application, demand-side evidence, supplier exclusion or contact chain is incomplete or inconsistent.'
  const recipient = recipientFor(lead)
  const reference = productReferences[product.id]
  return `Write a concise, personalized English B2B first-contact email and two follow-ups using only the verified information below. This is a potential-fit outreach, not a confirmed purchase opportunity. Do not send an email or submit any form.

Company
Company: ${lead.company}
Country: ${lead.country}
City: ${lead.city}
Website: ${lead.profile.website ?? 'Not publicly verified'}

Recipient
Name / team: ${recipient.name}
Title / role: ${recipient.title}
Public contact source: ${recipient.source}

Product match
Product: ${product.name} (${product.nameEn})
${applicationBlock(lead.companyEvidence.applicationLayer, application)}
Target company type: ${targetType.nameEn}
Downstream-use rationale: ${lead.demandSideReason}

Supplier / competitor exclusion
Verified at: ${lead.supplierCompetitorCheck!.checkedAt}
Conclusion: ${lead.supplierCompetitorCheck!.conclusion}

Company evidence (use this for the personalized first paragraph)
Evidence: ${lead.companyEvidence.statement}
Source name: ${lead.companyEvidence.sourceName}
Source URL: ${lead.companyEvidence.sourceUrl}
Verified at: ${lead.companyEvidence.verifiedAt}

Allowed Product Reference (facts about our product only; not evidence about the customer)
Positioning: ${reference.positioning}
${style === 'concise' ? 'Choose one relevant product description only; keep the detailed facts below out of the first email unless specifically requested.' : 'Use only 2–5 facts that are relevant to this recipient and the verified application:'}
${reference.allowedFacts.map((fact) => `- ${fact}`).join('\n')}

Recipient-aware CTA
${style === 'concise' ? 'Ask just one permission question: “May I send the TDS to your technical or sourcing team?” Do not add a separate referral, sample or meeting request.' : ctaFor(recipient)}

Non-negotiable restrictions
- Do not claim or imply that ${lead.company} currently buys, needs, sources, evaluates, or uses our material.
- Do not invent a supplier, purchase volume, project, problem, performance result, application, technical data, contact, email, or certification.
- Do not say “TDS attached” unless an attachment is actually present. Use: “I can send the TDS and arrange a sample if relevant.”
- Do not make price, free-sample, freight, exclusivity, delivery-time, regulatory-approval, or guarantee claims.
- Do not transfer an application or chemistry from our Product Reference onto the customer unless the customer’s own public evidence supports it.
${reference.prohibitedClaims.map((claim) => `- ${claim}`).join('\n')}

Writing requirements
- First paragraph: cite one specific company fact from the company evidence above. Do not use generic “I found your company online” language.
- ${style === 'concise' ? 'Use the concise first-contact format: about 55–85 words including greeting and signature; two short body paragraphs. One specific company fact, one sentence introducing the matched material, and exactly one question offering the TDS. No technical-data list, attachment claim or extra sample/referral request.' : 'Keep the first email professional, technical, direct, polite, and non-pushy; 90–160 words.'}
- ${style === 'concise' ? 'Keep each follow-up about 30–50 words with one purpose and one question; do not repeat the company introduction.' : 'Keep each follow-up 50–100 words.'}
- Use the recipient name only if shown above; otherwise use “Dear [Company Name] Team,”. Do not invent a name, gender, or honorific.
- Do not overstate product–application fit. Preserve the application classification above, especially any sourced market extension.
- Sign as:\nBest regards,\n\nZhiwu\nNingbo Neon Lion Technology Co., Ltd.\nEmail: zhiwu@neonlion.cn\nWebsite: www.neonliontech.com

Return exactly these sections:
Qualification
Company
Product Match
Subject A
Subject B
First Development Email
Follow-up 1
Follow-up 2
Evidence Used
Product Facts Used
Claims Avoided`
}
