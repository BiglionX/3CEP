// 说明书审核API路由

import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ManualUploadService } from '@/services/manual-upload.service';
import { Database } from '@/lib/database.types';

const manualService = new ManualUploadService();

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: '需要登录' },
        { status: 401 }
      );
    }

    // 检查用户是否有审核权限
    const { data: userProfile } = await supabase
      .from('user_profiles_ext')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (!userProfile || (userProfile as any).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '无审核权限' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending_review';
    
    // 获取待审核的说明书列表
    const manuals = await manualService.getUserManuals('', [status]);

    return NextResponse.json({
      success: true,
      data: manuals
    });

  } catch (error) {
    console.error('获取审核列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取审核列表失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: '需要登录' },
        { status: 401 }
      );
    }

    // 检查审核权限
    const { data: userProfile } = await supabase
      .from('user_profiles_ext')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (!userProfile || (userProfile as any).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '无审核权限' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { manualId, action, comments, rejectionReason } = body;

    if (!manualId || !action) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: '无效的操作类型' },
        { status: 400 }
      );
    }

    const success = await manualService.reviewManual(
      manualId,
      action,
      session.user.id,
      comments,
      rejectionReason
    );

    if (!success) {
      return NextResponse.json(
        { success: false, error: '审核操作失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `说明书${action === 'approve' ? '已通过' : '已拒绝'}审核`
    });

  } catch (error: any) {
    console.error('审核操作失败:', error);
    return NextResponse.json(
      { success: false, error: error.message || '审核操作失败' },
      { status: 500 }
    );
  }
}