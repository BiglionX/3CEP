/**
 * 租户管理 API 路由
 * 提供租户创建、管理、用户分配等功能
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // 验证用户权限
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 检查是否为管理员
    const isAdmin = await checkAdminUser(user.id, supabase);
    if (!isAdmin) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const includeUsers = searchParams.get('includeUsers') === 'true';
    const activeOnly = searchParams.get('activeOnly') === 'true';

    let query = supabase.from('tenants').select(`
        id,
        name,
        code,
        description,
        is_active,
        created_at,
        updated_at
      `);

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data: tenants, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      return NextResponse.json(
        { error: '获取租户列表失败', details: error.message },
        { status: 500 }
      );
    }

    // 如果需要包含用户信息
    if (includeUsers && tenants.length > 0) {
      const tenantIds = tenants.map((t: any) => t.id);

      const { data: userTenants, error: userError } = await supabase
        .from('user_tenants')
        .select(
          `
          id,
          user_id,
          tenant_id,
          role,
          is_primary,
          is_active,
          created_at,
          profiles(username, email)
        `
        )
        .in('tenant_id', tenantIds)
        .eq('is_active', true);

      if (!userError) {
        // 将用户信息关联到租户
        tenants.forEach((tenant: any) => {
          tenant.users = userTenants
            .filter((ut: any) => ut.tenant_id === tenant.id)
            .map((ut: any) => ({
              id: ut.user_id,
              username: ut.profiles?.username || '未知用户',
              email: ut.profiles?.email || '未知邮箱',
              role: ut.role,
              is_primary: ut.is_primary,
            }));
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: tenants,
      count: tenants.length,
    });
  } catch (error) {
    console.error('租户列表获取错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // 验证用户权限
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 检查是否为管理员
    const isAdmin = await checkAdminUser(user.id, supabase);
    if (!isAdmin) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    // 解析请求体
    const body = await request.json();
    const { name, code, description } = body;

    // 验证必填字段
    if (!name || !code) {
      return NextResponse.json(
        { error: '租户名称和编码为必填项' },
        { status: 400 }
      );
    }

    // 检查编码唯一性
    const { data: existingTenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('code', code)
      .single();

    if (existingTenant) {
      return NextResponse.json({ error: '租户编码已存在' }, { status: 409 });
    }

    // 创建租户
    const { data: tenant, error } = await supabase
      .from('tenants')
      .insert({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description?.trim() || null,
        is_active: true,
      } as any)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: '创建租户失败', details: error.message },
        { status: 500 }
      );
    }

    // 自动将创建者设为租户管理员
    const { error: assignError } = await supabase.from('user_tenants').insert({
      user_id: user.id,
      tenant_id: tenant.id,
      role: 'admin',
      is_primary: true,
      is_active: true,
    } as any);

    if (assignError) {
      console.warn('自动分配租户管理员失败:', assignError);
    }

    // 记录审计日志
    await logAuditEvent(
      'tenant_create',
      user.id,
      'tenants',
      { tenant_id: tenant.id, tenant_name: tenant.name },
      supabase
    );

    return NextResponse.json(
      {
        success: true,
        message: '租户创建成功',
        data: tenant,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('租户创建错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/tenants/[id] - 更新租户
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const tenantId = params.id;

  try {
    // 验证用户权限
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 检查是否为管理员
    const isAdmin = await checkAdminUser(user.id, supabase);
    if (!isAdmin) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    // 解析请求体
    const body = await request.json();
    const { name, description, is_active } = body;

    // 构建更新数据
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined)
      updateData.description = description?.trim() || null;
    if (is_active !== undefined) updateData.is_active = Boolean(is_active);

    // 更新租户
    const { data: tenant, error } = await supabase
      .from('tenants')
      .update(updateData)
      .eq('id', tenantId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: '更新租户失败', details: error.message },
        { status: 500 }
      );
    }

    if (!tenant) {
      return NextResponse.json({ error: '租户不存在' }, { status: 404 });
    }

    // 记录审计日志
    await logAuditEvent(
      'tenant_update',
      user.id,
      'tenants',
      { tenant_id: tenantId, changes: updateData },
      supabase
    );

    return NextResponse.json({
      success: true,
      message: '租户更新成功',
      data: tenant,
    });
  } catch (error) {
    console.error('租户更新错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/tenants/[id] - 删除租户
export async function DELETE(request, { params }) {
  const supabase = createRouteHandlerClient({ cookies });
  const tenantId = params.id;

  try {
    // 验证用户权限
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    // 检查是否为管理员
    const isAdmin = await checkAdminUser(user.id, supabase);
    if (!isAdmin) {
      return NextResponse.json({ error: '权限不足' }, { status: 403 });
    }

    // 检查租户是否存在
    const { data: tenant } = await supabase
      .from('tenants')
      .select('name, code')
      .eq('id', tenantId)
      .single();

    if (!tenant) {
      return NextResponse.json({ error: '租户不存在' }, { status: 404 });
    }

    // 检查是否为主租户
    if (tenant.code === 'MAIN') {
      return NextResponse.json({ error: '不能删除主租户' }, { status: 400 });
    }

    // 检查租户是否还有活跃用户
    const { data: activeUsers } = await supabase
      .from('user_tenants')
      .select('count()', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('is_active', true);

    if (activeUsers && activeUsers.count > 0) {
      return NextResponse.json(
        { error: '租户仍有活跃用户，不能删除' },
        { status: 400 }
      );
    }

    // 软删除：标记为非活跃
    const { error } = await supabase
      .from('tenants')
      .update({ is_active: false } as any)
      .eq('id', tenantId);

    if (error) {
      return NextResponse.json(
        { error: '删除租户失败', details: error.message },
        { status: 500 }
      );
    }

    // 记录审计日志
    await logAuditEvent(
      'tenant_delete',
      user.id,
      'tenants',
      { tenant_id: tenantId, tenant_name: tenant.name },
      supabase
    );

    return NextResponse.json({
      success: true,
      message: '租户删除成功',
    });
  } catch (error) {
    console.error('租户删除错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误', details: error.message },
      { status: 500 }
    );
  }
}

// 辅助函数
async function checkAdminUser(userId, supabase) {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('is_active')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    return !error && data !== null;
  } catch (error) {
    console.error('检查管理员身份失败:', error);
    return false;
  }
}

async function logAuditEvent(action, userId, resource, changes, supabase) {
  try {
    // 这里应该调用审计日志系统
    console.log(`审计日志: ${action} by ${userId} on ${resource}`, changes);
  } catch (error) {
    console.error('记录审计日志失败:', error);
  }
}
