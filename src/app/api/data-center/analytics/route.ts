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
            { error: '缂哄皯partId鍙傛暟' },
            { status: 400 }
          );
        }

        // 瑙ｆ瀽鍒嗘瀽閫夐」
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
            { error: '缂哄皯partIds鍙傛暟' },
            { status: 400 }
          );
        }

        // 鎵归噺鍒嗘瀽澶氫釜閰嶄欢鐨勪环鏍艰秼?
        const comparisons = await Promise.all(
          partIds.map(async (id) => {
            try {
              return await priceTrendAnalyzer.analyzePriceTrend(id, {
                timeRange: '30d',
                includeForecast: false
              });
            } catch (error) {
              return { partId: id, error: '鍒嗘瀽澶辫触' };
            }
          })
        );

        return NextResponse.json({
          comparisons,
          timestamp: new Date().toISOString()
        });

      case 'market-overview':
        // 甯傚満姒傝鍒嗘瀽
        const category = searchParams.get('category') || 'all';
        const limit = parseInt(searchParams.get('limit') || '10');
        
        const marketOverview = await generateMarketOverview(category, limit);
        return NextResponse.json(marketOverview);

      case 'volatility-ranking':
        // 浠锋牸娉㈠姩鎺掑悕
        const volatilityRanking = await getPriceVolatilityRanking();
        return NextResponse.json(volatilityRanking);

      default:
        return NextResponse.json(
          { error: '鏈煡鐨勬搷浣滅被? },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('鏁版嵁鍒嗘瀽API閿欒:', error);
    return NextResponse.json(
      { 
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊?,
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
            { error: '缂哄皯partId鍙傛暟' },
            { status: 400 }
          );
        }

        const analysis = await priceTrendAnalyzer.analyzePriceTrend(partId, options);
        return NextResponse.json(analysis);

      case 'batch-analysis':
        if (!partIds || !Array.isArray(partIds)) {
          return NextResponse.json(
            { error: '缂哄皯partIds鏁扮粍鍙傛暟' },
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
                error: error instanceof Error ? error.message : '鏈煡閿欒' 
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
        // 鑷畾涔夊垎?
        const customAnalysis = await performCustomAnalysis(body);
        return NextResponse.json(customAnalysis);

      default:
        return NextResponse.json(
          { error: '鏈煡鐨勬搷浣滅被? },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('鏁版嵁鍒嗘瀽API閿欒:', error);
    return NextResponse.json(
      { 
        error: error.message || '鍐呴儴鏈嶅姟鍣ㄩ敊?,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// 杈呭姪鏂规硶
async function generateMarketOverview(category: string, limit: number) {
  // 妯℃嫙甯傚満姒傝鏁版嵁
  return {
    category,
    totalParts: 1000,
    analyzedParts: Math.min(limit, 100),
    averagePriceChange: 2.5,
    highestVolatility: [
      { partId: 'part_001', volatility: 15.2, partName: 'iPhone灞忓箷' },
      { partId: 'part_002', volatility: 12.8, partName: '鐢垫睜缁勪欢' },
      { partId: 'part_003', volatility: 10.5, partName: '鎽勫儚澶存ā? }
    ],
    lowestPrices: [
      { partId: 'part_004', price: 25.99, partName: '鍏呯數? },
      { partId: 'part_005', price: 15.50, partName: '淇濇姢? },
      { partId: 'part_006', price: 8.99, partName: '璐磋啘' }
    ],
    timestamp: new Date().toISOString()
  };
}

async function getPriceVolatilityRanking() {
  // 妯℃嫙浠锋牸娉㈠姩鎺掑悕
  return {
    ranking: [
      { rank: 1, partId: 'part_001', partName: '楂樼鎵嬫満灞忓箷', volatility: 25.5 },
      { rank: 2, partId: 'part_002', partName: '鍘熻鐢垫睜', volatility: 18.3 },
      { rank: 3, partId: 'part_003', partName: '鎽勫儚澶存ā?, volatility: 15.7 },
      { rank: 4, partId: 'part_004', partName: '涓绘澘鑺墖', volatility: 12.1 },
      { rank: 5, partId: 'part_005', partName: '鏄剧ず?, volatility: 9.8 }
    ],
    timeframe: '30锟?,
    timestamp: new Date().toISOString()
  };
}

async function performCustomAnalysis(requestBody: any) {
  // 鎵ц鑷畾涔夊垎鏋愰€昏緫
  const { analysisType, parameters } = requestBody;
  
  switch (analysisType) {
    case 'correlation':
      return {
        type: 'correlation',
        result: '閰嶄欢A鍜岄厤浠禕浠锋牸鐩稿叧绯绘暟: 0.75',
        confidence: 0.85
      };
      
    case 'seasonal':
      return {
        type: 'seasonal',
        result: '鍙戠幇鏄庢樉鐨勫鑺傛€т环鏍兼ā?,
        seasons: ['鏄ュ涓婃定15%', '澶忓涓嬮檷8%', '绉嬪绋冲畾', '鍐涓婃定12%']
      };
      
    default:
      return {
        type: 'unknown',
        result: '涓嶆敮鎸佺殑鍒嗘瀽绫诲瀷'
      };
  }
}
