/**
 * Token钱包页面
 * FixCycle 6.0 智能体市场平台 - Token经济系统
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  ArrowUpDown,
  Plus,
  History,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Banknote,
  PieChart,
  Calendar,
  Search,
} from 'lucide-react';

interface TokenBalance {
  total_balance: number;
  available_balance: number;
  frozen_balance: number;
  today_earnings: number;
  monthly_earnings: number;
}

interface TokenTransaction {
  id: string;
  type: 'purchase' | 'usage' | 'earning' | 'withdrawal' | 'refund';
  amount: number;
  balance_after: number;
  description: string;
  related_agent: {
    id: string;
    name: string;
  };
  created_at: string;
  status: 'completed' | 'pending' | 'failed';
}

interface PurchasePackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  bonus_percentage: number;
  popular: boolean;
}

export default function TokensPage() {
  const router = useRouter();
  const [balance, setBalance] = useState<TokenBalance>({
    total_balance: 1250.5,
    available_balance: 1120.3,
    frozen_balance: 130.2,
    today_earnings: 45.8,
    monthly_earnings: 342.6,
  });

  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [packages] = useState<PurchasePackage[]>([
    {
      id: 'pkg-1',
      name: '基础包',
      tokens: 100,
      price: 99,
      bonus_percentage: 0,
      popular: false,
    },
    {
      id: 'pkg-2',
      name: '标准包',
      tokens: 500,
      price: 449,
      bonus_percentage: 10,
      popular: true,
    },
    {
      id: 'pkg-3',
      name: '专业包',
      tokens: 1200,
      price: 999,
      bonus_percentage: 20,
      popular: false,
    },
    {
      id: 'pkg-4',
      name: '企业包',
      tokens: 3000,
      price: 2299,
      bonus_percentage: 30,
      popular: false,
    },
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPackage, setSelectedPackage] =
    useState<PurchasePackage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // 模拟交易记录数据
  const mockTransactions: TokenTransaction[] = [
    {
      id: 'tx-1',
      type: 'earning',
      amount: 12.5,
      balance_after: 1250.5,
      description: '销售助手智能体使用收入',
      related_agent: {
        id: 'agent-1',
        name: '销售助手智能体',
      },
      created_at: '2026-03-01T15:30:00Z',
      status: 'completed',
    },
    {
      id: 'tx-2',
      type: 'purchase',
      amount: -500,
      balance_after: 1238.0,
      description: '购买标准包(500 Tokens)',
      created_at: '2026-03-01T10:15:00Z',
      status: 'completed',
    },
    {
      id: 'tx-3',
      type: 'usage',
      amount: -2.3,
      balance_after: 1738.0,
      description: '采购智能体使用消费',
      related_agent: {
        id: 'agent-2',
        name: '采购智能助手',
      },
      created_at: '2026-03-01T09:45:00Z',
      status: 'completed',
    },
    {
      id: 'tx-4',
      type: 'earning',
      amount: 8.2,
      balance_after: 1740.3,
      description: '客服支持机器人使用收入',
      related_agent: {
        id: 'agent-3',
        name: '客服支持机器人',
      },
      created_at: '2026-02-29T16:20:00Z',
      status: 'completed',
    },
  ];

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setTransactions(mockTransactions);
      setIsLoading(false);
    }, 800);
  }, []);

  const getTypeConfig = (type: string) => {
    const configs: Record<
      string,
      { icon: React.ReactNode; color: string; text: string }
    > = {
      purchase: {
        icon: <CreditCard className="w-4 h-4" />,
        color: 'text-blue-600',
        text: '购买',
      },
      usage: {
        icon: <TrendingDown className="w-4 h-4" />,
        color: 'text-red-600',
        text: '使用',
      },
      earning: {
        icon: <TrendingUp className="w-4 h-4" />,
        color: 'text-green-600',
        text: '收入',
      },
      withdrawal: {
        icon: <Banknote className="w-4 h-4" />,
        color: 'text-purple-600',
        text: '提现',
      },
      refund: {
        icon: <ArrowUpDown className="w-4 h-4" />,
        color: 'text-yellow-600',
        text: '退款',
      },
    };
    return configs[type] || configs.purchase;
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.related_agent.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatAmount = (amount: number) => {
    const absAmount = Math.abs(amount);
    const sign = amount >= 0 ? '+' : '-';
    return `${sign}${absAmount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const handlePurchasePackage = (pkg: PurchasePackage) => {
    setSelectedPackage(pkg);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = () => {
    if (!selectedPackage) return;

    // 模拟购买处理
    const bonusTokens = Math.floor(
      selectedPackage.tokens * (selectedPackage.bonus_percentage / 100)
    );
    const totalTokens = selectedPackage.tokens + bonusTokens;

    alert(`成功购买 ${selectedPackage.name}！获得${totalTokens} Tokens`);
    setShowPurchaseModal(false);
    setSelectedPackage(null);

    // 更新余额显示
    setBalance(prev => ({
      ...prev,
      total_balance: prev.total_balance + totalTokens,
      available_balance: prev.available_balance + totalTokens,
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载Token钱包中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push('/marketplace')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowUpDown className="w-5 h-5 mr-2" />
            返回市场
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-3 mb-8">
          <Wallet className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Token钱包</h1>
        </div>

        {/* 余额概览卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总余额</p>
                <p className="text-2xl font-bold text-gray-900">
                  {balance.total_balance.toFixed(2)} Tokens
                </p>
              </div>
              <Wallet className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">可用余额</p>
                <p className="text-2xl font-bold text-green-600">
                  {balance.available_balance.toFixed(2)} Tokens
                </p>
              </div>
              <PieChart className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">今日收入</p>
                <p className="text-2xl font-bold text-purple-600">
                  +{balance.today_earnings.toFixed(2)} Tokens
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">本月收入</p>
                <p className="text-2xl font-bold text-indigo-600">
                  +{balance.monthly_earnings.toFixed(2)} Tokens
                </p>
              </div>
              <Calendar className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧 - 购买套餐 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                购买Token
              </h2>

              <div className="space-y-4">
                {packages.map(pkg => (
                  <div
                    key={pkg.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      pkg.popular
                         'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePurchasePackage(pkg)}
                  >
                    {pkg.popular && (
                      <div className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full w-fit mb-2">
                        热门推荐
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {pkg.name}
                        </h3>
                        <p className="text-2xl font-bold text-gray-900">
                          {pkg.tokens} Tokens
                        </p>
                        {pkg.bonus_percentage > 0 && (
                          <p className="text-sm text-green-600">
                            +{pkg.bonus_percentage}% 额外奖励
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ¥{pkg.price}
                        </p>
                        <p className="text-sm text-gray-500">
                          单价: ¥{(pkg.price / pkg.tokens).toFixed(2)}/Token
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 使用统计 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-medium text-gray-900 mb-4">使用统计</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">总使用次数</span>
                  <span className="font-medium">1,247次</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">平均每次消费</span>
                  <span className="font-medium">1.2 Tokens</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">最常使用</span>
                  <span className="font-medium">销售助手</span>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧 - 交易记录 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <History className="w-5 h-5 mr-2" />
                    交易记录
                  </h2>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="搜索交易..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <select
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={typeFilter}
                      onChange={e => setTypeFilter(e.target.value)}
                    >
                      <option value="all">所有类型</option>
                      <option value="purchase">购买</option>
                      <option value="usage">使用</option>
                      <option value="earning">收入</option>
                      <option value="withdrawal">提现</option>
                      <option value="refund">退款</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredTransactions.map(transaction => {
                  const typeConfig = getTypeConfig(transaction.type);
                  return (
                    <div
                      key={transaction.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`p-3 rounded-full ${
                              transaction.type === 'earning'
                                 'bg-green-100'
                                : transaction.type === 'purchase'
                                   'bg-blue-100'
                                  : transaction.type === 'usage'
                                     'bg-red-100'
                                    : 'bg-gray-100'
                            }`}
                          >
                            {typeConfig.icon}
                          </div>

                          <div>
                            <h3 className="font-medium text-gray-900">
                              {typeConfig.text}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {transaction.description}
                            </p>
                            {transaction.related_agent && (
                              <p className="text-xs text-gray-500">
                                相关智能体: {transaction.related_agent.name}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(transaction.created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div
                            className={`text-lg font-semibold ${typeConfig.color}`}
                          >
                            {formatAmount(transaction.amount)} Tokens
                          </div>
                          <div className="text-sm text-gray-500">
                            余额: {transaction.balance_after.toFixed(2)} Tokens
                          </div>
                          <div
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                              transaction.status === 'completed'
                                 'bg-green-100 text-green-800'
                                : transaction.status === 'pending'
                                   'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {transaction.status === 'completed'
                               '已完成'
                              : transaction.status === 'pending'
                                 '处理中'
                                : '失败'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredTransactions.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <History className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    暂无交易记录
                  </h3>
                  <p className="text-gray-500">您的交易记录将在这里显示</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 购买确认模态框 */}
        {showPurchaseModal && selectedPackage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                确认购买
              </h2>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{selectedPackage.name}</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {selectedPackage.tokens} Tokens
                  </span>
                </div>

                {selectedPackage.bonus_percentage > 0 && (
                  <div className="text-sm text-green-600 mb-2">
                    +{selectedPackage.bonus_percentage}% 额外奖励
                  </div>
                )}

                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between">
                    <span className="font-medium">总计</span>
                    <span className="text-xl font-bold text-blue-600">
                      ¥{selectedPackage.price}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPurchaseModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={confirmPurchase}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  确认购买
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
