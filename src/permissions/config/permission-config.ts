/**
 * 统一权限配置中心
 * 集中管理所有权限相关的配置和定? */

export interface PermissionConfig {
  /** 版本信息 */
  version: string;
  /** 最后更新时?*/
  lastUpdated: string;
  /** 角色定义 */
  roles: Record<string, RoleDefinition>;
  /** 权限点定?*/
  permissions: Record<string, PermissionDefinition>;
  /** 角色权限映射 */
  rolePermissions: Record<string, string[]>;
  /** 租户隔离配置 */
  tenantIsolation: TenantIsolationConfig;
  /** 审计设置 */
  auditSettings: AuditSettings;
  /** 缓存配置 */
  cacheSettings: CacheSettings;
}

export interface RoleDefinition {
  /** 角色名称 */
  name: string;
  /** 角色描述 */
  description: string;
  /** 权限级别 (数值越大权限越? */
  level: number;
  /** 是否为系统内置角?*/
  isSystem: boolean;
  /** 默认权限列表 */
  permissions: string[];
  /** 角色继承关系 */
  inherits?: string[];
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
}

export interface PermissionDefinition {
  /** 权限名称 */
  name: string;
  /** 权限描述 */
  description: string;
  /** 权限分类 */
  category: string;
  /** 资源标识 */
  resource: string;
  /** 操作类型 */
  action: string;
  /** 是否为敏感操?*/
  isSensitive?: boolean;
  /** 创建时间 */
  createdAt?: string;
}

export interface TenantIsolationConfig {
  /** 是否启用租户隔离 */
  enabled: boolean;
  /** 隔离模式 */
  mode: 'strict' | 'relaxed' | 'disabled';
  /** 默认租户字段?*/
  defaultTenantField: string;
  /** 需要租户隔离的资源列表 */
  resourcesWithTenant: string[];
  /** 跨租户访问白名单 */
  crossTenantWhitelist?: string[];
}

export interface AuditSettings {
  /** 是否启用审计 */
  enabled: boolean;
  /** 需要审计的敏感操作 */
  sensitiveOperations: string[];
  /** 日志保留天数 */
  logRetentionDays: number;
  /** 审计日志存储路径 */
  logPath: string;
  /** 是否记录详细操作数据 */
  logDetailedData: boolean;
}

export interface CacheSettings {
  /** 是否启用缓存 */
  enabled: boolean;
  /** 缓存过期时间(毫秒) */
  ttl: number;
  /** 最大缓存项?*/
  maxItems: number;
  /** 缓存更新间隔(毫秒) */
  updateInterval: number;
}

/**
 * 默认权限配置
 */
export const DEFAULT_PERMISSION_CONFIG: PermissionConfig = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  roles: {
    admin: {
      name: '超级管理?,
      description: '系统最高权限角色，拥有所有功能访问权?,
      level: 100,
      isSystem: true,
      permissions: ['*'],
    },
    manager: {
      name: '管理?,
      description: '业务管理员，可管理用户、内容和基础配置',
      level: 80,
      isSystem: true,
      permissions: [
        'dashboard_read',
        'users_read',
        'users_create',
        'users_update',
        'content_read',
        'content_create',
        'content_update',
        'content_approve',
        'shops_read',
        'shops_create',
        'shops_update',
        'shops_approve',
        'payments_read',
        'reports_read',
        'reports_export',
        'settings_read',
      ],
    },
    content_manager: {
      name: '内容管理?,
      description: '负责内容审核、发布和管理',
      level: 70,
      isSystem: true,
      permissions: [
        'dashboard_read',
        'content_read',
        'content_create',
        'content_update',
        'content_approve',
        'reports_read',
      ],
    },
    shop_manager: {
      name: '店铺管理?,
      description: '负责维修店铺管理和审?,
      level: 70,
      isSystem: true,
      permissions: [
        'dashboard_read',
        'shops_read',
        'shops_create',
        'shops_update',
        'shops_approve',
        'reports_read',
      ],
    },
    finance_manager: {
      name: '财务管理?,
      description: '负责财务管理、支付审核和报表查看',
      level: 75,
      isSystem: true,
      permissions: [
        'dashboard_read',
        'payments_read',
        'payments_refund',
        'reports_read',
        'reports_export',
      ],
    },
    procurement_specialist: {
      name: '采购专员',
      description: '负责采购流程管理和供应商对接',
      level: 60,
      isSystem: true,
      permissions: [
        'dashboard_read',
        'procurement_read',
        'procurement_create',
        'procurement_approve',
        'reports_read',
      ],
    },
    warehouse_operator: {
      name: '仓库操作?,
      description: '负责库存管理和出入库操作',
      level: 50,
      isSystem: true,
      permissions: [
        'dashboard_read',
        'inventory_read',
        'inventory_update',
        'reports_read',
      ],
    },
    agent_operator: {
      name: '智能体操作员',
      description: '负责智能体工作流执行和监?,
      level: 55,
      isSystem: true,
      permissions: [
        'dashboard_read',
        'agents_execute',
        'agents_monitor',
        'agents_invoke',
        'agents_debug',
        'reports_read',
      ],
    },
    viewer: {
      name: '只读查看?,
      description: '仅能查看基础数据和报?,
      level: 30,
      isSystem: true,
      permissions: ['dashboard_read', 'reports_read'],
    },
    external_partner: {
      name: '外部合作伙伴',
      description: '第三方合作伙伴，有限的数据访问权?,
      level: 20,
      isSystem: false,
      permissions: ['dashboard_read'],
    },
  },
  permissions: {
    // 仪表板权?    dashboard_read: {
      name: '仪表板查?,
      description: '查看系统仪表板和统计数据',
      category: 'dashboard',
      resource: 'dashboard',
      action: 'read',
    },

    // 用户管理权限
    users_read: {
      name: '用户查看',
      description: '查看用户列表和基本信?,
      category: 'user_management',
      resource: 'users',
      action: 'read',
    },
    users_create: {
      name: '用户创建',
      description: '创建新用户账?,
      category: 'user_management',
      resource: 'users',
      action: 'create',
      isSensitive: true,
    },
    users_update: {
      name: '用户编辑',
      description: '编辑用户信息和权?,
      category: 'user_management',
      resource: 'users',
      action: 'update',
      isSensitive: true,
    },
    users_delete: {
      name: '用户删除',
      description: '删除用户账户',
      category: 'user_management',
      resource: 'users',
      action: 'delete',
      isSensitive: true,
    },

    // 内容管理权限
    content_read: {
      name: '内容查看',
      description: '查看内容列表和详?,
      category: 'content_management',
      resource: 'content',
      action: 'read',
    },
    content_create: {
      name: '内容创建',
      description: '创建新的内容条目',
      category: 'content_management',
      resource: 'content',
      action: 'create',
    },
    content_update: {
      name: '内容编辑',
      description: '编辑现有内容',
      category: 'content_management',
      resource: 'content',
      action: 'update',
    },
    content_delete: {
      name: '内容删除',
      description: '删除内容条目',
      category: 'content_management',
      resource: 'content',
      action: 'delete',
      isSensitive: true,
    },
    content_approve: {
      name: '内容审批',
      description: '审批待审核内?,
      category: 'content_management',
      resource: 'content',
      action: 'approve',
      isSensitive: true,
    },

    // 店铺管理权限
    shops_read: {
      name: '店铺查看',
      description: '查看维修店铺信息',
      category: 'shop_management',
      resource: 'shops',
      action: 'read',
    },
    shops_create: {
      name: '店铺创建',
      description: '创建新的维修店铺',
      category: 'shop_management',
      resource: 'shops',
      action: 'create',
    },
    shops_update: {
      name: '店铺编辑',
      description: '编辑店铺信息',
      category: 'shop_management',
      resource: 'shops',
      action: 'update',
    },
    shops_approve: {
      name: '店铺审批',
      description: '审批店铺入驻申请',
      category: 'shop_management',
      resource: 'shops',
      action: 'approve',
      isSensitive: true,
    },

    // 财务权限
    payments_read: {
      name: '支付查看',
      description: '查看支付记录和财务数?,
      category: 'finance',
      resource: 'payments',
      action: 'read',
    },
    payments_refund: {
      name: '支付退?,
      description: '处理退款申?,
      category: 'finance',
      resource: 'payments',
      action: 'refund',
      isSensitive: true,
    },

    // 报表权限
    reports_read: {
      name: '报表查看',
      description: '查看各类业务报表',
      category: 'reports',
      resource: 'reports',
      action: 'read',
    },
    reports_export: {
      name: '报表导出',
      description: '导出报表数据',
      category: 'reports',
      resource: 'reports',
      action: 'export',
      isSensitive: true,
    },

    // 系统设置权限
    settings_read: {
      name: '设置查看',
      description: '查看系统配置',
      category: 'system',
      resource: 'settings',
      action: 'read',
    },
    settings_update: {
      name: '设置修改',
      description: '修改系统配置',
      category: 'system',
      resource: 'settings',
      action: 'update',
      isSensitive: true,
    },

    // 采购权限
    procurement_read: {
      name: '采购查看',
      description: '查看采购订单和流?,
      category: 'procurement',
      resource: 'procurement',
      action: 'read',
    },
    procurement_create: {
      name: '采购创建',
      description: '创建采购订单',
      category: 'procurement',
      resource: 'procurement',
      action: 'create',
    },
    procurement_approve: {
      name: '采购审批',
      description: '审批采购申请',
      category: 'procurement',
      resource: 'procurement',
      action: 'approve',
      isSensitive: true,
    },

    // 库存权限
    inventory_read: {
      name: '库存查看',
      description: '查看库存状态和流水',
      category: 'warehouse',
      resource: 'inventory',
      action: 'read',
    },
    inventory_update: {
      name: '库存调整',
      description: '调整库存数量',
      category: 'warehouse',
      resource: 'inventory',
      action: 'update',
      isSensitive: true,
    },

    // 智能体权?    agents_execute: {
      name: '智能体执?,
      description: '执行智能体工作流',
      category: 'agents',
      resource: 'agents',
      action: 'execute',
    },
    agents_monitor: {
      name: '智能体监?,
      description: '监控智能体运行状?,
      category: 'agents',
      resource: 'agents',
      action: 'monitor',
    },
    agents_invoke: {
      name: '智能体调?,
      description: '直接调用智能体执行特定任?,
      category: 'agents',
      resource: 'agents',
      action: 'invoke',
    },
    agents_debug: {
      name: '智能体调?,
      description: '调试智能体执行过程和参数',
      category: 'agents',
      resource: 'agents',
      action: 'debug',
    },
  },
  rolePermissions: {
    admin: ['*'],
    manager: [
      'dashboard_read',
      'users_read',
      'users_create',
      'users_update',
      'content_read',
      'content_create',
      'content_update',
      'content_approve',
      'shops_read',
      'shops_create',
      'shops_update',
      'shops_approve',
      'payments_read',
      'reports_read',
      'reports_export',
      'settings_read',
    ],
    content_manager: [
      'dashboard_read',
      'content_read',
      'content_create',
      'content_update',
      'content_approve',
      'reports_read',
    ],
    shop_manager: [
      'dashboard_read',
      'shops_read',
      'shops_create',
      'shops_update',
      'shops_approve',
      'reports_read',
    ],
    finance_manager: [
      'dashboard_read',
      'payments_read',
      'payments_refund',
      'reports_read',
      'reports_export',
    ],
    procurement_specialist: [
      'dashboard_read',
      'procurement_read',
      'procurement_create',
      'procurement_approve',
      'reports_read',
    ],
    warehouse_operator: [
      'dashboard_read',
      'inventory_read',
      'inventory_update',
      'reports_read',
    ],
    agent_operator: [
      'dashboard_read',
      'agents_execute',
      'agents_monitor',
      'agents_invoke',
      'agents_debug',
      'reports_read',
    ],
    viewer: ['dashboard_read', 'reports_read'],
    external_partner: ['dashboard_read'],
  },
  tenantIsolation: {
    enabled: true,
    mode: 'strict',
    defaultTenantField: 'tenant_id',
    resourcesWithTenant: [
      'users',
      'content',
      'shops',
      'payments',
      'procurement',
      'inventory',
    ],
  },
  auditSettings: {
    enabled: true,
    sensitiveOperations: [
      'users_create',
      'users_update',
      'users_delete',
      'content_delete',
      'shops_approve',
      'payments_refund',
      'settings_update',
    ],
    logRetentionDays: 90,
    logPath: 'logs/audit',
    logDetailedData: true,
  },
  cacheSettings: {
    enabled: true,
    ttl: 300000, // 5分钟
    maxItems: 1000,
    updateInterval: 30000, // 30�?  },
};

/**
 * 权限配置管理? */
export class PermissionConfigManager {
  private static instance: PermissionConfigManager;
  private config: PermissionConfig = DEFAULT_PERMISSION_CONFIG;
  private subscribers: Array<(config: PermissionConfig) => void> = [];

  private constructor() {}

  static getInstance(): PermissionConfigManager {
    if (!PermissionConfigManager.instance) {
      PermissionConfigManager.instance = new PermissionConfigManager();
    }
    return PermissionConfigManager.instance;
  }

  /**
   * 获取当前权限配置
   */
  getConfig(): PermissionConfig {
    return { ...this.config };
  }

  /**
   * 更新权限配置
   */
  updateConfig(newConfig: Partial<PermissionConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
      lastUpdated: new Date().toISOString(),
    };

    // 通知所有订阅?    this.notifySubscribers();
  }

  /**
   * 重置为默认配?   */
  resetToDefault(): void {
    this.config = { ...DEFAULT_PERMISSION_CONFIG };
    this.config.lastUpdated = new Date().toISOString();
    this.notifySubscribers();
  }

  /**
   * 订阅配置变更
   */
  subscribe(callback: (config: PermissionConfig) => void): () => void {
    this.subscribers.push(callback);

    // 立即发送当前配?    callback(this.getConfig());

    // 返回取消订阅函数
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  /**
   * 通知所有订阅者配置变?   */
  private notifySubscribers(): void {
    const currentConfig = this.getConfig();
    this.subscribers.forEach(callback => {
      try {
        callback(currentConfig);
      } catch (error) {
        console.error('Permission config subscriber error:', error);
      }
    });
  }

  /**
   * 验证配置有效?   */
  validateConfig(config: PermissionConfig): ValidationResult {
    const errors: string[] = [];

    // 验证角色定义
    Object.entries(config.roles).forEach(([roleId, role]) => {
      if (!role.name) errors.push(`角色 ${roleId} 缺少名称`);
      if (typeof role.level !== 'number')
        errors.push(`角色 ${roleId} 权限级别必须是数字`);

      // 验证权限引用
      role.permissions.forEach(perm => {
        if (perm !== '*' && !config.permissions[perm]) {
          errors.push(`角色 ${roleId} 引用了不存在的权? ${perm}`);
        }
      });
    });

    // 验证权限映射
    Object.entries(config.rolePermissions).forEach(([roleId, permissions]) => {
      if (!config.roles[roleId]) {
        errors.push(`权限映射中引用了不存在的角色: ${roleId}`);
      }

      permissions.forEach(perm => {
        if (perm !== '*' && !config.permissions[perm]) {
          errors.push(`角色 ${roleId} 的权限映射引用了不存在的权限: ${perm}`);
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
