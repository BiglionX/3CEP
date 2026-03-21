'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
// 培训用途：isPlayingVideo 和 setIsPlayingVideo 保留用于后续功能演示

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Loader2,
  ShoppingBag,
  ShoppingCart,
  Video,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  video_url?: string;
  estimated_time: number;
  tips?: string[];
  warnings?: string[];
  required_parts?: string[]; // 新增：该步骤所需的配?
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

interface AffiliateLink {
  id: string;
  part_name: string;
  platform: string;
  finalUrl: string;
  trackingParams: Record<string, string>;
}

interface StepByStepTutorialProps {
  tutorial: Tutorial;
  onComplete?: () => void;
}

export function StepByStepTutorial({
  tutorial,
  onComplete,
}: StepByStepTutorialProps): ReactNode {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(
    new Array(tutorial.steps.length).fill(false)
  );
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [affiliateLinks, setAffiliateLinks] = useState<
    Record<string, AffiliateLink[]>
  >({});
  const [loadingLinks, setLoadingLinks] = useState<Record<string, boolean>>({});

  const currentStep = tutorial.steps[currentStepIndex];
  const totalSteps = tutorial.steps.length;

  // 标记当前步骤为已完成
  const markStepAsComplete = (index: number) => {
    const newCompletedSteps = [...completedSteps];
    newCompletedSteps[index] = true;
    setCompletedSteps(newCompletedSteps);
  };

  // 上一步
  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // 下一步
  const goToNextStep = () => {
    markStepAsComplete(currentStepIndex);
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // 最后一步完成
      if (onComplete) {
        onComplete();
      }
    }
  };

  // 跳转到指定步骤
  const goToStep = (index: number) => {
    if (index >= 0 && index < totalSteps) {
      setCurrentStepIndex(index);
    }
  };

  // 获取视频 ID（支持 YouTube 和 B 站）
  const getVideoEmbedUrl = (videoUrl: string) => {
    try {
      const url = new URL(videoUrl);
      // YouTube
      if (
        url.hostname.includes('youtube.com') ||
        url.hostname.includes('youtu.be')
      ) {
        const videoId =
          url.searchParams.get('v') || url.pathname.split('/').pop();
        return `https://www.youtube.com/embed/${videoId}`;
      }

      // B站
      if (url.hostname.includes('bilibili.com')) {
        const videoId = url.pathname.split('/').pop()?.split('?')[0];
        return `https://player.bilibili.com/player.html?bvid=${videoId}&page=1`;
      }

      return videoUrl;
    } catch {
      return videoUrl;
    }
  };

  // 获取配件联盟链接
  const fetchAffiliateLinks = async (partName: string, stepId: string) => {
    try {
      setLoadingLinks(prev => ({ ...prev, [stepId]: true }));

      const response = await fetch(`/api/affiliate/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partName,
          partId: tutorial.id,
          utmSource: 'fixcycle',
          utmMedium: 'tutorial',
          utmCampaign: `tutorial_${tutorial.id}_step_${stepId}`,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setAffiliateLinks(prev => ({
          ...prev,
          [stepId]: [
            {
              id: result.data.originalLink.id,
              part_name: partName,
              platform: result.data.platform,
              finalUrl: result.data.finalUrl,
              trackingParams: result.data.trackingParams,
            },
          ],
        }));
      }
    } catch (error) {
      console.error('获取联盟链接失败:', error);
    } finally {
      setLoadingLinks(prev => ({ ...prev, [stepId]: false }));
    }
  };

  // 渲染购买按钮
  const renderPurchaseButtons = (parts: string[], stepId: string) => {
    if (!parts || parts.length === 0) return null;

    return (
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-3 flex items-center">
          <ShoppingCart className="w-5 h-5 mr-2" />
          所需配件购买
        </h4>
        <div className="space-y-3">
          {parts.map((part, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
            >
              <div>
                <span className="font-medium text-gray-900">{part}</span>
                {affiliateLinks[stepId]?.find(
                  link => link.part_name === part
                ) ? (
                  <a
                    href={
                      affiliateLinks[stepId].find(
                        link => link.part_name === part
                      )?.finalUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                    onClick={() => {
                      // 可以在这里添加额外的追踪逻辑
                    }}
                  >
                    <ShoppingBag className="w-4 h-4 mr-1" />
                    立即购买
                  </a>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => fetchAffiliateLinks(part, stepId)}
                    disabled={loadingLinks[stepId]}
                  >
                    {loadingLinks[stepId] ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        加载中..
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        获取购买链接
                      </>
                    )}
                  </Button>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {getPlatformIcon(
                    affiliateLinks[stepId]?.find(
                      link => link.part_name === part
                    )?.platform || 'unknown'
                  )}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-blue-600">
          💡 通过我们的链接购买，您将获得更好的价格保障和服务支持
        </p>
      </div>
    );
  };

  // 获取平台图标
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'jd':
        return '🐶 JD';
      case 'taobao':
        return '🍑 淘宝';
      case 'tmall':
        return '🐱 天猫';
      case 'amazon':
        return '📦 A';
      default:
        return '❓';
    }
  };

  // 渲染视频播放器
  const renderVideoPlayer = (videoUrl: string) => {
    const embedUrl = getVideoEmbedUrl(videoUrl);

    return (
      <div className="relative pt-[56.25%] bg-black rounded-lg overflow-hidden">
        <iframe
          src={embedUrl}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={currentStep.title}
        />
      </div>
    );
  };

  // 渲染进度指示器
  const renderProgressIndicator = () => (
    <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">
          进度: {currentStepIndex + 1}/{totalSteps}
        </span>
        <div className="flex space-x-1">
          {tutorial.steps.map((_, index) => (
            <button
              key={index}
              onClick={() => goToStep(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentStepIndex
                  ? 'bg-blue-500'
                  : completedSteps[index]
                    ? 'bg-green-500'
                    : 'bg-gray-300'
              }`}
              aria-label={`跳转到第${index + 1}步`}
            />
          ))}
        </div>
      </div>
      <div className="text-sm text-gray-500">
        预计剩余时间:{' '}
        {tutorial.steps
          .slice(currentStepIndex)
          .reduce((acc, step) => acc + step.estimated_time, 0)}
        分钟
      </div>
    </div>
  );

  // 渲染步骤导航面板
  const renderStepNavigation = () => (
    <div className="bg-gray-50 p-4 border-t">
      <div className="flex items-center justify-between">
        <Button
          onClick={goToPreviousStep}
          disabled={currentStepIndex === 0}
          variant="outline"
          size="sm"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          上一步
        </Button>

        <div className="flex space-x-2">
          {tutorial.steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                index === currentStepIndex
                  ? 'bg-blue-500 text-white'
                  : completedSteps[index]
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
              aria-label={`步骤 ${index + 1}： ${step.title}`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <Button onClick={goToNextStep} variant="default" size="sm">
          {currentStepIndex === totalSteps - 1 ? '完成教程' : '下一步'}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  // 渲染步骤内容
  const renderStepContent = () => (
    <div className="p-6">
      {/* 步骤标题和基本信息*/}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold text-gray-900">
            步骤 {currentStepIndex + 1}： {currentStep.title}
          </h2>
          <Badge variant="secondary">{currentStep.estimated_time}分钟</Badge>
        </div>
        <p className="text-gray-600">{currentStep.description}</p>
      </div>

      {/* 视频内容 */}
      {(currentStep.video_url || tutorial.video_url) && (
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <Video className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="font-medium text-gray-900">视频指导</h3>
          </div>
          {renderVideoPlayer(currentStep.video_url || tutorial.video_url!)}
        </div>
      )}

      {/* 图片内容 */}
      {currentStep.image_url && (
        <div className="mb-6">
          <img
            src={currentStep.image_url}
            alt={currentStep.title}
            className="w-full rounded-lg shadow-md"
          />
        </div>
      )}

      {/* 配件购买链接 */}
      {currentStep.required_parts &&
        currentStep.required_parts.length > 0 &&
        renderPurchaseButtons(currentStep.required_parts, currentStep.id)}

      {/* 提示和警告*/}
      {(currentStep.tips || currentStep.warnings) && (
        <div className="space-y-4">
          {currentStep.tips && currentStep.tips.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">操作提示</h4>
                  <ul className="text-blue-800 space-y-1">
                    {currentStep.tips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">💡</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {currentStep.warnings && currentStep.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-900 mb-2">注意事项</h4>
                  <ul className="text-yellow-800 space-y-1">
                    {currentStep.warnings.map((warning, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">⚠️</span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* 进度指示器 */}
      {renderProgressIndicator()}

      {/* 步骤内容 */}
      <div className="flex-1 overflow-y-auto">{renderStepContent()}</div>

      {/* 导航控制 */}
      {renderStepNavigation()}
    </div>
  );
}
