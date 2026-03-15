import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 鍒涘缓 Supabase 瀹㈡埛绔紙鏈嶅姟瑙掕壊const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    console.log('寮€濮嬫墽琛屾瘡灏忔椂瀹氭椂诲姟...');

    const startTime = new Date().toISOString();

    // 1. 妫€鏌ョ郴缁熷仴搴风姸    console.log('馃彞 妫€鏌ョ郴缁熷仴搴风姸..');
    const healthCheckResult = await performHealthCheck();

    // 2. 澶勭悊寰呭鐞嗙殑棰勭害鎻愰啋
    console.log('馃敂 澶勭悊棰勭害鎻愰啋...');
    const reminderResult = await processAppointmentReminders();

    // 3. 娓呯悊涓存椂鏁版嵁
    console.log('馃棏娓呯悊涓存椂鏁版嵁...');
    const cleanupResult = await cleanupTemporaryData();

    // 4. 鏇存柊缂撳鏁版嵁
    console.log('鏇存柊缂撳鏁版嵁...');
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
        cache: cacheResult,
      },
    };

    console.log('姣忓皬跺畾朵换鍔℃墽琛屽畬, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('姣忓皬跺畾朵换鍔℃墽琛屽け', error);

    const errorResult = {
      success: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error  error.message : 'Unknown error',
    };

    return NextResponse.json(errorResult, { status: 500 });
  }
}

// 绯荤粺鍋ュ悍妫€async function performHealthCheck() {
  try {
    // 妫€鏌ユ暟鎹簱杩炴帴
    const { data: health, error } = await supabase
      .from('system_config')
      .select('key')
      .limit(1);

    if (error) throw error;

    // 妫€鏌ュ叧閿〃鏄惁瀛樺湪
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
          recordCount: count || 0,
        });
      } catch (err) {
        tableChecks.push({
          table,
          accessible: false,
          error: err instanceof Error  err.message : 'Unknown error',
        });
      }
    }

    return {
      success: true,
      databaseConnected: true,
      tableChecks,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error  error.message : 'Health check failed',
    };
  }
}

// 澶勭悊棰勭害鎻愰啋
async function processAppointmentReminders() {
  try {
    // 鏌ユ壘闇€瑕佸彂佹彁閱掔殑棰勭害锛堟彁灏忔椂    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);

    const { data: upcomingAppointments, error } = await supabase
      .from('appointments')
      .select('*')
      .gte('appointment_time', new Date().toISOString())
      .lte('appointment_time', oneHourFromNow.toISOString())
      .eq('reminder_sent', false);

    if (error) throw error;

    // 妯℃嫙鍙戦€佹彁    const reminderCount = upcomingAppointments.length || 0;

    // 鏍囪鎻愰啋宸插彂    if (reminderCount > 0) {
      const appointmentIds = upcomingAppointments.map(a => a.id);
      await supabase
        .from('appointments')
        .update({ reminder_sent: true } as any)
        .in('id', appointmentIds);
    }

    return {
      success: true,
      reminderCount,
      message: `澶勭悊${reminderCount} 涓绾︽彁閱抈,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error  error.message : 'Reminder processing failed',
    };
  }
}

// 娓呯悊涓存椂鏁版嵁
async function cleanupTemporaryData() {
  try {
    // 娓呯悊杩囨湡鐨勪复舵枃惰    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data, error } = await supabase
      .from('temp_files')
      .delete()
      .lt('created_at', oneDayAgo.toISOString());

    // 澶勭悊鍙兘null 鐨勬儏    const deletedRecords = data || [];

    if (error && error.code !== '42P01') {
      // 琛ㄤ笉瀛樺湪涓嶇畻閿欒
      throw error;
    }

    return {
      success: true,
      deletedCount: deletedRecords.length,
      cutoffDate: oneDayAgo.toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
           error.message
          : 'Temporary data cleanup failed',
    };
  }
}

// 鏇存柊缂撳鏁版嵁
async function updateCacheData() {
  try {
    // 鏇存柊鐑棬閰嶄欢缂撳
    const { data: popularParts, error } = await supabase
      .from('parts')
      .select('*')
      .order('view_count', { ascending: false })
      .limit(20);

    if (error) throw error;

    // 缂撳鍒扮郴缁熼厤缃腑
    await supabase.from('system_config').upsert({
      key: 'popular_parts_cache',
      value: popularParts,
      updated_at: new Date().toISOString(),
    });

    return {
      success: true,
      cachedItems: popularParts.length || 0,
      message: '鐑棬閰嶄欢缂撳宸叉洿,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error  error.message : 'Cache update failed',
    };
  }
}

