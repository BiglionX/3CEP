# API集成环境配置模板

## 开发环境配置 (.env.dev)

```env
# 基础配置
NODE_ENV=development
PORT=3001
API_BASE_URL=http://localhost:3001

# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# 安全监控配置
SECURITY_MONITORING_ENABLED=true
THREAT_DETECTION_ENABLED=true
ANOMALY_DETECTION_ENABLED=true
ALERTING_ENABLED=true

# WebSocket配置
WEBSOCKET_PORT=3002
WEBSOCKET_PATH=/socket.io

# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/fixcycle_dev
REDIS_URL=redis://localhost:6379

# 认证配置
JWT_SECRET=dev-jwt-secret-key-here
API_KEY=dev-api-key-here

# 通知渠道配置
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_USER=dev-monitoring@example.com
EMAIL_PASSWORD=your-app-password

SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/DEV/WEBHOOK
WECHAT_WEBHOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_DEV_KEY

# n8n集成配置
N8N_BASE_URL=http://localhost:5678
N8N_API_TOKEN=your-n8n-api-token
```

## 测试环境配置 (.env.stage)

```env
# 基础配置
NODE_ENV=staging
PORT=3001
API_BASE_URL=https://stage.yourdomain.com

# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your-stage-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-stage-service-role-key
SUPABASE_JWT_SECRET=your-stage-jwt-secret

# 安全监控配置
SECURITY_MONITORING_ENABLED=true
THREAT_DETECTION_ENABLED=true
ANOMALY_DETECTION_ENABLED=true
ALERTING_ENABLED=true

# WebSocket配置
WEBSOCKET_PORT=3002
WEBSOCKET_PATH=/socket.io

# 数据库配置
DATABASE_URL=postgresql://user:password@stage-db-host:5432/fixcycle_stage
REDIS_URL=redis://stage-redis-host:6379

# 认证配置
JWT_SECRET=stage-jwt-secret-key-here
API_KEY=stage-api-key-here

# 通知渠道配置
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_USER=stage-monitoring@example.com
EMAIL_PASSWORD=your-stage-app-password

SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/STAGE/WEBHOOK
WECHAT_WEBHOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_STAGE_KEY

# n8n集成配置
N8N_BASE_URL=https://stage-n8n.yourdomain.com
N8N_API_TOKEN=your-stage-n8n-api-token

# 监控配置
PROMETHEUS_ENDPOINT=http://stage-prometheus:9090
GRAFANA_URL=https://stage-grafana.yourdomain.com
```

## 生产环境配置 (.env.prod)

```env
# 基础配置
NODE_ENV=production
PORT=3001
API_BASE_URL=https://api.yourdomain.com

# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your-prod-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-prod-service-role-key
SUPABASE_JWT_SECRET=your-prod-jwt-secret

# 安全监控配置
SECURITY_MONITORING_ENABLED=true
THREAT_DETECTION_ENABLED=true
ANOMALY_DETECTION_ENABLED=true
ALERTING_ENABLED=true

# WebSocket配置
WEBSOCKET_PORT=3002
WEBSOCKET_PATH=/socket.io

# 数据库配置
DATABASE_URL=postgresql://user:password@prod-db-cluster:5432/fixcycle_prod
REDIS_URL=redis://prod-redis-cluster:6379

# 认证配置
JWT_SECRET=prod-jwt-secret-key-here
API_KEY=prod-api-key-here

# 通知渠道配置
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_USER=prod-monitoring@example.com
EMAIL_PASSWORD=your-prod-app-password

SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/PROD/WEBHOOK
WECHAT_WEBHOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_PROD_KEY

# n8n集成配置
N8N_BASE_URL=https://n8n.yourdomain.com
N8N_API_TOKEN=your-prod-n8n-api-token

# 监控配置
PROMETHEUS_ENDPOINT=http://prod-prometheus:9090
GRAFANA_URL=https://grafana.yourdomain.com

# 安全配置
SSL_CERT_PATH=/etc/ssl/certs/your-cert.pem
SSL_KEY_PATH=/etc/ssl/private/your-key.pem
RATE_LIMIT_REQUESTS_PER_MINUTE=1000
```

## 配置说明

### 必填配置项

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase项目URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase服务角色密钥
- `SUPABASE_JWT_SECRET`: JWT签名密钥
- `DATABASE_URL`: PostgreSQL数据库连接字符串
- `JWT_SECRET`: 应用JWT密钥

### 可选配置项

- 通知渠道配置（邮件、Slack、微信等）
- n8n集成配置
- 监控系统配置
- SSL证书路径（生产环境）

### 安全注意事项

1. 所有密钥和密码不应提交到版本控制系统
2. 生产环境配置应通过密钥管理服务注入
3. 定期轮换API密钥和密码
4. 启用适当的访问控制和防火墙规则

## 使用方法

1. 复制对应环境的配置模板
2. 替换占位符为实际值
3. 将配置文件保存为 `.env.[环境名]`
4. 通过环境变量加载配置

```bash
# 开发环境
cp .env.dev.example .env.dev
# 编辑配置后
npm run dev

# 测试环境
cp .env.stage.example .env.stage
# 部署时自动加载
npm run deploy:stage

# 生产环境
cp .env.prod.example .env.prod
# 通过CI/CD流水线注入
npm run deploy:prod
```
