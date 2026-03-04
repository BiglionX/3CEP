# 高级搜索功能技术文档

## 📋 概述

高级搜索功能为维修店用户提供强大的多条件组合搜索能力，包含智能搜索建议、搜索历史记录、跨实体类型搜索等特性。

## 🏗️ 架构设计

### 核心组件

```
src/
├── types/search.types.ts          # 类型定义
├── services/search.service.ts     # 搜索服务层
├── hooks/use-search.ts           # React Hook
├── components/search/            # 搜索组件
│   ├── SimpleSearch.tsx         # 简化搜索组件
│   └── AdvancedSearch.tsx       # 高级搜索组件
└── app/repair-shop/advanced-search-demo/  # 演示页面
```

### 技术栈

- **TypeScript**: 强类型支持
- **React Hooks**: 状态管理
- **localStorage**: 本地数据存储
- **防抖机制**: 优化搜索性能
- **响应式设计**: 移动端适配

## 🔧 核心功能

### 1. 多条件组合搜索

支持多种搜索条件的组合使用：

```typescript
interface SearchCondition {
  field: SearchField; // 搜索字段
  operator: SearchOperator; // 操作符
  value: string | number | (string | number)[]; // 值
  entityType?: SearchEntityType; // 实体类型
}
```

### 2. 智能搜索建议

- **实时建议**: 输入时动态显示相关建议
- **历史建议**: 基于用户搜索历史
- **热门建议**: 系统推荐的热门搜索词
- **自动完成**: 字段级别的自动补全

### 3. 搜索历史管理

```typescript
interface SearchHistory {
  id: string;
  query: string;
  filters: AdvancedSearchFilters;
  timestamp: string;
  resultCount: number;
  entityType?: SearchEntityType;
}
```

### 4. 跨实体类型搜索

支持以下实体类型的搜索：

- `work_order`: 工单
- `customer`: 客户
- `technician`: 技师
- `device`: 设备
- `part`: 配件
- `all`: 全部类型

## 🚀 使用指南

### 基础使用

```tsx
import { SimpleSearch } from '@/components/search/SimpleSearch';

function MyComponent() {
  const handleSearch = (query: string, filters: AdvancedSearchFilters) => {
    console.log('搜索:', query, filters);
  };

  return (
    <SimpleSearch
      entityType="work_order"
      placeholder="搜索工单..."
      onSearch={handleSearch}
    />
  );
}
```

### 高级使用

```tsx
import { useSearch } from '@/hooks/use-search';

function AdvancedSearchComponent() {
  const { results, isLoading, search, searchHistory, suggestions } =
    useSearch('all');

  const performSearch = async () => {
    await search('iPhone', {
      status: ['completed'],
      priority: ['high'],
    });
  };

  return (
    <div>
      {/* 搜索输入 */}
      {/* 结果展示 */}
      {/* 历史记录 */}
    </div>
  );
}
```

## ⚙️ 配置选项

### 搜索配置

```typescript
interface SearchConfig {
  enableSuggestions: boolean; // 启用建议
  enableHistory: boolean; // 启用历史
  enableFacets: boolean; // 启用分类筛选
  enableAutoComplete: boolean; // 启用自动完成

  debounceDelay: number; // 防抖延迟(ms)
  minSearchLength: number; // 最小搜索长度
  maxHistoryItems: number; // 最大历史记录数
  maxSuggestions: number; // 最大建议数

  defaultEntityType: SearchEntityType; // 默认实体类型
  defaultPageSize: number; // 默认分页大小
}
```

### 组件属性

```typescript
interface SimpleSearchProps {
  entityType?: SearchEntityType;
  placeholder?: string;
  className?: string;
  showHistory?: boolean;
  showSuggestions?: boolean;
  onSearch?: (query: string, filters: AdvancedSearchFilters) => void;
  onResultSelect?: (result: any) => void;
}
```

## 📊 性能优化

### 1. 防抖机制

```typescript
// 防抖搜索，避免频繁API调用
const debouncedSearch = searchService.debouncedSearch(
  performSearch,
  300 // 300ms延迟
);
```

### 2. 本地缓存

- 搜索历史存储在localStorage中
- 建议数据可配置缓存策略
- 支持手动清除缓存

### 3. 分页加载

```typescript
// 支持分页和无限滚动
const { loadMore } = useSearch();
```

## 🔒 安全考虑

### 1. 输入验证

```typescript
// XSS防护
const sanitizeQuery = (query: string): string => {
  return query.replace(/[<>'"&]/g, '');
};
```

### 2. 权限控制

```typescript
// 基于RBAC的搜索权限
const canSearch = usePermission('search_work_orders');
```

## 🧪 测试策略

### 自动化测试

```bash
# 运行搜索功能测试
npm run test:search

# 运行性能测试
npm run test:perf
```

### 测试覆盖点

- ✅ 基础搜索功能
- ✅ 高级搜索条件
- ✅ 搜索历史管理
- ✅ 搜索建议功能
- ✅ 实体类型筛选
- ✅ 性能基准测试
- ✅ 错误处理机制

## 📈 监控指标

### 关键性能指标(KPI)

- **搜索响应时间**: < 500ms
- **建议显示延迟**: < 200ms
- **历史记录准确率**: > 99%
- **搜索成功率**: > 98%

### 用户体验指标

- **搜索转化率**: 搜索到有效结果的比例
- **建议点击率**: 搜索建议的使用频率
- **历史复用率**: 历史搜索的重复使用比例

## 🛠️ 部署配置

### 环境变量

```env
NEXT_PUBLIC_SEARCH_DEBOUNCE_DELAY=300
NEXT_PUBLIC_SEARCH_MIN_LENGTH=2
NEXT_PUBLIC_SEARCH_MAX_HISTORY=20
NEXT_PUBLIC_SEARCH_MAX_SUGGESTIONS=10
```

### API集成

```typescript
// 配置搜索API端点
const SEARCH_API_ENDPOINT = '/api/search';

// 搜索请求格式
interface SearchRequest {
  query: string;
  filters: AdvancedSearchFilters;
  entityType: SearchEntityType;
  pagination: {
    page: number;
    pageSize: number;
  };
}
```

## 🔧 故障排除

### 常见问题

1. **搜索建议不显示**
   - 检查网络连接
   - 验证防抖延迟设置
   - 确认最小输入长度

2. **历史记录为空**
   - 检查localStorage权限
   - 验证历史记录保存逻辑
   - 确认最大历史记录数设置

3. **搜索性能慢**
   - 优化API响应时间
   - 调整防抖延迟
   - 实施结果缓存

### 调试工具

```typescript
// 启用调试模式
localStorage.setItem('debug_search', 'true');

// 查看搜索日志
console.log('搜索服务状态:', searchService.getDebugInfo());
```

## 📚 相关文档

- [API接口文档](./api-search.md)
- [组件使用指南](./components-search.md)
- [性能优化手册](./performance-search.md)
- [安全配置说明](./security-search.md)

---

_文档版本: v1.0_
_最后更新: 2026年2月28日_
