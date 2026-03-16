/**
 * 权限管理器核心类
 * 负责权限的验证、检查和管理
 */

import {
  PermissionConfig,
  PermissionConfigManager,
  PermissionDefinition,
  RoleDefinition,
} from '../config/permission-config';

export interface UserInfo {
  id: string;
  email: string;
  roles: string[];
  tenantId?: string;
  isActive: boolean;
}

export interface PermissionCheckResult {
  hasPermission: boolean;
  missingPermissions?: string[];
  reason?: string;
}

export interface AccessLogEntry {
  userId: string;
  permission: string;
  resource: string;
  action: string;
  granted: boolean;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export class PermissionManager {
  private static instance: PermissionManager;
  private configManager: PermissionConfigManager;
  private accessLogs: AccessLogEntry[] = [];
  private logBufferSize: number = 1000;

  private constructor() {
    this.configManager = PermissionConfigManager.getInstance();
  }

  static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  /**
   * 检查用户是否具有指定权限
   */
  hasPermission(
    user: UserInfo,
    permission: string | string[],
    resource?: string
  ): PermissionCheckResult {
    // 基础验证
    if (!user.isActive) {
      return {
        hasPermission: false,
        reason: '用户账户已被禁用',
      };
    }

    const permissions = Array.isArray(permission) ? permission : [permission];

    // 超级管理员拥有所有权限
    if (user.roles.includes('admin')) {
      return { hasPermission: true };
    }

    const config = this.configManager.getConfig();
    const userPermissions = this.getUserPermissions(user, config);

    // 检查每个权限
    const missingPermissions: string[] = [];

    for (const perm of permissions) {
      if (!this.checkSinglePermission(userPermissions, perm, resource)) {
        missingPermissions.push(perm);
      }
    }

    if (missingPermissions.length > 0) {
      return {
        hasPermission: false,
        missingPermissions,
        reason: `缺少权限: ${missingPermissions.join(', ')}`,
      };
    }

    // 记录访问日志
    this.logAccess(user, permissions[0], resource || 'unknown', 'check');

    return { hasPermission: true };
  }

  /**
   * 检查用户是否具有任意一个指定权限
   */
  hasAnyPermission(
    user: UserInfo,
    permissions: string[]
  ): PermissionCheckResult {
    for (const permission of permissions) {
      const result = this.hasPermission(user, permission);
      if (result.hasPermission) {
        return { hasPermission: true };
      }
    }

    return {
      hasPermission: false,
      reason: `不具有任何指定权限: ${permissions.join(', ')}`,
    };
  }

  /**
   * 检查用户是否具有所有指定权限
   */
  hasAllPermissions(
    user: UserInfo,
    permissions: string[]
  ): PermissionCheckResult {
    const missingPermissions: string[] = [];

    for (const permission of permissions) {
      const result = this.hasPermission(user, permission);
      if (!result.hasPermission) {
        missingPermissions.push(...(result.missingPermissions || [permission]));
      }
    }

    if (missingPermissions.length > 0) {
      return {
        hasPermission: false,
        missingPermissions,
        reason: `缺少权限: ${missingPermissions.join(', ')}`,
      };
    }

    return { hasPermission: true };
  }

  /**
   * 获取用户的所有权限
   */
  getUserPermissions(user: UserInfo, config?: PermissionConfig): Set<string> {
    const permissions = new Set<string>();
    const currentConfig = config || this.configManager.getConfig();

    // 超级管理员
    if (user.roles.includes('admin')) {
      // 添加所有权限
      Object.keys(currentConfig.permissions).forEach(perm => {
        permissions.add(perm);
      });
      return permissions;
    }

    // 普通用户 - 收集所有角色的权限
    user.roles.forEach(roleId => {
      const role = currentConfig.roles[roleId];
      if (role) {
        // 处理角色继承
        this.collectRolePermissions(role, currentConfig, permissions);
      }
    });

    return permissions;
  }

  /**
   * 收集角色及其继承角色的所有权限
   */
  private collectRolePermissions(
    role: RoleDefinition,
    config: PermissionConfig,
    permissions: Set<string>,
    visitedRoles: Set<string> = new Set()
  ): void {
    // 防止循环继承
    if (visitedRoles.has(role.name)) {
      return;
    }
    visitedRoles.add(role.name);

    // 添加当前角色的权限
    role.permissions.forEach((perm: string) => {
      if (perm === '*') {
        // 添加所有权限
        Object.keys(config.permissions).forEach(p => permissions.add(p));
      } else {
        permissions.add(perm);
      }
    });

    // 处理继承的角色
    if (role.inherits) {
      role.inherits.forEach((inheritedRoleId: string) => {
        const inheritedRole = config.roles[inheritedRoleId];
        if (inheritedRole) {
          this.collectRolePermissions(
            inheritedRole,
            config,
            permissions,
            visitedRoles
          );
        }
      });
    }
  }

  /**
   * 检查单个权限
   */
  private checkSinglePermission(
    userPermissions: Set<string>,
    permission: string,
    resource?: string
  ): boolean {
    // 直接权限检查
    if (userPermissions.has(permission)) {
      return true;
    }

    // 通配符权限检查
    if (userPermissions.has('*')) {
      return true;
    }

    // 资源级别的通配符检查(例如: resource_*)
    if (resource) {
      const resourceWildcard = `${resource}_*`;
      if (userPermissions.has(resourceWildcard)) {
        return true;
      }

      // 分类通配符检查(例如: category_*)
      const config = this.configManager.getConfig();
      const permDef = config.permissions[permission];
      if (permDef) {
        const categoryWildcard = `${permDef.category}_*`;
        if (userPermissions.has(categoryWildcard)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 检查资源访问权限
   */
  canAccessResource(
    user: UserInfo,
    resource: string,
    action: string
  ): PermissionCheckResult {
    const permissionKey = `${resource}_${action}`;
    return this.hasPermission(user, permissionKey, resource);
  }

  /**
   * 获取用户可访问的资源列表
   */
  getUserAccessibleResources(user: UserInfo, category?: string): string[] {
    const config = this.configManager.getConfig();
    const userPermissions = this.getUserPermissions(user, config);
    const accessibleResources = new Set<string>();

    // 超级管理员可以访问所有资源
    if (user.roles.includes('admin')) {
      return Object.values(config.permissions)
        .filter(
          (perm: PermissionDefinition) =>
            !category || perm.category === category
        )
        .map((perm: PermissionDefinition) => perm.resource);
    }

    // 普通用户 - 根据权限推断可访问资源
    userPermissions.forEach(permKey => {
      const permission = config.permissions[permKey];
      if (permission && (!category || permission.category === category)) {
        accessibleResources.add(permission.resource);
      }
    });

    return Array.from(accessibleResources);
  }

  /**
   * 验证租户访问权限
   */
  validateTenantAccess(
    user: UserInfo,
    resourceTenantId?: string
  ): PermissionCheckResult {
    const config = this.configManager.getConfig();

    // 如果未启用租户隔离，允许访问
    if (!config.tenantIsolation.enabled) {
      return { hasPermission: true };
    }

    // 超级管理员可以访问所有租户数据
    if (user.roles.includes('admin')) {
      return { hasPermission: true };
    }

    // 如果资源没有租户信息，允许访问（公共数据）
    if (!resourceTenantId) {
      return { hasPermission: true };
    }

    // 检查用户租户ID
    if (!user.tenantId) {
      return {
        hasPermission: false,
        reason: '用户缺少租户信息',
      };
    }

    // 验证租户匹配
    if (user.tenantId !== resourceTenantId) {
      return {
        hasPermission: false,
        reason: '无权访问其他租户的数据',
      };
    }

    return { hasPermission: true };
  }

  /**
   * 记录访问日志
   */
  private logAccess(
    user: UserInfo,
    permission: string,
    resource: string,
    action: string,
    granted: boolean = true
  ): void {
    const logEntry: AccessLogEntry = {
      userId: user.id,
      permission,
      resource,
      action,
      granted,
      timestamp: new Date(),
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent(),
    };

    this.accessLogs.push(logEntry);

    // 保持日志缓冲区大小
    if (this.accessLogs.length > this.logBufferSize) {
      this.accessLogs.shift();
    }

    // 异步写入持久化存储
    this.persistAccessLog(logEntry);
  }

  /**
   * 获取访问日志
   */
  getAccessLogs(userId?: string, limit: number = 100): AccessLogEntry[] {
    let logs = [...this.accessLogs].reverse(); // 最新的在前面
    if (userId) {
      logs = logs.filter(log => log.userId === userId);
    }

    return logs.slice(0, limit);
  }

  /**
   * 清空访问日志
   */
  clearAccessLogs(): void {
    this.accessLogs = [];
  }

  /**
   * 获取客户端IP（需要在服务端环境中实现）
   */
  private getClientIP(): string | undefined {
    // 在实际应用中，这里应该从请求头中获取真实IP
    // 例如: request.headers['x-forwarded-for'] || request.connection.remoteAddress
    return undefined;
  }

  /**
   * 获取用户代理（需要在服务端环境中实现）
   */
  private getUserAgent(): string | undefined {
    // 在实际应用中，这里应该从请求头中获取User-Agent
    // 例如: request.headers['user-agent']
    return undefined;
  }

  /**
   * 持久化访问日志（异步）
   */
  private async persistAccessLog(logEntry: AccessLogEntry): Promise<void> {
    try {
      // 这里应该实现实际的日志存储逻辑
      // 例如写入数据库、文件或发送到日志服务

      // 示例：写入控制台（生产环境应该替换为实际存储）
      if (process.env.NODE_ENV === 'development') {
        // TODO: 移除调试日志
        console.info('Access Log:', {
          user: logEntry.userId,
          permission: logEntry.permission,
          resource: logEntry.resource,
          granted: logEntry.granted,
          timestamp: logEntry.timestamp.toISOString(),
        });
      }

      // 实际实现可能如下：
      /*
      await db.insert({
        table: 'access_logs',
        data: {
          user_id: logEntry.userId,
          permission: logEntry.permission,
          resource: logEntry.resource,
          action: logEntry.action,
          granted: logEntry.granted,
          timestamp: logEntry.timestamp,
          ip_address: logEntry.ipAddress,
          user_agent: logEntry.userAgent
        }
      }) as any;
      */
    } catch (error) {
      console.error('Failed to persist access log:', error);
    }
  }

  /**
   * 获取权限统计信息
   */
  getPermissionStats(): {
    totalPermissions: number;
    totalRoles: number;
    activeUsers: number;
    recentAccessLogs: number;
  } {
    const config = this.configManager.getConfig();

    return {
      totalPermissions: Object.keys(config.permissions).length,
      totalRoles: Object.keys(config.roles).length,
      activeUsers: 0, // 需要从用户服务获取
      recentAccessLogs: this.accessLogs.length,
    };
  }
}
