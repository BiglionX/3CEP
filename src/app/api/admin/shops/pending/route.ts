import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { Database } from '@/lib/database.types';

// GET - 鑾峰彇寰呭鏍哥殑搴楅摵鍒楄〃
export async function GET(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    const offset = (page - 1) * pageSize;

    // 鏌ヨ寰呭鏍稿簵    let query = supabase
      .from('repair_shops')
      .select('*', { count: 'exact' })
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    // 娣诲姞鎼滅储鏉′欢
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,contact_person.ilike.%${search}%,city.ilike.%${search}%`
      );
    }

    // 娣诲姞鍒嗙被绛    if (category) {
      query = query.eq('category', category);
    }

    // 鍒嗛〉
    const { data, error, count } = await query.range(
      offset,
      offset + pageSize - 1
    );

    if (error) {
      console.error('鑾峰彇寰呭鏍稿簵哄け', error);
      return NextResponse.json(
        { error: '鑾峰彇鏁版嵁澶辫触', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    console.error('API閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 });
  }
}

// POST - 鎵归噺瀹℃牳鎿嶄綔锛堥€氳繃鎴栭┏鍥烇級
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const { action, ids, rejectionReason } = await request.json();

    if (!action || !ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: '缂哄皯蹇呰鍙傛暟' }, { status: 400 });
    }

    let updateData: any = {};

    if (action === 'approve') {
      updateData = {
        status: 'approved',
        approved_at: new Date().toISOString(),
      };
    } else if (action === 'reject') {
      if (!rejectionReason) {
        return NextResponse.json(
          { error: '椹冲洖鎿嶄綔蹇呴』鎻愪緵椹冲洖鍘熷洜' },
          { status: 400 }
        );
      }
      updateData = {
        status: 'rejected',
        rejection_reason: rejectionReason,
        rejected_at: new Date().toISOString(),
      };
    } else {
      return NextResponse.json({ error: '涓嶆敮鎸佺殑鎿嶄綔绫诲瀷' }, { status: 400 });
    }

    // 鎵归噺鏇存柊搴楅摵鐘    const { data, error } = await supabase
      .from('repair_shops')
      .update(updateData as any)
      .in('id', ids);

    if (error) {
      console.error('鎵归噺瀹℃牳鎿嶄綔澶辫触:', error);
      return NextResponse.json(
        { error: '鎿嶄綔澶辫触', details: error.message },
        { status: 500 }
      );
    }

    // 濡傛灉鏄€氳繃瀹℃牳锛岄渶瑕佺粰搴椾富鐢ㄦ埛娣诲姞shop_owner瑙掕壊
    if (action === 'approve') {
      // 鑾峰彇瀹℃牳氳繃鐨勫簵轰俊      const { data: approvedShops } = await supabase
        .from('repair_shops')
        .select('id, owner_user_id')
        .in('id', ids);

      // 涓烘瘡涓簵虹殑搴椾富娣诲姞shop_owner瀛愯      if (approvedShops) {
        for (const shop of approvedShops) {
          if (shop.owner_user_id) {
            // 鑾峰彇鐢ㄦ埛褰撳墠鐨剆ub_roles
            const { data: userProfile } = await supabase
              .from('user_profiles_ext')
              .select('sub_roles')
              .eq('user_id', shop.owner_user_id)
              .single();

            // 娣诲姞shop_owner瑙掕壊锛堥伩鍏嶉噸澶嶏級
            const currentSubRoles = userProfile.sub_roles || [];
            const newSubRoles = Array.from(
              new Set([...currentSubRoles, 'shop_owner'])
            );

            await supabase
              .from('user_profiles_ext')
              .update({ sub_roles: newSubRoles } as any)
              .eq('user_id', shop.owner_user_id);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: action === 'approve' ? '瀹℃牳氳繃鎴愬姛' : '椹冲洖鎿嶄綔鎴愬姛',
      affected: ids.length,
    });
  } catch (error) {
    console.error('鎵归噺瀹℃牳API閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 });
  }
}

