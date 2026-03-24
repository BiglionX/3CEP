import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

export async function GET(request: Request) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';
    const status = searchParams.get('status') || 'active';

    const offset = (page - 1) * limit;

    // 鏋勫缓鏌ヨ鏉′欢
    let query = supabase
      .from('parts_complete_view')
      .select('*', { count: 'exact' });

    // 鎼滅储鏉′欢
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,part_number.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    // 鍒嗙被绛    if (category) {
      query = query.eq('category', category);
    }

    // 鍝佺墝绛    if (brand) {
      query = query.eq('brand', brand);
    }

    // 鐘舵€佺瓫    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // 鍒嗛〉鍜屾帓    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
        totalItems: count || 0,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error('鑾峰彇閰嶄欢鍒楄〃澶辫触:', error);
    return NextResponse.json(
      { success: false, error: '鑾峰彇閰嶄欢鍒楄〃澶辫触' },
      { status: 500 }
    );
  }

    },
    'parts_read'
  );

export async function POST(request: Request) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const body = await request.json();
    const {
      name,
      category,
      brand,
      model,
      part_number,
      unit,
      description,
      image_url,
      stock_quantity,
      min_stock,
      max_stock,
      status,
      compatible_devices = [],
      related_faults = [],
      images = [],
    } = body;

    // 楠岃瘉蹇呭～瀛楁
    if (!name || !category) {
      return NextResponse.json(
        { success: false, error: '閰嶄欢鍚嶇О鍜屽垎绫讳负蹇呭～ },
        { status: 400 }
      );
    }

    // 寮€濮嬩簨    const { data: partData, error: partError } = await supabase
      .from('parts')
      .insert({
        name,
        category,
        brand,
        model,
        part_number,
        unit: unit || ',
        description,
        image_url,
        stock_quantity: stock_quantity || 0,
        min_stock: min_stock || 0,
        max_stock: max_stock || 1000,
        status: status || 'active',
      } as any)
      .select()
      .single();

    if (partError) throw partError;

    const partId = partData.id;

    // 鎻掑叆璁惧鍏宠仈
    if (compatible_devices.length > 0) {
      const deviceRelations = compatible_devices.map(
        (deviceId: string) =>
          ({
            part_id: partId,
            device_id: deviceId,
            compatibility_notes: '',
          }) as any
      );

      const { error: deviceError } = await supabase
        .from('part_devices')
        .insert(deviceRelations);

      if (deviceError) throw deviceError;
    }

    // 鎻掑叆鏁呴殰鍏宠仈
    if (related_faults.length > 0) {
      const faultRelations = related_faults.map((faultId: string) => ({
        part_id: partId,
        fault_id: faultId,
        usage_notes: '',
      }));

      const { error: faultError } = await supabase
        .from('part_faults')
        .insert(faultRelations);

      if (faultError) throw faultError;
    }

    // 鎻掑叆鍥剧墖
    if (images.length > 0) {
      const imageRecords = images.map((img: any, index: number) => ({
        part_id: partId,
        image_url: img.url,
        image_key: img.key,
        alt_text: img.alt || `閰嶄欢鍥剧墖${index + 1}`,
        is_primary: index === 0,
        sort_order: index,
      }));

      const { error: imageError } = await supabase
        .from('part_images')
        .insert(imageRecords);

      if (imageError) throw imageError;
    }

    // 杩斿洖瀹屾暣淇℃伅
    const { data: fullPartData, error: viewError } = await supabase
      .from('parts_complete_view')
      .select('*')
      .eq('id', partId)
      .single();

    if (viewError) throw viewError;

    return NextResponse.json({
      success: true,
      data: fullPartData,
      message: '閰嶄欢鍒涘缓鎴愬姛',
    });
  } catch (error) {
    console.error('鍒涘缓閰嶄欢澶辫触:', error);
    return NextResponse.json(
      { success: false, error: '鍒涘缓閰嶄欢澶辫触' },
      { status: 500 }
    );
  }

    },
    'parts_read'
  );

export async function PUT(request: Request) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缂哄皯閰嶄欢ID' },
        { status: 400 }
      );
    }

    // 鏇存柊閰嶄欢鍩烘湰淇℃伅
    const { data: partData, error: partError } = await supabase
      .from('parts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (partError) throw partError;

    // 濡傛灉鏈夎澶囧叧鑱旀洿    if (body.compatible_devices) {
      // 鍏堝垹闄ょ幇鏈夊叧      await supabase.from('part_devices').delete().eq('part_id', id);

      // 鎻掑叆鏂扮殑鍏宠仈
      if (body.compatible_devices.length > 0) {
        const deviceRelations = body.compatible_devices.map(
          (deviceId: string) => ({
            part_id: id,
            device_id: deviceId,
            compatibility_notes: '',
          })
        );

        const { error: deviceError } = await supabase
          .from('part_devices')
          .insert(deviceRelations);

        if (deviceError) throw deviceError;
      }
    }

    // 濡傛灉鏈夋晠闅滃叧鑱旀洿    if (body.related_faults) {
      // 鍏堝垹闄ょ幇鏈夊叧      await supabase.from('part_faults').delete().eq('part_id', id);

      // 鎻掑叆鏂扮殑鍏宠仈
      if (body.related_faults.length > 0) {
        const faultRelations = body.related_faults.map((faultId: string) => ({
          part_id: id,
          fault_id: faultId,
          usage_notes: '',
        }));

        const { error: faultError } = await supabase
          .from('part_faults')
          .insert(faultRelations);

        if (faultError) throw faultError;
      }
    }

    // 杩斿洖鏇存柊鍚庣殑瀹屾暣淇℃伅
    const { data: fullPartData, error: viewError } = await supabase
      .from('parts_complete_view')
      .select('*')
      .eq('id', id)
      .single();

    if (viewError) throw viewError;

    return NextResponse.json({
      success: true,
      data: fullPartData,
      message: '閰嶄欢鏇存柊鎴愬姛',
    });
  } catch (error) {
    console.error('鏇存柊閰嶄欢澶辫触:', error);
    return NextResponse.json(
      { success: false, error: '鏇存柊閰嶄欢澶辫触' },
      { status: 500 }
    );
  }

    },
    'parts_read'
  );

export async function DELETE(request: Request) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  const supabase = createRouteHandlerClient<Database>({ cookies });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缂哄皯閰嶄欢ID' },
        { status: 400 }
      );
    }

    // 杞垹闄わ細鏇存柊鐘舵€佷负deleted
    const { error } = await supabase
      .from('parts')
      .update({
        status: 'deleted',
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: '閰嶄欢鍒犻櫎鎴愬姛',
    });
  } catch (error) {
    console.error('鍒犻櫎閰嶄欢澶辫触:', error);
    return NextResponse.json(
      { success: false, error: '鍒犻櫎閰嶄欢澶辫触' },
      { status: 500 }
    );
  }

    },
    'parts_read'
  );

