/**
 * 数据权限过滤器
 *
 * 实现多租户环境下的数据级权限控制，包括：
 * - 租户隔离过滤
 * - 创建者过滤
 * - 部门/角色过滤
 *
 * @module modules/common/permissions/core/data-permission.filter
 */

/**
 * 用户信息接口
 */
export interface UserInfo {
  id: string;
  email?: string;
  roles?: string[];
  tenantId?: string;
  departmentId?: string;
  [key: string]: any;
}

/**
 * 资源配置接口
 */
export interface ResourceRestrictionConfig {
  /** 需要创建者过滤的资源类型 */
  creatorRestricted: string[];
  /** 需要租户隔离的资源类型 */
  tenantIsolated: string[];
  /** 跨租户访问白名单 */
  crossTenantWhitelist: string[];
}

/**
 * 查询过滤器接口
 */
export interface QueryFilters {
  [key: string]: any;
  tenant_id?: string;
  created_by?: string;
  department_id?: string;
}

/**
 * 数据范围枚举
 */
export enum DataScope {
  /** 仅本人数据 */
  SELF = 'self',
  /** 本部门数据 */
  DEPARTMENT = 'department',
  /** 本租户所有数据 */
  TENANT = 'tenant',
  /** 跨租户数据（管理员） */
  CROSS_TENANT = 'cross_tenant',
}

/**
 * 数据权限过滤器主类
 */
export class DataPermissionFilter {
  /**
   * 资源配置
   */
  private static readonly RESOURCE_CONFIG: ResourceRestrictionConfig = {
    creatorRestricted: [
      'orders',
      'devices',
      'portals',
      'agent_subscriptions',
      'quotations',
      'contracts',
    ],
    tenantIsolated: [
      'users',
      'content',
      'shops',
      'payments',
      'procurement',
      'inventory',
      'articles',
      'tutorials',
      'manuals',
      'parts',
      'finance',
      'diagnostics',
      'valuation',
      'links',
      'tenants',
      'orders', // 订单也需要租户隔离
      'devices', // 设备也需要租户隔离
    ],
    crossTenantWhitelist: ['admin', 'system'],
  };

  /**
   * 应用数据范围过滤
   *
   * @param filters - 原始查询过滤器
   * @param user - 当前用户信息
   * @param resourceType - 资源类型
   * @param dataScope - 数据范围（可选）
   * @returns 过滤后的查询条件
   */
  static applyDataScope(
    filters: QueryFilters,
    user: UserInfo,
    resourceType: string,
    dataScope?: DataScope
  ): QueryFilters {
    const result = { ...filters };

    // 超级管理员跳过所有过滤
    if (user.roles?.includes('admin')) {
      return result;
    }

    // 确定数据范围
    const scope = dataScope || this.determineDataScope(user, resourceType);

    // 应用租户隔离（如果需要）
    if (this.isTenantIsolated(resourceType)) {
      this.applyTenantIsolation(result, user);
    }

    // 应用创建者过滤（如果需要）
    if (this.isCreatorRestricted(resourceType)) {
      this.applyCreatorFilter(result, user, scope);
    }

    return result;
  }

  /**
   * 判断资源是否需要租户隔离
   */
  static isTenantIsolated(resourceType: string): boolean {
    return DataPermissionFilter.RESOURCE_CONFIG.tenantIsolated.some(type =>
      resourceType.toLowerCase().includes(type)
    );
  }

  /**
   * 判断资源是否需要创建者过滤
   */
  static isCreatorRestricted(resourceType: string): boolean {
    return DataPermissionFilter.RESOURCE_CONFIG.creatorRestricted.some(type =>
      resourceType.toLowerCase().includes(type)
    );
  }

  /**
   * 获取跨租户访问白名单
   */
  static getCrossTenantWhitelist(): string[] {
    return [...DataPermissionFilter.RESOURCE_CONFIG.crossTenantWhitelist];
  }

  /**
   * 应用租户隔离过滤
   */
  private static applyTenantIsolation(
    filters: QueryFilters,
    user: UserInfo
  ): void {
    // 注入租户 ID
    if (user.tenantId) {
      filters.tenant_id = user.tenantId;
    }
  }

  /**
   * 应用创建者过滤
   */
  private static applyCreatorFilter(
    filters: QueryFilters,
    user: UserInfo,
    scope: DataScope
  ): void {
    switch (scope) {
      case DataScope.SELF:
        // 只能查看自己创建的数据
        filters.created_by = user.id;
        break;

      case DataScope.DEPARTMENT:
        // 可以查看本部门数据
        if (user.departmentId) {
          filters.department_id = user.departmentId;
        }
        break;

      case DataScope.TENANT:
      case DataScope.CROSS_TENANT:
        // 不限制创建者
        break;
    }
  }

  /**
   * 确定数据范围
   */
  private static determineDataScope(
    user: UserInfo,
    resourceType: string
  ): DataScope {
    // 检查是否在白名单中
    if (
      DataPermissionFilter.RESOURCE_CONFIG.crossTenantWhitelist.includes(
        resourceType
      )
    ) {
      return DataScope.CROSS_TENANT;
    }

    // 根据角色判断
    if (user.roles?.includes('manager')) {
      return DataScope.DEPARTMENT;
    }

    // 默认为本人数据
    return DataScope.SELF;
  }

  /**
   * 验证跨租户访问
   */
  static validateCrossTenantAccess(
    user: UserInfo,
    targetTenantId: string
  ): { allowed: boolean; reason?: string } {
    // 超级管理员允许跨租户
    if (user.roles?.includes('admin')) {
      return { allowed: true };
    }

    // 检查是否在同一租户
    if (user.tenantId === targetTenantId) {
      return { allowed: true };
    }

    // 检查是否在白名单资源中
    return {
      allowed: false,
      reason: '跨租户访问被拒绝',
    };
  }

  /**
   * 构建 Supabase 查询条件
   */
  static buildSupabaseQuery<T>(query: any, filters: QueryFilters): any {
    let filteredQuery = query;

    // 应用精确匹配的过滤条件
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        filteredQuery = filteredQuery.eq(key, value);
      }
    });

    return filteredQuery;
  }

  /**
   * 构建 SQL WHERE 条件
   */
  static buildSQLWhere(filters: QueryFilters): {
    where: string;
    params: any[];
  } {
    const conditions: string[] = [];
    const params: any[] = [];

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        conditions.push(`${key} = $${params.length + 1}`);
        params.push(value);
      }
    });

    return {
      where: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
      params,
    };
  }

  /**
   * 重置资源配置（用于测试）
   */
  static resetConfig(config?: Partial<ResourceRestrictionConfig>): void {
    if (config) {
      if (config.creatorRestricted) {
        DataPermissionFilter.RESOURCE_CONFIG.creatorRestricted =
          config.creatorRestricted;
      }
      if (config.tenantIsolated) {
        DataPermissionFilter.RESOURCE_CONFIG.tenantIsolated =
          config.tenantIsolated;
      }
      if (config.crossTenantWhitelist) {
        DataPermissionFilter.RESOURCE_CONFIG.crossTenantWhitelist =
          config.crossTenantWhitelist;
      }
    }
  }
}
