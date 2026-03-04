'use client';

import { cacheManager } from '@/lib/cache-manager';
import { dbOptimizer } from '@/lib/db-optimizer';
import { useEffect, useState } from 'react';

export default function PerformanceMonitorPage() {
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [refreshInterval, setRefreshInterval] = useState(5000);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, refreshInterval);

    refreshData();

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const refreshData = () => {
    // 获取数据库性能数据
    const dbReport = dbOptimizer.getPerformanceReport();
    const dbStats = dbOptimizer.getQueryStats(60000); // 1分钟统计数据

    // 获取缓存统计
    const cacheStats = cacheManager.getStats();

    setPerformanceData({
      dbReport,
      dbStats,
    });

    setCacheStats(cacheStats);
  };

  const clearAllData = () => {
    dbOptimizer.clearHistory();
    cacheManager.clearAll();
    refreshData();
  };

  if (!performanceData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">性能监控</h1>
          <p className="mt-1 text-sm text-gray-600">
            实时监控系统性能指标和优化建?          </p>
        </div>
        <div className="flex space-x-3">
          <select
            value={refreshInterval}
            onChange={e => setRefreshInterval(Number(e.target.value))}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value={2000}>2秒刷?/option>
            <option value={5000}>5秒刷?/option>
            <option value={10000}>10秒刷?/option>
            <option value={30000}>30秒刷?/option>
          </select>
          <button
            onClick={clearAllData}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            清空数据
          </button>
        </div>
      </div>

      {/* 性能概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 数据库查询统?*/}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">总查询数</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {performanceData.dbStats.totalQueries}
              </p>
            </div>
          </div>
        </div>

        {/* 平均响应时间 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">
                平均响应时间
              </h3>
              <p className="text-2xl font-semibold text-gray-900">
                {performanceData.dbStats.averageTime.toFixed(2)}ms
              </p>
            </div>
          </div>
        </div>

        {/* 慢查询数?*/}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">慢查?/h3>
              <p className="text-2xl font-semibold text-gray-900">
                {performanceData.dbStats.slowQueries}
              </p>
            </div>
          </div>
        </div>

        {/* 缓存命中?*/}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">缓存条目</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {cacheStats.totalEntries}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 优化建议 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">优化建议</h2>
        </div>
        <div className="p-6">
          {performanceData.dbReport.recommendations.length > 0 ? (
            <ul className="space-y-3">
              {performanceData.dbReport.recommendations.map(
                (recommendation: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="ml-3 text-sm text-gray-700">
                      {recommendation}
                    </p>
                  </li>
                )
              )}
            </ul>
          ) : (
            <div className="text-center py-8">
              <svg
                className="mx-auto h-12 w-12 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                暂无优化建议
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                系统运行良好，继续保持！
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 慢查询列?*/}
      {performanceData.dbReport.slowQueries.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">最近慢查询</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    查询时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    执行时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    返回行数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    查询预览
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {performanceData.dbReport.slowQueries.map(
                  (query: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(query.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {query.executionTime}ms
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {query.rowCount}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {query.query}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 缓存统计详情 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">缓存统计</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">总缓存条?/span>
              <span className="font-medium">{cacheStats.totalEntries}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">过期条目</span>
              <span className="font-medium text-yellow-600">
                {cacheStats.expiredEntries}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">内存使用</span>
              <span className="font-medium">
                {(cacheStats.memoryUsage / 1024).toFixed(2)} KB
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              实时统计 (1分钟)
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">峰值响应时?/span>
              <span className="font-medium">
                {performanceData.dbStats.peakTime.toFixed(2)}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">缓存命中?/span>
              <span className="font-medium">
                {cacheStats.totalEntries > 0
                  ? `${Math.round(
                      ((cacheStats.totalEntries - cacheStats.expiredEntries) /
                        cacheStats.totalEntries) *
                        100
                    )}%`
                  : '0%'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

