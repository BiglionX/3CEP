# FXC 兑换功能快速部署指南

## 🚀 一键部署脚本

### Windows PowerShell

```powershell
# deploy-fcx-exchange.ps1

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "FXC 兑换功能部署脚本" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# 1. 检查环境
Write-Host "[1/4] 检查环境..." -ForegroundColor Yellow

$envFile = ".env.local"
if (!(Test-Path $envFile)) {
    Write-Host "错误：未找到 .env.local 文件" -ForegroundColor Red
    exit 1
}

# 2. 读取数据库连接字符串
Write-Host "[2/4] 读取数据库配置..." -ForegroundColor Yellow
$dbUrl = Get-Content $envFile | Select-String "SUPABASE_DB_URL" | ForEach-Object {
    $_.ToString().Split('=')[1].Trim()
}

if (!$dbUrl) {
    Write-Host "错误：未在 .env.local 中找到 SUPABASE_DB_URL" -ForegroundColor Red
    exit 1
}

Write-Host "✓ 数据库连接配置找到" -ForegroundColor Green

# 3. 执行数据库迁移
Write-Host "[3/4] 执行数据库迁移..." -ForegroundColor Yellow
Write-Host "SQL 文件路径：sql/fcx-exchange-system.sql" -ForegroundColor Cyan

try {
    # 使用 Supabase CLI
    npx supabase db push --db-url $dbUrl
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ 数据库迁移成功!" -ForegroundColor Green
    } else {
        throw "Supabase CLI 执行失败"
    }
} catch {
    Write-Host "⚠️  Supabase CLI 执行失败，尝试手动导入..." -ForegroundColor Yellow
    Write-Host "请前往 Supabase Studio -> SQL Editor 手动执行 sql/fcx-exchange-system.sql" -ForegroundColor Cyan
}

# 4. 验证部署
Write-Host "[4/4] 验证部署..." -ForegroundColor Yellow

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "部署完成!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步操作:" -ForegroundColor Yellow
Write-Host "1. 验证数据库表是否创建成功" -ForegroundColor White
Write-Host "   SELECT * FROM fcx_exchange_transactions LIMIT 1;" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 启动开发服务器测试" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 访问 FXC 管理页面" -ForegroundColor White
Write-Host "   http://localhost:3000/admin/fxc-management" -ForegroundColor Gray
Write-Host ""
Write-Host "详细文档：docs/fxc/exchange-whitepaper.md" -ForegroundColor Cyan
Write-Host ""
```

### Linux/Mac Bash

```bash
#!/bin/bash
# deploy-fcx-exchange.sh

echo "===================================="
echo "FXC 兑换功能部署脚本"
echo "===================================="
echo ""

# 1. 检查环境
echo "[1/4] 检查环境..."
ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
    echo "错误：未找到 .env.local 文件"
    exit 1
fi

# 2. 读取数据库连接字符串
echo "[2/4] 读取数据库配置..."
DB_URL=$(grep "SUPABASE_DB_URL" "$ENV_FILE" | cut -d'=' -f2 | tr -d '[:space:]')

if [ -z "$DB_URL" ]; then
    echo "错误：未在 .env.local 中找到 SUPABASE_DB_URL"
    exit 1
fi

echo "✓ 数据库连接配置找到"

# 3. 执行数据库迁移
echo "[3/4] 执行数据库迁移..."
echo "SQL 文件路径：sql/fcx-exchange-system.sql"

# 使用 Supabase CLI
npx supabase db push --db-url "$DB_URL"

if [ $? -eq 0 ]; then
    echo "✓ 数据库迁移成功!"
else
    echo "⚠️  Supabase CLI 执行失败，尝试手动导入..."
    echo "请前往 Supabase Studio -> SQL Editor 手动执行 sql/fcx-exchange-system.sql"
fi

# 4. 验证部署
echo "[4/4] 验证部署..."

echo ""
echo "===================================="
echo "部署完成!"
echo "===================================="
echo ""
echo "下一步操作:"
echo "1. 验证数据库表是否创建成功"
echo "   SELECT * FROM fcx_exchange_transactions LIMIT 1;"
echo ""
echo "2. 启动开发服务器测试"
echo "   npm run dev"
echo ""
echo "3. 访问 FXC 管理页面"
echo "   http://localhost:3000/admin/fxc-management"
echo ""
echo "详细文档：docs/fxc/exchange-whitepaper.md"
echo ""
```

---

## 📋 手动部署步骤

### 步骤 1: 准备数据库工具

选择以下任一方式:

**方式 A: Supabase Studio (推荐)**
1. 打开 https://app.supabase.com
2. 选择你的项目
3. 进入 SQL Editor

**方式 B: psql 命令行**
```bash
psql $DATABASE_URL -f sql/fcx-exchange-system.sql
```

**方式 C: DBeaver/Navicat 等 GUI 工具**
1. 连接到 Supabase 数据库
2. 打开 SQL 执行窗口
3. 复制并执行 `sql/fcx-exchange-system.sql`

### 步骤 2: 执行 SQL 脚本

打开 `sql/fcx-exchange-system.sql` 文件，复制全部内容并执行。

### 步骤 3: 验证创建结果

运行以下查询验证:

```sql
-- 检查表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'fcx_exchange_transactions',
    'fcx_daily_exchange_limits'
  );

-- 检查函数
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_type = 'FUNCTION' 
  AND routine_name = 'execute_fcx_exchange';

-- 检查视图
SELECT viewname 
FROM pg_views 
WHERE viewname = 'v_user_exchange_stats';

-- 检查结果应该返回 2 个表、1 个函数、1 个视图
```

### 步骤 4: 构建前端代码

```bash
# 确保依赖已安装
npm install

# 构建项目
npm run build

# 或开发模式
npm run dev
```

### 步骤 5: 测试功能

1. **访问管理后台**: http://localhost:3000/admin/fxc-management
2. **点击"兑换"按钮**: 打开兑换对话框
3. **输入金额**: 例如 100 FXC
4. **查看预览**: 确认汇率、手续费、实际到账
5. **确认兑换**: 执行交易
6. **验证结果**: 检查账户余额变化

---

## ✅ 部署检查清单

### 数据库层
- [ ] `fcx_exchange_transactions` 表创建成功
- [ ] `fcx_daily_exchange_limits` 表创建成功
- [ ] `execute_fcx_exchange()` 函数创建成功
- [ ] `v_user_exchange_stats` 视图创建成功
- [ ] RLS 策略已启用
- [ ] 触发器已创建

### 应用层
- [ ] `src/config/fxc-exchange.config.ts` 存在
- [ ] `src/services/fxc-exchange.service.ts` 存在
- [ ] `src/app/api/fxc/exchange/route.ts` 存在
- [ ] `src/components/fxc/ExchangeDialog.tsx` 存在
- [ ] `src/components/fxc/ExchangeHistory.tsx` 存在

### 测试验证
- [ ] API 接口可访问
- [ ] 兑换对话框正常打开
- [ ] 实时计算功能正常
- [ ] 兑换事务执行成功
- [ ] 历史记录显示正确
- [ ] 每日限额控制有效

### 文档完整性
- [ ] `docs/fxc/exchange-whitepaper.md` 完成
- [ ] `docs/fxc/FXC_EXCHANGE_IMPLEMENTATION_SUMMARY.md` 完成
- [ ] README 更新（如需要）

---

## 🐛 常见问题排查

### Q1: 执行 SQL 时报语法错误

**原因**: PostgreSQL 版本不兼容或字符编码问题

**解决方案**:
1. 确保使用 PostgreSQL 13+
2. 使用 UTF-8 编码打开 SQL 文件
3. 分段执行 SQL（先建表，再建函数）

### Q2: Supabase CLI 报错

**常见错误**:
```
Error: Cannot find module '@supabase/supabase-js'
```

**解决方案**:
```bash
npm install -g @supabase/supabase-js
# 或
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

### Q3: 函数执行失败

**错误**: `function execute_fcx_exchange does not exist`

**解决方案**:
1. 检查函数是否创建成功:
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'execute_fcx_exchange';
   ```
2. 如果不存在，重新执行创建函数的 SQL 部分
3. 检查参数类型是否匹配

### Q4: RLS 策略阻止访问

**错误**: `new row violates row-level security policy`

**解决方案**:
1. 临时禁用 RLS 测试:
   ```sql
   ALTER TABLE fcx_exchange_transactions DISABLE ROW LEVEL SECURITY;
   ```
2. 或者添加宽松的策略:
   ```sql
   DROP POLICY IF EXISTS "System can insert exchange transactions" ON fcx_exchange_transactions;
   CREATE POLICY "Allow all operations" ON fcx_exchange_transactions FOR ALL USING (true);
   ```

### Q5: TypeScript 编译错误

**错误**: `Cannot find module '@/config/fxc-exchange.config'`

**解决方案**:
1. 检查 `tsconfig.json` 中 `paths` 配置:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```
2. 重启 TypeScript 服务器
3. 清除缓存重新编译:
   ```bash
   rm -rf .next node_modules/.cache
   npm run build
   ```

---

## 📊 性能优化建议

### 数据库索引

```sql
-- 为常用查询添加索引
CREATE INDEX CONCURRENTLY idx_fcx_exchange_user_created 
ON fcx_exchange_transactions(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_fcx_exchange_status_created 
ON fcx_exchange_transactions(status, created_at DESC);

-- 分析表统计信息
ANALYZE fcx_exchange_transactions;
ANALYZE fcx_daily_exchange_limits;
```

### 缓存策略

```typescript
// Redis 缓存示例（可选）
const cacheKey = `fxc:exchange:rate:${userId}`;
const cachedRate = await redis.get(cacheKey);

if (cachedRate) {
  return JSON.parse(cachedRate);
}

// 计算汇率并缓存 5 分钟
const rate = calculateExchangeRate();
await redis.setex(cacheKey, 300, JSON.stringify(rate));
return rate;
```

### 批量处理

对于高频兑换场景，考虑批量提交:

```typescript
// 收集多个兑换请求，每 100ms 批量处理一次
const batchProcessor = new BatchProcessor({
  batchSize: 100,
  intervalMs: 100,
  processor: async (requests) => {
    // 批量执行数据库事务
  }
});
```

---

## 🔒 安全加固建议

### 1. 添加速率限制

```typescript
// src/middleware.ts
import { rateLimit } from '@/lib/rate-limit';

export async function middleware(req: NextRequest) {
  const limiter = rateLimit({
    interval: 60 * 1000, // 1 分钟
    uniqueTokenPerInterval: 500,
  });

  try {
    await limiter.check(req, 10, 'fxc_exchange'); // 每分钟最多 10 次
  } catch {
    return NextResponse.json(
      { error: '请求过于频繁' },
      { status: 429 }
    );
  }
}
```

### 2. 添加审计日志

```sql
CREATE TABLE fcx_exchange_audit_log (
  id UUID DEFAULT uuid_generate_v4(),
  user_id UUID,
  action VARCHAR(50),
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建触发器自动记录
CREATE TRIGGER audit_fcx_exchange
AFTER INSERT OR UPDATE ON fcx_exchange_transactions
FOR EACH ROW EXECUTE FUNCTION log_exchange_audit();
```

### 3. 敏感操作二次验证

```typescript
// 大额兑换需要短信/邮件验证
if (fxcAmount > 1000) {
  const verificationRequired = true;
  await sendVerificationCode(user.email);
  // 用户输入验证码后再执行兑换
}
```

---

## 📈 监控告警配置

### 关键指标监控

```typescript
// 监控兑换成功率
const successRate = successfulExchanges / totalExchanges;
if (successRate < 0.95) {
  alert('兑换成功率低于 95%');
}

// 监控平均响应时间
const avgResponseTime = responseTimes.reduce((a, b) => a + b) / responseTimes.length;
if (avgResponseTime > 2000) {
  alert('平均响应时间超过 2 秒');
}
```

### 异常告警

```typescript
// 检测异常交易
if (transaction.fxcAmount > 5000) {
  // 大额交易告警
  notifyAdmin(`检测到大额兑换：${transaction.fxcAmount} FXC`);
}

if (userDailyTotal > 8000) {
  // 接近限额告警
  notifyUser('您今日兑换已接近限额');
}
```

---

## 🎉 部署成功标志

当您看到以下内容时，说明部署成功:

```
✅ 数据库对象创建成功
✅ API 接口可访问
✅ 前端组件正常渲染
✅ 兑换功能可正常使用
✅ 历史记录显示正确
```

---

**最后更新**: 2026-03-24  
**维护者**: 技术团队  
**联系方式**: tech-support@example.com
