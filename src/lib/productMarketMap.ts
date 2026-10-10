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

export type CompanyContact = {
  name: string
  title?: string
  department?: 'Sales' | 'Procurement' | 'Technical' | 'Production' | 'Management' | 'Other'
  email?: string
  phone?: string
  linkedIn?: string
  source?: { label: string; url: string }
  verifiedAt?: string
}

export type DepartmentEmail = {
  department: 'Sales' | 'Procurement' | 'Technical' | 'Production' | 'General'
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
    id: 'jieh-ming-new-taipei', productId: 'elo', company: 'Jieh-Ming Plastics Mfg. Co., Ltd.', country: 'Taiwan', countryZh: '中国台湾', city: 'New Taipei City', latitude: 24.9909, longitude: 121.4215,
    legacyCompanyDescription: 'PVC 配方与挤出制品制造商', fit: '可开发候选',
    signal: '官网显示该公司在新北拥有 PVC compound 生产线与工厂；其 NonP PVC compound 产品页明确说明 PVC 配方材料包括 plasticizer，且公司将该类 compound 用于医疗、软管和挤出制品。PVC 配方属于有独立来源支持的 ELO 增塑剂市场扩展场景，可核验增塑剂/稳定剂原料采购。',
    supplierCompetitorCheck: { checkedAt: '2026-09-26', conclusion: '已复核官方 PVC compound 与公司生产页：其公开业务为 PVC compound 和下游塑料制品制造；本轮检索的官方来源未显示其生产或销售 ELO、环氧化植物油或同类增塑剂原料。' },
    contact: { label: 'Jieh-Ming public business contact', email: 'spring@hose.com.tw', phone: '+886 2-2689-5731', contactUrl: 'https://www.hose.com.tw/' },
    source: { label: 'Jieh-Ming PVC compound and plasticizer-use description', url: 'https://www.hose.com.tw/pvc-compound/' }, checkedAt: '2026-09-26',
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
]

type LeadQualification = Pick<CompanyEvidence, 'applicationLayer' | 'applicationId'> & { targetCompanyTypeId: string }

const leadQualifications: Record<string, LeadQualification> = {
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
  'jieh-ming-new-taipei': { targetCompanyTypeId: 'pvc-compound-manufacturer', applicationLayer: 'market-extended', applicationId: 'elo-pvc-plasticizer' },
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
  'jieh-ming-new-taipei': {
    contacts: [],
    departmentEmails: [],
    sources: [{
      label: 'Jieh-Ming factory and PVC compound production lines',
      url: 'https://www.hose.com.tw/aboutus/',
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
  'jieh-ming-new-taipei',
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

export const publicLeads: PublicLead[] = rawPublicLeads.filter((lead) => demandSideLeadIds.has(lead.id)).map((lead) => {
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
})
