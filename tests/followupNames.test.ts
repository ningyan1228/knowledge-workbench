import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { compareFollowup, parseFollowup } from '../src/lib/customerFollowup'
import { followupDisplayLabel, followupReferenceIds, readFollowupIdentities } from '../src/lib/followupIdentity'
import { FollowupMarkdown } from '../src/features/market/FollowupMarkdown'
import { FollowupReferenceContext } from '../src/features/market/FollowupReferences'

const named = `---
dataset_id: test
dataset_version: 2026-10-26-r1
customer_identity_map:
  - customer_id: C01
    display_name: "Example Works／Alex · CPP树脂"
    category: overseas
  - customer_id: C02
    display_name: "Example Works Europe／Sam · ELO"
    category: overseas
  - customer_id: D01
    display_name: "国内对接人（公司待核） · SAMPLE-R"
    category: domestic
project_display_overrides:
  - customer_id: C01
    project: "RESIN-B"
    display_name: "Example Works／Alex · RESIN-B"
---
# 台账
## 一、按建议跟进时间排序的总表
| 客户公司／联系人 · 对应产品 | 下一次跟进日 | 国家及原档客户信息 | 产品/项目 | 最新已知时间与进度 | 当前状态 | 具体下一步 | 最近已核客户消息时间 | 最近已核我方发送时间 | 当前等待对象 | 日期性质 | 关键待确认事项 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Example Works／Alex · CPP树脂 <!-- customer_id: C01 --> | 2026-10-26 | 地区待核｜Alex / Example Works | CPP；另有RESIN-B询盘 | 凭证收到 | 到账待核 | 核实到账 | 时间未核 | 时间未核 | 财务 | 建议 | 到账 |
| Example Works Europe／Sam · ELO <!-- customer_id: C02 --> | 2026-10-27 | Sam / Example Works Europe | ELO | 测试中 | 待核 | 问反馈 | 未核 | 未核 | 客户 | 建议 | 反馈 |
## 二、历史档案
<!-- customer_id: C01; master_record: true; category: overseas -->
### Example Works／Alex · CPP树脂
| 事项 / 时间 | 历史 |
|---|---|
| 10-12 CPP付款 | 未确认到账 |
| 10-13另一询盘 | 主题RESIN-B；与CPP订单分开 |
#### 当前核对字段 <!-- customer_id: C01 -->
| 字段 | 内容 |
|---|---|
| 客户显示名称 | Example Works／Alex · CPP树脂 <!-- customer_id: C01 --> |
<!-- customer_id: C02; master_record: true; category: overseas -->
### Example Works Europe／Sam · ELO
历史保留。
## 三、邮件与冲突
| 客户显示名称 | 事项 |
|---|---|
| C01 | CPP修订PI，到账待核 |
| C01 | RESIN-B询盘，与CPP订单分开 |
| C01 / C02 | 归属未确认 |
| C01 / 未归属 | 保留未归属后缀 |
| Example Works Europe | 同名片段不合并 |
## 四、事件与任务
| 业务事件 | 客户公司／联系人 · 对应产品 | 事件发生时间 | 版本 | 类型 | 内容 |
|---|---|---|---|---|---|
| 文件核查 <!-- event_id: C01-E001 --> | Example Works／Alex · CPP树脂 <!-- customer_id: C01 --> | 日期待核 | r1 | 文件核查 | 未确认到账 |
### 当前执行清单
| 任务 | 行动 | 等待对象 | 日期及性质 | 当前任务状态 | 完成依据 |
|---|---|---|---|---|---|
| 核实到账 <!-- task_id: C01-T01 --> | 核实到账 | 财务 | 条件触发 | 待确认 | 银行确认 |
<!-- customer_id: D01; master_record: true; category: domestic -->
### 国内对接人（公司待核） · SAMPLE-R
| 字段 | 内容 |
|---|---|
| 当前库存 | 暂时无货，日期待核 |
`

describe('follow-up display names and stable references', () => {
  it('reads explicit mappings and comments without replacing stable master/event/task identities', () => {
    const d = parseFollowup(named)
    expect(d.customers.map(c => c.id)).toEqual(['C01', 'C02'])
    expect(d.customers[0].customer).toBe('地区待核｜Alex / Example Works')
    expect(d.customers[0].detail).toContain('10-13另一询盘')
    expect(d.customers[0].detail).not.toContain('master_record: true; category: domestic')
    expect(d.domestic).toHaveLength(1)
    expect(d.events.some(e => e.id === 'C01-E001' && e.customerId === 'C01')).toBe(true)
    expect(d.tasks.find(t => t.id === 'C01-T01')?.status).toBe('待确认')
    expect(compareFollowup(d, parseFollowup(named.replace('Example Works／Alex', 'Example Works／Alex Updated')))).toMatchObject({ added: 0, removed: 0 })
  })
  it('uses the record-specific project and does not infer a product from an amount or invoice', () => {
    const [identity] = readFollowupIdentities(named)
    expect(followupDisplayLabel(identity, 'CPP付款')).toBe('Example Works／Alex · CPP树脂')
    expect(followupDisplayLabel(identity, 'RESIN-B询盘，与CPP订单分开')).toBe('Example Works／Alex · RESIN-B')
    expect(followupDisplayLabel(identity, 'USD232修订PI')).toBe('Example Works／Alex · 对应产品待确认')
    expect(followupDisplayLabel(identity, 'CPP付款；另有RESIN-B', identity.displayName)).toBe(identity.displayName)
  })
  it('keeps multiple customer conflicts separate and rejects partial-name joins', () => {
    const identities = readFollowupIdentities(named)
    expect(followupReferenceIds('C01 / C02', identities)).toEqual(['C01', 'C02'])
    expect(followupReferenceIds('Example Works Europe', identities)).toEqual(['C02'])
    expect(followupReferenceIds('Example Works European Other', identities)).toEqual([])
    expect(followupReferenceIds('Unknown company', identities)).toEqual([])
    expect(followupReferenceIds('陌生名称 <!-- customer_id: C99 -->', identities)).toEqual([])
  })
  it('renders linked names in every table while leaving the source and missing identity facts intact', () => {
    const doc = parseFollowup(named)
    const html = renderToStaticMarkup(createElement(FollowupReferenceContext.Provider, { value: { document: doc, onOpen: () => undefined } }, createElement(FollowupMarkdown, { markdown: named })))
    expect(html).toContain('data-customer-ref="C01"')
    expect(html).toContain('data-customer-ref="C02"')
    expect(html).toContain('Example Works／Alex · RESIN-B')
    expect(html).toContain('公司待核')
    expect(html).toContain(' / 未归属')
    expect(html).not.toContain('&lt;!--')
    expect(html).not.toMatch(/>C01(?:<|\s)/)
    expect(html).not.toContain('customer_identity_map:')
    expect(doc.blocks.map(b => b.raw).join('\n')).toContain('<!-- task_id: C01-T01 -->')
  })
})
