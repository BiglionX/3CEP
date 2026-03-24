#!/usr/bin/env node

/**
 * 自动化技术文档生成器
 *
 * 生成文档类型:
 * - API 文档 (基于 OpenAPI spec)
 * - 部署指南 (Docker/K8s 配置)
 * - 故障排查手册
 * - 性能调优指南
 */

const fs = require('fs');
const path = require('path');

// 文档输出目录
const DOCS_DIR = path.join(process.cwd(), 'docs', 'auto-generated');

// 确保目录存在
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

/**
 * 1. 生成 API 文档
 */
function generateApiDocs() {
  console.log('📄 生成 API 文档...');

  const apiRoutes = [];

  // 扫描所有 API 路由文件
  const apiDir = path.join(
    process.cwd(),
    'src',
    'app',
    '**',
    'api',
    '**',
    'route.ts'
  );
  const glob = require('glob');
  const files = glob.sync(apiDir);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');

    // 提取 HTTP 方法
    const methods = [];
    if (content.includes('export async function GET')) methods.push('GET');
    if (content.includes('export async function POST')) methods.push('POST');
    if (content.includes('export async function PUT')) methods.push('PUT');
    if (content.includes('export async function DELETE'))
      methods.push('DELETE');
    if (content.includes('export async function PATCH')) methods.push('PATCH');

    // 提取路径
    const relativePath = path.relative(
      path.join(process.cwd(), 'src', 'app'),
      file
    );
    const apiPath = relativePath
      .replace(/[/\\]route\.ts$/, '')
      .replace(/[/\\]/g, '/');

    // 提取描述注释
    const descriptionMatch = content.match(/\/\*\*[\s\S]*?\*\//);
    const description = descriptionMatch
      ? descriptionMatch[0].replace(/\/\*\*|\*\//g, '').trim()
      : '';

    apiRoutes.push({
      path: `/admin${apiPath}`,
      methods,
      description,
      file: path.relative(process.cwd(), file),
    });
  }

  // 生成 Markdown 文档
  let markdown = `# API 接口文档

**生成时间**: ${new Date().toISOString()}
**总计接口数**: ${apiRoutes.length}

---

## 目录

`;

  // 按模块分组
  const grouped = {};
  for (const route of apiRoutes) {
    const parts = route.path.split('/').filter(Boolean);
    const module = parts[1] || 'root';

    if (!grouped[module]) {
      grouped[module] = [];
    }
    grouped[module].push(route);
  }

  // 生成目录
  for (const [module, routes] of Object.entries(grouped)) {
    markdown += `- [${module}](#${module})\n`;
  }

  markdown += `\n---\n\n`;

  // 生成详细内容
  for (const [module, routes] of Object.entries(grouped)) {
    markdown += `## ${module}\n\n`;

    for (const route of routes) {
      markdown += `### ${route.methods.join(' | ')} \`${route.path}\`\n\n`;

      if (route.description) {
        markdown += `${route.description}\n\n`;
      }

      markdown += `**文件位置**: \`${route.file}\`\n\n`;
      markdown += `**权限要求**: 需要认证 (参考 RBAC 配置)\n\n`;
      markdown += `---\n\n`;
    }
  }

  // 保存文件
  const outputFile = path.join(DOCS_DIR, 'API_DOCUMENTATION.md');
  fs.writeFileSync(outputFile, markdown);

  console.log(`✅ API 文档已生成：${outputFile}`);
  return outputFile;
}

/**
 * 2. 生成部署指南
 */
function generateDeploymentGuide() {
  console.log('📦 生成部署指南...');

  const guide = `# 部署指南

**生成时间**: ${new Date().toISOString()}
**版本**: v1.0.0

---

## 目录

1. [环境准备](#环境准备)
2. [Docker 部署](#docker-部署)
3. [Kubernetes 部署](#kubernetes-部署)
4. [环境变量配置](#环境变量配置)
5. [数据库迁移](#数据库迁移)
6. [健康检查](#健康检查)

---

## 环境准备

### 系统要求

- Node.js >= 18.x
- Docker >= 20.x (如使用 Docker 部署)
- Kubernetes >= 1.25 (如使用 K8s 部署)
- PostgreSQL >= 14.x
- Redis >= 6.x (可选，用于缓存)

### 依赖安装

\`\`\`bash
# 安装项目依赖
npm install

# 复制环境变量文件
cp .env.example .env.local

# 编辑环境变量
vim .env.local
\`\`\`

---

## Docker 部署

### 1. 构建镜像

\`\`\`bash
# 开发环境
docker-compose -f docker-compose.dev.yml build

# 生产环境
docker-compose -f docker-compose.prod.yml build
\`\`\`

### 2. 启动服务

\`\`\`bash
# 开发环境
docker-compose -f docker-compose.dev.yml up -d

# 生产环境
docker-compose -f docker-compose.prod.yml up -d
\`\`\`

### 3. 查看日志

\`\`\`bash
docker-compose logs -f app
\`\`\`

### 4. 停止服务

\`\`\`bash
docker-compose down
\`\`\`

---

## Kubernetes 部署

### 1. 创建命名空间

\`\`\`yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
\`\`\`

\`\`\`bash
kubectl apply -f k8s/namespace.yaml
\`\`\`

### 2. 配置 ConfigMap

\`\`\`yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: production
data:
  NODE_ENV: "production"
  NEXT_PUBLIC_SUPABASE_URL: "https://xxx.supabase.co"
  # ... 其他配置
\`\`\`

### 3. 创建 Secrets

\`\`\`bash
kubectl create secret generic app-secrets \\
  --from-literal=SUPABASE_SERVICE_ROLE_KEY="your-key" \\
  --from-literal=DATABASE_URL="postgresql://..." \\
  -n production
\`\`\`

### 4. 部署应用

\`\`\`yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: main-app
  template:
    metadata:
      labels:
        app: main-app
    spec:
      containers:
      - name: app
        image: your-registry/app:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
\`\`\`

\`\`\`bash
kubectl apply -f k8s/deployment.yaml
\`\`\`

### 5. 配置 Service

\`\`\`yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: app-service
  namespace: production
spec:
  selector:
    app: main-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
\`\`\`

\`\`\`bash
kubectl apply -f k8s/service.yaml
\`\`\`

---

## 环境变量配置

### 必需的环境变量

\`\`\`bash
# 数据库配置
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# 应用配置
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# 认证配置
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret

# 邮件服务 (可选)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# 监控配置
SENTRY_DSN=https://xxx@sentry.io/xxx
\`\`\`

---

## 数据库迁移

### 运行迁移

\`\`\`bash
# 使用 Supabase CLI
supabase db push

# 或使用 SQL 文件
psql $DATABASE_URL < migrations/001_initial_schema.sql
\`\`\`

### 验证迁移

\`\`\`sql
-- 检查表是否存在
\\dt

-- 检查数据
SELECT COUNT(*) FROM users;
\`\`\`

---

## 健康检查

### 端点

- \`GET /health\` - 基本健康检查
- \`GET /ready\` - 就绪检查（包括数据库连接）
- \`GET /live\` - 存活检查

### 示例

\`\`\`bash
curl https://your-domain.com/health

# 预期响应
{
  "status": "ok",
  "timestamp": "2026-03-23T10:00:00.000Z"
}
\`\`\`

---

## 常见问题

### 1. 端口被占用

**问题**: Error: listen EADDRINUSE: address already in use :::3000

**解决**:
\`\`\`bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>
\`\`\`

### 2. 数据库连接失败

**问题**: Error: connect ECONNREFUSED

**解决**:
- 检查数据库是否运行
- 验证 DATABASE_URL 配置
- 检查防火墙规则

### 3. 内存不足

**问题**: JavaScript heap out of memory

**解决**:
\`\`\`bash
# 增加 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=4096"
\`\`\`

---

## 回滚策略

### Docker 回滚

\`\`\`bash
# 使用上一个版本的镜像
docker-compose pull app:previous
docker-compose up -d app
\`\`\`

### K8s 回滚

\`\`\`bash
# 回滚到上一个版本
kubectl rollout undo deployment/app -n production

# 回滚到特定版本
kubectl rollout undo deployment/app -n production --to-revision=2
\`\`\`

---

## 联系支持

如有问题，请联系:
- Email: devops@company.com
- Slack: #deployment-support
`;

  const outputFile = path.join(DOCS_DIR, 'DEPLOYMENT_GUIDE.md');
  fs.writeFileSync(outputFile, guide);

  console.log(`✅ 部署指南已生成：${outputFile}`);
  return outputFile;
}

/**
 * 3. 生成故障排查手册
 */
function generateTroubleshootingGuide() {
  console.log('🔧 生成故障排查手册...');

  const guide = `# 故障排查手册

**生成时间**: ${new Date().toISOString()}
**版本**: v1.0.0

---

## 快速索引

- [登录问题](#登录问题)
- [数据库问题](#数据库问题)
- [前端问题](#前端问题)
- [API 问题](#api-问题)
- [性能问题](#性能问题)
- [部署问题](#部署问题)

---

## 诊断工具

### 1. 日志查看

\`\`\`bash
# 应用日志
tail -f logs/app.log

# Docker 日志
docker-compose logs -f app

# K8s 日志
kubectl logs -f deployment/app -n production
\`\`\`

### 2. 数据库诊断

\`\`\`sql
-- 检查活跃连接
SELECT count(*) FROM pg_stat_activity;

-- 检查慢查询
SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;

-- 检查锁等待
SELECT * FROM pg_locks WHERE NOT granted;
\`\`\`

### 3. 性能分析

\`\`\`bash
# Node.js 性能分析
node --inspect app.js

# Chrome DevTools
# 访问 chrome://inspect
\`\`\`

---

## 登录问题

### 问题 1: 无法登录，提示"无效凭证"

**症状**: 用户输入正确的账号密码但登录失败

**可能原因**:
1. 数据库连接失败
2. JWT 密钥配置错误
3. 密码加密算法变更

**解决步骤**:
\`\`\`bash
# 1. 检查数据库连接
psql $DATABASE_URL -c "SELECT 1"

# 2. 验证 JWT 配置
grep JWT_SECRET .env.local

# 3. 查看认证日志
grep "authentication" logs/app.log
\`\`\`

**修复命令**:
\`\`\`bash
# 重置管理员密码
node scripts/reset-admin-password.js newpassword123
\`\`\`

---

### 问题 2: 登录后立即退出

**症状**: 登录成功后立即跳回登录页

**可能原因**:
1. Session/Cookie 配置错误
2. 跨域问题
3. Token 过期时间设置错误

**解决步骤**:
\`\`\`bash
# 检查 Cookie 配置
grep SESSION_SECRET .env.local

# 检查跨域配置
cat src/config/cors.ts
\`\`\`

---

## 数据库问题

### 问题 1: 查询超时

**症状**: 页面加载缓慢，数据库查询超时

**可能原因**:
1. 缺少索引
2. 慢查询
3. 连接池耗尽

**解决步骤**:
\`\`\`sql
-- 1. 识别慢查询
SELECT query, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- 2. 添加索引
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- 3. 检查连接池
SHOW max_connections;
\`\`\`

---

### 问题 2: 死锁

**症状**: 事务长时间阻塞，操作失败

**解决步骤**:
\`\`\`sql
-- 查看死锁
SELECT * FROM pg_locks bl
JOIN pg_stat_activity a ON bl.pid = a.pid
WHERE NOT granted;

-- 终止阻塞的查询
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle in transaction'
AND now() - query_start > interval '5 minutes';
\`\`\`

---

## 前端问题

### 问题 1: 页面白屏

**症状**: 访问页面显示空白

**可能原因**:
1. JavaScript 执行错误
2. 资源加载失败
3. 路由配置错误

**诊断**:
\`\`\`bash
# 查看浏览器控制台错误
# F12 -> Console

# 检查构建输出
ls -la .next/static/
\`\`\`

**解决**:
\`\`\`bash
# 重新构建
npm run build

# 清除缓存
rm -rf .next
\`\`\`

---

### 问题 2: 样式错乱

**症状**: 页面布局异常，样式丢失

**可能原因**:
1. Tailwind CSS 未正确编译
2. CSS 文件加载顺序错误
3. 浏览器兼容性

**解决**:
\`\`\`bash
# 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 重建
npm run build
\`\`\`

---

## API 问题

### 问题 1: API 返回 500 错误

**症状**: 接口调用失败，返回服务器内部错误

**诊断**:
\`\`\`bash
# 查看错误日志
tail -f logs/error.log

# 检查 API 路由
cat src/app/api/*/route.ts
\`\`\`

**常见错误**:
- 空指针异常
- 数据库约束违反
- 第三方服务调用失败

---

### 问题 2: CORS 错误

**症状**: 浏览器报 CORS policy 错误

**解决**:
\`\`\`typescript
// src/config/cors.ts
export const corsConfig = {
  origin: ['https://your-domain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};
\`\`\`

---

## 性能问题

### 问题 1: 页面加载缓慢

**诊断**:
\`\`\`bash
# Lighthouse 性能测试
# Chrome DevTools -> Lighthouse

# 分析包大小
npm run analyze

# 检查网络请求
# Network tab in DevTools
\`\`\`

**优化措施**:
1. 启用 CDN
2. 图片懒加载
3. 代码分割
4. 服务端渲染

---

### 问题 2: 内存泄漏

**症状**: 应用运行一段时间后内存持续增长

**诊断**:
\`\`\`bash
# 监控内存使用
watch -n 1 'ps aux | grep node'

# Heap Snapshot 分析
# Chrome DevTools -> Memory
\`\`\`

**常见原因**:
- 全局变量未清理
- 定时器未清除
- 事件监听器未移除

---

## 部署问题

### 问题 1: Docker 容器启动失败

**症状**: 容器不断重启

**诊断**:
\`\`\`bash
# 查看容器日志
docker logs <container-id>

# 进入容器调试
docker run -it --entrypoint /bin/sh <image-id>
\`\`\`

---

### 问题 2: K8s Pod 无法调度

**症状**: Pod 一直处于 Pending 状态

**诊断**:
\`\`\`bash
kubectl describe pod <pod-name> -n production

kubectl get events -n production
\`\`\`

**常见原因**:
- 资源不足
- 节点选择器不匹配
- PVC 绑定失败

---

## 应急联系

- **技术支持**: tech-support@company.com
- **值班电话**: +86-XXX-XXXX-XXXX
- **Slack 频道**: #emergency-response
`;

  const outputFile = path.join(DOCS_DIR, 'TROUBLESHOOTING_GUIDE.md');
  fs.writeFileSync(outputFile, guide);

  console.log(`✅ 故障排查手册已生成：${outputFile}`);
  return outputFile;
}

/**
 * 4. 生成性能调优指南
 */
function generatePerformanceGuide() {
  console.log('⚡ 生成性能调优指南...');

  const guide = `# 性能调优指南

**生成时间**: ${new Date().toISOString()}
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

\`\`\`typescript
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
\`\`\`

### 2. 图片优化

\`\`\`jsx
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
\`\`\`

### 3. 虚拟列表

\`\`\`tsx
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
\`\`\`

### 4. 减少重渲染

\`\`\`tsx
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
\`\`\`

---

## 后端优化

### 1. 响应压缩

\`\`\`typescript
// middleware.ts
import { NextResponse } from 'next/server';
import { gzip } from 'zlib';

export async function middleware(request) {
  const response = NextResponse.next();
  response.headers.set('Content-Encoding', 'gzip');
  return response;
}
\`\`\`

### 2. 流式响应

\`\`\`typescript
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
\`\`\`

### 3. 批量操作

\`\`\`typescript
// 避免 N+1 查询
const users = await supabase.from('users').select('*');
const userIds = users.map(u => u.id);

const orders = await supabase
  .from('orders')
  .select('*')
  .in('user_id', userIds);
\`\`\`

---

## 数据库优化

### 1. 索引优化

\`\`\`sql
-- 为常用查询字段添加索引
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- 复合索引
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- 部分索引
CREATE INDEX idx_active_users ON users(email) WHERE active = true;
\`\`\`

### 2. 查询优化

\`\`\`sql
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
\`\`\`

### 3. 分区表

\`\`\`sql
-- 按月分区
CREATE TABLE orders_2026_01 PARTITION OF orders
FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE orders_2026_02 PARTITION OF orders
FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
\`\`\`

---

## 缓存策略

### 1. Redis 缓存

\`\`\`typescript
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
\`\`\`

### 2. HTTP 缓存

\`\`\`typescript
// API 响应头设置
export async function GET() {
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      'ETag': '"abc123"',
    },
  });
}
\`\`\`

### 3. SWR 策略

\`\`\`typescript
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
\`\`\`

---

## CDN 优化

### 1. 静态资源配置

\`\`\`javascript
// next.config.js
module.exports = {
  assetPrefix: 'https://cdn.your-domain.com',
  images: {
    domains: ['cdn.your-domain.com'],
  },
};
\`\`\`

### 2. 缓存规则

\`\`\`nginx
# Nginx CDN 配置
location ~* \\.(jpg|jpeg|png|gif|ico|css|js)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
\`\`\`

---

## 监控指标

### 1. 关键指标

- **响应时间**: P95 < 200ms, P99 < 500ms
- **吞吐量**: > 1000 QPS
- **错误率**: < 0.1%
- **CPU 使用率**: < 70%
- **内存使用率**: < 80%

### 2. APM 工具

\`\`\`bash
# 安装 Sentry
npm install @sentry/nextjs

# 配置 sentry.config.js
module.exports = {
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
};
\`\`\`

### 3. 自定义监控

\`\`\`typescript
// 性能指标上报
import { reportWebVitals } from 'next/web-vitals';

reportWebVitals((metric) => {
  // 发送到分析服务
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(metric),
  });
});
\`\`\`

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

\`\`\`bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# WebPageTest
# 访问 https://www.webpagetest.org/

# k6 压力测试
npm install -g k6
k6 run load-test.js
\`\`\`
`;

  const outputFile = path.join(DOCS_DIR, 'PERFORMANCE_OPTIMIZATION_GUIDE.md');
  fs.writeFileSync(outputFile, guide);

  console.log(`✅ 性能调优指南已生成：${outputFile}`);
  return outputFile;
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 开始生成自动化技术文档...\n');

  try {
    const apiDocs = generateApiDocs();
    const deployGuide = generateDeploymentGuide();
    const troubleshootingGuide = generateTroubleshootingGuide();
    const performanceGuide = generatePerformanceGuide();

    console.log(`\n${'='.repeat(50)}`);
    console.log('✅ 所有文档已生成完成:');
    console.log(`   - ${path.relative(process.cwd(), apiDocs)}`);
    console.log(`   - ${path.relative(process.cwd(), deployGuide)}`);
    console.log(`   - ${path.relative(process.cwd(), troubleshootingGuide)}`);
    console.log(`   - ${path.relative(process.cwd(), performanceGuide)}`);
    console.log('='.repeat(50));

    // 生成索引文件
    const indexContent = `# 自动化技术文档索引

**生成时间**: ${new Date().toISOString()}

本文档索引包含以下自动化生成的技术文档:

1. [API 接口文档](./API_DOCUMENTATION.md) - 完整的 API 接口说明
2. [部署指南](./DEPLOYMENT_GUIDE.md) - Docker/K8s 部署详细步骤
3. [故障排查手册](./TROUBLESHOOTING_GUIDE.md) - 常见问题诊断和解决方案
4. [性能调优指南](./PERFORMANCE_OPTIMIZATION_GUIDE.md) - 性能优化最佳实践

---

**维护者**: 技术文档自动化小组
**更新频率**: 按需生成
`;

    const indexPath = path.join(DOCS_DIR, 'README.md');
    fs.writeFileSync(indexPath, indexContent);
    console.log(`\n📑 索引文件已创建：${indexPath}`);
  } catch (error) {
    console.error('❌ 文档生成失败:', error);
    process.exit(1);
  }
}

// 运行主函数
main();
