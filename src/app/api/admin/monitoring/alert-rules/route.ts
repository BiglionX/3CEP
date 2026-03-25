import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/monitoring/alert-rules
 * 获取所有告警规则
 */
export async function GET(request: NextRequest) {
  try {
    // 验证权限
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    // 初始化 Supabase 客户端
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 获取所有告警规则
    const { data: rules, error } = await supabase
      .from('alert_rules')
      .select('*')
      .order('priority', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: rules || [],
    });
  } catch (error) {
    console.error('获取告警规则失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: `系统错误：${error instanceof Error ? error.message : '未知错误'}`,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/monitoring/alert-rules
 * 创建或更新告警规则
 */
export async function POST(request: NextRequest) {
  try {
    // 验证权限
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    // 解析请求体
    const body = await request.json();
    const {
      id,
      name,
      metric,
      condition,
      threshold,
      priority,
      notificationChannels,
      enabled,
    } = body;

    // 参数验证
    if (!name || !metric || !condition || threshold === undefined) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 初始化 Supabase 客户端
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let result;
    let error;

    if (id) {
      // 更新现有规则
      ({ data: result, error } = await supabase
        .from('alert_rules')
        .update({
          name,
          metric,
          condition,
          threshold,
          priority,
          notification_channels: notificationChannels,
          enabled: enabled !== false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single());
    } else {
      // 创建新规则
      ({ data: result, error } = await supabase
        .from('alert_rules')
        .insert({
          name,
          metric,
          condition,
          threshold,
          priority: priority || 'medium',
          notification_channels: notificationChannels || ['email'],
          enabled: enabled !== false,
        })
        .select()
        .single());
    }

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: id ? '规则已更新' : '规则已创建',
    });
  } catch (error) {
    console.error('保存告警规则失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: `系统错误：${error instanceof Error ? error.message : '未知错误'}`,
      },
      { status: 500 }
    );
  }
}
