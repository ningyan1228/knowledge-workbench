export type ReviewStatus = 'extracted' | 'needs_review' | 'approved' | 'rejected' | 'superseded'
export type EvidenceLevel = 'supplier_tds' | 'test_report' | 'certificate' | 'public_research' | 'editorial'

export interface ProductSpec {
  name: string
  originalValue: string
  condition?: string
  note?: string
  reviewStatus: ReviewStatus
}

export interface ProductSummary {
  id: string
  name: string
  englishName: string
  grade: string | null
  category: string
  status: '待上传原文件' | '待确认' | '已确认'
  description: string
  applications: string[]
  keywords: string[]
  specs: ProductSpec[]
  reviewTasks: string[]
}

export interface Article {
  id: string
  title: string
  source: string
  sourceUrl: string
  kind: '技术指南' | '行业资讯' | '规则更新'
  publishedAt: string
  products: string[]
  relevance: string
  summary: string
  access: '公开页面' | '仅摘要'
}
