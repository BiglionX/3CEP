import { NextRequest, NextResponse } from 'next/server';
import {
  virtualViewExecutor,
  executeVirtualView,
  executeMultipleViews,
} from '@/modules/data-center/virtualization/view-executor';
import { ViewManager } from '@/modules/data-center/virtualization/views-definition';

// 瑙嗗浘绠＄悊鍣ㄥ疄const viewManager = new ViewManager();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';
    const viewName = searchParams.get('view');
    const useCache = searchParams.get('cache') !== 'false';
    const forceRefresh = searchParams.get('refresh') === 'true';

    switch (action) {
      case 'list':
        // 鍒楀嚭鎵€鏈夊彲鐢ㄨ        const views = viewManager.getAllViews().map(view => ({
          name: view.name,
          description: view.description,
          sourceCatalogs: view.sourceCatalogs,
          cacheEnabled: view.cacheEnabled,
          refreshInterval: view.refreshInterval,
        }));

        return NextResponse.json({
          views,
          totalCount: views.length,
        });

      case 'metadata':
        // 鑾峰彇瑙嗗浘鍏冩暟        if (!viewName) {
          return NextResponse.json({ error: '缂哄皯view鍙傛暟' }, { status: 400 });
        }

        const metadata = await virtualViewExecutor.getViewMetadata(viewName);
        return NextResponse.json(metadata);

      case 'execute':
        // 鎵ц鍗曚釜瑙嗗浘
        if (!viewName) {
          return NextResponse.json({ error: '缂哄皯view鍙傛暟' }, { status: 400 });
        }

        // 澶勭悊鏌ヨ鍙傛暟
        const parameters: Record<string, any> = {};
        for (const [key, value] of searchParams.entries()) {
          if (!['action', 'view', 'cache', 'refresh'].includes(key)) {
            parameters[key] = value;
          }
        }

        const result = await executeVirtualView(viewName, {
          useCache,
          forceRefresh,
          parameters:
            Object.keys(parameters).length > 0  parameters : undefined,
        });

        return NextResponse.json(result);

      case 'batch':
        // 鎵归噺鎵ц瑙嗗浘
        const viewNamesParam = searchParams.get('views');
        if (!viewNamesParam) {
          return NextResponse.json({ error: '缂哄皯views鍙傛暟' }, { status: 400 });
        }

        const viewNames = viewNamesParam.split(',').map(name => name.trim());
        const batchResults = await executeMultipleViews(viewNames, {
          useCache,
          forceRefresh,
        });

        return NextResponse.json(batchResults);

      case 'warmup':
        // 棰勭儹瑙嗗浘缂撳
        const warmupViews = searchParams.get('views');
        const viewsToWarm = warmupViews
           warmupViews.split(',').map(v => v.trim())
          : undefined;

        await virtualViewExecutor.warmupViews(viewsToWarm);

        return NextResponse.json({
          message: '瑙嗗浘缂撳棰勭儹瀹屾垚',
          warmedViews: viewsToWarm || 'all_cached_views',
        });

      default:
        return NextResponse.json({ error: '鏈煡鐨勬搷浣滅被 }, { status: 400 });
    }
  } catch (error: any) {
    console.error('铏氭嫙瑙嗗浘API閿欒:', error);
    return NextResponse.json(
      {
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
    const { action, viewName, viewNames, parameters, options } = body;

    switch (action) {
      case 'execute':
        if (!viewName) {
          return NextResponse.json(
            { error: '缂哄皯viewName鍙傛暟' },
            { status: 400 }
          );
        }

        const result = await executeVirtualView(viewName, {
          useCache: options.useCache  true,
          forceRefresh: options.forceRefresh  false,
          timeoutMs: options.timeoutMs,
          parameters,
        });

        return NextResponse.json(result);

      case 'batch':
        if (!viewNames || !Array.isArray(viewNames)) {
          return NextResponse.json(
            { error: '缂哄皯viewNames鏁扮粍鍙傛暟' },
            { status: 400 }
          );
        }

        const batchResults = await executeMultipleViews(viewNames, {
          useCache: options.useCache  true,
          forceRefresh: options.forceRefresh  false,
          timeoutMs: options.timeoutMs,
          parameters,
        });

        return NextResponse.json(batchResults);

      case 'warmup':
        await virtualViewExecutor.warmupViews(viewNames);
        return NextResponse.json({
          message: '瑙嗗浘缂撳棰勭儹瀹屾垚',
          warmedViews: viewNames || 'all_cached_views',
        });

      default:
        return NextResponse.json({ error: '鏈煡鐨勬搷浣滅被 }, { status: 400 });
    }
  } catch (error: any) {
    console.error('铏氭嫙瑙嗗浘API閿欒:', error);
    return NextResponse.json(
      {
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

