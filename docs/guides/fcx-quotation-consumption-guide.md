# FCX询价消耗功能使用指南

## 概述

为了防止垃圾询价，系统引入了FCX代币消耗机制。每次发起询价都需要消耗一定数量的FCX代币，这样可以有效控制询价频率，提高询价质量和效率。

## 功能特性

### 1. 智能消耗计算

- **基础费用**: 每次询价收取10 FCX基础费用
- **供应商费用**: 超过3个供应商后，每个额外供应商收取2 FCX
- **商品项费用**: 超过5个商品项后，每个额外商品项收取1 FCX
- **加急费用**: 加急询价额外收取20 FCX
- **批量折扣**: 批量询价享受20%折扣

### 2. 每日限额控制

- **询价次数**: 每日最多50次询价
- **FCX消耗**: 每日FCX消耗上限500 FCX

### 3. 实时余额检查

- 询价前自动检查用户FCX余额
- 提供详细的费用明细和预估
- 余额不足时给出明确提示

## 使用流程

### 1. 创建智能询价计划

```javascript
// API调用示例
const response = await fetch('/api/b2b-procurement/smart-agent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'create_smart_quotation',
    orderId: '历史订单ID',
    userId: '当前用户ID',
    useHistoricalSuppliersOnly: true, // 仅使用历史供应商
    modifications: [
      // 订单修改（可选）
      {
        type: 'add', // add/remove/modify
        productName: '新产品',
        quantity: 100,
        unit: '件',
      },
    ],
  }),
});
```

### 2. 查看FCX消耗预估

系统会返回详细的FCX消耗预估：

```json
{
  "success": true,
  "fcxEstimate": {
    "totalCost": 25,
    "currentBalance": 1000,
    "canAfford": true,
    "breakdown": [
      {
        "item": "基础询价费用",
        "cost": 10,
        "description": "发起询价的基础费用"
      },
      {
        "item": "额外供应商费用 (2个)",
        "cost": 4,
        "description": "超出免费额度的2个供应商"
      }
    ]
  }
}
```

### 3. 执行询价

```javascript
const response = await fetch('/api/b2b-procurement/smart-agent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    action: 'execute_quotation',
    quotationPlan: quotationPlanObject,
    userId: '当前用户ID',
  }),
});
```

执行成功后返回：

```json
{
  "success": true,
  "executedRequests": [
    {
      "requestId": "req-xxx",
      "supplierId": "sup-xxx",
      "status": "sent"
    }
  ],
  "totalFcxConsumed": 25
}
```

## 消耗规则详解

### 基础规则

| 项目       | 规则                         | 费用     |
| ---------- | ---------------------------- | -------- |
| 基础询价   | 每次必收                     | 10 FCX   |
| 供应商数量 | 前3个免费，超出部分每个2 FCX | 2 FCX/个 |
| 商品项数量 | 前5项免费，超出部分每个1 FCX | 1 FCX/项 |

### 特殊功能费用

| 功能       | 费用   | 说明               |
| ---------- | ------ | ------------------ |
| 加急询价   | 20 FCX | 优先处理           |
| 自定义模板 | 15 FCX | 使用自定义询价模板 |
| 自动跟进   | 5 FCX  | 自动发送跟进邮件   |

### 批量优惠

- **条件**: 同时向5个以上供应商询价
- **优惠**: 总费用享受20%折扣
- **示例**: 原价100 FCX → 折后80 FCX

## 前端组件使用

### 1. 引入组件

```tsx
import { SmartProcurementAgent } from '@/components/b2b-procurement/SmartProcurementAgent';
```

### 2. 基本用法

```tsx
export default function ProcurementPage() {
  return (
    <div className="container mx-auto py-8">
      <SmartProcurementAgent />
    </div>
  );
}
```

### 3. 组件功能

- 历史订单选择
- 智能询价计划生成
- FCX消耗实时预估
- 订单修改功能
- 询价执行跟踪

## API接口说明

### 智能采购代理API

**Endpoint**: `/api/b2b-procurement/smart-agent`

#### 支持的操作

1. **创建智能询价计划**
   - Action: `create_smart_quotation`
   - 必需参数: `orderId`, `userId`
   - 可选参数: `useHistoricalSuppliersOnly`, `modifications`

2. **执行询价**
   - Action: `execute_quotation`
   - 必需参数: `quotationPlan`, `userId`

3. **自动完成询价**
   - Action: `auto_complete`
   - 必需参数: `quotationRequestId`, `userId`

4. **修改并重发订单**
   - Action: `modify_and_resend`
   - 必需参数: `orderId`, `modifications`, `userId`

## 最佳实践

### 1. 合理规划询价

- 优先使用历史供应商，降低供应商费用
- 合理分组商品项，避免超量收费
- 批量询价时充分利用折扣优惠

### 2. 控制询价频率

- 避免频繁的小额询价
- 合理安排询价时间，充分利用每日限额
- 重要询价考虑使用加急功能

### 3. 监控消耗情况

- 定期检查FCX余额
- 关注每日消耗统计
- 根据业务需求调整询价策略

## 故障排除

### 常见问题

1. **FCX余额不足**
   - 解决方案: 购买更多FCX或等待余额恢复

2. **超过每日限额**
   - 解决方案: 等待次日或申请提高限额

3. **询价计划生成失败**
   - 检查订单ID是否正确
   - 确认有足够的历史数据
   - 验证修改参数格式

### 联系支持

如有其他问题，请联系技术支持团队。

---

_本文档最后更新: 2024年2月_
