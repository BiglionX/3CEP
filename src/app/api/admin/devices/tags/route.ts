import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface DeviceTag {
  id: string;
  name: string;
  color: string;
  device_count: number;
  created_at: string;
  updated_at: string;
}

// 获取设备标签列表
export async function GET() {
  return apiPermissionMiddleware(
    null as any,
    async () => {
      try {
        const cookieStore = cookies();
        const authCookie = cookieStore.get('auth-token');

        if (!authCookie) {
          return NextResponse.json({ error: '未授权访问' }, { status: 401 });
        }

        // 模拟标签数据
        const tags: DeviceTag[] = [
          {
            id: 'tag_001',
            name: '高优先级',
            color: '#ef4444',
            device_count: 5,
            created_at: '2024-01-01T10:00:00Z',
            updated_at: '2024-01-20T15:30:00Z',
          },
          {
            id: 'tag_002',
            name: '需要维护',
            color: '#f59e0b',
            device_count: 12,
            created_at: '2024-01-05T09:30:00Z',
            updated_at: '2024-01-18T16:45:00Z',
          },
          {
            id: 'tag_003',
            name: '新设备',
            color: '#10b981',
            device_count: 8,
            created_at: '2024-01-10T14:20:00Z',
            updated_at: '2024-01-19T11:15:00Z',
          },
          {
            id: 'tag_004',
            name: 'VIP客户',
            color: '#8b5cf6',
            device_count: 3,
            created_at: '2024-01-12T16:45:00Z',
            updated_at: '2024-01-20T09:30:00Z',
          },
        ];

        return NextResponse.json(tags);
      } catch (error) {
        console.error('获取设备标签失败:', error);
        return NextResponse.json(
          { error: '获取设备标签失败' },
          { status: 500 }
        );
      }
    },
    'devices_read'
  );
}

// 创建新的设备标签
export async function POST(request: NextRequest) {
  return apiPermissionMiddleware(
    request,
    async () => {
      try {
        const cookieStore = cookies();
        const authCookie = cookieStore.get('auth-token');

        if (!authCookie) {
          return NextResponse.json({ error: '未授权访问' }, { status: 401 });
        }

        const body = await request.json();
        const { name, color } = body;

        if (!name) {
          return NextResponse.json(
            { error: '标签名称不能为空' },
            { status: 400 }
          );
        }

        // 模拟创建标签
        const newTag: DeviceTag = {
          id: `tag_${Date.now()}`,
          name,
          color: color || '#3b82f6',
          device_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // console.log('创建设备标签:', newTag);

        return NextResponse.json(newTag, { status: 201 });
      } catch (error) {
        console.error('创建设备标签失败:', error);
        return NextResponse.json(
          { error: '创建设备标签失败' },
          { status: 500 }
        );
      }
    },
    'devices_read'
  );
}
