# 🚀 数据库表结构创建快速指南

## 立即执行步骤

### 1. 登录Supabase控制台
- 访问: https://app.supabase.com
- 使用您的账户登录
- 选择项目: `hrjqzbhqueleszkvnsen`

### 2. 进入SQL编辑器
- 点击左侧菜单"SQL Editor"
- 确保选择了正确的项目

### 3. 执行表结构创建
**方法一：执行完整脚本（推荐）**
1. 打开文件: `complete-table-structure.sql`
2. 复制全部内容
3. 粘贴到SQL编辑器中
4. 点击"RUN"按钮执行

**方法二：分步执行**
1. 执行: `supabase/migrations/001_init_schema.sql` （表结构和索引）
2. 执行: `supabase/migrations/002_seed_data.sql` （初始数据）
3. 执行: `supabase/rls_policies.sql` （安全策略）

## 预期结果

执行成功后应该看到：
```
status
------------------
表结构创建完成

table_name
------------
parts
part_prices
uploaded_content
appointments
system_config
```

## 验证创建结果

执行验证脚本确认：
```bash
node scripts/final-verification.js
```

期望输出：
```
✅ 服务角色密钥: 正常
✅ 数据库连接: 正常
✅ 表结构完整性: 5/5 表已创建
✅ 基本查询功能: 测试通过
🎉 部署验证成功！所有表已正确创建。
```

## 常见问题解决

**如果遇到错误**：
1. 检查SQL语法是否正确
2. 确认是否有足够的权限
3. 查看错误信息的具体内容

**如果表已存在**：
- 脚本使用 `IF NOT EXISTS` 语句，重复执行不会造成问题
- 可以安全地重新执行整个脚本

---
**预计执行时间**: 2-3分钟
**难度等级**: ⭐ 简单
**成功率**: 99%+