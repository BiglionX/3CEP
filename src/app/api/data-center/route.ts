import { NextRequest, NextResponse } from 'next/server';
import { dataVirtualizationService, initializeDataCenter, trinoClientInstance } from '@/data-center/core/data-center-service';

// 初始化数据中心（如果尚未初始化）
let isInitialized = false;

async function ensureInitialized() {
  if (!isInitialized) {
    const success = await initializeDataCenter();
    if (success) {
      isInitialized = true;
    }
  }
  return isInitialized;
}

export async function GET(request: NextRequest) {
  try {
    // 确保数据中心已初始化
    const initialized = await ensureInitialized();
    if (!initialized) {
      return NextResponse.json(
        { error: '数据中心初始化失败' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'devices';
    const deviceId = searchParams.get('deviceId');
    const partIdsParam = searchParams.get('partIds');

    let result;

    switch (action) {
      case 'devices':
        result = await dataVirtualizationService.getUnifiedDeviceInfo(deviceId || undefined);
        break;
        
      case 'parts-price':
        const partIds = partIdsParam ? partIdsParam.split(',') : undefined;
        result = await dataVirtualizationService.getPartsPriceAggregation(partIds);
        break;
        
      case 'health':
        result = { status: 'healthy', timestamp: new Date().toISOString() };
        break;
        
      default:
        return NextResponse.json(
          { error: '未知的操作类型' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('数据中心API错误:', error);
    return NextResponse.json(
      { error: error.message || '内部服务器错误' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const initialized = await ensureInitialized();
    if (!initialized) {
      return NextResponse.json(
        { error: '数据中心初始化失败' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { query, catalog, schema } = body;

    if (!query) {
      return NextResponse.json(
        { error: '缺少查询参数' },
        { status: 400 }
      );
    }

    // 注意：这里应该添加权限验证和查询安全检查
    const result = await trinoClientInstance.executeQuery(
      query,
      catalog,
      schema
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('数据中心查询错误:', error);
    return NextResponse.json(
      { error: error.message || '查询执行失败' },
      { status: 500 }
    );
  }
}