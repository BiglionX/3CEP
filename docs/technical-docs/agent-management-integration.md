# 服务端智能体管理整合方案

## 概述

本文档详细说明如何在服务端整合智能体管理功能，包括统一的API接口、监控体系、权限控制和管理界面设计。

## 当前智能体架构现状

### 1. 现有智能体清单

根据 `docs/technical-docs/agents-inventory.md`，平台目前包含以下智能体：

**n8n 工作流智能体：**
- 扫码智能服务工作流
- 教程浏览引导工作流
- 支付成功后续处理工作流
- B2B 采购智能代理工作流

**服务型智能体：**
- AI 故障诊断服务
- ML 预测服务
- FCX 智能推荐引擎
- 智能议价引擎
- 供应商推荐服务
- 库存优化推荐服务
- 智能估值决策引擎
- 设备生命周期管理服务

### 2. 现有管理接口

**统一调用接口：**
```javascript
// POST /agents/invoke
{
  "idempotency_key": "唯一标识",
  "trace_id": "追踪ID",
  "timeout": 30,
  "agent_name": "智能体名称",
  "payload": { /* 业务数据 */ }
}
```

**健康检查接口：**
```javascript
// GET /api/health
{
  "status": "ok",
  "service": "智能议价引擎",
  "timestamp": "2026-02-21T10:30:00Z"
}
```

## 服务端整合方案

### 1. 统一智能体管理API

#### 1.1 智能体注册与发现
```typescript
// src/app/api/agents/registry/route.ts
interface AgentRegistration {
  name: string;
  domain: string;
  type: 'n8n' | 'service';
  endpoint: string;
  version: string;
  metadata: {
    latencySensitive: boolean;
    securityLevel: 'low' | 'medium' | 'high';
    trafficLevel: 'low' | 'medium' | 'high';
    statusComplexity: 'low' | 'medium' | 'high';
  };
  healthCheckEndpoint: string;
  supportedOperations: string[];
}

// 注册新智能体
POST /api/agents/registry
{
  "name": "新智能体名称",
  "domain": "业务领域",
  "type": "service",
  "endpoint": "http://service-host:port",
  "version": "1.0.0",
  "metadata": {
    "latencySensitive": true,
    "securityLevel": "high",
    "trafficLevel": "medium",
    "statusComplexity": "high"
  }
}
```

#### 1.2 智能体状态监控
```typescript
// src/app/api/agents/status/route.ts
interface AgentStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  lastHeartbeat: string;
  metrics: {
    successRate: number;
    avgResponseTime: number;
    errorRate: number;
    requestCount: number;
  };
  health: {
    endpointReachable: boolean;
    responseTime: number;
    lastCheck: string;
  };
}

// 获取所有智能体状态
GET /api/agents/status

// 获取特定智能体状态
GET /api/agents/status/:agentName
```

#### 1.3 统一调度与负载均衡
```typescript
// src/app/api/agents/dispatch/route.ts
interface DispatchRequest {
  agentName: string;
  priority: 'low' | 'normal' | 'high';
  timeout: number;
  payload: any;
  routingStrategy: 'round-robin' | 'least-connections' | 'weighted';
}

interface DispatchResponse {
  requestId: string;
  agentName: string;
  status: 'scheduled' | 'executing' | 'completed' | 'failed';
  result?: any;
  error?: string;
  executionTime: number;
  traceId: string;
}

// 智能体调度
POST /api/agents/dispatch
{
  "agentName": "AI故障诊断服务",
  "priority": "high",
  "timeout": 30,
  "payload": { /* 业务数据 */ },
  "routingStrategy": "least-connections"
}
```

### 2. 权限与安全控制

#### 2.1 基于角色的访问控制
```typescript
// src/hooks/use-agent-permission.ts
interface AgentPermission {
  agentName: string;
  operations: ('invoke' | 'monitor' | 'configure' | 'manage')[];
  roles: string[];
}

const AGENT_PERMISSIONS: AgentPermission[] = [
  {
    agentName: 'AI故障诊断服务',
    operations: ['invoke', 'monitor'],
    roles: ['agent_operator', 'technician', 'admin']
  },
  {
    agentName: '智能议价引擎',
    operations: ['invoke', 'monitor', 'configure'],
    roles: ['admin', 'manager', 'procurement_specialist']
  },
  {
    agentName: 'FCX智能推荐引擎',
    operations: ['invoke', 'monitor'],
    roles: ['agent_operator', 'admin']
  }
];
```

#### 2.2 API密钥与认证
```typescript
// src/middleware/agent-auth.ts
interface ApiKey {
  key: string;
  agentName: string;
  permissions: string[];
  rateLimit: number;
  expiresAt?: string;
}

// API密钥验证中间件
function validateAgentApiKey(req: Request) {
  const apiKey = req.headers['authorization']?.replace('Bearer ', '');
  
  if (!apiKey) {
    return { valid: false, error: 'Missing API key' };
  }
  
  const keyInfo = getApiKeyInfo(apiKey);
  if (!keyInfo || (keyInfo.expiresAt && new Date(keyInfo.expiresAt) < new Date())) {
    return { valid: false, error: 'Invalid or expired API key' };
  }
  
  return { valid: true, keyInfo };
}
```

### 3. 监控与告警系统

#### 3.1 智能体监控指标
```typescript
// src/services/agent-monitoring.ts
interface AgentMetrics {
  agentName: string;
  timestamp: string;
  metrics: {
    // 性能指标
    responseTime: number;
    throughput: number;
    errorRate: number;
    successRate: number;
    
    // 资源指标
    cpuUsage: number;
    memoryUsage: number;
    concurrentRequests: number;
    
    // 业务指标
    businessValue: number;
    costPerRequest: number;
  };
}

class AgentMonitoringService {
  async collectMetrics(agentName: string): Promise<AgentMetrics> {
    // 收集智能体运行指标
    const metrics = await this.queryAgentMetrics(agentName);
    await this.storeMetrics(metrics);
    await this.checkThresholds(metrics);
    return metrics;
  }
  
  async checkThresholds(metrics: AgentMetrics) {
    const thresholds = await this.getThresholds(metrics.agentName);
    
    if (metrics.metrics.errorRate > thresholds.errorRate) {
      await this.triggerAlert('HIGH_ERROR_RATE', metrics);
    }
    
    if (metrics.metrics.responseTime > thresholds.responseTime) {
      await this.triggerAlert('HIGH_LATENCY', metrics);
    }
  }
}
```

#### 3.2 告警规则配置
```typescript
// config/agent-alert-rules.json
{
  "rules": [
    {
      "name": "高错误率告警",
      "agentPattern": "*",
      "condition": {
        "metric": "errorRate",
        "operator": ">",
        "threshold": 0.05,
        "duration": "5m"
      },
      "severity": "high",
      "notification": {
        "channels": ["slack", "email"],
        "recipients": ["admin-team"]
      }
    },
    {
      "name": "高延迟告警",
      "agentPattern": "AI*",
      "condition": {
        "metric": "responseTime",
        "operator": ">",
        "threshold": 1000,
        "duration": "2m"
      },
      "severity": "medium",
      "notification": {
        "channels": ["slack"],
        "recipients": ["oncall-engineer"]
      }
    }
  ]
}
```

### 4. 管理界面设计

#### 4.1 智能体仪表板
```typescript
// src/app/admin/agents/dashboard/page.tsx
interface AgentDashboardState {
  agents: AgentStatus[];
  filters: {
    domain?: string;
    status?: string;
    type?: string;
  };
  sort: {
    field: string;
    direction: 'asc' | 'desc';
  };
  timeRange: '1h' | '6h' | '24h' | '7d';
}

export default function AgentsDashboard() {
  const [state, setState] = useState<AgentDashboardState>({
    agents: [],
    filters: {},
    sort: { field: 'name', direction: 'asc' },
    timeRange: '24h'
  });

  useEffect(() => {
    loadAgentStatus();
    const interval = setInterval(loadAgentStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">智能体管理仪表板</h1>
        <Button onClick={() => refreshAll()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新全部
        </Button>
      </div>
      
      <AgentFilters filters={state.filters} onChange={handleFilterChange} />
      <AgentList agents={state.agents} />
      <AgentMetricsChart timeRange={state.timeRange} />
    </div>
  );
}
```

#### 4.2 智能体详情页面
```typescript
// src/app/admin/agents/[agentName]/page.tsx
interface AgentDetail {
  registration: AgentRegistration;
  status: AgentStatus;
  configuration: any;
  metrics: AgentMetrics[];
  logs: AgentLog[];
  alerts: AgentAlert[];
}

export default function AgentDetailPage({ params }: { params: { agentName: string } }) {
  const [detail, setDetail] = useState<AgentDetail | null>(null);
  
  useEffect(() => {
    loadAgentDetail(params.agentName);
  }, [params.agentName]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{params.agentName} 详情</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => testAgent()}>
            <Play className="w-4 h-4 mr-2" />
            测试调用
          </Button>
          <Button variant="outline" onClick={() => viewLogs()}>
            <FileText className="w-4 h-4 mr-2" />
            查看日志
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="metrics">性能指标</TabsTrigger>
          <TabsTrigger value="configuration">配置</TabsTrigger>
          <TabsTrigger value="logs">日志</TabsTrigger>
          <TabsTrigger value="alerts">告警</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <AgentOverview detail={detail} />
        </TabsContent>
        
        <TabsContent value="metrics">
          <AgentMetricsPanel metrics={detail?.metrics || []} />
        </TabsContent>
        
        <TabsContent value="configuration">
          <AgentConfigurationPanel configuration={detail?.configuration} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 5. 部署与运维

#### 5.1 Docker化部署
```dockerfile
# Dockerfile.agent-manager
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

CMD ["node", "deploy-simple/server.js"]
```

#### 5.2 Kubernetes部署配置
```yaml
# k8s/agent-manager-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agent-manager
spec:
  replicas: 3
  selector:
    matchLabels:
      app: agent-manager
  template:
    metadata:
      labels:
        app: agent-manager
    spec:
      containers:
      - name: agent-manager
        image: fixcycle/agent-manager:latest
        ports:
        - containerPort: 3001
        env:
        - name: AGENTS_API_KEY
          valueFrom:
            secretKeyRef:
              name: agent-secrets
              key: api-key
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: agent-secrets
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 30
---
apiVersion: v1
kind: Service
metadata:
  name: agent-manager-service
spec:
  selector:
    app: agent-manager
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3001
  type: ClusterIP
```

## 实施计划

### 阶段一：基础架构搭建 (2周)
- [ ] 实现智能体注册与发现API
- [ ] 建立统一的调用接口
- [ ] 完善权限控制系统
- [ ] 部署监控基础设施

### 阶段二：监控告警完善 (1周)
- [ ] 实现实时指标收集
- [ ] 配置告警规则
- [ ] 建立通知渠道
- [ ] 完善健康检查机制

### 阶段三：管理界面开发 (2周)
- [ ] 开发智能体仪表板
- [ ] 实现详情页面
- [ ] 添加配置管理功能
- [ ] 集成日志查看功能

### 阶段四：优化与测试 (1周)
- [ ] 性能优化
- [ ] 安全加固
- [ ] 完整测试
- [ ] 文档完善

## 预期收益

1. **统一管理**：所有智能体通过统一平台管理，降低运维复杂度
2. **实时监控**：全面的性能指标和健康状态监控
3. **快速故障定位**：完善的告警和日志系统
4. **权限控制**：细粒度的访问控制和安全防护
5. **可扩展性**：支持新智能体的快速接入和管理

---
_最后更新：2026年2月21日_