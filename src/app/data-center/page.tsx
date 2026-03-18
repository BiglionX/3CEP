'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRbacPermission } from '@/hooks/use-rbac-permission';
import {
  Database,
  Shield,
  Activity,
  Settings,
  Monitor,
  AlertTriangle,
  TrendingUp,
  Globe,
  Search,
  RefreshCw,
  Download,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DataCenterStats {
  totalDevices: number;
  activeQueries: number;
  dataSources: number;
  alerts: number;
  uptime: string;
  lastSync: string;
}

interface DataSource {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'warning';
  lastUpdate: string;
  records: number;
}

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  source: string;
}

export default function DataCenterPage() {
  const router = useRouter();
  const { hasPermission } = useRbacPermission();
  const [stats, setStats] = useState<DataCenterStats>({
    totalDevices: 0,
    activeQueries: 0,
    dataSources: 0,
    alerts: 0,
    uptime: '0%',
    lastSync: '',
  });
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载数据统计
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // 获取统计数据
      const statsResponse = await fetch('/api/data-centeraction=health');
      if (statsResponse.ok) {
        await statsResponse.json();
        setStats({
          totalDevices: 1247,
          activeQueries: 23,
          dataSources: 8,
          alerts: 2,
          uptime: '99.9%',
          lastSync: new Date().toLocaleString('zh-CN'),
        });
      }

      // 获取数据源列表
      setDataSources([
        {
          id: '1',
          name: '设备管理系统',
          type: 'PostgreSQL',
          status: 'connected',
          lastUpdate: '2026-02-28 14:30:00',
          records: 15420,
        },
        {
          id: '2',
          name: '供应链系统',
          type: 'MySQL',
          status: 'connected',
          lastUpdate: '2026-02-28 14:25:00',
          records: 8734,
        },
        {
          id: '3',
          name: '维修记录系统',
          type: 'MongoDB',
          status: 'warning',
          lastUpdate: '2026-02-28 13:45:00',
          records: 5621,
        },
        {
          id: '4',
          name: '报价系统',
          type: 'Redis',
          status: 'connected',
          lastUpdate: '2026-02-28 14:35:00',
          records: 2340,
        },
      ]);

      // 获取告警信息
      setAlerts([
        {
          id: '1',
          severity: 'warning',
          message: '维修记录系统同步延迟超过阈值',
          timestamp: '2026-02-28 14:20:00',
          source: '数据同步服务',
        },
        {
          id: '2',
          severity: 'info',
          message: '新的数据源已成功连接',
          timestamp: '2026-02-28 13:55:00',
          source: '数据接入服务',
        },
      ]);

      setLoading(false);
    } catch (error) {
      console.error('加载仪表板数据失败', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 管理员专属快捷入口
  const adminQuickLinks = [
    {
      name: '管理后台',
      icon: Settings,
      href: '/admin/dashboard',
      permission: 'dashboard_read',
    },
    {
      name: '用户管理',
      icon: User,
      href: '/admin/users',
      permission: 'users_read',
    },
    {
      name: '系统监控',
      icon: Activity,
      href: '/admin/monitoring',
      permission: 'monitoring_read',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-4 sm:p-6">
          {/* 统计卡片 - 响应式网*/}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">设备总数</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalDevices.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">较昨日增12%</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">活跃查询</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeQueries}</div>
                <p className="text-xs text-muted-foreground">
                  平均响应时间 245ms
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">数据源</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.dataSources}</div>
                <p className="text-xs text-muted-foreground">8个已连接</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  系统可用                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.uptime}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  最后同{stats.lastSync}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* 数据源状- 移动端优*/}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <Database className="mr-2 h-5 w-5" />
                  数据源状                </CardTitle>
                <CardDescription className="text-sm">
                  当前连接的数据源及其状                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {dataSources.map(source => (
                    <div
                      key={source.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className={`w-3 h-3 rounded-full flex-shrink-0 ${getStatusColor(source.status)}`}
                        ></div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {source.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {source.type}
                          </div>
                        </div>
                      </div>
                      <div className="text-right sm:text-left min-w-0">
                        <div className="text-sm font-medium">
                          {source.records.toLocaleString()} 条记                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          更新{source.lastUpdate}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 系统告警 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  系统告警
                  {alerts.length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {alerts.length}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>需要关注的系统事件</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.map(alert => (
                    <div key={alert.id} className="p-3 rounded-lg border">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity === 'critical'
                              ? '严重'
                              : alert.severity === 'warning'
                                ? '警告'
                                : '信息'}
                          </Badge>
                          <p className="mt-2 text-sm leading-relaxed">
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {alert.source}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap sm:whitespace-normal text-right sm:text-left">
                          {alert.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 快捷操作 - 移动端优*/}
          <Card className="mt-4 sm:mt-6 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-base sm:text-lg">
                <Settings className="mr-2 h-5 w-5" />
                快捷操作
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <Button
                  onClick={() => router.push('/data-center/query')}
                  className="py-2 px-3 text-sm sm:py-4 sm:px-4 sm:text-base h-auto"
                >
                  <Search className="mr-2 h-4 w-4" />
                  <span className="truncate">新建查询</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={loadDashboardData}
                  className="py-2 px-3 text-sm sm:py-4 sm:px-4 sm:text-base h-auto"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  <span className="truncate">刷新数据</span>
                </Button>
                <Button
                  variant="outline"
                  className="py-2 px-3 text-sm sm:py-4 sm:px-4 sm:text-base h-auto"
                >
                  <Download className="mr-2 h-4 w-4" />
                  <span className="truncate">导出报告</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/data-center/monitoring')}
                  className="py-2 px-3 text-sm sm:py-4 sm:px-4 sm:text-base h-auto"
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  <span className="truncate">查看监控</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 管理员快捷入- 仅对有权限的用户显示 */}
          {hasPermission('dashboard_read') && (
            <Card className="mt-4 sm:mt-6 shadow-sm border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center text-base sm:text-lg text-blue-700">
                  <Shield className="mr-2 h-5 w-5" />
                  管理员专                </CardTitle>
                <CardDescription>管理后台快速访问入口</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  {adminQuickLinks
                    .filter(link => hasPermission(link.permission))
                    .map(link => (
                      <Button
                        key={link.href}
                        variant="outline"
                        onClick={() => router.push(link.href)}
                        className="py-2 px-3 text-sm sm:py-4 sm:px-4 sm:text-base h-auto border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <link.icon className="mr-2 h-4 w-4 text-blue-600" />
                        <span className="truncate">{link.name}</span>
                      </Button>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
  );
}

