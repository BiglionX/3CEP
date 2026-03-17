import { NextRequest, NextResponse } from 'next/server';
import {
  createEnterpriseAnalyticsService,
  AnalyticsKPIService,
} from '@/lib/analytics-kpi-service';
import { supabase } from '@/lib/supabase';

// 获取企业ID的辅助函数
async function getEnterpriseId(userId: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('enterprise_users')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('获取企业ID失败:', error);
    throw new Error('无法获取企业信息');
  }
}

// 验证用户权限
async function verifyEnterpriseAccess(
  userId: string,
  enterpriseId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('enterprise_users')
      .select('is_admin')
      .eq('user_id', userId)
      .eq('id', enterpriseId)
      .single();

    if (error) return false;
    return true;
  } catch (error) {
    return false;
  }
}

// GET /api/enterprise/analytics - 获取企业分析数据
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const enterpriseId = searchParams.get('enterpriseId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const kpiName = searchParams.get('kpiName');
    const interval =
      (searchParams.get('interval') as 'daily' | 'weekly' | 'monthly') ||
      'monthly';

    // 从会话中获取用户ID（简化实现，实际应该从认证中间件获取）
    const authHeader = request.headers.get('authorization');
    const userId = authHeader?.replace('Bearer ', '') || 'demo-user';

    if (!enterpriseId) {
      return NextResponse.json({ error: '缺少企业ID参数' }, { status: 400 });
    }

    // 验证用户权限
    const hasAccess = await verifyEnterpriseAccess(userId, enterpriseId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: '无权限访问该企业数据' },
        { status: 403 }
      );
    }

    const analyticsService = createEnterpriseAnalyticsService(enterpriseId);

    // 根据参数返回不同的数据
    if (kpiName && startDate && endDate) {
      // 获取时间序列数据
      const timeSeriesData = await analyticsService.getTimeSeriesData(
        enterpriseId,
        kpiName,
        new Date(startDate),
        new Date(endDate),
        interval
      );
      return NextResponse.json({ data: timeSeriesData });
    } else {
      // 获取完整的分析数据
      const dateRange =
        startDate && endDate
          ? {
              from: new Date(startDate),
              to: new Date(endDate),
            }
          : undefined;

      const analyticsData = await analyticsService.getEnterpriseAnalytics(
        enterpriseId,
        dateRange
      );
      return NextResponse.json(analyticsData);
    }
  } catch (error) {
    console.error('获取分析数据失败:', error);
    return NextResponse.json(
      {
        error: '获取分析数据失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

// POST /api/enterprise/analytics/recalculate - 重新计算指标
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { enterpriseId } = body;

    // 从会话中获取用户ID
    const authHeader = request.headers.get('authorization');
    const userId = authHeader?.replace('Bearer ', '') || 'demo-user';

    if (!enterpriseId) {
      return NextResponse.json({ error: '缺少企业ID参数' }, { status: 400 });
    }

    // 验证用户权限（需要管理员权限）
    const { data, error } = await supabase
      .from('enterprise_users')
      .select('is_admin')
      .eq('user_id', userId)
      .eq('id', enterpriseId)
      .single();

    if (error || !data?.is_admin) {
      return NextResponse.json({ error: '无权限执行此操作' }, { status: 403 });
    }

    const analyticsService = createEnterpriseAnalyticsService(enterpriseId);
    await analyticsService.recalculateAllMetrics(enterpriseId);

    return NextResponse.json({
      success: true,
      message: '指标重新计算完成',
    });
  } catch (error) {
    console.error('重新计算指标失败:', error);
    return NextResponse.json(
      {
        error: '重新计算指标失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

// GET /api/enterprise/analytics/alerts - 获取KPI告警
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const enterpriseId = searchParams.get('enterpriseId');
    const status = searchParams.get('status') || 'active';

    // 从会话中获取用户ID
    const authHeader = request.headers.get('authorization');
    const userId = authHeader?.replace('Bearer ', '') || 'demo-user';

    if (!enterpriseId) {
      return NextResponse.json({ error: '缺少企业ID参数' }, { status: 400 });
    }

    // 验证用户权限
    const hasAccess = await verifyEnterpriseAccess(userId, enterpriseId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: '无权限访问该企业数据' },
        { status: 403 }
      );
    }

    const analyticsService = createEnterpriseAnalyticsService(enterpriseId);
    const alerts = analyticsService.getKPIAlerts();

    // 过滤状态
    const filteredAlerts =
      status === 'all'
        ? alerts
        : alerts.filter(alert => {
            // 这里可以根据实际需求过滤
            return true;
          });

    return NextResponse.json({ alerts: filteredAlerts });
  } catch (error) {
    console.error('获取告警失败:', error);
    return NextResponse.json(
      {
        error: '获取告警失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

// GET /api/enterprise/analytics/export - 导出分析报告
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const enterpriseId = searchParams.get('enterpriseId');
    const format =
      (searchParams.get('format') as 'csv' | 'json' | 'pdf') || 'json';

    // 从会话中获取用户ID
    const authHeader = request.headers.get('authorization');
    const userId = authHeader?.replace('Bearer ', '') || 'demo-user';

    if (!enterpriseId) {
      return NextResponse.json({ error: '缺少企业ID参数' }, { status: 400 });
    }

    // 验证用户权限
    const hasAccess = await verifyEnterpriseAccess(userId, enterpriseId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: '无权限访问该企业数据' },
        { status: 403 }
      );
    }

    const analyticsService = createEnterpriseAnalyticsService(enterpriseId);
    const exportData = await analyticsService.exportAnalyticsReport(
      enterpriseId,
      format
    );

    if (format === 'csv') {
      return new NextResponse(exportData.content, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${exportData.filename}"`,
        },
      });
    } else {
      return NextResponse.json(exportData);
    }
  } catch (error) {
    console.error('导出报告失败:', error);
    return NextResponse.json(
      {
        error: '导出报告失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

// PUT /api/enterprise/analytics/config - 更新分析配置
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { enterpriseId, configKey, configValue } = body;

    // 从会话中获取用户ID
    const authHeader = request.headers.get('authorization');
    const userId = authHeader?.replace('Bearer ', '') || 'demo-user';

    if (!enterpriseId || !configKey) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 验证用户权限（需要管理员权限）
    const { data, error } = await supabase
      .from('enterprise_users')
      .select('is_admin')
      .eq('user_id', userId)
      .eq('id', enterpriseId)
      .single();

    if (error || !data?.is_admin) {
      return NextResponse.json({ error: '无权限执行此操作' }, { status: 403 });
    }

    // 更新配置到数据库
    const { error: updateError } = await supabase
      .from('enterprise_analytics_config')
      .upsert(
        {
          enterprise_id: enterpriseId,
          config_key: configKey,
          config_value: configValue,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'enterprise_id,config_key' }
      );

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: '配置更新成功',
    });
  } catch (error) {
    console.error('更新配置失败:', error);
    return NextResponse.json(
      {
        error: '更新配置失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

// 处理不同的HTTP方法
export async function handler(request: NextRequest) {
  const { method } = request;

  switch (method) {
    case 'GET':
      const pathname = request.nextUrl.pathname;
      if (pathname.includes('/alerts')) {
        return GET(request);
      } else if (pathname.includes('/export')) {
        return GET(request);
      } else {
        return GET(request);
      }
    case 'POST':
      return POST(request);
    case 'PUT':
      return PUT(request);
    default:
      return NextResponse.json({ error: '不支持的HTTP方法' }, { status: 405 });
  }
}
