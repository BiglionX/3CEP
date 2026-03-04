/**
 * 移动端手势支持演示页? * 展示各种触摸手势的识别和应用
 */

'use client';

import { useState, useRef } from 'react';
import {
  Touchpad,
  Hand,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  MousePointer,
  Square,
  Circle,
  Triangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useGestures,
  useSwipe,
  useTap,
  useDoubleTap,
  useLongPress,
  usePinch,
  useRotate,
  type GestureEventData,
  type SwipeDirection,
} from '@/hooks/use-gestures';

export default function MobileGesturesDemoPage() {
  const [gestureLog, setGestureLog] = useState<string[]>([]);
  const [boxPosition, setBoxPosition] = useState({ x: 50, y: 50 });
  const [boxScale, setBoxScale] = useState(1);
  const [boxRotation, setBoxRotation] = useState(0);
  const [currentColor, setCurrentColor] = useState('#3b82f6');
  const [activeGesture, setActiveGesture] = useState<string>('');

  // 添加手势日志
  const addGestureLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setGestureLog(prev => [`${timestamp}: ${message}`, ...prev.slice(0, 9)]);
  };

  // 通用手势处理?  const handleGesture = (event: GestureEventData) => {
    setActiveGesture(event.type);
    addGestureLog(`${event.type} 手势被触发`);

    // 根据手势类型执行相应操作
    switch (event.type) {
      case 'swipe':
        if (event.direction) {
          addGestureLog(`滑动方向: ${event.direction}`);
        }
        break;
      case 'pinch':
        if (event.scale) {
          addGestureLog(`缩放比例: ${event.scale.toFixed(2)}`);
        }
        break;
      case 'rotate':
        if (event.rotation) {
          addGestureLog(`旋转角度: ${event.rotation.toFixed(1)}°`);
        }
        break;
    }

    // 重置活动手势显示
    setTimeout(() => setActiveGesture(''), 1000);
  };

  // 为交互区域应用手势识?  const gestureRef = useGestures(handleGesture, {
    enabledGestures: [
      'tap',
      'doubleTap',
      'swipe',
      'pinch',
      'rotate',
      'longPress',
      'pan',
    ],
    swipeThreshold: 20,
    tapThreshold: 15,
    longPressDuration: 800,
    pinchThreshold: 0.1,
    rotateThreshold: 5,
  });

  // 专门的滑动手势处理器
  const swipeRef = useSwipe((direction: SwipeDirection) => {
    addGestureLog(`滑动: ${direction}`);

    // 根据滑动方向移动方块
    setBoxPosition(prev => {
      const moveDistance = 20;
      switch (direction) {
        case 'up':
          return { ...prev, y: Math.max(0, prev.y - moveDistance) };
        case 'down':
          return { ...prev, y: Math.min(300, prev.y + moveDistance) };
        case 'left':
          return { ...prev, x: Math.max(0, prev.x - moveDistance) };
        case 'right':
          return { ...prev, x: Math.min(300, prev.x + moveDistance) };
        default:
          return prev;
      }
    });
  });

  // 点击手势
  const tapRef = useTap(() => {
    addGestureLog('单击');
    setCurrentColor('#ef4444'); // 红色
    setTimeout(() => setCurrentColor('#3b82f6'), 200); // 恢复蓝色
  });

  // 双击手势
  const doubleTapRef = useDoubleTap(() => {
    addGestureLog('双击');
    setBoxScale(prev => (prev === 1 ? 1.5 : 1)); // 切换缩放
  });

  // 长按手势
  const longPressRef = useLongPress(() => {
    addGestureLog('长按');
    setCurrentColor('#10b981'); // 绿色
    setTimeout(() => setCurrentColor('#3b82f6'), 1000); // 1秒后恢复
  }, 800);

  // 捏合手势
  const pinchRef = usePinch((scale: number) => {
    addGestureLog(`捏合: ${scale.toFixed(2)}`);
    setBoxScale(Math.max(0.5, Math.min(3, scale)));
  });

  // 旋转手势
  const rotateRef = useRotate((rotation: number) => {
    addGestureLog(`旋转: ${rotation.toFixed(1)}°`);
    setBoxRotation(rotation % 360);
  });

  // 清除日志
  const clearLogs = () => {
    setGestureLog([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            移动端手势支持演?          </h1>
          <p className="text-gray-600">体验丰富的触摸手势交互功?/p>
        </div>

        <Tabs defaultValue="interactive" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="interactive">交互演示</TabsTrigger>
            <TabsTrigger value="gallery">手势画廊</TabsTrigger>
            <TabsTrigger value="log">手势日志</TabsTrigger>
          </TabsList>

          {/* 交互演示面板 */}
          <TabsContent value="interactive" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Touchpad className="h-5 w-5" />
                      手势交互区域
                    </CardTitle>
                    <CardDescription>
                      在下方区域内尝试各种触摸手势
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      ref={gestureRef}
                      className="relative h-96 w-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden touch-none select-none"
                      style={{ touchAction: 'none' }}
                    >
                      {/* 可交互的方块 */}
                      <div
                        className="absolute w-20 h-20 bg-blue-500 rounded-lg shadow-lg flex items-center justify-center transition-all duration-200"
                        style={{
                          left: `${boxPosition.x}px`,
                          top: `${boxPosition.y}px`,
                          transform: `scale(${boxScale}) rotate(${boxRotation}deg)`,
                          backgroundColor: currentColor,
                          touchAction: 'none',
                        }}
                      >
                        <Hand className="h-8 w-8 text-white" />
                      </div>

                      {/* 手势提示 */}
                      <div className="absolute bottom-4 left-4 space-y-2">
                        <Badge
                          variant={activeGesture ? 'default' : 'secondary'}
                        >
                          {activeGesture || '等待手势'}
                        </Badge>
                        <div className="text-xs text-gray-600">
                          <p>�?单击: 改变颜色</p>
                          <p>�?双击: 切换缩放</p>
                          <p>�?滑动: 移动方块</p>
                          <p>�?长按: 绿色高亮</p>
                          <p>�?捏合: 缩放方块</p>
                          <p>�?旋转: 旋转方块</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>手势控制面板</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={() => setBoxPosition({ x: 50, y: 50 })}
                      className="w-full"
                      variant="outline"
                    >
                      <Move className="h-4 w-4 mr-2" />
                      重置位置
                    </Button>

                    <Button
                      onClick={() => setBoxScale(1)}
                      className="w-full"
                      variant="outline"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      重置大小
                    </Button>

                    <Button
                      onClick={() => setBoxRotation(0)}
                      className="w-full"
                      variant="outline"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      重置旋转
                    </Button>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => setCurrentColor('#3b82f6')}
                        style={{ backgroundColor: '#3b82f6' }}
                        className="text-white"
                      >
                        蓝色
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setCurrentColor('#ef4444')}
                        style={{ backgroundColor: '#ef4444' }}
                        className="text-white"
                      >
                        红色
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setCurrentColor('#10b981')}
                        style={{ backgroundColor: '#10b981' }}
                        className="text-white"
                      >
                        绿色
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setCurrentColor('#8b5cf6')}
                        style={{ backgroundColor: '#8b5cf6' }}
                        className="text-white"
                      >
                        紫色
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>当前状?/CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">位置:</span>
                      <span className="font-mono">
                        ({boxPosition.x}, {boxPosition.y})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">缩放:</span>
                      <span className="font-mono">{boxScale.toFixed(2)}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">旋转:</span>
                      <span className="font-mono">
                        {boxRotation.toFixed(1)}°
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">颜色:</span>
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: currentColor }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* 手势画廊面板 */}
          <TabsContent value="gallery" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 滑动手势 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowLeft className="h-5 w-5" />
                    滑动手势
                  </CardTitle>
                  <CardDescription>四个方向的滑动识?/CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    ref={swipeRef}
                    className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-medium touch-none select-none"
                    style={{ touchAction: 'none' }}
                  >
                    <div className="text-center">
                      <MousePointer className="h-8 w-8 mx-auto mb-2" />
                      <p>在此区域滑动</p>
                      <p className="text-sm opacity-80">�?�?�?�?/p>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <p>�?向上滑动: �?/p>
                    <p>�?向下滑动: �?/p>
                    <p>�?向左滑动: �?/p>
                    <p>�?向右滑动: �?/p>
                  </div>
                </CardContent>
              </Card>

              {/* 点击手势 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MousePointer className="h-5 w-5" />
                    点击手势
                  </CardTitle>
                  <CardDescription>单击和双击识?/CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div
                      ref={tapRef}
                      className="h-20 bg-green-400 rounded-lg flex items-center justify-center text-white font-medium touch-none select-none cursor-pointer hover:bg-green-500 transition-colors"
                    >
                      单击?                    </div>

                    <div
                      ref={doubleTapRef}
                      className="h-20 bg-yellow-400 rounded-lg flex items-center justify-center text-white font-medium touch-none select-none cursor-pointer hover:bg-yellow-500 transition-colors"
                    >
                      双击?                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <p>�?快速点击一?= 单击</p>
                    <p>�?快速点击两?= 双击</p>
                    <p>�?时间间隔 &lt; 300ms</p>
                  </div>
                </CardContent>
              </Card>

              {/* 长按手势 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hand className="h-5 w-5" />
                    长按手势
                  </CardTitle>
                  <CardDescription>持续按压识别</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    ref={longPressRef}
                    className="h-32 bg-red-400 rounded-lg flex items-center justify-center text-white font-medium touch-none select-none cursor-pointer hover:bg-red-500 transition-colors"
                  >
                    <div className="text-center">
                      <Hand className="h-8 w-8 mx-auto mb-2" />
                      <p>长按 800ms</p>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <p>�?按住超过 800ms</p>
                    <p>�?会触发长按事?/p>
                    <p>�?释放后变为点?/p>
                  </div>
                </CardContent>
              </Card>

              {/* 捏合手势 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ZoomIn className="h-5 w-5" />
                    捏合手势
                  </CardTitle>
                  <CardDescription>双指缩放识别</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    ref={pinchRef}
                    className="h-48 bg-gradient-to-br from-pink-400 to-orange-400 rounded-lg flex items-center justify-center text-white font-medium touch-none select-none"
                    style={{ touchAction: 'none' }}
                  >
                    <div className="text-center">
                      <ZoomIn className="h-8 w-8 mx-auto mb-2" />
                      <p>双指捏合</p>
                      <p className="text-sm opacity-80">放大/缩小</p>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <p>�?双指张开 = 放大</p>
                    <p>�?双指合拢 = 缩小</p>
                    <p>�?最?0.1 倍变?/p>
                  </div>
                </CardContent>
              </Card>

              {/* 旋转手势 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5" />
                    旋转手势
                  </CardTitle>
                  <CardDescription>双指旋转识别</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    ref={rotateRef}
                    className="h-48 bg-gradient-to-tr from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-medium touch-none select-none"
                    style={{ touchAction: 'none' }}
                  >
                    <div className="text-center">
                      <RotateCcw className="h-8 w-8 mx-auto mb-2 animate-spin" />
                      <p>双指旋转</p>
                      <p className="text-sm opacity-80">顺时?逆时?/p>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <p>�?双指同时旋转</p>
                    <p>�?最?5° 变化</p>
                    <p>�?支持任意角度</p>
                  </div>
                </CardContent>
              </Card>

              {/* 综合手势 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Touchpad className="h-5 w-5" />
                    综合手势
                  </CardTitle>
                  <CardDescription>多种手势组合</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    ref={gestureRef}
                    className="h-48 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white font-medium touch-none select-none"
                    style={{ touchAction: 'none' }}
                  >
                    <div className="text-center">
                      <Touchpad className="h-8 w-8 mx-auto mb-2" />
                      <p>所有手?/p>
                      <p className="text-sm opacity-80">一站式体验</p>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <p>�?支持所有手势类?/p>
                    <p>�?智能识别优先?/p>
                    <p>�?方向锁定防误?/p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 手势日志面板 */}
          <TabsContent value="log" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>手势识别日志</CardTitle>
                    <CardDescription>实时显示检测到的手势事?/CardDescription>
                  </div>
                  <Button onClick={clearLogs} variant="outline">
                    清除日志
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {gestureLog.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MousePointer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>暂无手势记录</p>
                    <p className="text-sm mt-1">在其他标签页中尝试手势操?/p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {gestureLog.map((log, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 rounded-lg border text-sm"
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>手势统计</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>总手势数:</span>
                      <Badge>{gestureLog.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>滑动手势:</span>
                      <Badge variant="secondary">
                        {gestureLog.filter(log => log.includes('滑动')).length}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>点击手势:</span>
                      <Badge variant="secondary">
                        {
                          gestureLog.filter(
                            log => log.includes('点击') || log.includes('tap')
                          ).length
                        }
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>长按手势:</span>
                      <Badge variant="secondary">
                        {gestureLog.filter(log => log.includes('长按')).length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>技术说?/CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>�?基于原生 TouchEvent API</li>
                    <li>�?支持多点触控识别</li>
                    <li>�?内置防抖和方向锁?/li>
                    <li>�?可配置的阈值参?/li>
                    <li>�?完整?TypeScript 支持</li>
                    <li>�?零依赖轻量级实现</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

