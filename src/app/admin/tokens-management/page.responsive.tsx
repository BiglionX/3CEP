/**
 * Token管理响应式页面
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
import { useOperation } from '@/hooks/use-operation';
import {
  AccountBalance,
  Add,
  History,
  MonetizationOn,
  Payment,
  Remove,
  Search,
  TrendingUp,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface TokenBalance {
  id: string;
  user_id: string;
  user_name: string;
  business_type: 'enterprise' | 'repair-shop' | 'foreign-trade';
  balance_free: number;
  balance_paid: number;
  balance_promotion: number;
  total: number;
  last_recharge: string;
  last_used: string;
}

export default function ResponsiveTokensManagement() {
  const router = useRouter();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    totalBalance: 0,
    totalFree: 0,
    totalPaid: 0,
    totalPromotion: 0,
    lowBalance: 0,
  });

  // 加载数据操作
  const loadBalancesOp = useOperation({
    successMessage: undefined,
    errorMessage: '加载 Token 数据失败',
    showToast: false,
  });

  // 充值操作
  const rechargeOp = useOperation({
    successMessage: '充值成功',
    errorMessage: '充值失败',
    onSuccess: () => loadBalances(),
  });

  const loadBalances = async () => {
    await loadBalancesOp.execute(async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/tokens/balances');
        const result = await response.json();
        if (result.success) {
          setBalances(result.data);
          calculateStats(result.data);
        }
      } catch (error) {
        console.error('加载 Token 失败:', error);
      } finally {
        setLoading(false);
      }
    });
  };

  const calculateStats = (data: TokenBalance[]) => {
    setStats({
      total: data.length,
      totalBalance: data.reduce((sum, b) => sum + b.total, 0),
      totalFree: data.reduce((sum, b) => sum + b.balance_free, 0),
      totalPaid: data.reduce((sum, b) => sum + b.balance_paid, 0),
      totalPromotion: data.reduce((sum, b) => sum + b.balance_promotion, 0),
      lowBalance: data.filter(b => b.total < 1000).length,
    });
  };

  useEffect(() => {
    loadBalances();
  }, []);

  // 业务类型徽章
  const getBusinessTypeBadge = (type: TokenBalance['business_type']) => {
    const badges = {
      enterprise: (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          企业
        </Badge>
      ),
      'repair-shop': (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          维修店
        </Badge>
      ),
      'foreign-trade': (
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          外贸
        </Badge>
      ),
    };
    return badges[type];
  };

  // 表格列定义
  const columns: Column<TokenBalance>[] = [
    {
      key: 'user_name',
      label: '用户',
      sortable: true,
      mobile: { show: true, priority: 1 },
    },
    {
      key: 'business_type',
      label: '类型',
      sortable: true,
      mobile: {
        show: true,
        priority: 2,
        render: (_, item) => getBusinessTypeBadge(item.business_type),
      },
    },
    {
      key: 'total',
      label: '总余额',
      sortable: true,
      mobile: {
        show: true,
        priority: 1,
        render: (value: number) => value.toLocaleString(),
      },
    },
    {
      key: 'balance_free',
      label: '免费额度',
      sortable: true,
      mobile: { show: true, priority: 3 },
    },
    {
      key: 'balance_paid',
      label: '已付费',
      sortable: true,
      mobile: { show: false },
    },
    {
      key: 'balance_promotion',
      label: '促销',
      sortable: true,
      mobile: { show: false },
    },
    {
      key: 'last_recharge',
      label: '最后充值',
      sortable: true,
      mobile: { show: true, priority: 2 },
    },
    {
      key: 'last_used',
      label: '最后使用',
      sortable: true,
      mobile: { show: false },
    },
  ];

  // 行操作
  const rowActions = [
    {
      icon: Add,
      label: '充值',
      onClick: (balance: TokenBalance) => handleRecharge(balance),
      color: 'text-green-600',
    },
    {
      icon: History,
      label: '记录',
      onClick: (balance: TokenBalance) =>
        router.push(`/admin/tokens-management/${balance.id}/history`),
      color: 'text-blue-600',
    },
    {
      icon: MonetizationOn,
      label: '套餐',
      onClick: (balance: TokenBalance) =>
        router.push(`/admin/tokens-management/${balance.id}/packages`),
      color: 'text-purple-600',
    },
    {
      icon: Remove,
      label: '扣除',
      onClick: (balance: TokenBalance) => handleDeduct(balance),
      color: 'text-red-600',
    },
  ];

  const handleRecharge = async (balance: TokenBalance) => {
    const amount = prompt(
      `为用户 "${balance.user_name}" 充值 Token，请输入金额:`
    );
    if (!amount) return;

    await rechargeOp.execute(async () => {
      const response = await fetch(`/api/admin/tokens/${balance.id}/recharge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseInt(amount) }),
      });
      if (!response.ok) throw new Error('充值失败');
    });
  };

  const handleDeduct = async (balance: TokenBalance) => {
    if (!confirm(`确定要扣除用户 "${balance.user_name}" 的 Token 吗？`)) return;
    const amount = prompt('请输入扣除金额:');
    if (!amount) return;

    try {
      const response = await fetch(`/api/admin/tokens/${balance.id}/deduct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseInt(amount) }),
      });
      if (response.ok) {
        alert('扣除成功');
        loadBalances();
      }
    } catch (error) {
      console.error('扣除失败:', error);
    }
  };

  return (
    <AdminMobileLayout
      title="Token管理"
      description="管理用户 Token 余额和充值"
      onRefresh={loadBalances}
    >
      {/* 统计卡片 */}
      <StatGridMobile>
        <StatCardMobile
          icon={AccountBalance}
          iconColor="text-blue-600"
          title="总用户数"
          value={stats.total.toString()}
          trend={{ value: 5.8, isPositive: true }}
        />
        <StatCardMobile
          icon={MonetizationOn}
          iconColor="text-green-600"
          title="总余额"
          value={(stats.totalBalance / 1000).toFixed(0) + 'k'}
          trend={{ value: 12.3, isPositive: true }}
        />
        <StatCardMobile
          icon={Payment}
          iconColor="text-purple-600"
          title="已付费"
          value={(stats.totalPaid / 1000).toFixed(0) + 'k'}
          trend={{ value: 8.7, isPositive: true }}
        />
        <StatCardMobile
          icon={Add}
          iconColor="text-orange-600"
          title="免费额度"
          value={(stats.totalFree / 1000).toFixed(0) + 'k'}
          trend={null}
        />
        <StatCardMobile
          icon={TrendingUp}
          iconColor="text-red-600"
          title="低余额用户"
          value={stats.lowBalance.toString()}
          trend={{ value: 2.1, isPositive: false }}
        />
      </StatGridMobile>

      {/* 搜索和筛选栏 */}
      <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="搜索用户名..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 数据表格 */}
      <DataTableMobile
        columns={columns}
        data={balances}
        loading={loading}
        rowActions={rowActions}
        enableBatchOperations={false}
        emptyMessage="暂无 Token 数据"
        pageSize={10}
      />
    </AdminMobileLayout>
  );
}
