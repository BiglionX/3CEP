/**
 * 统一门户与管理后台桥接服务
 * 提供跨系统数据访问和权限同步功能
 */

import { useRbacPermission } from '@/hooks/use-rbac-permission';
import { fetchWithTimeout } from '@/lib/utils/fetch-with-timeout';

// 管理后台API基础路径
const ADMIN_API_BASE = '/api/admin';
const PORTAL_API_BASE = '/api/data-center';

/**
 * 跨系统数据访问服务
 */
export class PortalAdminBridge {
  /**
   * 获取管理后台统计数据（供统一门户使用）
   */
  static async getAdminStats() {
    try {
      const response = await fetch(`${ADMIN_API_BASE}/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error('获取管理后台数据失败');
    } catch (error) {
      console.error('管理后台数据获取错误:', error);
      return null;
    }
  }

  /**
   * 获取用户管理信息
   */
  static async getUserManagementData(filters?: any) {
    try {
      const params = new URLSearchParams({
        ...filters,
        include_stats: 'true',
      });

      const response = await fetchWithTimeout(
        `${ADMIN_API_BASE}/users?${params}`,
        {
          timeout: 15000,
          headers: {
            Authorization: `Bearer ${this.getAuthToken()}`,
          },
        }
      );

      if (response.ok) {
        return await response.json();
      }
      throw new Error('获取用户管理数据失败');
    } catch (error) {
      console.error('用户管理数据获取错误:', error);
      return null;
    }
  }

  /**
   * 同步权限状态
   */
  static async syncPermissionStatus() {
    try {
      const response = await fetch(`${PORTAL_API_BASE}/permissions/sync`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('权限同步失败:', error);
      return false;
    }
  }

  /**
   * 获取跨系统通知
   */
  static async getCrossSystemNotifications() {
    try {
      const response = await fetchWithTimeout(
        `${PORTAL_API_BASE}/notifications/cross-system`,
        {
          timeout: 10000,
          headers: {
            Authorization: `Bearer ${this.getAuthToken()}`,
          },
        }
      );

      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('获取跨系统通知失败:', error);
      return [];
    }
  }

  /**
   * 获取认证令牌
   */
  private static getAuthToken(): string {
    // 从 localStorage 或 cookie 中获取认证令牌
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth-token') || '';
    }
    return '';
  }
}

/**
 * React Hook - 跨系统权限检查
 */
export function useCrossSystemPermission() {
  const { hasPermission, roles } = useRbacPermission();

  /**
   * 检查是否可以在统一门户中访问管理后台功能
   */
  const canAccessAdminFeature = (feature: string): boolean => {
    // 管理后台相关权限映射
    const adminPermissionMap: Record<string, string> = {
      user_management: 'users_read',
      system_monitoring: 'monitoring_read',
      content_review: 'content_approve',
      shop_management: 'shops_approve',
      financial_reports: 'payments_read',
    };

    const requiredPermission = adminPermissionMap[feature];
    return requiredPermission ? hasPermission(requiredPermission) : false;
  };

  /**
   * 获取跨系统可访问功能列表
   */
  const getAccessibleCrossSystemFeatures = (): string[] => {
    const features = [
      'user_management',
      'system_monitoring',
      'content_review',
      'shop_management',
      'financial_reports',
    ];

    return features.filter(feature => canAccessAdminFeature(feature));
  };

  return {
    canAccessAdminFeature,
    getAccessibleCrossSystemFeatures,
    currentRoles: roles,
    hasPortalPermission: hasPermission,
  };
}

/**
 * 跨系统导航助手
 */
export class CrossSystemNavigator {
  /**
   * 从统一门户跳转到管理后台
   */
  static navigateToAdmin(feature?: string) {
    let targetPath = '/admin/dashboard';

    // 根据功能需求确定具体跳转路径
    const featurePaths: Record<string, string> = {
      user_management: '/admin/users',
      system_monitoring: '/admin/monitoring',
      content_review: '/admin/content',
      shop_management: '/admin/shops',
      financial_reports: '/admin/finance',
    };

    if (feature && featurePaths[feature]) {
      targetPath = featurePaths[feature];
    }

    // 执行跳转
    if (typeof window !== 'undefined') {
      window.location.href = targetPath;
    }
  }

  /**
   * 从管理后台返回统一门户
   */
  static navigateToPortal(section?: string) {
    let targetPath = '/data-center';

    const sectionPaths: Record<string, string> = {
      dashboard: '/data-center',
      analytics: '/data-center/query',
      monitoring: '/data-center/monitoring',
      settings: '/data-center/settings',
    };

    if (section && sectionPaths[section]) {
      targetPath = sectionPaths[section];
    }

    if (typeof window !== 'undefined') {
      window.location.href = targetPath;
    }
  }

  /**
   * 打开新窗口访问管理后台
   */
  static openAdminInNewWindow(feature?: string) {
    let targetPath = '/admin/dashboard';

    const featurePaths: Record<string, string> = {
      user_management: '/admin/users',
      system_monitoring: '/admin/monitoring',
      content_review: '/admin/content',
    };

    if (feature && featurePaths[feature]) {
      targetPath = featurePaths[feature];
    }

    if (typeof window !== 'undefined') {
      window.open(targetPath, '_blank');
    }
  }
}
