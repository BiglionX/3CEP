'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Server,
  Database,
  Wifi,
  HardDrive,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

interface SystemHealthCardProps {
  title: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  metrics: Array<{
    name: string;
    value: string | number;
    unit?: string;
    status: 'normal' | 'warning' | 'critical';
  }>;
  lastUpdated: string;
  onRefresh?: () => void;
  className?: string;
}

export function SystemHealthCard({
  title,
  status,
  metrics,
  lastUpdated,
  onRefresh,
  className = '',
}: SystemHealthCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'healthy':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
        };
      case 'error':
        return {
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      default:
        return {
          icon: <Activity className="w-5 h-5 text-gray-500" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const { icon, color, bgColor, borderColor } = getStatusConfig();

  return (
    <Card className={`${bgColor} border ${borderColor} ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            {icon}
            <span className="ml-2">{title}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge
              className={`${color
                .replace('text-', 'bg-')
                .replace('-600', '-100')} ${color}`}
            >
              {status === 'healthy'
                ? '正常'
                : status === 'warning'
                  ? '警告'
                  : status === 'error'
                    ? '错误'
                    : '未知'}
            </Badge>
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500">
          最后更? {new Date(lastUpdated).toLocaleString()}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white p-3 rounded-lg border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{metric.name}</span>
                <Badge
                  variant={
                    metric.status === 'normal'
                      ? 'default'
                      : metric.status === 'warning'
                        ? 'secondary'
                        : 'destructive'
                  }
                  className="text-xs"
                >
                  {metric.status === 'normal'
                    ? '正常'
                    : metric.status === 'warning'
                      ? '警告'
                      : '严重'}
                </Badge>
              </div>
              <div className="mt-1">
                <span className="text-lg font-semibold">{metric.value}</span>
                {metric.unit && (
                  <span className="text-sm text-gray-500 ml-1">
                    {metric.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface BusinessKpiCardProps {
  title: string;
  kpis: Array<{
    name: string;
    current: number;
    target: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
  }>;
  period: string;
  className?: string;
}

export function BusinessKpiCard({
  title,
  kpis,
  period,
  className = '',
}: BusinessKpiCardProps) {
  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Badge variant="outline">{period}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {kpis.map((kpi, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {kpi.name}
                </span>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-sm font-semibold ${getTrendColor(kpi.trend)}`}
                  >
                    {kpi.current.toLocaleString()}
                    {kpi.unit}
                  </span>
                  <span className="text-xs text-gray-500">
                    / {kpi.target.toLocaleString()}
                    {kpi.unit}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    calculateProgress(kpi.current, kpi.target) >= 100
                      ? 'bg-green-500'
                      : calculateProgress(kpi.current, kpi.target) >= 80
                        ? 'bg-blue-500'
                        : 'bg-yellow-500'
                  }`}
                  style={{
                    width: `${calculateProgress(kpi.current, kpi.target)}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0{kpi.unit}</span>
                <span>
                  {kpi.target.toLocaleString()}
                  {kpi.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
