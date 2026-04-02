

# 管理后台接入 Supabase（Lovable Cloud）全量迁移方案

## 概述
将管理后台全部 13 组 Mock 数据迁移到 Supabase 数据库，涉及建表、RLS、Supabase Client 集成、以及 15 个页面组件的数据对接。

## 第一步：启用 Lovable Cloud

项目当前未连接 Supabase，需要先通过 Lovable Cloud 自动创建后端。

## 第二步：数据库设计（建表 + RLS）

### 需要创建的表

| # | 表名 | 说明 | 主要字段 |
|---|------|------|---------|
| 1 | `profiles` | 前台用户（绑定 auth.users） | username, phone, email, avatar, status, token_used, token_balance |
| 2 | `admin_users` | 后台管理员 | username, email, role, status, user_id(FK auth.users) |
| 3 | `roles` | 角色定义 | name, description, permissions(jsonb) |
| 4 | `agents` | AI Agent 配置 | name, name_en, avatar, perspective, tags(text[]), description, system_prompt, enabled, usage_count |
| 5 | `conversations` | 对话记录 | user_id, agent_id, message_count, status, last_message |
| 6 | `notes` | 用户笔记（审计用） | user_id, title, content, status |
| 7 | `token_prices` | Token 价格配置 | type, model, input_price, output_price, unit |
| 8 | `plans` | 套餐 | name, type, price, tokens, duration, features(text[]), status, subscribers |
| 9 | `orders` | 订单 | user_id, plan_id, amount, status, pay_method |
| 10 | `usage_records` | 消费流水 | user_id, type, agent_id, tokens_input, tokens_output, cost |
| 11 | `memory_configs` | 用户记忆配置 | user_id, memory_count, max_memory, retention_days, auto_extract |

### 权限定义
`permission_groups` 为静态配置数据，保留在前端代码中（不建表），因为它是 UI 展示用的权限树定义，不是动态数据。

### RLS 策略
- 管理后台表统一使用 `admin_users` 角色验证
- 创建 `is_admin()` security definer 函数检查当前用户是否为管理员
- 所有管理表：只有 admin 可 SELECT/INSERT/UPDATE/DELETE

## 第三步：前端集成层

### 新建文件

| 文件 | 说明 |
|------|------|
| `src/integrations/supabase/client.ts` | Supabase Client 初始化（Lovable Cloud 自动生成） |
| `src/integrations/supabase/types.ts` | 自动生成的类型定义 |
| `src/admin/hooks/useAdminAuth.ts` | 管理员登录/登出/会话管理 hook |
| `src/admin/hooks/useUsers.ts` | 用户 CRUD hook（useQuery/useMutation） |
| `src/admin/hooks/useAgents.ts` | Agent CRUD hook |
| `src/admin/hooks/useRoles.ts` | 角色 CRUD hook |
| `src/admin/hooks/useContent.ts` | 对话/笔记查询 hook |
| `src/admin/hooks/useBilling.ts` | 价格/套餐/订单/消费记录 hook |
| `src/admin/hooks/useMemory.ts` | 记忆配置 hook |
| `src/admin/hooks/useDashboard.ts` | Dashboard 统计数据 hook（聚合查询） |

### 每个 hook 的模式
```text
useQuery  → 列表/详情查询（替代 useState(mockData)）
useMutation → 创建/更新/删除（替代本地 setState）
实时刷新 → invalidateQueries on mutation success
```

## 第四步：改造 15 个页面组件

每个页面的改造模式一致：
1. 移除 `import { mockXxx } from "@/admin/data/mockData"`
2. 替换为 `import { useXxx } from "@/admin/hooks/useXxx"`
3. 将 `useState(mockData)` 替换为 hook 返回的 `{ data, isLoading }`
4. 增加 loading 状态和 empty 状态 UI
5. CRUD 操作改为 mutation 调用

| 页面 | 替换的 Mock | 对应 Hook |
|------|------------|----------|
| `Dashboard.tsx` | `dashboardStats` | `useDashboard` |
| `UserList.tsx` | `mockUsers` | `useUsers` |
| `UserDetail.tsx` | `mockUsers`, `mockUsageRecords` | `useUsers`, `useBilling` |
| `RoleList.tsx` | `mockRoles` | `useRoles` |
| `Permissions.tsx` | `mockRoles` | `useRoles` |
| `AdminManage.tsx` | `mockAdmins`, `mockRoles` | `useAdminAuth`, `useRoles` |
| `AgentList.tsx` | `mockAgents` | `useAgents` |
| `AgentCreate.tsx` | _(无读取)_ | `useAgents` (insert) |
| `ContentList.tsx` | `mockConversations` | `useContent` |
| `ContentDetail.tsx` | `mockConversations` | `useContent` |
| `NotesManage.tsx` | `mockNotes` | `useContent` |
| `PriceConfig.tsx` | `mockTokenPrices` | `useBilling` |
| `PlanManage.tsx` | `mockPlans` | `useBilling` |
| `OrderList.tsx` | `mockOrders` | `useBilling` |
| `UsageRecords.tsx` | `mockUsageRecords` | `useBilling` |
| `MemoryManage.tsx` | `mockMemoryConfigs` | `useMemory` |

## 第五步：管理员登录改为真实认证

- `AdminLogin.tsx` 改为调用 `supabase.auth.signInWithPassword()`
- `AdminApp.tsx` 增加登录态守卫：未登录跳转 `/admin/login`
- `AdminHeader.tsx` 退出按钮调用 `supabase.auth.signOut()`

## 第六步：清理

- 删除 `src/admin/data/mockData.ts`（保留 `permissionGroups` 定义，移至独立文件如 `src/admin/data/permissions.ts`）

## 技术要点

- 使用 `@tanstack/react-query`（项目已有）管理服务端状态
- Dashboard 统计数据通过 Supabase RPC 或聚合查询获取（count/sum）
- 所有时间字段使用 `timestamptz`，前端格式化显示
- tags/features 等数组字段使用 PostgreSQL `text[]` 类型
- 需要先在 Supabase 中创建一个管理员用户用于登录

