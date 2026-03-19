'use client';

import { UnifiedNavbar } from '@/components/layout/UnifiedNavbar';
import { RepairShopSidebar } from '@/components/repair-shop/RepairShopSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CheckCircle,
  Clock,
  Coins,
  CreditCard,
  History,
  Plus,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

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
    <div className="flex min-h-screen bg-gray-50 flex-col">
      <UnifiedNavbar />
      <div className="flex flex-1">
        {/* 侧边栏 */}
        <RepairShopSidebar />

        <main className="flex-1">
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
