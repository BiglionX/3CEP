# 快速启动指南 - 超时保护与第三方服务集成

## 🚀 快速开始

### 1. 安装依赖

```bash
# 使用 --legacy-peer-deps 避免依赖冲突
npm install @sendgrid/mail twilio --legacy-peer-deps

# 或
yarn add @sendgrid/mail twilio

# 或
pnpm add @sendgrid/mail twilio
```

**注意**: 如果遇到依赖冲突错误，请使用 `--legacy-peer-deps` 参数。

**已安装版本**:
- `@sendgrid/mail`: 8.1.6
- `twilio`: 5.13.1

### 2. 配置环境变量

复制环境变量示例文件并填入真实值：

```bash
cp .env.example.services .env.local
```

编辑 `.env.local`：

```env
# SendGrid 邮件服务
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@fixcycle.com

# Twilio 短信服务
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+861234567890

# Cron 任务密钥（可选）
CRON_SECRET=your_secure_random_secret_here
```

### 3. 执行数据库迁移

使用 Supabase CLI 执行迁移：

```bash
# 方式 1: 执行整合脚本
psql $DATABASE_URL -f supabase/migrations/20260324_execute_all_migrations.sql

# 方式 2: 分别执行
psql $DATABASE_URL -f supabase/migrations/20260324_add_subscription_pause_fields.sql
psql $DATABASE_URL -f supabase/migrations/20260324_create_subscription_reminders.sql
```

或在 Supabase Dashboard 中手动执行 SQL。

### 4. 验证迁移结果

运行验证查询：

```sql
-- 检查 pause fields
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_agent_installations'
  AND column_name IN ('paused_at', 'resumed_at', 'pause_reason');

-- 检查 reminders 表
SELECT COUNT(*) FROM agent_subscription_reminders;
```

### 5. 配置定时任务 (可选)

创建 `vercel.json` 配置每天凌晨 2 点执行提醒任务：

```json
{
  "crons": [
    {
      "path": "/api/cron/subscription-reminders",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### 6. 测试功能

#### 测试超时保护

```typescript
// 在浏览器控制台或 API 测试中
import { fetchWithTimeout } from '@/lib/utils/fetch-with-timeout';

// 测试正常请求
const response = await fetchWithTimeout('https://api.example.com/data', {
  timeout: 5000,
});

// 测试超时场景（使用慢速网络模拟）
```

#### 测试邮件服务

```typescript
import SendGridService from '@/lib/email/sendgrid.service';

// 发送测试邮件
await SendGridService.sendTemplateEmail(
  'subscription_reminder',
  'test@example.com',
  {
    userName: '测试用户',
    agentName: '测试智能体',
    expiryDate: '2026-04-01',
    daysUntilExpiry: 7,
  }
);
```

#### 测试短信服务

```typescript
import TwilioService from '@/lib/sms/twilio.service';

// 发送测试短信
await TwilioService.sendTemplateSMS('subscription_reminder', '+8613800138000', {
  userName: '测试用户',
  agentName: '测试智能体',
  expiryDate: '2026-04-01',
  daysUntilExpiry: 7,
});
```

#### 测试调度器

```bash
# 手动触发提醒任务
curl -X POST http://localhost:3000/api/cron/subscription-reminders \
  -H "Authorization: Bearer your_cron_secret" \
  -H "x-cron-job: true"
```

---

## 📋 使用示例

### 场景 1: 用户暂停订阅

```typescript
import { supabase } from '@/lib/supabase';

// 暂停订阅
async function pauseSubscription(installationId: string, reason: string) {
  const { error } = await supabase
    .from('user_agent_installations')
    .update({
      paused_at: new Date().toISOString(),
      pause_reason: reason,
      current_pause_count: supabase.raw('current_pause_count + 1'),
    })
    .eq('id', installationId);

  if (error) throw error;
}

// 恢复订阅
async function resumeSubscription(installationId: string) {
  const { error } = await supabase
    .from('user_agent_installations')
    .update({
      resumed_at: new Date().toISOString(),
    })
    .eq('id', installationId);

  if (error) throw error;
}
```

### 场景 2: 批量发送订阅提醒

```typescript
import TwilioService from '@/lib/sms/twilio.service';

// 批量发送紧急提醒
const recipients = ['+8613800138000', '+8613900139000', '+8613700137000'];

const result = await TwilioService.sendBulkSMS(
  'subscription_expiring_soon',
  recipients,
  {
    agentName: '采购智能体',
    expiryDate: '2026-04-01',
    daysUntilExpiry: 3,
  }
);

console.log(`成功：${result.success}, 失败：${result.failed}`);
```

### 场景 3: 自定义调度器配置

```typescript
import { SubscriptionReminderScheduler } from '@/lib/scheduler/subscription-reminder.scheduler';

// 创建自定义配置的调度器
const customScheduler = new SubscriptionReminderScheduler({
  emailEnabled: true,
  smsEnabled: false, // 禁用短信
  inAppEnabled: true,
  daysBeforeExpiry: [15, 7, 3], // 自定义提醒时间点
});

// 执行调度任务
await customScheduler.runScheduledReminders();
```

---

## 🔍 监控与调试

### 查看提醒发送记录

```sql
SELECT
  r.id,
  r.installation_id,
  r.reminder_type,
  r.days_before_expiry,
  r.status,
  r.sent_at,
  u.email
FROM agent_subscription_reminders r
JOIN user_agent_installations i ON r.installation_id = i.id
JOIN auth.users u ON i.user_id = u.id
ORDER BY r.sent_at DESC
LIMIT 100;
```

### 统计发送成功率

```sql
SELECT
  reminder_type,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent_count,
  ROUND(
    100.0 * SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) / COUNT(*),
    2
  ) as success_rate
FROM agent_subscription_reminders
GROUP BY reminder_type;
```

### 查看即将到期的订阅

```sql
SELECT
  i.id,
  i.agent_name,
  i.subscription_plan,
  i.expires_at,
  u.email,
  u.phone,
  FLOOR((EXTRACT(EPOCH FROM (i.expires_at - NOW())) / 86400)) as days_until_expiry
FROM user_agent_installations i
JOIN auth.users u ON i.user_id = u.id
WHERE i.status = 'active'
  AND i.expires_at BETWEEN NOW() AND NOW() + INTERVAL '30 days'
ORDER BY days_until_expiry;
```

---

## ⚠️ 注意事项

### 1. 超时时间设置

不同业务场景的推荐超时时间：

| 场景     | 推荐超时 | 说明             |
| -------- | -------- | ---------------- |
| 认证相关 | 5-10 秒  | 需要快速响应     |
| 数据上报 | 15 秒    | 非阻塞，可重试   |
| AI 调用  | 30-60 秒 | 可能需要较长时间 |
| 数据导出 | 120 秒   | 大数据量处理     |

### 2. 邮件/短信发送频率限制

- **SendGrid**: 免费账户每日 100 封
- **Twilio**: 试用账户每条短信 $0.0075

建议：

- 实现发送频率限制
- 对同一用户避免短时间内重复发送
- 优先使用应用内通知降低成本

### 3. 时区处理

所有时间字段使用 UTC，显示时转换为本地时间：

```typescript
// 存储时使用 UTC
const expiresAt = new Date().toISOString();

// 显示时转换为用户本地时间
const localTime = new Date(expiresAt).toLocaleString('zh-CN', {
  timeZone: 'Asia/Shanghai',
});
```

### 4. 错误处理最佳实践

```typescript
try {
  await SendGridService.sendEmail(config);
} catch (error) {
  // 记录详细错误信息用于调试
  console.error('邮件发送失败:', {
    error: error.message,
    recipient: config.to,
    subject: config.subject,
  });

  // 降级处理：尝试备用渠道
  await TwilioService.sendTemplateSMS(...);

  // 记录到数据库供后续分析
  await logDeliveryFailure({...});
}
```

---

## 🆘 故障排查

### 问题 1: 邮件发送失败

**症状**: `SendGrid 邮件发送失败`

**排查步骤**:

1. 检查 API Key 是否正确
2. 验证发件人邮箱是否已验证
3. 查看 SendGrid Dashboard 的活动日志
4. 检查防火墙是否阻止了 SendGrid IP

### 问题 2: 短信发送失败

**症状**: `Twilio 短信发送失败`

**排查步骤**:

1. 检查 Account SID 和 Auth Token
2. 验证 Twilio 号码是否有效
3. 确认目标号码格式正确（E.164）
4. 查看 Twilio Console 的错误详情

### 问题 3: 调度器未执行

**症状**: 提醒任务没有自动运行

**排查步骤**:

1. 检查 `vercel.json` 配置是否正确
2. 查看 Vercel Cron Logs
3. 手动调用 API 测试：`POST /api/cron/subscription-reminders`
4. 检查数据库连接是否正常

### 问题 4: 超时保护未生效

**症状**: 请求仍然无限期挂起

**排查步骤**:

1. 确认已导入 `fetchWithTimeout`
2. 检查 `timeout` 参数是否正确传递
3. 验证错误处理代码是否捕获了 `AbortError`
4. 查看浏览器/服务器日志

---

## 📞 获取帮助

- **技术文档**: `/IMPLEMENTATION_REPORT_20260324.md`
- **API 文档**: `/src/lib/email/sendgrid.service.ts`
- **示例代码**: 本指南中的代码片段
- **官方文档**:
  - [SendGrid Docs](https://sendgrid.com/docs/)
  - [Twilio Docs](https://www.twilio.com/docs)
  - [Supabase Docs](https://supabase.com/docs)

---

**最后更新**: 2026-03-24
**维护者**: FixCycle Team
