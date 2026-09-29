# 客户发现研究队列（不公开）

这是批量搜索结果的预筛入口，不是客户地图、Company Candidate、Lead 或 CRM。运行预筛不会确认客户需求，也不会发布或发送邮件。只有完整按 `global-demand-side-lead-research` 标准核验后，才可由人工把公司加入正式线索数据。

当前工具负责**导入与预筛**，不负责自动访问搜索引擎或修改现有每 5 小时自动任务。自动任务若要使用此队列，需另行更新其提示并确认运行环境能访问本地项目。

## 使用

把本轮发现的公司整理成 JSON 数组，先预览：

```powershell
pnpm leads:screen --input .\research\incoming.json
```

确认后，追加到本地研究队列（不覆盖已有记录）：

```powershell
pnpm leads:screen --input .\research\incoming.json --save
```

研究队列保存在 `research/lead-discovery-queue.ndjson`，仅用于后续核验。`excluded`、`duplicate`、`invalid` 不进入队列；同域名但名称不同的记录标记 `possible_duplicate` 等人工判断。即使状态是 `ready_for_review`，也**不是** `lead_eligible`，不能自动显示在地图或生成开发信。

输入示例结构（请替换为真实、可核验的公开来源；不要把示例公司入库）：

```json
[
  {
    "companyName": "Example Coating Fertilizer Works",
    "country": "Vietnam",
    "productId": "fertilizer-coating",
    "website": "https://example.com",
    "discoveredAt": "2026-09-29",
    "discoverySource": { "name": "Public search result", "url": "https://example.com/products" }
  }
]
```

后续核验可逐步补上 `application`、`targetCompanyTypeId`、`companyEvidence`、`demandSideReason`、`supplierCheck` 和 `contact`。预筛会指出缺失字段，不会用搜索摘要猜测下游采购或联系人。排除同类原料供应商时，须在 `supplierCheck` 保存官方来源、检查日期和结论；没有来源时只能待核验。国家仅排除中国大陆，不能把台湾、香港或澳门机械地并入大陆。

搜索引擎、协会名录、展会页面只能用于发现。正式入库仍需核对公司产品/工厂资料、应用来源、反向供应商排除、公开联系方式及重复公司。ELO 当前按最新业务方向优先核验自行研发和生产重防腐涂料的企业，不能因为涂料类型相近就宣称其正在使用 ELO。
