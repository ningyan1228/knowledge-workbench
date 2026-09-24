# 阳光心材料 · 化工外贸知识工作台

这是 Ningbo Neon Lion Technology Co., Ltd. 的私人学习和业务辅助工具。它不是对外产品官网，也不会自动发邮件或发布文章。核心原则很简单：**每个对外信息都应能回到原文，不能确认时就明确说明还需要什么。**

## 现在可以做什么

- 中文默认的今日工作台、产品专题、行业情报、40 节外贸学习路线、资料问答与内容草稿。
- 三个首批产品的可审阅初始化：NL-W1201、环氧化亚麻油 ELO、缓释肥料专用包膜原料。
- 参数按任务书摘录保留，但全都标为“待上传原文件 / 待确认”，没有假链接或未经证实的性能承诺。
- 连接 Supabase 后，数据库迁移会提供按账户隔离的产品、文件、段落、引用、来源、草稿和任务；文件放在私有 Storage。
- 每日 worker 支持 PDF/DOCX 文本提取、来源验证、文章去重、任务租约和重试；没有 AI key 时仍能阅读、搜索、上传和做笔记。

## 本地打开

需要 Node.js 20.19+。本仓库已使用 pnpm lockfile 固定安装结果。

```powershell
pnpm install --frozen-lockfile
Copy-Item .env.example .env
pnpm dev
```

浏览器打开终端显示的本地地址。没有 `.env` 也能进入安全的“本地预览模式”；此模式的草稿只存在当前浏览器，不能当作正式业务记录。

生产检查：

```powershell
pnpm test
pnpm build
```

## 第一次配置（面向日常使用）

1. 按 [部署说明](docs/deployment.md) 新建 Supabase，按文件名顺序执行全部迁移（包括学习路线第 007 份），并创建自己的登录账号。
2. 从 `.env.example` 复制 `.env`，只填写 `VITE_SUPABASE_URL`、`VITE_SUPABASE_PUBLISHABLE_KEY`、`VITE_API_BASE_URL`。不要把任何 `service_role`、AI 或搜索 key 写入前端。
3. 打开“资料与设置”登录，然后在“产品知识库”上传三份原始资料：
   - `Neon_Lion_NL-W1201_Water-Based_Surface_Treatment_Agent_TDS_EN.pdf`
   - `TDS Epoxidized Linseed Oil(3).pdf`
   - `缓释肥料专用包膜剂产品介绍(1)(1).docx`
4. 阅读每个提取字段的原文位置，确认或拒绝它。新版 TDS 要新建版本，不能覆盖旧版。
5. 参考 [来源目录](docs/source-catalog.md) 添加来源，逐个验证端点后再启用。每天的目标检查时间是北京时间 08:17；也可在 GitHub Actions 手动补跑。
6. 回到“资料问答”粘贴客户问题。回答会说明客户意图、已有信息、缺失信息、英文草稿和引用。若没有证据，它会提示你该问客户或工厂什么。
7. 在“内容工作室”填写主题，生成并核对草稿；使用“复制纯文本”贴到微信或邮件。初版不会自动发布，发布链接和日期仅作你的记录。
8. 打开“外贸学习”创建私人学习计划。课程可离线阅读；登录后才保存进度、练习、笔记与复习。完成规则和上线验收见 [学习路线说明](docs/learning-route.md)。

## 目录

```text
src/                     React 静态前端
supabase/migrations/     表、RLS、私有文件策略、任务 RPC
services/proxy/          无状态 FastAPI 代理（JWT/配置状态/任务入口）
workers/ingestion/       GitHub Actions 中运行的解析与采集 worker
.github/workflows/       GitHub Pages 与每日采集
docs/                    来源、部署和验收记录
```

## 首批资料的重要边界

- `NL-W1201`：45±2% 与参考配方 40% solution 的关系、黏度 `Pa.s / 25 C` 的单位、干燥条件都必须由原始 TDS/工厂确认。
- `ELO`：未指定 NL 牌号；黏度字段的“≤”与“700–1200”不能擅自合并；不能从 `eco-friendly` 推出食品接触批准、认证或固定生物基比例。
- 缓释肥料包膜原料：检测值不等于质量保证范围；释放期、成膜、固化、添加量和合规表述均要有适用条件与证据。

## 安全与维护

- `service_role` 只在 Actions worker 或必要后端环境变量中使用，绝不进 Git、浏览器或日志。
- 用户上传 URL 会在 worker 中进行 scheme、DNS 私网与每次重定向的 SSRF 检查；不绕过登录、付费墙或验证码。
- 备份必须同时包含数据库与私有附件。恢复步骤见 [部署说明](docs/deployment.md)。
- 已完成与待验证的清单见 [验收报告](docs/acceptance-report.md)。首批源文件、Supabase 项目、服务器和 AI 连接尚未由本仓库提供，因此不会伪称线上闭环已完成。
