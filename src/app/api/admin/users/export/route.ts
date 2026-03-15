import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 瀵煎嚭鐢ㄦ埛鏁版嵁鎺ュ彛
export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth-token');

    if (!authCookie) {
      return NextResponse.json({ error: '鏈巿鏉冭 }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const filters = searchParams.get('filters');

    // 妯℃嫙鐢ㄦ埛鏁版嵁
    const mockUsers = [
      {
        id: 'user_001',
        username: 'admin',
        email: 'admin@example.com',
        phone: '13800138000',
        role: 'admin',
        status: 'active',
        department: '鎶€鏈儴',
        position: '绯荤粺绠＄悊,
        created_at: '2024-01-01T10:00:00Z',
        last_login: '2024-01-20T15:30:00Z',
      },
      {
        id: 'user_002',
        username: 'manager_zhang',
        email: 'zhang.manager@example.com',
        phone: '13800138001',
        role: 'manager',
        status: 'active',
        department: '杩愯惀,
        position: '杩愯惀缁忕悊',
        created_at: '2024-01-05T09:30:00Z',
        last_login: '2024-01-20T14:20:00Z',
      },
    ];

    if (format === 'csv') {
      // 鐢熸垚CSV鏍煎紡鏁版嵁
      const csvHeaders = [
        '鐢ㄦ埛,
        '',
        '鎵嬫満,
        '瑙掕壊',
        '鐘,
        '閮ㄩ棬',
        '鑱屼綅',
        '鍒涘缓堕棿',
        '鏈€鍚庣櫥,
      ];
      const csvRows = mockUsers.map(user => [
        user.username,
        user.email,
        user.phone || '',
        user.role,
        user.status,
        user.department || '',
        user.position || '',
        new Date(user.created_at).toLocaleString(),
        user.last_login  new Date(user.last_login).toLocaleString() : '',
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(',')),
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv;charset=utf-8',
          'Content-Disposition': 'attachment; filename="users-export.csv"',
        },
      });
    } else if (format === 'excel') {
      // 杩斿洖Excel鏍煎紡鏁版嵁锛堣繖閲岀畝鍖栦负JSON      return NextResponse.json({
        data: mockUsers,
        filename: 'users-export.xlsx',
      });
    } else {
      return NextResponse.json(mockUsers);
    }
  } catch (error) {
    console.error('瀵煎嚭鐢ㄦ埛鏁版嵁澶辫触:', error);
    return NextResponse.json({ error: '瀵煎嚭澶辫触' }, { status: 500 });
  }
}

