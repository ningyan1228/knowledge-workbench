import { verifiedTintasVinciLeads } from './verifiedTintasVinciLead.ts'
import { verifiedKromaLeads } from './verifiedKromaLead.ts'
import { verifiedSonTheHeMoiLeads } from './verifiedSonTheHeMoiLead.ts'
import { isTaiwanMarket } from './leadMarketScope.ts'
import { verifiedFordonIglLeads } from './verifiedFordonIglLeads.ts'
import { verifiedMumLeads } from './verifiedMumLead.ts'
import { verifiedWehaLeads } from './verifiedWehaLead.ts'
import { verifiedGenasLeads } from './verifiedGenasLead.ts'
import { verifiedArofineLeads } from './verifiedArofineLead.ts'
import { verifiedSkFormulationsLeads } from './verifiedSkFormulationsLead.ts'
import { verifiedPolenLeads } from './verifiedPolenLead.ts'
import { verifiedAnjoLeads } from './verifiedAnjoLead.ts'
import { verifiedMarindecLeads } from './verifiedMarindecLead.ts'

export type MarketProduct = {
  id: 'fertilizer-coating' | 'nl-w1201' | 'elo'
  name: string
  nameEn: string
  color: string
  tdsApplicationIds: string[]
  searchLogic: string
  searchTerms: string[]
  tdsScope: string
}

export type ApplicationLayer = 'tds-verified' | 'market-extended'
export type CommercialRole = 'demand_side' | 'peer_supplier' | 'competitor' | 'distributor' | 'unknown'

export type TdsVerifiedApplication = {
  id: string
  productId: MarketProduct['id']
  name: string
  nameEn: string
  description: string
  sourceDocument: string
}

// A market extension is never inferred from chemistry alone. Its public source is mandatory.
export type MarketExtendedApplication = {
  id: string
  productId: MarketProduct['id']
  name: string
  nameEn: string
  basedOnTdsApplicationId: string
  sourceName: string
  sourceUrl: string
  verifiedAt: string
}

export type TargetCompanyType = {
  id: string
  productId: MarketProduct['id']
  name: string
  nameEn: string
  kind: 'target' | 'alternative-research'
  applicationReferences: Array<{ layer: ApplicationLayer; applicationId: string }>
}

export type CompanyEvidence = {
  applicationLayer: ApplicationLayer
  applicationId: string
  statement: string
  sourceName: string
  sourceUrl: string
  verifiedAt: string
}

export type SupplierCompetitorCheck = {
  checkedAt: string
  conclusion: string
}

import type { CompanyContact, EmailEvidence, PhoneEvidence } from './contactEvidence.ts'
export type { CompanyContact } from './contactEvidence.ts'

export type DepartmentEmail = {
  department: 'Sales' | 'Procurement' | 'Technical' | 'Production' | 'General'
  email: string
  source?: { label: string; url: string }
  emailEvidence?: EmailEvidence
}

export type CompanyProfile = {
  website?: string
  contactPage?: string
  linkedIn?: string
  whatsapp?: string
  generalEmail?: string
  generalPhone?: string
  generalEmailEvidence?: EmailEvidence
  generalPhoneEvidence?: PhoneEvidence
  contacts: CompanyContact[]
  departmentEmails: DepartmentEmail[]
  address?: string
  sources: Array<{ label: string; url: string }>
}

export type PublicLead = {
  id: string
  productId: MarketProduct['id']
  company: string
  country: string
  countryZh: string
  city: string
  latitude: number
  longitude: number
  commercialRole: CommercialRole
  leadEligible: boolean
  demandSideReason: string
  supplierCompetitorCheck?: SupplierCompetitorCheck
  targetCompanyTypeId: string
  fit: '优先核验' | '可开发候选' | '替代方案研究'
  signal: string
  contact: { label: string; email?: string; phone?: string; contactUrl?: string }
  source: { label: string; url: string }
  companyEvidence: CompanyEvidence
  checkedAt: string
  profile: CompanyProfile
}

export const marketProducts: MarketProduct[] = [
  {
    id: 'fertilizer-coating', name: '缓释肥料包膜原料', nameEn: 'Controlled-release Fertilizer Coating Material', color: '#d97706',
    tdsApplicationIds: ['controlled-release-fertilizer', 'slow-release-fertilizer', 'coated-urea', 'polyurethane-coated-urea', 'coated-compound-fertilizer'],
    searchLogic: '只反查有公开包膜证据的肥料生产商：明确生产控释肥 / 缓释肥 / 包膜尿素 / 包膜复合肥，或有包衣生产能力；普通特种肥企业不得仅凭分类入库。',
    searchTerms: ['controlled-release fertilizer manufacturer', 'slow-release fertilizer manufacturer', 'polymer-coated urea manufacturer', 'coated compound fertilizer manufacturer'],
    tdsScope: '基于已提供产品介绍：用于控释肥、包膜尿素及相关包膜工艺；具体配方、释放期和合规须逐案确认。',
  },
  {
    id: 'nl-w1201', name: 'NL-W1201 水性表面处理剂', nameEn: 'Water-Based Surface Treatment Agent', color: '#0f766e',
    tdsApplicationIds: ['untreated-pp-primer', 'pe-primer', 'opp-primer', 'pet-primer', 'abs-surface-treatment', 'pvc-primer', 'glass-adhesion-promotion', 'aluminum-primer', 'wood-surface-treatment'],
    searchLogic: '按“已验证基材 + primer / adhesion promoter + 配方商或涂料企业”寻找，不把终端行业推断为 TDS 应用。',
    searchTerms: ['PP primer formulator', 'PE OPP adhesion promoter manufacturer', 'water-based polyolefin primer formulator', 'coating adhesion promoter company'],
    tdsScope: '基于已提供英文 TDS：面向 PP、PE、OPP、PET、ABS、PVC、glass、aluminum、wood 的水性底涂 / 附着力促进应用；不将 aluminum 自动泛化为所有 metal，终端体系需测试确认。',
  },
  {
    id: 'elo', name: '环氧化亚麻油 ELO', nameEn: 'Epoxidized Linseed Oil', color: '#7c3aed',
    tdsApplicationIds: ['polymer-plasticizer', 'polymer-stabilizer', 'coatings', 'adhesives', 'inks', 'sealants', 'resin-modification'],
    searchLogic: '当前客户开发优先只寻找自行研发和生产重防腐 / 工业防护涂料的下游配方商；ELO 用于涂料是 TDS 已验证的大类，防腐涂层为有独立研究来源的市场扩展方向。涂料企业入选不代表它已使用 ELO，须进一步核实配方兼容性和采购需求。',
    searchTerms: ['heavy-duty anticorrosion coating manufacturer', 'industrial protective coating formulator epoxy', 'marine protective coating manufacturer', 'anti-corrosion paint manufacturer R&D'],
    tdsScope: '基于已提供英文 TDS：ELO 可作为聚合物添加剂，并用于涂料、胶黏剂、油墨、密封胶和树脂改性；适用性须由客户配方验证。',
  },
]

export const tdsVerifiedApplications: TdsVerifiedApplication[] = [
  { id: 'controlled-release-fertilizer', productId: 'fertilizer-coating', name: '控释肥包膜', nameEn: 'Controlled-Release Fertilizer Coating', description: '用于控释肥生产。', sourceDocument: '用户提供：缓释肥料专用包膜剂产品介绍' },
  { id: 'slow-release-fertilizer', productId: 'fertilizer-coating', name: '缓释肥包膜', nameEn: 'Slow-Release Fertilizer Coating', description: '用于缓释肥生产。', sourceDocument: '用户提供：缓释肥料专用包膜剂产品介绍' },
  { id: 'coated-urea', productId: 'fertilizer-coating', name: '尿素包膜', nameEn: 'Coated Urea / Urea Coating', description: '用于尿素颗粒包膜。', sourceDocument: '用户提供：缓释肥料专用包膜剂产品介绍' },
  { id: 'polyurethane-coated-urea', productId: 'fertilizer-coating', name: '聚氨酯包膜尿素', nameEn: 'Polyurethane-Coated Urea', description: '资料列出聚氨酯包膜尿素及其释放期方向。', sourceDocument: '用户提供：缓释肥料专用包膜剂产品介绍' },
  { id: 'coated-compound-fertilizer', productId: 'fertilizer-coating', name: '包膜复合肥', nameEn: 'Coated Compound Fertilizer', description: '用于复合肥颗粒表面包膜。', sourceDocument: '用户提供：缓释肥料专用包膜剂产品介绍' },
  { id: 'high-tower-compound-fertilizer', productId: 'fertilizer-coating', name: '高塔复合肥包膜', nameEn: 'High-Tower Compound Fertilizer Coating', description: '用于高塔复合肥表面包膜。', sourceDocument: '用户提供：缓释肥料专用包膜剂产品介绍' },
  { id: 'organic-fertilizer-coating', productId: 'fertilizer-coating', name: '有机肥包膜', nameEn: 'Organic Fertilizer Coating', description: '用于有机肥颗粒包膜。', sourceDocument: '用户提供：缓释肥料专用包膜剂产品介绍' },
  { id: 'untreated-pp-primer', productId: 'nl-w1201', name: '未处理 PP 底涂', nameEn: 'Untreated PP Primer', description: '作为未处理 PP 基材的底涂 / 附着力促进剂。', sourceDocument: '用户提供：NL-W1201 TDS' },
  { id: 'pe-primer', productId: 'nl-w1201', name: 'PE 底涂', nameEn: 'PE Primer', description: '用于 PE 基材的水性表面处理 / 底涂。', sourceDocument: '用户提供：NL-W1201 TDS' },
  { id: 'opp-primer', productId: 'nl-w1201', name: 'OPP 底涂', nameEn: 'OPP Primer', description: '用于 OPP 基材的水性表面处理 / 底涂。', sourceDocument: '用户提供：NL-W1201 TDS' },
  { id: 'pet-primer', productId: 'nl-w1201', name: 'PET 底涂', nameEn: 'PET Primer', description: '用于 PET 基材的水性表面处理 / 底涂。', sourceDocument: '用户提供：NL-W1201 TDS' },
  { id: 'abs-surface-treatment', productId: 'nl-w1201', name: 'ABS 表面处理', nameEn: 'ABS Surface Treatment', description: '用于 ABS 基材表面处理。', sourceDocument: '用户提供：NL-W1201 TDS' },
  { id: 'pvc-primer', productId: 'nl-w1201', name: 'PVC 底涂', nameEn: 'PVC Primer', description: '用于 PVC 基材的水性表面处理 / 底涂。', sourceDocument: '用户提供：NL-W1201 TDS' },
  { id: 'aluminum-primer', productId: 'nl-w1201', name: '铝材附着力促进', nameEn: 'Aluminum Primer / Adhesion Promotion', description: '用于 aluminum 基材附着力促进；不自动泛化为所有金属。', sourceDocument: '用户提供：NL-W1201 TDS' },
  { id: 'glass-adhesion-promotion', productId: 'nl-w1201', name: '玻璃附着力促进', nameEn: 'Glass Adhesion Promotion', description: '用于玻璃基材附着力促进。', sourceDocument: '用户提供：NL-W1201 TDS' },
  { id: 'wood-surface-treatment', productId: 'nl-w1201', name: '木材表面处理', nameEn: 'Wood Surface Treatment', description: '用于木材表面处理。', sourceDocument: '用户提供：NL-W1201 TDS' },
  { id: 'polymer-plasticizer', productId: 'elo', name: '聚合物增塑剂', nameEn: 'Polymer Plasticizer', description: '作为聚合物体系增塑剂。', sourceDocument: '用户提供：ELO TDS' },
  { id: 'polymer-stabilizer', productId: 'elo', name: '聚合物稳定剂', nameEn: 'Polymer Stabilizer', description: '作为聚合物体系稳定剂。', sourceDocument: '用户提供：ELO TDS' },
  { id: 'thermal-stabilizer', productId: 'elo', name: '热稳定添加剂', nameEn: 'Thermal Stabilizing Additive', description: '改善热稳定性。', sourceDocument: '用户提供：ELO TDS' },
  { id: 'aging-resistance-additive', productId: 'elo', name: '耐老化添加剂', nameEn: 'Aging Resistance Additive', description: '改善耐老化表现。', sourceDocument: '用户提供：ELO TDS' },
  { id: 'coatings', productId: 'elo', name: '涂料', nameEn: 'Coatings', description: '用于涂料体系。', sourceDocument: '用户提供：ELO TDS' },
  { id: 'adhesives', productId: 'elo', name: '胶黏剂', nameEn: 'Adhesives', description: '用于胶黏剂体系。', sourceDocument: '用户提供：ELO TDS' },
  { id: 'inks', productId: 'elo', name: '油墨', nameEn: 'Inks', description: '用于油墨体系。', sourceDocument: '用户提供：ELO TDS' },
  { id: 'sealants', productId: 'elo', name: '密封剂', nameEn: 'Sealants', description: '用于密封剂体系。', sourceDocument: '用户提供：ELO TDS' },
  { id: 'resin-modification', productId: 'elo', name: '树脂改性', nameEn: 'Resin Modification', description: '用于树脂改性。', sourceDocument: '用户提供：ELO TDS' },
]

export const marketExtendedApplications: MarketExtendedApplication[] = [
  { id: 'elo-pvc-plasticizer', productId: 'elo', name: 'PVC 增塑剂应用', nameEn: 'PVC Plasticizer Application', basedOnTdsApplicationId: 'polymer-plasticizer', sourceName: 'Wiley: The epoxidized linseed oil as a secondary plasticizer in PVC processing', sourceUrl: 'https://onlinelibrary.wiley.com/doi/abs/10.1002/vjch.202000023', verifiedAt: '2026-09-26' },
  { id: 'elo-anticorrosion-coating-research', productId: 'elo', name: '防腐涂层研究方向', nameEn: 'Anticorrosion Coating Research Direction', basedOnTdsApplicationId: 'coatings', sourceName: 'Composite Materials from Renewable Resources as Sustainable Corrosion Protection Coatings (Polymers, 2021)', sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8588247/', verifiedAt: '2026-09-29' },
  { id: 'waterborne-ink-anchorage-on-pp-pe', productId: 'nl-w1201', name: 'PP / PE 水性油墨附着力底涂', nameEn: 'Waterborne Ink Anchorage Primer on PP / PE', basedOnTdsApplicationId: 'pe-primer', sourceName: 'ICHEMCO technical catalog: waterborne primer for PP/PE improves anchorage of waterborne inks', sourceUrl: 'https://services.ichemco.com/eng/Catalogs/Ichemco%20Products%20for%20Tapes%20and%20Protective%20Films%202020.pdf', verifiedAt: '2026-09-26' },
]

export const targetCompanyTypes: TargetCompanyType[] = [
  { id: 'waterbased-wood-primer-manufacturer', productId: 'nl-w1201', name: '水性木材底漆生产商', nameEn: 'Water-Based Wood Primer Manufacturer', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'wood-surface-treatment' }] },
  { id: 'waterbased-wood-coating-manufacturer', productId: 'nl-w1201', name: '水性木器涂料生产商', nameEn: 'Water-Based Wood Coating Manufacturer', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'wood-surface-treatment' }] },
  { id: 'controlled-release-fertilizer-manufacturer', productId: 'fertilizer-coating', name: '控释肥生产商', nameEn: 'Controlled Release Fertilizer Manufacturer', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'controlled-release-fertilizer' }] },
  { id: 'slow-release-fertilizer-manufacturer', productId: 'fertilizer-coating', name: '缓释肥生产商', nameEn: 'Slow Release Fertilizer Manufacturer', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'slow-release-fertilizer' }] },
  { id: 'polymer-coated-urea-manufacturer', productId: 'fertilizer-coating', name: '聚合物包膜尿素生产商', nameEn: 'Polymer-Coated Urea Manufacturer', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'coated-urea' }, { layer: 'tds-verified', applicationId: 'polyurethane-coated-urea' }] },
  { id: 'coated-urea-manufacturer', productId: 'fertilizer-coating', name: '包膜尿素生产商', nameEn: 'Coated Urea Manufacturer', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'coated-urea' }] },
  { id: 'coated-compound-fertilizer-manufacturer', productId: 'fertilizer-coating', name: '包膜复合肥生产商', nameEn: 'Coated Compound Fertilizer Manufacturer', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'coated-compound-fertilizer' }] },
  { id: 'specialty-fertilizer-manufacturer', productId: 'fertilizer-coating', name: '特种肥生产商', nameEn: 'Specialty Fertilizer Manufacturer', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'controlled-release-fertilizer' }, { layer: 'tds-verified', applicationId: 'slow-release-fertilizer' }] },
  { id: 'primer-adhesion-promoter-formulator', productId: 'nl-w1201', name: '水性底涂 / 附着力促进剂配方商', nameEn: 'Primer / Adhesion Promoter Formulator', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'untreated-pp-primer' }, { layer: 'tds-verified', applicationId: 'pe-primer' }, { layer: 'tds-verified', applicationId: 'opp-primer' }, { layer: 'tds-verified', applicationId: 'pet-primer' }, { layer: 'tds-verified', applicationId: 'abs-surface-treatment' }] },
  { id: 'coating-manufacturer', productId: 'nl-w1201', name: '涂料企业', nameEn: 'Coating Manufacturer', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'untreated-pp-primer' }, { layer: 'tds-verified', applicationId: 'pvc-primer' }, { layer: 'tds-verified', applicationId: 'aluminum-primer' }, { layer: 'tds-verified', applicationId: 'glass-adhesion-promotion' }] },
  { id: 'waterborne-ink-manufacturer', productId: 'nl-w1201', name: '水性油墨生产商（需扩展证据）', nameEn: 'Water-Based Ink Manufacturer (Sourced Extension Required)', kind: 'target', applicationReferences: [{ layer: 'market-extended', applicationId: 'waterborne-ink-anchorage-on-pp-pe' }] },
  { id: 'polymer-formulator', productId: 'elo', name: '聚合物配方商', nameEn: 'Polymer Formulator', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'polymer-plasticizer' }, { layer: 'tds-verified', applicationId: 'polymer-stabilizer' }] },
  { id: 'plasticizer-using-polymer-compounder', productId: 'elo', name: '增塑剂使用型聚合物配方商', nameEn: 'Plasticizer-Using Polymer Compounder', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'polymer-plasticizer' }] },
  { id: 'pvc-compound-manufacturer', productId: 'elo', name: 'PVC 配方生产商（需扩展证据）', nameEn: 'PVC Compound Manufacturer (Sourced Extension Required)', kind: 'target', applicationReferences: [{ layer: 'market-extended', applicationId: 'elo-pvc-plasticizer' }] },
  { id: 'elo-coating-manufacturer', productId: 'elo', name: '涂料生产商', nameEn: 'Coating Manufacturer', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'coatings' }] },
  { id: 'elo-anticorrosion-coating-formulator', productId: 'elo', name: '防腐涂料配方生产商（需扩展证据）', nameEn: 'Anticorrosion Coating Formulator (Sourced Extension Required)', kind: 'target', applicationReferences: [{ layer: 'market-extended', applicationId: 'elo-anticorrosion-coating-research' }] },
  { id: 'adhesive-manufacturer', productId: 'elo', name: '胶黏剂生产商', nameEn: 'Adhesive Manufacturer', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'adhesives' }] },
  { id: 'ink-manufacturer', productId: 'elo', name: '油墨生产商', nameEn: 'Ink Manufacturer', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'inks' }] },
  { id: 'sealant-manufacturer', productId: 'elo', name: '密封剂生产商', nameEn: 'Sealant Manufacturer', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'sealants' }] },
  { id: 'resin-modifier-formulator', productId: 'elo', name: '树脂改性 / 配方商', nameEn: 'Resin Modifier / Formulator', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'resin-modification' }] },
]

// These are public-business-contact research leads, not confirmed buyers or demand claims.
// Every visible contact is paired with its first-party source and a verification date.
// Kept only as the original research note; it is deliberately not exposed as the lead relationship.
type RawPublicLead = Omit<PublicLead, 'profile' | 'targetCompanyTypeId' | 'companyEvidence' | 'commercialRole' | 'leadEligible' | 'demandSideReason'> & { legacyCompanyDescription: string }
const rawPublicLeads: RawPublicLead[] = [
  {
    id: 'icl-charleston', productId: 'fertilizer-coating', company: 'ICL Growing Solutions Charleston', country: 'United States', countryZh: '美国', city: 'Charleston, South Carolina', latitude: 32.7765, longitude: -79.9311,
    legacyCompanyDescription: '控释肥生产商', fit: '优先核验',
    signal: '官方工厂页面说明该地生产包膜控释肥，并设有面向控释肥的产品负责人。',
    contact: { label: 'Jolene Miller · Product Lead, Controlled Release Fertilizers', email: 'jolene.miller@icl-group.com', phone: '+1 843-609-2859', contactUrl: 'https://icl-growingsolutions.com/en-us/agriculture/our-experts/' },
    source: { label: 'ICL Charleston production site', url: 'https://icl-growingsolutions.com/en-us/about/production-sites/icl-growing-solutions-charleston/' }, checkedAt: '2026-09-25',
  },
  {
    id: 'haifa-israel', productId: 'fertilizer-coating', company: 'Haifa Group', country: 'Israel', countryZh: '以色列', city: 'Haifa', latitude: 32.7940, longitude: 34.9896,
    legacyCompanyDescription: '控释肥生产商', fit: '可开发候选',
    signal: 'Haifa Group publicly markets its Multicote controlled-release fertilizer product line. This establishes a verified downstream relationship to controlled-release fertilizer production, but does not establish which coating chemistry or raw materials the company currently uses.',
    contact: { label: 'Haifa Group general business contact', email: 'info@haifa-group.com', phone: '+972-74-7373737', contactUrl: 'https://www.haifa-group.com/' },
    source: { label: 'Haifa Multicote controlled-release fertilizer handbook', url: 'https://www.haifa-group.com/files/Knowledge_Center/Articles/Multicote_Agri_Handbook_final.pdf' }, checkedAt: '2026-09-25',
  },
  {
    id: 'crf-agritech-st-thomas', productId: 'fertilizer-coating', company: 'CRF AgriTech', country: 'Canada', countryZh: '加拿大', city: 'St. Thomas, Ontario', latitude: 42.7772, longitude: -81.1827,
    legacyCompanyDescription: '聚合物包膜尿素 / 控释肥生产商', fit: '优先核验',
    signal: '官网说明其 St. Thomas 工厂生产定制控释肥，并明确 PurYield 为 polymer coated urea，适合核验包衣原料采购与技术负责人。',
    contact: { label: 'Official contact form and business phone', phone: '+1 519-633-5810', contactUrl: 'https://www.crfagritech.com/#contact' },
    source: { label: 'CRF AgriTech controlled-release fertilizer and PurYield page', url: 'https://www.crfagritech.com/' }, checkedAt: '2026-09-25',
  },
  {
    id: 'compo-expert-krefeld', productId: 'fertilizer-coating', company: 'COMPO EXPERT GmbH', country: 'Germany', countryZh: '德国', city: 'Krefeld', latitude: 51.3388, longitude: 6.5853,
    legacyCompanyDescription: '控释肥 / 特种肥生产商', fit: '优先核验',
    signal: '官网说明其在 Krefeld 等自有肥料工厂生产特种肥和控释肥；控释肥页面明确每颗肥料颗粒均覆有弹性聚合物包衣。',
    contact: { label: 'Official sales contacts page', contactUrl: 'https://compo-expert.com/service/sales-contacts' },
    source: { label: 'COMPO EXPERT controlled-release fertilizer technology', url: 'https://compo-expert.com/product-groups/controlled-release-fertilizers' }, checkedAt: '2026-09-25',
  },
  {
    id: 'florikan-bowling-green', productId: 'fertilizer-coating', company: 'Florikan ESA LLC (Profile Products)', country: 'United States', countryZh: '美国', city: 'Bowling Green, Florida', latitude: 27.6384, longitude: -81.8239,
    legacyCompanyDescription: '控释肥 / 聚合物包膜肥生产商', fit: '优先核验',
    signal: 'Profile Products 官网公告明确 Florikan 采购肥料基础原料，并在佛罗里达生产线上将其进行聚合物包膜以生产控释肥；这是下游肥料制造与包衣使用场景，不是包衣原料供应商。',
    contact: { label: 'Public corporate contact', email: 'florikan.corporate@florikan.com', phone: '+1 800-322-8666', contactUrl: 'https://www.profileproducts.com/contact/' },
    source: { label: 'Florikan partnership: fertilizer raw-material purchasing and polymer coating', url: 'https://www.profileproducts.com/florikan-partners-with-eurochem-group/' }, checkedAt: '2026-09-26',
  },
  {
    id: 'genus-brunswick', productId: 'fertilizer-coating', company: 'GENUS LLC.', country: 'United States', countryZh: '美国', city: 'Brunswick, Ohio', latitude: 41.2389, longitude: -81.8418,
    legacyCompanyDescription: '精密包膜控释氮肥生产商', fit: '优先核验',
    signal: 'GENUS 官网明确其生产 precision coated fertilizers，并披露自有制造设施配备包衣机械、对颗粒实施精确包衣；属于包衣肥下游制造场景，可核验包衣原料采购。',
    contact: { label: 'Public sales contact', email: 'sales@genustek.com', phone: '+1 330-220-0524', contactUrl: 'https://www.genustek.com/contact' },
    source: { label: 'GENUS precision coated fertilizer manufacturing', url: 'https://www.genustek.com/' }, checkedAt: '2026-09-26',
  },
  {
    id: 'pol-coatings-twello', productId: 'nl-w1201', company: 'Pol Coatings B.V.', country: 'Netherlands', countryZh: '荷兰', city: 'Twello', latitude: 52.2360, longitude: 6.1027,
    legacyCompanyDescription: '水性 PP / PE 底涂与涂层体系配方商', fit: '可开发候选',
    signal: '官网公开其 PO+ 为适用于 PP、PE 等低表面能塑料的 1K 水性附着力底涂，并说明公司会开发和供应定制涂层体系；属于下游配方使用场景，可核验水性附着力材料采购。',
    contact: { label: 'Public business contact', email: 'info@polcoatings.nl', phone: '+31 571 298071', contactUrl: 'https://polcoatings.nl/en/producten/po-primer/' },
    source: { label: 'Pol Coatings PO+ water-based primer for PP and PE', url: 'https://polcoatings.nl/en/producten/po-primer/' }, checkedAt: '2026-09-26',
  },
  {
    id: 'plastchem-hardenberg', productId: 'elo', company: 'PlastChem B.V.', country: 'Netherlands', countryZh: '荷兰', city: 'Hardenberg', latitude: 52.5754, longitude: 6.6192,
    legacyCompanyDescription: '软 / 硬 PVC 定制配方与生产企业', fit: '可开发候选',
    signal: '官网说明其在 Hardenberg 工厂开发和生产定制软/硬 PVC compounds；软 PVC 配方属于 ELO 在聚合物增塑剂应用方向的下游配方场景，可核验增塑剂/稳定剂原料采购。',
    contact: { label: 'Public business contact', email: 'info@plastchem.nl', phone: '+31 85-0865800', contactUrl: 'https://plastchem.nl/' },
    source: { label: 'PlastChem custom flexible and rigid PVC compound manufacturing', url: 'https://plastchem.nl/' }, checkedAt: '2026-09-26',
  },
  {
    id: 'aqua-based-us', productId: 'nl-w1201', company: 'Aqua Based Technologies', country: 'United States', countryZh: '美国', city: 'Northvale, New Jersey', latitude: 41.0068, longitude: -73.9496,
    legacyCompanyDescription: '水性 PP / PE / OPP 底涂与软包装配方商', fit: '可开发候选',
    signal: '官网列出面向软包装、印刷和纸张转换行业的水性挤出复合底涂，并明确用于 PP、PE 薄膜；其自定义配方与制造业务属于下游底涂配方使用场景，可核验水性附着力材料采购。',
    contact: { label: 'Public business email', email: 'info@aquabased.com', phone: '+1 201-767-6040', contactUrl: 'https://www.aquabased.com/primers/' },
    source: { label: 'Aqua Based water-based primers', url: 'https://www.aquabased.com/primers/' }, checkedAt: '2026-09-25',
  },
  {
    id: 'deltachem-born', productId: 'fertilizer-coating', company: 'DeltaChem International B.V.', country: 'Netherlands', countryZh: '荷兰', city: 'Born', latitude: 50.8751, longitude: 5.8094,
    legacyCompanyDescription: '聚合物包膜控释肥 / 特种肥生产商', fit: '可开发候选',
    signal: '官网说明其 DeltaCote 控释肥使用可降解有机聚合物包衣，并生产包膜尿素、MAP、NPK 等定制化包膜肥；属于包衣肥下游制造场景，可核验包衣原料采购。',
    contact: { label: 'Public business contact', email: 'info@deltachem.pro', phone: '+31 46-727-1000', contactUrl: 'https://www.deltachem.pro/coating/' },
    source: { label: 'DeltaChem controlled-release fertilizer coating technology', url: 'https://www.deltachem.pro/coating/' }, checkedAt: '2026-09-26',
  },
  {
    id: 'cic-mckinney', productId: 'nl-w1201', company: 'Custom Industrial Coatings (CIC Coatings)', country: 'United States', countryZh: '美国', city: 'McKinney, Texas', latitude: 33.1972, longitude: -96.6398,
    legacyCompanyDescription: '工业涂层 / 水性底涂与 PP 附着力体系生产商', fit: '可开发候选',
    signal: '官网公开低 VOC 水性底涂和用于 TPO、PP 等塑料表面的 Mustang 附着力促进体系；该企业生产工业涂层体系，属于 NL-W1201 的下游涂层配方使用场景，可核验水性附着力材料采购。',
    contact: { label: 'Public business contact', email: 'info@ciccoatings.com', phone: '+1 877-258-8797', contactUrl: 'https://ciccoatings.com/plastic-bumper-coatings/' },
    source: { label: 'CIC water-based primer and polypropylene adhesion promoter', url: 'https://ciccoatings.com/plastic-bumper-coatings/' }, checkedAt: '2026-09-26',
  },
  {
    id: 'polyflex-baltic', productId: 'elo', company: 'Polyflex (Flex Technologies)', country: 'United States', countryZh: '美国', city: 'Baltic, Ohio', latitude: 40.4398, longitude: -82.1457,
    legacyCompanyDescription: '高性能柔性 PVC 配方与生产企业', fit: '可开发候选',
    signal: '官网说明 Polyflex 在六条生产线上工程化并生产高性能 PVC 配方，产品覆盖高度柔性至半硬质 PVC；属于 ELO 聚合物增塑剂应用方向的下游配方场景，可核验增塑剂/稳定剂原料采购。',
    contact: { label: 'Zach Alexander · Sales contact', email: 'zachalexander@flextechnologies.com', phone: '+1 330-407-0009', contactUrl: 'https://www.flextechnologies.com/polyflex' },
    source: { label: 'Polyflex flexible PVC compound manufacturing and sales contact', url: 'https://www.flextechnologies.com/polyflex' }, checkedAt: '2026-09-26',
  },
  {
    id: 'stir-barletta', productId: 'elo', company: 'STIR Compounds s.r.l.', country: 'Italy', countryZh: '意大利', city: 'Barletta', latitude: 41.3195, longitude: 16.2832,
    legacyCompanyDescription: '高度增塑 PVC 定制配方与生产企业', fit: '可开发候选',
    signal: '官网说明其开发和生产定制 PVC 配方，其中柔性 PVC 为高度增塑 compound；这是 ELO 聚合物增塑剂应用方向的下游配方场景，可核验增塑剂/稳定剂原料采购。',
    contact: { label: 'Public business contact', email: 'info@stircompounds.it', phone: '+39 0883 3418111', contactUrl: 'https://stircompounds.it/en/pvc.html' },
    source: { label: 'STIR highly plasticised flexible PVC compound formulation', url: 'https://stircompounds.it/en/pvc.html' }, checkedAt: '2026-09-26',
  },
  {
    id: 'paramelt-netherlands', productId: 'nl-w1201', company: 'Paramelt B.V.', country: 'Netherlands', countryZh: '荷兰', city: 'Heerhugowaard', latitude: 52.6714, longitude: 4.8333,
    legacyCompanyDescription: '水性聚烯烃分散体 / 包装涂层配方商', fit: '替代方案研究',
    signal: '官方技术页说明其水性聚烯烃分散体可用于底涂、粘结层和水性涂层配方。',
    contact: { label: 'Europe, Middle East and Africa business line', phone: '+31 72 575 0600', contactUrl: 'https://www.paramelt.com/paramelt-bv/' },
    source: { label: 'Paramelt water-based coatings', url: 'https://www.paramelt.com/coatings/water-based-coatings/' }, checkedAt: '2026-09-25',
  },
  {
    id: 'nippon-paper-japan', productId: 'nl-w1201', company: 'Nippon Paper Group', country: 'Japan', countryZh: '日本', city: 'Tokyo', latitude: 35.6762, longitude: 139.6503,
    legacyCompanyDescription: 'PP 水性底涂 / 水性油墨与胶黏剂配方商', fit: '替代方案研究',
    signal: '官方产品页说明其水性改性聚烯烃可用于 PP 底涂、水性油墨与胶黏剂。',
    contact: { label: 'Chemical Sales Dept. I', phone: '+81-3-6665-5940', contactUrl: 'https://www.nipponpapergroup.com/english/products/waterborne.html' },
    source: { label: 'AUROREN waterborne modified polyolefin', url: 'https://www.nipponpapergroup.com/english/products/waterborne.html' }, checkedAt: '2026-09-25',
  },
  {
    id: 'polar-canada', productId: 'elo', company: 'Polar Industries, Inc.', country: 'Canada', countryZh: '加拿大', city: 'Fisher Branch, Manitoba', latitude: 51.0833, longitude: -97.5500,
    legacyCompanyDescription: 'ELO 配方与环氧化油应用商', fit: '替代方案研究',
    signal: '官方页面说明其 ELO 用于涂料、增塑剂、胶黏剂等应用；适合作为应用与采购角色的核验对象。',
    contact: { label: 'Public business email', email: 'polarindustry@yahoo.com', phone: '+1 204-372-8482', contactUrl: 'https://polarindustries.net/EpoxidizedOil.html' },
    source: { label: 'Polar Industries HiBond ELO', url: 'https://polarindustries.net/EpoxidizedOil.html' }, checkedAt: '2026-09-25',
  },
  {
    id: 'pursell-sylacauga', productId: 'fertilizer-coating', company: 'Pursell Fertilizer', country: 'United States', countryZh: '美国', city: 'Sylacauga, Alabama', latitude: 33.1732, longitude: -86.2516,
    legacyCompanyDescription: '控释肥生产商', fit: '优先核验',
    signal: '官网将其定位为新一代控释肥，并公开国际销售负责人的业务邮箱和工厂咨询入口。',
    contact: { label: 'Jason Woulfin · Director of International Sales', email: 'jason@fertilizer.com', phone: '+1 256-208-9509', contactUrl: 'https://fertilizer.com/contact-us/' },
    source: { label: 'Pursell controlled-release fertilizer contact page', url: 'https://fertilizer.com/contact-us/' }, checkedAt: '2026-09-25',
  },
  {
    id: 'cotex-dartmouth', productId: 'fertilizer-coating', company: 'CoteX', country: 'Canada', countryZh: '加拿大', city: 'Dartmouth, Nova Scotia', latitude: 44.6713, longitude: -63.5772,
    legacyCompanyDescription: '聚合物包膜控释肥生产商', fit: '优先核验',
    signal: '官网公开聚合物包膜控释肥和平板型包膜肥技术，并公布公司地址与业务邮箱。',
    contact: { label: 'Public business email', email: 'info@cotexcorp.com', phone: '+1 902-580-2963', contactUrl: 'https://www.cotextech.com/' },
    source: { label: 'CoteX controlled-release fertilizer technology', url: 'https://www.cotextech.com/' }, checkedAt: '2026-09-25',
  },
  {
    id: 'simofert-beuningen', productId: 'fertilizer-coating', company: 'Simonis Fertilizers B.V.', country: 'Netherlands', countryZh: '荷兰', city: 'Beuningen', latitude: 51.8603, longitude: 5.7690,
    legacyCompanyDescription: '控释肥生产商 / 出口商', fit: '可开发候选',
    signal: '官网明确列出 Control Release Fertilizers，并说明可生产定制化肥料配方。',
    contact: { label: 'Public business email', email: 'fertilizer@simofert.nl', phone: '+31 24-204-2360', contactUrl: 'https://www.simofert.nl/' },
    source: { label: 'Simonis Fertilizers product overview', url: 'https://www.simofert.nl/' }, checkedAt: '2026-09-25',
  },
  {
    id: 'sk-specialties-sibu', productId: 'fertilizer-coating', company: 'SK Specialties Sdn. Bhd.', country: 'Malaysia', countryZh: '马来西亚', city: 'Sibu, Sarawak', latitude: 2.2870, longitude: 111.8310,
    legacyCompanyDescription: '聚合物包膜控释肥生产商', fit: '优先核验',
    signal: '官网称其使用聚合物包膜技术生产控释肥，并公开业务邮箱、电话与工厂地址。',
    contact: { label: 'Public business email', email: 'enquiry@skspecialties.com.my', phone: '+60 84-213688', contactUrl: 'https://www.skspecialties.com.my/contact-us/' },
    source: { label: 'SK Specialties controlled-release fertilizer contact page', url: 'https://www.skspecialties.com.my/contact-us/' }, checkedAt: '2026-09-25',
  },
  {
    id: 'smart-fert-klang', productId: 'fertilizer-coating', company: 'Smart Fert Sdn Bhd', country: 'Malaysia', countryZh: '马来西亚', city: 'Klang, Selangor', latitude: 2.9970, longitude: 101.3884,
    legacyCompanyDescription: '聚合物包膜尿素 / 控释肥生产商', fit: '优先核验',
    signal: '官网列出聚合物包膜尿素与多款控释肥，并公开销售邮箱和工厂地址。',
    contact: { label: 'Public sales email', email: 'sales@smart-fert.com', phone: '+60 3-3101-5931', contactUrl: 'https://www.smart-fert.com/products/' },
    source: { label: 'Smart Fert controlled-release fertilizer products', url: 'https://www.smart-fert.com/products/' }, checkedAt: '2026-09-25',
  },
  {
    id: 'simplot-boise', productId: 'fertilizer-coating', company: 'J.R. Simplot Company (Turf & Horticulture)', country: 'United States', countryZh: '美国', city: 'Boise, Idaho', latitude: 43.6150, longitude: -116.2023,
    legacyCompanyDescription: '聚合物包膜控释肥生产商', fit: '优先核验',
    signal: '官网明确 GAL-XeONE 为 Simplot 的 polymer-coated controlled-release fertilizer，并说明聚合物包衣控制养分释放；该公司销售成品包膜肥而非包衣原料，属于包衣剂的下游肥料制造场景，可核验包衣原料采购和生产负责人。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核官方产品资料：其公开资料描述的是成品聚合物包膜肥；本轮检索的官方来源未显示其销售肥料包衣原料。' },
    contact: { label: 'Simplot Turf & Horticulture public business line', phone: '+1 800-832-8891', contactUrl: 'https://th.simplot.com/granulated-fertilizer/gal-xe-one' },
    source: { label: 'Simplot GAL-XeONE polymer-coated controlled-release fertilizer', url: 'https://th.simplot.com/granulated-fertilizer/gal-xe-one' }, checkedAt: '2026-09-26',
  },
  {
    id: 'agrofarm-ponorogo', productId: 'fertilizer-coating', company: 'Agrofarm Nusaraya', country: 'Indonesia', countryZh: '印度尼西亚', city: 'Ponorogo, East Java', latitude: -7.8650, longitude: 111.4620,
    legacyCompanyDescription: '树脂包膜控释复合肥生产商', fit: '优先核验',
    signal: '官网公开 ANR 30 CRF 的聚合物树脂半透膜包衣、8–12 个月控释规格和自有 Ponorogo 工厂地址；该企业生产下游树脂包膜控释肥，具备包衣原料采购与生产负责人核验价值。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核官方产品与工厂页面：其公开业务为树脂包膜控释肥成品制造；本轮检索的官方来源未显示其销售肥料包衣原料。' },
    contact: { label: 'Agrofarm Nusaraya public customer service', email: 'csagrofarm@agrofarm.id', phone: '+62 352 3591094', contactUrl: 'https://agrofarmnusaraya.id/product/anr-30-crf/' },
    source: { label: 'Agrofarm ANR 30 CRF polymer-resin coating and factory', url: 'https://agrofarmnusaraya.id/product/anr-30-crf/' }, checkedAt: '2026-09-26',
  },
  {
    id: 'twin-arrow-shah-alam', productId: 'fertilizer-coating', company: 'Twin Arrow Fertilizer Sdn Bhd', country: 'Malaysia', countryZh: '马来西亚', city: 'Shah Alam, Selangor', latitude: 3.0738, longitude: 101.5183,
    legacyCompanyDescription: '控释复合肥生产商', fit: '优先核验',
    signal: '官网说明其为马来西亚肥料制造商、肥料工厂年产能达 40 万吨，并列出自有 Twin Supreme Controlled Release Fertilizer 产品；该企业生产下游控释肥成品，具备包衣原料采购及生产负责人核验价值。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核官方公司与产品页面：其公开业务为控释肥及其他成品肥制造；本轮检索的官方来源未显示其销售肥料包衣原料。' },
    contact: { label: 'Twin Arrow public business contact', email: 'info@twinarrow.com.my', phone: '+60 3-3359 7711', contactUrl: 'https://twinarrow.com.my/contacts/' },
    source: { label: 'Twin Arrow fertilizer manufacturing and controlled-release fertilizer', url: 'https://twinarrow.com.my/' }, checkedAt: '2026-09-26',
  },
  {
    id: 'agro-berjaya-mojokerto', productId: 'fertilizer-coating', company: 'PT Agro Berjaya Nusantara', country: 'Indonesia', countryZh: '印度尼西亚', city: 'Mojokerto, East Java', latitude: -7.4722, longitude: 112.4340,
    legacyCompanyDescription: '控释肥生产商', fit: '优先核验',
    signal: '行业展会报道显示该公司生产 Ferti Best Controlled Release Fertilizer，并在 Mojokerto 自有工厂生产；其公开 LinkedIn 同时显示肥料工厂操作员与 QC 实验室岗位，支持其为下游肥料制造企业。可进一步核验包衣原料采购和生产负责人。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核公开展会报道与公司 LinkedIn：其公开业务为 CRF 成品肥及肥料制造；本轮检索的公开来源未显示其销售肥料包衣原料。' },
    contact: { label: 'Public customer enquiry line cited in HaiSawit event report', phone: '+62 811-5705-318', contactUrl: 'https://haisawit.co.id/news/detail/pt-agro-berjaya-nusantara-perkenalkan-pupuk-crf-paling-ekonomis-di-gelaran-hasi-2026-jakarta' },
    source: { label: 'HaiSawit report: Agro Berjaya CRF and Mojokerto factory', url: 'https://haisawit.co.id/news/detail/pt-agro-berjaya-nusantara-perkenalkan-pupuk-crf-paling-ekonomis-di-gelaran-hasi-2026-jakarta' }, checkedAt: '2026-09-26',
  },
  {
    id: 'diversatech-bangi', productId: 'fertilizer-coating', company: 'Diversatech (M) Sdn Bhd', country: 'Malaysia', countryZh: '马来西亚', city: 'Bandar Baru Bangi, Selangor', latitude: 2.9030, longitude: 101.7740,
    legacyCompanyDescription: '聚合物包覆控释肥生产商', fit: '优先核验',
    signal: 'Diversatech 官网列出 AJIB CRF 包覆控释肥产品及 Polymer Coated Agglomeration Technology，联系页明确给出 Pulau Indah 肥料工厂；马来西亚肥料工业协会将其列为 Controlled Release Fertilizer Manufacturer。该企业生产下游成品肥，具备包衣原料配方与采购适配性核验价值；公开资料未证明其采购或使用我方包衣剂。',
    supplierCompetitorCheck: { checkedAt: '2026-09-29', conclusion: '已复核 Diversatech 新版官网产品、公司及联系页面和行业协会目录：公开业务为控释肥等成品肥制造；本轮所查资料未显示其对外销售聚氨酯包衣原料、包衣树脂或与我方相同的包衣剂。' },
    contact: { label: 'Director public business contact', email: 'syedamir@diversatechfertilizer.com', phone: '+60 3-8926 3103', contactUrl: 'https://www.fiam.org.my/index.php?Itemid=118&link_id=26&option=com_mtree&task=viewlink' },
    source: { label: 'Diversatech official AJIB CRF polymer-coated agglomeration product', url: 'https://diversatech.my/ajib-crf/' }, checkedAt: '2026-09-29',
  },
  {
    id: 'farmhannong-ulsan', productId: 'fertilizer-coating', company: 'FarmHannong Co., Ltd.', country: 'South Korea', countryZh: '韩国', city: 'Ulsan', latitude: 35.5384, longitude: 129.3114,
    legacyCompanyDescription: '聚合物包膜控释肥生产商', fit: '优先核验',
    signal: '官网列出 Ulsan 肥料生产设施以及 Coated Urea、Coated DAP、Coated N-K 等聚合物包膜控释肥产品，并说明肥料颗粒在生产中由超薄聚合物层包覆；该企业生产下游包膜肥，具备包衣原料采购和技术负责人核验价值。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核官方产品、生产设施与联系页：其公开业务为包膜控释肥及其他成品肥制造；本轮检索的官方来源未显示其销售肥料包衣原料。' },
    contact: { label: 'FarmHannong Procurement desk', email: 'jhkim0424@farmhannong.com', phone: '+82 2-3159-5836', contactUrl: 'https://www.farmhannong.com/eng/cs/direct/inquiry/write.do' },
    source: { label: 'FarmHannong CRF polymer-coated fertilizer products', url: 'https://www.farmhannong.com/eng/Fertilizers/CRF/contentsid/215/index.do' }, checkedAt: '2026-09-26',
  },
  {
    id: 'jcam-agri-tokyo', productId: 'fertilizer-coating', company: 'JCAM Agri Co., Ltd.', country: 'Japan', countryZh: '日本', city: 'Tokyo', latitude: 35.6812, longitude: 139.7671,
    legacyCompanyDescription: '聚烯烃树脂包膜尿素生产商', fit: '优先核验',
    signal: '官网说明 LP-Coat 与 M-Coat 为以聚烯烃树脂和天然矿物膜包覆尿素的产品；公司主营化成肥料等的制造和销售，并运营多座工厂。该企业制造下游包膜尿素，具备包衣原料采购和技术负责人核验价值。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核官方产品、公司业务与技术资料：其公开业务为包膜肥及其他成品肥制造；本轮检索的官方来源未显示其销售肥料包衣原料。' },
    contact: { label: 'JCAM Agri Technical Management Division', email: 'gijutsu@jcam-agri.co.jp', phone: '+81 3-5297-8906', contactUrl: 'https://www.jcam-agri.co.jp/pdf/20231225_news_release.pdf' },
    source: { label: 'JCAM LP-Coat and M-Coat polyolefin-resin coated urea', url: 'https://www.jcam-agri.co.jp/en/product_introduction/lp-coat-m-coat/' }, checkedAt: '2026-09-26',
  },
  {
    id: 'vinyl-base-ipoh', productId: 'elo', company: 'Vinyl Base Sdn. Bhd.', country: 'Malaysia', countryZh: '马来西亚', city: 'Ipoh, Perak', latitude: 4.6000, longitude: 101.0720,
    legacyCompanyDescription: 'PVC 配方与医疗挤出制品制造商', fit: '可开发候选',
    signal: '官网说明该公司在马来西亚生产 PVC compound，并开发医疗塑料挤出管材；其公开资料明确列出 plasticizer selection criteria 与 non-phthalate 等增塑化配方选择。PVC 配方属于有独立来源支持的 ELO 增塑剂市场扩展场景，可核验增塑剂/稳定剂原料采购。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核官方公司介绍：其公开业务为 PVC compound 与下游医疗塑料挤出制品制造；本轮检索的官方来源未显示其生产或销售 ELO、环氧化植物油或同类增塑剂原料。' },
    contact: { label: 'Vinyl Base public business contact', email: 'admin@vinyl-base.com', phone: '+60 5-526 7231', contactUrl: 'https://vinyl-base.com/about-us/' },
    source: { label: 'Vinyl Base PVC compound manufacturing and plasticizer-selection description', url: 'https://vinyl-base.com/about-us/' }, checkedAt: '2026-09-26',
  },
  {
    id: 'schramm-coatings-offenbach', productId: 'nl-w1201', company: 'SCHRAMM Coatings GmbH (AkzoNobel)', country: 'Germany', countryZh: '德国', city: 'Offenbach am Main', latitude: 50.0956, longitude: 8.7761,
    legacyCompanyDescription: '水性汽车底涂与工业涂料配方商', fit: '可开发候选',
    signal: 'AkzoNobel 官网明确说明其 Automotive Specialty Coatings 由 SCHRAMM Coatings 开发和生产，并列出 EWP-079、EWP-204 等适用于 flamed PP/EPDM 与 ABS 的单组分水性 primer。该企业制造下游水性底涂成品，PP 与 ABS 均属 NL-W1201 TDS 已验证基材，可核验水性附着力材料采购及技术负责人。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核官方汽车涂料产品与德国实体资料：其公开业务为下游汽车/特种涂料和水性 primer 制造；本轮检索的官方来源未显示其生产或销售水性聚烯烃乳液、CPO/PO dispersion 或同类附着力原料。' },
    contact: { label: 'SCHRAMM Coatings public business contact', email: 'schramm-coatings@akzonobel.com', phone: '+49 69 8603 0', contactUrl: 'https://www.akzonobel.com/en/countries/germany/unsere-standorte' },
    source: { label: 'AkzoNobel waterborne PP/EPDM and ABS primers developed and produced by SCHRAMM Coatings', url: 'https://automotive.akzonobel.com/en/products/filters/comp_Waterborne' }, checkedAt: '2026-09-26',
  },
  {
    id: 'periwal-bhiwadi', productId: 'elo', company: 'Periwal Polymers Private Limited', country: 'India', countryZh: '印度', city: 'Bhiwadi, Rajasthan', latitude: 28.2040, longitude: 76.8460,
    legacyCompanyDescription: 'PVC 配方与线缆制品材料制造商', fit: '可开发候选',
    signal: '官网说明该公司在 Bhiwadi 自有 PVC compounding 工厂；其 PVC 产品规格明确写明配方由 resin、plasticizers、stabilizers 与其他 additives 组成，并用于线缆绝缘、护套等下游制品。PVC 配方属于有独立来源支持的 ELO 增塑剂市场扩展场景，可核验增塑剂/稳定剂原料采购。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核官方公司、工厂与 PVC 产品资料：其公开业务为 PVC/TPE compound 制造；本轮检索的官方来源未显示其生产或销售 ELO、环氧化植物油或同类增塑剂原料。' },
    contact: { label: 'Periwal Polymers public sales contact', email: 'sales@periwalpolymers.com', phone: '+91 9602295997', contactUrl: 'https://www.periwalpolymers.com/contact' },
    source: { label: 'Periwal PVC compound formulation with plasticizers and stabilizers', url: 'https://www.periwalpolymers.com/PP-VIN-T399.php' }, checkedAt: '2026-09-26',
  },
  {
    id: 'turf-care-martins-ferry', productId: 'fertilizer-coating', company: 'Turf Care Supply, LLC', country: 'United States', countryZh: '美国', city: 'Martins Ferry, Ohio', latitude: 40.0951, longitude: -80.7231,
    legacyCompanyDescription: '聚合物包膜尿素与控释肥制造商', fit: '优先核验',
    signal: '官网明确其 Martins Ferry 工厂是制造与肥料包衣设施，设有 polymer coating 能力；公司 EEF 产品页明确列出 PCU（Polymer Coated Urea）及 60、90、120、180 天释放规格。该企业生产下游包膜尿素和控释肥成品，具备包衣原料采购与生产负责人核验价值。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核官方 EEF 产品与 Martins Ferry 工厂资料：其公开业务为 PCU/控释肥成品制造、包衣和配混；本轮检索的官方来源未显示其销售肥料包衣树脂或包衣原料。' },
    contact: { label: 'Martins Ferry facility public contact', email: 'bmengeu@tcscusa.com', phone: '+1 740-633-6366', contactUrl: 'https://www.turfcaresupply.com/locations' },
    source: { label: 'Turf Care Supply polymer-coated urea and controlled-release fertilizer manufacturing', url: 'https://www.turfcaresupply.com/EEF_Technologies' }, checkedAt: '2026-09-26',
  },
  {
    id: 'omega-polimeros-trujui', productId: 'elo', company: 'Omega Polímeros', country: 'Argentina', countryZh: '阿根廷', city: 'Trujui, Moreno, Buenos Aires', latitude: -34.6460, longitude: -58.7920,
    legacyCompanyDescription: '柔性 PVC 配方制造商', fit: '可开发候选',
    signal: '官网明确其为 PVC compounds 生产商；柔性 PVC 产品页说明该类 compound 以不同类型的 plasticizers 制造，以获得柔韧性、抗撕裂或橡胶般外观。PVC 配方属于有独立来源支持的 ELO 增塑剂市场扩展场景，可核验增塑剂/稳定剂原料采购。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核官方产品、公司与联系资料：其公开业务为 PVC compound、masterbatch 和后续工程塑料/热塑性弹性体产品；本轮检索的官方来源未显示其生产或销售 ELO、环氧化植物油或同类增塑剂原料。' },
    contact: { label: 'Omega Polímeros public business contact', email: 'info@omegapolimeros.com.ar', phone: '+54 237 460 5440', contactUrl: 'https://omegapolimeros.com.ar/contacto/' },
    source: { label: 'Omega flexible PVC compounds made with plasticizers', url: 'https://omegapolimeros.com.ar/compuesto-pvc/' }, checkedAt: '2026-09-26',
  },
  {
    id: 'supernovae-funza', productId: 'elo', company: 'Supernovae S.A.S.', country: 'Colombia', countryZh: '哥伦比亚', city: 'Funza, Cundinamarca', latitude: 4.7164, longitude: -74.2119,
    legacyCompanyDescription: 'PVC 配方制造商', fit: '可开发候选',
    signal: '官网明确 Supernovae 制造定制 PVC compounds；其技术说明写明 PVC compound 由 resin、plasticizer、stabilizer 和 lubricants 制造，并提供柔性 PVC compound。PVC 配方属于有独立来源支持的 ELO 增塑剂市场扩展场景，可核验增塑剂/稳定剂原料采购。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核官方产品、公司与联系资料：其公开业务为技术型 PVC compound 制造与定制配方；本轮检索的官方来源未显示其生产或销售 ELO、环氧化植物油或同类增塑剂原料。' },
    contact: { label: 'Supernovae public sales contact', email: 'ventas@supernovae.com.co', phone: '+57 601 0242761', contactUrl: 'https://supernovae.com.co/portal/contacto/' },
    source: { label: 'Supernovae PVC compound formulation with plasticizer and stabilizer inputs', url: 'https://supernovae.com.co/portal/productos-servicios/' }, checkedAt: '2026-09-26',
  },
  {
    id: 'vivacor-diadema', productId: 'nl-w1201', company: 'Vivacor Indústria de Tintas e Vernizes Ltda.', country: 'Brazil', countryZh: '巴西', city: 'Diadema, São Paulo', latitude: -23.6856, longitude: -46.6186,
    legacyCompanyDescription: '水性柔版 / 凹版油墨制造商', fit: '可开发候选',
    signal: '官网明确该公司开发和制造柔性包装用水性与溶剂型油墨和清漆；水性产品线列有用于 PP 扭结包装的油墨和用于 HDPE 购物袋的油墨。官方技术资料另证实 PP/PE 水性油墨可通过水性 primer 提升附着力，因此属于有来源支持的 NL-W1201 下游水性油墨/底涂扩展场景，可核验水性聚烯烃附着力材料的采购与技术负责人。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核官方公司、产品和质量介绍：其公开业务为包装用水性/溶剂型油墨与清漆成品配方和制造；本轮检索的官方来源未显示其生产或销售水性聚烯烃乳液、CPO/PO dispersion 或同类附着力原料。' },
    contact: { label: 'Vivacor public business contact', email: 'sac@vivacor.com.br', phone: '+55 11 2713-3611', contactUrl: 'https://www.vivacor.com.br/v2/quem-somos/' },
    source: { label: 'Vivacor water-based inks for PP and HDPE flexible packaging', url: 'https://www.vivacor.com.br/v2/linha-a-base-de-agua/' }, checkedAt: '2026-09-26',
  },
  {
    id: 'agrobiotech-jardinopolis', productId: 'fertilizer-coating', company: 'Agrobiotech Agronegócio Ltda.', country: 'Brazil', countryZh: '巴西', city: 'Jardinópolis, São Paulo', latitude: -21.0172, longitude: -47.7626,
    legacyCompanyDescription: '聚合物包膜尿素与特种颗粒肥制造商', fit: '优先核验',
    signal: '官网明确 Agrobiotech 在巴西生产颗粒和液体肥料；其 Biocoat 产品页明确为 polymer-coated urea，通过聚合物包衣实现缓释。该企业生产下游包膜尿素成品，具备包衣原料采购与技术/生产负责人核验价值。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核官方公司、产品与服务资料：其公开业务为肥料、助剂和定制肥料的配方制造；本轮检索的官方来源未显示其生产或销售肥料包衣树脂、聚氨酯包衣原料或同类包衣原料。' },
    contact: { label: 'Agrobiotech public business contact', email: 'contato.site@agrobiotech.com.br', phone: '+55 16 99793-6989', contactUrl: 'https://agrobiotech.com.br/en/' },
    source: { label: 'Agrobiotech Biocoat polymer-coated urea product', url: 'https://agrobiotech.com.br/en/produtos/biocoat/' }, checkedAt: '2026-09-26',
  },
  {
    id: 'mica-shelton', productId: 'nl-w1201', company: 'Mica Corporation', country: 'United States', countryZh: '美国', city: 'Shelton, Connecticut', latitude: 41.3165, longitude: -73.0932,
    legacyCompanyDescription: '水性 primer / 附着力涂层配方商', fit: '可开发候选',
    signal: '官网产品目录显示其配制水性 primers 与 coatings：包括用于挤出 PP 的水性树脂配方，以及可附着 PE、PP、PVC 和铝材等基材的水性体系；该企业生产下游 primer/coating 成品，适合核验水性附着力材料的采购与技术负责人。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核官方产品目录：其公开产品为下游水性 primer/coating 配方；本轮检索的官方来源未显示其销售水性聚烯烃乳液或同类附着力原料。' },
    contact: { label: 'Mica Corporation public business contact', phone: '+1 203-922-8888', contactUrl: 'https://mica-corp.com/contact-us/' },
    source: { label: 'Mica water-based primers and coatings product catalog', url: 'https://mica-corp.com/products/' }, checkedAt: '2026-09-26',
  },
  {
    id: 'ac-profil-huttwil', productId: 'elo', company: 'AC-Profil AG', country: 'Switzerland', countryZh: '瑞士', city: 'Huttwil', latitude: 47.1150, longitude: 7.8600,
    legacyCompanyDescription: 'PVC 配方与型材制造商', fit: '可开发候选',
    signal: '官网说明其在 Huttwil 自行进行 PVC compounding，并将 PVC、TPE、PP 配方用于自有挤出和下游型材制造；PVC 配方属于有独立来源支持的 ELO 增塑剂市场扩展场景，可核验增塑剂/稳定剂原料采购。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核官方业务页：其公开业务为 PVC compound 与型材制造；本轮检索的官方来源未显示其生产或销售 ELO、环氧化植物油或同类增塑剂原料。' },
    contact: { label: 'AC-Profil public business contact', email: 'info@ac-profil.ch', phone: '+41 62 965 38 78', contactUrl: 'https://ac-profil.ch/en/contact' },
    source: { label: 'AC-Profil PVC compounding service', url: 'https://ac-profil.ch/en/services/plastic-compounding' }, checkedAt: '2026-09-26',
  },
  {
    id: 'nutrien-carseland', productId: 'fertilizer-coating', company: 'Nutrien Ltd. (Agrium Canada Partnership)', country: 'Canada', countryZh: '加拿大', city: 'Carseland, Alberta', latitude: 50.7070, longitude: -113.3960,
    legacyCompanyDescription: '聚合物包膜尿素生产商', fit: '优先核验',
    signal: 'Nutrien 官方产品页将 ESN 明确列为在 Carseland 生产的 polymer coated urea；官方数据表同时列出 2.9% coating weight。该企业生产下游包膜尿素，适合核验包衣原料的采购与生产负责人。',
    contact: { label: 'Agrium Canada Partnership public product information line', phone: '+1 800-403-2861', contactUrl: 'https://products.nutrien.com/products/87' },
    source: { label: 'Nutrien ESN Polymer Coated Urea product data sheet', url: 'https://products.nutrien.com/docs/1234' }, checkedAt: '2026-09-26',
  },
  {
    id: 'ichemco-cuggiono', productId: 'nl-w1201', company: 'ICHEMCO S.r.l.', country: 'Italy', countryZh: '意大利', city: 'Cuggiono, Milan', latitude: 45.5050, longitude: 8.8170,
    legacyCompanyDescription: '水性 PE / PP / PVC 底涂与胶黏剂配方商', fit: '可开发候选',
    signal: '官网水性底涂页面列出用于 corona-treated PE、PP 膜的水性 Primer EPA W 5，以及用于 PVC 膜的水性 Vinilprimer E 45；公司面向胶黏剂行业开发和制造底涂体系，属于下游配方使用场景，可核验水性附着力原料采购。',
    contact: { label: 'ICHEMCO public business contact', email: 'info@ichemco.it', phone: '+39 02 97243.1', contactUrl: 'https://www.ichemco.it/en/Contact' },
    source: { label: 'ICHEMCO water-based primers for PE, PP and PVC films', url: 'https://www.ichemco.it/en/Product/120' }, checkedAt: '2026-09-26',
  },
  {
    id: 'polymer-chemie-bad-sobernheim', productId: 'elo', company: 'Polymer-Chemie GmbH', country: 'Germany', countryZh: '德国', city: 'Bad Sobernheim', latitude: 49.7830, longitude: 7.6790,
    legacyCompanyDescription: '定制 PVC compound 配方与生产企业', fit: '优先核验',
    signal: '官网明确其修改和配制 PVC、开发客户定制配方，并披露 15 条 compounding 生产线；PVC compound 是 ELO 已有来源支持的 PVC 增塑剂市场扩展下游场景，可核验增塑剂/稳定剂原料采购。',
    contact: { label: 'Christian Leinberger · Head of Sales and R&D', email: 'christian.leinberger@polymer-chemie.de', phone: '+49 6751 84-635', contactUrl: 'https://www.polymer-chemie.de/en/contact/all-contact-persons' },
    source: { label: 'Polymer-Chemie PVC compounding and customer-specific formulation', url: 'https://www.polymer-chemie.de/en/' }, checkedAt: '2026-09-26',
  },
  {
    id: 'aline-detroit', productId: 'nl-w1201', company: 'A-Line Products Corporation', country: 'United States', countryZh: '美国', city: 'Detroit, Michigan', latitude: 42.3346, longitude: -83.0005,
    legacyCompanyDescription: '水性 PP / TPO 附着力促进剂与涂层配方商', fit: '替代方案研究',
    signal: '官网公开水性聚烯烃附着力促进剂用于 PP、TPO 基材，并提供底涂与涂层产品。',
    contact: { label: 'Official contact form and business line', phone: '+1 313-571-8300', contactUrl: 'https://a-line.com/contact-us/' },
    source: { label: 'A-Line waterborne adhesion promoter products', url: 'https://a-line.com/products/' }, checkedAt: '2026-09-25',
  },
  {
    id: 'rstone-jiaxing', productId: 'nl-w1201', company: 'Jiaxing RSTONE Chemical Co., Ltd.', country: 'China', countryZh: '中国', city: 'Jiaxing, Zhejiang', latitude: 30.7461, longitude: 120.7550,
    legacyCompanyDescription: '水性聚烯烃树脂 / 塑胶基材涂层配方商', fit: '替代方案研究',
    signal: '官网产品目录公开水性聚烯烃树脂及其对低附着基材的润湿、快干和适配方向。',
    contact: { label: 'Public business email', email: 'sale@rstone-resin.com', phone: '+86 573-82203606', contactUrl: 'https://www.rstone-resin.com/en/product/' },
    source: { label: 'RSTONE water-borne polyolefin resin product list', url: 'https://www.rstone-resin.com/en/product/' }, checkedAt: '2026-09-25',
  },
  {
    id: 'tize-zhaoqing', productId: 'nl-w1201', company: 'Guangdong Tize New Tech Material Co., Ltd.', country: 'China', countryZh: '中国', city: 'Zhaoqing, Guangdong', latitude: 23.0528, longitude: 112.4651,
    legacyCompanyDescription: '水性树脂与附着力促进剂配方商', fit: '替代方案研究',
    signal: '官网产品线列出 Waterborne Adhesion Promoter 及多类水性树脂，适合进入技术路线和原料合作筛选。',
    contact: { label: 'Public business email', email: 'junnia@zqtize.com', phone: '+86 758-7739919', contactUrl: 'https://zqtize.com/cate-38687.html' },
    source: { label: 'Tize waterborne resin and adhesion promoter line', url: 'https://zqtize.com/cate-38687.html' }, checkedAt: '2026-09-25',
  },
  {
    id: 'tramaco-tornesch', productId: 'nl-w1201', company: 'TRAMACO GmbH', country: 'Germany', countryZh: '德国', city: 'Tornesch', latitude: 53.6990, longitude: 9.7180,
    legacyCompanyDescription: 'PP / PE / TPO 底涂与附着力促进剂配方商', fit: '替代方案研究',
    signal: '官方资料说明其底涂和附着力促进剂用于 PP、PE、TPO 等难涂覆塑料，并用于涂料、油墨和胶黏剂。',
    contact: { label: 'Primer technical contact', email: 'primer@tramaco.de', phone: '+49 4101-706-02', contactUrl: 'https://www.rowa-group.com/fileadmin/user_upload/ROWAnews_01_2022_en_web.pdf' },
    source: { label: 'TRAMACO primer application note', url: 'https://www.rowa-group.com/fileadmin/user_upload/ROWAnews_01_2022_en_web.pdf' }, checkedAt: '2026-09-25',
  },
  {
    id: 'unitika-tokyo', productId: 'nl-w1201', company: 'UNITIKA LTD. Plastics Division', country: 'Japan', countryZh: '日本', city: 'Tokyo', latitude: 35.6762, longitude: 139.6503,
    legacyCompanyDescription: 'PP 水性聚烯烃底涂与薄膜复合配方商', fit: '替代方案研究',
    signal: '官方资料说明改性聚烯烃水性分散体面向 PP 的附着力需求，覆盖电子、汽车、建材与工业复合应用。',
    contact: { label: 'Tokyo Plastics Division', phone: '+81 3-3246-7610', contactUrl: 'https://www.unitika.co.jp/plastics/products/a-base/pdf/arrowbase02_unitika.pdf' },
    source: { label: 'UNITIKA Arrowbase water-based PP primer', url: 'https://www.unitika.co.jp/plastics/products/a-base/pdf/arrowbase02_unitika.pdf' }, checkedAt: '2026-09-25',
  },
  {
    id: 'cargill-minneapolis', productId: 'elo', company: 'Cargill Bioindustrial', country: 'United States', countryZh: '美国', city: 'Minneapolis, Minnesota', latitude: 44.9778, longitude: -93.2650,
    legacyCompanyDescription: 'ELO / PVC 增塑剂与稳定剂配方商', fit: '替代方案研究',
    signal: '官方产品资料列出 Vikoflex 7190 环氧化亚麻油及 PVC 增塑、稳定应用，并公开业务邮箱。',
    contact: { label: 'Plasticizers business team', email: 'plasticizers@cargill.com', contactUrl: 'https://www.cargill.com/doc/1432225010751/plasticizres-vikoflex-7190.pdf' },
    source: { label: 'Cargill Vikoflex 7190 ELO product data', url: 'https://www.cargill.com/doc/1432225010751/plasticizres-vikoflex-7190.pdf' }, checkedAt: '2026-09-25',
  },
  {
    id: 'acs-griffith', productId: 'elo', company: 'ACS Technical Products, Inc.', country: 'United States', countryZh: '美国', city: 'Griffith, Indiana', latitude: 41.5284, longitude: -87.4236,
    legacyCompanyDescription: 'ELO / PVC、涂料与润滑油配方商', fit: '替代方案研究',
    signal: '官网公开 EPOXOL 9-5 环氧化亚麻油，以及 PVC、涂料和润滑油等市场应用。',
    contact: { label: 'Official sample / quote request', phone: '+1 219-924-4370', contactUrl: 'https://www.acstech.com/products/epoxol-9-5/' },
    source: { label: 'ACS EPOXOL 9-5 ELO applications', url: 'https://www.acstech.com/products/epoxol-9-5/' }, checkedAt: '2026-09-25',
  },
  {
    id: 'inbra-orangeburg', productId: 'elo', company: 'INBRA Indústria Química', country: 'United States', countryZh: '美国', city: 'Orangeburg, South Carolina', latitude: 33.4918, longitude: -80.8556,
    legacyCompanyDescription: 'PVC 增塑剂与 ELO 配方商', fit: '替代方案研究',
    signal: '官网的增塑剂产品页明确提及环氧化亚麻油用于 PVC 配方，并公开业务电话和联系入口。',
    contact: { label: 'Official contact page', phone: '+55 11-4061-9000', contactUrl: 'https://inbra.com.br/en/produtos/plastificantes/' },
    source: { label: 'INBRA epoxidized linseed oil plasticizer page', url: 'https://inbra.com.br/en/produtos/plastificantes/' }, checkedAt: '2026-09-25',
  },
  {
    id: 'adeka-tokyo', productId: 'elo', company: 'ADEKA Corporation', country: 'Japan', countryZh: '日本', city: 'Tokyo', latitude: 35.6762, longitude: 139.6503,
    legacyCompanyDescription: 'ELO / PVC 增塑剂、稳定剂配方商', fit: '替代方案研究',
    signal: '官方产品页列出环氧化亚麻油型环氧增塑剂及 PVC 薄膜、线缆、管材等应用方向。',
    contact: { label: 'Official product enquiry', contactUrl: 'https://www.adeka.co.jp/en/chemical/products/pvc/pro121c.html' },
    source: { label: 'ADEKA epoxy plasticizers product page', url: 'https://www.adeka.co.jp/en/chemical/products/pvc/pro121c.html' }, checkedAt: '2026-09-25',
  },
  {
    id: 'traditem-hilden', productId: 'elo', company: 'Traditem GmbH', country: 'Germany', countryZh: '德国', city: 'Hilden', latitude: 51.1675, longitude: 6.9309,
    legacyCompanyDescription: 'ELO 化工分销与配方供应商', fit: '可开发候选',
    signal: '官网化学品目录列出环氧化亚麻油 CAS 8016-11-3，并公开德国业务邮箱与电话。',
    contact: { label: 'Public business email', email: 'info@traditem.com', phone: '+49 2103-25372-90', contactUrl: 'https://traditem.com/en/products/epoxies' },
    source: { label: 'Traditem epoxidized linseed oil listing', url: 'https://traditem.com/en/products/epoxies' }, checkedAt: '2026-09-25',
  },
  {
    id: 'astra-chemtech-mumbai', productId: 'nl-w1201', company: 'Astra Chemtech Private Limited', country: 'India', countryZh: '印度', city: 'Mumbai, Maharashtra', latitude: 19.0760, longitude: 72.8777,
    legacyCompanyDescription: '水性 PP / BOPP 底涂与胶黏剂配方制造商', fit: '可开发候选',
    signal: '官网产品页列出 Astra Aqueous Primer，明确用于 PP / BOPP film，并说明为树脂和丙烯酸聚合物的配方；公司介绍同时确认其自有制造单元及 adhesives、primers、water-based coatings 产品线。PP 与 OPP/BOPP 均属于 NL-W1201 TDS 已验证基材，因此该企业作为下游水性 primer 配方制造商，具备核验附着力材料采购和技术/生产负责人的价值。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核官方产品、制造能力与联系页：其公开业务为水性 primer、胶黏剂和涂层等下游配方产品制造；本轮检索的官方来源未显示其生产或销售水性聚烯烃乳液、CPO/PO dispersion 或同类附着力原料。' },
    contact: { label: 'Astra Chemtech public director and technical-support contact', phone: '+91 80 4896 4978', contactUrl: 'https://www.astrachemtech.com/enquiry.html' },
    source: { label: 'Astra water-based primer for PP/BOPP film', url: 'https://www.astrachemtech.com/astra-water-based-primer-for-paper-board.html' }, checkedAt: '2026-09-26',
  },
  {
    id: 'nam-ah-ipoh', productId: 'elo', company: 'Syarikat Nam Ah Sdn. Bhd.', country: 'Malaysia', countryZh: '马来西亚', city: 'Ipoh, Perak', latitude: 4.6000, longitude: 101.0720,
    legacyCompanyDescription: '增塑化 PVC 配方制造商', fit: '可开发候选',
    signal: '官网明确该公司为马来西亚 flexible 与 rigid PVC compounds 制造商；其产品范围明确包括 plasticized PVC compounds，并用于线缆、钢丝包覆、软管/管材和鞋材。PVC 配方属于有独立来源支持的 ELO 增塑剂市场扩展场景，因此该企业作为下游 PVC 配方制造商，具备核验增塑剂/稳定剂原料采购及技术/生产负责人的价值。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核官方产品、制造能力与联系页：其公开业务为 flexible/rigid PVC compound 的下游配方制造；本轮检索的官方来源未显示其生产或销售 ELO、环氧化植物油、增塑剂或同类原料。' },
    contact: { label: 'Syarikat Nam Ah public sales contact', email: 'sales@snasb.com', phone: '+60 5-291 9961', contactUrl: 'https://www.snasb.com/' },
    source: { label: 'Syarikat Nam Ah plasticized PVC compound manufacturing', url: 'https://www.snasb.com/' }, checkedAt: '2026-09-26',
  },
  {
    id: 'dacarto-osasco', productId: 'elo', company: 'Dacarto Indústria e Comércio de Plásticos Ltda.', country: 'Brazil', countryZh: '巴西', city: 'Osasco, São Paulo', latitude: -23.5329, longitude: -46.7919,
    legacyCompanyDescription: '增塑化 PVC 配方制造商', fit: '可开发候选',
    signal: '官网明确 Dacarto 为巴西 PVC compounds 制造商；其产品技术页明确 PVC compound 由 PVC resin 与 thermal stabilizers、plasticizers、lubricants、pigments 等 additives 组成，并列出面向线缆的 plasticized PVC compounds。PVC 配方属于有独立来源支持的 ELO 增塑剂市场扩展场景，因此该企业作为下游 PVC 配方制造商，具备核验增塑剂/稳定剂原料采购及技术/生产负责人的价值。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核官方产品、公司介绍与公开联系资料：其公开业务为 PVC、聚烯烃 compounds、blends 和 masterbatches 等下游配方制造；本轮检索的官方来源未显示其生产或销售 ELO、环氧化植物油、增塑剂或同类原料。' },
    contact: { label: 'Dacarto public commercial contact', email: 'comercial@dacarto.com.br', phone: '+55 11 3658-9490', contactUrl: 'https://dacarto.com.br/produtos/' },
    source: { label: 'Dacarto PVC compounds formulated with plasticizers', url: 'https://dacarto.com.br/produtos/' }, checkedAt: '2026-09-26',
  },
  {
    id: 'flint-group-malmo', productId: 'nl-w1201', company: 'Flint Group Packaging Solutions', country: 'Sweden', countryZh: '瑞典', city: 'Malmö', latitude: 55.6050, longitude: 13.0038,
    legacyCompanyDescription: 'PP / PE 薄膜水性包装油墨配方制造商', fit: '可开发候选',
    signal: '官网公开其 PremoFilm SXS/2 为用于聚烯烃薄膜表印和里印的水性油墨，并明确列出 PE 膜应用；官网同时说明其包装业务提供油墨、涂层和底涂等下游配方产品。PP / PE 水性油墨附着力底涂属于已有独立来源支持的 NL-W1201 市场扩展场景，因此该企业作为水性油墨配方制造商，具备核验水性附着力材料采购及技术/生产负责人的价值。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核官方水性包装油墨、包装产品与研发中心资料：其公开业务为油墨、涂层和底涂等下游配方成品；本轮检索的官方来源未显示其生产或销售水性聚烯烃乳液、CPO/PO dispersion 或同类附着力原料。' },
    contact: { label: 'Flint Group Packaging Solutions public business email', email: 'info.packaginginks@flintgrp.com', contactUrl: 'https://www.flintgrp.com/news-and-events/news/2810-flint-group-introduces-premofilm-sxs-2/' },
    source: { label: 'Flint Group PremoFilm water-based inks for polyolefin films', url: 'https://www.flintgrp.com/news-and-events/news/2810-flint-group-introduces-premofilm-sxs-2/' }, checkedAt: '2026-09-26',
  },
  {
    id: 'inx-schaumburg', productId: 'nl-w1201', company: 'INX International Ink Co.', country: 'United States', countryZh: '美国', city: 'Schaumburg, Illinois', latitude: 42.0334, longitude: -88.0834,
    legacyCompanyDescription: 'HDPE / 聚烯烃包装水性油墨配方制造商', fit: '可开发候选',
    signal: '官网公开 INX 为油墨与涂层解决方案制造商；其 2026 年包装资料明确 Aquamax 为用于 HDPE 超市袋等应用的可回收水性油墨体系，并公开说明其拥有油墨生产实验室与研发能力。HDPE 属于 PE 聚烯烃，PP / PE 水性油墨附着力底涂属于已有独立来源支持的 NL-W1201 市场扩展场景，因此该企业作为水性油墨配方制造商，具备核验水性附着力材料采购及技术/生产负责人的价值。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核官方水性油墨、包装涂层、技术服务与联系资料：其公开业务为油墨、涂层及相关下游配方成品；本轮检索的官方来源未显示其生产或销售水性聚烯烃乳液、CPO/PO dispersion 或同类附着力原料。' },
    contact: { label: 'INX public technical, vendor and customer-service contact page', phone: '+1 630-382-1800', contactUrl: 'https://www.inxinternational.com/contact-us' },
    source: { label: 'INX Aquamax water-based ink for HDPE packaging bags', url: 'https://www.inxinternational.com/news/inx-international-showcase-sustainable-packaging-inks-and-nitrocellulose-free-technologies' }, checkedAt: '2026-09-26',
  },
  {
    id: 'shakun-vadodara', productId: 'elo', company: 'Shakun Polymers Private Limited', country: 'India', countryZh: '印度', city: 'Vadodara, Gujarat', latitude: 22.3072, longitude: 73.1812,
    legacyCompanyDescription: '增塑剂使用型 PVC 电缆配方制造商', fit: '可开发候选',
    signal: '官网产品与技术资料显示 Shakun 为 PVC compound 制造商；其 SPL-VTEK-S 52 电缆护套 PVC compound 明确由高质量树脂、special plasticizers 与 stabilizers 配制，并用于电力电缆。PVC 配方属于有独立来源支持的 ELO 增塑剂市场扩展场景，因此该企业作为实际使用增塑剂的下游 PVC 配方制造商，具备核验 ELO 类功能添加剂采购及技术/生产负责人的价值。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核官方产品、PVC compound 技术资料和联系页：其公开业务为电缆与汽车等用途的下游 PVC compounds；本轮检索的官方来源未显示其生产或销售 ELO、环氧化植物油、增塑剂或同类原料。' },
    contact: { label: 'Shakun Polymers public business contact', email: 'contacts@shakunpolymers.com', phone: '+91-265-6196 500', contactUrl: 'https://www.shakunpolymers.com/contact/' },
    source: { label: 'Shakun PVC cable compound formulated with plasticizers and stabilizers', url: 'https://shakunpolymers.com/admin/assets/img/itempdfs/SPL-VTEK-S%2052.pdf' }, checkedAt: '2026-09-26',
  },
  {
    id: 'pvc-colouring-ahmedabad', productId: 'elo', company: 'PVC Colouring Compounding & Processing', country: 'India', countryZh: '印度', city: 'Ahmedabad, Gujarat', latitude: 23.0225, longitude: 72.5714,
    legacyCompanyDescription: '增塑剂使用型柔性 PVC 配方制造商', fit: '可开发候选',
    signal: '官网明确该企业生产 PVC compounds，并公开其管材用柔性 PVC compound 的 plasticizer content 为 30–45%；公司介绍同时公开其自有制造设施及 PVC compound、软管和医疗管材等产品范围。PVC 配方属于有独立来源支持的 ELO 增塑剂市场扩展场景，因此该企业作为实际使用增塑剂的下游 PVC 配方制造商，具备核验 ELO 类功能添加剂采购及技术/生产负责人的价值。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核官方 PVC compound 产品、制造能力与公开联系资料：其公开业务为 PVC compounds、型材和管材等下游配方/制品制造；本轮检索的官方来源未显示其生产或销售 ELO、环氧化植物油、增塑剂或同类原料。' },
    contact: { label: 'PVC Colouring public marketing contact', phone: '+91 8045477858', contactUrl: 'https://www.pvccompound.in/' },
    source: { label: 'PVC Colouring flexible PVC compound with published plasticizer content', url: 'https://www.pvccompound.in/tubes-pvc-compound-4681561.html' }, checkedAt: '2026-09-26',
  },
  {
    id: 'sun-chemical-parsippany', productId: 'nl-w1201', company: 'Sun Chemical Corporation', country: 'United States', countryZh: '美国', city: 'Parsippany, New Jersey', latitude: 40.8653, longitude: -74.4174,
    legacyCompanyDescription: 'OPP / PE 水性软包装油墨配方制造商', fit: '可开发候选',
    signal: '官网公开 SunStrato AquaLam 为用于复合结构的水性包装油墨，明确适用于 OPP/OPP 与 OPP/PE 薄膜并具备附着力和复合粘结表现；官网同时说明其开发水性软包装油墨。PP/PE 水性油墨附着力底涂属于已有独立来源支持的 NL-W1201 市场扩展场景，因此该企业作为水性油墨配方制造商，具备核验水性附着力材料采购及技术/生产负责人的价值。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核官方水性包装油墨、产品联系与区域资料：其公开业务为油墨、涂层、颜料及包装解决方案；本轮检索的官方来源未显示其生产或销售水性聚烯烃乳液、CPO/PO dispersion 或同类附着力原料。' },
    contact: { label: 'Sun Chemical public product contact page', contactUrl: 'https://www.sunchemical.com/contact-us/' },
    source: { label: 'Sun Chemical SunStrato AquaLam water-based inks for OPP / PE films', url: 'https://www.sunchemical.com/packaging_product_sunstrato/' }, checkedAt: '2026-09-26',
  },
  {
    id: 'crf-malaysia-kuala-lumpur', productId: 'fertilizer-coating', company: 'CRF Malaysia Sdn Bhd', country: 'Malaysia', countryZh: '马来西亚', city: 'Kuala Lumpur', latitude: 3.1390, longitude: 101.6869,
    legacyCompanyDescription: '控释/缓释肥与 OEM 制造商', fit: '可开发候选',
    signal: '官网说明 CRF Malaysia 专注于控释和缓释肥配方，并公开其工厂采用 polymer coating、polymer-layered coating 与 film coating 等工艺；官网同时披露两座马来西亚生产设施及 OEM 服务。该企业生产下游控释/缓释肥成品而非普通肥料，因而具备核验包衣原料采购、技术及工厂负责人的价值。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核官网技术、工厂和联系资料：其公开业务为控释/缓释肥配方、OEM 和成品肥制造；本轮检索的官方来源未显示其生产或销售肥料包衣树脂、聚氨酯包衣原料或同类包衣原料。' },
    contact: { label: 'CRF Malaysia public business contact', email: 'inquiry@crfm.com.my', phone: '+60 3-4819 2728', contactUrl: 'https://crfm.com.my/' },
    source: { label: 'CRF Malaysia controlled-release fertilizer facilities and coating technology', url: 'https://crfm.com.my/' }, checkedAt: '2026-09-26',
  },
  {
    id: 'cai-georgetown', productId: 'nl-w1201', company: 'CAI Inc.', country: 'United States', countryZh: '美国', city: 'Georgetown, Massachusetts', latitude: 42.7262, longitude: -70.9934,
    legacyCompanyDescription: 'PP / PE 水性柔版与凹版油墨配方制造商', fit: '可开发候选',
    signal: '官网明确 CAI 自行制造水性和溶剂型柔版/凹版油墨体系，并说明其水性油墨用于 polyethylene、polypropylene、polyester、PVC 膜等基材；官网同时公开其配方定制、实验室及制造设备。PP/PE 水性油墨附着力底涂属于已有独立来源支持的 NL-W1201 市场扩展场景，因此该企业作为水性油墨配方制造商，具备核验水性附着力材料采购及技术/生产负责人的价值。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核官网的水性油墨、涂层、实验室与公开联系资料：其公开业务为油墨和涂层等下游配方成品制造；本轮检索的官方来源未显示其生产或销售水性聚烯烃乳液、CPO/PO dispersion 或同类附着力原料。' },
    contact: { label: 'CAI public business email', email: 'info@caiink.com', phone: '+1 978-352-4510', contactUrl: 'https://www.caiink.com/' },
    source: { label: 'CAI water-based flexographic and gravure inks for PE / PP films', url: 'https://www.caiink.com/' }, checkedAt: '2026-09-26',
  },
  {
    id: 'applied-db-samut-prakan', productId: 'elo', company: 'Applied DB Public Company Limited (ADB)', country: 'Thailand', countryZh: '泰国', city: 'Samut Prakan', latitude: 13.5670, longitude: 100.6445,
    legacyCompanyDescription: '增塑剂使用型软质 PVC 配方制造商', fit: '可开发候选',
    signal: '官网明确 ADB 制造软质 PVC compound，覆盖线缆、软管与医疗级配方；官方年报进一步说明 PVC compound 由 PVC resin 与 plasticizer、热稳定剂、填料和颜料等添加剂按比例混配。PVC 配方属于有独立来源支持的 ELO 增塑剂市场扩展场景，因此该企业作为实际使用增塑剂的下游 PVC 配方制造商，具备核验 ELO 类功能添加剂采购及技术/生产负责人的价值。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核官网 PVC compound、软质配方、工厂与公开联系资料：其公开业务为 PVC compounds、胶黏剂和密封胶等下游配方产品制造；本轮检索的官方来源未显示其生产或销售 ELO、环氧化植物油、增塑剂或同类原料。' },
    contact: { label: 'ADB overseas customer service and sales contact', email: 'adb_marketing@adb.co.th', phone: '+66 2-323-1906', contactUrl: 'https://www.adb.co.th/en/contact-us-2/' },
    source: { label: 'ADB annual report: PVC compound formulated with plasticizer', url: 'https://www.adb.co.th/wp-content/uploads/2024/03/Annual-Report-2023.pdf' }, checkedAt: '2026-09-26',
  },
  {
    id: 'ceccan-san-jose-iturbide', productId: 'elo', company: 'Plásticos Ceccan S.A. de C.V.', country: 'Mexico', countryZh: '墨西哥', city: 'San José Iturbide, Guanajuato', latitude: 21.0002, longitude: -100.3858,
    legacyCompanyDescription: '使用增塑剂的软质 PVC 配方生产商', fit: '可开发候选',
    signal: 'CECCAN 官网明确其自行生产软质 PVC compounds，并披露每月 3,000 吨配方产能及可储存 550 吨增塑剂的设施。这证明其属于使用增塑剂开展下游 PVC 配方制造的企业；PVC 增塑剂方向已有独立市场扩展来源。公开资料未证明该公司目前采购或使用 ELO，需进一步向采购或技术部门核实。',
    supplierCompetitorCheck: { checkedAt: '2026-09-27', conclusion: '已复核官网产品、设施和联系资料：公开销售产品为刚性、半刚性和软质 PVC compounds；本轮检索的官方来源未显示其生产或销售 ELO、环氧化植物油、增塑剂或类似原料。' },
    contact: { label: 'CECCAN public sales contact', email: 'ventas@ceccan.com.mx', phone: '+52 419 198 4037', contactUrl: 'https://www.ceccan.com.mx/en/' },
    source: { label: 'CECCAN PVC compounds and plasticizer-storage facilities', url: 'https://www.ceccan.com.mx/en/' }, checkedAt: '2026-09-27',
  },
  {
    id: 'central-chemical-ube', productId: 'fertilizer-coating', company: 'Central Chemical Co., Ltd.', country: 'Japan', countryZh: '日本', city: 'Ube, Yamaguchi', latitude: 33.9519, longitude: 131.2472,
    legacyCompanyDescription: '包膜尿素与控释肥生产商', fit: '可开发候选',
    signal: 'Central Chemical 官网与母公司 Central Glass 的产品资料确认其制造 Cera-coat R 包膜尿素/控释肥，包膜使用植物油来源的聚氨酯树脂；其宇部工厂和公司电话公开。它是包膜肥成品的下游制造商，具备探讨包衣原料适配性的业务逻辑，但公开资料未证明其采购外部包衣原料或计划更换现有配方。',
    supplierCompetitorCheck: { checkedAt: '2026-09-27', conclusion: '已复核公司和母公司的包膜肥产品、企业及工厂页面：公开销售产品为 Cera-coat R 等肥料成品；本轮检索的官方来源未显示其对外销售包衣树脂、聚氨酯包衣原料或同类包衣剂。' },
    contact: { label: 'Central Chemical official Ube plant telephone', phone: '+81 836-34-5848', contactUrl: 'https://www.cgc-jp.com/company/affiliates/centralgodo.html' },
    source: { label: 'Central Glass Cera-coat R coated-urea product page', url: 'https://www.cgc-jp.com/products/detail/ceracoat.html' }, checkedAt: '2026-09-27',
  },
  {
    id: 'tintas-prisma-tlalnepantla', productId: 'nl-w1201', company: 'Tintas para Impresión Prisma, S.A. de C.V.', country: 'Mexico', countryZh: '墨西哥', city: 'Tlalnepantla de Baz, Estado de México', latitude: 19.5367, longitude: -99.1947,
    legacyCompanyDescription: 'HDPE 薄膜水性柔版油墨制造商', fit: '可开发候选',
    signal: '官网确认 Tintas Prisma 自行制造油墨，其 AQUAPOLY 系列为在电晕处理 HDPE 薄膜上印刷的水性柔版油墨。PE 是 NL-W1201 的 TDS 已验证基材；PP/PE 水性油墨附着力方向另有独立市场扩展来源。该公司生产下游水性油墨配方，具备核验水性附着促进材料适配性及采购/技术负责人的逻辑；公开资料未证明其采购或使用 NL-W1201，也未证明其当前使用聚烯烃底涂。',
    supplierCompetitorCheck: { checkedAt: '2026-09-27', conclusion: '已复核官网水性/溶剂型油墨及辅助添加剂产品页：虽销售 pH 调节、消泡、干燥调节等油墨辅助剂，本轮官方来源未显示其生产或销售水性聚烯烃乳液、CPO/PO dispersion 或同类附着促进原料。' },
    contact: { label: 'Tintas Prisma public sales contact', email: 'ventas@tintasprisma.com.mx', phone: '+52 55 5384 7600', contactUrl: 'https://tintasprisma.com.mx/contacto.html' },
    source: { label: 'Tintas Prisma AQUAPOLY water-based flexographic ink for HDPE film', url: 'https://tintasprisma.com.mx/p-2.html' }, checkedAt: '2026-09-27',
  },
  {
    id: 'alpha-plast-devland', productId: 'elo', company: 'Alpha Plast (Pty) Ltd', country: 'South Africa', countryZh: '南非', city: 'Devland, Johannesburg', latitude: -26.2735, longitude: 27.9357,
    legacyCompanyDescription: '使用增塑剂的 PVC 配方生产商', fit: '可开发候选',
    signal: 'Alpha Plast 官网明确其自有 PVC compound 配方工厂将增塑剂、稳定剂和其他添加剂混入 PVC 树脂，并生产供挤出和注塑加工的软质/硬质 PVC compounds。PVC 增塑剂方向已有独立市场扩展来源，因此该企业属于 ELO 的潜在下游配方使用场景；公开资料未证明其采购或使用 ELO 或环氧化植物油。',
    supplierCompetitorCheck: { checkedAt: '2026-09-27', conclusion: '已复核官网 PVC compound、生产工艺及联系资料：公开销售的是下游 PVC compounds；本轮官方来源未显示其生产或销售 ELO、ESBO、环氧化植物油、增塑剂或类似原料。' },
    contact: { label: 'Alpha Plast public sales contact', email: 'sales@alphaplast.co.za', phone: '+27 11 933 3200', contactUrl: 'https://alphaplast.co.za/contact-us/' },
    source: { label: 'Alpha Plast PVC compounding process using plasticizers', url: 'https://alphaplast.co.za/markets-and-applications/' }, checkedAt: '2026-09-27',
  },
  {
    id: 'mivena-maastricht', productId: 'fertilizer-coating', company: 'Mivena B.V.', country: 'Netherlands', countryZh: '荷兰', city: 'Maastricht', latitude: 50.8514, longitude: 5.6909,
    legacyCompanyDescription: '控释包膜肥生产商', fit: '可开发候选',
    signal: 'Mivena 官网确认其在 Maastricht 工厂生产 Granucote、Horti-Cote 等包膜控释肥，官方资料说明其使用树脂包衣技术，工厂对入厂原料进行检验。该公司处于包衣肥成品制造环节，具备核验包衣原料适配性和采购负责人的逻辑；公开资料未证明其采购外部包衣树脂或使用我方材料。',
    supplierCompetitorCheck: { checkedAt: '2026-09-27', conclusion: '已复核官网产品目录、工厂和包衣技术资料：公开销售的是控释肥、缓释肥及其他肥料成品；本轮官方来源未显示其对外销售肥料包衣树脂、PU 包衣原料或同类包衣剂。' },
    contact: { label: 'Mivena public general contact', email: 'info@mivena.nl', phone: '+31 416 337 464', contactUrl: 'https://mivena.nl/contact/' },
    source: { label: 'Mivena Maastricht coated-fertilizer production facility', url: 'https://mivena.nl/factory-2020/' }, checkedAt: '2026-09-27',
  },
  {
    id: 'greenbest-henstridge', productId: 'fertilizer-coating', company: 'GreenBest Ltd', country: 'United Kingdom', countryZh: '英国', city: 'Henstridge, Somerset', latitude: 50.9773, longitude: -2.3945,
    legacyCompanyDescription: '聚合物包膜尿素生产商', fit: '可开发候选',
    signal: 'GreenBest 官网展示 Henstridge 自有肥料包衣产线，并明确说明将尿素颗粒加工成 Nutrilong V90 聚合物包膜肥。其招聘页还列出原料配料与包衣设备操作岗位，证明其处于包膜肥成品制造环节；公开资料未证明其采购我方原料或采用相同包衣化学体系。',
    supplierCompetitorCheck: { checkedAt: '2026-09-27', conclusion: '已复核官网包衣工厂、产品目录、招聘及联系资料：公开销售的是包膜肥及其他肥料成品；本轮官方来源未显示其对外销售包衣树脂、PU 包衣原料或同类包衣剂。' },
    contact: { label: 'GreenBest public sales contact', email: 'sales@greenbest.co.uk', phone: '+44 1963 364788', contactUrl: 'https://www.greenbest.co.uk/contact-us/' },
    source: { label: 'GreenBest factory tour documenting in-house polymer-coated urea production', url: 'https://www.greenbest.co.uk/uk-lawn-care-association-visit-greenbest-factory/' }, checkedAt: '2026-09-27',
  },
  {
    id: 'palini-vernici-pisogne', productId: 'nl-w1201', company: 'Palini Vernici S.r.l. (PALINAL)', country: 'Italy', countryZh: '意大利', city: 'Pisogne, Brescia', latitude: 45.8110, longitude: 10.1083,
    legacyCompanyDescription: '水性塑料底涂配方生产商', fit: '可开发候选',
    signal: 'PALINAL 官网列出自行生产的 ABS 用水性底涂 100I0611 和 ABS/PP 用水性底涂 100I2091；其研发实验室明确研究新一代原料并配制涂料成品，属于 NL-W1201 已验证 ABS 基材的下游配方场景。官网同时注明 PP 应用需要预处理，不能将该公司现有产品说成适用于未经处理 PP；公开资料未证明其采购或使用 NL-W1201。',
    supplierCompetitorCheck: { checkedAt: '2026-09-27', conclusion: '已复核官网底涂产品、制造与研发、联系资料：公开销售的是下游涂料及底涂成品；本轮官方来源未显示其对外销售水性聚烯烃乳液、附着促进原料或类似原料。' },
    contact: { label: 'Palini Vernici public general contact', email: 'mail@palinal.com', phone: '+39 0364 882727', contactUrl: 'https://www.palinal.com/contacts.html' },
    source: { label: 'PALINAL water-based primers for ABS and ABS/PP', url: 'https://www.palinal.com/products/plastic/primers-and-fillers/motorbike-ids19/' }, checkedAt: '2026-09-27',
  },
  {
    id: 'sankhla-industries-bengaluru', productId: 'elo', company: 'Sankhla Industries', country: 'India', countryZh: '印度', city: 'Bengaluru, Karnataka', latitude: 13.0891, longitude: 77.4104,
    legacyCompanyDescription: '增塑剂使用型 PVC 配方生产商', fit: '可开发候选',
    signal: 'Sankhla Industries 官网销售自行配制的软质 PVC compounds，其官方 SP90 技术单明确列出 PVC 树脂、增塑剂和稳定剂作为配方组分；公开判决材料还记载其在 PVC compound 制造中使用过 ESBO。PVC 中使用环氧化植物油有独立市场扩展来源，因此属于 ELO 类添加剂的潜在下游使用场景；ESBO 的使用记录不证明其使用 ELO、正在外购 ELO 或已有采购需求。',
    supplierCompetitorCheck: { checkedAt: '2026-09-27', conclusion: '已复核官网首页、PVC compound 产品页与技术单：公开销售的是下游 PVC compounds；本轮官方来源未显示其生产或销售 ELO、ESBO、环氧化植物油或同类增塑剂原料。' },
    contact: { label: 'Sankhla Industries public company contact in official product specification', email: 'info@sankhlaindustries.com', phone: '+91 80 41179362', contactUrl: 'https://www.sankhlaindustries.com/blank-1' },
    source: { label: 'Sankhla Industries SP90 PVC compound specification naming plasticizers and stabilizers', url: 'https://www.sankhlaindustries.com/sankhlaspecifications/SP90.pdf' }, checkedAt: '2026-09-27',
  },
  {
    id: 'harrells-sylacauga', productId: 'fertilizer-coating', company: "Harrell's LLC", country: 'United States', countryZh: '美国', city: 'Sylacauga, Alabama', latitude: 33.1732, longitude: -86.2516,
    legacyCompanyDescription: 'POLYON 聚合物包膜控释肥生产商', fit: '可开发候选',
    signal: 'Harrell’s 官网明确其在 Sylacauga, Alabama 设有 POLYON 肥料包衣工厂，并说明自行采购及包覆 POLYON 产品所用颗粒基材。该公司生产下游聚合物包膜控释肥成品，具备核验包衣原料适配性和生产/采购负责人的业务逻辑；公开资料未证明其外购我方包衣原料、愿意更换现有配方或存在明确采购需求。',
    supplierCompetitorCheck: { checkedAt: '2026-09-27', conclusion: '已复核官网 POLYON 产品、包衣工厂和联系资料：其公开销售的是控释肥成品与其他园艺/农用产品；本轮检索的官方来源未显示其对外销售肥料包衣树脂、聚氨酯包衣原料或同类包衣剂。' },
    contact: { label: 'Harrell’s current corporate contact telephone', phone: '+1 863-687-2774', contactUrl: 'https://harrells.com/contact/' },
    source: { label: 'Harrell’s POLYON Sylacauga fertilizer-coating facility', url: 'https://harrells.com/blog/slow-release-fertilizer-versus-controlled-release-fertilizer/' }, checkedAt: '2026-09-27',
  },
  {
    id: 'fortgreen-varginha', productId: 'fertilizer-coating', company: 'Fortgreen Comercial Agrícola', country: 'Brazil', countryZh: '巴西', city: 'Varginha, Minas Gerais', latitude: -21.5515, longitude: -45.4303,
    legacyCompanyDescription: '控释肥生产商', fit: '优先核验',
    signal: '母公司 Origin Enterprises 年报明确记载 Fortgreen 在巴西 Varginha 建有生产树脂包覆控释肥的产线；Fortgreen 当前官网仍列出 Varginha 工厂。该公司是下游控释肥制造商，有核验包衣原料采购与工艺适配的业务逻辑；公开资料未证明其采购我方原料，且年报所述热塑性树脂体系不能直接等同于我方产品化学体系。',
    supplierCompetitorCheck: { checkedAt: '2026-09-27', conclusion: '已复核 Fortgreen 官方产品、公司与联系页面及母公司年报：其公开业务是肥料及农用成品制造；本轮所查官方资料未显示对外销售肥料包衣树脂、聚氨酯包衣原料或同类包衣剂。' },
    contact: { label: 'Fortgreen public company contact', email: 'sac@fortgreen.com.br', phone: '+55 44 3127-2700', contactUrl: 'https://fortgreen.com.br/contato' },
    source: { label: 'Origin Enterprises annual report: Fortgreen Varginha resin-covered controlled-release fertilizer production line', url: 'https://wp-origin-resources-2024.s3.eu-west-2.amazonaws.com/media/2024/09/Origin_2021_Annual_Report.pdf' }, checkedAt: '2026-09-27',
  },
  {
    id: 'grupo-equilibrio-catalao', productId: 'fertilizer-coating', company: 'Grupo Equilíbrio', country: 'Brazil', countryZh: '巴西', city: 'Catalão, Goiás', latitude: -18.1661, longitude: -47.9460,
    legacyCompanyDescription: '包覆控释肥生产商', fit: '可开发候选',
    signal: '官网说明 Grupo Equilíbrio 在 Catalão 等地拥有肥料工厂与生产能力，其 eQcoat 成品肥料线对氮、磷、钾肥颗粒实施包覆以调节养分释放。该公司是下游包覆肥制造商，具备核验包衣原料采购与配方负责人的业务逻辑；官网未说明现有包衣化学体系，也未证明其采购我方原料。',
    supplierCompetitorCheck: { checkedAt: '2026-09-27', conclusion: '已复核官网公司、eQcoat 产品及联系资料：其另销售尿素、MAP、KCl 等普通肥料原料，但本轮所查官方资料未显示其对外销售肥料包衣树脂、聚氨酯包衣原料或同类包衣剂；因此不属于我方包衣原料的同业供给侧。' },
    contact: { label: 'Grupo Equilíbrio public commercial contact', email: 'comercial@equilibriofertilizantes.com.br', contactUrl: 'https://grupoequilibrio.agr.br/solucoes/linha/eqcoat/' },
    source: { label: 'Grupo Equilíbrio eQcoat coated fertilizer product line', url: 'https://grupoequilibrio.agr.br/solucoes/linha/eqcoat/' }, checkedAt: '2026-09-27',
  },
  {
    id: 'adubos-paranaiba-uberlandia', productId: 'fertilizer-coating', company: 'Adubos Paranaíba', country: 'Brazil', countryZh: '巴西', city: 'Uberlândia, Minas Gerais', latitude: -18.9113, longitude: -48.2622,
    legacyCompanyDescription: 'SUPERCOAT 聚合物包覆肥生产商', fit: '可开发候选',
    signal: '官网称其配方工艺用于生产肥料，并展示 Ureia、MAP、NPK SUPERCOAT 聚合物包覆控释肥；巴西政府企业记录将其登记为肥料制造企业。该企业有下游包覆肥生产角色，具备包衣原料采购与生产工艺核验价值；公开资料未证明其采购我方包衣原料或采用相同化学体系。',
    supplierCompetitorCheck: { checkedAt: '2026-09-27', conclusion: '已复核官网产品和公司资料：公开销售的是肥料成品；本轮所查官方资料未显示其对外销售肥料包衣树脂、聚氨酯包衣原料或同类包衣剂。' },
    contact: { label: 'Adubos Paranaíba public company telephone', phone: '+55 34 3233-9600', contactUrl: 'https://www.adubosparanaiba.com.br/' },
    source: { label: 'Adubos Paranaíba SUPERCOAT fertilizer product and formulation page', url: 'https://www.adubosparanaiba.com.br/' }, checkedAt: '2026-09-27',
  },
  {
    id: 'indigrow-brimpton', productId: 'fertilizer-coating', company: 'Indigrow Ltd', country: 'United Kingdom', countryZh: '英国', city: 'Brimpton, Berkshire', latitude: 51.3901, longitude: -1.1872,
    legacyCompanyDescription: '树脂包膜尿素控释肥生产商', fit: '优先核验',
    signal: 'Indigrow 官网宣布其在英国制造 Impact CGF 树脂包膜尿素（RCU）颗粒肥，并列出 20% 至 91% RCU 的控释肥成品。该企业属于下游包膜肥制造环节，具备核验包衣原料、生产工艺和采购负责人的业务逻辑；公开资料未证明其采购我方原料、采用相同包衣化学体系或存在明确采购需求。',
    supplierCompetitorCheck: { checkedAt: '2026-09-28', conclusion: '已复核官网 RCU 产品、制造说明及联系资料：其公开销售的是草坪用控释肥成品；本轮官方资料未显示其对外销售肥料包衣树脂、聚氨酯包衣原料或同类包衣剂。' },
    contact: { label: 'Indigrow public technical and general business contact', email: 'growth@indigrow.com', phone: '+44 (0) 1189 710 995', contactUrl: 'https://www.indigrow.com/contact/' },
    source: { label: 'Indigrow announcement: UK manufacture of Impact CGF resin-coated urea fertilizers', url: 'https://www.indigrow.com/new-impact-cgf-resin-coated-urea-fertilisers/' }, checkedAt: '2026-09-28',
  },
  {
    id: 'lebanon-seaboard-lebanon', productId: 'fertilizer-coating', company: 'Lebanon Seaboard Corporation', country: 'United States', countryZh: '美国', city: 'Lebanon, Pennsylvania', latitude: 40.3409, longitude: -76.4113,
    legacyCompanyDescription: '控释肥生产商', fit: '优先核验',
    signal: 'Lebanon Seaboard 官网将自身描述为肥力产品制造商，专业产品部门说明其生产先进控释肥；LebanonTurf 产品页还公开其 PCU（polymer coated urea）控释肥组成。该企业处于下游控释肥制造环节，具备核验包衣原料采购、技术与生产负责人的业务逻辑；公开资料未证明其采购我方原料、采用相同包衣化学体系或存在明确采购需求。',
    supplierCompetitorCheck: { checkedAt: '2026-09-28', conclusion: '已复核官网公司、控释肥产品、部门联系资料：其公开销售的是草坪和园艺肥料成品；本轮官方资料未显示其对外销售肥料包衣树脂、聚氨酯包衣原料或同类包衣剂。' },
    contact: { label: 'Lebanon Seaboard public Purchasing and Operations contacts', phone: '+1 800-532-0090', contactUrl: 'https://www.lebsea.com/contact-us/' },
    source: { label: 'Lebanon Seaboard professional division: producer of advanced controlled-release fertilizers', url: 'https://www.lebsea.com/professional/professional-division-overview/' }, checkedAt: '2026-09-28',
  },
  {
    id: 'follmann-minden', productId: 'nl-w1201', company: 'Follmann GmbH & Co. KG', country: 'Germany', countryZh: '德国', city: 'Minden, North Rhine-Westphalia', latitude: 52.2895, longitude: 8.9146,
    legacyCompanyDescription: '水性油墨 / 涂层配方生产商', fit: '可开发候选',
    signal: 'Follmann 官网说明其开发并生产水性印刷油墨和涂层；其水性涂层页面列出 PP、PE、PET 等薄膜基材，且独立水性油墨页面说明其水性油墨体系用于薄膜。既有市场扩展来源已支持 PP/PE 水性油墨附着力底涂这一应用，因此该企业属于可核验配方、技术和采购负责人的下游水性油墨制造场景；公开资料未证明其采购或使用 NL-W1201。',
    supplierCompetitorCheck: { checkedAt: '2026-09-28', conclusion: '已复核官网产品、技术及联系资料：其公开销售的是水性油墨、涂层和胶黏剂配方成品；本轮官方资料未显示其对外销售水性聚烯烃乳液、CPO/PO 分散体、附着力促进原料或与 NL-W1201 相同的原料。' },
    contact: { label: 'Follmann public printing-inks business email', email: 'printinginks@follmann.com', phone: '+49 571 9339-0', contactUrl: 'https://www.follmann.com/en/contact' },
    source: { label: 'Follmann water-based coatings for PP, PE and PET films', url: 'https://www.follmann.com/en/water-based-coatings' }, checkedAt: '2026-09-28',
  },
  {
    id: 'mapei-india-bengaluru', productId: 'elo', company: 'Mapei Construction Products India Pvt. Ltd.', country: 'India', countryZh: '印度', city: 'Bengaluru, Karnataka', latitude: 12.9675, longitude: 77.5764,
    legacyCompanyDescription: '胶黏剂与密封剂生产商', fit: '优先核验',
    signal: 'Mapei 印度官网将其列为胶黏剂、密封剂和建筑化学品制造商，并公开 Bangalore 工厂与采购、运营、产品管理负责人。胶黏剂和密封剂为 ELO TDS 已验证应用，因此该企业属于可核验 ELO 在下游配方中适配性的需求侧候选；公开资料未证明其采购、使用 ELO 或存在明确采购需求。',
    supplierCompetitorCheck: { checkedAt: '2026-09-28', conclusion: '已复核 Mapei 印度官方公司、工厂和联系资料：其公开销售的是胶黏剂、密封剂及建筑化学品成品；本轮官方资料未显示其生产或销售 ELO、ESBO、环氧化植物油或同类增塑剂原料。' },
    contact: { label: 'Mapei India public Procurement, Operations and Product Management contacts', phone: '+91 80 2222 1810', contactUrl: 'https://www.mapei.com/in/en/contact-us' },
    source: { label: 'Mapei India official contact page: adhesives, sealants, Bangalore factory and functional leads', url: 'https://www.mapei.com/in/en/contact-us' }, checkedAt: '2026-09-28',
  },
  {
    id: 'plantacote-herentals', productId: 'fertilizer-coating', company: 'Plantacote N.V.', country: 'Belgium', countryZh: '比利时', city: 'Herentals, Antwerp', latitude: 51.1763, longitude: 4.8356,
    legacyCompanyDescription: '全包膜 NPK 与控释肥生产商', fit: '优先核验',
    signal: 'Plantacote 官方产品册将 Plantacote Pluss、Ultra、Straights 和 Specials 列为 100% coated NPK 或 100% coated fertilizer，并公开比利时公司地址；独立的 RHP 认证资料进一步将 Plantacote N.V. 描述为控释肥生产企业。该公司处于下游包膜控释肥制造环节，具备核验包衣原料、生产工艺和采购负责人的业务逻辑；公开资料未证明其采购我方包衣原料、采用相同包衣化学体系或存在明确采购需求。',
    supplierCompetitorCheck: { checkedAt: '2026-09-28', conclusion: '已复核 Plantacote 官方产品册及 RHP 企业认证资料：其公开销售的是包膜控释肥成品；本轮所查资料未显示其对外销售肥料包衣树脂、聚氨酯包衣原料或同类包衣剂。' },
    contact: { label: 'Plantacote public company contact', email: 'info@plantacote.com', phone: '+32 (0)14 39 30 98', contactUrl: 'https://www.plantacote.com/' },
    source: { label: 'Plantacote official brochure: 100% coated NPK and controlled-release fertilizer products', url: 'https://uploads-ssl.webflow.com/59e265717032510001bb81cc/649cae409f1c19656549325f_Plantacote_Brochure_EN_2023.pdf' }, checkedAt: '2026-09-28',
  },
  {
    id: 'siegwerk-siegburg', productId: 'nl-w1201', company: 'Siegwerk Druckfarben AG & Co. KGaA', country: 'Germany', countryZh: '德国', city: 'Siegburg, North Rhine-Westphalia', latitude: 50.8002, longitude: 7.2075,
    legacyCompanyDescription: '非吸收性薄膜用水性油墨与涂层生产商', fit: '优先核验',
    signal: 'Siegwerk 官方白皮书说明其水性喷墨油墨可用于 PA、PET、PE、PP、BOPP、PVC 等非吸收性基材；官网亦公开面向 PE、OPP、PET 和铝箔的水性罩光涂层。既有市场扩展来源已支持 PP/PE 水性油墨附着力底涂这一应用，因此该企业属于可核验配方、技术和采购负责人的下游水性油墨/涂层制造场景；公开资料未证明其采购或使用 NL-W1201。',
    supplierCompetitorCheck: { checkedAt: '2026-09-28', conclusion: '已复核 Siegwerk 官方油墨、涂层、技术白皮书及联系资料：其公开销售的是印刷油墨和功能涂层配方成品；本轮官方资料未显示其对外销售水性聚烯烃乳液、CPO/PO 分散体、附着力促进原料或与 NL-W1201 相同的原料。' },
    contact: { label: 'Siegwerk public general company contact', email: 'info@siegwerk.com', phone: '+49 2241 304-0', contactUrl: 'https://www.siegwerk.com/en/contact.html' },
    source: { label: 'Siegwerk official white paper: water-based inkjet inks for PA, PET, PE, PP, BOPP and PVC', url: 'https://www.siegwerk.com/fileadmin/Data/Documents/Publications/Whitepaper/SW_WhitePaperINKJet_210x297mm_RZ_digital.pdf' }, checkedAt: '2026-09-28',
  },
  {
    id: 'jowat-detmold', productId: 'elo', company: 'Jowat SE', country: 'Germany', countryZh: '德国', city: 'Detmold, North Rhine-Westphalia', latitude: 51.9363, longitude: 8.8792,
    legacyCompanyDescription: '工业胶黏剂生产商', fit: '可开发候选',
    signal: 'Jowat 官网将公司定位为工业胶黏剂制造商，并公开年产约 100,000 吨胶黏剂；其反应型胶黏剂产品线包括 SMP、PUR、SE 与环氧树脂体系。胶黏剂为 ELO TDS 已验证应用，因此该企业属于可核验 ELO 在下游胶黏剂配方中适配性的需求侧候选；公开资料未证明其采购、使用 ELO 或存在明确采购需求。',
    supplierCompetitorCheck: { checkedAt: '2026-09-28', conclusion: '已复核 Jowat 官方公司、胶黏剂产品和联系资料：其公开销售的是工业胶黏剂配方成品；本轮官方资料未显示其生产或销售 ELO、ESBO、环氧化植物油或同类增塑剂原料。' },
    contact: { label: 'Jowat public general company contact', email: 'info@jowat.de', phone: '+49 5231 749-0', contactUrl: 'https://www.jowat.com/en/' },
    source: { label: 'Jowat official company site: industrial adhesive manufacturer and production scale', url: 'https://www.jowat.com/en/' }, checkedAt: '2026-09-28',
  },
  {
    id: 'knox-fertilizer-knox', productId: 'fertilizer-coating', company: 'Knox Fertilizer Company, Inc.', country: 'United States', countryZh: '美国', city: 'Knox, Indiana', latitude: 41.2959, longitude: -86.6250,
    legacyCompanyDescription: 'SurfCote 聚合物包膜控释肥生产商', fit: '优先核验',
    signal: 'Knox Fertilizer 官网说明其在印第安纳州生产特种植物营养产品；官方目录将 SurfCote 描述为采用专有聚合物树脂封装的控释肥技术，并展示尿素颗粒的 polymer coating 与 wax coating。目录还明确公司采购原料并在自有设施制造产品。该企业处于下游包膜肥制造环节，具备核验包衣原料、生产工艺和采购负责人的业务逻辑；公开资料未证明其采购我方包衣原料、采用相同化学体系或存在明确采购需求。',
    supplierCompetitorCheck: { checkedAt: '2026-09-28', conclusion: '已复核 Knox 官方公司、制造、SurfCote 产品及联系资料：其公开销售的是专业草坪和园艺肥料成品；本轮官方资料未显示其对外销售肥料包衣树脂、聚氨酯包衣原料或同类包衣剂。' },
    contact: { label: 'Knox Fertilizer public general business contact', email: 'info@knoxfert.com', phone: '+1 574-772-6275', contactUrl: 'https://www.knoxfert.com/contact-us/' },
    source: { label: 'Knox Fertilizer official catalog: proprietary polymer-resin-encapsulated SurfCote fertilizer', url: 'https://www.knoxfert.com/wp-content/uploads/2019/11/GroFine-Catalog-2019RevisePages.pdf' }, checkedAt: '2026-09-28',
  },
  {
    id: 'andersons-maumee', productId: 'fertilizer-coating', company: 'The Andersons, Inc. (Professional Turf & Ornamental)', country: 'United States', countryZh: '美国', city: 'Maumee, Ohio', latitude: 41.5628, longitude: -83.6538,
    legacyCompanyDescription: '聚合物包膜腐植酸包膜尿素生产商', fit: '优先核验',
    signal: 'The Andersons 官方产品资料将 PCHCU 列为带腐植酸包层和聚合物包层的尿素，并在当前产品标签中将含 PCHCU 的 CarbonCoat 缓释肥标为由 The Andersons 制造；官方专业产品目录还说明公司拥有专用草坪肥料工厂和持续的制造、研发投入。该企业具备直接核验聚合物包衣原料、配方和生产负责人的业务逻辑；公开资料未证明其采购我方包衣原料或存在明确采购需求。',
    supplierCompetitorCheck: { checkedAt: '2026-09-28', conclusion: '已复核 The Andersons 官方专业草坪产品、PCHCU/CarbonCoat 技术、制造历史与联系资料：其公开销售的是肥料和植物营养成品；本轮官方资料未显示其对外销售肥料包衣树脂、聚氨酯包衣原料或同类包衣剂。' },
    contact: { label: 'The Andersons Professional Turf customer service', email: 'lawnlogistics@andersonsinc.com', phone: '+1 800-253-5296', contactUrl: 'https://andersonspro.com/get-started' },
    source: { label: 'The Andersons official CarbonCoat product label: polymer-coated humic-coated urea fertilizer manufactured by The Andersons', url: 'https://assets.theandersons.com/m/20f80e4eb69d7058/original/10008031.pdf' }, checkedAt: '2026-09-28',
  },
  {
    id: 'doneck-euroflex-grevenmacher', productId: 'nl-w1201', company: 'Doneck Euroflex S.A.', country: 'Luxembourg', countryZh: '卢森堡', city: 'Grevenmacher', latitude: 49.6747, longitude: 6.4419,
    legacyCompanyDescription: 'PE/PP 薄膜用水性柔版与凹印油墨生产商', fit: '优先核验',
    signal: 'Doneck Euroflex 官网将 Euro-Film WFK/WFF 列为薄膜包装用水性柔版/凹印油墨，并明确其在 PE/PP 上具有附着与耐性表现；研发页面说明公司在自有实验室进行配方开发和原料筛选。既有市场扩展来源已支持 PP/PE 水性油墨附着力底涂应用，因此该企业属于可核验配方、技术与采购负责人的下游水性油墨制造场景；公开资料未证明其采购或使用 NL-W1201。',
    supplierCompetitorCheck: { checkedAt: '2026-09-28', conclusion: '已复核 Doneck 官方水性油墨、研发、公司网络及联系资料：其公开销售的是柔版和凹印油墨配方成品；本轮官方资料未显示其对外销售水性聚烯烃乳液、CPO/PO 分散体、附着力促进原料或与 NL-W1201 相同的原料。' },
    contact: { label: 'Doneck Euroflex public general company contact', email: 'euroflex@doneck.com', phone: '+352 710 810 1', contactUrl: 'https://www.doneck.com/contact' },
    source: { label: 'Doneck Euroflex official Euro-Film water-based inks with adhesion on PE/PP', url: 'https://www.doneck.com/products/water-based-inks/euro-film-wfk/wff' }, checkedAt: '2026-09-28',
  },
  {
    id: 'wikoff-fort-mill', productId: 'nl-w1201', company: 'Wikoff Color Corporation', country: 'United States', countryZh: '美国', city: 'Fort Mill, South Carolina', latitude: 35.0074, longitude: -80.9451,
    legacyCompanyDescription: '聚烯烃薄膜用水性油墨与涂层生产商', fit: '优先核验',
    signal: 'Wikoff 官方产品库公开 AlphaPlast、AquaSal 和 PolyLam 等水性油墨，其中基材明确包含 treated HDPE、LDPE、polypropylene、BOPP 与 PET；官网同时确认其为油墨、涂层和色彩技术制造商。既有市场扩展来源已支持 PP/PE 水性油墨附着力底涂应用，因此该企业属于可核验配方、R&D 与生产负责人的下游水性油墨制造场景；公开资料未证明其采购或使用 NL-W1201。',
    supplierCompetitorCheck: { checkedAt: '2026-09-28', conclusion: '已复核 Wikoff 官方产品库、公司、技术服务、领导团队及联系资料：其公开销售的是印刷油墨和涂层配方成品；本轮官方资料未显示其对外销售水性聚烯烃乳液、CPO/PO 分散体、附着力促进原料或与 NL-W1201 相同的原料。' },
    contact: { label: 'Wikoff public general company contact', email: 'contact@wikoff.com', phone: '+1 803-548-2210', contactUrl: 'https://wikoff.com/contact-us/' },
    source: { label: 'Wikoff official product library: water-based inks for HDPE, LDPE, polypropylene, BOPP and PET', url: 'https://wikoff.com/products/' }, checkedAt: '2026-09-28',
  },
  {
    id: 'aurora-material-streetsboro', productId: 'elo', company: 'Aurora Material Solutions LLC', country: 'United States', countryZh: '美国', city: 'Streetsboro, Ohio', latitude: 41.2392, longitude: -81.3459,
    legacyCompanyDescription: '柔性 PVC 配方与配混生产商', fit: '优先核验',
    signal: 'Aurora Material Solutions 官网明确其开发并制造柔性 PVC 配混料，并说明技术团队会针对目标性能优化 plasticizer systems、stabilizer packages 和 additive levels；其柔性 PVC 页面还列出 35A–95A 的塑化配方范围。PVC 中使用 ELO 作为二级增塑剂已有独立市场扩展来源，因此该企业属于可核验塑化剂适配性、技术与采购负责人的下游配混场景；公开资料未证明其采购、使用 ELO 或存在明确采购需求。',
    supplierCompetitorCheck: { checkedAt: '2026-09-28', conclusion: '已复核 Aurora 官方 PVC 配混料、柔性材料、公司与联系资料：其公开业务为定制热塑性配混料，另有阻燃浓缩料，但本轮官方资料未显示其生产或销售 ELO、ESBO、环氧化植物油、生物基增塑剂或其他同类 ELO 原料。' },
    contact: { label: 'Aurora Material Solutions public technical-center contact', phone: '+1 330-422-0700', contactUrl: 'https://www.auroramaterialsolutions.com/contact-aurora-material-solutions/' },
    source: { label: 'Aurora official PVC compounds page: flexible PVC formulation and plasticizer-system optimization', url: 'https://www.auroramaterialsolutions.com/pvc-polyvinyl-chloride-compounds/' }, checkedAt: '2026-09-28',
  },
  {
    id: 'sun-agro-tokyo', productId: 'fertilizer-coating', company: 'Sun Agro Co., Ltd.', country: 'Japan', countryZh: '日本', city: 'Tokyo', latitude: 35.6846, longitude: 139.7808,
    legacyCompanyDescription: '硫黄包衣尿素与包衣复合肥生产商', fit: '优先核验',
    signal: 'Sun Agro 官网明确列出硫黄被覆尿素（SCU）与硫黄被覆化成（SC 化成），说明以硫黄和可生物降解蜡双层包覆尿素或水溶性肥料并实现缓慢释放；官网同时公开商品开发室、制造本部和原料战略负责人。该企业处于下游缓释包衣肥制造环节，具备核验包衣原料、配方、生产与采购负责人的业务逻辑；公开资料未证明其采购我方包衣原料、采用相同化学体系或存在明确采购需求。',
    supplierCompetitorCheck: { checkedAt: '2026-09-28', conclusion: '已复核 Sun Agro 官方肥料产品、公司、机构与联系资料：其公开销售的是硫黄包衣肥和其他肥料成品；本轮官方资料未显示其对外销售肥料包衣树脂、聚氨酯包衣原料或同类包衣剂。' },
    contact: { label: 'Sun Agro public fertilizer enquiry email', email: 'info@sunagro.co.jp', phone: '+81 3-6311-4314', contactUrl: 'https://www.sunagro.co.jp/contact/' },
    source: { label: 'Sun Agro official sulfur-coated fertilizer page: SCU and sulfur-coated compound fertilizers', url: 'https://www.sunagro.co.jp/pickup/fertilizer/' }, checkedAt: '2026-09-28',
  },
  {
    id: 'katakura-coop-akita', productId: 'fertilizer-coating', company: 'Katakura & Co-op Agri Corporation', country: 'Japan', countryZh: '日本', city: 'Akita', latitude: 39.7102, longitude: 140.1026,
    legacyCompanyDescription: '包衣尿素复合肥与包衣肥设备运营商', fit: '优先核验',
    signal: 'Katakura & Co-op Agri 官网将公司定位为日本主要肥料制造商，公开销售配入包衣尿素的肥效调节型复合肥；官方沿革明确记载 1993 年在秋田工厂新设包衣肥设备，当前据点页仍将秋田工厂列为肥料制造基地。该企业具备直接核验包衣原料、设备工艺、生技与工厂负责人的业务逻辑；公开资料未证明其采购我方包衣原料、采用相同化学体系或存在明确采购需求。',
    supplierCompetitorCheck: { checkedAt: '2026-09-28', conclusion: '已复核 Katakura & Co-op Agri 官方肥料业务、沿革、现役工厂、组织与联系资料：其公开销售的是肥料及农业资材成品；本轮官方资料未显示其对外销售肥料包衣树脂、聚氨酯包衣原料或同类包衣剂。' },
    contact: { label: 'Katakura Akita fertilizer plant public contact', phone: '+81 18-864-6001', contactUrl: 'https://www.katakuraco-op.com/contact/' },
    source: { label: 'Katakura official history: coating-fertilizer equipment installed at Akita plant', url: 'https://www.katakuraco-op.com/profile/history_coop.html' }, checkedAt: '2026-09-28',
  },
  {
    id: 'gefink-burzaco', productId: 'nl-w1201', company: 'General Ink Factory S.A. (Gefink)', country: 'Argentina', countryZh: '阿根廷', city: 'Burzaco, Buenos Aires', latitude: -34.8404, longitude: -58.3993,
    legacyCompanyDescription: 'PE/PP 薄膜用水性柔版油墨生产商', fit: '优先核验',
    signal: 'Gefink 官网将 GEF.WATER 列为专为聚乙烯薄膜和聚丙烯柔版印刷开发、用于替代溶剂型油墨的水性油墨，并公开其工厂地址与公司邮箱。既有市场扩展来源已支持 PP/PE 水性油墨附着力底涂应用，因此该企业属于可核验配方、技术和采购负责人的下游水性油墨制造场景；公开资料未证明其采购或使用 NL-W1201。',
    supplierCompetitorCheck: { checkedAt: '2026-09-28', conclusion: '已复核 Gefink 官方产品、公司、质量和联系资料：其公开销售的是水性与溶剂型印刷油墨配方成品；本轮官方资料未显示其对外销售水性聚烯烃乳液、CPO/PO 分散体、附着力促进原料或与 NL-W1201 相同的原料。' },
    contact: { label: 'Gefink public general company contact', email: 'info@gefink.com.ar', phone: '+54 11 4238-6879', contactUrl: 'https://www.gefink.com.ar/en/contact/' },
    source: { label: 'Gefink official products: GEF.WATER water-based inks for PE film and PP flexography', url: 'https://gefink.com.ar/en/products/' }, checkedAt: '2026-09-28',
  },
  {
    id: 'colorprint-coseano', productId: 'nl-w1201', company: 'Colorprint S.p.A.', country: 'Italy', countryZh: '意大利', city: 'Coseano, Udine', latitude: 46.0966, longitude: 13.0208,
    legacyCompanyDescription: 'PE 薄膜用水性柔版油墨生产商', fit: '优先核验',
    signal: 'Colorprint 官网列出 Idropol Flexo acqua 聚乙烯印刷用水性油墨，并说明公司自 1981 年生产专业印刷油墨和涂层、提供定制油墨及自有制造能力。既有市场扩展来源已支持 PP/PE 水性油墨附着力底涂应用，因此该企业属于可核验配方、R&D 和采购负责人的下游水性油墨制造场景；公开资料未证明其采购或使用 NL-W1201。',
    supplierCompetitorCheck: { checkedAt: '2026-09-28', conclusion: '已复核 Colorprint 官方产品、公司、制造和联系资料：其公开销售的是印刷油墨、清漆和涂层配方成品；本轮官方资料未显示其对外销售水性聚烯烃乳液、CPO/PO 分散体、附着力促进原料或与 NL-W1201 相同的原料。' },
    contact: { label: 'Colorprint public general company contact', email: 'colorprint@colorprint.it', phone: '+39 0432 861112', contactUrl: 'https://www.colorprint.it/en/contacts' },
    source: { label: 'Colorprint official water-based flexo range: Idropol inks for polyethylene', url: 'https://www.colorprint.it/en/products/water-based-flexo' }, checkedAt: '2026-09-28',
  },
  {
    id: 'manner-polymers-mckinney', productId: 'elo', company: 'Manner Polymers', country: 'United States', countryZh: '美国', city: 'McKinney, Texas', latitude: 33.1972, longitude: -96.6381,
    legacyCompanyDescription: '柔性 PVC 定制配混料生产商', fit: '优先核验',
    signal: 'Manner Polymers 官网明确其开发并制造特种、通用及定制柔性 PVC 配混料，公开十条生产线、高强度混合与双螺杆/Buss 配混设备；研发岗位资料进一步确认其开展聚合物配方、原料测试和新产品试制。PVC 中使用 ELO 作为二级增塑剂已有独立市场扩展来源，因此该企业属于可核验塑化剂/稳定剂适配性、产品技术和采购负责人的下游配混场景；公开资料未证明其采购、使用 ELO 或存在明确采购需求。',
    supplierCompetitorCheck: { checkedAt: '2026-09-28', conclusion: '已复核 Manner Polymers 官方柔性 PVC、制造、研发岗位与联系资料：其公开业务为柔性 PVC 配混料成品，本轮官方资料未显示其生产或销售 ELO、ESBO、环氧化植物油、生物基增塑剂或其他同类 ELO 原料。' },
    contact: { label: 'Manner Polymers public technical-service contact', email: 'TechServ@mannerpolymers.com', phone: '+1 972-542-6789', contactUrl: 'https://mannerpolymers.com/contact/' },
    source: { label: 'Manner Polymers official flexible and custom PVC manufacturing capabilities', url: 'https://mannerpolymers.com/flexible-custom-pvc-compounds/' }, checkedAt: '2026-09-28',
  },
  {
    id: 'vernital-cercola', productId: 'elo', company: 'Vernital S.p.A.', country: 'Italy', countryZh: '意大利', city: 'Cercola, Naples', latitude: 40.8552, longitude: 14.3579,
    legacyCompanyDescription: '工业防腐涂料配方生产商', fit: '可开发候选',
    signal: 'Vernital 官网说明其在 Cercola 自有研发实验室与生产基地，并生产用于钢结构、储罐、化工设施和海洋环境的双组分环氧防腐涂料。ELO 在防腐涂层中的技术研究有独立论文来源，故可向其技术团队核实生物基 ELO 是否适配现有或新配方；公司官网并未证明其目前使用、采购 ELO，亦未证明我方产品已满足重防腐性能要求。',
    supplierCompetitorCheck: { checkedAt: '2026-09-29', conclusion: '已检查官网公司介绍、防腐涂料产品和联系页：公开生产与销售的是涂料成品，本轮官方来源未显示其对外销售 ELO、ESBO、环氧化植物油或同类功能原料。' },
    contact: { label: 'Vernital official general contact', email: 'info@vernital.it', phone: '+39 081 7331188', contactUrl: 'https://www.vernital.it/contatti/' },
    source: { label: 'Vernital Vernitex Bianco industrial and marine anticorrosion epoxy coating', url: 'https://www.vernital.it/i-nostri-prodotti/prodotti-anticorrosivi-per-lindustria/surface-tolerant/vernitex-bianco/' }, checkedAt: '2026-09-29',
  },
  {
    id: 'duramax-cascavel', productId: 'elo', company: 'Duramax Tintas Industriais', country: 'Brazil', countryZh: '巴西', city: 'Cascavel, Paraná', latitude: -24.9555, longitude: -53.4552,
    legacyCompanyDescription: '工业及重防腐涂料配方生产商', fit: '可开发候选',
    signal: 'Duramax 官网明确其自行研发、生产工业与防腐涂料；其双组分高固体分环氧聚胺涂料用于恶劣工业环境中的金属结构防腐。ELO 的防腐涂层方向有独立研究来源，因此属于可询问 ELO 类添加剂配方适配性的下游涂料厂；公开资料未证明其已使用或采购 ELO，也不能据此宣称我方 ELO 已达到其重防腐产品要求。',
    supplierCompetitorCheck: { checkedAt: '2026-09-29', conclusion: '已检查官网公司介绍、重防腐环氧产品及联系资料：公开销售的是下游工业涂料及表面处理成品，本轮官方来源未显示其生产或销售 ELO、ESBO、环氧化植物油或同类增塑/稳定原料。' },
    contact: { label: 'Duramax official commercial contact', email: 'comercial@duramaxtintas.ind.br', phone: '+55 45 99823-0474', contactUrl: 'https://duramaxtintas.ind.br/sobre/' },
    source: { label: 'Duramax Epóxi HS Poliamina Dupla Função anticorrosion coating', url: 'https://duramaxtintas.ind.br/produtos/dupla-funcao-maxdual/epoxi-hs-poliamina-dupla-funcao/' }, checkedAt: '2026-09-29',
  },
  {
    id: 'marincoat-calvignasco', productId: 'elo', company: 'MARINCOAT S.r.l.', country: 'Italy', countryZh: '意大利', city: 'Calvignasco, Milan', latitude: 45.3264, longitude: 9.0265,
    legacyCompanyDescription: '海上及陆上管线防护涂层配方生产商', fit: '可开发候选',
    signal: 'MARINCOAT 官网明确其自行配制、生产并施工用于管线、接头、管件、阀门和储罐的涂层。涂料属于 ELO TDS 已验证的大类应用，因此该企业是可核验 ELO 类功能添加剂配方适配性的下游制造商；公开资料未证明其采购或使用 ELO，也未证明我方 ELO 已适用于其防腐体系。',
    supplierCompetitorCheck: { checkedAt: '2026-09-29', conclusion: '已复核官网公开的涂层产品和业务资料：其公开销售的是管线及设备涂层解决方案与施工服务；本轮所查官方资料未显示其对外销售 ELO、ESBO、环氧化植物油或同类功能添加剂原料。' },
    contact: { label: 'MARINCOAT official general company contact', email: 'info@marincoat.it', phone: '+39 02 9051901', contactUrl: 'https://www.marincoat.com/' },
    source: { label: 'MARINCOAT official homepage: formulated and produced pipeline coatings', url: 'https://www.marincoat.com/' }, checkedAt: '2026-09-29',
  },
  {
    id: 'rynan-smart-fertilizers-long-duc', productId: 'fertilizer-coating', company: 'RYNAN Smart Fertilizers JSC', country: 'Vietnam', countryZh: '越南', city: 'Long Duc, Vinh Long', latitude: 9.97337, longitude: 106.34564,
    legacyCompanyDescription: '纳米聚合物包覆控释肥生产商', fit: '可开发候选',
    signal: 'RYNAN 官网公开其自产 RYNAN Smart Fertilizers，说明采用纳米聚合物包覆技术并展示制造工艺；越南通讯社独立报道其位于 Long Duc 工业园的包覆肥工厂。该企业是包膜控释肥的下游制造商，具备核验包衣原料技术适配性的理由；其自有专利工艺的具体化学体系及是否外购包衣原料均未获公开证实，也未证明其采购或使用我方产品。',
    supplierCompetitorCheck: { checkedAt: '2026-09-29', conclusion: '已复核 RYNAN Agriculture 的产品、制造、公司及联系页面和 RYNAN 越南官网公开产品目录：公开业务是成品智能肥料与农业技术；本轮所查官网未显示其对外销售包衣树脂、聚氨酯包衣原料或同类包衣剂。其自有包覆技术不等于已证实外购我方原料，需再做技术适配核验。' },
    contact: { label: 'RYNAN Smart Fertilizers official Vietnam company contact', email: 'hotrokhachhang@rynantech.com', phone: '+84 2943 746 991', contactUrl: 'https://rynan.vn/lien-he' },
    source: { label: 'RYNAN Agriculture official smart-fertilizer manufacturing and nano-polymer coating description', url: 'https://rynanagriculture.com/rynan-smart-fertilizers' }, checkedAt: '2026-09-29',
  },
  {
    id: 'pungnong-seoul', productId: 'fertilizer-coating', company: 'Pungnong Co., Ltd. (NPKO)', country: 'South Korea', countryZh: '韩国', city: 'Seoul', latitude: 37.5665, longitude: 126.9780,
    legacyCompanyDescription: '控释复合肥及全包衣肥生产商', fit: '可开发候选',
    signal: 'Pungnong 官网生产情况表明确第二工厂生产 controlled release compound fertilizer，并列示控释复合肥产能；官网研发沿革记录开发 all-coat controlled release fertilizer，产品新闻介绍 100% 包衣的 All-Coating Hanpolo。公司还公开了肥料原料进口情况。其生产下游控释/包衣肥，具备核验包衣原料技术适配性的业务逻辑；公开资料没有证明其采购我方原料、使用相同包衣化学体系或存在明确采购需求。',
    supplierCompetitorCheck: { checkedAt: '2026-09-29', conclusion: '已检查 Pungnong 官网业务、肥料产品、工厂生产表和原料进口资料：公开销售的是肥料成品，所查官方页面未显示其对外销售肥料包衣树脂、聚氨酯包衣原料或同类包衣剂。' },
    contact: { label: 'Pungnong official general business contact', email: 'pungnong@pungnong.co.kr', phone: '+82 2-712-8791', contactUrl: 'https://www.npko.co.kr/eng/' },
    source: { label: 'Pungnong official Production Fact Sheet: second factory controlled-release compound fertilizer', url: 'https://www.npko.co.kr/eng/s1/s1_1_5.php' }, checkedAt: '2026-09-29',
  },
  {
    id: 'ec-grow-eau-claire', productId: 'fertilizer-coating', company: 'EC Grow, Inc.', country: 'United States', countryZh: '美国', city: 'Eau Claire, Wisconsin', latitude: 44.8113, longitude: -91.4985,
    legacyCompanyDescription: '自建聚合物包膜设施的控释尿素生产商', fit: '优先核验',
    signal: 'EC Grow 官网新闻明确披露其在 Eau Claire 自建聚合物包膜设施，可生产不同粒径和释放曲线的控释尿素；当前官网继续销售 EPEC 聚合物包膜尿素。该企业是具备自有包膜产线的下游肥料制造商，适合核验包衣原料、释放曲线和配方适配性；公开资料未证明其采购、使用我方包衣剂或存在明确采购计划。',
    supplierCompetitorCheck: { checkedAt: '2026-09-29', conclusion: '已复核 EC Grow 公司、产品、包膜设施和联系页面：公开业务为肥料及融雪剂制造和销售，本轮所查资料未显示其对外销售肥料包衣树脂、聚氨酯包衣原料或同类包衣剂。' },
    contact: { label: 'EC Grow official corporate contact', phone: '+1 715-876-6422', contactUrl: 'https://ecgrow.com/index.php/contact-ec-grow/' },
    source: { label: 'EC Grow official polymer-coating facility announcement', url: 'https://ecgrowproturf.com/index.php/2021/01/22/ec-grow-inc-plans-to-offer-a-new-polymer-coated-urea-by-fall-2021/' }, checkedAt: '2026-09-29',
  },
  {
    id: 'sumika-agro-niihama', productId: 'fertilizer-coating', company: 'Sumika Agro Manufacturing Co., Ltd.', country: 'Japan', countryZh: '日本', city: 'Niihama, Ehime', latitude: 33.9603, longitude: 133.2834,
    legacyCompanyDescription: '包膜肥受托制造商及爱媛生产工厂', fit: '优先核验',
    signal: '住化アグロ製造官网说明其为农药制剂与肥料的受托制造企业；爱媛肥料工厂页面明确列出包膜肥生产，并展示包膜原料罐，产品页列出 80 日和 120 日型スミコート包膜肥。该企业属于直接使用包膜原料的下游制造场景，可核验原料适配性和受托制造供应链；公开资料未证明其采购或使用我方包衣剂。',
    supplierCompetitorCheck: { checkedAt: '2026-09-29', conclusion: '已复核住化アグロ製造的公司、工厂、产品和联系资料：官网定位为农药制剂及肥料受托制造，公开产品为包膜肥成品；本轮所查官方资料未显示其对外销售包衣树脂、聚氨酯包衣原料或同类包衣剂。' },
    contact: { label: 'Sumika Agro Manufacturing official enquiry and Ehime fertilizer plant contact', email: 'toiawase@sumika-agro.co.jp', phone: '+81 897-37-4012', contactUrl: 'https://www.sumika-agro.co.jp/contact.html' },
    source: { label: 'Sumika Agro Manufacturing official Ehime coated-fertilizer plant and coating-material tanks', url: 'https://www.sumika-agro.co.jp/brunch.html' }, checkedAt: '2026-09-29',
  },
  {
    id: 'nousbo-ulsan', productId: 'fertilizer-coating', company: 'Nousbo Co., Ltd.', country: 'South Korea', countryZh: '韩国', city: 'Ulsan', latitude: 35.4350, longitude: 129.3140,
    legacyCompanyDescription: '流化床聚合物包膜控释肥生产商', fit: '可开发候选',
    signal: 'NOUSBO 官网公开其 Ulsan 工厂两条控释肥专用生产线、流化床包膜工艺和聚合物包膜产品，并说明工厂覆盖原料、包膜厚度和释放曲线质量控制。该企业是明确的包膜控释肥下游制造商；但官网同时说明部分聚合物包膜材料为内部合成，因此仅作为可开发候选，公开资料未证明其外购我方包衣剂或存在替换需求。',
    supplierCompetitorCheck: { checkedAt: '2026-09-29', conclusion: '已复核 NOUSBO 官方技术、工厂、全球网络和联系资料：公司销售控释肥成品并提供 OEM，且内部合成部分包膜聚合物；未发现其将包衣树脂作为独立原料对外销售，但其自有材料能力会降低外购概率，开发前应先核验是否存在补充或替代原料需求。' },
    contact: { label: 'NOUSBO official company contact', email: 'nousbo@nousbo.com', phone: '+82 31-295-6178', contactUrl: 'https://global.nousbo.com/contact-us/' },
    source: { label: 'NOUSBO official CRF manufacturing technology and Ulsan production lines', url: 'https://global.nousbo.com/technology/crf-manufacturing/' }, checkedAt: '2026-09-29',
  },
  {
    id: 'dupan-anugerah-lestari-pungging', productId: 'fertilizer-coating', company: 'PT Dupan Anugerah Lestari', country: 'Indonesia', countryZh: '印度尼西亚', city: 'Pungging, Mojokerto, East Java', latitude: -7.5416, longitude: 112.5696,
    legacyCompanyDescription: '采用化学包覆工艺生产缓释 NPK 复合肥的制造商', fit: '优先核验',
    signal: 'PT Dupan Anugerah Lestari 官网确认其自行配制、生产 PUPINDO NPK 复合肥，并在包装前使用化学材料进行颗粒包覆，以调节溶解速度、生产 slow-release 肥料；官网另列出 Pungging 工厂。该公司处于包衣肥成品的下游制造环节，具备核验包衣原料技术适配性及采购/生产负责人的合理业务逻辑；公开资料未证明其使用聚氨酯体系、外购我方原料或存在采购计划。',
    supplierCompetitorCheck: { checkedAt: '2026-09-30', conclusion: '已复核官网产品、公司、生产工艺和联系页：公开销售的是 PUPINDO NPK 肥料成品；所查官方资料未显示其对外销售包衣树脂、聚氨酯包衣原料或同类肥料包衣剂。其具体包覆化学体系尚未公开。' },
    contact: { label: 'PT Dupan Anugerah Lestari official head-office and factory telephone', phone: '+62 31 82516888', contactUrl: 'https://pupindo.id/contact-us/' },
    source: { label: 'PUPINDO official product and coating-process description', url: 'https://pupindo.id/product/' }, checkedAt: '2026-09-30',
  },
  {
    id: 'hanampi-sejahtera-kahuripan-gresik', productId: 'fertilizer-coating', company: 'PT Hanampi Sejahtera Kahuripan', country: 'Indonesia', countryZh: '印度尼西亚', city: 'Gresik, East Java', latitude: -7.1550, longitude: 112.6560,
    legacyCompanyDescription: '硫磺与聚合物双层包膜尿素生产商', fit: '可开发候选',
    signal: 'Hanampi 官网确认其在 Gresik 自行生产 Haracoat 缓控释包膜尿素，且产品采用硫磺和聚合物双层包覆；Gresik 当地政府工厂目录也列出该厂的 Sulfur Coated Urea 生产。其生产下游包膜肥，具有评估包衣原料的合理业务逻辑；但公开资料未说明聚合物层的具体化学体系，也未证明其外购、使用或需要我方聚氨酯包衣原料。',
    supplierCompetitorCheck: { checkedAt: '2026-10-08', conclusion: '已核对官网公司介绍、首页及产品目录：公开销售的是 Haracoat 包膜尿素和 Buamax 复合肥成品；所查官网未显示其对外销售包衣树脂、聚氨酯包衣剂或同类原料。母公司集团有肥料经销业务，但本条主体自身有包膜尿素生产工厂，按下游制造商判断。' },
    contact: { label: 'PT Hanampi Sejahtera Kahuripan official company contact', email: 'bizteam@hanampi.com', phone: '+62 31 3930722', contactUrl: 'https://hanampi.com/contact' },
    source: { label: 'Hanampi official Haracoat sulfur-and-polymer coated urea and company manufacturing statement', url: 'https://hanampi.com/home' }, checkedAt: '2026-10-08',
  },
  {
    id: 'dgo-defix-phu-nghia', productId: 'elo', company: 'DGO Group (DEFIX)', country: 'Vietnam', countryZh: '越南', city: 'Phu Nghia, Hanoi', latitude: 20.9294, longitude: 105.6691,
    legacyCompanyDescription: '船舶及工业重防腐涂料配方生产商', fit: '可开发候选',
    signal: 'DEFIX 官网将 DGO Group 定位为拥有河内 Phu Nghia 工厂的涂料生产商，列出船舶用环氧防腐涂料、环氧底漆及其他重防腐产品；DGO 官网另公开其按配方采购和混合成膜材料、助剂等原料的生产流程。ELO 的涂料用途属于 TDS 已验证大类，防腐涂层另有独立研究来源，因此该公司是可询问 ELO 类原料配方评估的下游涂料制造商；公开资料并未证明其当前使用或采购 ELO，也不能宣称我方 ELO 已满足其海洋防腐性能要求。',
    supplierCompetitorCheck: { checkedAt: '2026-10-08', conclusion: '已检查 DEFIX 船舶涂料、DGO Group 公司介绍、生产流程与公开产品资料：公开销售的是涂料及防水材料成品；所查官网未显示其生产或销售 ELO、ESBO、环氧化植物油或同类功能原料。' },
    contact: { label: 'DEFIX official general contact', email: 'dgotmdt@gmail.com', phone: '+84 926 66 77 22', contactUrl: 'https://defix.vn/gioi-thieu/' },
    source: { label: 'DEFIX official marine anticorrosion coatings and manufacturing overview', url: 'https://defix.vn/' }, checkedAt: '2026-10-08',
  },
  {
    id: 'son-mien-bac-hung-yen', productId: 'elo', company: 'Son Mien Bac Co., Ltd.', country: 'Vietnam', countryZh: '越南', city: 'Viet Yen, Hung Yen', latitude: 20.8570, longitude: 106.0310,
    legacyCompanyDescription: '工业与钢结构防腐涂料制造商', fit: '可开发候选',
    signal: 'Sơn Miền Bắc 官网明确记载其在越南兴安省拥有涂料工厂，自行研发、生产用于钢结构防护及防腐蚀的工业涂料，并公开原料选择和采购环节。ELO 的涂料用途属于 TDS 已验证大类，防腐涂层有独立市场扩展来源；该公司是可询问 ELO 类原料技术评估的下游涂料制造商，但公开资料未证明其目前使用或采购 ELO，也未证明 ELO 适用于其具体配方。',
    supplierCompetitorCheck: { checkedAt: '2026-10-08', conclusion: '已检查公司官网工厂、产品与联系页：其公开产品为工业、钢结构保护及防腐涂料成品；所查官网未显示其对外销售 ELO、ESBO、环氧化植物油或同类原料。' },
    contact: { label: 'Sơn Miền Bắc official company contact', email: 'sonmienbac.vn@gmail.com', phone: '+84 221 358 9170', contactUrl: 'https://sonmienbac.com.vn/lien-he/' },
    source: { label: 'Sơn Miền Bắc official coating factory and anticorrosion product overview', url: 'https://sonmienbac.com.vn/xuong-san-xuat-son-mien-bac/' }, checkedAt: '2026-10-08',
  },
  {
    id: 'dolphin-inks-thane', productId: 'nl-w1201', company: 'Dolphin Inks', country: 'India', countryZh: '印度', city: 'Thane, Maharashtra', latitude: 19.1943, longitude: 72.9709,
    legacyCompanyDescription: 'PP/PE 薄膜水性油墨配方与制造商', fit: '可开发候选',
    signal: 'Dolphin Inks 官网明确表示自行配制、生产水性油墨，柔性包装产品页分别列出用于聚丙烯 PP 与聚乙烯 PE（LDPE、HDPE）基材的水性油墨。PP/PE 是 NL-W1201 TDS 已验证基材；水性薄膜油墨作为终端应用另有独立市场扩展来源，因此它具备评估附着力原料的下游配方逻辑。公开资料未证明其目前使用或采购 NL-W1201、水性聚烯烃乳液或相同化学体系。',
    supplierCompetitorCheck: { checkedAt: '2026-10-08', conclusion: '已检查官网公司介绍、产品目录及联系页：公司对外销售水性印刷油墨、成品水性涂层及印刷辅助品；所查资料未显示其生产或销售水性聚烯烃乳液、PP/PE 附着促进原料或同类 NL-W1201 原料。' },
    contact: { label: 'Dolphin Inks official business contact', email: 'info@dolphininks.com', phone: '+91 8828260191', contactUrl: 'https://dolphininks.com/contact-us/' },
    source: { label: 'Dolphin Inks official water-based ink product catalog for PP and PE substrates', url: 'https://dolphininks.com/product/' }, checkedAt: '2026-10-08',
  },
  {
    id: 'toa-paint-products-nilai', productId: 'elo', company: 'TOA Paint Products Sdn. Bhd.', country: 'Malaysia', countryZh: '马来西亚', city: 'Nilai, Negeri Sembilan', latitude: 2.8194, longitude: 101.7988,
    legacyCompanyDescription: '重防腐环氧涂料制造商', fit: '可开发候选',
    signal: 'TOA 马来西亚官网明确将 Heavyguard Epoguard Enamel 列为重防腐涂料产品；其产品资料说明该双组分环氧面漆用于钢结构、桥梁、船舶及化工厂防护。官网另列出 Nilai 工厂，集团资料确认该马来西亚公司制造涂料成品。ELO 的涂料应用属于 TDS 已验证大类，防腐涂层有独立市场扩展来源，因此具备询问 ELO 类原料配方评估的下游逻辑；公开资料不证明其目前采购或使用 ELO，也不证明我方 ELO 已适用于其具体环氧配方。',
    supplierCompetitorCheck: { checkedAt: '2026-10-08', conclusion: '已核对 TOA 马来西亚官网涂料、重防腐及建筑化学品产品目录与集团公司资料：所查资料显示其生产、销售涂料和其他下游成品，未发现其对外销售 ELO、ESBO、环氧化植物油或类似增塑/改性原料。集团资料中笼统的 chemicals 描述不能解释为其销售 ELO 类原料。' },
    contact: { label: 'TOA Paint Products official Malaysia general contact', email: 'toa@toagroup.com.my', phone: '+60 3 7725 2699', contactUrl: 'https://toagroup.com.my/contact-us/' },
    source: { label: 'TOA Malaysia Heavyguard Epoguard Enamel protective epoxy topcoat', url: 'https://toagroup.com.my/product/heavyguard-epoguard-enamel-part-a/' }, checkedAt: '2026-10-08',
  },
  {
    id: 'jotun-paints-malaysia-shah-alam', productId: 'elo', company: 'Jotun Paints (Malaysia) Sdn. Bhd.', country: 'Malaysia', countryZh: '马来西亚', city: 'Shah Alam, Selangor', latitude: 3.0738, longitude: 101.5183,
    legacyCompanyDescription: '重防腐涂料制造与配方企业', fit: '可开发候选',
    signal: 'Jotun 马来西亚官网列出 Jotamastic 87 防腐环氧底涂；集团官网确认 Shah Alam 工厂设有防护涂料研发中心，并明确把新产品开发、配方工作和替代原料测试列为其职责。ELO 的涂料应用属于 TDS 已验证大类，ELO 防腐涂层研究另有独立公开来源，因此该公司具备评估涂料配方原料的下游逻辑；公开资料未证明其采购或使用 ELO，也未证明我方 ELO 适用于 Jotamastic 87 的现有配方。',
    supplierCompetitorCheck: { checkedAt: '2026-10-09', conclusion: '已检查 Jotun 官网防腐涂料产品页、马来西亚研发与工厂介绍及供应商资料：对外产品为涂料成品，所查资料未显示该公司生产或销售 ELO、ESBO、环氧化植物油或同类原料；官网另明确设有原料采购和替代原料评估流程。' },
    contact: { label: 'Jotun Malaysia public supplier contact', phone: '+60 3 5123 5500', contactUrl: 'https://www.jotun.com/my-en/about-jotun/supplier-information/contact-us-suppliers' },
    source: { label: 'Jotun Malaysia Jotamastic 87 anticorrosive epoxy primer', url: 'https://www.jotun.com/my-en/products-and-services/products/Jotamastic-87' }, checkedAt: '2026-10-09',
  },
  {
    id: 'mc-ferticom-tokyo', productId: 'fertilizer-coating', company: 'MC Ferticom Co., Ltd.', country: 'Japan', countryZh: '日本', city: 'Tokyo', latitude: 35.6830, longitude: 139.7436,
    legacyCompanyDescription: '自有包膜肥工厂的控释肥制造商', fit: '可开发候选',
    signal: 'MC Ferticom 官网明确称其研发并制造包膜控释肥，产品目录列有包膜尿素肥；公司沿革记录包膜肥制造工厂于 1996 年建成、2003 年扩建。该企业具备自行生产下游包膜肥并评估包衣原料的业务逻辑；公开资料未证明其外购、使用或需要我方包衣材料，也未证明其包衣化学体系与我方产品相同。',
    supplierCompetitorCheck: { checkedAt: '2026-10-10', conclusion: '已复核公司官网包膜肥产品、业务介绍、原料销售及化成品销售页：其确有硫酸铵、过磷酸钙等肥料营养原料及精制硫酸销售业务，但所查资料未显示其对外销售肥料包衣树脂、聚氨酯包衣材料或同类包衣剂；本条仅按其自行制造包膜肥的下游角色收录，不能将其他肥料原料销售等同于外购包衣材料的证据。' },
    contact: { label: 'MC Ferticom official overseas enquiry', email: 'mcfcqa.overseas@mcferticom.jp', phone: '+81-3-3263-8530', contactUrl: 'https://www.mcferticom.jp/english/inquiry/' },
    source: { label: 'MC Ferticom official statement of coated controlled-release fertilizer manufacturing', url: 'https://www.mcferticom.jp/english/company/greeting.html' }, checkedAt: '2026-10-10',
  },
  {
    id: 'agroplanta-batatais', productId: 'fertilizer-coating', company: 'Agroplanta Fertilizantes e Inovações S.A.', country: 'Brazil', countryZh: '巴西', city: 'Batatais, São Paulo', latitude: -20.8911, longitude: -47.5851,
    legacyCompanyDescription: '聚合物包覆控释肥制造商', fit: '可开发候选',
    signal: 'Agroplanta 官网列出 Greencote 和 Maxcote 植物基可降解聚合物包覆控释肥，并说明 Batatais 第三工厂生产聚合物基增效肥料。该公司制造下游包覆肥成品，具备核验包衣原料配方与采购负责人的业务逻辑；其公开描述的是植物基聚合物体系，未证明使用、外购或需要我方聚氨酯包衣原料，也不能推定两种体系兼容。',
    supplierCompetitorCheck: { checkedAt: '2026-10-10', conclusion: '已复核 Agroplanta 官方公司、Greencote、Maxcote 与产品目录：所查资料显示其生产销售包覆控释肥成品、其他肥料及肥料营养配料；未发现其对外销售肥料包衣树脂、聚氨酯包衣原料或同类包衣剂。肥料营养配料销售不等于包衣原料同行。' },
    contact: { label: 'Agroplanta official commercial contact', email: 'comercial@agroplanta.com.br', phone: '+55 16 3660-6500', contactUrl: 'https://agroplanta.com.br/contato/' },
    source: { label: 'Agroplanta official Greencote polymer-coated controlled-release fertilizer', url: 'https://agroplanta.com.br/produtos/greencote/' }, checkedAt: '2026-10-10',
  },
  {
    id: 'moravia-istanbul', productId: 'elo', company: 'Moravia Boya ve Kimya San. Tic. Ltd. Şti.', country: 'Turkey', countryZh: '土耳其', city: 'Istanbul', latitude: 41.0092, longitude: 28.7867,
    legacyCompanyDescription: '船舶与工业重防腐涂料生产商', fit: '可开发候选',
    signal: 'Moravia 官网确认其在土耳其自有工厂生产船舶、游艇和工业涂料，官方 MORAZINC HI-BUILD 产品页列有用于海工、桥梁及石化设施的富锌重防腐环氧底漆。ELO 的涂料用途属于 TDS 已验证大类，防腐涂层应用另有独立学术研究，因此具备询问 ELO 配方评估的下游逻辑；公开资料未证明该公司正在采购、使用或需要 ELO，也未证明我方 ELO 适用于其现有配方。',
    supplierCompetitorCheck: { checkedAt: '2026-10-10', conclusion: '已重新检查 Moravia 官方公司介绍和船舶/工业涂料产品目录：所查资料展示的是涂料与相关稀释剂成品，未显示其对外销售 ELO、环氧化植物油或类似增塑添加剂原料。' },
    contact: { label: 'Moravia official general business contact', email: 'moravia@moravia.com.tr', phone: '+90 212 579 13 36', contactUrl: 'https://www.moravia.com.tr/en/kurumsal.html' },
    source: { label: 'Moravia official MORAZINC HI-BUILD anticorrosive epoxy primer', url: 'https://www.moravia.com.tr/urunler/gemi-boyalari/astar-boyalar/morazinc-hi-build.html' }, checkedAt: '2026-10-10',
  },
  {
    id: "greenfeed-agro-shah-alam",
    productId: "fertilizer-coating",
    company: "Greenfeed Agro Sdn Bhd",
    country: "Malaysia",
    countryZh: "马来西亚",
    city: "Shah Alam, Selangor",
    latitude: 3.0256,
    longitude: 101.558,
    legacyCompanyDescription: "控释肥生产商",
    fit: "可开发候选",
    signal: "官网控释肥 17:10:10 产品页明确描述生产中的包覆工序；制造页与联系页确认自有制造能力及 Shah Alam 工厂，因此具备包衣原料下游评估逻辑。旧缓释丸粒系列采用水溶性氮与沸石包覆，不能据此推断新控释系列采用聚氨酯；尚未证明其使用、外购或需要我方包衣原料，应先核对包覆体系与技术适配性。",
    supplierCompetitorCheck: {
      checkedAt: "2026-10-10",
      conclusion: "独立复核官方产品目录、控释肥产品、制造与技术页：公开业务为控释/缓释成品肥及制造服务，所查资料未显示对外销售包衣树脂、聚氨酯包衣原料或同类包衣剂。官网注册号 200201016183 / 583846-P；与现有公开客户按名称、官网及联系资料去重，无重复主体。"
    },
    contact: {
      label: "Greenfeed official head-office business phone and contact form",
      phone: "+60 3 2201 8135",
      contactUrl: "https://www.greenfeed.com.my/contact/"
    },
    source: {
      label: "Greenfeed official controlled-release fertilizer production and coating process",
      url: "https://www.greenfeed.com.my/product/greenfeed-controlled-release-fertilizer-1710102mgote/"
    },
    checkedAt: "2026-10-10"
  },
  {
    id: "saraswanti-anugerah-indonesia-mempawah",
    productId: "fertilizer-coating",
    company: "PT Saraswanti Anugerah Indonesia (Saraswanti Group)",
    country: "Indonesia",
    countryZh: "印尼",
    city: "Sungai Kunyit, Mempawah, West Kalimantan",
    latitude: 0.482,
    longitude: 108.9145,
    legacyCompanyDescription: "包膜复合肥生产商",
    fit: "可开发候选",
    signal: "官网产品页描述自产 NPK 颗粒在包装前实施化学包覆以调节溶解性和缓释；公司及联系页、集团工厂开业公告确认 Mempawah 制造实体，存在包衣原料下游评估逻辑。同属 Saraswanti Group，与已收录 PT Dupan Anugerah Lestari 为关联企业并共用总部电话；此条是不同制造实体/工厂，不代表新增独立集团客户，须避免重复开发。未确认聚氨酯体系、独立采购权或采购我方产品。",
    supplierCompetitorCheck: {
      checkedAt: "2026-10-10",
      conclusion: "独立复核公司、产品、工厂联系及集团资料：所查公开业务为 NPK 成品肥制造，产品页中的有机/无机包覆原料是其生产用料描述，未显示对外销售包衣树脂、PU 包衣原料或同类包衣剂。与 Dupan 公司名称、官网及工厂地点不同；明确保留同集团关系，不按独立新集团账户计数。"
    },
    contact: {
      label: "Saraswanti Group shared head-office business phone; request Mempawah plant referral",
      phone: "+62 31 82516888",
      contactUrl: "https://pupuksawit.id/contact-us/"
    },
    source: {
      label: "PT Saraswanti Anugerah Indonesia official NPK melting and coating manufacturing process",
      url: "https://pupuksawit.id/product/"
    },
    checkedAt: "2026-10-10"
  },
  {
    "id": "chobi-ulsan",
    "productId": "fertilizer-coating",
    "company": "Chobi Co., Ltd. (DongO Group)",
    "country": "South Korea",
    "countryZh": "韩国",
    "city": "Ulsan",
    "latitude": 35.5384,
    "longitude": 129.3114,
    "legacyCompanyDescription": "包膜尿素与控释肥生产商",
    "fit": "可开发候选",
    "signal": "J AGRI 2025 公司展会资料明确列出自产包膜尿素及线性/延迟释放系列，官网确认乌山肥料工厂和缓释肥研发生产；韩国肥料协会 2023 年资料进一步记载其包膜肥生产设施。作为成品控释肥制造商，具有包衣原料技术评估逻辑。属于 DongO Group（与 Kyung Nong 关联），按一个公司账户收录；未确认其采购我方产品、当前采购意向或与我方原料的适配性。公开工厂电话已核实，采购/技术邮箱待补，不计入可发开发信名单。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-10",
      "conclusion": "独立重读官网公司介绍、当前产品展示和官方展会资料：公开业务为成品肥、土壤改良与农业产品，所查资料未显示对外销售同类包衣树脂、PU 包衣原料或包衣剂。协会资料描述引入外部树脂用于包膜生产，支持下游角色；未将该历史资料视为当前采购意向。与最新 main 的公司名、域名及集团别名核对，无重复公开公司；未另收录 Kyung Nong/DongO 为新增客户。"
    },
    "contact": {
      "label": "KFIA published Ulsan factory business phone; procurement/technical email pending",
      "phone": "+82 52 270 7910",
      "contactUrl": "https://fert-kfia.or.kr/new/05_member/member01_view04.asp"
    },
    "source": {
      "label": "CHOBI official J AGRI 2025 coated-urea product and manufacturing brochure",
      "url": "https://pub-mediabox-storage.rxweb-prd.com/exhibitor/document/exh-6e034eed-44b2-41dd-9aaa-707d926e1e67/e3e0fe7f-7a79-4d7b-b205-cfcbd7342211.pdf"
    },
    "checkedAt": "2026-10-10"
  },
  {
    "id": "agrotiger-mabalacat",
    "company": "Agrotiger Philippines Corporation",
    "country": "Philippines",
    "countryZh": "菲律宾",
    "city": "Mabalacat City, Pampanga",
    "latitude": 15.225,
    "longitude": 120.572,
    "legacyCompanyDescription": "有机包覆尿素与复合肥制造商",
    "signal": "FPA 2026 年 8 月制造商名录列出其 Mabalacat 制造地点；2026 年 4 月产品登记列有本地包覆的 HYFER Complete 14-14-14 及 HYFER Urea Max，官网研发资料说明自主肥料配方与制造。官网将 HYFER 固体肥描述为有机包覆、持续释放产品。作为下游包覆肥制造商，可先讨论是否评估其他包覆体系；未确认其采用 PU/聚合物包膜、采购我方产品或存在当前采购计划，原料适配需另行评估。",
    "contact": {
      "label": "Official published business inbox; named person and procurement role not inferred",
      "email": "markp@agrotiger.com",
      "phone": "+63 2 7745 3096",
      "contactUrl": "https://agrotiger.com/coated-solid-fertilizers/"
    },
    "source": {
      "label": "FPA April 2026 registered locally coated HYFER products, PDF pages 7–8; corroborated by company product/R&D pages",
      "url": "https://fpa.da.gov.ph/wp-content/uploads/2026/04/FOR-POSTING-FERTILIZER_PRODUCT_LISTING-AS-OF-4.15.2026_Optimized.pdf"
    },
    "productId": "fertilizer-coating",
    "fit": "可开发候选",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-10",
      "conclusion": "独立重读官网包覆肥、研发及其他产品目录，并核对 FPA 原料与成品登记。该公司兼有进口、分销及一般肥料原料登记（包括 Humate Powder、Ozoneem）；没有把原料登记等同于对外销售同类包衣剂。所查官网产品为成品肥、叶面肥、土壤调理剂及生物刺激素，未发现其对外供应 PU 包衣树脂、同类包衣原料或成套包衣剂的公开证据。按成品包覆复合肥制造需求侧收录，不作为聚合物包膜客户。Agrotiger Phils. Corp. 与 Agrotiger Philippines Corporation 为同一账户；核对最新 main 与本地公司名、官网域名和地点，无重复。"
    },
    "checkedAt": "2026-10-10"
  },
  {
    "id": "rcf-mumbai",
    "company": "Rashtriya Chemicals and Fertilizers Limited (RCF)",
    "country": "India",
    "countryZh": "印度",
    "city": "Mumbai",
    "latitude": 19.076,
    "longitude": 72.8777,
    "legacyCompanyDescription": "硫包衣尿素生产商",
    "signal": "公司 2024–25 年报明确记载自产 Urea Gold 硫包衣尿素 0.26 lakh MT（26,000 吨），官网公司概况亦列出该产品，确认是实际包覆肥制造商。可就包覆原料技术评估入口进行开发，但其已证实路线为硫包衣，未确认 PU/聚合物体系、我方原料适配或当前采购需求。官网供应商说明公开 Thal 采购部门邮箱，页面制度起始于 2015 年；该入口用于公司采购转介，不认定为 Trombay 包衣线负责人，邮箱送达及具体技术职能待确认。Mumbai/Trombay 与 Thal 按同一公司账户收录。",
    "contact": {
      "label": "Official vendor information: Thal procurement inbox; company routing, not a verified Trombay coating-line contact",
      "email": "thalpurchase@rcfltd.com",
      "phone": "+91 22 2552 3000",
      "contactUrl": "https://www.rcfltd.com/tenderlist/details/9"
    },
    "source": {
      "label": "RCF official 2024–25 annual report: own Sulphur Coated Urea production, PDF page 6",
      "url": "https://rcfltd.com/public/storage/investers/1758606773.pdf"
    },
    "productId": "fertilizer-coating",
    "fit": "可开发候选",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-10",
      "conclusion": "独立重读公司概况、2024–25 年报及官网工业化学品业务公告。确认其为自产硫包衣尿素下游制造商；兼营甲醇、硝酸、甲胺及硫酸等一般工业化学品，所查业务未显示对外供应同类 PU 包衣树脂、包衣原料或包衣剂。没有因其一般化学品业务而把它当作同类原料买家，也未将自有硫包衣技术误标为聚合物包膜。以公司全名、RCF、rcfltd.com 及 Mumbai/Thal 地点核对最新 main 与本地名单，无重复；工厂不拆分计数。"
    },
    "checkedAt": "2026-10-10"
  },
  {
    "id": "namhae-chemical-yeosu",
    "company": "Namhae Chemical Corporation",
    "country": "South Korea",
    "countryZh": "韩国",
    "city": "Yeosu",
    "latitude": 34.7604,
    "longitude": 127.6622,
    "legacyCompanyDescription": "聚合物包覆复合肥制造商",
    "signal": "官网现有 오래가올원 30-8-8 明确为全颗粒包覆控释肥；公司《50年史》记载其负责肥料包覆工艺开发，并于2005年在Yeosu建成商业控释肥工厂，KCC负责包覆原料研发。可从下游包覆制造工艺切入原料技术评估，但既有路线为丙烯酸高分子，未确认PU适配、我方产品使用或当前采购计划。官网公开采购物资团队供应商信用资料接收邮箱 csuri@nhchem.co.kr；该说明发布于2020年，具名岗位和邮箱当前送达尚待确认，不能认定其为包覆原料直接采购负责人。",
    "contact": {
      "label": "Official procurement/materials supplier-credit contact published in 2020; current holder, delivery and coating-specific role unconfirmed",
      "email": "csuri@nhchem.co.kr",
      "phone": "+82 61 688 5222",
      "contactUrl": "https://www.nhchem.co.kr/sub/customer/e_data/view.html?curpage=1&idx=10"
    },
    "source": {
      "label": "Official current fully coated 30-8-8 fertilizer; own commercial coating plant independently corroborated by company history page 119",
      "url": "https://www.nhchem.co.kr/sub/product/fertilizer/view2.html?idx=182"
    },
    "productId": "fertilizer-coating",
    "fit": "可开发候选",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-10",
      "conclusion": "独立重读现有全颗粒包覆产品、官方厂史、化学产品目录和采购资料。包覆原料开发合作伙伴KCC不作为客户；Namhae自身负责下游包覆工艺与成品肥制造。所查对外化学产品为氨、尿素、硫酸、磷酸、盐类等一般化学品，未发现对外销售同类PU包衣树脂或成套肥料包衣剂的公开证据。与现有Chobi、FarmHannong、Pungnong、Nousbo等韩国公司不同；其为NongHyup集团关联企业，按一个法人账户收录，不拆分Yeosu工厂和Seoul办公室。以Namhae/Nam Hae/南海化学/남해화학、nhchem.co.kr及所在地核对最新main与本地名单，无重复。"
    },
    "checkedAt": "2026-10-10"
  },
  {
    "id": "hankook-hyeophwa-pohang",
    "company": "Hankook Hyeophwa Co., Ltd.",
    "country": "South Korea",
    "countryZh": "韩国",
    "city": "Pohang",
    "latitude": 36.019,
    "longitude": 129.3435,
    "legacyCompanyDescription": "包覆复合肥制造与配方企业",
    "signal": "现有官网 땅심올코팅（30-6-9）产品明确为氮、磷、钾100%全包覆肥；官网企业信息和业务页确认其为肥料制造企业，拥有复合肥及BB肥工厂和配料、混合、反应、造粒、包装工序。属于包覆复合肥下游制造/配方方向。尚不能据成品目录确认所有包覆颗粒自产、独立包衣线位置或PU路线，未证明使用我方产品或当前采购需求。已核实总部及Pohang工厂公开业务电话，业务邮箱未核实，不计入每日邮件客户数量。",
    "contact": {
      "label": "Official corporate and factory business phones; no verified business email",
      "phone": "+82 54 272 5072",
      "contactUrl": "https://fert-kfia.or.kr/new/05_member/member01_view08.asp"
    },
    "source": {
      "label": "Official current 땅심올코팅 30-6-9 product: N, P and K fully coated; public product detail independently reread via own website API",
      "url": "https://api.khhc.co.kr/products/info/246"
    },
    "productId": "fertilizer-coating",
    "fit": "可开发候选",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立重读官网全包覆NPK产品原始详情、公司制造业务和现有肥料目录，及KFIA公司/工厂资料。对外目录为土壤改良剂、有机肥、底肥、追肥、缓释肥及出口肥料，未发现销售同类PU包衣树脂、成套包衣剂或包衣原料的公开证据；同名Hyeophwa Chemical不因名称近似替代本公司的制造证据。以Hankook Hyeophwa/Hyeop Hwa/한국협화/khhc.co.kr及Pohang地址核对最新main与本地公司账户，无重复；Seoul总部与Pohang工厂按同一法人账户收录，不拆分为两个客户。"
    },
    "checkedAt": "2026-10-11"
  },
  {
    "id": "kg-chemical-ulsan",
    "company": "KG Chemical Corporation",
    "country": "South Korea",
    "countryZh": "韩国",
    "city": "Ulsan",
    "latitude": 35.5384,
    "longitude": 129.3114,
    "legacyCompanyDescription": "全包覆微生物缓释肥制造与研发企业",
    "signal": "公司2025年报（2026年3月披露）的肥料研发成果列出 미생물올코팅 全包覆微生物肥上市；报告和KFIA资料确认KG Chemical自身制造复合肥及功能性肥料。KFIA 2023年3月原始会刊进一步说明该成品的缓释养分溶出设计和微生物包覆，以及当时研发团队负责人。可作为包覆肥下游配方/制造方向评估；资料未证明其包覆体系为PU、所有被覆颗粒自产、使用我方产品或当前采购计划。只有经协会及公司披露核实的业务电话，尚无可靠业务邮箱，不能计入每日邮件客户数量。",
    "contact": {
      "label": "KFIA published KG Chemical corporate/factory business phone; no verified business email",
      "phone": "+82 52 231 1700",
      "contactUrl": "https://fert-kfia.or.kr/new/05_member/member01_view06.asp"
    },
    "source": {
      "label": "KG Chemical 2025 official annual report disclosed March 2026: own fertilizer manufacture and R&D launch of 미생물올코팅 coated microbial fertilizer",
      "url": "https://kind.krx.co.kr/external/2026/03/23/002346/20260323009924/11011.htm"
    },
    "productId": "fertilizer-coating",
    "fit": "可开发候选",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立重读最新官方年报的肥料、建筑材料、环境化学品研发及产品范围，及KFIA制造企业资料。该法人同时生产PNS/PCE混凝土外加剂、分散剂和水处理剂，此类化学品不能据通用polymer字样认定为肥料PU包衣树脂；所查目录未发现对外出售同类肥料包衣原料或成套包衣剂的证据。按KG集团旗下KG Chemical自身法人/肥料业务账户收录，不把集团钢铁、能源、汽车或旗下品牌拆为新增。以KG Chemical/KG케미칼/Gyeonggi Chemical/경기화학/kgchem.co.kr及Ulsan地址核对最新main和本地账户，无重复。KGfarmmall由Songhyun Chemical零售商经营，其邮箱不归入KG Chemical；ChemicalBook目录邮箱未获官方来源佐证，WHOIS和财务披露邮箱不作开发入口。"
    },
    "checkedAt": "2026-10-11"
  },
  {
    "id": "tectona-warna-cirebon",
    "productId": "nl-w1201",
    "company": "PT Tectona Warna Indonesia (Tectona Paint)",
    "country": "Indonesia",
    "countryZh": "印度尼西亚",
    "city": "Palimanan, Cirebon",
    "latitude": -6.7063,
    "longitude": 108.557,
    "fit": "可开发候选",
    "signal": "官网联系页明确 Tectona 为 PT Tectona Warna Indonesia 的水性木器涂料品牌，并在 Palimanan, Cirebon 生产；当前产品系统包括 WoodFiller、WoodStain/木色剂、WoodSeal 水性砂光封闭层及 WoodCoat 清面漆。属于水性木材涂料下游配方/制造方向，不代表已使用 NL-W1201。地图坐标仅代表 Cirebon 城市位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立再次阅读 https://tectonapaint.id/ 与 https://tectonapaint.id/id/kontak/ 的制造主体、完整产品系统及公开业务范围：所查为水性木器成品涂料，未发现对外销售水性聚烯烃乳液、CPO/PO 分散液或同类附着力原料的证据。Tectona 品牌、PT Tectona Warna Indonesia、tectonapaint.id 与最新 main、本地正式数据及私有队列无重复；经销商和城市代理不拆为新增。"
    },
    "contact": {
      "label": "Official general business entry; no named procurement person inferred",
      "phone": "08132239997",
      "email": "info@tectonapaint.id",
      "contactUrl": "https://tectonapaint.id/id/kontak/"
    },
    "source": {
      "label": "Official Tectona waterborne wood finishing system",
      "url": "https://tectonapaint.id/"
    },
    "checkedAt": "2026-10-11",
    "legacyCompanyDescription": "水性木器成品涂料制造与配方企业"
  },
  {
    "id": "mowilex-indonesia-cikande",
    "productId": "nl-w1201",
    "company": "PT Mowilex Indonesia (Asia Coatings Enterprises group)",
    "country": "Indonesia",
    "countryZh": "印度尼西亚",
    "city": "Cikande, Serang, Banten",
    "latitude": -6.1204,
    "longitude": 106.1502,
    "fit": "可开发候选",
    "signal": "当前官方 Woodstain 木器涂料页明确木材用途，并列 Pelarut: Air（水）；官方 2023-03-21 工厂公告确认 PT Mowilex Indonesia 在 Cikande 的新厂已揭幕并替代 Daan Mogot 旧厂。属于水性木器成品涂料制造/研发方向；该历史公告不作为本轮新项目，未证明使用或采购我方产品。其为 Asia Coatings Enterprises (ACE) 子公司。地图坐标代表 Serang 城市位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立再次阅读 https://mowilex.com/mowilex-woodstain/、官方工厂公告与 https://shop.mowilex.com/en/collections/additive：所查 Additive 类目是 BC1000 Alcasit 水泥/石膏用建筑外加剂，不是 W1201 类聚烯烃乳液或附着力原料；未发现对外出售同类水性聚烯烃/CPO/PO 输入原料的证据。以 Mowilex、PT Mowilex Indonesia、mowilex.com/shop.mowilex.com 与最新 main、本地数据及研究队列去重，无重复。集团 ACE、Cendana 品牌和各地区分支不拆为新增。"
    },
    "contact": {
      "label": "Official general business entry; no named procurement person inferred",
      "phone": "+62 21 5406663",
      "contactUrl": "https://shop.mowilex.com/en/pages/contact"
    },
    "source": {
      "label": "Official Woodstain wood coating and water solvent specification",
      "url": "https://mowilex.com/mowilex-woodstain/"
    },
    "checkedAt": "2026-10-11",
    "legacyCompanyDescription": "水性木器成品涂料制造与配方企业"
  },
  {
    "id": "elchemus-bukit-mertajam",
    "company": "ELCHEMUS Sdn Bhd",
    "productId": "nl-w1201",
    "country": "Malaysia",
    "countryZh": "马来西亚",
    "city": "Bukit Mertajam, Penang",
    "latitude": 5.363,
    "longitude": 100.4667,
    "fit": "可开发候选",
    "signal": "官网明确 ELCHEMUS Sdn Bhd（1466813-P）自行研发、制造水性涂料；木器系统列水性 SC800 木材封闭底层、TC901i 水性木器面漆及 EPC300/600 填充/封闭/底涂产品。水性木材表面处理是潜在下游评估方向，未证明使用、外购或需要 NL-W1201。创始人曾经营家具企业 Woodalogy，相关企业不拆为新增客户；地图坐标代表 Bukit Mertajam 城市位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立再次阅读 https://www.elchemus.com/、https://www.elchemus.com/general-7、https://www.elchemus.com/surface-max 及完整导航：所查为木器底层/面漆、Surface Max 水性填充底涂和 Artist Gesso 成品涂料，未发现对外出售水性聚烯烃乳液、CPO/PO 分散液或同类附着力原料的证据；网页 Raw Material 图片是未涂饰木板，不是原料产品销售。按 ELCHEMUS 法人账户收录，Woodalogy 家具关联及各产品品牌不拆为新增。公司名、法人号、域名与最新 main、本地客户及研究队列去重，无重复。"
    },
    "contact": {
      "label": "Official general business inbox; named procurement contact not inferred",
      "email": "contactus@elchemus.com",
      "phone": "+60 12-4219-533",
      "contactUrl": "https://www.elchemus.com/"
    },
    "source": {
      "label": "Official in-house waterborne coating development/manufacturing and company business contact",
      "url": "https://www.elchemus.com/"
    },
    "checkedAt": "2026-10-11",
    "legacyCompanyDescription": "水性木器成品涂料制造与配方企业"
  },
  {
    "id": "duraway-coating-kapar",
    "company": "Duraway Coating Sdn Bhd",
    "productId": "nl-w1201",
    "country": "Malaysia",
    "countryZh": "马来西亚",
    "city": "Kapar, Selangor",
    "latitude": 3.1387,
    "longitude": 101.3718,
    "fit": "可开发候选",
    "signal": "官网介绍确认 Duraway Coating Sdn Bhd（185844-P）自行研发、制造涂料并有生产工厂；木器产品目录明确水性木材 filler/putty、室内外家具用水性封闭底层/清漆及水性木地板清涂层。符合水性木材表面处理下游配方评估方向；未证明其采购、使用或需要 NL-W1201。不从 generic plastic 或 metal 产品推断其他 TDS 基材。地图坐标代表 Kapar 城市位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立再次阅读官网 AboutUs、木器完整系统、ContactUs 及首页生产说明；对外范围是成品木器漆、保护性金属涂料和相关涂装产品，所查未发现水性聚烯烃乳液、CPO/PO 分散液或同类附着力输入原料销售。木器目录中的 PU 指成品清漆类别，不据此把它当作聚氨酯分散液供应商。以 Duraway/固耐威、法人号 185844-P、durawaycoating.com 及 Kapar 地址核对最新 main、本地正式数据和私有队列，无重复。公开 Gmail 是官网标明的业务询问入口，不推断个人姓名或采购职责。"
    },
    "contact": {
      "label": "Official general business inbox; named procurement contact not inferred",
      "email": "datolowsh7@gmail.com",
      "phone": "+60 3-33927798",
      "contactUrl": "https://durawaycoating.com/ContactUs"
    },
    "source": {
      "label": "Official wood coating system including waterborne sealer/lacquer and floor clearcoat",
      "url": "https://durawaycoating.com/ProductDetail/wood-coating/123ae639-0c94-48a9-a04f-596da22b3c56"
    },
    "checkedAt": "2026-10-11",
    "legacyCompanyDescription": "水性木器成品涂料制造与配方企业"
  },
  {
    "id": "iffco-kalol",
    "company": "Indian Farmers Fertiliser Cooperative Limited (IFFCO)",
    "productId": "fertilizer-coating",
    "country": "India",
    "countryZh": "印度",
    "city": "Kalol, Gandhinagar, Gujarat",
    "latitude": 23.24,
    "longitude": 72.5,
    "fit": "可开发候选",
    "signal": "官网 Kalol 工厂资料明确自 2015 年起全面生产苦楝油包衣尿素，当前尿素产品页明确 neem oil coating；作为同一 IFFCO 合作社账户收录，Kalol、Phulpur、Aonla 与其他工厂不拆为新增。已公开包衣能力可用于一般尿素包衣方向的潜在技术评估；苦楝油包衣不是聚氨酯或聚合物包膜，不证明使用或适配我方包膜剂。坐标代表 Kalol 城市位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立再次读取 Kalol 工厂、Neem Coated Urea 产品、主要养分产品目录、Our Businesses 集团/合资清单与采购入口；公开业务包括成品肥料、磷酸/氨尿素中间体、农业生物制品及其他非同类业务，所查未发现对外供应 PU 原料、包衣树脂或同类成套肥料包衣剂。未把一般化工中间体等同包衣原料。按 IFFCO 法人和 iffco.in 域名去重，工厂、品牌、国际合资企业不增加数量；核对最新 main ddc6df1 与本地数据及私有队列，无现有同一账户。"
    },
    "contact": {
      "label": "Official procurement portal; named purchase and plant roles verified separately",
      "contactUrl": "https://www.iffco.in/en/tenders"
    },
    "source": {
      "label": "Official Kalol own neem-coated urea production and unit head",
      "url": "https://www.iffco.in/en/production-unit-kalol-gujarat"
    },
    "checkedAt": "2026-10-11",
    "legacyCompanyDescription": "自有苦楝油包衣尿素制造企业；非已确认聚合物或 PU 包膜客户"
  },
  {
    "id": "national-fertilizers-nangal",
    "company": "National Fertilizers Limited (NFL)",
    "productId": "fertilizer-coating",
    "country": "India",
    "countryZh": "印度",
    "city": "Naya Nangal, Punjab",
    "latitude": 31.38,
    "longitude": 76.37,
    "fit": "可开发候选",
    "signal": "官网 Startup 业务说明及公开质量手册均明确 NFL 自行制造、营销苦楝油包衣尿素；质量手册列自有 Nangal、Bathinda、Panipat、Vijaipur 制造网络。按 NFL 一个法人账户收录，地图代表 Nangal 城市而非推算厂区坐标。2026 年 Nangal 官方招标文件公开 Materials Department 业务邮箱及电话；其招标标的是防腐阳极，联系方式不构成包衣原料采购证明。苦楝油包衣不等同 PU/聚合物包膜，未确认我方产品采购、使用或配方适配。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立再次阅读官方制造/贸易范围和质量手册产品清单，区分自产尿素、Bio-Fertilizers、Bentonite Sulphur 与一般成品农资贸易。工业产品为氨、硝酸、硝酸盐、工业气体等，所查未发现 PU 原料、包衣树脂或同类肥料包衣剂对外供应。按 National Fertilizers/NFL、nfl.co.in 及法人号 L74899DL1974GOI007417 核对最新 main、本地正式数据和研究队列，无同一账户。Nangal 等分厂和 KISAN/BHARAT 品牌不另计；RFCL 合资关系不拆成新增。"
    },
    "contact": {
      "label": "Official business department inbox; no personal identity inferred",
      "email": "ranjits@nfl.co.in",
      "phone": "+91 9464966819",
      "contactUrl": "https://tenders.nfl.co.in/admin_tender/upload/20260603111644_ATCX27459_6b95da9d-975d-41c7-9e731779448342706_buyer11.nfln.pb.pdf"
    },
    "source": {
      "label": "Official company quality manual: own neem-coated urea and industrial product scope",
      "url": "https://www.nfl.co.in/nflportal/Quality/Manual.pdf?menu=33&pmenu=10"
    },
    "checkedAt": "2026-10-11",
    "legacyCompanyDescription": "自有苦楝油包衣尿素制造企业；非已确认聚合物或 PU 包膜客户"
  },
  {
    "id": "madras-fertilizers-manali",
    "company": "Madras Fertilizers Limited (MFL)",
    "productId": "fertilizer-coating",
    "country": "India",
    "countryZh": "印度",
    "city": "Manali, Chennai, Tamil Nadu",
    "latitude": 13.168,
    "longitude": 80.265,
    "fit": "可开发候选",
    "signal": "官网工厂业绩直接报告 2024–25 财年自行生产 528,400 吨 Neem Coated Urea，工厂及公司页面确认 Manali 自有氨/尿素生产。Bharat/Vijay 尿素品牌按一个 MFL 法人账户处理。公开联系页提供 General Manager (Plant) 职能邮箱和电话，未猜测个人姓名。对应一般尿素包衣应用的潜在技术评估对象；苦楝油包衣不证明 PU 或聚合物包膜能力，也不证明采购或适配我方包膜剂。坐标代表 Manali 城市位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立重读 The Company、The Plant、Achievements、Chemical Fertilizers、Bio Fertilizers 与 Agro Chemicals–Neem Based 产品目录，确认自产包衣尿素而非仅经销。Neem-based 商品是 Vijay Neem 植保农药，不能改标为我方同类肥料包衣原料；一般氨等工业品销售也不等同 PU 输入原料。所查未发现 PU 包衣树脂、同类包衣原料或成套包衣剂销售。以 Madras Fertilizers/MFL、madrasfert.co.in、Manali 地址和法人号 L32201TN1966GOI005469 核对最新 main、本地客户与私有队列，无重复；品牌和工厂不拆分。"
    },
    "contact": {
      "label": "Official business department inbox; no personal identity inferred",
      "email": "gmplant@madrasfert.co.in",
      "phone": "+91 44 25945310",
      "contactUrl": "https://madrasfert.co.in/contact-us/"
    },
    "source": {
      "label": "Official factory performance: own neem-coated urea production in FY2024–25",
      "url": "https://madrasfert.co.in/the-plant/achievements/"
    },
    "checkedAt": "2026-10-11",
    "legacyCompanyDescription": "自有苦楝油包衣尿素制造企业；非已确认聚合物或 PU 包膜客户"
  },
  {
    "id": "chambal-fertilizers-gadepan",
    "company": "Chambal Fertilisers and Chemicals Limited",
    "productId": "fertilizer-coating",
    "country": "India",
    "countryZh": "印度",
    "city": "Gadepan, Kota, Rajasthan",
    "latitude": 25.215,
    "longitude": 76.004,
    "fit": "可开发候选",
    "signal": "2020–21 官方年报第 49 页明确公司自产尿素为 neem-coated；2025–26 最新官方年报确认 Gadepan 三套自有尿素工厂持续生产，并区分外购复杂肥/植保产品。当前 Bharat Urea 官方资料说明缓慢供氮，但不把它当作当前 PU 包膜证据；包衣事实保留原始年报时期。作为有公开包衣制造能力的一般尿素包衣评估对象，未确认采用、采购或适配我方材料。Uttam/Bharat 品牌与三套工厂只计一个法人；地图代表 Gadepan 地区。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立读取官网 Who We Are、Our Facilities、成品肥目录和 2025–26 年报及子公司业务，公开范围为自产尿素、农业成品贸易、氨及 TAN 业务，所查未发现 PU 输入原料、包衣树脂或同类肥料包衣剂销售。年报区分 inactive/信息技术子公司及 IMACID 磷酸合资，不将这些品牌、工厂和集团名称新增计数。以 Chambal/CFCL、chambalfertilisers.com、chambal.in 与法人号 L24124RJ1985PLC003293 核对最新 main、本地正式数据和研究队列，无重复。Purchase 邮箱从官网公开防垃圾脚本的数值实体和字面串展开，未按姓名或域名猜测；isc@chambal.in 为投资者邮箱，未用于采购联络。"
    },
    "contact": {
      "label": "Official business department inbox; no personal identity inferred",
      "email": "cg_purcom1@chambal.in",
      "phone": "+91 744 2782915",
      "contactUrl": "https://www.chambalfertilisers.com/index43c2.html?Itemid=122&id=161&option=com_content&view=article"
    },
    "source": {
      "label": "Official annual report 2020–21 p49: own neem-coated urea manufacture",
      "url": "https://www.chambalfertilisers.com/pdf/Annual-Report-for-the-Financial-Year-2020-2021.pdf"
    },
    "checkedAt": "2026-10-11",
    "legacyCompanyDescription": "自有苦楝油包衣尿素制造企业；非已确认聚合物或 PU 包膜客户"
  },
  {
    "id": "general-finishes-east-troy",
    "company": "General Finishes",
    "productId": "nl-w1201",
    "country": "United States",
    "countryZh": "美国",
    "city": "East Troy, Wisconsin",
    "latitude": 42.785,
    "longitude": -88.405,
    "fit": "可开发候选",
    "signal": "官网公司资料介绍 East Troy 自有制造厂及扩建，当前 OEM 页面明确自有实验室定制配方；Enduro Sanding Sealer 产品为水性木器封闭底层。品牌官网 Terms 列运营法人 General Finishes Sales and Service Corp.，历史公司介绍使用 General Finishes Corporation；按同一 General Finishes 品牌账户收录，不据名称差异制造新增。已收购 TransTint 木器染料品牌，亦不单独计数。对应木材水性表面处理的潜在配方评估对象，未确认采购、使用或适配 NL-W1201。坐标代表 East Troy 城市位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立第二次读取公司自有工厂、当前 OEM 定制/实验室说明、Enduro 木器封闭底层、完整产品导航、官网 Terms 及 TransTint 官网收购说明。产品范围为成品木器漆、染色剂、染料浓缩液、延缓剂、加速剂和清洁护理用品；木器染料浓缩液不是 PO/CPO 乳液或附着力聚烯烃输入原料，成品 PU 清漆也不是原料分散液。所查未发现对外供应水性聚烯烃乳液、CPO/PO 分散液或同类附着力输入原料。按 General Finishes 两个历史/运营法人名称、generalfinishes.com、TransTint 品牌及 East Troy 地址核对 main 1a2e4f0、本地正式数据及私有队列，无既有同一账户；OEM 客户/经销商不新增。公开采购邮箱未找到，保留官方工业业务联系入口，不猜测邮箱或使用隐私专用入口。"
    },
    "contact": {
      "label": "Official business contact entry; no public business inbox independently verified",
      "contactUrl": "https://generalfinishes.com/register/general-finishes-manufacturer-account-registration-form"
    },
    "source": {
      "label": "Official own East Troy factory and coating manufacturing",
      "url": "https://generalfinishes.com/waterbase-finishes-manufacturer-wisconsin"
    },
    "checkedAt": "2026-10-11",
    "legacyCompanyDescription": "水性木器成品涂料配方与制造企业"
  },
  {
    "id": "target-coatings-fair-lawn",
    "company": "Target Coatings, Inc.",
    "productId": "nl-w1201",
    "country": "United States",
    "countryZh": "美国",
    "city": "Fair Lawn, New Jersey",
    "latitude": 40.94,
    "longitude": -74.132,
    "fit": "可开发候选",
    "signal": "官网明确 Target Coatings 自行研发制造水性木器涂料，Jeff Weiss 公开说明其 owner / formulating chemist 角色及采购外部树脂开发配方的历史；当前 EMTECH 木器封闭底层/底漆和 EMCAT 木器面漆为自有系统。Fair Lawn 官方地址标为 Sales / Administration / Warehouse，不把它改写成已核验生产厂址。EMTECH 与 EMCAT 品牌归属同一 Target Coatings 法人，只计一家公司。木材水性表面处理可作为潜在配方评估方向；未确认其需要、使用或适配我方牌号。地图为 Fair Lawn 城市代表坐标。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立重读公司开发/制造说明、木器封闭底层目录、完整导航、联系页、EMCAT EC2A 成品木器面漆及两款全部 finish additives。CL100 官方化学说明为 ester diol blend 交联助剂；SA5 为降低黏度、延缓干燥的施工助剂，不把交联/流平功能泛化为 PO/CPO 或聚烯烃附着力原料。EMCAT 的 acrylic resin topcoat 是可喷涂木器的成品涂料套装，不能按标题当作 raw acrylic resin。公开目录所查未发现水性聚烯烃乳液、CPO/PO 分散液或同类附着力原料对外供应；公司原始叙述另明确外购树脂配方开发。按 Target Coatings Inc.、targetcoatings.com、EMTECH/EMCAT 与 Fair Lawn 地址核对 main、本地及队列，无同一账户；品牌不拆分。未找到公开采购邮箱；使用官网国际业务电话及联系入口，Jeff Weiss 仅保存公开原文角色，不猜测邮箱。"
    },
    "contact": {
      "label": "Official business contact entry; no public business inbox independently verified",
      "phone": "+1 201 821 0150",
      "contactUrl": "https://www.targetcoatings.com/contact_us/"
    },
    "source": {
      "label": "Official own waterborne formulation/manufacturing and owner chemist",
      "url": "https://www.targetcoatings.com/about-target-coatings/"
    },
    "checkedAt": "2026-10-11",
    "legacyCompanyDescription": "水性木器成品涂料配方与制造企业"
  },
  {
    "id": "vermont-natural-coatings-hardwick",
    "company": "Vermont Natural Coatings",
    "productId": "nl-w1201",
    "country": "United States",
    "countryZh": "美国",
    "city": "Hardwick, Vermont",
    "latitude": 44.504,
    "longitude": -72.367,
    "fit": "可开发候选",
    "signal": "当前官网 Böhme 页面明确 Vermont Natural Coatings 通过合作自行制造并在北美分销水性木器成品涂饰系统；About / PolyWhey 技术页面说明自有产品开发，当前 PolyWhey Exterior Penetrating Wood Stain 明确为 water-based 木材染色保护层。因此制造资格使用当前原始网页，不以无法完整下载的历史产品册作核验依据。Böhme 是官网明示合作制造品牌，未断言收购或共同法人，也不将品牌新增。公开通用业务邮箱及 Hardwick 地址已核验；未确认 NL-W1201 采购、使用或配方兼容性。地图为 Hardwick 城市代表坐标。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立重读当前 About、PolyWhey 技术、PolyWhey 水性木材产品和 Böhme 明确制造合作说明，并核查全部导航：公开产品为木器底层/面层/染色剂、混凝土成品保护涂层及施工/木材清洁用品。Hydro Seal / Hydro-Oil Primer 均列成品木器处理系统，所查未发现水性聚烯烃乳液、CPO/PO 分散液或同类附着力输入原料外售。生物基/whey 技术不构成我方牌号兼容性证据。按 Vermont Natural Coatings、vermontnaturalcoatings.com、Hardwick 地址核对 main、本地及队列，无同一公司；PolyWhey 和 Böhme 合作产品不拆分。未发现公开采购负责人邮箱，使用官网明示通用公司业务邮箱，不推断个人身份。"
    },
    "contact": {
      "label": "Official general business inbox; procurement identity not inferred",
      "email": "info@vermontnaturalcoatings.com",
      "phone": "+1 802 472 8700",
      "contactUrl": "https://vermontnaturalcoatings.com/pages/bohme"
    },
    "source": {
      "label": "Official current own manufacture of partnered waterborne wood finish systems",
      "url": "https://vermontnaturalcoatings.com/pages/bohme"
    },
    "checkedAt": "2026-10-11",
    "legacyCompanyDescription": "水性木器成品涂料配方与制造企业"
  },
  {
    "id": "renner-italia-minerbio",
    "company": "Renner Italia S.p.A.",
    "productId": "nl-w1201",
    "country": "Italy",
    "countryZh": "意大利",
    "city": "Minerbio, Bologna",
    "latitude": 44.622,
    "longitude": 11.491,
    "fit": "可开发候选",
    "signal": "独立读取2026官方 Wood 企业册并目视核对第10页：Minerbio 自有水性涂料生产、实验室和包装工厂；木器产品章节明确水性家具及室内/室外成品涂料。Renner Italia 隶属 Renner Herrmann 集团并协调 Renner Global Alliance，Renner Sayerlack、各国公司及 Rio Verde 品牌关联已注明，只收录一个集团需求侧账户，不拆分地区或品牌。作为木材水性表面处理的潜在配方评估对象，未确认其采购、使用或适配 NL-W1201。坐标代表 Minerbio 城市位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立重读2026完整木器企业册、官网 Company and group / Group、Research / Our suppliers and us 及完整成品目录导航。Rennerlab 有内部水/溶剂树脂合成，官网说明特殊聚合物为自有/许可给 Renner Italia、服务定制成品涂料；该制造事实保留，不将内部树脂合成或仓库 Raw Materials 标签改写成原料对外销售。供应链页面明确外部原料与树脂采购，但不据此声称采购我方材料。所查对外范围为木器/金属/塑料/玻璃成品涂料及调色系统，集团其他产业为包装、林业、家具及乳制品，未发现同类水性聚烯烃乳液、CPO/PO 分散液或附着力输入原料外售。以 Renner Italia/Global Alliance/Herrmann/Sayerlack/Rio Verde、官网域名及 VAT 02433001209 核对 main 7a1c464、本地及队列，无已有同一账户。未核验采购专用邮箱；使用官网通用业务邮箱及明示 President 姓名，不猜个人邮箱。"
    },
    "contact": {
      "label": "Official public business inbox; role verified separately",
      "email": "info@renneritalia.com",
      "phone": "+39 051 6618211",
      "contactUrl": "https://renneritalia.com/en/the-company-and-the-group/"
    },
    "source": {
      "label": "Official 2026 wood catalogue p10 and wood coating chapters; PDF independently rendered",
      "url": "https://renneritalia.com/wp-content/uploads/cataloghi/en_corporate26-wood.pdf"
    },
    "checkedAt": "2026-10-11",
    "legacyCompanyDescription": "水性木器成品涂料研发制造企业"
  },
  {
    "id": "kribhco-hazira",
    "company": "Krishak Bharati Cooperative Limited (KRIBHCO)",
    "productId": "fertilizer-coating",
    "country": "India",
    "countryZh": "印度",
    "city": "Hazira, Surat, Gujarat",
    "latitude": 21.118,
    "longitude": 72.65,
    "fit": "可开发候选",
    "signal": "官网 Neem Coated Urea 原文明确 Hazira 与 Shahjahanpur 工厂在自产尿素制造过程中均匀喷涂苦楝油；制造资格来自直接工艺说明，不是仅凭政府政策或销售品名。KRIBHCO 合作社与 KFL 子公司/两厂作为一个需求侧账户；与既有 IFFCO 共同参股 OMIFCO 的关联已记录，这种共同合资关系不代表两合作社同一法人。对应一般尿素包衣技术评估方向，苦楝油包衣不证明 PU/聚合物包膜或我方材料适配及采购意向。地图坐标为 Hazira 地区代表位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立第二次读取实际尿素包衣工艺、全产品导航与 Products & Services、官网 Contact、Subsidiaries/Joint Venture 范围。公开业务为自产/成品肥料、种子及农技服务，未发现 PU 输入原料、包衣树脂或同类成套包衣剂对外销售；不将苦楝油-coated 成品尿素当成包衣原料销售。KRIBHCO、Krishak Bharati Cooperative、KFL/kribhco.net 与相关品牌/地址核对 main、本地正式记录及私有队列，无既有同一账户；KFL 子公司和 Hazira/Shahjahanpur 两厂不额外计数。公开采购邮箱未核验成功；以官网厂区电话/联系入口为保底，不构造邮箱或虚构负责人。"
    },
    "contact": {
      "label": "Official public business phone/contact page; procurement inbox not independently verified",
      "phone": "+91 261 2862766",
      "contactUrl": "https://www.kribhco.net/contact.html"
    },
    "source": {
      "label": "Official own neem-oil coating during manufacturing at Hazira/Shahjahanpur",
      "url": "https://www.kribhco.net/urea.html"
    },
    "checkedAt": "2026-10-11",
    "legacyCompanyDescription": "自产苦楝油包衣尿素企业；未确认 PU/聚合物包膜"
  },
  {
    "id": "hurl-new-delhi",
    "company": "Hindustan Urvarak & Rasayan Limited (HURL)",
    "productId": "fertilizer-coating",
    "country": "India",
    "countryZh": "印度",
    "city": "New Delhi",
    "latitude": 28.631,
    "longitude": 77.278,
    "fit": "可开发候选",
    "signal": "当前官方 Product Overview 与 Products 原文明确 HURL 的 Neem-Coated Urea 成品及 Gorakhpur、Barauni、Sindri 三家自有生产工厂；全目录另标进口 NPK 等成品业务，未混同自产。官网联系人表明示 Contracts & Materials 采购负责人 C. S. Prasad 及邮箱。HURL 是 CIL/NTPC/IOCL/FCIL/HFCL 合资法人，三厂和 Bharat/Apna 品牌只计一个账户；与其他肥企的合作公告不制造新增。作为一般包衣尿素工艺评估对象，未确认聚合物/PU 包膜，也不确认我方材料采购、使用或适配。地图为 New Delhi 总部位置，不代替三厂厂址。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立再次读取当前 Neem-Coated Urea 产品与明确自有工厂说明、完整 bulk/non-bulk 产品、Contact 各职能负责人及法人合资身份。成品目录包括尿素、磷钾/复合肥、硫/微量元素和生物肥，一般肥料贸易与自产已分开；公开 HURL 对外业务未发现 PU 原料、包衣树脂或同类肥料包衣剂销售。不把一般农资成品/合资股东所有上游行业等同 HURL 自身同类原料销售。按 HURL、Hindustan Urvarak & Rasayan、hurl.net.in 及合资法人/品牌核对 main、本地、队列，无既有正式同一公司；三个生产厂和股东不拆为本轮新增。采购与技术角色姓名/邮箱只用官网明示，不按域名猜测。"
    },
    "contact": {
      "label": "Official public business inbox; role verified separately",
      "email": "VPCnM@hurl.net.in",
      "phone": "+91 11 22402305",
      "contactUrl": "https://hurl.net.in/contact/"
    },
    "source": {
      "label": "Official current own coated-urea product and three manufacturing plants",
      "url": "https://hurl.net.in/ProductOverview/"
    },
    "checkedAt": "2026-10-11",
    "legacyCompanyDescription": "自产苦楝油包衣尿素企业；未确认 PU/聚合物包膜"
  },
  {
    "id": "bvfcl-namrup",
    "company": "Brahmaputra Valley Fertilizer Corporation Limited (BVFCL)",
    "productId": "fertilizer-coating",
    "country": "India",
    "countryZh": "印度",
    "city": "Namrup, Dibrugarh, Assam",
    "latitude": 27.181,
    "longitude": 95.333,
    "fit": "可开发候选",
    "signal": "独立读取2019–20官方年报原文：BVFCL 自行设计建立 Namrup-II/III 苦楝油包衣设施，自2015年8月20日起两厂均生产包衣尿素；制造证据保留原报告期。当前官网 Plant Highlights（页面标注2026更新）列实际运行的 Namrup-III 氨/尿素装置，未声称 Namrup-II 仍运行。当前 Product 页的进口 MUKTA Neem Coated Urea 明确在 Trading Products 中，不用进口品替代自产证明。公开采购联系表列 C P Singh（Manager MM）及业务邮箱。属于一般尿素包衣潜在评估对象，苦楝油包衣不证明 PU/聚合物包膜或我方产品兼容性、采购及使用。地图为 Namrup 城市代表位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立重读原官方年报包衣线段落、当前运行装置、自产/进口产品分类、总部联系与 Management 材料/合同/技术部门表。所查对外范围是肥料/生物肥/种子等成品、进口农资与一般氨业务，未发现 PU 输入原料、包衣树脂或同类包衣剂销售；年报中的原料采购不能改写成外售原料。按 BVFCL 全称、bvfcl.com/bvfcl.co.in 与 Namrup 地址核对 main、本地和队列，无既有同一账户；Bharat/Mukta 品牌、两装置及待建设项目不单独计数。负责人仅用官网 Office Email；原始 Management 快照的住宅分机列已删除，未保留或使用私人联系电话。"
    },
    "contact": {
      "label": "Official public business inbox; role verified separately",
      "email": "cpsingh@bvfcl.com",
      "contactUrl": "https://bvfcl.com/management/"
    },
    "source": {
      "label": "Official annual report 2019–20: own neem coating plant and production history",
      "url": "https://www.bvfcl.com/wp-content/uploads/2020/12/18th_Annual_Report_of_BVFCL_for_the_year_2019-20.pdf"
    },
    "checkedAt": "2026-10-11",
    "legacyCompanyDescription": "自产苦楝油包衣尿素企业；未确认 PU/聚合物包膜"
  },
  {
    "id": "hempel-lyngby",
    "company": "Hempel A/S",
    "productId": "elo",
    "country": "Denmark",
    "countryZh": "丹麦",
    "city": "Kgs. Lyngby, Copenhagen",
    "latitude": 55.771,
    "longitude": 12.503,
    "fit": "可开发候选",
    "signal": "官方2025年报记载集团自有生产网络，当前官网说明涂料研发和制造业务；船舶应用与产品品牌目录列船壳、防腐、罐体内衬及环氧成品涂料。作为 ELO TDS 涂料应用对应的潜在下游配方方，未确认其采购、使用或适配 ELO。Hempel 各国子公司、Crown、Wattyl、Farrow & Ball、Neogard/Jones-Blair 关联作为一个集团账户；不拆分品牌/分厂，大陆及台湾分公司不收录。坐标为总部地区代表位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立复读官方2025年报、当前研发/制造与船舶页面及 All Brands/All Products。所查产品范围为防腐、船舶、防火、装饰及防水成品涂层；未观察到 ELO、ESBO、环氧化植物油或同类增塑/稳定输入原料外售。目录中的 epoxy/silicone/rosin 等是成品涂料体系说明，不推断其使用 ELO。年报第91页已渲染目视核对所有权关系，核对 Hempel/Crown/Wattyl/Farrow & Ball/Neogard/Jones-Blair、域名、总部地址与最新 main、本地及研究队列，无已有同一集团正式客户。技术负责人姓名职务由官网明示；未核验采购专用或个人邮箱，保留官网通用业务邮箱。结论限已查公开范围。"
    },
    "contact": {
      "label": "Official public general business inbox and contact entry",
      "email": "hempel@hempel.com",
      "phone": "+45 4593 3800",
      "contactUrl": "https://www.hempel.com/contact-us"
    },
    "source": {
      "label": "Official 2025 annual report: manufacturing network and group ownership, original PDF p91 visually checked",
      "url": "https://www.hempel.com/-/media/Hempel/Files/Annual-Reports/Hempel-Annual-Report-2025.pdf"
    },
    "checkedAt": "2026-10-11",
    "legacyCompanyDescription": "成品工业/船舶涂料研发制造企业；ELO 配方适配及采购未确认"
  },
  {
    "id": "chugoku-marine-paints-tokyo",
    "company": "Chugoku Marine Paints, Ltd. (CMP)",
    "productId": "elo",
    "country": "Japan",
    "countryZh": "日本",
    "city": "Minato-ku, Tokyo",
    "latitude": 35.666,
    "longitude": 139.75,
    "fit": "可开发候选",
    "signal": "当前官方 Fact Sheet 明确公司制造船舶、工业和集装箱涂料；Factory/R&D 页面列九州、滋贺工厂及大竹、滋贺研发设施，船舶产品页列自有防污及环氧保护涂料。法人与全球总部位于日本，中文名称含“中国”不改变日本主体国家。与 ELO TDS 涂料应用对应，未确认 ELO 使用、购买、需求或配方相容性。CMP 子公司、分厂和 SEAJET 品牌归并一个集团账户；大陆/台湾子公司不收录。既有 Renner Herrmann 的技术许可关系不等同股权同一主体。地图为东京总部地区代表位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立复读当前公司 Fact Sheet、实际工厂研发页、船舶目录、完整产品分类与 Functional Compounds，以及官方集团目录。产品范围包括成品防污/工业/集装箱涂料及铁路用 CUS 聚氨酯填充材料；CUS 是成品铁路支撑/减振填料，不能据 PU 字样判为 ELO/ESBO 输入原料。未发现环氧化植物油、同类增塑/稳定原料的公开外售条目。按 CMP/Chugoku Marine Paints/SEAJET、cmp.co.jp、总部及关联子公司核对最新 main、本地及私有队列，无既有同一账户。日本总部电话来自官方公司资料，公开联系页保留；没有独立核验采购邮箱，不猜测邮箱。Kenshi Date 姓名职位来自当前官方资料。结论限已查公开范围。"
    },
    "contact": {
      "label": "Official public headquarters business phone and contact entry; no procurement inbox independently verified",
      "phone": "+81 3 6457 9025",
      "contactUrl": "https://www.cmp.co.jp/en/contact/"
    },
    "source": {
      "label": "Official own marine/industrial/container coating manufacturing and legal headquarters",
      "url": "https://www.cmp.co.jp/en/company/corporate_data.html"
    },
    "checkedAt": "2026-10-11",
    "legacyCompanyDescription": "成品工业/船舶涂料研发制造企业；ELO 配方适配及采购未确认"
  },
  {
    "id": "nervion-tlalnepantla",
    "company": "El Nervión, S.A. de C.V. (Pinturas Nervión)",
    "productId": "elo",
    "country": "Mexico",
    "countryZh": "墨西哥",
    "city": "Tlalnepantla de Baz, Estado de México",
    "latitude": 19.537,
    "longitude": -99.195,
    "fit": "可开发候选",
    "signal": "当前官网 Nosotros 明确自行设计制造高性能涂料；Dónde 列 Tlalnepantla 工厂，环氧/海洋产品目录列自研工业防腐底漆、面漆、船舶及其他成品保护涂层。Privacy 明确 El Nervión 法人与 Aldama 5 业务地址；技术咨询入口和联系页提供公开业务邮箱/电话。作为 ELO TDS 涂料应用的潜在下游配方评估对象，未确认其采购、使用、需求或配方适配。Nervión 商标、DUREPOXY/EPONER/其他自有品牌与销售网点只计一个公司；经销商不是新增制造客户。坐标代表 Tlalnepantla 城市位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立重新读取当前 Nosotros、工厂网点、法人与业务地址、环氧/海洋目录及所有产品分类导航，额外反查 Solventes y Reactores，保留其涂料配套溶剂/固化组分业务事实；这不等同 ELO/ESBO 或环氧化植物油增塑/稳定原料销售。Familias de Resina 的环氧等分类下为有型号的底漆、面漆、地坪及修补成品，不能把树脂类别名直接当作原料卖方。所查对外范围未发现同类环氧化油输入原料。按 El Nervión/Pinturas Nervión、品牌、nervion.com.mx、Aldama 5 核对最新 main、本地及队列，只有待审核研究项，没有已有正式同一公司；未把研究 ready_for_review 状态当作核验。采购/研发具名联系尚未核验，使用当前官网一般业务邮箱和销售咨询电话，不使用隐私权办理邮箱作为开发联系人。结论限已查公开范围。"
    },
    "contact": {
      "label": "Official public general business inbox and contact entry",
      "email": "informacion@nervion.com.mx",
      "phone": "+52 55 2169 0470",
      "contactUrl": "https://www.nervion.com.mx/contacto"
    },
    "source": {
      "label": "Official direct design and manufacturing statement",
      "url": "https://www.nervion.com.mx/nosotros"
    },
    "checkedAt": "2026-10-11",
    "legacyCompanyDescription": "成品工业/船舶涂料研发制造企业；ELO 配方适配及采购未确认"
  },
  {
    "id": "pinturas-jemah-nuevo-leon",
    "company": "Pinturas Jemah de México, S.A. de C.V.",
    "productId": "elo",
    "country": "Mexico",
    "countryZh": "墨西哥",
    "city": "Nuevo León (officially disclosed region)",
    "latitude": 26.5,
    "longitude": -100,
    "fit": "可开发候选",
    "signal": "独立复读官方 Nosotros、PEMEX/CFE 和其他产品目录：JEMAH 明确自制工业防腐与水性成品涂料、定制开发，型号表列环氧底漆/面漆及聚氨酯等成品涂层。作为 ELO TDS 涂料应用对应的潜在下游配方方，未确认 ELO 采购、使用、需求或相容性。官网明示所在 Nuevo León 北部及业务邮箱/电话；没有把第三方目录街道地址当作官方核验地址，地图仅代表所披露州级区域，非精确工厂定位。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "发现队列后重新独立读取官方公司与全部三类公开目录，并直接读取 PEMEX 1990 型号表：产品是配制成品防腐底漆、面漆、密封/防水涂料；未发现 ELO、ESBO、环氧化植物油或同类增塑/稳定输入原料销售。成品 epoxy/polyurethane 名称不等同同类原料供应。按完整法人名、JEMAH、pinturasjemah.com、公开电话核对最新 main、本地与队列，仅有待审核研究项，无已有正式同一公司；不拆分 PEMEX/CFE 产品系列为新增。具名采购/技术人员未核验，公开 ventas 邮箱标为 Commercial，未伪造成采购邮箱。制造资格不依赖第三方目录；地址只保留官方披露的区域层级。结论限所查公开范围。"
    },
    "contact": {
      "label": "Official public Commercial inbox",
      "email": "ventas@pinturasjemah.com",
      "phone": "+52 81 8355 7600",
      "contactUrl": "https://pinturasjemah.com/contacto.html"
    },
    "source": {
      "label": "Official own anticorrosive and water-based coating manufacture and disclosed location",
      "url": "https://pinturasjemah.com/nosotros.html"
    },
    "checkedAt": "2026-10-11",
    "legacyCompanyDescription": "成品工业/船舶涂料研发制造企业；ELO 配方适配及采购未确认"
  },
  {
    "id": "protectometal-ciudad-mexico",
    "company": "Protectometal, S.A.",
    "productId": "elo",
    "country": "Mexico",
    "countryZh": "墨西哥",
    "city": "Ciudad de México",
    "latitude": 19.433,
    "longitude": -99.133,
    "fit": "可开发候选",
    "signal": "独立复读官方首页与公司历史：Protectometal 自行开发定制工业防腐体系、生产60–600 L批次及自有 PROTEC 品牌，所查目录为环氧、聚氨酯及其他工业防护成品涂料；不是仅靠施工服务推断制造。官方 Contact 明示 Planta CDMX 和公开邮箱/电话，街道地址未独立核验，地图为城市代表位置。对应 ELO TDS 涂料应用，可作潜在下游配方评估，未确认 ELO 的采购、使用、需求或相容性。Protectometal 与 PROTEC 是同一账户，不分别计数。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "发现后独立再次读取当前研发/制造原文、公司历史、完整产品分类和目录入口、公开厂区联系页。产品范围含成品工业防腐/防火涂层及 Promotores de Aherencia；这些类别与施工业务被保留，不将含原料相关词的类别直接判成 ELO/ESBO 原料外售。所查范围未发现环氧化植物油、生物增塑剂或同类增塑/稳定输入原料销售。完整分型号目录部分内容未公开展示，结论限实际可查业务和产品分类，不称穷尽核验。按 Protectometal, S.A./PROTEC、主站和产品子域、公开电话核对最新 main、本地及队列，仅有待审核研究项，无既有正式同一账户；不制造品牌或产品子站新增。具名采购/技术联系尚未核验，使用官方一般业务邮箱，不构造个人邮箱或采用旧第三方邮箱。"
    },
    "contact": {
      "label": "Official public general business inbox",
      "email": "contacto@protectometal.mx",
      "phone": "+52 55 5368 0347",
      "contactUrl": "https://protectometal.mx/contacto/"
    },
    "source": {
      "label": "Official own custom anticorrosive coating formulation and manufacturing, 60–600 L batches",
      "url": "https://protectometal.mx/"
    },
    "checkedAt": "2026-10-11",
    "legacyCompanyDescription": "成品工业/船舶涂料研发制造企业；ELO 配方适配及采购未确认"
  },
  {
    "id": "specialized-coating-systems-boksburg",
    "company": "Specialized Coating Systems (Pty) Ltd (SCS)",
    "productId": "elo",
    "country": "South Africa",
    "countryZh": "南非",
    "city": "Boksburg",
    "latitude": -26.18988,
    "longitude": 28.26466,
    "fit": "可开发候选",
    "signal": "发现后独立读取当前 About、工业防护、产品分类、矿物业务及 Contact 原文：SCS 自行研发涂料配方、经营制造设施和测试实验室，工业防护涂料为本地配方制造，含防腐、富锌底漆、耐化学品内衬、管道及海事防护；官方 Boksburg 联系页同时标明 Head Office / Manufacturing。作为 ELO TDS coatings 对应的潜在下游配方方，未确认 ELO 的采购、使用、需求或相容性。坐标由官方 Contact 披露的 GPS 度分秒换算。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立再次读取当前全部公开产品分类、实际工业防护描述、制造设施和联系页，并专门反查 GMA Specialty Minerals 类别。公开矿物范围为 ilmenite、pyroxene、rutile、稀土及磨料；设备类别中的 Polyurea & Polyurethane Foam Reactors 为应用设备，成品 polyurethane 涂料不是 ELO/ESBO 原料供应证明。所查业务未发现 ELO、ESBO、环氧化植物油、生物增塑剂或同类添加剂对外销售；保留矿物/磨料和设备销售事实，结论限所查公开范围。按法人全称、SCS/Speccoats、speccoats.co.za、Boksburg 地址及邮箱核对最新 main 的131家实际公开客户、本地和队列，无已有正式同一账户，仅有待审核研究项；品牌/产品分类与厂区不拆分为新增。未核验具名采购或研发人员，使用官方明确标注 Orders / Enquiries / Sales Department 的业务邮箱，不伪称采购联系人。"
    },
    "contact": {
      "label": "Official public Sales business inbox",
      "email": "enquiries@speccoats.co.za",
      "phone": "+27 11 552 0300",
      "contactUrl": "https://www.speccoats.co.za/contact.php"
    },
    "source": {
      "label": "Official own formulation, manufacturing facility and laboratory",
      "url": "https://www.speccoats.co.za/about-us.php"
    },
    "checkedAt": "2026-10-11",
    "legacyCompanyDescription": "成品工业/船舶涂料研发制造企业；ELO 配方适配及采购未确认"
  },
  {
    "id": "pv-paint-ho-chi-minh",
    "company": "Petro Vietnam Paint Joint Stock Company (PV PAINT)",
    "productId": "elo",
    "country": "Vietnam",
    "countryZh": "越南",
    "city": "Ho Chi Minh City",
    "latitude": 10.8231,
    "longitude": 106.6297,
    "fit": "可开发候选",
    "signal": "独立读取当前官方产品目录及2026年5月8日股东大会原文：PV PAINT 有自有 Song Than 3 涂料工厂及研发、生产/OEM业务，公开 EPOSHIN 环氧底漆、富锌防腐和面漆等成品海事/工业防护产品。对应 ELO TDS coatings 的潜在配方原料评估，未确认 ELO 的采购、使用或适配。官网披露当前 Ho Chi Minh City 办公及工厂行政地址，地图为城市代表位置。PVMR 与 Hai Phong Paint 是官方披露的大股东；2023 HPP 年报记载对 PV PAINT 持股31.21%，当前 HPP 成员页仍列为参股公司，并非将其误认成控股子公司。与 CMP 的技术/品牌合作保留，不把 CMP 品牌另计为新增。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "发现后独立重读2026股东大会、当前自有品牌/产品目录、工厂与联系原文；所见是成品环氧、聚氨酯、船舶/工业防护及 OEM 涂料。HPP年报注册经营范围含一般原料及设备业务，已保留此事实，未从宽泛原料字样直接推断 ELO/ESBO 供应；实际所查 PV PAINT 对外目录未发现 ELO、ESBO、环氧化植物油、生物增塑或同类添加剂销售，结论限公开范围。独立读取并渲染2023 HPP年报第22–23页，PV PAINT为31.21%参股账户；2026股东大会与当前成员分类交叉核对关系，历史比例不冒称2026实时比例。按法人名、PV PAINT、旧 Vinashin 名称、pvpaint.vn、PVMR/HPP/CMP与两地址核对最新 main 的131家实际公开客户，本轮未收录 HPP；未将控股公司品牌或同厂区拆为新增。现有 CMP 是另一个法人集团，合作/参股事实明确注明。具名总经理只用官网披露姓名职务，不把通用邮箱绑定为个人邮箱，不构造采购联系人。"
    },
    "contact": {
      "label": "Official public General business inbox",
      "email": "pvpaint@pvpaint.vn",
      "phone": "+84 28 3636 4751",
      "contactUrl": "https://pvpaint.vn/pv-paint-to-chuc-dai-hoi-dong-co-dong-thuong-nien-nam-2026/"
    },
    "source": {
      "label": "Official own marine/industrial manufacturing and current factory, 2026 AGM",
      "url": "https://pvpaint.vn/pv-paint-to-chuc-dai-hoi-dong-co-dong-thuong-nien-nam-2026/"
    },
    "checkedAt": "2026-10-11",
    "legacyCompanyDescription": "成品工业/船舶涂料研发制造企业；ELO 配方适配及采购未确认"
  },
  {
    "id": "soilmate-bangkok",
    "company": "บริษัท เพิ่มผลผลิต จำกัด (Soilmate / Mitr Phol Group)",
    "productId": "fertilizer-coating",
    "country": "Thailand",
    "countryZh": "泰国",
    "city": "Bangkok",
    "latitude": 13.7563,
    "longitude": 100.5018,
    "fit": "可开发候选",
    "signal": "独立读取2024年 Kasetsart University 原始研究论文第3页：บริษัท เพิ่มผลผลิต จำกัด 以 Soilmate 品牌实际生产 CRF，研究涉及2022/23年 Suphan Buri 甘蔗使用；同时独立读取当前官网27-9-14和24-9-14 CRF产品原文及母集团肥料业务/制造资料。属于控释肥制造潜在下游，包膜树脂类型、是否 PU/聚合物及我方原料适配、采购未确认；官网9个月释肥描述不改写为我方性能保证。按泰文原始法人名保留身份，未猜英文注册名。Mitr Phol 为集团关联；仅计泰国账户一个，老挝及中国厂区不拆分入库。地图为 Bangkok 总部所在城市代表位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立读取官方完整肥料产品导航、CRF分型号原文、原始田间研究、母集团肥料制造与联系栏目，并反查 Bio-Materials / Planex / CaneX 原文：另有包装用 compostable compounds 与食品包装，并非据此推断 PU 原料或肥料包膜树脂供应。所查范围未发现肥料包膜树脂、PU输入原料或同类包膜剂对外销售；普通46-0-0/18-46-0农用肥料销售不等同包膜输入原料同行。结论限可查范围。按泰文公司名、Soilmate、soilmate.co.th、Mitr Phol、Bangkok地址及公开集团邮箱核对最新main的131家实际公开客户，无同集团正式肥料账户；品牌、配方与境外/中国厂区不分别计数。官网制造/联系主页面直接请求受到验证页或超时影响，产品原文经公开网页读取工具获取，原始研究另下载、提取及渲染核查；不以HTTP 200验证页面冒充企业证据。公开邮箱从母集团Contact栏明示的编码还原，不猜测地址；电话为该栏公开业务号码，不推断具名采购职务。以当前产品页3楼为总部地址，母站2楼仅保留来源差异说明。"
    },
    "contact": {
      "label": "Official public General business inbox",
      "email": "soilmate@mitrphol.com",
      "phone": "+66 44 810 620",
      "contactUrl": "https://www.mitrphol.com/page_detail.php?p=6&topic=34"
    },
    "source": {
      "label": "Original Kasetsart University research, 2024, PDF page 3: Soilmate CRF manufacturer",
      "url": "https://so06.tci-thaijo.org/index.php/JSSP/article/download/268226/181520/1087443"
    },
    "checkedAt": "2026-10-11",
    "legacyCompanyDescription": "控释肥制造企业；包膜树脂类型及我方产品适配、采购未确认"
  },
  {
    "id": "kofarb-czestochowa",
    "company": "KOFARB Sp. z o.o.",
    "productId": "nl-w1201",
    "country": "Poland",
    "countryZh": "波兰",
    "city": "Częstochowa",
    "latitude": 50.8118,
    "longitude": 19.1203,
    "legacyCompanyDescription": "自主配方制造水性木材及多基材成品热反射涂料；NL-W1201 使用、采购及适配未确认",
    "fit": "可开发候选",
    "signal": "发现后独立读取当前官网 About、KOFATERM 原理、六类产品及 OUTDOOR PAINT：KOFARB 在波兰自行生产水性及溶剂型成品涂料，拥有生产设备和实验室；KOFATERM 明确为水性涂料/膏体，产品页明确可用于木材，OUTDOOR PAINT 明示 wooden surfaces。按 NL-W1201 TDS 已验证木材基材对应下游配方方；实际产品主要为建筑用多基材热反射成品涂料，不冒称家具专用漆，不外推 TDS 未验证基材适配。未确认购买或使用 NL-W1201，也未证明有特定附着力改进需求。坐标为城市代表位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立再次读取自主制造/实验室介绍、完整六类公开成品目录及各类产品原文、公司/分销/国际合作及业务联系页。所查是室内、室外、屋顶成品水性涂料与膏体；未发现对外销售水性聚烯烃乳液、CPO/PO分散体或同类附着力输入原料，结论限所查公开范围。按 KOFARB 法人、KOFATERM 品牌、kofarb.pl、Częstochowa 地址及邮箱与最新 main 的135家实际公开客户、本地与研究队列去重，无同一正式账户；KOFARB Distribution、Mazowsze及西班牙销售联系不拆为客户。官网 CEO Robert Koza 仅保留真实姓名职务，通用邮箱不绑定为个人邮箱；未猜测采购联系人。"
    },
    "contact": {
      "label": "Official public general business inbox",
      "email": "biuro@kofarb.pl",
      "phone": "+48 605 342 957",
      "contactUrl": "https://www.kofarb.pl/en/contact/"
    },
    "source": {
      "label": "Official own waterborne-paint manufacturing, machinery, laboratories and CEO",
      "url": "https://www.kofarb.pl/en/about-us/"
    },
    "checkedAt": "2026-10-11"
  },
  {
    "id": "kupsa-oyon",
    "company": "Industrias Químicas Kupsa, S.L. (KUPSA Group)",
    "productId": "nl-w1201",
    "country": "Spain",
    "countryZh": "西班牙",
    "city": "Oyón",
    "latitude": 42.5048,
    "longitude": -2.4369,
    "legacyCompanyDescription": "集团自有工厂与实验室研发制造水性木器成品涂料；树脂/半成品工厂历史已注明，NL-W1201 使用及采购未确认",
    "fit": "可开发候选",
    "signal": "独立读取西班牙官网 Wood Water-Based Products、R&D、法人 Legal Notice，以及波兰子公司当前 About 原文：集团有自有水性产品制造设施、研发与应用实验室，波兰工厂明确自行配方和生产水性木器清漆；当前产品为木器底漆/面漆、家具及地板成品配方。属于 NL-W1201 TDS 木材应用的潜在需求侧配方制造方，未确认使用、采购、适配或具体需求。按西班牙法人 CIF B01006766 和 Oyón 工厂建单一集团账户，波兰、墨西哥、印度、葡萄牙子公司与厂区不拆为新增；公开历史披露 Tintas Lacca、Barnipol、Industrias Carpo、Pinturas Ordesa 等并购及 Abehon/Alaba 品牌，纳入集团去重。地图为 Oyón 城市代表位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "发现后独立重读西班牙水性/成品产品导航、R&D、历史、法人和业务邮箱，并直接抓取波兰 About、Contact 及全部七个当前公开产品分页。所查目录为水性/溶剂型/UV木器成品涂料和底漆，未发现对外销售水性聚烯烃乳液、CPO/PO分散体或同类附着力原料，结论限所查公开范围。明确保留1998年树脂工厂和2001年中间产品制造区域等历史事实，不声称没有树脂制造，也不从未披露树脂类别推断其为同类聚烯烃供应商或全部仅内部自用。按集团/法人名、CIF、域名、工厂/邮箱，以及 Lacca、Barnipol、Ordesa、Isolack、Abehon、Alaba、Carpo 与最新main的135家实际公开客户、本地/队列去重，无正式同集团账户，多个国家子公司仅计一户。西班牙官网直接抓取证书失败，使用公开网页读取工具取得该官网原文，保留工具来源期间；波兰原文已于2026-10-11直接读取交叉核验。具名联系人为波兰子公司CEO而非西班牙采购人员，西班牙通用邮箱不绑定到该个人。"
    },
    "contact": {
      "label": "Official public general business inbox",
      "email": "webkupsa@kupsa.es",
      "phone": "+34 945 622 222",
      "contactUrl": "https://www.kupsa.es/en/legal-notice"
    },
    "source": {
      "label": "Official own Polish subsidiary water-based formulation and manufacturing plant",
      "url": "https://kupsa.pl/en/about-us"
    },
    "checkedAt": "2026-10-11"
  },
  {
    "id": "medal-paints-johannesburg",
    "company": "Medal Paints (Pty) Ltd",
    "productId": "elo",
    "country": "South Africa",
    "countryZh": "南非",
    "city": "Johannesburg",
    "latitude": -26.2041,
    "longitude": 28.0473,
    "fit": "可开发候选",
    "signal": "发现后独立再次读取官网 About、工业系列、环氧地坪漆、Steel Cladd 以及成品范围原文：Medal 在南非有自有配方研发实验室、制造设备及逐批测试；成品工业涂料包含用于工厂地坪与钢材的双组分环氧防护漆，以及防锈底漆等。对应 ELO TDS coatings 的潜在下游配方制造方，未确认采购、使用、具体需求或相容性。地图为 Johannesburg 城市代表位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-12",
      "conclusion": "独立重读当前制造/实验室、完整公开产品范围，以及 Panache、Premium、Quality、Professional Trade、Economy、Industrial、Primers/Undercoats、Steel Cladd、Waterproofing 成品类别。所见为成品涂料、底漆、配套施工材料及防水产品；聚氨酯成品漆、Epoxy Thinners、配套固化剂不直接推断为 ELO/ESBO 生物增塑原料。所查公开范围未发现 ELO、ESBO、环氧化植物油、生物增塑剂或同类添加剂对外销售，结论限所查范围。按法人 Medal Paints、medalpaints.co.za/medal.co.za、厂址、邮箱及品牌与最新 main 的139家实际公开客户、本地和私有队列去重，无同一正式账户；Panache/Safari/Melody/Steel Cladd 不拆成新增。未核验具名采购或研发人员，采用官方通用业务邮箱，不猜测个人邮箱。"
    },
    "contact": {
      "label": "Official public general business inbox",
      "email": "info@medal.co.za",
      "phone": "+27 86 006 3325",
      "contactUrl": "https://medalpaints.co.za/contact-us/"
    },
    "source": {
      "label": "Official own laboratory, R&D, formulation controls and manufacturing",
      "url": "https://medalpaints.co.za/about-medal-paints/"
    },
    "checkedAt": "2026-10-12",
    "legacyCompanyDescription": "成品工业/船舶涂料研发制造企业；ELO 配方适配及采购未确认"
  },
  {
    "id": "hesse-lignal-hamm",
    "company": "Hesse GmbH & Co. KG (Hesse Lignal)",
    "productId": "nl-w1201",
    "country": "Germany",
    "countryZh": "德国",
    "city": "Hamm",
    "latitude": 51.6739,
    "longitude": 7.815,
    "fit": "可开发候选",
    "signal": "发现后独立再次读取当前官网、About、Hydro Lacke、产品目录及法定信息：Hesse 自行研发生产水性木材及木质材料成品涂料，具备1K/2K水性木器漆体系和自有制造、创新技术业务。木材属于 NL-W1201 TDS 已验证基材，具有潜在下游配方评估逻辑；未证明实际使用、购买、需求或相容性。Hesse Beteiligungs GmbH 为法定普通合伙人，Hesse 各国子公司及 Hoba-Tec 作为集团关联标注并去重，不另拆为本轮新增。地图为 Hamm 城市代表位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-12",
      "conclusion": "独立读取当前自主研发制造说明、Hydro/UV/PUR/Beizen/Oils-Waxes 产品分类和产品检索、法定法人及集团分支导航；产品为配方成品涂料、木器底面漆、木材染色/表面处理及配套施工材料。目录的 Polyolefine PE/PP 是待涂基材筛选项，不误记为销售聚烯烃原料；成品附着力底漆不自动等同 CPO/PO 输入分散体。所查范围未发现水性聚烯烃乳液、CPO/PO分散体或同类附着力输入原料对外销售，结论限所查范围。按 Hesse GmbH & Co. KG、Hesse Lignal、hesse-lignal.com/de、Hesse Beteiligungs/Hoba-Tec/Benelux/Vernis/美国分支、Hamm 地址及邮箱核对最新main的139家实际公开客户、本地和研究队列，无正式同一集团账户。Waldemar Harnos 的姓名、技术支持职务和业务热线由产品页明示；未猜测具名邮箱，通用 info 邮箱不绑定给该个人。"
    },
    "contact": {
      "label": "Official public general business inbox",
      "email": "info@hesse-lignal.de",
      "phone": "+49 2381 963 00",
      "contactUrl": "https://www.hesse-lignal.com/impressum/"
    },
    "source": {
      "label": "Official own water-based wood-coating manufacture and formulation",
      "url": "https://www.hesse-lignal.com/"
    },
    "checkedAt": "2026-10-12",
    "legacyCompanyDescription": "水性木器成品涂料研发制造企业"
  },
  {
    "id": "ballance-tauranga",
    "company": "Ballance Agri-Nutrients Limited",
    "productId": "fertilizer-coating",
    "country": "New Zealand",
    "countryZh": "新西兰",
    "city": "Tauranga",
    "latitude": -37.6878,
    "longitude": 176.1651,
    "legacyCompanyDescription": "自行制造抑制剂包衣尿素；未确认 PU/聚合物包膜及我方原料适配、采购",
    "fit": "可开发候选",
    "signal": "发现后独立下载并提取2023年官方 Annual Review，渲染和目视核对 PDF第13页（印刷页24–25）：公司明确将自身新西兰制造的尿素和 SustaiN 列为产品；当前官网 SustaiN 与注册新闻确认产品含 AGROTAIN 脲酶抑制剂包衣，当前 Manufacturing 确认 Kapuni 尿素制造。属于有明确包衣产品和自制证据的潜在下游，未确认聚合物/PU树脂包膜或我方原料适配、采购，不把抑制剂包衣等同控释树脂膜。当前官网明确 Mount Maunganui 超磷酸盐制造已于2025年停止，地图点为 Tauranga 支持办公室城市代表位置，未将办公室标成仍生产的工厂。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-12",
      "conclusion": "独立重读当前农业全产品类别、SustaiN、制造设施、注册公告、Industrials、合作社业务和当前领导层。实际工业产品有尿素、GoClear尿素液、氨、硫酸、HFA等；尿素供木板树脂制造不等同 PU包膜输入原料，对外工业业务事实保留。所查范围未发现肥料包膜树脂、PU输入原料或同类肥料包衣剂对外销售，结论限所查范围。AGROTAIN是成品使用的第三方抑制剂品牌，不将其上游品牌另作客户或误作 Ballance 所有的原料公司。按法定公司名、Ballance合作社、SustaiN、Ballance域名、Tauranga/制造厂区及联系邮箱与最新main的139家实际公开客户、本地和研究队列去重，无同一正式账户；Kapuni/Awarua/支持办公室/品牌只计一户。2023制造报告与当前产品交叉核验，历史年度不冒称2026项目投产日。优先采用当前官网明示的 Sourcing & Supply 负责人 David Healy 及业务邮箱；不把其个人业务邮箱当通用部门收件箱。"
    },
    "contact": {
      "label": "Official public Sourcing & Supply executive business email",
      "email": "david.healy@ballance.co.nz",
      "phone": "+64 7 572 7900",
      "contactUrl": "https://ballance.co.nz/Our-People/?key=Specialisation&value=Leadership%20Team"
    },
    "source": {
      "label": "Original official 2023 Annual Review, PDF page 13: own New Zealand-manufactured SustaiN",
      "url": "https://ballance.co.nz/medias/BAL14055-Annual-Review-2023-website-FA.pdf?attachment=true&context=bWFzdGVyfHJvb3R8ODg5MzAyM3xhcHBsaWNhdGlvbi9wZGZ8YURRd0wyZzFNeTg1TmpBd05EUTVPVE0zTkRNNEwwSkJUREUwTURVMVgwRnViblZoYkY5U1pYWnBaWGRmTWpBeU0xOTNaV0p6YVhSbFgwWkJMbkJrWmd8NWViZGJkM2MzZGIzMzAzNDE1Y2I5ZmEwNzE2ZWZhOThkYzBmMjdiYTBmYmVhMzU1MmM2NmM1OTZkZjY0NzlhMg"
    },
    "checkedAt": "2026-10-12"
  },
  {
    "id": "berger-seidle-gruenstadt",
    "company": "Berger-Seidle GmbH (Berger Group)",
    "productId": "nl-w1201",
    "country": "Germany",
    "countryZh": "德国",
    "city": "Grünstadt",
    "latitude": 49.5649,
    "longitude": 8.1646,
    "fit": "可开发候选",
    "signal": "独立再次读取当前制造、研发、产品范围、法定信息和 AquaChoice SPORT B Mach One 原文：Berger 在自有生产区域配方制造木地板成品涂料，有研发和逐批质控；AquaChoice SPORT B Mach One 明确为双组分水性木地板成品面漆，AquaSeal为水性体系。木材属于 NL-W1201 TDS 已验证基材，实际使用、采购、需求和配方相容性未确认。官网明确 Berger-Lacke、Berger-Zobel 为同一关联品牌范围，不另计新增；地图为 Grünstadt 城市代表位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-12",
      "conclusion": "发现后独立重读当前研发、制造、完整产品导航、具体水性木地板漆、法定和联系原文；所见为成品木器涂料、胶黏剂、施工用底漆、木油与清洁维护产品。制造说明的原料/中间品仓储和质检不是对外供应聚烯烃分散体的证据；所查范围未发现水性聚烯烃乳液、CPO/PO分散体或同类附着力输入原料对外销售。按 Berger-Seidle/集团品牌、域名、法人、Maybachstraße地址及各联系邮箱与最新main的143家实际公开客户、本地/队列去重，无同集团正式账户；品牌和国外渠道不拆分。采用官方明确 Technical Service Team 的邮箱，管理人员只记录官网姓名职务，不绑定通用邮箱为个人邮箱。"
    },
    "contact": {
      "label": "Official public Technical business contact",
      "email": "beratungsteam@berger-seidle.de",
      "phone": "+49 6359 8005 320",
      "contactUrl": "https://berger-seidle.de/aquachoice-sport-b-mach-one/?lang=en"
    },
    "source": {
      "label": "Official own production facilities and batch formulation/quality control",
      "url": "https://berger-seidle.de/produktion-qualitaet-durch-technologie/"
    },
    "checkedAt": "2026-10-12",
    "legacyCompanyDescription": "水性木器成品涂料研发制造企业"
  },
  {
    "id": "mipa-essenbach",
    "company": "MIPA SE (Mipa Group)",
    "productId": "nl-w1201",
    "country": "Germany",
    "countryZh": "德国",
    "city": "Essenbach",
    "latitude": 48.6131,
    "longitude": 12.2198,
    "fit": "可开发候选",
    "signal": "独立再次读取当前公司、集团、完整产品范围、Mipa WBS Wetterschutzfarbe 与法定原文：MIPA集团在 Essenbach 及其他欧洲生产地点研发制造成品涂料；WBS Wetterschutzfarbe 明确为水性木材用底/面漆，另有 Rosner 木器成品涂料业务。木材属于 NL-W1201 TDS 已验证基材，仅作潜在下游配方评估，使用、采购、需求及适配未确认。所有集团厂区及 Rosner/Feycolor/Henelit/Herlac 等关联范围按同一账户去重。地图为 Essenbach 城市代表位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-12",
      "conclusion": "独立重读当前集团主体/厂区、汽车修补、工业、装饰、气雾、木器及非涂料配套产品分类，具体水性木材底面漆及法定/采购联系方式；所查是成品涂料、配套施工用品和设备，未发现水性聚烯烃乳液、CPO/PO输入分散体或同类附着力原料对外销售，结论限所查范围。按 MIPA SE/集团公司与 Rosner 等品牌、域名、注册地址及邮箱核对最新main的143家实际公开客户、本地/队列，无正式同集团账户，不把工厂/品牌拆户。官网 Purchase (Supplier) 明示公开邮件链接，以页面声明的编码向量还原 mailto，并核对公开 purchasing@ 前缀及域名；不是猜测邮箱。采购收件箱为部门邮箱，不构造具名采购人员。"
    },
    "contact": {
      "label": "Official public Procurement business contact",
      "email": "purchasing@mipa-paints.com",
      "phone": "+49 8703 9220",
      "contactUrl": "https://www.mipa-paints.com/en/contact/"
    },
    "source": {
      "label": "Official own development and manufacture at European production sites",
      "url": "https://www.mipa-paints.com/en/"
    },
    "checkedAt": "2026-10-12",
    "legacyCompanyDescription": "水性木器成品涂料研发制造企业"
  },
  {
    "id": "remmers-loeningen",
    "company": "Remmers GmbH (Remmers Group)",
    "productId": "nl-w1201",
    "country": "Germany",
    "countryZh": "德国",
    "city": "Löningen",
    "latitude": 52.7373,
    "longitude": 7.7594,
    "fit": "可开发候选",
    "signal": "独立读取当前 Remmers 自有研发原文：Löningen/Hiddenhausen 的专业团队研发水性及其他配方系统，明确木材与建筑表面处理开发；具体 Induline DW-601 Aqua Stopp 原文明示水性木材中间/面漆，属于 NL-W1201 TDS 木材应用的潜在配方方，实际使用、需求、购买和适配未确认。按 Remmers GmbH/集团建立单一账户，不另计分支、Hiddenhausen研发点或 Induline品牌；地图为 Löningen 城市代表位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-12",
      "conclusion": "发现后独立重读当前研发（含水性体系开发）、公司/法定、木器成品分类与产品检索、DW-601技术原文、供应商栏目和联系方式。所见为自有配方成品木器漆、建筑防护体系、施工用品及配套工具；“供应商”栏目实际为外部供货方联系/收货信息，不误认为 Remmers 对外销售聚烯烃输入原料。所查范围未发现水性聚烯烃乳液、CPO/PO分散体或同类附着力输入原料对外销售，结论限公开范围。按法人/集团、Remmers/Induline品牌、域名、地址和邮箱与最新main的143家实际公开客户、本地/队列去重，无同集团正式账户。公开具名业务联系为室内涂料销售负责人，职务保持原文，不伪称采购或研发负责人。"
    },
    "contact": {
      "label": "Official public Sales business contact",
      "email": "uboerger@remmers.de",
      "phone": "+49 5432 830",
      "contactUrl": "https://www.remmers.com/"
    },
    "source": {
      "label": "Official own R&D at Löningen/Hiddenhausen including water-based formulation systems",
      "url": "https://www.remmers.com/de/forschung-entwicklung"
    },
    "checkedAt": "2026-10-12",
    "legacyCompanyDescription": "水性木器成品涂料研发制造企业"
  },
  {
    "id": "teknos-helsinki",
    "company": "Teknos Oy (Teknos Group)",
    "productId": "elo",
    "country": "Finland",
    "countryZh": "芬兰",
    "city": "Helsinki",
    "latitude": 60.1699,
    "longitude": 24.9384,
    "legacyCompanyDescription": "自有工厂和研发体系的成品工业防护涂料配方制造企业；ELO 使用、采购和适配未确认",
    "fit": "可开发候选",
    "signal": "独立再次读取当前公司、创新研发、全球联系及工业成品原文：Teknos Oy 有芬兰 Helsinki/Rajamäki 自有涂料工厂，研发高性能工业防护涂料；INERTA 165 GF和INERTA300明确为防腐/耐化学品环氧成品配方，对应 ELO TDS coatings 潜在下游用途，未确认 ELO 使用、采购、需求或相容性。Teknos Group Oy 为母集团，海外分支和中国制造实体只作集团关联去重，不单独纳入客户或计数。地图为 Helsinki 城市代表位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-12",
      "conclusion": "发现后独立重读现行自有工厂/法人信息、集团 About/Innovation、工业完整应用分类、INERTA成品技术原文及公开联系。所查为成品工业/木器/装饰涂料；bio-based wood oil为成品木材涂饰方向，参与回收原料项目不直接等同 ELO/ESBO输入原料销售。所查范围未发现 ELO、ESBO、环氧化植物油、生物增塑剂或同类添加剂对外销售，结论限所查范围。按 Teknos Oy/Group Oy、瑞芬及其他集团关联域名、Finland工厂地址与研发/销售邮箱核对最新main的143家实际公开客户、本地/队列，无同集团正式账户，全球分支只计芬兰账户一个。研发邮箱由官方显式 pasi.virtanen [@]teknos.com 规范化，不猜测；Rajamäki sales邮箱为另一个同一芬兰公司公开销售入口，不绑定给具名研发经理。"
    },
    "contact": {
      "label": "Official public Technical business contact",
      "email": "pasi.virtanen@teknos.com",
      "phone": "+358 9 506 091",
      "contactUrl": "https://www.teknos.com/company/about-us/innovation/"
    },
    "source": {
      "label": "Official current Finnish legal company IDs, Helsinki and Rajamäki factories",
      "url": "https://www.teknos.com/industrial-coatings/teknos-companies-and-international-contacts/"
    },
    "checkedAt": "2026-10-12"
  },
  {
    "id": "dura-paints-edenvale",
    "company": "Dura Paints (Pty) Ltd",
    "productId": "elo",
    "country": "South Africa",
    "countryZh": "南非",
    "city": "Edenvale",
    "latitude": -26.1439,
    "longitude": 28.1529,
    "legacyCompanyDescription": "自有设施与实验室的成品工业防护涂料制造企业；ELO 使用、采购和配方适配未确认",
    "fit": "可开发候选",
    "signal": "发现后独立再次读取当前 About、制造设施、工业底面漆、配套与联系方式原文：Dura Paints 自行制造工业防护涂料，拥有生产设施和实验室；双组分 Epoxy Enamel、Heavy Duty Epoxy Primer 等用于钢材、混凝土及工业设备防护，对应 ELO TDS coatings 的潜在下游配方评估，未确认使用、需求、采购或适配。地图为 Edenvale 总部城市代表位置，制造设施页面另提 Modderfontein，不将地址混写为精确工厂坐标。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-12",
      "conclusion": "独立再次读取当前制造/实验室、工业底漆/面漆/溶剂、装饰漆、标线、ProLong以及表面处理/封闭剂类别和联系原文。所查溶剂为成品漆用稀释剂、ProLong为成品施工修补/防水/封闭/胶黏产品，工业colourant为调色产品；未发现 ELO、ESBO、环氧化植物油、生物增塑剂或同类添加剂销售，结论限所查范围。按南非法人、durapaints.co.za、Edenvale/Modderfontein、公开Orders邮箱、Dura Industrial/Wedgewood/ProLong/GoLine/Lifestyle品牌核对最新main的143家实际公开客户、本地/队列，无同一正式账户；曾待核验的同一Dura记录只更新，不另计同一来源。不同域名/法人 Dura Chemicals Inc 不仅因名字相似推断为关联；没有找到控制关系的证据。集团品牌/门店和厂区不拆户。使用官方总部Orders邮箱，不构造具名采购联系人。"
    },
    "contact": {
      "label": "Official public Sales business contact",
      "email": "orders@durapaints.co.za",
      "phone": "+27 11 452 5221",
      "contactUrl": "https://durapaints.co.za/contact/"
    },
    "source": {
      "label": "Official own industrial coating manufacture and technical laboratory",
      "url": "https://durapaints.co.za/about/about-dura-paints/"
    },
    "checkedAt": "2026-10-12"
  },
  {
    "id": "troforte-innovations-wangara",
    "company": "Troforte Innovations Pty Ltd (Langley Fertilizers / Sunpalm Australia)",
    "productId": "fertilizer-coating",
    "country": "Australia",
    "countryZh": "澳大利亚",
    "city": "Wangara (Perth)",
    "latitude": -31.9523,
    "longitude": 115.8613,
    "legacyCompanyDescription": "自制 Macracote 聚合物包衣控释肥的澳洲研发制造账户；Langley／Sunpalm／Troforte 品牌合并去重，PU 类型及我方原料适配未确认",
    "fit": "可开发候选",
    "signal": "发现后独立再次读取澳洲政府现行 ABN、官网制造/集团/全系列及联系原文，并下载原始 Macracote、Nitroforte PDF。Macracote 原始第2页经渲染核验，明确以聚合物组成的改性蜡与添加剂包覆 NPK 颗粒；当前 Sunpalm 官网列明 Wangara 自有研发制造设施与 Macracote 聚合物包衣CRF。Troforte 当前联系页明确自己是 Langley Fertilizers 制造方，原始 Nitroforte 第3页说明其与 Langley/Sunpalm 的业务关联。仅列为控释肥制造潜在下游，是否 PU、我方产品适配、实际需求及采购未确认。地图使用 Perth 城市代表位置，未声称工厂精确坐标。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-12",
      "conclusion": "独立重读当前肥料完整产品导航、Macracote/Typhoon/Troforte/Nitroforte原始资料、政府法人、集团 About、Premium Plastics 完整分类和业务联系。所查为成品颗粒/液体肥料、微生物产品、育苗盆袋等园艺成品；Nitroforte聚合氮是成品液体肥料，不据其resinous描述推断PU输入树脂供应。所查范围未发现包膜树脂、PU原料或独立肥料包膜剂对外销售，结论限可查范围。按 Troforte Innovations、Sunpalm Australia、Langley Fertilizers、Troforte/Macracote/Typhoon、三个关联域名、ABN、Wangara地址与官方邮箱核对最新main实际148家客户、本地和研究队列，无同一正式账户；三品牌/业务单元只计一个。两位技术支持人员的姓名、职务、商务手机号均来自现行官方联系页，未猜测个人邮箱，通用info邮箱不绑定个人。"
    },
    "contact": {
      "label": "Official public General business inbox",
      "email": "info@langleyfertilizers.com.au",
      "phone": "+61 8 9302 1633",
      "contactUrl": "https://www.trofortefarming.com.au/contact"
    },
    "source": {
      "label": "Official own Wangara R&D/manufacturing facility and Macracote polymer-coated CRF",
      "url": "https://www.sunpalmaustralia.com.au/about-us/"
    },
    "checkedAt": "2026-10-12"
  },
  {
    "id": "incitec-pivot-fertilisers-melbourne",
    "company": "Incitec Pivot Pty Ltd (Incitec Pivot Fertilisers; Ridley Group)",
    "productId": "fertilizer-coating",
    "country": "Australia",
    "countryZh": "澳大利亚",
    "city": "Melbourne",
    "latitude": -37.8136,
    "longitude": 144.9631,
    "legacyCompanyDescription": "自有系统生产 NBPT 抑制剂包衣尿素的澳洲肥料账户；现属 Ridley，未确认 PU／聚合物包膜及我方原料采购",
    "fit": "可开发候选",
    "signal": "发现后独立读取官网2025年8月21日塔斯马尼亚投资原文，明确 Scottsdale、Circular Head、Longford、Devonport 自有站点装有液体包衣系统，在出库前涂覆 Green Urea NV/eNpower；再读原始 Green Urea NV 配方说明，NBPT 经其共溶剂体系施加到尿素颗粒，100%澳洲制造。属于实际包衣尿素/包衣能力的潜在下游，抑制剂包衣不标为PU或聚合物包膜，我方原料适配、实际需求及采购未确认。政府ABN与现行供应商PDF v3确认运营法人 Incitec Pivot Pty Ltd，2025年9月30日由 Ridley 收购；旧母集团、旧 Limited 法人不沿用。地图为 Melbourne 城市代表位置，登记地区VIC3000，未核验总部街道，不把Tasmania站点当作该坐标。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-12",
      "conclusion": "独立读取当前 Products、Blends & Coatings、Trace Element Coatings、Nitrogen Retention、eNpower、Green Urea 技术原文、自有站点施加流程、Supplier页面、政府ABN和2026/06官网现行供应商PDF v3。公司有肥料进口分销业务，资格依据是自有肥料颗粒包衣生产和配方；普通尿素/磷钾/微量元素肥料销售不等同PU包膜输入原料。保留 eNpower 原文称其为 patented coating 的事实；当前系列是施于肥料颗粒的成品/内部涂覆业务，所查未见独立包膜剂、包膜树脂或PU原料对外销售，结论限所查范围。按 Incitec Pivot Pty Ltd、现行ABN、IPF、Ridley、EASY Liquids、两个关联官网、公开采购邮箱及Tasmania站点核对最新main实际148家客户、本地和研究队列，无同一正式账户；Ridley/IPF旗下品牌、站点和EASY Liquids不拆户。采购邮箱以官网ROT13公开属性还原并与页面percent-encoded显示字面交叉一致，不猜测，不采用财务发票邮箱作为采购联系。"
    },
    "contact": {
      "label": "Official public Procurement business inbox",
      "email": "procurement@incitecpivot.com.au",
      "phone": "1800 009 832 (Australia freecall)",
      "contactUrl": "https://www.incitecpivotfertilisers.com.au/about-us/supplying-incitec-pivot/"
    },
    "source": {
      "label": "Official own Tasmanian liquid coating systems applying Green Urea NV before dispatch",
      "url": "https://www.incitecpivot.com.au/news/latest-news/ipf-backs-tasmanian-producers-with-%2411m-investment/"
    },
    "checkedAt": "2026-10-12"
  },
  {
    "id": "pvcfc-ca-mau",
    "company": "Công ty Cổ phần Tổng công ty Phân bón Dầu khí Cà Mau (PVCFC / Phân Bón Cà Mau)",
    "productId": "fertilizer-coating",
    "country": "Vietnam",
    "countryZh": "越南",
    "city": "Cà Mau",
    "latitude": 9.1768,
    "longitude": 105.1524,
    "legacyCompanyDescription": "自制 NBPT/DCD 双抑制剂包衣 N46.Plus 尿素的越南肥料法人；Petrovietnam关联已注明，未确认PU／聚合物包膜",
    "fit": "可开发候选",
    "signal": "发现后独立读取当前N46.Plus产品与完整系列，明确尿素表面NBPT和DCD双保护涂层；下载并逐页读取原始TCCS05:2023/PVCFC revision09，PDF第5页明确由该公司制造，第7页经渲染核验明确在Cà Mau尿素工厂生产。另读2016原始投产报道的设备/产线证据与2026年9月23日股东大会，保留Petrovietnam成员关系及新增工业气体范围。仅作为包衣尿素制造潜在下游，非已确认PU/聚合物包膜，我方原料适配、需求或购买未确认。地图为Cà Mau城市代表位置，不作为工厂GPS。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-12",
      "conclusion": "独立再次读取当前完整单肥/NPK/有机/其他肥料及服务分类、N46.Plus原文、原始制造标准和2016投入设备产线新闻、2026股东大会的肥料/工业气体/相关化学品范围及官网招标、联系入口。一般petrochemical chemicals经营登记不直接推断其销售PU原料；所查实际产品范围未发现包膜树脂、PU输入原料或独立肥料包衣剂销售，结论限所查范围。按越文完整法人、PVCFC/Phân Bón Cà Mau/DCM、pvcfc.com.vn、总部及尿素工厂、业务邮箱核对最新main实际148家客户、本地和研究队列，无该正式法人或品牌。现有PVPAINT经PVMR/HPP参股，与PVCFC同有Petrovietnam关联，已明确保留；PVCFC是另一个有自有肥料工厂、独立法人/产品/域名/地址的运营账户，不是PVPAINT改名、品牌、子厂或新增地区分支，不重复添加Petrovietnam母集团、旗下肥料品牌或工厂。总经理姓名职务来自当前About页，未绑定通用邮箱为个人邮箱；公司业务contact与footer info以官网公开Cloudflare编码还原，举报邮箱未作为业务联系人收录。"
    },
    "contact": {
      "label": "Official public General business inbox",
      "email": "contact@pvcfc.com.vn",
      "phone": "+84 290 381 9000",
      "contactUrl": "https://www.pvcfc.com.vn/lien-he"
    },
    "source": {
      "label": "Official original N46.Plus2023 manufacturing standard rev09; PDF pages5 and7",
      "url": "https://www.pvcfc.com.vn/Data/Sites/1/media/fileattachment/%5Bsigned%5D05.-tccs-n46.plus-c%C3%A0-mau--rev9.pdf"
    },
    "checkedAt": "2026-10-12"
  },
  {
    "id": "verinlegno-massa-cozzile",
    "company": "Verinlegno S.p.A.",
    "productId": "nl-w1201",
    "country": "Italy",
    "countryZh": "意大利",
    "city": "Massa e Cozzile",
    "latitude": 43.9096,
    "longitude": 10.7493,
    "legacyCompanyDescription": "自有配方／制造的水性木器成品涂料账户；NL-W1201 使用、采购和配方适配未确认",
    "fit": "可开发候选",
    "signal": "独立再次读取当前自有制造原文、生产范围、具体木器面漆及法定/联系：Verinlegno 在 Massa e Cozzile 自有生产部门混配、检验、包装木器成品涂料，明确独立水性漆生产部门与自有研发实验室；IDRO FINISH、IDROMAT 等原文明示为外用木材的水性成品填孔/面漆。对应 NL-W1201 TDS 木材应用的潜在下游配方评估，实际使用、需求、采购及适配未确认。地图为城市代表位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-12",
      "conclusion": "独立读当前 History/生产范围/完整产品分类、外用水性面漆、Binders/Converter原始栏目及联系法人；该栏目实际列 N600/N710 填孔剂和水性成品清漆，并未因栏目名称推断PO输入树脂供应。所查为木材/金属/玻璃成品漆、调色及涂装配套；未发现水性聚烯烃乳液、PO/CPO分散体或同类附着力输入原料外售，结论限所查公开范围。按法人、VAT、域名、Massa e Cozzile 地址、官方邮箱、产品品牌核对最新main实际151家及本地/队列，无正式同一账户。海外销售渠道和产品系列不拆分，不猜个人/采购邮箱；采用官方一般业务入口。"
    },
    "contact": {
      "label": "Official public General business inbox",
      "email": "info@verinlegno.it",
      "phone": "+39 0572 92711",
      "contactUrl": "https://www.verinlegno.it/en/contacts/contact-where-we-are/"
    },
    "source": {
      "label": "Official own formulation/manufacture and water-based production department",
      "url": "https://www.verinlegno.it/en/company/history-philosophy/"
    },
    "checkedAt": "2026-10-12"
  },
  {
    "id": "fiddes-cardiff",
    "company": "Fiddes & Son Ltd",
    "productId": "nl-w1201",
    "country": "United Kingdom",
    "countryZh": "英国",
    "city": "Cardiff",
    "latitude": 51.4816,
    "longitude": -3.1791,
    "legacyCompanyDescription": "自有配方／制造的水性木器成品涂料账户；NL-W1201 使用、采购和配方适配未确认",
    "fit": "可开发候选",
    "signal": "发现后独立再次读取当前 About、具体 Wood Varnish、完整系列、化学/溶剂栏目及联系原文：Fiddes 在自有专用设施实际生产木器涂饰产品，Wood Varnish 是水性PU/丙烯酸成品配方，用于木地板、家具和室内木构件。木材属于 NL-W1201 TDS 已验证基材，属于潜在配方方，实际采购、使用、需求和适配未确认。地图为 Cardiff 城市代表位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-12",
      "conclusion": "独立再次读自有制造、Wood Varnish、完整产品目录及原始化学/溶剂栏目，后者公开7项白电油、finishing/methylated spirits、除漆剂、液体催干剂、家具修复和刷具清洁品；保留这些配套/输入产品事实，不将催干剂等同PO附着力输入材料。所查未发现水性PO乳液、CPO/PO分散体或同类附着力输入原料外售，结论限公开范围。原生栏目返回29字校验页，不当作证据；官方正文经公开网页读取工具另独立读到并私有留档。按 Fiddes & Son Ltd、fiddes.co.uk、Cardiff厂址、技术/销售邮箱与最新main151家、本地/队列去重，无同一正式账户；渠道和产品不拆户。官网明确 Technical Support 的support邮箱优先，不构造具名研发/采购者。"
    },
    "contact": {
      "label": "Official public Technical business inbox",
      "email": "support@fiddes.co.uk",
      "phone": "+44 29 2034 0323",
      "contactUrl": "https://fiddes.co.uk/contact/"
    },
    "source": {
      "label": "Official own purpose-built wood-finish manufacturing facility",
      "url": "https://fiddes.co.uk/restores-revives-protects/"
    },
    "checkedAt": "2026-10-12"
  },
  {
    "id": "morrells-stockport",
    "company": "Morrells Woodfinishes Ltd (RPM International)",
    "productId": "nl-w1201",
    "country": "United Kingdom",
    "countryZh": "英国",
    "city": "Stockport",
    "latitude": 53.4106,
    "longitude": -2.1575,
    "legacyCompanyDescription": "自有配方／制造的水性木器成品涂料账户；NL-W1201 使用、采购和配方适配未确认",
    "fit": "可开发候选",
    "signal": "独立读当前公司制造/开发原文、Waterborne Interior Lacquers、技术支持及法定联系：Morrells 自行制造高性能木器涂料并做专门配方开发；水性木器系列包含用于木材的水性底漆、清漆、面漆。对应 NL-W1201 TDS 木材的潜在配方评估，实际使用、购买、需求或适配未确认。当前官网明确属于 RPM International；全国分支、Sprayshop及xerofire/omnia等品牌仅作关联，不计新增。地图为 Stockport 城市代表位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-12",
      "conclusion": "独立读完整Wood Finishes、金属/其他涂料和Sprayshop配套分类、自有制造与水性木器分型号、技术联系、Terms，以及目录中 Epoxyshield Maxx+Additive 原文；R200.0.7明示Antislip Additive，不按additive字样误判为PO附着力输入剂。所查是成品木器/工业漆、涂装配套和成品胶，未发现水性PO乳液、CPO/PO输入分散体或同类附着力原料销售，结论限所查范围。按法人、Morrells/RPM、品牌和域名、Stockport厂址及邮箱核对最新main151家、本地/队列，无同集团正式账户；RPM关联品牌、全国/海外分支不拆户。官网技术支持提供电话转接，hello仍记为一般业务邮箱，不冒称专门技术邮箱或具名采购。"
    },
    "contact": {
      "label": "Official public General business inbox",
      "email": "hello@morrells.co.uk",
      "phone": "+44 161 406 5300",
      "contactUrl": "https://www.morrells.co.uk/contact-us/"
    },
    "source": {
      "label": "Official own wood-coating manufacture and bespoke formulation development",
      "url": "https://www.morrells.co.uk/about-us/company-info/"
    },
    "checkedAt": "2026-10-12"
  },
  {
    "id": "mylands-london",
    "company": "John Myland Ltd (Mylands)",
    "productId": "nl-w1201",
    "country": "United Kingdom",
    "countryZh": "英国",
    "city": "London",
    "latitude": 51.5074,
    "longitude": -0.1278,
    "legacyCompanyDescription": "自有配方／制造的水性木器成品涂料账户；NL-W1201 使用、采购和配方适配未确认",
    "fit": "可开发候选",
    "signal": "发现后独立读当前 About、具体成品涂料/完整finish分类、原始使用资料、联系及法律条款：John Myland Ltd 在London制造成品漆和木器涂饰；当前 Plant-based Multi-surface Paints 明确为木材及金属用水性面漆，另有水性木地板漆。木材属于NL-W1201 TDS基材，仅作潜在下游配方评估，实际采购、使用、需求与适配未确认；不将metal泛化为所有金属应用。地图为London城市代表位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-12",
      "conclusion": "独立读当前制造、全部finish/木饰涂装范围、明确木材水性面漆与Floor Paint原文、contact和John Myland Ltd现行法律条款。所查是成品墙漆/木器多基材/地坪漆、底漆、木油和涂装配套；plant-based说明成品涂料方向，不直接等同原料PO/CPO销售。所查未发现水性聚烯烃乳液、PO/CPO分散体或同类附着力输入原料外售，结论限公开范围。按John Myland/Mylands、域名、Rothschild地址及Sales/Info邮箱核对最新main151家、本地和队列，无正式同一账户；地域商店、颜色、品牌和wood finishes系列不拆分。未找到当前公开具名采购或专门研发邮箱，采用官网明确sales收件箱，法律条款Info只记一般业务联系方式。"
    },
    "contact": {
      "label": "Official public Sales business inbox",
      "email": "sales@mylands.com",
      "phone": "+44 20 8670 9161",
      "contactUrl": "https://mylands.com/pages/contact"
    },
    "source": {
      "label": "Official own London paint and polish manufacture",
      "url": "https://mylands.com/pages/about-mylands-1"
    },
    "checkedAt": "2026-10-12"
  },
  {
    "id": "rustins-london",
    "company": "Rustins Limited",
    "productId": "nl-w1201",
    "country": "United Kingdom",
    "countryZh": "英国",
    "city": "London",
    "latitude": 51.5074,
    "longitude": -0.1278,
    "legacyCompanyDescription": "自有配方／制造的水性木器成品涂料账户；NL-W1201 使用、采购和配方适配未确认",
    "fit": "可开发候选",
    "signal": "发现后独立读取官方Corporate制造、品牌及注册资料、具体Quick Dry Polyurethane Varnish/Floor Varnish、完整产品和联系原文。Rustins 在NorthLondon自有工厂配方生产木器成品；当前聚氨酯清漆明示水性、木材用，Floor Varnish也明示水性。对应NL-W1201 TDS木材基材的潜在下游配方评估，未确认使用、需求、购买或适配。注册号按官网162273保留，不猜采购人。原生站点403，官方正文经公开网页读取工具独立取得并私有保存；不以失败页面当证据。地图为London城市代表位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-12",
      "conclusion": "独立读当前企业制造及完整品牌、公司注册、木器水性成品技术和整体产品分类；Thixofix为成品接触胶，Bondaglass关联复合树脂/填料业务保留，不把全公司声称为无原料业务。所查范围未见NL同类水性PO乳液、CPO/PO输入分散体或附着力输入原料销售，结论限可查范围。按Rustins Limited、注册号、rustins.ltd/rustins.co.uk、Waterloo厂址与邮箱，以及Briwax/Antiquax/Wudcare/Bondaglass/Heldite等品牌核对最新main151家、本地/队列，无同一正式账户；品牌只计一个账户，不与名称相近的Rust-Oleum/RPM仅因Rust字样混为一家公司。未核验公开具名采购或研发人员，采用官方info业务入口，不推邮箱模式。"
    },
    "contact": {
      "label": "Official public General business inbox",
      "email": "info@rustins.co.uk",
      "phone": "+44 20 8450 4666",
      "contactUrl": "https://www.rustins.ltd/contact"
    },
    "source": {
      "label": "Official own North London manufacturing and formulations",
      "url": "https://www.rustins.ltd/"
    },
    "checkedAt": "2026-10-12"
  },
  {
    "id": "ivm-chemicals-parona",
    "company": "IVM Chemicals S.r.l. (IVM Group: Milesi / Ilva / Croma Lacke)",
    "productId": "nl-w1201",
    "country": "Italy",
    "countryZh": "意大利",
    "city": "Parona",
    "latitude": 45.28,
    "longitude": 8.75,
    "legacyCompanyDescription": "自有配方／制造的水性木器成品涂料账户；NL-W1201 使用、采购和配方适配未确认",
    "fit": "可开发候选",
    "signal": "发现后独立读取当前集团制造/产品/品牌原文、Milesi Green水性木器系列及原始法人设施PDF：IVM Chemicals在Parona自有厂区制造木器成品漆，明确专门水性产品生产区域；全系列明示室内/外水性木器成品。原始设施文件第1页确认IVMChemicalsS.r.l.和Parona地址。对应NL-W1201 TDS木材的潜在配方评估，实际使用、需求、采购、适配未确认。Milesi/Ilva/CromaLacke/Intercoating及各集团厂区按一个账户；地图采用Parona市镇代表位置，不是工厂GPS。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-12",
      "conclusion": "独立读集团完整Products、经营结构与生产、Milesi当前具体Green系列、官方设施法人PDF和Group Contacts。保留集团Intercoating的上游液体树脂与PU弹性体业务；官网具体列为不饱和聚酯/醇酸树脂及PU弹性体/胶，不将其遗漏或泛称集团无原料供应。在NL-W1201同类输入范围，所查未发现水性PO乳液、CPO/PO输入分散体或同类附着力原料外售，结论限所查材料/产品范围，不据此扩张为ELO账户。按IVMChemicals/IVM、Milesi/Ilva/CromaLacke/Intercoating、域名、VAT、Parona厂址及集团邮箱核对最新main151家、本地/队列，无同一正式集团账户；法国/西班牙/德国/美国实体及品牌不拆户。Group邮箱与号码由官方Contacts明示，标注为集团办公室，不冒称Parona直线或个人采购；Milesi另提供官方技术咨询表单，未提交。"
    },
    "contact": {
      "label": "Official public General business inbox",
      "email": "ivm@ivmgroup.com",
      "phone": "+39 02 430 221 (group business office)",
      "contactUrl": "https://www.ivmgroup.com/en/requests/new"
    },
    "source": {
      "label": "Official own Parona manufacture and dedicated water-based production",
      "url": "https://www.ivmgroup.com/en/pages/162-production"
    },
    "checkedAt": "2026-10-12"
  },
  {
    "id": "bedec-dunmow",
    "company": "Bedec Products Ltd (BEDEC)",
    "productId": "nl-w1201",
    "country": "United Kingdom",
    "countryZh": "英国",
    "city": "Dunmow",
    "latitude": 51.8739,
    "longitude": 0.3625,
    "legacyCompanyDescription": "自有研发制造的水性木器成品涂料账户；NL-W1201使用、采购及配方适配未确认",
    "fit": "可开发候选",
    "signal": "独立再次读取自有制造、完整成品范围、MSV产品、All Prime原始PDF及联系原文：BEDEC在Essex自有工厂制造涂料并做研发；MSV明确为水性丙烯酸/PU成品清漆，适用木材；All Prime原始资料明确水性木材底漆并确认Bedec Products Ltd法人及Dunmow地址。木材属于NL-W1201 TDS基材，仅作潜在配方评估，实际需求、采购、使用及适配未确认。地图为Dunmow城市代表位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-12",
      "conclusion": "独立再次读公司自有制造、完整Products以及MSV和All Prime原文。公开范围是成品多基材漆、木材清漆、水性底漆、墙漆/地坪漆和硅胶收边工具；All Prime为可直接施工的成品底漆，不按bond coat字样误作原料附着促进剂。所查未发现水性PO乳液、PO/CPO输入分散体或同类附着力原料对外销售，结论限所查公开范围。按BEDEC/Bedec Products Ltd、bedec.co.uk、Dunmow/Poplars地址及info邮箱核对最新main158家、本地和私有队列，无同一正式账户；系列、品牌和经销店不拆户。info为公开一般业务邮箱，未构造具名采购/技术人或专门技术邮箱。"
    },
    "contact": {
      "label": "Official general business inbox; no named technical/procurement person inferred",
      "email": "info@bedec.co.uk",
      "phone": "+44 1279 876657",
      "contactUrl": "https://bedec.co.uk/contact-us/"
    },
    "source": {
      "label": "Official own Essex manufacturing and ongoing research and development",
      "url": "https://bedec.co.uk/product/multi-surface-paint/"
    },
    "checkedAt": "2026-10-12"
  },
  {
    "id": "polyvine-cheddar",
    "company": "Polyvine Limited",
    "productId": "nl-w1201",
    "country": "United Kingdom",
    "countryZh": "英国",
    "city": "Cheddar",
    "latitude": 51.275,
    "longitude": -2.7766,
    "legacyCompanyDescription": "自有研发制造的水性木器成品涂料账户；NL-W1201使用、采购及配方适配未确认",
    "fit": "可开发候选",
    "signal": "独立再次读取2026公司制造原文、当前2K-POLY86、Exterior Wood Varnish原始PDF、两个完整范围及联系：Polyvine在Cheddar自有场地研究、开发并制造水性清漆/涂层，实验室、厂区与总部同址；2K-POLY86明确为木地板及室内木材用双组分水性PU成品；原始Exterior Wood Varnish资料明确外用木材水性丙烯酸混合成品。对应NL-W1201 TDS木材基材的潜在配方评估，实际购买、需求、使用及适配未确认。地图为Cheddar市镇代表位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-12",
      "conclusion": "独立读制造/家族公司原文、完整Trade及Decorative Effects范围、当前木器水性成品、原始外用清漆技术资料和Contact。保留色浆、装饰调色/釉、木油、成品胶、清洁去漆剂及施工工具事实，不泛称无其他配套材料。所查未发现水性PO乳液、PO/CPO输入分散体或同类原料附着力促进剂对外销售，结论限所查公开范围。按Polyvine Limited、Polyvine Trade/Decorative/Craft关联品牌、polyvine.com/polyvine.co.uk、Cheddar/Vine House地址及info邮箱核对最新main158家、本地和私有队列，无同一正式账户；产品线、渠道和品牌按一个账户。BS27地址来自当前官网，PDF解析中B527不作为现行邮编。info仅记一般业务邮箱，不编造具名研发/采购人。"
    },
    "contact": {
      "label": "Official general business inbox; no named technical/procurement person inferred",
      "email": "info@polyvine.co.uk",
      "phone": "+44 1934 740305",
      "contactUrl": "https://polyvine.com/contact-us/"
    },
    "source": {
      "label": "Official 2026 own water-based formulation/manufacturing laboratory and factory in Cheddar",
      "url": "https://polyvine.com/national-manufacturer/"
    },
    "checkedAt": "2026-10-12"
  },
  {
    "id": "vital-agri-nutrients-lahore",
    "company": "Vital Agri Nutrients (Pvt) Ltd (VAN)",
    "productId": "fertilizer-coating",
    "country": "Pakistan",
    "countryZh": "巴基斯坦",
    "city": "Lahore (city-level business marker)",
    "latitude": 31.5204,
    "longitude": 74.3587,
    "legacyCompanyDescription": "自有商业化硫包衣尿素线及肥料代工制造企业；未确认PU包膜及我方产品使用/采购/适配",
    "fit": "可开发候选",
    "signal": "发现后独立重新读取VAN自有工厂、具体Vital Urea、完整品牌/工程能力及公司原文：工厂明确商业化硫包衣尿素生产，直接对应Vital Urea；另有微量元素包衣及混配生产。其硫包衣尿素与我方TDS尿素包衣应用相连，可作潜在配方原料评估；未确认采用PU/聚合物包膜、使用、需求、采购或我方材料适配。新NP线在官网仅为未开始规划，不作为投产/产能证据。地图为Lahore城市业务位置，非厂区GPS。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-12",
      "conclusion": "独立再次读VAN完整23品牌及NP系列、工厂5条生产线、工程能力和公司法人/具名业务联系原文。所查为硫包衣尿素、微量元素包衣肥、NP/NPK、液肥、腐植酸土壤营养品等成品及其代工；保留腐植酸生产/销售和SOP贸易事实，不泛称无其他原料/贸易业务。公开Humi Grow用途为土壤营养/施肥，未见将其作为肥料包衣输入剂销售；所查未发现包衣树脂、PU输入原料或同类肥料包衣剂对外销售，结论限所查公开范围。官网双层包衣仅在开发，不冒称已量产PU线。按Vital Agri Nutrients/VAN/Vital Green/Agri Centers、van.com.pk、办公室/工厂地址、info及Fahim业务邮箱核对最新main160家、本地和私有队列，无同一正式账户；自有/代工品牌、经销点及新NP项目只计一个公司。没有从董事同名推断Engro等集团控制关系。官网明确Fahim Asghar为Research & development栏目的Lead, Plant and Product及业务邮箱，职务按原文保留，不改称采购经理。"
    },
    "contact": {
      "label": "Official public general business inbox; technical routing available where specifically published",
      "email": "info@van.com.pk",
      "phone": "+92 42 35762215",
      "contactUrl": "https://www.van.com.pk/about.html"
    },
    "source": {
      "label": "Official own commercial sulfur-coating manufacturing line behind Vital Urea",
      "url": "https://www.van.com.pk/partner/manufacturing.html"
    },
    "checkedAt": "2026-10-12"
  },
  {
    "id": "mahadhan-agritech-pune",
    "company": "Mahadhan AgriTech Limited (formerly Smartchem Technologies; DFPCL group)",
    "productId": "fertilizer-coating",
    "country": "India",
    "countryZh": "印度",
    "city": "Pune (city-level headquarters marker)",
    "latitude": 18.5204,
    "longitude": 73.8567,
    "legacyCompanyDescription": "自有Smartek包衣NPK复合肥制造企业；公开为有机碳/矿物质包衣，未确认PU包膜及我方产品使用/采购/适配",
    "fit": "可开发候选",
    "signal": "发现后独立重新读取MAL法人/更名前称、自有Taloja NPK制造、Smartek具体产品及原始FY2024-25/FY2025-26年报。Smartek明确每个肥料颗粒包衣，涂层富含有机碳和矿物质；最新年报确认当前MAL Crop Nutrition业务及Smartek产品，不将旧TAN网页当作当前MAL产线。对应我方TDS包衣复合肥应用，可供潜在原料配方评估；未确认PU/聚合物包膜、缓控释性能、使用、采购需求或我方材料适配。地图为Pune城市总部位置，非Taloja厂区GPS。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-12",
      "conclusion": "独立核对MAL完整农作物营养产品、自有制造原文和DFPCL FY2025-26原始年报PDF第7、8、37、40、95页完整业务范围，第7页已渲染核对三列产品归属。集团保留硝酸/IPA及药用溶剂/氨/CO2等工业原料业务，另有采矿用硝酸铵；Pickbrite为钢材酸洗添加剂，不能笼统宣称集团不卖任何原料或添加剂。所查公开产品为NP/NPK、硫、水溶肥/微量元素等肥料成品，未发现对外销售肥料包衣树脂、PU输入料或同类包衣剂，结论限所查公开范围。MAL FY2024-25年报明确2024-08-01重组生效、TAN转至DMSL，旧TAN站页不作当前主体证据。原始母公司年报来自公开索引的一方uat.dfpcl.com，属报告原文，未访问或确认QIP认购材料。按Mahadhan/MAL/Smartchem/STL/DFPCL/Deepak集团、两官网域名、Sai Hira总部/Taloja厂区、公开个人业务邮箱查最新main161家和本地/私有队列，无相同正式账户；品牌、改名主体和集团只计一个公司，不把地区办公室/经销商另计。Mahem Dwivedi职务按Crop Nutrition联系页原文AVP – Sales & Marketing Support保留，不改称技术或采购负责人。example@gmail.com及+0744-9999为页头占位，排除；rohan.tambe邮箱不推断姓名、职务，不作为具名联系人。"
    },
    "contact": {
      "label": "Official expressly named crop-nutrition commercial business contact",
      "email": "mahem.dwivedi@dfpcl.com",
      "phone": "+91 20 66458171",
      "contactUrl": "https://www.mahadhanagritech.com/contact"
    },
    "source": {
      "label": "Official Smartek coated NPK granules: organic-carbon and mineral coating",
      "url": "https://mahadhan.co.in/product-portfolio/value-added-npk-fertilizers-online/"
    },
    "checkedAt": "2026-10-12"
  },
  {
    "id": "axalta-philadelphia",
    "company": "Axalta Coating Systems Ltd. (Axalta group)",
    "productId": "elo",
    "country": "United States",
    "countryZh": "美国",
    "city": "Philadelphia (city-level headquarters marker)",
    "latitude": 39.9526,
    "longitude": -75.1652,
    "legacyCompanyDescription": "自有工业成品防腐涂料研发制造集团；法定注册Bermuda、总部美国；ELO配方适配、使用及采购未确认",
    "fit": "可开发候选",
    "signal": "发现后独立再次读取Axalta当前Corroless成品防腐涂料、完整工业产品/配方范围、供应商业务入口和原始FY2025 Form10-K。年报明确自行开发制造工业液体/粉末涂料并从外部供应商采购树脂/颜料/溶剂/单体/异氰酸酯/添加剂；Corroless对应铁钢结构及油气/污水/罐区防腐用途。ELO TDS确认涂料大类，可作潜在配方原料评估；不声称ELO在其防腐体系已适配、已使用或有采购需求。集团只计一个账户；Bermuda为母公司法定注册地，公开总部/业务位于Philadelphia，美国地图点为城市代表位置，非具体厂区GPS。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-12",
      "conclusion": "独立重读Axalta FY2025原始Form10-K的完整Performance/Mobility业务、工业成品品牌和KEY RAW MATERIALS章节（PDF第5/6/7/9/10页），并重读当前Corroless、工业全产品/配方及当前公司/供应商网页。所查为成品液体/e-coat/粉末涂料、修补用配套品及实际外购配方输入料，未发现对外销售ELO、ESBO、环氧化植物油或同类生物增塑输入添加剂，结论限所查公开范围，不泛称没有其他配套业务。原始报告明确涂料自有制造及全球外购原料，并未披露采购ELO、替代计划或具体需求，不能从其异氰酸酯采购推定PU原料销售。按Axalta/Corroless/Imron/Corlar/Tufcote/PercoTop/Alesta/Plascoat等集团品牌、法人、官网域名、Philadelphia地址和公开供应商邮箱比对最新main162家/本地/私有队列，无同一Axalta正式账户，品牌/子公司/工厂不拆分。既有SCHRAMM/AkzoNobel关联项已识别；当前双方合并页、8月5日公告和更近8月31日董事安排仍为拟议交易/交割条件，最新官方新闻目录也已复读，不把股东批准或未来董事名单当作已交割。记录拟议关联，交易交割后需重新集团归并检查。实际法律主体Axalta Coating Systems Ltd.注册Bermuda，总部美国Philadelphia，Glen Mills旧业务地址不冒称当前全球总部。采用官网明确supplier-info供应商入口，不收IR/媒体邮箱，不虚构具名采购/技术人员。"
    },
    "contact": {
      "label": "Official expressly disclosed prospective supplier business entry",
      "email": "supplier-info@axalta.com",
      "phone": "+1 855 547 1461",
      "contactUrl": "https://www.axalta.com/corporate/en_US/contacts.html"
    },
    "source": {
      "label": "Official current Corroless finished protective-coating formulation and iron/steel applications",
      "url": "https://www.axalta.com/liquidindustrial_us/en_US/Products/corroless.html"
    },
    "checkedAt": "2026-10-12"
  },
  {
    "id": "paradeep-phosphates-bhubaneswar",
    "company": "Paradeep Phosphates Limited (PPL; Zuari–OCP / Adventz association)",
    "productId": "fertilizer-coating",
    "country": "India",
    "countryZh": "印度",
    "city": "Bhubaneswar (registered-office city marker)",
    "latitude": 20.2961,
    "longitude": 85.8245,
    "legacyCompanyDescription": "自产苦楝油包衣尿素企业；PPL/MCFL/原Zuari Goa合并为一账户，保留与Chambal的集团关联；未确认PU包膜或采购",
    "fit": "可开发候选",
    "signal": "独立重读官网自产Jai Kisaan Navratna苦楝油包衣尿素、Goa自有尿素制造与最新FY2025-26原始年报。PPL已整合MCFL及相关Mahad资产，按一个PPL法人收录；不把旧制造页两厂、季度资料三厂当作最新完整四单位范围。TDS尿素包衣应用支持潜在原料评估，苦楝油涂层不证明PU/聚合物包膜、我方材料适配、当前使用或采购。与Chambal有共同Zuari/Adventz背景，但原始年报显示不同法人、控制链、制造及公开业务入口。地图为Bhubaneswar注册城市，非工厂GPS。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-12",
      "conclusion": "核对PPL最新323页FY2025-26原始年报、完整产品页和合并MCFL工业产品原文。公司确有肥料成品、磷酸/硫酸/氨/HFSA/石膏/ABC及SNF原料业务，不能宣称不销售任何原料；MCFL ChemCF SNF原文为混凝土减水/分散输入，所查范围未发现肥料包衣树脂、PU输入料或同类肥料包衣剂对外供应，结论限公开范围。关联Zuari官网仍含合并前持股/子公司描述，采用2026年报和2026-06-30股权表；OCP相关业务与交易按原始年报记录为磷矿、磷酸及肥料。PPL控股方Zuari Maroc为Zuari Agro与OCP合资；Chambal是现有独立上市法人，其最新年报子公司/合资清单没有PPL。保留共同Zuari/Adventz及共任董事关联，不声称双方没有任何关系；PPL独立制造、采购负责人和公司邮箱与Chambal Gadepan法人/采购邮箱不同，非改名新增。MCFL/Mangala、Jai Kisaan Navratna、原Zuari Goa及Mahad资产并入同一PPL账户，均不另外计数。PPL年报明确CIN由L24129OR1981PLC001020变更为L20122OR1981PLC001020，属于分类编码变更，不是新法人。按全部别名/法人/域名/办公及厂址/邮箱核对main164家和研究队列无既有PPL；采购负责人Raj Kumar Gupta仅存公开姓名职务，无个人邮箱，CorpAffairsBBSR@adventz.com保留一般公司入口，不归给个人。"
    },
    "contact": {
      "label": "Official general corporate business inbox; procurement recipient is not individually attributed",
      "email": "CorpAffairsBBSR@adventz.com",
      "phone": "+91 674 6666100",
      "contactUrl": "https://www.paradeepphosphates.com/contact-us"
    },
    "source": {
      "label": "Official own Jai Kisaan Navratna neem-coated urea product",
      "url": "https://www.paradeepphosphates.com/brands-and-products"
    },
    "checkedAt": "2026-10-12"
  },
  {
    "id": "toros-agri-istanbul",
    "company": "Toros Tarım Sanayi ve Ticaret A.Ş. (Toros Agri; Tekfen Group)",
    "productId": "fertilizer-coating",
    "country": "Turkey",
    "countryZh": "土耳其",
    "city": "İstanbul (headquarters city marker)",
    "latitude": 41.0082,
    "longitude": 28.9784,
    "legacyCompanyDescription": "自有复合肥制造与公开NP颗粒涂覆评估能力；2021研究阶段，商业控释/PU包膜未确认",
    "fit": "可开发候选",
    "signal": "独立重读公司自有NPK制造、Mersin研发配方和2021年原始6页论文：Toros研发作者在其NP20-20-0复合肥表面实际涂覆商业液体/蜡涂层并做小袋储存评估。对应TDS包衣复合肥的潜在原料配方评估账户；所引证据为2021年实验研究，不写成已商业投产的控释/PU产线，不把防结块研究效果转给我方材料。FY2025集团年报确认现有制造与完整业务，官网保留一般业务入口。地图为İstanbul总部城市，非Mersin实验室或工厂GPS。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-13",
      "conclusion": "独立核对完整成品肥目录、三厂制造、Toros子公司及Tekfen FY2025原始85页年报。公开业务为矿物/水溶/有机/有机矿物成品肥、种子/农产品、包装袋、港口及自由区；关联集团另有工程EPC、钢结构/管道、地产和投资，不能把客户管线/厂房施工或工程采购当原料制造。Toros Gönen涉及腐殖酸和有机肥，不能笼统宣称集团不卖任何原料；所查公开范围未发现对外供应肥料包衣树脂、PU输入原料或同类独立包衣剂。原始论文为已有商业涂层和生物基候选涂层的下游应用评估，没有证据据此宣称公司生产/销售涂层原料。按Toros/Tekfen法人、品牌、toros.com.tr/tekfen.com.tr、当前İstanbul总部及Mersin/Ceyhan/Samsun厂址核对main167家，无同一账户；工厂、终端及子公司不另计。2021论文作者邮件不作为已核验当前员工联系方式，未推断当前职务或个人邮箱；公司当前官方电话和联系入口用于业务转接。"
    },
    "contact": {
      "label": "Official corporate business contact entry; no current business mailbox independently verified",
      "phone": "+90 212 357 0202",
      "contactUrl": "https://www.toros.com.tr/tr/toros-kurumsal/iletisim/genel-iletisim-bilgileri"
    },
    "source": {
      "label": "Original 2021 Toros R&D study: actual NP20-20 compound-fertiliser surface-coating evaluation",
      "url": "https://www.eurjchem.com/index.php/eurjchem/article/view/2120"
    },
    "checkedAt": "2026-10-13"
  },
  {
    "id": "gubretas-istanbul",
    "company": "Gübre Fabrikaları Türk A.Ş. (GÜBRETAŞ; Tarım Kredi Group)",
    "productId": "fertilizer-coating",
    "country": "Turkey",
    "countryZh": "土耳其",
    "city": "İstanbul (headquarters city marker)",
    "latitude": 41.0082,
    "longitude": 28.9784,
    "legacyCompanyDescription": "自产NBPT稳定化尿素SLOWFERT系列；官网缓释分类，非已确认聚合物/PU阻隔包膜",
    "fit": "可开发候选",
    "signal": "独立重读SLOWFERT SÜPER İNCİ具体产品与原始登记证。证书列Gübre Fabrikaları Türk Anonim Şirketi为Üretici（生产商）、生产国Türkiye，2023续证及2026签署袋标均已渲染核对；官网将该NBPT抑制剂尿素归入Slow Release Fertilizer系列。以公司公开缓释产品分类与TDS应用进行潜在配方评估，明确实际登记为NBPT稳定化尿素；不等同独立证实的聚合物阻隔膜/控释性能，未确认物理包衣工艺、PU、我方材料适配或采购。地图为İstanbul总部城市，非Yarımca厂区GPS。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-13",
      "conclusion": "独立核对成品肥全部分类、NBPT成品登记制造主体、当前辅助产品原文与FY2025原始73页集团报告。公司/关联Razi确有氨、硫、硫酸、DAP、尿素等肥料及原料业务，Tarkim属植保，另有金矿；不宣称集团不卖任何原料。N-GATE原文为滴灌15%尿素氮成品肥，GF-MIX/PEHAWET为农业罐混/水质pH及叶面铺展用途，不因品牌名或泛称添加剂就写成肥料颗粒包衣剂。所查公开范围未发现对外销售独立肥料包衣树脂、PU输入料或同类包衣剂，结论限所查范围。Tarım Kredi控股关联和Razi/Tarkim/矿业同一账户均保留；Holding集团网页仅HTML壳，不作为完整业务核验依据。按GUBRETAS/Gübre Fabrikaları/Razi/Tarım Kredi、法人登记47535-0、域名、Bereket Plaza当前总部/Yarımca厂址、公司邮箱核对main167家及私有队列，无同一正式账户；生产基地/品牌不另计。旧英文管理页及FY2025报告仍将Musa Goral列供应链总监，最新2026-10-01原始公司公告已列总经理，采用最新职务；无个人邮箱公开，gubretas@gubretas.com.tr不归给他。原报告列Razi临时停产，不宣称该伊朗厂当前持续运行；土耳其登记NBPT成品制造证据独立保留。"
    },
    "contact": {
      "label": "Official general company business inbox; personal recipient is not attributed",
      "email": "gubretas@gubretas.com.tr",
      "phone": "+90 216 468 5050",
      "contactUrl": "https://www.gubretas.com.tr/tr/iletisim"
    },
    "source": {
      "label": "Official SLOWFERT SÜPER İNCİ NBPT-inhibited urea product, marketed in slow-release series",
      "url": "https://www.gubretas.com.tr/tr/urun/slowfert-super-inci"
    },
    "checkedAt": "2026-10-13"
  },
  {
    "id": "juno-erandio",
    "company": "Industrias JUNO, S.A. (JUNO / JUNO Industrial)",
    "productId": "nl-w1201",
    "country": "Spain",
    "countryZh": "西班牙",
    "city": "Erandio",
    "latitude": 43.3072,
    "longitude": -2.945,
    "legacyCompanyDescription": "自有研发制造的水性木器成品涂料账户；NL-W1201使用、采购及配方适配未确认",
    "fit": "可开发候选",
    "signal": "独立读取当前公司制造和工厂联系、木器产品、2026完整48页成品目录、24页工业目录及当前链接的原始技术资料：Industrias JUNO在Erandio自有涂料工厂，JUNO Industrial为同一法人工业分部且有自有实验室/工厂；LASUR ACUOSO明确为丙烯酸树脂配方的水性木器成品。原始TDS版本为2016年6月Rev.07，2026官网和目录仍列该品，不把下载日期当修订日期。对应NL-W1201 TDS木材基材，仅为潜在配方评估；使用、采购、需求和适配未确认。地图为Erandio城市代表位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-13",
      "conclusion": "独立审读完整2026成品目录、工业完整目录、当前木器产品/制造与全部添加剂分类及微球叶页。范围含建筑/工业成品漆、木器清漆、成品底漆、溶剂、色浆、清洁/去漆剂及施工材料。聚乙烯/聚丙烯微球为物理防滑颗粒，不能据材料名称当作PO乳液/分散体；目录p23的附着促进产品为可施工的双组分环氧/硅烷成品锚固底漆。所查未发现水性PO乳液、PO/CPO原料分散体或同类原料附着促进剂销售，结论限所查公开范围。JUNO、JUNO Industrial、junopaints及所有分部/店铺按同一法人一个账户；制造历史中的早期油品不推定为当前NL-W1201同类原料业务。按法人名称、相关域名、Erandio/Ortuella地址和infoweb邮箱查最新main170家、本地及私有队列，无同一正式账户。公开一般邮箱来自工业分部和法条通信原文，不推断具名技术/采购邮箱。"
    },
    "contact": {
      "label": "Official general business mailbox; no named technical/procurement person inferred",
      "email": "infoweb@juno.es",
      "phone": "+34 944 670 062",
      "contactUrl": "https://www.juno.es/contacto/"
    },
    "source": {
      "label": "Official current own paint manufacture and Erandio company history",
      "url": "https://www.juno.es/quienes-somos/"
    },
    "checkedAt": "2026-10-13"
  },
  {
    "id": "isaval-ribarroja",
    "company": "Pinturas Isaval, S.L. (Isaval; Isaval Global website)",
    "productId": "nl-w1201",
    "country": "Spain",
    "countryZh": "西班牙",
    "city": "Riba-roja de Túria",
    "latitude": 39.5465,
    "longitude": -0.5694,
    "legacyCompanyDescription": "自有研发制造的水性木器成品涂料账户；NL-W1201使用、采购及配方适配未确认",
    "fit": "可开发候选",
    "signal": "独立读取公司实际自有研发/制造、全部25页涂料目录300条产品链接、辅料、联系/法律资料及Xanol原始TDS：Pinturas Isaval在Ribarroja制造自有涂料；Xanol Barniz Interior明确为木材用单组分水性脂肪族PU成品，技术资料1907版本6日期2026-01-13。官网所有者Isaval Global, S.L.与联系原文制造法人Pinturas Isaval, S.L.按一个Isaval账户保留，未捏造母子公司法律持股。对应NL-W1201 TDS木材基材的潜在配方评估，使用、采购、需求和适配未确认。地图为Riba-roja城市代表位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-13",
      "conclusion": "独立审读300条当前涂料产品的全部25页目录、完整辅料分类、Resul/Sanit/Imperal Primer/Fixenol/Siltop实际叶页、自有制造与联系。保留调色浓缩物、亚麻油/溶剂、其他配套材料销售事实，不泛称无原料。Resul为防滑颗粒，Sanit为防霉/藻添加剂；Imperal Primer为施工用双组分水性环氧底漆，Fixenol为丙烯酸-硅氧烷建筑表面固定剂，Siltop为矿物表面硅酸盐/硅溶胶固定底漆及稀释剂；这些原文未显示PO/CPO同类原料输入销售。所查未发现水性PO乳液、PO/CPO原料分散体或同类原料附着促进剂销售，结论限所查公开范围。按Pinturas Isaval/Isaval Global、CIF B46069654、isaval.es、Velluters/Casanova地址及isaval邮箱核对最新main170家、本地/私有队列，无同一正式账户；Xanol/Rhonatherm/Rheco品牌和海外分部/店铺不拆户。与Valresa同城但法人、CIF、具体地址、域名和邮箱不同，不以同城合并。未找到可独立归属的具名技术/采购个人业务邮箱，使用明确公开的一般业务邮箱。"
    },
    "contact": {
      "label": "Official general business mailbox; no named technical/procurement person inferred",
      "email": "isaval@isaval.es",
      "phone": "+34 96 164 00 01",
      "contactUrl": "https://www.isaval.es/contacto/"
    },
    "source": {
      "label": "Official own product development and manufacture at Ribarroja factory",
      "url": "https://www.isaval.es/sobre-isaval/quienes-somos/"
    },
    "checkedAt": "2026-10-13"
  },
  {
    "id": "valresa-riba-roja",
    "company": "Valresa Coatings, S.A. (Valresa Group)",
    "productId": "nl-w1201",
    "country": "Spain",
    "countryZh": "西班牙",
    "city": "Riba-roja de Túria",
    "latitude": 39.5465,
    "longitude": -0.5694,
    "legacyCompanyDescription": "自有研发制造的水性木器成品涂料账户；NL-W1201使用、采购及配方适配未确认",
    "fit": "可开发候选",
    "signal": "独立读取集团制造/研发、法律主体、ESFERA水性木器实际叶页及全产品范围：Valresa Coatings, S.A.在西班牙制造涂料/清漆并自有研发，ESFERA270063为木材整个涂装过程用水性底漆/面漆成品；集团现列海外制造场地。另从土耳其合资公司当前原文核实2005年由IBA Kimya与VALRESA成立及Esfera/Valresa/İbavet/İba Sanayi品牌关联；旧私有Esfera ready_for_review不是独立核验依据，也不再另增品牌账户。对应NL-W1201 TDS木材基材的潜在配方评估，需求、采购、使用和适配未确认。地图为Riba-roja城市代表位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-13",
      "conclusion": "独立审读集团当前制造/研发与跨国场地、木器水性内外用系列和270063/700602成品、完整硝基/PU/聚酯清漆/粉末涂料/调色范围及土耳其合资主体当前全部业务与品牌原文。保留双组分成品配套硬化剂、色浆和历史醇酸树脂生产转移事实，不泛称从未销售树脂或原料；所查未发现水性PO乳液、PO/CPO原料分散体或同类原料附着促进剂销售，结论限所查公开范围。按Valresa Coatings S.A./VALRESA SA、CIF A46030169、valresa.com及关联土耳其域名、ESFERA、IBA VALRESA、地址和一般邮箱核对最新main170家，无同一正式账户。命中旧私有Esfera发现记录，已按当前原文并入同一开发账户，仅本次新增一个；海外工厂和品牌不另计公司。当前46394业务地址与2021法律页46190邮编差异分开保留。一般valresa邮箱不指定个人；粉末涂料分销madrid邮箱不误作木器技术部联系人。"
    },
    "contact": {
      "label": "Official general business mailbox; no named technical/procurement person inferred",
      "email": "valresa@valresa.com",
      "phone": "+34 961 669 560",
      "contactUrl": "https://valresa.com/contact/"
    },
    "source": {
      "label": "Official current international manufacturing sites and own R&D/product development",
      "url": "https://valresa.com/empresa/grupo/"
    },
    "checkedAt": "2026-10-13"
  },
  {
    "id": "fcp-cerea-bonavicina",
    "company": "Fabbrica Cooperativa Perfosfati Cerea S.C. (FCP Cerea)",
    "productId": "fertilizer-coating",
    "country": "Italy",
    "countryZh": "意大利",
    "city": "Bonavicina di San Pietro di Morubio",
    "latitude": 45.207,
    "longitude": 11.0964,
    "legacyCompanyDescription": "自产复杂颗粒肥并有实际包衣线；PU/膜材料、我方产品使用/采购/配方适配未确认",
    "fit": "可开发候选",
    "signal": "独立读当前自有制造/包衣线、2018建成记录、当前Mastercote与Control、所有四大成品分类及81页原始英文目录：Fabbrica Cooperativa Perfosfati Cerea在Bonavicina实际生产复杂NPK/NP/PK颗粒肥并运行包衣线；原目录PDF43页(印刷84–85页)说明造粒后用液态/粉状微量营养/生物刺激等添加物涂覆自产肥。当前Mastercote为含包衣尿素的NPK成品，Control为含脲甲醛的缓释NPK；不据此宣称Mastercote每粒尿素均由该厂自行包膜，不将生物活化/NBPT/脲甲醛混为PU膜。对应肥料包衣原料TDS包衣复合肥应用的潜在技术评估；PU/聚合物膜树脂类型、使用/采购/需求/适配未确认。地图为Bonavicina城市代表位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-13",
      "conclusion": "独立审读自有完整制造/研发、全部颗粒/特殊营养/水溶肥/有机认证产品分类、原始81页全目录、Cerere/Reactive/Futura实际成品用途与法名/VAT/业务联系。范围含NPK/NP/PK、包衣/缓释肥、叶面/滴灌营养、微生物/海藻/氨基酸/腐植酸生物刺激成品；保留Cerere含47%中长链多元醇事实，当前叶页明确叶面/根部抗逆成品用途，这不是公开对外销售PU反应多元醇原料或肥料树脂/独立包衣剂的证据。原目录自有包衣过程使用多种输入，并不据此推断全部输入自产或出售；所查未发现肥料包衣树脂、PU反应原料或独立肥料包衣剂对外销售，结论限所查公开范围。按Fabbrica Cooperativa Perfosfati Cerea S.C./FCP Cerea/Cerea FCP、VAT00222260234、fcpcerea域名、Farfusola6厂址及业务/实验室邮箱核对最新main176家、本地和私有队列，无同一正式账户；历史Cerea厂迁至Bonavicina、产品品牌/包衣线不拆户。实验室/出口邮箱按官网部门记录；不从francesca.moretto邮箱推断具名人员当前职位或把一般邮箱归给个人。"
    },
    "contact": {
      "label": "Official laboratory business inbox; no named technical/procurement person inferred",
      "email": "laboratorio@fcpcerea.it",
      "phone": "+39 045 7125963",
      "contactUrl": "https://fcpcerea.it/contatti"
    },
    "source": {
      "label": "Official current own compound-fertilizer manufacture, actual coating plant and chemical/agronomic lab",
      "url": "https://fcpcerea.it/azienda"
    },
    "checkedAt": "2026-10-13"
  },
  {
    "id": "coromandel-chennai",
    "company": "Coromandel International Limited (Murugappa Group)",
    "productId": "fertilizer-coating",
    "country": "India",
    "countryZh": "印度",
    "city": "Chennai",
    "latitude": 13.0827,
    "longitude": 80.2707,
    "legacyCompanyDescription": "自产复杂肥及有公开自产记录的磷酸铵包覆尿素品种；PU/膜材料、我方材料适配/使用/采购未确认",
    "fit": "可开发候选",
    "signal": "独立读当前复杂肥制造业务、Gromor28原文、Q1FY27运营、具名管理层及2026生物产品原始目录，并读164页2014–15原始年报：当时报告PDF30页(印刷28页)明确28:28:0由Kakinada C-train自产；当前Gromor28页面明确磷酸铵包覆尿素粒，当前公司持续自产复杂肥。按已证实的传统包覆尿素/复杂肥角色评估TDS尿素包衣原料；2014–15生产记录保留原年份，未当作2026产量或新投产事件。另有纳米尿素产品，不据此扩展成纳米叶面体系适用结论；PU/膜化学、我方材料需求/使用/采购/适配未确认。地图为Chennai城市代表位置，不是Kakinada工厂定位。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-13",
      "conclusion": "独立读公司本体全部五大产品/服务业务、当前生物产品各分类及52页2026完整原始目录、当前复杂肥业务、Gromor28、运营公告、现行管理层与联系原文。保留农药原药、中间体和植物提取制品生产/销售事实，不泛称无上游原料；生物系列所查为Azadirachtin植物保护、Neem油植保配方/饼肥、生物刺激/微生物营养、喷雾助剂及抗蒸腾等，未发现以肥料颗粒包衣剂/树脂或PU反应原料对外销售。结论限所查Coromandel经营范围；Murugappa首页超时，不冒充全集团完整范围证据，也不把共享集团投资关系等同同一经营法人。按Coromandel International/原Coromandel Fertilizers、Gromor/Paramfos、域名、Chennai/Secunderabad/各厂址及公开邮箱核对最新main公司、私有队列与本轮Cifo，无同一正式账户；工厂、品牌和已纳入本体的关联经营不拆户。Amit Rastogi为现行EVP&CTO、Amir Alvi为现行COO–Fertiliser；不沿用2023旧职位，不构造个人邮箱。2026目录第52页明示hellogromor1及技术询问/客服通路，一般公司通路不归给具名人员；投资者/媒体邮箱不用于开发信。 本轮核对main 177家公司，未发现同一正式记录。"
    },
    "contact": {
      "label": "Official general business / customer-care route; no personal mailbox attribution",
      "email": "hellogromor1@coromandel.murugappa.com",
      "phone": "1800 425 2828 (India customer-care / technical-enquiry route)",
      "contactUrl": "https://www.coromandel.biz/contact-us/"
    },
    "source": {
      "label": "Official current own complex-fertiliser manufacturing business and complete business categories",
      "url": "https://www.coromandel.biz/products-services/"
    },
    "checkedAt": "2026-10-13"
  },
  {
    "id": "cifo-san-giorgio",
    "company": "Cifo S.r.l. (Huber AgroSolutions / J.M. Huber)",
    "productId": "fertilizer-coating",
    "country": "Italy",
    "countryZh": "意大利",
    "city": "San Giorgio di Piano",
    "latitude": 44.6478,
    "longitude": 11.3754,
    "legacyCompanyDescription": "自有肥料配方研发制造、明确MCT多孔膜缓释颗粒产品；PU/自有膜专线/我方材料适配与采购未确认",
    "fit": "可开发候选",
    "signal": "独立读Cifo自有工厂/研发原文、当前完整两大产品目录、2026原始145页Home&Garden目录、法人采购条款/隐私/联系及集团范围：Cifo在San Giorgio di Piano研发并生产肥料配方；公司生产范围明确含缓释及颗粒肥。现行绿植用缓释肥与2026目录PDF73页(印刷72页)明确为MCT多孔膜包覆NPK颗粒。按自有肥料研发制造与明确缓释膜产品角色评估TDS缓释肥原料；不把通用制造原文扩充成已确认自有PU包膜专线，也不宣称MCT树脂化学、每颗原料均由Cifo自行包膜。实际需求/采购/使用/配方适配未确认。地图为San Giorgio di Piano城市代表位置。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-13",
      "conclusion": "独立读自有研发/制造、全两大成品目录、145页2026原始目录、原始2025-11-03采购条款、植物油/农用润湿助剂叶页及关联Huber/Miller/Pergopak实际范围。保留农用助剂、植物油、其他材料和集团材料供应事实，不泛称从未销售树脂/原料；Cifo Bagnante为含10%异癸醇乙氧基化物的叶面植保润湿配方，亚麻/Neem油为植物保护/强化成品；Miller Pinolene为植物表面喷施助剂。相关HAM Pergopak明确为非熔融热固性PMU颗粒、涂料消光/农药载体；该用途资料未显示是肥料包衣膜树脂或PU反应原料输入供应。所查未发现Cifo/相关经营范围对外销售肥料包衣树脂、PU反应原料或独立肥料颗粒包衣剂，结论限所查公开范围。按Cifo Srl/HuberAgroSolutions/Biolchim关联、cifo域名、Oradour地址及info邮箱核对最新main所有正式公司、私有队列与Coromandel，无同一正式账户；同集团关联记明而不按品牌/目录/地址写法另造公司。info为一般业务邮箱，未验证到能独立归属的具名采购/技术个人邮箱。 本轮核对main 177家公司，未发现同一正式记录。"
    },
    "contact": {
      "label": "Official general business / customer-care route; no personal mailbox attribution",
      "email": "info@cifo.it",
      "phone": "+39 051 6655511",
      "contactUrl": "https://www.cifo.it/contatti/"
    },
    "source": {
      "label": "Official own factory and in-house formulation research; production range includes slow-release fertilizers",
      "url": "https://www.cifo.it/azienda/"
    },
    "checkedAt": "2026-10-13"
  },
  {
    "id": "sika-baar",
    "company": "Sika AG (Sika Group)",
    "productId": "elo",
    "country": "Switzerland",
    "countryZh": "瑞士",
    "city": "Baar (headquarters city marker)",
    "latitude": 47.1956,
    "longitude": 8.5262,
    "legacyCompanyDescription": "自有成品涂料/胶黏剂及配方体系制造集团；瑞士总部/集团工业业务入口；ELO 适配、使用及采购未确认",
    "fit": "可开发候选",
    "signal": "独立复读 Sika 自有制造、涂料技术、胶黏剂、全建筑及工业业务和瑞士公开业务联系。自有配方涂料包括 Sikagard 防护涂料、Sikalastic 液体膜、Sikafloor 地坪体系，明确自有技术开发及制造。ELO TDS 支持涂料大类，可作为潜在配方评估原料；未确认其使用、采购 ELO 或具体体系适配。按 Sika AG / Sika Group 一个集团经营与采购账户收录，瑞士总部 Baar 为城市代表点，工业联系入口为同集团 Sika Services AG 的 Zurich 地址，不是声称 Baar 有某个具体生产厂。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-13",
      "conclusion": "独立查看公司整体制造/采购组织、当前完整建筑及工业业务分类、各核心技术、成品涂料/胶黏剂、Advanced Resins 和具体 EP/PUR casting 系统。所查未发现对外销售 ELO、ESBO、环氧化植物油或同类生物增塑原料；结论限这些实际读到的公开范围。保留其混凝土/水泥添加剂及配方树脂经营事实，不泛称不销售任何添加剂或树脂。PCE superplasticizers 的公开应用为水泥/混凝土，不能仅凭 plasticizer 字样等同植物油聚合物增塑原料；SikaBiresin 是已配制的双组分环氧/PU 浇注体系，普通环氧树脂不等同环氧化植物油。集团全球采购按材料类别和地区组织，是下游材料评估的合理业务链，但未披露 ELO 采购。按 Sika AG、Sika Services AG、Sika Group、相关涂料/胶黏剂/浇注品牌、域名、Baar/Zurich 地址及工业邮箱核对最新 main 179家、工作区和私有队列，无同一正式账户；品牌、分支、国家工厂不拆分新增，大陆/台湾子公司不另收录。公开 industry@ch.sika.com 是工业业务一般入口，不能标作采购个人或 Bernhard Bosshard 邮箱；其官网明示 Head of Technology – Coating Systems，仅保留角色，不构造个人邮箱。"
    },
    "contact": {
      "label": "Official Sika Group industrial business entry via Sika Services AG; general team route",
      "email": "industry@ch.sika.com",
      "phone": "+41 58 436 40 40",
      "contactUrl": "https://industry.sika.com/en/home/about-industry/contact.html"
    },
    "source": {
      "label": "Official own developed coating systems and disclosed current technology head",
      "url": "https://www.sika.com/en/sustainability/innovation/technologies/coating-systems.html"
    },
    "checkedAt": "2026-10-13"
  },
  {
    "id": "asian-paints-mumbai",
    "company": "Asian Paints Limited",
    "productId": "elo",
    "country": "India",
    "countryZh": "印度",
    "city": "Mumbai (registered-office city marker)",
    "latitude": 19.076,
    "longitude": 72.8777,
    "legacyCompanyDescription": "自有木器/建筑成品涂料研发制造企业；原料与集团关联业务已注明；ELO 具体适配、使用和采购未确认",
    "fit": "可开发候选",
    "signal": "独立审读 Asian Paints 原始 FY2025–26 Business Review（8页）、BRSR（22页）及公司法律信息章节（11页），并核对当前官网成品分类、木器涂料、供应商入口和 Penta 原料业务。自身法定经营主体 Asian Paints Limited 制造涂料；业务章节明确 WoodTech PU Gold 聚氨酯木器涂料及 Aquadur 水性亮光产品。ELO TDS 确认涂料大类，可作为其下游成品配方原料的潜在评估对象，不代表具体配方已兼容、已使用或有采购需求。Mumbai 点为公司注册地址所在城市代表位置，不代表某个生产厂 GPS。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-13",
      "conclusion": "所查原始业务/制造报告、当前全成品分类与木器系列及 Penta 官方化学业务未发现对外销售 ELO、ESBO、环氧化植物油或同类生物增塑输入；结论限这些实际查看的公开范围。保留原料和交易业务事实，不泛称集团没有任何上游化学品：Penta 主页明示产品为 Pentaerythritol 各等级及 Sodium Formate，plasticizers/stabilizers 是由其原料制成产品的下游用途，不等于其产品就是环氧化植物油/生物增塑添加剂。原报告 AP Polymers 已于2026-03-31并入本体，VAM/VAE 相关经营关联记明；不把旧计划目标当作已投产证据，亦不另造一个更名/并入主体。报告 Harind/Nova surface-care 和 PPG 合资关联已识别，但不能从纳米表面技术或股权关系推定其采购/使用 ELO；未声称审读所有关联公司的完整目录。按 Asian Paints Limited、CIN、WoodTech/AP品牌、Penta、PPG Asian Paints/Asian Paints PPG、域名、Mumbai 地址与公开邮箱核对最新main180家及本地/私有研究，无同一正式公司账户。各国品牌、子公司和材料分部不拆户。当前官网明确原料供应商入口，customercare 是一般客服业务邮箱，不标为采购个人；pentasales 仅为 Penta 分部商业/采购通路，不转借为成品涂料中央采购邮箱。投资者关系及BRSR报告联系邮箱不用于开发信。"
    },
    "contact": {
      "label": "Official raw-material supplier entry; disclosed general customer-care mailbox for team routing",
      "email": "customercare@asianpaints.com",
      "phone": "1800-209-5678 (India customer-care route)",
      "contactUrl": "https://www.asianpaints.com/more/supplier-registration.html"
    },
    "source": {
      "label": "Original FY2025–26 Business Review: own WoodTech PU Gold and Aquadur coating range, full reviewed eight-page business chapter",
      "url": "https://static.asianpaints.com/content/dam/annual-report-2526/pdf/Business-review.pdf"
    },
    "checkedAt": "2026-10-13"
  },
  {
    "id": "benjamin-moore-montvale",
    "company": "Benjamin Moore & Co.",
    "productId": "nl-w1201",
    "country": "United States",
    "countryZh": "美国",
    "city": "Montvale (corporate-office city marker)",
    "latitude": 41.0468,
    "longitude": -74.0229,
    "legacyCompanyDescription": "自有水性木器成品涂料研发制造企业；NL-W1201具体适配、使用与采购未确认",
    "fit": "可开发候选",
    "signal": "2025企业责任报告（2026年4月发表）确认公司自身有制造设施及配方研发，不是涂料零售商。当前官网链接 ADVANCE Satin792 原始两页TDS（US041023）明确 waterborne alkyd、木材及门/柜/饰条用途；当前产品页仍列该系列。NL-W1201 TDS 支持木材，可提出水性木器配方评估，不意味着该水性醇酸已兼容我方PO乳液。Montvale标记为总部所在城市，不是工厂GPS。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-13",
      "conclusion": "独立审读2025报告及当前产品分类、INSL-X完整成品类别、Corotech工业成品范围、STIX具体成品底漆与清洁/预处理三项产品，所查未发现对外销售水性PO乳液、CPO/PO原料分散体或原料附着力促进剂；结论限实际查看的公开范围，不称穷尽全SKU。STIX是配制好的acrylic-urethane bonding primer，finished primer不因名字bonding归为原料同行。Gennex为自有着色体系，不等同PO/CPO原料；不从2012宣传材料推定当前对外售卖树脂。原报告Berkshire母公司关联已注明；其他独立经营投资业务不借财务共同母公司自动并户，亦未把整个投资集团声称为非原料供应商。按Benjamin Moore & Co.、INSL-X/Corotech/Gennex/ADVANCE品牌、官网域名、Montvale地址及公开邮箱核对最新main181家，无同一正式账户，品牌/工厂/国家网点不拆新增。sustainmoore报告问题邮箱不用作原料采购，info为一般业务路由，无个人采购邮箱。"
    },
    "contact": {
      "label": "Official general business contact; route to technical/material evaluation team",
      "email": "info@benjaminmoore.com",
      "phone": "+1 201 573 9600 (company telephone printed in currently linked TDS US041023)",
      "contactUrl": "https://www.benjaminmoore.com/en-us/contact-us"
    },
    "source": {
      "label": "Original currently linked ADVANCE Satin 792 TDS, code US041023; waterborne alkyd and wood/cabinet uses",
      "url": "https://media.benjaminmoore.com/WebServices/prod/assets/production/datasheets/TDS_0792/792_TDS_US.pdf"
    },
    "checkedAt": "2026-10-13"
  },
  {
    "id": "behr-santa-ana",
    "company": "Behr Process LLC (Behr Paint Company, Masco)",
    "productId": "nl-w1201",
    "country": "United States",
    "countryZh": "美国",
    "city": "Santa Ana (corporate-office city marker)",
    "latitude": 33.7455,
    "longitude": -117.8677,
    "legacyCompanyDescription": "自有水性木器成品涂料研发制造企业；NL-W1201具体适配、使用与采购未确认",
    "fit": "可开发候选",
    "signal": "原始33页 Cabinet Door Trim EPD（2024-09-09签发、5年有效，生命周期基础数据为2021年）明示法定制造主体 Behr Process LLC、当前总部地址、水性配制成品及木器用途，并描述原料计量/预混/分散/let-down制漆流程；当前Behr产品页与Masco旗下Behr制造网点交叉核对。NL-W1201 TDS确认木材，可询问水性木器原料评估，未确认其采购/使用或具体体系适配。Santa Ana为总部城市代表点；不拿生命周期旧数据当2026产量或采购证据。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-13",
      "conclusion": "当前Behr专业页面完整业务类别包括成品内外墙涂料、木器、底漆、地坪、装饰、气雾剂、caulks/sealants、清洁/去除产品和工具；原始EPD与当前具体木器产品为自身配制并生产的成品。所查未发现对外供应PO乳液、CPO/PO原料分散体或原料附着力促进剂；结论限实际读到的类别/具体文件，不声称21项内墙SKU全部审读。Finished bonding/adhesion primer不因名称被误判为raw adhesion promoter；PP/HDPE容器是包装材料，不是公司在卖PO涂料原料。Masco母公司、Behr Process LLC、BEHR/KILZ/WHIZZ及旧Corporation名称、域名、SantaAna地址、电话与最新main181家核对，无同一正式账户；品牌/地区工厂不另算。EPD kbird@behr.com只标study commissioner邮箱，未披露姓名与采购职位，不用作开发信或猜K.Bird个人名；Veronica公开技术角色可保留，但无个人邮箱，首封与提示均以团队称呼。Architectural reps是涂料客户销售/技术路由，不冒充原料采购。"
    },
    "contact": {
      "label": "Official business and technical contact page; corporate telephone, no verified general outreach mailbox",
      "phone": "+1 714 545 7101",
      "contactUrl": "https://www.behr.com/pro/contact-a-rep/"
    },
    "source": {
      "label": "Original33-page Cabinet Door Trim EPD, issued2024-09-09 for5years; own manufacturer and formulation",
      "url": "https://www.behr.com/binaries/content/assets/behrpro/pdf/epd/121.1_behr_premium_cabinet_door_and_trim.pdf"
    },
    "checkedAt": "2026-10-13"
  },
  {
    "id": "ppg-pittsburgh",
    "company": "PPG Industries, Inc. (Protective and Marine Coatings)",
    "productId": "elo",
    "country": "United States",
    "countryZh": "美国",
    "city": "Pittsburgh (principal-office city marker)",
    "latitude": 40.4406,
    "longitude": -79.9959,
    "legacyCompanyDescription": "自有成品防护/船舶涂料制造及采购经营公司；ELO适配、使用与采购未确认",
    "fit": "可开发候选",
    "signal": "独立读取原始2025年报10-K法定主体、全部三业务部门/当前产品范围、制造/R&D及原料章节，证明自身美国经营制造，不把客户Plants&Facilities用途页当自有工厂。官网当前链接原始AMERLOCK400美国英文PDS为2025-01-31修订的7页文件，明确双组分高固体环氧成品涂料。ELO TDS确认涂料大类，可提出配方原料评估；不推定该牌号已兼容或买用ELO。全球原料引入流程必须PPG sponsor发起/邀请，不能称开放注册或已有sponsor。Pittsburgh为法定总部城市点，不是工厂GPS。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-13",
      "conclusion": "原始2025年报公开三部门业务类别/原料与制造范围、当前SpecialtyProducts全类别及具体AMERLOCK400成品资料中，所查未发现销售ELO、ESBO、环氧化植物油或同类生物增塑原料；限定实际查看的公开范围，未声称把所有全球牌号SDS读遍。保留原料及光学monomers/OLED/TESLIN/pretreatment经营事实；普通环氧成品/光学monomer不等同环氧化植物油。当前制造描述和原始采购章节证明外购原料制成自有产品，但没有ELO具体购买事实。按PPG Industries Inc./PPG Ohio/PMC/Sigma及年报品牌、域名、OnePPGPlace、业务邮箱核对最新main181家，无同一集团经营账户；不拆品牌与工厂。既有AsianPaints记录的50:50印度JV关联与本报告alliance对应，双方为独立经营法定主体，PPG美国经营与采购账户不是将印度JV改名新增。现有renner-italia-minerbio属于RennerHerrmann；另核对原集团历史2007年仅decorative division售给PPG，不能从RENNER商标同名将独立RennerItalia或整个Herrmann认作PPG。同样不沿用已剥离美国/加拿大建筑涂料业务的旧联系。pmcorderhelp为北美成品订单/一般路由，不标采购邮箱；两名公开采购职务无个人email，邮件团队称呼，不构造邮箱。"
    },
    "contact": {
      "label": "Sponsor-dependent raw-material introduction procedure; separate disclosed North American PMC general business mailbox for routing",
      "email": "pmcorderhelp@ppg.com",
      "phone": "+1 412 434 3131 (registrant corporate telephone)",
      "contactUrl": "https://procurement.ppg.com/Raw-Material-Introduction"
    },
    "source": {
      "label": "Original currently linked US AMERLOCK400 seven-page PDS, revised2025-01-31",
      "url": "https://dam-cdn.ppg.com/adaptivemedia/rendition?id=8f0dedb9842d2dca9c1cf6d720c831654e1bef62"
    },
    "checkedAt": "2026-10-13"
  },
  {
    "id": "rfcl-ramagundam",
    "company": "Ramagundam Fertilizers and Chemicals Limited (RFCL)",
    "productId": "fertilizer-coating",
    "country": "India",
    "countryZh": "印度",
    "city": "Ramagundam (disclosed factory city marker)",
    "latitude": 18.755,
    "longitude": 79.474,
    "legacyCompanyDescription": "独立合资自产苦楝油包衣尿素企业；与NFL等股权关联已注明；未确认PU/聚合物包膜或我方材料采购适配",
    "fit": "可开发候选",
    "signal": "独立读取当前官网自产尿素工艺、全产品类别（尿素/氨）、法定合资主体、业务联系及原始2025–26年报制造/法律/持股/经营章节。官网明确自产 neem-coated prilled urea，年报确认自身Ramagundam工厂继续制造尿素；苦楝油包衣是确实的下游包衣能力，不等于聚氨酯树脂、同类包膜体系或我方材料已适配/采购。年报2025–26尿素产量8.56LMT，不能把旧官网2024–25的11.95LMT或12.7LMT设计目标当2026实际产量。地图Ramagundam为已披露工厂所在城市代表点，不声称具体厂内GPS。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-13",
      "conclusion": "独立查看当前公司整体业务、全部尿素/氨产品、自产流程及年报经营/原料/制造章节，所查未见销售包衣树脂、聚氨酯原料或肥料包衣剂；结论限实际读到的公开范围，不泛称不销售任何工业化学品（保留氨业务）。原报告及官网明确RFCL为2015年独立成立、自产并拥有自身采购流程的合资经营主体，NFL/EIL各26%、FCIL11%等关联已记明，不是NFL工厂更名；不能因NFL既有账户或共同参股自动折叠这个独立法定经营公司。按RFCL全名、CINU24100DL2015PLC276753、rfcl域名、Ramagundam工厂/NewDelhi注册/Noida经营地址及admin邮箱核对最新main184家及本地/私有研究，无同一正式账户；分支工厂不拆户。旧FCIL关停单位与新RFCL复产法人不靠改名制造新增。admin为一般业务路由，不标采购个人；2026-02-16 walkie-talkie招标中Ramya M仅明确Materials地址/公开邮箱，无完整职务且已于3月关闭，不推断原料采购负责人或借该招标写材料需求。年报S.K.Jindal以原披露首字母保存，M&C缩写不展开，不构造个人邮箱；团队称呼。"
    },
    "contact": {
      "label": "Official general RFCL business mailbox; Ramagundam plant public telephone",
      "email": "admin@rfcl.co.in",
      "phone": "+91 8728 257488",
      "contactUrl": "https://rfcl.co.in/contact.php"
    },
    "source": {
      "label": "Official company profile explicitly reports own neem-coated prilled urea production and JV operating identity",
      "url": "https://rfcl.co.in/"
    },
    "checkedAt": "2026-10-13"
  },
  {
    "id": "sansin-strathroy",
    "company": "The Sansin Corporation",
    "productId": "nl-w1201",
    "country": "Canada",
    "countryZh": "加拿大",
    "city": "Strathroy (corporate-office city marker)",
    "latitude": 42.9562,
    "longitude": -81.6223,
    "legacyCompanyDescription": "自有水性木器成品涂料配方研发制造企业；NL-W1201具体兼容、使用与采购未确认",
    "fit": "可开发候选",
    "signal": "原始ENS两页TDS（October2025）明确water diluent、wood以及木/玻璃纤维门窗和户外家具用途。原始公开SDS（prepared05/4/2017，非新签发）列The Sansin Corporation制造主体；当前公司R&D和Factory Finish业务页交叉确认自有水性木器配方与成品制造角色，非单纯经销商。今日加拿大部门业务邮箱precisioncoat@sansin.com及5192452001电话已核验。NL-W1201仅支持木材原料评估，不转用ENS自身pH8.8/固含40±1或宣传性能。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-14",
      "conclusion": "独立查看当前消费者完整可见产品系列、Factory Finish全部显示类别、自有R&D、ENS原始TDS，以及易混淆的Boracol/AquaGard/StainBlockingPrimer具体成品页。Boracol为含硼木材防腐系统，StainBlockingPrimer为配制好的水性木材封闭底漆；不是由名称推断raw PO/CPO。所查公开范围未发现对外供应水性PO乳液、CPO/PO原料分散体或原料附着力促进剂；不声称全部单品SDS穷尽阅读，不从危害成分未列出推断完整配方。按TheSansinCorporation/SansinAmerica/PrecisionCoat/TimberTek、两官网域名、Strathroy地址及公开mail核对最新main185，无同一正式账户；美国及欧洲联系部门不拆新增。历史美国工厂计划不冒充已投产事实。"
    },
    "contact": {
      "label": "公开部门业务路由，可请求转技术/原料评估团队；不是采购承诺",
      "email": "precisioncoat@sansin.com",
      "phone": "+1 519 245 2001",
      "contactUrl": "https://sansinfactoryfinish.com/contact-us/"
    },
    "source": {
      "label": "Original current ENS TDS, October2025: water diluent and wood/windows/doors/furniture",
      "url": "https://www.sansin.com/wp-content/uploads/ENS.pdf"
    },
    "checkedAt": "2026-10-14"
  },
  {
    "id": "diamond-vogel-orange-city",
    "company": "Diamond Vogel",
    "productId": "nl-w1201",
    "country": "United States",
    "countryZh": "美国",
    "city": "Orange City (corporate-office city marker)",
    "latitude": 43.007,
    "longitude": -96.0584,
    "legacyCompanyDescription": "自有水性木器成品涂料配方研发制造企业；NL-W1201具体兼容、使用与采购未确认",
    "fit": "可开发候选",
    "signal": "当前公司about/current2026百年页及各制造部门确认Vogel家族自有成品涂料制造、实验室与配方业务。GrainStain BG0520当前官网链接原始两页TDS（revised04/2023）明确自身水性木器着色剂，用于siding/fences/trim/decks；需ACS调色，不称透明清漆。今日architectural部门公开邮箱与电话复核。NL-W1201仅作木器原料初步技术评估，未确认其配方、使用、需求或采购。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-14",
      "conclusion": "独立读取当前全部披露的公司市场部门、2026自有业务范围、toll formulation/chemical sourcing、OldMasters完整显示木器系列及实际MastersArmorPartB页面。PartB为仅供其配套成品清漆使用的hardener，不将硬化剂或finished wood primer按名称当作raw PO/CPO adhesion promoter。所查范围未发现水性PO乳液、CPO/PO原料分散体或原料附着力促进剂对外供应；结论限实际公开范围，不称全球全SKU与SDS穷尽。未将搜索未出现的EverlastPolymers臆断为当前关联或生产范围。按DiamondVogel/Vogel/OldMasters/VanSickle、官网与品牌域名、OrangeCity地址/mail核对最新main185，无同一正式账户；同集团品牌/工厂只计一个。既有HesseLignal独立企业，技术许可品牌联系不足以证明共同所有权；不以许可证名称归并。使用官网披露商号DiamondVogel，不臆造Inc/LLC法定后缀。"
    },
    "contact": {
      "label": "公开部门业务路由，可请求转技术/原料评估团队；不是采购承诺",
      "email": "architectural@diamondvogel.com",
      "phone": "+1 712 737 8880",
      "contactUrl": "https://www.diamondvogel.com/architectural/product/grain-stain-semi-transparent-water-base"
    },
    "source": {
      "label": "Original current Grain Stain BG-0520 TDS, revised04/2023: own water-base wood stain",
      "url": "https://www.diamondvogel.com/documents/sites/documents.vogelpaint.com/files/documents/BG-0520PI.pdf"
    },
    "checkedAt": "2026-10-14"
  },
  {
    "id": "cloverdale-paint-surrey",
    "company": "Cloverdale Paint Inc.",
    "productId": "nl-w1201",
    "country": "Canada",
    "countryZh": "加拿大",
    "city": "Surrey (corporate-office city marker)",
    "latitude": 49.1913,
    "longitude": -122.849,
    "legacyCompanyDescription": "自有水性木器成品涂料配方研发制造企业；NL-W1201具体兼容、使用与采购未确认",
    "fit": "可开发候选",
    "signal": "当前自身wood coatings及lab/technical页明确制造水性丙烯酸木器涂料。官网真实链接原始06680法文两页TDS（2025-03-14）明确water-based acrylic、木材siding/fences/decks/outdoor furniture；原始英文两页sell sheet（03/12）及当前具体产品页交叉确认。066半透明和723实色用途必须分开，723不推荐deck不移套至066。今日实名KristopherAgnew工业涂料技术职位和kagnew公司mailto、WarrenDelaney木器产品职位和wdelaney公司mailto分别核验；不标其为采购主管。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-14",
      "conclusion": "独立检查当前全部工业类别、八款可见木器产品、六款additives及activators/catalysts，并完整阅读六份实际作者TDS。A60为100%固体polypropylene bead防滑骨料，不是水性PO乳液/CPO原料分散体或附着促进乳液；A65为amine环氧固化加速剂，A66为metallic-soap urethane accelerator，A68为isocyanate solvent-based enamel hardener，A69为polysiloxane-copolymer溶剂型防缩孔/湿润剂，且不推荐底漆，A70为urethane catalyst。保留它销售这些实际配方添加剂的事实，但所查功能及产品范围未发现销售NL同类PO/CPO乳液或原料附着力促进剂；不以所有additives无关为笼统结论。SDS只审读识别/组分/版次，不是完整成分清单，A68SDS未列isocyanate不能推翻TDS明示。按CloverdalePaintInc/Rodda-Miller/Monarch关联、官网、Surrey地址及实名邮箱核对最新main185无同一正式账户，分公司/品牌不拆新增。DarrenRichardson页面mailto为jpandin存在错配，该条不入联系人、不推断全名/email。旧SDS btinsley无公开姓名职位，旧helpdesk不作为今日实名采购邮箱。"
    },
    "contact": {
      "label": "公开实名技术业务联系人，职位及个人公司邮箱已独立核验；不是确认采购人员",
      "email": "kagnew@cloverdalepaint.com",
      "phone": "+1 604 596 6261",
      "contactUrl": "https://www.cloverdalepaint.com/industrial/contact-us"
    },
    "source": {
      "label": "Original current French06680 TDS, revised2025-03-14: water-based acrylic wood stain",
      "url": "https://pldb.cloverdalepaint.com/documents/Cloverdale/tds/trade/TDS-french/cloverdale-tds-06680-f.pdf"
    },
    "checkedAt": "2026-10-14"
  },
  {
    "id": "induron-birmingham",
    "company": "Induron Coatings, LLC (Induron Protective Coatings)",
    "productId": "elo",
    "country": "United States",
    "countryZh": "美国",
    "city": "Birmingham (corporate-office city marker)",
    "latitude": 33.5186,
    "longitude": -86.8104,
    "legacyCompanyDescription": "自有成品防护涂料配方研发制造企业；ELO具体适配、使用与采购未确认",
    "fit": "可开发候选",
    "signal": "当前Induron自有about/all-products明确其家族企业实际制造与R&D配方开发；当前自身PermaClean100SL原始两页TDS明示aliphatic amine epoxy tank lining、双组分成品及steel/concrete water tanks用途，印刷代码0126S。作者URL目录2025/02、文件名0225S均不冒充实际版本签发日期。ELO TDS仅涂料大类，可提出原料技术评估，客户自身NSF/浸水测试不转作我方ELO认证或适配证明。今日TechnicalServicesDirector BillSeawell与wseawell业务邮箱、两公开部门路由已核实。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-14",
      "conclusion": "独立阅读当前全部可见acrylic/alkyd/epoxy/primer/urethane/miscellaneous/thinner类别与实际配方产品，另完整审读U50和E60原始TDS：两者为配套成品固化加速剂，未将其说成ELO/ESBO/环氧化植物油或生物增塑剂。所查公开范围未发现对外供应上述ELO同类原料；结论限实际阅读的类别与文件，不声称全球全部SKU或完整配方穷尽。Induraguard9200的linseed-oil alkyd不代表使用epoxidized linseed oil，也不当成卖原料亚麻油。旧2016SDS仅确认公开制造名称/地址，危害成分披露不等同完整配方；不臆测E60胺化学结构或以成分空表证明不存在相关原料。按InduronCoatingsLLC/InduronProtectiveCoatingsLLC历史公开名称、品牌、域名、Birmingham地址/mail核对最新main188，无同一正式账户，旧名称不拆新增。技术Director公开职位保持原样，不标采购/R&D主管；紧急8004249300不作业务电话。"
    },
    "contact": {
      "label": "公开实名TechnicalServicesDirector业务邮箱；不是采购身份或购买承诺",
      "email": "wseawell@induron.com",
      "phone": "+1 205 324 9584",
      "contactUrl": "https://www.induron.com/contact/"
    },
    "source": {
      "label": "Original current Perma-Clean100SL technical data, printed code0126S; own aliphatic-amine epoxy tank lining",
      "url": "https://www.induron.com/wp-content/uploads/2025/02/PC-100-SL-TDS-0225S.pdf"
    },
    "checkedAt": "2026-10-14"
  },
  {
    "id": "farrell-calhoun-memphis",
    "company": "Farrell-Calhoun Inc.",
    "productId": "nl-w1201",
    "country": "United States",
    "countryZh": "美国",
    "city": "Memphis (headquarters/manufacturing city marker)",
    "latitude": 35.1495,
    "longitude": -90.049,
    "legacyCompanyDescription": "自有水性木器成品涂料配方研发制造企业；NL-W1201具体兼容、使用与采购未确认",
    "fit": "可开发候选",
    "signal": "当前自身about页明确研发化学师、自有实验室和制造设施；contact页明确法定Farrell-CalhounInc及CorporateHeadquarters&Manufacturing地址221ECarolinaMemphis。自身WoodKraft1160当前原始两页TDS（2024-09-15）明示waterborne acrylic-polyurethane clear wood varnishes及内外木门/家具/柜等用途，与当前官网具体产品链接对应。NL-W1201 TDS支持木材原料评估，未确认我方乳液与该体系兼容、使用或采购。采购岗位jeremylafrain、TechnicalAssistance gregandre和CustomerService info公开邮箱按岗位记录，不从地址推断姓名或抬升职位。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-14",
      "conclusion": "独立阅读当前官网完整可见自产产品类别/产品名称列表，明确水性/油性成品paint/primer/woodcoat/epoxy/clean-up溶剂等；另审读实际AquaBond6-78原始TDS与产品页，确认pigmented water-based acrylic-PU finished bonding primer，不是raw PO/CPO adhesion-promoter dispersion。所查未发现销售水性PO乳液、CPO/PO原料分散体或原料附着力促进剂；限实际查看公开范围，不称每个全球SKU/SDS均已阅读。保留其商店同时销售第三方RustOleum9100的事实；代理产品不当作自产Epoxy证据，此账户用自身WoodKraft原始资料确认。RelatedProducts页面没有可读产品主体，不把空页面作排除证明。按FarrellCalhoun/KentuckyPaint/Town&Ranch/TuffBoy/WoodKraft等经营及品牌关联、主/店铺域名、Memphis地址/mail核对最新main188，无同一正式账户；旧总部/工厂/品牌不拆新增。采购邮箱岗位公开但姓名未在该条披露，保持team greeting，不采用第三方inactive manager记录补猜Jeremy姓名。"
    },
    "contact": {
      "label": "官网公开PurchasingAgent岗位业务邮箱，岗位下未明示个人姓名，首封仅用团队称呼",
      "email": "jeremylafrain@farrellcalhoun.com",
      "phone": "+1 901 526 2211",
      "contactUrl": "https://www.farrellcalhoun.com/contact"
    },
    "source": {
      "label": "Original current WoodKraft1160 two-page TDS, revised2024-09-15: waterborne acrylic-PU wood varnish",
      "url": "https://assets.speakcdn.com/assets/2859/1160_line_3.pdf"
    },
    "checkedAt": "2026-10-14"
  },
  {
    "id": "bona-malmo",
    "company": "Bona AB",
    "productId": "nl-w1201",
    "country": "Sweden",
    "countryZh": "瑞典",
    "city": "Malmö (corporate-office/manufacturing city marker)",
    "latitude": 55.605,
    "longitude": 13.0038,
    "legacyCompanyDescription": "自有水性木器成品涂料配方研发制造企业；NL-W1201具体兼容、使用与采购未确认",
    "fit": "可开发候选",
    "signal": "实际下载原始TrafficGO EPD10页（2024-09-16发布、注明有效至2029-09-15；持续登记有效性未另行作认证承诺），公司/生产章节明示BonaAB制造木地板漆、Malmö/Sweden生产和self-crosslinking waterborne polyurethane topcoat；生产LCA基础数据为2023，非2026采购或产量证明。80页原始2024–2025目录与当前公开产品页类别交叉核对。当前官方公开联系人页/产品页以BonaAB及556017-6488登记、Murmansgatan130/bona@bona.com/电话确认瑞典账户。EPDowner为BonaLtd，producer描述BonaAB，保留两字段区别，区域BonaLimited不另算新公司。NL-W1201木材应用仅支持技术评估，不承诺与TrafficGO体系兼容。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-14",
      "conclusion": "独立读取原始目录总体类别及相关adhesives/primers/woodlacquers/additive章节、当前公开类别及四项可见Additive+条目；实际完整阅读TanninShield2026-01-23、AntiSlip02/2026与Retarder2025-08-26原始TDS。TanninShield为预聚脂肪族异氰酸酯类木提取物阻隔添加剂；AntiSlip为100%固体PP颗粒防滑，不是PO水性乳液；Retarder/Extender为缓干/延长开放时间、Toner为颜料着色；D501/R540等为终端施工的成品基材底漆。所查范围未发现对外供应水性PO乳液、CPO/PO分散体或原料附着促进剂；限实际审读的公开范围，不称所有国家全部SKU/SDS穷尽。自用PUD研发不等同对外卖PO分散体。原始目录2024–25不是2026新目录；2026TrafficGO和Toner英语TDS原网址404，未称取得/已核验新版本。Bona原生HTML仅JS提示不作经营范围证明，当前公开渲染/搜索原文与可下载原始文件分开记录。按BonaAB/BonaKemi/区域Limited/NV、域名、Malmö地址与邮箱核对main192（去重于2026-10-15提交c9427561复核，本地206亦无同一账户），无同一账户；FCP Cerea城市Bonavicina的词片段不是Bona集团。EPD联系人BjornJohansson未披露采购/技术职位，不作为个人开发信收件人；英国2024–25名单不冒充今日瑞典采购团队。"
    },
    "contact": {
      "label": "公开一般业务入口；未核实具名采购或技术负责人，当前采购需求和时机待确认",
      "email": "bona@bona.com",
      "phone": "+46 40 385 500",
      "contactUrl": "https://www.bona.com/en/about-bona/contact-us/"
    },
    "source": {
      "label": "Original live TrafficGO EPD,2024-09-16: ownSwedishmanufacture and waterborne wood floor lacquer; LCAdata2023",
      "url": "https://www.bona.com/globalassets/catalogassets/epd-bona-traffic-go.pdf"
    },
    "checkedAt": "2026-10-14"
  },
  {
    "id": "v33-domblans",
    "company": "V33 S.A. (V33 Group / Plastor)",
    "productId": "nl-w1201",
    "country": "France",
    "countryZh": "法国",
    "city": "Domblans (registered-office/manufacturing city marker)",
    "latitude": 46.7665,
    "longitude": 5.5975,
    "legacyCompanyDescription": "自有水性木器成品涂料配方研发制造企业；NL-W1201具体兼容、使用与采购未确认",
    "fit": "可开发候选",
    "signal": "当前V33自有网页明确设计/制造木器涂料及水性木器产品，法定登记V33SA和Domblans总部独立确认，品牌页明确Plastor为同集团品牌。当前Plastor官网真实链接的原始PUR-T4五页TDS（2025-02-21）及法国制造标识、最后生产体系章节明示两组分水性polycarbonate成品清漆和室内木地板用途，非原料乳液供应证明。V33France公开一般业务邮箱从同一页面两份浏览器公开编码独立还原一致为contactgroupe@v33.com，无猜名/拼邮箱；Plastor技术电话另有明确入口。NL-W1201仅支持木材原料评估，客户自身pH9±0.5/固含30±2不转作我方参数。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-14",
      "conclusion": "当前V33完整集团品牌类别、Plastor全可见产品分类、四款补充primer类别及实际WBPR21P/PRIMUNIV/Plastepox叶页审读；原始PURT4为配制好的木器终端涂料。WBPR21P为直接施工的混凝土基材底漆；Plastepox树脂/硬化剂是配套地坪primer系统，不因Resine或Primer名称当作rawPO/CPO或原料附着促进剂。所查公开范围未发现上述NL同类原料对外销售；Plastor店铺首12项/11分页不是全部SKU审读，PRIMUNIV可读正文有限，不臆断化学配方；集团普通木器蜡/油/成品底漆亦不等同PO原料乳液。按V33SA/V33Group/Plastor/Liberon/CecilProfessionnel/Hypnotik/区域子公司、主与品牌域名、Domblans两明确地址/mail核对main192（去重于2026-10-15提交c9427561复核，本地206亦无同一账户），无同一正式账户；各品牌/区域厂不拆新增。France当前客户洲际元数据缺失，正式新增后只增加France→Europe，既有国家不变。CF公开两份编码确定性解码得到原文字邮箱，与按人名拼造邮箱完全区分；不采用新闻/隐私联系人冒充采购。"
    },
    "contact": {
      "label": "公开一般业务入口；未核实具名采购或技术负责人，当前采购需求和时机待确认",
      "email": "contactgroupe@v33.com",
      "phone": "+33 3 84 35 00 33",
      "contactUrl": "https://en.groupev33.com/nous-contacter"
    },
    "source": {
      "label": "Original current PlastorPUR-T4 five-pageTDS,revised2025-02-21: ownFrenchmanufacture andaqueouswoodfloorvarnish",
      "url": "https://dxm.dam.v33.com/api/wedia/dam/variation/4at5pr6th3mqharw6r1q7qpaco/pdf"
    },
    "checkedAt": "2026-10-14"
  },
  {
    "id": "blanchon-saint-priest",
    "company": "Blanchon SAS (Blanchon Group)",
    "productId": "nl-w1201",
    "country": "France",
    "countryZh": "法国",
    "city": "Saint-Priest (registered-office city marker)",
    "latitude": 45.6968,
    "longitude": 4.9442,
    "legacyCompanyDescription": "自有水性木器成品涂料配方研发制造企业；NL-W1201具体兼容、使用与采购未确认",
    "fit": "可开发候选",
    "signal": "当前自有集团制造/R&D描述与法国原始LasureTechWood两页TDS（May2024）互证自身研发/法国成品制造，明确aqueous polyurethane-acrylic wood stain用于垂直外木材；原始文件法定BLANCHONSAS/RCS390112886及SaintPriest地址、一般邮箱blanchon@blanchon.com与当前公司法律页/技术电话核对。公司法律页RCS漏一位，完整号码仅引用原始TDS，不补猜网页。NL-W1201支持木材原料评估，不将TechWood的UV/adhesion/认证性能或参数转用我方乳液。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-14",
      "conclusion": "独立审读当前集团/专业产品类别、七款木器lasures、实际TechWood及ConditionneurAntiUV原始TDS、Ciranova/Carver/BlanchonTech可见业务范围。Conditionneur/SuperBond是直接施工的成品木材或硬质基材底涂，不是stir-in原料附着剂。按原始2024-12-03收购公告确认DrSchutz纳入同集团，再审读当前其专业全类别与原始2023目录64页相关primer/additive/woodfinish章节：DuroPlusL为耐刮/消光，Decelerator为缓干，FlexAdd增柔，R10/R11为防滑结构添加，eukula prime adds为颜料；保留这些实际添加剂销售事实，未从名称推定为PO/CPO。所查公开范围未发现对外供应水性PO乳液、CPO/PO分散体或rawadhesionpromoter；不是所有集团全球SKU/SDS穷尽检查，未臆定FlexAdd/R10完整成分。公告Rigo/Bigler等关联如实保留，品牌/工厂/子公司不另计新增。按BlanchonSAS/Group/Syntilor/Ciranova/Carver/Rigo/Bigler/DrSchutz/eukula、域名、SaintPriest地址/mail核对main192（去重于2026-10-15提交c9427561复核，本地206亦无同一账户）无同一正式账户。供应伙伴Allnex/Univar不是自身原料售卖业务或确认NL采购证据；隐私邮箱dpo不作开发信。"
    },
    "contact": {
      "label": "公开一般业务入口；未核实具名采购或技术负责人，当前采购需求和时机待确认",
      "email": "blanchon@blanchon.com",
      "phone": "+33 4 72 89 06 06",
      "contactUrl": "https://www.blanchon.com/professionnels/contact"
    },
    "source": {
      "label": "Original currentLasureTechWood two-pageTDS,May2024: ownFrenchaqueousPU-acrylicwoodstain/legalmanufacturermail",
      "url": "https://www.blanchon.com/media/docs-pdf/FT_Lasure_Tech-Wood_052024.pdf"
    },
    "checkedAt": "2026-10-14"
  },
  {
    "id": "dampney-everett",
    "company": "Dampney Company, Inc.",
    "productId": "elo",
    "country": "United States",
    "countryZh": "美国",
    "city": "Everett (manufacturing and office city marker)",
    "latitude": 42.4084,
    "longitude": -71.0537,
    "legacyCompanyDescription": "成品防护涂料配方研发/制造企业；ELO 具体适配、原料采购与需求未确认",
    "fit": "可开发候选",
    "signal": "当前自有About页面明确Everett工厂、配方维护/批次生产和产品实验室，证明自身配方与制造。当前Endcor700C页真实链接的原始四页TDS标明polyamide-cured epoxy成品涂料，用于工业、化工及海洋环境中的钢和混凝土；法定公司名、Everett地址及sales业务邮箱在原件底栏公开。保留印刷01/09 Rev.，不把搜索引擎近期收录当作新版；原件内部分技术数值不一致，不据此编造参数或转给ELO。ELO仅按通用涂料TDS应用提出潜在工厂配方评估，不建议现场向700C加料。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-15",
      "conclusion": "独立读取当前产品全部三个可见分页及全类别、五种thinner/cleaner类别、Alvin成品修补材料与真实Endcor700C原始TDS。Thurmalox/Endcor/Epodur/Apexior等为成品涂料，Alvin的Lab-metal/Hi-Temp Lab-metal为直接使用的金属修补材料；thinner/cleaner不因是配套耗材就等同ELO/ESBO或生物增塑油。所查公开业务范围未发现ELO、ESBO、环氧化植物油或同类生物增塑/稳定原料对外销售；不声称已读取所有旧文件或每份SDS。按Dampney/Alvin/Thurmalox/Epodur/Apexior/StovePaint及域名、地址/mail核对最新main195及本地客户，无同一账户，品牌与网址不拆分新增。"
    },
    "contact": {
      "label": "公开公司/部门业务入口；不推定具名采购身份，实际需求与时机待确认",
      "email": "sales@dampney.com",
      "phone": "+1 617 389 2805",
      "contactUrl": "https://www.dampney.com/Contact-Us"
    },
    "source": {
      "label": "Current Endcor 700C own epoxy-polyamide finished coating and real original-document links",
      "url": "https://www.dampney.com/Product-Line/AT/View/PID/43/Endcor-700C"
    },
    "checkedAt": "2026-10-15"
  },
  {
    "id": "sauereisen-pittsburgh",
    "company": "Sauereisen, Inc.",
    "productId": "elo",
    "country": "United States",
    "countryZh": "美国",
    "city": "Pittsburgh (corporate and manufacturing city marker)",
    "latitude": 40.4406,
    "longitude": -79.9959,
    "legacyCompanyDescription": "成品防护涂料配方研发/制造企业；ELO 具体适配、原料采购与需求未确认",
    "fit": "可开发候选",
    "signal": "当前自有首页明确Pittsburgh持续自有研发制造防腐材料；当前木器无关的市政污水产品页与原始三页210XROL TDS互证其为辊涂环氧成品防护衬里，保护污水处理/收集结构的混凝土。原件标October2020，末页法定SauereisenInc与160Gamma地址，未伪称2026新版；能力手册印刷layout7/20/09，只作历史能力辅证。ELO匹配通用涂料制造，不从公司衬里耐化学性反推我方实测性能。原件禁止施工时额外加溶剂/助剂，潜在工厂配方评估不等同现场掺料。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-15",
      "conclusion": "独立读取当前整个产品类别导航、原始能力手册相关页、污水成品聚合物衬里、五种应用型primer、membranes/joint-sealants和无机陶瓷cement范围。220T确实另售，但原文明示为提高垂直接缝料粘度的thixotropy助剂；不隐藏其销售，也不猜测完整组成或称其为ELO/ESBO。ConoFlex/Fib-R-Thane/69/950等是直接施工的成品衬里/接缝胶，非原料生物增塑油；primer亦为直接施工层。所查范围未发现ELO、ESBO、环氧化植物油或同类生物增塑/稳定原料销售。网站corrosion/ceramic索引部分动态列表未完整渲染，不声称所有全球SKU/SDS穷尽审读。历史收购Nukem/CoatingsComposits/PoconoFabricators及SewerGard/Pre-Krete等关联保留；Metz/Glassbond列为制造伙伴，不臆称子公司。按主体、关联名/品牌、域名、地址与邮箱核对main195及本地客户，无重复，同集团不拆新增。"
    },
    "contact": {
      "label": "公开公司/部门业务入口；不推定具名采购身份，实际需求与时机待确认",
      "email": "info@sauereisen.com",
      "phone": "+1 412 963 0303",
      "contactUrl": "https://www.sauereisen.com/contact/"
    },
    "source": {
      "label": "Original currently linked three-page SewerGard 210XROL TDS; October 2020 retained",
      "url": "https://www.sauereisen.com/wp-content/uploads/210XROL-2.pdf"
    },
    "checkedAt": "2026-10-15"
  },
  {
    "id": "enecon-medford",
    "company": "ENECON Corporation",
    "productId": "elo",
    "country": "United States",
    "countryZh": "美国",
    "city": "Medford (manufacturing and headquarters city marker)",
    "latitude": 40.8179,
    "longitude": -72.9983,
    "legacyCompanyDescription": "成品防护涂料配方研发/制造企业；ELO 具体适配、原料采购与需求未确认",
    "fit": "可开发候选",
    "signal": "当前自有About/FAQ明确其研发制造聚合物涂料，FAQ将实际生产定位Medford；制造岗位页另作工厂活动互证，未把无日期招聘转成已核实扩产项目。当前CHEMCLADSC产品页链接原始两页技术文件，明确双组分成品聚合物防护涂料及刷/辊涂设备结构用途，保留copyright2026和印刷代码20260406。FAQ另明确现有原料来自USA sources，保留此采购政策限制；不推定原料原产地、进口牌号准入或会向中国供应商采购。ELO仅按涂料TDS应用作为潜在配方评估，绝不继承客户饮用水/NSF等认证或具体体系性能。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-15",
      "conclusion": "独立读取当前完整可见METALCLAD/FLEXICLAD/ENECRETE/CHEMCLAD/ENESEAL/ENECLAD/SAFETYCLAD/ENEFLOW产品家族说明和实际P4C、FLEXICLADER、ENEFLOW叶页。P4C是施工于混凝土的成品底涂；FLEXICLADER是直接修补柔性部件的成品双组分体系；ENEFLOW是磁性装置，不能把stabilizepH一词当作化学原料稳定剂销售。当前Family公开关联EA磁件业务及FederatedPackaging包装机械/用品读到的实际范围亦记录，未发现相关ELO/ESBO/环氧化植物油/生物增塑油原料业务；未声称所有关联公司每个SKU/SDS已穷尽审读。各国代表/经销商并非自动其采购部门或新增公司。按ENECON/CHEMCLAD/相关家族名及域名/Medford地址/邮箱核对main195及本地客户，无重复，不混淆ENERCON工程公司、Ennoconn电子公司或Enron。SDS需要提交表单的入口未提交，不称已取得受限SDS。"
    },
    "contact": {
      "label": "公开公司/部门业务入口；不推定具名采购身份，实际需求与时机待确认",
      "email": "info@enecon.com",
      "phone": "+1 516 349 0022",
      "contactUrl": "https://www.enecon.com/contact.asp"
    },
    "source": {
      "label": "Original two-page CHEMCLAD SC technical sheet; copyright 2026 and printed code 20260406",
      "url": "https://www.enecon.com/pdfs/CHEMCLAD_SC.pdf"
    },
    "checkedAt": "2026-10-15"
  },
  {
    "id": "fertiberia-madrid",
    "company": "Fertiberia, S.A. (Grupo Fertiberia)",
    "productId": "fertilizer-coating",
    "country": "Spain",
    "countryZh": "西班牙",
    "city": "Madrid (group headquarters city marker)",
    "latitude": 40.4168,
    "longitude": -3.7038,
    "legacyCompanyDescription": "NERGETIC聚合物包覆调控养分释放肥料研发制造集团；我方原料适配、采购和准入未确认",
    "fit": "可开发候选",
    "signal": "当前自有C-PRO页明确该聚合物技术应用于NERGETIC COMPLETE成品肥料，在颗粒周围形成物理屏障并调控养分逐步释放；当前NERGETIC DS+页明确聚合物围绕肥粒并另含硝化抑制剂。西班牙农业部当前产品记录将同系列NERGETIC COMPLETE NPK NSAFE的Fabricante列为FERTIBERIA SA；公司当前制造/工厂页面及其技术负责人2022年4月26日公开原始访谈中对自身NERGETIC生产试验的说明互证下游制造角色。并非仅凭普通尿素厂或产品品牌推定包衣加工。C-PRO为客户自己的技术，不推定是PU、不推定符合特定控释释放期/法规测试，也不将其认证或效果移用于我方原料。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-15",
      "conclusion": "独立读取当前自有C-PRO/NERGETIC成品产品、农业/工业业务分区、制造与集团页面，以及农业部制造商记录和公司技术负责人原始公开访谈。所见C-PRO为嵌入自家成品肥料的技术介绍，未发现其作为独立原料包衣剂、PU原料或包衣树脂对外销售的实际产品入口；自家成品包覆技术与出售同类原料分开判断。工业业务公开销售尿素、氨、硝酸/硝酸盐、锶盐及AdBlue等，不因一般化工原料供应而自动等同本项目肥料包膜原料，也不谎称所有全球SKU已穷尽审读。保留ADP/Fertiberia France/Hellas/Van de Reijt/2F Ouest/Agralia/Intergal/Fercampo/Exceed/Trichodex(TRIXIA)关联与Triton当前投资组合关系，不拆地区、子公司或品牌制造新增。已按这些名称及域名在最新main199家和本地未发布客户中去重，无同账户；本次只收录集团代表账户一家。未发现公开采购本项目原料的RFQ、供应商准入或采购量，不能称正在采购/已使用/需要替换C-PRO。"
    },
    "contact": {
      "label": "公开公司通用业务入口；非具名采购或技术邮箱",
      "email": "fertiberia@fertiberia.es",
      "phone": "+34 91 586 62 00",
      "contactUrl": "https://www.fertiberia.com/contacta/"
    },
    "source": {
      "label": "Current own NERGETIC DS+ finished fertilizer: polymer surrounding granules plus nitrification inhibitor",
      "url": "https://www.fertiberia.com/productos/agricultura/nergetic-ds/"
    },
    "checkedAt": "2026-10-15"
  },
  {
    "id": "applied-chemical-technology-florence",
    "company": "Applied Chemical Technology, Inc. (ACT)",
    "productId": "fertilizer-coating",
    "country": "United States",
    "countryZh": "美国",
    "city": "Florence, Alabama (laboratory and pilot-facility city marker)",
    "latitude": 34.7998,
    "longitude": -87.6773,
    "legacyCompanyDescription": "控释肥包衣研发与中试加工服务企业；原料适配及采购待确认",
    "fit": "可开发候选",
    "signal": "当前自有肥料研发页明确控释/缓释包衣肥料、聚合物包衣中的urethane/epoxy等实际研发业务；独立读取bench-scale coating正文，明确其已开发多种包衣产品、养分利用/延迟释放包衣及实际使用过的涂层材料。当前真实Facilities and Equipment页列出自有中试空间、coating drums/fluid beds和熔融尿素处理；原始Pilot Plant Services文件明确中试提供实际产品样品，并说明已完成项目及客户拥有所开发技术/产品。About将其实验室和中试设施定位Florence-Lauderdale Industrial Park。资格依据实际肥料包衣研发、中试加工和用料活动，不能仅凭其制造设备或项目设计服务。不是规模化商品肥料产量、标准SKU或当前订单的认定。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-15",
      "conclusion": "独立审读当前完整可见Services/Equipment导航及肥料研发、bench-scale coating、实际中试设备、公司业务与原始Pilot Plant Services相关内容。Coating Materials中的waxes/epoxy/sulfur/urethanes/latex/resins/PVA/polymers是Past Coating Experience用料清单，不能误认成对外出售包膜树脂或PU原料的商品目录。设备销售、工程设计和客户所有IP/产品的试验研发与配套原料销售分开判断；所查范围未发现与我方同类包膜原料、包膜树脂或PU原料对外销售的实际商品入口。没有把其自称world leader、千项经验或历史场地数字当当前采购量。按Applied Chemical Technology/ACT、appliedchemical.com、Florence及已公开创办主体线索核对最新main200家和本地未发布客户，无同一账户；不混同中国同名化工/油田公司、其他ACT设备/涂料企业或把客户/合作伙伴当子公司。网站未给出需与既有客户合并的集团关系，不臆造其完全股权结构。"
    },
    "contact": {
      "label": "官方公司通用业务邮箱/电话；未核实具名采购或研发负责人",
      "email": "act@appliedchemical.com",
      "phone": "+1 256 760 9600",
      "contactUrl": "https://appliedchemical.com/contact-us/"
    },
    "source": {
      "label": "Current own fertilizer development scope: controlled-release coated fertilizers and urethane polymer-coating applications",
      "url": "https://appliedchemical.com/services/research-development/fertilizer/fertilizer-research-development-commercialization/"
    },
    "checkedAt": "2026-10-15"
  },
  {
    "id": "noroo-paint-anyang",
    "company": "NOROO Paint & Coatings Co., Ltd. (NOROO Group)",
    "productId": "elo",
    "country": "South Korea",
    "countryZh": "韩国",
    "city": "Anyang, Gyeonggi-do (approximate headquarters city marker)",
    "latitude": 37.3943,
    "longitude": 126.9568,
    "legacyCompanyDescription": "韩国成品工业防护涂料研发制造企业；NOROO集团一条，ELO配方适配及采购待确认",
    "fit": "可开发候选",
    "signal": "独立读取NOROO原始2025英文公司册PDF第4、6、7、14页：韩国经营主体自行制造及销售成品涂料，列有Anyang、Chilseo、Poseung工厂和自有研发中心；EVACOAT明确为用于工业建筑与工厂新建、维护的环氧防护涂料。当前R&D正文说明其涂料制造/销售与投资业务于2006年分离，官网当前重防腐涂料目录与集团化工业务页交叉印证成品涂料制造角色。仅将ELO与用户TDS所列通用涂料应用对应，不认定其配方含ELO、外购我方原料或正在采购。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-15",
      "conclusion": "按ELO产品单独审读当前NOROO经营主体制造/重防腐产品、集团化工和Bio业务、相关公司目录及R&C现行链接的原始综合目录。该集团确有涂料树脂及助剂业务，不能笼统称无原料销售。R&C原始PDF第21页经视觉核对：Hyres FA1300为epoxy ester phosphate acid金属附着力促进剂，FA5310/5330为改性聚酯颜料分散载体，FA6202/4312为丙烯酸共聚物流平/消泡剂；不是据此认定其销售环氧化植物油或生物增塑剂。附着力促进剂业务使其不作为NL-W1201目标；本条ELO资格仅依据独立审查的成品防护涂料制造和ELO相关原料边界。母公司2026-07-24公告将NAUSOL三种3-HP产品明示为工业清洗溶剂，不将生物来源自动等同生物增塑剂。所审范围未发现ELO、ESBO、环氧化植物油或同类增塑/稳定化原料商品；不声称审完集团全部SKU或证明永不销售此类材料，也未使用外购例外。对照最新main202家及本地未发布公司名/网站，未有NOROO经营集团账户。现有Kossan Paint(M)SdnBhd与NOROO有50:50马来西亚合资关系，另有IPK与AkzoNobel合资关联；这些合作不证明两个母公司同一经营主体或共同控制，不把JV/分支另算新客户。韩国NOROO自身工厂/总部及2006经营主体分别有原始证据，本次仅新增这个韩国经营集团一条，不借1945品牌历史、2006分拆或海外别名制造新增。"
    },
    "contact": {
      "label": "官方Product Inquiries通用业务邮箱/电话；未核实采购或研发负责人",
      "email": "expoinfo@noroo.com",
      "phone": "+82 31 467 6473",
      "contactUrl": "https://noroopaint.com/EngProd/En/Company/Contact.asp"
    },
    "source": {
      "label": "Original company brochure named2025: own manufacture, Anyang/Chilseo/Poseung plants; EVACOAT epoxy protective coatings on actual PDF page14 (printed26–27)",
      "url": "https://m.noroopaint.com/file/2025%20NOROO%20BROCHURE_English.pdf"
    },
    "checkedAt": "2026-10-15"
  },
]

type LeadQualification = Pick<CompanyEvidence, 'applicationLayer' | 'applicationId'> & { targetCompanyTypeId: string }

const leadQualifications: Record<string, LeadQualification> = {
  "noroo-paint-anyang": {"targetCompanyTypeId":"elo-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"coatings"},
  "applied-chemical-technology-florence": {"targetCompanyTypeId":"controlled-release-fertilizer-manufacturer","applicationLayer":"tds-verified","applicationId":"controlled-release-fertilizer"},
  "fertiberia-madrid": {"targetCompanyTypeId":"controlled-release-fertilizer-manufacturer","applicationLayer":"tds-verified","applicationId":"controlled-release-fertilizer"},
  "enecon-medford": {"targetCompanyTypeId":"elo-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"coatings"},
  "sauereisen-pittsburgh": {"targetCompanyTypeId":"elo-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"coatings"},
  "dampney-everett": {"targetCompanyTypeId":"elo-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"coatings"},
  "blanchon-saint-priest": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "v33-domblans": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "bona-malmo": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "farrell-calhoun-memphis": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "induron-birmingham": {"targetCompanyTypeId":"elo-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"coatings"},
  "cloverdale-paint-surrey": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "diamond-vogel-orange-city": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "sansin-strathroy": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "rfcl-ramagundam": {"targetCompanyTypeId":"coated-urea-manufacturer","applicationLayer":"tds-verified","applicationId":"coated-urea"},
  "ppg-pittsburgh": {"targetCompanyTypeId":"elo-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"coatings"},
  "behr-santa-ana": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "benjamin-moore-montvale": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "asian-paints-mumbai": {"targetCompanyTypeId":"elo-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"coatings"},
  "sika-baar": {"targetCompanyTypeId":"elo-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"coatings"},
  "cifo-san-giorgio": {"targetCompanyTypeId":"slow-release-fertilizer-manufacturer","applicationLayer":"tds-verified","applicationId":"slow-release-fertilizer"},
  "coromandel-chennai": {"targetCompanyTypeId":"coated-urea-manufacturer","applicationLayer":"tds-verified","applicationId":"coated-urea"},
  "fcp-cerea-bonavicina": {"targetCompanyTypeId":"coated-compound-fertilizer-manufacturer","applicationLayer":"tds-verified","applicationId":"coated-compound-fertilizer"},
  "valresa-riba-roja": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "isaval-ribarroja": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "juno-erandio": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "gubretas-istanbul": {"targetCompanyTypeId":"slow-release-fertilizer-manufacturer","applicationLayer":"tds-verified","applicationId":"slow-release-fertilizer"},
  "toros-agri-istanbul": {"targetCompanyTypeId":"coated-compound-fertilizer-manufacturer","applicationLayer":"tds-verified","applicationId":"coated-compound-fertilizer"},
  "paradeep-phosphates-bhubaneswar": {"targetCompanyTypeId":"coated-urea-manufacturer","applicationLayer":"tds-verified","applicationId":"coated-urea"},
  "axalta-philadelphia": {"targetCompanyTypeId":"elo-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"coatings"},
  "mahadhan-agritech-pune": {"targetCompanyTypeId":"coated-compound-fertilizer-manufacturer","applicationLayer":"tds-verified","applicationId":"coated-compound-fertilizer"},
  "vital-agri-nutrients-lahore": {"targetCompanyTypeId":"coated-urea-manufacturer","applicationLayer":"tds-verified","applicationId":"coated-urea"},
  "polyvine-cheddar": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "bedec-dunmow": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "ivm-chemicals-parona": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "rustins-london": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "mylands-london": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "morrells-stockport": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "fiddes-cardiff": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "verinlegno-massa-cozzile": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "pvcfc-ca-mau": {"targetCompanyTypeId":"coated-urea-manufacturer","applicationLayer":"tds-verified","applicationId":"coated-urea"},
  "incitec-pivot-fertilisers-melbourne": {"targetCompanyTypeId":"coated-urea-manufacturer","applicationLayer":"tds-verified","applicationId":"coated-urea"},
  "troforte-innovations-wangara": {"targetCompanyTypeId":"controlled-release-fertilizer-manufacturer","applicationLayer":"tds-verified","applicationId":"controlled-release-fertilizer"},
  "dura-paints-edenvale": {"targetCompanyTypeId":"elo-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"coatings"},
  "teknos-helsinki": {"targetCompanyTypeId":"elo-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"coatings"},
  "remmers-loeningen": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "mipa-essenbach": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "berger-seidle-gruenstadt": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "ballance-tauranga": {"targetCompanyTypeId":"coated-urea-manufacturer","applicationLayer":"tds-verified","applicationId":"coated-urea"},
  "hesse-lignal-hamm": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "medal-paints-johannesburg": {"targetCompanyTypeId":"elo-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"coatings"},
  "kupsa-oyon": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "kofarb-czestochowa": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "soilmate-bangkok": {"targetCompanyTypeId":"controlled-release-fertilizer-manufacturer","applicationLayer":"tds-verified","applicationId":"controlled-release-fertilizer"},
  "pv-paint-ho-chi-minh": {"targetCompanyTypeId":"elo-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"coatings"},
  "specialized-coating-systems-boksburg": {"targetCompanyTypeId":"elo-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"coatings"},
  "protectometal-ciudad-mexico": {"targetCompanyTypeId":"elo-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"coatings"},
  "pinturas-jemah-nuevo-leon": {"targetCompanyTypeId":"elo-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"coatings"},
  "nervion-tlalnepantla": {"targetCompanyTypeId":"elo-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"coatings"},
  "chugoku-marine-paints-tokyo": {"targetCompanyTypeId":"elo-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"coatings"},
  "hempel-lyngby": {"targetCompanyTypeId":"elo-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"coatings"},
  "bvfcl-namrup": {"targetCompanyTypeId":"coated-urea-manufacturer","applicationLayer":"tds-verified","applicationId":"coated-urea"},
  "hurl-new-delhi": {"targetCompanyTypeId":"coated-urea-manufacturer","applicationLayer":"tds-verified","applicationId":"coated-urea"},
  "kribhco-hazira": {"targetCompanyTypeId":"coated-urea-manufacturer","applicationLayer":"tds-verified","applicationId":"coated-urea"},
  "renner-italia-minerbio": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "vermont-natural-coatings-hardwick": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "target-coatings-fair-lawn": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "general-finishes-east-troy": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "chambal-fertilizers-gadepan": {"targetCompanyTypeId":"coated-urea-manufacturer","applicationLayer":"tds-verified","applicationId":"coated-urea"},
  "madras-fertilizers-manali": {"targetCompanyTypeId":"coated-urea-manufacturer","applicationLayer":"tds-verified","applicationId":"coated-urea"},
  "national-fertilizers-nangal": {"targetCompanyTypeId":"coated-urea-manufacturer","applicationLayer":"tds-verified","applicationId":"coated-urea"},
  "iffco-kalol": {"targetCompanyTypeId":"coated-urea-manufacturer","applicationLayer":"tds-verified","applicationId":"coated-urea"},
  "duraway-coating-kapar": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "elchemus-bukit-mertajam": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "mowilex-indonesia-cikande": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  "tectona-warna-cirebon": {"targetCompanyTypeId":"waterbased-wood-coating-manufacturer","applicationLayer":"tds-verified","applicationId":"wood-surface-treatment"},
  'kg-chemical-ulsan': { targetCompanyTypeId: 'coated-compound-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-compound-fertilizer' },
  'hankook-hyeophwa-pohang': { targetCompanyTypeId: 'coated-compound-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-compound-fertilizer' },
  'namhae-chemical-yeosu': { targetCompanyTypeId: 'coated-compound-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-compound-fertilizer' },
  'rcf-mumbai': { targetCompanyTypeId: 'coated-urea-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-urea' },
  'agrotiger-mabalacat': { targetCompanyTypeId: 'coated-compound-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-compound-fertilizer' },
  'chobi-ulsan': { targetCompanyTypeId: 'polymer-coated-urea-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-urea' },
  'greenfeed-agro-shah-alam': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'saraswanti-anugerah-indonesia-mempawah': { targetCompanyTypeId: 'coated-compound-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-compound-fertilizer' },
  'adubos-paranaiba-uberlandia': { targetCompanyTypeId: 'coated-compound-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-compound-fertilizer' },
  'indigrow-brimpton': { targetCompanyTypeId: 'polymer-coated-urea-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-urea' },
  'lebanon-seaboard-lebanon': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'follmann-minden': { targetCompanyTypeId: 'waterborne-ink-manufacturer', applicationLayer: 'market-extended', applicationId: 'waterborne-ink-anchorage-on-pp-pe' },
  'mapei-india-bengaluru': { targetCompanyTypeId: 'adhesive-manufacturer', applicationLayer: 'tds-verified', applicationId: 'adhesives' },
  'plantacote-herentals': { targetCompanyTypeId: 'coated-compound-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-compound-fertilizer' },
  'siegwerk-siegburg': { targetCompanyTypeId: 'waterborne-ink-manufacturer', applicationLayer: 'market-extended', applicationId: 'waterborne-ink-anchorage-on-pp-pe' },
  'jowat-detmold': { targetCompanyTypeId: 'adhesive-manufacturer', applicationLayer: 'tds-verified', applicationId: 'adhesives' },
  'knox-fertilizer-knox': { targetCompanyTypeId: 'polymer-coated-urea-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-urea' },
  'andersons-maumee': { targetCompanyTypeId: 'polymer-coated-urea-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-urea' },
  'doneck-euroflex-grevenmacher': { targetCompanyTypeId: 'waterborne-ink-manufacturer', applicationLayer: 'market-extended', applicationId: 'waterborne-ink-anchorage-on-pp-pe' },
  'wikoff-fort-mill': { targetCompanyTypeId: 'waterborne-ink-manufacturer', applicationLayer: 'market-extended', applicationId: 'waterborne-ink-anchorage-on-pp-pe' },
  'aurora-material-streetsboro': { targetCompanyTypeId: 'pvc-compound-manufacturer', applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' },
  'sun-agro-tokyo': { targetCompanyTypeId: 'coated-compound-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-compound-fertilizer' },
  'katakura-coop-akita': { targetCompanyTypeId: 'coated-compound-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-compound-fertilizer' },
  'gefink-burzaco': { targetCompanyTypeId: 'waterborne-ink-manufacturer', applicationLayer: 'market-extended', applicationId: 'waterborne-ink-anchorage-on-pp-pe' },
  'colorprint-coseano': { targetCompanyTypeId: 'waterborne-ink-manufacturer', applicationLayer: 'market-extended', applicationId: 'waterborne-ink-anchorage-on-pp-pe' },
  'manner-polymers-mckinney': { targetCompanyTypeId: 'pvc-compound-manufacturer', applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' },
  'vernital-cercola': { targetCompanyTypeId: 'elo-anticorrosion-coating-formulator', applicationLayer: 'market-extended', applicationId: 'elo-anticorrosion-coating-research' },
  'duramax-cascavel': { targetCompanyTypeId: 'elo-anticorrosion-coating-formulator', applicationLayer: 'market-extended', applicationId: 'elo-anticorrosion-coating-research' },
  'marincoat-calvignasco': { targetCompanyTypeId: 'elo-coating-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coatings' },
  'rynan-smart-fertilizers-long-duc': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'pungnong-seoul': { targetCompanyTypeId: 'coated-compound-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-compound-fertilizer' },
  'ec-grow-eau-claire': { targetCompanyTypeId: 'polymer-coated-urea-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-urea' },
  'sumika-agro-niihama': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'nousbo-ulsan': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'dupan-anugerah-lestari-pungging': { targetCompanyTypeId: 'coated-compound-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-compound-fertilizer' },
  'hanampi-sejahtera-kahuripan-gresik': { targetCompanyTypeId: 'coated-urea-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-urea' },
  'dgo-defix-phu-nghia': { targetCompanyTypeId: 'elo-anticorrosion-coating-formulator', applicationLayer: 'market-extended', applicationId: 'elo-anticorrosion-coating-research' },
  'son-mien-bac-hung-yen': { targetCompanyTypeId: 'elo-anticorrosion-coating-formulator', applicationLayer: 'market-extended', applicationId: 'elo-anticorrosion-coating-research' },
  'dolphin-inks-thane': { targetCompanyTypeId: 'waterborne-ink-manufacturer', applicationLayer: 'market-extended', applicationId: 'waterborne-ink-anchorage-on-pp-pe' },
  'toa-paint-products-nilai': { targetCompanyTypeId: 'elo-anticorrosion-coating-formulator', applicationLayer: 'market-extended', applicationId: 'elo-anticorrosion-coating-research' },
  'jotun-paints-malaysia-shah-alam': { targetCompanyTypeId: 'elo-anticorrosion-coating-formulator', applicationLayer: 'market-extended', applicationId: 'elo-anticorrosion-coating-research' },
  'mc-ferticom-tokyo': { targetCompanyTypeId: 'coated-urea-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-urea' },
  'agroplanta-batatais': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'moravia-istanbul': { targetCompanyTypeId: 'elo-anticorrosion-coating-formulator', applicationLayer: 'market-extended', applicationId: 'elo-anticorrosion-coating-research' },
  'fortgreen-varginha': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'grupo-equilibrio-catalao': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'harrells-sylacauga': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'icl-charleston': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'haifa-israel': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'crf-agritech-st-thomas': { targetCompanyTypeId: 'polymer-coated-urea-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-urea' },
  'compo-expert-krefeld': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'florikan-bowling-green': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'genus-brunswick': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'pol-coatings-twello': { targetCompanyTypeId: 'primer-adhesion-promoter-formulator', applicationLayer: 'tds-verified', applicationId: 'untreated-pp-primer' },
  'plastchem-hardenberg': { targetCompanyTypeId: 'pvc-compound-manufacturer', applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' },
  'pursell-sylacauga': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'cotex-dartmouth': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'simofert-beuningen': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'sk-specialties-sibu': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'smart-fert-klang': { targetCompanyTypeId: 'polymer-coated-urea-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-urea' },
  'simplot-boise': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'agrofarm-ponorogo': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'twin-arrow-shah-alam': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'agro-berjaya-mojokerto': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'diversatech-bangi': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'farmhannong-ulsan': { targetCompanyTypeId: 'polymer-coated-urea-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-urea' },
  'jcam-agri-tokyo': { targetCompanyTypeId: 'polymer-coated-urea-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-urea' },
  'vinyl-base-ipoh': { targetCompanyTypeId: 'pvc-compound-manufacturer', applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' },
  'schramm-coatings-offenbach': { targetCompanyTypeId: 'primer-adhesion-promoter-formulator', applicationLayer: 'tds-verified', applicationId: 'untreated-pp-primer' },
  'periwal-bhiwadi': { targetCompanyTypeId: 'pvc-compound-manufacturer', applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' },
  'turf-care-martins-ferry': { targetCompanyTypeId: 'polymer-coated-urea-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-urea' },
  'omega-polimeros-trujui': { targetCompanyTypeId: 'pvc-compound-manufacturer', applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' },
  'supernovae-funza': { targetCompanyTypeId: 'pvc-compound-manufacturer', applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' },
  'vivacor-diadema': { targetCompanyTypeId: 'waterborne-ink-manufacturer', applicationLayer: 'market-extended', applicationId: 'waterborne-ink-anchorage-on-pp-pe' },
  'agrobiotech-jardinopolis': { targetCompanyTypeId: 'polymer-coated-urea-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-urea' },
  'mica-shelton': { targetCompanyTypeId: 'primer-adhesion-promoter-formulator', applicationLayer: 'tds-verified', applicationId: 'untreated-pp-primer' },
  'ac-profil-huttwil': { targetCompanyTypeId: 'pvc-compound-manufacturer', applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' },
  'nutrien-carseland': { targetCompanyTypeId: 'polymer-coated-urea-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-urea' },
  'ichemco-cuggiono': { targetCompanyTypeId: 'primer-adhesion-promoter-formulator', applicationLayer: 'tds-verified', applicationId: 'pe-primer' },
  'polymer-chemie-bad-sobernheim': { targetCompanyTypeId: 'pvc-compound-manufacturer', applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' },
  'aqua-based-us': { targetCompanyTypeId: 'primer-adhesion-promoter-formulator', applicationLayer: 'tds-verified', applicationId: 'untreated-pp-primer' },
  'deltachem-born': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'cic-mckinney': { targetCompanyTypeId: 'coating-manufacturer', applicationLayer: 'tds-verified', applicationId: 'untreated-pp-primer' },
  'polyflex-baltic': { targetCompanyTypeId: 'pvc-compound-manufacturer', applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' },
  'stir-barletta': { targetCompanyTypeId: 'pvc-compound-manufacturer', applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' },
  'paramelt-netherlands': { targetCompanyTypeId: 'alternative-primer-supplier', applicationLayer: 'tds-verified', applicationId: 'untreated-pp-primer' },
  'nippon-paper-japan': { targetCompanyTypeId: 'alternative-primer-supplier', applicationLayer: 'tds-verified', applicationId: 'untreated-pp-primer' },
  'aline-detroit': { targetCompanyTypeId: 'alternative-primer-supplier', applicationLayer: 'tds-verified', applicationId: 'untreated-pp-primer' },
  'rstone-jiaxing': { targetCompanyTypeId: 'alternative-primer-supplier', applicationLayer: 'tds-verified', applicationId: 'untreated-pp-primer' },
  'tize-zhaoqing': { targetCompanyTypeId: 'alternative-primer-supplier', applicationLayer: 'tds-verified', applicationId: 'untreated-pp-primer' },
  'tramaco-tornesch': { targetCompanyTypeId: 'alternative-primer-supplier', applicationLayer: 'tds-verified', applicationId: 'untreated-pp-primer' },
  'unitika-tokyo': { targetCompanyTypeId: 'alternative-primer-supplier', applicationLayer: 'tds-verified', applicationId: 'untreated-pp-primer' },
  'polar-canada': { targetCompanyTypeId: 'alternative-elo-supplier', applicationLayer: 'tds-verified', applicationId: 'coatings' },
  'cargill-minneapolis': { targetCompanyTypeId: 'alternative-elo-supplier', applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' },
  'acs-griffith': { targetCompanyTypeId: 'alternative-elo-supplier', applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' },
  'inbra-orangeburg': { targetCompanyTypeId: 'pvc-compound-manufacturer', applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' },
  'adeka-tokyo': { targetCompanyTypeId: 'alternative-elo-supplier', applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' },
  'traditem-hilden': { targetCompanyTypeId: 'alternative-elo-supplier', applicationLayer: 'tds-verified', applicationId: 'polymer-plasticizer' },
  'astra-chemtech-mumbai': { targetCompanyTypeId: 'primer-adhesion-promoter-formulator', applicationLayer: 'tds-verified', applicationId: 'untreated-pp-primer' },
  'nam-ah-ipoh': { targetCompanyTypeId: 'pvc-compound-manufacturer', applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' },
  'dacarto-osasco': { targetCompanyTypeId: 'pvc-compound-manufacturer', applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' },
  'flint-group-malmo': { targetCompanyTypeId: 'waterborne-ink-manufacturer', applicationLayer: 'market-extended', applicationId: 'waterborne-ink-anchorage-on-pp-pe' },
  'inx-schaumburg': { targetCompanyTypeId: 'waterborne-ink-manufacturer', applicationLayer: 'market-extended', applicationId: 'waterborne-ink-anchorage-on-pp-pe' },
  'shakun-vadodara': { targetCompanyTypeId: 'pvc-compound-manufacturer', applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' },
  'pvc-colouring-ahmedabad': { targetCompanyTypeId: 'pvc-compound-manufacturer', applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' },
  'sun-chemical-parsippany': { targetCompanyTypeId: 'waterborne-ink-manufacturer', applicationLayer: 'market-extended', applicationId: 'waterborne-ink-anchorage-on-pp-pe' },
  'crf-malaysia-kuala-lumpur': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'cai-georgetown': { targetCompanyTypeId: 'waterborne-ink-manufacturer', applicationLayer: 'market-extended', applicationId: 'waterborne-ink-anchorage-on-pp-pe' },
  'applied-db-samut-prakan': { targetCompanyTypeId: 'pvc-compound-manufacturer', applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' },
  'ceccan-san-jose-iturbide': { targetCompanyTypeId: 'pvc-compound-manufacturer', applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' },
  'central-chemical-ube': { targetCompanyTypeId: 'polymer-coated-urea-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-urea' },
  'tintas-prisma-tlalnepantla': { targetCompanyTypeId: 'waterborne-ink-manufacturer', applicationLayer: 'market-extended', applicationId: 'waterborne-ink-anchorage-on-pp-pe' },
  'alpha-plast-devland': { targetCompanyTypeId: 'pvc-compound-manufacturer', applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' },
  'mivena-maastricht': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'greenbest-henstridge': { targetCompanyTypeId: 'polymer-coated-urea-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-urea' },
  'palini-vernici-pisogne': { targetCompanyTypeId: 'primer-adhesion-promoter-formulator', applicationLayer: 'tds-verified', applicationId: 'abs-surface-treatment' },
  'sankhla-industries-bengaluru': { targetCompanyTypeId: 'pvc-compound-manufacturer', applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' },
}

function originOf(url: string) {
  try { return new URL(url).origin } catch { return undefined }
}

function looksLikeContactPage(url?: string) {
  return Boolean(url && /(contact|our-experts|contact-us)/i.test(url))
}

function departmentFor(label: string): DepartmentEmail['department'] | undefined {
  if (/sales/i.test(label)) return 'Sales'
  if (/technical|primer/i.test(label)) return 'Technical'
  return undefined
}

const profileOverrides: Record<string, Pick<CompanyProfile, 'contacts' | 'departmentEmails'> & Partial<CompanyProfile>> = {
  "noroo-paint-anyang": {
    "website": "https://www.noroopaint.com/en/",
    "contactPage": "https://noroopaint.com/EngProd/En/Company/Contact.asp",
    "address": "351 Bakdal-ro, Manan-gu, Anyang-si, Gyeonggi-do, Republic of Korea. Korean headquarters/Anyang plant location identified in own brochure and current company information. Map coordinates are an approximate city marker, not verified plant GPS.",
    "generalEmail": "expoinfo@noroo.com",
    "generalPhone": "+82 31 467 6473",
    "generalEmailEvidence": {
      "company": "NOROO Paint & Coatings Co., Ltd. (NOROO Group)",
      "value": "expoinfo@noroo.com",
      "kind": "general",
      "publicBusiness": true,
      "sources": [
        {
          "label": "Current official contact body: market contacts distinguished from exact general Product Inquiries mailbox and telephone",
          "url": "https://noroopaint.com/EngProd/En/Company/Contact.asp",
          "summary": "Current own Contact page explicitly labels Product Inquiries and prints expoinfo@noroo.com under NOROO Paint & Coatings. This is a corporate product-inquiry route; no raw-material purchasing responsibility or named person inferred. Named market contacts on the same page are not collected for this record."
        }
      ],
      "verifiedAt": "2026-10-15"
    },
    "generalPhoneEvidence": {
      "company": "NOROO Paint & Coatings Co., Ltd. (NOROO Group)",
      "value": "+82 31 467 6473",
      "kind": "general",
      "publicBusiness": true,
      "sources": [
        {
          "label": "Current official contact body: market contacts distinguished from exact general Product Inquiries mailbox and telephone",
          "url": "https://noroopaint.com/EngProd/En/Company/Contact.asp",
          "summary": "Current own Contact page explicitly gives Product Inquiries Tel:+82-31-467-6473. Formatting normalized without changing digits; business inquiry telephone, not emergency or a named buyer telephone."
        }
      ],
      "verifiedAt": "2026-10-15"
    },
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "expoinfo@noroo.com",
        "source": {
          "label": "Current official contact body: market contacts distinguished from exact general Product Inquiries mailbox and telephone",
          "url": "https://noroopaint.com/EngProd/En/Company/Contact.asp"
        },
        "emailEvidence": {
          "company": "NOROO Paint & Coatings Co., Ltd. (NOROO Group)",
          "value": "expoinfo@noroo.com",
          "kind": "general",
          "publicBusiness": true,
          "sources": [
            {
              "label": "Current official contact body: market contacts distinguished from exact general Product Inquiries mailbox and telephone",
              "url": "https://noroopaint.com/EngProd/En/Company/Contact.asp",
              "summary": "Exact current corporate Product Inquiries mailbox; General label avoids inventing a purchasing/R&D department."
            }
          ],
          "verifiedAt": "2026-10-15"
        }
      }
    ],
    "sources": [
      {
        "label": "Original company brochure named2025: own manufacture, Anyang/Chilseo/Poseung plants; EVACOAT epoxy protective coatings on actual PDF page14 (printed26–27)",
        "url": "https://m.noroopaint.com/file/2025%20NOROO%20BROCHURE_English.pdf"
      },
      {
        "label": "Current official R&D and2006 separation of investment from paint manufacture/sales; general product-inquiry channels",
        "url": "https://noroopaint.com/EngProd/En/Company/ColorPrism_Remix.asp"
      },
      {
        "label": "Current official contact body: market contacts distinguished from exact general Product Inquiries mailbox and telephone",
        "url": "https://noroopaint.com/EngProd/En/Company/Contact.asp"
      },
      {
        "label": "Current official group chemical business: Korean operating coating manufacturers, resin businesses and50:50 NOROO-KOSSAN venture",
        "url": "https://www.norooholdings.com/en/business/?pIdx=chemicals"
      },
      {
        "label": "Current official related-company descriptions: Korean/overseas entities and partner affiliations; no regional subsidiaries counted separately",
        "url": "https://www.noroopaint.com/en/company/affiliated.asp"
      },
      {
        "label": "Current official protective-coating product category; main application body read, not all technical appendix tables",
        "url": "https://noroopaint.com/EngProd/En/Product/Categories.asp?category1=4"
      },
      {
        "label": "Current R&C catalogue index linking the original comprehensive resin/additive catalogue",
        "url": "https://www.noroornc.com/en/product/catalog.aspx"
      },
      {
        "label": "Actual original group R&C comprehensive catalogue, undated22PDF pages: additive table on PDF page21 visually inspected; not proof that all products were fully read",
        "url": "https://www.noroornc.com/onlineCatalog.pdf"
      },
      {
        "label": "Current parent bio-business body:3-HP platform development, commercialization preparation and applications distinguished from commercial epoxidized-oil sale",
        "url": "https://www.norooholdings.com/en/business/?pIdx=bio"
      },
      {
        "label": "Own2026-07-24 NAUSOL announcement: three3-HP-based products described as industrial cleaning solvents; not proof of ELO/plasticizer sale",
        "url": "https://www.norooholdings.com/en/media/?pIdx=news&B_Name=center&b_dir=bbs&category=news_en&search=&searchstring=&b_url=contents&list_no=1113&page=1"
      },
      {
        "label": "Current official legal operating-company information; shareholding/sales table explicitly asof2022, not assumed2026",
        "url": "https://www.noroopaint.com/en/investor/govern_overview.asp"
      },
      {
        "label": "Current official corporate history:2006 operating/holding-company separation and2011 Malaysian joint venture",
        "url": "https://noroopaint.com/en/company/history.asp"
      }
    ]
  },
  "applied-chemical-technology-florence": {
    "website": "https://appliedchemical.com/",
    "contactPage": "https://appliedchemical.com/contact-us/",
    "address": "Florence-Lauderdale Industrial Park, Florence, Alabama 35630, United States. Actual own About identifies the industrial park and city; current footer supplies postal code. Street address was not established in the read pages. Approximate city marker, not exact plant GPS.",
    "generalEmail": "act@appliedchemical.com",
    "generalPhone": "+1 256 760 9600",
    "generalEmailEvidence": {
      "company": "Applied Chemical Technology, Inc. (ACT)",
      "value": "act@appliedchemical.com",
      "kind": "general",
      "publicBusiness": true,
      "sources": [
        {
          "label": "Current own corporate contact page and explicitly published general business mailbox and phone",
          "url": "https://appliedchemical.com/contact-us/",
          "summary": "Current official Contact Us footer explicitly gives act@appliedchemical.com under Applied Chemical Technology, Florence, AL35630; the original company brochure independently prints the identical mailbox. General company business route, no named purchasing or R&D ownership inferred."
        }
      ],
      "verifiedAt": "2026-10-15"
    },
    "generalPhoneEvidence": {
      "company": "Applied Chemical Technology, Inc. (ACT)",
      "value": "+1 256 760 9600",
      "kind": "general",
      "publicBusiness": true,
      "sources": [
        {
          "label": "Current own corporate contact page and explicitly published general business mailbox and phone",
          "url": "https://appliedchemical.com/contact-us/",
          "summary": "Current official Contact Us footer explicitly gives Tel:(256)760-9600. US country prefix added to the same disclosed business telephone. A different800-ACT-3217 number is labelled Fax on the current site and TollFree in the undated brochure; that inconsistent channel is not promoted."
        }
      ],
      "verifiedAt": "2026-10-15"
    },
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "act@appliedchemical.com",
        "source": {
          "label": "Current own corporate contact page and explicitly published general business mailbox and phone",
          "url": "https://appliedchemical.com/contact-us/"
        },
        "emailEvidence": {
          "company": "Applied Chemical Technology, Inc. (ACT)",
          "value": "act@appliedchemical.com",
          "kind": "general",
          "publicBusiness": true,
          "sources": [
            {
              "label": "Current own corporate contact page and explicitly published general business mailbox and phone",
              "url": "https://appliedchemical.com/contact-us/",
              "summary": "Exact current public corporate mailbox. Lab/technical capabilities do not turn the generic mailbox into a named technical or purchasing contact."
            }
          ],
          "verifiedAt": "2026-10-15"
        }
      }
    ],
    "sources": [
      {
        "label": "Current own fertilizer development scope: controlled-release coated fertilizers and urethane polymer-coating applications",
        "url": "https://appliedchemical.com/services/research-development/fertilizer/fertilizer-research-development-commercialization/"
      },
      {
        "label": "Current own bench-scale coating services: actual past coated-product development, nutrient-utilization coatings and materials used",
        "url": "https://appliedchemical.com/services/research-development/lab-and-bench-scale/coating/"
      },
      {
        "label": "Current own pilot facilities and equipment: on-site coating drums/fluid beds, molten urea/sulfur handling and utilities",
        "url": "https://appliedchemical.com/services/research-development/pilot-plant/facilities-and-equipment/"
      },
      {
        "label": "Actual public original Pilot Plant Services brochure; undated, four PDF pages; sample production, own facilities and client-owned developments",
        "url": "https://appliedchemical.com/wp-content/uploads/Pilot_Plant.pdf"
      },
      {
        "label": "Current own company identity, Florence-Lauderdale Industrial Park facilities, laboratory/pilot operation and client-assigned patent policy",
        "url": "https://appliedchemical.com/resources/about-us/"
      },
      {
        "label": "Current own service/equipment scope: research, engineering and fabrication, distinguished from raw chemical sale",
        "url": "https://appliedchemical.com/"
      },
      {
        "label": "Current own corporate contact page and explicitly published general business mailbox and phone",
        "url": "https://appliedchemical.com/contact-us/"
      },
      {
        "label": "Current own pilot-services index and individual facility/service links",
        "url": "https://appliedchemical.com/services/research-development/pilot-plant/"
      },
      {
        "label": "Current brochure index inspected; the older public Pilot_Plant.pdf was found by public search rather than claimed as currently linked here",
        "url": "https://appliedchemical.com/resources/brochures/"
      }
    ]
  },
  "fertiberia-madrid": {
    "website": "https://www.fertiberia.com/",
    "contactPage": "https://www.fertiberia.com/contacta/",
    "address": "Fertiberia, S.A., Calle Agustín de Foxá, 27, plantas 8–11, 28036 Madrid, Spain. Official group headquarters; approximate city map marker, not exact factory GPS. Legal NIF A-28165298.",
    "generalEmail": "fertiberia@fertiberia.es",
    "generalPhone": "+34 91 586 62 00",
    "generalEmailEvidence": {
      "company": "Fertiberia, S.A. (Grupo Fertiberia)",
      "value": "fertiberia@fertiberia.es",
      "kind": "general",
      "publicBusiness": true,
      "sources": [
        {
          "label": "Current own Fertiberia manufacturing scope, actual factory network, Madrid headquarters and corporate contact",
          "url": "https://www.fertiberia.com/fertiberia/",
          "summary": "The current official corporate headquarters page is publicly indexed with the exact fertiberia@fertiberia.es address; the own English legal notice independently discloses that same value for general corporate institutional/communications inquiries. Opened web bodies mask the linked mailbox, native HTML GET returned HTTP403; no HTML decoding, mailbox guessing, named ownership or purchasing role is claimed."
        },
        {
          "label": "Current own English legal notice: FERTIBERIA SA legal identity and general corporate communications route; notice retains 2019 copyright",
          "url": "https://www.fertiberia.com/en/legal-notice/",
          "summary": "The current official corporate headquarters page is publicly indexed with the exact fertiberia@fertiberia.es address; the own English legal notice independently discloses that same value for general corporate institutional/communications inquiries. Opened web bodies mask the linked mailbox, native HTML GET returned HTTP403; no HTML decoding, mailbox guessing, named ownership or purchasing role is claimed."
        }
      ],
      "verifiedAt": "2026-10-15"
    },
    "generalPhoneEvidence": {
      "company": "Fertiberia, S.A. (Grupo Fertiberia)",
      "value": "+34 91 586 62 00",
      "kind": "general",
      "publicBusiness": true,
      "sources": [
        {
          "label": "Current own Fertiberia manufacturing scope, actual factory network, Madrid headquarters and corporate contact",
          "url": "https://www.fertiberia.com/fertiberia/",
          "summary": "Current own Spanish and English company headquarters blocks explicitly publish +34 91 586 62 00 at the Madrid corporate office. General company business line, not a named or emergency number."
        }
      ],
      "verifiedAt": "2026-10-15"
    },
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "fertiberia@fertiberia.es",
        "source": {
          "label": "Current own Fertiberia manufacturing scope, actual factory network, Madrid headquarters and corporate contact",
          "url": "https://www.fertiberia.com/fertiberia/"
        },
        "emailEvidence": {
          "company": "Fertiberia, S.A. (Grupo Fertiberia)",
          "value": "fertiberia@fertiberia.es",
          "kind": "general",
          "publicBusiness": true,
          "sources": [
            {
              "label": "Current own Fertiberia manufacturing scope, actual factory network, Madrid headquarters and corporate contact",
              "url": "https://www.fertiberia.com/fertiberia/",
              "summary": "Exact own corporate headquarters mailbox additionally disclosed in its legal notice as a general corporate communications route; never assigned to a named purchaser or technical director."
            },
            {
              "label": "Current own English legal notice: FERTIBERIA SA legal identity and general corporate communications route; notice retains 2019 copyright",
              "url": "https://www.fertiberia.com/en/legal-notice/",
              "summary": "Exact own corporate headquarters mailbox additionally disclosed in its legal notice as a general corporate communications route; never assigned to a named purchaser or technical director."
            }
          ],
          "verifiedAt": "2026-10-15"
        }
      }
    ],
    "sources": [
      {
        "label": "Current own C-PRO technology page: physical polymer barrier around granules and gradual controlled nutrient release",
        "url": "https://www.fertiberia.com/c-pro/"
      },
      {
        "label": "Current own NERGETIC DS+ finished fertilizer: polymer surrounding granules plus nitrification inhibitor",
        "url": "https://www.fertiberia.com/productos/agricultura/nergetic-ds/"
      },
      {
        "label": "Spanish agriculture ministry fertilizer registry: NERGETIC COMPLETE NPK NSAFE manufacturer FERTIBERIA SA",
        "url": "https://servicio.mapa.gob.es/regfertiwai/DetalleFertilizante.aspx?clave=6313"
      },
      {
        "label": "Current own Fertiberia manufacturing scope, actual factory network, Madrid headquarters and corporate contact",
        "url": "https://www.fertiberia.com/fertiberia/"
      },
      {
        "label": "Published 26 April 2022 interview with company agronomic innovation director: own NERGETIC production trials incorporating C-PRO and Zimactiv; historical statement",
        "url": "https://archivo.revistaagricultura.com/grupo-fertiberia/sanidad-y-nutricion/nergetic-dz--la-solucion-de-nutricion-vegetal-nitrogenada-de-ultima-generacion-que-incorpora-las-tecnologias-c-pro-y-zimactiv_14353_119_17842_0_1_in.html"
      },
      {
        "label": "Current own agricultural and industrial business divisions; industrial ammonia/urea/nitrates and environmental solutions distinguished from coating agents",
        "url": "https://www.fertiberia.com/que-hacemos/industria/"
      },
      {
        "label": "Current own group history and operating entities: ADP, Fertiberia France/Hellas, Van de Reijt, Agralia and Trichodex/TRIXIA",
        "url": "https://www.fertiberia.com/nuestro-grupo/"
      },
      {
        "label": "Current own ADP page: group manufacturing subsidiary and its three Portuguese production sites",
        "url": "https://www.fertiberia.com/adp-fertilizantes/"
      },
      {
        "label": "Current sponsor portfolio entry explicitly marks Fertiberia as Current",
        "url": "https://www.triton-partners.com/portfolio/fertiberia"
      },
      {
        "label": "Current own English legal notice: FERTIBERIA SA legal identity and general corporate communications route; notice retains 2019 copyright",
        "url": "https://www.fertiberia.com/en/legal-notice/"
      },
      {
        "label": "Current own corporate inquiry page, no submission performed",
        "url": "https://www.fertiberia.com/contacta/"
      }
    ]
  },
  "enecon-medford": {
    "website": "https://www.enecon.com/",
    "contactPage": "https://www.enecon.com/contact.asp",
    "generalEmail": "info@enecon.com",
    "generalPhone": "+1 516 349 0022",
    "generalEmailEvidence": {
      "company": "ENECON Corporation",
      "value": "info@enecon.com",
      "kind": "general",
      "publicBusiness": true,
      "sources": [
        {
          "label": "Original two-page CHEMCLAD SC technical sheet; copyright 2026 and printed code 20260406",
          "url": "https://www.enecon.com/pdfs/CHEMCLAD_SC.pdf",
          "summary": "Page 1 of the actual original CHEMCLAD SC technical sheet explicitly prints ENECON Corporation, 6 Platinum Court and info@enecon.com. The current FAQ separately identifies this exact inbox as the Tech Center route; no named purchaser inferred."
        }
      ],
      "verifiedAt": "2026-10-15"
    },
    "generalPhoneEvidence": {
      "company": "ENECON Corporation",
      "value": "+1 516 349 0022",
      "kind": "general",
      "publicBusiness": true,
      "sources": [
        {
          "label": "Current headquarters address and company telephone; regional distributors kept separate",
          "url": "https://www.enecon.com/contact.asp",
          "summary": "Current official headquarters contact block explicitly gives +1 (516) 349-0022 at 6 Platinum Court, Medford. A corporate business phone, not a personal or emergency number."
        }
      ],
      "verifiedAt": "2026-10-15"
    },
    "address": "6 Platinum Court, Medford, New York 11763-2251, United States. Original manufacturer address and current headquarters; approximate city marker, not exact factory GPS.",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "Technical",
        "email": "info@enecon.com",
        "source": {
          "label": "Current FAQ explicitly identifies own Medford production, technical/business routes and USA-source procurement policy",
          "url": "https://www.enecon.com/faq"
        },
        "emailEvidence": {
          "company": "ENECON Corporation",
          "value": "info@enecon.com",
          "kind": "department",
          "publicBusiness": true,
          "sources": [
            {
              "label": "Current FAQ explicitly identifies own Medford production, technical/business routes and USA-source procurement policy",
              "url": "https://www.enecon.com/faq",
              "summary": "Current official FAQ explicitly directs technical/product-selection questions to the Tech Center at info@enecon.com. This is a company technical route, not a named research or purchasing person."
            }
          ],
          "verifiedAt": "2026-10-15"
        }
      },
      {
        "department": "Sales",
        "email": "sales@enecon.com",
        "source": {
          "label": "Current FAQ explicitly identifies own Medford production, technical/business routes and USA-source procurement policy",
          "url": "https://www.enecon.com/faq"
        },
        "emailEvidence": {
          "company": "ENECON Corporation",
          "value": "sales@enecon.com",
          "kind": "department",
          "publicBusiness": true,
          "sources": [
            {
              "label": "Current FAQ explicitly identifies own Medford production, technical/business routes and USA-source procurement policy",
              "url": "https://www.enecon.com/faq",
              "summary": "Current official FAQ explicitly discloses sales@enecon.com for buying its finished products. Not relabelled as raw-material purchasing."
            }
          ],
          "verifiedAt": "2026-10-15"
        }
      }
    ],
    "sources": [
      {
        "label": "Current own coating development and American manufacturing company identity",
        "url": "https://www.enecon.com/about-enecon.asp"
      },
      {
        "label": "Current FAQ explicitly identifies own Medford production, technical/business routes and USA-source procurement policy",
        "url": "https://www.enecon.com/faq"
      },
      {
        "label": "Original two-page CHEMCLAD SC technical sheet; copyright 2026 and printed code 20260406",
        "url": "https://www.enecon.com/pdfs/CHEMCLAD_SC.pdf"
      },
      {
        "label": "Current own CHEMCLAD SC protective coating and real original technical-sheet link",
        "url": "https://www.enecon.com/product-chemclad-sc"
      },
      {
        "label": "Current complete visible product-family overview of finished polymer coatings and repair systems",
        "url": "https://www.enecon.com/products.asp"
      },
      {
        "label": "Current P4C finished concrete primer, applied as a coating system layer",
        "url": "https://www.enecon.com/product-chemclad-p4c.asp"
      },
      {
        "label": "Current FLEXICLAD ER finished flexible repair compound; not raw flexibilizer oil",
        "url": "https://www.enecon.com/product-flexiclad-er.asp"
      },
      {
        "label": "Current ENEFLOW magnetic-fluid-treatment devices; no raw chemical stabilizer inferred",
        "url": "https://www.enecon.com/product-eneflow.asp"
      },
      {
        "label": "Current manufacturing-role page corroborates Medford production; undated recruiting text not a dated expansion or demand event",
        "url": "https://www.enecon.com/careers-manufacturing.asp"
      },
      {
        "label": "Current headquarters address and company telephone; regional distributors kept separate",
        "url": "https://www.enecon.com/contact.asp"
      }
    ]
  },
  "sauereisen-pittsburgh": {
    "website": "https://www.sauereisen.com/",
    "contactPage": "https://www.sauereisen.com/contact/",
    "generalEmail": "info@sauereisen.com",
    "generalPhone": "+1 412 963 0303",
    "generalEmailEvidence": {
      "company": "Sauereisen, Inc.",
      "value": "info@sauereisen.com",
      "kind": "general",
      "publicBusiness": true,
      "sources": [
        {
          "label": "Current corporate public business email, Pittsburgh address, staff roles and general telephone",
          "url": "https://www.sauereisen.com/contact/",
          "summary": "Current official Contact page explicitly publishes info@sauereisen.com with the Sauereisen corporate address. Distributor names, laboratory-manager identity and historical SDS emergency addresses are not assigned ownership of this company inbox."
        }
      ],
      "verifiedAt": "2026-10-15"
    },
    "generalPhoneEvidence": {
      "company": "Sauereisen, Inc.",
      "value": "+1 412 963 0303",
      "kind": "general",
      "publicBusiness": true,
      "sources": [
        {
          "label": "Current corporate public business email, Pittsburgh address, staff roles and general telephone",
          "url": "https://www.sauereisen.com/contact/",
          "summary": "Current official Contact page explicitly publishes the corporate Phone +1 (412) 963.0303 at 160 Gamma Drive. Individual staff extensions are not substituted for the general number."
        }
      ],
      "verifiedAt": "2026-10-15"
    },
    "address": "160 Gamma Drive, Pittsburgh, Pennsylvania 15238-2989, United States. Official manufacturer address; city marker is approximate, not exact plant GPS.",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "info@sauereisen.com",
        "source": {
          "label": "Current corporate public business email, Pittsburgh address, staff roles and general telephone",
          "url": "https://www.sauereisen.com/contact/"
        },
        "emailEvidence": {
          "company": "Sauereisen, Inc.",
          "value": "info@sauereisen.com",
          "kind": "general",
          "publicBusiness": true,
          "sources": [
            {
              "label": "Current corporate public business email, Pittsburgh address, staff roles and general telephone",
              "url": "https://www.sauereisen.com/contact/",
              "summary": "Current official company contact block explicitly gives info@sauereisen.com. General business route, no named procurement ownership asserted."
            }
          ],
          "verifiedAt": "2026-10-15"
        }
      }
    ],
    "sources": [
      {
        "label": "Current own Pittsburgh downstream manufacture and development of corrosion-resistant materials",
        "url": "https://www.sauereisen.com/"
      },
      {
        "label": "Current family-run company, acquired-brand history and actual business scope",
        "url": "https://www.sauereisen.com/about/"
      },
      {
        "label": "Original currently linked three-page SewerGard 210XROL TDS; October 2020 retained",
        "url": "https://www.sauereisen.com/wp-content/uploads/210XROL-2.pdf"
      },
      {
        "label": "Current municipal-wastewater finished polymer lining products and original TDS links",
        "url": "https://www.sauereisen.com/products/municipal-wastewater/"
      },
      {
        "label": "Current five visible applied primer systems: PenePrime 500, ConoWeld 501, ConoPrime 502, VEPrime 550, Hi-Temp 560",
        "url": "https://www.sauereisen.com/products/primers-corrosion/"
      },
      {
        "label": "Current finished joint sealants and membranes; separately sold 220T explicitly has viscosity/thixotropy role",
        "url": "https://www.sauereisen.com/products/membranes-corrosion/"
      },
      {
        "label": "Current own inorganic ceramic-cement manufacture and product families",
        "url": "https://www.sauereisen.com/ceramic-cements/"
      },
      {
        "label": "Original capability brochure, 10 PDF pages; printed layout date 7/20/09, historical supporting source",
        "url": "https://www.sauereisen.com/wp-content/uploads/Capabilities-Brochure.pdf"
      },
      {
        "label": "Current corporate public business email, Pittsburgh address, staff roles and general telephone",
        "url": "https://www.sauereisen.com/contact/"
      }
    ]
  },
  "dampney-everett": {
    "website": "https://www.dampney.com/",
    "contactPage": "https://www.dampney.com/Contact-Us",
    "generalEmail": "sales@dampney.com",
    "generalPhone": "+1 617 389 2805",
    "generalEmailEvidence": {
      "company": "Dampney Company, Inc.",
      "value": "sales@dampney.com",
      "kind": "department",
      "publicBusiness": true,
      "sources": [
        {
          "label": "Original currently linked Endcor 700C four-page TDS; printed 01/09 Rev. retained",
          "url": "https://www.dampney.com/Portals/1/PropertyAgent/456/Files/43/Endcor_700C.pdf",
          "summary": "First-page footer of the original currently linked Endcor 700C TDS explicitly publishes Dampney Company, Inc., the Everett address and sales@dampney.com. Historical printed revision code is retained; this is a general sales department mailbox, not a named purchaser."
        }
      ],
      "verifiedAt": "2026-10-15"
    },
    "generalPhoneEvidence": {
      "company": "Dampney Company, Inc.",
      "value": "+1 617 389 2805",
      "kind": "general",
      "publicBusiness": true,
      "sources": [
        {
          "label": "Current business contact page and Everett office telephone",
          "url": "https://www.dampney.com/Contact-Us",
          "summary": "Current official contact-page footer explicitly gives the Everett company address and Phone (617) 389-2805. International prefix added for the same disclosed business number; no emergency or personal number used."
        }
      ],
      "verifiedAt": "2026-10-15"
    },
    "address": "85 Paris Street, Everett, Massachusetts 02149, United States. Official company office/plant city; approximate city map marker, not exact plant GPS.",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "Sales",
        "email": "sales@dampney.com",
        "source": {
          "label": "Original currently linked Endcor 700C four-page TDS; printed 01/09 Rev. retained",
          "url": "https://www.dampney.com/Portals/1/PropertyAgent/456/Files/43/Endcor_700C.pdf"
        },
        "emailEvidence": {
          "company": "Dampney Company, Inc.",
          "value": "sales@dampney.com",
          "kind": "department",
          "publicBusiness": true,
          "sources": [
            {
              "label": "Original currently linked Endcor 700C four-page TDS; printed 01/09 Rev. retained",
              "url": "https://www.dampney.com/Portals/1/PropertyAgent/456/Files/43/Endcor_700C.pdf",
              "summary": "Original author TDS footer explicitly discloses sales@dampney.com as the company business email. No procurement role or personal name inferred."
            }
          ],
          "verifiedAt": "2026-10-15"
        }
      }
    ],
    "sources": [
      {
        "label": "Current own Everett manufacturing plant, formula/batch systems and product-development laboratory",
        "url": "https://www.dampney.com/More-/About-Us"
      },
      {
        "label": "Original currently linked Endcor 700C four-page TDS; printed 01/09 Rev. retained",
        "url": "https://www.dampney.com/Portals/1/PropertyAgent/456/Files/43/Endcor_700C.pdf"
      },
      {
        "label": "Current Endcor 700C own epoxy-polyamide finished coating and real original-document links",
        "url": "https://www.dampney.com/Product-Line/AT/View/PID/43/Endcor-700C"
      },
      {
        "label": "Own visible full product-list page 1 of 3 and all product-family navigation",
        "url": "https://www.dampney.com/Product-Line/AT/ViewType"
      },
      {
        "label": "Own visible full product-list page 2 of 3",
        "url": "https://www.dampney.com/Product-Line/AT/ViewType/PropertyAgentName/-1/sortBy/cf6/currentpage/2"
      },
      {
        "label": "Own visible full product-list page 3 of 3",
        "url": "https://www.dampney.com/Product-Line/AT/ViewType/PropertyAgentName/-1/sortBy/cf6/currentpage/3"
      },
      {
        "label": "Current five listed thinner/solvent/cleaner products; not ELO/ESBO raw-oil supply",
        "url": "https://www.dampney.com/Product-Line/AT/ViewType/PTID/170"
      },
      {
        "label": "Current Alvin-family ready-to-use repair putty, patching compound and rubberized coating",
        "url": "https://www.dampney.com/Product-Line/AT/ViewType/PTID/46"
      },
      {
        "label": "Current business contact page and Everett office telephone",
        "url": "https://www.dampney.com/Contact-Us"
      }
    ]
  },
  "blanchon-saint-priest": {
    "website": "https://www.blanchongroup.com/en/",
    "contactPage": "https://www.blanchon.com/professionnels/contact",
    "generalEmail": "blanchon@blanchon.com",
    "generalPhone": "+33 4 72 89 06 06",
    "address": "BLANCHONSAS,50 8èmeRue–CS60019,69800Saint-Priestcedex,France. OriginalofficialTDS RCSLYON390112886; currentwebsitepublisherRCStexttruncated to8digits,nodigitguessed. Registered-officecitymarker,notplantGPS.",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "blanchon@blanchon.com",
        "source": {
          "label": "Original currentLasureTechWood two-pageTDS,May2024: ownFrenchaqueousPU-acrylicwoodstain/legalmanufacturermail",
          "url": "https://www.blanchon.com/media/docs-pdf/FT_Lasure_Tech-Wood_052024.pdf"
        },
        "emailEvidence": {
          "company": "Blanchon SAS (Blanchon Group)",
          "value": "blanchon@blanchon.com",
          "kind": "general",
          "publicBusiness": true,
          "sources": [
            {
              "label": "Blanchon SAS public manufacturer business email in original TDS",
              "url": "https://www.blanchon.com/media/docs-pdf/FT_Lasure_Tech-Wood_052024.pdf",
              "summary": "Page 2 of the original May 2024 Lasure TECH-WOOD TDS explicitly prints BLANCHON SAS, RCS LYON 390 112 886 and e-mail blanchon@blanchon.com. The currently available original was re-read on 2026-10-15; the May 2024 document date is retained. General manufacturer mailbox, not a named purchaser."
            }
          ],
          "verifiedAt": "2026-10-15"
        }
      }
    ],
    "sources": [
      {
        "label": "Original currentLasureTechWood two-pageTDS,May2024: ownFrenchaqueousPU-acrylicwoodstain/legalmanufacturermail",
        "url": "https://www.blanchon.com/media/docs-pdf/FT_Lasure_Tech-Wood_052024.pdf"
      },
      {
        "label": "Currentownmanufacturer,R&D,publicproductrange andsupplierpartnerroles",
        "url": "https://www.blanchongroup.com/en/"
      },
      {
        "label": "CurrentFrenchlegalpublisherandSaintPriestaddress; truncatedwebsiteRCSnotguessed",
        "url": "https://www.blanchon.com/professionnels/mentions-legales"
      },
      {
        "label": "Currententireprofessionalcategorynavigation andsevenvisiblewoodstainfamilylist",
        "url": "https://www.blanchon.com/professionnels/produits-exterieurs/protection-decoration-bois-verticaux/lasures.html?synt_packing=269"
      },
      {
        "label": "OriginalactualConditionneurAntiUV finishedaqueouswoodpretreatment,readytoapplynotstir-inrawpromoter",
        "url": "https://www.blanchon.com/media/docs-pdf/FT_Conditionneur_Anti_UV.pdf"
      },
      {
        "label": "OwnCiranovaTechindustrialwoodfinishformulation/laboratories/categories",
        "url": "https://www.industry.blanchongroup.com/en/ciranovatech"
      },
      {
        "label": "CurrentCiranovafinishedwoodproductscope",
        "url": "https://www.ciranova.eu/en/"
      },
      {
        "label": "CurrentCarverfinishedwoodcoat/glue/preparation/sundriescategories",
        "url": "https://carver-products-europe.com/"
      },
      {
        "label": "Original2024-12-03 groupDrSchutzacquisition andexistingbrandsRigo/Bigler/Carver/Ciranova",
        "url": "https://www.dr-schutz.com/wp-content/uploads/PRESS-RELEASE_Blanchon-Group-acquires-Dr.Schutz.pdf"
      },
      {
        "label": "CurrentDrSchutzprofessionalproductcategoryscope",
        "url": "https://www.dr-schutz.com/en/dr-schutz/professional/products/"
      },
      {
        "label": "OriginalDrSchutz2023 productoverview64pages; relevantprimer/additiveandwoodfinishchaptersread,historicaldatekept",
        "url": "https://www.dr-schutz.com/wp-content/uploads/DrSchutz_Product_Overview_2023.pdf"
      },
      {
        "label": "Own France technical-business telephone and public contact page",
        "url": "https://www.blanchon.com/professionnels/contact"
      }
    ],
    "generalEmailEvidence": {
      "company": "Blanchon SAS (Blanchon Group)",
      "value": "blanchon@blanchon.com",
      "kind": "general",
      "publicBusiness": true,
      "sources": [
        {
          "label": "Blanchon SAS public manufacturer business email in original TDS",
          "url": "https://www.blanchon.com/media/docs-pdf/FT_Lasure_Tech-Wood_052024.pdf",
          "summary": "Page 2 of the original May 2024 Lasure TECH-WOOD TDS explicitly prints BLANCHON SAS, RCS LYON 390 112 886 and e-mail blanchon@blanchon.com. The currently available original was re-read on 2026-10-15; the May 2024 document date is retained. General manufacturer mailbox, not a named purchaser."
        }
      ],
      "verifiedAt": "2026-10-15"
    },
    "generalPhoneEvidence": {
      "company": "Blanchon SAS (Blanchon Group)",
      "value": "+33 4 72 89 06 06",
      "kind": "general",
      "publicBusiness": true,
      "sources": [
        {
          "label": "Blanchon current legal company contact telephone",
          "url": "https://www.blanchon.com/professionnels/mentions-legales",
          "summary": "Current official legal page explicitly states the Saint-Priest company address and corporate telephone 04 72 89 06 06. Stored as +33 4 72 89 06 06. The separate assistance line ending 0604 is not substituted for this number."
        }
      ],
      "verifiedAt": "2026-10-15"
    }
  },
  "v33-domblans": {
    "website": "https://en.groupev33.com/",
    "contactPage": "https://en.groupev33.com/nous-contacter",
    "generalEmail": "contactgroupe@v33.com",
    "generalPhone": "+33 3 84 35 00 33",
    "address": "V33S.A.,Route de la Muyre,39210Domblans,France; registryB305690158. PublicFranceheadofficemailing:Rue de la Croix Bernard–BP1,F-39210Domblanscedex. Bothpublishedaddressesretained;approximatecitymarker,notfactoryGPS.",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "contactgroupe@v33.com",
        "source": {
          "label": "Current V33France head-office business email, independently decoded from both exact published client-side email encodings",
          "url": "https://en.groupev33.com/nous-contacter"
        },
        "emailEvidence": {
          "company": "V33 S.A. (V33 Group / Plastor)",
          "value": "contactgroupe@v33.com",
          "kind": "general",
          "publicBusiness": true,
          "sources": [
            {
              "label": "V33 France head-office public business email",
              "url": "https://en.groupev33.com/nous-contacter",
              "summary": "France Head Office V33 FRANCE block publicly embeds two browser email encodings. Fresh 2026-10-15 native HTML was saved; independently decoding both yields exactly contactgroupe@v33.com. No name, mailbox pattern or address was inferred."
            }
          ],
          "verifiedAt": "2026-10-15"
        }
      }
    ],
    "sources": [
      {
        "label": "Original current PlastorPUR-T4 five-pageTDS,revised2025-02-21: ownFrenchmanufacture andaqueouswoodfloorvarnish",
        "url": "https://dxm.dam.v33.com/api/wedia/dam/variation/4at5pr6th3mqharw6r1q7qpaco/pdf"
      },
      {
        "label": "Current ownV33wood-product manufacturing andwaterbasedwoodcare",
        "url": "https://en.groupev33.com/wood/index"
      },
      {
        "label": "Current grouplegalV33SA, registryB305690158, Domblansregisteredoffice",
        "url": "https://en.groupev33.com/legal-notices"
      },
      {
        "label": "Current groupbrandsV33/Liberon/Hypnotik/CecilProfessionnel/Plastor,oneaccount",
        "url": "https://en.groupev33.com/brands"
      },
      {
        "label": "CurrentPlastor completevisiblecategorynavigation; firstshop page notall11pages reviewed",
        "url": "https://www.plastor.com/boutique/"
      },
      {
        "label": "Current full four-product supplementaryprimercategory",
        "url": "https://www.plastor.com/categorie-produit/produit-complementaire/produit-complementaire_primaires/"
      },
      {
        "label": "Actual WBPR21P readyapplyconcrete-substrateprimer",
        "url": "https://www.plastor.com/produit/primaire-support-friable-wbpr-21p-primaire-avant-ragreage/"
      },
      {
        "label": "ActualPlastepox epoxy flooringprimersystem component; notrawPO/CPOinput",
        "url": "https://www.plastor.com/produit/resine-epoxy-plastepox-epoxy-2/"
      },
      {
        "label": "ActualPRIMUNIV finisheduniversalprimercategory; limitedreadablebody,nochemistryguessed",
        "url": "https://www.plastor.com/produit/prim-univ-primaire-universel/"
      },
      {
        "label": "CurrentPlastorbrandhistory/ownFrenchproduction",
        "url": "https://www.plastor.com/notre-marque/"
      },
      {
        "label": "CurrentpublicPlastortechnicaltelephone/contactroute",
        "url": "https://www.plastor.com/nous-contacter/"
      },
      {
        "label": "Current V33France head-office business email, independently decoded from both exact published client-side email encodings",
        "url": "https://en.groupev33.com/nous-contacter"
      }
    ],
    "generalEmailEvidence": {
      "company": "V33 S.A. (V33 Group / Plastor)",
      "value": "contactgroupe@v33.com",
      "kind": "general",
      "publicBusiness": true,
      "sources": [
        {
          "label": "V33 France head-office public business email",
          "url": "https://en.groupev33.com/nous-contacter",
          "summary": "France Head Office V33 FRANCE block publicly embeds two browser email encodings. Fresh 2026-10-15 native HTML was saved; independently decoding both yields exactly contactgroupe@v33.com. No name, mailbox pattern or address was inferred."
        }
      ],
      "verifiedAt": "2026-10-15"
    },
    "generalPhoneEvidence": {
      "company": "V33 S.A. (V33 Group / Plastor)",
      "value": "+33 3 84 35 00 33",
      "kind": "general",
      "publicBusiness": true,
      "sources": [
        {
          "label": "V33 France head-office general business telephone",
          "url": "https://en.groupev33.com/nous-contacter",
          "summary": "The same France Head Office block explicitly publishes Phone (33) 03 84 35 00 33. Stored in international form +33 3 84 35 00 33; no personal ownership asserted."
        }
      ],
      "verifiedAt": "2026-10-15"
    }
  },
  "bona-malmo": {
    "website": "https://www.bona.com/",
    "contactPage": "https://www.bona.com/en/about-bona/contact-us/",
    "generalEmail": "bona@bona.com",
    "generalPhone": "+46 40 385 500",
    "address": "BonaAB,Murmansgatan130,POBox21074,SE-20021Malmö,Sweden. PublicSwedishorgnumber556017-6488. Office/manufacturingcitymarker,notplantGPS; registeredgroupaccountnotUKregionalbranch.",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "bona@bona.com",
        "source": {
          "label": "Published own BonaAB general contact, Swedish address, phone and legal orgnumber; primary public web after nativeJS shell",
          "url": "https://www.bona.com/en/about-bona/contact-us/"
        },
        "emailEvidence": {
          "company": "Bona AB",
          "value": "bona@bona.com",
          "kind": "general",
          "publicBusiness": true,
          "sources": [
            {
              "label": "Bona AB official general business contact",
              "url": "https://www.bona.com/en/about-bona/contact-us/",
              "summary": "Official published contact body explicitly gives bona@bona.com, with Bona AB footer and Malmö office address. Re-read on 2026-10-15 through primary-page web extraction; prior native JavaScript-only response is not the proof."
            }
          ],
          "verifiedAt": "2026-10-15"
        }
      }
    ],
    "sources": [
      {
        "label": "Original live TrafficGO EPD,2024-09-16: ownSwedishmanufacture and waterborne wood floor lacquer; LCAdata2023",
        "url": "https://www.bona.com/globalassets/catalogassets/epd-bona-traffic-go.pdf"
      },
      {
        "label": "Original currently public80-page UK2024–2025 product catalogue; historical scope/date retained",
        "url": "https://www.bona.com/globalassets/countries/uk/brochures/bona-product-catalogue-2024-2025-.pdf"
      },
      {
        "label": "Current professional product category navigation throughprimarypublicweb,notnativeJSshell",
        "url": "https://www.bona.com/en/products/professional/coatings/lacquers/"
      },
      {
        "label": "Current visible additive family list:AntiSlip/Extender/TanninShield/Toner;primarypublicweb evidence,notexhaustiveglobalSKUreview",
        "url": "https://www.bona.com/en/products/professional/coatings/additives/"
      },
      {
        "label": "Original TanninShield2026-01-23: prepolymerisedaliphaticisocyanate woodextract-blocking additive",
        "url": "https://www.bona.com/globalassets/catalogassets/tds-bona-tanninshield-en.pdf"
      },
      {
        "label": "Original AntiSlip02/2026:100%solidPPgranules for slipresistance,notPOemulsion",
        "url": "https://www.bona.com/globalassets/catalogassets/bona-anti-slip-additive-tds.pdf"
      },
      {
        "label": "Original Retarder2025-08-26: drying/open-time additive for pairedwaterbornefinishes",
        "url": "https://www.bona.com/globalassets/catalogassets/tds-bona-retarder-en_20250826.pdf"
      },
      {
        "label": "Current Toner actual colourpigment additive; originalEnglishTDSnative404notclaimeddownloaded",
        "url": "https://www.bona.com/en/products/professional/coatings/additives/bona-toner-black-01l/"
      },
      {
        "label": "CurrentD501 readytoapplyacrylatefloorprimer; notrawPO/CPOinput",
        "url": "https://www.bona.com/en/products/professional/adhesives/primers-/bona-d-501-5-ltr.-ml"
      },
      {
        "label": "Published own BonaAB general contact, Swedish address, phone and legal orgnumber; primary public web after nativeJS shell",
        "url": "https://www.bona.com/en/about-bona/contact-us/"
      }
    ],
    "generalEmailEvidence": {
      "company": "Bona AB",
      "value": "bona@bona.com",
      "kind": "general",
      "publicBusiness": true,
      "sources": [
        {
          "label": "Bona AB official general business contact",
          "url": "https://www.bona.com/en/about-bona/contact-us/",
          "summary": "Official published contact body explicitly gives bona@bona.com, with Bona AB footer and Malmö office address. Re-read on 2026-10-15 through primary-page web extraction; prior native JavaScript-only response is not the proof."
        }
      ],
      "verifiedAt": "2026-10-15"
    },
    "generalPhoneEvidence": {
      "company": "Bona AB",
      "value": "+46 40 385 500",
      "kind": "general",
      "publicBusiness": true,
      "sources": [
        {
          "label": "Bona AB official general business telephone",
          "url": "https://www.bona.com/en/about-bona/contact-us/",
          "summary": "Official contact body explicitly publishes +4640385500 beside the Sweden/Malmö business address. General company telephone, not a personal number."
        }
      ],
      "verifiedAt": "2026-10-15"
    }
  },
  "farrell-calhoun-memphis": {
    "website": "https://www.farrellcalhoun.com/",
    "contactPage": "https://www.farrellcalhoun.com/contact",
    "generalEmail": "info@farrellcalhoun.com",
    "generalPhone": "+1 901 526 2211",
    "address": "221 East Carolina Avenue, Memphis, TN38126, UnitedStates. Own official corporate headquarters and manufacturing address; approximate city marker, not facility GPS.",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "Procurement",
        "email": "jeremylafrain@farrellcalhoun.com",
        "source": {
          "label": "Current corporate-headquarters/manufacturing legal identity and Purchasing Agent mailbox; no person name inferred",
          "url": "https://www.farrellcalhoun.com/contact"
        }
      },
      {
        "department": "Technical",
        "email": "gregandre@farrellcalhoun.com",
        "source": {
          "label": "Current corporate-headquarters/manufacturing legal identity and Purchasing Agent mailbox; no person name inferred",
          "url": "https://www.farrellcalhoun.com/contact"
        }
      },
      {
        "department": "General",
        "email": "info@farrellcalhoun.com",
        "source": {
          "label": "Current corporate-headquarters/manufacturing legal identity and Purchasing Agent mailbox; no person name inferred",
          "url": "https://www.farrellcalhoun.com/contact"
        }
      }
    ],
    "sources": [
      {
        "label": "Original current WoodKraft1160 two-page TDS, revised2024-09-15: waterborne acrylic-PU wood varnish",
        "url": "https://assets.speakcdn.com/assets/2859/1160_line_3.pdf"
      },
      {
        "label": "Current own R&D chemists and manufacturing facility; native403, primary public web independently read",
        "url": "https://www.farrellcalhoun.com/about-us"
      },
      {
        "label": "Current complete visible own product navigation and categories; third-party retail products separated",
        "url": "https://www.farrellcalhoun.com/our-products"
      },
      {
        "label": "Current actual own WoodKraft1160 product and originalTDS link",
        "url": "https://www.farrellcalhoun.com/our-products/farrell%2Bproducts/1160-line-woodkraft-waterborne-acrylic-polyurethane-spar-varnish"
      },
      {
        "label": "Original actual6-78 finished aqueous acrylic-PU bonding primer, not raw PO/CPO adhesion promoter",
        "url": "https://assets.speakcdn.com/assets/2859/6-78_6.pdf"
      },
      {
        "label": "Own company history and2010 KentuckyPaint asset/manufacturing acquisition; branches/brands not new entities",
        "url": "https://www.farrellcalhoun.com/history-of-farrell-calhoun"
      },
      {
        "label": "Current corporate-headquarters/manufacturing legal identity and Purchasing Agent mailbox; no person name inferred",
        "url": "https://www.farrellcalhoun.com/contact"
      }
    ]
  },
  "induron-birmingham": {
    "website": "https://www.induron.com/",
    "contactPage": "https://www.induron.com/contact/",
    "generalEmail": "service@induron.com",
    "generalPhone": "+1 205 324 9584",
    "address": "3333 Richard Arrington Jr. Blvd N, Birmingham, Alabama35234-2303, UnitedStates. MailingPOBox2371,Birmingham35201-2371. Current own company address; office-city marker, not surveyed plant GPS.",
    "contacts": [
      {
        "name": "Bill Seawell",
        "title": "Technical Services Director",
        "department": "Technical",
        "email": "wseawell@induron.com",
        "source": {
          "label": "Current public Technical Services Director Bill Seawell, exact personal business email and department routes",
          "url": "https://www.induron.com/contact/"
        },
        "verifiedAt": "2026-10-14"
      }
    ],
    "departmentEmails": [
      {
        "department": "Technical",
        "email": "techservice@induron.com",
        "source": {
          "label": "Current public Technical Services Director Bill Seawell, exact personal business email and department routes",
          "url": "https://www.induron.com/contact/"
        }
      },
      {
        "department": "General",
        "email": "service@induron.com",
        "source": {
          "label": "Current public Technical Services Director Bill Seawell, exact personal business email and department routes",
          "url": "https://www.induron.com/contact/"
        }
      }
    ],
    "sources": [
      {
        "label": "Original current Perma-Clean100SL technical data, printed code0126S; own aliphatic-amine epoxy tank lining",
        "url": "https://www.induron.com/wp-content/uploads/2025/02/PC-100-SL-TDS-0225S.pdf"
      },
      {
        "label": "Current actual own family-owned manufacture and R&D formula development",
        "url": "https://www.induron.com/about-us/"
      },
      {
        "label": "Current whole visible product and formulation-additive scope",
        "url": "https://www.induron.com/all-products/"
      },
      {
        "label": "Current actual own PermaClean100SL matched product",
        "url": "https://www.induron.com/paint_products/permaclean-100-sl/"
      },
      {
        "label": "Original U-50 TDS, printed0117: paired urethane/fluorourethane cure accelerator",
        "url": "https://www.induron.com/wp-content/uploads/2024/06/U-50_Tech_Data.pdf"
      },
      {
        "label": "Original E-60 TDS, printed0922: cure accelerator for selected paired epoxies",
        "url": "https://www.induron.com/wp-content/uploads/2024/06/E-60-Tech-Data-1.pdf"
      },
      {
        "label": "Current public Technical Services Director Bill Seawell, exact personal business email and department routes",
        "url": "https://www.induron.com/contact/"
      }
    ]
  },
  "cloverdale-paint-surrey": {
    "website": "https://www.cloverdalepaint.com/",
    "contactPage": "https://www.cloverdalepaint.com/industrial/contact-us",
    "generalPhone": "+1 604 596 6261",
    "address": "400–2630 Croydon Drive, Surrey, BC V3Z6T3, Canada. Current headquarters address; historical product documents also show6950KingGeorgeBlvd. City marker is not factory GPS.",
    "contacts": [
      {
        "name": "Kristopher Agnew",
        "title": "Technical Engineering and Marketing Specialist – Industrial Coatings",
        "department": "Technical",
        "email": "kagnew@cloverdalepaint.com",
        "source": {
          "label": "Public Kristopher Agnew technical role with exact personal business mailto, rechecked2026-10-14",
          "url": "https://www.cloverdalepaint.com/industrial/contact-us"
        },
        "verifiedAt": "2026-10-14"
      },
      {
        "name": "Warren Delaney",
        "title": "Wood Finishes Manager, Calgary",
        "department": "Sales",
        "email": "wdelaney@cloverdalepaint.com",
        "phone": "+1 403 236 4777",
        "source": {
          "label": "Public Warren Delaney Wood Finishes Manager with exact business mailto, rechecked2026-10-14",
          "url": "https://www.cloverdalepaint.com/about-us-overview/contact-us/sales-departments/wood-finishes-sales-representatives"
        },
        "verifiedAt": "2026-10-14"
      }
    ],
    "departmentEmails": [],
    "sources": [
      {
        "label": "Original current French06680 TDS, revised2025-03-14: water-based acrylic wood stain",
        "url": "https://pldb.cloverdalepaint.com/documents/Cloverdale/tds/trade/TDS-french/cloverdale-tds-06680-f.pdf"
      },
      {
        "label": "Original English WeatherOne sell sheet, printed03/12: own manufacturer and separate066/723 product uses",
        "url": "https://pldb.cloverdalepaint.com/documents/Cloverdale/docs/sell%20sheets/Cloverdale-WeatherOne-Stains-E.pdf"
      },
      {
        "label": "Current own manufacture and formulation of water-based acrylic wood coatings",
        "url": "https://www.cloverdalepaint.com/industrial/markets/wood-coatings-paint-sealer"
      },
      {
        "label": "Current complete industrial category scope",
        "url": "https://www.cloverdalepaint.com/industrial/products"
      },
      {
        "label": "Current full six-product additive list",
        "url": "https://www.cloverdalepaint.com/industrial/products/additives"
      },
      {
        "label": "Current paired coating activators/catalysts category",
        "url": "https://www.cloverdalepaint.com/industrial/products/activators-catalysts"
      },
      {
        "label": "Own laboratories, technical service and custom formulation/manufacture",
        "url": "https://www.cloverdalepaint.com/about-us-overview/about-us/business-opportunities/lab-tech-services"
      },
      {
        "label": "Current supplier introduction procedure; no submission or buying intent inferred",
        "url": "https://www.cloverdalepaint.com/about-us-overview/about-us/business-opportunities/cloverdale-paint-suppliers"
      },
      {
        "label": "Current headquarters address and telephone",
        "url": "https://www.cloverdalepaint.com/about-us-overview/contact-us/head-office"
      },
      {
        "label": "Public Kristopher Agnew technical role with exact personal business mailto, rechecked2026-10-14",
        "url": "https://www.cloverdalepaint.com/industrial/contact-us"
      },
      {
        "label": "Public Warren Delaney Wood Finishes Manager with exact business mailto, rechecked2026-10-14",
        "url": "https://www.cloverdalepaint.com/about-us-overview/contact-us/sales-departments/wood-finishes-sales-representatives"
      },
      {
        "label": "Original current linkedA60 TDS; version is historical, actual additive role reviewed",
        "url": "https://pldb.cloverdalepaint.com/documents/Cloverdale/tds/industrial/cloverdale-tds-a60-e.pdf"
      },
      {
        "label": "Original current linkedA65 TDS; version is historical, actual additive role reviewed",
        "url": "https://pldb.cloverdalepaint.com/documents/Cloverdale/tds/industrial/cloverdale-tds-a65-e.pdf"
      },
      {
        "label": "Original current linkedA66 TDS; version is historical, actual additive role reviewed",
        "url": "https://pldb.cloverdalepaint.com/documents/Cloverdale/tds/industrial/cloverdale-tds-a66-e.pdf"
      },
      {
        "label": "Original current linkedA68 TDS; version is historical, actual additive role reviewed",
        "url": "https://pldb.cloverdalepaint.com/documents/Cloverdale/tds/industrial/cloverdale-tds-a68-e.pdf"
      },
      {
        "label": "Original current linkedA69 TDS; version is historical, actual additive role reviewed",
        "url": "https://pldb.cloverdalepaint.com/documents/Cloverdale/tds/industrial/cloverdale-tds-a69-e.pdf"
      },
      {
        "label": "Original current linkedA70 TDS; version is historical, actual additive role reviewed",
        "url": "https://pldb.cloverdalepaint.com/documents/Cloverdale/tds/industrial/cloverdale-tds-a70-e.pdf"
      }
    ]
  },
  "diamond-vogel-orange-city": {
    "website": "https://www.diamondvogel.com/",
    "contactPage": "https://www.diamondvogel.com/architectural/product/grain-stain-semi-transparent-water-base",
    "generalEmail": "architectural@diamondvogel.com",
    "generalPhone": "+1 712 737 8880",
    "address": "1110 Albany Place SE, PO Box380, Orange City, IA51041, United States. Current own corporate/architectural address; city marker, not an independently verified plant GPS.",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "architectural@diamondvogel.com",
        "source": {
          "label": "Current own Grain Stain product and architectural business mailbox/telephone",
          "url": "https://www.diamondvogel.com/architectural/product/grain-stain-semi-transparent-water-base"
        }
      }
    ],
    "sources": [
      {
        "label": "Original current Grain Stain BG-0520 TDS, revised04/2023: own water-base wood stain",
        "url": "https://www.diamondvogel.com/documents/sites/documents.vogelpaint.com/files/documents/BG-0520PI.pdf"
      },
      {
        "label": "Own manufacturing plants and formulation laboratories",
        "url": "https://www.diamondvogel.com/about-us"
      },
      {
        "label": "All disclosed corporate market divisions and own brands",
        "url": "https://www.diamondvogel.com/home/our-markets"
      },
      {
        "label": "Current2026 family ownership, manufacture and contract-formulation scope",
        "url": "https://www.diamondvogel.com/history"
      },
      {
        "label": "Own toll and contract paint/coating manufacture and bulk chemical sourcing",
        "url": "https://www.diamondvogel.com/toll/"
      },
      {
        "label": "Current full Old Masters finished wood-product family list",
        "url": "https://www.diamondvogel.com/architectural/old-masters-products"
      },
      {
        "label": "Actual Masters Armor PartB hardener is for its paired finished coating only",
        "url": "https://myoldmasters.com/product/optional-part-b-hardener"
      },
      {
        "label": "Current own Grain Stain product and architectural business mailbox/telephone",
        "url": "https://www.diamondvogel.com/architectural/product/grain-stain-semi-transparent-water-base"
      }
    ]
  },
  "sansin-strathroy": {
    "website": "https://www.sansin.com/",
    "contactPage": "https://sansinfactoryfinish.com/contact-us/",
    "generalEmail": "precisioncoat@sansin.com",
    "generalPhone": "+1 519 245 2001",
    "address": "111 MacNab Avenue, Strathroy, Ontario N7G4J6, Canada. Public Canadian office/manufacturer address; city marker, not independently surveyed factory GPS.",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "precisioncoat@sansin.com",
        "source": {
          "label": "Public Canada factory-finish team mailbox and telephone, rechecked2026-10-14",
          "url": "https://sansinfactoryfinish.com/contact-us/"
        }
      }
    ],
    "sources": [
      {
        "label": "Original current ENS TDS, October2025: water diluent and wood/windows/doors/furniture",
        "url": "https://www.sansin.com/wp-content/uploads/ENS.pdf"
      },
      {
        "label": "Current own company research and development of waterborne wood coatings",
        "url": "https://www.sansin.com/about/about-sansin/"
      },
      {
        "label": "Original currently linked ENS SDS: manufacturer The Sansin Corporation; prepared05/4/2017, not a new issue",
        "url": "https://www.sansin.com/wp-content/uploads/SDS-ENS.pdf"
      },
      {
        "label": "Current visible complete consumer product-family list; individual SDS not exhaustively reviewed",
        "url": "https://www.sansin.com/products/find-a-product/"
      },
      {
        "label": "Own industrial/factory-finish formulation business and complete displayed categories",
        "url": "https://sansinfactoryfinish.com/about-us/"
      },
      {
        "label": "Actual Boracol finished boron wood-preservative system",
        "url": "https://www.sansin.com/product/boracol/"
      },
      {
        "label": "Actual finished aqueous wood stain-blocking primer",
        "url": "https://www.sansin.com/product/stain-blocking-primer/"
      },
      {
        "label": "Public Canada factory-finish team mailbox and telephone, rechecked2026-10-14",
        "url": "https://sansinfactoryfinish.com/contact-us/"
      }
    ]
  },
  "rfcl-ramagundam": {
    "website": "https://rfcl.co.in/",
    "contactPage": "https://rfcl.co.in/contact.php",
    "generalEmail": "admin@rfcl.co.in",
    "generalPhone": "+91 8728 257488",
    "address": "RFCL plant: Fertilizers City, RFCL Plant, Ramagundam, Peddapalli, Telangana505210,India. Registered: ScopeComplex,7InstitutionalArea,LodhiRoad,NewDelhi110003. Corporate:4thFloor,Wing-A,KribhcoBhawan,Sector1,Noida201301. CINU24100DL2015PLC276753. Marker is factory city, not precise plant GPS.",
    "contacts": [
      {
        "name": "S. K. Jindal",
        "title": "DGM (M&C); Unit Head, Ramagundam Unit",
        "department": "Production",
        "source": {
          "label": "Original132-page AnnualReport2025–26, own legal operation and actual urea production; financial chapters not claimed fully read",
          "url": "https://rfcl.co.in/upload/RFCL%20Annual%20Report%202025-2026.pdf"
        },
        "verifiedAt": "2026-10-13"
      }
    ],
    "departmentEmails": [
      {
        "department": "General",
        "email": "admin@rfcl.co.in",
        "source": {
          "label": "Official registered/corporate/plant public contact and explicitly published general admin@rfcl.co.in",
          "url": "https://rfcl.co.in/contact.php"
        }
      }
    ],
    "sources": [
      {
        "label": "Official company profile explicitly reports own neem-coated prilled urea production and JV operating identity",
        "url": "https://rfcl.co.in/"
      },
      {
        "label": "Original132-page AnnualReport2025–26, own legal operation and actual urea production; financial chapters not claimed fully read",
        "url": "https://rfcl.co.in/upload/RFCL%20Annual%20Report%202025-2026.pdf"
      },
      {
        "label": "Official actual own urea-manufacturing process",
        "url": "https://rfcl.co.in/urea.php"
      },
      {
        "label": "Official whole other product category: own ammonia manufacture",
        "url": "https://rfcl.co.in/ammonia.php"
      },
      {
        "label": "Official registered/corporate/plant public contact and explicitly published general admin@rfcl.co.in",
        "url": "https://rfcl.co.in/contact.php"
      },
      {
        "label": "Official current own legal/JV profile",
        "url": "https://rfcl.co.in/about.php"
      }
    ]
  },
  "ppg-pittsburgh": {
    "website": "https://www.ppg.com/",
    "contactPage": "https://procurement.ppg.com/Raw-Material-Introduction",
    "generalEmail": "pmcorderhelp@ppg.com",
    "generalPhone": "+1 412 434 3131 (registrant corporate telephone)",
    "address": "PPG Industries, Inc.,One PPG Place,Pittsburgh,Pennsylvania15272,United States. Incorporated in Pennsylvania; IRS25-0730780. Principal-office city marker, not a named plant GPS.",
    "contacts": [
      {
        "name": "Christine Camsuzou",
        "title": "Chief Procurement Officer and Vice-President Integrated Supply Chain",
        "department": "Procurement",
        "source": {
          "label": "Official actual global procurement team; role profiles without inferred personal emails",
          "url": "https://procurement.ppg.com/Our-Team"
        },
        "verifiedAt": "2026-10-13"
      },
      {
        "name": "William Pierce II",
        "title": "Global Director, Raw Materials",
        "department": "Procurement",
        "source": {
          "label": "Official actual global procurement team; role profiles without inferred personal emails",
          "url": "https://procurement.ppg.com/Our-Team"
        },
        "verifiedAt": "2026-10-13"
      }
    ],
    "departmentEmails": [
      {
        "department": "General",
        "email": "pmcorderhelp@ppg.com",
        "source": {
          "label": "Official US/Canada PMC order/business routing mailbox pmcorderhelp@ppg.com, not procurement or personal email",
          "url": "https://www.ppg.com/en-US/pmc/contact"
        }
      }
    ],
    "sources": [
      {
        "label": "Original currently linked US AMERLOCK400 seven-page PDS, revised2025-01-31",
        "url": "https://dam-cdn.ppg.com/adaptivemedia/rendition?id=8f0dedb9842d2dca9c1cf6d720c831654e1bef62"
      },
      {
        "label": "Original2025 Annual Report/Form10-K: own US legal manufacturer, business segments, manufacturing, raw materials and alliances",
        "url": "https://s25.q4cdn.com/953898558/files/doc_financials/2025/ar/PPG-ANNUAL-REPORT-2025-10K.pdf"
      },
      {
        "label": "Official raw-material introduction procedure requires a PPG sponsor invitation/request",
        "url": "https://procurement.ppg.com/Raw-Material-Introduction"
      },
      {
        "label": "Official actual global procurement team; role profiles without inferred personal emails",
        "url": "https://procurement.ppg.com/Our-Team"
      },
      {
        "label": "Official US/Canada PMC order/business routing mailbox pmcorderhelp@ppg.com, not procurement or personal email",
        "url": "https://www.ppg.com/en-US/pmc/contact"
      },
      {
        "label": "Current whole specialty product/material categories",
        "url": "https://www.ppg.com/en-US/about-ppg/specialty-products"
      },
      {
        "label": "Official own manufacturing converts bought raw materials into finished products",
        "url": "https://www.ppg.com/en-US/sustainability/waste"
      },
      {
        "label": "Current own AMERLOCK400 product and US/Canada region",
        "url": "https://www.ppg.com/en-US/pmc/product/amerlock-400/614103M0302"
      },
      {
        "label": "Renner Herrmann original institutional history: decorative paints divested to PPG in2007, Renner Italia remains a distinct operating business",
        "url": "https://www.rennercoatings.com/en/institucional/"
      }
    ]
  },
  "behr-santa-ana": {
    "website": "https://www.behr.com/",
    "contactPage": "https://www.behr.com/pro/contact-a-rep/",
    "generalPhone": "+1 714 545 7101",
    "address": "Behr Process LLC / Behr Paint Company,1801 East St.Andrew Place,Santa Ana,CA92705,United States. EPD manufacturer address and current corporate-office address agree; city marker, not a particular production-site GPS.",
    "contacts": [
      {
        "name": "Veronica Jimenez",
        "title": "Director of Primers and Specialty Coatings",
        "department": "Technical",
        "source": {
          "label": "Official2026-06-09 article names Veronica Jimenez, Director of Primers and Specialty Coatings; no personal mailbox disclosed",
          "url": "https://www.behr.com/pro/onthejob/blog/difficult-paint-substrates/"
        },
        "verifiedAt": "2026-10-13"
      }
    ],
    "departmentEmails": [],
    "sources": [
      {
        "label": "Original33-page Cabinet Door Trim EPD, issued2024-09-09 for5years; own manufacturer and formulation",
        "url": "https://www.behr.com/binaries/content/assets/behrpro/pdf/epd/121.1_behr_premium_cabinet_door_and_trim.pdf"
      },
      {
        "label": "Current own waterborne cabinet/door/trim product entry read through public primary web",
        "url": "https://www.behr.com/products/specialty-paint/behr-premium-cabinet-door-and-trim"
      },
      {
        "label": "Current Masco/Behr actual manufacturing sites and corporate headquarters",
        "url": "https://jobs.masco.com/behrpaint/us/en/locations"
      },
      {
        "label": "Current company/parent careers source and published corporate telephone",
        "url": "https://jobs.masco.com/behrpaint/us/en/life-at-behr"
      },
      {
        "label": "Current full professional finished-product category navigation and actual business/technical route, public web after native403",
        "url": "https://www.behr.com/pro/contact-a-rep/"
      },
      {
        "label": "Current interior coating selector; nine displayed of21 results is not a whole-SKU read",
        "url": "https://www.behr.com/products/filter/products"
      },
      {
        "label": "Official2026-06-09 article names Veronica Jimenez, Director of Primers and Specialty Coatings; no personal mailbox disclosed",
        "url": "https://www.behr.com/pro/onthejob/blog/difficult-paint-substrates/"
      }
    ]
  },
  "benjamin-moore-montvale": {
    "website": "https://www.benjaminmoore.com/",
    "contactPage": "https://www.benjaminmoore.com/en-us/contact-us",
    "generalEmail": "info@benjaminmoore.com",
    "generalPhone": "+1 201 573 9600 (company telephone printed in currently linked TDS US041023)",
    "address": "Benjamin Moore & Co.,101 Paragon Drive,Montvale,NJ07645,United States. Corporate-office city marker, not a manufacturing-plant GPS.",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "info@benjaminmoore.com",
        "source": {
          "label": "Official general business mailbox info@benjaminmoore.com and Montvale office",
          "url": "https://www.benjaminmoore.com/en-us/contact-us"
        }
      }
    ],
    "sources": [
      {
        "label": "Original currently linked ADVANCE Satin 792 TDS, code US041023; waterborne alkyd and wood/cabinet uses",
        "url": "https://media.benjaminmoore.com/WebServices/prod/assets/production/datasheets/TDS_0792/792_TDS_US.pdf"
      },
      {
        "label": "Original2025 Corporate Responsibility Report, published April2026: own manufacture, formulations, parent and sourcing",
        "url": "https://www.benjaminmoore.com/-/media/sites/benjaminmoore/files/pdf/corporate-responsibility/2025_corporate_responsibility_report_us.pdf"
      },
      {
        "label": "Current own whole product selector; initially displayed products are not a claimed exhaustive SKU review",
        "url": "https://www.benjaminmoore.com/en-us/product-catalog"
      },
      {
        "label": "Current INSL-X full finished coating and cleaning/preparation category scope",
        "url": "https://www.benjaminmoore.com/en-us/interior-exterior-paints-stains/insl-x"
      },
      {
        "label": "Current Corotech commercial and industrial finished coating scope",
        "url": "https://www.benjaminmoore.com/en-us/contractors/corotech-high-performance-coatings"
      },
      {
        "label": "Actual cleaning/preparation products: degreaser, citrus cleaner and concrete etch",
        "url": "https://www.benjaminmoore.com/en-us/b/insl-x-cleaning-prep-products"
      },
      {
        "label": "Current STIX: formulated acrylic-urethane finished bonding primer, not evidence of a raw PO/CPO dispersion product",
        "url": "https://www.benjaminmoore.com/en-us/interior-exterior-paints-stains/insl-x/stix-waterborne-bonding-primer"
      },
      {
        "label": "Official general business mailbox info@benjaminmoore.com and Montvale office",
        "url": "https://www.benjaminmoore.com/en-us/contact-us"
      }
    ]
  },
  "asian-paints-mumbai": {
    "website": "https://www.asianpaints.com/",
    "contactPage": "https://www.asianpaints.com/more/supplier-registration.html",
    "generalEmail": "customercare@asianpaints.com",
    "generalPhone": "1800-209-5678 (India customer-care route)",
    "address": "Registered and corporate office: 6A & 6B, Shantinagar, Santacruz (East), Mumbai 400055, Maharashtra, India. CIN L24220MH1945PLC004598. Marker is Mumbai city, not a particular manufacturing-site GPS.",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "customercare@asianpaints.com",
        "source": {
          "label": "Official expressly disclosed entry for prospective paint raw-material suppliers; customer-care mailbox is general routing only",
          "url": "https://www.asianpaints.com/more/supplier-registration.html"
        }
      }
    ],
    "sources": [
      {
        "label": "Original FY2025–26 Business Review: own WoodTech PU Gold and Aquadur coating range, full reviewed eight-page business chapter",
        "url": "https://static.asianpaints.com/content/dam/annual-report-2526/pdf/Business-review.pdf"
      },
      {
        "label": "Original FY2025–26 BRSR: standalone legal entity, actual manufacturing, reporting boundary and procurement",
        "url": "https://static.asianpaints.com/content/dam/annual-report-2526/pdf/Business-Responsibility-and-Sustainability-Report.pdf"
      },
      {
        "label": "Original FY2025–26 General Shareholder Information: company CIN and Mumbai registered office",
        "url": "https://static.asianpaints.com/content/dam/annual-report-2526/pdf/General-shareholder-information.pdf"
      },
      {
        "label": "Official expressly disclosed entry for prospective paint raw-material suppliers; customer-care mailbox is general routing only",
        "url": "https://www.asianpaints.com/more/supplier-registration.html"
      },
      {
        "label": "Official Penta division full disclosed chemical range and upstream precursor applications",
        "url": "https://penta.asianpaints.com/"
      },
      {
        "label": "Official current whole finished paint/coating and ancillary business categories",
        "url": "https://www.asianpaints.com/products.html"
      },
      {
        "label": "Official current own wood-coating families, including water-based WoodTech Aquadur",
        "url": "https://www.asianpaints.com/products/wood-finish.html"
      },
      {
        "label": "Official current integrated annual-report directory linking the original report sections",
        "url": "https://www.asianpaints.com/content/annualreport/annual-report-25-26.html"
      }
    ]
  },
  "sika-baar": {
    "website": "https://www.sika.com/",
    "contactPage": "https://industry.sika.com/en/home/about-industry/contact.html",
    "generalEmail": "industry@ch.sika.com",
    "generalPhone": "+41 58 436 40 40",
    "address": "Group headquarters: Sika AG, Zugerstrasse 50, CH-6340 Baar (ZG), Switzerland. Industrial business contact: Sika Services AG, Tüffenwies 16, 8048 Zurich, Switzerland. Marker represents Baar city, not a manufacturing-site GPS.",
    "contacts": [
      {
        "name": "Bernhard Bosshard",
        "title": "Head of Technology - Coating Systems",
        "department": "Technical",
        "source": {
          "label": "Official own developed coating systems and disclosed current technology head",
          "url": "https://www.sika.com/en/sustainability/innovation/technologies/coating-systems.html"
        },
        "verifiedAt": "2026-10-13"
      }
    ],
    "departmentEmails": [
      {
        "department": "General",
        "email": "industry@ch.sika.com",
        "source": {
          "label": "Official industrial business contact: published industry@ch.sika.com and Swiss Sika Services address",
          "url": "https://industry.sika.com/en/home/about-industry/contact.html"
        }
      }
    ],
    "sources": [
      {
        "label": "Official own developed coating systems and disclosed current technology head",
        "url": "https://www.sika.com/en/sustainability/innovation/technologies/coating-systems.html"
      },
      {
        "label": "Official group own production and global manufacturing role",
        "url": "https://www.sika.com/en/about-us/who-we-are.html"
      },
      {
        "label": "Official global procurement material-category organization and supplier collaboration",
        "url": "https://www.sika.com/en/about-us/who-we-are/procurement.html"
      },
      {
        "label": "Official full construction business scope",
        "url": "https://www.sika.com/en/construction.html"
      },
      {
        "label": "Official coating, adhesive and concrete technology scope",
        "url": "https://www.sika.com/en/sustainability/innovation/technologies.html"
      },
      {
        "label": "Official own formulated adhesive systems and technology scope",
        "url": "https://www.sika.com/en/sustainability/innovation/technologies/adhesive-systems.html"
      },
      {
        "label": "Official industrial business and finished formulation scope",
        "url": "https://industry.sika.com/en/home.html"
      },
      {
        "label": "Official Advanced Resins formulated EP/PUR casting systems and functional coatings",
        "url": "https://industry.sika.com/en/home/advanced-resins.html"
      },
      {
        "label": "Official two-component EP/PUR casting-system applications",
        "url": "https://industry.sika.com/en/home/advanced-resins/epoxy-and-polyurethanecasting.html"
      },
      {
        "label": "Official industrial business contact: published industry@ch.sika.com and Swiss Sika Services address",
        "url": "https://industry.sika.com/en/home/about-industry/contact.html"
      },
      {
        "label": "Official Swiss Sika AG legal identity",
        "url": "https://www.sika.com/en/footer/legal-notice.html"
      },
      {
        "label": "Official Sika AG Baar headquarters address",
        "url": "https://www.sika.com/en/about-us/who-we-are.html"
      }
    ]
  },
  "cifo-san-giorgio": {
    "website": "https://www.cifo.it/",
    "contactPage": "https://www.cifo.it/contatti/",
    "generalEmail": "info@cifo.it",
    "generalPhone": "+39 051 6655511",
    "address": "Via Oradour 6/8, 40016 San Giorgio di Piano, Bologna, Italy (current legal/contact). 2026 catalogue printsViaOradour6; same site, not a new company.",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "info@cifo.it",
        "source": {
          "label": "Official explicitly disclosed generalbusiness / customer-care inbox",
          "url": "https://www.cifo.it/contatti/"
        }
      }
    ],
    "sources": [
      {
        "label": "Official own factory and in-house formulation research; production range includes slow-release fertilizers",
        "url": "https://www.cifo.it/azienda/"
      },
      {
        "label": "Official current actual porousMCTmembrane slow-release green-plant fertilizer",
        "url": "https://www.cifo.it/home-e-garden/prodotti/concime-a-lenta-cessione-per-piante-verdi/"
      },
      {
        "label": "Official original2026 complete145pageHome&Garden catalogue; physicalPDF73/printed72 actualMCTcoatedNPK; noPUchemistry claimed",
        "url": "https://www.cifo.it/wp-content/uploads/cataloghi/CIFO_catalogo_HG.pdf"
      },
      {
        "label": "Official current whole professionalagriculture products",
        "url": "https://www.cifo.it/agricoltura-professionale/prodotti/"
      },
      {
        "label": "Official current whole Home&Garden products",
        "url": "https://www.cifo.it/home-e-garden/prodotti/"
      },
      {
        "label": "Official current legal manufacturer and generalbusiness contact",
        "url": "https://www.cifo.it/contatti/"
      },
      {
        "label": "Official current CifoSrl legal address and generalemail",
        "url": "https://www.cifo.it/privacy/"
      },
      {
        "label": "Official originalCifoSrl purchase terms revised2025-11-03; genericterms do not prove specific input purchase",
        "url": "https://www.cifo.it/wp-content/uploads/HAS-CIFO-PO-TCS-JMH-EU-Form.pdf"
      },
      {
        "label": "Official actual foliage pesticide wetting-adjuvant chemistry/use",
        "url": "https://www.cifo.it/agricoltura-professionale/prodotti/bagnante-adesivo-cifo/"
      },
      {
        "label": "Official actual plant-defense linseed formulation",
        "url": "https://www.cifo.it/home-e-garden/prodotti/olio-di-lino/"
      },
      {
        "label": "Official actual plant-strengthening Neemformulation",
        "url": "https://www.cifo.it/home-e-garden/prodotti/olio-di-neem/"
      },
      {
        "label": "Official Huber currentportfolio and operationalautonomy",
        "url": "https://www.huber.com/our-businesses/"
      },
      {
        "label": "Official Huber AgroSolutions companies and current Cifoassociation",
        "url": "https://huberagrosolutions.com/"
      },
      {
        "label": "Official Miller Pinolene current plantsurface application",
        "url": "https://www.millerchemical.com/about/proprietary-technology"
      },
      {
        "label": "Official related PMU nonmelting functionalparticles, actualmatting/carrier use not assumed fertilizerfilmresin",
        "url": "https://www.huberadvancedmaterials.com/products/pergopak-organic-matting-agents-and-carriers"
      }
    ]
  },
  "coromandel-chennai": {
    "website": "https://www.coromandel.biz/",
    "contactPage": "https://www.coromandel.biz/contact-us/",
    "generalEmail": "hellogromor1@coromandel.murugappa.com",
    "generalPhone": "1800 425 2828 (India customer-care / technical-enquiry route)",
    "address": "Corporate Office — Olympia Terraces, 15B SP, SIDCO Industrial Estate, Guindy, Chennai 600032, Tamil Nadu, India (June2026 official Bio Products brochure). Registered Coromandel House contact location at Sardar Patel Road, Secunderabad belongs to the same entity.",
    "contacts": [
      {
        "name": "Amit Rastogi",
        "title": "Executive Vice President & Chief Technology Officer",
        "source": {
          "label": "Official current executive title; no personal business inbox disclosed",
          "url": "https://www.coromandel.biz/company/top-management/"
        },
        "verifiedAt": "2026-10-13"
      },
      {
        "name": "Amir Alvi",
        "title": "Chief Operating Officer — Fertiliser",
        "source": {
          "label": "Official current fertiliser executive role; former2023role is not current; no personal business inbox disclosed",
          "url": "https://www.coromandel.biz/company/top-management/"
        },
        "verifiedAt": "2026-10-13"
      }
    ],
    "departmentEmails": [
      {
        "department": "General",
        "email": "hellogromor1@coromandel.murugappa.com",
        "source": {
          "label": "Official explicitly disclosed generalbusiness / customer-care inbox",
          "url": "https://www.coromandel.biz/wp-content/uploads/2026/08/Final_Bio-Product-Brochure_June-2026.pdf"
        }
      }
    ],
    "sources": [
      {
        "label": "Official current own complex-fertiliser manufacturing business and complete business categories",
        "url": "https://www.coromandel.biz/products-services/"
      },
      {
        "label": "Official current Gromor28 ammonium-phosphate-coated urea-prill description",
        "url": "https://www.coromandel.biz/gromor-28-28-0/"
      },
      {
        "label": "Official original2014–15 annual report; physicalPDF30/printed28 explicit own28:28:0 production in Kakinada; historical event",
        "url": "https://www.coromandel.biz/wp-content/uploads/2025/02/AnnualReport_2014_15.pdf"
      },
      {
        "label": "Official Q1FY27 current manufacturing and plannedQ4FY27 expansion; plan not commissioned",
        "url": "https://www.coromandel.biz/press-release/coromandel-international-limited-posts-q1-fy27-results/"
      },
      {
        "label": "Official June2026 original52page full Bio Products catalogue; page52 public business email/address/technical-enquiry routing",
        "url": "https://www.coromandel.biz/wp-content/uploads/2026/08/Final_Bio-Product-Brochure_June-2026.pdf"
      },
      {
        "label": "Official whole crop-protection bio-product range; plant-protection inputs not assumed fertilizer-coating agents",
        "url": "https://www.coromandel.biz/bio-products-crop-protection/"
      },
      {
        "label": "Official crop-nutrition bio-products range",
        "url": "https://www.coromandel.biz/bio-products-crop-nutrition/"
      },
      {
        "label": "Official actual other spray-adjuvant/anti-transpirant/bee-attractant formulations",
        "url": "https://www.coromandel.biz/bio-products-others/"
      },
      {
        "label": "Official current corporate and manufacturing-site business contact route",
        "url": "https://www.coromandel.biz/contact-us/"
      },
      {
        "label": "Official current CTO and fertiliser COO roles, with no inferred personal inbox",
        "url": "https://www.coromandel.biz/company/top-management/"
      }
    ]
  },
  "fcp-cerea-bonavicina": {
    "website": "https://fcpcerea.it/",
    "contactPage": "https://fcpcerea.it/contatti",
    "generalEmail": "fcpcerea@fcpcerea.it",
    "generalPhone": "+39 045 7125911",
    "address": "Via Farfusola 6, 37050 Bonavicina di S. Pietro di Morubio, Verona, Italy",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "Technical",
        "email": "laboratorio@fcpcerea.it",
        "source": {
          "label": "Official current explicitly disclosed department business mailbox",
          "url": "https://fcpcerea.it/contatti"
        }
      },
      {
        "department": "General",
        "email": "fcpcerea@fcpcerea.it",
        "source": {
          "label": "Official current explicitly disclosed department business mailbox",
          "url": "https://fcpcerea.it/contatti"
        }
      },
      {
        "department": "Technical",
        "email": "agronomia@fcpcerea.it",
        "source": {
          "label": "Official current explicitly disclosed department business mailbox",
          "url": "https://fcpcerea.it/contatti"
        }
      },
      {
        "department": "Sales",
        "email": "francesca.moretto@fcpcerea.it",
        "source": {
          "label": "Official current explicitly disclosed department business mailbox",
          "url": "https://fcpcerea.it/contatti"
        }
      }
    ],
    "sources": [
      {
        "label": "Official current own compound-fertilizer manufacture, actual coating plant and chemical/agronomic lab",
        "url": "https://fcpcerea.it/azienda"
      },
      {
        "label": "Official2018 coating-plant construction for liquid/powder post-granulation enrichment",
        "url": "https://fcpcerea.it/fcp-cerea-la-storia"
      },
      {
        "label": "Official original81page English catalogue; physicalPDF43/printed84–85 coating manufacture,PDF29/printed56–57 Cerere; document revision date not assumed from retrieval",
        "url": "https://fcpcerea.it/uploads/media/catalogo-eng.pdf"
      },
      {
        "label": "Official current Mastercote NPK with coated urea; coating chemistry/manufacturing of every constituent not disclosed",
        "url": "https://fcpcerea.it/prodotti/mastercote/"
      },
      {
        "label": "Official current Control slow-release urea-formaldehyde NPK; not proof of PU film",
        "url": "https://fcpcerea.it/prodotti/control/"
      },
      {
        "label": "Official current laboratory/general/agronomic/export business contact and legal/VAT identity",
        "url": "https://fcpcerea.it/contatti"
      },
      {
        "label": "Official all granular finished fertilizers",
        "url": "https://fcpcerea.it/categoria/granulari"
      },
      {
        "label": "Official all special plant-nutrition formulations",
        "url": "https://fcpcerea.it/categoria/nutrizione-speciale"
      },
      {
        "label": "Official all water-soluble finished fertilizers",
        "url": "https://fcpcerea.it/categoria/idrosolubile"
      },
      {
        "label": "Official all organic-approved finished products",
        "url": "https://fcpcerea.it/categoria/biologica"
      },
      {
        "label": "Official Cerere polyol/humic plant foliar/root stress-protection formulation; preserve actual use",
        "url": "https://fcpcerea.it/prodotti/cerere/"
      },
      {
        "label": "Official actual research and formulation activity",
        "url": "https://fcpcerea.it/ricerca-e-sviluppo-in-fcp-cerea"
      }
    ]
  },
  "valresa-riba-roja": {
    "website": "https://valresa.com/",
    "contactPage": "https://valresa.com/contact/",
    "generalEmail": "valresa@valresa.com",
    "generalPhone": "+34 961 669 560",
    "address": "Polígono Industrial Reva, Av. dels Gremis, s/n, 46394 Riba-roja de Túria, Valencia, Spain (current business contact;2021legal text has46190)",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "valresa@valresa.com",
        "source": {
          "label": "Official explicitly disclosed general business mailbox",
          "url": "https://valresa.com/contact/"
        }
      }
    ],
    "sources": [
      {
        "label": "Official current international manufacturing sites and own R&D/product development",
        "url": "https://valresa.com/empresa/grupo/"
      },
      {
        "label": "Official company wood-coating development and history",
        "url": "https://valresa.com/empresa/"
      },
      {
        "label": "Official ESFERA waterborne wood-finishes own development",
        "url": "https://valresa.com/barnices-bricolaje/barnices-interior/"
      },
      {
        "label": "Official270063 waterborne basecoat/finish for wood; current page title is Fondo Acabado Base Agua",
        "url": "https://valresa.com/?page_id=6566"
      },
      {
        "label": "Official700602 waterborne high-resistance wood varnish and paired hardener",
        "url": "https://valresa.com/?page_id=6569"
      },
      {
        "label": "Official legal manufacturer ValresaCoatingsSA CIF A46030169",
        "url": "https://valresa.com/aviso-legal/"
      },
      {
        "label": "Official current general business inbox and address",
        "url": "https://valresa.com/contact/"
      },
      {
        "label": "Official finishedPU varnish systems",
        "url": "https://valresa.com/acabado-poliuretano/"
      },
      {
        "label": "Official finishedpolyester varnish systems",
        "url": "https://valresa.com/acabado-poliester/"
      },
      {
        "label": "Official nitrocellulose finishedwood varnishes",
        "url": "https://valresa.com/barniz-nitrocelulosico/"
      },
      {
        "label": "Official powder-coating scope",
        "url": "https://valresa.com/pintura-en-polvo/"
      },
      {
        "label": "Official colour-paste/tinting system scope",
        "url": "https://valresa.com/servicios/sistema-tintometrico/"
      },
      {
        "label": "Official Turkish joint venture legal relationship and actual current business scope",
        "url": "https://www.ibavalresa.com.tr/hakkimizda.html"
      },
      {
        "label": "Official Esfera/Valresa/İbavet/İba Sanayi same joint venture brands",
        "url": "https://www.ibavalresa.com.tr/markalar.html"
      }
    ]
  },
  "isaval-ribarroja": {
    "website": "https://www.isaval.es/",
    "contactPage": "https://www.isaval.es/contacto/",
    "generalEmail": "isaval@isaval.es",
    "generalPhone": "+34 96 164 00 01",
    "address": "C/ Velluters, parcela 2–14, Polígono Industrial Casanova, 46394 Ribarroja del Turia, Valencia, Spain",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "isaval@isaval.es",
        "source": {
          "label": "Official explicitly disclosed general business mailbox",
          "url": "https://www.isaval.es/contacto/"
        }
      }
    ],
    "sources": [
      {
        "label": "Official own product development and manufacture at Ribarroja factory",
        "url": "https://www.isaval.es/sobre-isaval/quienes-somos/"
      },
      {
        "label": "Official actual single-component waterborne polyurethane wood varnish",
        "url": "https://www.isaval.es/productos/xanol-barniz-interior/"
      },
      {
        "label": "Official original Xanol1907 TDS v6,2026-01-13, wood application and general mailbox; pp1–3",
        "url": "https://www.isaval.es/wp-content/uploads/fichas-tecnicas/1907_es.pdf"
      },
      {
        "label": "Official manufacturer legal identity, general business inbox, phone and address",
        "url": "https://www.isaval.es/contacto/"
      },
      {
        "label": "Official website legal owner; same Isaval public account",
        "url": "https://www.isaval.es/nota-legal/"
      },
      {
        "label": "Official full paints/coatings catalogue; all25pagination pages independently saved",
        "url": "https://www.isaval.es/categoria-de-producto/pinturas-y-revestimientos/"
      },
      {
        "label": "Official accessory/tools whole scope including non-PO adjunct materials",
        "url": "https://www.isaval.es/categoria-de-producto/herramientas-y-complementos/"
      },
      {
        "label": "Official Resul physical antislip particles",
        "url": "https://www.isaval.es/productos/aditivo-resul-antideslizante/"
      },
      {
        "label": "Official Sanit anti-mould/anti-algae additive",
        "url": "https://www.isaval.es/productos/sanit-aditivo/"
      },
      {
        "label": "Official finished epoxy primer actual coating use",
        "url": "https://www.isaval.es/productos/imperal-primer-acqua/"
      },
      {
        "label": "Official mineral-surface silicate primer/diluent",
        "url": "https://www.isaval.es/productos/siltop-sol-silicato-concentrado/"
      }
    ]
  },
  "juno-erandio": {
    "website": "https://www.juno.es/",
    "contactPage": "https://www.juno.es/contacto/",
    "generalEmail": "infoweb@juno.es",
    "generalPhone": "+34 944 670 062",
    "address": "Barrio Saconi, 10, 48950 Erandio, Bizkaia, Spain (current official headquarters and factory contact; TDS spells Sakoni)",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "infoweb@juno.es",
        "source": {
          "label": "Official explicitly disclosed general business mailbox",
          "url": "https://www.junoindustrial.com/"
        }
      }
    ],
    "sources": [
      {
        "label": "Official current own paint manufacture and Erandio company history",
        "url": "https://www.juno.es/quienes-somos/"
      },
      {
        "label": "Official headquarters and factory address and phone",
        "url": "https://www.juno.es/contacto/"
      },
      {
        "label": "Official actual acrylic waterborne wood finish",
        "url": "https://www.juno.es/productos/pintura/madera/lasures/ficha/lasur-acuoso/"
      },
      {
        "label": "Official original LASUR ACUOSO TDS; June2016Rev07, currently linked; pp1–2",
        "url": "https://www.juno.es/assets/media/FT_LASUR-ACUOSO.pdf"
      },
      {
        "label": "Official current2026 full48page finished-product catalogue; wood p33 and epoxy/silane finished primers p23",
        "url": "https://www.juno.es/assets/media/CATALOGO-JUNO2026.pdf"
      },
      {
        "label": "Official full24page industrial finished-coating catalogue; own manufacture/labs p2",
        "url": "https://www.junoindustrial.com/assets/media/Catalogo-JUNO-Industrial.pdf"
      },
      {
        "label": "Official industrial division same legal company and general mailbox",
        "url": "https://www.junoindustrial.com/"
      },
      {
        "label": "Official current additive range, physicalPE/PP antislip beads",
        "url": "https://www.juno.es/productos/pintura/varios/aditivos"
      },
      {
        "label": "Official legal entity and general communication inbox",
        "url": "https://www.juno.es/aviso-legal/"
      }
    ]
  },
  "gubretas-istanbul": {
    "website": "https://www.gubretas.com.tr/",
    "contactPage": "https://www.gubretas.com.tr/tr/iletisim",
    "generalPhone": "+90 216 468 5050",
    "address": "Headquarters: Yamanevler Mahallesi, Ahmet Tevfik İleri Caddesi, Bereket Plaza No.1, İç Kapı No.3, 34768 Ümraniye, İstanbul, Turkey. Production registration names Turkey; city marker is not Yarımca plant GPS.",
    "contacts": [
      {
        "name": "Musa Goral",
        "title": "General Manager",
        "department": "Management",
        "source": {
          "label": "Official 1 October 2026 announcement: Musa Goral is current General Manager",
          "url": "https://www.gubretas.com.tr/tr/haber/gubretas-olaganustu-genel-kurulu-yogun-yatirimci-katilimiyla--tamamlandi--"
        },
        "verifiedAt": "2026-10-13"
      }
    ],
    "departmentEmails": [
      {
        "department": "General",
        "email": "gubretas@gubretas.com.tr",
        "source": {
          "label": "Official current corporate business inbox and production-site contact routes",
          "url": "https://www.gubretas.com.tr/tr/iletisim"
        }
      }
    ],
    "sources": [
      {
        "label": "Official SLOWFERT SÜPER İNCİ NBPT-inhibited urea product, marketed in slow-release series",
        "url": "https://www.gubretas.com.tr/tr/urun/slowfert-super-inci"
      },
      {
        "label": "Official current original product registration: named producer, Turkey, NBPT urea; renewed 2023 registration and 2026 signed label",
        "url": "https://www.gubretas.com.tr/uploads/files/products/33557-superinci-417.pdf"
      },
      {
        "label": "Official GUBRETAS own manufacturing, full legal identity and consolidated associated businesses",
        "url": "https://www.gubretas.com.tr/tr/hakkimizda"
      },
      {
        "label": "Original GUBRETAS FY2025 annual report: own production, Razi commodity raw-material scope, Tarkim and mining associations",
        "url": "https://www.gubretas.com.tr/uploads/files/pages/gubretas_faaliyet_raporu_31122025-1012.pdf"
      },
      {
        "label": "Official complete plant-nutrition and auxiliary-product classifications",
        "url": "https://www.gubretas.com.tr/tr/urunler/bitki-besleme-grubu"
      },
      {
        "label": "Official auxiliary N-GATE: finished 15% urea-nitrogen fertiliser for drip irrigation",
        "url": "https://www.gubretas.com.tr/tr/urun/n-gate"
      },
      {
        "label": "Official GF-MIX: agricultural tank-mix and water pH conditioner",
        "url": "https://www.gubretas.com.tr/tr/urun/gf-mix"
      },
      {
        "label": "Official PEHAWET: foliar/drip application water conditioner and spreader",
        "url": "https://www.gubretas.com.tr/tr/urun/pehawet"
      },
      {
        "label": "Official 1 October 2026 announcement: Musa Goral is current General Manager",
        "url": "https://www.gubretas.com.tr/tr/haber/gubretas-olaganustu-genel-kurulu-yogun-yatirimci-katilimiyla--tamamlandi--"
      },
      {
        "label": "Official current corporate business inbox and production-site contact routes",
        "url": "https://www.gubretas.com.tr/tr/iletisim"
      },
      {
        "label": "Official shareholder structure; retain Tarım Kredi controlling association",
        "url": "https://www.gubretas.com.tr/tr/ortaklik-yapisi"
      }
    ]
  },
  "toros-agri-istanbul": {
    "website": "https://www.toros.com.tr/",
    "contactPage": "https://www.toros.com.tr/tr/toros-kurumsal/iletisim/genel-iletisim-bilgileri",
    "generalPhone": "+90 212 357 0202",
    "address": "Corporate office: Yamanevler Mah., Ahmet Tevfik İleri Cad., No.22-26, İç Kapı No.48, Ümraniye, İstanbul, Turkey. Own fertilizer manufacture in Ceyhan, Mersin and Samsun; marker is headquarters city, not factory or laboratory GPS.",
    "contacts": [],
    "departmentEmails": [],
    "sources": [
      {
        "label": "Original 2021 Toros R&D study: actual NP20-20 compound-fertiliser surface-coating evaluation",
        "url": "https://www.eurjchem.com/index.php/eurjchem/article/view/2120"
      },
      {
        "label": "Original six-page coating study methods: Toros NP samples and applied external commercial liquid/wax coatings",
        "url": "https://www.eurjchem.com/index.php/eurjchem/article/download/2120/pdf_2120/17837"
      },
      {
        "label": "Official current Toros legal identity, own three fertilizer factories and Mersin formulation/R&D",
        "url": "https://www.toros.com.tr/tr/toros-kurumsal/hakkinda/genel-bakis"
      },
      {
        "label": "Original Tekfen FY2025 annual report: complete group businesses and actual Toros manufacture",
        "url": "https://www.tekfen.com.tr/en/Uploads/pdfs/137202613391527tekfen-ar-2025-enr1.pdf"
      },
      {
        "label": "Official complete current Toros finished-fertilizer product portfolio",
        "url": "https://www.toros.com.tr/tr/gubre-faaliyetleri/urunler/bitki-besleme/klasik-gubreler"
      },
      {
        "label": "Official Toros operating subsidiaries: ports, biogas and finished organic fertilisers",
        "url": "https://www.toros.com.tr/tr/toros-kurumsal/hakkinda/bagli-ortakliklarimiz"
      },
      {
        "label": "Official Toros corporate business contact entry, telephone and current headquarters",
        "url": "https://www.toros.com.tr/tr/toros-kurumsal/iletisim/genel-iletisim-bilgileri"
      }
    ]
  },
  "paradeep-phosphates-bhubaneswar": {
    "website": "https://www.paradeepphosphates.com/",
    "contactPage": "https://www.paradeepphosphates.com/contact-us",
    "generalPhone": "+91 674 6666100",
    "address": "Registered office per official contact page: 5th Floor, Bayan Bhavan, Pandit Jawaharlal Nehru Marg, Bhubaneswar 751001, Odisha, India. Corporate office: 3rd Floor, Adventz Centre, 28 Union Street, Off Cubbon Road, Bengaluru 560001. Latest annual report includes Paradeep, Goa, Mangaluru and Mahad manufacturing units; city marker is not factory GPS.",
    "contacts": [
      {
        "name": "Raj Kumar Gupta",
        "title": "Chief Procurement Officer",
        "department": "Procurement",
        "source": {
          "label": "Official procurement leadership, disclosed title and function; no personal email attributed",
          "url": "https://www.paradeepphosphates.com/about-us/leadership"
        },
        "verifiedAt": "2026-10-12"
      }
    ],
    "departmentEmails": [
      {
        "department": "General",
        "email": "CorpAffairsBBSR@adventz.com",
        "source": {
          "label": "Official PPL general corporate inbox, registered/corporate offices and plants",
          "url": "https://www.paradeepphosphates.com/contact-us"
        }
      }
    ],
    "sources": [
      {
        "label": "Official own Jai Kisaan Navratna neem-coated urea product",
        "url": "https://www.paradeepphosphates.com/brands-and-products"
      },
      {
        "label": "Official own acquired Goa urea manufacturing facilities",
        "url": "https://www.paradeepphosphates.com/our-capabilities/manufacturing"
      },
      {
        "label": "Original PPL FY2025-26 annual report: current CIN, integrated manufacture, four units, portfolio and holding-company relationship",
        "url": "https://www.paradeepphosphates.com/uploads/content/paradeep-phosphate-ar-24082026-1.pdf"
      },
      {
        "label": "Official completed MCFL merger, effective 16 October 2025; same consolidated PPL account",
        "url": "https://www.paradeepphosphates.com/uploads/content/17-10-25.pdf"
      },
      {
        "label": "Original 30 June 2026 PPL promoter shareholding; table visually checked",
        "url": "https://www.paradeepphosphates.com/uploads/content/shp-30062026.pdf"
      },
      {
        "label": "Original Chambal FY2025-26 annual report: separate CIN, facilities, shareholders, subsidiaries and joint venture",
        "url": "https://www.chambalfertilisers.com/pdf/Annual-Report-for-the-Financial-Year_2025-26.pdf"
      },
      {
        "label": "Official complete current fertiliser and industrial scope including ABC and SNF",
        "url": "https://www.paradeepphosphates.com/about-us"
      },
      {
        "label": "Merged MCFL original SNF powder: concrete-admixture dispersant input scope",
        "url": "https://www.mangalorechemicals.com/what_we_do/products_md_chemcfnp"
      },
      {
        "label": "Official procurement leadership, disclosed title and function; no personal email attributed",
        "url": "https://www.paradeepphosphates.com/about-us/leadership"
      },
      {
        "label": "Official PPL general corporate inbox, registered/corporate offices and plants",
        "url": "https://www.paradeepphosphates.com/contact-us"
      }
    ]
  },

  "axalta-philadelphia": {
    "website": "https://www.axalta.com/",
    "contactPage": "https://www.axalta.com/corporate/en_US/contacts.html",
    "generalPhone": "+1 855 547 1461",
    "address": "Principal executive office: 1050 Constitution Avenue, Philadelphia, Pennsylvania 19112, United States. Parent legal incorporation: Bermuda. Marker is Philadelphia city, not a specific manufacturing-site GPS.",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "Procurement",
        "email": "supplier-info@axalta.com",
        "source": {
          "label": "Official explicitly disclosed business entry for prospective suppliers",
          "url": "https://www.axalta.com/corporate/en_US/contacts.html"
        }
      },
      {
        "department": "General",
        "email": "industrialNA@axalta.com",
        "source": {
          "label": "Official current industrial customer-service business inbox and liquid formulation scope",
          "url": "https://www.axalta.com/liquidindustrial_us/en_US/general-industrial.html"
        }
      }
    ],
    "sources": [
      {
        "label": "Official current Corroless finished protective-coating formulation and iron/steel applications",
        "url": "https://www.axalta.com/liquidindustrial_us/en_US/Products/corroless.html"
      },
      {
        "label": "Original Axalta FY2025 Form 10-K: actual industrial manufacture, full business scope and external raw-material purchase",
        "url": "https://www.akzonobel.com/content/dam/akzonobel-corporate/global/en/merger/axalta-form10-k-fy2025.pdf"
      },
      {
        "label": "Axalta original FY2025 annual-report directory and author-controlled document link",
        "url": "https://ir.axalta.com/company-information/annual-reports-proxy"
      },
      {
        "label": "Official current company legal identity, Philadelphia executive office and paint/coating manufacturing classification",
        "url": "https://ir.axalta.com/company-information"
      },
      {
        "label": "Official full North American liquid-industrial finished product portfolio",
        "url": "https://www.axalta.com/liquidindustrial_us/en_US/Products.html"
      },
      {
        "label": "Official explicitly disclosed business entry for prospective suppliers",
        "url": "https://www.axalta.com/corporate/en_US/contacts.html"
      },
      {
        "label": "Official current industrial customer-service business inbox and liquid formulation scope",
        "url": "https://www.axalta.com/liquidindustrial_us/en_US/general-industrial.html"
      },
      {
        "label": "Official merger page: transaction still expected to close in late2026 to early2027",
        "url": "https://www.akzonobel.com/en/merger-information"
      },
      {
        "label": "Official August2026 shareholder approval remains subject to regulatory and closing conditions",
        "url": "https://ir.axalta.com/news/press-releases/detail/688/axalta-shareholders-approve-proposed-merger-of-equals-with-akzonobel"
      },
      {
        "label": "Official newer August31 board announcement: appointments take effect upon closing",
        "url": "https://ir.axalta.com/news/press-releases/detail/689/akzonobel-and-axalta-announce-three-directors-to-finalize-board-of-combined-company"
      },
      {
        "label": "Official current press-release directory reviewed for subsequent closing announcements",
        "url": "https://ir.axalta.com/news/press-releases"
      }
    ]
  },
  "mahadhan-agritech-pune": {
    "website": "https://www.mahadhanagritech.com/",
    "contactPage": "https://www.mahadhanagritech.com/contact",
    "generalPhone": "+91 20 66458000",
    "address": "Corporate and registered office: Sai Hira, Survey No. 93, Mundhwa, Pune 411036, Maharashtra, India. Own NPK manufacturing at Taloja, Raigad; map marker represents Pune headquarters city, not factory GPS.",
    "contacts": [
      {
        "name": "Mahem Dwivedi",
        "title": "AVP – Sales & Marketing Support",
        "department": "Sales",
        "email": "mahem.dwivedi@dfpcl.com",
        "source": {
          "label": "Official expressly named crop-nutrition business contact, title, email and corporate address",
          "url": "https://www.mahadhanagritech.com/contact"
        },
        "verifiedAt": "2026-10-12"
      }
    ],
    "departmentEmails": [],
    "sources": [
      {
        "label": "Official Smartek coated NPK granules: organic-carbon and mineral coating",
        "url": "https://mahadhan.co.in/product-portfolio/value-added-npk-fertilizers-online/"
      },
      {
        "label": "Official current MAL legal identity, former Smartchem name and own Taloja NPK manufacture",
        "url": "https://www.mahadhanagritech.com/overview"
      },
      {
        "label": "Official own crop-nutrition manufacturing and finished fertiliser portfolio",
        "url": "https://www.mahadhanagritech.com/crop-nutrition-business"
      },
      {
        "label": "Original MAL FY2024-25 annual report: Smartek manufacture and completed group restructuring",
        "url": "https://www.mahadhanagritech.com/uploads/2026/02/MAL-ANNUAL-REPORT-F-Y-2024-2025.pdf"
      },
      {
        "label": "Original DFPCL FY2025-26 annual report: MAL crop-nutrition entity and complete group core product scope",
        "url": "https://uat.dfpcl.com/uploads/2026/08/DFPCL-AR-2025-26.pdf"
      },
      {
        "label": "Official expressly named crop-nutrition business contact, title, email and corporate address",
        "url": "https://www.mahadhanagritech.com/contact"
      }
    ]
  },
  "vital-agri-nutrients-lahore": {
    "website": "https://www.van.com.pk/",
    "contactPage": "https://www.van.com.pk/about.html",
    "generalEmail": "info@van.com.pk",
    "generalPhone": "+92 42 35762215",
    "address": "Head office: 605 Al-Hafeez Heights, Gulberg III, Lahore 54660, Pakistan. Plant: 49-Km Multan Road, Phool Nagar Bypass, Lahore (as published by VAN; marker is Lahore city, not factory GPS).",
    "contacts": [
      {
        "name": "Fahim Asghar",
        "title": "Lead, Plant and Product",
        "department": "Technical",
        "email": "fahim@van.com.pk",
        "source": {
          "label": "Official Research & development contact: named role and public business email",
          "url": "https://www.van.com.pk/about.html"
        },
        "verifiedAt": "2026-10-12"
      },
      {
        "name": "Muhammad Ali",
        "title": "Chief Commercial Officer",
        "department": "Sales",
        "email": "muhammad.ali@van.com.pk",
        "source": {
          "label": "Official current named commercial contact and public business email",
          "url": "https://www.van.com.pk/about.html"
        },
        "verifiedAt": "2026-10-12"
      }
    ],
    "departmentEmails": [
      {
        "department": "General",
        "email": "info@van.com.pk",
        "source": {
          "label": "Official expressly disclosed general company business inbox",
          "url": "https://www.van.com.pk/about.html"
        }
      }
    ],
    "sources": [
      {
        "label": "Official own commercial sulfur-coating manufacturing line behind Vital Urea",
        "url": "https://www.van.com.pk/partner/manufacturing.html"
      },
      {
        "label": "Official current finished sulfur-coated urea product",
        "url": "https://www.van.com.pk/brands/vital-urea.html"
      },
      {
        "label": "Official complete finished nutrient product and own-brand manufacturing catalogue",
        "url": "https://www.van.com.pk/brands/index.html"
      },
      {
        "label": "Official actual formulation scope; dual-layer variants explicitly still in development",
        "url": "https://www.van.com.pk/partner/engineering.html"
      },
      {
        "label": "Official legal company, locations and expressly disclosed technical/commercial business contacts",
        "url": "https://www.van.com.pk/about.html"
      },
      {
        "label": "Official company profile and business scope",
        "url": "https://www.van.com.pk/company-profile.html"
      }
    ]
  },
  "polyvine-cheddar": {
    "website": "https://polyvine.com/",
    "contactPage": "https://polyvine.com/contact-us/",
    "generalEmail": "info@polyvine.co.uk",
    "generalPhone": "+44 1934 740305",
    "address": "Vine House, Cheddar Business Park, Wedmore Road, Cheddar BS27 3EB, United Kingdom (current official Contact page)",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "info@polyvine.co.uk",
        "source": {
          "label": "Official explicitly disclosed general business mailbox",
          "url": "https://polyvine.com/contact-us/"
        }
      }
    ],
    "sources": [
      {
        "label": "Official 2026 own water-based formulation/manufacturing laboratory and factory in Cheddar",
        "url": "https://polyvine.com/national-manufacturer/"
      },
      {
        "label": "Official current two-pack water-based wood-floor/interior timber varnish",
        "url": "https://polyvine.com/product/2k-poly86/"
      },
      {
        "label": "Official original Exterior Wood Varnish technical document; pages1–5",
        "url": "https://polyvine.com/app/uploads/2025/05/Technical-data-sheet_Exterior-Wood-Varnish.pdf"
      },
      {
        "label": "Official full trade varnish/woodcare/paint/accessory range",
        "url": "https://polyvine.com/polyvine-trade/products/"
      },
      {
        "label": "Official full decorative finish and accessory range",
        "url": "https://polyvine.com/polyvine-decorative-effects/products/"
      },
      {
        "label": "Official family business and actual on-site manufacture",
        "url": "https://polyvine.com/our-story/"
      },
      {
        "label": "Official legal company, current address and public general business inbox",
        "url": "https://polyvine.com/contact-us/"
      }
    ]
  },
  "bedec-dunmow": {
    "website": "https://bedec.co.uk/",
    "contactPage": "https://bedec.co.uk/contact-us/",
    "generalEmail": "info@bedec.co.uk",
    "generalPhone": "+44 1279 876657",
    "address": "Units 1 & 2 Poplars Farm, Aythorpe Roding, Dunmow, Essex CM6 1RY, United Kingdom (official original All Prime product document)",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "info@bedec.co.uk",
        "source": {
          "label": "Official explicitly disclosed general business mailbox",
          "url": "https://bedec.co.uk/contact-us/"
        }
      }
    ],
    "sources": [
      {
        "label": "Official own Essex manufacturing and ongoing research and development",
        "url": "https://bedec.co.uk/product/multi-surface-paint/"
      },
      {
        "label": "Official actual water-based finished varnish for wood",
        "url": "https://bedec.co.uk/product/msv-multi-surface-varnish/"
      },
      {
        "label": "Official original All Prime wood-primer document and legal manufacturer/address; pages1–2",
        "url": "https://bedec.co.uk/wp-content/uploads/2024/08/5.-All-Prime.pdf"
      },
      {
        "label": "Official complete finished paint and accessory range",
        "url": "https://bedec.co.uk/products/"
      },
      {
        "label": "Official company manufacture and water-based business scope",
        "url": "https://bedec.co.uk/about-bedec/"
      },
      {
        "label": "Official general business inbox and telephone",
        "url": "https://bedec.co.uk/contact-us/"
      }
    ]
  },
  "ivm-chemicals-parona": {
    "website": "https://www.ivmgroup.com/en/",
    "contactPage": "https://www.ivmgroup.com/en/requests/new",
    "generalEmail": "ivm@ivmgroup.com",
    "generalPhone": "+39 02 430 221 (group business office)",
    "address": "Manufacturing entity: IVM Chemicals S.r.l., Viale della Stazione3, 27020 Parona(PV), Italy (official original facility document). Public group business office: Via T. Tasso10, 20123 Milan, Italy.",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "ivm@ivmgroup.com",
        "source": {
          "label": "Official expressly disclosed General business inbox",
          "url": "https://www.ivmgroup.com/en/requests/new"
        }
      }
    ],
    "sources": [
      {
        "label": "Official own Parona manufacture and dedicated water-based production",
        "url": "https://www.ivmgroup.com/en/pages/162-production"
      },
      {
        "label": "Official full wood-coating and raw resin/elastomer product scope",
        "url": "https://www.ivmgroup.com/en/pages/134-products"
      },
      {
        "label": "Official group structure, Intercoating input business and brand deduplication",
        "url": "https://www.ivmgroup.com/en/pages/144-the-group-its-history-its-operative-structure"
      },
      {
        "label": "Official current Milesi waterborne wood-coating family",
        "url": "https://www.milesi.com/en/product/solutions-for-wood/green-en/green/"
      },
      {
        "label": "Official original IVM Chemicals legal/manufacturing facility document;PDF pages1–3",
        "url": "https://www.ivmgroup.com/uploads/file/275/84275/ISO_-_EN-_CERTIFICATO__GENERALE_PARONA_DEP__SENAGO_BAREGGIO.pdf"
      },
      {
        "label": "Official legal manufacturer/current facility document entry",
        "url": "https://www.ivmgroup.com/en/certifications/5-iso-9001-2015"
      },
      {
        "label": "Official expressly published group general business contact and address",
        "url": "https://www.ivmgroup.com/en/requests/new"
      },
      {
        "label": "Official brand technical inquiry page",
        "url": "https://www.milesi.com/en/contact_us/"
      }
    ]
  },
  "rustins-london": {
    "website": "https://www.rustins.ltd/",
    "contactPage": "https://www.rustins.ltd/contact",
    "generalEmail": "info@rustins.co.uk",
    "generalPhone": "+44 20 8450 4666",
    "address": "43–51 Waterloo Road, London NW2 7TX, United Kingdom; official company registration number162273",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "info@rustins.co.uk",
        "source": {
          "label": "Official expressly disclosed General business inbox",
          "url": "https://www.rustins.ltd/contact"
        }
      }
    ],
    "sources": [
      {
        "label": "Official own North London manufacturing and formulations",
        "url": "https://www.rustins.ltd/"
      },
      {
        "label": "Official water-based polyurethane finished varnish for wood",
        "url": "https://www.rustins.ltd/rustins/our-products/ceramic-care/quick-dry-polyurethane-varnish"
      },
      {
        "label": "Official water-based wood-floor varnish",
        "url": "https://www.rustins.ltd/rustins/our-products/floor-finishes/quick-dry-floor-varnish"
      },
      {
        "label": "Official complete product categories",
        "url": "https://www.rustins.ltd/rustins/our-products"
      },
      {
        "label": "Official finished contact-adhesive scope",
        "url": "https://www.rustins.ltd/rustins/our-products/thixofix"
      },
      {
        "label": "Official full brand/group scope for deduplication",
        "url": "https://www.rustins.ltd/our-brands"
      },
      {
        "label": "Official legal company and registered address",
        "url": "https://www.rustins.ltd/company-registration-details"
      },
      {
        "label": "Official public general business inbox and phone",
        "url": "https://www.rustins.ltd/contact"
      }
    ]
  },
  "mylands-london": {
    "website": "https://mylands.com/",
    "contactPage": "https://mylands.com/pages/contact",
    "generalEmail": "info@mylands.com",
    "generalPhone": "+44 20 8670 9161",
    "address": "26–34 Rothschild Street, West Norwood, London SE27 0HQ, United Kingdom (current contact address); legal terms state John Myland Ltd at26 Rothschild St.",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "Sales",
        "email": "sales@mylands.com",
        "source": {
          "label": "Official expressly disclosed Sales business inbox",
          "url": "https://mylands.com/pages/contact"
        }
      },
      {
        "department": "General",
        "email": "info@mylands.com",
        "source": {
          "label": "Official legal terms expressly disclosed company mailbox",
          "url": "https://mylands.com/policies/terms-of-service"
        }
      }
    ],
    "sources": [
      {
        "label": "Official own London paint and polish manufacture",
        "url": "https://mylands.com/pages/about-mylands-1"
      },
      {
        "label": "Official water-based multi-surface wood topcoat and wood-floor paint",
        "url": "https://mylands.com/pages/interior-paint-preparation"
      },
      {
        "label": "Official complete finish categories and relevant coating system",
        "url": "https://mylands.com/pages/choose-finish"
      },
      {
        "label": "Official finished colour/finish product scope",
        "url": "https://mylands.com/products/soho-pink"
      },
      {
        "label": "Official current legal company and business inbox",
        "url": "https://mylands.com/policies/terms-of-service"
      },
      {
        "label": "Official current business address, sales inbox and phone",
        "url": "https://mylands.com/pages/contact"
      }
    ]
  },
  "morrells-stockport": {
    "website": "https://www.morrells.co.uk/",
    "contactPage": "https://www.morrells.co.uk/contact-us/",
    "generalEmail": "hello@morrells.co.uk",
    "generalPhone": "+44 161 406 5300",
    "address": "Wellington Works, Mill Lane, Woodley, Stockport SK6 1RN, United Kingdom",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "hello@morrells.co.uk",
        "source": {
          "label": "Official expressly disclosed General business inbox",
          "url": "https://www.morrells.co.uk/contact-us/"
        }
      }
    ],
    "sources": [
      {
        "label": "Official own wood-coating manufacture and bespoke formulation development",
        "url": "https://www.morrells.co.uk/about-us/company-info/"
      },
      {
        "label": "Official waterborne finished wood primer/lacquer/topcoat range",
        "url": "https://www.morrells.co.uk/products/wood-finishes/interior-wood-finishes/waterborne-interior-lacquers/"
      },
      {
        "label": "Official whole finished coating and application-supply scope",
        "url": "https://www.morrells.co.uk/"
      },
      {
        "label": "Official Maxx+ finished coating and explicitly anti-slip additive scope",
        "url": "https://www.morrells.co.uk/products/metal-and-other-finishes/rust-oleum/epoxyshield-maxx-plus-additive/"
      },
      {
        "label": "Official technical service through public business switchboard",
        "url": "https://www.morrells.co.uk/support/technical-support/"
      },
      {
        "label": "Official current RPM relationship, address and public business inbox",
        "url": "https://www.morrells.co.uk/contact-us/"
      },
      {
        "label": "Official legal/business terms",
        "url": "https://www.morrells.co.uk/support/terms-conditions-of-sale/"
      }
    ]
  },
  "fiddes-cardiff": {
    "website": "https://fiddes.co.uk/",
    "contactPage": "https://fiddes.co.uk/contact/",
    "generalEmail": "finishes@fiddes.co.uk",
    "generalPhone": "+44 29 2034 0323",
    "address": "Florence Works, Brindley Road, Cardiff CF11 8TX, United Kingdom",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "Technical",
        "email": "support@fiddes.co.uk",
        "source": {
          "label": "Official expressly disclosed Technical business inbox",
          "url": "https://fiddes.co.uk/contact/"
        }
      },
      {
        "department": "Sales",
        "email": "sales@fiddes.co.uk",
        "source": {
          "label": "Official public sales department inbox",
          "url": "https://fiddes.co.uk/contact/"
        }
      },
      {
        "department": "General",
        "email": "finishes@fiddes.co.uk",
        "source": {
          "label": "Official public business inbox",
          "url": "https://fiddes.co.uk/contact/"
        }
      }
    ],
    "sources": [
      {
        "label": "Official own purpose-built wood-finish manufacturing facility",
        "url": "https://fiddes.co.uk/restores-revives-protects/"
      },
      {
        "label": "Official water-based polyurethane/acrylic finished wood varnish",
        "url": "https://fiddes.co.uk/product/wood-varnish/"
      },
      {
        "label": "Official complete product catalogue",
        "url": "https://fiddes.co.uk/product-catalogue/"
      },
      {
        "label": "Official actual chemical/solvent scope; original web-reader body independently read",
        "url": "https://fiddes.co.uk/product-category/accessories/chemicals-solvents/"
      },
      {
        "label": "Official current legal identity, address and expressly named technical support inbox",
        "url": "https://fiddes.co.uk/contact/"
      }
    ]
  },
  "verinlegno-massa-cozzile": {
    "website": "https://www.verinlegno.it/en/",
    "contactPage": "https://www.verinlegno.it/en/contacts/contact-where-we-are/",
    "generalEmail": "info@verinlegno.it",
    "generalPhone": "+39 0572 92711",
    "address": "Via Luigi Galvani 7, 51010 Massa e Cozzile (Pistoia), Italy; VAT00230480477",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "info@verinlegno.it",
        "source": {
          "label": "Official expressly disclosed General business inbox",
          "url": "https://www.verinlegno.it/en/contacts/contact-where-we-are/"
        }
      }
    ],
    "sources": [
      {
        "label": "Official own formulation/manufacture and water-based production department",
        "url": "https://www.verinlegno.it/en/company/history-philosophy/"
      },
      {
        "label": "Official production scope and own water-based wood-coating manufacture",
        "url": "https://www.verinlegno.it/en/company/production-range/"
      },
      {
        "label": "Official specific water-based exterior wood topcoats",
        "url": "https://www.verinlegno.it/en/products/prodotti_ricerca.asp?cla=C&titolo=Water-based%20for%20exterior&clb=6&titolob=Finiture&titolo2=Topcoat"
      },
      {
        "label": "Official Binder/Converter category actual finished filler/varnish scope",
        "url": "https://www.verinlegno.it/en/products/prodotti_ricerca.asp?cla=C&titolo=Water-based%20for%20exterior&clb=13&titolob=Veicoli/Converter&titolo2=Binders/Converter"
      },
      {
        "label": "Official complete product categories",
        "url": "https://www.verinlegno.it/en/products/"
      },
      {
        "label": "Official current legal identity, address and public company inbox",
        "url": "https://www.verinlegno.it/en/contacts/contact-where-we-are/"
      }
    ]
  },
  "pvcfc-ca-mau": {
    "website": "https://www.pvcfc.com.vn/",
    "contactPage": "https://www.pvcfc.com.vn/lien-he",
    "generalEmail": "contact@pvcfc.com.vn",
    "generalPhone": "+84 290 381 9000",
    "address": "647–649 Ngô Quyền, Phường An Xuyên, Tỉnh Cà Mau, Vietnam (current headquarters); N46.Plus manufacture: Nhà máy Đạm Cà Mau, Khánh An, U Minh, Cà Mau as specified in the original2023 standard.",
    "contacts": [
      {
        "name": "Nguyễn Thanh Tùng",
        "title": "General Director (Tổng Giám đốc), current About page states sinceApril2026",
        "department": "Management",
        "source": {
          "label": "Official current General Director",
          "url": "https://www.pvcfc.com.vn/gioi-thieu"
        },
        "verifiedAt": "2026-10-12"
      }
    ],
    "departmentEmails": [
      {
        "department": "General",
        "email": "contact@pvcfc.com.vn",
        "source": {
          "label": "Official expressly published General business inbox",
          "url": "https://www.pvcfc.com.vn/lien-he"
        }
      },
      {
        "department": "General",
        "email": "info@pvcfc.com.vn",
        "source": {
          "label": "Official corporate headquarters footer business inbox",
          "url": "https://www.pvcfc.com.vn/lien-he"
        }
      }
    ],
    "sources": [
      {
        "label": "Official original N46.Plus2023 manufacturing standard rev09; PDF pages5 and7",
        "url": "https://www.pvcfc.com.vn/Data/Sites/1/media/fileattachment/%5Bsigned%5D05.-tccs-n46.plus-c%C3%A0-mau--rev9.pdf"
      },
      {
        "label": "Official current N46.Plus dual-protection coating product",
        "url": "https://www.pvcfc.com.vn/n46plus-ca-mau"
      },
      {
        "label": "Official complete current fertilizer portfolio; NBPT/DCD-coated N46.Plus",
        "url": "https://www.pvcfc.com.vn/san-pham-dich-vu"
      },
      {
        "label": "Official original coating product launch and invested machinery/line",
        "url": "https://www.pvcfc.com.vn/tang-cuong-giai-phap-tiet-kiem-phan-bon-cho-nha-nong-dam-ca-mau-ra-mat-san-pham-moi-n46plus"
      },
      {
        "label": "Official2026 extraordinary AGM: Petrovietnam member and actual business scope",
        "url": "https://www.pvcfc.com.vn/pvcfc-thong-qua-cac-quyet-sach-quan-trong-tai-dai-hoi-co-dong-bat-thuong-2026"
      },
      {
        "label": "Official current legal name, headquarters and public business contacts",
        "url": "https://www.pvcfc.com.vn/lien-he"
      },
      {
        "label": "Official current company history and General Director fromApril2026",
        "url": "https://www.pvcfc.com.vn/gioi-thieu"
      },
      {
        "label": "Official public supplier/tender entry; no form submitted",
        "url": "https://www.pvcfc.com.vn/moi-thau"
      },
      {
        "label": "Official PVMR2026 AGM: existing PVPAINT/Petrovietnam group relationship",
        "url": "https://www.pvmr.vn/dhdcd-thuong-nien-2026-pvmr-kien-toan-nhan-su-cap-cao-lay-khoa-hoc-cong-nghe-lam-dong-luc-tang-truong/"
      },
      {
        "label": "Existing PVPAINT official2026 AGM: PVMR/HPP shareholders, separate paint account",
        "url": "https://pvpaint.vn/pv-paint-to-chuc-dai-hoi-dong-co-dong-thuong-nien-nam-2026/"
      }
    ]
  },
  "incitec-pivot-fertilisers-melbourne": {
    "website": "https://www.incitecpivotfertilisers.com.au/",
    "contactPage": "https://www.incitecpivotfertilisers.com.au/about-us/supplying-incitec-pivot/",
    "generalPhone": "1800 009 832 (Australia freecall)",
    "address": "Registered main business location: VIC 3000, Australia (ABN 37 007 656 046; street address not independently verified). Own coating operations reported at Scottsdale, Circular Head, Longford and Devonport, Tasmania.",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "Procurement",
        "email": "procurement@incitecpivot.com.au",
        "source": {
          "label": "Official expressly published Procurement business inbox",
          "url": "https://www.incitecpivotfertilisers.com.au/about-us/supplying-incitec-pivot/"
        }
      }
    ],
    "sources": [
      {
        "label": "Official own Tasmanian liquid coating systems applying Green Urea NV before dispatch",
        "url": "https://www.incitecpivot.com.au/news/latest-news/ipf-backs-tasmanian-producers-with-%2411m-investment/"
      },
      {
        "label": "Official Green Urea NV own NBPT coating formulation and Australian manufacture",
        "url": "https://www.incitecpivotfertilisers.com.au/resources/agronomic-insights/green-urea-nv-made-for-australian-soil/"
      },
      {
        "label": "Official current government operating entity, registered business name and VIC3000",
        "url": "https://abr.business.gov.au/ABN/View/37007656046"
      },
      {
        "label": "Official current supplier legal/ownership document v3, PDF pages3–4",
        "url": "https://www.incitecpivotfertilisers.com.au/wp-content/uploads/sites/3/2026/06/ippl_-_commercial-credit-information.pdf"
      },
      {
        "label": "Official current Ridley ownership, 14July2026 stakeholder update",
        "url": "https://www.incitecpivotfertilisers.com.au/news/incitec-pivot-fertilisers-stakeholder-update-14-july-2026/"
      },
      {
        "label": "Official public procurement business inbox; encoded display cross-checked",
        "url": "https://www.incitecpivotfertilisers.com.au/about-us/supplying-incitec-pivot/"
      },
      {
        "label": "Official complete fertilizer portfolio",
        "url": "https://www.incitecpivotfertilisers.com.au/products/"
      },
      {
        "label": "Official blend/coating finished fertilizer scope",
        "url": "https://www.incitecpivotfertilisers.com.au/products/enhanced/blends-coating/"
      },
      {
        "label": "Official trace-element coated fertilizer product scope",
        "url": "https://www.incitecpivotfertilisers.com.au/products/enhanced/blends-coating/trace-element-coatings/"
      },
      {
        "label": "Official nitrogen-retention fertilizer range",
        "url": "https://www.incitecpivotfertilisers.com.au/products/smart/nitrogen-retention/"
      },
      {
        "label": "Official eNpower finished fertilizer application and own coating technology",
        "url": "https://www.incitecpivotfertilisers.com.au/products/smart/nitrogen-retention/enpower/"
      }
    ]
  },
  "troforte-innovations-wangara": {
    "website": "https://www.trofortefarming.com.au/",
    "contactPage": "https://www.trofortefarming.com.au/contact",
    "generalEmail": "info@langleyfertilizers.com.au",
    "generalPhone": "+61 8 9302 1633",
    "address": "36 Paramount Drive, Wangara, Perth, Western Australia 6065, Australia; Troforte Innovations Pty Ltd ABN 76 111 308 206",
    "contacts": [
      {
        "name": "Paul Storer",
        "title": "Consultant Microbiologist; official technical support contact",
        "department": "Technical",
        "phone": "+61 456 716 061",
        "source": {
          "label": "Official current technical support contact",
          "url": "https://www.trofortefarming.com.au/contact"
        },
        "verifiedAt": "2026-10-12"
      },
      {
        "name": "Rob Harper",
        "title": "Senior Field Advisor; official technical support contact",
        "department": "Technical",
        "phone": "+61 427 772 990",
        "source": {
          "label": "Official current technical support contact",
          "url": "https://www.trofortefarming.com.au/contact"
        },
        "verifiedAt": "2026-10-12"
      }
    ],
    "departmentEmails": [
      {
        "department": "General",
        "email": "info@langleyfertilizers.com.au",
        "source": {
          "label": "Official expressly published General business inbox",
          "url": "https://www.trofortefarming.com.au/contact"
        }
      }
    ],
    "sources": [
      {
        "label": "Official current government ABN and legal entity",
        "url": "https://abr.business.gov.au/ABN/View?id=76111308206"
      },
      {
        "label": "Official own Wangara R&D/manufacturing facility and Macracote polymer-coated CRF",
        "url": "https://www.sunpalmaustralia.com.au/about-us/"
      },
      {
        "label": "Official original Macracote brochure; PDF page 2 visually verified polymer-coated NPK manufacture",
        "url": "https://www.sunpalmaustralia.com.au/uploaded/files/client_added/Brochures/Macracote%20Fertiliser%20Brochure%20Web.pdf"
      },
      {
        "label": "Official current manufacturer, public business inbox and named technical support",
        "url": "https://www.trofortefarming.com.au/contact"
      },
      {
        "label": "Official Langley/Sunpalm account relationship and controlled-release fertilizer manufacture",
        "url": "https://troforte.com.au/fertilizer/about"
      },
      {
        "label": "Official original Nitroforte brochure; PDF page 3 Troforte Innovations/Langley/Sunpalm relationship",
        "url": "https://troforte.com.au/content/pdf/Nitroforte-Liquid-Fertiliser-Brochure.pdf"
      },
      {
        "label": "Official full commercial fertilizer products",
        "url": "https://www.sunpalmaustralia.com.au/langley-fertilizers/fertilizer-products/"
      },
      {
        "label": "Official Premium Plastics finished horticultural product scope",
        "url": "https://www.sunpalmaustralia.com.au/premium-plastics/plastic-products/"
      }
    ]
  },
  "dura-paints-edenvale": {
    "website": "https://durapaints.co.za/",
    "contactPage": "https://durapaints.co.za/contact/",
    "generalEmail": "orders@durapaints.co.za",
    "generalPhone": "+27 11 452 5221",
    "address": "Head office: 5 Wakefield Road, Founders View South, Edenvale, Gauteng, South Africa; postal: PO Box 303, Edenvale 1610",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "Sales",
        "email": "orders@durapaints.co.za",
        "source": {
          "label": "Official explicitly disclosed public business inbox",
          "url": "https://durapaints.co.za/contact/"
        }
      }
    ],
    "sources": [
      {
        "label": "Official own industrial coating manufacture and technical laboratory",
        "url": "https://durapaints.co.za/about/about-dura-paints/"
      },
      {
        "label": "Official manufacturing facilities and laboratory",
        "url": "https://durapaints.co.za/about/facilities/"
      },
      {
        "label": "Official industrial protective primers including heavy-duty epoxy",
        "url": "https://durapaints.co.za/product-finder-2/industrial-coatings/industrial-primers/"
      },
      {
        "label": "Official twin-pack industrial epoxy protective topcoats",
        "url": "https://durapaints.co.za/product-finder-2/industrial-coatings/industrial-top-coats/"
      },
      {
        "label": "Official actual coating thinner/solvent scope",
        "url": "https://durapaints.co.za/product-finder-2/industrial-coatings/solvents/"
      },
      {
        "label": "Official ProLong finished preparation product scope",
        "url": "https://durapaints.co.za/brands/prolong/"
      },
      {
        "label": "Official decorative finished coatings",
        "url": "https://durapaints.co.za/product-finder-2/domestic-decorative-coatings/"
      },
      {
        "label": "Official field-marking finished products",
        "url": "https://durapaints.co.za/product-finder-2/field-marking/"
      },
      {
        "label": "Official headquarters, telephone and Orders inbox",
        "url": "https://durapaints.co.za/contact/"
      }
    ]
  },
  "teknos-helsinki": {
    "website": "https://www.teknos.com/",
    "contactPage": "https://www.teknos.com/company/about-us/innovation/",
    "generalEmail": "sales@teknos.fi",
    "generalPhone": "+358 9 506 091",
    "address": "Teknos Oy headquarters / Helsinki factory: Takkatie 3, PO Box 107, FI-00371 Helsinki, Finland; Finnish registry ID 2203752-5",
    "contacts": [
      {
        "name": "Pasi Virtanen",
        "title": "Group R&D Manager, Innovations",
        "department": "Technical",
        "email": "pasi.virtanen@teknos.com",
        "source": {
          "label": "Official innovation page: disclosed R&D manager and business mailbox",
          "url": "https://www.teknos.com/company/about-us/innovation/"
        },
        "verifiedAt": "2026-10-12"
      }
    ],
    "departmentEmails": [
      {
        "department": "Sales",
        "email": "sales@teknos.fi",
        "source": {
          "label": "Official explicitly disclosed public business inbox",
          "url": "https://www.teknos.com/industrial-coatings/teknos-companies-and-international-contacts/"
        }
      }
    ],
    "sources": [
      {
        "label": "Official current Finnish legal company IDs, Helsinki and Rajamäki factories",
        "url": "https://www.teknos.com/industrial-coatings/teknos-companies-and-international-contacts/"
      },
      {
        "label": "Official company manufacture/coating business and independent Finnish family group",
        "url": "https://www.teknos.com/company/about-us/"
      },
      {
        "label": "Official own innovation/R&D and named R&D manager",
        "url": "https://www.teknos.com/company/about-us/innovation/"
      },
      {
        "label": "Official complete industrial finished coating applications",
        "url": "https://www.teknos.com/industrial-coatings/"
      },
      {
        "label": "Official INERTA 165 GF finished anticorrosive epoxy coating",
        "url": "https://www.teknos.com/products/inerta-165-gf/"
      },
      {
        "label": "Official INERTA 300 chemical-resistant epoxy tank/industrial coating",
        "url": "https://www.teknos.com/products/inerta-300/"
      }
    ]
  },
  "remmers-loeningen": {
    "website": "https://www.remmers.com/de",
    "contactPage": "https://www.remmers.com/",
    "generalEmail": "info@remmers.de",
    "generalPhone": "+49 5432 830",
    "address": "Bernhard-Remmers-Straße 13, 49624 Löningen, Germany; group R&D also operates at Hiddenhausen",
    "contacts": [
      {
        "name": "Uwe Börger",
        "title": "Sales Lead, Interior Coatings (Vertriebsleitung Innenlacke)",
        "department": "Sales",
        "email": "uboerger@remmers.de",
        "phone": "+49 5221 3809 221",
        "source": {
          "label": "Official current website: named interior-coatings sales lead and business email",
          "url": "https://www.remmers.com/"
        },
        "verifiedAt": "2026-10-12"
      }
    ],
    "departmentEmails": [
      {
        "department": "General",
        "email": "info@remmers.de",
        "source": {
          "label": "Official general company business inbox",
          "url": "https://www.remmers.com/de/impressum/"
        }
      }
    ],
    "sources": [
      {
        "label": "Official own R&D at Löningen/Hiddenhausen including water-based formulation systems",
        "url": "https://www.remmers.com/de/forschung-entwicklung"
      },
      {
        "label": "Official water-based Induline wood intermediate/topcoat technical information",
        "url": "https://en.remmers.com/en_IN/wood-colours-varnishes/coating-systems-for-wooden-windows-doors/topcoats/induline-dw-601-aqua-stopp/p/000000000000172503"
      },
      {
        "label": "Official current wood coating product categories",
        "url": "https://www.remmers.com/de/products-a-z/wood"
      },
      {
        "label": "Official company/group facts",
        "url": "https://www.remmers.com/de/zahlen-fakten"
      },
      {
        "label": "Official supplier-facing scope checked separately",
        "url": "https://www.remmers.com/de/lieferanten"
      },
      {
        "label": "Official legal company and headquarters",
        "url": "https://www.remmers.com/de/impressum"
      },
      {
        "label": "Official named interior-coatings contact and explicit business email",
        "url": "https://www.remmers.com/"
      }
    ]
  },
  "mipa-essenbach": {
    "website": "https://www.mipa-paints.com/en/",
    "contactPage": "https://www.mipa-paints.com/en/contact/",
    "generalEmail": "mipa@mipa-paints.com",
    "generalPhone": "+49 8703 9220",
    "address": "Am Oberen Moos 1, D-84051 Essenbach, Germany (registered headquarters; contact page also lists Landshut site)",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "Procurement",
        "email": "purchasing@mipa-paints.com",
        "source": {
          "label": "Official explicitly disclosed public business inbox",
          "url": "https://www.mipa-paints.com/en/contact/"
        }
      },
      {
        "department": "General",
        "email": "mipa@mipa-paints.com",
        "source": {
          "label": "Official general company business inbox",
          "url": "https://www.mipa-paints.com/en/contact/"
        }
      }
    ],
    "sources": [
      {
        "label": "Official own development and manufacture at European production sites",
        "url": "https://www.mipa-paints.com/en/"
      },
      {
        "label": "Official water-based wood priming and finishing paint",
        "url": "https://www.mipa-paints.com/en/products/technical-safety-data-sheets/decorative/product/prodinfo/produkt3190.html"
      },
      {
        "label": "Official complete finished product categories",
        "url": "https://www.mipa-paints.com/en/products/"
      },
      {
        "label": "Official Rosner wood coating range within Mipa",
        "url": "https://www.mipa-paints.com/en/products/wood-coatings/"
      },
      {
        "label": "Official group companies and sites for deduplication",
        "url": "https://www.mipa-paints.com/en/company/mipa-group/"
      },
      {
        "label": "Official public Purchase (Supplier) inbox; explicit encoded mailto verified",
        "url": "https://www.mipa-paints.com/en/contact/"
      },
      {
        "label": "Official registered legal entity and headquarters",
        "url": "https://www.mipa-paints.com/en/legal-notice/"
      }
    ]
  },
  "berger-seidle-gruenstadt": {
    "website": "https://berger-seidle.de/",
    "contactPage": "https://berger-seidle.de/aquachoice-sport-b-mach-one/?lang=en",
    "generalEmail": "info@berger-seidle.de",
    "generalPhone": "+49 6359 8005 0",
    "address": "Maybachstraße 2, 67269 Grünstadt an der Weinstraße, Germany",
    "contacts": [
      {
        "name": "Markus M. Adam",
        "title": "Managing Director (Geschäftsführer)",
        "department": "Management",
        "source": {
          "label": "Official legal notice: disclosed managing director",
          "url": "https://berger-seidle.de/impressum/"
        },
        "verifiedAt": "2026-10-12"
      }
    ],
    "departmentEmails": [
      {
        "department": "Technical",
        "email": "beratungsteam@berger-seidle.de",
        "source": {
          "label": "Official explicitly disclosed public business inbox",
          "url": "https://berger-seidle.de/aquachoice-sport-b-mach-one/?lang=en"
        }
      },
      {
        "department": "General",
        "email": "info@berger-seidle.de",
        "source": {
          "label": "Official general company business inbox",
          "url": "https://berger-seidle.de/aquachoice-sport-b-mach-one/?lang=en"
        }
      }
    ],
    "sources": [
      {
        "label": "Official own production facilities and batch formulation/quality control",
        "url": "https://berger-seidle.de/produktion-qualitaet-durch-technologie/"
      },
      {
        "label": "Official own R&D",
        "url": "https://berger-seidle.de/entwicklung-innovationen-auf-top-niveau/"
      },
      {
        "label": "Official two-component water-based wood-floor finish and technical service inbox",
        "url": "https://berger-seidle.de/aquachoice-sport-b-mach-one/?lang=en"
      },
      {
        "label": "Official complete finished product categories",
        "url": "https://berger-seidle.de/produkte/"
      },
      {
        "label": "Official group brands and own manufacturer identity",
        "url": "https://berger-seidle.de/"
      },
      {
        "label": "Official legal entity and managing director",
        "url": "https://berger-seidle.de/impressum/"
      }
    ]
  },
  "ballance-tauranga": {
    "website": "https://ballance.co.nz/",
    "contactPage": "https://ballance.co.nz/Our-People/?key=Specialisation&value=Leadership%20Team",
    "generalPhone": "+64 7 572 7900",
    "address": "National Support Office: 161 Hewletts Road, Mount Maunganui, Tauranga, New Zealand; postal: Private Bag 12-503, Tauranga",
    "contacts": [
      {
        "name": "David Healy",
        "title": "General Manager Operations, Sourcing & Supply",
        "department": "Procurement",
        "email": "david.healy@ballance.co.nz",
        "phone": "0800 222 090",
        "source": {
          "label": "Official current leadership: Operations, Sourcing & Supply and publicly listed business email",
          "url": "https://ballance.co.nz/Our-People/?key=Specialisation&value=Leadership%20Team"
        },
        "verifiedAt": "2026-10-12"
      }
    ],
    "departmentEmails": [],
    "sources": [
      {
        "label": "Original official 2023 Annual Review, PDF page 13: own New Zealand-manufactured SustaiN",
        "url": "https://ballance.co.nz/medias/BAL14055-Annual-Review-2023-website-FA.pdf?attachment=true&context=bWFzdGVyfHJvb3R8ODg5MzAyM3xhcHBsaWNhdGlvbi9wZGZ8YURRd0wyZzFNeTg1TmpBd05EUTVPVE0zTkRNNEwwSkJUREUwTURVMVgwRnViblZoYkY5U1pYWnBaWGRmTWpBeU0xOTNaV0p6YVhSbFgwWkJMbkJrWmd8NWViZGJkM2MzZGIzMzAzNDE1Y2I5ZmEwNzE2ZWZhOThkYzBmMjdiYTBmYmVhMzU1MmM2NmM1OTZkZjY0NzlhMg"
      },
      {
        "label": "Official current SustaiN inhibitor-coated finished fertilizer",
        "url": "https://ballance.co.nz/sustain"
      },
      {
        "label": "Official SustaiN registration and inhibitor identity",
        "url": "https://ballance.co.nz/news/sustain-lands-nz-registration"
      },
      {
        "label": "Official current manufacturing and Mount Maunganui production closure",
        "url": "https://ballance.co.nz/Our-Business-and-History/Manufacturing"
      },
      {
        "label": "Official actual industrial supply scope checked separately",
        "url": "https://ballance.co.nz/our-business-and-history/industrials"
      },
      {
        "label": "Official current agricultural product categories",
        "url": "https://ballance.co.nz/Fertiliser-Products/c/All-Product-Ranges"
      },
      {
        "label": "Official current co-operative business scope",
        "url": "https://ballance.co.nz/our-business-and-history"
      },
      {
        "label": "Official current sourcing executive and explicit public business email",
        "url": "https://ballance.co.nz/Our-People/?key=Specialisation&value=Leadership%20Team"
      },
      {
        "label": "Official support-office and manufacturing-site contact addresses",
        "url": "https://ballance.co.nz/contact-us"
      }
    ]
  },
  "hesse-lignal-hamm": {
    "website": "https://www.hesse-lignal.com/",
    "contactPage": "https://www.hesse-lignal.com/impressum/",
    "generalEmail": "info@hesse-lignal.de",
    "generalPhone": "+49 2381 963 00",
    "address": "Warendorfer Straße 21, D-59075 Hamm, Germany",
    "contacts": [
      {
        "name": "Waldemar Harnos",
        "title": "Technical Hotline / Support (Technische Hotline)",
        "department": "Technical",
        "phone": "+49 2381 963 846",
        "source": {
          "label": "Official Hydro lacquer product page: named technical hotline contact",
          "url": "https://www.hesse-lignal.com/produkte/hydro-lacke/"
        },
        "verifiedAt": "2026-10-12"
      }
    ],
    "departmentEmails": [
      {
        "department": "General",
        "email": "info@hesse-lignal.de",
        "source": {
          "label": "Official public business inbox",
          "url": "https://www.hesse-lignal.com/impressum/"
        }
      }
    ],
    "sources": [
      {
        "label": "Official own water-based wood-coating manufacture and formulation",
        "url": "https://www.hesse-lignal.com/"
      },
      {
        "label": "Official manufacturer and family group identity",
        "url": "https://www.hesse-lignal.com/unternehmen/ueber-hesse-lignal/"
      },
      {
        "label": "Official one- and two-component water-based wood coating systems and technical contact",
        "url": "https://www.hesse-lignal.com/produkte/hydro-lacke/"
      },
      {
        "label": "Official finished coating product categories and substrate filters",
        "url": "https://www.hesse-lignal.com/produkte/produktsuche/"
      },
      {
        "label": "Official named business contacts",
        "url": "https://www.hesse-lignal.com/unternehmen/ansprechpartner/"
      },
      {
        "label": "Official legal entity, managing partners, registered address and business inbox",
        "url": "https://www.hesse-lignal.com/impressum/"
      }
    ]
  },
  "medal-paints-johannesburg": {
    "website": "https://medalpaints.co.za/",
    "contactPage": "https://medalpaints.co.za/contact-us/",
    "generalEmail": "info@medal.co.za",
    "generalPhone": "+27 86 006 3325",
    "address": "Corner of Main Reef Road and Kelvin Street, Industria, Johannesburg, South Africa",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "info@medal.co.za",
        "source": {
          "label": "Official public business inbox",
          "url": "https://medalpaints.co.za/contact-us/"
        }
      }
    ],
    "sources": [
      {
        "label": "Official own laboratory, R&D, formulation controls and manufacturing",
        "url": "https://medalpaints.co.za/about-medal-paints/"
      },
      {
        "label": "Official industrial protective finished coating range",
        "url": "https://medalpaints.co.za/medal-industrial-paint/"
      },
      {
        "label": "Official dual-pack epoxy floor and steel protective paint",
        "url": "https://medalpaints.co.za/epoxy-floor-paint/"
      },
      {
        "label": "Official Steel Cladd anticorrosive primers and coatings",
        "url": "https://medalpaints.co.za/steel-cladd/"
      },
      {
        "label": "Official complete finished product category scope",
        "url": "https://medalpaints.co.za/products/"
      },
      {
        "label": "Official Panache finished coating scope",
        "url": "https://medalpaints.co.za/panache-range/"
      },
      {
        "label": "Official primers and undercoats scope",
        "url": "https://medalpaints.co.za/medal-primers-undercoats/"
      },
      {
        "label": "Official waterproofing finished product scope",
        "url": "https://medalpaints.co.za/medal-waterproofing/"
      },
      {
        "label": "Official public business contact, telephone and company address",
        "url": "https://medalpaints.co.za/contact-us/"
      }
    ]
  },
  "kupsa-oyon": {
    "website": "https://www.kupsa.es/en/",
    "contactPage": "https://www.kupsa.es/en/legal-notice",
    "generalEmail": "webkupsa@kupsa.es",
    "generalPhone": "+34 945 622 222",
    "address": "Manufacturing plant: Ctra. N-111 Logroño-Pamplona Km. 2.3, 01320 Oyón (Álava), Spain; postal contact: PO Box 1081, 26080 Logroño (La Rioja), Spain",
    "contacts": [
      {
        "name": "Adam Budziński",
        "title": "CEO, Kupsa Polska (Polish subsidiary)",
        "department": "Management",
        "source": {
          "label": "Official Polish subsidiary About: named CEO and own water-based formulation/manufacture",
          "url": "https://kupsa.pl/en/about-us"
        },
        "verifiedAt": "2026-10-11"
      }
    ],
    "departmentEmails": [
      {
        "department": "General",
        "email": "webkupsa@kupsa.es",
        "source": {
          "label": "Official publicly disclosed general business inbox",
          "url": "https://www.kupsa.es/en/legal-notice"
        }
      }
    ],
    "sources": [
      {
        "label": "Official own Polish subsidiary water-based formulation and manufacturing plant",
        "url": "https://kupsa.pl/en/about-us"
      },
      {
        "label": "Official Spanish wood water-based finished coating portfolio",
        "url": "https://www.kupsa.es/en/products/water-based"
      },
      {
        "label": "Official R&D, laboratories and own manufacturing",
        "url": "https://www.kupsa.es/en/technology/r-d"
      },
      {
        "label": "Official Spanish legal company identity and public business inbox",
        "url": "https://www.kupsa.es/en/legal-notice"
      },
      {
        "label": "Official group resin/intermediate-production history, subsidiaries and acquisitions",
        "url": "https://www.kupsa.es/en/company/history"
      },
      {
        "label": "Official current Polish finished coating catalogue, page 1",
        "url": "https://kupsa.pl/en/products"
      },
      {
        "label": "Official current Polish finished coating catalogue, page 2",
        "url": "https://kupsa.pl/en/products?start=12"
      },
      {
        "label": "Official current Polish finished coating catalogue, page 3",
        "url": "https://kupsa.pl/en/products?start=24"
      },
      {
        "label": "Official current Polish finished coating catalogue, page 4",
        "url": "https://kupsa.pl/en/products?start=36"
      },
      {
        "label": "Official current Polish finished coating catalogue, page 5",
        "url": "https://kupsa.pl/en/products?start=48"
      },
      {
        "label": "Official current Polish finished coating catalogue, page 6",
        "url": "https://kupsa.pl/en/products?start=60"
      },
      {
        "label": "Official current Polish finished coating catalogue, page 7",
        "url": "https://kupsa.pl/en/products?start=72"
      },
      {
        "label": "Official Polish subsidiary contact and factory/Spanish business contact",
        "url": "https://kupsa.pl/en/contact"
      }
    ]
  },
  "kofarb-czestochowa": {
    "website": "https://www.kofarb.pl/en/",
    "contactPage": "https://www.kofarb.pl/en/contact/",
    "generalEmail": "biuro@kofarb.pl",
    "generalPhone": "+48 605 342 957",
    "address": "ul. Jagiellońska 85/87, 42-200 Częstochowa, Poland",
    "contacts": [
      {
        "name": "Robert Koza",
        "title": "CEO",
        "department": "Management",
        "source": {
          "label": "Official About: Robert Koza, CEO",
          "url": "https://www.kofarb.pl/en/about-us/"
        },
        "verifiedAt": "2026-10-11"
      }
    ],
    "departmentEmails": [
      {
        "department": "General",
        "email": "biuro@kofarb.pl",
        "source": {
          "label": "Official publicly disclosed general business inbox",
          "url": "https://www.kofarb.pl/en/contact/"
        }
      }
    ],
    "sources": [
      {
        "label": "Official own waterborne-paint manufacturing, machinery, laboratories and CEO",
        "url": "https://www.kofarb.pl/en/about-us/"
      },
      {
        "label": "Official KOFATERM water-based paints/pastes and wood substrate",
        "url": "https://www.kofarb.pl/en/"
      },
      {
        "label": "Official complete six-category finished coating range",
        "url": "https://www.kofarb.pl/en/products/"
      },
      {
        "label": "Official outdoor finished paint specifically for wooden surfaces",
        "url": "https://www.kofarb.pl/en/products/outdoor-paint/"
      },
      {
        "label": "Official indoor paint scope",
        "url": "https://www.kofarb.pl/en/products/indoor-paint/"
      },
      {
        "label": "Official roof paint scope",
        "url": "https://www.kofarb.pl/en/products/roof-paint/"
      },
      {
        "label": "Official indoor paste scope",
        "url": "https://www.kofarb.pl/en/products/indoor-paste/"
      },
      {
        "label": "Official outdoor paste scope",
        "url": "https://www.kofarb.pl/en/products/outdoor-paste/"
      },
      {
        "label": "Official roof paste scope",
        "url": "https://www.kofarb.pl/en/products/roof-paste/"
      },
      {
        "label": "Official legal company, business inbox and telephone",
        "url": "https://www.kofarb.pl/en/contact/"
      }
    ]
  },
  "soilmate-bangkok": {
    "website": "https://www.soilmate.co.th/",
    "contactPage": "https://www.mitrphol.com/page_detail.php?p=6&topic=34",
    "generalEmail": "soilmate@mitrphol.com",
    "generalPhone": "+66 44 810 620",
    "address": "Head office: 2 Ploenchit Center, 3rd Floor, Soi Sukhumvit 2, Sukhumvit Road, Khlong Toei, Bangkok 10110, Thailand (current Soilmate product-page footer; parent page retains an older 2nd-floor address)",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "soilmate@mitrphol.com",
        "source": {
          "label": "Official public business inbox",
          "url": "https://www.mitrphol.com/page_detail.php?p=6&topic=34"
        }
      }
    ],
    "sources": [
      {
        "label": "Original Kasetsart University research, 2024, PDF page 3: Soilmate CRF manufacturer",
        "url": "https://so06.tci-thaijo.org/index.php/JSSP/article/download/268226/181520/1087443"
      },
      {
        "label": "Official current Soilmate 27-9-14 controlled-release product",
        "url": "https://www.soilmate.co.th/fertilizer/27-9-14/detail"
      },
      {
        "label": "Official current Soilmate 24-9-14 controlled-release product",
        "url": "https://www.soilmate.co.th/fertilizer/24-9-14/detail"
      },
      {
        "label": "Official parent fertilizer manufacturing, legal company identity and disclosed business inbox",
        "url": "https://www.mitrphol.com/page_detail.php?p=6&topic=34"
      },
      {
        "label": "Official parent Bio-Materials scope checked separately",
        "url": "https://www.mitrphol.com/page_detail.php?p=6&topic=156"
      },
      {
        "label": "Official Planex: food-packaging compostable compounds, not inferred fertilizer coating resin",
        "url": "https://www.mitrphol.com/page_detail.php?p=6&topic=158"
      },
      {
        "label": "Official CaneX finished-food-packaging scope",
        "url": "https://www.mitrphol.com/page_detail.php?p=6&topic=157"
      }
    ]
  },
  "pv-paint-ho-chi-minh": {
    "website": "https://pvpaint.vn/",
    "contactPage": "https://pvpaint.vn/pv-paint-to-chuc-dai-hoi-dong-co-dong-thuong-nien-nam-2026/",
    "generalEmail": "pvpaint@pvpaint.vn",
    "generalPhone": "+84 28 3636 4751",
    "address": "Office: 34 Than Van Nhiep, Quarter 22, Binh Trung Ward, Ho Chi Minh City; factory: 11 Road 2, Song Than 3 Industrial Park, Binh Duong Ward, Ho Chi Minh City, Vietnam (current official administrative names)",
    "contacts": [
      {
        "name": "Vũ Duy Cường",
        "title": "General Director (Tổng Giám đốc)",
        "department": "Management",
        "source": {
          "label": "Official 2026 annual general meeting, event 8 May 2026",
          "url": "https://pvpaint.vn/pv-paint-to-chuc-dai-hoi-dong-co-dong-thuong-nien-nam-2026/"
        },
        "verifiedAt": "2026-10-11"
      }
    ],
    "departmentEmails": [
      {
        "department": "General",
        "email": "pvpaint@pvpaint.vn",
        "source": {
          "label": "Official public business inbox",
          "url": "https://pvpaint.vn/pv-paint-to-chuc-dai-hoi-dong-co-dong-thuong-nien-nam-2026/"
        }
      }
    ],
    "sources": [
      {
        "label": "Official own marine/industrial manufacturing and current factory, 2026 AGM",
        "url": "https://pvpaint.vn/pv-paint-to-chuc-dai-hoi-dong-co-dong-thuong-nien-nam-2026/"
      },
      {
        "label": "Official EPOSHIN finished epoxy protective coating catalogue",
        "url": "https://pvpaint.vn/danh-muc-san-pham/epoxy-paints/"
      },
      {
        "label": "Official current products, brands, factory and business contacts",
        "url": "https://pvpaint.vn/"
      },
      {
        "label": "Official current HPP member classification: PV PAINT is an associate",
        "url": "https://sonhaiphong.com.vn/don-vi-thanh-vien/"
      },
      {
        "label": "Official 2023 HPP annual report, pages 22–23: historical 31.21% PV PAINT holding",
        "url": "https://sonhaiphong.com.vn/wp-content/uploads/2024/04/BCTN_2023_HPP.pdf"
      }
    ]
  },
  "specialized-coating-systems-boksburg": {
    "website": "https://www.speccoats.co.za/",
    "contactPage": "https://www.speccoats.co.za/contact.php",
    "generalEmail": "enquiries@speccoats.co.za",
    "generalPhone": "+27 11 552 0300",
    "address": "2 Jones Road, Bartlett AH, Boksburg, Gauteng, South Africa",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "Sales",
        "email": "enquiries@speccoats.co.za",
        "source": {
          "label": "Official public business inbox",
          "url": "https://www.speccoats.co.za/contact.php"
        }
      }
    ],
    "sources": [
      {
        "label": "Official own formulation, manufacturing facility and laboratory",
        "url": "https://www.speccoats.co.za/about-us.php"
      },
      {
        "label": "Official locally formulated/manufactured industrial protective coatings",
        "url": "https://www.speccoats.co.za/paint-industrial-application.php"
      },
      {
        "label": "Official full product category scope",
        "url": "https://www.speccoats.co.za/paint-manufacturer.php"
      },
      {
        "label": "Official specialty-mineral scope checked separately from epoxidized-oil additives",
        "url": "https://www.speccoats.co.za/specialty-minerals.php"
      },
      {
        "label": "Official manufacturing-site address, GPS and Orders/Enquiries/Sales inbox",
        "url": "https://www.speccoats.co.za/contact.php"
      }
    ]
  },
  "protectometal-ciudad-mexico": {
    "website": "https://protectometal.mx/",
    "contactPage": "https://protectometal.mx/contacto/",
    "generalEmail": "contacto@protectometal.mx",
    "generalPhone": "+52 55 5368 0347",
    "address": "Planta CDMX, Ciudad de México, Mexico (official plant contact; street address not published on the reviewed contact page)",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "contacto@protectometal.mx",
        "source": {
          "label": "Official public business inbox",
          "url": "https://protectometal.mx/contacto/"
        }
      }
    ],
    "sources": [
      {
        "label": "Official own custom anticorrosive coating formulation and manufacturing, 60–600 L batches",
        "url": "https://protectometal.mx/"
      },
      {
        "label": "Official legal identity and own PROTEC brand history",
        "url": "https://protectometal.mx/acerca-de-protectometal/"
      },
      {
        "label": "Official current manufactured product scope, including epoxy finished coatings",
        "url": "https://productos.protectometal.mx/"
      },
      {
        "label": "Official catalogue category scope, not a complete individual-item list",
        "url": "https://productos.protectometal.mx/catalogo-productos-protectometal/"
      },
      {
        "label": "Official Planta CDMX public business contact",
        "url": "https://protectometal.mx/contacto/"
      }
    ]
  },
  "pinturas-jemah-nuevo-leon": {
    "website": "https://pinturasjemah.com/",
    "contactPage": "https://pinturasjemah.com/contacto.html",
    "generalEmail": "ventas@pinturasjemah.com",
    "generalPhone": "+52 81 8355 7600",
    "address": "Northern Nuevo León, Mexico (official company page; precise street address not independently verified)",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "Sales",
        "email": "ventas@pinturasjemah.com",
        "source": {
          "label": "Official public business inbox",
          "url": "https://pinturasjemah.com/contacto.html"
        }
      }
    ],
    "sources": [
      {
        "label": "Official own anticorrosive and water-based coating manufacture and disclosed location",
        "url": "https://pinturasjemah.com/nosotros.html"
      },
      {
        "label": "Official anticorrosive product manufacturing",
        "url": "https://pinturasjemah.com/pemex.html"
      },
      {
        "label": "Official epoxy primer/topcoat and protective coating product table",
        "url": "https://pinturasjemah.com/pemex-1990.html"
      },
      {
        "label": "Official CFE finished-coating manufacturing scope",
        "url": "https://pinturasjemah.com/cfe.html"
      },
      {
        "label": "Official complete other finished-coating catalogue",
        "url": "https://pinturasjemah.com/otros-productos.html"
      },
      {
        "label": "Official quotation/sales inbox and telephone",
        "url": "https://pinturasjemah.com/contacto.html"
      }
    ]
  },
  "nervion-tlalnepantla": {
    "website": "https://www.nervion.com.mx/",
    "contactPage": "https://www.nervion.com.mx/contacto",
    "generalEmail": "informacion@nervion.com.mx",
    "generalPhone": "+52 55 2169 0470",
    "address": "Aldama 5, Col. La Escuela, Tlalnepantla, C.P. 54090, Estado de México, Mexico",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "informacion@nervion.com.mx",
        "source": {
          "label": "Official public business inbox",
          "url": "https://www.nervion.com.mx/contacto"
        }
      }
    ],
    "sources": [
      {
        "label": "Official direct design and manufacturing statement",
        "url": "https://www.nervion.com.mx/nosotros"
      },
      {
        "label": "Official own factory location, distinct from distributors",
        "url": "https://www.nervion.com.mx/donde"
      },
      {
        "label": "Official industrial epoxy finished-coating range",
        "url": "https://www.nervion.com.mx/productos/familia/epoxicos"
      },
      {
        "label": "Official marine finished-coating applications",
        "url": "https://www.nervion.com.mx/productos/sector/marinoynautico"
      },
      {
        "label": "Official solvents/reactors product scope countercheck",
        "url": "https://www.nervion.com.mx/productos/certificaciones/h-d-s-solventes-y-reactores"
      },
      {
        "label": "Official legal identity and business address",
        "url": "https://www.nervion.com.mx/privacy"
      },
      {
        "label": "Official public business inbox and quotation/sales phone",
        "url": "https://www.nervion.com.mx/contacto"
      }
    ]
  },
  "chugoku-marine-paints-tokyo": {
    "website": "https://www.cmp.co.jp/en.html",
    "contactPage": "https://www.cmp.co.jp/en/contact/",
    "generalPhone": "+81 3 6457 9025",
    "address": "Toranomon Hills Station Tower 16F, 2-6-1 Toranomon, Minato-ku, Tokyo 105-5516, Japan",
    "contacts": [
      {
        "name": "Kenshi Date",
        "title": "President & CEO",
        "department": "Management",
        "source": {
          "label": "Official current company Fact Sheet",
          "url": "https://www.cmp.co.jp/en/company/corporate_data.html"
        },
        "verifiedAt": "2026-10-11"
      }
    ],
    "departmentEmails": [],
    "sources": [
      {
        "label": "Official own marine/industrial/container coating manufacturing and legal headquarters",
        "url": "https://www.cmp.co.jp/en/company/corporate_data.html"
      },
      {
        "label": "Official own factories and R&D centres",
        "url": "https://www.cmp.co.jp/en/company/tech_fac.html"
      },
      {
        "label": "Official marine finished-coating range",
        "url": "https://www.cmp.co.jp/en/products/marine_coatings.html"
      },
      {
        "label": "Official railway CUS finished polyurethane filler, countercheck",
        "url": "https://www.cmp.co.jp/en/products/functional_compounds.html"
      },
      {
        "label": "Official group relationship directory",
        "url": "https://www.cmp.co.jp/en/company/group_east-asia.html"
      },
      {
        "label": "Official public business contact entry",
        "url": "https://www.cmp.co.jp/en/contact/"
      }
    ]
  },
  "hempel-lyngby": {
    "website": "https://www.hempel.com/",
    "contactPage": "https://www.hempel.com/contact-us",
    "generalEmail": "hempel@hempel.com",
    "generalPhone": "+45 4593 3800",
    "address": "Lundtoftegårdsvej 91, DK-2800 Kgs. Lyngby, Denmark",
    "contacts": [
      {
        "name": "Emilie Barriau",
        "title": "Executive Vice President and Chief Technology Officer",
        "department": "Technical",
        "source": {
          "label": "Official Executive Group Management",
          "url": "https://www.hempel.com/about-us/who-we-are"
        },
        "verifiedAt": "2026-10-11"
      }
    ],
    "departmentEmails": [
      {
        "department": "General",
        "email": "hempel@hempel.com",
        "source": {
          "label": "Official public business inbox",
          "url": "https://www.hempel.com/contact-us"
        }
      }
    ],
    "sources": [
      {
        "label": "Official 2025 annual report: manufacturing network and group ownership, original PDF p91 visually checked",
        "url": "https://www.hempel.com/-/media/Hempel/Files/Annual-Reports/Hempel-Annual-Report-2025.pdf"
      },
      {
        "label": "Official manufacturing scope and current executive technology role",
        "url": "https://www.hempel.com/about-us/who-we-are"
      },
      {
        "label": "Official research and coating development",
        "url": "https://www.hempel.com/about-us/what-we-do"
      },
      {
        "label": "Official marine coating applications",
        "url": "https://www.hempel.com/industries/marine/all-applications"
      },
      {
        "label": "Official finished-coating brands and scope",
        "url": "https://www.hempel.com/all-products/all-brands"
      },
      {
        "label": "Official legal headquarters and public business inbox",
        "url": "https://www.hempel.com/contact-us"
      }
    ]
  },
  "bvfcl-namrup": {
    "website": "https://bvfcl.com/",
    "contactPage": "https://bvfcl.com/management/",
    "generalEmail": "cpsingh@bvfcl.com",
    "address": "Namrup, P.O. Parbatpur 786623, District Dibrugarh, Assam, India",
    "contacts": [
      {
        "name": "C P Singh",
        "title": "Manager (MM)",
        "department": "Procurement",
        "email": "cpsingh@bvfcl.com",
        "source": {
          "label": "Official Materials Management & Transportation contact table",
          "url": "https://bvfcl.com/management/"
        },
        "verifiedAt": "2026-10-11"
      },
      {
        "name": "N M Das",
        "title": "DGM, Technical Services",
        "department": "Technical",
        "email": "nm.das@bvfcl.com",
        "source": {
          "label": "Official Technical Services contact table",
          "url": "https://bvfcl.com/management/"
        },
        "verifiedAt": "2026-10-11"
      }
    ],
    "departmentEmails": [
      {
        "department": "Procurement",
        "email": "cpsingh@bvfcl.com",
        "source": {
          "label": "Official materials-management office inbox",
          "url": "https://bvfcl.com/management/"
        }
      },
      {
        "department": "Technical",
        "email": "nm.das@bvfcl.com",
        "source": {
          "label": "Official technical-services office inbox",
          "url": "https://bvfcl.com/management/"
        }
      }
    ],
    "sources": [
      {
        "label": "Official annual report 2019–20: own neem coating plant and production history",
        "url": "https://www.bvfcl.com/wp-content/uploads/2020/12/18th_Annual_Report_of_BVFCL_for_the_year_2019-20.pdf"
      },
      {
        "label": "Official currently running Namrup-III manufacturing plant",
        "url": "https://bvfcl.com/plant-highlights/"
      },
      {
        "label": "Official own product and explicitly imported trading product separation",
        "url": "https://bvfcl.com/product/"
      },
      {
        "label": "Official materials-management business names and office emails; residential column omitted",
        "url": "https://bvfcl.com/management/"
      },
      {
        "label": "Official legal business office/address and general inbox",
        "url": "https://bvfcl.com/contact-us/"
      }
    ]
  },
  "hurl-new-delhi": {
    "website": "https://hurl.net.in/",
    "contactPage": "https://hurl.net.in/contact/",
    "generalEmail": "VPCnM@hurl.net.in",
    "generalPhone": "+91 11 22402305",
    "address": "Core-4, 9th Floor, SCOPE MINAR, Laxmi Nagar, New Delhi 110092, India",
    "contacts": [
      {
        "name": "C. S. Prasad",
        "title": "Vice President (Contracts & Materials)",
        "department": "Procurement",
        "email": "VPCnM@hurl.net.in",
        "phone": "+91 11 22402305",
        "source": {
          "label": "Official HURL headquarters contact table",
          "url": "https://hurl.net.in/contact/"
        },
        "verifiedAt": "2026-10-11"
      },
      {
        "name": "Dibesh Behera",
        "title": "Associate Vice President (Technical)",
        "department": "Technical",
        "email": "dibeshbehera@hurl.net.in",
        "source": {
          "label": "Official HURL Barauni contact table",
          "url": "https://hurl.net.in/contact/"
        },
        "verifiedAt": "2026-10-11"
      }
    ],
    "departmentEmails": [
      {
        "department": "Procurement",
        "email": "VPCnM@hurl.net.in",
        "source": {
          "label": "Official Contracts & Materials contact",
          "url": "https://hurl.net.in/contact/"
        }
      },
      {
        "department": "Technical",
        "email": "dibeshbehera@hurl.net.in",
        "source": {
          "label": "Official Barauni technical contact",
          "url": "https://hurl.net.in/contact/"
        }
      }
    ],
    "sources": [
      {
        "label": "Official current own coated-urea product and three manufacturing plants",
        "url": "https://hurl.net.in/ProductOverview/"
      },
      {
        "label": "Official current complete finished-fertilizer catalogue and import distinctions",
        "url": "https://hurl.net.in/products/"
      },
      {
        "label": "Official procurement and technical business contacts",
        "url": "https://hurl.net.in/contact/"
      }
    ]
  },
  "kribhco-hazira": {
    "website": "https://www.kribhco.net/",
    "contactPage": "https://www.kribhco.net/contact.html",
    "generalPhone": "+91 261 2862766",
    "address": "Hazira Fertilizer Complex, P.O. KRIBHCO Nagar, Surat 394515, Gujarat, India",
    "contacts": [],
    "departmentEmails": [],
    "sources": [
      {
        "label": "Official own neem-oil coating during manufacturing at Hazira/Shahjahanpur",
        "url": "https://www.kribhco.net/urea.html"
      },
      {
        "label": "Official complete product/service categories",
        "url": "https://www.kribhco.net/pages/products/product.html"
      },
      {
        "label": "Official Hazira business phone and contact entry",
        "url": "https://www.kribhco.net/contact.html"
      },
      {
        "label": "Official joint-venture relationship with IFFCO; not the same cooperative",
        "url": "https://kribhco.net/pages/about/jv.html"
      },
      {
        "label": "Official subsidiary scope",
        "url": "https://www.kribhco.net/pages/about/subsidiaries.html"
      }
    ]
  },
  "renner-italia-minerbio": {
    "website": "https://renneritalia.com/",
    "contactPage": "https://renneritalia.com/en/the-company-and-the-group/",
    "generalEmail": "info@renneritalia.com",
    "generalPhone": "+39 051 6618211",
    "address": "Via Ronchi Inferiore 34, 40061 Minerbio (BO), Italy",
    "contacts": [
      {
        "name": "Alexandre Cenacchi",
        "title": "President of Renner Italia S.p.A.",
        "department": "Management",
        "source": {
          "label": "Official Company and group leadership statement",
          "url": "https://renneritalia.com/en/the-company-and-the-group/"
        },
        "verifiedAt": "2026-10-11"
      }
    ],
    "departmentEmails": [
      {
        "department": "General",
        "email": "info@renneritalia.com",
        "source": {
          "label": "Official business inbox",
          "url": "https://renneritalia.com/en/the-company-and-the-group/"
        }
      }
    ],
    "sources": [
      {
        "label": "Official 2026 wood catalogue p10 and wood coating chapters; PDF independently rendered",
        "url": "https://renneritalia.com/wp-content/uploads/cataloghi/en_corporate26-wood.pdf"
      },
      {
        "label": "Official group relationship, legal identity and business contact",
        "url": "https://renneritalia.com/en/the-company-and-the-group/"
      },
      {
        "label": "Official internal resin formulation scope",
        "url": "https://renneritalia.com/en/ricerca/"
      },
      {
        "label": "Official purchased raw material and resin supply chain",
        "url": "https://renneritalia.com/en/our-suppliers-and-us/"
      },
      {
        "label": "Official complete Herrmann group business history",
        "url": "https://renneritalia.com/en/group/"
      }
    ]
  },
  "vermont-natural-coatings-hardwick": {
    "website": "https://vermontnaturalcoatings.com/",
    "contactPage": "https://vermontnaturalcoatings.com/pages/bohme",
    "generalEmail": "info@vermontnaturalcoatings.com",
    "generalPhone": "+1 802 472 8700",
    "address": "190 Junction Rd, Hardwick, Vermont 05843, United States",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "info@vermontnaturalcoatings.com",
        "source": {
          "label": "Official footer business inbox",
          "url": "https://vermontnaturalcoatings.com/pages/bohme"
        }
      }
    ],
    "sources": [
      {
        "label": "Official current own manufacture of partnered waterborne wood finish systems",
        "url": "https://vermontnaturalcoatings.com/pages/bohme"
      },
      {
        "label": "Official current proprietary coating product development",
        "url": "https://vermontnaturalcoatings.com/pages/about-us"
      },
      {
        "label": "Official water-based PolyWhey exterior wood stain",
        "url": "https://vermontnaturalcoatings.com/products/exterior-penetrating-wood-stain"
      },
      {
        "label": "Official PolyWhey technology and product scope",
        "url": "https://vermontnaturalcoatings.com/pages/polywhey"
      }
    ]
  },
  "target-coatings-fair-lawn": {
    "website": "https://www.targetcoatings.com/",
    "contactPage": "https://www.targetcoatings.com/contact_us/",
    "generalPhone": "+1 201 821 0150",
    "address": "Sales / Administration / Warehouse: 17-12 River Road, Fair Lawn, NJ 07410, United States",
    "contacts": [
      {
        "name": "Jeff Weiss",
        "title": "Owner and Formulating Chemist",
        "department": "Technical",
        "source": {
          "label": "Official first-person company statement; role retained as published",
          "url": "https://www.targetcoatings.com/about-target-coatings/"
        },
        "verifiedAt": "2026-10-11"
      }
    ],
    "departmentEmails": [],
    "sources": [
      {
        "label": "Official own waterborne formulation/manufacturing and owner chemist",
        "url": "https://www.targetcoatings.com/about-target-coatings/"
      },
      {
        "label": "Official water-based wood sealer range",
        "url": "https://www.targetcoatings.com/shop/water-based-wood-sealers/"
      },
      {
        "label": "Official international business phone and office/warehouse address",
        "url": "https://www.targetcoatings.com/contact_us/"
      },
      {
        "label": "Official full two-item finishing additive catalogue",
        "url": "https://www.targetcoatings.com/shop/water-based-finish-additives-application-aids/"
      },
      {
        "label": "Official CL100 ester-diol finishing additive chemistry",
        "url": "https://www.targetcoatings.com/product/water-based-crosslinker/"
      },
      {
        "label": "Official SA5 application-retarding aid",
        "url": "https://www.targetcoatings.com/product/water-based-spray-brush-retarder/"
      },
      {
        "label": "Official EMCAT EC2A finished wood topcoat kit",
        "url": "https://www.targetcoatings.com/product/emcat-ec2a-acrylic-resin-topcoat-kit/"
      }
    ]
  },
  "general-finishes-east-troy": {
    "website": "https://generalfinishes.com/",
    "contactPage": "https://generalfinishes.com/register/general-finishes-manufacturer-account-registration-form",
    "address": "2462 Corporate Circle, East Troy, WI 53120, United States",
    "contacts": [],
    "departmentEmails": [],
    "sources": [
      {
        "label": "Official own East Troy factory and coating manufacturing",
        "url": "https://generalfinishes.com/waterbase-finishes-manufacturer-wisconsin"
      },
      {
        "label": "Official waterborne wood sanding sealer",
        "url": "https://generalfinishes.com/wood-finishes-retail/water-based-topcoats-and-sanding-sealer/enduro-water-based-sanding-sealer"
      },
      {
        "label": "Official OEM formulation lab and industrial business entry",
        "url": "https://generalfinishes.com/register/general-finishes-manufacturer-account-registration-form"
      },
      {
        "label": "Official site operating legal entity",
        "url": "https://generalfinishes.com/terms"
      },
      {
        "label": "Official TransTint acquisition and brand deduplication",
        "url": "https://transtintdyes.com/"
      }
    ]
  },
  "chambal-fertilizers-gadepan": {
    "website": "https://www.chambalfertilisers.com/",
    "contactPage": "https://www.chambalfertilisers.com/index43c2.html?Itemid=122&id=161&option=com_content&view=article",
    "generalPhone": "+91 744 2782915",
    "address": "P.O. Gadepan 325208, District Kota, Rajasthan, India",
    "contacts": [
      {
        "name": "Narinder Goyal",
        "title": "Business Head - Manufacturing Operations",
        "department": "Production",
        "source": {
          "label": "Official 2025–26 annual report leadership team",
          "url": "https://www.chambalfertilisers.com/pdf/Annual-Report-for-the-Financial-Year_2025-26.pdf"
        },
        "verifiedAt": "2026-10-11"
      }
    ],
    "departmentEmails": [
      {
        "department": "Procurement",
        "email": "cg_purcom1@chambal.in",
        "source": {
          "label": "Official Purchase mailbox; encoded public script expanded",
          "url": "https://www.chambalfertilisers.com/index43c2.html?Itemid=122&id=161&option=com_content&view=article"
        }
      }
    ],
    "sources": [
      {
        "label": "Official annual report 2020–21 p49: own neem-coated urea manufacture",
        "url": "https://www.chambalfertilisers.com/pdf/Annual-Report-for-the-Financial-Year-2020-2021.pdf"
      },
      {
        "label": "Official annual report 2025–26: current own plants and business scope",
        "url": "https://www.chambalfertilisers.com/pdf/Annual-Report-for-the-Financial-Year_2025-26.pdf"
      },
      {
        "label": "Official Gadepan manufacturing facilities",
        "url": "https://www.chambalfertilisers.com/indexc0bc.html"
      },
      {
        "label": "Official Purchase email and general plant telephone",
        "url": "https://www.chambalfertilisers.com/index43c2.html?Itemid=122&id=161&option=com_content&view=article"
      },
      {
        "label": "Official current Bharat Urea brochure",
        "url": "https://www.chambalfertilisers.com/pdf/English-Bulk/Urea-Eng.pdf"
      }
    ]
  },
  "madras-fertilizers-manali": {
    "website": "https://madrasfert.co.in/",
    "contactPage": "https://madrasfert.co.in/contact-us/",
    "generalPhone": "+91 44 25945310",
    "address": "Madras Fertilizers Limited, Manali, Chennai 600068, India",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "Production",
        "email": "gmplant@madrasfert.co.in",
        "source": {
          "label": "Official General Manager (Plant) inbox",
          "url": "https://madrasfert.co.in/contact-us/"
        }
      }
    ],
    "sources": [
      {
        "label": "Official factory performance: own neem-coated urea production in FY2024–25",
        "url": "https://madrasfert.co.in/the-plant/achievements/"
      },
      {
        "label": "Official company and own Manali plant",
        "url": "https://madrasfert.co.in/the-company/"
      },
      {
        "label": "Official neem-coated urea product category",
        "url": "https://madrasfert.co.in/marketing/chemical-fertilizers/"
      },
      {
        "label": "Official plant-management business contact",
        "url": "https://madrasfert.co.in/contact-us/"
      },
      {
        "label": "Official neem-based pesticide catalogue for supplier exclusion",
        "url": "https://madrasfert.co.in/marketing/agro-chemicals-neem-based/"
      }
    ]
  },
  "national-fertilizers-nangal": {
    "website": "https://nfl.co.in/",
    "contactPage": "https://tenders.nfl.co.in/admin_tender/upload/20260603111644_ATCX27459_6b95da9d-975d-41c7-9e731779448342706_buyer11.nfln.pb.pdf",
    "generalPhone": "+91 9464966819",
    "address": "National Fertilizers Limited, Naya Nangal, Punjab 140126, India",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "Procurement",
        "email": "ranjits@nfl.co.in",
        "source": {
          "label": "Official Nangal Materials Department",
          "url": "https://tenders.nfl.co.in/admin_tender/upload/20260603111644_ATCX27459_6b95da9d-975d-41c7-9e731779448342706_buyer11.nfln.pb.pdf"
        }
      },
      {
        "department": "Procurement",
        "email": "tilak@nfl.co.in",
        "source": {
          "label": "Official Nangal Materials Department",
          "url": "https://tenders.nfl.co.in/admin_tender/upload/20260603111644_ATCX27459_6b95da9d-975d-41c7-9e731779448342706_buyer11.nfln.pb.pdf"
        }
      }
    ],
    "sources": [
      {
        "label": "Official company quality manual: own neem-coated urea and industrial product scope",
        "url": "https://www.nfl.co.in/nflportal/Quality/Manual.pdf?menu=33&pmenu=10"
      },
      {
        "label": "Official manufacturing and agro-input trading business statement",
        "url": "https://nfl.co.in/Startup2024/startupInNFL.jsp"
      },
      {
        "label": "Official 2026 Nangal Materials Department business contact",
        "url": "https://tenders.nfl.co.in/admin_tender/upload/20260603111644_ATCX27459_6b95da9d-975d-41c7-9e731779448342706_buyer11.nfln.pb.pdf"
      }
    ]
  },
  "iffco-kalol": {
    "website": "https://www.iffco.in/",
    "contactPage": "https://www.iffco.in/en/tenders",
    "address": "IFFCO Kalol Unit, Kasturi Nagar, Gandhinagar, Gujarat 382423, India",
    "contacts": [
      {
        "name": "M M Patel",
        "title": "DGM (Purchase)",
        "department": "Procurement",
        "source": {
          "label": "Official Kalol purchase department directory",
          "url": "https://appskalol.iffco.coop/NFPDIR"
        },
        "verifiedAt": "2026-10-11"
      },
      {
        "name": "Pravin Kumar Singh",
        "title": "General Manager & Unit Head, Kalol",
        "department": "Production",
        "source": {
          "label": "Official Kalol unit head",
          "url": "https://www.iffco.in/en/production-unit-kalol-gujarat"
        },
        "verifiedAt": "2026-10-11"
      }
    ],
    "departmentEmails": [],
    "sources": [
      {
        "label": "Official Kalol own neem-coated urea production and unit head",
        "url": "https://www.iffco.in/en/production-unit-kalol-gujarat"
      },
      {
        "label": "Official neem-oil-coated urea product",
        "url": "https://www.iffco.in/en/urea-fertilizer"
      },
      {
        "label": "Official business and group-venture overview",
        "url": "https://www.iffco.in/en/our-business"
      },
      {
        "label": "Official procurement and vendor contact portal",
        "url": "https://www.iffco.in/en/tenders"
      },
      {
        "label": "Official purchase department business names; residential details not retained",
        "url": "https://appskalol.iffco.coop/NFPDIR"
      }
    ]
  },
  "duraway-coating-kapar": {
    "website": "https://durawaycoating.com/",
    "contactPage": "https://durawaycoating.com/ContactUs",
    "generalEmail": "datolowsh7@gmail.com",
    "generalPhone": "+60 3-33927798",
    "address": "No. 19, Jalan Korporat 9/KU9, Taman Perindustrian Meru, 42200 Kapar, Selangor, Malaysia",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "datolowsh7@gmail.com",
        "source": {
          "label": "Official business contact",
          "url": "https://durawaycoating.com/ContactUs"
        }
      }
    ],
    "sources": [
      {
        "label": "Official wood coating system including waterborne sealer/lacquer and floor clearcoat",
        "url": "https://durawaycoating.com/ProductDetail/wood-coating/123ae639-0c94-48a9-a04f-596da22b3c56"
      },
      {
        "label": "Official own manufacturing plant and coating research",
        "url": "https://durawaycoating.com/AboutUs"
      },
      {
        "label": "Official business email, phone, address and legal registration",
        "url": "https://durawaycoating.com/ContactUs"
      }
    ]
  },
  "elchemus-bukit-mertajam": {
    "website": "https://www.elchemus.com/",
    "contactPage": "https://www.elchemus.com/",
    "generalEmail": "contactus@elchemus.com",
    "generalPhone": "+60 12-4219-533",
    "address": "9, Jalan Industri Tangkas 2, Taman Industri Tangkas, 14000 Bukit Mertajam, Penang, Malaysia",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "contactus@elchemus.com",
        "source": {
          "label": "Official business contact",
          "url": "https://www.elchemus.com/"
        }
      }
    ],
    "sources": [
      {
        "label": "Official in-house waterborne coating development/manufacturing and company business contact",
        "url": "https://www.elchemus.com/"
      },
      {
        "label": "Official SC800 waterborne wood sealer and TC901i wood topcoat",
        "url": "https://www.elchemus.com/general-7"
      },
      {
        "label": "Official Surface Max waterborne filler/sealer/primer catalog",
        "url": "https://www.elchemus.com/surface-max"
      }
    ]
  },
  "mowilex-indonesia-cikande": {
    "website": "https://mowilex.com/",
    "contactPage": "https://shop.mowilex.com/en/pages/contact",
    "address": "Headquarters: Jl. Daan Mogot KM 10 No. 18, Jakarta 11710; manufacturing plant: Cikande, Serang, Banten, Indonesia",
    "generalPhone": "+62 21 5406663",
    "contacts": [],
    "departmentEmails": [],
    "sources": [
      {
        "label": "Official Woodstain wood coating and water solvent specification",
        "url": "https://mowilex.com/mowilex-woodstain/"
      },
      {
        "label": "Official 2023-03-21 Cikande plant inauguration and ACE parent relationship",
        "url": "https://mowilex.com/en/press-release/mowilexs-new-factory-production-increase-with-green-building-concept-and-carbon-emission-reduction-up-to-7/"
      },
      {
        "label": "Official company shop business contact and headquarters",
        "url": "https://shop.mowilex.com/en/pages/contact"
      },
      {
        "label": "Official additive category: BC1000 cement additive, supplier exclusion check",
        "url": "https://shop.mowilex.com/en/collections/additive"
      }
    ]
  },
  "tectona-warna-cirebon": {
    "website": "https://tectonapaint.id/",
    "contactPage": "https://tectonapaint.id/id/kontak/",
    "address": "Blok Prapatan RT 013/RW 005, Desa Palimanan Timur, Kecamatan Palimanan, Kabupaten Cirebon, Jawa Barat, Indonesia",
    "generalPhone": "08132239997",
    "generalEmail": "info@tectonapaint.id",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "General",
        "email": "info@tectonapaint.id",
        "source": {
          "label": "Official business contact page",
          "url": "https://tectonapaint.id/id/kontak/"
        }
      }
    ],
    "sources": [
      {
        "label": "Official Tectona waterborne wood finishing system",
        "url": "https://tectonapaint.id/"
      },
      {
        "label": "Official manufacturing entity, Palimanan production and business contacts",
        "url": "https://tectonapaint.id/id/kontak/"
      }
    ]
  },
  'kg-chemical-ulsan': {
    "website": "https://www.kgchem.co.kr/",
    "contactPage": "https://fert-kfia.or.kr/new/05_member/member01_view06.asp",
    "generalPhone": "+82 52 231 1700",
    "contacts": [],
    "departmentEmails": [],
    "address": "322 Dangwol-ro, Onsan-eup, Ulju-gun, Ulsan, South Korea. Corporate/factory phone +82 52 231 1700 from KFIA; own website could not be securely retrieved in this round, so company-filed KRX materials and original association records used. Map represents Ulsan city, not an exact coating line.",
    "sources": [
      {
        "label": "Official 2025 annual report disclosed in March 2026, own fertilizer production, coated microbial fertilizer R&D and chemical-product scope",
        "url": "https://kind.krx.co.kr/external/2026/03/23/002346/20260323009924/11011.htm"
      },
      {
        "label": "KFIA original March 2023 magazine, pages 4–5, KG coated slow-release product and then-published R&D team; historic roles not asserted as current contacts",
        "url": "https://fert-kfia.or.kr/bbs/ftp/2303.pdf"
      },
      {
        "label": "KFIA corporate identity, manufacturing scope, Ulsan address and business phone",
        "url": "https://fert-kfia.or.kr/new/05_member/member01_view06.asp"
      },
      {
        "label": "Official November 2025 company quarterly disclosure independently cross-checking coated microbial fertilizer launch and chemical business",
        "url": "https://kind.krx.co.kr/external/2025/11/14/003298/20251114007634/11013.htm"
      }
    ]
  },
  'hankook-hyeophwa-pohang': {
    "website": "https://www.khhc.co.kr/",
    "contactPage": "https://www.khhc.co.kr/support",
    "generalPhone": "+82 2 737 2751",
    "contacts": [],
    "departmentEmails": [],
    "address": "Pohang factory: 63 Daesong-ro 253beon-gil, Nam-gu, Pohang-si, Gyeongsangbuk-do, South Korea. Headquarters: 6F Doryeom Building, 37 Saemunan-ro 5-gil, Jongno-gu, Seoul. Factory phone +82 54 272 5072 from KFIA directory; headquarters phone +82 2 737 2751 independently matches current own website footer. Map represents Pohang city, not an exact coating line.",
    "sources": [
      {
        "label": "Official product detail, 땅심올코팅 30-6-9, N/P/K fully coated; actual manufacturing of each coated component and coating chemistry unconfirmed",
        "url": "https://api.khhc.co.kr/products/info/246"
      },
      {
        "label": "Official product page for independently reread public API item 246",
        "url": "https://www.khhc.co.kr/product/246"
      },
      {
        "label": "Official fertilizer factory manufacturing and formulation processes",
        "url": "https://www.khhc.co.kr/business"
      },
      {
        "label": "Official company identity, own fertilizer manufacture, factory address and corporate phone",
        "url": "https://www.khhc.co.kr/information"
      },
      {
        "label": "Official public product catalogue; same-input supplier exclusion check",
        "url": "https://api.khhc.co.kr/products/list?language=kor"
      },
      {
        "label": "KFIA manufacturer member directory and headquarters/factory business phones",
        "url": "https://fert-kfia.or.kr/new/05_member/member01_view08.asp"
      }
    ]
  },
  'namhae-chemical-yeosu': {
    "website": "https://www.nhchem.co.kr/",
    "contactPage": "https://www.nhchem.co.kr/sub/customer/e_data/view.html?curpage=1&idx=10",
    "generalPhone": "+82 61 688 5500",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "Procurement",
        "email": "csuri@nhchem.co.kr",
        "source": {
          "label": "Official 2020 supplier-credit registration notice names procurement/materials contact 윤성은 과장; present role and mailbox delivery not confirmed",
          "url": "https://www.nhchem.co.kr/sub/customer/e_data/view.html?curpage=1&idx=10"
        }
      }
    ],
    "address": "Yeosu business/factory address: 1384 Yeosusandan-ro, Yeosu-si, Jeollanam-do, South Korea (KFIA official member directory). Procurement/materials supplier-registration phone: +82 61 688 5222. Map represents Yeosu city, not an exact coating-line location.",
    "sources": [
      {
        "label": "Official current 오래가올원 30-8-8: every granule is coated for controlled nutrient release",
        "url": "https://www.nhchem.co.kr/sub/product/fertilizer/view2.html?idx=182"
      },
      {
        "label": "Official 50-year company history, page 119: Namhae coating-process role, KCC acrylic coating-material role and 2005 own commercial CRF plant; historical commissioning, not current capacity or purchasing",
        "url": "https://nhchem.co.kr/history/ebook/files/basic-html/page119.html"
      },
      {
        "label": "Official supplier-credit registration notice (listed as 2020-12-22), procurement/materials published email; role and delivery require confirmation",
        "url": "https://www.nhchem.co.kr/sub/customer/e_data/view.html?curpage=1&idx=10"
      },
      {
        "label": "Official supplier-registration requirements and procurement/materials team phone",
        "url": "https://www.nhchem.co.kr/sub/customer/e_data/view.html?curpage=1&idx=8"
      },
      {
        "label": "Official chemical-product catalogue, supplier/competitor scope review",
        "url": "https://nhchem.co.kr/sub/product/chemistry.html"
      },
      {
        "label": "Korea Fertilizer Industry Association member profile, corporate identity, Yeosu address and general phone",
        "url": "https://fert-kfia.or.kr/new/05_member/member01_view01.asp"
      }
    ]
  },
  'rcf-mumbai': {
    "website": "https://rcfltd.com/",
    "contactPage": "https://www.rcfltd.com/tenderlist/details/9",
    "generalPhone": "+91 22 2552 3000",
    "contacts": [],
    "departmentEmails": [
      {
        "department": "Procurement",
        "email": "thalpurchase@rcfltd.com",
        "source": {
          "label": "Official vendor information, Thal procurement inbox (policy dates from 2015; routing and delivery unconfirmed)",
          "url": "https://www.rcfltd.com/tenderlist/details/9"
        }
      }
    ],
    "address": "Registered office: Priyadarshini Building, Eastern Express Highway, Sion, Mumbai, Maharashtra 400022, India. Manufacturing units: Trombay and Thal; one company account. Map represents Mumbai, not a precise coating-line location.",
    "sources": [
      {
        "label": "Official RCF company overview, manufacturing units and Urea Gold",
        "url": "https://rcfltd.com/rcf-at-glance-1"
      },
      {
        "label": "Official FY 2024–25 annual report, PDF page 6: 0.26 lakh MT of own sulphur-coated urea production; historical production, not a current purchasing signal",
        "url": "https://rcfltd.com/public/storage/investers/1758606773.pdf"
      },
      {
        "label": "Official Mumbai office telephone and address; placeholder info@example.com explicitly rejected",
        "url": "https://www.rcfltd.com/contact/contact"
      },
      {
        "label": "Official vendor-information page: Thal procurement department inbox, specific coating-line role and delivery unconfirmed",
        "url": "https://www.rcfltd.com/tenderlist/details/9"
      },
      {
        "label": "Official industrial chemical sales scope, supplier/competitor exclusion review",
        "url": "https://rcfltd.com/files/Advt%20for%20Actual%20Users%20(All%20Products).pdf"
      }
    ]
  },
  'agrotiger-mabalacat': {
    "website": "https://agrotiger.com/",
    "contactPage": "https://agrotiger.com/coated-solid-fertilizers/",
    "generalEmail": "markp@agrotiger.com",
    "generalPhone": "+63 2 7745 3096",
    "contacts": [],
    "departmentEmails": [],
    "address": "FPA licensed manufacturing location: Brgy. Paralayunan, Mabalacat City, Pampanga, Philippines. Business office: Room 205 One Greenhills Shopping Plaza Bldg., Eisenhower St., Greenhills, San Juan, Metro Manila 1504. Map location represents the city, not an exact factory coordinate.",
    "sources": [
      {
        "label": "Official HYFER organically coated solid-fertilizer range and published business email",
        "url": "https://agrotiger.com/coated-solid-fertilizers/"
      },
      {
        "label": "Official proprietary formulation, research and fertilizer manufacturing information",
        "url": "https://agrotiger.com/research-development/"
      },
      {
        "label": "FPA licensed handlers as of August 31, 2026: Agrotiger manufacturer at Mabalacat, expiry May 25, 2027",
        "url": "https://fpa.da.gov.ph/resources/reports/licensed-handlers/"
      },
      {
        "label": "FPA active registered fertilizers April 15, 2026, PDF pages 7–8: locally coated HYFER Complete and Urea Max; raw-material entries also reviewed",
        "url": "https://fpa.da.gov.ph/wp-content/uploads/2026/04/FOR-POSTING-FERTILIZER_PRODUCT_LISTING-AS-OF-4.15.2026_Optimized.pdf"
      },
      {
        "label": "Official other-product range, supplier/competitor scope check",
        "url": "https://agrotiger.com/other-products/"
      }
    ]
  },
  'chobi-ulsan': {
    "website": "https://www.chobi.co.kr/",
    "contactPage": "https://fert-kfia.or.kr/new/05_member/member01_view04.asp",
    "generalPhone": "+82 52 270 7910",
    "contacts": [],
    "departmentEmails": [],
    "address": "Head office: 13th Floor, DongO Building, 28 Hyoryeong-ro 77-gil, Seocho-gu, Seoul 06627, South Korea; fertilizer manufacturing plant: Ulsan, South Korea",
    "sources": [
      {
        "label": "CHOBI official company and Ulsan fertilizer manufacturing information",
        "url": "https://www.chobi.co.kr/chobi/company/companyinfo/"
      },
      {
        "label": "CHOBI official 2025 exhibitor brochure: coated urea and release patterns",
        "url": "https://pub-mediabox-storage.rxweb-prd.com/exhibitor/document/exh-6e034eed-44b2-41dd-9aaa-707d926e1e67/e3e0fe7f-7a79-4d7b-b205-cfcbd7342211.pdf"
      },
      {
        "label": "KFIA company profile and public head-office/factory contact details",
        "url": "https://fert-kfia.or.kr/new/05_member/member01_view04.asp"
      },
      {
        "label": "KFIA May 2023: coated-fertilizer factory and downstream coating technology (historical evidence)",
        "url": "https://fert-kfia.or.kr/bbs/ftp/2305.pdf"
      },
      {
        "label": "CHOBI official current product range; supplier/competitor scope review",
        "url": "https://www.chobi.co.kr/"
      }
    ]
  },
  'greenfeed-agro-shah-alam': {
    website: "https://www.greenfeed.com.my/",
    contactPage: "https://www.greenfeed.com.my/contact/",
    generalPhone: "+60 3 2201 8135",
    contacts: [],
    departmentEmails: [],
    address: "Manufacturing facility: Lot 56–57, Jalan Sepintas 26/13, Hicom Industrial Estate, Section 26, 40400 Shah Alam, Selangor, Malaysia; Head office: Unit 9-7, 7th Floor, The Boulevard Mid Valley, Lingkaran Syed Putra, 59200 Kuala Lumpur, Malaysia",
    sources: [
      {
        label: "Greenfeed official product catalogue and supplier/competitor scope check",
        url: "https://www.greenfeed.com.my/products/"
      },
      {
        label: "Greenfeed official manufacturing capability",
        url: "https://www.greenfeed.com.my/resource/manufacturing/"
      },
      {
        label: "Greenfeed official factory address and public business phones (factory: +60 3 5192 8135)",
        url: "https://www.greenfeed.com.my/contact/"
      },
      {
        label: "Greenfeed old slow-release nugget technology: nitrogen/zeolite, not polyurethane proof",
        url: "https://www.greenfeed.com.my/product-technology/"
      }
    ]
  },
  'saraswanti-anugerah-indonesia-mempawah': {
    website: "https://pupuksawit.id/",
    contactPage: "https://pupuksawit.id/contact-us/",
    generalPhone: "+62 31 82516888",
    contacts: [],
    departmentEmails: [],
    address: "Factory: Jl. Raya Sungai Kunyit, Kel. Sungai Dungun, Kec. Sungai Kunyit, Kab. Mempawah, Kalimantan Barat, Indonesia; Shared group head office: AMG Tower, 20th Floor, Jl. Dukuh Menanggal 1-A, Gayungan, Surabaya 60234, East Java, Indonesia",
    sources: [
      {
        label: "PT Saraswanti Anugerah Indonesia official company manufacturing role",
        url: "https://pupuksawit.id/about/"
      },
      {
        label: "Official Mempawah factory address and shared group business contact",
        url: "https://pupuksawit.id/contact-us/"
      },
      {
        label: "Saraswanti Group official Mempawah NPK factory opening (29 February 2024)",
        url: "https://saraswantifertilizer.com/peresmian-pabrik-pupuk-npk-pt-saraswanti-anugerah-indonesia-dan-pabrik-dolomit-pt-anugerah-dolomit-indonesia-di-mempawah/"
      },
      {
        label: "Saraswanti Group official Dupan and Mempawah affiliated production entities (25 March 2026)",
        url: "https://saraswantifertilizer.com/divisi-pupuk-saraswanti-mengadakan-acara-pembagian-sembako-untuk-warga-di-sekitar-pabrik/"
      }
    ]
  },
  'harrells-sylacauga': {
    website: 'https://harrells.com/',
    contactPage: 'https://harrells.com/contact/',
    contacts: [],
    departmentEmails: [],
    address: '151 Gene E. Stewart Boulevard, Sylacauga, AL 35151, United States',
    sources: [{
      label: 'Harrell’s published Sylacauga plant directory (older document; reconfirm address before outreach)', url: 'https://files.harrells.com/corporate/Contact_Lists/Plant%20and%20Distribution%20Centers.pdf',
    }, {
      label: 'Harrell’s current corporate contact page', url: 'https://harrells.com/contact/',
    }, {
      label: 'Harrell’s POLYON coating facility and substrate sourcing', url: 'https://harrells.com/blog/the-polyon-difference/',
    }],
  },
  'icl-charleston': {
    contacts: [{
      name: 'Jolene Miller', title: 'Product Lead, Controlled Release Fertilizers', department: 'Technical',
      email: 'jolene.miller@icl-group.com', phone: '+1 843-609-2859',
      source: { label: 'ICL agriculture experts directory', url: 'https://icl-growingsolutions.com/en-us/agriculture/our-experts/' },
      verifiedAt: '2026-09-25',
    }],
    departmentEmails: [{ department: 'Technical', email: 'jolene.miller@icl-group.com', source: { label: 'ICL agriculture experts directory', url: 'https://icl-growingsolutions.com/en-us/agriculture/our-experts/' } }],
  },
  'pursell-sylacauga': {
    contacts: [{
      name: 'Jason Woulfin', title: 'Director of International Sales', department: 'Sales',
      email: 'jason@fertilizer.com', phone: '+1 256-208-9509',
      source: { label: 'Pursell contact page', url: 'https://fertilizer.com/contact-us/' },
      verifiedAt: '2026-09-25',
    }],
    departmentEmails: [{ department: 'Sales', email: 'jason@fertilizer.com', source: { label: 'Pursell contact page', url: 'https://fertilizer.com/contact-us/' } }],
  },
  'florikan-bowling-green': {
    contacts: [],
    departmentEmails: [],
    sources: [{
      label: 'Profile Products acquisition announcement and public Florikan contact',
      url: 'https://www.profileproducts.com/profile-products-acquires-controlled-release-fertilizer-manufacturer-florikan/',
    }],
  },
  'genus-brunswick': {
    contacts: [],
    departmentEmails: [{
      department: 'Sales', email: 'sales@genustek.com',
      source: { label: 'GENUS public contact page', url: 'https://www.genustek.com/contact' },
    }],
    sources: [{
      label: 'GENUS public contact page',
      url: 'https://www.genustek.com/contact',
    }],
  },
  'agro-berjaya-mojokerto': {
    website: undefined,
    linkedIn: 'https://id.linkedin.com/company/agroberjayanusantara',
    contacts: [],
    departmentEmails: [],
    sources: [{
      label: 'PT Agro Berjaya Nusantara public LinkedIn company page',
      url: 'https://id.linkedin.com/company/agroberjayanusantara',
    }],
  },
  'diversatech-bangi': {
    website: 'https://diversatech.my/',
    contactPage: 'https://diversatech.my/contact/',
    generalEmail: 'admin@diversatech.my',
    generalPhone: '+60 3-8926 3103',
    contacts: [{
      name: 'Syed Muhamad Amir bin Syed Omar', title: 'Director', department: 'Management',
      email: 'syedamir@diversatechfertilizer.com',
      source: { label: 'Fertilizer Industry Association of Malaysia company directory', url: 'https://www.fiam.org.my/index.php?Itemid=118&link_id=26&option=com_mtree&task=viewlink' },
      verifiedAt: '2026-09-26',
    }, {
      name: 'Khairulnizam Bin Po’at', title: 'Senior Manager, Logistics, Procurement & Quality Control', department: 'Procurement',
      source: { label: 'Diversatech official leadership list', url: 'https://diversatech.my/about-us/' }, verifiedAt: '2026-09-29',
    }, {
      name: 'Mohd. Sopian Bin Mohd. Nor', title: 'Head of Engineering', department: 'Technical',
      source: { label: 'Diversatech official leadership list', url: 'https://diversatech.my/about-us/' }, verifiedAt: '2026-09-29',
    }, {
      name: 'Ahmad Khuzir Bin Abdul Wahab', title: 'Acting General Manager, Manufacturing', department: 'Production',
      source: { label: 'Diversatech official leadership list', url: 'https://diversatech.my/about-us/' }, verifiedAt: '2026-09-29',
    }],
    departmentEmails: [
      { department: 'Procurement', email: 'perolehan@diversatech.my', source: { label: 'Diversatech official contact page', url: 'https://diversatech.my/contact/' } },
      { department: 'General', email: 'admin@diversatech.my', source: { label: 'Diversatech official contact page', url: 'https://diversatech.my/contact/' } },
    ],
    address: 'A-01-02, Jalan Medan PB5, Paragon Point, Seksyen 9, 43650 Bandar Baru Bangi, Selangor, Malaysia',
    sources: [
      { label: 'Diversatech official AJIB CRF product', url: 'https://diversatech.my/ajib-crf/' },
      { label: 'Diversatech official leadership list', url: 'https://diversatech.my/about-us/' },
      { label: 'Diversatech official factory and procurement contact', url: 'https://diversatech.my/contact/' },
      { label: 'Fertilizer Industry Association of Malaysia: Diversatech manufacturer listing', url: 'https://www.fiam.org.my/index.php?Itemid=118&link_id=26&option=com_mtree&task=viewlink' },
    ],
  },
  'farmhannong-ulsan': {
    departmentEmails: [
      { department: 'Procurement', email: 'jhkim0424@farmhannong.com', source: { label: 'FarmHannong public procurement desk', url: 'https://www.farmhannong.com/eng/cs/direct/inquiry/write.do' } },
      { department: 'General', email: 'dllion@farmhannong.com', source: { label: 'FarmHannong public fertilizer international sales desk', url: 'https://www.farmhannong.com/eng/cs/direct/inquiry/write.do' } },
    ],
    contacts: [],
    sources: [{
      label: 'FarmHannong fertilizer production facility overview',
      url: 'https://www.farmhannong.com/eng/company/contentsid/154/index.do',
    }],
  },
  'jcam-agri-tokyo': {
    contacts: [],
    departmentEmails: [{
      department: 'Technical', email: 'gijutsu@jcam-agri.co.jp',
      source: { label: 'JCAM Agri technical-management contact in J-Coat release', url: 'https://www.jcam-agri.co.jp/pdf/20231225_news_release.pdf' },
    }],
    sources: [{
      label: 'JCAM Agri company profile and manufacturing sites',
      url: 'https://www.jcam-agri.co.jp/company/',
    }],
  },
  'vinyl-base-ipoh': {
    contacts: [],
    departmentEmails: [],
    sources: [{
      label: 'Vinyl Base public PVC-compound and medical-extrusion company profile',
      url: 'https://vinyl-base.com/about-us/',
    }],
  },
  'schramm-coatings-offenbach': {
    contacts: [],
    departmentEmails: [],
    sources: [{
      label: 'AkzoNobel Germany: SCHRAMM Coatings entity contact and production address',
      url: 'https://www.akzonobel.com/en/countries/germany/unsere-standorte',
    }],
  },
  'periwal-bhiwadi': {
    contacts: [{
      name: 'Pawan Periwal', title: 'Managing Director', department: 'Management',
      source: { label: 'Periwal Polymers official managing-director page', url: 'https://www.periwalpolymers.com/message-from-md.php' },
      verifiedAt: '2026-09-26',
    }],
    departmentEmails: [{
      department: 'Sales', email: 'sales@periwalpolymers.com',
      source: { label: 'Periwal Polymers public contact page', url: 'https://www.periwalpolymers.com/contact' },
    }],
    sources: [{
      label: 'Periwal PVC-compounding plant and capacity',
      url: 'https://www.periwalpolymers.com/about',
    }],
  },
  'turf-care-martins-ferry': {
    contacts: [{
      name: 'Brian Mengeu', title: 'General Manager, Martins Ferry Manufacturing & Coating Facility', department: 'Production',
      email: 'bmengeu@tcscusa.com', phone: '+1 740-633-6366',
      source: { label: 'Turf Care Supply Martins Ferry facility contact', url: 'https://www.turfcaresupply.com/locations' },
      verifiedAt: '2026-09-26',
    }],
    departmentEmails: [{
      department: 'Production', email: 'bmengeu@tcscusa.com',
      source: { label: 'Turf Care Supply Martins Ferry facility contact', url: 'https://www.turfcaresupply.com/locations' },
    }],
    sources: [{
      label: 'Turf Care Supply Martins Ferry polymer-coating facility',
      url: 'https://www.turfcaresupply.com/martins-ferry-facility',
    }],
  },
  'omega-polimeros-trujui': {
    contacts: [],
    departmentEmails: [{
      department: 'Sales', email: 'info@omegapolimeros.com.ar',
      source: { label: 'Omega Polímeros public contact page', url: 'https://omegapolimeros.com.ar/contacto/' },
    }],
    address: 'Parque Industrial Buen Ayre, General Martín de Gainza 801, Ed. 2, Of. 67, Trujui – Moreno, Buenos Aires, Argentina',
    sources: [{
      label: 'Omega Polímeros PVC compound production and public contact',
      url: 'https://omegapolimeros.com.ar/contacto/',
    }],
  },
  'supernovae-funza': {
    contacts: [],
    departmentEmails: [{
      department: 'Sales', email: 'ventas@supernovae.com.co',
      source: { label: 'Supernovae public contact page', url: 'https://supernovae.com.co/portal/contacto/' },
    }],
    address: 'Celta Trade Park – Bodega 100, Autopista Medellín Km 7, Vía Bogotá – La Vega, Funza, Cundinamarca, Colombia',
    sources: [{
      label: 'Supernovae PVC compound manufacturing and public contact',
      url: 'https://supernovae.com.co/portal/',
    }],
  },
  'vivacor-diadema': {
    contacts: [],
    departmentEmails: [{
      department: 'Sales', email: 'sac@vivacor.com.br',
      source: { label: 'Vivacor public company contact', url: 'https://www.vivacor.com.br/v2/quem-somos/' },
    }],
    address: 'Rua Rio Grande do Sul, 81, Vila Oriental, Diadema, SP 09950-140, Brazil',
    sources: [{
      label: 'Vivacor develops and manufactures flexible-packaging inks',
      url: 'https://www.vivacor.com.br/v2/quem-somos/',
    }, {
      label: 'ICHEMCO PP/PE waterborne-ink primer technical catalog',
      url: 'https://services.ichemco.com/eng/Catalogs/Ichemco%20Products%20for%20Tapes%20and%20Protective%20Films%202020.pdf',
    }],
  },
  'agrobiotech-jardinopolis': {
    contacts: [],
    departmentEmails: [{
      department: 'Sales', email: 'contato.site@agrobiotech.com.br',
      source: { label: 'Agrobiotech public company contact', url: 'https://agrobiotech.com.br/en/' },
    }],
    whatsapp: 'https://wa.me/5516997936989',
    address: 'Rua Domiciano Leite de Assis, 260, Distrito Industrial Adib Rassi, Jardinópolis, SP 14684-722, Brazil',
    sources: [{
      label: 'Agrobiotech Brazilian fertilizer manufacturing and public contact',
      url: 'https://agrobiotech.com.br/en/',
    }],
  },
  'fortgreen-varginha': {
    website: 'https://fortgreen.com.br/',
    contactPage: 'https://fortgreen.com.br/contato',
    contacts: [],
    departmentEmails: [],
    address: 'Av. José Ribeiro Tristão, 120, Aeroporto, Varginha, MG 37031-075, Brazil',
    sources: [{
      label: 'Fortgreen current factory locations and public contact', url: 'https://fortgreen.com.br/contato',
    }, {
      label: 'Fortgreen official company page confirming two Brazilian factories', url: 'https://fortgreen.com.br/quem-somos',
    }],
  },
  'grupo-equilibrio-catalao': {
    website: 'https://grupoequilibrio.agr.br/',
    contactPage: 'https://grupoequilibrio.agr.br/solucoes/linha/eqcoat/',
    contacts: [],
    departmentEmails: [{
      department: 'Sales', email: 'comercial@equilibriofertilizantes.com.br',
      source: { label: 'Grupo Equilíbrio eQcoat official product and contact page', url: 'https://grupoequilibrio.agr.br/solucoes/linha/eqcoat/' },
    }],
    address: 'Rodovia BR-050, Zona Rural, Catalão, GO 75707-265, Brazil',
    sources: [{
      label: 'Grupo Equilíbrio factories, fertilizer production and supplier check', url: 'https://grupoequilibrio.agr.br/sobre-nos/',
    }],
  },
  'adubos-paranaiba-uberlandia': {
    website: 'https://www.adubosparanaiba.com.br/',
    contactPage: 'https://www.adubosparanaiba.com.br/',
    contacts: [],
    departmentEmails: [],
    address: 'Av. Aírton Borges da Silva, 1129, Uberlândia, MG, Brazil',
    sources: [{
      label: 'Brazil government register classifies the company as fertilizer manufacturing', url: 'https://portaldatransparencia.gov.br/pessoa-juridica/18868117000157',
    }, {
      label: 'Company public telephone and address', url: 'https://www.adubosparanaiba.com.br/',
    }],
  },
  'polyflex-baltic': {
    contacts: [{
      name: 'Zach Alexander', title: 'Sales contact', department: 'Sales',
      email: 'zachalexander@flextechnologies.com', phone: '+1 330-407-0009',
      source: { label: 'Polyflex public contact section', url: 'https://www.flextechnologies.com/polyflex' },
      verifiedAt: '2026-09-26',
    }],
    departmentEmails: [{
      department: 'Sales', email: 'zachalexander@flextechnologies.com',
      source: { label: 'Polyflex public contact section', url: 'https://www.flextechnologies.com/polyflex' },
    }],
  },
  'polymer-chemie-bad-sobernheim': {
    contacts: [{
      name: 'Christian Leinberger', title: 'Head of Sales and R&D', department: 'Technical',
      email: 'christian.leinberger@polymer-chemie.de', phone: '+49 6751 84-635',
      source: { label: 'Polymer-Chemie public contact-person directory', url: 'https://www.polymer-chemie.de/en/contact/all-contact-persons' },
      verifiedAt: '2026-09-26',
    }],
    departmentEmails: [{
      department: 'Technical', email: 'christian.leinberger@polymer-chemie.de',
      source: { label: 'Polymer-Chemie public contact-person directory', url: 'https://www.polymer-chemie.de/en/contact/all-contact-persons' },
    }],
  },
  'astra-chemtech-mumbai': {
    contacts: [
      {
        name: 'Farid Sorathiya', title: 'Director', department: 'Management',
        source: { label: 'Astra Chemtech public contact page', url: 'https://www.astrachemtech.com/enquiry.html' },
        verifiedAt: '2026-09-26',
      },
      {
        name: 'Gautham Bhat', title: 'Technical Support', department: 'Technical',
        source: { label: 'Astra Chemtech public contact page', url: 'https://www.astrachemtech.com/enquiry.html' },
        verifiedAt: '2026-09-26',
      },
    ],
    departmentEmails: [],
    address: 'No. 306, Nav - Vivek Industrial Estate, Mogul Lane, Mahim West, Mumbai 400016, Maharashtra, India',
    sources: [
      { label: 'Astra Chemtech manufacturing profile and product lines', url: 'https://www.astrachemtech.com/profile.html' },
      { label: 'Astra Chemtech public contact and technical-support listing', url: 'https://www.astrachemtech.com/enquiry.html' },
    ],
  },
  'nam-ah-ipoh': {
    contacts: [],
    departmentEmails: [{
      department: 'Sales', email: 'sales@snasb.com',
      source: { label: 'Syarikat Nam Ah public contact page', url: 'https://www.snasb.com/' },
    }],
    address: 'Lot 69, Jalan Portland, Tasek Industrial Estate, 31400 Ipoh, Perak, Malaysia',
    sources: [{
      label: 'Syarikat Nam Ah PVC-compound manufacturing and public sales contact',
      url: 'https://www.snasb.com/',
    }],
  },
  'dacarto-osasco': {
    contacts: [],
    departmentEmails: [{
      department: 'Sales', email: 'comercial@dacarto.com.br',
      source: { label: 'Dacarto public commercial contact', url: 'https://dacarto.com.br/produtos/' },
    }],
    whatsapp: 'https://wa.me/5511950950121',
    address: 'Estrada da Alpina, 59, Industrial Anhanguera, Osasco, SP 06276-180, Brazil',
    sources: [{
      label: 'Dacarto PVC-compound manufacturing, plasticizer formulation and public contact',
      url: 'https://dacarto.com.br/produtos/',
    }, {
      label: 'Dacarto company manufacturing profile',
      url: 'https://dacarto.com.br/sobre/',
    }],
  },
  'flint-group-malmo': {
    contacts: [],
    departmentEmails: [{
      department: 'Sales', email: 'info.packaginginks@flintgrp.com',
      source: { label: 'Flint Group PremoFilm public packaging-inks contact', url: 'https://www.flintgrp.com/news-and-events/news/2810-flint-group-introduces-premofilm-sxs-2/' },
    }],
    address: 'Flint Group Global Innovation Centre, Malmö, Sweden',
    sources: [{
      label: 'Flint Group water-based packaging inks for PE / polyolefin film',
      url: 'https://www.flintgrp.com/news-and-events/news/2810-flint-group-introduces-premofilm-sxs-2/',
    }, {
      label: 'Flint Group Global Innovation Centre for packaging inks and print solutions',
      url: 'https://www.flintgrp.com/services/centres-of-excellence/',
    }],
  },
  'inx-schaumburg': {
    contacts: [],
    departmentEmails: [],
    address: '150 North Martingale Road, Suite 700, Schaumburg, IL 60173, United States',
    sources: [{
      label: 'INX Aquamax water-based HDPE packaging ink',
      url: 'https://www.inxinternational.com/news/inx-international-showcase-sustainable-packaging-inks-and-nitrocellulose-free-technologies',
    }, {
      label: 'INX public technical, vendor and customer-service contact routes',
      url: 'https://www.inxinternational.com/contact-us',
    }, {
      label: 'INX R&D and production-lab services',
      url: 'https://www.inxinternational.com/sites/default/files/pdf/INX_RandD_Guide-11072022.pdf',
    }],
  },
  'shakun-vadodara': {
    contacts: [],
    departmentEmails: [{
      department: 'General', email: 'contacts@shakunpolymers.com',
      source: { label: 'Shakun Polymers public contact page', url: 'https://www.shakunpolymers.com/contact/' },
    }],
    address: '101, 1st Floor, Sears Tower 1, Gotri Sevasi Road, Sevasi, Vadodara 391101, Gujarat, India',
    sources: [{
      label: 'Shakun PVC cable compound formulated with plasticizers and stabilizers',
      url: 'https://shakunpolymers.com/admin/assets/img/itempdfs/SPL-VTEK-S%2052.pdf',
    }, {
      label: 'Shakun Polymers public business contact',
      url: 'https://www.shakunpolymers.com/contact/',
    }, {
      label: 'Shakun PVC compound product range',
      url: 'https://www.shakunpolymers.com/products.php',
    }],
  },
  'pvc-colouring-ahmedabad': {
    contacts: [{
      name: 'Girish Perkar', title: 'Marketing', department: 'Sales', phone: '+91 8045477858',
      source: { label: 'PVC Colouring public marketing contact', url: 'https://www.pvccompound.in/' }, verifiedAt: '2026-09-26',
    }],
    departmentEmails: [],
    address: '64, G.I.D.C. Phase-I, Opp. Citizen Industries, Naroda, Ahmedabad 382330, Gujarat, India',
    sources: [{
      label: 'PVC Colouring flexible PVC compound with published plasticizer content',
      url: 'https://www.pvccompound.in/tubes-pvc-compound-4681561.html',
    }, {
      label: 'PVC Colouring manufacturing profile and public marketing contact',
      url: 'https://www.pvccompound.in/',
    }],
  },
  'sun-chemical-parsippany': {
    contacts: [],
    departmentEmails: [],
    address: '35 Waterview Boulevard, Parsippany, NJ 07054-1285, United States',
    sources: [{
      label: 'Sun Chemical AquaLam water-based OPP / PE packaging inks',
      url: 'https://www.sunchemical.com/packaging_product_sunstrato/',
    }, {
      label: 'Sun Chemical public product-contact page',
      url: 'https://www.sunchemical.com/contact-us/',
    }, {
      label: 'Sun Chemical global headquarters and regional business contacts',
      url: 'https://www.sunchemical.com/regions/',
    }],
  },
  'crf-malaysia-kuala-lumpur': {
    contacts: [],
    departmentEmails: [{
      department: 'Sales', email: 'inquiry@crfm.com.my',
      source: { label: 'CRF Malaysia public business contact', url: 'https://crfm.com.my/' },
    }],
    address: 'B-5-2 Northpoint Offices, 1 Medan Syed Putra Utara, Mid Valley City, 59200 Kuala Lumpur, Malaysia',
    sources: [{
      label: 'CRF Malaysia controlled-release fertilizer facilities and coating technology',
      url: 'https://crfm.com.my/',
    }],
  },
  'cai-georgetown': {
    contacts: [],
    departmentEmails: [{
      department: 'Sales', email: 'info@caiink.com',
      source: { label: 'CAI public business email and manufacturing profile', url: 'https://www.caiink.com/' },
    }],
    address: '7 Martel Way, Georgetown, MA 01833, United States',
    sources: [{
      label: 'CAI water-based flexographic and gravure inks for PE / PP films',
      url: 'https://www.caiink.com/',
    }],
  },
  'applied-db-samut-prakan': {
    contacts: [],
    departmentEmails: [{
      department: 'Sales', email: 'adb_marketing@adb.co.th',
      source: { label: 'ADB public Sales & Marketing contact', url: 'https://www.adb.co.th/en/contact-us-2/' },
    }],
    address: '252 M.4 Bangpoo Industrial Soi 3C, Sukhumvit Rd., Prakasa, Muang, Samutprakan 10280, Thailand',
    sources: [{
      label: 'ADB PVC compound manufacturing and soft PVC product range',
      url: 'https://www.adb.co.th/en/plastic-compound/',
    }, {
      label: 'ADB annual report: PVC compound formulated with plasticizer',
      url: 'https://www.adb.co.th/wp-content/uploads/2024/03/Annual-Report-2023.pdf',
    }, {
      label: 'ADB public customer-service and Sales & Marketing contact',
      url: 'https://www.adb.co.th/en/contact-us-2/',
    }],
  },
  'ceccan-san-jose-iturbide': {
    website: 'https://www.ceccan.com.mx/en/',
    contactPage: 'https://www.ceccan.com.mx/en/',
    contacts: [],
    departmentEmails: [{
      department: 'Sales', email: 'ventas@ceccan.com.mx',
      source: { label: 'CECCAN public sales contact', url: 'https://www.ceccan.com.mx/en/' },
    }],
    address: 'Santa Fe Norte 3, Parque Opción, 37980 San José Iturbide, Guanajuato, Mexico',
    sources: [{
      label: 'CECCAN PVC compounds, plasticizer-storage facilities and contact',
      url: 'https://www.ceccan.com.mx/en/',
    }, {
      label: 'Cosmos Online CECCAN business address',
      url: 'https://www.cosmos.com.mx/empresa/plasticos-ceccan-3n0d.html',
    }],
  },
  'central-chemical-ube': {
    website: 'https://www.central-chemical.co.jp/',
    contacts: [],
    departmentEmails: [],
    address: '7-5254 Okiube, Ube City, Yamaguchi 755-0001, Japan',
    sources: [{
      label: 'Central Chemical official Ube plant address and telephone',
      url: 'https://www.cgc-jp.com/company/affiliates/centralgodo.html',
    }, {
      label: 'Central Chemical manufactured fertilizer products',
      url: 'https://www.central-chemical.co.jp/entry21.html',
    }, {
      label: 'Central Glass Cera-coat R coated-urea product page',
      url: 'https://www.cgc-jp.com/products/detail/ceracoat.html',
    }],
  },
  'tintas-prisma-tlalnepantla': {
    website: 'https://tintasprisma.com.mx/',
    contactPage: 'https://tintasprisma.com.mx/contacto.html',
    contacts: [],
    departmentEmails: [{
      department: 'Sales', email: 'ventas@tintasprisma.com.mx',
      source: { label: 'Tintas Prisma official contact page', url: 'https://tintasprisma.com.mx/contacto.html' },
    }],
    address: 'Cda. San Juan 20, Industrial la Presa, 54187 Tlalnepantla de Baz, Estado de México, Mexico (third-party directory; street not confirmed on company site)',
    sources: [{
      label: 'Tintas Prisma AQUAPOLY water-based HDPE ink', url: 'https://tintasprisma.com.mx/p-2.html',
    }, {
      label: 'Tintas Prisma official contact page', url: 'https://tintasprisma.com.mx/contacto.html',
    }, {
      label: 'AllBiz Tintas Prisma street address (third-party)', url: 'https://www.allbiz.mx/tintas-prisma-55-5384-7598',
    }],
  },
  'alpha-plast-devland': {
    website: 'https://alphaplast.co.za/',
    contactPage: 'https://alphaplast.co.za/contact-us/',
    contacts: [],
    departmentEmails: [{
      department: 'Sales', email: 'sales@alphaplast.co.za',
      source: { label: 'Alpha Plast official contact page', url: 'https://alphaplast.co.za/contact-us/' },
    }],
    address: '118 Gibbs Road, Devland, Johannesburg, 1811, South Africa',
    sources: [{
      label: 'Alpha Plast PVC compounding process and plasticizer inputs', url: 'https://alphaplast.co.za/markets-and-applications/',
    }, {
      label: 'Alpha Plast official contact details', url: 'https://alphaplast.co.za/contact-us/',
    }],
  },
  'mivena-maastricht': {
    website: 'https://mivena.nl/',
    contactPage: 'https://mivena.nl/contact/',
    contacts: [{
      name: 'Coert Rasenberg', title: 'CEO Managing Partner', department: 'Management',
      source: { label: 'Mivena CEO Managing Partner public company article', url: 'https://mivena.nl/about-us/coertrasenberg/' },
      verifiedAt: '2026-09-27',
    }],
    departmentEmails: [],
    address: 'Ankerkade 154, 6222 NM Maastricht, Netherlands',
    sources: [{
      label: 'Mivena coated fertilizer manufacturing and incoming raw-material testing', url: 'https://mivena.nl/factory-2020/',
    }, {
      label: 'Mivena fertilizer product catalog', url: 'https://mivena.nl/products/',
    }, {
      label: 'Mivena contact page with office and factory addresses', url: 'https://mivena.nl/contact/',
    }, {
      label: 'Mivena CEO Managing Partner public company article', url: 'https://mivena.nl/about-us/coertrasenberg/',
    }],
  },
  'greenbest-henstridge': {
    website: 'https://www.greenbest.co.uk/',
    contactPage: 'https://www.greenbest.co.uk/contact-us/',
    contacts: [{
      name: 'Jack Baxter', title: 'Sales and Product Development', department: 'Other',
      source: { label: 'GreenBest current public staff directory', url: 'https://www.greenbest.co.uk/staff/' },
      verifiedAt: '2026-09-27',
    }],
    departmentEmails: [{
      department: 'Sales', email: 'sales@greenbest.co.uk',
      source: { label: 'GreenBest official contact page', url: 'https://www.greenbest.co.uk/contact-us/' },
    }],
    address: 'Unit 2, The Marsh, Henstridge, Somerset BA8 0TF, United Kingdom',
    sources: [{
      label: 'GreenBest in-house polymer-coated urea and coating plant', url: 'https://www.greenbest.co.uk/uk-lawn-care-association-visit-greenbest-factory/',
    }, {
      label: 'GreenBest production job listing documenting raw-material mixing and coating-plant operations', url: 'https://www.greenbest.co.uk/home/careers/',
    }, {
      label: 'GreenBest current public staff directory', url: 'https://www.greenbest.co.uk/staff/',
    }, {
      label: 'GreenBest official contact page', url: 'https://www.greenbest.co.uk/contact-us/',
    }],
  },
  'palini-vernici-pisogne': {
    website: 'https://www.palinal.com/',
    contactPage: 'https://www.palinal.com/contacts.html',
    contacts: [],
    departmentEmails: [{
      department: 'Technical', email: 'lab@palinal.com',
      source: { label: 'PALINAL technical assistance and color laboratory contact', url: 'https://www.palinal.com/training-and-technical-assistance.html' },
    }],
    address: 'Via San Gerolamo 14, 25055 Pisogne (BS), Italy',
    sources: [{
      label: 'PALINAL ABS and ABS/PP water-based primer products', url: 'https://www.palinal.com/products/plastic/primers-and-fillers/motorbike-ids19/',
    }, {
      label: 'PALINAL R&D laboratory researches coating raw materials', url: 'https://www.palinal.com/research-and-development.html',
    }, {
      label: 'PALINAL technical assistance and color laboratory contact', url: 'https://www.palinal.com/training-and-technical-assistance.html',
    }, {
      label: 'PALINAL official contact page', url: 'https://www.palinal.com/contacts.html',
    }],
  },
  'sankhla-industries-bengaluru': {
    website: 'https://www.sankhlaindustries.com/',
    contactPage: 'https://www.sankhlaindustries.com/blank-1',
    contacts: [],
    departmentEmails: [],
    address: 'Works: Survey No. 127, Budhihai Village, Kasaba Hobli, Nelamangala Taluk, Bengaluru Rural, Karnataka 562123, India',
    sources: [{
      label: 'Sankhla Industries flexible PVC compound products', url: 'https://www.sankhlaindustries.com/projects',
    }, {
      label: 'Sankhla official SP90 PVC compound specification: plasticizers and stabilizers', url: 'https://www.sankhlaindustries.com/sankhlaspecifications/SP90.pdf',
    }, {
      label: 'Public court judgment documenting ESBO use in Sankhla PVC compounding (not evidence of ELO use)', url: 'https://www.casemine.com/judgement/in/679a4a7603415e3e7f4af6b0',
    }, {
      label: 'Sankhla official contact page', url: 'https://www.sankhlaindustries.com/blank-1',
    }],
  },
  'indigrow-brimpton': {
    website: 'https://www.indigrow.com/',
    contactPage: 'https://www.indigrow.com/contact/',
    contacts: [],
    departmentEmails: [{
      department: 'Technical', email: 'aghort@indigrow.com',
      source: { label: 'Indigrow public agricultural and horticultural technical contact', url: 'https://www.indigrow.com/wp-content/uploads/2020/08/Indigrow-Catalogue-2021-FINAL-UK-Version-email.pdf' },
    }],
    address: 'The Old Bakery, Hyde End Lane, Brimpton, Berkshire RG7 4RH, United Kingdom',
    sources: [{
      label: 'Indigrow announcement: UK manufacture of Impact CGF resin-coated urea fertilizers', url: 'https://www.indigrow.com/new-impact-cgf-resin-coated-urea-fertilisers/',
    }, {
      label: 'Indigrow public contact page', url: 'https://www.indigrow.com/contact/',
    }, {
      label: 'Indigrow agricultural and horticultural technical contact', url: 'https://www.indigrow.com/wp-content/uploads/2020/08/Indigrow-Catalogue-2021-FINAL-UK-Version-email.pdf',
    }],
  },
  'lebanon-seaboard-lebanon': {
    website: 'https://www.lebsea.com/',
    contactPage: 'https://www.lebsea.com/contact-us/',
    contacts: [{
      name: 'Katherine Bishop', title: 'President, CEO and Chairperson', department: 'Management',
      source: { label: 'Lebanon Seaboard public personnel page', url: 'https://www.lebsea.com/about-us/personnel/' }, verifiedAt: '2026-09-28',
    }],
    departmentEmails: [{
      department: 'General', email: 'Purchasing@lebsea.com',
      source: { label: 'Lebanon Seaboard public Purchasing department contact', url: 'https://www.lebsea.com/about-us/personnel/' },
    }, {
      department: 'Production', email: 'Operations@lebsea.com',
      source: { label: 'Lebanon Seaboard public Operations department contact', url: 'https://www.lebsea.com/about-us/personnel/' },
    }],
    address: '1600 E. Cumberland St., Lebanon, PA 17042, United States',
    sources: [{
      label: 'Lebanon Seaboard professional division: producer of advanced controlled-release fertilizers', url: 'https://www.lebsea.com/professional/professional-division-overview/',
    }, {
      label: 'LebanonTurf PCU controlled-release fertilizer technology', url: 'https://www.lebanonturf.com/technologies/pcu',
    }, {
      label: 'Lebanon Seaboard public Purchasing, Operations and leadership contacts', url: 'https://www.lebsea.com/about-us/personnel/',
    }, {
      label: 'Lebanon Seaboard official contact page', url: 'https://www.lebsea.com/contact-us/',
    }],
  },
  'follmann-minden': {
    website: 'https://www.follmann.com/',
    contactPage: 'https://www.follmann.com/en/contact',
    contacts: [{
      name: 'Roland Geiselhart', title: 'Director Business Unit Print + Packaging', department: 'Technical',
      source: { label: 'Follmann public news release naming Print + Packaging business-unit director', url: 'https://www.follmann.com/en/news/follmann-cleaner' }, verifiedAt: '2026-09-28',
    }],
    departmentEmails: [{
      department: 'Technical', email: 'printinginks@follmann.com',
      source: { label: 'Follmann water-based printing-ink application guide', url: 'https://www.follmann.com/sites/default/files/2021-12/Application_guide_water-based_printing_inks_Corrugated_postprint.pdf' },
    }],
    address: 'Heinrich-Follmann-Str. 1, 32423 Minden, Germany',
    sources: [{
      label: 'Follmann water-based coatings for PP, PE and PET films', url: 'https://www.follmann.com/en/water-based-coatings',
    }, {
      label: 'Follmann water-based printing inks', url: 'https://www.follmann.com/en/printing-inks',
    }, {
      label: 'Follmann public contact page', url: 'https://www.follmann.com/en/contact',
    }, {
      label: 'Follmann public Print + Packaging business-unit director', url: 'https://www.follmann.com/en/news/follmann-cleaner',
    }],
  },
  'mapei-india-bengaluru': {
    website: 'https://www.mapei.com/in/en/',
    contactPage: 'https://www.mapei.com/in/en/contact-us',
    contacts: [{
      name: 'Vasudevan MK', title: 'Procurement', department: 'Procurement',
      source: { label: 'Mapei India official Procurement contact', url: 'https://www.mapei.com/in/en/contact-us' }, verifiedAt: '2026-09-28',
    }, {
      name: 'Alok Shrivastava', title: 'Vice President Operations', department: 'Production', phone: '+91 9726420707',
      source: { label: 'Mapei India official Operations contact', url: 'https://www.mapei.com/in/en/contact-us' }, verifiedAt: '2026-09-28',
    }, {
      name: 'Santhosh M Prakash', title: 'Vice President - Product Management (BL)', department: 'Technical', phone: '+91 9483540424',
      source: { label: 'Mapei India official Product Management contact', url: 'https://www.mapei.com/in/en/contact-us' }, verifiedAt: '2026-09-28',
    }],
    departmentEmails: [],
    address: 'A01, B01, 1st Floor, Solus Jain Heights, JC Road 1st Cross, Bengaluru, Karnataka 560002, India',
    sources: [{
      label: 'Mapei India official contact page: adhesives, sealants, Bangalore factory and functional leads', url: 'https://www.mapei.com/in/en/contact-us',
    }, {
      label: 'Mapei official sealing, bonding and anchoring product line', url: 'https://www.mapei.com/it/en/products-and-solutions/lines/elastic-sealants-and-adhesives',
    }],
  },
  'plantacote-herentals': {
    website: 'https://www.plantacote.com/',
    contacts: [],
    departmentEmails: [{
      department: 'General', email: 'info@plantacote.com',
      source: { label: 'Plantacote official product brochure company contact', url: 'https://uploads-ssl.webflow.com/59e265717032510001bb81cc/649cae409f1c19656549325f_Plantacote_Brochure_EN_2023.pdf' },
    }],
    address: 'Atealaan 34a, 2200 Herentals, Belgium',
    sources: [{
      label: 'Plantacote official brochure: 100% coated NPK and controlled-release fertilizer products', url: 'https://uploads-ssl.webflow.com/59e265717032510001bb81cc/649cae409f1c19656549325f_Plantacote_Brochure_EN_2023.pdf',
    }, {
      label: 'RHP certification: Plantacote controlled-release fertilizer production', url: 'https://www.rhp.nl/en/rhp-certification-for-plantacote-nv',
    }],
  },
  'siegwerk-siegburg': {
    website: 'https://www.siegwerk.com/',
    contactPage: 'https://www.siegwerk.com/en/contact.html',
    contacts: [],
    departmentEmails: [{
      department: 'Technical', email: 'contact.inkjet@siegwerk.com',
      source: { label: 'Siegwerk official inkjet product flyer technical contact', url: 'https://www.siegwerk.com/fileadmin/Data/Products/Colorseries/Inkjet/SICURA_NutriJet_LMX_Flyer.pdf' },
    }],
    address: 'Alfred-Keller-Strasse 55, 53721 Siegburg, Germany',
    sources: [{
      label: 'Siegwerk official white paper: water-based inkjet inks for non-absorbing films', url: 'https://www.siegwerk.com/fileadmin/Data/Documents/Publications/Whitepaper/SW_WhitePaperINKJet_210x297mm_RZ_digital.pdf',
    }, {
      label: 'Siegwerk water-based coatings for PE, OPP, PET and aluminum film', url: 'https://www.siegwerk.com/de/news-medien/pressemitteilungen/details/siegwerk-enables-antimicrobial-coatings-for-film-application-using-the-lock-3-technology.html',
    }, {
      label: 'Siegwerk official contact page', url: 'https://www.siegwerk.com/en/contact.html',
    }, {
      label: 'Siegwerk official locations page', url: 'https://www.siegwerk.com/en/company/locations.html',
    }],
  },
  'jowat-detmold': {
    website: 'https://www.jowat.com/en/',
    contacts: [],
    departmentEmails: [{
      department: 'General', email: 'info@jowat.de',
      source: { label: 'Jowat official company contact', url: 'https://www.jowat.com/en/' },
    }],
    address: 'Ernst-Hilker-Strasse 10-14, 32758 Detmold, Germany',
    sources: [{
      label: 'Jowat official company site: industrial adhesive manufacturer and public contact', url: 'https://www.jowat.com/en/',
    }, {
      label: 'Jowat official reactive adhesive product portfolio', url: 'https://www.jowat.com/en/adhesives/reactive-adhesives/',
    }],
  },
  'knox-fertilizer-knox': {
    website: 'https://www.knoxfert.com/',
    contactPage: 'https://www.knoxfert.com/contact-us/',
    contacts: [],
    departmentEmails: [{
      department: 'General', email: 'info@knoxfert.com',
      source: { label: 'Knox Fertilizer official contact page', url: 'https://www.knoxfert.com/contact-us/' },
    }],
    address: '2660 E 100 S, Knox, IN 46534, United States',
    sources: [{
      label: 'Knox Fertilizer official SurfCote polymer-resin coating catalog', url: 'https://www.knoxfert.com/wp-content/uploads/2019/11/GroFine-Catalog-2019RevisePages.pdf',
    }, {
      label: 'Knox Fertilizer official manufacturing and company profile', url: 'https://www.knoxfert.com/about/',
    }, {
      label: 'Knox Fertilizer current controlled-release professional products', url: 'https://www.knoxfert.com/professional-brands/',
    }, {
      label: 'Knox Fertilizer official contact page', url: 'https://www.knoxfert.com/contact-us/',
    }],
  },
  'andersons-maumee': {
    website: 'https://andersonspro.com/',
    contactPage: 'https://andersonspro.com/get-started',
    contacts: [],
    departmentEmails: [{
      department: 'General', email: 'lawnlogistics@andersonsinc.com',
      source: { label: 'The Andersons Professional Turf customer service', url: 'https://andersonspro.com/get-started' },
    }],
    address: '1947 Briarfield Blvd., Maumee, OH 43537, United States',
    sources: [{
      label: 'The Andersons CarbonCoat polymer-coated humic-coated urea product label', url: 'https://assets.theandersons.com/m/20f80e4eb69d7058/original/10008031.pdf',
    }, {
      label: 'The Andersons official professional catalog: fertilizer plant and manufacturing history', url: 'https://assets.theandersons.com/m/6bafaa20710b0758/original/Andersons-Pro-Catalog_web.pdf',
    }, {
      label: 'The Andersons Professional Turf contact and customer-service page', url: 'https://andersonspro.com/get-started',
    }],
  },
  'doneck-euroflex-grevenmacher': {
    website: 'https://www.doneck.com/',
    contactPage: 'https://www.doneck.com/contact',
    contacts: [{
      name: 'Edgar Becker', title: 'Managing Director Sales', department: 'Sales',
      source: { label: 'Doneck Euroflex official company network management listing', url: 'https://www.doneck.com/company/doneck-network' }, verifiedAt: '2026-09-28',
    }],
    departmentEmails: [{
      department: 'General', email: 'euroflex@doneck.com',
      source: { label: 'Doneck Euroflex official legal notice and company contact', url: 'https://www.doneck.com/legal-notice-1' },
    }],
    address: '4, an de Längten, L-6776 Grevenmacher, Luxembourg',
    sources: [{
      label: 'Doneck Euroflex water-based Euro-Film inks with PE/PP adhesion', url: 'https://www.doneck.com/products/water-based-inks/euro-film-wfk/wff',
    }, {
      label: 'Doneck Euroflex R&D and raw-material selection', url: 'https://www.doneck.com/service/research-development',
    }, {
      label: 'Doneck Euroflex official company network and management', url: 'https://www.doneck.com/company/doneck-network',
    }, {
      label: 'Doneck Euroflex official contact page', url: 'https://www.doneck.com/contact',
    }],
  },
  'wikoff-fort-mill': {
    website: 'https://wikoff.com/',
    contactPage: 'https://wikoff.com/contact-us/',
    contacts: [{
      name: 'Sachin Nayar', title: 'Chief Technology Officer', department: 'Technical',
      source: { label: 'Wikoff official CTO appointment and leadership page', url: 'https://wikoff.com/news/wikoff-names-sachin-nayar-chief-technology-officer/' }, verifiedAt: '2026-09-28',
    }, {
      name: 'David Donnelly', title: 'Chief Operations Officer', department: 'Production',
      source: { label: 'Wikoff official current leadership team', url: 'https://wikoff.com/leadership/' }, verifiedAt: '2026-09-28',
    }],
    departmentEmails: [{
      department: 'General', email: 'contact@wikoff.com',
      source: { label: 'Wikoff official contact page', url: 'https://wikoff.com/contact-us/' },
    }],
    address: '1886 Merritt Road, Fort Mill, SC 29715, United States',
    sources: [{
      label: 'Wikoff water-based ink systems for HDPE, LDPE, polypropylene, BOPP and PET', url: 'https://wikoff.com/products/',
    }, {
      label: 'Wikoff official current leadership team', url: 'https://wikoff.com/leadership/',
    }, {
      label: 'Wikoff official CTO appointment', url: 'https://wikoff.com/news/wikoff-names-sachin-nayar-chief-technology-officer/',
    }, {
      label: 'Wikoff official contact page', url: 'https://wikoff.com/contact-us/',
    }],
  },
  'aurora-material-streetsboro': {
    website: 'https://www.auroramaterialsolutions.com/',
    contactPage: 'https://www.auroramaterialsolutions.com/contact-aurora-material-solutions/',
    contacts: [{
      name: 'Chris Coco', title: 'Business Development Manager, Flexible PVC', department: 'Sales', phone: '+1 603-315-6106',
      source: { label: 'Aurora official flexible PVC sales representatives', url: 'https://www.auroramaterialsolutions.com/locate-sales-representative/flexible-engineered-compounds/' }, verifiedAt: '2026-09-28',
    }],
    departmentEmails: [],
    address: '9280 Jefferson St., Streetsboro, OH 44241, United States',
    sources: [{
      label: 'Aurora flexible PVC formulation and plasticizer-system optimization', url: 'https://www.auroramaterialsolutions.com/pvc-polyvinyl-chloride-compounds/',
    }, {
      label: 'Aurora company profile and R&D raw-material work', url: 'https://www.auroramaterialsolutions.com/company/about-aurora-material-solutions/',
    }, {
      label: 'Aurora official flexible PVC business-development contact', url: 'https://www.auroramaterialsolutions.com/locate-sales-representative/flexible-engineered-compounds/',
    }, {
      label: 'Aurora official contact page and technical-center address', url: 'https://www.auroramaterialsolutions.com/contact-aurora-material-solutions/',
    }],
  },
  'sun-agro-tokyo': {
    website: 'https://www.sunagro.co.jp/',
    contactPage: 'https://www.sunagro.co.jp/contact/',
    contacts: [{
      name: '矢作 真也', title: 'President; responsible for Product Development Office', department: 'Technical',
      source: { label: 'Sun Agro official company profile and current officers', url: 'https://www.sunagro.co.jp/company/profile/' }, verifiedAt: '2026-09-28',
    }, {
      name: '田守 隆宏', title: 'Director, Head of Manufacturing; Osaka Plant Manager', department: 'Production',
      source: { label: 'Sun Agro official company profile and current officers', url: 'https://www.sunagro.co.jp/company/profile/' }, verifiedAt: '2026-09-28',
    }, {
      name: '大庭 樹', title: 'Deputy Head of Sales; Head of Raw Materials Strategy Group', department: 'Procurement',
      source: { label: 'Sun Agro official company profile and current officers', url: 'https://www.sunagro.co.jp/company/profile/' }, verifiedAt: '2026-09-28',
    }],
    departmentEmails: [{
      department: 'General', email: 'info@sunagro.co.jp',
      source: { label: 'Sun Agro official enquiry page', url: 'https://www.sunagro.co.jp/contact/' },
    }],
    address: 'Nihonbashi Koamicho Square Building 3F, 17-10 Nihonbashi Koamicho, Chuo-ku, Tokyo 103-0016, Japan',
    sources: [{
      label: 'Sun Agro sulfur-coated fertilizer products and coating construction', url: 'https://www.sunagro.co.jp/pickup/fertilizer/',
    }, {
      label: 'Sun Agro fertilizer lineup including sulfur-coated urea and compounds', url: 'https://www.sunagro.co.jp/fertilizer/lineup/',
    }, {
      label: 'Sun Agro current officers and raw-material strategy responsibility', url: 'https://www.sunagro.co.jp/company/profile/',
    }, {
      label: 'Sun Agro offices, plants and product-development contacts', url: 'https://www.sunagro.co.jp/company/office/',
    }, {
      label: 'Sun Agro official enquiry page and public email', url: 'https://www.sunagro.co.jp/contact/',
    }],
  },
  'katakura-coop-akita': {
    website: 'https://www.katakuraco-op.com/',
    contactPage: 'https://www.katakuraco-op.com/contact/',
    contacts: [{
      name: '星野 訓', title: 'Executive Officer, Head of Production Technology Headquarters', department: 'Production',
      source: { label: 'Katakura official 2026 organization and personnel announcement', url: 'https://www.katakuraco-op.com/dl/1175/5992a36f48359b338b9cef0eab85d6dd' }, verifiedAt: '2026-09-28',
    }, {
      name: '丹波 進', title: 'Akita Plant Manager', department: 'Production',
      source: { label: 'Katakura official 2026 organization and personnel announcement', url: 'https://www.katakuraco-op.com/dl/1175/5992a36f48359b338b9cef0eab85d6dd' }, verifiedAt: '2026-09-28',
    }, {
      name: '一條 龍男', title: 'Director and Senior Executive Officer, Head of Fertilizer Headquarters', department: 'Production',
      source: { label: 'Katakura official 2026 organization and personnel announcement', url: 'https://www.katakuraco-op.com/dl/1175/5992a36f48359b338b9cef0eab85d6dd' }, verifiedAt: '2026-09-28',
    }],
    departmentEmails: [],
    address: '3-1-6 Barajima, Akita-shi, Akita 010-0065, Japan',
    sources: [{
      label: 'Katakura fertilizer business and coated-urea compound fertilizers', url: 'https://www.katakuraco-op.com/business/fertilizer/',
    }, {
      label: 'Katakura history: coating-fertilizer equipment installed at Akita plant', url: 'https://www.katakuraco-op.com/profile/history_coop.html',
    }, {
      label: 'Katakura current Akita fertilizer plant and production-technology contacts', url: 'https://www.katakuraco-op.com/profile/network.html',
    }, {
      label: 'Katakura 2026 production and fertilizer leadership announcement', url: 'https://www.katakuraco-op.com/dl/1175/5992a36f48359b338b9cef0eab85d6dd',
    }, {
      label: 'Katakura official enquiry form', url: 'https://www.katakuraco-op.com/contact/',
    }],
  },
  'gefink-burzaco': {
    website: 'https://gefink.com.ar/',
    contactPage: 'https://www.gefink.com.ar/en/contact/',
    contacts: [],
    departmentEmails: [{
      department: 'General', email: 'info@gefink.com.ar',
      source: { label: 'Gefink official contact page', url: 'https://www.gefink.com.ar/en/contact/' },
    }],
    address: 'J. Melián 3275, Parque Industrial Almirante Brown, Burzaco, Buenos Aires 1852, Argentina',
    sources: [{
      label: 'Gefink GEF.WATER water-based inks for PE film and PP flexography', url: 'https://gefink.com.ar/en/products/',
    }, {
      label: 'Gefink official company profile', url: 'https://gefink.com.ar/en/about-us/',
    }, {
      label: 'Gefink official contact page and public email', url: 'https://www.gefink.com.ar/en/contact/',
    }],
  },
  'colorprint-coseano': {
    website: 'https://www.colorprint.it/',
    contactPage: 'https://www.colorprint.it/en/contacts',
    contacts: [],
    departmentEmails: [{
      department: 'General', email: 'colorprint@colorprint.it',
      source: { label: 'Colorprint official water-based flexo page and footer contact', url: 'https://www.colorprint.it/en/products/water-based-flexo' },
    }],
    address: 'Via dell’Artigianato 5, 33030 Coseano UD, Italy',
    sources: [{
      label: 'Colorprint water-based Idropol flexo inks for polyethylene', url: 'https://www.colorprint.it/en/products/water-based-flexo',
    }, {
      label: 'Colorprint official company profile', url: 'https://www.colorprint.it/en/about-us',
    }, {
      label: 'Colorprint official ink-manufacturing capabilities', url: 'https://www.colorprint.it/en/ink-manufacturing',
    }, {
      label: 'Colorprint official contact page', url: 'https://www.colorprint.it/en/contacts',
    }],
  },
  'manner-polymers-mckinney': {
    website: 'https://mannerpolymers.com/',
    contactPage: 'https://mannerpolymers.com/contact/',
    contacts: [],
    departmentEmails: [{
      department: 'Technical', email: 'TechServ@mannerpolymers.com',
      source: { label: 'Manner Polymers official contact page', url: 'https://mannerpolymers.com/contact/' },
    }, {
      department: 'Sales', email: 'sales@mannerpolymers.com',
      source: { label: 'Manner Polymers official contact page', url: 'https://mannerpolymers.com/contact/' },
    }],
    address: '500 Interchange Street, McKinney, TX 75071, United States',
    sources: [{
      label: 'Manner Polymers flexible and custom PVC manufacturing capabilities', url: 'https://mannerpolymers.com/flexible-custom-pvc-compounds/',
    }, {
      label: 'Manner Polymers R&D formulation and product-testing role', url: 'https://mannerpolymers.com/careers/rd-technical-associate/',
    }, {
      label: 'Manner Polymers official technical-service and sales contacts', url: 'https://mannerpolymers.com/contact/',
    }],
  },
  'vernital-cercola': {
    website: 'https://www.vernital.it/',
    contactPage: 'https://www.vernital.it/contatti/',
    contacts: [],
    departmentEmails: [{ department: 'Sales', email: 'commerciale@vernital.it', source: { label: 'Vernital official contacts', url: 'https://www.vernital.it/contatti/' } }],
    address: 'Via A. De Curtis 4, 80040 Cercola (NA), Italy',
    sources: [
      { label: 'Vernital company R&D and production facilities', url: 'https://www.vernital.it/azienda/' },
      { label: 'Vernital industrial and marine anticorrosion epoxy coating', url: 'https://www.vernital.it/i-nostri-prodotti/prodotti-anticorrosivi-per-lindustria/surface-tolerant/vernitex-bianco/' },
      { label: 'Vernital official contacts', url: 'https://www.vernital.it/contatti/' },
      { label: 'Independent ELO anticorrosion-coating research, not evidence of Vernital ELO use', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8588247/' },
    ],
  },
  'duramax-cascavel': {
    website: 'https://duramaxtintas.ind.br/',
    contactPage: 'https://duramaxtintas.ind.br/sobre/',
    contacts: [],
    departmentEmails: [{ department: 'Sales', email: 'comercial@duramaxtintas.ind.br', source: { label: 'Duramax official company and commercial contact', url: 'https://duramaxtintas.ind.br/sobre/' } }],
    address: 'R. Sergio Gaspareto 423, Cascavel, Paraná 85804-608, Brazil',
    sources: [
      { label: 'Duramax company manufacturing and research', url: 'https://duramaxtintas.ind.br/sobre/' },
      { label: 'Duramax heavy-duty anticorrosion epoxy coating product', url: 'https://duramaxtintas.ind.br/produtos/dupla-funcao-maxdual/epoxi-hs-poliamina-dupla-funcao/' },
      { label: 'Independent ELO anticorrosion-coating research, not evidence of Duramax ELO use', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8588247/' },
    ],
  },
  'marincoat-calvignasco': {
    website: 'https://www.marincoat.com/',
    contactPage: 'https://www.marincoat.com/',
    contacts: [],
    departmentEmails: [{ department: 'Sales', email: 'sales@marincoat.it', source: { label: 'MARINCOAT official homepage business contacts', url: 'https://www.marincoat.com/' } }],
    address: 'Via dell’Industria 12, 20080 Calvignasco (MI), Italy',
    sources: [{ label: 'MARINCOAT official homepage: coating formulation, production and contact details', url: 'https://www.marincoat.com/' }],
  },
  'rynan-smart-fertilizers-long-duc': {
    website: 'https://rynanagriculture.com/',
    contactPage: 'https://rynanagriculture.com/contact-us',
    generalEmail: 'info@rynanagriculture.com',
    contacts: [],
    departmentEmails: [{ department: 'General', email: 'info@rynanagriculture.com', source: { label: 'RYNAN Smart Agriculture official general business inbox (Singapore/Vietnam offices)', url: 'https://rynanagriculture.com/contact-us' } }],
    address: 'Long Duc Industrial Park, Long Duc Ward, Vinh Long Province, Vietnam',
    sources: [
      { label: 'RYNAN official general business contact; verified 2026-10-10', url: 'https://rynanagriculture.com/contact-us' },
      { label: 'RYNAN Agriculture smart-fertilizer manufacturing and polymer-coating technology', url: 'https://rynanagriculture.com/rynan-smart-fertilizers' },
      { label: 'RYNAN Smart Fertilizers official Vietnam contact page', url: 'https://rynan.vn/lien-he' },
      { label: 'Vietnam News Agency: RYNAN Smart Fertilizers Long Duc coated-fertilizer plant', url: 'https://en.vietnamplus.vn/vietnams-first-smart-fertilizer-factory-opened-in-tra-vinh-post124844.vnp' },
    ],
  },
  'pungnong-seoul': {
    website: 'https://www.npko.co.kr/eng/',
    contactPage: 'https://www.npko.co.kr/eng/',
    contacts: [],
    departmentEmails: [],
    address: '8 Mapo-daero, Mapo-gu, Seoul 04176, Republic of Korea',
    sources: [
      { label: 'Pungnong official second-factory controlled-release compound fertilizer production', url: 'https://www.npko.co.kr/eng/s1/s1_1_5.php' },
      { label: 'Pungnong official all-coat controlled-release fertilizer development history', url: 'https://www.npko.co.kr/eng/s1/s1_1_4.php' },
      { label: 'Pungnong official raw-material import status and public company contact', url: 'https://www.npko.co.kr/eng/s6/s6_1.php' },
      { label: 'Pungnong official All-Coating Hanpolo coated-fertilizer product news', url: 'https://www.npko.co.kr/bbs/board.php?bo_table=s4_1_2&wr_id=12' },
    ],
  },
  'ec-grow-eau-claire': {
    website: 'https://ecgrow.com/',
    contactPage: 'https://ecgrow.com/index.php/contact-ec-grow/',
    contacts: [{
      name: 'Joe Ernst', title: 'Director of Professional Sales (title stated in 2021 official facility announcement)', department: 'Sales',
      source: { label: 'EC Grow official polymer-coating facility announcement', url: 'https://ecgrowproturf.com/index.php/2021/01/22/ec-grow-inc-plans-to-offer-a-new-polymer-coated-urea-by-fall-2021/' }, verifiedAt: '2026-09-29',
    }],
    departmentEmails: [],
    address: '4970 Kane Road, Eau Claire, WI 54703, United States',
    sources: [
      { label: 'EC Grow official polymer-coating facility announcement', url: 'https://ecgrowproturf.com/index.php/2021/01/22/ec-grow-inc-plans-to-offer-a-new-polymer-coated-urea-by-fall-2021/' },
      { label: 'EC Grow current EPEC polymer-coated urea product and manufacturing statement', url: 'https://ecgrowproturf.com/' },
      { label: 'EC Grow official corporate contact page', url: 'https://ecgrow.com/index.php/contact-ec-grow/' },
      { label: '2025 industry directory listing Joe Ernst as an EC Grow employee', url: 'https://www.mnla.biz/members/?id=25522495' },
    ],
  },
  'sumika-agro-niihama': {
    website: 'https://www.sumika-agro.co.jp/',
    contactPage: 'https://www.sumika-agro.co.jp/contact.html',
    contacts: [],
    departmentEmails: [{ department: 'General', email: 'toiawase@sumika-agro.co.jp', source: { label: 'Sumika Agro Manufacturing official enquiry page', url: 'https://www.sumika-agro.co.jp/contact.html' } }],
    address: '5-1 Sobirakicho, Niihama, Ehime 792-0001, Japan',
    sources: [
      { label: 'Sumika Agro Manufacturing official Ehime coated-fertilizer plant and coating-material tanks', url: 'https://www.sumika-agro.co.jp/brunch.html' },
      { label: 'Sumika Agro Manufacturing official coated-fertilizer product examples', url: 'https://www.sumika-agro.co.jp/product.html' },
      { label: 'Sumika Agro Manufacturing company profile and contract-manufacturing business', url: 'https://www.sumika-agro.co.jp/profile.html' },
      { label: 'Sumika Agro Manufacturing official enquiry email and telephone', url: 'https://www.sumika-agro.co.jp/contact.html' },
    ],
  },
  'nousbo-ulsan': {
    website: 'https://global.nousbo.com/',
    contactPage: 'https://global.nousbo.com/contact-us/',
    contacts: [],
    departmentEmails: [{ department: 'General', email: 'nousbo@nousbo.com', source: { label: 'NOUSBO official company brochure', url: 'https://www.nousbo.com/download/brochure_jp.pdf' } }],
    address: '106 Daejung-ro, Onsan-eup, Ulju-gun, Ulsan 45010, Republic of Korea',
    sources: [
      { label: 'NOUSBO official CRF manufacturing technology and Ulsan production lines', url: 'https://global.nousbo.com/technology/crf-manufacturing/' },
      { label: 'NOUSBO official production and R&D network', url: 'https://global.nousbo.com/company/global-agriculture-business/' },
      { label: 'NOUSBO official global network and in-house polymer statement', url: 'https://global.nousbo.com/ko/company/global-network/' },
      { label: 'NOUSBO official company brochure with public email, plant and headquarters contacts', url: 'https://www.nousbo.com/download/brochure_jp.pdf' },
      { label: 'NOUSBO official customer inquiry page', url: 'https://global.nousbo.com/contact-us/' },
    ],
  },
  'dupan-anugerah-lestari-pungging': {
    website: 'https://pupindo.id/',
    contactPage: 'https://pupindo.id/contact-us/',
    contacts: [],
    departmentEmails: [],
    address: 'Kompleks Industri Saraswanti, Jl. Raden Patah, Desa Lebaksono, Kecamatan Pungging, Mojokerto, East Java, Indonesia',
    sources: [
      { label: 'PUPINDO official product and coating-process description', url: 'https://pupindo.id/product/' },
      { label: 'PUPINDO official factory and head-office contact page', url: 'https://pupindo.id/contact-us/' },
      { label: 'Saraswanti Group Dupan brochure with historical public company email (reconfirm before outreach)', url: 'https://saraswantifertilizer.com/wp-content/uploads/2021/02/Brosur-Pupindo-Sawit.pdf' },
    ],
  },
  'hanampi-sejahtera-kahuripan-gresik': {
    website: 'https://hanampi.com/',
    contactPage: 'https://hanampi.com/contact',
    generalEmail: 'bizteam@hanampi.com',
    generalPhone: '+62 31 3930722',
    contacts: [],
    departmentEmails: [{ department: 'General', email: 'bizteam@hanampi.com', source: { label: 'Hanampi official contact page', url: 'https://hanampi.com/contact' } }],
    address: 'Beta Maspion Blok I, Kawasan Industri Maspion, Jalan Manyar KM 25, Desa Manyar Sidomukti, Gresik 61151, East Java, Indonesia',
    sources: [
      { label: 'Hanampi official Haracoat sulfur-and-polymer coated urea description', url: 'https://hanampi.com/home' },
      { label: 'Hanampi official company profile and manufacturing statement', url: 'https://hanampi.com/home/profil' },
      { label: 'Hanampi official coated-urea product catalog', url: 'https://hanampi.com/product' },
      { label: 'Gresik government 2023 factory directory listing SCU production', url: 'https://dpmptsp.gresikkab.go.id/ebook/e13/DIREKTORI%20PERUSAHAAN%20KABUPATEN%20GRESIK%20TAHUN%202023.pdf' },
      { label: 'Hanampi official public contact details', url: 'https://hanampi.com/contact' },
    ],
  },
  'dgo-defix-phu-nghia': {
    website: 'https://defix.vn/',
    contactPage: 'https://defix.vn/gioi-thieu/',
    contacts: [],
    departmentEmails: [{ department: 'General', email: 'dgotmdt@gmail.com', source: { label: 'DEFIX official company introduction and contact details', url: 'https://defix.vn/gioi-thieu/' } }],
    address: 'Lot CN2, Phu Nghia Industrial Park, Chuong My, Hanoi, Vietnam',
    sources: [
      { label: 'DEFIX official marine anticorrosion coating range', url: 'https://defix.vn/' },
      { label: 'DEFIX/DGO official factory and public contact', url: 'https://defix.vn/gioi-thieu/' },
      { label: 'DGO Group official coating formulation and raw-material production process', url: 'https://dgo.com.vn/quy-trinh-san-xuat-son-tai-dgo-group-dien-ra-nhu-the-nao/' },
    ],
  },
  'son-mien-bac-hung-yen': {
    website: 'https://sonmienbac.com.vn/',
    contactPage: 'https://sonmienbac.com.vn/lien-he/',
    contacts: [],
    departmentEmails: [{ department: 'General', email: 'sonmienbac.vn@gmail.com', source: { label: 'Sơn Miền Bắc official contact page', url: 'https://sonmienbac.com.vn/lien-he/' } }],
    address: 'Luc Dien, Viet Yen, Hung Yen, Vietnam',
    sources: [
      { label: 'Sơn Miền Bắc official factory, manufacturing and anticorrosion product overview', url: 'https://sonmienbac.com.vn/xuong-san-xuat-son-mien-bac/' },
      { label: 'Sơn Miền Bắc official contact page', url: 'https://sonmienbac.com.vn/lien-he/' },
    ],
  },
  'dolphin-inks-thane': {
    website: 'https://dolphininks.com/',
    contactPage: 'https://dolphininks.com/contact-us/',
    contacts: [],
    departmentEmails: [
      { department: 'General', email: 'info@dolphininks.com', source: { label: 'Dolphin Inks official contact page', url: 'https://dolphininks.com/contact-us/' } },
      { department: 'Sales', email: 'sales@dolphininks.com', source: { label: 'Dolphin Inks official contact page', url: 'https://dolphininks.com/contact-us/' } },
    ],
    address: 'A 426, Lodha Supremus 2, Wagle Industrial Estate, Thane 400604, Maharashtra, India',
    sources: [
      { label: 'Dolphin Inks official PP/PE water-based ink product catalog', url: 'https://dolphininks.com/product/' },
      { label: 'Dolphin Inks official manufacturing and formulation overview', url: 'https://dolphininks.com/' },
      { label: 'Dolphin Inks official contact page', url: 'https://dolphininks.com/contact-us/' },
    ],
  },
  'toa-paint-products-nilai': {
    website: 'https://toagroup.com.my/',
    contactPage: 'https://toagroup.com.my/contact-us/',
    contacts: [],
    departmentEmails: [{ department: 'General', email: 'toa@toagroup.com.my', source: { label: 'TOA Group official Malaysian subsidiary listing', url: 'https://www.toagroup.com/en/about-toa/company-info/toa-group-of-companies' } }],
    address: 'Lot 21, Jalan Nilam 3, Nilai Utama Enterprise Park, 71800 Nilai, Negeri Sembilan, Malaysia',
    sources: [
      { label: 'TOA Malaysia Heavyguard Epoguard Enamel protective epoxy topcoat', url: 'https://toagroup.com.my/product/heavyguard-epoguard-enamel-part-a/' },
      { label: 'TOA Malaysia manufacturing and heavy-duty coatings overview', url: 'https://toagroup.com.my/toa-paint-products-sdn-bhd-in-malaysia/' },
      { label: 'MIDA report on Nilai paint production and local formulation R&D', url: 'https://www.mida.gov.my/mida-news/toa-paint-ramping-up-production-capacity-while-keeping-prices-stable/' },
      { label: 'TOA Malaysia official office and Nilai factory contacts', url: 'https://toagroup.com.my/contact-us/' },
      { label: 'TOA Group official Malaysian subsidiary listing and public email', url: 'https://www.toagroup.com/en/about-toa/company-info/toa-group-of-companies' },
    ],
  },
  'jotun-paints-malaysia-shah-alam': {
    website: 'https://www.jotun.com/my-en',
    contactPage: 'https://www.jotun.com/my-en/about-jotun/supplier-information/contact-us-suppliers',
    generalPhone: '+60 3 5123 5500',
    contacts: [],
    departmentEmails: [],
    address: 'Lot 7, Persiaran Perusahaan, Section 23, 40300 Shah Alam, Selangor, Malaysia',
    sources: [
      { label: 'Jotun Malaysia Jotamastic 87 anticorrosive epoxy primer', url: 'https://www.jotun.com/my-en/products-and-services/products/Jotamastic-87' },
      { label: 'Jotun R&D network: Shah Alam factory, protective-coatings formulation and alternative-raw-material evaluation', url: 'https://www.jotun.com/ww-en/our-commitment/innovation-and-technology/overview/articles/rd-network-from-local-to-global' },
      { label: 'Jotun supplier contact information for Malaysia', url: 'https://www.jotun.com/my-en/about-jotun/supplier-information/contact-us-suppliers' },
      { label: 'Jotun Malaysia official head-office address', url: 'https://www.jotun.com/my-en/decorative/our-services/contact-us' },
      { label: 'Jotun official Malaysian protective-coatings office phone', url: 'https://cp.jotun.com/siteassetsjot03/_b2b/product-brochures/marathon-1000-brochure.pdf' },
    ],
  },
  'mc-ferticom-tokyo': {
    website: 'https://www.mcferticom.jp/english/',
    contactPage: 'https://www.mcferticom.jp/english/inquiry/',
    generalEmail: 'mcfcqa.overseas@mcferticom.jp',
    generalPhone: '+81-3-3263-8530',
    contacts: [{
      name: 'Tetsuya Kuroda', title: 'President and CEO', department: 'Management',
      source: { label: 'MC Ferticom official president message', url: 'https://www.mcferticom.jp/english/company/greeting.html' }, verifiedAt: '2026-10-10',
    }],
    departmentEmails: [{ department: 'General', email: 'mcfcqa.overseas@mcferticom.jp', source: { label: 'MC Ferticom official overseas enquiry page', url: 'https://www.mcferticom.jp/english/inquiry/' } }],
    address: '4th Floor, Kojimachi Koyo Building, 10 Kojimachi 1-Chome, Chiyoda-ku, Tokyo 102-0083, Japan',
    sources: [
      { label: 'MC Ferticom official statement of coated controlled-release fertilizer manufacturing', url: 'https://www.mcferticom.jp/english/company/greeting.html' },
      { label: 'MC Ferticom official coated-urea fertilizer product category', url: 'https://www.mcferticom.jp/english/commodity/' },
      { label: 'MC Ferticom official history of coated-fertilizer plant construction and expansion', url: 'https://www.mcferticom.jp/company/history.html' },
      { label: 'MC Ferticom official fertilizer-nutrient raw-material sales (supplier exclusion check)', url: 'https://www.mcferticom.jp/introduction/export.html' },
      { label: 'MC Ferticom official chemical sales (supplier exclusion check)', url: 'https://www.mcferticom.jp/introduction/chemical.html' },
      { label: 'MC Ferticom official overseas business contact', url: 'https://www.mcferticom.jp/english/inquiry/' },
      { label: 'MC Ferticom official head-office address', url: 'https://www.mcferticom.jp/english/company/outline.html' },
    ],
  },
  'agroplanta-batatais': {
    website: 'https://agroplanta.com.br/',
    contactPage: 'https://agroplanta.com.br/contato/',
    generalEmail: 'comercial@agroplanta.com.br',
    generalPhone: '+55 16 3660-6500',
    contacts: [],
    departmentEmails: [{ department: 'Sales', email: 'comercial@agroplanta.com.br', source: { label: 'Agroplanta official contact page', url: 'https://agroplanta.com.br/contato/' } }],
    address: 'Rodovia Cândido Portinari SP 334, km 349.5, Batatais, São Paulo, Brazil',
    sources: [
      { label: 'Agroplanta Greencote polymer-coated controlled-release fertilizer', url: 'https://agroplanta.com.br/produtos/greencote/' },
      { label: 'Agroplanta Maxcote polymer-coated fertilizer range', url: 'https://agroplanta.com.br/produtos/maxcote/' },
      { label: 'Agroplanta company information on Batatais manufacturing units and polymer-based fertilizer production', url: 'https://agroplanta.com.br/quem-somos/' },
      { label: 'Agroplanta official product catalog for supplier exclusion check', url: 'https://agroplanta.com.br/produtos/' },
      { label: 'Agroplanta official contact page', url: 'https://agroplanta.com.br/contato/' },
    ],
  },
  'moravia-istanbul': {
    website: 'https://www.moravia.com.tr/',
    contactPage: 'https://www.moravia.com.tr/en/kurumsal.html',
    generalEmail: 'moravia@moravia.com.tr',
    generalPhone: '+90 212 579 13 36',
    contacts: [],
    departmentEmails: [{ department: 'General', email: 'moravia@moravia.com.tr', source: { label: 'Moravia official About Us and public contact details', url: 'https://www.moravia.com.tr/en/kurumsal.html' } }],
    address: 'Halkalı Merkez Mah. 1. İkitelli Cad. No:2, Küçükçekmece, Istanbul, Türkiye',
    sources: [
      { label: 'Moravia official manufacturing and product range', url: 'https://www.moravia.com.tr/en/kurumsal.html' },
      { label: 'Moravia MORAZINC HI-BUILD marine anticorrosive epoxy primer', url: 'https://www.moravia.com.tr/urunler/gemi-boyalari/astar-boyalar/morazinc-hi-build.html' },
      { label: 'PubMed indexed ELO anticorrosion coating research (application extension only)', url: 'https://pubmed.ncbi.nlm.nih.gov/34771350/' },
    ],
  },
}

function profileFor(lead: RawPublicLead): CompanyProfile {
  const contactUrl = lead.contact.contactUrl
  const department = lead.contact.email ? departmentFor(lead.contact.label) : undefined
  const base: CompanyProfile = {
    website: originOf(contactUrl ?? lead.source.url),
    contactPage: looksLikeContactPage(contactUrl) ? contactUrl : undefined,
    generalEmail: lead.contact.email,
    generalPhone: lead.contact.phone,
    contacts: [],
    departmentEmails: department && lead.contact.email ? [{ department, email: lead.contact.email, source: lead.source }] : [],
    sources: [lead.source],
  }
  const override = profileOverrides[lead.id]
  return override ? { ...base, ...override, sources: [...base.sources, ...(override.sources ?? [])] } : base
}

// The map and Lead workflow accept demand-side companies only. Similar-material
// suppliers are excluded until first-party evidence shows they buy and use our input.
const demandSideLeadIds = new Set([
  "noroo-paint-anyang",
  "applied-chemical-technology-florence",
  "fertiberia-madrid",
  "enecon-medford",
  "sauereisen-pittsburgh",
  "dampney-everett",
  "blanchon-saint-priest",
  "v33-domblans",
  "bona-malmo",
  "farrell-calhoun-memphis",
  "induron-birmingham",
  "cloverdale-paint-surrey",
  "diamond-vogel-orange-city",
  "sansin-strathroy",
  "rfcl-ramagundam",
  "ppg-pittsburgh",
  "behr-santa-ana",
  "benjamin-moore-montvale",
  "asian-paints-mumbai",
  "sika-baar",
  "cifo-san-giorgio",
  "coromandel-chennai",
  "fcp-cerea-bonavicina",
  "valresa-riba-roja",
  "isaval-ribarroja",
  "juno-erandio",
  "gubretas-istanbul",
  "toros-agri-istanbul",
  "paradeep-phosphates-bhubaneswar",
  "axalta-philadelphia",
  "mahadhan-agritech-pune",
  "vital-agri-nutrients-lahore",
  "polyvine-cheddar",
  "bedec-dunmow",
  "ivm-chemicals-parona",
  "rustins-london",
  "mylands-london",
  "morrells-stockport",
  "fiddes-cardiff",
  "verinlegno-massa-cozzile",
  "pvcfc-ca-mau",
  "incitec-pivot-fertilisers-melbourne",
  "troforte-innovations-wangara",
  "dura-paints-edenvale",
  "teknos-helsinki",
  "remmers-loeningen",
  "mipa-essenbach",
  "berger-seidle-gruenstadt",
  "ballance-tauranga",
  "hesse-lignal-hamm",
  "medal-paints-johannesburg",
  "kupsa-oyon",
  "kofarb-czestochowa",
  "soilmate-bangkok",
  "pv-paint-ho-chi-minh",
  "specialized-coating-systems-boksburg",
  "protectometal-ciudad-mexico",
  "pinturas-jemah-nuevo-leon",
  "nervion-tlalnepantla",
  "chugoku-marine-paints-tokyo",
  "hempel-lyngby",
  "bvfcl-namrup",
  "hurl-new-delhi",
  "kribhco-hazira",
  "renner-italia-minerbio",
  "vermont-natural-coatings-hardwick",
  "target-coatings-fair-lawn",
  "general-finishes-east-troy",
  "chambal-fertilizers-gadepan",
  "madras-fertilizers-manali",
  "national-fertilizers-nangal",
  "iffco-kalol",
  "duraway-coating-kapar",
  "elchemus-bukit-mertajam",
  "mowilex-indonesia-cikande",
  "tectona-warna-cirebon",
  'kg-chemical-ulsan',
  'hankook-hyeophwa-pohang',
  'namhae-chemical-yeosu',
  'rcf-mumbai',
  'agrotiger-mabalacat',
  'chobi-ulsan',
  'greenfeed-agro-shah-alam',
  'saraswanti-anugerah-indonesia-mempawah',
  'adubos-paranaiba-uberlandia',
  'indigrow-brimpton',
  'lebanon-seaboard-lebanon',
  'follmann-minden',
  'mapei-india-bengaluru',
  'plantacote-herentals',
  'siegwerk-siegburg',
  'jowat-detmold',
  'knox-fertilizer-knox',
  'andersons-maumee',
  'doneck-euroflex-grevenmacher',
  'wikoff-fort-mill',
  'aurora-material-streetsboro',
  'sun-agro-tokyo',
  'katakura-coop-akita',
  'gefink-burzaco',
  'colorprint-coseano',
  'manner-polymers-mckinney',
  'fortgreen-varginha',
  'grupo-equilibrio-catalao',
  'harrells-sylacauga',
  'icl-charleston',
  'haifa-israel',
  'crf-agritech-st-thomas',
  'compo-expert-krefeld',
  'florikan-bowling-green',
  'genus-brunswick',
  'pol-coatings-twello',
  'plastchem-hardenberg',
  'aqua-based-us',
  'deltachem-born',
  'cic-mckinney',
  'polyflex-baltic',
  'stir-barletta',
  'pursell-sylacauga',
  'cotex-dartmouth',
  'simofert-beuningen',
  'sk-specialties-sibu',
  'smart-fert-klang',
  'simplot-boise',
  'agrofarm-ponorogo',
  'twin-arrow-shah-alam',
  'agro-berjaya-mojokerto',
  'diversatech-bangi',
  'farmhannong-ulsan',
  'jcam-agri-tokyo',
  'vinyl-base-ipoh',
  'schramm-coatings-offenbach',
  'periwal-bhiwadi',
  'turf-care-martins-ferry',
  'omega-polimeros-trujui',
  'supernovae-funza',
  'vivacor-diadema',
  'agrobiotech-jardinopolis',
  'mica-shelton',
  'ac-profil-huttwil',
  'nutrien-carseland',
  'ichemco-cuggiono',
  'polymer-chemie-bad-sobernheim',
  'astra-chemtech-mumbai',
  'nam-ah-ipoh',
  'dacarto-osasco',
  'flint-group-malmo',
  'inx-schaumburg',
  'shakun-vadodara',
  'pvc-colouring-ahmedabad',
  'sun-chemical-parsippany',
  'crf-malaysia-kuala-lumpur',
  'cai-georgetown',
  'applied-db-samut-prakan',
  'ceccan-san-jose-iturbide',
  'central-chemical-ube',
  'tintas-prisma-tlalnepantla',
  'alpha-plast-devland',
  'mivena-maastricht',
  'greenbest-henstridge',
  'palini-vernici-pisogne',
  'sankhla-industries-bengaluru',
  'vernital-cercola',
  'duramax-cascavel',
  'marincoat-calvignasco',
  'rynan-smart-fertilizers-long-duc',
  'pungnong-seoul',
  'ec-grow-eau-claire',
  'sumika-agro-niihama',
  'nousbo-ulsan',
  'dupan-anugerah-lestari-pungging',
  'hanampi-sejahtera-kahuripan-gresik',
  'dgo-defix-phu-nghia',
  'son-mien-bac-hung-yen',
  'dolphin-inks-thane',
  'toa-paint-products-nilai',
  'jotun-paints-malaysia-shah-alam',
  'mc-ferticom-tokyo',
  'agroplanta-batatais',
  'moravia-istanbul',
])

// Separately verified Indian protective-coating manufacturers, not confirmed buyers.
const independentlyVerifiedThaiDonoLeads: PublicLead[] = [
  {
    "id": "thai-do-no-gen-gen-rayong",
    "productId": "nl-w1201",
    "company": "Thai Do No-Gen Gen Co., Ltd.",
    "country": "Thailand",
    "countryZh": "泰国",
    "city": "Rayong",
    "latitude": 12.6814,
    "longitude": 101.2816,
    "commercialRole": "demand_side",
    "leadEligible": true,
    "targetCompanyTypeId": "waterbased-wood-coating-manufacturer",
    "fit": "可开发候选",
    "signal": "官网确认泰国 Rayong 自有工厂及成品涂料制造业务，水性系列明确列出 Daimyo Crown 水性木器着色涂料及水性双组分聚氨酯涂料。公司是日本 Gen Gen Corporation 的合资/参股企业；品牌、工厂和日本关联企业不拆分新增。坐标为 Rayong 城市代表点，并非精确厂址。",
    "demandSideReason": "NL-W1201 TDS 明确木材表面处理应用；该公司制造水性木器涂料，属于潜在下游配方与表面处理评估对象。公开证据不证明其采购、使用或需要我方产品，也不证明任何具体配方的相容性或性能。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立重新读取公司制造说明、成品类别、水性产品原文及 Gen Gen 官方业务和参股关系。已查看业务为成品涂料、OEM 和涂装设备，未见水性聚烯烃乳液、CPO/PO 分散体或同类附着促进输入原料外售；成品水性 PU 2K 不等于聚氨酯原料供应。结论限已查来源，不声称覆盖集团所有业务。名称、thaidonogengen.com、gen2.co.jp、Daimyo/Gen Gen 关联对照最新 main、本地正式数据和私有队列未见重复，仅一个泰国法人账户；不收录中国大陆关联公司。来源：https://www.thaidonogengen.com/en/；https://www.thaidonogengen.com/water-based-product-line/；https://www.gen2.co.jp/english"
    },
    "contact": {
      "label": "Official corporate sales inbox and factory phone; no named procurement contact",
      "email": "tdn_sales@hotmail.com",
      "phone": "+66 38 893 651",
      "contactUrl": "https://www.thaidonogengen.com/%E0%B8%95%E0%B8%B4%E0%B8%94%E0%B8%95%E0%B9%88%E0%B8%AD%E0%B9%80%E0%B8%A3%E0%B8%B2/"
    },
    "source": {
      "label": "Official water-based wood coating product line",
      "url": "https://www.thaidonogengen.com/water-based-product-line/"
    },
    "companyEvidence": {
      "applicationLayer": "tds-verified",
      "applicationId": "wood-surface-treatment",
      "statement": "公司自述制造木器等成品涂料并公开 Rayong 工厂；自有水性产品页明确 Daimyo Crown Water Based Wood Stain 与 Water-Based Polyurethane 2K。日本 Gen Gen 官方确认泰国参股法人，未拆分品牌账户。",
      "sourceName": "Original company manufacturing, water-based wood products and investor confirmation",
      "sourceUrl": "https://www.thaidonogengen.com/water-based-product-line/",
      "verifiedAt": "2026-10-11"
    },
    "checkedAt": "2026-10-11",
    "profile": {
      "website": "https://www.thaidonogengen.com/",
      "contactPage": "https://www.thaidonogengen.com/%E0%B8%95%E0%B8%B4%E0%B8%94%E0%B8%95%E0%B9%88%E0%B8%AD%E0%B9%80%E0%B8%A3%E0%B8%B2/",
      "generalEmail": "tdn_sales@hotmail.com",
      "generalPhone": "+66 38 893 651",
      "contacts": [],
      "departmentEmails": [
        {
          "department": "Sales",
          "email": "tdn_sales@hotmail.com",
          "source": {
            "label": "Official publicly disclosed corporate sales inbox",
            "url": "https://www.thaidonogengen.com/%E0%B8%95%E0%B8%B4%E0%B8%94%E0%B8%95%E0%B9%88%E0%B8%AD%E0%B9%80%E0%B8%A3%E0%B8%B2/"
          }
        }
      ],
      "address": "222 Moo 5, Makamkoo Sub-District, Nikhom Phatthana District, Rayong 21180, Thailand",
      "sources": [
        {
          "label": "Own coating manufacture and factory",
          "url": "https://www.thaidonogengen.com/en/"
        },
        {
          "label": "Own water-based wood coating products",
          "url": "https://www.thaidonogengen.com/water-based-product-line/"
        },
        {
          "label": "Current corporate sales contact",
          "url": "https://www.thaidonogengen.com/%E0%B8%95%E0%B8%B4%E0%B8%94%E0%B8%95%E0%B9%88%E0%B8%AD%E0%B9%80%E0%B8%A3%E0%B8%B2/"
        },
        {
          "label": "Gen Gen official invested-company relationship and business scope",
          "url": "https://www.gen2.co.jp/english"
        }
      ]
    }
  }
]

const independentlyVerifiedVietnamProtectiveLeads: PublicLead[] = [
  {
    "id": "apt-vietnam-noi-bai",
    "productId": "elo",
    "company": "APT Vietnam",
    "country": "Vietnam",
    "countryZh": "越南",
    "city": "Hanoi",
    "latitude": 21.0278,
    "longitude": 105.8342,
    "commercialRole": "demand_side",
    "leadEligible": true,
    "targetCompanyTypeId": "elo-coating-manufacturer",
    "fit": "可开发候选",
    "signal": "官方原文确认 Nội Bài 工厂制造工业防腐涂层，KERAGUARD ADG220 面向化学品储存及储罐保护。Hanoi、Ho Chi Minh 与境外分支均作为同一 APT 账户，不拆分品牌或分支；未把未披露的所有权写成已确认集团关系。 坐标为 Hanoi 城市代表点，并非精确厂址。",
    "demandSideReason": "ELO TDS 明确涂料应用；该企业自主制造工业防护或防腐成品涂层，是潜在下游配方评估对象。公开资料不证明其采购、使用或需要 ELO，也不证明我方产品与其现有配方的相容性、固化方式或性能。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立重读自有制造说明及成品目录：所查业务为成品涂料/涂层体系，未见 ELO、ESBO、环氧化植物油或同类增塑输入原料对外销售；普通环氧成品涂层不等于销售环氧化植物油。结论限已查公开业务。名称、域名、品牌及已披露分支与最新 main、本地正式数据和完整私有队列对照未见同一账户；未披露集团所有权不擅自推定。来源：https://apt.net.vn/gioi-thieu/；https://apt.net.vn/son-chong-an-mon/；https://apt.net.vn/he-thong-phu-epoxy-khang-hoa-chat-keraguard-adg220/"
    },
    "contact": {
      "label": "Official public corporate inbox; no named procurement contact",
      "email": "infor@apt.net.vn",
      "phone": "+84 904 339 299",
      "contactUrl": "https://apt.net.vn/lien-he/"
    },
    "source": {
      "label": "Original own manufacture and protective-coating portfolio",
      "url": "https://apt.net.vn/gioi-thieu/"
    },
    "companyEvidence": {
      "applicationLayer": "tds-verified",
      "applicationId": "coatings",
      "statement": "APT 原文确认自有生产线与研发；防腐目录说明产品制造于 APT Vietnam Nội Bài 工厂，ADG220 技术页列出化学品储存区及储罐保护涂层。",
      "sourceName": "Original own manufacturing statement and protective-coating products",
      "sourceUrl": "https://apt.net.vn/gioi-thieu/",
      "verifiedAt": "2026-10-11"
    },
    "checkedAt": "2026-10-11",
    "profile": {
      "website": "https://apt.net.vn/",
      "contactPage": "https://apt.net.vn/lien-he/",
      "generalEmail": "infor@apt.net.vn",
      "generalPhone": "+84 904 339 299",
      "contacts": [],
      "departmentEmails": [
        {
          "department": "General",
          "email": "infor@apt.net.vn",
          "source": {
            "label": "Official publicly disclosed corporate business inbox",
            "url": "https://apt.net.vn/lien-he/"
          }
        }
      ],
      "address": "Factory: Khu 2 - Nội Bài - Hà Nội - Việt Nam",
      "sources": [
        {
          "label": "Own manufacturing and company identity",
          "url": "https://apt.net.vn/gioi-thieu/"
        },
        {
          "label": "Finished protective-coating portfolio",
          "url": "https://apt.net.vn/son-chong-an-mon/"
        },
        {
          "label": "Technical product or public contact",
          "url": "https://apt.net.vn/he-thong-phu-epoxy-khang-hoa-chat-keraguard-adg220/"
        },
        {
          "label": "Corporate public contact",
          "url": "https://apt.net.vn/lien-he/"
        }
      ]
    }
  },
  {
    "id": "son-anh-an-khanh",
    "productId": "elo",
    "company": "Công ty TNHH Thương mại và Sản xuất Sơn Anh",
    "country": "Vietnam",
    "countryZh": "越南",
    "city": "Hanoi",
    "latitude": 21.0278,
    "longitude": 105.8342,
    "commercialRole": "demand_side",
    "leadEligible": true,
    "targetCompanyTypeId": "elo-coating-manufacturer",
    "fit": "可开发候选",
    "signal": "官网确认自主制造工业、海上设施及船舶涂料，公开 An Khánh 地址与公司业务邮箱。完整法人名称、Sơn Anh 品牌及 sonanhpaint.vn 仅一个账户；原料进口来源不等于目标公司的所在地或集团归属。 坐标为 Hanoi 城市代表点，并非精确厂址。",
    "demandSideReason": "ELO TDS 明确涂料应用；该企业自主制造工业防护或防腐成品涂层，是潜在下游配方评估对象。公开资料不证明其采购、使用或需要 ELO，也不证明我方产品与其现有配方的相容性、固化方式或性能。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立重读自有制造说明及成品目录：所查业务为成品涂料/涂层体系，未见 ELO、ESBO、环氧化植物油或同类增塑输入原料对外销售；普通环氧成品涂层不等于销售环氧化植物油。结论限已查公开业务。名称、域名、品牌及已披露分支与最新 main、本地正式数据和完整私有队列对照未见同一账户；未披露集团所有权不擅自推定。来源：https://sonanhpaint.vn/3-65/Gioi-thieu；https://sonanhpaint.vn/"
    },
    "contact": {
      "label": "Official public corporate inbox; no named procurement contact",
      "email": "sonanhpaint@gmail.com",
      "phone": "+84 916 545 090",
      "contactUrl": "https://sonanhpaint.vn/vn/lien-he"
    },
    "source": {
      "label": "Original own manufacture and protective-coating portfolio",
      "url": "https://sonanhpaint.vn/3-65/Gioi-thieu"
    },
    "companyEvidence": {
      "applicationLayer": "tds-verified",
      "applicationId": "coatings",
      "statement": "公司原文说明自有生产设备及技术队伍，并制造工业、海上设施和船舶用环氧及氯化橡胶涂料；成品目录列船舶防护底涂、中间涂层及聚氨酯面漆。",
      "sourceName": "Original own manufacturing statement and protective-coating products",
      "sourceUrl": "https://sonanhpaint.vn/3-65/Gioi-thieu",
      "verifiedAt": "2026-10-11"
    },
    "checkedAt": "2026-10-11",
    "profile": {
      "website": "https://sonanhpaint.vn/",
      "contactPage": "https://sonanhpaint.vn/vn/lien-he",
      "generalEmail": "sonanhpaint@gmail.com",
      "generalPhone": "+84 916 545 090",
      "contacts": [],
      "departmentEmails": [
        {
          "department": "General",
          "email": "sonanhpaint@gmail.com",
          "source": {
            "label": "Official publicly disclosed corporate business inbox",
            "url": "https://sonanhpaint.vn/vn/lien-he"
          }
        }
      ],
      "address": "KCN An Khánh, Hoài Đức, Hà Nội, Vietnam",
      "sources": [
        {
          "label": "Own manufacturing and company identity",
          "url": "https://sonanhpaint.vn/3-65/Gioi-thieu"
        },
        {
          "label": "Finished protective-coating portfolio",
          "url": "https://sonanhpaint.vn/"
        },
        {
          "label": "Technical product or public contact",
          "url": "https://sonanhpaint.vn/vn/lien-he"
        }
      ]
    }
  }
]

const independentlyVerifiedKossanLeads: PublicLead[] = [
  {
    "id": "kossan-paint-kapar",
    "productId": "elo",
    "company": "Kossan Paint (M) Sdn Bhd",
    "country": "Malaysia",
    "countryZh": "马来西亚",
    "city": "Kapar, Selangor",
    "latitude": 3.1387,
    "longitude": 101.3718,
    "commercialRole": "demand_side",
    "leadEligible": true,
    "targetCompanyTypeId": "elo-coating-manufacturer",
    "fit": "可开发候选",
    "signal": "官网独立复核确认 Kossan Paint（281816-H）在 Klang/Kapar 自有工厂及综合研发部门制造工业防护和船舶涂料；成品目录包括富锌底漆、MIO 防护体系、储罐用环氧涂料及聚氨酯面漆。该法人是 Transocean Coatings Association 会员；出口地区、营销名称和协会共享品牌不拆分为新客户。坐标仅代表 Kapar 城市，并非精确工厂位置。",
    "demandSideReason": "ELO TDS 明确涂料应用；该企业自产工业防护/防腐及船舶成品涂料，是潜在下游配方评估对象。公开证据不证明其采购、使用或需要 ELO/我方牌号，也不证明其环氧或聚氨酯配方与 ELO 的相容性或防腐性能。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立重读公司自有制造说明、工业防护与船舶完整目录及协会会员原文；已查看的对外业务为成品涂料、胶黏和防护体系，未见 ELO、ESBO、环氧化植物油或同类增塑/稳定输入原料外售。普通 epoxy resin/glue 类别不等同于环氧化植物油。结论限所查法人及来源，不声称全面覆盖其他同名控股集团。以 Kossan Paint、281816-H、kossanpaint.com / .com.my 及协会关联核对最新 main、本地正式数据和私有队列，无重复；仅一个法人账户。来源：https://www.kossanpaint.com/about-us；https://www.kossanpaint.com/products/industrial-coating-paint；https://www.kossanpaint.com/products/marine-coating-paint；https://transocean-coatings.com/"
    },
    "contact": {
      "label": "Association-published corporate sales inbox and current official business phone; no named purchasing contact",
      "email": "sales@kossanpaint.com.my",
      "phone": "+60 3 3392 2799",
      "contactUrl": "https://www.kossanpaint.com/contact-us"
    },
    "source": {
      "label": "Official own industrial protective coating catalogue",
      "url": "https://www.kossanpaint.com/products/industrial-coating-paint"
    },
    "companyEvidence": {
      "applicationLayer": "tds-verified",
      "applicationId": "coatings",
      "statement": "公司官网明确自有制造工厂与研发部门；工业防护目录包含富锌、MIO、储罐用环氧和聚氨酯成品体系，船舶目录另列防腐底漆、罐衬及防污涂料。协会原文确认 Kossan 法人会员与公开业务邮箱。",
      "sourceName": "Kossan Paint original manufacturing, protective/marine product and association sources",
      "sourceUrl": "https://www.kossanpaint.com/products/industrial-coating-paint",
      "verifiedAt": "2026-10-11"
    },
    "checkedAt": "2026-10-11",
    "profile": {
      "website": "https://www.kossanpaint.com/",
      "contactPage": "https://www.kossanpaint.com/contact-us",
      "generalEmail": "sales@kossanpaint.com.my",
      "generalPhone": "+60 3 3392 2799",
      "contacts": [],
      "departmentEmails": [
        {
          "department": "Sales",
          "email": "sales@kossanpaint.com.my",
          "source": {
            "label": "Transocean official Malaysia member corporate business email",
            "url": "https://transocean-coatings.com/"
          }
        }
      ],
      "address": "No. 1, Jalan Koporat 1/KU 9, Taman Perindustrian Meru, 42200 Kapar, Selangor, Malaysia",
      "sources": [
        {
          "label": "Official own industrial protective coating catalogue",
          "url": "https://www.kossanpaint.com/products/industrial-coating-paint"
        },
        {
          "label": "Own plant, R&D and legal company",
          "url": "https://www.kossanpaint.com/about-us"
        },
        {
          "label": "Own marine anti-corrosion finished systems",
          "url": "https://www.kossanpaint.com/products/marine-coating-paint"
        },
        {
          "label": "Current official business telephone and address",
          "url": "https://www.kossanpaint.com/contact-us"
        },
        {
          "label": "Association membership and public corporate sales email",
          "url": "https://transocean-coatings.com/"
        }
      ]
    }
  }
]


const independentlyVerifiedTechnicalFinishesLeads: PublicLead[] = [
  {
    "id": "technical-finishes-germiston",
    "productId": "elo",
    "company": "Technical Finishes SA (Pty) Ltd (Saint-Gobain South Africa)",
    "country": "South Africa",
    "countryZh": "南非",
    "city": "Germiston, Gauteng",
    "latitude": -26.2319,
    "longitude": 28.1734,
    "commercialRole": "demand_side",
    "leadEligible": true,
    "targetCompanyTypeId": "elo-coating-manufacturer",
    "fit": "可开发候选",
    "signal": "独立重读官网：Technical Finishes 明确自主制造工业防腐体系，覆盖管道耐磨保护、储罐衬里及高耐化学性环氧防护系统，非仅普通装饰地坪或施工服务。母公司官方确认 TFSA 已由 Saint-Gobain Construction Products South Africa 收购；仅收录一个集团关联主体，不拆分品牌或分支。Germiston 坐标为城市代表点，联系地址为公开业务分支，并非宣称精确工厂位置。",
    "demandSideReason": "ELO TDS 明确涂料应用；该公司自产工业防腐、防护成品体系，是潜在下游配方评估对象。公开证据不证明其采购、使用或需要 ELO/我方牌号，也不证明其环氧或乙烯基酯体系与 ELO 的具体相容性或防腐性能。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立重新读取产品总目录、非地坪工业防腐制造说明、公司及母公司收购公告和 a.b.e. 集团构造化学品介绍。所查公开业务为配制成品地坪、防护、修补体系及复合材料；未发现 ELO、ESBO、环氧化植物油或同类增塑/稳定原料外售。普通环氧复合体系不等于环氧化植物油供应。结论仅限所查来源，不宣称涵盖集团所有业务。Technical Finishes/TFSA 与 Saint-Gobain Construction Products South Africa 关联已注明，Gauteng 等分支不拆分新增；最新 main、本地公开数据及私有队列无另一个正式同集团客户。来源：https://technicalfinishes.com/products/；https://technicalfinishes.com/non-flooring/；https://technicalfinishes.com/joining-forces-and-laying-foundations/；https://www.abe.co.za/about-abe-construction-chemicals/"
    },
    "contact": {
      "label": "Gauteng 官方业务分支电话／联系页；未核验采购负责人",
      "phone": "+27 11 822 7242",
      "contactUrl": "https://technicalfinishes.com/gauteng/"
    },
    "source": {
      "label": "Official own industrial anti-corrosion manufacturing",
      "url": "https://technicalfinishes.com/non-flooring/"
    },
    "companyEvidence": {
      "applicationLayer": "tds-verified",
      "applicationId": "coatings",
      "statement": "官网明确自产管道用环氧耐磨保护体系、储罐乙烯基酯衬里和耐化学性环氧防腐产品；公司及母公司原始收购公告确认南非 TFSA 制造主体和 Saint-Gobain 集团关联。",
      "sourceName": "Technical Finishes original industrial protective manufacturing and parent confirmation",
      "sourceUrl": "https://technicalfinishes.com/non-flooring/",
      "verifiedAt": "2026-10-11"
    },
    "checkedAt": "2026-10-11",
    "profile": {
      "website": "https://technicalfinishes.com/",
      "contactPage": "https://technicalfinishes.com/gauteng/",
      "generalPhone": "+27 11 822 7242",
      "contacts": [],
      "departmentEmails": [],
      "address": "35 Activia Road, Activia Park, Germiston, South Africa",
      "sources": [
        {
          "label": "Own industrial anti-corrosion manufacture",
          "url": "https://technicalfinishes.com/non-flooring/"
        },
        {
          "label": "Own complete downstream product categories",
          "url": "https://technicalfinishes.com/products/"
        },
        {
          "label": "Current official business branch and telephone",
          "url": "https://technicalfinishes.com/gauteng/"
        },
        {
          "label": "Own TFSA/Saint-Gobain acquisition announcement",
          "url": "https://technicalfinishes.com/joining-forces-and-laying-foundations/"
        },
        {
          "label": "Parent official completed acquisition confirmation",
          "url": "https://www.saint-gobain-africa.com/en/saint-gobain-construction-products-south-africa-completes-acquisition-technical-finishes"
        },
        {
          "label": "Related construction-chemical product scope",
          "url": "https://www.abe.co.za/about-abe-construction-chemicals/"
        }
      ]
    }
  }
]

const independentlyVerifiedKanatLeads: PublicLead[] = [
  {
    "id": "kanat-boya-kemalpasa",
    "productId": "elo",
    "company": "Kanat Boyacılık Ticaret ve Sanayi A.Ş. (KANAT BOYA)",
    "country": "Turkey",
    "countryZh": "土耳其",
    "city": "Kemalpaşa, İzmir",
    "latitude": 38.428,
    "longitude": 27.417,
    "commercialRole": "demand_side",
    "leadEligible": true,
    "targetCompanyTypeId": "elo-coating-manufacturer",
    "fit": "可开发候选",
    "signal": "独立重读官网制造、研发和防护涂料目录：KANAT 在 Kemalpaşa 自有工厂研发生产工业防护成品涂料，目录覆盖钢结构、管线、储罐等并列出 KANEPOX 底漆、玻璃鳞片和衬里产品。Therna 为官网明示自有品牌，Osmaniye 工厂及海外经营点均不拆分为新增。地图坐标仅代表 Kemalpaşa 城市，非精确厂址。",
    "demandSideReason": "ELO TDS 明确涂料应用；该公司自主研发制造工业防护成品体系，属于潜在下游配方评估对象。此理由不证明其采购、使用、需要或兼容 ELO/我方牌号，也不推断现有 KANEPOX 配方含 ELO。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立再次读取制造说明、防护涂料完整目录、一般工业目录、研发、联系及 Therna 自有品牌来源。所查对外产品为成品防护/工业涂料及家庭器具涂层；未发现 ELO、ESBO、环氧化植物油或同类增塑/稳定输入原料外售。自有树脂研发或 polyester 专利不等于此类原料销售；成品 epoxy 底漆不等于环氧化植物油。按 KANAT BOYA/Kanat Boyacılık、kanatboya.com.tr、Therna/therna.com.tr 和 Kemalpaşa/Osmaniye 关联核对最新 main、本地及研究队列，无既有同一客户。来源：https://kanatboya.com.tr/hakkimizda.html；https://kanatboya.com.tr/koruyucu-boyalar-ve-kaplamar.html；https://therna.com.tr/；https://kanatboya.com.tr/arge.html"
    },
    "contact": {
      "label": "官方通用业务邮箱；未核验采购负责人",
      "email": "info@kanatboya.com.tr",
      "phone": "+90 232 878 95 00",
      "contactUrl": "https://kanatboya.com.tr/iletisim.html"
    },
    "source": {
      "label": "Official own protective-coating manufacture and R&D",
      "url": "https://kanatboya.com.tr/hakkimizda.html"
    },
    "companyEvidence": {
      "applicationLayer": "tds-verified",
      "applicationId": "coatings",
      "statement": "公司官网明确自有 Kemalpaşa 工厂、防护涂料制造及研发；防护目录列钢结构、管线、储罐、设备等成品系统，非仅经销或施工服务。",
      "sourceName": "KANAT original manufacturing, R&D and protective-coating catalogue",
      "sourceUrl": "https://kanatboya.com.tr/hakkimizda.html",
      "verifiedAt": "2026-10-11"
    },
    "checkedAt": "2026-10-11",
    "profile": {
      "website": "https://kanatboya.com.tr/",
      "contactPage": "https://kanatboya.com.tr/iletisim.html",
      "generalEmail": "info@kanatboya.com.tr",
      "generalPhone": "+90 232 878 95 00",
      "contacts": [],
      "departmentEmails": [
        {
          "department": "General",
          "email": "info@kanatboya.com.tr",
          "source": {
            "label": "Official headquarters business contact",
            "url": "https://kanatboya.com.tr/iletisim.html"
          }
        }
      ],
      "address": "Kemalpaşa OSB Mah. 500 Sokak No:321, Kemalpaşa / İzmir, Turkey",
      "sources": [
        {
          "label": "Own factory/manufacturing",
          "url": "https://kanatboya.com.tr/hakkimizda.html"
        },
        {
          "label": "Protective coating products",
          "url": "https://kanatboya.com.tr/koruyucu-boyalar-ve-kaplamar.html"
        },
        {
          "label": "R&D",
          "url": "https://kanatboya.com.tr/arge.html"
        },
        {
          "label": "Business contact",
          "url": "https://kanatboya.com.tr/iletisim.html"
        },
        {
          "label": "Therna brand relationship",
          "url": "https://therna.com.tr/"
        }
      ]
    }
  }
]


const independentlyVerifiedIndiaCoatingLeads: PublicLead[] = [
  {
    "id": "advance-paints-mumbai",
    "productId": "elo",
    "company": "Advance Paints Pvt. Ltd.",
    "country": "India",
    "countryZh": "印度",
    "city": "Mumbai",
    "latitude": 19.076,
    "longitude": 72.8777,
    "commercialRole": "demand_side",
    "leadEligible": true,
    "targetCompanyTypeId": "elo-anticorrosion-coating-formulator",
    "fit": "可开发候选",
    "signal": "官网确认 Mumbai 和 Ankleshwar 自有涂料生产厂及持续产品研发；Advoguard 环氧中间涂层用于严苛腐蚀、海洋及离岸结构防护。",
    "demandSideReason": "官网确认 Mumbai 和 Ankleshwar 自有涂料生产厂及持续产品研发；Advoguard 环氧中间涂层用于严苛腐蚀、海洋及离岸结构防护。 ELO 的涂料大类及独立 ELO/木质素防腐研究支持其作为潜在配方评估对象；该研究采用 UV/热双重固化，不能推断本公司的既有配方兼容、已使用 ELO 或已确认采购。Mumbai 与 Ankleshwar 为同一公司两处工厂，仅一个客户；Tambour 为历史技术许可合作，不据此推定集团所有权。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "已重新检查官网公司能力与成品涂层目录：业务为工业/海洋涂料制造和配方；Ankleshwar 树脂生产明确为 captive consumption（自用）。所审阅目录未发现 ELO、ESBO 或同类环氧化植物油原料销售，不将自用树脂等同于同行供应。 来源：https://advancepaints.com/about-us/；https://advancepaints.com/intermediate-industrial-coatings/"
    },
    "contact": {
      "label": "官方联系页及公司电话",
      "phone": "+91 22 2859 0162",
      "contactUrl": "https://advancepaints.com/contact-us/"
    },
    "source": {
      "label": "Official manufacturing and protective-coating evidence",
      "url": "https://advancepaints.com/about-us/"
    },
    "companyEvidence": {
      "applicationLayer": "market-extended",
      "applicationId": "elo-anticorrosion-coating-research",
      "statement": "官网确认 Mumbai 和 Ankleshwar 自有涂料生产厂及持续产品研发；Advoguard 环氧中间涂层用于严苛腐蚀、海洋及离岸结构防护。",
      "sourceName": "Official company manufacturing and coating portfolio",
      "sourceUrl": "https://advancepaints.com/about-us/",
      "verifiedAt": "2026-10-11"
    },
    "checkedAt": "2026-10-11",
    "profile": {
      "website": "https://advancepaints.com/",
      "contactPage": "https://advancepaints.com/contact-us/",
      "generalPhone": "+91 22 2859 0162",
      "contacts": [
        {
          "name": "Harshad Sheth",
          "title": "Managing Director",
          "department": "Management",
          "source": {
            "label": "Official company philosophy",
            "url": "https://advancepaints.com/about-us/"
          },
          "verifiedAt": "2026-10-11"
        }
      ],
      "departmentEmails": [],
      "address": "Advance House, Plot-A, Makwana Road, Ark Industrial Compound, Marol Naka, Andheri East, Mumbai 400059, India",
      "sources": [
        {
          "label": "Manufacturing and R&D",
          "url": "https://advancepaints.com/about-us/"
        },
        {
          "label": "Protective coating products",
          "url": "https://advancepaints.com/intermediate-industrial-coatings/"
        },
        {
          "label": "Business contact",
          "url": "https://advancepaints.com/contact-us/"
        },
        {
          "label": "Independent ELO research (original full text)",
          "url": "https://www.ebi.ac.uk/europepmc/webservices/rest/PMC8588247/fullTextXML"
        }
      ]
    }
  },
  {
    "id": "goa-paints-panaji",
    "productId": "elo",
    "company": "Goa Paints (Dempo Group)",
    "country": "India",
    "countryZh": "印度",
    "city": "Panaji",
    "latitude": 15.4909,
    "longitude": 73.8278,
    "commercialRole": "demand_side",
    "leadEligible": true,
    "targetCompanyTypeId": "elo-anticorrosion-coating-formulator",
    "fit": "可开发候选",
    "signal": "官网确认自主制造高性能防护涂料并提供定制配方；Galaxy 环氧产品包括海洋/工业高膜厚涂层和用于管线重防护的富锌底漆。",
    "demandSideReason": "官网确认自主制造高性能防护涂料并提供定制配方；Galaxy 环氧产品包括海洋/工业高膜厚涂层和用于管线重防护的富锌底漆。 ELO 的涂料大类及独立 ELO/木质素防腐研究支持其作为潜在配方评估对象；该研究采用 UV/热双重固化，不能推断本公司的既有配方兼容、已使用 ELO 或已确认采购。官网明确标注 Dempo Group；Galaxy、Shipguard 为产品系列，不另算公司；GSIA 历史会员制造地址仅作为交叉证据，不当作最新产能证明。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "已重新检查公司简介、环氧产品和官网全部产品家族导航：显示成品防护涂料及定制配方，未发现 ELO、ESBO 或同类环氧化植物油原料销售；结论限定于已审阅公开目录。 来源：https://www.goapaints.net/about-us/；https://www.goapaints.net/product/epoxy/"
    },
    "contact": {
      "label": "官方公开业务邮箱",
      "email": "goapaints@goapaints.net",
      "phone": "+91 8605008862",
      "contactUrl": "https://www.goapaints.net/about-us/"
    },
    "source": {
      "label": "Official manufacturing and protective-coating evidence",
      "url": "https://www.goapaints.net/about-us/"
    },
    "companyEvidence": {
      "applicationLayer": "market-extended",
      "applicationId": "elo-anticorrosion-coating-research",
      "statement": "官网确认自主制造高性能防护涂料并提供定制配方；Galaxy 环氧产品包括海洋/工业高膜厚涂层和用于管线重防护的富锌底漆。",
      "sourceName": "Official company manufacturing and coating portfolio",
      "sourceUrl": "https://www.goapaints.net/about-us/",
      "verifiedAt": "2026-10-11"
    },
    "checkedAt": "2026-10-11",
    "profile": {
      "website": "https://www.goapaints.net/",
      "contactPage": "https://www.goapaints.net/about-us/",
      "generalEmail": "goapaints@goapaints.net",
      "generalPhone": "+91 8605008862",
      "contacts": [],
      "departmentEmails": [
        {
          "department": "General",
          "email": "goapaints@goapaints.net",
          "source": {
            "label": "Official public business contact",
            "url": "https://www.goapaints.net/about-us/"
          }
        }
      ],
      "address": "1st floor, Dempo Trade Centre, Patto Plaza, Panaji, Goa, India",
      "sources": [
        {
          "label": "Manufacturing and R&D",
          "url": "https://www.goapaints.net/about-us/"
        },
        {
          "label": "Protective coating products",
          "url": "https://www.goapaints.net/product/epoxy/"
        },
        {
          "label": "Business contact",
          "url": "https://www.goapaints.net/about-us/"
        },
        {
          "label": "Independent ELO research (original full text)",
          "url": "https://www.ebi.ac.uk/europepmc/webservices/rest/PMC8588247/fullTextXML"
        },
        {
          "label": "GSIA historical manufacturing cross-check",
          "url": "https://gsia.in/goa-paints-and-allied-products/"
        }
      ]
    }
  },
  {
    "id": "rainbow-industries-navi-mumbai",
    "productId": "elo",
    "company": "Rainbow Industries",
    "country": "India",
    "countryZh": "印度",
    "city": "Navi Mumbai",
    "latitude": 19.033,
    "longitude": 73.0297,
    "commercialRole": "demand_side",
    "leadEligible": true,
    "targetCompanyTypeId": "elo-anticorrosion-coating-formulator",
    "fit": "可开发候选",
    "signal": "官网确认 Rabale 自有工业涂料工厂和定制研发；二组分环氧富锌底漆用于高腐蚀钢结构，煤焦油环氧用于海洋、储罐和重型结构防护。",
    "demandSideReason": "官网确认 Rabale 自有工业涂料工厂和定制研发；二组分环氧富锌底漆用于高腐蚀钢结构，煤焦油环氧用于海洋、储罐和重型结构防护。 ELO 的涂料大类及独立 ELO/木质素防腐研究支持其作为潜在配方评估对象；该研究采用 UV/热双重固化，不能推断本公司的既有配方兼容、已使用 ELO 或已确认采购。按 Rainbow Industries、rainbowindustries.co.in 和 Rabale 地址去重；未发现与现有客户的集团关联。Mayur Chaudhari 未披露职位，未编造其职称。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "已重新检查自有工厂说明、完整产品类别清单与环氧成品页面：成品工业涂料、底漆、配套稀释剂和清洗溶剂未显示 ELO、ESBO 或同类环氧化植物油原料销售；未把配套溶剂销售误认同类原料同行。 来源：https://www.rainbowindustries.co.in/about；https://www.rainbowindustries.co.in/copy-of-epoxy"
    },
    "contact": {
      "label": "官方公开业务邮箱",
      "email": "rainbow.industries@ymail.com",
      "phone": "+91 9870086895",
      "contactUrl": "https://www.rainbowindustries.co.in/products"
    },
    "source": {
      "label": "Official manufacturing and protective-coating evidence",
      "url": "https://www.rainbowindustries.co.in/about"
    },
    "companyEvidence": {
      "applicationLayer": "market-extended",
      "applicationId": "elo-anticorrosion-coating-research",
      "statement": "官网确认 Rabale 自有工业涂料工厂和定制研发；二组分环氧富锌底漆用于高腐蚀钢结构，煤焦油环氧用于海洋、储罐和重型结构防护。",
      "sourceName": "Official company manufacturing and coating portfolio",
      "sourceUrl": "https://www.rainbowindustries.co.in/about",
      "verifiedAt": "2026-10-11"
    },
    "checkedAt": "2026-10-11",
    "profile": {
      "website": "https://www.rainbowindustries.co.in/",
      "contactPage": "https://www.rainbowindustries.co.in/products",
      "generalEmail": "rainbow.industries@ymail.com",
      "generalPhone": "+91 9870086895",
      "contacts": [
        {
          "name": "M B Chaudhari",
          "title": "Founder; supervises research and development (official company description)",
          "department": "Technical",
          "source": {
            "label": "Official company R&D description",
            "url": "https://www.rainbowindustries.co.in/about"
          },
          "verifiedAt": "2026-10-11"
        }
      ],
      "departmentEmails": [
        {
          "department": "General",
          "email": "rainbow.industries@ymail.com",
          "source": {
            "label": "Official public business contact",
            "url": "https://www.rainbowindustries.co.in/products"
          }
        }
      ],
      "address": "R-927, MIDC TTC Industrial Area, Rabale, Navi Mumbai 400701, India",
      "sources": [
        {
          "label": "Manufacturing and R&D",
          "url": "https://www.rainbowindustries.co.in/about"
        },
        {
          "label": "Protective coating products",
          "url": "https://www.rainbowindustries.co.in/copy-of-epoxy"
        },
        {
          "label": "Business contact",
          "url": "https://www.rainbowindustries.co.in/products"
        },
        {
          "label": "Independent ELO research (original full text)",
          "url": "https://www.ebi.ac.uk/europepmc/webservices/rest/PMC8588247/fullTextXML"
        }
      ]
    }
  }
]

const independentlyVerifiedPentaPrimaLeads: PublicLead[] = [
  {
    "id": "penta-prima-tangerang",
    "productId": "elo",
    "company": "PT Bina Adidaya (Penta Prima)",
    "country": "Indonesia",
    "countryZh": "印度尼西亚",
    "city": "Tangerang, Banten",
    "latitude": -6.18,
    "longitude": 106.63,
    "commercialRole": "demand_side",
    "leadEligible": true,
    "demandSideReason": "PT Bina Adidaya以Penta Prima品牌自主设计和制造涂料；官方完整产品目录明确生产重防腐、船舶及工业防护成品。ELO涂料TDS及独立ELO/木质素防腐研究仅支持潜在配方评估方向，不证明其采购、使用ELO或与现有配方兼容。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-12",
      "conclusion": "独立重读完整官方目录16页及公司资料：公开产品为成品漆、涂料、胶、稀释剂及配套固化剂；目录中的环氧/聚氨酯为成品体系，不等同出售基础树脂。未发现ELO、ESBO、环氧植物油或同类生物基增塑剂供应业务。来源：https://pentaprima.co.id/industri 和官方2025产品目录。结论限已核对的公开业务，不推断外购。"
    },
    "targetCompanyTypeId": "elo-anticorrosion-coating-formulator",
    "fit": "可开发候选",
    "signal": "PT Bina Adidaya以Penta Prima品牌自主设计和制造涂料；官方完整产品目录明确生产重防腐、船舶及工业防护成品。ELO涂料TDS及独立ELO/木质素防腐研究仅支持潜在配方评估方向，不证明其采购、使用ELO或与现有配方兼容。",
    "contact": {
      "label": "Official sales business inbox",
      "email": "sales@pentaprima.co.id",
      "phone": "+62 21 2938 3000",
      "contactUrl": "https://pentaprima.co.id/profile"
    },
    "source": {
      "label": "Official PT Bina Adidaya factory/manufacturing profile",
      "url": "https://pentaprima.co.id/assets/img/bina/compropentaindo.pdf"
    },
    "companyEvidence": {
      "applicationLayer": "market-extended",
      "applicationId": "elo-anticorrosion-coating-research",
      "statement": "公司官方PDF第2页列Tangerang工厂，第4页所载证书范围为Design and Manufacture of Paints；官方产品目录第15页明确生产用于油气、管道、码头和桥梁的Heavy Duty Paint及船舶涂料；官网独立关联Penta Prima品牌与PT Bina Adidaya。",
      "sourceName": "Official company profile and 2025 finished-coating catalogue",
      "sourceUrl": "https://pentaprima.co.id/assets/img/bina/compropentaindo.pdf",
      "verifiedAt": "2026-10-12"
    },
    "checkedAt": "2026-10-12",
    "profile": {
      "website": "https://pentaprima.co.id/",
      "contactPage": "https://pentaprima.co.id/profile",
      "generalEmail": "sales@pentaprima.co.id",
      "generalPhone": "+62 21 2938 3000",
      "contacts": [],
      "departmentEmails": [
        {
          "department": "Sales",
          "email": "sales@pentaprima.co.id",
          "source": {
            "label": "Original official profile business inbox",
            "url": "https://pentaprima.co.id/profile"
          }
        }
      ],
      "address": "Factory: Jl. Industri Raya IV Blok AF No.23, Desa Bunder Jatake, Tangerang, Indonesia",
      "sources": [
        {
          "label": "Company legal identity and business contact",
          "url": "https://pentaprima.co.id/profile"
        },
        {
          "label": "Factory and paint design/manufacturing",
          "url": "https://pentaprima.co.id/assets/img/bina/compropentaindo.pdf"
        },
        {
          "label": "Marine and heavy-duty finished paints",
          "url": "https://mail.pentaprima.co.id/assets/img/kartu_warna/katalog%20produk/E-Product%20Catalogue%202025.pdf"
        },
        {
          "label": "Original independent ELO anticorrosion research (laboratory only)",
          "url": "https://www.ebi.ac.uk/europepmc/webservices/rest/PMC8588247/fullTextXML"
        }
      ]
    }
  }
]

const previouslyVerifiedPublicLeads: PublicLead[] = rawPublicLeads.filter((lead) => demandSideLeadIds.has(lead.id) && !isTaiwanMarket(lead.country)).map<PublicLead>((lead) => {
  const qualification = leadQualifications[lead.id]
  if (!qualification) throw new Error(`Missing application qualification for ${lead.id}`)
  const { legacyCompanyDescription: _legacyCompanyDescription, ...record } = lead
  return {
    ...record,
    commercialRole: 'demand_side',
    leadEligible: true,
    // This is intentionally distinct from a purchase claim: it records the
    // public downstream-use rationale that made the company eligible for review.
    demandSideReason: lead.signal,
    targetCompanyTypeId: qualification.targetCompanyTypeId,
    companyEvidence: {
      applicationLayer: qualification.applicationLayer,
      applicationId: qualification.applicationId,
      statement: lead.signal,
      sourceName: lead.source.label,
      sourceUrl: lead.source.url,
      verifiedAt: lead.checkedAt,
    },
    profile: profileFor(lead),
  }
}).concat([
  {
    "id": "teknova-esenyurt",
    "productId": "nl-w1201",
    "company": "Teknova Matbaacılık Kimya Sanayi ve Ticaret A.Ş.",
    "country": "Turkey",
    "countryZh": "土耳其",
    "city": "Istanbul (Esenyurt manufacturing; city-level marker)",
    "latitude": 41.0082,
    "longitude": 28.9784,
    "commercialRole": "demand_side",
    "leadEligible": true,
    "targetCompanyTypeId": "waterborne-ink-manufacturer",
    "fit": "可开发候选",
    "signal": "自有 Esenyurt 工厂生产水性柔版油墨；Hydroflex HP 面向 PE、PP、OPP/BOPP 薄膜，官网要求电晕处理 38–42 dyne。可评估水性油墨附着力底涂方向，不代表已采购或使用 NL-W1201。",
    "demandSideReason": "NL-W1201 TDS 的 PE/PP 表面处理范围，经独立 ICHEMCO 目录支持的水性底涂改善 PP/PE 水性油墨附着类别，连接至 Teknova 自产薄膜水性成品油墨。配方兼容性、基材处理及包装合规须验证，不推断已确认采购需求。",
    "supplierCompetitorCheck": {
      "checkedAt": "2026-10-11",
      "conclusion": "独立复读 https://www.teknova.com.tr/hakkimizda/、https://www.teknova.com.tr/ozel-urunler/、https://www.teknova.com.tr/cases/temsilciliklerimiz/：所查产品为成品油墨/上光涂层、印刷清洁和工艺助剂、设备及胶带；未发现所查公开目录销售 PO/CPO 分散液、水性聚烯烃乳液或同类附着力原料。消泡剂等其他助剂不等于同类原料。Hydroflex 是产品线；代理品牌不是母公司证明。名称、域名、品牌与最新 main、本地正式数据及私有队列无重复；工厂和销售办公室不拆为新增。"
    },
    "contact": {
      "label": "Official general business/orders inbox; not a named procurement contact",
      "email": "siparis@teknova.com.tr",
      "phone": "+90 212 485 3700",
      "contactUrl": "https://www.teknova.com.tr/iletisim/"
    },
    "source": {
      "label": "Official Hydroflex HP waterborne film ink",
      "url": "https://www.teknova.com.tr/hydroflex-hp-serisi-su-bazli-murekkepleri/"
    },
    "companyEvidence": {
      "applicationLayer": "market-extended",
      "applicationId": "waterborne-ink-anchorage-on-pp-pe",
      "statement": "官方生产页确认 Esenyurt 自有设施与水性柔版油墨生产；HP 官方页明确水性体系和 PE/PP/OPP/BOPP 薄膜，并注明电晕处理条件，不能据此推断未处理 PP 性能。",
      "sourceName": "Official Teknova manufacturing and HP product pages",
      "sourceUrl": "https://www.teknova.com.tr/hydroflex-hp-serisi-su-bazli-murekkepleri/",
      "verifiedAt": "2026-10-11"
    },
    "checkedAt": "2026-10-11",
    "profile": {
      "website": "https://www.teknova.com.tr/",
      "contactPage": "https://www.teknova.com.tr/iletisim/",
      "generalEmail": "siparis@teknova.com.tr",
      "generalPhone": "+90 212 485 3700",
      "contacts": [],
      "departmentEmails": [
        {
          "department": "General",
          "email": "siparis@teknova.com.tr",
          "source": {
            "label": "Official business contact page",
            "url": "https://www.teknova.com.tr/iletisim/"
          }
        }
      ],
      "address": "Contact page: Akçaburgaz Mah. 3042. Sk. No:14, Esenyurt/Istanbul, Türkiye. Footer also lists another street address; not a separate customer.",
      "sources": [
        {
          "label": "hp",
          "url": "https://www.teknova.com.tr/hydroflex-hp-serisi-su-bazli-murekkepleri/"
        },
        {
          "label": "manufacturing",
          "url": "https://www.teknova.com.tr/cases/mu%CC%88rekkep-ve-matbaa-kimyasallari-u%CC%88retimi/"
        },
        {
          "label": "about",
          "url": "https://www.teknova.com.tr/hakkimizda/"
        },
        {
          "label": "contact",
          "url": "https://www.teknova.com.tr/iletisim/"
        },
        {
          "label": "products",
          "url": "https://www.teknova.com.tr/ozel-urunler/"
        },
        {
          "label": "brands",
          "url": "https://www.teknova.com.tr/cases/temsilciliklerimiz/"
        },
        {
          "label": "application",
          "url": "https://services.ichemco.com/eng/Catalogs/Ichemco%20Products%20for%20Tapes%20and%20Protective%20Films%202020.pdf"
        }
      ]
    }
  }
]).concat(independentlyVerifiedIndiaCoatingLeads).concat(independentlyVerifiedKanatLeads).concat(independentlyVerifiedTechnicalFinishesLeads).concat(independentlyVerifiedKossanLeads).concat(independentlyVerifiedThaiDonoLeads).concat(independentlyVerifiedVietnamProtectiveLeads).concat(independentlyVerifiedPentaPrimaLeads)

export const publicLeads: PublicLead[] = previouslyVerifiedPublicLeads.concat(verifiedAnjoLeads).concat(verifiedMarindecLeads).concat(verifiedPolenLeads).concat(verifiedSkFormulationsLeads).concat(verifiedArofineLeads).concat(verifiedGenasLeads).concat(verifiedWehaLeads).concat(verifiedMumLeads).concat(verifiedFordonIglLeads).concat(verifiedSonTheHeMoiLeads).concat(verifiedKromaLeads).concat(verifiedTintasVinciLeads)
