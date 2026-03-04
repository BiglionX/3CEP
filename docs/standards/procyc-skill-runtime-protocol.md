# ProCyc Skill 运行时协议规范

**版本**: 1.0.0  
**日期**: 2026-03-03  
**状态**: ✅ 已发布  
**作者**: ProCyc Core Team

---

## 📋 目录

- [概述](#概述)
- [统一请求格式](#统一请求格式)
- [统一响应格式](#统一响应格式)
- [HTTP API 规范](#http-api-规范)
- [本地库调用规范](#本地库调用规范)
- [错误码标准](#错误码标准)
- [鉴权机制](#鉴权机制)
- [速率限制](#速率限制)
- [示例代码](#示例代码)

---

## 概述

本协议定义了 ProCyc Skill 的标准调用方式，支持两种调用模式：

1. **HTTP API**: 适用于远程调用、跨服务通信
2. **本地库**: 适用于 Node.js/Python 项目直接集成

### 设计原则

- **统一性**: 所有技能遵循相同的输入输出格式
- **简洁性**: API 设计直观易懂
- **扩展性**: 支持未来功能扩展
- **兼容性**: 向后兼容旧版本技能

---

## 统一请求格式

### TypeScript 接口定义

```typescript
interface SkillInvocationRequest {
  /** 技能名称（必需） */
  skillName: string;

  /** 技能版本（可选，默认 "latest"） */
  version?: string;

  /** 操作类型（必需） */
  action: 'execute' | 'validate' | 'getMetadata';

  /** 技能参数（必需） */
  parameters: Record<string, any>;

  /** 调用上下文（可选） */
  context?: {
    /** 用户 ID */
    userId?: string;

    /** API Key（用于鉴权和计费） */
    apiKey?: string;

    /** 请求时间戳（毫秒） */
    timestamp: number;

    /** 追踪 ID（用于日志和监控） */
    traceId?: string;

    /** 客户端信息 */
    clientInfo?: {
      platform: 'web' | 'mobile' | 'server';
      userAgent?: string;
      ip?: string;
    };
  };
}
```

### JSON 示例

```json
{
  "skillName": "procyc-find-shop",
  "version": "1.0.0",
  "action": "execute",
  "parameters": {
    "latitude": 39.9042,
    "longitude": 116.4074,
    "radius": 10,
    "limit": 5
  },
  "context": {
    "userId": "user_123",
    "apiKey": "sk_xxxxxxxxxxxx",
    "timestamp": 1709424000000,
    "traceId": "req_abc123",
    "clientInfo": {
      "platform": "web",
      "userAgent": "Mozilla/5.0...",
      "ip": "192.168.1.1"
    }
  }
}
```

---

## 统一响应格式

### TypeScript 接口定义

```typescript
interface SkillInvocationResponse {
  /** 调用是否成功 */
  success: boolean;

  /** 返回数据（成功时包含） */
  data?: any;

  /** 错误信息（失败时包含） */
  error?: {
    /** 错误代码 */
    code: string;

    /** 错误消息 */
    message: string;

    /** 详细错误信息（可选） */
    details?: any;
  };

  /** 元数据（总是包含） */
  metadata: {
    /** 执行时间（毫秒） */
    executionTimeMs: number;

    /** 实际使用的技能版本 */
    version: string;

    /** 响应时间戳（毫秒） */
    timestamp: number;

    /** 追踪 ID（与请求对应） */
    traceId?: string;

    /** 计费信息（如适用） */
    billing?: {
      charged: boolean;
      cost: number;
      currency: 'FCX' | 'CNY' | 'USD';
    };
  };
}
```

### JSON 示例（成功）

```json
{
  "success": true,
  "data": {
    "shops": [
      {
        "id": "shop_001",
        "name": "中关村维修店",
        "address": "中关村大街 1 号",
        "city": "北京",
        "distance": 1.2,
        "phone": "010-12345678",
        "rating": 4.8
      }
    ],
    "total": 15
  },
  "metadata": {
    "executionTimeMs": 45,
    "version": "1.0.0",
    "timestamp": 1709424000050,
    "traceId": "req_abc123",
    "billing": {
      "charged": true,
      "cost": 0.1,
      "currency": "FCX"
    }
  }
}
```

### JSON 示例（失败）

```json
{
  "success": false,
  "error": {
    "code": "SKILL_001",
    "message": "无效的输入参数：latitude 超出范围",
    "details": {
      "field": "latitude",
      "value": 200,
      "constraint": "必须在 -90 到 90 之间"
    }
  },
  "metadata": {
    "executionTimeMs": 5,
    "version": "1.0.0",
    "timestamp": 1709424000010,
    "traceId": "req_abc123"
  }
}
```

---

## HTTP API 规范

### 基础 URL

```
生产环境：https://api.procyc.com/v1
测试环境：https://test-api.procyc.com/v1
```

### 端点定义

#### 1. 执行技能

```http
POST /skills/{skillName}/execute
Content-Type: application/json
Authorization: Bearer {access_token}
X-API-Key: {your_api_key}
X-Skill-Version: {version}  # 可选，默认 latest

{
  "version": "1.0.0",
  "parameters": {...},
  "context": {...}
}
```

#### 2. 验证技能

```http
POST /skills/{skillName}/validate
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "version": "1.0.0",
  "parameters": {...}
}
```

#### 3. 获取元数据

```http
GET /skills/{skillName}/metadata
Authorization: Bearer {access_token}
```

### HTTP 状态码

| 状态码 | 含义                  | 说明           |
| ------ | --------------------- | -------------- |
| 200    | OK                    | 请求成功       |
| 400    | Bad Request           | 参数错误       |
| 401    | Unauthorized          | 未授权         |
| 403    | Forbidden             | 无权限         |
| 404    | Not Found             | 技能不存在     |
| 429    | Too Many Requests     | 请求频率超限   |
| 500    | Internal Server Error | 服务器内部错误 |

### 响应头

```http
HTTP/1.1 200 OK
Content-Type: application/json
X-Skill-Version: 1.0.0
X-Execution-Time-Ms: 45
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1709424060
```

---

## 本地库调用规范

### Node.js 示例

#### 安装

```bash
npm install procyc-find-shop
```

#### 基本使用

```typescript
import FindShopSkill from 'procyc-find-shop';

const skill = new FindShopSkill();

// 执行技能
const result = await skill.execute({
  latitude: 39.9042,
  longitude: 116.4074,
  radius: 10,
  limit: 5,
});

console.log(result.data.shops);

// 验证输入
const validation = await skill.validate({
  latitude: 39.9042,
  longitude: 116.4074,
});

console.log(validation.valid);

// 获取元数据
const metadata = await skill.getMetadata();
console.log(metadata.version);
```

### Python 示例

#### 安装

```bash
pip install procyc-find-shop
```

#### 基本使用

```python
from procyc_find_shop import FindShopSkill

skill = FindShopSkill()

# 执行技能
result = skill.execute({
    "latitude": 39.9042,
    "longitude": 116.4074,
    "radius": 10,
    "limit": 5
})

print(result.data.shops)

# 验证输入
validation = skill.validate({
    "latitude": 39.9042,
    "longitude": 116.4074
})

print(validation.valid)

# 获取元数据
metadata = skill.get_metadata()
print(metadata.version)
```

---

## 错误码标准

### 通用错误码

| 错误码      | 名称                 | 说明         | HTTP 状态码 |
| ----------- | -------------------- | ------------ | ----------- |
| `SKILL_001` | INVALID_PARAMS       | 无效的参数   | 400         |
| `SKILL_002` | UNAUTHORIZED         | 未授权访问   | 401         |
| `SKILL_003` | RATE_LIMITED         | 请求频率超限 | 429         |
| `SKILL_004` | INTERNAL_ERROR       | 内部错误     | 500         |
| `SKILL_005` | NOT_FOUND            | 资源不存在   | 404         |
| `SKILL_006` | EXECUTION_FAILED     | 技能执行失败 | 500         |
| `SKILL_007` | INSUFFICIENT_BALANCE | 余额不足     | 402         |
| `SKILL_008` | VERSION_DEPRECATED   | 版本已废弃   | 410         |
| `SKILL_009` | VALIDATION_FAILED    | 验证失败     | 400         |
| `SKILL_010` | TIMEOUT              | 请求超时     | 408         |

### 错误处理最佳实践

```typescript
try {
  const result = await skill.execute(params);

  if (!result.success) {
    switch (result.error?.code) {
      case 'SKILL_001':
        // 参数错误，提示用户检查输入
        break;
      case 'SKILL_002':
        // 重新认证
        break;
      case 'SKILL_003':
        // 等待后重试
        await sleep(1000);
        break;
      default:
        // 其他错误
        console.error('未知错误:', result.error);
    }
  }
} catch (error) {
  // 捕获异常
  console.error('技能调用失败:', error);
}
```

---

## 鉴权机制

### API Key 认证

适用于服务端调用：

```http
GET /v1/skills/procyc-find-shop/metadata
X-API-Key: sk_xxxxxxxxxxxx
```

### JWT Token 认证

适用于用户会话：

```http
POST /v1/skills/procyc-find-shop/execute
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 获取 Access Token

```typescript
async function getAccessToken(apiKey: string): Promise<string> {
  const response = await fetch('https://api.procyc.com/v1/auth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: apiKey,
      grant_type: 'client_credentials',
    }),
  });

  const data = await response.json();
  return data.access_token;
}
```

---

## 速率限制

### 默认限制

| 用户类型 | 请求/分钟 | 请求/天   | 并发数 |
| -------- | --------- | --------- | ------ |
| 免费用户 | 10        | 500       | 2      |
| 基础版   | 60        | 10,000    | 5      |
| 专业版   | 300       | 100,000   | 20     |
| 企业版   | 1000      | 1,000,000 | 100    |

### 速率限制响应头

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1709424060
Retry-After: 60
```

### 超限处理

```typescript
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000;

  console.log(`速率限制，等待 ${waitTime}ms 后重试`);
  await sleep(waitTime);

  // 重试
  return executeSkill(params);
}
```

---

## 示例代码

### 完整的 HTTP 调用示例

```typescript
class SkillClient {
  private baseUrl = 'https://api.procyc.com/v1';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async executeSkill(
    skillName: string,
    params: Record<string, any>,
    version = 'latest'
  ) {
    const url = `${this.baseUrl}/skills/${skillName}/execute`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        'X-Skill-Version': version,
      },
      body: JSON.stringify({
        version,
        parameters: params,
        context: {
          timestamp: Date.now(),
          traceId: this.generateTraceId(),
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }

    return response.json();
  }

  private generateTraceId(): string {
    return `req_${Math.random().toString(36).substring(2, 15)}`;
  }
}

// 使用示例
const client = new SkillClient('sk_xxxxxxxxxxxx');

const result = await client.executeSkill('procyc-find-shop', {
  latitude: 39.9042,
  longitude: 116.4074,
  radius: 10,
  limit: 5,
});

console.log(result.data.shops);
```

### 批量调用示例

```typescript
async function batchExecuteSkills(
  calls: Array<{
    skillName: string;
    params: Record<string, any>;
  }>
) {
  const promises = calls.map(async ({ skillName, params }) => {
    try {
      const result = await client.executeSkill(skillName, params);
      return { skillName, success: true, data: result.data };
    } catch (error) {
      return {
        skillName,
        success: false,
        error: (error as Error).message,
      };
    }
  });

  return Promise.all(promises);
}

// 使用示例
const results = await batchExecuteSkills([
  {
    skillName: 'procyc-find-shop',
    params: { latitude: 39.9042, longitude: 116.4074 },
  },
  {
    skillName: 'procyc-fault-diagnosis',
    params: { deviceType: 'phone', symptoms: ['无法开机'] },
  },
]);

console.log(results);
```

---

## 附录

### A. 技能元数据 Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["name", "version", "description", "input", "output"],
  "properties": {
    "name": { "type": "string" },
    "version": { "type": "string" },
    "description": { "type": "string" },
    "input": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": { "type": "string" },
              "type": { "type": "string" },
              "required": { "type": "boolean" },
              "description": { "type": "string" }
            }
          }
        }
      }
    },
    "output": { "type": "object" },
    "pricing": { "type": "object" },
    "tags": { "type": "array", "items": { "type": "string" } }
  }
}
```

### B. 变更日志

- **v1.0.0** (2026-03-03): 初始版本发布
  - 统一的请求响应格式
  - HTTP API 和本地库规范
  - 错误码标准
  - 鉴权和速率限制

### C. 相关文档

- [ProCyc Skill 规范 v1.0](./procyc-skill-spec.md)
- [技能分类与标签体系](./procyc-skill-classification.md)
- [CI/CD 配置指南](./procyc-cicd-guide.md)

---

**文档维护**: ProCyc Core Team  
**技术支持**: tech@procyc.com  
**最后更新**: 2026-03-03  
**下次审查**: 2026-04-03
