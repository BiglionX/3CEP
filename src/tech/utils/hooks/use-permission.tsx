/**
 * 权限检?Hook
 * 用于?React 组件中进行权限判? */

'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

// 用户角色类型
export type UserRole =
  | 'admin'
  | 'manager'
  | 'content_manager'
  | 'shop_manager'
  | 'finance_manager'
  | 'procurement_specialist'
  | 'warehouse_operator'
  | 'agent_operator'
  | 'viewer'
  | 'external_partner';

// 权限类型
export type Permission = string;

// 用户信息接口
export interface UserInfo {
  id: string;
  email: string;
  roles: UserRole[];
  tenant_id: string | null;
  exp?: number;
}

/**
 * 权限检?Hook
 */
export function usePermission() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserInfo();
  }, []);

  /**
   * 加载用户信息
   */
  const loadUserInfo = async () => {
    try {
      setLoading(true);

      // �?localStorage 获取用户信息（实际项目中应该?API 获取?      const storedToken = localStorage.getItem('jwt_token');
      if (storedToken) {
        try {
          // 解析 JWT token
          const payload = JSON.parse(atob(storedToken.split('.')[1]));
          setUserInfo({
            id: payload.userId,
            email: payload.email,
            roles: payload.roles || [],
            tenant_id: payload.tenantId || null,
            exp: payload.exp,
          });
        } catch (parseError) {
          console.error('解析用户信息失败:', parseError);
          localStorage.removeItem('jwt_token');
        }
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 检查是否具有指定权?   */
  const hasPermission = (permission: Permission): boolean => {
    if (!userInfo) return false;

    // 超级管理员拥有所有权?    if (userInfo.roles.includes('admin')) {
      return true;
    }

    // 这里应该?RBAC 配置中检查权限映?    // 简化实现：根据角色直接判断常见权限
    const rolePermissions: Record<UserRole, Permission[]> = {
      admin: ['*'],
      manager: [
        'dashboard_read',
        'users_read',
        'users_create',
        'users_update',
        'content_read',
        'content_create',
        'content_update',
        'content_approve',
        'shops_read',
        'shops_create',
        'shops_update',
        'shops_approve',
        'payments_read',
        'reports_read',
        'reports_export',
        'settings_read',
        'procurement_read',
        'procurement_create',
        'procurement_approve',
      ],
      content_manager: [
        'dashboard_read',
        'content_read',
        'content_create',
        'content_update',
        'content_approve',
        'reports_read',
      ],
      shop_manager: [
        'dashboard_read',
        'shops_read',
        'shops_create',
        'shops_update',
        'shops_approve',
        'reports_read',
      ],
      finance_manager: [
        'dashboard_read',
        'payments_read',
        'payments_refund',
        'reports_read',
        'reports_export',
      ],
      procurement_specialist: [
        'dashboard_read',
        'procurement_read',
        'procurement_create',
        'procurement_approve',
        'reports_read',
      ],
      warehouse_operator: [
        'dashboard_read',
        'inventory_read',
        'inventory_update',
        'reports_read',
      ],
      agent_operator: [
        'dashboard_read',
        'agents_execute',
        'agents_monitor',
        'reports_read',
      ],
      viewer: ['dashboard_read', 'reports_read'],
      external_partner: ['dashboard_read'],
    };

    const userPermissions = userInfo.roles.flatMap(
      role => rolePermissions[role] || []
    );
    return (
      userPermissions.includes('*') || userPermissions.includes(permission)
    );
  };

  /**
   * 检查是否具有任意一个权?   */
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  /**
   * 检查是否具有所有权?   */
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  /**
   * 检查是否具有指定角?   */
  const hasRole = (role: UserRole): boolean => {
    return userInfo?.roles.includes(role) || false;
  };

  /**
   * 检查是否具有任意一个角?   */
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  /**
   * 获取用户可访问的菜单?   */
  const getAccessibleMenus = (menuItems: any[]): any[] => {
    if (!userInfo) return [];

    return menuItems.filter(item => {
      // 如果没有指定角色要求，默认可?      if (!item.roles) return true;

      // 检查用户是否具有所需角色之一
      return item.roles.some((role: UserRole) => hasRole(role));
    });
  };

  /**
   * 获取用户信息
   */
  const getUserInfo = (): UserInfo | null => {
    return userInfo;
  };

  /**
   * 用户是否已认?   */
  const isAuthenticated = (): boolean => {
    if (!userInfo) return false;

    // 检?token 是否过期
    if (userInfo.exp) {
      return Date.now() < userInfo.exp * 1000;
    }

    return true;
  };

  /**
   * 登出
   */
  const logout = () => {
    localStorage.removeItem('jwt_token');
    setUserInfo(null);
  };

  /**
   * 登录
   */
  const login = (token: string) => {
    localStorage.setItem('jwt_token', token);
    loadUserInfo();
  };

  return {
    // 状?    userInfo,
    loading,
    isAuthenticated: isAuthenticated(),

    // 权限检查方?    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,

    // 辅助方法
    getAccessibleMenus,
    getUserInfo,
    login,
    logout,
  };
}

/**
 * 权限保护组件 Props
 */
/**
 * 权限保护组件 - HOC 方式
 */
export function PermissionGuard({
  permission,
  role,
  requireAll = false,
  fallback = null,
  children,
}: {
  permission?: Permission | Permission[];
  role?: UserRole | UserRole[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const {
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyRole,
  } = usePermission();

  // 权限检?  let hasAccess = true;

  if (permission) {
    const permissions = Array.isArray(permission) ? permission : [permission];
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  // 角色检?  if (role && hasAccess) {
    const roles = Array.isArray(role) ? role : [role];
    hasAccess = requireAll ? roles.every(r => hasRole(r)) : hasAnyRole(roles);
  }

  if (!hasAccess) {
    return fallback;
  }

  return <>{children}</>;
}

/**
 * 角色保护组件 - 简化版? */
export function RoleGuard({
  roles,
  fallback = null,
  children,
}: {
  roles: UserRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { hasAnyRole } = usePermission();

  if (!hasAnyRole(roles)) {
    return fallback;
  }

  return <>{children}</>;
}
