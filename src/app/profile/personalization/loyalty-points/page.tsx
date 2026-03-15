'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Star,
  Gift,
  History,
  TrendingUp,
  ShoppingCart,
  Plus,
  Minus,
  Search,
  Filter,
  Calendar,
  Coins,
} from 'lucide-react';

interface PointTransaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  description: string;
  date: string;
  balance: number;
}

interface RewardItem {
  id: string;
  name: string;
  description: string;
  points: number;
  image: string;
  category: string;
  stock: number;
}

export default function LoyaltyPointsPage() {
  const [pointsBalance, setPointsBalance] = useState(1250);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟获取积分数据
    setTimeout(() => {
      setTransactions([
        {
          id: 'tx_001',
          type: 'earn',
          amount: 50,
          description: '每日签到奖励',
          date: '2024-01-20',
          balance: 1250,
        },
        {
          id: 'tx_002',
          type: 'spend',
          amount: -200,
          description: '兑换精美礼品',
          date: '2024-01-19',
          balance: 1200,
        },
        {
          id: 'tx_003',
          type: 'earn',
          amount: 100,
          description: '完成维修订单',
          date: '2024-01-18',
          balance: 1400,
        },
        {
          id: 'tx_004',
          type: 'earn',
          amount: 30,
          description: '分享应用给好友',
          date: '2024-01-17',
          balance: 1300,
        },
      ]);

      setRewards([
        {
          id: 'reward_001',
          name: '精美无线充电器',
          description: '支持快充的无线充电设备',
          points: 800,
          image: '/images/rewards/charger.jpg',
          category: '数码配件',
          stock: 15,
        },
        {
          id: 'reward_002',
          name: '品牌蓝牙耳机',
          description: '高品质真无线蓝牙耳机',
          points: 1200,
          image: '/images/rewards/headphones.jpg',
          category: '数码配件',
          stock: 8,
        },
        {
          id: 'reward_003',
          name: '维修工具套装',
          description: '专业手机维修工具组合',
          points: 600,
          image: '/images/rewards/tools.jpg',
          category: '维修工具',
          stock: 25,
        },
        {
          id: 'reward_004',
          name: '定制手机壳',
          description: '个性定制保护壳',
          points: 300,
          image: '/images/rewards/case.jpg',
          category: '周边商品',
          stock: 50,
        },
      ]);

      setLoading(false);
    }, 800);
  }, []);

  const filteredRewards = rewards.filter(reward => {
    const matchesSearch =
      reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || reward.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', '数码配件', '维修工具', '周边商品'];

  const handleExchangeReward = (reward: RewardItem) => {
    if (pointsBalance >= reward.points && reward.stock > 0) {
      setPointsBalance(prev => prev - reward.points);
      // 添加交易记录
      const newTransaction: PointTransaction = {
        id: `tx_${Date.now()}`,
        type: 'spend',
        amount: -reward.points,
        description: `兑换${reward.name}`,
        date: new Date().toISOString().split('T')[0],
        balance: pointsBalance - reward.points,
      };
      setTransactions([newTransaction, ...transactions]);

      alert(`成功兑换 ${reward.name}！`);
    } else if (reward.stock <= 0) {
      alert('该商品已售罄');
    } else {
      alert('积分不足');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">积分商城</h1>
        <p className="text-gray-600 mt-1">用积分兑换心仪好物</p>
      </div>

      {/* 积分概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">当前积分</p>
                <p className="text-3xl font-bold mt-1">{pointsBalance}</p>
              </div>
              <Star className="h-12 w-12 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">今日获得</p>
                <p className="text-xl font-bold text-gray-900">+80</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3">
                <Gift className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">累计兑换</p>
                <p className="text-xl font-bold text-gray-900">12件</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：商品列表 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 搜索和筛选 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="搜索商品名称..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? '全部分类' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 商品网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRewards.map(reward => (
              <Card
                key={reward.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Gift className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {reward.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {reward.description}
                      </p>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-bold text-yellow-600">
                            {reward.points}
                          </span>
                          <span className="text-sm text-gray-500">积分</span>
                        </div>
                        <span
                          className={`text-sm px-2 py-1 rounded-full ${
                            reward.stock > 10
                               'bg-green-100 text-green-800'
                              : reward.stock > 0
                                 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {reward.stock > 0
                             `剩余${reward.stock}件`
                            : '已售罄'}
                        </span>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => handleExchangeReward(reward)}
                        disabled={
                          pointsBalance < reward.points || reward.stock <= 0
                        }
                      >
                        {reward.stock <= 0
                           '已售罄'
                          : pointsBalance < reward.points
                             '积分不足'
                            : '立即兑换'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 右侧：交易记录 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="w-5 h-5 mr-2" />
                积分记录
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.slice(0, 5).map(transaction => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.type === 'earn'
                             'bg-green-100'
                            : 'bg-red-100'
                        }`}
                      >
                        {transaction.type === 'earn' ? (
                          <Plus className="w-4 h-4 text-green-600" />
                        ) : (
                          <Minus className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.date}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        transaction.type === 'earn'
                           'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'earn'  '+' : ''}
                      {transaction.amount}
                    </div>
                  </div>
                ))}
              </div>

              {transactions.length > 5 && (
                <Button variant="outline" className="w-full mt-4">
                  查看更多记录
                </Button>
              )}
            </CardContent>
          </Card>

          {/* 获取积分方式 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Coins className="w-5 h-5 mr-2" />
                获取积分
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { action: '每日签到', points: '+10', frequency: '每天一次' },
                  {
                    action: '完成维修订单',
                    points: '+50~200',
                    frequency: '每单奖励',
                  },
                  {
                    action: '购买配件',
                    points: '+1~10积分',
                    frequency: '消费返利',
                  },
                  {
                    action: '邀请好友',
                    points: '+100',
                    frequency: '每成功邀请',
                  },
                  { action: '评价服务', points: '+20', frequency: '每次评价' },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.action}
                      </p>
                      <p className="text-xs text-gray-500">{item.frequency}</p>
                    </div>
                    <span className="text-sm font-bold text-green-600">
                      {item.points}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

