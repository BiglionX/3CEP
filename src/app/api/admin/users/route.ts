/**
 * 管理后台用户列表 API - 使用权限中间件示例
 *
 * @file src/app/api/admin/users/route.ts
 */

import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/admin/users
 * 获取用户列表（需要 users_read 权限）
 */
export async function GET(req: NextRequest) {
  return apiPermissionMiddleware(
    req,
    async () => {
      try {
        // 从 URL 获取查询参数
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';

        // 创建 Supabase 客户端
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 构建查询
        let query = supabase.from('users').select('*', { count: 'exact' });

        // 应用搜索条件
        if (search) {
          query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
        }

        // 分页
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        // 执行查询
        const { data: users, error, count } = await query;

        if (error) {
          throw error;
        }

        return NextResponse.json({
          success: true,
          data: {
            users,
            pagination: {
              page,
              limit,
              total: count || 0,
              totalPages: Math.ceil((count || 0) / limit),
            },
          },
        });
      } catch (error) {
        console.error('获取用户列表失败:', error);
        return NextResponse.json(
          {
            success: false,
            error: '获取用户列表失败',
            details: error instanceof Error ? error.message : '未知错误',
          },
          { status: 500 }
        );
      }
    },
    'users_read'
  );
}

/**
 * POST /api/admin/users
 * 创建新用户（需要 users_create 权限）
 */
export async function POST(req: NextRequest) {
  return apiPermissionMiddleware(
    req,
    async () => {
      try {
        const body = await req.json();
        const { email, password, name, roles = ['user'], tenant_id } = body;

        // 验证必填字段
        if (!email || !password) {
          return NextResponse.json(
            {
              success: false,
              error: '邮箱和密码为必填项',
            },
            { status: 400 }
          );
        }

        // 创建 Supabase 客户端
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 创建用户
        const { data: authData, error: authError } =
          await supabase.auth.admin.createUser({
            email,
            password,
            user_metadata: {
              name,
              roles,
              tenant_id,
            },
          });

        if (authError) {
          throw authError;
        }

        // 创建用户档案
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: authData.user.id,
            name,
            tenant_id,
          })
          .select()
          .single();

        if (profileError) {
          throw profileError;
        }

        return NextResponse.json({
          success: true,
          data: {
            user: authData.user,
            profile,
          },
          message: '用户创建成功',
        });
      } catch (error) {
        console.error('创建用户失败:', error);
        return NextResponse.json(
          {
            success: false,
            error: '创建用户失败',
            details: error instanceof Error ? error.message : '未知错误',
          },
          { status: 500 }
        );
      }
    },
    'users_create'
  );
}
