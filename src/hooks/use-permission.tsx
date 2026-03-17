/**
 * 权限检查Hook
 * 用于在React 组件中进行权限判断
 */

'use client';

import { useEffect, useState } from 'react';

import type { Permission, UserInfo, UserRole } from '@/types/common';

interface UsePermissionReturn {
  userInfo: UserInfo | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  getAccessibleMenus: (menuItems: any[]) => any[];
  getUserInfo: () => UserInfo | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

/**
 * 权限检查Hook
 */
export function usePermission(): UsePermissionReturn {
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

      // 首先检查Supabase 认证状态
      try {
        const response = await fetch('/api/auth/check-session');
        if (response.ok) {
          const sessionData = await response.json();
          if (sessionData.authenticated) {
            setUserInfo({
              id: sessionData.user.id,
              email: sessionData.user.email,
              roles: sessionData.is_admin ? ['admin'] : ['viewer'],
              tenant_id: null,
              exp: Math.floor(Date.now() / 1000) + 3600, // 1小时过期时间
            });
            return;
          }
        }
      } catch (supabaseError) {
        // TODO: 移除调试日志
        console.error('Supabase 认证检查失败', supabaseError);
      }

      // 备用方案：从 localStorage 获取用户信息（JWT token）
      const storedToken = localStorage.getItem('jwt_token');
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
   * 检查是否具有指定权限
   */
  const hasPermission = (permission: Permission): boolean => {
    if (!userInfo) return false;

    // 超级管理员拥有所有权限
    if (userInfo.roles.includes('admin')) {
      return true;
    }

    // 这里应该在RBAC配置中检查权限映射
    // 简化实现：根据角色直接判断常见权限
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
   * 检查是否具有任意一个权限
   */
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  /**
   * 检查是否具有所有权限
   */
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  /**
   * 检查是否具有指定角色
   */
  const hasRole = (role: UserRole): boolean => {
    return userInfo?.roles.includes(role) || false;
  };

  /**
   * 检查是否具有任意一个角色
   */
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  /**
   * 获取用户可访问的菜单项
   */
  const getAccessibleMenus = (menuItems: any[]): any[] => {
    if (!userInfo) return [];

    return menuItems.filter(item => {
      // 如果没有指定角色要求，默认可访问
      if (!item.roles) return true;

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
   * 用户是否已认证
   */
  const isAuthenticated = (): boolean => {
    if (!userInfo) return false;

    // 检查token是否过期
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
  const login = async (token: string) => {
    localStorage.setItem('jwt_token', token);
    await loadUserInfo();
  };

  return {
    // 状态
    userInfo,
    loading,
    isAuthenticated: isAuthenticated(),

    // 权限检查方法
    hasPermission,
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
  const { hasRole, hasAnyPermission, hasAllPermissions, hasAnyRole } =
    usePermission();

  // 权限检查
  let hasAccess = true;

  if (permission) {
    const permissions = Array.isArray(permission) ? permission : [permission];
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  // 角色检查
  if (role && hasAccess) {
    const roles = Array.isArray(role) ? role : [role];
    hasAccess = requireAll ? roles.every(r => hasRole(r)) : hasAnyRole(roles);
  }

  if (!hasAccess) {
    return fallback;
  }

  return <>{children}</>;
}

/**
 * 角色保护组件 - 简化版本
 */
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
