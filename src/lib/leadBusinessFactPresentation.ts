// This is a presentation check, never customer qualification or new evidence.
const auditLanguage = /核验|核对|复核|读取|重读|复读|本轮|原文|原始目录|不把|不能把|保留其角色|同行排除|需求侧|未确认采购|采购未确认|适配待评估|不代表(?:采购|需求|使用|相容)|邮箱|联系入口|联系人|\b(?:About|Contact|LinkedIn|WhatsApp)\b/iu
export const businessFactPending = '业务事实待整理，请查看完整依据。'

export function readableBusinessFact(value?: string): value is string {
  return Boolean(value?.trim() && value !== businessFactPending && value.length <= 110 && !auditLanguage.test(value))
}

/** Never remove qualifiers or truncate a technical assertion to make it fit. */
export function presentBusinessFact(statement: string, preferred?: string) {
  if (readableBusinessFact(preferred)) return preferred.trim()
  const original=statement.trim()
  return readableBusinessFact(original) ? original : businessFactPending
}
