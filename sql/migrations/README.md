# 数据库迁移指南

## 迁移脚本说明

### 001_inventory_ai_schema.sql

**功能**: 为进销存系统添加AI预测相关表结构

**包含内容**:

- ✅ 扩展 `foreign_trade_inventory` 表(添加AI相关字段)
- ✅ 创建 `sales_forecasts` 表(销量预测)
- ✅ 创建 `replenishment_suggestions` 表(补货建议)
- ✅ 创建 `inventory_predictions_log` 表(预测日志)
- ✅ 创建 `inventory_health_view` 视图(库存健康度概览)

**前置条件**:

- PostgreSQL 数据库
- 如果 `foreign_trade_inventory` 表不存在,脚本会自动创建最小化版本
- 推荐先执行 `sql/foreign-trade-schema.sql` 获取完整表结构

## 执行方法

### 方法1: 通过 Supabase Dashboard

1. 登录 Supabase Dashboard
2. 进入 SQL Editor
3. 复制 `001_inventory_ai_schema.sql` 的内容
4. 点击 "Run" 执行
5. 查看输出确认成功

### 方法2: 通过 psql 命令行

```bash
# 连接到数据库
psql -h your-host -U postgres -d your-database

# 执行迁移脚本
\i sql/migrations/001_inventory_ai_schema.sql
```

### 方法3: 通过 Supabase CLI

```bash
# 确保已配置 Supabase CLI
supabase db push
```

## 验证迁移

执行以下SQL验证表是否创建成功:

```sql
-- 检查所有新表
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'sales_forecasts',
    'replenishment_suggestions',
    'inventory_predictions_log'
);

-- 检查视图
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name = 'inventory_health_view';

-- 检查 inventory 表的新字段
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'foreign_trade_inventory'
AND column_name IN (
    'safety_stock',
    'reorder_point',
    'lead_time_days',
    'forecast_enabled',
    'last_forecast_date'
);
```

## 回滚方法

如果需要回滚此迁移,执行以下SQL:

```sql
-- 删除视图
DROP VIEW IF EXISTS inventory_health_view;

-- 删除触发器
DROP TRIGGER IF EXISTS update_replenishment_updated_at ON replenishment_suggestions;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 删除表
DROP TABLE IF EXISTS inventory_predictions_log;
DROP TABLE IF EXISTS replenishment_suggestions;
DROP TABLE IF EXISTS sales_forecasts;

-- 移除 inventory 表的扩展字段
ALTER TABLE foreign_trade_inventory
DROP COLUMN IF EXISTS safety_stock,
DROP COLUMN IF EXISTS reorder_point,
DROP COLUMN IF EXISTS lead_time_days,
DROP COLUMN IF EXISTS forecast_enabled,
DROP COLUMN IF EXISTS last_forecast_date;
```

## 注意事项

1. **备份数据**: 执行迁移前请备份数据库
2. **测试环境**: 建议先在测试环境验证
3. **事务安全**: 脚本使用 `IF NOT EXISTS`,可重复执行
4. **依赖关系**: 如果缺少基础表,脚本会自动创建最小化版本
5. **生产环境**: 生产环境执行前请在维护窗口进行

## 常见问题

### Q: 提示 "relation does not exist"?

A: 脚本已自动处理此问题,会创建最小化的基础表。如需完整表结构,请先执行 `sql/foreign-trade-schema.sql`。

### Q: 可以重复执行吗?

A: 可以,所有操作都使用了 `IF NOT EXISTS` 或 `IF NOT EXISTS` 检查。

### Q: 迁移失败怎么办?

A: 查看错误信息,使用上述回滚SQL清理后重新执行。

## 后续步骤

迁移完成后:

1. 启动预测API服务: `docker-compose up prediction-api`
2. 配置环境变量(参考 `.env.example`)
3. 导入n8n工作流(参考 `n8n-workflows/README.md`)
4. 测试AI预测功能

---

**迁移版本**: 001
**最后更新**: 2026-04-08
**维护者**: DevOps Team
