# FCX 智能推荐引擎使用指南

## 概述

FCX 智能推荐引擎是一个基于用户行为和地理位置的智能推荐系统，能够为用户提供个性化的维修店、配件和服务推荐。系统采用混合推荐算法，结合协同过滤和大语言模型技术，提供高质量的推荐服务。

## 核心功能

### 1. 用户行为数据收集

- 自动收集用户浏览、搜索、购买、维修等行为数据
- 支持多种行为类型和丰富的上下文信息
- 实时记录用户偏好和兴趣变化

### 2. 智能画像构建

- 自动生成用户画像，包含偏好、行为模式等
- 构建物品画像，涵盖维修店、配件等各类物品
- 支持画像的动态更新和优化

### 3. 多算法推荐

- **协同过滤**: 基于用户相似性和物品相似性推荐
- **大模型推荐**: 集成 DeepSeek 等大语言模型进行智能排序
- **混合推荐**: 综合多种算法优势，提供最佳推荐结果

### 4. 实时推荐服务

- 支持实时个性化推荐
- 提供批量推荐处理能力
- 完善的反馈机制用于持续优化

## API 接口使用

### 基础推荐接口

#### 获取推荐 (GET)

```bash
GET /api/fcx/recommendations?userId={userId}&count=10&location=31.2304,121.4737
```

**参数说明:**

- `userId` (必需): 用户 ID
- `count` (可选): 推荐数量，默认 10
- `location` (可选): 用户位置，格式为"纬度,经度"

**响应示例:**

```json
{
  "success": true,
  "data": {
    "requestId": "rec_1234567890",
    "userId": "user_001",
    "items": [
      {
        "itemId": "shop_apple_store_001",
        "itemType": "repair_shop",
        "score": 95.5,
        "confidence": 0.92,
        "reason": "基于相似用户喜好推荐",
        "rank": 1
      }
    ],
    "algorithm": "hybrid_balanced",
    "processingTimeMs": 145
  }
}
```

#### 生成推荐 (POST)

```bash
POST /api/fcx/recommendations
Content-Type: application/json

{
  "action": "get-recommendations",
  "userId": "user_001",
  "context": {
    "location": { "lat": 31.2304, "lng": 121.4737 },
    "deviceType": "mobile",
    "filters": {
      "categories": ["手机维修", "配件更换"],
      "distanceLimit": 10
    }
  },
  "count": 10
}
```

### 用户行为记录

#### 记录行为

```bash
POST /api/fcx/recommendations
Content-Type: application/json

{
  "action": "record-behavior",
  "userId": "user_001",
  "itemId": "shop_apple_store_001",
  "itemType": "repair_shop",
  "actionType": "view",
  "context": {
    "location": { "lat": 31.2304, "lng": 121.4737 },
    "deviceInfo": "iPhone 15 Pro"
  }
}
```

### 推荐反馈

#### 记录反馈

```bash
POST /api/fcx/recommendations
Content-Type: application/json

{
  "action": "record-feedback",
  "userId": "user_001",
  "recommendationId": "rec_1234567890",
  "itemId": "shop_apple_store_001",
  "rating": 5,
  "feedbackType": "purchase"
}
```

### 批量处理

#### 批量推荐

```bash
POST /api/fcx/recommendations
Content-Type: application/json

{
  "action": "batch-recommend",
  "contexts": [
    { "userId": "user_001", "location": { "lat": 31.2304, "lng": 121.4737 } },
    { "userId": "user_002", "location": { "lat": 30.2304, "lng": 120.4737 } }
  ],
  "count": 5
}
```

## 系统管理接口

### 健康检查

```bash
POST /api/fcx/recommendations
Content-Type: application/json

{
  "action": "health-check"
}
```

### 模型重训练

```bash
POST /api/fcx/recommendations
Content-Type: application/json

{
  "action": "retrain-model",
  "force": true
}
```

### 数据清理

```bash
DELETE /api/fcx/recommendations?days=90
```

## 集成示例

### 前端集成 (React)

```javascript
import { useEffect, useState } from "react";

function RecommendationWidget({ userId, location }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, [userId, location]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/fcx/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get-recommendations",
          userId,
          context: { location },
          count: 5,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setRecommendations(result.data.items);
      }
    } catch (error) {
      console.error("获取推荐失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = async (itemId) => {
    // 记录用户点击行为
    await fetch("/api/fcx/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "record-behavior",
        userId,
        itemId,
        itemType: "repair_shop",
        actionType: "click",
      }),
    });
  };

  if (loading) return <div>加载推荐中...</div>;

  return (
    <div className="recommendations">
      <h3>为您推荐</h3>
      {recommendations.map((item) => (
        <div
          key={item.itemId}
          className="recommendation-item"
          onClick={() => handleItemClick(item.itemId)}
        >
          <h4>{item.reason}</h4>
          <p>推荐指数: {item.score.toFixed(1)}</p>
        </div>
      ))}
    </div>
  );
}
```

### 后端集成 (Node.js)

```javascript
// 推荐服务封装
class RecommendationService {
  constructor() {
    this.baseUrl = "/api/fcx/recommendations";
  }

  async getRecommendations(userId, options = {}) {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "get-recommendations",
        userId,
        ...options,
      }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "推荐服务调用失败");
    }

    return result.data;
  }

  async recordBehavior(behavior) {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "record-behavior",
        ...behavior,
      }),
    });

    return response.json();
  }

  async batchRecommend(userContexts, count = 10) {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "batch-recommend",
        contexts: userContexts,
        count,
      }),
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "批量推荐失败");
    }

    return result.data;
  }
}

// 使用示例
const recommendationService = new RecommendationService();

// 获取用户推荐
const recommendations = await recommendationService.getRecommendations(
  "user_123",
  {
    context: {
      location: { lat: 31.2304, lng: 121.4737 },
      deviceType: "mobile",
    },
    count: 10,
  }
);

// 批量处理多个用户
const batchResults = await recommendationService.batchRecommend([
  { userId: "user_001", location: { lat: 31.2304, lng: 121.4737 } },
  { userId: "user_002", location: { lat: 30.2304, lng: 120.4737 } },
]);
```

## 性能优化建议

### 1. 缓存策略

```javascript
// 推荐结果缓存
const CACHE_TTL = 300; // 5分钟缓存

const getCachedRecommendations = async (userId, cacheKey) => {
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const recommendations = await recommendationService.getRecommendations(
    userId
  );
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(recommendations));
  return recommendations;
};
```

### 2. 预加载策略

```javascript
// 用户登录时预加载推荐
const preloadRecommendations = async (userId) => {
  // 异步预加载，不影响主流程
  setTimeout(async () => {
    try {
      await recommendationService.getRecommendations(userId, { count: 20 });
    } catch (error) {
      console.log("预加载推荐失败:", error);
    }
  }, 1000);
};
```

### 3. 分页加载

```javascript
// 分批加载推荐结果
const loadRecommendationsPaginated = async (
  userId,
  page = 1,
  pageSize = 10
) => {
  const offset = (page - 1) * pageSize;
  const recommendations = await recommendationService.getRecommendations(
    userId,
    {
      count: offset + pageSize,
    }
  );

  return recommendations.items.slice(offset, offset + pageSize);
};
```

## 监控和指标

### 关键性能指标 (KPIs)

- **响应时间**: < 500ms 95%请求
- **推荐准确率**: 目标提升 10%以上
- **点击率 (CTR)**: 目标 > 15%
- **转化率**: 目标 > 5%

### 监控端点

```bash
# 健康检查
GET /api/fcx/recommendations?action=health-check

# 性能指标
GET /api/metrics/recommendation-performance
```

## 故障排除

### 常见问题

1. **推荐结果为空**

   - 检查用户行为数据是否足够
   - 验证用户 ID 是否正确
   - 确认地理位置参数格式

2. **响应时间过长**

   - 检查数据库连接状态
   - 验证缓存是否正常工作
   - 考虑减少推荐数量

3. **推荐质量不佳**
   - 重新训练推荐模型
   - 检查用户画像数据
   - 调整算法权重配置

### 调试工具

```bash
# 运行集成测试
node scripts/test-recommendation-engine.js

# 部署验证
node scripts/deploy-recommendation-engine.js

# 查看系统日志
npm run recommendation:logs
```

## 版本历史

### v1.0.0 (2026-02-19)

- ✅ 初始版本发布
- ✅ 完整的推荐引擎功能
- ✅ 协同过滤和大模型混合算法
- ✅ 完善的 API 接口
- ✅ 全面的测试覆盖

---

如需更多帮助，请联系技术支持团队或查看详细的技术文档。
