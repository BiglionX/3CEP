'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowRight,
  ExternalLink,
  Heart,
  RefreshCw,
  Smartphone,
  Star,
  Tag,
  Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface UpgradeRecommendation {
  oldModel: string;
  newModel: string;
  brand: string;
  category: string;
  predictedTradeValue: number;
  discountAmount: number;
  discountRate: number;
  recommendationScore: number;
  recommendationReason: string;
  expiresAt: string;
  isNew?: boolean;
}

interface UpgradeRecommendationProps {
  userId: string;
  limit?: number;
  className?: string;
  onRecommendationClick?: (recommendation: UpgradeRecommendation) => void;
  onConversion?: (recommendation: UpgradeRecommendation) => void;
}

const UpgradeRecommendationCard: React.FC<{
  recommendation: UpgradeRecommendation;
  onCardClick: (rec: UpgradeRecommendation) => void;
  onConvert: (rec: UpgradeRecommendation) => void;
}> = ({ recommendation, onCardClick, onConvert }) => {
  const {
    oldModel,
    newModel,
    brand,
    predictedTradeValue,
    discountAmount,
    discountRate,
    recommendationScore,
    recommendationReason,
    isNew,
  } = recommendation;

  // 计算推荐等级
  const getRecommendationLevel = (score: number) => {
    if (score >= 0.8)
      return { level: '强烈推荐', color: 'text-red-600', bg: 'bg-red-50' };
    if (score >= 0.6)
      return { level: '推荐', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { level: '可考虑', color: 'text-yellow-600', bg: 'bg-yellow-50' };
  };

  const levelInfo = getRecommendationLevel(recommendationScore);

  return (
    <Card
      className="hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-l-blue-500 hover:border-l-blue-600"
      onClick={() => onCardClick(recommendation)}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg font-bold text-gray-900">
              {brand} {newModel}
            </CardTitle>
            {isNew && (
              <Badge variant="destructive" className="ml-2">
                NEW
              </Badge>
            )}
          </div>
          <Badge className={`${levelInfo.bg} ${levelInfo.color} font-semibold`}>
            {levelInfo.level}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>从 {oldModel} 升级</span>
          <ArrowRight className="h-4 w-4" />
          <span className="font-semibold">{newModel}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 优惠信息 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Tag className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                预估回收价值
              </span>
            </div>
            <p className="text-xl font-bold text-green-700">
              ¥{predictedTradeValue.toFixed(0)}
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                升级折扣
              </span>
            </div>
            <p className="text-xl font-bold text-blue-700">
              ¥{discountAmount.toFixed(0)}
            </p>
            <p className="text-xs text-blue-600">
              ({(discountRate * 100).toFixed(0)}% 折扣)
            </p>
          </div>
        </div>

        {/* 推荐理由 */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">推荐理由</p>
              <p className="text-sm text-gray-600">{recommendationReason}</p>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 pt-2">
          <Button
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={e => {
              e.stopPropagation();
              onConvert(recommendation);
            }}
          >
            <Heart className="h-4 w-4 mr-2" />
            立即升级
          </Button>

          <Button
            variant="outline"
            className="flex-1"
            onClick={e => {
              e.stopPropagation();
              // 可以跳转到产品详情页
              window.open(`/products/${brand}/${newModel}`, '_blank');
            }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            了解更多
          </Button>
        </div>

        {/* 推荐得分可视化 */}
        <div className="pt-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>推荐指数</span>
            <span>{(recommendationScore * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${recommendationScore * 100}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const UpgradeRecommendationList: React.FC<UpgradeRecommendationProps> = ({
  userId,
  limit = 5,
  className = '',
  onRecommendationClick,
  onConversion,
}) => {
  const [recommendations, setRecommendations] = useState<
    UpgradeRecommendation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const url = forceRefresh
        ? '/api/crowdfunding/recommend'
        : `/api/crowdfunding/recommend?userId=${userId}&limit=${limit}`;

      const response = await fetch(url, {
        method: forceRefresh ? 'POST' : 'GET',
        ...(forceRefresh && {
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, limit }),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setRecommendations(result.data);
      } else {
        setError(result.message || '获取推荐失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('获取推荐失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendationClick = async (
    recommendation: UpgradeRecommendation
  ) => {
    try {
      // 记录点击
      await fetch('/api/crowdfunding/recommend/click', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          oldModel: recommendation.oldModel,
          newModel: recommendation.newModel,
        }),
      });

      // 调用外部回调
      onRecommendationClick?.(recommendation);
    } catch (err) {
      console.error('记录点击失败:', err);
    }
  };

  const handleConversion = async (recommendation: UpgradeRecommendation) => {
    try {
      // 记录转化
      await fetch('/api/crowdfunding/recommend/conversion', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          oldModel: recommendation.oldModel,
          newModel: recommendation.newModel,
        }),
      });

      // 调用外部回调
      onConversion?.(recommendation);

      // 可以跳转到购买页面
      window.open(
        `/crowdfunding/projects?search=${recommendation.newModel}`,
        '_blank'
      );
    } catch (err) {
      console.error('记录转化失败:', err);
    }
  };

  // 组件挂载时获取推荐
  useEffect(() => {
    if (userId) {
      fetchRecommendations();
    }
  }, [userId, limit]);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className={`${className} border-red-200`}>
        <CardContent className="p-6 text-center">
          <div className="text-red-500 mb-2">
            <svg
              className="h-12 w-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            获取推荐失败
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => fetchRecommendations()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            重新加载
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <Smartphone className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            暂无升级推荐
          </h3>
          <p className="text-gray-500 mb-4">
            我们会根据您的设备使用历史为您提供个性化的升级建议
          </p>
          <Button onClick={() => fetchRecommendations(true)} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新推荐
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="h-6 w-6 text-blue-600" />
          为您推荐的升级方案
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchRecommendations(true)}
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
          />
          刷新
        </Button>
      </div>

      <div className="space-y-4">
        {recommendations.map((recommendation, index) => (
          <UpgradeRecommendationCard
            key={`${recommendation.brand}-${recommendation.newModel}-${index}`}
            recommendation={recommendation}
            onCardClick={handleRecommendationClick}
            onConvert={handleConversion}
          />
        ))}
      </div>

      <div className="text-center text-sm text-gray-500 pt-4">
        基于您的设备使用历史和市场行情，为您精选最适合的升级方案
      </div>
    </div>
  );
};

export default UpgradeRecommendationList;
