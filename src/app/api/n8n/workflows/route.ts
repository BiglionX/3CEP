/**
 * n8n 宸ヤ綔娴佹潈闄愭帶API
 * 鎻愪緵宸ヤ綔娴佽闂拰鎵ц鏉冮檺绠＄悊鎺ュ彛
 */

import { sanitizeWorkflowExecution } from '@/lib/sanitize';
import { filterReplayParameters } from '@/tech/middleware/workflow-replay-filter';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// n8n 閰嶇疆
const N8N_CONFIG = {
  baseUrl: process.env.N8N_API_URL || 'http://localhost:5678',
  apiToken: process.env.N8N_API_TOKEN,
  webhookSecret: process.env.N8N_WEBHOOK_SECRET,
};

export async function GET(request: Request) {
  // 鍒涘缓 Supabase 瀹㈡埛
  const supabase = createClient(
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

    // 瑙ｆ瀽鏌ヨ鍙傛暟
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');
    const action = searchParams.get('action') || 'read';

    // 濡傛灉鎸囧畾浜嗗伐浣滄祦ID锛屾鏌ュ叿浣撴潈
    if (workflowId) {
      const hasAccess = await checkWorkflowPermission(
        user.id,
        workflowId,
        action,
        supabase
      );

      if (!hasAccess) {
        return NextResponse.json(
          {
            error: '犳潈璁块棶姝ゅ伐浣滄祦',
            code: 'WORKFLOW_ACCESS_DENIED',
          },
          { status: 403 }
        );
      }

      // 鑾峰彇宸ヤ綔娴佽缁嗕俊
      const workflowDetails = await getWorkflowDetails(workflowId);

      // 鏍规嵁鐢ㄦ埛瑙掕壊鑴辨晱鏁版嵁
      const userProfile = await getUserProfile(user.id, supabase);
      const sanitizedDetails = sanitizeWorkflowExecution(
        workflowDetails,
        userProfile.role,
        userProfile.tenant_id
      );

      return NextResponse.json({
        success: true,
        data: {
          workflow: sanitizedDetails,
          permissions: {
            canRead: await checkWorkflowPermission(
              user.id,
              workflowId,
              'read',
              supabase
            ),
            canExecute: await checkWorkflowPermission(
              user.id,
              workflowId,
              'execute',
              supabase
            ),
            canManage: await checkWorkflowPermission(
              user.id,
              workflowId,
              'manage',
              supabase
            ),
          },
        },
      });
    }

    // 鑾峰彇鐢ㄦ埛鍙闂殑宸ヤ綔娴佸垪
    const accessibleWorkflows = await getUserAccessibleWorkflows(
      user.id,
      supabase
    );

    // 鏍规嵁鐢ㄦ埛瑙掕壊鑴辨晱鍒楄〃鏁版嵁
    const userProfile = await getUserProfile(user.id, supabase);
    const sanitizedWorkflows = accessibleWorkflows.map((workflow: any) =>
      sanitizeWorkflowExecution(
        workflow,
        userProfile.role,
        userProfile.tenant_id
      )
    );

    return NextResponse.json({
      success: true,
      data: sanitizedWorkflows,
      count: sanitizedWorkflows.length,
    });
  } catch (error) {
    console.error('宸ヤ綔娴佹潈闄愭鏌ラ敊', error);
    return NextResponse.json(
      {
        error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊,
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // 鍒涘缓 Supabase 瀹㈡埛
  const supabase = createClient(
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

    // 瑙ｆ瀽璇眰
    const body = await request.json();
    const { workflowId, action = 'execute', inputData } = body;

    // 瀵逛簬鍥炴斁鍜屽洖婊氭搷浣滐紝搴旂敤鍙傛暟杩囨护
    let filteredInputData = inputData;
    if (action === 'replay' || action === 'rollback') {
      const userProfile = await getUserProfile(user.id, supabase);
      const filterResult = filterReplayParameters(
        inputData,
        userProfile.role,
        workflowId
      );
      filteredInputData = filterResult.filtered;

      // 璁板綍鍙傛暟杩囨护瀹¤
      await logAuditEvent(
        'workflow_parameter_filter',
        user.id,
        'n8n_workflows',
        {
          workflow_id: workflowId,
          action: action,
          original_params: Object.keys(inputData).length,
          filtered_params: Object.keys(filteredInputData).length,
          removed_params: filterResult.removed.length,
        },
        supabase
      );
    }

    // 楠岃瘉蹇呴渶鍙傛暟
    if (!workflowId) {
      return NextResponse.json({ error: '宸ヤ綔娴両D涓哄繀濉」' }, { status: 400 });
    }

    // 妫€鏌ユ墽琛屾潈
    const canExecute = await checkWorkflowPermission(
      user.id,
      workflowId,
      'execute',
      supabase
    );

    if (!canExecute) {
      return NextResponse.json(
        {
          error: '犳潈鎵ц姝ゅ伐浣滄祦',
          code: 'WORKFLOW_EXECUTE_DENIED',
        },
        { status: 403 }
      );
    }

    // 鎵ц宸ヤ綔
    const executionResult = await executeN8nWorkflow(
      workflowId,
      inputData,
      user.id
    );

    // 璁板綍瀹¤ュ織
    await logAuditEvent(
      'workflow_execute',
      user.id,
      'n8n_workflows',
      {
        workflow_id: workflowId,
        action: action,
        input_data: inputData,
        execution_id: executionResult.executionId,
      },
      supabase
    );

    return NextResponse.json({
      success: true,
      message: '宸ヤ綔娴佹墽琛屾垚,
      data: executionResult,
    });
  } catch (error) {
    console.error('宸ヤ綔娴佹墽琛岄敊', error);
    return NextResponse.json(
      {
        error: '宸ヤ綔娴佹墽琛屽け,
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  // 鍒涘缓 Supabase 瀹㈡埛
  const supabase = createClient(
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

    // 瑙ｆ瀽璇眰
    const body = await request.json();
    const { workflowId, permissions } = body;

    // 楠岃瘉蹇呴渶鍙傛暟
    if (!workflowId || !permissions) {
      return NextResponse.json(
        { error: '宸ヤ綔娴両D鍜屾潈闄愰厤缃负蹇呭～ },
        { status: 400 }
      );
    }

    // 妫€鏌ョ鐞嗘潈
    const canManage = await checkWorkflowPermission(
      user.id,
      workflowId,
      'manage',
      supabase
    );

    if (!canManage) {
      return NextResponse.json(
        {
          error: '犳潈绠＄悊姝ゅ伐浣滄祦鏉冮檺',
          code: 'WORKFLOW_MANAGE_DENIED',
        },
        { status: 403 }
      );
    }

    // 鏇存柊宸ヤ綔娴佹潈
    const updateResult = await updateWorkflowPermissions(
      workflowId,
      permissions
    );

    // 璁板綍瀹¤ュ織
    await logAuditEvent(
      'workflow_permissions_update',
      user.id,
      'n8n_workflows',
      {
        workflow_id: workflowId,
        permissions: permissions,
        changes: updateResult.changes,
      },
      supabase
    );

    return NextResponse.json({
      success: true,
      message: '宸ヤ綔娴佹潈闄愭洿鏂版垚,
      data: updateResult,
    });
  } catch (error) {
    console.error('宸ヤ綔娴佹潈闄愭洿鏂伴敊', error);
    return NextResponse.json(
      {
        error: '鏉冮檺鏇存柊澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/n8n/workflows/[id] - 鍒犻櫎宸ヤ綔娴佹潈闄愰厤
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 鍒涘缓 Supabase 瀹㈡埛
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // cookies 鑾峰彇氳瘽淇℃伅
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('sb-access-token');
  const workflowId = params.id;

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

    // 妫€鏌ョ鐞嗘潈
    const canManage = await checkWorkflowPermission(
      user.id,
      workflowId,
      'manage',
      supabase
    );

    if (!canManage) {
      return NextResponse.json(
        {
          error: '犳潈鍒犻櫎姝ゅ伐浣滄祦鏉冮檺閰嶇疆',
          code: 'WORKFLOW_MANAGE_DENIED',
        },
        { status: 403 }
      );
    }

    // 鍒犻櫎鏉冮檺閰嶇疆
    const deleteResult = await deleteWorkflowPermissions(workflowId);

    // 璁板綍瀹¤ュ織
    await logAuditEvent(
      'workflow_permissions_delete',
      user.id,
      'n8n_workflows',
      { workflow_id: workflowId },
      supabase
    );

    return NextResponse.json({
      success: true,
      message: '宸ヤ綔娴佹潈闄愰厤缃垹闄ゆ垚,
      data: deleteResult,
    });
  } catch (error) {
    console.error('宸ヤ綔娴佹潈闄愬垹闄ら敊', error);
    return NextResponse.json(
      {
        error: '鏉冮檺閰嶇疆鍒犻櫎澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// 杈呭姪鍑芥暟

/**
 * 妫€鏌ュ伐浣滄祦鏉冮檺
 */
async function checkWorkflowPermission(
  userId: string,
  workflowId: string,
  action: string,
  supabase: any
) {
  try {
    // 鑾峰彇鐢ㄦ埛瑙掕壊
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError || !userProfile) {
      return false;
    }

    const userRole = userProfile.role;

    // 瓒呯骇绠＄悊鍛樻嫢鏈夋墍鏈夋潈
    if (userRole === 'admin') {
      return true;
    }

    // 鑾峰彇宸ヤ綔娴佹潈闄愰厤
    const workflowPermissions = await getWorkflowPermissionConfig(workflowId);

    if (!workflowPermissions) {
      // 榛樿鏉冮檺锛氬彧鏈夌鐞嗗憳鍙互绠＄悊锛岃璇佺敤鎴峰彲ヨ
      switch (action) {
        case 'manage':
          return userRole === 'admin';
        case 'execute':
          return ['admin', 'manager', 'agent_operator'].includes(userRole);
        case 'read':
          return true; // 鎵€鏈夎璇佺敤鎴烽兘鍙互璇诲彇
        default:
          return false;
      }
    }

    // 鏍规嵁閰嶇疆妫€鏌ユ潈
    const allowedRoles = workflowPermissions[`${action}Roles`] || [];
    return allowedRoles.includes(userRole);
  } catch (error) {
    console.error('鏉冮檺妫€鏌ュけ', error);
    return false;
  }
}

/**
 * 鑾峰彇鐢ㄦ埛鍙闂殑宸ヤ綔娴佸垪
 */
async function getUserAccessibleWorkflows(userId: string, supabase: any) {
  try {
    // 鑾峰彇鐢ㄦ埛瑙掕壊
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    const userRole = userProfile.role || 'viewer';

    // n8n 鑾峰彇宸ヤ綔娴佸垪
    const n8nWorkflows = await getAllN8nWorkflows();

    // 杩囨护鐢ㄦ埛鍙闂殑宸ヤ綔
    const accessibleWorkflows = n8nWorkflows.filter((workflow: any) => {
      const permissions = workflow.permissions || {};
      const readRoles = permissions.readRoles || ['admin'];

      // 瓒呯骇绠＄悊鍛樺彲ョ湅鍒版墍鏈夊伐浣滄祦
      if (userRole === 'admin') {
        return true;
      }

      return readRoles.includes(userRole);
    });

    // 娣诲姞鏉冮檺淇℃伅
    return accessibleWorkflows.map((workflow: any) => ({
      id: workflow.id,
      name: workflow.name,
      active: workflow.active,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      permissions: {
        canRead: true,
        canExecute: checkActionPermission(userRole, workflow, 'execute'),
        canManage: checkActionPermission(userRole, workflow, 'manage'),
      },
    }));
  } catch (error) {
    console.error('鑾峰彇鍙闂伐浣滄祦鍒楄〃澶辫触:', error);
    return [];
  }
}

/**
 * 妫€鏌ョ壒瀹氭搷浣滄潈
 */
function checkActionPermission(
  userRole: string,
  workflow: any,
  action: string
) {
  const permissions = workflow.permissions || {};
  const allowedRoles = permissions[`${action}Roles`] || [];

  if (userRole === 'admin') {
    return true;
  }

  return allowedRoles.includes(userRole);
}

/**
 * 鎵ц n8n 宸ヤ綔
 */
async function executeN8nWorkflow(
  workflowId: string,
  inputData: any,
  userId: string
) {
  try {
    const response = await axios.post(
      `${N8N_CONFIG.baseUrl}/api/workflows/${workflowId}/run`,
      {
        inputs: inputData || {},
      },
      {
        headers: {
          Authorization: `Bearer ${N8N_CONFIG.apiToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    return {
      executionId: response.data.executionId,
      status: response.data.status,
      data: response.data.data,
    };
  } catch (error) {
    console.error('鎵ц n8n 宸ヤ綔娴佸け', error);
    throw new Error(
      `宸ヤ綔娴佹墽琛屽け ${
        (error as any).data.message || (error as Error).message
      }`
    );
  }
}

/**
 * 鏇存柊宸ヤ綔娴佹潈
 */
async function updateWorkflowPermissions(workflowId: string, permissions: any) {
  try {
    const response = await axios.patch(
      `${N8N_CONFIG.baseUrl}/api/workflows/${workflowId}`,
      {
        meta: {
          permissions: permissions,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${N8N_CONFIG.apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      workflowId: workflowId,
      updated: true,
      changes: permissions,
    };
  } catch (error) {
    console.error('鏇存柊宸ヤ綔娴佹潈闄愬け', error);
    throw new Error(
      `鏉冮檺鏇存柊澶辫触: ${
        (error as any).data.message || (error as Error).message
      }`
    );
  }
}

/**
 * 鍒犻櫎宸ヤ綔娴佹潈闄愰厤
 */
async function deleteWorkflowPermissions(workflowId: string) {
  try {
    await axios.patch(
      `${N8N_CONFIG.baseUrl}/api/workflows/${workflowId}`,
      {
        meta: {
          permissions: null,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${N8N_CONFIG.apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      workflowId: workflowId,
      deleted: true,
    };
  } catch (error) {
    console.error('鍒犻櫎宸ヤ綔娴佹潈闄愰厤缃け', error);
    throw new Error(
      `鏉冮檺閰嶇疆鍒犻櫎澶辫触: ${
        (error as any).data.message || (error as Error).message
      }`
    );
  }
}

/**
 * 鑾峰彇宸ヤ綔娴佽缁嗕俊
 */
async function getWorkflowDetails(workflowId: string) {
  try {
    const response = await axios.get(
      `${N8N_CONFIG.baseUrl}/api/workflows/${workflowId}`,
      {
        headers: {
          Authorization: `Bearer ${N8N_CONFIG.apiToken}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('鑾峰彇宸ヤ綔娴佽鎯呭け', error);
    return null;
  }
}

/**
 * 鑾峰彇鎵€n8n 宸ヤ綔
 */
async function getAllN8nWorkflows() {
  try {
    const response = await axios.get(`${N8N_CONFIG.baseUrl}/api/workflows`, {
      headers: {
        Authorization: `Bearer ${N8N_CONFIG.apiToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('鑾峰彇 n8n 宸ヤ綔娴佸垪琛ㄥけ', error);
    return [];
  }
}

/**
 * 鑾峰彇宸ヤ綔娴佹潈闄愰厤
 */
async function getWorkflowPermissionConfig(workflowId: string) {
  try {
    const workflow = await getWorkflowDetails(workflowId);
    return workflow.permissions || null;
  } catch (error) {
    console.error('鑾峰彇宸ヤ綔娴佹潈闄愰厤缃け', error);
    return null;
  }
}

/**
 * 璁板綍瀹¤ュ織
 */
async function logAuditEvent(
  action: string,
  userId: string,
  resource: string,
  details: any,
  supabase: any
) {
  try {
    // 杩欓噷搴旇璋冪敤瀹為檯鐨勫璁℃棩蹇楃郴
    console.log(`瀹¤ュ織: ${action} by ${userId} on ${resource}`, details);

    // 瀹為檯椤圭洰涓簲璇ュ啓鍏ユ暟鎹簱
    // await supabase.from('audit_logs').insert({
    //   user_id: userId,
    //   action: action,
    //   resource: resource,
    //   details: details,
    //   timestamp: new Date().toISOString()
    // } as any);
  } catch (error) {
    console.error('璁板綍瀹¤ュ織澶辫触:', error);
  }
}

/**
 * 鑾峰彇鐢ㄦ埛妗ｆ淇℃伅
 */
async function getUserProfile(userId: string, supabase: any) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role, tenant_id')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('鑾峰彇鐢ㄦ埛妗ｆ澶辫触:', error);
      return { role: 'user', tenant_id: null };
    }

    return profile;
  } catch (error) {
    console.error('鑾峰彇鐢ㄦ埛妗ｆ閿欒:', error);
    return { role: 'user', tenant_id: null };
  }
}

