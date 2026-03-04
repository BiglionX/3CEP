---

name: procyc-part-lookup
description: 根据设备型号查询兼容配件，支持配件筛选、价格比较和库存检查
version: 1.0.0
input:
type: object
required: - deviceModel
properties:
deviceModel:
type: string
description: 设备型号（如 iPhone 14 Pro, MacBook Air M2）
example: "iPhone 14 Pro"
deviceBrand:
type: string
description: 设备品牌
example: "Apple"
deviceCategory:
type: string
description: 设备类别
enum: [mobile, tablet, laptop, desktop, smartwatch, other]
partCategory:
type: string
description: 配件分类（可选筛选）
example: "屏幕"
priceRange:
type: object
description: 价格范围（可选）
properties:
min:
type: number
description: 最低价格
max:
type: number
description: 最高价格
includeOutOfStock:
type: boolean
description: 是否包含缺货配件
default: false
sortBy:
type: string
description: 排序方式
enum: [price_asc, price_desc, stock_desc, relevance]
default: "relevance"
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
queryInfo:
type: object
properties:
deviceModel:
type: string
matchedDevices:
type: array
items:
type: object
properties:
id:
type: string
brand:
type: string
model:
type: string
totalPartsFound:
type: number
compatibleParts:
type: array
items:
type: object
properties:
id:
type: string
description: 配件 ID
name:
type: string
description: 配件名称
category:
type: string
description: 配件分类
partNumber:
type: string
description: 配件编号
brand:
type: string
description: 配件品牌
price:
type: number
description: 价格 (FCX)
stockQuantity:
type: number
description: 库存数量
compatibilityNotes:
type: string
description: 兼容性说明
imageUrl:
type: string
description: 图片 URL
matchScore:
type: number
description: 匹配度得分 (0-1)
statistics:
type: object
properties:
totalCompatibleParts:
type: number
avgPrice:
type: number
inStockCount:
type: number
outOfStockCount:
type: number
categoriesBreakdown:
type: array
items:
type: object
properties:
category:
type: string
count:
type: number
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
pricing:
model: freemium
currency: FCX
amount: 0
freeQuota: 100
overage:
rate: 0.1
author:
name: ProCyc Core Team
email: core@procyc.com
organization: ProCyc
tags:

- PARTS
- COMPATIBILITY
- LOOKUP
- DATABASE
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
  API_TIMEOUT_MS:
  description: API 请求超时时间（毫秒）
  default: 5000
  dependencies:
  npm: - @supabase/supabase-js@latest
  examples:
- name: 查询 iPhone 14 Pro 的所有兼容配件
  input:
  deviceModel: "iPhone 14 Pro"
  deviceBrand: "Apple"
  deviceCategory: "mobile"
  output:
  success: true
  data:
  queryInfo:
  deviceModel: "iPhone 14 Pro"
  matchedDevices: - id: "dev_001"
  brand: "Apple"
  model: "iPhone 14 Pro"
  totalPartsFound: 15
  compatibleParts: - id: "part_001"
  name: "iPhone 14 Pro 原装屏幕总成"
  category: "屏幕"
  price: 2500
  stockQuantity: 50
  matchScore: 1.0
- name: 查询 MacBook Air M2 的屏幕配件并按价格排序
  input:
  deviceModel: "MacBook Air M2"
  deviceBrand: "Apple"
  deviceCategory: "laptop"
  partCategory: "屏幕"
  sortBy: "price_asc"
  changelog:
- version: 1.0.0
  date: '2026-03-03'
  changes:
  - 初始版本发布
  - 支持配件兼容性查询
  - 集成 Supabase 数据库
  - 支持多种筛选和排序选项
