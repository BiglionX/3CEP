# SQL 语法错误修复说明

## 问题描述

**错误信息**：

```
ERROR: 42601: syntax error at or near "NOT"
LINE 24: CREATE TYPE IF NOT EXISTS user_role AS ENUM (...)
```

## 根本原因

PostgreSQL 的 `CREATE TYPE` 语句**不支持** `IF NOT EXISTS` 语法，这是 PostgreSQL 的设计限制。

## 解决方案

### ✅ 已修复

使用 PL/pgSQL 块来检查类型是否存在：

```sql
-- ❌ 错误的写法（PostgreSQL 不支持）
CREATE TYPE IF NOT EXISTS user_role AS ENUM ('admin', 'viewer');

-- ✅ 正确的写法
DO $type_check$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'viewer');
  END IF;
END $type_check$;
```

### 修复原理

1. **外层 DO 块**：检查表是否存在
2. **内层 DO 块**：检查枚举类型是否存在
3. **pg_type 系统表**：PostgreSQL 存储所有类型的系统表
4. **typname 字段**：类型的名称

## 文件位置

📁 已修复文件：`supabase/migrations/033_create_tenant_infrastructure.sql`

## 验证方法

修复后，脚本应该可以正常执行，不会出现语法错误。

### 测试步骤

1. 在 Supabase SQL Editor 中重新执行脚本
2. 观察输出日志，应该看到：
   ```
   创建 user_profiles_ext 表...
   (成功执行)
   ```
3. 检查表是否创建成功

## PostgreSQL 常见语法陷阱

### 支持 IF NOT EXISTS 的语句

✅ `CREATE TABLE IF NOT EXISTS`
✅ `CREATE INDEX IF NOT EXISTS`
✅ `CREATE SCHEMA IF NOT EXISTS`
✅ `CREATE EXTENSION IF NOT EXISTS`

### 不支持 IF NOT EXISTS 的语句

❌ `CREATE TYPE IF NOT EXISTS` - 需要用 DO 块检查
❌ `CREATE FUNCTION IF NOT EXISTS` - 需要用 DO 块检查
❌ `CREATE POLICY IF NOT EXISTS` - 需要用 DO 块检查

## 相关资源

- [PostgreSQL CREATE TYPE 文档](https://www.postgresql.org/docs/current/sql-createtype.html)
- [PostgreSQL pg_type 系统表](https://www.postgresql.org/docs/current/catalog-pg-type.html)
- [PL/pgSQL 条件执行](https://www.postgresql.org/docs/current/plpgsql-statements.html)

---

**修复时间**: 2026-03-23
**影响范围**: 仅修复语法错误，不影响功能
**向后兼容**: 完全兼容
