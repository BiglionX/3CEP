/**
 * 操作卡片组件
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

export interface ActionCardProps {
  /** 图标组件 */
  icon: LucideIcon;
  /** 图标颜色 */
  iconColor?: string;
  /** 卡片标题 */
  title: string;
  /** 卡片描述 */
  description?: string;
  /** 主要操作 */
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?:
      | 'default'
      | 'destructive'
      | 'outline'
      | 'secondary'
      | 'ghost'
      | 'link';
  };
  /** 次要操作 */
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?:
      | 'default'
      | 'destructive'
      | 'outline'
      | 'secondary'
      | 'ghost'
      | 'link';
  };
  /** 是否加载中 */
  loading?: boolean;
  /** 禁用状态 */
  disabled?: boolean;
}

export function ActionCard({
  icon: Icon,
  iconColor = 'text-blue-600',
  title,
  description,
  primaryAction,
  secondaryAction,
  loading = false,
  disabled = false,
}: ActionCardProps) {
  return (
    <Card
      className={`h-full ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <CardHeader>
        <div
          className={`p-3 rounded-lg bg-opacity-10 ${iconColor.replace('text-', 'bg-')} w-fit mb-3`}
        >
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : null}
      </CardContent>
      {(primaryAction || secondaryAction) && (
        <CardFooter className="flex gap-2">
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant || 'outline'}
              onClick={secondaryAction.onClick}
              className="flex-1"
              disabled={loading}
            >
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button
              variant={primaryAction.variant || 'default'}
              onClick={primaryAction.onClick}
              className="flex-1"
              disabled={loading}
            >
              {primaryAction.label}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

export default ActionCard;
