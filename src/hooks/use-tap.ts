/**
 * 点击手势Hook
 * 基于useGestures的便捷包装
 */

'use client';

import {
  useGestures,
  type GestureEventData,
  type GestureConfig,
} from './use-gestures';

export interface TapEventData extends GestureEventData {
  type: 'tap';
}

export interface TapOptions extends Partial<GestureConfig> {
  tapThreshold?: number;
}

/**
 * 点击手势Hook
 * @param onTap 点击处理器
 * @param options 点击配置选项
 */
export function useTap(
  onTap?: (event: TapEventData) => void,
  options: TapOptions = {}
) {
  return useGestures({ onTap }, options);
}
