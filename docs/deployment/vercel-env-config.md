# Vercel 环境变量配置指南

## 环境变量映射关系

### 开发环境 (Development)

```bash
# 基础配置
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=FixCycle-Dev

# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://hrjqzbhqueleszkvnsen.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_5e-tqlrRNyKW3fAmWJipIQ_1-fjS711
SUPABASE_SERVICE_ROLE_KEY=your_dev_service_role_key_here

# n8n配置
NEXT_PUBLIC_N8N_URL=http://localhost:5678

# Stripe配置
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_dev_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_dev_secret_key_here

# AI API配置
DEEPSEEK_API_KEY=sk-dev-your-api-key-here
QWEN_API_KEY=sk-dev-your-qwen-api-key-here
```

### 预发布环境 (Staging)

```bash
# 基础配置
NEXT_PUBLIC_SITE_URL=https://stage.fixcycle.com
NEXT_PUBLIC_APP_NAME=FixCycle-Stage

# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://hrjqzbhqueleszkvnsen.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_5e-tqlrRNyKW3fAmWJipIQ_1-fjS711
SUPABASE_SERVICE_ROLE_KEY=your_stage_service_role_key_here

# n8n配置
NEXT_PUBLIC_N8N_URL=https://n8n-stage.fixcycle.com

# Stripe配置
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stage_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stage_secret_key_here

# AI API配置
DEEPSEEK_API_KEY=sk-stage-your-api-key-here
QWEN_API_KEY=sk-stage-your-qwen-api-key-here
```

### 生产环境 (Production)

```bash
# 基础配置
NEXT_PUBLIC_SITE_URL=https://fixcycle.com
NEXT_PUBLIC_APP_NAME=FixCycle

# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://hrjqzbhqueleszkvnsen.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_5e-tqlrRNyKW3fAmWJipIQ_1-fjS711
SUPABASE_SERVICE_ROLE_KEY=your_prod_service_role_key_here

# n8n配置
NEXT_PUBLIC_N8N_URL=https://n8n.fixcycle.com

# Stripe配置
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_production_publishable_key_here
STRIPE_SECRET_KEY=sk_live_your_production_secret_key_here

# AI API配置
DEEPSEEK_API_KEY=sk-prod-your-api-key-here
QWEN_API_KEY=sk-prod-your-qwen-api-key-here
```

## 配置方法

### 方法 1: Vercel 控制台配置

1. 登录[Vercel 控制台](https://vercel.com/dashboard)
2. 选择对应的项目
3. 进入"Settings" → "Environment Variables"
4. 添加上述环境变量
5. 选择适用的环境(Development/Staging/Production)

### 方法 2: 命令行批量配置

```bash
# 安装Vercel CLI
npm install -g vercel

# 登录
vercel login

# 为开发环境设置变量
vercel env add NEXT_PUBLIC_SITE_URL development
vercel env add NEXT_PUBLIC_SUPABASE_URL development
# ... 其他变量

# 为生产环境设置变量
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# ... 其他变量
```

### 方法 3: 通过 API 配置

```javascript
// 使用Vercel API批量设置环境变量
const vercelToken = "your_vercel_token";

async function setEnvironmentVariables(projectId, environment, variables) {
  for (const [key, value] of Object.entries(variables)) {
    await fetch(`https://api.vercel.com/v9/projects/${projectId}/env`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key,
        value,
        target: [environment],
        type: "encrypted",
      }),
    });
  }
}
```

## 安全注意事项

1. **敏感信息保护**:

   - `SUPABASE_SERVICE_ROLE_KEY` 等敏感密钥应加密存储
   - 不要在客户端暴露服务端密钥
   - 定期轮换密钥

2. **环境隔离**:

   - 不同环境使用不同的密钥和配置
   - 避免跨环境共享敏感信息
   - 使用 Vercel 的环境目标功能

3. **访问控制**:
   - 限制对环境变量配置的访问权限
   - 使用团队成员角色管理
   - 启用双因素认证

## 验证配置

配置完成后，可以通过以下方式验证：

```bash
# 检查环境变量是否正确加载
vercel env pull .env.local

# 本地测试构建
npm run build

# 部署测试
vercel --dry-run
```

## 常见问题

### Q: 环境变量没有生效？

A: 检查变量名前缀，`NEXT_PUBLIC_`开头的变量才能在客户端使用

### Q: 如何区分不同环境？

A: 使用 Vercel 的 Preview/Production 环境，或通过自定义域名区分

### Q: 敏感信息如何安全存储？

A: 使用 Vercel 的加密环境变量功能，避免明文存储
