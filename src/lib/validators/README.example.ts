/**
 * 验证器使用示例
 * 展示如何在 API路由中使用各种验证器
 */

import {
  validateAgentConfig,
  validateCreateAgentRequest,
  validateUpdateAgentRequest,
} from '@/lib/validators';
import { validateCreateExecutionRequest } from '@/lib/validators/execution.validator';
import { validateCreateOrderRequest } from '@/lib/validators/order.validator';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 示例 1: 创建智能体API
 * POST /api/agents
 */
export async function createAgentExample(request: NextRequest) {
  try {
    const body = await request.json();

    // 步骤 1: 验证基础请求数据
    const validationResult = validateCreateAgentRequest(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '请求参数验证失败',
            details: validationResult.errors,
          },
        },
        { status: 400 }
      );
    }

    // 步骤 2: 验证配置数据（使用专门的配置验证器）
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

    // 步骤 3: 使用验证通过创建数据
    const validatedData = validationResult.data;

    // TODO: 执行数据库插入操作
    // const agent = await supabase.from('agents').insert({ ...validatedData });

    return NextResponse.json({
      success: true,
      data: {
        message: '智能体创建成功',
        // agent,
      },
    });
  } catch (error) {
    console.error('创建智能体失败:', error);
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

/**
 * 示例 2: 更新智能体API
 * PUT /api/agents/:id
 */
export async function updateAgentExample(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // 验证更新数据
    const validationResult = validateUpdateAgentRequest(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '请求参数验证失败',
            details: validationResult.errors,
          },
        },
        { status: 400 }
      );
    }

    // 如果包含配置更新，需要额外验证配置
    if (body.configuration) {
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
    }

    // TODO: 执行数据库更新操作
    // const agent = await supabase.from('agents').update(validatedData).eq('id', params.id);

    return NextResponse.json({
      success: true,
      data: {
        message: '智能体更新成功',
      },
    });
  } catch (error) {
    console.error('更新智能体失败:', error);
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

/**
 * 示例 3: 创建订单 API
 * POST /api/orders
 */
export async function createOrderExample(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证订单数据
    const validationResult = validateCreateOrderRequest(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '订单数据验证失败',
            details: validationResult.errors,
          },
        },
        { status: 400 }
      );
    }

    // TODO: 执行数据库插入操作
    // const order = await supabase.from('orders').insert(validationResult.data);

    return NextResponse.json({
      success: true,
      data: {
        message: '订单创建成功',
        orderId: validationResult.data?.agent_id,
      },
    });
  } catch (error) {
    console.error('创建订单失败:', error);
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

/**
 * 示例 4: 执行智能体API
 * POST /api/agents/:id/execute
 */
export async function executeAgentExample(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // 添加 agent_id 到请求体
    const executionData = {
      ...body,
      agent_id: params.id,
    };

    // 验证执行请求
    const validationResult = validateCreateExecutionRequest(executionData);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '执行请求验证失败',
            details: validationResult.errors,
          },
        },
        { status: 400 }
      );
    }

    // TODO: 执行智能体逻辑
    // const execution = await supabase.from('agent_executions').insert(validationResult.data);

    return NextResponse.json({
      success: true,
      data: {
        message: '智能体执行成功',
        executionId: validationResult.data?.agent_id,
      },
    });
  } catch (error) {
    console.error('执行智能体失败:', error);
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

/**
 * 示例 5: 前端表单验证（React 组件中使用）
 */
export function useFormValidationExample() {
  // 假设这是表单提交处理函数
  const handleSubmit = async (formData: any) => {
    // 验证智能体创建表单
    const result = validateCreateAgentRequest(formData);

    if (!result.success && result.errors) {
      // 显示验证错误
      result.errors.forEach(error => {
        console.error(`字段 ${error.field}: ${error.message}`);
        // 在 UI 中显示错误提示
        // showFieldError(error.field, error.message);
      });
      return;
    }

    // 验证通过，提交数据
    // await fetch('/api/agents', {
    //   method: 'POST',
    //   body: JSON.stringify(result.data),
    // });
  };

  return { handleSubmit };
}

/**
 * 示例 6: 批量验证（适用于批量操作）
 */
export async function batchValidateAgentsExample(
  agentsData: Array<{ name: string; configuration: any }>
) {
  const results = agentsData.map(agentData => {
    // 验证基础数据
    const baseValidation = validateCreateAgentRequest(agentData);

    if (!baseValidation.success) {
      return {
        valid: false,
        errors: baseValidation.errors,
      };
    }

    // 验证配置
    const configValidation = validateAgentConfig(agentData.configuration);

    if (!configValidation.success) {
      return {
        valid: false,
        errors: configValidation.errors,
      };
    }

    return {
      valid: true,
      data: baseValidation.data,
    };
  });

  const validAgents = results.filter(r => r.valid).map(r => r.data);
  const invalidAgents = results.filter(r => !r.valid);

  return {
    validCount: validAgents.length,
    invalidCount: invalidAgents.length,
    validAgents,
    invalidAgents,
  };
}
