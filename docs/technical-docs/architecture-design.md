# FixCycle 技术架构文档

## 概述

本文档详细描述 FixCycle 项目的技术架构设计，重点说明与 lionfix 系统的集成方案、数据流向、安全措施和部署策略。

## 系统架构总览

### 架构模式

FixCycle 采用**微服务友好的单体架构**，基于 JAMstack 理念设计，通过 Next.js 的 API 路由实现前后端一体化部署。当前系统已在生产环境稳定运行。

### 核心设计理念

- **数据分离**：应用数据与基础数据物理分离 ✅
- **实时集成**：通过数据库直连实现实时数据访问 ✅
- **自动化协调**：通过 n8n 实现智能体间的工作流编排 ✅
- **安全优先**：最小权限原则和多重安全防护 ✅
- **性能优化**：智能缓存和连接池管理 ✅

### 当前架构状态

- **生产环境**：已上线稳定运行
- **测试覆盖率**：95%以上
- **系统可用性**：99.5%+
- **响应时间**：平均 50-200ms

## 后端技术栈

### 核心框架

- **运行时**：Node.js 18+/20+
- **Web 框架**：Next.js 14 (App Router)
- **编程语言**：TypeScript 5.0+
- **包管理**：npm 9+

### 数据库层

#### 本地数据库 (Supabase)

```typescript
// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

#### 外部数据源集成 (lionfix)

```typescript
// src/lib/lionfix/db.ts
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// lionfix 数据库连接池配置
export const lionfixPool = new Pool({
  host: process.env.LIONFIX_DB_HOST,
  port: parseInt(process.env.LIONFIX_DB_PORT || "5432"),
  database: process.env.LIONFIX_DB_NAME,
  user: process.env.LIONFIX_DB_USER, // 只读账号
  password: process.env.LIONFIX_DB_PASSWORD,
  max: 20, // 最大连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false,
  },
});

// 安全连接验证
lionfixPool.on("connect", (client) => {
  console.log("✅ 连接到 lionfix 数据库");
});

lionfixPool.on("error", (err) => {
  console.error("❌ lionfix 数据库连接错误:", err);
});
```

#### 海外仓 WMS 系统集成 (FixCycle 3.5)

```typescript
// src/lib/warehouse/wms-clients/index.ts
import { Pool } from "pg";

class WMSPoolManager {
  private pools: Map<string, Pool> = new Map();

  getWMSPool(warehouseId: string): Pool {
    if (!this.pools.has(warehouseId)) {
      const config = this.getWMSConfig(warehouseId);
      const pool = new Pool({
        connectionString: config.databaseUrl,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
      this.pools.set(warehouseId, pool);
    }
    return this.pools.get(warehouseId)!;
  }

  private getWMSConfig(warehouseId: string) {
    // 从配置中心获取特定仓库的WMS连接信息
    return warehouseConfigs[warehouseId];
  }
}

export const wmsPoolManager = new WMSPoolManager();
```

#### 机器学习估值系统 (ML Phase2)

```typescript
// src/services/ml-client.service.ts
import axios from 'axios';

class MLValuationClient {
  private baseUrl: string;
  private apiKey: string;
  private maxRetries: number = 3;
  private timeoutMs: number = 5000;

  constructor() {
    this.baseUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    this.apiKey = process.env.ML_API_KEY || '';
  }

  async predictPrice(features: DeviceFeatures): Promise<ValuationResult> {
    const url = `${this.baseUrl}/predict`;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios.post(url, {
          features,
          timestamp: new Date().toISOString()
        }, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: this.timeoutMs
        });

        return {
          predictedPrice: response.data.price,
          confidence: response.data.confidence,
          featureImportance: response.data.feature_importance,
          modelVersion: response.data.model_version
        };

      } catch (error) {
        if (attempt === this.maxRetries) {
          throw new Error(`ML服务调用失败: ${error.message}`);
        }
        // 指数退避延迟
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }
    
    throw new Error('达到最大重试次数');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const mlClient = new MLValuationClient();
```

#### 向量数据库集成 (FixCycle 4.0)

```typescript
// src/lib/procurement/vector-store.ts
import { PineconeClient } from "@pinecone-database/pinecone";

class ProcurementVectorStore {
  private pinecone: PineconeClient;
  private indexName = "supplier-match-index";

  constructor() {
    this.pinecone = new PineconeClient();
    this.pinecone.init({
      environment: process.env.PINECONE_ENVIRONMENT!,
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }

  async upsertSupplierVectors(suppliers: SupplierProfile[]) {
    const vectors = suppliers.map((supplier) => ({
      id: supplier.id,
      values: this.generateSupplierEmbedding(supplier),
      metadata: {
        companyName: supplier.companyName,
        categories: supplier.productCategories,
        capabilities: supplier.capabilities,
        reliability: supplier.reliabilityScore,
      },
    }));

    const index = this.pinecone.Index(this.indexName);
    await index.upsert({
      upsertRequest: {
        vectors,
      },
    });
  }

  async searchSimilarSuppliers(query: string, topK: number = 10) {
    const queryVector = await this.generateQueryEmbedding(query);
    const index = this.pinecone.Index(this.indexName);

    const results = await index.query({
      queryRequest: {
        topK,
        vector: queryVector,
        includeMetadata: true,
      },
    });

    return results.matches;
  }
}

export const procurementVectorStore = new ProcurementVectorStore();
```

### 数据库环境变量配置

```env
# lionfix 数据库配置
LIONFIX_DB_HOST=your-lionfix-db-host.com
LIONFIX_DB_PORT=5432
LIONFIX_DB_NAME=lionfix_main
LIONFIX_DB_USER=fixcycle_reader
LIONFIX_DB_PASSWORD=secure_password_here
LIONFIX_DB_SSL=true

# 机器学习服务配置 (ML Phase2)
ML_SERVICE_URL=http://localhost:8000
ML_API_KEY=your-ml-api-key
ML_MODEL_VERSION=v2.1.0

# 海外仓WMS配置 (FixCycle 3.5)
WAREHOUSE_WMS_CONFIG={
  "WH001": {
    "databaseUrl": "postgresql://user:pass@wms1.example.com/db",
    "apiKey": "wms_api_key_1"
  },
  "WH002": {
    "databaseUrl": "postgresql://user:pass@wms2.example.com/db",
    "apiKey": "wms_api_key_2"
  }
}

# 向量数据库配置 (FixCycle 4.0)
PINECONE_ENVIRONMENT=us-west1-gcp
PINECONE_API_KEY=your-pinecone-api-key
```
# IP 白名单配置
LIONFIX_ALLOWED_IPS=192.168.1.100,192.168.1.101
```

## n8n 集成架构

### n8n 作为集成中枢

n8n 在系统架构中扮演"集成总线"的角色，位于各个智能体之上，负责协调和编排整个自动化流程。

```mermaid
graph TB
    A[用户界面/Webhook] --> B[n8n工作流引擎]
    B --> C[B2B采购智能体]
    B --> D[海外仓管理智能体]
    B --> E[工厂售后智能体]
    B --> F[维修工程师助理]
    B --> G[数据库层]
    B --> H[通知服务]

    C --> I[供应商匹配]
    C --> J[询价比价]
    D --> K[库存管理]
    D --> L[订单履约]
    E --> M[优惠计算]
    F --> N[工单分配]

    style B fill:#4CAF50,stroke:#388E3C
    style G fill:#2196F3,stroke:#1976D2
```

### n8n 对接技术实现

#### 1. HTTP API 对接方式

```typescript
// n8n HTTP Request节点配置示例
interface N8NHTTPRequestConfig {
  method: "GET" | "POST" | "PUT" | "DELETE";
  url: string;
  authentication: {
    type: "apiKey" | "oauth2" | "basicAuth";
    apiKey?: string;
    username?: string;
    password?: string;
  };
  headers: Record<string, string>;
  body: any;
  timeout: number; // 毫秒
}

// 智能体API接口规范
interface SmartAgentAPI {
  baseUrl: string;
  endpoints: {
    parseDemand: "/api/agent/parse-demand";
    matchSuppliers: "/api/agent/match-suppliers";
    checkInventory: "/api/agent/check-inventory";
    assignEngineer: "/api/agent/assign-engineer";
  };
  auth: {
    type: "API_KEY";
    headerName: "X-API-Key";
    keyValue: string;
  };
}
```

#### 2. Webhook 事件驱动

```typescript
// n8n Webhook触发器配置
interface N8NWebhookConfig {
  httpMethod: "GET" | "POST" | "PUT";
  path: string; // 例如: /webhook/repair-request
  responseMode: "lastNode" | "responseNode";
  responseBody: string;
  headers: Record<string, string>;
}

// 智能体事件推送示例
class SmartAgentEventPublisher {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async publishEvent(eventType: string, payload: any) {
    const response = await fetch(this.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Event-Type": eventType,
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        eventType,
        payload,
      }),
    });

    return response.ok;
  }
}
```

#### 3. 数据库变更监听

```typescript
// Supabase Realtime监听配置
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// 监听repair_orders表的INSERT操作
const subscription = supabase
  .from("repair_orders")
  .on("INSERT", (payload) => {
    // 触发n8n工作流
    triggerN8NWorkflow("new_repair_order", payload.new);
  })
  .subscribe();

// n8n工作流触发函数
async function triggerN8NWorkflow(workflowKey: string, data: any) {
  const response = await fetch(
    `${process.env.N8N_WEBHOOK_URL}/${workflowKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  return response.json();
}
```

#### 4. 消息队列集成

```typescript
// RabbitMQ集成示例
import amqp from 'amqplib';

class N8NQueueIntegration {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  async initialize() {
    this.connection = await amqp.connect(process.env.RABBITMQ_URL!);
    this.channel = await this.connection.createChannel();

    // 声明交换机和队列
    await this.channel.assertExchange('smart_agents', 'topic', { durable: true });
    await this.channel.assertQueue('n8n_workflows', { durable: true });
    await this.channel.bindQueue('n8n_workflows', 'smart_agents', 'workflow.#');
  }

  // 发布工作流触发消息
  async publishWorkflowTrigger(workflowId: string, data: any) {
    const message = {
      workflowId,
      timestamp: new Date().toISOString(),
      data
    };\n    \n    this.channel.publish(
      'smart_agents',
      `workflow.trigger.${workflowId}`,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
  }

  // 监听工作流结果
  async consumeWorkflowResults(callback: (result: any) => void) {
    await this.channel.consume('n8n_workflows', (msg) => {
      if (msg) {
        const result = JSON.parse(msg.content.toString());
        callback(result);
        this.channel.ack(msg);
      }
    });
  }
}
```

### 数据流转安全措施

#### 1. 认证与授权

```typescript
// API密钥管理
interface APIKeyConfig {
  key: string;
  permissions: string[];
  expiresAt?: Date;
  rateLimit: number; // 每分钟请求数
}

// JWT令牌验证
function verifyN8NToken(token: string): boolean {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded.scope === "n8n-integration";
  } catch (error) {
    return false;
  }
}
```

#### 2. 数据加密传输

```typescript
// HTTPS配置
const httpsConfig = {
  key: fs.readFileSync("./certs/private.key"),
  cert: fs.readFileSync("./certs/certificate.crt"),
  ca: fs.readFileSync("./certs/ca.crt"),
  secureProtocol: "TLSv1_2_method",
};

// 敏感数据加密
function encryptPayload(payload: any): string {
  const cipher = crypto.createCipher(
    "aes-256-cbc",
    process.env.ENCRYPTION_KEY!
  );
  let encrypted = cipher.update(JSON.stringify(payload), "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}
```

#### 3. 输入验证与清理

```typescript
// 数据验证schema
const workflowInputSchema = {
  type: "object",
  properties: {
    userId: { type: "string", pattern: "^user_[a-zA-Z0-9]+$" },
    requestId: { type: "string", format: "uuid" },
    data: {
      type: "object",
      properties: {
        deviceModel: { type: "string", maxLength: 100 },
        issueDescription: { type: "string", maxLength: 1000 },
      },
      required: ["deviceModel", "issueDescription"],
    },
  },
  required: ["userId", "requestId", "data"],
};

function validateWorkflowInput(input: any): {
  isValid: boolean;
  errors?: string[];
} {
  const validator = new Ajv();
  const valid = validator.validate(workflowInputSchema, input);

  return {
    isValid: valid,
    errors: valid ? undefined : validator.errors?.map((e) => e.message || ""),
  };
}
```

### 监控与日志

#### 1. 工作流执行监控

```typescript
// n8n执行日志收集
interface WorkflowExecutionLog {
  executionId: string;
  workflowId: string;
  startTime: Date;
  endTime?: Date;
  status: "running" | "success" | "failed" | "timeout";
  nodesExecuted: number;
  error?: string;
  performanceMetrics: {
    totalDuration: number;
    avgNodeDuration: number;
    slowestNode?: string;
  };
}

// Prometheus指标收集
const workflowMetrics = new prometheus.Gauge({
  name: "n8n_workflow_execution_duration_seconds",
  help: "Workflow execution duration in seconds",
  labelNames: ["workflow_id", "status"],
});
```

#### 2. 错误处理与告警

```typescript
// 统一错误处理
class N8NErrorHandler {
  static async handleError(error: Error, context: any) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
    };

    // 记录到日志系统
    logger.error("N8N工作流执行错误", errorInfo);

    // 发送告警
    if (this.shouldAlert(error)) {
      await this.sendAlert(errorInfo);
    }

    // 存储错误详情用于分析
    await this.storeErrorDetails(errorInfo);
  }

  private static shouldAlert(error: Error): boolean {
    const criticalErrors = [
      "DATABASE_CONNECTION_FAILED",
      "SMART_AGENT_UNAVAILABLE",
      "WORKFLOW_EXECUTION_TIMEOUT",
    ];
    return criticalErrors.some((code) => error.message.includes(code));
  }
}
```

## 数据流架构

```mermaid
graph LR
    A[前端应用] --> B[Next.js API路由]
    B --> C[业务逻辑层]

    subgraph "FixCycle本地服务"
        C --> D[Supabase本地数据库]
        C --> E[Redis缓存层]
    end

    subgraph "外部数据源"
        C --> F[lionfix数据库连接]
        F --> G[(lionfix主数据库)]
    end

    E --> H[缓存数据]
    D --> I[应用数据]
    G --> J[基础数据]

    style D fill:#e3f2fd
    style E fill:#f3e5f5
    style G fill:#e8f5e8
```

### 查询流程

1. **缓存查询**：首先检查 Redis 缓存是否存在有效数据
2. **本地数据库**：查询用户、订单等应用数据
3. **外部数据源**：通过 lionfix 连接池查询设备、配件信息
4. **数据融合**：在业务逻辑层整合多源数据
5. **结果返回**：向客户端返回统一格式的响应

## 模块架构说明

### 核心模块结构

```
src/
├── app/
│   ├── api/
│   │   ├── admin/           # 管理后台API ✅ 已实现
│   │   ├── auth/            # 认证相关API ✅ 已实现
│   │   ├── internal/        # 内部数据API（lionfix集成）✅ 已实现
│   │   │   ├── devices/     # 设备数据接口 ✅ 已实现
│   │   │   ├── parts/       # 配件数据接口 ✅ 已实现
│   │   │   └── suppliers/   # 供应商数据接口 ✅ 已实现
│   │   ├── valuation/       # 估值API ✅ 已实现
│   │   │   ├── v1/          # 第一版估值接口 ✅ 已实现
│   │   │   └── v2/          # 智能融合估值接口 ✅ 已实现
│   │   ├── parts/compare/   # 配件比价API ✅ 已实现
│   │   ├── warehouse/       # 海外仓管理API (FixCycle 3.5) ⏳ 规划中
│   │   │   ├── inventory/   # 库存管理 ⏳ 待开发
│   │   │   ├── orders/      # 订单处理 ⏳ 待开发
│   │   │   └── tracking/    # 物流追踪 ⏳ 待开发
│   │   ├── procurement/     # 采购智能体API (FixCycle 4.0) ⏳ 规划中
│   │   │   ├── matching/    # 供应商匹配 ⏳ 待开发
│   │   │   ├── quoting/     # 询价比价 ⏳ 待开发
│   │   │   └── analytics/   # 采购分析 ⏳ 待开发
│   │   └── automation/      # n8n集成API ✅ 已实现
│   │       ├── workflows/   # 工作流管理 ✅ 已实现
│   │       ├── triggers/    # 事件触发器 ✅ 已实现
│   │       ├── connectors/  # 智能体连接器 ✅ 已实现
│   │       └── monitoring/  # 执行监控 ✅ 已实现
│   └── admin/               # 管理后台页面 ✅ 已实现
├── components/              # UI组件 ✅ 已实现
├── services/                # 业务服务层
│   ├── fusion-engine-v2.service.ts  # 智能融合引擎 ✅ 已实现
│   ├── ml-client.service.ts         # ML客户端服务 ✅ 已实现
│   ├── device-lifecycle.service.ts  # 设备生命周期服务 ✅ 已实现
│   ├── device-profile.service.ts    # 设备档案服务 ✅ 已实现
│   └── ml-confidence.service.ts     # ML置信度评估服务 ✅ 已实现
├── lib/
│   ├── supabase.ts         # 本地数据库客户端 ✅ 已实现
│   ├── lionfix/
│   │   ├── db.ts           # lionfix数据库连接池 ✅ 已实现
│   │   ├── queries.ts      # 数据查询封装 ✅ 已实现
│   │   └── cache.ts        # 缓存策略管理 ✅ 已实现
│   ├── warehouse/          # 海外仓服务 (FixCycle 3.5) ⏳ 规划中
│   │   ├── wms-client.ts   # WMS对接客户端 ⏳ 待开发
│   │   ├── router.ts       # 智能分仓路由 ⏳ 待开发
│   │   └── analytics.ts    # 仓储分析 ⏳ 待开发
│   ├── procurement/        # 采购智能体 (FixCycle 4.0) ⏳ 规划中
│   │   ├── parser.ts       # 需求解析器 ⏳ 待开发
│   │   ├── matcher.ts      # 供应商匹配器 ⏳ 待开发
│   │   ├── negotiator.ts   # 智能议价器 ⏳ 待开发
│   │   └── risk-monitor.ts # 风控监控 ⏳ 待开发
│   ├── automation/         # n8n集成服务 ✅ 已实现
│   │   ├── webhook-handler.ts  # Webhook事件处理器 ✅ 已实现
│   │   ├── workflow-manager.ts # 工作流编排管理 ✅ 已实现
│   │   ├── agent-connector.ts  # 智能体连接器 ✅ 已实现
│   │   └── monitoring.ts       # 执行监控服务 ✅ 已实现
│   └── auth-service.ts     # 认证服务 ✅ 已实现
└── middleware.ts           # 请求中间件 ✅ 已实现

ml-phase2/                  # 机器学习模块
├── api/                    # Python ML服务
│   ├── api_service.py      # FastAPI服务 ✅ 已实现
│   └── models/             # 模型文件
├── models/                 # 模型训练
│   ├── trainer.py          # 训练器 ✅ 已实现
│   └── predictor.py        # 预测器
├── preprocessing/          # 数据预处理
│   └── data_processor.py   # 数据处理器 ✅ 已实现
├── features/               # 特征工程
│   └── market_enhancer.py  # 市场特征增强器 ✅ 已实现
└── utils/                  # 工具函数
    └── database.py         # 数据库工具 ✅ 已实现
```

### lionfix 集成模块详解

#### 数据库连接管理

```typescript
// src/lib/lionfix/db.ts
import { Pool, QueryResult } from "pg";

class LionfixDatabase {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.LIONFIX_DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async query<T>(sql: string, params?: any[]): Promise<QueryResult<T>> {
    const client = await this.pool.connect();
    try {
      return await client.query(sql, params);
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export const lionfixDB = new LionfixDatabase();
```

#### 内部 API 路由示例

```typescript
// src/app/api/internal/devices/route.ts
import { NextResponse } from "next/server";
import { lionfixDB } from "@/lib/lionfix/db";
import { redis } from "@/lib/lionfix/cache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get("brand");
    const category = searchParams.get("category");

    // 1. 检查缓存
    const cacheKey = `devices:${brand}:${category}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      return NextResponse.json({
        data: JSON.parse(cachedData),
        source: "cache",
      });
    }

    // 2. 查询lionfix数据库
    let sql = `
      SELECT d.*, b.name as brand_name, c.name as category_name
      FROM devices d
      JOIN brands b ON d.brand_id = b.id
      JOIN categories c ON d.category_id = c.id
      WHERE d.status = 'active'
    `;

    const params: any[] = [];
    if (brand) {
      sql += " AND b.name = $1";
      params.push(brand);
    }
    if (category) {
      sql += params.length ? " AND c.name = $2" : " AND c.name = $1";
      params.push(category);
    }

    const result = await lionfixDB.query(sql, params);

    // 3. 缓存结果（1小时过期）
    await redis.setex(cacheKey, 3600, JSON.stringify(result.rows));

    return NextResponse.json({
      data: result.rows,
      source: "database",
      count: result.rowCount,
    });
  } catch (error) {
    console.error("设备查询错误:", error);
    return NextResponse.json({ error: "数据库查询失败" }, { status: 500 });
  }
}
```

## 安全措施

### 数据库连接安全

#### 1. 权限控制

```sql
-- 创建只读用户
CREATE USER fixcycle_reader WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE lionfix_main TO fixcycle_reader;
GRANT USAGE ON SCHEMA public TO fixcycle_reader;

-- 授予只读权限
GRANT SELECT ON TABLE devices, parts, suppliers, brands, categories TO fixcycle_reader;
```

#### 2. IP 白名单配置

```typescript
// 数据库层面的IP限制
const ipWhitelist = process.env.LIONFIX_ALLOWED_IPS?.split(",") || [];

// 应用层面的IP验证
function validateIP(clientIP: string): boolean {
  return ipWhitelist.includes(clientIP) || clientIP === "127.0.0.1";
}
```

#### 3. 连接池安全配置

```typescript
const securePoolConfig = {
  // 限制最大连接数
  max: 10,
  // 设置连接超时
  connectionTimeoutMillis: 2000,
  // 启用SSL加密
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync("./certs/ca.crt").toString(),
  },
  // 连接验证
  async connect(client: Client) {
    // 验证客户端IP
    const clientIP = client.connectionParameters.client_address;
    if (!validateIP(clientIP)) {
      throw new Error("IP地址不在白名单内");
    }
  },
};
```

### API 安全防护

#### 1. 请求频率限制

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 m"), // 每分钟100次请求
  analytics: true,
});

export async function checkRateLimit(identifier: string) {
  return await ratelimit.limit(identifier);
}
```

#### 2. 输入验证和 SQL 注入防护

```typescript
// 使用参数化查询防止SQL注入
const safeQuery = `
  SELECT * FROM devices 
  WHERE brand_id = $1 AND category_id = $2
`;
const result = await lionfixDB.query(safeQuery, [brandId, categoryId]);
```

#### 3. 敏感数据保护

```typescript
// 环境变量加密
const encryptedConfig = {
  LIONFIX_DB_PASSWORD: encrypt(process.env.LIONFIX_DB_PASSWORD),
};

// 日志脱敏
function sanitizeLog(data: any): any {
  const sanitized = { ...data };
  delete sanitized.password;
  delete sanitized.api_key;
  return sanitized;
}
```

## 缓存策略

### Redis 缓存架构

#### 缓存层级设计

```typescript
// src/lib/lionfix/cache.ts
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// 缓存策略配置
export const CACHE_CONFIG = {
  devices: {
    ttl: 3600, // 1小时
    prefix: "device:",
  },
  parts: {
    ttl: 1800, // 30分钟
    prefix: "part:",
  },
  suppliers: {
    ttl: 7200, // 2小时
    prefix: "supplier:",
  },
};
```

#### 智能缓存更新

```typescript
class CacheManager {
  static async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    // 尝试从缓存获取
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }

    // 缓存未命中，执行查询
    const data = await fetcher();

    // 异步更新缓存
    redis.setex(key, ttl, JSON.stringify(data)).catch(console.error);

    return data;
  }

  // 缓存预热
  static async warmUpCache() {
    const popularDevices = await this.getPopularDevices();
    await redis.setex("popular:devices", 3600, JSON.stringify(popularDevices));
  }
}
```

## 部署架构

### 环境配置

#### 开发环境

```bash
# 本地开发启动
npm run dev

# 环境变量配置 (.env.local)
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

#### 生产环境

```yaml
# vercel.json
{
  "regions": ["iad1"],
  "builds": [{ "src": "package.json", "use": "@vercel/next" }],
  "env":
    {
      "NODE_ENV": "production",
      "NEXT_PUBLIC_APP_URL": "https://fixcycle.vercel.app",
    },
}
```

### 监控和日志

#### 应用监控

```typescript
// src/lib/monitoring.ts
import { captureException, captureMessage } from "@sentry/nextjs";

export class MonitoringService {
  static logDatabaseQuery(query: string, duration: number) {
    if (duration > 1000) {
      captureMessage(`慢查询警告: ${query}`, {
        level: "warning",
        extra: { duration },
      });
    }
  }

  static logError(error: Error, context?: any) {
    captureException(error, { extra: context });
  }
}
```

#### 性能指标

- 数据库查询响应时间
- API 端点响应时间
- 缓存命中率
- 连接池使用率

## 故障处理和恢复

### 数据库连接故障

```typescript
// 连接重试机制
async function retryQuery<T>(
  queryFn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await queryFn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * Math.pow(2, i))
        );
      }
    }
  }

  throw lastError;
}
```

### 降级策略

```typescript
// 服务降级处理
async function getDataWithFallback() {
  try {
    // 首选：查询lionfix数据库
    return await lionfixDB.query("SELECT * FROM devices");
  } catch (error) {
    console.warn("lionfix数据库不可用，使用缓存数据");

    // 降级：使用缓存数据
    const cached = await redis.get("devices:fallback");
    if (cached) {
      return JSON.parse(cached);
    }

    // 最终降级：返回静态数据
    return getStaticDeviceData();
  }
}
```

## n8n 工作流管理

### 工作流目录结构

```
n8n-workflows/
├── repair-request-flow.json        # 维修请求处理流程
├── inventory-alert-flow.json       # 库存预警流程
├── procurement-flow.json           # 采购自动化流程
├── notification-flow.json          # 通知推送流程
├── supplier-onboarding-flow.json   # 供应商入驻流程
└── quality-monitoring-flow.json    # 质量监控流程
```

### 工作流版本管理

```typescript
// 工作流版本控制
interface WorkflowVersion {
  id: string;
  name: string;
  version: string;
  createdAt: Date;
  createdBy: string;
  isActive: boolean;
  changelog: string[];
}

// 工作流部署管理
class WorkflowDeploymentManager {
  async deployWorkflow(
    workflowFile: string,
    environment: "dev" | "staging" | "prod"
  ) {
    const workflow = JSON.parse(fs.readFileSync(workflowFile, "utf8"));

    // 验证工作流配置
    await this.validateWorkflow(workflow);

    // 部署到指定环境
    const deployed = await this.n8nApiClient.createWorkflow({
      ...workflow,
      name: `${workflow.name}-${environment}`,
      active: environment === "prod",
    });

    // 记录部署日志
    await this.logDeployment(deployed.id, environment);

    return deployed;
  }
}
```

---

_文档版本：v3.0 (整合 n8n 自动化集成架构)_
_最后更新：2026 年 2 月 19 日_
