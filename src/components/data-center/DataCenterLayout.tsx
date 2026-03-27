/**
 * 数据中心通用布局组件
 * 为数据中心各子页面提供统一的布局框架
 */

'use client';

import { useUser } from '@/components/providers/AuthProvider';
import { useRbacPermission } from '@/hooks/use-rbac-permission';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DataCenterSidebar } from './DataCenterSidebar';
import DataCenterTopbar from './DataCenterTopbar';
import { DataCenterUserMenu } from './DataCenterUserMenu';

// 定义 RBAC 权限返回类型
interface RbacPermissionResult {
  user: any;
  roles: string[];
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  getAccessibleResources: (category?: string) => string[];
  getPermissionInfo: (permission: string) => any;
  getRoleInfo: (role: string) => any;
  rbacConfig: any;
  isConfigLoaded: boolean;
}

export interface DataCenterLayoutProps {
  children: React.ReactNode;
}

export function DataCenterLayout({ children }: DataCenterLayoutProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useUser();
  const { hasPermission } =
    useRbacPermission() as unknown as RbacPermissionResult;

  // 认证检查 - 与 admin 后台保持一致
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/data-center');
    }
  }, [user, authLoading, router]);

  // 加载中
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在验证身份...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" data-disable-unified-layout>
      {/* 侧边栏 */}
      <DataCenterSidebar hasPermission={hasPermission} />

      {/* 主内容区 */}
      <main className="flex-1 lg:ml-0">
        {/* 顶部导航栏 - 模块快速入口 */}
        <div className="fixed top-0 left-0 right-0 z-50 w-full">
          <DataCenterTopbar />
        </div>

        {/* 用户功能栏 */}
        <header className="bg-white shadow-sm border-b mt-16">
          <div className="max-w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12">
              <div className="flex-1"></div>
              <div className="flex items-center space-x-4 ml-auto">
                <DataCenterUserMenu />
              </div>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <div className="py-6 mt-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
