/**
 * 统一权限管理服务
 * 提供完整的RBAC权限检查、角色管理和数据访问控制功能
 */

import { createClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import { getLogger } from '@/lib/logger';

interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  checkedAt: Date;
}

interface RoleInfo {
  id: string;
  name: string;
  description: string;
  level: number;
  isSystem: boolean;
  inherits?: string[];
}

interface PermissionInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  action: string;
  isSensitive: boolean;
}

interface DataAccessRule {
  id: string;
  roleId: string;
  dataSource: string;
  tableName: string;
  columnName?: string;
  accessType: 'READ' | 'WRITE' | 'EXECUTE';
  rowFilter?: Record<string, any>;
  columnMask?: {
    type: 'MASK' | 'HASH' | 'TRUNCATE';
    pattern?: string;
  };
}

export class UnifiedPermissionService {
  private supabase: ReturnType<typeof createClient>;
  private redis: Redis;
  private logger = getLogger('permission-service');
  private cachePrefix = 'perm:v2:';

  constructor(supabaseUrl: string, supabaseKey: string, redisUrl: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.redis = new Redis(redisUrl);

    // 设置Redis连接事件监听
    this.redis.on('connect', () => {
      this.logger.info('Redis连接已建?);
    });

    this.redis.on('error', err => {
      this.logger.error('Redis连接错误:', err);
    });
  }

  /**
   * 检查用户是否具有指定权?   */
  async checkPermission(
    userId: string,
    permission: string,
    options: { skipCache?: boolean; context?: Record<string, any> } = {}
  ): Promise<PermissionCheckResult> {
    const { skipCache = false, context = {} } = options;

    try {
      // 1. 参数验证
      if (!userId || !permission) {
        return {
          allowed: false,
          reason: '用户ID或权限标识缺?,
          checkedAt: new Date(),
        };
      }

      // 2. 检查缓存（除非显式跳过?      if (!skipCache) {
        const cachedResult = await this.getCachedPermissionCheck(
          userId,
          permission
        );
        if (cachedResult !== null) {
          this.logger.debug(`权限检查命中缓? ${userId} -> ${permission}`);
          return {
            allowed: cachedResult,
            checkedAt: new Date(),
          };
        }
      }

      // 3. 获取用户角色（包含继承关系）
      const effectiveRoles = await this.getEffectiveUserRoles(userId);

      if (effectiveRoles.length === 0) {
        await this.cachePermissionCheck(userId, permission, false, 300);
        return {
          allowed: false,
          reason: '用户没有任何角色',
          checkedAt: new Date(),
        };
      }

      // 4. 检查权?      const hasPermission = await this.checkRolesPermission(
        effectiveRoles,
        permission
      );

      // 5. 缓存结果?分钟?      await this.cachePermissionCheck(userId, permission, hasPermission, 300);

      // 6. 记录审计日志
      await this.logPermissionCheck(userId, permission, hasPermission, context);

      this.logger.info(
        `权限检查完? ${userId} -> ${permission} = ${hasPermission}`
      );

      return {
        allowed: hasPermission,
        checkedAt: new Date(),
      };
    } catch (error) {
      this.logger.error('权限检查失?', error);
      return {
        allowed: false,
        reason: '系统错误',
        checkedAt: new Date(),
      };
    }
  }

  /**
   * 获取用户的有效角色（包含继承关系?   */
  private async getEffectiveUserRoles(userId: string): Promise<string[]> {
    const cacheKey = `${this.cachePrefix}user_roles:${userId}`;

    // 尝试从缓存获?    const cachedRoles = await this.redis.get(cacheKey);
    if (cachedRoles) {
      return JSON.parse(cachedRoles);
    }

    try {
      // 从数据库获取用户直接角色
      const { data: userRoles, error } = await this.supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.now()');

      if (error) throw error;

      const directRoles = userRoles?.map(ur => ur.role_id) || [];

      // 解析继承角色
      const effectiveRoles = await this.resolveRoleInheritance(directRoles);

      // 缓存结果?0分钟?      await this.redis.setex(cacheKey, 600, JSON.stringify(effectiveRoles));

      return effectiveRoles;
    } catch (error) {
      this.logger.error('获取用户角色失败:', error);
      return [];
    }
  }

  /**
   * 解析角色继承关系
   */
  private async resolveRoleInheritance(roles: string[]): Promise<string[]> {
    if (roles.length === 0) return [];

    const effectiveRoles = new Set<string>(roles);
    const queue = [...roles];

    while (queue.length > 0) {
      const currentRole = queue.shift()!;

      try {
        const { data: role } = await this.supabase
          .from('roles')
          .select('inherits')
          .eq('id', currentRole)
          .single();

        const parentRoles = role?.inherits || [];

        for (const parentRole of parentRoles) {
          if (!effectiveRoles.has(parentRole)) {
            effectiveRoles.add(parentRole);
            queue.push(parentRole);
          }
        }
      } catch (error) {
        this.logger.warn(`解析角色继承失败: ${currentRole}`, error);
      }
    }

    return Array.from(effectiveRoles);
  }

  /**
   * 检查角色集合是否具有指定权?   */
  private async checkRolesPermission(
    roles: string[],
    permission: string
  ): Promise<boolean> {
    if (roles.includes('admin')) {
      return true; // 超级管理员拥有所有权?    }

    try {
      const { data, error } = await this.supabase
        .from('role_permissions')
        .select('permission_id')
        .in('role_id', roles)
        .eq('permission_id', permission);

      if (error) throw error;

      return ((data as any)?.length || 0) > 0;
    } catch (error) {
      this.logger.error('检查角色权限失?', error);
      return false;
    }
  }

  /**
   * 获取用户可访问的资源列表
   */
  async getAccessibleResources(
    userId: string,
    category?: string
  ): Promise<{ resources: string[]; permissions: PermissionInfo[] }> {
    try {
      const effectiveRoles = await this.getEffectiveUserRoles(userId);

      if (effectiveRoles.length === 0) {
        return { resources: [], permissions: [] };
      }

      let query = this.supabase
        .from('permissions')
        .select(
          `
          id, name, description, category, resource, action, is_sensitive,
          role_permissions(role_id)
        `
        )
        .in('role_permissions.role_id', effectiveRoles);

      if (category) {
        query = query.eq('category', category);
      }

      const { data: permissions, error } = await query;

      if (error) throw error;

      const resources = [...new Set(permissions?.map(p => p.resource) || [])];
      const permissionInfos =
        permissions?.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          category: p.category,
          resource: p.resource,
          action: p.action,
          isSensitive: p.is_sensitive,
        })) || [];

      return {
        resources,
        permissions: permissionInfos,
      };
    } catch (error) {
      this.logger.error('获取可访问资源失?', error);
      return { resources: [], permissions: [] };
    }
  }

  /**
   * 数据访问控制检?   */
  async checkDataAccess(
    userId: string,
    dataSource: string,
    tableName: string,
    accessType: 'READ' | 'WRITE' | 'EXECUTE' = 'READ'
  ): Promise<{
    allowed: boolean;
    filters?: Record<string, any>;
    masking?: Record<string, any>;
  }> {
    try {
      const effectiveRoles = await this.getEffectiveUserRoles(userId);

      if (effectiveRoles.includes('admin')) {
        return { allowed: true }; // 管理员无限制访问
      }

      // 查询数据访问规则
      const { data: rules, error } = await this.supabase
        .from('data_access_permissions')
        .select('*')
        .in('role_id', effectiveRoles)
        .eq('data_source', dataSource)
        .eq('table_name', tableName)
        .eq('access_type', accessType);

      if (error) throw error;

      if (!rules || rules.length === 0) {
        return { allowed: false };
      }

      // 合并所有规?      const mergedFilters: Record<string, any> = {};
      const mergedMasking: Record<string, any> = {};

      for (const rule of rules) {
        // 合并行过滤条?        if (rule.row_filter) {
          Object.assign(mergedFilters, rule.row_filter);
        }

        // 合并列脱敏规?        if (rule.column_mask && rule.column_name) {
          mergedMasking[rule.column_name] = rule.column_mask;
        }
      }

      return {
        allowed: true,
        filters:
          Object.keys(mergedFilters).length > 0 ? mergedFilters : undefined,
        masking:
          Object.keys(mergedMasking).length > 0 ? mergedMasking : undefined,
      };
    } catch (error) {
      this.logger.error('数据访问控制检查失?', error);
      return { allowed: false };
    }
  }

  /**
   * 缓存权限检查结?   */
  private async cachePermissionCheck(
    userId: string,
    permission: string,
    result: boolean,
    ttl: number
  ): Promise<void> {
    const key = `${this.cachePrefix}${userId}:${permission}`;
    await this.redis.setex(key, ttl, result ? '1' : '0');
  }

  /**
   * 获取缓存的权限检查结?   */
  private async getCachedPermissionCheck(
    userId: string,
    permission: string
  ): Promise<boolean | null> {
    const key = `${this.cachePrefix}${userId}:${permission}`;
    const result = await this.redis.get(key);
    return result === null ? null : result === '1';
  }

  /**
   * 记录权限检查审计日?   */
  private async logPermissionCheck(
    userId: string,
    permission: string,
    result: boolean,
    context: Record<string, any> = {}
  ): Promise<void> {
    try {
      (await this.supabase.from('permission_audit_log').insert({
        user_id: userId,
        permission_id: permission,
        action: 'CHECK',
        resource: context.resource,
        result: result,
        ip_address: context.ip,
        user_agent: context.userAgent,
        metadata: context,
      })) as any;
    } catch (error) {
      this.logger.error('记录权限审计日志失败:', error);
    }
  }

  /**
   * 清除用户权限缓存
   */
  async clearUserPermissionCache(userId: string): Promise<void> {
    try {
      const pattern = `${this.cachePrefix}${userId}:*`;
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }

      // 清除角色缓存
      await this.redis.del(`${this.cachePrefix}user_roles:${userId}`);

      this.logger.info(`已清除用户权限缓? ${userId}`);
    } catch (error) {
      this.logger.error('清除用户权限缓存失败:', error);
    }
  }

  /**
   * 批量权限检?   */
  async batchCheckPermissions(
    userId: string,
    permissions: string[]
  ): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    // 并行检查所有权?    const checkPromises = permissions.map(async permission => {
      const result = await this.checkPermission(userId, permission);
      return { permission, allowed: result.allowed };
    });

    const checkResults = await Promise.all(checkPromises);

    // 构造结果对?    for (const { permission, allowed } of checkResults) {
      results[permission] = allowed;
    }

    return results;
  }

  /**
   * 获取权限统计信息
   */
  async getPermissionStats(): Promise<{
    totalUsers: number;
    totalRoles: number;
    totalPermissions: number;
    activeSessions: number;
  }> {
    try {
      const [userCount, roleCount, permissionCount, activeSessionCount] =
        await Promise.all([
          this.supabase.from('user_roles').select('*', { count: 'exact' }),
          this.supabase.from('roles').select('*', { count: 'exact' }),
          this.supabase.from('permissions').select('*', { count: 'exact' }),
          this.redis.keys(`${this.cachePrefix}*`).then(keys => keys.length),
        ]);

      return {
        totalUsers: userCount.count || 0,
        totalRoles: roleCount.count || 0,
        totalPermissions: permissionCount.count || 0,
        activeSessions: activeSessionCount,
      };
    } catch (error) {
      this.logger.error('获取权限统计信息失败:', error);
      return {
        totalUsers: 0,
        totalRoles: 0,
        totalPermissions: 0,
        activeSessions: 0,
      };
    }
  }

  /**
   * 关闭服务连接
   */
  async close(): Promise<void> {
    await this.redis.quit();
    this.logger.info('权限服务连接已关?);
  }
}
