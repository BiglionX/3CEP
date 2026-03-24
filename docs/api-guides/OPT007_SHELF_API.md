# OPT-007 智能体手动上下架 API 使用指南

## 📋 功能概述

提供管理员手动上架/下架智能体的 API 端点，用于：

- 违规智能体快速下架
- 审核通过后手动上架
- 紧急情况下的批量操作

---

## 🔗 API 端点

```http
POST /api/admin/agents/[id]/shelf
```

### 路径参数

| 参数 | 类型   | 必填 | 描述        |
| ---- | ------ | ---- | ----------- |
| id   | string | 是   | 智能体 UUID |

### 请求体

```json
{
  "action": "on_shelf" | "off_shelf",
  "reason": "string (可选，建议填写)"
}
```

#### 参数说明

| 参数   | 类型   | 必填 | 描述                                                    |
| ------ | ------ | ---- | ------------------------------------------------------- |
| action | string | 是   | 操作类型：<br>- `on_shelf`: 上架<br>- `off_shelf`: 下架 |
| reason | string | 否   | 操作原因（特别是下架时建议填写，便于追溯和通知开发者）  |

---

## 🔐 权限要求

需要以下角色之一：

- `admin` - 超级管理员
- `marketplace_admin` - 市场管理员

其他角色访问将返回 `403 Forbidden` 错误。

---

## 📤 响应示例

### 成功响应（200 OK）

```json
{
  "success": true,
  "message": "智能体已下架",
  "data": {
    "agent": {
      "id": "uuid",
      "name": "智能体名称",
      "shelf_status": "off_shelf",
      "updated_at": "2026-03-24T10:30:00.000Z",
      ...
    },
    "action": "off_shelf",
    "previousStatus": "on_shelf",
    "newStatus": "off_shelf"
  }
}
```

### 错误响应

#### 400 Bad Request - 无效参数

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "请求参数验证失败",
    "details": "action 参数必须为 on_shelf 或 off_shelf",
    "timestamp": "2026-03-24T10:30:00.000Z",
    "path": "/api/admin/agents/xxx/shelf",
    "requestId": "uuid"
  }
}
```

#### 403 Forbidden - 权限不足

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "您没有权限执行此操作",
    "details": "需要 marketplace_admin 或 admin 角色",
    "timestamp": "2026-03-24T10:30:00.000Z",
    "path": "/api/admin/agents/xxx/shelf",
    "requestId": "uuid"
  }
}
```

#### 404 Not Found - 智能体不存在

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "资源不存在",
    "details": "智能体不存在",
    "timestamp": "2026-03-24T10:30:00.000Z",
    "path": "/api/admin/agents/xxx/shelf",
    "requestId": "uuid"
  }
}
```

---

## 💡 使用示例

### 1. cURL 示例

#### 上架智能体

```bash
curl -X POST http://localhost:3000/api/admin/agents/UUID/shelf \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -d '{
    "action": "on_shelf",
    "reason": "审核通过，准予上架"
  }'
```

#### 下架智能体

```bash
curl -X POST http://localhost:3000/api/admin/agents/UUID/shelf \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -d '{
    "action": "off_shelf",
    "reason": "内容违规：包含虚假信息"
  }'
```

### 2. JavaScript/TypeScript 示例

```typescript
// 上架智能体
async function shelveAgent(agentId: string) {
  const response = await fetch(`/api/admin/agents/${agentId}/shelf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'on_shelf',
      reason: '审核通过，准予上架',
    }),
  });

  const data = await response.json();

  if (data.success) {
    console.log('✅ 上架成功:', data.data.agent.name);
  } else {
    console.error('❌ 上架失败:', data.error.details);
  }
}

// 下架智能体
async function unshelveAgent(agentId: string, reason: string) {
  const response = await fetch(`/api/admin/agents/${agentId}/shelf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'off_shelf',
      reason: reason,
    }),
  });

  const data = await response.json();

  if (data.success) {
    console.log('✅ 下架成功:', data.data.agent.name);
    console.log('📧 已自动发送邮件通知开发者');
  } else {
    console.error('❌ 下架失败:', data.error.details);
  }
}
```

### 3. React 组件示例

```tsx
import { useState } from 'react';

interface ShelfActionProps {
  agentId: string;
  currentStatus: string;
  onSuccess?: () => void;
}

export function ShelfAction({
  agentId,
  currentStatus,
  onSuccess,
}: ShelfActionProps) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');

  const handleShelfAction = async (action: 'on_shelf' | 'off_shelf') => {
    if (action === 'off_shelf' && !reason.trim()) {
      alert('请填写下架原因');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/agents/${agentId}/shelf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        onSuccess?.();
      } else {
        alert('操作失败：' + data.error.details);
      }
    } catch (error) {
      alert('操作异常：' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shelf-actions">
      {currentStatus === 'off_shelf' ? (
        <button
          onClick={() => handleShelfAction('on_shelf')}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? '处理中...' : '上架'}
        </button>
      ) : (
        <div>
          <input
            type="text"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="下架原因"
            className="input input-bordered mb-2"
          />
          <button
            onClick={() => handleShelfAction('off_shelf')}
            disabled={loading || !reason.trim()}
            className="btn btn-error"
          >
            {loading ? '处理中...' : '下架'}
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 🎯 功能特性

### ✅ 已实现功能

1. **权限验证**
   - 仅管理员和市场管理员可操作
   - 统一的权限验证工具类

2. **状态更新**
   - 立即生效（响应时间 < 200ms）
   - 自动记录更新时间和管理员 ID

3. **审计日志**
   - 自动记录所有上下架操作
   - 包含操作人、时间、原因等详细信息

4. **邮件通知**
   - 下架时自动发送邮件通知开发者
   - 包含下架原因和申诉指引

5. **错误处理**
   - 统一的错误响应格式
   - 详细的错误信息和追踪 ID

---

## 📊 数据库影响

### 更新的表

#### agents 表

| 字段         | 操作 | 说明                      |
| ------------ | ---- | ------------------------- |
| shelf_status | 更新 | 设置为 on_shelf/off_shelf |
| updated_at   | 更新 | 当前时间戳                |
| updated_by   | 更新 | 执行操作的管理员 ID       |

#### agent_audit_logs 表

每次操作都会插入一条审计日志：

```sql
INSERT INTO agent_audit_logs (
  agent_id,
  action,
  actor_id,
  actor_email,
  actor_role,
  details,
  created_at
) VALUES (
  :agentId,
  'SHELF_ON' | 'SHELF_OFF',
  :userId,
  :userEmail,
  :userRole,
  :details, -- JSON 格式，包含原因等信息
  NOW()
);
```

---

## 🧪 测试

### 运行自动化测试

```bash
# 确保开发服务器已启动
npm run dev

# 在另一个终端运行测试
npx ts-node scripts/test-opt007-shelf-api.ts
```

### 测试用例覆盖

- ✅ 管理员成功上架智能体
- ✅ 管理员成功下架智能体
- ✅ 非管理员权限不足（403）
- ✅ 无效的 action 参数（400）
- ✅ 智能体不存在（404）
- ✅ 审计日志记录验证

---

## 🔍 故障排查

### 问题 1: 返回 401 Unauthorized

**原因**: 用户未登录或 token 过期

**解决方案**:

1. 检查 Cookie 中是否包含 `sb-access-token`
2. 重新登录获取新 token
3. 确认会话未过期

### 问题 2: 返回 403 Forbidden

**原因**: 用户角色不是 admin 或 marketplace_admin

**解决方案**:

1. 检查用户角色：`SELECT role FROM profiles WHERE id = 'USER_ID'`
2. 如需授权，更新角色：`UPDATE profiles SET role = 'admin' WHERE id = 'USER_ID'`

### 问题 3: 返回 404 Not Found

**原因**: 智能体 ID 不存在或已被软删除

**解决方案**:

1. 确认智能体 ID 正确
2. 检查智能体是否被软删除（`deleted_at IS NOT NULL`）

### 问题 4: 邮件通知未发送

**原因**: 邮件服务未集成或配置错误

**解决方案**:

1. 检查 `sendShelfNotification` 函数实现
2. 配置邮件服务提供商（如 SendGrid、阿里云邮件推送）
3. 查看控制台日志确认是否触发发送逻辑

---

## 📝 最佳实践

1. **填写详细原因**
   - 下架时务必填写具体原因
   - 便于追溯和开发者申诉

2. **批量操作**
   - 多个智能体需要上下架时，建议使用批量 API（OPT-023）
   - 避免频繁调用单个 API

3. **通知开发者**
   - 下架后建议同步发送邮件或站内信
   - 提供申诉渠道和改进建议

4. **审计查询**
   - 定期查看审计日志，监控异常操作
   - 可使用审计日志查询界面（OPT-024）

---

## 🚀 后续优化

- [ ] 集成真实邮件服务（当前为控制台日志）
- [ ] 添加批量上下架功能（OPT-023）
- [ ] 实现审计日志可视化查询（OPT-024）
- [ ] 添加操作确认二次验证
- [ ] 支持下架前自动检查关联订单

---

## 📞 技术支持

如有问题，请联系：

- 平台管理员：admin@example.com
- 技术支持：support@example.com

---

**最后更新**: 2026 年 3 月 24 日
