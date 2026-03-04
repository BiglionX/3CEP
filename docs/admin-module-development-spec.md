# 管理模块开发规范

## 📋 开发标准

### 1. 文件结构规范

```
src/app/admin/[module-name]/
├── page.tsx                 # 主页面组件
├── loading.tsx             # 加载状态组件（可选）
├── error.tsx               # 错误处理组件（可选）
└── components/             # 模块专用组件（如需要）
    └── [component-name].tsx
```

### 2. 技术栈要求

- **框架**: Next.js 13+ App Router
- **语言**: TypeScript
- **状态管理**: React Hooks (useState, useEffect)
- **UI组件**: 项目内置UI组件库 (`@/components/ui/*`)
- **权限控制**: `useRbacPermission` Hook
- **图标**: Lucide React

### 3. 权限命名规范

```
[module].[action]
例如:
- users.view     # 查看用户
- users.manage   # 管理用户
- users.delete   # 删除用户
- devices.create # 创建设备
```

### 4. 接口设计规范

#### 4.1 RESTful API 路径

```
GET    /api/admin/[module]           # 获取列表
GET    /api/admin/[module]/:id       # 获取详情
POST   /api/admin/[module]           # 创建
PUT    /api/admin/[module]/:id       # 更新
DELETE /api/admin/[module]/:id       # 删除
```

#### 4.2 响应格式

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}
```

### 5. 组件结构规范

#### 5.1 主要组件构成

```typescript
export default function ModuleManagement() {
  // 1. 状态管理
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});

  // 2. 权限检查
  const { hasPermission } = useRbacPermission();
  const canView = hasPermission('[module].view');
  const canManage = hasPermission('[module].manage');

  // 3. 数据获取函数
  const fetchData = async () => {};

  // 4. 操作函数
  const handleCreate = () => {};
  const handleEdit = (item: Item) => {};
  const handleDelete = (item: Item) => {};

  // 5. 生命周期
  useEffect(() => {}, []);

  // 6. 权限检查渲染
  if (!canView) {
    return <PermissionDenied />;
  }

  // 7. 主要UI渲染
  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      {/* 筛选面板 */}
      {/* 统计卡片 */}
      {/* 数据表格 */}
      {/* 对话框 */}
    </div>
  );
}
```

### 6. UI组件使用规范

#### 6.1 必须使用的组件

```typescript
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
```

#### 6.2 图标使用

```typescript
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Download,
  Search,
} from 'lucide-react';
```

### 7. 数据模型规范

#### 7.1 基础字段

```typescript
interface BaseItem {
  id: string;
  created_at: string;
  updated_at: string;
  status?: string;
}
```

#### 7.2 时间格式

- 存储: ISO 8601 格式 (`2024-01-20T10:30:00Z`)
- 显示: `new Date(date).toLocaleString()`

### 8. 错误处理规范

```typescript
try {
  setLoading(true);
  // API调用
} catch (error) {
  console.error('操作失败:', error);
  // 显示错误提示
} finally {
  setLoading(false);
}
```

### 9. 性能优化要求

- 数据分页加载
- 虚拟滚动（大数据量时）
- 防抖搜索
- Loading状态管理

### 10. 测试要求

- 单元测试覆盖率 ≥ 80%
- 集成测试覆盖核心功能
- 权限测试验证
- 边界条件测试

## 🚫 冲突避免机制

### 1. 路由冲突检测

```bash
# 检查现有路由
find src/app/admin -name "page.tsx" -exec dirname {} \;
```

### 2. 权限标识冲突

- 每个模块使用唯一前缀
- 避免通用权限名（如 `read`, `write`）

### 3. 组件命名冲突

- 模块组件使用 `[ModuleName]Management` 命名
- 避免使用通用组件名

## ✅ 质量检查清单

- [ ] 符合文件结构规范
- [ ] 正确使用权限控制
- [ ] 数据接口格式正确
- [ ] UI组件使用规范
- [ ] 错误处理完整
- [ ] 无控制台错误
- [ ] 响应式设计适配
- [ ] 代码注释完整
- [ ] TypeScript类型正确
- [ ] 通过ESLint检查

---

**版本**: 1.0
**最后更新**: 2026-02-28
