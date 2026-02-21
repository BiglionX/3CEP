import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/admin/valuation/stats
 * 获取估值统计信息
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 默认最近7天
    
    // 计算日期范围
    const endDate = new Date();
    let startDate: Date;
    
    switch (period) {
      case '24h':
        startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    // 获取总体统计
    const { data: totalStats, error: totalError } = await supabase
      .from('valuation_logs')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());
    
    if (totalError) {
      throw totalError;
    }
    
    // 计算基础统计
    const totalCount = totalStats?.length || 0;
    const avgValue = totalCount > 0 
      ? totalStats!.reduce((sum, log) => sum + (log.final_value || 0), 0) / totalCount 
      : 0;
    const avgConfidence = totalCount > 0 
      ? totalStats!.reduce((sum, log) => sum + (log.confidence_score || 0), 0) / totalCount 
      : 0;
    
    // 方法分布统计
    const methodDistribution: Record<string, { count: number; percentage: number }> = {};
    const methods = ['ml', 'market', 'rule', 'hybrid', 'fused'];
    
    methods.forEach(method => {
      const count = totalStats?.filter(log => log.valuation_method === method).length || 0;
      methodDistribution[method] = {
        count,
        percentage: totalCount > 0 ? (count / totalCount) * 100 : 0
      };
    });
    
    // 置信度分布
    const confidenceDistribution = {
      high: totalStats?.filter(log => log.confidence_score >= 0.8).length || 0,
      medium: totalStats?.filter(log => 
        log.confidence_score >= 0.5 && log.confidence_score < 0.8
      ).length || 0,
      low: totalStats?.filter(log => log.confidence_score < 0.5).length || 0
    };
    
    // 按日期统计趋势
    const dailyStats: any[] = [];
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    
    for (let i = 0; i <= daysDiff; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + 1);
      
      const dayLogs = totalStats?.filter(log => 
        new Date(log.created_at) >= currentDate && new Date(log.created_at) < nextDate
      ) || [];
      
      const dayCount = dayLogs.length;
      const dayAvgValue = dayCount > 0 
        ? dayLogs.reduce((sum, log) => sum + (log.final_value || 0), 0) / dayCount 
        : 0;
      const dayAvgConfidence = dayCount > 0 
        ? dayLogs.reduce((sum, log) => sum + (log.confidence_score || 0), 0) / dayCount 
        : 0;
      
      dailyStats.push({
        date: currentDate.toISOString().split('T')[0],
        count: dayCount,
        avgValue: parseFloat(dayAvgValue.toFixed(2)),
        avgConfidence: parseFloat(dayAvgConfidence.toFixed(4))
      });
    }
    
    // 性能统计
    const processingTimes = totalStats?.map(log => log.processing_time_ms || 0) || [];
    const avgProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length 
      : 0;
    
    // 来源分布
    const sourceDistribution: Record<string, number> = {};
    totalStats?.forEach(log => {
      const source = log.request_source || 'unknown';
      sourceDistribution[source] = (sourceDistribution[source] || 0) + 1;
    });
    
    return NextResponse.json({
      success: true,
      data: {
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days: daysDiff + 1
        },
        overview: {
          totalRequests: totalCount,
          avgValue: parseFloat(avgValue.toFixed(2)),
          avgConfidence: parseFloat(avgConfidence.toFixed(4)),
          avgProcessingTime: parseFloat(avgProcessingTime.toFixed(2))
        },
        methodDistribution,
        confidenceDistribution,
        sourceDistribution,
        dailyTrend: dailyStats.reverse(), // 最新日期在前
        lastUpdated: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('获取估值统计失败:', error);
    return NextResponse.json(
      { success: false, error: '获取估值统计失败' },
      { status: 500 }
    );
  }
}