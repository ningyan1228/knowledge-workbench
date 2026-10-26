import { describe, expect, it } from 'vitest'
import { markdownBlocks, parseFollowup, timePrecision } from '../src/lib/customerFollowup'

const source = `---
dataset_id: test-ledger
dataset_version: 2026-10-25-r1
---
# 内部台账
## 一、按建议跟进时间排序的总表
| 编号 | 下一次跟进日 | 客户 | 产品/项目 | 最新已知时间与进度 | 当前状态 | 具体下一步  最近已核客户消息时间 | 最近已核我方发送时间 | 当前等待对象 | 日期性质 | 关键待确认事项 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| C01 | 2026-10-25 | 客户甲 / Alpha Co | 项目甲 | 客户称已付款 | 到账待核 | 核查凭证 | 2026-10-24 21:56 | 未核实 | 财务 | 内部建议 | 到账 |
## 二、逐客户历史
### C01｜客户甲 / Alpha Co
| 事项 / 时间 | 历史 |
|---|---|
| 10-24 21:56客户回复 | 付款声明，不是到账证明 |
| 10-24 22:10我方草稿 | 尚未确认发送 |
#### C01 当前核对字段
| 字段 | 内容 |
|---|---|
| 当前等待对象 | 财务 |
## 三、联系方式
| 客户 | 联系入口 |
|---|---|
| Alpha Co | contact@example.test |
## 四、补充事件
| 事件编号 | 客户编号 | 事件发生时间 | 版本 | 类型 | 内容 |
|---|---|---|---|---|---|
| C01-E001 | C01 | 2026-10-24 21:56 | r1 | 客户来信 | 客户称付款完成，未核实到账 |
~~~unknown
全部未知语法原文
~~~
`

describe('complete private ledger indexing', () => {
  it('preserves the source order of a versioned dataset rather than imposing a future date order', () => {
    const reordered = source.replace('| C01 | 2026-10-25', '| C02 | 2026-10-29 | 客户乙 | 项目乙 | 待核 | 待核 | 核对 | 未知 | 未知 | 待核 | 建议 | 未知 |\n| C01 | 2026-10-25')
    expect(parseFollowup(reordered).customers.map(c => c.id)).toEqual(['C02', 'C01'])
  })
  it('repairs a missing header separator only in the index, preserving all twelve fields', () => {
    const d = parseFollowup(source), c = d.customers[0]
    expect(c.fields).toHaveLength(12)
    expect(c).toMatchObject({ next: '核查凭证', customerTime: '2026-10-24 21:56', sentTime: '未核实', waiting: '财务', dateNature: '内部建议', uncertainty: '到账' })
    expect(d.warnings.join()).toContain('缺少分隔符')
    expect(d.metadata.dataset_version).toBe('2026-10-25-r1')
    expect(c.sources.map(s => s.raw).join()).toContain('contact@example.test')
    expect(c.currentFields).toHaveLength(2)
  })
  it('retains every nonempty line and all unsupported blocks with source positions', () => {
    const d = parseFollowup(source), blocks = markdownBlocks(source)
    source.split('\n').forEach((line, i) => { if (line.trim()) expect(blocks.some(b => b.start <= i + 1 && b.end >= i + 1)).toBe(true) })
    expect(d.coverage.unretained).toBe(0)
    expect(d.blocks.map(b => b.raw).join('\n')).toContain('全部未知语法原文')
    expect(d.warnings.join()).toContain('补充块')
  })
  it('uses explicit event identity, preserves same-day distinct events, and never makes suggestions business events', () => {
    const d = parseFollowup(source)
    expect(d.events).toHaveLength(2)
    expect(d.events[0].id).toMatch(/^C01-history-L\d+$/)
    expect(d.events[1].id).toBe('C01-E001')
    expect(d.events[1].relatedSources).toHaveLength(1)
    expect(d.tasks[0].action).toBe('核查凭证')
    expect(d.tasks[0].status).toContain('待核')
    expect(timePrecision('2026-10-08，约11:13')).toContain('约略')
    expect(timePrecision('日期未核')).toContain('待核')
    expect(timePrecision('2026-10-08')).toContain('不补时分')
    expect(parseFollowup(source).events.map(e => e.id)).toEqual(d.events.map(e => e.id))
  })
})
