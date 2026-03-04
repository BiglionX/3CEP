# procyc-part-lookup

基于设备型号查询兼容配件的 ProCyc Skill。

## 功能特性

- 🔍 **精准匹配**: 根据设备型号查询完全兼容的配件
- 📊 **多维度筛选**: 支持按配件分类、价格范围、库存状态筛选
- 🎯 **智能排序**: 支持按价格、库存、相关度排序
- 💰 **价格信息**: 提供 FCX 定价和市场价格比较
- 📦 **库存检查**: 实时库存状态查询
- 🔗 **兼容性说明**: 详细的配件兼容性备注

## 安装

```bash
npm install procyc-part-lookup
```

## 快速开始

### 基础用法

```typescript
import { PartLookupSkill } from 'procyc-part-lookup';

const skill = new PartLookupSkill();

const result = await skill.execute({
  deviceModel: 'iPhone 14 Pro',
  deviceBrand: 'Apple',
  deviceCategory: 'mobile',
});

console.log(result.data.compatibleParts);
```

### 高级筛选

```typescript
const result = await skill.execute({
  deviceModel: 'MacBook Air M2',
  deviceBrand: 'Apple',
  deviceCategory: 'laptop',
  partCategory: '屏幕',
  priceRange: {
    min: 500,
    max: 3000,
  },
  includeOutOfStock: false,
  sortBy: 'price_asc',
});
```

## API 参考

### 输入参数

| 参数名            | 类型    | 必填 | 描述                                                                 |
| ----------------- | ------- | ---- | -------------------------------------------------------------------- |
| deviceModel       | string  | ✅   | 设备型号                                                             |
| deviceBrand       | string  | ❌   | 设备品牌                                                             |
| deviceCategory    | string  | ❌   | 设备类别 (mobile/tablet/laptop/desktop/smartwatch/other)             |
| partCategory      | string  | ❌   | 配件分类筛选                                                         |
| priceRange        | object  | ❌   | 价格范围 {min, max}                                                  |
| includeOutOfStock | boolean | ❌   | 是否包含缺货配件 (默认 false)                                        |
| sortBy            | string  | ❌   | 排序方式 (price_asc/price_desc/stock_desc/relevance，默认 relevance) |

### 输出结果

```typescript
interface PartLookupOutput {
  success: boolean;
  data: {
    queryInfo: {
      deviceModel: string;
      matchedDevices: Array<{ id; brand; model }>;
      totalPartsFound: number;
    };
    compatibleParts: Array<{
      id: string;
      name: string;
      category: string;
      partNumber: string;
      brand: string;
      price: number;
      stockQuantity: number;
      compatibilityNotes: string;
      imageUrl: string;
      matchScore: number;
    }>;
    statistics: {
      totalCompatibleParts: number;
      avgPrice: number;
      inStockCount: number;
      outOfStockCount: number;
      categoriesBreakdown: Array<{ category; count }>;
    };
  };
  error?: { code; message };
  metadata: {
    executionTimeMs: number;
    timestamp: string;
    version: string;
    dataSource: string;
  };
}
```

## 配置说明

### 环境变量

在使用技能之前，需要配置以下环境变量：

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
API_TIMEOUT_MS=5000
```

### TypeScript 示例

```typescript
process.env.SUPABASE_URL = 'https://xxx.supabase.co';
process.env.SUPABASE_ANON_KEY = 'eyJhbGc...';

const skill = new PartLookupSkill();
await skill.execute({...});
```

## 使用示例

### 示例 1: 查询所有兼容配件

```typescript
const result = await skill.execute({
  deviceModel: 'iPhone 13',
  deviceBrand: 'Apple',
  deviceCategory: 'mobile',
});

// 返回所有 iPhone 13 兼容的配件
```

### 示例 2: 按分类筛选

```typescript
const result = await skill.execute({
  deviceModel: 'Samsung Galaxy S23',
  deviceBrand: 'Samsung',
  deviceCategory: 'mobile',
  partCategory: '电池',
});

// 只返回电池类配件
```

### 示例 3: 价格区间筛选

```typescript
const result = await skill.execute({
  deviceModel: 'iPad Pro 12.9',
  deviceBrand: 'Apple',
  deviceCategory: 'tablet',
  priceRange: {
    min: 100,
    max: 1000,
  },
});

// 只返回价格在 100-1000 FCX 之间的配件
```

### 示例 4: 按库存排序

```typescript
const result = await skill.execute({
  deviceModel: 'MacBook Pro 16',
  deviceBrand: 'Apple',
  deviceCategory: 'laptop',
  sortBy: 'stock_desc',
});

// 库存充足的配件排在前面
```

## 错误处理

```typescript
try {
  const result = await skill.execute({
    deviceModel: 'Unknown Device',
  });

  if (!result.success) {
    console.error('查询失败:', result.error);
  }
} catch (error) {
  console.error('技能执行异常:', error);
}
```

## 性能指标

- **响应时间**: P95 < 500ms
- **并发支持**: 支持高并发查询
- **缓存策略**: 支持查询结果缓存（可选）

## 测试

```bash
# 运行单元测试
npm test

# 运行集成测试
npm run test:integration

# 运行 E2E 测试
npm run test:e2e
```

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！

## 支持

- 文档：[ProCyc Skill 规范](https://github.com/procyc-skills/procyc-skill-spec)
- 问题反馈：[GitHub Issues](https://github.com/procyc-skills/procyc-part-lookup/issues)
