

# 诊断与修复 OpenClaw 聊天无回复问题

## 问题分析

从 Edge Function 日志可以看到：
```
connected, session=user_5b2c...
ws closed
```
WebSocket 连接成功后**立即关闭**，没有收到任何消息。说明问题出在 WebSocket 通信层，而非连接层（健康检查是 HTTP，所以测试连接成功）。

可能原因：
1. **ngrok 免费版对 WebSocket 支持有限** — 可能在握手后立即断开
2. **OpenClaw 的 WS 消息格式与代码预期不匹配** — 导致服务端拒绝/关闭连接
3. **Edge Function 中 Deno WebSocket 的 `onmessage` 注册时机问题** — 事件可能在注册前已触发

## 解决方案

在 `supabase/functions/chat/index.ts` 中做两项改进：

### 1. 增加 OpenClaw HTTP REST API 支持（主要修复）

许多 OpenClaw 实例同时提供 REST API（`POST /chat`）。改为使用 HTTP 请求而非 WebSocket，这样可以：
- 完全兼容 ngrok
- 避免 Deno Edge Function 中 WebSocket 的各种限制
- 与现有 SSE 流式输出保持一致

逻辑：先尝试 `POST {base_url}/chat/completions` 或 `POST {base_url}/chat`，如果 OpenClaw 支持 REST 流式输出，则直接透传 SSE。

### 2. 增强调试日志

在 WebSocket 分支中增加详细日志（发送的消息内容、收到的原始事件、关闭原因码），便于后续排查。

### 文件变更

| 文件 | 操作 |
|------|------|
| `supabase/functions/chat/index.ts` | 修改 `handleOpenClaw`，增加 HTTP REST 模式 + 增强日志 |

### 实现细节

```text
openclaw 请求流程：
1. 将 wss:// 转为 https://
2. POST {base_url}/v1/chat/completions （OpenClaw 兼容 OpenAI 格式）
   body: { model, messages, stream: true }
3. 如果返回 SSE 流 → 直接透传给前端
4. 如果返回 JSON → 包装成 SSE 格式返回
5. 如果 REST 失败 → 回退到 WebSocket 方式（保留现有逻辑）
```

这个方案让 OpenClaw 走标准 HTTP 通道，彻底绕开 ngrok + Deno WebSocket 的兼容问题。

