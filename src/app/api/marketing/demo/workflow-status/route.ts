import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 婕旂ず宸ヤ綔娴両D鐧藉悕const DEMO_WORKFLOWS = [
  'demo-workflow-1',
  'demo-workflow-2',
  'sample-workflow-1',
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');
    const includeExecution = searchParams.get('includeExecution') === 'true';

    // 濡傛灉鎸囧畾浜嗗伐浣滄祦ID锛岃繑鍥炵壒瀹氬伐浣滄祦淇℃伅
    if (workflowId) {
      if (!DEMO_WORKFLOWS.includes(workflowId)) {
        return NextResponse.json(
          {
            error: '宸ヤ綔娴佷笉瀛樺湪鎴栨棤鏉冭,
            code: 'WORKFLOW_NOT_FOUND',
          },
          { status: 404 }
        );
      }

      const workflowInfo = await getDemoWorkflowInfo(workflowId);

      if (includeExecution) {
        const executionData = await getRecentExecutions(workflowId);
        workflowInfo.executions = executionData;
      }

      return NextResponse.json({
        success: true,
        data: workflowInfo,
      });
    }

    // 杩斿洖鎵€鏈夋紨绀哄伐浣滄祦鍒楄〃
    const workflows = await Promise.all(
      DEMO_WORKFLOWS.map(id => getDemoWorkflowInfo(id))
    );

    return NextResponse.json({
      success: true,
      data: workflows,
      count: workflows.length,
    });
  } catch (error) {
    console.error('鑾峰彇宸ヤ綔娴佺姸鎬侀敊', error);
    return NextResponse.json(
      {
        error: '鑾峰彇宸ヤ綔娴佺姸鎬佸け,
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

async function getDemoWorkflowInfo(workflowId: string) {
  // 妯℃嫙宸ヤ綔娴佷俊鎭紙瀹為檯椤圭洰涓簲璇ヤ粠n8n API鑾峰彇  const workflowTemplates: Record<string, any> = {
    'demo-workflow-1': {
      id: 'demo-workflow-1',
      name: '瀹㈡埛鏀寔鑷姩鍖栨紨,
      description: '灞曠ず濡備綍鑷姩鍖栧鐞嗗鎴敮鎸佽姹傜殑瀹屾暣娴佺▼',
      category: 'customer-service',
      nodes: 8,
      status: 'active',
      last_updated: '2026-02-21T10:30:00Z',
      metrics: {
        average_execution_time: '2.1s',
        success_rate: '99.2%',
        executions_today: 47,
      },
      preview: {
        input_example: {
          customer_email: 'user@example.com',
          issue_type: 'technical',
          priority: 'medium',
        },
        output_example: {
          ticket_id: 'TK-20260221-001',
          assigned_agent: 'support-agent-2',
          estimated_resolution: '2 hours',
        },
      },
    },
    'demo-workflow-2': {
      id: 'demo-workflow-2',
      name: '鏁版嵁澶勭悊绠￠亾婕旂ず',
      description: '灞曠ず澶ц妯℃暟鎹鐞嗗拰杞崲鐨勮嚜鍔ㄥ寲娴佺▼',
      category: 'data-processing',
      nodes: 12,
      status: 'active',
      last_updated: '2026-02-21T09:15:00Z',
      metrics: {
        average_execution_time: '15.7s',
        success_rate: '98.8%',
        executions_today: 23,
      },
      preview: {
        input_example: {
          data_source: 'sales_database',
          processing_type: 'monthly_report',
          filters: { region: 'APAC', year: 2026 },
        },
        output_example: {
          report_generated: true,
          records_processed: 15420,
          file_location: '/reports/monthly_sales_apac_2026.xlsx',
        },
      },
    },
    'sample-workflow-1': {
      id: 'sample-workflow-1',
      name: '鍏ヨ亴娴佺▼鑷姩,
      description: '鏂板憳宸ュ叆鑱岀殑瀹屾暣鑷姩鍖栧鐞嗘祦,
      category: 'hr-automation',
      nodes: 6,
      status: 'active',
      last_updated: '2026-02-20T16:45:00Z',
      metrics: {
        average_execution_time: '1.8s',
        success_rate: '99.7%',
        executions_today: 12,
      },
      preview: {
        input_example: {
          employee_name: '寮犱笁',
          department: '鎶€鏈儴',
          position: '杞欢宸ョ▼,
          start_date: '2026-03-01',
        },
        output_example: {
          onboarding_tasks: 15,
          setup_completed: 12,
          pending_items: ['闂ㄧ鍗″埗, '閰嶇疆', '鍩硅瀹夋帓'],
        },
      },
    },
  };

  return (
    workflowTemplates[workflowId] || {
      id: workflowId,
      name: `婕旂ず宸ヤ綔${workflowId}`,
      description: '婕旂ず鐢ㄥ伐浣滄祦妯℃澘',
      category: 'demo',
      nodes: 5,
      status: 'active',
      last_updated: new Date().toISOString(),
    }
  );
}

async function getRecentExecutions(workflowId: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 妯℃嫙鎵ц鏁版嵁锛堝疄闄呴」鐩腑搴旇巒8n鑾峰彇鐪熷疄鎵ц璁板綍    const mockExecutions = [
      {
        id: `exec_${Date.now()}_1`,
        workflow_id: workflowId,
        status: 'success',
        started_at: new Date(Date.now() - 300000).toISOString(),
        completed_at: new Date(Date.now() - 297000).toISOString(),
        duration: 3000,
        input_data_size: '1.2KB',
        output_data_size: '2.8KB',
      },
      {
        id: `exec_${Date.now()}_2`,
        workflow_id: workflowId,
        status: 'success',
        started_at: new Date(Date.now() - 600000).toISOString(),
        completed_at: new Date(Date.now() - 596500).toISOString(),
        duration: 3500,
        input_data_size: '0.8KB',
        output_data_size: '1.9KB',
      },
      {
        id: `exec_${Date.now()}_3`,
        workflow_id: workflowId,
        status: 'failed',
        started_at: new Date(Date.now() - 900000).toISOString(),
        completed_at: new Date(Date.now() - 899000).toISOString(),
        duration: 1000,
        error: '杈撳叆鏁版嵁鏍煎紡閿欒',
        input_data_size: 'invalid',
        output_data_size: '0KB',
      },
    ];

    return mockExecutions;
  } catch (error) {
    console.error('鑾峰彇鎵ц璁板綍澶辫触:', error);
    return [];
  }
}

// POST 鏂规硶鐢ㄤ簬瑙﹀彂婕旂ず鎵ц
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workflowId, inputData } = body;

    if (!workflowId) {
      return NextResponse.json({ error: '缂哄皯宸ヤ綔娴両D' }, { status: 400 });
    }

    if (!DEMO_WORKFLOWS.includes(workflowId)) {
      return NextResponse.json(
        {
          error: '宸ヤ綔娴佷笉瀛樺湪鎴栨棤鏉冭,
          code: 'WORKFLOW_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // 妯℃嫙宸ヤ綔娴佹墽    const executionResult = await simulateWorkflowExecution(
      workflowId,
      inputData
    );

    // 璁板綍鎵ц浜嬩欢
    await trackWorkflowDemo(workflowId);

    return NextResponse.json({
      success: true,
      message: '宸ヤ綔娴佹紨绀烘墽琛屽畬,
      data: executionResult,
    });
  } catch (error) {
    console.error('宸ヤ綔娴佹紨绀烘墽琛岄敊', error);
    return NextResponse.json(
      {
        error: '宸ヤ綔娴佹紨绀烘墽琛屽け,
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

async function simulateWorkflowExecution(workflowId: string, inputData: any) {
  // 妯℃嫙鎵ц寤惰繜
  await new Promise(resolve =>
    setTimeout(resolve, 2000 + Math.random() * 3000)
  );

  return {
    execution_id: `demo_${workflowId}_${Date.now()}`,
    workflow_id: workflowId,
    status: 'completed',
    result: {
      processed_nodes: Math.floor(Math.random() * 10) + 5,
      success_rate: '95%',
      output_summary: '婕旂ず宸ヤ綔娴佹墽琛屾垚鍔熷畬,
      sample_output: {
        data: '杩欐槸妯℃嫙鐨勮緭鍑烘暟,
        timestamp: new Date().toISOString(),
        workflow: workflowId,
      },
    },
    timing: {
      total_duration: 2000 + Math.random() * 3000,
      started_at: new Date(
        Date.now() - 2000 - Math.random() * 3000
      ).toISOString(),
      completed_at: new Date().toISOString(),
    },
  };
}

async function trackWorkflowDemo(workflowId: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    (await supabase.from('marketing_events').insert({
      event_type: 'demo_try',
      role: 'demo_user',
      page_path: '/demo/workflow',
      source: 'workflow_demo_api',
      user_agent: 'Workflow Demo API Client',
      session_id: `wf_demo_${Date.now()} as any`,
      created_at: new Date().toISOString(),
    })) as any;
  } catch (error) {
    console.error('璁板綍宸ヤ綔娴佹紨绀轰簨跺け', error);
  }
}

