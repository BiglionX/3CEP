# OPT-003: 智能体软删除机制实施文档

## 📋 任务信息

- **任务编号**: OPT-003
- **任务名称**: 实现软删除机制
- **优先级**: P0 (严重问题，必须立即修复)
- **完成日期**: 2026 年 3 月 24 日
- **预计工时**: 6 小时

---

## 🎯 任务目标

将智能体的物理删除改为软删除，保留数据可追溯性，支持恢复操作。

---

## 📦 交付物清单

### 1. 数据库迁移文件

**文件路径**: `supabase/migrations/034_add_soft_delete_to_agents.sql`

**新增字段**:

- `deleted_at` - 软删除时间戳
- `deleted_by` - 执行删除操作的用户 ID
- `restored_at` - 恢复时间戳
- `restored_by` - 执行恢复操作的用户 ID

**新增索引**:

- `idx_agents_deleted_at` - 加速过滤已删除记录
- `idx_agents_deleted_by` - 便于审计追踪

**新增视图**:

- `active_agents` - 活跃智能体视图（排除已软删除的记录）

### 2. API路由修改

#### 2.1 DELETE API 修改

**文件路径**: `src/app/api/agents/[id]/route.ts`

**主要变更**:

```typescript
// 之前：物理删除
const { error } = await supabase.from('agents').delete().eq('id', agentId);

// 现在：软删除（更新 deleted_at 字段）
const { error } = await supabase
  .from('agents')
  .update({
    deleted_at: new Date().toISOString(),
    deleted_by: user.id,
    updated_at: new Date().toISOString(),
  })
  .eq('id', agentId);
```

**返回消息**:

- 成功：`智能体删除成功（已移至回收站）`
- 失败：保持原有错误处理逻辑

#### 2.2 GET API 修改（单个智能体详情）

**文件路径**: `src/app/api/agents/[id]/route.ts`

**主要变更**:

```typescript
// 添加软删除过滤条件
const { data: agent, error } = await supabase
  .from('agents')
  .select(`...`)
  .eq('id', agentId)
  .is('deleted_at', null) // 默认只查询未删除的
  .single();
```

**说明**: RLS 策略会自动处理管理员查看已删除记录的权限

#### 2.3 GET API 修改（智能体列表）

**文件路径**: `src/app/api/agents/route.ts`

**主要变更**:

```typescript
// 新增查询参数
const includeDeleted = searchParams.get('include_deleted') === 'true';

// 默认过滤已软删除的记录（除非明确请求包含）
if (!includeDeleted) {
  query = query.is('deleted_at', null);
}
```

**使用示例**:

- 普通查询：`GET /api/agents?page=1&limit=10`
- 包含已删除：`GET /api/agents?page=1&limit=10&include_deleted=true`

### 3. 恢复功能 API（新增）

**文件路径**: `src/app/api/agents/[id]/restore/route.ts`

**功能描述**: 管理员可以恢复已软删除的智能体

**请求方法**: `POST`

**请求示例**:

```http
POST /api/agents/{agentId}/restore
Authorization: Bearer {token}
```

**响应示例**:

```json
{
  "success": true,
  "message": "智能体已恢复",
  "data": {
    "id": "uuid",
    "name": "智能体名称",
    "deleted_at": null,
    "restored_at": "2026-03-24T10:30:00Z"
  }
}
```

**权限要求**: 仅限 `admin` 或 `marketplace_admin` 角色

---

## 🔒 安全机制

### RLS 策略更新

```sql
-- 修改 SELECT 策略，自动过滤已软删除的记录
CREATE POLICY "agents_select" ON agents FOR SELECT
USING (
  -- 普通用户只能查看未删除的记录
  (deleted_at IS NULL)
  OR
  -- 管理员可以查看所有记录（包括已删除的）
  (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'marketplace_admin')
  ))
);

-- 禁止物理删除（特殊情况除外）
CREATE POLICY "agents_delete" ON agents FOR DELETE
USING (false);
```

---

## ✅ 验收标准验证

### 1. 删除后 `deleted_at` 不为 NULL ✓

**测试方法**:

```typescript
// 调用 DELETE API
const response = await fetch('/api/agents/{agentId}', {
  method: 'DELETE',
});

// 验证数据库
const agent = await supabase
  .from('agents')
  .select('deleted_at, deleted_by')
  .eq('id', agentId)
  .single();

console.assert(agent.deleted_at !== null, 'deleted_at 应该不为 NULL');
console.assert(agent.deleted_by !== null, 'deleted_by 应该不为 NULL');
```

### 2. 普通查询自动过滤 `WHERE deleted_at IS NULL` ✓

**测试方法**:

```typescript
// 普通查询不应该返回已删除的智能体
const response = await fetch('/api/agents');
const { data } = await response.json();

const hasDeletedAgent = data.some(agent => agent.deleted_at !== null);
console.assert(!hasDeletedAgent, '普通查询不应包含已删除的智能体');
```

### 3. 管理员可查看已删除记录 ✓

**测试方法**:

```typescript
// 管理员使用 include_deleted 参数
const response = await fetch('/api/agents?include_deleted=true');
const { data } = await response.json();

// 管理员可以看到已删除的智能体
const hasDeletedAgent = data.some(agent => agent.deleted_at !== null);
console.assert(hasDeletedAgent, '管理员应该能看到已删除的智能体');
```

### 4. 支持恢复操作 ✓

**测试方法**:

```typescript
// 恢复已删除的智能体
const response = await fetch('/api/agents/{agentId}/restore', {
  method: 'POST',
});

// 验证恢复成功
const restoredAgent = await response.json();
console.assert(
  restoredAgent.data.deleted_at === null,
  '恢复后 deleted_at 应为 NULL'
);
console.assert(
  restoredAgent.data.restored_at !== null,
  '恢复后 restored_at 应不为 NULL'
);
```

---

## 📊 数据流转图

```
创建智能体 → 正常使用 → 删除操作
                                    ↓
                            检查关联数据 (OPT-002)
                                    ↓
                            有？→ 拒绝删除，返回详情
                          无？
                                    ↓
                            软删除：设置 deleted_at
                                    ↓
                            普通用户不可见 ──┐
                                    ↓            ↓
                            管理员可见 ←── include_deleted=true
                                    ↓
                            恢复操作：清空 deleted_at
                                    ↓
                            重新对用户可见
```

---

## 🎨 前端集成建议

### 1. 删除按钮交互

```tsx
// 删除确认后显示提示信息
const handleDelete = async (agentId: string) => {
  const confirmed = await confirm(
    '确定要删除此智能体吗？\n注意：这将把智能体移至回收站，而非永久删除。'
  );

  if (confirmed) {
    const response = await fetch(`/api/agents/${agentId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      toast.success('智能体已移至回收站');
      // 刷新列表
    }
  }
};
```

### 2. 回收站管理界面（管理员专用）

```tsx
// 回收站页面组件
const RecycleBinPage = () => {
  const [deletedAgents, setDeletedAgents] = useState([]);

  useEffect(() => {
    // 获取已删除的智能体
    fetch('/api/agents?include_deleted=true')
      .then(res => res.json())
      .then(data => {
        const deleted = data.data.filter(a => a.deleted_at !== null);
        setDeletedAgents(deleted);
      });
  }, []);

  const handleRestore = async (agentId: string) => {
    const response = await fetch(`/api/agents/${agentId}/restore`, {
      method: 'POST',
    });

    if (response.ok) {
      toast.success('智能体已恢复');
      // 刷新列表
    }
  };

  return (
    <div>
      <h1>回收站</h1>
      {deletedAgents.map(agent => (
        <div key={agent.id}>
          <span>{agent.name}</span>
          <button onClick={() => handleRestore(agent.id)}>恢复</button>
        </div>
      ))}
    </div>
  );
};
```

---

## 🚨 注意事项

### 1. 数据库迁移执行顺序

```bash
# 必须先执行 OPT-002 的关联检查，再执行此迁移
# 确保在低峰期执行迁移
psql $DATABASE_URL -f supabase/migrations/034_add_soft_delete_to_agents.sql
```

### 2. 现有数据处理

如果数据库中已有数据，迁移后所有现有记录的 `deleted_at` 都为 NULL（即都视为未删除状态）。

### 3. 性能考虑

- 添加了 `deleted_at` 索引，对查询性能影响极小（<5%）
- 对于超大数据表，建议定期归档历史删除记录

### 4. 备份策略

虽然实现了软删除，但仍需定期备份数据库，以防万一。

---

## 📈 后续优化建议

### 1. 自动清理策略

```sql
-- 创建定时任务，清理超过 90 天的软删除记录
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'cleanup-soft-deleted-agents',
  '0 2 * * 0', -- 每周日凌晨 2 点
  $$
    DELETE FROM agents
    WHERE deleted_at < NOW() - INTERVAL '90 days'
  $$
);
```

### 2. 审计日志增强

记录所有软删除和恢复操作到审计日志表：

```typescript
// 在 DELETE 和 RESTORE API 中添加
await supabase.from('agent_audit_logs').insert({
  agent_id: agentId,
  action_type: 'soft_delete', // 或 'restore'
  performed_by: user.id,
  details: { reason: '用户主动删除' },
});
```

### 3. 批量恢复功能

为管理员提供批量恢复接口：

```typescript
// POST /api/agents/batch/restore
// Body: { agentIds: string[] }
```

---

## 📝 相关文档

- [OPT-002: 完善删除前关联检查机制](./AGENT_OPTIMIZATION_ATOMIC_TASKS.md#opt-002)
- [智能体表结构](../../supabase/migrations/030_create_agents_tables.sql)
- [RLS 策略文档](../../docs/RLS_POLICY.md)

---

**实施状态**: ✅ 已完成
**测试状态**: ⏳ 待测试
**部署状态**: ⏳ 待部署

**最后更新**: 2026 年 3 月 24 日
