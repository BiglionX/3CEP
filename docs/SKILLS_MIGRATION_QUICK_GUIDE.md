# Skills 数据库迁移完整性检查 - 快速指南

## ✅ 问题已修复

### 修复内容

1. ✅ **SQL 语法错误修复** - 将 `RAISE NOTICE '文本' || variable` 改为 `RAISE NOTICE '文本：% 文本', variable`
2. ✅ **pg_policies 查询修复** - 移除了不存在的 `polrelid` 字段，直接使用 `schemaname` 和 `tablename`
3. ✅ **创建了 3 套完整的检查工具**

---

## 📋 三套检查方案

### 方案 1：SQL 一键检查 ⭐ 推荐

**文件位置**: `supabase/migrations/verify-skills-migration.sql`

**使用方法**:

```sql
-- 在 Supabase SQL Editor 中打开并执行此文件
```

**优点**:

- ✅ 直接在数据库中运行，最准确
- ✅ 7 个维度全面检查
- ✅ 即时输出结果

---

### 方案 2：PowerShell 自动化脚本

**文件位置**: `scripts/check-skills-migration.ps1`

**使用方法**:

```powershell
# 基础检查
.\scripts\check-skills-migration.ps1

# 详细检查
.\scripts\check-skills-migration.ps1 -Detailed

# 导出报告
.\scripts\check-skills-migration.ps1 -ExportReport
```

**优点**:

- ✅ 可集成到 CI/CD
- ✅ 支持彩色输出
- ✅ 自动统计通过率

---

### 方案 3：Markdown 检查清单

**文件位置**: `docs\SKILLS_MIGRATION_CHECKLIST.md`

**使用方法**:

- 打印出来逐项核对
- 适合人工审查和审计

**优点**:

- ✅ 可视化强
- ✅ 可手动标记
- ✅ 便于团队审查

---

## 🎯 核心检查维度（7 个）

| 维度          | 期望值 | 说明                        |
| ------------- | ------ | --------------------------- |
| 1. 核心表数量 | 12 个  | skills, skill_categories 等 |
| 2. 关键字段   | ≥13 个 | skills 表的必需字段         |
| 3. RLS 策略   | ≥20 个 | 行级安全策略                |
| 4. 索引优化   | ≥30 个 | 性能保障                    |
| 5. 默认数据   | 8 个   | 分类数据                    |
| 6. 触发器     | ≥5 个  | 自动化逻辑                  |
| 7. 视图函数   | 3 个   | 查询封装                    |

---

## 🚀 快速开始

### 第一步：执行 SQL 检查

```sql
-- 复制 verify-skills-migration.sql 全部内容
-- 在 Supabase SQL Editor 中执行
```

### 第二步：查看输出

**成功示例**:

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

**失败示例**:

```
========================================
⚠️ 发现以下问题:
❌ 核心表缺失：期望 12 个，实际 10 个
❌ skills 表缺少关键字段
========================================
建议：重新执行缺失的迁移脚本
```

---

## 🔧 常见错误与解决方案

### 错误 1: 表不存在

```
ERROR: relation "skills" does not exist
```

**解决**: 执行 `034_add_skill_store_management.sql`

### 错误 2: 字段名错误

```
ERROR: column "version" does not exist
```

**解决**: 应该是 `new_version` (skill_version_history 表)

### 错误 3: RLS 策略缺失

```
RLS 策略：0 个 (未找到)
```

**解决**: 重新执行迁移脚本中的 RLS 部分

---

## 📊 通过率计算

```
通过率 = (通过的检查项 / 总检查项) × 100%

判定标准:
- 100%     ✅ 完美
- ≥95%     ✅ 良好
- ≥80%     ✅ 合格
- <80%     ❌ 不合格
```

---

## 📁 相关文件清单

```
项目根目录/
├── supabase/migrations/
│   ├── verify-skills-migration.sql      ⭐ 新增：SQL 检查脚本
│   ├── 034_add_skill_store_management.sql
│   ├── 035_add_marketplace_roles.sql
│   ├── 036_add_skill_version_history.sql
│   └── ... (其他迁移文件)
├── scripts/
│   └── check-skills-migration.ps1       ⭐ 新增：PowerShell 脚本
└── docs/
    └── SKILLS_MIGRATION_CHECKLIST.md    ⭐ 新增：检查清单文档
```

---

## ✅ 验收标准

### 必须满足的条件：

1. ✅ 12 个核心表全部存在
2. ✅ skills 表包含所有必需字段
3. ✅ RLS 策略启用（≥20 个）
4. ✅ 索引优化完成（≥30 个）
5. ✅ 默认分类数据已插入（8 个）

### 可选条件：

- ✅ 触发器正常工作（≥5 个）
- ✅ 视图函数可用
- ✅ 前端 API 调用正常

---

## 🎯 下一步行动

检查通过后：

1. **功能测试**

   ```bash
   # 启动开发服务器
   npm run dev

   # 访问管理后台
   http://localhost:3001/admin/skill-store
   ```

2. **API 测试**

   ```bash
   # 测试列表 API
   curl http://localhost:3001/api/admin/skill-store/list
   ```

3. **权限验证**
   - 测试不同角色的访问控制
   - 验证 RLS 策略生效

---

## 📞 支持

如有问题，请查阅：

- `docs/SKILLS_MIGRATION_CHECKLIST.md` - 详细检查清单
- `supabase/migrations/044_preflight_check.sql` - 预检查脚本

---

**修复完成时间**: 2026-03-26
**状态**: ✅ 已修复并创建完整检查工具
**可用性**: 立即可用
