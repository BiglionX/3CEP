/**
 * Admin 专用顶部导航条组件
 * 显示模块快速入口导航
 */

'use client';

import { Coins, Home, Package, ShoppingCart, Wrench, Zap } from 'lucide-react';
import Link from 'next/link';

/**
 * 模块导航配置
 */
const MODULES = [
  {
    name: '系统仪表板',
    href: '/admin/system-dashboard',
    icon: Home,
    color: 'blue',
  },
  {
    name: '门户管理',
    href: '/admin/portals-management',
    icon: Zap,
    color: 'purple',
  },
  {
    name: 'FCX 权证',
    href: '/admin/fxc-management',
    icon: Package,
    color: 'green',
  },
  {
    name: '用户管理',
    href: '/admin/user-manager',
    icon: ShoppingCart,
    color: 'indigo',
  },
  {
    name: '设备管理',
    href: '/admin/device-manager',
    icon: Coins,
    color: 'teal',
  },
];

export default function AdminTopbar() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg">
      {/* 动态背景效果 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent)]"></div>
      </div>

      <div className="relative px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 左侧：Logo */}
          <div className="flex items-center">
            <Link
              href="/admin/dashboard"
              className="flex items-center space-x-2 group"
            >
              <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm p-2 rounded-xl shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 border border-white/30">
                <Wrench className="w-6 h-6 text-blue-600" />
              </div>
              <div className="hidden lg:block">
                <h2 className="text-white font-bold text-lg tracking-wide drop-shadow-lg">
                  ProCyc
                </h2>
                <p className="text-white/80 text-xs font-medium -mt-1">
                  智能管理平台
                </p>
              </div>
            </Link>
          </div>

          {/* 中间：居中的模块导航 */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-3">
              {MODULES.map(module => {
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
                };
                const color = colors[module.color] || colors.blue;

                return (
                  <Link
                    key={module.href}
                    href={module.href}
                    className={`group relative px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center space-x-2 text-sm font-semibold ${color.bg} ${color.text} ${color.hoverBg} hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 backdrop-blur-sm bg-opacity-90 hover:bg-opacity-100 border border-white/20`}
                  >
                    <div
                      className={`p-1.5 rounded-lg ${color.bg} ${color.text} group-hover:rotate-12 transition-transform duration-300`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="hidden sm:inline whitespace-nowrap tracking-wide">
                      {module.name}
                    </span>
                    {/* 悬停时的光晕效果 */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 右侧：装饰性元素 */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 shadow-lg">
              <Zap className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span className="text-xs text-white font-semibold tracking-wide">
                智能管理控制台
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
