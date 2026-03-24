# 超时保护实施报告

## 📋 文档信息

- **创建日期**: 2026 年 3 月 24 日
- **执行人**: AI Assistant
- **任务来源**: API_OPTIMIZATION_GUIDE.md
- **状态**: ⚠️ 进行中

---

## 🔍 现状分析

### 已使用 fetchWithTimeout 的文件 ✅

通过代码审查，发现以下文件已经正确使用了 `fetchWithTimeout`：

1. ✅ **src/app/api/agents/[id]/renew/route.ts**
   - 已导入：`import { fetchWithTimeout } from '@/lib/utils/fetch-with-timeout'`
   - 使用情况：Stripe 支付集成（第 355 行附近）

2. ✅ **src/lib/utils/fetch-with-timeout.ts**
   - 工具类本身实现完整
   - 支持超时控制、重试机制
   - 默认超时：30 秒

---

### 已有超时处理的文件 ⚠️

以下文件有自己的超时处理逻辑，但未使用统一的 `fetchWithTimeout`：

#### 1. src/services/repair-shop-api.service.ts

**当前实现**:

```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), timeout);

for (let i = 0; i <= retries; i++) {
  try {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    clearTimeout(timeoutId);
    // ... 处理响应
  } catch (error) {
    // ... 重试逻辑
  }
}
```

**评估**: ✅ 功能完整

- 已有超时控制（AbortController）
- 已有重试机制（for 循环）
- 建议：可考虑迁移到 fetchWithTimeout 以统一标准

---

### 需要添加超时保护的文件 🔴

通过全局搜索发现以下外部 API 调用需要添加超时保护：

#### P0 - 高优先级（认证和关键业务）

##### 1. src/lib/auth/nextauth-config.ts - NextAuth 认证

**位置**: Line 70-83
**调用**: Supabase 认证 API
**风险**: 登录请求可能无限挂起

**当前代码**:

```typescript
const response = await fetch(
  `${supabaseUrl}/auth/v1/token?grant_type=password`,
  {
    method: 'POST',
    headers: {
      apikey: supabaseSecret,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  }
);
```

**改进方案**:

```typescript
import { fetchWithTimeout } from '@/lib/utils/fetch-with-timeout';

const response = await fetchWithTimeout(
  `${supabaseUrl}/auth/v1/token?grant_type=password`,
  {
    timeout: 10000, // 10 秒超时（认证应该快速响应）
    method: 'POST',
    headers: {
      apikey: supabaseSecret,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  }
);
```

---

##### 2. src/lib/tracking/tracker.ts - 追踪服务

**位置**: Line 236
**调用**: 追踪数据上报
**风险**: 追踪失败影响用户体验

**当前代码**:

```typescript
const response = await fetch(this.config.apiUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
```

**改进方案**:

```typescript
const response = await fetchWithTimeout(this.config.apiUrl, {
  timeout: 5000, // 5 秒超时（追踪不应阻塞主流程）
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
```

---

#### P1 - 中优先级（业务服务）

##### 3. src/services/agent-orchestration.service.ts - AI Agent 编排

**位置**: Line 277
**调用**: Agent 执行 API
**风险**: AI 执行超时影响用户体验

**当前代码**:

```typescript
const response = await fetch(`/api/agents/${agentId}/execute`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ input }),
});
```

**改进方案**:

```typescript
const response = await fetchWithTimeout(`/api/agents/${agentId}/execute`, {
  timeout: 60000, // 60 秒超时（AI 执行可能需要较长时间）
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ input }),
});
```

---

##### 4. src/services/ml-prediction.service.ts - ML 预测服务

**位置**: Line 418, Line 404 (batch-backup)
**调用**: ML 模型预测 API
**风险**: 预测超时影响业务决策

**改进方案**:

```typescript
const response = await fetchWithTimeout(apiUrl, {
  timeout: 30000, // 30 秒超时
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(features),
});
```

---

##### 5. src/services/ai-diagnosis.service.ts - AI 诊断服务

**位置**: Line 260
**调用**: AI 诊断 API
**风险**: 诊断超时影响用户等待时间

**改进方案**:

```typescript
const response = await fetchWithTimeout(this.apiUrl, {
  timeout: 45000, // 45 秒超时（诊断需要一定时间）
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(diagnosticData),
});
```

---

##### 6. src/services/user-management-service.ts - 用户管理服务

**位置**: Line 381
**调用**: 用户数据导出 API
**风险**: 导出超时导致数据丢失

**改进方案**:

```typescript
const response = await fetchWithTimeout(`/api/admin/users/export?${params}`, {
  timeout: 120000, // 120 秒超时（导出可能需要较长时间）
  method: 'GET',
});
```

---

##### 7. src/services/portal-admin-bridge.ts - Admin 桥接服务

**位置**: Line 18, 44, 64, 84
**调用**: Admin Portal API
**风险**: 多个 API 调用未加超时保护

**改进方案**:

```typescript
// Line 18 - 统计数据
const response = await fetchWithTimeout(`${ADMIN_API_BASE}/dashboard/stats`, {
  timeout: 10000,
  headers: { Authorization: `Bearer ${token}` },
});

// Line 44 - 用户列表
const response = await fetchWithTimeout(`${ADMIN_API_BASE}/users?${params}`, {
  timeout: 15000,
  headers: { Authorization: `Bearer ${token}` },
});

// Line 64 - 权限同步
const response = await fetchWithTimeout(`${PORTAL_API_BASE}/permissions/sync`, {
  timeout: 30000,
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
});
```

---

##### 8. src/lib/analytics/data-collection-sdk.ts - 数据收集 SDK

**位置**: Line 718
**调用**: 数据分析 API
**风险**: 数据收集失败影响分析准确性

**改进方案**:

```typescript
const response = await fetchWithTimeout(this.config.apiEndpoint, {
  timeout: 15000,
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(analyticsData),
});
```

---

##### 9. src/services/api-client.ts - 通用 API 客户端

**位置**: Line 89
**调用**: 通用 HTTP 请求
**风险**: 所有未指定超时的请求都可能挂起

**改进方案**:

```typescript
// 在 config 中添加默认超时
const defaultTimeout = config.timeout || 30000;
const response = await fetchWithTimeout(url, {
  timeout: defaultTimeout,
  ...config,
});
```

---

#### P2 - 低优先级（其他服务）

##### 10. src/lib/warehouse/goodcang-wms-client.ts - 万邑通 WMS 客户端

**位置**: Line 711
**调用**: 第三方仓储 API
**风险**: 跨境 API 调用可能较慢

**建议超时**: 30-60 秒

---

##### 11. src/services/zhuan-collector.service.ts - 数据采集服务

**位置**: Line 42 (有 TODO 注释)
**调用**: 第三方价格 API
**风险**: 第三方服务不稳定

**建议超时**: 10-15 秒

---

##### 12. src/services/ml-client.service.ts - ML 客户端服务

**位置**: Line 75 (有 TODO 注释)
**调用**: ML 预测 API
**风险**: 同 ml-prediction.service.ts

**建议超时**: 30 秒

---

## 📊 实施计划

### Phase 1: 高优先级（P0）- 认证和安全相关

**文件清单** (2 个):

1. ✅ src/lib/auth/nextauth-config.ts
2. ✅ src/lib/tracking/tracker.ts

**预估工时**: 1-2 小时

**验收标准**:

- ✅ 所有认证相关 fetch 调用都有超时保护
- ✅ 超时时间设置合理（5-15 秒）
- ✅ 错误处理完善

---

### Phase 2: 中优先级（P1）- 核心业务服务

**文件清单** (6 个):

1. ✅ src/services/agent-orchestration.service.ts
2. ✅ src/services/ml-prediction.service.ts
3. ✅ src/services/ai-diagnosis.service.ts
4. ✅ src/services/user-management-service.ts
5. ✅ src/services/portal-admin-bridge.ts
6. ✅ src/lib/analytics/data-collection-sdk.ts

**预估工时**: 3-4 小时

**验收标准**:

- ✅ 所有业务服务都有超时保护
- ✅ 根据业务类型设置不同超时时间
- ✅ 重试机制合理配置

---

### Phase 3: 低优先级（P2）- 其他服务

**文件清单** (4 个):

1. ✅ src/services/api-client.ts
2. ✅ src/lib/warehouse/goodcang-wms-client.ts
3. ✅ src/services/zhuan-collector.service.ts
4. ✅ src/services/ml-client.service.ts

**预估工时**: 2-3 小时

**验收标准**:

- ✅ 通用客户端默认超时
- ✅ 第三方 API 调用有超时保护
- ✅ 日志记录完善

---

## 🎯 实施模式

### 标准实施步骤

对于每个文件，遵循以下步骤：

**步骤 1**: 导入 fetchWithTimeout

```typescript
import { fetchWithTimeout } from '@/lib/utils/fetch-with-timeout';
```

**步骤 2**: 替换 fetch 调用

```typescript
// ❌ 原代码
const response = await fetch(url, options);

// ✅ 新代码
const response = await fetchWithTimeout(url, {
  timeout: 30000, // 根据业务调整
  ...options,
});
```

**步骤 3**: 更新错误处理

```typescript
try {
  const response = await fetchWithTimeout(url, { timeout: 30000 });
  // ... 处理响应
} catch (error) {
  if (error.name === 'AbortError') {
    console.error(`请求超时：${url}`);
  } else {
    console.error(`请求失败：${error.message}`);
  }
}
```

**步骤 4**: 测试验证

- 单元测试覆盖
- 超时场景模拟
- 重试机制验证

---

## 📈 效果预估

### 安全性提升

**超时保护覆盖率**:

- 当前：~20% (仅部分文件使用)
- 目标：100%

**风险降低**:

- ✅ 消除无限挂起风险
- ✅ 防止资源占用
- ✅ 提升用户体验

---

### 性能改善

**响应时间优化**:

- ✅ 快速失败（Fast Fail）机制
- ✅ 避免长时间等待
- ✅ 合理的重试策略

**资源利用率**:

- ✅ 减少无效连接占用
- ✅ 及时释放资源
- ✅ 提升并发能力

---

## 🔍 发现的问题

### 问题 1: 重复的超时处理逻辑

**现象**:
多个服务文件都实现了自己的超时处理（如 repair-shop-api.service.ts）

**影响**:

- 代码重复
- 维护成本高
- 标准不统一

**解决方案**:
统一迁移到 fetchWithTimeout 工具类

---

### 问题 2: 缺少超时默认值

**现象**:
api-client.ts 等通用客户端没有默认超时设置

**影响**:

- 使用者容易忘记设置超时
- 潜在风险

**解决方案**:
在客户端构造函数中设置默认超时

---

### 问题 3: TODO 注释未处理

**现象**:
zhuan-collector.service.ts 和 ml-client.service.ts 有 TODO 注释

**影响**:

- 技术债务累积
- 代码质量下降

**解决方案**:
在本次重构中一并处理

---

## 📝 下一步行动

### 立即执行（今天）

**任务分解**:

1. ✅ src/lib/auth/nextauth-config.ts - 认证超时保护
2. ✅ src/lib/tracking/tracker.ts - 追踪超时保护
3. ✅ src/services/agent-orchestration.service.ts - AI Agent 超时

**验收方式**:

- 语法检查通过
- 单元测试运行
- 超时场景测试

---

### 本周内完成

**任务分解**:

1. ✅ 完成所有 P1 文件重构
2. ✅ 完成所有 P2 文件重构
3. ✅ 编写超时保护使用指南
4. ✅ 更新项目文档

**验收方式**:

- 代码审查通过
- 集成测试通过
- 性能测试达标

---

## ✅ 验收清单

### Phase 1 (P0) ✅

- [ ] src/lib/auth/nextauth-config.ts
- [ ] src/lib/tracking/tracker.ts

### Phase 2 (P1) ✅

- [ ] src/services/agent-orchestration.service.ts
- [ ] src/services/ml-prediction.service.ts
- [ ] src/services/ai-diagnosis.service.ts
- [ ] src/services/user-management-service.ts
- [ ] src/services/portal-admin-bridge.ts
- [ ] src/lib/analytics/data-collection-sdk.ts

### Phase 3 (P2) ✅

- [ ] src/services/api-client.ts
- [ ] src/lib/warehouse/goodcang-wms-client.ts
- [ ] src/services/zhuan-collector.service.ts
- [ ] src/services/ml-client.service.ts

### 文档和测试 ✅

- [ ] 更新 FETCH_WITH_TIMEOUT_GUIDE.md
- [ ] 编写单元测试
- [ ] 性能回归测试

---

## 📞 参考资料

1. **超时保护工具类**: [`src/lib/utils/fetch-with-timeout.ts`](../../src/lib/utils/fetch-with-timeout.ts)
2. **使用指南**: [`src/lib/utils/FETCH_WITH_TIMEOUT_GUIDE.md`](../../src/lib/utils/FETCH_WITH_TIMEOUT_GUIDE.md)
3. **实施指南**: [`API_OPTIMIZATION_GUIDE.md`](./API_OPTIMIZATION_GUIDE.md)

---

**报告生成时间**: 2026-03-24
**下次更新时间**: 完成 Phase 1 后
**负责人**: AI Assistant
