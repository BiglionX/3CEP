'use client';

import Link from 'next/link';
import { GitHubStats } from '@/lib/github';

export default function PartPriceSkillPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/skill-store"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← 返回商店首页
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-6xl">🏷️</span>
            <div>
              <h1 className="text-4xl font-bold mb-2">procyc-part-price</h1>
              <p className="text-xl text-purple-100">配件价格查询技能</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-8">
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
              🔧 配件类 (PART)
            </span>
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
              v1.0.0
            </span>
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
              ⭐ 4.8/5.0
            </span>
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
              ⬇️ 312 下载
            </span>
          </div>

          {/* GitHub 统计信息 */}
          <div className="mt-6 bg-white bg-opacity-20 rounded-lg p-4 inline-block">
            <GitHubStats repoName="procyc-part-price" detailed />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <section className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                📋 技能简介
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  procyc-part-price
                </code>{' '}
                是一个专业的配件价格查询技能，支持查询配件的市场价格、库存情况和最优供应商报价。
                帮助维修人员和采购人员快速获取最新的配件价格信息。
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                核心特性
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">
                    <strong>实时价格</strong> - 查询配件最新市场价格
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">
                    <strong>库存查询</strong> - 实时查看各供应商库存情况
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">
                    <strong>价格比价</strong> - 多供应商价格对比分析
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">
                    <strong>历史价格</strong> - 查看价格走势图
                  </span>
                </li>
              </ul>
            </section>

            {/* 使用场景 */}
            <section className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                💡 使用场景
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">
                    维修报价
                  </h4>
                  <p className="text-sm text-purple-700">
                    快速获取配件成本，生成准确的维修报价单
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">
                    批量采购
                  </h4>
                  <p className="text-sm text-purple-700">
                    对比多家供应商价格，获取最优采购方案
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">
                    库存管理
                  </h4>
                  <p className="text-sm text-purple-700">
                    实时监控库存水位，自动提醒补货
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">
                    供应商管理
                  </h4>
                  <p className="text-sm text-purple-700">
                    评估供应商价格竞争力，优化采购渠道
                  </p>
                </div>
              </div>
            </section>

            {/* API 接口 */}
            <section className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🔌 API 接口
              </h2>
              <div className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <code className="text-green-600 font-mono">
                      POST /api/skills/part-price/query
                    </code>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 text-sm mb-2">查询配件价格</p>
                    <pre className="bg-gray-900 text-green-300 p-3 rounded text-xs overflow-x-auto">
                      {`{
  "partName": "iPhone 14 屏幕总成",
  "brand": "Apple",
  "model": "iPhone 14",
  "condition": "全新/原装/兼容"
}`}
                    </pre>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <code className="text-green-600 font-mono">
                      GET /api/skills/part-price/suppliers
                    </code>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 text-sm mb-2">获取供应商列表</p>
                    <pre className="bg-gray-900 text-green-300 p-3 rounded text-xs overflow-x-auto">
                      {`{
  "suppliers": [
    {"name": "华强北", "price": 280, "stock": 50},
    {"name": "赛格", "price": 295, "stock": 30}
  ]
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* 安装 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📥 安装使用
              </h3>
              <div className="space-y-3">
                <div className="bg-gray-900 rounded-lg p-3">
                  <code className="text-green-300 font-mono text-sm">
                    npm install @procyc/part-price
                  </code>
                </div>
                <p className="text-sm text-gray-600">或在技能商店直接安装</p>
                <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  安装技能
                </button>
              </div>
            </div>

            {/* 统计 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📊 数据统计
              </h3>
              <ul className="space-y-3">
                <li className="flex justify-between">
                  <span className="text-gray-600">总配件数</span>
                  <span className="font-medium">50,000+</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">合作供应商</span>
                  <span className="font-medium">200+</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">日均查询</span>
                  <span className="font-medium">10,000+</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">价格准确率</span>
                  <span className="font-medium">99.5%</span>
                </li>
              </ul>
            </div>

            {/* 相关技能 */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🔗 相关技能
              </h3>
              <div className="space-y-2">
                <Link
                  href="/skill-store/part-lookup"
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>🔧</span>
                    <span className="text-sm font-medium">配件兼容性查询</span>
                  </div>
                </Link>
                <Link
                  href="/skill-store/battery-version"
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>🔋</span>
                    <span className="text-sm font-medium">电池版本查询</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
