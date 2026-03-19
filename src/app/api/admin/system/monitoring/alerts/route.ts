import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

interface SystemAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'system' | 'security' | 'performance' | 'business';
  status: 'active' | 'acknowledged' | 'resolved';
  created_at: string;
  acknowledged_by?: string;
  resolved_at?: string;
  metrics: Record<string, any>;
}

// 获取系统告警
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('auth-token');

    if (!authCookie) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const severity = searchParams.get('severity') || '';

    // 模拟告警数据
    const alerts: SystemAlert[] = [
      {
        id: 'alert_001',
        title: 'CPU 使用率过高',
        description: '服务器 CPU 使用率达 68.5%，超过预警阈值 80%',
        severity: 'medium',
        category: 'performance',
        status: 'active',
        created_at: '2024-01-20T15:30:00Z',
        metrics: {
          cpu_usage: 68.5,
          threshold: 80,
        },
      },
      {
        id: 'alert_002',
        title: '磁盘空间不足',
        description: '根分区使用率达到 72.8%，接近 90% 的危险阈值',
        severity: 'medium',
        category: 'system',
        status: 'active',
        created_at: '2024-01-20T14:45:00Z',
        metrics: {
          disk_usage: 72.8,
          threshold: 90,
        },
      },
      {
        id: 'alert_003',
        title: '数据库连接数异常',
        description: '数据库连接数突然激增至 156 个，超出正常范围',
        severity: 'low',
        category: 'performance',
        status: 'acknowledged',
        created_at: '2024-01-20T13:20:00Z',
        acknowledged_by: 'admin',
        metrics: {
          connections: 156,
          normal_range: '50-120',
        },
      },
      {
        id: 'alert_004',
        title: 'API 响应时间延迟',
        description: '核心 API 平均响应时间达到 120ms，影响用户体验',
        severity: 'low',
        category: 'performance',
        status: 'resolved',
        created_at: '2024-01-20T12:15:00Z',
        resolved_at: '2024-01-20T13:30:00Z',
        metrics: {
          response_time: 120,
          threshold: 500,
        },
      },
      {
        id: 'alert_005',
        title: '安全登录尝试异常',
        description: '检测到大量失败的登录尝试，可能存在暴力破解攻击',
        severity: 'high',
        category: 'security',
        status: 'active',
        created_at: '2024-01-20T16:10:00Z',
        metrics: {
          failed_attempts: 45,
          time_window: '1 小时',
        },
      },
    ];

    // 根据参数过滤告警
    let filteredAlerts = alerts;
    if (status !== 'all') {
      filteredAlerts = filteredAlerts.filter(alert => alert.status === status);
    }
    if (severity) {
      filteredAlerts = filteredAlerts.filter(
        alert => alert.severity === severity
      );
    }

    return NextResponse.json(filteredAlerts);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('获取系统告警失败:', error);
    return NextResponse.json({ error: '获取系统告警失败' }, { status: 500 });
  }
}

// 处理告警（确认/解决）
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('auth-token');

    if (!authCookie) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const body = await request.json();
    const { action, alertId, userId } = body;

    // 记录告警处理日志（生产环境应使用专业日志服务）
    // eslint-disable-next-line no-console
    console.log(`${action} 告警:`, alertId, '操作人', userId);

    return NextResponse.json({
      success: true,
      message: `告警已${action === 'acknowledge' ? '确认' : '解决'}`,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('处理告警失败:', error);
    return NextResponse.json({ error: '处理告警失败' }, { status: 500 });
  }
}
