# 团队客户跟进

入口：市场情报 → 客户跟进（`#market-intelligence/follow-up`）。

## 日常使用

负责人登录后点击“上传更新”，选择 UTF-8 编码的 `.md` 或 `.markdown` 完整台账（最大 512 KB）。预览主档数量、按编号比较的变化及完整原文，确认后保存。每次上传是独立完整版本，不将历史文件叠加成新客户。缺少客户总览或日期时保留原文阅读，并提示核对；不会猜测客户状态、付款、发送或发运事实。

“进度总览”按原台账建议行动日排序；无可识别日期的保持原相对顺序并放在末尾。点击客户阅读该版本的完整历史。“完整原文”保留其他附表、联系方式与备注，也可以下载原 `.md`。

“历史版本”显示资料日期与实际保存时间。负责人可恢复旧版；恢复会新增一条版本，现有记录继续保留。同事打开、切回页面或每分钟自动核对一次可见的最新版本；历史阅读不自动跳回新版。

## 团队权限

负责人在“共享成员”添加同事**实际用于网站登录的邮箱**。同事使用已有的、邮箱已验证的 Supabase 账号登录后可以查看和下载，不能上传、恢复或管理成员。添加成员不发送邀请邮件，也不自动创建账号。移除后后续服务请求立即拒绝；已由成员保存的文件无法收回。

服务端每次通过当前项目 Supabase `/auth/v1/user` 核对 Bearer token 和已验证邮箱，再核对负责人/受邀名单。不是所有登录用户都能访问。返回内容设为 `Cache-Control: no-store`；前端不向 localStorage、公开客户数据或静态资源写入台账。Markdown 以 React 文本渲染，不执行上传的 HTML、脚本或链接。

本功能不写开发信发送记录，不生成正式公开客户，不发信、不提交表单。

## 部署与备份

沿用 `neon-lion-knowledge-proxy`，设置 `FOLLOWUP_OWNER_EMAIL` 为负责人的已验证登录邮箱。`FOLLOWUP_DB_PATH` 在容器中固定为 `/data/followup.sqlite3`，由专用 `followup-data` Docker volume 持久保存；容器重建不丢版本。目录仅应用用户可访问，不经 nginx 静态目录提供。现有代理的其他文档任务仍沿用原 Supabase 存储。

上线顺序：先更新代理源码、Dockerfile、Compose 与负责人环境变量，执行 `docker compose up -d --build`，验证匿名请求被拒；再发布前端。不要把原始台账、数据库、服务器环境变量或私人种子导入文件提交到 GitHub。

备份可通过容器内 Python `sqlite3.Connection.backup` 创建一致性副本，再将副本保存到私有备份位置；应同时保留负责人配置。恢复时先停止该代理，将备份放回 volume 并保持 UID/GID 10001 的所有权，随后启动验证。不要对该部署使用 `docker compose down -v`，这会删除台账 volume。

验证：`pnpm test -- tests/customerFollowup.test.ts`；代理镜像内执行 `python -m unittest discover -s tests -p test_followup.py`，使用临时数据库与模拟身份，不连接生产账号或更改发送历史。
