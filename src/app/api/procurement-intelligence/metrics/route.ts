// 涓氬姟鎸囨爣鐩戞帶API绔偣

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'realtime';

    // 妯℃嫙涓氬姟鎸囨爣鏁版嵁
    const mockMetrics = {
      supplier_match_success_rate: 92.5,
      price_optimization_savings: 15.8,
      decision_confidence_score: 87.3,
      risk_assessment_coverage: 96.2,
      market_intelligence_accuracy: 88.7,
      contract_advice_adoption: 73.4,
      procurement_cycle_time: 12.5,
      supplier_diversity_index: 0.72,
      compliance_score: 94.1,
      cost_reduction_rate: 18.3,
    };

    const mockAlerts = [
      {
        id: 'alert_001',
        metric_type: 'supplier_match_success_rate',
        level: 'info',
        message: '渚涘簲鍟嗗尮閰嶆垚鍔熺巼琛ㄧ幇鑹ソ锛岃揪92.5%',
        timestamp: new Date().toISOString(),
        currentValue: 92.5,
        threshold: 90,
      },
    ];

    let responseData;

    switch (type) {
      case 'realtime':
        responseData = {
          success: true,
          data: {
            timestamp: new Date().toISOString(),
            metrics: mockMetrics,
            trends: Object.keys(mockMetrics).reduce(
              (acc, key) => {
                acc[key as keyof typeof mockMetrics] =
                  Math.random() > 0.5  'up' : 'stable';
                return acc;
              },
              {} as Record<keyof typeof mockMetrics, 'up' | 'down' | 'stable'>
            ),
            alerts: mockAlerts,
          },
        };
        break;

      case 'config':
        responseData = {
          success: true,
          data: {
            supplier_match_success_rate: {
              name: '渚涘簲鍟嗗尮閰嶆垚鍔熺巼',
              unit: '%',
              thresholds: { critical: 60, warning: 75, good: 90 },
            },
            price_optimization_savings: {
              name: '牸樺寲鑺傜渷,
              unit: '%',
              thresholds: { critical: 2, warning: 5, good: 15 },
            },
          },
        };
        break;

      default:
        responseData = {
          success: true,
          data: mockMetrics,
          timestamp: new Date().toISOString(),
        };
    }

    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 妯℃嫙璁板綍鎸囨爣
    console.log('璁板綍涓氬姟鎸囨爣:', body);

    return NextResponse.json({
      success: true,
      message: '鎸囨爣鏁版嵁璁板綍鎴愬姛',
      data: body,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

