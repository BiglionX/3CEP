/**
 * 角色感知的管理布局组件
 * 整合侧边栏、顶部栏和主要内容区域
 */

'use client';

import AdminTopbar from '@/components/admin/AdminTopbar';
import { RoleAwareSidebar } from '@/components/admin/RoleAwareSidebar';
import { RoleAwareTopbar } from '@/components/admin/RoleAwareTopbar';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RoleAwareLayoutProps {
  children: React.ReactNode;
}

export default function RoleAwareLayout({ children }: RoleAwareLayoutProps) {
  const { isAuthenticated, isLoading } = useUnifiedAuth();
  const router = useRouter();

  // 认证检查
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在验证身份...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">访问受限</h1>
          <p className="text-gray-600 mb-6">请先登录管理员账户</p>
          <button
            onClick={() => router.push('/login?redirect=/admin/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            前往登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50" data-disable-unified-layout>
      {/* Admin 专用模块导航 - 固定在页面最顶部，横跨整个屏幕 */}
      <div className="fixed top-0 left-0 right-0 z-50 w-full">
        <AdminTopbar />
      </div>

      {/* 角色感知侧边栏 - 从顶部导航条下方开始 */}
      <RoleAwareSidebar />

      {/* 主内容区域 - 使用 flex-1 让内容区域占据剩余空间 */}
      <div className="flex-1 flex flex-col">
        {/* 角色感知顶部栏 - 标题和用户功能 */}
        <RoleAwareTopbar />

        {/* 页面内容 */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
