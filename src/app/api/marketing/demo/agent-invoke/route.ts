import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 演示代理白名单
const DEMO_AGENTS = ['demo-agent-1', 'demo-agent-2', 'demo-workflow-1'];
const RATE_LIMIT_PER_HOUR = 5;

// 简单的内存级速率限制（生产环境建议使用Redis）
const rateLimitStore: Record<string, { count: number; resetTime: number }> = {};

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const key = `demo_${ip}`;
  
  if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
    rateLimitStore[key] = {
      count: 0,
      resetTime: now + 3600000 // 1小时后重置
    };
  }
  
  if (rateLimitStore[key].count >= RATE_LIMIT_PER_HOUR) {
    return { allowed: false, remaining: 0 };
  }
  
  rateLimitStore[key].count++;
  return { 
    allowed: true, 
    remaining: RATE_LIMIT_PER_HOUR - rateLimitStore[key].count 
  };
}

export async function POST(request: Request) {
  try {
    // 获取客户端IP
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';
    
    // 速率限制检查
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: '请求过于频繁，请稍后再试',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { agentId, input, workflowId } = body;

    // 参数验证
    if ((!agentId && !workflowId) || !input) {
      return NextResponse.json(
        { error: '缺少必要参数: agentId/workflowId 和 input' },
        { status: 400 }
      );
    }

    // 白名单检查
    const targetId = agentId || workflowId;
    if (!DEMO_AGENTS.includes(targetId)) {
      return NextResponse.json(
        { 
          error: '演示代理不存在',
          code: 'DEMO_AGENT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // 执行脱敏的演示逻辑
    const result = await executeDemo(targetId, input, !!workflowId);

    // 记录演示使用事件
    await trackDemoEvent(targetId, !!workflowId, clientIp);

    return NextResponse.json({
      success: true,
      result: result.sanitizedOutput,
      executionTime: result.executionTime,
      rateLimit: {
        remaining: rateLimit.remaining,
        resetIn: Math.ceil((rateLimitStore[`demo_${clientIp}`].resetTime - Date.now()) / 1000)
      }
    });

  } catch (error) {
    console.error('演示执行错误:', error);
    return NextResponse.json(
      { 
        error: '演示执行失败',
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}

async function executeDemo(targetId: string, input: any, isWorkflow: boolean) {
  const startTime = Date.now();
  
  try {
    if (isWorkflow) {
      // 演示工作流执行
      return await executeDemoWorkflow(targetId, input);
    } else {
      // 演示代理执行
      return await executeDemoAgent(targetId, input);
    }
  } catch (error) {
    throw new Error(`演示执行失败: ${(error as Error).message}`);
  } finally {
    // 记录执行时间
    const executionTime = Date.now() - startTime;
    console.log(`演示执行完成: ${targetId}, 耗时: ${executionTime}ms`);
  }
}

async function executeDemoAgent(agentId: string, input: any) {
  // 模拟代理执行结果（实际项目中应该调用真实的代理服务）
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // 脱敏输出
  const sanitizedOutput = {
    status: 'success',
    message: '演示执行完成',
    data: {
      result: '这是模拟的演示结果，展示了系统的基本功能',
      summary: '系统已成功处理您的请求',
      recommendations: ['建议A', '建议B', '建议C'].slice(0, Math.floor(Math.random() * 3) + 1)
    },
    metadata: {
      agent: agentId,
      input_type: typeof input,
      processed_at: new Date().toISOString()
    }
  };

  return {
    sanitizedOutput,
    executionTime: Date.now() - (Date.now() - 1000 - Math.random() * 2000)
  };
}

async function executeDemoWorkflow(workflowId: string, input: any) {
  // 模拟工作流执行结果
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1500));
  
  // 脱敏输出
  const sanitizedOutput = {
    status: 'completed',
    workflow_id: workflowId,
    execution_id: `exec_${Date.now()}`,
    result: {
      nodes_executed: 5,
      nodes_failed: 0,
      output_data: {
        summary: '工作流执行成功',
        key_metrics: {
          processing_time: '2.3s',
          data_processed: '1.2MB',
          accuracy: '98.5%'
        }
      }
    },
    timestamps: {
      started_at: new Date(Date.now() - 2300).toISOString(),
      completed_at: new Date().toISOString()
    }
  };

  return {
    sanitizedOutput,
    executionTime: Date.now() - (Date.now() - 1500 - Math.random() * 1500)
  };
}

async function trackDemoEvent(targetId: string, isWorkflow: boolean, clientIp: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase.from('marketing_events').insert({
      event_type: 'demo_try',
      role: 'demo_user',
      page_path: '/demo',
      source: 'demo_api',
      user_agent: 'Demo API Client',
      ip_address: clientIp,
      session_id: `demo_${Date.now()} as any`,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('记录演示事件失败:', error);
  }
}

// GET 方法提供演示代理信息
export async function GET(request: Request) {
  return NextResponse.json({
    success: true,
    demo_agents: DEMO_AGENTS,
    rate_limit: RATE_LIMIT_PER_HOUR,
    features: [
      '受限访问 - 白名单机制',
      '速率限制 - 防止滥用',
      '数据脱敏 - 保护隐私',
      '执行监控 - 性能追踪'
    ]
  });
}