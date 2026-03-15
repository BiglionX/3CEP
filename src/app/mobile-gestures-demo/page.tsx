/**
 * 移动端手势支持演示页面
 * 展示各种触摸手势的识别和应用
 */

'use client';

import { useState, useCallback } from 'react';
import React from 'react';
import {
  Touchpad,
  Hand,
  RotateCcw,
  ZoomIn,
  Move,
  ArrowLeft,
  MousePointer,
  Square,
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
  type GestureEventData,
} from '@/hooks/use-gestures';

export default function MobileGesturesDemoPage() {
  const [gestureLog, setGestureLog] = useState<string[]>([]);
  const [boxPosition, setBoxPosition] = useState({ x: 50, y: 50 });
  const [boxScale, setBoxScale] = useState(1);
  const [boxRotation, setBoxRotation] = useState(0);
  const [currentColor, setCurrentColor] = useState('#3b82f6');
  const [activeGesture, setActiveGesture] = useState<string>('');

  // 添加手势日志
  const addGestureLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setGestureLog(prev => [`${timestamp}: ${message}`, ...prev.slice(0, 9)]);
  }, []);

  // 处理手势事件
  const handleGesture = useCallback((event: GestureEventData) => {
    setActiveGesture(event.type);
    addGestureLog(`${event.type} 手势被触发`);

    // 根据手势类型执行相应操作
    switch (event.type) {
      case 'tap':
        setCurrentColor('#ef4444'); // 红色
        setTimeout(() => setCurrentColor('#3b82f6'), 200);
        break;
      case 'doubleTap':
        setBoxScale(prev => (prev === 1  1.5 : 1)); // 切换缩放
        break;
      case 'longPress':
        setCurrentColor('#10b981'); // 绿色
        setTimeout(() => setCurrentColor('#3b82f6'), 1000);
        break;
      case 'swipeLeft':
        addGestureLog(`滑动方向: 向左`);
        setBoxPosition(prev => ({ ...prev, x: Math.max(0, prev.x - 20) }));
        break;
      case 'swipeRight':
        addGestureLog(`滑动方向: 向右`);
        setBoxPosition(prev => ({ ...prev, x: Math.min(300, prev.x + 20) }));
        break;
      case 'swipeUp':
        addGestureLog(`滑动方向: 向上`);
        setBoxPosition(prev => ({ ...prev, y: Math.max(0, prev.y - 20) }));
        break;
      case 'swipeDown':
        addGestureLog(`滑动方向: 向下`);
        setBoxPosition(prev => ({ ...prev, y: Math.min(300, prev.y + 20) }));
        break;
      case 'pinchIn':
        if (event.scale) {
          addGestureLog(`缩放比例: ${event.scale.toFixed(2)}`);
          setBoxScale(Math.max(0.5, Math.min(3, 1 / event.scale)));
        }
        break;
      case 'pinchOut':
        if (event.scale) {
          addGestureLog(`缩放比例: ${event.scale.toFixed(2)}`);
          setBoxScale(Math.max(0.5, Math.min(3, event.scale)));
        }
        break;
      case 'rotate':
        if (event.rotation) {
          addGestureLog(`旋转角度: ${event.rotation.toFixed(1)}°`);
          setBoxRotation(event.rotation % 360);
        }
        break;
      case 'pan':
        if (event.deltaX !== undefined && event.deltaY !== undefined) {
          setBoxPosition(prev => ({
            x: Math.max(0, Math.min(300, prev.x + event.deltaX!)),
            y: Math.max(0, Math.min(300, prev.y + event.deltaY!))
          }));
        }
        break;
    }

    // 重置活动手势显示
    setTimeout(() => setActiveGesture(''), 1000);
  }, [addGestureLog]);

  // 主交互区域的手势识别
  const { ref: gestureRef } = useGestures<HTMLDivElement>({
    onTap: handleGesture,
    onDoubleTap: handleGesture,
    onLongPress: handleGesture,
    onSwipeLeft: handleGesture,
    onSwipeRight: handleGesture,
    onSwipeUp: handleGesture,
    onSwipeDown: handleGesture,
    onPinchIn: handleGesture,
    onPinchOut: handleGesture,
    onRotate: handleGesture,
    onPan: handleGesture,
  }, {
    tapThreshold: 15,
    doubleTapDelay: 300,
    longPressDuration: 800,
    swipeVelocity: 0.3,
    swipeDistance: 50,
    pinchThreshold: 0.1,
    rotationThreshold: 5,
  });

  // 专门处理滑动手势的区域
  const { ref: swipeRef } = useGestures<HTMLDivElement>({
    onSwipeLeft: (event: GestureEventData) => {
      addGestureLog('滑动: 向左');
      handleGesture(event);
    },
    onSwipeRight: (event: GestureEventData) => {
      addGestureLog('滑动: 向右');
      handleGesture(event);
    },
    onSwipeUp: (event: GestureEventData) => {
      addGestureLog('滑动: 向上');
      handleGesture(event);
    },
    onSwipeDown: (event: GestureEventData) => {
      addGestureLog('滑动: 向下');
      handleGesture(event);
    },
  }, {
    swipeVelocity: 0.3,
    swipeDistance: 50,
  });

  // 专门处理点击手势的区域
  const { ref: tapRef } = useGestures<HTMLDivElement>({
    onTap: handleGesture,
  }, {
    tapThreshold: 15,
  });

  // 专门处理双击手势的区域
  const { ref: doubleTapRef } = useGestures<HTMLDivElement>({
    onDoubleTap: handleGesture,
  }, {
    tapThreshold: 15,
    doubleTapDelay: 300,
  });

  // 专门处理长按手势的区域
  const { ref: longPressRef } = useGestures<HTMLDivElement>({
    onLongPress: handleGesture,
  }, {
    longPressDuration: 800,
  });

  // 专门处理捏合手势的区域
  const { ref: pinchRef } = useGestures<HTMLDivElement>({
    onPinchIn: handleGesture,
    onPinchOut: handleGesture,
  }, {
    pinchThreshold: 0.1,
  });

  // 专门处理旋转手势的区域
  const { ref: rotateRef } = useGestures<HTMLDivElement>({
    onRotate: handleGesture,
  }, {
    rotationThreshold: 5,
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
            移动端手势支持演示
          </h1>
          <p className="text-gray-600">体验丰富的触摸手势交互功能</p>
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
                          variant={activeGesture  'default' : 'secondary'}
                        >
                          {activeGesture || '等待手势'}
                        </Badge>
                        <div className="text-xs text-gray-600">
                          <p>• 单击: 改变颜色</p>
                          <p>• 双击: 切换缩放</p>
                          <p>• 滑动: 移动方块</p>
                          <p>• 长按: 绿色高亮</p>
                          <p>• 捏合: 缩放方块</p>
                          <p>• 旋转: 旋转方块</p>
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
                    <CardTitle>当前状态</CardTitle>
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
                  <CardDescription>四个方向的滑动识别</CardDescription>
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
                      <p className="text-sm opacity-80">↑ ↓ ← →</p>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <p>• 向上滑动: ↑</p>
                    <p>• 向下滑动: ↓</p>
                    <p>• 向左滑动: ←</p>
                    <p>• 向右滑动: →</p>
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
                  <CardDescription>单击和双击识别</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div
                      ref={tapRef}
                      className="h-20 bg-green-400 rounded-lg flex items-center justify-center text-white font-medium touch-none select-none cursor-pointer hover:bg-green-500 transition-colors"
                    >
                      单击区域
                    </div>

                    <div
                      ref={doubleTapRef}
                      className="h-20 bg-yellow-400 rounded-lg flex items-center justify-center text-white font-medium touch-none select-none cursor-pointer hover:bg-yellow-500 transition-colors"
                    >
                      双击区域
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <p>• 快速点击一次 = 单击</p>
                    <p>• 快速点击两次 = 双击</p>
                    <p>• 时间间隔 &lt; 300ms</p>
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
                    <p>• 按住超过 800ms</p>
                    <p>• 会触发长按事件</p>
                    <p>• 释放后变为点击</p>
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
                    <p>• 双指张开 = 放大</p>
                    <p>• 双指合拢 = 缩小</p>
                    <p>• 最小 0.1 倍变化</p>
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
                      <p className="text-sm opacity-80">顺时针/逆时针</p>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <p>• 双指同时旋转</p>
                    <p>• 最小 5° 变化</p>
                    <p>• 支持任意角度</p>
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
                      <p>所有手势</p>
                      <p className="text-sm opacity-80">一站式体验</p>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <p>• 支持所有手势类型</p>
                    <p>• 智能识别优先级</p>
                    <p>• 方向锁定防误触</p>
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
                    <CardDescription>实时显示检测到的手势事件</CardDescription>
                  </div>
                  <Button onClick={clearLogs} variant="outline">
                    清除日志
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {gestureLog.length === 0  (
                  <div className="text-center py-12 text-gray-500">
                    <MousePointer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>暂无手势记录</p>
                    <p className="text-sm mt-1">在其他标签页中尝试手势操作</p>
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
                  <CardTitle>技术说明</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• 基于原生 TouchEvent API</li>
                    <li>• 支持多点触控识别</li>
                    <li>• 内置防抖和方向锁定</li>
                    <li>• 可配置的阈值参数</li>
                    <li>• 完整的 TypeScript 支持</li>
                    <li>• 零依赖轻量级实现</li>
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
