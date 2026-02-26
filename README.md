# ProdCycleAI - 智能循环经济平台

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-blue)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-blue)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

🚀 **一站式智能循环经济解决方案** | 🌍 **绿色可持续发展** | 💡 **AI 驱动的智能匹配**

</div>

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

- 🛠️ **智能维修预约系统** - AI 驱动的预约匹配和调度
- 🔄 **循环经济交易平台** - 废旧物品回收与再利用
- 🤖 **B2B 采购智能体** - 自动化供应商匹配和谈判
- 📊 **数据分析仪表板** - 实时业务洞察和决策支持
- 🔧 **维修教程系统** - 结构化维修知识库

### 技术架构

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
└── hooks/           # React 自定义钩子

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

- [架构设计文档](./docs/technical-docs/architecture-design.md) - 系统架构详解
- [API 接口文档](./OPENAPI_SPEC.yaml) - RESTful API 规范
- [数据库设计](./docs/technical-docs/database-schema.md) - 数据模型和关系
- [智能体清单](./docs/technical-docs/agents-inventory.md) - 智能体清单与分级 ⭐ 新增

### 🚀 部署运维

- [生产部署指南](./docs/deployment/production-deployment.md) - 生产环境部署
- [运维手册](./docs/deployment/operations-manual.md) - 日常运维操作
- [监控告警配置](./docs/deployment/monitoring-setup.md) - 系统监控方案

### 🧪 测试报告

- [测试汇总报告](./docs/reports/test-summary-report.md) - 测试执行总结
- [部署验收报告](./docs/reports/deployment-acceptance-report.md) - 部署质量验收

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
