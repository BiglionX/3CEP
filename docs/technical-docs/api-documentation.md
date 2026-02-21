# FixCycle API 接口文档

## 📋 概述

本文档详细描述 FixCycle 平台提供的 RESTful API 接口，包括认证授权、核心业务接口和系统管理接口。

## 🔐 认证授权

### JWT Token 认证
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

### 获取访问令牌
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "张三"
    }
  }
}
```

## 🛠️ 核心业务 API

### 1. 设备管理接口

#### 获取用户设备列表
```http
GET /api/devices?userId={userId}&page=1&limit=10
Authorization: Bearer <token>
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "id": "device-uuid",
        "brand": "Apple",
        "model": "iPhone 14 Pro",
        "purchaseDate": "2023-01-15",
        "warrantyStatus": "active",
        "lifecycleEvents": [...]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

#### 创建设备档案
```http
POST /api/devices
Authorization: Bearer <token>
Content-Type: application/json

{
  "brand": "Samsung",
  "model": "Galaxy S23",
  "purchaseDate": "2024-01-20",
  "serialNumber": "SN123456789",
  "warrantyInfo": {
    "startDate": "2024-01-20",
    "endDate": "2025-01-20",
    "provider": "Samsung"
  }
}
```

### 2. 智能估价接口

#### 设备估价请求
```http
POST /api/valuation/estimate
Authorization: Bearer <token>
Content-Type: application/json

{
  "deviceId": "device-uuid",
  "condition": {
    "screen": "good",
    "battery": "normal",
    "body": "minor_scratches",
    "functionality": "full"
  },
  "usageMonths": 18,
  "accessories": ["charger", "case"]
}
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "estimatedValue": 2850,
    "confidence": 0.87,
    "strategyUsed": "ml_fusion",
    "priceRange": {
      "min": 2600,
      "max": 3100
    },
    "marketReference": {
      "averagePrice": 2900,
      "trend": "stable"
    },
    "recommendations": [
      "建议通过官方渠道回收",
      "当前市场价格较为稳定"
    ]
  }
}
```

### 3. 维修服务接口

#### 搜索附近维修店
```http
GET /api/repair/shops?lat=39.9042&lng=116.4074&radius=5&page=1
Authorization: Bearer <token>
```

#### 创建维修订单
```http
POST /api/repair/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "deviceId": "device-uuid",
  "shopId": "shop-uuid",
  "serviceType": "screen_replacement",
  "problemDescription": "屏幕碎裂，需要更换",
  "preferredTime": "2024-02-25T10:00:00Z",
  "contactInfo": {
    "name": "张三",
    "phone": "13800138000",
    "address": "北京市朝阳区xxx街道"
  }
}
```

### 4. 众筹平台接口

#### 获取众筹项目列表
```http
GET /api/crowdfunding/projects?category=smartphone&page=1&limit=12
Authorization: Bearer <token>
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "project-uuid",
        "title": "全新智能手机配件众筹",
        "description": "一款专为现代智能手机设计的多功能保护壳",
        "productModel": "SmartPhone-Pro-X1",
        "oldModels": ["iPhone 14", "iPhone 15", "Samsung Galaxy S23"],
        "targetAmount": 50000,
        "currentAmount": 15000,
        "progressPercentage": 30,
        "minPledgeAmount": 99,
        "category": "手机配件",
        "coverImageUrl": "https://example.com/image.jpg",
        "startDate": "2024-02-01",
        "endDate": "2024-03-01",
        "status": "active"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 45,
      "totalPages": 4
    }
  }
}
```

#### 支持众筹项目
```http
POST /api/crowdfunding/pledges
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "project-uuid",
  "amount": 199,
  "rewardId": "reward-uuid",
  "paymentMethod": "fcx", // or "mixed", "fiat"
  "deliveryAddress": {
    "name": "张三",
    "phone": "13800138000",
    "address": "北京市朝阳区xxx街道"
  }
}
```

### 5. FCX积分系统接口

#### 查询用户FCX余额
```http
GET /api/fcx/balance?userId={userId}
Authorization: Bearer <token>
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "fcxBalance": 1500,
    "fcx2Balance": 2800,
    "totalValue": 43, // 43 USD equivalent
    "lastUpdated": "2024-02-21T10:30:00Z"
  }
}
```

#### FCX积分消费
```http
POST /api/fcx/spend
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 500, // 消费500 FCX
  "transactionType": "repair_payment",
  "referenceId": "order-uuid"
}
```

## 📊 数据查询 API

### 1. 设备生命周期查询

#### 获取设备完整生命周期
```http
GET /api/lifecycle/device/{deviceId}
Authorization: Bearer <token>
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "deviceProfile": {
      "id": "device-uuid",
      "brand": "Apple",
      "model": "iPhone 14 Pro",
      "purchaseDate": "2023-01-15"
    },
    "lifecycleEvents": [
      {
        "eventType": "purchase",
        "timestamp": "2023-01-15T10:00:00Z",
        "details": {
          "retailer": "Apple Store",
          "price": 7999
        }
      },
      {
        "eventType": "repair",
        "timestamp": "2023-08-20T14:30:00Z",
        "details": {
          "shopId": "shop-uuid",
          "service": "screen_replacement",
          "cost": 800
        }
      }
    ],
    "statistics": {
      "totalRepairs": 2,
      "totalSpent": 1200,
      "avgRepairInterval": 180,
      "deviceAgeDays": 371
    }
  }
}
```

### 2. 市场数据分析

#### 获取配件价格趋势
```http
GET /api/market/prices?partId={partId}&period=30d
Authorization: Bearer <token>
```

## ⚙️ 系统管理 API

### 1. 用户管理

#### 获取用户列表
```http
GET /api/admin/users?page=1&limit=20&status=active
Authorization: Bearer <admin-token>
```

#### 更新用户状态
```http
PATCH /api/admin/users/{userId}
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "suspended",
  "reason": "违反社区规定"
}
```

### 2. 维修店管理

#### 审核维修店入驻申请
```http
POST /api/admin/shops/{shopId}/approve
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "approved": true,
  "comments": "资质齐全，符合入驻标准"
}
```

### 3. 系统监控

#### 获取系统健康状态
```http
GET /api/health
```

**响应示例:**
```json
{
  "status": "healthy",
  "timestamp": "2024-02-21T11:00:00Z",
  "services": {
    "database": "online",
    "cache": "online",
    "externalApis": "online"
  },
  "metrics": {
    "uptime": 86400,
    "memoryUsage": 0.65,
    "cpuLoad": 0.23
  }
}
```

## 📞 错误处理

### 标准错误响应格式
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数验证失败",
    "details": {
      "field": "email",
      "reason": "邮箱格式不正确"
    }
  }
}
```

### 常见错误码
| 错误码 | 说明 | HTTP状态码 |
|--------|------|------------|
| AUTH_REQUIRED | 需要身份认证 | 401 |
| PERMISSION_DENIED | 权限不足 | 403 |
| RESOURCE_NOT_FOUND | 资源不存在 | 404 |
| VALIDATION_ERROR | 参数验证失败 | 400 |
| RATE_LIMIT_EXCEEDED | 请求频率超限 | 429 |
| INTERNAL_ERROR | 服务器内部错误 | 500 |

## 🔄 分页和过滤

### 分页参数
```http
GET /api/resources?page=1&limit=20&sort=createdAt:desc
```

### 过滤参数
```http
GET /api/devices?brand=Apple&model=iPhone*&status=active
```

## 📈 速率限制

API调用频率限制：
- 普通用户：100次/分钟
- 认证用户：500次/分钟  
- 管理员：2000次/分钟

## 🛡️ 安全最佳实践

1. **始终使用HTTPS**传输敏感数据
2. **妥善保管JWT令牌**，避免泄露
3. **实施适当的身份验证**检查
4. **验证所有输入参数**防止注入攻击
5. **遵循最小权限原则**访问资源

## 📞 技术支持

如有API使用问题，请联系：
- **技术支持邮箱**：tech@fixcycle.com
- **开发者文档**：https://docs.fixcycle.com
- **API状态页面**：https://status.fixcycle.com

---

*API版本: v1.0*  
*最后更新: 2024年2月21日*
