'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DictLayoutProps {
  children: React.ReactNode;
}

export default function DictLayout({ children }: DictLayoutProps) {
  const pathname = usePathname();

  const dictMenus = [
    {
      name: '设备管理',
      href: '/admin/dict/devices',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      ),
    },
    {
      name: '故障管理',
      href: '/admin/dict/faults',
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 子菜单导?*/}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {dictMenus.map(menu => {
              const isActive = pathname === menu.href;
              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {menu.icon}
                  <span className="ml-2">{menu.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 页面内容 */}
      {children}
    </div>
  );
}
