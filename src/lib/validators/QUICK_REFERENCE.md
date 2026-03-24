# 验证器快速参考卡片

## 🚀 快速开始

### 1. 导入验证器

```typescript
// 导入所有验证器
import {
  validateCreateAgentRequest,
  validateAgentConfig,
} from '@/lib/validators';

// 或单独导入特定验证器
import { validateCreateOrderRequest } from '@/lib/validators/order.validator';
import { validateCreateExecutionRequest } from '@/lib/validators/execution.validator';
import { validateUserRegisterRequest } from '@/lib/validators/user.validator';
```

---

## 📋 常用验证场景

### 智能体创建

```typescript
const agentData = {
  name: '客服助手', // 2-50 字符，支持中文
  description: '智能客服', // ≤500 字符
  configuration: {
    // AI 模型配置
    model: 'gpt-4',
    temperature: 0.7,
    max_tokens: 2048,
  },
  category: 'customer_service', // 13 种类别之一
  tags: ['AI', '客服'], // ≤10 个标签
  pricing: {
    // 定价模式
    type: 'freemium',
    price: 99,
    currency: 'CNY',
    billing_cycle: 'monthly',
  },
};

const result = validateCreateAgentRequest(agentData);
if (result.success) {
  // 使用 result.data 创建智能体
} else {
  // 处理 result.errors
}
```

**常见错误**:

```
❌ name 字段：智能体名称至少需要 2 个字符
❌ name 字段：只能包含中文、英文、数字、下划线和连字符
❌ configuration 字段：缺少必填字段：model
❌ tags 字段：最多只能添加 10 个标签
```

---

### 订单创建

```typescript
const orderData = {
  agent_id: 'uuid-here', // 必须是 UUID 格式
  period: 'yearly', // monthly/yearly/lifetime
  payment_method: 'alipay', // stripe/alipay/wechat_pay 等
  amount: {
    subtotal: 999, // ≥0
    discount: 100, // ≥0
    tax: 0, // ≥0
    total: 899, // ≥0
    currency: 'CNY', // CNY/USD
  },
};

const result = validateCreateOrderRequest(orderData);
```

**常见错误**:

```
❌ agent_id 字段：必须是有效的 UUID 格式
❌ amount.subtotal 字段：不能为负数
❌ payment_method 字段：请选择支付方式
```

---

### 执行智能体

```typescript
const executionData = {
  agent_id: 'uuid-here', // 必须是 UUID
  input: {
    // 任意 JSON 对象
    message: '你好',
  },
  priority: 'normal', // low/normal/high
  timeout_seconds: 60, // 1-3600
};

const result = validateCreateExecutionRequest(executionData);
```

**常见错误**:

```
❌ agent_id 字段：必须是有效的 UUID 格式
❌ timeout_seconds 字段：超时时间不能超过 3600 秒
❌ priority 字段：请指定执行优先级
```

---

### 用户注册

```typescript
const registerData = {
  email: 'user@example.com', // 有效邮箱格式
  password: 'password123', // ≥8 位，含字母和数字
  confirmPassword: 'password123', // 必须与 password 一致
  username: '张三', // 3-30 字符，支持中文
  role: 'user', // user/admin/developer 等
};

const result = validateUserRegisterRequest(registerData);
```

**常见错误**:

```
❌ email 字段：请输入有效的邮箱地址
❌ password 字段：密码至少需要 8 个字符
❌ password 字段：密码必须包含字母和数字
❌ confirmPassword 字段：两次输入的密码不一致
❌ username 字段：用户名至少需要 3 个字符
```

---

## 🎯 验证函数通用接口

```typescript
function validateXXX(data: any): {
  success: boolean;
  data?: any; // ✅ 成功时返回验证后的数据
  errors?: Array<{
    // ❌ 失败时返回错误数组
    field: string; // 出错的字段
    message: string; // 友好的错误提示
    code: string; // Zod 错误代码
  }>;
};
```

---

## 🔧 API路由中的完整示例

```typescript
import { NextResponse } from 'next/server';
import {
  validateCreateAgentRequest,
  validateAgentConfig,
} from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const requestId = crypto.randomUUID();

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

    // 步骤 3: 使用验证通过的数据
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

## 📊 验证规则速查表

### 智能体相关

| 字段             | 类型   | 最小值 | 最大值   | 格式/枚举                               |
| ---------------- | ------ | ------ | -------- | --------------------------------------- |
| name             | string | 2 字符 | 50 字符  | 中文/英文/数字/\_/-                     |
| description      | string | -      | 500 字符 | -                                       |
| category         | enum   | -      | -        | general/productivity/education 等 13 种 |
| tags             | array  | -      | 10 个    | 每个标签≤20 字符                        |
| version          | string | -      | -        | 语义化版本 (x.y.z)                      |
| status           | enum   | -      | -        | draft/pending_review/approved 等 6 种   |
| pricing.type     | enum   | -      | -        | free/paid/freemium                      |
| pricing.price    | number | 0      | 999999   | -                                       |
| pricing.currency | enum   | -      | -        | CNY/USD                                 |

### 配置相关

| 字段              | 类型   | 最小值 | 最大值 | 默认值 |
| ----------------- | ------ | ------ | ------ | ------ |
| model             | string | 1 字符 | -      | -      |
| temperature       | number | 0      | 2      | 0.7    |
| max_tokens        | number | 1      | 128000 | -      |
| top_p             | number | 0      | 1      | -      |
| frequency_penalty | number | -2     | 2      | -      |

### 订单相关

| 字段            | 类型   | 最小值 | 最大值 | 格式/枚举                        |
| --------------- | ------ | ------ | ------ | -------------------------------- |
| agent_id        | string | -      | -      | UUID                             |
| period          | enum   | -      | -      | monthly/yearly/lifetime          |
| payment_method  | enum   | -      | -      | stripe/alipay/wechat_pay 等 5 种 |
| amount.subtotal | number | 0      | -      | -                                |
| amount.total    | number | 0      | -      | -                                |

### 执行相关

| 字段            | 类型   | 最小值 | 最大值 | 默认值 |
| --------------- | ------ | ------ | ------ | ------ |
| timeout_seconds | number | 1      | 3600   | 300    |
| priority        | enum   | -      | -      | normal |
| tokens_used     | number | 0      | -      | 0      |

### 用户相关

| 字段     | 类型   | 最小值 | 最大值   | 格式                     |
| -------- | ------ | ------ | -------- | ------------------------ |
| email    | string | -      | 255 字符 | 邮箱格式                 |
| password | string | 8 字符 | 128 字符 | 含字母和数字             |
| username | string | 3 字符 | 30 字符  | 中文/英文/数字/\_        |
| phone    | string | -      | -        | 中国手机号 (1[3-9]\d{9}) |
| bio      | string | -      | 500 字符 | -                        |

---

## ⚠️ 常见错误代码

| 错误代码         | 含义               | 示例                        |
| ---------------- | ------------------ | --------------------------- |
| `invalid_type`   | 类型错误           | 期望 string，收到 number    |
| `too_small`      | 小于最小值         | 名字少于 2 个字符           |
| `too_big`        | 大于最大值         | 价格超过 999999             |
| `invalid_string` | 字符串格式错误     | 邮箱格式不正确              |
| `not_in`         | 不在枚举范围内     | category 使用了无效值       |
| `invalid_union`  | 不符合任何联合类型 | discriminatedUnion 匹配失败 |

---

## 💡 实用技巧

### 1. 批量验证

```typescript
const agents = [agent1, agent2, agent3];
const results = agents.map(agent => validateCreateAgentRequest(agent));

const validAgents = results.filter(r => r.valid);
const invalidCount = results.filter(r => !r.valid).length;
```

### 2. 前端表单验证

```typescript
const handleSubmit = (formData: any) => {
  const result = validateCreateAgentRequest(formData);

  if (!result.success && result.errors) {
    result.errors.forEach(error => {
      // 在 UI 中显示错误
      setFieldError(error.field, error.message);
    });
    return;
  }

  // 提交数据
  submitForm(result.data);
};
```

### 3. 条件验证

```typescript
// 只验证特定字段
const partialData = { name: '新名字' };
const result = validateUpdateAgentRequest(partialData);
// ✅ 所有字段都是可选的
```

---

## 📚 更多资源

- 📖 [完整文档](./README.md)
- 💻 [示例代码](./README.example.ts)
- 🧪 [测试用例](./validator.test.ts)
- 📋 [实施报告](../../docs/project-planning/OPT-010-IMPLEMENTATION.md)

---

**最后更新**: 2026 年 3 月 24 日
