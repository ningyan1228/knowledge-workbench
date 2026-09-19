# 真实接入与部署操作清单

本指南只写需要你在各个平台完成的操作；所有密钥都应在相应平台的环境变量/Secrets 中填写，**不要发到聊天中**。

## 当前审计结论

| 项目 | 代码状态 | 已真实验证 | 仍需配置或验证 |
| --- | --- | --- | --- |
| 前端、Hash 路由、中文/深色/移动界面 | 已完成 | `pnpm build` 通过 | GitHub Pages 实际域名与刷新回调 |
| Supabase 表、RLS、私有 Storage、幂等 job/租约 | 已完成 | SQL 已静态检查 | 在你的 Supabase 运行迁移；用户 A/B 越权测试 |
| 登录、初始产品目录、上传 UI | 已完成 | 前端构建通过 | Supabase Auth 登录、私有 Storage 直传与版本记录 |
| PDF/DOCX 文本/表格定位与候选参数提取 | 已完成 | worker 导入/语法通过 | 三份真实文件导入、页码/段落、参数与原文核对 |
| 来源验证与采集 | 已完成 | 三个适配器实际抽出标题、日期/日期未知、摘要长度、原文链接 | 你的来源记录入库、worker 运行、文章落库 |
| 中文摘要 | 已完成（可选 AI） | 无；当前未配置 AI | 配置兼容 AI 服务并确认文章摘要入库 |
| 资料问答、英文草稿、草稿保存 | 已完成（受证据约束） | 前端/代理导入与构建通过 | AI、已解析资料、已批准声明；真实问答与保存验证 |
| GitHub Pages、Actions、Docker Compose | 已完成 | workflow 与 Compose 文件存在 | GitHub 仓库/Pages、DNS、服务器启动与 HTTPS 健康检查 |

## A. Supabase：数据库、文件和登录

1. 登录 Supabase Dashboard，新建一个**私人**项目。记下 Project URL；在 Project Settings → API 复制 publishable key（或项目显示的安全浏览器公钥）。不要使用 service_role key 作为浏览器变量。
2. 打开 SQL Editor，按此顺序分别粘贴并运行四个文件的内容：
   - `supabase/migrations/202609190001_initial_schema.sql`
   - `supabase/migrations/202609190002_job_rpcs.sql`
   - `supabase/migrations/202609190003_onboarding_and_catalog.sql`
   - `supabase/migrations/202609190004_article_date_precision.sql`
3. 在 Authentication → Providers 中保留你要使用的登录方式（初版使用 Email）。关闭任何你不需要的开放注册方式；在 Authentication → Users 创建你自己的首个账号，或使用受控邀请。
4. 在 Authentication → URL Configuration 添加本地地址和日后的 GitHub Pages 地址到 redirect URLs。例如本地为 `http://127.0.0.1:5173`；Pages 地址会类似 `https://<GitHub 用户名>.github.io/<仓库名>/`。本项目当前使用密码登录，不会自动注册。
5. Storage 页面应能看到迁移创建的私有 `private-documents` bucket。不要改为 public。
6. 在项目根目录复制 `.env.example` 为 `.env`，只填写：

```text
VITE_SUPABASE_URL=<Project URL>
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable key>
VITE_API_BASE_URL=https://neon-lion-api.gjsx.uno
VITE_BASE_PATH=/
```

7. 执行 `pnpm dev`，打开“资料与设置”，登录。首次登录会自动建立 `profiles` 和 `settings`，并创建只有名称、无性能声明的三条产品目录记录。

Supabase 的所有浏览器读写都由 RLS 控制；service_role 仅给 worker，绝不放入 `.env` 的 `VITE_` 变量。

## B. GitHub：源码、Pages 与定时 worker

1. 创建或选择一个 GitHub 仓库，将本工作区推送到 `main`。当前本地仓库没有远程仓库，因此这一步还未完成。
2. 在仓库 Settings → Pages，Source 选择 **GitHub Actions**。
3. 在 Settings → Secrets and variables → Actions → **Variables** 新建以下非敏感值：

```text
VITE_SUPABASE_URL=<Project URL>
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable key>
VITE_API_BASE_URL=https://neon-lion-api.gjsx.uno
AI_BASE_URL=<可选、OpenAI-compatible 基础地址>
AI_MODEL=<可选模型名>
NCBI_EMAIL=<可选联系邮箱>
```

4. 同一页面的 **Secrets** 新建：

```text
SUPABASE_URL=<Project URL>
SUPABASE_SERVICE_ROLE_KEY=<仅给 Actions worker 的 service_role key>
AI_API_KEY=<可选，仅摘要/问答/草稿需要>
NCBI_API_KEY=<可选>
```

5. 首次 push 后，查看 Actions 中 **Deploy static frontend to GitHub Pages** 是否通过。保存它显示的 Pages URL；把该 URL 加回 Supabase redirect URLs，并写入服务器 `ALLOWED_ORIGINS`。
6. 在 Actions 手动运行 **Daily knowledge ingestion**。运行前，先在站内把来源“验证端点”入队并在 Supabase `jobs` 看到 `queued`；worker 成功后再启用来源并手动运行一次采集。每天的目标时刻是北京时间 08:17（UTC 00:17，可能延迟）。

GitHub Secrets 在日志中会被遮蔽，但仍不要输出、拼接或复制它们；详细规则见 [GitHub Secrets 官方文档](https://docs.github.com/en/actions/reference/security/secrets)。

## C. 小服务器：无状态 API 代理

已按既有服务器约定准备：Ubuntu 22.04、Docker Compose、`nginx-proxy`/`acme-companion` 的 `web` 网络。默认 API 域名为 `neon-lion-api.gjsx.uno`；若你改用其他子域名，同时更新 GitHub Variable 与 Supabase redirect URL。

1. 先在 DNS 添加记录：主机记录 `neon-lion-api`，类型 `A`，值 `43.128.149.75`。等待解析生效后再申请 HTTPS。
2. 将 `services/proxy/` 的内容放到服务器 `~/projects/neon-lion-knowledge-proxy/`。该目录需要包含 `Dockerfile`、`docker-compose.yml`、`requirements.txt`、`app/`。
3. 仅在服务器目录创建 `.env`，可从 `.env.example` 复制后填写：

```text
PROXY_PUBLIC_HOST=neon-lion-api.gjsx.uno
LETSENCRYPT_EMAIL=<你的证书通知邮箱>
SUPABASE_URL=<Project URL>
SUPABASE_PUBLISHABLE_KEY=<publishable key>
ALLOWED_ORIGINS=https://<GitHub 用户名>.github.io
APP_TIMEZONE=Asia/Shanghai
AI_BASE_URL=<可选、OpenAI-compatible 基础地址>
AI_API_KEY=<可选>
AI_MODEL=<可选>
```

代理不需要、也不应持有 Supabase service_role key。它只用用户 Bearer token + publishable key 读取 RLS 保护的数据；worker 才拥有 service_role。

4. 在服务器执行：

```bash
cd ~/projects/neon-lion-knowledge-proxy
docker compose up -d --build
docker compose ps
docker compose logs --tail=100
curl -i https://neon-lion-api.gjsx.uno/health
```

`/health` 应仅显示各组件是否配置，绝不能返回密钥。Compose 会从同目录 `.env` 读取变量；Docker 的环境文件与变量插值机制见 [Docker 官方说明](https://docs.docker.com/compose/how-tos/environment-variables/set-environment-variables/)。

## D. 收到三份原始文件后的真实验收顺序

1. 登录网页，在“资料与设置”选择产品并上传每个 PDF/DOCX。预期：私有 bucket 有 `owner_id/...` 路径、`documents` 有一条记录、`product_versions` 有待审核版本、`jobs` 有 `parse_document`。
2. 手动运行 Actions worker。预期：job 为 `succeeded`；`document_chunks` 有页码/标题/段落或表格行定位；`product_specs` 只含 `extracted` 候选；`review_tasks` 提醒人工确认。扫描件会显示 `needs_ocr`，不会生成空摘要。
3. 在“资料与设置”添加 3 个候选来源，逐项点击验证；运行 worker。预期：`sources.verification_status=verified`，而且至少返回一条实际标题/链接；再启用并运行采集。
4. 打开“行业情报”。预期：真实文章卡片显示标题、原始日期或“日期未知”、访问级别、实际提取摘要（如有）和原文链接。AI 已配置时，`article_summaries` 会出现中文摘要及模型版本；没有摘要原文时会明确说明不能摘要。
5. 在“资料问答”输入实际问题。预期：只检索已解析的当前账户文件，显示稳定 chunk/spec 引用；无资料则返回 `INSUFFICIENT_EVIDENCE`。不得出现编造的页码或引用。
6. 仅在你审核至少一条 `own_product + approved + citation` 声明后，测试“内容工作室”。预期：草稿保存到 `drafts`，状态为 `needs_review`；不会自动发布。

## 目前的明确阻塞项

- 尚未提供三份原始文件，因此没有真实私有文件、参数、产品版本或问答证据可验证。
- 尚未提供 Supabase 项目、GitHub 远程仓库/Pages URL、服务器 `.env` 或 DNS，因此没有线上数据、部署和 HTTPS 实测。
- 未配置 AI provider，因此中文摘要、真实问答和基于批准声明的草稿只能保持“未配置/证据不足”，不会以本地模板代替。
- 产品库的“人工批准/拒绝候选参数与声明”界面仍需在真实文件入库后继续完成和验收；目前数据库状态模型和 worker 候选任务已就位。
