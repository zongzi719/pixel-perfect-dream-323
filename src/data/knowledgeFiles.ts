export interface KnowledgeFolder {
  id: string;
  name: string;
  count: number;
  isEditing?: boolean;
}

export interface KnowledgeFile {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'ppt' | 'image' | 'video' | 'audio';
  folderId: string;
  status: 'summary_ready' | 'draft_completed' | 'under_review';
  statusLabel: string;
  date: string;
  size?: string;
}

export const defaultFolders: KnowledgeFolder[] = [
  { id: 'all', name: '全部文件', count: 37 },
  { id: 'recent', name: '最近', count: 12 },
  { id: 'folder-1', name: '产品文档', count: 8 },
  { id: 'folder-2', name: '会议纪要', count: 15 },
  { id: 'folder-3', name: '市场分析', count: 6 },
  { id: 'folder-4', name: '技术规范', count: 8 },
];

export const mockFiles: KnowledgeFile[] = [
  { id: 'f1', name: '2024年Q4产品规划.pdf', type: 'pdf', folderId: 'folder-1', status: 'summary_ready', statusLabel: 'Summary ready', date: '2024-12-20' },
  { id: 'f2', name: '竞品分析报告.doc', type: 'doc', folderId: 'folder-3', status: 'draft_completed', statusLabel: 'Draft completed', date: '2024-12-19' },
  { id: 'f3', name: '产品路线图演示.ppt', type: 'ppt', folderId: 'folder-1', status: 'under_review', statusLabel: 'Under review', date: '2024-12-18' },
  { id: 'f4', name: '用户调研数据分析.pdf', type: 'pdf', folderId: 'folder-3', status: 'summary_ready', statusLabel: 'Summary ready', date: '2024-12-18' },
  { id: 'f5', name: '技术架构设计文档.doc', type: 'doc', folderId: 'folder-4', status: 'draft_completed', statusLabel: 'Draft completed', date: '2024-12-17' },
  { id: 'f6', name: '周例会纪要1218.pdf', type: 'pdf', folderId: 'folder-2', status: 'summary_ready', statusLabel: 'Summary ready', date: '2024-12-18' },
  { id: 'f7', name: '市场营销方案.ppt', type: 'ppt', folderId: 'folder-3', status: 'under_review', statusLabel: 'Under review', date: '2024-12-16' },
  { id: 'f8', name: 'API接口文档V2.pdf', type: 'pdf', folderId: 'folder-4', status: 'summary_ready', statusLabel: 'Summary ready', date: '2024-12-15' },
];
