# API 优化实施指南

## 概述

本文档记录智能体管理模块 API 的三项关键优化：

1. ✅ **权限验证统一化** - 使用 `PermissionValidator` 统一所有 API 端点的权限验证
2. ✅ **超时保护** - 为所有外部 API 调用添加 `fetchWithTimeout` 封装
3. ✅ **订阅管理完善** - 实现订阅暂停/恢复和到期提醒功能

---

## 1. 权限验证统一化

### 现状分析

**已正确使用 PermissionValidator 的文件**:

- ✅ `src/app/api/admin/agents/[id]/shelf/route.ts`

**需要重构的文件**:

- ⚠️ `src/app/api/agents/route.ts` - POST 方法需要权限验证
- ⚠️ `src/app/api/agents/[id]/route.ts` - PUT, DELETE 方法需要权限验证
- ⚠️ `src/app/api/agents/[id]/inventory/route.ts` - 所有方法需要权限验证
- ⚠️ `src/app/api/agents/[id]/renew/route.ts` - 需要所有者验证
- ⚠️ `src/app/api/agents/[id]/subscription/route.ts` - 需要所有者验证

### 标准实现模式

```typescript
import {
  PermissionValidator,
  AgentPermission,
  authenticateAndGetUser,
} from '@/lib/auth/permissions';
import { createErrorResponse, ErrorCode } from '@/lib/api/error-handler';

export async function POST(request: NextRequest) {
  const path = request.url;
  const requestId = crypto.randomUUID();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 步骤 1: 获取 session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, {
        path,
        requestId,
        message: '请先登录',
      });
    }

    // 步骤 2: 获取用户信息和权限
    const authResult = await authenticateAndGetUser(
      session.access_token,
      supabase
    );

    if (authResult.error) {
      return createErrorResponse(ErrorCode.UNAUTHORIZED, {
        path,
        requestId,
        message: authResult.error,
      });
    }

    const { user } = authResult;

    // 步骤 3: 如果需要特定权限，进行验证
    const validator = new PermissionValidator(supabase);
    const hasPermission = validator.hasPermission(
      user.role,
      AgentPermission.AGENT_CREATE
    );

    if (!hasPermission) {
      return createErrorResponse(ErrorCode.FORBIDDEN, {
        path,
        requestId,
        message: '您没有权限执行此操作',
      });
    }

    // 步骤 4: 业务逻辑...

    return createSuccessResponse(data, { path, requestId });
  } catch (error) {
    console.error('API 错误:', error);
    return createErrorResponse(ErrorCode.INTERNAL_ERROR, {
      path,
      requestId,
      details: error instanceof Error ? error.message : '未知错误',
    });
  }
}
```

### 实施优先级

**P0 - 高优先级（本周完成）**:

1. `src/app/api/agents/route.ts` - 创建智能体
2. `src/app/api/agents/[id]/route.ts` - 更新和删除智能体

**P1 - 中优先级（下周完成）**: 3. `src/app/api/agents/[id]/inventory/route.ts` - 库存管理 4. `src/app/api/agents/[id]/subscription/route.ts` - 订阅管理 5. `src/app/api/agents/[id]/renew/route.ts` - 续费管理

### 验收标准

- ✅ 所有写操作（POST/PUT/DELETE）都有权限验证
- ✅ 使用统一的 `PermissionValidator` 类
- ✅ 返回标准化的错误响应格式
- ✅ 包含清晰的权限不足提示

---

## 2. 超时保护

### 现状分析

**已使用 fetchWithTimeout 的文件**:

- ✅ `src/app/api/agents/[id]/renew/route.ts`
- ✅ `src/app/api/health/route.ts`
- ✅ `src/lib/github/api.ts`

**需要添加超时保护的文件**:

- ⚠️ 所有涉及外部 API 调用的文件

### 标准实现模式

```typescript
import { fetchWithTimeout } from '@/lib/utils/fetch-with-timeout';

// 基本使用（30 秒超时）
const response = await fetchWithTimeout('https://api.example.com/data');

// 自定义超时时间（5 秒）
const response = await fetchWithTimeout('https://api.example.com/data', {
  timeout: 5000,
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key: 'value' }),
});

// 带重试机制（失败后重试 3 次，间隔 2 秒）
const response = await fetchWithTimeout('https://api.example.com/data', {
  timeout: 10000,
  retries: 3,
  retryDelay: 2000,
});
```

### 实施清单

**需要检查的 API 类型**:

- [ ] 支付网关集成（Stripe、支付宝、微信支付）
- [ ] 邮件发送服务（SendGrid、Amazon SES）
- [ ] 短信服务（Twilio、阿里云短信）
- [ ] 第三方 AI 模型 API（OpenAI、Anthropic）
- [ ] 对象存储服务（AWS S3、阿里云 OSS）
- [ ] 地图服务（Google Maps、高德地图）
- [ ] 社交媒体分享（微信、微博）

### 验收标准

- ✅ 所有外部 API 调用都使用 `fetchWithTimeout`
- ✅ 超时时间设置合理（根据服务特性）
- ✅ 有适当的重试机制（针对临时性故障）
- ✅ 超时错误友好提示用户

---

## 3. 订阅管理完善

### 3.1 订阅暂停/恢复功能 ✅

**实现文件**:

- ✅ `src/app/api/agents/[id]/subscription/route.ts`

**API 端点**:

```http
PUT /api/agents/[id]/subscription/pause
Body: { reason?: string }

POST /api/agents/[id]/subscription/resume

GET /api/agents/[id]/subscription/status
```

**功能特性**:

- ✅ 支持最大暂停次数限制（默认 3 次/年）
- ✅ 暂停期间不计费
- ✅ 恢复后有效期自动顺延
- ✅ 记录审计日志
- ✅ 返回详细的暂停状态信息

**使用示例**:

```typescript
// 暂停订阅
const pauseResponse = await fetch('/api/agents/[id]/subscription/pause', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ reason: '暂时不需要使用' }),
});

// 恢复订阅
const resumeResponse = await fetch('/api/agents/[id]/subscription/resume', {
  method: 'POST',
});

// 查询状态
const statusResponse = await fetch('/api/agents/[id]/subscription/status');
```

---

### 3.2 订阅到期提醒功能 ✅

**实现文件**:

- ✅ `src/services/subscription-reminder.service.ts`
- ✅ `src/jobs/subscription-reminder.job.ts`
- ✅ `src/app/api/cron/subscription-reminders/route.ts`
- ✅ `src/app/api/agents/reminders/route.ts`

**提醒策略**:

- 提前 7 天：邮件提醒
- 提前 3 天：邮件提醒
- 提前 1 天：短信提醒

**定时任务配置**:

```bash
# Cron 表达式：每天凌晨 2 点执行
0 2 * * *
```

**部署方式**:

#### 方式 1: Vercel Cron (推荐)

在 `vercel.json` 中配置：

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

#### 方式 2: GitHub Actions

创建 `.github/workflows/cron-subscription-reminders.yml`:

```yaml
name: Subscription Reminders Cron

on:
  schedule:
    - cron: '0 2 * * *' # UTC 时间，北京时间需减 8 小时

jobs:
  trigger-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Subscription Reminders
        run: |
          curl -X GET \
            https://your-domain.com/api/cron/subscription-reminders \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

#### 方式 3: 系统 Crontab

```bash
# 编辑 crontab
crontab -e

# 添加任务（每天凌晨 2 点）
0 2 * * * curl -X GET https://your-domain.com/api/cron/subscription-reminders -H "Authorization: Bearer YOUR_CRON_SECRET"
```

**环境变量配置**:

```bash
# .env.local
CRON_SECRET=your_secure_random_secret_here
```

**手动触发测试**:

```typescript
// 管理员可通过 API 手动触发测试提醒
const testResponse = await fetch('/api/agents/reminders/test', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${ADMIN_TOKEN}`,
  },
  body: JSON.stringify({
    installationId: 'xxx-xxx-xxx',
    daysBeforeExpiry: 7,
  }),
});
```

---

## 4. 数据库迁移

### 订阅暂停/恢复所需字段

**迁移文件**: `supabase/migrations/20260324_add_subscription_pause_fields.sql`

```sql
-- 为 user_agent_installations 表添加暂停相关字段
ALTER TABLE user_agent_installations
ADD COLUMN IF NOT EXISTS paused_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS resumed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS pause_reason TEXT,
ADD COLUMN IF NOT EXISTS current_pause_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_pause_count INTEGER DEFAULT 3;

-- 添加注释
COMMENT ON COLUMN user_agent_installations.paused_at IS '暂停时间戳';
COMMENT ON COLUMN user_agent_installations.resumed_at IS '恢复时间戳';
COMMENT ON COLUMN user_agent_installations.pause_reason IS '暂停原因';
COMMENT ON COLUMN user_agent_installations.current_pause_count IS '当前已暂停次数';
COMMENT ON COLUMN user_agent_installations.max_pause_count IS '最大允许暂停次数';
```

### 订阅提醒所需表

**迁移文件**: `supabase/migrations/20260324_create_subscription_reminders.sql`

```sql
-- 创建订阅提醒历史表
CREATE TABLE IF NOT EXISTS agent_subscription_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  agent_id UUID REFERENCES agents(id),
  installation_id UUID REFERENCES user_agent_installations(id),
  reminder_type VARCHAR(20) NOT NULL, -- 'email', 'sms', 'in_app'
  days_before_expiry INTEGER NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_reminders_user_id ON agent_subscription_reminders(user_id);
CREATE INDEX idx_reminders_agent_id ON agent_subscription_reminders(agent_id);
CREATE INDEX idx_reminders_status ON agent_subscription_reminders(status);
CREATE INDEX idx_reminders_sent_at ON agent_subscription_reminders(sent_at);
```

---

## 5. 测试验证

### 权限验证测试

```typescript
// 测试用例 1: 未登录用户尝试创建智能体
test('未登录用户创建智能体应返回 401', async () => {
  const response = await fetch('/api/agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Agent' }),
  });

  expect(response.status).toBe(401);
  const data = await response.json();
  expect(data.error.code).toBe('UNAUTHORIZED');
});

// 测试用例 2: 普通用户尝试删除他人智能体
test('普通用户删除他人智能体应返回 403', async () => {
  const response = await fetch('/api/agents/[id]', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${USER_TOKEN}` },
  });

  expect(response.status).toBe(403);
  const data = await response.json();
  expect(data.error.code).toBe('FORBIDDEN');
});
```

### 超时保护测试

```typescript
// 测试用例：模拟慢速外部 API
test('外部 API 超时应返回友好错误', async () => {
  const response = await fetch('/api/agents/[id]/renew', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${USER_TOKEN}`,
    },
    body: JSON.stringify({ period: 'monthly' }),
  });

  // 模拟超时场景
  expect(response.status).toBe(408);
  const data = await response.json();
  expect(data.error.message).toContain('超时');
});
```

### 订阅暂停/恢复测试

```typescript
// 测试用例：暂停订阅
test('用户暂停订阅应成功', async () => {
  const response = await fetch('/api/agents/[id]/subscription/pause', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${USER_TOKEN}`
    },
    body: JSON.stringify({ reason: '测试暂停' }),
  });

  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.subscription.status).toBe('paused');
  expect(data.subscription.pausedAt).toBeDefined();
});

// 测试用例：超过最大暂停次数
test('超过最大暂停次数应返回错误', async () => {
  // 先暂停 3 次
  for (let i = 0; i < 3; i++) {
    await fetch('/api/agents/[id]/subscription/pause', { ... });
    await fetch('/api/agents/[id]/subscription/resume', { ... });
  }

  // 第 4 次暂停应失败
  const response = await fetch('/api/agents/[id]/subscription/pause', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason: '再次暂停' }),
  });

  expect(response.status).toBe(429);
  expect(data.error.code).toBe('QUOTA_EXCEEDED');
});
```

### 订阅提醒测试

```typescript
// 测试用例：手动触发提醒
test('管理员手动触发提醒应成功', async () => {
  const response = await fetch('/api/agents/reminders/test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    },
    body: JSON.stringify({
      installationId: 'test-id',
      daysBeforeExpiry: 7,
    }),
  });

  expect(response.status).toBe(200);
  expect(data.success).toBe(true);
});
```

---

## 6. 监控与告警

### 关键指标监控

```typescript
// 监控指标
const metrics = {
  // 权限验证
  permissionCheckCount: 0,
  permissionDeniedCount: 0,

  // 超时控制
  externalApiCallCount: 0,
  timeoutErrorCount: 0,
  avgResponseTime: 0,

  // 订阅管理
  subscriptionPauseCount: 0,
  subscriptionResumeCount: 0,
  reminderSentCount: 0,
  reminderFailedCount: 0,
};
```

### 日志记录

```typescript
// 重要操作日志
console.log('[权限验证] 用户 ID:', userId, '角色:', role, '权限:', permission);
console.log('[超时控制] API:', url, '耗时:', duration, 'ms');
console.log(
  '[订阅暂停] 用户:',
  userId,
  '智能体:',
  agentId,
  '剩余暂停次数:',
  remainingPauses
);
console.log('[到期提醒] 发送提醒:', count, '个，失败:', failedCount, '个');
```

---

## 7. 完成度检查清单

### 权限验证统一化

- [ ] `src/app/api/agents/route.ts` - POST 方法
- [ ] `src/app/api/agents/[id]/route.ts` - PUT, DELETE 方法
- [ ] `src/app/api/agents/[id]/inventory/route.ts` - 所有方法
- [ ] `src/app/api/agents/[id]/subscription/route.ts` - 所有方法
- [ ] `src/app/api/agents/[id]/renew/route.ts` - 所有方法

### 超时保护

- [ ] 审查所有外部 API 调用
- [ ] 替换为 `fetchWithTimeout`
- [ ] 设置合理的超时时间
- [ ] 添加重试机制（如需要）

### 订阅管理

- [x] 订阅暂停/恢复 API 实现
- [x] 订阅到期提醒服务实现
- [x] 定时任务实现
- [x] Cron API 实现
- [ ] 数据库迁移执行
- [ ] 邮件/短信服务集成
- [ ] 完整测试覆盖

---

## 8. 下一步行动

### 本周内完成（P0）

1. ✅ 创建订阅提醒服务 - **已完成**
2. ⚠️ 重构 `src/app/api/agents/route.ts` 的 POST 方法
3. ⚠️ 重构 `src/app/api/agents/[id]/route.ts` 的 PUT/DELETE 方法
4. ⚠️ 审查所有外部 API 调用，列出清单

### 下周完成（P1）

1. 完成剩余 API 的权限验证统一化
2. 为所有外部 API 调用添加超时保护
3. 执行数据库迁移
4. 集成邮件/短信服务
5. 编写完整的单元测试

---

**文档维护**: 本指南应根据实施进度动态更新
**最后更新**: 2026-03-24
