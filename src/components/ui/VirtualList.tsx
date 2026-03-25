'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface VirtualListProps<T> {
  data: T[];
  itemHeight: number; // 每个项目的高度 (像素)
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number; // 预渲染的项目数 (上下各多少个)
  estimatedItemHeight?: number; // 估算高度 (用于动态高度)
}

/**
 * 虚拟列表组件
 *
 * 特性:
 * - 只渲染可见区域的项目
 * - 支持大数据量列表 (>1000 项)
 * - 自动计算滚动位置
 * - 保持滚动条连续性
 *
 * @example
 * <VirtualList
 *   data={items}
 *   itemHeight={80}
 *   renderItem={(item, index) => <ItemCard key={item.id} {...item} />}
 *   overscan={5}
 * />
 */
export function VirtualList<T>({
  data,
  itemHeight,
  renderItem,
  className = '',
  overscan = 3,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // 初始化容器高度
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          setContainerHeight(entry.contentRect.height);
        }
      });

      resizeObserver.observe(containerRef.current);

      return () => resizeObserver.disconnect();
    }
  }, []);

  // 处理滚动
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  // 计算可见区域
  const totalHeight = data.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(
    data.length,
    startIndex + visibleCount + overscan * 2
  );

  // 切片数据
  const visibleData = data.slice(startIndex, endIndex);

  // 偏移量 (顶部空白)
  const offsetY = startIndex * itemHeight;

  if (data.length === 0) {
    return <div className={className}>暂无数据</div>;
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`overflow-auto ${className}`}
      style={{ height: '100%', minHeight: containerHeight || '400px' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${offsetY}px)`,
          }}
        >
          {visibleData.map((item, index) =>
            renderItem(item, startIndex + index)
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 动态高度虚拟列表示例
 *
 * 如果项目高度不固定，可以使用这个变体
 */
interface DynamicVirtualListProps<T> {
  data: T[];
  estimateItemHeight: number; // 估算高度
  measureItemHeight: (item: T) => number; // 测量实际高度
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
}

export function DynamicVirtualList<T>({
  data,
  estimateItemHeight = 100,
  measureItemHeight,
  renderItem,
  className = '',
  overscan = 3,
}: DynamicVirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [itemHeights, setItemHeights] = useState<number[]>([]);
  const [positions, setPositions] = useState<number[]>([]);

  // 初始化位置和测量高度
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          setContainerHeight(entry.contentRect.height);
        }
      });

      resizeObserver.observe(containerRef.current);

      return () => resizeObserver.disconnect();
    }
  }, []);

  // 计算每个项目的位置
  useEffect(() => {
    const heights = data.map(measureItemHeight);
    const pos: number[] = [];
    let currentPos = 0;

    for (let i = 0; i < data.length; i++) {
      pos[i] = currentPos;
      currentPos += heights[i];
    }

    setItemHeights(heights);
    setPositions(pos);
  }, [data, measureItemHeight]);

  // 处理滚动
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  // 找到可见区域的索引
  let startIndex = 0;
  let endIndex = data.length;

  for (let i = 0; i < positions.length; i++) {
    if (
      positions[i] + itemHeights[i] >
      scrollTop - overscan * estimateItemHeight
    ) {
      startIndex = i;
      break;
    }
  }

  for (let i = data.length - 1; i >= 0; i--) {
    if (
      positions[i] <
      scrollTop + containerHeight + overscan * estimateItemHeight
    ) {
      endIndex = i + 1;
      break;
    }
  }

  const visibleData = data.slice(startIndex, endIndex);

  if (data.length === 0) {
    return <div className={className}>暂无数据</div>;
  }

  const totalHeight =
    positions[positions.length - 1] +
    (itemHeights[itemHeights.length - 1] || 0);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`overflow-auto ${className}`}
      style={{ height: '100%', minHeight: containerHeight || '400px' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleData.map((item, index) => {
          const actualIndex = startIndex + index;
          return (
            <div
              key={actualIndex}
              style={{
                position: 'absolute',
                top: positions[actualIndex],
                left: 0,
                right: 0,
                height: itemHeights[actualIndex],
              }}
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
