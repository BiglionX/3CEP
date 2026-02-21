# n8n工作流部署操作手册

## 概述

本文档详细介绍n8n工作流系统的部署流程、配置要求和上线检查清单，确保生产环境部署的标准化和可靠性。

## 部署前提条件

### 环境要求

#### 服务器配置
```
最低配置:
- CPU: 4核
- 内存: 8GB RAM
- 存储: 50GB SSD
- 网络: 100Mbps带宽

推荐配置:
- CPU: 8核
- 内存: 16GB RAM
- 存储: 100GB SSD
- 网络: 1Gbps带宽
```

#### 软件依赖
- Docker 20.10+
- Docker Compose 1.29+
- Node.js 16+ (可选)
- Git 2.30+

#### 网络要求
- 公网可访问的域名/IP
- SSL证书配置
- 防火墙开放端口: 5678, 443, 80

### 权限准备
- n8n管理员账号
- 相关API服务访问权限
- 数据库连接权限
- 监控系统接入权限

## 部署流程详解

### 第一步：环境准备

#### 1.1 服务器初始化
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要软件
sudo apt install docker docker-compose git curl jq -y

# 启动Docker服务
sudo systemctl start docker
sudo systemctl enable docker
```

#### 1.2 项目代码获取
```bash
# 克隆项目代码
git clone https://github.com/your-org/3cep.git /opt/n8n-workflows
cd /opt/n8n-workflows

# 切换到部署分支
git checkout production
```

#### 1.3 配置文件准备
```bash
# 复制环境配置模板
cp .env.n8n.example .env.n8n

# 编辑环境变量
vim .env.n8n
```

关键环境变量配置：
```bash
# n8n基础配置
N8N_PORT=5678
N8N_PROTOCOL=https
N8N_HOST=workflows.yourdomain.com

# 安全配置
N8N_ENCRYPTION_KEY=your_strong_encryption_key_here
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your_secure_password

# 数据库配置
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=postgres.yourdomain.com
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_USER=n8n_user
DB_POSTGRESDB_PASSWORD=your_db_password
DB_POSTGRESDB_DATABASE=n8n_prod
```

### 第二步：服务部署

#### 2.1 启动基础服务
```bash
# 使用docker-compose启动n8n及相关服务
docker-compose -f docker-compose.n8n.yml up -d

# 检查服务状态
docker-compose -f docker-compose.n8n.yml ps
```

#### 2.2 等待服务就绪
```bash
# 等待n8n启动完成
until curl -f https://workflows.yourdomain.com/healthz; do
  echo "等待n8n服务启动..."
  sleep 10
done

echo "n8n服务启动成功"
```

#### 2.3 初始化配置
```bash
# 创建管理员用户
docker exec n8n n8n create-user \
  --email admin@yourdomain.com \
  --password your_admin_password \
  --firstName Admin \
  --lastName User

# 设置全局环境变量
curl -X POST "https://workflows.yourdomain.com/variables" \
  -H "Authorization: Bearer $N8N_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"NODE_ENV","value":"production"}'
```

### 第三步：工作流部署

#### 3.1 使用自动化脚本部署
```bash
# 设置部署环境变量
export N8N_API_URL="https://workflows.yourdomain.com"
export N8N_API_TOKEN="your_production_api_token"
export DEPLOY_ENV="production"

# 执行部署脚本
chmod +x scripts/deploy-n8n-workflows.sh
./scripts/deploy-n8n-workflows.sh

# 或者使用Windows版本
scripts\deploy-n8n-workflows.bat
```

#### 3.2 手动部署验证
```bash
# 验证工作流导入成功
curl -X GET "https://workflows.yourdomain.com/workflows" \
  -H "Authorization: Bearer $N8N_API_TOKEN" \
  | jq '.[] | {id, name, active}'

# 测试Webhook端点
curl -X POST "https://workflows.yourdomain.com/webhook/scan-service" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### 第四步：集成测试

#### 4.1 运行集成测试套件
```bash
# 执行完整的集成测试
npm run test:n8n-integration

# 或使用单独的测试脚本
node scripts/test-workflow-suite.js
```

#### 4.2 关键功能验证
```bash
# 测试扫码服务工作流
curl -X POST "https://workflows.yourdomain.com/webhook/scan-service" \
  -H "Content-Type: application/json" \
  -d @test/fixtures/scan-test-data.json

# 测试支付成功工作流
curl -X POST "https://workflows.yourdomain.com/webhook/payment-success" \
  -H "Content-Type: application/json" \
  -d @test/fixtures/payment-test-data.json
```

## 部署检查清单

### 预部署检查 ✓

- [ ] 服务器资源配置满足要求
- [ ] 网络连接和域名解析正常
- [ ] SSL证书已正确安装
- [ ] 数据库连接测试通过
- [ ] 备份策略已制定
- [ ] 监控告警已配置
- [ ] 回滚方案已准备

### 部署过程检查 ✓

- [ ] Docker容器正常启动
- [ ] n8n服务响应正常
- [ ] 管理员账号创建成功
- [ ] 环境变量配置正确
- [ ] 工作流文件导入完成
- [ ] Webhook端点可访问
- [ ] API连接测试通过

### 上线后验证 ✓

- [ ] 所有工作流处于激活状态
- [ ] 关键业务流程端到端测试通过
- [ ] 性能指标在正常范围内
- [ ] 监控告警功能正常
- [ ] 日志记录完整准确
- [ ] 用户访问无异常
- [ ] 安全配置生效

## 监控和告警配置

### 核心监控指标

#### 系统级别监控
```yaml
# Prometheus监控配置
- name: n8n_system_metrics
  rules:
    - alert: HighCPUUsage
      expr: rate(container_cpu_usage_seconds_total{container="n8n"}[5m]) > 0.8
      for: 2m
      labels:
        severity: warning
      annotations:
        summary: "n8n CPU使用率过高"
        description: "CPU使用率超过80%，当前值为{{ $value }}"

    - alert: HighMemoryUsage
      expr: container_memory_usage_bytes{container="n8n"} / container_memory_limit_bytes{container="n8n"} > 0.85
      for: 2m
      labels:
        severity: warning
      annotations:
        summary: "n8n内存使用率过高"
        description: "内存使用率超过85%，当前值为{{ $value }}"
```

#### 应用级别监控
```json
{
  "监控项": {
    "工作流执行成功率": {
      "指标": "workflow_execution_success_rate",
      "阈值": "> 95%",
      "告警": "邮件+钉钉"
    },
    "平均响应时间": {
      "指标": "average_response_time",
      "阈值": "< 2秒",
      "告警": "邮件+短信"
    },
    "队列积压": {
      "指标": "pending_executions",
      "阈值": "< 10",
      "告警": "电话+邮件"
    }
  }
}
```

### 告警通知渠道

#### 钉钉机器人配置
```json
{
  "webhook_url": "https://oapi.dingtalk.com/robot/send?access_token=your_token",
  "secret": "your_sign_secret",
  "at_mobiles": ["13800138000"],
  "is_at_all": false
}
```

#### 企业微信群机器人
```json
{
  "webhook_url": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=your_key",
  "mentioned_list": ["@all"],
  "mentioned_mobile_list": ["13800138000"]
}
```

## 故障处理和回滚

### 常见故障场景

#### 1. 服务无法启动
```bash
# 检查容器日志
docker logs n8n

# 检查端口占用
netstat -tlnp | grep 5678

# 重启服务
docker-compose -f docker-compose.n8n.yml restart
```

#### 2. 工作流执行失败
```bash
# 查看执行历史
curl -X GET "https://workflows.yourdomain.com/executions" \
  -H "Authorization: Bearer $N8N_API_TOKEN"

# 重新执行失败的工作流
curl -X POST "https://workflows.yourdomain.com/executions/{executionId}/retry" \
  -H "Authorization: Bearer $N8N_API_TOKEN"
```

#### 3. 数据库连接问题
```bash
# 检查数据库连接
docker exec n8n pg_isready -h postgres.yourdomain.com -p 5432

# 重启数据库连接池
docker-compose -f docker-compose.n8n.yml restart n8n
```

### 回滚操作流程

#### 自动回滚
```bash
# 使用部署脚本回滚
./scripts/deploy-n8n-workflows.sh --rollback \
  --backup-path /opt/n8n-backups/backup_20260220_143022

# 回滚到指定版本
./scripts/deploy-n8n-workflows.sh --rollback-to-tag v1.0.0
```

#### 手动回滚步骤
```bash
# 1. 停止当前服务
docker-compose -f docker-compose.n8n.yml down

# 2. 恢复备份数据
cp /opt/n8n-backups/backup_20260220_143022/workflows.json /tmp/
cp /opt/n8n-backups/backup_20260220_143022/database.sql /tmp/

# 3. 重新导入工作流
curl -X POST "https://workflows.yourdomain.com/workflows/import" \
  -H "Authorization: Bearer $N8N_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d @/tmp/workflows.json

# 4. 重启服务
docker-compose -f docker-compose.n8n.yml up -d
```

## 性能优化建议

### 系统层面优化
```bash
# 调整系统参数
echo 'vm.max_map_count=262144' >> /etc/sysctl.conf
sysctl -p

# 优化Docker配置
mkdir -p /etc/docker
cat > /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3"
  }
}
EOF
```

### n8n配置优化
```bash
# 环境变量优化
N8N_CONCURRENCY=20
N8N_EXECUTION_TIMEOUT=300
N8N_LOG_LEVEL=warn
N8N_QUEUE_HEALTH_CHECK_ACTIVE=true
N8N_QUEUE_HEALTH_CHECK_THRESHOLD=100
```

### 数据库优化
```sql
-- PostgreSQL优化配置
ALTER SYSTEM SET shared_buffers = '2GB';
ALTER SYSTEM SET effective_cache_size = '6GB';
ALTER SYSTEM SET maintenance_work_mem = '512MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
```

## 安全加固措施

### 访问控制
```yaml
# nginx安全配置
server {
    listen 443 ssl http2;
    server_name workflows.yourdomain.com;
    
    # SSL配置
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # 安全头设置
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # 速率限制
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
}
```

### API安全配置
```json
{
  "安全策略": {
    "认证方式": "JWT Token + API Key",
    "访问控制": "基于角色的权限管理",
    "数据加密": "传输层TLS + 应用层AES",
    "审计日志": "完整操作记录",
    "漏洞扫描": "定期安全检测"
  }
}
```

## 文档维护

### 更新记录
| 版本 | 更新日期 | 更新内容 | 负责人 |
|------|----------|----------|--------|
| v1.0.0 | 2026-02-20 | 初始版本发布 | 运维团队 |
| v1.1.0 | 2026-03-01 | 增加安全加固章节 | 安全团队 |

### 维护周期
- **日常维护**: 每日检查服务状态
- **周度维护**: 每周审查监控告警
- **月度维护**: 每月更新安全配置
- **季度维护**: 每季度优化性能配置

---
**文档版本**: v1.0.0  
**适用环境**: n8n v1.0.0+  
**最后更新**: 2026年2月20日  
**维护团队**: 技术运维部