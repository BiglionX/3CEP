# Redis 缓存配置指南

## 📦 安装完成

✅ **已安装**:

- `ioredis` - Redis 客户端库
- `@types/ioredis` - TypeScript 类型定义 (已弃用，ioredis 自带类型)

---

## 🔧 环境配置

### 1. 添加环境变量

在 `.env.local` 文件中添加:

```bash
# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=           # 如果有密码
REDIS_DB=0                # 默认数据库
```

### 2. 本地开发安装 Redis

**Windows**:

```bash
# 使用 WSL
wsl sudo apt-get install redis-server
wsl sudo service redis-server start

# 或使用 Docker
docker run -d -p 6379:6379 redis:latest
```

**macOS**:

```bash
brew install redis
brew services start redis
```

**Linux**:

```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

---

## 📚 使用方法

### 基础用法

```typescript
import { getCache, setCache, deleteCache } from '@/lib/cache';

// 设置缓存
await setCache('my:key', { data: 'value' }, 300); // 5 分钟

// 获取缓存
const data = await getCache<MyType>('my:key');

// 删除缓存
await deleteCache('my:key');
```

### 智能缓存 (getOrSetCache)

```typescript
import { getOrSetCache } from '@/lib/cache';

// 自动处理缓存逻辑
const skill = await getOrSetCache(
  makeCacheKey('skill', skillId),
  async () => {
    // 缓存未命中时执行
    return await fetchSkillFromDB(skillId);
  },
  DEFAULT_TTL.NORMAL_DATA // 10 分钟
);
```

### API 路由缓存中间件

```typescript
import { withCache } from '@/middleware/cacheMiddleware';

export const GET = withCache(
  async request => {
    // 业务逻辑
    const skills = await getSkills();
    return NextResponse.json({ skills });
  },
  {
    ttl: 300, // 5 分钟
    varyByQuery: ['page', 'limit'], // 根据分页参数生成不同缓存
  }
);
```

---

## 🎯 缓存策略

### TTL 配置

| 数据类型    | TTL             | 说明                  |
| ----------- | --------------- | --------------------- |
| HOT_DATA    | 300s (5 分钟)   | 热门 Skills、首页数据 |
| NORMAL_DATA | 600s (10 分钟)  | 普通列表数据          |
| STATS_DATA  | 900s (15 分钟)  | 统计数据、分析报表    |
| USER_DATA   | 1800s (30 分钟) | 用户信息、权限数据    |

### 缓存键命名规范

```typescript
// 格式：skills:{type}:{id}
makeCacheKey('skill', 'uuid-123'); // -> skills:skill:uuid-123
makeCacheKey('list', 'pending'); // -> skills:list:pending
makeCacheKey('analytics', 'uuid-123'); // -> skills:analytics:uuid-123
```

---

## 🚀 性能优化建议

### 1. 热点数据预加载

```typescript
// 在定时任务中预热热门 Skills
import { warmupHotSkills } from '@/lib/cache';

// 每天凌晨 2 点执行
async function scheduledWarmup() {
  await warmupHotSkills(20); // 预热前 20 个热门 Skills
}
```

### 2. 批量操作优化

```typescript
// 使用 msetCache 代替多次 setCache
const entries = skills.map(skill => ({
  key: makeCacheKey('skill', skill.id),
  value: skill,
}));

await msetCache(entries, 300);
```

### 3. 缓存穿透保护

```typescript
// 空值也会被缓存 (60 秒)
const result = await getOrSetCache(
  'nonexistent:key',
  async () => null, // 返回 null
  60 // 空值缓存 1 分钟
);
```

### 4. 缓存雪崩预防

```typescript
// 添加随机过期时间
const baseTTL = 300;
const randomJitter = Math.random() * 60; // 0-60 秒随机
await setCache(key, data, baseTTL + randomJitter);
```

---

## 🔍 监控和维护

### 查看缓存状态

```typescript
import { getRedisClient } from '@/lib/cache';

const client = getRedisClient();

// 获取缓存键数量
const dbSize = await client.dbsize();

// 查看所有缓存键
const keys = await client.keys('skills:*');

// 获取内存使用情况
const info = await client.info('memory');
```

### 清理缓存

```typescript
// 清理单个 Skill 缓存
await invalidateSkillsCache(skillId);

// 清理所有 Skills 缓存
await invalidateSkillsCache();

// 按模式清理
await deleteCacheByPattern('skills:skill:*');
```

---

## ⚠️ 注意事项

### 1. 数据一致性

写操作后及时清理缓存:

```typescript
// 更新 Skill 后
export const PUT = async request => {
  const skill = await updateSkill(data);

  // 清理相关缓存
  await invalidateSkillsCache(skill.id);

  return NextResponse.json({ skill });
};
```

### 2. 避免过度缓存

不适合缓存的数据:

- ❌ 实时性要求极高的数据
- ❌ 频繁变化的数据
- ❌ 体积过大的数据 (>1MB)
- ❌ 包含敏感信息的数据

### 3. 错误处理

```typescript
try {
  const data = await getCache('key');
} catch (error) {
  console.error('Cache error:', error);
  // Fallback: 直接查询数据库
  const data = await queryFromDB();
}
```

---

## 📊 性能指标

### 目标

| 指标           | 目标值  | 当前值 |
| -------------- | ------- | ------ |
| 缓存命中率     | > 80%   | -      |
| 平均响应时间   | < 200ms | -      |
| 数据库查询减少 | > 50%   | -      |

### 监控缓存命中率

```typescript
// 在响应头中添加
response.headers.set('X-Cache', 'HIT'); // 或 'MISS'
response.headers.set('X-Cache-Age', age.toString());
```

---

## 🐛 故障排查

### 常见问题

**Q1: Redis 连接失败**

```bash
# 检查 Redis 是否运行
redis-cli ping
# 应该返回 PONG
```

**Q2: 缓存不生效**

- 检查环境变量配置
- 确认缓存键命名正确
- 验证 TTL 设置

**Q3: 内存占用过高**

```bash
# 查看大键
redis-cli --bigkeys

# 清理过期键
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

---

## 📖 参考资料

- [ioredis 官方文档](https://github.com/luin/ioredis)
- [Redis 最佳实践](https://redis.io/docs/manual/)
- [缓存设计模式](https://redis.io/docs/manual/design-patterns/)

---

**下一步**: 继续执行 P2-001 懒加载优化和数据库查询优化! 🚀
