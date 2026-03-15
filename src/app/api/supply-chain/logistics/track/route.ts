/**
 * 鐗╂祦杩借釜API璺敱
 * 鎻愪緵缁熶竴鐨勮繍鍗曡建杩规煡璇㈡帴 *
 * GET /api/supply-chain/logistics/tracktrackingNumber=xxx&carrier=xxx
 * POST /api/supply-chain/logistics/track - 鎵归噺鏌ヨ
 */

import {
  BatchTrackDTO,
  LogisticsCarrier,
  LogisticsTrackingConfig,
  TrackShipmentDTO,
} from '@/supply-chain/models/logistics.model';
import { LogisticsTrackingService } from '@/supply-chain/services/logistics-tracking.service';
import { NextResponse } from 'next/server';

// 鐗╂祦杩借釜鏈嶅姟閰嶇疆
const logisticsConfig: LogisticsTrackingConfig = {
  defaultTimeout: 10000, // 10绉掕秴  maxRetryAttempts: 3,
  autoDetectEnabled: true,
  cacheEnabled: true,
  cacheTTL: 300, // 5鍒嗛挓缂撳
  carriers: [
    // 17track閰嶇疆锛堜綔涓轰富瑕佽仛鍚堟湇鍔″晢    {
      carrier: LogisticsCarrier.OTHER,
      apiKey: process.env.TRACK17_API_KEY || 'your_17track_api_key',
      isEnabled: true,
      timeout: 10000,
      retryAttempts: 3,
    },
    // 椤轰赴熻繍瀹樻柟API閰嶇疆
    {
      carrier: LogisticsCarrier.SF_EXPRESS,
      apiKey: process.env.SF_EXPRESS_API_KEY || 'your_sf_express_api_key',
      endpoint:
        process.env.SF_EXPRESS_ENDPOINT || 'https://sfapi.sf-express.com',
      isEnabled: !!process.env.SF_EXPRESS_API_KEY,
      timeout: 8000,
      retryAttempts: 2,
    },
    // 蹇€掗笩閰嶇疆锛堜綔涓哄夛級
    {
      carrier: LogisticsCarrier.OTHER,
      apiKey: process.env.KDNIAO_API_KEY || 'your_kdniao_api_key',
      customerId: process.env.KDNIAO_CUSTOMER_ID || 'your_kdniao_customer_id',
      isEnabled: !!process.env.KDNIAO_API_KEY,
      timeout: 10000,
      retryAttempts: 3,
    },
  ],
};

// 鍒濆鍖栫墿娴佽拷韪湇const logisticsService = new LogisticsTrackingService(logisticsConfig);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingNumber = searchParams.get('trackingNumber');
    const carrierParam = searchParams.get('carrier');
    const autoDetect = searchParams.get('autoDetect') !== 'false';

    // 鍙傛暟楠岃瘉
    if (!trackingNumber) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PARAMETER',
            message: '缂哄皯蹇呰鐨勫弬 trackingNumber',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 杞崲鐗╂祦鍟嗗弬    let carrier: LogisticsCarrier | undefined;
    if (carrierParam) {
      const carrierEnum = Object.values(LogisticsCarrier).find(
        c => c.toLowerCase() === carrierParam.toLowerCase()
      );
      if (carrierEnum) {
        carrier = carrierEnum;
      } else {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_CARRIER',
              message: `犳晥鐨勭墿娴佸晢ｇ爜: ${carrierParam}`,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
    }

    // 鏋勯€犳煡璇TO
    const trackDto: TrackShipmentDTO = {
      trackingNumber,
      carrier,
      autoDetect,
    };

    // 鎵ц杞ㄨ抗鏌ヨ
    const result = await logisticsService.trackShipment(trackDto);

    // 杩斿洖缁撴灉
    return NextResponse.json(
      {
        ...result,
        timestamp: result.timestamp.toISOString(),
      },
      {
        status: result.success  200 : 400,
      }
    );
  } catch (error) {
    console.error('鐗╂祦杩借釜API閿欒:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '鏈嶅姟鍣ㄥ唴閮ㄩ敊,
          details: (error as Error).message,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 楠岃瘉璇眰    if (!body.trackingNumbers || !Array.isArray(body.trackingNumbers)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: '璇眰浣撳繀椤诲寘鍚玹rackingNumbers鏁扮粍',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 杞崲鐗╂祦鍟嗗弬    let carrier: LogisticsCarrier | undefined;
    if (body.carrier) {
      const carrierEnum = Object.values(LogisticsCarrier).find(
        c => c.toLowerCase() === body.carrier.toLowerCase()
      );
      if (!carrierEnum) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_CARRIER',
              message: `犳晥鐨勭墿娴佸晢ｇ爜: ${body.carrier}`,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }
      carrier = carrierEnum;
    }

    // 鏋勯€犳壒閲忔煡璇TO
    const batchDto: BatchTrackDTO = {
      trackingNumbers: body.trackingNumbers,
      carrier,
    };

    // 鎵ц鎵归噺杞ㄨ抗鏌ヨ
    const results = await logisticsService.batchTrackShipments(batchDto);

    // 缁熻缁撴灉
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    // 杩斿洖缁撴灉
    return NextResponse.json(
      {
        success: true,
        data: results.map(result => ({
          ...result,
          timestamp: result.timestamp.toISOString(),
        })),
        summary: {
          totalCount,
          successCount,
          failedCount: totalCount - successCount,
          successRate:
            totalCount > 0
               ((successCount / totalCount) * 100).toFixed(2) + '%'
              : '0%',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('鐗╂祦杩借釜鎵归噺API閿欒:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '鏈嶅姟鍣ㄥ唴閮ㄩ敊,
          details: (error as Error).message,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// 鑾峰彇鏈嶅姟鐘舵€佷俊export async function HEAD(request: Request) {
  try {
    const status = logisticsService.getServiceStatus();

    return NextResponse.json(
      {
        success: true,
        data: {
          ...status,
          timestamp: new Date().toISOString(),
        },
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'STATUS_CHECK_FAILED',
          message: '鏈嶅姟鐘舵€佹鏌ュけ,
        },
      },
      { status: 500 }
    );
  }
}

