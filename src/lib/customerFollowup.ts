export type MarkdownBlock = { kind: 'heading'; level: number; text: string } | { kind: 'table'; headers: string[]; rows: string[][] } | { kind: 'text'; text: string }
export type FollowupCustomer = { id: string; customer: string; product: string; actionDate: string | null; actionLabel: string; progress: string; status: string; next: string; detail: string }
export type FollowupDocument = { title: string; blocks: MarkdownBlock[]; customers: FollowupCustomer[]; warnings: string[] }

// Render a deliberately small, text-only Markdown subset. Uploaded HTML is never executed.
export function markdownText(value: string) {
  return value.replace(/<br\s*\/?\s*>/gi, '\n').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1').replace(/\\\|/g, '|')
}

export function tableCells(line: string): string[] {
  const source = line.trim().replace(/^\|/, '').replace(/(?<!\\)\|$/, '')
  const cells: string[] = []
  let cell = '', quoted = false
  for (let i = 0; i < source.length; i++) {
    const char = source[i]
    if (char === '`' && source[i - 1] !== '\\') quoted = !quoted
    if (char === '|' && source[i - 1] !== '\\' && !quoted) { cells.push(cell.trim()); cell = '' } else cell += char
  }
  cells.push(cell.trim())
  return cells
}

export function markdownBlocks(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n'), blocks: MarkdownBlock[] = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue
    const heading = /^(#{1,6})\s+(.+)$/.exec(line)
    if (heading) { blocks.push({ kind: 'heading', level: heading[1].length, text: markdownText(heading[2]) }); continue }
    if (line.trim().startsWith('|') && lines[i + 1]?.trim().startsWith('|') && tableCells(lines[i + 1]).every(cell => /^:?-{3,}:?$/.test(cell))) {
      const headers = tableCells(line), rows: string[][] = []
      i += 2
      while (i < lines.length && lines[i].trim().startsWith('|')) { rows.push(tableCells(lines[i])); i++ }
      i--
      blocks.push({ kind: 'table', headers, rows }); continue
    }
    blocks.push({ kind: 'text', text: markdownText(line) })
  }
  return blocks
}

function validDate(value: string): string | null {
  const match = value.match(/\b(20\d{2}-\d{2}-\d{2})\b/)
  if (!match) return null
  const date = new Date(match[1] + 'T00:00:00Z')
  return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === match[1] ? match[1] : null
}

export function parseFollowup(markdown: string): FollowupDocument {
  const blocks = markdownBlocks(markdown), warnings: string[] = []
  const title = blocks.find(block => block.kind === 'heading' && block.level === 1)
  let inOverview = false
  let summary: Extract<MarkdownBlock, {kind: 'table'}> | undefined
  for (const block of blocks) {
    if (block.kind === 'heading' && block.level === 2) inOverview = /客户总览|按建议跟进时间|跟进.*总表/.test(block.text)
    if (inOverview && block.kind === 'table' && block.headers.some(h => /客户/.test(h))) { summary = block; break }
  }
  if (!summary) warnings.push('未识别到客户总览表。完整原文仍可阅读；本次更新请先核对原文。')
  const details = new Map<string, string>()
  const sections = markdown.replace(/\r\n?/g, '\n').split(/(?=^###\s)/m)
  for (const section of sections) {
    const match = /^###\s+(?:C(\d+)｜|(\d+)\.\s)/.exec(section)
    if (match) details.set('C' + (match[1] || match[2]).padStart(2, '0'), section.split(/^##\s/m)[0].trim())
  }
  const headers = summary?.headers.map(markdownText) ?? []
  const index = (pattern: RegExp) => headers.findIndex(header => pattern.test(header))
  const customerIndex = index(/客户/), productIndex = index(/产品|^项目$/), dateIndex = index(/下一次跟进|建议.*日期|建议行动|跟进日/)
  const progressIndex = index(/最新.*进度|最近.*时间|最近.*消息/), statusIndex = index(/当前状态|当前阶段|目前阶段/), nextIndex = index(/下一步/)
  const customers = (summary?.rows ?? []).map((row, n) => {
    const get = (i: number) => i < 0 ? '' : markdownText(row[i] ?? '')
    const idValue = get(0), id = /^C?\d+$/.test(idValue) ? 'C' + idValue.replace(/^C/, '').padStart(2, '0') : `row-${n}`
    const actionLabel = get(dateIndex), actionDate = validDate(actionLabel)
    return { id, customer: get(customerIndex), product: get(productIndex), actionDate, actionLabel: actionLabel || '未注明建议日期', progress: get(progressIndex), status: get(statusIndex), next: get(nextIndex), detail: details.get(id) ?? '' }
  })
  const ids = customers.map(row => row.id)
  if (new Set(ids).size !== ids.length) warnings.push('总览存在重复编号，请核对原文；系统不会自动合并客户。')
  if (customers.some(row => !row.customer)) warnings.push('部分总览行没有客户名称，请核对原文。')
  if (customers.length && !customers.some(row => row.actionDate)) warnings.push('此版本未注明可识别的建议跟进日期，保留原表顺序。')
  customers.sort((a, b) => (a.actionDate ?? '9999').localeCompare(b.actionDate ?? '9999'))
  return { title: title?.kind === 'heading' ? title.text : '客户跟进台账', blocks, customers, warnings }
}

export function compareFollowup(previous: FollowupDocument | null, next: FollowupDocument) {
  if (!previous) return { added: next.customers.length, changed: 0, removed: 0 }
  const old = new Map(previous.customers.map(row => [row.id, row]))
  const fresh = new Set(next.customers.map(row => row.id))
  return { added: next.customers.filter(row => !old.has(row.id)).length,
    changed: next.customers.filter(row => old.has(row.id) && JSON.stringify(row) !== JSON.stringify(old.get(row.id))).length,
    removed: previous.customers.filter(row => !fresh.has(row.id)).length }
}
