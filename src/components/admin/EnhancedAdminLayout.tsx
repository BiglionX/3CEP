'use client';

import { Button } from '@/components/ui/button';
import { AuthService, type UserRole } from '@/lib/auth-service';
import { cn } from '@/lib/utils';
import {
  Activity,
  BookOpen,
  ChevronDown,
  DollarSign,
  FileText,
  Home,
  Key,
  ExternalLink as LinkIcon,
  LogOut,
  Menu,
  Moon,
  Settings,
  Store,
  Sun,
  Users,
  Workflow,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface EnhancedAdminLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  roles: UserRole[];
  children?: NavigationItem[];
}

export default function EnhancedAdminLayout({
  children,
}: EnhancedAdminLayoutProps) {
  const [userRole, setUserRole] = useState<UserRole>('viewer');
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // 初始化暗黑模式
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }

    const loadUserInfo = async () => {
      try {
        const currentUser = await AuthService.getCurrentUser();
        if (currentUser) {
          const role = await AuthService.getUserRole(currentUser.id);
          setUserRole(role);
          setUserEmail(currentUser.email || '');
        }
      } catch (error) {
        console.error('加载用户信息失败:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserInfo();
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      router.push('/login');
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  const navigationItems: NavigationItem[] = [
    {
      name: '仪表板',
      href: '/admin/dashboard',
      roles: [
        'admin',
        'content_reviewer',
        'shop_reviewer',
        'finance',
        'viewer',
      ],
      icon: <Home className="w-5 h-5" />,
    },
    {
      name: '用户管理',
      href: '/admin/users',
      roles: ['admin'],
      icon: <Users className="w-5 h-5" />,
    },
    {
      name: '内容审核',
      href: '/admin/content',
      roles: ['admin', 'content_reviewer'],
      icon: <FileText className="w-5 h-5" />,
    },
    {
      name: '链接审核',
      href: '/admin/links/pending',
      roles: ['admin', 'content_reviewer'],
      icon: <LinkIcon className="w-5 h-5" />,
    },
    {
      name: '教程管理',
      href: '/admin/tutorials',
      roles: ['admin', 'content_reviewer'],
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      name: '店铺管理',
      href: '/admin/shops',
      roles: ['admin', 'shop_reviewer'],
      icon: <Store className="w-5 h-5" />,
      children: [
        {
          name: '待审核店铺',
          href: '/admin/shops/pending',
          roles: ['admin', 'shop_reviewer'],
          icon: <Store className="w-4 h-4" />,
        },
        {
          name: '已审核店铺',
          href: '/admin/shops',
          roles: ['admin', 'shop_reviewer'],
          icon: <Store className="w-4 h-4" />,
        },
      ],
    },
    {
      name: '财务管理',
      href: '/admin/finance',
      roles: ['admin', 'finance'],
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      name: '系统设置',
      href: '/admin/settings',
      roles: ['admin'],
      icon: <Settings className="w-5 h-5" />,
    },
    {
      name: '审计日志',
      href: '/admin/audit-logs',
      roles: ['admin'],
      icon: <FileText className="w-5 h-5" />,
    },
    {
      name: '系统配置',
      href: '/admin/config',
      roles: ['admin'],
      icon: <Settings className="w-5 h-5" />,
    },
    {
      name: '系统监控',
      href: '/admin/monitoring',
      roles: ['admin'],
      icon: <Activity className="w-5 h-5" />,
    },
    {
      name: '性能监控',
      href: '/admin/performance',
      roles: ['admin'],
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      name: 'API配置',
      href: '/admin/api-config',
      roles: ['admin'],
      icon: <Key className="w-5 h-5" />,
    },
    {
      name: '自动化',
      href: '/admin/automation',
      roles: [
        'admin',
        'content_reviewer',
        'shop_reviewer',
        'finance',
        'viewer',
      ],
      icon: <Workflow className="w-5 h-5" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 移动端侧边栏遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <div className="flex items-center">
            <Link
              href="/admin/dashboard"
              className="text-xl font-bold text-foreground"
            >
              FixCycle Admin
            </Link>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="mt-5 px-2">
          <ul className="space-y-1">
            {navigationItems
              .filter(item => item.roles.includes(userRole))
              .map(item => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
          </ul>
        </nav>

        {/* 用户信息 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">
                  {userEmail.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {userEmail}
                </p>
                <p className="text-xs text-muted-foreground">
                  {AuthService.getRoleDisplayName(userRole)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-8 w-8"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="lg:pl-64">
        {/* 顶部导航栏 */}
        <header className="bg-card border-b sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden mr-4"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-semibold text-foreground">
                {navigationItems.find(item => item.href === pathname)?.name ||
                  '管理后台'}
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                aria-label="切换暗黑模式"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </header>

        {/* 面包屑导航 */}
        <div className="border-b bg-muted/30">
          <div className="px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link
                    href="/admin/dashboard"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    首页
                  </Link>
                </li>
                <li>
                  <ChevronDown className="w-4 h-4 rotate-90 text-muted-foreground" />
                </li>
                <li>
                  <span className="text-sm font-medium text-foreground">
                    {navigationItems.find(item => item.href === pathname)
                      ?.name || '当前页面'}
                  </span>
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* 页面内容 */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
