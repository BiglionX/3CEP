'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  status?: 'success' | 'warning' | 'error' | 'info';
  icon?: React.ReactNode;
  description?: string;
  className?: string;
}

export function KpiCard({
  title,
  value,
  unit = '',
  trend,
  trendValue,
  status = 'info',
  icon,
  description,
  className = '',
}: KpiCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const getStatusBg = () => {
    switch (status) {
      case 'success':
        return 'bg-green-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'error':
        return 'bg-red-50';
      default:
        return 'bg-blue-50';
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;

    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className={`${getStatusBg()} border-0 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
          <span>{title}</span>
          {icon && <span className={getStatusColor()}>{icon}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className={`text-2xl font-bold ${getStatusColor()}`}>
              {value}
              {unit && <span className="text-sm font-normal ml-1">{unit}</span>}
            </div>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          {(trend || trendValue) && (
            <div className="flex items-center space-x-1">
              {getTrendIcon()}
              {trendValue !== undefined && (
                <span
                  className={`text-sm font-medium ${
                    trendValue > 0
                      ? 'text-green-600'
                      : trendValue < 0
                        ? 'text-red-600'
                        : 'text-gray-500'
                  }`}
                >
                  {trendValue > 0 ? '+' : ''}
                  {trendValue}%
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface AlertsListProps {
  alerts: Array<{
    id: string;
    type: 'system' | 'business' | 'performance' | 'security';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    timestamp: string;
    unread?: boolean;
  }>;
  onAlertClick?: (alertId: string) => void;
  className?: string;
}

export function AlertsList({
  alerts,
  onAlertClick,
  className = '',
}: AlertsListProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'system':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'business':
        return <TrendingDown className="w-5 h-5 text-orange-500" />;
      case 'performance':
        return <TrendingUp className="w-5 h-5 text-yellow-500" />;
      case 'security':
        return <AlertCircle className="w-5 h-5 text-purple-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return '刚刚';
    if (diffMinutes < 60) return `${diffMinutes}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    return `${diffDays}天前`;
  };

  if (alerts.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-2" />
          <p className="text-gray-500">暂无告警信息</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
          系统告警
          <Badge className="ml-2" variant="destructive">
            {alerts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                alert.unread ? 'bg-blue-50 border-blue-200' : 'bg-white'
              } ${getSeverityColor(alert.severity)}`}
              onClick={() => onAlertClick?.(alert.id)}
            >
              <div className="flex items-start space-x-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">
                      {alert.title}
                    </h4>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {formatTime(alert.timestamp)}
                    </span>
                    {alert.unread && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
