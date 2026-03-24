import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';

interface DeviceGroup {
  id: string;
  name: string;
  description: string;
  color: string;
  device_count: number;
  created_at: string;
  updated_at: string;
}

// 鑾峰彇璁惧鍒嗙粍鍒楄〃
export async function GET() {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  try {
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth-token');

    if (!authCookie) {
      return NextResponse.json({ error: '鏈巿鏉冭 }, { status: 401 });
    }

    // 妯℃嫙鍒嗙粍鏁版嵁
    const groups: DeviceGroup[] = [
      {
        id: 'group_001',
        name: '鍔炲叕璁惧',
        description: '鐢ㄤ簬ュ父鍔炲叕鐨勮,
        color: '#3b82f6',
        device_count: 15,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-20T15:30:00Z',
      },
      {
        id: 'group_002',
        name: '娴嬭瘯璁惧',
        description: '涓撻棬鐢ㄤ簬娴嬭瘯鐨勮,
        color: '#10b981',
        device_count: 8,
        created_at: '2024-01-05T09:30:00Z',
        updated_at: '2024-01-18T16:45:00Z',
      },
      {
        id: 'group_003',
        name: '澶囩敤璁惧',
        description: '浣滀负澶囩敤鐨勮,
        color: '#f59e0b',
        device_count: 12,
        created_at: '2024-01-10T14:20:00Z',
        updated_at: '2024-01-19T11:15:00Z',
      },
    ];

    return NextResponse.json(groups);
  } catch (error) {
    console.error('鑾峰彇璁惧鍒嗙粍澶辫触:', error);
    return NextResponse.json({ error: '鑾峰彇璁惧鍒嗙粍澶辫触' }, { status: 500 });
  }

    },
    'devices_read'
  );

// 鍒涘缓鏂扮殑璁惧鍒嗙粍
export async function POST(request: Request) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  try {
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth-token');

    if (!authCookie) {
      return NextResponse.json({ error: '鏈巿鏉冭 }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, color } = body;

    if (!name) {
      return NextResponse.json({ error: '鍒嗙粍鍚嶇О涓嶈兘涓虹┖' }, { status: 400 });
    }

    // 妯℃嫙鍒涘缓鍒嗙粍
    const newGroup: DeviceGroup = {
      id: `group_${Date.now()}`,
      name,
      description: description || '',
      color: color || '#3b82f6',
      device_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('鍒涘缓璁惧鍒嗙粍:', newGroup);

    return NextResponse.json(newGroup, { status: 201 });
  } catch (error) {
    console.error('鍒涘缓璁惧鍒嗙粍澶辫触:', error);
    return NextResponse.json({ error: '鍒涘缓璁惧鍒嗙粍澶辫触' }, { status: 500 });
  }

    },
    'devices_read'
  );

