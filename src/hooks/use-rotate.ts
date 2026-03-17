/**
 * 旋转手势Hook
 * 基于useGestures的便捷包装
 */

'use client';

import {
  useGestures,
  type GestureEventData,
  type GestureConfig,
} from './use-gestures';

export interface RotateEventData extends GestureEventData {
  type: 'rotate';
}

export interface RotateOptions extends Partial<GestureConfig> {
  rotationThreshold?: number;
}

/**
 * 旋转手势Hook
 * @param onRotate 旋转处理器
 * @param options 旋转配置选项
 */
export function useRotate(
  onRotate?: (event: RotateEventData) => void,
  options: RotateOptions = {}
) {
  return useGestures({ onRotate }, options);
}
