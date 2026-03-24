/**
 * 通用虚拟滚动列表组件
 * 基于 useVirtualScroll Hook 实现
 */

'use client';

import { useVirtualScroll } from '@/hooks/useVirtualScroll';
import React from 'react';

export interface VirtualListProps<T> {
  /** 要渲染的数据项数组 */
  items: T[];
  /** 每个项的高度（像素） */
  itemSize: number;
  /** 容器高度（像素） */
  height: number;
  /** 渲染单个项的函数 */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** 容器类名 */
  className?: string;
  /** 预加载的项数（默认 5） */
  overscan?: number;
  /** 动态估算高度的函数（可选） */
  estimateSize?: (index: number) => number;
  /** 空数据时的提示内容 */
  emptyContent?: React.ReactNode;
  /** 加载状态 */
  loading?: boolean;
  /** 加载中提示内容 */
  loadingContent?: React.ReactNode;
}

/**
 * 虚拟滚动列表组件
 *
 * @example
 * ```tsx
 * <VirtualList
 *   items={users}
 *   itemSize={60}
 *   height={600}
 *   renderItem={(user) => <UserRow key={user.id} user={user} />}
 * />
 * ```
 */
export function VirtualList<T>({
  items,
  itemSize,
  height,
  renderItem,
  className = '',
  overscan = 5,
  estimateSize,
  emptyContent = <div className="text-center text-gray-500 py-8">暂无数据</div>,
  loading = false,
  loadingContent = (
    <div className="text-center text-gray-500 py-8">加载中...</div>
  ),
}: VirtualListProps<T>) {
  const { virtualItems, totalSize, parentRef } = useVirtualScroll({
    items,
    itemSize,
    containerHeight: height,
    overscan,
    estimateSize,
  });

  // 处理加载状态
  if (loading) {
    return (
      <div className={`bg-white rounded-lg ${className}`} style={{ height }}>
        {loadingContent}
      </div>
    );
  }

  // 处理空数据状态
  if (!items || items.length === 0) {
    return (
      <div className={`bg-white rounded-lg ${className}`} style={{ height }}>
        {emptyContent}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={`bg-white rounded-lg overflow-auto ${className}`}
      style={{ height }}
    >
      <div
        style={{
          height: totalSize,
          position: 'relative',
          width: '100%',
        }}
      >
        {virtualItems.map(virtualItem => (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
              height: `${virtualItem.size}px`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VirtualList;
