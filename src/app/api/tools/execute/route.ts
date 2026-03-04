/**
 * 绯荤粺宸ュ叿鎵ц API
 * 鎻愪緵鎵ц绯荤粺绠＄悊宸ュ叿鍜岃剼鏈殑鍔熻兘锛屽甫涓ユ牸鐨勬潈闄愰獙? */

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { requirePermission } from '@/middleware/permissions';
import { audit } from '@/lib/audit';

// 鐧藉悕鍗曞伐鍏峰垪琛紙瀹為檯椤圭洰涓簲璇ヤ粠閰嶇疆鏂囦欢璇诲彇?const WHITELISTED_TOOLS = [
  'system_health_check',
  'database_backup',
  'cache_clear',
  'log_rotate',
  'performance_monitor',
];

export async function POST(request: Request) {
  // 鍒涘缓 Supabase 瀹㈡埛?  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 锟?cookies 鑾峰彇浼氳瘽淇℃伅
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('sb-access-token');

  try {
    // 楠岃瘉鐢ㄦ埛璁よ瘉
    if (!sessionCookie) {
      return NextResponse.json({ error: '鏈巿鏉冭? }, { status: 401 });
    }

    // 璁剧疆璁よ瘉浠ょ墝
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionCookie.value);

    if (authError || !user) {
      return NextResponse.json({ error: '鏈巿鏉冭? }, { status: 401 });
    }

    // 鑾峰彇鐢ㄦ埛瑙掕壊淇℃伅
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: '鐢ㄦ埛鏉冮檺涓嶈冻' }, { status: 403 });
    }

    // 鏋勯€犵敤鎴蜂笂涓嬫枃鐢ㄤ簬鏉冮檺妫€?    const userContext = {
      id: user.id,
      roles: [adminUser.role],
      tenant_id: null,
    };

    // 妯℃嫙 Express 璇锋眰瀵硅薄鐢ㄤ簬鏉冮檺涓棿?    const mockReq = {
      user: userContext,
      body: await request.json(),
    };

    const mockRes = {
      status: (code: number) => ({
        json: (data: any) => NextResponse.json(data, { status: code }),
      }),
    };

    // 妫€?tools_execute 鏉冮檺
    const permissionCheck = requirePermission('tools_execute');
    let permissionGranted = true;
    let permissionError = null;

    permissionCheck(
      mockReq,
      {
        status: (code: number) => ({
          json: (data: any) => {
            permissionGranted = false;
            permissionError = data;
            return mockRes;
          },
        }),
      },
      () => {}
    );

    if (!permissionGranted) {
      return NextResponse.json(permissionError, { status: 403 });
    }

    // 瑙ｆ瀽璇锋眰?    const { toolName, parameters, confirmationToken } = mockReq.body;

    // 楠岃瘉蹇呰鍙傛暟
    if (!toolName) {
      return NextResponse.json({ error: '缂哄皯宸ュ叿鍚嶇О鍙傛暟' }, { status: 400 });
    }

    // 楠岃瘉宸ュ叿鏄惁鍦ㄧ櫧鍚嶅崟?    if (!WHITELISTED_TOOLS.includes(toolName)) {
      return NextResponse.json({ error: '宸ュ叿涓嶅湪鐧藉悕鍗曚腑' }, { status: 403 });
    }

    // 楠岃瘉浜屾纭浠ょ墝锛堥珮鍗辨搷浣滈渶瑕侀澶栫‘璁わ級
    const HIGH_RISK_TOOLS = ['database_backup', 'cache_clear'];
    if (HIGH_RISK_TOOLS.includes(toolName)) {
      if (!confirmationToken) {
        return NextResponse.json(
          {
            error: '楂樺嵄鎿嶄綔闇€瑕佷簩娆＄‘?,
            confirmation_required: true,
            tool: toolName,
          },
          { status: 400 }
        );
      }

      // 杩欓噷搴旇楠岃瘉纭浠ょ墝鐨勬湁鏁?      // 绠€鍖栧鐞嗭細妫€鏌ヤ护鐗屾牸?      if (confirmationToken.length < 10) {
        return NextResponse.json({ error: '纭浠ょ墝鏃犳晥' }, { status: 400 });
      }
    }

    // 璁板綍瀹¤鏃ュ織 - 寮€濮嬫墽?    await audit(
      'tool_execute_start',
      {
        id: user.id,
        type: 'user',
        roles: [adminUser.role],
        tenant_id: null,
      },
      'tools',
      {
        tool_name: toolName,
        parameters: parameters || {},
        is_high_risk: HIGH_RISK_TOOLS.includes(toolName),
        confirmation_token: !!confirmationToken,
      },
      `tool_${Date.now()}`,
      {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      }
    );

    // 妯℃嫙宸ュ叿鎵ц锛堝疄闄呭簲璇ヨ皟鐢ㄥ叿浣撶殑宸ュ叿鑴氭湰?    try {
      // 鏍规嵁宸ュ叿鍚嶇О鎵ц涓嶅悓閫昏緫
      let executionResult;

      switch (toolName) {
        case 'system_health_check':
          executionResult = {
            status: 'healthy',
            cpu_usage: '45%',
            memory_usage: '68%',
            disk_usage: '32%',
            network_latency: '12ms',
          };
          break;

        case 'database_backup':
          executionResult = {
            backup_status: 'initiated',
            backup_id: `backup_${Date.now()}`,
            database: 'main_db',
            size: '2.3GB',
          };
          break;

        case 'cache_clear':
          executionResult = {
            cache_cleared: true,
            cleared_items: 1247,
            memory_freed: '156MB',
          };
          break;

        case 'log_rotate':
          executionResult = {
            rotated_logs: 15,
            archived_size: '2.1GB',
            compression_ratio: '78%',
          };
          break;

        case 'performance_monitor':
          executionResult = {
            metrics_collected: true,
            sample_period: '60s',
            active_connections: 42,
            avg_response_time: '85ms',
          };
          break;

        default:
          executionResult = { message: '宸ュ叿鎵ц瀹屾垚' };
      }

      const finalResult = {
        success: true,
        toolName,
        executionId: `exec_${Date.now()}`,
        result: executionResult,
        timestamp: new Date().toISOString(),
        duration: Math.floor(Math.random() * 1000) + 100, // 妯℃嫙鎵ц鏃堕棿
      };

      // 璁板綍瀹¤鏃ュ織 - 鎵ц鎴愬姛
      await audit(
        'tool_execute_success',
        {
          id: user.id,
          type: 'user',
          roles: [adminUser.role],
          tenant_id: null,
        },
        'tools',
        finalResult,
        `tool_${Date.now()}`,
        {
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
        }
      );

      return NextResponse.json(finalResult);
    } catch (toolError: any) {
      // 璁板綍瀹¤鏃ュ織 - 鎵ц澶辫触
      await audit(
        'tool_execute_failed',
        {
          id: user.id,
          type: 'user',
          roles: [adminUser.role],
          tenant_id: null,
        },
        'tools',
        {
          toolName,
          error: toolError.message,
          timestamp: new Date().toISOString(),
        },
        `tool_${Date.now()}`,
        {
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
        }
      );

      return NextResponse.json(
        {
          error: '宸ュ叿鎵ц澶辫触',
          details: toolError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('宸ュ叿鎵ц API 閿欒:', error);

    // 璁板綍瀹¤鏃ュ織 - 绯荤粺閿欒
    await audit(
      'tool_execute_error',
      {
        id: 'system',
        type: 'system',
        roles: [],
        tenant_id: null,
      },
      'tools',
      {
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      `tool_${Date.now()}`,
      {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      }
    );

    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊? }, { status: 500 });
  }
}

// GET 鏂规硶鐢ㄤ簬鑾峰彇鍙敤宸ュ叿鍒楄〃
export async function GET(request: Request) {
  return NextResponse.json({
    available_tools: WHITELISTED_TOOLS,
    high_risk_tools: ['database_backup', 'cache_clear'],
    timestamp: new Date().toISOString(),
  });
}

