# 数据中心测试数据插入指南

## 📊 测试数据概览

已为数据中心模块的 5 张核心表准备了完整的测试数据:

| 表名                 | 数据量 | 说明                                         |
| -------------------- | ------ | -------------------------------------------- |
| `data_sources`       | 4 条   | 数据源 (数据库、API、文件、流)               |
| `data_assets`        | 10 条  | 数据资产 (表、视图、API、文件、报表、仪表盘) |
| `metadata_registry`  | 7 条   | 元数据注册 (字段级元数据)                    |
| `data_quality_rules` | 6 条   | 数据质量规则 (完整性、准确性、一致性等)      |
| `data_lineage`       | 4 条   | 数据血缘关系 (ETL 流程)                      |

---

## 🚀 执行步骤

### 方式一：使用图形化 SQL 客户端 (推荐)

1. **打开 SQL 客户端**
   - DBeaver
   - pgAdmin
   - Navicat
   - 或其他 PostgreSQL 客户端

2. **打开文件**

   ```
   d:\BigLionX\3cep\sql\insert-datacenter-test-data.sql
   ```

3. **执行脚本**
   - 点击"执行"按钮或按 `Ctrl+Enter`

4. **验证结果**
   - 查看消息输出，确认插入成功

### 方式二：使用命令行 (如果安装了 psql)

```bash
psql -U screw_reborn -d screw_reborn -f sql/insert-datacenter-test-data.sql
```

---

## 📦 测试数据详情

### 1. data_sources (数据源)

| 名称              | 类型     | 状态     | 部门       |
| ----------------- | -------- | -------- | ---------- |
| Supabase 主数据库 | database | active   | 技术部     |
| N8N 工作流系统    | api      | active   | 自动化部   |
| 本地文件系统      | file     | inactive | 数据部     |
| 用户行为事件流    | stream   | active   | 数据分析部 |

### 2. data_assets (数据资产)

#### 表类 (3 个)

- `devices` - 设备信息表 (质量评分：95)
- `fault_types` - 故障类型表 (质量评分：92)
- `parts` - 配件信息表 (质量评分：88)

#### 视图类 (2 个)

- `parts_price_analysis` - 配件价格分析视图 (质量评分：90)
- `device_status_dashboard` - 设备状态监控看板 (质量评分：96)

#### API 类 (2 个)

- `user_behavior_events` - 用户行为事件 API (质量评分：94, 机密级)
- `inventory_sync` - 库存同步 API (质量评分：87)

#### 文件类 (1 个)

- `device_import_template` - 设备导入模板 (质量评分：100)

#### 报表类 (1 个)

- `monthly_operation_report` - 月度运营报表 (质量评分：98, 机密级)

#### 仪表盘类 (1 个)

- `executive_dashboard` - 高管驾驶舱 (质量评分：99, 限制级)

### 3. metadata_registry (元数据)

包含以下字段元数据:

- `devices.id` - 设备 ID
- `devices.name` - 设备名称
- `devices.status` - 设备状态
- `devices.created_at` - 创建时间
- `fault_types.fault_code` - 故障编码
- `fault_types.fault_name` - 故障名称
- `fault_types.severity_level` - 严重程度

### 4. data_quality_rules (质量规则)

#### 完整性规则 (2 个)

- 设备名称完整性检查 (高优先级)
- 设备状态完整性检查 (中优先级)

#### 准确性规则 (1 个)

- 设备状态有效性检查 (高优先级)

#### 一致性规则 (1 个)

- 故障编码格式一致性 (中优先级)

#### 唯一性规则 (1 个)

- 设备 ID 唯一性检查 (关键优先级)

#### 及时性规则 (1 个)

- 设备信息更新及时性 (低优先级)

### 5. data_lineage (血缘关系)

| 流程名称                  | 类型     | 频率   | 说明             |
| ------------------------- | -------- | ------ | ---------------- |
| device_status_etl         | SQL 脚本 | 每小时 | 设备状态数据处理 |
| price_calculation_job     | SQL 脚本 | 每天   | 价格分析计算     |
| behavior_stream_processor | 流处理   | 实时   | 用户行为数据流   |
| inventory_aggregation     | SQL 脚本 | 每小时 | 库存数据聚合     |

---

## ✅ 验证方法

### 方法一：前端页面验证

1. **访问元数据管理页面**

   ```
   http://localhost:3001/data-center/metadata
   ```

2. **检查内容**
   - ✅ 显示 10 条数据资产记录
   - ✅ 统计卡片显示正确数量
   - ✅ 可以按类型、类别筛选
   - ✅ 搜索功能正常

3. **预期效果**
   - 总资产数：10
   - 平均质量评分：约 93.9
   - 类型分布：table(3), view(2), api(2), file(1), report(1), dashboard(1)

### 方法二：SQL 查询验证

```sql
-- 检查 data_assets 表数据量
SELECT COUNT(*) as total_assets FROM data_assets WHERE is_active = true;

-- 检查各类资产分布
SELECT asset_type, COUNT(*) as count
FROM data_assets
GROUP BY asset_type
ORDER BY count DESC;

-- 检查平均质量评分
SELECT ROUND(AVG(quality_score), 2) as avg_quality_score
FROM data_assets
WHERE is_active = true;

-- 检查不同敏感级别的分布
SELECT sensitivity_level, COUNT(*) as count
FROM data_assets
GROUP BY sensitivity_level;
```

### 方法三：检查所有表的数据量

```sql
SELECT 'data_sources' as table_name, COUNT(*) as row_count FROM data_sources
UNION ALL
SELECT 'data_assets', COUNT(*) FROM data_assets
UNION ALL
SELECT 'metadata_registry', COUNT(*) FROM metadata_registry
UNION ALL
SELECT 'data_quality_rules', COUNT(*) FROM data_quality_rules
UNION ALL
SELECT 'data_lineage', COUNT(*) FROM data_lineage
ORDER BY table_name;
```

**预期结果:**

```
table_name         | row_count
-------------------+----------
data_assets        |       10
data_lineage       |        4
data_quality_rules |        6
data_sources       |        4
metadata_registry  |        7
```

---

## 🔍 测试场景

### 场景 1：完整数据展示

**步骤:**

1. 访问 `/data-center/metadata`
2. 查看所有资产是否正确显示

**预期:**

- 显示 10 条活跃资产
- 每条记录显示正确的名称、类型、类别、质量评分

### 场景 2：筛选功能测试

**测试用例:**

- 筛选类型为 "table" → 应显示 3 条记录
- 筛选类型为 "view" → 应显示 2 条记录
- 筛选类型为 "api" → 应显示 2 条记录
- 筛选敏感级别为 "internal" → 应显示 6 条记录
- 筛选敏感级别为 "confidential" → 应显示 2 条记录

### 场景 3：搜索功能测试

**搜索关键词:**

- 输入 "设备" → 应显示设备相关资产
- 输入 "API" → 应显示 API 类资产
- 输入 "价格" → 应显示价格分析相关资产

### 场景 4：统计数据验证

**检查统计卡片:**

- 总资产数：应为 10
- 平均质量评分：应在 93-94 之间
- 按类型分布图：应显示 6 种类型

---

## 🐛 常见问题

### 问题 1：前端页面显示空白

**可能原因:**

- API 调用失败
- 数据库连接问题

**解决方法:**

1. 检查浏览器控制台是否有错误
2. 检查 `.env` 文件中的数据库配置
3. 确认 API 端点正常工作

### 问题 2：数据未显示

**可能原因:**

- 测试数据未插入成功
- RLS 策略限制了访问

**解决方法:**

1. 运行验证 SQL 检查数据量
2. 检查当前登录用户的角色权限
3. 确认 RLS 策略配置正确

### 问题 3：插入失败提示错误

**可能原因:**

- 表不存在
- 字段名称不匹配

**解决方法:**

1. 先执行表创建脚本
2. 检查数据库表结构是否与脚本一致
3. 确认使用的是正确的数据库

---

## 📝 清理测试数据

如需删除所有测试数据，可执行:

```sql
-- 删除所有测试数据 (谨慎操作!)
DELETE FROM data_lineage;
DELETE FROM data_quality_rules;
DELETE FROM metadata_registry;
DELETE FROM data_assets;
DELETE FROM data_sources;
```

或者使用截断命令 (更快):

```sql
-- 快速清空所有测试数据
TRUNCATE TABLE data_lineage CASCADE;
TRUNCATE TABLE data_quality_rules CASCADE;
TRUNCATE TABLE metadata_registry CASCADE;
TRUNCATE TABLE data_assets CASCADE;
TRUNCATE TABLE data_sources CASCADE;
```

---

## 🎯 下一步建议

测试数据插入完成后，建议继续:

1. ✅ **测试前端功能**
   - 验证所有筛选和搜索功能
   - 检查统计数据准确性
   - 测试响应式布局

2. ✅ **完善 CRUD 操作**
   - 创建数据资产管理界面
   - 实现新增、编辑、删除功能
   - 添加批量导入导出

3. ✅ **集成质量监控**
   - 在 frontend 中显示质量规则
   - 实现质量告警功能
   - 可视化数据血缘关系

---

**创建日期**: 2026-03-25
**测试数据版本**: v1.0
**适用环境**: 开发/测试环境
