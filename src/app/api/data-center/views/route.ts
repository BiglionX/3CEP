import { NextRequest, NextResponse } from 'next/server';
import { virtualViewExecutor, executeVirtualView, executeMultipleViews } from '@/data-center/virtualization/view-executor';
import { ViewManager } from '@/data-center/virtualization/views-definition';

// 视图管理器实例
const viewManager = new ViewManager();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';
    const viewName = searchParams.get('view');
    const useCache = searchParams.get('cache') !== 'false';
    const forceRefresh = searchParams.get('refresh') === 'true';

    switch (action) {
      case 'list':
        // 列出所有可用视图
        const views = viewManager.getAllViews().map(view => ({
          name: view.name,
          description: view.description,
          sourceCatalogs: view.sourceCatalogs,
          cacheEnabled: view.cacheEnabled,
          refreshInterval: view.refreshInterval
        }));
        
        return NextResponse.json({
          views,
          totalCount: views.length
        });

      case 'metadata':
        // 获取视图元数据
        if (!viewName) {
          return NextResponse.json(
            { error: '缺少view参数' },
            { status: 400 }
          );
        }
        
        const metadata = await virtualViewExecutor.getViewMetadata(viewName);
        return NextResponse.json(metadata);

      case 'execute':
        // 执行单个视图
        if (!viewName) {
          return NextResponse.json(
            { error: '缺少view参数' },
            { status: 400 }
          );
        }

        // 处理查询参数
        const parameters: Record<string, any> = {};
        for (const [key, value] of searchParams.entries()) {
          if (!['action', 'view', 'cache', 'refresh'].includes(key)) {
            parameters[key] = value;
          }
        }

        const result = await executeVirtualView(viewName, {
          useCache,
          forceRefresh,
          parameters: Object.keys(parameters).length > 0 ? parameters : undefined
        });

        return NextResponse.json(result);

      case 'batch':
        // 批量执行视图
        const viewNamesParam = searchParams.get('views');
        if (!viewNamesParam) {
          return NextResponse.json(
            { error: '缺少views参数' },
            { status: 400 }
          );
        }

        const viewNames = viewNamesParam.split(',').map(name => name.trim());
        const batchResults = await executeMultipleViews(viewNames, {
          useCache,
          forceRefresh
        });

        return NextResponse.json(batchResults);

      case 'warmup':
        // 预热视图缓存
        const warmupViews = searchParams.get('views');
        const viewsToWarm = warmupViews ? warmupViews.split(',').map(v => v.trim()) : undefined;
        
        await virtualViewExecutor.warmupViews(viewsToWarm);
        
        return NextResponse.json({
          message: '视图缓存预热完成',
          warmedViews: viewsToWarm || 'all_cached_views'
        });

      default:
        return NextResponse.json(
          { error: '未知的操作类型' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('虚拟视图API错误:', error);
    return NextResponse.json(
      { 
        error: error.message || '内部服务器错误',
        timestamp: new Date().toISOString()
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
            { error: '缺少viewName参数' },
            { status: 400 }
          );
        }

        const result = await executeVirtualView(viewName, {
          useCache: options?.useCache ?? true,
          forceRefresh: options?.forceRefresh ?? false,
          timeoutMs: options?.timeoutMs,
          parameters
        });

        return NextResponse.json(result);

      case 'batch':
        if (!viewNames || !Array.isArray(viewNames)) {
          return NextResponse.json(
            { error: '缺少viewNames数组参数' },
            { status: 400 }
          );
        }

        const batchResults = await executeMultipleViews(viewNames, {
          useCache: options?.useCache ?? true,
          forceRefresh: options?.forceRefresh ?? false,
          timeoutMs: options?.timeoutMs,
          parameters
        });

        return NextResponse.json(batchResults);

      case 'warmup':
        await virtualViewExecutor.warmupViews(viewNames);
        return NextResponse.json({
          message: '视图缓存预热完成',
          warmedViews: viewNames || 'all_cached_views'
        });

      default:
        return NextResponse.json(
          { error: '未知的操作类型' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('虚拟视图API错误:', error);
    return NextResponse.json(
      { 
        error: error.message || '内部服务器错误',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}