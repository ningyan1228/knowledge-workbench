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

export type CompanyContact = {
  name: string
  title?: string
  department?: 'Sales' | 'Procurement' | 'Technical' | 'Management' | 'Other'
  email?: string
  phone?: string
  linkedIn?: string
  source?: { label: string; url: string }
}

export type DepartmentEmail = {
  department: 'Sales' | 'Procurement' | 'Technical' | 'General'
  email: string
  source?: { label: string; url: string }
}

export type CompanyProfile = {
  website?: string
  contactPage?: string
  linkedIn?: string
  whatsapp?: string
  generalEmail?: string
  generalPhone?: string
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
    searchLogic: '从已验证包膜场景反查肥料生产商：控释肥 / 缓释肥 → 包膜尿素 / 包膜复合肥 → 特种肥生产商。',
    searchTerms: ['controlled-release fertilizer manufacturer', 'slow-release fertilizer manufacturer', 'polymer-coated urea manufacturer', 'coated compound fertilizer manufacturer'],
    tdsScope: '基于已提供产品介绍：用于控释肥、包膜尿素及相关包膜工艺；具体配方、释放期和合规须逐案确认。',
  },
  {
    id: 'nl-w1201', name: 'NL-W1201 水性表面处理剂', nameEn: 'Water-Based Surface Treatment Agent', color: '#0f766e',
    tdsApplicationIds: ['untreated-pp-primer', 'pe-primer', 'opp-primer', 'pet-primer', 'abs-surface-treatment'],
    searchLogic: '按“已验证基材 + primer / adhesion promoter + 配方商或涂料企业”寻找，不把终端行业推断为 TDS 应用。',
    searchTerms: ['PP primer formulator', 'PE OPP adhesion promoter manufacturer', 'water-based polyolefin primer formulator', 'coating adhesion promoter company'],
    tdsScope: '基于已提供英文 TDS：面向 PP、PE、OPP 等低表面能材料的水性底涂 / 附着力促进应用；终端体系需测试确认。',
  },
  {
    id: 'elo', name: '环氧化亚麻油 ELO', nameEn: 'Epoxidized Linseed Oil', color: '#7c3aed',
    tdsApplicationIds: ['polymer-plasticizer', 'polymer-stabilizer', 'coatings', 'adhesives', 'inks', 'sealants', 'resin-modification'],
    searchLogic: '优先寻找实际使用功能添加剂的聚合物配方、增塑剂复配、涂料、胶黏剂、油墨、密封剂和树脂改性企业，而非只搜 ELO 生产商。',
    searchTerms: ['polymer formulator plasticizer user', 'plasticizer compounder', 'coating manufacturer bio-based additive', 'adhesive ink sealant resin formulator'],
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
  { id: 'metal-primer', productId: 'nl-w1201', name: '金属附着力促进', nameEn: 'Metal Primer / Adhesion Promotion', description: '用于金属基材附着力促进。', sourceDocument: '用户提供：NL-W1201 TDS' },
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
  { id: 'elo-pvc-plasticizer', productId: 'elo', name: 'PVC 增塑剂应用', nameEn: 'PVC Plasticizer Application', basedOnTdsApplicationId: 'polymer-plasticizer', sourceName: 'INBRA epoxidized linseed oil plasticizer page', sourceUrl: 'https://inbra.com.br/en/produtos/plastificantes/', verifiedAt: '2026-09-25' },
]

export const targetCompanyTypes: TargetCompanyType[] = [
  { id: 'controlled-release-fertilizer-manufacturer', productId: 'fertilizer-coating', name: '控释肥生产商', nameEn: 'Controlled Release Fertilizer Manufacturer', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'controlled-release-fertilizer' }] },
  { id: 'slow-release-fertilizer-manufacturer', productId: 'fertilizer-coating', name: '缓释肥生产商', nameEn: 'Slow Release Fertilizer Manufacturer', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'slow-release-fertilizer' }] },
  { id: 'polymer-coated-urea-manufacturer', productId: 'fertilizer-coating', name: '聚合物包膜尿素生产商', nameEn: 'Polymer-Coated Urea Manufacturer', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'coated-urea' }, { layer: 'tds-verified', applicationId: 'polyurethane-coated-urea' }] },
  { id: 'coated-urea-manufacturer', productId: 'fertilizer-coating', name: '包膜尿素生产商', nameEn: 'Coated Urea Manufacturer', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'coated-urea' }] },
  { id: 'coated-compound-fertilizer-manufacturer', productId: 'fertilizer-coating', name: '包膜复合肥生产商', nameEn: 'Coated Compound Fertilizer Manufacturer', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'coated-compound-fertilizer' }] },
  { id: 'specialty-fertilizer-manufacturer', productId: 'fertilizer-coating', name: '特种肥生产商', nameEn: 'Specialty Fertilizer Manufacturer', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'controlled-release-fertilizer' }, { layer: 'tds-verified', applicationId: 'slow-release-fertilizer' }] },
  { id: 'primer-adhesion-promoter-formulator', productId: 'nl-w1201', name: '水性底涂 / 附着力促进剂配方商', nameEn: 'Primer / Adhesion Promoter Formulator', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'untreated-pp-primer' }, { layer: 'tds-verified', applicationId: 'pe-primer' }, { layer: 'tds-verified', applicationId: 'opp-primer' }, { layer: 'tds-verified', applicationId: 'pet-primer' }, { layer: 'tds-verified', applicationId: 'abs-surface-treatment' }] },
  { id: 'coating-manufacturer', productId: 'nl-w1201', name: '涂料企业', nameEn: 'Coating Manufacturer', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'untreated-pp-primer' }, { layer: 'tds-verified', applicationId: 'metal-primer' }, { layer: 'tds-verified', applicationId: 'glass-adhesion-promotion' }] },
  { id: 'alternative-primer-supplier', productId: 'nl-w1201', name: '底涂 / 附着力促进剂技术路线供应商', nameEn: 'Alternative Primer Supplier', kind: 'alternative-research', applicationReferences: [{ layer: 'tds-verified', applicationId: 'untreated-pp-primer' }] },
  { id: 'polymer-formulator', productId: 'elo', name: '聚合物配方商', nameEn: 'Polymer Formulator', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'polymer-plasticizer' }, { layer: 'tds-verified', applicationId: 'polymer-stabilizer' }] },
  { id: 'plasticizer-user-compounder', productId: 'elo', name: '增塑剂使用商 / 复配商', nameEn: 'Plasticizer User / Compounder', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'polymer-plasticizer' }, { layer: 'market-extended', applicationId: 'elo-pvc-plasticizer' }] },
  { id: 'elo-coating-manufacturer', productId: 'elo', name: '涂料生产商', nameEn: 'Coating Manufacturer', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'coatings' }] },
  { id: 'adhesive-manufacturer', productId: 'elo', name: '胶黏剂生产商', nameEn: 'Adhesive Manufacturer', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'adhesives' }] },
  { id: 'ink-manufacturer', productId: 'elo', name: '油墨生产商', nameEn: 'Ink Manufacturer', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'inks' }] },
  { id: 'sealant-manufacturer', productId: 'elo', name: '密封剂生产商', nameEn: 'Sealant Manufacturer', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'sealants' }] },
  { id: 'resin-modifier-formulator', productId: 'elo', name: '树脂改性 / 配方商', nameEn: 'Resin Modifier / Formulator', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'resin-modification' }] },
  { id: 'alternative-elo-supplier', productId: 'elo', name: 'ELO 技术路线供应商', nameEn: 'Alternative ELO Supplier', kind: 'alternative-research', applicationReferences: [{ layer: 'tds-verified', applicationId: 'polymer-plasticizer' }] },
]

// These are public-business-contact research leads, not confirmed buyers or demand claims.
// Every visible contact is paired with its first-party source and a verification date.
// Kept only as the original research note; it is deliberately not exposed as the lead relationship.
type RawPublicLead = Omit<PublicLead, 'profile' | 'targetCompanyTypeId' | 'companyEvidence'> & { legacyCompanyDescription: string }
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
    legacyCompanyDescription: '控释肥 / 特种肥生产商', fit: '可开发候选',
    signal: '官方控释肥资料公开了其 Multicote 产品线和总部公开业务邮箱。',
    contact: { label: 'Haifa Group general business contact', email: 'info@haifa-group.com', phone: '+972-74-7373737', contactUrl: 'https://www.haifa-group.com/' },
    source: { label: 'Haifa Multicote controlled-release fertilizer handbook', url: 'https://www.haifa-group.com/files/Knowledge_Center/Articles/Multicote_Agri_Handbook_final.pdf' }, checkedAt: '2026-09-25',
  },
  {
    id: 'aqua-based-us', productId: 'nl-w1201', company: 'Aqua Based Technologies', country: 'United States', countryZh: '美国', city: 'Northvale, New Jersey', latitude: 41.0068, longitude: -73.9496,
    legacyCompanyDescription: '水性 PP / PE / OPP 底涂与软包装配方商', fit: '替代方案研究',
    signal: '官方页面列出 PP、PE 薄膜用水性底涂产品；可作为技术路线、竞品与原料合作方向核验。',
    contact: { label: 'Public business email', email: 'info@aquabased.com', phone: '+1 201-767-6040', contactUrl: 'https://www.aquabased.com/primers/' },
    source: { label: 'Aqua Based water-based primers', url: 'https://www.aquabased.com/primers/' }, checkedAt: '2026-09-25',
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
]

type LeadQualification = Pick<CompanyEvidence, 'applicationLayer' | 'applicationId'> & { targetCompanyTypeId: string }

const leadQualifications: Record<string, LeadQualification> = {
  'icl-charleston': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'haifa-israel': { targetCompanyTypeId: 'specialty-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'pursell-sylacauga': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'cotex-dartmouth': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'simofert-beuningen': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'sk-specialties-sibu': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'smart-fert-klang': { targetCompanyTypeId: 'polymer-coated-urea-manufacturer', applicationLayer: 'tds-verified', applicationId: 'coated-urea' },
  'aqua-based-us': { targetCompanyTypeId: 'alternative-primer-supplier', applicationLayer: 'tds-verified', applicationId: 'untreated-pp-primer' },
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
  'inbra-orangeburg': { targetCompanyTypeId: 'plasticizer-user-compounder', applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' },
  'adeka-tokyo': { targetCompanyTypeId: 'alternative-elo-supplier', applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' },
  'traditem-hilden': { targetCompanyTypeId: 'alternative-elo-supplier', applicationLayer: 'tds-verified', applicationId: 'polymer-plasticizer' },
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
  'icl-charleston': {
    contacts: [{
      name: 'Jolene Miller', title: 'Product Lead, Controlled Release Fertilizers', department: 'Technical',
      email: 'jolene.miller@icl-group.com', phone: '+1 843-609-2859',
      source: { label: 'ICL agriculture experts directory', url: 'https://icl-growingsolutions.com/en-us/agriculture/our-experts/' },
    }],
    departmentEmails: [{ department: 'Technical', email: 'jolene.miller@icl-group.com', source: { label: 'ICL agriculture experts directory', url: 'https://icl-growingsolutions.com/en-us/agriculture/our-experts/' } }],
  },
  'pursell-sylacauga': {
    contacts: [{
      name: 'Jason Woulfin', title: 'Director of International Sales', department: 'Sales',
      email: 'jason@fertilizer.com', phone: '+1 256-208-9509',
      source: { label: 'Pursell contact page', url: 'https://fertilizer.com/contact-us/' },
    }],
    departmentEmails: [{ department: 'Sales', email: 'jason@fertilizer.com', source: { label: 'Pursell contact page', url: 'https://fertilizer.com/contact-us/' } }],
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

export const publicLeads: PublicLead[] = rawPublicLeads.map((lead) => {
  const qualification = leadQualifications[lead.id]
  if (!qualification) throw new Error(`Missing application qualification for ${lead.id}`)
  const { legacyCompanyDescription: _legacyCompanyDescription, ...record } = lead
  return {
    ...record,
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
})
