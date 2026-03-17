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
  Calendar,
  TrendingUp,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  ShoppingCart,
  Plus,
} from 'lucide-react';

interface AgentSubscription {
  id: string;
  name: string;
  type: 'customer-service' | 'sales' | 'support' | 'custom';
  status: 'active' | 'expiring' | 'expired';
  startDate: string;
  endDate: string;
  usage: {
    totalRequests: number;
    totalTokens: number;
    avgResponseTime: number;
  };
  price: number;
  plan: 'basic' | 'standard' | 'premium';
}

export default function ForeignTradeAgentsPage() {
  const [subscriptions] = useState<AgentSubscription[]>([
    {
      id: '1',
      name: '多语言客服助手',
      type: 'customer-service',
      status: 'active',
      startDate: '2025-01-01',
      endDate: '2025-06-01',
      usage: {
        totalRequests: 12520,
        totalTokens: 98765,
        avgResponseTime: 0.6,
      },
      price: 1299,
      plan: 'standard',
    },
    {
      id: '2',
      name: '外贸订单助手',
      type: 'sales',
      status: 'expiring',
      startDate: '2024-12-01',
      endDate: '2025-03-17',
      usage: {
        totalRequests: 7230,
        totalTokens: 54230,
        avgResponseTime: 0.7,
      },
      price: 1799,
      plan: 'premium',
    },
    {
      id: '3',
      name: '物流跟踪助手',
      type: 'support',
      status: 'active',
      startDate: '2025-02-01',
      endDate: '2025-08-01',
      usage: {
        totalRequests: 4920,
        totalTokens: 38150,
        avgResponseTime: 0.5,
      },
      price: 999,
      plan: 'standard',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'expiring':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'expired':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '运行中';
      case 'expiring':
        return '即将到期';
      case 'expired':
        return '已过期';
      default:
        return status;
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'premium':
        return 'bg-purple-100 text-purple-700';
      case 'standard':
        return 'bg-blue-100 text-blue-700';
      case 'basic':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPlanText = (plan: string) => {
    switch (plan) {
      case 'premium':
        return '高级版';
      case 'standard':
        return '标准版';
      case 'basic':
        return '基础版';
      default:
        return plan;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">智能体管理</h1>
            <p className="mt-2 text-gray-600">
              管理您的AI智能体订阅、查看使用情况和续费信息
            </p>
          </div>
          <Link href="/agent-store">
            <Button className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              订阅新智能体
            </Button>
          </Link>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总智能体</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscriptions.length}</div>
              <p className="text-xs text-muted-foreground">已订阅服务</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">运行中</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscriptions.filter(s => s.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">正常服务</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">即将到期</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subscriptions.filter(s => s.status === 'expiring').length}
              </div>
              <p className="text-xs text-muted-foreground">需要续费</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总支出</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ¥
                {subscriptions
                  .reduce((sum, s) => sum + s.price, 0)
                  .toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">月度费用</p>
            </CardContent>
          </Card>
        </div>

        {/* 智能体列表 */}
        <Card>
          <CardHeader>
            <CardTitle>已订阅的智能体</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {subscriptions.map(subscription => (
                <div
                  key={subscription.id}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {subscription.name}
                        </h3>
                        <Badge className={getStatusColor(subscription.status)}>
                          <Clock className="w-3 h-3 mr-1" />
                          {getStatusText(subscription.status)}
                        </Badge>
                        <Badge className={getPlanColor(subscription.plan)}>
                          {getPlanText(subscription.plan)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        ¥{subscription.price.toLocaleString()}/月 •{' '}
                        {getPlanText(subscription.plan)}
                      </p>
                    </div>
                    <Link href="/agent-store">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        续费
                      </Button>
                    </Link>
                  </div>

                  {/* 到期信息 */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          订阅时间: {subscription.startDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          到期时间: {subscription.endDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700">
                          剩余 {getDaysRemaining(subscription.endDate)} 天
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 使用统计 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">总请求数</span>
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="text-2xl font-bold text-blue-700 mt-2">
                        {subscription.usage.totalRequests.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Token消耗</span>
                        <Bot className="w-4 h-4 text-green-500" />
                      </div>
                      <div className="text-2xl font-bold text-green-700 mt-2">
                        {subscription.usage.totalTokens.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">平均响应</span>
                        <Clock className="w-4 h-4 text-purple-500" />
                      </div>
                      <div className="text-2xl font-bold text-purple-700 mt-2">
                        {subscription.usage.avgResponseTime}s
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 快捷操作 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/agent-store">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Plus className="w-6 h-6 text-blue-500" />
                  <CardTitle>订阅新智能体</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  浏览智能体商店，选择适合您业务的AI智能体
                </p>
              </CardContent>
            </Link>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-green-500" />
                <CardTitle>管理订阅</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                查看和管理所有已订阅的智能体服务
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <ExternalLink className="w-6 h-6 text-purple-500" />
                <CardTitle>API文档</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                查看智能体API文档，快速集成到您的系统
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
