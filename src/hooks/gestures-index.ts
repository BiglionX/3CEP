/**
 * 移动端手势支持入口文? * 导出所有相关的Hook和类型定? */

// 核心Hook
export {
  useGestures,
  useSwipe,
  useTap,
  useDoubleTap,
  useLongPress,
  usePinch,
  useRotate,
} from './use-gestures';

// 类型定义
export type {
  GestureType,
  SwipeDirection,
  TouchPoint,
  GestureEventData,
  GestureOptions,
} from './use-gestures';
