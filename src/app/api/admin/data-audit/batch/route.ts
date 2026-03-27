/**
 * 数据审核 API - 批量审核
 * POST /api/admin/data-audit/batch
 */

import {
  AuditAction,
  DataAuditService,
} from '@/lib/external-data/audit-service';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const auditService = new DataAuditService(supabaseUrl, supabaseKey);
    const body = await request.json();

    const { staging_ids, action, notes, reason } = body;

    // 验证必填字段
    if (!staging_ids || !action) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必填字段',
        },
        { status: 400 }
      );
    }

    // 获取当前用户（TODO: 实现认证）
    const reviewerId = 'admin-user-id'; // 从 session 中获取

    const result = await auditService.batchAudit({
      stagingIds: staging_ids,
      action: action as AuditAction,
      reviewerId,
      notes,
      reason,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `成功处理 ${result.processed} 条记录`,
        data: result,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: '批量审核失败',
          error: result.error,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('批量审核失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
