// 日志工具类 - 规范化日志输出
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  traceId?: string;
}

class Logger {
  private minLevel: LogLevel;
  private serviceName: string;
  private enableConsole: boolean;

  constructor(
    serviceName: string = 'App',
    minLevel: LogLevel = LogLevel.INFO,
    enableConsole: boolean = true
  ) {
    this.serviceName = serviceName;
    this.minLevel = minLevel;
    this.enableConsole = enableConsole;
  }

  private formatMessage(entry: LogEntry): string {
    const levelStr = LogLevel[entry.level];
    const timestamp = entry.timestamp.toISOString();
    const service = `[${this.serviceName}]`;
    const traceInfo = entry.traceId ? `[${entry.traceId}]` : '';
    
    let message = `${timestamp} ${service}${traceInfo} ${levelStr}: ${entry.message}`;
    
    if (entry.context) {
      message += ` | Context: ${JSON.stringify(entry.context)}`;
    }
    
    return message;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (level < this.minLevel) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      traceId: this.generateTraceId()
    };

    const formattedMessage = this.formatMessage(entry);

    // 发送到日志服务（实际项目中实现）
    this.sendToLogService(entry);

    // 控制台输出
    if (this.enableConsole) {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(formattedMessage);
          break;
        case LogLevel.INFO:
          console.info(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.ERROR:
          console.error(formattedMessage);
          break;
      }
    }
  }

  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sendToLogService(entry: LogEntry): void {
    // 实际项目中应该发送到日志收集服务
    // 例如: Sentry, ELK, DataDog 等
    /*
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    }).catch(err => {
      // 如果日志服务也出错，在控制台记录
      console.error('Failed to send log to service:', err);
    });
    */
  }

  // 公共日志方法
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context);
  }

  // 特定场景的日志方法
  httpRequest(method: string, url: string, statusCode: number, duration: number): void {
    this.info(`HTTP ${method} ${url}`, {
      statusCode,
      duration: `${duration}ms`,
      type: 'http_request'
    });
  }

  databaseQuery(query: string, duration: number, rowsAffected?: number): void {
    this.debug(`DB Query: ${query}`, {
      duration: `${duration}ms`,
      rowsAffected,
      type: 'database_query'
    });
  }

  userAction(action: string, userId?: string, metadata?: Record<string, any>): void {
    this.info(`User Action: ${action}`, {
      userId,
      ...metadata,
      type: 'user_action'
    });
  }

  securityEvent(event: string, details?: Record<string, any>): void {
    this.warn(`Security Event: ${event}`, {
      ...details,
      type: 'security_event'
    });
  }

  exception(error: Error, context?: Record<string, any>): void {
    this.error(`Exception: ${error.message}`, {
      stack: error.stack,
      name: error.name,
      ...context,
      type: 'exception'
    });
  }

  // 设置日志级别
  setLogLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  // 启用/禁用控制台输出
  setConsoleOutput(enabled: boolean): void {
    this.enableConsole = enabled;
  }
}

// 创建全局日志实例
const logger = new Logger(
  process.env.NEXT_PUBLIC_APP_NAME || 'FixCycle',
  process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO
);

// 便捷的导出
export { Logger, logger };
export default logger;