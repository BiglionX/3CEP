// 鍚堜綔浼欎即绠＄悊API璺敱澶勭悊?import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// 鍚堜綔浼欎即鏁版嵁绫诲瀷瀹氫箟
interface Partner {
  id: string;
  name: string;
  type: 'supplier' | 'customer';
  country: string;
  contact_person: string;
  email: string;
  phone: string;
  website?: string;
  address?: string;
  products: string[];
  rating: number;
  cooperation_years: number;
  status: 'active' | 'inactive' | 'pending';
  annual_volume?: number;
  payment_terms?: string;
  credit_limit?: number;
  outstanding_balance?: number;
  contract_expiry?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// 璇锋眰鍙傛暟绫诲瀷
interface PartnerQueryParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  country?: string;
  search?: string;
}

// GET /api/foreign-trade/partners - 鑾峰彇鍚堜綔浼欎即鍒楄〃
export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { searchParams } = new URL(request.url);
    const params: PartnerQueryParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      type: searchParams.get('type') || undefined,
      status: searchParams.get('status') || undefined,
      country: searchParams.get('country') || undefined,
      search: searchParams.get('search') || undefined,
    };

    // 鏋勫缓鏌ヨ
    let query = supabase
      .from('foreign_trade_partners')
      .select('*', { count: 'exact' })
      .range(
        (params.page! - 1) * params.limit!,
        params.page! * params.limit! - 1
      );

    // 娣诲姞绛涢€夋潯?    if (params.type) {
      query = query.eq('type', params.type);
    }

    if (params.status) {
      query = query.eq('status', params.status);
    }

    if (params.country) {
      query = query.eq('country', params.country);
    }

    if (params.search) {
      query = query.or(
        `name.ilike.%${params.search}%,contact_person.ilike.%${params.search}%,email.ilike.%${params.search}%`
      );
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
      active: data?.filter(p => p.status === 'active').length || 0,
      countries: Array.from(new Set(data?.map(p => p.country) || [])).length,
      averageRating: (data as any)?.(data as any)?.length
        ? (
            data.reduce((sum, p) => sum + p.rating, 0) /
            (data as any)?.data.length
          ).toFixed(1)
        : '0.0',
    };

    return NextResponse.json({
      success: true,
      data: data || [],
      stats,
      pagination: {
        page: params.page!,
        limit: params.limit!,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / params.limit!),
      },
    });
  } catch (error) {
    console.error('鑾峰彇鍚堜綔浼欎即鍒楄〃閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鑾峰彇鍚堜綔浼欎即鍒楄〃澶辫触',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// POST /api/foreign-trade/partners - 鍒涘缓鏂板悎浣滀紮?export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await request.json();
    const {
      name,
      type,
      country,
      contact_person,
      email,
      phone,
      website,
      address,
      products,
      payment_terms,
      credit_limit,
      notes,
    } = body;

    // 楠岃瘉蹇呴渶瀛楁
    if (!name || !type || !country || !contact_person || !email || !phone) {
      return NextResponse.json(
        {
          success: false,
          error: '缂哄皯蹇呴渶瀛楁',
          message: '鍚嶇О銆佺被鍨嬨€佸浗瀹躲€佽仈绯讳汉銆侀偖绠卞拰鐢佃瘽涓哄繀濉」',
        },
        { status: 400 }
      );
    }

    // 楠岃瘉閭鏍煎紡
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: '閭鏍煎紡涓嶆?,
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

    // 妫€鏌ュ悎浣滀紮浼存槸鍚﹀凡瀛樺湪
    const { data: existingPartner } = await supabase
      .from('foreign_trade_partners')
      .select('id')
      .eq('name', name)
      .eq('type', type)
      .single();

    if (existingPartner) {
      return NextResponse.json(
        {
          success: false,
          error: '鍚堜綔浼欎即宸插瓨?,
          message: '璇ュ悕绉扮殑鍚堜綔浼欎即宸插瓨?,
        },
        { status: 409 }
      );
    }

    // 鎻掑叆鍚堜綔浼欎即鏁版嵁
    const { data, error } = await supabase
      .from('foreign_trade_partners')
      .insert({
        name,
        type,
        country,
        contact_person,
        email,
        phone,
        website: website || null,
        address: address || null,
        products: products || [],
        rating: 0,
        cooperation_years: 0,
        status: 'pending',
        payment_terms: payment_terms || null,
        credit_limit: credit_limit || null,
        outstanding_balance: 0,
        notes: notes || null,
        created_by: user.id,
      } as any)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // 璁板綍鎿嶄綔鏃ュ織
    (await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'CREATE_PARTNER',
      table_name: 'foreign_trade_partners',
      record_id: data.id,
      details: {
        name: data.name,
        type: data.type,
        country: data.country,
      } as any,
    })) as any;

    return NextResponse.json({
      success: true,
      data,
      message: '鍚堜綔浼欎即鍒涘缓鎴愬姛',
    });
  } catch (error) {
    console.error('鍒涘缓鍚堜綔浼欎即閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鍒涘缓鍚堜綔浼欎即澶辫触',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// 鎵归噺瀵煎叆鍚堜綔浼欎即
export async function PUT(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await request.json();
    const { partners } = body;

    if (!Array.isArray(partners) || partners.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '鏁版嵁鏍煎紡閿欒',
          message: '璇锋彁渚涘悎浣滀紮浼存暟?,
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

    // 楠岃瘉骞跺鐞嗘瘡涓悎浣滀紮?    const validPartners = partners.filter(partner => {
      return (
        partner.name &&
        partner.type &&
        partner.country &&
        partner.contact_person &&
        partner.email &&
        partner.phone
      );
    });

    if (validPartners.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '娌℃湁鏈夋晥鐨勫悎浣滀紮浼存暟?,
        },
        { status: 400 }
      );
    }

    // 鎵归噺鎻掑叆
    const partnerData = validPartners.map(partner => ({
      name: partner.name,
      type: partner.type,
      country: partner.country,
      contact_person: partner.contact_person,
      email: partner.email,
      phone: partner.phone,
      website: partner.website || null,
      address: partner.address || null,
      products: partner.products || [],
      rating: 0,
      cooperation_years: 0,
      status: 'pending',
      payment_terms: partner.payment_terms || null,
      credit_limit: partner.credit_limit || null,
      outstanding_balance: 0,
      notes: partner.notes || null,
      created_by: user.id,
    }));

    const { data, error } = await supabase
      .from('foreign_trade_partners')
      .insert(partnerData)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    // 璁板綍鎿嶄綔鏃ュ織
    (await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'BATCH_IMPORT_PARTNERS',
      table_name: 'foreign_trade_partners',
      details: { count: (data as any)?.(data as any)?.length || 0 } as any,
    })) as any;

    return NextResponse.json({
      success: true,
      data,
      message: `鎴愬姛瀵煎叆 ${(data as any)?.(data as any)?.length} 涓悎浣滀紮浼碻,
    });
  } catch (error) {
    console.error('鎵归噺瀵煎叆鍚堜綔浼欎即閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鎵归噺瀵煎叆澶辫触',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

