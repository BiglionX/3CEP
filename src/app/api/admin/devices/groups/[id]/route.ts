import { NextResponse } from 'next/server';
import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';
import { cookies } from 'next/headers';

// 更新设备分组
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  return apiPermissionMiddleware(
    arguments[0],
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
      return NextResponse.json({ error: '分组名称不能为空' }, { status: 400 });
    }

    // 模拟更新分组
    const updatedGroup = {
      id: params.id,
      name,
      description: description || '',
      color: color || '#3b82f6',
      device_count: 0, // 这里应该是实际的设备数量
      created_at: '2024-01-01T10:00:00Z',
      updated_at: new Date().toISOString(),
    };

    console.log('更新设备分组:', params.id, updatedGroup);

    return NextResponse.json(updatedGroup);
  } catch (error) {
    console.error('更新设备分组失败:', error);
    return NextResponse.json({ error: '更新设备分组失败' }, { status: 500 });
  }

    },
    'devices_read'
  );

// 删除设备分组
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  try {
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth-token');

    if (!authCookie) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 模拟删除分组
    console.log('删除设备分组:', params.id);

    return NextResponse.json({
      success: true,
      message: '设备分组删除成功',
    });
  } catch (error) {
    console.error('删除设备分组失败:', error);
    return NextResponse.json({ error: '删除设备分组失败' }, { status: 500 });
  }

    },
    'devices_read'
  );
