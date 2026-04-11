/**
 * 移动端手势和触控组件? * 提供滑动手势、长按、双击等移动端专属交互功? */

'use client';

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

// 手势识别参数
const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY_THRESHOLD = 0.3;
const LONG_PRESS_DURATION = 500;
const DOUBLE_TAP_DELAY = 300;

// 手势方向枚举
export type SwipeDirection = 'up' | 'down' | 'left' | 'right';
export type PinchDirection = 'in' | 'out';

// 手势事件接口
export interface GestureEvent {
  type: 'swipe' | 'tap' | 'longpress' | 'doubletap' | 'pinch';
  direction?: SwipeDirection | PinchDirection;
  x: number;
  y: number;
  velocity?: number;
  scale?: number;
}

// 手势识别Hook
export interface GestureHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export function useGestureRecognizer(
  onGesture: (event: GestureEvent) => void
): GestureHandlers {
  const [touchStart, setTouchStart] = useState<{
    x: number;
    y: number;
    time: number;
  } | null>(null);
  const [lastTapTime, setLastTapTime] = useState<number>(0);
  const touchStartTimeRef = useRef<number>(0);
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const now = Date.now();

      touchStartTimeRef.current = now;
      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };

      setTouchStart({
        x: touch.clientX,
        y: touch.clientY,
        time: now,
      });

      // 长按检测
      setTimeout(() => {
        const currentTime = Date.now();
        if (touchStartTimeRef.current === now) {
          onGesture({
            type: 'longpress',
            x: touch.clientX,
            y: touch.clientY,
          });
        }
      }, LONG_PRESS_DURATION);
    },
    [onGesture]
  );

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // 取消长按检测
    touchStartTimeRef.current = 0;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const deltaTime = Date.now() - touchStart.time;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocity = distance / deltaTime;

      // 双击检测
      const now = Date.now();
      if (now - lastTapTime < DOUBLE_TAP_DELAY && distance < 20) {
        onGesture({
          type: 'doubletap',
          x: touch.clientX,
          y: touch.clientY,
        });
        setLastTapTime(0);
        setTouchStart(null);
        return;
      }

      // 单击检测
      if (distance < 10 && deltaTime < 200) {
        onGesture({
          type: 'tap',
          x: touch.clientX,
          y: touch.clientY,
        });
        setLastTapTime(now);
        setTouchStart(null);
        return;
      }

      // 滑动检测
      if (distance > SWIPE_THRESHOLD && velocity > SWIPE_VELOCITY_THRESHOLD) {
        let direction: SwipeDirection;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }

        onGesture({
          type: 'swipe',
          direction,
          x: touch.clientX,
          y: touch.clientY,
          velocity,
        });
      }

      setTouchStart(null);
    },
    [touchStart, lastTapTime, onGesture]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}

// 滑动手势容器组件
interface SwipeableContainerProps {
  children: React.ReactNode;
  onSwipe?: (direction: SwipeDirection) => void;
  className?: string;
}

export function SwipeableContainer({
  children,
  onSwipe,
  className = '',
}: SwipeableContainerProps) {
  const handleGesture = useCallback(
    (event: GestureEvent) => {
      if (event.type === 'swipe' && event.direction && onSwipe) {
        // 确保方向是SwipeDirection类型
        const direction = event.direction as SwipeDirection;
        onSwipe(direction);
      }
    },
    [onSwipe]
  );

  const gestureHandlers = useGestureRecognizer(handleGesture);

  return (
    <div {...gestureHandlers} className={`touch-none select-none ${className}`}>
      {children}
    </div>
  );
}

// 触控友好的按钮组
interface TouchButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TouchButton({
  children,
  onPress,
  onLongPress,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
}: TouchButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white',
    ghost: 'bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-700',
  };

  const sizeClasses = {
    sm: 'h-12 min-h-[48px] px-4 text-sm',
    md: 'h-14 min-h-[56px] px-6 text-base',
    lg: 'h-16 min-h-[64px] px-8 text-lg',
  };

  const handlePressIn = () => {
    if (disabled) return;
    setIsPressed(true);

    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        onLongPress();
      }, LONG_PRESS_DURATION);
    }
  };

  const handlePressOut = () => {
    if (disabled) return;
    setIsPressed(false);

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
      onPress();
    }
  };

  const handlePressCancel = () => {
    setIsPressed(false);
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  return (
    <button
      className={`
        flex items-center justify-center rounded-lg font-medium
        transition-all duration-150 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
        ${isPressed ? 'scale-95' : ''}
      `}
      disabled={disabled}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      onTouchCancel={handlePressCancel}
      onMouseDown={handlePressIn}
      onMouseUp={handlePressOut}
      onMouseLeave={handlePressCancel}
    >
      {children}
    </button>
  );
}

// 触控友好的滑块组
interface TouchSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function TouchSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  className = '',
}: TouchSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculateValue = (clientX: number) => {
    if (!sliderRef.current) return value;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(
      0,
      Math.min(1, (clientX - rect.left) / rect.width)
    );
    const rawValue = min + percentage * (max - min);
    return Math.round(rawValue / step) * step;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const newValue = calculateValue(e.touches[0].clientX);
    onChange(newValue);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const newValue = calculateValue(e.touches[0].clientX);
    onChange(newValue);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showValue && <span className="text-sm text-gray-500">{value}</span>}
        </div>
      )}

      <div
        ref={sliderRef}
        className="relative h-8 flex items-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 轨道 */}
        <div className="absolute w-full h-2 bg-gray-200 rounded-full"></div>

        {/* 进度条 */}
        <div
          className="absolute h-2 bg-blue-600 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>

        {/* 滑块 */}
        <div
          className={`
            absolute w-6 h-6 bg-white border-2 border-blue-600 rounded-full
            shadow-lg transform -translate-x-1/2 -translate-y-1/2
            transition-transform ${isDragging ? 'scale-110' : 'scale-100'}
          `}
          style={{ left: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

// 手势指示器组
interface GestureIndicatorProps {
  gesture: GestureEvent | null;
  className?: string;
}

export function GestureIndicator({
  gesture,
  className = '',
}: GestureIndicatorProps) {
  if (!gesture) return null;

  const getGestureIcon = () => {
    switch (gesture.type) {
      case 'swipe':
        switch (gesture.direction) {
          case 'up':
            return <ChevronUp className="w-6 h-6" />;
          case 'down':
            return <ChevronDown className="w-6 h-6" />;
          case 'left':
            return <ChevronLeft className="w-6 h-6" />;
          case 'right':
            return <ChevronRight className="w-6 h-6" />;
        }
      case 'tap':
        return <div className="w-6 h-6 rounded-full bg-blue-500"></div>;
      case 'doubletap':
        return <RefreshCw className="w-6 h-6 animate-spin" />;
      case 'longpress':
        return (
          <div className="w-6 h-6 rounded-full bg-red-500 animate-pulse"></div>
        );
      default:
        return null;
    }
  };

  const getGestureText = () => {
    switch (gesture.type) {
      case 'swipe':
        return `滑动: ${gesture.direction}`;
      case 'tap':
        return '单击';
      case 'doubletap':
        return '双击';
      case 'longpress':
        return '长按';
      default:
        return gesture.type;
    }
  };

  return (
    <div
      className={`
      fixed top-4 left-1/2 transform -translate-x-1/2 z-50
      bg-black bg-opacity-75 text-white px-4 py-2 rounded-full
      flex items-center gap-2 backdrop-blur-sm
      ${className}
    `}
    >
      {getGestureIcon()}
      <span className="text-sm font-medium">{getGestureText()}</span>
    </div>
  );
}

// 触控友好的卡片轮播组
interface TouchCarouselProps {
  items: React.ReactNode[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  showIndicators?: boolean;
  showArrows?: boolean;
  className?: string;
}

export function TouchCarousel({
  items,
  currentIndex,
  onIndexChange,
  showIndicators = true,
  showArrows = true,
  className = '',
}: TouchCarouselProps) {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleGesture = useCallback(
    (event: GestureEvent) => {
      if (event.type === 'swipe') {
        if (event.direction === 'left' && currentIndex < items.length - 1) {
          onIndexChange(currentIndex + 1);
        } else if (event.direction === 'right' && currentIndex > 0) {
          onIndexChange(currentIndex - 1);
        }
      }
    },
    [currentIndex, items.length, onIndexChange]
  );

  const gestureHandlers = useGestureRecognizer(handleGesture);

  const goToSlide = (index: number) => {
    onIndexChange(Math.max(0, Math.min(index, items.length - 1)));
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* 轮播容器 */}
      <div
        ref={containerRef}
        {...gestureHandlers}
        className="relative touch-pan-y"
        style={{
          transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        <div className="flex">
          {items.map((item, index) => (
            <div
              key={index}
              className="w-full flex-shrink-0"
              style={{ width: '100%' }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* 指示器 */}
      {showIndicators && items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`
                w-3 h-3 rounded-full transition-all
                ${
                  index === currentIndex
                    ? 'bg-white scale-125'
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }
              `}
            />
          ))}
        </div>
      )}

      {/* 箭头按钮 */}
      {showArrows && items.length > 1 && (
        <>
          {currentIndex > 0 && (
            <button
              onClick={() => goToSlide(currentIndex - 1)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {currentIndex < items.length - 1 && (
            <button
              onClick={() => goToSlide(currentIndex + 1)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
