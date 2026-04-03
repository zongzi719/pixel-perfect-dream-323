

# OpenClaw 集成方案

## 背景

OpenClaw 有两种 API 接口：
- **WebSocket**（默认启用，端口 18789）— 主要控制面，支持 session 管理、记忆、多 agent
- **`/v1/chat/completions`**（默认禁用）— OpenAI 兼容的 REST 端点

当前 Edge Function 只支持 REST 调用。

## 方案：双通道支持

保留 `openclaw` 类型，但改为在 Edge Function 中通过 **WebSocket** 连接 OpenClaw，同时保留 `openai_compatible` 通道不变。

### 1. Edge Function 改造（`supabase/functions/chat/index.ts`）

当 `provider_type === 'openclaw'` 时，走 WebSocket 流程：

```text
收到请求 → 查 DB 获取模型配置
  ├─ provider_type = openai_compatible → 现有 REST 逻辑不变
  └─ provider_type = openclaw →
       1. 建立 WebSocket 连接到 base_url (ws://host:18789)
       2. 发送 connect 握手（带 token 认证）
       3. 发送 chat 消息（用 user_id 作为 session key，实现用户独立记忆）
       4. 接收流式响应，转换为 SSE 格式返回前端
       5. 关闭 WebSocket
```

Deno 原生支持 WebSocket，无需额外依赖。

Edge Function 仍然对前端返回 SSE（`text/event-stream`），前端代码**无需修改**。

### 2. 数据库（`llm_models` 表）

无需改动。已有 `provider_type` 字段，值为 `openclaw` 或 `openai_compatible`，加上 `base_url` 和 `api_key` 足够区分。

### 3. 管理后台（`LLMConfig.tsx`）

已有 OpenClaw 类型选项，小幅调整：
- OpenClaw 服务地址 placeholder 改为 `ws://your-server:18789` 或 `ws://localhost:18789`
- 测试连接按钮改为用 HTTP health check（`GET /health`）代替当前不存在的 REST 端点
- 添加提示：本地连接填 `ws://host.docker.internal:18789`（Docker 环境）或 `ws://localhost:18789`（直接运行）

### 4. 文件变更清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `supabase/functions/chat/index.ts` | 修改 | 增加 OpenClaw WebSocket 调用分支，将 WS 响应转为 SSE |
| `src/admin/pages/LLMConfig.tsx` | 修改 | 更新 placeholder 和测试连接逻辑 |

### 5. 适用场景

| 场景 | 配置 |
|------|------|
| 线上 Lovable 环境 | `openai_compatible`，用 Lovable AI 网关 |
| 本地 + 远程 OpenClaw | `openclaw`，`ws://remote-server:18789` |
| 本地 + 本地 OpenClaw | `openclaw`，`ws://host.docker.internal:18789`（Docker）或 `ws://localhost:18789` |
| 本地 + Ollama | `openai_compatible`，`http://host.docker.internal:11434/v1` |

