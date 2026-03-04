# 数据中心核心组件架构设计

## 📋 设计概述

**文档编号**: DC004-COMPONENTS  
**版本**: v1.0  
**创建日期**: 2026年2月28日

## 🏗️ 四层架构设计

### 1. 数据接入层 (Data Access Layer)

#### 1.1 数据源适配器

```typescript
// src/data-access/adapters/base-adapter.ts
export abstract class DataSourceAdapter {
  protected connection: Connection;

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract executeQuery(query: string): Promise<QueryResult>;
  abstract getSchema(): Promise<SchemaInfo>;

  protected validateQuery(query: string): ValidationResult {
    // 基础SQL注入防护
    const dangerousPatterns = [
      /\b(DROP|DELETE|UPDATE|INSERT)\b/i,
      /;\s*(DROP|DELETE|UPDATE|INSERT)/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(query)) {
        return { valid: false, error: 'Dangerous SQL operation detected' };
      }
    }

    return { valid: true };
  }
}

// src/data-access/adapters/postgresql-adapter.ts
export class PostgresqlAdapter extends DataSourceAdapter {
  constructor(private config: PostgresConfig) {
    super();
  }

  async connect(): Promise<void> {
    this.connection = new pg.Client({
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.user,
      password: this.config.password,
    });

    await this.connection.connect();
  }

  async executeQuery(query: string): Promise<QueryResult> {
    const validation = this.validateQuery(query);
    if (!validation.valid) {
      throw new ValidationError(validation.error);
    }

    const result = await this.connection.query(query);
    return {
      rows: result.rows,
      rowCount: result.rowCount,
      columns: result.fields.map(f => f.name),
    };
  }
}
```

#### 1.2 联邦查询引擎

```typescript
// src/data-access/federation-engine.ts
export class FederationEngine {
  private adapters: Map<string, DataSourceAdapter>;
  private queryPlanner: QueryPlanner;

  async executeFederatedQuery(
    federatedQuery: FederatedQuery
  ): Promise<FederatedResult> {
    // 1. 查询解析和优化
    const executionPlan =
      await this.queryPlanner.createExecutionPlan(federatedQuery);

    // 2. 并行执行子查询
    const subQueryResults = await Promise.all(
      executionPlan.subQueries.map(async subQuery => {
        const adapter = this.adapters.get(subQuery.dataSource);
        if (!adapter) {
          throw new DataSourceNotFoundError(subQuery.dataSource);
        }

        const result = await adapter.executeQuery(subQuery.query);
        return { dataSource: subQuery.dataSource, result };
      })
    );

    // 3. 结果合并
    const mergedResult = this.mergeResults(
      subQueryResults,
      executionPlan.joinStrategy
    );

    return {
      data: mergedResult,
      executionTime: Date.now() - executionPlan.startTime,
      dataSources: subQueryResults.map(sq => sq.dataSource),
    };
  }

  private mergeResults(
    results: SubQueryResult[],
    strategy: JoinStrategy
  ): any[] {
    switch (strategy.type) {
      case 'hash_join':
        return this.hashJoin(results, strategy.joinKeys);
      case 'sort_merge_join':
        return this.sortMergeJoin(results, strategy.joinKeys);
      default:
        throw new UnsupportedJoinStrategyError(strategy.type);
    }
  }
}
```

### 2. 数据处理层 (Data Processing Layer)

#### 2.1 数据清洗管道

```typescript
// src/processing/data-pipeline.ts
export class DataPipeline {
  private processors: DataProcessor[];

  addProcessor(processor: DataProcessor): void {
    this.processors.push(processor);
  }

  async process(data: any[]): Promise<ProcessedData> {
    let currentData = data;

    for (const processor of this.processors) {
      currentData = await processor.process(currentData);
    }

    return {
      data: currentData,
      processingSteps: this.processors.length,
      processedAt: new Date(),
    };
  }
}

// src/processing/processors/data-cleansing-processor.ts
export class DataCleansingProcessor implements DataProcessor {
  async process(data: any[]): Promise<any[]> {
    return data.map(row => {
      const cleanedRow = { ...row };

      // 处理空值
      Object.keys(cleanedRow).forEach(key => {
        if (cleanedRow[key] === null || cleanedRow[key] === undefined) {
          cleanedRow[key] = this.getDefaultValue(key);
        }
      });

      // 数据类型转换
      this.convertDataTypes(cleanedRow);

      // 格式标准化
      this.standardizeFormats(cleanedRow);

      return cleanedRow;
    });
  }

  private getDefaultValue(fieldName: string): any {
    const defaults: Record<string, any> = {
      status: 'unknown',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return defaults[fieldName] || '';
  }
}
```

#### 2.2 实时流处理器

```typescript
// src/processing/stream-processor.ts
export class StreamProcessor {
  private kafkaConsumer: KafkaConsumer;
  private processors: StreamDataProcessor[];

  async startProcessing(topic: string): Promise<void> {
    await this.kafkaConsumer.subscribe(topic);

    await this.kafkaConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const data = JSON.parse(message.value.toString());
          await this.processStreamData(data);
        } catch (error) {
          console.error('Stream processing error:', error);
          // 发送到死信队列
          await this.sendToDeadLetterQueue(message);
        }
      },
    });
  }

  private async processStreamData(data: any): Promise<void> {
    let currentData = data;

    for (const processor of this.processors) {
      currentData = await processor.process(currentData);
    }

    // 发送到下游系统
    await this.publishProcessedData(currentData);
  }
}
```

### 3. 服务层 (Service Layer)

#### 3.1 统一查询服务

```typescript
// src/services/unified-query-service.ts
export class UnifiedQueryService {
  private federationEngine: FederationEngine;
  private cacheService: CacheService;
  private auditLogger: AuditLogger;

  async executeQuery(request: QueryRequest): Promise<QueryResponse> {
    // 1. 权限验证
    await this.validatePermissions(request.userId, request.query);

    // 2. 查询缓存检查
    const cacheKey = this.generateCacheKey(request);
    const cachedResult = await this.cacheService.get(cacheKey);
    if (cachedResult) {
      return {
        data: cachedResult.data,
        fromCache: true,
        cacheHit: true,
        executionTime: 0,
      };
    }

    // 3. 审计日志记录
    const auditEntry = await this.auditLogger.logQueryStart(request);

    try {
      // 4. 执行查询
      const result = await this.federationEngine.executeFederatedQuery({
        query: request.query,
        dataSources: request.dataSources,
        timeout: request.timeout,
      });

      // 5. 缓存结果
      await this.cacheService.set(cacheKey, result, request.cacheTTL || 300);

      // 6. 更新审计日志
      await this.auditLogger.logQueryComplete(auditEntry, result);

      return {
        data: result.data,
        columns: result.columns,
        rowCount: result.rowCount,
        fromCache: false,
        cacheHit: false,
        executionTime: result.executionTime,
        dataSources: result.dataSources,
      };
    } catch (error) {
      await this.auditLogger.logQueryError(auditEntry, error);
      throw error;
    }
  }
}
```

#### 3.2 智能分析服务

```typescript
// src/services/intelligent-analytics-service.ts
export class IntelligentAnalyticsService {
  private mlModels: Map<string, MLModel>;
  private trendAnalyzer: TrendAnalyzer;
  private anomalyDetector: AnomalyDetector;

  async performIntelligentAnalysis(
    analysisRequest: IntelligentAnalysisRequest
  ): Promise<IntelligentAnalysisResult> {
    const { analysisType, data, parameters } = analysisRequest;

    switch (analysisType) {
      case 'predictive_analysis':
        return await this.performPredictiveAnalysis(data, parameters);
      case 'pattern_recognition':
        return await this.performPatternRecognition(data, parameters);
      case 'anomaly_detection':
        return await this.anomalyDetector.detect(data, parameters);
      case 'correlation_analysis':
        return await this.performCorrelationAnalysis(data, parameters);
      default:
        throw new UnsupportedAnalysisTypeError(analysisType);
    }
  }

  private async performPredictiveAnalysis(
    data: any[],
    params: PredictionParameters
  ): Promise<PredictionResult> {
    const model = this.mlModels.get(params.modelType);
    if (!model) {
      throw new ModelNotFoundError(params.modelType);
    }

    // 数据预处理
    const preparedData = await this.prepareDataForPrediction(
      data,
      params.features
    );

    // 执行预测
    const predictions = await model.predict(preparedData);

    // 结果解释
    const interpretation = await this.interpretPredictions(predictions, params);

    return {
      predictions: predictions,
      confidence: interpretation.confidence,
      interpretation: interpretation.explanation,
      modelUsed: params.modelType,
      featureImportance: interpretation.featureImportance,
    };
  }
}
```

### 4. 展示层 (Presentation Layer)

#### 4.1 数据可视化引擎

```typescript
// src/presentation/visualization-engine.ts
export class VisualizationEngine {
  private chartRenderers: Map<string, ChartRenderer>;
  private templateEngine: TemplateEngine;

  async renderVisualization(
    visualizationRequest: VisualizationRequest
  ): Promise<VisualizationResult> {
    const { chartType, data, options } = visualizationRequest;

    const renderer = this.chartRenderers.get(chartType);
    if (!renderer) {
      throw new UnsupportedChartTypeError(chartType);
    }

    // 数据转换
    const transformedData = await this.transformData(
      data,
      options.dataTransform
    );

    // 图表渲染
    const chartSpec = await renderer.render(transformedData, options);

    // 模板应用
    const htmlOutput = await this.templateEngine.render('chart-template', {
      chartSpec,
      options,
      metadata: {
        generatedAt: new Date(),
        chartType,
        dataSize: data.length,
      },
    });

    return {
      html: htmlOutput,
      chartSpec: chartSpec,
      metadata: {
        chartType,
        dataSize: data.length,
        renderTime: Date.now() - options.startTime,
      },
    };
  }

  private async transformData(
    data: any[],
    transform: DataTransform
  ): Promise<any[]> {
    if (!transform) return data;

    return data.map(row => {
      const transformedRow = { ...row };

      // 字段重命名
      if (transform.fieldMappings) {
        Object.entries(transform.fieldMappings).forEach(
          ([oldName, newName]) => {
            if (transformedRow.hasOwnProperty(oldName)) {
              transformedRow[newName] = transformedRow[oldName];
              delete transformedRow[oldName];
            }
          }
        );
      }

      // 数据计算
      if (transform.calculations) {
        transform.calculations.forEach(calc => {
          transformedRow[calc.field] = this.evaluateExpression(
            calc.expression,
            transformedRow
          );
        });
      }

      return transformedRow;
    });
  }
}
```

#### 4.2 交互式仪表板

```typescript
// src/presentation/interactive-dashboard.ts
export class InteractiveDashboard {
  private widgets: DashboardWidget[];
  private eventBus: EventBus;
  private stateManager: StateManager;

  async renderDashboard(dashboardConfig: DashboardConfig): Promise<string> {
    // 初始化组件
    await this.initializeWidgets(dashboardConfig.widgets);

    // 构建布局
    const layout = this.buildLayout(dashboardConfig.layout);

    // 渲染模板
    const html = await this.renderTemplate({
      layout,
      widgets: this.widgets,
      config: dashboardConfig,
      theme: dashboardConfig.theme || 'default',
    });

    return html;
  }

  private async initializeWidgets(
    widgetConfigs: WidgetConfig[]
  ): Promise<void> {
    this.widgets = await Promise.all(
      widgetConfigs.map(async config => {
        const widget = await this.createWidget(config);
        widget.on('dataChanged', data => {
          this.handleWidgetDataChange(widget.id, data);
        });
        return widget;
      })
    );
  }

  private handleWidgetDataChange(widgetId: string, data: any): void {
    // 广播数据变化
    this.eventBus.emit('widgetDataChanged', { widgetId, data });

    // 更新相关联的组件
    const relatedWidgets = this.findRelatedWidgets(widgetId);
    relatedWidgets.forEach(widget => {
      widget.update(data);
    });
  }
}
```

## 🔧 组件间交互协议

### 1. 服务间通信

```typescript
// src/communication/service-message.ts
export interface ServiceMessage {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  correlationId?: string;
  replyTo?: string;
}

// src/communication/message-broker.ts
export class MessageBroker {
  private channels: Map<string, Channel>;

  async publish(channel: string, message: ServiceMessage): Promise<void> {
    const ch = this.channels.get(channel);
    if (!ch) {
      throw new ChannelNotFoundError(channel);
    }

    await ch.send(JSON.stringify(message));
  }

  async subscribe(
    channel: string,
    handler: (message: ServiceMessage) => Promise<void>
  ): Promise<Subscription> {
    const ch =
      this.channels.get(channel) || (await this.createChannel(channel));

    const consumer = await ch.consume(async msg => {
      if (msg) {
        const message: ServiceMessage = JSON.parse(msg.content.toString());
        await handler(message);
        ch.ack(msg);
      }
    });

    return { channel, consumerTag: consumer.consumerTag };
  }
}
```

### 2. 数据流转协议

```typescript
// src/protocols/data-flow-protocol.ts
export class DataFlowProtocol {
  static serializeData(data: any): Buffer {
    return Buffer.from(
      JSON.stringify({
        version: '1.0',
        timestamp: Date.now(),
        payload: data,
        checksum: this.calculateChecksum(data),
      })
    );
  }

  static deserializeData(buffer: Buffer): any {
    const message = JSON.parse(buffer.toString());

    // 校验和验证
    if (message.checksum !== this.calculateChecksum(message.payload)) {
      throw new DataIntegrityError('Checksum validation failed');
    }

    return message.payload;
  }

  private static calculateChecksum(data: any): string {
    return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
  }
}
```

## 🛡️ 容错与恢复机制

### 1. 电路断路器

```typescript
// src/resilience/circuit-breaker.ts
export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount: number = 0;
  private lastFailureTime: number = 0;

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.config.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new CircuitOpenError('Circuit breaker is open');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}
```

### 2. 重试机制

```typescript
// src/resilience/retry-policy.ts
export class RetryPolicy {
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const config = {
      maxAttempts: 3,
      delay: 1000,
      backoffMultiplier: 2,
      ...options,
    };

    let lastError: Error;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === config.maxAttempts) {
          break;
        }

        if (!this.shouldRetry(error, config.retryableErrors)) {
          throw error;
        }

        const delay =
          config.delay * Math.pow(config.backoffMultiplier, attempt - 1);
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  private shouldRetry(error: Error, retryableErrors?: string[]): boolean {
    if (!retryableErrors) return true;
    return retryableErrors.some(errType => error.name.includes(errType));
  }
}
```

## 📈 性能监控指标

### 1. 组件健康检查

```typescript
// src/monitoring/component-health.ts
export class ComponentHealthChecker {
  private healthIndicators: Map<string, HealthIndicator>;

  async checkComponentHealth(componentName: string): Promise<HealthStatus> {
    const indicator = this.healthIndicators.get(componentName);
    if (!indicator) {
      throw new ComponentNotFoundError(componentName);
    }

    try {
      const status = await indicator.check();
      return {
        component: componentName,
        status: status.healthy ? 'UP' : 'DOWN',
        details: status.details,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        component: componentName,
        status: 'DOWN',
        details: { error: error.message },
        timestamp: new Date(),
      };
    }
  }

  async checkOverallHealth(): Promise<SystemHealth> {
    const componentStatuses = await Promise.all(
      Array.from(this.healthIndicators.keys()).map(name =>
        this.checkComponentHealth(name)
      )
    );

    const overallStatus = componentStatuses.every(s => s.status === 'UP')
      ? 'UP'
      : 'DOWN';

    return {
      status: overallStatus,
      components: componentStatuses,
      timestamp: new Date(),
    };
  }
}
```

### 2. 性能指标收集

```typescript
// src/monitoring/performance-metrics.ts
export class PerformanceMetricsCollector {
  private metrics: Map<string, Metric>;

  recordLatency(operation: string, duration: number): void {
    const metric = this.getOrCreateMetric(`latency.${operation}`, 'histogram');
    metric.observe(duration);
  }

  recordThroughput(operation: string, count: number): void {
    const metric = this.getOrCreateMetric(`throughput.${operation}`, 'counter');
    metric.inc(count);
  }

  recordError(operation: string): void {
    const metric = this.getOrCreateMetric(`errors.${operation}`, 'counter');
    metric.inc();
  }

  private getOrCreateMetric(name: string, type: MetricType): Metric {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, this.createMetric(name, type));
    }
    return this.metrics.get(name)!;
  }
}
```

---

_文档版本: v1.0_  
_最后更新: 2026年2月28日_  
_维护团队: 技术架构组_
