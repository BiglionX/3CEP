# 采购智能体管理员部署指南

## 📋 文档信息

- **文档版本**: v1.0
- **适用系统**: FixCycle 采购智能体 v2.0
- **编写日期**: 2026年2月26日
- **目标读者**: 系统管理员、DevOps工程师、IT运维人员

---

## 🎯 部署概述

本指南详细说明采购智能体系统的部署、配置和维护流程，确保系统能够稳定、安全地运行。

### 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端应用层     │    │   API服务层      │    │   数据存储层     │
│                 │    │                 │    │                 │
│ • React/Next.js │◄──►│ • RESTful APIs  │◄──►│ • Supabase DB   │
│ • 组件化UI      │    │ • 微服务架构    │    │ • 实时同步      │
│ • 响应式设计    │    │ • 负载均衡      │    │ • 数据备份      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   监控告警层     │    │   安全防护层     │    │   集成适配层     │
│                 │    │                 │    │                 │
│ • 性能监控      │    │ • 身份认证      │    │ • n8n集成       │
│ • 日志收集      │    │ • 权限控制      │    │ • 外贸系统对接   │
│ • 告警通知      │    │ • 数据加密      │    │ • API网关       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🛠️ 部署前准备

### 1. 环境要求

#### 1.1 服务器配置

**最小配置**:

- CPU: 4核
- 内存: 8GB RAM
- 存储: 100GB SSD
- 网络: 100Mbps带宽

**推荐配置**:

- CPU: 8核
- 内存: 16GB RAM
- 存储: 500GB SSD
- 网络: 1Gbps带宽

#### 1.2 软件依赖

| 软件           | 版本要求 | 用途               |
| -------------- | -------- | ------------------ |
| Node.js        | ≥ 18.x   | 运行时环境         |
| npm/yarn       | 最新版本 | 包管理器           |
| Docker         | ≥ 20.x   | 容器化部署         |
| Docker Compose | ≥ 1.29   | 容器编排           |
| PostgreSQL     | ≥ 13.x   | 数据库（如果自建） |
| Redis          | ≥ 6.x    | 缓存服务           |

#### 1.3 云服务依赖

- **Supabase**: 数据库存储和实时功能
- **Vercel**: 前端应用托管（可选）
- **Cloudflare**: CDN和安全防护（可选）

### 2. 域名和SSL证书

- 准备域名：`procurement-intelligence.yourcompany.com`
- 申请SSL证书（推荐Let's Encrypt免费证书）
- 配置DNS解析指向服务器IP

### 3. 安全准备

- 配置防火墙规则
- 设置SSH密钥认证
- 创建专用部署用户
- 准备备份存储空间

---

## 🚀 部署步骤

### 1. 获取部署包

```bash
# 克隆项目代码
git clone https://github.com/yourcompany/fixcycle.git
cd fixcycle

# 切换到采购智能体分支
git checkout procurement-intelligence-v2.0

# 安装依赖
npm install
```

### 2. 环境配置

#### 2.1 创建环境变量文件

```bash
# 复制环境配置模板
cp .env.example .env.production

# 编辑环境变量
vim .env.production
```

#### 2.2 核心环境变量配置

```env
# 基础配置
NODE_ENV=production
PORT=3000

# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 数据库配置
DATABASE_URL=postgresql://user:password@host:port/database

# 认证配置
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret

# API密钥
PROCUREMENT_API_KEY=your-api-key
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook

# 监控配置
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info

# 邮件服务
SMTP_HOST=smtp.yourcompany.com
SMTP_PORT=587
SMTP_USER=noreply@yourcompany.com
SMTP_PASS=your-smtp-password
```

### 3. 数据库初始化

#### 3.1 创建数据库表

```bash
# 执行数据库迁移脚本
npm run db:migrate

# 或者手动执行SQL脚本
psql -h your-db-host -U your-db-user -d your-database -f sql/procurement-intelligence/schema.sql
```

#### 3.2 初始化基础数据

```bash
# 运行数据初始化脚本
node scripts/init-procurement-data.js

# 导入供应商数据
node scripts/import-suppliers.js --file=data/suppliers.csv
```

### 4. 构建应用

```bash
# 构建生产版本
npm run build

# 验证构建结果
npm run start
```

### 5. 部署方式选择

#### 方案一：Docker容器部署（推荐）

```bash
# 构建Docker镜像
docker build -t procurement-intelligence:latest .

# 运行容器
docker run -d \
  --name procurement-intelligence \
  --restart unless-stopped \
  -p 3000:3000 \
  -v /var/log/procurement:/app/logs \
  --env-file .env.production \
  procurement-intelligence:latest
```

#### 方案二：Docker Compose部署

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  procurement-app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    depends_on:
      - redis
      - postgres

  redis:
    image: redis:6-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data

  postgres:
    image: postgres:13-alpine
    environment:
      POSTGRES_DB: procurement
      POSTGRES_USER: procurement_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  redis_data:
  postgres_data:
```

```bash
# 启动服务
docker-compose -f docker-compose.prod.yml up -d
```

#### 方案三：传统部署

```bash
# 使用PM2管理进程
npm install -g pm2

# 启动应用
pm2 start ecosystem.config.js

# 设置开机自启
pm2 startup
pm2 save
```

### 6. 反向代理配置

#### Nginx配置示例

```nginx
server {
    listen 80;
    server_name procurement-intelligence.yourcompany.com;

    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name procurement-intelligence.yourcompany.com;

    # SSL配置
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

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

---

## ⚙️ 系统配置

### 1. 功能开关配置

```javascript
// config/features.js
module.exports = {
  // 核心功能开关
  supplierProfiling: true,
  marketIntelligence: true,
  riskAnalysis: true,
  decisionEngine: true,

  // 高级功能开关
  contractAdvisor: true,
  priceOptimization: true,
  n8nIntegration: true,

  // 性能相关配置
  cacheEnabled: true,
  rateLimiting: true,
  requestTimeout: 30000,

  // 安全配置
  twoFactorAuth: true,
  sessionTimeout: 1800000, // 30分钟
};
```

### 2. 监控告警配置

```yaml
# config/monitoring.yml
prometheus:
  enabled: true
  scrape_interval: 15s
  metrics_path: /metrics

alertmanager:
  enabled: true
  smtp_config:
    host: smtp.yourcompany.com
    port: 587
    username: alerts@yourcompany.com
    password: your-smtp-password

rules:
  - alert: HighCPUUsage
    expr: cpu_usage > 80
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: 'CPU使用率过高'
      description: '{{ $labels.instance }} CPU使用率超过80%'
```

### 3. 日志配置

```javascript
// config/logging.js
module.exports = {
  level: 'info',
  format: 'json',
  transports: [
    {
      type: 'file',
      filename: './logs/application.log',
      maxsize: 104857600, // 100MB
      maxFiles: 10,
    },
    {
      type: 'console',
      level: 'error',
    },
  ],
  audit: {
    enabled: true,
    filename: './logs/audit.log',
  },
};
```

---

## 🔧 日常运维

### 1. 系统监控

#### 1.1 关键指标监控

```bash
# CPU和内存使用率
top -p $(pgrep -f "procurement-intelligence")

# 应用进程状态
pm2 list

# 数据库连接数
psql -c "SELECT count(*) FROM pg_stat_activity;"

# API响应时间监控
curl -w "@curl-format.txt" -o /dev/null -s "https://procurement-intelligence.yourcompany.com/api/health"
```

#### 1.2 性能监控脚本

```bash
#!/bin/bash
# monitor.sh

# 检查应用状态
check_app_status() {
  if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ 应用运行正常"
  else
    echo "❌ 应用无响应"
    # 重启应用
    pm2 restart procurement-intelligence
  fi
}

# 检查磁盘空间
check_disk_space() {
  usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
  if [ $usage -gt 80 ]; then
    echo "⚠️  磁盘使用率过高: ${usage}%"
  fi
}

# 检查日志大小
check_log_size() {
  log_size=$(du -sh logs/ | cut -f1)
  echo "📝 日志目录大小: $log_size"
}

# 执行检查
check_app_status
check_disk_space
check_log_size
```

### 2. 备份策略

#### 2.1 数据库备份

```bash
#!/bin/bash
# backup-database.sh

BACKUP_DIR="/backup/procurement"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
pg_dump -h localhost -U procurement_user procurement > $BACKUP_DIR/db_backup_$DATE.sql

# 压缩备份文件
gzip $BACKUP_DIR/db_backup_$DATE.sql

# 删除7天前的备份
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "✅ 数据库备份完成: $BACKUP_DIR/db_backup_$DATE.sql.gz"
```

#### 2.2 应用配置备份

```bash
# 备份重要配置文件
tar -czf /backup/config_backup_$(date +%Y%m%d).tar.gz \
  .env.production \
  config/ \
  docker-compose.prod.yml
```

### 3. 日志管理

```bash
# 日志轮转配置 /etc/logrotate.d/procurement
/var/log/procurement/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 procurement procurement
    postrotate
        pm2 reloadLogs procurement-intelligence
    endscript
}
```

---

## 🔒 安全维护

### 1. 定期安全检查

```bash
# 检查系统更新
apt update && apt list --upgradable

# 检查Node.js依赖安全漏洞
npm audit

# 检查SSL证书有效期
openssl x509 -in /path/to/certificate.crt -text -noout | grep "Not After"

# 检查开放端口
netstat -tlnp | grep LISTEN
```

### 2. 权限管理

```bash
# 设置正确的文件权限
chmod 600 .env.production
chmod 755 logs/
chown -R procurement:procurement /opt/procurement-intelligence

# 限制sudo权限
visudo
# 添加: procurement ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart procurement-intelligence
```

### 3. 安全加固

```bash
# 配置防火墙
ufw allow ssh
ufw allow 80
ufw allow 443
ufw deny 3000  # 禁止直接访问应用端口
ufw enable

# 启用fail2ban
apt install fail2ban
systemctl enable fail2ban
```

---

## 🆘 故障排除

### 常见问题及解决方案

#### 1. 应用启动失败

```bash
# 检查错误日志
tail -f logs/error.log

# 检查端口占用
lsof -i :3000

# 验证环境变量
printenv | grep PROCUREMENT
```

#### 2. 数据库连接问题

```bash
# 测试数据库连接
psql -h localhost -U procurement_user -d procurement -c "SELECT 1;"

# 检查连接池状态
pm2 monit procurement-intelligence
```

#### 3. 性能问题

```bash
# 分析慢查询
psql -c "SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# 检查内存使用
free -h
```

---

## 📊 升级维护

### 版本升级流程

```bash
# 1. 备份当前版本
tar -czf backup_v1.0_$(date +%Y%m%d).tar.gz /opt/procurement-intelligence

# 2. 拉取新版本代码
git fetch origin
git checkout v2.1.0

# 3. 安装新依赖
npm install --production

# 4. 运行数据库迁移
npm run db:migrate

# 5. 重启服务
pm2 reload procurement-intelligence

# 6. 验证升级结果
curl https://procurement-intelligence.yourcompany.com/api/version
```

---

## 📞 技术支持

### 支持联系方式

- **技术支持邮箱**: admin@fixcycle.com
- **紧急联系电话**: 400-ADMIN-001
- **工单系统**: https://support.fixcycle.com

### 故障上报模板

```
故障时间: [YYYY-MM-DD HH:MM]
故障现象: [详细描述]
影响范围: [用户/功能范围]
已尝试解决: [已执行的操作]
日志附件: [相关日志文件]
```

---

## 📅 维护计划

| 维护项目 | 频率   | 负责人     | 说明           |
| -------- | ------ | ---------- | -------------- |
| 系统备份 | 每日   | 运维工程师 | 自动化脚本执行 |
| 安全更新 | 每周   | 安全管理员 | 系统和依赖更新 |
| 性能优化 | 每月   | 系统管理员 | 监控数据分析   |
| 容量规划 | 每季度 | 架构师     | 资源使用评估   |
| 灾难演练 | 每半年 | 运维团队   | 应急预案测试   |

---

**文档结束**

> ⚠️ **重要提醒**: 部署前请仔细阅读本文档，在生产环境中操作时务必谨慎。建议先在测试环境中验证所有配置和流程。
