# 部署指南

**生成时间**: 2026-03-23T04:52:51.561Z
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

```bash
# 安装项目依赖
npm install

# 复制环境变量文件
cp .env.example .env.local

# 编辑环境变量
vim .env.local
```

---

## Docker 部署

### 1. 构建镜像

```bash
# 开发环境
docker-compose -f docker-compose.dev.yml build

# 生产环境
docker-compose -f docker-compose.prod.yml build
```

### 2. 启动服务

```bash
# 开发环境
docker-compose -f docker-compose.dev.yml up -d

# 生产环境
docker-compose -f docker-compose.prod.yml up -d
```

### 3. 查看日志

```bash
docker-compose logs -f app
```

### 4. 停止服务

```bash
docker-compose down
```

---

## Kubernetes 部署

### 1. 创建命名空间

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
```

```bash
kubectl apply -f k8s/namespace.yaml
```

### 2. 配置 ConfigMap

```yaml
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
```

### 3. 创建 Secrets

```bash
kubectl create secret generic app-secrets \
  --from-literal=SUPABASE_SERVICE_ROLE_KEY="your-key" \
  --from-literal=DATABASE_URL="postgresql://..." \
  -n production
```

### 4. 部署应用

```yaml
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
```

```bash
kubectl apply -f k8s/deployment.yaml
```

### 5. 配置 Service

```yaml
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
```

```bash
kubectl apply -f k8s/service.yaml
```

---

## 环境变量配置

### 必需的环境变量

```bash
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
```

---

## 数据库迁移

### 运行迁移

```bash
# 使用 Supabase CLI
supabase db push

# 或使用 SQL 文件
psql $DATABASE_URL < migrations/001_initial_schema.sql
```

### 验证迁移

```sql
-- 检查表是否存在
\dt

-- 检查数据
SELECT COUNT(*) FROM users;
```

---

## 健康检查

### 端点

- `GET /health` - 基本健康检查
- `GET /ready` - 就绪检查（包括数据库连接）
- `GET /live` - 存活检查

### 示例

```bash
curl https://your-domain.com/health

# 预期响应
{
  "status": "ok",
  "timestamp": "2026-03-23T10:00:00.000Z"
}
```

---

## 常见问题

### 1. 端口被占用

**问题**: Error: listen EADDRINUSE: address already in use :::3000

**解决**: 
```bash
# 查找占用端口的进程
lsof -i :3000

# 杀死进程
kill -9 <PID>
```

### 2. 数据库连接失败

**问题**: Error: connect ECONNREFUSED

**解决**:
- 检查数据库是否运行
- 验证 DATABASE_URL 配置
- 检查防火墙规则

### 3. 内存不足

**问题**: JavaScript heap out of memory

**解决**:
```bash
# 增加 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=4096"
```

---

## 回滚策略

### Docker 回滚

```bash
# 使用上一个版本的镜像
docker-compose pull app:previous
docker-compose up -d app
```

### K8s 回滚

```bash
# 回滚到上一个版本
kubectl rollout undo deployment/app -n production

# 回滚到特定版本
kubectl rollout undo deployment/app -n production --to-revision=2
```

---

## 联系支持

如有问题，请联系:
- Email: devops@company.com
- Slack: #deployment-support
