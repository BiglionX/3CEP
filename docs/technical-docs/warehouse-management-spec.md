# 海外仓智能管理系统技术架构规范（FixCycle 3.5）

## 概述

本文档详细描述 FixCycle 3.5 海外仓智能管理系统的完整技术架构设计，涵盖从基础数据对接到智能化运营分析的全链路技术实现。

## 系统架构总览

### 整体架构模式

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   前端应用层    │────│   API服务层      │────│   数据存储层    │
│ (Next.js SSR)   │    │ (Node.js API)    │    │ (PostgreSQL)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                        │
         ▼                       ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   海外仓WMS     │    │   业务逻辑层     │    │   缓存层        │
│   系统对接      │────│ (智能分仓引擎)   │────│ (Redis)         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                        │
         ▼                       ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   物流商API     │    │   算法引擎层     │    │   监控告警层    │
│   聚合服务      │────│ (补货预测模型)   │────│ (Prometheus)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 核心技术栈

### 后端技术栈

- **运行环境**: Node.js 18+/20+
- **Web框架**: Next.js 14 (App Router)
- **编程语言**: TypeScript 5.0+
- **数据库**: Supabase PostgreSQL
- **缓存**: Redis 7.x
- **消息队列**: BullMQ (Redis-backed)
- **任务调度**: node-cron

### 外部服务集成

- **海外仓WMS**: 标准化API对接
- **物流商**: 17track API聚合
- **地理服务**: Google Maps API
- **监控**: Prometheus + Grafana

## 模块详细设计

### 1. WMS系统对接模块

#### 1.1 数据对接架构

```typescript
// src/lib/warehouse/wms-client.ts
interface WMSClient {
  authenticate(): Promise<boolean>;
  syncInventory(): Promise<WarehouseInventory[]>;
  createInboundOrder(order: InboundOrder): Promise<string>;
  updateShipmentStatus(tracking: string, status: ShipmentStatus): Promise<void>;
  getWarehouseLocations(): Promise<WarehouseLocation[]>;
}

class StandardWMSClient implements WMSClient {
  private baseUrl: string;
  private apiKey: string;
  private warehouseId: string;

  constructor(config: WMSConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.warehouseId = config.warehouseId;
  }

  async syncInventory(): Promise<WarehouseInventory[]> {
    const response = await this.makeAuthenticatedRequest('/inventory/sync');
    return response.data.map(this.transformInventoryItem);
  }

  private async makeAuthenticatedRequest(endpoint: string, data?: any) {
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'X-Warehouse-ID': this.warehouseId,
    };

    return await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
  }
}
```

#### 1.2 数据同步策略

```typescript
// src/lib/warehouse/sync-scheduler.ts
class InventorySyncScheduler {
  private syncIntervals = {
    inventory: 300, // 5分钟
    orders: 60, // 1分钟
    shipments: 300, // 5分钟
  };

  async startScheduledSync() {
    // 库存同步
    setInterval(() => {
      this.syncWarehouseInventory();
    }, this.syncIntervals.inventory * 1000);

    // 订单状态同步
    setInterval(() => {
      this.syncOrderStatus();
    }, this.syncIntervals.orders * 1000);
  }

  private async syncWarehouseInventory() {
    try {
      const warehouses = await this.getConnectedWarehouses();
      const syncResults = await Promise.allSettled(
        warehouses.map(warehouse => this.syncSingleWarehouse(warehouse))
      );

      await this.updateSyncStatus(syncResults);
    } catch (error) {
      this.logger.error('库存同步失败', error);
    }
  }
}
```

### 2. 智能分仓引擎

#### 2.1 分仓决策算法

```typescript
// src/lib/warehouse/distribution-router.ts
interface DistributionFactors {
  userLocation: GeoPoint;
  inventoryLevels: Map<WarehouseId, number>;
  shippingCosts: Map<WarehouseId, number>;
  deliveryTimes: Map<WarehouseId, number>;
  warehouseCapacities: Map<WarehouseId, number>;
}

class SmartDistributionRouter {
  async calculateOptimalWarehouse(
    order: Order,
    factors: DistributionFactors
  ): Promise<WarehouseSelection> {
    // 1. 过滤有库存的仓库
    const availableWarehouses = this.filterByInventory(
      order.items,
      factors.inventoryLevels
    );

    // 2. 计算综合得分
    const scoredWarehouses = availableWarehouses.map(warehouse => ({
      warehouse,
      score: this.calculateWarehouseScore(warehouse, order, factors),
    }));

    // 3. 选择最优仓库
    const optimal = scoredWarehouses.reduce((best, current) =>
      current.score > best.score ? current : best
    );

    return {
      warehouseId: optimal.warehouse.id,
      estimatedDelivery: factors.deliveryTimes.get(optimal.warehouse.id)!,
      totalCost: factors.shippingCosts.get(optimal.warehouse.id)!,
      confidence: optimal.score,
    };
  }

  private calculateWarehouseScore(
    warehouse: Warehouse,
    order: Order,
    factors: DistributionFactors
  ): number {
    const weights = {
      proximity: 0.3,
      cost: 0.25,
      speed: 0.25,
      capacity: 0.2,
    };

    const proximityScore = this.calculateProximityScore(
      factors.userLocation,
      warehouse.location
    );

    const costScore = this.normalizeCost(
      factors.shippingCosts.get(warehouse.id)!
    );

    const speedScore = this.normalizeSpeed(
      factors.deliveryTimes.get(warehouse.id)!
    );

    const capacityScore = this.calculateCapacityUtilization(
      warehouse.id,
      factors
    );

    return (
      proximityScore * weights.proximity +
      costScore * weights.cost +
      speedScore * weights.speed +
      capacityScore * weights.capacity
    );
  }
}
```

### 3. 入库预报管理系统

#### 3.1 入库流程设计

```typescript
// src/lib/warehouse/inbound-management.ts
interface InboundOrder {
  id: string;
  supplierId: string;
  warehouseId: string;
  items: InboundItem[];
  expectedArrival: Date;
  status: 'draft' | 'confirmed' | 'in_transit' | 'received';
}

class InboundOrderManager {
  async createInboundOrder(data: CreateInboundOrderDTO): Promise<InboundOrder> {
    // 1. 验证数据完整性
    await this.validateInboundData(data);

    // 2. 生成入库单号
    const orderNumber = this.generateOrderNumber();

    // 3. 创建入库单记录
    const inboundOrder = await this.database.inboundOrders.create({
      ...data,
      orderNumber,
      status: 'draft',
    });

    // 4. 通知海外仓
    await this.notifyWarehouse(inboundOrder);

    return inboundOrder;
  }

  async confirmReceipt(
    orderId: string,
    receivedItems: ReceivedItem[]
  ): Promise<void> {
    const order = await this.getInboundOrder(orderId);

    // 1. 验证收货数量
    await this.verifyReceivedQuantities(order.items, receivedItems);

    // 2. 更新库存
    await this.updateWarehouseInventory(order.warehouseId, receivedItems);

    // 3. 更新订单状态
    await this.updateOrderStatus(orderId, 'received');

    // 4. 触发后续流程
    await this.triggerPostReceiptProcesses(order, receivedItems);
  }
}
```

### 4. 物流追踪聚合服务

#### 4.1 多物流商适配

```typescript
// src/lib/logistics/tracking-aggregator.ts
interface TrackingProvider {
  name: string;
  getCouriers(): Courier[];
  trackPackage(
    trackingNumber: string,
    courierCode: string
  ): Promise<TrackingInfo>;
}

class LogisticsTrackingAggregator {
  private providers: Map<string, TrackingProvider> = new Map();

  registerProvider(provider: TrackingProvider) {
    this.providers.set(provider.name, provider);
  }

  async trackPackage(
    trackingNumber: string,
    courierCode?: string
  ): Promise<UnifiedTrackingInfo> {
    // 1. 如果指定了快递公司，直接查询
    if (courierCode) {
      const provider = this.findProviderForCourier(courierCode);
      if (provider) {
        return await this.fetchFromProvider(
          provider,
          trackingNumber,
          courierCode
        );
      }
    }

    // 2. 自动识别快递公司
    const autoDetected = await this.autoDetectCourier(trackingNumber);
    if (autoDetected) {
      return await this.fetchFromProvider(
        autoDetected.provider,
        trackingNumber,
        autoDetected.courier.code
      );
    }

    // 3. 并行查询所有提供商
    const results = await Promise.allSettled(
      Array.from(this.providers.values()).map(provider =>
        this.searchAllCouriers(provider, trackingNumber)
      )
    );

    return this.mergeTrackingResults(results);
  }

  private async autoDetectCourier(trackingNumber: string): Promise<{
    provider: TrackingProvider;
    courier: Courier;
  } | null> {
    // 基于运单号格式和校验规则自动识别
    for (const provider of this.providers.values()) {
      const couriers = provider.getCouriers();
      for (const courier of couriers) {
        if (this.validateTrackingFormat(trackingNumber, courier)) {
          return { provider, courier };
        }
      }
    }
    return null;
  }
}
```

### 5. 智能补货建议引擎

#### 5.1 需求预测模型

```typescript
// src/lib/warehouse/replenishment-engine.ts
interface DemandForecast {
  productId: string;
  warehouseId: string;
  forecastPeriod: DateRange;
  predictedDemand: number;
  confidenceInterval: [number, number];
  seasonalFactors: number[];
}

class ReplenishmentEngine {
  async generateReplenishmentPlan(
    warehouseId: string,
    horizonDays: number = 30
  ): Promise<ReplenishmentPlan> {
    // 1. 获取历史销售数据
    const salesHistory = await this.getSalesHistory(
      warehouseId,
      horizonDays * 2
    );

    // 2. 预测未来需求
    const demandForecasts = await Promise.all(
      this.getActiveProducts(warehouseId).map(productId =>
        this.forecastDemand(productId, warehouseId, horizonDays, salesHistory)
      )
    );

    // 3. 计算补货建议
    const replenishmentSuggestions = demandForecasts
      .map(forecast => {
        const currentInventory = this.getCurrentInventory(
          forecast.productId,
          forecast.warehouseId
        );

        const safetyStock = this.calculateSafetyStock(forecast);
        const reorderPoint = safetyStock + forecast.predictedDemand;

        if (currentInventory <= reorderPoint) {
          const orderQuantity = this.calculateEOQ(
            forecast.predictedDemand,
            currentInventory,
            safetyStock
          );

          return {
            productId: forecast.productId,
            suggestedQuantity: orderQuantity,
            reorderPoint,
            safetyStock,
            confidence: forecast.confidenceInterval,
          };
        }

        return null;
      })
      .filter(Boolean);

    return {
      warehouseId,
      generationTime: new Date(),
      horizonDays,
      suggestions: replenishmentSuggestions,
      totalValue: this.calculateTotalValue(replenishmentSuggestions),
    };
  }

  private async forecastDemand(
    productId: string,
    warehouseId: string,
    horizonDays: number,
    historicalData: SalesHistory[]
  ): Promise<DemandForecast> {
    // 使用时间序列分析（ARIMA/Prophet）
    const timeSeriesModel = new TimeSeriesModel(historicalData);
    const forecast = await timeSeriesModel.predict(horizonDays);

    // 考虑季节性因素
    const seasonalFactors = this.calculateSeasonalAdjustments(
      productId,
      warehouseId
    );

    return {
      productId,
      warehouseId,
      forecastPeriod: {
        start: new Date(),
        end: new Date(Date.now() + horizonDays * 24 * 60 * 60 * 1000),
      },
      predictedDemand: forecast.mean,
      confidenceInterval: [forecast.lower, forecast.upper],
      seasonalFactors,
    };
  }
}
```

### 6. 效能分析看板

#### 6.1 数据指标体系

```typescript
// src/lib/analytics/warehouse-metrics.ts
interface WarehouseMetrics {
  operational: OperationalMetrics;
  financial: FinancialMetrics;
  quality: QualityMetrics;
  efficiency: EfficiencyMetrics;
}

class WarehouseAnalytics {
  async generateWarehouseReport(
    warehouseId: string,
    period: DateRange
  ): Promise<WarehouseReport> {
    const metrics: WarehouseMetrics = {
      operational: await this.calculateOperationalMetrics(warehouseId, period),
      financial: await this.calculateFinancialMetrics(warehouseId, period),
      quality: await this.calculateQualityMetrics(warehouseId, period),
      efficiency: await this.calculateEfficiencyMetrics(warehouseId, period),
    };

    const anomalies = await this.detectAnomalies(metrics);
    const recommendations = await this.generateRecommendations(
      metrics,
      anomalies
    );

    return {
      warehouseId,
      period,
      metrics,
      anomalies,
      recommendations,
      benchmarkComparison: await this.compareWithBenchmark(warehouseId),
    };
  }

  private async calculateOperationalMetrics(
    warehouseId: string,
    period: DateRange
  ): Promise<OperationalMetrics> {
    return {
      // 入库效率指标
      inboundAccuracy: await this.calculateInboundAccuracy(warehouseId, period),
      avgInboundProcessingTime: await this.calculateAvgProcessingTime(
        warehouseId,
        period,
        'inbound'
      ),

      // 出库效率指标
      outboundAccuracy: await this.calculateOutboundAccuracy(
        warehouseId,
        period
      ),
      avgOutboundProcessingTime: await this.calculateAvgProcessingTime(
        warehouseId,
        period,
        'outbound'
      ),

      // 库存周转指标
      inventoryTurnover: await this.calculateInventoryTurnover(
        warehouseId,
        period
      ),
      stockoutRate: await this.calculateStockoutRate(warehouseId, period),
    };
  }
}
```

## 数据库设计

### 核心表结构

```sql
-- 海外仓信息表
CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  location POINT NOT NULL,
  country_code CHAR(2) NOT NULL,
  timezone VARCHAR(50) NOT NULL,
  wms_provider VARCHAR(100),
  wms_api_config JSONB,
  contact_info JSONB,
  operational_hours JSONB,
  capacity_limit INTEGER,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 仓库库存表
CREATE TABLE warehouse_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID REFERENCES warehouses(id),
  part_id UUID REFERENCES parts(id),
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  allocated_quantity INTEGER NOT NULL DEFAULT 0,
  safety_stock INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 0,
  last_counted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(warehouse_id, part_id)
);

-- 入库订单表
CREATE TABLE inbound_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(100) UNIQUE NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id),
  supplier_id UUID REFERENCES suppliers(id),
  expected_arrival TIMESTAMP,
  actual_arrival TIMESTAMP,
  status VARCHAR(20) DEFAULT 'draft',
  items JSONB NOT NULL,
  total_value DECIMAL(12,2),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 出库订单表
CREATE TABLE outbound_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(100) UNIQUE NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id),
  destination_location POINT,
  customer_info JSONB,
  shipping_method VARCHAR(50),
  tracking_number VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  items JSONB NOT NULL,
  total_value DECIMAL(12,2),
  estimated_delivery TIMESTAMP,
  actual_delivery TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 物流追踪记录表
CREATE TABLE shipment_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number VARCHAR(100) NOT NULL,
  courier_code VARCHAR(50) NOT NULL,
  current_status VARCHAR(50),
  location VARCHAR(255),
  timestamp TIMESTAMP DEFAULT NOW(),
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 补货建议表
CREATE TABLE replenishment_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID REFERENCES warehouses(id),
  part_id UUID REFERENCES parts(id),
  suggested_quantity INTEGER NOT NULL,
  current_inventory INTEGER NOT NULL,
  safety_stock INTEGER NOT NULL,
  reorder_point INTEGER NOT NULL,
  forecast_demand INTEGER NOT NULL,
  confidence_score DECIMAL(3,2),
  generated_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending' -- pending, approved, rejected, executed
);
```

## API接口设计

### RESTful API端点

```typescript
// src/app/api/warehouse/[warehouseId]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { warehouseId: string } }
) {
  const warehouse = await warehouseService.getById(params.warehouseId);
  return NextResponse.json(warehouse);
}

export async function PUT(
  request: Request,
  { params }: { params: { warehouseId: string } }
) {
  const data = await request.json();
  const updated = await warehouseService.update(params.warehouseId, data);
  return NextResponse.json(updated);
}

// src/app/api/warehouse/[warehouseId]/inventory/route.ts
export async function GET(
  request: Request,
  { params }: { params: { warehouseId: string } }
) {
  const { searchParams } = new URL(request.url);
  const partId = searchParams.get('partId');

  if (partId) {
    const inventory = await inventoryService.getByPart(
      params.warehouseId,
      partId
    );
    return NextResponse.json(inventory);
  } else {
    const inventory = await inventoryService.getAll(params.warehouseId);
    return NextResponse.json(inventory);
  }
}

// src/app/api/warehouse/distribution/optimize/route.ts
export async function POST(request: Request) {
  const { order, userLocation } = await request.json();

  const optimalWarehouse = await distributionRouter.calculateOptimalWarehouse(
    order,
    userLocation
  );

  return NextResponse.json(optimalWarehouse);
}

// src/app/api/warehouse/replenishment/generate/route.ts
export async function POST(request: Request) {
  const { warehouseId, horizonDays } = await request.json();

  const plan = await replenishmentEngine.generateReplenishmentPlan(
    warehouseId,
    horizonDays
  );

  return NextResponse.json(plan);
}
```

## 缓存策略

### 多层缓存设计

```typescript
// src/lib/cache/warehouse-cache.ts
class WarehouseCacheManager {
  private readonly TTL_CONFIG = {
    inventory: 300, // 5分钟
    warehouse_list: 3600, // 1小时
    shipping_rates: 1800, // 30分钟
    tracking_info: 600, // 10分钟
  };

  async getCachedInventory(
    warehouseId: string,
    partId?: string
  ): Promise<WarehouseInventory | WarehouseInventory[] | null> {
    const cacheKey = partId
      ? `warehouse:${warehouseId}:inventory:${partId}`
      : `warehouse:${warehouseId}:inventory`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // 缓存未命中，从数据库获取
    const freshData = partId
      ? await inventoryService.getByPart(warehouseId, partId)
      : await inventoryService.getAll(warehouseId);

    // 异步更新缓存
    redis.setex(cacheKey, this.TTL_CONFIG.inventory, JSON.stringify(freshData));

    return freshData;
  }

  async invalidateInventoryCache(warehouseId: string, partId?: string) {
    if (partId) {
      await redis.del(`warehouse:${warehouseId}:inventory:${partId}`);
    } else {
      // 批量删除该仓库的所有库存缓存
      const pattern = `warehouse:${warehouseId}:inventory:*`;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  }
}
```

## 监控与告警

### 关键指标监控

```typescript
// src/lib/monitoring/warehouse-monitor.ts
class WarehouseMonitor {
  private readonly ALERT_THRESHOLDS = {
    inventory_accuracy: 0.95,
    order_processing_time: 3600, // 1小时
    shipping_delay: 86400, // 1天
    system_uptime: 0.999,
  };

  async checkWarehouseHealth(warehouseId: string): Promise<HealthStatus> {
    const checks = await Promise.all([
      this.checkInventoryAccuracy(warehouseId),
      this.checkOrderProcessingPerformance(warehouseId),
      this.checkShippingPerformance(warehouseId),
      this.checkSystemConnectivity(warehouseId),
    ]);

    const overallHealth = checks.every(check => check.status === 'healthy')
      ? 'healthy'
      : checks.some(check => check.status === 'critical')
        ? 'critical'
        : 'degraded';

    return {
      warehouseId,
      overallStatus: overallHealth,
      checks,
      lastChecked: new Date(),
    };
  }

  private async checkInventoryAccuracy(warehouseId: string) {
    const discrepancyRate =
      await this.calculateInventoryDiscrepancy(warehouseId);

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (discrepancyRate > 0.1) status = 'critical';
    else if (discrepancyRate > 0.05) status = 'warning';

    return {
      check: 'inventory_accuracy',
      status,
      value: 1 - discrepancyRate,
      threshold: this.ALERT_THRESHOLDS.inventory_accuracy,
    };
  }
}
```

## 部署与运维

### Docker部署配置

```dockerfile
# Dockerfile.warehouse
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS production
COPY . .
RUN npm run build

EXPOSE 3001
CMD ["node", ".next/standalone/server.js"]
```

### Kubernetes部署配置

```yaml
# k8s/warehouse-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: warehouse-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: warehouse-service
  template:
    metadata:
      labels:
        app: warehouse-service
    spec:
      containers:
        - name: warehouse-service
          image: fixcycle/warehouse-service:latest
          ports:
            - containerPort: 3001
          envFrom:
            - secretRef:
                name: warehouse-secrets
          resources:
            requests:
              memory: '512Mi'
              cpu: '250m'
            limits:
              memory: '1Gi'
              cpu: '500m'
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3001
            initialDelaySeconds: 30
            periodSeconds: 10
```

## 安全考虑

### 数据安全措施

```typescript
// src/lib/security/warehouse-security.ts
class WarehouseSecurity {
  async validateWarehouseAccess(
    userId: string,
    warehouseId: string,
    action: string
  ): Promise<boolean> {
    // 1. 验证用户权限
    const userPermissions = await authService.getUserPermissions(userId);
    if (!userPermissions.includes('warehouse_access')) {
      return false;
    }

    // 2. 验证仓库访问权限
    const warehouse = await warehouseService.getById(warehouseId);
    if (!warehouse.operators.includes(userId)) {
      return false;
    }

    // 3. 验证操作权限
    return this.checkActionPermission(action, userPermissions);
  }

  async auditWarehouseOperation(
    userId: string,
    warehouseId: string,
    operation: string,
    details: any
  ) {
    await auditService.log({
      userId,
      resourceType: 'warehouse',
      resourceId: warehouseId,
      operation,
      details,
      timestamp: new Date(),
    });
  }
}
```

---

_文档版本：v1.0_
_最后更新：2026年2月15日_
_适用范围：FixCycle 3.5 海外仓智能管理系统_
