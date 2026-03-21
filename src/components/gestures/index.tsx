/**
 * 手势支持组件
 * 提供常用的移动端手势交互组件
 */

'use client';

import {
  GestureEventData,
  GestureType,
  useGestures,
} from '@/hooks/use-gestures';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Hand,
  Maximize2,
  Minimize2,
  Move,
  RotateCw,
} from 'lucide-react';
import { useRef, useState } from 'react';

// 手势可视化反馈组件
interface GestureVisualizerProps {
  gesture?: GestureType;
  eventData?: GestureEventData;
  isVisible?: boolean;
}

function GestureVisualizer({
  gesture,
  eventData,
  isVisible = true,
}: GestureVisualizerProps) {
  if (!isVisible || !gesture) return null;

  const getGestureIcon = () => {
    switch (gesture) {
      case 'swipeLeft':
        return <ChevronLeft className="w-8 h-8" />;
      case 'swipeRight':
        return <ChevronRight className="w-8 h-8" />;
      case 'swipeUp':
        return <ChevronUp className="w-8 h-8" />;
      case 'swipeDown':
        return <ChevronDown className="w-8 h-8" />;
      case 'pinchIn':
        return <Minimize2 className="w-8 h-8" />;
      case 'pinchOut':
        return <Maximize2 className="w-8 h-8" />;
      case 'rotate':
        return <RotateCw className="w-8 h-8" />;
      case 'pan':
        return <Move className="w-8 h-8" />;
      case 'tap':
        return <Hand className="w-8 h-8" />;
      case 'doubleTap':
        return (
          <div className="flex space-x-1">
            <Hand className="w-6 h-6" />
            <Hand className="w-6 h-6" />
          </div>
        );
      case 'longPress':
        return (
          <div className="animate-pulse">
            <Hand className="w-8 h-8" />
          </div>
        );
      default:
        return <Hand className="w-8 h-8" />;
    }
  };

  const getGestureText = () => {
    const textMap: Record<GestureType, string> = {
      tap: '点击',
      doubleTap: '双击',
      longPress: '长按',
      swipeLeft: '左滑',
      swipeRight: '右滑',
      swipeUp: '上滑',
      swipeDown: '下滑',
      pinchIn: '捏合缩小',
      pinchOut: '捏合放大',
      rotate: '旋转',
      pan: '拖拽',
    };
    return textMap[gesture] || gesture;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
    >
      <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center space-y-3">
        <div className="text-white">{getGestureIcon()}</div>
        <div className="text-white font-medium text-lg">{getGestureText()}</div>
        {eventData && (
          <div className="text-gray-300 text-sm space-y-1">
            {eventData.deltaX !== undefined && (
              <div>ΔX: {eventData.deltaX.toFixed(0)}px</div>
            )}
            {eventData.deltaY !== undefined && (
              <div>ΔY: {eventData.deltaY.toFixed(0)}px</div>
            )}
            {eventData.scale !== undefined && (
              <div>缩放: {(eventData.scale * 100).toFixed(0)}%</div>
            )}
            {eventData.rotation !== undefined && (
              <div>旋转: {eventData.rotation.toFixed(0)}°</div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// 可手势操作的图片查看器
interface GestureImageViewerProps {
  src: string;
  alt?: string;
  className?: string;
  showVisualizer?: boolean;
  onGesture?: (gesture: GestureType, data: GestureEventData) => void;
}

export function GestureImageViewer({
  src,
  alt = '',
  className = '',
  showVisualizer = true,
  onGesture,
}: GestureImageViewerProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [lastGesture, setLastGesture] = useState<GestureType | null>(null);
  const [gestureData, setGestureData] = useState<GestureEventData | null>(null);

  const handlers = {
    onPinchIn: (data: GestureEventData) => {
      setScale(prev => Math.max(0.5, prev * 0.9));
      setLastGesture('pinchIn');
      setGestureData(data);
      onGesture?.('pinchIn', data);
    },
    onPinchOut: (data: GestureEventData) => {
      setScale(prev => Math.min(3, prev * 1.1));
      setLastGesture('pinchOut');
      setGestureData(data);
      onGesture?.('pinchOut', data);
    },
    onRotate: (data: GestureEventData) => {
      setRotation(prev => prev + (data.rotation || 0));
      setLastGesture('rotate');
      setGestureData(data);
      onGesture?.('rotate', data);
    },
    onPan: (data: GestureEventData) => {
      if (scale > 1) {
        setPosition(prev => ({
          x: prev.x + (data.deltaX || 0) * 0.5,
          y: prev.y + (data.deltaY || 0) * 0.5,
        }));
      }
      setLastGesture('pan');
      setGestureData(data);
      onGesture?.('pan', data);
    },
    onSwipeLeft: (data: GestureEventData) => {
      setLastGesture('swipeLeft');
      setGestureData(data);
      onGesture?.('swipeLeft', data);
    },
    onSwipeRight: (data: GestureEventData) => {
      setLastGesture('swipeRight');
      setGestureData(data);
      onGesture?.('swipeRight', data);
    },
    onSwipeUp: (data: GestureEventData) => {
      setLastGesture('swipeUp');
      setGestureData(data);
      onGesture?.('swipeUp', data);
    },
    onSwipeDown: (data: GestureEventData) => {
      setLastGesture('swipeDown');
      setGestureData(data);
      onGesture?.('swipeDown', data);
    },
    onTap: (data: GestureEventData) => {
      setLastGesture('tap');
      setGestureData(data);
      onGesture?.('tap', data);
    },
    onDoubleTap: (data: GestureEventData) => {
      setScale(prev => (prev === 1 ? 2 : 1));
      setLastGesture('doubleTap');
      setGestureData(data);
      onGesture?.('doubleTap', data);
    },
  };

  const { ref: imageRef } = useGestures<HTMLDivElement>(handlers);

  // 重置手势
  const resetGestures = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="relative">
      <div
        ref={imageRef as any}
        className={`overflow-hidden cursor-grab active:cursor-grabbing ${className}`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      >
        <motion.img
          src={src}
          alt={alt}
          className="w-full h-auto select-none"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
          }}
          drag={scale > 1}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          onDragEnd={(_, info) => {
            setPosition(prev => ({
              x: prev.x + info.offset.x,
              y: prev.y + info.offset.y,
            }));
          }}
          whileTap={{ cursor: 'grabbing' }}
        />
      </div>

      {/* 控制按钮 */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <button
          onClick={resetGestures}
          className="bg-white/80 hover:bg-white rounded-full p-2 shadow-lg backdrop-blur-sm transition-all"
          aria-label="重置视图"
        >
          <RotateCw className="w-5 h-5" />
        </button>
      </div>

      {/* 手势可视化反馈 */}
      <AnimatePresence>
        {showVisualizer && lastGesture && (
          <GestureVisualizer
            gesture={lastGesture}
            eventData={gestureData ?? undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// 手势操作卡片
interface GestureCardProps {
  children: React.ReactNode;
  className?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  showVisualizer?: boolean;
}

export function GestureCard({
  children,
  className = '',
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  onDoubleTap,
  onLongPress,
  showVisualizer = true,
}: GestureCardProps) {
  const [lastGesture, setLastGesture] = useState<GestureType | null>(null);
  const [gestureData, setGestureData] = useState<GestureEventData | null>(null);

  const handlers = {
    onSwipeLeft: (data: GestureEventData) => {
      setLastGesture('swipeLeft');
      setGestureData(data);
      onSwipeLeft?.();
    },
    onSwipeRight: (data: GestureEventData) => {
      setLastGesture('swipeRight');
      setGestureData(data);
      onSwipeRight?.();
    },
    onSwipeUp: (data: GestureEventData) => {
      setLastGesture('swipeUp');
      setGestureData(data);
      onSwipeUp?.();
    },
    onSwipeDown: (data: GestureEventData) => {
      setLastGesture('swipeDown');
      setGestureData(data);
      onSwipeDown?.();
    },
    onTap: (data: GestureEventData) => {
      setLastGesture('tap');
      setGestureData(data);
      onTap?.();
    },
    onDoubleTap: (data: GestureEventData) => {
      setLastGesture('doubleTap');
      setGestureData(data);
      onDoubleTap?.();
    },
    onLongPress: (data: GestureEventData) => {
      setLastGesture('longPress');
      setGestureData(data);
      onLongPress?.();
    },
  };

  const { ref: cardRef } = useGestures<HTMLDivElement>(handlers);

  return (
    <div ref={cardRef as any} className={`relative ${className}`}>
      {children}

      <AnimatePresence>
        {showVisualizer && lastGesture && (
          <GestureVisualizer
            gesture={lastGesture}
            eventData={gestureData ?? undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// 手势画布组件
interface GestureCanvasProps {
  width?: number;
  height?: number;
  strokeWidth?: number;
  strokeColor?: string;
  backgroundColor?: string;
  onDrawStart?: () => void;
  onDrawEnd?: () => void;
  onClear?: () => void;
}

export function GestureCanvas({
  width = 300,
  height = 300,
  strokeWidth = 3,
  strokeColor = '#3b82f6',
  backgroundColor = '#f8fafc',
  onDrawStart,
  onDrawEnd,
  onClear,
}: GestureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const startDrawing = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawingRef.current = true;
    lastPointRef.current = { x, y };
    ctx.beginPath();
    ctx.moveTo(x, y);

    onDrawStart?.();
  };

  const draw = (x: number, y: number) => {
    if (!isDrawingRef.current || !lastPointRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.strokeStyle = strokeColor;

    ctx.lineTo(x, y);
    ctx.stroke();

    lastPointRef.current = { x, y };
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
    onDrawEnd?.();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onClear?.();
  };

  const handlers = {
    onTap: () => {
      // 点击清空画布
      clearCanvas();
    },
    onPan: (data: GestureEventData) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      if (!rect) return;

      const x = data.x - rect.left;
      const y = data.y - rect.top;

      if (!isDrawingRef.current) {
        startDrawing(x, y);
      } else {
        draw(x, y);
      }
    },
  };

  // GestureCanvas 使用原生 canvas 事件，不需要 useGestures hook
  // const { ref: _canvasRefGesture } = useGestures<HTMLCanvasElement>(_handlers);

  return (
    <div className="relative inline-block">
      <canvas
        ref={el => {
          if (canvasRef.current === null && el) {
            // 只在第一次时设置
            Object.assign(canvasRef, { current: el });
            el.width = width;
            el.height = height;
          }
        }}
        className="border border-gray-200 rounded-lg bg-white cursor-crosshair touch-none"
        style={{ backgroundColor }}
        onTouchEnd={stopDrawing}
        onTouchCancel={stopDrawing}
      />

      <div className="absolute top-2 right-2 flex space-x-2">
        <button
          onClick={clearCanvas}
          className="bg-white/80 hover:bg-white rounded-full p-2 shadow-lg backdrop-blur-sm transition-all text-sm"
          aria-label="清空画布"
        >
          清空
        </button>
      </div>
    </div>
  );
}

// 手势支持导出
export { GestureCanvas, GestureCard, GestureImageViewer, GestureVisualizer };
