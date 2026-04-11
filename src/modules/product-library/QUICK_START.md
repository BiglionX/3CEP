# 🚀 产品库模块快速启动指南

## 📋 前置条件

- ✅ 数据库迁移已执行（`020_create_product_library_schema.sql`）
- ✅ Next.js 开发服务器运行中

---

## 🔧 启动步骤

### 1. 启动开发服务器

```bash
cd d:\BigLionX\3cep
npm run dev
```

访问: http://localhost:3000

---

## 🧪 API 测试

### 测试 1: 创建品牌

```bash
curl -X POST http://localhost:3000/api/product-library/brands \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Apple",
    "logoUrl": "https://example.com/apple-logo.png",
    "websiteUrl": "https://www.apple.com",
    "contactEmail": "support@apple.com"
  }'
```

**预期响应**:

```json
{
  "success": true,
  "data": {
    "id": "uuid...",
    "name": "Apple",
    "slug": "apple",
    "websiteUrl": "https://www.apple.com",
    "isActive": true,
    "createdAt": "2026-04-09T...",
    "updatedAt": "2026-04-09T..."
  },
  "message": "品牌创建成功"
}
```

---

### 测试 2: 获取品牌列表

```bash
# 获取所有品牌
curl http://localhost:3000/api/product-library/brands

# 搜索品牌
curl "http://localhost:3000/api/product-library/brands?search=Apple"

# 过滤激活状态
curl "http://localhost:3000/api/product-library/brands?isActive=true"
```

**预期响应**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid...",
      "name": "Apple",
      "slug": "apple",
      ...
    }
  ],
  "count": 1
}
```

---

### 测试 3: 创建产品

使用上一步返回的品牌 ID：

```bash
curl -X POST http://localhost:3000/api/product-library/products \
  -H "Content-Type: application/json" \
  -d '{
    "skuCode": "MBP-2024-M3-PRO",
    "brandId": "从品牌创建返回的ID",
    "categoryId": null,
    "name": "MacBook Pro 14-inch M3 Pro",
    "description": "Apple MacBook Pro with M3 Pro chip",
    "specifications": {
      "cpu": "Apple M3 Pro",
      "ram": "18GB",
      "storage": "512GB SSD",
      "display": "14.2-inch Liquid Retina XDR",
      "weight": "1.61kg"
    },
    "images": ["https://example.com/mbp-m3.jpg"]
  }'
```

**预期响应**:

```json
{
  "success": true,
  "data": {
    "id": "uuid...",
    "skuCode": "MBP-2024-M3-PRO",
    "name": "MacBook Pro 14-inch M3 Pro",
    "status": "draft",
    "dataSource": "official",
    "version": 1,
    ...
  },
  "message": "产品创建成功"
}
```

---

### 测试 4: 搜索产品

```bash
# 搜索所有已发布的产品
curl http://localhost:3000/api/product-library/products

# 按品牌搜索
curl "http://localhost:3000/api/product-library/products?brandId=uuid..."

# 关键词搜索
curl "http://localhost:3000/api/product-library/products?search=MacBook"

# 分页
curl "http://localhost:3000/api/product-library/products?limit=10&offset=0"
```

**预期响应**:

```json
{
  "success": true,
  "data": [...],
  "total": 1,
  "hasMore": false
}
```

---

### 测试 5: 发布产品

使用上一步返回的产品 ID：

```bash
curl -X POST http://localhost:3000/api/product-library/products/{product-id}/publish
```

**预期响应**:

```json
{
  "success": true,
  "data": {
    "id": "uuid...",
    "status": "published",
    ...
  },
  "message": "产品发布成功"
}
```

---

## ⚠️ 常见错误处理

### 错误 1: 品牌已存在

```json
{
  "success": false,
  "error": "品牌 \"Apple\" 已存在"
}
```

**解决**: 使用不同的品牌名称或查询现有品牌

### 错误 2: SKU 已存在

```json
{
  "success": false,
  "error": "SKU编码 MBP-2024-M3-PRO 已存在"
}
```

**解决**: 使用唯一的 SKU 编码

### 错误 3: 必填字段缺失

```json
{
  "success": false,
  "error": "SKU编码、品牌ID和名称不能为空"
}
```

**解决**: 确保提供 `skuCode`, `brandId`, `name`

### 错误 4: 数据库连接失败

```
Error: connect ECONNREFUSED
```

**解决**:

1. 确认 Supabase 本地服务正在运行
2. 检查 `.env.local` 中的数据库配置
3. 重新执行数据库迁移

---

## 🎯 下一步功能

完成基础测试后，可以继续实现：

### 1. 完善其他 Repository

- [ ] PostgresAccessoryRepository
- [ ] PostgresComponentRepository
- [ ] PostgresPartRepository
- [ ] PostgresCategoryRepository
- [ ] PostgresProductRelationRepository

### 2. 添加更多 API

- [ ] 配件管理 API
- [ ] 部件管理 API
- [ ] 零件管理 API
- [ ] BOM 关系管理 API
- [ ] 类目管理 API

### 3. 数据导入功能

- [ ] CSV 导入
- [ ] Excel 导入
- [ ] API 同步

### 4. 前端界面

- [ ] 品牌管理页面
- [ ] 产品管理页面
- [ ] 产品搜索页面
- [ ] BOM 编辑器

---

## 📊 当前可用功能清单

| 功能         | API 端点                                       | 状态 |
| ------------ | ---------------------------------------------- | ---- |
| 创建品牌     | POST /api/product-library/brands               | ✅   |
| 获取品牌列表 | GET /api/product-library/brands                | ✅   |
| 创建产品     | POST /api/product-library/products             | ✅   |
| 搜索产品     | GET /api/product-library/products              | ✅   |
| 发布产品     | POST /api/product-library/products/:id/publish | ✅   |
| 配件管理     | -                                              | ⏸️   |
| 部件管理     | -                                              | ⏸️   |
| 零件管理     | -                                              | ⏸️   |
| BOM 管理     | -                                              | ⏸️   |

---

## 🔗 相关文档

- [Phase 1 完成报告](./PHASE_1_COMPLETION_REPORT.md)
- [开发计划](../../PRODUCT_LIBRARY_DEVELOPMENT_PLAN.md)
- [数据库 Schema](../../../supabase/migrations/020_create_product_library_schema.sql)

---

**🎉 开始测试吧！**

如有问题，请查看控制台日志或检查数据库连接配置。
