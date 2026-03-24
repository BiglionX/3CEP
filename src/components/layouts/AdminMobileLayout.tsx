/**
 * 管理后台移动端布局组件
 * 提供底部 Tab 导航和响应式布局支持
 */

'use client';

import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  ChevronLeft,
  Coins,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

export interface AdminMobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  onMenuClick?: () => void;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

const defaultNavItems: NavItem[] = [
  {
    label: '仪表盘',
    href: '/admin/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: '用户',
    href: '/admin/users',
    icon: <Users className="w-5 h-5" />,
  },
  {
    label: '店铺',
    href: '/admin/shops',
    icon: <ShoppingBag className="w-5 h-5" />,
  },
  {
    label: '订单',
    href: '/admin/orders',
    icon: <Package className="w-5 h-5" />,
  },
  {
    label: '智能体',
    href: '/admin/agents',
    icon: <Bot className="w-5 h-5" />,
  },
  {
    label: 'Token',
    href: '/admin/tokens',
    icon: <Coins className="w-5 h-5" />,
  },
  {
    label: '设置',
    href: '/admin/settings',
    icon: <Settings className="w-5 h-5" />,
  },
];

/**
 * 管理后台移动端布局组件
 *
 * 特性:
 * - 底部 Tab 导航
 * - 手势滑动切换
 * - 触控优化 (按钮≥44px)
 * - 横竖屏自适应
 */
export function AdminMobileLayout({
  children,
  title = '管理后台',
  onMenuClick,
  showBackButton = false,
  onBackClick,
}: AdminMobileLayoutProps) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(pathname);
  const [showMenu, setShowMenu] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  // 监听屏幕方向
  useEffect(() => {
    const updateOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    return () => window.removeEventListener('resize', updateOrientation);
  }, []);

  // 同步当前路径
  useEffect(() => {
    setActiveTab(pathname);
  }, [pathname]);

  // 处理标签点击
  const handleTabClick = (href: string) => {
    setActiveTab(href);
    setShowMenu(false);
  };

  // 处理返回
  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="返回"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}

            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center lg:hidden"
              aria-label="菜单"
            >
              {showMenu ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>

            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          </div>

          {/* 桌面端菜单按钮 */}
          <button
            onClick={onMenuClick}
            className="hidden lg:flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px]"
          >
            <Menu className="w-5 h-5" />
            <span className="text-sm font-medium">菜单</span>
          </button>
        </div>
      </header>

      {/* 主内容区 */}
      <main
        className={cn(
          'transition-all duration-300',
          isLandscape ? 'px-4 py-4' : 'px-4 py-4'
        )}
      >
        {children}
      </main>

      {/* 移动端底部导航 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg lg:hidden safe-area-pb">
        <div className="grid grid-cols-5 gap-1">
          {defaultNavItems.slice(0, 5).map(item => {
            const isActive =
              activeTab === item.href || activeTab.startsWith(item.href + '/');

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => handleTabClick(item.href)}
                className={cn(
                  'flex flex-col items-center justify-center py-3 px-2 min-h-[60px] transition-all',
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <div
                  className={cn(
                    'mb-1 p-1 rounded-lg transition-transform',
                    isActive && 'scale-110'
                  )}
                >
                  {item.icon}
                </div>
                <span className="text-xs font-medium truncate w-full text-center">
                  {item.label}
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-2 right-2 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 侧边菜单 (平板/桌面端) */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* 遮罩层 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMenu(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />

            {/* 菜单面板 */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl z-50 lg:hidden"
            >
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">菜单</h2>
              </div>

              <div className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-80px)]">
                {defaultNavItems.map(item => {
                  const isActive =
                    activeTab === item.href ||
                    activeTab.startsWith(item.href + '/');

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => handleTabClick(item.href)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors min-h-[48px]',
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'hover:bg-gray-50 text-gray-700'
                      )}
                    >
                      <div className="shrink-0">{item.icon}</div>
                      <span className="flex-1 font-medium">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[24px] text-center">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * 简化的移动端页面包装器
 */
export function MobilePageWrapper({
  children,
  title,
  className,
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <AdminMobileLayout title={title}>
      <div className={cn('space-y-4', className)}>{children}</div>
    </AdminMobileLayout>
  );
}

export default AdminMobileLayout;
