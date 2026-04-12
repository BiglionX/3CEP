# ProdCycleAI - 智能循环经济平台

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-blue)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-blue)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

🚀 **一站式智能循环经济解决方案** | 🌍 **绿色可持续发展** | 💡 **AI 驱动的智能匹配**

</div>

---

## 🦞 Proclaw Desktop - AI 驱动的商业操作系统 (NEW!)

> **全新桌面端产品** - 统一入口、离线优先、技能扩展

我们推出了 **Proclaw Desktop**，基于 Tauri + React 的桌面应用平台，为中小企业提供：

- 🤖 **经营智能体**: 统一管理所有业务智能体的顶层 AI
- 📦 **内置核心模块**: 产品库 + 进销存 AI
- 🛍️ **技能商店**: 可扩展的功能生态（类似 VS Code 插件）
- ⚡ **离线优先**: SQLite 本地存储 + Supabase 云端同步
- 🔐 **企业级安全**: SQLCipher 加密 + 技能沙箱隔离

**快速开始**:

```bash
# 一键初始化 Proclaw 桌面端项目
cd d:\BigLionX\3cep
.\scripts\init-proclaw.ps1
```

📚 **完整文档**: [Proclaw 文档中心](./docs/PROCLAW_INDEX.md) | [技术方案](./docs/PROCLAW_TECHNICAL_PLAN.md) | [开发计划](./docs/PROCLAW_DEVELOPMENT_PLAN.md)

---

## 🚀 一键启动指南

### 快速开始 (3 分钟内完成)

```bash
# 1. 克隆项目并进入目录
git clone <repository-url>
cd 3cep

# 2. 环境配置 (自动检测并配置)
npm run setup:env

# 3. 一键启动开发环境
npm run dev:quick

# 4. 访问应用
# 浏览器打开: http://localhost:3001
```

### 生产环境部署

```bash
# 一键生产部署
npm run deploy:prod

# 或者使用脚本部署
./deploy-production.sh
```

---

## ✅ 最小验证流程

### 基础功能验证

```bash
# 1. 环境健康检查
npm run check:health

# 2. 数据库连接验证
npm run verify:database

# 3. 核心API测试
npm run test:core-api

# 4. 完整功能验证
npm run verify:minimal
```

### 预期验证结果

✅ 环境变量配置正确
✅ 数据库连接正常
✅ 核心 API 接口可用
✅ 基本业务流程通畅

---

## ❓ 常见问题解答

### 环境配置问题

**Q: 环境变量缺失怎么办？**
A: 运行 `npm run setup:env` 自动配置或手动复制 `.env.example` 到 `.env.local`

**Q: Node.js 版本不兼容？**
A: 推荐使用 Node.js 18+ 版本，可通过 `nvm install 18` 安装

### 启动问题

**Q: 端口被占用怎么办？**
A: 修改 `.env.local` 中的 `PORT` 变量或停止占用进程

**Q: 数据库连接失败？**
A: 检查 Supabase 配置和网络连接，运行 `npm run verify:database` 诊断

### 功能使用问题

**Q: 如何添加新的维修店？**
A: 通过管理后台 `/admin/shops` 或调用相关 API 接口

**Q: n8n 工作流如何配置？**
A: 参考 `docs/deployment/n8n-workflow-deployment-guide.md`

### 性能优化

**Q: 应用启动较慢？**
A: 使用 `npm run dev:fast` 启动开发服务器

**Q: 数据库查询慢？**
A: 检查索引配置，参考 `docs/technical-docs/database-optimization.md`

---

## 📚 项目概览

### 核心功能模块

#### 🖥️ 桌面端产品 (NEW!)

- 🦞 **Proclaw Desktop** - AI 驱动的商业操作系统
  - 🤖 经营智能体 (统一协调所有业务智能体)
  - 📦 产品库管理 (五库设计 + BOM)
  - 📊 进销存 AI (智能预测 + 自动补货)
  - 🛍️ 技能商店 (可扩展生态)
  - ⚡ 离线优先架构

#### 🌐 Web 端平台

- 🛠️ **智能维修预约系统** - AI驱动的预约匹配和调度
- 🔄 **循环经济交易平台** - 废旧物品回收与再利用
- 🤖 **B2B 采购智能体** - 智能化供应商匹配和谈判 (FixCycle 4.0)
- 🌍 **国际贸易采购平台** - 跨境采购智能决策系统
- 👥 **智能用户管理系统** - AI驱动的用户行为分析和个性化服务 ⭐
- 📊 **数据分析仪表板** - 实时业务洞察和决策支持
- 🔧 **维修教程系统** - 结构化维修知识库
- 🏪 **智能体市场平台** - 完整的 Agent 商业化生态系统 ⭐ 新增
- 🎯 **市场运营管理系统** - 开发者管理、收益统计、运营数据分析 ⭐ 新增
- 📦 **产品库管理系统** - 五级产品层次化管理（品牌/整机/配件/部件/零件）⭐ 新增
- 🤖 **进销存 AI 系统** - 智能预测、自动补货、库存健康分析 ⭐ 新增

### 技术架构

#### Web 端架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js 14    │────│   Supabase      │────│   PostgreSQL    │
│   前端应用       │    │   后端服务       │    │   数据存储       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   n8n 工作流    │    │   Redis 缓存    │    │   第三方集成    │
│   自动化处理     │    │   性能优化       │    │   API服务       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│国际贸易采购平台  │    │智能用户管理系统  │
│智能决策引擎     │    │AI推荐与自动化    │
└─────────────────┘    └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│  产品库管理系统  │    │  进销存 AI 系统  │
│五级层次化管理   │    │智能预测与补货    │
└─────────────────┘    └─────────────────┘
```

#### 桌面端架构 (Proclaw)

```
┌─────────────────────────────────────────────┐
│        Proclaw Desktop (Tauri 2.0)          │
├─────────────────────────────────────────────┤
│  经营智能体 (Operating Agent)                │
│  ├─ 自然语言指令解析                         │
│  ├─ 跨模块数据联动                           │
│  └─ 智能决策建议                             │
├─────────────────────────────────────────────┤
│  内置核心模块                                │
│  ├─ 产品库 (五库设计 + BOM)                  │
│  ├─ 进销存 AI (自动化盘点)                   │
│  └─ 技能商店 (可扩展生态)                    │
├─────────────────────────────────────────────┤
│  Tauri Core (Rust)                          │
│  ├─ SQLite + SQLCipher (本地加密数据库)      │
│  ├─ 离线队列 + 增量同步                      │
│  └─ 原生功能 (通知/文件系统/自动更新)         │
└─────────────────────────────────────────────┘
         ↕ WebSocket / HTTPS
┌─────────────────────────────────────────────┐
│        Cloud Backend (Supabase)              │
├─────────────────────────────────────────────┤
│  Authentication & Authorization              │
│  Real-time Sync                              │
│  Edge Functions (AI Orchestration)           │
│  Vector DB (Pinecone - 智能搜索)             │
└─────────────────────────────────────────────┘
```

---

## 🛠️ 开发指南

### 本地开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 运行测试
npm run test

# 代码格式化
npm run format

# 代码检查
npm run lint
```

### 项目结构

```
src/
├── app/              # Next.js 应用路由
├── components/       # React 组件库
├── services/         # 业务服务层
├── lib/             # 工具库和配置
├── models/          # 数据模型定义
├── hooks/           # React 自定义钩子
├── b2b-procurement-agent/  # B2B 采购智能体 (FixCycle 4.0)
│   ├── services/     # 智能服务模块
│   ├── models/       # 数据模型
│   └── types/        # 类型定义
├── modules/         # 功能模块
│   └── procurement-intelligence/  # 采购智能升级模块
│       ├── core/     # 核心引擎
│       ├── services/ # 扩展服务
│       └── ui-components/ # 前端组件
└── admin/           # 管理后台模块
    ├── marketplace/  # 市场运营管理 ⭐ 新增
    │   └── page.tsx  # 市场运营数据面板
    ├── developers/   # 开发者管理 ⭐ 新增
    │   └── page.tsx  # 开发者列表与管理
    ├── agent-store/  # 智能体商店管理
    │   └── page.tsx  # 智能体审核与上下架
    ├── product-library/  # 产品库管理 ⭐ 新增
    │   └── page.tsx  # 产品库管理面板
    ├── inventory-ai/  # 进销存 AI ⭐ 新增
    │   └── page.tsx  # 库存预测与补货面板
    └── components/   # 管理组件
        ├── UserStatsDashboard.tsx    # 用户统计面板
        ├── AdvancedUserSearch.tsx    # 高级搜索组件
        ├── OperationHistory.tsx      # 操作历史组件
        ├── BehaviorAnalyticsPanel.tsx # 行为分析面板
        └── SmartGroupingPanel.tsx    # 智能分组面板

supabase/
├── migrations/      # 数据库迁移脚本
├── functions/       # Supabase 函数
└── config.toml      # Supabase 配置

docs/               # 项目文档
scripts/            # 自动化脚本
tests/              # 测试文件
```

---

## 📖 详细文档

### 🎯 快速入门

- [快速启动指南](./QUICK_START.md) - 5 分钟快速上手
- [开发环境搭建](./docs/guides/development-setup.md) - 完整开发环境配置

### 📚 技术文档

#### Proclaw 桌面端 (NEW!)

- [Proclaw 文档中心](./docs/PROCLAW_INDEX.md) - 一站式文档导航 ⭐ 新增
- [Proclaw 技术方案](./docs/PROCLAW_TECHNICAL_PLAN.md) - 完整技术架构设计 ⭐ 新增
- [Proclaw 开发计划](./docs/PROCLAW_DEVELOPMENT_PLAN.md) - 26周详细任务分解 ⭐ 新增
- [Proclaw 快速启动](./docs/PROCLAW_QUICK_START.md) - 环境搭建 step-by-step ⭐ 新增
- [Proclaw 路线图](./docs/PROCLAW_ROADMAP.md) - 可视化时间轴和里程碑 ⭐ 新增
- [Proclaw 项目总结](./docs/PROCLAW_PROJECT_SUMMARY.md) - 核心价值与关键数据 ⭐ 新增

#### Web 端平台

- [架构设计文档](./docs/technical-docs/architecture-design.md) - 系统架构详解
- [API 接口文档](./OPENAPI_SPEC.yaml) - RESTful API 规范
- [数据库设计](./docs/technical-docs/database-schema.md) - 数据模型和关系
- [智能用户管理系统技术规范](./docs/technical-docs/smart-user-management-specification.md) - AI驱动的用户管理系统 ⭐
- [智能体清单](./docs/technical-docs/agents-inventory.md) - 智能体清单与分级 ⭐
- [采购智能体升级方案](./docs/modules/procurement-intelligence/upgrade-specification.md) - FixCycle 4.0 升级规范 ⭐
- [市场运营管理 API 参考](./docs/technical-docs/admin-modules-api-reference.md) - 市场运营 API 详解 ⭐ 新增
- [智能体市场平台架构](./docs/technical-docs/agent-marketplace-architecture.md) - 市场平台技术架构 ⭐ 新增
- [产品库模块文档](./docs/product-library-module.html) - 五级产品层次化管理 ⭐ 新增
- [进销存AI模块文档](./docs/inventory-ai-module.html) - 智能库存预测与补货 ⭐ 新增

### 🎯 使用指南

#### Proclaw 桌面端 (NEW!)

- [Proclaw 快速启动指南](./docs/PROCLAW_QUICK_START.md) - 10分钟环境搭建 ⭐ 新增
- [Proclaw 开发规范](./docs/PROCLAW_TECHNICAL_PLAN.md#5-模块设计规范) - 技能包开发规范 ⭐ 新增

#### Web 端平台

- [智能用户管理快速参考](./docs/guides/user-management-quick-reference.md) - 用户管理操作指南 ⭐
- [市场运营管理指南](./docs/guides/marketplace-operations-guide.md) - 市场运营操作手册 ⭐ 新增
- [开发者入驻指南](./docs/guides/developer-onboarding.md) - 开发者入驻流程 ⭐ 新增
- [快速启动指南](./QUICK_START.md) - 5 分钟快速上手
- [开发环境搭建](./docs/guides/development-setup.md) - 完整开发环境配置

### 🚀 部署运维

- [生产部署指南](./docs/deployment/production-deployment.md) - 生产环境部署
- [运维手册](./docs/deployment/operations-manual.md) - 日常运维操作
- [监控告警配置](./docs/deployment/monitoring-setup.md) - 系统监控方案

### 🧪 测试报告

- [测试汇总报告](./docs/reports/test-summary-report.md) - 测试执行总结
- [部署验收报告](./docs/reports/deployment-acceptance-report.md) - 部署质量验收
- [智能体市场平台测试报告](./reports/marketplace-full-completion-report.md) - 市场平台完整测试 ⭐ 新增
- [管理后台功能验收报告](./reports/management-pages-completion-report.md) - 管理后台功能验收 ⭐ 新增
- [市场运营管理开发报告](./reports/2026-03-23-marketplace-admin-development-report.md) - 市场运营后台开发 ⭐ 新增
- [每日开发进展总结](./reports/2026-03-23-daily-development-summary.md) - 最新开发进展 ⭐ 新增

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 遵循 ESLint 和 Prettier 配置
- 编写单元测试覆盖核心逻辑
- 更新相关文档

---

## 📄 许可证

## 📄 法律文件

- [LICENSE](LICENSE) - MIT开源许可证
- [CONTRIBUTING](CONTRIBUTING.md) - 贡献指南
- [SECURITY](SECURITY.md) - 安全政策
- [PRIVACY](PRIVACY.md) - 隐私政策
- [TERMS](TERMS.md) - 服务条款
- [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md) - 行为准则
- [SUPPORT](SUPPORT.md) - 支持指南

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 📞 支持与联系

- 📧 邮箱: support@fixcycle.com
- 🐛 问题跟踪: [GitHub Issues](https://github.com/username/repository/issues)
- 💬 技术讨论: [Discussions](https://github.com/username/repository/discussions)
- 📱 微信: @ProdCycleAISupport

---

<div align="center">
  <sub>Built with ❤️ by the ProdCycleAI Team</sub>
</div>

---

## 🏗️ 文件夹结构对齐 (v6.2)

自 2026 年 3 月 4 日起，项目完成了**文件夹结构对齐计划**，实现清晰的模块化架构：

```
src/
├── modules/          # 业务模块层 (8 个核心模块)
├── tech/             # 技术基建层 (5 个技术层)
├── app/              # Next.js App Router
├── components/       # UI组件库
└── ...              # 共享资源
```

**关键成果**：

- ✅ 删除重复目录 12+ 个
- ✅ 目录精简 41% (29 → 17 个)
- ✅ 更新导入路径 68 个文件
- ✅ 建立清晰的模块化架构规范

📄 **详细报告**: [`reports/FOLDER_STRUCTURE_ALIGNMENT_COMPLETION_REPORT.md`](reports/FOLDER_STRUCTURE_ALIGNMENT_COMPLETION_REPORT.md)
