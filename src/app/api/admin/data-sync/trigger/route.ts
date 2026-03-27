/**
 * 数据同步 API - 手动触发同步
 * POST /api/admin/data-sync/trigger
 */

import { getDataSyncScheduler } from '@/lib/external-data/sync-scheduler';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source_id } = body;

    if (!source_id) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少数据源 ID',
        },
        { status: 400 }
      );
    }

    const scheduler = getDataSyncScheduler(supabaseUrl, supabaseKey);
    const result = await scheduler.triggerManualSync(source_id);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '同步成功',
        data: result,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: '同步失败',
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('手动触发同步失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
