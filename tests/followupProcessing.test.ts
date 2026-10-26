import { describe, expect, it } from 'vitest'
import { mailProcessingDate, parseFollowup } from '../src/lib/customerFollowup'

const ledger = `---
dataset_id: test-processing
dataset_version: 2026-10-26-r3
default_sort_field: last_email_processed_date
---
# 台账
## 一、按最近邮件处理日期排序的客户总表
| 客户公司／联系人 · 对应产品 | 最近邮件处理日期 | 国家及原档客户信息 | 产品/项目 | 最新已知时间与进度 | 当前状态 | 具体下一步 | 最近已核客户消息时间 | 最近已核我方发送时间 | 当前等待对象 | 最近处理内容／发送状态 | 关键待确认事项 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| C01 | 待核 | 客户甲 | 产品甲 | 客户来信 | 未核 | 核是否发送 | 2026-10-26 10:22 | 10-10后，具体日期待核 | 我方 | 最近邮件处理日期待核 | 日期 |
| C02 | 2026-10-23 | 客户乙 | 产品乙 | 暂缓供货 | 暂不供货 | 核暂停回复并归档 | 2026-10-22 | 时间待核 | 我方 | 暂缓供货回复草稿；发送待核 | 发送 |
| C03 | 2026-10-26 | 客户丙 | 产品丙 | 附件核对 | 到账待核 | 查款 | 2026-10-23 | 2026-10-22 | 银行 | 核付款附件并拟稿；发送待核 | 到账 |
| C04 | 2026-10-26 | 客户丁 | 产品丁 | 拟稿 | 草稿待核 | 核发送 | 原邮件日期未核 | 未核 | 我方 | 报价及致谢草稿 | 发送 |
| C05 | 待核 | 客户戊 | 产品戊 | 内部资料工作 | 待核 | 补证 | 2026-10-08 | 未核 | 我方 | 10-08仅为申报工作，不计入邮件处理 | 日期 |
## 十六、最近邮件处理日期依据与旧建议保留
| 客户 | 最近邮件处理日期 | 最近处理内容／发送状态 | 依据 |
|---|---|---|---|
| C03 | 2026-10-26 | 核付款附件并拟稿；发送待核 | 明确附件核查及草稿记录 |
`

describe('mail-processing date semantics', () => {
  it('recognizes the new twelve-field schema and separates processing, incoming and sent dates', () => {
    const d = parseFollowup(ledger), c = d.customers.find(c => c.id === 'C03')!
    expect(d.customers).toHaveLength(5)
    expect(c.fields).toHaveLength(12)
    expect(c).toMatchObject({ lastEmailProcessedDate: '2026-10-26', processingActionText: '核付款附件并拟稿；发送待核', customerTime: '2026-10-23', sentTime: '2026-10-22', actionDate: null, dateNature: '', processingDatePrecision: '日期' })
    expect(c.processingSources).toHaveLength(2)
    expect(c.processingSourceText).toBe('明确附件核查及草稿记录')
    expect(c.tasks[0].dateNature).not.toContain('2026-10-26')
    expect(c.tasks[0].status).toContain('待核')
  })
  it('sorts descending, keeps source tie order, places unknowns last and does not push paused clients to the end', () => {
    const d = parseFollowup(ledger)
    expect(d.customers.map(c => c.id)).toEqual(['C03', 'C04', 'C02', 'C01', 'C05'])
    expect(d.customers.find(c => c.id === 'C02')?.tasks[0].status).toContain('暂停')
    expect(d.customers.filter(c => c.lastEmailProcessedDate === null).map(c => c.id)).toEqual(['C01', 'C05'])
  })
  it('does not fill mail dates from an incoming message, internal paperwork, upload day or approximate range', () => {
    for (const label of ['待核', '10-10后', '2026-10-10后', '日期未核，2026-10-26整理', '2026-02-30', '']) expect(mailProcessingDate(label)).toBeNull()
    expect(mailProcessingDate('2026-10-26')).toBe('2026-10-26')
    expect(parseFollowup(ledger).customers.find(c => c.id === 'C01')?.lastEmailProcessedDate).toBeNull()
    const legacy = parseFollowup('# 旧版\n## 客户总览\n| 编号 | 下一次跟进日 | 客户 | 产品/项目 | 当前状态 |\n|---|---|---|---|---|\n| C01 | 2026-11-12 | 旧客户 | 产品 | 日期待核 |')
    expect(legacy.customers[0]).toMatchObject({ actionDate: '2026-11-12', lastEmailProcessedDate: null, processingDateLabel: '待核' })
  })
})
