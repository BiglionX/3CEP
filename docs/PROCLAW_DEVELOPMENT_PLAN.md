# 📅 Proclaw 开发计划详细任务清单

> 基于 [PROCLAW_TECHNICAL_PLAN.md](./PROCLAW_TECHNICAL_PLAN.md) 的详细执行计划
> 采用敏捷开发模式，2周一个 Sprint

---

## 🎯 Phase 0: 技术验证原型 (4周)

**Sprint 0.1-0.2**: Week 1-2
**Sprint 0.3-0.4**: Week 3-4

### Sprint 0.1: Tauri 环境搭建 (Week 1)

#### Task 0.1.1: Rust 工具链安装

- **负责人**: Tech Lead
- **工时**: 0.5 天
- **验收标准**:
  - [ ] Rust 1.75+ 安装成功
  - [ ] `rustc --version` 输出版本号
  - [ ] `cargo --version` 输出版本号
  - [ ] 配置国内镜像源 (加速下载)

```bash
# Windows PowerShell
winget install Rustlang.Rust.MSVC

# 验证安装
rustc --version
cargo --version

# 配置国内镜像
cargo config set registry.crates-io.protocol sparse
```

#### Task 0.1.2: 创建 Tauri 项目骨架

- **负责人**: Frontend Dev 1
- **工时**: 1 天
- **验收标准**:
  - [ ] 使用 `create-tauri-app` 初始化项目
  - [ ] 选择 React + TypeScript + Vite 模板
  - [ ] 项目能成功运行 `npm run tauri dev`
  - [ ] 显示空白窗口

```bash
npm create tauri-app@latest proclaw-desktop
cd proclaw-desktop
npm install
npm run tauri dev
```

**项目结构**:

```
proclaw-desktop/
├── src-tauri/              # Rust 后端
│   ├── Cargo.toml
│   ├── src/
│   │   └── main.rs
│   └── tauri.conf.json
├── src/                    # React 前端
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── package.json
├── vite.config.ts
└── tsconfig.json
```

#### Task 0.1.3: 集成 MUI 和 Tailwind

- **负责人**: Frontend Dev 1
- **工时**: 1 天
- **验收标准**:
  - [ ] MUI 组件可正常渲染
  - [ ] Tailwind CSS 类生效
  - [ ] 主题配置完成 (主色调、字体)

```bash
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**配置文件**:

```typescript
// src/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Microsoft YaHei", "Helvetica Neue", Arial, sans-serif',
  },
});
```

#### Task 0.1.4: 实现基础布局框架

- **负责人**: Frontend Dev 1
- **工时**: 1.5 天
- **验收标准**:
  - [ ] 侧边栏导航组件
  - [ ] 顶部工具栏
  - [ ] 主内容区域
  - [ ] 响应式布局 (窗口调整时正常)

**组件结构**:

```typescript
// src/components/Layout/AppLayout.tsx
import { Box, Drawer, AppBar, Toolbar } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <TopBar />
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" anchor="left">
        <Sidebar />
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
}
```

#### Task 0.1.5: 配置路由系统

- **负责人**: Frontend Dev 2
- **工时**: 1 天
- **验收标准**:
  - [ ] React Router v6 集成
  - [ ] 定义 4 个基础路由
  - [ ] 路由切换无刷新

```bash
npm install react-router-dom
```

```typescript
// src/routes/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import Dashboard from '../pages/Dashboard';
import ProductLibrary from '../pages/ProductLibrary';
import Inventory from '../pages/Inventory';
import Settings from '../pages/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'products', element: <ProductLibrary /> },
      { path: 'inventory', element: <Inventory /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
]);
```

**交付物检查清单**:

- [ ] 项目可成功构建 (`npm run tauri build`)
- [ ] 开发模式热更新正常
- [ ] 代码提交到 GitHub
- [ ] 编写 Week 1 总结文档

---

### Sprint 0.2: Supabase 集成 (Week 2)

#### Task 0.2.1: Supabase 项目配置

- **负责人**: Backend Dev
- **工时**: 0.5 天
- **验收标准**:
  - [ ] 创建 Supabase 项目
  - [ ] 获取 API Key 和 URL
  - [ ] 配置环境变量

```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Task 0.2.2: 集成 Supabase Client

- **负责人**: Frontend Dev 2
- **工时**: 1 天
- **验收标准**:
  - [ ] 安装 `@supabase/supabase-js`
  - [ ] 创建 client 实例
  - [ ] 测试数据库连接

```bash
npm install @supabase/supabase-js
```

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

#### Task 0.2.3: 实现用户认证

- **负责人**: Frontend Dev 2
- **工时**: 2 天
- **验收标准**:
  - [ ] 邮箱密码登录
  - [ ] OAuth 登录 (GitHub/Google)
  - [ ] 登出功能
  - [ ] 登录状态持久化

```typescript
// src/auth/useAuth.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取当前会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, signIn, signOut };
}
```

#### Task 0.2.4: 测试 Realtime 订阅

- **负责人**: Backend Dev
- **工时**: 1 天
- **验收标准**:
  - [ ] 订阅产品表变更
  - [ ] 实时接收 INSERT/UPDATE/DELETE 事件
  - [ ] UI 自动更新

```typescript
// 测试脚本
const subscription = supabase
  .channel('test-products')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'products',
    },
    payload => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();

// 在 Supabase Dashboard 手动插入数据，观察控制台输出
```

#### Task 0.2.5: 配置 RLS 策略

- **负责人**: Backend Dev
- **工时**: 1.5 天
- **验收标准**:
  - [ ] 创建测试用户
  - [ ] 验证租户隔离
  - [ ] 验证权限控制

```sql
-- SQL 编辑器中执行

-- 启用 RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can view their own tenant's products"
ON public.products
FOR SELECT
TO authenticated
USING (tenant_id = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Only admins can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
  auth.jwt() ->> 'role' = 'admin'
);
```

**交付物检查清单**:

- [ ] 登录页面可用
- [ ] 用户可以成功登录/登出
- [ ] Realtime 订阅工作正常
- [ ] RLS 策略通过测试
- [ ] 编写 Week 2 总结文档

---

### Sprint 0.3: 本地数据库 (Week 3)

#### Task 0.3.1: 集成 SQLite

- **负责人**: Tech Lead
- **工时**: 1 天
- **验收标准**:
  - [ ] 安装 `tauri-plugin-sql`
  - [ ] 配置 Tauri 插件
  - [ ] 测试数据库连接

```bash
# 在 src-tauri 目录
cargo add tauri-plugin-sql --features sqlite
```

```json
// src-tauri/tauri.conf.json
{
  "plugins": {
    "sql": {
      "preload": ["sqlite:proclaw.db"]
    }
  }
}
```

#### Task 0.3.2: 集成 Drizzle ORM

- **负责人**: Tech Lead
- **工时**: 1.5 天
- **验收标准**:
  - [ ] 安装 Drizzle ORM
  - [ ] 配置 Schema
  - [ ] 生成迁移文件

```bash
npm install drizzle-orm better-sqlite3
npm install -D drizzle-kit @types/better-sqlite3
```

```typescript
// src/db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  skuCode: text('sku_code').notNull().unique(),
  name: text('name').notNull(),
  brandId: text('brand_id'),
  price: integer('price'),
  createdAt: integer('created_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});
```

#### Task 0.3.3: 实现 CRUD 操作

- **负责人**: Frontend Dev 1
- **工时**: 2 天
- **验收标准**:
  - [ ] 创建产品
  - [ ] 查询产品列表
  - [ ] 更新产品信息
  - [ ] 删除产品

```typescript
// src/db/repository.ts
import { db } from './index';
import { products } from './schema';
import { eq } from 'drizzle-orm';

export class ProductRepository {
  async create(product: Omit<typeof products.$inferInsert, 'id'>) {
    const id = crypto.randomUUID();
    await db.insert(products).values({
      ...product,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return id;
  }

  async findAll() {
    return await db.select().from(products);
  }

  async findById(id: string) {
    const result = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .get();
    return result;
  }

  async update(id: string, data: Partial<typeof products.$inferInsert>) {
    await db
      .update(products)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));
  }

  async delete(id: string) {
    await db.delete(products).where(eq(products.id, id));
  }
}
```

#### Task 0.3.4: 数据库加密 (SQLCipher)

- **负责人**: Tech Lead
- **工时**: 1.5 天
- **验收标准**:
  - [ ] 编译支持 SQLCipher 的 SQLite
  - [ ] 设置加密密钥
  - [ ] 验证数据加密

```rust
// src-tauri/src/main.rs
use tauri_plugin_sql::{Migration, MigrationKind};

fn main() {
    let migrations = vec![Migration {
        version: 1,
        description: "Create initial tables",
        sql: "
            PRAGMA key = 'your-encryption-key';
            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                sku_code TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL
            );
        ",
        kind: MigrationKind::Up,
    }];

    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**交付物检查清单**:

- [ ] 本地数据库可正常读写
- [ ] 数据加密生效
- [ ] 性能测试通过 (1000条记录查询 < 100ms)
- [ ] 编写 Week 3 总结文档

---

### Sprint 0.4: 数据同步 (Week 4)

#### Task 0.4.1: 实现离线队列

- **负责人**: Frontend Dev 2
- **工时**: 2 天
- **验收标准**:
  - [ ] 操作入队
  - [ ] 操作出队
  - [ ] 重试机制
  - [ ] 队列持久化

```typescript
// src/sync/OfflineQueue.ts
import { db } from '../db';
import { operations } from '../db/schema';

export interface QueuedOperation {
  id: string;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

export class OfflineQueue {
  async enqueue(op: Omit<QueuedOperation, 'id' | 'retryCount'>) {
    await db.insert(operations).values({
      ...op,
      id: crypto.randomUUID(),
      retryCount: 0,
    });
  }

  async dequeueAll(): Promise<QueuedOperation[]> {
    return await db.select().from(operations).orderBy(operations.timestamp);
  }

  async markComplete(id: string) {
    await db.delete(operations).where(eq(operations.id, id));
  }

  async incrementRetry(id: string) {
    await db
      .update(operations)
      .set({ retryCount: operations.retryCount + 1 })
      .where(eq(operations.id, id));
  }
}
```

#### Task 0.4.2: 实现增量同步

- **负责人**: Backend Dev
- **工时**: 2 天
- **验收标准**:
  - [ ] 检测网络状态
  - [ ] 批量上传离线操作
  - [ ] 下载远程变更
  - [ ] 合并到本地数据库

```typescript
// src/sync/SyncEngine.ts
import { supabase } from '../lib/supabase';
import { OfflineQueue } from './OfflineQueue';
import { ProductRepository } from '../db/repository';

export class SyncEngine {
  private queue = new OfflineQueue();
  private productRepo = new ProductRepository();

  async sync() {
    if (!navigator.onLine) {
      console.log('Offline, skipping sync');
      return;
    }

    // 1. 上传本地变更
    await this.uploadChanges();

    // 2. 下载远程变更
    await this.downloadChanges();
  }

  private async uploadChanges() {
    const operations = await this.queue.dequeueAll();

    for (const op of operations) {
      try {
        if (op.operation === 'CREATE') {
          await supabase.from(op.entity).insert(op.data);
        } else if (op.operation === 'UPDATE') {
          await supabase.from(op.entity).update(op.data).eq('id', op.data.id);
        } else if (op.operation === 'DELETE') {
          await supabase.from(op.entity).delete().eq('id', op.data.id);
        }

        await this.queue.markComplete(op.id);
      } catch (error) {
        console.error('Sync failed for operation', op.id, error);
        await this.queue.incrementRetry(op.id);
      }
    }
  }

  private async downloadChanges() {
    // 获取上次同步时间
    const lastSyncTime = await this.getLastSyncTime();

    // 查询远程变更
    const { data } = await supabase
      .from('products')
      .select()
      .gt('updatedAt', lastSyncTime);

    // 更新本地数据库
    if (data) {
      for (const product of data) {
        await this.productRepo.upsert(product);
      }
    }

    // 更新同步时间
    await this.setLastSyncTime(new Date());
  }
}
```

#### Task 0.4.3: 实现冲突解决

- **负责人**: Tech Lead
- **工时**: 2 天
- **验收标准**:
  - [ ] 检测冲突
  - [ ] 自动解决简单冲突
  - [ ] 手动解决复杂冲突 UI
  - [ ] 冲突日志记录

```typescript
// src/sync/ConflictResolver.ts
export class ConflictResolver {
  async resolve(
    localRecord: any,
    remoteRecord: any
  ): Promise<'local' | 'remote' | 'merge'> {
    // 策略 1: 时间戳比较
    if (localRecord.updatedAt > remoteRecord.updatedAt) {
      return 'local';
    }

    // 策略 2: 关键字段冲突检测
    const criticalFields = ['price', 'stock'];
    const hasCriticalConflict = criticalFields.some(field => {
      const localValue = localRecord[field];
      const remoteValue = remoteRecord[field];
      return Math.abs(localValue - remoteValue) / remoteValue > 0.1;
    });

    if (hasCriticalConflict) {
      // 弹出 UI 让用户选择
      return await this.showConflictDialog(localRecord, remoteRecord);
    }

    return 'remote';
  }

  private async showConflictDialog(
    local: any,
    remote: any
  ): Promise<'local' | 'remote' | 'merge'> {
    // 返回 Promise，等待用户选择
    return new Promise(resolve => {
      // 显示对话框...
      // 用户点击后 resolve('local' | 'remote' | 'merge')
    });
  }
}
```

#### Task 0.4.4: 性能基准测试

- **负责人**: QA Engineer
- **工时**: 1 天
- **验收标准**:
  - [ ] 测试 1000 条记录同步耗时
  - [ ] 测试内存占用
  - [ ] 测试 CPU 使用率
  - [ ] 生成性能报告

**测试脚本**:

```typescript
// tests/performance/sync-benchmark.ts
import { bench, describe } from 'vitest';

describe('Sync Performance', () => {
  bench(
    'Sync 1000 products',
    async () => {
      const products = generateTestData(1000);
      const startTime = performance.now();

      await syncEngine.syncProducts(products);

      const endTime = performance.now();
      console.log(`Sync time: ${endTime - startTime}ms`);
    },
    {
      iterations: 10,
    }
  );
});
```

**交付物检查清单**:

- [ ] 离线操作正常排队
- [ ] 在线时自动同步
- [ ] 冲突解决流程完整
- [ ] 性能指标达标
- [ ] 编写 Phase 0 总结报告

---

## 🎯 Phase 1: MVP 核心功能 (8周)

### Sprint 1.1-1.2: 经营智能体主界面 (Week 5-6)

#### Task 1.1.1: Dashboard 设计

- **负责人**: UI/UX Designer
- **工时**: 2 天
- **验收标准**:
  - [ ] Figma 设计稿完成
  - [ ] 包含关键指标卡片
  - [ ] 包含最近活动列表
  - [ ] 包含快捷操作按钮

**设计要点**:

- 顶部: 今日概览 (销售额、订单数、库存预警)
- 中部: 图表 (销售趋势、库存周转)
- 底部: 待办事项、快捷入口

#### Task 1.1.2: Dashboard 实现

- **负责人**: Frontend Dev 1
- **工时**: 3 天
- **验收标准**:
  - [ ] 响应式布局
  - [ ] 数据从 API 获取
  - [ ] 加载状态处理
  - [ ] 错误状态处理

```typescript
// src/pages/Dashboard.tsx
import { Grid, Card, CardContent, Typography } from '@mui/material';
import StatsCard from '../components/Dashboard/StatsCard';
import RecentActivity from '../components/Dashboard/RecentActivity';
import QuickActions from '../components/Dashboard/QuickActions';

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) return <LoadingSkeleton />;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <StatsCard title="今日销售额" value={stats.todaySales} />
      </Grid>
      <Grid item xs={12} md={3}>
        <StatsCard title="订单数" value={stats.orderCount} />
      </Grid>
      <Grid item xs={12} md={3}>
        <StatsCard title="库存预警" value={stats.lowStockCount} color="warning" />
      </Grid>
      <Grid item xs={12} md={3}>
        <StatsCard title="待处理工单" value={stats.pendingTickets} />
      </Grid>

      <Grid item xs={12} md={8}>
        <RecentActivity activities={stats.recentActivities} />
      </Grid>
      <Grid item xs={12} md={4}>
        <QuickActions />
      </Grid>
    </Grid>
  );
}
```

#### Task 1.1.3: 侧边栏导航优化

- **负责人**: Frontend Dev 2
- **工时**: 2 天
- **验收标准**:
  - [ ] 图标 + 文字
  - [ ] 激活状态高亮
  - [ ] 折叠/展开动画
  - [ ] 键盘快捷键支持

#### Task 1.1.4: 主题系统

- **负责人**: Frontend Dev 1
- **工时**: 1 天
- **验收标准**:
  - [ ] 亮色/暗色主题切换
  - [ ] 自定义主色调
  - [ ] 主题持久化

---

### Sprint 1.3-1.4: 产品库模块迁移 (Week 7-8)

#### Task 1.3.1: 共享领域层代码

- **负责人**: Tech Lead
- **工时**: 2 天
- **验收标准**:
  - [ ] 创建 `@proclaw/shared` monorepo 包
  - [ ] 迁移 Product、Brand 实体
  - [ ] 迁移 UseCase 接口
  - [ ] 配置 TypeScript 路径别名

**Monorepo 结构**:

```
proclaw-monorepo/
├── packages/
│   ├── shared/           # 共享代码
│   │   ├── domain/
│   │   ├── application/
│   │   └── package.json
│   ├── desktop/          # Tauri 桌面端
│   └── web/              # Next.js Web 端
├── package.json          # Workspace 配置
└── pnpm-workspace.yaml
```

#### Task 1.3.2: 产品搜索页面

- **负责人**: Frontend Dev 1
- **工时**: 3 天
- **验收标准**:
  - [ ] 搜索框 (支持 SKU、名称)
  - [ ] 筛选器 (品牌、类目)
  - [ ] 产品列表 (虚拟滚动)
  - [ ] 分页或无限滚动

```typescript
// src/pages/ProductLibrary.tsx
import { useState } from 'react';
import { TextField, Grid, Pagination } from '@mui/material';
import ProductCard from '../components/ProductLibrary/ProductCard';
import { useQuery } from '@tanstack/react-query';

export default function ProductLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', searchTerm, page],
    queryFn: () => fetchProducts({ search: searchTerm, page }),
  });

  return (
    <div>
      <TextField
        fullWidth
        placeholder="搜索产品 SKU 或名称..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {products?.items.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>

      <Pagination
        count={products?.totalPages}
        page={page}
        onChange={(_, value) => setPage(value)}
      />
    </div>
  );
}
```

#### Task 1.3.3: BOM 可视化

- **负责人**: Frontend Dev 2
- **工时**: 3 天
- **验收标准**:
  - [ ] 树形结构展示
  - [ ] 展开/折叠
  - [ ] 关系类型标签
  - [ ] 数量显示

#### Task 1.3.4: 产品详情页面

- **负责人**: Frontend Dev 1
- **工时**: 2 天
- **验收标准**:
  - [ ] 基本信息展示
  - [ ] 规格参数表格
  - [ ] BOM 关系图
  - [ ] 编辑功能

---

### Sprint 1.5-1.6: 进销存模块迁移 (Week 9-10)

#### Task 1.5.1: 库存列表

- **负责人**: Frontend Dev 2
- **工时**: 2 天
- **验收标准**:
  - [ ] 表格展示 (DataGrid)
  - [ ] 排序、筛选
  - [ ] 库存预警高亮
  - [ ] 导出 Excel

#### Task 1.5.2: 入库/出库操作

- **负责人**: Frontend Dev 1
- **工时**: 3 天
- **验收标准**:
  - [ ] 入库表单
  - [ ] 出库表单
  - [ ] 扫码枪支持
  - [ ] 批次管理

#### Task 1.5.3: 库存预警通知

- **负责人**: Frontend Dev 2
- **工时**: 2 天
- **验收标准**:
  - [ ] 系统托盘通知
  - [ ] 声音提醒
  - [ ] 通知中心
  - [ ] 阈值配置

```typescript
// 使用 Tauri 通知插件
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification';

async function notifyLowStock(productName: string, currentStock: number) {
  let permissionGranted = await isPermissionGranted();

  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === 'granted';
  }

  if (permissionGranted) {
    sendNotification({
      title: '库存预警',
      body: `${productName} 库存不足，当前库存: ${currentStock}`,
    });
  }
}
```

#### Task 1.5.4: 简单报表

- **负责人**: Frontend Dev 1
- **工时**: 3 天
- **验收标准**:
  - [ ] 库存周转率图表
  - [ ] 出入库统计
  - [ ] 日期范围选择
  - [ ] 导出 PDF

---

### Sprint 1.7-1.8: 系统集成测试 (Week 11-12)

#### Task 1.7.1: E2E 测试

- **负责人**: QA Engineer
- **工时**: 3 天
- **验收标准**:
  - [ ] 登录流程测试
  - [ ] 产品搜索测试
  - [ ] 入库操作测试
  - [ ] 数据同步测试

```typescript
// tests/e2e/product-search.spec.ts
import { test, expect } from '@playwright/test';

test('should search products', async ({ page }) => {
  await page.goto('/');

  // 登录
  await page.fill('[data-testid=email]', 'test@example.com');
  await page.fill('[data-testid=password]', 'password');
  await page.click('[data-testid=login-button]');

  // 导航到产品库
  await page.click('[data-testid=nav-products]');

  // 搜索
  await page.fill('[data-testid=search-input]', 'MacBook');
  await page.waitForSelector('[data-testid=product-card]');

  // 验证结果
  const cards = await page.locator('[data-testid=product-card]').count();
  expect(cards).toBeGreaterThan(0);
});
```

#### Task 1.7.2: 性能优化

- **负责人**: Tech Lead
- **工时**: 2 天
- **验收标准**:
  - [ ] 启动时间 < 3秒
  - [ ] 内存占用 < 200MB
  - [ ] 列表滚动流畅 (60fps)
  - [ ] 图片懒加载

#### Task 1.7.3: 兼容性测试

- **负责人**: QA Engineer
- **工时**: 2 天
- **验收标准**:
  - [ ] Windows 10/11 测试
  - [ ] macOS 测试
  - [ ] Linux 测试 (可选)
  - [ ] 不同分辨率测试

#### Task 1.7.4: Bug 修复

- **负责人**: All Developers
- **工时**: 3 天
- **验收标准**:
  - [ ] P0 Bug 全部修复
  - [ ] P1 Bug 修复率 > 90%
  - [ ] 回归测试通过

**MVP 发布检查清单**:

- [ ] 所有 P0/P1 任务完成
- [ ] 通过 QA 测试
- [ ] 安装包大小 < 15MB
- [ ] 用户手册编写完成
- [ ] 发布说明编写完成
- [ ] GitHub Release 创建

---

## 📊 进度跟踪

### 燃尽图 (Burndown Chart)

```
Week 1: ████████████████████ 100% (Sprint 0.1 完成)
Week 2: ███████████████████░ 95%  (Sprint 0.2 进行中)
Week 3: ░░░░░░░░░░░░░░░░░░░░ 0%   (未开始)
Week 4: ░░░░░░░░░░░░░░░░░░░░ 0%   (未开始)
...
```

### 风险登记册

| 风险 ID | 描述                 | 概率 | 影响 | 缓解措施               | 状态      |
| ------- | -------------------- | ---- | ---- | ---------------------- | --------- |
| R001    | Rust 学习曲线陡峭    | 高   | 中   | 安排培训、外部顾问     | 🟡 监控中 |
| R002    | Tauri 插件不满足需求 | 中   | 高   | 准备 Electron 备选方案 | 🟢 已缓解 |
| R003    | Supabase 成本超支    | 中   | 中   | 实施缓存、监控用量     | 🟢 已缓解 |

---

## 🔄 敏捷仪式

### 每日站会 (Daily Standup)

- **时间**: 每天上午 10:00
- **时长**: 15 分钟
- **内容**:
  1. 昨天完成了什么？
  2. 今天计划做什么？
  3. 遇到什么阻碍？

### Sprint 评审 (Sprint Review)

- **时间**: 每两周周五下午
- **时长**: 1 小时
- **内容**:
  1. 演示完成的功能
  2. 收集反馈
  3. 调整优先级

### Sprint 回顾 (Sprint Retrospective)

- **时间**: Sprint Review 之后
- **时长**: 45 分钟
- **内容**:
  1. 做得好的地方
  2. 需要改进的地方
  3. 行动计划

---

**📝 文档维护**: 每次 Sprint 结束后更新此文档
**👥 项目负责人**: Tech Lead
**📅 最后更新**: 2026-04-11
