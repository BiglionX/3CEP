'use client';

import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SkillStats {
  totalSkills: number;
  onShelfSkills: number;
  approvedSkills: number;
  pendingReview: number;
  rejectedSkills: number;
}

interface CategoryStat {
  category: string;
  count: number;
  percentage: number;
}

interface TrendData {
  date: string;
  count: number;
}

export default function SkillAnalyticsPage() {
  const { isAuthenticated, is_admin, isLoading } = useUnifiedAuth();
  const router = useRouter();
  const [stats, setStats] = useState<SkillStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // 保护管理员路由
  useEffect(
    () => () => {
      if (isLoading) return;
      if (!isAuthenticated || !is_admin) {
        window.location.href = `/login?redirect=${encodeURIComponent('/admin/skill-analytics')}`;
      }
    },
    [isAuthenticated, is_admin, isLoading]
  );

  // 加载统计数据
  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // 并行加载所有数据
      const [statsRes, categoryRes, trendRes] = await Promise.all([
        fetch('/api/admin/skill-analytics/stats'),
        fetch('/api/admin/skill-analytics/category-stats'),
        fetch(`/api/admin/skill-analytics/trend?range=${timeRange}`),
      ]);

      const [statsResult, categoryResult, trendResult] = await Promise.all([
        statsRes.json(),
        categoryRes.json(),
        trendRes.json(),
      ]);

      if (statsResult.success) {
        setStats(statsResult.data);
      }

      if (categoryResult.success) {
        setCategoryStats(categoryResult.data);
      }

      if (trendResult.success) {
        setTrendData(trendResult.data);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && is_admin) {
      loadAnalytics();
    }
  }, [isAuthenticated, is_admin, timeRange]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !is_admin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">数据分析</h1>
          <p className="mt-1 text-sm text-gray-500">
            查看 Skills 的使用情况和趋势分析
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="7d">最近 7 天</option>
            <option value="30d">最近 30 天</option>
            <option value="90d">最近 90 天</option>
          </select>
          <button
            onClick={loadAnalytics}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            刷新
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      总技能数
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {stats.totalSkills}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      已上架
                    </dt>
                    <dd className="text-2xl font-semibold text-green-600">
                      {stats.onShelfSkills}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      已审核
                    </dt>
                    <dd className="text-2xl font-semibold text-blue-600">
                      {stats.approvedSkills}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      待审核
                    </dt>
                    <dd className="text-2xl font-semibold text-yellow-600">
                      {stats.pendingReview}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      已驳回
                    </dt>
                    <dd className="text-2xl font-semibold text-red-600">
                      {stats.rejectedSkills}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 分类分布 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">分类分布</h3>
          <div className="space-y-4">
            {categoryStats.map((stat, index) => (
              <div key={stat.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {stat.category}
                  </span>
                  <span className="text-sm text-gray-500">
                    {stat.count} ({stat.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      [
                        'bg-blue-500',
                        'bg-green-500',
                        'bg-purple-500',
                        'bg-yellow-500',
                        'bg-red-500',
                        'bg-gray-500',
                      ][index % 6]
                    }`}
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 增长趋势 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">增长趋势</h3>
          <div className="h-64 flex items-end justify-between gap-1">
            {trendData.map((data, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                  style={{ height: `${(data.count / 25) * 100}%` }}
                  title={`${data.date}: ${data.count}个`}
                />
                {index % 5 === 0 && (
                  <span className="text-xs text-gray-500 transform -rotate-45 origin-top-left whitespace-nowrap">
                    {data.date}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 使用说明</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>数据实时更新，反映 Skills 的最新状态</li>
          <li>可通过时间范围选择器查看不同周期的趋势</li>
          <li>分类分布帮助了解 Skills 的类型构成</li>
          <li>增长趋势展示 Skills 的增长情况</li>
        </ul>
      </div>
    </div>
  );
}
