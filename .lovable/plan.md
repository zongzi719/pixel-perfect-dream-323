

# 四项需求实施方案

## 需求 1：计费系统四表支持手动新增

当前状态：`PriceConfig`（Token价格）和 `PlanManage`（套餐）已有新增功能，但 `OrderList`（订单）和 `UsageRecords`（消费记录）只有查看，无新增入口。Token价格也缺少新增（只能编辑已有的）。

**改动：**
- **PriceConfig.tsx**：增加"新增价格配置"对话框（输入 type、model、input_price、output_price、unit）；在 `useBilling.ts` 中新增 `useCreateTokenPrice` mutation
- **OrderList.tsx**：增加"新增订单"对话框（输入 username、user_id、plan_name、amount、status、pay_method）；新增 `useCreateOrder` mutation
- **UsageRecords.tsx**：增加"新增消费记录"对话框（输入 username、user_id、type、agent_name、tokens_input、tokens_output、cost）；新增 `useCreateUsageRecord` mutation

## 需求 2：内容管理与 Web 端接通

当前状态：Web 端的对话（ChatContext）和笔记（notesData）都是前端内存数据，管理后台的 `conversations` 和 `notes` 表是空的。

**改动：**
- **ChatContext.tsx** 改造：登录用户的对话持久化到 `conversations` 表，消息保存。未登录用户保持本地状态
- 需要新建 `messages` 表存储对话消息（conversation_id, role, content, created_at），并添加 RLS 策略
- **笔记页面**（InspirationNotes）：登录用户的笔记 CRUD 对接 `notes` 表
- 管理后台的 ContentList/NotesManage 即可查看 Web 端产生的真实数据
- 为 `conversations` 和 `notes` 表添加用户自己可 INSERT/SELECT 的 RLS 策略

## 需求 3：插入 Agent 真实数据

根据 `src/data/coaches.ts` 中的 6 个 Coach 数据，通过数据库 insert 工具插入到 `agents` 表：

| name | name_en | perspective | tags | description | system_prompt |
|------|---------|-------------|------|-------------|---------------|
| Sarah Chen | Strategy Coach | 战略 | 战略,商业,增长 | 专注于商业战略规划... | (生成合理提示词) |
| Marcus Johnson | Risk Coach | 风险 | 风险,合规,安全 | 识别潜在风险... | ... |
| Yuki Tanaka | Product Coach | 产品 | 产品,用户体验,创新 | 从产品设计... | ... |
| Alex Rivera | Data Coach | 数据 | 数据,分析,洞察 | 用数据驱动... | ... |
| Luna Park | Innovation Coach | 创新 | 创新,设计思维,趋势 | 激发创新思维... | ... |
| David Kim | Operations Coach | 运营 | 运营,效率,执行 | 关注执行效率... | ... |

## 需求 4：Web 端登录功能

当前状态：`Login.tsx` 是纯 UI，`handleLogin` 直接 `navigate("/")`，无真实认证。有验证码登录和密码登录两个 Tab。

**改动：**
- 简化为仅保留"手机号 + 密码"登录（移除验证码 Tab，因为 SMS 验证需要额外配置）
- 用户输入手机号后，系统自动转换为 `{phone}@user.aiyou.com` 格式的邮箱调用 `supabase.auth.signInWithPassword`
- 新增注册页面 `Register.tsx`：手机号 + 密码注册，同样用 `{phone}@user.aiyou.com` 格式
- `handle_new_user` 触发器已存在，注册时自动创建 profiles 记录
- 在 `profiles` 表中将 phone 字段填入真实手机号
- Web 端路由守卫：`/` `/knowledge` `/meetings` `/notes` 需要登录，未登录跳转 `/login`
- 管理后台使用 `@admin.com` 后缀，Web 用户使用 `@user.aiyou.com` 后缀，两套体系独立
- 修改 `handle_new_user` 函数，从 `raw_user_meta_data` 中提取 phone 并写入 profiles

## 数据库变更

1. 新建 `messages` 表：`id, conversation_id, role, content, created_at`
2. 为 `conversations` 添加用户自身的 INSERT/SELECT RLS 策略
3. 为 `notes` 添加用户自身的 INSERT/SELECT/UPDATE/DELETE RLS 策略
4. 为 `messages` 添加用户通过 conversation 关联的 RLS 策略
5. 更新 `handle_new_user` 函数以支持 phone 字段

## 文件变更清单

| 操作 | 文件 |
|------|------|
| 编辑 | `src/admin/hooks/useBilling.ts` — 新增 3 个 create mutation |
| 编辑 | `src/admin/pages/PriceConfig.tsx` — 添加新增对话框 |
| 编辑 | `src/admin/pages/OrderList.tsx` — 添加新增对话框 |
| 编辑 | `src/admin/pages/UsageRecords.tsx` — 添加新增对话框 |
| 编辑 | `src/contexts/ChatContext.tsx` — 对接 Supabase 对话持久化 |
| 编辑 | `src/pages/InspirationNotes.tsx` — 对接 notes 表 |
| 编辑 | `src/pages/Login.tsx` — 接入真实认证 |
| 新建 | `src/pages/Register.tsx` — 注册页 |
| 新建 | `src/hooks/useAuth.ts` — Web 端认证 hook |
| 编辑 | `src/App.tsx` — 添加注册路由 + 路由守卫 |
| 新建 | migration — messages 表 + RLS 策略 |
| 数据 | INSERT 6 条 agent 记录 |

