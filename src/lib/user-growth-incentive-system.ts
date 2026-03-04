// 用户成长激励体?
export interface GrowthPathConfig {
  levels: LevelConfig[];
  milestones: MilestoneConfig[];
  rewards: RewardConfig[];
  progressionRules: ProgressionRule[];
  seasonalEvents: SeasonalEventConfig[];
}

export interface LevelConfig {
  levelId: string;
  levelName: string;
  levelNumber: number;
  requiredPoints: number;
  benefits: LevelBenefit[];
  badge: string;
  color: string;
  unlockRequirements: UnlockRequirement[];
}

export interface LevelBenefit {
  type:
    | 'discount'
    | 'priority_support'
    | 'exclusive_features'
    | 'early_access'
    | 'special_badges';
  value: any;
  description: string;
}

export interface UnlockRequirement {
  type: 'points' | 'activity_days' | 'achievements' | 'referrals';
  value: number;
  description: string;
}

export interface MilestoneConfig {
  milestoneId: string;
  name: string;
  description: string;
  triggerType:
    | 'points_reached'
    | 'days_active'
    | 'features_used'
    | 'achievements_unlocked';
  triggerValue: number;
  rewards: MilestoneReward[];
  celebrationType: 'badge' | 'popup' | 'email' | 'notification';
}

export interface MilestoneReward {
  type: 'points_bonus' | 'exclusive_item' | 'title' | 'feature_access';
  value: any;
  description: string;
}

export interface RewardConfig {
  rewardId: string;
  name: string;
  description: string;
  cost: number; // 所需积分
  category: 'virtual' | 'physical' | 'service' | 'experience';
  availability: 'limited' | 'permanent' | 'seasonal';
  stock?: number;
  redemptionLimit?: {
    perUser?: number;
    totalTime?: number;
  };
}

export interface ProgressionRule {
  ruleId: string;
  name: string;
  description: string;
  condition: ProgressionCondition;
  action: ProgressionAction;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
}

export interface ProgressionCondition {
  type: 'user_action' | 'system_event' | 'time_based' | 'achievement_based';
  parameters: Record<string, any>;
}

export interface ProgressionAction {
  type: 'award_points' | 'unlock_feature' | 'level_up' | 'send_notification';
  parameters: Record<string, any>;
}

export interface SeasonalEventConfig {
  eventId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  bonusMultiplier: number;
  specialRewards: SpecialReward[];
  participationRequirements: ParticipationRequirement[];
}

export interface SpecialReward {
  type: 'points_multiplier' | 'exclusive_items' | 'event_badges';
  value: any;
  description: string;
}

export interface ParticipationRequirement {
  type: 'minimum_activity' | 'level_requirement' | 'opt_in';
  value: any;
  description?: string;
}

export interface UserGrowthProfile {
  userId: string;
  currentLevel: string;
  totalPoints: number;
  pointsToNextLevel: number;
  levelProgress: number; // 0-100
  achievements: UserAchievement[];
  recentMilestones: MilestoneProgress[];
  activityStreak: number;
  lastActiveDate: string;
  growthHistory: GrowthRecord[];
}

export interface UserAchievement {
  achievementId: string;
  unlockedAt: string;
  pointsAwarded: number;
  relatedActivity?: string;
}

export interface MilestoneProgress {
  milestoneId: string;
  progress: number; // 0-100
  completedAt?: string;
  rewardsClaimed: boolean;
}

export interface GrowthRecord {
  recordId: string;
  type:
    | 'level_up'
    | 'milestone_complete'
    | 'points_earned'
    | 'achievement_unlocked';
  timestamp: string;
  details: Record<string, any>;
  pointsChange: number;
}

export class UserGrowthIncentiveSystem {
  private config: GrowthPathConfig;
  private userProfiles: Map<string, UserGrowthProfile>;
  private activeEvents: Set<string>;

  constructor(config: GrowthPathConfig) {
    this.config = config;
    this.userProfiles = new Map();
    this.activeEvents = new Set();
    this.initializeSystem();
  }

  // 初始化系?  private initializeSystem(): void {
    // 启动季节性活?    this.checkAndActivateSeasonalEvents();

    // 设置定时任务
    setInterval(
      () => {
        this.checkAndActivateSeasonalEvents();
        this.processDailyProgression();
      },
      24 * 60 * 60 * 1000
    ); // �?4小时执行一?  }

  // 用户注册时初始化成长档案
  initializeUserGrowthProfile(userId: string): UserGrowthProfile {
    const profile: UserGrowthProfile = {
      userId,
      currentLevel: this.config.levels[0].levelId,
      totalPoints: 0,
      pointsToNextLevel: this.config.levels[0].requiredPoints,
      levelProgress: 0,
      achievements: [],
      recentMilestones: [],
      activityStreak: 0,
      lastActiveDate: new Date().toISOString(),
      growthHistory: [],
    };

    this.userProfiles.set(userId, profile);
    return profile;
  }

  // 记录用户活动并计算积?  async recordUserActivity(
    userId: string,
    activityType: string,
    activityDetails: Record<string, any> = {}
  ): Promise<{
    pointsEarned: number;
    levelUp?: boolean;
    newLevel?: string;
    newMilestones?: string[];
    achievementsUnlocked?: string[];
  }> {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      throw new Error(`用户成长档案不存? ${userId}`);
    }

    // 计算活动获得的积?    const pointsEarned = this.calculateActivityPoints(
      activityType,
      activityDetails
    );

    // 更新用户积分
    profile.totalPoints += pointsEarned;
    profile.lastActiveDate = new Date().toISOString();

    // 更新活跃天数
    profile.activityStreak = this.calculateActivityStreak(profile);

    // 检查等级升?    const levelResult = this.checkLevelUpgrade(profile);

    // 检查里程碑达成
    const milestoneResult = this.checkMilestoneCompletion(
      profile,
      activityType
    );

    // 检查成就解?    const achievementResult = this.checkAchievementUnlock(
      profile,
      activityType,
      activityDetails
    );

    // 记录成长历史
    this.recordGrowthEvent(
      profile,
      'points_earned',
      {
        activityType,
        points: pointsEarned,
        ...activityDetails,
      },
      pointsEarned
    );

    // 更新档案
    this.userProfiles.set(userId, profile);

    return {
      pointsEarned,
      levelUp: levelResult.levelUp,
      newLevel: levelResult.newLevel,
      newMilestones: milestoneResult.newMilestones,
      achievementsUnlocked: achievementResult.unlockedAchievements,
    };
  }

  // 计算活动积分
  private calculateActivityPoints(
    activityType: string,
    details: Record<string, any>
  ): number {
    const basePoints: Record<string, number> = {
      login: 10,
      feature_use: 25,
      tutorial_completion: 100,
      first_device_add: 50,
      repair_ticket_create: 30,
      feedback_submit: 20,
      referral_success: 200,
      daily_checkin: 5,
      content_share: 15,
      help_others: 40,
    };

    let points = basePoints[activityType] || 10;

    // 根据活动详情调整积分
    if (details.complexity === 'high') points *= 1.5;
    if (details.first_time) points *= 2;
    if (details.quality === 'excellent') points *= 1.2;

    // 应用季节性倍数
    const seasonalMultiplier = this.getActiveEventMultiplier();
    points = Math.round(points * seasonalMultiplier);

    return points;
  }

  // 检查等级升?  private checkLevelUpgrade(profile: UserGrowthProfile): {
    levelUp: boolean;
    newLevel?: string;
  } {
    const currentLevelConfig = this.config.levels.find(
      l => l.levelId === profile.currentLevel
    );
    if (!currentLevelConfig) return { levelUp: false };

    const nextLevelConfig = this.config.levels.find(
      l => l.levelNumber === currentLevelConfig.levelNumber + 1
    );
    if (!nextLevelConfig) return { levelUp: false }; // 已达到最高等?
    if (profile.totalPoints >= nextLevelConfig.requiredPoints) {
      const previousLevel = profile.currentLevel;
      profile.currentLevel = nextLevelConfig.levelId;
      profile.pointsToNextLevel = this.calculatePointsToNextLevel(profile);
      profile.levelProgress = 100;

      // 记录升级历史
      this.recordGrowthEvent(
        profile,
        'level_up',
        {
          fromLevel: previousLevel,
          toLevel: nextLevelConfig.levelId,
        },
        0
      );

      return { levelUp: true, newLevel: nextLevelConfig.levelId };
    } else {
      profile.levelProgress = this.calculateLevelProgress(profile);
      profile.pointsToNextLevel = this.calculatePointsToNextLevel(profile);
    }

    return { levelUp: false };
  }

  // 检查里程碑完成
  private checkMilestoneCompletion(
    profile: UserGrowthProfile,
    activityType: string
  ): { newMilestones: string[] } {
    const completedMilestones: string[] = [];

    this.config.milestones.forEach(milestone => {
      // 检查是否已经完?      const existingMilestone = profile.recentMilestones.find(
        m => m.milestoneId === milestone.milestoneId
      );
      if (existingMilestone?.completedAt) return;

      // 检查触发条?      let progress = 0;
      switch (milestone.triggerType) {
        case 'points_reached':
          progress =
            profile.totalPoints >= milestone.triggerValue
              ? 100
              : (profile.totalPoints / milestone.triggerValue) * 100;
          break;
        case 'days_active':
          progress =
            profile.activityStreak >= milestone.triggerValue
              ? 100
              : (profile.activityStreak / milestone.triggerValue) * 100;
          break;
        case 'features_used':
          // 这里需要实际的功能使用统计
          progress = 50; // 示例?          break;
        case 'achievements_unlocked':
          progress =
            (profile.achievements.length / milestone.triggerValue) * 100;
          break;
      }

      if (progress >= 100) {
        // 里程碑完?        if (existingMilestone) {
          existingMilestone.completedAt = new Date().toISOString();
          existingMilestone.progress = 100;
        } else {
          profile.recentMilestones.push({
            milestoneId: milestone.milestoneId,
            progress: 100,
            completedAt: new Date().toISOString(),
            rewardsClaimed: false,
          });
        }

        // 发放里程碑奖?        this.awardMilestoneRewards(profile, milestone);
        completedMilestones.push(milestone.milestoneId);

        // 记录里程碑完成历?        this.recordGrowthEvent(
          profile,
          'milestone_complete',
          {
            milestoneId: milestone.milestoneId,
            rewards: milestone.rewards,
          },
          0
        );
      } else {
        // 更新进度
        if (existingMilestone) {
          existingMilestone.progress = progress;
        } else {
          profile.recentMilestones.push({
            milestoneId: milestone.milestoneId,
            progress,
            rewardsClaimed: false,
          });
        }
      }
    });

    return { newMilestones: completedMilestones };
  }

  // 检查成就解?  private checkAchievementUnlock(
    profile: UserGrowthProfile,
    activityType: string,
    details: Record<string, any>
  ): { unlockedAchievements: string[] } {
    // 这里应该集成成就系统来检查具体成?    const unlockedAchievements: string[] = [];

    // 示例成就检查逻辑
    if (
      activityType === 'tutorial_completion' &&
      !profile.achievements.some(a => a.achievementId === 'quick_learner')
    ) {
      profile.achievements.push({
        achievementId: 'quick_learner',
        unlockedAt: new Date().toISOString(),
        pointsAwarded: 100,
        relatedActivity: activityType,
      });
      unlockedAchievements.push('quick_learner');
    }

    return { unlockedAchievements };
  }

  // 发放里程碑奖?  private awardMilestoneRewards(
    profile: UserGrowthProfile,
    milestone: MilestoneConfig
  ): void {
    milestone.rewards.forEach(reward => {
      switch (reward.type) {
        case 'points_bonus':
          profile.totalPoints += reward.value;
          break;
        case 'exclusive_item':
          // 这里应该调用物品系统
          break;
        case 'title':
          // 这里应该更新用户头衔
          break;
        case 'feature_access':
          // 这里应该解锁功能
          break;
      }
    });
  }

  // 计算等级进度
  private calculateLevelProgress(profile: UserGrowthProfile): number {
    const currentLevelConfig = this.config.levels.find(
      l => l.levelId === profile.currentLevel
    );
    const nextLevelConfig = this.config.levels.find(
      l => l.levelNumber === (currentLevelConfig?.levelNumber || 0) + 1
    );

    if (!currentLevelConfig || !nextLevelConfig) return 100;

    const pointsInCurrentLevel =
      profile.totalPoints - currentLevelConfig.requiredPoints;
    const pointsNeededForNextLevel =
      nextLevelConfig.requiredPoints - currentLevelConfig.requiredPoints;

    return Math.min(
      100,
      (pointsInCurrentLevel / pointsNeededForNextLevel) * 100
    );
  }

  // 计算到下一级所需积分
  private calculatePointsToNextLevel(profile: UserGrowthProfile): number {
    const currentLevelConfig = this.config.levels.find(
      l => l.levelId === profile.currentLevel
    );
    const nextLevelConfig = this.config.levels.find(
      l => l.levelNumber === (currentLevelConfig?.levelNumber || 0) + 1
    );

    if (!nextLevelConfig) return 0; // 已达到最高等?
    return Math.max(0, nextLevelConfig.requiredPoints - profile.totalPoints);
  }

  // 计算活跃天数
  private calculateActivityStreak(profile: UserGrowthProfile): number {
    const lastActive = new Date(profile.lastActiveDate);
    const today = new Date();
    const diffDays = Math.floor(
      (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );

    return diffDays <= 1
      ? profile.activityStreak + (diffDays === 0 ? 0 : 1)
      : 1;
  }

  // 记录成长事件
  private recordGrowthEvent(
    profile: UserGrowthProfile,
    type: GrowthRecord['type'],
    details: Record<string, any>,
    pointsChange: number
  ): void {
    const record: GrowthRecord = {
      recordId: `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: new Date().toISOString(),
      details,
      pointsChange,
    };

    profile.growthHistory.push(record);

    // 保持历史记录在合理范围内
    if (profile.growthHistory.length > 100) {
      profile.growthHistory = profile.growthHistory.slice(-50);
    }
  }

  // 获取用户成长档案
  getUserGrowthProfile(userId: string): UserGrowthProfile | undefined {
    return this.userProfiles.get(userId);
  }

  // 获取等级配置
  getLevelConfig(levelId: string): LevelConfig | undefined {
    return this.config.levels.find(l => l.levelId === levelId);
  }

  // 获取可用奖励
  getAvailableRewards(userId: string): RewardConfig[] {
    const profile = this.userProfiles.get(userId);
    if (!profile) return [];

    return this.config.rewards.filter(
      reward =>
        reward.cost <= profile.totalPoints &&
        (!reward.stock || reward.stock > 0) &&
        this.checkRewardAvailability(reward, userId)
    );
  }

  // 兑换奖励
  async redeemReward(userId: string, rewardId: string): Promise<boolean> {
    const profile = this.userProfiles.get(userId);
    const reward = this.config.rewards.find(r => r.rewardId === rewardId);

    if (!profile || !reward) return false;

    if (profile.totalPoints < reward.cost) return false;
    if (reward.stock !== undefined && reward.stock <= 0) return false;

    // 检查兑换限?    if (!this.checkRedemptionLimit(userId, reward)) return false;

    // 扣除积分
    profile.totalPoints -= reward.cost;

    // 减少库存
    if (reward.stock !== undefined) {
      reward.stock--;
    }

    // 记录兑换历史
    this.recordGrowthEvent(
      profile,
      'points_earned',
      {
        action: 'reward_redemption',
        rewardId,
        rewardName: reward.name,
      },
      -reward.cost
    );

    this.userProfiles.set(userId, profile);
    return true;
  }

  // 辅助方法
  private checkRewardAvailability(
    reward: RewardConfig,
    userId: string
  ): boolean {
    // 检查季节性奖?    if (reward.availability === 'seasonal') {
      return this.activeEvents.size > 0;
    }
    return true;
  }

  private checkRedemptionLimit(userId: string, reward: RewardConfig): boolean {
    if (!reward.redemptionLimit) return true;

    const profile = this.userProfiles.get(userId);
    if (!profile) return false;

    // 这里应该检查用户的兑换历史
    return true;
  }

  private getActiveEventMultiplier(): number {
    let multiplier = 1;
    this.activeEvents.forEach(eventId => {
      const event = this.config.seasonalEvents.find(e => e.eventId === eventId);
      if (event) {
        multiplier *= event.bonusMultiplier;
      }
    });
    return multiplier;
  }

  private checkAndActivateSeasonalEvents(): void {
    const now = new Date();

    this.config.seasonalEvents.forEach(event => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);

      if (now >= startDate && now <= endDate) {
        this.activeEvents.add(event.eventId);
      } else {
        this.activeEvents.delete(event.eventId);
      }
    });
  }

  private processDailyProgression(): void {
    // 处理每日进度更新
    this.userProfiles.forEach((profile, userId) => {
      // 检查每日签到奖?      this.checkDailyCheckin(profile);

      // 更新档案
      this.userProfiles.set(userId, profile);
    });
  }

  private checkDailyCheckin(profile: UserGrowthProfile): void {
    const today = new Date().toISOString().split('T')[0];
    const lastCheckin = profile.lastActiveDate.split('T')[0];

    if (today !== lastCheckin) {
      // 发放签到奖励
      profile.totalPoints += 5; // 每日签到5积分

      this.recordGrowthEvent(
        profile,
        'points_earned',
        {
          action: 'daily_checkin',
          date: today,
        },
        5
      );
    }
  }

  // 获取系统统计
  getSystemStats(): {
    totalUsers: number;
    activeEvents: number;
    averageLevel: number;
    totalPointsDistributed: number;
  } {
    let totalPoints = 0;
    let levelSum = 0;

    this.userProfiles.forEach(profile => {
      totalPoints += profile.totalPoints;
      const levelConfig = this.config.levels.find(
        l => l.levelId === profile.currentLevel
      );
      levelSum += levelConfig?.levelNumber || 1;
    });

    return {
      totalUsers: this.userProfiles.size,
      activeEvents: this.activeEvents.size,
      averageLevel:
        this.userProfiles.size > 0 ? levelSum / this.userProfiles.size : 1,
      totalPointsDistributed: totalPoints,
    };
  }
}

// 预定义的成长路径配置
export class GrowthPathPresets {
  static getStandardPath(): GrowthPathConfig {
    return {
      levels: [
        {
          levelId: 'beginner',
          levelName: '新手学徒',
          levelNumber: 1,
          requiredPoints: 0,
          benefits: [
            { type: 'discount', value: 5, description: '购物?%折扣' },
          ],
          badge: '🌱',
          color: 'green',
          unlockRequirements: [],
        },
        {
          levelId: 'apprentice',
          levelName: '熟练工匠',
          levelNumber: 2,
          requiredPoints: 500,
          benefits: [
            { type: 'discount', value: 10, description: '购物?0%折扣' },
            {
              type: 'priority_support',
              value: true,
              description: '优先客服支持',
            },
          ],
          badge: '🔧',
          color: 'blue',
          unlockRequirements: [
            { type: 'points', value: 500, description: '累积500积分' },
          ],
        },
        {
          levelId: 'expert',
          levelName: '专业大师',
          levelNumber: 3,
          requiredPoints: 1500,
          benefits: [
            { type: 'discount', value: 15, description: '购物?5%折扣' },
            {
              type: 'priority_support',
              value: true,
              description: 'VIP客服支持',
            },
            {
              type: 'exclusive_features',
              value: ['advanced_analytics'],
              description: '解锁高级分析功能',
            },
          ],
          badge: '🏆',
          color: 'gold',
          unlockRequirements: [
            { type: 'points', value: 1500, description: '累积1500积分' },
          ],
        },
      ],
      milestones: [
        {
          milestoneId: 'first_login',
          name: '初次见面',
          description: '完成首次登录',
          triggerType: 'points_reached',
          triggerValue: 10,
          rewards: [
            { type: 'points_bonus', value: 50, description: '额外获得50积分' },
          ],
          celebrationType: 'badge',
        },
        {
          milestoneId: 'week_active',
          name: '活跃一?,
          description: '连续7天活?,
          triggerType: 'days_active',
          triggerValue: 7,
          rewards: [
            {
              type: 'points_bonus',
              value: 100,
              description: '额外获得100积分',
            },
            {
              type: 'exclusive_item',
              value: 'weekly_champion_badge',
              description: '获得周冠军徽?,
            },
          ],
          celebrationType: 'popup',
        },
      ],
      rewards: [
        {
          rewardId: 'premium_theme',
          name: '高级主题?,
          description: '解锁精美网站主题',
          cost: 200,
          category: 'virtual',
          availability: 'permanent',
        },
        {
          rewardId: 'priority_support',
          name: '优先技术支?,
          description: '享受专属客服通道',
          cost: 500,
          category: 'service',
          availability: 'permanent',
        },
      ],
      progressionRules: [
        {
          ruleId: 'daily_login',
          name: '每日登录奖励',
          description: '每天登录获得积分',
          condition: {
            type: 'user_action',
            parameters: { action: 'login' },
          },
          action: {
            type: 'award_points',
            parameters: { points: 10 },
          },
          frequency: 'daily',
        },
      ],
      seasonalEvents: [
        {
          eventId: 'spring_festival',
          name: '春季庆典',
          description: '春季特别活动，双倍积分奖?,
          startDate: '2024-03-01',
          endDate: '2024-03-31',
          bonusMultiplier: 2.0,
          specialRewards: [
            {
              type: 'points_multiplier',
              value: 2,
              description: '活动期间积分翻?,
            },
          ],
          participationRequirements: [{ type: 'minimum_activity', value: 3 }],
        },
      ],
    };
  }
}
