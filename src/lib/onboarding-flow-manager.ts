// 引导流程管理服务

import {
  SmartOnboardingEngine,
  OnboardingStep,
  UserOnboardingProfile,
  OnboardingTemplates,
  OnboardingPreferences,
} from './smart-onboarding-engine';

export interface OnboardingServiceConfig {
  enableAutoStart: boolean;
  defaultTemplate: 'basic' | 'advanced' | 'enterprise';
  trackingEnabled: boolean;
  analyticsInterval: number; // 分析更新间隔(毫秒)
}

export interface OnboardingSession {
  sessionId: string;
  userId: string;
  startTime: string;
  currentStep: string | null;
  stepHistory: StepVisit[];
  interactions: UserInteraction[];
}

export interface StepVisit {
  stepId: string;
  enterTime: string;
  exitTime?: string;
  timeSpent: number;
}

export interface UserInteraction {
  interactionId: string;
  type: 'click' | 'hover' | 'scroll' | 'input' | 'navigation';
  target: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface PersonalizationContext {
  userProfile: any;
  behaviorHistory: any[];
  deviceInfo: DeviceInfo;
  timeContext: TimeContext;
}

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  screenSize: { width: number; height: number };
}

export interface TimeContext {
  timeOfDay: number;
  dayOfWeek: number;
  isWeekend: boolean;
  season: string;
}

export class OnboardingFlowManager {
  private engine: SmartOnboardingEngine;
  private config: OnboardingServiceConfig;
  private sessions: Map<string, OnboardingSession>;
  private activeUsers: Set<string>;

  constructor(config: Partial<OnboardingServiceConfig> = {}) {
    this.config = {
      enableAutoStart: true,
      defaultTemplate: 'basic',
      trackingEnabled: true,
      analyticsInterval: 300000, // 5分钟
      ...config,
    };

    this.engine = new SmartOnboardingEngine();
    this.sessions = new Map();
    this.activeUsers = new Set();

    this.initializeTemplates();
    this.startAnalyticsLoop();
  }

  // 初始化引导模?  private initializeTemplates(): void {
    // 注册基础设置步骤
    OnboardingTemplates.getBasicSetupSteps().forEach(step => {
      this.engine.registerStep(step);
    });

    // 根据配置注册高级功能步骤
    if (
      this.config.defaultTemplate === 'advanced' ||
      this.config.defaultTemplate === 'enterprise'
    ) {
      OnboardingTemplates.getAdvancedFeaturesSteps().forEach(step => {
        this.engine.registerStep(step);
      });
    }
  }

  // 为用户启动引导流?  async startUserOnboarding(
    userId: string,
    context: PersonalizationContext
  ): Promise<OnboardingStep | null> {
    // 检查用户是否已经有进行中的引导
    const existingProfile = this.engine.getUserProgress(userId);
    if (existingProfile && existingProfile.status === 'in_progress') {
      // 需要通过getNextStep来获取当前步?      const currentStep = await this.engine.getNextStep(userId);
      return currentStep;
    }

    // 创建引导会话
    const sessionId = this.createSession(userId);

    // 启动引导引擎
    const firstStep = await this.engine.startOnboarding(
      userId,
      context.userProfile
    );

    if (firstStep) {
      this.trackStepVisit(sessionId, firstStep.stepId);
      this.activeUsers.add(userId);
    }

    return firstStep;
  }

  // 获取用户的下一个引导步?  async getNextStep(userId: string): Promise<OnboardingStep | null> {
    const profile = this.engine.getUserProgress(userId);
    if (!profile || profile.status !== 'in_progress') {
      return null;
    }

    const sessionId = this.getActiveSessionId(userId);
    if (!sessionId) return null;

    const nextStep = await this.engine.getNextStep(userId);

    if (nextStep) {
      this.trackStepVisit(sessionId, nextStep.stepId);
    } else {
      // 引导完成
      this.completeSession(sessionId);
      this.activeUsers.delete(userId);
    }

    return nextStep;
  }

  // 标记步骤完成
  async completeStep(
    userId: string,
    stepId: string,
    interactionData?: Record<string, any>
  ): Promise<void> {
    const sessionId = this.getActiveSessionId(userId);
    if (!sessionId) return;

    // 记录交互数据
    if (interactionData && this.config.trackingEnabled) {
      this.trackInteraction(sessionId, {
        interactionId: `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'click',
        target: stepId,
        timestamp: new Date().toISOString(),
        metadata: interactionData,
      });
    }

    // 计算步骤耗时
    const timeSpent = this.calculateTimeSpent(sessionId, stepId);

    // 标记步骤完成
    await this.engine.completeStep(userId, stepId, timeSpent);

    // 结束当前步骤访问记录
    this.endStepVisit(sessionId, stepId);
  }

  // 跳过当前引导
  skipOnboarding(userId: string, reason: string = 'user_request'): void {
    const sessionId = this.getActiveSessionId(userId);
    if (sessionId) {
      this.completeSession(sessionId);
    }

    this.engine.skipOnboarding(userId, reason);
    this.activeUsers.delete(userId);
  }

  // 获取用户引导状?  getUserStatus(userId: string): {
    profile: UserOnboardingProfile | undefined;
    session: OnboardingSession | undefined;
    isActive: boolean;
  } {
    const profile = this.engine.getUserProgress(userId);
    const sessionId = this.getActiveSessionId(userId);
    const session = sessionId ? this.sessions.get(sessionId) : undefined;
    const isActive = this.activeUsers.has(userId);

    return { profile, session, isActive };
  }

  // 更新用户偏好设置
  updateUserPreferences(
    userId: string,
    preferences: Partial<OnboardingPreferences>
  ): void {
    this.engine.updateUserPreferences(userId, preferences);
  }

  // 获取个性化推荐
  getPersonalizedRecommendations(userId: string): OnboardingStep[] {
    return this.engine.getPersonalizedRecommendations(userId);
  }

  // 记录用户交互
  trackUserInteraction(
    userId: string,
    interaction: Omit<UserInteraction, 'interactionId' | 'timestamp'>
  ): void {
    const sessionId = this.getActiveSessionId(userId);
    if (!sessionId || !this.config.trackingEnabled) return;

    this.trackInteraction(sessionId, {
      ...interaction,
      interactionId: `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    });
  }

  // 获取引导分析数据
  getAnalytics(): any {
    return this.engine.getAnalytics();
  }

  // 重置用户引导进度
  resetUserOnboarding(userId: string): void {
    const sessionId = this.getActiveSessionId(userId);
    if (sessionId) {
      this.completeSession(sessionId);
    }

    this.engine.resetOnboarding(userId);
    this.activeUsers.delete(userId);
  }

  // 批量管理操作
  async batchProcessUsers(
    userIds: string[],
    action: 'start' | 'complete' | 'skip'
  ): Promise<void> {
    const promises = userIds.map(userId => {
      switch (action) {
        case 'start':
          // 需要提供上下文，这里简化处?          return this.startUserOnboarding(userId, this.getDefaultContext());
        case 'complete':
          const profile = this.engine.getUserProgress(userId);
          if (profile?.currentStep) {
            return this.completeStep(userId, profile.currentStep);
          }
          return Promise.resolve();
        case 'skip':
          return Promise.resolve(this.skipOnboarding(userId));
        default:
          return Promise.resolve();
      }
    });

    await Promise.all(promises);
  }

  // 私有方法
  private createSession(userId: string): string {
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const session: OnboardingSession = {
      sessionId,
      userId,
      startTime: new Date().toISOString(),
      currentStep: null,
      stepHistory: [],
      interactions: [],
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  private getActiveSessionId(userId: string): string | null {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId && session.currentStep) {
        return sessionId;
      }
    }
    return null;
  }

  private trackStepVisit(sessionId: string, stepId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const visit: StepVisit = {
      stepId,
      enterTime: new Date().toISOString(),
      timeSpent: 0,
    };

    session.stepHistory.push(visit);
    session.currentStep = stepId;
    this.sessions.set(sessionId, session);
  }

  private endStepVisit(sessionId: string, stepId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const visit = session.stepHistory.find(
      v => v.stepId === stepId && !v.exitTime
    );
    if (visit) {
      visit.exitTime = new Date().toISOString();
      visit.timeSpent = this.calculateTimeSpent(sessionId, stepId);
      this.sessions.set(sessionId, session);
    }
  }

  private trackInteraction(
    sessionId: string,
    interaction: UserInteraction
  ): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.interactions.push(interaction);
      this.sessions.set(sessionId, session);
    }
  }

  private calculateTimeSpent(sessionId: string, stepId: string): number {
    const session = this.sessions.get(sessionId);
    if (!session) return 0;

    const visit = session.stepHistory.find(v => v.stepId === stepId);
    if (!visit || !visit.enterTime) return 0;

    const endTime = visit.exitTime ? new Date(visit.exitTime) : new Date();
    const startTime = new Date(visit.enterTime);

    return Math.max(0, (endTime.getTime() - startTime.getTime()) / 1000 / 60); // 转换为分?  }

  private completeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      // 计算总会话时?      const totalTime = session.stepHistory.reduce(
        (sum, visit) => sum + visit.timeSpent,
        0
      );

      // 这里可以发送会话数据到分析系统
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
        `引导会话完成: ${sessionId}, 总时? ${totalTime.toFixed(2)}分钟`
      );

      this.sessions.delete(sessionId);
    }
  }

  private getDefaultContext(): PersonalizationContext {
    return {
      userProfile: {},
      behaviorHistory: [],
      deviceInfo: {
        type: 'desktop',
        browser: 'chrome',
        screenSize: { width: 1920, height: 1080 },
      },
      timeContext: {
        timeOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
        isWeekend: [0, 6].includes(new Date().getDay()),
        season: this.getCurrentSeason(),
      },
    };
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  private startAnalyticsLoop(): void {
    setInterval(() => {
      this.updateAnalytics();
    }, this.config.analyticsInterval);
  }

  private updateAnalytics(): void {
    // 收集和更新分析数?    const activeSessions = Array.from(this.sessions.values());
    const totalUsers = this.activeUsers.size;
    const completionRates = this.calculateCompletionRates();

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
      `📊 引导分析更新 - 活跃用户: ${totalUsers}, 活跃会话: ${activeSessions.length}`
    )// TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`📈 完成率分?`, completionRates)}

  private calculateCompletionRates(): Record<string, number> {
    const rates: Record<string, number> = {};
    const profiles = Array.from(this.activeUsers)
      .map(userId => this.engine.getUserProgress(userId))
      .filter(Boolean) as UserOnboardingProfile[];

    profiles.forEach(profile => {
      const rateBucket = Math.floor(profile.progress.completionRate * 10) * 10;
      const bucketKey = `${rateBucket}-${rateBucket + 10}%`;
      rates[bucketKey] = (rates[bucketKey] || 0) + 1;
    });

    return rates;
  }
}

import { useState, useEffect } from 'react';

// React Hook for easy integration
export function useOnboarding(userId: string, isEnabled: boolean = true) {
  const [flowManager] = useState(() => new OnboardingFlowManager());
  const [currentStep, setCurrentStep] = useState<OnboardingStep | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isEnabled || !userId) return;

    const initializeOnboarding = async () => {
      setIsLoading(true);
      try {
        const step = await flowManager.startUserOnboarding(userId, {
          userProfile: {}, // 实际应用中应传入真实用户数据
          behaviorHistory: [],
          deviceInfo: {
            type: 'desktop',
            browser: 'chrome',
            screenSize: {
              width: window.innerWidth,
              height: window.innerHeight,
            },
          },
          timeContext: {
            timeOfDay: new Date().getHours(),
            dayOfWeek: new Date().getDay(),
            isWeekend: [0, 6].includes(new Date().getDay()),
            season: 'spring',
          },
        });

        setCurrentStep(step);
      } catch (error) {
        console.error('引导初始化失?', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeOnboarding();
  }, [userId, isEnabled]);

  const nextStep = async () => {
    if (!currentStep) return;

    setIsLoading(true);
    try {
      await flowManager.completeStep(userId, currentStep.stepId);
      const next = await flowManager.getNextStep(userId);
      setCurrentStep(next);
    } catch (error) {
      console.error('步骤完成失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const skipOnboarding = () => {
    flowManager.skipOnboarding(userId);
    setCurrentStep(null);
  };

  const getStatus = () => {
    return flowManager.getUserStatus(userId);
  };

  return {
    currentStep,
    isLoading,
    nextStep,
    skipOnboarding,
    getStatus,
  };
}
