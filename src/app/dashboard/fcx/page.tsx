'use client';

import React, { useState, useEffect } from 'react';
import { FcxLevelDisplay } from '@/components/fcx/FcxLevelDisplay';
import { FcxEquityCenter } from '@/components/fcx/FcxEquityCenter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Coins,
  TrendingUp,
  Gift,
  Trophy,
  RefreshCw,
  Activity,
  Zap
} from 'lucide-react';

interface FcxDashboardStats {
  fcx2Balance: number;
  totalOptions: number;
  activeOptions: number;
  expiredOptions: number;
  level: string;
  score: number;
  recentRewards: Array<{
    amount: number;
    date: string;
    orderId: string;
  }>;
}

export default function FcxDashboardPage() {
  const [stats, setStats] = useState<FcxDashboardStats>({
    fcx2Balance: 0,
    totalOptions: 0,
    activeOptions: 0,
    expiredOptions: 0,
    level: 'bronze',
    score: 0,
    recentRewards: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'equity'>('overview');

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // 模拟API调用获取FCX统计数据
      // 实际项目中应该调用真实的API端点
      setTimeout(() => {
        setStats({
          fcx2Balance: 1250.50,
          totalOptions: 8,
          activeOptions: 6,
          expiredOptions: 2,
          level: 'gold',
          score: 82,
          recentRewards: [
            { amount: 150.25, date: '2026-02-18', orderId: 'ORD-001' },
            { amount: 87.60, date: '2026-02-17', orderId: 'ORD-002' },
            { amount: 200.00, date: '2026-02-16', orderId: 'ORD-003' }
          ]
        });
        setLoading(false);
      }, 1000);

    } catch (error) {
      console.error('获取FCX统计数据失败:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color = 'blue',
    subtitle 
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color?: string;
    subtitle?: string;
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200'
    };

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">
              {title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Coins className="w-8 h-8 text-yellow-500 mr-3" />
            FCX联盟仪表板
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            管理您的FCX2期权和联盟权益
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={fetchDashboardStats}
            variant="outline"
            className="flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新数据
          </Button>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'overview' 
              ? 'bg-white shadow-sm text-blue-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>概览</span>
        </button>
        <button
          onClick={() => setActiveTab('equity')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'equity' 
              ? 'bg-white shadow-sm text-blue-600' 
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>权益中心</span>
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="FCX2余额"
              value={`${stats.fcx2Balance.toLocaleString()} FCX2`}
              icon={Coins}
              color="yellow"
              subtitle="可兑换权益"
            />
            <StatCard
              title="活跃期权"
              value={stats.activeOptions}
              icon={Zap}
              color="green"
              subtitle={`共${stats.totalOptions}个期权`}
            />
            <StatCard
              title="联盟等级"
              value={stats.level.charAt(0).toUpperCase() + stats.level.slice(1) + '级'}
              icon={Trophy}
              color="purple"
              subtitle={`${stats.score}分`}
            />
            <StatCard
              title="近期奖励"
              value={`${stats.recentRewards.length}笔`}
              icon={TrendingUp}
              color="blue"
              subtitle="最近7天"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 等级展示 */}
            <div className="lg:col-span-1">
              <FcxLevelDisplay 
                userId="current-user"
                className="shadow-lg"
                showRefresh={false}
              />
            </div>

            {/* 最近奖励记录 */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                    最近奖励记录
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentRewards.map((reward, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <Coins className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              工单奖励 #{reward.orderId}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(reward.date).toLocaleDateString('zh-CN')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            +{reward.amount} FCX2
                          </p>
                          <Badge variant="secondary" className="mt-1">
                            已到账
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    {stats.recentRewards.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Coins className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>暂无奖励记录</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 期权状态概览 */}
          <Card>
            <CardHeader>
              <CardTitle>期权状态概览</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-3xl font-bold text-green-600">{stats.activeOptions}</div>
                  <div className="text-sm text-green-700">活跃期权</div>
                  <div className="text-xs text-green-500 mt-1">可随时兑换</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-3xl font-bold text-yellow-600">{stats.expiredOptions}</div>
                  <div className="text-sm text-yellow-700">已过期期权</div>
                  <div className="text-xs text-yellow-500 mt-1">无法使用</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">{stats.totalOptions}</div>
                  <div className="text-sm text-blue-700">总期权数</div>
                  <div className="text-xs text-blue-500 mt-1">累计获得</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'equity' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <FcxEquityCenter 
            userId="current-user"
            showTabs={false}
          />
        </div>
      )}
    </div>
  );
}