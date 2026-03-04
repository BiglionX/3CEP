import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 鍒濆鍖朣upabase瀹㈡埛?const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 鏅鸿兘浣撶姸鎬佹帴?interface AgentStatus {
  name: string;
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
 * 鑾峰彇鎵€鏈夋櫤鑳戒綋鐘? */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentName = searchParams.get('agentName');

    // 濡傛灉鎸囧畾浜嗙壒瀹氭櫤鑳戒綋锛岃繑鍥炶鏅鸿兘浣撶姸?    if (agentName) {
      const status = await getAgentStatus(agentName);
      if (!status) {
        return NextResponse.json(
          { error: '鏅鸿兘浣撲笉瀛樺湪鎴栨棤鐘舵€佷俊? },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: status,
        timestamp: new Date().toISOString(),
      });
    }

    // 杩斿洖鎵€鏈夋櫤鑳戒綋鐘?    const statuses = await getAllAgentStatuses();

    return NextResponse.json({
      success: true,
      data: statuses,
      count: statuses.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('鑾峰彇鏅鸿兘浣撶姸鎬侀敊?', error);
    return NextResponse.json(
      { error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊? },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents/status
 * 鏇存柊鏅鸿兘浣撶姸鎬侊紙鐢辨櫤鑳戒綋鑷韩鎴栫洃鎺ф湇鍔¤皟鐢級
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 楠岃瘉蹇呴渶瀛楁
    if (!body.agent_name || !body.status) {
      return NextResponse.json(
        { error: '缂哄皯蹇呴渶瀛楁: agent_name, status' },
        { status: 400 }
      );
    }

    // 楠岃瘉鐘舵€?    const validStatuses = ['online', 'offline', 'degraded'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: '鏃犳晥鐨勭姸鎬佸€硷紝蹇呴』?online, offline 锟?degraded' },
        { status: 400 }
      );
    }

    // 鏇存柊鎴栨彃鍏ョ姸鎬佷俊?    const { data, error } = await supabase
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
      console.error('鏇存柊鏅鸿兘浣撶姸鎬佸け?', error);
      return NextResponse.json({ error: '鏇存柊鐘舵€佸け? }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: '鐘舵€佹洿鏂版垚?,
    });
  } catch (error: any) {
    console.error('鏇存柊鏅鸿兘浣撶姸鎬侀敊?', error);
    return NextResponse.json(
      { error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊? },
      { status: 500 }
    );
  }
}

/**
 * 鑾峰彇鐗瑰畾鏅鸿兘浣撶姸? */
async function getAgentStatus(agentName: string): Promise<AgentStatus | null> {
  const { data, error } = await supabase
    .from('agent_status')
    .select('*')
    .eq('agent_name', agentName)
    .single();

  if (error) {
    console.error(`鑾峰彇鏅鸿兘?${agentName} 鐘舵€佸け?`, error);
    return null;
  }

  return data as AgentStatus;
}

/**
 * 鑾峰彇鎵€鏈夋櫤鑳戒綋鐘? */
async function getAllAgentStatuses(): Promise<AgentStatus[]> {
  // 鍏堣幏鍙栨墍鏈夊凡娉ㄥ唽鐨勬櫤鑳戒綋
  const { data: registeredAgents, error: registryError } = await supabase
    .from('agent_registry')
    .select('name');

  if (registryError) {
    console.error('鑾峰彇娉ㄥ唽鏅鸿兘浣撳垪琛ㄥけ?', registryError);
    return [];
  }

  if (!registeredAgents || registeredAgents.length === 0) {
    return [];
  }

  // 鑾峰彇杩欎簺鏅鸿兘浣撶殑鐘?  const agentNames = registeredAgents.map(agent => agent.name);

  const { data: statuses, error: statusError } = await supabase
    .from('agent_status')
    .select('*')
    .in('agent_name', agentNames);

  if (statusError) {
    console.error('鑾峰彇鏅鸿兘浣撶姸鎬佸け?', statusError);
    return [];
  }

  // 灏嗘敞鍐屼俊鎭拰鐘舵€佷俊鎭悎?  const result: AgentStatus[] = registeredAgents.map(agent => {
    const status = statuses?.find(s => s.agent_name === agent.name);

    if (status) {
      return status as AgentStatus;
    } else {
      // 濡傛灉娌℃湁鐘舵€佽褰曪紝杩斿洖榛樿鐘?      return {
        name: agent.name,
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

