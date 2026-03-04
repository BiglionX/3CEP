import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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

// 鑾峰彇绯荤粺鐩戞帶鎸囨爣
export async function GET() {
  try {
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth-token');

    if (!authCookie) {
      return NextResponse.json({ error: '鏈巿鏉冭? }, { status: 401 });
    }

    // 妯℃嫙鐩戞帶鎸囨爣鏁版嵁
    const metrics: MonitoringMetric[] = [
      {
        id: 'cpu_usage',
        name: 'CPU浣跨敤?,
        value: 68.5,
        unit: '%',
        threshold: 80,
        status: 'warning',
        trend: 'up',
        last_updated: new Date().toISOString(),
      },
      {
        id: 'memory_usage',
        name: '鍐呭瓨浣跨敤?,
        value: 45.2,
        unit: '%',
        threshold: 85,
        status: 'normal',
        trend: 'stable',
        last_updated: new Date().toISOString(),
      },
      {
        id: 'disk_usage',
        name: '纾佺洏浣跨敤?,
        value: 72.8,
        unit: '%',
        threshold: 90,
        status: 'warning',
        trend: 'up',
        last_updated: new Date().toISOString(),
      },
      {
        id: 'network_traffic',
        name: '缃戠粶娴侀噺',
        value: 1250,
        unit: 'Mbps',
        threshold: 2000,
        status: 'normal',
        trend: 'down',
        last_updated: new Date().toISOString(),
      },
      {
        id: 'database_connections',
        name: '鏁版嵁搴撹繛鎺ユ暟',
        value: 156,
        unit: '锟?,
        threshold: 200,
        status: 'normal',
        trend: 'stable',
        last_updated: new Date().toISOString(),
      },
      {
        id: 'active_users',
        name: '娲昏穬鐢ㄦ埛?,
        value: 892,
        unit: '锟?,
        threshold: 1000,
        status: 'normal',
        trend: 'up',
        last_updated: new Date().toISOString(),
      },
      {
        id: 'api_response_time',
        name: 'API鍝嶅簲鏃堕棿',
        value: 120,
        unit: 'ms',
        threshold: 500,
        status: 'normal',
        trend: 'stable',
        last_updated: new Date().toISOString(),
      },
      {
        id: 'error_rate',
        name: '閿欒?,
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
    console.error('鑾峰彇鐩戞帶鎸囨爣澶辫触:', error);
    return NextResponse.json({ error: '鑾峰彇鐩戞帶鎸囨爣澶辫触' }, { status: 500 });
  }
}

