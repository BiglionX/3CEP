/**
 * 统一加载状态组件
 * 提供多种加载指示器样式和骨架屏组件
 */

import { Loader2, RefreshCw, Circle } from 'lucide-react';
import './loading.css';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  className?: string;
}

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle' | 'card';
  width?: string;
  height?: string;
}

interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
  message?: string;
  variant?: 'spinner' | 'dots' | 'bars';
  fullScreen?: boolean;
}

// 加载旋转器组件
export function LoadingSpinner({
  size = 'md',
  variant = 'primary',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const variantClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
  };

  return (
    <Loader2
      className={`${sizeClasses[size]} ${variantClasses[variant]} animate-spin ${className}`}
    />
  );
}

// 脉冲加载点组件
export function LoadingDots({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <Circle className="w-2 h-2 fill-current text-gray-400 animate-pulse" />
      <Circle className="w-2 h-2 fill-current text-gray-400 animate-pulse delay-100" />
      <Circle className="w-2 h-2 fill-current text-gray-400 animate-pulse delay-200" />
    </div>
  );
}

// 条形加载动画
export function LoadingBars({ className = '' }: { className?: string }) {
  return (
    <div className={`flex space-x-1 ${className}`}>
      <div className="w-1 h-4 bg-blue-500 rounded-full animate-loading-bar"></div>
      <div className="w-1 h-4 bg-blue-500 rounded-full animate-loading-bar delay-100"></div>
      <div className="w-1 h-4 bg-blue-500 rounded-full animate-loading-bar delay-200"></div>
    </div>
  );
}

// 骨架屏组件
export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200 rounded animate-pulse';
  const variantClasses = {
    text: 'h-4 rounded',
    rect: 'rounded',
    circle: 'rounded-full',
    card: 'rounded-lg',
  };

  const style = {
    width: width || (variant === 'circle' ? '2rem' : undefined),
    height: height || (variant === 'circle' ? '2rem' : undefined),
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// 文本骨架屏
export function TextSkeleton({
  lines = 3,
  className = '',
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="space-y-2 mb-3">
          <Skeleton className="w-full" width={`${Math.random() * 40 + 60}%`} />
        </div>
      ))}
    </div>
  );
}

// 卡片骨架屏
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
    >
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton variant="circle" width="3rem" height="3rem" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-3/4 h-5" />
          <Skeleton className="w-1/2 h-4" />
        </div>
      </div>
      <Skeleton className="w-full h-20" />
    </div>
  );
}

// 列表骨架屏
export function ListSkeleton({
  items = 5,
  className = '',
}: {
  items?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className="flex items-center space-x-4 p-4 bg-white rounded-lg border"
        >
          <Skeleton variant="circle" width="2.5rem" height="2.5rem" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-3/4 h-4" />
            <Skeleton className="w-1/2 h-3" />
          </div>
          <Skeleton className="w-16 h-8 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// 表格骨架屏
export function TableSkeleton({
  rows = 5,
  columns = 4,
  className = '',
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      {/* 表头 */}
      <div className="border-b border-gray-200 p-4">
        <div className="grid grid-cols-12 gap-4">
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="col-span-3">
              <Skeleton className="w-20 h-4" />
            </div>
          ))}
        </div>
      </div>

      {/* 表格内容 */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="border-b border-gray-100 p-4 last:border-b-0"
        >
          <div className="grid grid-cols-12 gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="col-span-3">
                <Skeleton className="w-full h-4" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// 加载覆盖层组件
export function LoadingOverlay({
  loading,
  children,
  message = '加载中...',
  variant = 'spinner',
  fullScreen = false,
}: LoadingOverlayProps) {
  if (!loading) {
    return <>{children}</>;
  }

  const overlayClasses = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75'
    : 'absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75 rounded-lg';

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <LoadingDots className="text-blue-600" />;
      case 'bars':
        return <LoadingBars className="text-blue-600" />;
      default:
        return <LoadingSpinner size="lg" variant="primary" />;
    }
  };

  return (
    <>
      {children}
      <div className={overlayClasses}>
        <div className="text-center">
          {renderLoader()}
          {message && (
            <p className="mt-3 text-sm text-gray-600 font-medium">{message}</p>
          )}
        </div>
      </div>
    </>
  );
}

// 页面级加载组件
export function PageLoader({
  message = '加载中...',
  variant = 'spinner',
}: {
  message?: string;
  variant?: 'spinner' | 'dots' | 'bars';
}) {
  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <LoadingDots className="text-blue-600 scale-125" />;
      case 'bars':
        return <LoadingBars className="text-blue-600" />;
      default:
        return <LoadingSpinner size="lg" variant="primary" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {renderLoader()}
        <p className="mt-4 text-lg text-gray-600 font-medium">{message}</p>
        <p className="mt-2 text-sm text-gray-500">请稍候...</p>
      </div>
    </div>
  );
}

// 内联加载指示器
export function InlineLoader({
  size = 'sm',
  message = '处理中...',
}: {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}) {
  return (
    <div className="inline-flex items-center space-x-2">
      <LoadingSpinner size={size} variant="primary" />
      <span className="text-sm text-gray-600">{message}</span>
    </div>
  );
}

// 按钮加载状态组件
export function ButtonLoader({
  loading,
  children,
  size = 'sm',
}: {
  loading: boolean;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-md">
          <LoadingSpinner size={size} variant="primary" />
        </div>
      )}
      <div className={loading ? 'opacity-50 pointer-events-none' : ''}>
        {children}
      </div>
    </div>
  );
}
