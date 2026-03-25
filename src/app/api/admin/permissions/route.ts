import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/permissions
 * 获取所有权限定义
 */
export async function GET(request: NextRequest) {
  try {
    // 验证权限
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    // 初始化 Supabase 客户端
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 获取所有权限定义
    const { data: permissions, error } = await supabase
      .from('admin_permissions')
      .select('*')
      .order('module')
      .order('name');

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    console.error('获取权限失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: `系统错误：${error instanceof Error ? error.message : '未知错误'}`,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/permissions
 * 保存角色权限配置
 */
export async function POST(request: NextRequest) {
  try {
    // 验证权限
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      );
    }

    // 解析请求体
    const body = await request.json();
    const { roleId, permissions } = body;

    // 参数验证
    if (!roleId || !permissions) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        { success: false, error: '权限列表必须是数组' },
        { status: 400 }
      );
    }

    // 初始化 Supabase 客户端
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 使用事务处理
    const { data: result, error } = await supabase.rpc(
      'update_role_permissions',
      {
        p_role_id: roleId,
        p_permission_ids: permissions,
      }
    );

    // 如果存储过程不存在，手动处理
    if (error && error.code === '42883') {
      console.warn('存储过程不存在，使用手动处理');

      // 1. 删除旧的权限关联
      const { error: deleteError } = await supabase
        .from('admin_role_permissions')
        .delete()
        .eq('role_id', roleId);

      if (deleteError) {
        throw deleteError;
      }

      // 2. 插入新的权限关联
      if (permissions.length > 0) {
        const permissionData = permissions.map(permissionId => ({
          role_id: roleId,
          permission_id: permissionId,
        }));

        const { error: insertError } = await supabase
          .from('admin_role_permissions')
          .insert(permissionData);

        if (insertError) {
          throw insertError;
        }
      }

      return NextResponse.json({
        success: true,
        message: `成功保存 ${permissions.length} 个权限`,
      });
    }

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: `成功保存 ${permissions.length} 个权限`,
    });
  } catch (error) {
    console.error('保存权限失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: `系统错误：${error instanceof Error ? error.message : '未知错误'}`,
      },
      { status: 500 }
    );
  }
}
