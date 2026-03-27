/**
 * 数据源管理 API - 测试连接
 * POST /api/admin/data-sources/test-connection
 */

import { ExternalDataSyncService } from '@/lib/external-data/sync-service';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source_id, connection_config, type } = body;

    if (!connection_config || !type) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少连接配置或类型参数',
        },
        { status: 400 }
      );
    }

    const syncService = new ExternalDataSyncService(supabaseUrl, supabaseKey);

    const isConnected = await syncService.testConnection({
      id: source_id || 'test',
      name: 'Test Connection',
      type,
      connection_config,
      sync_frequency: 300,
      sync_enabled: false,
    });

    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: '连接测试成功',
      });
    } else {
      return NextResponse.json({
        success: false,
        message: '连接测试失败',
      });
    }
  } catch (error: any) {
    console.error('测试连接失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
