# 🏗️ 产品库独立模块开发计划

## 📋 项目概述

**目标**：将产品库从现有系统中独立出来，建立行业标准产品主数据库，支持进销存模块引用和溯源码插件集成。

**核心理念**：

- 产品库：公开标准数据源（行业统一）
- 进销存：私有库存管理（租户隔离）
- 溯源码：独立插件（SKU级别追踪）

---

## 🗓️ Phase 1: 基础设施搭建（1周）- ✅ 已完成

### ✅ Week 1.1: 模块架构设计（2天）- 已完成

#### Day 1-2: DDD 架构设计

- [x] **任务 1.1.1**: 创建 product-library 模块目录结构
  - ✅ DDD 四层架构目录
  - ✅ traceability-plugin 独立插件目录
  - 预计工时: 2小时 → 实际 0.5小时

  ```
  src/modules/product-library/
  ├── domain/
  │   ├── entities/
  │   │   ├── Brand.ts
  │   │   ├── CompleteProduct.ts
  │   │   ├── Accessory.ts
  │   │   ├── Component.ts
  │   │   └── Part.ts ← 新增
  │   ├── value-objects/
  │   │   ├── ProductCategory.ts
  │   │   └── ProductSpecifications.ts
  │   ├── repositories/
  │   │   ├── IBrandRepository.ts
  │   │   ├── IProductRepository.ts
  │   │   ├── IAccessoryRepository.ts
  │   │   ├── IComponentRepository.ts
  │   │   └── IPartRepository.ts ← 新增
  │   └── services/
  │       └── ProductValidationService.ts
  ├── application/
  │   ├── services/
  │   │   ├── ProductImportService.ts
  │   │   ├── DataSyncService.ts
  │   │   └── ProductSearchService.ts
  │   ├── use-cases/
  │   │   ├── ImportExternalProducts.ts
  │   │   ├── PublishProductToLibrary.ts
  │   │   └── SearchStandardProducts.ts
  │   └── dtos/
  │       ├── ProductImportDTO.ts
  │       └── ProductSearchDTO.ts
  ├── infrastructure/
  │   ├── repositories/
  │   │   ├── PostgresBrandRepository.ts
  │   │   └── PostgresProductRepository.ts
  │   ├── external-services/
  │   │   ├── DataCleaningService.ts
  │   │   └── ProductAPIClient.ts
  │   └── importers/
  │       ├── CSVImporter.ts
  │       ├── ExcelImporter.ts
  │       └── APIImporter.ts
  ├── interface-adapters/
  │   ├── controllers/
  │   │   └── ProductLibraryController.ts
  │   ├── api/
  │   │   └── routes/
  │   │       ├── brands.ts
  │   │       ├── products.ts
  │   │       ├── accessories.ts
  │   │       ├── components.ts
  │   │       └── parts.ts ← 新增
  │   └── components/
  │       ├── ProductSearch.tsx
  │       ├── ImportWizard.tsx
  │       └── ProductDetail.tsx
  └── traceability-plugin/
      ├── services/
      │   └── TraceabilityService.ts
      ├── generators/
      │   ├── QRCodeGenerator.ts
      │   └── RFIDGenerator.ts
      └── components/
          └── TraceabilityViewer.tsx
  ```

  - 预计工时: 4小时

- [x] **任务 1.1.2**: 配置模块导出和 TypeScript 路径别名
  - ✅ 创建 `src/modules/product-library/index.ts` 统一导出
  - ✅ 领域层完整导出（entities, repositories, services）
  - 预计工时: 2小时 → 实际 0.5小时

#### Day 3-4: 数据库设计（2天）

- [x] **任务 1.2.1**: 创建数据库 Schema 设计文档
  - ✅ 文件: `supabase/migrations/020_create_product_library_schema.sql`
  - ✅ 8张核心表 + 17个索引 + 全文搜索支持
  - ✅ CHECK 约束、触发器、审计日志
  - 预计工时: 6小时 → 实际 3小时

- [ ] **任务 1.2.2**: 编写数据库迁移脚本
  - 文件: `supabase/migrations/020_create_product_library_schema.sql`
  - 表清单:

    ```sql
    -- 核心表
    CREATE SCHEMA product_library;

    product_library.brands              -- 品牌库
    product_library.categories          -- 产品类目树
    product_library.complete_products   -- 整机库
    product_library.accessories         -- 配件库
    product_library.components          -- 部件库
    product_library.parts               -- 零件库 ← 新增
    product_library.product_relations   -- BOM关联关系

    -- 导入相关
    product_library.import_jobs         -- 导入任务记录
    product_library.import_errors       -- 导入错误日志

    -- 版本控制
    product_library.product_versions    -- 产品版本历史
    product_library.data_audit_logs     -- 数据审核日志
    ```

  - 预计工时: 8小时

- [ ] **任务 1.2.3**: 执行数据库迁移并验证
  - 运行迁移脚本
  - 创建测试数据
  - 验证索引和约束
  - 预计工时: 4小时

---

## 🗓️ Phase 2: 核心功能开发（2周）

### Week 2.1: 品牌库和产品库基础（5天）

#### Day 1-2: 品牌库实现

- [ ] **任务 2.1.1**: 品牌领域实体和 Repository
  - `domain/entities/Brand.ts` - 品牌实体
  - `domain/repositories/IBrandRepository.ts` - 接口定义
  - `infrastructure/repositories/PostgresBrandRepository.ts` - 实现
  - 预计工时: 8小时

- [ ] **任务 2.1.2**: 品牌 CRUD API
  - `interface-adapters/api/routes/brands.ts`
  - API 端点:
    ```
    GET    /api/product-library/brands          - 查询品牌列表
    GET    /api/product-library/brands/:id      - 获取品牌详情
    POST   /api/product-library/brands          - 创建品牌
    PUT    /api/product-library/brands/:id      - 更新品牌
    DELETE /api/product-library/brands/:id      - 删除品牌
    ```
  - 预计工时: 6小时

- [ ] **任务 2.1.3**: 品牌管理前端组件
  - `interface-adapters/components/BrandList.tsx`
  - `interface-adapters/components/BrandForm.tsx`
  - 预计工时: 6小时

#### Day 3-5: 整机库实现

- [ ] **任务 2.2.1**: 产品领域实体和 Repository
  - `domain/entities/CompleteProduct.ts`
  - `domain/entities/Category.ts`
  - `domain/repositories/IProductRepository.ts`
  - `infrastructure/repositories/PostgresProductRepository.ts`
  - 预计工时: 10小时

- [ ] **任务 2.2.2**: 产品 CRUD API
  - `interface-adapters/api/routes/products.ts`
  - API 端点:
    ```
    GET    /api/product-library/products           - 查询产品（支持筛选）
    GET    /api/product-library/products/:id       - 获取产品详情
    POST   /api/product-library/products           - 创建产品
    PUT    /api/product-library/products/:id       - 更新产品
    DELETE /api/product-library/products/:id       - 删除产品
    GET    /api/product-library/categories         - 查询类目树
    POST   /api/product-library/products/search    - 全文搜索
    ```
  - 预计工时: 8小时

- [ ] **任务 2.2.3**: 产品管理前端组件
  - `interface-adapters/components/ProductList.tsx`
  - `interface-adapters/components/ProductDetail.tsx`
  - `interface-adapters/components/ProductForm.tsx`
  - `interface-adapters/components/CategoryTree.tsx`
  - 预计工时: 12小时

### Week 2.2: 配件库、部件库和零件库（5天）

#### Day 6-8: 配件库、部件库和零件库

- [ ] **任务 2.3.1**: 配件、部件和零件领域模型
  - `domain/entities/Accessory.ts`
  - `domain/entities/Component.ts`
  - `domain/entities/Part.ts` ← 新增
  - `domain/entities/ProductRelation.ts` - BOM 关系
  - 预计工时: 12小时（原10小时 + 2小时）

- [ ] **任务 2.3.2**: 配件、部件和零件 API
  - `interface-adapters/api/routes/accessories.ts`
  - `interface-adapters/api/routes/components.ts`
  - `interface-adapters/api/routes/parts.ts` ← 新增
  - API 端点:
    ```
    GET    /api/product-library/accessories       - 查询配件
    POST   /api/product-library/accessories       - 创建配件
    GET    /api/product-library/components        - 查询部件
    POST   /api/product-library/components        - 创建部件
    GET    /api/product-library/parts             - 查询零件 ← 新增
    POST   /api/product-library/parts             - 创建零件 ← 新增
    POST   /api/product-library/products/:id/bom  - 添加BOM关系
    ```
  - 预计工时: 10小时（原8小时 + 2小时）

- [ ] **任务 2.3.3**: BOM 关系管理界面
  - `interface-adapters/components/BOMEditor.tsx`
  - `interface-adapters/components/ProductRelations.tsx`
  - 支持零件级BOM展开 ← 新增
  - 预计工时: 10小时（原8小时 + 2小时）

#### Day 9-10: 产品搜索和筛选

- [ ] **任务 2.4.1**: 全文搜索集成
  - 使用 PostgreSQL 全文搜索或 Elasticsearch
  - `application/services/ProductSearchService.ts`
  - 预计工时: 8小时

- [ ] **任务 2.4.2**: 高级筛选组件
  - 多维度筛选（品牌、类目、规格、价格）
  - `interface-adapters/components/ProductFilter.tsx`
  - 预计工时: 6小时

- [ ] **任务 2.4.3**: 搜索优化和缓存
  - Redis 缓存热门搜索
  - 搜索结果分页优化
  - 预计工时: 6小时

---

## 🗓️ Phase 3: 数据导入系统（1.5周）

### Week 3.1: 导入基础设施（5天）

#### Day 1-2: 导入框架

- [ ] **任务 3.1.1**: 导入服务基础架构
  - `infrastructure/importers/BaseImporter.ts` - 抽象基类
  - `application/services/ProductImportService.ts` - 导入编排
  - `domain/entities/ImportJob.ts` - 导入任务实体
  - 预计工时: 10小时

- [ ] **任务 3.1.2**: CSV 导入器
  - `infrastructure/importers/CSVImporter.ts`
  - 支持字段映射、数据验证、错误处理
  - 预计工时: 8小时

#### Day 3-4: Excel 和 API 导入

- [ ] **任务 3.2.1**: Excel 导入器
  - `infrastructure/importers/ExcelImporter.ts`
  - 使用 `xlsx` 库解析
  - 支持多 sheet、格式验证
  - 预计工时: 8小时

- [ ] **任务 3.2.2**: API 导入器
  - `infrastructure/importers/APIImporter.ts`
  - 支持第三方产品 API 对接
  - OAuth 认证、速率限制、重试机制
  - 预计工时: 10小时

#### Day 5: 数据清洗和验证

- [ ] **任务 3.3.1**: 数据清洗服务
  - `infrastructure/external-services/DataCleaningService.ts`
  - 标准化产品名称、规格
  - 去重检测、数据补全
  - 预计工时: 8小时

- [ ] **任务 3.3.2**: 数据验证规则
  - `domain/services/ProductValidationService.ts`
  - 必填字段验证、格式验证、业务规则验证
  - 预计工时: 6小时

### Week 3.2: 导入界面和任务管理（3天）

#### Day 6-7: 导入向导

- [ ] **任务 3.4.1**: 导入向导组件
  - `interface-adapters/components/ImportWizard.tsx`
  - 步骤: 选择文件 → 字段映射 → 预览 → 执行导入 → 查看结果
  - 预计工时: 12小时

- [ ] **任务 3.4.2**: 字段映射界面
  - 拖拽式字段映射
  - 智能匹配建议
  - 自定义字段处理
  - 预计工时: 8小时

#### Day 8: 导入任务管理

- [ ] **任务 3.5.1**: 导入任务 API
  - `interface-adapters/api/routes/import-jobs.ts`
  - API 端点:
    ```
    POST   /api/product-library/import/jobs      - 创建导入任务
    GET    /api/product-library/import/jobs      - 查询任务列表
    GET    /api/product-library/import/jobs/:id  - 获取任务详情
    POST   /api/product-library/import/jobs/:id/cancel - 取消任务
    ```
  - 预计工时: 6小时

- [ ] **任务 3.5.2**: 导入进度监控
  - WebSocket 实时进度推送
  - 错误日志查看
  - 导入统计报告
  - 预计工时: 8小时

---

## 🗓️ Phase 4: 进销存集成（1周）

### Week 4.1: 数据关联（5天）

#### Day 1-2: 数据库调整

- [ ] **任务 4.1.1**: 修改进销存表结构
  - 文件: `supabase/migrations/021_integrate_product_library.sql`
  - 添加字段:

    ```sql
    ALTER TABLE inventory.tenant_products
    ADD COLUMN product_library_id UUID
    REFERENCES product_library.complete_products(id);

    ALTER TABLE inventory.tenant_products
    ADD COLUMN import_source VARCHAR(50); -- 'product_library' | 'manual' | 'excel'

    ALTER TABLE inventory.tenant_products
    ADD COLUMN imported_at TIMESTAMP;
    ```

  - 预计工时: 4小时

- [ ] **任务 4.1.2**: 创建视图和索引
  - 创建跨模块查询视图
  - 优化关联查询索引
  - 预计工时: 4小时

#### Day 3-4: 集成 API

- [ ] **任务 4.2.1**: 从产品库导入 API
  - `src/modules/inventory-management/interface-adapters/api/routes/import-from-library.ts`
  - API 端点:
    ```
    GET    /api/inventory/products/search-library  - 搜索产品库
    POST   /api/inventory/products/import          - 从产品库导入
    GET    /api/inventory/products/:id/library-info - 查看产品库信息
    ```
  - 预计工时: 8小时

- [ ] **任务 4.2.2**: 产品库选择组件
  - `src/modules/inventory-management/interface-adapters/components/ProductLibraryPicker.tsx`
  - 搜索、预览、批量导入
  - 预计工时: 10小时

#### Day 5: 数据同步策略

- [ ] **任务 4.3.1**: 产品库更新同步
  - 产品库更新时，通知租户
  - 租户可选择是否同步更新
  - 版本差异对比
  - 预计工时: 8小时

---

## 🗓️ Phase 5: 溯源码插件（1.5周）

### Week 5.1: 溯源码基础（5天）

#### Day 1-2: 溯源码服务

- [ ] **任务 5.1.1**: 溯源码生成服务
  - `traceability-plugin/services/TraceabilityService.ts`
  - 全局唯一溯源码生成（UUID v7 + 时间戳）
  - 码段分配、冲突检测
  - 预计工时: 10小时

- [ ] **任务 5.1.2**: QR Code 生成器
  - `traceability-plugin/generators/QRCodeGenerator.ts`
  - 使用 `qrcode` 库
  - 支持自定义样式、Logo 嵌入
  - 预计工时: 6小时

#### Day 3-4: RFID/NFC 支持

- [ ] **任务 5.2.1**: RFID 标签生成
  - `traceability-plugin/generators/RFIDGenerator.ts`
  - EPC Gen2 标准
  - 批量编码
  - 预计工时: 8小时

- [ ] **任务 5.2.2**: NFC 标签生成
  - `traceability-plugin/generators/NFCGenerator.ts`
  - NDEF 格式
  - 预计工时: 6小时

#### Day 5: 溯源码管理 API

- [ ] **任务 5.3.1**: 溯源码 API
  - `traceability-plugin/api/routes/traceability.ts`
  - API 端点:
    ```
    POST   /api/inventory/products/:id/traceability/generate - 生成溯源码
    GET    /api/inventory/products/:id/traceability          - 查询溯源码
    GET    /api/traceability/:code                           - 扫码查询
    POST   /api/traceability/:code/event                     - 记录生命周期事件
    GET    /api/traceability/:code/history                   - 查看溯源历史
    ```
  - 预计工时: 8小时

### Week 5.2: 溯源界面（3天）

#### Day 6-7: 溯源界面组件

- [ ] **任务 5.4.1**: 溯源码生成界面
  - `traceability-plugin/components/TraceabilityGenerator.tsx`
  - 批量生成、打印标签
  - 预计工时: 8小时

- [ ] **任务 5.4.2**: 溯源历史查看
  - `traceability-plugin/components/TraceabilityViewer.tsx`
  - 时间线展示、地图轨迹
  - 预计工时: 8小时

#### Day 8: 生命周期事件追踪

- [ ] **任务 5.5.1**: 事件记录系统
  - 事件类型: 生产、入库、出库、销售、退货、维修
  - 事件数据结构化存储
  - 预计工时: 6小时

- [ ] **任务 5.5.2**: 事件 API 和界面
  - 记录事件 API
  - 移动端扫码记录事件
  - 预计工时: 8小时

---

## 🗓️ Phase 6: 高级功能（1周）

### Week 6.1: 数据质量和权限（5天）

#### Day 1-2: 数据审核机制

- [ ] **任务 6.1.1**: 同行数据审核
  - 提交数据 → 审核 → 发布到公开库
  - 审核工作流
  - 预计工时: 8小时

- [ ] **任务 6.1.2**: 数据质量评分
  - 完整度评分
  - 准确度验证
  - 质量标签
  - 预计工时: 6小时

#### Day 3-4: 权限和访问控制

- [ ] **任务 6.2.1**: RLS 策略配置
  - 产品库: 公开读取，管理员写入
  - 进销存: 租户隔离
  - 预计工时: 8小时

- [ ] **任务 6.2.2**: API 访问控制
  - API Key 管理
  - 速率限制
  - 预计工时: 6小时

#### Day 5: 数据导出和备份

- [ ] **任务 6.3.1**: 数据导出
  - 支持 CSV、Excel、JSON 格式
  - 批量导出
  - 预计工时: 6小时

- [ ] **任务 6.3.2**: 自动备份
  - 定时备份任务
  - 版本回滚
  - 预计工时: 6小时

---

## 🗓️ Phase 7: 测试和优化（1周）

### Week 7.1: 全面测试（5天）

#### Day 1-2: 单元测试

- [ ] **任务 7.1.1**: 领域层单元测试
  - 实体测试
  - 值对象测试
  - 领域服务测试
  - 预计工时: 10小时

- [ ] **任务 7.1.2**: 应用层单元测试
  - Use Case 测试
  - 应用服务测试
  - 预计工时: 10小时

#### Day 3-4: 集成测试和 E2E 测试

- [ ] **任务 7.2.1**: API 集成测试
  - 所有 API 端点测试
  - 错误处理测试
  - 预计工时: 10小时

- [ ] **任务 7.2.2**: E2E 测试
  - 产品导入完整流程
  - 进销存集成流程
  - 溯源码生成和查询流程
  - 预计工时: 12小时

#### Day 5: 性能测试

- [ ] **任务 7.3.1**: 性能基准测试
  - 查询响应时间
  - 批量导入性能
  - 并发测试
  - 预计工时: 8小时

---

## 🗓️ Phase 8: 文档和发布（1周）

### Week 8.1: 文档和部署（5天）

#### Day 1-2: 技术文档

- [ ] **任务 8.1.1**: API 文档
  - OpenAPI/Swagger 文档
  - 使用示例
  - 预计工时: 8小时

- [ ] **任务 8.1.2**: 开发文档
  - 架构设计文档
  - 数据库设计文档
  - 部署指南
  - 预计工时: 10小时

#### Day 3-4: 用户文档

- [ ] **任务 8.2.1**: 用户手册
  - 产品库使用指南
  - 数据导入教程
  - 溯源码操作手册
  - 预计工时: 10小时

- [ ] **任务 8.2.2**: 视频教程
  - 录制操作视频
  - 预计工时: 8小时

#### Day 5: 发布准备

- [ ] **任务 8.3.1**: 代码审查和优化
  - 代码审查
  - 性能优化
  - 安全审计
  - 预计工时: 8小时

- [ ] **任务 8.3.2**: 发布和部署
  - 生产环境部署
  - 数据迁移（如需要）
  - 监控系统配置
  - 预计工时: 8小时

---

## 🗓️ Phase 9: 智能搜索引擎（1周）← 新增

### Week 10.1: 搜索引擎基础设施（5天）

#### Day 1-2: PostgreSQL 全文搜索

- [ ] **任务 9.1.1**: PostgreSQL 全文搜索集成
  - 使用 `tsvector` 和 `tsquery`
  - 创建全文搜索索引
  - 支持中文分词（`zhparser` 插件）
  - 预计工时: 10小时

- [ ] **任务 9.1.2**: 全文搜索 API
  - `interface-adapters/api/routes/search-fulltext.ts`
  - API 端点:
    ```
    GET    /api/product-library/search/fulltext?q=...     - 全文搜索
    POST   /api/product-library/search/fulltext           - 高级搜索
    GET    /api/product-library/search/suggestions?q=...  - 搜索建议
    ```
  - 支持多字段搜索（名称、描述、规格、SKU）
  - 支持拼音搜索
  - 预计工时: 8小时

#### Day 3-4: Pinecone 向量搜索

- [ ] **任务 9.2.1**: 向量嵌入服务
  - `infrastructure/external-services/EmbeddingService.ts`
  - 集成 OpenAI/本地 Embedding 模型
  - 产品描述向量化
  - 预计工时: 10小时

- [ ] **任务 9.2.2**: Pinecone 向量搜索集成
  - 已有 Pinecone 基础设施（进销存模块已用）
  - 创建产品向量索引
  - 语义搜索 API
  - API 端点:
    ```
    POST   /api/product-library/search/semantic           - 语义搜索
    GET    /api/product-library/products/:id/similar      - 相似产品推荐
    ```
  - 预计工时: 10小时

#### Day 5: 混合搜索策略

- [ ] **任务 9.3.1**: 混合搜索编排
  - `application/services/HybridSearchService.ts`
  - 全文搜索 + 向量搜索 + 规则过滤
  - 结果融合和排序
  - 预计工时: 10小时

### Week 10.2: AI 增强和智能功能（3天）

#### Day 6-7: AI 搜索增强

- [ ] **任务 9.4.1**: AI 查询理解
  - 集成 Dify AI（已有基础设施）
  - 自然语言查询解析
  - 意图识别（找产品、比价、找配件）
  - API 端点:
    ```
    POST   /api/product-library/search/ai                 - AI 智能搜索
    ```
  - 示例: “帮我找适合 Macbook Pro 2024 的内存条，16GB 以上”
  - 预计工时: 12小时

- [ ] **任务 9.4.2**: 智能搜索建议
  - 热门搜索词统计
  - 拼写纠错
  - 同义词扩展
  - 个性化推荐（基于用户历史）
  - 预计工时: 8小时

#### Day 8: 搜索 UI 组件

- [ ] **任务 9.5.1**: 智能搜索组件
  - `interface-adapters/components/SmartSearchBar.tsx`
  - 自动完成（Autocomplete）
  - 搜索历史
  - 热门搜素词展示
  - 预计工时: 10小时

- [ ] **任务 9.5.2**: 搜索结果展示
  - `interface-adapters/components/SearchResults.tsx`
  - 多结果类型展示（整机、配件、零件）
  - 相关性排序
  - 筛选和排序面板
  - 预计工时: 8小时

- [ ] **任务 9.5.3**: 相似产品推荐
  - `interface-adapters/components/SimilarProducts.tsx`
  - 产品详情页展示相似产品
  - “看了又看”、“买了又买”推荐
  - 预计工时: 6小时

---

## 📊 总体时间表

| Phase       | 内容               | 工期     | 预计工时                  |
| ----------- | ------------------ | -------- | ------------------------- | ------ |
| Phase 1     | 基础设施搭建       | 1周      | 36小时                    |
| Phase 2     | 核心功能开发       | 2周      | 94小时（原88 + 6）        |
| Phase 3     | 数据导入系统       | 1.5周    | 66小时                    |
| Phase 4     | 进销存集成         | 1周      | 40小时                    |
| Phase 5     | 溯源码插件         | 1.5周    | 64小时                    |
| Phase 6     | 高级功能           | 1周      | 40小时                    |
| Phase 7     | 测试和优化         | 1周      | 50小时                    |
| Phase 8     | 文档和发布         | 1周      | 52小时                    |
| **Phase 9** | **智能搜索引擎**   | **1周**  | **48小时**                | ← 新增 |
| **总计**    | **完整产品库模块** | **11周** | **490小时（原442 + 48）** |

---

## 🎯 里程碑

### Milestone 1: 基础框架完成（Week 1 结束）

- ✅ 模块架构搭建
- ✅ 数据库 Schema 设计完成
- ✅ 品牌库 CRUD 可用

### Milestone 2: 产品库核心完成（Week 2 结束）

- ✅ 整机库、配件库、部件库完整功能
- ✅ 产品搜索和筛选
- ✅ 前端管理界面可用

### Milestone 3: 数据导入可用（Week 3.5 结束）

- ✅ CSV/Excel/API 导入
- ✅ 数据清洗和验证
- ✅ 导入向导界面

### Milestone 4: 进销存集成完成（Week 4 结束）

- ✅ 产品库引用机制
- ✅ 从产品库导入功能
- ✅ 数据同步策略

### Milestone 5: 溯源码插件完成（Week 5.5 结束）

- ✅ QR Code/RFID/NFC 生成
- ✅ 溯源码管理 API
- ✅ 生命周期事件追踪

### Milestone 6: 生产就绪（Week 7 结束）

- ✅ 全面测试通过
- ✅ 性能优化完成
- ✅ 安全审计通过

### Milestone 7: 正式发布（Week 8 结束）

- ✅ 文档完整
- ✅ 生产环境部署
- ✅ 监控和告警配置

### Milestone 8: 智能搜索引擎完成（Week 10 结束）← 新增

- ✅ PostgreSQL 全文搜索集成
- ✅ Pinecone 向量搜索集成
- ✅ AI 增强搜索（语义理解）
- ✅ 智能推荐和相关搜索

### Milestone 9: 正式发布（Week 11 结束）

- ✅ 文档完整
- ✅ 生产环境部署
- ✅ 监控和告警配置

---

## 👥 人员配置建议

### 最小团队（3人）

- **后端开发** (1人): Phase 1-4, Phase 6
- **前端开发** (1人): Phase 2, Phase 3.2, Phase 5.2
- **全栈开发** (1人): Phase 5, Phase 7, Phase 8

### 理想团队（5人）

- **后端开发** (2人): 核心 API、数据导入、溯源码服务
- **前端开发** (1人): 管理界面、导入向导、溯源界面
- **DevOps** (1人): 数据库优化、部署、监控
- **测试工程师** (1人): 测试用例、自动化测试

---

## ⚠️ 风险和缓解策略

### 风险 1: 数据迁移复杂性

- **风险**: 现有产品数据迁移到新结构可能出现问题
- **缓解**:
  - Phase 1 采用并行运行策略
  - 编写数据迁移脚本和回滚方案
  - 先在测试环境完整验证

### 风险 2: 性能瓶颈

- **风险**: 大量产品数据导致查询缓慢
- **缓解**:
  - 提前设计索引策略
  - 引入 Redis 缓存
  - Phase 7 进行性能测试和优化

### 风险 3: 第三方 API 集成问题

- **风险**: 同行数据源 API 不稳定
- **缓解**:
  - 实现重试机制和熔断器
  - 数据本地缓存
  - 离线导入作为备选方案

### 风险 4: 溯源码唯一性冲突

- **风险**: 分布式环境下溯源码冲突
- **缓解**:
  - 使用 UUID v7 + 分布式 ID 生成器
  - 数据库唯一约束
  - 冲突检测和重试机制

---

## 📈 成功指标

### 技术指标

- [ ] API 响应时间 P95 < 200ms
- [ ] 批量导入速度 > 1000条/分钟
- [ ] 溯源码生成速度 > 10000个/分钟
- [ ] 系统可用性 > 99.9%

### 业务指标

- [ ] 产品库数据量 > 10万条
- [ ] 导入成功率 > 95%
- [ ] 进销存集成使用率 > 80%
- [ ] 用户满意度 > 4.5/5

---

## 🚀 快速启动

### 立即可以开始的 Task

1. **任务 1.1.1**: 创建模块目录结构（4小时）
2. **任务 1.2.1**: 数据库设计文档（6小时）
3. **任务 1.1.2**: TypeScript 配置（2小时）

### 依赖关系图

```
Phase 1 (基础设施)
  ↓
Phase 2 (核心功能) ← 可并行
Phase 3 (数据导入) ← 可并行
  ↓
Phase 4 (进销存集成)
  ↓
Phase 5 (溯源码插件)
  ↓
Phase 6 (高级功能)
  ↓
Phase 7 (测试)
  ↓
Phase 8 (发布)
```

---

**准备好了吗？我们可以立即开始 Phase 1 的开发！** 🎯
