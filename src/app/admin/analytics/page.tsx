'use client';

import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface AnalyticsData {
  range: string;
  totalAgents: number;
  activeAgents: number;
  totalUsers: number;
  activeUsers: number;
  viewToInstallRate: number;
  installToPurchaseRate: number;
  overallConversionRate: number;
  day1Retention: number;
  day7Retention: number;
  day30Retention: number;
  totalRevenue: number;
  averageRevenuePerAgent: number;
  returnOnInvestment: number;
  trends: Array<{
    date: string;
    views: number;
    installs: number;
    purchases: number;
    revenue: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics(timeRange);
  }, [timeRange]);

  const fetchAnalytics = async (range: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/analytics/agents/comprehensive?range=${range}`
      );
      const result = await res.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('获取分析数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <p>加载失败，请刷新重试</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* 标题和时间选择器 */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">数据分析仪表板</h1>
          <p className="text-gray-600">智能体运营核心指标分析</p>
        </div>

        <select
          value={timeRange}
          onChange={e => setTimeRange(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="7d">最近 7 天</option>
          <option value="30d">最近 30 天</option>
          <option value="90d">最近 90 天</option>
          <option value="1y">最近 1 年</option>
        </select>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* 转化率 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">总体转化率</h3>
          <p className="text-3xl font-bold text-indigo-600">
            {formatPercent(data.overallConversionRate)}
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">浏览→安装</span>
              <span className="text-sm font-medium">
                {formatPercent(data.viewToInstallRate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">安装→购买</span>
              <span className="text-sm font-medium">
                {formatPercent(data.installToPurchaseRate)}
              </span>
            </div>
          </div>
        </div>

        {/* 留存率 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">用户留存率</h3>
          <p className="text-3xl font-bold text-green-600">
            {formatPercent(data.day7Retention)}
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">次日留存</span>
              <span className="text-sm font-medium">
                {formatPercent(data.day1Retention)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">7 日留存</span>
              <span className="text-sm font-medium">
                {formatPercent(data.day7Retention)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">30 日留存</span>
              <span className="text-sm font-medium">
                {formatPercent(data.day30Retention)}
              </span>
            </div>
          </div>
        </div>

        {/* 收入 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">总收入</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {formatCurrency(data.totalRevenue)}
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">平均每个智能体</span>
              <span className="text-sm font-medium">
                {formatCurrency(data.averageRevenuePerAgent)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">ROI</span>
              <span className="text-sm font-medium">
                {formatPercent(data.returnOnInvestment)}
              </span>
            </div>
          </div>
        </div>

        {/* 活跃度 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">活跃度</h3>
          <div className="space-y-4">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {data.activeAgents}
              </p>
              <p className="text-sm text-gray-600">
                活跃智能体 / {data.totalAgents} 总计
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {data.activeUsers}
              </p>
              <p className="text-sm text-gray-600">
                活跃用户 / {data.totalUsers} 总计
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 趋势图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 浏览量、安装量、购买量趋势 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">用户行为趋势</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#8884d8"
                name="浏览量"
              />
              <Line
                type="monotone"
                dataKey="installs"
                stroke="#82ca9d"
                name="安装量"
              />
              <Line
                type="monotone"
                dataKey="purchases"
                stroke="#ffc658"
                name="购买量"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 收入趋势 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">收入趋势</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" name="收入" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 留存率饼图 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">留存率分析</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={[
                { name: '次日留存', value: data.day1Retention },
                { name: '7 日留存', value: data.day7Retention },
                { name: '30 日留存', value: data.day30Retention },
              ]}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${formatPercent(percent * 100)}`
              }
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              <Cell key="cell-0" fill={COLORS[0]} />
              <Cell key="cell-1" fill={COLORS[1]} />
              <Cell key="cell-2" fill={COLORS[2]} />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 详细数据表格 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">每日详细数据</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  浏览量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  安装量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  购买量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  收入
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.trends.map((trend, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trend.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trend.views}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trend.installs}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trend.purchases}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {formatCurrency(trend.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
