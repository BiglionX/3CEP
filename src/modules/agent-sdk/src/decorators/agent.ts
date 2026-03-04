/**
 * FixCycle Agent SDK 装饰? * 用于简化智能体类的定义和注? */

import { AgentDecoratorOptions, AgentInfo } from '../types';

/**
 * 智能体类装饰? * 自动设置智能体元信息
 */
export function Agent(options: AgentDecoratorOptions) {
  return function (constructor: any) {
    // 设置静态属?    (constructor as any).agentInfo = {
      id: `${options.category}-${options.name}`
        .toLowerCase()
        .replace(/\s+/g, '-'),
      name: options.name,
      description: options.description,
      version: options.version,
      category: options.category,
      tags: options.tags || [],
      author: '', // 将在实例化时设置
    } as AgentInfo;

    // 保存原始构造函?    const originalConstructor = constructor;

    // 返回新的构造函数包装器
    function AgentWrapper(...args: any[]) {
      // 如果是通过SDK创建的实例，第一个参数应该是作者信?      const author = args[0] || 'anonymous';
      const config = args[1];

      // 设置作者信?      (originalConstructor as any).agentInfo.author = author;

      // 调用原始构造函?      const instance = new (originalConstructor as any)(config);
      return instance;
    }

    // 复制原型
    AgentWrapper.prototype = originalConstructor.prototype;

    // 复制静态方法和属?    Object.setPrototypeOf(AgentWrapper, originalConstructor);

    return AgentWrapper;
  };
}

/**
 * 输入验证装饰? * 自动验证输入参数格式
 */
export function ValidateInput(
  validationFn: (input: any) => boolean | string
): MethodDecorator {
  return function (
    _target: Object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const input = args[0];
      const validation = validationFn(input);

      if (validation !== true) {
        const errorMessage =
          typeof validation === 'string'
            ? validation
            : 'Input validation failed';
        throw new Error(`Validation Error: ${errorMessage}`);
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * 输出格式化装饰器
 * 自动格式化输出结? */
export function FormatOutput(formatter: (output: any) => any): MethodDecorator {
  return function (
    _target: Object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);
      return formatter(result);
    };

    return descriptor;
  };
}

/**
 * 错误处理装饰? * 统一错误处理和日志记? */
export function HandleError(
  errorHandler?: (error: Error) => any
): MethodDecorator {
  return function (
    _target: Object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await originalMethod.apply(this, args);
      } catch (error) {
        if (errorHandler) {
          return errorHandler(error as Error);
        } else {
          console.error(`[Method Error] Error:`, error);
          throw error;
        }
      }
    };

    return descriptor;
  };
}

/**
 * 性能监控装饰? * 记录方法执行时间和资源使用情? */
export function MonitorPerformance(): MethodDecorator {
  return function (
    _target: Object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      const startMemory = process.memoryUsage().heapUsed;

      try {
        const result = await originalMethod.apply(this, args);

        const endTime = Date.now();
        const endMemory = process.memoryUsage().heapUsed;

        const executionTime = endTime - startTime;
        const memoryUsed = endMemory - startMemory;

        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
          `[Performance Monitor] Execution Time: ${executionTime}ms, Memory Used: ${Math.round(memoryUsed / 1024)}KB`
        );

        return result;
      } catch (error) {
        const endTime = Date.now();
        const executionTime = endTime - startTime;
        // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log(
          `[Performance Monitor] Failed after ${executionTime}ms:`,
          error
        )throw error;
      }
    };

    return descriptor;
  };
}

/**
 * 缓存装饰? * 缓存方法结果以提高性能
 */
export function Cache(ttl: number = 300000): MethodDecorator {
  // 默认5分钟
  const cache = new Map<string, { value: any; timestamp: number }>();

  return function (
    _target: Object,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = JSON.stringify(args);
      const cached = cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.value;
      }

      const result = await originalMethod.apply(this, args);
      cache.set(cacheKey, { value: result, timestamp: Date.now() });

      // 清理过期缓存
      if (cache.size > 100) {
        // 限制缓存大小
        const now = Date.now();
        for (const [key, entry] of cache.entries()) {
          if (now - entry.timestamp >= ttl) {
            cache.delete(key);
          }
        }
      }

      return result;
    };

    return descriptor;
  };
}
