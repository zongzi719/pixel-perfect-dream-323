

# 修复"测试连接"功能：改为服务端代理

## 问题原因

当前"测试连接"按钮从**浏览器端**直接发起 `fetch` 请求到 ngrok 地址。这会失败，因为：
1. 浏览器的 CORS 策略阻止跨域请求（ngrok 不返回正确的 CORS 头）
2. 线上预览是 HTTPS，访问 HTTP 地址会被浏览器的混合内容策略拦截

## 解决方案

将测试连接请求改为通过 **Edge Function 代理**执行，而不是从浏览器直接调用。

### 1. 新建 Edge Function：`supabase/functions/test-connection/index.ts`

接收 `{ base_url, api_key, provider_type }` 参数，在服务端发起健康检查：
- `openclaw` 类型：`GET {base_url}/health`
- `openai_compatible` 类型：`GET {base_url}/models`

返回结果：`{ ok: true/false, status, message }`

### 2. 修改 `src/admin/pages/LLMConfig.tsx`

将测试连接按钮的逻辑从直接 `fetch` 改为调用 `supabase.functions.invoke('test-connection', { body: { base_url, api_key, provider_type } })`。

### 文件变更

| 文件 | 操作 |
|------|------|
| `supabase/functions/test-connection/index.ts` | 新建 |
| `src/admin/pages/LLMConfig.tsx` | 修改测试连接逻辑 |

