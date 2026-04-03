

# 对话记录持久化到数据库

## 现状

当前 `ChatContext` 使用纯 React state 存储对话，刷新页面即丢失。数据库已有 `conversations` 和 `messages` 表并配好了 RLS（用户只能看到自己的数据），但前端没有使用。

## 方案

### 1. 重构 ChatContext — 接入数据库

**核心改动**：`src/contexts/ChatContext.tsx`

- **初始化时**：用 `useAuth` 获取 `user`，登录后从 `conversations` 表加载该用户的对话列表（按 `updated_at` 降序），从 `messages` 表加载当前对话的消息
- **createConversation**：插入 `conversations` 表（`user_id = auth.uid()`），返回数据库生成的 UUID
- **addMessage**：插入 `messages` 表（`conversation_id`, `role`, `content`, `coach_id`），同时更新 `conversations` 表的 `last_message`、`message_count`、`updated_at`
- **updateLastAssistantMessage**：流式完成后，UPDATE 该消息的 `content`（需要给 messages 表加 UPDATE RLS 策略）
- **切换对话**：`setCurrentConversation` 时按需加载该对话的 messages

### 2. 数据库补充

**Migration**：
- 给 `messages` 表添加 UPDATE 策略，允许用户更新自己对话中的消息（流式写入需要）
- 给 `conversations` 表添加 DELETE 策略（用户删除自己的对话）

### 3. ChatInput 适配

**编辑** `src/components/chat/ChatInput.tsx`：
- `createConversation` 改为 async（需等待数据库插入返回 ID）
- `addMessage` 改为 async
- 流式结束后调用 `finalizeMessage` 将完整内容写入数据库

### 4. Sidebar 适配

**编辑** `src/components/layout/Sidebar.tsx`：
- 对话列表直接从 ChatContext 读取（已接数据库），无需改动接口，但日期分组用 `createdAt` 需确保是 Date 对象

## 文件变更清单

| 操作 | 文件 |
|------|------|
| 新建 | migration — messages UPDATE 策略 + conversations DELETE 策略 |
| 重写 | `src/contexts/ChatContext.tsx` — 接入 Supabase 持久化 |
| 编辑 | `src/components/chat/ChatInput.tsx` — 适配 async 操作 |
| 编辑 | `src/types/index.ts` — Conversation.id 改为 string (UUID) |

