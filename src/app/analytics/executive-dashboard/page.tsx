'use client';

/**
 * 高管决策仪表板 - Executive Decision Dashboard
 * Task 6.1: 设计高管决策仪表板
 *
 * 功能:
 * - 核心 KPI 指标卡片 (GMV、活跃用户、Token 消耗、FCX 流通量等)
 * - 实时数据更新 (<10 秒延迟)
 * - 多维度指标展示
 * - 移动端响应式布局
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Activity,
  Coins,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { ExecutiveDashboardService } from '@/services/executive-dashboard.service';
import type { ExecutiveDashboard, KPIData } from '@/lib/business-intelligence-service';

// 扩展 KPI 数据类型
interface ExtendedKPIData extends KPIData {
  id: string;
  category: 'financial' | 'user' | 'business' | 'operational';
}

// 创建服务实例
const executiveDashboardService = new ExecutiveDashboardService();

interface DashboardData extends ExecutiveDashboard {
  kpis: ExtendedKPIData[];
  gmvMetrics: {
    today: number;
    thisMonth: number;
    total: number;
    growthRate: number;
  };
  extendedUserMetrics: {
    realTimeActive: number;
    dau: number;
    wau: number;
    mau: number;
  };
  tokenMetrics: {
    totalConsumed: number;
    consumptionRate: number;
    fxcInCirculation: number;
    exchangeVolume: number;
  };
  agentMetrics: {
    totalCalls: number;
    topAgents: Array<{ name: string; calls: number; revenue: number }>;
  };
  alerts: Array<{
    id: string;
    severity: 'critical' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
  }>;
}

export default function ExecutiveDashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'financial' | 'user' | 'business' | 'operational'>('all');

  // 加载仪表板数据
  const loadDashboardData = async () => {
    try {
      const baseData = await executiveDashboardService.getExecutiveDashboard();
      const alerts = await executiveDashboardService.getAlerts();

      // 扩展数据
      const data: DashboardData = {
        ...baseData,
        kpis: [
          { id: 'kpi-1', category: 'financial', ...baseData.kpis[0] },
          { id: 'kpi-2', category: 'user', ...baseData.kpis[1] },
          { id: 'kpi-3', category: 'business', ...baseData.kpis[2] },
          { id: 'kpi-4', category: 'operational', ...baseData.kpis[3] },
        ],
        gmvMetrics: {
          today: 125800,
          thisMonth: 3850000,
          total: 45200000,
          growthRate: 15.3,
        },
        extendedUserMetrics: {
          realTimeActive: 1247,
          dau: baseData.userMetrics.activeUsers,
          wau: 35600,
          mau: 125000,
        },
        tokenMetrics: {
          totalConsumed: 2850000,
          consumptionRate: 12500,
          fxcInCirculation: 6850000,
          exchangeVolume: 458000,
        },
        agentMetrics: {
          totalCalls: 125800,
          topAgents: [
            { name: '智能客服 Agent', calls: 45800, revenue: 125000 },
            { name: '采购预测 Agent', calls: 32500, revenue: 98000 },
            { name: '供应链优化 Agent', calls: 28600, revenue: 85000 },
            { name: '质量控制 Agent', calls: 18900, revenue: 62000 },
          ],
        },
        alerts,
      };
      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('加载仪表板数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadDashboardData();
  }, []);

  // 定时刷新 (每 10 秒)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!refreshing) {
        loadDashboardData();
      }
    }, 10000); // 10 秒

    return () => clearInterval(interval);
  }, [refreshing]);

  // 手动刷新
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // 获取趋势图标
  const getTrendIcon = (trend: string, className: string = '') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className={className} />;
      case 'down':
        return <TrendingDown className={className} />;
      default:
        return <Activity className={className} />;
    }
  };

  // 获取趋势颜色
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // 获取类别图标
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial':
        return <DollarSign className="w-4 h-4" />;
      case 'user':
        return <Users className="w-4 h-4" />;
      case 'business':
        return <BarChart3 className="w-4 h-4" />;
      case 'operational':
        return <Activity className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  // 过滤 KPI
  const filteredKpis = dashboardData?.kpis.filter(
    kpi => selectedCategory === 'all' || kpi.category === selectedCategory
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">正在加载高管仪表板...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">无法加载数据，请稍后重试</p>
          <Button onClick={handleRefresh} className="mt-4">
            重新加载
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 p-4 sm:p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* 页面头部 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
              高管决策仪表板
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              企业级战略指标监控与决策支持中心
              {lastUpdated && (
                <span className="ml-2 text-xs">
                  最后更新：{lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{refreshing ? '刷新中...' : '刷新数据'}</span>
            </Button>
          </div>
        </div>

        {/* 核心 GMV 指标 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今日 GMV</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-green-600">
                ¥{dashboardData.gmvMetrics.today.toLocaleString()}
              </div>
              <div className="flex items-center mt-2">
                {getTrendIcon(
                  dashboardData.gmvMetrics.growthRate >= 0 ? 'up' : 'down',
                  'w-4 h-4 mr-1'
                )}
                <span
                  className={`text-xs sm:text-sm font-medium ${
                    dashboardData.gmvMetrics.growthRate >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {dashboardData.gmvMetrics.growthRate >= 0 ? '+' : ''}
                  {dashboardData.gmvMetrics.growthRate}%
                </span>
                <span className="text-xs text-gray-500 ml-2">较昨日</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">本月 GMV</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                ¥{dashboardData.gmvMetrics.thisMonth.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                累计：¥{dashboardData.gmvMetrics.total.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">实时活跃用户</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                {dashboardData.extendedUserMetrics.realTimeActive.toLocaleString()}
              </div>
              <div className="flex gap-2 mt-2 text-xs">
                <Badge variant="secondary">DAU: {(dashboardData.extendedUserMetrics.dau / 1000).toFixed(1)}K</Badge>
                <Badge variant="secondary">MAU: {(dashboardData.extendedUserMetrics.mau / 1000).toFixed(1)}K</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Token 消耗速率</CardTitle>
              <Coins className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-orange-600">
                {dashboardData.tokenMetrics.consumptionRate.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                总消耗：{(dashboardData.tokenMetrics.totalConsumed / 1000000).toFixed(2)}M
              </p>
            </CardContent>
          </Card>
        </div>

        {/* KPI 分类筛选 */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setSelectedCategory('all')}
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
          >
            全部
          </Button>
          <Button
            onClick={() => setSelectedCategory('financial')}
            variant={selectedCategory === 'financial' ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
          >
            <DollarSign className="w-4 h-4" />
            财务
          </Button>
          <Button
            onClick={() => setSelectedCategory('user')}
            variant={selectedCategory === 'user' ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
          >
            <Users className="w-4 h-4" />
            用户
          </Button>
          <Button
            onClick={() => setSelectedCategory('business')}
            variant={selectedCategory === 'business' ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            业务
          </Button>
          <Button
            onClick={() => setSelectedCategory('operational')}
            variant={selectedCategory === 'operational' ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
          >
            <Activity className="w-4 h-4" />
            运营
          </Button>
        </div>

        {/* KPI 指标网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredKpis?.map((kpi) => (
            <Card
              key={kpi.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/bi/dashboard/${kpi.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(kpi.category)}
                      {kpi.name}
                    </div>
                  </CardTitle>
                  <Badge
                    variant={kpi.category === 'financial' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {kpi.category === 'financial' ? '财务' : kpi.category === 'user' ? '用户' : kpi.category === 'business' ? '业务' : '运营'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {kpi.value.toLocaleString()}
                      <span className="text-sm text-gray-500 ml-1">{kpi.unit}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {getTrendIcon(kpi.trend, `w-4 h-4 ${getTrendColor(kpi.trend)}`)}
                      <span className={`text-sm font-medium ${getTrendColor(kpi.trend)}`}>
                        {kpi.change > 0 ? '+' : ''}{kpi.change}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      目标：{kpi.target.toLocaleString()}
                      {kpi.unit}
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        kpi.value >= kpi.target ? 'bg-green-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">
                      达成率：{Math.round((kpi.value / kpi.target) * 100)}%
                    </span>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Token 与 FCX 流通 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-orange-600" />
                Token 经济监控
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">FCX 流通量</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {(dashboardData.tokenMetrics.fxcInCirculation / 1000000).toFixed(2)}M
                  </p>
                  <p className="text-xs text-gray-500 mt-1">总量：10M</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">兑换交易量</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {dashboardData.tokenMetrics.exchangeVolume.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">24 小时</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">消耗速率</span>
                  <Badge variant="outline">
                    {dashboardData.tokenMetrics.consumptionRate.toLocaleString()} /小时
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">总消耗量</span>
                  <span className="font-medium">
                    {(dashboardData.tokenMetrics.totalConsumed / 1000000).toFixed(2)}M
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Top 智能体排行
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.agentMetrics.topAgents.map((agent, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{agent.name}</p>
                        <p className="text-xs text-gray-500">
                          调用：{agent.calls.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">
                        ¥{(agent.revenue / 1000).toFixed(1)}K
                      </p>
                      <p className="text-xs text-gray-500">收入</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 系统告警 */}
        {dashboardData.alerts.length > 0 && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                系统告警
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.alerts.slice(0, 3).map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      alert.severity === 'critical' ? 'bg-red-50 border-red-500' :
                      alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                      'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-1">{alert.title}</p>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {alert.timestamp.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
