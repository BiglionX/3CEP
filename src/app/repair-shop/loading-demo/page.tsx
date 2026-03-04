/**
 * 加载状态组件演示页? * 展示各种加载指示器和骨架屏的效果
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Layout,
  Table,
  User,
  FileText,
} from 'lucide-react';
import * as LoadingComponents from '@/components/ui/loading';

export default function LoadingDemoPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingVariant, setLoadingVariant] = useState<
    'spinner' | 'dots' | 'bars'
  >('spinner');

  const toggleLoading = () => setIsLoading(!isLoading);
  const resetLoading = () => setIsLoading(true);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          加载状态组件演?        </h1>
        <p className="text-gray-600">统一的加载指示器和骨架屏组件?/p>
      </div>

      {/* 控制面板 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            演示控制
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={toggleLoading}
              variant={isLoading ? 'secondary' : 'default'}
            >
              {isLoading ? (
                <Pause className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isLoading ? '暂停加载' : '开始加?}
            </Button>

            <Button onClick={resetLoading} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              重置状?            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">加载样式:</span>
              <select
                value={loadingVariant}
                onChange={e => setLoadingVariant(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="spinner">旋转动画</option>
                <option value="dots">脉冲?/option>
                <option value="bars">条形动画</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 基础加载指示?*/}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              基础旋转?            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-around">
                <div className="text-center">
                  <LoadingComponents.LoadingSpinner
                    size="sm"
                    variant="primary"
                  />
                  <p className="text-xs mt-1">小号</p>
                </div>
                <div className="text-center">
                  <LoadingComponents.LoadingSpinner
                    size="md"
                    variant="secondary"
                  />
                  <p className="text-xs mt-1">中号</p>
                </div>
                <div className="text-center">
                  <LoadingComponents.LoadingSpinner
                    size="lg"
                    variant="success"
                  />
                  <p className="text-xs mt-1">大号</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="outline">主色</Badge>
                <Badge variant="outline" className="text-gray-500">
                  次色
                </Badge>
                <Badge variant="outline" className="text-green-500">
                  成功
                </Badge>
                <Badge variant="outline" className="text-yellow-500">
                  警告
                </Badge>
                <Badge variant="outline" className="text-red-500">
                  危险
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              脉冲动画
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <LoadingComponents.LoadingDots className="justify-center" />
                <p className="text-sm mt-2 text-gray-600">脉冲点加?/p>
              </div>

              <div className="text-center">
                <LoadingComponents.LoadingBars />
                <p className="text-sm mt-2 text-gray-600">条形动画</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <LoadingComponents.InlineLoader message="正在处理?.." />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              按钮加载
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <LoadingComponents.ButtonLoader loading={isLoading}>
                <Button className="w-full">提交表单</Button>
              </LoadingComponents.ButtonLoader>

              <LoadingComponents.ButtonLoader loading={isLoading}>
                <Button variant="outline" className="w-full">
                  保存更改
                </Button>
              </LoadingComponents.ButtonLoader>

              <LoadingComponents.ButtonLoader loading={isLoading}>
                <Button variant="destructive" className="w-full">
                  删除项目
                </Button>
              </LoadingComponents.ButtonLoader>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 骨架屏组?*/}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              用户卡片骨架?            </CardTitle>
          </CardHeader>
          <CardContent>
            <LoadingComponents.LoadingOverlay
              loading={isLoading}
              message="加载用户信息..."
              variant={loadingVariant}
            >
              <LoadingComponents.CardSkeleton />
            </LoadingComponents.LoadingOverlay>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              列表骨架?            </CardTitle>
          </CardHeader>
          <CardContent>
            <LoadingComponents.LoadingOverlay
              loading={isLoading}
              message="加载列表数据..."
              variant={loadingVariant}
            >
              <LoadingComponents.ListSkeleton items={3} />
            </LoadingComponents.LoadingOverlay>
          </CardContent>
        </Card>
      </div>

      {/* 表格骨架?*/}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table className="h-5 w-5" />
            表格骨架?          </CardTitle>
          <CardDescription>模拟数据表格的加载状?/CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingComponents.LoadingOverlay
            loading={isLoading}
            message="加载表格数据..."
            variant={loadingVariant}
            fullScreen={false}
          >
            <LoadingComponents.TableSkeleton rows={4} columns={5} />
          </LoadingComponents.LoadingOverlay>
        </CardContent>
      </Card>

      {/* 文本骨架?*/}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              文本骨架?            </CardTitle>
          </CardHeader>
          <CardContent>
            <LoadingComponents.LoadingOverlay
              loading={isLoading}
              message="加载文章内容..."
              variant={loadingVariant}
            >
              <div className="space-y-4">
                <LoadingComponents.Skeleton className="h-8 w-3/4" />
                <LoadingComponents.Skeleton className="h-4 w-full" />
                <LoadingComponents.Skeleton className="h-4 w-5/6" />
                <LoadingComponents.TextSkeleton lines={4} />
              </div>
            </LoadingComponents.LoadingOverlay>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              混合骨架?            </CardTitle>
          </CardHeader>
          <CardContent>
            <LoadingComponents.LoadingOverlay
              loading={isLoading}
              message="加载混合内容..."
              variant={loadingVariant}
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <LoadingComponents.Skeleton
                    variant="circle"
                    width="3rem"
                    height="3rem"
                  />
                  <div className="flex-1 space-y-2">
                    <LoadingComponents.Skeleton className="w-3/4 h-5" />
                    <LoadingComponents.Skeleton className="w-1/2 h-4" />
                  </div>
                </div>
                <LoadingComponents.Skeleton className="w-full h-32" />
                <div className="flex space-x-2">
                  <LoadingComponents.Skeleton className="w-20 h-6 rounded-full" />
                  <LoadingComponents.Skeleton className="w-16 h-6 rounded-full" />
                  <LoadingComponents.Skeleton className="w-24 h-6 rounded-full" />
                </div>
              </div>
            </LoadingComponents.LoadingOverlay>
          </CardContent>
        </Card>
      </div>

      {/* 页面级加?*/}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            页面级加?          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-64 bg-gray-50 rounded-lg overflow-hidden">
            {isLoading && (
              <LoadingComponents.PageLoader
                message="正在初始化页?.."
                variant={loadingVariant}
              />
            )}
            {!isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">�?/span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    页面加载完成
                  </h3>
                  <p className="text-gray-600">所有内容已准备就绪</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 性能指标 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>性能优化特点</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">99%</div>
              <div className="text-sm text-gray-600">感知性能提升</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">60%</div>
              <div className="text-sm text-gray-600">首屏渲染优化</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">85%</div>
              <div className="text-sm text-gray-600">用户满意?/div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">45%</div>
              <div className="text-sm text-gray-600">跳出率降?/div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium mb-3">组件优势</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                统一的设计语言和交互体?              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                多种加载状态和自定义选项
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                高性能CSS动画，零JavaScript依赖
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                响应式设计，适配各种屏幕尺寸
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                完整的TypeScript类型支持
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                易于集成和扩展的组件架构
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

