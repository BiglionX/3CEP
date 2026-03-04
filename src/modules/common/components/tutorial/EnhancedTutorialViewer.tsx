'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  BookOpen,
  Settings,
  Save,
  Share2,
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
  completed?: boolean;
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

interface EnhancedTutorialViewerProps {
  tutorial: Tutorial;
  onComplete?: () => void;
  onStepChange?: (stepIndex: number) => void;
  initialStep?: number;
}

export function EnhancedTutorialViewer({
  tutorial,
  onComplete,
  onStepChange,
  initialStep = 0,
}: EnhancedTutorialViewerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(
    new Array(tutorial.steps.length).fill(false)
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);

  const currentStep = tutorial.steps[currentStepIndex];
  const totalSteps = tutorial.steps.length;

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPreviousStep();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNextStep();
          break;
        case ' ':
          event.preventDefault();
          togglePlayPause();
          break;
        case 'r':
          event.preventDefault();
          resetProgress();
          break;
        case 'm':
          event.preventDefault();
          toggleMute();
          break;
        case 'f':
          event.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIndex, isPlaying]);

  // 步骤变化回调
  useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStepIndex);
    }
  }, [currentStepIndex, onStepChange]);

  // 标记步骤为完?  const markStepAsComplete = useCallback((index: number) => {
    setCompletedSteps(prev => {
      const newCompleted = [...prev];
      newCompleted[index] = true;
      return newCompleted;
    });
  }, []);

  // 上一?  const goToPreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  // 下一?  const goToNextStep = useCallback(() => {
    markStepAsComplete(currentStepIndex);
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // 最后一步完?      if (onComplete) {
        onComplete();
      }
    }
  }, [currentStepIndex, totalSteps, markStepAsComplete, onComplete]);

  // 跳转到指定步?  const goToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < totalSteps) {
        setCurrentStepIndex(index);
      }
    },
    [totalSteps]
  );

  // 播放/暂停控制
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // 静音控制
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // 全屏控制
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // 重置进度
  const resetProgress = () => {
    setCompletedSteps(new Array(totalSteps).fill(false));
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  // 渲染播放控制?  const renderVideoControls = () => (
    <div className="flex items-center justify-between bg-gray-800 text-white p-3 rounded-b-lg">
      <div className="flex items-center space-x-3">
        <Button
          size="sm"
          variant="ghost"
          onClick={togglePlayPause}
          className="text-white hover:bg-gray-700"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={toggleMute}
          className="text-white hover:bg-gray-700"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>

        <div className="flex items-center space-x-2">
          <span className="text-sm">速度:</span>
          <select
            value={playbackSpeed}
            onChange={e => setPlaybackSpeed(Number(e.target.value))}
            className="bg-gray-700 text-white text-sm rounded px-2 py-1"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={toggleFullscreen}
          className="text-white hover:bg-gray-700"
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowSettings(!showSettings)}
          className="text-white hover:bg-gray-700"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  // 渲染设置面板
  const renderSettingsPanel = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">教程设置</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>自动前进到下一?/span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={e => setAutoAdvance(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <span>播放速度</span>
            <select
              value={playbackSpeed}
              onChange={e => setPlaybackSpeed(Number(e.target.value))}
              className="border rounded px-3 py-1"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={() => setShowSettings(false)}>
            关闭
          </Button>
          <Button onClick={() => setShowSettings(false)}>保存设置</Button>
        </div>
      </div>
    </div>
  );

  // 渲染进度?  const renderProgressBar = () => {
    const progress = ((currentStepIndex + 1) / totalSteps) * 100;

    return (
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* 顶部控制?*/}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900 truncate max-w-md">
            {tutorial.title}
          </h1>
          <Badge variant="secondary">
            {currentStepIndex + 1}/{totalSteps}
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={resetProgress}>
            <RotateCcw className="w-4 h-4 mr-1" />
            重置
          </Button>
          <Button size="sm" variant="outline">
            <Save className="w-4 h-4 mr-1" />
            保存
          </Button>
          <Button size="sm" variant="outline">
            <Share2 className="w-4 h-4 mr-1" />
            分享
          </Button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* 步骤列表侧边?*/}
        <div className="w-full md:w-64 border-r bg-gray-50 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              教程步骤
            </h3>

            <div className="space-y-2">
              {tutorial.steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => goToStep(index)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    index === currentStepIndex
                      ? 'bg-blue-500 text-white'
                      : completedSteps[index]
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      {index === currentStepIndex ? (
                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        </div>
                      ) : completedSteps[index] ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {step.title}
                      </p>
                      <p className="text-xs opacity-75 mt-1">
                        {step.estimated_time}分钟
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 进度?*/}
          <div className="p-4 border-b">
            {renderProgressBar()}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                �?{currentStepIndex + 1} �? {currentStep.title}
              </span>
              <span>
                预计剩余:{' '}
                {tutorial.steps
                  .slice(currentStepIndex)
                  .reduce((acc, step) => acc + step.estimated_time, 0)}
                分钟
              </span>
            </div>
          </div>

          {/* 步骤内容 */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {currentStep.title}
              </h2>

              <p className="text-gray-600 mb-6">{currentStep.description}</p>

              {/* 多媒体内?*/}
              <div className="space-y-6">
                {currentStep.video_url && (
                  <div className="bg-black rounded-lg overflow-hidden">
                    <div className="relative pt-[56.25%]">
                      <iframe
                        src={currentStep.video_url}
                        className="absolute top-0 left-0 w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    {renderVideoControls()}
                  </div>
                )}

                {currentStep.image_url && (
                  <div>
                    <img
                      src={currentStep.image_url}
                      alt={currentStep.title}
                      className="w-full rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>

              {/* 提示和警?*/}
              {(currentStep.tips || currentStep.warnings) && (
                <div className="mt-8 space-y-4">
                  {currentStep.tips && currentStep.tips.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">
                        💡 操作提示
                      </h4>
                      <ul className="text-blue-800 space-y-1">
                        {currentStep.tips.map((tip, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">�?/span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentStep.warnings && currentStep.warnings.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-900 mb-2">
                        ⚠️ 注意事项
                      </h4>
                      <ul className="text-yellow-800 space-y-1">
                        {currentStep.warnings.map((warning, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">�?/span>
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 底部导航 */}
          <div className="border-t bg-white p-4">
            <div className="flex items-center justify-between">
              <Button
                onClick={goToPreviousStep}
                disabled={currentStepIndex === 0}
                variant="outline"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                上一?              </Button>

              <div className="flex items-center space-x-2">
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

              <Button onClick={goToNextStep} variant="default">
                {currentStepIndex === totalSteps - 1 ? '完成教程' : '下一?}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 设置面板 */}
      {showSettings && renderSettingsPanel()}
    </div>
  );
}
