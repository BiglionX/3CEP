'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MonitoringService,
  type SystemMetrics,
} from '@/services/monitoring-service';
import { format } from 'date-fns';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  HardDrive,
  Info,
  RefreshCw,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [healthScore, setHealthScore] = useState(0);
  const [alerts, setAlerts] = useState<
    Array<{
      id: string;
      level: 'info' | 'warning' | 'error';
      message: string;
      timestamp: string;
    }>
  >([]);
  const [chartData, setChartData] = useState<any[]>([]);

  // 初始化加载数据
  useEffect(() => {
    loadData();
    // 设置定时刷新
    const interval = setInterval(loadData, 30000); // 每30秒刷新一次
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 并行获取所有数据
      const [metricsData, healthData, alertsData, chartData] =
        await Promise.all([
          MonitoringService.getSystemMetrics(),
          MonitoringService.getSystemHealth(),
          MonitoringService.getRecentAlerts(),
          MonitoringService.getHistoricalData('active_users', 24),
        ]);

      setMetrics(metricsData);
      setHealthScore(healthData);
      setAlerts(alertsData);

      // 转换图表数据格式
      const formattedChartData = chartData.map((point: any) => ({
        time: format(new Date(point.timestamp), 'HH:mm'),
        users: point.value,
      }));
      setChartData(formattedChartData);
    } catch (error) {
      console.error('加载监控数据失败:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        加载监控数据中...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和刷新按钮 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">系统监控仪表板</h1>
          <p className="text-muted-foreground">
            实时监控系统运行状态和关键指标
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw
            className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
          />
          {refreshing ? '刷新中...' : '刷新数据'}
        </Button>
      </div>

      {/* 健康状态概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`${getHealthBgColor(healthScore)} border-0`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              系统健康分
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getHealthColor(healthScore)}`}
            >
              {healthScore}%
            </div>
            <p className="text-xs text-muted-foreground">
              {healthScore >= 80
                ? '系统运行良好'
                : healthScore >= 60
                  ? '需要关注'
                  : '系统存在问题'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="w-4 h-4 mr-2" />
              活跃用户
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.active_users || 0}
            </div>
            <p className="text-xs text-muted-foreground">过去1小时活跃用户数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              待审核
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.pending_reviews || 0}
            </div>
            <p className="text-xs text-muted-foreground">等待处理的任务数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              今日收入
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{(metrics?.revenue_today || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">今日业务收入</p>
          </CardContent>
        </Card>
      </div>

      {/* 系统资源监控 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Cpu className="w-5 h-5 mr-2" />
              CPU使用率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">当前使用率</span>
                <span className="font-medium">{metrics?.cpu_usage || 0}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    (metrics?.cpu_usage || 0) > 80
                      ? 'bg-red-500'
                      : (metrics?.cpu_usage || 0) > 60
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${metrics?.cpu_usage || 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              内存使用率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">当前使用率</span>
                <span className="font-medium">
                  {metrics?.memory_usage || 0}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    (metrics?.memory_usage || 0) > 85
                      ? 'bg-red-500'
                      : (metrics?.memory_usage || 0) > 70
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${metrics?.memory_usage || 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HardDrive className="w-5 h-5 mr-2" />
              磁盘使用率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">当前使用率</span>
                <span className="font-medium">{metrics?.disk_usage || 0}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    (metrics?.disk_usage || 0) > 90
                      ? 'bg-red-500'
                      : (metrics?.disk_usage || 0) > 80
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${metrics?.disk_usage || 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 图表和警告区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 用户活跃度趋势图 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              用户活跃度趋势 (24小时)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 系统警告 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              系统警告
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>暂无系统警告</p>
                </div>
              ) : (
                alerts.map(alert => (
                  <div
                    key={alert.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border"
                  >
                    {getAlertIcon(alert.level)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(
                          new Date(alert.timestamp),
                          'yyyy-MM-dd HH:mm:ss'
                        )}
                      </p>
                    </div>
                    <Badge
                      variant={
                        alert.level === 'error'
                          ? 'destructive'
                          : alert.level === 'warning'
                            ? 'default'
                            : 'secondary'
                      }
                    >
                      {alert.level === 'error'
                        ? '严重'
                        : alert.level === 'warning'
                          ? '警告'
                          : '信息'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 详细指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">API响应时间</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.api_response_time || 0}ms
            </div>
            <p className="text-xs text-muted-foreground">平均响应时间</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">错误率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.error_rate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">系统错误率</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">在线用户</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.online_users || 0}
            </div>
            <p className="text-xs text-muted-foreground">当前在线用户数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">近期活动</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.recent_activities || 0}
            </div>
            <p className="text-xs text-muted-foreground">过去24小时活动数</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
