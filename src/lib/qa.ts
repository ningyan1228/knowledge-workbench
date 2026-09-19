import type { ProductSummary } from './types'

export type ReplyTone = '商务邮件' | '简短即时消息' | '解释简单一点'

/** Safe local fallback when no approved citation can support a customer-facing answer. */
export function insufficientEvidenceReply(product: ProductSummary, tone: ReplyTone): string {
  const english = tone === '简短即时消息'
    ? 'Thanks for your message. Please share the substrate, process and test requirement. We are checking the technical details with our factory and will reply based on confirmed data.'
    : 'Thank you for your inquiry. To provide accurate information, could you please share the substrate, application process, formulation system, test standard and destination market? We are checking the relevant technical details with our factory and will reply based on confirmed data.'
  return `客户意图：需要了解“${product.name}”是否适合其具体场景。\n\n中文解释：现有资料库没有已批准、可对外引用的原始证据，因此不能确认性能、认证、适用性或运输属性。\n\n已知信息：当前只有待上传原文件的初始化摘录。\n\n还需要向客户确认：基材 / 应用工艺 / 配方体系 / 测试标准 / 用量 / 目的地。\n\n英文草稿（${tone}）：\n${english}\n\n中文对照：感谢您的咨询。为提供准确资料，请告知基材、应用工艺、配方体系、测试标准及目的地市场。我们正在与工厂核对相关技术细节，并会基于已确认数据回复。\n\n引用：暂无。请先上传并确认 TDS 中的对应段落。`
}

export function isCustomerFacingClaimAllowed(input: { reviewStatus: string; scope: string; citationCount: number }): boolean {
  return input.reviewStatus === 'approved' && input.scope === 'own_product' && input.citationCount > 0
}
