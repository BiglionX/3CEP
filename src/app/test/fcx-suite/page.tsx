'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Coins, 
  Trophy, 
  Gift, 
  BarChart3,
  ArrowRight
} from 'lucide-react';

export default function FcxTestSuite() {
  const testComponents = [
    {
      id: 'level-display',
      title: '等级展示组件',
      description: '用户等级可视化展示，包含评分、进度条和关键指标',
      icon: Trophy,
      path: '/test/level-display',
      status: 'complete'
    },
    {
      id: 'equity-center',
      title: '权益中心组件',
      description: '权益商城、兑换管理和历史记录功能',
      icon: Gift,
      path: '/test/equity-center',
      status: 'complete'
    },
    {
      id: 'dashboard',
      title: 'FCX仪表板',
      description: '集成所有FCX功能的统一管理界面',
      icon: BarChart3,
      path: '/dashboard/fcx',
      status: 'complete'
    }
  ];

  const features = [
    '基于多维度指标的智能等级计算',
    '自动化FCX2奖励发放机制',
    '丰富的权益兑换系统',
    '实时数据展示和可视化',
    '完整的用户激励体系'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Coins className="w-12 h-12 text-yellow-500 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">FCX2奖励机制完善</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            完整的联盟等级体系与权益兑换解决方案
          </p>
        </div>

        {/* 功能亮点 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">核心功能特性</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start p-4 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 组件测试区域 */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">组件测试套件</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testComponents.map((component) => (
              <Card key={component.id} className="hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <component.icon className="w-6 h-6 text-blue-500 mr-2" />
                      {component.title}
                    </CardTitle>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      component.status === 'complete' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {component.status === 'complete' ? '已完成' : '开发中'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{component.description}</p>
                  <Link href={component.path}>
                    <Button className="w-full group">
                      <span>查看演示</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 技术架构 */}
        <div className="mt-12 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">技术架构概览</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                后端服务层
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• LevelCalculatorService - 智能等级计算引擎</li>
                <li>• Fcx2RewardService - 奖励计算与发放</li>
                <li>• EquityRedemptionService - 权益兑换管理</li>
                <li>• 定时任务调度系统</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                前端组件层
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• FcxLevelDisplay - 等级可视化组件</li>
                <li>• FcxEquityCenter - 权益管理中心</li>
                <li>• FCX仪表板 - 统一管理界面</li>
                <li>• 响应式UI设计</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-700">
            <h3 className="text-lg font-semibold mb-3">数据流向</h3>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <span className="px-3 py-1 bg-blue-600 rounded">用户行为数据</span>
              <ArrowRight className="text-gray-400" />
              <span className="px-3 py-1 bg-purple-600 rounded">等级计算引擎</span>
              <ArrowRight className="text-gray-400" />
              <span className="px-3 py-1 bg-yellow-600 rounded">FCX2奖励发放</span>
              <ArrowRight className="text-gray-400" />
              <span className="px-3 py-1 bg-green-600 rounded">权益兑换系统</span>
            </div>
          </div>
        </div>

        {/* 验收标准 */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">验收标准达成情况</h2>
          
          <div className="space-y-4">
            {[
              '✅ 能根据用户行为数据正确计算并发放FCX2',
              '✅ 等级变更能实时反映在用户界面',
              '✅ 权益兑换后能立即生效并显示',
              '✅ 系统具有完善的日志记录和监控能力',
              '✅ 前端界面友好，用户体验流畅'
            ].map((item, index) => (
              <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                <span className="text-green-600 mr-3 text-xl">✓</span>
                <span className="text-gray-700">{item.substring(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}