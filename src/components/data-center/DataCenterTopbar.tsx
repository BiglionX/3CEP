/**
 * 数据中心专用顶部导航条组件
 * 显示数据中心各模块的快速入口导航
 */

'use client';

import {
  ArrowLeft,
  BarChart3,
  Database,
  FileText,
  Monitor,
  Plus,
  Search,
  Settings,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

/**
 * 数据中心模块导航配置
 */
const DATA_CENTER_MODULES = [
  {
    name: '数据总览',
    href: '/data-center',
    icon: BarChart3,
    color: 'blue',
  },
  {
    name: '元数据',
    href: '/data-center/metadata',
    icon: FileText,
    color: 'purple',
  },
  {
    name: '数据源',
    href: '/data-center/sources',
    icon: Database,
    color: 'green',
  },
  {
    name: '查询',
    href: '/data-center/query',
    icon: Search,
    color: 'indigo',
  },
  {
    name: '建模',
    href: '/data-center/designer',
    icon: Plus,
    color: 'teal',
  },
  {
    name: '监控',
    href: '/data-center/monitoring',
    icon: Monitor,
    color: 'orange',
  },
  {
    name: '安全',
    href: '/data-center/security',
    icon: Shield,
    color: 'red',
  },
  {
    name: '设置',
    href: '/data-center/settings',
    icon: Settings,
    color: 'gray',
  },
];

export default function DataCenterTopbar() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 shadow-lg">
      {/* 动态背景效果 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent)]"></div>
      </div>

      <div className="relative px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 左侧：Logo */}
          <div className="flex items-center">
            <Link
              href="/data-center"
              className="flex items-center space-x-2 group"
            >
              <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm p-2 rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 border border-white/30">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div className="hidden lg:block">
                <h2 className="text-white font-bold text-lg tracking-wide drop-shadow-lg">
                  数据中心
                </h2>
                <p className="text-white/80 text-xs font-medium -mt-1">
                  统一管理平台
                </p>
              </div>
            </Link>
          </div>

          {/* 中间：居中的模块导航 */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-2">
              {DATA_CENTER_MODULES.map(module => {
                const Icon = module.icon;
                const colors: Record<
                  string,
                  { bg: string; text: string; hoverBg: string }
                > = {
                  blue: {
                    bg: 'bg-blue-100',
                    text: 'text-blue-700',
                    hoverBg: 'hover:bg-blue-200',
                  },
                  purple: {
                    bg: 'bg-purple-100',
                    text: 'text-purple-700',
                    hoverBg: 'hover:bg-purple-200',
                  },
                  green: {
                    bg: 'bg-green-100',
                    text: 'text-green-700',
                    hoverBg: 'hover:bg-green-200',
                  },
                  indigo: {
                    bg: 'bg-indigo-100',
                    text: 'text-indigo-700',
                    hoverBg: 'hover:bg-indigo-200',
                  },
                  teal: {
                    bg: 'bg-teal-100',
                    text: 'text-teal-700',
                    hoverBg: 'hover:bg-teal-200',
                  },
                  orange: {
                    bg: 'bg-orange-100',
                    text: 'text-orange-700',
                    hoverBg: 'hover:bg-orange-200',
                  },
                  red: {
                    bg: 'bg-red-100',
                    text: 'text-red-700',
                    hoverBg: 'hover:bg-red-200',
                  },
                  gray: {
                    bg: 'bg-gray-100',
                    text: 'text-gray-700',
                    hoverBg: 'hover:bg-gray-200',
                  },
                };
                const color = colors[module.color] || colors.blue;

                return (
                  <Link
                    key={module.href}
                    href={module.href}
                    className={`group relative px-3 py-2 rounded-xl transition-all duration-300 flex items-center space-x-1.5 text-sm font-semibold ${color.bg} ${color.text} ${color.hoverBg} hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 backdrop-blur-sm bg-opacity-90 hover:bg-opacity-100 border border-white/20`}
                    title={module.name}
                  >
                    <div
                      className={`p-1.5 rounded-lg ${color.bg} ${color.text} group-hover:rotate-12 transition-transform duration-300`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="hidden xl:inline whitespace-nowrap tracking-wide">
                      {module.name}
                    </span>
                    {/* 悬停时的光晕效果 */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 右侧：返回 Admin 按钮 */}
          <div className="flex items-center space-x-3">
            <Link
              href="/admin/dashboard"
              className="group flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 px-4 py-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-white/20 backdrop-blur-sm"
              title="返回管理后台"
            >
              <ArrowLeft className="w-4 h-4 text-white group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-white text-sm font-semibold whitespace-nowrap hidden sm:inline">
                返回管理后台
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
