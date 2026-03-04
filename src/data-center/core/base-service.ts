/**
 * @file base-service.ts
 * @description 基础服务? * @version 1.0.0
 * @author DataCenter Team
 * @date 2026-02-28
 */

export abstract class BaseService {
  protected serviceName: string;
  protected version: string;
  protected logger: Console;

  constructor(serviceName: string = 'BaseService') {
    this.serviceName = serviceName;
    this.version = '1.0.0';
    this.logger = console;
  }

  /**
   * 初始化服?   */
  async initialize(): Promise<void> {
    this.logger.info(`${this.serviceName} 初始化完成`);
  }

  /**
   * 销毁服?   */
  async destroy(): Promise<void> {
    this.logger.info(`${this.serviceName} 已销毁`);
  }

  /**
   * 健康检?   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 记录操作日志
   */
  protected logOperation(operation: string, details: any = {}): void {
    this.logger.info(`[${this.serviceName}] ${operation}`, details);
  }

  /**
   * 记录错误日志
   */
  protected logError(error: Error, context: string): void {
    this.logger.error(`[${this.serviceName}] ${context}`, error);
  }
}
