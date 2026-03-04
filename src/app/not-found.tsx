'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Home,
  Search,
  MessageSquare,
  ArrowLeft,
  Wrench,
  Phone,
  HelpCircle,
} from 'lucide-react';

export default function NotFoundPage() {
  const suggestedPages = [
    { name: '首页', href: '/', icon: Home },
    { name: '帮助中心', href: '/help', icon: MessageSquare },
    { name: '设备维修', href: '/user/devices', icon: Wrench },
    { name: '联系我们', href: '/contact', icon: Phone },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* 错误图标 */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-8">
          <AlertTriangle className="w-12 h-12 text-red-600" />
        </div>

        {/* 错误信息 */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-4">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
            页面未找?{' '}
          </h2>
          <p className="text-gray-600 text-lg max-w-md mx-auto">
            抱歉，您访问的页面不存在或已被移除。请检查URL是否正确，或尝试以下操作?{' '}
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
            <Link href="/">
              <Home className="w-5 h-5 mr-2" />
              返回首页
            </Link>
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回上一?{' '}
          </Button>
        </div>

        {/* 推荐页面 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center justify-center">
            <Search className="w-5 h-5 mr-2 text-blue-600" />
            您可能想访问
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {suggestedPages.map(page => {
              const Icon = page.icon;
              return (
                <Link
                  key={page.href}
                  href={page.href}
                  className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900 group-hover:text-blue-600">
                    {page.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 联系支持 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <p className="text-gray-600 mb-4">
            如果您认为这是一个错误，请联系我们的技术支持团?{' '}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" asChild>
              <Link href="/contact">
                <MessageSquare className="w-4 h-4 mr-2" />
                联系客服
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/help">
                <HelpCircle className="w-4 h-4 mr-2" />
                帮助中心
              </Link>
            </Button>
          </div>
        </div>

        {/* 页脚信息 */}
        <div className="mt-8 text-sm text-gray-500">
          <p>错误代码: 404_NOT_FOUND</p>
          <p className="mt-1">
            如果您持续遇到此问题，请保存此页面信息并联系技术支?{' '}
          </p>
        </div>
      </div>
    </div>
  );
}
