'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  CheckCircle,
  Sparkles,
  Zap,
  Star,
  Trophy,
  Clock,
  Users,
  TrendingUp,
} from 'lucide-react';
import { OnboardingStep, StepContent } from '@/lib/smart-onboarding-engine';
import { useOnboarding } from '@/lib/onboarding-flow-manager';

interface SmartOnboardingProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  theme?: 'light' | 'dark';
}

export function SmartOnboarding({
  userId,
  isOpen,
  onClose,
  onComplete,
  theme = 'light',
}: SmartOnboardingProps) {
  const { currentStep, isLoading, nextStep, skipOnboarding, getStatus } =
    useOnboarding(userId, isOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [progress, setProgress] = useState(0);

  // 更新进度
  useEffect(() => {
    const status = getStatus();
    if (status.profile) {
      setProgress(status.profile.progress.completionRate * 100);
    }
  }, [currentStep, getStatus]);

  if (!isOpen || !currentStep) return null;

  const handleNext = async () => {
    if (currentStep) {
      await nextStep();
      if (!currentStep) {
        // 引导完成
        onComplete?.();
        onClose();
      }
    }
  };

  const handleSkip = () => {
    skipOnboarding();
    onClose();
  };

  const renderStepContent = (content: StepContent) => {
    if (content.intro) {
      return <IntroStepContent intro={content.intro} />;
    }

    if (content.tutorial) {
      return <TutorialStepContent tutorial={content.tutorial} />;
    }

    if (content.showcase) {
      return <ShowcaseStepContent showcase={content.showcase} />;
    }

    if (content.assessment) {
      return <AssessmentStepContent assessment={content.assessment} />;
    }

    return <DefaultStepContent />;
  };

  return (
    <AnimatePresence>
      {!isMinimized ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-4xl"
          >
            <Card
              className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white'} shadow-2xl`}
            >
              <CardHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Sparkles className="w-6 h-6 text-blue-500" />
                    <CardTitle className="text-xl">智能引导助手</CardTitle>
                    <Badge variant="secondary">{currentStep.type}</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={progress} className="w-32" />
                    <span className="text-sm text-muted-foreground">
                      {Math.round(progress)}%
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMinimized(true)}
                      className="h-8 w-8"
                    >
                      <Zap className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClose}
                      className="h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">
                    {currentStep.title}
                  </h2>
                  <p className="text-muted-foreground">
                    {currentStep.description}
                  </p>
                </div>

                <div className="min-h-96">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-96">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    renderStepContent(currentStep.content)
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground mt-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{currentStep.estimatedTime}分钟</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>优先?{currentStep.priority}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>个性化推荐</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t pt-4 flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  disabled={isLoading}
                >
                  跳过引导
                </Button>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    稍后继续
                  </Button>

                  <Button
                    onClick={handleNext}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {currentStep.completionCriteria.type === 'manual'
                      ? '标记完成'
                      : '下一?}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className="fixed bottom-4 right-4 z-50"
        >
          <Button
            onClick={() => setIsMinimized(false)}
            className="rounded-full w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
          >
            <Play className="w-6 h-6" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 介绍步骤内容组件
function IntroStepContent({ intro }: { intro: any }) {
  return (
    <div className="text-center py-8">
      <div className="mb-8">
        {intro.imageUrl && (
          <img
            src={intro.imageUrl}
            alt={intro.headline}
            className="mx-auto rounded-lg shadow-lg max-w-md"
          />
        )}
        {intro.videoUrl && (
          <div className="aspect-video mx-auto max-w-2xl bg-black rounded-lg overflow-hidden">
            <iframe
              src={intro.videoUrl}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>

      <h3 className="text-3xl font-bold mb-4">{intro.headline}</h3>
      <p className="text-xl text-muted-foreground mb-8">{intro.subheading}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {intro.keyPoints.map((point: string, index: number) => (
          <div
            key={index}
            className="flex items-start space-x-3 p-4 bg-secondary rounded-lg"
          >
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-left">{point}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 教程步骤内容组件
function TutorialStepContent({ tutorial }: { tutorial: any }) {
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  const step = tutorial.steps[currentTutorialStep];

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">
          �?{currentTutorialStep + 1} �?/ {tutorial.steps.length}
        </h3>
        <div className="flex space-x-1">
          {tutorial.steps.map((_: any, index: number) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentTutorialStep
                  ? 'bg-blue-500'
                  : index < currentTutorialStep
                    ? 'bg-green-500'
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-secondary rounded-lg p-6 mb-6">
        <h4 className="text-lg font-medium mb-3">{step.title}</h4>
        <p className="text-muted-foreground mb-4">{step.instruction}</p>

        {step.media && (
          <div className="mb-4">
            {step.media.type === 'image' && (
              <img
                src={step.media.url}
                alt={step.media.alt}
                className="rounded-lg shadow-md w-full"
              />
            )}
            {step.media.type === 'video' && (
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={step.media.url}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        )}

        {step.interactiveArea && (
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center">
            <p className="text-blue-600 font-medium">
              {step.interactiveArea.tooltip}
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() =>
            setCurrentTutorialStep(Math.max(0, currentTutorialStep - 1))
          }
          disabled={currentTutorialStep === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          上一?        </Button>

        <Button
          onClick={() => {
            if (currentTutorialStep < tutorial.steps.length - 1) {
              setCurrentTutorialStep(currentTutorialStep + 1);
            }
          }}
        >
          {currentTutorialStep === tutorial.steps.length - 1
            ? '完成教程'
            : '下一?}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// 功能展示内容组件
function ShowcaseStepContent({ showcase }: { showcase: any }) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const feature = showcase.features[currentFeature];

  return (
    <div className="py-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-2xl font-bold mb-6">核心功能亮点</h3>

          <div className="space-y-4">
            {showcase.features.map((feat: any, index: number) => (
              <div
                key={feat.featureId}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  index === currentFeature
                    ? 'bg-blue-50 border-2 border-blue-200'
                    : 'bg-secondary hover:bg-accent'
                }`}
                onClick={() => setCurrentFeature(index)}
              >
                <h4 className="font-medium">{feat.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {feat.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {feat.benefits.map((benefit: string, i: number) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="bg-secondary rounded-lg p-6 h-80 flex items-center justify-center">
            <div className="text-center">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h4 className="text-xl font-medium mb-2">{feature?.title}</h4>
              <p className="text-muted-foreground">{feature?.description}</p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Button className="w-full">立即体验 {feature?.title}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 评估步骤内容组件
function AssessmentStepContent({ assessment }: { assessment: any }) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const question = assessment.questions[currentQuestion];

  const handleAnswer = (answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [question.questionId]: answer,
    }));
  };

  return (
    <div className="py-4">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">能力评估</h3>
          <Badge variant="outline">
            {currentQuestion + 1} / {assessment.questions.length}
          </Badge>
        </div>

        <Progress
          value={((currentQuestion + 1) / assessment.questions.length) * 100}
          className="mb-4"
        />
      </div>

      <Card className="bg-secondary">
        <CardContent className="p-6">
          <h4 className="text-lg font-medium mb-4">{question.question}</h4>

          {question.type === 'multiple_choice' && question.options && (
            <div className="space-y-2">
              {question.options.map((option: string, index: number) => (
                <Button
                  key={index}
                  variant={
                    answers[question.questionId] === option
                      ? 'default'
                      : 'outline'
                  }
                  className="w-full justify-start"
                  onClick={() => handleAnswer(option)}
                >
                  {String.fromCharCode(65 + index)}. {option}
                </Button>
              ))}
            </div>
          )}

          {question.type === 'rating' && (
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map(rating => (
                <Button
                  key={rating}
                  variant={
                    answers[question.questionId] === rating
                      ? 'default'
                      : 'outline'
                  }
                  size="lg"
                  className="w-12 h-12 rounded-full"
                  onClick={() => handleAnswer(rating)}
                >
                  {rating}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          上一?        </Button>

        <Button
          onClick={() => {
            if (currentQuestion < assessment.questions.length - 1) {
              setCurrentQuestion(currentQuestion + 1);
            }
          }}
          disabled={!answers[question.questionId]}
        >
          {currentQuestion === assessment.questions.length - 1
            ? '提交评估'
            : '下一?}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// 默认步骤内容组件
function DefaultStepContent() {
  return (
    <div className="text-center py-16">
      <Users className="w-16 h-16 text-blue-500 mx-auto mb-4" />
      <h3 className="text-2xl font-bold mb-2">个性化引导内容</h3>
      <p className="text-muted-foreground">
        根据您的使用习惯定制的引导内容即将呈?      </p>
    </div>
  );
}
