import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { compareFollowup, parseFollowup, tableCells } from '../src/lib/customerFollowup'
import { FollowupMarkdown } from '../src/features/market/FollowupMarkdown'
import { marketTabForRoute } from '../src/lib/leadViewPreference'

const current = `# 跟进台账｜2026年10月23日
## 一、按建议跟进时间排序的总表
| 编号 | 下一次跟进日（原表建议） | 客户 | 产品/项目 | 最新已知时间与进度 | 当前状态 | 具体下一步 |
|---|---|---|---|---|---|---|
| C02 | 暂停；不主动联系 | 暂停客户 | 示例树脂 | 已拟回复 | 发送未确认 | 核实发送 |
| C01 | 2026-10-26 | 样例公司 | 示例乳液 | 已收到水单 | 未确认到账 | 查款 |
## 二、变更
| 客户 | 产品 | 状态 |
|---|---|---|
| 不计入主档 | 其他 | 未归属 |
## 三、逐客户完整历史档案
### C01｜样例公司
| 事项 | 状态 |
|---|---|
| 付款 | 水单已收到；银行到账待核 |
### C02｜暂停客户
仅在客户来信时处理。
## 四、附表
未归属线索不得计入主档。
`

describe('private follow-up Markdown', () => {
  it('extracts only the main overview, preserves uncertainty and links stable customer IDs to the right history', () => {
    const result = parseFollowup(current)
    expect(result.customers).toHaveLength(2)
    expect(result.customers.map(row => row.id)).toEqual(['C01', 'C02'])
    expect(result.customers[0]).toMatchObject({ actionDate: '2026-10-26', status: '未确认到账', next: '查款' })
    expect(result.customers[0].detail).toContain('银行到账待核')
    expect(result.customers[0].detail).not.toContain('暂停客户')
    expect(result.customers[1].detail).not.toContain('未归属线索')
    expect(result.customers[1].actionDate).toBeNull()
  })
  it('supports older numbered ledgers without inventing follow-up dates or customer status', () => {
    const old = parseFollowup(`# 旧版\n## 一、客户总览\n| # | 客户 / 地区 | 项目 | 最近有据可查的进度时间（北京时间） | 目前阶段 / 下一步 |\n|---|---|---|---|---|\n| 1 | 样例公司 | 树脂 | 10-15 | 测试中；询结果 |\n## 二、逐客户跟进档案\n### 1. 样例公司\n原始历史。`)
    expect(old.customers[0]).toMatchObject({ id: 'C01', actionDate: null, status: '测试中；询结果', detail: '### 1. 样例公司\n原始历史。' })
    expect(old.warnings.join()).toContain('保留原表顺序')
    expect(compareFollowup(old, parseFollowup(current))).toEqual({ added: 1, changed: 1, removed: 0 })
  })
  it('keeps a readable original when tables are unrecognized, and rejects impossible inferred dates', () => {
    const missing = parseFollowup('# 台账\n## 备注\n一些完整记录。')
    expect(missing.customers).toEqual([])
    expect(missing.blocks.some(block => block.kind === 'text' && block.text.includes('完整记录'))).toBe(true)
    expect(missing.warnings).toHaveLength(1)
    expect(parseFollowup(current.replace('2026-10-26', '2026-02-30')).customers.every(row => row.actionDate === null)).toBe(true)
  })
  it('renders hostile uploaded markup as escaped text and preserves line breaks and pipe-containing cells', () => {
    const html = renderToStaticMarkup(createElement(FollowupMarkdown, { markdown: '# <img src=x onerror=alert(1)>\n<script>alert(1)</script>\n| 字段 | 内容 |\n|---|---|\n| 原文 | **待核**<br>下一行 |' }))
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<img')
    expect(html).toContain('&lt;script&gt;')
    expect(html).toContain('待核\n下一行')
    expect(tableCells('| `a|b` | a\\|b |')).toEqual(['`a|b`', 'a\\|b'])
  })
  it('keeps the follow-up route independent of customer-map preferences', () => {
    expect(marketTabForRoute('follow-up', 'map')).toBe('follow-up')
  })
})
