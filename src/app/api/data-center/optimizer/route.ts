import { NextRequest, NextResponse } from 'next/server';
import { queryOptimizer, planGenerator } from '@/data-center/optimizer/query-optimizer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'analyze';
    const query = searchParams.get('query');

    switch (action) {
      case 'analyze':
        if (!query) {
          return NextResponse.json(
            { error: '缺少query参数' },
            { status: 400 }
          );
        }

        // 生成查询计划
        const plan = planGenerator.parseQueryToPlan(query);
        
        // 优化查询计划
        const optimizedPlan = queryOptimizer.optimizeQueryPlan(plan);
        
        // 生成执行建议
        const advice = queryOptimizer.generateExecutionAdvice(query);

        return NextResponse.json({
          originalPlan: plan,
          optimizedPlan,
          executionAdvice: advice,
          timestamp: new Date().toISOString()
        });

      case 'performance':
        const queryId = searchParams.get('queryId');
        if (!queryId) {
          return NextResponse.json(
            { error: '缺少queryId参数' },
            { status: 400 }
          );
        }

        const performanceData = queryOptimizer.getQueryPerformanceAnalysis(queryId);
        return NextResponse.json({
          queryId,
          performanceData,
          timestamp: new Date().toISOString()
        });

      case 'rules':
        // 返回所有优化规则信息
        return NextResponse.json({
          optimizationRules: [
            {
              name: 'predicate_pushdown',
              description: '谓词下推优化',
              priority: 1
            },
            {
              name: 'column_pruning', 
              description: '列裁剪优化',
              priority: 2
            },
            {
              name: 'join_reordering',
              description: 'JOIN重排序优化', 
              priority: 3
            },
            {
              name: 'limit_pushdown',
              description: 'LIMIT下推优化',
              priority: 4
            }
          ]
        });

      default:
        return NextResponse.json(
          { error: '未知的操作类型' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('查询优化器API错误:', error);
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
    const { action, query, queryId, stats } = body;

    switch (action) {
      case 'optimize':
        if (!query) {
          return NextResponse.json(
            { error: '缺少query参数' },
            { status: 400 }
          );
        }

        const plan = planGenerator.parseQueryToPlan(query);
        const optimizedPlan = queryOptimizer.optimizeQueryPlan(plan);
        const advice = queryOptimizer.generateExecutionAdvice(query);

        return NextResponse.json({
          originalPlan: plan,
          optimizedPlan,
          executionAdvice: advice,
          optimizationApplied: optimizedPlan.optimizationInfo?.appliedRules || [],
          performanceGain: advice.estimatedPerformanceGain,
          timestamp: new Date().toISOString()
        });

      case 'record-stats':
        if (!stats || !queryId) {
          return NextResponse.json(
            { error: '缺少必要的统计信息' },
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
          timestamp: new Date().toISOString()
        });

        return NextResponse.json({
          message: '查询统计已记录',
          queryId
        });

      default:
        return NextResponse.json(
          { error: '未知的操作类型' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('查询优化器API错误:', error);
    return NextResponse.json(
      { 
        error: error.message || '内部服务器错误',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}