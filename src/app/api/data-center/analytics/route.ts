import { NextRequest, NextResponse } from 'next/server';
import { priceTrendAnalyzer } from '@/data-center/analytics/price-trend-analyzer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'price-trend';
    const partId = searchParams.get('partId');

    switch (action) {
      case 'price-trend':
        if (!partId) {
          return NextResponse.json(
            { error: '缺少partId参数' },
            { status: 400 }
          );
        }

        // 解析分析选项
        const timeRange = searchParams.get('timeRange') || '30d';
        const platforms = searchParams.get('platforms')?.split(',') || [];
        const includeForecast = searchParams.get('forecast') !== 'false';
        const forecastDays = parseInt(searchParams.get('forecastDays') || '7');
        const granularity = searchParams.get('granularity') || 'daily';

        const analysis = await priceTrendAnalyzer.analyzePriceTrend(partId, {
          timeRange: timeRange as any,
          platforms: platforms.length > 0 ? platforms : undefined,
          includeForecast,
          forecastDays,
          granularity: granularity as any
        });

        return NextResponse.json(analysis);

      case 'price-comparison':
        const partIds = searchParams.get('partIds')?.split(',');
        if (!partIds || partIds.length === 0) {
          return NextResponse.json(
            { error: '缺少partIds参数' },
            { status: 400 }
          );
        }

        // 批量分析多个配件的价格趋势
        const comparisons = await Promise.all(
          partIds.map(async (id) => {
            try {
              return await priceTrendAnalyzer.analyzePriceTrend(id, {
                timeRange: '30d',
                includeForecast: false
              });
            } catch (error) {
              return { partId: id, error: '分析失败' };
            }
          })
        );

        return NextResponse.json({
          comparisons,
          timestamp: new Date().toISOString()
        });

      case 'market-overview':
        // 市场概览分析
        const category = searchParams.get('category') || 'all';
        const limit = parseInt(searchParams.get('limit') || '10');
        
        const marketOverview = await generateMarketOverview(category, limit);
        return NextResponse.json(marketOverview);

      case 'volatility-ranking':
        // 价格波动排名
        const volatilityRanking = await getPriceVolatilityRanking();
        return NextResponse.json(volatilityRanking);

      default:
        return NextResponse.json(
          { error: '未知的操作类型' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('数据分析API错误:', error);
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
    const { action, partId, partIds, options } = body;

    switch (action) {
      case 'price-trend':
        if (!partId) {
          return NextResponse.json(
            { error: '缺少partId参数' },
            { status: 400 }
          );
        }

        const analysis = await priceTrendAnalyzer.analyzePriceTrend(partId, options);
        return NextResponse.json(analysis);

      case 'batch-analysis':
        if (!partIds || !Array.isArray(partIds)) {
          return NextResponse.json(
            { error: '缺少partIds数组参数' },
            { status: 400 }
          );
        }

        const batchResults = await Promise.all(
          partIds.map(async (id: string) => {
            try {
              const result = await priceTrendAnalyzer.analyzePriceTrend(id, options);
              return { success: true, data: result };
            } catch (error) {
              return { 
                success: false, 
                partId: id, 
                error: error instanceof Error ? error.message : '未知错误' 
              };
            }
          })
        );

        return NextResponse.json({
          results: batchResults,
          successful: batchResults.filter(r => r.success).length,
          failed: batchResults.filter(r => !r.success).length,
          timestamp: new Date().toISOString()
        });

      case 'custom-analysis':
        // 自定义分析
        const customAnalysis = await performCustomAnalysis(body);
        return NextResponse.json(customAnalysis);

      default:
        return NextResponse.json(
          { error: '未知的操作类型' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('数据分析API错误:', error);
    return NextResponse.json(
      { 
        error: error.message || '内部服务器错误',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// 辅助方法
async function generateMarketOverview(category: string, limit: number) {
  // 模拟市场概览数据
  return {
    category,
    totalParts: 1000,
    analyzedParts: Math.min(limit, 100),
    averagePriceChange: 2.5,
    highestVolatility: [
      { partId: 'part_001', volatility: 15.2, partName: 'iPhone屏幕' },
      { partId: 'part_002', volatility: 12.8, partName: '电池组件' },
      { partId: 'part_003', volatility: 10.5, partName: '摄像头模块' }
    ],
    lowestPrices: [
      { partId: 'part_004', price: 25.99, partName: '充电线' },
      { partId: 'part_005', price: 15.50, partName: '保护壳' },
      { partId: 'part_006', price: 8.99, partName: '贴膜' }
    ],
    timestamp: new Date().toISOString()
  };
}

async function getPriceVolatilityRanking() {
  // 模拟价格波动排名
  return {
    ranking: [
      { rank: 1, partId: 'part_001', partName: '高端手机屏幕', volatility: 25.5 },
      { rank: 2, partId: 'part_002', partName: '原装电池', volatility: 18.3 },
      { rank: 3, partId: 'part_003', partName: '摄像头模块', volatility: 15.7 },
      { rank: 4, partId: 'part_004', partName: '主板芯片', volatility: 12.1 },
      { rank: 5, partId: 'part_005', partName: '显示屏', volatility: 9.8 }
    ],
    timeframe: '30天',
    timestamp: new Date().toISOString()
  };
}

async function performCustomAnalysis(requestBody: any) {
  // 执行自定义分析逻辑
  const { analysisType, parameters } = requestBody;
  
  switch (analysisType) {
    case 'correlation':
      return {
        type: 'correlation',
        result: '配件A和配件B价格相关系数: 0.75',
        confidence: 0.85
      };
      
    case 'seasonal':
      return {
        type: 'seasonal',
        result: '发现明显的季节性价格模式',
        seasons: ['春季上涨15%', '夏季下降8%', '秋季稳定', '冬季上涨12%']
      };
      
    default:
      return {
        type: 'unknown',
        result: '不支持的分析类型'
      };
  }
}