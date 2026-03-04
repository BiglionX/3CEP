'use client';

import Link from 'next/link';
import { GitHubStats, GitHubTopics } from '@/lib/github';

export default function PartLookupSkillPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/skill-store"
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            �?返回商店首页
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-6xl">🔧</span>
            <div>
              <h1 className="text-4xl font-bold mb-2">procyc-part-lookup</h1>
              <p className="text-xl text-blue-100">
                根据设备型号查询兼容配件的技?              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-8">
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
              🔧 配件?(PART)
            </span>
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
              v1.0.0
            </span>
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
              �?4.7/5.0
            </span>
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
              ⬇️ 623 下载
            </span>
          </div>

          {/* GitHub 统计信息 */}
          <div className="mt-6 bg-white bg-opacity-20 rounded-lg p-4 inline-block">
            <GitHubStats repoName="procyc-part-lookup" detailed />
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
                📋 技能简?              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  procyc-part-lookup
                </code>{' '}
                是一个专业的配件兼容性查询技能，支持根据设备型号快速查找兼容的配件信息?                内置多维度筛选和智能排序功能，帮助维修人员快速找到合适的配件?              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                核心特?              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">�?/span>
                  <span className="text-gray-700">
                    <strong>精准匹配</strong> - 基于设备型号的配件兼容性验?                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">�?/span>
                  <span className="text-gray-700">
                    <strong>多维筛?/strong> - 支持按分类、价格、库存筛?                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">�?/span>
                  <span className="text-gray-700">
                    <strong>智能排序</strong> - 价格、库存、相关性多种排序方?                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">�?/span>
                  <span className="text-gray-700">
                    <strong>实时库存</strong> - 显示配件库存状?                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">�?/span>
                  <span className="text-gray-700">
                    <strong>FCX 定价</strong> - 支持平台积分定价
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">�?/span>
                  <span className="text-gray-700">
                    <strong>高性能</strong> - P95 响应时间 &lt; 500ms
                  </span>
                </li>
              </ul>

              <GitHubTopics
                topics={[
                  '3c-repair',
                  'parts',
                  'compatibility',
                  'inventory',
                  'b2b',
                ]}
              />
            </section>

            {/* Installation */}
            <section className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📦 安装</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    JavaScript/TypeScript
                  </h3>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-gray-100 font-mono text-sm">
                      {`npm install procyc-part-lookup`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Python
                  </h3>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-gray-100 font-mono text-sm">
                      {`pip install procyc-part-lookup`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* Usage Examples */}
            <section className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                💡 使用示例
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    JavaScript/TypeScript
                  </h3>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-gray-100 font-mono text-sm">
                      {`import partLookup from 'procyc-part-lookup';

// 基础查询
const result = await partLookup.execute({
  deviceModel: 'iPhone 13 Pro',
});

// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(result.data?.parts)// 带筛选条?const filtered = await partLookup.execute({
  deviceModel: 'Samsung Galaxy S21',
  category: '电池',
  minPrice: 50,
  maxPrice: 200,
  inStock: true,
  sortBy: 'price_asc',
});

// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(filtered.data?.parts)`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Python
                  </h3>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-gray-100 font-mono text-sm">
                      {`from procyc_part_lookup import PartLookupSkill

skill = PartLookupSkill()

# 基础查询
result = skill.execute({
    "deviceModel": "iPhone 13 Pro"
})

print(result.data.parts)

# 带筛选条?filtered = skill.execute({
    "deviceModel": "Samsung Galaxy S21",
    "category": "电池",
    "minPrice": 50,
    "maxPrice": 200,
    "inStock": True,
    "sortBy": "price_asc"
})`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* API Reference */}
            <section className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                📖 API 参?              </h2>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                输入参数
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        参数
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        类型
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        必填
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        默认?                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        说明
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 font-mono text-sm text-gray-900">
                        deviceModel
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        string
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600">�?/td>
                      <td className="px-4 py-3 text-sm text-gray-500">-</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        设备型号（如 "iPhone 13 Pro"�?                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-sm text-gray-900">
                        category
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        string
                      </td>
                      <td className="px-4 py-3 text-sm text-yellow-600">�?/td>
                      <td className="px-4 py-3 text-sm text-gray-500">-</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        配件分类（电池、屏幕、摄像头等）
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-sm text-gray-900">
                        minPrice
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        number
                      </td>
                      <td className="px-4 py-3 text-sm text-yellow-600">�?/td>
                      <td className="px-4 py-3 text-sm text-gray-500">-</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        最低价?                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-sm text-gray-900">
                        maxPrice
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        number
                      </td>
                      <td className="px-4 py-3 text-sm text-yellow-600">�?/td>
                      <td className="px-4 py-3 text-sm text-gray-500">-</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        最高价?                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-sm text-gray-900">
                        inStock
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        boolean
                      </td>
                      <td className="px-4 py-3 text-sm text-yellow-600">�?/td>
                      <td className="px-4 py-3 text-sm text-gray-500">false</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        仅显示有库存
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-sm text-gray-900">
                        sortBy
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        string
                      </td>
                      <td className="px-4 py-3 text-sm text-yellow-600">�?/td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        relevance
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        排序方式：price_asc, price_desc, stock, relevance
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                输出格式
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                <pre className="text-gray-800 font-mono text-sm">
                  {`{
  success: boolean;
  data?: {
    parts: Array<{
      id: string;
      name: string;
      category: string;
      price: number;
      currency: string;
      inStock: boolean;
      stockQuantity: number;
      compatibility: string[];
      specs: Record<string, any>;
    }>;
    total: number;
    filters: {
      appliedFilters: Record<string, any>;
      availableCategories: string[];
      priceRange: { min: number; max: number };
    };
  };
  error?: {
    code: string;
    message: string;
  };
  metadata: {
    executionTimeMs: number;
    version: string;
    timestamp: number;
  };
}`}
                </pre>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                快速操?              </h3>
              <div className="space-y-3">
                <Link
                  href="/skill-store/sandbox?skill=procyc-part-lookup"
                  className="block w-full px-4 py-2 bg-indigo-600 text-white text-center font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  🧪 在线测试
                </Link>
                <a
                  href="https://github.com/procyc-skills/procyc-part-lookup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2 bg-gray-100 text-gray-700 text-center font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  🔗 GitHub 仓库
                </a>
                <Link
                  href="/docs/spec"
                  className="block w-full px-4 py-2 bg-gray-100 text-gray-700 text-center font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  📚 技能规?                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                统计信息
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">版本</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">大小</span>
                  <span className="font-medium">~800 KB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">许可?/span>
                  <span className="font-medium">MIT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">语言</span>
                  <span className="font-medium">TypeScript</span>
                </div>
              </div>
            </div>

            {/* Related Skills */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                相关技?              </h3>
              <div className="space-y-3">
                <Link
                  href="/skill-store/find-shop"
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📍</span>
                    <div>
                      <div className="font-medium text-gray-900">
                        procyc-find-shop
                      </div>
                      <div className="text-sm text-gray-500">
                        附近维修店查?                      </div>
                    </div>
                  </div>
                </Link>
                <Link
                  href="/skill-store/fault-diagnosis"
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔍</span>
                    <div>
                      <div className="font-medium text-gray-900">
                        procyc-fault-diagnosis
                      </div>
                      <div className="text-sm text-gray-500">设备故障诊断</div>
                    </div>
                  </div>
                </Link>
                <Link
                  href="/skill-store/estimate-value"
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💰</span>
                    <div>
                      <div className="font-medium text-gray-900">
                        procyc-estimate-value
                      </div>
                      <div className="text-sm text-gray-500">设备智能估价</div>
                    </div>
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

