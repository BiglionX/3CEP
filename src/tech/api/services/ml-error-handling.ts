/**
 * ML预测服务错误处理和日志记录增? */

// 自定义错误类
export class MLPredictionError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'MLPredictionError';
  }
}

export class ModelAPIError extends MLPredictionError {
  constructor(message: string, details?: Record<string, any>) {
    super('MODEL_API_ERROR', message, details, true);
  }
}

export class DataCollectionError extends MLPredictionError {
  constructor(message: string, details?: Record<string, any>) {
    super('DATA_COLLECTION_ERROR', message, details, false);
  }
}

export class PromptGenerationError extends MLPredictionError {
  constructor(message: string, details?: Record<string, any>) {
    super('PROMPT_GENERATION_ERROR', message, details, false);
  }
}

export class ResultParsingError extends MLPredictionError {
  constructor(message: string, details?: Record<string, any>) {
    super('RESULT_PARSING_ERROR', message, details, false);
  }
}

export class StorageError extends MLPredictionError {
  constructor(message: string, details?: Record<string, any>) {
    super('STORAGE_ERROR', message, details, true);
  }
}

// 日志级别枚举
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

// 日志条目接口
export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  service: string;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  traceId?: string;
}

// 日志服务?export class PredictionLogger {
  private static instance: PredictionLogger;
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000;

  private constructor() {}

  static getInstance(): PredictionLogger {
    if (!PredictionLogger.instance) {
      PredictionLogger.instance = new PredictionLogger();
    }
    return PredictionLogger.instance;
  }

  log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      service: 'MLPredictionService',
      message,
      context,
      error,
      traceId: context?.traceId || this.generateTraceId(),
    };

    // 存储到内存（生产环境应存储到数据库或日志系统?    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // 控制台输?    this.consoleLog(entry);

    // 异步存储到数据库
    this.persistLog(entry).catch(err => {
      console.error('日志持久化失?', err);
    });
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.WARN, message, context, error);
  }

  error(message: string, context?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  private consoleLog(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.padEnd(5);
    const traceInfo = entry.traceId ? `[${entry.traceId}]` : '';

    const logMessage = `${timestamp} ${level} ${traceInfo} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.debug(logMessage, entry.context)break;
      case LogLevel.INFO:
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.info(logMessage, entry.context)break;
      case LogLevel.WARN:
        console.warn(logMessage, entry.context, entry.error);
        break;
      case LogLevel.ERROR:
        console.error(logMessage, entry.context, entry.error);
        break;
    }
  }

  private async persistLog(entry: LogEntry): Promise<void> {
    try {
      // 这里应该存储到专门的日志表中
      // 为了简化，暂时只存储关键信?      const logData = {
        timestamp: entry.timestamp.toISOString(),
        level: entry.level,
        service: entry.service,
        message: entry.message,
        trace_id: entry.traceId,
        context: entry.context ? JSON.stringify(entry.context) : null,
        error_message: entry?.message || null,
        error_stack: entry?.stack || null,
      };

      // 如果有Supabase连接，存储到数据?      if (
        typeof window === 'undefined' &&
        process.env.SUPABASE_SERVICE_ROLE_KEY
      ) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        await supabase.from('ml_prediction_logs').insert(logData);
      }
    } catch (err) {
      // 静默失败，避免日志记录影响主流程
      console.warn('日志持久化异?', err);
    }
  }

  private generateTraceId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  // 获取最近的日志
  getRecentLogs(limit: number = 50): LogEntry[] {
    return this.logs.slice(-limit);
  }

  // 根据追踪ID获取相关日志
  getLogsByTraceId(traceId: string): LogEntry[] {
    return this.logs.filter(log => log.traceId === traceId);
  }

  // 清除旧日?  clearOldLogs(hours: number = 24): void {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    this.logs = this.logs.filter(log => log.timestamp > cutoffTime);
  }
}

// 重试机制
export interface RetryOptions {
  maxAttempts: number;
  delay: number;
  exponentialBackoff?: boolean;
  jitter?: boolean;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = { maxAttempts: 3, delay: 1000 },
  onError?: (error: Error, attempt: number) => void
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (onError) {
        onError(lastError, attempt);
      }

      // 如果是最后一次尝试，直接抛出错误
      if (attempt === options.maxAttempts) {
        throw lastError;
      }

      // 计算延迟时间
      let delay = options.delay;
      if (options.exponentialBackoff) {
        delay *= Math.pow(2, attempt - 1);
      }
      if (options.jitter) {
        delay *= 0.5 + Math.random() * 0.5; // 添加50%的抖?      }

      // 等待后重?      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// 性能监控装饰?export function MonitorPerformance(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  const logger = PredictionLogger.getInstance();

  descriptor.value = async function (...args: any[]) {
    const startTime = Date.now();
    const traceId = Math.random().toString(36).substring(2, 15);

    logger.info(`开始执?${propertyKey}`, {
      traceId,
      args: args.slice(0, 3), // 只记录前3个参数避免日志过?    });

    try {
      const result = await originalMethod.apply(this, args);
      const duration = Date.now() - startTime;

      logger.info(`完成执行 ${propertyKey}`, {
        traceId,
        durationMs: duration,
        success: true,
      });

      // 记录慢查询警?      if (duration > 5000) {
        logger.warn(`慢查询警? ${propertyKey} 执行时间 ${duration}ms`, {
          traceId,
        });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error(
        `执行失败 ${propertyKey}`,
        {
          traceId,
          durationMs: duration,
          success: false,
        },
        error as Error
      );

      throw error;
    }
  };

  return descriptor;
}

// 错误边界处理
export class ErrorHandler {
  private static logger = PredictionLogger.getInstance();

  static handleError(error: unknown, context?: Record<string, any>): never {
    if (error instanceof MLPredictionError) {
      this.logger.error(`ML预测错误 [${error.code}]`, context, error);

      // 根据错误类型决定是否重试
      if (error.retryable) {
        throw new Error(`可重试错? ${error.message}`);
      } else {
        throw new Error(`不可重试错误: ${error.message}`);
      }
    } else if (error instanceof Error) {
      this.logger.error('未预期的错误', context, error);
      throw error;
    } else {
      const errorMsg = String(error);
      this.logger.error('未知错误类型', { ...context, error: errorMsg });
      throw new Error(`未知错误: ${errorMsg}`);
    }
  }

  static async handleAsyncError<T>(
    operation: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.handleError(error, context);
    }
  }
}

// 监控指标收集
export interface Metrics {
  predictionCount: number;
  successCount: number;
  failureCount: number;
  avgResponseTime: number;
  modelAccuracy: number;
  lastUpdated: Date;
}

export class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics: Map<string, Metrics> = new Map();

  private constructor() {}

  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  recordPrediction(
    type: 'demand' | 'price',
    success: boolean,
    responseTime: number
  ): void {
    const key = `prediction_${type}`;
    const metrics = this.metrics.get(key) || {
      predictionCount: 0,
      successCount: 0,
      failureCount: 0,
      avgResponseTime: 0,
      modelAccuracy: 0,
      lastUpdated: new Date(),
    };

    metrics.predictionCount++;
    if (success) {
      metrics.successCount++;
    } else {
      metrics.failureCount++;
    }

    // 更新平均响应时间
    const totalTime =
      metrics.avgResponseTime * (metrics.predictionCount - 1) + responseTime;
    metrics.avgResponseTime = totalTime / metrics.predictionCount;

    metrics.lastUpdated = new Date();
    this.metrics.set(key, metrics);

    // 异步更新到数据库
    this.updateDatabaseMetrics(key, metrics).catch(err => {
      console.warn('指标更新失败:', err);
    });
  }

  getMetrics(type?: 'demand' | 'price'): Record<string, Metrics> {
    if (type) {
      const key = `prediction_${type}`;
      const metrics = this.metrics.get(key);
      return metrics ? { [key]: metrics } : {};
    }
    return Object.fromEntries(this.metrics);
  }

  private async updateDatabaseMetrics(
    key: string,
    metrics: Metrics
  ): Promise<void> {
    try {
      if (
        typeof window === 'undefined' &&
        process.env.SUPABASE_SERVICE_ROLE_KEY
      ) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        await supabase.from('ml_service_metrics').upsert({
          metric_key: key,
          metric_data: metrics,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.warn('数据库指标更新失?', error);
    }
  }
}

// 导出便捷函数
export const logger = PredictionLogger.getInstance();
export const metrics = MetricsCollector.getInstance();

// 使用示例的类型守?export function isMLPredictionError(
  error: unknown
): error is MLPredictionError {
  return error instanceof MLPredictionError;
}
