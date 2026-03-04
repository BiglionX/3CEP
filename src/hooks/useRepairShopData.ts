/**
 * 维修店数据查询Hooks
 * 使用React Query管理维修店相关的数据获取和缓?
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from './useReactQueryConfig';

// 维修店数据类型定?
interface RepairShop {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  address: string;
  phone: string;
  services: string[];
  priceRange: string;
  distance?: string;
  isFavorite?: boolean;
}

interface ShopListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  service?: string;
  minRating?: number;
  maxDistance?: number;
  lat?: number;
  lng?: number;
}

interface ShopListResponse {
  data: RepairShop[];
  count: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// 获取维修店列表的Hook
export function useRepairShops(params: ShopListParams = {}) {
  const {
    page = 1,
    pageSize = 20,
    search = '',
    service = '',
    minRating = 0,
    maxDistance = 10,
    lat = 39.9042,
    lng = 116.4074,
  } = params;

  return useQuery<ShopListResponse, Error>({
    queryKey: [
      QUERY_KEYS.REPAIR_SHOPS,
      { page, pageSize, search, service, minRating, maxDistance },
    ],
    queryFn: async () => {
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

      // 转换数据格式
      const formattedData: ShopListResponse = {
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
        count: result.count,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      };

      return formattedData;
    },
    staleTime: 5 * 60 * 1000, // 5分钟内数据视为新?
    gcTime: 10 * 60 * 1000, // 缓存保留10分钟
    retry: 2, // 失败重试2�?
  });
}

// 获取单个维修店详情的Hook
export function useRepairShopDetail(shopId: string) {
  return useQuery<RepairShop, Error>({
    queryKey: QUERY_KEYS.SHOP_DETAILS(shopId),
    queryFn: async () => {
      const response = await fetch(`/api/repair-shop/shops/${shopId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '获取店铺详情失败');
      }

      const shop = result.data;
      return {
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
      };
    },
    enabled: !!shopId, // 只有当shopId存在时才执行查询
    staleTime: 10 * 60 * 1000, // 10分钟内数据视为新?
    gcTime: 15 * 60 * 1000, // 缓存保留15分钟
  });
}

// 收藏/取消收藏店铺的Mutation Hook
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      shopId,
      isFavorite,
    }: any: {
      shopId: string;
      isFavorite: boolean;
    }) => {
      // 这里应该是调用收藏API的实际实?
      // 暂时返回模拟结果
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, isFavorite: !isFavorite };
    },
    onSuccess: (data, variables) => {
      // 更新缓存中的店铺数据
      queryClient.setQueriesData<ShopListResponse>(
        { queryKey: [QUERY_KEYS.REPAIR_SHOPS] },
        oldData => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            data: oldData.data.map(shop =>
              shop.id === variables.shopId
                ? { ...shop, isFavorite: data.isFavorite }
                : shop
            ),
          };
        }
      );
    },
  });
}

// 预加载店铺数据的工具函数
export function prefetchRepairShops(params: ShopListParams = {}) {
  const queryClient = useQueryClient();

  return queryClient.prefetchQuery({
    queryKey: [QUERY_KEYS.REPAIR_SHOPS, params],
    queryFn: async () => {
      // 这里复用上面的查询逻辑
      const {
        page = 1,
        pageSize = 20,
        search = '',
        service = '',
        minRating = 0,
        maxDistance = 10,
        lat = 39.9042,
        lng = 116.4074,
      } = params;

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
        count: result.count,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      };
    },
  });
}
