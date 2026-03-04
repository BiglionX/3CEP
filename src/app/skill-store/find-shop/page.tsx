'use client';

import Link from 'next/link';

export default function FindShopSkillPage() {
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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-6xl">📍</span>
            <div>
              <h1 className="text-4xl font-bold mb-2">procyc-find-shop</h1>
              <p className="text-xl text-indigo-100">
                基于地理位置的附近维修店查询技?              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-8">
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
              📍 定位服务 (LOCA)
            </span>
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
              v1.0.0
            </span>
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
              �?4.9/5.0
            </span>
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
              ⬇️ 1.2k 下载
            </span>
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
                  procyc-find-shop
                </code>{' '}
                是一个基于地理位置的维修店查询技能， 支持快速查找附近的 3C
                维修服务点。采用高效的距离计算算法，实现亚毫秒级响应速度?              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                核心特?              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">�?/span>
                  <span className="text-gray-700">
                    <strong>精准定位</strong> - 基于经纬度的精确距离计算
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">�?/span>
                  <span className="text-gray-700">
                    <strong>半径筛?/strong> - 自定义搜索范围（公里?                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">�?/span>
                  <span className="text-gray-700">
                    <strong>智能排序</strong> - 按距离自动排?                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">�?/span>
                  <span className="text-gray-700">
                    <strong>极速响?/strong> - 亚毫秒级性能 (&lt;1ms)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">�?/span>
                  <span className="text-gray-700">
                    <strong>多平台支?/strong> - JavaScript �?Python
                  </span>
                </li>
              </ul>
            </section>

            {/* Installation */}
            <section className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📦 安装</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    npm
                  </h3>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <code className="text-green-400 font-mono text-sm">
                      npm install procyc-find-shop
                    </code>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    pypi
                  </h3>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <code className="text-green-400 font-mono text-sm">
                      pip install procyc-find-shop
                    </code>
                  </div>
                </div>
              </div>
            </section>

            {/* Usage */}
            <section className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🚀 使用示例
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    JavaScript/TypeScript
                  </h3>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-gray-100 font-mono text-sm">
                      {`import findShop from 'procyc-find-shop';

const result = await findShop.execute({
  latitude: 39.9042,
  longitude: 116.4074,
  radius: 10,  // 公里
  limit: 5     // 返回数量
});

// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(result.data?.shops)`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Python
                  </h3>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-gray-100 font-mono text-sm">
                      {`from procyc_find_shop import FindShopSkill

skill = FindShopSkill()
result = skill.execute({
    "latitude": 39.9042,
    "longitude": 116.4074,
    "radius": 10,
    "limit": 5
})

print(result.data.shops)`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* API Documentation */}
            <section className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                📖 API 文档
              </h2>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                输入参数
              </h3>
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        参数?                      </th>
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
                        latitude
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        number
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600">�?/td>
                      <td className="px-4 py-3 text-sm text-gray-500">-</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        纬度 (-90 �?90)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-sm text-gray-900">
                        longitude
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        number
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600">�?/td>
                      <td className="px-4 py-3 text-sm text-gray-500">-</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        经度 (-180 �?180)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-sm text-gray-900">
                        radius
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        number
                      </td>
                      <td className="px-4 py-3 text-sm text-yellow-600">�?/td>
                      <td className="px-4 py-3 text-sm text-gray-500">5</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        搜索半径（公里）
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-sm text-gray-900">
                        limit
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        number
                      </td>
                      <td className="px-4 py-3 text-sm text-yellow-600">�?/td>
                      <td className="px-4 py-3 text-sm text-gray-500">10</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        返回数量限制
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                输出格式
              </h3>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-gray-100 font-mono text-sm">
                  {`interface Shop {
  id: string;
  name: string;
  address: string;
  city: string;
  distance: number;  // 距离（公里）
  phone?: string;
  rating?: number;
}

interface SkillOutput {
  success: boolean;
  data?: {
    shops: Shop[];
    total: number;
  };
  error?: {
    code: string;
    message: string;
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
                <a
                  href="https://github.com/procyc-skills/procyc-find-shop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2 bg-indigo-600 text-white text-center rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  🐙 GitHub 仓库
                </a>
                <Link
                  href="/docs/skills/find-shop"
                  className="block w-full px-4 py-2 bg-gray-100 text-gray-700 text-center rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  📖 完整文档
                </Link>
                <Link
                  href="/examples/find-shop"
                  className="block w-full px-4 py-2 bg-gray-100 text-gray-700 text-center rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  💡 示例代码
                </Link>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                �?性能指标
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">P50</span>
                    <span className="font-medium text-green-600">
                      &lt;0.5ms �?                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: '95%' }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">P95</span>
                    <span className="font-medium text-green-600">
                      &lt;0.8ms �?                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: '90%' }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">P99</span>
                    <span className="font-medium text-green-600">
                      &lt;1ms �?                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: '85%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📊 统计信息
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">单元测试</span>
                  <span className="font-medium text-gray-900">13 �?/span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">测试通过?/span>
                  <span className="font-medium text-green-600">100% �?/span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">代码覆盖?/span>
                  <span className="font-medium text-blue-600">85%+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">最后更?/span>
                  <span className="font-medium text-gray-900">2026-03-02</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

