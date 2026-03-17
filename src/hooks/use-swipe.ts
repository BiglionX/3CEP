/**
 * 滑动手势Hook
 * 基于useGestures的便捷包装
 */

'use client';

import {
  useGestures,
  type GestureEventData,
  type GestureConfig,
} from './use-gestures';

export interface SwipeEventData extends GestureEventData {
  type: 'swipeLeft' | 'swipeRight' | 'swipeUp' | 'swipeDown';
}

export interface SwipeHandlers {
  onSwipeLeft?: (event: SwipeEventData) => void;
  onSwipeRight?: (event: SwipeEventData) => void;
  onSwipeUp?: (event: SwipeEventData) => void;
  onSwipeDown?: (event: SwipeEventData) => void;
}

export interface SwipeOptions extends Partial<GestureConfig> {
  swipeVelocity?: number;
  swipeDistance?: number;
}

/**
 * 滑动手势Hook
 * @param handlers 滑动手势处理器
 * @param options 滑动配置选项
 */
export function useSwipe(
  handlers: SwipeHandlers = {},
  options: SwipeOptions = {}
) {
  return useGestures(handlers, options);
}
