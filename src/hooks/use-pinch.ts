/**
 * 捏合手势Hook
 * 基于useGestures的便捷包装
 */

'use client';

import {
  useGestures,
  type GestureEventData,
  type GestureConfig,
} from './use-gestures';

export interface PinchEventData extends GestureEventData {
  type: 'pinchIn' | 'pinchOut';
}

export interface PinchHandlers {
  onPinchIn?: (event: PinchEventData) => void;
  onPinchOut?: (event: PinchEventData) => void;
}

export interface PinchOptions extends Partial<GestureConfig> {
  pinchThreshold?: number;
}

/**
 * 捏合手势Hook
 * @param handlers 捏合处理器
 * @param options 捏合配置选项
 */
export function usePinch(
  handlers: PinchHandlers = {},
  options: PinchOptions = {}
) {
  return useGestures(handlers, options);
}
