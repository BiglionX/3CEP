// 鐗╂祦绠＄悊API璺敱澶勭悊?import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// 鍙戣揣鍗曟暟鎹被鍨嬪畾?interface Shipment {
  id: string;
  shipment_number: string;
  order_id: string;
  carrier: string;
  transport_mode: 'sea' | 'air' | 'land' | 'rail';
  origin: string;
  destination: string;
  status:
    | 'pending'
    | 'confirmed'
    | 'in_transit'
    | 'customs'
    | 'delivered'
    | 'delayed';
  planned_departure: string;
  actual_departure?: string;
  estimated_arrival: string;
  actual_arrival?: string;
  weight: number;
  volume: number;
  packages: number;
  tracking_number: string;
  container_number?: string;
  vessel_name?: string;
  flight_number?: string;
  driver_info?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// 璇锋眰鍙傛暟绫诲瀷
interface ShipmentQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  transport_mode?: string;
  carrier?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
}

// GET /api/foreign-trade/shipments - 鑾峰彇鍙戣揣鍗曞垪?export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { searchParams } = new URL(request.url);
    const params: ShipmentQueryParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      status: searchParams.get('status') || undefined,
      transport_mode: searchParams.get('transport_mode') || undefined,
      carrier: searchParams.get('carrier') || undefined,
      search: searchParams.get('search') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
    };

    // 鏋勫缓鏌ヨ
    let query = supabase
      .from('foreign_trade_shipments')
      .select(
        `
        *,
        order:foreign_trade_orders(order_number, type, partner_id),
        partner:foreign_trade_partners(name, country),
        created_by_user:users(email, full_name)
      `,
        { count: 'exact' }
      )
      .range((params.page - 1) * params.limit, params.page * params.limit - 1);

    // 娣诲姞绛涢€夋潯?    if (params.status) {
      query = query.eq('status', params.status);
    }

    if (params.transport_mode) {
      query = query.eq('transport_mode', params.transport_mode);
    }

    if (params.carrier) {
      query = query.eq('carrier', params.carrier);
    }

    if (params.search) {
      query = query.or(
        `shipment_number.ilike.%${params.search}%,tracking_number.ilike.%${params.search}%,order.order_number.ilike.%${params.search}%`
      );
    }

    if (params.start_date) {
      query = query.gte('planned_departure', params.start_date);
    }

    if (params.end_date) {
      query = query.lte('planned_departure', params.end_date);
    }

    // 鎵ц鏌ヨ
    const { data, error, count } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      throw new Error(error.message);
    }

    // 璁＄畻缁熻鏁版嵁
    const stats = {
      total: count || 0,
      inTransit: data?.filter(s => s.status === 'in_transit').length || 0,
      pending: data?.filter(s => s.status === 'pending').length || 0,
      customs: data?.filter(s => s.status === 'customs').length || 0,
      deliveredToday:
        data?.filter(
          s =>
            s.status === 'delivered' &&
            new Date(s.actual_arrival || '').toDateString() ===
              new Date().toDateString()
        ).length || 0,
    };

    return NextResponse.json({
      success: true,
      data: data || [],
      stats,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / params.limit),
      },
    });
  } catch (error) {
    console.error('鑾峰彇鍙戣揣鍗曞垪琛ㄩ敊?', error);
    return NextResponse.json(
      {
        success: false,
        error: '鑾峰彇鍙戣揣鍗曞垪琛ㄥけ?,
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// POST /api/foreign-trade/shipments - 鍒涘缓鏂板彂璐у崟
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const body = await request.json();
    const {
      order_id,
      carrier,
      transport_mode,
      origin,
      destination,
      planned_departure,
      estimated_arrival,
      weight,
      volume,
      packages,
      tracking_number,
      container_number,
      vessel_name,
      flight_number,
      driver_info,
      notes,
    } = body;

    // 楠岃瘉蹇呴渶瀛楁
    if (
      !order_id ||
      !carrier ||
      !transport_mode ||
      !origin ||
      !destination ||
      !planned_departure ||
      !estimated_arrival ||
      !weight ||
      !volume ||
      !packages ||
      !tracking_number
    ) {
      return NextResponse.json(
        {
          success: false,
          error: '缂哄皯蹇呴渶瀛楁',
          message:
            '璁㈠崟ID銆佹壙杩愬晢銆佽繍杈撴柟寮忋€佽捣杩愬湴銆佺洰鐨勫湴銆佽鍒掑嚭鍙戞椂闂淬€侀璁″埌杈炬椂闂淬€侀噸閲忋€佷綋绉€佷欢鏁板拰杩借釜鍙蜂负蹇呭～?,
        },
        { status: 400 }
      );
    }

    // 鑾峰彇褰撳墠鐢ㄦ埛
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '鐢ㄦ埛鏈櫥? },
        { status: 401 }
      );
    }

    // 楠岃瘉璁㈠崟鏄惁瀛樺湪涓旂姸鎬佸悎?    const { data: order } = await supabase
      .from('foreign_trade_orders')
      .select('id, status')
      .eq('id', order_id)
      .single();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: '璁㈠崟涓嶅瓨?,
        },
        { status: 404 }
      );
    }

    if (!['confirmed', 'processing'].includes(order.status)) {
      return NextResponse.json(
        {
          success: false,
          error: '璁㈠崟鐘舵€佷笉鍏佽鍙戣揣',
          message: '鍙湁宸茬‘璁ゆ垨澶勭悊涓殑璁㈠崟鎵嶈兘鍒涘缓鍙戣揣?,
        },
        { status: 400 }
      );
    }

    // 鐢熸垚鍙戣揣鍗曞彿
    const shipmentNumber = await generateShipmentNumber();

    // 鎻掑叆鍙戣揣鍗曟暟?    const { data, error } = await supabase
      .from('foreign_trade_shipments')
      .insert({
        shipment_number: shipmentNumber,
        order_id,
        carrier,
        transport_mode,
        origin,
        destination,
        status: 'pending',
        planned_departure,
        estimated_arrival,
        weight,
        volume,
        packages,
        tracking_number,
        container_number: container_number || null,
        vessel_name: vessel_name || null,
        flight_number: flight_number || null,
        driver_info: driver_info || null,
        notes: notes || null,
        created_by: user.id,
      } as any)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // 鏇存柊璁㈠崟鐘舵€佷负宸插彂?    await supabase
      .from('foreign_trade_orders')
      .update({
        status: 'shipped',
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', order_id);

    // 璁板綍鎿嶄綔鏃ュ織
    (await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'CREATE_SHIPMENT',
      table_name: 'foreign_trade_shipments',
      record_id: data.id,
      details: {
        shipment_number: data.shipment_number,
        carrier: data.carrier,
      } as any,
    })) as any;

    return NextResponse.json({
      success: true,
      data,
      message: '鍙戣揣鍗曞垱寤烘垚?,
    });
  } catch (error) {
    console.error('鍒涘缓鍙戣揣鍗曢敊?', error);
    return NextResponse.json(
      {
        success: false,
        error: '鍒涘缓鍙戣揣鍗曞け?,
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// 鎵归噺鏇存柊鍙戣揣鐘?export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const body = await request.json();
    const { shipment_ids, status, actual_departure, actual_arrival, notes } =
      body;

    if (!Array.isArray(shipment_ids) || shipment_ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '鏁版嵁鏍煎紡閿欒',
          message: '璇锋彁渚涘彂璐у崟ID鏁扮粍',
        },
        { status: 400 }
      );
    }

    // 鑾峰彇褰撳墠鐢ㄦ埛
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '鐢ㄦ埛鏈櫥? },
        { status: 401 }
      );
    }

    // 鎵归噺鏇存柊鐘?    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (actual_departure) updateData.actual_departure = actual_departure;
    if (actual_arrival) updateData.actual_arrival = actual_arrival;
    if (notes) updateData.notes = notes;

    const { data, error } = await supabase
      .from('foreign_trade_shipments')
      .update(updateData)
      .in('id', shipment_ids)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    // 璁板綍鎿嶄綔鏃ュ織
    (await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'BATCH_UPDATE_SHIPMENTS',
      table_name: 'foreign_trade_shipments',
      details: {
        count: (data as any)?.(data as any)?.length || 0,
        status,
      } as any,
    })) as any;

    return NextResponse.json({
      success: true,
      data,
      message: `鎴愬姛鏇存柊 ${(data as any)?.(data as any)?.length} 涓彂璐у崟鐘舵€乣,
    });
  } catch (error) {
    console.error('鎵归噺鏇存柊鍙戣揣鐘舵€侀敊?', error);
    return NextResponse.json(
      {
        success: false,
        error: '鎵归噺鏇存柊澶辫触',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// 鐢熸垚鍙戣揣鍗曞彿
async function generateShipmentNumber(): Promise<string> {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `SHP${date}${random}`;
}

