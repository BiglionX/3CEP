# Skills 数据库迁移完整性检查清单

## 📋 快速检查（3 分钟）

### 方法一：SQL 一键检查 ⭐ 推荐

在 Supabase SQL Editor 中执行：

```bash
# 复制 verify-skills-migration.sql 的全部内容并执行
```

**预期输出**：

```
========================================
🔍 Skills 数据库迁移完整性检查
========================================
✅ 核心表检查：12/12 已创建
✅ skills 表字段：13/13 关键字段存在
✅ skill_version_history 表：5/5 关键字段存在
✅ RLS 策略：25 个已启用
✅ 索引优化：35 个已创建
✅ 分类数据：8 个已插入
========================================
🎉 检查通过！所有 Skills 迁移已完成
========================================
```

---

## 🔍 详细检查清单

### 1. 表结构检查（12 个核心表）

- [ ] `skills` - Skill 主表
- [ ] `skill_categories` - 分类管理表
- [ ] `skill_audit_logs` - 审核日志表
- [ ] `skill_versions` - 版本管理表
- [ ] `skill_orders` - 订单表
- [ ] `skill_reviews` - 评论评价表
- [ ] `skill_version_history` - 版本变更历史表
- [ ] `skill_executions` - 执行日志表
- [ ] `skill_tags` - 标签系统表
- [ ] `skill_recommendations` - 推荐系统表
- [ ] `skill_sandboxes` - 测试沙箱表
- [ ] `skill_documents` - 文档管理表

**验证 SQL**：

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'skill_%'
ORDER BY table_name;
```

---

### 2. 字段完整性检查

#### skills 表（必须包含以下字段）

- [ ] id (UUID, PK)
- [ ] name (VARCHAR, UNIQUE)
- [ ] title (VARCHAR)
- [ ] description (TEXT)
- [ ] category (VARCHAR)
- [ ] version (VARCHAR, default '1.0.0')
- [ ] review_status (VARCHAR: pending/approved/rejected/draft)
- [ ] shelf_status (VARCHAR: on_shelf/off_shelf/suspended)
- [ ] price (DECIMAL)
- [ ] developer_id (UUID, FK)
- [ ] view_count, usage_count, rating (统计字段)
- [ ] created_at, updated_at (时间戳)

**验证 SQL**：

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'skills'
ORDER BY ordinal_position;
```

---

### 3. RLS 策略检查

每个表必须启用 Row Level Security：

- [ ] skills - 所有人可查看已上架技能
- [ ] skills - 开发者可管理自己的技能
- [ ] skills - 管理员可管理所有技能
- [ ] skill_categories - 所有人可查看活跃分类
- [ ] skill_categories - 管理员可管理分类
- [ ] skill_reviews - 用户可管理自己的评论
- [ ] skill_reviews - 管理员可审核评论
- [ ] ... (其他表类似)

**验证 SQL**：

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
AND tablename LIKE 'skill_%';
```

---

### 4. 索引优化检查

关键索引必须存在：

**skills 表索引**：

- [ ] idx_skills_category
- [ ] idx_skills_review_status
- [ ] idx_skills_shelf_status
- [ ] idx_skills_created_at
- [ ] idx_skills_developer_id

**其他表索引**：

- [ ] idx_skill_reviews_skill_id
- [ ] idx_skill_executions_skill_id
- [ ] idx_skill_version_history_skill_id
- [ ] idx_skill_tags_name
- [ ] ... (至少 30 个索引)

**验证 SQL**：

```sql
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename LIKE 'skill_%';
```

---

### 5. 默认数据检查

- [ ] skill_categories 表有 8 个默认分类
- [ ] 分类包括：定位服务、诊断分析、配件服务、估值定价等

**验证 SQL**：

```sql
SELECT slug, name, icon_emoji, sort_order
FROM skill_categories
WHERE is_active = true
ORDER BY sort_order;
```

---

### 6. 触发器检查

- [ ] cleanup_old_version_history - 自动清理旧版本历史
- [ ] update_updated_at_column - 自动更新时间戳
- [ ] update_helpful_count - 更新点赞数

**验证 SQL**：

```sql
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name LIKE '%skill%';
```

---

### 7. 视图和函数检查

- [ ] get_user_role() - 获取用户角色函数
- [ ] get_skill_versions() - 获取版本列表函数
- [ ] skill_daily_stats - 每日统计视图

---

## 🛠️ 自动化检查工具

### PowerShell 脚本

```powershell
# 运行检查脚本
.\scripts\check-skills-migration.ps1 -Detailed -ExportReport
```

**参数说明**：

- `-Detailed`: 显示详细检查结果
- `-ExportReport`: 导出 HTML 报告
- `-ConnectionString`: 指定数据库连接字符串

---

## 📊 检查报告模板

### 迁移状态概览

| 检查项        | 期望值 | 实际值 | 状态 |
| ------------- | ------ | ------ | ---- |
| 核心表数量    | 12     | ?      | ⏳   |
| skills 表字段 | ≥13    | ?      | ⏳   |
| RLS 策略数量  | ≥20    | ?      | ⏳   |
| 索引数量      | ≥30    | ?      | ⏳   |
| 分类数据      | 8      | ?      | ⏳   |
| 触发器        | ≥5     | ?      | ⏳   |

### 通过率判定

- ✅ **100%** - 完美！所有检查通过
- ✅ **≥95%** - 良好，少数警告不影响使用
- ✅ **≥80%** - 合格，但有重要功能缺失
- ❌ **<80%** - 不合格，需要重新迁移

---

## 🔧 常见问题排查

### 问题 1: 表不存在

**症状**：检查脚本报错 "relation does not exist"

**解决方案**：

```sql
-- 执行完整的迁移脚本
-- 文件：supabase/migrations/034_add_skill_store_management.sql
```

### 问题 2: 字段名称错误

**症状**：skill_version_history 表的 version 列应该是 new_version

**解决方案**：

```sql
-- 参考 044_preflight_check.sql 进行修复
ALTER TABLE skill_version_history
RENAME COLUMN version TO new_version;
```

### 问题 3: RLS 策略缺失

**症状**：查询返回空或权限错误

**解决方案**：

```sql
-- 重新执行 034 号迁移中的 RLS 策略部分
```

### 问题 4: 索引性能差

**症状**：查询缓慢

**解决方案**：

```sql
-- 执行 044 号迁移脚本添加优化索引
```

---

## ✅ 迁移完成标志

当满足以下条件时，可以确认迁移完成：

1. ✅ 所有 12 个核心表存在
2. ✅ skills 表包含所有必需字段
3. ✅ RLS 策略全部启用（≥20 个）
4. ✅ 索引优化完成（≥30 个）
5. ✅ 默认分类数据已插入（8 个）
6. ✅ 触发器正常工作（≥5 个）
7. ✅ 无 SQL 执行错误
8. ✅ 前端 API 调用正常

---

## 📞 下一步

迁移完成后：

1. ✅ 运行前端应用测试 API
2. ✅ 访问 `/admin/skill-store` 验证页面
3. ✅ 测试创建、编辑、审核流程
4. ✅ 验证权限控制是否正常

---

**最后更新**: 2026-03-26
**维护者**: Development Team
