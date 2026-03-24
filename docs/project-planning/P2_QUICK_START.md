# P2 优化任务快速开始指南

## 📋 概述

本文档提供 P2 级优化任务的快速部署和验证指南。

---

## 🎯 已完成功能

### ✅ OPT-018: 历史监控数据存储

- **智能体状态历史表**（分区表，保留 90 天）
- **定时快照采集**（每小时执行）
- **物化视图**（加速最近 7 天统计查询）
- **数据归档**（自动清理过期数据）

### ✅ OPT-017: 告警通知机制

- **告警规则管理**（支持多种条件）
- **告警评估引擎**（每 5 分钟执行）
- **多渠道通知**（邮件、短信、站内信、Webhook）
- **冷却期机制**（防止告警风暴）

---

## 🚀 快速部署

### 步骤 1: 应用数据库迁移

```bash
# 应用历史数据表迁移（包含主键修复）
npx supabase db push --include-all

# 或单独应用（按顺序）
npx supabase db push -f supabase/migrations/20260324_create_agent_status_history.sql
npx supabase db push -f supabase/migrations/20260324_add_uuid_trigger_to_agent_status_history.sql
npx supabase db push -f supabase/migrations/20260324_create_refresh_view_function.sql
npx supabase db push -f supabase/migrations/20260324_create_alert_system.sql
```

### 步骤 2: 启动开发服务器

```bash
npm run dev
```

### 步骤 3: 验证功能

```bash
# 运行验证脚本
npx ts-node scripts/verify-p2-optimization.ts
```

---

## 📖 使用指南

### 1. 历史数据查询

#### API 调用

```typescript
// 查询历史数据（指定时间范围）
const response = await fetch(
  '/api/analytics/agents/history?startDate=2026-03-01&endDate=2026-03-24&granularity=daily'
);
const data = await response.json();

// 查询最近 7 天统计（物化视图，快速）
const statsResponse = await fetch('/api/analytics/agents/stats/recent');
const stats = await statsResponse.json();
```

#### 参数说明

| 参数        | 必填 | 说明      | 示例                      |
| ----------- | ---- | --------- | ------------------------- |
| agentId     | 否   | 智能体 ID | `abc123`                  |
| startDate   | 是   | 开始日期  | `2026-03-01`              |
| endDate     | 是   | 结束日期  | `2026-03-24`              |
| granularity | 否   | 聚合粒度  | `hourly`/`daily`/`weekly` |

#### 导出 CSV

```bash
curl -X POST http://localhost:3000/api/analytics/agents/history/export \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2026-03-01",
    "endDate": "2026-03-24"
  }' \
  --output agent_history.csv
```

---

### 2. 告警管理

#### 查看告警规则

```bash
curl http://localhost:3000/api/admin/alerts/rules
```

响应示例：

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "name": "智能体离线告警",
      "rule_type": "offline",
      "priority": "critical",
      "enabled": true,
      "cooldown_period": 3600
    }
  ]
}
```

#### 创建自定义告警规则

```bash
curl -X POST http://localhost:3000/api/admin/alerts/rules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CPU 使用率过高",
    "description": "当 CPU 使用率超过 80% 时触发",
    "rule_type": "custom",
    "resource_type": "agent",
    "condition": {
      "field": "cpu_usage",
      "operator": ">",
      "value": 0.8,
      "duration": 300
    },
    "threshold": {
      "value": 0.8,
      "unit": "percent"
    },
    "notification_channels": ["email", "in_app"],
    "priority": "warning",
    "cooldown_period": 3600
  }'
```

#### 查看告警历史

```bash
# 查看所有活跃告警
curl "http://localhost:3000/api/admin/alerts/history?status=active"

# 查看严重告警
curl "http://localhost:3000/api/admin/alerts/history?severity=critical"

# 分页查询
curl "http://localhost:3000/api/admin/alerts/history?page=1&limit=50"
```

---

### 3. 定时任务管理

#### 手动触发快照采集

```bash
curl -X POST http://localhost:3000/api/cron/trigger \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{"jobName": "agent-status-snapshot"}'
```

#### 手动触发告警评估

```bash
curl -X POST http://localhost:3000/api/cron/trigger \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{"jobName": "alert-evaluation"}'
```

#### 配置 Vercel Cron Jobs

在 `vercel.json` 中添加：

```json
{
  "crons": [
    {
      "path": "/api/cron/trigger",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/trigger",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/trigger",
      "schedule": "0 2 * * *"
    }
  ]
}
```

---

## 🔧 配置选项

### 环境变量

确保以下环境变量已设置：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# API 配置
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 告警通知配置

#### 邮件通知（以 Resend 为例）

```bash
# .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

修改 `src/services/monitoring/alert.service.ts` 中的 `sendEmailNotification` 函数：

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmailNotification(userId: string, alert: any) {
  const { data: user } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single();

  if (!user?.email) return;

  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: user.email,
    subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
    html: `
      <h2>${alert.title}</h2>
      <p>${alert.message}</p>
      <p>严重程度：${alert.severity}</p>
      <p>触发时间：${new Date(alert.triggered_at).toLocaleString('zh-CN')}</p>
    `,
  });
}
```

---

## 📊 监控与维护

### 查看数据量统计

```sql
-- 查询历史数据总量
SELECT COUNT(*) FROM agent_status_history;

-- 查询各分区数据量
SELECT
  'agent_status_history_2026_03' as partition, COUNT(*)
  FROM agent_status_history_2026_03
UNION ALL
SELECT
  'agent_status_history_2026_04' as partition, COUNT(*)
  FROM agent_status_history_2026_04;

-- 查询活跃告警数量
SELECT status, COUNT(*) FROM alert_history GROUP BY status;
```

### 清理测试数据

```sql
-- 删除所有历史数据（谨慎使用）
TRUNCATE TABLE agent_status_history CASCADE;

-- 删除特定日期的数据
DELETE FROM agent_status_history
WHERE recorded_at < '2026-03-01';

-- 刷新物化视图
REFRESH MATERIALIZED VIEW CONCURRENTLY agent_status_last_7days;
```

---

## 🐛 故障排查

### 问题 1: 快照采集失败

**症状**: 调用 `/api/cron/trigger` 返回错误

**排查步骤**:

1. 检查 Supabase 连接是否正常
2. 确认 `agent_status_history` 表是否存在
3. 查看服务日志：`docker logs your-app`

### 问题 2: 告警未触发

**症状**: 告警评估成功但未生成告警记录

**排查步骤**:

1. 检查告警规则是否启用：`SELECT * FROM alert_rules WHERE enabled = true;`
2. 验证条件配置是否正确
3. 检查冷却期：`SELECT * FROM alert_history WHERE triggered_at > NOW() - INTERVAL '1 hour';`

### 问题 3: 物化视图查询慢

**症状**: `/api/analytics/agents/stats/recent` 响应慢

**排查步骤**:

1. 检查物化视图是否存在：`\dv+ agent_status_last_7days`
2. 手动刷新视图：`REFRESH MATERIALIZED VIEW agent_status_last_7days;`
3. 检查索引：`\di idx_agent_status_last_7days_agent_date`

---

## 📈 性能优化建议

### 1. 数据库优化

```sql
-- 定期分析表
ANALYZE agent_status_history;

-- 优化慢查询
EXPLAIN ANALYZE
SELECT * FROM agent_status_history
WHERE agent_id = 'xxx' AND recorded_at >= NOW() - INTERVAL '7 days';
```

### 2. 缓存策略

对于高频查询，考虑添加 Redis 缓存：

```typescript
// 伪代码示例
const cached = await redis.get(`stats:recent:${agentId}`);
if (cached) {
  return JSON.parse(cached);
}

const stats = await queryDatabase();
await redis.setex(`stats:recent:${agentId}`, 300, JSON.stringify(stats));
return stats;
```

### 3. 批量插入优化

```typescript
// 分批插入，避免单次大量数据
const batchSize = 100;
for (let i = 0; i < data.length; i += batchSize) {
  const batch = data.slice(i, i + batchSize);
  await supabase.from('agent_status_history').insert(batch);
}
```

---

## 📝 下一步计划

### 即将实施

- [ ] **OPT-025**: 添加 Redis 缓存层
- [ ] **OPT-019**: 高级统计分析（转化率、留存率、ROI）
- [ ] **OPT-024**: 审计日志查询界面

### 长期规划

- [ ] 机器学习预测性维护
- [ ] 实时告警仪表板
- [ ] 移动端推送通知

---

## 📚 相关文档

- [P2 优化任务进度报告](./P2_OPTIMIZATION_PROGRESS_REPORT.md)
- [智能体优化原子任务清单](./AGENT_OPTIMIZATION_ATOMIC_TASKS.md)
- [Supabase 表结构文档](../supabase/README.md)

---

## 💬 技术支持

如有问题，请通过以下方式联系：

- 📧 Email: support@yourcompany.com
- 💬 Slack: #agent-optimization
- 📖 Docs: https://docs.yourcompany.com

---

**最后更新**: 2026 年 3 月 24 日
**版本**: v1.0
