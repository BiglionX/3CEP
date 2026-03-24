/**
 * 移动端统计卡片组件
 * 响应式设计，支持触控优化
 */

'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';

export interface StatCardMobileProps {
  /** 卡片标题 */
  title: string;
  /** 主要数值 */
  value: string | number;
  /** 变化值 (可选) */
  change?: number;
  /** 变化百分比 (可选) */
  changePercent?: number;
  /** 图标 (可选) */
  icon?: React.ReactNode;
  /** 颜色主题 */
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  /** 点击回调 */
  onClick?: () => void;
  /** 自定义类名 */
  className?: string;
  /** 是否显示加载状态 */
  loading?: boolean;
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    positive: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
    positive: 'text-green-600',
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
    positive: 'text-orange-600',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
    positive: 'text-purple-600',
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200',
    positive: 'text-red-600',
  },
};

/**
 * 移动端统计卡片组件
 *
 * 特性:
 * - 响应式布局
 * - 触控优化 (最小点击区域 44px)
 * - 动画效果
 * - 趋势指示器
 */
export function StatCardMobile({
  title,
  value,
  change,
  changePercent,
  icon,
  color = 'blue',
  onClick,
  className,
  loading = false,
}: StatCardMobileProps) {
  const colors = colorVariants[color];

  const renderChangeIndicator = () => {
    if (change === undefined && changePercent === undefined) return null;

    const isPositive = (change || 0) > 0 || (changePercent || 0) > 0;
    const isNeutral = (change || 0) === 0 && (changePercent || 0) === 0;

    return (
      <div className="flex items-center gap-1">
        {!isNeutral &&
          (isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          ))}
        {isNeutral && <Minus className="w-3 h-3" />}

        {change !== undefined && (
          <span className={cn('text-xs font-medium', colors.positive)}>
            {change > 0 ? '+' : ''}
            {change}
          </span>
        )}

        {changePercent !== undefined && (
          <span className={cn('text-xs font-medium', colors.positive)}>
            ({changePercent > 0 ? '+' : ''}
            {changePercent}%)
          </span>
        )}
      </div>
    );
  };

  return (
    <motion.div
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl p-4 shadow-sm border transition-all',
        colors.border,
        onClick && 'cursor-pointer active:shadow-md hover:shadow-md',
        className
      )}
      style={{ minHeight: onClick ? '44px' : 'auto' }}
    >
      {/* 头部：标题和图标 */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-600 truncate flex-1">
          {title}
        </h3>
        {icon && (
          <div className={cn('p-2 rounded-lg shrink-0', colors.bg)}>
            {React.cloneElement(icon as React.ReactElement, {
              className: cn('w-5 h-5', colors.text),
            })}
          </div>
        )}
      </div>

      {/* 主要数值 */}
      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ) : (
        <>
          <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>

          {/* 变化指示 */}
          {renderChangeIndicator()}
        </>
      )}
    </motion.div>
  );
}

/**
 * 统计卡片网格布局
 * 自动适配不同屏幕尺寸
 */
export interface StatGridMobileProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function StatGridMobile({
  children,
  columns = 2,
  className,
}: StatGridMobileProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {children}
    </div>
  );
}

/**
 * 简化的统计卡片 (紧凑版)
 */
export function StatCardCompact({
  title,
  value,
  icon,
  color = 'blue',
  className,
}: Omit<
  StatCardMobileProps,
  'change' | 'changePercent' | 'onClick' | 'loading'
>) {
  const colors = colorVariants[color];

  return (
    <div
      className={cn(
        'bg-white rounded-lg p-3 shadow-sm border flex items-center gap-3',
        colors.border,
        className
      )}
    >
      {icon && (
        <div className={cn('p-2 rounded-lg shrink-0', colors.bg)}>
          {React.cloneElement(icon as React.ReactElement, {
            className: cn('w-4 h-4', colors.text),
          })}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h4 className="text-xs text-gray-500 truncate">{title}</h4>
        <p className="text-lg font-bold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}

export default StatCardMobile;
