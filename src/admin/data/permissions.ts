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
