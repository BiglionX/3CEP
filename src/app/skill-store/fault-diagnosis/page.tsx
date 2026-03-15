'use client';

import Link from 'next/link';

export default function FaultDiagnosisSkillPage() {
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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-6xl">🔍</span>
            <div>
              <h1 className="text-4xl font-bold mb-2">
                procyc-fault-diagnosis
              </h1>
              <p className="text-xl text-purple-100">
                基于大模型的 3C 设备故障智能诊断
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-8">
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
              🔍 诊断分析 (DIAG)
            </span>
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
              v1.0.0
            </span>
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
              ⭐ 4.8/5.0
            </span>
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
              ⬇️ 856 下载
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
                📋 技能简介
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  procyc-fault-diagnosis
                </code>{' '}
                是一个基于大模型的 3C 设备故障诊断技能，内置 14+
                常见故障案例库，支持手机、平板、笔记本等多种设备类型的智能诊断。
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                核心特性
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">
                    <strong>知识库驱动</strong> - 无需实时调用大模型，降低成本
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">
                    <strong>多设备支持</strong> - 手机/平板/笔记本/台式机
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">
                    <strong>智能症状匹配</strong> - 关键词提取和模糊匹配
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">
                    <strong>配件建议</strong> - 提供维修配件和难度评估
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">
                    <strong>极速响应</strong> - 亚毫秒级性能 (&lt;1ms)
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
                      npm install procyc-fault-diagnosis
                    </code>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    pypi
                  </h3>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <code className="text-green-400 font-mono text-sm">
                      pip install procyc-fault-diagnosis
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
                      {`import faultDiagnosis from 'procyc-fault-diagnosis';

const result = await faultDiagnosis.execute({
  deviceType: 'phone',
  brand: 'apple',
  symptoms: '无法开机，屏幕不亮'
});`}
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
                        参数名
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        类型
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        必填
                      </th>
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
                      <td className="px-4 py-3 text-sm text-red-600">是</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        设备类型 (phone/tablet/laptop/desktop)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-sm text-gray-900">
                        brand
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        string
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600">是</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        设备品牌
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-sm text-gray-900">
                        symptoms
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        string
                      </td>
                      <td className="px-4 py-3 text-sm text-red-600">是</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        故障症状描述
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                快速操作
              </h3>
              <div className="space-y-3">
                <a
                  href="https://github.com/procyc-skills/procyc-fault-diagnosis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2 bg-indigo-600 text-white text-center rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  🐙 GitHub 仓库
                </a>
                <Link
                  href="/docs/skills/fault-diagnosis"
                  className="block w-full px-4 py-2 bg-gray-100 text-gray-700 text-center rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  📖 完整文档
                </Link>
                <Link
                  href="/examples/fault-diagnosis"
                  className="block w-full px-4 py-2 bg-gray-100 text-gray-700 text-center rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  💡 示例代码
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📊 统计信息
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">功能测试</span>
                  <span className="font-medium text-gray-900">7 个</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">测试通过率</span>
                  <span className="font-medium text-green-600">100%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">故障案例</span>
                  <span className="font-medium text-blue-600">14+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">最后更新</span>
                  <span className="font-medium text-gray-900">2026-03-03</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
