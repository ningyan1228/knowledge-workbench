# 首批来源候选与核验记录

这些条目是可添加到“来源管理”的具体 API 端点，不是已写入某个用户数据库的来源。首次登录后请逐个新增、验证，再决定是否启用。采集到的是论文或公开元数据，不能当作自有产品性能证明。

| 名称 | 方向 | 适配器 | 端点 | 核验日期 | 结果 |
| --- | --- | --- | --- | --- | --- |
| OpenAlex · 控释肥包膜 | 肥料包膜/控释肥 | `openalex` | `https://api.openalex.org/works?search=controlled%20release%20fertilizer%20coating&per-page=20` | 2026-09-19 | 读到标题 *Controlled Release Fertilizers: A Review on Coating Materials and Mechanism of Release*；日期 `2021-01-26`；摘要 1,377 字符；DOI 链接已提取 |
| Crossref · 环氧化亚麻油 | ELO/聚合物添加剂 | `crossref` | `https://api.crossref.org/works?query=epoxidized%20linseed%20oil&rows=20` | 2026-09-19 | 读到标题 *Influence of Keratin on Epoxidized Linseed Oil Curing and Thermoset Performances*；来源没有提供可用日期或摘要；DOI 链接已提取 |
| Crossref · PP 水性涂层 | 水性附着力促进/PP | `crossref` | `https://api.crossref.org/works?query=waterborne%20coating%20polypropylene&rows=20` | 2026-09-19 | 读到标题 *Waterborne One-Component Polypropylene Coating*；日期 `1996-02-01`；摘要 616 字符；DOI 链接已提取 |

以上是本机 `verify_sources.py` 的**只读适配器检查**，尚未写入任何用户 Supabase。真正完成标准是：来源验证任务成功、启用来源、采集任务成功，且“行业情报”中能打开对应的真实入库记录。worker 会再次记录来源的最近成功时间、失败次数和安全错误码。

OpenAlex 已改为按调用计费，使用前应查看其当前限额和价格；PubMed 的公开 E-utilities 无 key 有限速，建议配置联系邮箱和可选 API key。详见 [OpenAlex API 文档](https://help.openalex.org/api/) 与 [NCBI E-utilities 文档](https://www.ncbi.nlm.nih.gov/home/develop/api/)。
