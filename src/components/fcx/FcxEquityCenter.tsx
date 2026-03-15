'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Gift, 
  ShoppingCart, 
  History, 
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

interface EquityType {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  levelRequirement: string;
  validityDays: number;
  maxRedemptions: number;
  dailyLimit: number;
  isActive: boolean;
  availability?: {
    available: boolean;
    reason?: string;
    maxQuantity: number;
  };
}

interface UserEquity {
  id: string;
  equityTypeId: string;
  equityTypeName: string;
  cost: number;
  redeemedAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'used';
  metadata: Record<string, any>;
}

interface FcxEquityCenterProps {
  userId?: string;
  className?: string;
  showTabs?: boolean;
}

type TabType = 'market' | 'my-equities' | 'history';

const EQUITY_ICONS: Record<string, string> = {
  'priority-order': '🚀',
  'discount-coupon': '🎫',
  'free-service': '🔧',
  'vip-support': '👑',
  'express-delivery': '🚚',
  'extended-warranty': '🛡️'
};

export function FcxEquityCenter({ 
  userId, 
  className = '',
  showTabs = true
}: FcxEquityCenterProps) {
  const [activeTab, setActiveTab] = useState<TabType>('market');
  const [equities, setEquities] = useState<EquityType[]>([]);
  const [userEquities, setUserEquities] = useState<UserEquity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const fetchEquities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/fcx/equity?action=list&userId=${userId || ''}`);
      
      if (!response.ok) {
        throw new Error('获取权益列表失败');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // 为每个权益检查可用?
        const equitiesWithAvailability = await Promise.all(
          result.data.equities.map(async (equity: EquityType) => {
            const availabilityResponse = await fetch(
              `/api/fcx/equity?action=check-availability&equityTypeId=${equity.id}&userId=${userId || ''}`
            );
            
            if (availabilityResponse.ok) {
              const availabilityResult = await availabilityResponse.json();
              if (availabilityResult.success) {
                return { ...equity, availability: availabilityResult.data };
              }
            }
            return equity;
          })
        );
        
        setEquities(equitiesWithAvailability);
      } else {
        throw new Error(result.error || '获取权益列表失败');
      }
      
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEquities = async () => {
    try {
      const response = await fetch(`/api/fcx/equity?action=my-equities&userId=${userId || ''}`);
      
      if (!response.ok) {
        throw new Error('获取我的权益失败');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setUserEquities(result.data.equities);
      }
      
    } catch (err) {
      console.error('获取用户权益错误:', err);
    }
  };

  const handleRedeem = async (equityId: string, quantity: number = 1) => {
    try {
      setRedeeming(equityId);
      
      const response = await fetch('/api/fcx/equity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'redeem',
          equityTypeId: equityId,
          quantity
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`成功兑换 ${result.message}`);
        // 刷新数据
        await Promise.all([fetchEquities(), fetchUserEquities()]);
      } else {
        alert(`兑换失败: ${result.error}`);
      }
      
    } catch (err) {
      alert(`兑换过程中发生错? ${(err as Error).message}`);
    } finally {
      setRedeeming(null);
    }
  };

  const filteredEquities = equities.filter(equity => {
    const matchesSearch = equity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equity.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = selectedLevel === 'all' || equity.levelRequirement === selectedLevel;
    
    return matchesSearch && matchesLevel;
  });

  useEffect(() => {
    fetchEquities();
    fetchUserEquities();
  }, [userId]);

  const renderEquityCard = (equity: EquityType) => {
    const icon = EQUITY_ICONS[equity.icon] || '🎁';
    const isAvailable = equity?.available ?? true;
    const maxQuantity = equity?.maxQuantity ?? 1;
    
    return (
      <Card key={equity.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{icon}</div>
              <div>
                <CardTitle className="text-lg">{equity.name}</CardTitle>
                <Badge variant="secondary" className="mt-1">
                  {equity.levelRequirement}级可兑换
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {equity.cost}
              </div>
              <div className="text-xs text-gray-500">FCX2</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-gray-600 mb-4">{equity.description}</p>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {equity.validityDays}天有效期
            </div>
            <div>
              限购{equity.maxRedemptions === -1 ? '无限? : `${equity.maxRedemptions}次`}
            </div>
          </div>
          
          {!isAvailable && equity?.reason && (
            <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              {equity.availability.reason}
            </div>
          )}
          
          <Button
            className="w-full"
            disabled={!isAvailable || maxQuantity <= 0 || !!redeeming}
            onClick={() => handleRedeem(equity.id, 1)}
          >
            {redeeming === equity.id ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                兑换?..
              </>
            ) : isAvailable ? (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                立即兑换
              </>
            ) : (
              '不可兑换'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  const renderUserEquityCard = (userEquity: UserEquity) => {
    const icon = '🎁'; // 简化处?
    const isExpired = new Date(userEquity.expiresAt) < new Date();
    const statusColor = userEquity.status === 'active' && !isExpired 
      ? 'text-green-600' 
      : 'text-gray-500';
    
    return (
      <Card key={userEquity.id} className={`${isExpired ? 'opacity-75' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-xl">{icon}</div>
              <div>
                <h3 className="font-semibold">{userEquity.equityTypeName}</h3>
                <p className="text-sm text-gray-500">
                  兑换时间: {new Date(userEquity.redeemedAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  到期时间: {new Date(userEquity.expiresAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`font-semibold ${statusColor}`}>
                {isExpired ? '已过? : userEquity.status === 'used' ? '已使? : '有效期内'}
              </div>
              <div className="text-sm text-gray-500">
                {userEquity.cost} FCX2
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>权益中心</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-red-600">加载失败</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
          <Button 
            onClick={fetchEquities}
            className="mt-2"
          >
            重新加载
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {showTabs && (
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {([
            { id: 'market', label: '权益商城', icon: ShoppingCart },
            { id: 'my-equities', label: '我的权益', icon: Gift },
            { id: 'history', label: '兑换历史', icon: History }
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === id 
                  ? 'bg-white shadow-sm text-blue-600' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}

      {activeTab === 'market' && (
        <div>
          {/* 搜索和筛?*/}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="搜索权益名称或描?.."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="all">全部等级</option>
                <option value="bronze">青铜?/option>
                <option value="silver">白银?/option>
                <option value="gold">黄金?/option>
                <option value="diamond">钻石?/option>
              </select>
            </div>
          </div>

          {/* 权益列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquities.map(renderEquityCard)}
          </div>
          
          {filteredEquities.length === 0 && (
            <div className="text-center py-12">
              <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无符合条件的权?/p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'my-equities' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">我的权益</h3>
          <div className="space-y-4">
            {userEquities
              .filter(eq => eq.status === 'active')
              .map(renderUserEquityCard)}
            
            {userEquities.filter(eq => eq.status === 'active').length === 0 && (
              <div className="text-center py-12">
                <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">您还没有兑换任何权益</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div>
          <h3 className="text-lg font-semibold mb-4">兑换历史</h3>
          <div className="space-y-4">
            {userEquities.map(renderUserEquityCard)}
            
            {userEquities.length === 0 && (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">暂无兑换记录</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}