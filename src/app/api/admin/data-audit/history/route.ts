/**
 * 数据审核 API - 审核历史
 * GET /api/admin/data-audit/history
 */

import { DataAuditService } from '@/lib/external-data/audit-service';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const auditService = new DataAuditService(supabaseUrl, supabaseKey);
    const { searchParams } = new URL(request.url);

    const stagingId = searchParams.get('staging_id');
    const action = (searchParams.get('action') as any) || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');

    const history = await auditService.getAuditHistory({
      stagingId: stagingId || undefined,
      action,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    console.error('获取审核历史失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
