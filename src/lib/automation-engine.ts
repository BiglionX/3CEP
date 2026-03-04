// 自动化规则引?- 支持条件配置、动作执行、定时任务的智能自动化系?
export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'greater_than'
  | 'less_than'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'in'
  | 'not_in'
  | 'exists'
  | 'not_exists';

export type ActionType =
  | 'send_notification'
  | 'update_user_status'
  | 'assign_role'
  | 'trigger_workflow'
  | 'send_email'
  | 'create_task'
  | 'log_activity'
  | 'export_data';

export interface RuleCondition {
  field: string; // 字段?(�? user.valueTier, behavior.frequency)
  operator: ConditionOperator;
  value: any; // 比较?  logicalOperator?: 'and' | 'or'; // 逻辑操作?}

export interface ActionConfig {
  type: ActionType;
  parameters: Record<string, any>; // 动作参数
  delay?: number; // 延迟执行时间(毫秒)
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: 'manual' | 'scheduled' | 'event_based' | 'real_time';
  conditions: RuleCondition[];
  actions: ActionConfig[];
  schedule?: {
    cronExpression?: string; // Cron表达?    interval?: number; // 执行间隔(毫秒)
    startTime?: string; // 开始时?    endTime?: string; // 结束时间
  };
  metadata: {
    createdBy: string;
    createdAt: string;
    lastModified: string;
    executionCount: number;
    lastExecution?: string;
  };
}

export interface RuleExecutionContext {
  userData?: any;
  behaviorData?: any[];
  systemData?: any;
  timestamp: string;
}

export interface ExecutionResult {
  ruleId: string;
  success: boolean;
  executedActions: number;
  failedActions: number;
  executionTime: number;
  error?: string;
  details?: any;
}

// 规则评估?export class RuleEvaluator {
  // 评估单个条件
  evaluateCondition(condition: RuleCondition, context: any): boolean {
    const { field, operator, value } = condition;
    const fieldValue = this.getFieldValue(field, context);

    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'not_equals':
        return fieldValue !== value;
      case 'greater_than':
        return Number(fieldValue) > Number(value);
      case 'less_than':
        return Number(fieldValue) < Number(value);
      case 'contains':
        return String(fieldValue).includes(String(value));
      case 'not_contains':
        return !String(fieldValue).includes(String(value));
      case 'starts_with':
        return String(fieldValue).startsWith(String(value));
      case 'ends_with':
        return String(fieldValue).endsWith(String(value));
      case 'in':
        return Array.isArray(value) && value.includes(fieldValue);
      case 'not_in':
        return Array.isArray(value) && !value.includes(fieldValue);
      case 'exists':
        return fieldValue !== undefined && fieldValue !== null;
      case 'not_exists':
        return fieldValue === undefined || fieldValue === null;
      default:
        return false;
    }
  }

  // 评估条件?  evaluateConditions(conditions: RuleCondition[], context: any): boolean {
    if (conditions.length === 0) return true;

    let result = this.evaluateCondition(conditions[0], context);

    for (let i = 1; i < conditions.length; i++) {
      const condition = conditions[i];
      const logicalOp = condition.logicalOperator || 'and';
      const conditionResult = this.evaluateCondition(condition, context);

      if (logicalOp === 'and') {
        result = result && conditionResult;
      } else {
        result = result || conditionResult;
      }
    }

    return result;
  }

  // 获取字段值（支持嵌套路径?  private getFieldValue(fieldPath: string, context: any): any {
    const parts = fieldPath.split('.');
    let value = context;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }
}

// 动作执行?export class ActionExecutor {
  async executeAction(
    action: ActionConfig,
    context: RuleExecutionContext
  ): Promise<boolean> {
    const { type, parameters, delay } = action;

    // 延迟执行
    if (delay && delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    try {
      switch (type) {
        case 'send_notification':
          return await this.sendNotification(parameters, context);
        case 'update_user_status':
          return await this.updateUserStatus(parameters, context);
        case 'assign_role':
          return await this.assignRole(parameters, context);
        case 'trigger_workflow':
          return await this.triggerWorkflow(parameters, context);
        case 'send_email':
          return await this.sendEmail(parameters, context);
        case 'create_task':
          return await this.createTask(parameters, context);
        case 'log_activity':
          return await this.logActivity(parameters, context);
        case 'export_data':
          return await this.exportData(parameters, context);
        default:
          throw new Error(`不支持的动作类型: ${type}`);
      }
    } catch (error) {
      console.error(`执行动作 ${type} 失败:`, error);
      return false;
    }
  }

  private async sendNotification(
    params: any,
    context: RuleExecutionContext
  ): Promise<boolean> {
    // 发送系统通知
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`发送通知给用? ${params.userId}`, params.message)// 实际实现中会调用通知服务
    return true;
  }

  private async updateUserStatus(
    params: any,
    context: RuleExecutionContext
  ): Promise<boolean> {
    // 更新用户状?    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`更新用户 ${params.userId} 状态为: ${params.status}`)// 实际实现中会调用用户管理API
    return true;
  }

  private async assignRole(
    params: any,
    context: RuleExecutionContext
  ): Promise<boolean> {
    // 分配用户角色
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`为用?${params.userId} 分配角色: ${params.role}`)// 实际实现中会调用权限管理API
    return true;
  }

  private async triggerWorkflow(
    params: any,
    context: RuleExecutionContext
  ): Promise<boolean> {
    // 触发工作?    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`触发工作? ${params.workflowId}`)// 实际实现中会调用工作流引?    return true;
  }

  private async sendEmail(
    params: any,
    context: RuleExecutionContext
  ): Promise<boolean> {
    // 发送邮?    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`发送邮件到: ${params.recipient}`, params.subject)// 实际实现中会调用邮件服务
    return true;
  }

  private async createTask(
    params: any,
    context: RuleExecutionContext
  ): Promise<boolean> {
    // 创建任务
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`创建任务: ${params.title} 分配? ${params.assignee}`)// 实际实现中会调用任务管理系统
    return true;
  }

  private async logActivity(
    params: any,
    context: RuleExecutionContext
  ): Promise<boolean> {
    // 记录活动日志
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`记录活动: ${params.activityType}`, params.details)// 实际实现中会写入日志系统
    return true;
  }

  private async exportData(
    params: any,
    context: RuleExecutionContext
  ): Promise<boolean> {
    // 导出数据
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`导出数据类型: ${params.dataType}`, params.format)// 实际实现中会调用数据导出服务
    return true;
  }
}

// 自动化规则引擎核心类
export class AutomationEngine {
  private rules: Map<string, AutomationRule>;
  private evaluator: RuleEvaluator;
  private executor: ActionExecutor;
  private executionHistory: ExecutionResult[];
  private timers: Map<string, NodeJS.Timeout>;

  constructor() {
    this.rules = new Map();
    this.evaluator = new RuleEvaluator();
    this.executor = new ActionExecutor();
    this.executionHistory = [];
    this.timers = new Map();
  }

  // 添加规则
  addRule(rule: AutomationRule): void {
    this.rules.set(rule.id, rule);

    // 如果是定时规则，设置定时?    if (rule.trigger === 'scheduled' && rule?.cronExpression) {
      this.setupScheduledRule(rule);
    }
  }

  // 更新规则
  updateRule(ruleId: string, updates: Partial<AutomationRule>): void {
    const existingRule = this.rules.get(ruleId);
    if (!existingRule) {
      throw new Error(`规则不存? ${ruleId}`);
    }

    // 清除旧的定时?    if (this.timers.has(ruleId)) {
      clearInterval(this.timers.get(ruleId)!);
      this.timers.delete(ruleId);
    }

    // 更新规则
    const updatedRule = { ...existingRule, ...updates };
    updatedRule.metadata.lastModified = new Date().toISOString();
    this.rules.set(ruleId, updatedRule);

    // 重新设置定时器（如果需要）
    if (updatedRule.trigger === 'scheduled' && updatedRule?.cronExpression) {
      this.setupScheduledRule(updatedRule);
    }
  }

  // 删除规则
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);

    // 清除定时?    if (this.timers.has(ruleId)) {
      clearInterval(this.timers.get(ruleId)!);
      this.timers.delete(ruleId);
    }
  }

  // 执行规则
  async executeRule(
    ruleId: string,
    context: RuleExecutionContext
  ): Promise<ExecutionResult> {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error(`规则不存? ${ruleId}`);
    }

    if (!rule.enabled) {
      return {
        ruleId,
        success: false,
        executedActions: 0,
        failedActions: 0,
        executionTime: 0,
        error: '规则已禁?,
      };
    }

    const startTime = Date.now();

    try {
      // 评估条件
      const conditionsMet = this.evaluator.evaluateConditions(
        rule.conditions,
        context
      );

      if (!conditionsMet) {
        return {
          ruleId,
          success: true,
          executedActions: 0,
          failedActions: 0,
          executionTime: Date.now() - startTime,
          details: '条件未满?,
        };
      }

      // 执行动作
      let executedActions = 0;
      let failedActions = 0;

      for (const action of rule.actions) {
        const success = await this.executor.executeAction(action, context);
        if (success) {
          executedActions++;
        } else {
          failedActions++;
        }
      }

      // 更新规则元数?      rule.metadata.executionCount++;
      rule.metadata.lastExecution = new Date().toISOString();

      const result: ExecutionResult = {
        ruleId,
        success: failedActions === 0,
        executedActions,
        failedActions,
        executionTime: Date.now() - startTime,
        details: `执行?${executedActions} 个动作`,
      };

      this.executionHistory.push(result);

      // 保留最?00条执行记?      if (this.executionHistory.length > 100) {
        this.executionHistory.shift();
      }

      return result;
    } catch (error) {
      const result: ExecutionResult = {
        ruleId,
        success: false,
        executedActions: 0,
        failedActions: rule.actions.length,
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : '未知错误',
      };

      this.executionHistory.push(result);
      return result;
    }
  }

  // 批量执行规则（基于事件触发）
  async executeRulesByEvent(
    eventType: string,
    context: RuleExecutionContext
  ): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];
    const eventRules = Array.from(this.rules.values()).filter(
      rule => rule.trigger === 'event_based'
    );

    for (const rule of eventRules) {
      try {
        const result = await this.executeRule(rule.id, context);
        results.push(result);
      } catch (error) {
        console.error(`执行规则 ${rule.id} 失败:`, error);
      }
    }

    return results;
  }

  // 获取规则列表
  getRules(filter?: { enabled?: boolean; trigger?: string }): AutomationRule[] {
    let rules = Array.from(this.rules.values());

    if (filter?.enabled !== undefined) {
      rules = rules.filter(rule => rule.enabled === filter.enabled);
    }

    if (filter?.trigger) {
      rules = rules.filter(rule => rule.trigger === filter.trigger);
    }

    return rules;
  }

  // 获取执行历史
  getExecutionHistory(limit: number = 50): ExecutionResult[] {
    return this.executionHistory.slice(-limit);
  }

  // 获取规则统计信息
  getStatistics(): {
    totalRules: number;
    enabledRules: number;
    disabledRules: number;
    triggerTypes: Record<string, number>;
    recentExecutions: number;
  } {
    const rules = Array.from(this.rules.values());
    const triggerCounts: Record<string, number> = {};

    rules.forEach(rule => {
      triggerCounts[rule.trigger] = (triggerCounts[rule.trigger] || 0) + 1;
    });

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentExecutions = this.executionHistory.filter(
      exec => new Date(exec.ruleId).getTime() > last24Hours.getTime()
    ).length;

    return {
      totalRules: rules.length,
      enabledRules: rules.filter(r => r.enabled).length,
      disabledRules: rules.filter(r => !r.enabled).length,
      triggerTypes: triggerCounts,
      recentExecutions,
    };
  }

  // 私有方法：设置定时规?  private setupScheduledRule(rule: AutomationRule): void {
    if (!rule?.cronExpression) return;

    // 简化的Cron解析（实际项目中建议使用node-cron等库?    const cronParts = rule.schedule.cronExpression.split(' ');
    if (cronParts.length !== 5) {
      console.warn(`无效的Cron表达? ${rule.schedule.cronExpression}`);
      return;
    }

    // 这里只是一个示例实现，实际应该使用专业的Cron�?    const interval = this.parseCronToInterval(cronParts);
    if (interval > 0) {
      const timer = setInterval(async () => {
        if (rule.enabled) {
          const context: RuleExecutionContext = {
            timestamp: new Date().toISOString(),
          };
          await this.executeRule(rule.id, context);
        }
      }, interval);

      this.timers.set(rule.id, timer);
    }
  }

  // 简化的Cron到间隔转换（仅用于演示）
  private parseCronToInterval(cronParts: string[]): number {
    // 这是一个非常简化的实现，实际项目中应该使用成熟的Cron�?    const [minute, hour, day, month, weekday] = cronParts;

    // 只处理简单的每分?每小时情?    if (minute !== '*' && minute.match(/^\d+$/)) {
      if (hour === '*' && day === '*' && month === '*' && weekday === '*') {
        return parseInt(minute) * 60 * 1000; // 每X分钟
      }
    }

    if (minute === '0' && hour !== '*' && hour.match(/^\d+$/)) {
      return parseInt(hour) * 60 * 60 * 1000; // 每X小时
    }

    return 0; // 无法解析的情?  }

  // 清理资源
  destroy(): void {
    // 清除所有定时器
    for (const timer of this.timers.values()) {
      clearInterval(timer);
    }
    this.timers.clear();

    // 清空执行历史
    this.executionHistory = [];
  }
}

// 预定义的常用规则模板
export const RuleTemplates = {
  // 高价值用户欢迎流?  premiumUserWelcome: {
    name: '高价值用户欢迎流?,
    description: '当用户升级为铂金会员时自动发送欢迎消息并分配专属客服',
    trigger: 'event_based',
    conditions: [
      { field: 'user.valueTier', operator: 'equals', value: 'platinum' },
      {
        field: 'user.previousValueTier',
        operator: 'not_equals',
        value: 'platinum',
        logicalOperator: 'and',
      },
    ],
    actions: [
      {
        type: 'send_notification',
        parameters: {
          userId: '{{user.id}}',
          message: '恭喜您成为铂金会员！您将享受专属客服和高级功能?,
          priority: 'high',
        },
      },
      {
        type: 'assign_role',
        parameters: {
          userId: '{{user.id}}',
          role: 'premium_support',
        },
        delay: 5000, // 5秒后执行
      },
    ],
  },

  // 不活跃用户召?  inactiveUserRetargeting: {
    name: '不活跃用户召?,
    description: '针对30天未登录的用户发送召回邮?,
    trigger: 'scheduled',
    schedule: {
      cronExpression: '0 9 * * 1', // 每周一上午9�?    },
    conditions: [
      {
        field: 'user.lastActive',
        operator: 'less_than',
        value: '{{30_days_ago}}',
      },
      { field: 'user.status', operator: 'equals', value: 'active' },
    ],
    actions: [
      {
        type: 'send_email',
        parameters: {
          recipient: '{{user.email}}',
          subject: '我们想念您！回来查看最新功?,
          template: 'user_recall',
        },
      },
      {
        type: 'create_task',
        parameters: {
          title: '跟进不活跃用?{{user.email}}',
          assignee: 'customer_success_team',
          priority: 'medium',
          dueDate: '{{7_days_later}}',
        },
      },
    ],
  },

  // 异常行为监控
  suspiciousActivityAlert: {
    name: '异常行为监控',
    description: '检测并告警异常的用户行?,
    trigger: 'real_time',
    conditions: [
      { field: 'behavior.failedAttempts', operator: 'greater_than', value: 5 },
      { field: 'behavior.timeWindow', operator: 'less_than', value: 300 }, // 5分钟?    ],
    actions: [
      {
        type: 'send_notification',
        parameters: {
          userId: '{{user.id}}',
          message: '检测到异常登录行为，请注意账户安全',
          priority: 'urgent',
        },
      },
      {
        type: 'log_activity',
        parameters: {
          activityType: 'security_alert',
          severity: 'high',
          details: '多次登录失败',
        },
      },
      {
        type: 'update_user_status',
        parameters: {
          userId: '{{user.id}}',
          status: 'suspended',
          reason: '安全验证',
        },
        delay: 300000, // 5分钟后执?      },
    ],
  },
};
