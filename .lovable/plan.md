

# 首次登录 AI BOSS 模型构建引导流程

## 概述

用户首次登录后，进入一个多步骤引导流程来构建个人 AI BOSS 模型。流程包含 5 个步骤（其中 3-5 待后续补充设计稿），本次先实现前 3 步的 UI 框架。

## 视觉风格

延续现有移动端深色主题：黑色渐变背景（深蓝绿色调），金色/琥珀色作为主要强调色（按钮、进度指示器），白色文字，圆角大按钮。

## 页面流程

```text
登录成功 → 检查是否首次用户 → 是 → /m/onboarding
                                   │
                Step 0: 欢迎页（"开始构建AI BOSS模型"）
                   ↓
                Step 1: 声音采集（朗读文本 + 录音）
                   ↓
                Step 2: 图像采集（上传/拍照 → 生成数字形象）
                   ↓
                Step 3: 深度访谈（待补充）
                   ↓
                Step 4: 构建完成（待补充）
                   ↓
                Step 5: 生成个人形象（待补充）
                   ↓
                → /m/chat
```

## 技术方案

### 1. 数据库变更

在 `profiles` 表新增字段 `onboarding_completed` (boolean, default false)，用于标记用户是否已完成引导流程。

新增表 `user_ai_boss`，存储 AI BOSS 构建数据：
- `user_id` (uuid, FK to auth.users)
- `voice_recording_url` (text, nullable) — 声音录音文件地址
- `avatar_source_url` (text, nullable) — 上传的原始照片
- `avatar_generated_url` (text, nullable) — AI 生成的数字形象
- `interview_data` (jsonb, nullable) — 深度访谈数据
- `status` (text, default 'pending') — 构建状态
- `created_at`, `updated_at`

新增 storage bucket `ai-boss` 用于存储录音和照片。

### 2. 新增页面文件

- `src/mobile/pages/onboarding/MobileOnboarding.tsx` — 引导主容器，管理步骤状态
- `src/mobile/pages/onboarding/StepWelcome.tsx` — Step 0: "AI YOU" + "开始构建AI BOSS模型" + 金色"开始"按钮
- `src/mobile/pages/onboarding/StepVoice.tsx` — Step 1: 声音采集，显示朗读文本卡片，底部录音按钮（麦克风图标），录音中显示暂停/完成按钮和计时器
- `src/mobile/pages/onboarding/StepImage.tsx` — Step 2: 图像采集，中心"+"按钮 + 周围浮动头像装饰，底部弹出"拍照/从相册选择"，上传后显示照片要求提示（正脸、清晰等），生成加载动画 + 进度条，生成完成显示数字形象 + "重新生成/确定"按钮

### 3. UI 细节（参考设计稿）

**通用元素：**
- 顶部步骤指示器：数字 + 标题（如 "❶ 声音采集"），下方 4 个小圆点表示总进度，金色表示已完成/当前
- 背景：深黑色 + 深蓝绿渐变光效（复用 mobile-bg.jpg + overlay）

**Step 0 — 欢迎页：**
- "AI YOU" 金色文字（带轻微发光效果）
- "开始构建AI BOSS模型" 大号白色标题
- "从今天起，拥有另一个自己" 副标题
- 底部金色渐变圆角按钮 "开始"

**Step 1 — 声音采集：**
- 标题区："你每一次说话 / 都在让另一个你变得更聪明。"
- 提示文字："请用自然语气请朗读以下内容：找一个安静的环境"
- 朗读文本卡片（深色半透明背景，白色文字）
- 底部圆形麦克风按钮（金色边框光环），点击后变为暂停按钮 + 计时器 + 左侧重录/右侧确认

**Step 2 — 图像采集：**
- 中心区域：大 "+" 按钮，周围散布模糊的示例头像（纯装饰）
- 点击后底部弹出 action sheet："拍照" / "从相册选择"
- 选择后显示照片要求说明（正脸、清晰可见等 4 个示例缩略图）
- 提交后进入生成页：粒子光环动画 + "AI YOU" + "正在创建您的数字分身" + 3 个进度项（面部特征分析、生成虚拟形象身份、优化视觉风格）+ 进度条
- 生成完成：展示头像（金色圆环边框）+ 昵称 + "重新生成" / "确定" 按钮

### 4. 路由与守卫逻辑

- `MobileApp.tsx` 新增 `/m/onboarding` 路由
- `MobileAuthGuard` 修改：登录后检查 `profiles.onboarding_completed`，若为 false 则跳转 `/m/onboarding`
- 引导完成后更新 `profiles.onboarding_completed = true`，跳转到 `/m/chat`

### 5. 录音功能

使用 Web Audio API + MediaRecorder 实现浏览器端录音，录音完成后上传到 `ai-boss` storage bucket。Capacitor 打包后可替换为原生插件。

### 6. 待后续补充

Step 3（深度访谈）、Step 4（构建完成）、Step 5（生成个人形象）等待用户上传设计稿后再实现。当前这些步骤在代码中预留占位。

