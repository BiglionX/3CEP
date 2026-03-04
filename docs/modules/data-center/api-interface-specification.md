# 统一API网关和服务接口规范设计

## 📋 设计概述

**文档编号**: DC004-API  
**版本**: v1.0  
**创建日期**: 2026年2月28日

## 🌐 API网关架构设计

### 1. 网关核心功能

```typescript
// src/gateway/core/api-gateway.ts
export class ApiGateway {
  private router: Router;
  private authMiddleware: AuthMiddleware;
  private rateLimiter: RateLimiter;
  private logger: ApiLogger;
  private circuitBreaker: CircuitBreaker;

  constructor(config: GatewayConfig) {
    this.router = new Router();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // 身份认证中间件
    this.router.use(
      '/api/*',
      this.authMiddleware.authenticate.bind(this.authMiddleware)
    );

    // 限流中间件
    this.router.use(
      '/api/*',
      this.rateLimiter.applyLimits.bind(this.rateLimiter)
    );

    // 日志中间件
    this.router.use('*', this.logger.logRequest.bind(this.logger));

    // 错误处理中间件
    this.router.use('*', this.setupErrorHandler());
  }

  private setupRoutes(): void {
    // 查询服务路由
    this.router.post('/api/v1/query', this.handleQuery.bind(this));
    this.router.get('/api/v1/query/history', this.getQueryHistory.bind(this));

    // 元数据服务路由
    this.router.get('/api/v1/metadata/:resource', this.getMetadata.bind(this));
    this.router.put(
      '/api/v1/metadata/:resource',
      this.updateMetadata.bind(this)
    );

    // 分析服务路由
    this.router.post(
      '/api/v1/analytics/report',
      this.generateReport.bind(this)
    );
    this.router.get(
      '/api/v1/analytics/templates',
      this.getTemplates.bind(this)
    );

    // 监控路由
    this.router.get('/health', this.healthCheck.bind(this));
    this.router.get('/metrics', this.getMetrics.bind(this));
  }
}
```

### 2. 服务路由配置

```yaml
# config/routes.yaml
routes:
  - path: /api/v1/query
    service: query-service
    methods: [GET, POST]
    auth_required: true
    rate_limit: 1000/hour

  - path: /api/v1/analytics/*
    service: analytics-service
    methods: [GET, POST]
    auth_required: true
    rate_limit: 500/hour

  - path: /api/v1/metadata/*
    service: metadata-service
    methods: [GET, PUT, DELETE]
    auth_required: true
    permissions: [metadata.read, metadata.write]

  - path: /health
    service: monitoring-service
    methods: [GET]
    auth_required: false

  - path: /metrics
    service: monitoring-service
    methods: [GET]
    auth_required: true
    permissions: [monitoring.read]
```

## 📡 服务接口规范

### 1. RESTful API设计规范

#### 1.1 统一响应格式

```typescript
// src/types/api-responses.ts
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata: ResponseMetadata;
}

export interface ResponseMetadata {
  requestId: string;
  timestamp: string;
  version: string;
  pagination?: PaginationInfo;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
}

// 统一响应工厂
export class ResponseFactory {
  static success<T>(
    data: T,
    metadata?: Partial<ResponseMetadata>
  ): ApiResponse<T> {
    return {
      success: true,
      data,
      metadata: {
        requestId: this.generateRequestId(),
        timestamp: new Date().toISOString(),
        version: '1.0',
        ...metadata,
      },
    };
  }

  static error(
    error: ApiError,
    metadata?: Partial<ResponseMetadata>
  ): ApiResponse<null> {
    return {
      success: false,
      error,
      metadata: {
        requestId: this.generateRequestId(),
        timestamp: new Date().toISOString(),
        version: '1.0',
        ...metadata,
      },
    };
  }
}
```

#### 1.2 查询服务接口

```typescript
// src/interfaces/query-service.interface.ts
export interface QueryServiceInterface {
  executeQuery(request: ExecuteQueryRequest): Promise<ExecuteQueryResponse>;
  getQueryHistory(
    userId: string,
    options: HistoryOptions
  ): Promise<QueryHistory>;
  cancelQuery(queryId: string): Promise<void>;
  validateQuery(sql: string): Promise<ValidationResult>;
}

// 请求/响应模型
export interface ExecuteQueryRequest {
  query: string;
  catalog?: string;
  schema?: string;
  timeout?: number;
  maxRows?: number;
  cacheTTL?: number;
  parameters?: Record<string, any>;
}

export interface ExecuteQueryResponse {
  data: any[];
  columns: ColumnInfo[];
  rowCount: number;
  executionTime: number;
  fromCache: boolean;
  queryId: string;
  warnings?: string[];
}
```

#### 1.3 元数据服务接口

```typescript
// src/interfaces/metadata-service.interface.ts
export interface MetadataServiceInterface {
  getResourceMetadata(resourceId: string): Promise<ResourceMetadata>;
  updateResourceMetadata(
    resourceId: string,
    updates: MetadataUpdates
  ): Promise<void>;
  searchDataResources(
    query: string,
    filters?: SearchFilters
  ): Promise<SearchResults>;
  getDataLineage(resourceId: string): Promise<DataLineage>;
}

export interface ResourceMetadata {
  id: string;
  name: string;
  type: ResourceType;
  description?: string;
  owner: string;
  tags: string[];
  schema: SchemaDefinition;
  statistics: ResourceStatistics;
  quality: QualityMetrics;
  lastModified: string;
  version: string;
}
```

### 2. GraphQL API设计

```graphql
# schema.graphql
type Query {
  # 数据查询
  executeQuery(input: QueryInput!): QueryResult
  queryHistory(userId: ID!, limit: Int, offset: Int): QueryHistoryConnection

  # 元数据查询
  resourceMetadata(id: ID!): ResourceMetadata
  searchResources(
    query: String!
    filters: ResourceFilters
  ): ResourceSearchResults

  # 分析查询
  analyticsReport(input: AnalyticsInput!): AnalyticsReport
  reportTemplates(category: ReportCategory): [ReportTemplate!]!

  # 监控查询
  systemHealth: SystemHealth
  serviceMetrics(service: String!): [Metric!]!
}

type Mutation {
  # 查询操作
  cancelQuery(queryId: ID!): Boolean
  saveQueryBookmark(input: SaveQueryInput!): QueryBookmark

  # 元数据操作
  updateResourceMetadata(id: ID!, input: UpdateMetadataInput!): ResourceMetadata
  createVirtualView(input: CreateVirtualViewInput!): VirtualView

  # 分析操作
  scheduleReport(input: ScheduleReportInput!): ScheduledReport
  shareReport(input: ShareReportInput!): ShareLink
}

# 输入类型
input QueryInput {
  query: String!
  catalog: String
  schema: String
  timeout: Int = 30000
  maxRows: Int = 1000
  parameters: JSON
}

input AnalyticsInput {
  type: AnalyticsType!
  dataSource: String!
  dimensions: [String!]!
  measures: [MeasureInput!]!
  filters: [FilterInput!]
  dateRange: DateRangeInput
}

# 输出类型
type QueryResult {
  data: [JSON!]!
  columns: [ColumnInfo!]!
  rowCount: Int!
  executionTime: Float!
  fromCache: Boolean!
  queryId: ID!
  warnings: [String!]
}

type ResourceMetadata {
  id: ID!
  name: String!
  type: ResourceType!
  description: String
  owner: User!
  tags: [String!]!
  schema: SchemaDefinition!
  statistics: ResourceStatistics!
  quality: QualityMetrics!
  lineage: DataLineage
  lastModified: DateTime!
}
```

### 3. WebSocket实时接口

```typescript
// src/interfaces/realtime-service.interface.ts
export interface RealtimeServiceInterface {
  subscribeToDataChanges(
    resourceId: string,
    callback: (data: any) => void
  ): Promise<Subscription>;

  subscribeToQueryResults(
    queryId: string,
    callback: (result: QueryProgress) => void
  ): Promise<Subscription>;

  broadcastEvent(event: BroadcastEvent): Promise<void>;
}

// 实时数据结构
export interface QueryProgress {
  queryId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  rowCount?: number;
  executionTime?: number;
  error?: string;
}

export interface DataChangeEvent {
  resourceId: string;
  eventType: 'insert' | 'update' | 'delete';
  data: any;
  timestamp: string;
  userId?: string;
}
```

## 🔐 安全接口规范

### 1. 身份认证接口

```typescript
// src/interfaces/auth-service.interface.ts
export interface AuthServiceInterface {
  authenticate(credentials: AuthCredentials): Promise<AuthResponse>;
  refreshToken(refreshToken: string): Promise<RefreshResponse>;
  logout(token: string): Promise<void>;
  validateToken(token: string): Promise<TokenValidation>;
}

export interface AuthCredentials {
  username: string;
  password: string;
  clientId?: string;
  clientSecret?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  user: UserInfo;
  permissions: string[];
}
```

### 2. 权限控制接口

```typescript
// src/interfaces/rbac-service.interface.ts
export interface RbacServiceInterface {
  checkPermission(
    userId: string,
    resource: string,
    action: string
  ): Promise<boolean>;

  getUserPermissions(userId: string): Promise<string[]>;
  getResourcePermissions(resource: string): Promise<ResourcePermissions>;
  assignRoleToUser(userId: string, roleId: string): Promise<void>;
  createPermission(permission: CreatePermissionInput): Promise<Permission>;
}

export interface ResourcePermissions {
  read: boolean;
  write: boolean;
  execute: boolean;
  admin: boolean;
  custom: string[];
}
```

## 📊 监控和管理接口

### 1. 系统监控接口

```typescript
// src/interfaces/monitoring-service.interface.ts
export interface MonitoringServiceInterface {
  getSystemHealth(): Promise<SystemHealth>;
  getServiceMetrics(service: string): Promise<ServiceMetrics>;
  getPerformanceMetrics(timeRange: TimeRange): Promise<PerformanceMetrics>;
  getErrorLogs(filters: LogFilters): Promise<ErrorLog[]>;
  triggerAlert(alert: AlertTrigger): Promise<void>;
}

export interface SystemHealth {
  overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  services: ServiceHealth[];
  resources: ResourceUsage[];
  timestamp: string;
}

export interface ServiceMetrics {
  serviceName: string;
  uptime: number;
  requestRate: number;
  errorRate: number;
  latency: LatencyMetrics;
  throughput: ThroughputMetrics;
}
```

### 2. 配置管理接口

```typescript
// src/interfaces/config-service.interface.ts
export interface ConfigServiceInterface {
  getConfiguration(scope: string): Promise<Configuration>;
  updateConfiguration(scope: string, config: any): Promise<void>;
  validateConfiguration(config: any): Promise<ValidationResult>;
  rollbackConfiguration(scope: string, version: string): Promise<void>;
  listConfigurationVersions(scope: string): Promise<ConfigVersion[]>;
}

export interface Configuration {
  version: string;
  timestamp: string;
  author: string;
  settings: Record<string, any>;
  encryptedFields: string[];
}
```

## 🔄 服务发现和负载均衡

### 1. 服务注册接口

```typescript
// src/interfaces/discovery-service.interface.ts
export interface DiscoveryServiceInterface {
  registerService(registration: ServiceRegistration): Promise<void>;
  deregisterService(serviceId: string): Promise<void>;
  discoverService(serviceName: string): Promise<ServiceInstance[]>;
  heartbeat(serviceId: string): Promise<void>;
  getServiceCatalog(): Promise<ServiceCatalog>;
}

export interface ServiceRegistration {
  id: string;
  name: string;
  version: string;
  address: string;
  port: number;
  tags: string[];
  metadata: Record<string, any>;
  healthCheck: HealthCheckConfig;
}

export interface ServiceInstance {
  id: string;
  name: string;
  address: string;
  port: number;
  status: 'healthy' | 'unhealthy' | 'unknown';
  tags: string[];
  metadata: Record<string, any>;
}
```

### 2. 负载均衡策略

```typescript
// src/loadbalancer/load-balancer.ts
export abstract class LoadBalancer {
  abstract selectInstance(instances: ServiceInstance[]): ServiceInstance;
  abstract updateInstanceHealth(instanceId: string, status: string): void;
}

export class RoundRobinLoadBalancer extends LoadBalancer {
  private currentIndex: number = 0;

  selectInstance(instances: ServiceInstance[]): ServiceInstance {
    const healthyInstances = instances.filter(i => i.status === 'healthy');
    if (healthyInstances.length === 0) {
      throw new NoHealthyInstancesError();
    }

    const instance =
      healthyInstances[this.currentIndex % healthyInstances.length];
    this.currentIndex++;
    return instance;
  }
}

export class WeightedLoadBalancer extends LoadBalancer {
  selectInstance(instances: ServiceInstance[]): ServiceInstance {
    const healthyInstances = instances.filter(i => i.status === 'healthy');
    if (healthyInstances.length === 0) {
      throw new NoHealthyInstancesError();
    }

    // 基于权重的选择算法
    const totalWeight = healthyInstances.reduce(
      (sum, inst) => sum + (inst.metadata.weight || 1),
      0
    );

    let random = Math.random() * totalWeight;
    for (const instance of healthyInstances) {
      const weight = instance.metadata.weight || 1;
      random -= weight;
      if (random <= 0) {
        return instance;
      }
    }

    return healthyInstances[0]; // fallback
  }
}
```

## 📈 API版本管理

### 1. 版本控制策略

```typescript
// src/versioning/api-versioning.ts
export class ApiVersioning {
  private versionMap: Map<string, VersionHandler>;

  getVersionHandler(version: string): VersionHandler {
    const handler = this.versionMap.get(version);
    if (!handler) {
      throw new UnsupportedVersionError(version);
    }
    return handler;
  }

  deprecateVersion(version: string, sunsetDate: Date): void {
    const handler = this.versionMap.get(version);
    if (handler) {
      handler.setDeprecated(true, sunsetDate);
    }
  }
}

export interface VersionHandler {
  handle(request: ApiRequest): Promise<ApiResponse>;
  getVersion(): string;
  isDeprecated(): boolean;
  getSunsetDate(): Date | null;
}
```

### 2. 向后兼容性处理

```typescript
// src/compatibility/compatibility-layer.ts
export class CompatibilityLayer {
  private transformers: Map<string, DataTransformer>;

  transformRequest(oldRequest: any, targetVersion: string): any {
    const transformer = this.transformers.get(`request_${targetVersion}`);
    return transformer ? transformer.transform(oldRequest) : oldRequest;
  }

  transformResponse(newResponse: any, clientVersion: string): any {
    const transformer = this.transformers.get(`response_${clientVersion}`);
    return transformer ? transformer.transform(newResponse) : newResponse;
  }
}
```

## 🎯 性能优化接口

### 1. 缓存控制接口

```typescript
// src/interfaces/cache-control.interface.ts
export interface CacheControlInterface {
  setCachePolicy(resource: string, policy: CachePolicy): Promise<void>;
  getCachePolicy(resource: string): Promise<CachePolicy>;
  invalidateCache(pattern: string): Promise<number>;
  getCacheStats(): Promise<CacheStats>;
}

export interface CachePolicy {
  ttl: number; // seconds
  staleWhileRevalidate: number; // seconds
  cacheControl: string; // 'public' | 'private'
  vary: string[]; // Vary header values
  etag: boolean;
}
```

### 2. 批量操作接口

```typescript
// src/interfaces/batch-service.interface.ts
export interface BatchServiceInterface {
  executeBatch(operations: BatchOperation[]): Promise<BatchResult>;
  createBatchJob(job: BatchJob): Promise<BatchJobStatus>;
  getBatchJobStatus(jobId: string): Promise<BatchJobStatus>;
  cancelBatchJob(jobId: string): Promise<void>;
}

export interface BatchOperation {
  operation: 'query' | 'metadata' | 'analytics';
  parameters: any;
  dependencies?: string[]; // 依赖的其他操作ID
}

export interface BatchResult {
  jobId: string;
  status: 'completed' | 'failed' | 'partial';
  results: OperationResult[];
  executionTime: number;
  errorCount: number;
}
```

## 📚 API文档和测试

### 1. OpenAPI规范生成

```yaml
# openapi.yaml
openapi: 3.0.3
info:
  title: Data Center API
  description: 统一数据管理平台API接口
  version: 1.0.0
  contact:
    name: API Support
    email: api-support@company.com

servers:
  - url: https://api.datacenter.company.com/v1
    description: Production server

paths:
  /query:
    post:
      summary: 执行数据查询
      operationId: executeQuery
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ExecuteQueryRequest'
      responses:
        '200':
          description: 查询成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ExecuteQueryResponse'
        '400':
          description: 请求参数错误
        '401':
          description: 未授权
        '429':
          description: 请求过于频繁

components:
  schemas:
    ExecuteQueryRequest:
      type: object
      required:
        - query
      properties:
        query:
          type: string
          description: SQL查询语句
        catalog:
          type: string
          description: 数据目录
        schema:
          type: string
          description: 数据模式
        timeout:
          type: integer
          description: 超时时间(毫秒)
          default: 30000
        maxRows:
          type: integer
          description: 最大返回行数
          default: 1000

    ExecuteQueryResponse:
      type: object
      properties:
        data:
          type: array
          items:
            type: object
        columns:
          type: array
          items:
            $ref: '#/components/schemas/ColumnInfo'
        rowCount:
          type: integer
        executionTime:
          type: number
        fromCache:
          type: boolean
```

### 2. API测试套件

```typescript
// tests/api/query-api.test.ts
describe('Query API Tests', () => {
  let apiClient: ApiClient;

  beforeAll(async () => {
    apiClient = new ApiClient({
      baseURL: process.env.API_BASE_URL,
      apiKey: process.env.API_KEY,
    });
  });

  describe('POST /api/v1/query', () => {
    it('should execute valid SQL query successfully', async () => {
      const response = await apiClient.post('/api/v1/query', {
        query: 'SELECT COUNT(*) as count FROM devices',
        catalog: 'fixcycle',
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('data');
      expect(response.data.data[0].count).toBeGreaterThan(0);
    });

    it('should reject malicious SQL queries', async () => {
      const response = await apiClient.post('/api/v1/query', {
        query: 'DROP TABLE devices',
      });

      expect(response.status).toBe(400);
      expect(response.data.error.code).toBe('INVALID_QUERY');
    });

    it('should respect rate limiting', async () => {
      // 发送超过限制的请求数
      const promises = Array(101)
        .fill(null)
        .map(() => apiClient.post('/api/v1/query', { query: 'SELECT 1' }));

      const responses = await Promise.allSettled(promises);
      const rateLimitedResponses = responses.filter(
        r => r.status === 'fulfilled' && r.value.status === 429
      );

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});
```

---

_文档版本: v1.0_  
_最后更新: 2026年2月28日_  
_维护团队: API架构组_
