'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRbacPermission } from '@/hooks/use-rbac-permission';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import {
  BarChart3,
  ChevronDown,
  LogOut,
  Settings,
  Shield,
  User,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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

export function DataCenterUserMenu() {
  const router = useRouter();
  const { user } = useUnifiedAuth();
  const { hasPermission, roles } =
    useRbacPermission() as unknown as RbacPermissionResult;
  const [isOpen, setIsOpen] = useState(false);

  // 使用用户的 email，如果没有则显示未登录
  const userEmail = user?.email || undefined;

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center space-x-2 px-3 py-2"
        >
          <User className="h-5 w-5" />
          <span className="hidden sm:inline text-sm">
            {userEmail || '用户'}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* 用户信息 */}
        <div className="px-4 py-3 border-b">
          <p className="text-sm font-medium truncate">
            {userEmail || '未登录用户'}
          </p>
          <p className="text-xs text-muted-foreground">
            {roles?.includes('admin') ? '系统管理员' : '普通用户'}
          </p>
        </div>

        {/* 个人中心 */}
        <DropdownMenuItem
          onClick={() => {
            router.push('/profile');
            setIsOpen(false);
          }}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          <span>个人中心</span>
        </DropdownMenuItem>

        {/* 数据中心仪表盘 */}
        <DropdownMenuItem
          onClick={() => {
            router.push('/data-center');
            setIsOpen(false);
          }}
          className="cursor-pointer"
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          <span>数据中心</span>
        </DropdownMenuItem>

        {/* 管理后台入口 - 仅管理员可见 */}
        {hasPermission('dashboard_read') && (
          <>
            <DropdownMenuItem
              onClick={() => {
                router.push('/admin/dashboard');
                setIsOpen(false);
              }}
              className="cursor-pointer text-blue-600 focus:text-blue-600"
            >
              <Shield className="mr-2 h-4 w-4" />
              <span>管理后台</span>
            </DropdownMenuItem>

            {hasPermission('users_read') && (
              <DropdownMenuItem
                onClick={() => {
                  router.push('/admin/users');
                  setIsOpen(false);
                }}
                className="cursor-pointer pl-8 text-blue-600 focus:text-blue-600"
              >
                <User className="mr-2 h-4 w-4" />
                <span>用户管理</span>
              </DropdownMenuItem>
            )}
          </>
        )}

        {/* 系统设置 */}
        <DropdownMenuItem
          onClick={() => {
            router.push('/settings');
            setIsOpen(false);
          }}
          className="cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>系统设置</span>
        </DropdownMenuItem>

        {/* 分割线 */}
        <div className="border-t my-1" />

        {/* 登出 */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
