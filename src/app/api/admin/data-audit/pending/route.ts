/**
 * 数据审核 API - 待审核列表
 * GET /api/admin/data-audit/pending
 */

import { DataAuditService } from '@/lib/external-data/audit-service';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const auditService = new DataAuditService(supabaseUrl, supabaseKey);
    const { searchParams } = new URL(request.url);

    const sourceId = searchParams.get('source_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await auditService.getPendingData({
      sourceId: sourceId || undefined,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
    });
  } catch (error: any) {
    console.error('获取待审核数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
