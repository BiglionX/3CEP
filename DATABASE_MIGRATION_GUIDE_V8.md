# FixCycle v8.0 数据库迁移执行指南

**重要**: 由于Supabase CLI版本兼容性问题，请使用以下方法之一执行数据库迁移。

---

## 🎯 推荐方法: Supabase Dashboard（最简单）

### 步骤1: 登录Supabase Dashboard

访问: https://app.supabase.com

### 步骤2: 选择项目

选择您的项目: `hrjqzbhqueleszkvnsen`

### 步骤3: 打开SQL Editor

点击左侧菜单的 **SQL Editor**

### 步骤4: 执行迁移文件

#### 迁移1: 阶梯佣金配置

1. 打开文件: `supabase/migrations/20260417000001_add_tiered_config_to_commission_rules.sql`
2. 复制全部内容
3. 在SQL Editor中粘贴
4. 点击 **Run** 按钮
5. 确认执行成功

**预期结果**:

```
Success. No rows returned
```

#### 迁移2: 支付渠道配置表

1. 打开文件: `supabase/migrations/20260417000002_create_fcx_payment_channels.sql`
2. 复制全部内容
3. 在SQL Editor中粘贴
4. 点击 **Run** 按钮
5. 确认执行成功

**预期结果**:

```
Success. 3 rows affected
```

---

## ✅ 验证迁移

执行以下SQL验证迁移是否成功：

```sql
-- 1. 检查阶梯佣金配置列
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'commission_rules'
AND column_name = 'tiered_config';

-- 应该返回1行
```

```sql
-- 2. 检查支付渠道表是否存在
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'fcx_payment_channels';

-- 应该返回1行
```

```sql
-- 3. 检查默认支付渠道数据
SELECT channel_name, display_name, is_enabled, sort_order
FROM fcx_payment_channels
ORDER BY sort_order;

-- 应该返回3行: stripe, alipay, paypal
```

```sql
-- 4. 检查RLS策略
SELECT policyname, tablename, cmd
FROM pg_policies
WHERE tablename = 'fcx_payment_channels';

-- 应该返回3个策略
```

---

## 🔧 替代方法: 使用psql命令行

如果您本地安装了PostgreSQL客户端：

```bash
# 连接到Supabase数据库
psql "postgresql://postgres:[YOUR-PASSWORD]@db.hrjqzbhqueleszkvnsen.supabase.co:5432/postgres"

# 执行迁移文件
\i supabase/migrations/20260417000001_add_tiered_config_to_commission_rules.sql
\i supabase/migrations/20260417000002_create_fcx_payment_channels.sql

# 退出
\q
```

---

## ⚠️ 常见问题

### 问题1: 表已存在

**错误信息**: `relation "fcx_payment_channels" already exists`

**解决方案**: 这是正常的，说明迁移已经执行过。可以跳过。

### 问题2: 列已存在

**错误信息**: `column "tiered_config" of relation "commission_rules" already exists`

**解决方案**: 这是正常的，说明迁移已经执行过。可以跳过。

### 问题3: 权限不足

**错误信息**: `permission denied`

**解决方案**:

- 确保使用项目所有者账号登录
- 或使用Service Role Key连接

---

## 📊 迁移后检查

完成迁移后，请确认以下内容：

- [ ] `commission_rules` 表有 `tiered_config` 列
- [ ] `fcx_payment_channels` 表已创建
- [ ] 默认支付渠道数据已插入（3条）
- [ ] RLS策略已配置（3个）
- [ ] 索引已创建（2个）

---

## 🎉 下一步

迁移完成后，继续应用部署：

```bash
# 1. 构建应用
npm run build

# 2. 部署到Vercel
npx vercel --prod
```

或者使用一键部署脚本：

```powershell
.\deploy-v8.ps1 -SkipMigration
```

---

**📞 需要帮助？**

查看完整文档:

- `DEPLOYMENT_PREPARATION_CHECKLIST_V8.md`
- `DEPLOYMENT_QUICK_REFERENCE_V8.md`
- `VERIFICATION_REPORT_V8.md`
