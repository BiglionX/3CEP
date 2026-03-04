/**
 * FixCycle Agent SDK 核心类型定义
 */

// 智能体基本信息
export interface AgentInfo {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  tags: string[];
  author: string;
  homepage?: string;
  repository?: string;
}

// 智能体配置
export interface AgentConfig {
  apiKey: string;
  apiUrl?: string;
  timeout?: number;
  debug?: boolean;
  maxRetries?: number;
}

// 输入输出类型
export interface AgentInput {
  content: string;
  context?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface AgentOutput {
  content: string;
  tokensUsed?: number;
  processingTime?: number;
  metadata?: Record<string, any>;
}

// 智能体生命周期事件
export type AgentEvent =
  | 'initialized'
  | 'processing'
  | 'completed'
  | 'error'
  | 'destroyed';

export interface AgentEventPayload {
  event: AgentEvent;
  timestamp: Date;
  data?: any;
  error?: Error;
}

// 智能体方法接口
export interface AgentMethods {
  initialize(): Promise<void>;
  process(input: AgentInput): Promise<AgentOutput>;
  destroy(): Promise<void>;
  validateConfig?(config: any): boolean;
  getHealthStatus?(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details?: any;
  }>;
}

// 智能体类装饰器
export interface AgentDecoratorOptions {
  name: string;
  version: string;
  description: string;
  category: string;
  tags?: string[];
}

// 错误类型
export class AgentError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

export class ValidationError extends AgentError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AgentError {
  constructor(message: string, details?: any) {
    super(message, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
  }
}

// 配置验证模式
export const AgentConfigSchema = {
  apiKey: {
    type: 'string',
    required: true,
    minLength: 32,
  },
  apiUrl: {
    type: 'string',
    required: false,
    default: 'https://api.fixcycle.com/v1',
  },
  timeout: {
    type: 'number',
    required: false,
    default: 30000,
    min: 1000,
    max: 300000,
  },
  debug: {
    type: 'boolean',
    required: false,
    default: false,
  },
  maxRetries: {
    type: 'number',
    required: false,
    default: 3,
    min: 0,
    max: 10,
  },
};
