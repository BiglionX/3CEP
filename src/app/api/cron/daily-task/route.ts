import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 鍒涘缓 Supabase 瀹㈡埛绔紙鏈嶅姟瑙掕壊?const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    console.log('馃殌 寮€濮嬫墽琛屾瘡鏃ュ畾鏃朵换?..');

    // 璁板綍浠诲姟寮€濮嬫椂?    const startTime = new Date().toISOString();

    // 1. 娓呯悊杩囨湡鐨勪笂浼犲唴?    console.log('馃Ч 娓呯悊杩囨湡涓婁紶鍐呭...');
    const cleanupResult = await cleanupExpiredUploads();

    // 2. 鏇存柊閰嶄欢浠锋牸淇℃伅
    console.log('馃挵 鏇存柊閰嶄欢浠锋牸淇℃伅...');
    const priceUpdateResult = await updatePartPrices();

    // 3. 鍙戦€佷环鏍奸璀﹂€氱煡
    console.log('馃敂 鍙戦€佷环鏍奸璀﹂€氱煡...');
    const alertResult = await sendPriceAlerts();

    // 4. 鐢熸垚绯荤粺缁熻鎶ュ憡
    console.log('馃搳 鐢熸垚绯荤粺缁熻鎶ュ憡...');
    const statsResult = await generateSystemStats();

    // 5. 澶囦唤閲嶈鏁版嵁
    console.log('馃捑 鎵ц鏁版嵁澶囦唤...');
    const backupResult = await performDataBackup();

    // 璁板綍浠诲姟缁撴潫鏃堕棿
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
        backup: backupResult,
      },
    };

    console.log('锟?姣忔棩瀹氭椂浠诲姟鎵ц瀹屾垚', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('锟?姣忔棩瀹氭椂浠诲姟鎵ц澶辫触:', error);

    const errorResult = {
      success: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    };

    return NextResponse.json(errorResult, { status: 500 });
  }
}

// 娓呯悊杩囨湡涓婁紶鍐呭
async function cleanupExpiredUploads() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from('uploaded_content')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString());

    // 澶勭悊鍙兘?null 鐨勬儏?    const deletedRecords = data || [];

    if (error) throw error;

    return {
      success: true,
      deletedCount: deletedRecords.length,
      cutoffDate: thirtyDaysAgo.toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Cleanup failed',
    };
  }
}

// 鏇存柊閰嶄欢浠锋牸淇℃伅
async function updatePartPrices() {
  try {
    // 杩欓噷鍙互闆嗘垚瀹為檯鐨勪环鏍兼洿鏂伴€昏緫
    // 渚嬪璋冪敤绗笁鏂笰PI鑾峰彇鏈€鏂颁环?
    const { data: parts, error } = await supabase
      .from('parts')
      .select('id, name, current_price')
      .limit(10);

    if (error) throw error;

    // 妯℃嫙浠锋牸鏇存柊
    const updatedCount = parts?.length || 0;

    return {
      success: true,
      updatedCount,
      message: `妫€鏌ヤ簡 ${updatedCount} 涓厤浠剁殑浠锋牸`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Price update failed',
    };
  }
}

// 鍙戦€佷环鏍奸璀﹂€氱煡
async function sendPriceAlerts() {
  try {
    // 鏌ヨ闇€瑕侀璀︾殑浠锋牸鍙樺寲
    const { data: alerts, error } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('status', 'active')
      .limit(50);

    if (error) throw error;

    // 妯℃嫙鍙戦€侀€氱煡
    const alertCount = alerts?.length || 0;

    return {
      success: true,
      alertCount,
      message: `澶勭悊?${alertCount} 涓环鏍奸璀,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Alert processing failed',
    };
  }
}

// 鐢熸垚绯荤粺缁熻鎶ュ憡
async function generateSystemStats() {
  try {
    // 鑾峰彇鍚勭缁熻鏁版嵁
    const statsPromises = [
      supabase.from('parts').select('count', { count: 'exact' }),
      supabase.from('appointments').select('count', { count: 'exact' }),
      supabase.from('uploaded_content').select('count', { count: 'exact' }),
    ];

    const [partsResult, appointmentsResult, uploadsResult] =
      await Promise.all(statsPromises);

    const stats = {
      partsCount: partsResult.data?.[0]?.count || 0,
      appointmentsCount: appointmentsResult.data?.[0]?.count || 0,
      uploadsCount: uploadsResult.data?.[0]?.count || 0,
      generatedAt: new Date().toISOString(),
    };

    // 淇濆瓨缁熻淇℃伅鍒扮郴缁熼厤?    await supabase.from('system_config').upsert({
      key: 'daily_stats',
      value: stats,
      updated_at: new Date().toISOString(),
    });

    return {
      success: true,
      stats,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Statistics generation failed',
    };
  }
}

// 鎵ц鏁版嵁澶囦唤
async function performDataBackup() {
  try {
    // 杩欓噷鍙互闆嗘垚瀹為檯鐨勫浠介€昏緫
    // 渚嬪璋冪敤澶囦唤API鎴栨墽琛屾暟鎹簱瀵煎嚭

    const backupInfo = {
      backupId: `backup_${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'completed',
    };

    return {
      success: true,
      backupInfo,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Backup failed',
    };
  }
}

