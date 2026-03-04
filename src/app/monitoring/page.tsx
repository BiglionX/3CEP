'use client';

import React from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  FileText,
  Settings,
  Database,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const MonitoringModuleCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  status: 'active' | 'maintenance' | 'coming-soon';
}> = ({ title, description, icon, href, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'maintenance':
        return 'text-yellow-600';
      case 'coming-soon':
        return 'text-gray-400';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'active':
        return '运行?;
      case 'maintenance':
        return '维护?;
      case 'coming-soon':
        return '即将上线';
      default:
        return '未知';
    }
  };

  return (
    <Link href={href}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div
              className={`p-3 rounded-full ${getStatusColor().replace('text', 'bg')} bg-opacity-20`}
            >
              {icon}
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full ${getStatusColor().replace('text', 'bg')} bg-opacity-20`}
            >
              {getStatusText()}
            </span>
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{description}</p>
          <Button variant="outline" className="w-full">
            进入系统
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
};

export default function MonitoringHomePage() {
  const modules = [
    {
      title: '性能监控面板',
      description:
        '实时监控系统性能指标，包括API响应时间、系统可用率、资源使用情况等核心指标?,
      icon: <Activity className="w-6 h-6" />,
      href: '/monitoring/performance',
      status: 'active' as const,
    },
    {
      title: '告警管理中心',
      description:
        '统一管理各类告警规则和通知配置，支持多级告警和自定义通知渠道?,
      icon: <AlertTriangle className="w-6 h-6" />,
      href: '/monitoring/alerts',
      status: 'active' as const,
    },
    {
      title: '日志分析系统',
      description: '集中收集、存储和分析系统日志，提供强大的搜索和分析功能?,
      icon: <FileText className="w-6 h-6" />,
      href: '/monitoring/logs',
      status: 'maintenance' as const,
    },
    {
      title: '业务数据分析',
      description: '深入分析业务指标，提供数据洞察和商业智能报告?,
      icon: <BarChart3 className="w-6 h-6" />,
      href: '/monitoring/analytics',
      status: 'active' as const,
    },
    {
      title: '安全监控中心',
      description: '全面监控系统安全状况，检测威胁和异常行为?,
      icon: <Shield className="w-6 h-6" />,
      href: '/monitoring/security',
      status: 'coming-soon' as const,
    },
    {
      title: '系统配置管理',
      description: '管理监控系统的各项配置参数和规则设置?,
      icon: <Settings className="w-6 h-6" />,
      href: '/monitoring/settings',
      status: 'coming-soon' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* 头部区域 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="w-8 h-8 mr-3 text-blue-600" />
              监控中心
            </h1>
            <p className="mt-2 text-gray-600">
              统一监控和管理系统各项指标，保障系统稳定运行
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">系统运行正常</span>
            </div>
          </div>
        </div>

        {/* 快速统?*/}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-2 mr-3">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">系统状?/p>
                <p className="text-lg font-semibold text-green-600">正常</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-2 mr-3">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">活跃告警</p>
                <p className="text-lg font-semibold text-blue-600">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-2 mr-3">
                <Database className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">数据节点</p>
                <p className="text-lg font-semibold text-purple-600">12</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center">
              <div className="rounded-full bg-orange-100 p-2 mr-3">
                <BarChart3 className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">监控指标</p>
                <p className="text-lg font-semibold text-orange-600">156</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 模块列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module, index) => (
          <MonitoringModuleCard key={index} {...module} />
        ))}
      </div>

      {/* 通知区域 */}
      <div className="mt-8 bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">系统通知</h2>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="mt-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">系统更新提醒</p>
              <p className="text-sm text-blue-700">
                监控系统将于今晚23:00进行例行维护，预计持?0分钟?              </p>
              <p className="text-xs text-blue-500 mt-1">2小时?/p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-green-900">性能优化完成</p>
              <p className="text-sm text-green-700">
                API响应时间优化已完成，平均响应时间提升25%�?              </p>
              <p className="text-xs text-green-500 mt-1">1天前</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

