export interface MeetingFolder {
  id: string;
  name: string;
  count: number;
}

export interface TranscriptEntry {
  speaker: string;
  timestamp: string;
  text: string;
}

export interface AISummary {
  keyPoints: string[];
  decisions: string[];
  openQuestions: string[];
  todoItems: string[];
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: number;
  folder: string;
  audioUrl?: string;
  audioDuration?: string;
  transcript: TranscriptEntry[];
  aiSummary: AISummary;
  tags: string[];
}

export const meetingFolders: MeetingFolder[] = [
  { id: 'all', name: '全部会议', count: 25 },
  { id: 'product', name: '产品', count: 12 },
  { id: 'strategy', name: '策略', count: 8 },
  { id: 'personal', name: '个人', count: 5 },
];

export const mockMeetings: Meeting[] = [
  {
    id: '1',
    title: '新市场试点策略讨论',
    date: '2026.3.12',
    duration: '45 分钟',
    participants: 6,
    folder: 'strategy',
    audioDuration: '30:12',
    transcript: [
      { speaker: '发言人 1', timestamp: '00:01', text: '我们来讨论一下第二季度的增长战略。我认为我们需要重点关注数字营销举措。' },
      { speaker: '发言人 2', timestamp: '00:38', text: '我同意。我们目前的广告成本正在大幅上涨，我们需要优化转化率。' },
      { speaker: '发言人 1', timestamp: '01:15', text: '关于新市场试点，我建议我们先从东南亚市场开始。' },
      { speaker: '发言人 3', timestamp: '02:00', text: '我们需要考虑本地化策略和合规要求。' },
    ],
    aiSummary: {
      keyPoints: [
        '第一季度目标达成率达85%，超出初期预期。',
        '改进后的跨团队沟通协议已成功实施。',
        '第二季度路线图侧重于用户体验提升与性能优化。',
        '计划于4月和6月发布新功能，其间将进行Beta测试。',
      ],
      decisions: [
        '批准第二季度开发资源预算增加。',
        '决定优先改进移动应用，而非网页功能。',
        '同意将同步会议频率改为每周一次，而非每两周一次。',
      ],
      openQuestions: [
        '新设计系统的实施预计时间表是怎样的？',
        '我们将如何衡量用户体验改进的成效？',
        '鉴于测试需求的增加，我们是否应该增聘 QA 资源？',
      ],
      todoItems: [
        '审阅第二季度产品路线图并提供反馈',
        '安排与设计团队的后续会议',
        '准备新市场试点方案',
        '整理竞品分析报告',
      ],
    },
    tags: ['增长', '市场', '价格'],
  },
  {
    id: '2',
    title: '产品路线图评审',
    date: '2026.3.10',
    duration: '60 分钟',
    participants: 8,
    folder: 'product',
    audioDuration: '45:30',
    transcript: [
      { speaker: '发言人 1', timestamp: '00:01', text: '今天我们评审第二季度的产品路线图。' },
      { speaker: '发言人 2', timestamp: '00:20', text: '我们有三个主要功能需要交付。' },
    ],
    aiSummary: {
      keyPoints: ['确定了Q2三个核心功能', '移动端优先策略获得一致同意'],
      decisions: ['优先开发AI助手功能', '推迟社交功能到Q3'],
      openQuestions: ['是否需要增加前端开发人员？'],
      todoItems: ['完成技术方案设计', '更新项目时间线'],
    },
    tags: ['产品', '路线图'],
  },
  {
    id: '3',
    title: '团队周会',
    date: '2026.3.8',
    duration: '30 分钟',
    participants: 5,
    folder: 'personal',
    audioDuration: '22:15',
    transcript: [
      { speaker: '发言人 1', timestamp: '00:01', text: '大家汇报一下本周进展。' },
    ],
    aiSummary: {
      keyPoints: ['各项目进展顺利', '一个bug需要紧急修复'],
      decisions: ['下周进行代码审查'],
      openQuestions: [],
      todoItems: ['修复登录页面bug'],
    },
    tags: ['周会'],
  },
];
