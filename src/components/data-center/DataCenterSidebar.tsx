'use client';

import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Database,
  FileText,
  Menu,
  Monitor,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface MenuItem {
  id: string;
  title: string;
  href: string;
  icon: any;
  activePaths: string[];
}

interface DataCenterSidebarProps {
  hasPermission?: (permission: string) => boolean;
}

export function DataCenterSidebar({ hasPermission }: DataCenterSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      title: '数据中心仪表盘',
      href: '/data-center',
      icon: BarChart3,
      activePaths: ['/data-center'],
    },
    {
      id: 'metadata',
      title: '元数据管理',
      href: '/data-center/metadata',
      icon: FileText,
      activePaths: ['/data-center/metadata'],
    },
    {
      id: 'sources',
      title: '数据源管理',
      href: '/data-center/sources',
      icon: Database,
      activePaths: ['/data-center/sources'],
    },
    {
      id: 'data-sources',
      title: '外部数据源',
      href: '/data-center/data-sources',
      icon: Database,
      activePaths: ['/data-center/data-sources'],
    },
    {
      id: 'external-data-sync',
      title: '数据同步监控',
      href: '/data-center/external-data-sync',
      icon: RefreshCw,
      activePaths: ['/data-center/external-data-sync'],
    },
    {
      id: 'data-audit',
      title: '数据审核中心',
      href: '/data-center/data-audit',
      icon: ShieldCheck,
      activePaths: ['/data-center/data-audit'],
    },
    {
      id: 'query',
      title: '数据查询',
      href: '/data-center/query',
      icon: Search,
      activePaths: ['/data-center/query'],
    },
    {
      id: 'designer',
      title: '数据建模',
      href: '/data-center/designer',
      icon: Plus,
      activePaths: ['/data-center/designer'],
    },
    {
      id: 'monitoring',
      title: '系统监控',
      href: '/data-center/monitoring',
      icon: Monitor,
      activePaths: ['/data-center/monitoring'],
    },
    {
      id: 'security',
      title: '安全审计',
      href: '/data-center/security',
      icon: Shield,
      activePaths: ['/data-center/security'],
    },
    {
      id: 'settings',
      title: '系统设置',
      href: '/data-center/settings',
      icon: Settings,
      activePaths: ['/data-center/settings'],
    },
  ];

  const isActive = (item: MenuItem) => {
    return item.activePaths.some(path => pathname?.startsWith(path));
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
              <Database className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-lg font-bold text-gray-900">
                数据中心
              </span>
            </div>
          </div>

          {/* 菜单 */}
          <nav className="flex-1 overflow-y-auto py-4">
            {menuItems.map(item => (
              <Link key={item.id} href={item.href}>
                <div
                  className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(item)
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.title}
                </div>
              </Link>
            ))}
          </nav>

          {/* 用户信息 */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-800">D</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">数据管理员</p>
                <p className="text-xs text-gray-500">data@fixcycle.com</p>
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
