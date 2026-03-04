/**
 * 违规处理服务
 * FixCycle 6.0 违规内容管理系统
 */

export interface ViolationRecord {
  /** 违规记录ID */
  id: string;
  /** 内容ID */
  contentId: string;
  /** 违规类型 */
  violationType: string;
  /** 严重程度 */
  severity: 'minor' | 'moderate' | 'serious' | 'severe';
  /** 违规描述 */
  description: string;
  /** 违规证据 */
  evidence: string[];
  /** 检测方?*/
  detectionMethod: 'auto' | 'manual' | 'user_report';
  /** 检测时?*/
  detectedAt: number;
  /** 处理状?*/
  status: 'pending' | 'processing' | 'resolved' | 'appealed' | 'dismissed';
  /** 处理结果 */
  resolution?: ViolationResolution;
  /** 申诉信息 */
  appeal?: AppealInfo;
  /** 创建者ID */
  reporterId?: string;
}

export interface ViolationResolution {
  /** 处理类型 */
  action:
    | 'content_removed'
    | 'content_modified'
    | 'account_warned'
    | 'account_suspended'
    | 'account_banned';
  /** 处理原因 */
  reason: string;
  /** 处理时间 */
  resolvedAt: number;
  /** 处理人ID */
  resolverId: string;
  /** 处罚期限 */
  penaltyDuration?: number; // 以天为单?  /** 相关备注 */
  notes?: string;
}

export interface AppealInfo {
  /** 申诉ID */
  id: string;
  /** 申诉人ID */
  appellantId: string;
  /** 申诉理由 */
  reason: string;
  /** 申诉证据 */
  evidence: string[];
  /** 申诉时间 */
  submittedAt: number;
  /** 申诉状?*/
  status: 'submitted' | 'reviewing' | 'approved' | 'rejected';
  /** 处理结果 */
  resolution?: AppealResolution;
}

export interface AppealResolution {
  /** 处理决定 */
  decision: 'approve' | 'reject';
  /** 处理理由 */
  reason: string;
  /** 处理时间 */
  resolvedAt: number;
  /** 处理人ID */
  resolverId: string;
  /** 后续行动 */
  nextAction?: 'restore_content' | 'reduce_penalty' | 'maintain_decision';
}

export interface UserPenalty {
  /** 用户ID */
  userId: string;
  /** 处罚类型 */
  penaltyType: 'warning' | 'temporary_suspension' | 'permanent_ban';
  /** 处罚原因 */
  reason: string;
  /** 开始时?*/
  startDate: number;
  /** 结束时间 */
  endDate?: number;
  /** 处罚状?*/
  status: 'active' | 'expired' | 'lifted';
  /** 相关违规记录 */
  violationIds: string[];
  /** 处理人ID */
  issuerId: string;
}

export interface ViolationPolicy {
  /** 政策ID */
  id: string;
  /** 政策名称 */
  name: string;
  /** 违规类型 */
  violationType: string;
  /** 严重程度映射 */
  severityMapping: Record<string, 'minor' | 'moderate' | 'serious' | 'severe'>;
  /** 处罚规则 */
  penaltyRules: PenaltyRule[];
  /** 申诉规则 */
  appealRules: AppealRule;
  /** 生效时间 */
  effectiveFrom: number;
  /** 失效时间 */
  effectiveTo?: number;
  /** 是否启用 */
  enabled: boolean;
}

export interface PenaltyRule {
  /** 规则条件 */
  condition: {
    violationType: string;
    severity: string;
    repeatCount?: number;
  };
  /** 处罚措施 */
  penalties: {
    action:
      | 'content_removed'
      | 'content_modified'
      | 'account_warned'
      | 'account_suspended'
      | 'account_banned';
    duration?: number; // 天数
    scope?: 'specific' | 'all'; // 作用范围
  }[];
}

export interface AppealRule {
  /** 申诉资格 */
  eligibility: {
    timeframe: number; // 申诉时间窗口(�?
    maxAppeals: number; // 最大申诉次?  };
  /** 审核流程 */
  reviewProcess: {
    reviewLevels: number; // 审核层级?    timeLimits: Record<string, number>; // 各层级时间限?  };
}

export class ViolationManagementService {
  private violations: Map<string, ViolationRecord> = new Map();
  private penalties: Map<string, UserPenalty[]> = new Map();
  private policies: Map<string, ViolationPolicy> = new Map();
  private appeals: Map<string, AppealInfo> = new Map();

  constructor() {
    this.initializeDefaultPolicies();
  }

  /**
   * 初始化默认违规政?   */
  private initializeDefaultPolicies(): void {
    const defaultPolicies: ViolationPolicy[] = [
      {
        id: 'policy_spam',
        name: '垃圾信息处理政策',
        violationType: 'spam',
        severityMapping: {
          advertisement: 'moderate',
          repetitive_posting: 'serious',
          malicious_links: 'severe',
        },
        penaltyRules: [
          {
            condition: {
              violationType: 'spam',
              severity: 'moderate',
            },
            penalties: [
              { action: 'content_removed' },
              { action: 'account_warned' },
            ],
          },
          {
            condition: {
              violationType: 'spam',
              severity: 'serious',
              repeatCount: 2,
            },
            penalties: [
              { action: 'content_removed' },
              { action: 'account_suspended', duration: 7 },
            ],
          },
          {
            condition: {
              violationType: 'spam',
              severity: 'severe',
            },
            penalties: [
              { action: 'content_removed' },
              { action: 'account_banned' },
            ],
          },
        ],
        appealRules: {
          eligibility: {
            timeframe: 30,
            maxAppeals: 2,
          },
          reviewProcess: {
            reviewLevels: 2,
            timeLimits: {
              first_level: 48, // 48小时
              second_level: 72, // 72小时
            },
          },
        },
        effectiveFrom: Date.now(),
        enabled: true,
      },
      {
        id: 'policy_harassment',
        name: '骚扰内容处理政策',
        violationType: 'harassment',
        severityMapping: {
          verbal_abuse: 'serious',
          threatening_behavior: 'severe',
          hate_speech: 'severe',
        },
        penaltyRules: [
          {
            condition: {
              violationType: 'harassment',
              severity: 'serious',
            },
            penalties: [
              { action: 'content_removed' },
              { action: 'account_suspended', duration: 30 },
            ],
          },
          {
            condition: {
              violationType: 'harassment',
              severity: 'severe',
            },
            penalties: [
              { action: 'content_removed' },
              { action: 'account_banned' },
            ],
          },
        ],
        appealRules: {
          eligibility: {
            timeframe: 15,
            maxAppeals: 1,
          },
          reviewProcess: {
            reviewLevels: 3,
            timeLimits: {
              first_level: 24,
              second_level: 48,
              third_level: 120,
            },
          },
        },
        effectiveFrom: Date.now(),
        enabled: true,
      },
    ];

    defaultPolicies.forEach(policy => {
      this.policies.set(policy.id, policy);
    });
  }

  /**
   * 记录违规行为
   */
  recordViolation(
    violation: Omit<ViolationRecord, 'id' | 'detectedAt' | 'status'>
  ): ViolationRecord {
    const violationRecord: ViolationRecord = {
      id: `vio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      detectedAt: Date.now(),
      status: 'pending',
      ...violation,
    };

    this.violations.set(violationRecord.id, violationRecord);

    // 根据违规类型和严重程度自动处?    this.processViolation(violationRecord);

    return violationRecord;
  }

  /**
   * 处理违规记录
   */
  private processViolation(violation: ViolationRecord): void {
    const policy = Array.from(this.policies.values()).find(
      p => p.violationType === violation.violationType && p.enabled
    );

    if (!policy) {
      console.warn(
        `No policy found for violation type: ${violation.violationType}`
      );
      return;
    }

    // 获取用户历史违规记录
    const userViolations = this.getUserViolations(violation.reporterId || '');
    const repeatCount = userViolations.filter(
      v => v.violationType === violation.violationType
    ).length;

    // 查找匹配的处罚规?    const matchingRule = policy.penaltyRules.find(
      rule =>
        rule.condition.violationType === violation.violationType &&
        rule.condition.severity === violation.severity &&
        (!rule.condition.repeatCount ||
          repeatCount >= rule.condition.repeatCount)
    );

    if (matchingRule) {
      // 应用处罚
      this.applyPenalties(violation, matchingRule.penalties, policy);

      // 更新违规记录状?      violation.status = 'processing';
    }
  }

  /**
   * 应用处罚措施
   */
  private applyPenalties(
    violation: ViolationRecord,
    penalties: PenaltyRule['penalties'],
    policy: ViolationPolicy
  ): void {
    const userId = violation.reporterId;
    if (!userId) return;

    penalties.forEach(penalty => {
      switch (penalty.action) {
        case 'content_removed':
          this.removeContent(violation.contentId, violation.id);
          break;

        case 'content_modified':
          this.modifyContent(violation.contentId, violation.id);
          break;

        case 'account_warned':
          this.issueWarning(userId, violation.id, policy.name);
          break;

        case 'account_suspended':
          this.suspendAccount(
            userId,
            penalty.duration || 1,
            violation.id,
            policy.name
          );
          break;

        case 'account_banned':
          this.banAccount(userId, violation.id, policy.name);
          break;
      }
    });
  }

  /**
   * 移除违规内容
   */
  private removeContent(contentId: string, violationId: string): void {
    // 实际应用中会调用内容管理服务
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
      `Removing content: ${contentId} due to violation: ${violationId}`
    )// 更新违规记录
    const violation = this.violations.get(violationId);
    if (violation) {
      violation.resolution = {
        action: 'content_removed',
        reason: '违规内容已移?,
        resolvedAt: Date.now(),
        resolverId: 'system',
      };
      violation.status = 'resolved';
    }
  }

  /**
   * 修改违规内容
   */
  private modifyContent(contentId: string, violationId: string): void {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
      `Modifying content: ${contentId} due to violation: ${violationId}`
    )const violation = this.violations.get(violationId);
    if (violation) {
      violation.resolution = {
        action: 'content_modified',
        reason: '违规内容已修?,
        resolvedAt: Date.now(),
        resolverId: 'system',
      };
      violation.status = 'resolved';
    }
  }

  /**
   * 发出警告
   */
  private issueWarning(
    userId: string,
    violationId: string,
    policyName: string
  ): void {
    const penalty: UserPenalty = {
      userId,
      penaltyType: 'warning',
      reason: `违反${policyName}政策`,
      startDate: Date.now(),
      status: 'active',
      violationIds: [violationId],
      issuerId: 'system',
    };

    this.addUserPenalty(userId, penalty);

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
      `Warning issued to user: ${userId} for violation: ${violationId}`
    )}

  /**
   * 暂停账户
   */
  private suspendAccount(
    userId: string,
    duration: number,
    violationId: string,
    policyName: string
  ): void {
    const penalty: UserPenalty = {
      userId,
      penaltyType: 'temporary_suspension',
      reason: `违反${policyName}政策`,
      startDate: Date.now(),
      endDate: Date.now() + duration * 24 * 60 * 60 * 1000,
      status: 'active',
      violationIds: [violationId],
      issuerId: 'system',
    };

    this.addUserPenalty(userId, penalty);

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
      `Account suspended: ${userId} for ${duration} days due to violation: ${violationId}`
    )}

  /**
   * 封禁账户
   */
  private banAccount(
    userId: string,
    violationId: string,
    policyName: string
  ): void {
    const penalty: UserPenalty = {
      userId,
      penaltyType: 'permanent_ban',
      reason: `严重违反${policyName}政策`,
      startDate: Date.now(),
      status: 'active',
      violationIds: [violationId],
      issuerId: 'system',
    };

    this.addUserPenalty(userId, penalty);

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
      `Account banned: ${userId} due to severe violation: ${violationId}`
    )}

  /**
   * 添加用户处罚记录
   */
  private addUserPenalty(userId: string, penalty: UserPenalty): void {
    if (!this.penalties.has(userId)) {
      this.penalties.set(userId, []);
    }

    this.penalties.get(userId)!.push(penalty);
  }

  /**
   * 提交申诉
   */
  submitAppeal(
    appeal: Omit<AppealInfo, 'id' | 'submittedAt' | 'status'>
  ): AppealInfo {
    const appealRecord: AppealInfo = {
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      submittedAt: Date.now(),
      status: 'submitted',
      ...appeal,
    };

    this.appeals.set(appealRecord.id, appealRecord);

    // 更新关联的违规记?    const violation = this.violations.get(appeal.appellantId);
    if (violation) {
      violation.appeal = appealRecord;
      violation.status = 'appealed';
    }

    // 启动申诉处理流程
    this.processAppeal(appealRecord);

    return appealRecord;
  }

  /**
   * 处理申诉
   */
  private processAppeal(appeal: AppealInfo): void {
    // 模拟申诉处理流程
    setTimeout(() => {
      // 随机决定申诉结果（实际应用中会有专门的审核流程）
      const approved = Math.random() > 0.4; // 60%通过?
      appeal.status = 'reviewing';

      setTimeout(() => {
        const resolution: AppealResolution = {
          decision: approved ? 'approve' : 'reject',
          reason: approved
            ? '申诉理由充分，撤销原处?
            : '申诉理由不足，维持原决定',
          resolvedAt: Date.now(),
          resolverId: 'appeal_reviewer',
        };

        appeal.resolution = resolution;
        appeal.status = approved ? 'approved' : 'rejected';

        // 如果申诉通过，执行相应操?        if (approved) {
          this.handleApprovedAppeal(appeal);
        }

        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
          `Appeal ${appeal.id} ${approved ? 'approved' : 'rejected'}`
        )}, 2000); // 模拟处理时间
    }, 1000);
  }

  /**
   * 处理通过的申?   */
  private handleApprovedAppeal(appeal: AppealInfo): void {
    // 根据申诉结果执行相应操作
    const nextAction = appeal.resolution?.nextAction;

    switch (nextAction) {
      case 'restore_content':
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`Restoring content for appeal: ${appeal.id}`)break;

      case 'reduce_penalty':
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`Reducing penalty for appeal: ${appeal.id}`)break;

      case 'maintain_decision':
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`Maintaining original decision for appeal: ${appeal.id}`)break;
    }
  }

  /**
   * 获取用户违规记录
   */
  getUserViolations(userId: string): ViolationRecord[] {
    return Array.from(this.violations.values())
      .filter(v => v.reporterId === userId)
      .sort((a, b) => b.detectedAt - a.detectedAt);
  }

  /**
   * 获取用户处罚记录
   */
  getUserPenalties(userId: string): UserPenalty[] {
    return this.penalties.get(userId) || [];
  }

  /**
   * 获取活跃处罚
   */
  getActivePenalties(userId: string): UserPenalty[] {
    const now = Date.now();
    return (this.penalties.get(userId) || []).filter(penalty => {
      if (penalty.status !== 'active') return false;
      if (penalty.penaltyType === 'permanent_ban') return true;
      if (penalty.endDate && penalty.endDate < now) {
        penalty.status = 'expired';
        return false;
      }
      return true;
    });
  }

  /**
   * 解除处罚
   */
  liftPenalty(penaltyId: string, liftedBy: string, reason: string): boolean {
    let found = false;

    this.penalties.forEach(penalties => {
      const penalty = penalties.find(
        p => `${p.userId}_${p.startDate}` === penaltyId && p.status === 'active'
      );

      if (penalty) {
        penalty.status = 'lifted';
        // 记录解除信息
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`Penalty lifted by ${liftedBy}: ${reason}`)found = true;
      }
    });

    return found;
  }

  /**
   * 获取统计信息
   */
  getStatistics(): {
    totalViolations: number;
    violationsByType: Record<string, number>;
    violationsByStatus: Record<string, number>;
    totalPenalties: number;
    penaltiesByType: Record<string, number>;
    activePenalties: number;
    totalAppeals: number;
    appealsByStatus: Record<string, number>;
  } {
    const violations = Array.from(this.violations.values());
    const penalties = Array.from(this.penalties.values()).flat();
    const appeals = Array.from(this.appeals.values());

    return {
      totalViolations: violations.length,
      violationsByType: this.countBy(violations, 'violationType'),
      violationsByStatus: this.countBy(violations, 'status'),
      totalPenalties: penalties.length,
      penaltiesByType: this.countBy(penalties, 'penaltyType'),
      activePenalties: penalties.filter(p => p.status === 'active').length,
      totalAppeals: appeals.length,
      appealsByStatus: this.countBy(appeals, 'status'),
    };
  }

  /**
   * 通用计数函数
   */
  private countBy<T>(items: T[], key: keyof T): Record<string, number> {
    const counts: Record<string, number> = {};
    items.forEach(item => {
      const value = String(item[key]);
      counts[value] = (counts[value] || 0) + 1;
    });
    return counts;
  }

  /**
   * 获取所有政?   */
  getPolicies(): ViolationPolicy[] {
    return Array.from(this.policies.values());
  }

  /**
   * 添加新政?   */
  addPolicy(policy: ViolationPolicy): void {
    policy.effectiveFrom = Date.now();
    this.policies.set(policy.id, policy);
  }

  /**
   * 更新政策
   */
  updatePolicy(policyId: string, updates: Partial<ViolationPolicy>): boolean {
    const policy = this.policies.get(policyId);
    if (!policy) return false;

    Object.assign(policy, updates);
    return true;
  }

  /**
   * 删除政策
   */
  deletePolicy(policyId: string): boolean {
    return this.policies.delete(policyId);
  }
}

// 导出全局违规管理服务实例
export const violationManagementService = new ViolationManagementService();
