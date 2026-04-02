

# Knowledge Base (知识库) Page Implementation

## What to Build

A full-page knowledge base file management UI based on the 4 uploaded design screenshots. The page includes:

1. **Top bar**: Back arrow + "知识库" title, search input "查找文件", user avatar (right)
2. **Left sidebar**: Navigation (全部文件, 最近), folder list (文件夹) with counts, "新建文件夹" action with inline rename
3. **Main content area**:
   - Folder selector dropdown ("上传到: 全部文件") showing all folders
   - Drag-and-drop upload zone with dashed border, upload icon, text "把文件拖到这里或点击上传", subtitle, file type tags (PDF, DOC, PPT, 图片, 视频, 音频)
   - Empty state: "上传您的第一份文档，即可开始使用人工智能驱动的知识管理。"
   - File list: "最近7天" heading, file count "37 个文件", "管理" link, file cards with icon, name, status badge (Summary ready / Draft completed / Under review), date, "问问 AI" button

## New Files

| File | Purpose |
|------|---------|
| `src/pages/KnowledgeBase.tsx` | Page component |
| `src/components/knowledge/KnowledgeSidebar.tsx` | Left nav with folders |
| `src/components/knowledge/UploadZone.tsx` | Drag-drop upload area |
| `src/components/knowledge/FileList.tsx` | File list with cards |
| `src/components/knowledge/FolderDropdown.tsx` | "上传到" folder picker dropdown |
| `src/data/knowledgeFiles.ts` | Mock file data |

## Modified Files

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/knowledge` route |
| `src/components/layout/Sidebar.tsx` | Navigate to `/knowledge` on 知识库 click |

## Key Design Details

- **Background**: Same light lavender/blue gradient as main app
- **Upload zone**: Dashed light blue border, centered content, rounded corners
- **File cards**: White background, rounded, with colored file-type icons (red for PDF/DOC, orange for PPT), green status badges with checkmark
- **"问问 AI" button**: Blue pill button with chat icon
- **Folder rename**: Inline editable text field with blue highlight (as shown in screenshot 2)
- **Folder dropdown**: White popover listing all folders + "新建文件夹" option

## Technical Notes

- Frontend-only with mock data, no actual file upload logic
- Use `react-router-dom` `useNavigate` for navigation between pages
- File type icons differentiated by color (PDF=red, PPT=orange/coral)
- Status types: `summary_ready`, `draft_completed`, `under_review` with corresponding green text labels

