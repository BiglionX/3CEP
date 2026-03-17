'use client';

import Link from 'next/link';
import { GitHubStats } from '@/lib/github';

export default function BatteryVersionSkillPage() {
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
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-6xl">🔋</span>
            <div>
              <h1 className="text-4xl font-bold mb-2">
                procyc-battery-version
              </h1>
              <p className="text-xl text-green-100">电池版本查询技能</p>
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
              ⭐ 4.7/5.0
            </span>
            <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium">
              ⬇️ 287 下载
            </span>
          </div>

          {/* GitHub 统计信息 */}
          <div className="mt-6 bg-white bg-opacity-20 rounded-lg p-4 inline-block">
            <GitHubStats repoName="procyc-battery-version" detailed />
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
                  procyc-battery-version
                </code>{' '}
                是一个专业的电池版本查询技能，支持根据设备型号查询原装电池规格和兼容替代型号。
                帮助维修人员快速找到合适的电池配件，避免因电池不匹配导致的维修问题。
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                核心特性
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">
                    <strong>原装查询</strong> - 查询设备原装电池型号和规格
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">
                    <strong>兼容匹配</strong> - 智能推荐兼容的第三方电池
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">
                    <strong>健康检测</strong> - 支持电池健康度读取和评估
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">
                    <strong>安全认证</strong> - 显示电池安全认证信息
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
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">
                    换电池服务
                  </h4>
                  <p className="text-sm text-green-700">
                    快速查询设备型号对应的原装电池规格
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">
                    电池选购
                  </h4>
                  <p className="text-sm text-green-700">
                    获取兼容电池推荐，对比不同品牌
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">
                    库存管理
                  </h4>
                  <p className="text-sm text-green-700">管理常用电池型号库存</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">
                    客户咨询
                  </h4>
                  <p className="text-sm text-green-700">
                    解答客户关于电池兼容性的问题
                  </p>
                </div>
              </div>
            </section>

            {/* 支持的设备 */}
            <section className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                📱 支持的设备
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">🍎</div>
                  <h4 className="font-medium">Apple</h4>
                  <p className="text-sm text-gray-500">iPhone 全系列</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">📱</div>
                  <h4 className="font-medium">Samsung</h4>
                  <p className="text-sm text-gray-500">Galaxy S/Note/A系列</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">📱</div>
                  <h4 className="font-medium">Huawei</h4>
                  <p className="text-sm text-gray-500">Mate/P/nova系列</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">📱</div>
                  <h4 className="font-medium">Xiaomi</h4>
                  <p className="text-sm text-gray-500">小米/红米系列</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">📱</div>
                  <h4 className="font-medium">OPPO</h4>
                  <p className="text-sm text-gray-500">Find/Reno/A系列</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">📱</div>
                  <h4 className="font-medium">vivo</h4>
                  <p className="text-sm text-gray-500">X/Y/S系列</p>
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
                    npm install @procyc/battery-version
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
                  <span className="text-gray-600">支持型号</span>
                  <span className="font-medium">5,000+</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">电池库品牌</span>
                  <span className="font-medium">100+</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">日均查询</span>
                  <span className="font-medium">5,000+</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-gray-600">匹配准确率</span>
                  <span className="font-medium">98%</span>
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
                  href="/skill-store/part-price"
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>🏷️</span>
                    <span className="text-sm font-medium">配件价格查询</span>
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
