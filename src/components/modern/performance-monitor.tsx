/**
 * Zustand性能监控面板
 * 展示状态管理的性能优势
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  usePerformance,
  useShops,
  useNotifications,
  useSearch,
} from '@/stores/repair-shop-store';
import { BarChart, Activity, Database, Zap, TrendingUp } from 'lucide-react';

const PerformanceMonitor: React.FC = () => {
  const performance = usePerformance();
  const shops = useShops();
  const notifications = useNotifications();
  const search = useSearch();

  const [renderCount, setRenderCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // 监控组件渲染次数
  useEffect(() => {
    setRenderCount(prev => prev + 1);
    setLastUpdate(new Date());
  }, [performance, shops, notifications, search]);

  // 计算缓存命中?  const cacheHitRate =
    performance.apiCalls > 0
      ? ((performance.cacheHits / performance.apiCalls) * 100).toFixed(1)
      : '0';

  // 性能指标数据
  const metrics = [
    {
      title: 'API调用次数',
      value: performance.apiCalls,
      icon: Database,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
    },
    {
      title: '缓存命中?,
      value: `${cacheHitRate}%`,
      icon: Zap,
      color: 'text-green-500',
      bgColor: 'bg-green-100',
    },
    {
      title: '页面加载时间',
      value: `${performance.loadTime}ms`,
      icon: Activity,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
    },
    {
      title: '组件渲染次数',
      value: renderCount,
      icon: TrendingUp,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <BarChart className="mr-2" size={24} />
          Zustand性能监控面板
        </h2>
        <div className="text-sm text-gray-500">
          最后更? {lastUpdate?.toLocaleTimeString() || '从未'}
        </div>
      </div>

      {/* 性能指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={metric.color} size={20} />
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {metric.value}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">
              {metric.title}
            </h3>
          </div>
        ))}
      </div>

      {/* 状态详?*/}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 维修店状?*/}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Database className="mr-2" size={18} />
            维修店数据状?          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">数据项数?</span>
              <span className="font-medium">{shops.list.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">加载状?</span>
              <span
                className={`font-medium ${
                  shops.loading ? 'text-orange-500' : 'text-green-500'
                }`}
              >
                {shops.loading ? '加载?..' : '已完?}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">错误状?</span>
              <span
                className={`font-medium ${
                  shops.error ? 'text-red-500' : 'text-green-500'
                }`}
              >
                {shops.error ? '有错? : '正常'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">当前页码:</span>
              <span className="font-medium">
                {shops.pagination.currentPage}
              </span>
            </div>
          </div>
        </div>

        {/* 通知状?*/}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Activity className="mr-2" size={18} />
            通知系统状?          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">通知总数:</span>
              <span className="font-medium">{notifications.list.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">未读通知:</span>
              <span className="font-medium text-orange-500">
                {notifications.unreadCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">加载状?</span>
              <span
                className={`font-medium ${
                  notifications.loading ? 'text-orange-500' : 'text-green-500'
                }`}
              >
                {notifications.loading ? '加载?..' : '已完?}
              </span>
            </div>
          </div>
        </div>

        {/* 搜索状?*/}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <Zap className="mr-2" size={18} />
            搜索功能状?          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">搜索历史:</span>
              <span className="font-medium">{search.history.length} �?/span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">搜索建议:</span>
              <span className="font-medium">
                {search.suggestions.length} �?              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">搜索结果:</span>
              <span className="font-medium">{search.results.length} �?/span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">加载状?</span>
              <span
                className={`font-medium ${
                  search.loading ? 'text-orange-500' : 'text-green-500'
                }`}
              >
                {search.loading ? '搜索?..' : '空闲'}
              </span>
            </div>
          </div>
        </div>

        {/* Zustand优势对比 */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <TrendingUp className="mr-2" size={18} />
            Zustand优势
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">�?/span>
              <span>零依赖，包体积小 (~3KB gzipped)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">�?/span>
              <span>无需Provider包装，直接使用hooks</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">�?/span>
              <span>支持中间?持久化、开发工具等)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">�?/span>
              <span>优秀的TypeScript支持</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">�?/span>
              <span>细粒度更新，避免不必要的重渲?/span>
            </li>
          </ul>
        </div>
      </div>

      {/* 性能建议 */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">性能优化建议</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>�?使用选择器Hook避免不必要的组件重渲?/li>
          <li>�?合理使用persist中间件进行状态持久化</li>
          <li>�?在开发环境启用devtools中间件便于调?/li>
          <li>�?考虑使用immer中间件简化不可变状态更?/li>
        </ul>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
