import type { MarketProduct, TargetCompanyType, TdsVerifiedApplication } from './productMarketMap'
import type { ProductSummary } from './types'

export const supportedProductIds = ['cpp-cpo', 'fertilizer-coating', 'nl-w1201', 'elo', 'nl-8260', 'nl-h-860'] as const
export const newWaterborneProductIds = ['nl-8260', 'nl-h-860'] as const
export const suppliedTds = {
  'nl-8260': { file: 'tds/nl-8260-tds-en.pdf', label: 'NL-8260 英文 TDS', checkedAt: '2026-11-27', sha256: 'cc88835acade4f976b0cc8baa0a6f56a829dd96bc3c46cb862bbd30a548c3722' },
  'nl-h-860': { file: 'tds/nl-h-860-tds-en.pdf', label: 'NL-H-860 英文 TDS · Rev.01', checkedAt: '2026-11-27', sha256: 'aabb8f2e55dd9dc2a7ae3f517f1d2b0fd5ee39ce8096fa6c9ac7610b040b7621' },
} as const

export const waterborneMarketProducts: MarketProduct[] = [
  { id: 'nl-8260', name: 'NL-8260 水性氯化聚烯烃附着力促进剂', nameEn: 'Waterborne Chlorinated Polyolefin Adhesion Promoter', color: '#be185d',
    tdsApplicationIds: ['nl8260-pp-opp-inks', 'nl8260-pp-tpo-coatings', 'nl8260-pe-coatings', 'nl8260-pvc-epdm-coatings', 'nl8260-paper-coatings', 'nl8260-adhesives'],
    searchLogic: '核验自主生产或配制 PP/OPP 油墨、PP/TPO 或 PE 塑料涂料、PVC/EPDM 涂料、纸张涂层及相关胶黏剂的需求侧企业。汽车、编织袋、纸包装等须有该公司实际产品/工艺证据；单纯印刷、涂装、经销不代替配方或原料使用能力。排除同类 CPO/CPP 附着促进原料供应商，跨六产品按公司/集团去重。',
    searchTerms: ['PP OPP printing ink manufacturer', 'PP TPO plastic coating formulator', 'PVC EPDM coating manufacturer', 'paper coating adhesive formulator'],
    tdsScope: '用户英文 TDS 明列 PP、PE、PVC、EPDM、纸张、金属件及 PP/TPO/OPP 表面附着方向，用于油墨、涂料、胶黏剂；可单用或与树脂混拼。阴离子水性氯化聚烯烃分散体，典型固含 30±1%。具体水性/溶剂体系、基材状态、混拼和性能须验证，不代表客户已使用或有采购需求。' },
  { id: 'nl-h-860', name: 'NL-H-860 水性氯化聚丙烯分散体', nameEn: 'Water-Based Chlorinated Polypropylene Dispersion', color: '#0891b2',
    tdsApplicationIds: ['nlh860-plastic-bonding', 'nlh860-rubber-bonding', 'nlh860-waterborne-inks', 'nlh860-waterborne-varnishes', 'nlh860-industrial-paints', 'nlh860-wood-coatings'],
    searchLogic: '核验自主制造难粘塑料/橡胶胶黏剂、水性油墨、水性清漆/罩光油、工业调和漆或水性木器涂料的配方企业。橡胶-金属、纤维等须核实际产品及工艺，不能从一般橡胶加工或印刷业务推断原料需求。排除同类水性氯化聚烯烃/CPP 分散体原料同行；跨产品共用集团预算。',
    searchTerms: ['difficult plastic bonding adhesive manufacturer', 'rubber bonding adhesive formulator', 'water based printing ink manufacturer', 'waterborne varnish wood coating manufacturer'],
    tdsScope: 'Rev.01 明列塑料、橡胶及极性/非极性基材粘接，以及水性油墨、清漆、工业调和漆和木器涂料功能性助剂。典型固含 60±2%，推荐添加 1–3%；低活化温度无具体数值。颜料润湿/渗透与相容性为 TDS 描述，实际客户体系和最终稳定性须测试，不借用其他产品的基材清单、氯含量或离子型。' },
]

const applicationRows = [
  ['nl8260-pp-opp-inks', 'nl-8260', 'PP／OPP 油墨附着评估', 'PP / OPP printing ink adhesion', 'PP/OPP 基材与油墨用途来自 TDS；薄膜、编织袋及水性/溶剂配方需逐家核实，不保证将水性分散体直接加入溶剂墨。'],
  ['nl8260-pp-tpo-coatings', 'nl-8260', 'PP／TPO 塑料涂料', 'PP / TPO plastic coatings', 'TDS 明列 PP/TPO 附着与涂料用途；汽车部件方向须有实际公司产品证据，不构成汽车认证。'],
  ['nl8260-pe-coatings', 'nl-8260', 'PE 塑料涂料', 'PE plastic coatings', 'TDS 明列 PE 附着与涂料用途；基材处理及配方适用性须测试。'],
  ['nl8260-pvc-epdm-coatings', 'nl-8260', 'PVC／EPDM 涂料', 'PVC / EPDM coatings', '仅按 TDS 列出的 PVC、EPDM 与涂料方向评估，不泛化所有橡胶或承诺硫化工艺相容。'],
  ['nl8260-paper-coatings', 'nl-8260', '纸张涂层', 'Paper coatings', '纸张与涂料/油墨用途来自 TDS；纸包装或纸塑复合需另核自主配方、涂布或原料使用工艺。'],
  ['nl8260-adhesives', 'nl-8260', '难粘基材胶黏剂', 'Adhesives for difficult substrates', 'TDS 明列胶黏剂及 PP、PE、PVC、EPDM、纸张和金属件等附着方向；具体接头与体系须验证。'],
  ['nlh860-plastic-bonding', 'nl-h-860', '塑料粘接胶黏剂', 'Plastic bonding adhesives', 'Rev.01 明列塑料粘接及极性/非极性基材，不从产品名推定所有具体塑料/表面处理均已验证。'],
  ['nlh860-rubber-bonding', 'nl-h-860', '橡胶粘接胶黏剂', 'Rubber bonding adhesives', 'TDS 列橡胶等粘接，并描述带反应基团聚合物与金属/无机材料/纤维结合；实际橡胶-金属或帘线工艺须逐案核实。'],
  ['nlh860-waterborne-inks', 'nl-h-860', '水性油墨功能助剂', 'Water-based ink additives', 'TDS 明列水性油墨及颜料润湿、渗透方向；不承诺任何客户颜料或炭黑体系必然相容。'],
  ['nlh860-waterborne-varnishes', 'nl-h-860', '水性清漆／罩光油', 'Water-based varnishes', 'TDS 明列清漆功能性助剂；须核水性配方和实际使用条件，不推定食品接触合规。'],
  ['nlh860-industrial-paints', 'nl-h-860', '水性工业调和漆', 'Water-based industrial blended paints', 'TDS 明列水性工业调和漆功能助剂，不泛化为所有工业防腐、耐热或汽车体系。'],
  ['nlh860-wood-coatings', 'nl-h-860', '水性木器涂料', 'Water-based wood coatings', 'TDS 应用列木器涂料；客户仍须证明自主配方/制造及所选水性产品，不借用其他基材的性能。'],
] as const
export const waterborneApplications: TdsVerifiedApplication[] = applicationRows.map(([id, productId, name, nameEn, description]) => ({ id, productId, name, nameEn, description, sourceDocument: productId === 'nl-8260' ? '用户提供：NL-8260 TDS 英文版，2026-11-27 核对' : '用户提供：NL-H-860 TDS Rev.01 英文版，2026-11-27 核对' }))
export const waterborneTargetTypes: TargetCompanyType[] = waterborneApplications.map(application => ({ id: `${application.id}-manufacturer`, productId: application.productId, name: `${application.name}配方生产商`, nameEn: `${application.nameEn} formulator / manufacturer`, kind: 'target', applicationReferences: [{ layer: 'tds-verified', applicationId: application.id }] }))

const spec = (name: string, originalValue: string, note: string) => ({ name, originalValue, note, reviewStatus: 'needs_review' as const })
export const waterborneProductSummaries: ProductSummary[] = [
  { id: 'nl-8260', name: 'NL-8260 水性氯化聚烯烃附着力促进剂', englishName: 'Waterborne Chlorinated Polyolefin Adhesion Promoter', grade: 'NL-8260', category: '水性 CPO / 附着力促进', status: '学习资料已更新', description: '阴离子水性氯化聚烯烃分散体，可用于油墨、涂料及胶黏剂的附着评估，可单用或与树脂混拼。参数为典型值，实际规格以 COA 为准；与客户树脂/溶剂体系需测试。', applications: ['PP／OPP 油墨', 'PP／TPO／PE 塑料涂料', 'PVC／EPDM 涂料', '纸张涂层', '难粘基材胶黏剂'], keywords: ['NL-8260', 'waterborne chlorinated polyolefin', 'CPO dispersion', 'PP adhesion promoter'], specs: [spec('外观', 'Beige liquid', '英文 TDS：米黄色液体。'), spec('离子型', 'Anionic', '阴离子型；混拼电荷相容性需验证。'), spec('固含', '30±1%', '典型值，不等于批次保证；以 COA 为准。'), spec('氯含量', '12–24%', '典型范围；不能称无氯/无卤，不从名称推定 MAH 改性。'), spec('pH', '7–9 / 25°C', '按原 TDS 条件保留。'), spec('黏度', '≤200 mPa·s / 25°C', '不与不同固含/条件产品直接比较。'), spec('熔点', '80°C', 'TDS 原值，不当作施工、储存或活化温度。'), spec('储存与保质期', '5–35°C，6 months', '按原推荐条件。'), spec('包装', '120 kg/plastic drum; IBC tote', 'IBC 容量未列明，不补数值。')], reviewTasks: ['取得目标批次 COA/SDS；核对典型值与实际规格。', '核对基材、表面处理、主树脂、溶剂与离子型后做配方测试。', '自行验证附着、储存稳定性与最终用途要求；不推定汽车/食品接触认证。'] },
  { id: 'nl-h-860', name: 'NL-H-860 水性氯化聚丙烯分散体', englishName: 'Water-Based Chlorinated Polypropylene Dispersion', grade: 'NL-H-860', category: '水性 CPP / 塑料粘接与配方助剂', status: '学习资料已更新', description: '全水性聚烯烃树脂分散体，TDS 标题为水性氯化聚丙烯分散体。重点为塑料/橡胶粘接，以及水性油墨、清漆、工业调和漆和木器涂料的功能性助剂；颜料润湿及相容性须在客户体系验证。', applications: ['难粘塑料胶黏剂', '橡胶粘接胶黏剂', '水性油墨', '水性清漆／罩光油', '水性工业调和漆', '水性木器涂料'], keywords: ['NL-H-860', 'water based chlorinated polypropylene', 'plastic bonding', 'pigment wetting'], specs: [spec('外观', 'Light yellow liquid', '浅黄色液体。'), spec('固含', '60±2%', 'Rev.01 原值，不借用 NL-8260 的固含。'), spec('黏度', '<3000 mPa·s', 'TDS 未列测试温度/方法，不能自行补 25°C。'), spec('pH', '6.0–8.0', '按 Rev.01 原值。'), spec('密度', 'Approx. 1.07 g/cm³', '近似值。'), spec('玻璃化转变温度', 'Approx. 10°C', 'Tg 不是最低活化温度；低活化温度未给数值。'), spec('推荐添加量', '1–3%', 'TDS 推荐范围；添加量基准及最佳用量须在客户体系确认。'), spec('储存与保质期', '5–30°C，6 months', '原容器密闭，按推荐条件。'), spec('包装', '25 kg plastic pails; 180 kg blue plastic drums', '按 Rev.01 原包装。')], reviewTasks: ['确认添加量基准、树脂反应基团及塑料/橡胶接头工艺。', '均匀分散进主树脂液，核对干燥与粘接温度；不把 Tg 作为活化阈值。', '核对颜料/炭黑/其他助剂及最终稳定性，不承诺客户现成体系相容。', 'TDS 未列氯含量、离子型或 MAH 数据，不从 NL-8260 或其他牌号补值。'] },
]
