// 移动端专用组件库
// 提供针对移动设备优化的UI组件

import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  Home,
  Search,
  Bell,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

// 移动端导航栏组件
interface MobileNavbarProps {
  title: string;
  onMenuClick?: () => void;
  onBackClick?: () => void;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function MobileNavbar({
  title,
  onMenuClick,
  onBackClick,
  showBackButton = false,
  showMenuButton = true,
  className = '',
  children,
}: MobileNavbarProps) {
  return (
    <nav
      className={`sticky top-0 z-50 bg-white border-b border-gray-200 ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-3 h-14">
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <button
              onClick={onBackClick}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="返回"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}

          {showMenuButton && !showBackButton && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="菜单"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          )}

          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h1>
        </div>

        <div className="flex items-center space-x-2">{children}</div>
      </div>
    </nav>
  );
}

// 移动端底部导航栏组件
interface MobileTabBarProps {
  tabs: {
    id: string;
    label: string;
    icon: React.ReactNode;
    activeIcon?: React.ReactNode;
  }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function MobileTabBar({
  tabs,
  activeTab,
  onTabChange,
  className = '',
}: MobileTabBarProps) {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 ${className}`}
    >
      <div className="grid grid-cols-5 gap-1 px-2 py-2 safe-bottom">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            aria-label={tab.label}
          >
            <div className="mb-1">
              {activeTab === tab.id && tab.activeIcon
                ? tab.activeIcon
                : tab.icon}
            </div>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// 移动端卡片组?interface MobileCardProps {
  title?: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  className?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  showShadow?: boolean;
}

export function MobileCard({
  title,
  subtitle,
  image,
  imageAlt = '',
  className = '',
  onClick,
  children,
  showShadow = true,
}: MobileCardProps) {
  const clickableClass = onClick
    ? 'cursor-pointer hover:shadow-md active:scale-[0.98]'
    : '';
  const shadowClass = showShadow ? 'shadow-sm' : '';

  return (
    <div
      className={`bg-white rounded-xl overflow-hidden border border-gray-100 ${shadowClass} ${clickableClass} ${className}`}
      onClick={onClick}
    >
      {image && (
        <div className="relative w-full h-48">
          <img
            src={image}
            alt={imageAlt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {(title || subtitle || children) && (
        <div className="p-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {title}
            </h3>
          )}
          {subtitle && <p className="text-sm text-gray-600 mb-3">{subtitle}</p>}
          {children}
        </div>
      )}
    </div>
  );
}

// 移动端列表项组件
interface MobileListItemProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  rightContent?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  showDivider?: boolean;
}

export function MobileListItem({
  title,
  subtitle,
  icon,
  rightContent,
  onClick,
  className = '',
  showDivider = true,
}: MobileListItemProps) {
  const clickableClass = onClick
    ? 'cursor-pointer hover:bg-gray-50 active:bg-gray-100'
    : '';

  return (
    <>
      <div
        className={`flex items-center p-4 ${clickableClass} ${className}`}
        onClick={onClick}
      >
        {icon && <div className="flex-shrink-0 mr-3">{icon}</div>}

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-gray-900 truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1 truncate">{subtitle}</p>
          )}
        </div>

        {rightContent && (
          <div className="flex-shrink-0 ml-3">{rightContent}</div>
        )}
      </div>

      {showDivider && <div className="border-t border-gray-100 mx-4"></div>}
    </>
  );
}

// 移动端模态框组件
interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  className?: string;
}

export function MobileModal({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  className = '',
}: MobileModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* 模态内?*/}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-hidden ${className}`}
      >
        {/* 模态头?*/}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {title ? (
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            ) : (
              <div />
            )}

            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="关闭"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        )}

        {/* 模态内?*/}
        <div className="overflow-y-auto max-h-[calc(80vh-60px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

// 移动端搜索栏组件
interface MobileSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  placeholder?: string;
  className?: string;
}

export function MobileSearchBar({
  value,
  onChange,
  onSearch,
  placeholder = '搜索...',
  className = '',
}: MobileSearchBarProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      {value && onSearch && (
        <button
          onClick={onSearch}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <ChevronRight className="h-5 w-5 text-blue-500" />
        </button>
      )}
    </div>
  );
}

// 移动端下拉刷新组?interface MobilePullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export function MobilePullToRefresh({
  onRefresh,
  children,
  className = '',
}: MobilePullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || window.scrollY > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);

    if (distance > 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, 100));
    }
  };

  const handleTouchEnd = async () => {
    if (!isDragging) return;

    setIsDragging(false);

    if (pullDistance > 60) {
      setIsRefreshing(true);
      setPullDistance(60);

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  return (
    <div
      className={`relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 下拉指示?*/}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="absolute top-0 left-0 right-0 flex justify-center pt-3 transition-transform duration-200"
          style={{ transform: `translateY(${pullDistance - 40}px)` }}
        >
          <div className="bg-white rounded-full p-2 shadow-lg">
            {isRefreshing ? (
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <ChevronDown
                className={`w-6 h-6 text-gray-400 transition-transform ${
                  pullDistance > 60 ? 'rotate-180' : ''
                }`}
              />
            )}
          </div>
        </div>
      )}

      {children}
    </div>
  );
}

// 移动端空状态组?interface MobileEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function MobileEmptyState({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}: MobileEmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      <div className="mb-4 text-gray-300">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-500 mb-6">{description}</p>}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

// 移动端加载更多组?interface MobileLoadMoreProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  className?: string;
}

export function MobileLoadMore({
  onLoadMore,
  hasMore,
  loading,
  className = '',
}: MobileLoadMoreProps) {
  if (!hasMore) return null;

  return (
    <div className={`py-4 flex justify-center ${className}`}>
      <button
        onClick={onLoadMore}
        disabled={loading}
        className="px-6 py-2 text-blue-600 font-medium rounded-full border border-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
            加载?..
          </div>
        ) : (
          '加载更多'
        )}
      </button>
    </div>
  );
}

// 默认导出所有组?export default {
  MobileNavbar,
  MobileTabBar,
  MobileCard,
  MobileListItem,
  MobileModal,
  MobileSearchBar,
  MobilePullToRefresh,
  MobileEmptyState,
  MobileLoadMore,
};
