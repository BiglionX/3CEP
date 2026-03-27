'use client';

import { DataCenterSidebar } from '@/components/data-center/DataCenterSidebar';
import DataCenterTopbar from '@/components/data-center/DataCenterTopbar';
import { DataCenterUserMenu } from '@/components/data-center/DataCenterUserMenu';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DataCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useUnifiedAuth();

  // 认证检查 - 与 admin 后台保持一致
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/data-center');
    }
  }, [user, isAuthenticated, isLoading, router]);

  // 加载中
  if (isLoading || !user) {
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
      <DataCenterSidebar />

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
