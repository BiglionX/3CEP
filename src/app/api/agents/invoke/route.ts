/**
 * 鏅鸿兘浣撹皟?API
 * 鎻愪緵鐩存帴璋冪敤鏅鸿兘浣撴墽琛岀壒瀹氫换鍔＄殑鍔熻兘锛屽甫鏉冮檺楠岃瘉
 */

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { requirePermission } from '@/tech/middleware/permissions';
import { audit } from '@/lib/audit';

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

    // 妫€?agents_invoke 鏉冮檺
    const permissionCheck = requirePermission('agents_invoke');
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

    // 瑙ｆ瀽璇锋眰?    const { agentName, taskId, parameters } = mockReq.body;

    // 楠岃瘉蹇呰鍙傛暟
    if (!agentName) {
      return NextResponse.json(
        { error: '缂哄皯鏅鸿兘浣撳悕绉板弬? },
        { status: 400 }
      );
    }

    // 璁板綍瀹¤鏃ュ織 - 寮€濮嬭皟?    await audit(
      'agent_invoke_start',
      {
        id: user.id,
        type: 'user',
        roles: [adminUser.role],
        tenant_id: null,
      },
      'agents',
      {
        agent_name: agentName,
        task_id: taskId,
        parameters: parameters || {},
      },
      `invoke_${Date.now()}`,
      {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      }
    );

    // 妯℃嫙鏅鸿兘浣撹皟鐢紙瀹為檯搴旇璋冪敤鍏蜂綋鐨勬櫤鑳戒綋鏈嶅姟?    try {
      // 杩欓噷搴旇鏄疄闄呯殑鏅鸿兘浣撹皟鐢ㄩ€昏緫
      // 渚嬪璋冪敤 LangChain銆丱penAI 鎴栬嚜瀹氫箟鏅鸿兘浣撴湇?
      const invokeResult = {
        success: true,
        agentName,
        taskId: taskId || `task_${Date.now()}`,
        invokeId: `invoke_${Date.now()}`,
        status: 'executing',
        timestamp: new Date().toISOString(),
        estimatedCompletion: new Date(Date.now() + 30000).toISOString(), // 30绉掑悗
      };

      // 璁板綍瀹¤鏃ュ織 - 璋冪敤鎴愬姛鍚姩
      await audit(
        'agent_invoke_started',
        {
          id: user.id,
          type: 'user',
          roles: [adminUser.role],
          tenant_id: null,
        },
        'agents',
        invokeResult,
        `invoke_${Date.now()}`,
        {
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
        }
      );

      return NextResponse.json(invokeResult);
    } catch (agentError: any) {
      // 璁板綍瀹¤鏃ュ織 - 璋冪敤澶辫触
      await audit(
        'agent_invoke_failed',
        {
          id: user.id,
          type: 'user',
          roles: [adminUser.role],
          tenant_id: null,
        },
        'agents',
        {
          agentName,
          error: agentError.message,
          timestamp: new Date().toISOString(),
        },
        `invoke_${Date.now()}`,
        {
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
        }
      );

      return NextResponse.json(
        {
          error: '鏅鸿兘浣撹皟鐢ㄥけ?,
          details: agentError.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('鏅鸿兘浣撹皟?API 閿欒:', error);

    // 璁板綍瀹¤鏃ュ織 - 绯荤粺閿欒
    await audit(
      'agent_invoke_error',
      {
        id: 'system',
        type: 'system',
        roles: [],
        tenant_id: null,
      },
      'agents',
      {
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      `invoke_${Date.now()}`,
      {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      }
    );

    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊? }, { status: 500 });
  }
}

// GET 鏂规硶鐢ㄤ簬鏌ヨ璋冪敤鐘?export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const invokeId = searchParams.get('invokeId');

  if (!invokeId) {
    return NextResponse.json({ error: '缂哄皯璋冪敤ID鍙傛暟' }, { status: 400 });
  }

  // 杩欓噷搴旇鏌ヨ瀹為檯鐨勮皟鐢ㄧ姸?  // 鏆傛椂杩斿洖妯℃嫙鏁版嵁
  return NextResponse.json({
    invokeId,
    status: 'completed',
    result: {
      success: true,
      output: '鏅鸿兘浣撴墽琛屽畬?,
      data: {
        processedItems: 10,
        successRate: '95%',
      },
    },
    timestamp: new Date().toISOString(),
  });
}

