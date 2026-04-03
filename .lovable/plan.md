

# 修改 Edge Function 支持本地运行

## 问题

当前 `supabase/functions/chat/index.ts` 有两个问题导致本地无法使用：

1. **默认依赖 `LOVABLE_API_KEY`**：本地 Supabase 没有这个密钥，如果用户没传 `model_id`，会直接报错
2. **`openclaw` 类型不可用**：OpenClaw 是 WebSocket 协议，现有 REST 调用方式不兼容

## 修改内容

### 修改文件：`supabase/functions/chat/index.ts`

1. **删除 `handleOpenClaw` 函数**（约 60 行）— 该函数调用的 REST 端点不存在
2. **删除 `openclaw` 路由分支** — 不再特殊处理 openclaw 类型
3. **改进默认逻辑**：当没有 `LOVABLE_API_KEY` 且没有传 `model_id` 时，自动查找数据库中第一个启用的模型作为 fallback，而不是直接报错
4. **统一走 `openai_compatible` 路径** — 所有模型（包括 Ollama）都用 `/chat/completions` 接口

### 逻辑流程（改后）

```text
收到请求
  ├─ 有 model_id → 从 DB 查模型配置
  ├─ 无 model_id + 有 LOVABLE_API_KEY → 用 Lovable AI 网关（线上）
  └─ 无 model_id + 无 LOVABLE_API_KEY → 从 DB 查第一个启用的模型（本地）
      └─ 都没有 → 返回错误提示"请先在后台配置模型"
所有模型统一调用 POST {baseUrl}/chat/completions
```

## 本地使用方式

用户在本地管理后台添加 Ollama 模型（类型选 `openai_compatible`，Base URL 填 `http://host.docker.internal:11434/v1`），即可正常聊天。

> 注意：因为 Edge Function 运行在 Docker 容器中，访问宿主机的 Ollama 需要用 `host.docker.internal` 而不是 `localhost`。

## 不影响的内容

- 线上环境：有 `LOVABLE_API_KEY`，行为不变
- 前端代码：无需修改
- 数据库：无需修改

