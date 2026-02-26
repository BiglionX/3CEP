# FixCycle 移动端 API 设计规范

## 📋 概述

本文档定义 FixCycle 移动端助手的所有 API 接口规范，采用渐进式重构方式，确保与现有系统无缝集成。

## 🏗️ 架构原则

### 1. 版本化管理

```
src/app/api/v1/
├── feed/          # 热点信息流
├── articles/      # 文章相关
├── parts/         # 配件比价
├── shops/         # 维修店铺
├── user/          # 用户中心
├── search/        # 全局搜索
├── upload/        # 资料上传
└── appointments/  # 预约服务
```

### 2. 响应格式标准化

```typescript
interface ApiResponse<T> {
  code: number; // 0成功，非0失败
  message: string; // 响应消息
  data: T; // 业务数据
  timestamp?: string; // 时间戳
}
```

### 3. 认证机制

```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

## 📱 核心 API 接口

### 1. 热点信息流 API

#### 获取热点信息流

```http
GET /api/v1/feed/hot
Authorization: Bearer <token>
```

**请求参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| device_id | string | 否 | 设备 ID，推送相关内容 |
| page | integer | 否 | 页码，默认 1 |
| page_size | integer | 否 | 每页数量，默认 20 |

**响应示例:**

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "list": [
      {
        "id": "hotlink_123",
        "type": "hot_link",
        "title": "iPhone 15 Pro 维修新方案",
        "url": "https://example.com/article/123",
        "source": "tech_blog",
        "device_names": ["iPhone 15 Pro", "iPhone 15"],
        "fault_names": ["屏幕问题", "电池老化"],
        "like_count": 45,
        "is_liked": false,
        "push_reason": "你常修iPhone系列设备"
      }
    ],
    "total": 150,
    "page": 1,
    "page_size": 20
  },
  "timestamp": "2024-02-21T15:30:00Z"
}
```

### 2. 文章相关 API

#### 获取文章详情

```http
GET /api/v1/articles/{id}
Authorization: Bearer <token>
```

**响应示例:**

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": "article_456",
    "title": "iPhone 14 Pro 更换电池完整教程",
    "content": "# 更换步骤\n1. 准备工具...",
    "cover_image": "https://cdn.example.com/image.jpg",
    "author": {
      "id": "user_789",
      "name": "维修专家张师傅",
      "avatar": "https://cdn.example.com/avatar.jpg"
    },
    "devices": [
      {
        "id": "device_apple_14pro",
        "name": "iPhone 14 Pro"
      }
    ],
    "faults": [
      {
        "id": "fault_battery",
        "name": "电池老化"
      }
    ],
    "parts": [
      {
        "id": "part_battery_14pro",
        "name": "iPhone 14 Pro 原装电池",
        "current_price": 299,
        "platform": "淘宝",
        "url": "https://taobao.com/item/123"
      }
    ],
    "related_shops": [
      {
        "id": "shop_abc",
        "name": "苹果官方授权维修中心",
        "distance": 1200,
        "price_estimate": 350
      }
    ],
    "stats": {
      "likes": 128,
      "reads": 1542,
      "adopts": 89
    },
    "is_liked": true,
    "created_at": "2024-02-20T10:30:00Z"
  },
  "timestamp": "2024-02-21T15:30:00Z"
}
```

### 3. 全局搜索 API

#### 全局搜索

```http
GET /api/v1/search?q=iPhone屏幕&type=all&page=1
Authorization: Bearer <token>
```

**请求参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| q | string | 是 | 搜索关键词 |
| type | string | 否 | 搜索类型(all/article/part/shop)，默认 all |
| page | integer | 否 | 页码，默认 1 |
| page_size | integer | 否 | 每页数量，默认 20 |

**响应示例:**

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "total": 145,
    "list": [
      {
        "id": "article_456",
        "type": "article",
        "title": "iPhone 14 Pro 更换屏幕教程",
        "description": "详细的操作步骤和注意事项...",
        "extra": {
          "author": "张师傅",
          "likes": 128,
          "image": "https://cdn.example.com/image.jpg"
        },
        "created_at": "2024-02-20T10:30:00Z"
      },
      {
        "id": "part_screen_14pro",
        "type": "part",
        "title": "iPhone 14 Pro 原装屏幕",
        "description": "适用于iPhone 14 Pro的原装屏幕",
        "extra": {
          "current_price": 899,
          "platform": "淘宝",
          "url": "https://taobao.com/item/789"
        }
      }
    ],
    "page": 1,
    "page_size": 20,
    "query_type": "all"
  },
  "timestamp": "2024-02-21T15:30:00Z"
}
```

### 4. 用户中心 API

#### 获取用户画像

```http
GET /api/v1/user/profile
Authorization: Bearer <token>
```

**响应示例:**

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "张三",
    "avatar": "https://cdn.example.com/avatar.jpg",
    "role": "engineer",
    "sub_roles": ["repair_expert", "part_supplier"],
    "favorite_devices": [
      {
        "id": "device_iphone_14",
        "name": "iPhone 14系列"
      }
    ],
    "favorite_parts": [
      {
        "id": "part_screen",
        "name": "屏幕总成"
      }
    ],
    "favorite_shops": [
      {
        "id": "shop_apple",
        "name": "苹果官方维修",
        "rating": 4.8,
        "city": "北京"
      }
    ],
    "stats": {
      "articles_count": 25,
      "uploads_count": 156,
      "adopts_count": 89,
      "total_reads": 1250,
      "total_likes": 342
    },
    "points": 1250,
    "member_since": "2023-06-15T08:30:00Z",
    "last_active": "2024-02-21T15:25:00Z"
  },
  "timestamp": "2024-02-21T15:30:00Z"
}
```

## 🔄 交互 API

### 1. 点赞接口

```http
POST /api/v1/interact/like
Authorization: Bearer <token>
Content-Type: application/json

{
  "target_id": "hotlink_123",
  "target_type": "hot_link"
}
```

**响应示例:**

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "current_likes": 46,
    "is_liked": true
  },
  "timestamp": "2024-02-21T15:30:00Z"
}
```

## 📊 分页规范

### 统一分页响应格式

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "list": [...],
    "total": 150,
    "page": 1,
    "page_size": 20,
    "total_pages": 8
  },
  "timestamp": "2024-02-21T15:30:00Z"
}
```

### 分页参数

- `page`: 页码，从 1 开始
- `page_size`: 每页数量，范围 1-50，默认 20
- `total`: 总记录数
- `total_pages`: 总页数

## 🛡️ 错误处理

### 标准错误响应

```json
{
  "code": 40001,
  "message": "参数验证失败",
  "data": null,
  "timestamp": "2024-02-21T15:30:00Z"
}
```

### 常见错误码

| 错误码 | 说明           | HTTP 状态码 |
| ------ | -------------- | ----------- |
| 0      | 成功           | 200         |
| 40001  | 参数验证失败   | 400         |
| 40101  | 未授权访问     | 401         |
| 40301  | 权限不足       | 403         |
| 40401  | 资源不存在     | 404         |
| 50001  | 服务器内部错误 | 500         |

## 📈 性能优化

### 1. 缓存策略

- 热点信息流：缓存 5 分钟
- 配件价格：缓存 1 小时
- 店铺信息：缓存 30 分钟
- 用户数据：缓存 10 分钟

### 2. 响应压缩

启用 Gzip 压缩，减少传输体积

### 3. 连接复用

使用 HTTP/2 协议，支持多路复用

## 🔒 安全规范

### 1. 认证安全

- JWT 令牌有效期 24 小时
- 敏感操作需要二次验证
- 定期刷新令牌机制

### 2. 数据安全

- 敏感信息脱敏处理
- HTTPS 加密传输
- 请求频率限制

### 3. 输入验证

- 严格参数校验
- SQL 注入防护
- XSS 攻击防范

## 📞 技术支持

- **API 文档**: https://docs.fixcycle.com/mobile-api
- **技术支持**: dev@fixcycle.com
- **状态监控**: https://status.fixcycle.com

---

_文档版本: v1.0_
_最后更新: 2024 年 2 月 21 日_
