/**
 * 路由懒加载配? * 配置Next.js应用路由的懒加载策略
 */

import React from 'react';
import { lazyLoadingManager } from './lazy-loading-manager';

// 路由配置类型
interface RouteConfig {
  path: string;
  component: string;
  preloadPriority: 'high' | 'medium' | 'low';
  preloadCondition?: () => boolean;
  prefetchOnHover?: boolean;
}

// 页面组件映射
const PAGE_COMPONENTS = {
  // 主要页面
  home: () => import('@/app/page'),
  dashboard: () => import('@/app/dashboard/page'),
  profile: () => import('@/app/profile/page'),
  'profile-settings': () => import('@/app/profile/settings/page'),

  // 业务模块页面
  'procurement-intelligence': () =>
    import('@/app/procurement-intelligence/page'),
  'repair-shop': () => import('@/app/repair-shop/page'),
  'parts-market': () => import('@/app/parts-market/page'),
  diagnosis: () => import('@/app/diagnosis/page'),

  // 管理后台
  admin: () => import('@/app/admin/page'),
  'admin-dashboard': () => import('@/app/admin/dashboard/page'),
  'admin-users': () => import('@/app/admin/user-manager/page'),
  'admin-settings': () => import('@/app/admin/settings/page'),
  'admin-performance': () => import('@/app/admin/performance/page'),

  // 企业版功?  enterprise: () => import('@/app/enterprise/page'),
  'enterprise-dashboard': () => import('@/app/enterprise/dashboard/page'),
  'enterprise-procurement': () => import('@/app/enterprise/procurement/page'),
  'enterprise-supply-chain': () => import('@/app/enterprise/supply-chain/page'),

  // 数据中心
  'data-center': () => import('@/app/data-center/page'),

  // 登录注册
  login: () => import('@/app/login/page'),
  register: () => import('@/app/register/page'),

  // 帮助中心
  help: () => import('@/app/help/page'),
  faq: () => import('@/app/faq/page'),
  about: () => import('@/app/about/page'),
} as const;

// 路由预加载策?const ROUTE_PRELOAD_CONFIG: RouteConfig[] = [
  {
    path: '/',
    component: 'home',
    preloadPriority: 'high',
    preloadCondition: () => true,
  },
  {
    path: '/dashboard',
    component: 'dashboard',
    preloadPriority: 'high',
    preloadCondition: () => !!localStorage.getItem('auth-token'),
  },
  {
    path: '/procurement',
    component: 'procurement',
    preloadPriority: 'medium',
    preloadCondition: () => !!localStorage.getItem('auth-token'),
  },
  {
    path: '/inventory',
    component: 'inventory',
    preloadPriority: 'medium',
    preloadCondition: () => !!localStorage.getItem('auth-token'),
  },
  {
    path: '/analytics',
    component: 'analytics',
    preloadPriority: 'medium',
    preloadCondition: () => !!localStorage.getItem('auth-token'),
  },
  {
    path: '/admin',
    component: 'admin',
    preloadPriority: 'low',
    preloadCondition: () => {
      const role = localStorage.getItem('user-role');
      return role === 'admin' || role === 'super_admin';
    },
  },
  {
    path: '/enterprise',
    component: 'enterprise',
    preloadPriority: 'medium',
    preloadCondition: () => {
      const plan = localStorage.getItem('subscription-plan');
      return plan === 'enterprise' || plan === 'premium';
    },
  },
];

class RouteLazyLoader {
  private routeConfigs: Map<string, RouteConfig>;
  private prefetchTimers: Map<string, NodeJS.Timeout>;

  constructor() {
    this.routeConfigs = new Map();
    this.prefetchTimers = new Map();
    this.initializeRouteConfigs();
  }

  /**
   * 初始化路由配?   */
  private initializeRouteConfigs(): void {
    ROUTE_PRELOAD_CONFIG.forEach(config => {
      this.routeConfigs.set(config.path, config);

      // 注册到懒加载管理?      const loader =
        PAGE_COMPONENTS[config.component as keyof typeof PAGE_COMPONENTS];
      if (loader && typeof loader === 'function') {
        lazyLoadingManager.registerComponent({
          loader,
          name: config.component,
          preloadCondition: config.preloadCondition,
          priority: config.preloadPriority,
        });
      }
    });
  }

  /**
   * 获取路由懒加载组?   */
  getLazyRoute(path: string) {
    const config = this.routeConfigs.get(path);
    if (!config) {
      throw new Error(`Route ${path} not configured for lazy loading`);
    }

    const loader =
      PAGE_COMPONENTS[config.component as keyof typeof PAGE_COMPONENTS];
    if (!loader) {
      throw new Error(`Component ${config.component} not found`);
    }

    return lazyLoadingManager.createLazyComponent(loader, config.component, {
      priority: config.preloadPriority,
    });
  }

  /**
   * 预加载路由组?   */
  async prefetchRoute(path: string): Promise<void> {
    const config = this.routeConfigs.get(path);
    if (!config || (config.preloadCondition && !config.preloadCondition())) {
      return;
    }

    try {
      await lazyLoadingManager.preloadComponent(config.component);
      console.log(`�?Prefetched route: ${path}`);
    } catch (error) {
      console.warn(`�?Failed to prefetch route ${path}:`, error);
    }
  }

  /**
   * 批量预加载路?   */
  async prefetchRoutes(paths: string[]): Promise<void> {
    const validPaths = paths.filter(path => this.routeConfigs.has(path));
    const components = validPaths.map(path => {
      const config = this.routeConfigs.get(path)!;
      return config.component;
    });

    await lazyLoadingManager.preloadComponents(components);
  }

  /**
   * 基于用户行为的智能预加载
   */
  setupIntelligentPrefetch(): void {
    if (typeof window === 'undefined') return;

    // 监听鼠标悬停预加?    document.addEventListener('mouseover', event => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]');

      if (link) {
        const href = link.getAttribute('href');
        if (href && this.routeConfigs.has(href)) {
          this.schedulePrefetch(href, 100); // 100ms延迟
        }
      }
    });

    // 监听键盘导航预加?    document.addEventListener('focusin', event => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'A') {
        const href = target.getAttribute('href');
        if (href && this.routeConfigs.has(href)) {
          this.schedulePrefetch(href, 50); // 50ms延迟
        }
      }
    });

    // 基于滚动位置的预加载
    let scrollTimer: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        this.preloadVisibleLinks();
      }, 200);
    });
  }

  /**
   * 预加载可见区域内的链?   */
  private async preloadVisibleLinks(): Promise<void> {
    if (typeof document === 'undefined') return;

    const links = document.querySelectorAll('a[href]');
    const visibleLinks: string[] = [];

    links.forEach(link => {
      const href = link.getAttribute('href');
      const config = href ? this.routeConfigs.get(href) : null;

      if (config && this.isElementInViewport(link as HTMLElement)) {
        visibleLinks.push(href!);
      }
    });

    if (visibleLinks.length > 0) {
      await this.prefetchRoutes(visibleLinks);
    }
  }

  /**
   * 检查元素是否在视口?   */
  private isElementInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * 调度预加载任?   */
  private schedulePrefetch(path: string, delay: number): void {
    // 清除之前的定时器
    if (this.prefetchTimers.has(path)) {
      clearTimeout(this.prefetchTimers.get(path)!);
    }

    // 设置新的预加载定时器
    const timer = setTimeout(() => {
      this.prefetchRoute(path);
      this.prefetchTimers.delete(path);
    }, delay);

    this.prefetchTimers.set(path, timer);
  }

  /**
   * 获取路由预加载统?   */
  getPrefetchStats(): {
    totalRoutes: number;
    configuredRoutes: number;
    prefetchEnabled: boolean;
  } {
    return {
      totalRoutes: Object.keys(PAGE_COMPONENTS).length,
      configuredRoutes: this.routeConfigs.size,
      prefetchEnabled: typeof window !== 'undefined',
    };
  }

  /**
   * 清除预加载定时器
   */
  clearPrefetchTimers(): void {
    this.prefetchTimers.forEach(timer => clearTimeout(timer));
    this.prefetchTimers.clear();
  }
}

// 创建全局路由懒加载实?export const routeLazyLoader = new RouteLazyLoader();

// Next.js中间件配置示?export const nextConfig = {
  // 启用webpack 5的懒加载优化
  webpack: (config: any) => {
    // 代码分割配置
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: -10,
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          priority: -5,
          chunks: 'all',
        },
      },
    };

    return config;
  },

  // 实验性特?  experimental: {
    // 启用React Server Components
    serverComponents: true,
    // 启用并发特?    concurrentFeatures: true,
  },

  // 图片优化
  images: {
    domains: ['localhost', 'your-domain.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

// 使用示例Hook
export function useRouterPrefetch() {
  const prefetch = React.useCallback((path: string) => {
    routeLazyLoader.prefetchRoute(path);
  }, []);

  React.useEffect(() => {
    // 组件挂载时启动智能预加载
    routeLazyLoader.setupIntelligentPrefetch();

    return () => {
      // 组件卸载时清理定时器
      routeLazyLoader.clearPrefetchTimers();
    };
  }, []);

  return { prefetch };
}
