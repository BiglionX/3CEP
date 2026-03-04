// 智能新手引导系统

export interface OnboardingStep {
  stepId: string;
  title: string;
  description: string;
  type:
    | 'intro'
    | 'tutorial'
    | 'feature_showcase'
    | 'interactive_demo'
    | 'assessment';
  priority: number; // 1-5, 数字越小优先级越?  estimatedTime: number; // 预估完成时间(分钟)
  prerequisites: string[]; // 前置步骤
  completionCriteria: CompletionCriteria;
  content: StepContent;
  triggers: OnboardingTrigger[];
  skipConditions: SkipCondition[];
}

export interface CompletionCriteria {
  type: 'manual' | 'automatic' | 'time_based' | 'action_based';
  conditions?: Record<string, any>;
  timeout?: number; // 超时时间(�?
}

export interface StepContent {
  // 介绍类内?  intro?: {
    headline: string;
    subheading: string;
    imageUrl?: string;
    videoUrl?: string;
    keyPoints: string[];
  };

  // 教程类内?  tutorial?: {
    steps: TutorialStep[];
    interactiveElements: InteractiveElement[];
  };

  // 功能展示内容
  showcase?: {
    features: FeatureHighlight[];
    walkthrough: WalkthroughStep[];
  };

  // 评估内容
  assessment?: {
    questions: AssessmentQuestion[];
    scoring: AssessmentScoring;
  };
}

export interface TutorialStep {
  stepId: string;
  title: string;
  instruction: string;
  media?: {
    type: 'image' | 'video' | 'gif';
    url: string;
    alt: string;
  };
  interactiveArea?: {
    targetSelector: string;
    highlightColor: string;
    tooltip: string;
  };
  validation?: {
    type: 'click' | 'input' | 'navigation' | 'selection';
    target: string;
    expectedValue?: string;
  };
}

export interface InteractiveElement {
  elementId: string;
  type: 'tooltip' | 'modal' | 'overlay' | 'guided_tour';
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  content: {
    title: string;
    description: string;
    actions?: InteractiveAction[];
  };
  autoDismiss?: boolean;
  dismissDelay?: number;
}

export interface InteractiveAction {
  actionId: string;
  label: string;
  type: 'primary' | 'secondary' | 'skip';
  handler: string; // 事件处理函数?}

export interface FeatureHighlight {
  featureId: string;
  title: string;
  description: string;
  location: {
    page: string;
    selector: string;
  };
  benefits: string[];
}

export interface WalkthroughStep {
  stepId: string;
  title: string;
  description: string;
  targetElement: string;
  animation?: 'pulse' | 'bounce' | 'slide';
}

export interface AssessmentQuestion {
  questionId: string;
  type: 'multiple_choice' | 'rating' | 'open_text' | 'scenario';
  question: string;
  options?: string[];
  required: boolean;
}

export interface AssessmentScoring {
  passingScore: number;
  feedback: {
    excellent: string;
    good: string;
    needs_improvement: string;
  };
}

export interface OnboardingTrigger {
  type: 'time_delay' | 'user_action' | 'page_visit' | 'feature_usage';
  condition: any;
  delay?: number; // 毫秒
}

export interface SkipCondition {
  type:
    | 'user_profile'
    | 'behavior_pattern'
    | 'feature_familiarity'
    | 'time_constraint';
  condition: any;
}

export interface UserOnboardingProfile {
  userId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  currentStep: string | null;
  progress: OnboardingProgress;
  preferences: OnboardingPreferences;
  completionHistory: CompletionRecord[];
  lastInteraction: string;
}

export interface OnboardingProgress {
  totalSteps: number;
  completedSteps: number;
  completionRate: number;
  timeSpent: number; // 总耗时(分钟)
  lastUpdated: string;
}

export interface OnboardingPreferences {
  pace: 'fast' | 'medium' | 'slow';
  learningStyle: 'visual' | 'hands_on' | 'reading' | 'mixed';
  preferredChannels: ('in_app' | 'email' | 'video')[];
  notificationFrequency: 'immediate' | 'daily' | 'weekly';
}

export interface CompletionRecord {
  stepId: string;
  completedAt: string;
  timeSpent: number;
  method: 'manual' | 'automatic';
  feedback?: string;
}

export interface OnboardingAnalytics {
  overallCompletionRate: number;
  averageCompletionTime: number;
  dropOffPoints: DropOffPoint[];
  userSegments: UserSegmentAnalytics[];
  effectivenessMetrics: EffectivenessMetrics;
}

export interface DropOffPoint {
  stepId: string;
  dropOffRate: number;
  commonCharacteristics: string[];
}

export interface UserSegmentAnalytics {
  segmentId: string;
  segmentName: string;
  completionRate: number;
  averageTime: number;
  commonDropOffs: string[];
}

export interface EffectivenessMetrics {
  engagementScore: number;
  knowledgeRetention: number;
  featureAdoption: number;
  userSatisfaction: number;
}

export class SmartOnboardingEngine {
  private steps: OnboardingStep[] = [];
  private userProfiles: Map<string, UserOnboardingProfile> = new Map();
  private analytics: OnboardingAnalytics;

  constructor() {
    this.analytics = {
      overallCompletionRate: 0,
      averageCompletionTime: 0,
      dropOffPoints: [],
      userSegments: [],
      effectivenessMetrics: {
        engagementScore: 0,
        knowledgeRetention: 0,
        featureAdoption: 0,
        userSatisfaction: 0,
      },
    };
  }

  // 注册引导步骤
  registerStep(step: OnboardingStep): void {
    this.steps.push(step);
    this.steps.sort((a, b) => a.priority - b.priority);
  }

  // 为用户启动引导流?  async startOnboarding(
    userId: string,
    userProfile: any
  ): Promise<OnboardingStep | null> {
    // 检查是否已有进行中的引?    const existingProfile = this.userProfiles.get(userId);
    if (existingProfile && existingProfile.status === 'in_progress') {
      return this.getStepById(existingProfile.currentStep!);
    }

    // 创建新的引导档案
    const profile: UserOnboardingProfile = {
      userId,
      status: 'in_progress',
      currentStep: null,
      progress: {
        totalSteps: this.steps.length,
        completedSteps: 0,
        completionRate: 0,
        timeSpent: 0,
        lastUpdated: new Date().toISOString(),
      },
      preferences: this.inferPreferences(userProfile),
      completionHistory: [],
      lastInteraction: new Date().toISOString(),
    };

    this.userProfiles.set(userId, profile);

    // 获取第一个步?    return this.getNextStep(userId);
  }

  // 获取用户的下一个引导步?  async getNextStep(userId: string): Promise<OnboardingStep | null> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return null;

    // 检查是否已完成所有步?    if (profile.progress.completedSteps >= profile.progress.totalSteps) {
      profile.status = 'completed';
      this.userProfiles.set(userId, profile);
      return null;
    }

    // 查找下一个合适的步骤
    for (const step of this.steps) {
      // 检查前置条?      if (!this.checkPrerequisites(step, profile)) continue;

      // 检查跳过条?      if (this.shouldSkipStep(step, profile)) continue;

      // 检查触发条?      if (!(await this.checkTriggers(step, userId))) continue;

      // 设置当前步骤
      profile.currentStep = step.stepId;
      this.userProfiles.set(userId, profile);

      return step;
    }

    return null;
  }

  // 标记步骤完成
  async completeStep(
    userId: string,
    stepId: string,
    timeSpent: number = 0
  ): Promise<void> {
    const profile = this.userProfiles.get(userId);
    if (!profile || profile.currentStep !== stepId) return;

    // 记录完成历史
    profile.completionHistory.push({
      stepId,
      completedAt: new Date().toISOString(),
      timeSpent,
      method: 'manual',
    });

    // 更新进度
    profile.progress.completedSteps++;
    profile.progress.timeSpent += timeSpent;
    profile.progress.completionRate =
      profile.progress.completedSteps / profile.progress.totalSteps;
    profile.progress.lastUpdated = new Date().toISOString();
    profile.lastInteraction = new Date().toISOString();

    this.userProfiles.set(userId, profile);
  }

  // 获取用户引导状?  getUserProgress(userId: string): UserOnboardingProfile | undefined {
    return this.userProfiles.get(userId);
  }

  // 跳过引导流程
  skipOnboarding(userId: string, reason: string = 'user_request'): void {
    const profile = this.userProfiles.get(userId);
    if (profile) {
      profile.status = 'skipped';
      profile.lastInteraction = new Date().toISOString();
      this.userProfiles.set(userId, profile);
    }
  }

  // 重置用户引导进度
  resetOnboarding(userId: string): void {
    this.userProfiles.delete(userId);
  }

  // 获取个性化引导建议
  getPersonalizedRecommendations(userId: string): OnboardingStep[] {
    const profile = this.userProfiles.get(userId);
    if (!profile) return [];

    const recommendations: OnboardingStep[] = [];

    // 基于用户偏好和行为模式推荐步?    this.steps.forEach(step => {
      if (this.shouldRecommendStep(step, profile)) {
        recommendations.push(step);
      }
    });

    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  // 更新用户偏好
  updateUserPreferences(
    userId: string,
    preferences: Partial<OnboardingPreferences>
  ): void {
    const profile = this.userProfiles.get(userId);
    if (profile) {
      profile.preferences = { ...profile.preferences, ...preferences };
      this.userProfiles.set(userId, profile);
    }
  }

  // 获取引导分析数据
  getAnalytics(): OnboardingAnalytics {
    return { ...this.analytics };
  }

  // 私有方法
  private getStepById(stepId: string): OnboardingStep | null {
    return this.steps.find(step => step.stepId === stepId) || null;
  }

  private checkPrerequisites(
    step: OnboardingStep,
    profile: UserOnboardingProfile
  ): boolean {
    if (step.prerequisites.length === 0) return true;

    return step.prerequisites.every(prereqId =>
      profile.completionHistory.some(record => record.stepId === prereqId)
    );
  }

  private shouldSkipStep(
    step: OnboardingStep,
    profile: UserOnboardingProfile
  ): boolean {
    return step.skipConditions.some(condition =>
      this.evaluateSkipCondition(condition, profile)
    );
  }

  private async checkTriggers(
    step: OnboardingStep,
    userId: string
  ): Promise<boolean> {
    // 对于即时触发的步骤，总是返回true
    if (step.triggers.length === 0) return true;

    // 检查各种触发条?    for (const trigger of step.triggers) {
      switch (trigger.type) {
        case 'time_delay':
          // 这里应该检查用户上次交互时?          return true;
        case 'user_action':
          // 检查用户是否执行了特定操作
          return await this.checkUserAction(trigger.condition, userId);
        case 'page_visit':
          // 检查用户是否访问了特定页面
          return this.checkPageVisit(trigger.condition, userId);
        case 'feature_usage':
          // 检查用户是否使用了特定功能
          return this.checkFeatureUsage(trigger.condition, userId);
      }
    }

    return false;
  }

  private inferPreferences(userProfile: any): OnboardingPreferences {
    // 基于用户档案推断偏好设置
    return {
      pace: 'medium',
      learningStyle: 'mixed',
      preferredChannels: ['in_app', 'video'],
      notificationFrequency: 'daily',
    };
  }

  private evaluateSkipCondition(
    condition: SkipCondition,
    profile: UserOnboardingProfile
  ): boolean {
    switch (condition.type) {
      case 'user_profile':
        // 基于用户档案特征判断
        return this.evaluateUserProfileCondition(condition.condition, profile);
      case 'behavior_pattern':
        // 基于行为模式判断
        return this.evaluateBehaviorCondition(condition.condition, profile);
      case 'feature_familiarity':
        // 基于功能熟悉度判?        return this.evaluateFamiliarityCondition(condition.condition, profile);
      case 'time_constraint':
        // 基于时间约束判断
        return this.evaluateTimeConstraint(condition.condition, profile);
      default:
        return false;
    }
  }

  private shouldRecommendStep(
    step: OnboardingStep,
    profile: UserOnboardingProfile
  ): boolean {
    // 基于用户进度和偏好推荐步?    const completedRate = profile.progress.completionRate;

    // 对于高优先级步骤，在早期阶段推荐
    if (step.priority <= 2 && completedRate < 0.3) return true;

    // 对于中等优先级步骤，在中期推?    if (step.priority === 3 && completedRate >= 0.3 && completedRate < 0.7)
      return true;

    // 对于低优先级步骤，在后期推荐
    if (step.priority >= 4 && completedRate >= 0.7) return true;

    return false;
  }

  // 模拟的条件检查方?  private async checkUserAction(
    condition: any,
    userId: string
  ): Promise<boolean> {
    // 实际实现应该检查用户的具体行为
    return true;
  }

  private checkPageVisit(condition: any, userId: string): boolean {
    // 实际实现应该检查页面访问历?    return true;
  }

  private checkFeatureUsage(condition: any, userId: string): boolean {
    // 实际实现应该检查功能使用记?    return true;
  }

  private evaluateUserProfileCondition(
    condition: any,
    profile: UserOnboardingProfile
  ): boolean {
    // 实际实现应该基于用户档案进行判断
    return false;
  }

  private evaluateBehaviorCondition(
    condition: any,
    profile: UserOnboardingProfile
  ): boolean {
    // 实际实现应该基于行为模式进行判断
    return false;
  }

  private evaluateFamiliarityCondition(
    condition: any,
    profile: UserOnboardingProfile
  ): boolean {
    // 实际实现应该基于功能熟悉度进行判?    return false;
  }

  private evaluateTimeConstraint(
    condition: any,
    profile: UserOnboardingProfile
  ): boolean {
    // 实际实现应该基于时间约束进行判断
    return false;
  }
}

// 预定义的引导步骤模板
export class OnboardingTemplates {
  static getBasicSetupSteps(): OnboardingStep[] {
    return [
      {
        stepId: 'welcome_intro',
        title: '欢迎使用3CEP平台',
        description: '让我们一起开始您的数字化转型之旅',
        type: 'intro',
        priority: 1,
        estimatedTime: 2,
        prerequisites: [],
        completionCriteria: {
          type: 'manual',
        },
        content: {
          intro: {
            headline: '欢迎来到3CEP智能企业平台',
            subheading: '专为现代企业打造的一站式数字化解决方?,
            keyPoints: [
              '设备全生命周期管?,
              '智能维修调度系统',
              '配件供应链优?,
              '数据分析与洞?,
            ],
          },
        },
        triggers: [],
        skipConditions: [],
      },
      {
        stepId: 'dashboard_tour',
        title: '主控台快速导?,
        description: '了解平台核心功能和导航结?,
        type: 'feature_showcase',
        priority: 2,
        estimatedTime: 3,
        prerequisites: ['welcome_intro'],
        completionCriteria: {
          type: 'automatic',
        },
        content: {
          showcase: {
            features: [
              {
                featureId: 'main_dashboard',
                title: '主控?,
                description: '一站式查看所有关键业务指?,
                location: {
                  page: '/dashboard',
                  selector: '#main-dashboard',
                },
                benefits: ['实时监控', '快速决?, '异常预警'],
              },
            ],
            walkthrough: [
              {
                stepId: 'tour_step_1',
                title: '导航菜单',
                description: '左侧导航栏包含所有主要功能模?,
                targetElement: '.sidebar-nav',
              },
            ],
          },
        },
        triggers: [
          {
            type: 'page_visit',
            condition: { page: '/dashboard' },
          },
        ],
        skipConditions: [
          {
            type: 'feature_familiarity',
            condition: { feature: 'dashboard', familiarity: 'high' },
          },
        ],
      },
    ];
  }

  static getAdvancedFeaturesSteps(): OnboardingStep[] {
    return [
      {
        stepId: 'ml_prediction_tour',
        title: '机器学习预测功能',
        description: '体验AI驱动的业务预测能?,
        type: 'tutorial',
        priority: 3,
        estimatedTime: 5,
        prerequisites: ['dashboard_tour'],
        completionCriteria: {
          type: 'action_based',
          conditions: {
            action: 'prediction_generated',
            target: 'ml-prediction-dashboard',
          },
        },
        content: {
          tutorial: {
            steps: [
              {
                stepId: 'ml_step_1',
                title: '访问预测中心',
                instruction: '点击左侧菜单中的"预测分析"选项',
                interactiveArea: {
                  targetSelector: '[data-menu-item="prediction"]',
                  highlightColor: '#3b82f6',
                  tooltip: '点击进入机器学习预测中心',
                },
                validation: {
                  type: 'click',
                  target: '[data-menu-item="prediction"]',
                },
              },
            ],
            interactiveElements: [
              {
                elementId: 'prediction_tooltip',
                type: 'tooltip',
                position: 'right',
                content: {
                  title: '智能预测',
                  description: '基于历史数据和AI算法，为您提供精准的业务预测',
                  actions: [
                    {
                      actionId: 'start_tutorial',
                      label: '开始体?,
                      type: 'primary',
                      handler: 'startPredictionTutorial',
                    },
                  ],
                },
              },
            ],
          },
        },
        triggers: [
          {
            type: 'user_action',
            condition: { action: 'menu_hover', target: 'prediction' },
          },
        ],
        skipConditions: [],
      },
    ];
  }
}
