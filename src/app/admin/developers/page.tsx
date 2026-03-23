'use client';

import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import {
  CheckCircle,
  Clock,
  Mail,
  Package,
  Users,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Developer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  totalAgents: number;
  totalSkills: number;
  totalRevenue: number;
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  lastActive: string;
}

interface Filters {
  search: string;
  status: string;
  sortBy: string;
  sortOrder: string;
}

export default function DevelopersPage() {
  const { isAuthenticated, is_admin, isLoading } = useUnifiedAuth();
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: '',
    sortBy: 'joinDate',
    sortOrder: 'desc',
  });
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState({
    totalDevelopers: 0,
    activeDevelopers: 0,
    inactiveDevelopers: 0,
    suspendedDevelopers: 0,
  });

  // 保护管理员路由
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !is_admin) {
      window.location.href = `/login?redirect=${encodeURIComponent('/admin/developers')}`;
    }
  }, [isAuthenticated, is_admin, isLoading]);

  // 加载统计数据
  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/developers/statistics');

      // 处理 401/403 错误
      if (response.status === 401 || response.status === 403) {
        console.warn('权限不足，请重新登录');
        return;
      }

      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      } else {
        console.error('加载统计数据失败:', result.error);
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  // 加载开发者列表
  const loadDevelopers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', pagination.page.toString());
      params.set('pageSize', pagination.pageSize.toString());
      if (filters.search) params.set('search', filters.search);
      if (filters.status) params.set('status', filters.status);
      params.set('sortBy', filters.sortBy);
      params.set('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/admin/developers/list?${params}`);
      const result = await response.json();

      if (result.success) {
        setDevelopers(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('加载开发者列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 认证通过后加载数据
  useEffect(() => {
    if (!isLoading && isAuthenticated && is_admin) {
      // 等待一小段时间确保 cookie 已设置
      const timer = setTimeout(() => {
        loadStats();
        loadDevelopers();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, is_admin, pagination.page]);

  // 筛选条件变化时重新加载
  useEffect(() => {
    if (!isLoading && isAuthenticated && is_admin) {
      setPagination(prev => ({ ...prev, page: 1 }));
      loadDevelopers();
    }
  }, [filters]);

  // 认证加载中
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 未认证或不是管理员
  if (!isAuthenticated || !is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-yellow-500 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">访问受限</h2>
          <p className="text-gray-600 mb-4">请先登录管理员账户</p>
          <button
            onClick={() =>
              (window.location.href = `/login?redirect=${encodeURIComponent('/admin/developers')}`)
            }
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            前往登录
          </button>
        </div>
      </div>
    );
  }

  // 处理状态切换
  const handleToggleStatus = async (
    developerId: string,
    currentStatus: string
  ) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      const response = await fetch('/api/admin/developers/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          developerId,
          status: newStatus,
        }),
      });

      const result = await response.json();
      if (result.success) {
        loadDevelopers();
        loadStats();
        alert('状态更新成功');
      } else {
        alert(`操作失败：${result.error}`);
      }
    } catch (error) {
      console.error('更新状态失败:', error);
      alert('操作失败，请重试');
    }
  };

  // 获取状态标签颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 mr-1" />;
      case 'inactive':
        return <Clock className="w-4 h-4 mr-1" />;
      case 'suspended':
        return <XCircle className="w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">开发者管理</h1>
        <div className="flex gap-2">
          <button
            onClick={loadDevelopers}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            刷新
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* 总开发者数 */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    总开发者数
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.totalDevelopers}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* 活跃开发者 */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    活跃开发者
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.activeDevelopers}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* 不活跃开发者 */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gray-500 rounded-md p-3">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    不活跃开发者
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.inactiveDevelopers}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* 已停用开发者 */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    已停用开发者
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.suspendedDevelopers}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                搜索
              </label>
              <input
                type="text"
                id="search"
                value={filters.search}
                onChange={e =>
                  setFilters(prev => ({ ...prev, search: e.target.value }))
                }
                placeholder="搜索开发者姓名或邮箱"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* 状态筛选 */}
            <div className="sm:w-48">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                状态
              </label>
              <select
                id="status"
                value={filters.status}
                onChange={e =>
                  setFilters(prev => ({ ...prev, status: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">全部</option>
                <option value="active">活跃</option>
                <option value="inactive">不活跃</option>
                <option value="suspended">已停用</option>
              </select>
            </div>

            {/* 排序方式 */}
            <div className="sm:w-48">
              <label
                htmlFor="sortBy"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                排序
              </label>
              <select
                id="sortBy"
                value={filters.sortBy}
                onChange={e =>
                  setFilters(prev => ({ ...prev, sortBy: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="joinDate">入驻时间</option>
                <option value="revenue">收入</option>
                <option value="products">产品数</option>
                <option value="lastActive">最后活跃</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 开发者列表表格 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  开发者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  产品
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  总收入
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  入驻时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最后活跃
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {developers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p>暂无开发者数据</p>
                  </td>
                </tr>
              ) : (
                developers.map(developer => (
                  <tr key={developer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {developer.avatar ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={developer.avatar}
                              alt={developer.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                              {developer.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {developer.name}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="w-4 h-4 mr-1" />
                            {developer.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Package className="w-4 h-4 mr-2 text-gray-400" />
                        {developer.totalAgents} 个智能体
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Package className="w-4 h-4 mr-2 text-gray-400" />
                        {developer.totalSkills} 个 Skill
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        ¥{developer.totalRevenue.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(developer.status)}`}
                      >
                        {getStatusIcon(developer.status)}
                        {developer.status === 'active' && '活跃'}
                        {developer.status === 'inactive' && '不活跃'}
                        {developer.status === 'suspended' && '已停用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(developer.joinDate).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(developer.lastActive).toLocaleDateString(
                        'zh-CN'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() =>
                          handleToggleStatus(developer.id, developer.status)
                        }
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        {developer.status === 'active' ? '停用' : '激活'}
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        详情
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 分页 */}
      <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            第 <span className="font-medium">{pagination.page}</span> 页，共{' '}
            <span className="font-medium">{pagination.totalPages}</span>{' '}
            页，总计 <span className="font-medium">{pagination.total}</span>{' '}
            条记录
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              上一页
            </button>
            <button
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
