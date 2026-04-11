# 🎨 产品库模块 - 前端开发指南

**创建日期**: 2026-04-09
**状态**: 📝 待开发

---

## 📋 前端功能清单

### Phase 6: 前端界面开发（预计80小时）

#### 1. 品牌管理页面（8小时）

- [ ] 品牌列表页（表格展示、搜索、筛选）
- [ ] 创建品牌对话框
- [ ] 编辑品牌对话框
- [ ] Logo上传组件
- [ ] 批量操作工具栏

#### 2. 产品管理页面（16小时）

- [ ] 整机产品列表页
- [ ] 创建产品向导（多步骤表单）
- [ ] 产品详情页面
- [ ] 产品编辑页面
- [ ] 发布/下架操作
- [ ] 版本历史查看

#### 3. 配件/部件/零件管理（12小时）

- [ ] 配件列表页
- [ ] 部件列表页
- [ ] 零件列表页
- [ ] 统一的创建/编辑表单
- [ ] 类型筛选器

#### 4. BOM可视化编辑器（16小时）

- [ ] 树形结构展示
- [ ] 拖拽添加/删除节点
- [ ] 关系类型选择器
- [ ] 数量调整
- [ ] 实时预览

#### 5. 数据导入向导（8小时）

- [ ] 文件上传组件
- [ ] CSV/Excel解析预览
- [ ] 字段映射配置
- [ ] 导入进度显示
- [ ] 错误报告展示

#### 6. 溯源码管理（12小时）

- [ ] 溯源码生成向导
- [ ] 二维码批量下载
- [ ] 溯源历史时间线
- [ ] 扫码验证页面
- [ ] 统计图表展示

#### 7. 产品选择器组件（8小时）

- [ ] 搜索框（支持自动完成）
- [ ] 产品卡片展示
- [ ] 多选/单选模式
- [ ] 最近使用记录
- [ ] 收藏夹功能

---

## 🛠️ 技术栈建议

### UI框架

- **Next.js 14** - App Router
- **React 18** - 函数组件 + Hooks
- **TypeScript** - 严格类型

### UI组件库（推荐）

```bash
# 选项1: shadcn/ui（推荐，现代化）
npx shadcn-ui@latest init

# 选项2: Ant Design（企业级）
npm install antd @ant-design/icons

# 选项3: MUI（Material Design）
npm install @mui/material @emotion/react @emotion/styled
```

### 状态管理

- **Zustand** - 轻量级全局状态
- **React Query** - 服务端状态管理

### 表单处理

- **React Hook Form** - 高性能表单
- **Zod** - Schema验证

### 数据可视化

- **Recharts** - 图表库
- **React Flow** - 流程图/BOM树

### 其他工具

- **date-fns** - 日期处理
- **lodash** - 工具函数
- **qrcode.react** - 前端二维码生成

---

## 📁 推荐的目录结构

```
src/app/
├── (dashboard)/
│   ├── product-library/
│   │   ├── page.tsx                    # 产品库首页
│   │   ├── brands/
│   │   │   ├── page.tsx                # 品牌列表
│   │   │   ├── create/page.tsx         # 创建品牌
│   │   │   └── [id]/edit/page.tsx      # 编辑品牌
│   │   ├── products/
│   │   │   ├── page.tsx                # 产品列表
│   │   │   ├── create/page.tsx         # 创建产品向导
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx            # 产品详情
│   │   │   │   ├── edit/page.tsx       # 编辑产品
│   │   │   │   └── bom/page.tsx        # BOM编辑器
│   │   │   └── import/page.tsx         # 数据导入
│   │   ├── accessories/page.tsx        # 配件列表
│   │   ├── components/page.tsx         # 部件列表
│   │   ├── parts/page.tsx              # 零件列表
│   │   └── traceability/
│   │       ├── generate/page.tsx       # 生成溯源码
│   │       ├── [id]/history/page.tsx   # 溯源历史
│   │       └── verify/page.tsx         # 扫码验证
│   │
│   └── inventory/
│       └── import-from-library/page.tsx # 从产品库导入
│
├── components/
│   ├── product-library/
│   │   ├── BrandCard.tsx
│   │   ├── ProductTable.tsx
│   │   ├── ProductSelector.tsx
│   │   ├── BOMTree.tsx
│   │   ├── ImportWizard.tsx
│   │   ├── QRCodeGenerator.tsx
│   │   └── TraceabilityTimeline.tsx
│   │
│   └── shared/
│       ├── DataTable.tsx
│       ├── SearchBar.tsx
│       └── FileUpload.tsx
│
├── hooks/
│   ├── useBrands.ts
│   ├── useProducts.ts
│   ├── useTraceability.ts
│   └── useImport.ts
│
└── stores/
    ├── brandStore.ts
    ├── productStore.ts
    └── traceabilityStore.ts
```

---

## 🚀 快速开始示例

### 1. 安装依赖

```bash
# UI组件库（选择其一）
npx shadcn-ui@latest init

# 状态管理
npm install zustand @tanstack/react-query

# 表单处理
npm install react-hook-form zod @hookform/resolvers

# 数据可视化
npm install recharts reactflow

# 工具库
npm install date-fns lodash-es qrcode.react
```

### 2. 创建 API Client

```typescript
// src/lib/api/product-library.ts
import { supabase } from '@/lib/supabase';

export const productLibraryAPI = {
  // 品牌
  async getBrands(params?: { search?: string; page?: number; limit?: number }) {
    let query = supabase
      .from('product_library.brands')
      .select('*', { count: 'exact' });

    if (params?.search) {
      query = query.ilike('name', `%${params.search}%`);
    }

    const { data, error, count } = await query
      .range(
        (params?.page || 0) * (params?.limit || 20),
        (params?.page || 0) * (params?.limit || 20) + (params?.limit || 20) - 1
      )
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, count };
  },

  async createBrand(brand: any) {
    const { data, error } = await supabase
      .from('product_library.brands')
      .insert([brand])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 产品
  async getProducts(params?: any) {
    // 类似实现...
  },

  // 溯源码
  async generateTraceabilityCodes(input: any) {
    const response = await fetch('/api/traceability/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    const result = await response.json();
    if (!result.success) throw new Error(result.error);
    return result.data;
  },
};
```

### 3. 创建自定义 Hook

```typescript
// src/hooks/useBrands.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productLibraryAPI } from '@/lib/api/product-library';

export function useBrands(params?: any) {
  return useQuery({
    queryKey: ['brands', params],
    queryFn: () => productLibraryAPI.getBrands(params),
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productLibraryAPI.createBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
}
```

### 4. 创建品牌列表页面

```typescript
// src/app/(dashboard)/product-library/brands/page.tsx
'use client';

import { useState } from 'react';
import { useBrands } from '@/hooks/useBrands';
import { DataTable } from '@/components/shared/DataTable';
import { SearchBar } from '@/components/shared/SearchBar';

export default function BrandsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const { data, isLoading, error } = useBrands({ search, page, limit: 20 });

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>加载失败</div>;

  const columns = [
    { header: '品牌名称', accessor: 'name' },
    { header: '描述', accessor: 'description' },
    { header: '创建时间', accessor: 'created_at' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">品牌管理</h1>

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="搜索品牌..."
      />

      <DataTable
        columns={columns}
        data={data?.data || []}
        pagination={{
          page,
          pageSize: 20,
          total: data?.count || 0,
          onPageChange: setPage
        }}
      />
    </div>
  );
}
```

### 5. 创建溯源码生成页面

```typescript
// src/app/(dashboard)/product-library/traceability/generate/page.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import QRCode from 'qrcode.react';

const schema = z.object({
  tenantProductId: z.string().uuid(),
  quantity: z.number().min(1).max(1000),
  expiresInDays: z.number().optional()
});

type FormData = z.infer<typeof schema>;

export default function GenerateTraceabilityPage() {
  const [generatedCodes, setGeneratedCodes] = useState<any[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await fetch('/api/traceability/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const json = await result.json();
      setGeneratedCodes(json.data.codes);
    } catch (error) {
      console.error('生成失败:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">生成溯源码</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
        <div>
          <label>产品ID</label>
          <input {...register('tenantProductId')} className="w-full p-2 border rounded" />
          {errors.tenantProductId && <span className="text-red-500">{errors.tenantProductId.message}</span>}
        </div>

        <div>
          <label>数量</label>
          <input type="number" {...register('quantity', { valueAsNumber: true })} className="w-full p-2 border rounded" />
        </div>

        <div>
          <label>有效期（天）</label>
          <input type="number" {...register('expiresInDays', { valueAsNumber: true })} className="w-full p-2 border rounded" />
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          生成溯源码
        </button>
      </form>

      {generatedCodes.length > 0 && (
        <div className="mt-8 grid grid-cols-3 gap-4">
          {generatedCodes.map((code) => (
            <div key={code.id} className="border p-4 rounded">
              <QRCode value={code.code} size={128} />
              <p className="text-sm mt-2 truncate">{code.code}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 📊 API 端点参考

### 产品库 API

```typescript
GET    /api/product-library/brands
POST   /api/product-library/brands
GET    /api/product-library/products
POST   /api/product-library/products
POST   /api/product-library/products/:id/publish
GET    /api/product-library/products/:id/bom
POST   /api/product-library/products/:id/bom
```

### 进销存集成 API

```typescript
POST   /api/inventory/import-from-library
GET    /api/inventory/library-products
GET    /api/inventory/:id/sync-status
POST   /api/inventory/:id/sync
```

### 溯源码 API

```typescript
POST   /api/traceability/generate
GET    /api/traceability/verify/:code
GET    /api/traceability/:id/history
POST   /api/traceability/:id/event
```

---

## 🎯 开发优先级建议

### 第一周（20小时）

1. ✅ 搭建项目结构和依赖
2. ✅ 创建通用组件（DataTable, SearchBar, Form）
3. ✅ 实现品牌管理页面
4. ✅ 实现产品列表页

### 第二周（20小时）

5. ✅ 实现产品创建向导
6. ✅ 实现产品详情页
7. ✅ 实现BOM编辑器基础版
8. ✅ 实现数据导入向导

### 第三周（20小时）

9. ✅ 实现溯源码生成页面
10. ✅ 实现溯源历史时间线
11. ✅ 实现扫码验证页面
12. ✅ 实现产品选择器组件

### 第四周（20小时）

13. ✅ 完善所有页面的交互细节
14. ✅ 添加加载状态和错误处理
15. ✅ 性能优化和代码分割
16. ✅ 编写单元测试

---

## 🔗 相关资源

- [Next.js 官方文档](https://nextjs.org/docs)
- [shadcn/ui 组件库](https://ui.shadcn.com/)
- [React Query 文档](https://tanstack.com/query/latest)
- [React Hook Form 文档](https://react-hook-form.com/)
- [Recharts 图表库](https://recharts.org/)

---

**准备好开始前端开发了！需要我帮你实现具体的页面或组件吗？** 🚀
