# 🦞 Proclaw Desktop - AI 驱动的商业操作系统

> 统一桌面端平台，整合经营智能体、产品库、进销存和技能商店

[![Status](https://img.shields.io/badge/status-planning-blue)]()
[![Version](https://img.shields.io/badge/version-0.1.0-orange)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

---

## 🚀 快速开始

### 一键初始化 (推荐)

```powershell
# Windows PowerShell
cd d:\BigLionX\3cep
.\scripts\init-proclaw.ps1
```

### 手动启动

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入 Supabase 凭证

# 3. 启动开发模式
npm run tauri dev
```

详细指南: [PROCLAW_QUICK_START.md](./docs/PROCLAW_QUICK_START.md)

---

## 📚 文档导航

| 文档                                              | 说明                     | 阅读时间    |
| ------------------------------------------------- | ------------------------ | ----------- |
| [📘 项目总结](./docs/PROCLAW_PROJECT_SUMMARY.md)  | 从这里开始！完整方案概览 | 15分钟      |
| [🔧 技术方案](./docs/PROCLAW_TECHNICAL_PLAN.md)   | 技术架构、选型、设计细节 | 60分钟      |
| [📅 开发计划](./docs/PROCLAW_DEVELOPMENT_PLAN.md) | 26周详细任务分解         | 45分钟      |
| [🗺️ 路线图](./docs/PROCLAW_ROADMAP.md)            | 可视化时间轴和里程碑     | 20分钟      |
| [🚀 快速启动](./docs/PROCLAW_QUICK_START.md)      | 环境搭建 step-by-step    | 10分钟+实践 |
| [📑 文档索引](./docs/PROCLAW_INDEX.md)            | 一站式文档中心           | 5分钟       |

**推荐阅读路径**:

- 👨‍💻 **开发者**: Quick Start → Dev Plan → 开始编码
- 🔧 **Tech Lead**: Summary → Tech Plan → Roadmap → Dev Plan
- 📊 **产品经理**: Summary → Roadmap → Dev Plan
- 💼 **投资人**: Summary → Tech Plan (成本章节) → Roadmap

---

## ✨ 核心特性

### 🤖 经营智能体 (Operating Agent)

统一管理所有业务智能体的顶层 AI，支持自然语言指令和跨模块联动。

### 📦 内置核心模块

- **产品库**: 五库设计 (品牌/整机/配件/部件/零件) + BOM 管理
- **进销存 AI**: 自动化盘点、智能补货、销售预测
- **技能商店**: 可扩展的功能生态，类似 VS Code 插件

### ⚡ 离线优先架构

SQLite 本地存储 + Supabase 云端同步，保证弱网环境下正常工作。

### 🔐 企业级安全

- SQLCipher 本地数据库加密
- Supabase RLS 行级安全
- 技能沙箱隔离 (Web Worker)

---

## 🛠️ 技术栈

```
前端框架:   Tauri 2.0 + React 18 + TypeScript
UI 组件:    MUI 7.x + Tailwind CSS
状态管理:   Zustand + React Query
本地数据库: SQLite + SQLCipher + Drizzle ORM
云端后端:   Supabase (PostgreSQL + Auth + Realtime)
AI 集成:    Dify + Pinecone Vector DB
测试框架:   Vitest + Playwright
```

---

## 📅 开发路线图

```
2026 Q2 (4-6月):  Phase 0 - 技术验证 (4周)
                  Phase 1 - MVP 开发 (8周)

2026 Q3 (7-9月):  Phase 2 - 技能商店 (6周)

2026 Q4 (10-12月): Phase 3 - 智能体编排 (8周)
                   🚀 v1.0 正式发布
```

详细路线图: [PROCLAW_ROADMAP.md](./docs/PROCLAW_ROADMAP.md)

---

## 📊 关键指标

### 技术指标

- 启动时间 < 3秒
- 内存占用 < 200MB
- 安装包大小 < 15MB
- API P95 < 500ms
- 同步成功率 > 99%

### 产品指标 (12个月目标)

- 活跃用户: 4,000+
- 30天留存率: > 40%
- NPS: > 30
- 技能数量: 200+
- 付费转化率: > 5%

### 商业指标 (12个月目标)

- 月收入: ¥200,000
- LTV/CAC: > 10

---

## 🏗️ 项目结构

```
proclaw-desktop/
├── src/                    # React 前端
│   ├── components/         # UI 组件
│   ├── pages/              # 页面路由
│   ├── lib/                # 工具库 (Supabase Client)
│   ├── db/                 # 本地数据库 (SQLite)
│   └── sync/               # 数据同步引擎
├── src-tauri/              # Rust 后端
│   ├── src/
│   │   └── main.rs
│   └── Cargo.toml
├── docs/                   # 项目文档
│   ├── PROCLAW_*.md
│   └── ...
├── scripts/                # 自动化脚本
│   └── init-proclaw.ps1
└── package.json
```

---

## 🤝 贡献指南

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 代码规范

- 遵循 TypeScript 严格模式
- 使用 ESLint + Prettier 格式化
- 编写单元测试 (Vitest)
- 提交前运行 `npm test`

### Commit 规范

采用 Conventional Commits:

```
feat: 添加新功能
fix: 修复 Bug
docs: 更新文档
style: 代码格式调整
refactor: 重构代码
test: 添加测试
chore: 构建/工具链相关
```

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 📞 联系我们

- **GitHub Issues**: 报告问题或提出建议
- **Discord**: 加入社区讨论 (待创建)
- **邮箱**: tech@proclaw.ai (待配置)

---

## 🙏 致谢

本项目受到以下开源项目的启发:

- [OpenClaw](https://github.com/openclaw/openclaw) - 插件系统架构
- [Tauri](https://tauri.app/) - 轻量级桌面框架
- [Supabase](https://supabase.com/) - 开源 Firebase 替代方案

---

**🚀 让我们一起构建未来!**

_最后更新: 2026-04-11_
_版本: v0.1.0 (Planning)_
