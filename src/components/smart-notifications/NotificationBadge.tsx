/**
 * 通知徽章组件
 * 显示未读通知数量的小红点
 */

'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Bell, X, XCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications, NotificationLevel } from './NotificationManager';

interface NotificationBadgeProps {
  showCount?: boolean;
  maxCount?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
}

export function NotificationBadge({
  showCount = true,
  maxCount = 99,
  position = 'top-right',
  className = '',
}: NotificationBadgeProps): ReactNode {
  const { unreadCount, notifications, markAsRead, settings, updateSettings } =
    useNotifications();

  const [showDND, setShowDND] = useState(false);

  // 获取最新的几个通知用于预览
  const recentNotifications = notifications
    .filter(n => n.status === 'unread')
    .slice(0, 5);

  // 位置样式
  const positionClasses = {
    'top-right': 'top-0 right-0 translate-x-1/2 -translate-y-1/2',
    'top-left': 'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
    'bottom-right': 'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
    'bottom-left': 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
  };

  // 处理免打扰模式切?  const toggleDND = () => {
    const newDND = !showDND;
    setShowDND(newDND);
    updateSettings({
      enableSound: !newDND,
      enableDesktop: !newDND,
    });
  };

  // 快速标记所有为已读
  const markAllRead = () => {
    notifications
      .filter(n => n.status === 'unread')
      .forEach(n => markAsRead(n.id));
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />

        {/* 未读数量徽章 */}
        {showCount && unreadCount > 0 && (
          <Badge
            className={`
              absolute ${positionClasses[position]} 
              min-w-[18px] h-[18px] rounded-full p-0 text-xs 
              flex items-center justify-center font-normal
              ${unreadCount > 0 ? 'animate-pulse' : ''}
            `}
            variant={unreadCount > 0 ? 'destructive' : 'secondary'}
          >
            {unreadCount > maxCount ? `${maxCount}+` : unreadCount}
          </Badge>
        )}

        {/* 免打扰指示器 */}
        {showDND && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-400 rounded-full border-2 border-white" />
        )}
      </Button>

      {/* 简化的通知预览面板 */}
      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50 hidden group-hover:block">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">通知中心</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllRead}
                  className="h-7 px-2 text-xs"
                >
                  全部已读
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={toggleDND}
              >
                {showDND ? (
                  <X className="h-4 w-4 text-gray-400" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {showDND && (
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
              免打扰模式已开?            </div>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {recentNotifications.length > 0 ? (
            <div className="divide-y">
              {recentNotifications.map(notification => (
                <div
                  key={notification.id}
                  className="p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getLevelIcon(notification.level)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatRelativeTime(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {notifications.filter(n => n.status === 'unread').length > 5 && (
                <div className="p-3 text-center text-sm text-gray-500">
                  还有{' '}
                  {notifications.filter(n => n.status === 'unread').length - 5}{' '}
                  条未读通知
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">暂无新通知</p>
            </div>
          )}
        </div>

        <div className="border-t p-3">
          <Button
            variant="ghost"
            className="w-full text-sm"
            onClick={() => {
              // 这里可以导航到完整的通知页面
            }}
          >
            查看所有通知
          </Button>
        </div>
      </div>
    </div>
  );
}

// 辅助函数
function getLevelIcon(level: NotificationLevel) {
  const iconClasses = 'w-4 h-4';

  switch (level) {
    case NotificationLevel.CRITICAL:
      return <XCircle className={`${iconClasses} text-red-500`} />;
    case NotificationLevel.HIGH:
      return <AlertTriangle className={`${iconClasses} text-orange-500`} />;
    case NotificationLevel.MEDIUM:
      return <Bell className={`${iconClasses} text-yellow-500`} />;
    case NotificationLevel.LOW:
    default:
      return <Info className={`${iconClasses} text-blue-500`} />;
  }
}

function formatRelativeTime(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString();
}

// 导出简化版本用于顶部导航栏
export function TopNavNotificationBadge() {
  return (
    <div className="relative">
      <NotificationBadge showCount={true} maxCount={99} position="top-right" />
    </div>
  );
}
