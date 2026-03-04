---
name: procyc-find-shop
description: 基于地理位置查询附近的 3C 维修店，支持距离排序、筛选和导航
version: 1.0.0
input:
  type: object
  required:
    - latitude
    - longitude
  properties:
    latitude:
      type: number
      description: 用户当前位置纬度
      min: -90
      max: 90
      example: 39.9042
    longitude:
      type: number
      description: 用户当前位置经度
      min: -180
      max: 180
      example: 116.4074
    radius:
      type: number
      description: 搜索半径 (公里)
      default: 5
      min: 1
      max: 50
    limit:
      type: number
      description: 返回结果数量限制
      default: 10
      min: 1
      max: 100
output:
  type: object
  properties:
    success:
      type: boolean
      description: 执行是否成功
    data:
      type: object|null
      description: 返回的店铺列表
      properties:
        shops:
          type: array
          items:
            type: object
            properties:
              id:
                type: string
              name:
                type: string
              address:
                type: string
              distance:
                type: number
                description: 距离 (公里)
              rating:
                type: number
              phone:
                type: string
    error:
      type: object|null
      properties:
        code: string
        message: string
    metadata:
      type: object
      properties:
        executionTimeMs: number
        timestamp: string (ISO 8601)
        version: string
pricing:
  model: free
  currency: FCX
  amount: 0
  freeQuota: 1000
author:
  name: ProCyc Core Team
  email: support@procyc.com
tags:
  - category:LOCA
  - subcategory:LOCA.SHOP
  - typescript
  - geo-location
  - tested
  - documented
env:
  variables: {}
dependencies:
  npm: []
  python: []
examples:
  - name: 基本示例
    input: {}
    output:
      success: true
      data: {}
changelog:
  - version: 1.0.0
    date: '2026-03-02'
    changes:
      - '初始版本'
      - '实现核心地理位置查询功能'
      - '完整的参数验证和错误处理'
---

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
