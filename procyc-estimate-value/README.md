# procyc-estimate-value

基于设备档案和市场数据的 3C 设备智能估价 ProCyc Skill。

## 功能特性

- 🤖 **AI 驱动**: 基于 FixCycle 估值引擎的智能算法
- 📊 **多维度评估**: 考虑品牌、成色、年龄、维修历史等因素
- 💰 **市场对比**: 提供市场价格参考和置信度分析
- 📈 **详细分解**: 透明的估值计算过程
- 🔄 **实时更新**: 集成最新市场数据

## 安装

```bash
npm install procyc-estimate-value
```

## 快速开始

### 基础用法

```typescript
import { EstimateValueSkill } from 'procyc-estimate-value';

const skill = new EstimateValueSkill();

const result = await skill.execute({
  deviceQrcodeId: 'qr_iphone14pro_001',
});

console.log(`设备估值：¥${result.data.valuation.finalValue}`);
```

### 获取详细分解

```typescript
const result = await skill.execute({
  deviceQrcodeId: 'qr_macbook_air_m2_001',
  includeBreakdown: true,
  useMarketData: true,
});

console.log('估值详情:', result.data.breakdown);
```

## API 参考

### 输入参数

| 参数名           | 类型    | 必填 | 描述                                |
| ---------------- | ------- | ---- | ----------------------------------- |
| deviceQrcodeId   | string  | ✅   | 设备二维码 ID（来自 FixCycle 系统） |
| includeBreakdown | boolean | ❌   | 是否包含详细估值分解（默认 true）   |
| useMarketData    | boolean | ❌   | 是否使用市场价格数据（默认 true）   |
| currency         | string  | ❌   | 货币单位（CNY/FCX/USD，默认 CNY）   |

### 输出结果

```typescript
interface EstimateValueOutput {
  success: boolean;
  data: {
    deviceInfo: {
      qrcodeId: string;
      productModel: string;
      brandName: string;
      productCategory: string;
      manufacturingDate?: string;
      purchasePrice?: number;
    };
    valuation: {
      baseValue: number;
      componentScore: number;
      conditionMultiplier: number;
      finalValue: number;
      currency: string;
    };
    breakdown?: {
      originalPrice: number;
      depreciation: number;
      componentAdjustment: number;
      conditionAdjustment: number;
      brandAdjustment: number;
      ageAdjustment: number;
      repairAdjustment: number;
    };
    marketComparison?: {
      marketAveragePrice: number;
      priceRange: { min: number; max: number };
      confidence: number;
    };
  } | null;
  error?: { code: string; message: string };
  metadata: {
    executionTimeMs: number;
    timestamp: string;
    version: string;
    dataSource: string;
    algorithmVersion: string;
  };
}
```

## 配置说明

### 环境变量

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
VALUATION_API_URL=https://api.procyc.com/valuation  # 可选
API_TIMEOUT_MS=5000
```

## 使用示例

### 示例 1: 快速估价

```typescript
const result = await skill.execute({
  deviceQrcodeId: 'qr_device_123',
});

if (result.success) {
  console.log(`估价结果：¥${result.data.valuation.finalValue}`);
}
```

### 示例 2: 完整分析报告

```typescript
const result = await skill.execute({
  deviceQrcodeId: 'qr_device_123',
  includeBreakdown: true,
  useMarketData: true,
});

console.log('=== 设备估值报告 ===');
console.log(`设备型号：${result.data.deviceInfo.productModel}`);
console.log(`基础价值：¥${result.data.valuation.baseValue}`);
console.log(`最终估值：¥${result.data.valuation.finalValue}`);
console.log('\n估值因素:');
console.log(`- 原始价格：¥${result.data.breakdown.originalPrice}`);
console.log(`- 折旧金额：¥${result.data.breakdown.depreciation}`);
console.log(
  `- 成色系数：${(result.data.breakdown.conditionAdjustment * 100).toFixed(1)}%`
);
console.log(
  `- 品牌系数：${(result.data.breakdown.brandAdjustment * 100).toFixed(1)}%`
);
console.log(
  `- 年龄系数：${(result.data.breakdown.ageAdjustment * 100).toFixed(1)}%`
);
console.log(
  `- 维修系数：${(result.data.breakdown.repairAdjustment * 100).toFixed(1)}%`
);

if (result.data.marketComparison) {
  console.log('\n市场对比:');
  console.log(`市场均价：¥${result.data.marketComparison.marketAveragePrice}`);
  console.log(
    `价格区间：¥${result.data.marketComparison.priceRange.min} - ¥${result.data.marketComparison.priceRange.max}`
  );
  console.log(
    `置信度：${(result.data.marketComparison.confidence * 100).toFixed(1)}%`
  );
}
```

## 估值算法

### 核心公式

```
最终估值 = (原始价格 - 折旧) × 部件评分 × 成色乘数 × 品牌系数 × 年龄系数 × 维修系数
```

### 影响因素

1. **原始价格**: 设备购买时的价格
2. **折旧**: 基于使用年限的线性折旧
3. **部件评分**: 各功能部件状态的综合评分
4. **成色乘数**: 外观成色的调整系数
5. **品牌系数**: 不同品牌的保值率差异
6. **年龄系数**: 设备年龄段的调整
7. **维修系数**: 维修历史对价值的影响

## 错误处理

```typescript
try {
  const result = await skill.execute({
    deviceQrcodeId: 'invalid_id',
  });

  if (!result.success) {
    console.error('估价失败:', result.error.message);
  }
} catch (error) {
  console.error('技能执行异常:', error);
}
```

## 性能指标

- **响应时间**: P95 < 800ms
- **准确率**: > 85%（与市场成交价对比）
- **并发支持**: 支持高并发查询

## 测试

```bash
# 运行单元测试
npm test

# 运行功能测试
npm run test:functional
```

## 许可证

MIT

## 支持

- 文档：[ProCyc Skill 规范](https://github.com/procyc-skills/procyc-skill-spec)
- 问题反馈：[GitHub Issues](https://github.com/procyc-skills/procyc-estimate-value/issues)
