import { describe, expect, it } from 'vitest'
import { parseFollowup } from '../src/lib/customerFollowup'

const source = `---
dataset_id: priority-test
dataset_version: 2026-10-28-r1
default_sort_field: contact_priority_rank
archive_scope: older snapshot, historical_only
customer_identity_map:
- customer_id: C06
  display_name: 客户乙／联系人乙 · 树脂
  category: overseas
- customer_id: C01
  display_name: 客户甲／联系人甲 · 乳液
  category: overseas
- customer_id: D02
  display_name: 国内甲 · ELO
  category: domestic
- customer_id: D03
  display_name: 高校咨询 · 疏水材料
  category: domestic_consultation
---
# 新台账
## 一、优先联系与处理总表
| 顺序 | 客户／联系人 · 产品 | 联系优先级 | 最近邮件处理日期 | 当前进展 | 这次具体做什么 |
|---|---|---|---|---|---|
| 2 | 客户乙／联系人乙 · 树脂 <!-- customer_id: C06 --> | 今天处理 | 2026-10-26 | 到账待核 | 查实际到账 |
| 1 | 客户甲／联系人甲 · 乳液 <!-- customer_id: C01 --> | 今天先处理 | 2026-10-27 | 已到账已打包；发运未核 | 安排发运 |
## 二、逐客户最新执行档案
### 1. 客户乙／联系人乙 · 树脂

<!-- customer_id: C06; master_record: true; category: overseas -->

| 项目 | 截至2026-10-28最新口径 |
|---|---|
| 最近邮件处理日期 | 2026-10-26 |
| 最近处理内容/发送状态 | 核文件并拟稿；发送待核 |
| 最近有据可查客户消息 | 2026-10-23 21:56 |
| 最近已核我方发件 | 2026-10-22 20:42 |
| 等待对象 | 我方财务 |
| 为什么排在这里 | 客户索要发票 |
| 补充事实与边界 | 凭证不代表到账 |
### 2. 客户甲／联系人甲 · 乳液

<!-- customer_id: C01; master_record: true; category: overseas -->

| 项目 | 截至2026-10-28最新口径 |
|---|---|
| 最近邮件处理日期 | 2026-10-27（拟通知，发送待核） |
| 最近处理内容/发送状态 | 到账打包通知拟稿，发送未核 |
| 最近有据可查客户消息 | 2026-10-27 |
| 最近已核我方发件 | 2026-10-19 |
| 等待对象 | 我方物流 |
| 为什么排在这里 | 已付款，先推进交付 |
| 补充事实与边界 | 用户确认到账，不代表已发运 |
## 三、国内对接与咨询
| 对象 | 最近联系/处理日期 | 最新情况 | 下一步 |
|---|---|---|---|
| 国内甲 · ELO <!-- customer_id: D02 --> | 10-28微信 | 尚未测试 | 低频回访 |
| 高校咨询 · 疏水材料 <!-- customer_id: D03 --> | 日期未核 | 咨询未确认采购 | 等补基材 |
### 国内记录补充
**D02 国内甲**：只有微信，邮箱未知。
**D03 高校咨询**：技术对接不计订单。
## 四、新增/纠正事件
| 日期 | 对象 | 事件及依据 | 状态边界 |
|---|---|---|---|
| 10-27 | C01 客户甲 | 用户确认到账和打包 | 发货仍待核 |
## 九、旧版完整历史快照（仅供溯源）
---
dataset_id: priority-test
dataset_version: 2026-10-26-r3
---
# 旧台账
## 一、按最近邮件处理日期排序的客户总表
| 客户 | 最近邮件处理日期 | 当前状态 | 具体下一步 |
|---|---|---|---|
| C01 | 2026-10-22 | 待付款 | 催旧款 |
## 二、旧档案
<!-- customer_id: C01; master_record: true; category: overseas -->
### 客户甲／联系人甲 · 乳液
| 事项/时间 | 内容 |
|---|---|
| 10-22草稿 | 旧PI号，待付款 |
#### 当前核对字段
| 字段 | 内容 |
|---|---|
| 最近邮件处理日期 | 2026-10-22 |
## 三、旧日期依据
| 客户 | 最近邮件处理日期 | 依据 |
|---|---|---|
| C01 | 2026-10-22 | 旧处理日期依据 |
`

describe('priority ledger with an embedded historical snapshot', () => {
  it('sorts internal follow-up dates before priority and keeps each task linked to its own source row', () => {
    const schedule = `---
dataset_id: schedule-test
default_sort_field: next_follow_up_date
---
## 一、优先联系与处理总表
| 顺序 | 下次跟进日期 | 客户／联系人 · 产品 | 联系优先级 | 最近邮件处理日期 | 当前进展 | 这次具体做什么 |
|---|---|---|---|---|---|---|
| 1 | 2026-11-11 | 客户乙 · 乳液 <!-- customer_id: C03 --> | 等待 | 2026-11-05 13:27（邮件显示） | 已回复 | 核收件 |
| 4 | 2026-11-10 | 客户甲 · 乳液 <!-- customer_id: C01 --> | 先查 | 待核 | 未核 | 核物流 |
| 2 | 2026-11-10 | 客户丙 · 树脂 <!-- customer_id: C02 --> | 先核 | 2026-11-07 | 已回复 | 核资料 |
| 3 | 触发后再跟进 | 客户丁 · 树脂 <!-- customer_id: C04 --> | 暂停 | 2026-11-09 | 暂停 | 等回复 |
`
    const d = parseFollowup(schedule)
    expect(d.customers.map(c => c.id)).toEqual(['C02', 'C01', 'C03', 'C04'])
    expect(d.customers[1].tasks[0]).toMatchObject({ action: '核物流', dateNature: '2026-11-10 · 内部跟进安排' })
    expect(d.customers[1].tasks[0].source.raw).toContain('customer_id: C01')
    expect(d.customers[2].lastEmailProcessedDate).toBe('2026-11-05')
    expect(d.customers[3]).toMatchObject({ actionDate: null, actionLabel: '触发后再跟进' })
  })
  it('uses explicit customer IDs rather than ordinal headings, retaining stable identities and priority', () => {
    const d = parseFollowup(source)
    expect(d.customers.map(c => c.id)).toEqual(['C01', 'C06'])
    expect(d.customers.map(c => c.contactPriorityRank)).toEqual([1, 2])
    expect(d.customers.every(c => !c.customer.includes('customer_id') && !c.fields.some(f => f.value.includes('<!--')))).toBe(true)
    expect(d.customers[1].detail).toContain('我方财务')
    expect(d.customers[1].detail).not.toContain('我方物流')
    expect(d.identities.filter(i => i.category === 'domestic').map(i => i.id)).toEqual(['D02', 'D03'])
  })
  it('keeps current processing, paid status and next steps independent of older snapshot fields', () => {
    const c = parseFollowup(source).customers[0]
    expect(c).toMatchObject({ status: '已到账已打包；发运未核', next: '安排发运', lastEmailProcessedDate: '2026-10-27', processingActionText: '到账打包通知拟稿，发送未核', sentTime: '2026-10-19', waiting: '我方物流', priorityReason: '已付款，先推进交付' })
    expect(c.processingSourceText).not.toContain('旧处理日期依据')
    expect(c.currentFields).toHaveLength(1)
    expect(c.tasks.map(t => t.action)).toEqual(['安排发运'])
    expect(c.sources.some(s => s.historical && s.raw.includes('旧PI号'))).toBe(true)
  })
  it('retains current domestic notes, channel boundaries, new events and complete historical source', () => {
    const d = parseFollowup(source)
    expect(d.domestic).toHaveLength(2)
    expect(d.domestic[0].relatedSources?.[0].raw).toContain('只有微信')
    expect(d.events.some(e => !e.source.historical && e.customerId === 'C01' && e.content.includes('发货仍待核'))).toBe(true)
    expect(d.events.some(e => e.source.historical && e.content.includes('旧PI号'))).toBe(true)
    expect(d.sections.some(s => s.historical && s.raw.includes('旧日期依据'))).toBe(true)
    source.split('\n').forEach((line, i) => { if (line.trim()) expect(d.blocks.some(b => b.start <= i + 1 && b.end >= i + 1)).toBe(true) })
  })
  it('reads a compact latest-status table without inventing a sent state from drafts', () => {
    const compact = source.replace(/\| 项目 \| 截至2026-10-28最新口径 \|[\s\S]*?(?=### 2\.)/, `| 项目 | 最新状态 |\n|---|---|\n| 联系人 | 示例联系人，邮箱待核 |\n| 最近邮件处理日期／实际发送 | 2026-11-03，用户确认已发 |\n| 已发内容 | 询用途及数量；抄送同事 |\n| 下一步 | 等需求 |\n`)
    const c = parseFollowup(compact).customers.find(c => c.id === 'C06')!
    expect(c.currentFields).toHaveLength(1)
    expect(c).toMatchObject({ lastEmailProcessedDate: '2026-11-03', sentTime: '2026-11-03，用户确认已发', processingActionText: '询用途及数量；抄送同事' })
    expect(parseFollowup(compact.replace('2026-11-03，用户确认已发', '实际发送待核')).customers.find(c => c.id === 'C06')?.sentTime).toBe('')
  })
  it('retains dated-section events when the new table omits a separate date column', () => {
    const d = parseFollowup(source.replace('## 九、旧版', '### 11月3日新增事件\n| 项目 | 最新进展 |\n|---|---|\n| C06 客户乙 | 用户确认已回复，待客户补资料 |\n## 九、旧版'))
    expect(d.events.find(e => e.customerId === 'C06' && e.content.includes('待客户补资料'))).toMatchObject({ time: '11月3日', type: '本版新增事件（时间按源章节）' })
  })
})
