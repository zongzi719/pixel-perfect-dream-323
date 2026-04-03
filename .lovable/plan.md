

# LLM 模型配置 + 前端模型选择 + 输入框交互增强

## 概述

根据截图参考，实现五个功能：
1. 管理后台新增「LLM 模型配置」页面（CRUD 模型、设默认、启用/停用）
2. 前端聊天输入框底部的模型下拉选择器，从数据库读取可用模型
3. 模型标签（如"默认""私有化"）由后台配置驱动
4. "+"按钮点击展开下拉菜单（上传照片或文件、知识库）
5. "工具"按钮点击展开下拉菜单（红蓝军对抗、联网搜索）

## 数据库变更

新建 `llm_models` 表：

```sql
CREATE TABLE public.llm_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL,          -- 模型标识，如 gpt-4o
  display_name TEXT NOT NULL,        -- 展示名称，如 GPT-4o 高速版
  provider TEXT NOT NULL DEFAULT 'OpenAI',  -- 供应商
  base_url TEXT NOT NULL DEFAULT 'https://api.openai.com/v1',
  api_key TEXT,                      -- 存储在表中（管理员可见）
  input_price NUMERIC DEFAULT 1,     -- 输入积分单价
  output_price NUMERIC DEFAULT 2,    -- 输出积分单价
  context_window INTEGER DEFAULT 128000,
  enabled BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,      -- 排序权重
  tags TEXT[] DEFAULT '{}',          -- 标签，如 {"默认","私有化"}
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

RLS：仅管理员可 CRUD，认证用户可 SELECT enabled 模型。

## 管理后台：LLM 模型配置页

**新建文件**：`src/admin/pages/LLMConfig.tsx`

参考截图设计：
- 表格列：模型（display_name + model_name）、供应商、Base URL、输入单价、输出单价、上下文、状态、操作（编辑/设默认/删除）
- 默认模型显示绿色"默认"标签
- "+ 添加模型"按钮打开 Dialog，字段：供应商(select)、排序权重、模型标识、展示名称、API Key、Base URL、输入/输出积分单价、上下文窗口、设为默认、标签
- 编辑复用同一 Dialog

**新建文件**：`src/admin/hooks/useLLMModels.ts` — useQuery + useMutation hooks

**修改**：`AdminSidebar.tsx` 添加「LLM 模型」菜单项；`AdminApp.tsx` 添加路由

## 前端：模型选择下拉

**修改** `ChatInput.tsx`：
- 查询 `llm_models` 表获取 enabled 模型列表
- 底部右侧的"AIYOU-记忆模型"替换为 Popover/DropdownMenu，显示当前选中模型名称 + ChevronDown
- 点击展开模型列表，选择后切换
- 模型的 `tags` 数组渲染为标签 chips（替换当前硬编码的"默认""私有化"）
- 发送消息时将 `model` 字段传给 chat edge function

**修改** `supabase/functions/chat/index.ts`：
- 接收 `model` 和 `base_url`/`api_key` 参数
- 如果指定了自定义 base_url + api_key，则调用该地址；否则使用 Lovable AI Gateway
- 需要从数据库查询模型配置（使用 SUPABASE_SERVICE_ROLE_KEY 创建 admin client）

## 前端："+" 按钮下拉

**修改** `ChatInput.tsx`：
- 点击"+"显示 Popover，包含两个选项：
  - 📎 上传照片或文件
  - 📊 知识库
- 上传照片：打开文件选择器
- 知识库：导航到 /knowledge 或打开侧边栏

## 前端："工具" 按钮下拉

**修改** `ChatInput.tsx`：
- 点击"工具"显示 Popover，包含两个选项：
  - 🏰 红蓝军对抗
  - 🌐 联网搜索
- 当前为 UI 占位，点击显示 toast 提示"功能开发中"

## 文件变更清单

| 操作 | 文件 |
|------|------|
| 新建 | migration — `llm_models` 表 + RLS |
| 新建 | `src/admin/pages/LLMConfig.tsx` |
| 新建 | `src/admin/hooks/useLLMModels.ts` |
| 编辑 | `src/admin/layout/AdminSidebar.tsx` — 添加菜单项 |
| 编辑 | `src/admin/AdminApp.tsx` — 添加路由 |
| 编辑 | `src/components/chat/ChatInput.tsx` — 模型选择、+下拉、工具下拉 |
| 编辑 | `supabase/functions/chat/index.ts` — 支持动态模型配置 |

