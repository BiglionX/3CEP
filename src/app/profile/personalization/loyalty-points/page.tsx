'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Award,
  Clock,
  Search,
  ShoppingBag,
  Star,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

interface Reward {
  id: string;
  name: string;
  description: string;
  points: number;
  category: 'voucher' | 'product' | 'service' | 'special';
  stock: number;
  image?: string;
}

interface Transaction {
  id: string;
  type: 'earn' | 'redeem';
  points: number;
  description: string;
  date: string;
}

export default function LoyaltyPointsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const userPoints = 2450;
  const userLevel = 5;
  const nextLevelPoints = 3000;
  const progressPercent = ((userPoints % 1000) / 1000) * 100;

  const rewards: Reward[] = [
    {
      id: '1',
      name: '¥50维修优惠券',
      description: '全品类维修服务可用',
      points: 500,
      category: 'voucher',
      stock: 20,
    },
    {
      id: '2',
      name: '免费贴膜服务',
      description: '任选手机膜贴膜一次',
      points: 300,
      category: 'service',
      stock: 15,
    },
    {
      id: '3',
      name: '蓝牙耳机',
      description: '指定型号蓝牙耳机',
      points: 2000,
      category: 'product',
      stock: 5,
    },
    {
      id: '4',
      name: '¥100配件券',
      description: '配件商城专用',
      points: 1000,
      category: 'voucher',
      stock: 10,
    },
    {
      id: '5',
      name: '手机支架',
      description: '多功能手机支架',
      points: 800,
      category: 'product',
      stock: 30,
    },
    {
      id: '6',
      name: '终身质保服务',
      description: '延长保修服务一年',
      points: 5000,
      category: 'special',
      stock: 3,
    },
  ];

  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'earn',
      points: 100,
      description: '完成iPhone 14维修订单',
      date: '2026-03-15',
    },
    {
      id: '2',
      type: 'redeem',
      points: 300,
      description: '兑换免费贴膜服务',
      date: '2026-03-10',
    },
    {
      id: '3',
      type: 'earn',
      points: 50,
      description: '邀请好友注册',
      date: '2026-03-08',
    },
    {
      id: '4',
      type: 'earn',
      points: 200,
      description: '完成三星手机维修',
      date: '2026-03-01',
    },
    {
      id: '5',
      type: 'redeem',
      points: 500,
      description: '兑换¥50维修优惠券',
      date: '2026-02-25',
    },
  ];

  const filteredRewards = rewards.filter(
    reward =>
      reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'voucher':
        return <Badge className="bg-blue-500">优惠券</Badge>;
      case 'product':
        return <Badge className="bg-green-500">实物</Badge>;
      case 'service':
        return <Badge className="bg-purple-500">服务</Badge>;
      case 'special':
        return <Badge className="bg-yellow-500">特殊</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Star className="w-8 h-8 text-yellow-500" />
        <h1 className="text-3xl font-bold">积分商城</h1>
      </div>

      {/* 用户积分概览 */}
      <Card className="mb-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-yellow-100 mb-1">当前积分</p>
              <p className="text-5xl font-bold">{userPoints}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-white/20 text-white">
                  <Award className="w-4 h-4 mr-1" />
                  等级 {userLevel}
                </Badge>
              </div>
            </div>

            <div className="flex-1 w-full md:w-80">
              <div className="flex justify-between text-sm mb-2">
                <span>距离下一级</span>
                <span>{nextLevelPoints - userPoints} 积分</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-sm text-yellow-100 mt-2 text-center">
                距离升级还需 {nextLevelPoints - userPoints} 积分
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 赚积分方式 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">赚积分方式</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">维修订单</p>
                <p className="text-sm text-gray-500">消费1元=1积分</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <ShoppingBag className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium">配件购买</p>
                <p className="text-sm text-gray-500">消费1元=1积分</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">邀请好友</p>
                <p className="text-sm text-gray-500">邀请得50积分</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium">评价订单</p>
                <p className="text-sm text-gray-500">评价得20积分</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 积分兑换 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">积分兑换</h2>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="搜索礼品"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredRewards.map(reward => (
            <Card key={reward.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold">{reward.name}</h3>
                  {getCategoryBadge(reward.category)}
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  {reward.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold text-lg">{reward.points}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    库存: {reward.stock}
                  </span>
                </div>
                <Button
                  className="w-full mt-3"
                  disabled={reward.stock === 0 || userPoints < reward.points}
                >
                  {userPoints < reward.points ? '积分不足' : '立即兑换'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 积分记录 */}
      <div>
        <h2 className="text-xl font-bold mb-4">积分记录</h2>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {transactions.map(transaction => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        transaction.type === 'earn'
                          ? 'bg-green-100'
                          : 'bg-red-100'
                      }`}
                    >
                      {transaction.type === 'earn' ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {transaction.date}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-bold ${
                      transaction.type === 'earn'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'earn' ? '+' : '-'}
                    {transaction.points}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
