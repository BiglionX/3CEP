# FixCycle 部署操作手册

## 📋 概述

本文档详细介绍 FixCycle 平台的部署流程，包括环境准备、配置管理、部署执行和运维监控等完整操作指南。

## 🎯 部署目标

- **开发环境**：本地快速部署，用于开发调试
- **测试环境**：功能验证和集成测试
- **生产环境**：高可用、可扩展的生产部署

## 🛠️ 环境准备

### 系统要求

#### 服务器配置
```yaml
最低配置:
  CPU: 2核
  内存: 4GB
  存储: 50GB SSD
  带宽: 10Mbps

推荐配置:
  CPU: 4核+
  内存: 8GB+
  存储: 100GB SSD+
  带宽: 100Mbps+
```

#### 操作系统支持
- Ubuntu 20.04 LTS+
- CentOS 8+
- Debian 11+

#### 必需软件
```bash
# Node.js 环境
node --version  # >= 18.0.0
npm --version   # >= 9.0.0

# Docker 环境（可选）
docker --version
docker-compose --version

# 数据库客户端
psql --version  # PostgreSQL客户端
redis-cli --version  # Redis客户端
```

### 依赖服务

#### 数据库服务
```yaml
Supabase PostgreSQL:
  版本: 15.x
  连接数: 100+
  存储空间: 20GB+

Lionfix 数据库:
  类型: PostgreSQL
  权限: 只读连接
  连接数: 20
```

#### 缓存服务
```yaml
Redis:
  版本: 6.0+
  内存: 2GB+
  持久化: RDB + AOF
```

#### 第三方服务
```yaml
对象存储:
  - AWS S3 或阿里云OSS
  - 用于图片和文件存储

消息队列:
  - Redis Streams（内置）
  - 或 RabbitMQ/Kafka

监控服务:
  - Prometheus + Grafana
  - 或阿里云ARMS
```

## ⚙️ 配置管理

### 环境变量配置

#### 核心配置文件
```bash
# .env.production
NODE_ENV=production
PORT=3001

# 数据库配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
LIONFIX_DB_HOST=lionfix-db-host
LIONFIX_DB_PORT=5432
LIONFIX_DB_USER=lionfix-user
LIONFIX_DB_PASSWORD=secure-password
LIONFIX_DB_NAME=lionfix-db

# 缓存配置
REDIS_HOST=redis-host
REDIS_PORT=6379
REDIS_PASSWORD=redis-password

# 安全配置
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-encryption-key

# 第三方服务
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-west-2
S3_BUCKET=fixcycle-assets

# 邮件服务
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@fixcycle.com
SMTP_PASSWORD=app-specific-password
```

#### 配置验证脚本
```bash
#!/bin/bash
# scripts/validate-config.sh

echo "🔍 验证环境配置..."

# 检查必需的环境变量
required_vars=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "SUPABASE_SERVICE_ROLE_KEY"
  "LIONFIX_DB_HOST"
  "JWT_SECRET"
)

for var in "${required_vars[@]}"; do
  if [[ -z "${!var}" ]]; then
    echo "❌ 缺少环境变量: $var"
    exit 1
  fi
done

echo "✅ 配置验证通过"
```

### 数据库初始化

#### 迁移脚本执行
```bash
# 执行数据库迁移
npm run db:migrate

# 验证迁移状态
npm run db:status

# 初始化基础数据
npm run seed:enhanced
```

#### 数据库备份策略
```bash
#!/bin/bash
# scripts/backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/fixcycle"

# Supabase备份
pg_dump -h $SUPABASE_HOST -U $SUPABASE_USER -d $SUPABASE_DB \
  > "$BACKUP_DIR/supabase_$DATE.sql"

# Lionfix只读备份（结构）
pg_dump -h $LIONFIX_HOST -U $LIONFIX_USER -d $LIONFIX_DB --schema-only \
  > "$BACKUP_DIR/lionfix_schema_$DATE.sql"

# 压缩备份文件
gzip "$BACKUP_DIR/*.sql"

# 清理7天前的备份
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete
```

## 🚀 部署流程

### 1. 本地开发部署

#### 快速启动
```bash
# 克隆代码仓库
git clone https://github.com/your-org/fixcycle.git
cd fixcycle

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 文件

# 启动开发服务器
npm run dev

# 访问应用
open http://localhost:3001
```

#### 开发环境健康检查
```bash
# 运行健康检查
npm run check:health

# 验证核心功能
npm run test:core-api

# 检查数据库连接
npm run verify:database
```

### 2. 容器化部署

#### Docker Compose 部署
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/prod:/etc/nginx/conf.d
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  redis_data:
```

#### 部署命令
```bash
# 构建并启动服务
docker-compose -f docker-compose.prod.yml up -d

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker-compose.prod.yml logs -f

# 停止服务
docker-compose -f docker-compose.prod.yml down
```

### 3. 云平台部署

#### Vercel 部署
```bash
# 安装Vercel CLI
npm install -g vercel

# 部署到Vercel
vercel --prod

# 环境变量设置
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

#### 阿里云部署
```bash
# 使用阿里云容器服务ACK
aliyun cs kubernetes create \
  --name fixcycle-cluster \
  --region cn-beijing \
  --kubernetes-version 1.24.6-aliyun.1

# 部署应用
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

## 📊 监控与告警

### 系统监控配置

#### Prometheus 监控
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'fixcycle-app'
    static_configs:
      - targets: ['localhost:3001']
    metrics_path: '/api/metrics'

  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']

  - job_name: 'postgresql'
    static_configs:
      - targets: ['localhost:9187']
```

#### Grafana 仪表板
```json
{
  "dashboard": {
    "title": "FixCycle 监控面板",
    "panels": [
      {
        "title": "API响应时间",
        "type": "graph",
        "targets": [
          "rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])"
        ]
      },
      {
        "title": "系统资源使用率",
        "type": "gauge",
        "targets": [
          "node_cpu_seconds_total",
          "node_memory_bytes_total"
        ]
      }
    ]
  }
}
```

### 告警规则设置

#### 关键指标告警
```yaml
# alert-rules.yml
groups:
  - name: fixcycle-alerts
    rules:
      # API错误率告警
      - alert: HighAPIErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.01
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "API错误率过高"
          description: "{{ $labels.instance }} API错误率超过1%"

      # 响应时间告警
      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "API响应时间过慢"
          description: "{{ $labels.instance }} 95%请求响应时间超过1秒"

      # 系统资源告警
      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "内存使用率过高"
          description: "{{ $labels.instance }} 内存使用率超过80%"
```

### 日志管理

#### 应用日志配置
```javascript
// src/lib/logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// 生产环境添加阿里云SLS
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.Http({
    host: 'cn-hangzhou.log.aliyuncs.com',
    path: '/logstores/fixcycle-app',
    ssl: true
  }));
}
```

#### 日志轮转配置
```bash
# /etc/logrotate.d/fixcycle
/var/log/fixcycle/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 www-data adm
}
```

## 🔧 运维操作

### 日常维护任务

#### 健康检查脚本
```bash
#!/bin/bash
# scripts/health-check.sh

echo "🏥 执行健康检查..."

# 检查应用状态
curl -f http://localhost:3001/api/health || {
  echo "❌ 应用服务异常"
  exit 1
}

# 检查数据库连接
PGPASSWORD=$SUPABASE_PASSWORD pg_isready -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER || {
  echo "❌ 数据库连接失败"
  exit 1
}

# 检查Redis连接
redis-cli ping | grep -q "PONG" || {
  echo "❌ Redis服务异常"
  exit 1
}

echo "✅ 所有服务正常运行"
```

#### 数据备份任务
```bash
#!/bin/bash
# crontab 配置
# 每天凌晨2点执行备份
0 2 * * * /opt/fixcycle/scripts/backup-database.sh >> /var/log/fixcycle-backup.log 2>&1

# 每周一执行完整备份
0 3 * * 1 /opt/fixcycle/scripts/backup-full.sh >> /var/log/fixcycle-backup.log 2>&1
```

### 故障排除

#### 常见问题诊断

**应用启动失败**
```bash
# 检查端口占用
lsof -i :3001

# 查看应用日志
tail -f logs/error.log

# 检查环境变量
printenv | grep NEXT_PUBLIC
```

**数据库连接问题**
```bash
# 测试数据库连接
PGPASSWORD=$SUPABASE_PASSWORD psql -h $SUPABASE_HOST -U $SUPABASE_USER -d $SUPABASE_DB -c "SELECT 1;"

# 检查连接池状态
SELECT count(*) FROM pg_stat_activity WHERE datname = 'your_database';
```

**性能问题排查**
```bash
# 查看系统资源使用
htop
iotop
iftop

# 数据库慢查询分析
SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
```

### 版本升级流程

#### 灰度发布策略
```bash
# 1. 部署新版本到灰度环境
kubectl set image deployment/fixcycle-app app=fixcycle:v2.1.0-beta

# 2. 监控灰度环境指标
while true; do
  curl -s http://gray.fixcycle.com/api/health | jq '.status'
  sleep 30
done

# 3. 逐步切换流量
kubectl patch virtualservice fixcycle -p '{"spec":{"http":[{"route":[{"destination":{"host":"fixcycle-app"},"weight":90},{"destination":{"host":"fixcycle-app-canary"},"weight":10}]}]}}'

# 4. 全量发布
kubectl set image deployment/fixcycle-app app=fixcycle:v2.1.0
```

#### 回滚操作
```bash
# 回滚到上一个版本
kubectl rollout undo deployment/fixcycle-app

# 查看回滚状态
kubectl rollout status deployment/fixcycle-app

# 确认回滚成功
kubectl get pods -l app=fixcycle-app
```

## 📈 性能优化

### 应用层优化

#### 缓存策略实施
```javascript
// Redis缓存中间件
export async function cacheMiddleware(req, res, next) {
  const cacheKey = `${req.method}:${req.url}`;
  
  // 尝试从缓存获取
  const cached = await redis.get(cacheKey);
  if (cached) {
    res.setHeader('X-Cache', 'HIT');
    return res.json(JSON.parse(cached));
  }
  
  // 执行原逻辑并缓存结果
  const originalJson = res.json;
  res.json = function(data) {
    redis.setex(cacheKey, 300, JSON.stringify(data)); // 5分钟缓存
    res.setHeader('X-Cache', 'MISS');
    return originalJson.call(this, data);
  };
  
  next();
}
```

#### 数据库查询优化
```sql
-- 添加复合索引
CREATE INDEX idx_orders_user_status_created ON orders(user_id, status, created_at DESC);

-- 优化慢查询
EXPLAIN ANALYZE 
SELECT o.*, u.name as user_name, s.name as shop_name 
FROM orders o 
JOIN users u ON o.user_id = u.id 
JOIN shops s ON o.shop_id = s.id 
WHERE o.created_at > NOW() - INTERVAL '30 days' 
ORDER BY o.created_at DESC 
LIMIT 20;
```

### 基础设施优化

#### CDN配置
```nginx
# nginx.conf
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location /api/ {
    proxy_pass http://app_backend;
    proxy_cache_valid 200 5m;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
}
```

#### 负载均衡配置
```haproxy
# haproxy.cfg
frontend fixcycle_frontend
    bind *:80
    bind *:443 ssl crt /etc/ssl/certs/fixcycle.pem
    default_backend fixcycle_backend

backend fixcycle_backend
    balance roundrobin
    option httpchk GET /api/health
    server app1 10.0.1.10:3001 check
    server app2 10.0.1.11:3001 check
    server app3 10.0.1.12:3001 check
```

## 🛡️ 安全加固

### 网络安全
```bash
# 防火墙配置
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# IP限制访问
iptables -A INPUT -p tcp --dport 3001 -s 192.168.1.0/24 -j ACCEPT
iptables -A INPUT -p tcp --dport 3001 -j DROP
```

### 应用安全
```javascript
// 安全头设置
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## 📞 运维支持

### 紧急联系方式
- **系统管理员**：admin@fixcycle.com
- **技术支持**：support@fixcycle.com
- **值班电话**：400-XXX-XXXX

### 文档资源
- **操作手册**：https://docs.fixcycle.com/ops
- **故障处理**：https://docs.fixcycle.com/troubleshooting
- **API文档**：https://docs.fixcycle.com/api

---

*部署版本: v3.0*  
*最后更新: 2024年2月21日*  
*适用环境: 生产环境*
