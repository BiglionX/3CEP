# GitHub Actions CI/CD 配置指南

## 🚀 自动化流水线设置

### 1. 创建必要的Secrets

在GitHub仓库设置中添加以下Secrets：

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_organization_id
VERCEL_PROJECT_ID=your_project_id
```

### 2. 流水线功能

✅ **代码质量检查**
- ESLint代码规范检查
- TypeScript类型检查
- 单元测试运行

✅ **自动化测试**
- Jest单元测试
- 边界条件测试
- Playwright端到端测试

✅ **智能部署**
- PR预览环境自动部署
- 主分支生产环境自动部署
- 构建产物缓存优化

### 3. 触发条件

- **Push到main/develop分支**: 运行完整CI/CD流程
- **Pull Request**: 运行测试并在Vercel创建预览环境
- **多Node版本测试**: 确保兼容性

### 4. 性能优化

- 依赖缓存加速构建
- 并行测试执行
- 构建产物复用

## 📊 监控集成

流水线集成了以下监控工具：
- 测试覆盖率报告
- 性能基准测试
- 错误日志收集
- 部署状态通知

## 🔧 自定义配置

根据项目需求调整：
- 测试矩阵中的Node版本
- 部署环境配置
- 通知规则设置