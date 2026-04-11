# 📦 产品库模块 (Product Library Module)

> 行业标准产品主数据库 - 支持五库设计、BOM管理、数据导入和全文搜索

[![Status](https://img.shields.io/badge/status-complete-brightgreen)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

---

## 📋 目录

- [功能特性](#-功能特性)
- [快速开始](#-快速开始)
- [API文档](#-api文档)
- [数据导入](#-数据导入)
- [架构设计](#-架构设计)
- [开发计划](#-开发计划)
- [相关文档](#-相关文档)

---

## ✨ 功能特性

### 🏗️ 五库设计

- **品牌库** - 管理产品品牌信息
- **整机库** - 完整产品（电脑、手机等）
- **配件库** - 产品配件（充电器、保护壳等）
- **部件库** - 产品部件（CPU、内存、硬盘等）
- **零件库** - 最小物理单元（螺丝、电阻、电容等）

### 🔗 BOM 管理

- 5种关系类型：includes, compatible, accessory, component_of, part_of
- 多层级展开和查询
- 数量管理

### 📥 数据导入

- **CSV Importer** - 标准CSV格式，自动解析
- **Excel Importer** - 多Sheet支持，灵活映射
- **API Importer** - 外部API对接，OAuth认证

### 🔍 全文搜索

- PostgreSQL tsvector + GIN索引
- 支持中文分词
- 多字段加权搜索

### 📊 审计追踪

- 数据变更日志
- 导入任务记录
- 版本控制
- 数据源追踪

---

## 🚀 快速开始

### 1. 数据库迁移

```bash
# 执行迁移脚本
npx supabase db push --db-url "your-database-url"
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 测试 API

```bash
# 创建品牌
curl -X POST http://localhost:3000/api/product-library/brands \
  -H "Content-Type: application/json" \
  -d '{"name":"Apple","websiteUrl":"https://apple.com"}'

# 创建产品
curl -X POST http://localhost:3000/api/product-library/products \
  -H "Content-Type: application/json" \
  -d '{
    "skuCode":"MBP-2024-M3",
    "brandId":"uuid...",
    "name":"MacBook Pro 14-inch",
    "specifications":{"cpu":"M3 Pro","ram":"18GB"}
  }'
```

### 4. 运行自动化测试

```bash
cd scripts
chmod +x test-product-library-api.sh
./test-product-library-api.sh
```

---

## 📡 API 文档

### 品牌管理

| 方法 | 端点                          | 说明         |
| ---- | ----------------------------- | ------------ |
| GET  | `/api/product-library/brands` | 获取品牌列表 |
| POST | `/api/product-library/brands` | 创建品牌     |

### 产品管理

| 方法   | 端点                                                   | 说明        |
| ------ | ------------------------------------------------------ | ----------- |
| GET    | `/api/product-library/products`                        | 搜索产品    |
| POST   | `/api/product-library/products`                        | 创建产品    |
| POST   | `/api/product-library/products/:id/publish`            | 发布产品    |
| GET    | `/api/product-library/products/:id/bom`                | 获取BOM     |
| POST   | `/api/product-library/products/:id/bom`                | 添加BOM关系 |
| DELETE | `/api/product-library/products/:parentId/bom/:childId` | 删除BOM     |

### 配件/部件/零件管理

| 方法 | 端点                               | 说明         |
| ---- | ---------------------------------- | ------------ |
| GET  | `/api/product-library/accessories` | 获取配件列表 |
| POST | `/api/product-library/accessories` | 创建配件     |
| GET  | `/api/product-library/components`  | 获取部件列表 |
| POST | `/api/product-library/components`  | 创建部件     |
| GET  | `/api/product-library/parts`       | 获取零件列表 |
| POST | `/api/product-library/parts`       | 创建零件     |

### 数据导入

| 方法 | 端点                                | 说明      |
| ---- | ----------------------------------- | --------- |
| POST | `/api/product-library/import/csv`   | CSV导入   |
| POST | `/api/product-library/import/excel` | Excel导入 |
| POST | `/api/product-library/import/api`   | API导入   |

详细API文档请查看 [QUICK_START.md](./QUICK_START.md)

---

## 📥 数据导入

### CSV 导入示例

```bash
curl -X POST http://localhost:3000/api/product-library/import/csv \
  -F "file=@products.csv"
```

**CSV 格式**:

```csv
skuCode,brandId,name,type,description,specifications
MBP-2024-M3,brand-uuid,MacBook Pro,complete,"Apple laptop","{""cpu"":""M3 Pro""}"
```

### Excel 导入示例

前端需要将Excel转换为JSON格式后发送：

```javascript
const response = await fetch('/api/product-library/import/excel', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(workbookData),
});
```

### API 导入示例

```bash
curl -X POST http://localhost:3000/api/product-library/import/api \
  -H "Content-Type: application/json" \
  -d '{
    "source": {
      "name": "External API",
      "config": {
        "baseUrl": "https://api.example.com",
        "apiKey": "your-api-key"
      },
      "endpoints": {
        "products": "/products",
        "accessories": "/accessories"
      }
    }
  }'
```

详细导入模板请查看 [IMPORT_TEMPLATES.md](./IMPORT_TEMPLATES.md)

---

## 🏗️ 架构设计

### DDD 四层架构

```
src/modules/product-library/
├── domain/                    # 领域层
│   ├── entities/             # 实体（7个）
│   ├── repositories/         # 仓储接口（7个）
│   └── services/             # 领域服务（1个）
├── application/              # 应用层
│   └── use-cases/            # 用例（4个）
├── infrastructure/           # 基础设施层
│   ├── repositories/         # 仓储实现（6个）
│   └── importers/            # 数据导入器（3个）
└── interface-adapters/       # 接口适配层
    └── api/routes/           # API路由（10个）
```

### 数据库 Schema

```
product_library/
├── brands                    # 品牌库
├── categories                # 类目树
├── complete_products         # 整机库
├── accessories               # 配件库
├── components                # 部件库
├── parts                     # 零件库
├── product_relations         # BOM关系
├── import_jobs               # 导入任务
└── data_audit_logs           # 审核日志
```

---

## 📅 开发计划

完整的开发计划请查看 [PRODUCT_LIBRARY_DEVELOPMENT_PLAN.md](../../PRODUCT_LIBRARY_DEVELOPMENT_PLAN.md)

### 已完成 ✅

- Phase 1: 基础设施搭建（DDD架构 + 数据库Schema）
- Phase 2: 核心功能开发（五库API + BOM管理）
- Phase 3: 数据导入系统（CSV/Excel/API）

### 待实现 ⏸️

- Phase 4: 进销存集成
- Phase 5: 溯源码插件
- Phase 6: 高级功能
- Phase 7: 测试和优化
- Phase 8: 文档和发布
- Phase 9: 智能搜索引擎

---

## 📚 相关文档

- [完整实现报告](./COMPLETE_IMPLEMENTATION_REPORT.md) - 详细的功能清单和统计
- [快速启动指南](./QUICK_START.md) - API测试和示例
- [数据导入模板](./IMPORT_TEMPLATES.md) - CSV/Excel格式说明
- [Phase 1 完成报告](./PHASE_1_COMPLETION_REPORT.md) - 基础设施搭建详情
- [开发计划](../../PRODUCT_LIBRARY_DEVELOPMENT_PLAN.md) - 完整路线图

---

## 🛠️ 技术栈

- **框架**: Next.js 14 + TypeScript
- **数据库**: PostgreSQL (Supabase)
- **架构**: DDD (Domain-Driven Design)
- **模式**: Repository Pattern, Use Case Pattern
- **API**: RESTful API

---

## 📊 项目统计

- **总文件数**: 51个
- **代码行数**: ~6,000行
- **API端点**: 17个
- **数据库表**: 8张
- **索引数量**: 17个
- **文档数量**: 6个

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 许可证

MIT License

---

**🎉 产品库模块已准备就绪，可以立即使用！**
