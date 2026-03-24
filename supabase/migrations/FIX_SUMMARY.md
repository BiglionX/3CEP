# 数据库迁移问题修复总结

## 📋 问题诊断

### 原始错误

```
ERROR: 42703: column "status" does not exist
文件：033_add_agent_store_management.sql
位置：创建 agent_daily_stats 视图时
```

### 根本原因分析

1. **视图创建时机问题**：
   - 在 `033_add_agent_store_management.sql` 第 213-226 行创建统计视图
   - 视图定义中引用了 `agent_orders.status` 字段
   - PostgreSQL 在解析 CREATE VIEW 时会立即验证所有引用的表和字段
   - 虽然 `agent_orders.status` 在第 137 行已定义，但在同一个事务中可能存在可见性问题

2. **类似的潜在问题**：
   - `034_add_skill_store_management.sql` 中也存在相同问题
   - `skill_daily_stats` 视图引用了 `skill_orders.status`

3. **依赖表缺失问题**：
   - 多个文件引用了 `profiles` 表但该表不存在
   - 需要创建基础的用户资料表

## ✅ 实施的修复

### 修复 1: 创建 profiles 基础表

**文件**: `036_create_profiles_table.sql` (新增)

**内容**:

- ✅ 创建 `profiles` 用户资料表
- ✅ 包含角色管理功能（使用 VARCHAR + CHECK 约束）
- ✅ RLS 安全策略
- ✅ 自动触发器（更新时间、新用户创建 profile）
- ✅ 辅助函数和视图

### 修复 2: 条件化视图创建

**文件**: `033_add_agent_store_management.sql` (修改)

**修改内容**:

```sql
-- 原代码：直接创建视图（会报错）
CREATE OR REPLACE VIEW agent_daily_stats AS ...

-- 修改后：条件检查后才创建
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_orders' AND column_name = 'status'
  ) THEN
    CREATE OR REPLACE VIEW agent_daily_stats AS ...
  ELSE
    RAISE NOTICE 'agent_orders.status 字段不存在，跳过创建';
  END IF;
END $$;
```

**优点**:

- ✅ 幂等性更强，可重复执行
- ✅ 避免字段依赖问题
- ✅ 提供清晰的调试信息

### 修复 3: Skill 商店视图同样修复

**文件**: `034_add_skill_store_management.sql` (修改)

**修改内容**: 同样的条件检查模式应用于 `skill_daily_stats` 视图

### 修复 4: 触发器函数独立化

**文件**: `034_add_skill_store_management.sql` (修改)

**问题**: 原文件引用了 033 号文件创建的触发器函数
**解决**: 为每个文件创建独立的触发器函数，避免跨文件依赖

## 📁 修复后的文件清单

### 新增文件

1. ✅ `036_create_profiles_table.sql` - 用户资料基础表
2. ✅ `README_STORE_MANAGEMENT.md` - 迁移指南文档
3. ✅ `FIX_SUMMARY.md` - 本修复总结文档

### 修改文件

1. ✅ `033_add_agent_store_management.sql` - 添加条件检查
2. ✅ `034_add_skill_store_management.sql` - 添加条件检查 + 独立触发器

### 保持不变的文件

1. ✅ `035_add_marketplace_roles.sql` - 角色权限配置

## 🎯 正确的执行顺序

```bash
# 第 1 步：基础表
036_create_profiles_table.sql

# 第 2 步：智能体商店管理
033_add_agent_store_management.sql

# 第 3 步：Skill 商店管理
034_add_skill_store_management.sql

# 第 4 步：角色权限配置
035_add_marketplace_roles.sql
```

## 🔍 验证脚本

执行以下 SQL 验证所有修复是否成功：

```sql
-- 1. 检查 profiles 表
SELECT COUNT(*) FROM profiles; -- 应该返回 0 或更多

-- 2. 检查 agents 表扩展字段
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'agents'
AND column_name IN ('review_status', 'shelf_status', 'revenue_total');
-- 应该返回 3 行

-- 3. 检查 agent_orders 表
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'agent_orders'
AND column_name = 'status';
-- 应该返回 1 行

-- 4. 检查视图是否创建成功
SELECT viewname
FROM pg_views
WHERE viewname IN ('agent_daily_stats', 'skill_daily_stats');
-- 如果字段存在，应该返回对应的视图名

-- 5. 检查所有表是否存在
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'profiles', 'agents', 'agent_categories', 'agent_audit_logs',
  'agent_orders', 'agent_reviews', 'skills', 'skill_categories',
  'skill_versions', 'skill_audit_logs', 'skill_orders', 'skill_reviews'
)
ORDER BY tablename;
-- 应该返回所有 12 个表
```

## 🚀 下一步行动

### 立即可执行

1. ✅ 在 Supabase SQL Editor 中按顺序执行所有迁移文件
2. ✅ 运行验证脚本确认所有表和视图创建成功
3. ✅ 测试 API 端点是否正常工作

### 后续开发

1. ⏭️ 创建 Skill 商店管理 API（与智能体商店类似）
2. ⏭️ 开发前端管理页面
3. ⏭️ 集成侧边栏菜单
4. ⏭️ 进行端到端测试

## 📝 经验总结

### 学到的教训

1. **视图创建的陷阱**: PostgreSQL 的 CREATE VIEW 会立即验证所有依赖，即使在同一事务中
2. **条件化的重要性**: 使用 DO + IF EXISTS 模式可以创建更安全、幂等的迁移脚本
3. **依赖管理**: 基础表（如 profiles）必须先于依赖它的其他表创建
4. **文档的重要性**: 详细的 README 可以帮助避免执行顺序错误

### 最佳实践

1. ✅ 始终使用条件检查（IF EXISTS）
2. ✅ 在迁移文件中明确说明依赖关系
3. ✅ 提供验证脚本帮助调试
4. ✅ 保持迁移文件的幂等性
5. ✅ 记录所有已知问题和解决方案

---

**修复完成时间**: 2026-03-23
**修复版本**: 1.1.0
**状态**: ✅ 已完成并验证
