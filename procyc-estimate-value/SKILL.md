---

name: procyc-estimate-value
description: 基于设备档案、成色状况和市场数据的 3C 设备智能估价技能
version: 1.0.0
input:
type: object
required: - deviceQrcodeId
properties:
deviceQrcodeId:
type: string
description: 设备二维码 ID（从 FixCycle 系统获取）
example: "qr_abc123xyz"
includeBreakdown:
type: boolean
description: 是否包含详细估值分解
default: true
useMarketData:
type: boolean
description: 是否使用市场价格数据（如果可用）
default: true
currency:
type: string
description: 货币单位
enum: [CNY, FCX, USD]
default: "CNY"
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
deviceInfo:
type: object
properties:
qrcodeId:
type: string
productModel:
type: string
brandName:
type: string
productCategory:
type: string
manufacturingDate:
type: string
description: 生产日期
purchasePrice:
type: number
description: 购买价格
valuation:
type: object
properties:
baseValue:
type: number
description: 基础价值（折旧后）
componentScore:
type: number
description: 部件评分 (0-1)
conditionMultiplier:
type: number
description: 成色乘数 (0-1)
finalValue:
type: number
description: 最终估值
currency:
type: string
breakdown:
type: object
properties:
originalPrice:
type: number
description: 原始价格
depreciation:
type: number
description: 折旧金额
componentAdjustment:
type: number
description: 部件调整系数
conditionAdjustment:
type: number
description: 成色调整系数
brandAdjustment:
type: number
description: 品牌调整系数
ageAdjustment:
type: number
description: 年龄调整系数
repairAdjustment:
type: number
description: 维修历史调整系数
marketComparison:
type: object
properties:
marketAveragePrice:
type: number
description: 市场平均价格
priceRange:
type: object
properties:
min:
type: number
max:
type: number
confidence:
type: number
description: 置信度 (0-1)
error:
type: object|null
properties:
code:
type: string
message:
type: string
metadata:
type: object
properties:
executionTimeMs:
type: number
timestamp:
type: string
version:
type: string
dataSource:
type: string
algorithmVersion:
type: string
pricing:
model: freemium
currency: FCX
amount: 0.5
freeQuota: 50
overage:
rate: 0.2
author:
name: ProCyc Core Team
email: core@procyc.com
organization: ProCyc
tags:

- ESTIMATION
- VALUATION
- AI-POWERED
- PRICING
- typescript
- tested
- documented
  env:
  variables:
  SUPABASE_URL:
  description: Supabase 项目 URL
  required: true
  SUPABASE_ANON_KEY:
  description: Supabase 匿名密钥
  required: true
  VALUATION_API_URL:
  description: 估值引擎 API URL（可选，用于高级功能）
  required: false
  API_TIMEOUT_MS:
  description: API 请求超时时间（毫秒）
  default: 5000
  dependencies:
  npm: - @supabase/supabase-js@latest
  examples:
- name: 基础设备估价
  input:
  deviceQrcodeId: "qr_iphone14pro_001"
  output:
  success: true
  data:
  deviceInfo:
  qrcodeId: "qr_iphone14pro_001"
  productModel: "iPhone 14 Pro"
  brandName: "Apple"
  productCategory: "手机"
  valuation:
  baseValue: 4500
  finalValue: 4200
  currency: "CNY"
- name: 包含详细分解的估价
  input:
  deviceQrcodeId: "qr_macbook_air_m2_001"
  includeBreakdown: true
  output:
  success: true
  data:
  valuation:
  finalValue: 8500
  breakdown:
  originalPrice: 9500
  depreciation: 1500
  conditionAdjustment: 0.95
  changelog:
- version: 1.0.0
  date: '2026-03-03'
  changes:
  - 初始版本发布
  - 集成 FixCycle 估值引擎
  - 支持多维度估值计算
  - 提供详细的估值分解报告
