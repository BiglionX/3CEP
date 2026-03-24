'use client';

/**
 * 预警指标可视化组件 (Task 6.3)
 * 当指标异常时自动高亮并显示告警
 */

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Bell,
  TrendingUp,
  TrendingDown,
  Activity,
  X,
  CheckCircle,
  Clock,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface AlertMetric {
  id: string;
  metricName: string;
  currentValue: number;
  threshold: number;
  severity: 'critical' | 'warning' | 'info';
  trend: 'up' | 'down' | 'stable';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  category: 'financial' | 'user' | 'operational' | 'business';
}

interface AlertDashboardProps {
  alerts?: AlertMetric[];
  onAcknowledge?: (alertId: string) => void;
}

export function AlertDashboard({ alerts: propAlerts, onAcknowledge }: AlertDashboardProps) {
  const [alerts, setAlerts] = useState<AlertMetric[]>([]);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  // 模拟告警数据
  useEffect(() => {
    if (propAlerts) {
      setAlerts(propAlerts);
    } else {
      // 生成模拟告警
      const mockAlerts: AlertMetric[] = [
        {
          id: 'alert-1',
          metricName: 'GMV 增长率',
          currentValue: 5.2,
          threshold: 10,
          severity: 'warning',
          trend: 'down',
          message: 'GMV 增长率低于预期阈值，建议关注市场动态',
          timestamp: new Date(Date.now() - 3600000),
          acknowledged: false,
          category: 'financial',
        },
        {
          id: 'alert-2',
          metricName: '系统响应时间',
          currentValue: 285,
          threshold: 200,
          severity: 'critical',
          trend: 'up',
          message: 'API 平均响应时间超过阈值，需立即优化性能',
          timestamp: new Date(Date.now() - 1800000),
          acknowledged: false,
          category: 'operational',
        },
        {
          id: 'alert-3',
          metricName: '用户留存率',
          currentValue: 78.5,
          threshold: 80,
          severity: 'warning',
          trend: 'down',
          message: '用户留存率略低于目标值，需加强用户运营',
          timestamp: new Date(Date.now() - 7200000),
          acknowledged: true,
          category: 'user',
        },
        {
          id: 'alert-4',
          metricName: '订单完成率',
          currentValue: 96.8,
          threshold: 95,
          severity: 'info',
          trend: 'up',
          message: '订单完成率表现优秀，超过目标值',
          timestamp: new Date(Date.now() - 9000000),
          acknowledged: true,
          category: 'business',
        },
      ];
      setAlerts(mockAlerts);
    }
  }, [propAlerts]);

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
    onAcknowledge?.(alertId);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-500';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-500';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) {
      return false;
    }
    return true;
  });

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.acknowledged).length;

  return (
    <div className="space-y-4">
      {/* 告警摘要卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">严重告警</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">待处理告警</p>
                <p className="text-2xl font-bold text-yellow-600">{unacknowledgedCount}</p>
              </div>
              <Bell className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总告警数</p>
                <p className="text-2xl font-bold text-blue-600">{alerts.length}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选器 */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filterSeverity === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterSeverity('all')}
        >
          全部 ({alerts.length})
        </Button>
        <Button
          variant={filterSeverity === 'critical' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterSeverity('critical')}
          className="gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          严重 ({criticalCount})
        </Button>
        <Button
          variant={filterSeverity === 'warning' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterSeverity('warning')}
          className="gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          警告 ({alerts.filter(a => a.severity === 'warning').length})
        </Button>
        <Button
          variant={filterSeverity === 'info' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilterSeverity('info')}
        >
          信息 ({alerts.filter(a => a.severity === 'info').length})
        </Button>
      </div>

      {/* 告警列表 */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => (
          <Card
            key={alert.id}
            className={`border-l-4 transition-all hover:shadow-md ${
              alert.severity === 'critical'
                ? 'border-red-500 bg-red-50'
                : alert.severity === 'warning'
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-blue-500 bg-blue-50'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity === 'critical'
                        ? '严重'
                        : alert.severity === 'warning'
                        ? '警告'
                        : '信息'}
                    </Badge>
                    <span className="font-semibold text-lg">{alert.metricName}</span>
                    {alert.acknowledged && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-600">当前值</p>
                      <p className="text-lg font-bold">
                        {alert.currentValue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">阈值</p>
                      <p className="text-lg font-medium">
                        {alert.threshold.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">趋势</p>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(alert.trend)}
                        <span
                          className={`font-medium ${
                            alert.trend === 'up'
                              ? 'text-green-600'
                              : alert.trend === 'down'
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {alert.trend === 'up' ? '上升' : alert.trend === 'down' ? '下降' : '平稳'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{alert.timestamp.toLocaleString()}</span>
                  </div>
                </div>

                {!alert.acknowledged && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAcknowledge(alert.id)}
                    className="flex-shrink-0"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    确认
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <p className="text-lg font-medium">暂无告警</p>
            <p className="text-sm">所有指标运行正常</p>
          </CardContent>
        </Card>
      )}

      {/* 查看全部按钮 */}
      {alerts.length > 3 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowAllAlerts(true)}
            className="gap-2"
          >
            <Bell className="w-4 h-4" />
            查看全部 {alerts.length} 条告警
          </Button>
        </div>
      )}

      {/* 全部告警对话框 */}
      <Dialog open={showAllAlerts} onOpenChange={setShowAllAlerts}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              全部告警列表
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {alerts.map((alert) => (
              <Card
                key={alert.id}
                className={`border-l-4 ${
                  alert.severity === 'critical'
                    ? 'border-red-500'
                    : alert.severity === 'warning'
                    ? 'border-yellow-500'
                    : 'border-blue-500'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity === 'critical'
                            ? '严重'
                            : alert.severity === 'warning'
                            ? '警告'
                            : '信息'}
                        </Badge>
                        <span className="font-semibold">{alert.metricName}</span>
                      </div>
                      <p className="text-sm text-gray-700">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {alert.timestamp.toLocaleString()}
                      </p>
                    </div>
                    {!alert.acknowledged && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAcknowledge(alert.id)}
                      >
                        确认
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
