# 智能融合引擎V2实现文档

## 概述

本文档描述了第三阶段智能融合与自学习系统的核心组件实现，主要包括智能决策引擎、增强版估值API、用户反馈收集系统等。

## 系统架构

### 核心组件

1. **智能决策引擎 (FusionEngineV2Service)**
   - 动态策略选择：根据置信度自动选择ML、市场加权或规则引擎
   - 多维度置信度评估
   - 可配置参数系统

2. **估值API v2**
   - RESTful API接口
   - 支持多种请求格式
   - 返回详细的策略信息和置信度

3. **用户反馈系统**
   - 数据库表结构设计
   - 行级安全策略
   - 统计分析视图

## 技术实现

### 1. 智能决策引擎

**文件位置**: `src/services/fusion-engine-v2.service.ts`

**核心功能**:

- 并行获取多种估值策略结果
- 综合评估各策略置信度
- 动态选择最优策略
- 记录决策过程和理由

**策略权重配置**:

```typescript
strategyWeights: {
  ml: 0.7,      // ML模型权重 70%
  market: 0.2,  // 市场数据权重 20%
  rule: 0.1     // 规则引擎权重 10%
}
```

**置信度阈值**:

```typescript
confidenceThresholds: {
  high: 0.8,    // 高置信度 ≥ 80%
  medium: 0.6,  // 中等置信度 ≥ 60%
  low: 0.4      // 低置信度 ≥ 40%
}
```

### 2. 估值API v2

**文件位置**: `src/app/api/valuation/v2/route.ts`

**支持的HTTP方法**:

- `POST /api/valuation/v2` - 详细估值请求
- `GET /api/valuation/v2?deviceQrcodeId=xxx` - 简单查询

**响应格式**:

```json
{
  "success": true,
  "data": {
    "finalValue": 4250.0,
    "method": "hybrid",
    "confidenceLevel": "high",
    "confidenceScore": 0.85,
    "deviceInfo": {
      "id": "device_xxx",
      "productModel": "iPhone 14 Pro",
      "brandName": "Apple",
      "productCategory": "智能手机"
    },
    "rationale": "采用加权混合策略(置信度85.0%), ML模型置信度高(82.3%)",
    "metadata": {
      "timestamp": "2026-02-20T10:30:00Z",
      "strategyWeights": { "ml": 0.7, "market": 0.2, "rule": 0.1 }
    }
  },
  "timestamp": "2026-02-20T10:30:00Z"
}
```

### 3. 数据库迁移

**文件位置**: `supabase/migrations/020_create_valuation_feedback_system.sql`

**表结构**:

```sql
CREATE TABLE valuation_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES device_profiles(id),
    valuation_value DECIMAL(10,2) NOT NULL,
    user_feedback VARCHAR(20) CHECK (user_feedback IN ('reasonable', 'unreasonable', 'too_high', 'too_low')),
    feedback_reason TEXT,
    actual_transaction_price DECIMAL(10,2),
    feedback_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    session_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**统计视图**:

- `valuation_feedback_stats` - 设备反馈统计
- `monthly_feedback_trends` - 月度反馈趋势

## 部署和使用

### 1. 数据库迁移

```bash
# 应用数据库迁移
npx supabase migration up
```

### 2. API测试

```bash
# 测试POST请求
curl -X POST http://localhost:3000/api/valuation/v2 \
  -H "Content-Type: application/json" \
  -d '{
    "deviceQrcodeId": "QR_TEST_001",
    "condition": {
      "screen": "minor_scratches",
      "battery": "good",
      "body": "light_wear",
      "functionality": "perfect"
    },
    "includeDetails": true,
    "includeAlternatives": true
  }'

# 测试GET请求
curl "http://localhost:3000/api/valuation/v2?deviceQrcodeId=QR_TEST_001&includeDetails=true"
```

### 3. 服务测试

```bash
# 运行集成测试
npx ts-node tests/integration/test-fusion-engine-v2.js
```

## 配置参数

### 智能决策引擎配置

```typescript
const config = {
  // 置信度阈值
  confidenceThresholds: {
    high: 0.8,
    medium: 0.6,
    low: 0.4,
  },

  // 策略权重
  strategyWeights: {
    ml: 0.7,
    market: 0.2,
    rule: 0.1,
  },

  // 异常检测
  outlierThreshold: 0.5, // 50%价格偏差

  // 最小样本要求
  minSamples: {
    ml: 100,
    market: 5,
  },
};

// 运行时更新配置
fusionEngineV2Service.updateConfig(config);
```

## 监控和维护

### 关键指标

- 策略选择分布
- 置信度水平统计
- 用户反馈满意度
- 模型准确性跟踪

### 日志记录

```typescript
// 决策日志格式
{
  deviceId: "device_xxx",
  model: "iPhone 14 Pro",
  decision: "ml",
  confidence: 0.85,
  value: 4250.00,
  timestamp: "2026-02-20T10:30:00Z"
}
```

## 后续优化方向

1. **A/B测试框架** - 对比不同策略组合效果
2. **在线学习管道** - 自动化模型重新训练
3. **前端反馈集成** - 用户友好的反馈界面
4. **性能优化** - 缓存策略和并发处理
5. **监控告警** - 异常检测和自动通知

## 故障排除

### 常见问题

1. **ML服务不可用**
   - 检查ML模型服务状态
   - 确认网络连接正常
   - 查看健康检查日志

2. **数据库连接失败**
   - 验证Supabase连接配置
   - 检查RLS策略设置
   - 确认表结构正确

3. **API响应异常**
   - 检查请求参数格式
   - 验证设备档案存在性
   - 查看服务端日志

### 调试建议

```bash
# 启用详细日志
export DEBUG=fusion-engine:*

# 检查服务健康状态
curl http://localhost:3000/api/health

# 查看最近决策日志
SELECT * FROM decision_logs ORDER BY created_at DESC LIMIT 10;
```

---

**版本**: 1.0  
**最后更新**: 2026-02-20  
**作者**: AI助手
