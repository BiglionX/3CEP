import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 妯℃嫙閫氱煡鏁版嵁
interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'unread' | 'read' | 'archived';
  createdAt: Date;
  readAt?: Date;
  scheduledTime?: Date;
  userId: string;
  category: string;
  actionUrl?: string;
  icon?: string;
}

// 妯℃嫙鐢ㄦ埛閫氱煡鏁版嵁
const mockNotifications: Record<string, Notification[]> = {
  user_001: [
    {
      id: 'notif_001',
      title: '鏂拌鍗曟彁?,
      content: '鎮ㄦ敹鍒颁簡涓€涓柊鐨刬Phone 14 Pro灞忓箷缁翠慨璁㈠崟',
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
      title: '鏀粯鍒拌处',
      content: '瀹㈡埛寮犲コ澹殑缁翠慨璐圭敤宸插埌?楼850',
      type: 'success',
      priority: 'medium',
      status: 'unread',
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
      userId: 'user_001',
      category: 'payments',
      icon: 'DollarSign',
    },
    {
      id: 'notif_003',
      title: '棰勭害鎻愰啋',
      content: '涓嬪崍3鐐规湁瀹㈡埛棰勭害涓婇棬缁翠慨鏈嶅姟',
      type: 'warning',
      priority: 'medium',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      readAt: new Date(Date.now() - 1000 * 60 * 45),
      userId: 'user_001',
      category: 'appointments',
      icon: 'Calendar',
    },
    {
      id: 'notif_004',
      title: '绯荤粺缁存姢閫氱煡',
      content: '浠婃櫄12鐐瑰皢杩涜绯荤粺缁存姢锛岄璁℃寔?0鍒嗛挓',
      type: 'info',
      priority: 'low',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      readAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
      userId: 'user_001',
      category: 'system',
      icon: 'Settings',
    },
  ],
  user_002: [
    {
      id: 'notif_005',
      title: '搴撳瓨涓嶈冻璀﹀憡',
      content: 'iPhone灞忓箷搴撳瓨浣庝簬瀹夊叏绾匡紝璇峰強鏃惰ˉ?,
      type: 'warning',
      priority: 'high',
      status: 'unread',
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
      userId: 'user_002',
      category: 'inventory',
      icon: 'AlertTriangle',
    },
  ],
};

// 鑾峰彇鐢ㄦ埛ID鐨勮緟鍔╁嚱?function getUserIdFromToken(token: string): string {
  // 瀹為檯搴旂敤涓簲璇ヨВ鏋怞WT token鑾峰彇鐢ㄦ埛ID
  // 杩欓噷绠€鍖栧鐞嗭紝鍋囪token鍖呭惈鐢ㄦ埛淇℃伅
  return 'user_001'; // 榛樿鐢ㄦ埛
}

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: '鏈巿鏉冭? }, { status: 401 });
    }

    const userId = getUserIdFromToken(token);
    const url = new URL(request.url);
    const status =
      (url.searchParams.get('status') as 'unread' | 'read' | 'all') || 'all';
    const category = url.searchParams.get('category') || 'all';
    const limit = parseInt(url.searchParams.get('limit') || '20');

    let userNotifications = mockNotifications[userId] || [];

    // 鏍规嵁鐘舵€佽繃?    if (status !== 'all') {
      userNotifications = userNotifications.filter(
        notif => notif.status === status
      );
    }

    // 鏍规嵁绫诲埆杩囨护
    if (category !== 'all') {
      userNotifications = userNotifications.filter(
        notif => notif.category === category
      );
    }

    // 鎸夋椂闂村€掑簭鎺掑垪
    userNotifications.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // 闄愬埗鏁伴噺
    const notifications = userNotifications.slice(0, limit);

    // 缁熻淇℃伅
    const stats = {
      total: mockNotifications[userId]?.length || 0,
      unread:
        mockNotifications[userId]?.filter(n => n.status === 'unread').length ||
        0,
      read:
        mockNotifications[userId]?.filter(n => n.status === 'read').length || 0,
      archived:
        mockNotifications[userId]?.filter(n => n.status === 'archived')
          .length || 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        stats,
        pagination: {
          page: 1,
          limit,
          total: userNotifications.length,
          hasNext: userNotifications.length > limit,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('鑾峰彇閫氱煡澶辫触:', error);
    return NextResponse.json(
      {
        error: '鑾峰彇閫氱煡澶辫触',
        message: error instanceof Error ? error.message : '鏈煡閿欒',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: '鏈巿鏉冭? }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      content,
      type,
      priority,
      category,
      scheduledTime,
      actionUrl,
    } = body;

    // 楠岃瘉蹇呴渶瀛楁
    if (!title || !content) {
      return NextResponse.json(
        { error: '鏍囬鍜屽唴瀹逛负蹇呭～? },
        { status: 400 }
      );
    }

    const userId = getUserIdFromToken(token);

    // 鍒涘缓鏂伴€氱煡
    const newNotification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      content,
      type: type || 'info',
      priority: priority || 'medium',
      status: 'unread',
      createdAt: new Date(),
      userId,
      category: category || 'general',
      actionUrl,
      scheduledTime: scheduledTime ? new Date(scheduledTime) : undefined,
    };

    // 娣诲姞鍒扮敤鎴烽€氱煡鍒楄〃
    if (!mockNotifications[userId]) {
      mockNotifications[userId] = [];
    }
    mockNotifications[userId].unshift(newNotification); // 娣诲姞鍒板紑?
    // 闄愬埗姣忎釜鐢ㄦ埛鏈€澶氫繚?00鏉￠€氱煡
    if (mockNotifications[userId].length > 100) {
      mockNotifications[userId] = mockNotifications[userId].slice(0, 100);
    }

    return NextResponse.json({
      success: true,
      data: {
        notification: newNotification,
      },
      message: '閫氱煡鍒涘缓鎴愬姛',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('鍒涘缓閫氱煡澶辫触:', error);
    return NextResponse.json(
      {
        error: '鍒涘缓閫氱煡澶辫触',
        message: error instanceof Error ? error.message : '鏈煡閿欒',
      },
      { status: 500 }
    );
  }
}

