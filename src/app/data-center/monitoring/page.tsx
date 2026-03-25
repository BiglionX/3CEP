'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle,
  Edit,
  Eye,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  severity: 'critical' | 'warning' | 'info';
  enabled: boolean;
  lastTriggered: string;
  triggerCount: number;
}

interface ActiveAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  triggeredAt: string;
  resolvedAt: string;
  status: 'active' | 'resolved' | 'acknowledged';
  source: string;
}

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'normal' | 'warning' | 'critical';
}

export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [alerts, setAlerts] = useState<ActiveAlert[]>([]);
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadMonitoringData();
  }, []);

  const loadMonitoringData = async () => {
    // 模拟加载监控数据
    const mockAlerts: ActiveAlert[] = [
      {
        id: '1',
        ruleId: 'cpu_high',
        ruleName: 'CPU 使用率过高',
        severity: 'critical',
        message: 'CPU 使用率达 95%，超过阈值 90%',
        triggeredAt: '2026-02-28 14:35:00',
        resolvedAt: '', // active 状态的告警没有解决时间
        status: 'active',
        source: '系统监控',
      },
      {
        id: '2',
        ruleId: 'memory_low',
        ruleName: '内存不足警告',
        severity: 'warning',
        message: '可用内存降至 512MB，低于阈值 1GB',
        triggeredAt: '2026-02-28 14:20:00',
        resolvedAt: '', // acknowledged 状态的告警也没有解决时间
        status: 'acknowledged',
        source: '系统监控',
      },
      {
        id: '3',
        ruleId: 'disk_space',
        ruleName: '磁盘空间预警',
        severity: 'info',
        message: '磁盘使用率已达 85%',
        triggeredAt: '2026-02-28 13:45:00',
        resolvedAt: '2026-02-28 14:00:00',
        status: 'resolved',
        source: '存储监控',
      },
    ];

    const mockRules: AlertRule[] = [
      {
        id: 'cpu_high',
        name: 'CPU 使用率监控',
        metric: 'cpu_usage',
        condition: '>',
        threshold: 90,
        severity: 'critical',
        enabled: true,
        lastTriggered: '2026-02-28 14:35:00',
        triggerCount: 12,
      },
      {
        id: 'memory_low',
        name: '内存使用监控',
        metric: 'memory_available',
        condition: '<',
        threshold: 1024,
        severity: 'warning',
        enabled: true,
        lastTriggered: '2026-02-28 14:20:00',
        triggerCount: 8,
      },
      {
        id: 'disk_space',
        name: '磁盘空间监控',
        metric: 'disk_usage_percent',
        condition: '>',
        threshold: 85,
        severity: 'info',
        enabled: true,
        lastTriggered: '2026-02-28 13:45:00',
        triggerCount: 3,
      },
    ];

    const mockMetrics: SystemMetric[] = [
      {
        name: 'CPU 使用率',
        value: 78.5,
        unit: '%',
        trend: 'up',
        status: 'warning',
      },
      {
        name: '内存使用率',
        value: 65.2,
        unit: '%',
        trend: 'stable',
        status: 'normal',
      },
      {
        name: '磁盘使用率',
        value: 82.1,
        unit: '%',
        trend: 'up',
        status: 'warning',
      },
      {
        name: '网络流量',
        value: 125.6,
        unit: 'Mbps',
        trend: 'up',
        status: 'normal',
      },
      {
        name: '数据库连接数',
        value: 45,
        unit: '个',
        trend: 'stable',
        status: 'normal',
      },
      {
        name: 'API 响应时间',
        value: 145,
        unit: 'ms',
        trend: 'down',
        status: 'normal',
      },
    ];

    setAlerts(mockAlerts);
    setRules(mockRules);
    setMetrics(mockMetrics);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'acknowledged':
        return <Bell className="h-4 w-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'stable':
        return <Activity className="h-4 w-4 text-blue-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch =
      alert.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity =
      severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus =
      statusFilter === 'all' || alert.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">监控告警</h1>
        <p className="text-gray-600 mt-1">系统健康状态监控和告警管理</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">系统概览</TabsTrigger>
          <TabsTrigger value="alerts">告警管理</TabsTrigger>
          <TabsTrigger value="rules">告警规则</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* 系统指标卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {metric.name}
                  </CardTitle>
                  {getTrendIcon(metric.trend)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.value}
                    {metric.unit}
                  </div>
                  <div className="flex items-center mt-2">
                    <Badge
                      variant={
                        metric.status === 'normal' ? 'default' : 'destructive'
                      }
                      className="text-xs"
                    >
                      {metric.status === 'normal'
                        ? '正常'
                        : metric.status === 'warning'
                          ? '警告'
                          : '严重'}
                    </Badge>
                    <span className="text-xs text-gray-500 ml-2">
                      {metric.trend === 'up'
                        ? '上升'
                        : metric.trend === 'down'
                          ? '下降'
                          : '稳定'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 告警统计 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                当前告警统计
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {
                      alerts.filter(
                        a => a.severity === 'critical' && a.status === 'active'
                      ).length
                    }
                  </div>
                  <div className="text-sm text-red-700">严重告警</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {
                      alerts.filter(
                        a => a.severity === 'warning' && a.status === 'active'
                      ).length
                    }
                  </div>
                  <div className="text-sm text-yellow-700">警告</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {
                      alerts.filter(
                        a => a.severity === 'info' && a.status === 'active'
                      ).length
                    }
                  </div>
                  <div className="text-sm text-blue-700">信息</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {alerts.filter(a => a.status === 'resolved').length}
                  </div>
                  <div className="text-sm text-green-700">已解决</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {/* 筛选和搜索 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="搜索告警名称或消.."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select
                  value={severityFilter}
                  onValueChange={setSeverityFilter}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="严重程度" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="critical">严重</SelectItem>
                    <SelectItem value="warning">警告</SelectItem>
                    <SelectItem value="info">信息</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="active">活跃</SelectItem>
                    <SelectItem value="acknowledged">已确认</SelectItem>
                    <SelectItem value="resolved">已解决</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 告警列表 */}
          <div className="space-y-4">
            {filteredAlerts.map(alert => (
              <Card key={alert.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(alert.status)}
                        <h3 className="text-lg font-medium">
                          {alert.ruleName}
                        </h3>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity === 'critical'
                            ? '严重'
                            : alert.severity === 'warning'
                              ? '警告'
                              : '信息'}
                        </Badge>
                        <Badge
                          variant={
                            alert.status === 'active'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {alert.status === 'active'
                            ? '活跃'
                            : alert.status === 'acknowledged'
                              ? '已确认'
                              : '已解决'}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{alert.message}</p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>来源: {alert.source}</span>
                        <span>触发时间: {alert.triggeredAt}</span>
                        {alert.resolvedAt && (
                          <span>解决时间: {alert.resolvedAt}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        查看详情
                      </Button>
                      {alert.status === 'active' && (
                        <Button size="sm">确认告警</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredAlerts.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    暂无匹配的告警{' '}
                  </h3>
                  <p className="text-gray-500">调整筛选条件或等待新告警产生</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">告警规则配置</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              添加规则
            </Button>
          </div>

          <div className="grid gap-4">
            {rules.map(rule => (
              <Card key={rule.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium">{rule.name}</h3>
                        <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                          {rule.enabled ? '启用' : '禁用'}
                        </Badge>
                        <Badge className={getSeverityColor(rule.severity)}>
                          {rule.severity === 'critical'
                            ? '严重'
                            : rule.severity === 'warning'
                              ? '警告'
                              : '信息'}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">
                        {rule.metric} {rule.condition} {rule.threshold}{' '}
                        时触发告警{' '}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>触发次数: {rule.triggerCount}</span>
                        {rule.lastTriggered && (
                          <span>上次触发: {rule.lastTriggered}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        编辑
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
