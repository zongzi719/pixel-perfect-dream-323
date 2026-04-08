

# 移动端独立模块 + Capacitor 原生打包方案

## 整体架构

项目将拥有三套独立的页面体系，共享同一个后端和核心逻辑：

```text
src/
├── pages/          # Web 端页面（现有）
├── admin/          # 管理后台（现有）
└── mobile/         # 移动端页面（新增）
    ├── MobileApp.tsx          # 移动端路由入口
    ├── layout/
    │   └── MobileLayout.tsx   # 底部 Tab 导航布局
    ├── pages/
    │   ├── MobileLogin.tsx    # 登录页
    │   ├── MobileRegister.tsx # 注册页
    │   ├── MobileChat.tsx     # AI 对话主页
    │   ├── MobileKnowledge.tsx# 知识库
    │   ├── MobileMeetings.tsx # 会议纪要
    │   ├── MobileNotes.tsx    # 灵感笔记
    │   └── MobileProfile.tsx  # 个人中心
    └── components/            # 移动端专用组件
```

路由结构：所有移动端页面挂在 `/m/*` 路径下，App.tsx 新增 `<Route path="/m/*" element={<MobileApp />} />`。

## 分批实施计划

### 第一批：基础框架 + 登录
1. 创建 `src/mobile/` 目录结构和 MobileApp.tsx 路由入口
2. 创建 MobileLayout（底部 Tab 栏：对话、知识库、会议、笔记、我的）
3. 创建移动端登录/注册页面（全屏、大按钮、手机号优先）
4. App.tsx 中挂载 `/m/*` 路由

### 第二批：AI 对话页
5. 移动端对话列表 + 对话详情页（复用 ChatContext）
6. 移动端输入框（底部固定、语音按钮预留）

### 第三批：知识库 + 会议 + 笔记
7. 知识库文件列表和上传（移动端适配）
8. 会议纪要列表和详情
9. 灵感笔记卡片列表和创建

### 第四批：Capacitor 打包
10. 安装 `@capacitor/core`、`@capacitor/cli`、`@capacitor/ios`、`@capacitor/android`
11. 初始化 Capacitor 配置，appId: `app.lovable.9f1d3f08ab6e43c1bfc0d11cfd395ae4`
12. 配置 server URL 指向沙箱预览地址用于开发调试

## 技术要点

- **复用**：共享 `useAuth`、`ChatContext`、`ModeContext`、Supabase client 等，不重复实现业务逻辑
- **UI 独立**：移动端组件全部在 `src/mobile/` 下，使用触摸友好的大按钮、底部导航、全屏布局
- **路由隔离**：Web `/`、Admin `/admin/*`、Mobile `/m/*` 三套路由互不干扰
- **Capacitor 入口**：打包时将默认路由指向 `/m/`，确保 App 打开直接进入移动端页面

## 建议先做第一批

先搭建移动端框架和登录页，确认整体架构和视觉风格后再逐步推进后续页面。

