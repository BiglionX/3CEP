# 机器学习预测服务使用文档

## 概述

机器学习预测服务（ML Prediction Service）是基于大语言模型的轻量级预测系统，为B2B采购和补货提供智能化的需求预测和价格预测服务。

**任务ID**: DATA-303  
**版本**: 1.0.0  
**最后更新**: 2026年2月19日

## 功能特性

### 核心功能

- 🔮 **需求预测**: 基于历史销售数据预测未来需求
- 💰 **价格预测**: 分析历史价格趋势预测未来价格走势
- 🔄 **批量预测**: 支持多个产品的并发预测
- 📊 **智能分析**: 自动生成趋势分析和业务建议
- 🛡️ **错误处理**: 完善的异常处理和降级机制

### 技术特点

- **大模型集成**: 支持DeepSeek、通义千问等主流大语言模型
- **智能提示词**: 自动生成优化的预测提示词模板
- **数据预处理**: 自动清洗和标准化历史数据
- **结果验证**: 智能解析和验证模型输出
- **性能监控**: 实时监控预测性能和准确率

## 系统架构

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   API接口层     │────│   核心服务层     │────│   数据访问层    │
│                 │    │                  │    │                 │
│ • RESTful API   │    │ • 预测引擎       │    │ • Supabase DB   │
│ • 参数验证      │    │ • 数据收集       │    │ • 模型配置      │
│ • 错误处理      │    │ • 提示词生成     │    │ • 日志存储      │
└─────────────────┘    │ • 模型调用       │    └─────────────────┘
                       │ • 结果解析       │
                       │ • 性能监控       │
                       └──────────────────┘
                                │
                       ┌──────────────────┐
                       │   大语言模型     │
                       │                  │
                       │ • DeepSeek       │
                       │ • 通义千问       │
                       │ • 本地降级模型   │
                       └──────────────────┘
```

## 快速开始

### 1. 环境配置

在 `.env` 文件中添加以下配置：

```bash
# 大模型API配置（任选其一）
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions

# 或者使用通义千问
TONGYI_API_KEY=your_tongyi_api_key

# 数据库配置（使用现有配置）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. 数据库初始化

运行数据库迁移脚本：

```bash
npx supabase migration up
```

或者手动执行SQL文件：

```sql
-- 执行 supabase/migrations/021_create_ml_prediction_tables.sql
```

### 3. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm run build
npm start
```

## API接口说明

### 基础信息

- **基础URL**: `http://localhost:3001/api/ml-prediction`
- **认证**: 通过Supabase认证
- **格式**: JSON
- **编码**: UTF-8

### 1. 需求预测

**Endpoint**: `POST /api/ml-prediction`  
**Action**: `predict-demand`

#### 请求参数

```json
{
  "action": "predict-demand",
  "productId": "PROD-001",
  "warehouseId": "warehouse-001",
  "horizonDays": 30,
  "options": {
    "seasonalFactors": ["周末效应", "节假日影响"],
    "externalEvents": ["促销活动", "新品上市"]
  }
}
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "date": "2026-02-20T00:00:00.000Z",
        "quantity": 125,
        "confidence": 0.85,
        "lowerBound": 100,
        "upperBound": 150
      }
    ],
    "summary": {
      "totalQuantity": 3500,
      "averageDaily": 116.67,
      "trend": "increasing",
      "confidence": 0.82
    },
    "analysis": {
      "trendFactors": ["历史增长趋势", "季节性因素"],
      "riskFactors": ["市场需求波动", "供应链风险"],
      "recommendations": ["增加安全库存", "提前备货"]
    }
  },
  "timestamp": "2026-02-19T10:30:00.000Z"
}
```

### 2. 价格预测

**Endpoint**: `POST /api/ml-prediction`  
**Action**: `predict-price`

#### 请求参数

```json
{
  "action": "predict-price",
  "productId": "PROD-001",
  "platform": "taobao",
  "horizonDays": 30,
  "options": {
    "marketConditions": "正常市场环境",
    "competitorActions": "价格竞争激烈"
  }
}
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "predictions": [
      {
        "date": "2026-02-20T00:00:00.000Z",
        "price": 98.5,
        "confidence": 0.78,
        "lowerBound": 92.0,
        "upperBound": 105.0,
        "volumeImpact": "价格上涨可能影响销量"
      }
    ],
    "summary": {
      "priceTrend": "稳定",
      "expectedChange": 2.5,
      "volatilityOutlook": "中",
      "confidence": 0.75
    },
    "marketInsights": {
      "pricingStrategy": "跟随市场价格",
      "timingOpportunities": ["月末促销期", "节假日备货"],
      "competitiveActions": ["监控主要竞争对手价格", "适时调整促销策略"]
    }
  },
  "timestamp": "2026-02-19T10:30:00.000Z"
}
```

### 3. 批量预测

**Endpoint**: `POST /api/ml-prediction`  
**Action**: `batch-predict`

#### 请求参数

```json
{
  "action": "batch-predict",
  "predictions": [
    {
      "action": "predict-demand",
      "productId": "PROD-001",
      "warehouseId": "warehouse-001",
      "horizonDays": 7
    },
    {
      "action": "predict-price",
      "productId": "PROD-001",
      "platform": "jd",
      "horizonDays": 7
    }
  ],
  "parallel": true
}
```

#### 响应示例

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "index": 0,
        "success": true,
        "data": {
          /* 需求预测结果 */
        },
        "metadata": {
          /* 请求元数据 */
        }
      },
      {
        "index": 1,
        "success": true,
        "data": {
          /* 价格预测结果 */
        },
        "metadata": {
          /* 请求元数据 */
        }
      }
    ],
    "summary": {
      "total": 2,
      "successful": 2,
      "failed": 0,
      "successRate": "100.00%"
    }
  },
  "timestamp": "2026-02-19T10:30:00.000Z"
}
```

### 4. 状态查询

**Endpoint**: `GET /api/ml-prediction?action=status`

#### 响应示例

```json
{
  "success": true,
  "data": {
    "serviceStatus": "running",
    "modelConnection": {
      "connected": true,
      "model": "deepseek-chat"
    },
    "databaseConnection": {
      "connected": true
    },
    "supportedModels": ["deepseek-chat", "qwen-plus"],
    "supportedPredictionTypes": ["demand", "price"]
  },
  "timestamp": "2026-02-19T10:30:00.000Z"
}
```

## 错误处理

### 常见错误码

| 错误码                  | HTTP状态 | 说明              |
| ----------------------- | -------- | ----------------- |
| MODEL_API_ERROR         | 500      | 大模型API调用失败 |
| DATA_COLLECTION_ERROR   | 500      | 数据收集失败      |
| PROMPT_GENERATION_ERROR | 500      | 提示词生成失败    |
| RESULT_PARSING_ERROR    | 500      | 结果解析失败      |
| STORAGE_ERROR           | 500      | 存储失败          |

### 错误响应格式

```json
{
  "error": "具体的错误信息",
  "timestamp": "2026-02-19T10:30:00.000Z"
}
```

## 性能指标

### 响应时间基准

- **需求预测**: < 3秒（平均）
- **价格预测**: < 2秒（平均）
- **批量预测**: < 10秒（5个并发）

### 准确率目标

- **需求预测准确率**: ≥ 80%
- **价格预测准确率**: ≥ 75%
- **置信区间覆盖率**: ≥ 90%

## 监控和日志

### 日志级别

- **DEBUG**: 调试信息
- **INFO**: 常规操作信息
- **WARN**: 警告信息
- **ERROR**: 错误信息

### 性能监控

系统自动收集以下指标：

- 预测请求数量
- 成功率统计
- 平均响应时间
- 模型准确率

## 最佳实践

### 1. 数据准备

```javascript
// 确保有足够的历史数据
const minHistoricalDays = 30; // 建议至少30天历史数据
const optimalHistoricalDays = 90; // 最佳90天历史数据
```

### 2. 参数调优

```javascript
// 需求预测推荐配置
const demandOptions = {
  horizonDays: 30, // 预测周期
  seasonalFactors: ['工作日/周末', '季节性'], // 季节性因素
  confidenceLevel: 0.95, // 置信水平
};

// 价格预测推荐配置
const priceOptions = {
  horizonDays: 30,
  marketConditions: '稳定市场',
  competitorAnalysis: true,
};
```

### 3. 错误处理

```javascript
try {
  const result = await mlPredictionService.predictDemand(
    productId,
    warehouseId,
    horizonDays,
    options
  );
  // 处理成功结果
} catch (error) {
  if (error.code === 'MODEL_API_ERROR') {
    // 大模型API问题，可以重试
    console.warn('模型API暂时不可用，使用降级方案');
  } else {
    // 其他错误
    console.error('预测失败:', error.message);
  }
}
```

## 故障排除

### 1. 模型API连接失败

**问题**: 无法连接到大语言模型API  
**解决方案**:

- 检查API密钥配置
- 验证网络连接
- 确认API配额充足

### 2. 数据不足错误

**问题**: 历史数据不足以进行预测  
**解决方案**:

- 延长历史数据收集周期
- 使用模拟数据进行测试
- 调整最小数据要求

### 3. 预测结果异常

**问题**: 预测结果明显不合理  
**解决方案**:

- 检查输入数据质量
- 验证提示词模板
- 分析模型输出格式

## 版本更新日志

### v1.0.0 (2026-02-19)

- ✅ 初始版本发布
- ✅ 需求预测功能
- ✅ 价格预测功能
- ✅ 批量预测支持
- ✅ 完善的错误处理机制
- ✅ 性能监控和日志系统

## 技术支持

如有问题，请联系：

- **技术支持邮箱**: support@company.com
- **文档更新**: 查看最新版本文档
- **GitHub Issues**: 提交问题和建议

---

_本文档由ML预测服务自动生成，最后更新于2026年2月19日_
