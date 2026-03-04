/**
 * FixCycle Agent SDK 基础智能体类
 * 所有自定义智能体都需要继承此? */

import { EventEmitter } from 'events';
import {
  AgentInfo,
  AgentConfig,
  AgentInput,
  AgentOutput,
  AgentEventPayload,
  AgentMethods,
  AgentError,
  ValidationError,
} from '../types';

export abstract class BaseAgent extends EventEmitter implements AgentMethods {
  protected config: AgentConfig;
  protected info: AgentInfo;
  protected initialized: boolean = false;
  protected destroyed: boolean = false;

  constructor(info: AgentInfo, config: AgentConfig) {
    super();
    super();
    this.info = info;
    this.config = this.validateAndNormalizeConfig(config);
    (this as any).setMaxListeners(20); // 增加最大监听器数量
  }

  /**
   * 验证和标准化配置
   */
  private validateAndNormalizeConfig(config: AgentConfig): AgentConfig {
    // 必需字段验证
    if (!config.apiKey || config.apiKey.length < 32) {
      throw new ValidationError(
        'API Key is required and must be at least 32 characters long'
      );
    }

    // 默认值设?    const normalizedConfig: AgentConfig = {
      apiKey: config.apiKey,
      apiUrl: config.apiUrl || 'https://api.fixcycle.com/v1',
      timeout: config.timeout !== undefined ? config.timeout : 30000,
      debug: config.debug || false,
      maxRetries: config.maxRetries !== undefined ? config.maxRetries : 3,
    };

    // 数值范围验?    const timeout = normalizedConfig.timeout;
    if (timeout !== undefined && (timeout < 1000 || timeout > 300000)) {
      throw new ValidationError(
        'Timeout must be between 1000 and 300000 milliseconds'
      );
    }

    const maxRetries = normalizedConfig.maxRetries;
    if (maxRetries !== undefined && (maxRetries < 0 || maxRetries > 10)) {
      throw new ValidationError('Max retries must be between 0 and 10');
    }

    return normalizedConfig;
  }

  /**
   * 初始化智能体
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logDebug('Agent already initialized');
      return;
    }

    if (this.destroyed) {
      throw new AgentError(
        'Cannot initialize destroyed agent',
        'AGENT_DESTROYED'
      );
    }

    try {
      this.logDebug('Initializing agent...');

      // 执行具体的初始化逻辑
      await this.onInitialize();

      this.initialized = true;
      this.emitEvent('initialized', { config: this.config });

      this.logDebug('Agent initialized successfully');
    } catch (error) {
      this.handleError('Initialization failed', error);
      throw error;
    }
  }

  /**
   * 子类需要实现的具体初始化逻辑
   */
  protected abstract onInitialize(): Promise<void>;

  /**
   * 处理输入并返回输?   */
  async process(input: AgentInput): Promise<AgentOutput> {
    if (!this.initialized) {
      throw new AgentError('Agent not initialized', 'AGENT_NOT_INITIALIZED');
    }

    if (this.destroyed) {
      throw new AgentError('Agent destroyed', 'AGENT_DESTROYED');
    }

    const startTime = Date.now();

    try {
      this.logDebug('Processing input:', input);
      this.emitEvent('processing', { input });

      // 执行具体的处理逻辑
      const result = await this.onProcess(input);

      const endTime = Date.now();
      const processingResult: AgentOutput = {
        ...result,
        processingTime: endTime - startTime,
        tokensUsed: result.tokensUsed || 0,
      };

      this.emitEvent('completed', {
        input,
        output: processingResult,
        processingTime: processingResult.processingTime,
      });

      this.logDebug('Processing completed:', processingResult);
      return processingResult;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.handleError('Processing failed', error, { input, processingTime });
      throw error;
    }
  }

  /**
   * 子类需要实现的具体处理逻辑
   */
  protected abstract onProcess(input: AgentInput): Promise<AgentOutput>;

  /**
   * 销毁智能体
   */
  async destroy(): Promise<void> {
    if (this.destroyed) {
      this.logDebug('Agent already destroyed');
      return;
    }

    try {
      this.logDebug('Destroying agent...');

      // 执行具体的清理逻辑
      await this.onDestroy();

      this.destroyed = true;
      this.initialized = false;
      (this as any).removeAllListeners(); // 清理所有事件监听器

      this.emitEvent('destroyed', {});

      this.logDebug('Agent destroyed successfully');
    } catch (error) {
      this.handleError('Destruction failed', error);
      throw error;
    }
  }

  /**
   * 子类需要实现的具体清理逻辑
   */
  protected abstract onDestroy(): Promise<void>;

  /**
   * 获取健康状?   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details?: any;
  }> {
    if (this.destroyed) {
      return { status: 'unhealthy', details: { reason: 'Agent destroyed' } };
    }

    if (!this.initialized) {
      return {
        status: 'degraded',
        details: { reason: 'Agent not initialized' },
      };
    }

    try {
      const health = await this.checkHealth();
      return health;
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          reason: 'Health check failed',
          error: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * 子类可以重写的健康检查方?   */
  protected async checkHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details?: any;
  }> {
    return { status: 'healthy' };
  }

  /**
   * 验证配置（可选实现）
   */
  validateConfig?(_config: any): boolean {
    return true;
  }

  /**
   * 发射事件
   */
  protected emitEvent(event: string, data?: any): boolean {
    const payload: AgentEventPayload = {
      event: event as any,
      timestamp: new Date(),
      data,
    };
    return (this as any).emit(event, payload);
  }

  /**
   * 处理错误
   */
  protected handleError(message: string, error: unknown, context?: any): void {
    const agentError =
      error instanceof AgentError
        ? error
        : new AgentError(message, 'UNKNOWN_ERROR', {
            originalError: error,
            context,
          });

    this.logError(message, agentError);
    this.emitEvent('error', { error: agentError, context });
  }

  /**
   * 调试日志
   */
  protected logDebug(...args: any[]): void {
    if (this.config.debug) {
      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.debug(`[Agent:${this.info.name}]`, ...args)}
  }

  /**
   * 错误日志
   */
  protected logError(...args: any[]): void {
    console.error(`[Agent:${this.info.name}]`, ...args);
  }

  /**
   * 获取智能体信?   */
  getInfo(): AgentInfo {
    return { ...this.info };
  }

  /**
   * 获取配置（不包含敏感信息?   */
  getConfig(): Partial<AgentConfig> {
    return {
      apiUrl: this.config.apiUrl,
      timeout: this.config.timeout,
      debug: this.config.debug,
      maxRetries: this.config.maxRetries,
    };
  }

  /**
   * 是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * 是否已销?   */
  isDestroyed(): boolean {
    return this.destroyed;
  }
}
