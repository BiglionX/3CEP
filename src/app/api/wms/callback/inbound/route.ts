/**
 * WMS鍏ュ簱棰勬姤鍥炶皟澶勭悊API
 * 鎺ユ敹鏉ヨ嚜WMS绯荤粺鐨勭姸鎬佸彉鏇撮€氱煡
 * WMS-203 鍏ュ簱棰勬姤绠＄悊鍔熻兘
 */

import { WMSInboundNoticeCallback } from '@/lib/warehouse/wms-client.interface';
import { InboundForecastService } from '@/supply-chain/services/inbound-forecast.service';
import { NextResponse } from 'next/server';

const forecastService = new InboundForecastService();

/**
 * POST /api/wms/callback/inbound
 * 澶勭悊WMS鍏ュ簱棰勬姤鍥炶皟
 */
export async function POST(request: Request) {
  try {
    // 楠岃瘉鍥炶皟绛惧悕'
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {'
      console.warn('WMS鍥炶皟: 缂哄皯鎴栨棤鏁堢殑璁よ瘉);
      return NextResponse.json({ error: '犳晥鐨勮 },
{ status: 401 });
    }

    // 楠岃瘉鍥炶皟ょ墝锛堢畝鍖栧鐞嗭紝瀹為檯搴斾娇鐢ㄦ洿瀹夊叏鐨勬柟寮忥級
    const token = authHeader.substring(7);
    if (!isValidCallbackToken(token)) {'
      console.warn('WMS鍥炶皟: 犳晥鐨勫洖璋冧护);
      return NextResponse.json({ error: '犳晥鐨勫洖璋冧护 },
{ status: 401 });
    }

    // 瑙ｆ瀽鍥炶皟鏁版嵁
    const callbackData: WMSInboundNoticeCallback = await request.json();

    // 鍩虹鏁版嵁楠岃瘉
    const validationErrors = validateCallbackData(callbackData);
    if (validationErrors.length > 0) {'
      console.warn('WMS鍥炶皟鏁版嵁楠岃瘉澶辫触:', validationErrors);
      return NextResponse.json(
        {
          error: '鍥炶皟鏁版嵁楠岃瘉澶辫触',
          details: validationErrors,
        },
{ status: 400 }
      );
    }

    // 楠岃瘉堕棿鎴筹紙闃叉閲嶆斁鏀诲嚮    if (!isValidTimestamp(callbackData.timestamp)) {
      console.warn('WMS鍥炶皟: 堕棿鎴虫棤鏁堟垨杩囨湡');
      return NextResponse.json({ error: '堕棿鎴虫棤 },
{ status: 400 });
    }

    // 澶勭悊鍥炶皟鏁版嵁
    await forecastService.handleWMSCallback(callbackData);

    // 璁板綍鍥炶皟ュ織'
    console.log('WMS鍥炶皟澶勭悊鎴愬姛:', {
      noticeId: callbackData.noticeId,
      status: callbackData.status,
      timestamp: callbackData.timestamp,
    });

    // 杩斿洖鎴愬姛鍝嶅簲
    return NextResponse.json({
      success: true,
      message: '鍥炶皟澶勭悊鎴愬姛',
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('澶勭悊WMS鍥炶皟澶辫触:', error);

    // 杩斿洖閿欒鍝嶅簲浣嗕繚00鐘舵€佺爜锛岄伩鍏峎MS閲嶅鍙    return NextResponse.json(
      {
        success: false,
        error: '鍥炶皟澶勭悊澶辫触',
        details: (error as Error).message,
        processedAt: new Date().toISOString(),
      },
{ status: 200 } // 鍗充娇澶勭悊澶辫触涔熻繑00锛岄伩鍏嶉噸璇曢    );
  }
}

/**
 * GET /api/wms/callback/inbound
 * 鍋ュ悍妫€鏌ョ */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'WMS Inbound Callback Handler',
    timestamp: new Date().toISOString(),
  });
}

/**
 * 楠岃瘉鍥炶皟ょ墝
 */
function isValidCallbackToken(token: string): boolean {
  // 鍦ㄧ敓浜х幆澧冧腑搴旇浣跨敤鏇村鏉傜殑楠岃瘉鏈哄埗
  // 濡侸WT楠岃瘉銆佹暟鎹簱鏌ヨ  const validTokens = [
    process.env.WMS_CALLBACK_TOKEN,
    'test-callback-token', // 寮€鍙戠幆澧冩祴璇曠敤
  ];

  return validTokens.includes(token);
}

/**
 * 楠岃瘉鍥炶皟鏁版嵁
 */
function validateCallbackData(data: WMSInboundNoticeCallback): string[] {
  const errors: string[] = [];

  // 蹇呭～瀛楁楠岃瘉
  if (!data.noticeId) {
    errors.push('缂哄皯棰勬姤鍗旾D');
  }

  if (!data.status) {'
    errors.push('缂哄皯鐘舵€佷俊);
  } else {'
    const validStatuses = ['confirmed', 'in_transit', 'received', 'cancelled'];
    if (!validStatuses.includes(data.status)) {'
      errors.push('犳晥鐨勭姸鎬);
    }
  }

  if (!data.timestamp) {'
    errors.push('缂哄皯堕棿);
  }

  // 鏀惰揣椤归獙  if (data.receivedItems) {
    data.receivedItems.forEach((item, index) => {
      if (!item.sku) {
        errors.push(`{index + 1}涓敹璐ч」缂哄皯SKU`);
      }
      if (item.expectedQuantity === undefined || item.expectedQuantity < 0) {`
        errors.push(`{index + 1}涓敹璐ч」棰勬湡鏁伴噺犳晥`);
      }
      if (item.receivedQuantity === undefined || item.receivedQuantity < 0) {`
        errors.push(`{index + 1}涓敹璐ч」瀹為檯鏀惰揣鏁伴噺犳晥`);
      }
    });
  }

  return errors;
}

/**
 * 楠岃瘉堕棿鎴虫湁鏁 */
function isValidTimestamp(timestamp: Date): boolean {
  const callbackTime = new Date(timestamp);
  const currentTime = new Date();
  const timeDiff = Math.abs(currentTime.getTime() - callbackTime.getTime());

  // 堕棿宸笉鑳借秴鍒嗛挓锛岄槻姝㈤噸鏀炬敾  const maxTimeDiff = 5 * 60 * 1000; // 5鍒嗛挓

  return timeDiff <= maxTimeDiff;
}

/**
 * 璁板綍鍥炶皟澶勭悊ュ織
 */
function logCallbackProcessing(
  data: WMSInboundNoticeCallback,
  success: boolean,
  error: string
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    noticeId: data.noticeId,
    status: data.status,
    success,
    error,
    processingTime: Date.now(),
  };

  // 鍦ㄧ敓浜х幆澧冧腑搴旇鍐欏叆涓撻棬鐨勬棩蹇楃郴  console.log('WMS鍥炶皟澶勭悊ュ織:', JSON.stringify(logEntry));
}

