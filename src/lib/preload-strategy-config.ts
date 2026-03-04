// 预加载策略配?// 定义不同页面和场景下的资源预加载策略

import { PreloadResource } from './critical-resource-preloader';

// 页面类型枚举
export enum PageType {
  HOME = 'home',
  PRODUCT = 'product',
  CATEGORY = 'category',
  USER_PROFILE = 'user_profile',
  SEARCH = 'search',
}

// 用户意图枚举
export enum UserIntent {
  BROWSING = 'browsing',
  PURCHASING = 'purchasing',
  RESEARCHING = 'researching',
  COMPARING = 'comparing',
}

// 预加载策略配?export interface PreloadStrategy {
  pageType: PageType;
  userIntent: UserIntent;
  resources: PreloadResource[];
  priority: 'high' | 'medium' | 'low';
  conditions?: {
    deviceClass?: ('desktop' | 'mobile' | 'tablet')[];
    networkType?: ('4g' | '3g' | '2g' | 'slow-2g')[];
    timeOfDay?: { start: number; end: number }; // 小时?0-23
    userSegment?: string[]; // 用户分群标识
  };
}

// 首页预加载策?export const HOME_PAGE_STRATEGIES: PreloadStrategy[] = [
  {
    pageType: PageType.HOME,
    userIntent: UserIntent.BROWSING,
    priority: 'high',
    resources: [
      {
        url: '/api/products/popular',
        type: 'fetch',
        priority: 'high',
      },
      {
        url: '/api/categories/featured',
        type: 'fetch',
        priority: 'high',
      },
      {
        url: '/fonts/main-font.woff2',
        type: 'font',
        priority: 'high',
        crossorigin: true,
      },
    ],
    conditions: {
      deviceClass: ['desktop', 'tablet'],
      networkType: ['4g'],
    },
  },
  {
    pageType: PageType.HOME,
    userIntent: UserIntent.BROWSING,
    priority: 'medium',
    resources: [
      {
        url: '/api/recommendations/personalized',
        type: 'fetch',
        priority: 'medium',
      },
      {
        url: '/images/hero-banner.webp',
        type: 'image',
        priority: 'medium',
      },
    ],
  },
];

// 商品详情页预加载策略
export const PRODUCT_PAGE_STRATEGIES: PreloadStrategy[] = [
  {
    pageType: PageType.PRODUCT,
    userIntent: UserIntent.RESEARCHING,
    priority: 'high',
    resources: [
      {
        url: '/api/products/{productId}/reviews',
        type: 'fetch',
        priority: 'high',
      },
      {
        url: '/api/products/{productId}/related',
        type: 'fetch',
        priority: 'high',
      },
      {
        url: '/api/pricing/compare',
        type: 'fetch',
        priority: 'high',
      },
    ],
  },
  {
    pageType: PageType.PRODUCT,
    userIntent: UserIntent.PURCHASING,
    priority: 'high',
    resources: [
      {
        url: '/api/cart/add',
        type: 'fetch',
        priority: 'high',
      },
      {
        url: '/api/checkout/initiate',
        type: 'fetch',
        priority: 'high',
      },
    ],
  },
];

// 分类页面预加载策?export const CATEGORY_PAGE_STRATEGIES: PreloadStrategy[] = [
  {
    pageType: PageType.CATEGORY,
    userIntent: UserIntent.BROWSING,
    priority: 'high',
    resources: [
      {
        url: '/api/products/category/{categoryId}?page=2',
        type: 'fetch',
        priority: 'high',
      },
      {
        url: '/api/filters/category/{categoryId}',
        type: 'fetch',
        priority: 'high',
      },
    ],
  },
];

// 搜索页面预加载策?export const SEARCH_PAGE_STRATEGIES: PreloadStrategy[] = [
  {
    pageType: PageType.SEARCH,
    userIntent: UserIntent.COMPARING,
    priority: 'high',
    resources: [
      {
        url: '/api/search/suggestions',
        type: 'fetch',
        priority: 'high',
      },
      {
        url: '/api/search/filters',
        type: 'fetch',
        priority: 'high',
      },
    ],
  },
];

// 所有策略集?export const ALL_PRELOAD_STRATEGIES: PreloadStrategy[] = [
  ...HOME_PAGE_STRATEGIES,
  ...PRODUCT_PAGE_STRATEGIES,
  ...CATEGORY_PAGE_STRATEGIES,
  ...SEARCH_PAGE_STRATEGIES,
];

// 策略匹配?export class StrategyMatcher {
  static matchStrategies(
    pageType: PageType,
    userIntent: UserIntent,
    deviceClass: 'desktop' | 'mobile' | 'tablet',
    networkType: '4g' | '3g' | '2g' | 'slow-2g'
  ): PreloadStrategy[] {
    return ALL_PRELOAD_STRATEGIES.filter(strategy => {
      // 基本匹配
      if (
        strategy.pageType !== pageType ||
        strategy.userIntent !== userIntent
      ) {
        return false;
      }

      // 条件匹配
      const conditions = strategy.conditions;
      if (!conditions) return true;

      // 设备类型匹配
      if (
        conditions.deviceClass &&
        !conditions.deviceClass.includes(deviceClass)
      ) {
        return false;
      }

      // 网络类型匹配
      if (
        conditions.networkType &&
        !conditions.networkType.includes(networkType)
      ) {
        return false;
      }

      // 时间段匹配（如果需要的话）
      if (conditions.timeOfDay) {
        const currentHour = new Date().getHours();
        if (
          currentHour < conditions.timeOfDay.start ||
          currentHour > conditions.timeOfDay.end
        ) {
          return false;
        }
      }

      return true;
    });
  }

  // 获取特定页面的所有策?  static getPageStrategies(pageType: PageType): PreloadStrategy[] {
    return ALL_PRELOAD_STRATEGIES.filter(
      strategy => strategy.pageType === pageType
    );
  }

  // 获取特定用户意图的所有策?  static getIntentStrategies(userIntent: UserIntent): PreloadStrategy[] {
    return ALL_PRELOAD_STRATEGIES.filter(
      strategy => strategy.userIntent === userIntent
    );
  }
}

// 动态资源替换工?export class ResourcePlaceholderReplacer {
  static replacePlaceholders(
    resources: PreloadResource[],
    placeholders: Record<string, string>
  ): PreloadResource[] {
    return resources.map(resource => ({
      ...resource,
      url: Object.keys(placeholders).reduce(
        (url, placeholder) =>
          url.replace(`{${placeholder}}`, placeholders[placeholder]),
        resource.url
      ),
    }));
  }
}

// 预加载优先级计算?export class PriorityCalculator {
  static calculatePriority(
    basePriority: 'high' | 'medium' | 'low',
    factors: {
      isReturningUser?: boolean;
      hasHighEngagement?: boolean;
      isPeakTime?: boolean;
      devicePerformance?: 'high' | 'medium' | 'low';
    }
  ): 'high' | 'medium' | 'low' {
    let priorityScore = { high: 3, medium: 2, low: 1 }[basePriority];

    // 返回用户加权
    if (factors.isReturningUser) priorityScore += 0.5;

    // 高参与度加权
    if (factors.hasHighEngagement) priorityScore += 0.3;

    // 高峰时段加权
    if (factors.isPeakTime) priorityScore += 0.2;

    // 设备性能调整
    if (factors.devicePerformance === 'low') priorityScore -= 0.5;
    if (factors.devicePerformance === 'high') priorityScore += 0.2;

    // 确保在有效范围内
    priorityScore = Math.max(1, Math.min(3, priorityScore));

    const priorityMap = { 3: 'high', 2: 'medium', 1: 'low' };
    return priorityMap[priorityScore as 1 | 2 | 3];
  }
}
