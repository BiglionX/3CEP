'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  Coins, 
  Check, 
  Star, 
  ArrowRight,
  Shield,
  Zap,
  Gift,
  History,
  Wallet
} from 'lucide-react';
import { 
  getTokenPackages, 
  getUserTokenBalance,
  createPaymentOrder,
  getUserTransactions
} from '@/services/token-service';

interface TokenPackage {
  id: string;
  name: string;
  description: string;
  token_amount: number;
  price: number;
  discount_percentage: number;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface UserTokenBalance {
  balance: number;
  total_purchased: number;
  total_consumed: number;
}

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  balance_after: number;
  description: string | null;
  created_at: string;
}

export default function TokenPurchasePage() {
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [userBalance, setUserBalance] = useState<UserTokenBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'packages' | 'transactions'>('packages');

  const loadData = useCallback(async () => {
    try {
      // 这里应该从认证服务获取当前用户ID
      const userId = 'demo_user_123'; // 示例用户ID
      
      const [packagesResult, balanceResult, transactionsResult] = await Promise.all([
        getTokenPackages(),
        getUserTokenBalance(userId),
        getUserTransactions(userId)
      ]);

      if (packagesResult.data) {
        setPackages(packagesResult.data);
      }

      if (balanceResult.data) {
        setUserBalance({
          balance: balanceResult.data.balance,
          total_purchased: balanceResult.data.total_purchased,
          total_consumed: balanceResult.data.total_consumed
        });
      }

      if (transactionsResult.data) {
        setTransactions(transactionsResult.data);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePurchase = async (packageId: string, packageName: string) => {
    setProcessing(packageId);
    
    try {
      // 这里应该从认证服务获取当前用户ID
      const userId = 'demo_user_123'; // 示例用户ID
      
      // 创建支付订单
      const { data: payment, error } = await createPaymentOrder(userId, packageId, 'alipay');
      
      if (error) {
        alert(`创建订单失败: ${error}`);
        return;
      }

      // 模拟支付流程
      alert(`订单创建成功！\n订单? ${payment?.id}\n请完成支?..`);
      
      // 模拟支付成功后的处理
      setTimeout(async () => {
        // 这里应该调用实际的支付完成API
        alert(`${packageName} 购买成功！Token已到账。`);
        setProcessing(null);
        loadData(); // 刷新数据
      }, 2000);

    } catch (error) {
      alert('购买失败，请重试');
      console.error('购买失败:', error);
    } finally {
      setProcessing(null);
    }
  };

  const formatCurrency = (amount: number): string => {
    return `¥${amount.toFixed(2)}`;
  };

  const getTransactionTypeText = (type: string): string => {
    switch (type) {
      case 'purchase': return '购买';
      case 'consume': return '消费';
      case 'refund': return '退?;
      case 'bonus': return '奖励';
      default: return type;
    }
  };

  const getTransactionTypeColor = (type: string): string => {
    switch (type) {
      case 'purchase': 
      case 'bonus': 
        return 'text-green-600';
      case 'consume': 
        return 'text-red-600';
      case 'refund': 
        return 'text-blue-600';
      default: 
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">加载?..</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Token套餐购买</h1>
          <p className="text-xl text-gray-600">选择适合您的套餐，享受智能诊断服?/p>
        </div>

        {/* 用户余额卡片 */}
        {userBalance && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">当前余额</p>
                  <p className="text-3xl font-bold text-blue-600">{userBalance.balance} <span className="text-lg">Token</span></p>
                </div>
                <Wallet className="h-12 w-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">累计购买</p>
                  <p className="text-3xl font-bold text-green-600">{userBalance.total_purchased} <span className="text-lg">Token</span></p>
                </div>
                <Gift className="h-12 w-12 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">累计消费</p>
                  <p className="text-3xl font-bold text-purple-600">{userBalance.total_consumed} <span className="text-lg">Token</span></p>
                </div>
                <Zap className="h-12 w-12 text-purple-500" />
              </div>
            </div>
          </div>
        )}

        {/* 标签页切?*/}
        <div className="flex space-x-1 bg-white rounded-lg p-1 mb-8 shadow-sm max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('packages')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'packages'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            套餐购买
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'transactions'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            交易记录
          </button>
        </div>

        {/* 套餐购买区域 */}
        {activeTab === 'packages' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {packages.map((pkg) => {
              const unitPrice = pkg.price / pkg.token_amount;
              const savings = pkg.discount_percentage > 0 
                ? (pkg.price * pkg.discount_percentage / 100).toFixed(2)
                : null;

              return (
                <div 
                  key={pkg.id}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all duration-300 hover:shadow-xl ${
                    pkg.is_popular 
                      ? 'border-yellow-400 ring-2 ring-yellow-200 scale-105' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {/* 推荐标签 */}
                  {pkg.is_popular && (
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center py-2 px-4">
                      <div className="flex items-center justify-center">
                        <Star className="h-4 w-4 mr-1" />
                        <span className="font-semibold text-sm">最受欢?/span>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    {/* 套餐名称 */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                    <p className="text-gray-600 text-sm mb-6">{pkg.description}</p>

                    {/* Token数量和价?*/}
                    <div className="mb-6">
                      <div className="flex items-baseline mb-2">
                        <span className="text-4xl font-bold text-gray-900">{pkg.token_amount}</span>
                        <span className="text-gray-500 ml-2">Token</span>
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-blue-600">{formatCurrency(pkg.price)}</span>
                        {pkg.discount_percentage > 0 && (
                          <span className="text-sm text-green-600 ml-2">
                            节省{formatCurrency(parseFloat(savings!))}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        单价: {formatCurrency(unitPrice)}/Token
                      </div>
                    </div>

                    {/* 折扣信息 */}
                    {pkg.discount_percentage > 0 && (
                      <div className="bg-green-50 text-green-700 text-center py-2 px-4 rounded-lg mb-6">
                        <span className="font-semibold">{pkg.discount_percentage}% 折扣</span>
                      </div>
                    )}

                    {/* 购买按钮 */}
                    <Button
                      className="w-full py-3 text-lg font-semibold"
                      onClick={() => handlePurchase(pkg.id, pkg.name)}
                      disabled={processing === pkg.id}
                    >
                      {processing === pkg.id ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          处理?..
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          立即购买
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 交易记录区域 */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <History className="h-6 w-6 mr-2 text-blue-600" />
                交易记录
              </h2>
            </div>
            
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <Coins className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无交易记录</h3>
                <p className="text-gray-500">购买Token后会显示在这?/p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`mr-4 p-2 rounded-full ${
                          transaction.transaction_type === 'purchase' || transaction.transaction_type === 'bonus'
                            ? 'bg-green-100'
                            : 'bg-red-100'
                        }`}>
                          <Coins className={`h-5 w-5 ${
                            transaction.transaction_type === 'purchase' || transaction.transaction_type === 'bonus'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {getTransactionTypeText(transaction.transaction_type)}
                          </h3>
                          <p className="text-sm text-gray-500">{transaction.description}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(transaction.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${getTransactionTypeColor(transaction.transaction_type)}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount} Token
                        </div>
                        <div className="text-sm text-gray-500">
                          余额: {transaction.balance_after} Token
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 保障信息 */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">为什么选择我们的Token服务?/h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">安全可靠</h3>
              <p className="text-gray-600">采用银行级加密技术，保障您的资金和信息安?/p>
            </div>
            
            <div className="text-center">
              <Zap className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">即时到账</h3>
              <p className="text-gray-600">支付完成后立即到账，无需等待</p>
            </div>
            
            <div className="text-center">
              <Gift className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">超值优?/h3>
              <p className="text-gray-600">多种套餐选择，大额购买享受更多折?/p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
