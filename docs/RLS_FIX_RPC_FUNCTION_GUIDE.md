# RLS 修复后 - RPC 函数创建指南

## ⚠️ 问题说明

您已成功修复 RLS 策略，但在创建 RPC 函数时遇到语法错误：
```
ERROR: 42601: syntax error at or near "RETURNSURNS"
```

**原因**：文档中的示例有拼写错误，`RETURNSURNS` 应该是 `RETURNS`

## ✅ 立即执行（30 秒完成）

### 步骤 1: 打开 Supabase Dashboard
访问：https://supabase.com/dashboard → SQL Editor

### 步骤 2: 复制并执行以下 SQL

```sql
-- 删除可能存在的旧函数
DROP FUNCTION IF EXISTS set_user_role(text);

-- 创建正确的函数
CREATE OR REPLACE FUNCTION set_user_role(role text)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.settings.current_user_role', role, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 验证创建成功
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_name = 'set_user_role';
```

### 步骤 3: 验证结果

应该看到类似输出：
```
routine_name    | routine_type | data_type
----------------|--------------|----------
set_user_role   | FUNCTION     | void
```

## 🎯 测试 RPC 函数

### 在 SQL Editor 中测试

```sql
-- 设置为管理员角色
SELECT set_user_role('admin');

-- 检查当前设置
SELECT current_setting('app.settings.current_user_role', true);
-- 应该返回：'admin'

-- 设置为普通用户
SELECT set_user_role('user');

-- 再次检查
SELECT current_setting('app.settings.current_user_role', true);
-- 应该返回：'user'
```

### 在前端应用中测试

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 设置为管理员角色
const { error } = await supabase.rpc('set_user_role', { role: 'admin' });

if (error) {
  console.error('设置角色失败:', error);
} else {
  console.log('角色设置成功！');
  
  // 现在可以执行需要管理员权限的操作
  const { data, error: fetchError } = await supabase
    .from('admin_users')
    .select('*');
    
  if (fetchError) {
    console.error('查询失败:', fetchError);
  } else {
    console.log('查询成功，数据:', data);
  }
}
```

## 🔧 常见问题排查

### 问题 1: 函数仍然创建失败

**解决**：
```sql
-- 尝试完全删除并重建
DROP FUNCTION IF EXISTS set_user_role(text) CASCADE;

CREATE OR REPLACE FUNCTION set_user_role(role text)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.settings.current_user_role', role, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 授予执行权限（如果需要）
GRANT EXECUTE ON FUNCTION set_user_role(text) TO authenticated;
```

### 问题 2: 调用 RPC 函数时报权限错误

**解决**：
```sql
-- 确保函数使用 SECURITY DEFINER
-- 这允许函数以创建者的权限运行

-- 检查函数定义
SELECT 
  proname,
  prosecdef
FROM pg_proc
WHERE proname = 'set_user_role';

-- prosecdef 应该为 true
```

### 问题 3: 设置了角色但仍然无法访问数据

**检查清单**：
1. ✅ RLS 策略已正确创建（您已完成）
2. ✅ RPC 函数已创建（正在做）
3. ✅ 在查询前调用了 RPC 函数
4. ✅ 使用的是同一个数据库连接

**调试代码**：
```typescript
// 1. 设置角色
await supabase.rpc('set_user_role', { role: 'admin' });

// 2. 立即验证角色是否设置成功
const { data: roleCheck } = await supabase.rpc('get_current_role');
console.log('当前角色:', roleCheck);

// 3. 执行查询
const { data, error } = await supabase.from('admin_users').select('*');
console.log('查询结果:', { data, error });
```

## 📝 完整的工作流程示例

### 在 Next.js 应用中

```typescript
// src/app/admin/users/page.tsx 或相关组件
'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function loadUsers() {
      try {
        // 1. 先设置角色（重要！）
        await supabase.rpc('set_user_role', { role: 'admin' });

        // 2. 然后查询数据
        const { data, error } = await supabase
          .from('admin_users')
          .select('*');

        if (error) throw error;
        
        setUsers(data || []);
      } catch (error) {
        console.error('加载失败:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [supabase]);

  if (loading) return <div>加载中...</div>;

  return (
    <div>
      <h1>管理员用户列表</h1>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
}
```

### 在服务端组件中（Next.js App Router）

```typescript
// src/app/admin/users/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function AdminUsersPage() {
  const supabase = createServerComponentClient({ cookies });

  // 注意：服务端组件中设置 session 变量的方式不同
  // 需要使用自定义 fetch 或其他方法
  
  const { data: users } = await supabase
    .from('admin_users')
    .select('*');

  return (
    <div>
      <h1>管理员用户列表</h1>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
}
```

## 🎁 额外工具：获取当前角色的辅助函数

```sql
-- 创建一个函数来获取当前设置的角色
CREATE OR REPLACE FUNCTION get_current_role()
RETURNS text AS $$
BEGIN
  RETURN current_setting('app.settings.current_user_role', true);
END;
$$ LANGUAGE plpgsql;

-- 使用示例
SELECT get_current_role();  -- 返回当前角色
```

## ✅ 完成检查清单

- [x] RLS 策略已修复（您已完成）
- [ ] RPC 函数 `set_user_role` 已创建 **← 现在执行**
- [ ] RPC 函数测试通过
- [ ] 前端代码集成完成
- [ ] 实际业务场景测试通过

## 📞 需要帮助？

如果仍有问题，请提供：
1. 完整的错误信息
2. 已执行的 SQL 语句
3. Supabase 项目 ID（可选）

---

**下一步**：执行上面的 SQL 创建 RPC 函数，然后测试功能是否正常！
