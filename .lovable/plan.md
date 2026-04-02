

# 管理后台实施方案

## 概述
创建完全独立的管理后台子应用，路由前缀 `/admin`，拥有独立登录页、独立布局（shadcn Sidebar）、黑白主色调。一次性搭建全部 7 个模块的页面框架（含 Mock 数据）。

## 架构

```text
/admin/login          → 管理后台登录页
/admin                → Dashboard（数据统计）
/admin/users          → 用户列表
/admin/users/:id      → 用户详情（Tab）
/admin/roles          → 角色列表
/admin/permissions    → 权限配置
/admin/admins         → 管理员管理
/admin/agents         → Agent列表
/admin/agents/new     → 创建Agent
/admin/content        → 对话记录列表
/admin/content/:id    → 内容详情
/admin/notes-manage   → 笔记内容管理
/admin/billing/prices → 价格配置
/admin/billing/plans  → 套餐管理
/admin/billing/orders → 订单列表
/admin/billing/usage  → 消费记录
/admin/memory         → 用户记忆管理
```

## 新建文件清单

### 布局 & 通用
| 文件 | 说明 |
|------|------|
| `src/admin/AdminApp.tsx` | 管理后台入口，包含 AdminLayout + 子路由 |
| `src/admin/layout/AdminLayout.tsx` | shadcn SidebarProvider + 主内容区 |
| `src/admin/layout/AdminSidebar.tsx` | 侧边栏导航（黑色背景、白色文字、分组菜单） |
| `src/admin/layout/AdminHeader.tsx` | 顶栏（面包屑、用户头像、退出） |

### 登录
| 文件 | 说明 |
|------|------|
| `src/admin/pages/AdminLogin.tsx` | 独立登录页，黑白风格，账号密码登录 |

### 数据统计（P1）
| 文件 | 说明 |
|------|------|
| `src/admin/pages/Dashboard.tsx` | 概览卡片 + 图表（用户增长、Token消耗、收入、功能使用率） |

### 用户管理
| 文件 | 说明 |
|------|------|
| `src/admin/pages/UserList.tsx` | 表格 + 搜索筛选 + 封禁操作 |
| `src/admin/pages/UserDetail.tsx` | Tab结构（基本信息/行为/消耗/Token统计） |

### 权限系统
| 文件 | 说明 |
|------|------|
| `src/admin/pages/RoleList.tsx` | 角色列表 + CRUD |
| `src/admin/pages/Permissions.tsx` | 权限树配置（页面级/操作级） |
| `src/admin/pages/AdminManage.tsx` | 管理员列表 + 角色绑定 |

### Agent管理
| 文件 | 说明 |
|------|------|
| `src/admin/pages/AgentList.tsx` | Agent卡片/表格列表 + 启用/禁用 |
| `src/admin/pages/AgentCreate.tsx` | 创建/编辑表单（名称/头像/设定/视角/标签） |

### 内容管理
| 文件 | 说明 |
|------|------|
| `src/admin/pages/ContentList.tsx` | 对话记录列表 + 违规标记 |
| `src/admin/pages/ContentDetail.tsx` | 对话详情 + 审计操作 |
| `src/admin/pages/NotesManage.tsx` | 笔记内容管理列表 |

### 计费系统
| 文件 | 说明 |
|------|------|
| `src/admin/pages/PriceConfig.tsx` | Token价格配置（输入/输出/语音） |
| `src/admin/pages/PlanManage.tsx` | 套餐管理（订阅/次卡 CRUD） |
| `src/admin/pages/OrderList.tsx` | 订单列表 |
| `src/admin/pages/UsageRecords.tsx` | 消费流水 |

### 用户记忆
| 文件 | 说明 |
|------|------|
| `src/admin/pages/MemoryManage.tsx` | 记忆配置/绑定/检索规则 |

### Mock数据
| 文件 | 说明 |
|------|------|
| `src/admin/data/mockData.ts` | 所有模块的 Mock 数据 |

## 修改文件

| 文件 | 变更 |
|------|------|
| `src/App.tsx` | 添加 `/admin/*` 路由指向 AdminApp |
| `src/index.css` | 追加管理后台暗色主题 CSS 变量（`.admin` class 作用域） |

## 设计规范

- **主色调**：黑白为主，侧边栏深色（`#0a0a0a`），内容区白/浅灰
- **强调色**：使用现有 primary 蓝色做按钮/链接高亮
- **组件**：全部使用 shadcn/ui（Table, Card, Dialog, Tabs, Form, Badge, Button 等）
- **侧边栏**：使用 shadcn Sidebar 组件，`collapsible="icon"` 模式
- **图表**：使用 recharts（shadcn chart 组件封装）

## 技术要点

- 管理后台登录为纯前端 Mock（点击后存 `adminAuthenticated` 到 state，跳转 `/admin`）
- 所有页面使用 Mock 数据填充，数据结构预留后端接入字段
- AdminLayout 包裹所有 `/admin/*` 子路由，AdminLogin 单独不使用 Layout
- 侧边栏分组：数据总览 / 用户管理 / 内容管理 / Agent管理 / 计费系统 / 记忆管理 / 系统设置

