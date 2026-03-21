# 多类型用户管理 - 快速部署指南

## ⚡ 问题已修复

**原问题**: SQL 脚本引用了不存在的 `roles` 表
**解决方案**: 采用简化设计，将 `role` 字段直接存储在 `user_accounts` 表中

---

## 📋 部署步骤（3 步完成）

### 第 1 步：执行 SQL 迁移 🔴

#### 方法 A: 使用 Supabase Dashboard（推荐）

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **SQL Editor** -> **New Query**
4. 复制并粘贴 `sql/multi-type-user-management.sql` 的全部内容
5. 点击 **Run** 执行

#### 方法 B: 使用 psql 命令行

```bash
# 从 .env 文件获取 DATABASE_URL
psql $DATABASE_URL < sql/multi-type-user-management.sql
```

或者直接使用完整命令：

```bash
psql postgresql://postgres:your_password@db.hrjqzbhqueleszkvnsen.supabase.co:5432/postgres < sql/multi-type-user-management.sql
```

#### 方法 C: 使用 pgAdmin

1. 打开 pgAdmin
2. 连接到你的 Supabase 数据库
3. 打开 Query Tool
4. 加载并执行 `multi-type-user-management.sql` 文件

---

### 第 2 步：验证数据库表创建成功 ✅

执行以下 SQL 查询验证：

```sql
-- 检查表是否存在
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'user_accounts',
  'individual_users',
  'repair_shop_users_detail',
  'enterprise_users_detail'
);

-- 应该返回 4 行结果
```

检查统计视图：

```sql
-- 测试统计视图
SELECT * FROM user_stats_view;

-- 应该返回一行统计数据（初始为 0）
```

---

### 第 3 步：测试 API 端点 🚀

启动开发服务器（如果还未启动）：

```bash
npm run dev
```

测试 API：

```bash
# 访问 http://localhost:3001/api/admin/user-management
curl http://localhost:3001/api/admin/user-management
```

---

## 🎯 创建的数据库结构

### 核心表

| 表名                       | 说明           | 用途                        |
| -------------------------- | -------------- | --------------------------- |
| `user_accounts`            | 统一账户表     | 管理所有类型用户的基本信息  |
| `individual_users`         | 个人用户详情表 | 存储 C 端用户的详细信息     |
| `repair_shop_users_detail` | 维修店详情表   | 存储维修店的详细信息        |
| `enterprise_users_detail`  | 企业用户详情表 | 存储企业/贸易公司的详细信息 |
| `user_stats_view`          | 统计视图       | 实时统计各维度数据          |

### 关键字段

**user_accounts 表新增字段**:

- `user_type`: 用户类型（individual/repair_shop/enterprise/foreign_trade_company）
- `account_type`: 账户类型（individual/repair_shop/factory/supplier/enterprise/foreign_trade）
- `role`: 用户角色（admin/manager/viewer 等）
- `verification_status`: 认证状态
- `subscription_plan`: 订阅计划

---

## 🔄 与现有系统集成

### 更新路由配置

在 `src/app/admin/layout.tsx` 或菜单配置中添加：

```typescript
{
  title: '用户管理',
  href: '/admin/users',
  icon: 'users',
  permission: 'usermgr.view'
}
```

### 创建前端页面

在 `src/app/admin/users/` 下创建页面：

```
src/app/admin/users/
├── page.tsx              # 用户列表主页面
├── [id]/
│   └── page.tsx          # 用户详情页面
└── verification/
    └── page.tsx          # 认证审核页面
```

参考已有的 `user-manager/page.tsx` 进行适配。

---

## ⚠️ 常见问题解决

### 问题 1: "relation already exists"

**错误**: 表已经存在
**解决**: 这是正常的，说明表已经创建过了。可以跳过或先删除再创建：

```sql
-- 谨慎操作：删除已有表（会丢失数据！）
DROP TABLE IF EXISTS enterprise_users_detail CASCADE;
DROP TABLE IF EXISTS repair_shop_users_detail CASCADE;
DROP TABLE IF EXISTS individual_users CASCADE;
DROP TABLE IF EXISTS user_accounts CASCADE;
DROP VIEW IF EXISTS user_stats_view CASCADE;
```

### 问题 2: "permission denied"

**错误**: 权限不足
**解决**: 确保使用有足够权限的数据库用户（通常是 postgres）

### 问题 3: SQL 执行超时

**错误**: 执行时间过长
**解决**:

1. 分段执行 SQL（先执行创建表的部分）
2. 使用 Supabase Dashboard 的 SQL Editor 执行
3. 检查数据库连接是否稳定

---

## 📊 后续优化建议

### 立即可做

1. 添加示例数据进行测试
2. 创建前端管理页面
3. 集成到现有菜单系统

### 中期规划

1. 实现用户导入功能（CSV/Excel）
2. 添加邮件通知（状态变更时）
3. 完善审计日志

### 长期优化

1. 实现缓存层（Redis）
2. 添加数据分析图表
3. 支持自定义用户分组

---

## ✅ 完成检查清单

- [ ] SQL 脚本执行成功
- [ ] 4 个核心表已创建
- [ ] 统计视图可用
- [ ] API 端点可访问
- [ ] 前端页面已创建（可选）
- [ ] 菜单项已添加（可选）

---

## 📞 需要帮助？

如果遇到问题：

1. 检查 Supabase Dashboard 的 Logs
2. 查看数据库连接配置
3. 确认 RLS（Row Level Security）策略
4. 查看详细错误日志

---

**更新时间**: 2026-03-22
**版本**: v1.0.1 (修复 roles 表依赖问题)
**状态**: ✅ 可直接部署
