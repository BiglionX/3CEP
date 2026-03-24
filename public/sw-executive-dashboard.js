/**
 * 高管仪表板 Service Worker
 * 提供离线缓存和网络优化功能
 */

const CACHE_NAME = 'executive-dashboard-v1';
const STATIC_ASSETS = [
  '/',
  '/enterprise/admin/executive-dashboard',
  '/_next/static/chunks/main-app.js',
  '/_next/static/css/app/globals.css',
];

const DATA_CACHE_NAME = 'executive-dashboard-data-v1';

// 安装事件 - 缓存静态资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('缓存静态资源');
      return cache.addAll(STATIC_ASSETS);
    }).catch(error => {
      console.error('缓存失败:', error);
    })
  );

  // 跳过等待，立即激活
  self.skipWaiting();
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // 接管所有客户端
  self.clients.claim();
});

// 获取事件 - 网络优先，回退到缓存
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // API 请求 - 网络优先
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetchFromNetwork(request));
    return;
  }

  // 静态资源 - 缓存优先
  if (request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'image') {
    event.respondWith(fetchFromCache(request));
    return;
  }

  // 页面导航 - 网络优先，回退到缓存
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // 成功获取，更新缓存
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // 网络失败，从缓存读取
          return caches.match(request);
        })
    );
    return;
  }

  // 其他请求
  event.respondWith(
    fetchFromNetworkOrCache(request)
  );
});

// 网络优先策略
async function fetchFromNetwork(request: Request) {
  try {
    const response = await fetch(request);

    // 如果是成功响应，缓存数据
    if (response.ok) {
      const responseClone = response.clone();
      const cache = await caches.open(DATA_CACHE_NAME);

      // 只缓存 JSON 数据
      if (request.headers.get('Accept')?.includes('application/json')) {
        await cache.put(request, responseClone);
      }
    }

    return response;
  } catch (error) {
    console.log('网络请求失败，尝试从缓存读取:', error);

    // 从缓存读取
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // 返回离线响应
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: '当前处于离线状态，请检查网络连接',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// 缓存优先策略
async function fetchFromCache(request: Request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // 同时发起网络请求更新缓存
    fetch(request).then(response => {
      if (response.ok) {
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, response);
        });
      }
    }).catch(() => {
      // 忽略网络错误
    });

    return cachedResponse;
  }

  // 缓存未命中，从网络获取
  return fetch(request);
}

// 网络或缓存策略
async function fetchFromNetworkOrCache(request: Request) {
  try {
    return await fetch(request);
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

// 后台同步
self.addEventListener('sync', event => {
  if (event.tag === 'sync-dashboard-data') {
    event.waitUntil(syncDashboardData());
  }
});

// 同步仪表板数据
async function syncDashboardData() {
  try {
    // 获取所有客户端窗口
    const clients = await self.clients.matchAll();

    // 通知客户端数据已同步
    clients.forEach(client => {
      client.postMessage({
        type: 'DATA_SYNCED',
        timestamp: Date.now(),
      });
    });
  } catch (error) {
    console.error('同步失败:', error);
  }
}

// 推送通知
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();

    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge-icon.png',
        tag: data.id,
        requireInteraction: data.severity === 'high',
      })
    );
  }
});

// 通知点击处理
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/enterprise/admin/executive-dashboard')
  );
});
