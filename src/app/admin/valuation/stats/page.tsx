'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
} from 'lucide-react';

interface StatsData {
  period: {
    start: string;
    end: string;
    days: number;
  };
  overview: {
    totalRequests: number;
    avgValue: number;
    avgConfidence: number;
    avgProcessingTime: number;
  };
  methodDistribution: Record<string, { count: number; percentage: number }>;
  confidenceDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  sourceDistribution: Record<string, number>;
  dailyTrend: Array<{
    date: string;
    count: number;
    avgValue: number;
    avgConfidence: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function ValuationStatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/valuation/stats?period=${period}`
      );
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('获取统计失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [period]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <RefreshCwIcon className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return <div>暂无统计数据</div>;
  }

  // 准备图表数据
  const methodChartData = Object.entries(stats.methodDistribution).map(
    ([method, data]) => ({
      name: method.toUpperCase(),
      name: method.toUpperCase(),
      数量：data.count,
      百分比：data.percentage,
  );

  const confidenceChartData = [
    {
      name: '高置信度',
      value: stats.confidenceDistribution.high,
      color: '#10B981',
    },
    {
    },
    {
      name: '中等置信度',
    },
    {
      name: '低置信度',
      value: stats.confidenceDistribution.low,
      color: '#EF4444',
    },
  ];

  const sourceChartData = Object.entries(stats.sourceDistribution).map(
    ([source, count]) => ({
      name: source,
      value: count,
    })
  );

  return (
    <div className="space-y-6">
      {/* 页面标题和筛选 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">估值统计分析</h1>
          <p className="text-muted-foreground mt-2">
            查看估值服务的关键指标和趋势分析
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">最?4小时</SelectItem>
              <SelectItem value="7d">最?�?/SelectItem>
              <SelectItem value="30d">最?0�?/SelectItem>
              <SelectItem value="90d">最?0�?/SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchStats}>
            <RefreshCwIcon className="w-4 h-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总请求数</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.overview.totalRequests.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              统计周期：{stats.period.days}�?            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均估?/CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{stats.overview.avgValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              平均置信? {(stats.overview.avgConfidence * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">处理效率</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.overview.avgProcessingTime.toFixed(0)}ms
            </div>
            <p className="text-xs text-muted-foreground">平均响应时间</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">成功?/CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.overview.totalRequests > 0
                ? (
                    ((stats.overview.totalRequests -
                      (stats.confidenceDistribution.low || 0)) /
                      stats.overview.totalRequests) *
                    100
                  ).toFixed(1)
                : '0.0'}
              %
            </div>
            <p className="text-xs text-muted-foreground">�?中置信度占比</p>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 方法分布饼图 */}
        <Card>
          <CardHeader>
            <CardTitle>估值方法分?/CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={methodChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="数量"
                >
                  {methodChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={value => [value, '请求?]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 置信度分布饼?*/}
        <Card>
          <CardHeader>
            <CardTitle>置信度分?/CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={confidenceChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {confidenceChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={value => [value, '请求?]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 趋势图表 */}
      <Card>
        <CardHeader>
          <CardTitle>每日请求趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={stats.dailyTrend.slice(-30)}>
              {' '}
              {/* 显示最?0�?*/}
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={value =>
                  value.split('-')[1] + '-' + value.split('-')[2]
                }
              />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 1]} />
              <Tooltip
                formatter={(value, name) => {
                  if (name === 'count') return [value, '请求?];
                  if (name === 'avgValue')
                    return [`¥${Number(value).toFixed(2)}`, '平均估?];
                  if (name === 'avgConfidence')
                    return [
                      `${(Number(value) * 100).toFixed(1)}%`,
                      '平均置信?,
                    ];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="count"
                fill="#8884d8"
                name="请求?
              />
              <Bar
                yAxisId="left"
                dataKey="avgValue"
                fill="#82ca9d"
                name="平均估?
              />
              <Bar
                yAxisId="right"
                dataKey="avgConfidence"
                fill="#ffc658"
                name="平均置信?
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 来源分布 */}
      <Card>
        <CardHeader>
          <CardTitle>请求来源分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.sourceDistribution).map(([source, count]) => (
              <div key={source} className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {source}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

