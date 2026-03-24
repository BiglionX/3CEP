/**
 * 监控告警规则 API 路由
 */

import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 告警规则接口
interface AlertRule {
  id?: string;
  name: string;
  metric: string;
  threshold: number;
  operator: '>' | '<' | '>=' | '<=' | '==';
  duration: number; // 持续时间（分钟）
  severity: 'critical' | 'warning' | 'info';
  notification_channels: string[]; // ['email', 'sms', 'webhook']
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * GET /admin/api/alert-rules - 获取所有告警规则
 */
async function getAlertRules() {
  const { data, error } = await supabase
    .from('alert_rules')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ data });
}

/**
 * POST /admin/api/alert-rules - 创建告警规则
 */
async function createAlertRule(req: NextRequest) {
  try {
    const body: AlertRule = await req.json();

    const { data, error } = await supabase
      .from('alert_rules')
      .insert({
        name: body.name,
        metric: body.metric,
        threshold: body.threshold,
        operator: body.operator,
        duration: body.duration,
        severity: body.severity,
        notification_channels: body.notification_channels,
        enabled: body.enabled,
      })
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: '无效的请求体' }, { status: 400 });
  }
}

/**
 * PUT /admin/api/alert-rules/:id - 更新告警规则
 */
async function updateAlertRule(req: NextRequest, id: string) {
  try {
    const body: AlertRule = await req.json();

    const { data, error } = await supabase
      .from('alert_rules')
      .update({
        name: body.name,
        metric: body.metric,
        threshold: body.threshold,
        operator: body.operator,
        duration: body.duration,
        severity: body.severity,
        notification_channels: body.notification_channels,
        enabled: body.enabled,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: '无效的请求体' }, { status: 400 });
  }
}

/**
 * DELETE /admin/api/alert-rules/:id - 删除告警规则
 */
async function deleteAlertRule(id: string) {
  const { error } = await supabase.from('alert_rules').delete().eq('id', id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}

export async function GET(req: NextRequest) {
  return apiPermissionMiddleware(req, getAlertRules, 'monitoring_read');
}

export async function POST(req: NextRequest) {
  return apiPermissionMiddleware(req, createAlertRule, 'monitoring_manage');
}

export async function PUT(req: NextRequest) {
  return apiPermissionMiddleware(
    req,
    async () => {
      const url = new URL(req.url);
      const id = url.searchParams.get('id');

      if (!id) {
        return Response.json({ error: '缺少规则 ID' }, { status: 400 });
      }

      return updateAlertRule(req, id);
    },
    'monitoring_manage'
  );
}

export async function DELETE(req: NextRequest) {
  return apiPermissionMiddleware(
    req,
    async () => {
      const url = new URL(req.url);
      const id = url.searchParams.get('id');

      if (!id) {
        return Response.json({ error: '缺少规则 ID' }, { status: 400 });
      }

      return deleteAlertRule(id);
    },
    'monitoring_manage'
  );
}
