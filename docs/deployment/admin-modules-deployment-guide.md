# 管理后台部署和运维指南

## 📋 概述

本指南详细说明管理后台模块的部署流程、运维监控和故障处理方法。

## 🚀 部署流程

### 环境要求

#### 服务器配置

- **CPU**: 4核及以上
- **内存**: 8GB及以上
- **存储**: 100GB SSD及以上
- **操作系统**: Ubuntu 20.04 LTS 或 CentOS 8

#### 软件依赖

```bash
# Node.js 环境
Node.js >= 18.x
npm >= 9.x

# 数据库
PostgreSQL >= 14.x
Redis >= 6.x

# 其他工具
Docker >= 20.x (可选)
Nginx >= 1.20.x
PM2 >= 5.x
```

### 部署步骤

#### 1. 代码获取和初始化

```bash
# 克隆代码仓库
git clone https://github.com/your-org/fixcycle-admin.git
cd fixcycle-admin

# 安装依赖
npm install

# 环境变量配置
cp .env.example .env
# 编辑 .env 文件，配置数据库连接、API密钥等
```

#### 2. 数据库初始化

```bash
# 创建数据库
createdb fixcycle_admin

# 运行迁移脚本
npm run migrate

# 初始化种子数据
npm run seed
```

#### 3. 构建和启动

```bash
# 生产环境构建
npm run build

# 启动应用
pm2 start ecosystem.config.js --env production

# 查看应用状态
pm2 list
pm2 logs admin-app
```

#### 4. Nginx配置

```nginx
server {
    listen 80;
    server_name admin.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Docker部署（推荐）

#### Docker Compose配置

```yaml
version: '3.8'

services:
  admin-app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/fixcycle_admin
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:14
    environment:
      POSTGRES_DB: fixcycle_admin
      POSTGRES_USER: admin_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:6-alpine
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - admin-app
    restart: unless-stopped

volumes:
  postgres_data:
```

#### 启动命令

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f admin-app
```

---

## 📊 运维监控

### 系统监控指标

#### 关键性能指标(KPI)

```bash
# CPU使用率监控
top -p $(pgrep -f "node.*admin")

# 内存使用情况
free -h

# 磁盘空间监控
df -h

# 网络连接数
netstat -an | grep :3000 | wc -l
```

#### 应用性能监控

```javascript
// PM2监控配置
module.exports = {
  apps: [
    {
      name: 'admin-app',
      script: './dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      min_uptime: '5m',
      max_restarts: 10,
    },
  ],
};
```

### 日志管理

#### 日志级别配置

```typescript
// logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export default logger;
```

#### 日志轮转配置

```bash
# /etc/logrotate.d/admin-app
/var/www/fixcycle-admin/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 健康检查

#### 应用健康检查端点

```typescript
// healthCheck.ts
app.get('/health', async (req, res) => {
  const checks = {
    database: await checkDatabaseConnection(),
    redis: await checkRedisConnection(),
    diskSpace: await checkDiskSpace(),
    memory: process.memoryUsage(),
  };

  const isHealthy = Object.values(checks).every(check => check === true);

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    checks,
  });
});
```

#### 监控脚本

```bash
#!/bin/bash
# monitor.sh

HEALTH_ENDPOINT="http://localhost:3000/health"
SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

check_health() {
    response=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_ENDPOINT)

    if [ $response -ne 200 ]; then
        send_alert "Admin系统健康检查失败，HTTP状态码: $response"
    fi
}

send_alert() {
    message="$1"
    curl -X POST -H 'Content-type: application/json' \
         --data "{\"text\":\"$message\"}" \
         $SLACK_WEBHOOK
}

check_health
```

---

## 🔧 故障处理

### 常见问题排查

#### 1. 应用无法启动

```bash
# 检查端口占用
lsof -i :3000

# 查看PM2日志
pm2 logs admin-app --lines 100

# 检查环境变量
printenv | grep -i admin

# 检查依赖安装
npm list --depth=0
```

#### 2. 数据库连接失败

```bash
# 测试数据库连接
psql -h localhost -U admin_user -d fixcycle_admin -c "SELECT 1;"

# 检查连接池状态
SELECT * FROM pg_stat_activity WHERE datname = 'fixcycle_admin';

# 重启数据库服务
sudo systemctl restart postgresql
```

#### 3. 内存泄漏问题

```bash
# 监控内存使用
watch -n 5 'ps aux | grep "node.*admin" | grep -v grep'

# 生成堆快照
node --inspect-brk dist/server.js
# 然后使用Chrome DevTools分析内存

# 强制垃圾回收
kill -USR2 $(pgrep -f "node.*admin")
```

### 应急响应流程

#### 1. 系统宕机应急处理

```bash
# 立即重启应用
pm2 restart admin-app

# 检查错误日志
pm2 logs admin-app --lines 50

# 回滚到上一个稳定版本
git checkout tags/v1.2.3
npm run build
pm2 reload admin-app
```

#### 2. 数据库故障处理

```bash
# 检查主从同步状态
SELECT client_addr, state, sync_state FROM pg_stat_replication;

# 从备份恢复数据
pg_restore -d fixcycle_admin -v backup_file.dump

# 切换到备用数据库
# 更新 .env 中的 DATABASE_URL
pm2 reload admin-app
```

#### 3. 安全事件响应

```bash
# 立即封锁可疑IP
iptables -A INPUT -s suspicious_ip -j DROP

# 检查登录日志
journalctl -u admin-app --since "1 hour ago"

# 重置所有会话
redis-cli FLUSHALL

# 审计安全日志
cat /var/log/auth.log | grep admin
```

---

## 🔒 安全加固

### 系统安全配置

#### 1. 防火墙设置

```bash
# UFW防火墙配置
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

#### 2. SSL证书配置

```bash
# 使用Let's Encrypt免费SSL证书
certbot --nginx -d admin.yourdomain.com

# 自动续期配置
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

#### 3. 安全头配置

```nginx
# nginx.conf 安全配置
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### 应用安全措施

#### 1. 输入验证和过滤

```typescript
// 使用Helmet中间件
import helmet from 'helmet';

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
);
```

#### 2. 速率限制

```typescript
// API速率限制
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 100次请求
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: '请求过于频繁，请稍后再试',
  },
});

app.use('/api/', limiter);
```

#### 3. 定期安全扫描

```bash
# 安装安全扫描工具
npm install -g nsp
npm install -g snyk

# 运行安全检查
nsp check
snyk test

# 自动化安全检查脚本
#!/bin/bash
cd /var/www/fixcycle-admin
npm audit --audit-level high
```

---

## 📈 性能优化

### 数据库优化

#### 1. 索引优化

```sql
-- 创建复合索引
CREATE INDEX idx_users_status_created ON users(status, created_at);
CREATE INDEX idx_devices_group_status ON devices(group_id, status);

-- 查询执行计划分析
EXPLAIN ANALYZE SELECT * FROM users WHERE status = 'active' ORDER BY created_at DESC LIMIT 20;
```

#### 2. 连接池配置

```typescript
// 数据库连接池配置
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // 最大连接数
  min: 5, // 最小连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 缓存策略

#### 1. Redis缓存配置

```typescript
// Redis缓存中间件
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  retryStrategy: times => Math.min(times * 50, 2000),
});

// 缓存装饰器
function cache(ttl: number = 300) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        return JSON.parse(cached);
      }

      const result = await method.apply(this, args);
      await redis.setex(cacheKey, ttl, JSON.stringify(result));
      return result;
    };
  };
}
```

#### 2. CDN配置

```nginx
# 静态资源CDN配置
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Access-Control-Allow-Origin "*";

    # CDN加速
    proxy_pass http://your-cdn-domain;
}
```

---

## 🔄 备份和恢复

### 自动备份策略

#### 1. 数据库备份脚本

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backup/admin"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="fixcycle_admin"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 数据库备份
pg_dump -h localhost -U admin_user $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# 文件备份
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /var/www/fixcycle-admin/uploads

# 保留最近30天的备份
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

# 上传到云存储
aws s3 cp $BACKUP_DIR s3://your-backup-bucket/admin/ --recursive
```

#### 2. 备份调度配置

```bash
# 添加到crontab
# 每天凌晨2点执行备份
0 2 * * * /bin/bash /opt/scripts/backup.sh >> /var/log/backup.log 2>&1
```

### 灾难恢复流程

#### 1. 完整恢复步骤

```bash
# 1. 停止应用服务
pm2 stop admin-app

# 2. 恢复数据库
dropdb fixcycle_admin
createdb fixcycle_admin
psql -d fixcycle_admin -f /backup/db_backup_latest.sql

# 3. 恢复文件
tar -xzf /backup/files_backup_latest.tar.gz -C /

# 4. 启动应用
pm2 start admin-app

# 5. 验证恢复结果
curl -f http://localhost:3000/health
```

#### 2. 增量恢复脚本

```bash
#!/bin/bash
# incremental_restore.sh

BACKUP_DATE=$1
if [ -z "$BACKUP_DATE" ]; then
    echo "请指定备份日期，格式: YYYYMMDD_HHMMSS"
    exit 1
fi

# 恢复增量数据
pg_restore -d fixcycle_admin -v /backup/incr_backup_$BACKUP_DATE.dump

# 重新索引
psql -d fixcycle_admin -c "REINDEX DATABASE fixcycle_admin;"
```

---

## 📞 运维支持

### 联系方式

- **运维团队**: ops@fixcycle.com
- **紧急联系电话**: 400-XXX-XXXX
- **运维文档**: https://ops.fixcycle.com

### 监控告警

```bash
# 设置监控告警
# CPU使用率超过80%告警
*/5 * * * * /opt/scripts/monitor_cpu.sh

# 内存使用率超过85%告警
*/5 * * * * /opt/scripts/monitor_memory.sh

# 磁盘空间低于10%告警
*/30 * * * * /opt/scripts/monitor_disk.sh
```

---

**文档版本**: v1.0  
**最后更新**: 2026年2月28日  
**适用版本**: Management System v2.0+
