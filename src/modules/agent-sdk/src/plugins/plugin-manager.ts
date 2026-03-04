/**
 * FixCycle Agent SDK 插件管理? * 负责插件的加载、卸载、生命周期管理和安全审核
 */

import { EventEmitter } from 'events';
import { join, resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

// 插件基本信息接口
export interface PluginInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: string;
  tags: string[];
  entryPoint: string;
  dependencies: string[];
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 插件状态枚举
export enum PluginState {
  INSTALLED = 'installed',
  LOADED = 'loaded',
  ACTIVE = 'active',
  DISABLED = 'disabled',
  ERROR = 'error',
}

// 插件实例接口
export interface PluginInstance {
  info: PluginInfo;
  state: PluginState;
  instance: any;
  loadTime: Date;
  error?: Error;
}

// 安全审核结果接口
export interface SecurityScanResult {
  pluginId: string;
  passed: boolean;
  score: number; // 0-100
  issues: SecurityIssue[];
  recommendations: string[];
  scannedAt: Date;
}

// 安全问题接口
export interface SecurityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  file: string;
  line?: number;
}

// 插件市场元数据
export interface PluginMarketMetadata {
  downloadCount: number;
  rating: number;
  reviewCount: number;
  lastUpdated: Date;
  compatibility: string[];
  size: number;
  checksum: string;
}

export class PluginManager extends EventEmitter {
  private plugins: Map<string, PluginInstance> = new Map();
  private pluginDirectory: string;
  // private securityRules: SecurityRule[];

  constructor(pluginDir: string = './plugins') {
    super();
    this.pluginDirectory = resolve(pluginDir);
    // this.securityRules = this.loadSecurityRules();
    this.setMaxListeners(50);
  }

  /**
   * 安装插件
   */
  async installPlugin(pluginPath: string): Promise<PluginInstance> {
    try {
      // 1. 安全扫描
      const scanResult = await this.securityScan(pluginPath);
      if (!scanResult.passed) {
        throw new Error(`安全扫描未通过: ${JSON.stringify(scanResult.issues)}`);
      }

      // 2. 验证插件?      const pluginInfo = await this.validatePluginPackage(pluginPath);

      // 3. 复制到插件目?      // const installPath = join(this.pluginDirectory, pluginInfo.id);
      // 这里应该实现文件复制逻辑

      // 4. 创建插件实例
      const pluginInstance: PluginInstance = {
        info: pluginInfo,
        state: PluginState.INSTALLED,
        instance: null,
        loadTime: new Date(),
      };

      this.plugins.set(pluginInfo.id, pluginInstance);
      this.emit('pluginInstalled', pluginInstance);

      return pluginInstance;
    } catch (error) {
      this.emit('installError', { pluginPath, error });
      throw error;
    }
  }

  /**
   * 加载插件
   */
  async loadPlugin(pluginId: string): Promise<PluginInstance> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`插件未找到 ${pluginId}`);
    }

    if (
      plugin.state === PluginState.LOADED ||
      plugin.state === PluginState.ACTIVE
    ) {
      return plugin;
    }

    try {
      // 动态导入插?      const pluginModule = await import(
        join(this.pluginDirectory, pluginId, plugin.info.entryPoint)
      );

      plugin.instance = pluginModule.default || pluginModule;
      plugin.state = PluginState.LOADED;
      plugin.loadTime = new Date();

      this.emit('pluginLoaded', plugin);
      return plugin;
    } catch (error) {
      plugin.state = PluginState.ERROR;
      plugin.error = error as Error;
      this.emit('loadError', { pluginId, error });
      throw error;
    }
  }

  /**
   * 激活插?   */
  async activatePlugin(pluginId: string): Promise<PluginInstance> {
    const plugin = await this.loadPlugin(pluginId);

    try {
      // 调用插件的激活方法（如果存在）
      if (plugin.instance && typeof plugin.instance.activate === 'function') {
        await plugin.instance.activate();
      }

      plugin.state = PluginState.ACTIVE;
      this.emit('pluginActivated', plugin);
      return plugin;
    } catch (error) {
      plugin.state = PluginState.ERROR;
      plugin.error = error as Error;
      this.emit('activationError', { pluginId, error });
      throw error;
    }
  }

  /**
   * 卸载插件
   */
  async uninstallPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`插件未找到 ${pluginId}`);
    }

    try {
      // 先停用插件
      if (plugin.state === PluginState.ACTIVE) {
        await this.deactivatePlugin(pluginId);
      }

      // 删除插件文件
      // 这里应该实现文件删除逻辑

      this.plugins.delete(pluginId);
      this.emit('pluginUninstalled', pluginId);
    } catch (error) {
      this.emit('uninstallError', { pluginId, error });
      throw error;
    }
  }

  /**
   * 停用插件
   */
  async deactivatePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`插件未找到 ${pluginId}`);
    }

    try {
      if (plugin.instance && typeof plugin.instance.deactivate === 'function') {
        await plugin.instance.deactivate();
      }

      plugin.state = PluginState.LOADED;
      this.emit('pluginDeactivated', pluginId);
    } catch (error) {
      this.emit('deactivationError', { pluginId, error });
      throw error;
    }
  }

  /**
   * 获取所有插?   */
  getAllPlugins(): PluginInstance[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 获取特定状态的插件
   */
  getPluginsByState(state: PluginState): PluginInstance[] {
    return Array.from(this.plugins.values()).filter(p => p.state === state);
  }

  /**
   * 安全扫描插件
   */
  private async securityScan(pluginPath: string): Promise<SecurityScanResult> {
    const issues: SecurityIssue[] = [];
    let score = 100;

    // 检查文件系统访问
    const fsAccessIssues = await this.checkFileSystemAccess(pluginPath);
    issues.push(...fsAccessIssues);
    if (fsAccessIssues.length > 0) score -= 20;

    // 检查网络访问
    const networkIssues = await this.checkNetworkAccess(pluginPath);
    issues.push(...networkIssues);
    if (networkIssues.length > 0) score -= 15;

    // 检查危险 API 调用
    const apiIssues = await this.checkDangerousAPIs(pluginPath);
    issues.push(...apiIssues);
    if (apiIssues.length > 0) score -= 25;

    // 检查权限声明
    const permissionIssues = await this.checkPermissions(pluginPath);
    issues.push(...permissionIssues);
    if (permissionIssues.length > 0) score -= 10;

    return {
      pluginId: this.extractPluginId(pluginPath),
      passed: score >= 70,
      score,
      issues,
      recommendations: this.generateRecommendations(issues),
      scannedAt: new Date(),
    };
  }

  /**
   * 验证插件包完整?   */
  private async validatePluginPackage(pluginPath: string): Promise<PluginInfo> {
    // 读取插件配置文件
    const configPath = join(pluginPath, 'plugin.json');
    if (!existsSync(configPath)) {
      throw new Error('缺少插件配置文件 plugin.json');
    }

    const config = JSON.parse(readFileSync(configPath, 'utf8'));

    // 验证必要字段
    const requiredFields = ['name', 'version', 'description', 'entryPoint'];
    for (const field of requiredFields) {
      if (!config[field]) {
        throw new Error(`缺少必要字段: ${field}`);
      }
    }

    // 生成插件ID
    const pluginId = this.generatePluginId(config.name, config.version);

    // 验证入口文件存在
    const entryPath = join(pluginPath, config.entryPoint);
    if (!existsSync(entryPath)) {
      throw new Error(`入口文件不存在 ${config.entryPoint}`);
    }

    return {
      id: pluginId,
      name: config.name,
      version: config.version,
      description: config.description,
      author: config.author || 'Anonymous',
      category: config.category || 'general',
      tags: config.tags || [],
      entryPoint: config.entryPoint,
      dependencies: config.dependencies || [],
      permissions: config.permissions || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // 辅助方法
  /*private loadSecurityRules(): SecurityRule[] {
    // 加载安全规则配置
    return [
      {
        type: 'filesystem',
        pattern: /(fs\.|require\(['"]fs['"]\))/,
        severity: 'high',
        description: '文件系统访问检?
      },
      {
        type: 'network',
        pattern: /(http\.|https\.|fetch\()/,
        severity: 'medium',
        description: '网络访问检?
      },
      {
        type: 'dangerous',
        pattern: /(eval\(|new Function\(|setTimeout\(|setInterval\()/,
        severity: 'high',
        description: '危险函数调用检?
      }
    ];
  }*/

  private async checkFileSystemAccess(
    _pluginPath: string
  ): Promise<SecurityIssue[]> {
    // 实现文件系统访问检查逻辑
    return [];
  }

  private async checkNetworkAccess(
    _pluginPath: string
  ): Promise<SecurityIssue[]> {
    // 实现网络访问检查逻辑
    return [];
  }

  private async checkDangerousAPIs(
    _pluginPath: string
  ): Promise<SecurityIssue[]> {
    // 实现危险API检查逻辑
    return [];
  }

  private async checkPermissions(
    _pluginPath: string
  ): Promise<SecurityIssue[]> {
    // 实现权限检查逻辑
    return [];
  }

  private generateRecommendations(issues: SecurityIssue[]): string[] {
    const recommendations: string[] = [];

    const highSeverityIssues = issues.filter(
      i => i.severity === 'high' || i.severity === 'critical'
    );
    if (highSeverityIssues.length > 0) {
      recommendations.push('建议移除或替换高风险代码');
    }

    const mediumSeverityIssues = issues.filter(i => i.severity === 'medium');
    if (mediumSeverityIssues.length > 0) {
      recommendations.push('建议审查中等风险代码的必要性');
    }

    return recommendations;
  }

  private extractPluginId(pluginPath: string): string {
    return pluginPath.split(/[\/\\]/).pop() || 'unknown';
  }

  private generatePluginId(name: string, version: string): string {
    return `${name.toLowerCase().replace(/\s+/g, '-')}-${version}`;
  }
}

// 安全规则接口
interface SecurityRule {
  type: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}
