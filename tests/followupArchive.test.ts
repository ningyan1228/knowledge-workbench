import { expect, it } from 'vitest'
import { parseFollowup } from '../src/lib/customerFollowup'
it('indexes full archives by stable IDs without historical status or dates replacing current records', () => {
 const md = `---
dataset_id: neon-lion-all-customer-archive
updated_date: 2026-11-24
overseas_or_inquiry_count: 1
domestic_record_count: 0
---
# Archive
## 三、全部客户索引与当前跟进表
| 顺序 | 编号 | 客户 · 产品 | 国家/地区 | 最近处理邮件/沟通记录 | 当前进展 | 下一步 |
|---|---|---|---|---|---|---|
| 1 | C10 | [Example / Contact · Resin](#customer-c10) | 待核 | 2026-11-21 | 付款待确认 | 核款 |
## 四、逐客户完整档案
### 01. C10｜Example / Contact · Resin
| 字段 | 当前口径 |
|---|---|
| 当前状态 | 付款待确认 |
| 产品/牌号 | Resin A |
| 下一步 | 核款 |
| 最近处理邮件/沟通记录 | 2026-11-21 |
#### 近期进展与纠正记录
| 日期 | 记录性质 | 内容 |
|---|---|---|
| 2026-11-24 | 日期复核 | 实际结果待核 |
#### 历史往来与原始信息
| 字段 | 旧状态 |
|---|---|
| 当前状态 | 旧报价 |
## 七、完整历史原档
### 1. Old record
old content
`
 const d=parseFollowup(md), c=d.customers[0]
 expect(d.failed).toBe(false)
 expect(c.id).toBe('C10')
 expect(c.progress).toBe('付款待确认')
 expect(c.product).toBe('Resin A')
 expect(c.actionDate).toBeNull()
 expect(c.lastEmailProcessedDate).toBeNull()
 expect(c.sources.some(s=>s.historical && s.raw.includes('旧报价'))).toBe(true)
 expect(c.events[0].type).toBe('日期复核')
 expect(d.coverage.unretained).toBe(0)
})
