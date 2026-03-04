# DC013 多维分析查询构建器设计文档

## 📋 文档概览

**文档编号**: DC013-DESIGN
**版本**: v1.0
**创建日期**: 2026年2月28日
**作者**: 架构设计团队

## 🎯 设计目标

### 核心目标

1. **多维度数据钻取**: 支持时间、地域、产品等多个维度的自由组合分析
2. **交互式查询构建**: 提供可视化查询构建界面，降低使用门槛
3. **实时分析能力**: 支持实时数据查询和动态分析
4. **灵活的聚合计算**: 支持SUM、AVG、COUNT、MAX、MIN等聚合函数
5. **高性能查询优化**: 基于数据特征自动优化查询执行计划

### 设计原则

- **用户友好**: 直观的拖拽式操作界面
- **可扩展性**: 支持新增维度和指标的灵活扩展
- **性能优先**: 查询优化和缓存机制保障响应速度
- **安全可控**: 基于权限的数据访问控制

## 🏗️ 架构设计

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    前端展示层 (Presentation Layer)           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ 维度选择器      │  │ 指标选择器      │  │ 过滤器      │ │
│  │ (Dimensions)    │  │ (Metrics)       │  │ (Filters)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ 时间轴控制器    │  │ 图表展示区      │  │ 结果表格    │ │
│  │ (Time Control)  │  │ (Charts)        │  │ (Grid)      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    业务逻辑层 (Business Logic)              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ 查询构建器      │  │ 分析引擎        │  │ 缓存管理    │ │
│  │ (QueryBuilder)  │  │ (AnalysisEngine)│  │ (CacheMgr)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ 权限控制器      │  │ 导出服务        │                  │
│  │ (PermissionCtrl)│  │ (ExportService) │                  │
│  └─────────────────┘  └─────────────────┘                  │
├─────────────────────────────────────────────────────────────┤
│                    数据访问层 (Data Access Layer)           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Trino查询引擎   │  │ 数据源适配器    │  │ 元数据服务  │ │
│  │ (Trino Engine)  │  │ (DataSourceAdpt)│  │ (Metadata)  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 核心组件设计

#### 1. 查询构建器 (QueryBuilder)

```typescript
// 维度定义
export interface Dimension {
  id: string;
  name: string;
  type: 'time' | 'geographic' | 'categorical' | 'hierarchical';
  dataType: 'string' | 'number' | 'date' | 'datetime';
  table: string;
  column: string;
  hierarchy?: string[]; // 层级关系
  format?: string; // 显示格式
}

// 指标定义
export interface Metric {
  id: string;
  name: string;
  type: 'aggregation' | 'calculation' | 'derived';
  aggregation: 'sum' | 'avg' | 'count' | 'max' | 'min' | 'distinct';
  table: string;
  column: string;
  formula?: string; // 计算公式
  format?: string;
}

// 过滤条件
export interface FilterCondition {
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'in' | 'between' | 'like';
  value: any;
  valueType: 'static' | 'dynamic' | 'parameter';
}

// 查询配置
export interface QueryConfig {
  dimensions: Dimension[];
  metrics: Metric[];
  filters: FilterCondition[];
  sortBy?: { field: string; order: 'asc' | 'desc' }[];
  limit?: number;
  timeRange?: {
    start: string;
    end: string;
    granularity: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
  };
}
```

#### 2. 分析引擎 (AnalysisEngine)

```typescript
export class MultidimensionalAnalysisEngine {
  private queryBuilder: QueryBuilder;
  private dataSourceManager: DataSourceManager;
  private cacheService: CacheService;
  private permissionService: PermissionService;

  /**
   * 执行多维分析查询
   */
  async executeAnalysis(
    config: QueryConfig,
    userId: string,
    options?: AnalysisOptions
  ): Promise<AnalysisResult> {
    // 1. 权限验证
    await this.validatePermissions(config, userId);

    // 2. 查询优化
    const optimizedQuery = this.optimizeQuery(config);

    // 3. 缓存检查
    const cacheKey = this.generateCacheKey(optimizedQuery);
    const cachedResult = await this.cacheService.get(cacheKey);
    if (cachedResult && !options?.forceRefresh) {
      return cachedResult;
    }

    // 4. 执行查询
    const rawResult = await this.dataSourceManager.executeQuery(optimizedQuery);

    // 5. 结果处理和格式化
    const processedResult = this.processResult(rawResult, config);

    // 6. 缓存结果
    await this.cacheService.set(
      cacheKey,
      processedResult,
      options?.cacheTTL || 300
    );

    return processedResult;
  }

  /**
   * 生成OLAP立方体
   */
  async generateOLAPCube(
    config: QueryConfig,
    dimensions: string[],
    userId: string
  ): Promise<OLAPCube> {
    // 实现OLAP立方体生成逻辑
  }
}
```

#### 3. OLAP立方体结构

```typescript
export interface OLAPCube {
  dimensions: CubeDimension[];
  measures: CubeMeasure[];
  cells: CubeCell[];
  metadata: {
    created: string;
    dataSource: string;
    recordCount: number;
  };
}

export interface CubeDimension {
  name: string;
  values: any[];
  hierarchy?: string[];
}

export interface CubeMeasure {
  name: string;
  values: number[];
  aggregation: string;
}

export interface CubeCell {
  coordinates: Record<string, any>;
  measures: Record<string, number>;
}
```

## 📊 数据模型设计

### 支持的维度类型

#### 1. 时间维度

```sql
-- 时间维度表结构
CREATE TABLE time_dimensions (
  date_key DATE PRIMARY KEY,
  year INTEGER,
  quarter INTEGER,
  month INTEGER,
  week INTEGER,
  day_of_month INTEGER,
  day_of_week INTEGER,
  is_weekend BOOLEAN,
  fiscal_year INTEGER,
  fiscal_quarter INTEGER
);
```

#### 2. 地域维度

```sql
-- 地域维度表结构
CREATE TABLE geographic_dimensions (
  geo_key VARCHAR(50) PRIMARY KEY,
  country VARCHAR(100),
  region VARCHAR(100),
  city VARCHAR(100),
  postal_code VARCHAR(20),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8)
);
```

#### 3. 产品维度

```sql
-- 产品维度表结构
CREATE TABLE product_dimensions (
  product_key VARCHAR(50) PRIMARY KEY,
  category VARCHAR(100),
  subcategory VARCHAR(100),
  brand VARCHAR(100),
  model VARCHAR(100),
  sku VARCHAR(50)
);
```

## 🔧 接口规范设计

### RESTful API 设计

#### 1. 获取可用维度和指标

```http
GET /api/data-center/multidim/dimensions
GET /api/data-center/multidim/metrics
```

**响应示例**:

```json
{
  "dimensions": [
    {
      "id": "time_dimension",
      "name": "时间维度",
      "type": "time",
      "levels": ["year", "quarter", "month", "day"]
    },
    {
      "id": "geographic_dimension",
      "name": "地理维度",
      "type": "geographic",
      "levels": ["country", "region", "city"]
    }
  ],
  "metrics": [
    {
      "id": "sales_amount",
      "name": "销售额",
      "type": "aggregation",
      "aggregation": "sum"
    }
  ]
}
```

#### 2. 执行多维分析查询

```http
POST /api/data-center/multidim/analyze
Content-Type: application/json

{
  "dimensions": ["time_dimension.year", "geographic_dimension.country"],
  "metrics": ["sales_amount", "order_count"],
  "filters": [
    {
      "field": "time_dimension.date",
      "operator": "between",
      "value": ["2024-01-01", "2024-12-31"]
    }
  ],
  "sortBy": [
    {"field": "sales_amount", "order": "desc"}
  ],
  "limit": 1000
}
```

#### 3. 生成OLAP立方体

```http
POST /api/data-center/multidim/cube
Content-Type: application/json

{
  "dimensions": ["product_category", "time_month", "region"],
  "measures": ["sales_amount", "quantity_sold"],
  "filters": [...]
}
```

### WebSocket 实时分析接口

```typescript
// 实时数据订阅
interface RealTimeAnalysisSubscription {
  dimensions: string[];
  metrics: string[];
  filters: FilterCondition[];
  refreshInterval: number; // 毫秒
}

// 实时数据推送
interface RealTimeAnalysisData {
  timestamp: string;
  data: any[];
  delta: any[]; // 变化数据
}
```

## 🔒 安全设计

### 权限控制

```typescript
// 维度级权限控制
export interface DimensionPermission {
  dimensionId: string;
  allowedValues: string[]; // 允许访问的维度值
  accessLevel: 'read' | 'drill_down' | 'full_access';
}

// 行级数据过滤
export interface RowLevelSecurity {
  userId: string;
  filters: FilterCondition[];
  appliesToTables: string[];
}
```

### 数据脱敏

```typescript
// 敏感数据处理
export interface DataMaskingRule {
  column: string;
  maskType: 'partial_hide' | 'full_hide' | 'hash' | 'round';
  threshold?: number; // 数值脱敏阈值
}
```

## 📈 性能优化策略

### 1. 查询优化

```typescript
// 查询计划优化
interface QueryOptimizationStrategy {
  pushDownFilters: boolean; // 谓词下推
  columnPruning: boolean; // 列裁剪
  partitionPruning: boolean; // 分区裁剪
  joinReordering: boolean; // 连接重排序
  materializedViews: string[]; // 物化视图使用
}
```

### 2. 缓存策略

```typescript
// 多级缓存设计
export interface CacheStrategy {
  l1Cache: {
    // 内存缓存
    ttl: number;
    maxSize: number;
    evictionPolicy: 'lru' | 'lfu';
  };
  l2Cache: {
    // Redis缓存
    ttl: number;
    compression: boolean;
  };
  queryResultCache: {
    // 查询结果缓存
    enabled: boolean;
    ttl: number;
    keyGenerationStrategy: 'hash' | 'semantic';
  };
}
```

## 🧪 测试策略

### 单元测试覆盖

```typescript
describe('MultidimensionalAnalysisEngine', () => {
  describe('Query Building', () => {
    it('should build correct SQL from dimension/metric configuration', () => {
      // 测试查询构建逻辑
    });

    it('should apply proper filtering conditions', () => {
      // 测试过滤条件应用
    });
  });

  describe('Performance', () => {
    it('should optimize query execution plan', () => {
      // 测试查询优化
    });

    it('should utilize caching effectively', () => {
      // 测试缓存机制
    });
  });
});
```

### 集成测试场景

```typescript
describe('Multidimensional Analysis Integration', () => {
  it('should handle complex multi-dimensional queries', async () => {
    // 复杂多维查询测试
  });

  it('should support real-time data analysis', async () => {
    // 实时分析测试
  });

  it('should enforce proper access controls', async () => {
    // 权限控制测试
  });
});
```

## 📚 相关文档

- [`specification.md`](./specification.md) - 数据中心模块规范
- [`bi-engine-specification.md`](./bi-engine-specification.md) - BI引擎规范
- [`data-standards-specification.md`](./data-standards-specification.md) - 数据标准规范

---

_文档版本: v1.0_
_最后更新: 2026年2月28日_
_维护人员: 架构设计团队_
