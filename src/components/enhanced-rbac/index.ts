/**
 * 增强版RBAC权限系统入口文件
 * 导出所有相关的组件、Hook和类型定义
 */

// 核心管理组件
export {
  EnhancedRbacProvider,
  PermissionGuard,
  RoleGuard,
  useEnhancedRbac,
} from './EnhancedRbacManager';

// UI组件
export { PermissionManagementPanel } from './PermissionManagementPanel';
export { RoleManagementPanel } from './RoleManagementPanel';

// 类型定义
export type {
  DynamicPermissionAssignment,
  Permission,
  PermissionAction,
  PermissionAuditLog,
  PermissionCheckResult,
  ResourceType,
  Role,
  UserPermissionContext,
} from './EnhancedRbacManager';
