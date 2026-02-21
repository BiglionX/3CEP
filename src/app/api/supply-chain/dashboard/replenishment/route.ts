/**
 * 补货建议看板API
 * 提供补货建议的汇总视图、统计分析和实时监控
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
    dailySuggestions: Array<{date: string; count: number}>;
    valueTrends: Array<{date: string; value: number}>;
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
    const timeRange = searchParams.get('timeRange') || '7d'; // 7天, 30天, 90天
    const urgencyFilter = searchParams.get('urgency') || 'all'; // all, immediate, soon, planned

    // 构建补货建议请求
    const replenishmentRequest: ReplenishmentRequest = {
      warehouseId: warehouseId || 'default-warehouse',
      forecastHorizonDays: timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90,
      serviceLevelTarget: 0.95
    };

    const recommendationService = new RecommendationService();
    
    // 获取补货建议数据
    const suggestions = await recommendationService.getReplenishmentSuggestions(replenishmentRequest);
    
    // 过滤紧急程度
    let filteredSuggestions = suggestions;
    if (urgencyFilter !== 'all') {
      filteredSuggestions = suggestions.filter(s => s.urgency === urgencyFilter);
    }

    // 计算统计数据
    const stats = calculateDashboardStats(filteredSuggestions);
    
    // 获取趋势数据
    const trends = await getTrendData(warehouseId, timeRange);
    
    // 生成预警信息
    const alerts = generateAlerts(filteredSuggestions);

    const dashboardData: ReplenishmentDashboardData = {
      suggestions: filteredSuggestions,
      stats,
      trends,
      alerts
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('补货建议看板API错误:', error);
    return NextResponse.json(
      { 
        error: '获取补货建议看板数据失败',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

/**
 * 计算看板统计数据
 */
function calculateDashboardStats(suggestions: any[]): DashboardStats {
  const totalSuggestions = suggestions.length;
  const urgentCount = suggestions.filter(s => s.urgency === 'immediate').length;
  const soonCount = suggestions.filter(s => s.urgency === 'soon').length;
  const plannedCount = suggestions.filter(s => s.urgency === 'planned').length;
  
  const totalValue = suggestions.reduce((sum, s) => sum + (s.suggestedOrderQuantity * 100), 0); // 假设平均单价100
  const avgOrderQuantity = totalSuggestions > 0 ? 
    suggestions.reduce((sum, s) => sum + s.suggestedOrderQuantity, 0) / totalSuggestions : 0;
  
  const criticalItems = suggestions.filter(s => s.currentStock <= s.safetyStock * 0.5).length;
  
  // 仓库分布统计
  const warehouseDistribution: Record<string, number> = {};
  suggestions.forEach(s => {
    warehouseDistribution[s.warehouseId] = (warehouseDistribution[s.warehouseId] || 0) + 1;
  });
  
  // 类别分布统计（需要从产品信息获取类别）
  const categoryDistribution: Record<string, number> = {
    '电子产品': Math.floor(totalSuggestions * 0.4),
    '机械零件': Math.floor(totalSuggestions * 0.3),
    '消耗品': Math.floor(totalSuggestions * 0.2),
    '其他': Math.floor(totalSuggestions * 0.1)
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
    categoryDistribution
  };
}

/**
 * 获取趋势数据
 */
async function getTrendData(warehouseId: string | undefined, timeRange: string) {
  // 模拟趋势数据
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  
  const dailySuggestions = [];
  const valueTrends = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateString = date.toISOString().split('T')[0];
    
    // 模拟每日建议数量（逐渐增加趋势）
    const baseCount = 5 + Math.floor(Math.random() * 10);
    const trendFactor = 1 + (days - i) * 0.02;
    const count = Math.floor(baseCount * trendFactor);
    
    dailySuggestions.push({
      date: dateString,
      count
    });
    
    // 模拟价值趋势
    valueTrends.push({
      date: dateString,
      value: count * (80 + Math.random() * 40) // 随机单价80-120
    });
  }

  return { dailySuggestions, valueTrends };
}

/**
 * 生成预警信息
 */
function generateAlerts(suggestions: any[]) {
  const alerts = [];

  // 关键库存预警
  const criticalStockItems = suggestions.filter(s => s.currentStock <= s.safetyStock * 0.3);
  criticalStockItems.forEach(item => {
    alerts.push({
      type: 'critical_stock' as const,
      message: `${item.productName}库存严重不足，当前库存${item.currentStock}，安全库存${item.safetyStock}`,
      severity: 'high' as const,
      productId: item.productId,
      warehouseId: item.warehouseId
    });
  });

  // 紧急补货预警
  const urgentItems = suggestions.filter(s => s.urgency === 'immediate');
  urgentItems.forEach(item => {
    alerts.push({
      type: 'urgent_replenishment' as const,
      message: `${item.productName}需要立即补货，建议订购${item.suggestedOrderQuantity}件`,
      severity: 'high' as const,
      productId: item.productId,
      warehouseId: item.warehouseId
    });
  });

  // 供应商延迟预警（模拟）
  if (suggestions.length > 0 && Math.random() > 0.7) {
    const randomItem = suggestions[Math.floor(Math.random() * suggestions.length)];
    alerts.push({
      type: 'supplier_delay' as const,
      message: `供应商对${randomItem.productName}的交货可能延迟，请提前准备`,
      severity: 'medium' as const,
      productId: randomItem.productId,
      warehouseId: randomItem.warehouseId
    });
  }

  return alerts;
}