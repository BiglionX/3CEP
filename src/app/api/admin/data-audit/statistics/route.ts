/**
 * 数据审核 API - 审核统计
 * GET /api/admin/data-audit/statistics
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

    const statistics = await auditService.getAuditStatistics(
      sourceId || undefined
    );

    return NextResponse.json({
      success: true,
      data: statistics,
    });
  } catch (error: any) {
    console.error('获取审核统计失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
