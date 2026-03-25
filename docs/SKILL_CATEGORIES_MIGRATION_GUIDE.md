# Skill Categories 数据库迁移指南

## 📋 概述

本文档说明如何为 `skill_categories` 表添加 `name_en` 字段以支持国际化和 API 集成。

## 🎯 目标

- 为 `skill_categories` 表添加 `name_en` 字段
- 确保数据完整性和向后兼容性
- 支持前端表单提交和 API 调用

## 📁 相关文件

### 现有文件

- **基础表结构**: `supabase/migrations/034_add_skill_store_management.sql`
  - 包含 `skill_categories` 表的完整定义
  - 已创建索引、RLS 策略和触发器
  - 预置了 8 个默认分类

### 新增文件

- **增强迁移**: `supabase/migrations/035_enhance_skill_categories.sql` ⭐
  - 添加 `name_en` 字段
  - 添加唯一约束
  - 更新现有数据
  - 创建性能索引

## 🚀 执行步骤

### 方法一：使用 Supabase Dashboard (推荐)

1. **登录 Supabase Dashboard**

   ```
   https://app.supabase.com/project/YOUR_PROJECT_ID/sql
   ```

2. **复制迁移脚本内容**
   - 打开文件：`supabase/migrations/035_enhance_skill_categories.sql`
   - 复制全部内容

3. **在 SQL Editor 中执行**
   - 粘贴 SQL 脚本到编辑器
   - 点击 "Run" 执行
   - 检查输出结果

4. **验证迁移成功**

   ```sql
   -- 检查字段是否添加成功
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'skill_categories'
   AND column_name = 'name_en';

   -- 查看现有数据
   SELECT id, name, slug, name_en, sort_order
   FROM skill_categories
   ORDER BY sort_order;
   ```

### 方法二：使用 Supabase CLI

```bash
# 1. 登录 Supabase
npx supabase login

# 2. 链接项目
npx supabase link --project-ref YOUR_PROJECT_ID

# 3. 执行迁移
npx supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.YOUR_PROJECT_ID.supabase.co:5432/postgres"

# 或者直接执行 SQL 文件
psql postgresql://postgres:[YOUR-PASSWORD]@db.YOUR_PROJECT_ID.supabase.co:5432/postgres \
  -f supabase/migrations/035_enhance_skill_categories.sql
```

### 方法三：使用 psql 命令行工具

```bash
# 1. 设置环境变量
export SUPABASE_DB_URL="postgresql://postgres:[YOUR-PASSWORD]@db.YOUR_PROJECT_ID.supabase.co:5432/postgres"

# 2. 执行迁移
psql $SUPABASE_DB_URL -f supabase/migrations/035_enhance_skill_categories.sql
```

## ✅ 验证清单

执行迁移后，请检查以下项目:

- [ ] `name_en` 字段已成功添加
- [ ] 唯一约束已创建
- [ ] 现有数据的 `name_en` 值已填充 (使用 slug)
- [ ] 索引 `idx_skill_categories_name_en` 已创建
- [ ] 没有报错或警告

## 📊 预期结果

### 表结构变更

**变更前**:

```sql
CREATE TABLE skill_categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  icon_emoji VARCHAR(10),
  parent_id UUID REFERENCES skill_categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**变更后**:

```sql
CREATE TABLE skill_categories (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  name_en VARCHAR(100),  -- ← 新增字段
  description TEXT,
  icon_emoji VARCHAR(10),
  parent_id UUID REFERENCES skill_categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT skill_categories_name_en_key UNIQUE (name_en)  -- ← 新增约束
);
```

### 数据示例

| id   | name     | slug               | name_en            | description            | sort_order |
| ---- | -------- | ------------------ | ------------------ | ---------------------- | ---------- |
| uuid | 定位服务 | location-services  | location-services  | 基于地理位置的查询服务 | 1          |
| uuid | 诊断分析 | diagnosis-analysis | diagnosis-analysis | 设备故障诊断和分析服务 | 2          |
| uuid | 配件服务 | parts-services     | parts-services     | 配件查询和兼容性服务   | 3          |

## 🔧 故障排查

### 问题 1: 字段已存在错误

**错误信息**:

```
column "name_en" of relation "skill_categories" already exists
```

**解决方案**:
迁移脚本已包含幂等性检查，此错误不应出现。如果出现，请检查:

```sql
-- 手动检查字段是否存在
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'skill_categories'
AND column_name = 'name_en';
```

### 问题 2: 唯一约束冲突

**错误信息**:

```
could not create unique constraint "skill_categories_name_en_key"
```

**原因**: 现有数据中存在重复的 `name_en` 值

**解决方案**:

```sql
-- 1. 查找重复值
SELECT name_en, COUNT(*)
FROM skill_categories
GROUP BY name_en
HAVING COUNT(*) > 1;

-- 2. 手动修复重复值
UPDATE skill_categories
SET name_en = slug || '-' || id::text
WHERE name_en IN (/* 重复的值 */);

-- 3. 重新执行迁移
```

### 问题 3: 权限不足

**错误信息**:

```
permission denied for table skill_categories
```

**解决方案**:

- 确保使用具有管理员权限的账户
- 或使用 Supabase Dashboard 的 SQL Editor (自动具有最高权限)

## 🔗 关联 API

迁移完成后，以下 API 将可以正常工作:

### 分类管理 API

- ✅ `GET /api/admin/skill-categories/list` - 获取分类列表
- ✅ `POST /api/admin/skill-categories/create` - 创建分类
- ✅ `PUT /api/admin/skill-categories/update` - 更新分类
- ✅ `DELETE /api/admin/skill-categories/delete` - 删除分类

### 数据分析 API

- ✅ `GET /api/admin/skill-analytics/category-stats` - 分类统计

## 📝 注意事项

1. **幂等性**: 迁移脚本使用幂等设计，可安全重复执行
2. **数据备份**: 建议在执行前导出 `skill_categories` 表数据
3. **执行时机**: 建议在低峰期执行，避免锁表影响用户
4. **回滚方案**: 如需回滚，执行:
   ```sql
   ALTER TABLE skill_categories DROP COLUMN IF EXISTS name_en;
   ALTER TABLE skill_categories DROP CONSTRAINT IF EXISTS skill_categories_name_en_key;
   DROP INDEX IF EXISTS idx_skill_categories_name_en;
   ```

## 🎉 完成标志

当您看到以下输出时，表示迁移成功:

```
已添加 name_en 字段到 skill_categories 表
已为 name_en 添加唯一约束
已创建索引 idx_skill_categories_name_en
```

## 📞 获取帮助

如遇到问题，请检查:

1. Supabase Dashboard 中的 Logs
2. PostgreSQL 错误日志
3. 项目文档：`docs/` 目录

---

**最后更新**: 2026-03-25
**文档版本**: 1.0
**适用版本**: Supabase Cloud
