/**
 * FixCycle Agent SDK 插件装饰器
 * 用于简化插件开发和注册
 */

// 插件装饰器选项
export interface PluginOptions {
  name: string;
  version: string;
  description: string;
  category: string;
  tags?: string[];
  dependencies?: string[];
  permissions?: string[];
}

// 可注入装饰器
export interface InjectableOptions {
  name?: string;
  scope?: 'singleton' | 'transient' | 'request';
}

// 钩子装饰器选项
export interface HookOptions {
  name: string;
  priority?: number;
  condition?: (context: any) => boolean;
}

/**
 * 插件类装饰器
 * 自动注册插件元数据
 */
export function Plugin(options: PluginOptions) {
  return function (constructor: any) {
    // 设置插件元数据
    constructor.__pluginOptions = options;
    constructor.__pluginType = 'plugin';

    return constructor;
  };
}

/**
 * 可注入服务装饰器
 * 标记可被依赖注入的服务
 */
export function Injectable(options?: InjectableOptions) {
  return function (constructor: any) {
    const injectableOptions = {
      name: options?.name || constructor.name,
      scope: options?.scope || 'singleton',
    };

    constructor.__injectableOptions = injectableOptions;
    constructor.__injectableType = 'service';

    return constructor;
  };
}

/**
 * 钩子函数装饰器
 * 标记插件钩子方法
 */
export function Hook(options: HookOptions) {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const hooks = target.constructor.__pluginHooks || [];

    hooks.push({
      name: options.name,
      methodName: propertyKey,
      priority: options.priority || 0,
      condition: options.condition,
    });

    target.constructor.__pluginHooks = hooks;

    return descriptor;
  };
}

/**
 * 生命周期钩子装饰器
 */
export function OnLoad(): MethodDecorator {
  return Hook({ name: 'onLoad', priority: 100 });
}

export function OnUnload(): MethodDecorator {
  return Hook({ name: 'onUnload', priority: 100 });
}

export function OnEnable(): MethodDecorator {
  return Hook({ name: 'onEnable', priority: 100 });
}

export function OnDisable(): MethodDecorator {
  return Hook({ name: 'onDisable', priority: 100 });
}

export function OnError(): MethodDecorator {
  return Hook({ name: 'onError', priority: 50 });
}

/**
 * 事件监听装饰器
 */
export function OnEvent(
  eventName: string,
  options?: { priority?: number }
): MethodDecorator {
  return Hook({
    name: `event:${eventName}`,
    priority: options?.priority || 0,
  });
}

/**
 * 定时任务装饰器
 */
export function Schedule(
  cron: string,
  options?: { name?: string }
): MethodDecorator {
  return Hook({
    name: `schedule:${options?.name || cron}`,
    condition: () => true,
  });
}

// 简化的元数据存取
