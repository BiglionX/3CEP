'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, Navigation, Eye } from 'lucide-react';

export default function NavigationFixVerification() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            导航修复验证页面
          </h1>
          <p className="text-lg text-gray-600">验证首页导航修复结果</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">修复内容</h2>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>调整了统一布局的padding设置</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>优化了首页Hero部分的间距</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>确保导航栏高度与内容间距匹配</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Eye className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">验证步骤</h2>
            </div>
            <ol className="space-y-3 text-gray-700 list-decimal list-inside">
              <li>访问首页查看导航显示</li>
              <li>滚动页面测试导航固定效果</li>
              <li>检查移动端菜单功能</li>
              <li>验证其他页面导航一致性</li>
            </ol>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">测试链接</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link href="/" className="block">
              <Button className="w-full" variant="outline">
                <Navigation className="w-4 h-4 mr-2" />
                首页
              </Button>
            </Link>
            <Link href="/contact" className="block">
              <Button className="w-full" variant="outline">
                联系我们
              </Button>
            </Link>
            <Link href="/about" className="block">
              <Button className="w-full" variant="outline">
                关于我们
              </Button>
            </Link>
            <Link href="/help" className="block">
              <Button className="w-full" variant="outline">
                帮助中心
              </Button>
            </Link>
            <Link href="/debug-navigation" className="block">
              <Button className="w-full" variant="outline">
                导航调试
              </Button>
            </Link>
            <Link href="/navigation-test" className="block">
              <Button className="w-full" variant="outline">
                导航测试
              </Button>
            </Link>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-6">
            如果问题仍然存在，请提供更多详细信息以便进一步排查
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/">返回首页</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/debug-navigation">详细调试</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
