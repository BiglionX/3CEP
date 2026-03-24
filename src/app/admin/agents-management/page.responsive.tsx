/**
 * 智能体管理响应式页面
 * 使用 AdminMobileLayout + DataTableMobile 重构
 */

'use client';

import {
  StatCardMobile,
  StatGridMobile,
} from '@/components/cards/StatCardMobile';
import { AdminMobileLayout } from '@/components/layouts/AdminMobileLayout';
import { Column, DataTableMobile } from '@/components/tables/DataTableMobile';
import { Badge } from '@/components/ui/badge';
import { useBatchOperation, useOperation } from '@/hooks/use-operation';
import {
  Analytics,
  CheckCircle,
  Edit,
  Error,
  Refresh,
  Search,
  Settings,
  TrendingUp,
  Visibility,
  Warning,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Agent {
  id: string;
  agent_id: string;
  agent_name: string;
  user_id: string;
  user_name: string;
  business_type: 'enterprise' | 'repair-shop' | 'foreign-trade';
  author_name: string;
  version: string;
  status: 'active' | 'expiring' | 'expired' | 'suspended';
  pricing_type: 'subscription' | 'one-time' | 'free';
  pricing_price: number;
  pricing_unit: '月' | '年' | '次';
  expiry_date: string;
  requests_this_month: number;
  tokens_used: number;
  avg_response_time: number;
  last_used: string;
  rating: number;
  review_count: number;
  usage_count: number;
}

export default function ResponsiveAgentsManagement() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expiring: 0,
    expired: 0,
    suspended: 0,
    totalRequests: 0,
    totalTokens: 0,
    avgResponseTime: 0,
  });

  // 加载数据操作
  const loadAgentsOp = useOperation({
    successMessage: undefined,
    errorMessage: '加载智能体数据失败',
    showToast: false,
  });

  // 删除操作
  const deleteAgentOp = useOperation({
    successMessage: '智能体删除成功',
    errorMessage: '删除失败',
    onSuccess: () => loadAgents(),
  });

  // 批量操作
  const batchDeleteOp = useBatchOperation({
    successMessage: '批量删除完成',
    continueOnError: true,
    onSuccess: () => loadAgents(),
  });

  const loadAgents = async () => {
    await loadAgentsOp.execute(async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/agents');
        const result = await response.json();
        if (result.success) {
          setAgents(result.data);
          calculateStats(result.data);
        }
      } catch (error) {
        console.error('加载智能体失败:', error);
      } finally {
        setLoading(false);
      }
    });
  };

  const calculateStats = (data: Agent[]) => {
    const totalRequests = data.reduce(
      (sum, a) => sum + a.requests_this_month,
      0
    );
    const totalTokens = data.reduce((sum, a) => sum + a.tokens_used, 0);
    const avgResponseTime =
      data.reduce((sum, a) => sum + a.avg_response_time, 0) / data.length;

    setStats({
      total: data.length,
      active: data.filter(a => a.status === 'active').length,
      expiring: data.filter(a => a.status === 'expiring').length,
      expired: data.filter(a => a.status === 'expired').length,
      suspended: data.filter(a => a.status === 'suspended').length,
      totalRequests,
      totalTokens,
      avgResponseTime,
    });
  };

  useEffect(() => {
    loadAgents();
  }, []);

  // 状态徽章
  const getStatusBadge = (status: Agent['status']) => {
    const badges = {
      active: (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          正常
        </Badge>
      ),
      expiring: (
        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
          <Warning className="w-3 h-3 mr-1" />
          即将到期
        </Badge>
      ),
      expired: (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          <Error className="w-3 h-3 mr-1" />
          已过期
        </Badge>
      ),
      suspended: (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          已暂停
        </Badge>
      ),
    };
    return badges[status];
  };

  // 表格列定义
  const columns: Column<Agent>[] = [
    {
      key: 'agent_name',
      label: '智能体名称',
      sortable: true,
      mobile: { show: true, priority: 1 },
    },
    {
      key: 'author_name',
      label: '作者',
      sortable: true,
      mobile: { show: true, priority: 2 },
    },
    {
      key: 'version',
      label: '版本',
      sortable: true,
      mobile: { show: true, priority: 3 },
    },
    {
      key: 'status',
      label: '状态',
      sortable: true,
      mobile: {
        show: true,
        priority: 1,
        render: (_, item) => getStatusBadge(item.status),
      },
    },
    {
      key: 'pricing_price',
      label: '价格',
      sortable: true,
      mobile: {
        show: true,
        priority: 2,
        render: (value: number, item) => `¥${value}/${item.pricing_unit}`,
      },
    },
    {
      key: 'requests_this_month',
      label: '本月请求',
      sortable: true,
      mobile: { show: true, priority: 2 },
    },
    {
      key: 'avg_response_time',
      label: '响应时间',
      sortable: true,
      mobile: {
        show: true,
        priority: 3,
        render: (value: number) => `${value}s`,
      },
    },
    {
      key: 'rating',
      label: '评分',
      sortable: true,
      mobile: {
        show: true,
        priority: 2,
        render: (value: number) => `⭐ ${value.toFixed(2)}`,
      },
    },
    {
      key: 'expiry_date',
      label: '到期日期',
      sortable: true,
      mobile: { show: false },
    },
    {
      key: 'user_name',
      label: '用户',
      sortable: true,
      mobile: { show: false },
    },
  ];

  // 行操作
  const rowActions = [
    {
      icon: Visibility,
      label: '查看',
      onClick: (agent: Agent) =>
        router.push(`/admin/agents-management/${agent.id}`),
      color: 'text-blue-600',
    },
    {
      icon: Edit,
      label: '编辑',
      onClick: (agent: Agent) =>
        router.push(`/admin/agents-management/${agent.id}/edit`),
      color: 'text-green-600',
    },
    {
      icon: Refresh,
      label: '续期',
      onClick: (agent: Agent) => handleRenew(agent),
      color: 'text-orange-600',
    },
    {
      icon: Settings,
      label: '配置',
      onClick: (agent: Agent) =>
        router.push(`/admin/agents-management/${agent.id}/config`),
      color: 'text-purple-600',
    },
    {
      icon: Error,
      label: '删除',
      onClick: (agent: Agent) =>
        deleteAgentOp.execute(() => deleteAgent(agent.id)),
      color: 'text-red-600',
    },
  ];

  const handleRenew = async (agent: Agent) => {
    if (!confirm(`确定要为智能体 "${agent.agent_name}" 续期吗？`)) return;
    try {
      const response = await fetch(`/api/admin/agents/${agent.id}/renew`, {
        method: 'POST',
      });
      if (response.ok) {
        alert('续期成功');
        loadAgents();
      }
    } catch (error) {
      console.error('续期失败:', error);
    }
  };

  const deleteAgent = async (id: string) => {
    const response = await fetch(`/api/admin/agents/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('删除失败');
  };

  const handleBatchDelete = async () => {
    if (!confirm('确定要删除选中的智能体吗？')) return;
    await batchDeleteOp.execute(
      agents.map(agent => async () => deleteAgent(agent.id))
    );
  };

  return (
    <AdminMobileLayout
      title="智能体管理"
      description="管理和监控所有智能体订阅"
      onRefresh={loadAgents}
      onAdd={() => router.push('/admin/agents-management/new')}
    >
      {/* 统计卡片 */}
      <StatGridMobile>
        <StatCardMobile
          icon={Analytics}
          iconColor="text-blue-600"
          title="总智能体数"
          value={stats.total.toString()}
          trend={{ value: 8.5, isPositive: true }}
        />
        <StatCardMobile
          icon={CheckCircle}
          iconColor="text-green-600"
          title="正常运营"
          value={stats.active.toString()}
          trend={{ value: 3.2, isPositive: true }}
        />
        <StatCardMobile
          icon={Warning}
          iconColor="text-orange-600"
          title="即将到期"
          value={stats.expiring.toString()}
          trend={{ value: 1.8, isPositive: false }}
        />
        <StatCardMobile
          icon={Error}
          iconColor="text-red-600"
          title="已过期"
          value={stats.expired.toString()}
          trend={{ value: 0.5, isPositive: false }}
        />
        <StatCardMobile
          icon={TrendingUp}
          iconColor="text-purple-600"
          title="本月请求"
          value={(stats.totalRequests / 1000).toFixed(1) + 'k'}
          trend={{ value: 12.3, isPositive: true }}
        />
        <StatCardMobile
          icon={Settings}
          iconColor="text-indigo-600"
          title="平均响应"
          value={`${stats.avgResponseTime.toFixed(2)}s`}
          trend={{ value: -5.2, isPositive: true }}
        />
      </StatGridMobile>

      {/* 搜索和筛选栏 */}
      <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="搜索智能体名称、作者..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 数据表格 */}
      <DataTableMobile
        columns={columns}
        data={agents}
        loading={loading}
        rowActions={rowActions}
        enableBatchOperations={true}
        onBatchDelete={handleBatchDelete}
        emptyMessage="暂无智能体数据"
        pageSize={10}
      />
    </AdminMobileLayout>
  );
}
