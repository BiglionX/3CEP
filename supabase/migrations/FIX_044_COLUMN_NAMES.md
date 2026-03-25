# 044 号迁移脚本列名错误修复说明

**修复时间**: 2026-03-25
**状态**: ✅ 已修复

---

## 🐛 **发现的错误**

### 错误 1: skill_version_history 表

**问题**: 使用了不存在的列 `version` 和 `changed_at`
**实际列名**:

- ✅ `new_version` (不是 `version`)
- ✅ `created_at` (不是 `changed_at`)

**修复**:

```sql
-- ❌ 错误
CREATE INDEX idx_skill_versions_skill_version
ON skill_version_history(skill_id, version DESC);

CREATE INDEX idx_skill_versions_changed_by
ON skill_version_history(changed_by, changed_at DESC);

-- ✅ 正确
CREATE INDEX idx_skill_versions_skill_version
ON skill_version_history(skill_id, new_version DESC);

CREATE INDEX idx_skill_versions_changed_by
ON skill_version_history(changed_by, created_at DESC);
```

---

### 错误 2: skill_recommendations 表

**问题**: 使用了不存在的统计字段
**实际表结构**:

```sql
CREATE TABLE skill_recommendations (
  id UUID PRIMARY KEY,
  user_id UUID,
  skill_id UUID NOT NULL,
  recommendation_type VARCHAR(50),
  score DECIMAL(5,4),      -- 推荐分数
  reason TEXT,             -- 推荐理由
  is_clicked BOOLEAN DEFAULT false,  -- 是否被点击
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**错误的索引**:

```sql
-- ❌ 这些列不存在
click_through_rate
impression_count
click_count
```

**修复**:

```sql
-- ❌ 错误
CREATE INDEX idx_skill_recommendations_ctr
ON skill_recommendations(click_through_rate DESC)
WHERE impression_count > 10;

-- ✅ 正确
CREATE INDEX idx_skill_recommendations_clicked
ON skill_recommendations(is_clicked) WHERE is_clicked = true;
```

---

## 📋 **正确的表结构清单**

### skill_version_history

```
✅ id
✅ skill_id
✅ old_version
✅ new_version          ← 使用这个
✅ changes (JSONB)
✅ changed_by
✅ created_at           ← 使用这个
```

### skill_recommendations

```
✅ id
✅ user_id
✅ skill_id
✅ recommendation_type
✅ score
✅ reason
✅ is_clicked           ← 使用这个
✅ created_at
✅ updated_at
```

### skill_executions

```
✅ id
✅ user_id
✅ skill_id
✅ input_params (JSONB)
✅ output (JSONB)
✅ execution_time
✅ memory_usage
✅ status
✅ error_message
✅ created_at           ← 使用这个
```

### skill_reviews

```
✅ id
✅ skill_id
✅ user_id
✅ parent_id
✅ content
✅ rating
✅ is_approved
✅ is_offensive
✅ created_at           ← 使用这个
```

### skill_documents

```
✅ id
✅ skill_id
✅ title
✅ slug
✅ content_type
✅ content
✅ summary
✅ category
✅ version
✅ order_index
✅ is_published
✅ is_official
✅ published_at
✅ view_count
✅ like_count
✅ help_count
✅ meta_title
✅ meta_description
✅ keywords (JSONB)
✅ created_at           ← 使用这个
✅ updated_at
```

### skill_sandboxes

```
✅ id
✅ user_id
✅ skill_id
✅ test_name
✅ input_params (JSONB)
✅ expected_output (JSONB)
✅ actual_output (JSONB)
✅ execution_time
✅ memory_usage
✅ status
✅ error_message
✅ is_public
✅ tags (JSONB)
✅ created_at           ← 使用这个
✅ updated_at
```

### document_likes

```
✅ id
✅ document_id
✅ user_id
✅ is_helpful
✅ created_at           ← 使用这个
```

### admin_users

```
✅ user_id
✅ email
✅ role
✅ permissions (JSONB)
✅ is_active
✅ created_at           ← 使用这个
✅ updated_at
```

---

## ✅ **修复后的文件**

| 文件                                                                                                                               | 状态      | 说明             |
| ---------------------------------------------------------------------------------------------------------------------------------- | --------- | ---------------- |
| [`044_performance_optimization_indexes.sql`](file://d:\BigLionX\3cep\supabase\migrations\044_performance_optimization_indexes.sql) | ✅ 已修复 | 修正所有列名错误 |
| [`check_table_columns.sql`](file://d:\BigLionX\3cep\supabase\migrations\check_table_columns.sql)                                   | ✅ 新增   | 检查表结构工具   |
| [`verify_044_indexes.sql`](file://d:\BigLionX\3cep\supabase\migrations\verify_044_indexes.sql)                                     | ✅ 已更新 | 验证脚本         |

---

## 🔍 **如何避免此类错误**

### 方法 1: 先检查表结构

```bash
# 执行检查脚本
psql -h <host> -U postgres -d postgres -f check_table_columns.sql
```

### 方法 2: 在 Supabase Dashboard 查看

1. 打开 Supabase Dashboard
2. 进入 Table Editor
3. 点击对应表查看列结构

### 方法 3: 使用 SQL 查询

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'your_table_name'
ORDER BY ordinal_position;
```

---

## 🚀 **现在可以安全执行**

**步骤**:

1. ✅ 确认所有列名已修正
2. ✅ 在 Supabase SQL Editor 执行修复后的脚本
3. ✅ 运行 `verify_044_indexes.sql` 验证结果

**预期结果**:

```
✅ 28 个索引创建成功
✅ mv_skill_hot_stats 物化视图创建成功
✅ 3 个监控视图创建成功
✅ 3 个维护函数创建成功
```

---

## 📝 **经验教训**

**教训**:

- ❌ 不应该假设列名，应该先检查实际表结构
- ❌ 不同迁移脚本之间可能存在命名不一致
- ✅ 应该使用工具自动检查列名存在性
- ✅ 应该在测试环境先执行迁移验证

**改进措施**:

- ✅ 创建 `check_table_columns.sql` 工具脚本
- ✅ 在迁移脚本中添加详细的列名注释
- ✅ 执行前先用验证脚本检查

---

**现在可以继续执行迁移了!** 🎯
