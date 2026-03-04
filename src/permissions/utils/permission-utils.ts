/**
 * 权限工具函数集合
 * 提供常用的权限处理和验证工具
 */

import { PermissionConfig } from '../config/permission-config';
import { UserInfo } from '../core/permission-manager';

/**
 * 权限表达式解析器
 * 支持复杂的权限表达式，如: "users_read & (content_create | content_update)"
 */
export class PermissionExpressionParser {
  static parse(expression: string): string[] {
    // 简化版本：提取权限标识?    const regex = /[a-zA-Z_][a-zA-Z0-9_]*/g;
    return expression.match(regex) || [];
  }

  static evaluate(expression: string, userPermissions: Set<string>): boolean {
    // 简化版本：检查是否包含所有必需权限
    const requiredPermissions = this.parse(expression);
    return requiredPermissions.every(perm => userPermissions.has(perm));
  }
}

/**
 * 权限继承关系处理? */
export class PermissionInheritanceHandler {
  static resolveInheritedPermissions(
    roles: string[],
    config: PermissionConfig
  ): Set<string> {
    const allPermissions = new Set<string>();

    const collectPermissions = (
      roleId: string,
      visited: Set<string> = new Set()
    ) => {
      if (visited.has(roleId)) return;
      visited.add(roleId);

      const role = config.roles[roleId];
      if (!role) return;

      // 添加当前角色的权?      role.permissions.forEach(perm => {
        if (perm === '*') {
          Object.keys(config.permissions).forEach(p => allPermissions.add(p));
        } else {
          allPermissions.add(perm);
        }
      });

      // 处理继承
      if (role.inherits) {
        role.inherits.forEach(inheritedRoleId => {
          collectPermissions(inheritedRoleId, visited);
        });
      }
    };

    roles.forEach(roleId => collectPermissions(roleId));
    return allPermissions;
  }
}

/**
 * 权限差异比较? */
export class PermissionComparator {
  static comparePermissions(
    oldPermissions: string[],
    newPermissions: string[]
  ): PermissionDiff {
    const oldSet = new Set(oldPermissions);
    const newSet = new Set(newPermissions);

    const added = [...newSet].filter(perm => !oldSet.has(perm));
    const removed = [...oldSet].filter(perm => !newSet.has(perm));
    const unchanged = [...oldSet].filter(perm => newSet.has(perm));

    return {
      added,
      removed,
      unchanged,
      hasChanges: added.length > 0 || removed.length > 0,
    };
  }

  static compareRolePermissions(
    oldRoles: string[],
    newRoles: string[],
    config: PermissionConfig
  ): RolePermissionDiff {
    const oldPermissions =
      PermissionInheritanceHandler.resolveInheritedPermissions(
        oldRoles,
        config
      );
    const newPermissions =
      PermissionInheritanceHandler.resolveInheritedPermissions(
        newRoles,
        config
      );

    return this.comparePermissions(
      Array.from(oldPermissions),
      Array.from(newPermissions)
    );
  }
}

/**
 * 权限验证? */
export class PermissionValidator {
  static validateUserPermissions(
    user: UserInfo,
    requiredPermissions: string[],
    config: PermissionConfig
  ): ValidationResult {
    const errors: string[] = [];

    // 验证用户状?    if (!user.isActive) {
      errors.push('用户账户已被禁用');
    }

    // 验证权限存在?    const userPermissions =
      PermissionInheritanceHandler.resolveInheritedPermissions(
        user.roles,
        config
      );
    const missingPermissions = requiredPermissions.filter(
      perm => !userPermissions.has(perm)
    );

    if (missingPermissions.length > 0) {
      errors.push(`缺少必要权限: ${missingPermissions.join(', ')}`);
    }

    // 验证租户访问
    if (config.tenantIsolation.enabled && user.tenantId) {
      // 这里可以根据具体业务逻辑添加租户验证
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateRoleAssignment(
    userId: string,
    newRoles: string[],
    config: PermissionConfig
  ): ValidationResult {
    const errors: string[] = [];

    // 验证角色存在?    const invalidRoles = newRoles.filter(roleId => !config.roles[roleId]);
    if (invalidRoles.length > 0) {
      errors.push(`无效角色: ${invalidRoles.join(', ')}`);
    }

    // 验证角色层级（防止权限降级攻击）
    // 这里可以添加更复杂的验证逻辑

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * 权限审计工具
 */
export class PermissionAuditor {
  static generateAuditTrail(
    userId: string,
    action: string,
    resource: string,
    permissions: string[],
    granted: boolean,
    details?: Record<string, any>
  ): AuditTrailEntry {
    return {
      id: this.generateId(),
      userId,
      action,
      resource,
      permissions,
      granted,
      timestamp: new Date().toISOString(),
      details: details || {},
    };
  }

  static generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static formatAuditLog(entry: AuditTrailEntry): string {
    return `[${entry.timestamp}] User:${entry.userId} ${entry.action} ${entry.resource} - ${entry.granted ? 'GRANTED' : 'DENIED'} [${entry.permissions.join(', ')}]`;
  }
}

/**
 * 权限缓存管理? */
export class PermissionCache {
  private cache: Map<string, CachedPermissionData> = new Map();
  private readonly DEFAULT_TTL = 300000; // 5分钟

  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  has(key: string): boolean {
    return (
      this.cache.has(key) &&
      Date.now() - (this.cache.get(key)?.timestamp || 0) <=
        (this.cache.get(key)?.ttl || 0)
    );
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getSize(): number {
    return this.cache.size;
  }

  cleanup(): number {
    let cleanedCount = 0;
    const now = Date.now();

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }
}

// 类型定义
export interface PermissionDiff {
  added: string[];
  removed: string[];
  unchanged: string[];
  hasChanges: boolean;
}

export interface RolePermissionDiff extends PermissionDiff {}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface AuditTrailEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  permissions: string[];
  granted: boolean;
  timestamp: string;
  details: Record<string, any>;
}

interface CachedPermissionData {
  data: any;
  timestamp: number;
  ttl: number;
}

// 导出便捷函数
export const permissionUtils = {
  parseExpression: PermissionExpressionParser.parse,
  evaluateExpression: PermissionExpressionParser.evaluate,
  resolveInheritedPermissions:
    PermissionInheritanceHandler.resolveInheritedPermissions,
  comparePermissions: PermissionComparator.comparePermissions,
  compareRolePermissions: PermissionComparator.compareRolePermissions,
  validateUserPermissions: PermissionValidator.validateUserPermissions,
  validateRoleAssignment: PermissionValidator.validateRoleAssignment,
  generateAuditTrail: PermissionAuditor.generateAuditTrail,
  formatAuditLog: PermissionAuditor.formatAuditLog,
};
