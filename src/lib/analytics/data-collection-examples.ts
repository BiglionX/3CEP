/**
 * FixCycle 6.0 数据收集 SDK 使用示例
 * Data Collection SDK Usage Examples
 */

'use client';

import { useEffect } from 'react';
import { createDataCollector } from '@/lib/analytics/data-collection-sdk';

// ==================== 示例 1: 基础初始化 ====================

/**
 * 在应用入口处初始化数据收集器
 * 通常放在 app/layout.tsx 或 pages/_app.tsx
 */
export function initializeAnalytics() {
  const collector = createDataCollector({
    appId: process.env.NEXT_PUBLIC_ANALYTICS_APP_ID || 'default-app',
    environment: process.env.NODE_ENV || 'development',
    apiEndpoint: '/api/analytics/collect',

    // 可选配置
    batchSize: 50,              // 批量上报大小
    flushInterval: 30000,       // 30 秒上报一次
    debug: process.env.NODE_ENV === 'development',
    sampleRate: 1.0,            // 100% 采样

    // 自动追踪功能
    autoTrackPageviews: true,   // 自动追踪页面浏览
    autoTrackClicks: true,      // 自动追踪点击（需要 data-track 属性）
    autoTrackPerformance: true, // 自动追踪性能指标
  });

  return collector;
}

// ==================== 示例 2: React 组件集成 ====================

/**
 * 在 React 组件中使用
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 初始化
    const collector = initializeAnalytics();

    // 设置用户 ID（如果已登录）
    const userId = getCurrentUserId(); // 从你的认证系统获取
    if (userId) {
      collector.setUserId(userId);
    }

    // 清理函数
    return () => {
      collector.destroy();
    };
  }, []);

  return <>{children}</>;
}

// ==================== 示例 3: 自定义事件追踪 ====================

/**
 * 追踪自定义事件
 */
export function trackCustomEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  const collector = createDataCollector({
    appId: 'default-app',
    environment: process.env.NODE_ENV || 'development',
    apiEndpoint: '/api/analytics/collect',
  });

  collector.track(eventName, properties);
}

/**
 * 示例：追踪按钮点击
 */
export function handleButtonClick(buttonName: string, context?: Record<string, any>) {
  trackCustomEvent('button_click', {
    button_name: buttonName,
    page_path: window.location.pathname,
    ...context,
  });
}

/**
 * 示例：追踪表单提交
 */
export function handleFormSubmit(formName: string, success: boolean, duration?: number) {
  trackCustomEvent('form_submit', {
    form_name: formName,
    success,
    duration_ms: duration,
    page_path: window.location.pathname,
  });
}

// ==================== 示例 4: HTML data-track 属性 ====================

/**
 * 使用 data-track 属性自动追踪点击
 *
 * 示例 JSX:
 *
 * <button
 *   data-track="add_to_cart"
 *   data-track-data='{"product_id": "123", "price": 99.99}'
 * >
 *   加入购物车
 * </button>
 *
 * <a
 *   href="/products/123"
 *   data-track="product_view"
 *   data-track-data='{"product_id": "123"}'
 * >
 *   查看详情
 * </a>
 */

// ==================== 示例 5: 错误追踪 ====================

/**
 * 手动追踪错误
 */
export function trackError(error: Error, context?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  const collector = createDataCollector({
    appId: 'default-app',
    environment: process.env.NODE_ENV || 'development',
    apiEndpoint: '/api/analytics/collect',
  });

  collector.trackError(error, {
    component: context?.component,
    action: context?.action,
    user_id: context?.userId,
  });
}

/**
 * 示例：在 async 函数中捕获错误
 */
export async function safeAsyncOperation<T>(
  operation: () => Promise<T>,
  context: Record<string, any>
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    trackError(error instanceof Error ? error : new Error(String(error)), context);
    return null;
  }
}

// ==================== 示例 6: 性能指标追踪 ====================

/**
 * 追踪自定义性能指标
 */
export function trackApiPerformance(
  endpoint: string,
  method: string,
  duration: number,
  success: boolean
) {
  if (typeof window === 'undefined') return;

  const collector = createDataCollector({
    appId: 'default-app',
    environment: process.env.NODE_ENV || 'development',
    apiEndpoint: '/api/analytics/collect',
  });

  collector.trackPerformance({
    apiResponseTime: duration,
  });

  collector.track('api_request', {
    endpoint,
    method,
    duration,
    success,
  });
}

// ==================== 示例 7: 页面浏览追踪（SPA） ====================

/**
 * 在 Next.js App Router 中追踪路由变化
 *
 * 注意：SDK 已经自动处理了 history.pushState 和 popstate 事件
 * 如果需要额外逻辑，可以手动调用
 */
export function trackPageView(url?: string, title?: string) {
  if (typeof window === 'undefined') return;

  const collector = createDataCollector({
    appId: 'default-app',
    environment: process.env.NODE_ENV || 'development',
    apiEndpoint: '/api/analytics/collect',
  });

  collector.trackPageview(url, title);
}

// ==================== 示例 8: 用户认证集成 ====================

/**
 * 用户登录后设置用户 ID
 */
export function onUserLogin(userId: string) {
  if (typeof window === 'undefined') return;

  const collector = createDataCollector({
    appId: 'default-app',
    environment: process.env.NODE_ENV || 'development',
    apiEndpoint: '/api/analytics/collect',
  });

  collector.setUserId(userId);

  // 追踪登录事件
  collector.track('user_login', {
    login_time: new Date().toISOString(),
  });
}

/**
 * 用户登出时清除用户 ID
 */
export function onUserLogout() {
  if (typeof window === 'undefined') return;

  const collector = createDataCollector({
    appId: 'default-app',
    environment: process.env.NODE_ENV || 'development',
    apiEndpoint: '/api/analytics/collect',
  });

  // 追踪登出事件
  collector.track('user_logout', {
    logout_time: new Date().toISOString(),
  });

  // 清除用户 ID
  collector.clearUserId();
}

// ==================== 示例 9: A/B 测试追踪 ====================

/**
 * 追踪 A/B 测试曝光
 */
export function trackABTestExposure(
  experimentId: string,
  variant: string,
  metadata?: Record<string, any>
) {
  trackCustomEvent('ab_test_exposure', {
    experiment_id: experimentId,
    variant,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
}

/**
 * 追踪 A/B 测试转化
 */
export function trackABTestConversion(
  experimentId: string,
  goal: string,
  value?: number
) {
  trackCustomEvent('ab_test_conversion', {
    experiment_id: experimentId,
    goal,
    value,
  });
}

// ==================== 示例 10: 电商事件追踪 ====================

/**
 * 追踪商品浏览
 */
export function trackProductView(product: {
  id: string;
  name: string;
  price: number;
  category: string;
}) {
  trackCustomEvent('product_view', {
    product_id: product.id,
    product_name: product.name,
    price: product.price,
    category: product.category,
  });
}

/**
 * 追踪加入购物车
 */
export function trackAddToCart(product: {
  id: string;
  name: string;
  price: number;
  quantity: number;
}) {
  trackCustomEvent('add_to_cart', {
    product_id: product.id,
    product_name: product.name,
    price: product.price,
    quantity: product.quantity,
  });
}

/**
 * 追踪开始结账
 */
export function trackCheckoutStart(cart: {
  items: Array<{ id: string; quantity: number }>;
  total: number;
}) {
  trackCustomEvent('checkout_start', {
    item_count: cart.items.length,
    total_value: cart.total,
    items: cart.items,
  });
}

/**
 * 追踪购买完成
 */
export function trackPurchase(order: {
  orderId: string;
  total: number;
  items: Array<{ id: string; quantity: number; price: number }>;
}) {
  trackCustomEvent('purchase', {
    order_id: order.orderId,
    total_value: order.total,
    item_count: order.items.length,
    items: order.items,
  });
}

// ==================== 最佳实践建议 ====================

/**
 * 1. 尽早初始化：在应用启动时就初始化数据收集器
 * 2. 统一命名：事件名称使用 snake_case 格式
 * 3. 结构化数据：properties 使用清晰的键名
 * 4. 避免敏感信息：不要上传个人身份信息（PII）
 * 5. 合理采样：高流量应用可以降低采样率
 * 6. 测试验证：在开发环境充分测试后再上线
 * 7. 性能优先：SDK 设计为非阻塞异步，不影响用户体验
 * 8. 错误处理：捕获并记录关键错误
 */

// 辅助函数示例
function getCurrentUserId(): string | null {
  // 从你的认证系统获取用户 ID
  // 例如：从 localStorage、Cookie 或全局状态
  if (typeof window !== 'undefined') {
    return localStorage.getItem('user_id');
  }
  return null;
}
