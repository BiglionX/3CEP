# {{SKILL_NAME}} - API 文档

## 概述

本文档详细描述了 `{{SKILL_NAME}}` 技能的 API 接口和使用方法。

## 输入参数

### 参数列表

| 参数名 | 类型   | 必填 | 默认值 | 说明        |
| ------ | ------ | ---- | ------ | ----------- |
| param1 | string | 是   | -      | 参数 1 说明 |
| param2 | number | 否   | 0      | 参数 2 说明 |

### 参数验证规则

- **param1**:
  - 长度：1-100 字符
  - 格式：正则表达式模式

- **param2**:
  - 范围：0-100
  - 精度：整数

## 输出结果

### 成功响应

```typescript
{
  success: true,
  data: {
    // 返回的数据结构
  },
  error: null,
  metadata: {
    executionTimeMs: 123,
    timestamp: "2026-03-02T10:00:00.000Z",
    version: "1.0.0"
  }
}
```

### 错误响应

```typescript
{
  success: false,
  data: null,
  error: {
    code: "SKILL_001",
    message: "输入参数验证失败"
  },
  metadata: {
    executionTimeMs: 5,
    timestamp: "2026-03-02T10:00:00.000Z",
    version: "1.0.0"
  }
}
```

### 错误码说明

| 错误码    | 说明             |
| --------- | ---------------- |
| SKILL_001 | 输入参数验证失败 |
| SKILL_002 | 技能执行超时     |
| SKILL_003 | 依赖服务不可用   |
| SKILL_004 | 权限不足         |
| SKILL_005 | 配额耗尽         |
| SKILL_006 | 内部错误         |

## 使用示例

### 基本示例

```typescript
import skill from './src/index';

const result = await skill.execute({
  param1: 'value1',
  param2: 42,
});

if (result.success) {
  console.log('执行成功:', result.data);
} else {
  console.error('执行失败:', result.error);
}
```

### 错误处理示例

```typescript
try {
  const result = await skill.execute({
    param1: 'invalid',
  });

  if (!result.success) {
    throw new Error(result.error?.message);
  }
} catch (error) {
  console.error('捕获异常:', error);
}
```

## 性能指标

- **P50 延迟**: < 500ms
- **P95 延迟**: < 2s
- **P99 延迟**: < 5s
- **并发支持**: 支持
- **缓存优化**: 不支持

## 限制说明

- 单次调用最大超时时间：30 秒
- 免费用户每月调用次数：1000 次
- 并发请求数限制：10 个/秒

## 更新日志

### 1.0.0 (2026-03-02)

- 初始版本发布
- 实现核心功能
