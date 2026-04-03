

# 接入 OpenClaw 对话记忆方案

## 背景

OpenClaw 是自托管 AI Agent，核心优势是**内置记忆系统**（短期 + 长期记忆），API 格式与 OpenAI 不同：
- 端点：`POST /api/sessions/:sessionKey/messages`
- 请求体：`{"message": "..."}`（不需要发送历史消息，OpenClaw 自己记住）
- 认证：`Authorization: Bearer <token>`
- 每个 session 独立记忆

## 方案设计

```text
用户发消息 → Edge Function → 检查 provider
                              ├─ OpenAI/Google 等 → /chat/completions (现有逻辑)
                              └─ OpenClaw        → /api/sessions/{userId}/messages
                                                    (OpenClaw 自带记忆，无需传历史)
```

### 1. 数据库：`llm_models` 表增加 `provider_type` 字段

新增 migration，添加 `provider_type` 列：
- `openai_compatible`（默认，当前所有模型）
- `openclaw`（新增）

这样 edge function 可以根据 `provider_type` 走不同的调用逻辑。

### 2. 管理后台：LLM 配置页支持 OpenClaw

**编辑 `LLMConfig.tsx`**：
- 供应商下拉新增 "OpenClaw" 选项
- 当选择 OpenClaw 时：
  - `Base URL` 提示填写 OpenClaw 网关地址（如 `http://your-server:18789`）
  - `API Key` 填写 OpenClaw Bearer Token
  - 隐藏 `model_name`（OpenClaw 不需要）、`context_window` 等无关字段
  - 新增提示："OpenClaw 自带对话记忆，每个用户独立 session"

### 3. Edge Function：支持 OpenClaw 路由

**编辑 `supabase/functions/chat/index.ts`**：

当 `provider_type === 'openclaw'` 时：
- 从 JWT 中提取 `user_id` 作为 session key（`user-{userId}`），确保每个用户独立记忆
- 调用 `POST {base_url}/api/sessions/user-{userId}/messages`
- 请求体：`{"message": "用户消息内容"}`
- OpenClaw 返回的响应格式不同，需要适配解析
- 将 OpenClaw 的响应转换为 SSE 流式格式返回给前端（保持前端不变）

当 `provider_type === 'openai_compatible'`（或空）时：走现有 `/chat/completions` 逻辑不变。

### 4. 前端 ChatInput：无需大改

- 前端选择模型时，无论是 OpenClaw 还是普通 LLM，都发同样的请求到 edge function
- Edge function 内部判断路由，前端透明
- 唯一区别：OpenClaw 模式下**不需要发送历史消息**，只发当前消息即可（edge function 内部处理）

### 5. 记忆管理（可选增强）

管理后台「记忆管理」页面可增加：
- 查看 OpenClaw session 列表
- 清除某用户的 OpenClaw 记忆（调用 `DELETE /api/sessions/:key`）

此部分作为后续增强，首期不实现。

## 文件变更清单

| 操作 | 文件 |
|------|------|
| 新建 | migration — `llm_models` 增加 `provider_type` 列 |
| 编辑 | `supabase/functions/chat/index.ts` — 增加 OpenClaw 路由逻辑 |
| 编辑 | `src/admin/pages/LLMConfig.tsx` — 供应商增加 OpenClaw，条件显示字段 |
| 编辑 | `src/admin/hooks/useLLMModels.ts` — 类型增加 `provider_type` |
| 编辑 | `src/hooks/useLLMModelsPublic.ts` — 类型同步 |

## 使用流程

1. 管理员在 LLM 配置页添加模型，供应商选 "OpenClaw"
2. 填入 OpenClaw 服务地址和 Token
3. 前端用户选择该模型后发消息
4. Edge function 自动以用户 ID 为 session key 调用 OpenClaw
5. OpenClaw 记住每个用户的对话历史，实现跨会话记忆

