import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 创建 Supabase 客户端（服务角色）
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    console.log('⏰ 开始执行每小时定时任务...');
    
    const startTime = new Date().toISOString();
    
    // 1. 检查系统健康状态
    console.log('🏥 检查系统健康状态...');
    const healthCheckResult = await performHealthCheck();
    
    // 2. 处理待处理的预约提醒
    console.log('🔔 处理预约提醒...');
    const reminderResult = await processAppointmentReminders();
    
    // 3. 清理临时数据
    console.log('🗑️ 清理临时数据...');
    const cleanupResult = await cleanupTemporaryData();
    
    // 4. 更新缓存数据
    console.log('⚡ 更新缓存数据...');
    const cacheResult = await updateCacheData();
    
    const endTime = new Date().toISOString();
    
    const result = {
      success: true,
      timestamp: startTime,
      duration: new Date(endTime).getTime() - new Date(startTime).getTime(),
      tasks: {
        healthCheck: healthCheckResult,
        reminders: reminderResult,
        cleanup: cleanupResult,
        cache: cacheResult
      }
    };
    
    console.log('✅ 每小时定时任务执行完成', result);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ 每小时定时任务执行失败:', error);
    
    const errorResult = {
      success: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    return NextResponse.json(errorResult, { status: 500 });
  }
}

// 系统健康检查
async function performHealthCheck() {
  try {
    // 检查数据库连接
    const { data: health, error } = await supabase
      .from('system_config')
      .select('key')
      .limit(1);
    
    if (error) throw error;
    
    // 检查关键表是否存在
    const tables = ['parts', 'appointments', 'uploaded_content'];
    const tableChecks = [];
    
    for (const table of tables) {
      try {
        const { count, error: countError } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        tableChecks.push({
          table,
          accessible: !countError,
          recordCount: count || 0
        });
      } catch (err) {
        tableChecks.push({
          table,
          accessible: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }
    
    return {
      success: true,
      databaseConnected: true,
      tableChecks
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Health check failed'
    };
  }
}

// 处理预约提醒
async function processAppointmentReminders() {
  try {
    // 查找需要发送提醒的预约（提前1小时）
    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
    
    const { data: upcomingAppointments, error } = await supabase
      .from('appointments')
      .select('*')
      .gte('appointment_time', new Date().toISOString())
      .lte('appointment_time', oneHourFromNow.toISOString())
      .eq('reminder_sent', false);
    
    if (error) throw error;
    
    // 模拟发送提醒
    const reminderCount = upcomingAppointments?.length || 0;
    
    // 标记提醒已发送
    if (reminderCount > 0) {
      const appointmentIds = upcomingAppointments.map(a => a.id);
      await supabase
        .from('appointments')
        .update({ reminder_sent: true })
        .in('id', appointmentIds);
    }
    
    return {
      success: true,
      reminderCount,
      message: `处理了 ${reminderCount} 个预约提醒`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Reminder processing failed'
    };
  }
}

// 清理临时数据
async function cleanupTemporaryData() {
  try {
    // 清理过期的临时文件记录
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const { data, error } = await supabase
      .from('temp_files')
      .delete()
      .lt('created_at', oneDayAgo.toISOString());
    
    // 处理可能为 null 的情况
    const deletedRecords = data || [];
    
    if (error && error.code !== '42P01') { // 表不存在不算错误
      throw error;
    }
    
    return {
      success: true,
      deletedCount: deletedRecords.length,
      cutoffDate: oneDayAgo.toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Temporary data cleanup failed'
    };
  }
}

// 更新缓存数据
async function updateCacheData() {
  try {
    // 更新热门配件缓存
    const { data: popularParts, error } = await supabase
      .from('parts')
      .select('*')
      .order('view_count', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    
    // 缓存到系统配置中
    await supabase
      .from('system_config')
      .upsert({
        key: 'popular_parts_cache',
        value: popularParts,
        updated_at: new Date().toISOString()
      });
    
    return {
      success: true,
      cachedItems: popularParts?.length || 0,
      message: '热门配件缓存已更新'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Cache update failed'
    };
  }
}