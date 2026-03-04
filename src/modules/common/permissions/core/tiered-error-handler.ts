/**
 * 分级错误处理策略管理? * 根据错误类型和严重程度实施不同的处理策略
 */

import {
  GlobalErrorHandler,
  ErrorInfo,
  ErrorType,
  ErrorSeverity,
} from './error-handler';

export interface ErrorHandlingStrategy {
  /** 策略名称 */
  name: string;
  /** 适用的错误类?*/
  errorTypes: ErrorType[];
  /** 适用的严重程?*/
  severities: ErrorSeverity[];
  /** 处理函数 */
  handler: (error: ErrorInfo) => Promise<ErrorHandlingResult>;
  /** 是否启用 */
  enabled: boolean;
  /** 优先级（数字越大优先级越高） */
  priority: number;
}

export interface ErrorHandlingResult {
  /** 处理结果状?*/
  status: 'handled' | 'retry' | 'escalate' | 'ignore';
  /** 处理消息 */
  message?: string;
  /** 重试次数 */
  retryCount?: number;
  /** 延迟重试时间（毫秒） */
  retryDelay?: number;
  /** 是否需要用户干?*/
  requiresUserAction?: boolean;
}

export interface RetryPolicy {
  /** 最大重试次?*/
  maxRetries: number;
  /** 重试间隔（毫秒） */
  retryInterval: number;
  /** 指数退避因?*/
  exponentialBackoff?: number;
  /** 最大延迟时?*/
  maxDelay?: number;
}

export interface EscalationPolicy {
  /** 升级阈值（错误数量?*/
  threshold: number;
  /** 时间窗口（毫秒） */
  timeWindow: number;
  /** 升级目标（邮件、短信、工单等?*/
  targets: string[];
}

export class TieredErrorHandler {
  private static instance: TieredErrorHandler;
  private strategies: ErrorHandlingStrategy[] = [];
  private retryPolicies: Map<ErrorType, RetryPolicy> = new Map();
  private escalationPolicies: Map<ErrorSeverity, EscalationPolicy> = new Map();
  private errorHandler: GlobalErrorHandler;
  private errorCounts: Map<string, { count: number; lastReset: number }> =
    new Map();
  private processingQueue: ErrorInfo[] = [];

  private constructor() {
    this.errorHandler = GlobalErrorHandler.getInstance();
    this.setupDefaultStrategies();
    this.setupDefaultPolicies();
    this.setupErrorSubscription();
  }

  static getInstance(): TieredErrorHandler {
    if (!TieredErrorHandler.instance) {
      TieredErrorHandler.instance = new TieredErrorHandler();
    }
    return TieredErrorHandler.instance;
  }

  /**
   * 设置默认处理策略
   */
  private setupDefaultStrategies(): void {
    // 1. 认证错误处理策略
    this.registerStrategy({
      name: 'authentication-handler',
      errorTypes: [ErrorType.AUTHENTICATION],
      severities: [ErrorSeverity.HIGH, ErrorSeverity.CRITICAL],
      handler: this.handleAuthenticationError.bind(this),
      enabled: true,
      priority: 100,
    });

    // 2. 网络错误重试策略
    this.registerStrategy({
      name: 'network-retry-handler',
      errorTypes: [ErrorType.NETWORK],
      severities: [ErrorSeverity.MEDIUM, ErrorSeverity.HIGH],
      handler: this.handleNetworkError.bind(this),
      enabled: true,
      priority: 80,
    });

    // 3. 数据库错误降级策?    this.registerStrategy({
      name: 'database-fallback-handler',
      errorTypes: [ErrorType.DATABASE],
      severities: [ErrorSeverity.HIGH, ErrorSeverity.CRITICAL],
      handler: this.handleDatabaseError.bind(this),
      enabled: true,
      priority: 90,
    });

    // 4. 业务逻辑错误用户提示策略
    this.registerStrategy({
      name: 'business-logic-handler',
      errorTypes: [ErrorType.BUSINESS_LOGIC, ErrorType.VALIDATION],
      severities: [ErrorSeverity.MEDIUM, ErrorSeverity.HIGH],
      handler: this.handleBusinessLogicError.bind(this),
      enabled: true,
      priority: 70,
    });

    // 5. 系统错误紧急处理策?    this.registerStrategy({
      name: 'system-emergency-handler',
      errorTypes: [ErrorType.SYSTEM],
      severities: [ErrorSeverity.CRITICAL],
      handler: this.handleSystemError.bind(this),
      enabled: true,
      priority: 110,
    });

    // 6. 通用回退策略
    this.registerStrategy({
      name: 'fallback-handler',
      errorTypes: [], // 匹配所有类?      severities: [], // 匹配所有严重程?      handler: this.handleFallback.bind(this),
      enabled: true,
      priority: 10,
    });
  }

  /**
   * 设置默认重试和升级策?   */
  private setupDefaultPolicies(): void {
    // 网络错误重试策略
    this.setRetryPolicy(ErrorType.NETWORK, {
      maxRetries: 3,
      retryInterval: 1000,
      exponentialBackoff: 2,
      maxDelay: 30000,
    });

    // 数据库错误重试策?    this.setRetryPolicy(ErrorType.DATABASE, {
      maxRetries: 2,
      retryInterval: 2000,
      exponentialBackoff: 1.5,
      maxDelay: 10000,
    });

    // 关键错误升级策略
    this.setEscalationPolicy(ErrorSeverity.CRITICAL, {
      threshold: 5,
      timeWindow: 300000, // 5分钟
      targets: ['admin-email', 'slack-alerts', 'pager-duty'],
    });

    // 高级错误升级策略
    this.setEscalationPolicy(ErrorSeverity.HIGH, {
      threshold: 10,
      timeWindow: 600000, // 10分钟
      targets: ['admin-email', 'slack-notifications'],
    });
  }

  /**
   * 设置错误订阅
   */
  private setupErrorSubscription(): void {
    this.errorHandler.subscribe(async error => {
      await this.processError(error);
    });
  }

  /**
   * 注册错误处理策略
   */
  registerStrategy(strategy: ErrorHandlingStrategy): void {
    // 检查是否已存在同名策略
    const existingIndex = this.strategies.findIndex(
      s => s.name === strategy.name
    );
    if (existingIndex >= 0) {
      this.strategies[existingIndex] = strategy;
    } else {
      this.strategies.push(strategy);
    }

    // 按优先级排序
    this.strategies.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 设置重试策略
   */
  setRetryPolicy(errorType: ErrorType, policy: RetryPolicy): void {
    this.retryPolicies.set(errorType, policy);
  }

  /**
   * 设置升级策略
   */
  setEscalationPolicy(severity: ErrorSeverity, policy: EscalationPolicy): void {
    this.escalationPolicies.set(severity, policy);
  }

  /**
   * 处理错误
   */
  private async processError(error: ErrorInfo): Promise<void> {
    // 避免重复处理
    if (this.processingQueue.some(e => e.id === error.id)) {
      return;
    }

    this.processingQueue.push(error);

    try {
      // 查找匹配的策?      const strategy = this.findMatchingStrategy(error);

      if (strategy) {
        const result = await strategy.handler(error);
        await this.handleStrategyResult(error, result, strategy);
      }
    } finally {
      // 从处理队列中移除
      const index = this.processingQueue.findIndex(e => e.id === error.id);
      if (index >= 0) {
        this.processingQueue.splice(index, 1);
      }
    }
  }

  /**
   * 查找匹配的处理策?   */
  private findMatchingStrategy(
    error: ErrorInfo
  ): ErrorHandlingStrategy | undefined {
    return this.strategies.find(strategy => {
      if (!strategy.enabled) return false;

      // 检查错误类型匹?      const typeMatch =
        strategy.errorTypes.length === 0 ||
        strategy.errorTypes.includes(error.type);

      // 检查严重程度匹?      const severityMatch =
        strategy.severities.length === 0 ||
        strategy.severities.includes(error.severity);

      return typeMatch && severityMatch;
    });
  }

  /**
   * 处理策略执行结果
   */
  private async handleStrategyResult(
    error: ErrorInfo,
    result: ErrorHandlingResult,
    strategy: ErrorHandlingStrategy
  ): Promise<void> {
    switch (result.status) {
      case 'handled':
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?错误已处? ${error.message} (策略: ${strategy.name})`);
        if (result.message) {
          // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`处理详情: ${result.message}`)}
        break;

      case 'retry':
        await this.handleRetry(error, result);
        break;

      case 'escalate':
        await this.handleEscalation(error, result);
        break;

      case 'ignore':
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`ℹ️  错误被忽? ${error.message}`)break;
    }
  }

  /**
   * 处理重试逻辑
   */
  private async handleRetry(
    error: ErrorInfo,
    result: ErrorHandlingResult
  ): Promise<void> {
    const retryPolicy = this.retryPolicies.get(error.type);
    if (!retryPolicy) {
      console.warn(`未找到重试策? ${error.type}`);
      return;
    }

    const retryCount = result.retryCount || 1;
    if (retryCount > retryPolicy.maxRetries) {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`�?达到最大重试次? ${error.message}`)// 重试失败后升级处?      await this.handleEscalation(error, {
        status: 'escalate',
        message: `重试${retryCount}次后仍失败`,
      });
      return;
    }

    const delay = this.calculateRetryDelay(retryPolicy, retryCount);
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
      `🔄 重试错误 (${retryCount}/${retryPolicy.maxRetries}): ${error.message} (延迟: ${delay}ms)`
    );

    // 延迟后重?    setTimeout(() => {
      // 这里可以重新执行原始操作
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`执行?{retryCount}次重试`)}, delay);
  }

  /**
   * 计算重试延迟时间
   */
  private calculateRetryDelay(policy: RetryPolicy, retryCount: number): number {
    let delay = policy.retryInterval;

    // 应用指数退?    if (policy.exponentialBackoff) {
      delay *= Math.pow(policy.exponentialBackoff, retryCount - 1);
    }

    // 限制最大延?    if (policy.maxDelay) {
      delay = Math.min(delay, policy.maxDelay);
    }

    return Math.round(delay);
  }

  /**
   * 处理错误升级
   */
  private async handleEscalation(
    error: ErrorInfo,
    result: ErrorHandlingResult
  ): Promise<void> {
    const escalationPolicy = this.escalationPolicies.get(error.severity);
    if (!escalationPolicy) {
      console.warn(`未找到升级策? ${error.severity}`);
      return;
    }

    // 更新错误计数
    const key = `${error.severity}-${error.type}`;
    const countInfo = this.errorCounts.get(key) || {
      count: 0,
      lastReset: Date.now(),
    };

    // 检查时间窗?    if (Date.now() - countInfo.lastReset > escalationPolicy.timeWindow) {
      countInfo.count = 0;
      countInfo.lastReset = Date.now();
    }

    countInfo.count++;
    this.errorCounts.set(key, countInfo);

    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
      `🚨 错误升级: ${error.message} (计数: ${countInfo.count}/${escalationPolicy.threshold})`
    );

    // 检查是否达到升级阈?    if (countInfo.count >= escalationPolicy.threshold) {
      await this.triggerEscalation(error, escalationPolicy, result);
      // 重置计数?      countInfo.count = 0;
      countInfo.lastReset = Date.now();
    }
  }

  /**
   * 触发错误升级
   */
  private async triggerEscalation(
    error: ErrorInfo,
    policy: EscalationPolicy,
    result: ErrorHandlingResult
  ): Promise<void> {
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`🔥 触发错误升级: ${error.message}`)// 发送到各个目标
    for (const target of policy.targets) {
      try {
        await this.sendToTarget(target, error, result);
      } catch (sendError) {
        console.error(`发送到${target}失败:`, sendError);
      }
    }
  }

  /**
   * 发送到指定目标
   */
  private async sendToTarget(
    target: string,
    error: ErrorInfo,
    result: ErrorHandlingResult
  ): Promise<void> {
    switch (target) {
      case 'admin-email':
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`📧 发送邮件告? ${error.message}`)// 实际实现中这里会发送邮?        break;

      case 'slack-alerts':
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`💬 发送Slack告警: ${error.message}`)// 实际实现中这里会发送Slack消息
        break;

      case 'pager-duty':
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`🚨 触发PagerDuty: ${error.message}`)// 实际实现中这里会触发PagerDuty
        break;

      default:
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(`📤 发送到${target}: ${error.message}`)}
  }

  // 各种错误类型的处理策略实?
  private async handleAuthenticationError(
    error: ErrorInfo
  ): Promise<ErrorHandlingResult> {
    // 认证错误通常需要用户重新登?    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🔐 处理认证错误，建议用户重新登?)return {
      status: 'handled',
      message: '认证失败，请重新登录',
      requiresUserAction: true,
    };
  }

  private async handleNetworkError(
    error: ErrorInfo
  ): Promise<ErrorHandlingResult> {
    // 网络错误尝试重试
    return {
      status: 'retry',
      retryCount: 1,
      retryDelay: 1000,
      message: '网络连接问题，正在重?,
    };
  }

  private async handleDatabaseError(
    error: ErrorInfo
  ): Promise<ErrorHandlingResult> {
    // 数据库错误尝试降级处?    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🗄�? 处理数据库错误，尝试降级方案')return {
      status: 'handled',
      message: '数据库暂时不可用，使用缓存数?,
    };
  }

  private async handleBusinessLogicError(
    error: ErrorInfo
  ): Promise<ErrorHandlingResult> {
    // 业务逻辑错误向用户显示友好提?    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('💼 处理业务逻辑错误，显示用户友好的错误信息')return {
      status: 'handled',
      message: this.getUserFriendlyMessage(error),
      requiresUserAction: true,
    };
  }

  private async handleSystemError(
    error: ErrorInfo
  ): Promise<ErrorHandlingResult> {
    // 系统错误立即升级
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🔥 处理系统级错误，立即升级处理')return {
      status: 'escalate',
      message: '系统级错误，需要紧急处?,
    };
  }

  private async handleFallback(error: ErrorInfo): Promise<ErrorHandlingResult> {
    // 通用回退处理
    // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('🔄 使用通用回退处理')return {
      status: 'handled',
      message: '使用默认错误处理',
    };
  }

  /**
   * 生成用户友好的错误消?   */
  private getUserFriendlyMessage(error: ErrorInfo): string {
    const messageMap: Record<string, string> = {
      validation: '输入信息有误，请检查后重试',
      not_found: '请求的资源不存在',
      conflict: '操作冲突，请稍后重试',
      timeout: '请求超时，请检查网络连?,
    };

    for (const [key, message] of Object.entries(messageMap)) {
      if (error.message.toLowerCase().includes(key)) {
        return message;
      }
    }

    return '操作失败，请稍后重试';
  }

  /**
   * 获取策略统计信息
   */
  getStrategyStats(): any {
    const stats: any = {
      totalStrategies: this.strategies.length,
      enabledStrategies: this.strategies.filter(s => s.enabled).length,
      retryPolicies: this.retryPolicies.size,
      escalationPolicies: this.escalationPolicies.size,
      processingQueue: this.processingQueue.length,
      errorCounts: {},
    };

    // 统计各类错误计数
    for (const [key, countInfo] of this.errorCounts.entries()) {
      stats.errorCounts[key] = {
        count: countInfo.count,
        lastReset: new Date(countInfo.lastReset).toISOString(),
      };
    }

    return stats;
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.strategies = [];
    this.retryPolicies.clear();
    this.escalationPolicies.clear();
    this.errorCounts.clear();
    this.processingQueue = [];
  }
}
