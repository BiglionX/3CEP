'use client';

import { AlertCircle, CheckCircle, AlertTriangle, X } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KPI } from '@/lib/analytics-kpi-service';
import { useState } from 'react';

interface KPIAIertProps {
  kpi: KPI;
  severity: 'high' | 'medium' | 'low';
  message: string;
  onDismiss?: (kpiId: string) => void;
  onResolve?: (kpiId: string) => void;
}

function KPIAIertItem({
  kpi,
  severity,
  message,
  onDismiss,
  onResolve,
}: KPIAIertProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          badgeColor: 'bg-red-100 text-red-800',
          label: '严重',
        };
      case 'medium':
        return {
          icon: AlertTriangle,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          badgeColor: 'bg-amber-100 text-amber-800',
          label: '警告',
        };
      case 'low':
        return {
          icon: AlertTriangle,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          badgeColor: 'bg-blue-100 text-blue-800',
          label: '注意',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          badgeColor: 'bg-gray-100 text-gray-800',
          label: '信息',
        };
    }
  };

  const config = getSeverityConfig(severity);
  const Icon = config.icon;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.(kpi.id);
  };

  const handleResolve = () => {
    setIsDismissed(true);
    onResolve?.(kpi.id);
  };

  if (isDismissed) return null;

  return (
    <div
      className={`p-4 ${config.bgColor} border ${config.borderColor} rounded-lg mb-3 last:mb-0`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{kpi.name}</span>
              <Badge className={`${config.badgeColor} text-xs`}>
                {config.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-2">{message}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>
                当前: {kpi.value.toLocaleString()}
                {kpi.unit}
              </span>
              <span>
                目标: {kpi.target.toLocaleString()}
                {kpi.unit}
              </span>
              <span
                className={kpi.change >= 0 ? 'text-green-600' : 'text-red-600'}
              >
                {kpi.change >= 0 ? '+' : ''}
                {kpi.change.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {severity === 'high' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResolve}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              已解决
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface KPIAIertsPanelProps {
  alerts: { kpi: KPI; severity: 'high' | 'medium' | 'low'; message: string }[];
  onDismissAlert?: (kpiId: string) => void;
  onResolveAlert?: (kpiId: string) => void;
  onRefresh?: () => void;
  showEmptyState?: boolean;
  maxAlerts?: number;
}

export function KPIAIertsPanel({
  alerts,
  onDismissAlert,
  onResolveAlert,
  onRefresh,
  showEmptyState = true,
  maxAlerts = 5,
}: KPIAIertsPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const displayedAlerts = expanded ? alerts : alerts.slice(0, maxAlerts);
  const hasMoreAlerts = alerts.length > maxAlerts;

  if (alerts.length === 0 && showEmptyState) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            KPI告警
          </CardTitle>
          <CardDescription>当前没有需要关注的KPI告警</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-500">所有指标运行正常</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const highPriorityAlerts = alerts.filter(a => a.severity === 'high').length;
  const mediumPriorityAlerts = alerts.filter(
    a => a.severity === 'medium'
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              KPI告警
              {alerts.length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {alerts.length}个
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              需要关注的指标异常
              {highPriorityAlerts > 0 && (
                <span className="text-red-600 ml-2">
                  {highPriorityAlerts}个严重问题
                </span>
              )}
            </CardDescription>
          </div>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              刷新
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {displayedAlerts.map((alert, index) => (
            <KPIAIertItem
              key={`${alert.kpi.id}-${index}`}
              kpi={alert.kpi}
              severity={alert.severity}
              message={alert.message}
              onDismiss={onDismissAlert}
              onResolve={onResolveAlert}
            />
          ))}
        </div>

        {hasMoreAlerts && (
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="text-gray-600 hover:text-gray-900"
            >
              {expanded ? '收起' : `查看更多(${alerts.length - maxAlerts}个)`}
            </Button>
          </div>
        )}

        {alerts.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>告警统计</span>
              <div className="flex items-center gap-4">
                {highPriorityAlerts > 0 && (
                  <span className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    {highPriorityAlerts}个严重
                  </span>
                )}
                {mediumPriorityAlerts > 0 && (
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    {mediumPriorityAlerts}个警告
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
