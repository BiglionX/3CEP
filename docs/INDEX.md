# Procyc 项目文档中心

## 🚀 快速入口

### 🎯 用户入口
- [快速入门指南](./user-guides/getting-started.md) - 5分钟上手平台使用
- [网站地图](./SITE_MAP.md) - 完整功能导航

### 👨‍💼 企业用户入口
- [企业服务指南](./user-guides/enterprise-guide.md) - 企业客户使用手册
- [产品服务官文档](./technical-docs/product-service-officer.md) - 售后服务管理说明
- [企业管理后台](./technical-docs/enterprise-admin.md) - 企业管理系统文档

### 👨‍💻 开发者入口
- [项目说明书](./project-overview/project-specification.md) - 完整项目概览
- [技术架构文档](./technical-docs/system-architecture.md) - 系统设计详解
- [API参考文档](./technical-docs/api-documentation.md) - 接口使用指南

### 🛠️ 运维入口
- [部署操作手册](./technical-docs/deployment-guide.md) - 生产环境部署
- [版本更新日志](./release-notes/changelog.md) - 版本变更记录
- [安全管理指南](./technical-docs/security-guide.md) - 系统安全配置

## 🚀 一键启动指南

想要快速开始开发？请查看我们的 [快速启动指南](../QUICK_START.md)

### 🎯 最快上手路径

```bash
# 1. 环境设置
git clone <repository-url>
cd 3cep
npm run setup:env

# 2. 健康检查
npm run check:health

# 3. 本地部署
npm run deploy:dev

# 4. 数据初始化
npm run seed

# 5. 启动开发
npm run dev
```

访问地址：http://localhost:3001

## 📚 文档结构

### 🎯 项目概览 (Project Overview)

包含项目整体规划、商业模式和技术架构

- [`project-specification.md`](./project-overview/project-specification.md) - 项目说明书 (整合版) ⭐ 新增
- [`development-roadmap.md`](./project-overview/development-roadmap.md) - 发展路线图
- [`business-model.md`](./project-overview/business-model.md) - 商业模式
- [`technical-architecture.md`](./project-overview/technical-architecture.md) - 技术架构

### 🔧 核心模块文档

包含各功能模块的详细技术规范

- [`modules-overview.md`](./modules/modules-overview.md) - 模块概览文档
- [`维修联盟模块`](./modules/repair-service/detailed-documentation.md) - 维修联盟(FixCycle 1.0)核心模块 ⭐ 升级
- [`b2b-procurement-spec.md`](./modules/b2b-procurement/specification.md) - B2B采购模块规范
- [`data-center-spec.md`](./modules/data-center/specification.md) - 数据中心模块规范
- [`fcx-alliance-spec.md`](./modules/fcx-alliance/specification.md) - FCX联盟模块规范

### 👥 用户指南 (User Guides)

面向不同用户的使用手册和操作指南

- [`getting-started.md`](./user-guides/getting-started.md) - 快速入门指南 ⭐ 新增
- [`admin-guide.md`](./user-guides/admin-guide.md) - 管理员操作手册
- [`developer-guide.md`](./user-guides/developer-guide.md) - 开发者使用指南
- [`api-reference.md`](./user-guides/api-reference.md) - API接口参考

### ⚙️ 技术文档 (Technical Docs)

系统架构、数据库设计和开发规范

- [`system-architecture.md`](./technical-docs/system-architecture.md) - 系统架构设计 (整合版)
- [`database-design.md`](./technical-docs/database-design.md) - 数据库设计方案
- [`api-documentation.md`](./technical-docs/api-documentation.md) - API接口文档
- [`deployment-guide.md`](./technical-docs/deployment-guide.md) - 部署操作手册 (整合版)

### 📝 版本发布 (Release Notes)

版本更新、迁移指南和升级说明

- [`changelog.md`](./release-notes/changelog.md) - 更新日志
- [`migration-guide.md`](./release-notes/migration-guide.md) - 迁移指南
- [`upgrade-notes.md`](./release-notes/upgrade-notes.md) - 升级说明

### 📊 项目报告 (Reports)

开发进展、测试结果和性能分析

- [`development-progress-summary-2026.md`](./reports/development-progress-summary-2026.md) - 2026年度开发进展总结
- [`latest-development-progress-summary-2026.md`](./reports/latest-development-progress-summary-2026.md) - 最新开发进展报告
- [`technical-docs-vs-project-plan-gap-analysis.md`](./reports/technical-docs-vs-project-plan-gap-analysis.md) - 技术文档与规划对比分析
- 其他专项报告详见 [reports/](./reports/) 目录

### 🗃️ 历史归档 (Archived)

过时但仍有价值的文档资料

- [`historical-reports/`](./archived/historical-reports/) - 历史报告文档
- [`legacy-docs/`](./archived/legacy-docs/) - 旧版技术文档



### ⚙️ 技术文档 (Technical Docs)

包含系统架构、数据库设计和技术规范

- [`architecture-design.md`](./technical-docs/architecture-design.md) - 技术架构设计
- [`database-schema.md`](./technical-docs/database-schema.md) - 数据库模式设计
- [`procurement-agent-spec.md`](./technical-docs/procurement-agent-spec.md) - 采购智能体技术规范
- [`warehouse-management-spec.md`](./technical-docs/warehouse-management-spec.md) - 仓储管理系统技术规范
- [`bert-integration-research.md`](./technical-docs/bert-integration-research.md) - BERT 集成技术研究
- [`n8n-integration-scenarios.md`](./technical-docs/n8n-integration-scenarios.md) - n8n 智能体集成场景示例
- [`agents-inventory.md`](./technical-docs/agents-inventory.md) - 智能体清单与分级 ⭐ 新增

### 📊 项目报告 (Reports)

包含项目进展、测试结果和性能分析

- [`development-progress-summary-2026.md`](./reports/development-progress-summary-2026.md) - 2026 年度开发进展总结报告 ⭐ 新增
- [`technical-docs-vs-project-plan-gap-analysis.md`](./reports/technical-docs-vs-project-plan-gap-analysis.md) - 技术文档与规划对比分析 ⭐ 已更新
- [`core-features-development.md`](./reports/core-features-development.md) - 核心功能开发报告 ⭐ 已更新
- [`current-status.md`](./reports/current-status.md) - 项目当前状态报告
- [`execution-summary.md`](./reports/execution-summary.md) - 综合执行报告
- [`testing-summary.md`](./reports/testing-summary.md) - 系统测试总结
- [`performance-report.md`](./reports/performance-report.md) - 性能测试报告
- [`data-center-progress.md`](./reports/data-center-progress.md) - 数据中心开发进度
- [`fcx-system-progress.md`](./reports/fcx-system-progress.md) - FCX 系统升级进展
- [`a5-task-completion.md`](./reports/a5-task-completion.md) - A5 任务完成报告
- [`admin-layout-implementation.md`](./reports/admin-layout-implementation.md) - 管理布局实现报告
- [`bert-integration-progress.md`](./reports/bert-integration-progress.md) - BERT 集成进度报告
- [`cron-execution-summary.md`](./reports/cron-execution-summary.md) - 定时任务执行总结
- [`database-production-ready.md`](./reports/database-production-ready.md) - 数据库生产就绪报告
- [`data-management-deployment.md`](./reports/data-management-deployment.md) - 数据管理部署报告
- [`deployment-execution.md`](./reports/deployment-execution.md) - 部署执行报告
- [`fcx-ecosystem-update.md`](./reports/fcx-ecosystem-update.md) - FCX 生态系统更新
- [`first-stage-acceptance.md`](./reports/first-stage-acceptance.md) - 第一阶段验收报告
- [`first-two-weeks-development.md`](./reports/first-two-weeks-development.md) - 前两周开发报告
- [`initial-data-seeding-completion.md`](./reports/initial-data-seeding-completion.md) - 初始数据播种完成报告
- [`issue-diagnosis.md`](./reports/issue-diagnosis.md) - 问题诊断报告
- [`large-model-integration-implementation.md`](./reports/large-model-integration-implementation.md) - 大模型集成实现报告
- [`mid-term-development-progress.md`](./reports/mid-term-development-progress.md) - 中期开发进度
- [`module4-b2b-agent-development-summary.md`](./reports/module4-b2b-agent-development-summary.md) - 模块 4 B2B 代理开发总结
- [`module4-b2b-agent-progress.md`](./reports/module4-b2b-agent-progress.md) - 模块 4 B2B 代理进度
- [`module4-development-dashboard.md`](./reports/module4-development-dashboard.md) - 模块 4 开发仪表板
- [`operation-dashboard-implementation.md`](./reports/operation-dashboard-implementation.md) - 运营仪表板实现报告
- [`production-deployment-preparation.md`](./reports/production-deployment-preparation.md) - 生产部署准备报告
- [`progress-summary.md`](./reports/progress-summary.md) - 进度总结
- [`task-adjustment-summary.md`](./reports/task-adjustment-summary.md) - 任务调整总结
- [`weekly-development-w7.md`](./reports/weekly-development-w7.md) - 第 7 周开发周报

### 🚀 部署文档 (Deployment)

包含部署指南、配置说明和上线检查清单

- [`deployment-status.md`](./deployment/deployment-status.md) - 部署状态报告
- [`production-deployment.md`](./deployment/production-deployment.md) - 生产环境部署报告
- [`database-deployment.md`](./deployment/database-deployment.md) - 数据库部署指南
- [`deployment-checklist.md`](./deployment/deployment-checklist.md) - 部署检查清单
- [`final-deployment-confirmation.md`](./deployment/final-deployment-confirmation.md) - 最终部署确认
- [`github-actions-setup.md`](./deployment/github-actions-setup.md) - GitHub Actions 设置
- [`performance-monitoring-setup.md`](./deployment/performance-monitoring-setup.md) - 性能监控设置
- [`production-deployment-checklist.md`](./deployment/production-deployment-checklist.md) - 生产部署检查清单

### 📖 用户指南 (Guides)

包含各功能模块的使用说明和操作指南

- [`admin-system-guide.md`](./guides/admin-system-guide.md) - 管理系统使用指南
- [`user-management-guide.md`](./guides/user-management-guide.md) - 用户管理模块指南
- [`rbac-permissions-guide.md`](./guides/rbac-permissions-guide.md) - RBAC 权限管理指南
- [`parts-management-guide.md`](./guides/parts-management-guide.md) - 配件管理部署指南
- [`cron-job-deployment-guide.md`](./guides/cron-job-deployment-guide.md) - 定时任务部署指南
- [`backup-strategy-guide.md`](./guides/backup-strategy-guide.md) - 备份策略指南
- [`third-party-keys-guide.md`](./guides/third-party-keys-guide.md) - 第三方密钥部署指南
- [`shop-review-guide.md`](./guides/shop-review-guide.md) - 店铺审核功能指南
- [`link-review-guide.md`](./guides/link-review-guide.md) - 链接审核模块指南
- [`global-shops-seeding-guide.md`](./guides/global-shops-seeding-guide.md) - 全球店铺播种指南
- [`initial-data-seeding-guide.md`](./guides/initial-data-seeding-guide.md) - 初始数据播种指南
- [`data-center-user-guide.md`](./guides/data-center-user-guide.md) - 数据中心用户指南
- [`quick-start-guide.md`](./guides/quick-start-guide.md) - 快速开始指南
- [`one-click-deployment-guide.md`](./guides/one-click-deployment-guide.md) - 一键部署指南

### 👥 角色使用指南 (Role Guides)

按角色提供快速入门与常见任务指引

- [`admin.md`](./role-guides/admin.md) - 管理员角色指引 ⭐ 新增
- [`ops.md`](./role-guides/ops.md) - 运维角色指引 ⭐ 新增
- [`biz.md`](./role-guides/biz.md) - 业务角色指引 ⭐ 新增
- [`analyst.md`](./role-guides/analyst.md) - 分析师角色指引 ⭐ 新增
- [`partner.md`](./role-guides/partner.md) - 合作伙伴角色指引 ⭐ 新增

## 📈 文档维护说明

### 文档命名规范

- 使用小写字母和连字符
- 采用描述性文件名
- 统一使用 `.md` 扩展名

### 更新频率

- 核心规划文档：每月更新
- 技术文档：随版本更新
- 进展报告：每周更新
- 部署文档：按需更新

### 版本控制

- 重要文档保留备份版本
- 使用 Git 进行版本管理
- 重大变更需要审核

---

_最后更新：2026 年 2 月 23 日_
