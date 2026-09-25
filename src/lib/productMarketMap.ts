export type MarketProduct = {
  id: 'fertilizer-coating' | 'nl-w1201' | 'elo'
  name: string
  nameEn: string
  color: string
  customerTypes: string[]
  searchTerms: string[]
  tdsScope: string
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
  customerType: string
  fit: '优先核验' | '可开发候选' | '替代方案研究'
  signal: string
  contact: { label: string; email?: string; phone?: string; contactUrl?: string }
  source: { label: string; url: string }
  checkedAt: string
}

export const marketProducts: MarketProduct[] = [
  {
    id: 'fertilizer-coating', name: '缓释肥料包膜原料', nameEn: 'Controlled-release Fertilizer Coating Material', color: '#d97706',
    customerTypes: ['控释肥 / 缓释肥生产商', '包膜尿素生产线', '特种肥配方商'],
    searchTerms: ['controlled-release fertilizer manufacturer', 'coated urea producer', 'fertilizer coating line'],
    tdsScope: '基于已提供产品介绍：用于控释肥、包膜尿素及相关包膜工艺；具体配方、释放期和合规须逐案确认。',
  },
  {
    id: 'nl-w1201', name: 'NL-W1201 水性表面处理剂', nameEn: 'Water-Based Surface Treatment Agent', color: '#0f766e',
    customerTypes: ['水性涂料 / 油墨配方商', '软包装与薄膜复合商', 'PP / PE 表面处理商'],
    searchTerms: ['water-based PP primer manufacturer', 'polyolefin dispersion coatings', 'PP PE OPP adhesion promoter'],
    tdsScope: '基于已提供英文 TDS：面向 PP、PE、OPP 等低表面能材料的水性底涂 / 附着力促进应用；终端体系需测试确认。',
  },
  {
    id: 'elo', name: '环氧化亚麻油 ELO', nameEn: 'Epoxidized Linseed Oil', color: '#7c3aed',
    customerTypes: ['PVC / 塑料配方商', '涂料与胶黏剂配方商', '油墨、密封胶与树脂改性商'],
    searchTerms: ['epoxidized linseed oil formulator', 'bio-based plasticizer manufacturer', 'epoxidized oil coatings adhesives'],
    tdsScope: '基于已提供英文 TDS：ELO 可作为聚合物添加剂，并用于涂料、胶黏剂、油墨、密封胶和树脂改性；适用性须由客户配方验证。',
  },
]

// These are public-business-contact research leads, not confirmed buyers or demand claims.
// Every visible contact is paired with its first-party source and a verification date.
export const publicLeads: PublicLead[] = [
  {
    id: 'icl-charleston', productId: 'fertilizer-coating', company: 'ICL Growing Solutions Charleston', country: 'United States', countryZh: '美国', city: 'Charleston, South Carolina', latitude: 32.7765, longitude: -79.9311,
    customerType: '控释肥生产商', fit: '优先核验',
    signal: '官方工厂页面说明该地生产包膜控释肥，并设有面向控释肥的产品负责人。',
    contact: { label: 'Jolene Miller · Product Lead, Controlled Release Fertilizers', email: 'jolene.miller@icl-group.com', phone: '+1 843-609-2859', contactUrl: 'https://icl-growingsolutions.com/en-us/agriculture/our-experts/' },
    source: { label: 'ICL Charleston production site', url: 'https://icl-growingsolutions.com/en-us/about/production-sites/icl-growing-solutions-charleston/' }, checkedAt: '2026-09-25',
  },
  {
    id: 'haifa-israel', productId: 'fertilizer-coating', company: 'Haifa Group', country: 'Israel', countryZh: '以色列', city: 'Haifa', latitude: 32.7940, longitude: 34.9896,
    customerType: '控释肥 / 特种肥生产商', fit: '可开发候选',
    signal: '官方控释肥资料公开了其 Multicote 产品线和总部公开业务邮箱。',
    contact: { label: 'Haifa Group general business contact', email: 'info@haifa-group.com', phone: '+972-74-7373737', contactUrl: 'https://www.haifa-group.com/' },
    source: { label: 'Haifa Multicote controlled-release fertilizer handbook', url: 'https://www.haifa-group.com/files/Knowledge_Center/Articles/Multicote_Agri_Handbook_final.pdf' }, checkedAt: '2026-09-25',
  },
  {
    id: 'aqua-based-us', productId: 'nl-w1201', company: 'Aqua Based Technologies', country: 'United States', countryZh: '美国', city: 'Northvale, New Jersey', latitude: 41.0068, longitude: -73.9496,
    customerType: '水性 PP / PE / OPP 底涂与软包装配方商', fit: '替代方案研究',
    signal: '官方页面列出 PP、PE 薄膜用水性底涂产品；可作为技术路线、竞品与原料合作方向核验。',
    contact: { label: 'Public business email', email: 'info@aquabased.com', phone: '+1 201-767-6040', contactUrl: 'https://www.aquabased.com/primers/' },
    source: { label: 'Aqua Based water-based primers', url: 'https://www.aquabased.com/primers/' }, checkedAt: '2026-09-25',
  },
  {
    id: 'paramelt-netherlands', productId: 'nl-w1201', company: 'Paramelt B.V.', country: 'Netherlands', countryZh: '荷兰', city: 'Heerhugowaard', latitude: 52.6714, longitude: 4.8333,
    customerType: '水性聚烯烃分散体 / 包装涂层配方商', fit: '替代方案研究',
    signal: '官方技术页说明其水性聚烯烃分散体可用于底涂、粘结层和水性涂层配方。',
    contact: { label: 'Europe, Middle East and Africa business line', phone: '+31 72 575 0600', contactUrl: 'https://www.paramelt.com/paramelt-bv/' },
    source: { label: 'Paramelt water-based coatings', url: 'https://www.paramelt.com/coatings/water-based-coatings/' }, checkedAt: '2026-09-25',
  },
  {
    id: 'nippon-paper-japan', productId: 'nl-w1201', company: 'Nippon Paper Group', country: 'Japan', countryZh: '日本', city: 'Tokyo', latitude: 35.6762, longitude: 139.6503,
    customerType: 'PP 水性底涂 / 水性油墨与胶黏剂配方商', fit: '替代方案研究',
    signal: '官方产品页说明其水性改性聚烯烃可用于 PP 底涂、水性油墨与胶黏剂。',
    contact: { label: 'Chemical Sales Dept. I', phone: '+81-3-6665-5940', contactUrl: 'https://www.nipponpapergroup.com/english/products/waterborne.html' },
    source: { label: 'AUROREN waterborne modified polyolefin', url: 'https://www.nipponpapergroup.com/english/products/waterborne.html' }, checkedAt: '2026-09-25',
  },
  {
    id: 'polar-canada', productId: 'elo', company: 'Polar Industries, Inc.', country: 'Canada', countryZh: '加拿大', city: 'Fisher Branch, Manitoba', latitude: 51.0833, longitude: -97.5500,
    customerType: 'ELO 配方与环氧化油应用商', fit: '替代方案研究',
    signal: '官方页面说明其 ELO 用于涂料、增塑剂、胶黏剂等应用；适合作为应用与采购角色的核验对象。',
    contact: { label: 'Public business email', email: 'polarindustry@yahoo.com', phone: '+1 204-372-8482', contactUrl: 'https://polarindustries.net/EpoxidizedOil.html' },
    source: { label: 'Polar Industries HiBond ELO', url: 'https://polarindustries.net/EpoxidizedOil.html' }, checkedAt: '2026-09-25',
  },
  {
    id: 'pursell-sylacauga', productId: 'fertilizer-coating', company: 'Pursell Fertilizer', country: 'United States', countryZh: '美国', city: 'Sylacauga, Alabama', latitude: 33.1732, longitude: -86.2516,
    customerType: '控释肥生产商', fit: '优先核验',
    signal: '官网将其定位为新一代控释肥，并公开国际销售负责人的业务邮箱和工厂咨询入口。',
    contact: { label: 'Jason Woulfin · Director of International Sales', email: 'jason@fertilizer.com', phone: '+1 256-208-9509', contactUrl: 'https://fertilizer.com/contact-us/' },
    source: { label: 'Pursell controlled-release fertilizer contact page', url: 'https://fertilizer.com/contact-us/' }, checkedAt: '2026-09-25',
  },
  {
    id: 'cotex-dartmouth', productId: 'fertilizer-coating', company: 'CoteX', country: 'Canada', countryZh: '加拿大', city: 'Dartmouth, Nova Scotia', latitude: 44.6713, longitude: -63.5772,
    customerType: '聚合物包膜控释肥生产商', fit: '优先核验',
    signal: '官网公开聚合物包膜控释肥和平板型包膜肥技术，并公布公司地址与业务邮箱。',
    contact: { label: 'Public business email', email: 'info@cotexcorp.com', phone: '+1 902-580-2963', contactUrl: 'https://www.cotextech.com/' },
    source: { label: 'CoteX controlled-release fertilizer technology', url: 'https://www.cotextech.com/' }, checkedAt: '2026-09-25',
  },
  {
    id: 'simofert-beuningen', productId: 'fertilizer-coating', company: 'Simonis Fertilizers B.V.', country: 'Netherlands', countryZh: '荷兰', city: 'Beuningen', latitude: 51.8603, longitude: 5.7690,
    customerType: '控释肥生产商 / 出口商', fit: '可开发候选',
    signal: '官网明确列出 Control Release Fertilizers，并说明可生产定制化肥料配方。',
    contact: { label: 'Public business email', email: 'fertilizer@simofert.nl', phone: '+31 24-204-2360', contactUrl: 'https://www.simofert.nl/' },
    source: { label: 'Simonis Fertilizers product overview', url: 'https://www.simofert.nl/' }, checkedAt: '2026-09-25',
  },
  {
    id: 'sk-specialties-sibu', productId: 'fertilizer-coating', company: 'SK Specialties Sdn. Bhd.', country: 'Malaysia', countryZh: '马来西亚', city: 'Sibu, Sarawak', latitude: 2.2870, longitude: 111.8310,
    customerType: '聚合物包膜控释肥生产商', fit: '优先核验',
    signal: '官网称其使用聚合物包膜技术生产控释肥，并公开业务邮箱、电话与工厂地址。',
    contact: { label: 'Public business email', email: 'enquiry@skspecialties.com.my', phone: '+60 84-213688', contactUrl: 'https://www.skspecialties.com.my/contact-us/' },
    source: { label: 'SK Specialties controlled-release fertilizer contact page', url: 'https://www.skspecialties.com.my/contact-us/' }, checkedAt: '2026-09-25',
  },
  {
    id: 'smart-fert-klang', productId: 'fertilizer-coating', company: 'Smart Fert Sdn Bhd', country: 'Malaysia', countryZh: '马来西亚', city: 'Klang, Selangor', latitude: 2.9970, longitude: 101.3884,
    customerType: '聚合物包膜尿素 / 控释肥生产商', fit: '优先核验',
    signal: '官网列出聚合物包膜尿素与多款控释肥，并公开销售邮箱和工厂地址。',
    contact: { label: 'Public sales email', email: 'sales@smart-fert.com', phone: '+60 3-3101-5931', contactUrl: 'https://www.smart-fert.com/products/' },
    source: { label: 'Smart Fert controlled-release fertilizer products', url: 'https://www.smart-fert.com/products/' }, checkedAt: '2026-09-25',
  },
  {
    id: 'aline-detroit', productId: 'nl-w1201', company: 'A-Line Products Corporation', country: 'United States', countryZh: '美国', city: 'Detroit, Michigan', latitude: 42.3346, longitude: -83.0005,
    customerType: '水性 PP / TPO 附着力促进剂与涂层配方商', fit: '替代方案研究',
    signal: '官网公开水性聚烯烃附着力促进剂用于 PP、TPO 基材，并提供底涂与涂层产品。',
    contact: { label: 'Official contact form and business line', phone: '+1 313-571-8300', contactUrl: 'https://a-line.com/contact-us/' },
    source: { label: 'A-Line waterborne adhesion promoter products', url: 'https://a-line.com/products/' }, checkedAt: '2026-09-25',
  },
  {
    id: 'rstone-jiaxing', productId: 'nl-w1201', company: 'Jiaxing RSTONE Chemical Co., Ltd.', country: 'China', countryZh: '中国', city: 'Jiaxing, Zhejiang', latitude: 30.7461, longitude: 120.7550,
    customerType: '水性聚烯烃树脂 / 塑胶基材涂层配方商', fit: '替代方案研究',
    signal: '官网产品目录公开水性聚烯烃树脂及其对低附着基材的润湿、快干和适配方向。',
    contact: { label: 'Public business email', email: 'sale@rstone-resin.com', phone: '+86 573-82203606', contactUrl: 'https://www.rstone-resin.com/en/product/' },
    source: { label: 'RSTONE water-borne polyolefin resin product list', url: 'https://www.rstone-resin.com/en/product/' }, checkedAt: '2026-09-25',
  },
  {
    id: 'tize-zhaoqing', productId: 'nl-w1201', company: 'Guangdong Tize New Tech Material Co., Ltd.', country: 'China', countryZh: '中国', city: 'Zhaoqing, Guangdong', latitude: 23.0528, longitude: 112.4651,
    customerType: '水性树脂与附着力促进剂配方商', fit: '替代方案研究',
    signal: '官网产品线列出 Waterborne Adhesion Promoter 及多类水性树脂，适合进入技术路线和原料合作筛选。',
    contact: { label: 'Public business email', email: 'junnia@zqtize.com', phone: '+86 758-7739919', contactUrl: 'https://zqtize.com/cate-38687.html' },
    source: { label: 'Tize waterborne resin and adhesion promoter line', url: 'https://zqtize.com/cate-38687.html' }, checkedAt: '2026-09-25',
  },
  {
    id: 'tramaco-tornesch', productId: 'nl-w1201', company: 'TRAMACO GmbH', country: 'Germany', countryZh: '德国', city: 'Tornesch', latitude: 53.6990, longitude: 9.7180,
    customerType: 'PP / PE / TPO 底涂与附着力促进剂配方商', fit: '替代方案研究',
    signal: '官方资料说明其底涂和附着力促进剂用于 PP、PE、TPO 等难涂覆塑料，并用于涂料、油墨和胶黏剂。',
    contact: { label: 'Primer technical contact', email: 'primer@tramaco.de', phone: '+49 4101-706-02', contactUrl: 'https://www.rowa-group.com/fileadmin/user_upload/ROWAnews_01_2022_en_web.pdf' },
    source: { label: 'TRAMACO primer application note', url: 'https://www.rowa-group.com/fileadmin/user_upload/ROWAnews_01_2022_en_web.pdf' }, checkedAt: '2026-09-25',
  },
  {
    id: 'unitika-tokyo', productId: 'nl-w1201', company: 'UNITIKA LTD. Plastics Division', country: 'Japan', countryZh: '日本', city: 'Tokyo', latitude: 35.6762, longitude: 139.6503,
    customerType: 'PP 水性聚烯烃底涂与薄膜复合配方商', fit: '替代方案研究',
    signal: '官方资料说明改性聚烯烃水性分散体面向 PP 的附着力需求，覆盖电子、汽车、建材与工业复合应用。',
    contact: { label: 'Tokyo Plastics Division', phone: '+81 3-3246-7610', contactUrl: 'https://www.unitika.co.jp/plastics/products/a-base/pdf/arrowbase02_unitika.pdf' },
    source: { label: 'UNITIKA Arrowbase water-based PP primer', url: 'https://www.unitika.co.jp/plastics/products/a-base/pdf/arrowbase02_unitika.pdf' }, checkedAt: '2026-09-25',
  },
  {
    id: 'cargill-minneapolis', productId: 'elo', company: 'Cargill Bioindustrial', country: 'United States', countryZh: '美国', city: 'Minneapolis, Minnesota', latitude: 44.9778, longitude: -93.2650,
    customerType: 'ELO / PVC 增塑剂与稳定剂配方商', fit: '替代方案研究',
    signal: '官方产品资料列出 Vikoflex 7190 环氧化亚麻油及 PVC 增塑、稳定应用，并公开业务邮箱。',
    contact: { label: 'Plasticizers business team', email: 'plasticizers@cargill.com', contactUrl: 'https://www.cargill.com/doc/1432225010751/plasticizres-vikoflex-7190.pdf' },
    source: { label: 'Cargill Vikoflex 7190 ELO product data', url: 'https://www.cargill.com/doc/1432225010751/plasticizres-vikoflex-7190.pdf' }, checkedAt: '2026-09-25',
  },
  {
    id: 'acs-griffith', productId: 'elo', company: 'ACS Technical Products, Inc.', country: 'United States', countryZh: '美国', city: 'Griffith, Indiana', latitude: 41.5284, longitude: -87.4236,
    customerType: 'ELO / PVC、涂料与润滑油配方商', fit: '替代方案研究',
    signal: '官网公开 EPOXOL 9-5 环氧化亚麻油，以及 PVC、涂料和润滑油等市场应用。',
    contact: { label: 'Official sample / quote request', phone: '+1 219-924-4370', contactUrl: 'https://www.acstech.com/products/epoxol-9-5/' },
    source: { label: 'ACS EPOXOL 9-5 ELO applications', url: 'https://www.acstech.com/products/epoxol-9-5/' }, checkedAt: '2026-09-25',
  },
  {
    id: 'inbra-orangeburg', productId: 'elo', company: 'INBRA Indústria Química', country: 'United States', countryZh: '美国', city: 'Orangeburg, South Carolina', latitude: 33.4918, longitude: -80.8556,
    customerType: 'PVC 增塑剂与 ELO 配方商', fit: '替代方案研究',
    signal: '官网的增塑剂产品页明确提及环氧化亚麻油用于 PVC 配方，并公开业务电话和联系入口。',
    contact: { label: 'Official contact page', phone: '+55 11-4061-9000', contactUrl: 'https://inbra.com.br/en/produtos/plastificantes/' },
    source: { label: 'INBRA epoxidized linseed oil plasticizer page', url: 'https://inbra.com.br/en/produtos/plastificantes/' }, checkedAt: '2026-09-25',
  },
  {
    id: 'adeka-tokyo', productId: 'elo', company: 'ADEKA Corporation', country: 'Japan', countryZh: '日本', city: 'Tokyo', latitude: 35.6762, longitude: 139.6503,
    customerType: 'ELO / PVC 增塑剂、稳定剂配方商', fit: '替代方案研究',
    signal: '官方产品页列出环氧化亚麻油型环氧增塑剂及 PVC 薄膜、线缆、管材等应用方向。',
    contact: { label: 'Official product enquiry', contactUrl: 'https://www.adeka.co.jp/en/chemical/products/pvc/pro121c.html' },
    source: { label: 'ADEKA epoxy plasticizers product page', url: 'https://www.adeka.co.jp/en/chemical/products/pvc/pro121c.html' }, checkedAt: '2026-09-25',
  },
  {
    id: 'traditem-hilden', productId: 'elo', company: 'Traditem GmbH', country: 'Germany', countryZh: '德国', city: 'Hilden', latitude: 51.1675, longitude: 6.9309,
    customerType: 'ELO 化工分销与配方供应商', fit: '可开发候选',
    signal: '官网化学品目录列出环氧化亚麻油 CAS 8016-11-3，并公开德国业务邮箱与电话。',
    contact: { label: 'Public business email', email: 'info@traditem.com', phone: '+49 2103-25372-90', contactUrl: 'https://traditem.com/en/products/epoxies' },
    source: { label: 'Traditem epoxidized linseed oil listing', url: 'https://traditem.com/en/products/epoxies' }, checkedAt: '2026-09-25',
  },
]
