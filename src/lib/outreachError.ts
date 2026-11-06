/** PostgREST returns plain objects; preserve codes for concurrent-send handling. */
export function outreachError(value: unknown): Error & { code?: string } {
  if (value instanceof Error) return value
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {}
  const code = typeof source.code === 'string' ? source.code : undefined
  const message = typeof source.message === 'string' ? source.message : ''
  const productConstraint = code === '23514' && message.includes('market_intel_outreach_sends_product_id_check')
  const explanation = productConstraint
    ? '发送记录数据库尚未支持此产品，请管理员执行 CPP/CPO 台账迁移后重试。'
    : code === '42501' ? '没有写入共享发送记录的权限，请重新登录并检查账号权限。'
    : code === 'PGRST301' ? '登录已过期，请重新登录后再记录。'
    : '共享发送记录操作失败，请检查连接或联系管理员。'
  return Object.assign(new Error(`${explanation}${code ? `（错误码：${code}）` : ''}`), { code })
}
