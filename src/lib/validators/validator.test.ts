/**
 * 验证器单元测试
 * 测试所有验证器的功能和边界情况
 */

import {
  validateAgentConfig,
  validateCreateAgentRequest,
  validateUpdateAgentRequest,
} from '@/lib/validators';
import {
  validateCreateExecutionRequest,
  validateUpdateExecutionStatus,
} from '@/lib/validators/execution.validator';
import {
  validateCreateOrderRequest,
  validatePaymentRequest,
} from '@/lib/validators/order.validator';
import {
  validateUpdateUserProfileRequest,
  validateUserLoginRequest,
  validateUserRegisterRequest,
} from '@/lib/validators/user.validator';
import { describe, expect, it } from '@jest/globals';

describe('数据验证器测试', () => {
  // ==================== 智能体配置验证器测试 ====================
  describe('Agent Config Validator', () => {
    it('应该验证通过基础配置', () => {
      const config = {
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 2048,
      };

      const result = validateAgentConfig(config);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('应该拒绝空的 model 字段', () => {
      const config = {
        model: '',
        temperature: 0.7,
        max_tokens: 2048,
      };

      const result = validateAgentConfig(config);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.some(e => e.field === 'model')).toBe(true);
    });

    it('应该拒绝超出范围的 temperature 值', () => {
      const config = {
        model: 'gpt-4',
        temperature: 3, // 超过最大值 2
        max_tokens: 2048,
      };

      const result = validateAgentConfig(config);

      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.field === 'temperature')).toBe(true);
    });

    it('应该接受可选的 top_p 参数', () => {
      const config = {
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.9,
      };

      const result = validateAgentConfig(config);

      expect(result.success).toBe(true);
    });
  });

  // ==================== 智能体验证器测试 ====================
  describe('Agent Validator', () => {
    it('应该验证通过完整的创建请求', () => {
      const agentData = {
        name: '客服助手',
        description: '智能客服回答助手',
        configuration: {
          model: 'gpt-4',
          temperature: 0.7,
          max_tokens: 2048,
        },
        category: 'customer_service' as const,
        tags: ['客服', 'AI', '自动化'],
        pricing: {
          type: 'freemium' as const,
          price: 99,
          currency: 'CNY' as const,
          billing_cycle: 'monthly' as const,
        },
      };

      const result = validateCreateAgentRequest(agentData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('应该拒绝太短的名字', () => {
      const agentData = {
        name: 'A', // 少于 2 个字符
        configuration: {
          model: 'gpt-4',
          temperature: 0.7,
        },
      };

      const result = validateCreateAgentRequest(agentData);

      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.field === 'name')).toBe(true);
    });

    it('应该拒绝包含非法字符的名字', () => {
      const agentData = {
        name: '客服@助手', // 包含特殊字符
        configuration: {
          model: 'gpt-4',
          temperature: 0.7,
        },
      };

      const result = validateCreateAgentRequest(agentData);

      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.field === 'name')).toBe(true);
    });

    it('应该拒绝超过 10 个标签', () => {
      const agentData = {
        name: '测试智能体',
        configuration: {
          model: 'gpt-4',
          temperature: 0.7,
        },
        tags: Array(11).fill('tag'), // 11 个标签
      };

      const result = validateCreateAgentRequest(agentData);

      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.field === 'tags')).toBe(true);
    });

    it('应该接受更新请求的部分字段', () => {
      const updateData = {
        name: '新名字',
        description: '新的描述',
      };

      const result = validateUpdateAgentRequest(updateData);

      expect(result.success).toBe(true);
    });
  });

  // ==================== 订单验证器测试 ====================
  describe('Order Validator', () => {
    it('应该验证通过创建订单请求', () => {
      const orderData = {
        agent_id: '123e4567-e89b-12d3-a456-426614174000',
        period: 'yearly' as const,
        payment_method: 'alipay' as const,
        amount: {
          subtotal: 999,
          discount: 100,
          tax: 0,
          total: 899,
          currency: 'CNY' as const,
        },
      };

      const result = validateCreateOrderRequest(orderData);

      expect(result.success).toBe(true);
    });

    it('应该拒绝无效的 UUID', () => {
      const orderData = {
        agent_id: 'invalid-uuid',
        amount: {
          subtotal: 999,
          discount: 0,
          tax: 0,
          total: 999,
          currency: 'CNY',
        },
      };

      const result = validateCreateOrderRequest(orderData);

      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.field === 'agent_id')).toBe(true);
    });

    it('应该拒绝负数的金额', () => {
      const orderData = {
        agent_id: '123e4567-e89b-12d3-a456-426614174000',
        amount: {
          subtotal: -100, // 负数
          discount: 0,
          tax: 0,
          total: -100,
          currency: 'CNY',
        },
      };

      const result = validateCreateOrderRequest(orderData);

      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.field.includes('subtotal'))).toBe(true);
    });

    it('应该验证通过支付请求', () => {
      const paymentData = {
        order_id: '123e4567-e89b-12d3-a456-426614174000',
        payment_method: 'wechat_pay' as const,
        save_payment_method: true,
      };

      const result = validatePaymentRequest(paymentData);

      expect(result.success).toBe(true);
    });
  });

  // ==================== 执行验证器测试 ====================
  describe('Execution Validator', () => {
    it('应该验证通过执行请求', () => {
      const executionData = {
        agent_id: '123e4567-e89b-12d3-a456-426614174000',
        input: {
          message: '你好',
        },
        priority: 'normal' as const,
        timeout_seconds: 60,
      };

      const result = validateCreateExecutionRequest(executionData);

      expect(result.success).toBe(true);
    });

    it('应该拒绝超时的 timeout', () => {
      const executionData = {
        agent_id: '123e4567-e89b-12d3-a456-426614174000',
        input: {},
        timeout_seconds: 4000, // 超过 3600 秒
      };

      const result = validateCreateExecutionRequest(executionData);

      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.field === 'timeout_seconds')).toBe(
        true
      );
    });

    it('应该验证通过状态更新', () => {
      const updateData = {
        status: 'completed' as const,
        output: {
          result: '成功',
        },
        usage: {
          tokens_used: 100,
          execution_time_ms: 500,
          api_calls: 1,
        },
      };

      const result = validateUpdateExecutionStatus(updateData);

      expect(result.success).toBe(true);
    });
  });

  // ==================== 用户验证器测试 ====================
  describe('User Validator', () => {
    it('应该验证通过用户注册请求', () => {
      const registerData = {
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        username: '张三',
        role: 'user' as const,
      };

      const result = validateUserRegisterRequest(registerData);

      expect(result.success).toBe(true);
    });

    it('应该拒绝密码不匹配', () => {
      const registerData = {
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'password456', // 不一致
      };

      const result = validateUserRegisterRequest(registerData);

      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.field === 'confirmPassword')).toBe(
        true
      );
    });

    it('应该拒绝弱密码', () => {
      const registerData = {
        email: 'user@example.com',
        password: '12345678', // 只有数字
        confirmPassword: '12345678',
      };

      const result = validateUserRegisterRequest(registerData);

      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.field === 'password')).toBe(true);
    });

    it('应该验证通过登录请求', () => {
      const loginData = {
        email: 'user@example.com',
        password: 'password123',
        remember_me: true,
      };

      const result = validateUserLoginRequest(loginData);

      expect(result.success).toBe(true);
    });

    it('应该拒绝无效的邮箱格式', () => {
      const loginData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = validateUserLoginRequest(loginData);

      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.field === 'email')).toBe(true);
    });

    it('应该验证通过更新用户资料', () => {
      const profileData = {
        username: '新用户名',
        bio: '这是个人简介',
        location: '北京',
      };

      const result = validateUpdateUserProfileRequest(profileData);

      expect(result.success).toBe(true);
    });

    it('应该拒绝过长的 bio', () => {
      const profileData = {
        bio: 'a'.repeat(501), // 超过 500 字符
      };

      const result = validateUpdateUserProfileRequest(profileData);

      expect(result.success).toBe(false);
      expect(result.errors?.some(e => e.field === 'bio')).toBe(true);
    });
  });

  // ==================== 边界情况测试 ====================
  describe('Boundary Cases', () => {
    it('应该处理空对象输入', () => {
      const result = validateCreateAgentRequest({});
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('应该处理 undefined 输入', () => {
      const result = validateAgentConfig(undefined as any);
      expect(result.success).toBe(false);
    });

    it('应该处理 null 输入', () => {
      const result = validateUserRegisterRequest(null as any);
      expect(result.success).toBe(false);
    });

    it('应该处理非 JSON 对象', () => {
      const result = validateCreateAgentRequest('string' as any);
      expect(result.success).toBe(false);
    });
  });

  // ==================== 中文支持测试 ====================
  describe('Chinese Character Support', () => {
    it('应该支持中文智能体名称', () => {
      const agentData = {
        name: '智能客服助手',
        configuration: {
          model: 'gpt-4',
          temperature: 0.7,
        },
      };

      const result = validateCreateAgentRequest(agentData);

      expect(result.success).toBe(true);
    });

    it('应该支持中文用户名', () => {
      const registerData = {
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        username: '张三丰',
      };

      const result = validateUserRegisterRequest(registerData);

      expect(result.success).toBe(true);
    });

    it('应该支持中文标签', () => {
      const agentData = {
        name: '测试智能体',
        configuration: {
          model: 'gpt-4',
          temperature: 0.7,
        },
        tags: ['人工智能', '自然语言处理', '机器学习'],
      };

      const result = validateCreateAgentRequest(agentData);

      expect(result.success).toBe(true);
    });
  });
});
