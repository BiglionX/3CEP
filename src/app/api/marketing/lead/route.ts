import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      role,
      name,
      company,
      email,
      phone,
      useCase,
      source,
      utmSource,
      utmMedium,
      utmCampaign,
    } = body;

    // 鍙傛暟楠岃瘉
    if (!email || !name) {
      return NextResponse.json(
        { error: '濮撳悕鍜岄偖绠变负蹇呭～? },
        { status: 400 }
      );
    }

    // 閭鏍煎紡楠岃瘉
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '璇疯緭鍏ユ湁鏁堢殑閭鍦板潃' },
        { status: 400 }
      );
    }

    // 鍒涘缓Supabase瀹㈡埛?    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 妫€鏌ユ槸鍚﹀凡瀛樺湪鐩稿悓閭鐨勭嚎?    const { data: existingLeads, error: checkError } = await supabase
      .from('leads')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (checkError) {
      console.error('妫€鏌ラ噸澶嶇嚎绱㈠け?', checkError);
    } else if (existingLeads && existingLeads.length > 0) {
      return NextResponse.json(
        {
          error: '璇ラ偖绠卞凡缁忔彁浜よ繃鐢宠锛岃鍕块噸澶嶆彁?,
          existing: true,
        },
        { status: 409 }
      );
    }

    // 鎻掑叆绾跨储鏁版嵁
    const { data, error } = await supabase
      .from('leads')
      .insert({
        role: role || 'other',
        name,
        company: company || null,
        email,
        phone: phone || null,
        use_case: useCase || null,
        source: source || 'landing_page',
        utm_source: utmSource || null,
        utm_medium: utmMedium || null,
        utm_campaign: utmCampaign || null,
        status: 'new',
      } as any)
      .select();

    if (error) {
      console.error('鎻掑叆绾跨储澶辫触:', error);
      return NextResponse.json(
        { error: '鎻愪氦澶辫触锛岃绋嶅悗閲嶈瘯' },
        { status: 500 }
      );
    }

    // 瑙﹀彂n8n宸ヤ綔?    const n8nIntegration = await import('@/lib/n8n-integration');
    await n8nIntegration.processLead(data[0]);

    // 璁板綍鎴愬姛浜嬩欢
    (await trackMarketingEvent('lead_submit', {
      role: role || 'other',
      source: source || 'landing_page',
      utm_source: utmSource,
    })) as any;

    return NextResponse.json({
      success: true,
      message: '鎰熻阿鎮ㄧ殑鍏虫敞锛佹垜浠細灏藉揩鑱旂郴鎮?,
      leadId: data[0].id,
    });
  } catch (error) {
    console.error('澶勭悊绾跨储鎻愪氦閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊? }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'new';
    const role = searchParams.get('role') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const offset = (page - 1) * limit;

    // 鍒涘缓Supabase瀹㈡埛?    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 鏋勫缓鏌ヨ
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (role) {
      query = query.eq('role', role);
    }

    // 鍒嗛〉
    const { data, error, count } = await query.range(
      offset,
      offset + limit - 1
    );

    if (error) {
      console.error('鏌ヨ绾跨储澶辫触:', error);
      return NextResponse.json({ error: '鏌ヨ澶辫触' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('澶勭悊绾跨储鏌ヨ閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊? }, { status: 500 });
  }
}

async function trackMarketingEvent(
  eventType: string,
  properties: Record<string, any> = {}
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from('marketing_events').insert({
      event_type: eventType,
      role: properties.role,
      source: properties.source,
      utm_source: properties.utm_source,
      created_at: new Date().toISOString(),
    } as any);

    if (error) {
      console.error('璁板綍钀ラ攢浜嬩欢澶辫触:', error);
    }
  } catch (error) {
    console.error('璁板綍钀ラ攢浜嬩欢寮傚父:', error);
  }
}

