import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase 客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 智能体状态接口
interface AgentStatus {
  agent_name: string;
  status: 'online' | 'offline' | 'degraded';
  last_heartbeat: string;
  metrics: {
    success_rate: number;
    avg_response_time: number;
    error_rate: number;
    request_count: number;
  };
  health: {
    endpoint_reachable: boolean;
    response_time: number;
    last_check: string;
  };
}

/**
 * GET /api/agents/status
 * 获取所有智能体状态
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentName = searchParams.get('agentName');

    // 如果指定了特定智能体，返回该智能体状态
    if (agentName) {
      const status = await getAgentStatus(agentName);
      if (!status) {
        return NextResponse.json(
          { error: '智能体不存在或无状态信息' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: status,
        timestamp: new Date().toISOString(),
      });
    }

    // 返回所有智能体状态
    const statuses = await getAllAgentStatuses();

    return NextResponse.json({
      success: true,
      data: statuses,
      count: statuses.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('获取智能体状态错误:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '内部服务器错误',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents/status
 * 更新智能体状态（由智能体自身或监控服务调用）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.agent_name || !body.status) {
      return NextResponse.json(
        { error: '缺少必填字段: agent_name, status' },
        { status: 400 }
      );
    }

    // 验证状态
    const validStatuses = ['online', 'offline', 'degraded'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: '无效的状态值，必须是 online, offline 或 degraded' },
        { status: 400 }
      );
    }

    // 更新或插入状态信息
    const { data, error } = await supabase
      .from('agent_status')
      .upsert(
        {
          agent_name: body.agent_name,
          status: body.status,
          last_heartbeat: new Date().toISOString(),
          metrics: body.metrics || {
            success_rate: 0,
            avg_response_time: 0,
            error_rate: 0,
            request_count: 0,
          },
          health: body.health || {
            endpoint_reachable: false,
            response_time: 0,
            last_check: new Date().toISOString(),
          },
        },
        {
          onConflict: 'agent_name',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('更新智能体状态失败:', error);
      return NextResponse.json({ error: '更新状态失败' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: '状态更新成功',
    });
  } catch (error) {
    console.error('更新智能体状态错误:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '内部服务器错误',
      },
      { status: 500 }
    );
  }
}

/**
 * 获取特定智能体状态
 */
async function getAgentStatus(agentName: string): Promise<AgentStatus | null> {
  const { data, error } = await supabase
    .from('agent_status')
    .select('*')
    .eq('agent_name', agentName)
    .single();

  if (error) {
    console.error(`获取智能体 ${agentName} 状态失败:`, error);
    return null;
  }

  return data as AgentStatus;
}

/**
 * 获取所有智能体状态
 */
async function getAllAgentStatuses(): Promise<AgentStatus[]> {
  // 先获取所有已注册的智能体
  const { data: registeredAgents, error: registryError } = await supabase
    .from('agent_registry')
    .select('name');

  if (registryError) {
    console.error('获取注册智能体列表失败:', registryError);
    return [];
  }

  if (!registeredAgents || registeredAgents.length === 0) {
    return [];
  }

  // 获取这些智能体的状态
  const agentNames = registeredAgents.map(agent => agent.name);

  const { data: statuses, error: statusError } = await supabase
    .from('agent_status')
    .select('*')
    .in('agent_name', agentNames);

  if (statusError) {
    console.error('获取智能体状态失败:', statusError);
    return [];
  }

  // 将注册信息和状态信息合并
  const result: AgentStatus[] = registeredAgents.map(agent => {
    const status = statuses.find(s => s.agent_name === agent.name);

    if (status) {
      return status as AgentStatus;
    } else {
      // 如果没有状态记录，返回默认状态
      return {
        agent_name: agent.name,
        status: 'offline',
        last_heartbeat: new Date(0).toISOString(),
        metrics: {
          success_rate: 0,
          avg_response_time: 0,
          error_rate: 0,
          request_count: 0,
        },
        health: {
          endpoint_reachable: false,
          response_time: 0,
          last_check: new Date(0).toISOString(),
        },
      };
    }
  });

  return result;
}
