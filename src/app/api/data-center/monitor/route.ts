// API缃戝叧鐩戞帶鍜岀鐞嗘帴// 鎻愪緵缃戝叧鐘舵€佹煡璇€佹寚鏍囩洃鎺у拰閰嶇疆绠＄悊鍔熻兘

import { NextRequest, NextResponse } from 'next/server';
import { apiGatewayService } from '@/modules/data-center/core/api-gateway.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'metrics';

    switch (action) {
      case 'metrics':
        // 鑾峰彇鐩戞帶鎸囨爣
        const metrics = apiGatewayService.getMetrics();
        return NextResponse.json({
          success: true,
          data: metrics,
          timestamp: new Date().toISOString(),
        });

      case 'status':
        // 鑾峰彇缃戝叧鐘        return NextResponse.json({
          success: true,
          data: {
            status: 'running',
            version: '1.0.0',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
          },
        });

      case 'routes':
        // 鑾峰彇璺敱閰嶇疆
        return NextResponse.json({
          success: true,
          data: {
            available_routes: [
              '/api/data-centermodule={module}&endpoint={path}',
              '/api/data-centeraction=health',
              '/api/data-centeraction=aggregate&modules={modules}',
              '/api/data-center/monitoraction=metrics',
              '/api/data-center/monitoraction=status',
            ],
            supported_modules: [
              'devices',
              'supply-chain',
              'wms',
              'fcx',
              'data-quality',
              'monitoring',
              'analytics',
              'enterprise',
              'procurement-intelligence',
              'foreign-trade',
            ],
          },
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: '鏈煡鐨勬搷浣滅被,
            available_actions: ['metrics', 'status', 'routes'],
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('API缃戝叧鐩戞帶鎺ュ彛閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'reset-metrics':
        // 閲嶇疆鐩戞帶鎸囨爣
        apiGatewayService.resetMetrics();
        return NextResponse.json({
          success: true,
          message: '鐩戞帶鎸囨爣宸查噸,
          timestamp: new Date().toISOString(),
        });

      case 'reload-config':
        // 閲嶆柊鍔犺浇閰嶇疆锛堟ā鎷燂級
        return NextResponse.json({
          success: true,
          message: '閰嶇疆宸查噸鏂板姞,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: '鏈煡鐨勬搷浣滅被,
            available_actions: ['reset-metrics', 'reload-config'],
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('API缃戝叧绠＄悊鎺ュ彛閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

