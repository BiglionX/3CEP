/**
 * 基于 RBAC 配置的权限检查 Hook
 * 与 config/rbac.json 完全绑定，提供统一的权限检查接口 */

'use client';

import { useUser } from '@/components/providers/AuthProvider';
import { useEffect, useState } from 'react';

// 缓存 RBAC 配置
import type { RbacConfig, PermissionInfo, RoleInfo } from '@/types/common';

let cachedRbacConfig: RbacConfig | null = null;

/**
 * 加载 RBAC 配置
 */
async function loadRbacConfig() {
  if (cachedRbacConfig) {
    return cachedRbacConfig;
  }

  try {
    const response = await fetch('/api/rbac/config');
    if (response.ok) {
      cachedRbacConfig = await response.json();
      return cachedRbacConfig;
    }

    // fallback 到本地配置文件
    const configResponse = await fetch('/config/rbac.json');
    if (configResponse.ok) {
      cachedRbacConfig = await configResponse.json();
      return cachedRbacConfig;
    }

    throw new Error('无法加载 RBAC 配置');
  } catch (error) {
    console.error('加载 RBAC 配置失败:', error);
    throw error;
  }
}

/**
 * RBAC 权限检查 Hook
 */
export function useRbacPermission() {
  const { user, roles, isLoading } = useUser();
  const [rbacConfig, setRbacConfig] = useState<RbacConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  // 加载 RBAC 配置
  useEffect(() => {
    async function loadConfig() {
      try {
        setConfigLoading(true);
        const config = await loadRbacConfig();
        setRbacConfig(config);
      } catch (error) {
        console.error('加载 RBAC 配置失败:', error);
      } finally {
        setConfigLoading(false);
      }
    }

    loadConfig();
  }, []);

  /**
   * 检查用户是否具有指定权限
   */
  const hasPermission = (permission: string): boolean => {
    if (!user || !rbacConfig) return false;

    // 超级管理员拥有所有权限
    if (roles?.includes('admin')) return true;

    // 检查每个角色的权限
    for (const role of roles) {
      const rolePermissions = rbacConfig.role_permissions[role] || [];
      if (rolePermissions.includes(permission)) {
        return true;
      }
    }

    return false;
  };

  /**
   * 检查用户是否具有任意一个指定权限
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  /**
   * 检查用户是否具有所有指定权限
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  /**
   * 获取用户可访问的资源列表
   */
  const getAccessibleResources = (category?: string): string[] => {
    if (!rbacConfig) return [];

    const accessibleResources = new Set<string>();

    // 超级管理员可以访问所有资?    if (roles.includes('admin')) {
      return Object.keys(rbacConfig.permissions).map(
        key => rbacConfig.permissions[key].resource
      );
    }

    // 收集用户所有角色的权限对应的资?    for (const role of roles) {
      const permissions = rbacConfig.role_permissions[role] || [];
      for (const permKey of permissions) {
        const permission = rbacConfig.permissions[permKey];
        if (permission && (!category || permission.category === category)) {
          accessibleResources.add(permission.resource);
        }
      }
    }

    return Array.from(accessibleResources);
  };

  /**
   * 获取权限详细信息
   */
  const getPermissionInfo = (permission: string): PermissionInfo | null => {
    if (!rbacConfig) return null;
    return rbacConfig.permissions[permission] || null;
  };

  /**
   * 获取角色信息
   */
  const getRoleInfo = (role: string): RoleInfo | null => {
    if (!rbacConfig) return null;
    return rbacConfig.roles[role] || null;
  };

  /**
   * 检查资源访问权限
   */
  const canAccessResource = (resource: string, action: string): boolean => {
    const permissionKey = `${resource}_${action}`;
    return hasPermission(permissionKey);
  };

  return {
    // 状态
    isLoading: isLoading || configLoading,
    isConfigLoaded: !!rbacConfig,

    // 用户信息
    user,
    roles,

    // 权限检查方法
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessResource,

    // 资源访问
    getAccessibleResources,

    // 配置信息
    getPermissionInfo,
    getRoleInfo,
    rbacConfig,
  };
}
