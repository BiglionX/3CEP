/**
 * 多类型用户管理 - RBAC 权限配置示例
 *
 * 使用方法：
 * 1. 将此文件内容合并到现有的权限系统中
 * 2. 根据实际需求调整权限和角色的映射关系
 * 3. 在数据库中创建相应的权限记录
 */

// ============================================================================
// 1. 权限定义
// ============================================================================

export const USER_MANAGEMENT_PERMISSIONS = {
  // ==================== 基础权限 ====================

  /** 查看用户列表 */
  'usermgr.view': {
    id: 'usermgr.view',
    name: '查看用户管理',
    description: '可以查看用户列表和用户详情',
    category: 'user_management',
    defaultRoles: ['admin', 'manager', 'viewer'],
  },

  /** 查看用户详情 */
  'usermgr.view_detail': {
    id: 'usermgr.view_detail',
    name: '查看用户详情',
    description: '可以查看单个用户的完整信息',
    category: 'user_management',
    defaultRoles: ['admin', 'manager', 'viewer'],
  },

  // ==================== 操作权限 ====================

  /** 管理用户（编辑、删除） */
  'usermgr.manage': {
    id: 'usermgr.manage',
    name: '管理用户',
    description: '可以编辑、删除用户信息',
    category: 'user_management',
    defaultRoles: ['admin', 'manager'],
  },

  /** 创建用户 */
  'usermgr.create': {
    id: 'usermgr.create',
    name: '创建用户',
    description: '可以创建新的用户账户',
    category: 'user_management',
    defaultRoles: ['admin', 'manager'],
  },

  /** 更新用户信息 */
  'usermgr.update': {
    id: 'usermgr.update',
    name: '更新用户',
    description: '可以修改用户信息',
    category: 'user_management',
    defaultRoles: ['admin', 'manager'],
  },

  /** 删除用户 */
  'usermgr.delete': {
    id: 'usermgr.delete',
    name: '删除用户',
    description: '可以删除用户账户',
    category: 'user_management',
    defaultRoles: ['admin'],
  },

  // ==================== 审核权限 ====================

  /** 审核用户认证 */
  'usermgr.verify': {
    id: 'usermgr.verify',
    name: '审核用户认证',
    description: '可以审核用户的认证申请',
    category: 'user_management',
    defaultRoles: ['admin', 'manager', 'content_manager'],
  },

  /** 批准认证 */
  'usermgr.verify_approve': {
    id: 'usermgr.verify_approve',
    name: '批准认证',
    description: '可以批准用户的认证申请',
    category: 'user_management',
    defaultRoles: ['admin', 'manager'],
  },

  /** 拒绝认证 */
  'usermgr.verify_reject': {
    id: 'usermgr.verify_reject',
    name: '拒绝认证',
    description: '可以拒绝用户的认证申请',
    category: 'user_management',
    defaultRoles: ['admin', 'manager'],
  },

  // ==================== 状态管理权限 ====================

  /** 更改用户状态 */
  'usermgr.change_status': {
    id: 'usermgr.change_status',
    name: '更改用户状态',
    description: '可以更改用户账户状态（活跃/暂停/关闭）',
    category: 'user_management',
    defaultRoles: ['admin', 'manager'],
  },

  /** 暂停用户 */
  'usermgr.suspend': {
    id: 'usermgr.suspend',
    name: '暂停用户',
    description: '可以暂停用户账户',
    category: 'user_management',
    defaultRoles: ['admin', 'manager'],
  },

  /** 恢复用户 */
  'usermgr.restore': {
    id: 'usermgr.restore',
    name: '恢复用户',
    description: '可以恢复被暂停的用户账户',
    category: 'user_management',
    defaultRoles: ['admin', 'manager'],
  },

  // ==================== 数据权限 ====================

  /** 导出数据 */
  'usermgr.export': {
    id: 'usermgr.export',
    name: '导出用户数据',
    description: '可以导出用户数据为 CSV/Excel 格式',
    category: 'user_management',
    defaultRoles: ['admin', 'manager', 'finance_manager'],
  },

  /** 批量操作 */
  'usermgr.batch_operation': {
    id: 'usermgr.batch_operation',
    name: '批量操作',
    description: '可以对用户进行批量操作',
    category: 'user_management',
    defaultRoles: ['admin', 'manager'],
  },

  /** 查看统计数据 */
  'usermgr.view_stats': {
    id: 'usermgr.view_stats',
    name: '查看统计数据',
    description: '可以查看用户统计数据',
    category: 'user_management',
    defaultRoles: ['admin', 'manager', 'finance_manager'],
  },
};

// ============================================================================
// 2. 角色与权限映射（简化版，直接存储在 user_accounts.role 字段）
// ============================================================================

export const ROLE_PERMISSIONS_MAP = {
  // ==================== 管理员 ====================
  admin: [
    'usermgr.view',
    'usermgr.view_detail',
    'usermgr.manage',
    'usermgr.create',
    'usermgr.update',
    'usermgr.delete',
    'usermgr.verify',
    'usermgr.verify_approve',
    'usermgr.verify_reject',
    'usermgr.change_status',
    'usermgr.suspend',
    'usermgr.restore',
    'usermgr.export',
    'usermgr.batch_operation',
    'usermgr.view_stats',
  ],

  // ==================== 经理 ====================
  manager: [
    'usermgr.view',
    'usermgr.view_detail',
    'usermgr.manage',
    'usermgr.create',
    'usermgr.update',
    'usermgr.verify',
    'usermgr.verify_approve',
    'usermgr.verify_reject',
    'usermgr.change_status',
    'usermgr.suspend',
    'usermgr.restore',
    'usermgr.export',
    'usermgr.batch_operation',
    'usermgr.view_stats',
  ],

  // ==================== 内容管理员 ====================
  content_manager: ['usermgr.view', 'usermgr.view_detail', 'usermgr.verify'],

  // ==================== 店铺管理员 ====================
  shop_manager: ['usermgr.view', 'usermgr.view_detail'],

  // ==================== 财务管理员 ====================
  finance_manager: [
    'usermgr.view',
    'usermgr.view_detail',
    'usermgr.view_stats',
    'usermgr.export',
  ],

  // ==================== 采购专员 ====================
  procurement_specialist: ['usermgr.view', 'usermgr.view_detail'],

  // ==================== 仓库操作员 ====================
  warehouse_operator: ['usermgr.view', 'usermgr.view_detail'],

  // ==================== 智能体操作员 ====================
  agent_operator: ['usermgr.view', 'usermgr.view_detail'],

  // ==================== 只读用户 ====================
  viewer: ['usermgr.view', 'usermgr.view_detail'],
};

// ============================================================================
// 3. 前端组件中的权限检查示例
// ============================================================================

/**
 * 在前端组件中使用权限检查的示例
 *
 * @example
 * ```tsx
 * import { useRbacPermission } from '@/hooks/use-rbac-permission';
 *
 * function UserManagementPage() {
 *   const { hasPermission } = useRbacPermission();
 *
 *   return (
 *     <div>
 *       {/* 基础查看权限 *\/}
 *       {hasPermission('usermgr.view') && <UserList />}
 *
 *       {/* 编辑按钮 - 需要管理权限 *\/}
 *       {hasPermission('usermgr.manage') && (
 *         <Button>编辑用户</Button>
 *       )}
 *
 *       {/* 删除按钮 - 需要删除权限 *\/}
 *       {hasPermission('usermgr.delete') && (
 *         <Button variant="destructive">删除用户</Button>
 *       )}
 *
 *       {/* 导出按钮 - 需要导出权限 *\/}
 *       {hasPermission('usermgr.export') && (
 *         <Button>导出数据</Button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */

// ============================================================================
// 4. 数据库初始化 SQL（可选）
// ============================================================================

/**
如果需要使用独立的权限表系统，可以执行以下 SQL：

```sql
-- 创建权限表
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建角色权限关联表
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE(role_id, permission_id)
);

-- 插入用户管理相关权限
INSERT INTO permissions (code, name, description, category) VALUES
  ('usermgr.view', '查看用户管理', '可以查看用户列表和用户详情', 'user_management'),
  ('usermgr.view_detail', '查看用户详情', '可以查看单个用户的完整信息', 'user_management'),
  ('usermgr.manage', '管理用户', '可以编辑、删除用户信息', 'user_management'),
  ('usermgr.create', '创建用户', '可以创建新的用户账户', 'user_management'),
  ('usermgr.update', '更新用户', '可以修改用户信息', 'user_management'),
  ('usermgr.delete', '删除用户', '可以删除用户账户', 'user_management'),
  ('usermgr.verify', '审核用户认证', '可以审核用户的认证申请', 'user_management'),
  ('usermgr.verify_approve', '批准认证', '可以批准用户的认证申请', 'user_management'),
  ('usermgr.verify_reject', '拒绝认证', '可以拒绝用户的认证申请', 'user_management'),
  ('usermgr.change_status', '更改用户状态', '可以更改用户账户状态', 'user_management'),
  ('usermgr.suspend', '暂停用户', '可以暂停用户账户', 'user_management'),
  ('usermgr.restore', '恢复用户', '可以恢复被暂停的用户账户', 'user_management'),
  ('usermgr.export', '导出用户数据', '可以导出用户数据为 CSV/Excel 格式', 'user_management'),
  ('usermgr.batch_operation', '批量操作', '可以对用户进行批量操作', 'user_management'),
  ('usermgr.view_stats', '查看统计数据', '可以查看用户统计数据', 'user_management');
```
*/

// ============================================================================
// 5. 快速使用指南
// ============================================================================

/**
 * 快速开始：
 *
 * 1. **最简单的方式**（推荐）
 *    - 直接使用 user_accounts.role 字段
 *    - 在代码中检查角色来判断权限
 *    - 参考上面的 ROLE_PERMISSIONS_MAP
 *
 * 2. **如果需要更细粒度的权限控制**
 *    - 执行上面的 SQL 创建权限表
 *    - 建立角色 - 权限关联
 *    - 使用 useRbacPermission hook 进行检查
 *
 * 3. **在前端页面中使用**
 *    ```typescript
 *    const { hasPermission } = useRbacPermission();
 *
 *    if (hasPermission('usermgr.view')) {
 *      // 显示用户列表
 *    }
 *
 *    if (hasPermission('usermgr.manage')) {
 *      // 显示编辑按钮
 *    }
 *    ```
 */

// 导出所有权限定义
export default USER_MANAGEMENT_PERMISSIONS;
