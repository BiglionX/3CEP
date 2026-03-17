import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * 获取批次扫描统计数据
 * GET /api/enterprise/traceability/statistics/:batchId
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { batchId: string } }
) {
  try {
    const { batchId } = params;

    // 获取批次基本信息
    const { data: batch, error: batchError } = await supabase
      .from('enterprise_qr_batches')
      .select('*')
      .eq('batch_id', batchId)
      .single();

    if (batchError) {
      throw batchError;
    }

    // 获取扫描统计
    const { data: stats, error: statsError } = await supabase
      .from('enterprise_qr_scan_statistics')
      .select('*')
      .eq('batch_id', batchId);

    if (statsError) {
      throw statsError;
    }

    // 获取扫描日志（最近7天）
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: scanLogs, error: logsError } = await supabase
      .from('enterprise_qr_scan_logs')
      .select('region, city, scanned_at')
      .eq('batch_id', batchId)
      .gte('scanned_at', sevenDaysAgo.toISOString())
      .order('scanned_at', { ascending: false });

    if (logsError && logsError.code !== 'PGRST116') {
      throw logsError;
    }

    // 聚合统计数据
    const totalScans =
      stats?.reduce((sum: number, s: any) => sum + s.scan_count, 0) || 0;
    const uniqueScans =
      stats?.reduce((sum: number, s: any) => sum + s.unique_scans, 0) || 0;
    const scannedCodes =
      stats?.filter((s: any) => s.scan_count > 0).length || 0;

    // 区域统计
    const regionMap = new Map<string, number>();
    scanLogs?.forEach((log: any) => {
      const region = log.region || '未知';
      regionMap.set(region, (regionMap.get(region) || 0) + 1);
    });

    const regions = Array.from(regionMap.entries())
      .map(([region, count]) => ({
        region,
        count,
        percentage:
          totalScans > 0 ? ((count / totalScans) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // 每日统计
    const dailyStats = new Map<string, number>();
    scanLogs?.forEach((log: any) => {
      const date = new Date(log.scanned_at).toISOString().split('T')[0];
      dailyStats.set(date, (dailyStats.get(date) || 0) + 1);
    });

    const dailyData = Array.from(dailyStats.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 峰值扫描时间
    const peakHourMap = new Map<number, number>();
    scanLogs?.forEach((log: any) => {
      const hour = new Date(log.scanned_at).getHours();
      peakHourMap.set(hour, (peakHourMap.get(hour) || 0) + 1);
    });

    const peakHour = Array.from(peakHourMap.entries())
      .sort((a, b) => b[1] - a[1])
      .shift();

    // 售后关联统计
    const { data: ticketStats } = await supabase
      .from('after_sales_tickets')
      .select('status, count')
      .in('qr_code_id', stats?.map((s: any) => s.qr_code_id) || []);

    const ticketCount = ticketStats?.length || 0;

    return NextResponse.json({
      success: true,
      data: {
        batch: {
          batch_id: batch.batch_id,
          internal_code: batch.internal_code,
          product_name: batch.product_name,
          product_model: batch.product_model,
          quantity: batch.quantity,
          generated_count: batch.generated_count,
          status: batch.status,
          created_at: batch.created_at,
          completed_at: batch.completed_at,
        },
        overview: {
          total_scans: totalScans,
          unique_scans: uniqueScans,
          scanned_codes: scannedCodes,
          unscanned_codes: (batch.generated_count || 0) - scannedCodes,
          scan_rate:
            batch.generated_count > 0
              ? ((scannedCodes / batch.generated_count) * 100).toFixed(1)
              : '0.0',
          tickets_created: ticketCount,
        },
        regions: regions.slice(0, 10), // 返回前10个地区
        daily_stats: dailyData,
        peak_hour: peakHour ? { hour: peakHour[0], scans: peakHour[1] } : null,
        recent_scans: scanLogs?.slice(0, 20) || [], // 最近20条扫描记录
      },
    });
  } catch (error) {
    console.error('获取溯源统计失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || '服务器内部错误',
      },
      { status: 500 }
    );
  }
}
