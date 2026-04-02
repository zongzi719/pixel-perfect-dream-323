# 实施方案

## 问题 1：Web 端 Mock 数据排查

以下模块仍在使用硬编码 mock 数据：


| 模块       | 文件                                      | Mock 来源                                                | 状态       |
| -------- | --------------------------------------- | ------------------------------------------------------ | -------- |
| 知识库      | `src/pages/KnowledgeBase.tsx`           | `mockFiles`, `defaultFolders` from `knowledgeFiles.ts` | 需替换      |
| 会议纪要     | `src/pages/MeetingMinutes.tsx`          | `mockMeetings`, `meetingFolders` from `meetingData.ts` | 需替换      |
| 聊天回复     | `src/components/chat/ChatInput.tsx`     | `mockResponses` 硬编码回复                                  | 需替换      |
| 欢迎页      | `src/components/chat/WelcomeScreen.tsx` | 硬编码用户名 "MOUMOU"                                        | 需改为动态    |
| Coach 数据 | `src/data/coaches.ts`                   | 前端硬编码，DB 已有 agents 数据                                  | 可从 DB 读取 |


**灵感笔记已接通数据库，无需改动。**

### 改动方案

**知识库** — 新建 `knowledge_files` 和 `knowledge_folders` 两张表 + RLS，`KnowledgeBase.tsx` 从数据库读取文件/文件夹列表，上传文件存到 Storage bucket。

**会议纪要** — 新建 `meetings` 表（含 transcript/aiSummary JSON 字段）+ RLS，`MeetingMinutes.tsx` 从数据库读取。

**聊天回复** — `ChatInput.tsx` 中的 `mockResponses` 和 `setTimeout` 模拟回复暂保留（因为 AI 回复需要接入真实 AI 服务，目前还没有配置），现在改为使用真实AI，在管理后台可以配置AI的key和url等，默认用lovable自带的AI对话。

**欢迎页** — 从 `useAuth` 获取用户 profile，显示真实用户名。

**Coach 数据** — `coaches.ts` 保留作为前端配色/UI 映射，Agent 列表可从 DB 补充读取。

---

## 问题 2：聊天发送后不跳转到对话详情（Bug 修复）

### 根因

`ChatInput.handleSend()` 中：

1. 调用 `createConversation()` — 内部 `setCurrentId(conv.id)` 是异步的 React state 更新
2. 紧接着调用 `addMessage()` — 此时 `currentId` 闭包仍是 `null`
3. `addMessage` 用 `currentId` 匹配对话进行 `map`，找不到匹配，消息丢失
4. `AppLayout` 中 `showWelcome` 判断 `currentConversation.messages.length === 0` 仍为 true，所以停留在欢迎页

### 修复方案

修改 `createConversation` 返回新对话的 `id`，`ChatInput.handleSend()` 拿到 id 后直接将消息追加到该对话中，不依赖异步 state。

具体改动：

`**src/contexts/ChatContext.tsx**`：

- `createConversation` 返回 `string`（新对话 id）
- `addMessage` 增加可选参数 `targetConvId?: string`，优先使用该参数而非 `currentId`

`**src/components/chat/ChatInput.tsx**`：

- `handleSend` 中：`const convId = currentConversation?.id ?? createConversation(...)` 
- `addMessage` 调用时传入 `convId`

## 文件变更清单


| 操作  | 文件                                                                     |
| --- | ---------------------------------------------------------------------- |
| 编辑  | `src/contexts/ChatContext.tsx` — 修复 createConversation/addMessage 竞态   |
| 编辑  | `src/components/chat/ChatInput.tsx` — 使用返回的 convId                     |
| 编辑  | `src/components/chat/WelcomeScreen.tsx` — 显示真实用户名                      |
| 新建  | migration — `knowledge_files`, `knowledge_folders`, `meetings` 表 + RLS |
| 编辑  | `src/pages/KnowledgeBase.tsx` — 从数据库读取                                 |
| 编辑  | `src/pages/MeetingMinutes.tsx` — 从数据库读取                                |
