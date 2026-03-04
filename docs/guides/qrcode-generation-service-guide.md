# 二维码生成服务指南

## 概述

二维码生成服务为产品服务官智能体(M1)提供专业的二维码生成功能，支持为每个产品生成唯一的二维码图片，并建立二维码 ID 与产品信息的绑定关系。

## 功能特性

### 核心功能

- ✅ 真实二维码生成（PNG/SVG 格式）
- ✅ 支持自定义配置（尺寸、纠错级别、颜色等）
- ✅ 批量生成能力
- ✅ 二维码 ID 唯一性保证
- ✅ 完整的产品信息绑定
- ✅ 数据库存储和关联
- ✅ 扫描统计跟踪
- ✅ Base64 格式直接返回
- ✅ 详细的错误处理
- ✅ 生成日志记录

## 技术架构

### 服务组件

```
src/services/qrcode.service.ts          # 核心服务类
src/app/api/qrcode/generate/route.ts    # API路由
supabase/migrations/018_create_qrcode_system.sql  # 数据库迁移
```

### 数据库表结构

- `product_qrcodes` - 产品二维码主表
- `qr_generation_logs` - 生成日志表
- `qr_scan_statistics` - 扫描统计表

## API 接口文档

### 1. 生成二维码

**POST** `/api/qrcode/generate`

#### 请求参数

##### 单个产品生成

```json
{
  "productId": "prod_apple_iphone15_001",
  "brandId": "brand_apple_001",
  "productName": "iPhone 15 Pro",
  "productModel": "A2842",
  "productCategory": "smartphone",
  "batchNumber": "IPH15P20260219001",
  "manufacturingDate": "2026-02-19",
  "warrantyPeriod": "12个月",
  "specifications": {
    "color": "钛金属原色",
    "storage": "256GB",
    "ram": "8GB"
  },
  "config": {
    "format": "png",
    "size": 400,
    "errorCorrectionLevel": "M",
    "margin": 4,
    "color": {
      "dark": "#000000",
      "light": "#FFFFFF"
    }
  }
}
```

##### 批量生成

```json
{
  "products": [
    {
      "productId": "prod_samsung_galaxy24_001",
      "brandId": "brand_samsung_001",
      "productName": "Galaxy S24 Ultra",
      "productModel": "SM-S9280",
      "productCategory": "smartphone"
    },
    {
      "productId": "prod_xiaomi_14pro_001",
      "brandId": "brand_xiaomi_001",
      "productName": "小米14 Pro",
      "productModel": "23116PN5BC",
      "productCategory": "smartphone"
    }
  ],
  "config": {
    "format": "svg",
    "size": 300
  }
}
```

#### 响应格式

##### 单个生成成功

```json
{
  "success": true,
  "qrCodeId": "qr_prod_apple_iphone15_001_abc123_def456",
  "productId": "prod_apple_iphone15_001",
  "qrContent": "https://fx.cn/products/prod_apple_iphone15_001",
  "qrImageBase64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACCCAMAAADQNkiAAAAA1BMVEW10NBjBBbqAAAAH0lEQVRo3u3BAQ0AAADCoPdPbQ43oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIBLcQ8AAa0jZQAAAABJRU5ErkJggg==",
  "format": "png",
  "size": 400,
  "message": "二维码生成成功"
}
```

##### 批量生成响应

```json
{
  "success": true,
  "results": [
    {
      "productId": "prod_samsung_galaxy24_001",
      "qrCodeId": "qr_prod_samsung_galaxy24_001_xyz789_ghi012",
      "success": true,
      "qrContent": "https://fx.cn/products/prod_samsung_galaxy24_001",
      "qrImageBase64": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCI...",
      "format": "svg",
      "size": 300
    }
  ],
  "summary": {
    "total": 2,
    "success": 2,
    "failed": 0
  },
  "message": "批量处理完成，成功 2 个，失败 0 个"
}
```

### 2. 查询二维码信息

**GET** `/api/qrcode/generate`

#### 查询参数

- `qrCodeId` - 二维码 ID
- `productId` - 产品 ID

#### 示例

```bash
# 根据二维码ID查询
GET /api/qrcode/generate?qrCodeId=qr_prod_apple_iphone15_001_abc123_def456

# 根据产品ID查询所有二维码
GET /api/qrcode/generate?productId=prod_apple_iphone15_001
```

## 配置选项

### 支持的配置参数

| 参数                 | 类型   | 默认值    | 说明                       |
| -------------------- | ------ | --------- | -------------------------- |
| format               | string | "png"     | 图片格式: png \| svg       |
| size                 | number | 300       | 尺寸: 100-1000 像素        |
| errorCorrectionLevel | string | "M"       | 纠错级别: L \| M \| Q \| H |
| margin               | number | 4         | 边距: 0-10                 |
| color.dark           | string | "#000000" | 前景色                     |
| color.light          | string | "#FFFFFF" | 背景色                     |

## 部署指南

### 1. 安装依赖

```bash
npm install qrcode sharp
npm install @types/qrcode @types/sharp --save-dev
```

### 2. 执行数据库迁移

```bash
# 通过Supabase控制台执行
supabase/migrations/018_create_qrcode_system.sql
```

### 3. 环境变量配置

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
QR_CODE_BASE_URL=https://fx.cn  # 可选，默认为 https://fx.cn
```

### 4. 验证部署

```bash
# 运行测试脚本
node scripts/test-qrcode-generation.js
```

## 使用示例

### JavaScript/TypeScript 客户端调用

```javascript
// 单个生成
const response = await fetch('/api/qrcode/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    productId: 'prod_apple_iphone15_001',
    brandId: 'brand_apple_001',
    productName: 'iPhone 15 Pro',
    productModel: 'A2842',
    config: {
      format: 'png',
      size: 400,
    },
  }),
});

const result = await response.json();
console.log('二维码Base64:', result.qrImageBase64);

// 批量生成
const batchResponse = await fetch('/api/qrcode/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    products: [
      {
        productId: 'prod_001',
        brandId: 'brand_001',
        productName: '产品1',
      },
      {
        productId: 'prod_002',
        brandId: 'brand_001',
        productName: '产品2',
      },
    ],
  }),
});
```

### 显示二维码图片

```html
<!-- 在HTML中显示Base64二维码 -->
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." alt="产品二维码" />

<!-- 或者直接使用返回的Base64数据 -->
<img :src="qrCodeResult.qrImageBase64" alt="产品二维码" />
```

## 错误处理

### 常见错误响应

```json
{
  "error": "缺少必要参数：productId、brandId 和 productName"
}
```

```json
{
  "error": "二维码生成失败: Invalid product information"
}
```

## 性能优化建议

1. **批量处理**: 对于大量产品，使用批量生成接口
2. **缓存策略**: 对相同配置的二维码可考虑缓存
3. **异步处理**: 大批量生成建议使用异步队列处理
4. **图片压缩**: 根据使用场景调整二维码尺寸

## 安全考虑

1. **输入验证**: 严格验证所有输入参数
2. **权限控制**: 通过 RLS 策略限制品牌访问权限
3. **速率限制**: 实施 API 调用频率限制
4. **日志审计**: 记录所有生成操作

## 监控和维护

### 关键监控指标

- 生成成功率
- 平均响应时间
- 错误率统计
- 使用量统计

### 维护任务

- 定期清理过期二维码数据
- 监控数据库性能
- 更新依赖包版本
- 备份重要数据

## 故障排除

### 常见问题

**Q: 生成的二维码无法扫描**
A: 检查纠错级别设置，建议使用 M 或 Q 级别

**Q: Base64 数据过大**
A: 调整二维码尺寸参数，或使用 SVG 格式

**Q: 数据库插入失败**
A: 检查 product_id 外键约束和必填字段

## 版本历史

- v1.0.0 (2026-02-19): 初始版本发布

---

_本文档最后更新: 2026-02-19_
