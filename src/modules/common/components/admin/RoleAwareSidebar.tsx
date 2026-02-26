/**
 * 角色感知的侧边栏菜单组件
 * 根据用户角色动态显示菜单项
 */

'use client';

import { usePermission, UserRole } from '@/hooks/use-permission';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  ChevronRight,
  DollarSign,
  Eye,
  FileText,
  Home,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  Store,
  Users,
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
  roles: UserRole[];
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
  const { hasRole, hasAnyRole, userInfo } = usePermission();

  // 菜单配置
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      name: '仪表板',
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
      id: 'system-settings',
      name: '系统设置',
      href: '/admin/settings',
      icon: <Settings className="w-5 h-5" />,
      roles: ['admin', 'manager'],
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
    return menuItems.filter(item => {
      if (item.separator) return true;
      return hasAnyRole(item.roles);
    });
  };

  // 渲染菜单项
  const renderMenuItem = (item: MenuItem, isChild = false) => {
    if (item.separator) {
      return (
        <div key={item.id} className="border-t border-gray-200 my-2"></div>
      );
    }

    const isActive = pathname === item.href;
    const isExpanded = expandedItems[item.id] || false;
    const hasChildren = item.children && item.children.length > 0;

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
              {item.children?.map(child => renderMenuItem(child, true))}
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
        onClick={() => setSidebarOpen(false)}
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
                {userInfo && (
                  <p className="text-xs text-gray-500">{userInfo.email}</p>
                )}
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
              {getAccessibleMenuItems().map(item => renderMenuItem(item))}
            </nav>
          </div>

          {/* 用户信息底部 */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {userInfo?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {userInfo?.email || '未登录'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {userInfo?.roles?.map(role => role).join(', ') || '访客'}
                  </p>
                </div>
              </div>
            </div>
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
