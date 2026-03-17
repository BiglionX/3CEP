'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Bot,
  Coins,
  ShoppingCart,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  History,
  CreditCard,
  RefreshCw,
  Plus,
  Menu,
  X,
  Settings,
  LogOut,
  Globe,
  CreditCard as FXCIcon,
} from 'lucide-react';

interface TokenBalance {
  balance: number;
  frozen: number;
  pending: number;
}

interface UsageRecord {
  id: string;
  type: 'purchase' | 'usage' | 'refund';
  amount: number;
  balanceAfter: number;
  description: string;
  timestamp: string;
}

export default function RepairShopTokensPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: '智能体管理', href: '/repair-shop/admin/agents', icon: Bot },
    { name: 'Token管理', href: '/repair-shop/admin/tokens', icon: Coins },
    { name: '门户管理', href: '/repair-shop/admin/portal', icon: Globe },
    { name: 'FXC管理', href: '/repair-shop/admin/fxc', icon: FXCIcon },
  ];

  const [balance] = useState<TokenBalance>({
    balance: 85000,
    frozen: 3000,
    pending: 5000,
  });

  const [records] = useState<UsageRecord[]>([
    {
      id: '1',
      type: 'purchase',
      amount: 30000,
      balanceAfter: 85000,
      description: '购买Token包 - 标准版',
      timestamp: '2025-03-15 14:30:00',
    },
    {
      id: '2',
      type: 'usage',
      amount: -1800,
      balanceAfter: 55000,
      description: '故障诊断助手使用',
      timestamp: '2025-03-14 09:15:00',
    },
    {
      id: '3',
      type: 'usage',
      amount: -1200,
      balanceAfter: 56800,
      description: '维修预约助手使用',
      timestamp: '2025-03-13 16:45:00',
    },
    {
      id: '4',
      type: 'purchase',
      amount: 50000,
      balanceAfter: 58000,
      description: '购买Token包 - 高级版',
      timestamp: '2025-03-10 11:20:00',
    },
    {
      id: '5',
      type: 'usage',
      amount: -2100,
      balanceAfter: 8000,
      description: '配件推荐AI使用',
      timestamp: '2025-03-09 08:30:00',
    },
  ]);

  const [rechargeAmount, setRechargeAmount] = useState('1000');

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'bg-green-100 text-green-700';
      case 'usage':
        return 'bg-blue-100 text-blue-700';
      case 'refund':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'purchase':
        return '购买';
      case 'usage':
        return '使用';
      case 'refund':
        return '退款';
      default:
        return type;
    }
  };

  const getTokenPackages = () => [
    { amount: 1000, price: 99, bonus: 0 },
    { amount: 5000, price: 399, bonus: 500 },
    { amount: 10000, price: 699, bonus: 1500 },
    { amount: 50000, price: 2999, bonus: 10000 },
    { amount: 100000, price: 4999, bonus: 25000 },
  ];

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
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">R</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">
                维修店管理中心
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
                <h1 className="text-3xl font-bold text-gray-900">Token管理</h1>
                <p className="mt-2 text-gray-600">
                  查看Token余额、购买Token包、查看使用记录
                </p>
              </div>
              <Link href="/tokens/packages">
                <Button className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  购买Token
                </Button>
              </Link>
            </div>

            {/* Token余额卡片 */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-500" />
                  Token余额
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">可用余额</span>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-3xl font-bold text-yellow-700">
                      {balance.balance.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">可立即使用</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">冻结中</span>
                      <Clock className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-3xl font-bold text-blue-700">
                      {balance.frozen.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">待确认订单</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">待到账</span>
                      <RefreshCw className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="text-3xl font-bold text-purple-700">
                      {balance.pending.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">处理中</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">总计</span>
                      <CreditCard className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-3xl font-bold text-green-700">
                      {(
                        balance.balance +
                        balance.frozen +
                        balance.pending
                      ).toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">所有Token</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 快速充值 */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-500" />
                  快速充值
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">充值数量</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={rechargeAmount}
                        onChange={e => setRechargeAmount(e.target.value)}
                        placeholder="输入Token数量"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cost">预计费用</Label>
                      <div className="mt-1 text-lg font-semibold text-gray-900">
                        ¥{(parseInt(rechargeAmount) * 0.1).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <Link href="/tokens/packages">
                    <Button className="w-full flex items-center justify-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      立即充值
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Token套餐推荐 */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-green-500" />
                  推荐套餐
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {getTokenPackages().map((pkg, index) => (
                    <Link key={index} href="/tokens/packages">
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-500">
                        <CardContent className="p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-700 mb-1">
                              {pkg.amount.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              Token
                            </div>
                            <div className="text-lg font-semibold text-gray-900 mb-1">
                              ¥{pkg.price}
                            </div>
                            {pkg.bonus > 0 && (
                              <Badge className="bg-green-100 text-green-700">
                                +{pkg.bonus} 赠送
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 使用记录 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-500" />
                  使用记录
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {records.map(record => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className={getTypeColor(record.type)}>
                            {getTypeText(record.type)}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {record.timestamp}
                          </span>
                        </div>
                        <p className="text-gray-900 font-medium">
                          {record.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-xl font-bold ${
                            record.amount > 0
                              ? 'text-green-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {record.amount > 0 ? '+' : ''}
                          {record.amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          余额: {record.balanceAfter.toLocaleString()}
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

            {/* 使用统计 */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    今日使用
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700">2,100</div>
                  <div className="flex items-center text-xs text-green-600 mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +8% 较昨日
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    本月使用
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-700">
                    28,500
                  </div>
                  <div className="flex items-center text-xs text-green-600 mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +5% 较上月
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    平均每日
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">950</div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    稳定增长中
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
