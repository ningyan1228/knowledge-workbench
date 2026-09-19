# 部署说明

## 1. Supabase

1. 新建私人 Supabase 项目，关闭公开注册或改为仅允许你自己的登录方式。
2. 在 SQL Editor 按文件名顺序执行 `supabase/migrations/` 中的迁移。迁移会创建私有 `private-documents` bucket、RLS、文件路径策略、幂等任务和 worker 租约 RPC；二期还会增加私有市场情报实体，详见 `docs/market-intelligence-phase-2.md`。
3. 创建你的第一个 Auth 用户。首次登录后，向 `profiles` 插入一条 `id` 与 `owner_id` 都等于该用户 UUID 的记录。
4. 浏览器 `.env` 只填项目 URL 与 publishable key；绝不填 `service_role`、AI 或搜索密钥。

## 2. GitHub Pages

在 GitHub 仓库的 Settings → Pages 选择 **GitHub Actions**。在 Repository variables 填入：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_API_BASE_URL`

`.github/workflows/deploy-pages.yml` 会设置仓库子路径 base；使用自定义域名时请把 `VITE_BASE_PATH` 调整为 `/`。前端使用 Hash 路由，刷新产品页不会请求不存在的静态路径。

## 3. 无状态代理

在小服务器上构建 `services/proxy/Dockerfile`。只配置其 `.env.example` 中的服务端变量，反向代理仅允许 GitHub Pages 实际域名进入 CORS。服务不使用本地数据库、队列或附件目录；日志不得写入问题全文、客户信息、token 或签名 URL。

健康检查：`GET /health`。它只报告组件是否配置，不会返回任何密钥。生产环境需由反向代理提供 HTTPS、请求体限制和访问日志脱敏。

## 4. 每日采集

GitHub Actions Secrets：

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- 可选 `NCBI_API_KEY`

GitHub Actions variable：可选 `NCBI_EMAIL`。

工作流在 UTC `17 0 * * *`（北京时间目标 08:17）触发，也支持手动运行。它先从 `jobs` 原子领取任务；服务中断后，过期租约会被下次运行回收。无新增不是失败，来源 403、超时、额度耗尽会保留安全错误码。GitHub 的 schedule 可能延迟，不能承诺准点。

## 5. 备份与恢复

从 Supabase 导出数据库数据，并单独下载私有 Storage 的 `private-documents/{owner_id}/...` 内容；两者及引用映射必须一起保存到你的安全位置。不要上传到公开仓库或 Actions artifact。恢复到新项目时：应用迁移 → 重建 Auth 用户 → 按新 owner UUID 恢复文件路径与业务数据 → 重跑文档解析/检索 → 重新配置 Pages、代理和 Actions secrets。
