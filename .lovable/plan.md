

# 移动端私人模式对话功能

## 概述

基于设计稿，将现有占位的 `MobileChat` 替换为完整的私人模式对话页面，包含：欢迎页、AI 流式对话、语音录入、文件附件、会话历史侧边栏、消息操作菜单。复用现有 `ChatContext` 和 `chat` edge function。

## 页面结构分析（来自设计稿）

```text
┌─────────────────────────────┐
│ ☰   [私人模式] [决策模式]  ◇ │  ← 顶部栏
├─────────────────────────────┤
│                             │
│  背景图 + "我是AI YOU"       │  ← 欢迎页（无对话时）
│  "你的分身已经准备用你的方式思考"│
│  试试问我：                  │
│  [帮我生成一个笔记] [测MBTI]  │
│  [换一批 🔄]                │
│  或者随便聊点什么             │
│  ——我都能接得住              │
├─────────────────────────────┤
│ 🔗  [问一问AI YOU  🎤 📷]    │  ← 输入栏
│     [点击录音 🎙]            │  ← 语音面板（可展开）
├─────────────────────────────┤
│ 💬  ⚡  [+]  📁  👤         │  ← 底部 Tab（已有）
└─────────────────────────────┘
```

## 文件变更

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/mobile/pages/MobileChat.tsx` | **重写** | 完整私人模式对话页主容器 |
| `src/mobile/components/chat/MobileChatWelcome.tsx` | **新建** | 欢迎页：背景图 + AI YOU + 建议问题 |
| `src/mobile/components/chat/MobileChatMessages.tsx` | **新建** | 消息列表：用户金色气泡右对齐，AI 深色卡片左对齐，markdown 渲染 |
| `src/mobile/components/chat/MobileChatInput.tsx` | **新建** | 底部输入栏：文字输入 + 发送 + 语音 + 相机 + 附件按钮 |
| `src/mobile/components/chat/MobileVoicePanel.tsx` | **新建** | 语音录制面板：按住录音 + 暂停 + 计时器 + 重录/确认 |
| `src/mobile/components/chat/MobileChatSidebar.tsx` | **新建** | 左侧滑出会话历史：头像+用户名+对齐率，按日期分组的历史列表，搜索 |
| `src/mobile/components/chat/MobileMessageActions.tsx` | **新建** | 消息长按菜单：重命名/加入知识库/继续追问/重新生成/格式转换/分享 |
| `src/mobile/components/chat/MobileAttachmentPicker.tsx` | **新建** | 附件弹出菜单：知识库/本地文件/微信文件/腾讯文档 |
| `src/mobile/layout/MobileLayout.tsx` | **修改** | 底部 Tab 样式更新：中间金色 "+" 按钮突出，图标更新匹配设计稿 |

## 功能细节

### 1. 欢迎页 (`MobileChatWelcome`)
- 背景：极光/雪山图（复用 `mobile-bg.jpg` 或类似深色氛围图，半透明覆盖）
- "我是AI YOU" 大标题 + "你的分身已经准备用你的方式思考" 副标题
- 建议问题列表（pill 标签），点击直接发送
- "换一批" 按钮随机切换建议
- "或者随便聊点什么——我都能接得住" 文案

### 2. 消息渲染 (`MobileChatMessages`)
- 用户消息：金色/琥珀色背景右对齐气泡，白色文字
- AI 消息：深灰/黑色卡片左对齐，白色文字，支持 markdown（ReactMarkdown）
- AI 回复下方操作栏：复制、收藏、重新生成、展开更多操作
- 文件附件卡片（Word 图标 + 文件名 + 日期 + 大小）

### 3. 输入栏 (`MobileChatInput`)
- 圆角深色输入框 "问一问AI YOU"
- 左侧附件按钮（🔗）
- 右侧：麦克风图标（展开语音面板）+ 相机图标
- 输入文字后麦克风变为发送按钮（金色圆形↑）
- 复用现有 `streamChat` 逻辑和 `ChatContext`

### 4. 语音面板 (`MobileVoicePanel`)
- 点击麦克风展开底部面板
- 中心大圆形录音按钮（金色边框）
- 录制中：暂停按钮 + 计时器 (02:32) + 左侧重录 + 右侧确认（✓）
- 录音完成后转为文字输入（语音转文字功能预留，当前将录音作为附件或模拟 STT）

### 5. 会话侧边栏 (`MobileChatSidebar`)
- 左上角 ☰ 图标触发，从左侧滑入
- 顶部：头像 + 用户名 + 对齐率 Lv.X
- 搜索框
- 历史会话按日期分组（2026/03/11 等），显示 last_message 预览
- 点击切换会话，长按可删除

### 6. 消息操作 (`MobileMessageActions`)
- AI 消息下方显示 4 个小图标（复制/收藏/重新生成/更多）
- 点击更多或长按消息弹出菜单：重命名、加入知识库、继续追问、重新生成、格式转换、分享

### 7. 底部 Tab 栏更新
- 匹配设计稿样式：深色背景，中间 "+" 按钮金色突出圆形
- 5 个 Tab：对话（💬）、决策（⚡）、+（新建）、文件夹（📁）、我的（👤）

## 技术要点

- **复用 ChatContext**：`useChat()` 已提供 conversations/messages/streaming 全部能力
- **流式 AI 回复**：直接复用 `ChatInput.tsx` 中已有的 `streamChat` 函数，提取为共享 util
- **深色主题**：所有组件使用黑色/深灰背景 + 白色文字 + 金色强调色（`#C9A84C` / `amber-500`）
- **语音录制**：使用 MediaRecorder API（与 onboarding StepVoice 类似），当前将录音时长显示并模拟转文字
- **无需数据库变更**：完全复用现有 conversations/messages 表

