# n8n 工作流规范

## 目录

1. [设计原则](#设计原则)
2. [工作流结构](#工作流结构)
3. [节点规范](#节点规范)
4. [错误处理](#错误处理)
5. [监控告警](#监控告警)
6. [版本管理](#版本管理)
7. [安全规范](#安全规范)

## 设计原则

### 核心设计理念

1. **单一职责原则** - 每个工作流专注于一个业务场景
2. **可重用性** - 通用组件应设计为可复用模块
3. **可观测性** - 内置监控和日志记录
4. **容错性** - 具备完善的错误处理和重试机制
5. **安全性** - 敏感数据保护和访问控制

### 工作流分类

#### 核心业务工作流

- 用户注册流程
- 预约处理流程
- 支付处理流程
- 通知发送流程

#### 数据处理工作流

- 数据同步工作流
- 数据清洗工作流
- 报表生成工作流
- 批量处理工作流

#### 集成工作流

- 第三方 API 集成
- webhook 接收处理
- 消息队列处理
- 文件处理工作流

## 工作流结构

### 标准工作流模板

```json
{
  "name": "用户注册处理流程",
  "nodes": [
    {
      "parameters": {},
      "name": "Start",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "user-registration",
        "responseMode": "lastNode",
        "options": {}
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [450, 300],
      "webhookId": "user-reg-webhook"
    }
  ],
  "connections": {},
  "active": true,
  "settings": {
    "executionOrder": "v1"
  },
  "tags": ["用户管理", "注册流程"]
}
```

### 工作流元数据规范

每个工作流必须包含以下元数据：

```json
{
  "meta": {
    "version": "1.0.0",
    "author": "developer@example.com",
    "created": "2026-02-20T10:00:00Z",
    "updated": "2026-02-20T15:30:00Z",
    "description": "处理用户注册的核心业务流程",
    "businessDomain": "用户管理",
    "criticality": "high",
    "sla": "99.9%",
    "dependencies": ["数据库连接", "邮件服务", "短信服务"]
  }
}
```

## 节点规范

### 命名规范

#### 节点命名约定

```
{功能类型}_{具体动作}_{序号}

示例:
- Http_GetUserProfile_1
- Database_InsertUser_2
- Email_SendWelcome_3
- Function_ProcessData_4
```

#### 变量命名规范

```javascript
// 输入变量
input.userEmail;
input.phoneNumber;
input.appointmentData;

// 输出变量
output.userId;
output.processResult;
output.errorMessage;
```

### 常用节点配置模板

#### HTTP 请求节点

```json
{
  "parameters": {
    "requestMethod": "POST",
    "url": "={{ $parameter['apiBaseUrl'] }}/users",
    "authentication": "oAuth2",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Content-Type",
          "value": "application/json"
        },
        {
          "name": "X-Request-ID",
          "value": "={{ Math.random().toString(36).substr(2, 9) }}"
        }
      ]
    },
    "sendBody": true,
    "bodyContentType": "raw",
    "rawBody": "={{ JSON.stringify($input.all()[0].json) }}",
    "options": {
      "timeout": 30000,
      "redirect": {
        "followRedirects": false
      },
      "response": {
        "responseFormat": "json"
      }
    }
  },
  "name": "Http_CreateUser_1",
  "type": "n8n-nodes-base.httpRequest",
  "retryOnFail": true,
  "maxTries": 3,
  "waitBetweenTries": 1000
}
```

#### 数据库节点

```json
{
  "parameters": {
    "operation": "executeQuery",
    "query": "INSERT INTO users (email, phone, created_at) VALUES ($1, $2, NOW()) RETURNING id",
    "additionalFields": {
      "mode": "single",
      "values": [
        {
          "parameter": [
            {
              "name": "email",
              "value": "={{ $input.first().json.email }}"
            },
            {
              "name": "phone",
              "value": "={{ $input.first().json.phone }}"
            }
          ]
        }
      ]
    }
  },
  "name": "Database_InsertUser_2",
  "type": "n8n-nodes-base.postgres",
  "credentials": {
    "postgres": "production-database"
  }
}
```

#### 条件判断节点

```json
{
  "parameters": {
    "conditions": {
      "boolean": [
        {
          "value1": "={{ $input.first().json.userType }}",
          "operation": "equals",
          "value2": "premium"
        }
      ]
    }
  },
  "name": "Condition_CheckUserType_3",
  "type": "n8n-nodes-base.if"
}
```

## 错误处理

### 统一错误处理框架

```json
{
  "nodes": [
    {
      "parameters": {
        "keepOnlySet": true,
        "values": {
          "string": [
            {
              "name": "error.message",
              "value": "={{ $input.first().json.message || '未知错误' }}"
            },
            {
              "name": "error.code",
              "value": "={{ $input.first().json.code || 'INTERNAL_ERROR' }}"
            },
            {
              "name": "error.timestamp",
              "value": "={{ new Date().toISOString() }}"
            },
            {
              "name": "error.workflow",
              "value": "={{ $('Start').name }}"
            }
          ]
        },
        "options": {}
      },
      "name": "Set_ErrorInfo_1",
      "type": "n8n-nodes-base.set",
      "typeVersion": 1
    },
    {
      "parameters": {
        "mode": "runOnceForEachItem",
        "jsCode": "// 错误日志记录\nconst errorInfo = items[0].json;\n\n// 发送到日志服务\nreturn [{\n  json: {\n    level: 'error',\n    message: errorInfo['error.message'],\n    code: errorInfo['error.code'],\n    timestamp: errorInfo['error.timestamp'],\n    workflow: errorInfo['error.workflow'],\n    itemId: items[0].index\n  }\n}];"
      },
      "name": "Function_LogError_2",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1
    }
  ]
}
```

### 重试策略配置

```json
{
  "retryConfig": {
    "maxAttempts": 3,
    "backoff": {
      "type": "exponential",
      "baseDelay": 1000,
      "maxDelay": 30000
    },
    "retryableErrors": ["ETIMEDOUT", "ECONNRESET", "ENOTFOUND"]
  }
}
```

### 熔断机制

```javascript
// 熔断器实现
const circuitBreaker = {
  failureThreshold: 5,
  timeout: 60000,
  failures: 0,
  lastFailure: null,

  async execute(operation) {
    if (this.failures >= this.failureThreshold) {
      const timeSinceLastFailure = Date.now() - this.lastFailure;
      if (timeSinceLastFailure < this.timeout) {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.failures = 0;
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailure = Date.now();
      throw error;
    }
  },
};
```

## 监控告警

### 关键指标监控

#### 执行统计

```json
{
  "metrics": {
    "executionCount": {
      "type": "counter",
      "description": "工作流执行次数"
    },
    "successRate": {
      "type": "gauge",
      "description": "执行成功率"
    },
    "averageDuration": {
      "type": "histogram",
      "description": "平均执行时间"
    },
    "errorCount": {
      "type": "counter",
      "description": "错误发生次数"
    }
  }
}
```

#### 性能监控

```javascript
// 性能监控中间件
const performanceMonitor = {
  startTime: null,

  start() {
    this.startTime = Date.now();
  },

  end() {
    const duration = Date.now() - this.startTime;
    // 发送性能指标到监控系统
    this.sendMetric('workflow_duration_ms', duration);
    return duration;
  },

  sendMetric(name, value) {
    // 集成Prometheus或其他监控系统
    console.log(`METRIC: ${name} = ${value}`);
  },
};
```

### 告警规则配置

```yaml
alerts:
  - name: workflow_failure_rate
    condition: failure_rate > 5%
    duration: 5m
    severity: critical
    notification:
      - email: devops@company.com
      - slack: '#alerts'

  - name: execution_timeout
    condition: avg_duration > 30s
    duration: 10m
    severity: warning
    notification:
      - email: team@company.com

  - name: high_error_volume
    condition: error_count > 100
    duration: 1m
    severity: critical
    notification:
      - pagerduty: true
```

### 健康检查端点

```javascript
// 工作流健康检查
module.exports = async function () {
  return [
    {
      json: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        workflow: this.workflowId,
        version: process.env.WORKFLOW_VERSION || '1.0.0',
        dependencies: {
          database: await checkDatabaseConnection(),
          redis: await checkRedisConnection(),
          externalApis: await checkExternalApis(),
        },
      },
    },
  ];
};

async function checkDatabaseConnection() {
  try {
    // 数据库连接测试
    return { status: 'ok', latency: 50 };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}
```

## 版本管理

### 版本控制策略

#### 语义化版本控制

```
MAJOR.MINOR.PATCH

示例:
1.0.0 - 初始版本
1.1.0 - 新增功能
1.1.1 - Bug修复
2.0.0 - 重大重构
```

#### 版本标签规范

```json
{
  "versionTags": {
    "stable": "生产环境稳定版本",
    "beta": "测试环境版本",
    "dev": "开发环境版本",
    "deprecated": "已弃用版本"
  }
}
```

### 变更管理

#### 变更日志格式

```markdown
## [1.2.0] - 2026-02-20

### 新增功能

- 添加用户画像分析节点
- 集成 AI 推荐引擎

### 优化改进

- 优化数据库查询性能
- 改进错误处理机制

### Bug 修复

- 修复并发处理问题
- 修正数据验证逻辑

### 破坏性变更

- 移除旧版 API 支持
- 更改输出数据格式
```

#### 回滚机制

```bash
# 版本回滚脚本
#!/bin/bash

VERSION=$1
WORKFLOW_NAME=$2

# 备份当前版本
n8n export:workflow --id=$WORKFLOW_NAME --output=backup_${WORKFLOW_NAME}_$(date +%Y%m%d_%H%M%S).json

# 导入指定版本
n8n import:workflow --input=versions/${WORKFLOW_NAME}_${VERSION}.json

# 验证回滚结果
n8n execute:workflow --id=$WORKFLOW_NAME --test
```

## 安全规范

### 访问控制

#### API 密钥管理

```json
{
  "security": {
    "apiKey": {
      "storage": "encrypted_vault",
      "rotation": "90_days",
      "permissions": {
        "read": ["authenticated"],
        "write": ["admin"],
        "execute": ["service_account"]
      }
    }
  }
}
```

#### OAuth2 集成

```json
{
  "oauth2": {
    "provider": "custom",
    "authorizationUrl": "https://auth.company.com/oauth/authorize",
    "tokenUrl": "https://auth.company.com/oauth/token",
    "scope": ["read:workflows", "write:workflows"],
    "clientId": "{{ secrets.OAUTH_CLIENT_ID }}",
    "clientSecret": "{{ secrets.OAUTH_CLIENT_SECRET }}"
  }
}
```

### 数据保护

#### 敏感数据处理

```javascript
// 数据脱敏函数
function sanitizeData(data) {
  const sanitized = { ...data };

  // 脱敏手机号
  if (sanitized.phone) {
    sanitized.phone = sanitized.phone.replace(
      /(\d{3})\d{4}(\d{4})/,
      '$1****$2'
    );
  }

  // 脱敏邮箱
  if (sanitized.email) {
    const [name, domain] = sanitized.email.split('@');
    sanitized.email = `${name.substring(0, 2)}***@${domain}`;
  }

  // 移除敏感字段
  delete sanitized.password;
  delete sanitized.ssn;

  return sanitized;
}
```

#### 加密传输

```json
{
  "encryption": {
    "inTransit": {
      "protocol": "TLS 1.3",
      "certValidation": true
    },
    "atRest": {
      "algorithm": "AES-256-GCM",
      "keyManagement": "AWS KMS"
    }
  }
}
```

### 审计日志

```javascript
// 审计日志记录
const auditLogger = {
  log(event, details) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      eventId: crypto.randomUUID(),
      eventType: event,
      userId: details.userId || 'system',
      workflowId: details.workflowId,
      ipAddress: details.ipAddress,
      userAgent: details.userAgent,
      details: details.payload,
    };

    // 发送到审计日志系统
    this.sendToAuditSystem(auditEntry);
  },

  sendToAuditSystem(entry) {
    // 集成SIEM系统
    console.log('AUDIT:', JSON.stringify(entry));
  },
};
```

## 最佳实践

### 开发实践

#### 本地开发环境

```bash
# 启动本地n8n开发环境
docker-compose -f docker-compose.n8n-dev.yml up -d

# 导入开发工作流
n8n import:workflow --input=workflows/dev/user-registration-dev.json

# 运行测试
npm run test:n8n-workflows
```

#### 测试策略

```javascript
// 工作流测试用例
const testCases = [
  {
    name: '正常用户注册',
    input: { email: 'test@example.com', phone: '13800138000' },
    expected: { status: 'success', userId: expect.any(String) },
  },
  {
    name: '重复邮箱注册',
    input: { email: 'existing@example.com', phone: '13800138001' },
    expected: { status: 'error', code: 'EMAIL_EXISTS' },
  },
];
```

### 部署实践

#### CI/CD 集成

```yaml
# GitHub Actions 工作流
name: Deploy n8n Workflows

on:
  push:
    branches: [main]
    paths:
      - 'n8n-workflows/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Validate workflows
        run: |
          npm run validate:n8n-workflows

      - name: Deploy to staging
        run: |
          npm run deploy:n8n-staging

      - name: Run integration tests
        run: |
          npm run test:n8n-integration

      - name: Deploy to production
        if: success()
        run: |
          npm run deploy:n8n-prod
```

#### 灰度发布

```bash
# 灰度发布脚本
#!/bin/bash

PERCENTAGE=$1  # 1-100
WORKFLOW_ID=$2

# 更新工作流权重
curl -X PATCH "https://n8n.company.com/api/workflows/$WORKFLOW_ID" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"traffic_percentage\": $PERCENTAGE}"

# 监控关键指标
while [ $(get_error_rate) -gt 1 ]; do
  echo "Error rate too high, reducing traffic..."
  # 调整流量分配
done
```

---

_最后更新: 2026-02-20_
_版本: 1.0.0_
