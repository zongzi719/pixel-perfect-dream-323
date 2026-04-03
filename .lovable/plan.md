

# 本地化部署实施计划

## 目标

在项目中生成三个辅助文件，让你可以通过 GitHub 同步代码到本地后，快速搭建演示环境。同时继续在 Lovable 上开发不受影响。

## 实施内容

### 1. 合并迁移 SQL 文件

生成 `scripts/init-database.sql`，将 6 个迁移文件按顺序合并为一个完整的 SQL 文件。方便在本地 Supabase 或独立 PostgreSQL 中一次性导入。

### 2. 编写本地部署文档

生成 `LOCAL_DEPLOY.md`，包含：

- 前置软件安装（Docker Desktop、Node.js 18+、Supabase CLI）
- 本地启动 Supabase（`npx supabase start`）
- 数据库初始化（`npx supabase db reset` 或手动导入合并 SQL）
- 前端环境变量配置（`.env.local`）
- OpenClaw 安装与配置说明
- 管理员账号创建方法
- 后续从 Lovable 同步更新的流程（`git pull` → `npm install` → `npx supabase db reset` → `npm run build`）

### 3. 编写初始化脚本

生成 `scripts/setup-local.sh`，自动化以下操作：

- 检查 Docker、Node.js、Supabase CLI 是否已安装
- 运行 `npx supabase start` 并提取本地 anon key 和 API URL
- 自动生成 `.env.local` 文件
- 运行 `npx supabase db reset` 执行迁移
- 运行 `npm install`
- 提示用户手动创建管理员账号和配置 OpenClaw
- 最后启动 `npm run dev`

## 不会改动的内容

- 不修改任何现有源代码、Edge Function、数据库结构
- 不影响 Lovable 线上环境
- `.env.local` 已在 `.gitignore` 中，不会干扰线上配置

## 生成的文件清单

| 文件 | 用途 |
|------|------|
| `scripts/init-database.sql` | 合并后的完整数据库初始化 SQL |
| `scripts/setup-local.sh` | 一键本地初始化脚本 |
| `LOCAL_DEPLOY.md` | 逐步部署文档（中文） |

