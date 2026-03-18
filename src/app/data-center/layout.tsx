'use client';

import { DataCenterSidebar } from '@/components/data-center/DataCenterSidebar';
import { DataCenterUserMenu } from '@/components/data-center/DataCenterUserMenu';
import { useRbacPermission } from '@/hooks/use-rbac-permission';

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

export default function DataCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { hasPermission } = useRbacPermission() as unknown as RbacPermissionResult;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 侧边栏 */}
      <DataCenterSidebar hasPermission={hasPermission} />

      {/* 主内容区 */}
      <main className="flex-1 lg:ml-0">
        {/* 顶部导航栏 */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex-1"></div>
              <div className="flex items-center space-x-4 ml-auto">
                <DataCenterUserMenu />
              </div>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
