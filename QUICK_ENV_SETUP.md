# 📝 .env.dev 快速配置指南

## 🎯 只需配置这 3 个变量！

打开 `.env.dev` 文件，找到并替换以下内容：

---

### 1️⃣ Supabase 服务角色密钥（必需）

**找到这一行**:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_dev_service_role_key_here
```

**替换为**（从 Supabase 控制台获取）:

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...你的实际密钥
```

**获取方法**:

1. 访问 https://supabase.com
2. 登录你的账号
3. 选择项目 `hrjqzbhqueleszkvnsen`
4. 点击左侧 **Project Settings** (齿轮图标)
5. 选择 **API**
6. 在 **Service Role key** 下点击 **Reveal** 显示密钥
7. 复制完整的密钥（以 `eyJ` 开头的长字符串）

---

### 2️⃣ 数据库密码（必需）

**找到这一行**:

```bash
DATABASE_URL=postgresql://postgres:[DEV-PASSWORD]@db.hrjqzbhqueleszkvnsen.supabase.co:5432/postgres
```

**替换为**（将 `[DEV-PASSWORD]` 改为实际密码）:

```bash
DATABASE_URL=postgresql://postgres:MySecurePassword123!@db.hrjqzbhqueleszkvnsen.supabase.co:5432/postgres
```

**获取/重置密码方法**:

1. 在 Supabase 控制台进入 **Settings** → **Database**
2. 点击 **Reset Database Password**
3. 设置一个新密码（例如：`MySecurePassword123!`）
4. 保存密码
5. 替换 URL 中的 `[DEV-PASSWORD]`

---

### 3️⃣ JWT 密钥（必需）

**找到这一行**（可能在文件中部）:

```bash
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
```

**替换为**（可以随机生成一个）:

```bash
JWT_SECRET=super-secret-jwt-key-for-development-only-2026-fixcycle-abc123xyz
```

**提示**: 可以使用任意强密码，建议包含：

- 大小写字母
- 数字
- 特殊字符
- 至少 32 个字符

**在线生成器**（可选）:

- https://generate-secret.vercel.app/32
- 或使用 PowerShell 命令：
  ```powershell
  -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
  ```

---

## ✅ 配置完成后验证

保存 `.env.dev` 文件，然后运行：

```powershell
# 1. 验证环境配置
npm run verify:environment

# 2. 健康检查
npm run check:health

# 3. 启动开发服务器
npm run dev
```

如果一切正常，你会看到：

- ✅ 环境验证通过
- ✅ 健康检查评分 > 70%
- 🚀 开发服务器启动在 http://localhost:3001

---

## 📋 完整示例

配置完成后的 `.env.dev` 应该像这样（部分）：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://hrjqzbhqueleszkvnsen.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_5e-tqlrRNyKW3fAmWJipIQ_1-fjS711
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyanF6YmhxdWVsZXN6a3Zuc2VuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwOTQwMDAwMCwiZXhwIjoxNzQwOTM2MDAwfQ.你的实际密钥签名

# 数据库连接
DATABASE_URL=postgresql://postgres:MySecurePassword123!@db.hrjqzbhqueleszkvnsen.supabase.co:5432/postgres

# JWT 配置
JWT_SECRET=super-secret-jwt-key-for-development-only-2026-fixcycle-abc123xyz

# ... 其他配置保持不变 ...
```

---

## ⚠️ 常见问题

### Q: 找不到 JWT_SECRET 配置项？

A: 如果没有这一行，可以手动添加到 `.env.dev` 文件中。

### Q: 密码包含特殊字符怎么办？

A: 使用 URL 编码或避免使用 `@`、`:`、`/` 等字符。

### Q: 配置后仍然报错？

A: 运行以下命令查看详细错误：

```powershell
npm run check:health
```

---

## 💡 不需要 Scoop！

**重要**: 你完全不需要安装 Scoop 或其他包管理器来完成这个配置。只需：

1. ✅ 打开 `.env.dev` 文件
2. ✅ 替换上述 3 个变量
3. ✅ 保存文件
4. ✅ 运行验证命令

就这么简单！

---

**最后更新**: 2026-03-03
**预计耗时**: 5-10 分钟
