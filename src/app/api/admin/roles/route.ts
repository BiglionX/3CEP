import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/roles
 * 获取所有角色列表
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

    // 获取所有角色
    const { data: roles, error } = await supabase
      .from('admin_roles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    // 获取每个角色的权限
    const rolesWithPermissions = await Promise.all(
      roles?.map(async role => {
        const { data: rolePermissions } = await supabase
          .from('admin_role_permissions')
          .select('permission_id')
          .eq('role_id', role.id);

        return {
          ...role,
          permissions: rolePermissions?.map(p => p.permission_id) || [],
        };
      }) || []
    );

    return NextResponse.json({
      success: true,
      data: rolesWithPermissions,
    });
  } catch (error) {
    console.error('获取角色失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: `系统错误：${error instanceof Error ? error.message : '未知错误'}`,
      },
      { status: 500 }
    );
  }
}
