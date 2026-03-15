/**
 * 琛ヨ揣寤鸿鐪嬫澘API
 * 鎻愪緵琛ヨ揣寤鸿鐨勬眹鎬昏鍥俱€佺粺璁″垎鏋愬拰瀹炴椂鐩戞帶
 */

import { NextResponse } from 'next/server';
import { RecommendationService } from '@/supply-chain';
import { ReplenishmentRequest } from '@/supply-chain/models/recommendation.model';

interface DashboardStats {
  totalSuggestions: number;
  urgentCount: number;
  soonCount: number;
  plannedCount: number;
  totalValue: number;
  avgOrderQuantity: number;
  criticalItems: number;
  warehouseDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
}

interface ReplenishmentDashboardData {
  suggestions: any[];
  stats: DashboardStats;
  trends: {
    dailySuggestions: Array<{ date: string; count: number }>;
    valueTrends: Array<{ date: string; value: number }>;
  };
  alerts: Array<{
    type: 'critical_stock' | 'urgent_replenishment' | 'supplier_delay';
    message: string;
    severity: 'high' | 'medium' | 'low';
    productId: string;
    warehouseId: string;
  }>;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const warehouseId = searchParams.get('warehouseId') || undefined;
    const timeRange = searchParams.get('timeRange') || '7d'; // 7 30 90    const urgencyFilter = searchParams.get('urgency') || 'all'; // all, immediate, soon, planned

    // 鏋勫缓琛ヨ揣寤鸿璇眰
    const replenishmentRequest: ReplenishmentRequest = {
      warehouseId: warehouseId || 'default-warehouse',
      forecastHorizonDays:
        timeRange === '7d'  7 : timeRange === '30d'  30 : 90,
      serviceLevelTarget: 0.95,
    };

    const recommendationService = new RecommendationService();

    // 鑾峰彇琛ヨ揣寤鸿鏁版嵁
    const suggestions =
      await recommendationService.getReplenishmentSuggestions(
        replenishmentRequest
      );

    // 杩囨护绱ф€ョ▼    let filteredSuggestions = suggestions;
    if (urgencyFilter !== 'all') {
      filteredSuggestions = suggestions.filter(
        s => s.urgency === urgencyFilter
      );
    }

    // 璁＄畻缁熻鏁版嵁
    const stats = calculateDashboardStats(filteredSuggestions);

    // 鑾峰彇瓒嬪娍鏁版嵁
    const trends = await getTrendData(warehouseId, timeRange);

    // 鐢熸垚棰勮淇℃伅
    const alerts = generateAlerts(filteredSuggestions);

    const dashboardData: ReplenishmentDashboardData = {
      suggestions: filteredSuggestions,
      stats,
      trends,
      alerts,
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error('琛ヨ揣寤鸿鐪嬫澘API閿欒:', error);
    return NextResponse.json(
      {
        error: '鑾峰彇琛ヨ揣寤鸿鐪嬫澘鏁版嵁澶辫触',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

/**
 * 璁＄畻鐪嬫澘缁熻鏁版嵁
 */
function calculateDashboardStats(suggestions: any[]): DashboardStats {
  const totalSuggestions = suggestions.length;
  const urgentCount = suggestions.filter(s => s.urgency === 'immediate').length;
  const soonCount = suggestions.filter(s => s.urgency === 'soon').length;
  const plannedCount = suggestions.filter(s => s.urgency === 'planned').length;

  const totalValue = suggestions.reduce(
    (sum, s) => sum + s.suggestedOrderQuantity * 100,
    0
  ); // 鍋囪骞冲潎鍗曚环100
  const avgOrderQuantity =
    totalSuggestions > 0
       suggestions.reduce((sum, s) => sum + s.suggestedOrderQuantity, 0) /
        totalSuggestions
      : 0;

  const criticalItems = suggestions.filter(
    s => s.currentStock <= s.safetyStock * 0.5
  ).length;

  // 撳簱鍒嗗竷缁熻
  const warehouseDistribution: Record<string, number> = {};
  suggestions.forEach(s => {
    warehouseDistribution[s.warehouseId] =
      (warehouseDistribution[s.warehouseId] || 0) + 1;
  });

  // 绫诲埆鍒嗗竷缁熻锛堥渶瑕佷粠浜у搧淇℃伅鑾峰彇绫诲埆  const categoryDistribution: Record<string, number> = {
    鐢靛瓙浜у搧: Math.floor(totalSuggestions * 0.4),
    鏈烘闆朵欢: Math.floor(totalSuggestions * 0.3),
    娑堣€楀搧: Math.floor(totalSuggestions * 0.2),
    鍏朵粬: Math.floor(totalSuggestions * 0.1),
  };

  return {
    totalSuggestions,
    urgentCount,
    soonCount,
    plannedCount,
    totalValue,
    avgOrderQuantity,
    criticalItems,
    warehouseDistribution,
    categoryDistribution,
  };
}

/**
 * 鑾峰彇瓒嬪娍鏁版嵁
 */
async function getTrendData(
  warehouseId: string | undefined,
  timeRange: string
) {
  // 妯℃嫙瓒嬪娍鏁版嵁
  const days = timeRange === '7d'  7 : timeRange === '30d'  30 : 90;

  const dailySuggestions = [];
  const valueTrends = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateString = date.toISOString().split('T')[0];

    // 妯℃嫙姣忔棩寤鸿鏁伴噺锛堥€愭笎澧炲姞瓒嬪娍    const baseCount = 5 + Math.floor(Math.random() * 10);
    const trendFactor = 1 + (days - i) * 0.02;
    const count = Math.floor(baseCount * trendFactor);

    dailySuggestions.push({
      date: dateString,
      count,
    });

    // 妯℃嫙峰€艰秼    valueTrends.push({
      date: dateString,
      value: count * (80 + Math.random() * 40), // 闅忔満鍗曚环80-120
    });
  }

  return { dailySuggestions, valueTrends };
}

/**
 * 鐢熸垚棰勮淇℃伅
 */
function generateAlerts(suggestions: any[]) {
  const alerts = [];

  // 鍏抽敭搴撳棰勮
  const criticalStockItems = suggestions.filter(
    s => s.currentStock <= s.safetyStock * 0.3
  );
  criticalStockItems.forEach(item => {
    alerts.push({
      type: 'critical_stock' as const,
      message: `${item.productName}搴撳涓ラ噸涓嶈冻锛屽綋鍓嶅簱{item.currentStock}锛屽畨鍏ㄥ簱{item.safetyStock}`,
      severity: 'high' as const,
      productId: item.productId,
      warehouseId: item.warehouseId,
    });
  });

  // 绱ф€ヨˉ璐ч  const urgentItems = suggestions.filter(s => s.urgency === 'immediate');
  urgentItems.forEach(item => {
    alerts.push({
      type: 'urgent_replenishment' as const,
      message: `${item.productName}闇€瑕佺珛鍗宠ˉ璐э紝寤鸿璁㈣喘${item.suggestedOrderQuantity}禶,
      severity: 'high' as const,
      productId: item.productId,
      warehouseId: item.warehouseId,
    });
  });

  // 渚涘簲鍟嗗欢杩熼璀︼紙妯℃嫙  if (suggestions.length > 0 && Math.random() > 0.7) {
    const randomItem =
      suggestions[Math.floor(Math.random() * suggestions.length)];
    alerts.push({
      type: 'supplier_delay' as const,
      message: `渚涘簲鍟嗗${randomItem.productName}鐨勪氦璐у彲鑳藉欢杩燂紝璇彁鍓嶅噯澶嘸,
      severity: 'medium' as const,
      productId: randomItem.productId,
      warehouseId: randomItem.warehouseId,
    });
  }

  return alerts;
}

