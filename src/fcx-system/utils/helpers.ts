/**
 * FCX系统通用帮助函数
 */

// 使用crypto模块生成UUID
import { 
  ORDER_CONSTANTS, 
  FXC_EXCHANGE_RATES, 
  LEVEL_THRESHOLDS 
} from './constants';
import { 
  AllianceLevel, 
  FcxTransactionType, 
  OrderStatus 
} from '../models/fcx-account.model';

/**
 * 生成UUID
 */
export function generateUUID(): string {
  // 简单的UUID生成器（符合RFC4122版本4）
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 生成唯一的工单编号
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6); // 取时间戳后6位
  const random = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4位随机字符
  return `${ORDER_CONSTANTS.ORDER_NUMBER_PREFIX}${timestamp}${random}`;
}

/**
 * 美元转换为FCX
 */
export function usdToFcx(usdAmount: number): number {
  return parseFloat((usdAmount * FXC_EXCHANGE_RATES.USD_TO_FCX).toFixed(8));
}

/**
 * FCX转换为美元
 */
export function fcxToUsd(fcxAmount: number): number {
  return parseFloat((fcxAmount * FXC_EXCHANGE_RATES.FCX_TO_USD).toFixed(2));
}

/**
 * 根据FCX2余额确定联盟等级
 */
export function determineAllianceLevel(fcx2Balance: number): AllianceLevel {
  if (fcx2Balance >= LEVEL_THRESHOLDS.DIAMOND) return AllianceLevel.DIAMOND;
  if (fcx2Balance >= LEVEL_THRESHOLDS.GOLD) return AllianceLevel.GOLD;
  if (fcx2Balance >= LEVEL_THRESHOLDS.SILVER) return AllianceLevel.SILVER;
  return AllianceLevel.BRONZE;
}

/**
 * 格式化FCX金额（保留8位小数）
 */
export function formatFcxAmount(amount: number): string {
  return parseFloat(amount.toFixed(8)).toString();
}

/**
 * 格式化美元金额（保留2位小数）
 */
export function formatUsdAmount(amount: number): string {
  return parseFloat(amount.toFixed(2)).toString();
}

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证手机号格式
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/; // 简单的中国手机号验证
  return phoneRegex.test(phone);
}

/**
 * 验证FCX金额是否有效
 */
export function isValidFcxAmount(amount: number): boolean {
  return amount > 0 && amount <= 1000000 && Number.isFinite(amount);
}

/**
 * 验证评分是否有效
 */
export function isValidRating(rating: number): boolean {
  return rating >= 0 && rating <= 5 && Number.isFinite(rating);
}

/**
 * 计算两个日期之间的天数差
 */
export function daysBetweenDates(startDate: Date, endDate: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // 小时*分钟*秒*毫秒
  return Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / oneDay));
}

/**
 * 深度克隆对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        (clonedObj as any)[key] = deepClone((obj as any)[key]);
      }
    }
    return clonedObj;
  }
  
  return obj;
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 安全的JSON解析
 */
export function safeJsonParse<T>(str: string, defaultValue: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * 安全的JSON字符串化
 */
export function safeJsonStringify(obj: any, defaultValue = '{}'): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return defaultValue;
  }
}

/**
 * 生成随机字符串
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 检查对象是否为空
 */
export function isEmptyObject(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * 获取当前时间戳
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * 格式化时间显示
 */
export function formatTime(date: Date): string {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * 计算百分比
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return parseFloat(((part / total) * 100).toFixed(2));
}

/**
 * 数组去重
 */
export function uniqueArray<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * 延迟执行函数
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}