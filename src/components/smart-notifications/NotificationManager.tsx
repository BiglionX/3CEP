/**
 * 智能通知管理系统
 * 实现分级通知、定时提醒、智能聚合等功能
 */

'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Clock,
  Star,
  Filter,
} from 'lucide-react';

// 通知级别枚举
export enum NotificationLevel {
  LOW = 'low', // 低优先级 - 一般信?  MEDIUM = 'medium', // 中优先级 - 重要提醒
  HIGH = 'high', // 高优先级 - 紧急事?  CRITICAL = 'critical', // 关键优先?- 系统级紧?}

// 通知类型枚举
export enum NotificationType {
  SYSTEM = 'system', // 系统通知
  USER = 'user', // 用户通知
  WORKFLOW = 'workflow', // 工作流通知
  ALERT = 'alert', // 告警通知
  REMINDER = 'reminder', // 提醒通知
}

// 通知状态枚?export enum NotificationStatus {
  UNREAD = 'unread', // 未读
  READ = 'read', // 已读
  ARCHIVED = 'archived', // 已归?  DISMISSED = 'dismissed', // 已忽?}

// 通知接口
export interface Notification {
  id: string;
  type: NotificationType;
  level: NotificationLevel;
  title: string;
  message: string;
  timestamp: Date;
  status: NotificationStatus;
  icon?: React.ReactNode;
  actions?: NotificationAction[];
  metadata?: Record<string, any>;
  expiresAt?: Date; // 过期时间
  scheduledAt?: Date; // 定时发送时?  readAt?: Date; // 阅读时间
  category?: string; // 分类标签
}

// 通知动作接口
export interface NotificationAction {
  id: string;
  label: string;
  handler: () => void | Promise<void>;
  style?: 'primary' | 'secondary' | 'danger';
}

// 通知过滤?export interface NotificationFilter {
  levels?: NotificationLevel[];
  types?: NotificationType[];
  statuses?: NotificationStatus[];
  categories?: string[];
  dateRange?: { start: Date; end: Date };
  searchTerm?: string;
}

// 通知设置
export interface NotificationSettings {
  enableSound: boolean;
  enableDesktop: boolean;
  enableEmail: boolean;
  enablePush: boolean;
  autoArchiveDays: number;
  maxNotifications: number;
  groupSimilar: boolean;
  quietHours: { start: string; end: string } | null;
}

// 上下文类?interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp' | 'status'>
  ) => string;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  archiveNotification: (id: string) => void;
  dismissNotification: (id: string) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  getFilteredNotifications: (filter: NotificationFilter) => Notification[];
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  scheduleNotification: (
    notification: Omit<Notification, 'id' | 'timestamp' | 'status'>,
    delayMs: number
  ) => string;
  groupNotifications: () => Record<string, Notification[]>;
}

// 创建上下?const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// 默认设置
const DEFAULT_SETTINGS: NotificationSettings = {
  enableSound: true,
  enableDesktop: true,
  enableEmail: false,
  enablePush: true,
  autoArchiveDays: 30,
  maxNotifications: 100,
  groupSimilar: true,
  quietHours: null,
};

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] =
    useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [scheduledTimers, setScheduledTimers] = useState<
    Record<string, NodeJS.Timeout>
  >({});

  // 计算未读数量
  const unreadCount = notifications.filter(
    n => n.status === NotificationStatus.UNREAD
  ).length;

  // 添加通知
  const addNotification = useCallback(
    (
      notification: Omit<Notification, 'id' | 'timestamp' | 'status'>
    ): string => {
      const id = uuidv4();
      const newNotification: Notification = {
        ...notification,
        id,
        timestamp: new Date(),
        status: NotificationStatus.UNREAD,
      };

      setNotifications(prev => {
        // 限制最大通知数量
        if (prev.length >= settings.maxNotifications) {
          const oldest = [...prev].sort(
            (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
          )[0];
          return [newNotification, ...prev.filter(n => n.id !== oldest.id)];
        }
        return [newNotification, ...prev];
      });

      // 播放声音提醒
      if (
        settings.enableSound &&
        notification.level !== NotificationLevel.LOW
      ) {
        playNotificationSound(notification.level);
      }

      // 桌面通知
      if (
        settings.enableDesktop &&
        notification.level !== NotificationLevel.LOW
      ) {
        showDesktopNotification(newNotification);
      }

      return id;
    },
    [settings]
  );

  // 定时发送通知
  const scheduleNotification = useCallback(
    (
      notification: Omit<Notification, 'id' | 'timestamp' | 'status'>,
      delayMs: number
    ): string => {
      const id = uuidv4();

      const timer = setTimeout(() => {
        addNotification({
          ...notification,
          scheduledAt: new Date(),
        });

        // 清理定时?        setScheduledTimers(prev => {
          const newTimers = { ...prev };
          delete newTimers[id];
          return newTimers;
        });
      }, delayMs);

      // 存储定时器引?      setScheduledTimers(prev => ({
        ...prev,
        [id]: timer,
      }));

      return id;
    },
    [addNotification]
  );

  // 标记为已?  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id
          ? { ...n, status: NotificationStatus.READ, readAt: new Date() }
          : n
      )
    );
  }, []);

  // 全部标记为已?  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n =>
        n.status === NotificationStatus.UNREAD
          ? { ...n, status: NotificationStatus.READ, readAt: new Date() }
          : n
      )
    );
  }, []);

  // 归档通知
  const archiveNotification = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, status: NotificationStatus.ARCHIVED } : n
      )
    );
  }, []);

  // 忽略通知
  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, status: NotificationStatus.DISMISSED } : n
      )
    );
  }, []);

  // 删除通知
  const removeNotification = useCallback(
    (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));

      // 如果是定时通知，清理定时器
      if (scheduledTimers[id]) {
        clearTimeout(scheduledTimers[id]);
        setScheduledTimers(prev => {
          const newTimers = { ...prev };
          delete newTimers[id];
          return newTimers;
        });
      }
    },
    [scheduledTimers]
  );

  // 清空所有通知
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    // 清理所有定时器
    Object.values(scheduledTimers).forEach(timer => clearTimeout(timer));
    setScheduledTimers({});
  }, [scheduledTimers]);

  // 过滤通知
  const getFilteredNotifications = useCallback(
    (filter: NotificationFilter): Notification[] => {
      return notifications.filter(notification => {
        // 级别过滤
        if (filter.levels && !filter.levels.includes(notification.level)) {
          return false;
        }

        // 类型过滤
        if (filter.types && !filter.types.includes(notification.type)) {
          return false;
        }

        // 状态过?        if (filter.statuses && !filter.statuses.includes(notification.status)) {
          return false;
        }

        // 分类过滤
        if (
          filter.categories &&
          notification.category &&
          !filter.categories.includes(notification.category)
        ) {
          return false;
        }

        // 时间范围过滤
        if (filter.dateRange) {
          if (
            notification.timestamp < filter.dateRange.start ||
            notification.timestamp > filter.dateRange.end
          ) {
            return false;
          }
        }

        // 搜索过滤
        if (filter.searchTerm) {
          const term = filter.searchTerm.toLowerCase();
          if (
            !notification.title.toLowerCase().includes(term) &&
            !notification.message.toLowerCase().includes(term)
          ) {
            return false;
          }
        }

        return true;
      });
    },
    [notifications]
  );

  // 更新设置
  const updateSettings = useCallback(
    (newSettings: Partial<NotificationSettings>) => {
      setSettings(prev => ({ ...prev, ...newSettings }));
    },
    []
  );

  // 智能分组
  const groupNotifications = useCallback((): Record<string, Notification[]> => {
    if (!settings.groupSimilar) {
      return { all: notifications };
    }

    const groups: Record<string, Notification[]> = {};

    notifications.forEach(notification => {
      const groupKey = notification.category || notification.type;
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });

    return groups;
  }, [notifications, settings.groupSimilar]);

  // 自动归档过期通知
  useEffect(() => {
    const interval = setInterval(() => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - settings.autoArchiveDays);

      setNotifications(prev =>
        prev.map(n =>
          n.timestamp < cutoffDate && n.status === NotificationStatus.READ
            ? { ...n, status: NotificationStatus.ARCHIVED }
            : n
        )
      );
    }, 60000); // 每分钟检查一?
    return () => clearInterval(interval);
  }, [settings.autoArchiveDays]);

  // 清理组件时清除所有定时器
  useEffect(() => {
    return () => {
      Object.values(scheduledTimers).forEach(timer => clearTimeout(timer));
    };
  }, [scheduledTimers]);

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    settings,
    addNotification,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    dismissNotification,
    removeNotification,
    clearAllNotifications,
    getFilteredNotifications,
    updateSettings,
    scheduleNotification,
    groupNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

// Hook函数
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within NotificationProvider'
    );
  }
  return context;
}

// 辅助函数
function playNotificationSound(level: NotificationLevel) {
  try {
    const audioContext = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // 根据级别调整音调
    const frequencies = {
      [NotificationLevel.LOW]: 440,
      [NotificationLevel.MEDIUM]: 523,
      [NotificationLevel.HIGH]: 659,
      [NotificationLevel.CRITICAL]: 784,
    };

    oscillator.frequency.setValueAtTime(
      frequencies[level],
      audioContext.currentTime
    );
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.warn('无法播放通知声音:', error);
  }
}

function showDesktopNotification(notification: Notification) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
    });
  }
}

// 请求桌面通知权限
export async function requestNotificationPermission() {
  if ('Notification' in window) {
    return await Notification.requestPermission();
  }
  return 'denied';
}
