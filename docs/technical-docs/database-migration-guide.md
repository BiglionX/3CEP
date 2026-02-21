# FixCycle 数据库迁移操作手册

## 📋 概述

本文档详细介绍了 FixCycle 项目的数据库迁移系统使用方法，包括迁移命令、最佳实践和故障排除指南。

## 🚀 快速开始

### 基本迁移流程

```bash
# 1. 检查当前状态
npm run db:status

# 2. 验证迁移脚本
npm run db:validate

# 3. 执行迁移
npm run db:migrate

# 4. 验证结果
npm run db:health-check
```

## 📚 核心命令详解

### 1. 状态检查 (`npm run db:status`)

显示当前数据库迁移状态和待执行的迁移。

**功能特性：**

- 显示当前版本和最新版本
- 列出已应用的迁移历史
- 显示待执行的迁移
- 提供数据库概览信息

**示例输出：**

```
📈 版本状态:
   当前版本: V1.3
   最新版本: V1.5
   状态: ⏳ 需要更新
   待执行: 2 个迁移

📋 已应用的迁移:
   ✅ V1.1 - create_device_dictionary
   ✅ V1.2 - create_fault_type_dictionary
   ✅ V1.3 - create_hot_links_pool

⏳ 待执行的迁移:
   ◻️  V1.4 - create_repair_shops_table
   ◻️  V1.5 - alter_existing_tables
```

### 2. 迁移执行 (`npm run db:migrate`)

执行正向数据库迁移。

**参数选项：**

```bash
# 执行所有待迁移
npm run db:migrate

# 执行到指定版本
npm run db:migrate -- --version=1.3

# 预演模式（不实际执行）
npm run db:migrate -- --dry-run
```

**执行过程：**

1. 初始化迁移历史表
2. 获取已应用的迁移列表
3. 筛选待执行的迁移
4. 按版本顺序执行迁移
5. 记录迁移历史

### 3. 回滚操作 (`npm run db:rollback`)

回滚已应用的迁移。

**参数选项：**

```bash
# 回滚最近一次迁移
npm run db:rollback -- --steps=1

# 回滚到指定版本
npm run db:rollback -- --to=1.2

# 预演模式
npm run db:rollback -- --dry-run
```

### 4. 脚本验证 (`npm run db:validate`)

验证迁移脚本的质量和完整性。

**检查内容：**

- 命名规范合规性
- 版本序列正确性
- SQL 语法有效性
- 迁移-回滚配对完整性
- 内容质量评估

## 📁 迁移文件规范

### 命名约定

**正向迁移：**

```
V{major}.{minor}.{patch}__{description}.sql
例如：V1.2.0__create_user_table.sql
```

**回滚脚本：**

```
U{major}.{minor}.{patch}__{description}.sql
例如：U1.2.0__drop_user_table.sql
```

### 版本管理

- **Major**: 破坏性变更
- **Minor**: 新功能添加
- **Patch**: Bug 修复和小调整

### 内容要求

**必须包含：**

- 幂等性操作（使用 `IF NOT EXISTS`）
- 适当的索引创建
- 表和列注释
- RLS 策略配置

**推荐包含：**

- 详细的注释说明
- 错误处理机制
- 性能优化考虑

## 🔧 最佳实践

### 1. 开发阶段

```bash
# 创建新迁移
touch supabase/migrations/V2.1.0__add_user_profile_fields.sql

# 编写迁移内容（遵循规范）

# 验证脚本质量
npm run db:validate

# 本地测试执行
npm run db:migrate -- --dry-run

# 实际执行迁移
npm run db:migrate
```

### 2. 团队协作

```bash
# 同步最新迁移
git pull origin main

# 检查本地状态
npm run db:status

# 执行缺失迁移
npm run db:migrate

# 验证环境一致性
npm run db:health-check
```

### 3. 部署流程

```bash
# CI环境验证
node scripts/ci-automation-check.js --quick

# 预生产环境
npm run db:migrate
npm run seed -- --minimal
npm run db:health-check

# 生产环境
# （需要额外的审批流程）
npm run db:migrate
npm run seed
npm run db:health-check
```

## 🛡️ 安全考虑

### 1. 权限管理

- 使用专门的服务账户执行迁移
- 限制生产环境的直接访问
- 实施变更审批流程

### 2. 数据保护

- 执行迁移前备份数据库
- 在低峰时段执行大型迁移
- 准备紧急回滚方案

### 3. 监控告警

- 监控迁移执行状态
- 设置失败告警机制
- 记录所有迁移操作

## 🚨 故障排除

### 常见问题

**1. 迁移执行失败**

```bash
# 检查错误详情
npm run db:status

# 查看具体错误
# 检查迁移脚本语法
npm run db:validate

# 手动修复后重试
npm run db:migrate
```

**2. 版本冲突**

```bash
# 查看迁移历史
npm run db:status

# 手动调整迁移顺序
# 或联系团队协调
```

**3. 回滚失败**

```bash
# 检查回滚脚本是否存在
ls supabase/migrations/U*

# 验证回滚脚本质量
npm run db:validate

# 手动执行回滚SQL
```

### 应急处理

**数据库恢复流程：**

1. 立即停止应用服务
2. 使用最近的备份恢复数据库
3. 重新执行必要的迁移
4. 验证数据完整性
5. 逐步恢复服务

## 📊 监控和维护

### 定期检查

```bash
# 每日健康检查
npm run db:health-check

# 每周迁移审计
npm run db:status
npm run db:validate

# 每月性能评估
# 分析慢查询和索引使用情况
```

### 性能优化

- 定期分析和优化慢查询
- 维护合适的索引策略
- 监控表增长和存储使用
- 实施分区策略（大数据量时）

## 📞 支持和反馈

如有问题或建议，请：

1. 查看本手册相关章节
2. 检查团队内部知识库
3. 联系数据库管理员
4. 提交 GitHub Issue

---

**最后更新：** 2026 年 2 月 20 日
**版本：** 1.0.0
