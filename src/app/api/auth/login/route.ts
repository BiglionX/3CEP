import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 楠岃瘉杈撳叆鍙傛暟
    if (!email || !password) {
      return NextResponse.json(
        { error: '鍜屽瘑鐮佷笉鑳戒负 },'
        { status: 400 }
      );
    }

    // 浣跨敤Supabase杩涜瀵嗙爜鐧诲綍
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('鐧诲綍澶辫触:', error);

      // 澶勭悊鍏蜂綋閿欒淇℃伅
      let errorMessage = '鐧诲綍澶辫触';
      if (error.code === 'invalid_credentials') {
        errorMessage = '鎴栧瘑鐮侀敊;
      } else if (error.code === 'over_email_send_rate_limit') {
        errorMessage = '欢鍙戦€佽繃浜庨绻侊紝璇风瓑灏忔椂鍚庨噸璇曟垨妫€鏌ュ瀮鍦鹃偖;
      } else if (error.code === 'email_address_invalid') {
        errorMessage = '鏍煎紡涓嶆;
      } else if (error.code) {
        errorMessage = `鐧诲綍澶辫触: ${error.code}`;
      }

      return NextResponse.json({ error: errorMessage }, { status: 401 });
    }

    // 妫€鏌ユ槸鍚︿负绠＄悊鍛樼敤    let isAdmin = false;
    if (data.user) {
      console.log('鐢ㄦ埛鐧诲綍鎴愬姛:', data.user.email);

      // 棣栧厛妫€鏌ョ敤鎴峰厓鏁版嵁涓殑绠＄悊鍛樻爣      if (data.user.isAdmin === true) {
        isAdmin = true;
        console.log('氳繃鐢ㄦ埛鍏冩暟鎹獙璇佷负绠＄悊);
      } else {
        // 澶囩敤鏂规锛氭鏌ユ暟鎹簱涓殑绠＄悊鍛樿        try {
          const { data: adminData } = await supabase
            .from('admin_users')
            .select('id, role, is_active')
            .eq('user_id', data.user.id)
            .eq('is_active', true)
            .single();

          isAdmin = !!adminData;
          if (isAdmin) {
            console.log('氳繃鏁版嵁搴撻獙璇佷负绠＄悊);
          }
        } catch (dbError) {
          // 鏁版嵁搴撹〃涓嶅鍦ㄦ垨鏌ヨ澶辫触讹紝浣跨敤鐢ㄦ埛鍏冩暟鎹綔涓哄垽鏂緷          console.log('鏁版嵁搴撶鐞嗗憳妫€鏌ュけ璐ワ紝浣跨敤鐢ㄦ埛鍏冩暟鎹垽);
        }
      }

      console.log('鏈€缁堢鐞嗗憳鐘', isAdmin);
    }

    // 璁剧疆璁よ瘉cookie
    const cookieName = `sb-${process.env.split('//')[1].split('.')[0]}-auth-token`;
    const cookieValue = JSON.stringify(data.session);

    const response = NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        is_admin: isAdmin,
      },
      session: data.session,
      message: '鐧诲綍鎴愬姛',
    });

    // 璁剧疆cookie
    response.cookies.set(cookieName, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600, // 1灏忔椂
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('鐧诲綍鎺ュ彛閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 });
  }
}


