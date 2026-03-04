# Phase 1: PWA 优化实施指南

> 🎯 当前阶段：最大化利用 Next.js，快速提供移动端能力

**时间周期**: 当前 - 3 个月  
**目标**: 无需开发独立 App 即可服务大部分移动端用户

---

## 📋 阶段目标

### 核心指标

- ✅ Lighthouse PWA 评分 ≥ 90
- ✅ 首屏加载时间 < 3 秒
- ✅ 离线功能正常可用
- ✅ 安装转化率 > 20%
- ✅ 移动端用户占比达到 30%+

### 技术目标

1. 完善 Service Worker 缓存策略
2. 实现完整的离线数据同步
3. 优化移动端用户体验
4. 集成性能监控系统

---

## ✅ 任务清单

### 1. Service Worker 优化

#### 1.1 智能缓存策略

**相关文件**:

- `src/lib/pwa/service-worker.ts`
- `src/lib/pwa/cache-strategies.ts`

**实施步骤**:

##### Step 1: 静态资源缓存

```typescript
// src/lib/pwa/cache-strategies.ts

// 缓存优先策略 - 适用于静态资源
export async function cacheFirst(request: Request, cacheName: string) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  // 缓存未命中，从网络获取
  const networkResponse = await fetch(request);

  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }

  return networkResponse;
}

// 网络优先策略 - 适用于 API 请求
export async function networkFirst(request: Request, cacheName: string) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // 网络失败，从缓存读取
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // 返回离线回退页面
    return new Response('Offline', { status: 503 });
  }
}
```

##### Step 2: API 响应缓存

```typescript
// src/lib/pwa/api-cache.ts

const CACHE_NAME = 'api-cache-v1';
const CACHE_DURATION = 5 * 60 * 1000; // 5 分钟

export async function cacheApiResponse(
  request: Request
): Promise<Response | null> {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    const cachedTime = new Date(
      cachedResponse.headers.get('x-cached-time') || 0
    ).getTime();
    const now = Date.now();

    // 检查缓存是否过期
    if (now - cachedTime < CACHE_DURATION) {
      return cachedResponse;
    }

    // 缓存已过期，删除旧缓存
    await cache.delete(request);
  }

  return null;
}

export async function storeApiResponse(
  request: Request,
  response: Response
): Promise<void> {
  const cache = await caches.open(CACHE_NAME);
  const responseWithTime = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: new Headers({
      ...Object.fromEntries(response.headers.entries()),
      'x-cached-time': new Date().toISOString(),
    }),
  });

  await cache.put(request, responseWithTime);
}
```

##### Step 3: 离线队列实现

```typescript
// src/lib/pwa/offline-queue.ts

interface OfflineRequest {
  url: string;
  method: string;
  body?: any;
  timestamp: number;
  retryCount: number;
}

class OfflineQueue {
  private queue: OfflineRequest[] = [];
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 5000; // 5 秒

  constructor() {
    this.loadQueue();
    this.startSyncWorker();
  }

  async addRequest(request: OfflineRequest): Promise<void> {
    this.queue.push({
      ...request,
      timestamp: Date.now(),
      retryCount: 0,
    });
    await this.saveQueue();
  }

  private async loadQueue(): Promise<void> {
    const stored = localStorage.getItem('offline-queue');
    if (stored) {
      this.queue = JSON.parse(stored);
    }
  }

  private async saveQueue(): Promise<void> {
    localStorage.setItem('offline-queue', JSON.stringify(this.queue));
  }

  private startSyncWorker(): void {
    setInterval(() => this.syncQueue(), this.RETRY_DELAY);
  }

  private async syncQueue(): Promise<void> {
    if (!navigator.onLine || this.queue.length === 0) {
      return;
    }

    const failedRequests: OfflineRequest[] = [];

    for (const request of this.queue) {
      if (request.retryCount >= this.MAX_RETRIES) {
        console.error('Max retries exceeded for:', request.url);
        continue;
      }

      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: { 'Content-Type': 'application/json' },
          body: request.body ? JSON.stringify(request.body) : undefined,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        // 同步成功，触发事件通知
        window.dispatchEvent(
          new CustomEvent('sync-success', { detail: request })
        );
      } catch (error) {
        console.error('Sync failed:', error);
        failedRequests.push({
          ...request,
          retryCount: request.retryCount + 1,
        });
      }
    }

    this.queue = failedRequests;
    await this.saveQueue();
  }

  getQueueLength(): number {
    return this.queue.length;
  }
}

export const offlineQueue = new OfflineQueue();
```

---

#### 1.2 后台数据同步

**相关文件**:

- `src/lib/pwa/background-sync.ts`

**实施步骤**:

##### Step 1: Background Sync API 封装

```typescript
// src/lib/pwa/background-sync.ts

export class BackgroundSyncManager {
  private syncTag = 'background-sync';
  private swRegistration: ServiceWorkerRegistration | null = null;

  async register(): Promise<void> {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      this.swRegistration = await navigator.serviceWorker.ready;
      await this.swRegistration.sync.register(this.syncTag);
    }
  }

  async scheduleSync(data: {
    endpoint: string;
    method: string;
    body: any;
  }): Promise<void> {
    // 存储同步任务到 IndexedDB
    const db = await this.openDB();
    const transaction = db.transaction(['sync-tasks'], 'readwrite');
    const store = transaction.objectStore('sync-tasks');

    await store.add({
      ...data,
      createdAt: Date.now(),
      status: 'pending',
    });

    // 尝试立即同步
    if (navigator.onLine) {
      await this.performSync();
    } else {
      // 离线时注册后台同步
      await this.register();
    }
  }

  private async performSync(): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction(['sync-tasks'], 'readwrite');
    const store = transaction.objectStore('sync-tasks');
    const tasks = await this.getAll(store);

    for (const task of tasks) {
      try {
        const response = await fetch(task.endpoint, {
          method: task.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task.body),
        });

        if (response.ok) {
          await store.delete(task.id);
          this.notifySuccess(task);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error('Sync failed:', error);
        this.notifyFailure(task, error);
      }
    }
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('background-sync-db', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('sync-tasks')) {
          db.createObjectStore('sync-tasks', {
            keyPath: 'id',
            autoIncrement: true,
          });
        }
      };
    });
  }

  private async getAll(store: IDBObjectStore): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  private notifySuccess(task: any): void {
    window.dispatchEvent(new CustomEvent('sync-success', { detail: task }));
  }

  private notifyFailure(task: any, error: any): void {
    window.dispatchEvent(
      new CustomEvent('sync-failure', { detail: { task, error } })
    );
  }
}

export const backgroundSync = new BackgroundSyncManager();
```

---

### 2. 移动端 UX 优化

#### 2.1 手势交互优化

**相关文件**:

- `src/hooks/use-gestures.ts`
- `src/components/mobile-responsive.tsx`

##### Step 1: 滑动返回手势

```typescript
// src/hooks/useSwipeGesture.ts

import { useState, useEffect } from 'react';

interface SwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function useSwipeGesture(options: SwipeGestureOptions) {
  const { onSwipeLeft, onSwipeRight, threshold = 100 } = options;
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }

    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
```

##### Step 2: 下拉刷新

```typescript
// src/hooks/usePullToRefresh.ts

import { useState, useEffect, useCallback } from 'react';

export function usePullToRefresh(
  onRefresh: () => Promise<void>,
  threshold: number = 100
) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState<number | null>(null);

  const onTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  }, []);

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (startY === null) return;

      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startY);

      if (distance > 0 && window.scrollY === 0) {
        e.preventDefault();
        setPullDistance(distance * 0.5); // 阻力效果
      }
    },
    [startY]
  );

  const onTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setPullDistance(0);
    setStartY(null);
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  useEffect(() => {
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [onTouchStart, onTouchMove, onTouchEnd]);

  return {
    pullDistance,
    isRefreshing,
  };
}
```

---

#### 2.2 加载优化

##### Step 1: 骨架屏组件

```typescript
// src/components/ui/Skeleton.tsx

'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded bg-gray-200',
        variant === 'circular' && 'rounded-full',
        className
      )}
      style={{ width, height }}
    />
  );
}

// 使用示例
export function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton variant="circular" width={40} height={40} />
      <Skeleton variant="rectangular" height={100} />
      <div className="space-y-2">
        <Skeleton height={20} />
        <Skeleton height={20} width="80%" />
      </div>
    </div>
  );
}
```

---

### 3. 安装引导优化

#### 3.1 安装提示组件

**相关文件**:

- `src/components/pwa/InstallPrompt.tsx`

```typescript
// src/components/pwa/InstallPrompt.tsx

'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);

      // 延迟显示安装提示，提升用户体验
      setTimeout(() => {
        const hasDismissed = localStorage.getItem('pwa-install-dismissed');
        if (!hasDismissed) {
          setShowPrompt(true);
        }
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
      setDeferredPrompt(null);
      // 记录安装成功
      localStorage.setItem('pwa-installed', 'true');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">安装应用</h3>
              <p className="text-sm text-gray-600 mt-1">
                将应用安装到桌面，享受更好的体验
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={handleInstall} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            立即安装
          </Button>
          <Button variant="outline" onClick={handleDismiss}>
            稍后再说
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

### 4. 性能监控

#### 4.1 Web Vitals 集成

**相关文件**:

- `src/monitoring/web-vitals.ts`

```typescript
// src/monitoring/web-vitals.ts

import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

interface Metric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  navigationType: string;
}

// 性能指标阈值
const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
};

function sendToAnalytics(metric: Metric) {
  // 发送到分析服务
  const body = {
    d: metric.value,
    id: metric.name,
    page: window.location.pathname,
    rating: metric.rating,
  };

  // 使用 sendBeacon 确保数据发送成功
  const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
  navigator.sendBeacon('/api/analytics/performance', blob);
}

function getRating(
  value: number,
  thresholds: { good: number; poor: number }
): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

// 监控 Cumulative Layout Shift (CLS)
onCLS(metric => {
  const rating = getRating(metric.value, THRESHOLDS.CLS);
  console.log(`[Web Vitals] CLS: ${metric.value.toFixed(3)} (${rating})`);

  if (rating === 'poor') {
    // 发送告警
    sendAlert('CLS', metric.value, 'poor');
  }

  sendToAnalytics({
    name: 'CLS',
    value: metric.value,
    rating,
    delta: metric.delta,
    navigationType: metric.navigationType,
  });
});

// 监控 First Input Delay (FID)
onFID(metric => {
  const rating = getRating(metric.value, THRESHOLDS.FID);
  console.log(`[Web Vitals] FID: ${metric.value.toFixed(0)}ms (${rating})`);

  sendToAnalytics({
    name: 'FID',
    value: metric.value,
    rating,
    delta: metric.delta,
    navigationType: metric.navigationType,
  });
});

// 监控 First Contentful Paint (FCP)
onFCP(metric => {
  const rating = getRating(metric.value, THRESHOLDS.FCP);
  console.log(`[Web Vitals] FCP: ${metric.value.toFixed(0)}ms (${rating})`);

  sendToAnalytics({
    name: 'FCP',
    value: metric.value,
    rating,
    delta: metric.delta,
    navigationType: metric.navigationType,
  });
});

// 监控 Largest Contentful Paint (LCP)
onLCP(metric => {
  const rating = getRating(metric.value, THRESHOLDS.LCP);
  console.log(`[Web Vitals] LCP: ${metric.value.toFixed(0)}ms (${rating})`);

  if (rating === 'poor') {
    sendAlert('LCP', metric.value, 'poor');
  }

  sendToAnalytics({
    name: 'LCP',
    value: metric.value,
    rating,
    delta: metric.delta,
    navigationType: metric.navigationType,
  });
});

// 监控 Time to First Byte (TTFB)
onTTFB(metric => {
  const rating = getRating(metric.value, THRESHOLDS.TTFB);
  console.log(`[Web Vitals] TTFB: ${metric.value.toFixed(0)}ms (${rating})`);

  sendToAnalytics({
    name: 'TTFB',
    value: metric.value,
    rating,
    delta: metric.delta,
    navigationType: metric.navigationType,
  });
});

function sendAlert(metric: string, value: number, rating: string) {
  // 发送告警到监控系统
  console.warn(`[Performance Alert] ${metric} is ${rating}: ${value}`);

  // 可以集成 Sentry、Datadog 等监控服务
  if (window.Sentry) {
    window.Sentry.captureMessage(
      `Performance Alert: ${metric} is ${rating} (${value})`,
      { level: 'warning' }
    );
  }
}

// 导出性能报告函数
export function generatePerformanceReport() {
  return {
    thresholds: THRESHOLDS,
    userAgent: navigator.userAgent,
    connection: (navigator as any).connection?.effectiveType || 'unknown',
    deviceMemory: (navigator as any).deviceMemory || 'unknown',
  };
}
```

---

## 📊 验收标准

### 功能验收

- [ ] **Service Worker 正常注册**
  - 在 Chrome DevTools Application 面板可见
  - 状态为 activated

- [ ] **离线功能可用**
  - 断网后核心功能仍可访问
  - 离线操作可排队等待同步

- [ ] **安装提示正常显示**
  - 满足条件时显示安装弹窗
  - 安装后应用图标出现在桌面

- [ ] **性能监控数据收集**
  - Web Vitals 数据正确上报
  - 控制台可见性能日志

### 性能指标

| 指标           | 目标值  | 测量方法        |
| -------------- | ------- | --------------- |
| Lighthouse PWA | ≥ 90    | Lighthouse 审计 |
| LCP            | < 2.5s  | Chrome DevTools |
| FID            | < 100ms | Chrome DevTools |
| CLS            | < 0.1   | Chrome DevTools |
| 首屏加载       | < 3s    | WebPageTest     |

---

## 🔧 测试工具

### Lighthouse 审计

```bash
# 使用 Chrome DevTools
1. 打开 Chrome DevTools
2. 切换到 Lighthouse 面板
3. 选择 Categories: Progressive Web App
4. 点击 Analyze page load
```

### Performance 监控

```javascript
// 在浏览器控制台运行
performance.getEntriesByType('navigation')[0];
performance.getEntriesByType('paint');
```

---

## 🚀 下一步

完成 Phase 1 后，进入 [Phase 2: RN 预研](./phase2-rn-preparation.md)

---

**最后更新**: 2026-03-04  
**维护者**: 移动开发团队
