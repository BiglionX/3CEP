# 租户 API 模块导入问题解决方案

## 问题描述

```
找不到模块"@/lib/database.types"或其相应的类型声明。ts(2307)
```

## 问题原因分析

### 1. 路径别名配置问题

在 `tsconfig.json` 中配置了路径映射：

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

这意味着 `@/` 前缀指向项目根目录下的 `src/` 文件夹。

### 2. 文件位置不当

如果 TypeScript 文件放置在项目根目录而非 `src/` 目录下，路径别名将无法正确解析。

### 3. 模块导入语法错误

原代码可能存在以下问题：

- 错误的导入语句格式
- 导入了不存在的导出成员
- 缺少必要的类型声明

## 解决方案

### 方案一：正确放置文件位置（推荐）

将 TypeScript 文件放置在 `src/` 目录下：

```typescript
// ✅ 正确：src/test-tenant-api-fix.ts
import type { Database } from '@/lib/database.types';
import supabase from '@/lib/supabase';
```

### 方案二：使用相对路径导入

如果必须在根目录下使用，可以使用相对路径：

```typescript
// ✅ 备选方案：使用相对路径
import type { Database } from './src/lib/database.types';
import supabase from './src/lib/supabase';
```

### 方案三：修改 tsconfig.json 配置

扩展包含范围以支持根目录下的 TypeScript 文件：

```json
{
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    "test-tenant-api-fix.ts", // 添加具体文件
    ".next/types/**/*.ts"
  ]
}
```

## 最佳实践示例

### 正确的导入方式

```typescript
/**
 * 租户 API 修复测试文件
 */
import type { Database } from '@/lib/database.types';
import supabase from '@/lib/supabase';

// 使用数据库类型
type TenantRow = Database['public']['Tables']['tenants']['Row'];

// 测试函数
async function testTenantApi() {
  try {
    const client = supabase;

    const { data, error } = await client
      .from('tenants')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('查询失败:', error);
      return;
    }

    console.log('租户数据:', data);
  } catch (error) {
    console.error('测试错误:', error);
  }
}
```

### 类型安全的数据访问

```typescript
// 利用生成的数据库类型确保类型安全
type UserTenantRow = Database['public']['Tables']['user_tenants']['Row'];

interface TenantApiResponse {
  tenants: TenantRow[];
  userTenants: UserTenantRow[];
}
```

## 验证方法

使用 TypeScript 编译器验证无错误：

```bash
# 检查单个文件
npx tsc --noEmit src/test-tenant-api-fix.ts

# 检查整个项目
npx tsc --noEmit

# 运行测试
node dist/test-tenant-api-fix.js  # 如果已编译
```

## 常见错误及解决方案

| 错误信息                                       | 原因                   | 解决方案                 |
| ---------------------------------------------- | ---------------------- | ------------------------ |
| `Cannot find module '@/lib/database.types'`    | 文件不在 src/ 目录下   | 将文件移至 src/ 目录     |
| `Module has no exported member 'createClient'` | 导入了不存在的成员     | 检查模块实际导出内容     |
| `Property 'from' does not exist`               | 客户端实例未正确初始化 | 确保正确导入和使用客户端 |

## 项目结构建议

```
project-root/
├── src/
│   ├── lib/
│   │   ├── database.types.ts    # 数据库类型定义
│   │   └── supabase.ts          # Supabase 客户端
│   └── test-tenant-api-fix.ts   # 测试文件 ✅
├── tests/                       # 测试文件目录
└── tsconfig.json                # TypeScript 配置
```

## 总结

通过将文件放置在正确的目录位置并使用标准的导入语法，可以完全解决模块找不到的问题。建议始终遵循项目的目录结构约定，这样可以避免大部分路径相关的 TypeScript 错误。
