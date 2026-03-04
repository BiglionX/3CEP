'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  EnhancedLoadingSpinner,
  EnhancedSkeleton,
  EnhancedPageLoader,
  EnhancedInlineLoader,
  EnhancedButtonLoader,
  EnhancedLoadingDots,
  EnhancedLoadingBars,
} from '@/components/ui/enhanced-loading';
import {
  Package,
  Wrench,
  Smartphone,
  Battery,
  Monitor,
  Cpu,
} from 'lucide-react';

export default function LoadingComponentsDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPageLoader, setShowPageLoader] = useState(false);
  const [progress, setProgress] = useState(0);

  const simulateLoading = (duration: number = 2000) => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), duration);
  };

  const simulateProgressLoading = () => {
    setShowPageLoader(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setShowPageLoader(false), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            加载状态组件演?          </h1>
          <p className="text-gray-600">
            展示各种增强版加载状态组件的效果和用?          </p>
        </div>

        {/* 主要演示区域 */}
        <Tabs defaultValue="spinners" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="spinners">旋转加载?/TabsTrigger>
            <TabsTrigger value="skeletons">骨架?/TabsTrigger>
            <TabsTrigger value="page-loaders">页面加载?/TabsTrigger>
            <TabsTrigger value="inline">内联加载</TabsTrigger>
            <TabsTrigger value="buttons">按钮加载</TabsTrigger>
          </TabsList>

          {/* 旋转加载器演?*/}
          <TabsContent value="spinners" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>基础旋转加载?/CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <EnhancedLoadingSpinner size="sm" />
                  <p className="mt-2 text-sm text-gray-600">小尺?/p>
                </div>
                <div className="text-center">
                  <EnhancedLoadingSpinner size="md" />
                  <p className="mt-2 text-sm text-gray-600">中尺?/p>
                </div>
                <div className="text-center">
                  <EnhancedLoadingSpinner size="lg" />
                  <p className="mt-2 text-sm text-gray-600">大尺?/p>
                </div>
                <div className="text-center">
                  <EnhancedLoadingSpinner size="xl" />
                  <p className="mt-2 text-sm text-gray-600">超大尺寸</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>不同主题变体</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div className="text-center">
                  <EnhancedLoadingSpinner variant="primary" size="lg" />
                  <p className="mt-2 text-sm text-gray-600">主要</p>
                </div>
                <div className="text-center">
                  <EnhancedLoadingSpinner variant="secondary" size="lg" />
                  <p className="mt-2 text-sm text-gray-600">次要</p>
                </div>
                <div className="text-center">
                  <EnhancedLoadingSpinner variant="success" size="lg" />
                  <p className="mt-2 text-sm text-gray-600">成功</p>
                </div>
                <div className="text-center">
                  <EnhancedLoadingSpinner variant="warning" size="lg" />
                  <p className="mt-2 text-sm text-gray-600">警告</p>
                </div>
                <div className="text-center">
                  <EnhancedLoadingSpinner variant="danger" size="lg" />
                  <p className="mt-2 text-sm text-gray-600">危险</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>不同图标样式</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <EnhancedLoadingSpinner icon="default" size="lg" />
                  <p className="mt-2 text-sm text-gray-600">默认</p>
                </div>
                <div className="text-center">
                  <EnhancedLoadingSpinner icon="gear" size="lg" />
                  <p className="mt-2 text-sm text-gray-600">齿轮</p>
                </div>
                <div className="text-center">
                  <EnhancedLoadingSpinner icon="pulse" size="lg" />
                  <p className="mt-2 text-sm text-gray-600">心跳</p>
                </div>
                <div className="text-center">
                  <EnhancedLoadingSpinner icon="wave" size="lg" />
                  <p className="mt-2 text-sm text-gray-600">波浪</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 骨架屏演?*/}
          <TabsContent value="skeletons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>文本骨架?/CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <EnhancedSkeleton variant="text" width="80%" />
                <EnhancedSkeleton variant="text" width="60%" />
                <EnhancedSkeleton variant="text" width="90%" />
                <EnhancedSkeleton variant="text" width="70%" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>卡片骨架?/CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EnhancedSkeleton variant="card" />
                  <EnhancedSkeleton variant="card" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>列表骨架?/CardTitle>
              </CardHeader>
              <CardContent>
                <EnhancedSkeleton variant="list" count={3} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>复合骨架?/CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                  <EnhancedSkeleton variant="avatar" />
                  <div className="flex-1 space-y-2">
                    <EnhancedSkeleton variant="text" width="60%" />
                    <EnhancedSkeleton variant="text" width="40%" />
                  </div>
                  <EnhancedSkeleton variant="thumbnail" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 页面加载器演?*/}
          <TabsContent value="page-loaders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>不同类型页面加载?/CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={() => {
                      setShowPageLoader(true);
                      setTimeout(() => setShowPageLoader(false), 2000);
                    }}
                  >
                    显示标准加载?                  </Button>
                  <Button onClick={simulateProgressLoading}>
                    显示带进度加载器
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Card className="p-4">
                    <h3 className="font-medium mb-2">最小化</h3>
                    <EnhancedPageLoader variant="minimal" />
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-medium mb-2">标准</h3>
                    <EnhancedPageLoader variant="standard" />
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-medium mb-2">完整</h3>
                    <EnhancedPageLoader variant="full" />
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 内联加载演示 */}
          <TabsContent value="inline" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>内联加载状?/CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span>左侧加载指示?/span>
                  <EnhancedInlineLoader position="left" />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <EnhancedInlineLoader
                    position="right"
                    message="右侧加载指示?
                  />
                  <span>右侧加载指示?/span>
                </div>

                <div className="space-y-2">
                  <EnhancedInlineLoader variant="dots" message="点状加载" />
                  <EnhancedInlineLoader variant="bars" message="条形加载" />
                  <EnhancedInlineLoader variant="spinner" message="旋转加载" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 按钮加载演示 */}
          <TabsContent value="buttons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>按钮加载状?/CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3">覆盖模式</h3>
                  <div className="flex flex-wrap gap-3">
                    <EnhancedButtonLoader
                      loading={isLoading}
                      variant="overlay"
                      onClick={() => simulateLoading()}
                    >
                      <Button>提交表单</Button>
                    </EnhancedButtonLoader>

                    <EnhancedButtonLoader loading={isLoading} variant="overlay">
                      <Button variant="outline">
                        <Package className="w-4 h-4 mr-2" />
                        导出数据
                      </Button>
                    </EnhancedButtonLoader>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">替换模式</h3>
                  <div className="flex flex-wrap gap-3">
                    <EnhancedButtonLoader
                      loading={isLoading}
                      variant="replace"
                      message="正在处理..."
                    >
                      <Button variant="secondary">保存更改</Button>
                    </EnhancedButtonLoader>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">内联模式</h3>
                  <div className="flex flex-wrap gap-3">
                    <EnhancedButtonLoader loading={isLoading} variant="inline">
                      <Button>
                        <Wrench className="w-4 h-4 mr-2" />
                        执行维修
                      </Button>
                    </EnhancedButtonLoader>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 页面加载器展?*/}
        {showPageLoader && (
          <EnhancedPageLoader
            variant="full"
            message="正在加载维修店数?
            subMessage="请稍候，我们正在为您准备最佳体?
            showProgress={true}
            progress={progress}
          />
        )}
      </div>
    </div>
  );
}

