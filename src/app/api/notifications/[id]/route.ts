import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 模拟通知数据（与主API共享）
const mockNotifications: Record<string, any[]> = {
  user_001: [
    {
      id: 'notif_001',
      title: '新订单提醒',
      content: '您收到了一个新的iPhone 14 Pro屏幕维修订单',
      type: 'info',
      priority: 'high',
      status: 'unread',
      createdAt: new Date(Date.now() - 1000 * 60 * 15),
      userId: 'user_001',
      category: 'orders',
      actionUrl: '/repair-shop/orders/12345',
      icon: 'ShoppingCart',
    },
    {
      id: 'notif_002',
      title: '支付到账',
      content: '客户张女士的维修费用已到账 ¥850',
      type: 'success',
      priority: 'medium',
      status: 'unread',
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
      userId: 'user_001',
      category: 'payments',
      icon: 'DollarSign',
    },
  ],
};

function getUserIdFromToken(token: string): string {
  return 'user_001';
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, status } = body;
    const userId = getUserIdFromToken(token);

    if (!notificationId) {
      return NextResponse.json({ error: '通知ID为必填项' }, { status: 400 });
    }

    if (!['read', 'unread', 'archived'].includes(status)) {
      return NextResponse.json(
        { error: '状态必须为 read、unread 或 archived' },
        { status: 400 }
      );
    }

    const userNotifications = mockNotifications[userId];
    if (!userNotifications) {
      return NextResponse.json({ error: '未找到用户通知' }, { status: 404 });
    }

    const notification = userNotifications.find(n => n.id === notificationId);
    if (!notification) {
      return NextResponse.json({ error: '未找到指定通知' }, { status: 404 });
    }

    // 更新状态
    const oldStatus = notification.status;
    notification.status = status;

    if (status === 'read' && !notification.readAt) {
      notification.readAt = new Date();
    }

    return NextResponse.json({
      success: true,
      data: {
        notification: {
          ...notification,
          oldStatus,
        },
      },
      message: `通知状态已更新为 ${status}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('更新通知状态失败:', error);
    return NextResponse.json(
      {
        error: '更新通知状态失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const url = new URL(request.url);
    const notificationId = url.searchParams.get('id');
    const userId = getUserIdFromToken(token);

    if (!notificationId) {
      return NextResponse.json({ error: '通知ID为必填项' }, { status: 400 });
    }

    const userNotifications = mockNotifications[userId];
    if (!userNotifications) {
      return NextResponse.json({ error: '未找到用户通知' }, { status: 404 });
    }

    const notificationIndex = userNotifications.findIndex(
      n => n.id === notificationId
    );
    if (notificationIndex === -1) {
      return NextResponse.json({ error: '未找到指定通知' }, { status: 404 });
    }

    // 删除通知
    const deletedNotification = userNotifications.splice(
      notificationIndex,
      1
    )[0];

    return NextResponse.json({
      success: true,
      data: {
        deletedNotification,
      },
      message: '通知删除成功',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('删除通知失败:', error);
    return NextResponse.json(
      {
        error: '删除通知失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
