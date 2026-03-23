'use client';

import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import { useEffect, useState } from 'react';
import { AgentFilters } from './components/AgentFilters';
import { AgentTable } from './components/AgentTable';
import { ReviewDialog } from './components/ReviewDialog';
import { StatsCards } from './components/StatsCards';

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  review_status: 'pending' | 'approved' | 'rejected';
  shelf_status: 'on_shelf' | 'off_shelf' | 'suspended';
  developer_id: string;
  created_at: string;
  updated_at: string;
}

interface Filters {
  search: string;
  category: string;
  reviewStatus: string;
  shelfStatus: string;
  sortBy: string;
  sortOrder: string;
}

export default function AgentStorePage() {
  const { isAuthenticated, is_admin, isLoading } = useUnifiedAuth();
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    reviewStatus: '',
    shelfStatus: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [stats, setStats] = useState({
    totalAgents: 0,
    onShelfAgents: 0,
    approvedAgents: 0,
    pendingReview: 0,
  });

  // 保护管理员路由
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !is_admin) {
      window.location.href = `/login?redirect=${encodeURIComponent('/admin/agent-store')}`;
    }
  }, [isAuthenticated, is_admin, isLoading]);

  // 加载统计数据
  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/agent-store/statistics');
      const result = await response.json();
      if (result.success) {
        setStats(result.data.overview);
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  // 加载智能体列表
  const loadAgents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', pagination.page.toString());
      params.set('pageSize', pagination.pageSize.toString());
      if (filters.search) params.set('search', filters.search);
      if (filters.category) params.set('category', filters.category);
      if (filters.reviewStatus)
        params.set('reviewStatus', filters.reviewStatus);
      if (filters.shelfStatus) params.set('shelfStatus', filters.shelfStatus);
      params.set('sortBy', filters.sortBy);
      params.set('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/admin/agent-store/list?${params}`);
      const result = await response.json();

      if (result.success) {
        setAgents(result.data);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error('加载智能体列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 认证通过后加载数据
  useEffect(() => {
    if (!isLoading && isAuthenticated && is_admin) {
      loadStats();
      loadAgents();
    }
  }, [isLoading, isAuthenticated, is_admin, pagination.page]);

  // 筛选条件变化时重新加载
  useEffect(() => {
    if (!isLoading && isAuthenticated && is_admin) {
      setPagination(prev => ({ ...prev, page: 1 }));
      loadAgents();
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
              (window.location.href = `/login?redirect=${encodeURIComponent('/admin/agent-store')}`)
            }
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            前往登录
          </button>
        </div>
      </div>
    );
  }

  // 处理审核操作
  const handleApprove = (agent: Agent) => {
    setSelectedAgent(agent);
    setReviewDialogOpen(true);
  };

  // 处理上下架切换
  const handleToggleStatus = async (agentId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'on_shelf' ? 'off_shelf' : 'on_shelf';
      const response = await fetch('/api/admin/agent-store/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          shelfStatus: newStatus,
        }),
      });

      const result = await response.json();
      if (result.success) {
        // 重新加载列表
        loadAgents();
        loadStats();

        // 显示成功提示
        alert('状态更新成功');
      } else {
        alert(`操作失败：${result.error}`);
      }
    } catch (error) {
      console.error('更新状态失败:', error);
      alert('操作失败，请重试');
    }
  };

  // 处理审核提交
  const handleReviewSubmit = async (
    action: 'approve' | 'reject',
    reason: string
  ) => {
    if (!selectedAgent) return;

    try {
      const response = await fetch('/api/admin/agent-store/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          action,
          reason,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setReviewDialogOpen(false);
        setSelectedAgent(null);
        loadAgents();
        loadStats();
        alert('审核操作成功');
      } else {
        alert(`操作失败：${result.error}`);
      }
    } catch (error) {
      console.error('审核失败:', error);
      alert('操作失败，请重试');
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">智能体商店管理</h1>
        <div className="flex gap-2">
          <button
            onClick={loadAgents}
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
      <StatsCards stats={stats} />

      {/* 筛选器 */}
      <AgentFilters filters={filters} onChange={setFilters} />

      {/* 智能体列表 */}
      <AgentTable
        agents={agents}
        loading={loading}
        onApprove={handleApprove}
        onToggleStatus={handleToggleStatus}
      />

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

      {/* 审核对话框 */}
      {selectedAgent && (
        <ReviewDialog
          open={reviewDialogOpen}
          onClose={() => {
            setReviewDialogOpen(false);
            setSelectedAgent(null);
          }}
          onSubmit={handleReviewSubmit}
          agent={selectedAgent}
        />
      )}
    </div>
  );
}
