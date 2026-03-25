'use client';

import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface SkillAnalyticsProps {
  skillId: string;
}

interface AnalyticsData {
  overview: {
    total_executions: number;
    success_count: number;
    error_count: number;
    timeout_count: number;
    avg_execution_time: number;
    min_execution_time: number;
    max_execution_time: number;
    success_rate: number;
  };
  trend: Array<{
    date: string;
    total_executions: number;
    success_count: number;
    error_count: number;
    avg_execution_time: number;
  }>;
}

export function SkillAnalytics({ skillId }: SkillAnalyticsProps) {
  // 模拟数据 (实际应该从 API 获取)
  const mockData: AnalyticsData = {
    overview: {
      total_executions: 1234,
      success_count: 1180,
      error_count: 42,
      timeout_count: 12,
      avg_execution_time: 256,
      min_execution_time: 45,
      max_execution_time: 890,
      success_rate: 95.62,
    },
    trend: [
      {
        date: '2026-03-25',
        total_executions: 150,
        success_count: 145,
        error_count: 4,
        avg_execution_time: 245,
      },
      {
        date: '2026-03-24',
        total_executions: 180,
        success_count: 172,
        error_count: 6,
        avg_execution_time: 267,
      },
      {
        date: '2026-03-23',
        total_executions: 165,
        success_count: 158,
        error_count: 5,
        avg_execution_time: 253,
      },
      {
        date: '2026-03-22',
        total_executions: 142,
        success_count: 135,
        error_count: 6,
        avg_execution_time: 278,
      },
      {
        date: '2026-03-21',
        total_executions: 198,
        success_count: 190,
        error_count: 5,
        avg_execution_time: 241,
      },
      {
        date: '2026-03-20',
        total_executions: 176,
        success_count: 168,
        error_count: 7,
        avg_execution_time: 262,
      },
      {
        date: '2026-03-19',
        total_executions: 223,
        success_count: 212,
        error_count: 9,
        avg_execution_time: 251,
      },
    ],
  };

  const data = mockData; // TODO: 从 API 加载真实数据

  // 格式化时间
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  // 计算趋势
  const calculateTrend = (current: number, previous: number) => {
    if (!previous) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  const lastWeekTotal = data.trend
    .slice(0, 7)
    .reduce((sum, d) => sum + d.total_executions, 0);
  const prevWeekTotal = data.trend
    .slice(7, 14)
    .reduce((sum, d) => sum + d.total_executions, 0);
  const growthRate = calculateTrend(lastWeekTotal, prevWeekTotal);

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 总调用次数 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">总调用次数</h3>
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {data.overview.total_executions.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp
              className={`w-4 h-4 mr-1 ${parseFloat(growthRate) >= 0 ? 'text-green-600' : 'text-red-600'}`}
            />
            <span
              className={
                parseFloat(growthRate) >= 0 ? 'text-green-600' : 'text-red-600'
              }
            >
              {parseFloat(growthRate) >= 0 ? '+' : ''}
              {growthRate}%
            </span>
            <span className="text-gray-500 ml-2">较上周</span>
          </div>
        </div>

        {/* 成功率 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">成功率</h3>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {data.overview.success_rate.toFixed(2)}%
          </p>
          <div className="mt-2 text-sm text-gray-500">
            成功 {data.overview.success_count.toLocaleString()} 次 · 失败{' '}
            {data.overview.error_count.toLocaleString()} 次
          </div>
        </div>

        {/* 平均响应时间 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">平均响应时间</h3>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatTime(data.overview.avg_execution_time)}
          </p>
          <div className="mt-2 text-sm text-gray-500">
            最快 {formatTime(data.overview.min_execution_time)} · 最慢{' '}
            {formatTime(data.overview.max_execution_time)}
          </div>
        </div>

        {/* 错误统计 */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">错误统计</h3>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {(
              data.overview.error_count + data.overview.timeout_count
            ).toLocaleString()}
          </p>
          <div className="mt-2 text-sm text-gray-500">
            错误 {data.overview.error_count} · 超时{' '}
            {data.overview.timeout_count}
          </div>
        </div>
      </div>

      {/* 调用趋势图 */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">调用趋势</h3>

        {/* 简单的柱状图展示 */}
        <div className="h-64 flex items-end space-x-2">
          {data.trend.slice(0, 14).map((day, index) => {
            const maxValue = Math.max(
              ...data.trend.slice(0, 14).map(d => d.total_executions)
            );
            const heightPercent = (day.total_executions / maxValue) * 100;

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center group relative"
              >
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                  <div>{new Date(day.date).toLocaleDateString('zh-CN')}</div>
                  <div>调用：{day.total_executions}</div>
                  <div>成功：{day.success_count}</div>
                  <div>失败：{day.error_count}</div>
                  <div>平均：{formatTime(day.avg_execution_time)}</div>
                </div>

                {/* 柱状图 */}
                <div
                  className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-all"
                  style={{ height: `${heightPercent}%` }}
                />
                {/* 日期标签 */}
                <div className="mt-2 text-xs text-gray-500 transform -rotate-45 origin-top-left">
                  {new Date(day.date).toLocaleDateString('zh-CN', {
                    month: 'numeric',
                    day: 'numeric',
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 图例 */}
        <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
            <span>成功</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span>失败</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
            <span>超时</span>
          </div>
        </div>
      </div>

      {/* 详细数据表格 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">详细数据</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  日期
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  总调用
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-green-600 uppercase tracking-wider">
                  成功
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-red-600 uppercase tracking-wider">
                  失败
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-yellow-600 uppercase tracking-wider">
                  超时
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  成功率
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  平均耗时
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.trend.map((day, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(day.date).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-medium">
                    {day.total_executions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                    {day.success_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                    {day.error_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-yellow-600">
                    {day.total_executions - day.success_count - day.error_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {((day.success_count / day.total_executions) * 100).toFixed(
                      2
                    )}
                    %
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                    {formatTime(day.avg_execution_time)}
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
