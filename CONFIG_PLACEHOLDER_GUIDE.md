# 配置文件占位符替换指南

## 📊 当前状态

✅ **已完成自动替换**：

- Supabase URL 和 Anon Key 已统一配置
- n8n 本地开发地址已配置

⚠️ **需要手动替换的敏感信息**（33 个占位符）：

### 1. 开发环境 (.env.dev) - 11 个占位符

```bash
# Supabase 服务角色密钥（用于服务端操作）
SUPABASE_SERVICE_ROLE_KEY=your_dev_service_role_key_here

# 数据库密码
DATABASE_URL=postgresql://postgres:[DEV-PASSWORD]@db.hrjqzbhqueleszkvnsen.supabase.co:5432/postgres

# Stripe 支付配置（如使用支付功能）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_dev_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_dev_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_dev_webhook_secret

# AI API 密钥
DEEPSEEK_API_KEY=sk-dev-your-api-key-here
QWEN_API_KEY=sk-dev-your-qwen-api-key-here

# Pinecone 向量数据库
PINECONE_API_KEY=your_dev_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_dev_pinecone_environment_here

# Weaviate 向量数据库
WEAVIATE_HOST=your_dev_weaviate_host_here
WEAVIATE_API_KEY=your_dev_weaviate_api_key_here
```

### 2. 预发布环境 (.env.stage) - 11 个占位符

```bash
# Supabase 服务角色密钥
SUPABASE_SERVICE_ROLE_KEY=your_stage_service_role_key_here

# 数据库密码
DATABASE_URL=postgresql://postgres:[STAGE-PASSWORD]@db.hrjqzbhqueleszkvnsen.supabase.co:5432/postgres

# Stripe 支付配置
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stage_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stage_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stage_webhook_secret

# AI API 密钥
DEEPSEEK_API_KEY=sk-stage-your-api-key-here
QWEN_API_KEY=sk-stage-your-qwen-api-key-here

# Pinecone 向量数据库
PINECONE_API_KEY=your_stage_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_stage_pinecone_environment_here

# Weaviate 向量数据库
WEAVIATE_HOST=your_stage_weaviate_host_here
WEAVIATE_API_KEY=your_stage_weaviate_api_key_here
```

### 3. 生产环境 (.env.prod) - 11 个占位符

```bash
# Supabase 服务角色密钥
SUPABASE_SERVICE_ROLE_KEY=your_prod_service_role_key_here

# 数据库密码
DATABASE_URL=postgresql://postgres:[PROD-PASSWORD]@db.hrjqzbhqueleszkvnsen.supabase.co:5432/postgres

# Stripe 支付配置（生产环境）
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_production_publishable_key_here
STRIPE_SECRET_KEY=sk_live_your_production_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret

# AI API 密钥
DEEPSEEK_API_KEY=sk-prod-your-api-key-here
QWEN_API_KEY=sk-prod-your-qwen-api-key-here

# Pinecone 向量数据库
PINECONE_API_KEY=your_prod_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_prod_pinecone_environment_here

# Weaviate 向量数据库
WEAVIATE_HOST=your_prod_weaviate_host_here
WEAVIATE_API_KEY=your_prod_weaviate_api_key_here
```

## 🔧 获取这些密钥的方法

### Supabase 配置

1. 登录 [Supabase](https://supabase.com)
2. 选择项目 `hrjqzbhqueleszkvnsen`
3. 进入 **Project Settings** → **API**
4. 复制以下密钥：
   - `service_role key` (secret key) - 用于服务端操作
   - `anon public` key - 已自动配置

### 数据库密码

1. 在 Supabase 控制台进入 **Settings** → **Database**
2. 点击 **Reset Database Password**
3. 设置新密码并保存
4. 替换 `[DEV-PASSWORD]`、`[STAGE-PASSWORD]`、`[PROD-PASSWORD]`

### Stripe 配置（如使用支付功能）

1. 登录 [Stripe Dashboard](https://dashboard.stripe.com)
2. 开发环境：进入 **Developers** → **API keys**
   - 复制 `Publishable key` 和 `Secret key`
3. 生产环境：切换到 **Production mode**
   - 复制生产环境的 API 密钥

### AI API 密钥

#### DeepSeek

1. 访问 [DeepSeek 开放平台](https://platform.deepseek.com)
2. 登录/注册账号
3. 进入 **API Keys** 页面
4. 创建新的 API Key
5. 分别配置开发、预发布、生产环境的密钥

#### 通义千问 (Qwen)

1. 访问 [阿里云百炼平台](https://dashscope.aliyun.com)
2. 登录阿里云账号
3. 进入 **API-KEY 管理**
4. 创建 API Key
5. 分别配置各环境

### Pinecone 配置

1. 登录 [Pinecone Console](https://app.pinecone.io)
2. 进入 **API Keys** 页面
3. 复制 API Key
4. Environment 在你的索引创建时指定（如 `us-east-1-gcp`）

### Weaviate 配置

1. 登录 [Weaviate Cloud Console](https://console.weaviate.cloud)
2. 选择或创建集群
3. 在集群详情页面找到：
   - Cluster URL (Host)
   - API Key

## ✅ 验证步骤

完成配置后，按以下步骤验证：

### 1. 运行环境验证

```bash
npm run verify:environment
```

### 2. 运行健康检查

```bash
npm run check:health
```

### 3. 运行完整测试套件

```bash
npm run test:all:quick
```

## 🔒 安全提醒

- ⚠️ **切勿**将 `.env.*` 文件提交到 Git
- ✅ 使用 `.env.example` 作为模板分享给团队
- 🔐 生产环境密钥应使用环境变量管理工具（如 Vercel Environment Variables）
- 🔄 定期轮换敏感密钥
- 👥 限制团队成员对生产密钥的访问权限

## 📝 快速配置脚本

可以使用以下命令快速开始开发环境：

```bash
# 1. 复制示例配置
npm run setup:env:copy

# 2. 编辑 .env.dev 文件，填入你的密钥
# 使用你喜欢的编辑器打开 .env.dev

# 3. 验证配置
npm run verify:environment

# 4. 启动开发服务器
npm run dev
```

## 💡 常见问题

### Q: 我可以只配置开发环境吗？

A: 可以！如果只在本地开发，只需配置 `.env.dev` 即可。`.env.stage` 和 `.env.prod` 用于部署。

### Q: 必须配置所有 AI API 吗？

A: 不是必须的。AI API 是可选的，如果不使用相关功能，可以保留占位符或使用 mock 值。

### Q: Stripe 必须配置吗？

A: 如果不需要支付功能，可以不配置 Stripe 相关变量。

### Q: Pinecone 和 Weaviate 都要配置吗？

A: 建议至少配置一个向量数据库以支持智能推荐功能。如果都不配置，部分 AI 功能将不可用。

---

**最后更新**: 2026-03-03
**文档版本**: 1.0
