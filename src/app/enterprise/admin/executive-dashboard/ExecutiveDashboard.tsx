'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BusinessIntelligenceService } from '@/lib/business-intelligence-service';
import { cn } from '@/lib/utils';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Calendar,
  ChevronRight,
  Clock,
  DollarSign,
  Download,
  Filter,
  Minus,
  PieChart,
  RefreshCw,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { ExecutiveAlertPanel } from './ExecutiveAlertPanel';
import {
  ExecutiveKPIDrillDown,
  type KPIDrillDownData,
} from './ExecutiveKPIDrillDown';

interface ExecutiveDashboardData {
  kpis: Array<{
    id: string;
    name: string;
    value: number;
    target: number;
    trend: 'up' | 'down' | 'stable';
    change: number;
    unit: string;
    category: 'financial' | 'user' | 'business' | 'operational';
  }>;
  revenueMetrics: {
    monthlyRevenue: number;
    growthRate: number;
    forecast: number;
  };
  userMetrics: {
    activeUsers: number;
    retentionRate: number;
    acquisitionCost: number;
  };
  operationalMetrics: {
    systemUptime: number;
    responseTime: number;
    errorRate: number;
  };
  alerts: Array<{
    id: string;
    severity: 'high' | 'medium' | 'low';
    title: string;
    message: string;
    timestamp: Date;
    category: string;
  }>;
  chartData: {
    revenueTrend: Array<{ period: string; value: number; forecast?: number }>;
    userGrowth: Array<{ period: string; active: number; new: number }>;
    categoryPerformance: Array<{
      category: string;
      value: number;
      target: number;
    }>;
  };
}

export function ExecutiveDashboard() {
  const [dashboardData, setDashboardData] =
    useState<ExecutiveDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>(
    '30d'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [drillDownData, setDrillDownData] = useState<KPIDrillDownData | null>(
    null
  );
  const [showDrillDown, setShowDrillDown] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const biService = new BusinessIntelligenceService();

  // 获取仪表板数据
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data = await biService.getExecutiveDashboard();

      // 模拟告警数据
      const mockAlerts = [
        {
          id: 'alert-1',
          severity: 'high' as const,
          title: '收入未达目标',
          message: '本月收入低于目标值 15%，建议关注销售策略调整',
          timestamp: new Date(),
          category: 'financial',
        },
        {
          id: 'alert-2',
          severity: 'medium' as const,
          title: '用户留存率下降',
          message: '近 7 天用户留存率下降 3.2%，需加强用户运营',
          timestamp: new Date(Date.now() - 3600000),
          category: 'user',
        },
        {
          id: 'alert-3',
          severity: 'low' as const,
          title: '系统响应时间优化',
          message: '平均响应时间较上周提升 12%',
          timestamp: new Date(Date.now() - 7200000),
          category: 'operational',
        },
      ];

      setDashboardData({
        ...data,
        alerts: mockAlerts,
        chartData: {
          revenueTrend: [
            { period: '1 月', value: 1580000, forecast: 1600000 },
            { period: '2 月', value: 1720000, forecast: 1750000 },
            { period: '3 月', value: 1650000, forecast: 1700000 },
            { period: '4 月', value: 1890000, forecast: 1850000 },
            { period: '5 月', value: 1950000, forecast: 1920000 },
            { period: '6 月', value: 2100000, forecast: 2050000 },
          ],
          userGrowth: [
            { period: '1 月', active: 85000, new: 12000 },
            { period: '2 月', active: 89000, new: 13500 },
            { period: '3 月', active: 92000, new: 11800 },
            { period: '4 月', active: 96000, new: 14200 },
            { period: '5 月', active: 101000, new: 15600 },
            { period: '6 月', active: 105000, new: 14800 },
          ],
          categoryPerformance: [
            { category: '智能体服务', value: 850000, target: 900000 },
            { category: '采购管理', value: 720000, target: 700000 },
            { category: '供应链金融', value: 580000, target: 600000 },
            { category: '数据分析', value: 420000, target: 400000 },
          ],
        },
      });
    } catch (error) {
      console.error('获取仪表板数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // 自动刷新
    if (autoRefresh) {
      const interval = setInterval(fetchDashboardData, 300000); // 5 分钟
      return () => clearInterval(interval);
    }
  }, [timeRange, selectedCategory]);

  // 处理 KPI 点击钻取
  const handleKPIClick = async (kpiId: string, category: string) => {
    try {
      const drillData = await biService.getKPIDrillDown(kpiId, timeRange);
      setDrillDownData(drillData);
      setShowDrillDown(true);
    } catch (error) {
      console.error('获取钻取数据失败:', error);
    }
  };

  // 获取趋势图标
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  // 获取趋势颜色
  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-400';
    }
  };

  // 获取告警颜色
  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-orange-500';
      case 'low':
        return 'bg-yellow-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-600">正在加载高管仪表板...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-2" />
          <p className="text-gray-600">加载数据失败，请刷新重试</p>
          <Button onClick={fetchDashboardData} className="mt-4">
            刷新
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部控制栏 */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                高管决策仪表板
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                实时业务监控与智能决策支持
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Select
                value={timeRange}
                onValueChange={v => setTimeRange(v as any)}
              >
                <SelectTrigger className="w-[140px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">最近 7 天</SelectItem>
                  <SelectItem value="30d">最近 30 天</SelectItem>
                  <SelectItem value="90d">最近 90 天</SelectItem>
                  <SelectItem value="1y">最近 1 年</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类别</SelectItem>
                  <SelectItem value="financial">财务</SelectItem>
                  <SelectItem value="user">用户</SelectItem>
                  <SelectItem value="business">业务</SelectItem>
                  <SelectItem value="operational">运营</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={fetchDashboardData}
                title="刷新数据"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>

              <Button variant="outline" size="icon" title="导出数据">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* 顶层 KPI 概览卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardData.kpis.map(kpi => (
            <Card
              key={kpi.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleKPIClick(kpi.id, kpi.category)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {kpi.name}
                </CardTitle>
                {kpi.category === 'financial' && (
                  <DollarSign className="h-4 w-4 text-blue-600" />
                )}
                {kpi.category === 'user' && (
                  <Users className="h-4 w-4 text-green-600" />
                )}
                {kpi.category === 'business' && (
                  <ShoppingCart className="h-4 w-4 text-purple-600" />
                )}
                {kpi.category === 'operational' && (
                  <Activity className="h-4 w-4 text-orange-600" />
                )}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {kpi.value.toLocaleString()}
                  <span className="text-sm text-gray-500 ml-1">{kpi.unit}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {getTrendIcon(kpi.trend)}
                    <span
                      className={cn(
                        'text-sm font-medium',
                        getTrendColor(kpi.trend)
                      )}
                    >
                      {kpi.change > 0 ? '+' : ''}
                      {kpi.change}%
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    目标：{kpi.target.toLocaleString()}
                    {kpi.unit}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                  <div
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      kpi.value >= kpi.target ? 'bg-green-600' : 'bg-blue-600'
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

        {/* 关键趋势图表轮播 */}
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="revenue">
              <BarChart3 className="h-4 w-4 mr-2" />
              收入趋势
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              用户增长
            </TabsTrigger>
            <TabsTrigger value="performance">
              <PieChart className="h-4 w-4 mr-2" />
              分类绩效
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    月度收入趋势分析
                  </div>
                  <Badge variant="outline">实际 vs 预测</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.chartData.revenueTrend.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.period}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-600">
                            实际：¥{(item.value / 10000).toFixed(1)}万
                          </span>
                          <span className="text-gray-400">
                            预测：¥{(item.forecast! / 10000).toFixed(1)}万
                          </span>
                        </div>
                      </div>
                      <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                          style={{ width: `${(item.value / 2500000) * 100}%` }}
                        />
                        <div
                          className="absolute left-0 top-0 h-1 bg-gray-400 opacity-50"
                          style={{
                            width: `${(item.forecast! / 2500000) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  用户增长趋势
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.chartData.userGrowth.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-16 text-sm font-medium">
                        {item.period}
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="w-full max-w-md">
                          <div className="h-6 bg-green-100 rounded-full overflow-hidden flex">
                            <div
                              className="bg-green-500 h-full transition-all duration-500"
                              style={{
                                width: `${(item.active / 120000) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-gray-600 w-20">
                          {(item.active / 1000).toFixed(0)}k
                        </span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="w-20 justify-center"
                      >
                        +{(item.new / 1000).toFixed(1)}k 新增
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-purple-600" />
                  各分类绩效表现
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboardData.chartData.categoryPerformance.map(
                    (item, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{item.category}</span>
                          <Badge
                            variant={
                              item.value >= item.target
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {item.value >= item.target ? '达标' : '未达标'}
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold mb-2">
                          ¥{(item.value / 10000).toFixed(0)}万
                          <span className="text-sm text-gray-500 ml-2">
                            / ¥{(item.target / 10000).toFixed(0)}万
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={cn(
                              'h-2 rounded-full transition-all',
                              item.value >= item.target
                                ? 'bg-green-600'
                                : 'bg-blue-600'
                            )}
                            style={{
                              width: `${(item.value / item.target) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          完成率：
                          {((item.value / item.target) * 100).toFixed(1)}%
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 预警信息实时面板 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 实时告警 */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-red-600" />
                  实时预警监控
                </div>
                <ExecutiveAlertPanel alerts={dashboardData.alerts} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.alerts.map(alert => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full mt-2',
                        getSeverityColor(alert.severity)
                      )}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900">
                          {alert.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {new Date(alert.timestamp).toLocaleString('zh-CN')}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {alert.category === 'financial' && '财务'}
                          {alert.category === 'user' && '用户'}
                          {alert.category === 'business' && '业务'}
                          {alert.category === 'operational' && '运营'}
                        </Badge>
                        <Badge
                          variant={
                            alert.severity === 'high'
                              ? 'destructive'
                              : alert.severity === 'medium'
                                ? 'default'
                                : 'secondary'
                          }
                          className="text-xs"
                        >
                          {alert.severity === 'high' && '高'}
                          {alert.severity === 'medium' && '中'}
                          {alert.severity === 'low' && '低'}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 核心运营指标 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-600" />
                核心运营指标
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">系统可用率</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-green-600">
                      {dashboardData.operationalMetrics.systemUptime.toFixed(2)}
                      %
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${dashboardData.operationalMetrics.systemUptime}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">平均响应时间</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-600">
                      {dashboardData.operationalMetrics.responseTime.toFixed(0)}
                      ms
                    </span>
                    <ArrowDownRight className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(((300 - dashboardData.operationalMetrics.responseTime) / 300) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">错误率</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-600">
                      {dashboardData.operationalMetrics.errorRate.toFixed(2)}%
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-red-600" />
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{
                      width: `${dashboardData.operationalMetrics.errorRate * 10}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* KPI 钻取弹窗 */}
      {showDrillDown && drillDownData && (
        <ExecutiveKPIDrillDown
          data={drillDownData}
          onClose={() => {
            setShowDrillDown(false);
            setDrillDownData(null);
          }}
        />
      )}
    </div>
  );
}
