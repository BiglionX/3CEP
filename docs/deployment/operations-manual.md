# 运维手册

## 目录

1. [日常运维操作](#日常运维操作)
2. [监控与告警](#监控与告警)
3. [备份与恢复](#备份与恢复)
4. [故障排查](#故障排查)
5. [性能优化](#性能优化)
6. [安全维护](#安全维护)

## 日常运维操作

### 系统状态检查

```bash
# 检查所有服务状态
npm run ops:status

# 检查数据库连接
npm run ops:db-status

# 检查n8n工作流状态
npm run ops:n8n-status
```

### 日志管理

```bash
# 查看应用日志
npm run ops:logs

# 查看错误日志
npm run ops:logs:error

# 实时监控日志
npm run ops:logs:live
```

### 资源监控

```bash
# CPU和内存使用情况
npm run ops:resources

# 磁盘空间检查
npm run ops:disk-space

# 网络连接状态
npm run ops:network
```

## 监控与告警

### 系统监控配置

#### 应用层面监控

```yaml
# 监控指标配置
metrics:
  - name: response_time
    threshold: 1000ms
    alert: email,slack

  - name: error_rate
    threshold: 5%
    alert: email,pagerduty

  - name: uptime
    threshold: 99.9%
    alert: email
```

#### 数据库监控

```sql
-- 关键性能指标查询
SELECT
  datname,
  numbackends as connections,
  xact_commit as transactions_committed,
  xact_rollback as transactions_rolled_back,
  blks_read as blocks_read,
  blks_hit as blocks_hit
FROM pg_stat_database
WHERE datname = 'postgres';
```

### 告警规则设置

#### 基础设施告警

```javascript
// 系统资源告警
const alerts = {
  cpu: {
    warning: 80, // 80% 警告
    critical: 90, // 90% 严重
  },
  memory: {
    warning: 85,
    critical: 95,
  },
  disk: {
    warning: 80,
    critical: 90,
  },
};
```

#### 应用性能告警

```javascript
// API性能告警
const apiAlerts = {
  responseTime: {
    p95: 1000, // 95%请求响应时间超过1秒
    p99: 3000, // 99%请求响应时间超过3秒
  },
  errorRate: 5, // 错误率超过5%
  throughput: 1000, // 每秒请求数低于1000
};
```

## 备份与恢复

### 数据库备份策略

#### 自动备份配置

```bash
# 每日备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/database"
DB_NAME="fixcycle_prod"

# 执行备份
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# 压缩备份文件
gzip $BACKUP_DIR/backup_$DATE.sql

# 清理7天前的备份
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

#### 备份验证

```bash
# 验证备份完整性
npm run ops:backup:verify

# 恢复测试
npm run ops:backup:test-restore
```

### 应用配置备份

```bash
# 备份重要配置文件
npm run ops:backup:config

# 备份n8n工作流
npm run ops:backup:n8n-workflows
```

### 灾难恢复流程

1. **评估损坏程度**
2. **确定恢复点目标(RPO)和恢复时间目标(RTO)**
3. **执行恢复操作**
4. **验证恢复结果**
5. **更新灾难恢复文档**

## 故障排查

### 常见问题诊断

#### 数据库连接问题

```bash
# 诊断步骤
1. 检查网络连通性
   ping $DB_HOST

2. 验证认证信息
   psql -h $DB_HOST -U $DB_USER -d postgres -c "SELECT 1"

3. 检查连接池状态
   npm run ops:db:pool-status

4. 查看详细错误日志
   npm run ops:logs:database
```

#### 应用性能问题

```bash
# 性能诊断流程
1. 检查系统资源使用
   npm run ops:resources

2. 分析慢查询
   npm run ops:db:slow-queries

3. 检查应用日志中的错误
   npm run ops:logs:error

4. 监控API响应时间
   npm run ops:api:monitor
```

#### n8n 工作流异常

```bash
# 工作流故障排查
1. 检查n8n服务状态
   npm run ops:n8n:status

2. 查看工作流执行历史
   npm run ops:n8n:executions

3. 验证Webhook配置
   npm run ops:n8n:webhooks

4. 检查节点错误详情
   npm run ops:n8n:errors
```

### 故障排除工具

```bash
# 综合诊断脚本
npm run ops:diagnose

# 网络连通性测试
npm run ops:network:test

# 依赖服务健康检查
npm run ops:health-check
```

## 性能优化

### 数据库优化

#### 查询优化

```sql
-- 查找慢查询
SELECT
  query,
  mean_time,
  calls,
  total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- 添加索引建议
CREATE INDEX CONCURRENTLY idx_appointments_status_created
ON appointments(status, created_at);

-- 分析查询执行计划
EXPLAIN ANALYZE
SELECT * FROM appointments
WHERE status = 'confirmed'
AND created_at > NOW() - INTERVAL '7 days';
```

#### 连接池优化

```javascript
// PostgreSQL连接池配置
const poolConfig = {
  max: 20, // 最大连接数
  min: 5, // 最小连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  acquireTimeoutMillis: 30000,
};
```

### 应用层优化

#### 缓存策略

```javascript
// Redis缓存配置
const cacheConfig = {
  ttl: 3600, // 默认缓存时间1小时
  maxItems: 10000, // 最大缓存项数
  compression: true, // 启用压缩
};

// 缓存热点数据
const hotDataKeys = [
  'shop_listings',
  'popular_parts',
  'system_config',
  'user_permissions',
];
```

#### API 优化

```javascript
// 请求限流配置
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 100次请求
  message: 'Too many requests from this IP',
};
```

## 安全维护

### 安全扫描

```bash
# 依赖安全检查
npm audit

# 安全漏洞扫描
npm run security:scan

# 权限审计
npm run security:audit
```

### 访问控制

#### 用户权限管理

```sql
-- 定期审查用户权限
SELECT
  u.email,
  r.name as role,
  COUNT(p.id) as permissions
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
GROUP BY u.email, r.name
ORDER BY u.email;
```

#### API 密钥轮换

```bash
# 轮换API密钥
npm run security:rotate-keys

# 验证密钥有效性
npm run security:validate-keys
```

### 合规性检查

```bash
# GDPR合规检查
npm run compliance:gdpr-check

# 数据保留策略验证
npm run compliance:data-retention

# 隐私政策合规性
npm run compliance:privacy-check
```

## 维护计划

### 日常维护任务

| 时间 | 任务         | 负责人     | 验证方法                        |
| ---- | ------------ | ---------- | ------------------------------- |
| 每日 | 系统健康检查 | 运维工程师 | `npm run ops:daily-check`       |
| 每日 | 备份验证     | DBA        | `npm run ops:backup:verify`     |
| 每周 | 性能分析     | SRE        | `npm run ops:weekly-analysis`   |
| 每月 | 安全扫描     | 安全工程师 | `npm run security:monthly-scan` |

### 版本升级计划

#### 小版本升级 (Patch)

- 频率: 每周
- 影响: 无停机时间
- 回滚: 自动回滚机制

#### 大版本升级 (Major/Minor)

- 频率: 每季度
- 影响: 需要维护窗口
- 回滚: 手动回滚预案

### 维护窗口安排

```yaml
# 维护窗口配置
maintenance_windows:
  - day: Sunday
    time: 02:00-04:00
    timezone: UTC+8
    purpose: 系统升级和维护

  - day: Wednesday
    time: 01:00-02:00
    timezone: UTC+8
    purpose: 数据库维护
```

## 应急响应

### 事故处理流程

1. **事故发现和报告**
2. **影响评估**
3. **紧急响应**
4. **根本原因分析**
5. **修复实施**
6. **事后总结**

### 联系人清单

| 角色       | 联系方式                 | 响应时间 |
| ---------- | ------------------------ | -------- |
| 一线支持   | support@fixcycle.com     | 15 分钟  |
| 技术负责人 | tech-lead@fixcycle.com   | 30 分钟  |
| 运维主管   | ops-manager@fixcycle.com | 1 小时   |
| 安全官     | security@fixcycle.com    | 2 小时   |

---

_最后更新: 2026-02-20_
