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
    searchLogic: '优先寻找实际使用功能添加剂的聚合物配方、增塑剂使用型 compound、涂料、胶黏剂、油墨、密封剂和树脂改性企业，而非只搜 ELO 生产商；PVC、电缆与柔性 PVC 仅在有来源的市场扩展应用下搜索。',
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
  { id: 'polymer-formulator', productId: 'elo', name: '聚合物配方商', nameEn: 'Polymer Formulator', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'polymer-plasticizer' }, { layer: 'tds-verified', applicationId: 'polymer-stabilizer' }] },
  { id: 'plasticizer-using-polymer-compounder', productId: 'elo', name: '增塑剂使用型聚合物配方商', nameEn: 'Plasticizer-Using Polymer Compounder', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'polymer-plasticizer' }] },
  { id: 'pvc-compound-manufacturer', productId: 'elo', name: 'PVC 配方生产商（需扩展证据）', nameEn: 'PVC Compound Manufacturer (Sourced Extension Required)', kind: 'target', applicationReferences: [{ layer: 'market-extended', applicationId: 'elo-pvc-plasticizer' }] },
  { id: 'elo-coating-manufacturer', productId: 'elo', name: '涂料生产商', nameEn: 'Coating Manufacturer', kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: 'coatings' }] },
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
    legacyCompanyDescription: '控释肥 / 特种肥生产商', fit: '可开发候选',
    signal: '官方控释肥资料公开了其 Multicote 产品线和总部公开业务邮箱。',
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
]

type LeadQualification = Pick<CompanyEvidence, 'applicationLayer' | 'applicationId'> & { targetCompanyTypeId: string }

const leadQualifications: Record<string, LeadQualification> = {
  'icl-charleston': { targetCompanyTypeId: 'controlled-release-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
  'haifa-israel': { targetCompanyTypeId: 'specialty-fertilizer-manufacturer', applicationLayer: 'tds-verified', applicationId: 'controlled-release-fertilizer' },
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
  'mica-shelton',
  'ac-profil-huttwil',
  'nutrien-carseland',
  'ichemco-cuggiono',
  'polymer-chemie-bad-sobernheim',
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
