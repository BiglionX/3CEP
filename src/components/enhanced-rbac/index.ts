/**
 * 增强版RBAC权限系统入口文件
 * 导出所有相关的组件、Hook和类型定? */

// 核心管理?export {
  EnhancedRbacProvider,
  useEnhancedRbac,
  PermissionGuard,
  RoleGuard,
} from './EnhancedRbacManager';

// UI组件
export { PermissionManagementPanel } from './PermissionManagementPanel';
export { RoleManagementPanel } from './RoleManagementPanel';

// 类型定义
export type {
  Permission,
  Role,
  UserPermissionContext,
  PermissionAction,
  ResourceType,
  PermissionCheckResult,
  DynamicPermissionAssignment,
  PermissionAuditLog,
} from './EnhancedRbacManager';
