/**
 * 通用虚拟滚动 Hook
 * 基于 @tanstack/react-virtual 实现
 */

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

export interface UseVirtualScrollOptions<T> {
  /** 要渲染的数据项数组 */
  items: T[];
  /** 每个项的高度（像素） */
  itemSize: number;
  /** 容器高度（像素） */
  containerHeight: number;
  /** 预加载的项数（默认 5） */
  overscan?: number;
  /** 动态估算高度的函数（可选） */
  estimateSize?: (index: number) => number;
}

export interface UseVirtualScrollReturn<T> {
  /** 虚拟项列表 */
  virtualItems: ReturnType<
    ReturnType<typeof useVirtualizer>['getVirtualItems']
  >;
  /** 总高度（像素） */
  totalSize: number;
  /** 父容器 ref */
  parentRef: React.RefObject<HTMLDivElement>;
  /** 滚动到指定索引 */
  scrollToIndex: (
    index: number,
    options?: { align?: 'start' | 'end' | 'center' | 'auto' }
  ) => void;
}

/**
 * 虚拟滚动 Hook
 *
 * @example
 * ```tsx
 * const { virtualItems, totalSize, parentRef } = useVirtualScroll({
 *   items: data,
 *   itemSize: 60,
 *   containerHeight: 600,
 * });
 *
 * return (
 *   <div ref={parentRef} style={{ height: 600, overflow: 'auto' }}>
 *     <div style={{ height: totalSize, position: 'relative' }}>
 *       {virtualItems.map(virtualItem => (
 *         <div
 *           key={virtualItem.key}
 *           style={{
 *             position: 'absolute',
 *             top: 0,
 *             left: 0,
 *             width: '100%',
 *             transform: `translateY(${virtualItem.start}px)`,
 *           }}
 *         >
 *           {items[virtualItem.index]}
 *         </div>
 *       ))}
 *     </div>
 *   </div>
 * );
 * ```
 */
export function useVirtualScroll<T>({
  items,
  itemSize,
  containerHeight,
  overscan = 5,
  estimateSize,
}: UseVirtualScrollOptions<T>): UseVirtualScrollReturn<T> {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: estimateSize || (() => itemSize),
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  const scrollToIndex = (
    index: number,
    options?: { align?: 'start' | 'end' | 'center' | 'auto' }
  ) => {
    virtualizer.scrollToIndex(index, options);
  };

  return {
    virtualItems,
    totalSize,
    parentRef,
    scrollToIndex,
  };
}

export default useVirtualScroll;
