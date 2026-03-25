'use client';

import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Play,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Sandbox {
  id: string;
  user_id: string;
  skill_id: string;
  test_name: string;
  input_params: any;
  expected_output?: any;
  actual_output?: any;
  execution_time?: number;
  memory_usage?: number;
  status: 'pending' | 'running' | 'success' | 'failed' | 'timeout';
  error_message?: string;
  is_public: boolean;
  created_at: string;
}

export default function SkillSandboxManagementPage() {
  const { isAuthenticated, is_admin, isLoading } = useUnifiedAuth();
  const [sandboxes, setSandboxes] = useState<Sandbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedSandbox, setSelectedSandbox] = useState<Sandbox | null>(null);

  // 认证检查
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !is_admin)) {
      window.location.href = `/login?redirect=${encodeURIComponent('/admin/skill-sandboxes')}`;
    }
  }, [isAuthenticated, is_admin, isLoading]);

  // 加载测试沙箱
  useEffect(() => {
    if (isAuthenticated && is_admin) {
      loadSandboxes();
    }
  }, [isAuthenticated, is_admin, filterStatus]);

  const loadSandboxes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      const response = await fetch(`/api/admin/skill-sandboxes?${params}`);
      const result = await response.json();

      if (result.success) {
        setSandboxes(result.data || []);
      }
    } catch (error) {
      console.error('加载测试沙箱失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 运行测试
  const handleRunTest = async (sandboxId: string) => {
    try {
      // 更新状态为 running
      const response = await fetch(
        `/api/admin/skill-sandboxes/${sandboxId}/run`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'running',
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        alert('测试已开始运行');
        loadSandboxes();
      }
    } catch (error) {
      console.error('运行测试失败:', error);
      alert('操作失败，请重试');
    }
  };

  // 删除测试
  const handleDelete = async (sandboxId: string) => {
    if (!confirm('确定要删除这个测试吗？')) return;

    try {
      const response = await fetch(
        `/api/admin/skill-sandboxes?id=${sandboxId}`,
        {
          method: 'DELETE',
        }
      );

      const result = await response.json();
      if (result.success) {
        alert('测试已删除');
        loadSandboxes();
      } else {
        alert(`删除失败：${result.error}`);
      }
    } catch (error) {
      console.error('删除测试失败:', error);
      alert('操作失败，请重试');
    }
  };

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'running':
        return <Clock className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'timeout':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  // 统计信息
  const stats = {
    total: sandboxes.length,
    success: sandboxes.filter(s => s.status === 'success').length,
    failed: sandboxes.filter(s => s.status === 'failed').length,
    pending: sandboxes.filter(s => s.status === 'pending').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !is_admin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">测试沙箱管理</h1>
          <p className="mt-1 text-sm text-gray-500">
            管理和运行 Skills 测试用例
          </p>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="flex items-center space-x-4">
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="all">全部状态</option>
          <option value="pending">待运行</option>
          <option value="running">运行中</option>
          <option value="success">成功</option>
          <option value="failed">失败</option>
          <option value="timeout">超时</option>
        </select>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">总测试数</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">成功</div>
          <div className="text-2xl font-bold text-green-600">
            {stats.success}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">失败</div>
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">待运行</div>
          <div className="text-2xl font-bold text-blue-600">
            {stats.pending}
          </div>
        </div>
      </div>

      {/* 测试列表 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  测试名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Skill ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  执行时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  内存使用
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  公开
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    加载中...
                  </td>
                </tr>
              ) : sandboxes.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    暂无测试用例
                  </td>
                </tr>
              ) : (
                sandboxes.map(sandbox => (
                  <tr key={sandbox.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {sandbox.test_name || '未命名测试'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(sandbox.created_at).toLocaleDateString(
                            'zh-CN'
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {sandbox.skill_id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(sandbox.status)}
                        <span
                          className={`text-sm ${
                            sandbox.status === 'success'
                              ? 'text-green-600'
                              : sandbox.status === 'failed'
                                ? 'text-red-600'
                                : 'text-gray-600'
                          }`}
                        >
                          {sandbox.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {sandbox.execution_time
                        ? `${sandbox.execution_time.toFixed(2)} ms`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {sandbox.memory_usage
                        ? `${sandbox.memory_usage} KB`
                        : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          sandbox.is_public
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {sandbox.is_public ? '公开' : '私有'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedSandbox(sandbox)}
                          className="text-blue-600 hover:text-blue-800"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {sandbox.status === 'pending' && (
                          <button
                            onClick={() => handleRunTest(sandbox.id)}
                            className="text-green-600 hover:text-green-800"
                            title="运行测试"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(sandbox.id)}
                          className="text-red-600 hover:text-red-800"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 详情模态框 */}
      {selectedSandbox && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedSandbox.test_name || '测试详情'}
              </h3>
              <button onClick={() => setSelectedSandbox(null)}>
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">输入参数</div>
                <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto">
                  {JSON.stringify(selectedSandbox.input_params, null, 2)}
                </pre>
              </div>

              {selectedSandbox.expected_output && (
                <div>
                  <div className="text-sm text-gray-600">期望输出</div>
                  <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto">
                    {JSON.stringify(selectedSandbox.expected_output, null, 2)}
                  </pre>
                </div>
              )}

              {selectedSandbox.actual_output && (
                <div>
                  <div className="text-sm text-gray-600">实际输出</div>
                  <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto">
                    {JSON.stringify(selectedSandbox.actual_output, null, 2)}
                  </pre>
                </div>
              )}

              {selectedSandbox.error_message && (
                <div>
                  <div className="text-sm text-gray-600">错误信息</div>
                  <div className="mt-1 p-2 bg-red-50 text-red-800 rounded text-xs">
                    {selectedSandbox.error_message}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">执行时间</div>
                  <div className="text-lg font-semibold">
                    {selectedSandbox.execution_time
                      ? `${selectedSandbox.execution_time.toFixed(2)} ms`
                      : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">内存使用</div>
                  <div className="text-lg font-semibold">
                    {selectedSandbox.memory_usage
                      ? `${selectedSandbox.memory_usage} KB`
                      : '-'}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedSandbox(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
