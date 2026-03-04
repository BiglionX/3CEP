'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  name: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbNavProps {
  className?: string;
  items?: BreadcrumbItem[];
}

export function BreadcrumbNav({ className, items }: BreadcrumbNavProps) {
  const pathname = usePathname();

  // 默认根据路径自动生成面包?  const generateDefaultBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = pathname.split('/').filter(segment => segment);

    if (pathSegments.length === 0) {
      return [{ name: '首页', href: '/admin/dashboard', current: true }];
    }

    const breadcrumbs: BreadcrumbItem[] = [
      { name: '首页', href: '/admin/dashboard' },
    ];

    let currentPath = '/admin';

    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      currentPath += `/${segment}`;

      // 转换路径段为友好的名?      const displayName = getDisplayName(segment);
      const isLast = i === pathSegments.length - 1;

      breadcrumbs.push({
        name: displayName,
        href: isLast ? undefined : currentPath,
        current: isLast,
      });
    }

    return breadcrumbs;
  };

  const getDisplayName = (segment: string): string => {
    const displayNameMap: Record<string, string> = {
      dashboard: '仪表?,
      users: '用户管理',
      content: '内容管理',
      shops: '店铺管理',
      finance: '财务管理',
      settings: '系统设置',
      review: '审核',
      list: '列表',
      categories: '分类',
      payments: '支付记录',
      withdrawals: '提现申请',
      reports: '报表',
      notifications: '通知中心',
    };

    return displayNameMap[segment] || segment;
  };

  const breadcrumbItems = items || generateDefaultBreadcrumbs();

  return (
    <nav className={cn('flex', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground mx-2" />
            )}

            {item.current ? (
              <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                {item.name}
              </span>
            ) : item.href ? (
              <Link
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors truncate max-w-[200px]"
              >
                {index === 0 ? (
                  <Home className="w-4 h-4 inline-block mr-1" />
                ) : null}
                {item.name}
              </Link>
            ) : (
              <span className="text-sm font-medium text-muted-foreground truncate max-w-[200px]">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
