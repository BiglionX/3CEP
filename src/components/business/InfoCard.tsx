/**
 * 信息卡片组件
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

export interface InfoCardProps {
  /** 图标组件 */
  icon?: LucideIcon;
  /** 图标颜色 */
  iconColor?: string;
  /** 卡片标题 */
  title: string;
  /** 卡片描述 */
  description?: string;
  /** 内容区域 */
  children?: React.ReactNode;
  /** 状态标签 */
  status?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  /** 操作按钮 */
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  }>;
  /** 是否加载中 */
  loading?: boolean;
}

export function InfoCard({
  icon: Icon,
  iconColor = 'text-blue-600',
  title,
  description,
  children,
  status,
  actions,
  loading = false,
}: InfoCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-3">
          {Icon && (
            <div
              className={`p-2 rounded-lg bg-opacity-10 ${iconColor.replace('text-', 'bg-')}`}
            >
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
          )}
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
        </div>
        {status && (
          <Badge variant={status.variant || 'default'}>{status.label}</Badge>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        ) : (
          <>
            {children && <div className="mb-4">{children}</div>}
            {actions && actions.length > 0 && (
              <div className="flex gap-2">
                {actions.map((action, idx) => (
                  <Button
                    key={idx}
                    variant={action.variant || 'default'}
                    size="sm"
                    onClick={action.onClick}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default InfoCard;
