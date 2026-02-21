# Supabase 备份策略配置指南

## 1. 自动备份配置

Supabase 默认提供自动备份功能，配置步骤如下：

### 1.1 访问备份设置
- 登录 Supabase 控制台
- 导航到：**Database** → **Backups**
- 点击 **Configure backups**

### 1.2 配置备份参数
| 参数 | 推荐值 | 说明 |
|------|--------|------|
| Backup frequency | Daily | 每日自动备份 |
| Retention period | 7 days | 保留7天备份 |
| Backup type | Full backup | 完整备份 |

### 1.3 高级配置（可选）
- **Point-in-time recovery**: 启用以支持时间点恢复
- **Backup encryption**: 启用加密保护数据安全
- **Notification settings**: 配置备份成功/失败通知

## 2. 手动备份操作

### 2.1 创建即时备份
```sql
-- 在 SQL Editor 中执行
SELECT pg_start_backup('manual_backup_' || NOW()::TEXT);
-- 等待备份完成
SELECT pg_stop_backup();
```

### 2.2 使用 Supabase CLI
```bash
# 创建备份
supabase db backup create --name "production-backup-$(date +%Y%m%d)"

# 列出所有备份
supabase db backup list
```

## 3. 备份验证

### 3.1 验证备份完整性
- 在 Backups 页面检查最近备份状态
- 确认备份大小和时间戳合理
- 测试备份恢复流程（建议在测试环境）

### 3.2 监控备份健康度
- 设置告警：备份失败时发送通知
- 定期检查备份存储使用情况
- 验证备份文件可访问性

## 4. 恢复策略

### 4.1 数据库恢复
- 从备份中恢复到新数据库实例
- 支持时间点恢复（PITR）
- 恢复后验证数据完整性

### 4.2 应急恢复计划
- 准备恢复脚本和文档
- 定期进行恢复演练
- 确保团队成员熟悉恢复流程

## 5. 最佳实践

✅ **推荐配置**：
- 每日自动备份 + 7天保留
- 启用备份加密
- 配置失败告警
- 每月进行一次恢复测试

⚠️ **注意事项**：
- 备份不替代应用层数据验证
- 大型数据库备份可能需要更长时间
- 确保有足够的存储空间

## 6. 验证检查清单
- [ ] 自动备份已启用
- [ ] 备份频率设置为每日
- [ ] 保留期设置为7天
- [ ] 备份加密已启用
- [ ] 告警通知已配置
- [ ] 最近备份状态正常

> **重要提醒**：备份策略配置完成后，请运行 `scripts/verify-rls-policies.js` 验证RLS安全策略是否正常工作。