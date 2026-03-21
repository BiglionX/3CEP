/**
 * React Query配置文件
 * 为维修店应用配置React Query客户端
 */
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// 创建QueryClient实例
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 默认缓存时间5分钟
      staleTime: 5 * 60 * 1000,
      // 缓存保留时间10分钟
      gcTime: 10 * 60 * 1000,
      // 失败重试次数
      retry: 2,
      // 重试延迟时间（毫秒）
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // 启用refetch on window focus
      refetchOnWindowFocus: false,
      // 启用refetch on mount
      refetchOnMount: true,
      // 启用refetch on reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // 失败重试次数
      retry: 1,
    },
  },
});

// 查询键常量
export const QUERY_KEYS = {
  REPAIR_SHOPS: 'repairShops',
  WORK_ORDERS: 'workOrders',
  WORK_ORDER_DETAIL: (id: string) => ['workOrderDetail', id],
  SHOP_DETAILS: (id: string) => ['shopDetails', id],
  SHOP_REVIEWS: (id: string) => ['shopReviews', id],
  SHOP_STATISTICS: 'shopStatistics',
  TECHNICIANS: 'technicians',
  CUSTOMERS: 'customers',
  CUSTOMER_SEARCH: (query: string) => ['customerSearch', query],
  DEVICE_TYPES: 'deviceTypes',
  FAULT_TYPES: (deviceTypeId?: string) => ['faultTypes', deviceTypeId],
  PRICING_TEMPLATES: (category?: string) => ['pricingTemplates', category],
  NOTIFICATIONS: 'notifications',
  INFINITE_SCROLL: 'infiniteScroll',
};

// React Query Provider组件
export function ReactQueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
