'use client';

import React from 'react';
import { SimpleSearch } from '@/components/search/SimpleSearch';
import { EnhancedSearch } from '@/components/search/EnhancedSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SearchDemoPage() {
  const handleSimpleSearch = (query: string) => {
    toast.success(`执行搜索: ${query}`);
  };

  const handleEnhancedSearch = (result: any) => {
    toast.info(`选择了: ${result.title}`);
  };

  const handleResultSelect = (result: any) => {
    toast.success(`跳转到: ${result.url}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            搜索组件演示
          </h1>
          <p className="text-gray-600">展示兼容Next.js的搜索组件实现</p>
        </div>

        <div className="grid gap-8">
          {/* 简单搜索组件 */}
          <Card>
            <CardHeader>
              <CardTitle>简单搜索组件</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  基础搜索输入框，支持回车和按钮触发搜索
                </p>
                <SimpleSearch
                  placeholder="输入搜索关键字..."
                  onSearch={handleSimpleSearch}
                  className="max-w-md"
                />
                <div className="text-sm text-gray-500">
                  特性：轻量级、无依赖、完全兼容Next.js Server/Client Components
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 增强搜索组件 */}
          <Card>
            <CardHeader>
              <CardTitle>增强搜索组件</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">带搜索结果展示的完整搜索组件</p>
                <div className="max-w-md">
                  <EnhancedSearch
                    placeholder="搜索工单、客户、设备..."
                    onResultSelect={handleResultSelect}
                  />
                </div>
                <div className="text-sm text-gray-500">
                  特性：搜索结果展示、错误处理、加载状态、结果选择
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 技术说明 */}
          <Card>
            <CardHeader>
              <CardTitle>技术实现说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    解决的兼容性问题
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 移除了复杂的类实例传递</li>
                    <li>• 使用纯函数式API设计</li>
                    <li>• 避免了不可序列化对象的传递</li>
                    <li>• 完全兼容Next.js App Router</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">性能优化</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 使用useCallback优化函数引用</li>
                    <li>• 合理的状态管理</li>
                    <li>• 防抖和节流机制</li>
                    <li>• 懒加载搜索结果</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">可扩展性</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 易于集成真实API</li>
                    <li>• 支持自定义搜索逻辑</li>
                    <li>• 可配置的UI组件</li>
                    <li>• 完善的TypeScript支持</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 测试按钮 */}
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => toast.info('这是一个测试通知')}
            >
              测试通知
            </Button>
            <Button onClick={() => window.location.reload()}>刷新页面</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
