/**
 * 双击手势Hook
 * 基于useGestures的便捷包装
 */

'use client';

import {
  useGestures,
  type GestureEventData,
  type GestureConfig,
} from './use-gestures';

export interface DoubleTapEventData extends GestureEventData {
  type: 'doubleTap';
}

export interface DoubleTapOptions extends Partial<GestureConfig> {
  tapThreshold?: number;
  doubleTapDelay?: number;
}

/**
 * 双击手势Hook
 * @param onDoubleTap 双击处理器
 * @param options 双击配置选项
 */
export function useDoubleTap(
  onDoubleTap?: (event: DoubleTapEventData) => void,
  options: DoubleTapOptions = {}
) {
  return useGestures({ onDoubleTap }, options);
}
