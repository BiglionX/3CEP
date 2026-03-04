/**
 * 租户隔离管理? * 实现多租户环境下的数据隔离和访问控制
 */

import { PermissionConfig } from '../config/permission-config';

export interface TenantInfo {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  settings: TenantSettings;
}

export interface TenantSettings {
  maxUsers: number;
  storageQuota: number;
  features: string[];
  dataIsolation: boolean;
  auditEnabled: boolean;
}

export interface DataAccessLog {
  id: string;
  tenantId: string;
  userId: string;
  resource: string;
  action: string;
  timestamp: number;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details?: any;
}

export interface TenantAuditReport {
  tenantId: string;
  periodStart: number;
  periodEnd: number;
  accessSummary: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    uniqueUsers: number;
    uniqueResources: number;
  };
  topResources: Array<{
    resource: string;
    accessCount: number;
    uniqueUsers: number;
  }>;
  suspiciousActivities: DataAccessLog[];
  complianceScore: number;
}

export class TenantIsolationManager {
  private static instance: TenantIsolationManager;
  private tenants: Map<string, TenantInfo> = new Map();
  private accessLogs: DataAccessLog[] = [];
  private readonly MAX_LOGS = 10000;
  private readonly SUSPICIOUS_THRESHOLD = 100; // 异常访问阈?
  private constructor() {
    this.initializeDefaultTenants();
  }

  static getInstance(): TenantIsolationManager {
    if (!TenantIsolationManager.instance) {
      TenantIsolationManager.instance = new TenantIsolationManager();
    }
    return TenantIsolationManager.instance;
  }

  /**
   * 初始化默认租?   */
  private initializeDefaultTenants(): void {
    // 默认租户
    const defaultTenant: TenantInfo = {
      id: 'default-tenant',
      name: '默认租户',
      status: 'active',
      createdAt: new Date().toISOString(),
      settings: {
        maxUsers: 1000,
        storageQuota: 10737418240, // 10GB
        features: ['basic', 'advanced', 'premium'],
        dataIsolation: true,
        auditEnabled: true,
      },
    };

    this.tenants.set(defaultTenant.id, defaultTenant);
  }

  /**
   * 验证租户访问权限
   */
  validateTenantAccess(
    tenantId: string,
    userId: string,
    resource: string,
    action: string
  ): { allowed: boolean; reason?: string } {
    const tenant = this.tenants.get(tenantId);

    if (!tenant) {
      return { allowed: false, reason: '租户不存? };
    }

    if (tenant.status !== 'active') {
      return { allowed: false, reason: `租户状态为 ${tenant.status}` };
    }

    // 检查资源访问权?    const resourceTenant = this.extractTenantFromResource(resource);
    if (resourceTenant && resourceTenant !== tenantId) {
      return { allowed: false, reason: '跨租户资源访问被拒绝' };
    }

    return { allowed: true };
  }

  /**
   * 记录数据访问日志
   */
  logDataAccess(logEntry: Omit<DataAccessLog, 'id' | 'timestamp'>): void {
    const log: DataAccessLog = {
      id: this.generateLogId(),
      timestamp: Date.now(),
      ...logEntry,
    };

    this.accessLogs.unshift(log);

    // 保持日志数量限制
    if (this.accessLogs.length > this.MAX_LOGS) {
      this.accessLogs = this.accessLogs.slice(0, this.MAX_LOGS);
    }

    // 检查异常活?    this.detectSuspiciousActivity(log);
  }

  /**
   * 从资源标识符提取租户ID
   */
  private extractTenantFromResource(resource: string): string | null {
    // 资源格式: tenantId:resourceType:resourceId
    const parts = resource.split(':');
    return parts.length >= 3 ? parts[0] : null;
  }

  /**
   * 检测可疑活?   */
  private detectSuspiciousActivity(log: DataAccessLog): void {
    const recentLogs = this.accessLogs.filter(
      l => l.userId === log.userId && l.timestamp > Date.now() - 3600000 // 1小时?    );

    if (recentLogs.length > this.SUSPICIOUS_THRESHOLD) {
      console.warn(
        `检测到可疑活动: 用户 ${log.userId} �?小时内访问了 ${recentLogs.length} 次资源`
      );
      // 这里可以触发告警或临时限制访?    }

    // 检查跨租户访问尝试
    if (log?.crossTenantAttempt) {
      console.warn(
        `检测到跨租户访问尝? 用户 ${log.userId} 尝试访问其他租户资源`
      );
    }
  }

  /**
   * 生成日志ID
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取租户审计报告
   */
  getTenantAuditReport(tenantId: string, days: number = 30): TenantAuditReport {
    const periodEnd = Date.now();
    const periodStart = periodEnd - days * 24 * 60 * 60 * 1000;

    const tenantLogs = this.accessLogs.filter(
      log =>
        log.tenantId === tenantId &&
        log.timestamp >= periodStart &&
        log.timestamp <= periodEnd
    );

    // 计算访问摘要
    const successfulRequests = tenantLogs.filter(log => log.success).length;
    const failedRequests = tenantLogs.filter(log => !log.success).length;
    const uniqueUsers = new Set(tenantLogs.map(log => log.userId)).size;
    const uniqueResources = new Set(tenantLogs.map(log => log.resource)).size;

    // 统计热门资源
    const resourceCounts = new Map<
      string,
      { count: number; users: Set<string> }
    >();
    tenantLogs.forEach(log => {
      if (!resourceCounts.has(log.resource)) {
        resourceCounts.set(log.resource, { count: 0, users: new Set() });
      }
      const resourceStat = resourceCounts.get(log.resource)!;
      resourceStat.count++;
      resourceStat.users.add(log.userId);
    });

    const topResources = Array.from(resourceCounts.entries())
      .map(([resource, stat]) => ({
        resource,
        accessCount: stat.count,
        uniqueUsers: stat.users.size,
      }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 10);

    // 检测可疑活?    const suspiciousActivities = tenantLogs.filter(
      log => log?.suspicious || log?.crossTenantAttempt || !log.success
    );

    // 计算合规分数 (0-100)
    const complianceScore = this.calculateComplianceScore(tenantLogs);

    return {
      tenantId,
      periodStart,
      periodEnd,
      accessSummary: {
        totalRequests: tenantLogs.length,
        successfulRequests,
        failedRequests,
        uniqueUsers,
        uniqueResources,
      },
      topResources,
      suspiciousActivities,
      complianceScore,
    };
  }

  /**
   * 计算合规分数
   */
  private calculateComplianceScore(logs: DataAccessLog[]): number {
    if (logs.length === 0) return 100;

    const totalLogs = logs.length;
    const failedLogs = logs.filter(log => !log.success).length;
    const suspiciousLogs = logs.filter(
      log => log?.suspicious || log?.crossTenantAttempt
    ).length;

    // 基础分数
    let score = 100;

    // 扣除失败请求分数
    score -= (failedLogs / totalLogs) * 30;

    // 扣除可疑活动分数
    score -= (suspiciousLogs / totalLogs) * 50;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * 获取租户信息
   */
  getTenant(tenantId: string): TenantInfo | undefined {
    return this.tenants.get(tenantId);
  }

  /**
   * 创建新租?   */
  createTenant(tenantInfo: Omit<TenantInfo, 'createdAt'>): TenantInfo {
    const newTenant: TenantInfo = {
      ...tenantInfo,
      createdAt: new Date().toISOString(),
    };

    this.tenants.set(newTenant.id, newTenant);
    return newTenant;
  }

  /**
   * 更新租户设置
   */
  updateTenantSettings(
    tenantId: string,
    settings: Partial<TenantSettings>
  ): boolean {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return false;

    tenant.settings = { ...tenant.settings, ...settings };
    return true;
  }

  /**
   * 获取租户统计数据
   */
  getTenantStatistics(): Record<string, any> {
    const stats: Record<string, any> = {
      totalTenants: this.tenants.size,
      activeTenants: 0,
      inactiveTenants: 0,
      suspendedTenants: 0,
      totalAccessLogs: this.accessLogs.length,
      recentLogs: this.accessLogs.slice(0, 100),
    };

    this.tenants.forEach(tenant => {
      switch (tenant.status) {
        case 'active':
          stats.activeTenants++;
          break;
        case 'inactive':
          stats.inactiveTenants++;
          break;
        case 'suspended':
          stats.suspendedTenants++;
          break;
      }
    });

    return stats;
  }

  /**
   * 清理过期日志
   */
  cleanupOldLogs(daysToKeep: number = 90): number {
    const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    const initialLength = this.accessLogs.length;

    this.accessLogs = this.accessLogs.filter(log => log.timestamp > cutoffTime);

    return initialLength - this.accessLogs.length;
  }

  /**
   * 导出审计数据
   */
  exportAuditData(
    tenantId?: string,
    startDate?: number,
    endDate?: number
  ): DataAccessLog[] {
    let filteredLogs = [...this.accessLogs];

    if (tenantId) {
      filteredLogs = filteredLogs.filter(log => log.tenantId === tenantId);
    }

    if (startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= startDate);
    }

    if (endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= endDate);
    }

    return filteredLogs;
  }

  /**
   * 验证资源所有权
   */
  validateResourceOwnership(tenantId: string, resource: string): boolean {
    const resourceTenant = this.extractTenantFromResource(resource);
    return !resourceTenant || resourceTenant === tenantId;
  }

  /**
   * 获取租户资源列表
   */
  getTenantResources(tenantId: string): string[] {
    const tenantResources = new Set<string>();

    this.accessLogs
      .filter(log => log.tenantId === tenantId)
      .forEach(log => tenantResources.add(log.resource));

    return Array.from(tenantResources);
  }
}
