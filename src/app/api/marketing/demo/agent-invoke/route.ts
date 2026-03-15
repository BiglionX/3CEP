import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 婕旂ずｇ悊鐧藉悕const DEMO_AGENTS = ['demo-agent-1', 'demo-agent-2', 'demo-workflow-1'];
const RATE_LIMIT_PER_HOUR = 5;

// 绠€鍗曠殑鍐呭绾ч€熺巼闄愬埗锛堢敓浜х幆澧冨缓璁娇鐢≧edisconst rateLimitStore: Record<string, { count: number; resetTime: number }> = {};

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const key = `demo_${ip}`;

  if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
    rateLimitStore[key] = {
      count: 0,
      resetTime: now + 3600000, // 1灏忔椂鍚庨噸    };
  }

  if (rateLimitStore[key].count >= RATE_LIMIT_PER_HOUR) {
    return { allowed: false, remaining: 0 };
  }

  rateLimitStore[key].count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT_PER_HOUR - rateLimitStore[key].count,
  };
}

export async function POST(request: Request) {
  try {
    // 鑾峰彇瀹㈡埛绔疘P
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = forwardedFor.split(',')[0].trim() || realIp || 'unknown';

    // 熺巼闄愬埗妫€    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: '璇眰杩囦簬棰戠箒锛岃绋嶅悗鍐嶈瘯',
          code: 'RATE_LIMIT_EXCEEDED',
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { agentId, input, workflowId } = body;

    // 鍙傛暟楠岃瘉
    if ((!agentId && !workflowId) || !input) {
      return NextResponse.json(
        { error: '缂哄皯蹇呰鍙傛暟: agentId/workflowId input' },
        { status: 400 }
      );
    }

    // 鐧藉悕鍗曟    const targetId = agentId || workflowId;
    if (!DEMO_AGENTS.includes(targetId)) {
      return NextResponse.json(
        {
          error: '婕旂ずｇ悊涓嶅,
          code: 'DEMO_AGENT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // 鎵ц鑴辨晱鐨勬紨绀洪€昏緫
    const result = await executeDemo(targetId, input, !!workflowId);

    // 璁板綍婕旂ず浣跨敤浜嬩欢
    await trackDemoEvent(targetId, !!workflowId, clientIp);

    return NextResponse.json({
      success: true,
      result: result.sanitizedOutput,
      executionTime: result.executionTime,
      rateLimit: {
        remaining: rateLimit.remaining,
        resetIn: Math.ceil(
          (rateLimitStore[`demo_${clientIp}`].resetTime - Date.now()) / 1000
        ),
      },
    });
  } catch (error) {
    console.error('婕旂ず鎵ц閿欒:', error);
    return NextResponse.json(
      {
        error: '婕旂ず鎵ц澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

async function executeDemo(targetId: string, input: any, isWorkflow: boolean) {
  const startTime = Date.now();

  try {
    if (isWorkflow) {
      // 婕旂ず宸ヤ綔娴佹墽      return await executeDemoWorkflow(targetId, input);
    } else {
      // 婕旂ずｇ悊鎵ц
      return await executeDemoAgent(targetId, input);
    }
  } catch (error) {
    throw new Error(`婕旂ず鎵ц澶辫触: ${(error as Error).message}`);
  } finally {
    // 璁板綍鎵ц堕棿
    const executionTime = Date.now() - startTime;
    console.log(`婕旂ず鎵ц瀹屾垚: ${targetId}, 鑰楁椂: ${executionTime}ms`);
  }
}

async function executeDemoAgent(agentId: string, input: any) {
  // 妯℃嫙ｇ悊鎵ц缁撴灉锛堝疄闄呴」鐩腑搴旇璋冪敤鐪熷疄鐨勪唬鐞嗘湇鍔★級
  await new Promise(resolve =>
    setTimeout(resolve, 1000 + Math.random() * 2000)
  );

  // 鑴辨晱杈撳嚭
  const sanitizedOutput = {
    status: 'success',
    message: '婕旂ず鎵ц瀹屾垚',
    data: {
      result: '杩欐槸妯℃嫙鐨勬紨绀虹粨鏋滐紝灞曠ず浜嗙郴缁熺殑鍩烘湰鍔熻兘',
      summary: '绯荤粺宸叉垚鍔熷鐞嗘偍鐨勮,
      recommendations: ['寤鸿A', '寤鸿B', '寤鸿C'].slice(
        0,
        Math.floor(Math.random() * 3) + 1
      ),
    },
    metadata: {
      agent: agentId,
      input_type: typeof input,
      processed_at: new Date().toISOString(),
    },
  };

  return {
    sanitizedOutput,
    executionTime: Date.now() - (Date.now() - 1000 - Math.random() * 2000),
  };
}

async function executeDemoWorkflow(workflowId: string, input: any) {
  // 妯℃嫙宸ヤ綔娴佹墽琛岀粨  await new Promise(resolve =>
    setTimeout(resolve, 1500 + Math.random() * 1500)
  );

  // 鑴辨晱杈撳嚭
  const sanitizedOutput = {
    status: 'completed',
    workflow_id: workflowId,
    execution_id: `exec_${Date.now()}`,
    result: {
      nodes_executed: 5,
      nodes_failed: 0,
      output_data: {
        summary: '宸ヤ綔娴佹墽琛屾垚,
        key_metrics: {
          processing_time: '2.3s',
          data_processed: '1.2MB',
          accuracy: '98.5%',
        },
      },
    },
    timestamps: {
      started_at: new Date(Date.now() - 2300).toISOString(),
      completed_at: new Date().toISOString(),
    },
  };

  return {
    sanitizedOutput,
    executionTime: Date.now() - (Date.now() - 1500 - Math.random() * 1500),
  };
}

async function trackDemoEvent(
  targetId: string,
  isWorkflow: boolean,
  clientIp: string
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    (await supabase.from('marketing_events').insert({
      event_type: 'demo_try',
      role: 'demo_user',
      page_path: '/demo',
      source: 'demo_api',
      user_agent: 'Demo API Client',
      ip_address: clientIp,
      session_id: `demo_${Date.now()} as any`,
      created_at: new Date().toISOString(),
    })) as any;
  } catch (error) {
    console.error('璁板綍婕旂ず浜嬩欢澶辫触:', error);
  }
}

// GET 鏂规硶鎻愪緵婕旂ずｇ悊淇℃伅
export async function GET(request: Request) {
  return NextResponse.json({
    success: true,
    demo_agents: DEMO_AGENTS,
    rate_limit: RATE_LIMIT_PER_HOUR,
    features: [
      '鍙楅檺璁块棶 - 鐧藉悕鍗曟満,
      '熺巼闄愬埗 - 闃叉婊ョ敤',
      '鏁版嵁鑴辨晱 - 淇濇姢闅愮',
      '鎵ц鐩戞帶 - 鎬ц兘杩借釜',
    ],
  });
}

