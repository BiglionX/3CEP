import { NextRequest, NextResponse } from 'next/server';
import {
  queryOptimizer,
  planGenerator,
} from '@/data-center/optimizer/query-optimizer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'analyze';
    const query = searchParams.get('query');

    switch (action) {
      case 'analyze':
        if (!query) {
          return NextResponse.json({ error: '缂哄皯query鍙傛暟' }, { status: 400 });
        }

        // 鐢熸垚鏌ヨ璁″垝
        const plan = planGenerator.parseQueryToPlan(query);

        // 浼樺寲鏌ヨ璁″垝
        const optimizedPlan = queryOptimizer.optimizeQueryPlan(plan);

        // 鐢熸垚鎵ц寤鸿
        const advice = queryOptimizer.generateExecutionAdvice(query);

        return NextResponse.json({
          originalPlan: plan,
          optimizedPlan,
          executionAdvice: advice,
          timestamp: new Date().toISOString(),
        });

      case 'performance':
        const queryId = searchParams.get('queryId');
        if (!queryId) {
          return NextResponse.json(
            { error: '缂哄皯queryId鍙傛暟' },
            { status: 400 }
          );
        }

        const performanceData =
          queryOptimizer.getQueryPerformanceAnalysis(queryId);
        return NextResponse.json({
          queryId,
          performanceData,
          timestamp: new Date().toISOString(),
        });

      case 'rules':
        // 杩斿洖鎵€鏈変紭鍖栬鍒欎俊?        return NextResponse.json({
          optimizationRules: [
            {
              name: 'predicate_pushdown',
              description: '璋撹瘝涓嬫帹浼樺寲',
              priority: 1,
            },
            {
              name: 'column_pruning',
              description: '鍒楄鍓紭?,
              priority: 2,
            },
            {
              name: 'join_reordering',
              description: 'JOIN閲嶆帓搴忎紭?,
              priority: 3,
            },
            {
              name: 'limit_pushdown',
              description: 'LIMIT涓嬫帹浼樺寲',
              priority: 4,
            },
          ],
        });

      default:
        return NextResponse.json({ error: '鏈煡鐨勬搷浣滅被? }, { status: 400 });
    }
  } catch (error: any) {
    console.error('鏌ヨ浼樺寲鍣ˋPI閿欒:', error);
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
    const { action, query, queryId, stats } = body;

    switch (action) {
      case 'optimize':
        if (!query) {
          return NextResponse.json({ error: '缂哄皯query鍙傛暟' }, { status: 400 });
        }

        const plan = planGenerator.parseQueryToPlan(query);
        const optimizedPlan = queryOptimizer.optimizeQueryPlan(plan);
        const advice = queryOptimizer.generateExecutionAdvice(query);

        return NextResponse.json({
          originalPlan: plan,
          optimizedPlan,
          executionAdvice: advice,
          optimizationApplied: optimizedPlan?.appliedRules || [],
          performanceGain: advice.estimatedPerformanceGain,
          timestamp: new Date().toISOString(),
        });

      case 'record-stats':
        if (!stats || !queryId) {
          return NextResponse.json(
            { error: '缂哄皯蹇呰鐨勭粺璁′俊? },
            { status: 400 }
          );
        }

        queryOptimizer.recordQueryStats({
          queryId,
          executionTimeMs: stats.executionTimeMs || 0,
          rowsProcessed: stats.rowsProcessed || 0,
          bytesProcessed: stats.bytesProcessed || 0,
          cacheHit: stats.cacheHit || false,
          optimizationApplied: stats.optimizationApplied || [],
          timestamp: new Date().toISOString(),
        });

        return NextResponse.json({
          message: '鏌ヨ缁熻宸茶?,
          queryId,
        });

      default:
        return NextResponse.json({ error: '鏈煡鐨勬搷浣滅被? }, { status: 400 });
    }
  } catch (error: any) {
    console.error('鏌ヨ浼樺寲鍣ˋPI閿欒:', error);
    return NextResponse.json(
      {
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊?,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

