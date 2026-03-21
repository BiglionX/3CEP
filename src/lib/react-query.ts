/**
 * React Query 配置文件
 * 为维修店用户中心提供数据缓存和状态管? */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// 创建 QueryClient 实例
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 默认缓存时间 5分钟
      staleTime: 5 * 60 * 1000,
      // 缓存保留时间 10分钟
      gcTime: 10 * 60 * 1000,
      // 失败重试次数
      retry: 2,
      // 重试延迟时间（指数退避）
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // 后台刷新
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      // 错误处理
      throwOnError: false,
    },
    mutations: {
      // 失败重试次数
      retry: 1,
      // 乐观更新
      networkMode: 'always',
    },
  },
});

// 查询键常量
export const QUERY_KEYS = {
  // 工单相关
  WORK_ORDERS: ['repair-shop', 'work-orders'] as const,
  WORK_ORDER_DETAIL: (id: string) =>
    ['repair-shop', 'work-orders', id] as const,

  // 统计数据
  SHOP_STATISTICS: ['repair-shop', 'statistics'] as const,

  // 技师相关
  TECHNICIANS: ['repair-shop', 'technicians'] as const,

  // 客户相关
  CUSTOMERS: ['repair-shop', 'customers'] as const,
  CUSTOMER_SEARCH: (query: string) =>
    ['repair-shop', 'customers', 'search', query] as const,

  // 设备相关
  DEVICE_TYPES: ['repair-shop', 'device-types'] as const,
  FAULT_TYPES: (deviceTypeId?: string) =>
    ['repair-shop', 'fault-types', deviceTypeId] as const,

  // 价格相关
  PRICING_TEMPLATES: (category?: string) =>
    ['repair-shop', 'pricing-templates', category] as const,

  // 通知相关
  NOTIFICATIONS: ['repair-shop', 'notifications'] as const,
};

// 导出 Provider 组件
export { QueryClientProvider, ReactQueryDevtools };
