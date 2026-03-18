'use client';

import { NavbarAuthControls } from '@/components/auth/AuthControls';
import {
  BookOpen,
  ChevronDown,
  FileText,
  Globe,
  Home,
  Menu,
  MessageSquare,
  Wrench,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

export function UnifiedNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const mainNavItems: NavItem[] = [
    { name: '首页', href: '/', icon: <Home className="w-4 h-4" /> },
    {
      name: '产品服务',
      href: '#',
      icon: <Wrench className="w-4 h-4" />,
      children: [
        { name: '设备维修', href: '/diagnosis' },
        { name: '配件商城', href: '/parts-market' },
        { name: '智能估价', href: '/valuation' },
        { name: '维修网点', href: '/repair-shop' },
        { name: '维修店主', href: '/repair-shop/dashboard' },
        { name: '企业服务', href: '/enterprise' },
        { name: '贸易服务', href: '/foreign-trade/company' },
      ],
    },
    {
      name: '商业合作',
      href: '#',
      icon: <Globe className="w-4 h-4" />,
      children: [
        { name: '入驻申请', href: '/business-register' },
        { name: '企业注册', href: '/enterprise/admin/auth' },
        { name: '维修店入驻', href: '/business-register' },
        { name: '贸易商入驻', href: '/business-register' },
      ],
    },
    {
      name: '文档中心',
      href: '/documents',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      name: '维修教程',
      href: '/tutorials',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      name: '技术支持',
      href: '/diagnosis',
      icon: <MessageSquare className="w-4 h-4" />,
    },
    { name: '网站地图', href: '/sitemap', icon: <Globe className="w-4 h-4" /> },
  ];

  const secondaryNavItems: NavItem[] = [
    { name: '关于我们', href: '/about' },
    { name: '联系我们', href: '/contact' },
    { name: '帮助中心', href: '/help' },
    { name: '常见问题', href: '/faq' },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-20 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">3CEP</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              PROCYC
            </span>
          </Link>

          {/* 桌面导航 - 使用响应式类处理空间不足 */}
          <div className="hidden xl:flex items-center space-x-6">
            {mainNavItems.map(item => (
              <div key={item.name} className="relative group">
                {item.children ? (
                  <>
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors font-medium">
                      {item.icon}
                      <span>{item.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {/* 下拉菜单 */}
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        {item.children.map(child => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center space-x-1 font-medium transition-colors ${
                      isActiveRoute(item.href)
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* 紧凑模式导航 - 屏幕 < 1280px 时只显示图标 */}
          <div className="hidden lg:flex xl:hidden items-center space-x-3">
            {mainNavItems.map(item => (
              <div key={item.name} className="relative group">
                {item.children ? (
                  <>
                    <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors" title={item.name}>
                      {item.icon}
                    </button>
                    {/* 下拉菜单 */}
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-2">
                        {item.children.map(child => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`p-2 font-medium transition-colors ${
                      isActiveRoute(item.href)
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                    title={item.name}
                  >
                    {item.icon}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* 右侧认证控件 */}
          <div className="hidden md:flex items-center">
            <NavbarAuthControls />
          </div>

          {/* 移动端菜单按钮*/}
          <button
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* 移动端菜单*/}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t mt-2">
            <div className="px-4 py-3 space-y-1 max-h-96 overflow-y-auto">
              {mainNavItems.map(item => (
                <div key={item.name}>
                  {item.children ? (
                    <div className="space-y-1">
                      <button className="flex items-center justify-between w-full px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md font-medium">
                        <span className="flex items-center space-x-2">
                          {item.icon}
                          <span>{item.name}</span>
                        </span>
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <div className="ml-6 space-y-1">
                        {item.children.map(child => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md font-medium transition-colors ${
                        isActiveRoute(item.href)
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  )}
                </div>
              ))}

              <div className="pt-3 border-t border-gray-200 mt-3">
                <div className="space-y-2 pb-3">
                  {secondaryNavItems.map(item => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`block px-3 py-2 rounded-md font-medium transition-colors ${
                        isActiveRoute(item.href)
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                <div className="flex flex-col space-y-2 pt-3 border-t border-gray-200">
                  <NavbarAuthControls showLabels={false} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
