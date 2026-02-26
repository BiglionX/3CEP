"use client";

import { useState, useEffect } from "react";
import React from "react";

interface PermissionCheckResult {
  hasPermission: boolean;
  loading: boolean;
  error?: string;
}

interface User {
  id: string;
  email: string;
  roles: string[];
  isLoading: boolean;
}

// Mock useUser hook since the real one isn't available
function useUser(): User {
  return {
    id: 'mock-user-id',
    email: 'user@example.com',
    roles: ['admin'],
    isLoading: false
  };
}

/**
 * 企业专用权限检查 Hook
 * 基于 RBAC 权限体系扩展企业相关权限
 */
export function useEnterprisePermission() {
  const user = useUser();
  const { roles, isLoading } = user;
  const [permissionsState, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // 企业专用权限配置
  const enterprisePermissions = {
    // 有奖问答管理权限
    'enterprise_reward_qa_view': ['admin', 'manager', 'content_manager'],
    'enterprise_reward_qa_create': ['admin', 'manager', 'content_manager'],
    'enterprise_reward_qa_manage': ['admin', 'manager'],
    'enterprise_reward_qa_approve': ['admin', 'manager'],
    
    // 新品众筹管理权限
    'enterprise_crowdfunding_view': ['admin', 'manager', 'procurement_specialist'],
    'enterprise_crowdfunding_create': ['admin', 'manager', 'procurement_specialist'],
    'enterprise_crowdfunding_manage': ['admin', 'manager'],
    'enterprise_crowdfunding_approve': ['admin', 'manager'],
    
    // 企业资料管理权限
    'enterprise_documents_view': ['admin', 'manager', 'content_manager'],
    'enterprise_documents_upload': ['admin', 'manager', 'content_manager'],
    'enterprise_documents_manage': ['admin', 'manager'],
    'enterprise_documents_approve': ['admin', 'manager'],
    
    // 文件存储权限
    'enterprise_file_upload': ['admin', 'manager', 'content_manager', 'procurement_specialist'],
    'enterprise_file_manage': ['admin', 'manager'],
    'enterprise_file_delete': ['admin', 'manager'],
    
    // 企业数据访问权限
    'enterprise_data_view': ['admin', 'manager'],
    'enterprise_data_export': ['admin', 'manager'],
    'enterprise_data_analytics': ['admin', 'manager']
  };

  useEffect(() => {
    if (isLoading) return;

    const checkPermissions = () => {
      const userPermissions: Record<string, boolean> = {};
      
      // 超级管理员拥有所有权限
      if (roles.includes('admin')) {
        Object.keys(enterprisePermissions).forEach(perm => {
          userPermissions[perm] = true;
        });
        setPermissions(userPermissions);
        setLoading(false);
        return;
      }
      
      // 检查每个权限
      Object.entries(enterprisePermissions).forEach(([permission, allowedRoles]) => {
        userPermissions[permission] = roles.some((role: string) => allowedRoles.includes(role));
      });
      
      setPermissions(userPermissions);
      setLoading(false);
    };

    checkPermissions();
  }, [user, roles, isLoading]);

  /**
   * 检查单个权限
   */
  const hasPermission = (permission: string): PermissionCheckResult => {
    if (isLoading || loading) {
      return { hasPermission: false, loading: true };
    }
    
    if (!user) {
      return { hasPermission: false, loading: false, error: '用户未登录' };
    }
    
    const hasPerm = permissionsState[permission] ?? false;
    return { hasPermission: hasPerm, loading: false };
  };

  /**
   * 检查多个权限（任一满足）
   */
  const hasAnyPermission = (...permissions: string[]): PermissionCheckResult => {
    if (isLoading || loading) {
      return { hasPermission: false, loading: true };
    }
    
    if (!user) {
      return { hasPermission: false, loading: false, error: '用户未登录' };
    }
    
    const hasPerm = permissions.some(perm => permissionsState[perm]);
    return { hasPermission: hasPerm, loading: false };
  };

  /**
   * 检查多个权限（全部满足）
   */
  const hasAllPermissions = (...permissions: string[]): PermissionCheckResult => {
    if (isLoading || loading) {
      return { hasPermission: false, loading: true };
    }
    
    if (!user) {
      return { hasPermission: false, loading: false, error: '用户未登录' };
    }
    
    const hasPerm = permissions.every(perm => permissionsState[perm]);
    return { hasPermission: hasPerm, loading: false };
  };

  /**
   * 获取用户可访问的所有企业功能
   */
  const getAccessibleFeatures = (): string[] => {
    if (isLoading || loading) return [];
    
    return Object.entries(permissionsState)
      .filter(([_, hasAccess]) => hasAccess)
      .map(([permission]) => permission);
  };

  /**
   * 检查是否为企业管理员
   */
  const isEnterpriseAdmin = (): boolean => {
    return roles.includes('admin') || roles.includes('manager');
  };

  /**
   * 检查是否为内容管理者
   */
  const isContentManager = (): boolean => {
    return roles.includes('content_manager') || isEnterpriseAdmin();
  };

  /**
   * 检查是否为采购专员
   */
  const isProcurementSpecialist = (): boolean => {
    return roles.includes('procurement_specialist') || isEnterpriseAdmin();
  };

  return {
    // 权限检查方法
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // 角色检查方法
    isEnterpriseAdmin,
    isContentManager,
    isProcurementSpecialist,
    
    // 辅助方法
    getAccessibleFeatures,
    permissions: permissionsState,
    loading: isLoading || loading
  };
}

/**
 * 权限保护高阶组件
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: string,
  fallback?: React.ReactNode
) {
  return function PermissionProtectedComponent(props: P) {
    const { hasPermission, loading } = useEnterprisePermission();
    const permissionCheck = hasPermission(requiredPermission);
    
    if (loading || permissionCheck.loading) {
      return React.createElement('div', { className: 'flex items-center justify-center min-h-screen' },
        React.createElement('div', { className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500' })
      );
    }
    
    if (!permissionCheck.hasPermission) {
      return (
        fallback || 
        React.createElement('div', { className: 'flex items-center justify-center min-h-screen' },
          React.createElement('div', { className: 'text-center' },
            React.createElement('div', { className: 'w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4' },
              React.createElement('svg', { 
                className: 'w-8 h-8 text-red-600', 
                fill: 'none', 
                stroke: 'currentColor', 
                viewBox: '0 0 24 24' 
              },
                React.createElement('path', { 
                  strokeLinecap: 'round', 
                  strokeLinejoin: 'round', 
                  strokeWidth: '2', 
                  d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' 
                })
              )
            ),
            React.createElement('h2', { className: 'text-xl font-bold text-gray-900 mb-2' }, '权限不足'),
            React.createElement('p', { className: 'text-gray-600' }, '您没有访问此功能的权限')
          )
        )
      );
    }
    
    return React.createElement(Component, props);
  };
}