/**
 * 长按手势Hook
 * 基于useGestures的便捷包装
 */

'use client';

import {
  useGestures,
  type GestureEventData,
  type GestureConfig,
} from './use-gestures';

export interface LongPressEventData extends GestureEventData {
  type: 'longPress';
}

export interface LongPressOptions extends Partial<GestureConfig> {
  longPressDuration?: number;
  tapThreshold?: number;
}

/**
 * 长按手势Hook
 * @param onLongPress 长按处理器
 * @param options 长按配置选项
 */
export function useLongPress(
  onLongPress?: (event: LongPressEventData) => void,
  options: LongPressOptions = {}
) {
  return useGestures({ onLongPress }, options);
}
