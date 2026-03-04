'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { StepByStepTutorial } from '@/components/tutorial/StepByStepTutorial';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Clock,
  Users,
  Star,
  Hammer,
  Wrench,
  AlertCircle,
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  video_url?: string;
  estimated_time: number;
  tips?: string[];
  warnings?: string[];
}

interface Tutorial {
  id: string;
  device_model: string;
  fault_type: string;
  title: string;
  description: string;
  steps: TutorialStep[];
  video_url: string | null;
  tools: string[];
  parts: string[];
  cover_image: string | null;
  difficulty_level: number;
  estimated_time: number;
  view_count: number;
  like_count: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
}

export default function TutorialStepByStepPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tutorialId = params.id as string;
  const deviceModel = searchParams.get('model');
  const faultType = searchParams.get('fault');

  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTutorial = async () => {
      try {
        setLoading(true);
        setError(null);

        let apiUrl = '';
        if (tutorialId) {
          // 通过ID获取教程
          apiUrl = `/api/tutorials/${tutorialId}`;
        } else if (deviceModel && faultType) {
          // 通过设备型号和故障类型获取教程
          apiUrl = `/api/tutorials?deviceModel=${encodeURIComponent(deviceModel)}&faultType=${encodeURIComponent(faultType)}&pageSize=1`;
        }

        if (!apiUrl) {
          throw new Error('缺少必要的参数');
        }

        const response = await fetch(apiUrl);
        const result = await response.json();

        if (response.ok) {
          if (tutorialId) {
            setTutorial(result.tutorial);
          } else {
            // 从列表中获取第一个教程
            const tutorials = result.tutorials || [];
            if (tutorials.length > 0) {
              setTutorial(tutorials[0]);
            } else {
              throw new Error('未找到匹配的教程');
            }
          }
        } else {
          throw new Error(result.error || '获取教程失败');
        }
      } catch (err: any) {
        console.error('获取教程失败:', err);
        setError(err.message || '获取教程时发生错误');
      } finally {
        setLoading(false);
      }
    };

    if (tutorialId || (deviceModel && faultType)) {
      fetchTutorial();
    }
  }, [tutorialId, deviceModel, faultType]);

  const getDifficultyText = (level: number) => {
    const difficulties = ['入门', '简单', '中等', '困难', '专家'];
    return difficulties[level - 1] || '未知';
  };

  const getDifficultyColor = (level: number) => {
    const colors = [
      'bg-green-100 text-green-800',
      'bg-blue-100 text-blue-800',
      'bg-yellow-100 text-yellow-800',
      'bg-orange-100 text-orange-800',
      'bg-red-100 text-red-800',
    ];
    return colors[level - 1] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载教程中...</p>
        </div>
      </div>
    );
  }

  if (error || !tutorial) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">教程未找到</h1>
          <p className="text-gray-600 mb-6">
            {error || '抱歉，您要查找的教程不存在或已被删除。'}
          </p>
          <div className="space-y-3">
            <Link href="/tutorials">
              <Button className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回教程中心
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                返回首页
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/tutorials"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                教程中心
              </Link>
              <span className="text-gray-300">|</span>
              <h1 className="text-lg font-medium text-gray-900 truncate max-w-md">
                {tutorial.title}
              </h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{tutorial.estimated_time}分钟</span>
              <Star className="w-4 h-4 ml-2" />
              <span>{tutorial.difficulty_level}级难度</span>
            </div>
          </div>
        </div>
      </header>

      {/* 教程概览区域 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(tutorial.difficulty_level)}`}
                >
                  {getDifficultyText(tutorial.difficulty_level)}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {tutorial.device_model}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {tutorial.fault_type}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {tutorial.title}
              </h1>

              <p className="text-gray-600 mb-4">{tutorial.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{tutorial.view_count.toLocaleString()}次浏览</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  <span>{tutorial.like_count}个赞</span>
                </div>
                <div className="flex items-center">
                  <Hammer className="w-4 h-4 mr-1" />
                  <span>{tutorial.tools.length}个工具</span>
                </div>
                <div className="flex items-center">
                  <Wrench className="w-4 h-4 mr-1" />
                  <span>{tutorial.parts.length}个配件</span>
                </div>
              </div>
            </div>

            {tutorial.cover_image && (
              <div className="lg:w-64 flex-shrink-0">
                <img
                  src={tutorial.cover_image}
                  alt={tutorial.title}
                  className="w-full h-48 object-cover rounded-lg shadow-md"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <StepByStepTutorial
            tutorial={tutorial}
            onComplete={() => {
              // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('教程完成!')// 可以在这里添加完成后的逻辑，比如显示完成弹窗、更新用户进度等
            }}
          />
        </div>
      </main>
    </div>
  );
}
