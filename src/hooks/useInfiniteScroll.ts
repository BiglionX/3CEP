'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from './useReactQueryConfig';

interface InfiniteScrollOptions {
  initialPage?: number;
  pageSize?: number;
  threshold?: number; // 距离底部多少像素时触发加?
}

interface InfiniteScrollResult<T> {
  data: T[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  loadMore: () => void;
  refresh: () => void;
  error: Error | null;
}

/**
 * 通用无限滚动Hook
 */
export function useInfiniteScroll<T>(
  fetchFunction: (
    page: number,
    pageSize: number
  ) => Promise<{
    data: T[];
    hasNextPage: boolean;
    totalCount?: number;
  }>,
  options: InfiniteScrollOptions = {}
): InfiniteScrollResult<T> {
  const { initialPage = 1, pageSize = 20, threshold = 100 } = options;

  const [manualTrigger, setManualTrigger] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: [QUERY_KEYS.INFINITE_SCROLL],
    queryFn: async ({ pageParam = initialPage }) => {
      const result = await fetchFunction(pageParam, pageSize);
      return {
        ...result,
        page: pageParam,
      };
    },
    getNextPageParam: lastPage => {
      if (!lastPage.hasNextPage) return undefined;
      return lastPage.page + 1;
    },
    initialPageParam: initialPage,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // 合并所有页面的数据
  const flatData = data?.pages.flatMap(page => page.data) || [];

  // 观察器检测是否接近底?
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 手动触发加载更多
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 刷新数据
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    data: flatData as T[],
    isLoading,
    isFetchingNextPage,
    hasNextPage: hasNextPage || false,
    loadMore,
    refresh,
    error: error || null,
  };
}

/**
 * 维修店专用的无限滚动Hook
 */
export function useRepairShopInfiniteScroll(
  searchParams: {
    search?: string;
    service?: string;
    minRating?: number;
    maxDistance?: number;
    lat?: number;
    lng?: number;
  } = {},
  options: InfiniteScrollOptions = {}
) {
  const {
    search = '',
    service = '',
    minRating = 0,
    maxDistance = 10,
    lat = 39.9042,
    lng = 116.4074,
  } = searchParams;

  return useInfiniteScroll(async (page: number, pageSize: number) => {
    const urlParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(search && { search }),
      ...(service && { service }),
      minRating: minRating.toString(),
      maxDistance: maxDistance.toString(),
      lat: lat.toString(),
      lng: lng.toString(),
    });

    const response = await fetch(
      `/api/repair-shop/shops?${urlParams.toString()}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || '获取店铺数据失败');
    }

    return {
      data: result.data.map((shop: any) => ({
        id: shop.id,
        name: shop.name,
        rating: shop.rating,
        reviewCount: shop.review_count,
        address: shop.address,
        phone: shop.phone,
        services: shop.services,
        priceRange: shop.price_range,
        distance: shop.distance,
        isFavorite: false,
      })),
      hasNextPage: result.hasNextPage,
      totalCount: result.count,
    };
  }, options);
}
