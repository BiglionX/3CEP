/**
 * 增强版Zustand状态管理器
 * 提供现代化的状态管理模式，支持持久化、中间件和DevTools集成
 */

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { devtools, DevtoolsOptions } from 'zustand/middleware';
import {
  Database,
  ShoppingCart,
  Package,
  TrendingUp,
  Users,
  Settings,
  Bell,
} from 'lucide-react';

// 状态类型定?export interface UserState {
  id: string | null;
  email: string | null;
  name: string | null;
  avatar: string | null;
  roles: string[];
  permissions: string[];
  isAuthenticated: boolean;
  lastLogin: Date | null;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  attributes?: Record<string, any>;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  currency: string;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  icon?: React.ReactNode;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  lastChecked: Date | null;
}

export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'name' | 'rating' | 'date';
  sortOrder?: 'asc' | 'desc';
  inStock?: boolean;
  tags?: string[];
}

export interface ProductState {
  filters: ProductFilter;
  searchQuery: string;
  viewMode: 'grid' | 'list';
  selectedProducts: string[];
}

// 全局状态接?export interface GlobalState {
  // 用户状?  user: UserState;
  setUser: (user: Partial<UserState>) => void;
  clearUser: () => void;
  isAuthenticated: () => boolean;

  // 购物车状?  cart: CartState;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  calculateCartTotals: () => void;

  // 通知状?  notifications: NotificationState;
  addNotification: (
    notification: Omit<Notification, 'id' | 'createdAt' | 'read'>
  ) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;

  // 产品状?  products: ProductState;
  updateProductFilters: (filters: Partial<ProductFilter>) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  toggleProductSelection: (productId: string) => void;
  clearProductSelection: () => void;

  // UI状?  ui: {
    sidebarCollapsed: boolean;
    theme: 'light' | 'dark' | 'system';
    language: string;
    loading: boolean;
  };
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLoading: (loading: boolean) => void;

  // 重置所有状?  reset: () => void;
}

// 初始状态定?const initialState = {
  user: {
    id: null,
    email: null,
    name: null,
    avatar: null,
    roles: [],
    permissions: [],
    isAuthenticated: false,
    lastLogin: null,
  },
  cart: {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    currency: 'CNY',
    updatedAt: new Date(),
  },
  notifications: {
    notifications: [],
    unreadCount: 0,
    lastChecked: null,
  },
  products: {
    filters: {},
    searchQuery: '',
    viewMode: 'grid' as const,
    selectedProducts: [],
  },
  ui: {
    sidebarCollapsed: false,
    theme: 'light' as const,
    language: 'zh-CN',
    loading: false,
  },
};

// 创建持久化配?const persistOptions = {
  name: 'global-store',
  storage: createJSONStorage(() => localStorage),
  partialize: (state: GlobalState) => ({
    user: state.user,
    cart: state.cart,
    ui: state.ui,
    products: state.products,
  }),
  version: 1,
  migrate: (persistedState: any, version: number) => {
    if (version === 0) {
      // 迁移逻辑
      return {
        ...persistedState,
        ui: {
          ...initialState.ui,
          ...(persistedState.ui || {}),
        },
      };
    }
    return persistedState;
  },
};

// 创建增强版Store
export const useGlobalStore = create<GlobalState>()(
  devtools(
    persist(
      immer(
        <T extends GlobalState>(
          set: (fn: (state: T) => void) => void,
          get: () => T
        ) => ({
          ...initialState,

          // 用户状态管?          setUser: (userData: Partial<UserState>) =>
            set((state: T) => {
              state.user = { ...state.user, ...userData };
              if (userData.id) {
                state.user.isAuthenticated = true;
                state.user.lastLogin = new Date();
              }
            }),

          clearUser: () =>
            set((state: T) => {
              state.user = initialState.user;
            }),

          isAuthenticated: () => get().user.isAuthenticated,

          // 购物车管?          addToCart: (newItem: Omit<CartItem, 'id'>) =>
            set((state: T) => {
              const existingItem = state.cart.items.find(
                item => item.productId === newItem.productId
              );

              if (existingItem) {
                existingItem.quantity += newItem.quantity;
              } else {
                state.cart.items.push({
                  ...newItem,
                  id: Math.random().toString(36).substr(2, 9),
                });
              }

              state.cart.updatedAt = new Date();
              get().calculateCartTotals();
            }),

          removeFromCart: (itemId: string) =>
            set((state: T) => {
              state.cart.items = state.cart.items.filter(
                item => item.id !== itemId
              );
              state.cart.updatedAt = new Date();
              get().calculateCartTotals();
            }),

          updateCartItemQuantity: (itemId: string, quantity: number) =>
            set((state: T) => {
              const item = state.cart.items.find(item => item.id === itemId);
              if (item && quantity > 0) {
                item.quantity = quantity;
              } else if (item && quantity <= 0) {
                state.cart.items = state.cart.items.filter(
                  item => item.id !== itemId
                );
              }
              state.cart.updatedAt = new Date();
              get().calculateCartTotals();
            }),

          clearCart: () =>
            set(state => {
              state.cart = initialState.cart;
            }),

          calculateCartTotals: () =>
            set((state: T) => {
              state.cart.totalItems = state.cart.items.reduce(
                (sum, item) => sum + item.quantity,
                0
              );
              state.cart.totalPrice = state.cart.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              );
            }),

          // 通知管理
          addNotification: (
            notificationData: Omit<Notification, 'id' | 'createdAt' | 'read'>
          ) =>
            set((state: T) => {
              const notification: Notification = {
                ...notificationData,
                id: Math.random().toString(36).substr(2, 9),
                createdAt: new Date(),
                read: false,
              };

              state.notifications.notifications.unshift(notification);
              state.notifications.unreadCount += 1;
              state.notifications.lastChecked = new Date();

              // 限制通知数量
              if (state.notifications.notifications.length > 100) {
                state.notifications.notifications =
                  state.notifications.notifications.slice(0, 100);
              }
            }),

          markNotificationAsRead: (id: string) =>
            set((state: T) => {
              const notification = state.notifications.notifications.find(
                n => n.id === id
              );
              if (notification && !notification.read) {
                notification.read = true;
                state.notifications.unreadCount = Math.max(
                  0,
                  state.notifications.unreadCount - 1
                );
              }
            }),

          markAllNotificationsAsRead: () =>
            set((state: T) => {
              state.notifications.notifications.forEach(notification => {
                notification.read = true;
              });
              state.notifications.unreadCount = 0;
            }),

          removeNotification: (id: string) =>
            set((state: T) => {
              const notification = state.notifications.notifications.find(
                n => n.id === id
              );
              if (notification && !notification.read) {
                state.notifications.unreadCount = Math.max(
                  0,
                  state.notifications.unreadCount - 1
                );
              }
              state.notifications.notifications =
                state.notifications.notifications.filter(n => n.id !== id);
            }),

          clearAllNotifications: () =>
            set(state => {
              state.notifications = initialState.notifications;
            }),

          // 产品状态管?          updateProductFilters: (filters: Partial<ProductFilter>) =>
            set((state: T) => {
              state.products.filters = {
                ...state.products.filters,
                ...filters,
              };
            }),

          setSearchQuery: (query: string) =>
            set((state: T) => {
              state.products.searchQuery = query;
            }),

          setViewMode: (mode: 'grid' | 'list') =>
            set((state: T) => {
              state.products.viewMode = mode;
            }),

          toggleProductSelection: (productId: string) =>
            set((state: T) => {
              const index = state.products.selectedProducts.indexOf(productId);
              if (index > -1) {
                state.products.selectedProducts.splice(index, 1);
              } else {
                state.products.selectedProducts.push(productId);
              }
            }),

          clearProductSelection: () =>
            set((state: T) => {
              state.products.selectedProducts = [];
            }),

          // UI状态管?          toggleSidebar: () =>
            set((state: T) => {
              state.ui.sidebarCollapsed = !state.ui.sidebarCollapsed;
            }),

          setTheme: (theme: 'light' | 'dark' | 'system') =>
            set((state: T) => {
              state.ui.theme = theme;
            }),

          setLoading: (loading: boolean) =>
            set((state: T) => {
              state.ui.loading = loading;
            }),

          // 重置状?          reset: () =>
            set((state: T) => {
              Object.assign(state, initialState);
            }),
        })
      ),
      persistOptions
    ),
    {
      name: 'GlobalStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// 选择器Hooks - 避免不必要的重新渲染
export const useUser = () => useGlobalStore(state => state.user);
export const useCart = () => useGlobalStore(state => state.cart);
export const useNotifications = () =>
  useGlobalStore(state => state.notifications);
export const useProducts = () => useGlobalStore(state => state.products);
export const useUI = () => useGlobalStore(state => state.ui);

// 特定功能的选择?export const useAuth = () => {
  const { user, setUser, clearUser, isAuthenticated } = useGlobalStore();
  return { user, setUser, clearUser, isAuthenticated: isAuthenticated() };
};

export const useCartActions = () => {
  const {
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    calculateCartTotals,
  } = useGlobalStore();
  return {
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    calculateCartTotals,
  };
};

export const useNotificationActions = () => {
  const {
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    clearAllNotifications,
  } = useGlobalStore();
  return {
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    clearAllNotifications,
  };
};
