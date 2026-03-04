'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Activity,
  UserPlus,
  ShieldAlert,
  BarChart3,
  TrendingUp,
  Calendar,
  Filter,
} from 'lucide-react';

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  bannedUsers: number;
  activeRate: number;
  newUsersRate: number;
  byRole: Record<string, number>;
  byStatus: Record<string, number>;
  growthTrend: Array<{ date: string; newUsers: number }>;
  activityDistribution: {
    daily: number;
    weekly: number;
    monthly: number;
    inactive: number;
  };
  period: string;
  lastUpdated: string;
}

interface UserStatsDashboardProps {
  className?: string;
}

export function UserStatsDashboard({
  className = '',
}: UserStatsDashboardProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/users/stats?period=${period}`);
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.error || '获取统计数据失败');
      }
    } catch (err) {
      setError('网络请求失败');
      console.error('加载统计失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = () => {
    loadStats();
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      admin: '超级管理?,
      content_reviewer: '内容审核?,
      shop_reviewer: '店铺审核?,
      finance: '财务人员',
      viewer: '查看?,
      unknown: '未设?,
    };
    return roleNames[role] || role;
  };

  const getStatusDisplayName = (status: string) => {
    const statusNames: Record<string, string> = {
      active: '正常',
      banned: '已封?,
      suspended: '已暂?,
      unknown: '未知',
    };
    return statusNames[status] || status;
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ShieldAlert className="w-5 h-5 text-red-500 mr-2" />
            <h3 className="text-red-800 font-medium">加载失败</h3>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
          <button
            onClick={refreshStats}
            className="mt-2 text-red-700 hover:text-red-900 text-sm font-medium"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无数据</h3>
          <p className="mt-1 text-sm text-gray-500">还没有用户统计数?/p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 头部控制区域 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">用户统计概览</h2>
          <p className="mt-1 text-sm text-gray-600">
            实时监控用户增长和活跃情?          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={period}
              onChange={e => setPeriod(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">最?�?/option>
              <option value="30d">最?0�?/option>
              <option value="90d">最?0�?/option>
            </select>
          </div>
          <button
            onClick={refreshStats}
            disabled={loading}
            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            刷新
          </button>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 总用户数 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
            <Users className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">系统累计注册用户</p>
          </CardContent>
        </Card>

        {/* 活跃用户 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
            <Activity className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.activeUsers.toLocaleString()}
            </div>
            <div className="flex items-center mt-1">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-xs text-green-600">
                {stats.activeRate}% 活跃?              </span>
            </div>
          </CardContent>
        </Card>

        {/* 新增用户 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">新增用户</CardTitle>
            <UserPlus className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.newUsers.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {period === '7d'
                ? '本周新增'
                : period === '30d'
                  ? '本月新增'
                  : '本季新增'}
            </p>
          </CardContent>
        </Card>

        {/* 封禁用户 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">封禁用户</CardTitle>
            <ShieldAlert className="w-5 h-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {stats.bannedUsers}
            </div>
            <p className="text-xs text-gray-500 mt-1">需要关注的风险用户</p>
          </CardContent>
        </Card>
      </div>

      {/* 角色分布和状态分?*/}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 角色分布 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              用户角色分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.byRole).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm font-medium">
                      {getRoleDisplayName(role)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-gray-900">
                      {count}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      (
                      {stats.totalUsers
                        ? Math.round((count / stats.totalUsers) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 状态分?*/}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              用户状态分?            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        status === 'active'
                          ? 'bg-green-500'
                          : status === 'banned'
                            ? 'bg-red-500'
                            : status === 'suspended'
                              ? 'bg-yellow-500'
                              : 'bg-gray-500'
                      } mr-2`}
                    ></div>
                    <span className="text-sm font-medium">
                      {getStatusDisplayName(status)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-gray-900">
                      {count}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      (
                      {stats.totalUsers
                        ? Math.round((count / stats.totalUsers) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 活跃度分?*/}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            用户活跃度分?          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">
                {stats.activityDistribution.daily}
              </div>
              <div className="text-sm text-green-600">每日活跃</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">
                {stats.activityDistribution.weekly}
              </div>
              <div className="text-sm text-blue-600">每周活跃</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">
                {stats.activityDistribution.monthly}
              </div>
              <div className="text-sm text-yellow-600">每月活跃</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">
                {stats.activityDistribution.inactive}
              </div>
              <div className="text-sm text-gray-600">不活?/div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 底部信息 */}
      <div className="text-center text-xs text-gray-500">
        数据更新时间: {new Date(stats.lastUpdated).toLocaleString('zh-CN')}
        {period === '30d' && <span className="ml-2">默认显示最?0天数?/span>}
      </div>
    </div>
  );
}
