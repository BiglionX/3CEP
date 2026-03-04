/**
 * 前后端权限同步管理器
 * 确保前端UI显示与后端API权限检查保持一? */

import { PermissionManager, UserInfo } from '../core/permission-manager';
import { PermissionLoader } from '../core/permission-loader';
import { PermissionConfig } from '../config/permission-config';

export interface SyncStatus {
  isSynced: boolean;
  lastSyncTime: number;
  mismatchCount: number;
  lastMismatch?: PermissionMismatch;
}

export interface PermissionMismatch {
  permission: string;
  frontendResult: boolean;
  backendResult: boolean;
  timestamp: number;
  userId: string;
}

export interface SyncReport {
  status: SyncStatus;
  mismatches: PermissionMismatch[];
  syncHistory: SyncEvent[];
  performance: {
    averageSyncTime: number;
    syncFrequency: number;
    errorRate: number;
  };
}

export interface SyncEvent {
  type: 'sync_start' | 'sync_complete' | 'sync_error' | 'mismatch_detected';
  timestamp: number;
  details?: any;
}

export class PermissionSyncManager {
  private static instance: PermissionSyncManager;
  private permissionManager: PermissionManager;
  private permissionLoader: PermissionLoader;
  private syncInterval: NodeJS.Timeout | null = null;
  private syncStatus: SyncStatus = {
    isSynced: false,
    lastSyncTime: 0,
    mismatchCount: 0,
  };
  private mismatches: PermissionMismatch[] = [];
  private syncHistory: SyncEvent[] = [];
  private subscribers: Array<(status: SyncStatus) => void> = [];
  private readonly SYNC_INTERVAL = 30000; // 30秒同步一?  private readonly MAX_MISMATCH_HISTORY = 100;

  private constructor() {
    this.permissionManager = PermissionManager.getInstance();
    this.permissionLoader = PermissionLoader.getInstance();
    this.startSyncProcess();
  }

  static getInstance(): PermissionSyncManager {
    if (!PermissionSyncManager.instance) {
      PermissionSyncManager.instance = new PermissionSyncManager();
    }
    return PermissionSyncManager.instance;
  }

  /**
   * 启动同步进程
   */
  private startSyncProcess(): void {
    this.syncInterval = setInterval(async () => {
      try {
        await this.performSync();
      } catch (error) {
        console.error('权限同步过程中发生错?', error);
        this.recordSyncEvent('sync_error', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }, this.SYNC_INTERVAL);
  }

  /**
   * 执行权限同步检?   */
  async performSync(user?: UserInfo): Promise<void> {
    this.recordSyncEvent('sync_start');

    const startTime = Date.now();
    let hasMismatches = false;

    try {
      // 获取当前配置
      const configResult = await this.permissionLoader.loadPermissions();
      if (!configResult.success || !configResult.config) {
        throw new Error('无法加载权限配置');
      }

      const config = configResult.config;

      // 如果提供了用户，进行具体的权限对?      if (user) {
        hasMismatches = await this.checkUserPermissionConsistency(user, config);
      }

      // 检查配置一致?      const configConsistent = await this.checkConfigConsistency(config);
      if (!configConsistent) {
        hasMismatches = true;
      }

      // 更新同步状?      this.syncStatus = {
        isSynced: !hasMismatches,
        lastSyncTime: Date.now(),
        mismatchCount: this.mismatches.length,
      };

      this.recordSyncEvent('sync_complete', {
        duration: Date.now() - startTime,
        hasMismatches,
        mismatchCount: this.mismatches.length,
      });

      // 通知订阅?      this.notifySubscribers();
    } catch (error) {
      this.recordSyncEvent('sync_error', {
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
      });
      throw error;
    }
  }

  /**
   * 检查用户权限前后端一致?   */
  private async checkUserPermissionConsistency(
    user: UserInfo,
    config: PermissionConfig
  ): Promise<boolean> {
    let hasMismatches = false;

    // 获取前端权限检查结?    const frontendPermissions = this.permissionManager.getUserPermissions(
      user,
      config
    );

    // 调用后端API进行权限验证
    const backendPermissions = await this.fetchBackendPermissions(user.id);

    // 对比关键权限?    const criticalPermissions = this.getCriticalPermissions(config);

    for (const permission of criticalPermissions) {
      const frontendHasPerm = frontendPermissions.has(permission);
      const backendHasPerm = backendPermissions.includes(permission);

      if (frontendHasPerm !== backendHasPerm) {
        this.recordMismatch({
          permission,
          frontendResult: frontendHasPerm,
          backendResult: backendHasPerm,
          userId: user.id,
          timestamp: Date.now(),
        });
        hasMismatches = true;
      }
    }

    return hasMismatches;
  }

  /**
   * 检查配置一致?   */
  private async checkConfigConsistency(
    config: PermissionConfig
  ): Promise<boolean> {
    try {
      // 从后端获取配?      const backendConfig = await this.fetchBackendConfig();

      // 对比关键配置?      const configFields = [
        'version',
        'lastUpdated',
        'tenantIsolation.enabled',
        'auditSettings.enabled',
      ];

      for (const field of configFields) {
        const frontendValue = this.getNestedValue(config, field);
        const backendValue = this.getNestedValue(backendConfig, field);

        if (frontendValue !== backendValue) {
          console.warn(
            `配置不一?- ${field}: 前端=${frontendValue}, 后端=${backendValue}`
          );
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('配置一致性检查失?', error);
      return false;
    }
  }

  /**
   * 获取关键权限点用于同步检?   */
  private getCriticalPermissions(config: PermissionConfig): string[] {
    // 优先检查管理员和常用权?    const criticalPerms = [
      'dashboard_read',
      'users_read',
      'users_create',
      'content_read',
      'settings_read',
    ];

    // 添加所有管理类权限
    Object.keys(config.permissions).forEach(permKey => {
      const perm = config.permissions[permKey];
      if (perm.category === 'user_management' || perm.category === 'system') {
        if (!criticalPerms.includes(permKey)) {
          criticalPerms.push(permKey);
        }
      }
    });

    return criticalPerms.slice(0, 20); // 限制检查数量以提高性能
  }

  /**
   * 从后端获取用户权?   */
  private async fetchBackendPermissions(userId: string): Promise<string[]> {
    try {
      const response = await fetch(
        `/api/permissions/user/${userId}/permissions`
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.success ? result.data.permissions : [];
    } catch (error) {
      console.error('获取后端权限失败:', error);
      return []; // 返回空数组作为降级处?    }
  }

  /**
   * 从后端获取权限配?   */
  private async fetchBackendConfig(): Promise<any> {
    try {
      const response = await fetch('/api/permissions/config');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.success ? result.data : {};
    } catch (error) {
      console.error('获取后端配置失败:', error);
      return {}; // 返回空对象作为降级处?    }
  }

  /**
   * 记录权限不匹?   */
  private recordMismatch(mismatch: PermissionMismatch): void {
    this.mismatches.unshift(mismatch);

    // 保持历史记录大小限制
    if (this.mismatches.length > this.MAX_MISMATCH_HISTORY) {
      this.mismatches = this.mismatches.slice(0, this.MAX_MISMATCH_HISTORY);
    }

    this.recordSyncEvent('mismatch_detected', mismatch);

    // 触发不匹配处?    this.handlePermissionMismatch(mismatch);
  }

  /**
   * 处理权限不匹?   */
  private handlePermissionMismatch(mismatch: PermissionMismatch): void {
    console.warn('检测到权限不匹?', mismatch);

    // 根据不匹配类型采取不同策?    if (mismatch.frontendResult && !mismatch.backendResult) {
      // 前端有权限但后端没有 - 可能是前端缓存过?      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('建议刷新前端权限缓存')} else if (!mismatch.frontendResult && mismatch.backendResult) {
      // 后端有权限但前端没有 - 可能是配置更新延?      // TODO: 移除调试日志 - // TODO: 移除调试日志 - console.log('建议强制同步权限配置')}
  }

  /**
   * 记录同步事件
   */
  private recordSyncEvent(type: SyncEvent['type'], details?: any): void {
    const event: SyncEvent = {
      type,
      timestamp: Date.now(),
      details,
    };

    this.syncHistory.unshift(event);

    // 保持历史记录大小
    if (this.syncHistory.length > 1000) {
      this.syncHistory = this.syncHistory.slice(0, 1000);
    }
  }

  /**
   * 通知订阅者状态变?   */
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback(this.syncStatus);
      } catch (error) {
        console.error('同步状态订阅者回调错?', error);
      }
    });
  }

  /**
   * 获取嵌套对象?   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * 公共API方法
   */

  getStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  getMismatches(limit: number = 10): PermissionMismatch[] {
    return this.mismatches.slice(0, limit);
  }

  getSyncHistory(limit: number = 50): SyncEvent[] {
    return this.syncHistory.slice(0, limit);
  }

  getSyncReport(): SyncReport {
    const recentEvents = this.syncHistory.slice(0, 100);
    const syncEvents = recentEvents.filter(e => e.type === 'sync_complete');
    const errorEvents = recentEvents.filter(e => e.type === 'sync_error');

    return {
      status: this.getStatus(),
      mismatches: this.getMismatches(20),
      syncHistory: this.getSyncHistory(100),
      performance: {
        averageSyncTime:
          syncEvents.length > 0
            ? syncEvents.reduce((sum, e) => sum + (e?.duration || 0), 0) /
              syncEvents.length
            : 0,
        syncFrequency: this.SYNC_INTERVAL,
        errorRate:
          recentEvents.length > 0
            ? (errorEvents.length / recentEvents.length) * 100
            : 0,
      },
    };
  }

  subscribe(callback: (status: SyncStatus) => void): () => void {
    this.subscribers.push(callback);
    callback(this.syncStatus); // 立即发送当前状?
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  async forceSync(user?: UserInfo): Promise<void> {
    await this.performSync(user);
  }

  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  clearMismatches(): void {
    this.mismatches = [];
    this.syncStatus.mismatchCount = 0;
    this.notifySubscribers();
  }

  destroy(): void {
    this.stopSync();
    this.subscribers = [];
    this.mismatches = [];
    this.syncHistory = [];
  }
}
