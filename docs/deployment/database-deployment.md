# 数据库生产环境部署指南

## 📋 准备工作

### 1. 环境变量配置

将 `.env.example` 复制为 `.env.local` 并填写正确的值：

```bash
cp .env.example .env.local
```

需要配置的关键变量：

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase项目URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - 匿名访问密钥
- `SUPABASE_SERVICE_ROLE_KEY` - 服务角色密钥
- `DATABASE_URL` - 数据库连接字符串

### 2. 安装必要工具

```bash
# 安装Supabase CLI
npm install -g supabase

# 安装PostgreSQL客户端（Windows）
# 下载地址: https://www.postgresql.org/download/windows/

# 或者使用Docker
docker run -it --rm postgres psql
```

## 🚀 部署步骤

### 方法一：使用自动化脚本（推荐）

```bash
# 设置环境变量
export SUPABASE_PROJECT_ID=hrjqzbhqueleszkvnsen
export SUPABASE_DB_PASSWORD=Sup_105!^-^
export DATABASE_URL=postgresql://postgres:Sup_105!^-^@db.hrjqzbhqueleszkvnsen.supabase.co:5432/postgres

# 执行部署脚本
chmod +x scripts/deploy-database.sh
./scripts/deploy-database.sh
```

### 方法二：手动部署

#### 1. 链接到Supabase项目

```bash
supabase link --project-ref hrjqzbhqueleszkvnsen
```

#### 2. 执行数据库迁移

```bash
supabase db push
```

#### 3. 应用RLS策略

```bash
psql "$DATABASE_URL" -f supabase/rls_policies.sql
```

#### 4. 验证部署

```bash
node scripts/verify-database.js
```

## 🔧 验证检查清单

部署完成后，请验证以下项目：

- [ ] 数据库表已创建（parts, part_prices, uploaded_content, appointments, system_config）
- [ ] 必要索引已建立
- [ ] 种子数据已插入
- [ ] RLS策略已应用
- [ ] 安全视图已创建
- [ ] 基本查询功能正常

## 🛡️ 安全配置

### Row Level Security (RLS)

所有表都已启用RLS策略：

- **parts**: 所有人可读，认证用户可写
- **part_prices**: 所有人可读，认证用户可写
- **uploaded_content**: 所有人可读公开内容，用户可管理自己的内容
- **appointments**: 用户只能访问自己的预约
- **system_config**: 仅管理员可访问

### 访问控制

- 匿名用户：只读访问公开数据
- 认证用户：读写自己的数据
- 管理员：完全访问权限

## 📊 监控和维护

### 备份策略

- 自动每日备份
- 7天滚动保留
- 支持点对点恢复

### 性能监控

- 查询性能分析
- 连接数监控
- 存储空间监控

### 日常维护

```bash
# 查看数据库状态
supabase status

# 查看最近的日志
supabase logs

# 执行数据库备份
supabase db dump --data-only > backup.sql
```

## ⚠️ 故障排除

### 常见问题

1. **连接失败**

   ```bash
   # 检查连接字符串
   echo $DATABASE_URL

   # 测试连接
   psql "$DATABASE_URL" -c "SELECT version();"
   ```

2. **迁移失败**

   ```bash
   # 查看详细错误
   supabase db push --debug

   # 重置本地状态
   supabase db reset
   ```

3. **RLS策略问题**
   ```bash
   # 检查RLS状态
   psql "$DATABASE_URL" -c "
     SELECT tablename, relrowsecurity
     FROM pg_tables
     WHERE schemaname = 'public';
   "
   ```

### 紧急恢复

如遇严重问题，可通过以下方式恢复：

1. 使用Supabase控制台的备份恢复功能
2. 从本地备份文件恢复
3. 联系Supabase技术支持

## 📞 技术支持

- Supabase官方文档: https://supabase.com/docs
- 社区支持: https://github.com/supabase/supabase/discussions
- 项目Issue跟踪: [GitHub Issues](https://github.com/your-project/issues)

---

**注意**: 此文档适用于生产环境部署，请在正式部署前在测试环境中充分验证。
