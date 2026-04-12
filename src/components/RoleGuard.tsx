'use client';

import { useUser } from '@/components/providers/AuthProvider';
import { UserRole } from '@/lib/auth-service';
import React, { ReactNode } from 'react';

interface RoleGuardProps {
  /** 需要的角色 */
  roles: UserRole | UserRole[];
  /** 权限不足时显示的内容 */
  fallback?: ReactNode;
  /** 子元素 */
  children: ReactNode;
  /** 是否需要满足所有角色 */
  requireAll?: boolean;
}

/**
 * 角色守卫组件
 * 根据用户角色控制组件的显示
 */
export function RoleGuard({
  roles,
  fallback = null,
  children,
  requireAll = false,
}: RoleGuardProps) {
  const { roles: userRoles, isLoading } = useUser();

  // 如果还在加载中，可以选择显示加载状态或者空内容
  if (isLoading) {
    return null; // 或者返回加载指示器
  }

  // 如果没有用户角色信息，显示 fallback
  if (!userRoles || userRoles.length === 0) {
    return <>{fallback}</>;
  }

  const requiredRoles = Array.isArray(roles) ? roles : [roles];

  // 检查角色权限
  const hasAccess = requireAll
    ? requiredRoles.every(role => userRoles.includes(role))
    : requiredRoles.some(role => userRoles.includes(role));

  // 超级管理员拥有所有权限
  const isAdmin = userRoles.includes('admin');

  if (!hasAccess && !isAdmin) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface PermissionGuardProps {
  /** 需要的权限 */
  permissions: string | string[];
  /** 权限不足时显示的内容 */
  fallback?: ReactNode;
  /** 子元素 */
  children: ReactNode;
  /** 是否需要满足所有权限 */
  requireAll?: boolean;
}

/**
 * 权限守卫组件
 * 根据用户权限控制组件的显示
 */
export function PermissionGuard({
  permissions,
  fallback = null,
  children,
  requireAll = false,
}: PermissionGuardProps) {
  const { hasPermission, isLoading } = useUser();

  // 如果还在加载中
  if (isLoading) {
    return null;
  }

  const requiredPermissions = Array.isArray(permissions)
    ? permissions
    : [permissions];

  // 检查权限
  const hasAccess = requireAll
    ? requiredPermissions.every(permission => hasPermission(permission))
    : requiredPermissions.some(permission => hasPermission(permission));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// 简化版本的守卫组件，用于常见的使用场景
interface SimpleGuardProps {
  /** 权限或角色要求 */
  require: string | string[] | UserRole | UserRole[];
  /** 子元素 */
  children: ReactNode;
  /** 无权限时显示的内容 */
  fallback?: ReactNode;
}

/**
 * 简化的通用守卫组件
 * 自动判断传入的是权限还是角色
 */
export function Guard({
  require,
  children,
  fallback = null,
}: SimpleGuardProps) {
  const requirements = Array.isArray(require) ? require : [require];

  // 简单判断：如果包含点号 (.) 则认为是权限，否则是角色
  const isPermission = requirements.some(
    req => typeof req === 'string' && req.includes('.')
  );

  if (isPermission) {
    return (
      <PermissionGuard
        permissions={requirements as string[]}
        fallback={fallback}
      >
        {children}
      </PermissionGuard>
    );
  } else {
    return (
      <RoleGuard roles={requirements as UserRole[]} fallback={fallback}>
        {children}
      </RoleGuard>
    );
  }
}

// 预定义的常用守卫组件
export const AdminGuard: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback = null }) => (
  <RoleGuard roles="admin" fallback={fallback}>
    {children}
  </RoleGuard>
);

export const ContentReviewerGuard: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback = null }) => (
  <RoleGuard roles={['admin', 'content_reviewer']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const ShopReviewerGuard: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback = null }) => (
  <RoleGuard roles={['admin', 'shop_reviewer']} fallback={fallback}>
    {children}
  </RoleGuard>
);

export const FinanceGuard: React.FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback = null }) => (
  <RoleGuard roles={['admin', 'finance']} fallback={fallback}>
    {children}
  </RoleGuard>
);

// 使用示例和测试组件
export function RoleGuardDemo() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">角色守卫演示</h2>

      <div className="border p-4 rounded">
        <h3 className="font-medium mb-2">管理员专区</h3>
        <AdminGuard fallback={<div className="text-red-500">仅管理员可见</div>}>
          <div className="text-green-600">
            欢迎管理员！这里是系统核心配置区域
          </div>
        </AdminGuard>
      </div>

      <div className="border p-4 rounded">
        <h3 className="font-medium mb-2">内容审核专区</h3>
        <ContentReviewerGuard
          fallback={<div className="text-red-500">仅内容审核员可见</div>}
        >
          <div className="text-blue-600">
            内容审核面板 - 可以审核和管理用户提交的内容
          </div>
        </ContentReviewerGuard>
      </div>

      <div className="border p-4 rounded">
        <h3 className="font-medium mb-2">财务管理专区</h3>
        <FinanceGuard
          fallback={<div className="text-red-500">仅财务人员可见</div>}
        >
          <div className="text-purple-600">财务报表和支付管理功能</div>
        </FinanceGuard>
      </div>

      <div className="border p-4 rounded">
        <h3 className="font-medium mb-2">通用权限检测</h3>
        <Guard
          require="content.write"
          fallback={<div className="text-red-500">无内容编辑权限</div>}
        >
          <div className="text-green-600">您有内容编辑权限</div>
        </Guard>
      </div>
    </div>
  );
}
