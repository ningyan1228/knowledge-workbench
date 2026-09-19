export type DemoRegion = {
  id: string
  name: string
  latitude: number
  longitude: number
  crops: string[]
  demand: string[]
  companies: number
  news: number
}

export const brazilAgricultureDemo = {
  id: 'demo-brazil-agriculture',
  slug: 'brazil-agriculture',
  country: 'Brazil',
  countryZh: '巴西',
  title: 'Brazil Agriculture Intelligence',
  titleZh: '巴西农业情报',
  industry: 'Agriculture · Fertilizer',
  description: '此页面仅展示二期信息架构和交互 Demo。所有市场、企业、需求与机会均需以可追溯来源验证后才能作为真实情报使用。',
  applications: ['Soybean', 'Corn', 'Sugarcane', 'Coffee', 'Cotton'],
  regions: [
    { id: 'mato-grosso', name: 'Mato Grosso', latitude: -15.6014, longitude: -56.0979, crops: ['Soybean', 'Corn', 'Cotton'], demand: ['Nitrogen fertilizer', 'Fertilizer efficiency'], companies: 0, news: 0 },
    { id: 'goias', name: 'Goiás', latitude: -16.6869, longitude: -49.2648, crops: ['Soybean', 'Corn', 'Sugarcane'], demand: ['Nutrient management', 'Coating research'], companies: 0, news: 0 },
    { id: 'parana', name: 'Paraná', latitude: -25.4296, longitude: -49.2713, crops: ['Soybean', 'Corn', 'Coffee'], demand: ['Fertilizer efficiency'], companies: 0, news: 0 },
    { id: 'sao-paulo', name: 'São Paulo', latitude: -23.5505, longitude: -46.6333, crops: ['Sugarcane', 'Coffee', 'Corn'], demand: ['High-value crop nutrition'], companies: 0, news: 0 },
    { id: 'minas-gerais', name: 'Minas Gerais', latitude: -19.9167, longitude: -43.9345, crops: ['Coffee', 'Corn', 'Soybean'], demand: ['Controlled nutrition research'], companies: 0, news: 0 },
    { id: 'bahia', name: 'Bahia', latitude: -12.9714, longitude: -38.5014, crops: ['Soybean', 'Cotton', 'Coffee'], demand: ['Nutrient management'], companies: 0, news: 0 },
  ] satisfies DemoRegion[],
  opportunities: [
    { id: 'controlled-release-urea', title: 'Controlled Release Urea', application: 'Corn', demand: 'Demo hypothesis: nitrogen-use efficiency is a research direction.', target: 'Fertilizer manufacturer', product: 'NL-FC-PU', status: '需要来源验证' },
    { id: 'coffee-nutrition', title: 'Coffee nutrition management', application: 'Coffee', demand: 'Demo hypothesis: high-value crop nutrition warrants research.', target: 'Specialty fertilizer manufacturer', product: 'NL-FC-PU', status: '需要来源验证' },
  ],
  companies: [
    { id: 'demo-fertilizer-maker', name: '示例肥料制造商（待研究）', type: 'Fertilizer Manufacturer', region: 'Goiás', status: 'Demo · 未核验', source: '尚无来源' },
    { id: 'demo-distributor', name: '示例农业经销商（待研究）', type: 'Distributor', region: 'Mato Grosso', status: 'Demo · 未核验', source: '尚无来源' },
  ],
} as const

export function marketRoute() {
  return window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)
}
