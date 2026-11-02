import type { Article, ProductSummary } from './types'
import { getFactoryTasks, getHandbookSpecs } from './productHandbook'

export const products: ProductSummary[] = [
  {
  "id": "cpp-cpo",
  "name": "MAH 改性 CPP／CPO",
  "englishName": "MAH-modified Chlorinated Polypropylene / Polyolefin",
  "grade": "NL-MA200-24 / NL-MB100-22 / NL-MC50-22 / NL-MC50-30 / NL-MD100-20 / NL-MS10 / NL-MS300",
  "category": "PP 附着 / 氯化聚烯烃树脂",
  "status": "学习资料已更新",
  "description": "七牌号选型指南支持 PP 附着方向，部分牌号有低氯、低粘度、酯溶性或高分子量特点。各特点不可混用为同一牌号承诺；PE 限 NL-MS300，弹性体／金属限 NL-MD100-20。",
  "applications": [
    "PP／TPO 塑料底漆评估",
    "PP 溶剂型印刷油墨评估",
    "PP／TPO 复合胶评估",
    "NL-MS300 的 PE 附着评估",
    "NL-MD100-20 的弹性体／金属附着评估"
  ],
  "keywords": [
    "MAH-modified CPP",
    "chlorinated polyolefin",
    "PP primer",
    "polypropylene printing ink",
    "ester-soluble CPO"
  ],
  "specs": [
    {
      "name": "NL-MA200-24",
      "originalValue": "氯 24 ± 1%；MAH 1.0–1.5%；溶液粘度 150–250 mPa·s",
      "condition": "20% 甲苯；测试温度待完整 TDS 确认",
      "note": "PP 附着与树脂相容性。来源：用户提供：Neon Lion MAH Modified CPO Selection Guide NL Grades（2026-11-02 核对，选型指南非完整 TDS）。不得跨测试浓度直接比较粘度。",
      "reviewStatus": "needs_review"
    },
    {
      "name": "NL-MB100-22",
      "originalValue": "氯 20–24%；MAH 0.8–1.2%；溶液粘度 10–100 mPa·s",
      "condition": "20% 甲苯；测试温度待完整 TDS 确认",
      "note": "低氯、低粘度、PP 附着。来源：用户提供：Neon Lion MAH Modified CPO Selection Guide NL Grades（2026-11-02 核对，选型指南非完整 TDS）。不得跨测试浓度直接比较粘度。",
      "reviewStatus": "needs_review"
    },
    {
      "name": "NL-MC50-22",
      "originalValue": "氯 22 ± 2%；MAH 1.0–1.5%；溶液粘度 10–50 mPa·s",
      "condition": "20% 甲苯；测试温度待完整 TDS 确认",
      "note": "低粘度、PP 附着与树脂相容性。来源：用户提供：Neon Lion MAH Modified CPO Selection Guide NL Grades（2026-11-02 核对，选型指南非完整 TDS）。不得跨测试浓度直接比较粘度。",
      "reviewStatus": "needs_review"
    },
    {
      "name": "NL-MC50-30",
      "originalValue": "氯 30 ± 1%；MAH 1.0–1.5%；溶液粘度 10–50 mPa·s",
      "condition": "20% 甲苯；测试温度待完整 TDS 确认",
      "note": "列有醋酸丙酯；PP 附着。来源：用户提供：Neon Lion MAH Modified CPO Selection Guide NL Grades（2026-11-02 核对，选型指南非完整 TDS）。不得跨测试浓度直接比较粘度。",
      "reviewStatus": "needs_review"
    },
    {
      "name": "NL-MD100-20",
      "originalValue": "氯 20 ± 2%；MAH 1.0–1.5%；溶液粘度 10–100 mPa·s",
      "condition": "10% 甲苯；测试温度待完整 TDS 确认",
      "note": "PP、弹性体和金属附着。来源：用户提供：Neon Lion MAH Modified CPO Selection Guide NL Grades（2026-11-02 核对，选型指南非完整 TDS）。不得跨测试浓度直接比较粘度。",
      "reviewStatus": "needs_review"
    },
    {
      "name": "NL-MS10",
      "originalValue": "氯 30–32%；MAH 0.6–1.0%；溶液粘度 10–50 mPa·s",
      "condition": "20% 甲苯；测试温度待完整 TDS 确认",
      "note": "醋酸乙酯／醋酸丙酯；低软化点。来源：用户提供：Neon Lion MAH Modified CPO Selection Guide NL Grades（2026-11-02 核对，选型指南非完整 TDS）。不得跨测试浓度直接比较粘度。",
      "reviewStatus": "needs_review"
    },
    {
      "name": "NL-MS300",
      "originalValue": "氯 28–32%；MAH 0.6–1.0%；溶液粘度 250–350 mPa·s",
      "condition": "20% 甲苯；测试温度待完整 TDS 确认",
      "note": "高分子量 300,000–400,000；PP／PE 附着。来源：用户提供：Neon Lion MAH Modified CPO Selection Guide NL Grades（2026-11-02 核对，选型指南非完整 TDS）。不得跨测试浓度直接比较粘度。",
      "reviewStatus": "needs_review"
    }
  ],
  "reviewTasks": [
    "取得每个选定牌号完整 TDS、SDS 和批次 COA，确认测试温度与方法。",
    "核对客户 PP／PE／TPO 基材、表面处理、主树脂及溶剂配比。",
    "逐案测试溶解性、储存稳定性、附着、干燥和后续涂层相容性。",
    "确认包装储存、保质期及目的用途合规；不把低氯说成无卤。"
  ]
},
  {
    id: 'nl-w1201', name: 'NL-W1201 水性表面处理剂', englishName: 'Water-Based Surface Treatment Agent',
    grade: 'NL-W1201', category: '表面处理 / 附着力促进', status: '学习资料已更新',
    description: '水性聚烯烃乳液／树脂分散体，主要用于未处理 PP 的底涂和附着力促进。水是载体；其他基材及与丙烯酸、聚氨酯乳液混用需结合客户体系验证。',
    applications: ['未处理 PP 底涂', 'PP／PE／OPP 薄膜涂布评估', '其他推荐基材评估', '水性配方相容性评估'],
    keywords: ['water-based adhesion promoter', 'PP primer', 'polyolefin dispersion', 'OPP primer'],
    specs: getHandbookSpecs('nl-w1201'),
    reviewTasks: getFactoryTasks('nl-w1201'),
  },
  {
    id: 'elo', name: '环氧化亚麻油 ELO', englishName: 'Epoxidized Linseed Oil',
    grade: null, category: '生物基添加剂 / 增塑与树脂改性', status: '学习资料已更新',
    description: '天然亚麻油来源、带环氧官能团的生物基功能添加剂（CAS 8016-11-3），可用于辅助增塑、辅助稳定和树脂改性。TDS 未给独立型号；应用后缀不代表独立配方。',
    applications: ['柔性 PVC 辅助增塑／稳定', '涂料', '胶黏剂', '密封胶', '油墨', '树脂改性研究'],
    keywords: ['epoxidized linseed oil', 'ELO plasticizer', '8016-11-3', 'epoxidized vegetable oil'],
    specs: getHandbookSpecs('elo'),
    reviewTasks: getFactoryTasks('elo'),
  },
  {
    id: 'fertilizer-coating', name: '缓释肥料专用包膜原料', englishName: 'Controlled-release Fertilizer Coating Material',
    grade: null, category: '肥料包膜 / 控释肥', status: '学习资料已更新',
    description: '用于聚氨酯肥料包膜体系开发的高分子改性原料，可评估包膜尿素与复合肥。释放曲线由完整配方、肥芯、包膜量、设备工艺及测试条件共同决定。',
    applications: ['包膜尿素', '包膜 NPK／复合肥', '有机肥颗粒评估', '转鼓／流化床', '热包工艺'],
    keywords: ['controlled release fertilizer coating', 'polyurethane coated urea', 'nutrient release curve'],
    specs: getHandbookSpecs('fertilizer-coating'),
    reviewTasks: getFactoryTasks('fertilizer-coating'),
  },
]

export const articles: Article[] = [
  {
    id: 'trade-gov-export-basics', title: 'Export Solutions', source: 'Trade.gov', sourceUrl: 'https://www.trade.gov/export-solutions',
    kind: '技术指南', publishedAt: '待首次采集核验', products: ['外贸实务'], access: '公开页面',
    relevance: '适合作为出口流程学习入口；内容基于美国出口商场景，不能当作中国出口规则。',
    summary: '尚未执行正式采集。部署 worker 后会保存原始发布日期、端点验证结果和中文摘要。',
  },
  {
    id: 'ifa-fertilizer', title: 'International Fertilizer Association resources', source: 'IFA', sourceUrl: 'https://www.fertilizer.org/',
    kind: '行业资讯', publishedAt: '待首次采集核验', products: ['缓释肥料专用包膜原料'], access: '公开页面',
    relevance: '候选肥料行业来源，需先验证具体公开端点，不能把官网首页当成已接入来源。',
    summary: '待来源验证；此处不代表资讯已采集成功。',
  },
]

export const practiceTopics = [
  ['客户开发', '目标客户画像、搜索关键词、企业背景调查、开发信结构'],
  ['询盘判断', '应用、规格、数量、目的地、测试计划、采购时间'],
  ['报价与条款', 'MOQ、交期、报价有效期、贸易术语学习'],
  ['样品管理', '样品费用、快递、测试目的、反馈问题'],
  ['付款与订单', '付款方式概念、PI、销售合同核对'],
  ['单据与物流', '发票、装箱单、提单、SDS、COA、唛头用途'],
  ['化工资料', 'TDS / SDS / COA 区别、CAS、测试条件、运输资料'],
  ['跟进与谈判', '测试跟进、异议处理、交期沟通、售后'],
  ['国家与市场', '当地产业、目标应用、资料来源与核验日期'],
  ['产品内容发布', '搜索意图、应用写法、同类对比、关键词分层'],
]
