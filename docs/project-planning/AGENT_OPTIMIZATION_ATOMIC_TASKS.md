# 智能体管理模块优化原子任务清单

## 📋 文档信息

- **版本号**: v1.0
- **创建日期**: 2026 年 3 月 24 日
- **来源**: 智能体管理模块代码审查报告
- **优先级定义**:
  - 🔴 P0 - 严重问题，必须立即修复（安全/数据完整性风险）
  - 🟡 P1 - 重要问题，近期优先解决（功能缺陷/体验问题）
  - 🟢 P2 - 改进建议，长期优化规划（性能提升/功能增强）

---

## 📊 任务概览表

| 编号    | 任务名称                   | 优先级 | 预计工时 | 前置依赖 | 交付物                                           | 验收标准                               |
| ------- | -------------------------- | ------ | -------- | -------- | ------------------------------------------------ | -------------------------------------- | --- |
| OPT-001 | 实现智能体创建表单提交逻辑 | P0     | 4h       | 无       | `src/app/agents/page.tsx`                        | 创建成功率 100%，自动创建版本记录      |
| OPT-002 | 完善删除前关联检查机制     | P0     | 8h       | 无       | `src/app/api/agents/[id]/route.ts`               | 删除前检查 3 类关联数据                |
| OPT-003 | 实现软删除机制             | P0     | 6h       | OPT-002  | Database Migration                               | 添加 `deleted_at` 字段，支持恢复       |
| OPT-004 | 统一权限验证工具类         | P0     | 5h       | 无       | `src/lib/auth/permissions.ts`                    | 覆盖所有 API 端点，权限验证一致性 100% |
| OPT-005 | 添加配置验证层             | P1     | 6h       | 无       | `src/lib/validators/agent-config.validator.ts`   | 验证覆盖率 100%，错误提示清晰          |
| OPT-006 | 实现事务处理机制           | P1     | 8h       | 无       | `src/lib/db/transaction.ts`                      | 关键操作事务化，数据不一致率 0%        |
| OPT-007 | 实现手动上下架 API         | P1     | 4h       | 无       | `src/app/api/admin/agents/[id]/shelf/route.ts`   | 支持即时下架，响应时间<200ms           | ✅  |
| OPT-008 | 实现库存管理功能           | P1     | 6h       | OPT-007  | `src/app/api/agents/[id]/inventory/route.ts`     | 限量销售功能可用，库存准确             | ✅  |
| OPT-009 | 添加并发控制（乐观锁）     | P1     | 5h       | 无       | Database Migration                               | 防止并发冲突，更新成功率 100%          | ✅  |
| OPT-010 | 实现数据验证 Schema        | P1     | 4h       | OPT-005  | `src/lib/validators/*.ts`                        | 所有写入操作都经过验证                 | ✅  |
| OPT-011 | 统一 API 错误响应格式      | P1     | 3h       | 无       | `src/lib/api/error-handler.ts`                   | 错误响应标准化，包含错误码和追踪 ID    |
| OPT-012 | 添加网络超时处理           | P1     | 4h       | 无       | 所有外部 API 调用文件                            | 超时控制 100%，无请求挂起              |
| OPT-013 | 实现订阅续费 API           | P1     | 6h       | 无       | `src/app/api/agents/[id]/renew/route.ts`         | 支持多种续费套餐，自动延长有效期       |
| OPT-014 | 实现订阅到期提醒           | P1     | 5h       | OPT-013  | `src/services/subscription-reminder.service.ts`  | 提前 7 天/3 天/1 天提醒，触达率 100%   |
| OPT-015 | 实现订阅暂停/恢复功能      | P1     | 5h       | OPT-013  | `src/app/api/agents/[id]/subscription/route.ts`  | 暂停期间不计费，恢复后继续使用         |
| OPT-016 | 完善多租户隔离             | P1     | 8h       | OPT-004  | RLS Policies                                     | 跨租户访问拦截率 100%                  | ✅  |
| OPT-017 | 实现告警通知机制           | P2     | 6h       | 无       | `src/services/monitoring/alert.service.ts`       | 异常状态 5 分钟内告警                  |
| OPT-018 | 实现历史监控数据存储       | P2     | 5h       | 无       | `supabase/migrations/*_agent_status_history.sql` | 保留 90 天历史数据，支持趋势分析       |
| OPT-019 | 实现高级统计分析           | P2     | 8h       | OPT-018  | `src/app/api/analytics/agents/route.ts`          | 转化率、留存率、ROI 分析               |
| OPT-020 | 实现订单交付自动化         | P1     | 6h       | 无       | `src/services/order-fulfillment.service.ts`      | 支付后自动开通服务，延迟<1 分钟        |
| OPT-021 | 实现配置变更对比功能       | P2     | 5h       | 无       | `src/components/agent/ConfigDiffViewer.tsx`      | 可视化展示配置差异，支持回滚           |
| OPT-022 | 实现智能体模板功能         | P2     | 6h       | 无       | `src/app/api/agents/templates/route.ts`          | 提供 5+ 预设模板，一键创建             |
| OPT-023 | 实现批量操作功能           | P2     | 8h       | 无       | `src/app/api/agents/batch/route.ts`              | 支持批量激活/停用/删除，成功率≥98%     |
| OPT-024 | 实现审计日志查询界面       | P2     | 6h       | 无       | `src/app/admin/agents-audit/page.tsx`            | 支持多维度筛选，导出 CSV               |
| OPT-025 | 性能优化：添加缓存层       | P2     | 8h       | 无       | `src/lib/cache/agent.cache.ts`                   | 查询响应时间<100ms，缓存命中率≥80%     |

---

## 🔴 P0 级任务（严重问题，立即修复）

### OPT-001: 实现智能体创建表单提交逻辑

**任务描述**:
当前创建模态框的提交按钮只有空注释，需要实现完整的创建逻辑。

**工作内容**:

1. 实现表单数据收集和验证
2. 调用创建 API (`POST /api/agents`)
3. 创建版本记录 (`agent_versions` 表)
4. 初始化使用计数器
5. 刷新列表并关闭模态框

**交付物**:

- 修改文件：`src/app/agents/page.tsx` (L598-602)
- 新增函数：`handleCreateAgent(formData: any)`

**验收标准**:

```typescript
// 测试用例
✓ 必填字段验证（name, configuration）
✓ 创建成功后自动创建 v1.0.0 版本记录
✓ usage_count 初始化为 0
✓ 列表自动刷新
✓ 错误提示友好（如名称重复）
```

**预计工时**: 4 小时

---

### OPT-002: 完善删除前关联检查机制

**任务描述**:
当前删除操作未检查关联数据，可能导致数据不一致。

**工作内容**:

1. 检查活跃订阅（`agent_orders` 表）
2. 检查进行中的执行（`agent_executions` 表）
3. 检查未完成的订单
4. 返回详细的错误信息和影响范围

**交付物**:

- 修改文件：`src/app/api/agents/[id]/route.ts` (DELETE 方法)
- 新增辅助函数：`checkAssociations(agentId: string)`

**验收标准**:

```typescript
// 返回示例
{
  error: '无法删除：存在关联数据',
  details: {
    activeSubscriptions: 5,      // 活跃订阅数
    runningExecutions: 2,        // 进行中执行数
    relatedOrders: 10            // 关联订单数
  }
}
```

**预计工时**: 8 小时

---

### OPT-003: 实现软删除机制

**任务描述**:
当前为物理删除，数据无法恢复。需要实现软删除，保留数据可追溯性。

**工作内容**:

1. 数据库迁移：添加 `deleted_at`, `deleted_by` 字段
2. 修改 DELETE API：改为更新状态而非物理删除
3. 修改 SELECT 查询：过滤已软删除的记录
4. 实现恢复功能（可选）

**SQL 迁移脚本**:

```sql
ALTER TABLE agents
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN deleted_by UUID REFERENCES auth.users(id);

CREATE INDEX idx_agents_deleted_at ON agents(deleted_at);
```

**交付物**:

- 迁移文件：`supabase/migrations/*_add_soft_delete_to_agents.sql`
- 修改文件：`src/app/api/agents/[id]/route.ts`
- 修改文件：`src/app/api/agents/route.ts` (GET 方法)

**验收标准**:

- ✓ 删除后 `deleted_at` 不为 NULL
- ✓ 普通查询自动过滤 `WHERE deleted_at IS NULL`
- ✓ 管理员可查看已删除记录
- ✓ 支持恢复操作（将 `deleted_at` 设为 NULL）

**预计工时**: 6 小时

---

### OPT-004: 统一权限验证工具类

**任务描述**:
不同 API 端点的权限验证逻辑不统一，存在安全隐患。

**工作内容**:

1. 创建统一的权限验证工具类
2. 定义权限映射表
3. 封装角色检查函数
4. 替换现有分散的权限验证代码

**交付物**:

- 新增文件：`src/lib/auth/permissions.ts`
- 修改所有 API 路由文件（约 10 个文件）

**权限映射表示例**:

```typescript
const PERMISSIONS = {
  'agent:create': ['admin'],
  'agent:update': ['admin', 'owner'],
  'agent:delete': ['admin'],
  'agent:approve': ['admin', 'marketplace_admin', 'content_reviewer'],
  'agent:shelf': ['admin', 'marketplace_admin'],
};
```

**验收标准**:

- ✓ 所有 API 端点使用统一权限验证
- ✓ 权限定义集中管理，易于维护
- ✓ 权限验证错误返回统一格式
- ✓ 通过单元测试验证所有权限场景

**预计工时**: 5 小时

---

## 🟡 P1 级任务（重要问题，近期优先）

### OPT-005: 添加配置验证层

**任务描述**:
当前配置字段缺乏验证，可能导致非法配置数据。

**工作内容**:

1. 定义配置 Schema（使用 Zod 或 Joi）
2. 实现配置验证函数
3. 在创建和更新时进行验证
4. 提供友好的错误提示

**交付物**:

- 新增文件：`src/lib/validators/agent-config.validator.ts`
- 修改文件：`src/app/api/agents/route.ts` (POST/PUT)

**Schema 示例**:

```typescript
const AgentConfigSchema = z.object({
  model: z.string().min(1),
  temperature: z.number().min(0).max(1),
  max_tokens: z.number().int().positive(),
  capabilities: z.array(z.string()).optional(),
});
```

**验收标准**:

- ✓ 必填字段验证
- ✓ 数值范围验证（如 temperature 0-1）
- ✓ 类型验证（JSON 结构）
- ✓ 错误提示包含具体字段和期望值

**预计工时**: 6 小时

---

### OPT-006: 实现事务处理机制

**任务描述**:
多个相关操作未放在同一事务中，可能导致数据不一致。

**工作内容**:

1. 封装 Supabase 事务处理方法
2. 识别需要事务的场景（审核、删除、更新等）
3. 实现补偿逻辑（失败回滚）

**典型场景**:

- 审核通过：更新状态 + 记录日志 + 上架
- 删除智能体：检查关联 + 软删除 + 通知用户

**交付物**:

- 新增文件：`src/lib/db/transaction.ts`
- 修改相关 API 路由（审核、删除等）

**验收标准**:

```typescript
// 审核事务示例
const result = await runInTransaction(async (tx) => {
  await tx.from('agents').update({ review_status: 'approved' });
  await tx.from('agent_audit_logs').insert({ ... });
  await tx.from('agents').update({ shelf_status: 'on_shelf' });
  return true;
});

✓ 任何一步失败，全部回滚
✓ 返回详细的错误信息
✓ 不影响性能（事务开销<10%）
```

**预计工时**: 8 小时

---

### OPT-007: 实现手动上下架 API

**任务描述**:
缺少手动上下架接口，违规智能体无法快速下架。

**工作内容**:

1. 创建上下架 API 端点
2. 实现权限验证（仅管理员）
3. 记录操作日志
4. 通知相关用户（下架时）

**API 设计**:

```http
POST /api/admin/agents/:id/shelf
Body: { action: 'on_shelf' | 'off_shelf', reason?: string }
```

**交付物**:

- 新增文件：`src/app/api/admin/agents/[id]/shelf/route.ts`

**验收标准**:

- ✓ 仅管理员可调用
- ✓ 立即生效（响应时间<200ms）
- ✓ 记录审计日志
- ✓ 下架时发送邮件通知开发者

**预计工时**: 4 小时

---

### OPT-008: 实现库存管理功能

**任务描述**:
库存字段存在但未使用，需要实现限量销售功能。

**工作内容**:

1. 实现库存扣减逻辑（下单时）
2. 实现库存恢复逻辑（取消订单）
3. 添加库存预警（低于阈值）
4. 前端显示库存状态

**交付物**:

- 新增文件：`src/app/api/agents/[id]/inventory/route.ts`
- 修改文件：`src/app/api/agent-store/install/route.ts` (下单逻辑)
- 新增组件：`src/components/agent/StockIndicator.tsx`

**验收标准**:

- ✓ 下单时自动扣减库存
- ✓ 库存为 0 时禁止购买
- ✓ 取消订单时恢复库存
- ✓ 库存低于阈值时发送补货提醒

**预计工时**: 6 小时

---

### OPT-009: 添加并发控制（乐观锁）

**任务描述**:
两个管理员同时操作同一智能体可能导致数据覆盖。

**工作内容**:

1. 添加版本号字段
2. 更新时检查版本号
3. 实现冲突检测和提示

**SQL 迁移**:

```sql
ALTER TABLE agents ADD COLUMN version INTEGER DEFAULT 0;
```

**更新逻辑**:

```typescript
const { data, error } = await supabase
  .from('agents')
  .update({ review_status: 'approved', version: version + 1 })
  .eq('id', agentId)
  .eq('version', currentVersion); // 乐观锁条件

if (data.length === 0) {
  throw new Error('数据已被其他管理员修改，请刷新后重试');
}
```

**交付物**:

- 迁移文件：`supabase/migrations/*_add_version_to_agents.sql`
- 修改相关 API 路由（审核、更新等）

**验收标准**:

- ✓ 并发更新时只有一条成功
- ✓ 失败的更新收到友好提示
- ✓ 前端显示当前版本号

**预计工时**: 5 小时

---

### OPT-010: 实现数据验证 Schema

**任务描述**:
部分字段缺乏验证，可能录入非法数据。

**工作内容**:

1. 定义完整的数据模型 Schema
2. 在所有写入操作中添加验证
3. 提供详细的验证错误信息

**交付物**:

- 新增文件：`src/lib/validators/index.ts`
- 包含多个验证器：`agent.validator.ts`, `order.validator.ts` 等

**验收标准**:

- ✓ 所有 POST/PUT 请求都经过验证
- ✓ 验证错误返回 400 状态码
- ✓ 错误信息包含具体字段和原因

**预计工时**: 4 小时

---

### OPT-011: 统一 API 错误响应格式

**任务描述**:
API 错误响应格式不统一，前端处理困难。

**工作内容**:

1. 定义统一的错误响应接口
2. 创建错误处理中间件
3. 规范化错误码体系

**错误响应格式**:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string; // 错误码（如 AGENT_NOT_FOUND）
    message: string; // 友好提示
    details?: any; // 详细错误信息
    timestamp: string; // 时间戳
    path: string; // 请求路径
    requestId: string; // 请求 ID（用于追踪）
  };
}
```

**交付物**:

- 新增文件：`src/lib/api/error-handler.ts`
- 修改所有 API 路由文件

**验收标准**:

- ✓ 所有错误响应格式一致
- ✓ 包含错误码和追踪 ID
- ✓ 生产环境不暴露敏感信息

**预计工时**: 3 小时

---

### OPT-012: 添加网络超时处理

**任务描述**:
外部 API 调用未设置超时，可能导致请求挂起。

**工作内容**:

1. 在所有 fetch 调用中添加 AbortController
2. 设置合理的超时时间（30 秒）
3. 实现超时重试机制（可选）

**实现示例**:

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);

try {
  const response = await fetch(url, { signal: controller.signal });
  clearTimeout(timeoutId);
} catch (error) {
  if (error.name === 'AbortError') {
    throw new Error('请求超时，请稍后重试');
  }
  throw error;
}
```

**交付物**:

- 修改所有涉及外部调用的 API 文件
- 新增工具函数：`src/lib/utils/fetch-with-timeout.ts`

**验收标准**:

- ✓ 所有外部请求都有超时控制
- ✓ 超时错误友好提示
- ✓ 无请求挂起现象

**预计工时**: 4 小时

---

### OPT-013: 实现订阅续费 API

**任务描述**:
缺少订阅续费功能，用户无法续期到期的智能体。

**工作内容**:

1. 创建续费 API 端点
2. 实现续费套餐选择
3. 集成支付流程
4. 自动延长有效期

**API 设计**:

```http
POST /api/agents/:id/renew
Body: {
  period: 'monthly' | 'yearly',
  paymentMethod: 'stripe' | 'alipay' | 'wechat'
}
```

**交付物**:

- 新增文件：`src/app/api/agents/[id]/renew/route.ts`
- 新增组件：`src/components/agent/RenewalModal.tsx`

**验收标准**:

- ✓ 支持多种续费套餐
- ✓ 支付成功后自动延长有效期
- ✓ 发送续费确认邮件
- ✓ 更新统计数据（purchase_count）

**预计工时**: 6 小时

---

### OPT-014: 实现订阅到期提醒

**任务描述**:
用户不知道订阅即将到期，导致服务中断。

**工作内容**:

1. 创建定时任务扫描即将到期的订阅
2. 发送邮件/站内信提醒
3. 支持自定义提醒策略

**提醒策略**:

- 提前 7 天：首次提醒
- 提前 3 天：再次提醒
- 提前 1 天：紧急提醒

**交付物**:

- 新增文件：`src/services/subscription-reminder.service.ts`
- 新增 API：`src/app/api/agents/reminders/route.ts`
- 数据库迁移：`agent_reminders` 表

**验收标准**:

- ✓ 按时发送提醒（误差<1 小时）
- ✓ 提醒内容包含续费链接
- ✓ 支持关闭特定提醒
- ✓ 记录发送历史

**预计工时**: 5 小时

---

### OPT-015: 实现订阅暂停/恢复功能

**任务描述**:
用户希望暂时停用订阅而不是取消，避免浪费。

**工作内容**:

1. 实现暂停功能（冻结有效期）
2. 实现恢复功能（继续计算有效期）
3. 暂停期间不计费

**状态流转**:

```
active → paused → active
   ↓
cancelled
```

**交付物**:

- 新增文件：`src/app/api/agents/[id]/subscription/route.ts`
- 数据库迁移：添加 `paused_at`, `resumed_at` 字段

**验收标准**:

- ✓ 暂停期间不消耗 Token
- ✓ 恢复后有效期顺延
- ✓ 支持多次暂停/恢复
- ✓ 限制最大暂停次数（如 3 次/年）

**预计工时**: 5 小时

---

### OPT-016: 完善多租户隔离

**任务描述**:
虽然有 tenant_id 概念，但未严格执行，存在数据泄露风险。

**工作内容**:

1. 强化 RLS（Row Level Security）策略
2. 添加租户隔离中间件
3. 审计现有查询，确保租户隔离

**RLS 策略示例**:

```sql
CREATE POLICY "tenant_isolation" ON agents
FOR ALL USING (
  tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

**交付物**:

- 修改 RLS 策略（多个 migration 文件）
- 新增中间件：`src/middleware/tenant-isolation.ts`
- 审计报告：检查所有查询

**验收标准**:

- ✓ 跨租户访问拦截率 100%
- ✓ 管理员可跨租户访问
- ✓ 性能影响<5%

**预计工时**: 8 小时

---

## 🟢 P2 级任务（改进建议，长期优化）

### OPT-017: 实现告警通知机制

**任务描述**:
缺少监控告警，无法及时发现异常。

**工作内容**:

1. 定义告警规则（状态异常、错误率超阈值等）
2. 实现告警通知服务（邮件/短信/Webhook）
3. 创建告警历史记录

**告警规则示例**:

- 智能体离线超过 10 分钟
- 错误率超过 5%
- 响应时间超过 5 秒

**交付物**:

- 新增文件：`src/services/monitoring/alert.service.ts`
- 新增表：`alert_rules`, `alert_history`
- 管理界面：`src/app/admin/alerts/page.tsx`

**验收标准**:

- ✓ 异常状态 5 分钟内告警
- ✓ 支持多级告警（警告/严重/致命）
- ✓ 告警准确率≥95%
- ✓ 支持告警升级（未处理时通知上级）

**预计工时**: 6 小时

---

### OPT-018: 实现历史监控数据存储

**任务描述**:
当前只保留最新状态，无法进行趋势分析。

**工作内容**:

1. 创建历史数据表
2. 定期快照（每小时/每天）
3. 实现数据归档策略（保留 90 天）

**表结构设计**:

```sql
CREATE TABLE agent_status_history (
  id UUID PRIMARY KEY,
  agent_id UUID,
  status VARCHAR(20),
  metrics JSONB,
  recorded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 分区表（按月）
CREATE TABLE agent_status_history_2026_03
PARTITION OF agent_status_history
FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
```

**交付物**:

- 迁移文件：`supabase/migrations/*_agent_status_history.sql`
- 定时任务：`src/jobs/snapshot-agent-status.job.ts`

**验收标准**:

- ✓ 保留 90 天历史数据
- ✓ 支持按时间范围查询
- ✓ 存储空间优化（压缩/归档）
- ✓ 查询性能<500ms

**预计工时**: 5 小时

---

### OPT-019: 实现高级统计分析

**任务描述**:
缺少深度数据分析，无法支持运营决策。

**工作内容**:

1. 实现转化率分析（浏览→购买）
2. 实现留存率分析
3. 实现 ROI 分析
4. 创建可视化报表

**分析指标**:

- 日活/月活智能体数量
- 购买转化率
- 用户留存率
- 平均收益 per 智能体
- 热门类别趋势

**交付物**:

- 新增 API：`src/app/api/analytics/agents/route.ts`
- 分析组件：`src/components/analytics/*.tsx`
- 管理仪表板：`src/app/admin/analytics/page.tsx`

**验收标准**:

- ✓ 支持多维度筛选（时间/类别/状态）
- ✓ 图表可视化（使用 ECharts 或 Recharts）
- ✓ 支持导出 CSV/PDF
- ✓ 数据更新延迟<1 小时

**预计工时**: 8 小时

---

### OPT-020: 实现订单交付自动化

**任务描述**:
当前订单支付后未自动开通服务，需要手动处理。

**工作内容**:

1. 监听支付成功事件
2. 自动创建订阅记录
3. 发送开通通知
4. 更新智能体统计数据

**交付物**:

- 新增服务：`src/services/order-fulfillment.service.ts`
- Webhook 处理器：`src/app/api/webhooks/payment/route.ts`

**验收标准**:

- ✓ 支付后 1 分钟内自动开通
- ✓ 发送开通成功邮件
- ✓ 更新 `purchase_count` 字段
- ✓ 异常情况自动重试（最多 3 次）

**预计工时**: 6 小时

---

### OPT-021: 实现配置变更对比功能

**任务描述**:
无法直观查看配置变更历史，难以追溯问题。

**工作内容**:

1. 获取两个版本的配置
2. 计算差异（diff）
3. 可视化展示
4. 支持一键回滚

**交付物**:

- 新增组件：`src/components/agent/ConfigDiffViewer.tsx`
- 工具函数：`src/lib/utils/diff-config.ts`

**验收标准**:

- ✓ 清晰展示新增/修改/删除的字段
- ✓ 支持 JSON 格式化显示
- ✓ 一键回滚到任意版本
- ✓ 回滚操作记录审计日志

**预计工时**: 5 小时

---

### OPT-022: 实现智能体模板功能

**任务描述**:
每次创建智能体都要从头配置，效率低。

**工作内容**:

1. 创建常用配置模板
2. 实现模板管理界面
3. 支持自定义模板
4. 一键应用模板

**预设模板**:

- 客服助手模板
- 数据分析模板
- 文案创作模板
- 代码审查模板

**交付物**:

- 新增 API：`src/app/api/agents/templates/route.ts`
- 模板库：`src/templates/agents/*.json`
- 管理界面：`src/app/admin/agent-templates/page.tsx`

**验收标准**:

- ✓ 提供至少 5 个预设模板
- ✓ 支持保存自定义模板
- ✓ 应用模板后仍可编辑
- ✓ 模板使用统计

**预计工时**: 6 小时

---

### OPT-023: 实现批量操作功能

**任务描述**:
管理员需要逐个操作智能体，效率低下。

**工作内容**:

1. 实现批量选择 UI
2. 创建批量操作 API
3. 实现异步任务处理
4. 提供进度反馈

**支持的操作**:

- 批量激活/停用
- 批量上下架
- 批量删除（软删除）
- 批量转移所有者

**交付物**:

- 新增 API：`src/app/api/agents/batch/route.ts`
- 后台任务：`src/jobs/batch-operation.job.ts`
- UI 组件：`src/components/agent/BatchActions.tsx`

**验收标准**:

- ✓ 单次支持至少 100 条记录
- ✓ 批量操作成功率≥98%
- ✓ 实时显示进度
- ✓ 失败项目单独列出并提供重试

**预计工时**: 8 小时

---

### OPT-024: 实现审计日志查询界面

**任务描述**:
审计日志只有数据库记录，缺乏可视化查询界面。

**工作内容**:

1. 创建审计日志查询界面
2. 实现多维度筛选（时间/操作人/操作类型）
3. 支持导出 CSV
4. 实现日志详情查看

**交付物**:

- 新增页面：`src/app/admin/agents-audit/page.tsx`
- 查询 API：`src/app/api/admin/audit-logs/route.ts`

**验收标准**:

- ✓ 支持按时间范围筛选
- ✓ 支持按操作类型筛选
- ✓ 支持按操作人筛选
- ✓ 导出 CSV 格式正确
- ✓ 分页加载，每页 50 条

**预计工时**: 6 小时

---

### OPT-025: 性能优化：添加缓存层

**任务描述**:
频繁查询数据库，响应时间较长。

**工作内容**:

1. 识别高频查询（列表、详情、统计）
2. 实现 Redis 缓存层
3. 制定缓存失效策略
4. 监控缓存命中率

**缓存策略**:

- 智能体列表：5 分钟 TTL
- 智能体详情：2 分钟 TTL
- 统计数据：10 分钟 TTL
- 用户权限：30 分钟 TTL

**交付物**:

- 新增文件：`src/lib/cache/agent.cache.ts`
- 缓存配置：`src/config/cache.config.ts`
- 监控仪表板：缓存命中率、命中率趋势

**验收标准**:

- ✓ 查询响应时间<100ms（缓存命中）
- ✓ 缓存命中率≥80%
- ✓ 缓存失效时自动回源
- ✓ 缓存穿透保护（布隆过滤器）

**预计工时**: 8 小时

---

## 📈 任务执行计划

### 第一阶段：紧急修复（1-2 周）

**目标**: 解决 P0 级严重问题

**任务**:

- OPT-001: 实现智能体创建表单提交逻辑
- OPT-002: 完善删除前关联检查机制
- OPT-003: 实现软删除机制
- OPT-004: 统一权限验证工具类

**预期成果**: 消除安全和数据完整性风险

---

### 第二阶段：功能完善（3-4 周）

**目标**: 解决 P1 级重要问题

**任务**:

- OPT-005 ~ OPT-016（共 12 个任务）

**重点**:

- 配置验证和事务处理
- 订阅管理和多租户隔离
- API 标准化和超时控制

**预期成果**: 核心功能完备，用户体验显著提升

---

### 第三阶段：优化增强（5-8 周）

**目标**: 实施 P2 级改进建议

**任务**:

- OPT-017 ~ OPT-025（共 9 个任务）

**重点**:

- 监控告警和数据分析
- 批量操作和模板功能
- 性能优化（缓存层）

**预期成果**: 系统稳定性、性能和运营能力全面提升

---

## 📊 完成度追踪

### 总体统计

- **总任务数**: 25
- **P0 级任务**: 4 个（16%）
- **P1 级任务**: 12 个（48%）
- **P2 级任务**: 9 个（36%）

### 工时估算

- **总预计工时**: 147 小时 ≈ 18.4 人天
- **第一阶段**: 23 小时 ≈ 2.9 人天
- **第二阶段**: 72 小时 ≈ 9 人天
- **第三阶段**: 52 小时 ≈ 6.5 人天

### 进度追踪表

| 阶段           | 任务总数 | 已完成                                                                                   | 进行中 | 未开始 | 完成率  |
| -------------- | -------- | ---------------------------------------------------------------------------------------- | ------ | ------ | ------- |
| 第一阶段（P0） | 4        | 4                                                                                        | -      | -      | 100%    |
| 第二阶段（P1） | 12       | OPT-005、OPT-006、OPT-007、OPT-010、OPT-011、OPT-012、OPT-013、OPT-014、OPT-015、OPT-016 | -      | 2      | 83.3%   |
| 第三阶段（P2） | 9        | OPT-017, OPT-018                                                                         | -      | 7      | 22.2%   |
| **总计**       | **25**   | **16**                                                                                   | **-**  | **9**  | **64%** |

---

## 📝 备注

1. **任务依赖关系**:
   - OPT-003 依赖于 OPT-002（删除检查完成后才能实施软删除）
   - OPT-008 依赖于 OPT-007（库存管理需要上下架 API）
   - OPT-018 是 OPT-019 的基础（历史数据支撑高级分析）

2. **风险点**:
   - OPT-016（多租户隔离）可能影响现有查询，需要充分测试
   - OPT-025（缓存层）需要额外的基础设施（Redis）

3. **优先级调整**:
   - 根据业务需求变化，可动态调整任务优先级
   - 用户反馈强烈的问题应优先处理

4. **验收流程**:
   - 每个任务完成后需进行自测
   - 提交代码前需通过 Code Review
   - 关键功能需编写单元测试

---

**文档维护**: 本任务清单应根据实际执行情况动态更新，每周同步一次进度。

**最后更新**: 2026 年 3 月 24 日
