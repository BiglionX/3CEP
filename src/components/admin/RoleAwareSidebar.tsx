/**
 * 角色感知的侧边栏菜单组件
 * 根据用户角色动态显示菜单项
 */

'use client';

import { useUnifiedAuth } from '@/hooks/use-unified-auth';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  Clock,
  Coins,
  DollarSign,
  Eye,
  FileText,
  Folder,
  Globe,
  Home,
  Key,
  LayoutDashboard,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  Store,
  TrendingUp,
  Users,
  Variable,
  Webhook,
  Workflow,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

// 菜单项接口
interface MenuItem {
  id: string;
  name: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
  children?: MenuItem[];
  badge?: string;
  separator?: boolean;
}

export function RoleAwareSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );
  const pathname = usePathname();
  const { user: authUser } = useUnifiedAuth();

  // 菜单配置
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      name: '仪表盘',
      href: '/admin/dashboard',
      icon: <Home className="w-5 h-5" />,
      roles: [
        'admin',
        'manager',
        'content_manager',
        'shop_manager',
        'finance_manager',
        'procurement_specialist',
        'warehouse_operator',
        'agent_operator',
        'viewer',
        'external_partner',
      ],
    },
    {
      id: 'data-center',
      name: '数据中心',
      href: '/data-center',
      icon: <BarChart3 className="w-5 h-5" />,
      roles: ['admin', 'manager', 'analyst', 'finance_manager'],
      external: true, // 标记为外部独立系统
    },
    {
      id: 'separator-1',
      name: '',
      href: '',
      icon: null,
      roles: [
        'admin',
        'manager',
        'content_manager',
        'shop_manager',
        'finance_manager',
        'procurement_specialist',
        'warehouse_operator',
        'agent_operator',
      ],
      separator: true,
    },
    {
      id: 'user-management',
      name: '用户管理',
      href: '/admin/users',
      icon: <Users className="w-5 h-5" />,
      roles: ['admin', 'manager'],
      badge: '3',
    },
    {
      id: 'content',
      name: '内容管理',
      icon: <FileText className="w-5 h-5" />,
      href: '',
      roles: ['admin', 'manager', 'content_manager'],
      children: [
        {
          id: 'content-review',
          name: '内容审核',
          href: '/admin/content/review',
          icon: <Shield className="w-4 h-4" />,
          roles: ['admin', 'manager', 'content_manager'],
        },
        {
          id: 'content-list',
          name: '内容列表',
          href: '/admin/content/list',
          icon: <FileText className="w-4 h-4" />,
          roles: ['admin', 'manager', 'content_manager'],
        },
        {
          id: 'content-create',
          name: '创建内容',
          href: '/admin/content/create',
          icon: <Plus className="w-4 h-4" />,
          roles: ['admin', 'manager', 'content_manager'],
        },
      ],
    },
    {
      id: 'shop',
      name: '店铺管理',
      icon: <Store className="w-5 h-5" />,
      href: '',
      roles: ['admin', 'manager', 'shop_manager'],
      children: [
        {
          id: 'shop-pending',
          name: '待审核店铺',
          href: '/admin/shops/pending',
          icon: <Shield className="w-4 h-4" />,
          roles: ['admin', 'manager', 'shop_manager'],
          badge: '5',
        },
        {
          id: 'shop-list',
          name: '已审核店铺',
          href: '/admin/shops/list',
          icon: <Store className="w-4 h-4" />,
          roles: ['admin', 'manager', 'shop_manager'],
        },
        {
          id: 'shop-search',
          name: '店铺搜索',
          href: '/admin/shops/search',
          icon: <Search className="w-4 h-4" />,
          roles: ['admin', 'manager', 'shop_manager'],
        },
      ],
    },
    {
      id: 'finance',
      name: '财务管理',
      icon: <DollarSign className="w-5 h-5" />,
      href: '',
      roles: ['admin', 'manager', 'finance_manager'],
      children: [
        {
          id: 'payments',
          name: '支付记录',
          href: '/admin/finance/payments',
          icon: <DollarSign className="w-4 h-4" />,
          roles: ['admin', 'manager', 'finance_manager'],
        },
        {
          id: 'refunds',
          name: '退款处理',
          href: '/admin/finance/refunds',
          icon: <Eye className="w-4 h-4" />,
          roles: ['admin', 'manager', 'finance_manager'],
        },
        {
          id: 'reports',
          name: '财务报表',
          href: '/admin/finance/reports',
          icon: <BarChart3 className="w-4 h-4" />,
          roles: ['admin', 'manager', 'finance_manager'],
        },
      ],
    },
    {
      id: 'procurement',
      name: '采购管理',
      icon: <ShoppingCart className="w-5 h-5" />,
      href: '',
      roles: ['admin', 'manager', 'procurement_specialist'],
      children: [
        {
          id: 'procurement-orders',
          name: '采购订单',
          href: '/admin/procurement/orders',
          icon: <ShoppingCart className="w-4 h-4" />,
          roles: ['admin', 'manager', 'procurement_specialist'],
        },
        {
          id: 'order-delivery',
          name: '订单交付',
          href: '/admin/order-delivery',
          icon: <ShoppingCart className="w-4 h-4" />,
          roles: ['admin', 'manager', 'procurement_specialist'],
        },
        {
          id: 'procurement-suppliers',
          name: '供应商管理',
          href: '/admin/procurement/suppliers',
          icon: <Package className="w-4 h-4" />,
          roles: ['admin', 'manager', 'procurement_specialist'],
        },
      ],
    },
    {
      id: 'warehouse',
      name: '库存管理',
      icon: <Package className="w-5 h-5" />,
      href: '',
      roles: ['admin', 'manager', 'warehouse_operator'],
      children: [
        {
          id: 'inventory',
          name: '库存查询',
          href: '/admin/warehouse/inventory',
          icon: <Package className="w-4 h-4" />,
          roles: ['admin', 'manager', 'warehouse_operator'],
        },
        {
          id: 'stock-adjustment',
          name: '库存调整',
          href: '/admin/warehouse/adjustment',
          icon: <Wrench className="w-4 h-4" />,
          roles: ['admin', 'manager', 'warehouse_operator'],
        },
      ],
    },
    {
      id: 'agents',
      name: '智能体管理',
      icon: <Zap className="w-5 h-5" />,
      href: '',
      roles: ['admin', 'manager', 'agent_operator'],
      children: [
        // 快速入口
        {
          id: 'agent-create',
          name: '创建智能体',
          href: '/admin/agents/create',
          icon: <Plus className="w-4 h-4" />,
          roles: ['admin', 'manager', 'agent_operator'],
        },
        {
          id: 'agent-dashboard',
          name: '智能体概览',
          href: '/admin/agents',
          icon: <LayoutDashboard className="w-4 h-4" />,
          roles: ['admin', 'manager', 'agent_operator'],
        },
        // 开发与配置
        {
          id: 'agent-templates',
          name: '智能体模板',
          href: '/admin/agent-templates',
          icon: <FileText className="w-4 h-4" />,
          roles: ['admin', 'manager', 'agent_operator'],
        },
        {
          id: 'agents-audit',
          name: '智能体审核',
          href: '/admin/agents-audit',
          icon: <Shield className="w-4 h-4" />,
          roles: ['admin', 'manager', 'agent_operator'],
        },
        {
          id: 'agent-execution',
          name: '执行工作流',
          href: '/admin/agents/execute',
          icon: <Zap className="w-4 h-4" />,
          roles: ['admin', 'manager', 'agent_operator'],
        },
        {
          id: 'agent-monitoring',
          name: '监控面板',
          href: '/admin/agents/monitor',
          icon: <Eye className="w-4 h-4" />,
          roles: ['admin', 'manager', 'agent_operator'],
        },
        {
          id: 'workflows',
          name: '工作流管理',
          href: '/admin/agents/workflows',
          icon: <Workflow className="w-4 h-4" />,
          roles: ['admin', 'manager'],
        },
        {
          id: 'executions',
          name: '执行历史',
          href: '/admin/agents/executions',
          icon: <BarChart3 className="w-4 h-4" />,
          roles: ['admin', 'manager', 'agent_operator'],
        },
        // n8n 集成管理页面（新增）
        {
          id: 'credentials',
          name: '凭证管理',
          href: '/admin/agents/credentials',
          icon: <Key className="w-4 h-4" />,
          roles: ['admin', 'manager'],
        },
        {
          id: 'templates',
          name: '模板库',
          href: '/admin/agents/templates',
          icon: <BookOpen className="w-4 h-4" />,
          roles: ['admin', 'manager', 'agent_operator'],
        },
        {
          id: 'schedules',
          name: '调度管理',
          href: '/admin/agents/schedules',
          icon: <Clock className="w-4 h-4" />,
          roles: ['admin', 'manager', 'agent_operator'],
        },
        {
          id: 'webhooks',
          name: 'Webhook 管理',
          href: '/admin/agents/webhooks',
          icon: <Webhook className="w-4 h-4" />,
          roles: ['admin', 'manager'],
        },
        {
          id: 'environment',
          name: '环境变量',
          href: '/admin/agents/environment',
          icon: <Variable className="w-4 h-4" />,
          roles: ['admin', 'manager'],
        },
        {
          id: 'team',
          name: '团队协作',
          href: '/admin/agents/team',
          icon: <Users className="w-4 h-4" />,
          roles: ['admin', 'manager'],
        },
        {
          id: 'analytics',
          name: '高级分析',
          href: '/admin/agents/analytics',
          icon: <BarChart3 className="w-4 h-4" />,
          roles: ['admin', 'manager', 'analyst'],
        },
      ],
    },
    {
      id: 'skills-management',
      name: 'Skills 管理',
      icon: <Package className="w-5 h-5" />,
      href: '',
      roles: ['admin', 'manager', 'marketplace_admin', 'agent_operator'],
      children: [
        {
          id: 'skill-create',
          name: '创建 Skill',
          href: '/admin/skill-store/create',
          icon: <Plus className="w-4 h-4" />,
          roles: ['admin', 'manager', 'marketplace_admin'],
        },
        {
          id: 'skill-audit',
          name: 'Skill 审核',
          href: '/admin/skill-audit',
          icon: <Shield className="w-4 h-4" />,
          roles: ['admin', 'manager', 'marketplace_admin'],
        },
        {
          id: 'skill-categories',
          name: '分类管理',
          href: '/admin/skill-categories',
          icon: <Folder className="w-4 h-4" />,
          roles: ['admin', 'manager', 'marketplace_admin'],
        },
        {
          id: 'skill-tags',
          name: '标签管理',
          href: '/admin/skill-tags',
          icon: <Variable className="w-4 h-4" />,
          roles: ['admin', 'manager', 'marketplace_admin'],
        },
        {
          id: 'skill-shelf',
          name: '上下架管理',
          href: '/admin/skill-store/shelf-management',
          icon: <ShoppingCart className="w-4 h-4" />,
          roles: ['admin', 'manager', 'marketplace_admin'],
        },
        {
          id: 'skill-reviews',
          name: '评论管理',
          href: '/admin/skill-reviews',
          icon: <FileText className="w-4 h-4" />,
          roles: ['admin', 'manager', 'marketplace_admin'],
        },
        {
          id: 'skill-documents',
          name: '文档管理',
          href: '/admin/skill-documents',
          icon: <BookOpen className="w-4 h-4" />,
          roles: ['admin', 'manager', 'marketplace_admin'],
        },
        {
          id: 'skill-analytics',
          name: '数据分析',
          href: '/admin/skill-analytics',
          icon: <BarChart3 className="w-4 h-4" />,
          roles: ['admin', 'manager', 'marketplace_admin', 'analyst'],
        },
        {
          id: 'skill-recommendations',
          name: '推荐系统',
          href: '/admin/skill-recommendations',
          icon: <Search className="w-4 h-4" />,
          roles: ['admin', 'manager', 'marketplace_admin'],
        },
        {
          id: 'skill-sandboxes',
          name: '测试沙箱',
          href: '/admin/skill-sandboxes',
          icon: <Globe className="w-4 h-4" />,
          roles: ['admin', 'manager', 'marketplace_admin'],
        },
      ],
    },
    {
      id: 'separator-2',
      name: '',
      href: '',
      icon: null,
      roles: ['admin', 'manager'],
      separator: true,
    },
    {
      id: 'store-management',
      name: '商店管理',
      icon: <Store className="w-5 h-5" />,
      href: '',
      roles: ['admin', 'manager', 'marketplace_admin'],
      children: [
        {
          id: 'agent-store-manage',
          name: '智能体商店',
          href: '/admin/agent-store',
          icon: <Zap className="w-4 h-4" />,
          roles: ['admin', 'manager', 'marketplace_admin'],
        },
        {
          id: 'skill-store-manage',
          name: 'Skill 商店',
          href: '/admin/skill-store',
          icon: <Package className="w-4 h-4" />,
          roles: ['admin', 'manager', 'marketplace_admin'],
        },
        {
          id: 'marketplace-operate',
          name: '市场运营',
          href: '/admin/marketplace',
          icon: <TrendingUp className="w-4 h-4" />,
          roles: ['admin', 'manager', 'marketplace_admin'],
        },
        {
          id: 'developer-manage',
          name: '开发者管理',
          href: '/admin/developers',
          icon: <Users className="w-4 h-4" />,
          roles: ['admin', 'manager', 'marketplace_admin'],
        },
      ],
    },
    {
      id: 'unified-management',
      name: '统一管理',
      icon: <Settings className="w-5 h-5" />,
      href: '',
      roles: ['admin'],
      children: [
        {
          id: 'agents-management',
          name: '智能体统一管理',
          href: '/admin/agents-management',
          icon: <Zap className="w-4 h-4" />,
          roles: ['admin'],
        },
        {
          id: 'tokens-management',
          name: 'Token 统一管理',
          href: '/admin/tokens-management',
          icon: <Coins className="w-4 h-4" />,
          roles: ['admin'],
        },
        {
          id: 'fxc-management',
          name: 'FXC 统一管理',
          href: '/admin/fxc-management',
          icon: <DollarSign className="w-4 h-4" />,
          roles: ['admin'],
        },
        {
          id: 'portals-management',
          name: '门户统一管理',
          href: '/admin/portals-management',
          icon: <Globe className="w-4 h-4" />,
          roles: ['admin'],
        },
      ],
    },
    {
      id: 'separator-3',
      name: '',
      href: '',
      icon: null,
      roles: ['admin', 'manager'],
      separator: true,
    },
    {
      id: 'system-monitoring',
      name: '系统监控',
      icon: <BarChart3 className="w-5 h-5" />,
      href: '',
      roles: ['admin', 'manager'],
      children: [
        {
          id: 'alerts',
          name: '告警管理',
          href: '/admin/alerts',
          icon: <Shield className="w-4 h-4" />,
          roles: ['admin', 'manager'],
        },
        {
          id: 'monitoring-dashboard',
          name: '监控仪表板',
          href: '/admin/monitoring',
          icon: <BarChart3 className="w-4 h-4" />,
          roles: ['admin', 'manager'],
        },
      ],
    },
    {
      id: 'analytics',
      name: '数据分析',
      href: '/admin/analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      roles: ['admin', 'manager', 'analyst'],
    },
    {
      id: 'separator-settings',
      name: '',
      href: '',
      icon: null,
      roles: ['admin', 'manager'],
      separator: true,
    },
    {
      id: 'system-settings',
      name: '系统设置',
      href: '/admin/settings',
      icon: <Settings className="w-5 h-5" />,
      roles: ['admin', 'manager'],
      children: [
        {
          id: 'config-history',
          name: '配置历史',
          href: '/admin/config-history',
          icon: <FileText className="w-4 h-4" />,
          roles: ['admin', 'manager'],
        },
      ],
    },
  ];

  // 切换子菜单展开状态
  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // 获取当前用户可访问的菜单项
  const getAccessibleMenuItems = () => {
    const userRoles = (authUser as any)?.user_metadata?.roles || ['user'];

    // 开发环境：添加调试日志
    if (process.env.NODE_ENV === 'development') {
      console.log('[Sidebar] 当前用户角色:', userRoles);
      console.log('[Sidebar] 完整用户对象:', authUser);
    }

    return menuItems.filter(item => {
      if (item.separator) return true;

      // 检查用户角色是否在菜单项的允许角色列表中
      const parentHasAccess = item.roles.some(role => userRoles.includes(role));

      // 如果有子菜单，需要同时检查子菜单的可见性
      if (item.children && item.children.length > 0) {
        // 父菜单有访问权，且至少有一个子菜单也有访问权
        const visibleChildren = item.children.filter(child => {
          const hasAccess = child.roles.some(role => userRoles.includes(role));
          // Development: Output child menu permission check
          if (process.env.NODE_ENV === 'development') {
            console.log(
              `[Sidebar] Child menu "${child.name}" permission check:`,
              {
                userRoles,
                allowedRoles: child.roles,
                hasAccess,
              }
            );
          }
          return hasAccess;
        });

        if (
          process.env.NODE_ENV === 'development' &&
          visibleChildren.length === 0
        ) {
          console.warn(
            `[Sidebar] ⚠️ Warning: All children of "${item.name}" filtered by permissions!`
          );
          console.log(
            `[Sidebar] Children details:`,
            item.children.map(c => ({
              name: c.name,
              allowedRoles: c.roles,
            }))
          );
        }

        return parentHasAccess && visibleChildren.length > 0;
      }

      return parentHasAccess;
    });
  };

  // 渲染菜单项
  const renderMenuItem = (
    item: MenuItem,
    isChild = false,
    parentUserRoles?: string[]
  ) => {
    if (item.separator) {
      return (
        <div key={item.id} className="border-t border-gray-200 my-2"></div>
      );
    }

    const isActive = pathname === item.href;
    const isExpanded = expandedItems[item.id] || false;
    const hasChildren = item.children && item.children.length > 0;
    const userRoles = parentUserRoles ||
      (authUser as any)?.user_metadata?.roles || ['user'];

    if (hasChildren) {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleExpand(item.id)}
            className={cn(
              'w-full flex items-center px-4 py-3 text-sm font-medium transition-colors',
              isChild
                ? 'pl-8 text-gray-600 hover:bg-gray-100'
                : 'text-gray-700 hover:bg-gray-100',
              isExpanded && 'bg-gray-100'
            )}
          >
            {item.icon && <span className="mr-3">{item.icon}</span>}
            <span className="flex-1 text-left">{item.name}</span>
            {item.badge && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {item.badge}
              </span>
            )}
            <ChevronRight
              className={cn(
                'w-4 h-4 transition-transform',
                isExpanded && 'rotate-90'
              )}
            />
          </button>

          {isExpanded && (
            <div className="ml-4">
              {item.children
                ?.filter(child => {
                  // 再次检查子菜单权限（双重保险）
                  return child.roles.some(role => userRoles.includes(role));
                })
                .map((child: MenuItem) =>
                  renderMenuItem(child, true, userRoles)
                )}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.href}
        className={cn(
          'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
          isChild
            ? 'pl-8 text-gray-600 hover:bg-gray-100'
            : 'text-gray-700 hover:bg-gray-100',
          isActive && 'bg-blue-50 text-blue-600 border-r-2 border-blue-500'
        )}
        onClick={() => {
          setSidebarOpen(false);
          // 如果是跳转到数据中心，确保携带认证信息
          if (item.external) {
            // 使用 window.location 确保完整页面加载和 cookie 同步
            // window.location.href = item.href;
            // 或者使用 Next.js router.push 但需要等待一下
            setTimeout(() => {
              window.location.href = item.href;
            }, 100);
          }
        }}
      >
        {item.icon && <span className="mr-3">{item.icon}</span>}
        <span className="flex-1">{item.name}</span>
        {item.badge && (
          <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* 头部 */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <div className="bg-blue-600 rounded-lg p-2">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-bold text-gray-900">管理系统</h1>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 菜单区域 */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1">
              {getAccessibleMenuItems().map(item =>
                renderMenuItem(item, false, undefined)
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* 移动端触发按钮 */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-30 p-2 bg-white rounded-lg shadow-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
