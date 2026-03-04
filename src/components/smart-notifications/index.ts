/**
 * 智能通知系统入口文件
 * 导出所有相关的组件和Hook
 */

// 核心管理?export {
  NotificationProvider,
  useNotifications,
  NotificationLevel,
  NotificationType,
  NotificationStatus,
  type Notification,
  type NotificationAction,
  type NotificationFilter,
  type NotificationSettings,
  requestNotificationPermission,
} from './NotificationManager';

// UI组件
export { NotificationList } from './NotificationList';
export {
  NotificationBadge,
  TopNavNotificationBadge,
} from './NotificationBadge';

// 类型定义
export type {
  Notification as NotificationInterface,
  NotificationAction as NotificationActionInterface,
  NotificationFilter as NotificationFilterInterface,
  NotificationSettings as NotificationSettingsInterface,
} from './NotificationManager';
