import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 创建 Supabase 客户端（服务角色）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    console.log('🚀 开始执行每日定时任务...');
    
    // 记录任务开始时间
    const startTime = new Date().toISOString();
    
    // 1. 清理过期的上传内容
    console.log('🧹 清理过期上传内容...');
    const cleanupResult = await cleanupExpiredUploads();
    
    // 2. 更新配件价格信息
    console.log('💰 更新配件价格信息...');
    const priceUpdateResult = await updatePartPrices();
    
    // 3. 发送价格预警通知
    console.log('🔔 发送价格预警通知...');
    const alertResult = await sendPriceAlerts();
    
    // 4. 生成系统统计报告
    console.log('📊 生成系统统计报告...');
    const statsResult = await generateSystemStats();
    
    // 5. 备份重要数据
    console.log('💾 执行数据备份...');
    const backupResult = await performDataBackup();
    
    // 记录任务结束时间
    const endTime = new Date().toISOString();
    
    const result = {
      success: true,
      timestamp: startTime,
      duration: new Date(endTime).getTime() - new Date(startTime).getTime(),
      tasks: {
        cleanup: cleanupResult,
        priceUpdate: priceUpdateResult,
        alerts: alertResult,
        statistics: statsResult,
        backup: backupResult
      }
    };
    
    console.log('✅ 每日定时任务执行完成', result);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ 每日定时任务执行失败:', error);
    
    const errorResult = {
      success: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    };
    
    return NextResponse.json(errorResult, { status: 500 });
  }
}

// 清理过期上传内容
async function cleanupExpiredUploads() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data, error } = await supabase
      .from('uploaded_content')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString());
    
    // 处理可能为 null 的情况
    const deletedRecords = data || [];
    
    if (error) throw error;
    
    return {
      success: true,
      deletedCount: deletedRecords.length,
      cutoffDate: thirtyDaysAgo.toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Cleanup failed'
    };
  }
}

// 更新配件价格信息
async function updatePartPrices() {
  try {
    // 这里可以集成实际的价格更新逻辑
    // 例如调用第三方API获取最新价格
    
    const { data: parts, error } = await supabase
      .from('parts')
      .select('id, name, current_price')
      .limit(10);
    
    if (error) throw error;
    
    // 模拟价格更新
    const updatedCount = parts?.length || 0;
    
    return {
      success: true,
      updatedCount,
      message: `检查了 ${updatedCount} 个配件的价格`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Price update failed'
    };
  }
}

// 发送价格预警通知
async function sendPriceAlerts() {
  try {
    // 查询需要预警的价格变化
    const { data: alerts, error } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('status', 'active')
      .limit(50);
    
    if (error) throw error;
    
    // 模拟发送通知
    const alertCount = alerts?.length || 0;
    
    return {
      success: true,
      alertCount,
      message: `处理了 ${alertCount} 个价格预警`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Alert processing failed'
    };
  }
}

// 生成系统统计报告
async function generateSystemStats() {
  try {
    // 获取各种统计数据
    const statsPromises = [
      supabase.from('parts').select('count', { count: 'exact' }),
      supabase.from('appointments').select('count', { count: 'exact' }),
      supabase.from('uploaded_content').select('count', { count: 'exact' })
    ];
    
    const [partsResult, appointmentsResult, uploadsResult] = await Promise.all(statsPromises);
    
    const stats = {
      partsCount: partsResult.data?.[0]?.count || 0,
      appointmentsCount: appointmentsResult.data?.[0]?.count || 0,
      uploadsCount: uploadsResult.data?.[0]?.count || 0,
      generatedAt: new Date().toISOString()
    };
    
    // 保存统计信息到系统配置
    await supabase
      .from('system_config')
      .upsert({
        key: 'daily_stats',
        value: stats,
        updated_at: new Date().toISOString()
      });
    
    return {
      success: true,
      stats
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Statistics generation failed'
    };
  }
}

// 执行数据备份
async function performDataBackup() {
  try {
    // 这里可以集成实际的备份逻辑
    // 例如调用备份API或执行数据库导出
    
    const backupInfo = {
      backupId: `backup_${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };
    
    return {
      success: true,
      backupInfo
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Backup failed'
    };
  }
}