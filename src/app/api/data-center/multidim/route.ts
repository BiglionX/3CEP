/**
 * @file route.ts
 * @description 澶氱淮鍒嗘瀽API璺敱澶勭悊? * @version 1.0.0
 * @author DataCenter Team
 * @date 2026-02-28
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  MultidimensionalQueryBuilder,
  Dimension,
  Metric,
  MultidimQueryConfig,
} from '@/data-center/analytics/multidimensional-query-builder';
import { getCurrentUser } from '@/lib/auth/session';

// 鍏ㄥ眬鏌ヨ鏋勫缓鍣ㄥ疄?const queryBuilder = new MultidimensionalQueryBuilder();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'dimensions';

    // 鑾峰彇褰撳墠鐢ㄦ埛
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: '鏈巿鏉冭? }, { status: 401 });
    }

    switch (action) {
      case 'dimensions':
        // 鑾峰彇鍙敤缁村害
        const dimensions = await queryBuilder.getAvailableDimensions(
          currentUser.id
        );
        return NextResponse.json({
          dimensions,
          timestamp: new Date().toISOString(),
        });

      case 'metrics':
        // 鑾峰彇鍙敤鎸囨爣
        const metrics = await queryBuilder.getAvailableMetrics(currentUser.id);
        return NextResponse.json({
          metrics,
          timestamp: new Date().toISOString(),
        });

      case 'cube-info':
        // 鑾峰彇绔嬫柟浣撲俊?        const cubeId = searchParams.get('cubeId');
        if (!cubeId) {
          return NextResponse.json(
            { error: '缂哄皯cubeId鍙傛暟' },
            { status: 400 }
          );
        }
        // 杩欓噷鍙互瀹炵幇绔嬫柟浣撳厓鏁版嵁鏌ヨ
        return NextResponse.json({
          cubeId,
          status: 'available',
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ error: '鏈煡鐨勬搷浣滅被? }, { status: 400 });
    }
  } catch (error: any) {
    console.error('澶氱淮鍒嗘瀽API閿欒:', error);
    return NextResponse.json(
      {
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊?,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, config, forceRefresh } = body;

    // 鑾峰彇褰撳墠鐢ㄦ埛
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: '鏈巿鏉冭? }, { status: 401 });
    }

    switch (action) {
      case 'analyze':
        // 鎵ц澶氱淮鍒嗘瀽鏌ヨ
        if (!config) {
          return NextResponse.json({ error: '缂哄皯鏌ヨ閰嶇疆' }, { status: 400 });
        }

        const queryResult = await queryBuilder.executeQuery(
          config as MultidimQueryConfig,
          currentUser.id,
          forceRefresh || false
        );

        return NextResponse.json({
          ...queryResult,
          timestamp: new Date().toISOString(),
        });

      case 'cube':
        // 鐢熸垚OLAP绔嬫柟?        if (!config) {
          return NextResponse.json({ error: '缂哄皯鏌ヨ閰嶇疆' }, { status: 400 });
        }

        const cube = await queryBuilder.generateOLAPCube(
          config as MultidimQueryConfig,
          currentUser.id
        );

        return NextResponse.json({
          cube,
          timestamp: new Date().toISOString(),
        });

      case 'save-template':
        // 淇濆瓨鏌ヨ妯℃澘
        const { templateName, templateDescription } = body;
        if (!config || !templateName) {
          return NextResponse.json({ error: '缂哄皯蹇呰鍙傛暟' }, { status: 400 });
        }

        // 杩欓噷鍙互瀹炵幇妯℃澘淇濆瓨閫昏緫
        return NextResponse.json({
          success: true,
          templateId: `template_${Date.now()}`,
          templateName,
          timestamp: new Date().toISOString(),
        });

      case 'export':
        // 瀵煎嚭鍒嗘瀽缁撴灉
        const { format = 'csv' } = body;
        if (!config) {
          return NextResponse.json({ error: '缂哄皯鏌ヨ閰嶇疆' }, { status: 400 });
        }

        const exportResult = await queryBuilder.executeQuery(
          config as MultidimQueryConfig,
          currentUser.id
        );

        // 鏍规嵁鏍煎紡鐢熸垚瀵煎嚭鏁版嵁
        let exportData: string;
        let contentType: string;

        switch (format.toLowerCase()) {
          case 'csv':
            exportData = generateCSV(exportResult);
            contentType = 'text/csv;charset=utf-8';
            break;
          case 'json':
            exportData = JSON.stringify(exportResult, null, 2);
            contentType = 'application/json';
            break;
          default:
            return NextResponse.json(
              { error: `涓嶆敮鎸佺殑瀵煎嚭鏍煎紡: ${format}` },
              { status: 400 }
            );
        }

        return new NextResponse(exportData, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="multidim-analysis-${Date.now()}.${format}"`,
          },
        });

      default:
        return NextResponse.json({ error: '鏈煡鐨勬搷浣滅被? }, { status: 400 });
    }
  } catch (error: any) {
    console.error('澶氱淮鍒嗘瀽API閿欒:', error);
    return NextResponse.json(
      {
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊?,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// 杈呭姪鍑芥暟锛氱敓鎴怌SV鏍煎紡鏁版嵁
function generateCSV(result: any): string {
  if (!result.data || result.data.length === 0) {
    return '';
  }

  const headers = result.columns.map((col: any) => col.displayName || col.name);
  const rows = result.data.map((row: any) =>
    result.columns
      .map((col: any) => {
        const value = row[col.name];
        // 澶勭悊鐗规畩瀛楃
        if (typeof value === 'string') {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

