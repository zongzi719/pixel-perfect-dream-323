

# 移动端决策模式开发

## 概述

基于设计稿，在移动端 MobileChat 中实现决策模式功能。用户切换到"决策模式"后，可看到欢迎页（介绍 + 默认教练卡片）、选择教练面板、多教练 AI 对话（带结构化标签如"决策建议"/"风险提示"/"关键问题"），以及教练开关、语音输入、附件等功能。

## 设计稿功能分析

```text
教练模式2.png    → 决策欢迎页：标题 + 4个功能点 + 默认教练卡片 + "开始对话"
教练模式2-1.png  → 发送问题后，Strategy Coach 回复"正在搜索历史资料..."
教练模式2-2.png  → 教练选择面板（底部弹出），最多3个，带头像/描述/勾选
教练模式2-3.png  → 多教练回复：结构化段落（决策建议/关键问题），Risk Coach 带开关toggle
教练模式2-4.png  → 语音输入面板（复用现有 VoicePanel）
教练模式2-5.png  → 语音录制中，已转为文字显示在输入框
教练模式2-6.png  → 消息中附件缩略图（Word/图表文件）
教练模式2-7.png  → 附件选择菜单（知识库/本地文件/微信文件/腾讯文档）
教练模式2-8.png  → 教练 toggle 关闭后显示"后续将不再显示该教练"
```

## 文件变更

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/mobile/pages/MobileChat.tsx` | **修改** | 集成 ModeContext，根据 mode 切换私人/决策视图 |
| `src/mobile/components/chat/MobileDecisionWelcome.tsx` | **新建** | 决策欢迎页：标题+功能点+默认教练卡片+"开始对话" |
| `src/mobile/components/chat/MobileDecisionMessages.tsx` | **新建** | 决策对话消息列表：教练头像+名称+角色标签+结构化内容（决策建议/关键问题/风险提示）+教练开关toggle+操作栏 |
| `src/mobile/components/chat/MobileCoachSelector.tsx` | **新建** | 底部弹出教练选择面板：头像+名称+描述+角色标签+勾选，最多3个 |
| `src/mobile/components/chat/MobileAttachmentPicker.tsx` | **新建** | 附件选择菜单：知识库/本地文件/微信文件/腾讯文档 |

## 功能细节

### 1. 决策欢迎页 (`MobileDecisionWelcome`)
- 深色渐变背景 + 微光效果
- 标题"欢迎来到决策模式" + 副文案"在此模式下，你的商业问题将由多位教练共同分析，帮助您"
- 4个功能点：模拟老板思维、追问关键问题、给出决策建议、纠正潜在决策错误
- 默认教练卡片（Sarah Chen）：头像 + 名称 + "默认教练" + 描述 + "最强大脑"标签 + "我擅长" + 示例回复
- 底部"开始对话"按钮

### 2. 教练选择面板 (`MobileCoachSelector`)
- 右上角教练图标触发，底部 sheet 弹出
- 标题"选择教练" + "最多选择三个教练 (X/3)"
- 教练列表：圆形头像 + 名称 + 描述 + 角色标签（战略/风险/产品/增长/数据）+ 金色勾选圈
- 复用 `coaches` 数据和 `ModeContext.toggleCoach`

### 3. 决策消息渲染 (`MobileDecisionMessages`)
- 用户消息：金色气泡右对齐（复用私人模式样式）
- 教练回复：左对齐，头像 + 名称 + 角色标签 + 开关 toggle
- 结构化内容块：带图标的段落卡片
  - 👁 决策建议（紫色图标）— 深色背景卡片
  - 🔮 关键问题（青色图标）— 深色背景卡片
  - 👾 风险提示（橙/紫色图标）— 深色背景卡片
- 操作栏：复制、收藏、重新生成、分享
- toggle 关闭后半透明 + 提示"后续将不再显示该教练"

### 4. 对话逻辑
- 决策模式发送消息时，按 selectedCoaches 顺序逐个请求 chat edge function，每个教练使用不同 system prompt（角色设定）
- 流式显示每个教练回复，教练回复带 coachId
- "正在搜索历史资料..."加载提示

### 5. 附件选择 (`MobileAttachmentPicker`)
- 点击附件按钮弹出菜单
- 4个选项：知识库、本地文件、微信文件、腾讯文档
- 当前为 UI 占位，功能预留

## 技术要点

- **复用 ModeContext**：mode/selectedCoaches/toggleCoach/disabledCoaches/toggleCoachActive
- **复用 ChatContext**：createConversation('decision', coaches) + addMessage with coachId
- **决策 AI 调用**：每个教练单独调用 streamChat，system prompt 包含教练角色描述
- **结构化解析**：AI 回复中用 markdown heading 区分段落类型（## 决策建议 / ## 关键问题 / ## 风险提示），前端解析渲染为卡片
- **深色主题**：黑色背景 + 白色文字 + 金色/紫色/青色强调色

