'use client';

import { motion } from 'framer-motion';
import {
  Battery,
  Clock,
  Cpu,
  HardDrive,
  Heart,
  Loader2,
  Monitor,
  Smartphone,
  Wifi,
  Wrench,
  Zap,
} from 'lucide-react';
import React from 'react';

// 增强的加载旋转器组件
interface EnhancedLoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'gradient';
  className?: string;
  speed?: 'slow' | 'normal' | 'fast';
  icon?: 'default' | 'gear' | 'pulse' | 'wave';
}

export function EnhancedLoadingSpinner({
  size = 'md',
  variant = 'primary',
  className = '',
  speed = 'normal',
  icon = 'default',
}: EnhancedLoadingSpinnerProps) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const speedClasses = {
    slow: 'animate-spin-slow',
    normal: 'animate-spin',
    fast: 'animate-spin-fast',
  };

  const variantClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    gradient:
      'text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600',
  };

  const renderIcon = () => {
    const baseProps = {
      className: `${sizeClasses[size]} ${variantClasses[variant]} ${speedClasses[speed]} ${className}`,
    };

    switch (icon) {
      case 'gear':
        return <Wrench {...baseProps} />;
      case 'pulse':
        return (
          <HeartBeatSpinner
            size={size}
            variant={variant}
            className={className}
          />
        );
      case 'wave':
        return (
          <WaveSpinner size={size} variant={variant} className={className} />
        );
      default:
        return <Loader2 {...baseProps} />;
    }
  };

  return renderIcon();
}

// 心跳脉冲加载器
function HeartBeatSpinner({
  size = 'md',
  variant = 'primary',
  className = '',
}: Omit<EnhancedLoadingSpinnerProps, 'icon' | 'speed'>) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const variantClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    gradient:
      'text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600',
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
    >
      <Heart className="w-full h-full" />
    </motion.div>
  );
}

// 波浪加载器
function WaveSpinner({
  size = 'md',
  variant = 'primary',
  className = '',
}: Omit<EnhancedLoadingSpinnerProps, 'icon' | 'speed'>) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const variantClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    gradient:
      'text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600',
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full`}
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

// 骨架屏组
interface EnhancedSkeletonProps {
  className?: string;
  variant?:
    | 'text'
    | 'rect'
    | 'circle'
    | 'card'
    | 'list'
    | 'avatar'
    | 'thumbnail';
  width?: string;
  height?: string;
  animated?: boolean;
  count?: number;
}

export function EnhancedSkeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animated = true,
  count = 1,
}: EnhancedSkeletonProps) {
  const baseClasses = animated
    ? 'bg-gray-200 dark:bg-gray-700 rounded animate-pulse'
    : 'bg-gray-200 dark:bg-gray-700 rounded';

  const variantStyles = {
    text: 'h-4 rounded',
    rect: 'rounded',
    circle: 'rounded-full',
    card: 'rounded-lg p-4',
    list: 'rounded h-16',
    avatar: 'rounded-full',
    thumbnail: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  const renderSkeleton = (index: number = 0) => {
    const combinedClasses = `${baseClasses} ${variantStyles[variant]} ${className}`;

    switch (variant) {
      case 'text':
        return (
          <div
            key={index}
            className={combinedClasses}
            style={{
              width: width || '100%',
              height: height || '1rem',
              ...style,
            }}
          />
        );

      case 'avatar':
        return (
          <div
            key={index}
            className={combinedClasses}
            style={{
              width: width || '2.5rem',
              height: height || '2.5rem',
              ...style,
            }}
          />
        );

      case 'thumbnail':
        return (
          <div
            key={index}
            className={combinedClasses}
            style={{
              width: width || '8rem',
              height: height || '6rem',
              ...style,
            }}
          />
        );

      case 'card':
        return (
          <div key={index} className={combinedClasses} style={style}>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        );

      case 'list':
        return (
          <div key={index} className={combinedClasses} style={style}>
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-gray-200 dark:bg-gray-700 w-12 h-12"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div
            key={index}
            className={combinedClasses}
            style={{
              width: width || '100%',
              height: height || '1rem',
              ...style,
            }}
          />
        );
    }
  };

  if (count === 1) {
    return renderSkeleton();
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => renderSkeleton(index))}
    </div>
  );
}

// 页面加载器
interface EnhancedPageLoaderProps {
  message?: string;
  subMessage?: string;
  variant?: 'minimal' | 'standard' | 'full';
  theme?: 'light' | 'dark' | 'auto';
  showProgress?: boolean;
  progress?: number;
}

export function EnhancedPageLoader({
  message = '加载中..',
  subMessage = '请稍等',
  variant = 'standard',
  theme = 'light',
  showProgress = false,
  progress = 0,
}: EnhancedPageLoaderProps) {
  const themeClasses = {
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-white',
    auto: 'bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white',
  };

  const renderMinimal = () => (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <EnhancedLoadingSpinner size="lg" variant="primary" icon="pulse" />
    </div>
  );

  const renderStandard = () => (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${themeClasses[theme]}`}
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <EnhancedLoadingSpinner size="xl" variant="gradient" icon="wave" />
        </motion.div>
        <motion.p
          className="mt-6 text-xl font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
        <motion.p
          className="mt-2 text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {subMessage}
        </motion.p>
      </div>
    </div>
  );

  const renderFull = () => (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${themeClasses[theme]}`}
    >
      <div className="max-w-md w-full text-center px-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.5,
            ease: 'easeOut',
          }}
        >
          <div className="relative">
            <EnhancedLoadingSpinner
              size="xl"
              variant="gradient"
              icon="gear"
              speed="slow"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="mt-8 text-2xl font-bold">{message}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{subMessage}</p>

          {showProgress && (
            <div className="mt-8">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {Math.round(progress)}%
              </p>
            </div>
          )}

          <div className="mt-8 flex justify-center space-x-4">
            {[Wifi, Battery, Cpu, Zap].map((Icon, index) => (
              <motion.div
                key={index}
                className="text-gray-300 dark:text-gray-600"
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  switch (variant) {
    case 'minimal':
      return renderMinimal();
    case 'full':
      return renderFull();
    default:
      return renderStandard();
  }
}

// 内联加载器
interface EnhancedInlineLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  position?: 'left' | 'right';
  variant?: 'spinner' | 'dots' | 'bars';
}

export function EnhancedInlineLoader({
  size = 'sm',
  message = '加载中..',
  position = 'left',
  variant = 'spinner',
}: EnhancedInlineLoaderProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <EnhancedLoadingDots className="text-blue-600" />;
      case 'bars':
        return <EnhancedLoadingBars className="text-blue-600" />;
      default:
        return (
          <EnhancedLoadingSpinner
            size={size === 'sm' ? 'sm' : 'md'}
            variant="primary"
          />
        );
    }
  };

  return (
    <div className={`inline-flex items-center space-x-2 ${sizeClasses[size]}`}>
      {position === 'left' && renderLoader()}
      <span className="text-gray-600">{message}</span>
      {position === 'right' && renderLoader()}
    </div>
  );
}

// 增强的点状加载器
function EnhancedLoadingDots({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-blue-500 rounded-full"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

// 增强的条形加载器
function EnhancedLoadingBars({ className = '' }: { className?: string }) {
  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-1 h-6 bg-blue-500 rounded-full"
          animate={{
            scaleY: [0.3, 1, 0.3],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
}

// 按钮加载器
interface EnhancedButtonLoaderProps {
  loading: boolean;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'overlay' | 'replace' | 'inline';
  message?: string;
}

export function EnhancedButtonLoader({
  loading,
  children,
  size = 'sm',
  variant = 'overlay',
  message = '处理中..',
}: EnhancedButtonLoaderProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  if (!loading) {
    return <>{children}</>;
  }

  switch (variant) {
    case 'overlay':
      return (
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 dark:bg-gray-900 dark:bg-opacity-70 rounded-md z-10">
            <EnhancedLoadingSpinner size={size} variant="primary" />
          </div>
          <div className="opacity-50 pointer-events-none">{children}</div>
        </div>
      );

    case 'replace':
      return (
        <div
          className={`inline-flex items-center space-x-2 ${sizeClasses[size]}`}
        >
          <EnhancedLoadingSpinner size={size} variant="primary" />
          <span>{message}</span>
        </div>
      );

    case 'inline':
    default:
      return (
        <div
          className={`inline-flex items-center space-x-2 ${sizeClasses[size]}`}
        >
          {children}
          <EnhancedLoadingSpinner size={size} variant="primary" />
        </div>
      );
  }
}

// 导出所有组件
export {
  Battery,
  Clock,
  Cpu,
  HardDrive,
  Heart,
  Monitor,
  Smartphone,
  Wifi,
  Zap,
};
