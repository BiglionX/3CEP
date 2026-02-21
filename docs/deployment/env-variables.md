# 环境变量与密钥管理指南

## 概述

本文档详细说明项目的环境变量配置和密钥管理策略，确保本地开发和 CI/CD 环境的安全性和一致性。

## 环境变量分类

### 1. 基础配置变量

```bash
# 应用基础配置
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=FixCycle
NODE_ENV=development
TENANCY_MODE=multi
```

### 2. 数据库与认证变量

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://hrjqzbhqueleszkvnsen.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_5e-tqlrRNyKW3fAmWJipIQ_1-fjS711
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# 数据库连接（直接连接）
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.hrjqzbhqueleszkvnsen.supabase.co:5432/postgres

# JWT 认证配置
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_EXPIRES_IN=24h
```

### 3. 第三方服务密钥

```bash
# Stripe 支付配置
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# AI 服务配置
DEEPSEEK_API_KEY=sk-your-api-key-here
DEEPSEEK_API_URL=https://api.deepseek.com/v1
QWEN_API_KEY=sk-your-qwen-api-key-here
QWEN_API_URL=https://dashscope.aliyuncs.com/api/v1

# 向量数据库配置
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_pinecone_environment_here
PINECONE_INDEX_NAME=supplier-match-index
WEAVIATE_HOST=your_weaviate_host_here
WEAVIATE_API_KEY=your_weaviate_api_key_here
```

### 4. 系统集成变量

```bash
# n8n 工作流配置
NEXT_PUBLIC_N8N_URL=https://n8n.yourdomain.com

# 智能体服务配置
AGENTS_API_KEY=test-agents-api-key

# RBAC 权限配置
RBAC_CONFIG_PATH=./config/rbac.json

# 审计日志配置
AUDIT_LOG_PATH=./logs
AUDIT_LOG_RETENTION_DAYS=90
```

## 环境隔离策略

### 开发环境 (Development)
```bash
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# 使用开发环境的测试密钥
```

### 预发布环境 (Staging)
```bash
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://stage.fixcycle.com
# 使用独立的预发布密钥
```

### 生产环境 (Production)
```bash
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://fixcycle.com
# 使用正式的生产密钥
```

## 密钥安全管理

### 1. 本地开发安全

**.env.local 文件管理：**
```bash
# 本地开发专用配置
.env.local          # 本地环境变量（不提交到仓库）
.env.development    # 开发环境模板
.env.staging        # 预发布环境模板
.env.production     # 生产环境模板
```

**Git 忽略配置：**
```gitignore
# 环境变量文件
.env.local
.env.*.local
.env.development
.env.staging
.env.production

# 敏感配置文件
config/secrets/
logs/
```

### 2. CI/CD 密钥管理

**GitHub Actions Secrets 配置：**
```yaml
# 在 GitHub 仓库设置中配置以下 Secrets：
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
DEEPSEEK_API_KEY
QWEN_API_KEY
JWT_SECRET
SLACK_WEBHOOK_URL
APPROVAL_SECRET
PROD_APPROVERS
```

**CI 环境变量注入：**
```yaml
# .github/workflows/ci.yml
env:
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
  STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
  DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
```

### 3. 密钥轮换策略

**定期轮换：**
- JWT 密钥：每 90 天轮换一次
- API 密钥：每 6 个月轮换一次
- 数据库密码：每年轮换一次

**轮换流程：**
1. 生成新密钥
2. 在 CI/CD 中更新 Secrets
3. 部署新配置
4. 验证功能正常
5. 废弃旧密钥

## 配置验证

### 1. 本地验证脚本

```bash
#!/bin/bash
# scripts/validate-env-config.js

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'NODE_ENV'
];

function validateEnvironment() {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ 缺少必要的环境变量:', missingVars);
    process.exit(1);
  }
  
  console.log('✅ 环境变量配置验证通过');
}

validateEnvironment();
```

### 2. CI 验证步骤

```yaml
# CI 配置中的环境验证
- name: Validate environment configuration
  run: |
    node scripts/validate-env-config.js
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
    NODE_ENV: test
```

## 安全最佳实践

### 1. 访问控制
- 限制对 Secrets 配置的访问权限
- 使用最小权限原则
- 启用双因素认证

### 2. 监控告警
- 监控密钥使用情况
- 设置异常访问告警
- 定期安全审计

### 3. 备份恢复
- 定期备份密钥配置
- 建立紧急恢复流程
- 测试恢复程序

## 故障排除

### 常见问题

**Q: 环境变量未生效？**
A: 检查变量前缀，`NEXT_PUBLIC_` 开头的变量才能在客户端使用

**Q: CI 构建失败缺少环境变量？**
A: 确认在 GitHub Secrets 中正确配置了所有必需变量

**Q: 本地开发环境变量冲突？**
A: 使用 `.env.local` 覆盖默认配置，避免提交敏感信息

### 调试命令

```bash
# 检查当前环境变量
printenv | grep NEXT_PUBLIC_

# 验证环境配置
npm run validate:env

# 重新加载环境变量
source .env.local
```

## 版本控制

- `.env.example` 作为模板文件提交到仓库
- 所有环境特定的 `.env` 文件都不提交
- 使用文档说明配置方法
- 定期更新配置模板