/**
 * Agents Orchestrator 类型定义
 */

// 可靠性配置
export interface ReliabilityConfig {
  /** 最大重试次数 */
  maxRetries: number;
  /** 基础超时时间(毫秒) */
  timeoutMs: number;
  /** 重试间隔的基础延迟(毫秒) */
  retryDelayMs: number;
  /** 指数退避的最大延迟(毫秒) */
  maxRetryDelayMs: number;
  /** 是否启用幂等性检查 */
  enableIdempotency: boolean;
  /** 幂等性键的过期时间(毫秒) */
  idempotencyExpiryMs: number;
}

// 代理调用请求
export interface AgentInvokeRequest {
  /** 幂等性键 */
  idempotency_key: string;
  /** 追踪ID */
  trace_id: string;
  /** 超时时间(秒) */
  timeout: number;
  /** 代理名称 */
  agent_name: string;
  /** 请求载荷 */
  payload: Record<string, any>;
}

// 代理调用响应
export interface AgentInvokeResponse {
  /** 响应码 */
  code: number;
  /** 响应消息 */
  message: string;
  /** 响应数据 */
  data?: any;
  /** 追踪ID */
  trace_id: string;
  /** 处理耗时(毫秒) */
  processing_time_ms?: number;
}

// 重试上下文
export interface RetryContext {
  /** 当前重试次数 */
  attempt: number;
  /** 错误信息 */
  error: Error;
  /** 上次尝试的时间戳 */
  lastAttemptAt: number;
}

// 可靠性中间件选项
export interface ReliabilityMiddlewareOptions {
  /** 自定义重试条件判断函数 */
  shouldRetry?: (error: Error, context: RetryContext) => boolean;
  /** 自定义延迟计算函数 */
  calculateDelay?: (attempt: number) => number;
  /** 超时处理回调 */
  onTimeout?: (request: AgentInvokeRequest) => void;
  /** 重试开始回调 */
  onRetryStart?: (context: RetryContext, request: AgentInvokeRequest) => void;
  /** 重试结束回调 */
  onRetryEnd?: (
    success: boolean,
    context: RetryContext,
    request: AgentInvokeRequest
  ) => void;
}

// 幂等性存储接口
export interface IdempotencyStore {
  /** 检查键是否存在且未过期 */
  exists(key: string): Promise<boolean>;
  /** 存储键值对 */
  set(key: string, value: any, expiryMs: number): Promise<void>;
  /** 获取键对应的值 */
  get(key: string): Promise<any>;
  /** 删除键 */
  delete(key: string): Promise<void>;
  /** 清理过期键 */
  cleanup(): Promise<void>;
}
