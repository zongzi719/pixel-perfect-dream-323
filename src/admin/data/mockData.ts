// ===== 用户管理 =====
export interface MockUser {
  id: string;
  username: string;
  phone: string;
  email: string;
  avatar: string;
  status: 'active' | 'banned';
  tokenUsed: number;
  tokenBalance: number;
  createdAt: string;
  lastLogin: string;
}

export const mockUsers: MockUser[] = [
  { id: 'u001', username: '张三', phone: '138****1234', email: 'zhangsan@example.com', avatar: 'ZS', status: 'active', tokenUsed: 12500, tokenBalance: 7500, createdAt: '2025-01-15', lastLogin: '2026-04-01' },
  { id: 'u002', username: '李四', phone: '139****5678', email: 'lisi@example.com', avatar: 'LS', status: 'active', tokenUsed: 8200, tokenBalance: 1800, createdAt: '2025-02-20', lastLogin: '2026-03-30' },
  { id: 'u003', username: '王五', phone: '137****9012', email: 'wangwu@example.com', avatar: 'WW', status: 'banned', tokenUsed: 45000, tokenBalance: 0, createdAt: '2025-03-10', lastLogin: '2026-03-15' },
  { id: 'u004', username: '赵六', phone: '136****3456', email: 'zhaoliu@example.com', avatar: 'ZL', status: 'active', tokenUsed: 3100, tokenBalance: 16900, createdAt: '2025-04-05', lastLogin: '2026-04-02' },
  { id: 'u005', username: '孙七', phone: '135****7890', email: 'sunqi@example.com', avatar: 'SQ', status: 'active', tokenUsed: 21000, tokenBalance: 4000, createdAt: '2025-05-12', lastLogin: '2026-03-28' },
  { id: 'u006', username: '周八', phone: '134****2345', email: 'zhouba@example.com', avatar: 'ZB', status: 'active', tokenUsed: 6700, tokenBalance: 13300, createdAt: '2025-06-18', lastLogin: '2026-04-01' },
];

// ===== 角色与权限 =====
export interface MockRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  memberCount: number;
  createdAt: string;
}

export const mockRoles: MockRole[] = [
  { id: 'r001', name: '超级管理员', description: '拥有系统所有权限', permissions: ['all'], memberCount: 2, createdAt: '2025-01-01' },
  { id: 'r002', name: '运营', description: '负责内容审核和用户管理', permissions: ['user:view', 'user:ban', 'content:view', 'content:audit', 'notes:view'], memberCount: 5, createdAt: '2025-01-10' },
];

export interface PermissionGroup {
  module: string;
  permissions: { key: string; label: string; description: string }[];
}

export const permissionGroups: PermissionGroup[] = [
  { module: '用户管理', permissions: [
    { key: 'user:view', label: '查看用户', description: '查看用户列表和详情' },
    { key: 'user:edit', label: '编辑用户', description: '修改用户信息' },
    { key: 'user:ban', label: '封禁用户', description: '封禁/解封用户' },
  ]},
  { module: '内容管理', permissions: [
    { key: 'content:view', label: '查看内容', description: '查看对话记录' },
    { key: 'content:audit', label: '审计内容', description: '标记违规/删除内容' },
  ]},
  { module: 'Agent管理', permissions: [
    { key: 'agent:view', label: '查看Agent', description: '查看Agent列表' },
    { key: 'agent:edit', label: '编辑Agent', description: '创建/修改Agent' },
    { key: 'agent:toggle', label: '启禁Agent', description: '启用/禁用Agent' },
  ]},
  { module: '计费系统', permissions: [
    { key: 'billing:view', label: '查看计费', description: '查看价格和订单' },
    { key: 'billing:edit', label: '编辑计费', description: '修改价格和套餐' },
  ]},
  { module: '记忆管理', permissions: [
    { key: 'memory:view', label: '查看记忆', description: '查看用户记忆' },
    { key: 'memory:edit', label: '编辑记忆', description: '修改记忆配置' },
  ]},
  { module: '系统设置', permissions: [
    { key: 'system:roles', label: '角色管理', description: '管理角色和权限' },
    { key: 'system:admins', label: '管理员管理', description: '管理后台管理员' },
  ]},
];

export interface MockAdmin {
  id: string;
  username: string;
  email: string;
  role: string;
  status: 'active' | 'disabled';
  lastLogin: string;
  createdAt: string;
}

export const mockAdmins: MockAdmin[] = [
  { id: 'a001', username: '管理员A', email: 'admin@aiyou.com', role: '超级管理员', status: 'active', lastLogin: '2026-04-02', createdAt: '2025-01-01' },
  { id: 'a002', username: '运营小王', email: 'wang@aiyou.com', role: '运营', status: 'active', lastLogin: '2026-04-01', createdAt: '2025-02-15' },
  { id: 'a003', username: '运营小李', email: 'li@aiyou.com', role: '运营', status: 'active', lastLogin: '2026-03-30', createdAt: '2025-03-20' },
];

// ===== Agent管理 =====
export interface MockAgent {
  id: string;
  name: string;
  nameEn: string;
  avatar: string;
  perspective: string;
  tags: string[];
  description: string;
  systemPrompt: string;
  enabled: boolean;
  usageCount: number;
  createdAt: string;
}

export const mockAgents: MockAgent[] = [
  { id: 'ag001', name: '战略顾问', nameEn: 'Strategy Advisor', avatar: '🎯', perspective: '战略', tags: ['战略', '规划', '商业模式'], description: '从战略视角分析问题，提供宏观建议', systemPrompt: '你是一位资深战略顾问...', enabled: true, usageCount: 3200, createdAt: '2025-01-15' },
  { id: 'ag002', name: '风险分析师', nameEn: 'Risk Analyst', avatar: '⚠️', perspective: '风险', tags: ['风险', '合规', '审计'], description: '评估风险因素，提供风控建议', systemPrompt: '你是一位风险管理专家...', enabled: true, usageCount: 2100, createdAt: '2025-01-20' },
  { id: 'ag003', name: '产品经理', nameEn: 'Product Manager', avatar: '💡', perspective: '产品', tags: ['产品', '用户体验', '需求分析'], description: '从产品角度分析需求和用户价值', systemPrompt: '你是一位产品经理...', enabled: true, usageCount: 4500, createdAt: '2025-02-01' },
  { id: 'ag004', name: '数据分析师', nameEn: 'Data Analyst', avatar: '📊', perspective: '数据', tags: ['数据', '统计', '洞察'], description: '用数据驱动决策，提供数据洞察', systemPrompt: '你是一位数据分析师...', enabled: false, usageCount: 1800, createdAt: '2025-02-10' },
  { id: 'ag005', name: '创新教练', nameEn: 'Innovation Coach', avatar: '🚀', perspective: '创新', tags: ['创新', '设计思维', '头脑风暴'], description: '激发创新思维，提供创意方案', systemPrompt: '你是一位创新教练...', enabled: true, usageCount: 2800, createdAt: '2025-03-01' },
];

// ===== 内容管理 =====
export interface MockConversation {
  id: string;
  userId: string;
  username: string;
  agentName: string;
  messageCount: number;
  status: 'normal' | 'flagged' | 'deleted';
  lastMessage: string;
  createdAt: string;
  updatedAt: string;
}

export const mockConversations: MockConversation[] = [
  { id: 'c001', userId: 'u001', username: '张三', agentName: '战略顾问', messageCount: 24, status: 'normal', lastMessage: '我觉得这个方案可以进一步优化...', createdAt: '2026-03-28', updatedAt: '2026-04-01' },
  { id: 'c002', userId: 'u002', username: '李四', agentName: '产品经理', messageCount: 15, status: 'flagged', lastMessage: '这个功能需求我们应该怎么评估？', createdAt: '2026-03-25', updatedAt: '2026-03-30' },
  { id: 'c003', userId: 'u004', username: '赵六', agentName: '风险分析师', messageCount: 8, status: 'normal', lastMessage: '请帮我分析一下这个投资项目的风险...', createdAt: '2026-04-01', updatedAt: '2026-04-02' },
  { id: 'c004', userId: 'u003', username: '王五', agentName: '创新教练', messageCount: 32, status: 'deleted', lastMessage: '不当内容已被删除', createdAt: '2026-03-10', updatedAt: '2026-03-15' },
  { id: 'c005', userId: 'u005', username: '孙七', agentName: '数据分析师', messageCount: 19, status: 'normal', lastMessage: '用户留存率最近有什么趋势？', createdAt: '2026-03-20', updatedAt: '2026-03-28' },
];

export interface MockNote {
  id: string;
  userId: string;
  username: string;
  title: string;
  content: string;
  status: 'normal' | 'flagged' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

export const mockNotes: MockNote[] = [
  { id: 'n001', userId: 'u001', username: '张三', title: '产品战略思考', content: '关于我们下一阶段产品方向的几点思考...', status: 'normal', createdAt: '2026-03-20', updatedAt: '2026-03-25' },
  { id: 'n002', userId: 'u002', username: '李四', title: '竞品分析报告', content: '主要竞品的功能对比和差异化分析...', status: 'normal', createdAt: '2026-03-22', updatedAt: '2026-03-28' },
  { id: 'n003', userId: 'u005', username: '孙七', title: '数据分析框架', content: '构建数据分析体系的核心框架...', status: 'flagged', createdAt: '2026-03-18', updatedAt: '2026-03-20' },
];

// ===== 计费系统 =====
export interface TokenPrice {
  id: string;
  type: string;
  model: string;
  inputPrice: number;
  outputPrice: number;
  unit: string;
  updatedAt: string;
}

export const mockTokenPrices: TokenPrice[] = [
  { id: 'tp001', type: '文本', model: 'GPT-4o', inputPrice: 0.03, outputPrice: 0.06, unit: '元/千Token', updatedAt: '2026-03-01' },
  { id: 'tp002', type: '文本', model: 'GPT-4o-mini', inputPrice: 0.005, outputPrice: 0.015, unit: '元/千Token', updatedAt: '2026-03-01' },
  { id: 'tp003', type: '语音', model: 'Whisper', inputPrice: 0.1, outputPrice: 0, unit: '元/分钟', updatedAt: '2026-03-01' },
];

export interface Plan {
  id: string;
  name: string;
  type: 'subscription' | 'payg';
  price: number;
  tokens: number;
  duration: string;
  features: string[];
  status: 'active' | 'inactive';
  subscribers: number;
}

export const mockPlans: Plan[] = [
  { id: 'p001', name: '免费体验', type: 'subscription', price: 0, tokens: 5000, duration: '月', features: ['基础对话', '2个Agent'], status: 'active', subscribers: 1200 },
  { id: 'p002', name: '专业版', type: 'subscription', price: 49, tokens: 100000, duration: '月', features: ['全部Agent', '优先响应', '知识库'], status: 'active', subscribers: 450 },
  { id: 'p003', name: '企业版', type: 'subscription', price: 199, tokens: 500000, duration: '月', features: ['全部功能', 'API访问', '专属客服'], status: 'active', subscribers: 80 },
  { id: 'p004', name: '次卡-100次', type: 'payg', price: 29, tokens: 50000, duration: '不限', features: ['100次对话', '全部Agent'], status: 'active', subscribers: 320 },
];

export interface Order {
  id: string;
  userId: string;
  username: string;
  planName: string;
  amount: number;
  status: 'paid' | 'pending' | 'refunded';
  payMethod: string;
  createdAt: string;
}

export const mockOrders: Order[] = [
  { id: 'o001', userId: 'u001', username: '张三', planName: '专业版', amount: 49, status: 'paid', payMethod: '微信支付', createdAt: '2026-04-01' },
  { id: 'o002', userId: 'u004', username: '赵六', planName: '企业版', amount: 199, status: 'paid', payMethod: '支付宝', createdAt: '2026-03-30' },
  { id: 'o003', userId: 'u005', username: '孙七', planName: '次卡-100次', amount: 29, status: 'paid', payMethod: '微信支付', createdAt: '2026-03-28' },
  { id: 'o004', userId: 'u002', username: '李四', planName: '专业版', amount: 49, status: 'refunded', payMethod: '支付宝', createdAt: '2026-03-25' },
  { id: 'o005', userId: 'u006', username: '周八', planName: '专业版', amount: 49, status: 'pending', payMethod: '微信支付', createdAt: '2026-04-02' },
];

export interface UsageRecord {
  id: string;
  userId: string;
  username: string;
  type: string;
  agentName: string;
  tokensInput: number;
  tokensOutput: number;
  cost: number;
  createdAt: string;
}

export const mockUsageRecords: UsageRecord[] = [
  { id: 'ur001', userId: 'u001', username: '张三', type: '文本', agentName: '战略顾问', tokensInput: 520, tokensOutput: 1200, cost: 0.088, createdAt: '2026-04-02 10:23' },
  { id: 'ur002', userId: 'u004', username: '赵六', type: '文本', agentName: '风险分析师', tokensInput: 380, tokensOutput: 900, cost: 0.065, createdAt: '2026-04-02 09:45' },
  { id: 'ur003', userId: 'u002', username: '李四', type: '语音', agentName: '产品经理', tokensInput: 0, tokensOutput: 0, cost: 0.5, createdAt: '2026-04-01 16:30' },
  { id: 'ur004', userId: 'u005', username: '孙七', type: '文本', agentName: '数据分析师', tokensInput: 1200, tokensOutput: 2800, cost: 0.204, createdAt: '2026-04-01 14:12' },
  { id: 'ur005', userId: 'u006', username: '周八', type: '文本', agentName: '创新教练', tokensInput: 650, tokensOutput: 1500, cost: 0.11, createdAt: '2026-04-01 11:05' },
];

// ===== 用户记忆 =====
export interface MemoryConfig {
  id: string;
  userId: string;
  username: string;
  memoryCount: number;
  maxMemory: number;
  retentionDays: number;
  autoExtract: boolean;
  lastUpdated: string;
}

export const mockMemoryConfigs: MemoryConfig[] = [
  { id: 'm001', userId: 'u001', username: '张三', memoryCount: 45, maxMemory: 100, retentionDays: 90, autoExtract: true, lastUpdated: '2026-04-01' },
  { id: 'm002', userId: 'u002', username: '李四', memoryCount: 23, maxMemory: 100, retentionDays: 90, autoExtract: true, lastUpdated: '2026-03-30' },
  { id: 'm003', userId: 'u004', username: '赵六', memoryCount: 12, maxMemory: 50, retentionDays: 60, autoExtract: false, lastUpdated: '2026-04-02' },
  { id: 'm004', userId: 'u005', username: '孙七', memoryCount: 67, maxMemory: 100, retentionDays: 90, autoExtract: true, lastUpdated: '2026-03-28' },
];

// ===== Dashboard 统计 =====
export const dashboardStats = {
  totalUsers: 12580,
  activeUsers: 8340,
  totalTokens: 45200000,
  revenue: 128500,
  userGrowth: [
    { month: '11月', users: 8200 },
    { month: '12月', users: 9100 },
    { month: '1月', users: 9800 },
    { month: '2月', users: 10500 },
    { month: '3月', users: 11400 },
    { month: '4月', users: 12580 },
  ],
  tokenUsage: [
    { month: '11月', input: 5200000, output: 12800000 },
    { month: '12月', input: 5800000, output: 14200000 },
    { month: '1月', input: 6100000, output: 15000000 },
    { month: '2月', input: 6500000, output: 16200000 },
    { month: '3月', input: 7200000, output: 18500000 },
    { month: '4月', input: 7800000, output: 20100000 },
  ],
  revenueData: [
    { month: '11月', amount: 85000 },
    { month: '12月', amount: 92000 },
    { month: '1月', amount: 98000 },
    { month: '2月', amount: 105000 },
    { month: '3月', amount: 118000 },
    { month: '4月', amount: 128500 },
  ],
  featureUsage: [
    { name: '私人对话', value: 45 },
    { name: '决策圆桌', value: 25 },
    { name: '知识库', value: 15 },
    { name: '会议纪要', value: 10 },
    { name: '灵感笔记', value: 5 },
  ],
};
