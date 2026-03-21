/**
 * 企业服务布局组件
 * 提供统一的权限检查和页面结构
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import { cn } from '@/lib/utils';
import {
  Bell,
  Building,
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  User,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface EnterpriseLayoutProps {
  children: React.ReactNode;
  title?: string;
  showSidebar?: boolean;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  permission?: string;
  children?: NavigationItem[];
}

export function EnterpriseLayout({
  children,
  title = '企业服务门户',
  showSidebar = true,
}: EnterpriseLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, is_admin, isLoading } = useUnifiedAuth();

  // 导航菜单配置
  const navigation: NavigationItem[] = [
    {
      name: '概览',
      href: '/enterprise/dashboard',
      icon: Building,
      permission: 'enterprise_read',
    },
    {
      name: '智能体服务',
      href: '/enterprise/agents',
      icon: Building,
      permission: 'enterprise_agents_read',
      children: [
        {
          name: '定制服务',
          href: '/enterprise/agents/customize',
          icon: Building,
          permission: 'enterprise_agents_read',
        },
        {
          name: '工作台',
          href: '/enterprise/agents/dashboard',
          icon: Building,
          permission: 'enterprise_agents_read',
        },
      ],
    },
    {
      name: '采购服务',
      href: '/enterprise/procurement',
      icon: Building,
      permission: 'enterprise_procurement_read',
      children: [
        {
          name: '采购仪表板',
          href: '/enterprise/procurement/dashboard',
          icon: Building,
          permission: 'enterprise_procurement_read',
        },
        {
          name: '订单管理',
          href: '/enterprise/procurement/orders',
          icon: Building,
          permission: 'enterprise_procurement_manage',
        },
      ],
    },
    {
      name: '管理中心',
      href: '/enterprise/admin',
      icon: Settings,
      permission: 'enterprise_manage',
      children: [
        {
          name: '用户管理',
          href: '/admin/user-manager',
          icon: User,
          permission: 'users_read',
        },
        {
          name: '系统设置',
          href: '/enterprise/admin/settings',
          icon: Settings,
          permission: 'settings_read',
        },
      ],
    },
  ];

  // 检查用户权限
  const checkPermission = (permission?: string): boolean => {
    if (!permission) return true;
    if (is_admin) return true;
    if (!isAuthenticated) return false;

    // 这里可以根据实际的权限系统进行检查
    const userPermissions = [
      'enterprise_read',
      'enterprise_agents_read',
      'enterprise_procurement_read',
      ...(is_admin
        ? [
            'enterprise_manage',
            'enterprise_agents_manage',
            'enterprise_procurement_manage',
          ]
        : []),
    ];

    return userPermissions.includes(permission);
  };

  // 过滤有权限的导航项
  const filteredNavigation = navigation
    .filter(item => checkPermission(item.permission))
    .map(item => ({
      ...item,
      children: item.children?.filter(child =>
        checkPermission(child.permission)
      ),
    }))
    .filter(item => item.children?.length || !item.children);

  // 处理登出
  const handleLogout = async () => {
    try {
      // 清除认证信息
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('temp-admin-access');
      localStorage.removeItem('is-admin');
      localStorage.removeItem('user-role');

      // 重定向到登录页
      router.push('/login');
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-2 text-lg font-semibold text-gray-900">需要登录</h2>
          <p className="mt-1 text-gray-500">请先登录以访问企业服务</p>
          <div className="mt-6">
            <Button onClick={() => router.push('/login')}>登录账户</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 移动端侧边栏遮罩 */}
      {showSidebar && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      {showSidebar && (
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">
                企业服务
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="mt-5 px-2 space-y-1">
            {filteredNavigation.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <Icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    {item.name}
                  </Link>

                  {item.children && item.children.length > 0 && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children.map(child => {
                        const ChildIcon = child.icon;
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            className="group flex items-center px-2 py-1 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          >
                            <ChildIcon className="mr-2 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      )}

      {/* 主内容区 */}
      <div className={cn('flex flex-col', showSidebar && 'lg:pl-64')}>
        {/* 顶部导航栏 */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              {!showSidebar && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden"
                >
                  <Menu className="h-6 w-6" />
                </button>
              )}
              <h1 className="ml-2 text-xl font-semibold text-gray-900">
                {title}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Bell className="h-5 w-5" />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    <User className="h-5 w-5" />
                    <span className="hidden md:inline text-sm">
                      {user?.email || '用户'}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="w-full">
                      <User className="mr-2 h-4 w-4" />
                      个人资料
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      设置
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
