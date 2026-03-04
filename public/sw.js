// Service Worker - PWA核心文件
// 实现离线缓存、后台同步和推送通知功能

// 缓存版本和名称
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `app-cache-${CACHE_VERSION}`;
const ASSETS_CACHE_NAME = `assets-cache-${CACHE_VERSION}`;

// 需要缓存的重要资源
const CORE_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// 静态资源模式
const STATIC_ASSETS_PATTERN =
  /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/;

// API缓存策略
const API_CACHE_DURATION = 5 * 60 * 1000; // 5分钟

// 消息类型常量
const MESSAGE_TYPES = {
  SKIP_WAITING: 'SKIP_WAITING',
  CACHE_INVALIDATE: 'CACHE_INVALIDATE',
  BACKGROUND_SYNC: 'BACKGROUND_SYNC',
  NOTIFICATION_CLICK: 'NOTIFICATION_CLICK',
};

// 缓存策略常量
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
};

// 安装事件 - 缓存核心资源
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...', CACHE_NAME);

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching core assets');
      return cache.addAll(CORE_ASSETS);
    })
  );

  // 强制激活新的Service Worker
  self.skipWaiting();
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // 删除旧版本的缓存
            if (cacheName !== CACHE_NAME && cacheName !== ASSETS_CACHE_NAME) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // 控制所有客户端
        return self.clients.claim();
      })
  );
});

// 获取资源事件 - 实现缓存策略
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // 只处理同源请求
  if (url.origin !== self.location.origin) {
    return;
  }

  // 根据请求类型应用不同的缓存策略
  if (request.method === 'GET') {
    if (STATIC_ASSETS_PATTERN.test(url.pathname)) {
      // 静态资源使用Cache First策略
      event.respondWith(handleStaticAsset(request));
    } else if (url.pathname.startsWith('/api/')) {
      // API请求使用Network First策略
      event.respondWith(handleApiRequest(request));
    } else {
      // 页面和其他资源使用Stale While Revalidate策略
      event.respondWith(handlePageRequest(request));
    }
  }
});

// 处理静态资源 - Cache First策略
async function handleStaticAsset(request) {
  try {
    // 首先尝试从缓存获取
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // 如果缓存中没有，则从网络获取
    const networkResponse = await fetch(request);

    // 将响应克隆并存入缓存
    if (networkResponse.ok) {
      const cache = await caches.open(ASSETS_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Static asset fetch failed:', error);
    throw error;
  }
}

// 处理API请求 - Network First策略
async function handleApiRequest(request) {
  try {
    // 首先尝试从网络获取
    const networkResponse = await fetch(request);

    // 如果网络请求成功，缓存响应
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      const cacheEntry = {
        data: await networkResponse.clone().json(),
        timestamp: Date.now(),
        headers: Object.fromEntries(networkResponse.headers.entries()),
      };
      await cache.put(request, new Response(JSON.stringify(cacheEntry)));
    }

    return networkResponse;
  } catch (error) {
    console.log(
      '[Service Worker] Network failed, trying cache for:',
      request.url
    );

    // 网络失败时从缓存获取
    try {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        const cacheEntry = await cachedResponse.json();

        // 检查缓存是否过期
        if (Date.now() - cacheEntry.timestamp < API_CACHE_DURATION) {
          return new Response(JSON.stringify(cacheEntry.data), {
            headers: {
              'Content-Type': 'application/json',
              'X-Cache-Hit': 'true',
              ...cacheEntry.headers,
            },
          });
        }
      }
    } catch (cacheError) {
      console.error('[Service Worker] Cache read failed:', cacheError);
    }

    // 返回网络错误
    return new Response(
      JSON.stringify({
        error: 'Network error and no cached data available',
        offline: true,
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// 处理页面请求 - Stale While Revalidate策略
async function handlePageRequest(request) {
  const cache = await caches.open(CACHE_NAME);

  // 首先返回缓存的内容（如果存在）
  const cachedResponse = await cache.match(request);

  // 同时发起网络请求更新缓存
  const fetchPromise = fetch(request)
    .then(async networkResponse => {
      if (networkResponse.ok) {
        await cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(error => {
      console.error('[Service Worker] Background fetch failed:', error);
    });

  // 返回缓存的内容或等待网络响应
  return cachedResponse || fetchPromise;
}

// 消息处理 - 处理来自主线程的消息
self.addEventListener('message', event => {
  const message = event.data;

  switch (message.type) {
    case MESSAGE_TYPES.SKIP_WAITING:
      self.skipWaiting();
      break;

    case MESSAGE_TYPES.CACHE_INVALIDATE:
      invalidateCache(message.payload);
      break;

    case MESSAGE_TYPES.BACKGROUND_SYNC:
      handleBackgroundSync(message.payload);
      break;

    case MESSAGE_TYPES.NOTIFICATION_CLICK:
      handleNotificationClick(message.payload);
      break;

    default:
      console.warn('[Service Worker] Unknown message type:', message.type);
  }
});

// 缓存失效
async function invalidateCache(pattern) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();

    for (const request of keys) {
      if (!pattern || request.url.includes(pattern)) {
        await cache.delete(request);
        console.log('[Service Worker] Invalidated cache for:', request.url);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Cache invalidation failed:', error);
  }
}

// 后台同步处理
async function handleBackgroundSync(data) {
  console.log('[Service Worker] Background sync triggered:', data);

  try {
    // 执行后台任务
    switch (data.task) {
      case 'sync-data':
        await syncPendingData();
        break;
      case 'update-user-preferences':
        await updateUserPreferences(data.preferences);
        break;
      default:
        console.warn('[Service Worker] Unknown sync task:', data.task);
    }

    // 通知所有客户端同步完成
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        task: data.task,
        success: true,
      });
    });
  } catch (error) {
    console.error('[Service Worker] Background sync failed:', error);

    // 注册重试
    await registerRetry(data);
  }
}

// 同步待处理数据
async function syncPendingData() {
  // 从IndexedDB或其他存储中获取待同步的数据
  // 这里只是一个示例实现
  console.log('[Service Worker] Syncing pending data...');

  // 模拟同步过程
  await new Promise(resolve => setTimeout(resolve, 2000));
}

// 更新用户偏好设置
async function updateUserPreferences(preferences) {
  console.log('[Service Worker] Updating user preferences:', preferences);

  // 发送更新请求到服务器
  try {
    const response = await fetch('/api/user/preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('[Service Worker] Failed to update preferences:', error);
    throw error;
  }
}

// 注册重试机制
async function registerRetry(data) {
  // 实现重试逻辑
  console.log('[Service Worker] Registering retry for:', data);
}

// 通知点击处理
async function handleNotificationClick(data) {
  console.log('[Service Worker] Notification clicked:', data);

  // 聚焦或打开相关页面
  const clients = await self.clients.matchAll({ type: 'window' });

  if (clients.length > 0) {
    // 如果已有客户端窗口，聚焦到该窗口
    const client = clients[0];
    await client.focus();

    // 发送消息到客户端
    client.postMessage({
      type: 'NOTIFICATION_CLICKED',
      data: data,
    });
  } else {
    // 如果没有客户端窗口，打开新窗口
    const client = await self.clients.openWindow(data.url || '/');
    if (client) {
      client.postMessage({
        type: 'NOTIFICATION_CLICKED',
        data: data,
      });
    }
  }
}

// 推送通知事件处理
self.addEventListener('push', event => {
  console.log('[Service Worker] Push received:', event);

  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      data = { title: '通知', body: event.data.text() };
    }
  } else {
    data = { title: '通知', body: '您有一条新消息' };
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: data.tag || 'general',
    data: data,
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '通知', options)
  );
});

// 通知点击事件处理
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification clicked:', event);

  event.notification.close();

  // 处理通知点击
  if (event.action) {
    // 处理特定动作
    console.log('[Service Worker] Action clicked:', event.action);
  } else {
    // 处理通知主体点击
    event.waitUntil(handleNotificationClick(event.notification.data));
  }
});

// 后台同步事件处理
self.addEventListener('sync', event => {
  console.log('[Service Worker] Background sync event:', event.tag);

  switch (event.tag) {
    case 'background-sync':
      event.waitUntil(handleBackgroundSync({ task: 'sync-data' }));
      break;
    default:
      console.log('[Service Worker] Unknown sync tag:', event.tag);
  }
});

// Periodic Background Sync (实验性功能)
if ('periodicSync' in self.registration) {
  // 注册周期性同步
  self.registration.periodicSync
    .register('data-update', {
      minInterval: 24 * 60 * 60 * 1000, // 24小时
    })
    .catch(error => {
      console.log('[Service Worker] Periodic sync registration failed:', error);
    });
}

console.log('[Service Worker] Initialized successfully');
