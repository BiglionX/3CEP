'use client';

import React, { useState } from 'react';
import UpgradeRecommendationList from '@/components/crowdfunding/UpgradeRecommendationList';

interface Recommendation {
  oldModel: string;
  newModel: string;
  brand: string;
  [key: string]: any;
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Smartphone, Zap, TrendingUp } from 'lucide-react';

const UpgradeRecommendationDemo = () => {
  // @ts-ignore
  const [userId, setUserId] = useState('demo-user-001');
  const [showRecommendations, setShowRecommendations] = useState(false);

  const handleRecommendationClick = (recommendation: Recommendation) => {
    console.log('用户点击推荐:', recommendation);
    alert(
      `您点击了?${recommendation.oldModel} 升级?${recommendation.newModel} 的推荐！`
    );
  };

  const handleConversion = (recommendation: Recommendation) => {
    console.log('用户准备升级:', recommendation);
    alert(`即将为您跳转?${recommendation.newModel} 的购买页面！`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 页面头部 */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-full">
              <Smartphone className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            智能升级推荐系统
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            基于您的设备使用历史，为您推荐最适合的机型升级方案，
            享受以旧换新专属优惠
          </p>
        </div>

        {/* 用户ID输入区域 */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              体验个性化推荐
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户ID
                </label>
                <Input
                  type="text"
                  value={userId}
                  onChange={e => setUserId(e.target.value)}
                  placeholder="请输入用户ID"
                  className="w-full"
                />
              </div>
              <div className="flex items-end">
                <Button
                  size="lg"
                  onClick={() => setShowRecommendations(true)}
                  disabled={!userId || showRecommendations}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <TrendingUp className="h-5 w-5 mr-2" />
                  获取推荐
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              输入任意用户ID即可体验升级推荐功能
            </p>
          </CardContent>
        </Card>

        {/* 推荐展示区域 */}
        {showRecommendations && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                为您推荐的升级方?              </CardTitle>
            </CardHeader>
            <CardContent>
              <UpgradeRecommendationList
                userId={userId}
                limit={5}
                className="mb-6"
                onRecommendationClick={handleRecommendationClick}
                onConversion={handleConversion}
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">
                  💡 功能特色
                </h3>
                <ul className="text-blue-700 space-y-1 text-sm">
                  <li>�?基于设备使用历史的智能推荐算?/li>
                  <li>�?实时计算以旧换新优惠金额</li>
                  <li>�?个性化推荐得分和优先级排序</li>
                  <li>�?完整的用户行为追踪和分析</li>
                  <li>�?响应式设计，支持多端访问</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 功能介绍 */}
        {!showRecommendations && (
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>智能识别</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  自动识别用户历史设备，包括购买记录和扫码行为
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>精准推荐</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  基于新旧机型映射关系，提供个性化升级建议
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>优惠计算</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  实时计算以旧换新价值和专属折扣优惠
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpgradeRecommendationDemo;

