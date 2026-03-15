/**
 * n8n 宸ヤ綔娴佸洖API
 * 鎻愪緵宸ヤ綔娴佸巻鍙叉墽琛屽洖鏀惧姛鑳斤紝甯︽潈闄愰獙璇佸拰瀹¤ュ織
 */

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { requirePermission } from '@/tech/middleware/permissions';
import { audit } from '@/lib/audit';

// n8n 閰嶇疆
const N8N_CONFIG = {
  baseUrl: process.env.N8N_API_URL || 'http://localhost:5678',
  apiToken: process.env.N8N_API_TOKEN,
};

export async function POST(request: Request) {
  // 鍒涘缓 Supabase 瀹㈡埛  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // cookies 鑾峰彇氳瘽淇℃伅
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('sb-access-token');

  try {
    // 楠岃瘉鐢ㄦ埛璁よ瘉
    if (!sessionCookie) {
      return NextResponse.json({ error: '鏈巿鏉冭 }, { status: 401 });
    }

    // 璁剧疆璁よ瘉ょ墝
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionCookie.value);

    if (authError || !user) {
      return NextResponse.json({ error: '鏈巿鏉冭 }, { status: 401 });
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

    // 鏋勯€犵敤鎴蜂笂涓嬫枃鐢ㄤ簬鏉冮檺妫€    const userContext = {
      id: user.id,
      roles: [adminUser.role],
      tenant_id: null, // 绠€鍖栧鐞嗭紝瀹為檯搴斾粠 user_tenants 琛ㄨ幏    };

    // 妯℃嫙 Express 璇眰瀵硅薄鐢ㄤ簬鏉冮檺涓棿    const mockReq = {
      user: userContext,
      body: await request.json(),
    };

    const mockRes = {
      status: (code: number) => ({
        json: (data: any) => NextResponse.json(data, { status: code }),
      }),
    };

    // 妫€n8n_workflows_replay 鏉冮檺
    const permissionCheck = requirePermission('n8n_workflows_replay');
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

    // 瑙ｆ瀽璇眰    const { workflowId, executionId, parameters } = mockReq.body;

    // 楠岃瘉蹇呰鍙傛暟
    if (!workflowId) {
      return NextResponse.json({ error: '缂哄皯宸ヤ綔娴両D鍙傛暟' }, { status: 400 });
    }

    // 璁板綍瀹¤ュ織 - 寮€濮嬪洖    await audit(
      'n8n_workflow_replay_start',
      {
        id: user.id,
        type: 'user',
        roles: [adminUser.role],
        tenant_id: null,
      },
      'n8n_workflows',
      {
        workflow_id: workflowId,
        execution_id: executionId,
        parameters: parameters || {},
      },
      `replay_${Date.now()}`,
      {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      }
    );

    // 璋冪敤 n8n API 鎵ц鍥炴斁锛堟ā鎷燂級
    try {
      // 杩欓噷搴旇鏄疄闄呯殑 n8n API 璋冪敤
      // const n8nResponse = await axios.post(
      //   `${N8N_CONFIG.baseUrl}/workflows/${workflowId}/replay`,
      //   { executionId, parameters },
      //   { headers: { 'Authorization': `Bearer ${N8N_CONFIG.apiToken}` } }
      // );

      // 妯℃嫙鎴愬姛鍝嶅簲
      const replayResult = {
        success: true,
        workflowId,
        executionId: executionId || 'latest',
        replayId: `replay_${Date.now()}`,
        status: 'started',
        timestamp: new Date().toISOString(),
      };

      // 璁板綍瀹¤ュ織 - 鍥炴斁鎴愬姛
      await audit(
        'n8n_workflow_replay_success',
        {
          id: user.id,
          type: 'user',
          roles: [adminUser.role],
          tenant_id: null,
        },
        'n8n_workflows',
        replayResult,
        `replay_${Date.now()}`,
        {
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
        }
      );

      return NextResponse.json(replayResult);
    } catch (n8nError: any) {
      // 璁板綍瀹¤ュ織 - 鍥炴斁澶辫触
      await audit(
        'n8n_workflow_replay_failed',
        {
          id: user.id,
          type: 'user',
          roles: [adminUser.role],
          tenant_id: null,
        },
        'n8n_workflows',
        {
          workflowId,
          error: n8nError.message,
          timestamp: new Date().toISOString(),
        },
        `replay_${Date.now()}`,
        {
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
        }
      );

      return NextResponse.json(
        {
          error: '宸ヤ綔娴佸洖鏀惧け,
          details: n8nError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('宸ヤ綔娴佸洖API 閿欒:', error);

    // 璁板綍瀹¤ュ織 - 绯荤粺閿欒
    await audit(
      'n8n_workflow_replay_error',
      {
        id: 'system',
        type: 'system',
        roles: [],
        tenant_id: null,
      },
      'n8n_workflows',
      {
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      `replay_${Date.now()}`,
      {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      }
    );

    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 });
  }
}

// GET 鏂规硶鐢ㄤ簬鏌ヨ鍥炴斁鐘export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const replayId = searchParams.get('replayId');

  if (!replayId) {
    return NextResponse.json({ error: '缂哄皯鍥炴斁ID鍙傛暟' }, { status: 400 });
  }

  // 杩欓噷搴旇鏌ヨ瀹為檯鐨勫洖鏀剧姸  // 鏆傛椂杩斿洖妯℃嫙鏁版嵁
  return NextResponse.json({
    replayId,
    status: 'completed',
    result: {
      success: true,
      output: '鍥炴斁瀹屾垚',
    },
    timestamp: new Date().toISOString(),
  });
}

