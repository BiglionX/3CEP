/**
 * 移动端手势支持入口文件
 * 导出所有相关的Hook和类型定义 */

// 核心Hook
export { useGestures, GesturePresets } from './use-gestures';

// 类型定义
export type {
  GestureType,
  GestureConfig,
  GestureEventData,
  GestureCallback,
  GestureHandlers,
  UseGesturesReturn,
} from './use-gestures';

// 便捷Hook - 基于useGestures的简化包装
export { useSwipe } from './use-swipe';
export { useTap } from './use-tap';
export { useDoubleTap } from './use-double-tap';
export { useLongPress } from './use-long-press';
export { usePinch } from './use-pinch';
export { useRotate } from './use-rotate';
