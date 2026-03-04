import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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
  metrics?: Record<string, any>;
}

// 鑾峰彇绯荤粺鍛婅
export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth-token');

    if (!authCookie) {
      return NextResponse.json({ error: '鏈巿鏉冭? }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const severity = searchParams.get('severity') || '';

    // 妯℃嫙鍛婅鏁版嵁
    const alerts: SystemAlert[] = [
      {
        id: 'alert_001',
        title: 'CPU浣跨敤鐜囪繃?,
        description: '鏈嶅姟鍣–PU浣跨敤鐜囪揪?8.5%锛岃秴杩囬璀﹂槇?0%',
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
        title: '纾佺洏绌洪棿涓嶈冻',
        description: '鏍瑰垎鍖轰娇鐢ㄧ巼杈惧埌72.8%锛屾帴?0%鐨勫嵄闄╅槇?,
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
        title: '鏁版嵁搴撹繛鎺ユ暟寮傚父',
        description: '鏁版嵁搴撹繛鎺ユ暟绐佺劧婵€澧炶嚦156涓紝瓒呭嚭姝ｅ父鑼冨洿',
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
        title: 'API鍝嶅簲鏃堕棿寤惰繜',
        description: '鏍稿績API骞冲潎鍝嶅簲鏃堕棿杈惧埌120ms锛屽奖鍝嶇敤鎴蜂綋?,
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
        title: '瀹夊叏鐧诲綍灏濊瘯寮傚父',
        description: '妫€娴嬪埌澶ч噺澶辫触鐨勭櫥褰曞皾璇曪紝鍙兘瀛樺湪鏆村姏鐮磋В鏀诲嚮',
        severity: 'high',
        category: 'security',
        status: 'active',
        created_at: '2024-01-20T16:10:00Z',
        metrics: {
          failed_attempts: 45,
          time_window: '1灏忔椂',
        },
      },
    ];

    // 鏍规嵁鍙傛暟杩囨护鍛婅
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
    console.error('鑾峰彇绯荤粺鍛婅澶辫触:', error);
    return NextResponse.json({ error: '鑾峰彇绯荤粺鍛婅澶辫触' }, { status: 500 });
  }
}

// 澶勭悊鍛婅锛堢‘?瑙ｅ喅?export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth-token');

    if (!authCookie) {
      return NextResponse.json({ error: '鏈巿鏉冭? }, { status: 401 });
    }

    const body = await request.json();
    const { action, alertId, userId } = body;

    // 妯℃嫙鍛婅澶勭悊
    console.log(`${action} 鍛婅:`, alertId, '鎿嶄綔?', userId);

    return NextResponse.json({
      success: true,
      message: `鍛婅?{action === 'acknowledge' ? '纭' : '瑙ｅ喅'}`,
    });
  } catch (error) {
    console.error('澶勭悊鍛婅澶辫触:', error);
    return NextResponse.json({ error: '澶勭悊鍛婅澶辫触' }, { status: 500 });
  }
}

