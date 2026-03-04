// 采购智能体通用工具函数

import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

/**
 * 生成唯一ID
 */
export function generateId(prefix: string = 'pi'): string {
  return `${prefix}_${uuidv4().replace(/-/g, '')}`;
}

/**
 * 格式化货币金? */
export function formatCurrency(
  amount: number,
  currency: string = 'CNY'
): string {
  const formatter = new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  });
  return formatter.format(amount);
}

/**
 * 计算两个日期之间的天数差
 */
export function daysBetweenDates(
  date1: string | Date,
  date2: string | Date
): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 安全获取嵌套对象属? */
export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : defaultValue;
  }, obj);
}

/**
 * 深度合并对象
 */
export function deepMerge(target: any, source: any): any {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

/**
 * 检查是否为对象
 */
export function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * 计算加权平均? */
export function calculateWeightedScore(
  scores: Record<string, number>,
  weights: Record<string, number>
): number {
  const totalWeight = Object.values(weights).reduce(
    (sum, weight) => sum + weight,
    0
  );
  const weightedSum = Object.keys(scores).reduce((sum, key) => {
    return sum + scores[key] * (weights[key] || 0);
  }, 0);
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * 标准化分数到0-100范围
 */
export function normalizeScore(
  score: number,
  min: number = 0,
  max: number = 1
): number {
  if (min === max) return 50;
  return Math.max(0, Math.min(100, ((score - min) / (max - min)) * 100));
}

/**
 * 计算风险得分 (0-100, 分数越高风险越大)
 */
export function calculateRiskScore(
  riskFactors: Record<string, number>,
  weights: Record<string, number>
): number {
  return calculateWeightedScore(riskFactors, weights);
}

/**
 * 延迟执行函数
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 批量处理数据
 */
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  return results;
}

/**
 * 重试机制
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries) {
        await sleep(delay * Math.pow(2, i)); // 指数退?      }
    }
  }

  throw lastError!;
}

/**
 * 缓存装饰? */
export function cacheable(ttl: number = 300000) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const cache = new Map<string, { value: any; timestamp: number }>();

    descriptor.value = function (...args: any[]) {
      const key = JSON.stringify(args);
      const cached = cache.get(key);

      if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.value;
      }

      const result = originalMethod.apply(this, args);
      cache.set(key, { value: result, timestamp: Date.now() });
      return result;
    };

    return descriptor;
  };
}

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证手机号格? */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}
