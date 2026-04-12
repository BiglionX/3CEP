import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

interface DeviceGroup {
  id: string;
  name: string;
  description: string;
  color: string;
  device_count: number;
  created_at: string;
  updated_at: string;
}

// 获取设备分组列表
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

        // 模拟分组数据
        const groups: DeviceGroup[] = [
          {
            id: 'group_001',
            name: '办公设备',
            description: '用于日常办公的设备',
            color: '#3b82f6',
            device_count: 15,
            created_at: '2024-01-01T10:00:00Z',
            updated_at: '2024-01-20T15:30:00Z',
          },
          {
            id: 'group_002',
            name: '测试设备',
            description: '专门用于测试的设备',
            color: '#10b981',
            device_count: 8,
            created_at: '2024-01-05T09:30:00Z',
            updated_at: '2024-01-18T16:45:00Z',
          },
          {
            id: 'group_003',
            name: '备用设备',
            description: '作为备用的设备',
            color: '#f59e0b',
            device_count: 12,
            created_at: '2024-01-10T14:20:00Z',
            updated_at: '2024-01-19T11:15:00Z',
          },
        ];

        return NextResponse.json(groups);
      } catch (error) {
        console.error('获取设备分组失败:', error);
        return NextResponse.json(
          { error: '获取设备分组失败' },
          { status: 500 }
        );
      }
    },
    'devices_read'
  );
}

// 创建新的设备分组
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
        const { name, description, color } = body;

        if (!name) {
          return NextResponse.json(
            { error: '分组名称不能为空' },
            { status: 400 }
          );
        }

        // 模拟创建分组
        const newGroup: DeviceGroup = {
          id: `group_${Date.now()}`,
          name,
          description: description || '',
          color: color || '#3b82f6',
          device_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // console.log('创建设备分组:', newGroup);

        return NextResponse.json(newGroup, { status: 201 });
      } catch (error) {
        console.error('创建设备分组失败:', error);
        return NextResponse.json(
          { error: '创建设备分组失败' },
          { status: 500 }
        );
      }
    },
    'devices_read'
  );
}
