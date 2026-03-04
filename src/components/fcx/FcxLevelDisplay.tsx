'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Star,
  TrendingUp,
  Award,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

interface UserLevelInfo {
  currentLevel: string;
  nextLevel: string;
  currentScore: number;
  nextLevelScore: number;
  progress: number;
  recommendations: string[];
  metrics: {
    rating: number;
    completedOrders: number;
    totalOrders: number;
    fcx2Balance: number;
    joinDays: number;
  };
}

interface FcxLevelDisplayProps {
  userId?: string;
  className?: string;
  showRefresh?: boolean;
  onRefresh?: () => void;
}

const LEVEL_CONFIG = {
  bronze: {
    name: '青铜?,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconColor: 'text-amber-500',
    minScore: 0,
  },
  silver: {
    name: '白银?,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    iconColor: 'text-gray-500',
    minScore: 60,
  },
  gold: {
    name: '黄金?,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-500',
    minScore: 75,
  },
  diamond: {
    name: '钻石?,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-500',
    minScore: 90,
  },
};

export function FcxLevelDisplay({
  userId,
  className = '',
  showRefresh = true,
  onRefresh,
}: FcxLevelDisplayProps) {
  const [levelInfo, setLevelInfo] = useState<UserLevelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLevelInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      // 模拟API调用
      const response = await fetch(`/api/fcx/level?userId=${userId || ''}`);

      if (!response.ok) {
        throw new Error('获取等级信息失败');
      }

      const result = await response.json();

      if (result.success) {
        setLevelInfo(result.data);
      } else {
        throw new Error(result.error || '获取等级信息失败');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevelInfo();
  }, [userId]);

  const handleRefresh = () => {
    fetchLevelInfo();
    onRefresh?.();
  };

  const getLevelConfig = (level: string) => {
    return (
      LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG.bronze
    );
  };

  const renderLevelBadge = (level: string, size: 'sm' | 'md' | 'lg' = 'md') => {
    const config = getLevelConfig(level);
    const sizeClasses = {
      sm: 'text-xs px-2 py-1',
      md: 'text-sm px-3 py-1.5',
      lg: 'text-base px-4 py-2',
    };

    return (
      <Badge
        className={`${config.bgColor} ${config.borderColor} ${config.color} border ${sizeClasses[size]} font-semibold`}
      >
        <Trophy className={`w-4 h-4 mr-1 ${config.iconColor}`} />
        {config.name}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>等级信息</span>
            {showRefresh && (
              <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-red-600">
            <span>等级信息加载失败</span>
            {showRefresh && (
              <button
                onClick={handleRefresh}
                className="text-gray-500 hover:text-gray-700"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            点击重试
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!levelInfo) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>等级信息</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">暂无等级信息</p>
        </CardContent>
      </Card>
    );
  }

  const currentConfig = getLevelConfig(levelInfo.currentLevel);
  const nextConfig = getLevelConfig(levelInfo.nextLevel);

  return (
    <Card className={`${className} ${currentConfig.borderColor} border-2`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className={`w-6 h-6 ${currentConfig.iconColor}`} />
            <span>联盟等级</span>
          </div>
          {showRefresh && (
            <button
              onClick={handleRefresh}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="刷新等级信息"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 当前等级展示 */}
        <div className="text-center">
          {renderLevelBadge(levelInfo.currentLevel, 'lg')}
          <div className="mt-2 text-2xl font-bold text-gray-800">
            {levelInfo.currentScore}�?          </div>
          <div className="text-sm text-gray-500 mt-1">综合评分</div>
        </div>

        {/* 进度?*/}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className={currentConfig.color}>{currentConfig.name}</span>
            <span className={nextConfig.color}>{nextConfig.name}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`bg-gradient-to-r ${currentConfig.iconColor.replace('text-', 'from-').replace('-500', '-500')} to-${currentConfig.iconColor.replace('text-', '').replace('-500', '-600')} h-3 rounded-full transition-all duration-500`}
              style={{ width: `${levelInfo.progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{levelInfo.currentScore}�?/span>
            <span>{levelInfo.nextLevelScore}�?/span>
          </div>
        </div>

        {/* 关键指标卡片 */}
        <div className="grid grid-cols-2 gap-4">
          <div
            className={`${currentConfig.bgColor} rounded-lg p-3 border ${currentConfig.borderColor}`}
          >
            <div className="flex items-center">
              <Star className={`w-5 h-5 ${currentConfig.iconColor} mr-2`} />
              <div>
                <div className="text-lg font-semibold text-gray-800">
                  {levelInfo.metrics.rating.toFixed(1)}
                </div>
                <div className="text-xs text-gray-600">平均评分</div>
              </div>
            </div>
          </div>

          <div
            className={`${currentConfig.bgColor} rounded-lg p-3 border ${currentConfig.borderColor}`}
          >
            <div className="flex items-center">
              <TrendingUp
                className={`w-5 h-5 ${currentConfig.iconColor} mr-2`}
              />
              <div>
                <div className="text-lg font-semibold text-gray-800">
                  {levelInfo.metrics.completedOrders}
                </div>
                <div className="text-xs text-gray-600">完成订单</div>
              </div>
            </div>
          </div>

          <div
            className={`${currentConfig.bgColor} rounded-lg p-3 border ${currentConfig.borderColor}`}
          >
            <div className="flex items-center">
              <Award className={`w-5 h-5 ${currentConfig.iconColor} mr-2`} />
              <div>
                <div className="text-lg font-semibold text-gray-800">
                  {levelInfo.metrics.fcx2Balance.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">FCX2余额</div>
              </div>
            </div>
          </div>

          <div
            className={`${currentConfig.bgColor} rounded-lg p-3 border ${currentConfig.borderColor}`}
          >
            <div className="flex items-center">
              <Trophy className={`w-5 h-5 ${currentConfig.iconColor} mr-2`} />
              <div>
                <div className="text-lg font-semibold text-gray-800">
                  {Math.round(levelInfo.metrics.joinDays / 30)}个月
                </div>
                <div className="text-xs text-gray-600">入驻时长</div>
              </div>
            </div>
          </div>
        </div>

        {/* 升级建议 */}
        {levelInfo.recommendations.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 flex items-center mb-2">
              <ChevronRight className="w-4 h-4 mr-1" />
              升级建议
            </h4>
            <ul className="space-y-1">
              {levelInfo.recommendations.map((rec, index) => (
                <li
                  key={index}
                  className="text-blue-700 text-sm flex items-start"
                >
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 等级说明 */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>📊 评分规则?/div>
          <div>�?评分占比?0%</div>
          <div>�?完成率占比：25%</div>
          <div>�?订单数量占比?0%</div>
          <div>�?服务质量占比?5%</div>
          <div>�?FCX2余额占比?0%</div>
        </div>
      </CardContent>
    </Card>
  );
}
