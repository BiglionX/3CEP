/**
 * 用户行为追踪系统入口文件
 * 导出所有相关的Hook和类型定? */

// 核心Hook
export {
  useUserBehaviorTracking,
  usePageViewTracking,
  useClickTracking,
  useFormTracking,
} from './use-behavior-tracking';

// 类型定义
export type {
  UserBehaviorEvent,
  EventType,
  TrackingConfig,
} from './use-behavior-tracking';
