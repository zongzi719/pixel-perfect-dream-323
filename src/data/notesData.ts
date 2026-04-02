export interface InspirationNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  aiInsight?: string;
  createdAt: string;
}

export const mockNotes: InspirationNote[] = [
  {
    id: '1',
    title: '无感设计',
    content: '最好的界面是无形的。你不会注意到它们的存在，只会自然而然地使用它们。',
    tags: ['#想法'],
    aiInsight: '流畅的体验可以降低认知负荷。目标是让技术感觉自然。',
    createdAt: '2026.03.21 16:21',
  },
  {
    id: '2',
    title: 'AI记忆与个性化',
    content: '如果人工智能不仅能记住我说的话，还能记住我的想法，那会怎样？',
    tags: ['#产品', '#情绪'],
    aiInsight: '这涉及到内容之外的个性化——它关乎理解推理模式和思维模型。',
    createdAt: '2026.03.21 16:21',
  },
  {
    id: '3',
    title: '不可逆决策',
    content: '有些决定是不可逆的，这类决策需要更慢、更谨慎；而可逆的决策，应该尽量加快节奏。',
    tags: ['#决策节奏', '#判断'],
    createdAt: '2026.03.21 16:21',
  },
  {
    id: '4',
    title: '适应性战略',
    content: '在复杂的市场环境中，持续学习和快速迭代是关键。只有敏捷应变，才能抓住不确定性带来的机遇。',
    tags: ['#敏捷策略', '#市场应变'],
    aiInsight: '你强调了适应性的重要性，表明策略不仅要有远见，还需灵活调整以应对变化。',
    createdAt: '2026.03.21 16:22',
  },
  {
    id: '5',
    title: '团队执行力',
    content: '团队执行力的问题，很多时候不是能力问题，而是优先级不清晰。当方向模糊时，每个人都会做"看起来合理"的事。',
    tags: ['#组织管理', '#执行力'],
    createdAt: '2026.03.21 16:21',
  },
  {
    id: '6',
    title: '减少决策压力',
    content: '或许用户想要的不是更多功能，而是更少的决策压力。',
    tags: ['#想法', '#产品'],
    createdAt: '2026.03.21 16:21',
  },
  {
    id: '7',
    title: 'AI思考伙伴',
    content: '为什么我们将人工智能视为工具而不是思考伙伴？',
    tags: ['#产品'],
    aiInsight: '流畅的体验可以降低认知负荷。目标是让技术感觉自然。',
    createdAt: '2026.03.21 16:21',
  },
  {
    id: '8',
    title: '用户体验驱动力',
    content: '用户体验是产品成功的核心驱动力，技术只是工具，服务才是桥梁。',
    tags: ['#产品', '#用户体验'],
    aiInsight: '你关注用户需求深度，体现了以人为本的产品设计理念。',
    createdAt: '2026.03.21 16:22',
  },
];
