/**
 * FixCycle Agent SDK 验证工具函数
 */

import { AgentConfig, AgentInfo } from '../types';

/**
 * 验证智能体配? */
export function validateConfig(config: any): config is AgentConfig {
  if (!config || typeof config !== 'object') {
    return false;
  }

  // 必需字段验证
  if (
    !config.apiKey ||
    typeof config.apiKey !== 'string' ||
    config.apiKey.length < 32
  ) {
    return false;
  }

  // 可选字段验?  if (
    config.timeout !== undefined &&
    (typeof config.timeout !== 'number' ||
      config.timeout < 1000 ||
      config.timeout > 300000)
  ) {
    return false;
  }

  if (
    config.maxRetries !== undefined &&
    (typeof config.maxRetries !== 'number' ||
      config.maxRetries < 0 ||
      config.maxRetries > 10)
  ) {
    return false;
  }

  if (config.debug !== undefined && typeof config.debug !== 'boolean') {
    return false;
  }

  if (config.apiUrl !== undefined && typeof config.apiUrl !== 'string') {
    return false;
  }

  return true;
}

/**
 * 格式化智能体信息
 */
export function formatAgentInfo(info: AgentInfo): string {
  return `[${info.category}] ${info.name} v${info.version} - ${info.description}`;
}

/**
 * 验证智能体信息完整? */
export function validateAgentInfo(info: any): info is AgentInfo {
  if (!info || typeof info !== 'object') {
    return false;
  }

  const requiredFields = ['id', 'name', 'description', 'version', 'category'];
  for (const field of requiredFields) {
    if (!info[field] || typeof info[field] !== 'string') {
      return false;
    }
  }

  if (
    !Array.isArray(info.tags) ||
    !info.tags.every((tag: any) => typeof tag === 'string')
  ) {
    return false;
  }

  return true;
}

/**
 * 生成智能体ID
 */
export function generateAgentId(category: string, name: string): string {
  return `${category}-${name}`
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * 验证输入内容
 */
export function validateInputContent(content: any): boolean {
  return typeof content === 'string' && content.trim().length > 0;
}

/**
 * 验证输出内容
 */
export function validateOutputContent(content: any): boolean {
  return typeof content === 'string' && content.length > 0;
}
