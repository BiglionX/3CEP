'use client';

import { useState } from 'react';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import { Button } from '@/components/ui/button';
import { User, LogOut, Settings, ChevronDown, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthControlsProps {
  variant?: 'navbar' | 'sidebar' | 'compact';
  showLabels?: boolean;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

export function AuthControls({
  variant = 'navbar',
  showLabels = true,
  onLoginClick,
  onRegisterClick,
}: AuthControlsProps) {
  const { user, isAuthenticated, is_admin, logout, isLoading } =
    useUnifiedAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
      // 可以添加登出后的回调
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      window.location.href = '/login';
    }
  };

  const handleRegisterClick = () => {
    if (onRegisterClick) {
      onRegisterClick();
    } else {
      window.location.href = '/register';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`${variant === 'navbar' ? 'flex items-center space-x-2' : ''}`}
      >
        <div className="animate-pulse flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          {showLabels && <div className="w-16 h-4 bg-gray-200 rounded"></div>}
        </div>
      </div>
    );
  }

  // Logged in state
  if (isAuthenticated && user) {
    return (
      <div className={`${variant === 'navbar' ? 'relative' : ''}`}>
        <div
          className={`flex items-center ${
            variant === 'navbar'
              ? 'space-x-3'
              : variant === 'sidebar'
                ? 'space-x-3 flex-col items-start'
                : 'space-x-2'
          }`}
        >
          {/* 用户头像 */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`
                flex items-center space-x-2 rounded-full p-1 transition-all
                ${variant === 'navbar' ? 'hover:bg-gray-100' : ''}
                ${userMenuOpen ? 'bg-gray-100' : ''}
              `}
              aria-haspopup="true"
              aria-expanded={userMenuOpen}
            >
              <div
                className={`
                w-8 h-8 rounded-full flex items-center justify-center text-white font-medium
                ${is_admin ? 'bg-red-500' : 'bg-blue-500'}
              `}
              >
                {user?.charAt(0).toUpperCase() || 'U'}
              </div>

              {showLabels && (
                <span className="hidden md:inline text-sm font-medium text-gray-700">
                  {user.email}
                </span>
              )}

              {variant === 'navbar' && (
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              )}
            </button>

            {/* 用户菜单下拉 */}
            <AnimatePresence>
              {userMenuOpen && variant === 'navbar' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                >
                  {/* 用户信息 */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      {is_admin ? '管理员' : '普通用户'}
                    </p>
                  </div>

                  {/* 菜单项 */}
                  <div className="py-1">
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3" />
                      个人资料
                    </Link>

                    <Link
                      href="/profile/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      账户设置
                    </Link>

                    {is_admin && (
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Menu className="w-4 h-4 mr-3" />
                        管理后台
                      </Link>
                    )}
                  </div>

                  {/* 登出按钮 */}
                  <div className="border-t border-gray-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      退出登录                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 移动端用户菜单 */}
          {userMenuOpen && variant === 'navbar' && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setUserMenuOpen(false)}
            />
          )}
        </div>
      </div>
    );
  }

  // 未登录状态
  return (
    <div
      className={`flex items-center ${
        variant === 'navbar'
          ? 'space-x-2 md:space-x-3'
          : variant === 'sidebar'
            ? 'space-x-3 flex-col items-start'
            : 'space-x-2'
      }`}
    >
      <Button
        variant="outline"
        size={variant === 'compact' ? 'sm' : 'default'}
        onClick={handleLoginClick}
        className={`
          ${variant === 'navbar' ? 'h-8 md:h-9 text-sm' : ''}
          ${variant === 'sidebar' ? 'w-full justify-start' : ''}
        `}
      >
        {showLabels ? '登录' : <LogOut className="w-4 h-4" />}
      </Button>

      <Button
        size={variant === 'compact' ? 'sm' : 'default'}
        onClick={handleRegisterClick}
        className={`
          ${variant === 'navbar' ? 'h-8 md:h-9 text-sm' : ''}
          ${variant === 'sidebar' ? 'w-full justify-start' : ''}
        `}
      >
        {showLabels ? '免费注册' : <User className="w-4 h-4" />}
      </Button>
    </div>
  );
}

// 专门用于导航栏的认证控件
export function NavbarAuthControls(props: Omit<AuthControlsProps, 'variant'>) {
  return <AuthControls variant="navbar" {...props} />;
}

// 专门用于侧边栏的认证控件
export function SidebarAuthControls(props: Omit<AuthControlsProps, 'variant'>) {
  return <AuthControls variant="sidebar" showLabels={true} {...props} />;
}

// 紧凑版本的认证控件
export function CompactAuthControls(
  props: Omit<AuthControlsProps, 'variant' | 'showLabels'>
) {
  return <AuthControls variant="compact" showLabels={false} {...props} />;
}
