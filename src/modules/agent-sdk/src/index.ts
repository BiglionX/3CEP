/**
 * FixCycle Agent SDK 主入口文? * Export all public APIs
 */

// 核心?import { BaseAgent } from './core/base-agent';
export { BaseAgent };

// 类型定义
export type {
  AgentInfo,
  AgentConfig,
  AgentInput,
  AgentOutput,
  AgentEvent,
  AgentEventPayload,
  AgentMethods,
  AgentDecoratorOptions,
} from './types';

export { AgentError, ValidationError, NetworkError } from './types';

// 装饰?export {
  Agent,
  ValidateInput,
  FormatOutput,
  HandleError,
  MonitorPerformance,
  Cache,
} from './decorators/agent';

// 客户?export { HttpClient } from './client/http-client';
export type { ApiRequestOptions, ApiResponse } from './client/http-client';

// 工具函数
export { validateConfig, formatAgentInfo } from './utils/validation';

// 插件系统
export * from './plugins';

// 模板系统
export * from './templates';

// 版本信息
export const VERSION = '1.0.0';
export const SDK_NAME = 'FixCycle Agent SDK';

/**
 * 创建智能体实例的便捷函数
 */
export async function createAgent<T extends BaseAgent>(
  AgentClass: new (config: any) => T,
  config: any
): Promise<T> {
  const agent = new AgentClass(config);
  await agent.initialize();
  return agent;
}

/**
 * 销毁智能体实例的便捷函? */
export async function destroyAgent(agent: BaseAgent): Promise<void> {
  if (agent.isInitialized() && !agent.isDestroyed()) {
    await agent.destroy();
  }
}

/**
 * 获取SDK信息
 */
export function getSdkInfo() {
  return {
    name: SDK_NAME,
    version: VERSION,
    description: 'FixCycle智能体开发工具包',
    homepage: 'https://fixcycle.com/sdk',
  };
}
