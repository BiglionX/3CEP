import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

export async function GET(request: Request) {
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
    
    // 构建查询条件
    let query = supabase
      .from('parts_complete_view')
      .select('*', { count: 'exact' });
    
    // 搜索条件
    if (search) {
      query = query.or(`name.ilike.%${search}%,part_number.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    // 分类筛选
    if (category) {
      query = query.eq('category', category);
    }
    
    // 品牌筛选
    if (brand) {
      query = query.eq('brand', brand);
    }
    
    // 状态筛选
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    // 分页和排序
    const { data, error, count } = await query
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
        itemsPerPage: limit
      }
    });
    
  } catch (error) {
    console.error('获取配件列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取配件列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
      images = []
    } = body;
    
    // 验证必填字段
    if (!name || !category) {
      return NextResponse.json(
        { success: false, error: '配件名称和分类为必填项' },
        { status: 400 }
      );
    }
    
    // 开始事务
    const { data: partData, error: partError } = await supabase
      .from('parts')
      .insert({
        name,
        category,
        brand,
        model,
        part_number,
        unit: unit || '个',
        description,
        image_url,
        stock_quantity: stock_quantity || 0,
        min_stock: min_stock || 0,
        max_stock: max_stock || 1000,
        status: status || 'active'
      })
      .select()
      .single();
    
    if (partError) throw partError;
    
    const partId = partData.id;
    
    // 插入设备关联
    if (compatible_devices.length > 0) {
      const deviceRelations = compatible_devices.map((deviceId: string) => ({
        part_id: partId,
        device_id: deviceId,
        compatibility_notes: ''
      }));
      
      const { error: deviceError } = await supabase
        .from('part_devices')
        .insert(deviceRelations);
      
      if (deviceError) throw deviceError;
    }
    
    // 插入故障关联
    if (related_faults.length > 0) {
      const faultRelations = related_faults.map((faultId: string) => ({
        part_id: partId,
        fault_id: faultId,
        usage_notes: ''
      }));
      
      const { error: faultError } = await supabase
        .from('part_faults')
        .insert(faultRelations);
      
      if (faultError) throw faultError;
    }
    
    // 插入图片
    if (images.length > 0) {
      const imageRecords = images.map((img: any, index: number) => ({
        part_id: partId,
        image_url: img.url,
        image_key: img.key,
        alt_text: img.alt || `配件图片${index + 1}`,
        is_primary: index === 0,
        sort_order: index
      }));
      
      const { error: imageError } = await supabase
        .from('part_images')
        .insert(imageRecords);
      
      if (imageError) throw imageError;
    }
    
    // 返回完整信息
    const { data: fullPartData, error: viewError } = await supabase
      .from('parts_complete_view')
      .select('*')
      .eq('id', partId)
      .single();
    
    if (viewError) throw viewError;
    
    return NextResponse.json({
      success: true,
      data: fullPartData,
      message: '配件创建成功'
    });
    
  } catch (error) {
    console.error('创建配件失败:', error);
    return NextResponse.json(
      { success: false, error: '创建配件失败' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少配件ID' },
        { status: 400 }
      );
    }
    
    // 更新配件基本信息
    const { data: partData, error: partError } = await supabase
      .from('parts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (partError) throw partError;
    
    // 如果有设备关联更新
    if (body.compatible_devices) {
      // 先删除现有关联
      await supabase.from('part_devices').delete().eq('part_id', id);
      
      // 插入新的关联
      if (body.compatible_devices.length > 0) {
        const deviceRelations = body.compatible_devices.map((deviceId: string) => ({
          part_id: id,
          device_id: deviceId,
          compatibility_notes: ''
        }));
        
        const { error: deviceError } = await supabase
          .from('part_devices')
          .insert(deviceRelations);
        
        if (deviceError) throw deviceError;
      }
    }
    
    // 如果有故障关联更新
    if (body.related_faults) {
      // 先删除现有关联
      await supabase.from('part_faults').delete().eq('part_id', id);
      
      // 插入新的关联
      if (body.related_faults.length > 0) {
        const faultRelations = body.related_faults.map((faultId: string) => ({
          part_id: id,
          fault_id: faultId,
          usage_notes: ''
        }));
        
        const { error: faultError } = await supabase
          .from('part_faults')
          .insert(faultRelations);
        
        if (faultError) throw faultError;
      }
    }
    
    // 返回更新后的完整信息
    const { data: fullPartData, error: viewError } = await supabase
      .from('parts_complete_view')
      .select('*')
      .eq('id', id)
      .single();
    
    if (viewError) throw viewError;
    
    return NextResponse.json({
      success: true,
      data: fullPartData,
      message: '配件更新成功'
    });
    
  } catch (error) {
    console.error('更新配件失败:', error);
    return NextResponse.json(
      { success: false, error: '更新配件失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少配件ID' },
        { status: 400 }
      );
    }
    
    // 软删除：更新状态为deleted
    const { error } = await supabase
      .from('parts')
      .update({ status: 'deleted', updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      message: '配件删除成功'
    });
    
  } catch (error) {
    console.error('删除配件失败:', error);
    return NextResponse.json(
      { success: false, error: '删除配件失败' },
      { status: 500 }
    );
  }
}