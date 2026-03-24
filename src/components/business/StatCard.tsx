/**
 * 统计卡片组件
 */

'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';

export interface StatCardProps {
  /** 图标组件 */
  icon: LucideIcon;
  /** 图标颜色（Tailwind 类名） */
  iconColor?: string;
  /** 卡片标题 */
  title: string;
  /** 数值 */
  value: string | number;
  /** 趋势数据 */
  trend?: {
    value: number;
    isPositive: boolean;
  };
  /** 点击事件 */
  onClick?: () => void;
  /** 额外内容 */
  children?: React.ReactNode;
  /** 是否加载中 */
  loading?: boolean;
}

export function StatCard({
  icon: Icon,
  iconColor = 'text-blue-600',
  title,
  value,
  trend,
  onClick,
  children,
  loading = false,
}: StatCardProps) {
  return (
    <Card
      className={`hover:shadow-lg transition-shadow cursor-pointer ${onClick ? 'hover:bg-gray-50' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg bg-opacity-10 ${iconColor.replace('text-', 'bg-')}`}
          >
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <span className="text-sm font-medium text-gray-600">{title}</span>
        </div>
        {trend && (
          <div
            className={`flex items-center text-xs font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="mr-1 h-3 w-3" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3" />
            )}
            +{trend.value}%
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
            {children && <div className="h-4 bg-gray-200 rounded w-full"></div>}
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {children}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default StatCard;
