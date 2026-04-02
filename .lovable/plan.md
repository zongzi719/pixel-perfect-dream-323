

# AI Decision OS - Implementation Plan

## Overview
Build an AI-powered dual-mode application: **Private Mode** (personal AI chat with memory) and **Decision Mode** (multi-agent collaborative decision system). The UI follows the uploaded Figma designs closely.

## Architecture

```text
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx              # Left sidebar (search, nav, history)
│   │   └── AppLayout.tsx            # Main layout wrapper
│   ├── chat/
│   │   ├── ChatInput.tsx            # Input box with tools, voice, model selector
│   │   ├── ChatMessage.tsx          # Single message (user or AI)
│   │   ├── ChatArea.tsx             # Scrollable message list
│   │   └── WelcomeScreen.tsx        # Welcome view for private mode
│   ├── decision/
│   │   ├── CoachSelector.tsx        # Coach selection cards grid
│   │   ├── CoachCard.tsx            # Individual coach card
│   │   ├── DecisionWelcome.tsx      # Decision mode welcome + coach picker
│   │   ├── DecisionMessage.tsx      # Coach response with tag, toggle, structured output
│   │   ├── CoachPanel.tsx           # Expandable coach list panel (top-right)
│   │   └── CoachBadge.tsx           # Small coach avatar + name chip
│   └── mode/
│       └── ModeSelector.tsx         # "私人模式" / "决策模式" dropdown
├── contexts/
│   ├── ChatContext.tsx              # Chat state, messages, conversations
│   └── ModeContext.tsx              # Current mode, selected coaches
├── types/
│   └── index.ts                     # Coach, Message, Conversation, Mode types
├── data/
│   └── coaches.ts                   # Predefined coach profiles
├── pages/
│   └── Index.tsx                    # Main page
└── hooks/
    └── useChat.ts                   # Chat logic hook
```

## Implementation Steps

### Step 1: Types, Data, and Layout Shell
- Define TypeScript types: `Coach`, `Message`, `Conversation`, `AppMode`
- Create coach profiles data (Sarah Chen/Strategy, Marcus Johnson/Risk, Yuki Tanaka/Innovation, etc.)
- Build `AppLayout` with left sidebar and main content area
- Build `Sidebar`: search input, nav items (新聊天, 知识库, 会议纪要, 灵感笔记), chat history grouped by date, settings button
- Build `ModeSelector` dropdown at top center

### Step 2: Private Mode (Chat)
- `WelcomeScreen`: avatar, greeting "Hi, MOUMOU~", subtitle, suggestion tags (决策/分析/规划/复盘)
- `ChatInput`: text input with placeholder "咨询任何问题", voice button (waveform icon), + button, tools button, bottom bar with 默认/私有化 toggles and model selector "AIYOU-记忆模型"
- `ChatArea`: scrollable message list with user messages (right-aligned, dark bg) and AI responses (left-aligned, with markdown rendering)
- `ChatContext` for managing conversation state

### Step 3: Decision Mode - Coach Selection
- `DecisionWelcome`: grouped coach avatars at top, "欢迎来到决策模式~" heading, "选取多个视角来引导你的思考" subtitle
- `CoachCard`: avatar, name, skill tags (战略/产品/增长), description, selectable with blue border + checkmark, "默认" badge for default coach
- Selection counter "已选教练 1/3" with selected coach chips
- "开启决策" CTA button (black, rounded)

### Step 4: Decision Mode - Multi-Agent Chat
- `DecisionMessage`: coach avatar + name + colored tag badge (战略=blue, 风险=orange), response text, structured output tags (决策建议, 风险提示, 关键问题, 不同视角) as colored outline badges
- Toggle switch per coach to enable/disable from next round ("下一轮不参与决策" tooltip)
- Disabled coach visual state (grayed toggle)
- Notification bar when coach is removed: "Risk Coach 已停止分析"
- `CoachPanel`: expandable panel (top-right) showing all available coaches with checkmarks, tags, descriptions; "选择教练 - 最多选择三个教练 (3/3)"
- Loading state: "生成中..." with pause button

### Step 5: Chat Input Details
- Shared input component between both modes
- Voice recording button (toggles between waveform and mic icon)
- Bottom toolbar: + (attach), filter/tools icon, "工具" label, right side: 默认/私有化 toggle chips, model dropdown "AIYOU-记忆模型"

### Step 6: Polish and State Management
- Smooth transitions between modes
- Chat history in sidebar updates per conversation
- Responsive sidebar (collapsible via toggle icon)
- Soft gradient background (light blue/lavender tint)
- All text in Chinese as shown in designs

## Visual Design Details
- **Background**: Light lavender/blue gradient (`#f0f0ff` to `#f8f8ff`)
- **Sidebar**: White/transparent, ~220px wide
- **Cards**: White with subtle shadow, rounded corners (12-16px)
- **Selected card**: Light blue border + background tint
- **Tags**: Outlined rounded pills; colors vary by domain (blue for 战略, orange for 风险, green for 产品)
- **User messages**: Dark background (#1a1a2e or similar), white text, right-aligned
- **AI messages**: Left-aligned, no background, with structured colored badges
- **CTA button**: Black, full-width rounded, white text
- **Font**: System Chinese font stack

## Notes
- This initial build will be a **frontend-only UI prototype** with mock data and simulated responses
- AI integration (Lovable AI Gateway) can be added as a follow-up phase
- No authentication or persistence in this phase

