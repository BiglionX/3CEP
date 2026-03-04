'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/components/providers/AuthProvider';
import { RoleGuard } from '@/components/RoleGuard';
import { KpiCard, AlertsList } from '@/components/ui/KpiCard';
import {
  SystemHealthCard,
  BusinessKpiCard,
} from '@/components/ui/SystemHealthCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Server,
  Database,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

export default function RoleAwareDashboard() {
  const { user, roles, tenantId, isLoading } = useUser();
  const [currentTime, setCurrentTime] = useState(new Date());

  // 更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 系统健康数据 (Admin/Ops)
  const systemHealthData = {
    server: {
      status: 'healthy',
      metrics: [
        { name: 'CPU使用?, value: '45', unit: '%', status: 'normal' },
        { name: '内存使用?, value: '68', unit: '%', status: 'normal' },
        { name: '磁盘使用?, value: '32', unit: '%', status: 'normal' },
        { name: '网络延迟', value: '12', unit: 'ms', status: 'normal' },
      ],
      lastUpdated: new Date().toISOString(),
    },
    database: {
      status: 'warning',
      metrics: [
        { name: '连接?, value: '156', unit: '�?, status: 'normal' },
        { name: '查询延迟', value: '156', unit: 'ms', status: 'warning' },
        { name: '缓存命中?, value: '87', unit: '%', status: 'normal' },
        { name: '备份状?, value: '正常', unit: '', status: 'normal' },
      ],
      lastUpdated: new Date().toISOString(),
    },
  };

  // 业务KPI数据 (Biz)
  const businessKpiData = {
    sales: {
      title: '销售业?,
      kpis: [
        {
          name: '本月销售额',
          current: 1250000,
          target: 1500000,
          unit: '�?,
          trend: 'up',
        },
        {
          name: '订单数量',
          current: 3420,
          target: 4000,
          unit: '�?,
          trend: 'up',
        },
        {
          name: '客户转化?,
          current: 12.5,
          target: 15,
          unit: '%',
          trend: 'stable',
        },
      ],
      period: '本月',
    },
    operations: {
      title: '运营指标',
      kpis: [
        {
          name: '平均处理时间',
          current: 2.3,
          target: 2,
          unit: '小时',
          trend: 'down',
        },
        {
          name: '客户满意?,
          current: 4.6,
          target: 4.8,
          unit: '�?,
          trend: 'up',
        },
        {
          name: '退货率',
          current: 3.2,
          target: 2.5,
          unit: '%',
          trend: 'down',
        },
      ],
      period: '本月',
    },
  };

  // 分析师趋势数?(Analyst)
  const analystData = {
    trends: [
      {
        name: '用户增长趋势',
        value: '+15%',
        status: 'success',
        icon: <TrendingUp />,
      },
      {
        name: '收入增长?,
        value: '+8%',
        status: 'warning',
        icon: <TrendingUp />,
      },
      {
        name: '市场占有?,
        value: '12.5%',
        status: 'info',
        icon: <BarChart3 />,
      },
      { name: '用户留存?, value: '78%', status: 'success', icon: <Users /> },
    ],
    forecasts: [
      { metric: '下季度收入预?, value: '¥4,200,000', confidence: '85%' },
      { metric: '用户增长预测', value: '+22%', confidence: '78%' },
      { metric: '市场份额预测', value: '15.2%', confidence: '92%' },
    ],
  };

  // 合作伙伴KPI数据 (Partner)
  const partnerKpiData = {
    tenantPerformance: {
      title: '租户运营表现',
      kpis: [
        {
          name: '服务可用?,
          current: 99.8,
          target: 99.5,
          unit: '%',
          trend: 'up',
        },
        {
          name: '响应时间',
          current: 120,
          target: 150,
          unit: 'ms',
          trend: 'down',
        },
        {
          name: '错误?,
          current: 0.2,
          target: 0.5,
          unit: '%',
          trend: 'down',
        },
      ],
      period: '本月',
    },
  };

  // 告警数据
  const alerts = [
    {
      id: '1',
      type: 'system',
      severity: 'high',
      title: '数据库查询延迟增?,
      message: '主数据库查询响应时间超过阈值，当前156ms',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      unread: true,
    },
    {
      id: '2',
      type: 'business',
      severity: 'medium',
      title: '库存预警',
      message: 'iPhone 15 Pro库存低于安全?,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      unread: false,
    },
    {
      id: '3',
      type: 'performance',
      severity: 'low',
      title: '页面加载速度下降',
      message: '首页加载时间较昨日增?.3�?,
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      unread: false,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部信息 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">仪表?/h1>
          <p className="mt-1 text-sm text-gray-600">
            欢迎回来, {user?.email || '用户'} · {currentTime.toLocaleString()}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {roles.map((role, index) => (
              <Badge key={index} variant="secondary">
                {role}
              </Badge>
            ))}
            {tenantId && <Badge variant="outline">租户: {tenantId}</Badge>}
          </div>
        </div>
      </div>

      {/* 管理?运维人员视图 - 系统健康 */}
      <RoleGuard roles={['admin']}>
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              系统健康监控
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SystemHealthCard
                title="服务器状?
                status={systemHealthData.server.status}
                metrics={systemHealthData.server.metrics}
                lastUpdated={systemHealthData.server.lastUpdated}
                onRefresh={() => // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('刷新服务器状?)}
              />
              <SystemHealthCard
                title="数据库状?
                status={systemHealthData.database.status}
                metrics={systemHealthData.database.metrics}
                lastUpdated={systemHealthData.database.lastUpdated}
                onRefresh={() => // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('刷新数据库状?)}
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              实时告警
            </h2>
            <AlertsList
              alerts={alerts}
              onAlertClick={id => // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('查看告警:', id)}
            />
          </div>
        </div>
      </RoleGuard>

      {/* 业务人员视图 - 业务KPI */}
      <RoleGuard roles={['content_reviewer', 'shop_reviewer', 'finance']}>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            业务关键指标
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BusinessKpiCard
              title={businessKpiData.sales.title}
              kpis={businessKpiData.sales.kpis}
              period={businessKpiData.sales.period}
            />
            <BusinessKpiCard
              title={businessKpiData.operations.title}
              kpis={businessKpiData.operations.kpis}
              period={businessKpiData.operations.period}
            />
          </div>
        </div>
      </RoleGuard>

      {/* 分析师视?- 趋势分析 */}
      <RoleGuard roles={['content_reviewer', 'shop_reviewer']}>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            数据分析与趋?          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {analystData.trends.map((trend, index) => (
              <KpiCard
                key={index}
                title={trend.name}
                value={trend.value}
                status={trend.status as any}
                icon={trend.icon}
              />
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>预测分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analystData.forecasts.map((forecast, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium">{forecast.metric}</span>
                    <div className="text-right">
                      <div className="font-semibold">{forecast.value}</div>
                      <div className="text-sm text-gray-500">
                        置信? {forecast.confidence}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </RoleGuard>

      {/* 合作伙伴视图 - 租户KPI */}
      <RoleGuard roles={['viewer']}>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            租户运营指标
          </h2>
          <BusinessKpiCard
            title={partnerKpiData.tenantPerformance.title}
            kpis={partnerKpiData.tenantPerformance.kpis}
            period={partnerKpiData.tenantPerformance.period}
          />
        </div>
      </RoleGuard>

      {/* 默认视图 - 基础概览 */}
      <RoleGuard roles={['viewer']}>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">平台概览</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="总用户数"
              value="12,345"
              unit="�?
              trend="up"
              trendValue={12}
              status="success"
              icon={<Users className="w-5 h-5" />}
            />
            <KpiCard
              title="总交易额"
              value="¥2,847,231"
              trend="up"
              trendValue={8}
              status="success"
              icon={<DollarSign className="w-5 h-5" />}
            />
            <KpiCard
              title="活跃订单"
              value="1,234"
              unit="�?
              trend="stable"
              trendValue={0}
              status="info"
              icon={<ShoppingCart className="w-5 h-5" />}
            />
            <KpiCard
              title="系统状?
              value="正常"
              status="success"
              icon={<CheckCircle className="w-5 h-5" />}
            />
          </div>
        </div>
      </RoleGuard>
    </div>
  );
}
