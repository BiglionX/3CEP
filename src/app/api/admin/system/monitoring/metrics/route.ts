import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

interface MonitoringMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  last_updated: string;
}

// 获取系统监控指标
export async function GET() {
  try {
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth-token');

    if (!authCookie) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 模拟监控指标数据
    const metrics: MonitoringMetric[] = [
      {
        id: 'cpu_usage',
        name: 'CPU 使用率',
        value: 68.5,
        unit: '%',
        threshold: 80,
        status: 'warning',
        trend: 'up',
        last_updated: new Date().toISOString(),
      },
      {
        id: 'memory_usage',
        name: '内存使用率',
        value: 45.2,
        unit: '%',
        threshold: 85,
        status: 'normal',
        trend: 'stable',
        last_updated: new Date().toISOString(),
      },
      {
        id: 'disk_usage',
        name: '磁盘使用率',
        value: 72.8,
        unit: '%',
        threshold: 90,
        status: 'warning',
        trend: 'up',
        last_updated: new Date().toISOString(),
      },
      {
        id: 'network_traffic',
        name: '网络流量',
        value: 1250,
        unit: 'Mbps',
        threshold: 2000,
        status: 'normal',
        trend: 'down',
        last_updated: new Date().toISOString(),
      },
      {
        id: 'database_connections',
        name: '数据库连接数',
        value: 156,
        unit: '个',
        threshold: 200,
        status: 'normal',
        trend: 'stable',
        last_updated: new Date().toISOString(),
      },
      {
        id: 'active_users',
        name: '活跃用户数',
        value: 892,
        unit: '人',
        threshold: 1000,
        status: 'normal',
        trend: 'up',
        last_updated: new Date().toISOString(),
      },
      {
        id: 'api_response_time',
        name: 'API 响应时间',
        value: 120,
        unit: 'ms',
        threshold: 500,
        status: 'normal',
        trend: 'stable',
        last_updated: new Date().toISOString(),
      },
      {
        id: 'error_rate',
        name: '错误率',
        value: 0.2,
        unit: '%',
        threshold: 1.0,
        status: 'normal',
        trend: 'down',
        last_updated: new Date().toISOString(),
      },
    ];

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('获取监控指标失败:', error);
    return NextResponse.json({ error: '获取监控指标失败' }, { status: 500 });
  }
}
