'use client';

import { useState, useEffect } from 'react';
import React from 'react';

interface PermissionCheckResult {
  hasPermission: boolean;
  loading: boolean;
  error: string;
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
    isLoading: false,
  };
}

/**
 * 佷笟涓撶敤鏉冮檺妫€Hook
 * 鍩轰簬 RBAC 鏉冮檺浣撶郴鎵╁睍佷笟鐩稿叧鏉冮檺
 */
export function useEnterprisePermission() {
  const user = useUser();
  const { roles, isLoading } = user;
  const [permissionsState, setPermissions] = useState<Record<string, boolean>>(
    {}
  );
  const [loading, setLoading] = useState(true);

  // 佷笟涓撶敤鏉冮檺閰嶇疆
  const enterprisePermissions = {
    // 鏈夊闂瓟绠＄悊鏉冮檺
    enterprise_reward_qa_view: ['admin', 'manager', 'content_manager'],
    enterprise_reward_qa_create: ['admin', 'manager', 'content_manager'],
    enterprise_reward_qa_manage: ['admin', 'manager'],
    enterprise_reward_qa_approve: ['admin', 'manager'],

    // 鏂板搧楃绠＄悊鏉冮檺
    enterprise_crowdfunding_view: [
      'admin',
      'manager',
      'procurement_specialist',
    ],
    enterprise_crowdfunding_create: [
      'admin',
      'manager',
      'procurement_specialist',
    ],
    enterprise_crowdfunding_manage: ['admin', 'manager'],
    enterprise_crowdfunding_approve: ['admin', 'manager'],

    // 佷笟璧勬枡绠＄悊鏉冮檺
    enterprise_documents_view: ['admin', 'manager', 'content_manager'],
    enterprise_documents_upload: ['admin', 'manager', 'content_manager'],
    enterprise_documents_manage: ['admin', 'manager'],
    enterprise_documents_approve: ['admin', 'manager'],

    // 鏂囦欢瀛樺偍鏉冮檺
    enterprise_file_upload: [
      'admin',
      'manager',
      'content_manager',
      'procurement_specialist',
    ],
    enterprise_file_manage: ['admin', 'manager'],
    enterprise_file_delete: ['admin', 'manager'],

    // 佷笟鏁版嵁璁块棶鏉冮檺
    enterprise_data_view: ['admin', 'manager'],
    enterprise_data_export: ['admin', 'manager'],
    enterprise_data_analytics: ['admin', 'manager'],
  };

  useEffect(() => {
    if (isLoading) return;

    const checkPermissions = () => {
      const userPermissions: Record<string, boolean> = {};

      // 瓒呯骇绠＄悊鍛樻嫢鏈夋墍鏈夋潈      if (roles.includes('admin')) {
        Object.keys(enterprisePermissions).forEach(perm => {
          userPermissions[perm] = true;
        });
        setPermissions(userPermissions);
        setLoading(false);
        return;
      }

      // 妫€鏌ユ瘡涓潈      Object.entries(enterprisePermissions).forEach(
        ([permission, allowedRoles]) => {
          userPermissions[permission] = roles.some((role: string) =>
            allowedRoles.includes(role)
          );
        }
      );

      setPermissions(userPermissions);
      setLoading(false);
    };

    checkPermissions();
  }, [user, roles, isLoading]);

  /**
   * 妫€鏌ュ崟涓潈   */
  const hasPermission = (permission: string): PermissionCheckResult => {
    if (isLoading || loading) {
      return { hasPermission: false, loading: true };
    }

    if (!user) {
      return { hasPermission: false, loading: false, error: '鐢ㄦ埛鏈櫥 };
    }

    const hasPerm = permissionsState[permission]  false;
    return { hasPermission: hasPerm, loading: false };
  };

  /**
   * 妫€鏌ュ涓潈闄愶紙讳竴婊¤冻   */
  const hasAnyPermission = (
    ...permissions: string[]
  ): PermissionCheckResult => {
    if (isLoading || loading) {
      return { hasPermission: false, loading: true };
    }

    if (!user) {
      return { hasPermission: false, loading: false, error: '鐢ㄦ埛鏈櫥 };
    }

    const hasPerm = permissions.some(perm => permissionsState[perm]);
    return { hasPermission: hasPerm, loading: false };
  };

  /**
   * 妫€鏌ュ涓潈闄愶紙鍏ㄩ儴婊¤冻   */
  const hasAllPermissions = (
    ...permissions: string[]
  ): PermissionCheckResult => {
    if (isLoading || loading) {
      return { hasPermission: false, loading: true };
    }

    if (!user) {
      return { hasPermission: false, loading: false, error: '鐢ㄦ埛鏈櫥 };
    }

    const hasPerm = permissions.every(perm => permissionsState[perm]);
    return { hasPermission: hasPerm, loading: false };
  };

  /**
   * 鑾峰彇鐢ㄦ埛鍙闂殑鎵€鏈変紒涓氬姛   */
  const getAccessibleFeatures = (): string[] => {
    if (isLoading || loading) return [];

    return Object.entries(permissionsState)
      .filter(([_, hasAccess]) => hasAccess)
      .map(([permission]) => permission);
  };

  /**
   * 妫€鏌ユ槸鍚︿负佷笟绠＄悊   */
  const isEnterpriseAdmin = (): boolean => {
    return roles.includes('admin') || roles.includes('manager');
  };

  /**
   * 妫€鏌ユ槸鍚︿负鍐呭绠＄悊   */
  const isContentManager = (): boolean => {
    return roles.includes('content_manager') || isEnterpriseAdmin();
  };

  /**
   * 妫€鏌ユ槸鍚︿负閲囪喘涓撳憳
   */
  const isProcurementSpecialist = (): boolean => {
    return roles.includes('procurement_specialist') || isEnterpriseAdmin();
  };

  return {
    // 鏉冮檺妫€鏌ユ柟    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // 瑙掕壊妫€鏌ユ柟    isEnterpriseAdmin,
    isContentManager,
    isProcurementSpecialist,

    // 杈呭姪鏂规硶
    getAccessibleFeatures,
    permissions: permissionsState,
    loading: isLoading || loading,
  };
}

/**
 * 鏉冮檺淇濇姢楂橀樁缁勪欢
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: string,
  fallback: React.ReactNode
) {
  return function PermissionProtectedComponent(props: P) {
    const { hasPermission, loading } = useEnterprisePermission();
    const permissionCheck = hasPermission(requiredPermission);

    if (loading || permissionCheck.loading) {
      return React.createElement(
        'div',
        { className: 'flex items-center justify-center min-h-screen' },
        React.createElement('div', {
          className:
            'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500',
        })
      );
    }

    if (!permissionCheck.hasPermission) {
      return (
        fallback ||
        React.createElement(
          'div',
          { className: 'flex items-center justify-center min-h-screen' },
          React.createElement(
            'div',
            { className: 'text-center' },
            React.createElement(
              'div',
              {
                className:
                  'w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4',
              },
              React.createElement(
                'svg',
                {
                  className: 'w-8 h-8 text-red-600',
                  fill: 'none',
                  stroke: 'currentColor',
                  viewBox: '0 0 24 24',
                },
                React.createElement('path', {
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  strokeWidth: '2',
                  d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
                })
              )
            ),
            React.createElement(
              'h2',
              { className: 'text-xl font-bold text-gray-900 mb-2' },
              '鏉冮檺涓嶈冻'
            ),
            React.createElement(
              'p',
              { className: 'text-gray-600' },
              '鎮ㄦ病鏈夎闂鍔熻兘鐨勬潈
            )
          )
        )
      );
    }

    return React.createElement(Component, props);
  };
}

