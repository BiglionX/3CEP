import { NextRequest, NextResponse } from 'next/server';

/**
 * 技能执行 API - 用于沙箱测试
 * POST /api/v1/skills/[skillName]/execute
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { skillName: string } }
) {
  try {
    const startTime = Date.now();
    const { skillName } = params;

    // 解析请求体
    const body = await request.json();
    const { version = '1.0.0', parameters = {}, context = {} } = body;

    // 验证 API Key（简单验证，生产环境应该连接数据库）
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SKILL_002',
            message: '缺少 API Key',
          },
          metadata: {
            executionTimeMs: Date.now() - startTime,
            version,
            timestamp: Date.now(),
          },
        },
        { status: 401 }
      );
    }

    // 模拟技能执行（实际应该调用真实的技能包）
    const result = await executeSkill(skillName, parameters);

    // 返回结果
    return NextResponse.json({
      success: true,
      data: result.data,
      metadata: {
        executionTimeMs: Date.now() - startTime,
        version,
        timestamp: Date.now(),
        traceId: context.traceId || `trace_${Date.now()}`,
        billing: result.billing,
      },
    });
  } catch (error) {
    console.error('技能执行失败:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SKILL_006',
          message: error instanceof Error ? error.message : '技能执行失败',
        },
        metadata: {
          executionTimeMs: Date.now() - startTime,
          version: 'unknown',
          timestamp: Date.now(),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * 模拟技能执行（替换为真实的技能调用逻辑）
 */
async function executeSkill(skillName: string, params: any) {
  // 这里应该根据 skillName 动态导入和调用真实的技能包
  // 目前返回模拟数据用于测试

  switch (skillName) {
    case 'procyc-find-shop':
      return {
        data: {
          shops: [
            {
              id: 'shop_001',
              name: '中关村维修店',
              address: '中关村大街 1 号',
              city: '北京',
              distance: 1.2,
              phone: '010-12345678',
              rating: 4.8,
            },
            {
              id: 'shop_002',
              name: '海淀维修中心',
              address: '海淀路 88 号',
              city: '北京',
              distance: 2.5,
              phone: '010-87654321',
              rating: 4.6,
            },
          ],
          total: 15,
        },
        billing: {
          charged: true,
          cost: 0.1,
          currency: 'FCX',
        },
      };

    case 'procyc-fault-diagnosis':
      return {
        data: {
          diagnosis: '主板电源管理芯片故障',
          confidence: 0.85,
          suggestedParts: ['电源 IC', '充电芯片'],
          repairDifficulty: '中等',
          estimatedCost: 150,
        },
        billing: {
          charged: true,
          cost: 0.2,
          currency: 'FCX',
        },
      };

    case 'procyc-part-lookup':
      return {
        data: {
          parts: [
            {
              id: 'part_001',
              name: 'iPhone 14 屏幕总成',
              price: 899,
              currency: 'CNY',
              stock: 50,
              compatibility: 1.0,
            },
            {
              id: 'part_002',
              name: 'iPhone 14 电池',
              price: 299,
              currency: 'CNY',
              stock: 100,
              compatibility: 1.0,
            },
          ],
          total: 23,
        },
        billing: {
          charged: true,
          cost: 0.15,
          currency: 'FCX',
        },
      };

    case 'procyc-estimate-value':
      return {
        data: {
          estimatedValue: 3500,
          currency: 'CNY',
          confidence: 0.82,
          breakdown: {
            originalPrice: 5999,
            depreciation: 1500,
            componentScore: 0.85,
            conditionMultiplier: 0.9,
            brandMultiplier: 1.1,
            ageMultiplier: 0.7,
            repairMultiplier: 0.95,
          },
          marketComparison: {
            averagePrice: 3600,
            minPrice: 3200,
            maxPrice: 4000,
          },
        },
        billing: {
          charged: true,
          cost: 0.25,
          currency: 'FCX',
        },
      };

    default:
      throw new Error(`未知技能：${skillName}`);
  }
}
