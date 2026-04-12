/**
 * 移动端响应式布局组件
 * 提供针对不同屏幕尺寸的优化布局和交? */

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

// 设备类型枚举
export type DeviceType =
  | 'mobile-s'
  | 'mobile-m'
  | 'mobile-l'
  | 'tablet'
  | 'laptop'
  | 'desktop'
  | 'wide';

// 屏幕尺寸信息
export interface ScreenInfo {
  width: number;
  height: number;
  deviceType: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

// 响应式容器组
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'mobile' | 'tablet' | 'desktop' | 'full';
}

export function ResponsiveContainer({
  children,
  className = '',
  maxWidth = 'full',
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    mobile: 'max-w-[425px]',
    tablet: 'max-w-[768px]',
    desktop: 'max-w-[1200px]',
    full: 'max-w-full',
  };

  return (
    <div className={`${maxWidthClasses[maxWidth]} mx-auto w-full ${className}`}>
      {children}
    </div>
  );
}

// 移动端底部导航栏
interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
  }>;
}

export function MobileBottomNav({
  activeTab,
  onTabChange,
  tabs,
}: MobileBottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
      <div className="grid grid-cols-4 gap-1 p-2 safe-bottom">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="w-6 h-6 mb-1">{tab.icon}</div>
            <span className="text-xs font-medium truncate">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// 移动端侧边抽
interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
}

export function MobileDrawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'left',
}: MobileDrawerProps) {
  const positionClasses = {
    left: 'left-0',
    right: 'right-0',
  };

  return (
    <>
      {/* 抽屉内容 */}
      <div
        className={`fixed top-0 ${positionClasses[position]} h-full w-4/5 max-w-sm bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen
            ? 'translate-x-0'
            : position === 'left'
              ? '-translate-x-full'
              : 'translate-x-full'
        }`}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>

      {/* 遮罩?*/}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
    </>
  );
}

// 响应式网格布局
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function ResponsiveGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  className = '',
}: ResponsiveGridProps) {
  const gapClasses = {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  };

  return (
    <div
      className={`
        grid
        grid-cols-${columns.mobile}
        sm:grid-cols-${columns.tablet}
        lg:grid-cols-${columns.desktop}
        ${gapClasses[gap]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// 移动端卡片组
interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  onPress?: () => void;
}

export function MobileCard({
  children,
  className = '',
  elevated = false,
  onPress,
}: MobileCardProps) {
  const baseClasses = `
    bg-white rounded-mobile shadow-mobile overflow-hidden
    ${elevated ? 'shadow-mobile-lg' : ''}
    ${onPress ? 'active:scale-[0.98] transition-transform' : ''}
  `;

  if (onPress) {
    return (
      <button
        className={`${baseClasses} w-full text-left ${className}`}
        onClick={onPress}
      >
        {children}
      </button>
    );
  }

  return <div className={`${baseClasses} ${className}`}>{children}</div>;
}

// 移动端列表项
interface MobileListItemProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  className?: string;
}

export function MobileListItem({
  title,
  subtitle,
  icon,
  trailing,
  onPress,
  className = '',
}: MobileListItemProps) {
  const content = (
    <div className={`flex items-center p-4 ${className}`}>
      {icon && (
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
          {icon}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 mobile-base truncate">
          {title}
        </h3>
        {subtitle && (
          <p className="text-gray-500 mobile-sm mt-1 truncate">{subtitle}</p>
        )}
      </div>

      {trailing && <div className="ml-3">{trailing}</div>}
    </div>
  );

  if (onPress) {
    return (
      <button
        className="w-full text-left active:bg-gray-50 transition-colors"
        onClick={onPress}
      >
        {content}
      </button>
    );
  }

  return content;
}

// 移动端头部组
interface MobileHeaderProps {
  title: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  showBorder?: boolean;
}

export function MobileHeader({
  title,
  onBack,
  actions,
  showBorder = true,
}: MobileHeaderProps) {
  return (
    <header
      className={`bg-white py-4 px-4 safe-top ${showBorder ? 'border-b border-gray-200' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center min-w-0 flex-1">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              className="p-2 mr-2"
              onClick={onBack}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          <h1 className="font-semibold text-lg text-gray-900 truncate">
            {title}
          </h1>
        </div>

        {actions && (
          <div className="flex items-center space-x-2 ml-4">{actions}</div>
        )}
      </div>
    </header>
  );
}

// 移动端搜索栏
interface MobileSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: () => void;
}

export function MobileSearchBar({
  value,
  onChange,
  placeholder = '搜索...',
  onSearch,
}: MobileSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <Input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-4 py-3 mobile-base rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        onKeyDown={e => e.key === 'Enter' && onSearch?.()}
      />
      {value && onSearch && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 p-2"
          onClick={onSearch}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

// 使用屏幕信息的Hook
export function useScreenInfo(): ScreenInfo {
  const [screenInfo, setScreenInfo] = useState<ScreenInfo>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    deviceType: 'desktop',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      let deviceType: DeviceType = 'desktop';
      let isMobile = false;
      let isTablet = false;
      let isDesktop = true;

      if (width <= 320) {
        deviceType = 'mobile-s';
        isMobile = true;
        isDesktop = false;
      } else if (width <= 375) {
        deviceType = 'mobile-m';
        isMobile = true;
        isDesktop = false;
      } else if (width <= 425) {
        deviceType = 'mobile-l';
        isMobile = true;
        isDesktop = false;
      } else if (width <= 768) {
        deviceType = 'tablet';
        isTablet = true;
        isDesktop = false;
      } else if (width <= 1024) {
        deviceType = 'laptop';
        isDesktop = false;
      } else if (width <= 1200) {
        deviceType = 'desktop';
      } else {
        deviceType = 'wide';
      }

      setScreenInfo({
        width,
        height,
        deviceType,
        isMobile,
        isTablet,
        isDesktop,
      });
    };

    updateScreenInfo();
    window.addEventListener('resize', updateScreenInfo);

    return () => window.removeEventListener('resize', updateScreenInfo);
  }, []);

  return screenInfo;
}

// 响应式隐?显示组件
interface ResponsiveHideProps {
  children: React.ReactNode;
  hideOn?: DeviceType[];
  showOn?: DeviceType[];
}

export function ResponsiveHide({
  children,
  hideOn = [],
  showOn = [],
}: ResponsiveHideProps) {
  const screenInfo = useScreenInfo();

  // 如果指定了 showOn 且当前设备不在其中，则隐藏
  if (showOn.length > 0 && !showOn.includes(screenInfo.deviceType)) {
    return null;
  }

  // 如果指定了hideOn且当前设备在其中，则隐藏
  if (hideOn.includes(screenInfo.deviceType)) {
    return null;
  }

  return <>{children}</>;
}
