'use client';

import { format } from 'date-fns';
import { useEffect, useState } from 'react';

interface AuditLog {
  id: string;
  user_id: string;
  action_type: string;
  resource_type: string;
  resource_id: string;
  changes: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  // 筛选状态
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    actionType: '',
    userId: '',
    resourceType: '',
  });

  useEffect(() => {
    fetchLogs();
  }, [pagination.page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.actionType && { actionType: filters.actionType }),
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.resourceType && { resourceType: filters.resourceType }),
      });

      const res = await fetch(`/api/admin/audit-logs?${params}`);
      const result = await res.json();

      if (result.success) {
        setLogs(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('获取审计日志失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilter = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchLogs();
  };

  const handleResetFilter = () => {
    setFilters({
      startDate: '',
      endDate: '',
      actionType: '',
      userId: '',
      resourceType: '',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    setTimeout(fetchLogs, 100);
  };

  const handleExportCSV = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('导出失败:', error);
    }
  };

  const getActionTypeColor = (actionType: string) => {
    const colors: Record<string, string> = {
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800',
      APPROVE: 'bg-purple-100 text-purple-800',
      REJECT: 'bg-orange-100 text-orange-800',
    };
    return colors[actionType] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-6">
      {/* 标题 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">审计日志查询</h1>
        <p className="text-gray-600">查看和导出系统操作记录</p>
      </div>

      {/* 筛选器 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">筛选条件</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* 日期范围 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              开始日期
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              结束日期
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 操作类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              操作类型
            </label>
            <select
              name="actionType"
              value={filters.actionType}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">全部</option>
              <option value="CREATE">创建</option>
              <option value="UPDATE">更新</option>
              <option value="DELETE">删除</option>
              <option value="APPROVE">批准</option>
              <option value="REJECT">拒绝</option>
            </select>
          </div>

          {/* 用户 ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              用户 ID
            </label>
            <input
              type="text"
              name="userId"
              value={filters.userId}
              onChange={handleFilterChange}
              placeholder="输入用户 ID"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 资源类型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              资源类型
            </label>
            <select
              name="resourceType"
              value={filters.resourceType}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">全部</option>
              <option value="agent">智能体</option>
              <option value="user">用户</option>
              <option value="order">订单</option>
              <option value="installation">安装</option>
              <option value="review">审核</option>
            </select>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex space-x-3">
          <button
            onClick={handleApplyFilter}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            应用筛选
          </button>
          <button
            onClick={handleResetFilter}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
          >
            重置
          </button>
          <button
            onClick={handleExportCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            导出 CSV
          </button>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">审计日志列表</h2>
          <p className="text-sm text-gray-600">
            共 {pagination.total} 条记录，第 {pagination.page}/
            {pagination.totalPages} 页
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">暂无数据</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      时间
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作类型
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      资源
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      用户 ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP 地址
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      详情
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {format(
                          new Date(log.created_at),
                          'yyyy-MM-dd HH:mm:ss'
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionTypeColor(
                            log.action_type
                          )}`}
                        >
                          {log.action_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        <div className="text-gray-900">{log.resource_type}</div>
                        <div className="text-gray-500 text-xs">
                          {log.resource_id}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {log.user_id || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {log.ip_address || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <details className="text-xs">
                          <summary className="cursor-pointer text-indigo-600 hover:text-indigo-800">
                            查看变更
                          </summary>
                          <pre className="mt-2 bg-gray-100 p-2 rounded text-gray-800 max-w-md overflow-auto">
                            {JSON.stringify(log.changes, null, 2)}
                          </pre>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() =>
                    setPagination(p => ({ ...p, page: p.page - 1 }))
                  }
                  disabled={pagination.page <= 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  上一页
                </button>
                <button
                  onClick={() =>
                    setPagination(p => ({ ...p, page: p.page + 1 }))
                  }
                  disabled={pagination.page >= pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    显示第 {(pagination.page - 1) * pagination.limit + 1} 到{' '}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{' '}
                    条，共 {pagination.total} 条
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() =>
                        setPagination(p => ({ ...p, page: p.page - 1 }))
                      }
                      disabled={pagination.page <= 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      上一页
                    </button>
                    {[...Array(Math.min(5, pagination.totalPages))].map(
                      (_, i) => {
                        const pageNum = Math.min(
                          pagination.page - 2 + i,
                          pagination.totalPages
                        );
                        return (
                          <button
                            key={pageNum}
                            onClick={() =>
                              setPagination(p => ({ ...p, page: pageNum }))
                            }
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pagination.page === pageNum
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}
                    <button
                      onClick={() =>
                        setPagination(p => ({ ...p, page: p.page + 1 }))
                      }
                      disabled={pagination.page >= pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      下一页
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
