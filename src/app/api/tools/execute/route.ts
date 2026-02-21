/**
 * 系统工具执行 API
 * 提供执行系统管理工具和脚本的功能，带严格的权限验证
 */

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { requirePermission } from '@/middleware/permissions';
import { audit } from '@/lib/audit';

// 白名单工具列表（实际项目中应该从配置文件读取）
const WHITELISTED_TOOLS = [
  'system_health_check',
  'database_backup',
  'cache_clear',
  'log_rotate',
  'performance_monitor'
];

export async function POST(request: Request) {
  // 创建 Supabase 客户端
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 从 cookies 获取会话信息
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('sb-access-token');

  try {
    // 验证用户认证
    if (!sessionCookie) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 设置认证令牌
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionCookie.value);

    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 获取用户角色信息
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!adminUser) {
      return NextResponse.json({ error: '用户权限不足' }, { status: 403 });
    }

    // 构造用户上下文用于权限检查
    const userContext = {
      id: user.id,
      roles: [adminUser.role],
      tenant_id: null
    };

    // 模拟 Express 请求对象用于权限中间件
    const mockReq = {
      user: userContext,
      body: await request.json()
    };

    const mockRes = {
      status: (code: number) => ({
        json: (data: any) => NextResponse.json(data, { status: code })
      })
    };

    // 检查 tools_execute 权限
    const permissionCheck = requirePermission('tools_execute');
    let permissionGranted = true;
    let permissionError = null;

    permissionCheck(mockReq, {
      status: (code: number) => ({
        json: (data: any) => {
          permissionGranted = false;
          permissionError = data;
          return mockRes;
        }
      })
    }, () => {});

    if (!permissionGranted) {
      return NextResponse.json(permissionError, { status: 403 });
    }

    // 解析请求体
    const { toolName, parameters, confirmationToken } = mockReq.body;

    // 验证必要参数
    if (!toolName) {
      return NextResponse.json(
        { error: '缺少工具名称参数' }, 
        { status: 400 }
      );
    }

    // 验证工具是否在白名单中
    if (!WHITELISTED_TOOLS.includes(toolName)) {
      return NextResponse.json(
        { error: '工具不在白名单中' }, 
        { status: 403 }
      );
    }

    // 验证二次确认令牌（高危操作需要额外确认）
    const HIGH_RISK_TOOLS = ['database_backup', 'cache_clear'];
    if (HIGH_RISK_TOOLS.includes(toolName)) {
      if (!confirmationToken) {
        return NextResponse.json(
          { 
            error: '高危操作需要二次确认',
            confirmation_required: true,
            tool: toolName
          }, 
          { status: 400 }
        );
      }
      
      // 这里应该验证确认令牌的有效性
      // 简化处理：检查令牌格式
      if (confirmationToken.length < 10) {
        return NextResponse.json(
          { error: '确认令牌无效' }, 
          { status: 400 }
        );
      }
    }

    // 记录审计日志 - 开始执行
    await audit(
      'tool_execute_start',
      {
        id: user.id,
        type: 'user',
        roles: [adminUser.role],
        tenant_id: null
      },
      'tools',
      {
        tool_name: toolName,
        parameters: parameters || {},
        is_high_risk: HIGH_RISK_TOOLS.includes(toolName),
        confirmation_token: !!confirmationToken
      },
      `tool_${Date.now()}`,
      {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      }
    );

    // 模拟工具执行（实际应该调用具体的工具脚本）
    try {
      // 根据工具名称执行不同逻辑
      let executionResult;
      
      switch (toolName) {
        case 'system_health_check':
          executionResult = {
            status: 'healthy',
            cpu_usage: '45%',
            memory_usage: '68%',
            disk_usage: '32%',
            network_latency: '12ms'
          };
          break;
          
        case 'database_backup':
          executionResult = {
            backup_status: 'initiated',
            backup_id: `backup_${Date.now()}`,
            database: 'main_db',
            size: '2.3GB'
          };
          break;
          
        case 'cache_clear':
          executionResult = {
            cache_cleared: true,
            cleared_items: 1247,
            memory_freed: '156MB'
          };
          break;
          
        case 'log_rotate':
          executionResult = {
            rotated_logs: 15,
            archived_size: '2.1GB',
            compression_ratio: '78%'
          };
          break;
          
        case 'performance_monitor':
          executionResult = {
            metrics_collected: true,
            sample_period: '60s',
            active_connections: 42,
            avg_response_time: '85ms'
          };
          break;
          
        default:
          executionResult = { message: '工具执行完成' };
      }

      const finalResult = {
        success: true,
        toolName,
        executionId: `exec_${Date.now()}`,
        result: executionResult,
        timestamp: new Date().toISOString(),
        duration: Math.floor(Math.random() * 1000) + 100 // 模拟执行时间
      };

      // 记录审计日志 - 执行成功
      await audit(
        'tool_execute_success',
        {
          id: user.id,
          type: 'user',
          roles: [adminUser.role],
          tenant_id: null
        },
        'tools',
        finalResult,
        `tool_${Date.now()}`,
        {
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown'
        }
      );

      return NextResponse.json(finalResult);

    } catch (toolError: any) {
      // 记录审计日志 - 执行失败
      await audit(
        'tool_execute_failed',
        {
          id: user.id,
          type: 'user',
          roles: [adminUser.role],
          tenant_id: null
        },
        'tools',
        {
          toolName,
          error: toolError.message,
          timestamp: new Date().toISOString()
        },
        `tool_${Date.now()}`,
        {
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown'
        }
      );

      return NextResponse.json(
        { 
          error: '工具执行失败',
          details: toolError.message 
        }, 
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('工具执行 API 错误:', error);
    
    // 记录审计日志 - 系统错误
    await audit(
      'tool_execute_error',
      {
        id: 'system',
        type: 'system',
        roles: [],
        tenant_id: null
      },
      'tools',
      {
        error: error.message,
        timestamp: new Date().toISOString()
      },
      `tool_${Date.now()}`,
      {
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      }
    );

    return NextResponse.json(
      { error: '服务器内部错误' }, 
      { status: 500 }
    );
  }
}

// GET 方法用于获取可用工具列表
export async function GET(request: Request) {
  return NextResponse.json({
    available_tools: WHITELISTED_TOOLS,
    high_risk_tools: ['database_backup', 'cache_clear'],
    timestamp: new Date().toISOString()
  });
}