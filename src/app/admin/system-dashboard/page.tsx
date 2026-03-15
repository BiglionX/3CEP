'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Users,
  Smartphone,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Activity,
  Server,
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download,
  Eye,
} from 'lucide-react';
import { useRbacPermission } from '@/hooks/use-rbac-permission';

interface SystemStats {
  // 用户统计
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  userGrowthRate: number;

  // 设备统计
  totalDevices: number;
  onlineDevices: number;
  maintenanceDevices: number;
  avgBatteryLevel: number;

  // 业务统计
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  revenue: number;

  // 系统状
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeServices: number;
}

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  responseTime: number;
  lastChecked: string;
}

interface RecentActivity {
  id: string;
  type: 'user_login' | 'device_registered' | 'order_created' | 'system_alert';
  title: string;
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
}

interface MonitoringMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  last_updated: string;
}

interface SystemAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'system' | 'security' | 'performance' | 'business';
  status: 'active' | 'acknowledged' | 'resolved';
  created_at: string;
  acknowledged_by: string;
  resolved_at: string;
  metrics: Record<string, any>;
}

export default function SystemDashboard() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    userGrowthRate: 0,
    totalDevices: 0,
    onlineDevices: 0,
    maintenanceDevices: 0,
    avgBatteryLevel: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    revenue: 0,
    uptime: 0,
    responseTime: 0,
    errorRate: 0,
    activeServices: 0,
  });

  const [serviceStatus, setServiceStatus] = useState<ServiceStatus[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [deviceStatusData, setDeviceStatusData] = useState<any[]>([]);

  // 监控相关状
  const [monitoringMetrics, setMonitoringMetrics] = useState<
    MonitoringMetric[]
  >([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [alertFilter, setAlertFilter] = useState({
    status: 'active' as 'active' | 'acknowledged' | 'resolved' | 'all',
    severity: '' as 'low' | 'medium' | 'high' | 'critical' | '',
  });

  // 权限检
  const { hasPermission } = useRbacPermission();
  const canView = hasPermission('sysdash.view');
  const canManage = hasPermission('sysdash.manage');

  // 获取监控指标
  const fetchMonitoringMetrics = async () => {
    try {
      const response = await fetch('/api/admin/system/monitoring/metrics');
      if (response.ok) {
        const data = await response.json();
        setMonitoringMetrics(data);
      }
    } catch (error) {
      console.error('获取监控指标失败:', error);
    }
  };

  // 获取系统告警
  const fetchSystemAlerts = async () => {
    try {
      const params = new URLSearchParams({
        status: alertFilter.status,
        severity: alertFilter.severity,
      });

      const response = await fetch(
        `/api/admin/system/monitoring/alerts${params}`
      );
      if (response.ok) {
        const data = await response.json();
        setSystemAlerts(data);
      }
    } catch (error) {
      console.error('获取系统告警失败:', error);
    }
  };

  // 处理告警
  const handleAlertAction = async (
    action: any: 'acknowledge' | 'resolve',
    alertId: string
  ) => {
    try {
      const response = await fetch('/api/admin/system/monitoring/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, alertId, userId: 'current_user' }),
      });

      if (response.ok) {
        alert(`告警{action === 'acknowledge'  '确认' : '解决'}`);
        fetchSystemAlerts(); // 刷新告警列表
      }
    } catch (error) {
      console.error('处理告警失败:', error);
      alert('处理告警失败');
    }
  };

  // 获取系统统计数据
  const fetchSystemStats = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      const mockStats: SystemStats = {
        totalUsers: 1247,
        activeUsers: 892,
        newUsersToday: 23,
        userGrowthRate: 12.5,
        totalDevices: 2156,
        onlineDevices: 1843,
        maintenanceDevices: 45,
        avgBatteryLevel: 78,
        totalOrders: 342,
        completedOrders: 298,
        pendingOrders: 44,
        revenue: 125800,
        uptime: 99.8,
        responseTime: 120,
        errorRate: 0.2,
        activeServices: 12,
      };

      setStats(mockStats);

      // 模拟服务状态数
      const mockServices: ServiceStatus[] = [
        {
          name: '用户服务',
          status: 'healthy',
          responseTime: 85,
          lastChecked: '2024-01-20T16:30:00Z',
        },
        {
          name: '设备服务',
          status: 'healthy',
          responseTime: 92,
          lastChecked: '2024-01-20T16:30:00Z',
        },
        {
          name: '订单服务',
          status: 'warning',
          responseTime: 230,
          lastChecked: '2024-01-20T16:30:00Z',
        },
        {
          name: '支付服务',
          status: 'healthy',
          responseTime: 110,
          lastChecked: '2024-01-20T16:30:00Z',
        },
        {
          name: '通知服务',
          status: 'critical',
          responseTime: 5000,
          lastChecked: '2024-01-20T16:30:00Z',
        },
        {
          name: '数据分析',
          status: 'healthy',
          responseTime: 156,
          lastChecked: '2024-01-20T16:30:00Z',
        },
      ];

      setServiceStatus(mockServices);

      // 模拟最近活
      const mockActivities: RecentActivity[] = [
        {
          id: 'act_001',
          type: 'user_login',
          title: '用户登录',
          description: '用户 admin 成功登录系统',
          timestamp: '2024-01-20T16:30:00Z',
          severity: 'low',
        },
        {
          id: 'act_002',
          type: 'device_registered',
          title: '设备注册',
          description: '新设iPhone 14 Pro 已注,
          timestamp: '2024-01-20T16:25:00Z',
          severity: 'low',
        },
        {
          id: 'act_003',
          type: 'order_created',
          title: '订单创建',
          description: '订单 #ORD-20240120-001 已创,
          timestamp: '2024-01-20T16:20:00Z',
          severity: 'medium',
        },
        {
          id: 'act_004',
          type: 'system_alert',
          title: '系统警告',
          description: '通知服务响应时间超过阈,
          timestamp: '2024-01-20T16:15:00Z',
          severity: 'high',
        },
      ];

      setRecentActivities(mockActivities);

      // 模拟用户增长数据
      const mockGrowthData = [
        { month: '1, users: 1200 },
        { month: '2, users: 1247 },
        { month: '3, users: 1320 },
        { month: '4, users: 1450 },
        { month: '5, users: 1580 },
        { month: '6, users: 1720 },
      ];

      setUserGrowthData(mockGrowthData);

      // 模拟设备状态数
      const mockDeviceData = [
        { name: '在线', value: stats.onlineDevices, color: '#10B981' },
        {
          name: '离线',
          value:
            stats.totalDevices - stats.onlineDevices - stats.maintenanceDevices,
          color: '#6B7280',
        },
        { name: '维修, value: stats.maintenanceDevices, color: '#F59E0B' },
      ];

      setDeviceStatusData(mockDeviceData);
    } catch (error) {
      console.error('获取系统统计失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 刷新数据
  const handleRefresh = () => {
    fetchSystemStats();
  };

  // 导出报告
  const handleExport = () => {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('导出系统报告')};

  // 查看详细信息
  const handleViewDetails = (section: string) => {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('查看详细信息:', section)};

  // 状态标签渲
  const renderStatusTag = (status: string) => {
    const statusConfig = {
      healthy: {
        variant: 'default' as const,
        text: '正常',
        color: 'bg-green-100 text-green-800',
      },
      warning: {
        variant: 'secondary' as const,
        text: '警告',
        color: 'bg-yellow-100 text-yellow-800',
      },
      critical: {
        variant: 'destructive' as const,
        text: '严重',
        color: 'bg-red-100 text-red-800',
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: 'secondary',
      text: status,
      color: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.text}
      </Badge>
    );
  };

  // 渲染监控指标状
  const renderMetricStatus = (metric: MonitoringMetric) => {
    const statusConfig = {
      normal: {
        variant: 'default' as const,
        text: '正常',
        color: 'bg-green-100 text-green-800',
      },
      warning: {
        variant: 'secondary' as const,
        text: '警告',
        color: 'bg-yellow-100 text-yellow-800',
      },
      critical: {
        variant: 'destructive' as const,
        text: '严重',
        color: 'bg-red-100 text-red-800',
      },
    };

    const config = statusConfig[metric.status] || {
      variant: 'secondary',
      text: '未知',
      color: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.text}
      </Badge>
    );
  };

  // 渲染告警严重程度
  const renderAlertSeverity = (severity: string) => {
    const severityConfig = {
      low: {
        variant: 'default' as const,
        text: ',
        color: 'bg-blue-100 text-blue-800',
      },
      medium: {
        variant: 'secondary' as const,
        text: ',
        color: 'bg-yellow-100 text-yellow-800',
      },
      high: {
        variant: 'destructive' as const,
        text: ',
        color: 'bg-orange-100 text-orange-800',
      },
      critical: {
        variant: 'destructive' as const,
        text: '严重',
        color: 'bg-red-100 text-red-800',
      },
    };

    const config = severityConfig[severity as keyof typeof severityConfig] || {
      variant: 'secondary',
      text: severity,
      color: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.text}
      </Badge>
    );
  };

  // 渲染告警状
  const renderAlertStatus = (status: string) => {
    const statusConfig = {
      active: {
        variant: 'destructive' as const,
        text: '活跃',
        color: 'bg-red-100 text-red-800',
      },
      acknowledged: {
        variant: 'secondary' as const,
        text: '已确,
        color: 'bg-blue-100 text-blue-800',
      },
      resolved: {
        variant: 'default' as const,
        text: '已解,
        color: 'bg-green-100 text-green-800',
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: 'secondary',
      text: status,
      color: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.text}
      </Badge>
    );
  };

  // 活动严重程度标签
  const renderSeverityTag = (severity: string) => {
    const severityConfig = {
      low: {
        variant: 'default' as const,
        text: ',
        color: 'bg-green-100 text-green-800',
      },
      medium: {
        variant: 'secondary' as const,
        text: ',
        color: 'bg-yellow-100 text-yellow-800',
      },
      high: {
        variant: 'destructive' as const,
        text: ',
        color: 'bg-red-100 text-red-800',
      },
    };

    const config = severityConfig[severity as keyof typeof severityConfig] || {
      variant: 'secondary',
      text: severity,
      color: 'bg-gray-100 text-gray-800',
    };
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.text}
      </Badge>
    );
  };

  // 初始化数
  useEffect(() => {
    fetchSystemStats();
    fetchMonitoringMetrics();
    fetchSystemAlerts();
  }, []);

  // 告警筛选变化时重新获取数据
  useEffect(() => {
    fetchSystemAlerts();
  }, [alertFilter]);

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">您没有权限查看系统概/p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作按*/}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">系统概览</h1>
          <p className="text-gray-600 mt-1">监控系统整体运行状态和关键指标</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            导出报告
          </Button>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              总用户数
            </CardTitle>
            <Users className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-green-600 mt-1">
              {stats.newUsersToday} 今日新增
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              在线设备
            </CardTitle>
            <Smartphone className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.onlineDevices.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              总计 {stats.totalDevices.toLocaleString()} 
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              完成订单
            </CardTitle>
            <ShoppingCart className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.pendingOrders} 个待处理
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              系统可用
            </CardTitle>
            <Activity className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uptime}%</div>
            <p className="text-xs text-gray-500 mt-1">
              响应时间 {stats.responseTime}ms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 图表和统计数*/}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 用户增长趋势*/}
        <Card>
          <CardHeader>
            <CardTitle>用户增长趋势</CardTitle>
            <CardDescription>个月用户增长情况</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 设备状态分布图 */}
        <Card>
          <CardHeader>
            <CardTitle>设备状态分/CardTitle>
            <CardDescription>当前设备运行状态/CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {deviceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 服务状态监*/}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>服务状态监/span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewDetails('services')}
            >
              <Eye className="w-4 h-4 mr-2" />
              查看详情
            </Button>
          </CardTitle>
          <CardDescription>核心服务运行状态和性能指标</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceStatus.map((service, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{service.name}</h3>
                    {renderStatusTag(service.status)}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <div>响应时间: {service.responseTime}ms</div>
                    <div>
                      最后检{' '}
                      {new Date(service.lastChecked).toLocaleTimeString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 最近活*/}
      <Card>
        <CardHeader>
          <CardTitle>最近活/CardTitle>
          <CardDescription>系统最近的重要事件和操/CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map(activity => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 border rounded-lg"
              >
                <div className="flex-shrink-0 mt-1">
                  {activity.type === 'user_login' && (
                    <Users className="w-5 h-5 text-blue-500" />
                  )}
                  {activity.type === 'device_registered' && (
                    <Smartphone className="w-5 h-5 text-green-500" />
                  )}
                  {activity.type === 'order_created' && (
                    <ShoppingCart className="w-5 h-5 text-purple-500" />
                  )}
                  {activity.type === 'system_alert' && (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">
                      {activity.title}
                    </p>
                    {renderSeverityTag(activity.severity)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 系统健康度概*/}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              系统健康
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">94.2%</div>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between text-sm">
                <span>服务正常/span>
                <span>85.7%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>性能达标/span>
                <span>92.3%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>安全合规/span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 text-blue-500 mr-2" />
              运行时长
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">187/div>
            <div className="mt-2 text-sm text-gray-600">
              自上次重启以来持续运行时
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span>平均无故障时/span>
                <span>45/span>
              </div>
              <div className="flex justify-between text-xs">
                <span>平均修复时间</span>
                <span>2.3小时</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 text-purple-500 mr-2" />
              数据统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold text-purple-600">2.4TB</div>
                <div className="text-sm text-gray-600">总数据量</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">99.9%</div>
                <div className="text-sm text-gray-600">数据完整/div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-sm text-gray-600">活跃数据库连/div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 监控指标面板 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">实时监控指标</h2>
          <Button variant="outline" size="sm" onClick={fetchMonitoringMetrics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新监控
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {monitoringMetrics.map(metric => (
            <Card key={metric.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {metric.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold">
                    {metric.value}
                    {metric.unit}
                  </div>
                  {renderMetricStatus(metric)}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  阈 {metric.threshold}
                  {metric.unit}
                </div>
                <div className="mt-1 text-xs text-gray-400">
                  更新时间: {new Date(metric.last_updated).toLocaleTimeString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 系统告警面板 */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">系统告警</h2>
          <div className="flex space-x-2">
            <select
              value={alertFilter.status}
              onChange={e =>
                setAlertFilter(prev => ({
                  ...prev,
                  status: e.target.value as any,
                }))
              }
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="all">所有状/option>
              <option value="active">活跃</option>
              <option value="acknowledged">已确/option>
              <option value="resolved">已解/option>
            </select>
            <select
              value={alertFilter.severity}
              onChange={e =>
                setAlertFilter(prev => ({
                  ...prev,
                  severity: e.target.value as any,
                }))
              }
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="">所有严重程/option>
              <option value="low">/option>
              <option value="medium">/option>
              <option value="high">/option>
              <option value="critical">严重</option>
            </select>
            <Button variant="outline" size="sm" onClick={fetchSystemAlerts}>
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新告警
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {systemAlerts.length === 0  (
              <div className="p-8 text-center text-gray-500">暂无告警信息</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {systemAlerts.map(alert => (
                  <div key={alert.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">
                            {alert.title}
                          </h3>
                          {renderAlertSeverity(alert.severity)}
                          {renderAlertStatus(alert.status)}
                          <span className="text-xs text-gray-500">
                            {new Date(alert.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {alert.description}
                        </p>
                        {alert.metrics && (
                          <div className="text-xs text-gray-500">
                            相关指标: {JSON.stringify(alert.metrics)}
                          </div>
                        )}
                        {alert.acknowledged_by && (
                          <div className="text-xs text-blue-600 mt-1">
                            已由 {alert.acknowledged_by} 确认
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-4">
                        {alert.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleAlertAction('acknowledge', alert.id)
                            }
                          >
                            确认
                          </Button>
                        )}
                        {(alert.status === 'active' ||
                          alert.status === 'acknowledged') && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleAlertAction('resolve', alert.id)
                            }
                          >
                            解决
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

