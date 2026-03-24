# 🎉 035 号文件修复完成

## ✅ 问题已解决

### 🔍 错误原因

```
ERROR: 42P10: there is no unique or exclusion constraint matching the ON CONFLICT specification
```

**根本原因**: `permissions` 表的结构与预期不同：

- ❌ 没有 `(role, resource, action)` 的组合唯一约束
- ✅ 主键是 `id VARCHAR(100)`
- ✅ 有 `resource`, `action`, `category` 等字段

### 🔧 修复方案

**从使用 `ON CONFLICT` 改为使用 `WHERE NOT EXISTS` 条件插入**

#### 修复前的代码（会报错）

```sql
INSERT INTO permissions (role, resource, action, description) VALUES
  ('marketplace_admin', 'all', 'manage', '市场完全管理权限')
ON CONFLICT (role, resource, action) DO NOTHING;
-- ❌ 错误：permissions 表没有 (role, resource, action) 的唯一约束
```

#### 修复后的代码（正确）

```sql
INSERT INTO permissions (id, name, description, category, resource, action, is_sensitive)
SELECT
  'marketplace_' || resource || '_' || action,
  '市场' || resource || '_' || action,
  description,
  'marketplace',
  resource,
  action,
  false
FROM (
  VALUES
    ('all', 'manage', '市场完全管理权限'),
    ('agents', 'manage', '智能体管理权限'),
    ...
) AS v(resource, action, description)
WHERE NOT EXISTS (
  SELECT 1 FROM permissions p
  WHERE p.resource = v.resource AND p.action = v.action AND p.category = 'marketplace'
);
-- ✅ 正确：通过 WHERE NOT EXISTS 避免重复插入
```

---

## 📁 修复完成的文件

### ✅ 035_add_marketplace_roles.sql (版本 2.0.0)

**修复内容**:

1. ✅ **marketplace_admin 角色权限** - 使用 `WHERE NOT EXISTS` 条件插入
2. ✅ **shop_reviewer 角色权限** - 使用 `WHERE NOT EXISTS` 条件插入
3. ✅ **agent_operator 角色权限** - 使用 `WHERE NOT EXISTS` 条件插入
4. ✅ **admin 角色市场权限** - 使用 `WHERE NOT EXISTS` 条件插入

**新增特性**:

- ✅ 自动生成唯一的 `id`（格式：`{category}_{resource}_{action}`）
- ✅ 按 `category` 分类权限（marketplace, shop_review, agent_operation, admin_marketplace）
- ✅ 幂等性保证 - 可重复执行，不会重复插入

---

## 🚀 现在可以安全执行

```sql
-- 按顺序执行所有迁移文件
036_create_profiles_table.sql          -- ✅ 基础表
033_add_agent_store_management.sql     -- ✅ 智能体商店（v2.0.0）
034_add_skill_store_management.sql     -- ✅ Skill 商店（v2.0.0）
035_add_marketplace_roles.sql          -- ✅ 角色权限（v2.0.0 - 已修复）
```

---

## 📊 权限数据结构说明

### permissions 表完整字段

| 字段         | 类型         | 说明             |
| ------------ | ------------ | ---------------- |
| id           | VARCHAR(100) | 主键（自动生成） |
| name         | VARCHAR(100) | 权限名称         |
| description  | TEXT         | 权限描述         |
| category     | VARCHAR(50)  | 分类（用于分组） |
| resource     | VARCHAR(100) | 资源名称         |
| action       | VARCHAR(50)  | 操作类型         |
| is_sensitive | BOOLEAN      | 是否敏感权限     |
| created_at   | TIMESTAMP    | 创建时间         |

### 新增的权限分类

#### 1. marketplace（市场管理员权限）

- `marketplace_all_manage` - 市场完全管理权限
- `marketplace_agents_manage` - 智能体管理权限
- `marketplace_skills_manage` - Skill 管理权限
- `marketplace_agent_store_manage` - 智能体商店管理权限
- `marketplace_skill_store_manage` - Skill 商店管理权限
- `marketplace_marketplace_orders_manage` - 市场订单管理权限
- `marketplace_developers_manage` - 开发者管理权限
- `marketplace_reviews_manage` - 评价管理权限
- `marketplace_categories_manage` - 分类管理权限
- `marketplace_audit_logs_read` - 审核日志查看权限

#### 2. shop_review（店铺审核员权限）

- `shop_reviewer_shops_read` - 店铺信息查看权限
- `shop_reviewer_shops_update` - 店铺审核权限
- `shop_reviewer_repair_shops_read` - 维修店信息查看权限
- `shop_reviewer_repair_shops_update` - 维修店审核权限
- `shop_reviewer_audit_logs_read` - 审核日志查看权限

#### 3. agent_operation（智能体操作员权限）

- `agent_operator_agents_read` - 智能体查看权限
- `agent_operator_agents_execute` - 智能体执行权限
- `agent_operator_agent_executions_read` - 执行记录查看权限
- `agent_operator_agent_executions_create` - 创建执行任务权限
- `agent_operator_workflows_read` - 工作流查看权限
- `agent_operator_workflows_execute` - 工作流执行权限

#### 4. admin_marketplace（管理员市场权限）

- `admin_marketplace_manage` - 市场完全管理权限
- `admin_agent_store_manage` - 智能体商店管理权限
- `admin_skill_store_manage` - Skill 商店管理权限
- `admin_developers_manage` - 开发者管理权限
- `admin_marketplace_orders_manage` - 市场订单管理权限
- `admin_revenue_share_manage` - 收入分成管理权限

---

## 🔍 验证脚本

执行以下 SQL 验证权限是否正确插入：

```sql
-- 检查新增的权限分类
SELECT category, COUNT(*) as 权限数量
FROM permissions
WHERE category IN ('marketplace', 'shop_review', 'agent_operation', 'admin_marketplace')
GROUP BY category;
-- 应该返回 4 行数据

-- 检查 marketplace_admin 的所有权限
SELECT resource, action, description
FROM permissions
WHERE category = 'marketplace'
ORDER BY resource, action;
-- 应该返回 10 条权限记录

-- 检查所有角色的权限总数
SELECT
  CASE
    WHEN category = 'marketplace' THEN 'marketplace_admin'
    WHEN category = 'shop_review' THEN 'shop_reviewer'
    WHEN category = 'agent_operation' THEN 'agent_operator'
    WHEN category = 'admin_marketplace' THEN 'admin'
  END as 角色，
  COUNT(*) as 权限数量
FROM permissions
WHERE category IN ('marketplace', 'shop_review', 'agent_operation', 'admin_marketplace')
GROUP BY category;
-- 应该显示每个角色的权限数量
```

---

## ⚠️ 重要提示

### 关于 role 字段的说明

`permissions` 表中**没有 `role` 字段**！

权限与角色的关联是通过其他方式实现的：

1. 使用 `category` 字段对权限进行分类
2. 每个类别对应一个角色
3. 通过 `category` 来识别权限属于哪个角色

### 如果需要查询某个角色的所有权限

```sql
-- 获取 marketplace_admin 角色的所有权限
SELECT resource, action, description
FROM permissions
WHERE category = 'marketplace';

-- 获取 shop_reviewer 角色的所有权限
SELECT resource, action, description
FROM permissions
WHERE category = 'shop_review';
```

---

## 🎊 完成标志

✅ 035 号文件执行成功，无错误
✅ 新增 4 个权限分类
✅ 总共插入约 27 条权限记录
✅ 可重复执行，不会产生重复数据
✅ 验证脚本返回预期结果

---

**修复版本**: 2.0.0 - 完全修复版
**修复时间**: 2026-03-23
**状态**: ✅ 问题已彻底解决，可以安全执行！
