/**
 * 高管仪表板移动端适配 Hook
 * 提供触摸手势、响应式优化和离线缓存策略
 */

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseExecutiveDashboardOptions {
  enableSwipe?: boolean;
  enableOfflineCache?: boolean;
  refreshInterval?: number;
}

interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down' | null;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export function useExecutiveDashboard({
  enableSwipe = true,
  enableOfflineCache = true,
  refreshInterval = 300000, // 5 分钟
}: UseExecutiveDashboardOptions = {}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [screenSize, setScreenSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [swipeGesture, setSwipeGesture] = useState<SwipeGesture>({
    direction: null,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  });

  // 检测屏幕尺寸
  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenSize('sm');
      else if (width < 768) setScreenSize('md');
      else if (width < 1280) setScreenSize('lg');
      else setScreenSize('xl');
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // 检测网络状态
  useEffect(() => {
    const updateNetworkStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    updateNetworkStatus();
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  // 离线缓存策略
  useEffect(() => {
    if (!enableOfflineCache) return;

    // 注册 Service Worker（如果浏览器支持）
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw-executive-dashboard.js')
          .then(registration => {
            console.log('Service Worker 注册成功:', registration.scope);
          })
          .catch(error => {
            console.log('Service Worker 注册失败:', error);
          });
      });
    }

    // 缓存关键数据到 IndexedDB
    const cacheDashboardData = async (data: any) => {
      try {
        if ('indexedDB' in window) {
          const db = await openDatabase();
          const transaction = db.transaction(['dashboard'], 'readwrite');
          const store = transaction.objectStore('dashboard');
          await store.put({ id: 'latest', data, timestamp: Date.now() });
        }
      } catch (error) {
        console.error('缓存数据失败:', error);
      }
    };

    // 从缓存加载数据
    const loadFromCache = async () => {
      try {
        if ('indexedDB' in window) {
          const db = await openDatabase();
          const transaction = db.transaction(['dashboard'], 'readonly');
          const store = transaction.objectStore('dashboard');
          const request = store.get('latest');

          return new Promise<any>((resolve, reject) => {
            request.onsuccess = () => {
              const result = request.result;
              if (result && Date.now() - result.timestamp < 3600000) {
                // 1 小时内的缓存有效
                resolve(result.data);
              } else {
                resolve(null);
              }
            };
            request.onerror = () => reject(request.error);
          });
        }
      } catch (error) {
        console.error('加载缓存失败:', error);
        return null;
      }
    };

    // 打开或创建 IndexedDB
    const openDatabase = (): Promise<IDBDatabase> => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('ExecutiveDashboardDB', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = event => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('dashboard')) {
            db.createObjectStore('dashboard', { keyPath: 'id' });
          }
        };
      });
    };

    // 暴露缓存函数给组件使用
    (window as any).__cacheDashboardData = cacheDashboardData;
    (window as any).__loadDashboardFromCache = loadFromCache;

    return () => {
      delete (window as any).__cacheDashboardData;
      delete (window as any).__loadDashboardFromCache;
    };
  }, [enableOfflineCache]);

  // 触摸手势处理
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enableSwipe) return;

      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    },
    [enableSwipe]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enableSwipe || !touchStartRef.current) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // 判断滑动方向
      if (absX > 50 || absY > 50) {
        // 最小滑动距离
        let direction: SwipeGesture['direction'] = null;

        if (absX > absY) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }

        setSwipeGesture({
          direction,
          startX: touchStartRef.current.x,
          startY: touchStartRef.current.y,
          endX: touch.clientX,
          endY: touch.clientY,
        });
      }
    },
    [enableSwipe]
  );

  const handleTouchEnd = useCallback(() => {
    if (!enableSwipe) return;

    touchStartRef.current = null;

    // 可以在这里添加滑动后的处理逻辑
    setTimeout(() => {
      setSwipeGesture({
        direction: null,
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
      });
    }, 100);
  }, [enableSwipe]);

  // 刷新功能
  const refresh = useCallback(
    async (force = false) => {
      if (isRefreshing && !force) return;

      setIsRefreshing(true);
      try {
        // 模拟刷新操作，实际应该调用 API
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 如果在离线状态，尝试从缓存加载
        if (isOffline) {
          console.log('离线状态，尝试从缓存加载数据...');
          if ((window as any).__loadDashboardFromCache) {
            const cachedData = await (window as any).__loadDashboardFromCache();
            if (cachedData) {
              console.log('成功从缓存加载数据');
              return cachedData;
            }
          }
        }

        return null;
      } finally {
        setIsRefreshing(false);
      }
    },
    [isRefreshing, isOffline]
  );

  // 自动刷新
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(() => {
      if (!isRefreshing && navigator.onLine) {
        refresh();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, isRefreshing]);

  // 获取响应式布局类名
  const getResponsiveClasses = useCallback(() => {
    switch (screenSize) {
      case 'sm':
        return {
          grid: 'grid-cols-1',
          cardPadding: 'p-3',
          fontSize: 'text-sm',
          buttonSize: 'min-h-[44px]',
        };
      case 'md':
        return {
          grid: 'grid-cols-2',
          cardPadding: 'p-4',
          fontSize: 'text-base',
          buttonSize: 'min-h-[44px]',
        };
      case 'lg':
        return {
          grid: 'grid-cols-3',
          cardPadding: 'p-4',
          fontSize: 'text-base',
          buttonSize: 'min-h-[36px]',
        };
      case 'xl':
        return {
          grid: 'grid-cols-4',
          cardPadding: 'p-6',
          fontSize: 'text-base',
          buttonSize: 'min-h-[36px]',
        };
    }
  }, [screenSize]);

  return {
    // 状态
    isRefreshing,
    isOffline,
    screenSize,
    swipeGesture,

    // 方法
    refresh,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    getResponsiveClasses,

    // 工具函数
    isMobile: screenSize === 'sm' || screenSize === 'md',
    isTablet: screenSize === 'lg',
    isDesktop: screenSize === 'xl',
  };
}

/**
 * 预取关键数据 Hook
 */
export function usePrefetchDashboardData() {
  const [isPrefetched, setIsPrefetched] = useState(false);

  useEffect(() => {
    // 预加载关键资源
    const preloadResources = () => {
      // 预加载图表库
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = '/_next/static/charts.js';
      document.head.appendChild(link);

      // 预加载图标
      const iconLink = document.createElement('link');
      iconLink.rel = 'preload';
      iconLink.as = 'image';
      iconLink.href = '/icons/dashboard.svg';
      document.head.appendChild(iconLink);

      setIsPrefetched(true);
    };

    // 空闲时预取
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(preloadResources);
    } else {
      setTimeout(preloadResources, 1000);
    }
  }, []);

  return isPrefetched;
}

/**
 * 性能优化 Hook - 虚拟滚动
 */
export function useVirtualScroll<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 5);
  const endIndex = Math.min(items.length, startIndex + visibleCount + 10);

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
  };
}
