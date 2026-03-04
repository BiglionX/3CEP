import { NextRequest, NextResponse } from 'next/server';
import {
  dataVirtualizationService,
  initializeDataCenter,
  trinoClientInstance,
} from '@/modules/data-center/core/data-center-service';

// 鍒濆鍖栨暟鎹腑蹇冿紙濡傛灉灏氭湭鍒濆鍖栵級
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
    // 纭繚鏁版嵁涓績宸插垵濮嬪寲
    const initialized = await ensureInitialized();
    if (!initialized) {
      return NextResponse.json(
        { error: '鏁版嵁涓績鍒濆鍖栧け? },
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
        result = await dataVirtualizationService.getUnifiedDeviceInfo(
          deviceId || undefined
        );
        break;

      case 'parts-price':
        const partIds = partIdsParam ? partIdsParam.split(',') : undefined;
        result =
          await dataVirtualizationService.getPartsPriceAggregation(partIds);
        break;

      case 'health':
        result = { status: 'healthy', timestamp: new Date().toISOString() };
        break;

      default:
        return NextResponse.json({ error: '鏈煡鐨勬搷浣滅被? }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('鏁版嵁涓績API閿欒:', error);
    return NextResponse.json(
      { error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊? },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const initialized = await ensureInitialized();
    if (!initialized) {
      return NextResponse.json(
        { error: '鏁版嵁涓績鍒濆鍖栧け? },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { query, catalog, schema } = body;

    if (!query) {
      return NextResponse.json({ error: '缂哄皯鏌ヨ鍙傛暟' }, { status: 400 });
    }

    // 娉ㄦ剰锛氳繖閲屽簲璇ユ坊鍔犳潈闄愰獙璇佸拰鏌ヨ瀹夊叏妫€?    const result = await trinoClientInstance.executeQuery(
      query,
      catalog,
      schema
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('鏁版嵁涓績鏌ヨ閿欒:', error);
    return NextResponse.json(
      { error: error.message || '鏌ヨ鎵ц澶辫触' },
      { status: 500 }
    );
  }
}

