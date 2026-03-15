/**
 * 增强版RBAC权限管理? * 提供更细粒度的权限控制、继承关系和动态权限分? */

'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
// import {
//   Shield,
//   User,
//   Users,
//   Key,
//   Eye,
//   EyeOff,
//   Lock,
//   Unlock,
//   Settings,
// } from 'lucide-react';

// 权限操作类型
export type PermissionAction =
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'execute'
  | 'manage';

// 资源类型
export type ResourceType =
  | 'dashboard'
  | 'users'
  | 'content'
  | 'shops'
  | 'payments'
  | 'reports'
  | 'settings'
  | 'procurement'
  | 'inventory'
  | 'agents'
  | 'n8n_workflows'
  | 'tools'
  | 'audit'
  | 'monitoring'
  | 'enterprise'
  | 'enterprise_agents'
  | 'enterprise_procurement'
  | string;

// 权限结构
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: ResourceType;
  action: PermissionAction;
  isSensitive: boolean;
  requiresApproval: boolean;
  dependentPermissions?: string[];
}

// 角色结构
export interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
  isSystem: boolean;
  inherits?: string[];
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 用户权限上下文
export interface UserPermissionContext {
  userId: string;
  roles: string[];
  directPermissions: string[];
  effectivePermissions: string[];
  tenantId?: string;
  department?: string;
  position?: string;
}

// 权限检查结果
export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  inheritedFrom?: string;
  requiresApproval?: boolean;
}

// 继承规则
export interface InheritanceRule {
  parentId: string;
  childId: string;
  permissionMapping: Record<string, string>;
}

// 动态权限分配
export interface DynamicPermissionAssignment {
  id: string;
  userId: string;
  permissionId: string;
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  conditions?: Record<string, any>;
  isActive: boolean;
}

// 权限审计日志
export interface PermissionAuditLog {
  id: string;
  userId: string;
  action: 'GRANT' | 'REVOKE' | 'CHECK' | 'DENY';
  resourceId?: string;
  permissionId?: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  details?: string;
}

// 上下文类型
export interface EnhancedRbacContextType {
  // 状态
  currentUser: UserPermissionContext | null;
  isLoading: boolean;
  permissions: Record<string, Permission>;
  roles: Record<string, Role>;

  // 基础权限检查
  hasPermission: (permissionId: string) => boolean;
  hasAnyPermission: (permissionIds: string[]) => boolean;
  hasAllPermissions: (permissionIds: string[]) => boolean;

  // 资源级权限检查
  canAccessResource: (
    resource: ResourceType,
    action: PermissionAction
  ) => boolean;
  getResourcePermissions: (resource: ResourceType) => Permission[];

  // 角色管理
  getUserRoles: (userId: string) => Promise<Role[]>;
  assignRole: (userId: string, roleId: string) => Promise<void>;
  revokeRole: (userId: string, roleId: string) => Promise<void>;

  // 动态权限
  grantDynamicPermission: (
    assignment: Omit<
      DynamicPermissionAssignment,
      'id' | 'grantedAt' | 'isActive'
    >
  ) => Promise<string>;
  revokeDynamicPermission: (assignmentId: string) => Promise<void>;
  getDynamicPermissions: (
    userId: string
  ) => Promise<DynamicPermissionAssignment[]>;

  // 继承管理
  addInheritance: (parentId: string, childId: string) => Promise<void>;
  removeInheritance: (parentId: string, childId: string) => Promise<void>;
  getInheritedPermissions: (roleId: string) => string[];

  // 审计功能
  logPermissionAction: (
    log: Omit<PermissionAuditLog, 'id' | 'timestamp'>
  ) => Promise<void>;
  getAuditLogs: (
    userId?: string,
    limit?: number
  ) => Promise<PermissionAuditLog[]>;

  // 条件权限
  checkConditionalPermission: (
    permissionId: string,
    conditions: Record<string, any>
  ) => Promise<PermissionCheckResult>;

  // 批量操作
  batchCheckPermissions: (permissionIds: string[]) => Record<string, boolean>;
  getMissingPermissions: (requiredPermissions: string[]) => string[];
}

// 创建上下文
const EnhancedRbacContext = createContext<EnhancedRbacContextType | undefined>(
  undefined
);

// 默认权限配置
const DEFAULT_PERMISSIONS: Record<string, Permission> = {
  dashboard_read: {
    id: 'dashboard_read',
    name: '仪表板查看',
    description: '查看系统仪表板和统计数据',
    category: 'dashboard',
    resource: 'dashboard',
    action: 'read',
    isSensitive: false,
    requiresApproval: false,
  },
  users_read: {
    id: 'users_read',
    name: '用户查看',
    description: '查看用户列表和基本信息',
    category: 'user_management',
    resource: 'users',
    action: 'read',
    isSensitive: true,
    requiresApproval: false,
  },
  users_create: {
    id: 'users_create',
    name: '用户创建',
    description: '创建新用户账户',
    category: 'user_management',
    resource: 'users',
    action: 'create',
    isSensitive: true,
    requiresApproval: true,
    dependentPermissions: ['users_read'],
  },
  users_update: {
    id: 'users_update',
    name: '用户编辑',
    description: '编辑用户信息和权限',
    category: 'user_management',
    resource: 'users',
    action: 'update',
    isSensitive: true,
    requiresApproval: true,
    dependentPermissions: ['users_read'],
  },
  users_delete: {
    id: 'users_delete',
    name: '用户删除',
    description: '删除用户账户',
    category: 'user_management',
    resource: 'users',
    action: 'delete',
    isSensitive: true,
    requiresApproval: true,
    dependentPermissions: ['users_read'],
  },
};

// 默认角色配置
const DEFAULT_ROLES: Record<string, Role> = {
  admin: {
    id: 'admin',
    name: '超级管理员',
    description: '系统最高权限角色，拥有所有功能访问权限',
    level: 100,
    isSystem: true,
    permissions: Object.keys(DEFAULT_PERMISSIONS),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  manager: {
    id: 'manager',
    name: '管理员',
    description: '业务管理员，可管理用户、内容和基础配置',
    level: 80,
    isSystem: true,
    permissions: [
      'dashboard_read',
      'users_read',
      'users_create',
      'users_update',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  viewer: {
    id: 'viewer',
    name: '只读查看',
    description: '仅能查看基础数据和报表',
    level: 30,
    isSystem: true,
    permissions: ['dashboard_read'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

export function EnhancedRbacProvider({
  children,
  currentUser: initialUser = null,
}: {
  children: React.ReactNode;
  currentUser?: UserPermissionContext | null;
}) {
  const [currentUser, setCurrentUser] = useState<UserPermissionContext | null>(
    initialUser
  );
  const [permissions, _setPermissions] =
    useState<Record<string, Permission>>(DEFAULT_PERMISSIONS);
  const [roles, _setRoles] = useState<Record<string, Role>>(DEFAULT_ROLES);
  const [dynamicAssignments, setDynamicAssignments] = useState<
    DynamicPermissionAssignment[]
  >([]);
  const [inheritanceRules, setInheritanceRules] = useState<InheritanceRule[]>(
    []
  );
  const [auditLogs, setAuditLogs] = useState<PermissionAuditLog[]>([]);
  const [isLoading, _setIsLoading] = useState(false);

  // 初始化用户权限上下文
  useEffect(() => {
    if (initialUser) {
      setCurrentUser(initialUser);
    }
  }, [initialUser]);

  // 获取有效权限（包含继承和动态分配）
  const getEffectivePermissions = useCallback(
    (userContext: UserPermissionContext): string[] => {
      if (!userContext) return [];

      const effectivePermissions = new Set<string>();

      // 添加直接权限
      userContext.directPermissions.forEach(perm =>
        effectivePermissions.add(perm)
      );

      // 添加角色权限
      userContext.roles.forEach(roleId => {
        const role = roles[roleId];
        if (role) {
          role.permissions.forEach(perm => effectivePermissions.add(perm));

          // 添加继承权限
          const inherited = getInheritedPermissions(roleId);
          inherited.forEach(perm => effectivePermissions.add(perm));
        }
      });

      // 添加动态权限（未过期且激活的）
      const now = new Date();
      dynamicAssignments
        .filter(
          assign =>
            assign.userId === userContext.userId &&
            assign.isActive &&
            (!assign.expiresAt || assign.expiresAt > now)
        )
        .forEach(assign => effectivePermissions.add(assign.permissionId));

      return Array.from(effectivePermissions);
    },
    [roles, dynamicAssignments]
  );

  // 基础权限检查
  const hasPermission = useCallback(
    (permissionId: string): boolean => {
      if (!currentUser) return false;

      // 超级管理员拥有所有权限
      if (currentUser.roles.includes('admin')) return true;

      const effectivePermissions = getEffectivePermissions(currentUser);
      return effectivePermissions.includes(permissionId);
    },
    [currentUser, getEffectivePermissions]
  );

  // 批量权限检查
  const hasAnyPermission = useCallback(
    (permissionIds: string[]): boolean => {
      return permissionIds.some(hasPermission);
    },
    [hasPermission]
  );

  const hasAllPermissions = useCallback(
    (permissionIds: string[]): boolean => {
      return permissionIds.every(hasPermission);
    },
    [hasPermission]
  );

  // 资源级权限检查
  const canAccessResource = useCallback(
    (resource: ResourceType, action: PermissionAction): boolean => {
      const permissionId = `${resource}_${action}`;
      return hasPermission(permissionId);
    },
    [hasPermission]
  );

  const getResourcePermissions = useCallback(
    (resource: ResourceType): Permission[] => {
      return Object.values(permissions).filter(p => p.resource === resource);
    },
    [permissions]
  );

  // 角色管理
  const getUserRoles = useCallback(
    async (userId: string): Promise<Role[]> => {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 100));

      const userContext = currentUser;
      if (!userContext || userContext.userId !== userId) {
        return [];
      }

      return userContext.roles.map(roleId => roles[roleId]).filter(Boolean);
    },
    [currentUser, roles]
  );

  const assignRole = useCallback(
    async (_userId: string, _roleId: string): Promise<void> => {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 200));

      // 这里应该调用实际的API
      // TODO: 移除调试日志 - console.log(`为用户 ${_userId} 分配角色 ${_roleId}`)
    },
    []
  );

  const revokeRole = useCallback(
    async (_userId: string, _roleId: string): Promise<void> => {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 200));

      // 这里应该调用实际的API
      // TODO: 移除调试日志 - console.log(`为用户 ${_userId} 撤销角色 ${_roleId}`)
    },
    []
  );

  // 动态权限管理
  const grantDynamicPermission = useCallback(
    async (
      assignment: Omit<
        DynamicPermissionAssignment,
        'id' | 'grantedAt' | 'isActive'
      >
    ): Promise<string> => {
      const id = Math.random().toString(36).substr(2, 9);
      const newAssignment: DynamicPermissionAssignment = {
        ...assignment,
        id,
        grantedAt: new Date(),
        isActive: true,
      };

      setDynamicAssignments(prev => [...prev, newAssignment]);

      // 记录审计日志
      await logPermissionAction({
        userId: assignment.userId,
        action: 'GRANT',
        permissionId: assignment.permissionId,
        success: true,
        details: `动态授予权限 ${assignment.permissionId}`,
      });

      return id;
    },
    []
  );

  const revokeDynamicPermission = useCallback(
    async (assignmentId: string): Promise<void> => {
      setDynamicAssignments(prev =>
        prev.map(assign =>
          assign.id === assignmentId ? { ...assign, isActive: false } : assign
        )
      );

      const assignment = dynamicAssignments.find(a => a.id === assignmentId);
      if (assignment) {
        await logPermissionAction({
          userId: assignment.userId,
          action: 'REVOKE',
          permissionId: assignment.permissionId,
          success: true,
          details: `撤销动态权限 ${assignment.permissionId}`,
        });
      }
    },
    [dynamicAssignments]
  );

  const getDynamicPermissions = useCallback(
    async (userId: string): Promise<DynamicPermissionAssignment[]> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return dynamicAssignments.filter(assign => assign.userId === userId);
    },
    [dynamicAssignments]
  );

  // 继承管理
  const addInheritance = useCallback(
    async (parentId: string, childId: string): Promise<void> => {
      const rule: InheritanceRule = {
        parentId,
        childId,
        permissionMapping: {},
      };

      setInheritanceRules(prev => [...prev, rule]);
    },
    []
  );

  const removeInheritance = useCallback(
    async (parentId: string, childId: string): Promise<void> => {
      setInheritanceRules(prev =>
        prev.filter(
          rule => !(rule.parentId === parentId && rule.childId === childId)
        )
      );
    },
    []
  );

  const getInheritedPermissions = useCallback(
    (roleId: string): string[] => {
      const inheritedPermissions: string[] = [];

      inheritanceRules
        .filter(rule => rule.childId === roleId)
        .forEach(rule => {
          const parentRole = roles[rule.parentId];
          if (parentRole) {
            inheritedPermissions.push(...parentRole.permissions);
          }
        });

      return inheritedPermissions;
    },
    [inheritanceRules, roles]
  );

  // 审计功能
  const logPermissionAction = useCallback(
    async (
      log: Omit<PermissionAuditLog, 'id' | 'timestamp'>
    ): Promise<void> => {
      const auditLog: PermissionAuditLog = {
        ...log,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
      };

      setAuditLogs(prev => [auditLog, ...prev.slice(0, 99)]); // 保留最近100条日志
    },
    []
  );

  const getAuditLogs = useCallback(
    async (
      userId?: string,
      limit: number = 50
    ): Promise<PermissionAuditLog[]> => {
      await new Promise(resolve => setTimeout(resolve, 100));

      let filteredLogs = auditLogs;
      if (userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === userId);
      }

      return filteredLogs.slice(0, limit);
    },
    [auditLogs]
  );

  // 条件权限检查
  const checkConditionalPermission = useCallback(
    async (
      permissionId: string,
      conditions: Record<string, any>
    ): Promise<PermissionCheckResult> => {
      const hasBasicPermission = hasPermission(permissionId);

      if (!hasBasicPermission) {
        return {
          allowed: false,
          reason: '基础权限不足',
        };
      }

      const permission = permissions[permissionId];
      if (!permission) {
        return {
          allowed: false,
          reason: '权限不存在',
        };
      }

      // 检查条件约束（这里可以根据具体业务逻辑扩展）
      const checkResult = await evaluateConditions(permission, conditions);

      return {
        allowed: checkResult.allowed,
        reason: checkResult.reason,
        requiresApproval: permission.requiresApproval,
      };
    },
    [hasPermission, permissions]
  );

  // 批量操作
  const batchCheckPermissions = useCallback(
    (permissionIds: string[]): Record<string, boolean> => {
      const results: Record<string, boolean> = {};
      permissionIds.forEach(id => {
        results[id] = hasPermission(id);
      });
      return results;
    },
    [hasPermission]
  );

  const getMissingPermissions = useCallback(
    (requiredPermissions: string[]): string[] => {
      return requiredPermissions.filter(id => !hasPermission(id));
    },
    [hasPermission]
  );

  // 条件评估辅助函数
  async function evaluateConditions(
    permission: Permission,
    conditions: Record<string, any>
  ): Promise<{ allowed: boolean; reason?: string }> {
    // 这里可以实现复杂的条件逻辑
    // 例如：时间限制、IP白名单、部门限制等

    // 简单示例：检查是否在工作时间
    if (conditions.workingHoursOnly) {
      const hour = new Date().getHours();
      if (hour < 9 || hour > 18) {
        return {
          allowed: false,
          reason: '非工作时间限制',
        };
      }
    }

    return { allowed: true };
  }

  const contextValue: EnhancedRbacContextType = {
    currentUser,
    isLoading,
    permissions,
    roles,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessResource,
    getResourcePermissions,
    getUserRoles,
    assignRole,
    revokeRole,
    grantDynamicPermission,
    revokeDynamicPermission,
    getDynamicPermissions,
    addInheritance,
    removeInheritance,
    getInheritedPermissions,
    logPermissionAction,
    getAuditLogs,
    checkConditionalPermission,
    batchCheckPermissions,
    getMissingPermissions,
  };

  return (
    <EnhancedRbacContext.Provider value={contextValue}>
      {children}
    </EnhancedRbacContext.Provider>
  );
}

// Hook函数
export function useEnhancedRbac() {
  const context = useContext(EnhancedRbacContext);
  if (!context) {
    throw new Error('useEnhancedRbac must be used within EnhancedRbacProvider');
  }
  return context;
}

// 权限保护组件
interface PermissionGuardProps {
  permission?: string | string[];
  resource?: ResourceType;
  action?: PermissionAction;
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({
  permission,
  resource,
  action,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const {
    hasAnyPermission,
    hasAllPermissions,
    canAccessResource,
  } = useEnhancedRbac();

  let hasAccess = true;

  if (permission) {
    const permissions = Array.isArray(permission) ? permission : [permission];
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  } else if (resource && action) {
    hasAccess = canAccessResource(resource, action);
  }

  if (!hasAccess) {
    return fallback;
  }

  return <>{children}</>;
}

// 角色保护组件
interface RoleGuardProps {
  roles: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function RoleGuard({
  roles,
  requireAll = false,
  fallback = null,
  children,
}: RoleGuardProps) {
  const { currentUser } = useEnhancedRbac();

  if (!currentUser) {
    return fallback;
  }

  const hasRole = requireAll
    ? roles.every(role => currentUser.roles.includes(role))
    : roles.some(role => currentUser.roles.includes(role));

  if (!hasRole) {
    return fallback;
  }

  return <>{children}</>;
}
