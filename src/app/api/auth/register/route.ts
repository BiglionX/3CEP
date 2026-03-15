import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, password, confirmPassword, name } = await request.json();

    // 楠岃瘉杈撳叆鍙傛暟
    if (!email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: '銆佸瘑鐮佸拰纭瀵嗙爜涓嶈兘涓虹┖' },
        { status: 400 }
      );
    }

    // 涓ユ牸鐨勯偖绠辨牸寮忛獙    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '璇疯緭鍏ユ湁鏁堢殑鍦板潃锛堜緥濡傦細user@example.com },'
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: '涓ゆ杈撳叆鐨勫瘑鐮佷笉涓€ },'
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json({ error: '瀵嗙爜闀垮害鑷冲皯6 }, { status: 400 });
    }

    // 浣跨敤Supabase杩涜鐢ㄦ埛娉ㄥ唽
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || '',
        },
      },
    });

    if (error) {
      console.error('娉ㄥ唽澶辫触:', error);

      // 澶勭悊鍏蜂綋閿欒淇℃伅
      let errorMessage = '娉ㄥ唽澶辫触';
      if (error.code === 'email_address_invalid') {
        errorMessage = '鏍煎紡涓嶆;
      } else if (error.code === 'over_email_send_rate_limit') {
        errorMessage =
          '绯荤粺欢鍙戦€佺箒蹇欙紝璇风◢鍚庡啀璇曟垨妫€鏌ュ瀮鍦鹃偖讹紙杩欎笉鏄偍鐨勯偖绠遍棶棰橈級';
      } else if (
        error.message.includes('already registered') ||
        error.code === 'user_already_exists'
      ) {
        errorMessage = '璇ラ偖绠卞凡琚敞;
      } else if (
        error.message.includes('weak password') ||
        error.code === 'weak_password'
      ) {
        errorMessage = '瀵嗙爜寮哄害涓嶅';
      } else if (error.message.includes('invalid email')) {
        errorMessage = '鏍煎紡涓嶆;
      } else if (error.code) {
        errorMessage = `娉ㄥ唽澶辫触: ${error.message || error.code}`;
      }

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // 娉ㄥ唽鎴愬姛鍚庯紝鍙互夋嫨灏嗙敤鎴蜂俊鎭鍌ㄥ埌鑷畾涔夎〃    if (data.user) {
      try {
        // 瀛樺偍棰濆鐨勭敤鎴蜂俊        await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email,
          name: name || '',
          created_at: new Date().toISOString(),
        } as any);
      } catch (profileError) {
        console.warn('瀛樺偍鐢ㄦ埛妗ｆ淇℃伅澶辫触:', profileError);
        // 涓嶅奖鍝嶄富瑕佹敞鍐屾祦      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.id,
        email: data.email,
      },
      message: '娉ㄥ唽鎴愬姛锛岃妫€鏌ラ偖绠辩‘璁よ处,'
    }) as any;
  } catch (error) {
    console.error('娉ㄥ唽鎺ュ彛閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 });
  }
}


