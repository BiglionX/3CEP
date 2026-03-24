/**
 * 告警规则管理 API
 *
 * GET /api/admin/alerts/rules - 获取所有告警规则
 * POST /api/admin/alerts/rules - 创建告警规则
 * PUT /api/admin/alerts/rules/:id - 更新告警规则
 * DELETE /api/admin/alerts/rules/:id - 删除告警规则
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET 请求：获取所有告警规则
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const enabled = searchParams.get('enabled');

    let query = supabase.from('alert_rules').select('*');

    if (enabled !== null && enabled !== undefined) {
      query = query.eq('enabled', enabled === 'true');
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('获取告警规则失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : '获取失败',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST 请求：创建告警规则
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: 验证管理员权限
    const body = await request.json();

    const newRule = {
      name: body.name,
      description: body.description,
      rule_type: body.rule_type,
      resource_type: body.resource_type,
      resource_id: body.resource_id,
      condition: body.condition,
      threshold: body.threshold,
      notification_channels: body.notification_channels,
      notification_recipients: body.notification_recipients,
      priority: body.priority || 'warning',
      cooldown_period: body.cooldown_period || 3600,
      enabled: body.enabled !== undefined ? body.enabled : true,
    };

    const { data, error } = await supabase
      .from('alert_rules')
      .insert(newRule)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: '告警规则创建成功',
      data,
    });
  } catch (error) {
    console.error('创建告警规则失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_FAILED',
          message: error instanceof Error ? error.message : '创建失败',
        },
      },
      { status: 500 }
    );
  }
}
