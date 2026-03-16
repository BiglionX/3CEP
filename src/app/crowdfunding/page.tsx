'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Project {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  backers: number;
  daysLeft: number;
  creator: string;
  category: string;
  image: string;
  progress: number;
  featured: boolean;
}

export default function CrowdfundingPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('featured');

  // 模拟数据
  useEffect(() => {
    setTimeout(() => {
      setProjects([
        {
          id: '1',
          title: '智能家居维修机器',
          description:
            '一款能够自动诊断和修复常见家电故障的智能机器人，让维修变得更简单高效',
          goalAmount: 500000,
          currentAmount: 325000,
          backers: 1247,
          daysLeft: 45,
          creator: '智能科技有限公司',
          category: '科技产品',
          image: '/images/projects/smart-repair-bot.jpg',
          progress: 65,
          featured: true,
        },
        {
          id: '2',
          title: '环保手机维修材料',
          description: '研发可生物降解的手机维修材料，减少电子垃圾对环境的影响',
          goalAmount: 200000,
          currentAmount: 180000,
          backers: 892,
          daysLeft: 12,
          creator: '绿色环保创新团队',
          category: '环保科技',
          image: '/images/projects/eco-materials.jpg',
          progress: 90,
          featured: true,
        },
        {
          id: '3',
          title: '便携式手机维修工具包',
          description:
            '专为手机维修师设计的一站式便携工具包，集成了所有必需的精密工具',
          goalAmount: 150000,
          currentAmount: 98000,
          backers: 2156,
          daysLeft: 78,
          creator: '专业工具制造商',
          category: '工具设备',
          image: '/images/projects/tool-kit.jpg',
          progress: 65,
          featured: true,
        },
        {
          id: '4',
          title: 'AI手机故障诊断系统',
          description:
            '基于人工智能的手机故障快速诊断系统，提高维修准确率和效率',
          goalAmount: 300000,
          currentAmount: 75000,
          backers: 432,
          daysLeft: 120,
          creator: 'AI技术研究院',
          category: '软件服务',
          image: '/images/projects/ai-diagnosis.jpg',
          progress: 25,
          featured: true,
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const featuredProjects = projects.filter(p => p.featured);
  const allProjects = projects;
  const popularProjects = [...projects].sort((a, b) => b.backers - a.backers);
  const endingSoonProjects = [...projects].sort(
    (a, b) => a.daysLeft - b.daysLeft
  );

  const getCurrentProjects = () => {
    switch (activeTab) {
      case 'featured':
        return featuredProjects;
      case 'popular':
        return popularProjects;
      case 'ending':
        return endingSoonProjects;
      default:
        return allProjects;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            创新众筹平台
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            发现和支持改变手机维修行业的创新项目，共同推动行业发{' '}
          </p>
        </div>

        {/* 统计数据 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-gray-900">2,847</p>
              <p className="text-gray-600">支持</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-gray-900">¥1.2M+</p>
              <p className="text-gray-600">筹集资金</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-gray-900">42</p>
              <p className="text-gray-600">成功项目</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-gray-900">98%</p>
              <p className="text-gray-600">成功</p>
            </CardContent>
          </Card>
        </div>

        {/* 项目分类导航 */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'featured', name: '精选推', icon: Star },
            { id: 'all', name: '全部项目', icon: Users },
            { id: 'popular', name: '热门项目', icon: TrendingUp },
            { id: 'ending', name: '即将结束', icon: Clock },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center"
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </Button>
            );
          })}
        </div>

        {/* 项目列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {getCurrentProjects().map(project => (
            <Card
              key={project.id}
              className="overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative">
                <div className="bg-gray-200 aspect-video flex items-center justify-center">
                  <Star className="w-12 h-12 text-gray-400" />
                </div>

                {project.featured && (
                  <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    精{' '}
                  </div>
                )}

                <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-full p-2">
                  <HeartIcon />
                </div>
              </div>

              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-blue-600 font-medium">
                      {project.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      {project.daysLeft}天剩{' '}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {project.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {project.description}
                  </p>
                </div>

                {/* 进度*/}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">
                      {formatCurrency(project.currentAmount)}
                    </span>
                    <span className="text-gray-600">
                      目标 {formatCurrency(project.goalAmount)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* 统计信息 */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {project.backers} 支持{' '}
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                    {Math.round(project.progress)}% 达成
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <Button className="flex-1">支持项目</Button>
                  <Button variant="outline">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {getCurrentProjects().length === 0 && (
          <div className="text-center py-16">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">暂无项目</h3>
            <p className="text-gray-600">
              当前分类下还没有项目，敬请期待更多创新项{' '}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// 简单的心形图标组件
function HeartIcon() {
  return (
    <svg
      className="w-5 h-5 text-gray-600 hover:text-red-500 cursor-pointer transition-colors"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}
