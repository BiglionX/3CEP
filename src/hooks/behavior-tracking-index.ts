/**
 * 用户行为追踪系统入口文件
 * 导出所有相关的Hook和类型定义 */

// 核心Hook
export {
  useClickTracking,
  useFormTracking,
  usePageViewTracking,
  useUserBehaviorTracking,
} from './use-behavior-tracking';

// 类型定义
export type {
  EventType,
  TrackingConfig,
  UserBehaviorEvent,
} from './use-behavior-tracking';
