'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Tutorial {
  id: string;
  device_model: string;
  fault_type: string;
  title: string;
  description: string;
  steps: Array<{
    id: string;
    title: string;
    description: string;
    image_url: string;
    estimated_time: number;
  }>;
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

export default function TutorialDetailPage() {
  const params = useParams();
  const tutorialId = params.id as string;
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchTutorial = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/tutorials/${tutorialId}`);
        const result = await response.json();

        if (response.ok) {
          setTutorial(result.tutorial);
        } else {
          console.error('获取教程详情失败:', result.error);
        }
      } catch (error) {
        console.error('获取教程详情错误:', error);
      } finally {
        setLoading(false);
      }
    };

    if (tutorialId) {
      fetchTutorial();
    }
  }, [tutorialId]);

  const handleLike = () => {
    setLiked(!liked);
    // 这里可以发送喜欢请求到后端
  };

  const getDifficultyText = (level: number) => {
    const difficulties = ['入门', '简单', '中等', '困难', '专家'];
    return difficulties[level - 1] || '未知';
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

  if (!tutorial) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.881-6.08 2.32M9 5.5a7.962 7.962 0 016 0M9 5.5a7.962 7.962 0 00-6 0M9 5.5a7.962 7.962 0 016 0"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">教程未找到</h3>
          <p className="mt-1 text-gray-500">
            抱歉，您要查找的教程不存在或已被删除。
          </p>
          <div className="mt-6">
            <Link
              href="/tutorials"
              className="text-blue-600 hover:text-blue-500"
            >
              ← 返回教程中心
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                ProdCycleAI DIY
              </Link>
            </div>
            <nav>
              <Link
                href="/tutorials"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                ← 返回教程中心
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 教程内容 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 教程标题和基本信息 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {tutorial.device_model}
              </span>
              <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {tutorial.fault_type}
              </span>
            </div>
            <div className="mt-2 md:mt-0 flex items-center space-x-4">
              <div className="flex items-center text-gray-500">
                <svg
                  className="w-5 h-5 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                {tutorial.estimated_time}分钟
              </div>
              <div className="flex items-center text-gray-500">
                <svg
                  className="w-5 h-5 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {tutorial.like_count + (liked  1 : 0)}
              </div>
              <div className="flex items-center text-gray-500">
                <svg
                  className="w-5 h-5 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {tutorial.view_count + 1}
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {tutorial.title}
          </h1>

          <p className="text-gray-600 mb-6">{tutorial.description}</p>

          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              难度: {getDifficultyText(tutorial.difficulty_level)}
            </span>
            {tutorial.tools.length > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                工具: {tutorial.tools.length}项
              </span>
            )}
            {tutorial.parts.length > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                配件: {tutorial.parts.length}项
              </span>
            )}
          </div>
        </div>

        {/* 视频教程 */}
        {tutorial.video_url && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              视频教程
            </h2>
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
              <a
                href={tutorial.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg
                  className="w-8 h-8 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                观看视频教程
              </a>
            </div>
          </div>
        )}

        {/* 维修步骤 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">维修步骤</h2>

          <div className="space-y-8">
            {tutorial.steps.map((step, index) => (
              <div key={step.id} className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-500 text-white">
                    {index + 1}
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      {step.title}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {step.estimated_time}分钟
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600">{step.description}</p>
                  {step.image_url && (
                    <div className="mt-3">
                      <img
                        src={step.image_url}
                        alt={step.title}
                        className="rounded-lg shadow-sm max-w-full h-auto"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 所需工具和配件 */}
        {(tutorial.tools.length > 0 || tutorial.parts.length > 0) && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              所需物品
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tutorial.tools.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    所需工具
                  </h3>
                  <ul className="space-y-2">
                    {tutorial.tools.map((tool, index) => (
                      <li key={index} className="flex items-center">
                        <svg
                          className="w-4 h-4 text-green-500 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {tool}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {tutorial.parts.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    所需配件
                  </h3>
                  <ul className="space-y-2">
                    {tutorial.parts.map((part, index) => (
                      <li key={index} className="flex items-center">
                        <svg
                          className="w-4 h-4 text-green-500 mr-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {part}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleLike}
                variant={liked  'default' : 'outline'}
                className={liked  'bg-red-500 hover:bg-red-600' : ''}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill={liked  'white' : 'currentColor'}
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
                {liked  '已喜欢' : '喜欢'} (
                {tutorial.like_count + (liked  1 : 0)})
              </Button>

              <Button variant="outline">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                分享
              </Button>
            </div>

            <div className="flex space-x-3">
              <Link href="/tutorials">
                <Button variant="outline">返回教程中心</Button>
              </Link>
              <Button>开始维修</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
