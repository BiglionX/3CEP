/**
 * 璁惧绠＄悊 API 绔偣锛堝甫绉熸埛楠岃瘉 * 婕旂ず濡備綍浣跨敤 requireTenant 涓棿 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import {
  requireTenant,
  getUserTenantContext,
} from '@/tech/middleware/require-tenant';

export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 鑾峰彇绉熸埛涓婁笅    const tenantContext = await getUserTenantContext(request);

    if (!tenantContext.success) {
      return NextResponse.json({ error: tenantContext.error }, { status: 401 });
    }

    const { tenantId, userId, role } = tenantContext;

    // 鑾峰彇鏌ヨ鍙傛暟
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // 鏌ヨ璇ョ鎴蜂笅鐨勮澶囷紙鑷姩搴旂敤绉熸埛杩囨护    const {
      data: devices,
      error,
      count,
    } = await supabase
      .from('devices')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId) // 鍏抽敭锛氬彧鏌ヨ褰撳墠绉熸埛鐨勬暟      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('鑾峰彇璁惧鍒楄〃澶辫触:', error);
      return NextResponse.json({ error: '鑾峰彇璁惧鍒楄〃澶辫触' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: devices || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      tenantInfo: {
        tenantId,
        userRole: role,
      },
    });
  } catch (error: any) {
    console.error('璁惧 API 閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 鑾峰彇绉熸埛涓婁笅    const tenantContext = await getUserTenantContext(request);

    if (!tenantContext.success) {
      return NextResponse.json({ error: tenantContext.error }, { status: 401 });
    }

    const { tenantId, userId, role } = tenantContext;

    // 瑙ｆ瀽璇眰    const body = await request.json();

    // 楠岃瘉蹇呰瀛楁
    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: '璁惧鍚嶇О鍜岀被鍨嬩负蹇呭～ },
        { status: 400 }
      );
    }

    // 鍒涘缓璁惧璁板綍锛堣嚜鍔ㄥ叧鑱斿綋鍓嶇鎴凤級
    const { data: device, error } = await supabase
      .from('devices')
      .insert({
        name: body.name.trim(),
        type: body.type.trim(),
        description: body.trim() || null,
        status: body.status || 'active',
        tenant_id: tenantId, // 鍏抽敭锛氳嚜鍔ㄨ缃鎴稩D
        created_by: userId,
      } as any)
      .select()
      .single();

    if (error) {
      console.error('鍒涘缓璁惧澶辫触:', error);
      return NextResponse.json(
        { error: '鍒涘缓璁惧澶辫触', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: '璁惧鍒涘缓鎴愬姛',
        data: device,
      },
      { status: 201 }
    ) as any;
  } catch (error: any) {
    console.error('鍒涘缓璁惧閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 鑾峰彇绉熸埛涓婁笅    const tenantContext = await getUserTenantContext(request);

    if (!tenantContext.success) {
      return NextResponse.json({ error: tenantContext.error }, { status: 401 });
    }

    const { tenantId, userId, role } = tenantContext;

    // 瑙ｆ瀽璇眰    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: '璁惧ID涓哄繀濉」' }, { status: 400 });
    }

    // 楠岃瘉鐢ㄦ埛鏄惁鏈夋潈鏇存柊璇ヨ澶囷紙蹇呴』灞炰簬鍚屼竴绉熸埛    const { data: existingDevice, error: checkError } = await supabase
      .from('devices')
      .select('id, tenant_id')
      .eq('id', id)
      .eq('tenant_id', tenantId) // 鍏抽敭锛氱‘淇濊澶囧睘浜庡綋鍓嶇      .single();

    if (checkError || !existingDevice) {
      return NextResponse.json(
        { error: '璁惧涓嶅鍦ㄦ垨犳潈璁块棶' },
        { status: 404 }
      );
    }

    // 鎵ц鏇存柊
    const { data: updatedDevice, error } = await supabase
      .from('devices')
      .update({
        ...updateData,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('鏇存柊璁惧澶辫触:', error);
      return NextResponse.json(
        { error: '鏇存柊璁惧澶辫触', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '璁惧鏇存柊鎴愬姛',
      data: updatedDevice,
    });
  } catch (error: any) {
    console.error('鏇存柊璁惧閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 鑾峰彇绉熸埛涓婁笅    const tenantContext = await getUserTenantContext(request);

    if (!tenantContext.success) {
      return NextResponse.json({ error: tenantContext.error }, { status: 401 });
    }

    const { tenantId, userId, role } = tenantContext;

    // 鑾峰彇璁惧ID
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('id');

    if (!deviceId) {
      return NextResponse.json({ error: '璁惧ID涓哄繀濉」' }, { status: 400 });
    }

    // 楠岃瘉鐢ㄦ埛鏄惁鏈夋潈鍒犻櫎璇ヨ    const { data: existingDevice, error: checkError } = await supabase
      .from('devices')
      .select('id, tenant_id')
      .eq('id', deviceId)
      .eq('tenant_id', tenantId)
      .single();

    if (checkError || !existingDevice) {
      return NextResponse.json(
        { error: '璁惧涓嶅鍦ㄦ垨犳潈璁块棶' },
        { status: 404 }
      );
    }

    // 鎵ц杞垹    const { error } = await supabase
      .from('devices')
      .update({
        status: 'deleted',
        deleted_by: userId,
        deleted_at: new Date().toISOString(),
      } as any)
      .eq('id', deviceId);

    if (error) {
      console.error('鍒犻櫎璁惧澶辫触:', error);
      return NextResponse.json(
        { error: '鍒犻櫎璁惧澶辫触', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '璁惧鍒犻櫎鎴愬姛',
    });
  } catch (error: any) {
    console.error('鍒犻櫎璁惧閿欒:', error);
    return NextResponse.json({ error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊 }, { status: 500 });
  }
}

