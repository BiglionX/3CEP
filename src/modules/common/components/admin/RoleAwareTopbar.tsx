/**
 * 角色感知的顶部导航栏组件
 * 显示用户信息、通知和快速操?
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePermission } from '@/hooks/use-permission';
import {
  Bell,
  ChevronDown,
  HelpCircle,
  LogOut,
  Settings,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export function RoleAwareTopbar() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { userInfo, logout } = usePermission();

  // 模拟通知数据
  const notifications = [
    {
      id: 1,
      title: '新用户注?,
      message: '�?个新用户等待审核',
      time: '5分钟?,
      unread: true,
    },
    {
      id: 2,
      title: '内容待审?,
      message: '�?篇新文章需要审?,
      time: '1小时?,
      unread: true,
    },
    {
      id: 3,
      title: '系统更新',
      message: '系统将在今晚12点进行维?,
      time: '2小时?,
      unread: false,
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = () => {
    logout();
    // 这里应该跳转到登录页?
    window.location.href = '/login';
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 左侧标题区域 */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">管理控制?/h1>
            {userInfo && (
              <Badge className="ml-3">{userInfo.roles?.[0] || '访客'}</Badge>
            )}
          </div>

          {/* 右侧功能区域 */}
          <div className="flex items-center space-x-4">
            {/* 通知按钮 */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {/* 通知下拉菜单 */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b">
                    <h3 className="text-sm font-medium text-gray-900">通知</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b last:border-b-0 hover:bg-gray-50 ${
                          notification.unread ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex justify-between">
                          <h4 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {notification.time}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 text-center border-t">
                    <Button variant="link" className="text-sm">
                      查看所有通知
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* 用户菜单 */}
            <div className="relative">
              <Button
                variant="ghost"
                className="flex items-center space-x-2"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <span className="hidden md:inline text-sm font-medium text-gray-700">
                  {userInfo?.email || '未登?}
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>

              {/* 用户下拉菜单 */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-3 border-b">
                    <p className="text-sm font-medium text-gray-900">
                      {userInfo?.email || '未登录用?}
                    </p>
                    <p className="text-xs text-gray-500">
                      {userInfo??.map(role => role).join(', ') ||
                        '访客角色'}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/admin/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3" />
                      个人资料
                    </Link>

                    <Link
                      href="/admin/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      系统设置
                    </Link>

                    <Link
                      href="/admin/help"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <HelpCircle className="w-4 h-4 mr-3" />
                      帮助中心
                    </Link>
                  </div>

                  <div className="border-t py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      退出登?
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 点击外部关闭下拉菜单 */}
      {(userMenuOpen || notificationsOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setUserMenuOpen(false);
            setNotificationsOpen(false);
          }}
        />
      )}
    </header>
  );
}
