# AIYOU 本地部署指南

本文档帮助你在本地搭建 AIYOU 的完整运行环境，用于客户演示或开发调试。

> **重要**：本项目继续在 Lovable 上开发新功能，本地环境通过 GitHub 同步获取最新代码。

---

## 目录

1. [前置准备](#前置准备)
2. [一键初始化（推荐）](#一键初始化推荐)
3. [手动安装步骤](#手动安装步骤)
4. [创建管理员账号](#创建管理员账号)
5. [配置 OpenClaw](#配置-openclaw)
6. [配置 Storage](#配置-storage)
7. [后续同步更新](#后续同步更新)
8. [生产部署](#生产部署可选)
9. [常见问题](#常见问题)

---

## 前置准备

| 软件 | 版本要求 | 安装地址 |
|------|---------|---------|
| Docker Desktop | 最新版 | https://www.docker.com/products/docker-desktop |
| Node.js | 18+ | https://nodejs.org |
| Git | 最新版 | https://git-scm.com |
| Supabase CLI | 最新版 | `npm install -g supabase`（可选，npx 也可以） |

确保 Docker Desktop 已启动并正常运行。

---

## 一键初始化（推荐）

```bash
# 1. 克隆项目
git clone <你的 GitHub 仓库地址>
cd <项目目录>

# 2. 运行初始化脚本
bash scripts/setup-local.sh
```

脚本会自动完成：
- 检查 Docker、Node.js 等依赖
- 安装前端依赖（`npm install`）
- 启动本地 Supabase（数据库 + 认证 + Edge Functions）
- 执行数据库迁移
- 生成 `.env.local` 环境变量文件

脚本结束后按照终端提示完成管理员账号创建和 OpenClaw 配置即可。

---

## 手动安装步骤

如果你更喜欢手动操作，按以下步骤进行：

### Step 1：克隆项目并安装依赖

```bash
git clone <你的 GitHub 仓库地址>
cd <项目目录>
npm install
```

### Step 2：启动本地 Supabase

```bash
npx supabase start
```

首次运行需要下载 Docker 镜像，可能需要几分钟。启动后会输出类似信息：

```
API URL: http://localhost:54321
GraphQL URL: http://localhost:54321/graphql/v1
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
Inbucket URL: http://localhost:54324
anon key: eyJhbG...
service_role key: eyJhbG...
```

记下 **API URL** 和 **anon key**。

### Step 3：初始化数据库

```bash
npx supabase db reset
```

这会自动执行 `supabase/migrations/` 目录下的所有迁移文件。

> 你也可以手动导入合并后的 SQL：`psql -h localhost -p 54322 -U postgres -d postgres -f scripts/init-database.sql`

### Step 4：配置环境变量

在项目根目录创建 `.env.local` 文件：

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_PUBLISHABLE_KEY=<Step 2 输出的 anon key>
VITE_SUPABASE_PROJECT_ID=local
```

> `.env.local` 已在 `.gitignore` 中，不会影响线上环境。

### Step 5：启动前端

```bash
npm run dev
```

打开浏览器访问 `http://localhost:8080`。

---

## 创建管理员账号

1. 在前端页面注册一个普通用户
2. 打开 Supabase Studio：`http://localhost:54323`
3. 进入 **SQL Editor**，执行以下 SQL：

```sql
-- 将第一个注册的用户设为超级管理员
INSERT INTO public.admin_users (user_id, username, email, role)
SELECT user_id, username, email, '超级管理员'
FROM public.profiles
LIMIT 1;
```

4. 现在可以访问 `http://localhost:8080/admin` 进入管理后台

---

## 配置 OpenClaw

1. 按照 [OpenClaw 官方文档](https://github.com/openclaw) 在本地安装并启动
2. 记下服务地址（默认 `http://localhost:18789`）
3. 登录管理后台 → **LLM 配置**
4. 点击"添加模型"，填写：
   - **类型**：openclaw
   - **模型名称**：你在 OpenClaw 中配置的模型名
   - **Base URL**：`http://localhost:18789`
   - **API Key**：你的 OpenClaw Token
5. 设置为默认模型并保存

---

## 配置 Storage

知识库功能需要一个 Storage Bucket：

1. 打开 Supabase Studio：`http://localhost:54323`
2. 进入 **Storage** 页面
3. 如果没有 `knowledge` bucket，手动创建一个：
   - 名称：`knowledge`
   - 公开访问：是（Public）

> 通常 `npx supabase db reset` 已自动创建此 bucket。

---

## 后续同步更新

当你在 Lovable 上开发了新功能后，在本地执行：

```bash
# 1. 拉取最新代码
git pull

# 2. 更新依赖（如果有新包）
npm install

# 3. 更新数据库（如果有新迁移文件）
npx supabase db reset

# 4. 重新构建（生产模式）
npm run build
# 或直接开发模式
npm run dev
```

### 注意事项

- `npx supabase db reset` 会**清空所有数据**并重新执行迁移，适合演示环境
- 如果想保留数据，可以手动执行新增的迁移文件：
  ```bash
  npx supabase migration up
  ```
- Edge Function（`supabase/functions/chat/`）会随 `npx supabase start` 自动加载

---

## 生产部署（可选）

如果需要在服务器上对外提供服务：

### 构建前端

```bash
npm run build
```

生成的静态文件在 `dist/` 目录。

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/your-project/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 反向代理 Supabase API（如果 Supabase 不对外暴露）
    location /supabase/ {
        proxy_pass http://localhost:54321/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 常见问题

### Q: `npx supabase start` 报错端口被占用？

A: 检查是否有其他 Docker 容器占用了 54321-54325 端口，用 `docker ps` 查看并停止冲突容器。

### Q: 前端能打开但登录/注册报错？

A: 检查 `.env.local` 中的 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_PUBLISHABLE_KEY` 是否与 `npx supabase status` 输出一致。

### Q: Edge Function（聊天功能）不工作？

A: 确保 Supabase 已启动且 `supabase/functions/chat/index.ts` 存在。运行 `npx supabase functions serve` 可以单独调试 Edge Functions。

### Q: 数据库迁移失败？

A: 尝试 `npx supabase db reset --debug` 查看详细错误。也可以直接用 `scripts/init-database.sql` 手动导入。

### Q: 如何完全重置本地环境？

```bash
npx supabase stop
npx supabase start
npx supabase db reset
```
