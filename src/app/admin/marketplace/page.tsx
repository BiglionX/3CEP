'use client';

import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import {
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface MarketplaceStats {
  totalRevenue: number;
  totalOrders: number;
  totalAgents: number;
  totalSkills: number;
  activeDevelopers: number;
  monthlyGrowth: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
}

interface TopDeveloper {
  id: string;
  name: string;
  email: string;
  totalProducts: number;
  totalSales: number;
  revenue: number;
}

export default function MarketplacePage() {
  const { isAuthenticated, is_admin, isLoading } = useUnifiedAuth();
  const [stats, setStats] = useState<MarketplaceStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalAgents: 0,
    totalSkills: 0,
    activeDevelopers: 0,
    monthlyGrowth: 0,
  });
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [topDevelopers, setTopDevelopers] = useState<TopDeveloper[]>([]);
  const [loading, setLoading] = useState(true);

  // 保护管理员路由
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !is_admin) {
      window.location.href = `/login?redirect=${encodeURIComponent('/admin/marketplace')}`;
    }
  }, [isAuthenticated, is_admin, isLoading]);

  // 加载统计数据
  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/marketplace/statistics');

      // 处理 401/403 错误
      if (response.status === 401 || response.status === 403) {
        console.warn('权限不足，请重新登录');
        return;
      }

      const result = await response.json();
      if (result.success) {
        setStats(result.data.overview);
        setRevenueData(result.data.revenueTrend || []);
        setTopDevelopers(result.data.topDevelopers || []);
      } else {
        console.error('加载统计数据失败:', result.error);
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 认证通过后加载数据
  useEffect(() => {
    if (!isLoading && isAuthenticated && is_admin) {
      // 等待一小段时间确保 cookie 已设置
      const timer = setTimeout(() => {
        loadStats();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, is_admin]);

  // 认证加载中
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 未认证或不是管理员
  if (!isAuthenticated || !is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-yellow-500 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">访问受限</h2>
          <p className="text-gray-600 mb-4">请先登录管理员账户</p>
          <button
            onClick={() =>
              (window.location.href = `/login?redirect=${encodeURIComponent('/admin/marketplace')}`)
            }
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            前往登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">市场运营管理</h1>
        <button
          onClick={loadStats}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <svg
            className="h-5 w-5 mr-2"
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
          刷新
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* 总收入 */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    总收入
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      ¥{stats.totalRevenue.toLocaleString()}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* 总订单数 */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    总订单数
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.totalOrders.toLocaleString()}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* 活跃开发者 */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    活跃开发者
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.activeDevelopers.toLocaleString()}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* 智能体总数 */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    智能体总数
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.totalAgents.toLocaleString()}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Skill 总数 */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Skill 总数
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.totalSkills.toLocaleString()}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* 月增长率 */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    月增长率
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.monthlyGrowth.toFixed(2)}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 收入趋势图表 */}
      {revenueData.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              月度收入趋势
            </h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {revenueData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all duration-300"
                    style={{
                      height: `${(item.revenue / Math.max(...revenueData.map(d => d.revenue))) * 200}px`,
                    }}
                  ></div>
                  <div className="mt-2 text-xs text-gray-600">{item.month}</div>
                  <div className="text-xs text-gray-500">
                    ¥{(item.revenue / 1000).toFixed(0)}k
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 顶级开发者排行榜 */}
      {topDevelopers.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              顶级开发者排行榜
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      排名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      开发者
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      产品数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      销售量
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      总收入
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topDevelopers.map((developer, index) => (
                    <tr key={developer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {index === 0 && (
                            <span className="text-yellow-500 text-lg">🥇</span>
                          )}
                          {index === 1 && (
                            <span className="text-gray-400 text-lg">🥈</span>
                          )}
                          {index === 2 && (
                            <span className="text-orange-500 text-lg">🥉</span>
                          )}
                          {index > 2 && (
                            <span className="text-gray-400 ml-2">
                              #{index + 1}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {developer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {developer.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {developer.totalProducts}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {developer.totalSales}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ¥{developer.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}
