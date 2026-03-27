'use client';

import { useEffect, useState } from 'react';

interface SystemHealth {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  database: {
    status: string;
    stats: {
      totalSkills: number;
      totalUsers: number;
    };
  };
  performance: {
    slowQueries: any[];
    unusedIndexes: any[];
    tableSizes: any[];
  };
}

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  priority: string;
  enabled: boolean;
  notification_channels?: string[]; // 通知渠道列表（可选）
}

/**
 * 系统监控仪表板页面
 */
export default function MonitoringPage() {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [refreshInterval, setRefreshInterval] = useState(30); // 秒

  // 加载监控数据
  useEffect(() => {
    loadMonitoringData();

    // 定时刷新
    const interval = setInterval(() => {
      loadMonitoringData();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const loadMonitoringData = async () => {
    try {
      setLoading(true);

      // 获取系统健康状态
      const healthRes = await fetch('/api/admin/monitoring/system-health');
      const healthData = await healthRes.json();
      if (healthData.success) {
        setHealth(healthData.data);
      }

      // 获取告警规则
      const rulesRes = await fetch('/api/admin/monitoring/alert-rules');
      const rulesData = await rulesRes.json();
      if (rulesData.success) {
        setAlertRules(rulesData.data || []);
      }
    } catch (error) {
      console.error('加载监控数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取状态标签颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'unhealthy':
        return 'bg-red-100 text-red-800';
      case 'connected':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取优先级标签颜色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // 获取条件标签
  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      gt: '>',
      lt: '<',
      eq: '=',
      gte: '≥',
      lte: '≤',
    };
    return labels[condition] || condition;
  };

  // 获取指标名称
  const getMetricLabel = (metric: string) => {
    const labels: Record<string, string> = {
      slow_queries_count: '慢查询数量',
      database_connection: '数据库连接',
      skills_table_size_mb: 'Skills 表大小 (MB)',
      unused_indexes_count: '未使用索引数量',
    };
    return labels[metric] || metric;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">系统监控</h1>
            <div className="flex items-center space-x-4">
              <select
                value={refreshInterval}
                onChange={e => setRefreshInterval(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10 秒</option>
                <option value={30}>30 秒</option>
                <option value={60}>1 分钟</option>
                <option value={300}>5 分钟</option>
              </select>
              <button
                onClick={loadMonitoringData}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                🔄 刷新
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && !health ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* 系统健康状态卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* 整体状态 */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">系统状态</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(health?.status || '')}`}
                  >
                    {health?.status === 'healthy' ? '✅ 健康' : '❌ 异常'}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="mb-2">
                    最后更新：
                    {health?.timestamp
                      ? new Date(health.timestamp).toLocaleString('zh-CN')
                      : '-'}
                  </div>
                  <div>
                    数据库：
                    <span
                      className={`font-medium ${getStatusColor(health?.database.status || '')}`}
                    >
                      {health?.database.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Skills 统计 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  Skills 统计
                </h2>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">总数</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {health?.database.stats.totalSkills || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">用户数</div>
                    <div className="text-2xl font-bold text-green-600">
                      {health?.database.stats.totalUsers || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* 性能指标 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="font-semibold text-gray-900 mb-4">性能指标</h2>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">慢查询</div>
                    <div
                      className={`text-xl font-bold ${
                        (health?.performance.slowQueries.length || 0) > 5
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {health?.performance.slowQueries.length || 0}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">未使用索引</div>
                    <div
                      className={`text-xl font-bold ${
                        (health?.performance.unusedIndexes.length || 0) > 10
                          ? 'text-orange-600'
                          : 'text-green-600'
                      }`}
                    >
                      {health?.performance.unusedIndexes.length || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 告警规则列表 */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="px-6 py-4 border-b">
                <h2 className="font-semibold text-gray-900">
                  告警规则 ({alertRules.length})
                </h2>
              </div>

              {alertRules.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  暂无告警规则
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {alertRules.map(rule => (
                    <div key={rule.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium text-gray-900">
                              {rule.name}
                            </h3>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(rule.priority)}`}
                            >
                              {rule.priority === 'critical'
                                ? '严重'
                                : rule.priority === 'high'
                                  ? '高'
                                  : rule.priority === 'medium'
                                    ? '中'
                                    : '低'}
                            </span>
                            {rule.enabled ? (
                              <span className="text-xs text-green-600">
                                ● 已启用
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">
                                ○ 已禁用
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            指标：
                            <span className="font-medium">
                              {getMetricLabel(rule.metric)}
                            </span>{' '}
                            条件：
                            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                              {getConditionLabel(rule.condition)}
                            </span>{' '}
                            阈值：
                            <span className="font-bold">{rule.threshold}</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          通知渠道：
                          {rule.notification_channels?.join(', ') || 'email'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 慢查询列表 */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="font-semibold text-gray-900">
                  慢查询 ({health?.performance.slowQueries.length || 0})
                </h2>
              </div>

              {!health?.performance.slowQueries.length ? (
                <div className="text-center py-12 text-gray-500">
                  ✅ 没有慢查询
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          持续时间
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          状态
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          查询
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {health?.performance.slowQueries.map(
                        (query: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {(query.duration / 1000).toFixed(2)}s
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {query.state}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600 font-mono text-xs truncate max-w-md">
                              {query.query}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
