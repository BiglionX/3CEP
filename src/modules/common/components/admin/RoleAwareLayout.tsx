/**
 * 角色感知的管理布局组件
 * 整合侧边栏、顶部栏和主要内容区域
 */

'use client';

import { RoleAwareSidebar } from '@/components/admin/RoleAwareSidebar';
import { RoleAwareTopbar } from '@/components/admin/RoleAwareTopbar';
import { usePermission } from '@/hooks/use-permission';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RoleAwareLayoutProps {
  children: React.ReactNode;
}

export default function RoleAwareLayout({ children }: RoleAwareLayoutProps) {
  const { isAuthenticated, loading } = usePermission();
  const router = useRouter();

  // 认证检查
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?redirect=/admin');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 角色感知侧边栏 */}
      <RoleAwareSidebar />

      {/* 主内容区域 */}
      <div className="lg:pl-64">
        {/* 角色感知顶部栏 */}
        <RoleAwareTopbar />

        {/* 页面内容 */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
