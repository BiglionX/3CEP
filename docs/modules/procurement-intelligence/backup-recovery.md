# 采购智能体备份恢复机制文档

## 概述

本文档详细说明了采购智能体系统的备份和恢复机制，包括备份策略、执行方法、恢复流程以及相关工具的使用。

## 备份策略

### 备份类型

1. **全量备份** - 完整备份所有数据和配置
2. **增量备份** - 仅备份自上次备份以来的变更数据
3. **差异备份** - 备份自上次全量备份以来的所有变更

### 备份频率

- **每日全量备份**: 凌晨2:00执行
- **每4小时增量备份**: 工作时间内执行
- **实时事务日志**: 每分钟归档一次

### 保留策略

- **本地存储**: 保留7天
- **近线存储**: 保留90天
- **离线存储**: 永久保留关键备份

## 备份内容

### 数据库备份

```sql
-- 核心业务表
supplier_intelligence_profiles      -- 供应商智能画像
international_price_indices         -- 国际市场价格指数
procurement_decision_audit          -- 采购决策记录
supplier_capability_scores          -- 供应商能力评分
market_analysis_reports             -- 市场分析报告
risk_assessment_records             -- 风险评估记录
contract_recommendations            -- 合同条款推荐

-- 扩展表
foreign_trade_partners              -- 外贸合作伙伴(扩展字段)
```

### 配置文件备份

```
.env.procurement                    # 环境配置文件
config/procurement-intelligence/    # 配置目录
scripts/procurement-scripts/        # 相关脚本
sql/procurement-*.sql              # SQL脚本文件
```

### 应用数据备份

```
public/uploads/suppliers/           # 供应商资料文件
public/uploads/market-data/         # 市场数据文件
public/reports/procurement/         # 分析报告文件
```

## 使用方法

### 执行备份

#### 方法1: 使用Node.js脚本

```bash
# 执行全量备份
node scripts/backup-procurement.js backup

# 清理过期备份(保留7天)
node scripts/backup-procurement.js cleanup 7

# 列出所有备份
node scripts/backup-procurement.js list
```

#### 方法2: 使用npm脚本

```json
{
  "scripts": {
    "backup:procurement": "node scripts/backup-procurement.js backup",
    "backup:cleanup": "node scripts/backup-procurement.js cleanup",
    "backup:list": "node scripts/backup-procurement.js list"
  }
}
```

#### 方法3: 定时任务(crontab)

```bash
# 每日凌晨2点执行全量备份
0 2 * * * cd /path/to/project && npm run backup:procurement >> logs/backup.log 2>&1

# 每周一清理过期备份
0 3 * * 1 cd /path/to/project && npm run backup:cleanup >> logs/backup-cleanup.log 2>&1
```

### 执行恢复

#### 方法1: 使用Node.js脚本

```bash
# 从指定备份恢复全部内容
node scripts/restore-procurement.js restore procurement-2026-02-26

# 仅恢复数据库(跳过配置和文件)
node scripts/restore-procurement.js restore procurement-2026-02-26 --no-configs --no-files

# 仅恢复配置文件
node scripts/restore-procurement.js restore procurement-2026-02-26 --no-database --no-files

# 列出可用备份
node scripts/restore-procurement.js list

# 验证备份完整性
node scripts/restore-procurement.js verify procurement-2026-02-26
```

#### 方法2: 使用npm脚本

```json
{
  "scripts": {
    "restore:procurement": "node scripts/restore-procurement.js restore",
    "restore:list": "node scripts/restore-procurement.js list",
    "restore:verify": "node scripts/restore-procurement.js verify"
  }
}
```

## 环境变量配置

### 数据库连接配置

```bash
# .env.procurement
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=procurement_db
```

### 备份存储配置

```bash
# 备份根目录
BACKUP_BASE_DIR=./backups/procurement

# 保留天数
BACKUP_RETENTION_DAYS=7
```

## 恢复验证

### 自动验证

恢复完成后会自动执行以下验证：

1. **数据库连接验证** - 确认数据库服务正常
2. **核心表验证** - 检查关键表是否存在且可访问
3. **配置文件验证** - 确认配置文件完整性
4. **服务可用性验证** - 检查API服务响应状态

### 手动验证

```bash
# 检查数据库表
psql -d procurement_db -c "\dt supplier_intelligence_profiles"

# 检查配置文件
ls -la config/procurement-intelligence/

# 检查服务状态
curl http://localhost:3000/api/procurement-intelligence/health
```

## 故障排除

### 常见问题

#### 1. 备份失败 - 权限不足

```bash
# 解决方案: 确保数据库用户有足够权限
GRANT ALL PRIVILEGES ON TABLE supplier_intelligence_profiles TO postgres;
```

#### 2. 恢复失败 - 表不存在

```bash
# 解决方案: 先创建表结构
psql -d procurement_db -f sql/supplier-intelligence-profiles.sql
```

#### 3. 备份文件损坏

```bash
# 解决方案: 验证并使用上一个有效备份
node scripts/restore-procurement.js verify backup-id
```

### 日志查看

```bash
# 备份日志
tail -f logs/backup.log

# 恢复日志
tail -f logs/restore.log

# 系统日志
journalctl -u procurement-backup -f
```

## 安全考虑

### 数据加密

- 备份文件应加密存储
- 传输过程中使用SSL/TLS
- 敏感配置信息单独加密

### 访问控制

- 限制备份脚本执行权限
- 定期轮换数据库密码
- 监控备份操作日志

### 合规要求

- 符合数据保护法规要求
- 定期审计备份流程
- 建立备份操作审批机制

## 性能优化

### 备份优化

- 使用并行处理加速大表备份
- 压缩备份文件减少存储空间
- 增量备份减少数据传输量

### 恢复优化

- 预热数据库缓存
- 并行恢复多个表
- 分阶段恢复(配置→数据→文件)

## 监控告警

### 监控指标

- 备份成功率
- 备份文件大小变化
- 恢复时间统计
- 存储空间使用率

### 告警设置

```yaml
# 告警规则示例
- name: backup-failed
  condition: backup_success_rate < 0.95
  severity: warning

- name: backup-size-anomaly
  condition: backup_size_change > 50%
  severity: warning

- name: restore-timeout
  condition: restore_duration > 300
  severity: critical
```

## 版本兼容性

### 备份版本管理

- 每个备份包含版本信息
- 跨版本恢复需要特殊处理
- 提供版本迁移脚本

### 升级注意事项

- 升级前执行完整备份
- 验证新版本备份兼容性
- 准备回滚恢复方案

---

**文档版本**: v1.0  
**最后更新**: 2026年2月26日  
**维护人员**: 系统管理员团队
