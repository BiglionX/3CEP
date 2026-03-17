'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Wrench,
  LayoutDashboard,
  ClipboardList,
  Calendar,
  Users,
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

export function RepairShopSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(
    {}
  );

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      title: '仪表盘',
      href: '/repair-shop/dashboard',
      icon: LayoutDashboard,
      activePaths: ['/repair-shop/dashboard'],
    },
    {
      id: 'work-orders',
      title: '工单管理',
      href: '',
      icon: ClipboardList,
      activePaths: [],
      children: [
        {
          id: 'work-orders-list',
          title: '工单列表',
          href: '/repair-shop/work-orders',
          icon: ClipboardList,
          activePaths: ['/repair-shop/work-orders'],
        },
        {
          id: 'work-orders-new',
          title: '创建工单',
          href: '/repair-shop/work-orders/new',
          icon: ClipboardList,
          activePaths: ['/repair-shop/work-orders/new'],
        },
        {
          id: 'work-orders-paginated',
          title: '分页工单',
          href: '/repair-shop/work-orders-paginated',
          icon: ClipboardList,
          activePaths: ['/repair-shop/work-orders-paginated'],
        },
      ],
    },
    {
      id: 'appointment',
      title: '预约管理',
      href: '/repair-shop/appointment',
      icon: Calendar,
      activePaths: ['/repair-shop/appointment'],
    },
    {
      id: 'diagnostics',
      title: '故障诊断',
      href: '/repair-shop/diagnostics',
      icon: Wrench,
      activePaths: ['/repair-shop/diagnostics'],
    },
    {
      id: 'settings',
      title: '系统设置',
      href: '/repair-shop/settings',
      icon: Settings,
      activePaths: ['/repair-shop/settings'],
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
                {item.children?.map(child => renderMenuItem(child, level + 1))}
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
      {/* 移动端菜单按钮 */}
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

      {/* 侧边栏 */}
      <div
        className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Logo 和标题 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <Wrench className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-lg font-bold text-gray-900">
                维修店管理
              </span>
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
                <span className="text-sm font-medium text-blue-800">店</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">店长</p>
                <p className="text-xs text-gray-500">shop@fixcycle.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 遮罩层(移动端) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
