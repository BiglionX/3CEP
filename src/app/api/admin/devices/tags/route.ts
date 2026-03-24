import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';

interface DeviceTag {
  id: string;
  name: string;
  color: string;
  device_count: number;
  created_at: string;
  updated_at: string;
}

// 鑾峰彇璁惧鏍囩鍒楄〃
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

    // 妯℃嫙鏍囩鏁版嵁
    const tags: DeviceTag[] = [
      {
        id: 'tag_001',
        name: '楂樹紭鍏堢骇',
        color: '#ef4444',
        device_count: 5,
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-20T15:30:00Z',
      },
      {
        id: 'tag_002',
        name: '闇€瑕佺淮,
        color: '#f59e0b',
        device_count: 12,
        created_at: '2024-01-05T09:30:00Z',
        updated_at: '2024-01-18T16:45:00Z',
      },
      {
        id: 'tag_003',
        name: '鏂拌,
        color: '#10b981',
        device_count: 8,
        created_at: '2024-01-10T14:20:00Z',
        updated_at: '2024-01-19T11:15:00Z',
      },
      {
        id: 'tag_004',
        name: 'VIP瀹㈡埛',
        color: '#8b5cf6',
        device_count: 3,
        created_at: '2024-01-12T16:45:00Z',
        updated_at: '2024-01-20T09:30:00Z',
      },
    ];

    return NextResponse.json(tags);
  } catch (error) {
    console.error('鑾峰彇璁惧鏍囩澶辫触:', error);
    return NextResponse.json({ error: '鑾峰彇璁惧鏍囩澶辫触' }, { status: 500 });
  }

    },
    'devices_read'
  );

// 鍒涘缓鏂扮殑璁惧鏍囩
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
    const { name, color } = body;

    if (!name) {
      return NextResponse.json({ error: '鏍囩鍚嶇О涓嶈兘涓虹┖' }, { status: 400 });
    }

    // 妯℃嫙鍒涘缓鏍囩
    const newTag: DeviceTag = {
      id: `tag_${Date.now()}`,
      name,
      color: color || '#3b82f6',
      device_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('鍒涘缓璁惧鏍囩:', newTag);

    return NextResponse.json(newTag, { status: 201 });
  } catch (error) {
    console.error('鍒涘缓璁惧鏍囩澶辫触:', error);
    return NextResponse.json({ error: '鍒涘缓璁惧鏍囩澶辫触' }, { status: 500 });
  }

    },
    'devices_read'
  );

