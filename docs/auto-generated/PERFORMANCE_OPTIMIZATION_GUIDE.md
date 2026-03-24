# 性能调优指南

**生成时间**: 2026-03-23T04:52:51.563Z
**版本**: v1.0.0

---

## 目录

1. [前端优化](#前端优化)
2. [后端优化](#后端优化)
3. [数据库优化](#数据库优化)
4. [缓存策略](#缓存策略)
5. [CDN 优化](#cdn-优化)
6. [监控指标](#监控指标)

---

## 前端优化

### 1. 代码分割

```typescript
// 懒加载组件
const Dashboard = dynamic(() => import('@/components/Dashboard'), {
  loading: () => <LoadingSpinner />,
});

// 路由级别代码分割
const routes = [
  {
    path: '/admin',
    loadComponent: () => import('./admin/layout'),
  },
];
```

### 2. 图片优化

```jsx
// 使用 Next.js Image 组件
import Image from 'next/image';

<Image
  src="/product.jpg"
  alt="产品图片"
  width={800}
  height={600}
  priority={false}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
/>
```

### 3. 虚拟列表

```tsx
// 大数据列表使用虚拟滚动
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={50}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      {items[index].name}
    </div>
  )}
</FixedSizeList>
```

### 4. 减少重渲染

```tsx
// 使用 React.memo
const MemoizedComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});

// 使用 useMemo
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

// 使用 useCallback
const handleClick = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

---

## 后端优化

### 1. 响应压缩

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import { gzip } from 'zlib';

export async function middleware(request) {
  const response = NextResponse.next();
  response.headers.set('Content-Encoding', 'gzip');
  return response;
}
```

### 2. 流式响应

```typescript
// 大文件下载使用流式传输
import { Readable } from 'stream';

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      // 逐步写入数据
      controller.enqueue(chunk);
      controller.close();
    }
  });

  return new Response(stream);
}
```

### 3. 批量操作

```typescript
// 避免 N+1 查询
const users = await supabase.from('users').select('*');
const userIds = users.map(u => u.id);

const orders = await supabase
  .from('orders')
  .select('*')
  .in('user_id', userIds);
```

---

## 数据库优化

### 1. 索引优化

```sql
-- 为常用查询字段添加索引
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- 复合索引
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- 部分索引
CREATE INDEX idx_active_users ON users(email) WHERE active = true;
```

### 2. 查询优化

```sql
-- 避免 SELECT *
SELECT id, name, email FROM users;

-- 使用 EXPLAIN 分析
EXPLAIN ANALYZE
SELECT * FROM orders WHERE user_id = 123;

-- 避免子查询，使用 JOIN
SELECT o.* 
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE u.email = 'test@example.com';
```

### 3. 分区表

```sql
-- 按月分区
CREATE TABLE orders_2026_01 PARTITION OF orders
FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE orders_2026_02 PARTITION OF orders
FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
```

---

## 缓存策略

### 1. Redis 缓存

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// 缓存热点数据
async function getUserData(userId) {
  const cacheKey = 'user:' + userId;
  
  // 尝试从缓存获取
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // 从数据库查询
  const userData = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  
  // 写入缓存 (5 分钟过期)
  await redis.setex(cacheKey, 300, JSON.stringify(userData));
  
  return userData;
}
```

### 2. HTTP 缓存

```typescript
// API 响应头设置
export async function GET() {
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      'ETag': '"abc123"',
    },
  });
}
```

### 3. SWR 策略

```typescript
// 前端使用 SWR
import useSWR from 'swr';

function UserProfile({ userId }) {
  const { data, error } = useSWR('/api/users/' + userId, fetcher, {
    refreshInterval: 30000, // 30 秒刷新
    dedupingInterval: 2000, // 2 秒去重
    revalidateOnFocus: false,
  });

  return <div>{data?.name}</div>;
}
```

---

## CDN 优化

### 1. 静态资源配置

```javascript
// next.config.js
module.exports = {
  assetPrefix: 'https://cdn.your-domain.com',
  images: {
    domains: ['cdn.your-domain.com'],
  },
};
```

### 2. 缓存规则

```nginx
# Nginx CDN 配置
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

---

## 监控指标

### 1. 关键指标

- **响应时间**: P95 < 200ms, P99 < 500ms
- **吞吐量**: > 1000 QPS
- **错误率**: < 0.1%
- **CPU 使用率**: < 70%
- **内存使用率**: < 80%

### 2. APM 工具

```bash
# 安装 Sentry
npm install @sentry/nextjs

# 配置 sentry.config.js
module.exports = {
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
};
```

### 3. 自定义监控

```typescript
// 性能指标上报
import { reportWebVitals } from 'next/web-vitals';

reportWebVitals((metric) => {
  // 发送到分析服务
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(metric),
  });
});
```

---

## 性能基准

### 目标值

| 指标 | 优秀 | 良好 | 需改进 |
|------|------|------|--------|
| FCP  | <1s  | 1-3s | >3s    |
| LCP  | <2.5s| 2.5-4s| >4s   |
| TTI  | <3.5s| 3.5-5s| >5s   |
| TBT  | <200ms| 200-500ms| >500ms |
| CLS  | <0.1 | 0.1-0.25| >0.25 |

---

## 性能测试工具

```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# WebPageTest
# 访问 https://www.webpagetest.org/

# k6 压力测试
npm install -g k6
k6 run load-test.js
```
