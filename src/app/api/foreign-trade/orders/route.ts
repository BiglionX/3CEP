// 璁㈠崟绠＄悊API璺敱澶勭悊import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// 璁㈠崟鏁版嵁绫诲瀷瀹氫箟
interface Order {
  id: string;
  type: 'import' | 'export';
  order_number: string;
  partner_id: string;
  contract_number: string;
  product_details: any[];
  quantity: number;
  amount: number;
  currency: string;
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  expected_delivery: string;
  actual_delivery: string;
  payment_terms: string;
  shipping_method: string;
  notes: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// 璇眰鍙傛暟绫诲瀷
interface OrderQueryParams {
  page: number;
  limit: number;
  status: string;
  type: string;
  partner_id: string;
  search: string;
  start_date: string;
  end_date: string;
}

// 鍝嶅簲鏍煎紡
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error: string;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// GET /api/foreign-trade/orders - 鑾峰彇璁㈠崟鍒楄〃
export async function GET(request: Request) {
  // 浣跨敤鏈嶅姟绔鎴风
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { searchParams } = new URL(request.url);
    const params: OrderQueryParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      status: searchParams.get('status') || undefined,
      type: searchParams.get('type') || undefined,
      partner_id: searchParams.get('partner_id') || undefined,
      search: searchParams.get('search') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
    };

    // 鏋勫缓鏌ヨ
    const page = params.page || 1;
    const limit = params.limit || 20;

    let query = supabase
      .from('foreign_trade_orders')
      .select(
        `
        *,
        partner:foreign_trade_partners(name, country),
        created_by_user:users(email, full_name)
      `,
        { count: 'exact' }
      )
      .range((page - 1) * limit, page * limit - 1);

    // 娣诲姞绛涢€夋潯    if (params.status) {
      query = query.eq('status', params.status);
    }

    if (params.type) {
      query = query.eq('type', params.type);
    }

    if (params.partner_id) {
      query = query.eq('partner_id', params.partner_id);
    }

    if (params.search) {
      query = query.ilike('order_number', `%${params.search}%`);
    }

    if (params.start_date) {
      query = query.gte('created_at', params.start_date);
    }

    if (params.end_date) {
      query = query.lte('created_at', params.end_date);
    }

    // 鎵ц鏌ヨ
    const { data, error, count } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      throw new Error(error.message);
    }

    const response: ApiResponse<Order[]> = {
      success: true,
      data: data || [],
      pagination: {
        page: page,
        limit: limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('鑾峰彇璁㈠崟鍒楄〃閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鑾峰彇璁㈠崟鍒楄〃澶辫触',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// POST /api/foreign-trade/orders - 鍒涘缓鏂拌export async function POST(request: Request) {
  // 浣跨敤鏈嶅姟绔鎴风
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await request.json();
    const {
      type,
      partner_id,
      contract_number,
      product_details,
      expected_delivery,
      payment_terms,
      shipping_method,
      priority = 'medium',
      notes,
    } = body;

    // 楠岃瘉蹇呴渶瀛楁
    if (
      !type ||
      !partner_id ||
      !contract_number ||
      !product_details ||
      !expected_delivery
    ) {
      return NextResponse.json(
        {
          success: false,
          error: '缂哄皯蹇呴渶瀛楁',
          message:
            '璁㈠崟绫诲瀷銆佸悎浣滀紮淬€佸悎鍚岀紪鍙枫€佸晢鍝佽鎯呭拰棰勮浜や粯ユ湡涓哄繀濉」',
        },
        { status: 400 }
      );
    }

    // 璁＄畻璁㈠崟鎬婚噾棰濆拰鏁伴噺
    const totalQuantity = product_details.reduce(
      (sum: number, item: any) => sum + (item.quantity || 0),
      0
    );
    const totalAmount = product_details.reduce(
      (sum: number, item: any) =>
        sum + (item.quantity || 0) * (item.unit_price || 0),
      0
    );

    // 鑾峰彇褰撳墠鐢ㄦ埛
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '鐢ㄦ埛鏈櫥 },
        { status: 401 }
      );
    }

    // 鎻掑叆璁㈠崟鏁版嵁
    const { data, error } = await supabase
      .from('foreign_trade_orders')
      .insert({
        type,
        order_number: await generateOrderNumber(type),
        partner_id,
        contract_number,
        product_details,
        quantity: totalQuantity,
        amount: totalAmount,
        currency: 'CNY',
        status: 'pending',
        priority,
        expected_delivery,
        payment_terms,
        shipping_method,
        notes,
        created_by: user.id,
      } as any)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // 璁板綍鎿嶄綔ュ織
    (await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'CREATE_ORDER',
      table_name: 'foreign_trade_orders',
      record_id: data.id,
      details: {
        order_number: data.order_number,
        type,
        amount: data.amount,
      } as any,
    })) as any;

    return NextResponse.json({
      success: true,
      data,
      message: '璁㈠崟鍒涘缓鎴愬姛',
    });
  } catch (error) {
    console.error('鍒涘缓璁㈠崟閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鍒涘缓璁㈠崟澶辫触',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// 鐢熸垚璁㈠崟缂栧彿
async function generateOrderNumber(type: 'import' | 'export'): Promise<string> {
  const prefix = type === 'import'  'PO' : 'SO';
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `${prefix}-${date}-${random}`;
}

