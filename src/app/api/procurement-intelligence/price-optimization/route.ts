import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 鍒濆鍖朣upabase瀹㈡埛?const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: '缂哄皯蹇呰鍙傛暟: action' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'optimize_procurement_timing':
        const timingResult = await optimizeProcurementTiming(params);
        return NextResponse.json(timingResult);

      case 'analyze_price_trends':
        const trendResult = await analyzePriceTrends(params);
        return NextResponse.json(trendResult);

      case 'calculate_cost_savings':
        const savingsResult = await calculateCostSavings(params);
        return NextResponse.json(savingsResult);

      case 'generate_optimization_strategies':
        const strategyResult = await generateOptimizationStrategies(params);
        return NextResponse.json(strategyResult);

      case 'predict_future_prices':
        const predictionResult = await predictFuturePrices(params);
        return NextResponse.json(predictionResult);

      default:
        return NextResponse.json(
          { success: false, error: `涓嶆敮鎸佺殑鎿嶄綔: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('浠锋牸浼樺寲API閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鏈嶅姟鍣ㄥ唴閮ㄩ敊?,
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const commodity = searchParams.get('commodity');

    if (!action) {
      return NextResponse.json(
        { success: false, error: '缂哄皯蹇呰鍙傛暟: action' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'current_opportunities':
        const opportunities = await getCurrentOpportunities();
        return NextResponse.json(opportunities);

      case 'price_history':
        if (!commodity) {
          return NextResponse.json(
            { success: false, error: '缂哄皯commodity鍙傛暟' },
            { status: 400 }
          );
        }
        const history = await getPriceHistory(commodity);
        return NextResponse.json(history);

      case 'market_sentiment':
        const sentiment = await getMarketSentiment();
        return NextResponse.json(sentiment);

      case 'health_check':
        return NextResponse.json({
          success: true,
          message: '浠锋牸浼樺寲鏈嶅姟杩愯姝ｅ父',
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { success: false, error: `涓嶆敮鎸佺殑鎿嶄綔: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('浠锋牸浼樺寲GET API閿欒:', error);
    return NextResponse.json(
      {
        success: false,
        error: '鏌ヨ澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// 鏍稿績浠锋牸浼樺寲鍑芥暟
async function optimizeProcurementTiming(params: any) {
  try {
    const {
      commodity,
      quantity,
      deliveryWindow,
      budgetRange,
      riskTolerance = 'medium',
    } = params;

    // 1. 楠岃瘉蹇呰鍙傛暟
    if (!commodity || !quantity) {
      return {
        success: false,
        error: '缂哄皯蹇呰鍙傛暟: commodity 锟?quantity',
      };
    }

    // 2. 鑾峰彇褰撳墠甯傚満浠锋牸
    const currentPrices = await getCurrentPrices(commodity);

    // 3. 鍒嗘瀽浠锋牸瓒嬪娍
    const trendAnalysis = await analyzePriceTrends({ commodity });

    // 4. 璁＄畻鏈€浼橀噰璐椂?    const optimalTiming = calculateOptimalTiming(
      currentPrices,
      trendAnalysis,
      deliveryWindow,
      riskTolerance
    );

    // 5. 璁＄畻棰勬湡鑺傜渷
    const expectedSavings = calculateExpectedSavings(
      currentPrices,
      optimalTiming,
      quantity,
      budgetRange
    );

    // 6. 鐢熸垚椋庨櫓璇勪及
    const riskAssessment = assessRiskLevel(
      optimalTiming,
      trendAnalysis,
      riskTolerance
    );

    // 7. 鐢熸垚琛屽姩寤鸿
    const recommendations = generateActionRecommendations(
      optimalTiming,
      expectedSavings,
      riskAssessment
    );

    return {
      success: true,
      optimization: {
        commodity,
        quantity,
        currentPrice: currentPrices.current,
        optimalTiming,
        expectedSavings,
        riskAssessment,
        recommendations,
        confidenceLevel: calculateConfidenceLevel(trendAnalysis, optimalTiming),
      },
    };
  } catch (error) {
    console.error('閲囪喘鏃舵満浼樺寲閿欒:', error);
    return {
      success: false,
      error: `浼樺寲澶辫触: ${(error as Error).message}`,
    };
  }
}

async function analyzePriceTrends(params: any) {
  try {
    const {
      commodity,
      period = '12m',
      algorithm = 'linear_regression',
    } = params;

    if (!commodity) {
      return {
        success: false,
        error: '缂哄皯蹇呰鍙傛暟: commodity',
      };
    }

    // 鑾峰彇鍘嗗彶浠锋牸鏁版嵁
    const priceHistory = await getPriceHistory(commodity, period);

    // 鎵ц瓒嬪娍鍒嗘瀽
    const trendAnalysis = performTrendAnalysis(priceHistory, algorithm);

    // 璁＄畻娉㈠姩鎬ф寚?    const volatilityMetrics = calculateVolatilityMetrics(priceHistory);

    // 璇嗗埆鍏抽敭鏀拺鍜岄樆鍔涗綅
    const supportResistance = identifySupportResistance(priceHistory);

    return {
      success: true,
      trendAnalysis: {
        commodity,
        period,
        currentTrend: trendAnalysis.trend,
        trendStrength: trendAnalysis.strength,
        volatility: volatilityMetrics,
        supportLevels: supportResistance.support,
        resistanceLevels: supportResistance.resistance,
        priceForecast: trendAnalysis.forecast,
        confidence: trendAnalysis.confidence,
      },
    };
  } catch (error) {
    console.error('浠锋牸瓒嬪娍鍒嗘瀽閿欒:', error);
    return {
      success: false,
      error: `瓒嬪娍鍒嗘瀽澶辫触: ${(error as Error).message}`,
    };
  }
}

async function calculateCostSavings(params: any) {
  try {
    const {
      commodity,
      currentPrice,
      historicalPrices,
      quantity,
      procurementStrategy = 'immediate',
    } = params;

    if (!commodity || !currentPrice || !historicalPrices) {
      return {
        success: false,
        error: '缂哄皯蹇呰鍙傛暟: commodity, currentPrice 锟?historicalPrices',
      };
    }

    // 璁＄畻鍘嗗彶骞冲潎浠锋牸
    const avgHistoricalPrice =
      historicalPrices.reduce((sum: number, price: number) => sum + price, 0) /
      historicalPrices.length;

    // 璁＄畻浠锋牸宸紓
    const priceDifference = avgHistoricalPrice - currentPrice;
    const percentageDifference = (priceDifference / avgHistoricalPrice) * 100;

    // 璁＄畻娼滃湪鑺傜渷閲戦
    const potentialSavings = Math.abs(priceDifference) * quantity;

    // 鍩轰簬閲囪喘绛栫暐璋冩暣鑺傜渷棰勬湡
    const strategyMultiplier = getStrategyMultiplier(procurementStrategy);
    const adjustedSavings = potentialSavings * strategyMultiplier;

    // 璁＄畻鑺傜渷姒傜巼
    const savingsProbability = calculateSavingsProbability(
      currentPrice,
      historicalPrices,
      procurementStrategy
    );

    return {
      success: true,
      costSavings: {
        commodity,
        currentPrice,
        averageHistoricalPrice: avgHistoricalPrice,
        priceDifference: priceDifference,
        percentageDifference: percentageDifference,
        quantity,
        rawPotentialSavings: potentialSavings,
        adjustedPotentialSavings: adjustedSavings,
        savingsProbability: savingsProbability,
        procurementStrategy,
        confidence: Math.min(0.95, 0.7 + Math.abs(percentageDifference) / 20),
      },
    };
  } catch (error) {
    console.error('鎴愭湰鑺傜渷璁＄畻閿欒:', error);
    return {
      success: false,
      error: `鑺傜渷璁＄畻澶辫触: ${(error as Error).message}`,
    };
  }
}

async function generateOptimizationStrategies(params: any) {
  try {
    const {
      commodities,
      budgetConstraints,
      timelineRequirements,
      riskPreferences,
    } = params;

    if (!Array.isArray(commodities) || commodities.length === 0) {
      return {
        success: false,
        error: 'commodities蹇呴』鏄潪绌烘暟?,
      };
    }

    const strategies = [];

    for (const commodity of commodities) {
      // 鑾峰彇鍟嗗搧褰撳墠鐘?      const currentPrices = await getCurrentPrices(commodity);
      const trendAnalysis = await analyzePriceTrends({ commodity });

      // 鐢熸垚閽堝璇ュ晢鍝佺殑绛栫暐
      const commodityStrategy = createCommodityStrategy(
        commodity,
        currentPrices,
        trendAnalysis,
        budgetConstraints,
        timelineRequirements,
        riskPreferences
      );

      strategies.push(commodityStrategy);
    }

    // 鐢熸垚缁勫悎浼樺寲绛栫暐
    const portfolioStrategy = optimizePortfolio(strategies, budgetConstraints);

    return {
      success: true,
      strategies: {
        individual: strategies,
        portfolio: portfolioStrategy,
        recommendations: generatePortfolioRecommendations(portfolioStrategy),
      },
    };
  } catch (error) {
    console.error('浼樺寲绛栫暐鐢熸垚閿欒:', error);
    return {
      success: false,
      error: `绛栫暐鐢熸垚澶辫触: ${(error as Error).message}`,
    };
  }
}

async function predictFuturePrices(params: any) {
  try {
    const {
      commodity,
      forecastHorizon = 30, // 澶╂暟
      algorithm = 'exponential_smoothing',
      confidenceLevel = 0.95,
    } = params;

    if (!commodity) {
      return {
        success: false,
        error: '缂哄皯蹇呰鍙傛暟: commodity',
      };
    }

    // 鑾峰彇鍘嗗彶鏁版嵁
    const historicalData = await getPriceHistory(commodity, '24m');

    // 鎵ц棰勬祴
    const predictions = performPricePrediction(
      historicalData,
      forecastHorizon,
      algorithm,
      confidenceLevel
    );

    // 璁＄畻棰勬祴鍖洪棿
    const predictionIntervals = calculatePredictionIntervals(
      predictions,
      confidenceLevel
    );

    return {
      success: true,
      predictions: {
        commodity,
        forecastHorizon,
        algorithm,
        pointForecasts: predictions,
        predictionIntervals,
        confidenceLevel,
        modelAccuracy: assessModelAccuracy(historicalData, predictions),
      },
    };
  } catch (error) {
    console.error('浠锋牸棰勬祴閿欒:', error);
    return {
      success: false,
      error: `棰勬祴澶辫触: ${(error as Error).message}`,
    };
  }
}

// 杈呭姪鍑芥暟
async function getCurrentPrices(commodity: string) {
  try {
    const { data, error } = await supabase
      .from('international_price_indices')
      .select('*')
      .eq('commodity', commodity)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // 濡傛灉娌℃湁鎵惧埌鏁版嵁锛岃繑鍥炴ā鎷熸暟?      return {
        current: 100 + Math.random() * 50,
        previous: 95 + Math.random() * 50,
        change: (Math.random() - 0.5) * 10,
        changePercent: (Math.random() - 0.5) * 20,
      };
    }

    return {
      current: data.price,
      previous: data.price * (1 - data.volatility_index / 100),
      change: data.price * (data.volatility_index / 100),
      changePercent: data.volatility_index,
    };
  } catch (error) {
    console.warn('鑾峰彇褰撳墠浠锋牸澶辫触锛屼娇鐢ㄩ粯璁?', error);
    return {
      current: 100,
      previous: 95,
      change: 5,
      changePercent: 5.26,
    };
  }
}

async function getPriceHistory(commodity: string, period: string = '12m') {
  try {
    const months = parseInt(period.replace('m', ''));
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const { data, error } = await supabase
      .from('international_price_indices')
      .select('price, recorded_at')
      .eq('commodity', commodity)
      .gte('recorded_at', startDate.toISOString())
      .order('recorded_at');

    if (error) {
      // 杩斿洖妯℃嫙鍘嗗彶鏁版嵁
      return generateMockPriceHistory(months);
    }

    return (
      data?.map(item => ({
        date: item.recorded_at,
        price: item.price,
      })) || generateMockPriceHistory(months)
    );
  } catch (error) {
    console.warn('鑾峰彇浠锋牸鍘嗗彶澶辫触锛屼娇鐢ㄦā鎷熸暟?', error);
    return generateMockPriceHistory(12);
  }
}

async function getCurrentOpportunities() {
  try {
    // 妯℃嫙鑾峰彇褰撳墠甯傚満鏈轰細
    const opportunities = [
      {
        id: 'opp_001',
        commodity: '鍗婂浣撹姱?,
        currentPrice: 126.8,
        historicalLow: 110.5,
        savingsPotential: 12.9,
        confidence: 0.85,
        timing: 'immediate',
        recommendation: '浠锋牸澶勪簬?涓湀浣庝綅锛屽缓璁珛鍗抽噰?,
      },
      {
        id: 'opp_002',
        commodity: '绋€鍦熸潗?,
        currentPrice: 86.7,
        historicalAverage: 95.2,
        savingsPotential: 8.9,
        confidence: 0.78,
        timing: 'short_term',
        recommendation: '浠锋牸浣庝簬鍘嗗彶鍧囧€硷紝鏈潵2-3鍛ㄥ唴閲囪喘',
      },
    ];

    return {
      success: true,
      opportunities,
      totalOpportunities: opportunities.length,
      updateTime: new Date().toISOString(),
    };
  } catch (error) {
    console.error('鑾峰彇甯傚満鏈轰細閿欒:', error);
    return {
      success: false,
      error: `鑾峰彇鏈轰細澶辫触: ${(error as Error).message}`,
    };
  }
}

function calculateOptimalTiming(
  currentPrices: any,
  trendAnalysis: any,
  deliveryWindow: any,
  riskTolerance: string
) {
  const riskMultipliers = {
    low: 0.8,
    medium: 1.0,
    high: 1.2,
  };

  const multiplier =
    riskMultipliers[riskTolerance as keyof typeof riskMultipliers] || 1.0;

  // 鍩轰簬瓒嬪娍鍜屽綋鍓嶄环鏍艰绠楁渶浣虫椂?  let timing = 'immediate';
  let reason = '';

  if (
    trendAnalysis.trend === 'down' &&
    Math.abs(trendAnalysis.strength) > 0.6
  ) {
    timing = 'short_term';
    reason = '浠锋牸鍛堜笅闄嶈秼鍔匡紝寤鸿鐭湡瑙傛湜';
  } else if (currentPrices.current < currentPrices.previous * 0.95) {
    timing = 'immediate';
    reason = '浠锋牸澶勪簬鐩稿浣庝綅锛屽缓璁珛鍗抽噰?;
  } else {
    timing = 'monitor';
    reason = '浠锋牸鐩稿绋冲畾锛屽缓璁寔缁洃?;
  }

  return {
    timing: timing,
    reason: reason,
    recommendedAction:
      timing === 'immediate'
        ? 'BUY_NOW'
        : timing === 'short_term'
          ? 'WAIT_2_3_WEEKS'
          : 'MONITOR',
    riskAdjusted: timing !== 'immediate' ? multiplier : 1.0,
  };
}

function calculateExpectedSavings(
  currentPrices: any,
  optimalTiming: any,
  quantity: number,
  budgetRange: any
) {
  const baseSavings = currentPrices.changePercent || 5;
  const timingMultiplier = optimalTiming.timing === 'immediate' ? 1.0 : 0.8;

  const expectedPercentage = baseSavings * timingMultiplier;
  const expectedAmount =
    (currentPrices.current * quantity * expectedPercentage) / 100;

  return {
    percentage: expectedPercentage,
    amount: expectedAmount,
    timeframe: '30澶╁唴',
    probability: Math.min(0.9, 0.6 + expectedPercentage / 20),
  };
}

function assessRiskLevel(
  optimalTiming: any,
  trendAnalysis: any,
  riskTolerance: string
) {
  const baseRisk = trendAnalysis?.overall_volatility || 0.15;

  const riskLevels = {
    low: baseRisk * 0.7,
    medium: baseRisk,
    high: baseRisk * 1.3,
  };

  const calculatedRisk =
    riskLevels[riskTolerance as keyof typeof riskLevels] || baseRisk;

  let riskCategory = 'low';
  if (calculatedRisk > 0.3) riskCategory = 'high';
  else if (calculatedRisk > 0.15) riskCategory = 'medium';

  return {
    score: Math.round(calculatedRisk * 100),
    level: riskCategory,
    factors: [
      `瓒嬪娍寮哄害: ${trendAnalysis.strength}`,
      `娉㈠姩? ${trendAnalysis?.overall_volatility}`,
      `椋庨櫓瀹瑰繊? ${riskTolerance}`,
    ],
  };
}

function generateActionRecommendations(
  optimalTiming: any,
  expectedSavings: any,
  riskAssessment: any
) {
  const recommendations = [];

  if (optimalTiming.timing === 'immediate') {
    recommendations.push('绔嬪嵆鎵ц閲囪喘璁″垝');
    recommendations.push(
      `棰勬湡鍙妭?${expectedSavings.percentage.toFixed(1)}%`
    );
  } else if (optimalTiming.timing === 'short_term') {
    recommendations.push('鍦ㄦ湭?-3鍛ㄥ唴瀵嗗垏鐩戞帶浠锋牸');
    recommendations.push('璁剧疆浠锋牸鎻愰啋锛岃揪鍒扮洰鏍囦环浣嶆椂绔嬪嵆閲囪喘');
  } else {
    recommendations.push('鎸佺画鐩戞帶甯傚満浠锋牸鍙樺寲');
    recommendations.push('寤虹珛浠锋牸瑙傚療娓呭崟');
  }

  if (riskAssessment.level === 'high') {
    recommendations.push('鑰冭檻鍒嗘暎閲囪喘闄嶄綆椋庨櫓');
    recommendations.push('鍑嗗搴旀€ラ?);
  }

  return recommendations;
}

function calculateConfidenceLevel(trendAnalysis: any, optimalTiming: any) {
  const trendConfidence = trendAnalysis.confidence || 0.7;
  const timingFactor = optimalTiming.timing === 'immediate' ? 0.9 : 0.7;

  return Math.min(0.95, trendConfidence * timingFactor);
}

function performTrendAnalysis(priceHistory: any[], algorithm: string) {
  // 绠€鍖栫殑瓒嬪娍鍒嗘瀽瀹炵幇
  if (priceHistory.length < 2) {
    return {
      trend: 'stable',
      strength: 0,
      forecast: [],
      confidence: 0.5,
    };
  }

  const prices = priceHistory.map(item => item.price);
  const recentPrices = prices.slice(-6); // 鏈€?涓暟鎹偣

  // 璁＄畻绠€鍗曠Щ鍔ㄥ钩?  const sma =
    recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;
  const currentPrice = prices[prices.length - 1];

  let trend = 'stable';
  let strength = 0;

  if (currentPrice > sma * 1.05) {
    trend = 'up';
    strength = Math.min(1, (currentPrice / sma - 1) * 2);
  } else if (currentPrice < sma * 0.95) {
    trend = 'down';
    strength = Math.min(1, (1 - currentPrice / sma) * 2);
  }

  return {
    trend,
    strength,
    forecast: generateSimpleForecast(prices, 5),
    confidence: 0.7 + strength * 0.2,
  };
}

function calculateVolatilityMetrics(priceHistory: any[]) {
  if (priceHistory.length < 2) {
    return {
      overall_volatility: 0.1,
      daily_volatility: 0.02,
      max_drawdown: 0.05,
    };
  }

  const prices = priceHistory.map(item => item.price);
  const returns = [];

  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }

  const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance =
    returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) /
    (returns.length - 1);
  const stdDev = Math.sqrt(variance);

  const maxDrawdown = calculateMaxDrawdown(prices);

  return {
    overall_volatility: stdDev * Math.sqrt(252), // 骞村寲娉㈠姩?    daily_volatility: stdDev,
    max_drawdown: Math.abs(maxDrawdown),
  };
}

function identifySupportResistance(priceHistory: any[]) {
  if (priceHistory.length < 10) {
    return {
      support: [],
      resistance: [],
    };
  }

  const prices = priceHistory.map(item => item.price);
  const sortedPrices = [...prices].sort((a, b) => a - b);

  // 绠€鍗曠殑鏀寔闃诲姏浣嶈瘑?  const support = [sortedPrices[Math.floor(sortedPrices.length * 0.2)]];
  const resistance = [sortedPrices[Math.floor(sortedPrices.length * 0.8)]];

  return {
    support,
    resistance,
  };
}

// 宸ュ叿鍑芥暟
function generateMockPriceHistory(months: number) {
  const history = [];
  let basePrice = 100;

  for (let i = months; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);

    // 娣诲姞闅忔満娉㈠姩
    const fluctuation = (Math.random() - 0.5) * 20;
    basePrice = Math.max(50, basePrice + fluctuation);

    history.push({
      date: date.toISOString(),
      price: parseFloat(basePrice.toFixed(2)),
    });
  }

  return history;
}

function calculateMaxDrawdown(prices: number[]) {
  let peak = prices[0];
  let maxDrawdown = 0;

  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > peak) {
      peak = prices[i];
    } else {
      const drawdown = (peak - prices[i]) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
  }

  return maxDrawdown;
}

function generateSimpleForecast(prices: number[], periods: number) {
  const forecast = [];
  const lastPrice = prices[prices.length - 1];

  // 绠€鍗曠殑绾挎€у?  for (let i = 1; i <= periods; i++) {
    const trend =
      (prices[prices.length - 1] - prices[Math.max(0, prices.length - 5)]) / 5;
    forecast.push(parseFloat((lastPrice + trend * i).toFixed(2)));
  }

  return forecast;
}

function getStrategyMultiplier(strategy: string) {
  const multipliers: Record<string, number> = {
    immediate: 1.0,
    bulk: 1.2,
    staggered: 0.8,
    opportunistic: 1.1,
  };
  return multipliers[strategy] || 1.0;
}

function calculateSavingsProbability(
  currentPrice: number,
  historicalPrices: number[],
  strategy: string
) {
  const avgPrice =
    historicalPrices.reduce((sum, price) => sum + price, 0) /
    historicalPrices.length;
  const pricePosition =
    (currentPrice - Math.min(...historicalPrices)) /
    (Math.max(...historicalPrices) - Math.min(...historicalPrices));

  let probability = 0.5;
  if (currentPrice < avgPrice) {
    probability = 0.7 + 0.3 * (1 - pricePosition);
  } else {
    probability = 0.3 * (1 - pricePosition);
  }

  // 鏍规嵁绛栫暐璋冩暣姒傜巼
  const strategyAdjustment = strategy === 'immediate' ? 0.1 : -0.1;
  return Math.min(0.95, Math.max(0.05, probability + strategyAdjustment));
}

function createCommodityStrategy(
  commodity: string,
  currentPrices: any,
  trendAnalysis: any,
  budgetConstraints: any,
  timeline: any,
  riskPrefs: any
) {
  return {
    commodity,
    currentPrice: currentPrices.current,
    trend: trendAnalysis.trend,
    recommendedAction: trendAnalysis.trend === 'down' ? 'BUY' : 'HOLD',
    budgetAllocation: Math.min(
      budgetConstraints.maxAllocation || 100000,
      currentPrices.current * 1000
    ),
    timeline: timeline.preferred || 'flexible',
    riskLevel: riskPrefs.tolerance || 'medium',
  };
}

function optimizePortfolio(strategies: any[], budgetConstraints: any) {
  // 绠€鍖栫殑鎶曡祫缁勫悎浼樺寲
  const totalBudget = budgetConstraints.total || 1000000;
  const allocation = strategies.map(strategy => ({
    ...strategy,
    allocatedAmount: totalBudget / strategies.length,
  }));

  return {
    allocation,
    totalValue: totalBudget,
    diversificationScore: strategies.length > 3 ? 0.9 : 0.6,
  };
}

function generatePortfolioRecommendations(portfolio: any) {
  const recommendations = [
    '淇濇寔鎶曡祫缁勫悎澶氭牱?,
    `鎬绘姇璧勯噾? 楼${portfolio.totalValue.toLocaleString()}`,
    `鍒嗘暎鎶曡祫?${portfolio.allocation.length} 涓晢鍝佺被鍒玚,
  ];

  if (portfolio.diversificationScore < 0.7) {
    recommendations.push('寤鸿澧炲姞鏇村鍟嗗搧绫诲埆浠ユ彁楂樺垎鏁ｅ害');
  }

  return recommendations;
}

function performPricePrediction(
  historicalData: any[],
  horizon: number,
  algorithm: string,
  confidence: number
) {
  // 绠€鍖栫殑棰勬祴瀹炵幇
  const lastPrice = historicalData[historicalData.length - 1]?.price || 100;
  const predictions = [];

  for (let i = 1; i <= horizon; i++) {
    // 娣诲姞闅忔満娉㈠姩
    const change = (Math.random() - 0.5) * 0.02; // 卤1%鐨勬棩娉㈠姩
    predictions.push(parseFloat((lastPrice * (1 + change * i)).toFixed(2)));
  }

  return predictions;
}

function calculatePredictionIntervals(
  predictions: number[],
  confidenceLevel: number
) {
  const intervals = [];
  const margin = 1 - confidenceLevel;

  predictions.forEach(pred => {
    intervals.push({
      lower: pred * (1 - margin),
      upper: pred * (1 + margin),
    });
  });

  return intervals;
}

async function getMarketSentiment() {
  try {
    // 妯℃嫙甯傚満鎯呯华鏁版嵁
    return {
      success: true,
      sentiment: {
        overall: 'neutral',
        sectors: {
          semiconductors: 'positive',
          raw_materials: 'negative',
          electronics: 'neutral',
        },
        confidence: 0.82,
        updateTime: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('鑾峰彇甯傚満鎯呯华閿欒:', error);
    return {
      success: false,
      error: `鑾峰彇鎯呯华鏁版嵁澶辫触: ${(error as Error).message}`,
    };
  }
}

function assessModelAccuracy(historicalData: any[], predictions: number[]) {
  if (historicalData.length < predictions.length + 1) {
    return 0.7; // 榛樿鍑嗙‘?  }

  // 绠€鍗曠殑鍑嗙‘鐜囪?  const actualValues = historicalData
    .slice(-predictions.length)
    .map(item => item.price);
  const differences = actualValues.map(
    (actual, i) => Math.abs(actual - predictions[i]) / actual
  );
  const avgDifference =
    differences.reduce((sum, diff) => sum + diff, 0) / differences.length;

  return Math.max(0.5, 1 - avgDifference);
}

