# 数据验证器文档

## 📋 概述

本目录包含完整的数据验证 Schema，覆盖智能体、订单、执行、用户等核心业务场景。所有验证器使用 **Zod** 库进行类型安全的验证。

## 📦 验证器列表

### 1. 智能体配置验证器 (`agent-config.validator.ts`)

用于验证智能体的 AI 模型配置，支持多种类型的智能体:

- **基础配置**: `BaseAgentConfigSchema`
- **LLM 配置**: `LLMConfigSchema`
- **代码审查配置**: `CodeReviewConfigSchema`
- **文案创作配置**: `CopywritingConfigSchema`
- **数据分析配置**: `DataAnalysisConfigSchema`

**使用示例**:

```typescript
import { validateAgentConfig } from '@/lib/validators';

const config = {
  model: 'gpt-4',
  temperature: 0.7,
  max_tokens: 2048,
};

const result = validateAgentConfig(config);
if (result.success) {
  console.log('配置验证通过:', result.data);
} else {
  console.error('配置验证失败:', result.errors);
}
```

---

### 2. 智能体验证器 (`agent.validator.ts`)

用于验证智能体的基本信息、定价、标签等:

- **名称验证**: `AgentNameSchema` (2-50 字符，支持中文和英文)
- **描述验证**: `AgentDescriptionSchema` (最多 500 字符)
- **类别验证**: `AgentCategorySchema` (13 种预定义类别)
- **标签验证**: `AgentTagsSchema` (最多 10 个标签)
- **定价验证**: `PricingSchema` (支持免费/付费/免费增值模式)
- **状态验证**: `AgentStatusSchema` (6 种状态)
- **版本号验证**: `VersionSchema` (语义化版本格式)

**完整请求验证**:

```typescript
import { validateCreateAgentRequest } from '@/lib/validators';

const agentData = {
  name: '客服助手',
  description: '智能客服回答助手',
  configuration: {
    model: 'gpt-4',
    temperature: 0.7,
  },
  category: 'customer_service',
  tags: ['客服', 'AI', '自动化'],
  pricing: {
    type: 'freemium',
    price: 99,
    currency: 'CNY',
    billing_cycle: 'monthly',
  },
};

const result = validateCreateAgentRequest(agentData);
```

---

### 3. 订单验证器 (`order.validator.ts`)

用于验证订单创建、支付、退款等操作:

- **订单状态**: `OrderStatusSchema` (7 种状态)
- **支付方式**: `PaymentMethodSchema` (5 种支付方式)
- **订阅周期**: `SubscriptionPeriodSchema` (月付/年付/终身)
- **订单项**: `OrderItemSchema`
- **金额验证**: `OrderAmountSchema`
- **创建订单**: `CreateOrderRequestSchema`
- **支付请求**: `PaymentRequestSchema`
- **退款请求**: `RefundRequestSchema`

**使用示例**:

```typescript
import { validateCreateOrderRequest } from '@/lib/validators/order.validator';

const orderData = {
  agent_id: 'uuid-here',
  period: 'yearly',
  payment_method: 'alipay',
  amount: {
    subtotal: 999,
    discount: 100,
    tax: 0,
    total: 899,
    currency: 'CNY',
  },
};

const result = validateCreateOrderRequest(orderData);
```

---

### 4. 执行验证器 (`execution.validator.ts`)

用于验证智能体执行请求和状态更新:

- **执行状态**: `ExecutionStatusSchema` (6 种状态)
- **优先级**: `ExecutionPrioritySchema` (低/普通/高)
- **输入参数**: `InputParamsSchema` (任意 JSON 对象)
- **输出结果**: `OutputResultSchema`
- **错误信息**: `ExecutionErrorSchema`
- **使用统计**: `UsageStatsSchema`

**使用示例**:

```typescript
import { validateCreateExecutionRequest } from '@/lib/validators/execution.validator';

const executionData = {
  agent_id: 'uuid-here',
  input: {
    message: '你好，我想咨询产品价格',
  },
  priority: 'normal',
  timeout_seconds: 60,
};

const result = validateCreateExecutionRequest(executionData);
```

---

### 5. 用户验证器 (`user.validator.ts`)

用于验证用户注册、登录、资料更新等操作:

- **角色**: `UserRoleSchema` (6 种角色)
- **状态**: `UserStatusSchema` (4 种状态)
- **邮箱**: `EmailSchema`
- **密码**: `PasswordSchema` (至少 8 位，包含字母和数字)
- **用户名**: `UsernameSchema` (3-30 字符)
- **手机号**: `PhoneSchema` (中国手机号)
- **用户资料**: `UserProfileSchema`

**使用示例**:

```typescript
import { validateUserRegisterRequest } from '@/lib/validators/user.validator';

const registerData = {
  email: 'user@example.com',
  password: 'password123',
  confirmPassword: 'password123',
  username: '张三',
  role: 'user',
  profile: {
    bio: '这是一个测试用户',
    location: '北京',
  },
};

const result = validateUserRegisterRequest(registerData);
```

---

## 🔧 通用函数

所有验证器都提供以下三个标准函数:

### 1. `validateXXX(data: any)` - 验证函数

```typescript
function validateCreateAgentRequest(data: any): {
  success: boolean;
  data?: any; // 验证通过时返回
  errors?: Array<{
    // 验证失败时返回
    field: string;
    message: string;
    code: string;
  }>;
};
```

### 2. 返回值结构

**成功时**:

```json
{
  "success": true,
  "data": {
    /* 验证通过并转换后的数据 */
  }
}
```

**失败时**:

```json
{
  "success": false,
  "errors": [
    {
      "field": "name",
      "message": "智能体名称至少需要 2 个字符",
      "code": "too_small"
    }
  ]
}
```

---

## 📝 API路由中的使用示例

### POST /api/agents

```typescript
import { NextResponse } from 'next/server';
import {
  validateCreateAgentRequest,
  validateAgentConfig,
} from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 步骤 1: 验证基础数据
    const baseValidation = validateCreateAgentRequest(body);

    if (!baseValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '请求参数验证失败',
            details: baseValidation.errors,
          },
        },
        { status: 400 }
      );
    }

    // 步骤 2: 验证配置
    const configValidation = validateAgentConfig(body.configuration);

    if (!configValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CONFIG',
            message: '智能体配置验证失败',
            details: configValidation.errors,
          },
        },
        { status: 400 }
      );
    }

    // 步骤 3: 使用验证通过的数据创建智能体
    const validatedData = baseValidation.data;

    // TODO: 数据库操作
    // const agent = await supabase.from('agents').insert(validatedData);

    return NextResponse.json({
      success: true,
      data: validatedData,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误',
        },
      },
      { status: 500 }
    );
  }
}
```

---

## 🎯 验证规则详解

### 智能体名称验证

```typescript
AgentNameSchema = z
  .string()
  .min(2, '至少 2 个字符')
  .max(50, '最多 50 个字符')
  .regex(
    /^[\u4e00-\u9fa5 a-zA-Z0-9_-]+$/,
    '只能包含中文、英文、数字、下划线和连字符'
  );
```

**有效示例**:

- `客服助手`
- `AI Assistant`
- `Data_Analyzer-Pro`

**无效示例**:

- `A` (太短)
- `@特殊字符` (包含非法字符)

---

### 密码验证

```typescript
PasswordSchema = z
  .string()
  .min(8, '至少 8 位')
  .regex(/^(?=.*[A-Za-z])(?=.*\d)/, '必须包含字母和数字');
```

**有效示例**:

- `password123`
- `Admin2024`

**无效示例**:

- `12345678` (只有数字)
- `abcdefgh` (只有字母)

---

### 定价验证

```typescript
PricingSchema = z.object({
  type: z.enum(['free', 'paid', 'freemium']),
  price: z.number().nonnegative().max(999999),
  currency: z.enum(['CNY', 'USD']).default('CNY'),
  billing_cycle: z.enum(['onetime', 'monthly', 'yearly']).default('onetime'),
});
```

**有效示例**:

```json
{
  "type": "freemium",
  "price": 99,
  "currency": "CNY",
  "billing_cycle": "monthly"
}
```

---

## 🚨 错误处理

所有验证错误都遵循统一格式:

```typescript
{
  success: false,
  errors: [
    {
      field: '字段名',           // 出错的字段
      message: '错误提示',       // 友好的错误提示
      code: '错误代码',          // Zod 错误代码 (如 too_small, invalid_type)
    }
  ]
}
```

**常见错误代码**:

- `invalid_type`: 类型错误
- `too_small`: 小于最小值
- `too_big`: 大于最大值
- `invalid_string`: 字符串格式错误
- `not_in`: 不在枚举范围内

---

## 📊 验证覆盖率

| 验证器       | 覆盖场景       | Schema 数量 | 验证函数 |
| ------------ | -------------- | ----------- | -------- |
| agent-config | AI 模型配置    | 5           | 2        |
| agent        | 智能体基础信息 | 9           | 2        |
| order        | 订单管理       | 8           | 3        |
| execution    | 执行管理       | 8           | 3        |
| user         | 用户管理       | 9           | 4        |
| **总计**     | -              | **39**      | **14**   |

---

## 🔗 相关文档

- [Zod 官方文档](https://zod.dev/)
- [使用示例代码](./README.example.ts)

---

## 📝 更新日志

### v1.0 - 2026-03-24

- ✅ 实现智能体配置验证器 (OPT-005)
- ✅ 扩展智能体基础数据验证器 (OPT-010)
- ✅ 实现订单验证器 (OPT-010)
- ✅ 实现执行验证器 (OPT-010)
- ✅ 实现用户验证器 (OPT-010)
- ✅ 统一验证函数接口
- ✅ 完善错误处理机制
- ✅ 添加详细的使用文档

---

**最后更新**: 2026 年 3 月 24 日
