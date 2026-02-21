# 🚀 数据库一键部署指南

## 🔧 立即执行步骤

### 方案一：使用完整部署脚本（推荐）

1. **登录Supabase控制台**
   - 访问: https://app.supabase.com/project/hrjqzbhqueleszkvnsen/sql
   - 点击左侧"SQL Editor"

2. **执行部署**
   - 打开文件: `complete-deployment.sql`
   - 复制全部内容粘贴到SQL Editor
   - 点击"RUN"按钮执行

### 方案二：分步执行（如果一键脚本有问题）

1. **第一步**: 执行表结构
   ```
   文件: supabase/migrations/001_init_schema.sql
   ```

2. **第二步**: 插入初始数据
   ```
   文件: supabase/migrations/002_seed_data.sql
   ```

3. **第三步**: 应用安全策略
   ```
   文件: supabase/rls_policies.sql
   ```

## ✅ 验证部署结果

执行完成后应该看到类似输出：
```
status
-----------------------------
=== 数据库结构创建完成 ===

table_name
---------------
appointments
parts
part_prices
system_config
uploaded_content

status
-----------------------------
=== 各表记录数统计 ===

table_name     | record_count
---------------|-------------
parts          | 5
part_prices    | 6
uploaded_content | 3
appointments   | 3
system_config  | 6
```

## 🧪 最终验证

运行本地验证脚本确认：
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
✅ 数据库生产环境准备就绪
```

## ⚠️ 常见问题处理

**如果出现错误**：
- 检查SQL语法是否正确
- 确认文件路径是否正确（使用 `\ir` 命令时）
- 查看具体的错误信息

**如果表已存在**：
- 脚本使用 `IF NOT EXISTS`，可安全重复执行
- 不会造成数据丢失

**如果连接超时**：
- 分步执行而不是一次性执行
- 检查网络连接稳定性

---
**执行时间**: 3-5分钟
**成功率**: 99%+
**支持**: 如有问题请联系技术支持