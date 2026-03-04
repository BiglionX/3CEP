'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  DollarSign,
  BarChart3,
  Target,
  AlertTriangle,
  Award,
  Globe,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { biService } from '@/lib/business-intelligence-service';

interface KPIData {
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  unit: string;
}

interface DashboardData {
  kpis: KPIData[];
  revenueMetrics: any;
  userMetrics: any;
  operationalMetrics: any;
}

export default function BusinessIntelligenceDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('month');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await biService.getExecutiveDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载商业智能数据...</p>
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Award className="w-10 h-10 text-blue-600" />
                商业智能看板
              </h1>
              <p className="text-gray-600">企业级决策支持与业务洞察平台</p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={refreshData}
                disabled={refreshing}
                variant="outline"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
                />
                {refreshing ? '刷新?..' : '刷新数据'}
              </Button>
            </div>
          </div>
        </div>

        {/* KPI指标卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardData.kpis.map((kpi, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {kpi.name}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mb-2">
                      {kpi.value.toLocaleString()}
                      {kpi.unit}
                    </p>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(kpi.trend)}
                      <span
                        className={`text-sm font-medium ${getTrendColor(kpi.trend)}`}
                      >
                        {kpi.change > 0 ? '+' : ''}
                        {kpi.change}%
                      </span>
                      <span className="text-xs text-gray-500">vs 目标</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">目标</div>
                    <div className="text-sm font-medium text-gray-700">
                      {kpi.target.toLocaleString()}
                      {kpi.unit}
                    </div>
                  </div>
                </div>

                {/* 进度?*/}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>
                      达成? {Math.round((kpi.value / kpi.target) * 100)}%
                    </span>
                    <span>{kpi.unit === '%' ? '百分? : '绝对?}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 核心业务指标 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* 收入指标 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                收入表现
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="font-medium">月度收入</span>
                <span className="text-2xl font-bold text-green-600">
                  ¥
                  {dashboardData.revenueMetrics.monthlyRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">增长?/span>
                <Badge
                  variant={
                    dashboardData.revenueMetrics.growthRate >= 0
                      ? 'default'
                      : 'destructive'
                  }
                >
                  {dashboardData.revenueMetrics.growthRate >= 0 ? '+' : ''}
                  {dashboardData.revenueMetrics.growthRate}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">收入预测</span>
                <span className="font-medium">
                  ¥{dashboardData.revenueMetrics.forecast.toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 用户指标 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                用户增长
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="font-medium">活跃用户</span>
                <span className="text-2xl font-bold text-blue-600">
                  {dashboardData.userMetrics.activeUsers.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">留存?/span>
                <Badge
                  variant={
                    dashboardData.userMetrics.retentionRate >= 80
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {dashboardData.userMetrics.retentionRate}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">获客成本</span>
                <span className="font-medium">
                  ¥{dashboardData.userMetrics.acquisitionCost}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 运营效率 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" />
                运营效率
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <span className="font-medium">系统可用?/span>
                <span className="text-2xl font-bold text-purple-600">
                  {dashboardData.operationalMetrics.systemUptime}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">响应时间</span>
                <Badge variant="secondary">
                  {dashboardData.operationalMetrics.responseTime}ms
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">错误?/span>
                <span className="font-medium text-red-600">
                  {dashboardData.operationalMetrics.errorRate}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 高级分析区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 竞争力分?*/}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                市场竞争力分?              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">市场份额</h3>
                  <div className="text-3xl font-bold text-blue-600">35%</div>
                  <p className="text-sm text-gray-600">行业排名?�?/p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-sm text-gray-600">竞争优势</div>
                    <ul className="text-xs text-gray-700 mt-1 space-y-1">
                      <li>�?技术创?/li>
                      <li>�?用户体验</li>
                      <li>�?成本优势</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-sm text-gray-600">发展机会</div>
                    <ul className="text-xs text-gray-700 mt-1 space-y-1">
                      <li>�?新兴市场</li>
                      <li>�?国际?/li>
                      <li>�?生态合?/li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 风险评估 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                风险评估矩阵
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">整体风险评分</span>
                  <Badge variant="outline" className="text-lg">
                    {Math.round(60 + Math.random() * 25)}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>市场风险</span>
                      <span className="font-medium">72�?/span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: '72%' }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>运营风险</span>
                      <span className="font-medium">78�?/span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: '78%' }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>财务风险</span>
                      <span className="font-medium">68�?/span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: '68%' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-yellow-50 rounded text-sm text-yellow-700">
                  <strong>风险缓解策略:</strong>{' '}
                  多元化收入来源，加强技术投入，完善风控体系
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 行动建议 */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              战略行动建议
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">增长机会</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>�?拓展东南亚市?/li>
                  <li>�?开发企业级产品</li>
                  <li>�?加强合作伙伴关系</li>
                </ul>
              </div>

              <div className="p-4 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-700 mb-2">优化重点</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>�?提升用户留存?/li>
                  <li>�?降低运营成本</li>
                  <li>�?优化产品体验</li>
                </ul>
              </div>

              <div className="p-4 border border-purple-200 rounded-lg">
                <h3 className="font-semibold text-purple-700 mb-2">风险管理</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>�?建立预警机制</li>
                  <li>�?多元化供应商</li>
                  <li>�?加强合规管控</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

