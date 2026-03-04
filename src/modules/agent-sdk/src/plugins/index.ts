/**
 * FixCycle Agent SDK 插件系统主入口
 * 导出所有插件相关功能
 */

// 核心插件管理
import { PluginManager } from './plugin-manager';
import { PluginMarketAPI } from './plugin-market';
import { SecurityScanner } from './security-scanner';

export { PluginManager, PluginMarketAPI, SecurityScanner };

// 类型定义
export type {
  PluginInfo,
  PluginInstance,
  PluginState,
  SecurityScanResult,
  SecurityIssue,
  PluginMarketMetadata,
} from './plugin-manager';

export type {
  PluginSearchOptions,
  PluginReview,
  PluginDownloadStats,
} from './plugin-market';

export type {
  SecurityRule,
  SecurityConfig,
  ScanFinding,
  SecurityScanReport,
} from './security-scanner';

// 插件装饰器
export {
  Plugin,
  Injectable,
  Hook,
  OnLoad,
  OnUnload,
  OnEnable,
  OnDisable,
  OnError,
  OnEvent,
  Schedule,
} from './plugin-decorators';

// 插件生命周期接口
export interface PluginLifecycle {
  onLoad?(): Promise<void>;
  onUnload?(): Promise<void>;
  onEnable?(): Promise<void>;
  onDisable?(): Promise<void>;
  onError?(error: Error): Promise<void>;
}

// 插件上下文接口
export interface PluginContext {
  // 插件管理器实例
  manager: PluginManager;

  // 市场API实例
  market: PluginMarketAPI;

  // 安全扫描器实例
  scanner: SecurityScanner;

  // 日志方法
  log: {
    debug(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
  };

  // 配置信息
  config: Record<string, any>;
}

// 插件基类
export abstract class BasePlugin implements PluginLifecycle {
  protected context: PluginContext;
  protected isActive: boolean = false;

  constructor(context: PluginContext) {
    this.context = context;
  }

  /**
   * 插件加载时调用
   */
  async onLoad(): Promise<void> {
    this.context.log.info(`Plugin ${this.constructor.name} loaded`);
  }

  /**
   * 插件卸载时调用
   */
  async onUnload(): Promise<void> {
    this.context.log.info(`Plugin ${this.constructor.name} unloaded`);
  }

  /**
   * 插件启用时调用
   */
  async onEnable(): Promise<void> {
    this.isActive = true;
    this.context.log.info(`Plugin ${this.constructor.name} enabled`);
  }

  /**
   * 插件禁用时调用
   */
  async onDisable(): Promise<void> {
    this.isActive = false;
    this.context.log.info(`Plugin ${this.constructor.name} disabled`);
  }

  /**
   * 插件出错时调用
   */
  async onError(error: Error): Promise<void> {
    this.context.log.error(`Plugin ${this.constructor.name} error:`, error);
  }

  /**
   * 检查插件是否处于活动状态
   */
  checkActiveStatus(): boolean {
    return this.isActive;
  }

  /**
   * 获取插件上下文
   */
  getContext(): PluginContext {
    return this.context;
  }
}

// 便捷函数
export async function createPluginManager(
  pluginDir?: string
): Promise<PluginManager> {
  const manager = new PluginManager(pluginDir);

  // 监听重要事件
  manager.on('pluginInstalled', (plugin: any) => {
    // TODO: 移除调试日志 - console.log(`✅ 插件已安装: ${plugin.info.name} v${plugin.info.version}`)
  });

  manager.on('pluginLoaded', (plugin: any) => {
    // TODO: 移除调试日志 - console.log(`🔄 插件已加载: ${plugin.info.name}`)
  });

  manager.on('pluginActivated', (plugin: any) => {
    // TODO: 移除调试日志 - console.log(`⚡ 插件已激活: ${plugin.info.name}`)
  });

  manager.on('installError', (data: any) => {
    const { pluginPath, error } = data;
    console.error(`❌ 插件安装失败 ${pluginPath}:`, error);
  });

  return manager;
}

export function createPluginMarket(apiUrl?: string): PluginMarketAPI {
  return new PluginMarketAPI(apiUrl);
}

export function createSecurityScanner(config?: any): SecurityScanner {
  return new SecurityScanner(config);
}

// 版本信息
export const PLUGIN_SYSTEM_VERSION = '1.0.0';
export const PLUGIN_SYSTEM_NAME = 'FixCycle Plugin System';
