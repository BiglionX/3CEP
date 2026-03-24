/**
 * FXC管理响应式页面
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
  CurrencyExchange,
  MonetizationOn,
  Refresh,
  Search,
  SwapHoriz,
  TrendingUp,
  Warning,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface FXCAccount {
  id: string;
  user_id: string;
  user_name: string;
  business_type: 'enterprise' | 'repair-shop' | 'foreign-trade';
  balance: number;
  currency: 'CNY' | 'USD' | 'EUR' | 'JPY' | 'GBP';
  last_transaction: string;
  account_status: 'active' | 'frozen' | 'suspended';
}

export default function ResponsiveFXCManagement() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<FXCAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    totalBalance: 0,
    active: 0,
    frozen: 0,
    suspended: 0,
    todayTransactions: 0,
  });

  // 加载数据操作
  const loadAccountsOp = useOperation({
    successMessage: undefined,
    errorMessage: '加载 FXC 账户数据失败',
    showToast: false,
  });

  // 充值操作
  const rechargeOp = useOperation({
    successMessage: '充值成功',
    errorMessage: '充值失败',
    onSuccess: () => loadAccounts(),
  });

  // 冻结操作
  const freezeOp = useOperation({
    successMessage: '账户已冻结',
    errorMessage: '冻结失败',
    onSuccess: () => loadAccounts(),
  });

  const loadAccounts = async () => {
    await loadAccountsOp.execute(async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/fxc/accounts');
        const result = await response.json();
        if (result.success) {
          setAccounts(result.data);
          calculateStats(result.data);
        }
      } catch (error) {
        console.error('加载 FXC 账户失败:', error);
      } finally {
        setLoading(false);
      }
    });
  };

  const calculateStats = (data: FXCAccount[]) => {
    setStats({
      total: data.length,
      totalBalance: data.reduce((sum, a) => sum + a.balance, 0),
      active: data.filter(a => a.account_status === 'active').length,
      frozen: data.filter(a => a.account_status === 'frozen').length,
      suspended: data.filter(a => a.account_status === 'suspended').length,
      todayTransactions: Math.floor(Math.random() * 100), // 模拟数据
    });
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  // 业务类型徽章
  const getBusinessTypeBadge = (type: FXCAccount['business_type']) => {
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

  // 账户状态徽章
  const getStatusBadge = (status: FXCAccount['account_status']) => {
    const badges = {
      active: (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          正常
        </Badge>
      ),
      frozen: (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          <Warning className="w-3 h-3 mr-1" />
          冻结
        </Badge>
      ),
      suspended: (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          暂停
        </Badge>
      ),
    };
    return badges[status];
  };

  // 表格列定义
  const columns: Column<FXCAccount>[] = [
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
      key: 'balance',
      label: '余额',
      sortable: true,
      mobile: {
        show: true,
        priority: 1,
        render: (value: number, item) =>
          `${item.currency} ${value.toLocaleString()}`,
      },
    },
    {
      key: 'currency',
      label: '币种',
      sortable: true,
      mobile: { show: true, priority: 2 },
    },
    {
      key: 'account_status',
      label: '状态',
      sortable: true,
      mobile: {
        show: true,
        priority: 1,
        render: (_, item) => getStatusBadge(item.account_status),
      },
    },
    {
      key: 'last_transaction',
      label: '最后交易',
      sortable: true,
      mobile: { show: false },
    },
  ];

  // 行操作
  const rowActions = [
    {
      icon: Add,
      label: '充值',
      onClick: (account: FXCAccount) => handleRecharge(account),
      color: 'text-green-600',
    },
    {
      icon: SwapHoriz,
      label: '兑换',
      onClick: (account: FXCAccount) =>
        router.push(`/admin/fxc-management/${account.id}/exchange`),
      color: 'text-blue-600',
    },
    {
      icon: CurrencyExchange,
      label: '转账',
      onClick: (account: FXCAccount) =>
        router.push(`/admin/fxc-management/${account.id}/transfer`),
      color: 'text-purple-600',
    },
    {
      icon: Warning,
      label: '冻结',
      onClick: (account: FXCAccount) => handleFreeze(account),
      color: 'text-red-600',
    },
  ];

  const handleRecharge = async (account: FXCAccount) => {
    const amount = prompt(
      `为用户 "${account.user_name}" 充值，请输入金额 (${account.currency}):`,
      '0'
    );
    if (!amount) return;

    await rechargeOp.execute(async () => {
      const response = await fetch(`/api/admin/fxc/${account.id}/recharge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency: account.currency,
        }),
      });
      if (!response.ok) throw new Error('充值失败');
    });
  };

  const handleFreeze = async (account: FXCAccount) => {
    if (
      !confirm(
        `确定要${account.account_status === 'frozen' ? '解冻' : '冻结'}账户 "${account.user_name}" 吗？`
      )
    )
      return;

    await freezeOp.execute(async () => {
      const response = await fetch(`/api/admin/fxc/${account.id}/freeze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: account.account_status === 'frozen' ? 'active' : 'frozen',
        }),
      });
      if (!response.ok) throw new Error('操作失败');
    });
  };

  return (
    <AdminMobileLayout
      title="FXC管理"
      description="外汇账户管理和交易"
      onRefresh={loadAccounts}
    >
      {/* 统计卡片 */}
      <StatGridMobile>
        <StatCardMobile
          icon={AccountBalance}
          iconColor="text-blue-600"
          title="总账户数"
          value={stats.total.toString()}
          trend={{ value: 6.2, isPositive: true }}
        />
        <StatCardMobile
          icon={MonetizationOn}
          iconColor="text-green-600"
          title="总余额"
          value={(stats.totalBalance / 1000).toFixed(0) + 'k'}
          trend={{ value: 8.5, isPositive: true }}
        />
        <StatCardMobile
          icon={TrendingUp}
          iconColor="text-purple-600"
          title="活跃账户"
          value={stats.active.toString()}
          trend={{ value: 3.8, isPositive: true }}
        />
        <StatCardMobile
          icon={Warning}
          iconColor="text-red-600"
          title="冻结账户"
          value={stats.frozen.toString()}
          trend={{ value: 0.5, isPositive: false }}
        />
        <StatCardMobile
          icon={Refresh}
          iconColor="text-orange-600"
          title="今日交易"
          value={stats.todayTransactions.toString()}
          trend={{ value: 12.3, isPositive: true }}
        />
      </StatGridMobile>

      {/* 搜索和筛选栏 */}
      <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="搜索用户名、币种..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 数据表格 */}
      <DataTableMobile
        columns={columns}
        data={accounts}
        loading={loading}
        rowActions={rowActions}
        enableBatchOperations={false}
        emptyMessage="暂无 FXC 账户数据"
        pageSize={10}
      />
    </AdminMobileLayout>
  );
}
