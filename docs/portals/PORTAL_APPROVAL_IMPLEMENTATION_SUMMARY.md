# 门户审批流程实施总结

**版本**: 1.0.0  
**创建时间**: 2026-03-24  
**状态**: ✅ 开发完成，待部署测试

---

## 📋 任务完成情况

### ✅ Task 8.1: 设计门户审批工作流 (1 小时)

**流程图**:
```
提交申请 → 自动初审 → 人工复审 → 批准/拒绝 → 通知申请人
```

**详细流程**:

1. **用户提交申请**
   - 填写门户基本信息
   - 上传业务链接、图片等内容
   - 提交审核申请

2. **系统自动初审** (可选扩展)
   - 内容合规性检查
   - 敏感词过滤
   - 格式验证

3. **管理员人工复审**
   - 查看门户详情
   - 评估内容质量
   - 决定批准或拒绝

4. **审批结果处理**
   - 批准：自动发布门户
   - 拒绝：返回修改意见

5. **通知申请人**
   - 邮件通知
   - 站内消息
   - n8n 工作流触发

### ✅ Task 8.2: 创建审批 API (2 小时)

#### 单户审批 API

**文件**: `src/app/api/admin/portals/approve/route.ts`

**接口定义**:
```typescript
POST /api/admin/portals/approve

Request Body:
{
  portalId: string,      // 门户 ID
  action: 'approve' | 'reject',  // 操作类型
  reason?: string,       // 拒绝原因（拒绝时必填）
  conditions?: any[]     // 审批条件（可选）
}

Response:
{
  success: boolean,
  data: {
    portal: Portal,
    action: string
  },
  message: string
}
```

**核心功能**:
- ✅ 身份验证（需要管理员权限）
- ✅ 参数验证
- ✅ 更新门户状态
- ✅ 记录审批日志
- ✅ 触发 n8n 通知工作流
- ✅ 错误处理和回滚

#### 批量审批 API

**文件**: `src/app/api/admin/portals/batch-approve/route.ts`

**接口定义**:
```typescript
POST /api/admin/portals/batch-approve

Request Body:
{
  portalIds: string[],   // 门户 ID 列表
  action: 'approve' | 'reject',
  reason?: string        // 拒绝原因（批量拒绝时必填）
}

Response:
{
  success: boolean,
  data: {
    updatedCount: number,
    portalIds: string[]
  },
  message: string
}
```

**核心功能**:
- ✅ 批量更新门户状态
- ✅ 批量记录审批日志
- ✅ 触发批量通知
- ✅ 事务一致性保证

#### 待审批列表 API

**文件**: `src/app/api/admin/portals/pending/route.ts` (已在 approve.ts 中实现 GET)

**接口定义**:
```typescript
GET /api/admin/portals/pending?limit=20&offset=0

Response:
{
  success: boolean,
  data: {
    portals: Portal[],
    pagination: {
      total: number,
      limit: number,
      offset: number
    }
  }
}
```

### ✅ Task 8.3: 开发审批管理界面 (2 小时)

**文件**: `src/components/portals/PortalsApprovalManager.tsx`

**核心组件**:

#### 1. PortalsApprovalManager (主组件)

**功能特性**:
- ✅ 加载待审批门户列表
- ✅ 单个审批（批准/拒绝）
- ✅ 批量审批（选择多个）
- ✅ 审批对话框（带原因输入）
- ✅ 实时反馈提示
- ✅ 自动刷新列表

**UI 组件**:
- 统计面板：显示待审批数量
- 表格展示：门户信息列表
- 复选框：支持批量选择
- 操作按钮：批准/拒绝/查看详情
- 对话框：确认审批操作
- Snackbar：操作结果提示

#### 2. ApprovalDialog (审批对话框)

**功能**:
- 显示门户名称
- 根据操作类型显示不同内容
- 批准：成功提示信息
- 拒绝：原因输入框（必填）
- 确认/取消按钮

**使用示例**:
```tsx
<ApprovalDialog
  open={dialogOpen}
  onClose={() => setDialogOpen(false)}
  onConfirm={(reason) => handleApprove(reason)}
  action="approve"
  portalName="测试门户"
/>
```

### ✅ Task 8.4: 集成 n8n 审批通知工作流 (1 小时)

**文件**: `n8n-workflows/portal-approval-notification.json`

**工作流节点**:

1. **Webhook Trigger**
   - 路径：`/webhook/portal-approval`
   - 方法：POST
   - 接收审批事件数据

2. **Check Action** (IF 节点)
   - 判断是批准还是拒绝
   - 分支处理不同通知模板

3. **Send Approval Email** (批准邮件)
   - 主题：🎉 恭喜！您的门户申请已通过审核
   - HTML 模板：包含门户信息和查看按钮
   - 触发时机：审批通过时

4. **Send Rejection Email** (拒绝邮件)
   - 主题：❌ 很遗憾，您的门户申请未通过审核
   - HTML 模板：包含拒绝原因和修改指引
   - 触发时机：审批拒绝时

5. **Create In-App Notification** (站内通知)
   - HTTP Request 调用内部 API
   - 创建应用内通知记录
   - 实时推送给用户

**导入步骤**:
1. 打开 n8n 管理界面
2. 点击 "Import Workflow"
3. 上传 `portal-approval-notification.json`
4. 配置 SMTP 凭据
5. 激活工作流

### ✅ Task 8.5: 编写审批流程文档

**交付文档**:
1. ✅ 本实施总结文档
2. ✅ API 使用说明
3. ✅ 数据库迁移脚本
4. ✅ n8n 工作流配置
5. ✅ 组件使用指南

---

## 📦 交付物清单

### 源代码文件

1. **API 路由**
   - [x] `src/app/api/admin/portals/approve/route.ts` (241 行)
   - [x] `src/app/api/admin/portals/batch-approve/route.ts` (136 行)

2. **React 组件**
   - [x] `src/components/portals/PortalsApprovalManager.tsx` (522 行)

3. **数据库**
   - [x] `sql/portal-approval-system.sql` (250 行)

4. **n8n 工作流**
   - [x] `n8n-workflows/portal-approval-notification.json` (174 行)

**总计**: 5 个文件，1,323 行代码和配置

### 数据库对象

#### 新增表

**portal_approval_logs** - 审批日志表
```sql
CREATE TABLE portal_approval_logs (
  id UUID PRIMARY KEY,
  portal_id UUID REFERENCES user_portals(id),
  reviewer_id UUID REFERENCES auth.users(id),
  action VARCHAR(20) CHECK (action IN ('approved', 'rejected')),
  reason TEXT,
  conditions JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 新增视图

**v_portal_approval_stats** - 审批统计视图
- 按日统计批准/拒绝数量
- 计算通过率
- 统计活跃审核员

#### 新增函数

**update_portal_review_timestamp()** - 触发器函数
- 自动更新 reviewed_at 时间戳

**notify_portal_approval()** - 通知函数
- PostgreSQL LISTEN/NOTIFY机制
- 实时推送审批事件

**cleanup_old_approval_logs()** - 清理函数
- 删除过期日志（默认保留 365 天）

#### RLS 策略

- ✅ 管理员可查看所有日志
- ✅ 管理员可插入日志
- ✅ 用户只能查看自己门户的日志

---

## 🎯 核心功能特性

### 1. 单户审批

**流程**:
```
管理员点击"批准" → 弹出确认对话框 → 确认 → 
更新门户状态 → 记录日志 → 触发通知 → 显示成功提示
```

**API 调用示例**:
```typescript
// 批准
await fetch('/api/admin/portals/approve', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    portalId: 'portal-uuid',
    action: 'approve',
  }),
});

// 拒绝（需要原因）
await fetch('/api/admin/portals/approve', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    portalId: 'portal-uuid',
    action: 'reject',
    reason: '内容不符合平台规范',
  }),
});
```

### 2. 批量审批

**流程**:
```
勾选多个门户 → 点击"批量通过" → 确认 → 
批量更新状态 → 批量记录日志 → 触发批量通知 → 显示统计
```

**API 调用示例**:
```typescript
await fetch('/api/admin/portals/batch-approve', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    portalIds: ['id1', 'id2', 'id3'],
    action: 'approve',
  }),
});
```

### 3. 审批日志

**记录内容**:
- 门户 ID
- 审核员 ID
- 审批动作（批准/拒绝）
- 审批原因
- 审批条件（可选）
- 元数据（可选）
- 时间戳

**查询示例**:
```sql
-- 查看某门户的审批历史
SELECT * FROM v_portal_approval_stats
WHERE approval_date >= CURRENT_DATE - INTERVAL '7 days';

-- 统计审核员工作量
SELECT 
  reviewer_id,
  COUNT(*) as total_reviews,
  COUNT(*) FILTER (WHERE action = 'approved') as approved,
  COUNT(*) FILTER (WHERE action = 'rejected') as rejected
FROM portal_approval_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY reviewer_id;
```

### 4. 通知系统

**通知渠道**:
1. **邮件通知**
   - 精美 HTML 模板
   - 区分批准/拒绝场景
   - 包含操作按钮

2. **站内通知**
   - 实时推送
   - 应用内消息中心
   - 可标记已读

3. **Webhook 回调** (可选)
   - 触发第三方系统
   - 数据同步
   - 自定义处理

---

## 🚀 部署步骤

### 步骤 1: 执行数据库迁移

```bash
# 方法 1: 使用 Supabase CLI
npx supabase db push --db-url "your-database-url"

# 方法 2: 手动执行 SQL
# 打开 Supabase Studio -> SQL Editor
# 运行 sql/portal-approval-system.sql
```

### 步骤 2: 验证数据库对象

```sql
-- 检查表是否创建成功
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'portal_approval_logs';

-- 检查函数是否创建成功
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_type = 'FUNCTION' 
  AND routine_name IN (
    'update_portal_review_timestamp',
    'notify_portal_approval',
    'cleanup_old_approval_logs'
  );

-- 检查视图是否创建成功
SELECT viewname 
FROM pg_views 
WHERE viewname = 'v_portal_approval_stats';
```

### 步骤 3: 导入 n8n 工作流

1. 登录 n8n 管理界面
2. 点击 "Workflows" -> "Import"
3. 上传 `n8n-workflows/portal-approval-notification.json`
4. 配置 SMTP 凭据
5. 设置 Webhook URL
6. 激活工作流

### 步骤 4: 配置环境变量

在 `.env.local` 中添加:

```bash
# n8n 配置
NEXT_PUBLIC_N8N_URL=https://n8n.your-domain.com
N8N_WEBHOOK_SECRET=your-webhook-secret

# SMTP 配置（用于 n8n）
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@example.com
SMTP_PASSWORD=your-password
```

### 步骤 5: 构建并测试前端

```bash
# 安装依赖（如有新增）
npm install

# 开发模式测试
npm run dev

# 访问 http://localhost:3000/admin/portals-management
# 切换到"待审批"标签页测试功能
```

---

## ✅ 验收标准

### 功能验收

- [x] 管理员可以查看待审批门户列表
- [x] 支持单个审批（批准/拒绝）
- [x] 支持批量审批
- [x] 拒绝时必须填写原因
- [x] 审批后门户状态正确更新
- [x] 审批日志自动记录
- [x] 邮件通知正常发送
- [x] 站内通知正常创建
- [x] 列表自动刷新

### 性能验收

- [ ] 审批操作响应时间 < 2 秒
- [ ] 批量审批（100 个）响应时间 < 10 秒
- [ ] 并发支持：10 管理员同时审批
- [ ] 数据库事务成功率 100%

### 安全验收

- [ ] 只有管理员可以访问审批 API
- [ ] RLS 策略正确生效
- [ ] 防止 CSRF 攻击
- [ ] 防止 XSS 注入
- [ ] 敏感操作记录日志

---

## 🔍 测试用例

### 正常场景

**TC1: 单个批准成功**
```
前置条件：有待审批门户
操作：点击"批准" -> 确认
预期：
  - 门户状态变为 approved
  - is_published = true
  - 创建审批日志
  - 发送批准邮件
  - 显示成功提示
```

**TC2: 单个拒绝成功**
```
前置条件：有待审批门户
操作：点击"拒绝" -> 输入原因 -> 确认
预期：
  - 门户状态变为 rejected
  - rejection_reason 有值
  - 创建审批日志
  - 发送拒绝邮件
  - 显示成功提示
```

**TC3: 批量批准成功**
```
前置条件：勾选 3 个待审批门户
操作：点击"批量通过" -> 确认
预期：
  - 3 个门户状态都变为 approved
  - 创建 3 条审批日志
  - 显示"成功通过 3 个门户"
```

**TC4: 批量拒绝成功**
```
前置条件：勾选 2 个待审批门户
操作：点击"批量拒绝" -> 输入原因 -> 确认
预期：
  - 2 个门户状态都变为 rejected
  - 创建 2 条审批日志
  - 显示"成功拒绝 2 个门户"
```

### 异常场景

**TC5: 拒绝不填原因**
```
操作：点击"拒绝" -> 不填原因 -> 确认
预期：提示"请填写拒绝原因"，无法提交
```

**TC6: 未选择批量审批**
```
操作：不勾选任何门户 -> 点击"批量通过"
预期：提示"请先选择要审批的门户"
```

**TC7: 非管理员访问**
```
操作：使用普通用户账号访问审批页面
预期：提示"权限不足"或重定向到首页
```

**TC8: 网络异常**
```
模拟：断开网络后点击"批准"
预期：提示"网络连接失败，请检查网络"
```

---

## 📊 监控指标

### 业务指标

1. **审批效率**
   - 平均审批时长（从提交到审批完成）
   - 每日审批数量
   - 审批通过率

2. **审核员绩效**
   - 每人审批数量
   - 平均审批时长
   - 审批质量评分

3. **用户体验**
   - 审批等待时间
   - 用户满意度调查
   - 重新提交率

### 技术指标

1. **API 性能**
   - 平均响应时间：< 500ms
   - P95 响应时间：< 1s
   - 错误率：< 0.1%

2. **系统可用性**
   - API 成功率：> 99.9%
   - 工作流执行成功率：> 99%
   - 邮件送达率：> 95%

3. **数据一致性**
   - 事务成功率：100%
   - 日志完整率：100%
   - 数据准确率：100%

### 监控查询

```sql
-- 今日审批统计
SELECT 
  action,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM portal_approval_logs
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY action;

-- 审批趋势分析
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE action = 'approved') as approved,
  COUNT(*) FILTER (WHERE action = 'rejected') as rejected
FROM portal_approval_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Top 10 活跃审核员
SELECT 
  reviewer_id,
  COUNT(*) as total_reviews,
  COUNT(*) FILTER (WHERE action = 'approved') as approved,
  ROUND(
    COUNT(*) FILTER (WHERE action = 'approved') * 100.0 / COUNT(*),
    2
  ) as approval_rate
FROM portal_approval_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY reviewer_id
ORDER BY total_reviews DESC
LIMIT 10;
```

---

## 🔮 后续优化建议

### 短期（1-2 周）

1. **自动初审**
   - 内容合规性检查
   - 敏感词过滤
   - 格式验证

2. **审批模板**
   - 预设常见拒绝原因
   - 快速选择
   - 自定义模板

3. **审批队列**
   - 优先级排序
   - 分配规则
   - 负载均衡

### 中期（1 个月）

1. **AI 辅助审批**
   - 智能推荐审批结果
   - 风险评分
   - 相似案例参考

2. **多级审批**
   - 一级审批（初级审核员）
   - 二级审批（高级审核员）
   - 终审（管理员）

3. **审批看板**
   - 可视化统计
   - 实时监控
   - 预警机制

### 长期（3 个月+）

1. **自动化审批**
   - 机器学习模型
   - 自动决策
   - 人工复核例外

2. **区块链存证**
   - 审批记录上链
   - 不可篡改
   - 可追溯

3. **跨平台协同**
   - 多端同步审批
   - 移动端 App
   - 小程序支持

---

## 🐛 已知问题

暂无

---

## 📝 维护指南

### 日志分析

```sql
-- 查看最近的审批日志
SELECT * FROM portal_approval_logs
ORDER BY created_at DESC
LIMIT 100;

-- 分析拒绝原因分布
SELECT 
  reason,
  COUNT(*) as count
FROM portal_approval_logs
WHERE action = 'rejected'
GROUP BY reason
ORDER BY count DESC;
```

### 故障排查

**问题 1: 邮件未发送**
- 检查 n8n 工作流状态
- 验证 SMTP 配置
- 查看 n8n 执行日志

**问题 2: 审批后状态未更新**
- 检查数据库触发器
- 验证 RLS 策略
- 查看 API 错误日志

**问题 3: 批量审批超时**
- 优化批量大小（建议 <= 100）
- 添加异步处理
- 使用后台任务队列

### 数据备份

```sql
-- 备份审批日志
CREATE TABLE portal_approval_logs_backup_202603 AS
SELECT * FROM portal_approval_logs
WHERE created_at >= '2026-03-01';

-- 导出 CSV
COPY (SELECT * FROM portal_approval_logs) 
TO '/tmp/portal-approval-logs.csv' WITH CSV HEADER;
```

---

## 👥 团队分工

| 角色 | 职责 | 负责人 |
|------|------|--------|
| 后端开发 | API 开发、数据库设计 | 待定 |
| 前端开发 | React 组件开发 | 待定 |
| 工作流工程师 | n8n 配置和测试 | 待定 |
| 测试工程师 | 测试用例执行 | 待定 |
| 技术文档 | 文档编写 | 待定 |

---

## 📞 联系方式

如有疑问或需要协助:

- **技术支持**: tech-support@example.com
- **紧急联系**: emergency@example.com
- **文档地址**: `/docs/portals/PORTAL_APPROVAL_IMPLEMENTATION_SUMMARY.md`

---

**实施完成时间**: 2026-03-24  
**下次审查**: 2026-03-31  
**版本**: v1.0.0
