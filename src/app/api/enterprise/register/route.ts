import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 鍒濆鍖朣upabase瀹㈡埛const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      companyName,
      businessLicense,
      contactPerson,
      phone,
      email,
      password,
    } = body;

    // 鍙傛暟楠岃瘉
    if (!companyName || !contactPerson || !phone || !email || !password) {
      return NextResponse.json(
        { success: false, error: '璇峰～鍐欐墍鏈夊繀濉瓧 },
        { status: 400 }
      );
    }

    // 楠岃瘉鏍煎紡
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: '璇疯緭鍏ユ湁鏁堢殑鍦板潃' },
        { status: 400 }
      );
    }

    // 妫€鏌ヤ紒涓氭槸鍚﹀凡瀛樺湪
    const { data: existingCompany } = await supabase
      .from('enterprise_users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingCompany) {
      return NextResponse.json(
        { success: false, error: '璇ラ偖绠卞凡琚敞 },
        { status: 409 }
      );
    }

    // 鍒涘缓佷笟鐢ㄦ埛
    const { data: userData, error: userError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: companyName,
          business_license: businessLicense,
          contact_person: contactPerson,
          phone: phone,
          user_type: 'enterprise',
        },
      },
    });

    if (userError) {
      console.error('鍒涘缓鐢ㄦ埛澶辫触:', userError);
      return NextResponse.json(
        { success: false, error: '鐢ㄦ埛鍒涘缓澶辫触' },
        { status: 500 }
      );
    }

    if (!userData.user) {
      return NextResponse.json(
        { success: false, error: '鐢ㄦ埛鍒涘缓澶辫触' },
        { status: 500 }
      );
    }

    // 鍦ㄤ紒涓氱敤鎴疯〃涓垱寤鸿    const { data: enterpriseData, error: enterpriseError } = await supabase
      .from('enterprise_users')
      .insert({
        user_id: userData.user.id,
        company_name: companyName,
        business_license: businessLicense || null,
        contact_person: contactPerson,
        phone: phone,
        email: email,
        status: 'pending', // 寰呭鏍哥姸      } as any)
      .select()
      .single();

    if (enterpriseError) {
      console.error('鍒涘缓佷笟璁板綍澶辫触:', enterpriseError);
      // 濡傛灉佷笟璁板綍鍒涘缓澶辫触锛屽垹闄ゅ凡鍒涘缓鐨勭敤      await supabase.auth.admin.deleteUser(userData.user.id);
      return NextResponse.json(
        { success: false, error: '佷笟淇℃伅鍒涘缓澶辫触' },
        { status: 500 }
      );
    }

    // 璁板綍鎿嶄綔ュ織
    (await supabase.from('audit_logs').insert({
      user_id: userData.user.id,
      action: 'enterprise_register',
      resource_type: 'enterprise_user',
      resource_id: enterpriseData.id,
      details: {
        company_name: companyName,
        contact_person: contactPerson,
        email: email,
      } as any,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
    })) as any;

    return NextResponse.json(
      {
        success: true,
        message: '佷笟娉ㄥ唽鎴愬姛锛岀瓑寰呭,
        data: {
          userId: userData.user.id,
          companyId: enterpriseData.id,
          companyName: enterpriseData.company_name,
          email: enterpriseData.email,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('佷笟娉ㄥ唽閿欒:', error);
    return NextResponse.json(
      { success: false, error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 },
      { status: 500 }
    );
  }
}

