/**
 * FixCycle Agent SDK 插件系统使用示例
 */

import {
  BasePlugin,
  Plugin,
  OnLoad,
  OnEnable,
  OnEvent,
  createPluginManager,
  createPluginMarket,
  createSecurityScanner,
} from '../src/plugins';

// 示例1: 基础插件实现
@Plugin({
  name: 'Logger Plugin',
  version: '1.0.0',
  description: '提供日志记录功能的插?,
  category: 'utility',
  tags: ['logging', 'monitoring'],
})
class LoggerPlugin extends BasePlugin {
  @OnLoad()
  async onLoad(): Promise<void> {
    await super.onLoad();
    this.context.log.info('Logger插件加载完成');
  }

  @OnEnable()
  async onEnable(): Promise<void> {
    await super.onEnable();
    this.context.log.info('Logger插件已启?);

    // 注册日志事件监听
    this.context.manager.on('pluginActivated', plugin => {
      this.logPluginActivity('activated', plugin.info.name);
    });
  }

  @OnEvent('agent:processing')
  async onAgentProcessing(data: any): Promise<void> {
    this.context.log.debug('代理处理?', data);
  }

  private logPluginActivity(action: string, pluginName: string): void {
    const timestamp = new Date().toISOString();
    this.context.log.info(`[${timestamp}] 插件 ${pluginName} ${action}`);
  }
}

// 示例2: 数据处理插件
@Plugin({
  name: 'Data Processor',
  version: '1.0.0',
  description: '数据清洗和转换插?,
  category: 'data',
  tags: ['data-processing', 'etl'],
  permissions: ['fs:read', 'fs:write'],
})
class DataProcessorPlugin extends BasePlugin {
  @OnLoad()
  async onLoad(): Promise<void> {
    await super.onLoad();
    this.context.log.info('数据处理器插件加载完?);
  }

  @OnEnable()
  async onEnable(): Promise<void> {
    await super.onEnable();
    this.context.log.info('数据处理器插件已启用');
  }

  // 自定义方?  async processData(data: any): Promise<any> {
    if (!this.isActivePlugin()) {
      throw new Error('插件未启?);
    }

    try {
      // 数据清洗逻辑
      const cleanedData = this.cleanData(data);

      // 数据转换逻辑
      const transformedData = this.transformData(cleanedData);

      this.context.log.debug('数据处理完成');
      return transformedData;
    } catch (error) {
      this.context.log.error('数据处理失败:', error);
      throw error;
    }
  }

  private cleanData(data: any): any {
    // 实现数据清洗逻辑
    return data;
  }

  private transformData(data: any): any {
    // 实现数据转换逻辑
    return data;
  }
}

// 示例3: 定时任务插件
@Plugin({
  name: 'Scheduler Plugin',
  version: '1.0.0',
  description: '定时任务调度插件',
  category: 'system',
  tags: ['scheduler', 'cron'],
})
class SchedulerPlugin extends BasePlugin {
  private timers: NodeJS.Timeout[] = [];

  @OnLoad()
  async onLoad(): Promise<void> {
    await super.onLoad();
    this.context.log.info('调度器插件加载完?);
  }

  @OnEnable()
  async onEnable(): Promise<void> {
    await super.onEnable();

    // 设置定时任务
    this.setupScheduledTasks();
    this.context.log.info('调度器插件已启用');
  }

  @OnEvent('pluginDisabled')
  async onPluginDisabled(data: any): Promise<void> {
    this.context.log.info('检测到插件禁用:', data.pluginId);
  }

  private setupScheduledTasks(): void {
    // 每分钟执行一次的健康检?    const healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, 60000);

    this.timers.push(healthCheckTimer);

    // 每小时执行一次的清理任务
    const cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, 3600000);

    this.timers.push(cleanupTimer);
  }

  private performHealthCheck(): void {
    this.context.log.debug('执行健康检?);
    // 实现健康检查逻辑
  }

  private performCleanup(): void {
    this.context.log.debug('执行清理任务');
    // 实现清理逻辑
  }

  async onUnload(): Promise<void> {
    // 清理定时?    this.timers.forEach(timer => clearInterval(timer));
    this.timers = [];

    await super.onUnload();
  }
}

// 使用示例
async function demonstratePluginSystem() {
  console.log('🚀 演示插件系统功能');

  // 1. 创建插件管理?  const pluginManager = await createPluginManager('./plugins');

  // 2. 创建市场API客户?  const marketAPI = createPluginMarket('https://market.fixcycle.com/api/v1');

  // 3. 创建安全扫描?  const securityScanner = createSecurityScanner({
    maxFileSize: 5 * 1024 * 1024, // 5MB
    timeout: 60000, // 60�?  });

  // 4. 安装插件示例
  try {
    console.log('\n📥 安装示例插件...');

    // 这里应该是实际的插件路径
    // const plugin = await pluginManager.installPlugin('./sample-plugin');
    // console.log('�?插件安装成功:', plugin.info.name);
  } catch (error) {
    console.error('�?插件安装失败:', error);
  }

  // 5. 安全扫描示例
  try {
    console.log('\n🛡�? 执行安全扫描...');
    // const scanReport = await securityScanner.scanPlugin('./sample-plugin');
    // console.log('🔍 扫描结果:', {
    //   passed: scanReport.passed,
    //   score: scanReport.overallScore,
    //   issues: scanReport.summary.total
    // });
  } catch (error) {
    console.error('�?安全扫描失败:', error);
  }

  // 6. 市场功能示例
  try {
    console.log('\n🛒 搜索市场插件...');
    // const searchResults = await marketAPI.searchPlugins({
    //   query: 'logger',
    //   category: 'utility',
    //   limit: 10
    // });
    // console.log('🔍 搜索到插?', searchResults.data.totalCount);
  } catch (error) {
    console.error('�?市场搜索失败:', error);
  }

  console.log('\n🎉 插件系统演示完成');
}

// 导出示例插件
export {
  LoggerPlugin,
  DataProcessorPlugin,
  SchedulerPlugin,
  demonstratePluginSystem,
};
