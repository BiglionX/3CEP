---

name: procyc-fault-diagnosis
description: 基于大模型的 3C 设备故障诊断技能，输入故障描述，输出建议配件和维修方案
version: 1.0.0
input:
type: object
required: - deviceType - brand - model - symptoms
properties:
deviceType:
type: string
description: 设备类型（mobile/tablet/laptop/desktop/other）
enum: [mobile, tablet, laptop, desktop, other]
brand:
type: string
description: 设备品牌
model:
type: string
description: 设备型号
symptoms:
type: array
description: 故障症状描述列表
items:
type: string
additionalInfo:
type: object
description: 可选附加信息
properties:
purchaseDate:
type: string
description: 购买日期
warrantyStatus:
type: string
enum: [in_warranty, out_of_warranty]
description: 保修状态
previousRepairs:
type: array
items:
type: string
description: 之前的维修记录
output:
type: object
properties:
success:
type: boolean
description: 执行是否成功
data:
type: object|null
description: 返回的数据结果
properties:
diagnosis:
type: object
properties:
likelyIssues:
type: array
items:
type: object
properties:
issue:
type: string
description: 问题描述
confidence:
type: number
description: 置信度 (0-1)
description:
type: string
description: 详细描述
suggestedParts:
type: array
items:
type: object
properties:
partName:
type: string
partCategory:
type: string
priority:
type: string
enum: [high, medium, low]
reason:
type: string
repairDifficulty:
type: string
enum: [easy, moderate, hard, expert]
estimatedTime:
type: string
description: 预估维修时间
error:
type: object|null
properties:
code: string
message: string
metadata:
type: object
properties:
executionTimeMs: number
timestamp: string
version: string
pricing:
model: freemium
currency: FCX
amount: 5
freeQuota: 100
author:
name: ProCyc Core Team
email: support@procyc.com
tags:

- category: DIAG
- subcategory: DIAG.HW
- typescript
- tested
- documented
- ai-powered
  env:
  variables:
  OPENAI_API_KEY:
  description: OpenAI API 密钥
  required: false
  DIFY_API_KEY:
  description: Dify AI 平台密钥
  required: false
  dependencies:
  npm: - openai: ^4.0.0 - node-fetch: ^2.6.0
  python: []
  examples:
- name: 手机屏幕故障诊断
  input:
  deviceType: mobile
  brand: Apple
  model: iPhone 13 Pro
  symptoms: - 屏幕出现绿色线条 - 触摸响应迟钝
  output:
  success: true
  data:
  diagnosis:
  likelyIssues: - issue: 屏幕排线损坏
  confidence: 0.85
  description: 屏幕排线可能因跌落或挤压导致接触不良或损坏
  suggestedParts: - partName: iPhone 13 Pro 屏幕总成
  partCategory: Display
  priority: high
  reason: 需要更换屏幕以解决显示和触摸问题
  repairDifficulty: moderate
  estimatedTime: 30-45 分钟
  changelog:
- version: 1.0.0
  date: "2026-03-03"
  changes:
  - "初始版本"
  - "实现基于大模型的故障诊断"
  - "支持常见 3C 设备故障分析"

# procyc-fault-diagnosis

## 功能说明

TODO: 详细描述技能的功能和使用场景

## 输入参数

TODO: 详细说明每个输入参数的含义和约束

## 输出结果

TODO: 详细说明输出结果的结构和含义

## 使用示例

```typescript
// TODO: 添加代码示例
```

## 错误处理

| 错误码    | 说明             |
| --------- | ---------------- |
| SKILL_001 | 输入参数验证失败 |
| SKILL_006 | 内部错误         |

## 性能指标

- P95 延迟：< 2 秒
- 并发支持：是
- 缓存优化：否

## 依赖服务

TODO: 列出依赖的第三方服务和 API

## 安全说明

TODO: 说明安全相关的注意事项

## 变更日志

### 1.0.0

- 初始版本
