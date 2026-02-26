import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 演示工作流ID白名单
const DEMO_WORKFLOWS = ['demo-workflow-1', 'demo-workflow-2', 'sample-workflow-1'];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');
    const includeExecution = searchParams.get('includeExecution') === 'true';

    // 如果指定了工作流ID，返回特定工作流信息
    if (workflowId) {
      if (!DEMO_WORKFLOWS.includes(workflowId)) {
        return NextResponse.json(
          { 
            error: '工作流不存在或无权访问',
            code: 'WORKFLOW_NOT_FOUND'
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
        data: workflowInfo
      });
    }

    // 返回所有演示工作流列表
    const workflows = await Promise.all(
      DEMO_WORKFLOWS.map(id => getDemoWorkflowInfo(id))
    );

    return NextResponse.json({
      success: true,
      data: workflows,
      count: workflows.length
    });

  } catch (error) {
    console.error('获取工作流状态错误:', error);
    return NextResponse.json(
      { 
        error: '获取工作流状态失败',
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}

async function getDemoWorkflowInfo(workflowId: string) {
  // 模拟工作流信息（实际项目中应该从n8n API获取）
  const workflowTemplates: Record<string, any> = {
    'demo-workflow-1': {
      id: 'demo-workflow-1',
      name: '客户支持自动化演示',
      description: '展示如何自动化处理客户支持请求的完整流程',
      category: 'customer-service',
      nodes: 8,
      status: 'active',
      last_updated: '2026-02-21T10:30:00Z',
      metrics: {
        average_execution_time: '2.1s',
        success_rate: '99.2%',
        executions_today: 47
      },
      preview: {
        input_example: {
          customer_email: 'user@example.com',
          issue_type: 'technical',
          priority: 'medium'
        },
        output_example: {
          ticket_id: 'TK-20260221-001',
          assigned_agent: 'support-agent-2',
          estimated_resolution: '2 hours'
        }
      }
    },
    'demo-workflow-2': {
      id: 'demo-workflow-2',
      name: '数据处理管道演示',
      description: '展示大规模数据处理和转换的自动化流程',
      category: 'data-processing',
      nodes: 12,
      status: 'active',
      last_updated: '2026-02-21T09:15:00Z',
      metrics: {
        average_execution_time: '15.7s',
        success_rate: '98.8%',
        executions_today: 23
      },
      preview: {
        input_example: {
          data_source: 'sales_database',
          processing_type: 'monthly_report',
          filters: { region: 'APAC', year: 2026 }
        },
        output_example: {
          report_generated: true,
          records_processed: 15420,
          file_location: '/reports/monthly_sales_apac_2026.xlsx'
        }
      }
    },
    'sample-workflow-1': {
      id: 'sample-workflow-1',
      name: '入职流程自动化',
      description: '新员工入职的完整自动化处理流程',
      category: 'hr-automation',
      nodes: 6,
      status: 'active',
      last_updated: '2026-02-20T16:45:00Z',
      metrics: {
        average_execution_time: '1.8s',
        success_rate: '99.7%',
        executions_today: 12
      },
      preview: {
        input_example: {
          employee_name: '张三',
          department: '技术部',
          position: '软件工程师',
          start_date: '2026-03-01'
        },
        output_example: {
          onboarding_tasks: 15,
          setup_completed: 12,
          pending_items: ['门禁卡制作', '邮箱配置', '培训安排']
        }
      }
    }
  };

  return workflowTemplates[workflowId] || {
    id: workflowId,
    name: `演示工作流 ${workflowId}`,
    description: '演示用工作流模板',
    category: 'demo',
    nodes: 5,
    status: 'active',
    last_updated: new Date().toISOString()
  };
}

async function getRecentExecutions(workflowId: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 模拟执行数据（实际项目中应该从n8n获取真实执行记录）
    const mockExecutions = [
      {
        id: `exec_${Date.now()}_1`,
        workflow_id: workflowId,
        status: 'success',
        started_at: new Date(Date.now() - 300000).toISOString(),
        completed_at: new Date(Date.now() - 297000).toISOString(),
        duration: 3000,
        input_data_size: '1.2KB',
        output_data_size: '2.8KB'
      },
      {
        id: `exec_${Date.now()}_2`,
        workflow_id: workflowId,
        status: 'success',
        started_at: new Date(Date.now() - 600000).toISOString(),
        completed_at: new Date(Date.now() - 596500).toISOString(),
        duration: 3500,
        input_data_size: '0.8KB',
        output_data_size: '1.9KB'
      },
      {
        id: `exec_${Date.now()}_3`,
        workflow_id: workflowId,
        status: 'failed',
        started_at: new Date(Date.now() - 900000).toISOString(),
        completed_at: new Date(Date.now() - 899000).toISOString(),
        duration: 1000,
        error: '输入数据格式错误',
        input_data_size: 'invalid',
        output_data_size: '0KB'
      }
    ];

    return mockExecutions;

  } catch (error) {
    console.error('获取执行记录失败:', error);
    return [];
  }
}

// POST 方法用于触发演示执行
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workflowId, inputData } = body;

    if (!workflowId) {
      return NextResponse.json(
        { error: '缺少工作流ID' },
        { status: 400 }
      );
    }

    if (!DEMO_WORKFLOWS.includes(workflowId)) {
      return NextResponse.json(
        { 
          error: '工作流不存在或无权访问',
          code: 'WORKFLOW_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // 模拟工作流执行
    const executionResult = await simulateWorkflowExecution(workflowId, inputData);

    // 记录执行事件
    await trackWorkflowDemo(workflowId);

    return NextResponse.json({
      success: true,
      message: '工作流演示执行完成',
      data: executionResult
    });

  } catch (error) {
    console.error('工作流演示执行错误:', error);
    return NextResponse.json(
      { 
        error: '工作流演示执行失败',
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}

async function simulateWorkflowExecution(workflowId: string, inputData: any) {
  // 模拟执行延迟
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
  
  return {
    execution_id: `demo_${workflowId}_${Date.now()}`,
    workflow_id: workflowId,
    status: 'completed',
    result: {
      processed_nodes: Math.floor(Math.random() * 10) + 5,
      success_rate: '95%',
      output_summary: '演示工作流执行成功完成',
      sample_output: {
        data: '这是模拟的输出数据',
        timestamp: new Date().toISOString(),
        workflow: workflowId
      }
    },
    timing: {
      total_duration: 2000 + Math.random() * 3000,
      started_at: new Date(Date.now() - 2000 - Math.random() * 3000).toISOString(),
      completed_at: new Date().toISOString()
    }
  };
}

async function trackWorkflowDemo(workflowId: string) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase.from('marketing_events').insert({
      event_type: 'demo_try',
      role: 'demo_user',
      page_path: '/demo/workflow',
      source: 'workflow_demo_api',
      user_agent: 'Workflow Demo API Client',
      session_id: `wf_demo_${Date.now()} as any`,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('记录工作流演示事件失败:', error);
  }
}