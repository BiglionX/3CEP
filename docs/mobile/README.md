# 移动端开发文档索引

> 📱 PWA → React Native 渐进式路线实施指南

本目录包含完整的移动端开发文档，支持从 PWA 到 React Native 的渐进式演进。

---

## 🚀 快速开始

### 新手入门

- [环境搭建](./development/getting-started.md) - 配置开发环境
- [项目结构说明](../PWA_TO_RN_MIGRATION_PLAN.md) - 理解目录结构
- [开发第一个功能](./development/first-feature.md) - Hello World 教程

### 核心概念

- [Monorepo 架构设计](./architecture/monorepo-design.md) - 代码组织方式
- [模块共享策略](./architecture/module-sharing-strategy.md) - 如何复用 Web 端代码
- [导航系统设计](./architecture/navigation-design.md) - React Navigation 使用

---

## 📚 文档分类

### 🏗️ 架构设计 (`architecture/`)

深入理解项目架构和技术决策:

- **Monorepo 架构** - 使用 Turborepo 管理多项目
- **模块共享策略** - 最大化代码复用
- **导航系统设计** - Stack + Tab 导航方案
- **状态管理方案** - Zustand 跨平台复用
- **API 层设计** - 统一的 API 调用层

### 🛠️ 开发指南 (`development/`)

日常开发需要的实用指南:

- **组件开发** - UI组件开发流程
- **导航使用** - 页面跳转和参数传递
- **调试技巧** - Chrome DevTools, React Native Debugger
- **测试编写** - Jest + Detox 测试方案
- **性能优化** - 性能分析和优化技巧

### 📦 部署发布 (`deployment/`)

应用上架和发布流程:

- **App Store 发布** - iOS 上架完整流程
- **Google Play 发布** - Android 上架流程
- **CI/CD配置** - GitHub Actions 自动化
- **版本管理** - 版本号和更新策略
- **热更新方案** - CodePush 使用指南

### 🔄 迁移指南 (`migration/`)

从 PWA 逐步迁移到 RN:

- **Phase 1: PWA 优化** - 当前阶段任务清单
- **Phase 2: RN 预研** - 技术验证和 MVP
- **Phase 3: 迁移步骤** - 完整迁移流程
- **代码复用示例** - 实际复用案例

### ⚡ 性能优化 (`performance/`)

提升应用性能的最佳实践:

- **优化技巧** - 实用的性能优化方法
- **最佳实践** - 避免常见陷阱
- **常见问题 FAQ** - 疑难问题解答

---

## 🎯 实施路线图

### Phase 1: PWA 优化 (当前 - 3 个月)

**目标**: 最大化利用 Next.js，快速提供移动端能力

✅ **已完成**:

- [x] 预留移动端目录结构
- [x] 创建文档架构
- [ ] Service Worker 优化
- [ ] 移动端 UX 优化
- [ ] 安装引导优化
- [ ] 性能监控集成

📋 **下一步**:

1. 完善 PWA功能
2. 优化移动端体验
3. 收集用户反馈

详细文档：[Phase 1 实施指南](./migration/phase1-pwa-optimization.md)

---

### Phase 2: RN 预研 (3-6 个月)

**目标**: 验证技术可行性，建立开发流程

计划内容:

- 技术选型调研
- Monorepo 架构搭建
- MVP Demo 开发
- 团队培训

详细文档：[Phase 2 准备指南](./migration/phase2-rn-preparation.md)

---

### Phase 3: 双轨并行 (6-12 个月)

**目标**: PWA 与 RN 并存，差异化服务

计划内容:

- Monorepo 落地
- 核心模块迁移
- 两端同步维护

详细文档：[Phase 3 迁移步骤](./migration/phase3-migration-steps.md)

---

## 🔧 开发工具

### 必备工具

- **Node.js** >= 18.x
- **Watchman** (macOS)
- **CocoaPods** (iOS 开发)
- **Android Studio** (Android 开发)

### IDE 插件

- ESLint
- Prettier
- React Native Tools
- GitLens

### 调试工具

- Chrome DevTools
- React Native Debugger
- Flipper

---

## 📊 代码复用率

| 模块类型   | 复用率 | 说明            |
| ---------- | ------ | --------------- |
| 业务服务   | 100%   | 完全复用 Web 端 |
| 业务 Hooks | 100%   | 完全复用        |
| 类型定义   | 100%   | 完全复用        |
| 工具函数   | 95%    | 少量平台适配    |
| 状态管理   | 90%    | 存储层适配      |
| API 调用   | 100%   | 完全复用        |
| UI组件     | 0%     | 完全重写        |

详细说明：[模块共享策略](./architecture/module-sharing-strategy.md)

---

## 🌐 相关链接

### 官方文档

- [React Native 官方文档](https://reactnative.dev/)
- [Expo 文档](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Turborepo 文档](https://turbo.build/repo/docs)

### 内部文档

- [项目主索引](../../INDEX.md)
- [技术栈分析](../../MObILE_TECH_STACK_ANALYSIS.md)
- [迁移规划](../../PWA_TO_RN_MIGRATION_PLAN.md)

---

## 💬 获取帮助

遇到问题？

1. 查看 [常见问题 FAQ](./performance/faq.md)
2. 搜索现有文档
3. 联系移动开发团队

---

## 📝 文档更新记录

- **2026-03-04**: 创建移动端文档体系
- **持续更新**: 根据实施进度同步更新

---

**最后更新**: 2026-03-04  
**维护者**: 移动开发团队
