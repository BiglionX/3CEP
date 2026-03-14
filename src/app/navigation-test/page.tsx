'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Navigation, Layout, Users, Wrench } from 'lucide-react';

export default function NavigationTestPage() {
  const testPages = [
    { name: '首页', path: '/', icon: Navigation },
    { name: '联系我们', path: '/contact', icon: Users },
    { name: '关于我们', path: '/about', icon: Layout },
    { name: '帮助中心', path: '/help', icon: Wrench },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            统一导航测试页面
          </h1>
          <p className="text-lg text-gray-600">
            验证所有页面都能正确显示统一的顶部导航和底部页脚
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              导航组件状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <span className="font-medium text-green-800">顶部导航</span>
                <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm">
                  已启用
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <span className="font-medium text-green-800">底部页脚</span>
                <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm">
                  已启用
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>测试页面链接</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {testPages.map(page => {
                const Icon = page.icon;
                return (
                  <a
                    key={page.path}
                    href={page.path}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-blue-600" />
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {page.name}
                        </h3>
                        <p className="text-sm text-gray-500">{page.path}</p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Button asChild>
            <a href="/">返回首页</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
