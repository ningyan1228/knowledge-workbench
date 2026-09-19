import type { Article, ProductSummary } from './types'

export const products: ProductSummary[] = [
  {
    id: 'nl-w1201', name: 'NL-W1201 水性表面处理剂', englishName: 'Water-Based Surface Treatment Agent',
    grade: 'NL-W1201', category: '表面处理 / 附着力促进', status: '待上传原文件',
    description: '拟作为水性聚烯烃乳液底涂和附着力促进剂。下列内容仅来自任务书摘录，上传原始 TDS 后才能成为可核对的资料。',
    applications: ['未经处理 PP 的附着力促进', '水性底涂', '低表面能基材学习'],
    keywords: ['water-based adhesion promoter', 'PP primer', 'polyolefin dispersion', 'OPP primer'],
    specs: [
      { name: '固含量', originalValue: '45 ± 2%', reviewStatus: 'needs_review', note: '参考配方另写 40% solution，需确认稀释关系。' },
      { name: 'pH', originalValue: '7–8', reviewStatus: 'needs_review' },
      { name: '黏度', originalValue: '≤1000 Pa.s / 25°C', reviewStatus: 'needs_review', note: '单位按原文保留，不能擅自改为 mPa·s。' },
      { name: '表干 / 全干', originalValue: '20 分钟 / 20 小时', reviewStatus: 'needs_review', note: '环境与膜厚条件缺失。' },
    ],
    reviewTasks: ['请上传英文 TDS 原件。', '确认 45±2% 与参考配方 40% solution 的关系。', '确认黏度单位及干燥条件。'],
  },
  {
    id: 'elo', name: '环氧化亚麻油 ELO', englishName: 'Epoxidized Linseed Oil',
    grade: null, category: '聚合物添加剂 / 增塑剂学习', status: '待上传原文件',
    description: '牌号尚未指定，不能自动编造 NL- 牌号；当前参数是待原文件核对的摘录。',
    applications: ['增塑剂学习', '环氧化植物油对比', '聚合物添加剂'],
    keywords: ['epoxidized linseed oil', 'ELO plasticizer', '8016-11-3', 'epoxidized vegetable oil'],
    specs: [
      { name: 'CAS', originalValue: '8016-11-3', reviewStatus: 'needs_review' },
      { name: '环氧值', originalValue: '≥ 9.0%', reviewStatus: 'needs_review' },
      { name: '酸值', originalValue: '≤ 0.5 mgKOH/g', reviewStatus: 'needs_review' },
      { name: '残余碘值', originalValue: '< 6.0 gI2/100g', reviewStatus: 'needs_review' },
      { name: '黏度', originalValue: '原文同时出现 ≤ 与 700–1200', reviewStatus: 'needs_review', note: '需工厂确认是范围还是上限。' },
    ],
    reviewTasks: ['请上传 ELO TDS 原件。', '确认黏度字段的比较符与范围。', '不要把 eco-friendly 延伸成食品接触批准或认证。'],
  },
  {
    id: 'fertilizer-coating', name: '缓释肥料专用包膜原料', englishName: 'Controlled-release Fertilizer Coating Material',
    grade: null, category: '肥料包膜 / 控释肥', status: '待上传原文件',
    description: '归入肥料包膜而非农药种衣剂；可关联聚氨酯包膜学习，但不能由标题推断完整配方。',
    applications: ['控释肥包膜', '聚氨酯包膜学习', '尿素包膜工艺'],
    keywords: ['controlled release fertilizer coating', 'polyurethane coated urea', 'nutrient release curve'],
    specs: [
      { name: '外观', originalValue: '黄色液体（≥25°C）', reviewStatus: 'needs_review' },
      { name: '酸值', originalValue: '0.51 mgKOH/g', reviewStatus: 'needs_review' },
      { name: '25°C 黏度', originalValue: '683 mPa·s', reviewStatus: 'needs_review' },
      { name: '羟值', originalValue: '249 mgKOH/g', reviewStatus: 'needs_review' },
      { name: '水分', originalValue: '0.3%', reviewStatus: 'needs_review' },
    ],
    reviewTasks: ['请上传 DOCX 原件。', '确认释放期、成膜、固化和添加量的适用条件。', '核验任何 REACH/EPA 等合规表述后再使用。'],
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
