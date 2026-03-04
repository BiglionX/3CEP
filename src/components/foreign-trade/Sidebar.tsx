'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Globe,
  Home,
  ShoppingCart,
  Building,
  Users,
  FileText,
  BarChart3,
  Settings,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

interface MenuItem {
  id: string;
  title: string;
  href: string;
  icon: any;
  activePaths: string[];
  children?: MenuItem[];
}

interface ForeignTradeSidebarProps {
  activeRole: 'importer' | 'exporter';
  onRoleChange: (role: 'importer' | 'exporter') => void;
}

export function ForeignTradeSidebar({
  activeRole,
  onRoleChange,
}: ForeignTradeSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {}
  );

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      title: '仪表?,
      href: '/foreign-trade/company',
      icon: Home,
      activePaths: ['/foreign-trade/company'],
    },
    {
      id: 'orders',
      title: activeRole === 'importer' ? '采购订单' : '销售订?,
      href: '',
      icon: activeRole === 'importer' ? ShoppingCart : Building,
      activePaths: [],
      children: [
        {
          id: 'order-list',
          title: '订单列表',
          href: '/foreign-trade/company/orders',
          icon: FileText,
          activePaths: ['/foreign-trade/company/orders'],
        },
        {
          id: 'order-create',
          title: activeRole === 'importer' ? '创建采购? : '创建销售单',
          href: '/foreign-trade/company/orders/create',
          icon: FileText,
          activePaths: ['/foreign-trade/company/orders/create'],
        },
        {
          id: 'order-tracking',
          title: '订单跟踪',
          href: '/foreign-trade/company/orders/tracking',
          icon: FileText,
          activePaths: ['/foreign-trade/company/orders/tracking'],
        },
      ],
    },
    {
      id: 'partners',
      title: '合作伙伴',
      href: '',
      icon: Users,
      activePaths: [],
      children: [
        {
          id: 'suppliers',
          title: '供应商管?,
          href: '/foreign-trade/company/partners/suppliers',
          icon: Users,
          activePaths: ['/foreign-trade/company/partners/suppliers'],
        },
        {
          id: 'customers',
          title: '客户管理',
          href: '/foreign-trade/company/partners/customers',
          icon: Users,
          activePaths: ['/foreign-trade/company/partners/customers'],
        },
        {
          id: 'contracts',
          title: '合同管理',
          href: '/foreign-trade/company/partners/contracts',
          icon: FileText,
          activePaths: ['/foreign-trade/company/partners/contracts'],
        },
      ],
    },
    {
      id: 'logistics',
      title: '物流管理',
      href: '',
      icon: Globe,
      activePaths: [],
      children: [
        {
          id: 'shipping',
          title: '发货管理',
          href: '/foreign-trade/company/logistics/shipping',
          icon: Globe,
          activePaths: ['/foreign-trade/company/logistics/shipping'],
        },
        {
          id: 'tracking',
          title: '物流跟踪',
          href: '/foreign-trade/company/logistics/tracking',
          icon: Globe,
          activePaths: ['/foreign-trade/company/logistics/tracking'],
        },
        {
          id: 'customs',
          title: '报关清关',
          href: '/foreign-trade/company/logistics/customs',
          icon: Globe,
          activePaths: ['/foreign-trade/company/logistics/customs'],
        },
      ],
    },
    {
      id: 'analytics',
      title: '业务分析',
      href: '/foreign-trade/company/analytics',
      icon: BarChart3,
      activePaths: ['/foreign-trade/company/analytics'],
    },
    {
      id: 'settings',
      title: '系统设置',
      href: '/foreign-trade/company/settings',
      icon: Settings,
      activePaths: ['/foreign-trade/company/settings'],
    },
  ];

  const isActive = (item: MenuItem) => {
    return item.activePaths.some(path => pathname?.startsWith(path));
  };

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus[item.id];
    const active = isActive(item);

    return (
      <div key={item.id}>
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleMenu(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              style={{ paddingLeft: `${level * 16 + 16}px` }}
            >
              <div className="flex items-center">
                <item.icon className="h-5 w-5 mr-3" />
                {item.title}
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>

            {isExpanded && (
              <div className="bg-gray-50">
                {item?.map(child => renderMenuItem(child, level + 1))}
              </div>
            )}
          </>
        ) : (
          <Link href={item.href}>
            <div
              className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              style={{ paddingLeft: `${level * 16 + 16}px` }}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.title}
            </div>
          </Link>
        )}
      </div>
    );
  };

  return (
    <>
      {/* 移动端菜单按?*/}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white shadow-lg"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* 侧边?*/}
      <div
        className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Logo 和角色切?*/}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Globe className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-lg font-bold text-gray-900">
                  外贸管理
                </span>
              </div>
            </div>

            {/* 角色切换?*/}
            <div className="space-y-2">
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                业务模式
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={activeRole === 'importer' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onRoleChange('importer')}
                  className="text-xs"
                >
                  进口?                </Button>
                <Button
                  variant={activeRole === 'exporter' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onRoleChange('exporter')}
                  className="text-xs"
                >
                  出口?                </Button>
              </div>
            </div>
          </div>

          {/* 菜单 */}
          <nav className="flex-1 overflow-y-auto py-4">
            {menuItems.map(item => renderMenuItem(item))}
          </nav>

          {/* 用户信息 */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-800">U</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">外贸经理</p>
                <p className="text-xs text-gray-500">company@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 遮罩层（移动端） */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
