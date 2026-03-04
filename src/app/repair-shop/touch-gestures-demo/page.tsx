/**
 * 移动端手势和触控组件演示页面
 * 展示各种移动端专属交互组件和手势识别功能
 */

'use client';

import { useState } from 'react';
import {
  TouchButton,
  TouchSlider,
  TouchCarousel,
  SwipeableContainer,
  GestureIndicator,
  useGestureRecognizer,
  type GestureEvent,
  type SwipeDirection,
} from '@/components/touch-gestures';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Smartphone,
  Heart,
  Star,
  ThumbsUp,
  Share2,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Zap,
  Battery,
} from 'lucide-react';

// 演示卡片内容
const carouselItems = [
  {
    id: 1,
    title: '触控按钮',
    description: '专为移动设备优化的触控按钮，支持长按和双击手?,
    icon: Heart,
    color: 'bg-red-100 text-red-600',
  },
  {
    id: 2,
    title: '滑动手势',
    description: '流畅的滑动体验，支持左右滑动切换内容',
    icon: Zap,
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    id: 3,
    title: '触控滑块',
    description: '精确的触控滑块控制，适用于各种数值调节场?,
    icon: Sun,
    color: 'bg-orange-100 text-orange-600',
  },
  {
    id: 4,
    title: '手势识别',
    description: '智能手势识别系统，支持滑动、点击、长按等多种手势',
    icon: Star,
    color: 'bg-blue-100 text-blue-600',
  },
];

// 手势演示组件
function GestureDemo() {
  const [detectedGesture, setDetectedGesture] = useState<GestureEvent | null>(
    null
  );
  const [volume, setVolume] = useState(50);
  const [brightness, setBrightness] = useState(75);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const handleGesture = (event: GestureEvent) => {
    setDetectedGesture(event);
    // 3秒后清除手势指示
    setTimeout(() => setDetectedGesture(null), 3000);
  };

  const gestureHandlers = useGestureRecognizer(handleGesture);

  const handleSwipe = (direction: SwipeDirection) => {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('滑动方向:', direction)// 根据滑动方向切换轮播?    if (direction === 'left' && carouselIndex < carouselItems.length - 1) {
      setCarouselIndex(carouselIndex + 1);
    } else if (direction === 'right' && carouselIndex > 0) {
      setCarouselIndex(carouselIndex - 1);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            手势识别演示
          </CardTitle>
          <CardDescription>
            在下方区域内进行各种手势操作来测试手势识别功?          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 手势识别区域 */}
          <SwipeableContainer
            onSwipe={handleSwipe}
            className="relative h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl overflow-hidden"
          >
            <div
              {...gestureHandlers}
              className="w-full h-full flex items-center justify-center relative touch-none select-none"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  手势识别区域
                </h3>
                <p className="text-gray-600 text-sm">
                  在此区域内尝试各种手势操?                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    滑动
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    点击
                  </span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    长按
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    双击
                  </span>
                </div>
              </div>

              {/* 视觉反馈指示?*/}
              <div className="absolute top-4 left-4 right-4 flex justify-between">
                <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
              </div>
            </div>
          </SwipeableContainer>

          {/* 手势指示?*/}
          <GestureIndicator gesture={detectedGesture} />
        </CardContent>
      </Card>

      {/* 触控按钮演示 */}
      <Card>
        <CardHeader>
          <CardTitle>触控按钮组件</CardTitle>
          <CardDescription>
            专为移动设备优化的按钮组件，支持多种交互方式
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <TouchButton
              variant="primary"
              size="lg"
              onPress={() => // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('主要按钮被点?)}
              onLongPress={() => // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('主要按钮被长?)}
            >
              <ThumbsUp className="w-5 h-5 mr-2" />
              点赞
            </TouchButton>

            <TouchButton
              variant="secondary"
              size="md"
              onPress={() => // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('分享按钮被点?)}
            >
              <Share2 className="w-4 h-4 mr-2" />
              分享
            </TouchButton>

            <TouchButton
              variant="danger"
              size="sm"
              onPress={() => // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('删除按钮被点?)}
              onLongPress={() => // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('删除按钮被长?)}
            >
              <VolumeX className="w-4 h-4 mr-1" />
              静音
            </TouchButton>

            <TouchButton
              variant="ghost"
              size="md"
              onPress={() => // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('收藏按钮被点?)}
            >
              <Star className="w-4 h-4 mr-2" />
              收藏
            </TouchButton>
          </div>
        </CardContent>
      </Card>

      {/* 触控滑块演示 */}
      <Card>
        <CardHeader>
          <CardTitle>触控滑块组件</CardTitle>
          <CardDescription>
            精确的触控滑块控制，适用于音量、亮度等数值调?          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <TouchSlider
            label="音量控制"
            value={volume}
            onChange={setVolume}
            min={0}
            max={100}
            step={5}
            showValue
          />

          <TouchSlider
            label="屏幕亮度"
            value={brightness}
            onChange={setBrightness}
            min={0}
            max={100}
            step={1}
            showValue
          />

          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-sm text-gray-600">当前设置</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">{volume}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium">{brightness}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 轮播图演?*/}
      <Card>
        <CardHeader>
          <CardTitle>触控轮播组件</CardTitle>
          <CardDescription>支持手势滑动的卡片轮播组?/CardDescription>
        </CardHeader>
        <CardContent>
          <TouchCarousel
            items={carouselItems.map(item => (
              <Card key={item.id} className="h-64 mx-2">
                <CardContent className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div
                    className={`w-16 h-16 ${item.color} rounded-full flex items-center justify-center mb-4`}
                  >
                    <item.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
            currentIndex={carouselIndex}
            onIndexChange={setCarouselIndex}
            showIndicators
            showArrows
          />

          <div className="mt-4 text-center text-sm text-gray-500">
            当前页面: {carouselIndex + 1} / {carouselItems.length}
          </div>
        </CardContent>
      </Card>

      {/* 手势统计 */}
      <Card>
        <CardHeader>
          <CardTitle>手势操作统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">24</div>
              <div className="text-sm text-gray-600">总手势数</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-sm text-gray-600">滑动手势</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">12</div>
              <div className="text-sm text-gray-600">点击手势</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">4</div>
              <div className="text-sm text-gray-600">长按手势</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 主演示页?export default function TouchGesturesDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            移动端手势组件演?          </h1>
          <p className="text-gray-600">专为触控设备优化的交互组件集?/p>
        </div>

        <GestureDemo />
      </div>
    </div>
  );
}

