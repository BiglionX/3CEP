/**
 * 维修店 React Query Hooks
 * 封装常用的 API 调用和数据管理逻辑
 */

import { QUERY_KEYS } from '@/lib/react-query';
import { repairShopApi } from '@/services/repair-shop-api.service';
import type {
  PaginationParams,
  WorkOrder,
  WorkOrderFilters,
} from '@/types/repair-shop.types';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

// ==================== 工单相关 Hooks ====================

/**
 * 获取工单列表
 */
export const useWorkOrders = (
  filters?: WorkOrderFilters,
  pagination?: PaginationParams
) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.WORK_ORDERS, filters, pagination],
    queryFn: () => repairShopApi.getWorkOrders(filters, pagination),
    select: response => response.data,
    placeholderData: previousData => previousData,
  });
};

/**
 * 获取工单列表（分页版本）
 */
export const useWorkOrdersPaginated = (
  filters?: WorkOrderFilters,
  initialPage: number = 1,
  pageSize: number = 20
) => {
  return useQuery({
    queryKey: [
      ...QUERY_KEYS.WORK_ORDERS,
      'paginated',
      filters,
      initialPage,
      pageSize,
    ],
    queryFn: async () => {
      const response = await repairShopApi.getWorkOrders(filters, {
        page: initialPage,
        pageSize,
      });
      return {
        data: response.data,
        pagination: {
          currentPage: initialPage,
          pageSize,
          total: response.data.length, // 实际API应该返回总数
          totalPages: Math.ceil(response.data.length / pageSize),
        },
      };
    },
    placeholderData: previousData => previousData,
  });
};

/**
 * 无限滚动获取工单列表
 */
export const useWorkOrdersInfinite = (
  filters?: WorkOrderFilters,
  pageSize: number = 20
) => {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.WORK_ORDERS, 'infinite', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await repairShopApi.getWorkOrders(filters, {
        page: pageParam,
        pageSize,
      });
      return {
        data: response.data,
        nextPage: pageParam + 1,
        hasMore: response.data.length === pageSize, // 简单的hasMore判断
      };
    },
    getNextPageParam: (lastPage: {
      data: WorkOrder[];
      nextPage: number;
      hasMore: boolean;
    }) => (lastPage.hasMore ? lastPage.nextPage : undefined),
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * 获取单个工单详情
 */
export const useWorkOrderDetail = (orderId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.WORK_ORDER_DETAIL(orderId),
    queryFn: () => repairShopApi.getWorkOrder(orderId),
    enabled: !!orderId,
    select: response => response.data,
  });
};

/**
 * 创建新工单
 */
export const useCreateWorkOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      workOrder: Omit<
        WorkOrder,
        | 'id'
        | 'createdAt'
        | 'updatedAt'
        | 'orderNumber'
        | 'status'
        | 'priority'
        | 'price'
        | 'partsCost'
        | 'laborCost'
        | 'totalPrice'
        | 'paymentStatus'
      >
    ) => repairShopApi.createWorkOrder(workOrder),
    onSuccess: () => {
      // 使工单列表失效，触发重新获取
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORK_ORDERS });
    },
  });
};

/**
 * 更新工单状态
 */
export const useUpdateWorkOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      updates,
    }: {
      id: string;
      status: WorkOrder['status'];
      updates?: Partial<WorkOrder>;
    }) => repairShopApi.updateWorkOrderStatus(id, status, updates),
    onSuccess: (response, variables) => {
      // 更新单个工单缓存
      queryClient.setQueryData(
        QUERY_KEYS.WORK_ORDER_DETAIL(variables.id),
        response
      );

      // 使工单列表失效
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WORK_ORDERS });
    },
  });
};

// ==================== 统计数据 Hooks ====================

/**
 * 获取店铺统计数据
 */
export const useShopStatistics = (shopId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.SHOP_STATISTICS,
    queryFn: () => repairShopApi.getShopStatistics(shopId),
    enabled: !!shopId,
    select: response => response.data,
    staleTime: 30 * 1000, // 统计数据相对稳定，30 秒缓存
  });
};

// ==================== 技师相关 Hooks ====================

/**
 * 获取技师列表
 */
export const useTechnicians = (shopId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.TECHNICIANS,
    queryFn: () => repairShopApi.getTechnicians(shopId),
    enabled: !!shopId,
    select: response => response.data,
  });
};

// ==================== 客户相关 Hooks ====================

/**
 * 获取客户列表
 */
export const useCustomers = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CUSTOMERS,
    queryFn: () => repairShopApi.searchCustomers(''),
    select: response => response.data,
  });
};

/**
 * 搜索客户
 */
export const useCustomerSearch = (query: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.CUSTOMER_SEARCH(query),
    queryFn: () => repairShopApi.searchCustomers(query),
    enabled: !!query && query.length > 1,
    select: response => response.data,
  });
};

// ==================== 设备相关 Hooks ====================

/**
 * 获取设备类型列表
 */
export const useDeviceTypes = () => {
  return useQuery({
    queryKey: QUERY_KEYS.DEVICE_TYPES,
    queryFn: () => repairShopApi.getDeviceTypes(),
    select: response => response.data,
    staleTime: 30 * 60 * 1000, // 设备类型相对固定，30 分钟缓存
  });
};

/**
 * 获取故障类型列表
 */
export const useFaultTypes = (deviceTypeId?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.FAULT_TYPES(deviceTypeId),
    queryFn: () => repairShopApi.getFaultTypes(deviceTypeId),
    select: response => response.data,
    staleTime: 30 * 60 * 1000, // 故障类型相对固定，30 分钟缓存
  });
};

// ==================== 价格相关 Hooks ====================

/**
 * 获取报价模板
 */
export const usePricingTemplates = (category?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.PRICING_TEMPLATES(category),
    queryFn: () => repairShopApi.getPricingTemplates(category),
    select: response => response.data,
    staleTime: 15 * 60 * 1000, // 价格模板相对稳定，15 分钟缓存
  });
};

// ==================== 通知相关 Hooks ====================

/**
 * 获取通知列表
 */
export const useNotifications = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.NOTIFICATIONS,
    queryFn: () => repairShopApi.getNotifications(userId),
    enabled: !!userId,
    select: response => response.data,
    // 通知需要更频繁的更新
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // 每分钟自动刷新
  });
};

/**
 * 标记通知为已读
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      repairShopApi.markNotificationAsRead(notificationId),
    onSuccess: () => {
      // 使通知列表失效
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS });
    },
  });
};

// ==================== 组合 Hooks ====================

/**
 * 获取工单列表和统计数据的组合Hook
 */
export const useDashboardData = (
  shopId: string,
  filters?: WorkOrderFilters
) => {
  const workOrdersQuery = useWorkOrders(filters);
  const statisticsQuery = useShopStatistics(shopId);

  return {
    workOrders: workOrdersQuery.data,
    statistics: statisticsQuery.data,
    loading: workOrdersQuery.isLoading || statisticsQuery.isLoading,
    error: workOrdersQuery.error || statisticsQuery.error,
  };
};

/**
 * 获取创建工单所需的所有数据
 */
export const useCreateOrderData = (shopId: string) => {
  const deviceTypesQuery = useDeviceTypes();
  const techniciansQuery = useTechnicians(shopId);
  const pricingTemplatesQuery = usePricingTemplates();

  return {
    deviceTypes: deviceTypesQuery.data,
    technicians: techniciansQuery.data,
    pricingTemplates: pricingTemplatesQuery.data,
    loading:
      deviceTypesQuery.isLoading ||
      techniciansQuery.isLoading ||
      pricingTemplatesQuery.isLoading,
    error:
      deviceTypesQuery.error ||
      techniciansQuery.error ||
      pricingTemplatesQuery.error,
  };
};
