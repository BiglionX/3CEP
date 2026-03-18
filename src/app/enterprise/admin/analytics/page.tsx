'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  Package,
  Download,
  Target,
  Zap,
  MousePointerClick,
  RefreshCw,
  Bot,
  Coins,
  CreditCard,
  FileText,
  Globe,
  HelpCircle,
  LogOut,
  Menu,
  Settings,
  X,
  Headphones,
  QrCode,
} from 'lucide-react';
import Link from 'next/link';
import { createEnterpriseAnalyticsService } from '@/lib/analytics-kpi-service';
import { BehaviorAnalyticsPanel } from '@/components/admin/BehaviorAnalyticsPanel';

interface AnalyticsData {
  kpis: {
    id: string;
    name: string;
    value: number;
    target: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    change: number;
    category: 'business' | 'technical' | 'user' | 'financial';
  }[];
  charts: {
    revenue: { month: string; value: number }[];
    users: { month: string; value: number }[];
    orders: { month: string; value: number }[];
    conversion: { month: string; value: number }[];
  };
  metrics: {
    totalUsers: number;
    activeUsers: number;
    totalOrders: number;
    revenue: number;
    conversionRate: number;
    avgOrderValue: number;
    customerSatisfaction: number;
  };
}

interface DateRange {
  from: Date;
  to: Date;
}

export default function EnterpriseAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date(),
  });
  const [timeFrame, setTimeFrame] = useState('last30days');
  const [enterpriseId] = useState<string>('demo-enterprise'); // 实际应该从会话中获取

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, timeFrame]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // 使用真实服务获取数据
      const analyticsService = createEnterpriseAnalyticsService(enterpriseId);
      const analyticsData = await analyticsService.getEnterpriseAnalytics(
        enterpriseId,
        dateRange
      );

      setAnalyticsData(analyticsData);
    } catch (error) {
      console.error('获取分析数据失败:', error);

      // 如果真实服务失败，使用模拟数据作为降级方案
      const mockData: AnalyticsData = {
        kpis: [
          {
            id: 'kpi-1',
            name: '月度收入',
            value: 458200,
            target: 500000,
            unit: '元',
            trend: 'up',
            change: 12.5,
            category: 'financial',
          },
          {
            id: 'kpi-2',
            name: '活跃用户数',
            value: 8420,
            target: 10000,
            unit: '人',
            trend: 'up',
            change: 8.3,
            category: 'user',
          },
          {
            id: 'kpi-3',
            name: '订单完成率',
            value: 94.5,
            target: 95,
            unit: '%',
            trend: 'stable',
            change: 0.5,
            category: 'business',
          },
          {
            id: 'kpi-4',
            name: '客户满意度',
            value: 4.7,
            target: 4.8,
            unit: '分',
            trend: 'up',
            change: 2.1,
            category: 'business',
          },
          {
            id: 'kpi-5',
            name: '平均响应时间',
            value: 2.3,
            target: 2.0,
            unit: '秒',
            trend: 'down',
            change: -15.2,
            category: 'technical',
          },
          {
            id: 'kpi-6',
            name: '转化率',
            value: 3.8,
            target: 4.0,
            unit: '%',
            trend: 'up',
            change: 5.6,
            category: 'business',
          },
        ],
        charts: {
          revenue: [
            { month: '1月', value: 380000 },
            { month: '2月', value: 420000 },
            { month: '3月', value: 395000 },
            { month: '4月', value: 458200 },
            { month: '5月', value: 510000 },
            { month: '6月', value: 480000 },
          ],
          users: [
            { month: '1月', value: 7200 },
            { month: '2月', value: 7800 },
            { month: '3月', value: 8100 },
            { month: '4月', value: 8420 },
            { month: '5月', value: 8900 },
            { month: '6月', value: 9200 },
          ],
          orders: [
            { month: '1月', value: 2450 },
            { month: '2月', value: 2800 },
            { month: '3月', value: 2650 },
            { month: '4月', value: 3120 },
            { month: '5月', value: 3400 },
            { month: '6月', value: 3250 },
          ],
          conversion: [
            { month: '1月', value: 3.2 },
            { month: '2月', value: 3.5 },
            { month: '3月', value: 3.6 },
            { month: '4月', value: 3.8 },
            { month: '5月', value: 4.0 },
            { month: '6月', value: 4.2 },
          ],
        },
        metrics: {
          totalUsers: 125400,
          activeUsers: 8420,
          totalOrders: 17670,
          revenue: 4582000,
          conversionRate: 3.8,
          avgOrderValue: 259.5,
          customerSatisfaction: 4.7,
        },
      };

      setAnalyticsData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const analyticsService = createEnterpriseAnalyticsService(enterpriseId);
      const exportData = await analyticsService.exportAnalyticsReport(
        enterpriseId,
        'csv'
      );

      // 创建下载链接
      const blob = new Blob([exportData.content], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportData.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      alert('分析报告导出成功！');
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请稍后重试');
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 rotate-180" />;
      case 'stable':
        return <TrendingUp className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial':
        return <DollarSign className="h-5 w-5" />;
      case 'user':
        return <Users className="h-5 w-5" />;
      case 'business':
        return <BarChart3 className="h-5 w-5" />;
      case 'technical':
        return <Zap className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      case 'business':
        return 'bg-purple-100 text-purple-800';
      case 'technical':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div
                key={i}
                className="h-40 bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <BarChart3 className="h-16 w-16 text-gray-400" />
        <h3 className="text-lg font-medium">无法加载分析数据</h3>
        <Button onClick={fetchAnalyticsData}>重试</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="py-6 px-4 sm:px-6 lg:px-8">
            {/* 页面标题和操作栏 */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">数据分析</h1>
                <p className="mt-1 text-sm text-gray-600">
                  企业运营数据分析和洞察
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Select value={timeFrame} onValueChange={setTimeFrame}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="选择时间范围" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last7days">过去7天</SelectItem>
                    <SelectItem value="last30days">过去30天</SelectItem>
                    <SelectItem value="last90days">过去90天</SelectItem>
                    <SelectItem value="lastYear">过去一年</SelectItem>
                    <SelectItem value="custom">自定义</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={
                      dateRange.from
                        ? dateRange.from.toISOString().split('T')[0]
                        : ''
                    }
                    onChange={e => {
                      const newDate = e.target.value
                        ? new Date(e.target.value)
                        : new Date();
                      setDateRange(prev => ({ ...prev, from: newDate }));
                    }}
                    className="w-[150px]"
                  />
                  <span className="text-gray-500">至</span>
                  <Input
                    type="date"
                    value={
                      dateRange.to
                        ? dateRange.to.toISOString().split('T')[0]
                        : ''
                    }
                    onChange={e => {
                      const newDate = e.target.value
                        ? new Date(e.target.value)
                        : new Date();
                      setDateRange(prev => ({ ...prev, to: newDate }));
                    }}
                    className="w-[150px]"
                  />
                </div>

                <Button variant="outline" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  导出报告
                </Button>
              </div>
            </div>

            {/* 关键指标卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {analyticsData.kpis.map(kpi => (
                <Card
                  key={kpi.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(kpi.category)}
                        {kpi.name}
                      </div>
                    </CardTitle>
                    <Badge
                      className={cn(getCategoryColor(kpi.category), 'text-xs')}
                    >
                      {kpi.category === 'financial'
                        ? '财务'
                        : kpi.category === 'user'
                          ? '用户'
                          : kpi.category === 'business'
                            ? '业务'
                            : '技术'}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {kpi.value.toLocaleString()}
                      <span className="text-sm text-gray-500 ml-1">
                        {kpi.unit}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <span
                        className={cn(
                          'flex items-center gap-1 text-sm',
                          getTrendColor(kpi.trend)
                        )}
                      >
                        {getTrendIcon(kpi.trend)}
                        {kpi.change > 0 ? '+' : ''}
                        {kpi.change}%
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        目标: {kpi.target.toLocaleString()}
                        {kpi.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div
                        className={cn(
                          'h-2 rounded-full',
                          kpi.value >= kpi.target
                            ? 'bg-green-600'
                            : 'bg-blue-600'
                        )}
                        style={{
                          width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 标签页内容 */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  概览
                </TabsTrigger>
                <TabsTrigger value="business">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  业务分析
                </TabsTrigger>
                <TabsTrigger value="user">
                  <Users className="mr-2 h-4 w-4" />
                  用户分析
                </TabsTrigger>
                <TabsTrigger value="behavior">
                  <MousePointerClick className="mr-2 h-4 w-4" />
                  行为分析
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* 收入趋势 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        收入趋势
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsData.charts.revenue.map(item => (
                          <div
                            key={item.month}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">{item.month}</span>
                            <div className="flex items-center gap-4">
                              <div className="w-48 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{
                                    width: `${(item.value / 600000) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {item.value.toLocaleString()}元
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 用户增长 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        用户增长
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsData.charts.users.map(item => (
                          <div
                            key={item.month}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">{item.month}</span>
                            <div className="flex items-center gap-4">
                              <div className="w-48 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{
                                    width: `${(item.value / 10000) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm font-medium">
                                {item.value.toLocaleString()}人
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 汇总指标 */}
                <Card>
                  <CardHeader>
                    <CardTitle>关键指标汇总</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {analyticsData.metrics.totalUsers.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">总用户数</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {analyticsData.metrics.activeUsers.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">活跃用户</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {analyticsData.metrics.totalOrders.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">总订单数</div>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {(
                            analyticsData.metrics.revenue / 10000
                          ).toLocaleString()}
                          万
                        </div>
                        <div className="text-sm text-gray-500">总收入</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="business" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      订单分析
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.charts.orders.map(item => (
                        <div
                          key={item.month}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm">{item.month}</span>
                          <div className="flex items-center gap-4">
                            <div className="w-48 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{
                                  width: `${(item.value / 4000) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {item.value.toLocaleString()}单
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      转化率分析
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.charts.conversion.map(item => (
                        <div
                          key={item.month}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm">{item.month}</span>
                          <div className="flex items-center gap-4">
                            <div className="w-48 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-orange-600 h-2 rounded-full"
                                style={{ width: `${(item.value / 5) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {item.value}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="user">
                <Card>
                  <CardHeader>
                    <CardTitle>用户细分分析</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-4">用户活跃度分布</h4>
                        <div className="space-y-3">
                          {[
                            '高活跃用户',
                            '中等活跃用户',
                            '低活跃用户',
                            '休眠用户',
                          ].map((segment, index) => (
                            <div
                              key={segment}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm">{segment}</span>
                              <div className="flex items-center gap-4">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${(index + 1) * 20}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">
                                  {25 - index * 5}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-4">用户满意度评分</h4>
                        <div className="space-y-3">
                          {[
                            '非常满意 (5分)',
                            '满意 (4分)',
                            '一般 (3分)',
                            '不满意 (2分)',
                            '非常不满意 (1分)',
                          ].map((rating, index) => (
                            <div
                              key={rating}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm">{rating}</span>
                              <div className="flex items-center gap-4">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${(5 - index) * 15}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">
                                  {(5 - index) * 15}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="behavior">
                <BehaviorAnalyticsPanel
                  data={{
                    visitFrequency: {
                      daily: 1240,
                      weekly: 8420,
                      monthly: 32400,
                      trend: Array.from({ length: 30 }, (_, i) => ({
                        date: `Day ${i + 1}`,
                        visits: 800 + Math.floor(Math.random() * 500),
                      })),
                    },
                    featureUsage: {
                      topFeatures: [
                        { name: '智能客服', usage: 3240, percentage: 38 },
                        { name: '产品搜索', usage: 2850, percentage: 34 },
                        { name: '订单管理', usage: 1560, percentage: 18 },
                        { name: '数据分析', usage: 850, percentage: 10 },
                      ],
                      categoryDistribution: [
                        { category: '客户服务', count: 3240, percentage: 38 },
                        { category: '产品浏览', count: 2850, percentage: 34 },
                        { category: '交易管理', count: 1560, percentage: 18 },
                        { category: '系统工具', count: 850, percentage: 10 },
                      ],
                    },
                    activePatterns: {
                      hourlyHeatmap: Array.from({ length: 7 }, () =>
                        Array.from({ length: 24 }, () =>
                          Math.floor(Math.random() * 100)
                        )
                      ),
                      dailyActivity: [
                        '周一',
                        '周二',
                        '周三',
                        '周四',
                        '周五',
                        '周六',
                        '周日',
                      ].map(day => ({
                        day,
                        activity: Math.floor(Math.random() * 100),
                      })),
                      peakHours: [9, 10, 11, 14, 15, 16, 20, 21],
                    },
                    userSegments: [
                      {
                        segmentId: 'segment-1',
                        segmentName: '高频购买者',
                        userCount: 1250,
                        percentage: 15,
                        characteristics: [
                          '月均购买3次以上',
                          '客单价高',
                          '活跃时段集中',
                        ],
                      },
                      {
                        segmentId: 'segment-2',
                        segmentName: '价格敏感者',
                        userCount: 2100,
                        percentage: 25,
                        characteristics: [
                          '关注促销活动',
                          '比价行为频繁',
                          '转化周期长',
                        ],
                      },
                      {
                        segmentId: 'segment-3',
                        segmentName: '技术爱好者',
                        userCount: 1680,
                        percentage: 20,
                        characteristics: [
                          '喜欢新产品',
                          '参与评测',
                          '技术问题咨询多',
                        ],
                      },
                      {
                        segmentId: 'segment-4',
                        segmentName: '企业采购者',
                        userCount: 1260,
                        percentage: 15,
                        characteristics: ['批量采购', '合同订单', '服务要求高'],
                      },
                      {
                        segmentId: 'segment-5',
                        segmentName: '普通用户',
                        userCount: 2130,
                        percentage: 25,
                        characteristics: [
                          '偶尔购买',
                          '需求明确',
                          '服务评价中等',
                        ],
                      },
                    ],
                  }}
                  onSegmentClick={_segment => {
                    // console.log('点击用户细分:', segment);
                  }}
                />
              </TabsContent>
            </Tabs>

            {/* 底部导航 */}
            <div className="flex items-center justify-between pt-6 mt-8 border-t">
              <div className="text-sm text-gray-500">
                数据更新时间: {new Date().toLocaleString('zh-CN')}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" asChild>
                  <Link href="/enterprise/admin/dashboard">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    返回仪表板
                  </Link>
                </Button>
                <Button variant="outline" onClick={fetchAnalyticsData}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  刷新数据
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
