# Global Market Intelligence · 二期 MVP

二期以现有“外贸知识工作台”为基础扩展，不替换一期的产品、文件、文章、来源、Auth、RLS、主题或 Hash 路由。

## 本次实现

- 新一级导航：`#/market-intelligence`。
- Brazil Agriculture 信息架构 Demo：6 个区域、作物/应用、机会、公司、新闻和来源页签。
- Leaflet + OpenStreetMap 地图，区域列表与地图双向选择。
- 每项 Demo 均标记为 **Demo / 未采集**；公司计数、新闻计数为零，机会不是市场事实或产品声明。
- `202609190005_market_intelligence.sql`：私有市场、国家、区域、行业、通用 applications、机会、公司、联系人、线索，以及文章关联表。所有新表采用 `owner_id`、RLS 与同所有者外键校验。
- 已登录用户可显式点击“保存 Demo 到私人库”，调用 `seed_market_intelligence_demo()`；种子数据也明确为 `demo`，且可重复执行。

## 尚未接入真实数据

- 巴西实际市场规模、需求、企业、联系人或新闻。
- 公司发现、CRM 转 Lead、爬虫、AI 分类、Watchlist 与提醒。
- 任何真实市场事实均须有原始来源 URL、来源类型、发布时间/获取时间和最后核验时间后才可展示为真实情报。

## 部署前操作

在 Supabase SQL Editor 中，在既有四个一期迁移之后运行：

```text
supabase/migrations/202609190005_market_intelligence.sql
```

GitHub Pages 使用同一套 `VITE_SUPABASE_URL`、`VITE_SUPABASE_PUBLISHABLE_KEY` 与 `VITE_API_BASE_URL`。需要临时隐藏二期入口时，在构建环境设定：

```text
VITE_FEATURE_MARKET_INTELLIGENCE=false
```
