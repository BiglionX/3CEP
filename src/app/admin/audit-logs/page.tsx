'use client';

import { useEffect, useState } from 'react';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  old_value?: any;
  new_value?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * 审计日志查看页面
 */
export default function AuditLogsPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    startDate: '',
    endDate: '',
  });

  // 加载审计日志
  useEffect(() => {
    loadAuditLogs();
  }, [pagination.page]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.userId && { user_id: filters.userId }),
        ...(filters.action && { action: filters.action }),
        ...(filters.startDate && { start_date: filters.startDate }),
        ...(filters.endDate && { end_date: filters.endDate }),
      });

      const response = await fetch(`/api/admin/audit-logs?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      setLogs(result.data.logs || []);
      setPagination(result.data.pagination || {});
    } catch (error) {
      console.error('加载失败:', error);
      alert('加载审计日志失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理筛选
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // 应用筛选
  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    loadAuditLogs();
  };

  // 重置筛选
  const resetFilters = () => {
    setFilters({
      userId: '',
      action: '',
      startDate: '',
      endDate: '',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    setTimeout(loadAuditLogs, 0);
  };

  // 分页导航
  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page }));
  };

  // 格式化 JSON
  const formatJSON = (data: any) => {
    if (!data) return '-';
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  // 获取操作类型标签
  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      CREATE: '创建',
      UPDATE: '更新',
      DELETE: '删除',
      LOGIN: '登录',
      LOGOUT: '登出',
      APPROVE: '审核通过',
      REJECT: '拒绝',
      EXPORT: '导出',
      IMPORT: '导入',
    };
    return labels[action] || action;
  };

  // 获取资源类型标签
  const getResourceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      skill: '技能',
      user: '用户',
      role: '角色',
      permission: '权限',
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-gray-900">审计日志</h1>
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              🔄 重置筛选
            </button>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 筛选条件 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">筛选条件</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                用户 ID
              </label>
              <input
                type="text"
                value={filters.userId}
                onChange={e => handleFilterChange('userId', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入用户 ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                操作类型
              </label>
              <select
                value={filters.action}
                onChange={e => handleFilterChange('action', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部</option>
                <option value="CREATE">创建</option>
                <option value="UPDATE">更新</option>
                <option value="DELETE">删除</option>
                <option value="APPROVE">审核通过</option>
                <option value="REJECT">拒绝</option>
                <option value="EXPORT">导出</option>
                <option value="IMPORT">导入</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                开始日期
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={e => handleFilterChange('startDate', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                结束日期
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={e => handleFilterChange('endDate', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              🔍 应用筛选
            </button>
          </div>
        </div>

        {/* 审计日志表格 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold text-gray-900">
              审计日志 ({pagination.total} 条记录)
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              暂无审计日志记录
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        时间
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        用户
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        操作
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        资源
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        IP 地址
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        详情
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {logs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(log.created_at).toLocaleString('zh-CN')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div
                            className="truncate max-w-[200px]"
                            title={log.user_id}
                          >
                            {log.user_id.slice(0, 8)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {getActionLabel(log.action)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {log.resource_type ? (
                            <div>
                              <div className="font-medium">
                                {getResourceTypeLabel(log.resource_type)}
                              </div>
                              {log.resource_id && (
                                <div className="text-xs text-gray-500 truncate max-w-[150px]">
                                  {log.resource_id.slice(0, 8)}...
                                </div>
                              )}
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {log.ip_address || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <details className="cursor-pointer">
                            <summary className="text-blue-600 hover:text-blue-800">
                              查看详情
                            </summary>
                            <div className="mt-2 bg-gray-50 p-3 rounded text-xs font-mono whitespace-pre-wrap max-w-md">
                              <div className="mb-2">
                                <strong>变更前:</strong>
                                <pre>{formatJSON(log.old_value)}</pre>
                              </div>
                              <div>
                                <strong>变更后:</strong>
                                <pre>{formatJSON(log.new_value)}</pre>
                              </div>
                            </div>
                          </details>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  第 {pagination.page} 页，共 {pagination.totalPages} 页，总计{' '}
                  {pagination.total} 条记录
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    上一页
                  </button>
                  <button
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    下一页
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
