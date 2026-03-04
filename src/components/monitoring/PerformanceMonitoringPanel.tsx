'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Activity,
  AlertTriangle,
  Server,
  Database,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Clock,
  Zap,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { monitoringService } from '@/lib/monitoring-service';
import { MonitoringSnapshot, AlertEvent } from '@/types/monitoring.types';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: number;
  icon: React.ReactNode;
  status?: 'normal' | 'warning' | 'critical';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit = '',
  trend,
  icon,
  status = 'normal',
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-green-600';
    }
  };

  const getBgColor = () => {
    switch (status) {
      case 'warning':
        return 'bg-yellow-50';
      case 'critical':
        return 'bg-red-50';
      default:
        return 'bg-green-50';
    }
  };

  return (
    <Card className={`${getBgColor()} border-0`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <div
          className={`p-2 rounded-full ${getStatusColor().replace('text', 'bg')} bg-opacity-20`}
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline">
          <div className="text-2xl font-bold text-gray-900">
            {value}
            {unit && (
              <span className="text-sm font-normal text-gray-500 ml-1">
                {unit}
              </span>
            )}
          </div>
          {trend !== undefined && (
            <div
              className={`ml-2 flex items-center text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {trend >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const RealTimeChart: React.FC<{
  data: any[];
  title: string;
  color: string;
  height?: number;
}> = ({ data, title, color, height = 200 }) => {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">暂无数据</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="text-sm font-medium text-gray-900 mb-3">{title}</h3>
      <div className="relative h-48">
        <div className="absolute inset-0 flex items-end space-x-1">
          {data.map((point, index) => {
            const heightPercent = ((point.value - minValue) / range) * 100;
            return (
              <div
                key={index}
                className={`flex-1 rounded-t ${color}`}
                style={{ height: `${heightPercent}%` }}
                title={`${point.timestamp}: ${point.value}`}
              />
            );
          })}
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>{new Date(data[0]?.timestamp).toLocaleTimeString()}</span>
        <span>
          {new Date(data[data.length - 1]?.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

const AlertList: React.FC<{ alerts: AlertEvent[] }> = ({ alerts }) => {
  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'error':
        return 'bg-orange-100 text-orange-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">当前无告?/p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map(alert => (
        <div key={alert.id} className="border rounded-lg p-4 hover:bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={getAlertColor(alert.severity)}>
                  {alert.severity.toUpperCase()}
                </Badge>
                <span className="text-sm text-gray-500">
                  {new Date(alert.triggered_at).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-900 font-medium">{alert.message}</p>
              <p className="text-sm text-gray-600 mt-1">
                指标: {alert.metric_name} | 当前? {alert.current_value} |
                阈? {alert.threshold}
              </p>
            </div>
            <Button variant="outline" size="sm">
              处理
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function PerformanceMonitoringPanel() {
  const [snapshot, setSnapshot] = useState<MonitoringSnapshot | null>(null);
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000); // 30秒自动刷?      return () => clearInterval(interval);
    }
  }, [timeRange]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 获取监控快照
      const snapshotResponse = await fetch('/api/monitoring?action=snapshot');
      const snapshotData = await snapshotResponse.json();

      if (snapshotData.success) {
        setSnapshot(snapshotData.data);
      }

      // 获取活跃告警
      const alertsResponse = await fetch(
        '/api/monitoring?action=alerts&status=active'
      );
      const alertsData = await alertsResponse.json();

      if (alertsData.success) {
        setAlerts(alertsData.alerts);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error('获取监控数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
  };

  if (loading && !snapshot) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="text-center py-12">
        <Server className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          无法获取监控数据
        </h2>
        <p className="text-gray-600 mb-6">请检查监控服务是否正常运?/p>
        <Button onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          重试
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 头部区域 */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Activity className="w-8 h-8 mr-3 text-blue-600" />
              性能监控面板
            </h1>
            <p className="mt-2 text-gray-600">实时监控系统性能和业务指?/p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">最后更?</span>
              <span className="text-sm font-medium">
                {lastUpdate.toLocaleTimeString()}
              </span>
            </div>

            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15m">15分钟</SelectItem>
                <SelectItem value="1h">1小时</SelectItem>
                <SelectItem value="6h">6小时</SelectItem>
                <SelectItem value="24h">24小时</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={autoRefresh ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`}
              />
              {autoRefresh ? '自动刷新' : '手动刷新'}
            </Button>

            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 状态概?*/}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <Server className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">系统状?/p>
              <p className="text-lg font-semibold text-green-600">正常运行</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">活跃告警</p>
              <p className="text-lg font-semibold text-blue-600">
                {alerts.length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border flex items-center">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">在线用户</p>
              <p className="text-lg font-semibold text-purple-600">
                {snapshot.business.user_activity.online_users.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border flex items-center">
            <div className="rounded-full bg-orange-100 p-3 mr-4">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">今日收入</p>
              <p className="text-lg font-semibold text-orange-600">
                ¥{(snapshot.business.revenue.daily_revenue / 10000).toFixed(1)}
                �?              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 主要指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="日活跃用?
          value={snapshot.business.user_activity.dau.toLocaleString()}
          icon={<Users className="w-5 h-5" />}
          trend={2.5}
        />

        <MetricCard
          title="系统可用?
          value={(
            snapshot.technical.system_performance.availability * 100
          ).toFixed(2)}
          unit="%"
          icon={<Server className="w-5 h-5" />}
          status={
            snapshot.technical.system_performance.availability > 0.99
              ? 'normal'
              : 'warning'
          }
        />

        <MetricCard
          title="API响应时间"
          value={snapshot.technical.system_performance.api_response_time.average.toFixed(
            0
          )}
          unit="ms"
          icon={<Zap className="w-5 h-5" />}
          status={
            snapshot.technical.system_performance.api_response_time.average >
            1000
              ? 'warning'
              : 'normal'
          }
        />

        <MetricCard
          title="错误?
          value={(
            snapshot.technical.system_performance.error_rate * 100
          ).toFixed(2)}
          unit="%"
          icon={<AlertTriangle className="w-5 h-5" />}
          status={
            snapshot.technical.system_performance.error_rate > 0.01
              ? 'warning'
              : 'normal'
          }
        />
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RealTimeChart data={[]} title="API响应时间趋势" color="bg-blue-500" />

        <RealTimeChart data={[]} title="系统负载趋势" color="bg-green-500" />
      </div>

      {/* 告警和详细指?*/}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 活跃告警 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
              活跃告警 ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AlertList alerts={alerts} />
          </CardContent>
        </Card>

        {/* 详细指标 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
              详细指标
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">CPU使用?/span>
                <span className="font-medium">
                  {snapshot.technical.resources.cpu_utilization.toFixed(1)}%
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">内存使用?/span>
                <span className="font-medium">
                  {snapshot.technical.resources.memory_utilization.toFixed(1)}%
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">QPS</span>
                <span className="font-medium">
                  {snapshot.technical.application.qps}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">今日订单?/span>
                <span className="font-medium">
                  {snapshot.business.transactions.order_count}
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Token消?/span>
                <span className="font-medium">
                  {snapshot.business.agent_market.daily_token_consumption.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
