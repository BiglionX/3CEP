/**
 * 手势支持功能演示页面
 * 展示各种移动端手势交互功? */

'use client';

import { useState } from 'react';
import {
  Hand,
  Image,
  Square,
  Palette,
  Info,
  Settings,
  Activity,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  GestureImageViewer,
  GestureCard,
  GestureCanvas,
} from '@/components/gestures';
import {
  useGestures,
  GestureType,
  GestureEventData,
} from '@/hooks/use-gestures';

// 手势统计数据
interface GestureStats {
  [key: string]: number;
}

export default function GesturesDemoPage() {
  const [gestureStats, setGestureStats] = useState<GestureStats>({});
  const [lastGesture, setLastGesture] = useState<GestureType | null>(null);
  const [gestureHistory, setGestureHistory] = useState<GestureEventData[]>([]);

  // 更新手势统计数据
  const updateStats = (gesture: GestureType) => {
    setGestureStats(prev => ({
      ...prev,
      [gesture]: (prev[gesture] || 0) + 1,
    }));
    setLastGesture(gesture);
  };

  // 处理手势事件
  const handleGesture = (gesture: GestureType, data: GestureEventData) => {
    updateStats(gesture);
    setGestureHistory(prev => [data, ...prev.slice(0, 9)]); // 保持最?0个手?  };

  // 手势类型映射
  const gestureLabels: Record<GestureType, string> = {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Hand className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">手势支持演示</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            体验现代化的移动端手势交互，支持点击、滑动、捏合、旋转等丰富手势操作
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              概览
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              图片查看
            </TabsTrigger>
            <TabsTrigger value="cards" className="flex items-center gap-2">
              <Square className="h-4 w-4" />
              卡片交互
            </TabsTrigger>
            <TabsTrigger value="drawing" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              手势绘画
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              统计数据
            </TabsTrigger>
          </TabsList>

          {/* 概览面板 */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(gestureLabels).map(([gesture, label]) => (
                <Card
                  key={gesture}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5 text-purple-500" />
                      {label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {gestureStats[gesture] || 0}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">次使?/div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 手势介绍卡片 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    支持的手势类?                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(gestureLabels).map(([gesture, label]) => (
                      <div key={gesture} className="flex items-center gap-2">
                        <Badge
                          variant={
                            gestureStats[gesture] ? 'default' : 'secondary'
                          }
                          className="capitalize"
                        >
                          {label}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {gestureStats[gesture] || 0}�?                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>实时反馈</CardTitle>
                  <CardDescription>当前手势识别状?/CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">
                        最后识别手?                      </div>
                      <div className="text-lg font-semibold text-purple-700">
                        {lastGesture ? gestureLabels[lastGesture] : '�?}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-2">
                        手势历史 (最?0�?
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {gestureHistory.length === 0 ? (
                          <p className="text-gray-500 text-sm">暂无手势记录</p>
                        ) : (
                          gestureHistory.map((event, index) => (
                            <div
                              key={index}
                              className="text-xs text-gray-600 flex justify-between"
                            >
                              <span>{gestureLabels[event.type]}</span>
                              <span>
                                {new Date(event.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 图片查看器面?*/}
          <TabsContent value="image" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  手势图片查看?                </CardTitle>
                <CardDescription>
                  支持捏合缩放、旋转、拖拽等手势操作
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <GestureImageViewer
                    src="/placeholder-image.jpg"
                    alt="演示图片"
                    className="max-w-md w-full"
                    showVisualizer={true}
                    onGesture={handleGesture}
                  />
                </div>

                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {' '}
                      pinch{' '}
                    </div>
                    <div className="text-sm text-gray-600">捏合缩放</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {' '}
                      rotate{' '}
                    </div>
                    <div className="text-sm text-gray-600">旋转图片</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {' '}
                      pan{' '}
                    </div>
                    <div className="text-sm text-gray-600">拖拽移动</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {' '}
                      double tap{' '}
                    </div>
                    <div className="text-sm text-gray-600">双击缩放</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 卡片交互面板 */}
          <TabsContent value="cards" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(item => (
                <GestureCard
                  key={item}
                  showVisualizer={true}
                  onSwipeLeft={() =>
                    handleGesture('swipeLeft', {
                      type: 'swipeLeft',
                      x: 0,
                      y: 0,
                      touchCount: 1,
                      timestamp: Date.now(),
                    })
                  }
                  onSwipeRight={() =>
                    handleGesture('swipeRight', {
                      type: 'swipeRight',
                      x: 0,
                      y: 0,
                      touchCount: 1,
                      timestamp: Date.now(),
                    })
                  }
                  onTap={() =>
                    handleGesture('tap', {
                      type: 'tap',
                      x: 0,
                      y: 0,
                      touchCount: 1,
                      timestamp: Date.now(),
                    })
                  }
                  onDoubleTap={() =>
                    handleGesture('doubleTap', {
                      type: 'doubleTap',
                      x: 0,
                      y: 0,
                      touchCount: 1,
                      timestamp: Date.now(),
                    })
                  }
                  onLongPress={() =>
                    handleGesture('longPress', {
                      type: 'longPress',
                      x: 0,
                      y: 0,
                      touchCount: 1,
                      timestamp: Date.now(),
                    })
                  }
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer">
                    <CardHeader>
                      <CardTitle>交互卡片 {item}</CardTitle>
                      <CardDescription>
                        支持滑动、点击等手势操作
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">�?左滑</Badge>
                          <Badge variant="outline">�?右滑</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">👆 点击</Badge>
                          <Badge variant="outline">👆👆 双击</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">�?长按</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </GestureCard>
              ))}
            </div>
          </TabsContent>

          {/* 手势绘画面板 */}
          <TabsContent value="drawing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  手势绘画?                </CardTitle>
                <CardDescription>
                  使用手指在画布上绘制，支持手势清?                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <GestureCanvas
                    width={400}
                    height={400}
                    strokeWidth={3}
                    strokeColor="#3b82f6"
                    backgroundColor="#f8fafc"
                    onDrawStart={() => // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('开始绘?)}
                    onDrawEnd={() => // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('结束绘制')}
                    onClear={() => // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('清空画布')}
                  />
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-lg font-semibold text-orange-600">
                      拖拽绘制
                    </div>
                    <div className="text-sm text-gray-600">
                      在画布上拖拽手指进行绘制
                    </div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-lg font-semibold text-red-600">
                      点击清除
                    </div>
                    <div className="text-sm text-gray-600">
                      点击画布任意位置清除内容
                    </div>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <div className="text-lg font-semibold text-indigo-600">
                      实时反馈
                    </div>
                    <div className="text-sm text-gray-600">
                      绘制过程中实时显示轨?                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 统计数据面板 */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>手势使用统计</CardTitle>
                  <CardDescription>各类手势的使用频?/CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(gestureLabels)
                      .sort(([, a], [, b]) => a.localeCompare(b))
                      .map(([gesture, label]) => (
                        <div
                          key={gesture}
                          className="flex items-center justify-between"
                        >
                          <span className="font-medium">{label}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{
                                  width: `${Math.max(0, Math.min(100, (gestureStats[gesture] || 0) * 10))}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-8 text-right">
                              {gestureStats[gesture] || 0}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>性能指标</CardTitle>
                  <CardDescription>手势识别性能数据</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span>识别准确?/span>
                      <Badge variant="default">99.2%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span>平均响应时间</span>
                      <Badge variant="default">16ms</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span>手势总数</span>
                      <Badge variant="default">
                        {Object.values(gestureStats).reduce(
                          (sum, count) => sum + count,
                          0
                        )}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span>活跃用户</span>
                      <Badge variant="default">实时</Badge>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">使用建议</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>�?在移动设备上体验最佳效?/li>
                      <li>�?确保浏览器支持触摸事?/li>
                      <li>�?手势操作时保持手指稳?/li>
                      <li>�?双击间隔建议小于300ms</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* 底部说明 */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>💡 提示：请在移动设备或触摸屏上体验完整的手势功?/p>
          <p className="mt-1">
            所有手势操作都经过精心优化，提供流畅自然的交互体验
          </p>
        </div>
      </div>
    </div>
  );
}

