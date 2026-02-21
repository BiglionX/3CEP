/**
 * 设备管理 API 端点（带租户验证）
 * 演示如何使用 requireTenant 中间件
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { requireTenant, getUserTenantContext } from '@/middleware/require-tenant';

export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 获取租户上下文
    const tenantContext = await getUserTenantContext(request);
    
    if (!tenantContext.success) {
      return NextResponse.json(
        { error: tenantContext.error }, 
        { status: 401 }
      );
    }

    const { tenantId, userId, role } = tenantContext;

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // 查询该租户下的设备（自动应用租户过滤）
    const { data: devices, error, count } = await supabase
      .from('devices')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)  // 关键：只查询当前租户的数据
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取设备列表失败:', error);
      return NextResponse.json(
        { error: '获取设备列表失败' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: devices || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      tenantInfo: {
        tenantId,
        userRole: role
      }
    });

  } catch (error: any) {
    console.error('设备 API 错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 获取租户上下文
    const tenantContext = await getUserTenantContext(request);
    
    if (!tenantContext.success) {
      return NextResponse.json(
        { error: tenantContext.error }, 
        { status: 401 }
      );
    }

    const { tenantId, userId, role } = tenantContext;

    // 解析请求体
    const body = await request.json();
    
    // 验证必要字段
    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: '设备名称和类型为必填项' }, 
        { status: 400 }
      );
    }

    // 创建设备记录（自动关联当前租户）
    const { data: device, error } = await supabase
      .from('devices')
      .insert({
        name: body.name.trim(),
        type: body.type.trim(),
        description: body.description?.trim() || null,
        status: body.status || 'active',
        tenant_id: tenantId,  // 关键：自动设置租户ID
        created_by: userId
      })
      .select()
      .single();

    if (error) {
      console.error('创建设备失败:', error);
      return NextResponse.json(
        { error: '创建设备失败', details: error.message }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '设备创建成功',
      data: device
    }, { status: 201 });

  } catch (error: any) {
    console.error('创建设备错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 获取租户上下文
    const tenantContext = await getUserTenantContext(request);
    
    if (!tenantContext.success) {
      return NextResponse.json(
        { error: tenantContext.error }, 
        { status: 401 }
      );
    }

    const { tenantId, userId, role } = tenantContext;

    // 解析请求体
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: '设备ID为必填项' }, 
        { status: 400 }
      );
    }

    // 验证用户是否有权更新该设备（必须属于同一租户）
    const { data: existingDevice, error: checkError } = await supabase
      .from('devices')
      .select('id, tenant_id')
      .eq('id', id)
      .eq('tenant_id', tenantId)  // 关键：确保设备属于当前租户
      .single();

    if (checkError || !existingDevice) {
      return NextResponse.json(
        { error: '设备不存在或无权访问' }, 
        { status: 404 }
      );
    }

    // 执行更新
    const { data: updatedDevice, error } = await supabase
      .from('devices')
      .update({
        ...updateData,
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新设备失败:', error);
      return NextResponse.json(
        { error: '更新设备失败', details: error.message }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '设备更新成功',
      data: updatedDevice
    });

  } catch (error: any) {
    console.error('更新设备错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 获取租户上下文
    const tenantContext = await getUserTenantContext(request);
    
    if (!tenantContext.success) {
      return NextResponse.json(
        { error: tenantContext.error }, 
        { status: 401 }
      );
    }

    const { tenantId, userId, role } = tenantContext;

    // 获取设备ID
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('id');

    if (!deviceId) {
      return NextResponse.json(
        { error: '设备ID为必填项' }, 
        { status: 400 }
      );
    }

    // 验证用户是否有权删除该设备
    const { data: existingDevice, error: checkError } = await supabase
      .from('devices')
      .select('id, tenant_id')
      .eq('id', deviceId)
      .eq('tenant_id', tenantId)
      .single();

    if (checkError || !existingDevice) {
      return NextResponse.json(
        { error: '设备不存在或无权访问' }, 
        { status: 404 }
      );
    }

    // 执行软删除
    const { error } = await supabase
      .from('devices')
      .update({
        status: 'deleted',
        deleted_by: userId,
        deleted_at: new Date().toISOString()
      })
      .eq('id', deviceId);

    if (error) {
      console.error('删除设备失败:', error);
      return NextResponse.json(
        { error: '删除设备失败', details: error.message }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '设备删除成功'
    });

  } catch (error: any) {
    console.error('删除设备错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' }, 
      { status: 500 }
    );
  }
}