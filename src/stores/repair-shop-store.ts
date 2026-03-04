/**
 * 维修店应用状态管?- Zustand Store
 * 实现现代化的状态管理模式，替代传统的Context API和Redux
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// 状态类型定?interface RepairShopState {
  // 用户相关状?  user: {
    id: string | null;
    name: string | null;
    email: string | null;
    avatar: string | null;
    isLoggedIn: boolean;
    role: 'admin' | 'user' | 'guest';
  };

  // 维修店数据状?  shops: {
    list: any[];
    loading: boolean;
    error: string | null;
    filters: {
      search: string;
      category: string;
      rating: number;
      distance: number;
    };
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };

  // 通知状?  notifications: {
    list: any[];
    unreadCount: number;
    loading: boolean;
  };

  // 搜索状?  search: {
    query: string;
    results: any[];
    history: string[];
    suggestions: string[];
    loading: boolean;
  };

  // UI状?  ui: {
    sidebarOpen: boolean;
    mobileMenuOpen: boolean;
    theme: 'light' | 'dark';
    language: 'zh' | 'en';
  };

  // 性能监控状?  performance: {
    apiCalls: number;
    cacheHits: number;
    loadTime: number;
    lastUpdated: Date | null;
  };
}

// 状态操作类?interface RepairShopActions {
  // 用户操作
  setUser: (user: Partial<RepairShopState['user']>) => void;
  logout: () => void;
  login: (userData: any) => void;

  // 维修店操?  setShops: (shops: any[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<RepairShopState['shops']['filters']>) => void;
  setPagination: (
    pagination: Partial<RepairShopState['shops']['pagination']>
  ) => void;
  loadShops: (page?: number, filters?: any) => Promise<void>;

  // 通知操作
  setNotifications: (notifications: any[]) => void;
  addNotification: (notification: any) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;

  // 搜索操作
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: any[]) => void;
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  loadSearchSuggestions: (query: string) => Promise<void>;

  // UI操作
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'zh' | 'en') => void;

  // 性能操作
  incrementApiCalls: () => void;
  incrementCacheHits: () => void;
  setLoadTime: (time: number) => void;
  resetPerformance: () => void;

  // 重置操作
  reset: () => void;
}

// 初始状?const initialState: RepairShopState = {
  user: {
    id: null,
    name: null,
    email: null,
    avatar: null,
    isLoggedIn: false,
    role: 'guest',
  },
  shops: {
    list: [],
    loading: false,
    error: null,
    filters: {
      search: '',
      category: '',
      rating: 0,
      distance: 10,
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 20,
    },
  },
  notifications: {
    list: [],
    unreadCount: 0,
    loading: false,
  },
  search: {
    query: '',
    results: [],
    history: [],
    suggestions: [],
    loading: false,
  },
  ui: {
    sidebarOpen: false,
    mobileMenuOpen: false,
    theme: 'light',
    language: 'zh',
  },
  performance: {
    apiCalls: 0,
    cacheHits: 0,
    loadTime: 0,
    lastUpdated: null,
  },
};

// 创建主store
export const useRepairShopStore = create<RepairShopState & RepairShopActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        // 初始状?        ...initialState,

        // 用户相关操作
        setUser: userData =>
          set(state => {
            state.user = { ...state.user, ...userData };
          }),

        login: userData =>
          set(state => {
            state.user = {
              ...state.user,
              ...userData,
              isLoggedIn: true,
              role: userData.role || 'user',
            };
          }),

        logout: () =>
          set(state => {
            state.user = initialState.user;
            state.notifications.list = [];
            state.notifications.unreadCount = 0;
          }),

        // 维修店相关操?        setShops: shops =>
          set(state => {
            state.shops.list = shops;
            state.shops.loading = false;
            state.shops.error = null;
          }),

        setLoading: loading =>
          set(state => {
            state.shops.loading = loading;
          }),

        setError: error =>
          set(state => {
            state.shops.error = error;
            state.shops.loading = false;
          }),

        setFilters: filters =>
          set(state => {
            state.shops.filters = { ...state.shops.filters, ...filters };
          }),

        setPagination: pagination =>
          set(state => {
            state.shops.pagination = {
              ...state.shops.pagination,
              ...pagination,
            };
          }),

        loadShops: async (page = 1, customFilters = {}) => {
          set(state => {
            state.shops.loading = true;
            state.shops.error = null;
          });

          try {
            const currentState = get();
            const filters = { ...currentState.shops.filters, ...customFilters };

            // 模拟API调用
            const response = await fetch('/api/repair-shop/shops', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ page, filters }),
            });

            if (!response.ok) throw new Error('Failed to load shops');

            const data = await response.json();

            set(state => {
              state.shops.list = data.shops;
              state.shops.pagination = data.pagination;
              state.shops.loading = false;
              state.performance.lastUpdated = new Date();
              state.performance.apiCalls += 1;
            });
          } catch (error) {
            set(state => {
              state.shops.error =
                error instanceof Error ? error.message : 'Unknown error';
              state.shops.loading = false;
            });
          }
        },

        // 通知相关操作
        setNotifications: notifications =>
          set(state => {
            state.notifications.list = notifications;
            state.notifications.unreadCount = notifications.filter(
              n => !n.read
            ).length;
          }),

        addNotification: notification =>
          set(state => {
            state.notifications.list.unshift(notification);
            if (!notification.read) {
              state.notifications.unreadCount += 1;
            }
          }),

        markAsRead: id =>
          set(state => {
            const notification = state.notifications.list.find(
              n => n.id === id
            );
            if (notification && !notification.read) {
              notification.read = true;
              state.notifications.unreadCount -= 1;
            }
          }),

        clearNotifications: () =>
          set(state => {
            state.notifications.list = [];
            state.notifications.unreadCount = 0;
          }),

        // 搜索相关操作
        setSearchQuery: query =>
          set(state => {
            state.search.query = query;
          }),

        setSearchResults: results =>
          set(state => {
            state.search.results = results;
            state.search.loading = false;
          }),

        addToSearchHistory: query =>
          set(state => {
            if (query && !state.search.history.includes(query)) {
              state.search.history.unshift(query);
              if (state.search.history.length > 10) {
                state.search.history.pop();
              }
            }
          }),

        clearSearchHistory: () =>
          set(state => {
            state.search.history = [];
          }),

        loadSearchSuggestions: async query => {
          if (!query.trim()) return;

          set(state => {
            state.search.loading = true;
          });

          try {
            const response = await fetch(
              `/api/search/suggestions?q=${encodeURIComponent(query)}`
            );
            if (response.ok) {
              const suggestions = await response.json();
              set(state => {
                state.search.suggestions = suggestions;
                state.search.loading = false;
              });
            }
          } catch (error) {
            set(state => {
              state.search.loading = false;
            });
          }
        },

        // UI相关操作
        toggleSidebar: () =>
          set(state => {
            state.ui.sidebarOpen = !state.ui.sidebarOpen;
          }),

        toggleMobileMenu: () =>
          set(state => {
            state.ui.mobileMenuOpen = !state.ui.mobileMenuOpen;
          }),

        setTheme: theme =>
          set(state => {
            state.ui.theme = theme;
          }),

        setLanguage: language =>
          set(state => {
            state.ui.language = language;
          }),

        // 性能相关操作
        incrementApiCalls: () =>
          set(state => {
            state.performance.apiCalls += 1;
          }),

        incrementCacheHits: () =>
          set(state => {
            state.performance.cacheHits += 1;
          }),

        setLoadTime: time =>
          set(state => {
            state.performance.loadTime = time;
          }),

        resetPerformance: () =>
          set(state => {
            state.performance = initialState.performance;
          }),

        // 重置操作
        reset: () => set(initialState),
      })),
      {
        name: 'repair-shop-storage',
        partialize: state => ({
          user: state.user,
          ui: state.ui,
          search: {
            history: state.search.history,
          },
        }),
      }
    ),
    {
      name: 'RepairShopStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// 选择器Hook - 用于性能优化
export const useUser = () => useRepairShopStore(state => state.user);
export const useShops = () => useRepairShopStore(state => state.shops);
export const useNotifications = () =>
  useRepairShopStore(state => state.notifications);
export const useSearch = () => useRepairShopStore(state => state.search);
export const useUI = () => useRepairShopStore(state => state.ui);
export const usePerformance = () =>
  useRepairShopStore(state => state.performance);

// Action选择?export const useShopActions = () =>
  useRepairShopStore(state => ({
    setShops: state.setShops,
    setLoading: state.setLoading,
    setError: state.setError,
    setFilters: state.setFilters,
    setPagination: state.setPagination,
    loadShops: state.loadShops,
  }));

export const useUserActions = () =>
  useRepairShopStore(state => ({
    setUser: state.setUser,
    login: state.login,
    logout: state.logout,
  }));

export const useNotificationActions = () =>
  useRepairShopStore(state => ({
    setNotifications: state.setNotifications,
    addNotification: state.addNotification,
    markAsRead: state.markAsRead,
    clearNotifications: state.clearNotifications,
  }));

export const useSearchActions = () =>
  useRepairShopStore(state => ({
    setSearchQuery: state.setSearchQuery,
    setSearchResults: state.setSearchResults,
    addToSearchHistory: state.addToSearchHistory,
    clearSearchHistory: state.clearSearchHistory,
    loadSearchSuggestions: state.loadSearchSuggestions,
  }));

export const useUIActions = () =>
  useRepairShopStore(state => ({
    toggleSidebar: state.toggleSidebar,
    toggleMobileMenu: state.toggleMobileMenu,
    setTheme: state.setTheme,
    setLanguage: state.setLanguage,
  }));
