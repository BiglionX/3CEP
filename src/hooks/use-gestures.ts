/**
 * 移动端手势识别Hook
 * 支持常见的触摸手势操? */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// 手势类型定义
export type GestureType =
  | 'tap' // 点击
  | 'doubleTap' // 双击
  | 'longPress' // 长按
  | 'swipeLeft' // 左滑
  | 'swipeRight' // 右滑
  | 'swipeUp' // 上滑
  | 'swipeDown' // 下滑
  | 'pinchIn' // 捏合缩小
  | 'pinchOut' // 捏合放大
  | 'rotate' // 旋转
  | 'pan'; // 拖拽

// 手势配置参数
export interface GestureConfig {
  // 点击相关阈值
  tapThreshold?: number; // 点击判定的最大移动距离(px)
  doubleTapDelay?: number; // 双击间隔时间 (ms)
  longPressDuration?: number; // 长按持续时间 (ms)

  // 滑动手势阈值
  swipeVelocity?: number; // 滑动最小速度 (px/ms)
  swipeDistance?: number; // 滑动最小距离(px)

  // 捏合和旋转阈值
  pinchThreshold?: number; // 捏合最小变化比例
  rotationThreshold?: number; // 旋转最小角度(度)

  // 防抖和节流
  debounceDelay?: number; // 防抖延迟 (ms)
  throttleDelay?: number; // 节流延迟 (ms)
}

// 手势事件数据
export interface GestureEventData {
  type: GestureType;
  x: number;
  y: number;
  deltaX?: number;
  deltaY?: number;
  velocityX?: number;
  velocityY?: number;
  scale?: number;
  rotation?: number;
  touchCount: number;
  timestamp: number;
}

// 手势回调函数类型
export type GestureCallback = (event: GestureEventData) => void;

// 手势处理器配置
export interface GestureHandlers {
  onTap?: GestureCallback;
  onDoubleTap?: GestureCallback;
  onLongPress?: GestureCallback;
  onSwipeLeft?: GestureCallback;
  onSwipeRight?: GestureCallback;
  onSwipeUp?: GestureCallback;
  onSwipeDown?: GestureCallback;
  onPinchIn?: GestureCallback;
  onPinchOut?: GestureCallback;
  onRotate?: GestureCallback;
  onPan?: GestureCallback;
}

// 默认配置
const DEFAULT_CONFIG: Required<GestureConfig> = {
  tapThreshold: 10,
  doubleTapDelay: 300,
  longPressDuration: 500,
  swipeVelocity: 0.3,
  swipeDistance: 50,
  pinchThreshold: 0.1,
  rotationThreshold: 15,
  debounceDelay: 100,
  throttleDelay: 16,
};

// 触摸点信?interface TouchPoint {
  identifier: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  startTime: number;
  lastTime: number;
}

/**
 * 移动端手势识别Hook
 * @param handlers 手势处理回调函数
 * @param config 手势识别配置参数
 * @returns 返回ref和状态信息
 */
export interface UseGesturesReturn<T extends HTMLElement = HTMLElement> {
  ref: React.RefObject<T>;
  isActive: boolean;
  touchCount: number;
}

export function useGestures<T extends HTMLElement = HTMLElement>(
  handlers: GestureHandlers = {},
  config: GestureConfig = {}
): UseGesturesReturn<T> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  // 状态管?  const [isActive, setIsActive] = useState(false);
  const [touchPoints, setTouchPoints] = useState<TouchPoint[]>([]);
  const [isLongPressTriggered, setIsLongPressTriggered] = useState(false);

  // 引用管理
  const elementRef = useRef<T>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const lastTapPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 工具函数
  const getTouchById = useCallback((touches: TouchList, id: number) => {
    for (let i = 0; i < touches.length; i++) {
      if (touches[i].identifier === id) {
        return touches[i];
      }
    }
    return null;
  }, []);

  const calculateDistance = useCallback(
    (x1: number, y1: number, x2: number, y2: number) => {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },
    []
  );

  const calculateAngle = useCallback(
    (x1: number, y1: number, x2: number, y2: number) => {
      return (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    },
    []
  );

  // 手势识别函数
  const recognizeTap = useCallback(
    (point: TouchPoint) => {
      const distance = calculateDistance(
        point.startX,
        point.startY,
        point.lastX,
        point.lastY
      );

      return distance <= mergedConfig.tapThreshold;
    },
    [calculateDistance, mergedConfig.tapThreshold]
  );

  const recognizeDoubleTap = useCallback(
    (point: TouchPoint) => {
      const now = Date.now();
      const timeDiff = now - lastTapTimeRef.current;
      const distance = calculateDistance(
        point.startX,
        point.startY,
        lastTapPositionRef.current.x,
        lastTapPositionRef.current.y
      );

      if (
        timeDiff <= mergedConfig.doubleTapDelay &&
        distance <= mergedConfig.tapThreshold * 2
      ) {
        lastTapTimeRef.current = 0;
        return true;
      }

      lastTapTimeRef.current = now;
      lastTapPositionRef.current = { x: point.startX, y: point.startY };
      return false;
    },
    [calculateDistance, mergedConfig.doubleTapDelay, mergedConfig.tapThreshold]
  );

  const recognizeSwipe = useCallback(
    (point: TouchPoint) => {
      const deltaX = point.lastX - point.startX;
      const deltaY = point.lastY - point.startY;
      const deltaTime = point.lastTime - point.startTime;

      if (deltaTime === 0) return null;

      const velocityX = Math.abs(deltaX / deltaTime);
      const velocityY = Math.abs(deltaY / deltaTime);
      const distanceX = Math.abs(deltaX);
      const distanceY = Math.abs(deltaY);

      // 判断是水平还是垂直滑?      if (distanceX > distanceY) {
        if (
          distanceX >= mergedConfig.swipeDistance &&
          velocityX >= mergedConfig.swipeVelocity
        ) {
          return deltaX > 0 ? 'swipeRight' : 'swipeLeft';
        }
      } else {
        if (
          distanceY >= mergedConfig.swipeDistance &&
          velocityY >= mergedConfig.swipeVelocity
        ) {
          return deltaY > 0 ? 'swipeDown' : 'swipeUp';
        }
      }

      return null;
    },
    [mergedConfig.swipeDistance, mergedConfig.swipeVelocity]
  );

  // 触摸事件处理
  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      setIsActive(true);
      setIsLongPressTriggered(false);

      const newPoints: TouchPoint[] = [];

      for (let i = 0; i < event.changedTouches.length; i++) {
        const touch = event.changedTouches[i];
        const point: TouchPoint = {
          identifier: touch.identifier,
          startX: touch.clientX,
          startY: touch.clientY,
          lastX: touch.clientX,
          lastY: touch.clientY,
          startTime: Date.now(),
          lastTime: Date.now(),
        };
        newPoints.push(point);
      }

      setTouchPoints(prev => [...prev, ...newPoints]);

      // 启动长按定时?      if (newPoints.length === 1) {
        timerRef.current = setTimeout(() => {
          if (handlers.onLongPress && !isLongPressTriggered) {
            const point = newPoints[0];
            handlers.onLongPress({
              type: 'longPress',
              x: point.startX,
              y: point.startY,
              touchCount: 1,
              timestamp: Date.now(),
            });
            setIsLongPressTriggered(true);
          }
        }, mergedConfig.longPressDuration);
      }
    },
    [handlers.onLongPress, isLongPressTriggered, mergedConfig.longPressDuration]
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      event.preventDefault();

      setTouchPoints(prev => {
        const updatedPoints = [...prev];

        for (let i = 0; i < event.changedTouches.length; i++) {
          const touch = event.changedTouches[i];
          const pointIndex = updatedPoints.findIndex(
            p => p.identifier === touch.identifier
          );

          if (pointIndex !== -1) {
            updatedPoints[pointIndex] = {
              ...updatedPoints[pointIndex],
              lastX: touch.clientX,
              lastY: touch.clientY,
              lastTime: Date.now(),
            };
          }
        }

        return updatedPoints;
      });

      // 如果有多点触摸，处理捏合和旋?      if (touchPoints.length === 2 && event.touches.length === 2) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];

        const currentDistance = calculateDistance(
          touch1.clientX,
          touch1.clientY,
          touch2.clientX,
          touch2.clientY
        );

        const initialDistance = calculateDistance(
          touchPoints[0].startX,
          touchPoints[0].startY,
          touchPoints[1].startX,
          touchPoints[1].startY
        );

        const scale = currentDistance / initialDistance;

        // 捏合手势识别
        if (Math.abs(scale - 1) >= mergedConfig.pinchThreshold) {
          const gestureType = scale > 1 ? 'pinchOut' : 'pinchIn';
          const handler =
            gestureType === 'pinchOut'
              ? handlers.onPinchOut
              : handlers.onPinchIn;

          if (handler) {
            handler({
              type: gestureType,
              x: (touch1.clientX + touch2.clientX) / 2,
              y: (touch1.clientY + touch2.clientY) / 2,
              scale: scale,
              touchCount: 2,
              timestamp: Date.now(),
            });
          }
        }

        // 旋转手势识别
        const currentAngle = calculateAngle(
          touch1.clientX,
          touch1.clientY,
          touch2.clientX,
          touch2.clientY
        );

        const initialAngle = calculateAngle(
          touchPoints[0].startX,
          touchPoints[0].startY,
          touchPoints[1].startX,
          touchPoints[1].startY
        );

        const rotation = currentAngle - initialAngle;

        if (Math.abs(rotation) >= mergedConfig.rotationThreshold) {
          if (handlers.onRotate) {
            handlers.onRotate({
              type: 'rotate',
              x: (touch1.clientX + touch2.clientX) / 2,
              y: (touch1.clientY + touch2.clientY) / 2,
              rotation: rotation,
              touchCount: 2,
              timestamp: Date.now(),
            });
          }
        }
      }

      // 拖拽手势
      if (touchPoints.length === 1 && handlers.onPan) {
        const point = touchPoints[0];
        const touch = event.touches[0];

        handlers.onPan({
          type: 'pan',
          x: touch.clientX,
          y: touch.clientY,
          deltaX: touch.clientX - point.startX,
          deltaY: touch.clientY - point.startY,
          touchCount: 1,
          timestamp: Date.now(),
        });
      }
    },
    [
      touchPoints,
      handlers.onPinchIn,
      handlers.onPinchOut,
      handlers.onRotate,
      handlers.onPan,
      calculateDistance,
      calculateAngle,
      mergedConfig.pinchThreshold,
      mergedConfig.rotationThreshold,
    ]
  );

  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      setIsActive(false);

      // 清除长按定时?      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // 处理单点触摸的手?      if (touchPoints.length === 1) {
        const point = touchPoints[0];

        // 点击手势
        if (recognizeTap(point) && !isLongPressTriggered) {
          // 双击检?          if (recognizeDoubleTap(point)) {
            if (handlers.onDoubleTap) {
              handlers.onDoubleTap({
                type: 'doubleTap',
                x: point.startX,
                y: point.startY,
                touchCount: 1,
                timestamp: Date.now(),
              });
            }
          } else {
            // 单击
            if (handlers.onTap) {
              handlers.onTap({
                type: 'tap',
                x: point.startX,
                y: point.startY,
                touchCount: 1,
                timestamp: Date.now(),
              });
            }
          }
        }

        // 滑动手势
        const swipeDirection = recognizeSwipe(point);
        if (swipeDirection) {
          const handlerMap = {
            swipeLeft: handlers.onSwipeLeft,
            swipeRight: handlers.onSwipeRight,
            swipeUp: handlers.onSwipeUp,
            swipeDown: handlers.onSwipeDown,
          };

          const handler = handlerMap[swipeDirection as keyof typeof handlerMap];
          if (handler) {
            handler({
              type: swipeDirection as GestureType,
              x: point.startX,
              y: point.startY,
              deltaX: point.lastX - point.startX,
              deltaY: point.lastY - point.startY,
              velocityX: Math.abs(
                (point.lastX - point.startX) /
                  (point.lastTime - point.startTime)
              ),
              velocityY: Math.abs(
                (point.lastY - point.startY) /
                  (point.lastTime - point.startTime)
              ),
              touchCount: 1,
              timestamp: Date.now(),
            });
          }
        }
      }

      // 清除触摸?      setTouchPoints([]);
      setIsLongPressTriggered(false);
    },
    [
      touchPoints,
      isLongPressTriggered,
      recognizeTap,
      recognizeDoubleTap,
      recognizeSwipe,
      handlers.onTap,
      handlers.onDoubleTap,
      handlers.onSwipeLeft,
      handlers.onSwipeRight,
      handlers.onSwipeUp,
      handlers.onSwipeDown,
    ]
  );

  // 事件绑定
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    ref: elementRef,
    isActive,
    touchCount: touchPoints.length,
  };
}

// 预定义的手势配置
export const GesturePresets = {
  // 快速响应配?  FAST: {
    tapThreshold: 5,
    doubleTapDelay: 200,
    longPressDuration: 300,
    swipeVelocity: 0.5,
    swipeDistance: 30,
  },

  // 精确控制配置
  PRECISE: {
    tapThreshold: 3,
    doubleTapDelay: 400,
    longPressDuration: 800,
    swipeVelocity: 0.2,
    swipeDistance: 80,
  },

  // 宽松容忍配置
  RELAXED: {
    tapThreshold: 15,
    doubleTapDelay: 500,
    longPressDuration: 1000,
    swipeVelocity: 0.1,
    swipeDistance: 20,
  },
};
