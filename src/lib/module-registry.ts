/**
 * 模块注册系统
 * 统一管理所有功能模块的配置和权? */

export interface ModuleConfig {
  /** 模块唯一标识?*/
  id: string;

  /** 模块显示名称 */
  name: string;

  /** 图标名称（对应Lucide图标?*/
  icon: string;

  /** 访问路径 */
  path: string;

  /** 所需权限列表 */
  permissions: string[];

  /** 模块分类 */
  category: 'business' | 'management' | 'personal' | 'system';

  /** 显示优先级（数字越小优先级越高） */
  priority: number;

  /** 是否启用 */
  enabled: boolean;

  /** 描述信息 */
  description?: string;

  /** 徽章标记 */
  badge?: string;

  /** 父模块ID（用于嵌套结构） */
  parentId?: string;

  /** 子模块列?*/
  children?: ModuleConfig[];

  /** 元数?*/
  metadata?: Record<string, any>;
}

// 业务功能模块
export const BUSINESS_MODULES: ModuleConfig[] = [
  {
    id: 'repair_service',
    name: '维修服务',
    icon: 'Wrench',
    path: '/repair-shop',
    permissions: ['repair.access', 'repair.view'],
    category: 'business',
    priority: 1,
    enabled: true,
    description: '设备维修订单管理和技师服务平台',
    badge: 'hot',
  },
  {
    id: 'parts_market',
    name: '配件商城',
    icon: 'ShoppingCart',
    path: '/parts-market',
    permissions: ['parts.access', 'parts.view'],
    category: 'business',
    priority: 2,
    enabled: true,
    description: '原厂配件和维修配件购买平台',
  },
  {
    id: 'device_management',
    name: '设备管理',
    icon: 'Home',
    path: '/device',
    permissions: ['device.access', 'device.view'],
    category: 'business',
    priority: 3,
    enabled: true,
    description: '个人设备档案和生命周期管理',
  },
  {
    id: 'crowdfunding',
    name: '众筹平台',
    icon: 'Users',
    path: '/crowdfunding',
    permissions: ['crowdfunding.access', 'crowdfunding.view'],
    category: 'business',
    priority: 4,
    enabled: true,
    description: '创新项目众筹和投资平台',
  },
  {
    id: 'fcx_alliance',
    name: 'FCX 联盟',
    icon: 'Star',
    path: '/fcx',
    permissions: ['fcx.access', 'fcx.view'],
    category: 'business',
    priority: 5,
    enabled: true,
    description: '循环经济联盟和权益体系',
  },
  {
    id: 'valuation_service',
    name: '估价服务',
    icon: 'Calculator',
    path: '/valuation',
    permissions: ['valuation.access'],
    category: 'business',
    priority: 6,
    enabled: true,
    description: '设备回收估价和报价服务',
  },
];

// 管理系统模块
export const MANAGEMENT_MODULES: ModuleConfig[] = [
  {
    id: 'system_dashboard',
    name: '系统概览',
    icon: 'BarChart3',
    path: '/admin/dashboard',
    permissions: ['admin.access', 'dashboard.view'],
    category: 'management',
    priority: 1,
    enabled: true,
    description: '系统运行状态和关键指标监控',
  },
  {
    id: 'user_management',
    name: '用户管理',
    icon: 'Users',
    path: '/admin/users',
    permissions: ['users.manage', 'users.view'],
    category: 'management',
    priority: 2,
    enabled: true,
    description: '用户账户、角色和权限管理',
  },
  {
    id: 'content_management',
    name: '内容管理',
    icon: 'FileText',
    path: '/admin/content',
    permissions: ['content.manage'],
    category: 'management',
    priority: 3,
    enabled: true,
    description: '文章、教程和公告内容管理',
  },
  {
    id: 'shop_management',
    name: '店铺管理',
    icon: 'Store',
    path: '/admin/shops',
    permissions: ['shops.manage'],
    category: 'management',
    priority: 4,
    enabled: true,
    description: '维修店铺入驻审核和管理',
  },
  {
    id: 'financial_management',
    name: '财务管理',
    icon: 'DollarSign',
    path: '/admin/finance',
    permissions: ['finance.manage'],
    category: 'management',
    priority: 5,
    enabled: true,
    description: '收入统计、支出管理和财务报表',
  },
  {
    id: 'procurement_center',
    name: '采购中心',
    icon: 'ShoppingBag',
    path: '/admin/procurement',
    permissions: ['procurement.manage'],
    category: 'management',
    priority: 6,
    enabled: true,
    description: '供应链管理和采购流程',
  },
  {
    id: 'warehouse_management',
    name: '仓储管理',
    icon: 'Package',
    path: '/admin/warehouse',
    permissions: ['inventory.manage'],
    category: 'management',
    priority: 7,
    enabled: true,
    description: '库存管理、出入库操作和盘点',
  },
  {
    id: 'agent_workflows',
    name: '智能体工作流',
    icon: 'Bot',
    path: '/admin/agents',
    permissions: ['agents.execute'],
    category: 'management',
    priority: 8,
    enabled: true,
    description: 'AI智能体配置和任务调度',
  },
  {
    id: 'n8n_integration',
    name: 'n8n集成',
    icon: 'Workflow',
    path: '/admin/n8n',
    permissions: ['n8n.workflows'],
    category: 'management',
    priority: 9,
    enabled: true,
    description: '自动化工作流配置和监控',
  },
];

// 个人设置模块
export const PERSONAL_MODULES: ModuleConfig[] = [
  {
    id: 'profile_overview',
    name: '个人资料',
    icon: 'User',
    path: '/profile',
    permissions: [],
    category: 'personal',
    priority: 1,
    enabled: true,
    description: '基本个人信息和账户设置',
  },
  {
    id: 'account_settings',
    name: '账户设置',
    icon: 'Settings',
    path: '/profile/settings',
    permissions: [],
    category: 'personal',
    priority: 2,
    enabled: true,
    description: '密码修改、绑定设置等账户安全配置',
  },
  {
    id: 'security_settings',
    name: '安全设置',
    icon: 'Shield',
    path: '/profile/security',
    permissions: [],
    category: 'personal',
    priority: 3,
    enabled: true,
    description: '双重验证、登录历史等安全选项',
  },
  {
    id: 'notification_settings',
    name: '通知设置',
    icon: 'Bell',
    path: '/profile/notifications',
    permissions: [],
    category: 'personal',
    priority: 4,
    enabled: true,
    description: '消息推送和邮件通知偏好设置',
  },
  {
    id: 'payment_methods',
    name: '支付方式',
    icon: 'CreditCard',
    path: '/profile/payment',
    permissions: [],
    category: 'personal',
    priority: 5,
    enabled: true,
    description: '银行卡、支付宝等支付方式管理',
  },
];

// 系统模块
export const SYSTEM_MODULES: ModuleConfig[] = [
  {
    id: 'system_audit',
    name: '系统审计',
    icon: 'FileSearch',
    path: '/admin/audit',
    permissions: ['audit.view'],
    category: 'system',
    priority: 1,
    enabled: true,
    description: '操作日志和系统审计追踪',
  },
  {
    id: 'system_monitoring',
    name: '系统监控',
    icon: 'Activity',
    path: '/admin/monitoring',
    permissions: ['monitoring.view'],
    category: 'system',
    priority: 2,
    enabled: true,
    description: '服务器状态、性能指标和健康检查',
  },
  {
    id: 'system_settings',
    name: '系统设置',
    icon: 'Settings',
    path: '/admin/system',
    permissions: ['settings.manage'],
    category: 'system',
    priority: 3,
    enabled: true,
    description: '全局配置和系统参数设置',
  },
];

// 完整的模块注册表
export const MODULE_REGISTRY: ModuleConfig[] = [
  ...PERSONAL_MODULES,
  ...BUSINESS_MODULES,
  ...MANAGEMENT_MODULES,
  ...SYSTEM_MODULES,
];

// 模块注册管理
export class ModuleRegistry {
  private static instance: ModuleRegistry;
  private modules: Map<string, ModuleConfig> = new Map();

  private constructor() {
    // 初始化模块注册表
    MODULE_REGISTRY.forEach(module => {
      this.registerModule(module);
    });
  }

  static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry();
    }
    return ModuleRegistry.instance;
  }

  /**
   * 注册模块
   */
  registerModule(module: ModuleConfig): void {
    this.modules.set(module.id, module);
  }

  /**
   * 获取模块配置
   */
  getModule(id: string): ModuleConfig | undefined {
    return this.modules.get(id);
  }

  /**
   * 获取所有模?   */
  getAllModules(): ModuleConfig[] {
    return Array.from(this.modules.values());
  }

  /**
   * 根据分类获取模块
   */
  getModulesByCategory(category: ModuleConfig['category']): ModuleConfig[] {
    return Array.from(this.modules.values()).filter(
      module => module.category === category && module.enabled
    );
  }

  /**
   * 根据权限过滤模块
   */
  getModulesByPermissions(permissions: string[]): ModuleConfig[] {
    return Array.from(this.modules.values()).filter(module => {
      if (module.permissions.length === 0) return true;
      return module.permissions.some(permission =>
        permissions.includes(permission)
      );
    });
  }

  /**
   * 获取模块树结?   */
  getModuleTree(): ModuleConfig[] {
    const modules = this.getAllModules();
    const tree: ModuleConfig[] = [];
    const map = new Map<string, ModuleConfig>();

    // 创建映射
    modules.forEach(module => {
      map.set(module.id, { ...module, children: [] });
    });

    // 构建树结构
    modules.forEach(module => {
      if (module.parentId) {
        const parent = map.get(module.parentId);
        if (parent && parent.children) {
          parent.children.push(map.get(module.id)!);
        }
      } else {
        tree.push(map.get(module.id)!);
      }
    });

    return tree;
  }

  /**
   * 检查模块是否存在
   */
  hasModule(id: string): boolean {
    return this.modules.has(id);
  }

  /**
   * 获取模块路径
   */
  getModulePath(id: string): string | null {
    const module = this.getModule(id);
    return module ? module.path : null;
  }

  /**
   * 获取模块权限
   */
  getModulePermissions(id: string): string[] {
    const module = this.getModule(id);
    return module ? module.permissions : [];
  }
}

// 导出单例实例
export const moduleRegistry = ModuleRegistry.getInstance();

// 便捷函数
export const getModuleById = (id: string) => moduleRegistry.getModule(id);
export const getAllModules = () => moduleRegistry.getAllModules();
export const getModulesByCategory = (category: ModuleConfig['category']) =>
  moduleRegistry.getModulesByCategory(category);
export const getModulesByPermissions = (permissions: string[]) =>
  moduleRegistry.getModulesByPermissions(permissions);
export const getModulePath = (id: string) => moduleRegistry.getModulePath(id);
export const hasModule = (id: string) => moduleRegistry.hasModule(id);
