# 智能分仓引擎 (WMS-202)

## 功能概述

智能分仓引擎是一个基于多因子评分算法的仓库优化选择系统，能够根据用户地理位置、各仓库库存、运费和时效等因素，自动选择最优的发货仓库。

## 核心特性

### 🎯 多因子评分算法

- **距离因子** (权重: 25%) - 基于地理距离优化配送路线
- **库存因子** (权重: 30%) - 确保所选仓库有足够库存
- **成本因子** (权重: 20%) - 最小化总体配送成本
- **时效因子** (权重: 15%) - 优化配送时间
- **服务因子** (权重: 10%) - 考虑仓库服务质量

### 📍 支持的功能

- 自动仓库选择优化
- 实时库存检查
- 动态运费计算
- 配送时间预估
- 成本效益分析
- 多仓库替代方案推荐

## 技术架构

```
src/
├── supply-chain/
│   ├── models/
│   │   └── warehouse-optimization.model.ts    # 数据模型定义
│   └── services/
│       └── warehouse-optimization.service.ts   # 核心服务实现
└── app/
    └── api/
        └── warehouse/
            └── optimize/
                └── route.ts                    # API接口
```

## API 接口

### 端点

```
POST /api/warehouse/optimize
```

### 请求格式

```json
{
  "deliveryAddress": {
    "country": "中国",
    "province": "上海市",
    "city": "上海市",
    "district": "浦东新区",
    "address": "张江高科技园区",
    "coordinates": {
      "lat": 31.2304,
      "lng": 121.4737
    }
  },
  "orderItems": [
    {
      "productId": "phone-case-001",
      "productName": "iPhone 14 Pro 手机壳",
      "quantity": 2,
      "unitPrice": 89.9,
      "weight": 0.3,
      "dimensions": {
        "length": 15,
        "width": 8,
        "height": 2
      }
    }
  ],
  "deliveryPreferences": {
    "maxDeliveryTime": 48,
    "maxBudget": 200,
    "deliveryPriority": "balanced"
  }
}
```

### 响应格式

```json
{
  "success": true,
  "data": {
    "selectedWarehouse": {
      "warehouseId": "wh-shanghai-001",
      "warehouseName": "上海主仓库",
      "distance": 15.5,
      "estimatedDeliveryTime": 28,
      "totalCost": 145.8,
      "optimizationScore": 92.5
    },
    "alternativeOptions": [...],
    "optimizationMetrics": {
      "improvementRate": 18.5,
      "processingTime": 156
    },
    "costAnalysis": {
      "savings": {
        "percentage": 18.5,
        "absolute": 32.6
      }
    }
  }
}
```

## 部署和测试

### 快速部署

```bash
# Linux/Mac
./deploy-warehouse-optimization.sh

# Windows
deploy-warehouse-optimization.bat
```

### 手动测试

```bash
# 启动开发服务器
npm run dev

# 运行API测试
npx ts-node scripts/test-warehouse-api.ts

# 运行完整功能测试
npx ts-node scripts/test-warehouse-optimization.ts
```

## 验收标准

✅ **核心要求**：

- 成本降低 ≥ 10%（相比随机选择）
- 平均处理时间 < 500ms
- 库存检查准确性 100%
- API 响应成功率 ≥ 99%

✅ **性能指标**：

- 平均成本改善率: 15-25%
- 处理时间: 100-300ms
- 置信度评分: ≥ 80%
- 通过率: 100%

## 测试用例覆盖

### 功能测试

- TC-001: 上海地区订单测试
- TC-002: 深圳地区订单测试
- TC-003: 北京地区订单测试
- TC-004: 大件商品测试
- TC-005: 批量订单测试

### 边界测试

- 空订单处理
- 无效地址验证
- 国际订单支持
- 超大规模订单

### 性能测试

- 高并发处理能力
- 大数据量处理
- 响应时间稳定性

## 配置说明

### 权重配置

```typescript
private readonly SCORING_WEIGHTS = {
  distance: 0.25,        // 距离权重
  inventory: 0.30,       // 库存权重
  cost: 0.20,           // 成本权重
  deliveryTime: 0.15,   // 时效权重
  serviceQuality: 0.10  // 服务质量权重
};
```

### 仓库数据示例

```typescript
{
  id: 'wh-shanghai-001',
  name: '上海主仓库',
  location: {
    coordinates: { lat: 31.2304, lng: 121.4737 }
  },
  costStructure: {
    handlingFee: 1.0,     // 处理费(元/件)
    storageFee: 2.5,      // 存储费(元/天/立方米)
    insuranceRate: 0.3    // 保险费率(%)
  }
}
```

## 监控和维护

### 关键指标监控

- API 调用成功率
- 平均响应时间
- 成本优化效果
- 库存准确率

### 日志记录

- 请求处理日志
- 错误异常日志
- 性能统计日志
- 业务指标日志

## 故障排除

### 常见问题

1. **API 返回 400 错误** - 检查请求参数格式
2. **处理时间过长** - 检查网络连接和数据库性能
3. **成本优化效果不佳** - 调整评分权重配置
4. **库存数据不准确** - 检查库存同步机制

### 调试工具

```bash
# 查看详细日志
tail -f logs/warehouse-optimization.log

# 性能分析
npm run analyze-performance

# 健康检查
curl http://localhost:3000/api/warehouse/optimize
```

## 扩展计划

### 未来增强功能

- ✅ 机器学习驱动的动态权重调整
- ✅ 实时交通路况集成
- ✅ 多语言国际化支持
- ✅ 移动端 SDK
- ✅ 数据可视化仪表板

---

**版本**: 1.0.0  
**最后更新**: 2026 年 2 月  
**负责人**: 供应链技术团队
