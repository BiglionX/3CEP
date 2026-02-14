# FixCycle 项目文档目录结构

## 📁 文档组织结构

```
根目录/
├── 📄 核心文档
│   ├── PROJECT_README.md              # 项目主说明文档
│   ├── DEV_ROADMAP.md                 # 开发路线图
│   ├── TECHNICAL_ARCHITECTURE.md      # 技术架构文档
│   ├── DATABASE_SCHEMA_BUSINESS.md    # 数据库业务含义说明
│   ├── OPENAPI_SPEC.yaml             # API接口规范
│   └── COMPREHENSIVE_EXECUTION_REPORT.md  # 综合执行报告
│
├── 📋 指南文档
│   ├── QUICK_START_GUIDE.md           # 快速开始指南
│   ├── DATABASE_DEPLOYMENT_GUIDE.md   # 数据库部署指南
│   ├── ADMIN_SYSTEM_GUIDE.md          # 管理系统使用说明
│   ├── PARTS_MANAGEMENT_DEPLOYMENT_GUIDE.md  # 配件管理部署指南
│   ├── USER_MANAGEMENT_MODULE_GUIDE.md       # 用户管理模块指南
│   ├── RBAC_PERMISSIONS_GUIDE.md      # 权限系统说明
│   ├── LINK_REVIEW_MODULE_GUIDE.md    # 链接审核模块指南
│   ├── SHOP_REVIEW_FUNCTIONALITY_GUIDE.md    # 店铺审核功能指南
│   ├── BACKUP_STRATEGY_GUIDE.md       # 备份策略指南
│   ├── CRON_JOB_DEPLOYMENT_GUIDE.md   # 定时任务部署指南
│   ├── THIRD_PARTY_KEYS_DEPLOYMENT_GUIDE.md  # 第三方密钥部署指南
│   ├── GLOBAL_SHOPS_SEEDING_GUIDE.md  # 全球店铺数据填充指南
│   ├── INITIAL_DATA_SEEDING_GUIDE.md  # 初始数据填充指南
│   ├── ONE_CLICK_DEPLOYMENT_GUIDE.md  # 一键部署指南
│   ├── DATABASE_PRODUCTION_READY_REPORT.md   # 数据库生产准备报告
│   ├── DATA_MANAGEMENT_DEPLOYMENT_REPORT.md  # 数据管理部署报告
│   ├── OPERATION_DASHBOARD_IMPLEMENTATION_REPORT.md  # 运营仪表板实现报告
│   ├── ISSUE_DIAGNOSIS_REPORT.md      # 问题诊断报告
│   ├── PERFORMANCE_MONITORING_SETUP.md       # 性能监控设置
│   ├── PERFORMANCE_TEST_REPORT.md     # 性能测试报告
│   └── GITHUB_ACTIONS_SETUP.md        # CI/CD设置指南
│
├── 🧪 测试相关
│   ├── test-results/                  # 测试结果目录
│   │   └── results.json               # 测试执行结果
│   ├── playwright-report/             # Playwright测试报告
│   │   └── index.html                 # HTML测试报告
│   └── tests/                         # 测试脚本目录
│       ├── boundary-e2e.spec.ts       # 边界情况测试
│       ├── consumer-workflow.spec.ts  # 用户工作流测试
│       ├── engineer-workflow.spec.ts    # 工程师工作流测试
│       ├── admin/link-review.spec.ts  # 管理员链接审核测试
│       └── api/auth-endpoints.spec.ts # API认证端点测试
│
├── 🛠️ 脚本工具
│   └── scripts/                       # 自动化脚本目录
│       ├── run-e2e-tests.js           # E2E测试执行脚本
│       ├── prepare-test-data.js       # 测试数据准备脚本
│       ├── verify-database.js         # 数据库验证脚本
│       ├── monitor-database.js        # 数据库监控脚本
│       ├── backup-database.js         # 数据库备份脚本
│       ├── deploy-admin-system.js     # 管理系统部署脚本
│       ├── test-admin-system.js       # 管理系统测试脚本
│       ├── deploy-cron-jobs.js        # 定时任务部署脚本
│       ├── seed-initial-data.js       # 初始数据填充脚本
│       ├── seed-global-shops.js       # 全球店铺数据填充脚本
│       ├── seed-data-api.js           # API数据填充脚本
│       ├── check-cron-execution.js    # 定时任务执行检查脚本
│       ├── monitor-cron-jobs.js       # 定时任务监控脚本
│       ├── diagnose-issue.js          # 问题诊断脚本
│       ├── final-verification.js      # 最终验证脚本
│       ├── simple-deploy.js           # 简单部署脚本
│       ├── create-tables.js           # 表结构创建脚本
│       ├── deploy-rbac-system.js      # RBAC系统部署脚本
│       ├── deploy-link-review-tables.js  # 链接审核表部署脚本
│       ├── verify-rbac-system.js      # RBAC系统验证脚本
│       ├── verify-rls-policies.js     # RLS策略验证脚本
│       ├── verify-third-party-keys.js # 第三方密钥验证脚本
│       ├── verify-database-api.js     # 数据库API验证脚本
│       ├── test-dashboard-api.js      # 仪表板API测试脚本
│       ├── test-link-review.js        # 链接审核测试脚本
│       ├── test-parts-management.js   # 配件管理测试脚本
│       ├── test-user-management.js    # 用户管理测试脚本
│       ├── test-a5-functionality.js   # A5功能测试脚本
│       ├── test-shop-review.js        # 店铺审核测试脚本
│       ├── api-verify.js              # API验证脚本
│       ├── service-key-verify.js      # 服务密钥验证脚本
│       └── data-management-verification.js   # 数据管理验证脚本
│
├── 📊 配置文件
│   ├── package.json                   # 项目依赖配置
│   ├── tsconfig.json                  # TypeScript配置
│   ├── tsconfig.test.json             # 测试TypeScript配置
│   ├── next.config.js                 # Next.js配置
│   ├── tailwind.config.js             # Tailwind CSS配置
│   ├── postcss.config.js              # PostCSS配置
│   ├── playwright.config.ts           # Playwright测试配置
│   ├── jest.config.js                 # Jest测试配置
│   ├── vercel.json                    # Vercel部署配置
│   ├── .env.example                   # 环境变量模板
│   ├── .gitignore                     # Git忽略文件配置
│   └── next-env.d.ts                  # Next.js类型定义
│
├── 🗄️ 数据库相关
│   └── supabase/                      # Supabase配置目录
│       ├── migrations/                # 数据库迁移脚本
│       │   ├── 001_init_schema.sql    # 初始化表结构
│       │   ├── 002_seed_data.sql      # 种子数据
│       │   ├── 003_add_admin_roles.sql # 管理员角色
│       │   ├── 004_enhance_user_profiles.sql # 用户档案增强
│       │   ├── 005_create_link_review_tables.sql # 链接审核表
│       │   ├── 006_create_parts_management_tables.sql # 配件管理表
│       │   ├── 007_seed_parts_data.sql # 配件种子数据
│       │   └── 008_add_user_status_field.sql # 用户状态字段
│       ├── rls_policies.sql           # 行级安全策略
│       ├── config.toml                # Supabase CLI配置
│       └── backup_policy.md           # 备份策略文档
│
├── 📦 SQL脚本
│   ├── complete-deployment.sql        # 完整部署脚本
│   ├── complete-table-structure.sql   # 完整表结构
│   ├── create-missing-tables.sql      # 创建缺失表脚本
│   ├── fix-table-structure.sql        # 修复表结构脚本
│   ├── manual-deploy-links.sql        # 手动部署链接脚本
│   └── one-click-deployment.sql       # 一键部署脚本
│
└── 📈 性能与监控
    ├── performance-test.js            # 性能测试脚本
    ├── comprehensive-performance-test.js  # 综合性能测试
    ├── lighthouse-test.js             # Lighthouse性能测试
    ├── api-functional-test.js         # API功能测试
    ├── stripe-payment-test.js         # Stripe支付测试
    ├── security-check.js              # 安全检查脚本
    ├── vercel-analytics-setup.js      # Vercel分析设置
    └── logs/                          # 日志目录
        ├── status-report-2026-02-14.json  # 状态报告
        └── cron-monitor-report-2026-02-14.json  # 定时任务监控报告
```

## 📚 文档分类说明

### 📄 核心文档（必读）
这些文档构成了项目的基础知识体系：
- **PROJECT_README.md**: 项目总体介绍和快速入门
- **DEV_ROADMAP.md**: 开发计划和阶段性目标
- **TECHNICAL_ARCHITECTURE.md**: 技术架构详细说明
- **DATABASE_SCHEMA_BUSINESS.md**: 数据库业务逻辑说明
- **OPENAPI_SPEC.yaml**: API接口规范定义
- **COMPREHENSIVE_EXECUTION_REPORT.md**: 项目执行综合报告

### 📋 指南文档（按需查阅）
针对特定功能模块和部署场景的详细指南。

### 🧪 测试相关（质量保障）
包含自动化测试脚本、测试报告和验证工具。

### 🛠️ 脚本工具（自动化）
各种部署、验证、监控相关的自动化脚本。

### 📊 配置文件（环境设置）
项目运行所需的各种配置文件。

## 🔄 文档维护原则

1. **及时更新**: 功能变更后及时更新相关文档
2. **版本控制**: 重要文档变更需记录版本信息
3. **交叉引用**: 相关文档之间建立链接关系
4. **简洁明了**: 避免冗余，保持文档精简
5. **实用导向**: 文档内容要贴近实际使用场景

## 📞 文档贡献指南

如有文档改进需求，请：
1. 在GitHub Issues中提出
2. 或直接提交Pull Request
3. 遵循文档编写规范
4. 确保内容准确性和时效性

---
*最后更新：2026年2月14日*