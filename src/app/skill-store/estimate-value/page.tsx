'use client';

import Link from 'next/link';
import { GitHubStats, GitHubTopics } from '@/lib/github';

export default function EstimateValueSkillPage() {
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
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-6xl">💰</span>
            <div>
              <h1 className="text-4xl font-bold mb-2">procyc-estimate-value</h1>
              <p className="text-xl text-green-100">
                基于设备档案和市场数据的智能估价技?              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-8">
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
              💰 估价?(ESTM)
            </span>
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
              v1.0.0
            </span>
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
              �?4.9/5.0
            </span>
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
              ⬇️ 445 下载
            </span>
          </div>

          {/* GitHub 统计信息 */}
          <div className="mt-6 bg-white bg-opacity-20 rounded-lg p-4 inline-block">
            <GitHubStats repoName="procyc-estimate-value" detailed />
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
                  procyc-estimate-value
                </code>{' '}
                是一个专业的设备估价技能，基于多维度估值算法（品牌、成色、年龄、维修历史）
                结合市场价格对比，为 3C 设备提供精准的估值服务。集?FixCycle
                估值引擎， 支持多种货币定价（CNY/FCX/USD）�?              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                核心特?              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">�?/span>
                  <span className="text-gray-700">
                    <strong>多维度估?/strong> -
                    综合考虑品牌、成色、年龄、维修历?                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">�?/span>
                  <span className="text-gray-700">
                    <strong>市场数据对比</strong> - 实时比对闲鱼等二手平台价?                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">�?/span>
                  <span className="text-gray-700">
                    <strong>详细估值分?/strong> - 提供透明的价格构成分?                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">�?/span>
                  <span className="text-gray-700">
                    <strong>FixCycle 集成</strong> - 接入专业估值引?                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">�?/span>
                  <span className="text-gray-700">
                    <strong>多货币支?/strong> - CNY/FCX/USD三种货币
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">�?/span>
                  <span className="text-gray-700">
                    <strong>高准确率</strong> - 与市场成交价对比准确?&gt; 85%
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">�?/span>
                  <span className="text-gray-700">
                    <strong>性能优秀</strong> - P95 响应时间 &lt; 800ms
                  </span>
                </li>
              </ul>

              <GitHubTopics
                topics={[
                  'valuation',
                  'pricing',
                  'market-analysis',
                  'ai-powered',
                  'second-hand',
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
                      {`npm install procyc-estimate-value`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Python
                  </h3>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-gray-100 font-mono text-sm">
                      {`pip install procyc-estimate-value`}
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
                      {`import estimateValue from 'procyc-estimate-value';

// 基础估价
const result = await estimateValue.execute({
  deviceType: 'smartphone',
  brand: 'Apple',
  model: 'iPhone 13 Pro',
  condition: 'good',
  ageMonths: 12,
});

// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(result.data?.valuation)// 详细评估（包含维修历史）
const detailed = await estimateValue.execute({
  deviceType: 'laptop',
  brand: 'MacBook Pro',
  model: '2021 M1 Pro',
  condition: 'excellent',
  ageMonths: 18,
  repairHistory: [
    { type: 'screen_replacement', date: '2022-06-15' }
  ],
  currency: 'CNY',
});

// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(detailed.data?.marketAnalysis)`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Python
                  </h3>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-gray-100 font-mono text-sm">
                      {`from procyc_estimate_value import EstimateValueSkill

skill = EstimateValueSkill()

# 基础估价
result = skill.execute({
    "deviceType": "smartphone",
    "brand": "Apple",
    "model": "iPhone 13 Pro",
    "condition": "good",
    "ageMonths": 12
})

print(result.data.valuation)

# 详细评估
detailed = skill.execute({
    "deviceType": "laptop",
    "brand": "MacBook Pro",
    "model": "2021 M1 Pro",
    "condition": "excellent",
    "ageMonths": 18,
    "repairHistory": [
        {"type": "screen_replacement", "date": "2022-06-15"}
    ],
    "currency": "CNY"
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
                        deviceType
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        string
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600">�?/td>
                      <td className="px-4 py-3 text-sm text-gray-500">-</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        设备类型（smartphone/laptop/tablet/desktop�?                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-sm text-gray-900">
                        brand
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        string
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600">�?/td>
                      <td className="px-4 py-3 text-sm text-gray-500">-</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        品牌名称
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-sm text-gray-900">
                        model
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        string
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600">�?/td>
                      <td className="px-4 py-3 text-sm text-gray-500">-</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        具体型号
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-sm text-gray-900">
                        condition
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        string
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600">�?/td>
                      <td className="px-4 py-3 text-sm text-gray-500">-</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        成色等级（excellent/good/fair/poor�?                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-sm text-gray-900">
                        ageMonths
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        number
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600">�?/td>
                      <td className="px-4 py-3 text-sm text-gray-500">-</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        使用月数
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-sm text-gray-900">
                        repairHistory
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">array</td>
                      <td className="px-4 py-3 text-sm text-yellow-600">�?/td>
                      <td className="px-4 py-3 text-sm text-gray-500">[]</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        维修历史记录
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-sm text-gray-900">
                        currency
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        string
                      </td>
                      <td className="px-4 py-3 text-sm text-yellow-600">�?/td>
                      <td className="px-4 py-3 text-sm text-gray-500">CNY</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        货币类型（CNY/FCX/USD�?                      </td>
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
    valuation: {
      minPrice: number;
      maxPrice: number;
      averagePrice: number;
      recommendedPrice: number;
      currency: string;
    };
    marketAnalysis: {
      demandLevel: 'high' | 'medium' | 'low';
      trendingDirection: 'up' | 'stable' | 'down';
      similarListings: number;
      averageSellingTime?: string;
    };
    comparableSales: Array<{
      price: number;
      condition: string;
      soldDate?: string;
      source: 'xianyu' | 'other';
    }>;
    breakdown: {
      baseValue: number;
      conditionAdjustment: number;
      ageAdjustment: number;
      brandPremium: number;
      repairImpact: number;
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

            {/* Performance Metrics */}
            <section className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                📊 性能指标
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    P95 &lt; 800ms
                  </div>
                  <div className="text-sm text-gray-600 mt-1">响应时间</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    &gt; 85%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">估价准确?/div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">500+</div>
                  <div className="text-sm text-gray-600 mt-1">支持型号</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    &lt; 24h
                  </div>
                  <div className="text-sm text-gray-600 mt-1">数据更新</div>
                </div>
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
                  href="/skill-store/sandbox?skill=procyc-estimate-value"
                  className="block w-full px-4 py-2 bg-indigo-600 text-white text-center font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  🧪 在线测试
                </Link>
                <a
                  href="https://github.com/procyc-skills/procyc-estimate-value"
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
                  <span className="font-medium">~1.2 MB</span>
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
                  href="/skill-store/part-lookup"
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔧</span>
                    <div>
                      <div className="font-medium text-gray-900">
                        procyc-part-lookup
                      </div>
                      <div className="text-sm text-gray-500">
                        配件兼容性查?                      </div>
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

