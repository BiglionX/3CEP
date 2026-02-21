# 🚀 FixCycle CI/CD 流水线实施指南

## 📋 概述

本文档详细说明了 FixCycle 项目的 CI/CD 流水线实施情况，包括分支策略、自动化测试、环境部署和回滚机制。

## 🎯 分支策略

### 分支命名规范

- `main` - 生产环境主分支（受保护）
- `develop` - 开发环境主分支
- `stage` - 预发布环境分支
- `feature/*` - 功能开发分支
- `hotfix/*` - 紧急修复分支

### 分支保护规则

**main 分支保护**:

- ✅ 必须通过所有 CI 检查
- ✅ 至少需要 2 个批准的 Review
- ✅ 代码所有者审查强制开启
- ✅ 禁止强制推送
- ✅ 禁止删除分支

**develop 分支保护**:

- ✅ 代码质量和基础测试检查
- ✅ 至少需要 1 个批准的 Review
- ✅ 允许快速迭代

**stage 分支保护**:

- ✅ 完整的 CI/CD 检查
- ✅ 严格的代码审查
- ✅ 生产环境预演

## 🔧 自动化检查流程

### 1. 代码质量检查

```bash
npm run lint:check      # ESLint 代码规范检查
npm run format:check    # Prettier 代码格式检查
npx tsc --noEmit        # TypeScript 类型检查
```

### 2. 数据库迁移校验

```bash
npm run db:validate     # 语法和格式校验
npm run db:migrate --dry-run  # 迁移预演检查
```

### 3. 完整测试套件

```bash
npm run test:all        # 运行所有测试
npm run test:all --ci   # CI 模式运行
```

包含的测试类型：

- ✅ 单元测试 (Jest)
- ✅ 集成测试
- ✅ 端到端测试 (Playwright)
- ✅ n8n 工作流测试
- ✅ 性能测试
- ✅ 安全检查

### 4. n8n 关键流程冒烟测试

```bash
node tests/n8n/n8n-smoke-test.js
```

验证内容：

- 🏥 n8n 服务健康状态
- 📄 关键工作流文件有效性
- 📤 工作流导入功能
- 🔧 核心 API 接口可用性

## 🌍 环境配置

### 开发环境 (dev)

```bash
# 使用轻量级配置快速验证
docker-compose -f docker-compose.dev.yml up -d
npm run deploy:dev
```

特点：

- 🚀 快速启动和部署
- 💾 轻量级数据库配置
- 🔧 适合日常开发和调试

### 预发布环境 (stage)

```bash
# 接近生产环境的配置
docker-compose -f docker-compose.stage.yml up -d
npm run deploy:stage
```

特点：

- 📊 包含监控和日志组件
- 💾 完整的数据备份机制
- 🔍 生产环境预演验证

### 生产环境 (prod)

```bash
# 严格控制的生产部署
docker-compose -f docker-compose.prod.yml up -d
npm run deploy:prod
```

特点：

- 🔒 禁止手动 SQL 操作
- ⚡ 只能通过流水线部署
- 🔄 完善的回滚机制

## 🔄 回滚机制

### 数据库回滚

```bash
# 回滚数据库迁移
node scripts/db-rollback.js --to=1.2.0
node scripts/db-rollback.js --steps=2
node scripts/db-rollback.js --dry-run  # 预演模式
```

### 完整部署回滚

```bash
# 回滚整个部署
node scripts/rollback-deployment.js full --to=v1.0.0
node scripts/rollback-deployment.js database --to=1.2.0
node scripts/rollback-deployment.js n8n-workflows --to=v0.9.0
```

## 📊 CI/CD 流水线验证

### 运行完整验证

```bash
node scripts/validate-cicd-pipeline.js
```

验证内容包括：

- ✅ 分支保护规则配置
- ✅ CI/CD 流水线配置
- ✅ 测试套件完整性
- ✅ 数据库迁移工具
- ✅ n8n 冒烟测试
- ✅ 环境配置文件
- ✅ 回滚脚本
- ✅ npm 脚本配置

## 🚀 使用流程

### 1. 日常开发流程

```bash
# 1. 创建功能分支
git checkout -b feature/new-feature

# 2. 开发和本地测试
npm run test:all --quick

# 3. 提交代码
git add .
git commit -m "feat: add new feature"

# 4. 推送到远程并创建 PR
git push origin feature/new-feature
```

### 2. Pull Request 流程

1. 创建 PR 到 `develop` 分支
2. 自动触发 CI 检查
3. 代码审查和讨论
4. 通过所有检查后合并

### 3. 预发布部署流程

```bash
# 合并到 stage 分支
git checkout stage
git merge develop
git push origin stage

# 自动部署到预发布环境
# 运行完整测试套件
# 人工验收测试
```

### 4. 生产发布流程

```bash
# 合并到 main 分支
git checkout main
git merge stage
git push origin main

# 自动触发生产部署
# 需要手动审批
# 部署完成后自动验证
```

## 🔧 环境变量配置

### GitHub Secrets 需要配置：

```bash
# 环境相关
STAGE_DB_PASSWORD
STAGE_N8N_ENCRYPTION_KEY
PROD_DB_PASSWORD
PROD_N8N_ENCRYPTION_KEY

# 部署相关
DOCKER_REGISTRY_TOKEN
SLACK_WEBHOOK_URL
APPROVAL_SECRET

# 第三方服务
SENTRY_DSN
NEW_RELIC_LICENSE_KEY
```

### 环境变量文件：

- `.env.dev` - 开发环境
- `.env.stage` - 预发布环境
- `.env.prod` - 生产环境

## 📈 监控和告警

### 集成的监控工具：

- **Prometheus** - 指标收集
- **Grafana** - 数据可视化
- **Fluentd** - 日志收集
- **Elasticsearch/Kibana** - 日志分析

### 告警机制：

- Slack 通知
- 邮件告警
- 手机短信（紧急情况）

## 🛡️ 安全措施

### 代码安全：

- ✅ 依赖安全扫描
- ✅ 代码漏洞检测
- ✅ 敏感信息检查

### 部署安全：

- ✅ 镜像签名验证
- ✅ 网络隔离
- ✅ 访问权限控制

### 运行时安全：

- ✅ 容器安全扫描
- ✅ 运行时防护
- ✅ 异常行为检测

## 📚 相关文档

- [分支保护配置](.github/branch-protection-rules.json)
- [CI/CD 流水线配置](.github/workflows/enhanced-ci-cd.yml)
- [开发环境配置](docker-compose.dev.yml)
- [预发布环境配置](docker-compose.stage.yml)
- [生产环境配置](docker-compose.prod.yml)

## 🆘 故障排除

### 常见问题：

1. **CI 检查失败**

   ```bash
   # 本地重现问题
   npm run test:all --ci
   ```

2. **数据库迁移失败**

   ```bash
   # 语法检查
   npm run db:validate

   # 预演模式
   npm run db:migrate --dry-run
   ```

3. **部署失败**

   ```bash
   # 验证配置
   node scripts/validate-cicd-pipeline.js

   # 手动回滚
   node scripts/rollback-deployment.js full
   ```

### 紧急处理：

1. 立即停止有问题的部署
2. 执行回滚操作
3. 通知相关人员
4. 记录故障原因和解决方案

---

_最后更新: 2026-02-20_
