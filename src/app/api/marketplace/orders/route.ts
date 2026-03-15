/**
 * 璁㈠崟绠＄悊API璺敱
 * FixCycle 6.0 鏅鸿兘浣撳競鍦哄钩 */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// 妯℃嫙璁㈠崟鏁版嵁
const mockOrders = [
  {
    id: 'order-1',
    order_number: 'ORD-20260301-001',
    user_id: 'user-1',
    status: 'completed',
    total_amount: 249.98,
    token_cost: 1.3,
    items: [
      {
        id: 'item-1',
        agent_id: 'agent-1',
        agent_name: '閿€鍞姪鎵嬫櫤鑳戒綋',
        agent_description: '涓撲笟鐨勯攢鍞璇濆姪,
        price: 99.99,
        token_cost_per_use: 0.5,
        quantity: 1,
        subtotal: 99.99,
        developer_name: 'AI Solutions Inc.',
      },
      {
        id: 'item-2',
        agent_id: 'agent-2',
        agent_name: '閲囪喘鏅鸿兘,
        agent_description: '鏅鸿兘閲囪喘鍐崇瓥鍔╂墜',
        price: 149.99,
        token_cost_per_use: 0.8,
        quantity: 1,
        subtotal: 149.99,
        developer_name: 'Procurement Pro',
      },
    ],
    payment_method: '鏀粯,
    payment_status: 'paid',
    shipping_address: {
      full_name: '寮犱笁',
      email: 'zhangsan@example.com',
      phone: '13800138000',
      address: '鍖椾含甯傛湞闃冲尯xxx琛楅亾xxx,
      city: '鍖椾含',
      postal_code: '100000',
      country: '涓浗',
    },
    created_at: '2026-03-01T10:30:00Z',
    updated_at: '2026-03-01T11:15:00Z',
  },
  {
    id: 'order-2',
    order_number: 'ORD-20260301-002',
    user_id: 'user-1',
    status: 'processing',
    total_amount: 79.99,
    token_cost: 0.3,
    items: [
      {
        id: 'item-3',
        agent_id: 'agent-3',
        agent_name: '瀹㈡湇鏀寔鏈哄櫒,
        agent_description: '24/7鏅鸿兘瀹㈡湇鏀寔',
        price: 79.99,
        token_cost_per_use: 0.3,
        quantity: 1,
        subtotal: 79.99,
        developer_name: 'Customer Care AI',
      },
    ],
    payment_method: '寰俊鏀粯',
    payment_status: 'paid',
    shipping_address: {
      full_name: '鏉庡洓',
      email: 'lisi@example.com',
      phone: '13900139000',
      address: '涓婃捣甯傛郸涓滄柊鍖簒xx璺痻xx,
      city: '涓婃捣',
      postal_code: '200000',
      country: '涓浗',
    },
    created_at: '2026-03-01T14:20:00Z',
    updated_at: '2026-03-01T14:20:00Z',
  },
];

export async function GET(request: Request) {
  try {
    // 楠岃瘉鐢ㄦ埛璁よ瘉
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sb-access-token');

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: '鐢ㄦ埛鏈 },
        { status: 401 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionCookie.value);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '鐢ㄦ埛璁よ瘉澶辫触' },
        { status: 401 }
      );
    }

    // 瑙ｆ瀽鏌ヨ鍙傛暟
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';

    // 杩囨护璁㈠崟鏁版嵁
    let filteredOrders = mockOrders.filter(order => order.user_id === user.id);

    // 鐘舵€佽繃    if (status !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }

    // 鎼滅储杩囨护
    if (search) {
      filteredOrders = filteredOrders.filter(
        order =>
          order.order_number.toLowerCase().includes(search.toLowerCase()) ||
          order.items.some(item =>
            item.agent_name.toLowerCase().includes(search.toLowerCase())
          )
      );
    }

    // 鎺掑簭锛堟寜鍒涘缓堕棿鍊掑簭    filteredOrders.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // 鍒嗛〉
    const total = filteredOrders.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        status,
        search,
      },
    });
  } catch (error: any) {
    console.error('鑾峰彇璁㈠崟鍒楄〃澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鑾峰彇璁㈠崟鍒楄〃澶辫触',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // 楠岃瘉鐢ㄦ埛璁よ瘉
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sb-access-token');

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: '鐢ㄦ埛鏈 },
        { status: 401 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(sessionCookie.value);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: '鐢ㄦ埛璁よ瘉澶辫触' },
        { status: 401 }
      );
    }

    // 瑙ｆ瀽璇眰    const body = await request.json();

    // 楠岃瘉蹇呰瀛楁
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: '璁㈠崟鍟嗗搧涓嶈兘涓虹┖' },
        { status: 400 }
      );
    }

    if (!body.shipping_address) {
      return NextResponse.json(
        { success: false, error: '鏀惰揣鍦板潃涓嶈兘涓虹┖' },
        { status: 400 }
      );
    }

    if (!body.payment_method) {
      return NextResponse.json(
        { success: false, error: '鏀粯鏂瑰紡涓嶈兘涓虹┖' },
        { status: 400 }
      );
    }

    // 璁＄畻璁㈠崟鎬婚
    const totalAmount = body.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    const totalTokens = body.items.reduce(
      (sum: number, item: any) => sum + item.token_cost_per_use * item.quantity,
      0
    );

    // 鐢熸垚璁㈠崟    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-3)}`;

    // 鍒涘缓鏂拌    const newOrder = {
      id: `order-${Date.now()}`,
      order_number: orderNumber,
      user_id: user.id,
      status: 'pending',
      total_amount: parseFloat(totalAmount.toFixed(2)),
      token_cost: parseFloat(totalTokens.toFixed(2)),
      items: body.items.map((item: any) => ({
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        agent_id: item.agent_id,
        agent_name: item.agent_name,
        agent_description: item.agent_description,
        price: item.price,
        token_cost_per_use: item.token_cost_per_use,
        quantity: item.quantity,
        subtotal: parseFloat((item.price * item.quantity).toFixed(2)),
        developer_name: item.developer_name,
      })),
      payment_method: body.payment_method,
      payment_status: 'unpaid',
      shipping_address: {
        full_name: body.shipping_address.full_name,
        email: body.shipping_address.email,
        phone: body.shipping_address.phone,
        address: body.shipping_address.address || '',
        city: body.shipping_address.city || '',
        postal_code: body.shipping_address.postal_code || '',
        country: body.shipping_address.country || '涓浗',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 鍦ㄥ疄闄呭疄鐜颁腑锛岃繖閲屼細淇濆鍒版暟鎹簱
    // await supabase.from('orders').insert(newOrder);

    return NextResponse.json(
      {
        success: true,
        message: '璁㈠崟鍒涘缓鎴愬姛',
        data: newOrder,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('鍒涘缓璁㈠崟澶辫触:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鍒涘缓璁㈠崟澶辫触',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

