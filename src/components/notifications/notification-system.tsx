'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  Check,
  Archive,
  Trash2,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Settings,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'unread' | 'read' | 'archived';
  createdAt: Date;
  readAt?: Date;
  scheduledTime?: Date;
  userId: string;
  category: string;
  actionUrl?: string;
  icon?: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  archived: number;
}

const NotificationSystem = () => { // @ts-ignore
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    read: 0,
    archived: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showDropdown, setShowDropdown] = useState(false);

  // 获取通知数据
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/notifications?status=${filter}&category=${categoryFilter}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setNotifications(result.data.notifications);
        setStats(result.data.stats);
      } else {
        throw new Error(result.error || '获取通知失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
      console.error('获取通知失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 更新通知状?
  const updateNotificationStatus = async (
    notificationId: string,
    status: 'read' | 'unread' | 'archived'
  ) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId, status }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // 更新本地状?
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId
              ? {
                  ...notif,
                  status,
                  readAt: status === 'read' ? new Date() : notif.readAt,
                }
              : notif
          )
        );

        // 更新统计信息
        setStats(prev => ({
          ...prev,
          unread: status === 'read' ? prev.unread - 1 : prev.unread,
          read: status === 'read' ? prev.read + 1 : prev.read,
        }));
      }
    } catch (err) {
      console.error('更新通知状态失?', err);
    }
  };

  // 删除通知
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // 从本地状态移?
        setNotifications(prev =>
          prev.filter(notif => notif.id !== notificationId)
        );

        // 更新统计信息
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
        }));
      }
    } catch (err) {
      console.error('删除通知失败:', err);
    }
  };

  // 标记所有为已读
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(
        n => n.status === 'unread'
      );

      // 并行更新所有未读通知
      await Promise.all(
        unreadNotifications.map(notif =>
          updateNotificationStatus(notif.id, 'read')
        )
      );

      // 更新本地状?
      setNotifications(prev =>
        prev.map(notif =>
          notif.status === 'unread'
            ? { ...notif, status: 'read', readAt: new Date() }
            : notif
        )
      );

      setStats(prev => ({
        ...prev,
        unread: 0,
        read: prev.total,
      }));
    } catch (err) {
      console.error('批量标记已读失败:', err);
    }
  };

  // 获取通知图标
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'urgent':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  // 格式化时?
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return '刚刚';
    if (diffMinutes < 60) return `${diffMinutes}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;
    return new Date(date).toLocaleDateString();
  };

  useEffect(() => {
    fetchNotifications();

    // �?0秒轮询一次新通知
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [filter, categoryFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <AlertCircle className="w-6 h-6 mx-auto mb-2" />
        <p>{error}</p>
        <button
          onClick={fetchNotifications}
          className="mt-2 text-sm text-blue-500 hover:text-blue-600"
        >
          重新加载
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white rounded-lg shadow-lg border border-gray-200">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">通知中心</h3>
            {stats.unread > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {stats.unread}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={markAllAsRead}
              disabled={stats.unread === 0}
              className="text-sm text-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              全部已读
            </button>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 筛选器下拉菜单 */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-4 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50"
            >
              <div className="p-2">
                <div className="text-xs text-gray-500 mb-2">状态筛?/div>
                <div className="space-y-1">
                  {[
                    { value: 'all', label: '全部通知' },
                    { value: 'unread', label: '未读通知' },
                    { value: 'read', label: '已读通知' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilter(option.value as any);
                        setShowDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-sm ${
                        filter === option.value
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 通知列表 */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">暂无通知</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map(notification => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${
                  notification.status === 'unread' ? 'bg-blue-50' : ''
                }`}
                onClick={() => {
                  if (notification.status === 'unread') {
                    updateNotificationStatus(notification.id, 'read');
                  }
                  if (notification.actionUrl) {
                    // 这里可以导航到指定页?
                    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('Navigate to:', notification.actionUrl)}
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 pt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-sm font-medium ${
                          notification.status === 'unread'
                            ? 'text-gray-900'
                            : 'text-gray-700'
                        }`}
                      >
                        {notification.title}
                      </h4>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.createdAt)}
                        </span>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p
                      className={`text-sm mt-1 ${
                        notification.status === 'unread'
                          ? 'text-gray-700'
                          : 'text-gray-500'
                      }`}
                    >
                      {notification.content}
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                          notification.priority === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : notification.priority === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : notification.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {notification.priority === 'critical'
                          ? '紧?
                          : notification.priority === 'high'
                            ? '高优先级'
                            : notification.priority === 'medium'
                              ? '中优先级'
                              : '低优先级'}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {notification.category}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 底部 */}
      <div className="p-3 border-t border-gray-200 text-center">
        <button className="text-sm text-blue-500 hover:text-blue-600">
          查看全部通知
        </button>
      </div>
    </div>
  );
};

// 通知徽章组件
export const NotificationBadge = () => { // @ts-ignore
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // 模拟获取未读通知数量
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/notifications?status=unread');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setUnreadCount(result.data.stats.unread);
          }
        }
      } catch (err) {
        console.error('获取未读通知数量失败:', err);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // �?0秒更新一?

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showNotifications && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowNotifications(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 mt-2 z-50"
            >
              <NotificationSystem />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationSystem;
