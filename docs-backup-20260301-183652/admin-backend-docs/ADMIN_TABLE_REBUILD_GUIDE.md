# 管理员表结构重建执行指南

## 📋 执行步骤

### 方法一：通过Supabase控制台执行（推荐）

1. **登录Supabase控制台**
   - 访问: https://app.supabase.com
   - 选择您的项目

2. **打开SQL编辑器**
   - 在左侧菜单中点击 "SQL Editor"
   - 或者访问: Project → SQL Editor

3. **执行表创建脚本**
   复制并执行以下SQL语句：

```sql
-- 创建管理员用户表
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建权限表
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(50) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_permissions_role ON permissions(role);

-- 插入默认权限数据
INSERT INTO permissions (role, resource, action, description) VALUES
  ('admin', 'all', 'manage', '超级管理员拥有所有权限'),
  ('content_reviewer', 'content', 'review', '内容审核权限'),
  ('shop_reviewer', 'shops', 'review', '店铺审核权限'),
  ('finance', 'finance', 'manage', '财务管理权限'),
  ('viewer', 'dashboard', 'view', '查看仪表板权限')
ON CONFLICT DO NOTHING;

-- 启用RLS（行级安全）
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

-- 设置RLS策略
CREATE POLICY "管理员可查看所有管理员用户"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.role = 'admin'
      AND au.is_active = true
    )
  );

CREATE POLICY "只有超级管理员可修改管理员用户"
  ON admin_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
      AND au.role = 'admin'
      AND au.is_active = true
    )
  );

-- 验证表创建
SELECT '表创建完成' as status;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('admin_users', 'permissions');
```

### 方法二：使用psql命令行工具

如果您有PostgreSQL命令行工具：

```bash
# 连接到Supabase数据库
psql "postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]"

# 执行SQL文件
\i sql/create-admin-system-tables.sql
```

### 方法三：通过Supabase CLI

```bash
# 安装Supabase CLI
npm install -g supabase

# 链接项目
supabase link --project-ref YOUR_PROJECT_ID

# 执行迁移
supabase migration up
```

## ✅ 验证执行结果

执行完成后，运行以下验证脚本：

```bash
node scripts/verify-admin-tables.js
```

或者手动验证：

```sql
-- 检查表是否存在
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('admin_users', 'permissions');

-- 检查表结构
\d admin_users
\d permissions

-- 检查数据
SELECT COUNT(*) FROM admin_users;
SELECT COUNT(*) FROM permissions;
```

## 🚀 后续步骤

表创建成功后：

1. **为现有管理员用户创建记录**

   ```sql
   INSERT INTO admin_users (user_id, email, role, is_active, created_by)
   SELECT id, email, 'admin', true, id
   FROM auth.users
   WHERE email = '1055603323@qq.com'
   ON CONFLICT (email) DO UPDATE SET
     role = 'admin',
     is_active = true;
   ```

2. **测试权限系统**
   - 重启应用服务器
   - 测试登录和权限验证功能

3. **更新相关代码**
   - 确保API和中间件能正确使用数据库表
   - 保持用户元数据方案作为备用

## ⚠️ 注意事项

- 执行前请备份现有数据
- 在测试环境中先验证
- 确保有足够的数据库权限
- 执行后要测试所有相关功能

## 📞 技术支持

如果遇到问题：

1. 检查Supabase项目日志
2. 验证数据库连接权限
3. 确认SQL语法正确性
4. 联系Supabase支持团队
