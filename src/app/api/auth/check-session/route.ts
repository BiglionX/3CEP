import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const authHeader = request.headers.get('authorization');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    let session;

    // 樺厛浣跨敤Authorization header涓殑token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data, error } = await supabase.auth.getUser(token);

      if (!error && data.user) {
        session = {
          user: data.user,
        };
      }
    }

    // 濡傛灉header涓病鏈夋湁鏁堢殑token锛屽皾璇曚粠cookie鑾峰彇
    if (!session) {
      // 浣跨敤cookieStore鑾峰彇氳瘽
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (!sessionError && sessionData.session) {
        session = sessionData.session;
      } else {
        // 澶囩敤鏂规锛氫粠cookie涓墜鍔ㄨВ        const cookieHeader = request.headers.get('cookie');
        if (cookieHeader) {
          const supabaseCookieName = `sb-${process.env.split('//')[1].split('.')[0]}-auth-token`;
          const cookieMatch = cookieHeader.match(
            new RegExp(`${supabaseCookieName}=([^;]+)`)
          );

          if (cookieMatch && cookieMatch[1]) {
            try {
              const sessionData = JSON.parse(
                decodeURIComponent(cookieMatch[1])
              );
              if (sessionData && sessionData.user) {
                session = sessionData;
              }
            } catch (parseError) {
              console.log('Cookie瑙ｆ瀽澶辫触:', parseError);
            }
          }
        }
      }
    }

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // 妫€鏌ユ槸鍚︿负绠＄悊    let isAdmin = false;
    let adminRole = null;

    // 棣栧厛妫€鏌ョ敤鎴峰厓鏁版嵁
    if (session.user.isAdmin === true) {
      isAdmin = true;
      adminRole = session.user.user_metadata.role || 'admin';
    } else {
      // 澶囩敤鏂规锛氭鏌ユ暟鎹簱
      try {
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('id, role, is_active')
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .single();

        if (adminUser) {
          isAdmin = true;
          adminRole = adminUser.role;
        }
      } catch (dbError) {
        // 鏁版嵁搴撴鏌ュけ璐ワ紝浣跨敤鐢ㄦ埛鍏冩暟鎹綔涓哄垽鏂緷        console.log('鏁版嵁搴撶鐞嗗憳妫€鏌ュけ璐ワ紝浣跨敤鐢ㄦ埛鍏冩暟鎹垽);
      }
    }

    return NextResponse.json({
      authenticated: true,
      is_admin: isAdmin,
      user: {
        id: session.user.id,
        email: session.user.email,
        isAdmin: isAdmin,
        role: adminRole,
      },
    });
  } catch (error) {
    console.error('氳瘽妫€鏌ュけ', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

