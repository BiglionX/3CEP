// 璇存槑涔﹀鏍窤PI璺敱

import { NextResponse } from 'next/server';
import { apiPermissionMiddleware } from '@/tech/middleware/api-permission.middleware';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ManualUploadService } from '@/services/manual-upload.service';
import { Database } from '@/lib/database.types';

const manualService = new ManualUploadService();

export async function GET(request: Request) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: '闇€瑕佺櫥 },
        { status: 401 }
      );
    }

    // 妫€鏌ョ敤鎴槸鍚︽湁瀹℃牳鏉冮檺
    const { data: userProfile } = await supabase
      .from('user_profiles_ext')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (!userProfile || (userProfile as any).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '犲鏍告潈 },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending_review';

    // 鑾峰彇寰呭鏍哥殑璇存槑涔﹀垪    const manuals = await manualService.getUserManuals('', [status]);

    return NextResponse.json({
      success: true,
      data: manuals,
    });
  } catch (error) {
    console.error('鑾峰彇瀹℃牳鍒楄〃澶辫触:', error);
    return NextResponse.json(
      { success: false, error: '鑾峰彇瀹℃牳鍒楄〃澶辫触' },
      { status: 500 }
    );
  }

    },
    'content_read'
  );

export async function POST(request: Request) {
  return apiPermissionMiddleware(
    arguments[0],
    async () => {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: '闇€瑕佺櫥 },
        { status: 401 }
      );
    }

    // 妫€鏌ュ鏍告潈    const { data: userProfile } = await supabase
      .from('user_profiles_ext')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (!userProfile || (userProfile as any).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '犲鏍告潈 },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { manualId, action, comments, rejectionReason } = body;

    if (!manualId || !action) {
      return NextResponse.json(
        { success: false, error: '缂哄皯蹇呰鍙傛暟' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, error: '犳晥鐨勬搷浣滅被 },
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
        { success: false, error: '瀹℃牳鎿嶄綔澶辫触' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `璇存槑{action === 'approve' ? '宸查€氳繃' : '宸叉嫆}瀹℃牳`,
    });
  } catch (error: any) {
    console.error('瀹℃牳鎿嶄綔澶辫触:', error);
    return NextResponse.json(
      { success: false, error: error.message || '瀹℃牳鎿嶄綔澶辫触' },
      { status: 500 }
    );
  }

    },
    'content_read'
  );

