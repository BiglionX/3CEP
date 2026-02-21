# 系统架构图

## 目录

1. [整体架构](#整体架构)
2. [数据流向图](#数据流向图)
3. [事件流架构](#事件流架构)
4. [微服务架构](#微服务架构)
5. [部署架构](#部署架构)

## 整体架构

### 高层次架构视图

```mermaid
graph TB
    subgraph "客户端层"
        A[Web浏览器] --> B[移动App]
        B --> C[管理后台]
    end

    subgraph "接入层"
        D[API网关] --> E[负载均衡器]
        E --> F[SSL终止]
    end

    subgraph "应用服务层"
        G[Next.js前端服务]
        H[Supabase后端服务]
        I[n8n工作流引擎]
        J[Redis缓存服务]
    end

    subgraph "数据存储层"
        K[(PostgreSQL数据库)]
        L[(Redis缓存)]
        M[对象存储]
    end

    subgraph "第三方服务"
        N[支付网关]
        O[短信服务]
        P[邮件服务]
        Q[地图API]
    end

    A --> D
    B --> D
    C --> D
    D --> G
    D --> H
    D --> I
    G --> J
    H --> K
    I --> K
    J --> L
    H --> M
    H --> N
    I --> O
    I --> P
    G --> Q
```

### 技术栈架构图

```mermaid
graph LR
    subgraph "前端技术栈"
        FE1[React 18]
        FE2[Next.js 14]
        FE3[TailwindCSS]
        FE4[TypeScript]
    end

    subgraph "后端技术栈"
        BE1[Supabase]
        BE2[PostgreSQL]
        BE3[Node.js]
        BE4[RESTful API]
    end

    subgraph "自动化层"
        AUTO1[n8n]
        AUTO2[工作流引擎]
        AUTO3[定时任务]
        AUTO4[事件驱动]
    end

    subgraph "基础设施"
        INFRA1[Docker]
        INFRA2[Kubernetes]
        INFRA3[AWS/GCP]
        INFRA4[CI/CD]
    end

    FE1 --> BE1
    BE1 --> AUTO1
    AUTO1 --> INFRA1
```

## 数据流向图

### 用户预约流程数据流

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端应用
    participant G as API网关
    participant A as 预约服务
    participant W as n8n工作流
    participant D as 数据库
    participant N as 通知服务

    U->>F: 提交预约请求
    F->>G: POST /api/appointments
    G->>A: 验证请求
    A->>D: 查询可用时段
    D-->>A: 返回可用时间
    A->>D: 创建预约记录
    D-->>A: 返回预约ID
    A->>W: 触发预约确认工作流
    W->>N: 发送确认通知
    N->>U: 发送短信/邮件
    W-->>A: 工作流执行结果
    A-->>G: 返回预约详情
    G-->>F: 201 Created
    F-->>U: 显示预约成功
```

### 数据同步流程

```mermaid
flowchart TD
    A[外部数据源] --> B[数据采集服务]
    B --> C[数据验证]
    C --> D{验证通过?}
    D -->|是| E[数据转换]
    D -->|否| F[错误处理]
    E --> G[数据存储]
    G --> H[缓存更新]
    H --> I[索引重建]
    I --> J[通知订阅者]
    F --> K[记录错误日志]
    K --> L[告警通知]
```

### 批处理数据流

```mermaid
graph LR
    subgraph "数据输入"
        A[CSV文件上传]
        B[API批量导入]
        C[数据库导出]
    end

    subgraph "处理管道"
        D[数据清洗]
        E[格式转换]
        F[数据验证]
        G[去重处理]
    end

    subgraph "存储输出"
        H[(主数据库)]
        I[(数据仓库)]
        J[报表系统]
    end

    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    G --> I
    I --> J
```

## 事件流架构

### 事件驱动架构

```mermaid
graph TB
    subgraph "事件生产者"
        EP1[用户服务]
        EP2[预约服务]
        EP3[支付服务]
        EP4[库存服务]
    end

    subgraph "消息队列"
        MQ1[RabbitMQ]
        MQ2[Redis Streams]
        MQ3[Kafka]
    end

    subgraph "事件消费者"
        EC1[通知服务]
        EC2[统计服务]
        EC3[搜索引擎]
        EC4[数据同步]
    end

    subgraph "事件存储"
        ES[事件溯源数据库]
    end

    EP1 --> MQ1
    EP2 --> MQ2
    EP3 --> MQ3
    EP4 --> MQ1

    MQ1 --> EC1
    MQ2 --> EC2
    MQ3 --> EC3
    MQ1 --> EC4

    MQ1 --> ES
    MQ2 --> ES
    MQ3 --> ES
```

### 核心事件类型

#### 用户相关事件

```yaml
用户事件:
  user.created:
    payload:
      userId: string
      email: string
      createdAt: timestamp
    routingKey: user.lifecycle

  user.updated:
    payload:
      userId: string
      changes: object
      updatedAt: timestamp
    routingKey: user.lifecycle

  user.deleted:
    payload:
      userId: string
      deletedAt: timestamp
    routingKey: user.lifecycle
```

#### 预约相关事件

```yaml
预约事件:
  appointment.created:
    payload:
      appointmentId: string
      userId: string
      shopId: string
      scheduledTime: timestamp
    routingKey: appointment.lifecycle

  appointment.confirmed:
    payload:
      appointmentId: string
      confirmedAt: timestamp
    routingKey: appointment.lifecycle

  appointment.cancelled:
    payload:
      appointmentId: string
      cancelledAt: timestamp
      reason: string
    routingKey: appointment.lifecycle
```

### 事件处理流程

```mermaid
sequenceDiagram
    participant S as 服务层
    participant E as 事件总线
    participant Q as 消息队列
    participant C as 消费者
    participant L as 日志系统

    S->>E: 发布事件 appointment.created
    E->>Q: 入队事件消息
    Q->>C: 推送事件给消费者
    C->>L: 记录处理日志
    C->>C: 执行业务逻辑
    C-->>E: 确认处理完成
    E-->>S: 返回处理结果
```

## 微服务架构

### 服务拆分架构

```mermaid
graph TB
    subgraph "API网关层"
        GW[API Gateway]
    end

    subgraph "核心服务"
        US[用户服务]
        AS[预约服务]
        PS[支付服务]
        NS[通知服务]
    end

    subgraph "业务服务"
        SS[店铺服务]
        IS[库存服务]
        RS[报表服务]
        CS[客服服务]
    end

    subgraph "支撑服务"
        ASvc[认证服务]
        LS[日志服务]
        MS[监控服务]
        CSvc[配置服务]
    end

    subgraph "数据层"
        DB[(主数据库)]
        Cache[(缓存)]
        ES[(Elasticsearch)]
    end

    GW --> US
    GW --> AS
    GW --> PS
    GW --> NS
    GW --> SS
    GW --> IS
    GW --> RS
    GW --> CS

    US --> DB
    AS --> DB
    PS --> DB
    NS --> DB
    SS --> DB
    IS --> DB

    US --> Cache
    AS --> Cache
    IS --> Cache

    RS --> ES
    NS --> ES

    US --> ASvc
    AS --> ASvc
    PS --> ASvc
```

### 服务间通信

```mermaid
graph LR
    subgraph "同步通信"
        A[REST API]
        B[gRPC]
        C[GraphQL]
    end

    subgraph "异步通信"
        D[消息队列]
        E[事件总线]
        F[WebSocket]
    end

    A --> D
    B --> E
    C --> F
```

### 服务发现与负载均衡

```yaml
服务注册中心:
  type: Consul/Eureka
  features:
    - 服务注册与发现
    - 健康检查
    - 负载均衡
    - 配置管理

负载均衡策略:
  - 轮询(Round Robin)
  - 加权轮询
  - 最少连接
  - IP哈希
  - 响应时间加权
```

## 部署架构

### 容器化部署架构

```mermaid
graph TB
    subgraph "云平台"
        CP[AWS/GCP/Azure]
    end

    subgraph "容器编排"
        KO[Kubernetes集群]
        HELM[Helm Charts]
    end

    subgraph "服务网格"
        ISTIO[Istio Service Mesh]
        KIALI[Kiali Dashboard]
    end

    subgraph "监控告警"
        PROM[Prometheus]
        GRAF[Grafana]
        ALERT[AlertManager]
    end

    subgraph "日志系统"
        EFK[EFK Stack]
        LOKI[Loki]
    end

    CP --> KO
    KO --> HELM
    KO --> ISTIO
    ISTIO --> KIALI
    KO --> PROM
    PROM --> GRAF
    PROM --> ALERT
    KO --> EFK
    KO --> LOKI
```

### 多环境部署拓扑

```mermaid
graph TB
    subgraph "开发环境"
        DEV[Dev Cluster]
        DEV_NS[dev Namespace]
    end

    subgraph "测试环境"
        TEST[Test Cluster]
        TEST_NS[test Namespace]
    end

    subgraph "预生产环境"
        STAGING[Staging Cluster]
        STAGING_NS[staging Namespace]
    end

    subgraph "生产环境"
        PROD[Prod Cluster]
        PROD_NS[prod Namespace]
        PROD_HA[高可用副本]
    end

    DEV --> TEST
    TEST --> STAGING
    STAGING --> PROD
```

### 网络安全架构

```mermaid
graph LR
    subgraph "外部访问"
        INTERNET[互联网]
    end

    subgraph "边界防护"
        WAF[Web应用防火墙]
        CDN[CDN加速]
        FIREWALL[防火墙]
    end

    subgraph "内部网络"
        INGRESS[Ingress控制器]
        SVC_MESH[服务网格]
        PODS[应用Pods]
    end

    subgraph "数据安全"
        VAULT[密钥管理]
        ENCRYPT[数据加密]
        AUDIT[审计日志]
    end

    INTERNET --> WAF
    WAF --> CDN
    CDN --> FIREWALL
    FIREWALL --> INGRESS
    INGRESS --> SVC_MESH
    SVC_MESH --> PODS
    PODS --> VAULT
    PODS --> ENCRYPT
    PODS --> AUDIT
```

### 灾备架构

```mermaid
graph TB
    subgraph "主数据中心"
        DC1[主DC]
        DC1_APP[应用服务]
        DC1_DB[主数据库]
        DC1_CACHE[缓存集群]
    end

    subgraph "灾备数据中心"
        DC2[备DC]
        DC2_APP[备用应用]
        DC2_DB[备用数据库]
        DC2_CACHE[备用缓存]
    end

    subgraph "数据同步"
        SYNC[实时同步]
        BACKUP[定期备份]
        DR[灾难恢复]
    end

    DC1_DB --> SYNC
    SYNC --> DC2_DB
    DC1 --> BACKUP
    BACKUP --> DC2
    DC1 --> DR
    DR --> DC2
```

## 性能架构

### 缓存架构

```mermaid
graph TB
    subgraph "应用层缓存"
        L1[本地缓存]
        L2[分布式缓存]
    end

    subgraph "数据库层缓存"
        QUERY[查询缓存]
        RESULT[结果缓存]
    end

    subgraph "CDN层缓存"
        STATIC[静态资源]
        DYNAMIC[动态内容]
    end

    subgraph "缓存策略"
        TTL[TTL策略]
        LRU[LRU算法]
        WRITE_THROUGH[写透模式]
        WRITE_BACK[回写模式]
    end

    L1 --> QUERY
    L2 --> RESULT
    STATIC --> L1
    DYNAMIC --> L2
```

### 扩展性架构

```yaml
水平扩展:
  应用层:
    - 无状态设计
    - 容器化部署
    - 自动扩缩容

  数据层:
    - 读写分离
    - 分库分表
    - 数据分区

垂直扩展:
  计算资源:
    - CPU增强
    - 内存扩容
    - 存储升级

  网络资源:
    - 带宽扩容
    - CDN加速
    - 边缘计算
```

## 安全架构

### 零信任安全模型

```mermaid
graph LR
    subgraph "身份认证"
        AUTH[身份验证]
        MFA[多因素认证]
        SSO[单点登录]
    end

    subgraph "访问控制"
        RBAC[基于角色]
        ABAC[基于属性]
        POLICY[策略引擎]
    end

    subgraph "网络安全"
        SEGMENT[网络分段]
        ENCRYPTION[端到端加密]
        INSPECTION[流量检测]
    end

    subgraph "数据保护"
        DLP[数据防泄漏]
        MASKING[数据脱敏]
        BACKUP[安全备份]
    end

    AUTH --> RBAC
    MFA --> ABAC
    SSO --> POLICY
    SEGMENT --> ENCRYPTION
    ENCRYPTION --> INSPECTION
    DLP --> MASKING
    MASKING --> BACKUP
```

### 安全监控体系

```yaml
安全监控:
  威胁检测:
    - 入侵检测系统(IDS)
    - 异常行为分析
    - 漏洞扫描

  合规监控:
    - GDPR合规检查
    - 数据保护审计
    - 访问日志分析

  响应机制:
    - 安全事件响应
    - 自动隔离机制
    - 应急恢复预案
```

---

_架构图更新日期: 2026-02-20_
_架构版本: v2.1.0_
