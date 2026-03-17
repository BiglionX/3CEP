'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import {
  Bot,
  Coins,
  CreditCard,
  TrendingUp,
  ArrowDown,
  ArrowUp,
  RefreshCw,
  Wallet,
  History,
  DollarSign,
  Plus,
  ExternalLink,
  Menu,
  X,
  Settings,
  LogOut,
  Globe,
} from 'lucide-react';

interface FXCBalance {
  balance: number;
  frozen: number;
  available: number;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'transfer' | 'exchange';
  amount: number;
  balanceAfter: number;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

interface ExchangeRate {
  currency: string;
  rate: number;
  change: number;
}

export default function ForeignTradeFXCPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: '智能体管理', href: '/foreign-trade/admin/agents', icon: Bot },
    { name: 'Token管理', href: '/foreign-trade/admin/tokens', icon: Coins },
    { name: '门户管理', href: '/foreign-trade/admin/portal', icon: Globe },
    { name: 'FXC管理', href: '/foreign-trade/admin/fxc', icon: CreditCard },
  ];

  const [balance] = useState<FXCBalance>({
    balance: 80000,
    frozen: 5000,
    available: 75000,
  });

  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'deposit',
      amount: 20000,
      balanceAfter: 80000,
      description: 'FXC充值',
      timestamp: '2025-03-15 14:30:00',
      status: 'completed',
    },
    {
      id: '2',
      type: 'withdraw',
      amount: -10000,
      balanceAfter: 60000,
      description: 'FXC提现',
      timestamp: '2025-03-14 10:15:00',
      status: 'completed',
    },
    {
      id: '3',
      type: 'exchange',
      amount: -5000,
      balanceAfter: 65000,
      description: 'FXC兑换为Token',
      timestamp: '2025-03-13 16:45:00',
      status: 'completed',
    },
    {
      id: '4',
      type: 'transfer',
      amount: -8000,
      balanceAfter: 57000,
      description: '转账至供应商账户',
      timestamp: '2025-03-12 09:20:00',
      status: 'completed',
    },
    {
      id: '5',
      type: 'deposit',
      amount: 10000,
      balanceAfter: 65000,
      description: 'FXC充值',
      timestamp: '2025-03-11 11:30:00',
      status: 'pending',
    },
  ]);

  const [exchangeRates] = useState<ExchangeRate[]>([
    { currency: 'USD', rate: 7.2, change: 0.05 },
    { currency: 'EUR', rate: 7.8, change: -0.03 },
    { currency: 'GBP', rate: 9.1, change: 0.08 },
    { currency: 'JPY', rate: 0.048, change: 0.001 },
    { currency: 'CNY', rate: 1.0, change: 0.0 },
  ]);

  const [rechargeAmount, setRechargeAmount] = useState('1000');

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'bg-green-100 text-green-700';
      case 'withdraw':
        return 'bg-red-100 text-red-700';
      case 'transfer':
        return 'bg-blue-100 text-blue-700';
      case 'exchange':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'deposit':
        return '充值';
      case 'withdraw':
        return '提现';
      case 'transfer':
        return '转账';
      case 'exchange':
        return '兑换';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'pending':
        return '处理中';
      case 'failed':
        return '失败';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="mr-4 lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">F</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">
                贸易公司管理中心
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              设置
            </Button>
            <Button variant="ghost" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 侧边栏 */}
        <aside
          className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out`}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">管理菜单</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-5 px-2 space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center px-4 py-3 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* 移动端遮罩层 */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* 主要内容区域 */}
        <main className="flex-1 lg:ml-0">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {/* 页面标题 */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">FXC管理</h1>
                <p className="mt-2 text-gray-600">
                  管理您的FXC余额、充值、提现和交易记录
                </p>
              </div>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                充值FXC
              </Button>
            </div>

            {/* FXC余额卡片 */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-500" />
                  FXC余额
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">总余额</span>
                      <Wallet className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="text-3xl font-bold text-purple-700">
                      {balance.balance.toLocaleString()} FXC
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      ≈ ¥{(balance.balance * 0.1).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">可用余额</span>
                      <ArrowUp className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-3xl font-bold text-blue-700">
                      {balance.available.toLocaleString()} FXC
                    </div>
                    <p className="text-xs text-gray-500 mt-1">可立即使用</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">冻结金额</span>
                      <ArrowDown className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div className="text-3xl font-bold text-yellow-700">
                      {balance.frozen.toLocaleString()} FXC
                    </div>
                    <p className="text-xs text-gray-500 mt-1">待确认交易</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 快速充值 */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-500" />
                  快速充值
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fxcAmount">充值数量 (FXC)</Label>
                      <Input
                        id="fxcAmount"
                        type="number"
                        value={rechargeAmount}
                        onChange={e => setRechargeAmount(e.target.value)}
                        placeholder="输入FXC数量"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fxcCost">预计费用 (CNY)</Label>
                      <div className="mt-1 text-lg font-semibold text-gray-900">
                        ¥{(parseInt(rechargeAmount) * 0.1).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <Button className="w-full flex items-center justify-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    立即充值
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 汇率查询 */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-blue-500" />
                  实时汇率
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {exchangeRates.map(rate => (
                    <div
                      key={rate.currency}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {rate.currency}
                        </span>
                        <RefreshCw className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {rate.rate.toFixed(4)}
                      </div>
                      <div
                        className={`flex items-center text-xs mt-1 ${
                          rate.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {rate.change >= 0 ? (
                          <ArrowUp className="w-3 h-3 mr-1" />
                        ) : (
                          <ArrowDown className="w-3 h-3 mr-1" />
                        )}
                        {rate.change > 0 ? '+' : ''}
                        {rate.change.toFixed(4)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 交易记录 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-500" />
                  交易记录
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map(transaction => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${getTypeColor(transaction.type)}`}
                          >
                            {getTypeText(transaction.type)}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${getStatusColor(transaction.status)}`}
                          >
                            {getStatusText(transaction.status)}
                          </span>
                          <span className="text-sm text-gray-600">
                            {transaction.timestamp}
                          </span>
                        </div>
                        <p className="text-gray-900 font-medium">
                          {transaction.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-xl font-bold ${
                            transaction.amount > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {transaction.amount > 0 ? '+' : ''}
                          {transaction.amount.toLocaleString()} FXC
                        </div>
                        <div className="text-xs text-gray-500">
                          余额: {transaction.balanceAfter.toLocaleString()} FXC
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-6">
                  查看更多记录
                </Button>
              </CardContent>
            </Card>

            {/* 快捷操作 */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Plus className="w-6 h-6 text-green-500" />
                    <CardTitle className="text-lg">充值FXC</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">快速充值FXC到账户</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <ArrowDown className="w-6 h-6 text-red-500" />
                    <CardTitle className="text-lg">提现FXC</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">提现FXC到银行账户</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-6 h-6 text-blue-500" />
                    <CardTitle className="text-lg">兑换Token</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">将FXC兑换为Token</p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-6 h-6 text-purple-500" />
                    <CardTitle className="text-lg">交易记录</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">查看详细交易历史</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
