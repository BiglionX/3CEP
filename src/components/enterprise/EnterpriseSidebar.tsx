'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Headphones,
  Bot,
  Coins,
  Globe,
  CreditCard,
  ShoppingCart,
  HelpCircle,
  DollarSign,
  QrCode,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Package,
  Users,
  FileText,
  LayoutDashboard,
  Building,
} from 'lucide-react';

interface MenuItem {
  id: string;
  title: string;
  href: string;
  icon: any;
  activePaths: string[];
  children?: MenuItem[];
}

export function EnterpriseSidebar() {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [isCompact, setIsCompact] = useState(false);

  // 监听侧边栏宽度变化，自动切换紧凑模式
  useEffect(() => {
    const updateWidth = () => {
      if (sidebarRef.current) {
        const width = sidebarRef.current.getBoundingClientRect().width;
        // 当宽度小于 180px 时切换到紧凑模式（只显示图标）
        setIsCompact(width < 180);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    // 使用 MutationObserver 监听 DOM 变化
    const observer = new MutationObserver(updateWidth);
    if (sidebarRef.current) {
      observer.observe(sidebarRef.current, { attributes: true, attributeFilter: ['class'] });
    }
    return () => {
      window.removeEventListener('resize', updateWidth);
      observer.disconnect();
    };
  }, []);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      title: '仪表盘',
      href: '/enterprise/admin/dashboard',
      icon: BarChart3,
      activePaths: ['/enterprise/admin/dashboard'],
    },
    {
      id: 'after-sales',
      title: '售后管理',
      href: '/enterprise/after-sales',
      icon: Headphones,
      activePaths: ['/enterprise/after-sales'],
    },
    {
      id: 'agents',
      title: '智能体管理',
      href: '/enterprise/admin/agents',
      icon: Bot,
      activePaths: ['/enterprise/admin/agents'],
    },
    {
      id: 'tokens',
      title: 'Token管理',
      href: '/enterprise/admin/tokens',
      icon: Coins,
      activePaths: ['/enterprise/admin/tokens'],
    },
    {
      id: 'portal',
      title: '门户管理',
      href: '/enterprise/admin/portal',
      icon: LayoutDashboard,
      activePaths: ['/enterprise/admin/portal'],
    },
    {
      id: 'fxc',
      title: 'FXC管理',
      href: '/enterprise/admin/fxc',
      icon: CreditCard,
      activePaths: ['/enterprise/admin/fxc'],
    },
    {
      id: 'procurement',
      title: '采购管理',
      href: '/enterprise/admin/procurement',
      icon: ShoppingCart,
      activePaths: ['/enterprise/admin/procurement'],
    },
    {
      id: 'reward-qa',
      title: '有奖问答',
      href: '/enterprise/admin/reward-qa',
      icon: HelpCircle,
      activePaths: ['/enterprise/admin/reward-qa'],
    },
    {
      id: 'crowdfunding',
      title: '新品众筹',
      href: '/enterprise/admin/crowdfunding',
      icon: DollarSign,
      activePaths: ['/enterprise/admin/crowdfunding'],
    },
    {
      id: 'traceability',
      title: '二维码溯源',
      href: '/enterprise/admin/traceability',
      icon: QrCode,
      activePaths: ['/enterprise/admin/traceability'],
    },
    {
      id: 'blockchain',
      title: '区块链管理',
      href: '/enterprise/admin/blockchain',
      icon: FileText,
      activePaths: ['/enterprise/admin/blockchain'],
    },
    {
      id: 'documents',
      title: '文档管理',
      href: '/enterprise/admin/documents',
      icon: FileText,
      activePaths: ['/enterprise/admin/documents'],
    },
    {
      id: 'devices',
      title: '设备管理',
      href: '/enterprise/admin/devices',
      icon: Package,
      activePaths: ['/enterprise/admin/devices'],
    },
    {
      id: 'team',
      title: '团队管理',
      href: '/enterprise/admin/team',
      icon: Users,
      activePaths: ['/enterprise/admin/team'],
    },
    {
      id: 'analytics',
      title: '数据分析',
      href: '/enterprise/admin/analytics',
      icon: BarChart3,
      activePaths: ['/enterprise/admin/analytics'],
    },
    {
      id: 'settings',
      title: '系统设置',
      href: '/enterprise/admin/settings',
      icon: Settings,
      activePaths: ['/enterprise/admin/settings'],
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

    // 紧凑模式只显示图标
    const iconClass = isCompact ? '' : 'mr-3';
    const titleDisplay = isCompact ? (
      <span className="sr-only">{item.title}</span>
    ) : (
      item.title
    );

    return (
      <div key={item.id}>
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleMenu(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium transition-colors ${
                active
                  ? 'bg-green-50 text-green-700 border-l-4 border-green-500'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              style={{ paddingLeft: `${level * 16 + 16}px` }}
            >
              <div className="flex items-center">
                <item.icon className={`h-5 w-5 ${iconClass}`} />
                {titleDisplay}
              </div>
              {!isCompact && (
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              )}
            </button>

            {isExpanded && !isCompact && (
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
                  ? 'bg-green-50 text-green-700 border-l-4 border-green-500'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              style={{ paddingLeft: `${level * 16 + 16}px` }}
            >
              <item.icon className={`h-5 w-5 ${iconClass}`} />
              {titleDisplay}
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
        ref={sidebarRef}
        className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              {!isCompact && (
                <span className="ml-2 text-lg font-bold text-gray-900">
                  企业管理中心
                </span>
              )}
            </div>
          </div>

          {/* 菜单 */}
          <nav className="flex-1 overflow-y-auto py-4">
            {menuItems.map(item => renderMenuItem(item))}
          </nav>

          {/* 用户信息 */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-green-800">U</span>
              </div>
              {!isCompact && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">企业管理员</p>
                  <p className="text-xs text-gray-500">admin@enterprise.com</p>
                </div>
              )}
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
