
问题基本已经定位，不是你“公网地址没配上”，而是当前实现对 OpenClaw 的调用方式很容易让前端看起来一直卡住。

1. 根因判断
- `supabase/functions/chat/index.ts` 里，OpenClaw 分支不是流式转发，而是先 `await response.json()` 等 OpenClaw 整个回答结束后，才一次性伪装成 SSE 返回。
- 如果你的公网 OpenClaw 响应慢、首字时间长，前端就会一直没有任何 token，表现成“卡住”。
- `src/components/chat/ChatInput.tsx` 里调用函数时，`Authorization` 发的是 `VITE_SUPABASE_PUBLISHABLE_KEY`，不是当前登录用户的 access token。
- 这样后端里 JWT 解析出来通常不是实际用户，OpenClaw session key 会退化成固定值/匿名值，容易造成会话异常、共享上下文或不可预期卡顿。

2. 我会怎么改
- 修正前端鉴权：
  - 在 `ChatInput.tsx` 里改成读取当前登录会话 token，再放进 `Authorization: Bearer <access_token>`。
  - 保证后端能拿到真实用户身份。
- 修正 OpenClaw 调用链：
  - 后端不要再等完整 JSON 后再返回。
  - 增加超时控制、错误细化、连接失败提示，把“卡住”变成明确错误。
  - 如果 OpenClaw 仍然只返回整包 JSON，也要在前端增加“连接中/思考中”状态和超时兜底，避免无反馈。
- 增强可观测性：
  - 在 `chat` function 中记录 providerType、目标 base_url、响应状态码、超时/解析失败原因。
  - 便于你后续区分是公网连通、Token、还是 OpenClaw 本身处理慢。
- 管理后台补一个“连通性测试”能力：
  - 在 `LLMConfig.tsx` 增加测试按钮。
  - 保存前或保存后直接验证 Base URL + Token 是否可达，并显示明确结果。
  - 这样以后改模型地址时不用到聊天页盲测。

3. 具体实施步骤
- Step 1: 审查并修正 `ChatInput.tsx` 的请求头，改为发送真实用户 token。
- Step 2: 重构 `supabase/functions/chat/index.ts` 的 OpenClaw 分支：
  - 加 fetch 超时
  - 明确区分 401/403/404/502/超时
  - 避免“无输出长等待”
- Step 3: 前端补充流式等待态和超时提示：
  - 一段时间没有首包就提示“模型响应较慢/正在连接”
  - 请求失败时直接展示可读中文原因
- Step 4: 在后台 LLM 配置页增加“测试连接”按钮与结果提示。
- Step 5: 联调验证两种模型：
  - Lovable AI 默认模型正常
  - `零码-openclaw-1` 公网模型正常
  - 切换模型后都能返回结果，不再无反馈卡住

4. 预期结果
- 如果是公网 OpenClaw 本身慢，界面会显示“正在连接/思考中”，而不是假死。
- 如果是 Token 或地址错误，会直接报出可读原因。
- 如果模型可用，消息会正常返回，不再长期卡住。
- 后台能先测通再使用，排查效率会高很多。

5. 技术细节
```text
当前链路
前端 -> chat function -> 等 OpenClaw 全部算完 -> 再一次性回前端
问题：首包慢时，用户看到的就是“卡住”

调整后
前端 -> chat function(带超时/明确错误) -> OpenClaw
      -> 前端显示连接状态/超时提示
结果：即使慢，也不会无反馈
```

需要注意的现状：
- 现在的 OpenClaw 不是“真正逐 token 流式”，所以即使修完，也更像“有清晰加载状态 + 返回整包结果”，不会像原生流式模型那样一个字一个字冒出来。
- 若后续你想做到真正流式，需要确认 OpenClaw 服务端本身是否支持 SSE/流式输出，再决定是否继续改造。
